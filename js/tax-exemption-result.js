/* ============================================================
   非課税×生命保険(シミュレーションページ)
   - 前提条件(所得税・相続税)は入力ページが保存した内容を読み込む
   - 生命保険の設計はこのページで自由に変更でき、確定するたびに再計算する
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('txResultArea');
  if (!root || !window.bplTax) return;
  const T = window.bplTax;
  const yen = T.yen;
  const man = T.man;

  const $ = (id) => document.getElementById(id);
  const setTxt = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
  const numOf = (id) => {
    const el = $(id);
    if (!el) return NaN;
    return window.numClean ? window.numClean(el.value) : parseFloat(el.value);
  };

  /* ===== ？ツールチップ ===== */
  document.querySelectorAll('.help-tip').forEach(function (tip) {
    tip.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      const wasOpen = tip.classList.contains('open');
      document.querySelectorAll('.help-tip.open').forEach((t) => t.classList.remove('open'));
      if (!wasOpen) tip.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.help-tip.open').forEach((t) => t.classList.remove('open'));
  });

  /* ===== グループの配色 =====
     所得税グループはネイビー、相続税グループはグリーン。
     グリーンはネイビーと同じ彩度・明度のまま色相だけ変えた値(HSL 211→150) ===== */
  const NAVY = ['#0f2a4a', '#3b6ea5', '#7a9cc0', '#2d5580'];
  const GREEN = ['#0f482b', '#3ba570', '#7ac09d', '#2d8056'];

  /* ===== 数値のカウントアップ ===== */
  // 直前に表示していた値を覚えておき、そこから新しい値まで数字を回す
  const countState = {};
  const COUNT_MS = 800;
  function countUp(id, to, fmt) {
    const el = $(id);
    if (!el) return;
    const from = countState[id] === undefined ? 0 : countState[id];
    countState[id] = to;
    if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
    clearTimeout(el._countTimer);
    if (from === to) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const step = function (now) {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) el._countRaf = requestAnimationFrame(step);
      else el._countRaf = null;
    };
    el._countRaf = requestAnimationFrame(step);
    // 非表示タブなどでrequestAnimationFrameが止まると数字が出ないままになるため、
    // アニメーション時間を過ぎたら確実に最終値を表示する
    el._countTimer = setTimeout(function () {
      if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
      el.textContent = fmt(to);
    }, COUNT_MS + 250);
  }

  /* ===== 軽減額ゲージ =====
     上限を全体の幅とし、現状の金額を内訳ごとに積み上げる。
     残り(使い残している枠)は斜線で塗り、残り何%かを大きく見せる ===== */
  function drawSaveChart(svg, parts, unitFmt, maxTotal, opt) {
    const o = opt || {};
    const W = 560, BAR_X = 8, BAR_W = 544, BAR_Y = 34, BAR_H = 78;
    const used = parts.reduce((s2, p) => s2 + Math.max(0, p.value), 0);
    const cap = Math.max(maxTotal, used);
    const pid = svg.id + 'Stripe';
    let out = `<defs><pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">`
      + `<rect width="14" height="14" fill="#eef1f4"/><rect width="6" height="14" fill="#dfe5ee"/></pattern></defs>`;
    out += `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="10" fill="#eef1f4"/>`;
    if (cap <= 0) {
      out += `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 8}" font-size="20" fill="#9ca3af" text-anchor="middle">軽減額なし</text>`;
      svg.innerHTML = out;
      return;
    }
    // 帯に入れる文字の必要幅を文字数から見積もる(半角0.55em・全角1em)
    const widthOf = (label, size) => {
      let need = size * 0.8;
      for (let k = 0; k < label.length; k += 1) need += /[0-9,.\s%]/.test(label[k]) ? size * 0.55 : size;
      return need;
    };
    const usedW = (used / cap) * BAR_W;
    // 残り(使い残している枠)は斜線で示すだけにし、金額はカード上部のリード文で伝える
    const room = Math.max(0, cap - used);
    if (room > 0) {
      out += `<rect x="${(BAR_X + usedW).toFixed(1)}" y="${BAR_Y}" width="${(BAR_W - usedW).toFixed(1)}" height="${BAR_H}" rx="10" fill="url(#${pid})"/>`;
    }
    // 現状の内訳を積み上げる
    let x = BAR_X;
    parts.forEach(function (p, i) {
      const v = Math.max(0, p.value);
      if (v <= 0) return;
      const w = (v / cap) * BAR_W;
      const isFirst = x === BAR_X;
      const isLast = room <= 0 && (i === parts.length - 1 || parts.slice(i + 1).every((q) => Math.max(0, q.value) <= 0));
      const rx = (isFirst || isLast) ? 10 : 0;
      out += `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${w.toFixed(1)}" height="${BAR_H}" rx="${rx}" fill="${p.color}"/>`;
      const label = unitFmt(v);
      if (w > widthOf(label, 20)) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 1}" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle">${label}</text>`;
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 22}" font-size="14" fill="#ffffffb0" text-anchor="middle">${((v / cap) * 100).toFixed(0)}%</text>`;
      } else if (w > widthOf('00%', 15)) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 6}" font-size="15" font-weight="bold" fill="#fff" text-anchor="middle">${((v / cap) * 100).toFixed(0)}%</text>`;
      }
      x += w;
    });
    // 目盛り(0 と MAX)
    out += `<text x="${BAR_X}" y="${BAR_Y - 10}" font-size="13" fill="#9ca3af">0</text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${BAR_Y - 10}" font-size="13" fill="#9ca3af" text-anchor="end">${o.capLabel || '上限'}</text>`;
    out += `<text x="${BAR_X}" y="${BAR_Y + BAR_H + 26}"><tspan font-size="13" fill="#6b7280">現状 </tspan>`
      + `<tspan font-size="20" font-weight="bold" fill="${o.base || '#0f2a4a'}">${unitFmt(used)}</tspan></text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${BAR_Y + BAR_H + 26}" text-anchor="end"><tspan font-size="13" fill="#6b7280">MAX </tspan>`
      + `<tspan font-size="20" font-weight="bold" fill="${o.accent || '#2d5580'}">${unitFmt(cap)}</tspan></text>`;
    svg.innerHTML = out;
  }

  // 直前の内訳から新しい内訳まで、棒の伸びと数字を同じ時間で動かす
  const chartState = {};
  function renderSaveChart(svgId, parts, unitFmt, maxTotal, opt) {
    const svg = $(svgId);
    if (!svg) return;
    const next = parts.map((p) => Math.max(0, p.value)).concat([Math.max(0, maxTotal)]);
    const prev = chartState[svgId] && chartState[svgId].length === next.length
      ? chartState[svgId] : next.map(() => 0);
    chartState[svgId] = next;
    if (svg._chartRaf) { cancelAnimationFrame(svg._chartRaf); svg._chartRaf = null; }
    clearTimeout(svg._chartTimer);
    const at = (vals) => parts.map((p, i) => ({ label: p.label, color: p.color, value: vals[i] }));
    if (prev.every((v, i) => v === next[i])) { drawSaveChart(svg, at(next), unitFmt, next[next.length - 1], opt); return; }
    // requestAnimationFrameが止まる環境でも最終形は必ず描く
    svg._chartTimer = setTimeout(function () {
      if (svg._chartRaf) { cancelAnimationFrame(svg._chartRaf); svg._chartRaf = null; }
      drawSaveChart(svg, at(next), unitFmt, next[next.length - 1], opt);
    }, COUNT_MS + 250);
    const start = performance.now();
    const step = function (now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - t, 3); // ease-out
      const cur = next.map((v, i) => prev[i] + (v - prev[i]) * e);
      drawSaveChart(svg, at(cur), unitFmt, cur[cur.length - 1], opt);
      if (t < 1) svg._chartRaf = requestAnimationFrame(step);
      else svg._chartRaf = null;
    };
    svg._chartRaf = requestAnimationFrame(step);
  }

  /* ===== 前提条件の読み込み ===== */
  const data = T.loadInputs();
  if (!data) {
    root.classList.add('hidden');
    const noData = $('txNoDataArea');
    if (noData) noData.classList.remove('hidden');
    return;
  }

  /* ===== 生命保険の設計(このページで変更できる項目) ===== */
  const PLAN_IDS = [
    'txGeneralPremium', 'txPensionPremium', 'txMedicalPremium',
    'txDeathBenefit', 'txRetirementBenefit',
    'txSalaryMonthly', 'txDeathCause',
  ];
  // 保存済みの設計内容を入力欄に戻す
  PLAN_IDS.forEach(function (id) {
    const el = $(id);
    if (el && data[id] !== undefined && data[id] !== null) el.value = data[id];
  });

  const planError = $('txPlanErrorArea');
  const clearPlanError = () => {
    if (planError) { planError.classList.add('hidden'); planError.textContent = ''; }
    PLAN_IDS.forEach(function (id) { const el = $(id); if (el) el.classList.remove('input-error'); });
  };
  const showPlanError = (msg, el) => {
    if (planError) { planError.textContent = msg; planError.classList.remove('hidden'); }
    if (el) {
      el.classList.add('input-error');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
  };

  const MAX_YEN = 99999999;   // 保険料(円)の上限
  const MAX_MAN = 99999999;   // 金額(万円)の上限

  function validatePlan() {
    clearPlanError();
    for (const it of T.PREMIUM_ITEMS) {
      const v = numOf(it.id);
      if (isNaN(v) || v < 0) { showPlanError(it.label + 'を入力してください。', $(it.id)); return false; }
      if (v > MAX_YEN) { showPlanError('保険料は ' + T.fmt(MAX_YEN) + ' 円以内で入力してください。', $(it.id)); return false; }
    }
    for (const id of ['txDeathBenefit', 'txRetirementBenefit', 'txSalaryMonthly']) {
      const v = numOf(id);
      if (isNaN(v) || v < 0) { showPlanError('生命保険の設計の各項目を入力してください。', $(id)); return false; }
      if (v > MAX_MAN) { showPlanError('入力値が大きすぎます。数値をご確認ください。', $(id)); return false; }
    }
    return true;
  }

  function collectPlan() {
    PLAN_IDS.forEach(function (id) { const el = $(id); if (el) data[id] = el.value; });
  }
  function savePlan() {
    try { localStorage.setItem(T.STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ===== 描画 ===== */
  function render() {
    const r = T.calcAll(data);

    // いまどちらの入力方式で計算しているかをチップで示す
    const modeEl = $('txResultMode');
    if (modeEl) {
      const chip = (label, mode) => `<span class="tx-mode-chip"><span class="tx-mode-chip-label">${label}</span>`
        + `<span class="tx-mode-chip-value">${mode === 'detail' ? '詳細入力' : '簡易入力'}</span></span>`;
      modeEl.innerHTML = '<span class="tx-mode-badges-label">この前提で計算中</span>'
        + chip('所得税・住民税', r.itMode) + chip('相続税', r.ihMode);
    }
    setTxt('txHeirsCountView', r.heirsCount + ' 人');

    // --- 税負担の軽減額(カウントアップで表示) ---
    const itNote = `（${man(r.taxItBefore)} → ${man(r.taxItAfter)}）`;
    const rtNote = `（${man(r.taxRtBefore)} → ${man(r.taxRtAfter)}）`;
    countUp('txSaveIncomeTotal', r.saveIncomeSum, (v) => yen(v) + ' / 年');
    countUp('txSaveIncomeTax', r.saveIt, (v) => yen(v) + itNote);
    countUp('txSaveResidentTax', r.saveRt, (v) => yen(v) + rtNote);
    countUp('txSave10y', r.saveIncomeSum * 10, yen);

    countUp('txSaveInheritTotal', r.saveInheritSum, man);
    countUp('txSaveDeath', r.saveDeath, (v) => man(v) + `（非課税 ${man(r.usedDeath)}）`);
    countUp('txSaveRetire', r.saveRetire, (v) => man(v) + `（非課税 ${man(r.usedRetire)}）`);
    countUp('txSaveCondolence', r.saveCondolence, (v) => man(v) + `（非課税 ${man(r.condolenceExemption)}）`);
    countUp('txExemptTotalAmount', r.exemptAmountTotal, man);

    // --- 上限まで使い切った場合の軽減額と活用率 ---
    const mx = r.max || r;
    const pct = (cur, top) => (top > 0 ? Math.min(100, Math.round((cur / top) * 100)) : 0);
    // 活用率バッジと、使い残しがいくらあるかの一言
    const gauge = function (pillId, leadId, now, top, fmt, more, verb) {
      const p = pct(now, top);
      const full = top - now <= 0.5;
      setTxt(pillId, p + '%');
      const pill = $(pillId) ? $(pillId).parentNode : null;
      if (pill) pill.classList.toggle('is-full', full);
      const lead = $(leadId);
      if (lead) {
        lead.textContent = full
          ? 'MAX ' + fmt(top) + ' を使い切っています'
          : 'あと ' + fmt(top - now) + ' ' + (verb || ('上乗せできます' + more));
        lead.classList.toggle('is-full', full);
      }
    };
    gauge('txUseIncome', 'txLeadIncome', r.saveIncomeSum, mx.saveIncomeSum, yen, '(毎年)');
    gauge('txUseInherit', 'txLeadInherit', r.saveInheritSum, mx.saveInheritSum, man, '');

    // --- 保険料・保険金そのものの枠(あといくら加入できるか) ---
    // 控除・非課税が効く範囲だけを「使用済み」として数える(超過分は枠を増やさないため)
    const paid = r.premiumRows.map((row) => Math.min(row.premium, T.PREMIUM_FULL));
    const paidSum = paid.reduce((a2, b2) => a2 + b2, 0);
    const paidMax = T.PREMIUM_FULL * T.PREMIUM_ITEMS.length;
    // 死亡保険金は個人契約、死亡退職金と弔慰金は法人契約でカバーする前提で分けて表示する
    const corpSum = r.usedRetire + r.condolenceExemption;
    const corpMax = r.exemptionEach + r.condolenceExemption;
    countUp('txPremiumNow', paidSum, (v) => yen(v) + ' / 年');
    countUp('txDeathNow', r.usedDeath, man);
    countUp('txCorpNow', corpSum, man);
    gauge('txUsePremium', 'txLeadPremium', paidSum, paidMax, yen, '', '加入できます(毎年の払込)');
    gauge('txUseDeath', 'txLeadDeath', r.usedDeath, r.exemptionEach, man, '', '非課税で受け取れます');
    gauge('txUseCorp', 'txLeadCorp', corpSum, corpMax, man, '', '非課税で受け取れます');
    countUp('txPaidGeneral', paid[0], yen);
    countUp('txPaidPension', paid[1], yen);
    countUp('txPaidMedical', paid[2], yen);
    countUp('txPaidRoom', Math.max(0, paidMax - paidSum), (v) => yen(v) + ' / 年');
    countUp('txDeathUsed', r.usedDeath, man);
    countUp('txDeathEach', r.exemptionEach, man);
    countUp('txDeathRoom', Math.max(0, r.exemptionEach - r.usedDeath), man);
    countUp('txCorpRetire', r.usedRetire, man);
    countUp('txCorpCond', r.condolenceExemption, man);
    countUp('txCorpRoom', Math.max(0, corpMax - corpSum), man);

    renderSaveChart('txChartPremium', [
      { label: '一般', value: paid[0], color: NAVY[0] },
      { label: '個人年金', value: paid[1], color: NAVY[1] },
      { label: '介護医療', value: paid[2], color: NAVY[2] },
    ], yen, paidMax, { capLabel: '加入できる上限', base: NAVY[0], accent: NAVY[3] });
    renderSaveChart('txChartDeath', [
      { label: '死亡保険金', value: r.usedDeath, color: GREEN[0] },
    ], man, r.exemptionEach, { capLabel: '非課税枠', base: GREEN[0], accent: GREEN[3] });
    renderSaveChart('txChartCorp', [
      { label: '死亡退職金', value: r.usedRetire, color: GREEN[1] },
      { label: '弔慰金', value: r.condolenceExemption, color: GREEN[2] },
    ], man, corpMax, { capLabel: '非課税枠の合計', base: GREEN[0], accent: GREEN[3] });
    countUp('txMaxPremiumCol', mx.saveIncomeSum, yen);
    countUp('txMaxExemptCol', mx.saveDeath + mx.saveRetire, man);
    countUp('txMaxCondolenceCol', mx.saveCondolence, man);

    // --- 各入力欄の「あと◯◯」 ---
    const room = (id, v, fmt) => {
      const el = $(id);
      if (!el) return;
      el.textContent = v > 0 ? 'あと ' + fmt(v) : '枠を使い切っています';
      el.classList.toggle('is-full', !(v > 0));
    };
    room('txRoomGeneral', r.roomGeneral, yen);
    room('txRoomPension', r.roomPension, yen);
    room('txRoomMedical', r.roomMedical, yen);
    room('txRoomDeath', r.roomDeath, man);
    room('txRoomRetire', r.roomRetire, man);

    renderSaveChart('txChartIncome', [
      { label: '所得税', value: r.saveIt, color: NAVY[0] },
      { label: '住民税', value: r.saveRt, color: NAVY[1] },
    ], yen, mx.saveIncomeSum, { capLabel: '軽減額の上限', base: NAVY[0], accent: NAVY[3] });
    renderSaveChart('txChartInherit', [
      { label: '生命保険金', value: r.saveDeath, color: GREEN[0] },
      { label: '死亡退職金', value: r.saveRetire, color: GREEN[1] },
      { label: '弔慰金', value: r.saveCondolence, color: GREEN[2] },
    ], man, mx.saveInheritSum, { capLabel: '軽減額の上限', base: GREEN[0], accent: GREEN[3] });

    // --- PDF出力用の明細(画面には出さず印刷シートにだけ書き込む) ---
    const pBody = $('pPremiumBody');
    if (pBody) {
      pBody.innerHTML = '';
      r.premiumRows.forEach(function (row) {
        const ptr = document.createElement('tr');
        ptr.innerHTML = `<td class="lbl">${row.label}</td><td>${yen(row.premium)}</td><td>${yen(row.it)}</td><td>${yen(row.rt)}</td>`;
        pBody.appendChild(ptr);
      });
    }
    setTxt('pIncomeTaxTotal', yen(r.premiumItTotal));
    setTxt('pResidentTaxTotal', yen(r.premiumRtTotal));
    setTxt('pExemptionEach', man(r.exemptionEach));
    setTxt('pDeathBenefitResult', `使用 ${man(r.usedDeath)} / 課税対象 ${man(r.taxableDeath)}`);
    setTxt('pRetirementResult', `使用 ${man(r.usedRetire)} / 課税対象 ${man(r.taxableRetire)}`);
    setTxt('pCondolenceResult', `${man(r.condolenceExemption)}(${r.condolenceMonths}ヶ月分)`);
  }

  /* ===== 入力確定時に再計算(入力中は反映しない) ===== */
  root.addEventListener('change', function (e) {
    if (!e.target || PLAN_IDS.indexOf(e.target.id) < 0) return;
    if (!validatePlan()) return;
    collectPlan();
    savePlan();
    render();
  });
  // エラーの赤枠は入力し直したら即座に解除する
  root.addEventListener('input', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('input-error')) {
      e.target.classList.remove('input-error');
    }
  });
  // 入力欄でEnterを押したら入力確定として扱う
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!t || PLAN_IDS.indexOf(t.id) < 0) return;
    e.preventDefault();
    if (typeof t.blur === 'function') t.blur();
  });

  /* ===== 初期表示 ===== */
  collectPlan();
  render();

  /* ===== 生命保険の設計だけをクリア =====
     window.confirm()はLINE等アプリ内ブラウザで反応しないことがあるため、
     1回目のクリックで「本当にクリア？」に変わり、2回目のクリックで実行する */
  const planClearBtn = $('txPlanClearBtn');
  if (planClearBtn) {
    const originalText = planClearBtn.textContent;
    let revertTimer = null;
    planClearBtn.addEventListener('click', function () {
      if (planClearBtn.classList.contains('is-confirming')) {
        clearTimeout(revertTimer);
        planClearBtn.classList.remove('is-confirming');
        planClearBtn.textContent = originalText;
        PLAN_IDS.forEach(function (id) {
          const el = $(id);
          if (!el) return;
          if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
        });
        clearPlanError();
        collectPlan();
        savePlan();
        render();
        return;
      }
      planClearBtn.classList.add('is-confirming');
      planClearBtn.textContent = '本当にクリア？';
      revertTimer = setTimeout(function () {
        planClearBtn.classList.remove('is-confirming');
        planClearBtn.textContent = originalText;
      }, 4000);
    });
  }

  /* ===== 全データクリア ===== */
  const clearBtn = $('txClearBtn');
  if (clearBtn && window.armHeroClearBtn) {
    window.armHeroClearBtn(clearBtn, function () {
      try { localStorage.removeItem(T.STORAGE_KEY); } catch (e) {}
      window.location.href = 'tax-exemption.html';
    });
  }

  /* ===== PDF出力 ===== */
  function doPrint() {
    const now = new Date();
    const dateEl = $('pDate');
    if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
});

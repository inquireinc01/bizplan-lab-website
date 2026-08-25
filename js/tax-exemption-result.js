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
  // テスト配信ページ(trial-)ではサンプル値を使わない
  const IS_TRIAL = window.location.pathname.indexOf('trial-') >= 0;
  // 生命保険の設計のサンプル既定値(全体ルール: グレー「入力例：数値 単位」表示+本番はフォールバック)
  const TXR_SAMPLE = {
    txGeneralPremium: [40000, '円/年'], txPensionPremium: [30000, '円/年'], txMedicalPremium: [20000, '円/年'],
    txDeathBenefit: [600, '万円'], txRetirementBenefit: [300, '万円'],
    txSalaryMonthly: [100, '万円'], txCondolenceAmount: [1000, '万円'],
  };
  function applyTxrPlaceholders() {
    Object.keys(TXR_SAMPLE).forEach(function (id) {
      const el = document.getElementById(id);
      if (!el || el.value !== '') return;
      const sample = TXR_SAMPLE[id][0], unit = TXR_SAMPLE[id][1];
      el.placeholder = (!IS_TRIAL && sample > 0)
        ? '入力例：' + (window.numFmt ? window.numFmt(sample) : sample) + ' ' + unit
        : '0 ' + unit;
    });
  }

  const numOf = (id) => {
    const el = $(id);
    if (!el) return NaN;
    let v = window.numClean ? window.numClean(el.value) : parseFloat(el.value);
    // 本番: 未入力はサンプル既定値で試算(入力例placeholderと対応)。テスト版は入力したもののみ
    if (isNaN(v) && !IS_TRIAL && TXR_SAMPLE[id]) v = TXR_SAMPLE[id][0];
    return v;
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

  /* ===== 数字と単位 =====
     全体ルールとして、万円・円・％などの単位は数字より小さく表示する ===== */
  const UNIT_RE = /([0-9][0-9,.]*)\s*(円\s*\/\s*年|万円|円|％|%|人|ヶ月分)/g;
  const withUnit = (txt) => String(txt).replace(UNIT_RE, '$1<span class="unit">$2</span>');
  // SVG内はspanが使えないのでtspanでフォントサイズを直接落とす
  const svgAmount = (txt, size) => String(txt).replace(UNIT_RE, function (m, n, u) {
    return `<tspan font-size="${size}">${n}</tspan><tspan font-size="${Math.round(size * 0.68)}"> ${u}</tspan>`;
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
    if (from === to) { el.innerHTML = withUnit(fmt(to)); return; }
    const start = performance.now();
    const step = function (now) {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - p, 3); // ease-out
      el.innerHTML = withUnit(fmt(from + (to - from) * e));
      if (p < 1) el._countRaf = requestAnimationFrame(step);
      else el._countRaf = null;
    };
    el._countRaf = requestAnimationFrame(step);
    // 非表示タブなどでrequestAnimationFrameが止まると数字が出ないままになるため、
    // アニメーション時間を過ぎたら確実に最終値を表示する
    el._countTimer = setTimeout(function () {
      if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
      el.innerHTML = withUnit(fmt(to));
    }, COUNT_MS + 250);
  }

  /* ===== 軽減額ゲージ =====
     上限を全体の幅とし、現状の金額を内訳ごとに積み上げる。
     残り(使い残している枠)は斜線で塗り、残り何%かを大きく見せる ===== */
  function drawSaveChart(svg, parts, unitFmt, maxTotal, opt) {
    const o = opt || {};
    const W = 560, BAR_X = 8, BAR_W = 544, BAR_Y = 4, BAR_H = o.slim ? 36 : 78;
    const RX = Math.min(BAR_H / 2, o.slim ? 10 : 16);
    const used = parts.reduce((s2, p) => s2 + Math.max(0, p.value), 0);
    const cap = Math.max(maxTotal, used);
    const pid = svg.id + 'Stripe';
    const cid = svg.id + 'Clip';
    const gid = svg.id + 'Gloss';
    // 帯全体を角丸でクリップしてから中身を描くことで、区分の境目が段差にならず端だけがなめらかに丸くなる
    let defs = `<pattern id="${pid}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">`
      + `<rect width="18" height="18" fill="#eff2f6"/><rect width="7" height="18" fill="#e4e9f0"/></pattern>`
      + `<clipPath id="${cid}"><rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}"/></clipPath>`
      + `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">`
      + `<stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>`
      + `<stop offset="0.55" stop-color="#ffffff" stop-opacity="0.02"/>`
      + `<stop offset="1" stop-color="#000000" stop-opacity="0.07"/></linearGradient>`;
    if (cap <= 0) {
      const out0 = `<defs>${defs}</defs>`
        + `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}" fill="#eff2f6"/>`
        + `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 8}" font-size="20" fill="#9ca3af" text-anchor="middle">軽減額なし</text>`;
      svg.innerHTML = out0;
      return;
    }
    // 帯に入れる文字の必要幅を文字数から見積もる(半角0.55em・全角1em)
    const widthOf = (label, size) => {
      let need = size * 0.8;
      for (let k = 0; k < label.length; k += 1) need += /[0-9,.\s%]/.test(label[k]) ? size * 0.55 : size;
      return need;
    };
    const usedW = (used / cap) * BAR_W;
    const room = Math.max(0, cap - used);

    // --- 帯(クリップ内) ---
    let bars = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="#eff2f6"/>`;
    if (room > 0) {
      bars += `<rect x="${(BAR_X + usedW).toFixed(1)}" y="${BAR_Y}" width="${(BAR_W - usedW).toFixed(1)}" height="${BAR_H}" fill="url(#${pid})"/>`;
    }
    // --- 帯の中の金額(クリップ外に描いて欠けないようにする) ---
    let labels = '';
    let x = BAR_X;
    parts.forEach(function (p) {
      const v = Math.max(0, p.value);
      if (v <= 0) return;
      const w = (v / cap) * BAR_W;
      // 区分の境目に髪の毛一本分だけ重ねて、拡大時に隙間が出ないようにする
      bars += `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${(w + 0.6).toFixed(1)}" height="${BAR_H}" fill="${p.color}"/>`;
      const label = unitFmt(v);
      const fs = o.slim ? 16 : 20;
      // 軽減額のグラフは帯の中に金額を書かない(内訳は折りたたみの凡例で見る)
      if (!o.noSegLabel && w > widthOf(label, fs)) {
        labels += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + (o.slim ? 5 : 7)}" font-weight="bold" fill="#fff" text-anchor="middle">${svgAmount(label, fs)}</text>`;
      }
      x += w;
    });
    bars += `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="url(#${gid})"/>`;

    let out = `<defs>${defs}</defs><g clip-path="url(#${cid})">${bars}</g>${labels}`;
    // 帯の下に「現状」と「上限」を左右に並べる(簡易版カードも同じレイアウトにそろえる)
    const capFs = o.slim ? 17 : 20;
    const capLabelFs = o.slim ? 12 : 13;
    const capY = BAR_Y + BAR_H + (o.slim ? 22 : 24);
    out += `<text x="${BAR_X}" y="${capY}" font-weight="bold" fill="${o.base || '#0f2a4a'}">`
      + `<tspan font-size="${capLabelFs}" font-weight="normal" fill="#6b7280">現状 </tspan>${svgAmount(unitFmt(used), capFs)}</text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${capY}" text-anchor="end" font-weight="bold" fill="${o.accent || '#2d5580'}">`
      + `<tspan font-size="${capLabelFs}" font-weight="normal" fill="#6b7280">上限 </tspan>${svgAmount(unitFmt(cap), capFs)}</text>`;
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
    const opts = opt || {};
    const at = (vals) => parts.map((p, i) => ({ label: p.label, color: p.color, value: vals[i] }));
    if (prev.every((v, i) => v === next[i])) { drawSaveChart(svg, at(next), unitFmt, next[next.length - 1], opts); return; }
    // requestAnimationFrameが止まる環境でも最終形は必ず描く
    svg._chartTimer = setTimeout(function () {
      if (svg._chartRaf) { cancelAnimationFrame(svg._chartRaf); svg._chartRaf = null; }
      drawSaveChart(svg, at(next), unitFmt, next[next.length - 1], opts);
    }, COUNT_MS + 250);
    const start = performance.now();
    const step = function (now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - t, 3); // ease-out
      const cur = next.map((v, i) => prev[i] + (v - prev[i]) * e);
      drawSaveChart(svg, at(cur), unitFmt, cur[cur.length - 1], opts);
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
    'txSalaryMonthly', 'txCondolenceAmount',
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

  // 空欄は「まだ入れていない(0扱い)」として許容し、値が入っているときだけ範囲を見る
  const isBlank = (id) => { const el = $(id); return !el || String(el.value).trim() === ''; };

  function validatePlan() {
    clearPlanError();
    for (const it of T.PREMIUM_ITEMS) {
      if (isBlank(it.id)) continue;
      const v = numOf(it.id);
      if (isNaN(v) || v < 0) { showPlanError(it.label + 'は0以上の数値で入力してください。', $(it.id)); return false; }
      if (v > MAX_YEN) { showPlanError('保険料は ' + T.fmt(MAX_YEN) + ' 円以内で入力してください。', $(it.id)); return false; }
    }
    for (const id of ['txDeathBenefit', 'txRetirementBenefit', 'txSalaryMonthly', 'txCondolenceAmount']) {
      if (isBlank(id)) continue;
      const v = numOf(id);
      if (isNaN(v) || v < 0) { showPlanError('金額は0以上の数値で入力してください。', $(id)); return false; }
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
      modeEl.innerHTML = chip('所得税・住民税', r.itMode) + chip('相続税', r.ihMode);
    }

    // --- 税負担の軽減額(カウントアップで表示) ---
    const itNote = `（${man(r.taxItBefore)} → ${man(r.taxItAfter)}）`;
    const rtNote = `（${man(r.taxRtBefore)} → ${man(r.taxRtAfter)}）`;
    countUp('txSaveIncomeTax', r.saveIt, (v) => yen(v) + itNote);
    countUp('txSaveResidentTax', r.saveRt, (v) => yen(v) + rtNote);
    countUp('txSave10y', r.saveIncomeSum * 10, yen);

    countUp('txSaveDeath', r.saveDeath, (v) => man(v) + `（非課税 ${man(r.usedDeath)}）`);
    countUp('txSaveRetire', r.saveRetire, (v) => man(v) + `（非課税 ${man(r.usedRetire)}）`);
    countUp('txSaveCondolence', r.saveCondolence, (v) => man(v) + `（非課税 ${man(r.condolenceExemption)}）`);
    countUp('txExemptTotalAmount', r.exemptAmountTotal, man);

    // --- 上限まで使い切った場合の軽減額と活用率 ---
    const mx = r.max || r;
    const pct = (cur, top) => (top > 0 ? Math.min(100, Math.round((cur / top) * 100)) : 0);
    // 大きい数字は「あといくら上乗せできるか」。現状と上限はその下に添える
    const yenY = (v) => yen(v) + ' / 年';
    const gauge = function (nowId, pillId, leadId, now, top, fmt, leadFmt) {
      const lf = leadFmt || fmt;
      const left = Math.max(0, top - now);
      const full = left <= 0.5;
      countUp(nowId, left, fmt);
      const pillEl = $(pillId);
      if (pillEl) pillEl.innerHTML = withUnit(pct(now, top) + '%');
      const pill = $(pillId) ? $(pillId).parentNode : null;
      if (pill) pill.classList.toggle('is-full', full);
      const lead = $(leadId);
      if (lead) {
        lead.textContent = full
          ? '上限 ' + lf(top) + ' を使い切っています'
          : '現状 ' + lf(now) + ' ・ 上限 ' + lf(top);
        lead.classList.toggle('is-full', full);
      }
    };
    gauge('txSaveIncomeTotal', 'txUseIncome', 'txLeadIncome', r.saveIncomeSum, mx.saveIncomeSum, yenY, yen);
    gauge('txSaveInheritTotal', 'txUseInherit', 'txLeadInherit', r.saveInheritSum, mx.saveInheritSum, man);

    // --- 保険料・保険金そのものの枠(あといくら加入できるか) ---
    // 控除・非課税が効く範囲だけを「使用済み」として数える(超過分は枠を増やさないため)
    const paid = r.premiumRows.map((row) => Math.min(row.premium, T.PREMIUM_FULL));
    const paidSum = paid.reduce((a2, b2) => a2 + b2, 0);
    const paidMax = T.PREMIUM_FULL * T.PREMIUM_ITEMS.length;
    // 死亡保険金は個人契約、死亡退職金と弔慰金は法人契約でカバーする前提で1枚ずつ表示する
    const premCards = [
      ['txGenNow', 'txUseGen', 'txLeadGen', 'txChartGen'],
      ['txPenNow', 'txUsePen', 'txLeadPen', 'txChartPen'],
      ['txMedNow', 'txUseMed', 'txLeadMed', 'txChartMed'],
    ];
    premCards.forEach(function (ids, i) {
      gauge(ids[0], ids[1], ids[2], paid[i], T.PREMIUM_FULL, yenY, yen);
      renderSaveChart(ids[3], [{ label: r.premiumRows[i].label, value: paid[i], color: NAVY[i] }],
        yen, T.PREMIUM_FULL, { base: NAVY[i], accent: NAVY[3], slim: true });
    });
    const inheritCards = [
      ['txDeathNow', 'txUseDeath', 'txLeadDeath', 'txChartDeath', '死亡保険金', r.usedDeath, r.exemptionEach],
      ['txRetNow', 'txUseRet', 'txLeadRet', 'txChartRet', '死亡退職金', r.usedRetire, r.exemptionEach],
      ['txCondNow', 'txUseCond', 'txLeadCond', 'txChartCond', '弔慰金', r.condolenceExemption, r.condolenceLimit],
    ];
    inheritCards.forEach(function (c, i) {
      gauge(c[0], c[1], c[2], c[5], c[6], man);
      renderSaveChart(c[3], [{ label: c[4], value: c[5], color: GREEN[i] }],
        man, c[6], { base: GREEN[i], accent: GREEN[3], slim: true });
    });

    // --- 各入力欄の「あと◯◯」 ---
    const room = (id, v, fmt) => {
      const el = $(id);
      if (!el) return;
      el.textContent = v > 0 ? 'あと ' + fmt(v) : '使い切り';
      el.classList.toggle('is-full', !(v > 0));
    };
    room('txRoomGeneral', r.roomGeneral, yen);
    room('txRoomPension', r.roomPension, yen);
    room('txRoomMedical', r.roomMedical, yen);
    room('txRoomDeath', r.roomDeath, man);
    room('txRoomRetire', r.roomRetire, man);
    const condEl = $('txRoomCond');
    if (condEl) {
      condEl.textContent = r.condolenceLimit > 0
        ? '非課税枠 ' + man(r.condolenceLimit) + '(' + r.condolenceMonths + 'ヶ月分)'
        : '入力すると弔慰金の枠が決まります';
      condEl.classList.toggle('is-full', !(r.condolenceLimit > 0));
    }
    // 弔慰金の非課税枠は最終報酬月額で決まるため、それが入るまで入力できないようにする
    const condInput = $('txCondolenceAmount');
    if (condInput) {
      const ready = r.condolenceLimit > 0;
      condInput.disabled = !ready;
      if (!ready && condInput.value !== '') { condInput.value = ''; data.txCondolenceAmount = ''; }
      const roomEl = $('txRoomCondolence');
      if (roomEl) {
        if (ready) {
          room('txRoomCondolence', r.roomCondolence, man);
        } else {
          roomEl.textContent = '最終報酬月額を入力すると入力できます';
          roomEl.classList.add('is-full');
        }
      }
    }

    // 軽減額を保険料の区分ごとに按分する。
    // 各区分が生んだ控除額の割合で所得税・住民税それぞれの軽減額を分ける
    // (合計適用限度額で頭打ちになった場合も、同じ割合で縮まるので按分結果は変わらない)
    const itSum = r.premiumRows.reduce((a2, row) => a2 + row.it, 0);
    const rtSum = r.premiumRows.reduce((a2, row) => a2 + row.rt, 0);
    const saveByKind = r.premiumRows.map(function (row) {
      return (itSum > 0 ? r.saveIt * (row.it / itSum) : 0)
        + (rtSum > 0 ? r.saveRt * (row.rt / rtSum) : 0);
    });
    countUp('txSaveGen', saveByKind[0], yen);
    countUp('txSavePen', saveByKind[1], yen);
    countUp('txSaveMed', saveByKind[2], yen);

    renderSaveChart('txChartIncome', [
      { label: '一般', value: saveByKind[0], color: NAVY[0] },
      { label: '個人年金', value: saveByKind[1], color: NAVY[1] },
      { label: '介護医療', value: saveByKind[2], color: NAVY[2] },
    ], yen, mx.saveIncomeSum, { base: NAVY[0], accent: NAVY[3], noSegLabel: true });
    renderSaveChart('txChartInherit', [
      { label: '死亡保険金', value: r.saveDeath, color: GREEN[0] },
      { label: '死亡退職金', value: r.saveRetire, color: GREEN[1] },
      { label: '弔慰金', value: r.saveCondolence, color: GREEN[2] },
    ], man, mx.saveInheritSum, { base: GREEN[0], accent: GREEN[3], noSegLabel: true });

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
  // 未保存の既定値も保存しておき、表示と保存データを常に一致させる
  collectPlan();
  savePlan();
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
      // テスト配信用のtrial-ページ上では、trial-版の入力ページへ戻る
      var pfx = window.location.pathname.indexOf('trial-') >= 0 ? 'trial-' : '';
      window.location.href = pfx + 'tax-exemption.html';
    });
  }

  /* ===== PDF出力 ===== */
  function doPrint() {
    const now = new Date();
    const dateEl = $('pDate');
    if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    // 1枚目: 画面のゲージカード(上段の「あといくら」+下段の軽減額)を丸ごと複製する。
    // 印刷は見えている画面通りにする方針(2026-08-25指示)
    const slot = $('pScreenGauges');
    if (slot) {
      slot.innerHTML = '';
      const sec = document.querySelector('#txResultArea .calc-section');
      if (sec) {
        const grids = Array.prototype.filter.call(sec.children, (el) => el.classList && el.classList.contains('grid'));
        grids.slice(0, 2).forEach((g) => {
          const clone = g.cloneNode(true);
          // idの重複を避け、?チップは印刷に不要なので除去。凡例(details)は開いた状態で印字
          clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
          clone.querySelectorAll('.help-tip').forEach((el) => el.remove());
          clone.querySelectorAll('details').forEach((el) => el.setAttribute('open', ''));
          slot.appendChild(clone);
        });
      }
    }

    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
  applyTxrPlaceholders();
});

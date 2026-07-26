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
  }

  /* ===== 軽減額グラフ(積み上げ横棒) ===== */
  function drawSaveChart(svg, parts, unitFmt) {
    const W = 560, BAR_X = 8, BAR_W = 544, BAR_Y = 24, BAR_H = 38;
    const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
    let out = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="6" fill="#eef1f4"/>`;
    if (total <= 0) {
      out += `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 4}" font-size="12" fill="#9ca3af" text-anchor="middle">軽減額なし</text>`;
      svg.innerHTML = out;
      return;
    }
    let x = BAR_X;
    parts.forEach(function (p, i) {
      const v = Math.max(0, p.value);
      if (v <= 0) return;
      const w = (v / total) * BAR_W;
      const isFirst = x === BAR_X;
      const isLast = i === parts.length - 1 || parts.slice(i + 1).every((q) => Math.max(0, q.value) <= 0);
      const rx = (isFirst || isLast) ? 6 : 0;
      out += `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${w.toFixed(1)}" height="${BAR_H}" rx="${rx}" fill="${p.color}"/>`;
      if (w > 62) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 4}" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">${unitFmt(v)}</text>`;
      }
      if (w > 34) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y - 7}" font-size="10" fill="#6b7280" text-anchor="middle">${((v / total) * 100).toFixed(0)}%</text>`;
      }
      x += w;
    });
    out += `<text x="${BAR_X}" y="${BAR_Y + BAR_H + 20}" font-size="11" fill="#6b7280">合計</text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${BAR_Y + BAR_H + 20}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="end">${unitFmt(total)}</text>`;
    svg.innerHTML = out;
  }

  // 直前の内訳から新しい内訳まで、棒の伸びと数字を同じ時間で動かす
  const chartState = {};
  function renderSaveChart(svgId, parts, unitFmt) {
    const svg = $(svgId);
    if (!svg) return;
    const next = parts.map((p) => Math.max(0, p.value));
    const prev = chartState[svgId] && chartState[svgId].length === next.length
      ? chartState[svgId] : next.map(() => 0);
    chartState[svgId] = next;
    if (svg._chartRaf) { cancelAnimationFrame(svg._chartRaf); svg._chartRaf = null; }
    const at = (vals) => parts.map((p, i) => ({ label: p.label, color: p.color, value: vals[i] }));
    if (prev.every((v, i) => v === next[i])) { drawSaveChart(svg, at(next), unitFmt); return; }
    const start = performance.now();
    const step = function (now) {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - t, 3); // ease-out
      drawSaveChart(svg, at(next.map((v, i) => prev[i] + (v - prev[i]) * e)), unitFmt);
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

    setTxt('txResultMode', '所得税: ' + (r.itMode === 'detail' ? '詳細入力' : '簡易入力')
      + ' / 相続税: ' + (r.ihMode === 'detail' ? '詳細入力' : '簡易入力'));
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

    renderSaveChart('txChartIncome', [
      { label: '所得税', value: r.saveIt, color: '#0f2a4a' },
      { label: '住民税', value: r.saveRt, color: '#3b6ea5' },
    ], yen);
    renderSaveChart('txChartInherit', [
      { label: '生命保険金', value: r.saveDeath, color: '#0f2a4a' },
      { label: '死亡退職金', value: r.saveRetire, color: '#3b6ea5' },
      { label: '弔慰金', value: r.saveCondolence, color: '#7a9cc0' },
    ], man);

    // --- 1. 生命保険料控除額 ---
    const tbody = $('txPremiumBody');
    const pBody = $('pPremiumBody');
    if (tbody) tbody.innerHTML = '';
    if (pBody) pBody.innerHTML = '';
    r.premiumRows.forEach(function (row) {
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100';
        tr.innerHTML = `<td class="px-3 py-1.5 text-gray-800">${row.label}</td>`
          + `<td class="px-3 py-1.5 text-right">${yen(row.premium)}</td>`
          + `<td class="px-3 py-1.5 text-right">${yen(row.it)}</td>`
          + `<td class="px-3 py-1.5 text-right">${yen(row.rt)}</td>`;
        tbody.appendChild(tr);
      }
      if (pBody) {
        const ptr = document.createElement('tr');
        ptr.innerHTML = `<td class="lbl">${row.label}</td><td>${yen(row.premium)}</td><td>${yen(row.it)}</td><td>${yen(row.rt)}</td>`;
        pBody.appendChild(ptr);
      }
    });
    countUp('txIncomeTaxTotal', r.premiumItTotal, yen);
    countUp('txResidentTaxTotal', r.premiumRtTotal, yen);
    setTxt('pIncomeTaxTotal', yen(r.premiumItTotal));
    setTxt('pResidentTaxTotal', yen(r.premiumRtTotal));

    // --- 2. 相続税の非課税枠 ---
    countUp('txExemptionEach', r.exemptionEach, man);
    setTxt('pExemptionEach', man(r.exemptionEach));
    const deathTxt = `使用 ${man(r.usedDeath)} / 課税対象 ${man(r.taxableDeath)}`;
    const retireTxt = `使用 ${man(r.usedRetire)} / 課税対象 ${man(r.taxableRetire)}`;
    setTxt('txDeathBenefitResult', deathTxt);
    setTxt('pDeathBenefitResult', deathTxt);
    setTxt('txRetirementResult', retireTxt);
    setTxt('pRetirementResult', retireTxt);

    // --- 3. 弔慰金 ---
    const condTxt = `${man(r.condolenceExemption)}(${r.condolenceMonths}ヶ月分)`;
    setTxt('txCondolenceResult', condTxt);
    setTxt('pCondolenceResult', condTxt);

    // --- サマリー ---
    countUp('txSummaryPremium', r.premiumItTotal, (v) => `${yen(v)} + ${yen(r.premiumRtTotal)}`);
    countUp('txSummaryInheritance', r.exemptionEach * 2 + r.condolenceExemption, man);
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

/* ============================================================
   非課税×生命保険(結果ページ)
   - 入力ページが保存した内容を読み込み、共有ロジックで計算して描画する
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('txResultArea');
  if (!root || !window.bplTax) return;
  const T = window.bplTax;
  const yen = T.yen;
  const man = T.man;

  const $ = (id) => document.getElementById(id);
  const setTxt = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };

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

  /* ===== 軽減額グラフ(積み上げ横棒) ===== */
  function renderSaveChart(svgId, parts, unitFmt) {
    const svg = $(svgId);
    if (!svg) return;
    const W = 360, BAR_X = 8, BAR_W = 344, BAR_Y = 34, BAR_H = 46;
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
      out += `<rect class="tx-save-bar" x="${x.toFixed(1)}" y="${BAR_Y}" width="${w.toFixed(1)}" height="${BAR_H}" rx="${rx}" fill="${p.color}" style="animation-delay:${i * 160}ms"/>`;
      if (w > 62) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 4}" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">${unitFmt(v)}</text>`;
      }
      if (w > 34) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y - 8}" font-size="10" fill="#6b7280" text-anchor="middle">${((v / total) * 100).toFixed(0)}%</text>`;
      }
      x += w;
    });
    out += `<text x="${BAR_X}" y="${BAR_Y + BAR_H + 22}" font-size="11" fill="#6b7280">合計</text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${BAR_Y + BAR_H + 22}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="end">${unitFmt(total)}</text>`;
    svg.innerHTML = out;
  }

  /* ===== 描画 ===== */
  const data = T.loadInputs();
  if (!data) {
    root.classList.add('hidden');
    const noData = $('txNoDataArea');
    if (noData) noData.classList.remove('hidden');
    return;
  }
  const r = T.calcAll(data);

  setTxt('txResultMode', '所得税: ' + (r.itMode === 'detail' ? '詳細入力' : '簡易入力')
    + ' / 相続税: ' + (r.ihMode === 'detail' ? '詳細入力' : '簡易入力'));

  // --- 税負担の軽減額 ---
  setTxt('txSaveIncomeTotal', yen(r.saveIncomeSum) + ' / 年');
  setTxt('txSaveIncomeTax', yen(r.saveIt) + `（${man(r.taxItBefore)} → ${man(r.taxItAfter)}）`);
  setTxt('txSaveResidentTax', yen(r.saveRt) + `（${man(r.taxRtBefore)} → ${man(r.taxRtAfter)}）`);
  setTxt('txSave10y', yen(r.saveIncomeSum * 10));

  setTxt('txSaveInheritTotal', man(r.saveInheritSum));
  setTxt('txSaveDeath', man(r.saveDeath) + `（非課税 ${man(r.usedDeath)}）`);
  setTxt('txSaveRetire', man(r.saveRetire) + `（非課税 ${man(r.usedRetire)}）`);
  setTxt('txSaveCondolence', man(r.saveCondolence) + `（非課税 ${man(r.condolenceExemption)}）`);
  setTxt('txExemptTotalAmount', man(r.exemptAmountTotal));

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
  setTxt('txIncomeTaxTotal', yen(r.premiumItTotal));
  setTxt('txResidentTaxTotal', yen(r.premiumRtTotal));
  setTxt('pIncomeTaxTotal', yen(r.premiumItTotal));
  setTxt('pResidentTaxTotal', yen(r.premiumRtTotal));

  // --- 2. 相続税の非課税枠 ---
  setTxt('txExemptionEach', man(r.exemptionEach));
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

  // --- 4. 一時所得 ---
  setTxt('txOneTimeIncome', man(r.oneTimeIncome));
  setTxt('pOneTimeIncome', man(r.oneTimeIncome));
  setTxt('txOneTimeTaxable', man(r.oneTimeTaxable));
  setTxt('pOneTimeTaxable', man(r.oneTimeTaxable));

  // --- サマリー ---
  setTxt('txSummaryPremium', `${yen(r.premiumItTotal)} + ${yen(r.premiumRtTotal)}`);
  setTxt('txSummaryInheritance', man(r.exemptionEach * 2 + r.condolenceExemption));

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

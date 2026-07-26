document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('txForm');
  if (!form) return;

  const resultArea = document.getElementById('txResultArea');
  const errorArea = document.getElementById('txErrorArea');
  let suppressScroll = false;
  let lastResult = null;

  const PREMIUM_ITEMS = [
    { id: 'txGeneralPremium', label: '一般生命保険料' },
    { id: 'txPensionPremium', label: '個人年金保険料' },
    { id: 'txMedicalPremium', label: '介護医療保険料' },
  ];

  const yen = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 円';
  const man = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 万円';

  // 生命保険料控除(新制度・平成24年1月1日以後契約)
  function incomeTaxDeduction(p) {
    if (p <= 0) return 0;
    if (p <= 20000) return p;
    if (p <= 40000) return p * 0.5 + 10000;
    if (p <= 80000) return p * 0.25 + 20000;
    return 40000;
  }
  function residentTaxDeduction(p) {
    if (p <= 0) return 0;
    if (p <= 12000) return p;
    if (p <= 32000) return p * 0.5 + 6000;
    if (p <= 56000) return p * 0.25 + 14000;
    return 28000;
  }

  // ===== 所得税・住民税の計算(すべて万円ベース) =====
  const RESIDENT_TAX_RATE = 10; // 住民税(所得割)の標準税率%
  const RESIDENT_PER_CAPITA = 0.5; // 住民税の均等割 5,000円 = 0.5万円

  // 給与所得控除額(2020年分以降)
  function salaryDeduction(incomeMan) {
    const x = Math.max(0, incomeMan);
    if (x <= 162.5) return Math.min(x, 55);
    if (x <= 180) return x * 0.4 - 10;
    if (x <= 360) return x * 0.3 + 8;
    if (x <= 660) return x * 0.2 + 44;
    if (x <= 850) return x * 0.1 + 110;
    return 195;
  }
  // 基礎控除(合計所得金額に応じて縮小)。所得税48/32/16、住民税43/29/15
  function basicDeduction(totalIncomeMan, isResident) {
    const t = Math.max(0, totalIncomeMan);
    if (t <= 2400) return isResident ? 43 : 48;
    if (t <= 2450) return isResident ? 29 : 32;
    if (t <= 2500) return isResident ? 15 : 16;
    return 0;
  }
  // 所得税の限界税率(%)
  function marginalIncomeTaxRate(taxableIncomeMan) {
    const x = Math.max(0, taxableIncomeMan);
    if (x <= 195) return 5;
    if (x <= 330) return 10;
    if (x <= 695) return 20;
    if (x <= 900) return 23;
    if (x <= 1800) return 33;
    if (x <= 4000) return 40;
    return 45;
  }
  // 所得税額(超過累進税率・万円)
  function incomeTaxAmount(taxableIncomeMan) {
    const x = Math.max(0, taxableIncomeMan);
    const brackets = [
      [195, 0.05, 0],
      [330, 0.10, 9.75],
      [695, 0.20, 42.75],
      [900, 0.23, 63.6],
      [1800, 0.33, 153.6],
      [4000, 0.40, 279.6],
      [Infinity, 0.45, 479.6],
    ];
    for (const [limit, rate, ded] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - ded);
    }
    return 0;
  }
  // 課税所得は1,000円未満切捨て(万円ベースなので0.1万円単位で切捨て)
  function floorTaxable(man) {
    return Math.max(0, Math.floor(Math.max(0, man) * 10) / 10);
  }

  const SPOUSE_DEDUCTION = { none: [0, 0], general: [38, 33], elderly: [48, 38] };

  // 生命保険料控除を除いた所得・控除の状態を集計する
  function collectIncomeBase() {
    const pn = (id) => {
      const el = document.getElementById(id);
      if (!el) return NaN;
      return window.numClean ? window.numClean(el.value) : parseFloat(el.value);
    };
    const salary = pn('txSalaryIncome');
    const other = pn('txOtherIncome');
    const social = pn('txSocialInsurance');
    const depGen = pn('txDependentGeneral');
    const depSpe = pn('txDependentSpecific');
    const depEld = pn('txDependentElderly');
    const otherDed = pn('txOtherDeduction');
    const spouseKey = (document.getElementById('txSpouseDeduction') || {}).value || 'none';

    if ([salary, other, social, depGen, depSpe, depEld, otherDed].some((v) => isNaN(v) || v < 0)) return null;

    const salDed = salaryDeduction(salary);
    const salaryIncome = Math.max(0, salary - salDed);
    const totalIncome = salaryIncome + other;

    const sp = SPOUSE_DEDUCTION[spouseKey] || SPOUSE_DEDUCTION.none;
    // 扶養控除: 所得税 一般38/特定63/老人48、住民税 一般33/特定45/老人38
    const depIt = depGen * 38 + depSpe * 63 + depEld * 48;
    const depRt = depGen * 33 + depSpe * 45 + depEld * 38;

    const basicIt = basicDeduction(totalIncome, false);
    const basicRt = basicDeduction(totalIncome, true);
    // 生命保険料控除以外の所得控除合計
    const dedIt = social + sp[0] + depIt + otherDed + basicIt;
    const dedRt = social + sp[1] + depRt + otherDed + basicRt;

    return { salary, salDed, salaryIncome, other, totalIncome, basicIt, basicRt, dedIt, dedRt };
  }

  // 「1. 所得税・住民税の計算」欄(生命保険料控除の適用前)を更新する
  function refreshIncomeSheet() {
    const b = collectIncomeBase();
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const salDedEl = document.getElementById('txSalaryDeduction');
    if (!b) {
      if (salDedEl) salDedEl.value = '';
      ['txTotalIncomeIt', 'txTotalIncomeRt', 'txBasicIt', 'txBasicRt', 'txDeductionIt', 'txDeductionRt',
        'txTaxableIt', 'txTaxableRt', 'txRateIt', 'txRateRt', 'txTaxBeforeIt', 'txTaxBeforeRt'].forEach((id) => set(id, '-'));
      return null;
    }
    const taxableIt = floorTaxable(b.totalIncome - b.dedIt);
    const taxableRt = floorTaxable(b.totalIncome - b.dedRt);
    const taxIt = incomeTaxAmount(taxableIt);
    const taxRt = taxableRt > 0 ? taxableRt * RESIDENT_TAX_RATE / 100 + RESIDENT_PER_CAPITA : 0;

    if (salDedEl) salDedEl.value = man(b.salDed);
    set('txTotalIncomeIt', man(b.totalIncome));
    set('txTotalIncomeRt', man(b.totalIncome));
    set('txBasicIt', man(b.basicIt));
    set('txBasicRt', man(b.basicRt));
    set('txDeductionIt', man(b.dedIt));
    set('txDeductionRt', man(b.dedRt));
    set('txTaxableIt', man(taxableIt));
    set('txTaxableRt', man(taxableRt));
    set('txRateIt', marginalIncomeTaxRate(taxableIt) + ' %');
    set('txRateRt', RESIDENT_TAX_RATE + ' %＋均等割');
    set('txTaxBeforeIt', man(taxIt));
    set('txTaxBeforeRt', man(taxRt));
    return { base: b, taxableIt, taxableRt, taxIt, taxRt };
  }
  // 収入・控除の入力を確定したら計算欄を更新する
  ['txSalaryIncome', 'txOtherIncome', 'txSocialInsurance', 'txSpouseDeduction',
    'txDependentGeneral', 'txDependentSpecific', 'txDependentElderly', 'txOtherDeduction'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', refreshIncomeSheet);
  });

  // ===== 軽減額グラフ(積み上げ横棒)を描画する =====
  // parts: [{label, value, color}] / unitFmt: 数値を表示用文字列にする関数
  function renderSaveChart(svgId, parts, unitFmt) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const W = 360, BAR_X = 8, BAR_W = 344, BAR_Y = 34, BAR_H = 46;
    const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
    let out = '';
    // 目盛りの土台(未使用分はグレーで示し、枠の大きさを一定に保つ)
    out += `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="6" fill="#eef1f4"/>`;
    if (total <= 0) {
      out += `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 4}" font-size="12" fill="#9ca3af" text-anchor="middle">軽減額なし(入力してください)</text>`;
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
      // 両端だけ角を丸める(rx指定は矩形全体にかかるため、中間の帯は角丸なしにする)
      const rx = (isFirst || isLast) ? 6 : 0;
      out += `<rect class="tx-save-bar" x="${x.toFixed(1)}" y="${BAR_Y}" width="${w.toFixed(1)}" height="${BAR_H}" rx="${rx}" fill="${p.color}" style="animation-delay:${i * 160}ms"/>`;
      // 帯が十分広いときだけ帯の中に金額を書く
      if (w > 62) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + 4}" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">${unitFmt(v)}</text>`;
      }
      // 帯の上に構成比
      const pct = (v / total) * 100;
      if (w > 34) {
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y - 8}" font-size="10" fill="#6b7280" text-anchor="middle">${pct.toFixed(0)}%</text>`;
      }
      x += w;
    });
    // 合計を下に表示
    out += `<text x="${BAR_X}" y="${BAR_Y + BAR_H + 22}" font-size="11" fill="#6b7280">合計</text>`;
    out += `<text x="${BAR_X + BAR_W}" y="${BAR_Y + BAR_H + 22}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="end">${unitFmt(total)}</text>`;
    svg.innerHTML = out;
  }

  const showError = (msg) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
  };

  // ===== 入力内容のブラウザ内保存(サーバーには送信しない。ファイル保存/読込・入力データクリアの対象) =====
  const STORAGE_KEY = 'bpl_tax_exemption_v1';
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      form.querySelectorAll('input[id], select[id]').forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    form.querySelectorAll('input[id], select[id]').forEach(function (el) {
      if (el.value !== '') data[el.id] = el.value;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const pnum = (v) => (window.numClean ? window.numClean(v) : parseFloat(v));

    const MAX_YEN = 99999999; // 円(保険料)の上限
    const MAX_MAN = 999999; // 万円(金額)の上限
    const MAX_HEIRS = 100; // 法定相続人の数の上限

    const premiumValues = {};
    for (const item of PREMIUM_ITEMS) {
      const v = pnum(document.getElementById(item.id).value);
      if (isNaN(v) || v < 0) {
        showError('すべての項目を入力してください。');
        document.getElementById(item.id).focus();
        return;
      }
      if (v > MAX_YEN) {
        showError(`保険料は ${MAX_YEN.toLocaleString('ja-JP')} 円以内で入力してください。`);
        document.getElementById(item.id).focus();
        return;
      }
      premiumValues[item.id] = v;
    }

    const heirs = pnum(document.getElementById('txHeirs').value);
    const deathBenefit = pnum(document.getElementById('txDeathBenefit').value);
    const retirementBenefit = pnum(document.getElementById('txRetirementBenefit').value);
    const salaryMonthly = pnum(document.getElementById('txSalaryMonthly').value);
    const deathCause = document.getElementById('txDeathCause').value;
    const maturityAmount = pnum(document.getElementById('txMaturityAmount').value);
    const paidPremiumTotal = pnum(document.getElementById('txPaidPremiumTotal').value);

    const rest = [heirs, deathBenefit, retirementBenefit, salaryMonthly, maturityAmount, paidPremiumTotal];
    if (rest.some((v) => isNaN(v) || v < 0)) {
      showError('すべての項目を入力してください。');
      return;
    }
    const overLimit = [
      { v: heirs, max: MAX_HEIRS, el: document.getElementById('txHeirs') },
      { v: deathBenefit, max: MAX_MAN, el: document.getElementById('txDeathBenefit') },
      { v: retirementBenefit, max: MAX_MAN, el: document.getElementById('txRetirementBenefit') },
      { v: salaryMonthly, max: MAX_MAN, el: document.getElementById('txSalaryMonthly') },
      { v: maturityAmount, max: MAX_MAN, el: document.getElementById('txMaturityAmount') },
      { v: paidPremiumTotal, max: MAX_MAN, el: document.getElementById('txPaidPremiumTotal') },
    ];
    for (const c of overLimit) {
      if (c.v > c.max) {
        showError(`入力値が上限(${c.max.toLocaleString('ja-JP')})を超えています。数値をご確認ください。`);
        c.el.focus();
        return;
      }
    }

    // ---- 1. 生命保険料控除 ----
    const tbody = document.getElementById('txPremiumBody');
    const pBody = document.getElementById('pPremiumBody');
    tbody.innerHTML = '';
    pBody.innerHTML = '';

    let incomeTaxSum = 0;
    let residentTaxSum = 0;
    for (const item of PREMIUM_ITEMS) {
      const p = premiumValues[item.id];
      const it = incomeTaxDeduction(p);
      const rt = residentTaxDeduction(p);
      incomeTaxSum += it;
      residentTaxSum += rt;

      const tr = document.createElement('tr');
      tr.className = 'border-b border-gray-100';
      tr.innerHTML = `
        <td class="px-3 py-1.5 text-gray-800">${item.label}</td>
        <td class="px-3 py-1.5 text-right">${yen(p)}</td>
        <td class="px-3 py-1.5 text-right">${yen(it)}</td>
        <td class="px-3 py-1.5 text-right">${yen(rt)}</td>
      `;
      tbody.appendChild(tr);

      const ptr = document.createElement('tr');
      ptr.innerHTML = `<td class="lbl">${item.label}</td><td>${yen(p)}</td><td>${yen(it)}</td><td>${yen(rt)}</td>`;
      pBody.appendChild(ptr);
    }
    const incomeTaxTotal = Math.min(incomeTaxSum, 120000);
    const residentTaxTotal = Math.min(residentTaxSum, 70000);

    document.getElementById('txIncomeTaxTotal').textContent = yen(incomeTaxTotal);
    document.getElementById('txResidentTaxTotal').textContent = yen(residentTaxTotal);
    document.getElementById('pIncomeTaxTotal').textContent = yen(incomeTaxTotal);
    document.getElementById('pResidentTaxTotal').textContent = yen(residentTaxTotal);

    // ---- 2. 相続税の非課税枠 ----
    const exemptionEach = 500 * heirs;
    const usedDeathBenefit = Math.min(deathBenefit, exemptionEach);
    const taxableDeathBenefit = Math.max(0, deathBenefit - exemptionEach);
    const usedRetirementBenefit = Math.min(retirementBenefit, exemptionEach);
    const taxableRetirementBenefit = Math.max(0, retirementBenefit - exemptionEach);

    document.getElementById('txExemptionEach').textContent = man(exemptionEach);
    document.getElementById('pExemptionEach').textContent = man(exemptionEach);
    const deathBenefitText = `使用 ${man(usedDeathBenefit)} / 課税対象 ${man(taxableDeathBenefit)}`;
    const retirementText = `使用 ${man(usedRetirementBenefit)} / 課税対象 ${man(taxableRetirementBenefit)}`;
    document.getElementById('txDeathBenefitResult').textContent = deathBenefitText;
    document.getElementById('pDeathBenefitResult').textContent = deathBenefitText;
    document.getElementById('txRetirementResult').textContent = retirementText;
    document.getElementById('pRetirementResult').textContent = retirementText;

    // ---- 3. 弔慰金の非課税枠 ----
    const multiplier = deathCause === 'on' ? 36 : 6;
    const condolenceExemption = salaryMonthly * multiplier;
    const condolenceText = `${man(condolenceExemption)}(${multiplier}ヶ月分)`;
    document.getElementById('txCondolenceResult').textContent = condolenceText;
    document.getElementById('pCondolenceResult').textContent = condolenceText;

    // ---- 4. 一時所得の課税対象額 ----
    const oneTimeIncome = Math.max(0, maturityAmount - paidPremiumTotal - 50);
    const oneTimeTaxable = oneTimeIncome / 2;
    document.getElementById('txOneTimeIncome').textContent = man(oneTimeIncome);
    document.getElementById('pOneTimeIncome').textContent = man(oneTimeIncome);
    document.getElementById('txOneTimeTaxable').textContent = man(oneTimeTaxable);
    document.getElementById('pOneTimeTaxable').textContent = man(oneTimeTaxable);

    // ---- 5. 税負担の軽減額(お得になる金額) ----
    const sheet = refreshIncomeSheet();
    if (!sheet) {
      showError('「1. 所得税・住民税の計算」の収入・所得控除を入力してください。');
      return;
    }
    const inheritanceRate = pnum(document.getElementById('txInheritanceRate').value);
    if (isNaN(inheritanceRate) || inheritanceRate < 0) {
      showError('「2. 相続税の前提」の相続税率を入力してください。');
      document.getElementById('txInheritanceRate').focus();
      return;
    }
    if (inheritanceRate > 100) {
      showError('相続税率は100%以内で入力してください。');
      document.getElementById('txInheritanceRate').focus();
      return;
    }

    // 所得税・住民税: 生命保険料控除を適用した後の税額との差額(=正確な軽減額)
    // incomeTaxTotal / residentTaxTotal は円単位なので万円に換算して課税所得から差し引く
    const lifeDedItMan = incomeTaxTotal / 10000;
    const lifeDedRtMan = residentTaxTotal / 10000;
    const taxableItAfter = floorTaxable(sheet.taxableIt - lifeDedItMan);
    const taxableRtAfter = floorTaxable(sheet.taxableRt - lifeDedRtMan);
    const taxItAfter = incomeTaxAmount(taxableItAfter);
    const taxRtAfter = taxableRtAfter > 0 ? taxableRtAfter * RESIDENT_TAX_RATE / 100 + RESIDENT_PER_CAPITA : 0;
    // 万円→円に戻して表示(既存の yen() 表示に合わせる)
    const saveIncomeTax = Math.max(0, sheet.taxIt - taxItAfter) * 10000;
    const saveResidentTax = Math.max(0, sheet.taxRt - taxRtAfter) * 10000;
    const saveIncomeSum = saveIncomeTax + saveResidentTax;
    const incomeRate = marginalIncomeTaxRate(sheet.taxableIt);

    // 相続税: 非課税となった財産額 × 相続税率(相続時に一度効く軽減)
    const usedCondolence = condolenceExemption; // 限度額まで支給した場合
    const saveDeath = usedDeathBenefit * inheritanceRate / 100;
    const saveRetire = usedRetirementBenefit * inheritanceRate / 100;
    const saveCondolence = usedCondolence * inheritanceRate / 100;
    const saveInheritSum = saveDeath + saveRetire + saveCondolence;
    const exemptAmountTotal = usedDeathBenefit + usedRetirementBenefit + usedCondolence;

    document.getElementById('txSaveIncomeTotal').textContent = yen(saveIncomeSum) + ' / 年';
    document.getElementById('txSaveIncomeTax').textContent = yen(saveIncomeTax) + `（${man(sheet.taxIt)} → ${man(taxItAfter)}）`;
    document.getElementById('txSaveResidentTax').textContent = yen(saveResidentTax) + `（${man(sheet.taxRt)} → ${man(taxRtAfter)}）`;
    document.getElementById('txSave10y').textContent = yen(saveIncomeSum * 10);

    document.getElementById('txSaveInheritTotal').textContent = man(saveInheritSum);
    document.getElementById('txSaveDeath').textContent = man(saveDeath) + `（非課税 ${man(usedDeathBenefit)}）`;
    document.getElementById('txSaveRetire').textContent = man(saveRetire) + `（非課税 ${man(usedRetirementBenefit)}）`;
    document.getElementById('txSaveCondolence').textContent = man(saveCondolence) + `（非課税 ${man(usedCondolence)}）`;
    document.getElementById('txExemptTotalAmount').textContent = man(exemptAmountTotal);

    renderSaveChart('txChartIncome', [
      { label: '所得税', value: saveIncomeTax, color: '#0f2a4a' },
      { label: '住民税', value: saveResidentTax, color: '#3b6ea5' },
    ], yen);
    renderSaveChart('txChartInherit', [
      { label: '生命保険金', value: saveDeath, color: '#0f2a4a' },
      { label: '死亡退職金', value: saveRetire, color: '#3b6ea5' },
      { label: '弔慰金', value: saveCondolence, color: '#7a9cc0' },
    ], man);

    // ---- サマリー ----
    document.getElementById('txSummaryPremium').textContent = `${yen(incomeTaxTotal)} + ${yen(residentTaxTotal)}`;
    document.getElementById('txSummaryInheritance').textContent = man(exemptionEach + exemptionEach + condolenceExemption);

    lastResult = { incomeTaxTotal, residentTaxTotal, saveIncomeSum, saveInheritSum };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    saveCurrentValues();
  });

  // ===== 入力データクリア(保存データも含めて完全に消去。誤操作防止のため必ず確認する) =====
  function doClearFields() {
    form.querySelectorAll('input[id]').forEach(function (el) { el.value = ''; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    resultArea.classList.add('hidden');
    clearError();
  }
  const clearBtn = document.getElementById('txClearBtn');
  if (window.armHeroClearBtn) window.armHeroClearBtn(clearBtn, doClearFields);
  const fieldClearBtn = document.getElementById('txFieldClearBtn');
  if (fieldClearBtn) {
    fieldClearBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容をすべてクリアします。保存されているデータも削除されます。よろしいですか？')) return;
      doClearFields();
    });
  }

  // ===== PDF出力 =====
  function doPrint() {
    if (!lastResult) {
      showError('先に「試算する」を押して結果を表示してください。');
      return;
    }
    const now = new Date();
    document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: 保存済みデータがあれば復元し、自動試算(スクロールは抑制) =====
  loadSavedValues();
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

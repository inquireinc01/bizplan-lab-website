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

    // ---- サマリー ----
    document.getElementById('txSummaryPremium').textContent = `${yen(incomeTaxTotal)} + ${yen(residentTaxTotal)}`;
    document.getElementById('txSummaryInheritance').textContent = man(exemptionEach + exemptionEach + condolenceExemption);

    lastResult = { incomeTaxTotal, residentTaxTotal };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    saveCurrentValues();
  });

  // ===== 入力データクリア(保存データも含めて完全に消去。誤操作防止のため必ず確認する) =====
  function clearAllFields() {
    if (!window.confirm('入力内容をすべてクリアします。保存されているデータも削除されます。よろしいですか？')) return;
    form.querySelectorAll('input[id]').forEach(function (el) { el.value = ''; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    resultArea.classList.add('hidden');
    clearError();
  }
  const clearBtn = document.getElementById('txClearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFields);
  const fieldClearBtn = document.getElementById('txFieldClearBtn');
  if (fieldClearBtn) fieldClearBtn.addEventListener('click', clearAllFields);

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

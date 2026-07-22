document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('retirementForm');
  if (!form) return;

  const resultArea = document.getElementById('rbResultArea');
  const errorArea = document.getElementById('rbErrorArea');
  let suppressScroll = false;
  let lastResult = null;

  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat((el.value || '').replace(/,/g, ''));
    return { value: v, el };
  };

  const man = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 万円';

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
  const STORAGE_KEY = 'bpl_retirement_benefit_v1';
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      form.querySelectorAll('input[id]').forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    form.querySelectorAll('input[id]').forEach(function (el) {
      if (el.value !== '') data[el.id] = el.value;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  // 2024年分 所得税速算表(円ベース)
  function incomeTaxJP(taxableIncomeYen) {
    const x = Math.max(0, taxableIncomeYen);
    const brackets = [
      [1950000, 0.05, 0],
      [3300000, 0.10, 97500],
      [6950000, 0.20, 427500],
      [9000000, 0.23, 636000],
      [18000000, 0.33, 1536000],
      [40000000, 0.40, 2796000],
      [Infinity, 0.45, 4796000],
    ];
    for (const [limit, rate, deduction] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - deduction);
    }
    return 0;
  }

  // 給与所得控除額(円ベース、2020年分以降)
  function salaryDeductionJP(incomeYen) {
    const x = Math.max(0, incomeYen);
    if (x <= 1625000) return 550000;
    if (x <= 1800000) return x * 0.4 - 100000;
    if (x <= 3600000) return x * 0.3 + 80000;
    if (x <= 6600000) return x * 0.2 + 440000;
    if (x <= 8500000) return x * 0.1 + 1100000;
    return 1950000;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const finalMonthlySalary = num('finalMonthlySalary');
    const yearsOfService = num('yearsOfService');
    const meritMultiplier = num('meritMultiplier');
    const meritAddRate = num('meritAddRate');
    const surrenderValue = num('surrenderValue');
    const bookValue = num('bookValue');
    const corpTaxRateRb = num('corpTaxRateRb');

    const fields = { finalMonthlySalary, yearsOfService, meritMultiplier, meritAddRate, surrenderValue, bookValue, corpTaxRateRb };
    // 各項目の上限(桁あふれ・結果表示崩れ防止)。金額=万円、年数=年、倍率=倍、率=%
    const limits = {
      finalMonthlySalary: 999999, surrenderValue: 999999, bookValue: 999999,
      yearsOfService: 100, meritMultiplier: 100,
      meritAddRate: 1000, corpTaxRateRb: 1000,
    };
    for (const [key, field] of Object.entries(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください。');
        field.el.focus();
        return;
      }
      if (Math.abs(field.value) > limits[key]) {
        showError(`入力値が上限(${limits[key].toLocaleString('ja-JP')})を超えています。数値をご確認ください。`);
        field.el.focus();
        return;
      }
    }

    // --- 1. 功績倍率法による退職金額(万円) ---
    const retirementAmount = finalMonthlySalary.value * yearsOfService.value * meritMultiplier.value * (1 + meritAddRate.value / 100);
    document.getElementById('retirementAmountDisplay').textContent = Math.round(retirementAmount).toLocaleString('ja-JP');

    // --- 2. 法人側への影響(参考) ---
    const corpGain = Math.max(0, surrenderValue.value - bookValue.value); // 保険差益(益金算入額)
    const corpDeduction = retirementAmount; // 退職金の損金算入額
    const corpTaxImpact = (corpGain - corpDeduction) * corpTaxRateRb.value / 100; // マイナス=節税、プラス=追加負担

    // --- 3. 個人の税務比較(円ベースで計算) ---
    const incomeYen = retirementAmount * 10000;

    // A. 給与として一括受給
    const aDeductionYen = salaryDeductionJP(incomeYen);
    const aSalaryIncomeYen = Math.max(0, incomeYen - aDeductionYen);
    const aTaxableYen = Math.max(0, aSalaryIncomeYen - 480000); // 基礎控除48万円
    const aIncomeTaxYen = incomeTaxJP(aTaxableYen);
    const aResidentTaxYen = aTaxableYen * 0.10;
    const aNetYen = incomeYen - aIncomeTaxYen - aResidentTaxYen;

    // B. 退職金として一括受給
    const years = Math.max(0, yearsOfService.value);
    const bDeductionYen = years <= 20 ? years * 400000 : 8000000 + (years - 20) * 700000;
    const bBaseYen = Math.max(0, incomeYen - bDeductionYen);
    const bTaxableYen = bBaseYen * 0.5;
    const bIncomeTaxYen = incomeTaxJP(bTaxableYen);
    const bResidentTaxYen = bTaxableYen * 0.10;
    const bNetYen = incomeYen - bIncomeTaxYen - bResidentTaxYen;

    const aNet = aNetYen / 10000;
    const bNet = bNetYen / 10000;
    const diff = bNet - aNet;

    // --- 結果表示 ---
    document.getElementById('rbCorpDeduction').textContent = man(corpDeduction);
    document.getElementById('rbCorpGain').textContent = man(corpGain);
    const corpTaxImpactEl = document.getElementById('rbCorpTaxImpact');
    corpTaxImpactEl.textContent = (corpTaxImpact >= 0 ? '+' : '') + man(corpTaxImpact);

    document.getElementById('aIncome').textContent = man(retirementAmount);
    document.getElementById('aDeduction').textContent = man(aDeductionYen / 10000);
    document.getElementById('aTaxable').textContent = man(aTaxableYen / 10000);
    document.getElementById('aIncomeTax').textContent = man(aIncomeTaxYen / 10000);
    document.getElementById('aResidentTax').textContent = man(aResidentTaxYen / 10000);
    document.getElementById('aNet').textContent = man(aNet);

    document.getElementById('bIncome').textContent = man(retirementAmount);
    document.getElementById('bDeduction').textContent = man(bDeductionYen / 10000);
    document.getElementById('bTaxable').textContent = man(bTaxableYen / 10000);
    document.getElementById('bIncomeTax').textContent = man(bIncomeTaxYen / 10000);
    document.getElementById('bResidentTax').textContent = man(bResidentTaxYen / 10000);
    document.getElementById('bNet').textContent = man(bNet);

    document.getElementById('sumA').textContent = man(aNet);
    document.getElementById('sumB').textContent = man(bNet);
    const diffEl = document.getElementById('sumDiff');
    diffEl.textContent = (diff >= 0 ? '+' : '') + man(diff);
    diffEl.style.color = diff >= 0 ? '#7bb0dc' : '#d9807f';

    const maxVal = Math.max(aNet, bNet, 1);
    document.getElementById('barA').style.width = Math.max(0, (aNet / maxVal) * 100) + '%';
    document.getElementById('barB').style.width = Math.max(0, (bNet / maxVal) * 100) + '%';
    document.getElementById('barB').style.backgroundColor = bNet >= aNet ? '#7bb0dc' : '#d9807f';

    lastResult = { diff };

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
  const clearBtn = document.getElementById('rbClearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFields);
  const fieldClearBtn = document.getElementById('rbFieldClearBtn');
  if (fieldClearBtn) fieldClearBtn.addEventListener('click', clearAllFields);

  // ===== PDF出力 =====
  function doPrint() {
    if (!lastResult) {
      showError('先に「比較する」を押して結果を表示してください。');
      return;
    }
    const now = new Date();
    document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const copy = (fromId, toId) => {
      document.getElementById(toId).textContent = document.getElementById(fromId).textContent;
    };
    copy('rbCorpDeduction', 'pRbCorpDeduction');
    copy('rbCorpGain', 'pRbCorpGain');
    copy('rbCorpTaxImpact', 'pRbCorpTaxImpact');
    copy('aIncome', 'pAIncome');
    copy('aDeduction', 'pADeduction');
    copy('aTaxable', 'pATaxable');
    copy('aIncomeTax', 'pAIncomeTax');
    copy('aResidentTax', 'pAResidentTax');
    copy('aNet', 'pANet');
    copy('bIncome', 'pBIncome');
    copy('bDeduction', 'pBDeduction');
    copy('bTaxable', 'pBTaxable');
    copy('bIncomeTax', 'pBIncomeTax');
    copy('bResidentTax', 'pBResidentTax');
    copy('bNet', 'pBNet');
    copy('sumA', 'pSumA');
    copy('sumB', 'pSumB');
    copy('sumDiff', 'pSumDiff');

    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: 保存済みデータがあれば復元し、自動試算(スクロールは抑制) =====
  loadSavedValues();
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

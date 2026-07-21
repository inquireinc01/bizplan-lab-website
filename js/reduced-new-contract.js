document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('rncForm');
  if (!form) return;

  const resultArea = document.getElementById('rncResultArea');
  const errorArea = document.getElementById('rncErrorArea');
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const oldBefore = num('oldBefore');
    const oldAfter = num('oldAfter');
    const bookReduction = num('bookReduction');
    const newPremium = num('newPremium');
    const deductibleRate = num('deductibleRate');
    const corpTaxRateRnc = num('corpTaxRateRnc');

    const fields = { oldBefore, oldAfter, bookReduction, newPremium, deductibleRate, corpTaxRateRnc };
    const MAX_MAN = 999999; // 万円(金額)の上限
    const MAX_RATE = 1000; // %(率)の上限
    const rateKeys = ['deductibleRate', 'corpTaxRateRnc'];
    for (const [key, field] of Object.entries(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください。');
        field.el.focus();
        return;
      }
      const isRate = rateKeys.indexOf(key) >= 0;
      const limit = isRate ? MAX_RATE : MAX_MAN;
      if (Math.abs(field.value) > limit) {
        showError(isRate ? `率は ${MAX_RATE.toLocaleString('ja-JP')}% 以内で入力してください。` : `金額は ${MAX_MAN.toLocaleString('ja-JP')} 万円以内で入力してください。`);
        field.el.focus();
        return;
      }
    }

    const fundedAmount = Math.max(0, oldBefore.value - oldAfter.value); // 減額により捻出される原資
    document.getElementById('fundedAmountDisplay').textContent = Math.round(fundedAmount).toLocaleString('ja-JP');

    const miscIncome = Math.max(0, fundedAmount - bookReduction.value); // 雑収入(益金算入額)
    const annualDeduction = newPremium.value * deductibleRate.value / 100; // 新契約保険料の損金算入額
    const taxImpact = (miscIncome - annualDeduction) * corpTaxRateRnc.value / 100; // 初年度の法人税影響
    const fundedYears = newPremium.value > 0 ? fundedAmount / newPremium.value : 0;

    document.getElementById('rncFunded').textContent = man(fundedAmount);
    document.getElementById('rncMisc').textContent = man(miscIncome);
    document.getElementById('rncDeduction').textContent = man(annualDeduction);
    const taxImpactEl = document.getElementById('rncTaxImpact');
    taxImpactEl.textContent = (taxImpact >= 0 ? '+' : '') + man(taxImpact);
    document.getElementById('rncFundedYears').textContent = fundedYears.toFixed(1) + ' 年分';

    const summaryTaxEl = document.getElementById('rncSummaryTax');
    summaryTaxEl.textContent = (taxImpact >= 0 ? '+' : '') + man(taxImpact);
    summaryTaxEl.style.color = taxImpact > 0 ? '#d9807f' : '#7bb0dc';
    document.getElementById('rncSummaryNote').textContent = taxImpact > 0
      ? '初年度は追加の法人税負担が生じますが、新契約の保険料は翌年度以降も継続的に損金算入されます。'
      : '雑収入を新契約の保険料で相殺できているため、初年度から法人税の負担軽減が見込めます。';

    lastResult = { taxImpact };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.getElementById('rncResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      resultArea.classList.add('hidden');
      clearError();
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

    const copy = (fromId, toId) => {
      document.getElementById(toId).textContent = document.getElementById(fromId).textContent;
    };
    copy('rncFunded', 'pRncFunded');
    copy('rncMisc', 'pRncMisc');
    copy('rncDeduction', 'pRncDeduction');
    copy('rncTaxImpact', 'pRncTaxImpact');
    copy('rncFundedYears', 'pRncFundedYears');

    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: ダミー値で自動試算(スクロールは抑制) =====
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

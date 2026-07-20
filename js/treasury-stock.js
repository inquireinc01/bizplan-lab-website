document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('treasuryForm');
  if (!form) return;

  const resultArea = document.getElementById('tsResultArea');
  const errorArea = document.getElementById('tsErrorArea');
  let suppressScroll = false;

  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat((el.value || '').replace(/,/g, ''));
    return { value: v, el };
  };

  const man = (n) => Math.round(n).toLocaleString('ja-JP') + ' 万円';

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

    const cash = num('cash');
    const capital = num('capital');
    const corpTaxRate = num('corpTaxRate');
    const incomeTaxRate = num('incomeTaxRate');
    const inheritanceTaxRate = num('inheritanceTaxRate');
    const stockInheritanceValue = num('stockInheritanceValue');
    const stockCorpValue = num('stockCorpValue');
    const insuranceGainRate = num('insuranceGainRate');

    const fields = { cash, capital, corpTaxRate, incomeTaxRate, inheritanceTaxRate, stockInheritanceValue, stockCorpValue, insuranceGainRate };
    for (const field of Object.values(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください。');
        field.el.focus();
        return;
      }
    }

    // --- ① 給与を原資として自社株の相続税を負担する場合 ---
    const s1_salary = cash.value; // 給与として全額支給
    const s1_salaryTax = s1_salary * incomeTaxRate.value / 100; // 所得税・住民税・社保
    const s1_presidentNet = s1_salary - s1_salaryTax; // 社長の手残り
    const s1_insuranceGain = s1_presidentNet * insuranceGainRate.value / 100; // 保険差益
    const s1_afterInsurance = s1_presidentNet + s1_insuranceGain;
    const s1_cashInheritanceTax = s1_afterInsurance * inheritanceTaxRate.value / 100; // 現金の相続税
    const s1_afterCashTax = s1_afterInsurance - s1_cashInheritanceTax;
    const s1_stockInheritanceTax = stockInheritanceValue.value * inheritanceTaxRate.value / 100; // 自社株の相続税
    const s1_final = s1_afterCashTax - s1_stockInheritanceTax; // 遺族の最終手残り(法人残高は0)

    // --- ② 金庫株を原資として自社株の相続税を負担する場合 ---
    const s2_corpTax = cash.value * corpTaxRate.value / 100; // 法人税
    const s2_afterCorpTax = cash.value - s2_corpTax;
    const s2_insuranceGain = s2_afterCorpTax * insuranceGainRate.value / 100; // 保険差益
    const s2_insuranceTax = s2_insuranceGain * corpTaxRate.value / 100; // 保険差益への法人税
    const s2_corpAfterInsurance = s2_insuranceGain - s2_insuranceTax + s2_afterCorpTax;
    const s2_buyback = stockCorpValue.value; // 遺族から自社株買い(法人税法上評価額で買取)
    const s2_corpFinal = s2_corpAfterInsurance - s2_buyback; // 法人の最終残高

    const s2_individualProceeds = stockCorpValue.value; // 金庫株売却収入
    const s2_stockInheritanceTax = stockInheritanceValue.value * inheritanceTaxRate.value / 100; // 自社株の相続税
    const s2_afterInheritanceTax = s2_individualProceeds - s2_stockInheritanceTax;
    const s2_capitalGainsTax = (stockCorpValue.value - capital.value - s2_stockInheritanceTax) * 0.2; // 譲渡所得税等(取得費加算の特例)
    const s2_individualFinal = s2_afterInheritanceTax - s2_capitalGainsTax; // 個人の最終手残り

    const s2_total = s2_corpFinal + s2_individualFinal; // 法人+個人 合計残高
    const s1_total = s1_final; // 法人残高0のため個人のみ

    // --- 結果表示 ---
    document.getElementById('s1Salary').textContent = man(s1_salary);
    document.getElementById('s1SalaryTax').textContent = man(s1_salaryTax);
    document.getElementById('s1PresidentNet').textContent = man(s1_presidentNet);
    document.getElementById('s1InsuranceGain').textContent = man(s1_insuranceGain);
    document.getElementById('s1CashTax').textContent = man(s1_cashInheritanceTax);
    document.getElementById('s1StockTax').textContent = man(s1_stockInheritanceTax);
    document.getElementById('s1Final').textContent = man(s1_final);

    document.getElementById('s2CorpTax').textContent = man(s2_corpTax);
    document.getElementById('s2InsuranceGain').textContent = man(s2_insuranceGain);
    document.getElementById('s2InsuranceTax').textContent = man(s2_insuranceTax);
    document.getElementById('s2Buyback').textContent = man(s2_buyback);
    document.getElementById('s2CorpFinal').textContent = man(s2_corpFinal);
    document.getElementById('s2StockTax').textContent = man(s2_stockInheritanceTax);
    document.getElementById('s2CapitalGainsTax').textContent = man(s2_capitalGainsTax);
    document.getElementById('s2IndividualFinal').textContent = man(s2_individualFinal);
    document.getElementById('s2Total').textContent = man(s2_total);

    document.getElementById('sumS1Total').textContent = man(s1_total);
    document.getElementById('sumS2Total').textContent = man(s2_total);
    const diff = s2_total - s1_total;
    const diffEl = document.getElementById('sumDiff');
    diffEl.textContent = (diff >= 0 ? '+' : '') + man(diff);
    diffEl.style.color = diff >= 0 ? '#7bb0dc' : '#d9807f';

    const maxVal = Math.max(s1_total, s2_total, 1);
    document.getElementById('barS1').style.width = Math.max(0, (s1_total / maxVal) * 100) + '%';
    document.getElementById('barS2').style.width = Math.max(0, (s2_total / maxVal) * 100) + '%';
    document.getElementById('barS2').style.backgroundColor = s2_total >= s1_total ? '#7bb0dc' : '#d9807f';

    lastResult = { diff };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.getElementById('tsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      resultArea.classList.add('hidden');
      clearError();
    });
  }

  // ===== PDF出力 =====
  let lastResult = null;
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
      copy('s1Salary', 'pS1Salary');
      copy('s1SalaryTax', 'pS1SalaryTax');
      copy('s1PresidentNet', 'pS1PresidentNet');
      copy('s1InsuranceGain', 'pS1InsuranceGain');
      copy('s1CashTax', 'pS1CashTax');
      copy('s1StockTax', 'pS1StockTax');
      copy('s1Final', 'pS1Final');
      copy('s2CorpTax', 'pS2CorpTax');
      copy('s2InsuranceGain', 'pS2InsuranceGain');
      copy('s2InsuranceTax', 'pS2InsuranceTax');
      copy('s2Buyback', 'pS2Buyback');
      copy('s2CorpFinal', 'pS2CorpFinal');
      copy('s2StockTax', 'pS2StockTax');
      copy('s2CapitalGainsTax', 'pS2CapitalGainsTax');
      copy('s2IndividualFinal', 'pS2IndividualFinal');
      copy('s2Total', 'pS2Total');
      copy('sumS1Total', 'pSumS1');
      copy('sumS2Total', 'pSumS2');
      copy('sumDiff', 'pSumDiff');

      window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: ダミー値で自動試算(スクロールは抑制) =====
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

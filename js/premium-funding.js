document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('pfForm');
  if (!form) return;

  const resultArea = document.getElementById('pfResultArea');
  const errorArea = document.getElementById('pfErrorArea');
  let suppressScroll = false;
  let lastResult = null;

  const ITEMS = [
    { id: 'entertainment', label: '交際費', fsField: 'sga_entertainmentExpenses_1', defaultAmount: 120, defaultRate: 10 },
    { id: 'travel', label: '旅費交通費', fsField: 'sga_travelExpenses_1', defaultAmount: 80, defaultRate: 10 },
    { id: 'rent', label: '地代・家賃', fsField: 'sga_rent_1', defaultAmount: 180, defaultRate: 5 },
    { id: 'welfare', label: '福利厚生費', fsField: 'sga_welfare_1', defaultAmount: 60, defaultRate: 10 },
    { id: 'statutoryWelfare', label: '法定福利費', fsField: 'sga_statutoryWelfare_1', defaultAmount: 150, defaultRate: 5 },
    { id: 'lifeInsurance', label: '生命保険料', fsField: 'sga_insurancePremium_1', defaultAmount: 100, defaultRate: 15 },
    { id: 'casualtyInsurance', label: '損害保険料', fsField: null, defaultAmount: 30, defaultRate: 15 },
  ];

  // 決算書情報(financial-statements.html)のlocalStorageから直前期の値を読み込む(円→万円)
  function loadFsValue(fsField) {
    if (!fsField) return null;
    try {
      const raw = localStorage.getItem('bpl_financial_statements_v1');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data[fsField] === undefined) return null;
      const yen = parseFloat(data[fsField]);
      if (isNaN(yen)) return null;
      return Math.round(yen / 10000);
    } catch (e) {
      return null;
    }
  }

  // 役員報酬の現況額も決算書情報から自動反映
  const execFromFs = loadFsValue('sga_executiveCompensation_1');
  if (execFromFs !== null) {
    document.getElementById('execCompCurrent').value = execFromFs;
  }

  // テーブル行を動的に生成
  const tbody = document.getElementById('pfItemsBody');
  ITEMS.forEach((item) => {
    const fsAmount = loadFsValue(item.fsField);
    const amount = fsAmount !== null ? fsAmount : item.defaultAmount;
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100';
    tr.innerHTML = `
      <td class="px-3 py-1.5 text-gray-800">${item.label}</td>
      <td class="px-1 py-1"><input type="number" id="pf_${item.id}_amount" value="${amount}" class="pf-amount form-input w-full rounded px-2 py-1.5 text-right text-sm" /></td>
      <td class="px-1 py-1"><input type="number" id="pf_${item.id}_rate" value="${item.defaultRate}" step="1" class="pf-rate form-input w-full rounded px-2 py-1.5 text-right text-sm" /></td>
      <td class="px-3 py-1.5 text-right font-bold text-[#0f2a4a]" id="pf_${item.id}_result">-</td>
    `;
    tbody.appendChild(tr);
  });

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

    const execCompShift = parseFloat(document.getElementById('execCompShift').value);
    const socialInsRate = parseFloat(document.getElementById('socialInsRate').value);
    if (isNaN(execCompShift) || isNaN(socialInsRate)) {
      showError('すべての項目を入力してください。');
      return;
    }

    const execSaving = execCompShift * socialInsRate / 100;

    let expenseTotal = 0;
    const breakdownList = document.getElementById('pfBreakdownList');
    breakdownList.innerHTML = '';
    const pBreakdownBody = document.getElementById('pBreakdownBody');
    pBreakdownBody.innerHTML = '';

    const addBreakdownRow = (label, amountText, resultText) => {
      const dt = document.createElement('div');
      dt.className = 'flex justify-between';
      dt.innerHTML = `<dt class="text-gray-500">${label}</dt><dd class="font-bold text-[#0f2a4a]">${resultText}</dd>`;
      breakdownList.appendChild(dt);

      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="lbl">${label}</td><td>${amountText}</td><td>${resultText}</td>`;
      pBreakdownBody.appendChild(tr);
    };

    addBreakdownRow('役員報酬(社会保険料削減分)', man(execCompShift) + ' 振替', man(execSaving));

    for (const item of ITEMS) {
      const amountEl = document.getElementById(`pf_${item.id}_amount`);
      const rateEl = document.getElementById(`pf_${item.id}_rate`);
      const amount = parseFloat(amountEl.value);
      const rate = parseFloat(rateEl.value);
      if (isNaN(amount) || isNaN(rate)) {
        showError('すべての項目を入力してください。');
        amountEl.focus();
        return;
      }
      const saving = amount * rate / 100;
      expenseTotal += saving;
      document.getElementById(`pf_${item.id}_result`).textContent = man(saving);
      addBreakdownRow(item.label, man(amount), man(saving));
    }

    const total = execSaving + expenseTotal;

    document.getElementById('pfSumExec').textContent = man(execSaving);
    document.getElementById('pfSumExpense').textContent = man(expenseTotal);
    document.getElementById('pfTotal').textContent = man(total) + ' / 年';
    document.getElementById('pfMonthly').textContent = man(total / 12) + ' / 月';

    lastResult = { total };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.getElementById('pfResetBtn');
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
      showError('先に「創出額を試算する」を押して結果を表示してください。');
      return;
    }
    const now = new Date();
    document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    document.getElementById('pSumExec').textContent = document.getElementById('pfSumExec').textContent;
    document.getElementById('pSumExpense').textContent = document.getElementById('pfSumExpense').textContent;
    document.getElementById('pTotal').textContent = document.getElementById('pfTotal').textContent;
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: ダミー値で自動試算(スクロールは抑制) =====
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

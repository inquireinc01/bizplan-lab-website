(function () {
  var STORAGE_KEY = 'bpl_financial_statements_v1';
  var form = document.getElementById('financialStatementsForm');
  if (!form) return;

  var inputs = form.querySelectorAll('.fs-input');

  function loadValues() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      inputs.forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }

  function saveValues() {
    var data = {};
    inputs.forEach(function (el) {
      if (el.value !== '') {
        // カンマを除いた実数値で保存(他ツールが数値として読むため)
        var c = window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, ''));
        data[el.id] = isNaN(c) ? el.value : String(c);
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  loadValues();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    saveValues();
    var msg = document.getElementById('fsSavedMsg');
    if (msg) {
      msg.classList.remove('hidden');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  var resetBtn = document.getElementById('fsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容をすべてクリアします。よろしいですか？')) return;
      inputs.forEach(function (el) { el.value = ''; });
      localStorage.removeItem(STORAGE_KEY);
      var msg = document.getElementById('fsSavedMsg');
      if (msg) msg.classList.add('hidden');
    });
  }
})();

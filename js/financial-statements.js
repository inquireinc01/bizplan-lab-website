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

  // 桁あふれ検出用の上限(約10兆円)。決算書は円単位で桁が大きいため、明らかな異常値のみを検出する
  var MAX_YEN = 9999999999999;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // 上限超過の検出(保存はブロックせず、超過欄をマークして注意喚起のみ行う)
    var overCount = 0;
    inputs.forEach(function (el) {
      var c = window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, ''));
      if (!isNaN(c) && Math.abs(c) > MAX_YEN) {
        overCount++;
        el.style.outline = '2px solid var(--color-red)';
      } else {
        el.style.outline = '';
      }
    });
    saveValues();
    var msg = document.getElementById('fsSavedMsg');
    if (msg) {
      if (overCount > 0) {
        msg.textContent = '保存しました。ただし ' + overCount + ' 件の項目が上限(' + MAX_YEN.toLocaleString('ja-JP') + '円)を超えています。赤枠の項目をご確認ください。';
        msg.classList.remove('notice-box');
        msg.classList.add('warning-box');
      } else {
        msg.textContent = '保存しました。';
        msg.classList.remove('warning-box');
        msg.classList.add('notice-box');
      }
      msg.classList.remove('hidden');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  var resetBtn = document.getElementById('fsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容をすべてクリアします。よろしいですか？')) return;
      inputs.forEach(function (el) { el.value = ''; el.style.outline = ''; });
      localStorage.removeItem(STORAGE_KEY);
      var msg = document.getElementById('fsSavedMsg');
      if (msg) msg.classList.add('hidden');
    });
  }
})();

(function () {
  var STORAGE_KEY = 'bpl_basic_info_v1';
  var form = document.getElementById('basicInfoForm');
  if (!form) return;

  var fieldIds = [
    'biRepCompany', 'biBranch', 'biName', 'biNameKana',
    'biPostalCode', 'biAddress1', 'biAddress2', 'biPhone1', 'biPhone2',
    'biWebsite', 'biRegistrationNumber', 'biAdditionalText',
    'biCorpName', 'biFiscalMonth', 'biCorpNumber',
  ];

  function loadValues() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      fieldIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && data[id] !== undefined) el.value = data[id];
      });
    } catch (e) {}
  }

  function saveValues() {
    var data = {};
    fieldIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) data[id] = el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  loadValues();

  // ===== 追加文言の文字数カウンター =====
  var additionalText = document.getElementById('biAdditionalText');
  var additionalTextCount = document.getElementById('biAdditionalTextCount');
  function updateAdditionalTextCount() {
    if (additionalText && additionalTextCount) {
      additionalTextCount.textContent = additionalText.value.length + ' / 1000';
    }
  }
  if (additionalText) {
    updateAdditionalTextCount();
    additionalText.addEventListener('input', updateAdditionalTextCount);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    saveValues();
    var msg = document.getElementById('biSavedMsg');
    if (msg) {
      msg.classList.remove('hidden');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // ===== 全入力データクリア(ヒーロー): 基本情報+決算書情報の保存データを一括削除。
  //       2回押しで確定するトグル確認方式(window.confirm()は使わない) =====
  var allClearBtn = document.getElementById('biAllClearBtn');
  if (window.armHeroClearBtn) {
    window.armHeroClearBtn(allClearBtn, function () {
      try {
        localStorage.removeItem('bpl_basic_info_v1');
        localStorage.removeItem('bpl_financial_statements_v1');
      } catch (e) {}
      location.reload();
    });
  }

  // ===== 入力データクリア(基本情報欄のみ) =====
  var fieldClearBtn = document.getElementById('biFieldClearBtn');
  if (fieldClearBtn) {
    fieldClearBtn.addEventListener('click', function () {
      if (!window.confirm('基本情報の入力内容をクリアします。保存されているデータも削除されます。よろしいですか？')) return;
      fieldIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      updateAdditionalTextCount();
    });
  }
})();

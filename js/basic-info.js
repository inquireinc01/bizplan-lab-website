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
})();

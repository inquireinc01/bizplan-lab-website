(function () {
  var STORAGE_KEY = 'bpl_basic_info_v1';
  var form = document.getElementById('basicInfoForm');
  if (!form) return;

  var fieldIds = ['biRepCompany', 'biBranch', 'biName', 'biNameKana', 'biCorpName', 'biFiscalMonth', 'biCorpNumber'];

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

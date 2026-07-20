document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('dsForm');
  if (!form) return;
  const storageKey = document.body.getAttribute('data-ds-key') || 'bpl_ds_generic';
  const fields = Array.from(form.querySelectorAll('[data-ds-field]'));

  // 基本情報(会社名等)を読み込んで対象名を補完表示
  function loadBasicInfo() {
    try {
      const raw = localStorage.getItem('bpl_basic_info_v1');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function loadValues() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      fields.forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }

  function saveValues() {
    const data = {};
    fields.forEach(function (el) {
      if (el.value !== '') data[el.id] = el.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  loadValues();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    saveValues();
    const msg = document.getElementById('dsSavedMsg');
    if (msg) {
      msg.classList.remove('hidden');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  const resetBtn = document.getElementById('dsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容をすべてクリアします。よろしいですか？')) return;
      fields.forEach(function (el) { el.value = ''; });
      localStorage.removeItem(storageKey);
      const msg = document.getElementById('dsSavedMsg');
      if (msg) msg.classList.add('hidden');
    });
  }

  // ===== PDF出力: 入力内容から印刷シートを組み立てる =====
  function fieldDisplayValue(el) {
    if (el.tagName === 'SELECT') {
      const opt = el.options[el.selectedIndex];
      return opt ? opt.text : '';
    }
    return el.value;
  }

  function buildPrintSheet() {
    const container = document.getElementById('dsPrintSections');
    if (!container) return;
    container.innerHTML = '';

    // 対象法人名・担当者
    const basic = loadBasicInfo();
    const corpEl = document.getElementById('dsPrintCorp');
    if (corpEl) corpEl.textContent = basic.biCorpName || '（未入力）';
    const repEl = document.getElementById('dsPrintRep');
    if (repEl) {
      const rep = [basic.biRepCompany, basic.biName].filter(Boolean).join(' / ');
      repEl.textContent = rep || '（未入力）';
    }

    form.querySelectorAll('.ds-section').forEach(function (section) {
      const titleEl = section.querySelector('.ds-section-title');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const rows = [];
      section.querySelectorAll('[data-ds-field]').forEach(function (el) {
        const label = el.getAttribute('data-ds-label') || '';
        let val = fieldDisplayValue(el);
        const unit = el.getAttribute('data-ds-unit') || '';
        if (val !== '' && unit) val = val + ' ' + unit;
        rows.push('<tr><td class="lbl">' + label + '</td><td>' + (val === '' ? '—' : val) + '</td></tr>');
      });
      if (rows.length === 0) return;
      const html =
        '<div class="print-sec">' + title + '</div>' +
        '<table class="print-table"><thead><tr><th class="lbl">項目</th><th>内容</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody></table>';
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      container.appendChild(wrap);
    });
  }

  function doPrint() {
    const now = new Date();
    const dateEl = document.getElementById('pDate');
    if (dateEl) dateEl.textContent = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
    buildPrintSheet();
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach(function (b) { b.addEventListener('click', doPrint); });
});

document.addEventListener('DOMContentLoaded', function () {
  // 入力データはlocalStorage(お使いのPC・ブラウザ内)にのみ保存され、弊社サーバーには送信されません。
  // ブラウザのキャッシュ削除や別端末での続きの入力に備え、ファイルへの保存/読込を提供します。
  //
  // 保存名(お客様名・案件名)は任意入力。入力すると
  //   1) 保存ファイル名   <日付>_<保存名>_<ツール名短縮>_V100.txt (保存のたびに版番号が自動で+1)
  //   2) PDF出力のファイル名(印刷中だけdocument.titleを差し替え)
  //   3) 印刷シートのヘッダー表記
  // に共通で使われる。未入力ならツール名+日付のみ。サイト内の全ツールで共有する。
  //
  // 保存・読込みはダイアログ(モーダル)方式(2026-08-25指示):
  // 会社PCのセキュリティでWebからのダウンロード自体が禁止されている顧客がいるため、
  // 保存はデータ全文をテキスト表示して「コピー→メモ帳に貼り付けて保存」を基本の経路にし、
  // 通常環境向けに「ファイルとしてダウンロード」(.txt)も併設する。
  // 読込みも「メモ帳から全文コピー→貼り付け」と「ファイルを選ぶ」の両対応。

  var LABEL_KEY = 'bpl_save_label_v1';

  function getLabel() {
    try { return (localStorage.getItem(LABEL_KEY) || '').trim(); } catch (e) { return ''; }
  }
  function sanitize(s) {
    return s.replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '');
  }
  function pageLabel() {
    var t = (document.title || 'bizplanlab').split('|')[0].trim();
    return sanitize(t) || 'bizplanlab';
  }
  function dateStamp() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
  }
  // ツール名の短縮形(「将来負債×生命保険」→「将来負債」。×が無いツール名はそのまま)
  function shortToolName() {
    return pageLabel().split('×')[0] || pageLabel();
  }
  // 推奨ファイル名は「日付_顧客名_ツール名_V100」(2026-08-25指示)。保存名未入力なら顧客名部分を省略。
  // V番号は同じ日付・顧客・ツールで保存するたびにV100→V101…と自動で上がる(このPC内で記憶)
  var VER_KEY = 'bpl_save_ver_v1';
  function saveBase() {
    var label = sanitize(getLabel());
    return dateStamp() + '_' + (label ? label + '_' : '') + shortToolName();
  }
  function peekVersion(base) {
    var map = {};
    try { map = JSON.parse(localStorage.getItem(VER_KEY) || '{}'); } catch (e) {}
    return (map[base] || 99) + 1;
  }
  function commitVersion(base, ver) {
    var map = {};
    try { map = JSON.parse(localStorage.getItem(VER_KEY) || '{}'); } catch (e) {}
    map[base] = ver;
    try { localStorage.setItem(VER_KEY, JSON.stringify(map)); } catch (e) {}
  }
  function downloadText(text, fileName, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // ===== このPCに保存(ブラウザ内の名前付き保存) =====
  // 顧客先の端末ではダウンロードもクリップボードもセキュリティポリシーで
  // 塞がれている場合があるため、localStorageに名前付きで保存する経路を用意する。
  // (この保存はブラウザ内にのみ残る。履歴・キャッシュの削除で消えることがある)
  var SLOTS_KEY = 'bpl_slots_v1';
  var SLOTS_MAX = 30;
  function readSlots() {
    try { var a = JSON.parse(localStorage.getItem(SLOTS_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function writeSlots(slots) {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  }

  // ===== 保存・読込みモーダル(1ページ1つを共有) =====
  var modal = null;
  function ensureModal() {
    if (modal) return modal;
    var wrap = document.createElement('div');
    wrap.className = 'backup-modal hidden';
    wrap.innerHTML =
      '<div class="backup-modal-card">' +
      '  <div class="backup-modal-head"><span class="backup-modal-title"></span>' +
      '    <button type="button" class="backup-modal-close" aria-label="閉じる">&times;</button></div>' +
      '  <p class="backup-modal-guide"></p>' +
      '  <div class="backup-modal-slots hidden"></div>' +
      '  <div class="backup-modal-actions"></div>' +
      '  <p class="backup-modal-msg hidden"></p>' +
      '  <p class="backup-modal-filename hidden">推奨ファイル名: <b></b></p>' +
      '  <textarea class="backup-modal-text" spellcheck="false"></textarea>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    wrap.querySelector('.backup-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    modal = wrap;
    return wrap;
  }
  function closeModal() { if (modal) modal.classList.add('hidden'); }
  function modalMsg(text, ok) {
    var el = modal.querySelector('.backup-modal-msg');
    el.textContent = text;
    el.classList.remove('hidden');
    el.classList.toggle('is-ok', !!ok);
  }
  function openModal(title, guide, opts) {
    var m = ensureModal();
    m.querySelector('.backup-modal-title').textContent = title;
    m.querySelector('.backup-modal-guide').innerHTML = guide;
    var fn = m.querySelector('.backup-modal-filename');
    fn.classList.toggle('hidden', !opts.fileName);
    if (opts.fileName) fn.querySelector('b').textContent = opts.fileName;
    var ta = m.querySelector('.backup-modal-text');
    ta.value = opts.text || '';
    ta.readOnly = !!opts.readOnly;
    ta.placeholder = opts.placeholder || '';
    var actions = m.querySelector('.backup-modal-actions');
    actions.innerHTML = '';
    opts.buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.primary ? 'backup-btn backup-btn-primary' : 'backup-btn';
      btn.textContent = b.text;
      btn.addEventListener('click', function () { b.onClick(ta, btn); });
      actions.appendChild(btn);
    });
    var msg = m.querySelector('.backup-modal-msg');
    msg.classList.add('hidden');
    m.querySelector('.backup-modal-slots').classList.add('hidden');
    m.classList.remove('hidden');
    return m;
  }
  function copyText(ta, done) {
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    var finish = function (ok) { done(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () { finish(true); }, function () {
        try { finish(document.execCommand('copy')); } catch (e) { finish(false); }
      });
    } else {
      try { finish(document.execCommand('copy')); } catch (e) { finish(false); }
    }
  }

  document.querySelectorAll('[data-backup-keys]').forEach(function (toolbar) {
    var keys = toolbar.getAttribute('data-backup-keys').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var saveBtn = toolbar.querySelector('.js-backup-save');
    var loadBtn = toolbar.querySelector('.js-backup-load');
    var fileInput = toolbar.querySelector('.js-backup-file');
    var msg = toolbar.querySelector('.js-backup-msg');

    // ===== 保存名の入力欄をボタン列の先頭に差し込む(全ツール共通・任意入力) =====
    var labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'hero-save-label';
    labelInput.placeholder = '保存名(お客様名・案件名)';
    labelInput.title = '任意入力。ファイル保存とPDF出力の名前に使われます';
    labelInput.value = getLabel();
    labelInput.addEventListener('change', function () {
      try { localStorage.setItem(LABEL_KEY, labelInput.value.trim()); } catch (e) {}
    });
    toolbar.insertBefore(labelInput, toolbar.firstChild);

    function showMsg(text) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.remove('hidden');
    }

    function buildPayloadText() {
      var payload = { app: 'BizPlanLaboratory', page: location.pathname, exportedAt: new Date().toISOString(), label: getLabel(), data: {} };
      var hasData = false;
      keys.forEach(function (k) {
        var v = null;
        try { v = localStorage.getItem(k); } catch (e) {}
        if (v !== null) { payload.data[k] = v; hasData = true; }
      });
      return hasData ? JSON.stringify(payload, null, 2) : null;
    }

    // 貼り付け/ファイルのどちらから来たテキストも同じ手順で復元する
    function applyBackupText(text) {
      var parsed = JSON.parse(text);
      var data = parsed && parsed.data ? parsed.data : parsed;
      var restored = 0;
      Object.keys(data).forEach(function (k) {
        if (keys.indexOf(k) === -1) return; // このページで使うキーのみ復元
        localStorage.setItem(k, data[k]);
        restored++;
      });
      if (restored && parsed && typeof parsed.label === 'string' && parsed.label.trim()) {
        try { localStorage.setItem(LABEL_KEY, parsed.label.trim()); } catch (e) {}
      }
      return restored;
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var text = buildPayloadText();
        if (text === null) { showMsg('保存する入力内容がありません。先に入力してください。'); return; }
        var base = saveBase();
        var ver = peekVersion(base);
        var fname = function (ext) { return base + '_V' + ver + '.' + ext; };
        // どの保存方法でも、実際に保存動作をした時点で版番号を確定(次回はV+1)
        var committed = false;
        var commitOnce = function () { if (!committed) { committed = true; commitVersion(base, ver); } };
        var txtName = fname('txt');
        openModal(
          '入力データの保存',
          '<span class="backup-modal-lead">保存方法を選んでください</span>' +
          '<b>「このPCに保存」</b>はこの端末のブラウザ内に名前を付けて保存します' +
          '(ダウンロードやコピーが禁止されている環境でも使えます。読込みは同じ端末から)。' +
          '<br><b>「全文をコピー」</b>は下のデータをコピーし、メモ帳に貼り付けて保存する方法です。' +
          '<br>通常の環境では「.txtで保存」でそのままダウンロードできます。',
          {
            text: text,
            readOnly: true,
            fileName: txtName,
            buttons: [
              { text: 'このPCに保存', primary: true, onClick: function (ta) {
                  try {
                    var slots = readSlots();
                    var name = base + '_V' + ver;
                    slots.unshift({ name: name, savedAt: new Date().toISOString(), page: location.pathname, label: getLabel(), data: JSON.parse(ta.value).data });
                    while (slots.length > SLOTS_MAX) slots.pop();
                    writeSlots(slots);
                    commitOnce();
                    modalMsg('このPC(ブラウザ内)に「' + name + '」として保存しました。「読込み」ボタンの一覧から呼び出せます。※ブラウザの履歴・キャッシュを削除すると消えることがあります。', true);
                  } catch (e) {
                    modalMsg('このPCへの保存に失敗しました(保存領域が不足している可能性があります)。他の保存方法をお使いください。', false);
                  }
                } },
              { text: '全文をコピー', onClick: function (ta) {
                  copyText(ta, function (ok) {
                    if (ok) commitOnce();
                    modalMsg(ok ? 'コピーしました。メモ帳に貼り付けて「' + txtName + '」の名前で保存してください。'
                               : '自動コピーできませんでした。全文が選択されているので、Ctrl+C でコピーしてください。', ok);
                  });
                } },
              { text: '.txtで保存', onClick: function (ta) {
                  commitOnce();
                  downloadText(ta.value, fname('txt'), 'text/plain');
                  modalMsg('ダウンロードを開始しました。保存されない場合は「全文をコピー」をお使いください。', true);
                } },
              { text: '閉じる', onClick: function () { closeModal(); } },
            ],
          }
        );
      });
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        var m = openModal(
          '入力データの読込み',
          '<span class="backup-modal-lead">読込み方法を選んでください</span>' +
          '<b>「このPCに保存」したデータは下の一覧から</b>読み込めます。' +
          '<br>保存したファイル(.txt / .json)がある場合は<b>「ファイルを選ぶ」</b>から読み込めます。' +
          '<br>ファイルを選べない環境では、メモ帳で開いた全文を最下部の欄に貼り付けて<b>「貼り付けたデータを読み込む」</b>を押してください。' +
          '<br><b>現在の入力内容は読み込んだ内容で上書きされます。</b>',
          {
            text: '',
            readOnly: false,
            placeholder: 'ここに保存したデータの全文を貼り付け',
            buttons: [
              { text: 'ファイルを選ぶ', primary: true, onClick: function () { if (fileInput) fileInput.click(); } },
              { text: '貼り付けたデータを読み込む', onClick: function (ta) {
                  var text = ta.value.trim();
                  if (!text) { modalMsg('データが貼り付けられていません。下の欄に全文を貼り付けてください。', false); return; }
                  try {
                    var restored = applyBackupText(text);
                    if (!restored) { modalMsg('このページに該当する入力データが見つかりませんでした。保存したツールのページで読み込んでください。', false); return; }
                    modalMsg('読み込みました。ページを再読み込みします…', true);
                    setTimeout(function () { location.reload(); }, 700);
                  } catch (e) {
                    modalMsg('読み込みに失敗しました。全文が正しく貼り付けられているか確認してください。', false);
                  }
                } },
              { text: '閉じる', onClick: function () { closeModal(); } },
            ],
          }
        );
        renderSlots(m);
      });
    }

    // このページで使える「このPCに保存」の一覧を描画する(該当キーを含むものだけ)
    function renderSlots(m) {
      var box = m.querySelector('.backup-modal-slots');
      var slots = readSlots().filter(function (sl) {
        return sl && sl.data && Object.keys(sl.data).some(function (k) { return keys.indexOf(k) >= 0; });
      });
      if (!slots.length) { box.classList.add('hidden'); return; }
      box.innerHTML = '';
      slots.forEach(function (sl) {
        var row = document.createElement('div');
        row.className = 'backup-slot';
        var d = (sl.savedAt || '').slice(0, 10);
        row.innerHTML = '<span class="backup-slot-name"></span><span class="backup-slot-date">' + d + '</span>' +
          '<button type="button" class="backup-slot-load">読み込む</button>' +
          '<button type="button" class="backup-slot-del">削除</button>';
        row.querySelector('.backup-slot-name').textContent = sl.name || '(名称なし)';
        row.querySelector('.backup-slot-load').addEventListener('click', function () {
          try {
            var restored = applyBackupText(JSON.stringify({ label: sl.label || '', data: sl.data }));
            if (!restored) { modalMsg('このページに該当する入力データが見つかりませんでした。', false); return; }
            modalMsg('「' + sl.name + '」を読み込みました。ページを再読み込みします…', true);
            setTimeout(function () { location.reload(); }, 700);
          } catch (e) {
            modalMsg('読み込みに失敗しました。', false);
          }
        });
        // 削除は2回押しのトグル確認(全体ルール: window.confirmは使わない)
        var delBtn = row.querySelector('.backup-slot-del');
        var doDelete = function () {
          var all = readSlots().filter(function (x) { return !(x && x.name === sl.name && x.savedAt === sl.savedAt); });
          try { writeSlots(all); } catch (e) {}
          renderSlots(m);
        };
        if (window.armClearBtn) { window.armClearBtn(delBtn, doDelete); }
        else { delBtn.addEventListener('click', doDelete); }
        box.appendChild(row);
      });
      box.classList.remove('hidden');
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var restored = applyBackupText(reader.result);
            if (!restored) { modalMsg('このページに該当する入力データがファイル内に見つかりませんでした。', false); return; }
            // window.alert()はアプリ内ブラウザで表示されないことがあるため使わない
            modalMsg('読み込みました。ページを再読み込みします…', true);
            setTimeout(function () { location.reload(); }, 700);
          } catch (e) {
            modalMsg('ファイルの読み込みに失敗しました。正しい保存ファイルか確認してください。', false);
          }
        };
        reader.readAsText(file);
        fileInput.value = '';
      });
    }
  });

  // ===== PDF出力(ブラウザ印刷)との連携: 全ページ共通 =====
  // 印刷中だけタイトルを「保存名_ツール名_日付」に差し替え、PDF保存時のファイル名を揃える。
  // 印刷シートのヘッダーには保存名の行を印字する(未入力なら出さない)。
  var originalTitle = null;
  window.addEventListener('beforeprint', function () {
    var label = getLabel();
    originalTitle = document.title;
    document.title = (label ? sanitize(label) + '_' : '') + pageLabel() + '_' + dateStamp();
    document.querySelectorAll('.print-sheet .print-head').forEach(function (head) {
      var line = head.querySelector('.print-save-label');
      if (!label) { if (line) line.remove(); return; }
      if (!line) {
        line = document.createElement('div');
        line.className = 'print-save-label';
        head.appendChild(line);
      }
      line.textContent = '保存名：' + label;
    });
  });
  window.addEventListener('afterprint', function () {
    if (originalTitle !== null) { document.title = originalTitle; originalTitle = null; }
  });
});

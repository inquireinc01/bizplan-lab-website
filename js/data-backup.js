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

  // テスト配信ページ(trial-)ではダイアログの見出しに環境名を付けて区別する
  var IS_TRIAL_PAGE = location.pathname.indexOf('trial-') >= 0;
  var ENV_SUFFIX = IS_TRIAL_PAGE ? '（テスト環境）' : '';

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
  // base64url変換(URLのハッシュに安全に載せる)
  function b64urlEncode(bytesOrString) {
    var bin;
    if (typeof bytesOrString === 'string') {
      bin = unescape(encodeURIComponent(bytesOrString));
    } else {
      bin = '';
      var u8 = new Uint8Array(bytesOrString);
      for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecodeToBytes(b64) {
    var t = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    var bin = atob(t);
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  // 復元リンクを作る。対応ブラウザではdeflate圧縮(#bplz=)で短くし、QRも読み取りやすくする
  function buildRestoreUrl(text, done) {
    var plain = location.origin + location.pathname + '#bpl=' + b64urlEncode(text);
    if (typeof CompressionStream === 'undefined') { done(plain); return; }
    try {
      var stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      new Response(stream).arrayBuffer().then(function (buf) {
        done(location.origin + location.pathname + '#bplz=' + b64urlEncode(buf));
      }, function () { done(plain); });
    } catch (e) { done(plain); }
  }

  // OS標準の「名前を付けて保存」ダイアログでファイルを書く(File System Access API)。
  // 「ブラウザのダウンロード」とは別経路のため、ダウンロードだけを禁止している環境でも
  // 通ることがある。非対応ブラウザ(Firefox/Safari等)ではfalseを返し、呼び出し側で従来法へ。
  function fsSaveSupported() { return typeof window.showSaveFilePicker === 'function'; }
  function fsOpenSupported() { return typeof window.showOpenFilePicker === 'function'; }
  function fsSaveText(text, suggestedName, done) {
    if (!fsSaveSupported()) { done(false, 'unsupported'); return; }
    window.showSaveFilePicker({
      suggestedName: suggestedName,
      types: [{ description: 'BizPlan保存データ', accept: { 'text/plain': ['.txt'] } }],
    }).then(function (handle) {
      return handle.createWritable().then(function (w) {
        return w.write(text).then(function () { return w.close(); }).then(function () { done(true, handle.name); });
      });
    }).catch(function (e) {
      // ユーザーがダイアログをキャンセルした場合はエラー扱いにしない
      if (e && e.name === 'AbortError') { done(false, 'abort'); return; }
      done(false, (e && e.name) || 'error');
    });
  }
  function fsOpenText(done) {
    if (!fsOpenSupported()) { done(false, 'unsupported'); return; }
    window.showOpenFilePicker({
      types: [{ description: 'BizPlan保存データ', accept: { 'text/plain': ['.txt', '.json'] } }],
      multiple: false,
    }).then(function (handles) {
      return handles[0].getFile().then(function (file) { return file.text(); }).then(function (t) { done(true, t); });
    }).catch(function (e) {
      if (e && e.name === 'AbortError') { done(false, 'abort'); return; }
      done(false, (e && e.name) || 'error');
    });
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
      '  <p class="backup-modal-filename hidden">保存データ名: <input type="text" class="backup-modal-name" maxlength="60" spellcheck="false" /><span class="backup-modal-ext">.txt</span></p>' +
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
    fn.classList.toggle('hidden', !opts.nameValue);
    if (opts.nameValue) fn.querySelector('.backup-modal-name').value = opts.nameValue;
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
  // 保存データ名の取得と検証。問題があればエラーメッセージを表示してnullを返す
  function getSaveName() {
    var input = modal.querySelector('.backup-modal-name');
    var name = (input.value || '').trim();
    if (!name) { modalMsg('保存データ名を入力してください。', false); input.focus(); return null; }
    var bad = name.match(/[\\/:*?"<>|]/g);
    if (bad) { modalMsg('保存データ名に使えない文字が含まれています: ' + bad.join(' '), false); input.focus(); return null; }
    if (name.length > 60) { modalMsg('保存データ名は60文字以内にしてください(現在' + name.length + '文字)。', false); input.focus(); return null; }
    return name;
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
        var defaultName = base + '_V' + ver;
        openModal(
          '入力データの保存' + ENV_SUFFIX,
          '<span class="backup-modal-lead">保存方法を選んでください</span>' +
          '<b>「このPCに保存」</b>はこの端末のブラウザ内に名前を付けて保存します' +
          '(ダウンロードやコピーが禁止されている環境でも使えます。読込みは同じ端末から)。' +
          '<br><b>「全文をコピー」</b>は下のデータをコピーし、メモ帳に貼り付けて保存する方法です。' +
          '<br>通常の環境では「.txtで保存」でそのままダウンロードできます。' +
          '<br><b>「このPCに保存(B)」</b>はWindowsの「名前を付けて保存」画面でファイル保存します(ダウンロードが禁止でも通る場合があります。Edge/Chrome専用)。',
          {
            text: text,
            readOnly: true,
            nameValue: defaultName,
            buttons: [
              { text: 'このPCに保存', primary: true, onClick: function (ta, btn) {
                  var name = getSaveName();
                  if (name === null) return;
                  try {
                    var slots = readSlots();
                    var overwrote = false;
                    slots = slots.filter(function (x) { if (x && x.name === name) { overwrote = true; return false; } return true; });
                    slots.unshift({ name: name, savedAt: new Date().toISOString(), page: location.pathname, label: getLabel(), data: JSON.parse(ta.value).data });
                    while (slots.length > SLOTS_MAX) slots.pop();
                    writeSlots(slots);
                    commitOnce();
                    // 保存できたことを押したボタン自身で示し、少し置いてから自動で閉じる
                    btn.textContent = '保存しました';
                    btn.classList.add('backup-btn-ok');
                    btn.disabled = true;
                    modalMsg('「' + name + '」としてこのPC(ブラウザ内)に' + (overwrote ? '上書き保存' : '保存') + 'しました。「読込み」の一覧から呼び出せます。※ブラウザの履歴・キャッシュを削除すると消えることがあります。', true);
                    // 自動では閉じない(メッセージを読む時間を確保)。閉じた後もヒーロー側に保存名を残す
                    showMsg('このPCに「' + name + '」を保存しました。');
                  } catch (e) {
                    modalMsg('このPCへの保存に失敗しました(保存領域が不足している可能性があります)。他の保存方法をお使いください。', false);
                  }
                } },
              { text: '全文をコピー', onClick: function (ta) {
                  var name = getSaveName();
                  if (name === null) return;
                  copyText(ta, function (ok) {
                    if (ok) commitOnce();
                    modalMsg(ok ? 'コピーしました。メモ帳に貼り付けて「' + name + '.txt」の名前で保存してください。'
                               : '自動コピーできませんでした。全文が選択されているので、Ctrl+C でコピーしてください。', ok);
                  });
                } },
              { text: 'このPCに保存(B)', onClick: function (ta) {
                  var name = getSaveName();
                  if (name === null) return;
                  if (!fsSaveSupported()) {
                    modalMsg('この方法はお使いのブラウザでは利用できません。Edge/Chromeでお試しいただくか、他の保存方法をご利用ください。', false);
                    return;
                  }
                  modalMsg('保存先を選ぶ画面を開きます…', true);
                  fsSaveText(ta.value, name + '.txt', function (ok, info) {
                    if (ok) {
                      commitOnce();
                      modalMsg('「' + info + '」として保存しました。読込みは「読込み」→「このPCから開く(B)」から同じファイルを選んでください。', true);
                      showMsg('「' + name + '」を保存しました。');
                    } else if (info === 'abort') {
                      modalMsg('保存をキャンセルしました。', false);
                    } else {
                      modalMsg('この方法での保存がブロックされました。「このPCに保存」や「全文をコピー」をお使いください。', false);
                    }
                  });
                } },
              { text: '.txtで保存', onClick: function (ta) {
                  var name = getSaveName();
                  if (name === null) return;
                  commitOnce();
                  downloadText(ta.value, name + '.txt', 'text/plain');
                  modalMsg('「' + name + '.txt」のダウンロードを開始しました。保存されない場合は「全文をコピー」をお使いください。', true);
                } },
              { text: '閉じる', onClick: function () { closeModal(); } },
            ],
          }
        );
      });
    }

    // ===== 復元リンク(#bpl=...)からの自動復元 =====
    // 会社PCのポリシーで閲覧データが定期削除される環境でも、お気に入り(ブックマーク)は
    // 残ることが多いため、データをURLの#以降に埋め込んだリンクで持ち出せるようにする。
    // #以降はサーバーへ送信されないため、データが外部に出ることはない。
    var didLinkRestore = false;
    function finishLinkRestore(linkText) {
      try {
        var linkRestored = applyBackupText(linkText);
        history.replaceState(null, '', location.pathname + location.search);
        if (linkRestored) {
          didLinkRestore = true;
          try { sessionStorage.setItem('bpl_link_restored', '1'); } catch (e) {}
          location.reload();
        }
      } catch (e) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }
    if (location.hash.indexOf('#bpl=') === 0) {
      try {
        var u8p = b64urlDecodeToBytes(location.hash.slice(5));
        finishLinkRestore(decodeURIComponent(escape(String.fromCharCode.apply(null, u8p))));
      } catch (e) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } else if (location.hash.indexOf('#bplz=') === 0) {
      // 圧縮リンク(deflate-raw)。復元は非同期になるため完了後にreloadする
      try {
        var u8 = b64urlDecodeToBytes(location.hash.slice(6));
        var ds = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        new Response(ds).text().then(function (linkText) { finishLinkRestore(linkText); }, function () {
          history.replaceState(null, '', location.pathname + location.search);
        });
      } catch (e) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }
    // 復元直後のリロード後にだけ案内を出す(リロード前に消費しないようガード)
    if (!didLinkRestore) {
      try {
        if (sessionStorage.getItem('bpl_link_restored') === '1') {
          sessionStorage.removeItem('bpl_link_restored');
          showMsg('復元リンクからデータを読み込みました。');
        }
      } catch (e) {}
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        var m = openModal(
          '入力データの読込み' + ENV_SUFFIX,
          '<span class="backup-modal-lead">読込み方法を選んでください</span>' +
          '<b>「このPCに保存」したデータは下の一覧から</b>読み込めます。' +
          '<br>保存したファイル(.txt / .json)がある場合は<b>「ファイルを選ぶ」</b>から読み込めます。' +
          '<br><b>「このPCから開く(B)」</b>はWindowsの「開く」画面から保存(B)したファイルを読み込みます(Edge/Chrome専用)。' +
          '<br>ファイルを選べない環境では、メモ帳で開いた全文を最下部の欄に貼り付けて<b>「貼り付けたデータを読み込む」</b>を押してください。' +
          '<br><b>現在の入力内容は読み込んだ内容で上書きされます。</b>',
          {
            text: '',
            readOnly: false,
            placeholder: 'ここに保存したデータの全文を貼り付け',
            buttons: [
              { text: 'ファイルを選ぶ', primary: true, onClick: function () { if (fileInput) fileInput.click(); } },
              { text: 'このPCから開く(B)', onClick: function () {
                  if (!fsOpenSupported()) {
                    modalMsg('この方法はお使いのブラウザでは利用できません。「ファイルを選ぶ」をお使いください。', false);
                    return;
                  }
                  fsOpenText(function (ok, payload) {
                    if (!ok) {
                      if (payload === 'abort') { modalMsg('読み込みをキャンセルしました。', false); return; }
                      modalMsg('この方法での読み込みができませんでした。「ファイルを選ぶ」をお使いください。', false);
                      return;
                    }
                    try {
                      var restored = applyBackupText(payload);
                      if (!restored) { modalMsg('このページに該当する入力データが見つかりませんでした。保存したツールのページで読み込んでください。', false); return; }
                      modalMsg('読み込みました。ページを再読み込みします…', true);
                      setTimeout(function () { location.reload(); }, 700);
                    } catch (e) {
                      modalMsg('読み込みに失敗しました。正しい保存ファイルか確認してください。', false);
                    }
                  });
                } },
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

  // ===== ヘッドレス検証用: ?autoprint=1 でPDF出力処理を自動実行する =====
  // (実際の印刷レンダリングをヘッドレスブラウザのPDF生成で確認するための仕組み)
  if (/[?&]autoprint=1/.test(location.search)) {
    window.print = function () {};
    setTimeout(function () {
      var btns = document.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        if (/PDF|印刷/.test(btns[i].textContent)) { btns[i].click(); break; }
      }
    }, 1200);
  }

  // ===== 画面のSVGグラフを「見たままのPNG画像」にして印刷スロットへ入れる共通ヘルパー =====
  // SVGを単純に複製すると、CSSで与えている色・寸法が印刷側で失われることがある
  // (自社株=全バーが灰色化 / 金庫株=白紙、の不具合の原因)。
  // そこで描画済みのcomputed styleを各要素に焼き込み、実際の表示サイズで
  // canvasに描いてPNG化する。画面と同じ見た目が保証される。
  window.bplChartToImage = function (src, slot, done) {
    try {
      var rect = src.getBoundingClientRect();
      if (!rect.width || !rect.height) { slot.innerHTML = ''; if (done) done(false); return; }
      var clone = src.cloneNode(true);
      var srcAll = [src].concat(Array.prototype.slice.call(src.querySelectorAll('*')));
      var dstAll = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
      var PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'opacity',
        'fill-opacity', 'stroke-opacity', 'font-family', 'font-size', 'font-weight', 'font-stretch',
        'text-anchor', 'dominant-baseline', 'letter-spacing', 'visibility', 'display'];
      for (var i = 0; i < srcAll.length; i++) {
        var cs = getComputedStyle(srcAll[i]);
        for (var j = 0; j < PROPS.length; j++) {
          try { dstAll[i].style.setProperty(PROPS[j], cs.getPropertyValue(PROPS[j])); } catch (e) {}
        }
      }
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      clone.querySelectorAll('animate,animateTransform').forEach(function (el) { el.remove(); });
      clone.setAttribute('width', rect.width);
      clone.setAttribute('height', rect.height);
      if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      var xml = new XMLSerializer().serializeToString(clone);
      var img = new Image();
      img.onload = function () {
        var scale = 2; // 印刷でぼやけないよう2倍で描く
        var c = document.createElement('canvas');
        c.width = Math.round(rect.width * scale);
        c.height = Math.round(rect.height * scale);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        var out = new Image();
        out.className = 'print-chart-img';
        // PNGの読み込み完了を待ってからdoneを呼ぶ。
        // 直後にwindow.print()すると未ロードのまま印刷され空白になるため。
        out.onload = function () { if (done) done(true); };
        out.onerror = function () { if (done) done(false); };
        slot.innerHTML = '';
        slot.appendChild(out);
        out.src = c.toDataURL('image/png');
      };
      img.onerror = function () { slot.innerHTML = ''; if (done) done(false); };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    } catch (e) {
      slot.innerHTML = '';
      if (done) done(false);
    }
  };

  // ===== 画面のHTML要素(カード等)も「見たままのPNG画像」にする共通ヘルパー =====
  // SVGのforeignObjectに描画済みスタイルを焼き込んだHTMLを包み、canvas経由でPNG化する。
  // DOM複製は印刷エンジンの改ページ・CSS差でレイアウトが崩れるため、画像化が確実。
  window.bplDomToImage = function (src, slot, done) {
    try {
      var rect = src.getBoundingClientRect();
      if (!rect.width || !rect.height) { if (done) done(false); return; }
      var clone = src.cloneNode(true);
      var srcAll = [src].concat(Array.prototype.slice.call(src.querySelectorAll('*')));
      var dstAll = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll('*')));
      for (var i = 0; i < srcAll.length; i++) {
        var cs = getComputedStyle(srcAll[i]);
        var buf = '';
        for (var j = 0; j < cs.length; j++) {
          var prop = cs[j];
          buf += prop + ':' + cs.getPropertyValue(prop) + ';';
        }
        dstAll[i].setAttribute('style', buf);
      }
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      var W = Math.ceil(rect.width);
      var H = Math.ceil(rect.height);
      var xhtml = new XMLSerializer().serializeToString(clone);
      var svgXml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">' +
        '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">' +
        xhtml + '</div></foreignObject></svg>';
      var img = new Image();
      img.onload = function () {
        var scale = 2; // 印刷でぼやけないよう2倍で描く
        var c = document.createElement('canvas');
        c.width = W * scale;
        c.height = H * scale;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, W, H);
        var out = new Image();
        out.className = 'print-chart-img';
        out.onload = function () { if (done) done(true); };
        out.onerror = function () { if (done) done(false); };
        slot.innerHTML = '';
        slot.appendChild(out);
        out.src = c.toDataURL('image/png');
      };
      img.onerror = function () { slot.innerHTML = ''; if (done) done(false); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);
    } catch (e) {
      slot.innerHTML = '';
      if (done) done(false);
    }
  };

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
    // ===== 前提条件(入力値一覧)を印刷シートの最後に自動生成する =====
    // 「伝えたい結果・グラフを先に、前提条件は最後に網羅」(2026-08-25指示)。
    // ページ上の見えている入力欄(ラベル付き)から毎回組み立てるため、
    // ツールごとの手作業や項目の追加漏れが起きない
    document.querySelectorAll('.print-sheet').forEach(function (sheet) {
      if (sheet.hasAttribute('data-no-auto-cond')) return; // 専用の前提条件ページを持つツールでは自動一覧を出さない
      var oldCond = sheet.querySelector('.print-cond-auto');
      if (oldCond) oldCond.remove();
      var rows = [];
      document.querySelectorAll('main input[id], main select[id]').forEach(function (el) {
        if (el.closest('.print-sheet') || el.closest('.backup-modal')) return;
        var t = (el.type || '').toLowerCase();
        if (t === 'file' || t === 'hidden' || t === 'checkbox' || t === 'radio') return;
        if (el.classList.contains('hero-save-label')) return;
        if (el.offsetParent === null) return; // 非表示(畳まれている)欄は載せない
        var lab = document.querySelector('label[for="' + el.id + '"]');
        var name = '';
        if (lab) {
          var c = lab.cloneNode(true);
          c.querySelectorAll('.help-tip').forEach(function (x) { x.remove(); });
          name = c.textContent.replace(/\s+/g, ' ').trim();
        }
        if (!name) return;
        var val;
        if (el.tagName === 'SELECT') {
          var o = el.options[el.selectedIndex];
          val = o ? o.text : '';
        } else {
          val = el.value;
        }
        rows.push([name, val === '' ? '—' : val]);
      });
      if (!rows.length) return;
      var div = document.createElement('div');
      div.className = 'print-cond-auto';
      var html = '<div class="print-sec">前提条件(入力値一覧)</div><div class="print-cond-grid">';
      rows.forEach(function () { html += '<div class="pc-item"><span class="pc-k"></span><span class="pc-v"></span></div>'; });
      div.innerHTML = html + '</div>';
      var items = div.querySelectorAll('.pc-item');
      rows.forEach(function (r, i) {
        items[i].children[0].textContent = r[0];
        items[i].children[1].textContent = r[1];
      });
      sheet.appendChild(div);
    });
  });
  window.addEventListener('afterprint', function () {
    if (originalTitle !== null) { document.title = originalTitle; originalTitle = null; }
  });
});

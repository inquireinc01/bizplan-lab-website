document.addEventListener('DOMContentLoaded', function () {
  // 入力データはlocalStorage(お使いのPC・ブラウザ内)にのみ保存され、弊社サーバーには送信されません。
  // ブラウザのキャッシュ削除や別端末での続きの入力に備え、ファイルへの保存/読込を提供します。
  //
  // 保存名(お客様名・案件名)は任意入力。入力すると
  //   1) 保存ファイル名   BizPlanLab_<ツール名>_<保存名>_<日付>.json
  //   2) PDF出力のファイル名(印刷中だけdocument.titleを差し替え)
  //   3) 印刷シートのヘッダー表記
  // に共通で使われる。未入力ならツール名+日付のみ。サイト内の全ツールで共有する。

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

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var payload = { app: 'BizPlanLaboratory', page: location.pathname, exportedAt: new Date().toISOString(), label: getLabel(), data: {} };
        var hasData = false;
        keys.forEach(function (k) {
          var v = null;
          try { v = localStorage.getItem(k); } catch (e) {}
          if (v !== null) { payload.data[k] = v; hasData = true; }
        });
        if (!hasData) { showMsg('保存する入力内容がありません。先に入力してください。'); return; }
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var label = sanitize(getLabel());
        a.href = url;
        a.download = 'BizPlanLab_' + pageLabel() + (label ? '_' + label : '') + '_' + dateStamp() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showMsg('ファイルに保存しました。');
      });
    }

    if (loadBtn && fileInput) {
      loadBtn.addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(reader.result);
            var data = parsed && parsed.data ? parsed.data : parsed;
            var restored = 0;
            Object.keys(data).forEach(function (k) {
              if (keys.indexOf(k) === -1) return; // このページで使うキーのみ復元
              localStorage.setItem(k, data[k]);
              restored++;
            });
            if (!restored) {
              showMsg('このページに該当する入力データがファイル内に見つかりませんでした。');
              return;
            }
            // ファイルに保存名が入っていれば引き継ぐ
            if (parsed && typeof parsed.label === 'string' && parsed.label.trim()) {
              try { localStorage.setItem(LABEL_KEY, parsed.label.trim()); } catch (e2) {}
            }
            // window.alert()はアプリ内ブラウザで表示されないことがあるため使わない
            showMsg('読み込みました。ページを再読み込みします…');
            setTimeout(function () { location.reload(); }, 700);
          } catch (e) {
            showMsg('ファイルの読み込みに失敗しました。正しい保存ファイルか確認してください。');
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

document.addEventListener('DOMContentLoaded', function () {
  // 入力データはlocalStorage(お使いのPC・ブラウザ内)にのみ保存され、弊社サーバーには送信されません。
  // ブラウザのキャッシュ削除や別端末での続きの入力に備え、ファイルへの保存/読込を提供します。
  document.querySelectorAll('[data-backup-keys]').forEach(function (toolbar) {
    var keys = toolbar.getAttribute('data-backup-keys').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var saveBtn = toolbar.querySelector('.js-backup-save');
    var loadBtn = toolbar.querySelector('.js-backup-load');
    var fileInput = toolbar.querySelector('.js-backup-file');
    var msg = toolbar.querySelector('.js-backup-msg');

    function showMsg(text) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.remove('hidden');
    }

    function pageLabel() {
      var t = (document.title || 'bizplanlab').split('|')[0].trim();
      return t.replace(/[\\/:*?"<>|\s]+/g, '_') || 'bizplanlab';
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var payload = { app: 'BizPlanLaboratory', page: location.pathname, exportedAt: new Date().toISOString(), data: {} };
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
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
        a.href = url;
        a.download = 'bizplanlab_' + pageLabel() + '_' + stamp + '.json';
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
            window.alert('読み込みました。ページを再読み込みします。');
            location.reload();
          } catch (e) {
            showMsg('ファイルの読み込みに失敗しました。正しい保存ファイルか確認してください。');
          }
        };
        reader.readAsText(file);
        fileInput.value = '';
      });
    }
  });
});

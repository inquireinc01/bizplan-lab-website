/* ============================================================
   数値表示の共通ルール
   - 入力欄・試算結果ともカンマ区切り・右寄せ
   - マイナスは数字の前に「△」を付け、赤字で表示
   他のスクリプトより先に読み込むこと(window.numClean 等を提供)
   ============================================================ */
(function () {
  // カンマや△を除いた実数値を返す(計算・保存で使う)
  function clean(v) {
    if (v == null) return NaN;
    var s = String(v).replace(/,/g, '').replace(/△/g, '-').trim();
    if (s === '') return NaN;
    return parseFloat(s);
  }
  window.numClean = clean;

  // 数値を「カンマ区切り・負数は△」の文字列にする(単位は付けない)
  function fmt(n) {
    if (n === '' || n == null || isNaN(n)) return '';
    var neg = n < 0;
    var abs = Math.abs(n);
    return (neg ? '△' : '') + abs.toLocaleString('ja-JP');
  }
  window.numFmt = fmt;

  // 結果要素に金額をセット。負数なら△+赤字クラスを付与
  window.setMoney = function (el, n, unit) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    unit = unit == null ? ' 万円' : unit;
    el.textContent = (isNaN(n) ? '-' : fmt(n) + unit);
    el.classList.toggle('neg-val', !isNaN(n) && n < 0);
  };

  // ---- 入力欄のカンマ整形(マイナスは△＋赤字) ----
  function formatInput(el) {
    var raw = String(el.value).replace(/,/g, '').replace(/△/g, '-');
    if (raw === '' || raw === '-' || raw === '.') { el.classList.remove('neg-val'); return; }
    var neg = raw.charAt(0) === '-';
    if (neg) raw = raw.slice(1);
    var parts = raw.split('.');
    var intNum = parseFloat(parts[0]);
    if (isNaN(intNum)) { el.classList.remove('neg-val'); return; }
    var out = Math.abs(intNum).toLocaleString('ja-JP');
    if (parts.length > 1) out += '.' + parts[1];
    el.value = (neg ? '△' : '') + out;
    el.classList.toggle('neg-val', neg);
  }

  function upgradeInput(el) {
    if (el.dataset.numReady === '1') return;
    el.dataset.numReady = '1';
    // type=number ではカンマを表示できないので text に変換
    var isDecimal = el.getAttribute('step') && el.getAttribute('step') !== '1';
    if (el.type === 'number') {
      el.type = 'text';
      el.setAttribute('inputmode', isDecimal ? 'decimal' : 'numeric');
    }
    el.classList.add('num-input');
    formatInput(el);
    el.addEventListener('focus', function () {
      // 編集中はカンマ・△を外して素の数値(マイナスは-)にする
      el.value = String(el.value).replace(/,/g, '').replace(/△/g, '-');
      el.classList.remove('neg-val');
    });
    el.addEventListener('blur', function () {
      formatInput(el);
    });
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll(
      'input[type="number"], input.js-num'
    );
    nodes.forEach(upgradeInput);
  }

  // ---- 試算結果の負数を赤字にする汎用監視 ----
  // 結果はJSでtextContentが書き換わるため、△で始まる数値の葉要素を自動で赤くする
  function paintNegatives(node) {
    if (!node) return;
    var els = [];
    if (node.nodeType === 3) {
      els = node.parentElement ? [node.parentElement] : [];
    } else if (node.nodeType === 1) {
      els = [node];
    }
    els.forEach(function (el) {
      if (!el || el.children.length > 0) return; // 葉要素のみ
      if (el.classList && el.classList.contains('num-input')) return;
      var t = (el.textContent || '').trim();
      if (t === '') return;
      // △ or 数字/カンマで始まる短い数値らしきものだけ対象
      if (/^△[\d,]/.test(t)) {
        el.classList.add('neg-val');
      } else if (/^[+\-]?[\d,]+(\.\d+)?(\s|$|万|円|年|%)/.test(t) || /^-[\d,]/.test(t)) {
        el.classList.remove('neg-val');
      }
    });
  }

  function initObserver() {
    var mainEl = document.querySelector('main') || document.body;
    var obs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === 'characterData') {
          paintNegatives(m.target);
        } else {
          m.addedNodes && m.addedNodes.forEach(function (n) {
            paintNegatives(n);
            if (n.nodeType === 1) {
              // 動的に追加された入力欄も整形
              if (n.matches && (n.matches('input[type="number"]') || n.matches('input.js-num'))) upgradeInput(n);
              n.querySelectorAll && scan(n);
            }
          });
          // 既存要素のtextContent差し替え
          if (m.target && m.target.nodeType === 1) paintNegatives(m.target);
        }
      });
    });
    obs.observe(mainEl, { childList: true, subtree: true, characterData: true });
  }

  // 既存の全入力欄を再整形(他スクリプトがプログラムで値をセットした後に呼ぶ)
  function reformatAll() {
    document.querySelectorAll('input.num-input').forEach(function (el) {
      if (document.activeElement === el) return; // 編集中は触らない
      formatInput(el);
    });
  }
  window.numReformatAll = reformatAll;

  function init() {
    scan(document);
    // 初期表示の結果にも色付け
    document.querySelectorAll('main *').forEach(function (el) {
      if (el.children.length === 0) paintNegatives(el);
    });
    initObserver();
    // 他スクリプト(計算ツール)がロード時にセットした入力値もカンマ整形する
    setTimeout(reformatAll, 0);
    setTimeout(reformatAll, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

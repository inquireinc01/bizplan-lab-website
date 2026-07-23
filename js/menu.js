// ===== ヒーローの「全データクリア」用トグル確認ヘルパー(全ページ共通)。
//       window.confirm()はLINE等アプリ内ブラウザで表示されない/反応しないことがあるため使わず、
//       1回目クリックでボタン自身が「本当にクリア？」の警告色表示に切り替わり、
//       4秒以内の2回目クリックでdoActionを実行するトグル確認方式にする =====
window.armHeroClearBtn = function (btn, doAction) {
  if (!btn) return;
  const label = btn.querySelector('.hero-util-label');
  const originalText = label ? label.textContent : '';
  let revertTimer = null;
  btn.addEventListener('click', function () {
    if (btn.classList.contains('is-confirming')) {
      clearTimeout(revertTimer);
      btn.classList.remove('is-confirming');
      if (label) label.textContent = originalText;
      doAction();
      return;
    }
    btn.classList.add('is-confirming');
    if (label) label.textContent = '本当に？';
    revertTimer = setTimeout(function () {
      btn.classList.remove('is-confirming');
      if (label) label.textContent = originalText;
    }, 4000);
  });
};

document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('site-header');
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  // ===== モバイルメニューの開閉 =====
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (!isOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('open');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== PC: メガメニューの開閉 =====
  const megaItems = document.querySelectorAll('.mega-item');
  megaItems.forEach((item) => {
    const trigger = item.querySelector('.mega-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const willOpen = !item.classList.contains('open');
      megaItems.forEach((i) => i.classList.remove('open'));
      if (willOpen) item.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    megaItems.forEach((i) => i.classList.remove('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') megaItems.forEach((i) => i.classList.remove('open'));
  });

  // ===== モバイル: アコーディオンの開閉 =====
  document.querySelectorAll('.mobile-accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const group = trigger.closest('.mobile-accordion');
      if (group) group.classList.toggle('open');
    });
  });

  // ===== スクロール時にヘッダー影 =====
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 0) {
        header.classList.add('shadow-sm');
      } else {
        header.classList.remove('shadow-sm');
      }
    });
  }

  // ===== ヒーロー帯のタイトル横「?」: 説明文をタップで開閉(ヒーローはoverflow:hiddenのため
  //       フロート型ツールチップだと吹き出しが見切れる。通常フローで下に開く方式にする) =====
  document.querySelectorAll('.hero-info-btn').forEach(function (btn) {
    const text = btn.closest('h1').parentElement.querySelector('.hero-info-text');
    if (!text) return;
    btn.addEventListener('click', function () {
      const willOpen = text.classList.contains('hidden');
      text.classList.toggle('hidden', !willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // ===== 自社株×生命保険(入力): ヒーローの「全データクリア」は簡易/詳細/TDTSRの
  //       3版すべての保存データを一括削除する(各版内の個別クリアはそれぞれのJSが担当)。
  //       2回押しで確定するトグル確認方式(window.confirm()は使わない) =====
  const svAllClearBtn = document.getElementById('svAllClearBtn');
  window.armHeroClearBtn(svAllClearBtn, function () {
    ['bpl_stock_valuation_v1', 'bpl_stock_detail_v1', 'bpl_stock_tdb_v1', 'bpl_stock_version'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    location.reload();
  });

  // ===== セクション単位の「データクリア」: 見出し右の小さいリンクボタン。
  //       押した見出しが属するセクション(.calc-section等)内のinput/select/textareaだけを
  //       空欄にし、input/changeイベントを発火して各ページ既存の保存・再計算処理に任せる。
  //       window.confirm()はLINE等アプリ内ブラウザで表示されない/反応しないことがあるため使わず、
  //       1回目クリックで「本当にクリア？」表示に切り替わり、3秒以内の2回目クリックで実行する
  //       ボタン自身によるトグル確認方式にする =====
  document.querySelectorAll('.section-clear-btn').forEach(function (btn) {
    const originalText = btn.textContent;
    let revertTimer = null;
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-confirming')) {
        clearTimeout(revertTimer);
        btn.classList.remove('is-confirming');
        btn.textContent = originalText;
        const scope = btn.closest('[data-clear-scope]') || btn.closest('.calc-section') || btn.closest('form');
        if (!scope) return;
        scope.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            el.checked = false;
          } else {
            el.value = '';
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        return;
      }
      btn.classList.add('is-confirming');
      btn.textContent = '本当にクリア？';
      revertTimer = setTimeout(function () {
        btn.classList.remove('is-confirming');
        btn.textContent = originalText;
      }, 4000);
    });
  });

  // ===== ヒーローのアイコンボタン: スマホ幅ではラベルが隠れるため、初回訪問時だけ
  //       簡単なヒントを一度だけ表示する(title属性はモバイルでは実質見えないため) =====
  setTimeout(function () {
    var HINT_KEY = 'bpl_hero_hint_seen_v1';
    var actions = document.querySelector('.hero-actions');
    if (!actions || !window.matchMedia('(max-width: 639px)').matches) return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch (e) {
      return;
    }
    var hint = document.createElement('div');
    hint.className = 'hero-hint';
    hint.innerHTML = '<span>アイコンの意味: トップ・読込み・保存・PDF・全データクリア</span>' +
      '<button type="button" class="hero-hint-close" aria-label="閉じる">&times;</button>';
    actions.insertAdjacentElement('afterend', hint);
    function dismiss() {
      hint.remove();
      try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
    }
    hint.querySelector('.hero-hint-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 6000);
  }, 150);

  // ===== 入力欄フォーカス時に全選択(そのまま入力すれば上書きできるように) =====
  const SKIP_TYPES = ['checkbox', 'radio', 'file', 'button', 'submit', 'reset', 'range', 'color', 'date', 'month', 'week', 'time'];
  document.addEventListener('focusin', function (e) {
    const el = e.target;
    const isTextInput = el instanceof HTMLInputElement && !SKIP_TYPES.includes(el.type);
    const isTextarea = el instanceof HTMLTextAreaElement;
    if (!isTextInput && !isTextarea) return;
    setTimeout(function () {
      el.select();
    }, 0);
  });
});

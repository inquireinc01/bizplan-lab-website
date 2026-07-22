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

  // ===== 自社株×生命保険(入力): ヒーローの「入力データクリア」は簡易/詳細/TDTSRの
  //       3版すべての保存データを一括削除する(各版内の個別クリアはそれぞれのJSが担当) =====
  const svAllClearBtn = document.getElementById('svAllClearBtn');
  if (svAllClearBtn) {
    svAllClearBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容(簡易入力・詳細入力・公開情報から入力のすべて)をクリアします。保存されているデータも削除されます。よろしいですか？')) return;
      ['bpl_stock_valuation_v1', 'bpl_stock_detail_v1', 'bpl_stock_tdb_v1', 'bpl_stock_version'].forEach(function (k) {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      location.reload();
    });
  }

  // ===== セクション単位の「データクリア」: 見出し右の小さいリンクボタン。
  //       押した見出しが属するセクション(.calc-section等)内のinput/select/textareaだけを
  //       空欄にし、input/changeイベントを発火して各ページ既存の保存・再計算処理に任せる =====
  document.querySelectorAll('.section-clear-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const scope = btn.closest('[data-clear-scope]') || btn.closest('.calc-section') || btn.closest('form');
      if (!scope) return;
      if (!window.confirm('このセクションの入力内容をクリアします。よろしいですか？')) return;
      scope.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else {
          el.value = '';
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  });

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

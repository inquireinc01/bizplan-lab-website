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

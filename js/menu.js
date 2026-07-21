document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('site-header');
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  // ===== モバイルメニューの開閉 =====
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('hidden');
      if (isOpen) {
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

  // ===== ナビが2段に収まらない(3段以上になる)場合はハンバーガーへ自動切替 =====
  const headerRow = header ? header.querySelector('.header-row') : null;
  const desktopNav = header ? header.querySelector('.site-desktop-nav') : null;
  function updateNavCollapse() {
    if (!header || !headerRow || !desktopNav) return;
    // いったん全ナビ表示状態にして本来必要な高さを測る(同一フレーム内なので描画されない)
    header.classList.remove('nav-collapsed');
    const items = desktopNav.querySelectorAll('.nav-btn');
    let overflow = false;
    if (items.length) {
      const rowGap = parseFloat(getComputedStyle(desktopNav).rowGap) || 0;
      const btnHeight = items[0].getBoundingClientRect().height;
      const maxHeight = btnHeight * 2 + rowGap + 1; // 2段まで許容
      overflow = desktopNav.scrollHeight > maxHeight;
    }
    if (overflow) {
      header.classList.add('nav-collapsed');
    } else {
      // 収まる場合は開いていたモバイルメニューを閉じる
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('hidden');
      }
      if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateNavCollapse, 120);
  });
  // フォント読み込み後のレイアウト変化にも追従
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateNavCollapse);
  }
  window.addEventListener('load', updateNavCollapse);
  updateNavCollapse();

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
});

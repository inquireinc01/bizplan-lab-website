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

  // ===== 横幅不足でナビが収まらない場合はハンバーガーへ自動切替 =====
  const headerRow = header ? header.querySelector('.header-row') : null;
  function updateNavCollapse() {
    if (!header || !headerRow) return;
    // いったん全ナビ表示状態にして本来必要な幅を測る(同一フレーム内なので描画されない)
    header.classList.remove('nav-collapsed');
    const overflow = headerRow.scrollWidth > headerRow.clientWidth + 1;
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

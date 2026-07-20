document.addEventListener('DOMContentLoaded', function () {
  var stepperSimple = document.getElementById('stepperSimple');
  var stepperDetail = document.getElementById('stepperDetail');
  if (!stepperSimple || !stepperDetail) return;

  function detailVisible() {
    var d = document.getElementById('detailArea');
    return d && !d.classList.contains('hidden');
  }
  function currentStepper() { return detailVisible() ? stepperDetail : stepperSimple; }

  // ステッパーの表示を版に合わせる
  function syncVisibility() {
    var det = detailVisible();
    stepperSimple.classList.toggle('hidden', det);
    stepperDetail.classList.toggle('hidden', !det);
  }

  // 現在地(スクロール位置)に応じてアクティブなステップを更新
  function updateActive() {
    var stepper = currentStepper();
    var items = Array.prototype.slice.call(stepper.querySelectorAll('li'));
    var actIdx = 0;
    items.forEach(function (li, i) {
      var sec = document.getElementById(li.getAttribute('data-target'));
      if (sec) {
        var top = sec.getBoundingClientRect().top;
        if (top <= 170) actIdx = i;
      }
    });
    items.forEach(function (li, i) {
      li.classList.toggle('active', i === actIdx);
      li.classList.toggle('done', i < actIdx);
    });
  }

  // クリックで該当セクションへスクロール
  function bindClicks() {
    [stepperSimple, stepperDetail].forEach(function (st) {
      st.querySelectorAll('li').forEach(function (li) {
        li.addEventListener('click', function () {
          var sec = document.getElementById(li.getAttribute('data-target'));
          if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
        });
      });
    });
  }

  bindClicks();
  syncVisibility();
  updateActive();

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });

  // 版切替時に更新(stock-detail.js のカードクリック後)
  document.querySelectorAll('.version-card').forEach(function (c) {
    c.addEventListener('click', function () {
      setTimeout(function () { syncVisibility(); updateActive(); }, 60);
    });
  });
});

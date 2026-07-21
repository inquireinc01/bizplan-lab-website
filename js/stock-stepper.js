document.addEventListener('DOMContentLoaded', function () {
  var stepperSimple = document.getElementById('stepperSimple');
  var stepperDetail = document.getElementById('stepperDetail');
  if (!stepperSimple || !stepperDetail) return;

  function detailVisible() {
    var d = document.getElementById('detailArea');
    return d && !d.classList.contains('hidden');
  }
  function tdbVisible() {
    var t = document.getElementById('tdbArea');
    return t && !t.classList.contains('hidden');
  }
  function currentStepper() { return detailVisible() ? stepperDetail : stepperSimple; }

  // ステッパーの表示を版に合わせる(TD/TSR版は簡易ツールのためステッパーなし)
  function syncVisibility() {
    var det = detailVisible();
    var tdb = tdbVisible();
    stepperSimple.classList.toggle('hidden', det || tdb);
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
      setTimeout(function () { syncVisibility(); updateActive(); updateValidity(); }, 60);
    });
  });

  // ===== 簡易版STEP1〜3の入力充足状況: 未入力=赤丸、要件を満たしていれば青丸 =====
  function numVal(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, ''));
  }
  function stepValidity() {
    var step1 = numVal('ssShares') > 0 && numVal('ssParValue') > 0;
    var step2 = numVal('ssV_saizoku') > 0 && numVal('ssV_junsisan') > 0;
    var step3 = false;
    document.querySelectorAll('#ssHolderBody .ss-holder').forEach(function (r) {
      var hs = r.querySelector('.hs'), hr = r.querySelector('.hr');
      var sVal = hs ? (window.numClean ? window.numClean(hs.value) : parseFloat(hs.value)) : NaN;
      var rVal = hr ? (window.numClean ? window.numClean(hr.value) : parseFloat(hr.value)) : NaN;
      if ((!isNaN(sVal) && sVal > 0) || (!isNaN(rVal) && rVal > 0)) step3 = true;
    });
    return [step1, step2, step3];
  }
  function updateValidity() {
    if (detailVisible() || tdbVisible()) return; // 詳細版・TD/TSR版は対象外(従来通りスクロール連動のみ)
    var results = stepValidity();
    var items = stepperSimple.querySelectorAll('li');
    items.forEach(function (li, i) {
      var ok = !!results[i];
      li.classList.toggle('step-complete', ok);
      li.classList.toggle('step-incomplete', !ok);
    });
    // 試算ボタン: 全STEPが要件を満たしていればブルー、そうでなければレッドで視認性を高める
    var submitBtn = document.querySelector('#stockCalcForm button[type="submit"]');
    if (submitBtn) {
      var allOk = results.every(function (v) { return v; });
      submitBtn.classList.toggle('btn-ready', allOk);
      submitBtn.classList.toggle('btn-not-ready', !allOk);
    }
  }
  updateValidity();
  var form = document.getElementById('stockCalcForm');
  if (form) {
    form.addEventListener('input', updateValidity);
    form.addEventListener('change', updateValidity);
  }
});

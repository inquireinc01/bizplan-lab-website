document.addEventListener('DOMContentLoaded', function () {
  var stepperSimple = document.getElementById('stepperSimple');
  var stepperDetail = document.getElementById('stepperDetail');
  var stepperTdb = document.getElementById('stepperTdb');
  if (!stepperSimple || !stepperDetail) return;

  function detailVisible() {
    var d = document.getElementById('detailArea');
    return d && !d.classList.contains('hidden');
  }
  function tdbVisible() {
    var t = document.getElementById('tdbArea');
    return t && !t.classList.contains('hidden');
  }
  function currentStepper() {
    if (detailVisible()) return stepperDetail;
    if (tdbVisible() && stepperTdb) return stepperTdb;
    return stepperSimple;
  }

  // ステッパーの表示を版に合わせる
  function syncVisibility() {
    var det = detailVisible();
    var tdb = tdbVisible();
    stepperSimple.classList.toggle('hidden', det || tdb);
    stepperDetail.classList.toggle('hidden', !det);
    if (stepperTdb) stepperTdb.classList.toggle('hidden', !tdb);
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
    [stepperSimple, stepperDetail, stepperTdb].forEach(function (st) {
      if (!st) return;
      st.querySelectorAll('li').forEach(function (li) {
        var jump = function () {
          var sec = document.getElementById(li.getAttribute('data-target'));
          if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
        };
        li.addEventListener('click', jump);
        // キーボード操作(Enter/Space)でも該当STEPへ移動できるようにする(tabindex="0"の項目に対応)
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            jump();
          }
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

  // ===== 各版のSTEPごとの入力充足状況: 未入力=赤丸、要件を満たしていれば青丸 =====
  function numVal(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, ''));
  }
  function hasHolder(bodyId) {
    var found = false;
    document.querySelectorAll('#' + bodyId + ' .ss-holder, #' + bodyId + ' .tb-holder').forEach(function (r) {
      var hs = r.querySelector('.hs'), hr = r.querySelector('.hr');
      var sVal = hs ? (window.numClean ? window.numClean(hs.value) : parseFloat(hs.value)) : NaN;
      var rVal = hr ? (window.numClean ? window.numClean(hr.value) : parseFloat(hr.value)) : NaN;
      if ((!isNaN(sVal) && sVal > 0) || (!isNaN(rVal) && rVal > 0)) found = true;
    });
    return found;
  }

  // 簡易入力版: STEP1〜3
  function simpleValidity() {
    var step1 = numVal('ssShares') > 0 && numVal('ssParValue') > 0;
    var step2 = numVal('ssV_saizoku') > 0 && numVal('ssV_junsisan') > 0;
    var step3 = hasHolder('ssHolderBody');
    return [step1, step2, step3];
  }

  // 詳細入力: STEP1〜6(STEP2は0も正当な値のため、分母となる総資産のみ必須とする)
  function detailValidity() {
    var step1 = numVal('dtTotalAssetsBook') > 0 && numVal('dtSales') > 0;
    var step2 = numVal('dtTotalAssetsTax') > 0;
    var step3 = numVal('dtA') > 0 && numVal('dtB') > 0 && numVal('dtC') > 0 && numVal('dtD') > 0 &&
      !isNaN(numVal('dtOwnB')) && !isNaN(numVal('dtOwnC')) && !isNaN(numVal('dtOwnD'));
    var step4 = !isNaN(numVal('dtBookNet')) && !isNaN(numVal('dtUnrealized')) &&
      numVal('dtSharesDetail') > 0 && numVal('dtCapital') > 0;
    var step5 = step3 && step4; // 配当還元は自社の配当b・資本金・株式数から自動算定(別入力なし)
    var resultArea = document.getElementById('dtResultArea');
    var step6 = !!(resultArea && !resultArea.classList.contains('hidden'));
    return [step1, step2, step3, step4, step5, step6];
  }

  // 公開情報から入力(TD/TSR)版: STEP1〜4
  function tdbValidity() {
    var step1 = numVal('tbCapital') > 0 && (numVal('tbSales') > 0 || numVal('tbEmp') > 0);
    var step2 = !isNaN(numVal('tbProfit')) && numVal('tbNetAssets') > 0;
    var step3 = numVal('tbA') > 0 && numVal('tbB') > 0 && numVal('tbC') > 0 && numVal('tbD') > 0;
    var step4 = hasHolder('tbHolderBody');
    return [step1, step2, step3, step4];
  }

  function updateValidity() {
    var stepper, results, submitSelector;
    if (detailVisible()) {
      stepper = stepperDetail; results = detailValidity(); submitSelector = '#dtCalcBtn';
    } else if (tdbVisible()) {
      if (!stepperTdb) return;
      stepper = stepperTdb; results = tdbValidity(); submitSelector = '#tbCalcBtn';
    } else {
      stepper = stepperSimple; results = simpleValidity(); submitSelector = '#stockCalcForm button[type="submit"]';
    }
    var items = stepper.querySelectorAll('li');
    items.forEach(function (li, i) {
      var ok = !!results[i];
      li.classList.toggle('step-complete', ok);
      li.classList.toggle('step-incomplete', !ok);
    });
    // 試算ボタン: 全STEPが要件を満たしていればブルー、そうでなければレッドで視認性を高める
    var submitBtn = document.querySelector(submitSelector);
    if (submitBtn) {
      var allOk = results.every(function (v) { return v; });
      submitBtn.classList.toggle('btn-ready', allOk);
      submitBtn.classList.toggle('btn-not-ready', !allOk);
    }
    // 入力の進捗ゲージ: 充足したSTEP数の割合を表示
    var doneCount = results.filter(function (v) { return v; }).length;
    var pct = results.length ? Math.round((doneCount / results.length) * 100) : 0;
    var bar = document.getElementById('stepProgressBar');
    var pctLabel = document.getElementById('stepProgressPct');
    if (bar) bar.style.width = pct + '%';
    if (pctLabel) pctLabel.textContent = pct + '%';
  }
  updateValidity();

  var simpleForm = document.getElementById('stockCalcForm');
  if (simpleForm) {
    simpleForm.addEventListener('input', updateValidity);
    simpleForm.addEventListener('change', updateValidity);
  }
  var detailArea = document.getElementById('detailArea');
  if (detailArea) {
    detailArea.addEventListener('input', updateValidity);
    detailArea.addEventListener('change', updateValidity);
    var dtCalcBtn = document.getElementById('dtCalcBtn');
    if (dtCalcBtn) dtCalcBtn.addEventListener('click', function () { setTimeout(updateValidity, 0); });
  }
  var tdbArea = document.getElementById('tdbArea');
  if (tdbArea) {
    tdbArea.addEventListener('input', updateValidity);
    tdbArea.addEventListener('change', updateValidity);
    tdbArea.addEventListener('click', function (e) {
      if (e.target && (e.target.id === 'tbAddHolder' || e.target.classList.contains('hdel'))) setTimeout(updateValidity, 0);
    });
  }
});

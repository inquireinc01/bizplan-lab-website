document.addEventListener('DOMContentLoaded', function () {
  var chooser = document.getElementById('versionChooser');
  if (!chooser) return;
  var simpleArea = document.getElementById('simpleArea');
  var detailArea = document.getElementById('detailArea');
  var tdbArea = document.getElementById('tdbArea');

  var num = function (id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, ''));
  };
  var set = function (id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; };
  var numOf = function (el) { return window.numClean ? window.numClean(el.value) : parseFloat(String(el.value).replace(/,/g, '')); };
  var MAX_DETAIL_VALUE = 999999999999; // 桁あふれ防止の汎用上限(詳細入力の全数値欄に適用)
  var setNum = function (id, n, unit) {
    var el = document.getElementById(id);
    if (!el) return;
    if (isNaN(n)) { el.value !== undefined ? (el.value = '') : (el.textContent = '-'); return; }
    var s = (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + (unit || '');
    if (el.tagName === 'INPUT') el.value = s; else el.textContent = s;
  };

  // ===== 詳細入力を選ぶ間だけ「STEP1 会社の基本情報」「STEP2 株主の状況」を詳細入力の
  //       先頭に移動し、続くSTEP3〜7(会社規模の判定〜配当還元)の結果をもって自社株評価が
  //       自動入力される続き扱いとするため、自社株評価のバッジは非表示にする(簡易入力単独/
  //       TD・TSR経由では元のSTEP1〜3表示に戻す) =====
  var sstep1 = document.getElementById('sstep1');
  var sstep3 = document.getElementById('sstep3');
  var sstep2Badge = document.getElementById('sstep2Badge');
  var sstep3Badge = document.getElementById('sstep3Badge');
  function applyStepLayout(v) {
    if (v === 'detail') {
      var dstepFamily = document.getElementById('dstepFamily');
      if (sstep1 && dstepFamily && sstep1.nextElementSibling !== dstepFamily) {
        detailArea.insertBefore(sstep1, dstepFamily);
      }
      if (sstep3 && dstepFamily && sstep3.nextElementSibling !== dstepFamily) {
        detailArea.insertBefore(sstep3, dstepFamily);
      }
      if (sstep2Badge) sstep2Badge.classList.add('hidden');
      if (sstep3Badge) sstep3Badge.textContent = 'STEP 2';
      // 詳細入力ではSTEP2(株主の状況)が株価計算の前に表示されるため、まだ未計算の
      // 相続税評価額・法人税法上評価額の列は表示しない
      if (sstep3) sstep3.classList.add('hide-eval-cols');
      // 自社株評価の時価総額はSTEP1〜7の結果からすべて自動入力されるため、入力欄をやめる
      var sstep2El = document.getElementById('sstep2');
      if (sstep2El) {
        sstep2El.classList.add('detail-readonly-eval');
        sstep2El.querySelectorAll('.ss-eval').forEach(function (el) { el.readOnly = true; });
      }
    } else {
      var sstep2 = document.getElementById('sstep2');
      var calcErrorArea = document.getElementById('calcErrorArea');
      if (sstep2) {
        sstep2.classList.remove('detail-readonly-eval');
        sstep2.querySelectorAll('.ss-eval').forEach(function (el) { el.readOnly = false; });
      }
      if (sstep1 && sstep2 && sstep1.nextElementSibling !== sstep2) {
        sstep2.parentElement.insertBefore(sstep1, sstep2);
      }
      if (sstep3 && calcErrorArea && sstep3.nextElementSibling !== calcErrorArea) {
        calcErrorArea.parentElement.insertBefore(sstep3, calcErrorArea);
      }
      if (sstep2Badge) sstep2Badge.classList.remove('hidden');
      if (sstep3Badge) sstep3Badge.textContent = 'STEP 3';
      if (sstep3) sstep3.classList.remove('hide-eval-cols');
      var cpEl = document.getElementById('dtCalcProcess');
      if (cpEl) cpEl.classList.add('hidden');
    }
  }

  // ===== 版選択トグル =====
  function selectVersion(v) {
    chooser.querySelectorAll('.version-card').forEach(function (c) {
      c.classList.toggle('selected', c.getAttribute('data-version') === v);
    });
    applyStepLayout(v);
    simpleArea.classList.toggle('hidden', v !== 'simple');
    detailArea.classList.toggle('hidden', v !== 'detail');
    if (tdbArea) tdbArea.classList.toggle('hidden', v !== 'tdb');
    if (v === 'detail') recalcDetail();
    try { localStorage.setItem('bpl_stock_version', v); } catch (e) {}
  }
  chooser.querySelectorAll('.version-card').forEach(function (c) {
    c.addEventListener('click', function () { selectVersion(c.getAttribute('data-version')); });
    // キーボード操作(Enter/Space)でも選択できるようにする(tabindex="0"のカードに対応)
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        selectVersion(c.getAttribute('data-version'));
      }
    });
  });

  // ===== 自社株評価額の計算過程パネル: デフォルトは折りたたみ、見出しクリックで開閉 =====
  var cpToggle = document.getElementById('dtCalcProcessToggle');
  if (cpToggle) {
    cpToggle.addEventListener('click', function () {
      var body = document.getElementById('dtCalcProcessBody');
      var willOpen = body.classList.contains('hidden');
      body.classList.toggle('hidden', !willOpen);
      cpToggle.setAttribute('aria-expanded', String(willOpen));
      document.getElementById('dtCalcProcess').classList.toggle('open', willOpen);
    });
  }

  // ===== ？ツールチップ(タップで開閉・モバイル対応) =====
  document.querySelectorAll('.help-tip').forEach(function (tip) {
    tip.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var wasOpen = tip.classList.contains('open');
      document.querySelectorAll('.help-tip.open').forEach(function (t) { t.classList.remove('open'); });
      if (!wasOpen) tip.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.help-tip.open').forEach(function (t) { t.classList.remove('open'); });
  });

  // ===== 会社規模の判定 =====
  // レベル 0=大,1=中大,2=中中,3=中小,4=小
  var OKU = 100000000, MAN = 10000;
  function assetLevel(yen, biz) {
    var t;
    if (biz === 'wholesale') t = [20 * OKU, 4 * OKU, 2 * OKU, 7000 * MAN];
    else if (biz === 'retail') t = [15 * OKU, 5 * OKU, 2.5 * OKU, 4000 * MAN];
    else t = [15 * OKU, 5 * OKU, 2.5 * OKU, 5000 * MAN];
    if (yen >= t[0]) return 0; if (yen >= t[1]) return 1; if (yen >= t[2]) return 2; if (yen >= t[3]) return 3; return 4;
  }
  function empLevel(n) {
    if (n > 35) return 0; if (n > 20) return 2; if (n > 5) return 3; return 4;
  }
  function salesLevel(yen, biz) {
    var t;
    if (biz === 'wholesale') t = [30 * OKU, 7 * OKU, 3.5 * OKU, 2 * OKU];
    else if (biz === 'retail') t = [20 * OKU, 5 * OKU, 2.5 * OKU, 6000 * MAN];
    else t = [15 * OKU, 4 * OKU, 2 * OKU, 8000 * MAN];
    if (yen >= t[0]) return 0; if (yen >= t[1]) return 1; if (yen >= t[2]) return 2; if (yen >= t[3]) return 3; return 4;
  }
  var SIZE_LABEL = ['大会社', '中会社（大）', '中会社（中）', '中会社（小）', '小会社'];
  var SIZE_L = [1.0, 0.90, 0.75, 0.60, 0.50];
  var SIZE_SHAKU = [0.7, 0.6, 0.6, 0.6, 0.5];

  function judgeSize() {
    var biz = (document.getElementById('dtBiz') || {}).value || 'other';
    var assets = num('dtTotalAssetsBook') * 1000; // 千円→円
    var sales = num('dtSales') * 1000;
    var empFull = num('dtEmpFull');
    var empHours = num('dtEmpHours');
    var emp = (isNaN(empFull) ? 0 : empFull) + (isNaN(empHours) ? 0 : empHours) / 1800;
    setNum('dtEmpTotal', emp);
    var level;
    if (emp >= 70) {
      level = 0;
    } else {
      var aLv = isNaN(assets) ? 4 : assetLevel(assets, biz);
      var eLv = empLevel(emp);
      var combined1 = Math.max(aLv, eLv); // いずれか下位
      var sLv = isNaN(sales) ? 4 : salesLevel(sales, biz);
      level = Math.min(combined1, sLv); // いずれか上位
    }
    set('dtSizeResult', SIZE_LABEL[level]);
    set('dtLResult', SIZE_L[level].toFixed(2));
    setNum('dtShakushaku', null); // clear
    var shEl = document.getElementById('dtShakushaku');
    if (shEl) shEl.value = SIZE_SHAKU[level].toFixed(1);
    return { level: level, L: SIZE_L[level], shaku: SIZE_SHAKU[level] };
  }

  // ===== 特定の評価会社の判定 =====
  function judgeTokutei(sizeLevel) {
    var totalTax = num('dtTotalAssetsTax') * 1000;
    var stockV = num('dtStockValue') * 1000;
    var landV = num('dtLandValue') * 1000;
    var reasons = [];
    // 株式等保有特定会社
    if (totalTax > 0 && stockV / totalTax >= 0.50) reasons.push('株式等保有特定会社');
    // 土地保有特定会社(大70%/中90%/小90%)
    var landTh = sizeLevel === 0 ? 0.70 : 0.90;
    if (totalTax > 0 && landV / totalTax >= landTh) reasons.push('土地保有特定会社');
    // 比準要素数1(b,c,dのうち2つ以上が0)
    var zeros = ['dtOwnB', 'dtOwnC', 'dtOwnD'].filter(function (id) { return num(id) === 0; }).length;
    if (zeros >= 2) reasons.push('比準要素数1の会社');
    if ((document.getElementById('dtNewCompany') || {}).checked) reasons.push('開業後3年未満');
    if ((document.getElementById('dtDormant') || {}).checked) reasons.push('開業前・休業中・清算中');
    var hit = reasons.length > 0;
    var badge = document.getElementById('dtTokuteiResult');
    if (badge) {
      badge.textContent = hit ? '該当（' + reasons[0] + '等）' : '非該当';
      badge.style.backgroundColor = hit ? 'var(--color-red)' : 'var(--color-navy)';
    }
    return { hit: hit, reasons: reasons };
  }

  // ===== 純資産・配当還元の自動計算 =====
  function calcNetPerShare() {
    var bookNet = num('dtBookNet') * MAN; // 万円→円
    var unreal = num('dtUnrealized') * MAN;
    var shares = num('dtSharesDetail');
    var ded = isNaN(unreal) ? NaN : unreal * 0.38;
    setNum('dtDeduction37', isNaN(ded) ? NaN : ded / MAN); // 万円表示
    if (isNaN(bookNet) || isNaN(unreal) || isNaN(shares) || shares <= 0) { setNum('dtNetAssetPerShare', NaN); return NaN; }
    var taxNet = bookNet + unreal - ded; // = bookNet + unreal*0.63
    var per = taxNet / shares;
    setNum('dtNetAssetPerShare', per);
    return per;
  }
  function calcSimilarPerShare(shaku) {
    var A = num('dtA'), B = num('dtB'), C = num('dtC'), D = num('dtD');
    var b = num('dtOwnB'), c = num('dtOwnC'), d = num('dtOwnD');
    var cap = num('dtCapital'), shares = num('dtSharesDetail');
    if ([A, B, C, D, b, c, d, cap, shares].some(isNaN) || B <= 0 || C <= 0 || D <= 0 || shares <= 0) return NaN;
    var ratio = (b / B + c / C + d / D) / 3;
    var per50 = A * ratio * shaku;
    var capPerShare = cap / shares;
    return per50 * (capPerShare / 50);
  }
  function calcHaito() {
    var b = num('dtOwnB'), cap = num('dtCapital'), shares = num('dtSharesDetail');
    if ([b, cap, shares].some(isNaN) || shares <= 0) { set('dtHaitoResult', '-'); return NaN; }
    var bAdj = b < 2.5 ? 2.5 : b;
    var capPerShare = cap / shares;
    var haito = (bAdj / 0.10) * (capPerShare / 50);
    setNum('dtHaitoResult', haito, ' 円');
    return haito;
  }

  // ===== 自社株評価額の計算過程(最下部の内訳パネル)を描画 =====
  var BIZ_LABEL = { wholesale: '卸売業', retail: '小売・サービス業', other: 'その他の業種' };
  var ASSET_T = { wholesale: [20 * OKU, 4 * OKU, 2 * OKU, 7000 * MAN], retail: [15 * OKU, 5 * OKU, 2.5 * OKU, 4000 * MAN], other: [15 * OKU, 5 * OKU, 2.5 * OKU, 5000 * MAN] };
  var SALES_T = { wholesale: [30 * OKU, 7 * OKU, 3.5 * OKU, 2 * OKU], retail: [20 * OKU, 5 * OKU, 2.5 * OKU, 6000 * MAN], other: [15 * OKU, 4 * OKU, 2 * OKU, 8000 * MAN] };
  var EMP_T = ['35人超', '-', '20人超', '5人超', '5人以下'];

  function renderCalcProcess(ctx) {
    var biz = (document.getElementById('dtBiz') || {}).value || 'other';
    var assetT = ASSET_T[biz], salesT = SALES_T[biz];

    set('cpBiz', BIZ_LABEL[biz]);
    setNum('cpAssets', num('dtTotalAssetsBook'), ' 千円');
    setNum('cpSales', num('dtSales'), ' 千円');
    set('cpEmp', (document.getElementById('dtEmpTotal') || {}).value + ' 人');
    set('cpShares', (window.numFmt ? window.numFmt(ctx.shares) : ctx.shares.toLocaleString('ja-JP')) + ' 株');

    set('cpMethod', ctx.tok.hit ? '純資産価額方式' : (ctx.size.level === 0 ? '類似業種比準価額方式(併用)' : ctx.size.level === 4 ? '併用方式(L=0.50)' : '併用方式(L=' + ctx.size.L.toFixed(2) + ')'));
    set('cpMethodNote', ctx.tok.hit
      ? '特定の評価会社(' + ctx.tok.reasons.join('・') + ')に該当するため、純資産価額方式で評価しています。'
      : (ctx.size.level === 0 ? '大会社のため、類似業種比準価額と純資産価額のいずれか低い方で評価しています。'
        : ctx.size.level === 4 ? '小会社のため、純資産価額と併用方式(L=0.50)のいずれか低い方で評価しています。'
          : '中会社のため、類似業種比準価額×L＋純資産価額×(1-L)と純資産価額のいずれか低い方で評価しています。'));

    var sizeRows = SIZE_LABEL.map(function (label, i) {
      var assetTxt = (i === 0 ? window.numFmt(assetT[0] / MAN) : i === 4 ? '(' + window.numFmt(assetT[3] / MAN) + '未満)' : window.numFmt(assetT[i] / MAN)) + '万円' + (i < 4 ? '以上' : '');
      var salesTxt = (i === 0 ? window.numFmt(salesT[0] / MAN) : i === 4 ? '(' + window.numFmt(salesT[3] / MAN) + '未満)' : window.numFmt(salesT[i] / MAN)) + '万円' + (i < 4 ? '以上' : '');
      var isRow = i === ctx.size.level;
      return '<tr class="' + (isRow ? 'bg-[#eef1f4] font-bold' : '') + '"><td class="px-2 py-1.5 border-b border-gray-100">' + label + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100 text-right">' + assetTxt + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100 text-right">' + EMP_T[i] + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100 text-right">' + salesTxt + '</td></tr>';
    }).join('');
    var sizeBody = document.getElementById('cpSizeTableBody');
    if (sizeBody) sizeBody.innerHTML = sizeRows;
    set('cpSizeResult', SIZE_LABEL[ctx.size.level] + '(L=' + ctx.size.L.toFixed(2) + '、斟酌率=' + ctx.size.shaku.toFixed(1) + ')');

    // ===== 第2表: 特定の評価会社の判定 =====
    var totalTax = num('dtTotalAssetsTax') * 1000, stockV = num('dtStockValue') * 1000, landV = num('dtLandValue') * 1000;
    var stockRatio = totalTax > 0 ? stockV / totalTax : NaN;
    var landRatio = totalTax > 0 ? landV / totalTax : NaN;
    var landTh = ctx.size.level === 0 ? 0.70 : 0.90;
    var zeros = ['dtOwnB', 'dtOwnC', 'dtOwnD'].filter(function (id) { return num(id) === 0; }).length;
    var tokRows = [
      ['比準要素数1の会社(配当・利益・純資産のうち2つ以上が0)', zeros >= 2 ? '該当(' + zeros + '/3が0)' : '非該当', zeros >= 2],
      ['株式等保有特定会社(株式等の価額 ÷ 総資産 ≧ 50%)', isNaN(stockRatio) ? '-' : (stockRatio * 100).toFixed(1) + '%', stockRatio >= 0.5],
      ['土地保有特定会社(土地等の価額 ÷ 総資産 ≧ ' + (landTh * 100) + '%)', isNaN(landRatio) ? '-' : (landRatio * 100).toFixed(1) + '%', landRatio >= landTh],
      ['開業後3年未満・開業前・休業中・清算中', ((document.getElementById('dtNewCompany') || {}).checked || (document.getElementById('dtDormant') || {}).checked) ? '該当' : '非該当', (document.getElementById('dtNewCompany') || {}).checked || (document.getElementById('dtDormant') || {}).checked],
    ];
    var tokBody = document.getElementById('cpTokuteiTableBody');
    if (tokBody) {
      tokBody.innerHTML = tokRows.map(function (r) {
        return '<tr class="' + (r[2] ? 'bg-[#eef1f4] font-bold' : '') + '"><td class="px-2 py-1.5 border-b border-gray-100">' + r[0] + '</td><td class="px-2 py-1.5 border-b border-gray-100 text-right">' + r[1] + '</td></tr>';
      }).join('');
    }
    set('cpTokuteiResult', ctx.tok.hit ? '該当(' + ctx.tok.reasons.join('・') + ')' : '非該当');

    // ===== 第3表: 特定会社・会社規模による評価方式の選択(取引相場のない株式の明細書と同じ並び) =====
    var hit1 = ctx.tok.reasons.indexOf('比準要素数1の会社') !== -1;
    var hitStock = ctx.tok.reasons.indexOf('株式等保有特定会社') !== -1;
    var hitLand = ctx.tok.reasons.indexOf('土地保有特定会社') !== -1;
    var hitNew = ctx.tok.reasons.indexOf('開業後3年未満') !== -1 || ctx.tok.reasons.indexOf('開業前・休業中・清算中') !== -1;
    var row = function (label, desc, hi, rowspan) {
      var labelTd = label === null ? '' : ('<td class="px-2 py-1.5 border-b border-gray-100"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + '>' + label + '</td>');
      return '<tr class="' + (hi ? 'bg-[#eef1f4] font-bold' : '') + '">' + labelTd + '<td class="px-2 py-1.5 border-b border-gray-100">' + desc + '</td></tr>';
    };
    var methodRows = '';
    methodRows += row('比準要素1の会社', '純資産価額(100%)', hit1, 2);
    methodRows += row(null, '類似業種比準価額×0.25＋純資産価額(100%)×0.75', hit1);
    methodRows += row('株式等保有特定会社', '純資産価額(100%)', hitStock);
    methodRows += row('土地保有特定会社', '純資産価額(100%)', hitLand);
    methodRows += row('開業後3年未満の会社等', '純資産価額(100%)', hitNew);
    SIZE_LABEL.forEach(function (label, i) {
      var isRow = !ctx.tok.hit && i === ctx.size.level;
      var top = i === 0 ? '類似業種比準価額' : i === 4 ? '純資産価額(100%)' : '類似業種比準価額×' + SIZE_L[i].toFixed(2) + '＋純資産価額(100%)×' + (1 - SIZE_L[i]).toFixed(2);
      var bottom = i === 0 ? '純資産価額(100%)' : i === 4 ? '類似業種比準価額×0.5＋純資産価額(100%)×0.5' : '純資産価額(100%)×' + SIZE_L[i].toFixed(2) + '＋純資産価額(100%)×' + (1 - SIZE_L[i]).toFixed(2);
      methodRows += row(label, top, isRow, 2);
      methodRows += row(null, bottom, isRow);
    });
    methodRows += row('特例的評価方式(配当還元方式)', '配当還元価額', false);
    methodRows += row('法人税評価額', '純資産価額(100%)', false, 2);
    methodRows += row(null, '類似業種比準価額×0.5＋純資産価額(100%)×0.5', false);
    var methodBody = document.getElementById('cpMethodTableBody');
    if (methodBody) methodBody.innerHTML = methodRows;

    // 第4表: 類似業種比準価額方式(枠付き数式)
    set('cpOwnB', num('dtOwnB'));
    set('cpOwnC', num('dtOwnC'));
    set('cpOwnD', num('dtOwnD'));
    set('cpShaku', ctx.size.shaku.toFixed(1));
    set('cpA', num('dtA'));
    set('cpB', num('dtB'));
    set('cpC', num('dtC'));
    set('cpD', num('dtD'));
    set('cpSimilarResult', isNaN(ctx.sim) ? '(未入力)' : (window.numFmt ? window.numFmt(Math.round(ctx.sim)) : Math.round(ctx.sim).toLocaleString('ja-JP')) + ' 円');

    // 第5表: 純資産価額方式(枠付き数式。万円入力を千円表示に換算)
    var netTaxSen = (num('dtBookNet') + num('dtUnrealized')) * 10;
    var netBookSen = num('dtBookNet') * 10;
    set('cpNetTax', window.numFmt ? window.numFmt(netTaxSen) : netTaxSen.toLocaleString('ja-JP'));
    set('cpNetTax2', window.numFmt ? window.numFmt(netTaxSen) : netTaxSen.toLocaleString('ja-JP'));
    set('cpNetBook', window.numFmt ? window.numFmt(netBookSen) : netBookSen.toLocaleString('ja-JP'));
    set('cpNetShares', window.numFmt ? window.numFmt(ctx.shares) : ctx.shares.toLocaleString('ja-JP'));
    setNum('cpNetResult', ctx.net, ' 円');

    // 第3表: 特例的評価方式(配当還元方式、枠付き数式)
    var bAdj = num('dtOwnB') < 2.5 ? 2.5 : num('dtOwnB');
    set('cpHaitoB', bAdj.toFixed(2));
    set('cpHaitoCap', (num('dtCapital') / ctx.shares).toFixed(1));
    set('cpHaitoResult', isNaN(ctx.haito) ? '(未入力)' : (window.numFmt ? window.numFmt(Math.round(ctx.haito)) : Math.round(ctx.haito).toLocaleString('ja-JP')) + ' 円');

  }

  // ===== STEP3: 同族株主等の判定(第1表の1)。STEP2の株主データからグループごとの
  //       議決権割合(株数割合で近似)を集計し、会社区分・各株主の該当を自動判定する =====
  function judgeFamily() {
    var famFlow = document.getElementById('famFlow');
    var famHolderBody = document.getElementById('famHolderBody');
    if (!famFlow || !famHolderBody) return;
    var holderBody = document.getElementById('ssHolderBody');
    var baseShares = num('ssShares');
    var rows = holderBody ? Array.prototype.slice.call(holderBody.querySelectorAll('.ss-holder')) : [];
    var entries = rows.map(function (r) {
      var name = (r.querySelector('.hn') || {}).value || '(無名)';
      var groupRaw = (r.querySelector('.hg') || {}).value;
      var group = (groupRaw && groupRaw.trim()) ? groupRaw.trim() : name;
      var shares = numOf(r.querySelector('.hs'));
      var ratioIn = numOf(r.querySelector('.hr'));
      var ratio = (!isNaN(shares) && !isNaN(baseShares) && baseShares > 0) ? (shares / baseShares) * 100
        : (!isNaN(ratioIn) ? ratioIn : 0);
      return { name: name, group: group, ratio: ratio };
    });

    var groups = {};
    var order = [];
    entries.forEach(function (e) {
      if (!groups[e.group]) { groups[e.group] = { ratio: 0, count: 0 }; order.push(e.group); }
      groups[e.group].ratio += e.ratio;
      groups[e.group].count += 1;
    });
    var topGroup = null;
    order.forEach(function (g) {
      if (!topGroup || groups[g].ratio > groups[topGroup].ratio) topGroup = g;
    });
    var topRatio = topGroup ? groups[topGroup].ratio : 0;

    var pct = function (n) { return n.toFixed(2) + '%'; };
    var companyType;
    if (!entries.length) {
      companyType = 'STEP2で株主を入力してください';
    } else if (topRatio > 50) {
      companyType = '同族株主のいる会社(50%超基準)';
    } else if (topRatio >= 30) {
      companyType = '同族株主のいる会社(30%以上50%以下基準)';
    } else {
      companyType = '同族株主のいない会社';
    }

    // ===== YES/NOフローチャートを描画 =====
    if (!entries.length) {
      famFlow.innerHTML = '<div class="fam-flow-box"><p class="fam-a" style="color:#9ca3af">STEP2で株主を入力すると、ここに同族株主等の判定フローが表示されます。</p></div>';
    } else {
      var q1Yes = topRatio > 50;
      var q2Yes = topRatio >= 30;
      var flowHtml = '';
      flowHtml += '<div class="fam-flow-box"><p class="fam-q">筆頭株主グループ「' + topGroup + '」の議決権割合(株数割合で近似)は<br>50%を超えるか？</p>' +
        '<p class="fam-a">' + pct(topRatio) + '<span class="fam-flow-badge ' + (q1Yes ? 'yes' : 'no') + '">' + (q1Yes ? 'YES' : 'NO') + '</span></p></div>';
      flowHtml += '<div class="fam-flow-arrow">↓</div>';
      if (!q1Yes) {
        flowHtml += '<div class="fam-flow-box"><p class="fam-q">筆頭株主グループの議決権割合は<br>30%以上か？</p>' +
          '<p class="fam-a">' + pct(topRatio) + '<span class="fam-flow-badge ' + (q2Yes ? 'yes' : 'no') + '">' + (q2Yes ? 'YES' : 'NO') + '</span></p></div>';
        flowHtml += '<div class="fam-flow-arrow">↓</div>';
      }
      flowHtml += '<div class="fam-flow-result"><div>' + companyType + '</div>' +
        '<div class="fam-note">筆頭株主グループ: ' + topGroup + '(' + groups[topGroup].count + '名) / ' + pct(topRatio) + '</div></div>';
      famFlow.innerHTML = flowHtml;
    }

    famHolderBody.innerHTML = entries.length ? entries.map(function (e) {
      var isFamily = topGroup && e.group === topGroup && topRatio >= 30;
      return '<tr class="' + (isFamily ? 'bg-[#eef1f4] font-bold' : '') + '"><td class="px-2 py-1.5 border-b border-gray-100">' + e.name + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100">' + e.group + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100 text-right">' + pct(groups[e.group].ratio) + '</td>' +
        '<td class="px-2 py-1.5 border-b border-gray-100 text-right">' + (isFamily ? '該当' : '非該当') + '</td></tr>';
    }).join('') : '<tr><td class="px-2 py-2 text-gray-400" colspan="4">STEP2で株主を入力してください</td></tr>';
  }

  function recalcDetail() {
    var size = judgeSize();
    judgeTokutei(size.level);
    calcNetPerShare();
    calcHaito();
    judgeFamily();
    updateCalcBtnReady();
  }

  // ===== 計算に必須の項目(帳簿純資産・含み益・発行済株式数)が揃うまでボタンを無効化 =====
  function updateCalcBtnReady() {
    var btn = document.getElementById('dtCalcBtn');
    if (!btn) return;
    var bookNet = num('dtBookNet'), unreal = num('dtUnrealized'), shares = num('dtSharesDetail');
    var ready = !isNaN(bookNet) && !isNaN(unreal) && !isNaN(shares) && shares > 0;
    btn.disabled = !ready;
  }

  // ライブ更新
  detailArea.addEventListener('input', recalcDetail);
  detailArea.addEventListener('change', recalcDetail);
  // 株主の追加・削除(クリックのみでinput/changeイベントを伴わない)でも同族株主等の判定を更新する
  detailArea.addEventListener('click', function (e) {
    if (e.target && (e.target.id === 'ssAddHolder' || e.target.classList.contains('hdel'))) {
      setTimeout(recalcDetail, 0);
    }
  });

  // ===== 原則的評価額の計算 =====
  document.getElementById('dtCalcBtn').addEventListener('click', function () {
    var err = document.getElementById('dtErrorArea');
    err.classList.add('hidden');

    var overflowEl = null;
    detailArea.querySelectorAll('input').forEach(function (el) {
      if (overflowEl || el.type === 'checkbox') return;
      var v = numOf(el);
      if (!isNaN(v) && Math.abs(v) > MAX_DETAIL_VALUE) overflowEl = el;
    });
    if (overflowEl) {
      err.textContent = '入力できる数値は ' + (window.numFmt ? window.numFmt(MAX_DETAIL_VALUE) : MAX_DETAIL_VALUE.toLocaleString('ja-JP')) + ' までです。数値をご確認ください。';
      err.classList.remove('hidden');
      overflowEl.focus();
      return;
    }

    var size = judgeSize();
    var tok = judgeTokutei(size.level);
    var net = calcNetPerShare();
    var haito = calcHaito();
    var sim = calcSimilarPerShare(size.shaku);
    var shares = num('dtSharesDetail');
    if (isNaN(net) || isNaN(shares) || shares <= 0) {
      err.textContent = '純資産価額の計算に必要な項目(帳簿純資産・含み益・発行済株式数)を入力してください。';
      err.classList.remove('hidden');
      return;
    }
    var combined;
    if (tok.hit) {
      combined = net; // 特定評価会社は純資産価額
    } else if (size.level === 0) {
      combined = Math.min(isNaN(sim) ? net : sim, net); // 大会社
    } else if (size.level === 4) {
      combined = Math.min(net, ((isNaN(sim) ? net : sim) * 0.5 + net * 0.5)); // 小会社
    } else {
      var comb = (isNaN(sim) ? net : sim) * size.L + net * (1 - size.L);
      combined = Math.min(comb, net); // 中会社
    }
    var finalPer = combined;
    var total = finalPer * shares;

    persist();

    // ===== 結果ページ(グラフ・タイル)と共有するデータも保存(簡易版と同じキー・同じ形式) =====
    // これにより、詳細入力で入力した場合も結果ページのグラフ・タイルに正しく反映される
    try {
      var SIZE_KEYS = ['large', 'mid-large', 'mid-mid', 'mid-small', 'small'];
      var simPerShare = isNaN(sim) ? net : sim;
      var houjinPerShareShared = simPerShare * 0.5 + net * 0.5;
      var SKEY = 'bpl_stock_valuation_v1';
      var sraw = null;
      try { sraw = localStorage.getItem(SKEY); } catch (e2) {}
      var shared = sraw ? JSON.parse(sraw) : {};
      shared.companySize = SIZE_KEYS[size.level];
      shared.sharesOutstanding = String(shares);
      shared.ss0_saizoku = String(total / MAN);
      shared.ss0_ruiji = String((simPerShare * shares) / MAN);
      shared.ss0_junsisan = String((net * shares) / MAN);
      shared.ss0_houjin = String((houjinPerShareShared * shares) / MAN);
      // 簡易入力側の入力欄(時価総額・円)にもそのまま転記し、下に続けて表示する画面に反映する
      shared.ssV_saizoku = String(Math.round(total));
      shared.ssV_ruiji = String(Math.round(simPerShare * shares));
      shared.ssV_junsisan = String(Math.round(net * shares));
      shared.ssV_heiyo = String(Math.round(combined * shares));
      shared.ssV_houjin = String(Math.round(houjinPerShareShared * shares));
      if (!isNaN(haito)) shared.ssV_haito = String(Math.round(haito * shares));
      localStorage.setItem(SKEY, JSON.stringify(shared));
    } catch (e) {}

    document.getElementById('dtResultArea').classList.remove('hidden');
    renderCalcProcess({ size: size, tok: tok, net: net, sim: sim, haito: haito, combined: combined, finalPer: finalPer, shares: shares, houjinPerShare: houjinPerShareShared });
    var cpEl = document.getElementById('dtCalcProcess');
    if (cpEl) cpEl.classList.remove('hidden');

    // ===== 株価計算後は、続けて簡易入力(自社株評価テーブル・株主の状況)を下に表示する =====
    if (simpleArea) {
      simpleArea.classList.remove('hidden');
      if (window.bplRefreshSimpleFromShared) window.bplRefreshSimpleFromShared();
      var sstep2El = document.getElementById('sstep2');
      if (sstep2El) sstep2El.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ===== 保存/復元 =====
  var DKEY = 'bpl_stock_detail_v1';
  function persist() {
    var data = {};
    detailArea.querySelectorAll('input, select').forEach(function (el) {
      if (!el.id) return;
      data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    try { localStorage.setItem(DKEY, JSON.stringify(data)); } catch (e) {}
  }
  function restore() {
    try {
      var raw = localStorage.getItem(DKEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      Object.keys(data).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || el.readOnly) return;
        if (el.type === 'checkbox') el.checked = data[id]; else el.value = data[id];
      });
    } catch (e) {}
  }

  // ===== 初期化 =====
  restore();
  var savedVer = null;
  try { savedVer = localStorage.getItem('bpl_stock_version'); } catch (e) {}
  selectVersion(savedVer === 'detail' || savedVer === 'tdb' ? savedVer : 'simple');
  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
});

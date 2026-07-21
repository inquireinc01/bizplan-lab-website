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
  var setNum = function (id, n, unit) {
    var el = document.getElementById(id);
    if (!el) return;
    if (isNaN(n)) { el.value !== undefined ? (el.value = '') : (el.textContent = '-'); return; }
    var s = (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + (unit || '');
    if (el.tagName === 'INPUT') el.value = s; else el.textContent = s;
  };

  // ===== 版選択トグル =====
  function selectVersion(v) {
    chooser.querySelectorAll('.version-card').forEach(function (c) {
      c.classList.toggle('selected', c.getAttribute('data-version') === v);
    });
    simpleArea.classList.toggle('hidden', v !== 'simple');
    detailArea.classList.toggle('hidden', v !== 'detail');
    if (tdbArea) tdbArea.classList.toggle('hidden', v !== 'tdb');
    if (v === 'detail') recalcDetail();
    try { localStorage.setItem('bpl_stock_version', v); } catch (e) {}
  }
  chooser.querySelectorAll('.version-card').forEach(function (c) {
    c.addEventListener('click', function () { selectVersion(c.getAttribute('data-version')); });
  });

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

  function recalcDetail() {
    var size = judgeSize();
    judgeTokutei(size.level);
    calcNetPerShare();
    calcHaito();
  }

  // ライブ更新
  detailArea.addEventListener('input', recalcDetail);
  detailArea.addEventListener('change', recalcDetail);

  // ===== 原則的評価額の計算 =====
  document.getElementById('dtCalcBtn').addEventListener('click', function () {
    var err = document.getElementById('dtErrorArea');
    err.classList.add('hidden');
    var size = judgeSize();
    var tok = judgeTokutei(size.level);
    var net = calcNetPerShare();
    calcHaito();
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

    set('dtResSimilar', isNaN(sim) ? '(未入力)' : (window.numFmt ? window.numFmt(Math.round(sim)) : Math.round(sim).toLocaleString('ja-JP')) + ' 円');
    setNum('dtResNet', net, ' 円');
    set('dtResSize', SIZE_LABEL[size.level] + ' / L=' + size.L.toFixed(2));
    setNum('dtResCombined', combined, ' 円');
    setNum('dtResFinalPerShare', finalPer, ' 円');
    set('dtResShares', (window.numFmt ? window.numFmt(Math.round(shares)) : Math.round(shares).toLocaleString('ja-JP')) + ' 株');
    setNum('dtResFinalTotal', total / MAN, ' 万円');
    set('dtResNote', tok.hit
      ? '特定の評価会社（' + tok.reasons.join('・') + '）に該当するため、純資産価額方式で評価しています。'
      : (size.level === 0 ? '大会社のため、類似業種比準価額(純資産価額とのいずれか低い方)で評価しています。'
        : size.level === 4 ? '小会社のため、純資産価額と併用方式(L=0.50)のいずれか低い方で評価しています。'
          : '中会社のため、類似業種比準価額×L＋純資産価額×(1-L)と純資産価額のいずれか低い方で評価しています。'));

    persist();

    // ===== 結果ページ(グラフ・タイル)と共有するデータも保存(簡易版と同じキー・同じ形式) =====
    // これにより、詳細版で入力した場合も結果ページのグラフ・タイルに正しく反映される
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
      localStorage.setItem(SKEY, JSON.stringify(shared));
    } catch (e) {}

    document.getElementById('dtResultArea').classList.remove('hidden');
    document.getElementById('dtResultArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('dtResetBtn').addEventListener('click', function () {
    if (!window.confirm('詳細版の入力内容をクリアします。よろしいですか？')) return;
    detailArea.querySelectorAll('input, select').forEach(function (el) {
      if (el.type === 'checkbox') el.checked = false; else el.value = '';
    });
    try { localStorage.removeItem('bpl_stock_detail_v1'); } catch (e) {}
    document.getElementById('dtResultArea').classList.add('hidden');
    recalcDetail();
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

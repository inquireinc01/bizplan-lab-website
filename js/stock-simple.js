document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('stockCalcForm');
  if (!form || !document.getElementById('ssHolderBody')) return;

  var STORAGE_KEY = 'bpl_stock_valuation_v1';
  var SIZE_CONFIG = {
    large: { l: 1.00, label: '大会社' },
    'mid-large': { l: 0.90, label: '中会社（大）' },
    'mid-mid': { l: 0.75, label: '中会社（中）' },
    'mid-small': { l: 0.60, label: '中会社（小）' },
    small: { l: 0.50, label: '小会社' },
  };
  var EVAL_KEYS = ['saizoku', 'ruiji', 'junsisan', 'heiyo', 'houjin', 'haito'];

  var num = function (v) { return window.numClean ? window.numClean(v) : parseFloat(String(v == null ? '' : v).replace(/,/g, '')); };
  var fmt = function (n) { return window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'); };
  var setTxt = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };

  // ===== 自社株評価テーブル: 一株あたり・額面倍率 =====
  function perShareOf(key) {
    var shares = num(document.getElementById('ssShares').value);
    var v = num((document.getElementById('ssV_' + key) || {}).value);
    if (isNaN(v) || isNaN(shares) || shares <= 0) return NaN;
    return v / shares;
  }
  // 詳細入力中は額面を直接編集させるため、資本金からの自動計算は行わない。
  // 資本金が未入力のときは既存の額面を消さない(消すと額面倍率が全て「-」になってしまう)
  function updateParFromCapital() {
    var detailArea = document.getElementById('detailArea');
    var inDetail = detailArea && !detailArea.classList.contains('hidden');
    if (inDetail) return;
    var capitalEl = document.getElementById('ssCapital');
    var parEl = document.getElementById('ssParValue');
    if (!capitalEl || !parEl) return;
    var capital = num(capitalEl.value);
    var shares = num(document.getElementById('ssShares').value);
    if (isNaN(capital) || capital <= 0 || isNaN(shares) || shares <= 0) return;
    parEl.value = fmt(capital / shares); // カンマ区切りで表示する
  }
  window.bplUpdateParFromCapital = updateParFromCapital;

  function recalcEval() {
    updateParFromCapital();
    var shares = num(document.getElementById('ssShares').value);
    var par = num(document.getElementById('ssParValue').value);
    EVAL_KEYS.forEach(function (key) {
      var per = perShareOf(key);
      setTxt('ssPer_' + key, isNaN(per) ? '-' : fmt(per) + ' 円');
      setTxt('ssMult_' + key, (isNaN(per) || isNaN(par) || par <= 0) ? '-' : (per / par).toFixed(2) + ' 倍');
    });
    var sz = SIZE_CONFIG[(document.getElementById('ssSize') || {}).value] || SIZE_CONFIG['mid-mid'];
    var lEl = document.getElementById('ssL');
    if (lEl) lEl.value = sz.l.toFixed(2);
  }

  // ===== 株主一覧 =====
  var holderBody = document.getElementById('ssHolderBody');
  function holderRow(d) {
    d = d || {};
    var tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 ss-holder';
    tr.innerHTML =
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:11rem" value="' + (d.name || '') + '" placeholder="氏名・法人名" /></td>' +
      '<td class="px-1 py-1 ss-group-col"><input type="text" class="hg form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:7rem" value="' + (d.group || '') + '" placeholder="(株主名と同じ)" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hs js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.shares || '') + '" placeholder="株数" /></td>' +
      '<td class="px-2 py-2 text-right hr-display">-</td>' +
      '<td class="px-2 py-2 text-right hreka ss-eval-col">-</td>' +
      '<td class="px-2 py-2 text-right hhojin ss-eval-col">-</td>' +
      '<td class="px-1 py-1 text-center"><button type="button" class="hdel text-gray-400 hover:text-red-500 font-bold" title="削除">×</button></td>';
    tr.querySelector('.hdel').addEventListener('click', function () { tr.remove(); recalcHolders(); });
    holderBody.appendChild(tr);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
    return tr;
  }

  // 株数から比率(議決権割合)を自動表示。差分は「その他株主」行として自動追加する
  // (株主名が1件でも入力された時点で、発行済株式数との差分を表示する)
  function recalcHolders() {
    var rows = Array.prototype.slice.call(holderBody.querySelectorAll('.ss-holder'));
    var baseShares = num(document.getElementById('ssShares').value); // 発行済株式数を基準
    var perReka = perShareOf('saizoku');
    var perHojin = perShareOf('houjin');
    var sumShares = 0, totReka = 0, totHojin = 0, anyNamed = false;
    rows.forEach(function (r) {
      if (r.querySelector('.hn').value.trim()) anyNamed = true;
      var shares = num(r.querySelector('.hs').value);
      var eff = !isNaN(shares) ? shares : 0;
      var ratio = (!isNaN(baseShares) && baseShares > 0) ? (eff / baseShares) * 100 : NaN;
      var reka = !isNaN(perReka) ? eff * perReka : NaN;
      var hojin = !isNaN(perHojin) ? eff * perHojin : NaN;
      r.querySelector('.hr-display').textContent = isNaN(ratio) ? '-' : ratio.toFixed(2) + '%';
      r.querySelector('.hreka').textContent = isNaN(reka) ? '-' : fmt(reka);
      r.querySelector('.hhojin').textContent = isNaN(hojin) ? '-' : fmt(hojin);
      sumShares += eff;
      if (!isNaN(reka)) totReka += reka;
      if (!isNaN(hojin)) totHojin += hojin;
    });

    // 入力された株数の合計が発行済株式数を超えている場合はエラー表示
    var overAllocated = !isNaN(baseShares) && baseShares > 0 && sumShares > baseShares;
    var errEl = document.getElementById('ssHolderError');
    rows.forEach(function (r) {
      r.querySelector('.hs').classList.toggle('input-error', overAllocated);
    });
    if (errEl) {
      if (overAllocated) {
        errEl.textContent = '入力された株数の合計(' + fmt(sumShares) + '株)が発行済株式数(' + fmt(baseShares) + '株)を超えています(超過: ' + fmt(sumShares - baseShares) + '株)。';
        errEl.classList.remove('hidden');
      } else {
        errEl.classList.add('hidden');
      }
    }

    var existingOther = document.getElementById('ssOtherRow');
    if (existingOther) existingOther.remove();
    if (anyNamed && !overAllocated && !isNaN(baseShares) && baseShares > 0) {
      var otherShares = Math.max(0, baseShares - sumShares);
      var otherRatio = (otherShares / baseShares) * 100;
      var otherReka = !isNaN(perReka) ? otherShares * perReka : NaN;
      var otherHojin = !isNaN(perHojin) ? otherShares * perHojin : NaN;
      var tr = document.createElement('tr');
      tr.id = 'ssOtherRow';
      tr.className = 'border-b border-gray-100 text-gray-500 italic';
      tr.innerHTML =
        '<td class="px-2 py-2">その他株主</td>' +
        '<td class="px-2 py-2 ss-group-col">(自動計算)</td>' +
        '<td class="px-2 py-2 text-right">' + fmt(otherShares) + '</td>' +
        '<td class="px-2 py-2 text-right">' + otherRatio.toFixed(2) + '%</td>' +
        '<td class="px-2 py-2 text-right ss-eval-col">' + (isNaN(otherReka) ? '-' : fmt(otherReka)) + '</td>' +
        '<td class="px-2 py-2 text-right ss-eval-col">' + (isNaN(otherHojin) ? '-' : fmt(otherHojin)) + '</td>' +
        '<td></td>';
      holderBody.appendChild(tr);
      sumShares += otherShares;
      if (!isNaN(otherReka)) totReka += otherReka;
      if (!isNaN(otherHojin)) totHojin += otherHojin;
    }

    var sumRatio = (!isNaN(baseShares) && baseShares > 0) ? (sumShares / baseShares) * 100 : 0;
    setTxt('ssTotShares', fmt(sumShares));
    setTxt('ssTotRatio', sumRatio ? sumRatio.toFixed(2) + '%' : '-');
    setTxt('ssTotReka', totReka ? fmt(totReka) : '-');
    setTxt('ssTotHojin', totHojin ? fmt(totHojin) : '-');
  }

  // ===== STEP2 相続税評価額とSTEP1(会社規模=Lの割合)の整合性チェック =====
  // ルール: 相続税評価額は「純資産価額」か「併用方式」のいずれか安いほう。
  //         大会社のみ「類似業種比準価額」と「純資産価額」のいずれか安いほう。
  // 転記値がこのルールと合わない場合、該当欄を薄い赤にして見出し横に赤文字を出す。
  // アラートのみで、シミュレーション自体はそのまま進められる。
  // (明細書の端数処理による差を考慮し、期待値の1%または1,000円までのズレは許容)
  var WARN_KEYS = ['saizoku', 'ruiji', 'junsisan', 'heiyo'];
  function checkSaizokuConsistency() {
    var warnEl = document.getElementById('ssSaizokuWarn');
    if (!warnEl) return;
    var clearAll = function () {
      warnEl.classList.add('hidden');
      WARN_KEYS.forEach(function (k) {
        var el = document.getElementById('ssV_' + k);
        if (el) el.classList.remove('ss-consistency-warn');
      });
    };
    var v = {};
    WARN_KEYS.forEach(function (k) { v[k] = num((document.getElementById('ssV_' + k) || {}).value); });
    var sizeKey = (document.getElementById('ssSize') || {}).value || 'mid-mid';
    var candKey = sizeKey === 'large' ? 'ruiji' : 'heiyo';
    if (isNaN(v.saizoku) || isNaN(v.junsisan) || isNaN(v[candKey])) { clearAll(); return; }
    var expected = Math.min(v[candKey], v.junsisan);
    var tol = Math.max(Math.abs(expected) * 0.01, 1000);
    if (Math.abs(v.saizoku - expected) <= tol) { clearAll(); return; }
    // 整合していない: 相続税評価額と、比較対象の2欄を薄い赤で示す
    clearAll();
    warnEl.classList.remove('hidden');
    ['saizoku', candKey, 'junsisan'].forEach(function (k) {
      var el = document.getElementById('ssV_' + k);
      if (el) el.classList.add('ss-consistency-warn');
    });
  }

  function recalcAll() { recalcEval(); recalcHolders(); checkSaizokuConsistency(); }

  document.getElementById('ssAddHolder').addEventListener('click', function () { holderRow({}); recalcHolders(); });
  form.addEventListener('change', function () {
    recalcAll();
    // STEP2で転記した自社株評価(相続税評価額など)を最優先で結果ページに反映するため、
    // 「この内容で試算する」を押す前でも、変更を確定するたびに保存しておく。
    // (従来は送信時のバリデーションを全て通らないと保存されず、
    //  資本金未入力などで止まると転記した評価額が結果に反映されなかった)
    persistOnly();
  });

  // ===== 保存 / 復元 =====
  function loadStored() {
    try { var raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function collect() {
    var shares = num(document.getElementById('ssShares').value);
    var data = {
      companySize: (document.getElementById('ssSize') || {}).value,
      ss_capital: (document.getElementById('ssCapital') || {}).value,
      sharesOutstanding: String(isNaN(shares) ? '' : shares),
      ss_parValue: document.getElementById('ssParValue').value,
    };
    EVAL_KEYS.forEach(function (key) {
      var v = num((document.getElementById('ssV_' + key) || {}).value);
      data['ssV_' + key] = document.getElementById('ssV_' + key).value; // 円(表示用)
      // グラフ起点(万円)
      data['ss0_' + key] = isNaN(v) ? '' : String(v / 10000);
    });
    var holders = [];
    holderBody.querySelectorAll('.ss-holder').forEach(function (r) {
      holders.push({
        name: r.querySelector('.hn').value,
        group: r.querySelector('.hg').value,
        shares: r.querySelector('.hs').value,
      });
    });
    data.ss_holders = JSON.stringify(holders);
    return data;
  }
  function persistOnly() {
    try {
      var merged = Object.assign({}, loadStored() || {}, collect());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}
  }
  function restore() {
    var s = loadStored();
    if (!s) return false;
    if (s.companySize && document.getElementById('ssSize')) document.getElementById('ssSize').value = s.companySize;
    if (s.ss_capital && document.getElementById('ssCapital')) document.getElementById('ssCapital').value = s.ss_capital;
    if (s.sharesOutstanding) document.getElementById('ssShares').value = s.sharesOutstanding;
    if (s.ss_parValue) document.getElementById('ssParValue').value = s.ss_parValue;
    EVAL_KEYS.forEach(function (key) {
      if (s['ssV_' + key] !== undefined && document.getElementById('ssV_' + key)) document.getElementById('ssV_' + key).value = s['ssV_' + key];
    });
    if (s.ss_holders) {
      try {
        var hs = JSON.parse(s.ss_holders);
        if (hs.length) { holderBody.innerHTML = ''; hs.forEach(holderRow); return true; }
      } catch (e) {}
    }
    return true;
  }

  // ===== 送信 → 結果ページ =====
  var MAX_SHARES = 999999999; // 発行済株式数の上限(桁あふれ防止)
  var MAX_PAR = 9999999; // 額面(円)の上限
  var MAX_EVAL = 999999999999; // 評価額(時価総額・円)の上限

  // 進めない原因になった入力欄を薄い赤でマークし、そこへスクロール+フォーカスして入力を促す
  function clearFieldErrors() {
    form.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
  }
  function failWith(message, el) {
    var err = document.getElementById('calcErrorArea');
    err.textContent = message;
    err.classList.remove('hidden');
    if (el) {
      el.classList.add('input-error');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { el.focus({ preventScroll: true }); } catch (e2) { el.focus(); }
    }
  }
  // 一度エラーになった欄は、値を入れ直したら赤を解除する(入力中でも即座に消す)
  function clearOwnError(e) {
    if (e.target && e.target.classList && e.target.classList.contains('input-error')) {
      e.target.classList.remove('input-error');
    }
  }
  form.addEventListener('input', clearOwnError);
  form.addEventListener('change', clearOwnError);

  // 入力欄でEnterを押しただけで暗黙送信(=結果ページへ遷移)されるのを防ぐ。
  // Enterは「入力確定」として扱い、blurでchangeを発火させて再計算だけ行う。
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (!t || t.tagName === 'TEXTAREA') return;
    if (t.tagName === 'BUTTON' || t.type === 'submit') return; // ボタン上のEnterは通す
    e.preventDefault();
    if (typeof t.blur === 'function') t.blur();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('calcErrorArea');
    err.classList.add('hidden');
    clearFieldErrors();

    var sharesEl = document.getElementById('ssShares');
    var shares = num(sharesEl.value);
    if (isNaN(shares) || shares <= 0) {
      failWith('発行済株式数を入力してください。', sharesEl);
      return;
    }
    if (shares > MAX_SHARES) {
      failWith('発行済株式数は ' + fmt(MAX_SHARES) + ' 株までです。数値をご確認ください。', sharesEl);
      return;
    }
    var parEl = document.getElementById('ssParValue');
    var par = num(parEl.value);
    if (isNaN(par) || par <= 0) {
      // 額面は資本金÷発行済株式数で自動計算されるため、未入力なら資本金の入力を促す
      // 親div(.ss-simple-only)が非表示のときはoffsetParentがnullになるので、それで判定する
      var capEl = document.getElementById('ssCapital');
      var isSimple = capEl && capEl.offsetParent !== null;
      failWith(isSimple ? '資本金を入力してください（額面を自動計算します）。' : '額面を入力してください。', isSimple ? capEl : parEl);
      return;
    }
    if (par > MAX_PAR) {
      failWith('額面は ' + fmt(MAX_PAR) + ' 円までです。数値をご確認ください。', parEl);
      return;
    }
    for (var i = 0; i < EVAL_KEYS.length; i++) {
      var evKey = EVAL_KEYS[i];
      var v = num((document.getElementById('ssV_' + evKey) || {}).value);
      if (!isNaN(v) && Math.abs(v) > MAX_EVAL) {
        failWith('評価額(時価総額)は ' + fmt(MAX_EVAL) + ' 円までです。数値をご確認ください。', document.getElementById('ssV_' + evKey));
        return;
      }
    }
    // 比率は株数から自動計算されるため、株数の合計が発行済株式数を超えていないかで判定する
    var sumHolderShares = 0, firstHolderShareEl = null;
    holderBody.querySelectorAll('.ss-holder').forEach(function (r) {
      var hsEl = r.querySelector('.hs');
      if (!firstHolderShareEl) firstHolderShareEl = hsEl;
      var s = num(hsEl.value);
      if (!isNaN(s)) sumHolderShares += s;
    });
    if (sumHolderShares > shares) {
      holderBody.querySelectorAll('.ss-holder .hs').forEach(function (el) { el.classList.add('input-error'); });
      failWith('株主の株数の合計(' + fmt(sumHolderShares) + '株)が発行済株式数(' + fmt(shares) + '株)を超えています。株数をご確認ください。', firstHolderShareEl);
      return;
    }
    if (sumHolderShares <= 0) {
      failWith('株主の株数を入力してください。', firstHolderShareEl);
      return;
    }
    if (isNaN(num((document.getElementById('ssV_junsisan') || {}).value))) {
      failWith('純資産価額の時価総額を入力してください（グラフの起点に必要です）。', document.getElementById('ssV_junsisan'));
      return;
    }
    persistOnly();
    // テスト配信用のtrial-ページ上では、trial-版の結果ページへ遷移する
    var pfx = window.location.pathname.indexOf('trial-') >= 0 ? 'trial-' : '';
    window.location.href = pfx + 'stock-valuation-result.html';
  });

  // ===== 初期データ(サンプル) =====
  function seedHolders() {
    holderBody.innerHTML = '';
    holderRow({});
  }
  function seedEval() {
    var d = { saizoku: '302371500', ruiji: '235572000', junsisan: '502770000', heiyo: '302371500', houjin: '369171000', haito: '40000000' };
    EVAL_KEYS.forEach(function (k) { var el = document.getElementById('ssV_' + k); if (el && el.value === '') el.value = d[k]; });
  }
  // 額面は資本金から自動計算されるため、初期表示でも整合するよう資本金を入れておく
  // (発行済株式数400株 × 額面50,000円 = 20,000,000円)
  function seedCapital() {
    var capEl = document.getElementById('ssCapital');
    if (capEl && capEl.value === '') capEl.value = '20000000';
  }

  // ===== 初期化 =====
  var restored = restore();
  if (!restored) { seedEval(); seedHolders(); }
  seedCapital();
  recalcAll();
  var resume = document.getElementById('resumeLink');
  if (restored && resume) resume.classList.remove('hidden');
  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);

  // ===== 詳細入力・TDB/TSR側から計算後に呼び出し、共有データを画面に反映する =====
  window.bplRefreshSimpleFromShared = function () {
    restore();
    recalcAll();
    if (window.numReformatAll) window.numReformatAll();
  };
});

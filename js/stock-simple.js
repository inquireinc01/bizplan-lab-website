document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('stockCalcForm');
  if (!form || !document.getElementById('ssHolderBody')) return;

  var STORAGE_KEY = 'bpl_stock_valuation_v1';
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
  function recalcEval() {
    var shares = num(document.getElementById('ssShares').value);
    var par = num(document.getElementById('ssParValue').value);
    EVAL_KEYS.forEach(function (key) {
      var per = perShareOf(key);
      setTxt('ssPer_' + key, isNaN(per) ? '-' : fmt(per) + ' 円');
      setTxt('ssMult_' + key, (isNaN(per) || isNaN(par) || par <= 0) ? '-' : (per / par).toFixed(2) + ' 倍');
    });
  }

  // ===== 株主一覧 =====
  var holderBody = document.getElementById('ssHolderBody');
  function holderRow(d) {
    d = d || {};
    var tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 ss-holder';
    tr.innerHTML =
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:11rem" value="' + (d.name || '') + '" placeholder="氏名・法人名" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hg form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:7rem" value="' + (d.group || '') + '" placeholder="(株主名と同じ)" /></td>' +
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
        '<td class="px-2 py-2">(自動計算)</td>' +
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

  function recalcAll() { recalcEval(); recalcHolders(); }

  document.getElementById('ssAddHolder').addEventListener('click', function () { holderRow({}); recalcHolders(); });
  form.addEventListener('input', recalcAll);
  form.addEventListener('change', recalcAll);

  // ===== 保存 / 復元 =====
  function loadStored() {
    try { var raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function collect() {
    var shares = num(document.getElementById('ssShares').value);
    var data = {
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('calcErrorArea');
    err.classList.add('hidden');
    var shares = num(document.getElementById('ssShares').value);
    if (isNaN(shares) || shares <= 0) {
      err.textContent = '発行済株式数を入力してください。'; err.classList.remove('hidden'); return;
    }
    if (shares > MAX_SHARES) {
      err.textContent = '発行済株式数は ' + fmt(MAX_SHARES) + ' 株までです。数値をご確認ください。';
      err.classList.remove('hidden');
      document.getElementById('ssShares').focus();
      return;
    }
    var par = num(document.getElementById('ssParValue').value);
    if (!isNaN(par) && par > MAX_PAR) {
      err.textContent = '額面は ' + fmt(MAX_PAR) + ' 円までです。数値をご確認ください。';
      err.classList.remove('hidden');
      document.getElementById('ssParValue').focus();
      return;
    }
    for (var i = 0; i < EVAL_KEYS.length; i++) {
      var evKey = EVAL_KEYS[i];
      var v = num((document.getElementById('ssV_' + evKey) || {}).value);
      if (!isNaN(v) && Math.abs(v) > MAX_EVAL) {
        err.textContent = '評価額(時価総額)は ' + fmt(MAX_EVAL) + ' 円までです。数値をご確認ください。';
        err.classList.remove('hidden');
        document.getElementById('ssV_' + evKey).focus();
        return;
      }
    }
    var ratioOver100 = false;
    holderBody.querySelectorAll('.ss-holder').forEach(function (r) {
      var ratio = num(r.querySelector('.hr').value);
      if (!isNaN(ratio) && ratio > 100) ratioOver100 = true;
    });
    if (ratioOver100) {
      err.textContent = '株主の比率が100%を超えています。株数・比率をご確認ください。';
      err.classList.remove('hidden');
      return;
    }
    if (isNaN(num((document.getElementById('ssV_junsisan') || {}).value))) {
      err.textContent = '純資産価額の時価総額を入力してください（グラフの起点に必要です）。'; err.classList.remove('hidden'); return;
    }
    persistOnly();
    window.location.href = 'stock-valuation-result.html';
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

  // ===== 初期化 =====
  var restored = restore();
  if (!restored) { seedEval(); seedHolders(); }
  resyncAllHolderRows();
  recalcAll();
  var resume = document.getElementById('resumeLink');
  if (restored && resume) resume.classList.remove('hidden');
  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);

  // ===== 詳細入力・TDB/TSR側から計算後に呼び出し、共有データを画面に反映する =====
  window.bplRefreshSimpleFromShared = function () {
    restore();
    resyncAllHolderRows();
    recalcAll();
    if (window.numReformatAll) window.numReformatAll();
  };
});

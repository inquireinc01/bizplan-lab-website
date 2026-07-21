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
  function recalcEval() {
    var shares = num(document.getElementById('ssShares').value);
    var par = num(document.getElementById('ssParValue').value);
    EVAL_KEYS.forEach(function (key) {
      var per = perShareOf(key);
      setTxt('ssPer_' + key, isNaN(per) ? '-' : fmt(per) + ' 円');
      setTxt('ssMult_' + key, (isNaN(per) || isNaN(par) || par <= 0) ? '-' : (per / par).toFixed(2) + ' 倍');
    });
    var sz = SIZE_CONFIG[document.getElementById('ssSize').value] || SIZE_CONFIG['mid-mid'];
    document.getElementById('ssL').value = sz.l.toFixed(2);
  }

  // ===== 株主一覧 =====
  var holderBody = document.getElementById('ssHolderBody');
  function holderRow(d) {
    d = d || {};
    var tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 ss-holder';
    tr.innerHTML =
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:11rem" value="' + (d.name || '') + '" placeholder="氏名・法人名" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hs js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.shares || '') + '" placeholder="株数" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hr js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.ratio || '') + '" placeholder="％" /></td>' +
      '<td class="px-2 py-2 text-right hreka">-</td>' +
      '<td class="px-2 py-2 text-right hhojin">-</td>' +
      '<td class="px-1 py-1 text-center"><button type="button" class="hdel text-gray-400 hover:text-red-500 font-bold" title="削除">×</button></td>';
    tr.querySelector('.hdel').addEventListener('click', function () { tr.remove(); recalcHolders(); });
    holderBody.appendChild(tr);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
    return tr;
  }

  // 株数⇔比率: 一方を入力すると発行済株式数を基準にもう一方へ自動反映
  function syncRatioFromShares(row, baseShares) {
    var shares = num(row.querySelector('.hs').value);
    if (isNaN(shares) || isNaN(baseShares) || baseShares <= 0) return;
    row.querySelector('.hr').value = ((shares / baseShares) * 100).toFixed(2);
  }
  function syncSharesFromRatio(row, baseShares) {
    var ratio = num(row.querySelector('.hr').value);
    if (isNaN(ratio) || isNaN(baseShares) || baseShares <= 0) return;
    row.querySelector('.hs').value = String(Math.round((ratio / 100) * baseShares));
  }
  function resyncAllHolderRows() {
    var baseShares = num(document.getElementById('ssShares').value);
    holderBody.querySelectorAll('.ss-holder').forEach(function (row) {
      if (!isNaN(num(row.querySelector('.hs').value))) {
        syncRatioFromShares(row, baseShares);
      } else if (!isNaN(num(row.querySelector('.hr').value))) {
        syncSharesFromRatio(row, baseShares);
      }
    });
    if (window.numReformatAll) window.numReformatAll();
  }
  holderBody.addEventListener('input', function (e) {
    var row = e.target.closest('.ss-holder');
    if (!row) return;
    var baseShares = num(document.getElementById('ssShares').value);
    if (e.target.classList.contains('hs')) {
      syncRatioFromShares(row, baseShares);
    } else if (e.target.classList.contains('hr')) {
      syncSharesFromRatio(row, baseShares);
    }
  });
  document.getElementById('ssShares').addEventListener('input', resyncAllHolderRows);

  // 株数・比率のどちらの入力でも計算できる(株数優先。株数が空なら比率×発行済株式数)
  function recalcHolders() {
    var rows = holderBody.querySelectorAll('.ss-holder');
    var baseShares = num(document.getElementById('ssShares').value); // 発行済株式数を基準
    var perReka = perShareOf('saizoku');
    var perHojin = perShareOf('houjin');
    var sumEff = 0, sumRatio = 0, totReka = 0, totHojin = 0;
    rows.forEach(function (r) {
      var shares = num(r.querySelector('.hs').value);
      var ratioIn = num(r.querySelector('.hr').value); // ％入力
      var eff = !isNaN(shares) ? shares : ((!isNaN(ratioIn) && !isNaN(baseShares)) ? (ratioIn / 100) * baseShares : NaN);
      var reka = (!isNaN(eff) && !isNaN(perReka)) ? eff * perReka : NaN;
      var hojin = (!isNaN(eff) && !isNaN(perHojin)) ? eff * perHojin : NaN;
      r.querySelector('.hreka').textContent = isNaN(reka) ? '-' : fmt(reka);
      r.querySelector('.hhojin').textContent = isNaN(hojin) ? '-' : fmt(hojin);
      if (!isNaN(eff)) sumEff += eff;
      if (!isNaN(reka)) totReka += reka;
      if (!isNaN(hojin)) totHojin += hojin;
      var ratioVal = !isNaN(ratioIn) ? ratioIn : ((!isNaN(shares) && baseShares > 0) ? (shares / baseShares) * 100 : NaN);
      if (!isNaN(ratioVal)) sumRatio += ratioVal;
    });
    setTxt('ssTotShares', fmt(sumEff));
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
      companySize: document.getElementById('ssSize').value,
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
        shares: r.querySelector('.hs').value,
        ratio: r.querySelector('.hr').value,
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
    if (s.companySize) document.getElementById('ssSize').value = s.companySize;
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
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('calcErrorArea');
    err.classList.add('hidden');
    var shares = num(document.getElementById('ssShares').value);
    if (isNaN(shares) || shares <= 0) {
      err.textContent = '発行済株式数を入力してください。'; err.classList.remove('hidden'); return;
    }
    if (isNaN(num((document.getElementById('ssV_junsisan') || {}).value))) {
      err.textContent = '純資産価額の時価総額を入力してください（グラフの起点に必要です）。'; err.classList.remove('hidden'); return;
    }
    persistOnly();
    window.location.href = 'stock-valuation-result.html';
  });

  document.getElementById('calcResetBtn').addEventListener('click', function () {
    if (!window.confirm('簡易版の入力内容をクリアします。よろしいですか？')) return;
    form.querySelectorAll('input').forEach(function (el) { if (!el.readOnly) el.value = ''; });
    seedHolders();
    recalcAll();
  });

  // ===== 初期データ(サンプル) =====
  function seedHolders() {
    holderBody.innerHTML = '';
    [
      { name: '社長', shares: '300' },
      { name: '専務', shares: '60' },
      { name: 'その他株主', shares: '40' },
    ].forEach(holderRow);
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
});

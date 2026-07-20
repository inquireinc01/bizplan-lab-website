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
      setTxt('ssMult_' + key, (isNaN(per) || isNaN(par) || par <= 0) ? '-' : (per / par).toFixed(3) + ' 倍');
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
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" value="' + (d.name || '') + '" placeholder="氏名" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hs form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.shares || '') + '" placeholder="0" /></td>' +
      '<td class="px-2 py-2 text-right hr">-</td>' +
      '<td class="px-2 py-2 text-right hreka">-</td>' +
      '<td class="px-2 py-2 text-right hhojin">-</td>' +
      '<td class="px-1 py-1"><input type="text" class="h3 form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.p3 || '') + '" placeholder="0" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="h2 form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.p2 || '') + '" placeholder="0" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="h1 form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.p1 || '') + '" placeholder="0" /></td>' +
      '<td class="px-1 py-1 text-center"><button type="button" class="hdel text-gray-400 hover:text-red-500 font-bold" title="削除">×</button></td>';
    tr.querySelector('.hdel').addEventListener('click', function () { tr.remove(); recalcHolders(); });
    holderBody.appendChild(tr);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
    return tr;
  }
  function recalcHolders() {
    var rows = holderBody.querySelectorAll('.ss-holder');
    var totShares = 0, tot3 = 0, tot2 = 0, tot1 = 0;
    rows.forEach(function (r) {
      var s = num(r.querySelector('.hs').value);
      if (!isNaN(s)) totShares += s;
      var p3 = num(r.querySelector('.h3').value); if (!isNaN(p3)) tot3 += p3;
      var p2 = num(r.querySelector('.h2').value); if (!isNaN(p2)) tot2 += p2;
      var p1 = num(r.querySelector('.h1').value); if (!isNaN(p1)) tot1 += p1;
    });
    var perReka = perShareOf('saizoku');
    var perHojin = perShareOf('houjin');
    var totReka = 0, totHojin = 0;
    rows.forEach(function (r) {
      var s = num(r.querySelector('.hs').value);
      var ratio = (!isNaN(s) && totShares > 0) ? s / totShares : NaN;
      r.querySelector('.hr').textContent = isNaN(ratio) ? '-' : (ratio * 100).toFixed(2) + '%';
      var reka = (!isNaN(s) && !isNaN(perReka)) ? s * perReka : NaN;
      var hojin = (!isNaN(s) && !isNaN(perHojin)) ? s * perHojin : NaN;
      r.querySelector('.hreka').textContent = isNaN(reka) ? '-' : fmt(reka);
      r.querySelector('.hhojin').textContent = isNaN(hojin) ? '-' : fmt(hojin);
      if (!isNaN(reka)) totReka += reka;
      if (!isNaN(hojin)) totHojin += hojin;
    });
    setTxt('ssTotShares', fmt(totShares));
    setTxt('ssTotRatio', totShares > 0 ? '100.00%' : '-');
    setTxt('ssTotReka', totReka ? fmt(totReka) : '-');
    setTxt('ssTotHojin', totHojin ? fmt(totHojin) : '-');
    setTxt('ssTot3', fmt(tot3)); setTxt('ssTot2', fmt(tot2)); setTxt('ssTot1', fmt(tot1));
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
        p3: r.querySelector('.h3').value, p2: r.querySelector('.h2').value, p1: r.querySelector('.h1').value,
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
      { name: '社長', shares: '300', p3: '298', p2: '298', p1: '300' },
      { name: '専務', shares: '60', p3: '60', p2: '60', p1: '60' },
      { name: 'その他株主', shares: '40', p3: '42', p2: '42', p1: '40' },
    ].forEach(holderRow);
  }
  function seedEval() {
    var d = { saizoku: '302371500', ruiji: '235572000', junsisan: '502770000', heiyo: '302371500', houjin: '369171000', haito: '40000000' };
    EVAL_KEYS.forEach(function (k) { var el = document.getElementById('ssV_' + k); if (el && el.value === '') el.value = d[k]; });
  }

  // ===== 初期化 =====
  var restored = restore();
  if (!restored) { seedEval(); seedHolders(); }
  recalcAll();
  var resume = document.getElementById('resumeLink');
  if (restored && resume) resume.classList.remove('hidden');
  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
});

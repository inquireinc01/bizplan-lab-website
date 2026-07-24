document.addEventListener('DOMContentLoaded', function () {
  var area = document.getElementById('tdbArea');
  if (!area) return;

  var STORAGE_KEY = 'bpl_stock_valuation_v1';
  var OWN_STORAGE_KEY = 'bpl_stock_tdb_v1';
  var MAN = 10000;
  var FIELD_IDS = ['tbBiz', 'tbCapital', 'tbSales', 'tbEmp', 'tbProfit', 'tbDividend', 'tbNetAssets', 'tbA', 'tbB', 'tbC', 'tbD'];

  var num = function (id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return numVal(el.value);
  };
  function numVal(v) {
    return window.numClean ? window.numClean(v) : parseFloat(String(v == null ? '' : v).replace(/,/g, ''));
  }
  var fmt = function (n) { return window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'); };

  // ===== 会社規模の判定(総資産を使わず、売上高・従業員数のうち有利な方を採用) =====
  var OKU = 100000000;
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
  var SIZE_KEYS = ['large', 'mid-large', 'mid-mid', 'mid-small', 'small'];
  var SIZE_L = [1.0, 0.90, 0.75, 0.60, 0.50];
  var SIZE_SHAKU = [0.7, 0.6, 0.6, 0.6, 0.5];

  function judgeSizeLite() {
    var biz = (document.getElementById('tbBiz') || {}).value || 'other';
    var sales = num('tbSales') * 1000; // 千円→円
    var emp = num('tbEmp');
    var sLv = isNaN(sales) ? 4 : salesLevel(sales, biz);
    var eLv = isNaN(emp) ? 4 : empLevel(emp);
    var level = Math.min(sLv, eLv); // 売上・従業員数のうち会社規模が大きく判定される方を採用
    return { level: level, key: SIZE_KEYS[level], L: SIZE_L[level], shaku: SIZE_SHAKU[level] };
  }

  // ===== 株主一覧(簡易版と同じ操作感) =====
  var holderBody = document.getElementById('tbHolderBody');
  function holderRow(d) {
    d = d || {};
    var tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100 tb-holder';
    tr.innerHTML =
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:11rem" value="' + (d.name || '') + '" placeholder="氏名・法人名" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hs js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.shares || '') + '" placeholder="株数" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hr js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" value="' + (d.ratio || '') + '" placeholder="％" /></td>' +
      '<td class="px-1 py-1 text-center"><button type="button" class="hdel text-gray-400 hover:text-red-500 font-bold" title="削除">×</button></td>';
    tr.querySelector('.hdel').addEventListener('click', function () { tr.remove(); });
    holderBody.appendChild(tr);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
    return tr;
  }
  document.getElementById('tbAddHolder').addEventListener('click', function () { holderRow({}); });

  // 株数⇔比率: 一方を入力すると発行済株式数(資本金÷額面50円で概算)を基準にもう一方へ自動反映
  function baseSharesFromCapital() {
    var capital = num('tbCapital');
    return (!isNaN(capital) && capital > 0) ? capital / 50 : NaN;
  }
  function syncRatioFromShares(row, baseShares) {
    var shares = numVal(row.querySelector('.hs').value);
    if (isNaN(shares) || isNaN(baseShares) || baseShares <= 0) return;
    row.querySelector('.hr').value = ((shares / baseShares) * 100).toFixed(2);
  }
  function syncSharesFromRatio(row, baseShares) {
    var ratio = numVal(row.querySelector('.hr').value);
    if (isNaN(ratio) || isNaN(baseShares) || baseShares <= 0) return;
    row.querySelector('.hs').value = String(Math.round((ratio / 100) * baseShares));
  }
  function resyncAllHolderRows() {
    var baseShares = baseSharesFromCapital();
    holderBody.querySelectorAll('.tb-holder').forEach(function (row) {
      if (!isNaN(numVal(row.querySelector('.hs').value))) {
        syncRatioFromShares(row, baseShares);
      } else if (!isNaN(numVal(row.querySelector('.hr').value))) {
        syncSharesFromRatio(row, baseShares);
      }
    });
    if (window.numReformatAll) window.numReformatAll();
  }
  holderBody.addEventListener('input', function (e) {
    var row = e.target.closest('.tb-holder');
    if (!row) return;
    var baseShares = baseSharesFromCapital();
    if (e.target.classList.contains('hs')) {
      syncRatioFromShares(row, baseShares);
    } else if (e.target.classList.contains('hr')) {
      syncSharesFromRatio(row, baseShares);
    }
  });
  var tbCapitalEl = document.getElementById('tbCapital');
  if (tbCapitalEl) tbCapitalEl.addEventListener('input', resyncAllHolderRows);

  function collectHolders() {
    var holders = [];
    holderBody.querySelectorAll('.tb-holder').forEach(function (r) {
      holders.push({
        name: r.querySelector('.hn').value,
        shares: r.querySelector('.hs').value,
        ratio: r.querySelector('.hr').value,
      });
    });
    return holders;
  }

  // ===== 保存 / 復元(このフォーム自身の入力値) =====
  function persistOwn() {
    try {
      var data = {};
      FIELD_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) data[id] = el.value;
      });
      data.tb_holders = JSON.stringify(collectHolders());
      localStorage.setItem(OWN_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }
  function restoreOwn() {
    var s = null;
    try { var raw = localStorage.getItem(OWN_STORAGE_KEY); s = raw ? JSON.parse(raw) : null; } catch (e) {}
    if (!s) { holderRow({}); return; }
    FIELD_IDS.forEach(function (id) {
      if (s[id] !== undefined && document.getElementById(id)) document.getElementById(id).value = s[id];
    });
    if (s.tb_holders) {
      try {
        var hs = JSON.parse(s.tb_holders);
        if (hs.length) { holderBody.innerHTML = ''; hs.forEach(holderRow); return; }
      } catch (e) {}
    }
    holderRow({});
  }
  area.addEventListener('input', persistOwn);
  area.addEventListener('change', persistOwn);

  // ===== 試算(自社株×生命保険の結果ページへブリッジ) =====
  var MAX_TDB_VALUE = 999999999999; // 桁あふれ防止の汎用上限

  document.getElementById('tbCalcBtn').addEventListener('click', function () {
    var err = document.getElementById('tbErrorArea');
    err.classList.add('hidden');

    var overflowEl = null;
    area.querySelectorAll('input').forEach(function (el) {
      if (overflowEl) return;
      var v = numVal(el.value);
      if (!isNaN(v) && Math.abs(v) > MAX_TDB_VALUE) overflowEl = el;
    });
    if (overflowEl) {
      err.textContent = '入力できる数値は ' + fmt(MAX_TDB_VALUE) + ' までです。数値をご確認ください。';
      err.classList.remove('hidden');
      overflowEl.focus();
      return;
    }
    var ratioOver100 = false;
    holderBody.querySelectorAll('.tb-holder').forEach(function (r) {
      var ratio = numVal(r.querySelector('.hr').value);
      if (!isNaN(ratio) && ratio > 100) ratioOver100 = true;
    });
    if (ratioOver100) {
      err.textContent = '株主の比率が100%を超えています。株数・比率をご確認ください。';
      err.classList.remove('hidden');
      return;
    }

    var capital = num('tbCapital');
    var shares = (!isNaN(capital) && capital > 0) ? capital / 50 : NaN; // 額面50円で株式数を概算
    var A = num('tbA'), B = num('tbB'), C = num('tbC'), D = num('tbD');
    var profit = num('tbProfit'), dividend = num('tbDividend'), netAssets = num('tbNetAssets');

    if (isNaN(shares) || shares <= 0) {
      err.textContent = '資本金を入力してください(額面50円として発行済株式数を概算します)。';
      err.classList.remove('hidden');
      return;
    }
    if ([A, B, C, D].some(isNaN) || B <= 0 || C <= 0 || D <= 0) {
      err.textContent = '類似業種比準の参考値(A・B・C・D)をすべて入力してください。';
      err.classList.remove('hidden');
      return;
    }

    var size = judgeSizeLite();
    var b = (!isNaN(dividend) ? dividend : 0) / shares; // 自社の1株(50円)当たり配当金額
    var c = (!isNaN(profit) ? profit : 0) / shares; // 自社の1株(50円)当たり利益金額(税引前利益をそのまま使用)
    var d = (!isNaN(netAssets) ? netAssets : 0) / shares; // 自社の1株(50円)当たり純資産価額(簿価)

    var ratio = (b / B + c / C + d / D) / 3;
    var similarPerShare = Math.max(0, A * ratio * size.shaku); // 類似業種比準価額(1株)
    var netAssetPerShareMarket = D; // 時価純資産(1株)=類似業種のD値をそのまま採用(詳細な資産評価の代用)
    var combined = similarPerShare * size.L + netAssetPerShareMarket * (1 - size.L); // 併用方式(1株)
    var saizokuPerShare = Math.min(combined, netAssetPerShareMarket); // 相続税評価額(1株)
    var houjinPerShare = similarPerShare * 0.5 + netAssetPerShareMarket * 0.5; // 法人税法上評価額(1株)

    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var shared = raw ? JSON.parse(raw) : {};
      shared.companySize = size.key;
      shared.sharesOutstanding = String(shares);
      shared.ss_parValue = '50';
      shared.ss0_saizoku = String((saizokuPerShare * shares) / MAN);
      shared.ss0_ruiji = String((similarPerShare * shares) / MAN);
      shared.ss0_junsisan = String((netAssetPerShareMarket * shares) / MAN);
      shared.ss0_houjin = String((houjinPerShare * shares) / MAN);
      // 簡易入力側の入力欄(時価総額・円)にもそのまま転記し、下に続けて表示する画面に反映する
      shared.ssV_saizoku = String(Math.round(saizokuPerShare * shares));
      shared.ssV_ruiji = String(Math.round(similarPerShare * shares));
      shared.ssV_junsisan = String(Math.round(netAssetPerShareMarket * shares));
      shared.ssV_heiyo = String(Math.round(combined * shares));
      shared.ssV_houjin = String(Math.round(houjinPerShare * shares));
      shared.ss_holders = JSON.stringify(collectHolders());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shared));
      localStorage.setItem('bpl_stock_version', 'tdb');
    } catch (e) {}

    persistOwn();

    // ===== 試算後は、続けて簡易入力(自社株評価テーブル・株主の状況)を下に表示する =====
    var simpleArea = document.getElementById('simpleArea');
    if (simpleArea) {
      simpleArea.classList.remove('hidden');
      if (window.bplRefreshSimpleFromShared) window.bplRefreshSimpleFromShared();
      simpleArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  restoreOwn();
  resyncAllHolderRows();
});

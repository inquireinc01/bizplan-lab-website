document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('stockCalcForm');
  if (!form || !document.getElementById('ssHolderBody')) return;

  var STORAGE_KEY = 'bpl_stock_valuation_v1';
  // テスト配信ページ(trial-)ではサンプル既定値を使わず、データクリア状態を既定にする
  var IS_TRIAL = window.location.pathname.indexOf('trial-') >= 0;
  var SIZE_CONFIG = {
    large: { l: 1.00, label: '大会社' },
    'mid-large': { l: 0.90, label: '中会社（大）' },
    'mid-mid': { l: 0.75, label: '中会社（中）' },
    'mid-small': { l: 0.60, label: '中会社（小）' },
    small: { l: 0.50, label: '小会社' },
  };
  var EVAL_KEYS = ['saizoku', 'ruiji', 'junsisan', 'heiyo', 'houjin', 'haito'];

  // サンプル既定値(2026-07-28に画像指定の数値へ変更)。
  // 全体ルール: 黒字の実値は入れず、グレーの「入力例：数値 単位」placeholderで示し、
  // 計算・表示はブランク時にこの値へフォールバックする
  var SS_DEF = {
    ssShares: 200000, ssCapital: 10000000,
    ssV_saizoku: 300000000, ssV_ruiji: 300000000, ssV_junsisan: 600000000,
    ssV_heiyo: 300000000, ssV_houjin: 450000000, ssV_haito: 5000000,
    holderName: '社長', holderShares: 200000,
  };
  // ブランク時にサンプル既定値へフォールバックして読む
  var numD = function (id) {
    var el = document.getElementById(id);
    var v = num(el ? el.value : '');
    if (IS_TRIAL) return v; // テスト版はサンプル値へフォールバックしない
    return isNaN(v) && SS_DEF[id] !== undefined ? SS_DEF[id] : v;
  };

  var num = function (v) { return window.numClean ? window.numClean(v) : parseFloat(String(v == null ? '' : v).replace(/,/g, '')); };
  var fmt = function (n) { return window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'); };
  var setTxt = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };

  // ===== 自社株評価テーブル: 一株あたり・額面倍率 =====
  function perShareOf(key) {
    var shares = numD('ssShares');
    var v = numD('ssV_' + key);
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
    var capital = numD('ssCapital');
    var shares = numD('ssShares');
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
      '<td class="px-1 py-1"><input type="text" class="hn form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:11rem" placeholder="氏名・法人名" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="ha js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" style="min-width:3.5rem" placeholder="任意" /></td>' +
      '<td class="px-1 py-1 ss-group-col"><input type="text" class="hg form-input w-full rounded px-2 py-1.5 text-sm" style="min-width:7rem" placeholder="(株主名と同じ)" /></td>' +
      '<td class="px-1 py-1"><input type="text" class="hs js-num form-input w-full rounded px-2 py-1.5 text-right text-sm" placeholder="0 株" /></td>' +
      '<td class="px-2 py-2 text-right hr-display">-</td>' +
      '<td class="px-2 py-2 text-right hreka ss-eval-col">-</td>' +
      '<td class="px-2 py-2 text-right hhojin ss-eval-col">-</td>' +
      '<td class="px-1 py-1 text-center"><button type="button" class="hdel text-gray-400 hover:text-red-500 font-bold" title="削除">×</button></td>';
    // 値はHTMLに埋め込まず、生成後にプロパティへ代入する。
    // 埋め込むと株主名の「"」等で属性が壊れ、再読込後に名前が欠ける(2026-08-25修正)
    tr.querySelector('.hn').value = d.name || '';
    tr.querySelector('.ha').value = d.age || '';
    tr.querySelector('.hg').value = d.group || '';
    tr.querySelector('.hs').value = d.shares || '';
    tr.querySelector('.hdel').addEventListener('click', function () { tr.remove(); recalcHolders(); });
    holderBody.appendChild(tr);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
    return tr;
  }

  // 株数から比率(議決権割合)を自動表示。差分は「その他株主」行として自動追加する
  // (株主名が1件でも入力された時点で、発行済株式数との差分を表示する)
  function recalcHolders() {
    var rows = Array.prototype.slice.call(holderBody.querySelectorAll('.ss-holder'));
    var baseShares = numD('ssShares'); // 発行済株式数を基準(ブランク時はサンプル値)
    var perReka = perShareOf('saizoku');
    var perHojin = perShareOf('houjin');
    var sumShares = 0, totReka = 0, totHojin = 0, anyNamed = false;
    rows.forEach(function (r) {
      if (r.querySelector('.hn').value.trim()) anyNamed = true;
      var shares = num(r.querySelector('.hs').value);
      if (isNaN(shares) && r.querySelector('.hs').dataset.def) shares = num(r.querySelector('.hs').dataset.def);
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
    WARN_KEYS.forEach(function (k) { v[k] = numD('ssV_' + k); });
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

  // ===== 残余利益方式: 割引率・加算年数の既定値(5%・5年)と手入力モード =====
  var rimRateManual = false;
  function applyRimRateState() {
    var rateEl = document.getElementById('ssRimRate');
    var yearsEl = document.getElementById('ssRimYears');
    if (!rateEl || !yearsEl) return;
    rateEl.readOnly = !rimRateManual;
    yearsEl.readOnly = !rimRateManual;
    rateEl.classList.toggle('bg-gray-50', !rimRateManual);
    yearsEl.classList.toggle('bg-gray-50', !rimRateManual);
    ['ssRimRateManualBtn', 'ssRimYearsManualBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.textContent = rimRateManual ? '既定値に戻す' : '手入力する';
    });
    if (!rimRateManual) {
      rateEl.value = '5';
      yearsEl.value = '5';
    }
  }
  function onRimRateToggle(focusId) {
    rimRateManual = !rimRateManual;
    applyRimRateState();
    recalcRim();
    persistOnly();
    if (rimRateManual) {
      var el = document.getElementById(focusId);
      if (el) { try { el.focus({ preventScroll: true }); el.select(); } catch (e) {} }
    }
  }
  var rimRateManualBtn = document.getElementById('ssRimRateManualBtn');
  if (rimRateManualBtn) rimRateManualBtn.addEventListener('click', function () { onRimRateToggle('ssRimRate'); });
  var rimYearsManualBtn = document.getElementById('ssRimYearsManualBtn');
  if (rimYearsManualBtn) rimYearsManualBtn.addEventListener('click', function () { onRimRateToggle('ssRimYears'); });

  // ===== 残余利益方式: 現価係数と参考評価額の自動計算 =====
  var MAX_RIM_YEN = 999999999999; // 金額の上限(兆円未満。中小企業の想定を大きく超える値はエラー)
  function recalcRim() {
    var coefEl = document.getElementById('ssRimCoef');
    var valEl = document.getElementById('ssRimValue');
    if (!coefEl || !valEl) return;
    var errEl = document.getElementById('ssRimError');
    var errs = [];
    var mark = function (id, bad) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('input-error', !!bad);
    };
    var bookEl = document.getElementById('ssRimBook');
    var profitEl = document.getElementById('ssRimProfit');
    var book = num(bookEl && bookEl.value);
    var profit = num(profitEl && profitEl.value);
    var bookOver = !isNaN(book) && Math.abs(book) > MAX_RIM_YEN;
    var profitOver = !isNaN(profit) && Math.abs(profit) > MAX_RIM_YEN;
    mark('ssRimBook', bookOver);
    mark('ssRimProfit', profitOver);
    if (bookOver || profitOver) errs.push('金額は ' + fmt(MAX_RIM_YEN) + ' 円以内で入力してください。');

    var r = num((document.getElementById('ssRimRate') || {}).value);
    var n = num((document.getElementById('ssRimYears') || {}).value);
    var rateBad = rimRateManual && !isNaN(r) && (r <= 0 || r > 100);
    var yearsBad = rimRateManual && !isNaN(n) && (n < 1 || n > 100);
    mark('ssRimRate', rateBad);
    mark('ssRimYears', yearsBad);
    if (rateBad) errs.push('割引率は 0.1〜100% で入力してください。');
    if (yearsBad) errs.push('超過収益加算年数は 1〜100年 で入力してください。');

    if (errEl) {
      errEl.textContent = errs.join(' ');
      errEl.classList.toggle('hidden', errs.length === 0);
    }
    if (isNaN(r) || r <= 0 || r > 100) r = 5; // 既定5%(範囲外は計算にも使わない)
    if (isNaN(n) || n < 1 || n > 100) n = 5;  // 既定5年
    n = Math.round(n);
    var rr = r / 100;
    var coef = (1 - Math.pow(1 + rr, -n)) / rr;
    coefEl.value = coef.toFixed(2);
    if (errs.length > 0) { valEl.value = ''; valEl.placeholder = '入力値を確認してください'; return; }
    if (isNaN(book) || isNaN(profit)) { valEl.value = ''; valEl.placeholder = '自動計算：円'; return; }
    var value = book + (profit - book * rr) * coef;
    valEl.value = fmt(value) + ' 円';
  }

  function recalcAll() { recalcEval(); recalcHolders(); checkSaizokuConsistency(); recalcRim(); }

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
        age: r.querySelector('.ha').value,
        group: r.querySelector('.hg').value,
        shares: r.querySelector('.hs').value,
      });
    });
    data.ss_holders = JSON.stringify(holders);
    // 残余利益方式(任意入力)。表示用の円と、結果ページ用の万円換算を両方保存する
    ['ssRimBook', 'ssRimProfit', 'ssRimRate', 'ssRimYears'].forEach(function (id) {
      data[id] = ((document.getElementById(id) || {}).value || '');
    });
    var rimBook = num((document.getElementById('ssRimBook') || {}).value);
    var rimProfit = num((document.getElementById('ssRimProfit') || {}).value);
    data.rim0_book = isNaN(rimBook) ? '' : String(rimBook / 10000);
    data.rim0_profit = isNaN(rimProfit) ? '' : String(rimProfit / 10000);
    data.rimRate = ((document.getElementById('ssRimRate') || {}).value || '');
    data.rimYears = ((document.getElementById('ssRimYears') || {}).value || '');
    data.ssRimRateManual = rimRateManual ? '1' : '0';
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
    ['ssRimBook', 'ssRimProfit', 'ssRimRate', 'ssRimYears'].forEach(function (id) {
      if (s[id] !== undefined && document.getElementById(id)) document.getElementById(id).value = s[id];
    });
    rimRateManual = s.ssRimRateManual === '1';
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
  // 注意: changeには登録しない。changeではrecalcAllが正しいエラー状態を作り直すが、
  // その直後にclearOwnErrorが走ると、超過エラーで付けた赤枠を編集中の欄からだけ
  // 外してしまい「間違えた行だけ赤くない」逆転表示になる(2026-08-25修正)。

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

  // 送信時: 入力例のままのブランク欄は、サンプル値を実値として確定してから試算に進む
  function materializeDefaults() {
    if (IS_TRIAL) return; // テスト版はサンプル値を確定しない
    ['ssShares', 'ssCapital'].concat(EVAL_KEYS.map(function (k) { return 'ssV_' + k; })).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.value === '' && SS_DEF[id] !== undefined) el.value = String(SS_DEF[id]);
    });
    var firstHs = holderBody.querySelector('.ss-holder .hs');
    var anyShares = false;
    holderBody.querySelectorAll('.ss-holder .hs').forEach(function (el) { if (el.value !== '') anyShares = true; });
    if (!anyShares && firstHs && firstHs.dataset.def) {
      firstHs.value = firstHs.dataset.def;
      var hn = firstHs.closest('.ss-holder').querySelector('.hn');
      if (hn && hn.value === '') hn.value = SS_DEF.holderName;
    }
    updateParFromCapital();
    if (window.numReformatAll) window.numReformatAll();
  }

  form.addEventListener('submit', function (e) {
    materializeDefaults();
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
  // 全体ルール: サンプル既定値は黒字で入れず、グレーの「入力例：数値 単位」で表示する
  function seedHolders() {
    holderBody.innerHTML = '';
    var tr = holderRow({});
    if (IS_TRIAL) return; // テスト版はサンプルを見せない(クリア状態)
    var hn = tr.querySelector('.hn'), hs = tr.querySelector('.hs');
    hn.placeholder = '入力例：' + SS_DEF.holderName;
    hs.placeholder = '入力例：' + fmt(SS_DEF.holderShares) + ' 株';
    hs.dataset.def = String(SS_DEF.holderShares);
  }
  function seedEval() {
    EVAL_KEYS.forEach(function (k) {
      var el = document.getElementById('ssV_' + k);
      if (el && el.value === '') {
        el.placeholder = IS_TRIAL ? '0 円' : '入力例：' + fmt(SS_DEF['ssV_' + k]) + ' 円';
      }
    });
  }
  function seedCapital() {
    var sharesEl = document.getElementById('ssShares');
    if (sharesEl && sharesEl.value === '') {
      sharesEl.placeholder = IS_TRIAL ? '0 株' : '入力例：' + fmt(SS_DEF.ssShares) + ' 株';
    }
    var capEl = document.getElementById('ssCapital');
    if (capEl && capEl.value === '') {
      capEl.placeholder = IS_TRIAL ? '0 円' : '入力例：' + fmt(SS_DEF.ssCapital) + ' 円';
    }
  }

  // ===== 開発・デモ用: ?dummy=1 でダミーデータ一式を投入する =====
  function seedDummyData() {
    var F = {
      ssShares: '200,000', ssCapital: '10,000,000',
      ssV_saizoku: '300,000,000', ssV_ruiji: '300,000,000', ssV_junsisan: '600,000,000',
      ssV_heiyo: '300,000,000', ssV_houjin: '450,000,000', ssV_haito: '5,000,000',
      ssRimBook: '500,000,000', ssRimProfit: '50,000,000',
    };
    Object.keys(F).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = F[id];
    });
    holderBody.innerHTML = '';
    holderRow({ name: '山田太郎', age: '60', group: '山田家', shares: '120,000' });
    holderRow({ name: '山田花子', age: '58', group: '山田家', shares: '50,000' });
    holderRow({ name: '佐藤一郎', age: '45', group: '', shares: '30,000' });
    if (window.numReformatAll) window.numReformatAll();
  }

  // ===== 初期化 =====
  var restored = restore();
  if (!restored) { seedEval(); seedHolders(); }
  seedCapital();
  if (/[?&]dummy=1/.test(window.location.search)) {
    seedDummyData();
    persistOnly();
  }
  applyRimRateState();
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

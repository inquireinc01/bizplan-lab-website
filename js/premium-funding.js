/* ============================================================
   原資創出モデル(積み上げ式)
   - 法人・個人それぞれで「痛みなく」創出できるキャッシュを項目ごとに積み上げ、
     合計を先頭に大きく表示する。それがそのまま新たな保険料の原資になる
   - 項目1: 他社既契約保険の見直し(法人/個人)
     項目2: 役員報酬の見直し(社会保険料削減。会社負担=法人/本人負担=個人)
     項目3: 経費科目の適正化(法人)
   - 入力の確定(change)で即時再計算する(全体ルール)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('pfTool');
  if (!root) return;

  const $ = (id) => document.getElementById(id);

  /* ===== ？ツールチップ: タップでも開けるようにする ===== */
  document.querySelectorAll('.help-tip').forEach(function (tip) {
    tip.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      const wasOpen = tip.classList.contains('open');
      document.querySelectorAll('.help-tip.open').forEach((t) => t.classList.remove('open'));
      if (!wasOpen) tip.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.help-tip.open').forEach((t) => t.classList.remove('open'));
  });

  /* ===== 数字と単位(万円等は数字より小さく表示する全体ルール) ===== */
  const UNIT_RE = /([0-9][0-9,.]*)\s*(万円\s*\/\s*年|万円\s*\/\s*月|万円|円|％|%)/g;
  const withUnit = (txt) => String(txt).replace(UNIT_RE, '$1<span class="unit">$2</span>');
  const svgAmount = (txt, size) => String(txt).replace(UNIT_RE, function (m, n, u) {
    return `<tspan font-size="${size}">${n}</tspan><tspan font-size="${Math.round(size * 0.68)}"> ${u}</tspan>`;
  });
  const fmt = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));
  const man = (n) => fmt(n) + ' 万円';

  /* ===== 項目の配色(先頭の積み上げバーと凡例で共通) ===== */
  const C_ITEM = ['#3b6ea5', '#2d5580', '#7a9cc0'];

  /* ===== 数値のカウントアップ ===== */
  const countState = {};
  const COUNT_MS = 800;
  function countUp(id, to, format) {
    const el = $(id);
    if (!el) return;
    const from = countState[id] === undefined ? 0 : countState[id];
    countState[id] = to;
    if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
    clearTimeout(el._countTimer);
    if (from === to) { el.innerHTML = withUnit(format(to)); return; }
    const start = performance.now();
    const step = function (now) {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - p, 3); // ease-out
      el.innerHTML = withUnit(format(from + (to - from) * e));
      if (p < 1) el._countRaf = requestAnimationFrame(step);
      else el._countRaf = null;
    };
    el._countRaf = requestAnimationFrame(step);
    // 非表示タブ等でrequestAnimationFrameが止まっても最終値は必ず表示する
    el._countTimer = setTimeout(function () {
      if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
      el.innerHTML = withUnit(format(to));
    }, COUNT_MS + 250);
  }

  /* ===== 積み上げバー =====
     法人・個人の2本。共通のスケール(大きい方の合計)で描き、項目ごとに色分けする。
     角丸は帯全体をclipPathで抜き、区分の境目が段差にならないようにする ===== */
  function drawStack(svg, parts, cap) {
    if (!svg) return;
    const W = 560, BAR_X = 2, BAR_W = 556, BAR_Y = 4, BAR_H = 36;
    const RX = BAR_H / 2;
    const cid = svg.id + 'Clip';
    const gid = svg.id + 'Gloss';
    const defs = `<clipPath id="${cid}"><rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}"/></clipPath>`
      + `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">`
      + `<stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>`
      + `<stop offset="0.55" stop-color="#ffffff" stop-opacity="0.02"/>`
      + `<stop offset="1" stop-color="#000000" stop-opacity="0.07"/></linearGradient>`;

    if (!(cap > 0)) {
      svg.innerHTML = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}" fill="#eff2f6"/>`
        + `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 6}" font-size="16" fill="#9ca3af" text-anchor="middle">金額を入力してください</text>`;
      return;
    }

    // 帯に入れる文字の必要幅を文字数から見積もる(半角0.55em・全角1em)
    const widthOf = (label, size) => {
      let need = size * 1.4;
      for (let k = 0; k < label.length; k += 1) need += /[0-9,.\s%]/.test(label[k]) ? size * 0.55 : size;
      return need;
    };

    let bars = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="#eff2f6"/>`;
    let labels = '';
    let x = BAR_X;
    parts.forEach(function (p) {
      const v = Math.max(0, p.value);
      const w = (v / cap) * BAR_W;
      if (w <= 0) return;
      // 区分の継ぎ目に隙間が出ないよう0.6だけ重ねて描く
      bars += `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${(w + 0.6).toFixed(1)}" height="${BAR_H}" fill="${p.color}"/>`;
      const text = man(v);
      // 細い区分は収まる範囲でフォントを段階的に落として表示する
      let size = 0;
      for (let s = 15; s >= 10; s -= 1) {
        if (w >= widthOf(text, s)) { size = s; break; }
      }
      if (size) {
        labels += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + size * 0.35}" fill="#ffffff" text-anchor="middle" font-weight="700">`
          + svgAmount(text, size) + `</text>`;
      }
      x += w;
    });
    bars += `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="url(#${gid})"/>`;

    svg.innerHTML = `<defs>${defs}</defs><g clip-path="url(#${cid})">${bars}</g>${labels}`;
  }

  /* ===== 経費科目テーブル(決算書情報から現況額を自動反映) ===== */
  const ITEMS = [
    { id: 'entertainment', label: '交際費', fsField: 'sga_entertainmentExpenses_1', defaultAmount: 120, defaultRate: 10 },
    { id: 'travel', label: '旅費交通費', fsField: 'sga_travelExpenses_1', defaultAmount: 80, defaultRate: 10 },
    { id: 'rent', label: '地代・家賃', fsField: 'sga_rent_1', defaultAmount: 180, defaultRate: 5 },
    { id: 'welfare', label: '福利厚生費', fsField: 'sga_welfare_1', defaultAmount: 60, defaultRate: 10 },
    { id: 'statutoryWelfare', label: '法定福利費', fsField: 'sga_statutoryWelfare_1', defaultAmount: 150, defaultRate: 5 },
    { id: 'lifeInsurance', label: '生命保険料', fsField: 'sga_insurancePremium_1', defaultAmount: 100, defaultRate: 15 },
    { id: 'casualtyInsurance', label: '損害保険料', fsField: null, defaultAmount: 30, defaultRate: 15 },
  ];

  // 決算書情報(financial-statements.html)のlocalStorageから直前期の値を読み込む(円→万円)
  function loadFsValue(fsField) {
    if (!fsField) return null;
    try {
      const raw = localStorage.getItem('bpl_financial_statements_v1');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data[fsField] === undefined) return null;
      const yen = window.numClean ? window.numClean(data[fsField]) : parseFloat(data[fsField]);
      if (isNaN(yen)) return null;
      return Math.round(yen / 10000);
    } catch (e) {
      return null;
    }
  }

  const execFromFs = loadFsValue('sga_executiveCompensation_1');
  if (execFromFs !== null) $('execCompCurrent').value = execFromFs;

  const tbody = $('pfItemsBody');
  ITEMS.forEach((item) => {
    const fsAmount = loadFsValue(item.fsField);
    const amount = fsAmount !== null ? fsAmount : item.defaultAmount;
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-100';
    tr.innerHTML = `
      <td class="px-3 py-1.5 text-gray-800">${item.label}</td>
      <td class="px-1 py-1"><input type="number" id="pf_${item.id}_amount" value="${amount}" class="form-input num-input w-full rounded px-2 py-1.5 text-right text-sm" /></td>
      <td class="px-1 py-1"><input type="number" id="pf_${item.id}_rate" value="${item.defaultRate}" step="1" class="form-input num-input w-full rounded px-2 py-1.5 text-right text-sm" /></td>
      <td class="px-3 py-1.5 text-right font-bold text-[#0f2a4a]" id="pf_${item.id}_result">-</td>
    `;
    tbody.appendChild(tr);
  });

  /* ===== 入力の読み取り(未入力・不正値は0として計算を止めない) ===== */
  const MAX_MAN = 999999, MAX_RATE = 1000;
  function readVal(id, maxAbs) {
    const el = $(id);
    if (!el) return 0;
    const raw = String(el.value || '').replace(/,/g, '').trim();
    const v = raw === '' ? NaN : parseFloat(raw);
    if (isNaN(v)) return 0;
    const cap = maxAbs || MAX_MAN;
    return Math.max(-cap, Math.min(cap, v));
  }

  /* ===== 入力内容のブラウザ内保存(サーバーには送信しない) ===== */
  const STORAGE_KEY = 'bpl_premium_funding_v1';
  const allInputs = () => root.querySelectorAll('input[id]');
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      allInputs().forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    allInputs().forEach(function (el) { if (el.value !== '') data[el.id] = el.value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ===== 再計算と描画 ===== */
  let lastResult = null;
  function render() {
    const setHtml = (id, txt) => { const el = $(id); if (el) el.innerHTML = withUnit(txt); };

    // 1. 他社既契約保険の見直し(法人/個人)
    const insCorp = readVal('pfInsCorpAmount') * readVal('pfInsCorpRate', MAX_RATE) / 100;
    const insPers = readVal('pfInsPersAmount') * readVal('pfInsPersRate', MAX_RATE) / 100;
    setHtml('pfInsCorpResult', man(insCorp));
    setHtml('pfInsPersResult', man(insPers));

    // 2. 役員報酬の見直し(会社負担=法人/本人負担=個人)
    const execShift = readVal('execCompShift');
    const execCorp = execShift * readVal('socialInsRate', MAX_RATE) / 100;
    const execPers = execShift * readVal('pfSocialRateSelf', MAX_RATE) / 100;
    setHtml('pfExecCorpResult', man(execCorp));
    setHtml('pfExecPersResult', man(execPers));

    // 3. 経費科目の適正化(法人)
    let expenseTotal = 0;
    const expenseRows = [];
    ITEMS.forEach(function (item) {
      const amount = readVal(`pf_${item.id}_amount`);
      const saving = amount * readVal(`pf_${item.id}_rate`, MAX_RATE) / 100;
      expenseTotal += saving;
      expenseRows.push({ label: item.label, amount: amount, saving: saving });
      setHtml(`pf_${item.id}_result`, man(saving));
    });
    setHtml('pfExpenseResult', man(expenseTotal));

    // 積み上げ(先頭のバーと合計)
    const corpTotal = insCorp + execCorp + expenseTotal;
    const persTotal = insPers + execPers;
    const total = corpTotal + persTotal;
    const cap = Math.max(corpTotal, persTotal);

    drawStack($('pfBarCorp'), [
      { value: insCorp, color: C_ITEM[0] },
      { value: execCorp, color: C_ITEM[1] },
      { value: expenseTotal, color: C_ITEM[2] },
    ], cap);
    drawStack($('pfBarPers'), [
      { value: insPers, color: C_ITEM[0] },
      { value: execPers, color: C_ITEM[1] },
    ], cap);

    countUp('pfTotal', total, man);
    countUp('pfTotalCorp', corpTotal, man);
    countUp('pfTotalPers', persTotal, man);
    setHtml('pfMonthly', man(total / 12));

    lastResult = {
      insCorp: insCorp, insPers: insPers,
      execCorp: execCorp, execPers: execPers,
      expenseTotal: expenseTotal, expenseRows: expenseRows,
      corpTotal: corpTotal, persTotal: persTotal, total: total,
    };
    saveCurrentValues();
  }

  /* ===== 入力の確定(change)で再計算する。テーブルの動的行も拾えるよう委譲する ===== */
  root.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input')) render();
  });

  /* ===== データクリア =====
     セクション単位の「データクリア」はmenu.jsが対象欄を空にしてchangeを発火する。
     ヒーローの「全データクリア」だけここで受け持つ ===== */
  function doClearAll() {
    allInputs().forEach(function (el) { el.value = ''; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    render();
  }
  if (window.armHeroClearBtn) window.armHeroClearBtn($('pfClearBtn'), doClearAll);

  /* ===== PDF出力 ===== */
  function doPrint() {
    if (!lastResult) return;
    const r = lastResult;
    const now = new Date();
    $('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const body = $('pBreakdownBody');
    body.innerHTML = '';
    const addRow = (label, corp, pers) => {
      const tr = document.createElement('tr');
      const sum = (corp || 0) + (pers || 0);
      tr.innerHTML = `<td class="lbl">${label}</td>`
        + `<td>${corp === null ? '-' : man(corp)}</td>`
        + `<td>${pers === null ? '-' : man(pers)}</td>`
        + `<td>${man(sum)}</td>`;
      body.appendChild(tr);
    };
    addRow('1. 他社既契約保険の見直し', r.insCorp, r.insPers);
    addRow('2. 役員報酬の見直し(社会保険料削減)', r.execCorp, r.execPers);
    addRow('3. 経費科目の適正化', r.expenseTotal, null);

    $('pTotalCorp').textContent = man(r.corpTotal);
    $('pTotalPers').textContent = man(r.persTotal);
    $('pTotal').textContent = man(r.total) + ' / 年';
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  /* ===== 初期表示: 保存済みデータがあれば復元して試算する ===== */
  loadSavedValues();
  render();
});

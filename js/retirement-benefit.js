/* ============================================================
   退職金×生命保険(1ページ完結)
   - このページの肝は「給与で受け取る場合と退職金で受け取る場合の手取り差」
   - 入力を確定(change)するたびに再計算し、最上部の比較グラフと数字が動く
   - 単位は数字より小さく表示し、金額はカンマ区切りにする(全体ルール)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('rbTool');
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const errorArea = $('rbErrorArea');
  const inputs = Array.prototype.slice.call(root.querySelectorAll('input[id]'));

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

  /* ===== 数字と単位 =====
     万円・％などの単位は数字より小さく表示する(全ページ共通ルール) ===== */
  const UNIT_RE = /([0-9][0-9,.]*)\s*(万円|円|％|%|年|倍)/g;
  const withUnit = (txt) => String(txt).replace(UNIT_RE, '$1<span class="unit">$2</span>');
  // SVG内はspanが使えないのでtspanでフォントサイズを直接落とす
  const svgAmount = (txt, size) => String(txt).replace(UNIT_RE, function (m, n, u) {
    return `<tspan font-size="${size}">${n}</tspan><tspan font-size="${Math.round(size * 0.68)}"> ${u}</tspan>`;
  });
  const fmt = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));
  const man = (n) => fmt(n) + ' 万円';

  /* ===== 配色 ===== */
  const C_NET = '#0f2a4a';      // 手取り
  const C_ITAX = '#a83d3d';     // 所得税
  const C_RTAX = '#d79c9c';     // 住民税

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

  /* ===== 比較の帯グラフ =====
     支給額を全体の幅とし、手取り／所得税／住民税に分けて塗る。
     A・Bで支給額は同じなので帯の長さも同じになり、手取り(濃紺)の長さの差が
     そのまま「退職金で受け取ることの得」になる。
     角丸は帯全体をclipPathで抜くことで、区分の境目が段差にならないようにする ===== */
  function drawSplitBar(svg, parts, cap) {
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
      // 税額の区分は細くなりやすいので、収まる範囲でフォントを段階的に落として表示する
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

  /* ===== 税額の計算 ===== */
  // 2024年分 所得税速算表(円ベース)
  function incomeTaxJP(taxableIncomeYen) {
    const x = Math.max(0, taxableIncomeYen);
    const brackets = [
      [1950000, 0.05, 0],
      [3300000, 0.10, 97500],
      [6950000, 0.20, 427500],
      [9000000, 0.23, 636000],
      [18000000, 0.33, 1536000],
      [40000000, 0.40, 2796000],
      [Infinity, 0.45, 4796000],
    ];
    for (const [limit, rate, deduction] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - deduction);
    }
    return 0;
  }

  // 給与所得控除額(円ベース、2020年分以降)
  function salaryDeductionJP(incomeYen) {
    const x = Math.max(0, incomeYen);
    if (x <= 1625000) return 550000;
    if (x <= 1800000) return x * 0.4 - 100000;
    if (x <= 3600000) return x * 0.3 + 80000;
    if (x <= 6600000) return x * 0.2 + 440000;
    if (x <= 8500000) return x * 0.1 + 1100000;
    return 1950000;
  }

  /* ===== 入力の読み取り =====
     未入力はエラーで止めず0として扱い、該当欄を薄い赤で示して入力を促す ===== */
  const LIMITS = {
    finalMonthlySalary: 999999, surrenderValue: 999999, bookValue: 999999,
    yearsOfService: 100, meritMultiplier: 100,
    meritAddRate: 1000, corpTaxRateRb: 1000,
  };
  function readValue(id) {
    const el = $(id);
    if (!el) return 0;
    const raw = String(el.value || '').replace(/,/g, '').trim();
    const v = raw === '' ? NaN : parseFloat(raw);
    if (isNaN(v)) {
      el.classList.add('input-error');
      return 0;
    }
    if (Math.abs(v) > LIMITS[id]) {
      el.classList.add('input-error');
      return Math.sign(v) * LIMITS[id];
    }
    el.classList.remove('input-error');
    return v;
  }

  /* ===== 入力内容のブラウザ内保存(サーバーには送信しない) ===== */
  const STORAGE_KEY = 'bpl_retirement_benefit_v1';
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      inputs.forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    inputs.forEach(function (el) { if (el.value !== '') data[el.id] = el.value; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ===== 再計算と描画 ===== */
  let lastResult = null;
  function render() {
    const finalMonthlySalary = readValue('finalMonthlySalary');
    const yearsOfService = readValue('yearsOfService');
    const meritMultiplier = readValue('meritMultiplier');
    const meritAddRate = readValue('meritAddRate');
    const surrenderValue = readValue('surrenderValue');
    const bookValue = readValue('bookValue');
    const corpTaxRateRb = readValue('corpTaxRateRb');

    // --- 1. 功績倍率法による退職金額(万円) ---
    const retirementAmount = finalMonthlySalary * yearsOfService * meritMultiplier * (1 + meritAddRate / 100);

    // --- 2. 法人側への影響 ---
    const corpGain = Math.max(0, surrenderValue - bookValue); // 保険差益(益金算入額)
    const corpDeduction = retirementAmount;                   // 退職金の損金算入額
    const corpTaxImpact = (corpGain - corpDeduction) * corpTaxRateRb / 100; // △=節税 / +=追加負担

    // --- 3. 個人の税務比較(円ベースで計算) ---
    const incomeYen = retirementAmount * 10000;

    // A. 給与として一括受給
    const aDeductionYen = salaryDeductionJP(incomeYen);
    const aSalaryIncomeYen = Math.max(0, incomeYen - aDeductionYen);
    const aTaxableYen = Math.max(0, aSalaryIncomeYen - 480000); // 基礎控除48万円
    const aIncomeTaxYen = incomeTaxJP(aTaxableYen);
    const aResidentTaxYen = aTaxableYen * 0.10;
    const aNetYen = incomeYen - aIncomeTaxYen - aResidentTaxYen;

    // B. 退職金として一括受給
    const years = Math.max(0, yearsOfService);
    const bDeductionYen = years <= 20 ? years * 400000 : 8000000 + (years - 20) * 700000;
    const bTaxableYen = Math.max(0, incomeYen - bDeductionYen) * 0.5; // 2分の1課税
    const bIncomeTaxYen = incomeTaxJP(bTaxableYen);
    const bResidentTaxYen = bTaxableYen * 0.10;
    const bNetYen = incomeYen - bIncomeTaxYen - bResidentTaxYen;

    const aNet = aNetYen / 10000, bNet = bNetYen / 10000;
    const aIt = aIncomeTaxYen / 10000, aRt = aResidentTaxYen / 10000;
    const bIt = bIncomeTaxYen / 10000, bRt = bResidentTaxYen / 10000;
    const diff = bNet - aNet;

    // --- 主役: 手取り差 ---
    countUp('sumDiff', Math.abs(diff), man);
    const diffNumEl = $('sumDiff');
    const tailEl = $('rbDiffTail');
    if (diff < -0.5) {
      if (tailEl) tailEl.textContent = '少なくなります';
      if (diffNumEl) diffNumEl.style.color = '#a83d3d';
    } else {
      if (tailEl) tailEl.textContent = '多く残ります';
      if (diffNumEl) diffNumEl.style.color = '';
    }

    countUp('sumA', aNet, man);
    countUp('sumB', bNet, man);
    const payoutEl = $('rbPayout');
    if (payoutEl) payoutEl.innerHTML = withUnit(man(retirementAmount));

    // --- グラフ(A・Bとも支給額を全体の幅にする) ---
    const cap = Math.max(retirementAmount, 0);
    drawSplitBar($('rbChartA'), [
      { value: aNet, color: C_NET },
      { value: aIt, color: C_ITAX },
      { value: aRt, color: C_RTAX },
    ], cap);
    drawSplitBar($('rbChartB'), [
      { value: bNet, color: C_NET },
      { value: bIt, color: C_ITAX },
      { value: bRt, color: C_RTAX },
    ], cap);

    // --- 入力カードの小計・法人側 ---
    const setHtml = (id, txt) => { const el = $(id); if (el) el.innerHTML = withUnit(txt); };
    countUp('retirementAmountDisplay', retirementAmount, man);
    setHtml('rbCorpGain', man(corpGain));
    setHtml('rbCorpDeduction', man(corpDeduction));
    const impactEl = $('rbCorpTaxImpact');
    if (impactEl) {
      impactEl.innerHTML = withUnit(man(corpTaxImpact));
      impactEl.classList.toggle('neg-val', corpTaxImpact < 0);
    }

    // --- 明細 ---
    setHtml('aIncome', man(retirementAmount));
    setHtml('aDeduction', man(aDeductionYen / 10000));
    setHtml('aTaxable', man(aTaxableYen / 10000));
    setHtml('aIncomeTax', man(aIt));
    setHtml('aResidentTax', man(aRt));
    setHtml('aNet', man(aNet));

    setHtml('bIncome', man(retirementAmount));
    setHtml('bDeduction', man(bDeductionYen / 10000));
    setHtml('bTaxable', man(bTaxableYen / 10000));
    setHtml('bIncomeTax', man(bIt));
    setHtml('bResidentTax', man(bRt));
    setHtml('bNet', man(bNet));

    lastResult = { diff };
    if (errorArea) { errorArea.classList.add('hidden'); errorArea.textContent = ''; }
    saveCurrentValues();
  }

  /* ===== 入力の確定(change)で再計算する。入力中は動かさない(全体ルール) ===== */
  inputs.forEach(function (el) {
    el.addEventListener('change', render);
  });

  /* ===== データクリア =====
     セクション単位の「データクリア」はmenu.jsが対象欄を空にしてchangeを発火するため
     ここでは何もしなくてよい。ヒーローの「全データクリア」だけ受け持つ ===== */
  function doClearAll() {
    inputs.forEach(function (el) { el.value = ''; el.classList.remove('input-error'); });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    render();
  }
  if (window.armHeroClearBtn) window.armHeroClearBtn($('rbClearBtn'), doClearAll);

  /* ===== PDF出力 ===== */
  function doPrint() {
    const now = new Date();
    $('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    const copy = (fromId, toId) => {
      const from = $(fromId), to = $(toId);
      if (from && to) to.textContent = from.textContent;
    };
    ['rbCorpDeduction', 'rbCorpGain', 'rbCorpTaxImpact'].forEach(function (id) {
      copy(id, 'p' + id.charAt(0).toUpperCase() + id.slice(1));
    });
    [['aIncome', 'pAIncome'], ['aDeduction', 'pADeduction'], ['aTaxable', 'pATaxable'],
     ['aIncomeTax', 'pAIncomeTax'], ['aResidentTax', 'pAResidentTax'], ['aNet', 'pANet'],
     ['bIncome', 'pBIncome'], ['bDeduction', 'pBDeduction'], ['bTaxable', 'pBTaxable'],
     ['bIncomeTax', 'pBIncomeTax'], ['bResidentTax', 'pBResidentTax'], ['bNet', 'pBNet'],
     ['sumA', 'pSumA'], ['sumB', 'pSumB'], ['sumDiff', 'pSumDiff']].forEach(function (pair) {
      copy(pair[0], pair[1]);
    });
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  /* ===== 初期表示: 保存済みデータがあれば復元して試算する ===== */
  loadSavedValues();
  render();
});

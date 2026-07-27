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

  /* ===== 積立比較(40年) =====
     同じ原資を「役員報酬として受け取って個人で積み立てる(A)」場合と
     「法人が生命保険料として払い込む(B)」場合で、残高がどう開いていくかを見せる。
     Aは所得税・住民税・社会保険料が引かれた手取りしか積み立てられないのが差の源泉 ===== */
  const ACC_A_COLOR = '#8b98a8';
  const ACC_B_COLOR = '#0f2a4a';
  let accSeries = null;
  let accLayout = null;

  function buildAccSeries(annual, years, outflowRate, yieldSelf, yieldIns) {
    const netAnnual = annual * (1 - outflowRate / 100);
    const series = [{ year: 0, a: 0, b: 0, netAnnual: netAnnual }];
    let a = 0, b = 0;
    for (let t = 1; t <= years; t += 1) {
      // 期首払い(年初に払い込み、その年の運用がつく)
      a = (a + netAnnual) * (1 + yieldSelf / 100);
      b = (b + annual) * (1 + yieldIns / 100);
      series.push({ year: t, a: a, b: b });
    }
    return series;
  }

  function drawAccChart(series) {
    const svg = $('rbAccChart');
    if (!svg) return;
    const W = 800, H = 320, padL = 80, padR = 20, padT = 20, padB = 40, SVG_W = 830;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const yBottom = H - padB;

    const rawMax = Math.max.apply(null, series.map((p) => Math.max(p.a, p.b)).concat([1]));
    const maxV = rawMax * 1.08;
    const y = (v) => yBottom - (v / (maxV || 1)) * plotH;
    const slotWidth = plotW / series.length;

    let gridLines = '';
    for (let i = 0; i <= 4; i += 1) {
      const gv = (maxV * i) / 4;
      const gy = y(gv);
      gridLines += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}" stroke="#e3e6ea" stroke-width="1"/>`;
      gridLines += `<text x="${padL - 10}" y="${(gy + 4).toFixed(1)}" font-size="11" fill="#9aa1ab" text-anchor="end">${Math.round(gv).toLocaleString('ja-JP')}</text>`;
    }

    // A・Bはどちらも高さを読み取れることが大事なので、重ねずに横に並べる
    const barWidth = slotWidth * 0.36;
    const gap = slotWidth * 0.06;
    const groupWidth = barWidth * 2 + gap;
    let bars = '';
    [{ key: 'a', color: ACC_A_COLOR, op: 0.65 }, { key: 'b', color: ACC_B_COLOR, op: 0.92 }]
      .forEach(function (s, si) {
        series.forEach(function (p, i) {
          const barY = y(p[s.key]);
          const barH = Math.max(0, yBottom - barY);
          if (barH <= 0) return;
          const groupStart = padL + i * slotWidth + (slotWidth - groupWidth) / 2;
          const barX = groupStart + si * (barWidth + gap);
          const delay = (i * 20 + si * 15).toFixed(0);
          bars += `<rect class="chart-bar" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}"`
            + ` fill="${s.color}" fill-opacity="${s.op}" rx="1.2" style="animation-delay:${delay}ms"/>`;
        });
      });

    let xLabels = '';
    const last = series.length - 1;
    const stepYear = last > 45 ? 10 : 5;
    for (let yr = 0; yr <= last; yr += stepYear) {
      const gx = padL + yr * slotWidth + slotWidth / 2;
      xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${yr === 0 ? '現在' : yr + '年'}</text>`;
    }
    if (last % stepYear !== 0) {
      const gx = padL + last * slotWidth + slotWidth / 2;
      xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${last}年</text>`;
    }

    svg.innerHTML = `${gridLines}`
      + `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`
      + `<line x1="${padL}" y1="${yBottom}" x2="${W - padR}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`
      + `${xLabels}${bars}`;

    accLayout = { W: SVG_W, padL: padL, slotWidth: slotWidth, count: series.length };
  }

  /* ===== 積立グラフのツールチップ(年次の内訳を出す) ===== */
  const accTooltip = $('rbAccTooltip');
  const accWrap = $('rbAccWrap');
  const accSvg = $('rbAccChart');
  function onAccMove(e) {
    if (!accSeries || !accLayout || !accTooltip) return;
    const rect = accSvg.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
    const xViewbox = ((clientX - rect.left) / rect.width) * accLayout.W;
    const idx = Math.floor((xViewbox - accLayout.padL) / accLayout.slotWidth);
    if (idx < 0 || idx >= accLayout.count) { accTooltip.classList.add('hidden'); return; }
    const p = accSeries[idx];
    accTooltip.innerHTML = `<p class="font-black mb-1">${p.year === 0 ? '現在' : p.year + '年後'}</p>`
      + `<p class="flex justify-between gap-3"><span class="text-gray-500">A. 個人で積立</span><span class="font-bold">${withUnit(man(p.a))}</span></p>`
      + `<p class="flex justify-between gap-3"><span class="text-gray-500">B. 法人の保険</span><span class="font-bold">${withUnit(man(p.b))}</span></p>`
      + `<p class="flex justify-between gap-3 mt-1 pt-1 border-t border-gray-200"><span class="text-gray-500">差</span><span class="font-black text-[#0f2a4a]">${withUnit(man(p.b - p.a))}</span></p>`;
    accTooltip.classList.remove('hidden');
    const wrapRect = accWrap.getBoundingClientRect();
    const tw = accTooltip.offsetWidth;
    let left = clientX - wrapRect.left + 14;
    if (left + tw > wrapRect.width) left = clientX - wrapRect.left - tw - 14;
    accTooltip.style.left = Math.max(0, left) + 'px';
    accTooltip.style.top = Math.max(0, clientY - wrapRect.top - 10) + 'px';
  }
  if (accSvg) {
    accSvg.addEventListener('mousemove', onAccMove);
    accSvg.addEventListener('mouseleave', function () { accTooltip.classList.add('hidden'); });
    accSvg.addEventListener('touchstart', onAccMove);
    accSvg.addEventListener('touchmove', function (e) { onAccMove(e); e.preventDefault(); }, { passive: false });
  }

  /* ===== 損金割合のセグメント切替(全損/半損/4割損/全額資産計上) ===== */
  const lossSeg = $('rbAccLossSeg');
  const lossInput = $('rbAccLossRate');
  function syncLossSeg() {
    if (!lossSeg || !lossInput) return;
    const cur = String(lossInput.value || '').replace(/,/g, '').trim();
    lossSeg.querySelectorAll('.rb-seg-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.loss === cur);
    });
  }
  if (lossSeg && lossInput) {
    lossSeg.addEventListener('click', function (e) {
      const btn = e.target.closest('.rb-seg-btn');
      if (!btn) return;
      lossInput.value = btn.dataset.loss;
      syncLossSeg();
      render();
    });
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
    // 積立比較
    rbAccAnnual: 999999, rbAccYears: 60, rbAccTaxRate: 100, rbAccSocial: 100,
    rbAccYieldSelf: 30, rbAccYieldIns: 30, rbAccLossRate: 100,
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

    // --- 4. 積立比較(40年) ---
    const accAnnual = readValue('rbAccAnnual');
    const accYears = Math.max(0, Math.round(readValue('rbAccYears')));
    const accTaxRate = readValue('rbAccTaxRate');
    const accSocial = readValue('rbAccSocial');
    const accYieldSelf = readValue('rbAccYieldSelf');
    const accYieldIns = readValue('rbAccYieldIns');
    const accLossRate = readValue('rbAccLossRate');
    const outflowRate = Math.min(100, accTaxRate + accSocial);

    accSeries = buildAccSeries(accAnnual, accYears, outflowRate, accYieldSelf, accYieldIns);
    drawAccChart(accSeries);
    syncLossSeg();

    const accLast = accSeries[accSeries.length - 1];
    const accDiff = accLast.b - accLast.a;
    // 役員報酬で受け取ると毎年出ていく税・社会保険料の累計(法人の保険ならそもそも発生しない)
    const taxSavedTotal = accAnnual * (outflowRate / 100) * accYears;
    // 損金算入により軽くなる法人税の累計(＝実質的な保険料の減額)
    const premiumSavedTotal = accAnnual * (accLossRate / 100) * (corpTaxRateRb / 100) * accYears;

    countUp('rbAccDiff', accDiff, man);
    countUp('rbAccTaxSaved', taxSavedTotal, man);
    countUp('rbAccPremiumSaved', premiumSavedTotal, man);
    const outflowEl = $('rbAccOutflow');
    if (outflowEl) outflowEl.innerHTML = withUnit('合計 ' + (Math.round(outflowRate * 10) / 10) + '％');
    setHtml('rbAccNetAnnual', man(accAnnual * (1 - outflowRate / 100)));
    setHtml('rbAccPremiumAnnual', man(accAnnual));
    setHtml('rbAccFinals', man(accLast.a) + ' / ' + man(accLast.b));
    [['rbAccYearsLabel', accYears], ['rbAccYearsLabel2', accYears]].forEach(function (pair) {
      const el = $(pair[0]);
      if (el) el.textContent = pair[1];
    });

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

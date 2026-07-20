document.addEventListener('DOMContentLoaded', function () {
  const chartArea = document.getElementById('chartArea');
  if (!chartArea) return;

  const metricTilesEl = document.getElementById('metricTiles');
  const livePanel = document.getElementById('livePanel');
  let lastSeries = null;
  let lastYear0 = null;
  let chartLayout = null;
  let currentValues = null;

  const PROJECTION_IDS = [
    'corpTaxRateProj', 'annualProfit', 'annualProfitB', 'annualDividend',
    'retirementYear', 'retirementAmount', 'mvNetAssets', 'realOpProfit',
  ];

  const STORAGE_KEY = 'bpl_stock_valuation_v1';
  const DEFAULTS = {
    companySize: 'mid-mid',
    taxAssets: 15000, taxLiabilities: 8000, bookAssets: 12000, bookLiabilities: 8000,
    simA: 480, simB: 6.0, simC: 45, simD: 350, ownB: 4.0, ownC: 60, ownD: 420,
    sharesOutstanding: 2000, capitalAmount: 1000000,
    corpTaxRateProj: 30, annualProfit: 3000, annualProfitB: 2000, annualDividend: 0,
    retirementYear: 10, retirementAmount: 5000, mvNetAssets: 20000, realOpProfit: 2500,
  };
  const SIZE_CONFIG = {
    large: { l: 1.00, shin: 0.7, label: '大会社' },
    'mid-large': { l: 0.90, shin: 0.6, label: '中会社(大)' },
    'mid-mid': { l: 0.75, shin: 0.6, label: '中会社(中)' },
    'mid-small': { l: 0.60, shin: 0.6, label: '中会社(小)' },
    small: { l: 0.50, shin: 0.5, label: '小会社' },
  };

  // 入力ページ(stock-valuation.html)がlocalStorageに保存した値を読み込む。
  // 未入力の場合はサンプル値(DEFAULTS)にフォールバックし、常に試算結果を表示する。
  function loadValues() {
    let stored = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch (e) {
      stored = null;
    }
    const usedDefaults = !stored;
    const src = stored || DEFAULTS;
    const v = { companySize: src.companySize || DEFAULTS.companySize };
    Object.keys(DEFAULTS).forEach((key) => {
      if (key === 'companySize') return;
      const raw = src[key];
      const parsed = raw === undefined || raw === '' ? NaN : parseFloat(raw);
      v[key] = isNaN(parsed) ? DEFAULTS[key] : parsed;
    });
    return { v, usedDefaults };
  }

  // 5指標 × 利益A/Bシナリオ = 10種類
  const BASE_METRICS = {
    saizoku: '相続税評価',
    houjin: '法人税法上の評価',
    ruiji: '類似業種比準',
    junsisan: '純資産',
    manda: 'M&A評価',
  };
  const BASE_COLORS = {
    saizoku: { light: '#6d7f92', dark: '#3f4c5c' },
    houjin: { light: '#7c8f7a', dark: '#4f5f4d' },
    ruiji: { light: '#b3b8bd', dark: '#6b7075' },
    junsisan: { light: '#5f7fa8', dark: '#2f4864' },
    manda: { light: '#9c5866', dark: '#6b3540' },
  };
  const METRICS = {};
  Object.keys(BASE_METRICS).forEach((base) => {
    METRICS[`${base}_A`] = { label: `${BASE_METRICS[base]}(利益A)`, field: `${base}T_A`, color: BASE_COLORS[base].light, base, scenario: 'A' };
    METRICS[`${base}_B`] = { label: `${BASE_METRICS[base]}(利益B)`, field: `${base}T_B`, color: BASE_COLORS[base].dark, base, scenario: 'B' };
  });
  let selectedMetrics = ['saizoku_A'];

  const yen = (n) => Math.round(n).toLocaleString('ja-JP') + ' 円';
  const man = (n) => Math.round(n).toLocaleString('ja-JP') + ' 万円';
  const yearLabel = (y) => (y === 0 ? '現在' : `${y}年後`);

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // 年0(現在時点)の評価額(1株当たり)を計算
  function computeYear0(v) {
    const sizeCfg = SIZE_CONFIG[v.companySize] || SIZE_CONFIG['mid-mid'];
    const L = sizeCfg.l;
    const shinshaku = sizeCfg.shin;
    const sizeLabel = sizeCfg.label;

    const taxNetAssets = v.taxAssets - v.taxLiabilities;
    const bookNetAssets = v.bookAssets - v.bookLiabilities;
    const hyokaSagaku = Math.max(0, taxNetAssets - bookNetAssets);
    const corpTaxEquivalent = hyokaSagaku * 0.37;
    const netAssetsAtValuation = taxNetAssets - corpTaxEquivalent; // 万円
    const netAssetPerShare = (netAssetsAtValuation * 10000) / v.sharesOutstanding;

    const ratio = (v.ownB / v.simB + v.ownC / v.simC + v.ownD / v.simD) / 3;
    const similarPerShare50Yen = v.simA * ratio * shinshaku;
    const shares50YenBasis = v.capitalAmount / 50;
    const similarPerShareActual = shares50YenBasis > 0
      ? (similarPerShare50Yen * shares50YenBasis) / v.sharesOutstanding
      : similarPerShare50Yen;

    const combined = similarPerShareActual * L + netAssetPerShare * (1 - L);
    const finalPerShare = Math.min(combined, netAssetPerShare);
    const houjinPerShare = similarPerShareActual * 0.5 + netAssetPerShare * 0.5;
    const finalTotal = finalPerShare * v.sharesOutstanding;

    return {
      sizeLabel, L, shinshaku,
      netAssetsAtValuation, netAssetPerShare,
      similarPerShareActual, combined, finalPerShare, houjinPerShare, finalTotal,
      d0: v.ownD,
    };
  }

  // 1つのシナリオ(年間税引前利益を指定)について、0〜30年の5指標(総額万円)を計算
  function computeScenario(v, year0, annualProfitValue, shared) {
    const sizeCfg = SIZE_CONFIG[v.companySize] || SIZE_CONFIG['mid-mid'];
    const L = sizeCfg.l;
    const shinshaku = sizeCfg.shin;
    const shares = v.sharesOutstanding;
    const shares50YenBasis = v.capitalAmount / 50;
    const afterTaxProfit = annualProfitValue * (1 - shared.corpTaxRate / 100);
    const base0 = year0.netAssetsAtValuation;

    function metricsFor(t, netAssetsT) {
      const netAssetPerShare = (netAssetsT * 10000) / shares;
      const growthRatio = year0.netAssetPerShare !== 0 ? netAssetPerShare / year0.netAssetPerShare : 1;
      const dT = year0.d0 * growthRatio;
      const ratio = (v.ownB / v.simB + v.ownC / v.simC + dT / v.simD) / 3;
      const similarPerShare50Yen = v.simA * ratio * shinshaku;
      const similarPerShareActual = shares50YenBasis > 0
        ? (similarPerShare50Yen * shares50YenBasis) / shares
        : similarPerShare50Yen;
      const combined = similarPerShareActual * L + netAssetPerShare * (1 - L);
      const finalPerShare = Math.min(combined, netAssetPerShare);
      const houjinPerShare = similarPerShareActual * 0.5 + netAssetPerShare * 0.5;
      const jika = shared.mv0 + (netAssetsT - base0);
      return {
        junsisan: netAssetsT,
        ruiji: similarPerShareActual * shares / 10000,
        houjin: houjinPerShare * shares / 10000,
        saizoku: finalPerShare * shares / 10000,
        manda: jika + shared.rop * 5,
      };
    }

    let cumulative = base0;
    const out = [metricsFor(0, cumulative)];
    for (let t = 1; t <= 30; t++) {
      let retained = afterTaxProfit - shared.annualDividend;
      if (shared.retirementYear !== null && shared.retirementYear === t) {
        retained -= shared.retirementAmount;
      }
      cumulative += retained;
      out.push(metricsFor(t, cumulative));
    }
    return out;
  }

  // 利益A・利益B、2つの並行シナリオを計算し、year・10フィールドを持つ配列にまとめる
  function computeSeries(v, year0) {
    const shared = {
      corpTaxRate: v.corpTaxRateProj,
      annualDividend: v.annualDividend,
      retirementYear: v.retirementYear,
      retirementAmount: v.retirementAmount,
      mv0: v.mvNetAssets,
      rop: v.realOpProfit,
    };

    const seriesA = computeScenario(v, year0, v.annualProfit, shared);
    const seriesB = computeScenario(v, year0, v.annualProfitB, shared);

    const series = [];
    for (let t = 0; t <= 30; t++) {
      series.push({
        year: t,
        saizokuT_A: seriesA[t].saizoku, houjinT_A: seriesA[t].houjin, ruijiT_A: seriesA[t].ruiji, junsisanT_A: seriesA[t].junsisan, mandaT_A: seriesA[t].manda,
        saizokuT_B: seriesB[t].saizoku, houjinT_B: seriesB[t].houjin, ruijiT_B: seriesB[t].ruiji, junsisanT_B: seriesB[t].junsisan, mandaT_B: seriesB[t].manda,
      });
    }
    return { series, retirementYear: shared.retirementYear };
  }

  // ===== 凡例・タイル選択state の描画 =====
  function renderLegend(container) {
    container.innerHTML = selectedMetrics.map((key) => {
      const m = METRICS[key];
      return `<span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-full" style="background:${m.color}"></span>${m.label}</span>`;
    }).join('');
  }

  function renderTileSelection() {
    if (!metricTilesEl) return;
    metricTilesEl.querySelectorAll('.metric-tile').forEach((btn) => {
      const key = btn.dataset.metric;
      const color = btn.dataset.color;
      const selected = selectedMetrics.includes(key);
      const labelEl = btn.querySelector('.tile-label');
      const valueEl = btn.querySelector('.tile-value');
      if (selected) {
        btn.style.backgroundColor = color;
        btn.style.boxShadow = 'none';
        if (labelEl) labelEl.style.color = 'rgba(255,255,255,0.85)';
        if (valueEl) valueEl.style.color = '#ffffff';
      } else {
        btn.style.backgroundColor = hexToRgba(color, 0.1);
        btn.style.boxShadow = `inset 0 0 0 1.5px ${color}`;
        if (labelEl) labelEl.style.color = '';
        if (valueEl) valueEl.style.color = '';
      }
    });
  }

  // ===== グラフ描画(選択された1〜2指標を同じ太さでずらして重ねて表示) =====
  function drawChart(series, retirementYear) {
    const svg = document.getElementById('trendChart');
    const W = 800, H = 320, padL = 80, padR = 20, padT = 20, padB = 40;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const activeFields = selectedMetrics.map((k) => METRICS[k].field);
    const maxV = Math.max(...series.flatMap((p) => activeFields.map((f) => p[f])), 1);
    const minV = 0;
    const yBottom = H - padB;
    const y = (val) => yBottom - ((val - minV) / (maxV - minV || 1)) * plotH;

    const slotWidth = plotW / series.length;

    let gridLines = '';
    for (let i = 0; i <= 4; i++) {
      const gv = minV + ((maxV - minV) * i) / 4;
      const gy = y(gv);
      gridLines += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}" stroke="#e3e6ea" stroke-width="1"/>`;
      gridLines += `<text x="${padL - 10}" y="${(gy + 4).toFixed(1)}" font-size="11" fill="#9aa1ab" text-anchor="end">${Math.round(gv).toLocaleString('ja-JP')}</text>`;
    }

    function barAttrs(p, m) {
      const isRetireYear = retirementYear !== null && p.year === retirementYear;
      const stroke = isRetireYear ? '#0f2a4a' : '#2b323d';
      const strokeWidth = isRetireYear ? '2.5' : '0.5';
      const strokeOpacity = isRetireYear ? '1' : '0.15';
      return `fill="${m.color}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}"`;
    }

    const barWidth = slotWidth * 0.68; // 1つ選択時と同じ太さを常に使用
    const overlapOffset = barWidth / 3; // 約1/3ずらして重ねる

    let bars = '';
    if (selectedMetrics.length === 1) {
      const m = METRICS[selectedMetrics[0]];
      series.forEach((p, i) => {
        const barX = padL + i * slotWidth + (slotWidth - barWidth) / 2;
        const barY = y(p[m.field]);
        const barH = Math.max(0, yBottom - barY);
        const delay = (i * 30).toFixed(0);
        bars += `<rect class="chart-bar" data-year="${i}" data-metric="${selectedMetrics[0]}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" ${barAttrs(p, m)} rx="1.5" style="animation-delay:${delay}ms"/>`;
      });
    } else {
      const groupWidth = barWidth + overlapOffset;
      selectedMetrics.forEach((key, si) => {
        const m = METRICS[key];
        series.forEach((p, i) => {
          const groupStart = padL + i * slotWidth + (slotWidth - groupWidth) / 2;
          const barX = groupStart + si * overlapOffset;
          const barY = y(p[m.field]);
          const barH = Math.max(0, yBottom - barY);
          const delay = (i * 30 + si * 15).toFixed(0);
          bars += `<rect class="chart-bar" data-year="${i}" data-metric="${key}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" ${barAttrs(p, m)} fill-opacity="0.92" rx="1.5" style="animation-delay:${delay}ms"/>`;
        });
      });
    }

    let xLabels = '';
    [0, 5, 10, 15, 20, 25, 30].forEach((yr) => {
      const gx = padL + yr * slotWidth + slotWidth / 2;
      xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${yearLabel(yr)}</text>`;
    });

    svg.innerHTML = `
      ${gridLines}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>
      <line x1="${padL}" y1="${yBottom}" x2="${W - padR}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>
      ${xLabels}
      ${bars}
    `;

    chartLayout = { W, padL, plotW, slotWidth, count: series.length };
  }

  function renderTable(series) {
    const body = document.getElementById('trendTableBody');
    let rows = '';
    series.forEach((p, i) => {
      const zebra = i % 2 === 0 ? 'bg-white' : 'bg-gray-50';
      const cell = (v) => `<td class="px-3 py-1.5 text-right">${Math.round(v).toLocaleString('ja-JP')}</td>`;
      rows += `<tr class="${zebra} border-b border-gray-100">
        <td class="px-3 py-1.5 text-center text-gray-700 border-r border-gray-100">${yearLabel(p.year)}</td>
        ${cell(p.saizokuT_A)}${cell(p.houjinT_A)}${cell(p.ruijiT_A)}${cell(p.junsisanT_A)}${cell(p.mandaT_A)}
        ${cell(p.saizokuT_B)}${cell(p.houjinT_B)}${cell(p.ruijiT_B)}${cell(p.junsisanT_B)}${cell(p.mandaT_B)}
      </tr>`;
    });
    body.innerHTML = rows;
  }

  function updateCurrentValues(series) {
    const p0 = series[0];
    Object.keys(BASE_METRICS).forEach((base) => {
      const elA = document.getElementById(`cv_${base}_A`);
      const elB = document.getElementById(`cv_${base}_B`);
      if (elA) elA.textContent = man(p0[`${base}T_A`]);
      if (elB) elB.textContent = man(p0[`${base}T_B`]);
    });
  }

  function updateResultCard(year0) {
    document.getElementById('resSizeLabel').textContent = year0.sizeLabel;
    document.getElementById('resNetAsset').textContent = yen(year0.netAssetPerShare);
    document.getElementById('resSimilar').textContent = yen(year0.similarPerShareActual);
    document.getElementById('resHoujin').textContent = yen(year0.houjinPerShare);
    document.getElementById('resCombined').textContent = yen(year0.combined);
    document.getElementById('resFinalPerShare').textContent = yen(year0.finalPerShare);
    document.getElementById('resFinalTotal').textContent = yen(year0.finalTotal);
  }

  function populateLivePanel(v) {
    PROJECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = v[id];
    });
  }

  function persistCurrentValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      const merged = Object.assign({}, existing, { companySize: currentValues.companySize });
      PROJECTION_IDS.forEach((id) => { merged[id] = String(currentValues[id]); });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      // localStorage不可の環境では保存をスキップ(表示上の計算には影響しない)
    }
  }

  function refreshAll() {
    const { v, usedDefaults } = loadValues();
    const defaultNotice = document.getElementById('defaultNotice');
    if (defaultNotice) defaultNotice.classList.toggle('hidden', !usedDefaults);

    currentValues = v;
    populateLivePanel(v);

    const year0 = computeYear0(v);
    const result = computeSeries(v, year0);
    lastSeries = result.series;
    lastYear0 = year0;
    updateCurrentValues(lastSeries);
    drawChart(lastSeries, result.retirementYear);
    renderLegend(document.getElementById('chartLegend'));
    renderTileSelection();
    renderTable(lastSeries);
    updateResultCard(year0);
  }

  // ===== リアルタイム調整パネル: 変更すると即座にグラフ・表を再計算 =====
  function recomputeSeriesOnly() {
    if (!lastYear0 || !currentValues) return;
    const result = computeSeries(currentValues, lastYear0);
    lastSeries = result.series;
    updateCurrentValues(lastSeries);
    drawChart(lastSeries, result.retirementYear);
    renderTable(lastSeries);
  }

  if (livePanel) {
    let liveTimer = null;
    livePanel.addEventListener('input', function (e) {
      const id = e.target && e.target.id;
      if (!id || !PROJECTION_IDS.includes(id)) return;
      const parsed = parseFloat((e.target.value || '').replace(/,/g, ''));
      currentValues[id] = isNaN(parsed) ? currentValues[id] : parsed;
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        persistCurrentValues();
        recomputeSeriesOnly();
      }, 150);
    });
  }

  // ===== 評価額タイルのクリックで表示指標を切り替え(最大2つ) =====
  if (metricTilesEl) {
    metricTilesEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.metric-tile');
      if (!btn) return;
      const key = btn.dataset.metric;
      const idx = selectedMetrics.indexOf(key);
      if (idx >= 0) {
        if (selectedMetrics.length > 1) selectedMetrics.splice(idx, 1);
      } else {
        if (selectedMetrics.length >= 2) selectedMetrics.shift();
        selectedMetrics.push(key);
      }
      renderTileSelection();
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
        renderLegend(document.getElementById('chartLegend'));
      }
    });
  }

  // ===== グラフのホバー・ポップアップ =====
  const tooltip = document.getElementById('chartTooltip');
  const chartWrap = document.getElementById('chartWrap');
  const svgEl = document.getElementById('trendChart');

  function onChartMove(e) {
    if (!lastSeries || !chartLayout) return;
    const rect = svgEl.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const xViewbox = ((clientX - rect.left) / rect.width) * chartLayout.W;
    const idx = Math.floor((xViewbox - chartLayout.padL) / chartLayout.slotWidth);
    if (idx < 0 || idx >= chartLayout.count) {
      tooltip.classList.add('hidden');
      return;
    }
    const p = lastSeries[idx];
    const rowsHtml = Object.keys(METRICS).map((key) => {
      const m = METRICS[key];
      const isSel = selectedMetrics.includes(key);
      return `<div class="flex justify-between gap-4"><span class="flex items-center gap-1.5 ${isSel ? 'font-bold' : 'text-gray-500'}"><span class="inline-block w-2 h-2 rounded-full" style="background:${m.color}"></span>${m.label}</span><span class="${isSel ? 'font-bold' : ''}">${Math.round(p[m.field]).toLocaleString('ja-JP')}</span></div>`;
    }).join('');
    tooltip.innerHTML = `<p class="font-bold text-[#0f2a4a] mb-1.5">${yearLabel(p.year)}(総額・万円)</p>${rowsHtml}`;
    tooltip.classList.remove('hidden');
    const wrapRect = chartWrap.getBoundingClientRect();
    let left = clientX - wrapRect.left + 14;
    let top = clientY - wrapRect.top + 14;
    if (left + tooltip.offsetWidth > wrapRect.width) left = clientX - wrapRect.left - tooltip.offsetWidth - 14;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  if (svgEl) {
    svgEl.addEventListener('mousemove', onChartMove);
    svgEl.addEventListener('mouseleave', function () {
      tooltip.classList.add('hidden');
    });
    svgEl.addEventListener('touchstart', onChartMove);
    svgEl.addEventListener('touchmove', function (e) { onChartMove(e); e.preventDefault(); }, { passive: false });
  }

  // ===== PDF出力 =====
  function doPrint() {
    if (!lastSeries) return;
    const now = new Date();
    document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    document.getElementById('pSize').textContent = lastYear0.sizeLabel;

    const p0 = lastSeries[0];
    const roundMan = (n) => Math.round(n).toLocaleString('ja-JP');
    Object.keys(BASE_METRICS).forEach((base) => {
      const elA = document.getElementById(`pcv_${base}_A`);
      const elB = document.getElementById(`pcv_${base}_B`);
      if (elA) elA.textContent = roundMan(p0[`${base}T_A`]);
      if (elB) elB.textContent = roundMan(p0[`${base}T_B`]);
    });

    // 推移表(印刷用)
    let rows = '';
    lastSeries.forEach((p) => {
      const cell = (v) => `<td>${roundMan(v)}</td>`;
      rows += `<tr><td class="lbl">${yearLabel(p.year)}</td>
        ${cell(p.saizokuT_A)}${cell(p.houjinT_A)}${cell(p.ruijiT_A)}${cell(p.junsisanT_A)}${cell(p.mandaT_A)}
        ${cell(p.saizokuT_B)}${cell(p.houjinT_B)}${cell(p.ruijiT_B)}${cell(p.junsisanT_B)}${cell(p.mandaT_B)}</tr>`;
    });
    document.getElementById('pTrendTableBody').innerHTML = rows;

    // 印刷用の凡例(現在選択中の指標)
    renderLegend(document.getElementById('pChartLegend'));

    // グラフSVGを複製(アニメーションは無効化)
    const slot = document.getElementById('pChartSlot');
    slot.innerHTML = '';
    const chart = document.getElementById('trendChart');
    if (chart) {
      const clone = chart.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('.chart-bar').forEach((r) => {
        r.style.animation = 'none';
      });
      slot.appendChild(clone);
    }

    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: 入力ページの保存値(またはサンプル値)で自動試算 =====
  refreshAll();
});

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
    'retirementYear', 'retirementAmount', 'specialLossYear', 'specialLossAmount', 'mvNetAssets', 'realOpProfit',
    'insuranceAmount', 'insuranceGrowthRate', 'coveragePeriod', 'premiumAmount', 'deductibleRatio',
  ];

  const STORAGE_KEY = 'bpl_stock_valuation_v1';
  const DEFAULTS = {
    companySize: 'mid-mid',
    taxAssets: 15000, taxLiabilities: 8000, bookAssets: 12000, bookLiabilities: 8000,
    simA: 480, simB: 6.0, simC: 45, simD: 350, ownB: 4.0, ownC: 60, ownD: 420,
    sharesOutstanding: 2000, capitalAmount: 1000000,
    corpTaxRateProj: 30, annualProfit: 3000, annualProfitB: 2000, annualDividend: 0,
    retirementYear: 10, retirementAmount: 5000, mvNetAssets: 20000, realOpProfit: 2500,
    // その他特別損失(発生時期を指定して純資産の推移に反映。未入力なら影響なし)
    specialLossYear: 15, specialLossAmount: 0,
    // 生命保険の契約条件(死亡保険金額のグラフ表示・参考情報として保持)
    insuranceAmount: 10000, insuranceGrowthRate: 3, coveragePeriod: 10, premiumAmount: 500, deductibleRatio: 100,
    // 簡易版(DSレイアウト)で転記した評価額の起点(万円)
    ss0_saizoku: 30237, ss0_ruiji: 23557, ss0_junsisan: 50277, ss0_houjin: 36917,
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
      const parsed = raw === undefined || raw === '' ? NaN : (window.numClean ? window.numClean(raw) : parseFloat(raw));
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
    // 類似業種比準・純資産は参考指標のため、区別せず薄灰/濃灰に統一(重要な指標=相続税評価・法人税法上の評価を目立たせる)
    ruiji: { light: '#b3b8bd', dark: '#6b7075' },
    junsisan: { light: '#b3b8bd', dark: '#6b7075' },
    manda: { light: '#9c5866', dark: '#6b3540' },
  };
  const METRICS = {};
  // M&A評価は次回バージョンで公開予定のため、当面グラフ・凡例・ツールチップから隠す
  const HIDDEN_BASES = ['manda'];
  Object.keys(BASE_METRICS).forEach((base) => {
    const hidden = HIDDEN_BASES.includes(base);
    METRICS[`${base}_A`] = { label: `${BASE_METRICS[base]}(シナリオA)`, field: `${base}T_A`, color: BASE_COLORS[base].light, base, scenario: 'A', hidden };
    METRICS[`${base}_B`] = { label: `${BASE_METRICS[base]}(シナリオB)`, field: `${base}T_B`, color: BASE_COLORS[base].dark, base, scenario: 'B', hidden };
  });
  let selectedMetrics = ['saizoku_A'];
  let showInsurance = false; // 死亡保険金額をグラフ背景に表示するかどうか(ボタンでトグル)
  let showRetirement = true; // 退職金マーカーをグラフに表示するかどうか(ボタンでトグル、既定は表示)
  let showSpecialLoss = false; // その他特別損失マーカーをグラフに表示するかどうか(ボタンでトグル)

  const yen = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 円';
  const man = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 万円';
  // 評価額タイル専用: 数字だけ大きく(老眼対応)、単位「万円」は従来サイズのまま
  const manTile = (n) => {
    const numStr = window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP');
    return `<span class="tile-num">${numStr}</span><span class="tile-unit">万円</span>`;
  };
  const yearLabel = (y) => (y === 0 ? '現在' : `${y}年後`);

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // 年0(現在時点)の評価額(1株当たり)を計算
  // 簡易版(DSレイアウト)で転記した時価総額(万円)を起点として使用する
  function computeYear0(v) {
    const sizeCfg = SIZE_CONFIG[v.companySize] || SIZE_CONFIG['mid-mid'];
    const L = sizeCfg.l;
    const shinshaku = sizeCfg.shin;
    const sizeLabel = sizeCfg.label;
    const shares = v.sharesOutstanding;

    const netAssetsAtValuation = v.ss0_junsisan; // 純資産価額(万円)
    const netAssetPerShare = (netAssetsAtValuation * 10000) / shares;
    const similarPerShareActual = (v.ss0_ruiji * 10000) / shares; // 類似業種比準(1株)
    const saizokuPerShare = (v.ss0_saizoku * 10000) / shares; // 相続税評価(採用)
    const houjinPerShare = (v.ss0_houjin * 10000) / shares; // 法人税法上評価

    const combined = saizokuPerShare;
    const finalPerShare = saizokuPerShare;
    const finalTotal = finalPerShare * shares;

    return {
      sizeLabel, L, shinshaku,
      netAssetsAtValuation, netAssetPerShare,
      similarPerShareActual, saizokuPerShare, combined, finalPerShare, houjinPerShare, finalTotal,
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
      // 類似業種比準は起点値を純資産の成長率に比例させて推移(利益A/Bの差が反映される)
      const similarPerShareActual = year0.similarPerShareActual * growthRatio;
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
      if (shared.specialLossYear !== null && shared.specialLossYear === t) {
        retained -= shared.specialLossAmount;
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
      specialLossYear: v.specialLossYear,
      specialLossAmount: v.specialLossAmount,
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
      const lamp = btn.querySelector('.tile-lamp');
      // 通常時はネイビー枠+白背景+ネイビー文字で全タイル共通。選択時のみランプ点灯+枠がグラフの棒の色になる
      if (lamp) lamp.classList.toggle('is-lit', selected);
      btn.classList.toggle('tile-selected', selected);
      btn.style.borderColor = selected ? color : '';
    });
  }

  // ===== グラフ描画(選択された1〜2指標を同じ太さでずらして重ねて表示) =====
  function drawChart(series, retirementYear) {
    const svg = document.getElementById('trendChart');
    const W = 800, H = 320, padL = 80, padR = 20, padT = 20, padB = 40;
    // SVG本体のviewBoxはWより少し広く(830)確保してあり、30年目のイベントフラッグ(幅76px)が
    // 軸の右端でクランプされず正しい位置に表示できるようにしている(バー・軸はWを基準に従来通り描画)
    const SVG_W = 830;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const activeFields = selectedMetrics.map((k) => METRICS[k].field);
    // 死亡保険金額(showInsurance)はスケールに含めない: 上限を超えたら天井に張り付く仕様でよいため。
    // バーの最大値には少し余白(8%)を持たせ、一番高い棒がグラフ上端にぴったり付かないようにする。
    const rawMaxV = Math.max(...series.flatMap((p) => activeFields.map((f) => p[f])), 1);
    const maxV = rawMaxV * 1.08;
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

    // バーはすべて透過度50%で統一(退職金年の枠線強調は廃止し、別途マーカーで表現)
    function barAttrs(p, m) {
      return `fill="${m.color}" stroke="#2b323d" stroke-width="0.5" stroke-opacity="0.1" fill-opacity="0.5"`;
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
          bars += `<rect class="chart-bar" data-year="${i}" data-metric="${key}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" ${barAttrs(p, m)} rx="1.5" style="animation-delay:${delay}ms"/>`;
        });
      });
    }

    let xLabels = '';
    [0, 5, 10, 15, 20, 25, 30].forEach((yr) => {
      const gx = padL + yr * slotWidth + slotWidth / 2;
      xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${yearLabel(yr)}</text>`;
    });

    // ===== 年次イベント(退職金・特別損失)の洗練された強調: 枠線ではなく、破線ガイド + ラベルフラッグ、ボタンでトグル表示 =====
    // 2つのラベルは文字数(3文字/4文字)に関わらず同じサイズに統一。同じ年に重なる場合は縦に並べて表示する。
    const EVENT_FLAG_WIDTH = 76;
    const EVENT_FLAG_H = 16;
    function drawEventFlag(year, label, color, topY, drawGuide) {
      if (year === null || year === undefined || isNaN(year) || year < 1 || year > 30) return { line: '', flag: '' };
      const rxc = padL + year * slotWidth + slotWidth / 2;
      const clampX = Math.max(padL + EVENT_FLAG_WIDTH / 2, Math.min(SVG_W - EVENT_FLAG_WIDTH / 2 - 4, rxc));
      let flag = `<rect x="${(clampX - EVENT_FLAG_WIDTH / 2).toFixed(1)}" y="${topY.toFixed(1)}" width="${EVENT_FLAG_WIDTH}" height="${EVENT_FLAG_H}" rx="8" fill="${color}"/>
        <text x="${clampX.toFixed(1)}" y="${(topY + 11.5).toFixed(1)}" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">${label}</text>`;
      let line = '';
      if (drawGuide) {
        const triY = topY + EVENT_FLAG_H;
        // 三角の頂点・ガイド線は常にclampX(フラッグの実際の位置)を基準にし、フラッグと視覚的に必ず繋がるようにする
        flag += `<path d="M ${(clampX - 4).toFixed(1)} ${(triY + 1).toFixed(1)} L ${(clampX + 4).toFixed(1)} ${(triY + 1).toFixed(1)} L ${clampX.toFixed(1)} ${(triY + 6).toFixed(1)} Z" fill="${color}"/>`;
        line = `<line x1="${clampX.toFixed(1)}" y1="${(triY + 6).toFixed(1)}" x2="${clampX.toFixed(1)}" y2="${yBottom}" stroke="${hexToRgba(color, 0.38)}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
      }
      return { line, flag: `<g>${flag}</g>` };
    }

    let retireLine = '', retireFlag = '', lossLine = '', lossFlag = '';
    const bothEventsActive = showRetirement && showSpecialLoss && currentValues &&
      retirementYear !== null && currentValues.specialLossYear !== null &&
      retirementYear >= 1 && retirementYear <= 30 &&
      currentValues.specialLossYear >= 1 && currentValues.specialLossYear <= 30;
    // 年が近く(ピクセル距離がフラッグ幅未満)フラッグ同士が重なって隠れてしまう場合は縦に並べる。
    // 完全に同じ年のときだけ、ガイド線は下段(特別損失)側にまとめて重複を避ける。
    const yearGapPx = bothEventsActive ? Math.abs(retirementYear - currentValues.specialLossYear) * slotWidth : Infinity;
    const exactSameYear = bothEventsActive && retirementYear === currentValues.specialLossYear;
    const needStack = bothEventsActive && yearGapPx < EVENT_FLAG_WIDTH + 8;

    if (showRetirement) {
      if (needStack) {
        const m = drawEventFlag(retirementYear, '退職金', '#0f2a4a', 1, !exactSameYear);
        retireLine = m.line; retireFlag = m.flag;
      } else {
        const m = drawEventFlag(retirementYear, '退職金', '#0f2a4a', 1, true);
        retireLine = m.line; retireFlag = m.flag;
      }
    }

    if (showSpecialLoss && currentValues) {
      if (needStack) {
        // 縦並び時は特別損失を下段に配置し、ガイド線・三角はここから伸ばす
        const m = drawEventFlag(currentValues.specialLossYear, '特別損失', '#b0651b', 1 + EVENT_FLAG_H + 3, true);
        lossLine = m.line; lossFlag = m.flag;
      } else {
        const m = drawEventFlag(currentValues.specialLossYear, '特別損失', '#b0651b', 1, true);
        lossLine = m.line; lossFlag = m.flag;
      }
    }

    // ===== 死亡保険金額(グラフ背景の階段状エリア、ボタンでトグル表示) =====
    // 上昇率(年%)が設定されていれば複利で増える死亡保険金額を階段状に描画する(変額保険・外貨建て保険等を想定)。
    // グラフの表示上限(y軸最大値)を超える場合はpadTでクランプし、上限に張り付いた見た目で問題ない仕様。
    let insuranceRect = '';
    if (showInsurance && currentValues && currentValues.insuranceAmount > 0) {
      const amt0 = currentValues.insuranceAmount;
      const growthFactor = 1 + (currentValues.insuranceGrowthRate || 0) / 100;
      const period = Math.max(0, Math.min(30, Math.round(currentValues.coveragePeriod || 0)));
      if (period > 0) {
        let d = `M ${padL.toFixed(1)} ${yBottom.toFixed(1)} `;
        let prevY = null;
        for (let i = 0; i < period; i++) {
          const amtT = amt0 * Math.pow(growthFactor, i);
          const yTop = Math.max(padT, y(amtT));
          const xLeft = padL + i * slotWidth;
          const xRight = padL + (i + 1) * slotWidth;
          if (prevY === null || Math.abs(yTop - prevY) > 0.05) {
            d += `L ${xLeft.toFixed(1)} ${yTop.toFixed(1)} `;
          }
          d += `L ${xRight.toFixed(1)} ${yTop.toFixed(1)} `;
          prevY = yTop;
        }
        const xEnd = padL + period * slotWidth;
        d += `L ${xEnd.toFixed(1)} ${yBottom.toFixed(1)} Z`;
        insuranceRect = `<path d="${d}" fill="rgba(168,61,61,0.14)" stroke="rgba(168,61,61,0.4)" stroke-width="1" stroke-dasharray="3 3"/>`;
      }
    }

    svg.innerHTML = `
      ${gridLines}
      ${insuranceRect}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>
      <line x1="${padL}" y1="${yBottom}" x2="${W - padR}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>
      ${retireLine}
      ${lossLine}
      ${xLabels}
      ${bars}
      ${retireFlag}
      ${lossFlag}
    `;

    chartLayout = { W, padL, plotW, slotWidth, count: series.length };
  }

  // 列ごとの色分け(タイル・ヘッダーと同じ配色。等間隔の列幅に合わせ、行のゼブラではなく列の色帯で識別する)
  const TABLE_COL_CLASSES = ['col-saizoku-a', 'col-houjin-a', 'col-ruiji-a', 'col-junsisan-a', 'col-saizoku-b', 'col-houjin-b', 'col-ruiji-b', 'col-junsisan-b'];
  function renderTable(series) {
    const body = document.getElementById('trendTableBody');
    let rows = '';
    series.forEach((p) => {
      const vals = [p.saizokuT_A, p.houjinT_A, p.ruijiT_A, p.junsisanT_A, p.saizokuT_B, p.houjinT_B, p.ruijiT_B, p.junsisanT_B];
      const cells = vals.map((v, i) => `<td class="px-2 py-1.5 text-right ${TABLE_COL_CLASSES[i]}${i === 4 ? ' border-l border-gray-200' : ''}">${Math.round(v).toLocaleString('ja-JP')}</td>`).join('');
      rows += `<tr class="border-b border-gray-100">
        <td class="px-2 py-1.5 text-center text-gray-700 border-r border-gray-200 bg-white">${yearLabel(p.year)}</td>
        ${cells}
      </tr>`;
    });
    body.innerHTML = rows;
  }

  function updateCurrentValues(series) {
    const p0 = series[0];
    Object.keys(BASE_METRICS).forEach((base) => {
      const elA = document.getElementById(`cv_${base}_A`);
      const elB = document.getElementById(`cv_${base}_B`);
      if (elA) elA.innerHTML = manTile(p0[`${base}T_A`]);
      if (elB) elB.innerHTML = manTile(p0[`${base}T_B`]);
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
      }
    });
  }

  // ===== 死亡保険金額の表示トグル =====
  const insuranceToggleBtn = document.getElementById('insuranceToggleBtn');
  if (insuranceToggleBtn) {
    insuranceToggleBtn.addEventListener('click', function () {
      showInsurance = !showInsurance;
      insuranceToggleBtn.classList.toggle('is-on', showInsurance);
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
      }
    });
  }

  // ===== 退職金マーカーの表示トグル =====
  const retirementToggleBtn = document.getElementById('retirementToggleBtn');
  if (retirementToggleBtn) {
    retirementToggleBtn.addEventListener('click', function () {
      showRetirement = !showRetirement;
      retirementToggleBtn.classList.toggle('is-on', showRetirement);
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
      }
    });
  }

  // ===== その他特別損失マーカーの表示トグル =====
  const specialLossToggleBtn = document.getElementById('specialLossToggleBtn');
  if (specialLossToggleBtn) {
    specialLossToggleBtn.addEventListener('click', function () {
      showSpecialLoss = !showSpecialLoss;
      specialLossToggleBtn.classList.toggle('is-on', showSpecialLoss);
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
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
    const rowsHtml = Object.keys(METRICS).filter((key) => !METRICS[key].hidden).map((key) => {
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
    const roundMan = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));
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
        ${cell(p.saizokuT_A)}${cell(p.houjinT_A)}${cell(p.ruijiT_A)}${cell(p.junsisanT_A)}
        ${cell(p.saizokuT_B)}${cell(p.houjinT_B)}${cell(p.ruijiT_B)}${cell(p.junsisanT_B)}</tr>`;
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

  // ===== ？ツールチップ(タップで開閉・モバイル対応) =====
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

  // ===== 初期表示: 入力ページの保存値(またはサンプル値)で自動試算 =====
  refreshAll();
});

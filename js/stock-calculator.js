document.addEventListener('DOMContentLoaded', function () {
  const chartArea = document.getElementById('chartArea');
  if (!chartArea) return;

  const metricTilesEl = document.getElementById('metricTiles');
  const livePanel = document.getElementById('livePanel');
  let lastSeries = null;
  let lastYear0 = null;
  let chartLayout = null;
  let currentValues = null;

  // ===== 「選択した株主のみ」モード =====
  // ONのとき、株主の状況でチェックした株主の持分(株数)だけを評価額の総額に反映する。
  // 1株あたりの評価・倍率は会社全体のままで、グラフ・タイル・推移表・総額だけを按分する
  let selHoldersMode = false;
  let holderSel = null; // 株主index→チェック状態(未設定はチェック済み扱い)

  const PROJECTION_IDS = [
    'corpTaxRateProj', 'annualProfit', 'annualProfitB', 'annualDividend',
    'retirementYear', 'retirementAmount', 'specialLossYear', 'specialLossAmount', 'mvNetAssets', 'realOpProfit',
    'insuranceAmount', 'insuranceGrowthRate', 'coveragePeriod', 'premiumAmount', 'deductibleRatio',
    'rim0_book', 'rim0_profit', 'rimProfitB',
  ];

  const STORAGE_KEY = 'bpl_stock_valuation_v1';
  // テスト配信ページ(trial-)ではサンプル既定値を使わず、データクリア状態を既定にする
  // (法人税率だけはルールどおり30%を既定に残す)
  const IS_TRIAL = window.location.pathname.indexOf('trial-') >= 0;
  const DEFAULTS = {
    companySize: 'large',
    taxAssets: 15000, taxLiabilities: 8000, bookAssets: 12000, bookLiabilities: 8000,
    simA: 480, simB: 6.0, simC: 45, simD: 350, ownB: 4.0, ownC: 60, ownD: 420,
    sharesOutstanding: 200000, capitalAmount: 10000000,
    corpTaxRateProj: 30, annualProfit: 3000, annualProfitB: 2000, annualDividend: 0,
    retirementYear: 10, retirementAmount: 20000, mvNetAssets: 20000, realOpProfit: 2500,
    // その他特別損失(発生時期を指定して純資産の推移に反映。未入力なら影響なし)
    specialLossYear: 15, specialLossAmount: 10000,
    // 生命保険の契約条件(死亡保険金額のグラフ表示・参考情報として保持)
    insuranceAmount: 30000, insuranceGrowthRate: 3, coveragePeriod: 25, premiumAmount: 500, deductibleRatio: 60,
    // 簡易版(DSレイアウト)で転記した評価額の起点(万円)
    ss0_saizoku: 30000, ss0_ruiji: 30000, ss0_junsisan: 60000, ss0_houjin: 45000,
    // 残余利益方式(検討中の新方式)の起点: 簿価純資産・平常時税引後利益(万円)と割引率(%)・加算年数(年)
    rim0_book: 50000, rim0_profit: 5000, rimProfitB: 5000, rimRate: 5, rimYears: 5,
  };
  // trial用のゼロ既定(companySizeとcorpTaxRateProj以外は全て0)
  const TRIAL_DEF = (function () {
    const o = {};
    Object.keys(DEFAULTS).forEach((k) => {
      // 割引率・加算年数は「未入力なら5%・5年」という既定値ルールのためtrialでも5を使う
      o[k] = k === 'companySize' ? DEFAULTS.companySize
        : (k === 'corpTaxRateProj' ? 30 : (k === 'rimRate' || k === 'rimYears' ? 5 : 0));
    });
    return o;
  })();

  // 「選択した株主のみ」の保存・読込(入力ページと同じSTORAGE_KEYに相乗りする)
  function loadHolderSel() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const o = raw ? JSON.parse(raw) : {};
      selHoldersMode = o.ss_holderSelMode === '1';
      holderSel = o.ss_holderSel ? JSON.parse(o.ss_holderSel) : null;
    } catch (e) {}
  }
  function persistHolderSel() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const o = raw ? JSON.parse(raw) : {};
      o.ss_holderSelMode = selHoldersMode ? '1' : '0';
      if (holderSel) o.ss_holderSel = JSON.stringify(holderSel);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    } catch (e) {}
  }
  function holderChecked(i) {
    return (!holderSel || holderSel[i] === undefined || holderSel[i] === null) ? true : !!holderSel[i];
  }
  // チェックした株主の持株数合計 ÷ 発行済株式数(モードOFFや株主未登録のときは1)
  function holderFactor() {
    if (!selHoldersMode || !currentValues) return 1;
    let stored = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : {};
    } catch (e) {}
    let holders = [];
    try { holders = stored.ss_holders ? JSON.parse(stored.ss_holders) : []; } catch (e) {}
    const shares = currentValues.sharesOutstanding;
    if (!holders.length || !(shares > 0)) return 1;
    let sum = 0;
    holders.forEach(function (h, i) {
      if (!holderChecked(i)) return;
      const hs = window.numClean ? window.numClean(h.shares) : parseFloat(h.shares);
      const hr = window.numClean ? window.numClean(h.ratio) : parseFloat(h.ratio);
      const eff = !isNaN(hs) ? hs : (!isNaN(hr) ? (hr / 100) * shares : NaN);
      if (!isNaN(eff)) sum += eff;
    });
    return sum / shares;
  }

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
    const fallback = IS_TRIAL ? TRIAL_DEF : DEFAULTS; // trialは入力したもののみ反映(未入力=0)
    const src = stored || fallback;
    const v = { companySize: src.companySize || fallback.companySize };
    Object.keys(DEFAULTS).forEach((key) => {
      if (key === 'companySize') return;
      const raw = src[key];
      const parsed = raw === undefined || raw === '' ? NaN : (window.numClean ? window.numClean(raw) : parseFloat(raw));
      v[key] = isNaN(parsed) ? fallback[key] : parsed;
    });
    return { v, usedDefaults };
  }

  // 5指標 × 利益A/Bシナリオ = 10種類
  const BASE_METRICS = {
    saizoku: '相続税評価',
    houjin: '法人税法上の評価',
    ruiji: '類似業種比準',
    junsisan: '純資産',
    rim: '残余利益方式',
    manda: 'M&A評価',
  };
  const BASE_COLORS = {
    saizoku: { light: '#6d7f92', dark: '#2f4fa8' },
    houjin: { light: '#7c8f7a', dark: '#5ca63c' },
    // 類似業種比準・純資産は参考指標のため、区別せず薄灰/濃灰に統一(重要な指標=相続税評価・法人税法上の評価を目立たせる)
    ruiji: { light: '#b3b8bd', dark: '#6b7075' },
    junsisan: { light: '#b3b8bd', dark: '#6b7075' },
    manda: { light: '#9c5866', dark: '#6b3540' },
    // 残余利益方式(検討中の新方式)は赤系で「参考・注意」であることを示す
    rim: { light: '#c47070', dark: '#9e2f2f' },
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
  let showInsuranceNet = false; // 死亡保険金額を「法人税率(%)」欄の税率で控除した後(手取り)の金額で表示するかどうか(既定はOFF・ボタンでトグル)
  let showRetirement = false; // 退職金マーカーをグラフに表示するかどうか(既定はOFF・ボタンでトグル)
  let showSpecialLoss = false; // その他特別損失マーカーをグラフに表示するかどうか(ボタンでトグル)
  let dsShowAfter = false; // 自社株評価・株主の状況テーブルをシナリオB(対策後)で表示するかどうか(ボタンでトグル)
  let dsYear = 30; // 自社株評価・株主の状況テーブルの表示年数(入力欄でリアルタイムに変更可能)
  let horizonYears = 30; // グラフ・推移表の表示期間(30/40/50/60年をプルダウンで選択)
  let autoPremiumToB = false; // 保険料を【変更後】税引前利益に自動反映するかどうか(既定OFF・ボタンでトグル)
  let manualBMode = false;    // 【変更後】税引前利益を手入力するかどうか(既定OFF=自動入力エリア)
  let manualRimMode = false;  // 残余利益方式の簿価純資産・税引後純利益を手入力するかどうか(既定OFF=入力ページから自動)
  let manualRimBMode = false; // 【変更後】RIM税引後純利益を手入力するかどうか(既定OFF=自動計算)

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
    // 株数0(未入力)のとき0除算でNaNにならないようにする(評価0のまま表示できる)
    const shares = v.sharesOutstanding > 0 ? v.sharesOutstanding : 1;

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

  // 1つのシナリオ(年間税引前利益を指定)について、0〜表示期間(horizonYears)の5指標(総額万円)を計算
  function computeScenario(v, year0, annualProfitValue, shared, scenarioKey) {
    const sizeCfg = SIZE_CONFIG[v.companySize] || SIZE_CONFIG['mid-mid'];
    const L = sizeCfg.l;
    const shinshaku = sizeCfg.shin;
    const shares = v.sharesOutstanding > 0 ? v.sharesOutstanding : 1;
    const shares50YenBasis = v.capitalAmount > 0 ? v.capitalAmount / 50 : 1;
    const afterTaxProfit = annualProfitValue * (1 - shared.corpTaxRate / 100);
    const base0 = year0.netAssetsAtValuation;

    // ===== 残余利益方式(RIM): 簿価純資産_t + (平常時税引後利益 - 簿価純資産_t×割引率)×現価係数 =====
    // 退職金・特損などの一時損失は「平常時利益」から除外して算定する(有識者会議の方向性)。
    // ただし簿価純資産の減少はそのまま効く。純資産が減ると通常期待利益(純資産×割引率)も
    // 下がって超過収益が増えるため、引下げ効果は一部相殺され、支払額ほどは評価が下がらない。
    // 保険料の損金は毎年続く経常損金として利益(→純資産の蓄積)にそのまま効く。
    const rimR = (v.rimRate > 0 ? v.rimRate : 5) / 100;
    const rimN = Math.max(1, Math.round(v.rimYears >= 1 ? v.rimYears : 5));
    const rimCoef = (1 - Math.pow(1 + rimR, -rimN)) / rimR;
    const rimValid = !isNaN(v.rim0_book) && !isNaN(v.rim0_profit) && (v.rim0_book !== 0 || v.rim0_profit !== 0);
    // シナリオごとの平常時税引後利益: 入力値に、税引前利益の差(保険料損金など)の税引後額を加減する
    // シナリオBで「【変更後】RIM税引後純利益」を手入力している場合はその値を優先する
    const rimProfit = !rimValid ? NaN
      : (scenarioKey === 'B' && manualRimBMode && !isNaN(v.rimProfitB))
        ? v.rimProfitB
        : v.rim0_profit + (annualProfitValue - v.annualProfit) * (1 - shared.corpTaxRate / 100);
    const rimAt = (book) => (rimValid ? book + (rimProfit - book * rimR) * rimCoef : NaN);

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
    let rimBook = v.rim0_book;
    const first = metricsFor(0, cumulative);
    first.rim = rimAt(rimBook);
    const out = [first];
    for (let t = 1; t <= horizonYears; t++) {
      let retained = afterTaxProfit - shared.annualDividend;
      let oneTime = 0;
      if (shared.retirementYear !== null && shared.retirementYear === t) {
        retained -= shared.retirementAmount;
        oneTime += shared.retirementAmount;
      }
      if (shared.specialLossYear !== null && shared.specialLossYear === t) {
        retained -= shared.specialLossAmount;
        oneTime += shared.specialLossAmount;
      }
      cumulative += retained;
      // RIMの簿価純資産: 平常時税引後利益で蓄積し、配当・退職金・特損で減少する
      // (一時損失は利益側から除外されるが、純資産の減少はそのまま評価に反映される)
      rimBook += (isNaN(rimProfit) ? 0 : rimProfit) - shared.annualDividend - oneTime;
      const m = metricsFor(t, cumulative);
      m.rim = rimAt(rimBook);
      out.push(m);
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

    const seriesA = computeScenario(v, year0, v.annualProfit, shared, 'A');
    const seriesB = computeScenario(v, year0, v.annualProfitB, shared, 'B');

    const series = [];
    for (let t = 0; t <= horizonYears; t++) {
      series.push({
        year: t,
        saizokuT_A: seriesA[t].saizoku, houjinT_A: seriesA[t].houjin, ruijiT_A: seriesA[t].ruiji, junsisanT_A: seriesA[t].junsisan, mandaT_A: seriesA[t].manda, rimT_A: seriesA[t].rim,
        saizokuT_B: seriesB[t].saizoku, houjinT_B: seriesB[t].houjin, ruijiT_B: seriesB[t].ruiji, junsisanT_B: seriesB[t].junsisan, mandaT_B: seriesB[t].manda, rimT_B: seriesB[t].rim,
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
      // 通常時はネイビー枠+白背景+ネイビー文字で全タイル共通。選択時のみランプ点灯+背景がグラフの棒の色になる
      if (lamp) lamp.classList.toggle('is-lit', selected);
      btn.classList.toggle('tile-selected', selected);
      btn.style.backgroundColor = selected ? color : '';
      btn.style.borderColor = selected ? color : '';
    });
  }

  // ===== グラフ描画(選択された1〜2指標を同じ太さでずらして重ねて表示) =====
  // 年齢・株価表(グラフ下のExcel風データテーブル)の表示状態
  let showAgeTable = false;
  let ownerAgeDemo = null; // レイアウト確認(?agetable=1)専用の年齢フォールバック

  function drawChart(series, retirementYear) {
    const svg = document.getElementById('trendChart');
    const W = 800, H = 320, padL = 80, padR = 20, padT = 20, padB = 40;
    // SVG本体のviewBoxはWより少し広く(830)確保してあり、30年目のイベントフラッグ(幅76px)が
    // 軸の右端でクランプされず正しい位置に表示できるようにしている(バー・軸はWを基準に従来通り描画)
    const SVG_W = 830;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const activeFields = selectedMetrics.map((k) => METRICS[k].field);
    // 「選択した株主のみ」モードでは、チェックした株主の持分割合で総額を按分して描く
    const HF = holderFactor();
    // 死亡保険金額(showInsurance)はスケールに含めない: 上限を超えたら天井に張り付く仕様でよいため。
    // 目盛りがキリのいい数字(1・2・2.5・5×10^n刻み)になるよう、最大値を切り上げて4等分する
    const rawMaxV = Math.max(...series.flatMap((p) => activeFields.map((f) => p[f] * HF)).filter((x) => !isNaN(x)), 1);
    const niceStep = (x) => {
      const pow = Math.pow(10, Math.floor(Math.log10(x)));
      const f = x / pow;
      const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
      return nf * pow;
    };
    const step = niceStep((rawMaxV * 1.05) / 4);
    const maxV = step * 4;
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

    // 3指標表示時は少し細くして隣の年に食み出さないようにする
    const barWidth = slotWidth * (selectedMetrics.length >= 3 ? 0.55 : 0.68);
    const overlapOffset = barWidth / 3; // 約1/3ずらして重ねる

    let bars = '';
    if (selectedMetrics.length === 1) {
      const m = METRICS[selectedMetrics[0]];
      series.forEach((p, i) => {
        if (isNaN(p[m.field])) return;
        const barX = padL + i * slotWidth + (slotWidth - barWidth) / 2;
        const barY = y(p[m.field] * HF);
        const barH = Math.max(0, yBottom - barY);
        const delay = (i * 30).toFixed(0);
        bars += `<rect class="chart-bar" data-year="${i}" data-metric="${selectedMetrics[0]}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" ${barAttrs(p, m)} rx="1.5" style="animation-delay:${delay}ms"/>`;
      });
    } else {
      const groupWidth = barWidth + overlapOffset * (selectedMetrics.length - 1);
      selectedMetrics.forEach((key, si) => {
        const m = METRICS[key];
        series.forEach((p, i) => {
          if (isNaN(p[m.field])) return;
          const groupStart = padL + i * slotWidth + (slotWidth - groupWidth) / 2;
          const barX = groupStart + si * overlapOffset;
          const barY = y(p[m.field] * HF);
          const barH = Math.max(0, yBottom - barY);
          const delay = (i * 30 + si * 15).toFixed(0);
          bars += `<rect class="chart-bar" data-year="${i}" data-metric="${key}" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" ${barAttrs(p, m)} rx="1.5" style="animation-delay:${delay}ms"/>`;
        });
      });
    }

    const ageTableActive = showAgeTable && horizonYears <= 30;
    let xLabels = '';
    const xStep = horizonYears > 40 ? 10 : 5;
    const xTicks = [];
    for (let yr = 0; yr <= horizonYears; yr += xStep) xTicks.push(yr);
    // 年齢・株価表の表示中は、表の「経過年数」行が軸ラベルを兼ねるため二重表示を避ける
    if (!ageTableActive) {
      xTicks.forEach((yr) => {
        const gx = padL + yr * slotWidth + slotWidth / 2;
        xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${yearLabel(yr)}</text>`;
      });
    }

    // ===== 年次イベント(退職金・特別損失)の洗練された強調: 枠線ではなく、破線ガイド + ラベルフラッグ、ボタンでトグル表示 =====
    // 2つのラベルは文字数(3文字/4文字)に関わらず同じサイズに統一。同じ年に重なる場合は縦に並べて表示する。
    const EVENT_FLAG_WIDTH = 76;
    const EVENT_FLAG_H = 16;
    function drawEventFlag(year, label, color, topY, drawGuide) {
      if (year === null || year === undefined || isNaN(year) || year < 1 || year > horizonYears) return { line: '', flag: '' };
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
      retirementYear >= 1 && retirementYear <= horizonYears &&
      currentValues.specialLossYear >= 1 && currentValues.specialLossYear <= horizonYears;
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
      // 手取り表示ONの場合、死亡保険金は受取時に法人税が課税されるため「法人税率(%)」欄の税率で
      // 控除した後の金額(手取り額)を起点として描画する(以降の年率成長も手取り額ベースで複利計算)。
      const netFactor = showInsuranceNet ? Math.max(0, 1 - (currentValues.corpTaxRateProj || 0) / 100) : 1;
      const amt0 = currentValues.insuranceAmount * netFactor;
      const growthFactor = 1 + (currentValues.insuranceGrowthRate || 0) / 100;
      const periodRaw = Math.max(0, Math.round(currentValues.coveragePeriod || 0));
      const period = Math.min(horizonYears, periodRaw);
      // 表示期間を超える保障期間が入力された場合、そこで保障が終わるわけではないことを示す
      const continuesBeyond = periodRaw > horizonYears;
      if (period > 0) {
        // i<=period(年periodのバーの右端まで)にすることで、保障期間ぴったりまで塗りが届くようにする
        // (以前はi<periodだったため、保障期間30年でも29年目のバーで塗りが止まって見えていた)
        let d = `M ${padL.toFixed(1)} ${yBottom.toFixed(1)} `;
        let prevY = null;
        let lastYTop = yBottom;
        for (let i = 0; i <= period; i++) {
          const amtT = amt0 * Math.pow(growthFactor, i);
          const yTop = Math.max(padT, y(amtT));
          const xLeft = padL + i * slotWidth;
          const xRight = padL + (i + 1) * slotWidth;
          if (prevY === null || Math.abs(yTop - prevY) > 0.05) {
            d += `L ${xLeft.toFixed(1)} ${yTop.toFixed(1)} `;
          }
          d += `L ${xRight.toFixed(1)} ${yTop.toFixed(1)} `;
          prevY = yTop;
          lastYTop = yTop;
        }
        const xEnd = padL + (period + 1) * slotWidth;
        d += `L ${xEnd.toFixed(1)} ${yBottom.toFixed(1)} Z`;
        const fill = continuesBeyond ? 'url(#insuranceFadeGradient)' : 'rgba(168,61,61,0.26)';
        insuranceRect = `<path d="${d}" fill="${fill}" stroke="rgba(131,47,47,0.7)" stroke-width="1.2" stroke-dasharray="3 3"/>`;
        if (continuesBeyond) {
          // 30年目の右端に、保障がその先も続くことを示す矢印(">>")をSVG_Wの余白(800〜830)に描く
          const cy = lastYTop;
          const chevron = (cx) => `<path d="M ${cx - 5} ${(cy - 6).toFixed(1)} L ${cx + 3} ${cy.toFixed(1)} L ${cx - 5} ${(cy + 6).toFixed(1)}" fill="none" stroke="rgba(131,47,47,0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
          insuranceRect += `
            <defs>
              <linearGradient id="insuranceFadeGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="85%" stop-color="rgba(168,61,61,0.26)"/>
                <stop offset="100%" stop-color="rgba(168,61,61,0.02)"/>
              </linearGradient>
            </defs>
            ${chevron(795)}${chevron(806)}${chevron(817)}
            <text x="801" y="${(cy - 12).toFixed(1)}" font-size="9" fill="rgba(131,47,47,0.85)" text-anchor="middle">継続</text>
          `;
        }
      }
    }

    // ===== 残余利益方式の注意文言(選択中のみ、グラフ上部の空欄に赤字で表示) =====
    let rimCaution = '';
    if (selectedMetrics.some((k) => METRICS[k].base === 'rim')) {
      rimCaution = `<text x="${padL + 10}" y="${padT + 16}" font-size="10.5" fill="#9e2f2f" font-weight="700">※残余利益方式は国税庁で審議中の新方式の参考試算です（算式・率・年数は未確定）</text>
        <text x="${padL + 10}" y="${padT + 30}" font-size="9.5" fill="#9e2f2f">※退職金等の一時損失は平常時利益から除外して算定（簿価純資産の減少は反映。超過収益の増加で一部相殺され、支払額ほどは下がりません）</text>`;
    }

    // ===== 年齢・株価のデータテーブル(バーとX位置を揃えたExcel風の横並び表示) =====
    let ageMatrix = '';
    let extraH = 0;
    if (ageTableActive) {
      const rowH = 13;
      const topY = H - padB + 8; // 軸ラベルを省略したぶん、そのスペースから開始する
      const colCx = (i) => padL + i * slotWidth + slotWidth / 2;
      // 3桁に収まる単位を自動選択(万円→百万円→億円→百億円)。対象は選択中の指標
      let maxV = 0;
      series.forEach((p) => {
        activeFields.forEach((f) => { maxV = Math.max(maxV, Math.abs(p[f] * HF)); });
      });
      const UNITS = [[1, '万円'], [100, '百万円'], [10000, '億円'], [1000000, '百億円']];
      let unit = UNITS[UNITS.length - 1];
      for (let u = 0; u < UNITS.length; u++) {
        if (Math.round(maxV / UNITS[u][0]) <= 999) { unit = UNITS[u]; break; }
      }
      // 年齢は入力ページ「株主の状況」の年齢列から読む。
      // 「反映」チェックが入っている株主のうち、一番上の人の年齢で判定する
      let ageRaw = NaN;
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const holders = stored.ss_holders ? JSON.parse(stored.ss_holders) : [];
        for (let hi = 0; hi < holders.length; hi++) {
          if (!holderChecked(hi)) continue;
          ageRaw = parseFloat(String(holders[hi].age || '').replace(/,/g, ''));
          break;
        }
      } catch (e) {}
      if (isNaN(ageRaw) && ownerAgeDemo !== null) ageRaw = ownerAgeDemo;
      const hasAge = !isNaN(ageRaw) && ageRaw > 0;
      // 換算後の桁数に応じて小数を付け、常に約3桁の精度で表示する(億円なら 6.08 / 15.4 など)
      const miniMax = Math.round(maxV / unit[0]);
      const miniDp = miniMax < 10 ? 2 : (miniMax < 100 ? 1 : 0);
      const fmtMini = (n) => {
        if (isNaN(n)) return '';
        const a = Math.abs(n).toFixed(miniDp);
        return n < 0 ? '△' + a : a;
      };
      // 行定義: 経過年数(5年刻み) / 社長年齢 / 選択中の指標(上のタイルと連動・最大3つ)
      const matrixRows = [
        { label: '経過年数', color: '#9aa1ab', weight: 400, cell: (p, i) => (i % xStep === 0 ? yearLabel(i) : '') },
        { label: '年齢', color: '#4a5560', weight: 600, cell: (p, i) => (hasAge ? String(Math.round(ageRaw) + i) : '') },
      ];
      selectedMetrics.forEach((key) => {
        const m = METRICS[key];
        matrixRows.push({
          label: BASE_METRICS[m.base].replace('の評価', '') + '(' + m.scenario + ')',
          chip: m.color,
          color: '#1f2733',
          weight: 600,
          cell: (p) => fmtMini(p[m.field] * HF / unit[0]),
        });
      });
      let g = `<line x1="${padL}" y1="${topY}" x2="${W - padR}" y2="${topY}" stroke="#d7dce2" stroke-width="1"/>`;
      matrixRows.forEach((row, ri) => {
        const yTop = topY + ri * rowH;
        const yText = yTop + rowH - 3.5;
        if (ri >= 2) g += `<rect x="${padL}" y="${yTop}" width="${plotW}" height="${rowH}" fill="${ri % 2 === 0 ? '#f7f9fb' : '#ffffff'}"/>`;
        if (row.chip) g += `<rect x="3" y="${(yTop + (rowH - 6) / 2).toFixed(1)}" width="6" height="6" rx="1.5" fill="${row.chip}" fill-opacity="0.85" stroke="#2b323d" stroke-opacity="0.15"/>`;
        g += `<text x="${row.chip ? 12 : 12}" y="${yText}" font-size="7.5" fill="${row.color}" font-weight="${row.weight}" text-anchor="start">${row.label}</text>`;
        series.forEach((p, i) => {
          const t = row.cell(p, i);
          if (t === '') return;
          g += `<text x="${colCx(i).toFixed(1)}" y="${yText}" font-size="8" fill="${row.color}" text-anchor="middle"${ri >= 1 ? ' font-family="Arial"' : ''}>${t}</text>`;
        });
        g += `<line x1="${padL}" y1="${(yTop + rowH).toFixed(1)}" x2="${W - padR}" y2="${(yTop + rowH).toFixed(1)}" stroke="#eef1f4" stroke-width="0.8"/>`;
      });
      // 単位の凡例(左下)
      g += `<text x="${padL - 8}" y="${(topY + matrixRows.length * rowH + 11).toFixed(1)}" font-size="7.5" fill="#9aa1ab" text-anchor="end">(単位: ${unit[1]})</text>`;
      ageMatrix = `<g>${g}</g>`;
      extraH = matrixRows.length * rowH + 16 - (padB - 8);
    }
    svg.setAttribute('viewBox', `0 0 ${SVG_W} ${H + Math.max(0, extraH)}`);

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
      ${ageMatrix}
      ${rimCaution}
    `;

    chartLayout = { W, padL, plotW, slotWidth, count: series.length };
  }

  // 列ごとの色分け(タイル・ヘッダーと同じ配色。等間隔の列幅に合わせ、行のゼブラではなく列の色帯で識別する)
  const TABLE_COL_CLASSES = ['col-saizoku-a', 'col-houjin-a', 'col-ruiji-a', 'col-junsisan-a', 'col-rim-a', 'col-saizoku-b', 'col-houjin-b', 'col-ruiji-b', 'col-junsisan-b', 'col-rim-b'];
  function renderTable(series) {
    const body = document.getElementById('trendTableBody');
    let rows = '';
    const HF = holderFactor();
    series.forEach((p) => {
      const vals = [p.saizokuT_A, p.houjinT_A, p.ruijiT_A, p.junsisanT_A, p.rimT_A, p.saizokuT_B, p.houjinT_B, p.ruijiT_B, p.junsisanT_B, p.rimT_B].map((x) => x * HF);
      // 税引前利益がマイナス(赤字)の場合、推移が負値になり得るため、サイト共通の△+赤字表記に統一する
      const cells = vals.map((v, i) => {
        if (isNaN(v)) return `<td class="px-2 py-1.5 text-right text-gray-300 ${TABLE_COL_CLASSES[i]}${i === 5 ? ' border-l border-gray-200' : ''}">—</td>`;
        const negCls = v < 0 ? ' neg-val' : '';
        const numText = window.numFmt ? window.numFmt(Math.round(v)) : Math.round(v).toLocaleString('ja-JP');
        return `<td class="px-2 py-1.5 text-right ${TABLE_COL_CLASSES[i]}${i === 5 ? ' border-l border-gray-200' : ''}${negCls}">${numText}</td>`;
      }).join('');
      rows += `<tr class="border-b border-gray-100">
        <td class="px-2 py-1.5 text-center text-gray-700 border-r border-gray-200 bg-white">${yearLabel(p.year)}</td>
        ${cells}
      </tr>`;
    });
    body.innerHTML = rows;
  }

  // ===== 自社株評価・株主の状況(ディスカッションシートの自社株の観点と同じレイアウト) =====
  // 指定した年数後(dsYear、入力欄でリアルタイムに変更可能)の試算値を、対策後ボタン(dsShowAfter)で
  // シナリオA/Bに切り替えて表示する。(現時点=0年後はシナリオA・Bが同額になる仕様のため注意)
  const DS_EVAL_ROWS = [
    { key: 'saizoku', label: '相続税評価額' },
    { key: 'ruiji', label: '類似業種比準価額' },
    { key: 'junsisan', label: '純資産価額' },
    { key: 'houjin', label: '法人税法上評価額' },
  ];
  function renderDsTables() {
    const evalBody = document.getElementById('dsEvalBody');
    const holderBody = document.getElementById('dsHolderBody');
    if (!evalBody || !holderBody || !lastSeries || !currentValues) return;

    const yearIdx = Math.max(0, Math.min(lastSeries.length - 1, Math.round(dsYear)));
    const row = lastSeries[yearIdx];
    const scenario = dsShowAfter ? 'B' : 'A';
    const shares = currentValues.sharesOutstanding;

    let stored = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : {};
    } catch (e) {}
    const par = window.numClean ? window.numClean(stored.ss_parValue) : parseFloat(stored.ss_parValue);

    const HF = holderFactor();
    evalBody.innerHTML = DS_EVAL_ROWS.map((r) => {
      const rawTotal = row[`${r.key}T_${scenario}`];
      const totalMan = rawTotal * HF;
      const perShareYen = shares > 0 ? (rawTotal * 10000) / shares : NaN;
      const mult = (!isNaN(perShareYen) && par > 0) ? (perShareYen / par) : NaN;
      return `<tr class="border-b border-gray-100">
        <td class="px-3 py-2 text-left font-medium whitespace-nowrap">${r.label}</td>
        <td class="px-3 py-2 text-right${totalMan < 0 ? ' neg-val' : ''}">${man(totalMan)}</td>
        <td class="px-3 py-2 text-right">${isNaN(perShareYen) ? '-' : yen(perShareYen)}</td>
        <td class="px-3 py-2 text-right">${isNaN(mult) ? '-' : mult.toFixed(2) + ' 倍'}</td>
      </tr>`;
    }).join('');

    const perShareSaizoku = shares > 0 ? row[`saizokuT_${scenario}`] / shares : NaN; // 万円/株
    const perShareHoujin = shares > 0 ? row[`houjinT_${scenario}`] / shares : NaN;

    let holders = [];
    try {
      holders = stored.ss_holders ? JSON.parse(stored.ss_holders) : [];
    } catch (e) {}

    if (!holders.length) {
      holderBody.innerHTML = '<tr><td colspan="6" class="px-2 py-3 text-center text-gray-400 text-xs">株主情報が未入力です。入力ページの「STEP3 株主の状況」で株主を登録すると表示されます。</td></tr>';
      document.getElementById('dsTotShares').textContent = '-';
      document.getElementById('dsTotRatio').textContent = '-';
      document.getElementById('dsTotReka').textContent = '-';
      document.getElementById('dsTotHojin').textContent = '-';
      return;
    }

    let sumEff = 0, sumRatio = 0, totReka = 0, totHojin = 0;
    holderBody.innerHTML = holders.map((h, hIdx) => {
      const hShares = window.numClean ? window.numClean(h.shares) : parseFloat(h.shares);
      const hRatio = window.numClean ? window.numClean(h.ratio) : parseFloat(h.ratio);
      const eff = !isNaN(hShares) ? hShares : ((!isNaN(hRatio) && shares > 0) ? (hRatio / 100) * shares : NaN);
      const reka = (!isNaN(eff) && !isNaN(perShareSaizoku)) ? eff * perShareSaizoku : NaN;
      const hojin = (!isNaN(eff) && !isNaN(perShareHoujin)) ? eff * perShareHoujin : NaN;
      const ratioVal = !isNaN(hRatio) ? hRatio : ((!isNaN(hShares) && shares > 0) ? (hShares / shares) * 100 : NaN);
      const on = holderChecked(hIdx);
      const counted = selHoldersMode ? on : true;
      if (counted) {
        if (!isNaN(eff)) sumEff += eff;
        if (!isNaN(reka)) totReka += reka;
        if (!isNaN(hojin)) totHojin += hojin;
        if (!isNaN(ratioVal)) sumRatio += ratioVal;
      }
      return `<tr class="border-b border-gray-100${selHoldersMode && !on ? ' opacity-40' : ''}">
        <td class="px-2 py-2 text-center"><input type="checkbox" class="ds-holder-check" data-idx="${hIdx}"${on ? ' checked' : ''} /></td>
        <td class="px-2 py-2 text-left">${h.name || '(未入力)'}</td>
        <td class="px-2 py-2 text-right">${isNaN(eff) ? '-' : (window.numFmt ? window.numFmt(Math.round(eff)) : Math.round(eff).toLocaleString('ja-JP'))}</td>
        <td class="px-2 py-2 text-right">${isNaN(ratioVal) ? '-' : ratioVal.toFixed(2) + '%'}</td>
        <td class="px-2 py-2 text-right${reka < 0 ? ' neg-val' : ''}">${isNaN(reka) ? '-' : man(reka)}</td>
        <td class="px-2 py-2 text-right${hojin < 0 ? ' neg-val' : ''}">${isNaN(hojin) ? '-' : man(hojin)}</td>
      </tr>`;
    }).join('');
    document.getElementById('dsTotShares').textContent = sumEff ? (window.numFmt ? window.numFmt(Math.round(sumEff)) : Math.round(sumEff).toLocaleString('ja-JP')) : '-';
    document.getElementById('dsTotRatio').textContent = sumRatio ? sumRatio.toFixed(2) + '%' : '-';
    document.getElementById('dsTotReka').textContent = totReka ? man(totReka) : '-';
    document.getElementById('dsTotHojin').textContent = totHojin ? man(totHojin) : '-';
  }

  function updateCurrentValues(series) {
    const p0 = series[0];
    const HF = holderFactor();
    Object.keys(BASE_METRICS).forEach((base) => {
      const elA = document.getElementById(`cv_${base}_A`);
      const elB = document.getElementById(`cv_${base}_B`);
      if (elA) elA.innerHTML = isNaN(p0[`${base}T_A`]) ? '<span class="text-xs text-gray-400">未入力</span>' : manTile(p0[`${base}T_A`] * HF);
      if (elB) elB.innerHTML = isNaN(p0[`${base}T_B`]) ? '<span class="text-xs text-gray-400">未入力</span>' : manTile(p0[`${base}T_B`] * HF);
    });
  }

  // 各入力欄の単位(未入力時にグレーで「0 単位」と見せるためのplaceholder用)
  const UNIT_MAP = {
    corpTaxRateProj: '%', annualProfit: '万円', annualProfitB: '万円', annualDividend: '万円',
    retirementYear: '年目', retirementAmount: '万円', specialLossYear: '年目', specialLossAmount: '万円',
    mvNetAssets: '万円', realOpProfit: '万円',
    rim0_book: '万円', rim0_profit: '万円', rimProfitB: '万円',
    insuranceAmount: '万円', insuranceGrowthRate: '%', coveragePeriod: '年', premiumAmount: '万円', deductibleRatio: '%',
  };
  function populateLivePanel(v, usedDefaults) {
    PROJECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      // RIMの2欄は自動入力エリア: 入力ページの値があればそれを表示し、
      // 無ければグレーの「自動計算：万円」で示す(入力例は出さない)。手入力モード中はそのまま
      if ((id === 'rim0_book' || id === 'rim0_profit') && !manualRimMode) {
        let rawStored;
        try {
          const o = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
          rawStored = o[id];
        } catch (e) {}
        const n = parseFloat(String(rawStored === undefined ? '' : rawStored).replace(/,/g, ''));
        el.value = isNaN(n) ? '' : v[id];
        el.placeholder = '自動計算：万円';
        return;
      }
      if (usedDefaults) {
        el.value = '';
        if (id === 'annualProfitB' && !manualBMode) {
          // 自動入力エリアはデフォルト時グレーで「自動計算：単位」と示す(全体ルール)
          el.placeholder = '自動計算：万円';
          return;
        }
        if (IS_TRIAL) {
          // テスト版はサンプルを見せず、クリア状態(グレーの0＋単位)にする
          el.placeholder = '0 ' + (UNIT_MAP[id] || '');
          return;
        }
        // サンプル既定値は黒字の実値として入れず、グレーの「入力例：」placeholderで示す
        // (計算はloadValuesのフォールバックで既定値が使われる)。全体ルール(2026-07-28)
        const ex = id === 'insuranceGrowthRate' ? Number(DEFAULTS[id] || 0).toFixed(2)
          : (window.numFmt ? window.numFmt(DEFAULTS[id]) : DEFAULTS[id]);
        el.placeholder = '入力例：' + ex + ' ' + (UNIT_MAP[id] || '');
        return;
      }
      // 死亡保険金額上昇率は0でも「0.00」と表示し、小数点2位まで揃える
      el.value = id === 'insuranceGrowthRate' ? Number(v[id] || 0).toFixed(2) : v[id];
      el.placeholder = '0 ' + (UNIT_MAP[id] || '');
    });
  }

  // 【変更後】税引前利益は自動入力エリア(手入力ON時のみ編集可)。
  // 「保険料を変更後利益に反映」と「手入力」は排他で、片方をONにするともう片方は自動的にOFFになる
  function applyProfitBState() {
    const el = document.getElementById('annualProfitB');
    if (el) {
      // 金庫株の「法人の現金」と同じ作法: 自動時はreadonly+グレー地、手入力時のみ編集可
      el.readOnly = !manualBMode;
      el.classList.toggle('bg-gray-50', !manualBMode);
    }
    const mb = document.getElementById('manualProfitBBtn');
    if (mb) mb.textContent = manualBMode ? '自動計算に戻す' : '手入力する';
    const ab = document.getElementById('autoPremiumBBtn');
    if (ab) ab.classList.toggle('is-on', autoPremiumToB);
  }
  // 【変更後】税引前利益の自動値:
  //   反映OFF(既定) = 【現状】税引前利益と同じ数字
  //   反映ON       = 【現状】税引前利益 − 保険料 × 損金割合
  // 手入力モードのときだけ自動計算せず、入力値をそのまま使う
  function syncAutoProfitB() {
    if (manualBMode || !currentValues) return;
    const el = document.getElementById('annualProfitB');
    const base = currentValues.annualProfit || 0;
    const auto = autoPremiumToB
      ? base - (currentValues.premiumAmount || 0) * (currentValues.deductibleRatio || 0) / 100
      : base;
    currentValues.annualProfitB = auto;
    if (!el) return;
    // 【現状】税引前利益が未入力(デフォルト表示)の間は、自動値も黒字にせず
    // グレーの「自動計算：万円」で自動入力エリアであることを示す(全体ルール)
    const aEl = document.getElementById('annualProfit');
    if (aEl && aEl.value === '') {
      el.value = '';
      el.placeholder = '自動計算：万円';
      return;
    }
    // 共通ルール: 数字は必ずカンマ区切りで表示する
    el.value = window.numFmt ? window.numFmt(Math.round(auto)) : String(Math.round(auto));
  }

  function persistCurrentValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      const merged = Object.assign({}, existing, { companySize: currentValues.companySize });
      PROJECTION_IDS.forEach((id) => { merged[id] = String(currentValues[id]); });
      // 手入力・自動反映の各モードも保存する(リロードで手入力値が自動値に戻るのを防ぐ)
      merged.ss_manualB = manualBMode ? '1' : '0';
      merged.ss_autoPremB = autoPremiumToB ? '1' : '0';
      merged.ss_manualRim = manualRimMode ? '1' : '0';
      merged.ss_manualRimB = manualRimBMode ? '1' : '0';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      // localStorage不可の環境では保存をスキップ(表示上の計算には影響しない)
    }
  }

  // 【変更後】RIM税引後純利益(自動計算・表示専用): シナリオBのRIMに使う平常時利益
  // = RIM税引後純利益 + (【変更後】税引前利益 − 【現状】税引前利益) × (1 − 法人税率)
  function syncRimProfitBDisplay() {
    const el = document.getElementById('rimProfitB');
    if (!el || !currentValues) return;
    el.readOnly = !manualRimBMode;
    el.classList.toggle('bg-gray-50', !manualRimBMode);
    const btn = document.getElementById('manualRimBBtn');
    if (btn) btn.textContent = manualRimBMode ? '自動計算に戻す' : '手入力する';
    if (manualRimBMode) return; // 手入力中は自動値で上書きしない
    const base = currentValues.rim0_profit;
    const delta = (currentValues.annualProfitB - currentValues.annualProfit) * (1 - (currentValues.corpTaxRateProj || 0) / 100);
    const v = base + delta;
    if (isNaN(v)) {
      el.value = '';
      el.placeholder = '自動計算：万円';
      return;
    }
    el.value = Math.round(v);
    currentValues.rimProfitB = Math.round(v);
    if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
  }
  const manualRimBBtn = document.getElementById('manualRimBBtn');
  if (manualRimBBtn) {
    manualRimBBtn.addEventListener('click', function () {
      manualRimBMode = !manualRimBMode;
      syncRimProfitBDisplay();
      persistCurrentValues();
      recomputeSeriesOnly();
      if (manualRimBMode) {
        const el = document.getElementById('rimProfitB');
        if (el) { try { el.focus({ preventScroll: true }); el.select(); } catch (e) {} }
      }
    });
  }

  // 保存されていた手入力・自動反映モードを復元する(syncAutoProfitBが手入力値を潰す前に読む)
  (function restoreManualModes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const o = raw ? JSON.parse(raw) : null;
      if (!o) return;
      manualBMode = o.ss_manualB === '1';
      autoPremiumToB = o.ss_autoPremB === '1';
      manualRimMode = o.ss_manualRim === '1';
      manualRimBMode = o.ss_manualRimB === '1';
    } catch (e) {}
  })();

  function refreshAll() {
    const { v, usedDefaults } = loadValues();
    const defaultNotice = document.getElementById('defaultNotice');
    if (defaultNotice) defaultNotice.classList.toggle('hidden', !usedDefaults);

    currentValues = v;
    populateLivePanel(v, usedDefaults);
    applyProfitBState();
    syncAutoProfitB();

    const year0 = computeYear0(v);
    const result = computeSeries(v, year0);
    lastSeries = result.series;
    lastYear0 = year0;
    updateCurrentValues(lastSeries);
    drawChart(lastSeries, result.retirementYear);
    renderTileSelection();
    renderTable(lastSeries);
    renderDsTables();
    syncRimProfitBDisplay();
  }

  // ===== リアルタイム調整パネル: 変更すると即座にグラフ・表を再計算 =====
  function recomputeSeriesOnly() {
    if (!lastYear0 || !currentValues) return;
    const result = computeSeries(currentValues, lastYear0);
    lastSeries = result.series;
    updateCurrentValues(lastSeries);
    drawChart(lastSeries, result.retirementYear);
    renderTable(lastSeries);
    renderDsTables();
    syncRimProfitBDisplay();
  }

  if (livePanel) {
    let liveTimer = null;
    livePanel.addEventListener('change', function (e) {
      const id = e.target && e.target.id;
      if (!id || !PROJECTION_IDS.includes(id)) return;
      // 空欄は0として扱う(データクリアで空にしたときもグラフ・表が入力どおりになる)。
      // ただし法人税率だけは空欄=デフォルト(30%)に戻す(0%だと試算が実態から離れすぎるため)
      const raw = (e.target.value || '').replace(/,/g, '').trim();
      if (id === 'corpTaxRateProj' && raw === '') {
        currentValues[id] = DEFAULTS.corpTaxRateProj;
        e.target.value = String(DEFAULTS.corpTaxRateProj);
      } else {
        const parsed = raw === '' ? 0 : parseFloat(raw);
        currentValues[id] = isNaN(parsed) ? currentValues[id] : parsed;
        if (raw === '') {
          // 全体ルール: クリア後の欄は空のまま、グレーで「0＋単位」を見せる
          e.target.placeholder = '0 ' + (UNIT_MAP[id] || '');
        }
      }
      if (!manualBMode && (id === 'annualProfit' || id === 'premiumAmount' || id === 'deductibleRatio')) {
        syncAutoProfitB();
      }
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        persistCurrentValues();
        recomputeSeriesOnly();
      }, 150);
    });
    // 死亡保険金額上昇率は入力を終えたら小数点2位まで(0でも「0.00」)に整形し直す
    livePanel.addEventListener('blur', function (e) {
      if (e.target && e.target.id === 'insuranceGrowthRate') {
        e.target.value = Number(currentValues.insuranceGrowthRate || 0).toFixed(2);
      }
    }, true);
  }

  // ===== 評価額タイルのクリックで表示指標を切り替え(最大3つ) =====
  if (metricTilesEl) {
    metricTilesEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.metric-tile');
      if (!btn) return;
      const key = btn.dataset.metric;
      const idx = selectedMetrics.indexOf(key);
      if (idx >= 0) {
        if (selectedMetrics.length > 1) selectedMetrics.splice(idx, 1);
      } else {
        if (selectedMetrics.length >= 3) selectedMetrics.shift();
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
    insuranceToggleBtn.classList.toggle('is-on', showInsurance);
    insuranceToggleBtn.addEventListener('click', function () {
      showInsurance = !showInsurance;
      insuranceToggleBtn.classList.toggle('is-on', showInsurance);
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
      }
    });
  }

  // ===== 死亡保険金額の税引後(法人税控除後)表示トグル =====
  // ===== グラフ・推移表の表示期間(30/40/50/60年)プルダウン =====
  const horizonSelect = document.getElementById('horizonSelect');
  function applyHorizonLabel() {
    const el = document.getElementById('tblHorizonLabel');
    if (el) el.textContent = String(horizonYears);
  }
  // 年齢・株価表は30年表示のときだけ使える(40〜60年では列が細くなりすぎるため)
  function applyAgeTableAvailability() {
    const btn = document.getElementById('ageTableBtn');
    if (!btn) return;
    const ok = horizonYears <= 30;
    btn.disabled = !ok;
    btn.title = ok ? '' : '年齢・株価表は30年表示のときのみ使えます';
    if (!ok && showAgeTable) {
      showAgeTable = false;
      btn.classList.remove('is-on');
    }
  }
  if (horizonSelect) {
    horizonSelect.addEventListener('change', function () {
      const v = parseInt(horizonSelect.value, 10);
      horizonYears = (v === 40 || v === 50 || v === 60) ? v : 30;
      if (dsYear > horizonYears) {
        dsYear = horizonYears;
        if (dsYearInput) dsYearInput.value = String(horizonYears);
      }
      applyHorizonLabel();
      applyAgeTableAvailability();
      refreshAll();
    });
  }
  applyHorizonLabel();
  applyAgeTableAvailability();

  // ===== 基本情報を反映: 基本情報入力(決算書情報)の直前期データを試算条件へ =====
  const applyBasicInfoBtn = document.getElementById('applyBasicInfoBtn');
  if (applyBasicInfoBtn && !applyBasicInfoBtn.disabled) {
    applyBasicInfoBtn.addEventListener('click', function () {
      const msgEl = document.getElementById('applyBasicInfoMsg');
      const showMsg = function (text) {
        if (!msgEl) return;
        msgEl.textContent = text;
        msgEl.classList.remove('hidden');
        clearTimeout(msgEl._t);
        msgEl._t = setTimeout(function () { msgEl.classList.add('hidden'); }, 4000);
      };
      let fs = null;
      try {
        const raw = localStorage.getItem('bpl_financial_statements_v1');
        fs = raw ? JSON.parse(raw) : null;
      } catch (e) {}
      const yenVal = fs ? (window.numClean ? window.numClean(fs.pl_incomeBeforeTax_1) : parseFloat(fs.pl_incomeBeforeTax_1)) : NaN;
      if (isNaN(yenVal)) {
        showMsg('基本情報入力(決算書情報)が未入力です');
        return;
      }
      const man10 = Math.round(yenVal / 10000);
      currentValues.annualProfit = man10;
      const el = document.getElementById('annualProfit');
      if (el) el.value = window.numFmt ? window.numFmt(man10) : String(man10);
      syncAutoProfitB();
      persistCurrentValues();
      recomputeSeriesOnly();
      // 反映できたことが分かるよう、ランプを一瞬点灯させる
      applyBasicInfoBtn.classList.add('is-on');
      setTimeout(function () { applyBasicInfoBtn.classList.remove('is-on'); }, 900);
    });
  }

  // ===== 【変更後】税引前利益のモード切替(既定はどちらもOFF=自動入力エリアで固定表示) =====
  const autoPremiumBBtn = document.getElementById('autoPremiumBBtn');
  if (autoPremiumBBtn) {
    autoPremiumBBtn.addEventListener('click', function () {
      autoPremiumToB = !autoPremiumToB;
      if (autoPremiumToB) manualBMode = false; // 排他: 反映ONで手入力は自動OFF
      applyProfitBState();
      syncAutoProfitB();
      persistCurrentValues();
      recomputeSeriesOnly();
    });
  }
  // ===== 残余利益方式の簿価純資産・税引後純利益: 自動(入力ページから)/手入力の切替 =====
  function applyRimInputState() {
    ['rim0_book', 'rim0_profit'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.readOnly = !manualRimMode;
      el.classList.toggle('bg-gray-50', !manualRimMode);
    });
    ['manualRimBtn', 'manualRimBtn2'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = manualRimMode ? '自動に戻す' : '手入力する';
    });
  }
  function onManualRimToggle(focusId) {
      manualRimMode = !manualRimMode;
      applyRimInputState();
      persistCurrentValues();
      if (manualRimMode) {
        const el = document.getElementById(focusId);
        if (el) { try { el.focus({ preventScroll: true }); el.select(); } catch (e) {} }
      } else {
        // 自動に戻す: 入力ページの円単位の値を正本として復元する
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const o = raw ? JSON.parse(raw) : null;
          if (o) {
            const yen2man = (v) => {
              const n = window.numClean ? window.numClean(v) : parseFloat(String(v || '').replace(/,/g, ''));
              return isNaN(n) ? '' : String(n / 10000);
            };
            if (o.ssRimBook !== undefined) o.rim0_book = yen2man(o.ssRimBook);
            if (o.ssRimProfit !== undefined) o.rim0_profit = yen2man(o.ssRimProfit);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
          }
        } catch (e) {}
        refreshAll();
      }
  }
  const manualRimBtn = document.getElementById('manualRimBtn');
  const manualRimBtn2 = document.getElementById('manualRimBtn2');
  if (manualRimBtn || manualRimBtn2) {
    applyRimInputState();
    if (manualRimBtn) manualRimBtn.addEventListener('click', function () { onManualRimToggle('rim0_book'); });
    if (manualRimBtn2) manualRimBtn2.addEventListener('click', function () { onManualRimToggle('rim0_profit'); });
  }

  const manualProfitBBtn = document.getElementById('manualProfitBBtn');
  if (manualProfitBBtn) {
    manualProfitBBtn.addEventListener('click', function () {
      manualBMode = !manualBMode;
      if (manualBMode) autoPremiumToB = false; // 排他: 手入力ONで保険料の反映は自動OFF
      applyProfitBState();
      syncAutoProfitB();
      const el = document.getElementById('annualProfitB');
      if (manualBMode && el) {
        try { el.focus({ preventScroll: true }); el.select(); } catch (e) {}
      }
      persistCurrentValues();
      recomputeSeriesOnly();
    });
  }

  const insuranceNetToggleBtn = document.getElementById('insuranceNetToggleBtn');
  if (insuranceNetToggleBtn) {
    insuranceNetToggleBtn.classList.toggle('is-on', showInsuranceNet);
    insuranceNetToggleBtn.addEventListener('click', function () {
      showInsuranceNet = !showInsuranceNet;
      insuranceNetToggleBtn.classList.toggle('is-on', showInsuranceNet);
      if (lastSeries) {
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
      }
    });
  }

  // ===== 自社株評価・株主の状況テーブルの対策後(シナリオB)表示トグル =====
  const dsScenarioToggleBtn = document.getElementById('dsScenarioToggleBtn');
  if (dsScenarioToggleBtn) {
    dsScenarioToggleBtn.addEventListener('click', function () {
      dsShowAfter = !dsShowAfter;
      dsScenarioToggleBtn.classList.toggle('is-on', dsShowAfter);
      renderDsTables();
    });
  }

  // ===== 自社株評価・株主の状況テーブルの表示年数(リアルタイム反映) =====
  // 0〜表示期間(horizonYears)の範囲外が入力された場合はエラーを表示し、表示期間の年数に戻す。
  const dsYearInput = document.getElementById('dsYearInput');
  const dsYearError = document.getElementById('dsYearError');
  if (dsYearInput) {
    dsYearInput.addEventListener('change', function () {
      const parsed = parseFloat(dsYearInput.value);
      if (isNaN(parsed) || parsed < 0 || parsed > horizonYears) {
        if (dsYearError) dsYearError.classList.remove('hidden');
        dsYear = horizonYears;
        dsYearInput.value = String(horizonYears);
        renderDsTables();
        return;
      }
      if (dsYearError) dsYearError.classList.add('hidden');
      dsYear = parsed;
      renderDsTables();
    });
  }

  // ===== 退職金マーカーの表示トグル =====
  const retirementToggleBtn = document.getElementById('retirementToggleBtn');
  if (retirementToggleBtn) {
    retirementToggleBtn.classList.toggle('is-on', showRetirement);
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
    specialLossToggleBtn.classList.toggle('is-on', showSpecialLoss);
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
      return `<div class="flex justify-between gap-4"><span class="flex items-center gap-1.5 ${isSel ? 'font-bold' : 'text-gray-500'}"><span class="inline-block w-2 h-2 rounded-full" style="background:${m.color}"></span>${m.label}</span><span class="${isSel ? 'font-bold' : ''}">${Math.round(p[m.field] * holderFactor()).toLocaleString('ja-JP')}</span></div>`;
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

  // ===== 年齢・株価表(グラフ下データテーブル)のトグル =====
  (function initAgeTable() {
    const btn = document.getElementById('ageTableBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      showAgeTable = !showAgeTable;
      btn.classList.toggle('is-on', showAgeTable);
      recomputeSeriesOnly();
    });
    // レイアウト確認用: ?agetable=1 で自動的に開き、年齢60・指標2つの状態を再現(スクリーンショット用)
    if (/[?&]agetable=1/.test(location.search)) {
      ownerAgeDemo = 60;
      setTimeout(function () {
        btn.click();
        const tile2 = document.querySelector('.metric-tile[data-metric="' + (/[?&]demorim=1/.test(location.search) ? 'rim_A' : 'houjin_A') + '"]');
        if (tile2) tile2.click();
        if (/[?&]demo3=1/.test(location.search)) {
          const tile3 = document.querySelector('.metric-tile[data-metric="houjin_A"]');
          if (tile3) tile3.click();
        }
      }, 600);
    }
  })();

  // ===== PDF出力 =====
  function doPrint() {
    if (!lastSeries) return;
    const now = new Date();
    document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    document.getElementById('pSize').textContent = lastYear0.sizeLabel;

    const roundMan = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));

    // 推移表(印刷用)
    let rows = '';
    lastSeries.forEach((p) => {
      const cell = (v) => `<td>${isNaN(v) ? '—' : roundMan(v)}</td>`;
      rows += `<tr><td class="lbl">${yearLabel(p.year)}</td>
        ${cell(p.saizokuT_A)}${cell(p.houjinT_A)}${cell(p.ruijiT_A)}${cell(p.junsisanT_A)}${cell(p.rimT_A)}
        ${cell(p.saizokuT_B)}${cell(p.houjinT_B)}${cell(p.ruijiT_B)}${cell(p.junsisanT_B)}${cell(p.rimT_B)}</tr>`;
    });
    document.getElementById('pTrendTableBody').innerHTML = rows;

    // 印刷用の凡例(現在選択中の指標)
    renderLegend(document.getElementById('pChartLegend'));

    // 1枚目: グラフと年齢・株価表を見たままのPNGにして大きく貼る。
    // 画面で表がOFFでも、印刷時は自動でONにして撮影し、撮影後に元へ戻す(30年表示のときのみ)
    const slot = document.getElementById('pChartSlot');
    slot.innerHTML = '';
    const wasAgeTable = showAgeTable;
    const forceAgeTable = !showAgeTable && horizonYears <= 30;
    if (forceAgeTable) {
      showAgeTable = true;
      const { v } = loadValues();
      drawChart(lastSeries, v.retirementYear);
    }
    const restoreChart = () => {
      if (forceAgeTable) {
        showAgeTable = wasAgeTable;
        const { v } = loadValues();
        drawChart(lastSeries, v.retirementYear);
      }
    };
    const chart = document.getElementById('trendChart');
    const chartSvg = chart && (chart.tagName.toLowerCase() === 'svg' ? chart : chart.querySelector('svg'));
    if (chartSvg && window.bplChartToImage) {
      window.bplChartToImage(chartSvg, slot, function () { restoreChart(); window.print(); });
    } else {
      restoreChart();
      window.print();
    }
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

  // ===== 「選択した株主のみ」モードのUI =====
  loadHolderSel();
  const selHoldersBtn = document.getElementById('selHoldersBtn');
  if (selHoldersBtn) {
    selHoldersBtn.classList.toggle('is-on', selHoldersMode);
    selHoldersBtn.addEventListener('click', function () {
      selHoldersMode = !selHoldersMode;
      selHoldersBtn.classList.toggle('is-on', selHoldersMode);
      persistHolderSel();
      if (lastSeries) recomputeSeriesOnly(); else refreshAll();
    });
  }
  const dsHolderBodyEl = document.getElementById('dsHolderBody');
  if (dsHolderBodyEl) {
    dsHolderBodyEl.addEventListener('change', function (e) {
      const cb = e.target && e.target.closest ? e.target.closest('.ds-holder-check') : null;
      if (!cb) return;
      if (!holderSel) holderSel = [];
      holderSel[parseInt(cb.dataset.idx, 10)] = cb.checked;
      persistHolderSel();
      if (lastSeries) recomputeSeriesOnly(); else refreshAll();
    });
  }

  // ===== 初期表示: 入力ページの保存値(またはサンプル値)で自動試算 =====
  refreshAll();
});

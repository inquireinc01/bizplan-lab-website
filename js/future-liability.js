document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('futureLiabForm');
  if (!form) return;

  const resultArea = document.getElementById('flResultArea');
  const errorArea = document.getElementById('flErrorArea');
  let lastResult = null;

  // ===== ?ツールチップ(タップで開閉、他をタップすると閉じる) =====
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

  // ===== グラフの「内訳を表示」トグル(初期値はひとまとめ表示) =====
  let detailMode = false;
  const bsDetailToggle = document.getElementById('bsDetailToggle');
  if (bsDetailToggle) {
    bsDetailToggle.addEventListener('click', function () {
      detailMode = !detailMode;
      bsDetailToggle.classList.toggle('is-on', detailMode);
      bsDetailToggle.setAttribute('aria-pressed', String(detailMode));
      recompute();
    });
  }

  // ===== グラフの「予測BSを表示」トグル(初期値は表示ON) =====
  let showPredicted = true;
  const showPredictedToggle = document.getElementById('showPredictedToggle');
  if (showPredictedToggle) {
    showPredictedToggle.addEventListener('click', function () {
      showPredicted = !showPredicted;
      showPredictedToggle.classList.toggle('is-on', showPredicted);
      showPredictedToggle.setAttribute('aria-pressed', String(showPredicted));
      recompute();
    });
  }

  // ===== 予測BSの「生命保険金あり/なし」トグル(初期値はなし=簿外負債全額がBSに影響する従来の見え方) =====
  let withInsurance = false;
  const insuranceToggle = document.getElementById('insuranceToggle');
  if (insuranceToggle) {
    insuranceToggle.addEventListener('click', function () {
      withInsurance = !withInsurance;
      insuranceToggle.classList.toggle('is-on', withInsurance);
      insuranceToggle.setAttribute('aria-pressed', String(withInsurance));
      insuranceToggle.querySelector('.toggle-label').textContent = withInsurance ? '生命保険金あり' : '生命保険金なし';
      recompute();
    });
  }

  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat((el.value || '').replace(/,/g, ''));
    return { value: v, el };
  };

  const man = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + '万円';

  const showError = (msg) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
  };

  // ===== 入力内容のブラウザ内保存(サーバーには送信しない。ファイル保存/読込・入力データクリアの対象) =====
  const STORAGE_KEY = 'bpl_future_liability_v1';
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      form.querySelectorAll('input[id]').forEach(function (el) {
        if (el.id === 'shortfall') return; // 不足分は自動計算値のため保存・復元の対象外
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    form.querySelectorAll('input[id]').forEach(function (el) {
      if (el.id === 'shortfall') return; // 不足分は自動計算値のため保存・復元の対象外
      if (el.value !== '') data[el.id] = el.value;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  const BS_CHECK_IDS = ['curAssets', 'fixedAssets', 'otherAssets', 'curLiab', 'fixedLiab', 'netAssets'];
  const FUTURE_LIAB_IDS = ['retirement', 'succession', 'otherFuture'];

  const ASSET_IDS = ['curAssets', 'fixedAssets', 'otherAssets'];
  const LIAB_IDS = ['curLiab', 'fixedLiab', 'netAssets'];

  // カード(資産/負債・純資産)の枠を薄い赤にする/戻す共通処理
  function setCardMismatch(id, mismatched) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('border-red-300', mismatched);
    el.classList.toggle('bg-red-50', mismatched);
    el.classList.toggle('border-gray-200', !mismatched);
  }

  function updateBalanceCheck() {
    const v = {};
    for (const id of BS_CHECK_IDS) v[id] = num(id).value;

    const assetsFilled = ASSET_IDS.some((id) => !isNaN(v[id]));
    const liabFilled = LIAB_IDS.some((id) => !isNaN(v[id]));
    const totalAssets = (v.curAssets || 0) + (v.fixedAssets || 0) + (v.otherAssets || 0);
    const totalLiabNet = (v.curLiab || 0) + (v.fixedLiab || 0) + (v.netAssets || 0);

    // 未入力(そのカードに何も入力されていない)のときは金額を表示せず「-」のままにする
    document.getElementById('checkTotalAssets').textContent = assetsFilled ? man(totalAssets) : '-';
    document.getElementById('checkTotalLiabNet').textContent = liabFilled ? man(totalLiabNet) : '-';

    // 6項目すべて入力済みで、かつ左右が一致しないときだけ両カードを薄い赤で警告する
    const allFilled = BS_CHECK_IDS.every((id) => !isNaN(v[id]));
    const mismatched = allFilled && Math.abs(totalAssets - totalLiabNet) > 0.5;
    setCardMismatch('assetsCard', mismatched);
    setCardMismatch('liabCard', mismatched);
  }

  function futureLiabTotalNow() {
    return FUTURE_LIAB_IDS.reduce((s, id) => {
      const v = num(id).value;
      return s + (isNaN(v) ? 0 : v);
    }, 0);
  }

  function updateFutureLiabTotal() {
    const anyFilled = FUTURE_LIAB_IDS.some((id) => !isNaN(num(id).value));
    document.getElementById('checkFutureLiabTotal').textContent = anyFilled ? man(futureLiabTotalNow()) : '-';
  }

  // ===== 簿外資産(将来負債の備え): 生命保険金+その他で足りない分を「不足分」に自動で入れ、
  // 3項目の合計(簿外負債合計)が将来負債合計と一致するようにする =====
  const OFF_BALANCE_ASSET_IDS = ['lifeInsurance', 'otherCoverage'];
  function updateOffBalanceAsset() {
    const lifeIns = num('lifeInsurance').value;
    const otherCov = num('otherCoverage').value;
    const covered = (isNaN(lifeIns) ? 0 : lifeIns) + (isNaN(otherCov) ? 0 : otherCov);
    const futureLiabTotal = futureLiabTotalNow();
    const shortfall = Math.max(0, futureLiabTotal - covered);

    const anyFutureFilled = FUTURE_LIAB_IDS.some((id) => !isNaN(num(id).value));
    const anyCoverageFilled = !isNaN(lifeIns) || !isNaN(otherCov);
    const anyFilled = anyFutureFilled || anyCoverageFilled;

    document.getElementById('shortfall').value = anyFilled ? shortfall : '';
    document.getElementById('checkOffBalanceTotal').textContent = anyFilled ? man(covered + shortfall) : '-';
  }

  BS_CHECK_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateBalanceCheck);
  });
  FUTURE_LIAB_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', function () {
      updateFutureLiabTotal();
      updateOffBalanceAsset(); // 将来負債合計が変わると不足分も連動して変わる
    });
  });
  OFF_BALANCE_ASSET_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateOffBalanceAsset);
  });
  updateBalanceCheck();
  updateFutureLiabTotal();
  updateOffBalanceAsset();

  // グラフは値が変わった時になめらかにアニメーションするよう、rect/text要素を
  // 毎回作り直さず既存要素のy/height/textContentだけを更新する
  // (CSSの transition で余韻を持たせる。style.cssの#bsChart rect参照)。
  // 未入力(NaN)の項目があるときは、エラーにせず全要素同じ高さのダミーBSを表示し、
  // 実数値が揃うとアニメーションしながら正確な比率に切り替わる。
  const W = 700;
  const yBottom = 300;
  const yTop = 30;
  const plotH = yBottom - yTop;
  // 純資産等がマイナス(債務超過)になった場合、基準線(yBottom)から下向きに積む専用の帯。
  // 債務超過が無いときはこの帯を確保せず、グラフ下の余白が出ないようにする(updateLayoutで動的に切替)。
  const NEG_ZONE_H = 90;
  const barWidth = 78;
  const groupGap = 46;
  const pairGap = 16;
  // 6本のバー(barWidth×6 + pairGap×3 + groupGap×2)がW(700)の中央に来るよう左端を計算する
  const totalBarsWidth = barWidth * 6 + pairGap * 3 + groupGap * 2;
  const xAsset1 = (W - totalBarsWidth) / 2;
  const xLiab1 = xAsset1 + barWidth + pairGap;
  const xAsset2 = xLiab1 + barWidth + groupGap;
  const xLiab2 = xAsset2 + barWidth + pairGap;
  const xAsset3 = xLiab2 + barWidth + groupGap;
  const xLiab3 = xAsset3 + barWidth + pairGap;
  const arrowX = xLiab2 + barWidth + groupGap / 2;
  const DUMMY_VALUE = 25; // ダミー表示用の共通仮値(万円換算は意味を持たない)

  function segColor(label) {
    const map = {
      // 資産3項目はネイビー1色を透過率違いで表現する(その他資産0%/固定資産25%/流動資産50%)
      '流動資産': '#0f2a4a', '固定資産': '#0f2a4a', 'その他資産': '#0f2a4a',
      // 負債2項目もひとまとめ表示と同じオレンジ1色を透過率違いで表現する(固定負債0%/流動負債50%)
      '流動負債': '#a5703a', '固定負債': '#a5703a',
      '純資産': '#3d6b8a', // ひとまとめ表示と同じ色
    };
    return map[label] || '#5c636e';
  }
  function segOpacity(label) {
    const map = { '流動資産': 0.5, '固定資産': 0.75, 'その他資産': 1, '流動負債': 0.5, '固定負債': 1 };
    return map[label] != null ? map[label] : 1;
  }
  // 内訳を表示しない「ひとまとめ」表示専用の配色: 資産=ネイビー、負債=落ち着いたオレンジ、純資産=落ち着いた青(透過なし)
  const GROUP_ASSET_FILL = '#0f2a4a';
  const GROUP_LIAB_FILL = '#a5703a';
  const GROUP_NETASSETS_FILL = '#3d6b8a';
  const GROUP_FILL_OPACITY = 1;
  const GROUP_TEXT_FILL = '#fff'; // 濃色の実色背景のため、文字は白で統一する
  // 簿外セグメント: 資産側(準備必要額)は淡いグリーン、負債側(将来負債)は既存の赤系のまま
  function offBalanceStyle(assetSide) {
    return assetSide
      ? { fill: '#5c8272', opacity: 0.25, text: '#3f5a4d' }
      : { fill: '#a83d3d', opacity: 0.3, text: '#832f2f' };
  }
  const LIGHT_SEGS = []; // 通常セグメントは白抜き文字で統一する(簿外セグメントは専用の濃色文字のまま)

  // 「ひとまとめ」表示用: 資産側は3要素を合算し、中央(index1)のセグメントだけに全額を持たせる
  function toGroupedAsset(segs) {
    const total = segs.reduce((s, x) => s + x.value, 0);
    return [
      { label: '', value: 0 },
      { label: '資産', value: total, fill: GROUP_ASSET_FILL, fillOpacity: GROUP_FILL_OPACITY, textFill: GROUP_TEXT_FILL, alwaysShowLabel: true },
      { label: '', value: 0 },
    ];
  }
  // 負債・純資産側は「純資産」は分けたまま、「固定負債+流動負債」だけを1つにまとめる(下から純資産→負債の順)
  function toGroupedLiab(segs) {
    const netAssetsVal = segs[0].value;
    const liabTotal = segs[1].value + segs[2].value;
    return [
      { label: '純資産', value: netAssetsVal, fill: GROUP_NETASSETS_FILL, fillOpacity: GROUP_FILL_OPACITY, textFill: GROUP_TEXT_FILL, alwaysShowLabel: true },
      { label: '負債', value: liabTotal, fill: GROUP_LIAB_FILL, fillOpacity: GROUP_FILL_OPACITY, textFill: GROUP_TEXT_FILL, alwaysShowLabel: true },
      { label: '', value: 0 },
    ];
  }

  // 負債・純資産側は下から「純資産(恒常的な資本)→固定負債→流動負債(直近の返済義務)」の順に積む
  // 資産側は上から「流動資産→固定資産→その他資産」に見せたいため、下から積む配列では逆順にする
  const ASSET_SEGS_BASE = [{ label: 'その他資産' }, { label: '固定資産' }, { label: '流動資産' }];
  const LIAB_SEGS_BASE = [{ label: '純資産' }, { label: '固定負債' }, { label: '流動負債' }];
  // a2/l2の簿外部分は、ひとまとめ表示では1本、内訳表示では複数本(充当分+不足分/退職金+事業承継+その他)に分かれるため、
  // 要素数が最大になる内訳表示の枠数で確保しておく(未使用の枠はvalue=0で非表示になる)
  const OFF_BALANCE_ASSET_SEGS = [
    { label: '充当分', offBalance: true, assetSide: true },
    { label: '不足分', offBalance: true, assetSide: true },
  ];
  const OFF_BALANCE_LIAB_SEGS = [
    { label: '退職金', offBalance: true, assetSide: false },
    { label: '事業承継', offBalance: true, assetSide: false },
    { label: 'その他', offBalance: true, assetSide: false },
  ];
  const BAR_DEFS = {
    a1: { x: xAsset1, segs: ASSET_SEGS_BASE },
    l1: { x: xLiab1, segs: LIAB_SEGS_BASE },
    a2: { x: xAsset2, segs: ASSET_SEGS_BASE.concat(OFF_BALANCE_ASSET_SEGS) },
    l2: { x: xLiab2, segs: LIAB_SEGS_BASE.concat(OFF_BALANCE_LIAB_SEGS) },
    a3: { x: xAsset3, segs: ASSET_SEGS_BASE },
    l3: { x: xLiab3, segs: LIAB_SEGS_BASE },
  };

  let chartInitialized = false;
  // 濃色文字(軸ラベル・見出し・合計)専用の白フチ。カード背景がグレーなので視認性を上げる
  // (白抜き文字には使わない: 白フチ×白文字は輪郭が消えて潰れて見えるため)
  const HALO = 'paint-order="stroke fill" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"';

  function initChartOnce() {
    if (chartInitialized) return;
    const svg = document.getElementById('bsChart');
    let svgOut = `<line x1="30" y1="${yBottom}" x2="${W - 20}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`;

    Object.entries(BAR_DEFS).forEach(([barKey, def]) => {
      def.segs.forEach((seg, i) => {
        // 簿外セグメントは個々のrectに点線を付けない(複数積んだ時に境界の点線が重なって崩れて見えるため)。
        // 点線の外枠はこの後まとめて1本のborder用rectで描画する。内側の区切りは白の細い実線にする。
        const attrs = seg.offBalance
          ? (() => { const s = offBalanceStyle(seg.assetSide); return `fill="${s.fill}" fill-opacity="${s.opacity}" stroke="#fff" stroke-width="1"`; })()
          : `fill="${segColor(seg.label)}"`;
        svgOut += `<rect id="bs-${barKey}-${i}" x="${def.x}" y="${yBottom}" width="${barWidth}" height="0" ${attrs}/>`;
      });
      def.segs.forEach((seg, i) => {
        const textColor = seg.offBalance ? offBalanceStyle(seg.assetSide).text : (LIGHT_SEGS.includes(seg.label) ? '#2b2f36' : '#fff');
        svgOut += `<text id="bs-${barKey}-t${i}" x="${def.x + barWidth / 2}" y="${yBottom}" font-size="11" fill="${textColor}" text-anchor="middle"></text>`;
      });
      // 簿外ゾーン全体を囲む1本のダッシュ枠(積んだセグメント数に関わらず、ゾーン全体の外周だけに点線を描く)
      if (def.segs.some((s) => s.offBalance)) {
        const assetSide = def.segs.find((s) => s.offBalance).assetSide;
        svgOut += `<rect id="bs-${barKey}-offborder" x="${def.x}" y="${yBottom}" width="${barWidth}" height="0" fill="none" stroke="${offBalanceStyle(assetSide).fill}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
      }
      svgOut += `<text id="bs-${barKey}-total" x="${def.x + barWidth / 2}" y="${yBottom}" font-size="12" font-weight="bold" fill="#2b2f36" text-anchor="middle" ${HALO}></text>`;
    });

    // グループ見出し: 各BSのバー幅(資産+負債・純資産+間隔)と同じ幅の枠で囲む。
    // 予測BSだけは塗りつぶし+白抜き文字にして強調する(x/width位置は不変。y位置はupdateLayoutが毎回調整する)
    const groupSpanWidth = barWidth * 2 + pairGap;
    svgOut += `<rect id="title-1-box" x="${xAsset1}" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#eef1f5"/>`;
    svgOut += `<text id="title-1" x="${(xAsset1 + xLiab1 + barWidth) / 2}" y="${yBottom}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">会計上のBS</text>`;
    svgOut += `<rect id="title-2-box" x="${xAsset2}" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#eef1f5"/>`;
    svgOut += `<text id="title-2" x="${(xAsset2 + xLiab2 + barWidth) / 2}" y="${yBottom}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">実質的なBS</text>`;
    svgOut += `<rect id="title-3-box" x="${xAsset3}" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#3d4f5c"/>`;
    svgOut += `<text id="title-3" x="${(xAsset3 + xLiab3 + barWidth) / 2}" y="${yBottom}" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">将来予測BS</text>`;

    // 実質的なBS → 予測BS を結ぶ矢印(位置は不変のため静的に1度だけ描画)。
    // 細い矢印記号ではなく塗りつぶした三角形にして、2つのエリアの区切りを分かりやすくする
    const arrowCenterY = (yTop + yBottom) / 2;
    svgOut += `<polygon id="predicted-arrow" points="${arrowX - 9},${arrowCenterY - 13} ${arrowX - 9},${arrowCenterY + 13} ${arrowX + 11},${arrowCenterY}" fill="#0f2a4a"/>`;

    svg.innerHTML = svgOut;
    chartInitialized = true;
  }

  // 「予測BSを表示」がOFFのときに非表示にする要素(3組目のバー・見出し・矢印)
  const GROUP3_IDS = [
    'bs-a3-0', 'bs-a3-1', 'bs-a3-2', 'bs-a3-t0', 'bs-a3-t1', 'bs-a3-t2', 'bs-a3-total',
    'bs-l3-0', 'bs-l3-1', 'bs-l3-2', 'bs-l3-t0', 'bs-l3-t1', 'bs-l3-t2', 'bs-l3-total',
    'title-3', 'title-3-box', 'predicted-arrow',
  ];

  // 見出し・SVG全体の高さ/幅を、債務超過の有無・予測BS表示ON/OFFに応じて動的に調整する。
  // マイナス値が無ければNEG_ZONE_Hの帯を確保せず、グラフ下の余白を無くす。
  // 予測BSがOFFのときは3組目を非表示にし、viewBoxの幅も実質的なBSまでに縮めて余白を詰める。
  function updateLayout(anyNeg) {
    const negZone = anyNeg ? NEG_ZONE_H : 0;
    const titleY = yBottom + negZone + 24;
    const svgH = titleY + 12;
    const setY = (id, y) => { const el = document.getElementById(id); if (el) el.setAttribute('y', y.toFixed(1)); };
    ['title-1', 'title-2', 'title-3'].forEach((id) => setY(id, titleY));
    ['title-1-box', 'title-2-box', 'title-3-box'].forEach((id) => setY(id, titleY - 17));
    GROUP3_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = showPredicted ? '' : 'none';
    });
    const svgW = showPredicted ? W : (xLiab2 + barWidth + xAsset1);
    const svg = document.getElementById('bsChart');
    if (svg) svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH.toFixed(1)}`);
  }

  // showValues=false のときはダミー(仮)表示: 数字ラベルは出さない(labelOnly=trueなら要素名だけ表示)。
  // 通常は0(基準線)から上に積むが、純資産が債務超過などで負値になる場合は
  // その要素だけ基準線から下向きに積むことで、マイナス値でも高さがマイナスにならず表示が崩れない。
  function updateChart(dataByBar, pxPerYen, showValues, labelOnly) {
    initChartOnce();
    const anyNeg = Object.values(dataByBar).some((segs) => segs.some((s) => s.value < 0));
    updateLayout(anyNeg);
    Object.entries(dataByBar).forEach(([barKey, segments]) => {
      let yPos = yBottom; // 0以上の要素: 基準線から上に積む
      let yNeg = yBottom; // 0未満の要素: 基準線から下に積む
      let total = 0;
      let offBalTop = null;
      let offBalBottom = null;
      segments.forEach((seg, i) => {
        const isNeg = seg.value < 0;
        // マイナス側はNEG_ZONE_H(帯の残り幅)を超えないようクランプし、どんなに大きな債務超過でも表示が崩れないようにする
        const h = isNeg
          ? Math.max(0, Math.min(Math.abs(seg.value) * pxPerYen, yBottom + NEG_ZONE_H - yNeg))
          : Math.abs(seg.value) * pxPerYen;
        const segY = isNeg ? yNeg : (yPos - h);
        const rect = document.getElementById(`bs-${barKey}-${i}`);
        if (rect) {
          rect.setAttribute('y', segY.toFixed(1));
          rect.setAttribute('height', h.toFixed(1));
          // seg.fill があれば「ひとまとめ」表示の専用色、なければ詳細表示の通常配色を使う
          rect.setAttribute('fill', seg.fill || (seg.offBalance ? offBalanceStyle(seg.assetSide).fill : segColor(seg.label)));
          rect.setAttribute('fill-opacity', seg.fillOpacity != null ? seg.fillOpacity : (seg.offBalance ? offBalanceStyle(seg.assetSide).opacity : segOpacity(seg.label)));
          // 背景がグレーのため、通常セグメントは白フチを付けて輪郭をくっきりさせる(簿外セグメントは点線の色付き枠のまま)
          if (!seg.offBalance) {
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '1.5');
          }
        }
        const text = document.getElementById(`bs-${barKey}-t${i}`);
        if (text) {
          const midY = segY + h / 2;
          text.setAttribute('fill', seg.textFill || (seg.offBalance ? offBalanceStyle(seg.assetSide).text : (LIGHT_SEGS.includes(seg.label) ? '#2b2f36' : '#fff')));
          // 「ひとまとめ」表示のセグメントは高さが小さくても要素名・金額を必ず表示する
          const forceLabel = showValues && seg.alwaysShowLabel && seg.value !== 0;
          if (labelOnly) {
            // 未入力時のダミー表示: 金額は出さず要素名だけを表示する
            if (seg.label && h > 0) {
              text.setAttribute('y', (midY + 4).toFixed(1));
              text.textContent = seg.label;
            } else {
              text.textContent = '';
            }
          } else if (showValues && h > 34) {
            // 十分な高さがあるときは要素名(小)＋金額(太字)の2行を直接セグメント内に表示する
            // (バー幅に収まるよう、通常よりやや小さめのフォントサイズにして重なり・はみ出しを防ぐ)
            text.setAttribute('y', midY.toFixed(1));
            text.innerHTML = `<tspan x="${text.getAttribute('x')}" dy="-0.35em" font-size="8" font-weight="400">${seg.label}</tspan><tspan x="${text.getAttribute('x')}" dy="1.15em" font-size="10" font-weight="bold">${man(seg.value)}</tspan>`;
          } else if (showValues && h > 16) {
            if (forceLabel) {
              // 白抜き文字が帯からはみ出て見えなくならないよう、小さめフォントの2行(要素名/金額)にして帯の中に収める
              text.setAttribute('y', midY.toFixed(1));
              text.innerHTML = `<tspan x="${text.getAttribute('x')}" dy="-0.3em" font-size="6" font-weight="400">${seg.label}</tspan><tspan x="${text.getAttribute('x')}" dy="1em" font-size="7" font-weight="bold">${man(seg.value)}</tspan>`;
            } else {
              // 高さが足りない時は金額のみ
              text.setAttribute('y', (midY + 4).toFixed(1));
              text.innerHTML = `<tspan font-size="9" font-weight="bold">${man(seg.value)}</tspan>`;
            }
          } else if (showValues && (isNeg || forceLabel) && seg.value !== 0) {
            // マイナス値や「ひとまとめ」表示で帯が小さい場合でも、要素名・金額を見失わないよう帯のすぐ下に表示する
            text.setAttribute('y', (segY + h + 12).toFixed(1));
            text.innerHTML = `<tspan x="${text.getAttribute('x')}" font-size="8" font-weight="bold">${seg.label} ${man(seg.value)}</tspan>`;
          } else {
            text.textContent = '';
          }
        }
        total += seg.value;
        if (isNeg) { yNeg += h; } else { yPos -= h; }
        if (seg.offBalance && seg.value !== 0) {
          if (offBalTop === null || segY < offBalTop) offBalTop = segY;
          if (offBalBottom === null || segY + h > offBalBottom) offBalBottom = segY + h;
        }
      });
      const totalText = document.getElementById(`bs-${barKey}-total`);
      if (totalText) {
        if (showValues) {
          totalText.setAttribute('y', (yPos - 8).toFixed(1));
          totalText.textContent = man(total);
        } else {
          totalText.textContent = '';
        }
      }
      // 簿外ゾーン全体を囲むダッシュ枠を、積んだ簿外セグメントの合計範囲に合わせて更新する
      const borderRect = document.getElementById(`bs-${barKey}-offborder`);
      if (borderRect) {
        if (offBalTop !== null) {
          borderRect.setAttribute('y', offBalTop.toFixed(1));
          borderRect.setAttribute('height', (offBalBottom - offBalTop).toFixed(1));
        } else {
          borderRect.setAttribute('height', '0');
        }
      }
    });
  }

  function drawBalanceSheetChart(fields, netAssets, futureLiabTotal) {
    const assetsBaseDetail = [
      { label: 'その他資産', value: fields.otherAssets.value },
      { label: '固定資産', value: fields.fixedAssets.value },
      { label: '流動資産', value: fields.curAssets.value },
    ];
    const liabNetBaseDetail = [
      { label: '純資産', value: netAssets },
      { label: '固定負債', value: fields.fixedLiab.value },
      { label: '流動負債', value: fields.curLiab.value },
    ];
    const totalBase = fields.curAssets.value + fields.fixedAssets.value + fields.otherAssets.value;
    const totalAdjusted = totalBase + futureLiabTotal;
    const maxTotal = Math.max(totalAdjusted, 1);
    const pxPerYen = plotH / maxTotal;

    // 簿外資産(準備状況)は表示モードに関わらず常に集計する。
    // 内訳表示のときは、簿外資産を「充当分(生命保険金+その他)」「不足分」に、
    // 簿外負債を「退職金」「事業承継」「その他」に分けて表示する(色は簿外資産/簿外負債のまま。不足分だけ白背景にする)
    const lifeInsRaw = num('lifeInsurance').value;
    const otherCovRaw = num('otherCoverage').value;
    const coveredRaw = (isNaN(lifeInsRaw) ? 0 : lifeInsRaw) + (isNaN(otherCovRaw) ? 0 : otherCovRaw);
    const coveredPortion = Math.min(coveredRaw, futureLiabTotal);
    const shortfallPortion = Math.max(0, futureLiabTotal - coveredRaw);

    // 予測BS(簿外負債が発動した場合)は「生命保険金あり/なし」トグルで、実際にBSへ影響する金額を切り替える。
    // あり: 生命保険金等でカバーされる分は相殺されるため、不足分だけがBSに影響する。なし: 全額がそのまま影響する。
    const impactAmount = withInsurance ? shortfallPortion : futureLiabTotal;

    // 純資産と流動資産から取り崩す。流動資産で足りなければその他資産、それでも足りなければ固定資産も取り崩す。
    // (純資産・固定資産は取り崩しきれない場合マイナス=債務超過になり得るが、上のupdateChartが基準線の上下で
    //  別々に積むためマイナス値でも表示は崩れない)
    let remaining = impactAmount;
    const take1 = Math.min(remaining, Math.max(fields.curAssets.value, 0));
    const curAssetsTriggered = fields.curAssets.value - take1;
    remaining -= take1;
    const take2 = Math.min(remaining, Math.max(fields.otherAssets.value, 0));
    const otherAssetsTriggered = fields.otherAssets.value - take2;
    remaining -= take2;
    const fixedAssetsTriggered = fields.fixedAssets.value - remaining;
    const netAssetsTriggered = netAssets - impactAmount;

    const assetsTriggeredDetail = [
      { label: 'その他資産', value: otherAssetsTriggered },
      { label: '固定資産', value: fixedAssetsTriggered },
      { label: '流動資産', value: curAssetsTriggered },
    ];
    const liabNetTriggeredDetail = [
      { label: '純資産', value: netAssetsTriggered },
      { label: '固定負債', value: fields.fixedLiab.value },
      { label: '流動負債', value: fields.curLiab.value },
    ];

    // 「内訳を表示」がOFF(デフォルト)のときは資産をひとまとめの1本に、負債・純資産は「純資産」と「負債」の2本に分ける
    const assetsBase = detailMode ? assetsBaseDetail : toGroupedAsset(assetsBaseDetail);
    const liabNetBase = detailMode ? liabNetBaseDetail : toGroupedLiab(liabNetBaseDetail);
    const assetsTriggered = detailMode ? assetsTriggeredDetail : toGroupedAsset(assetsTriggeredDetail);
    const liabNetTriggered = detailMode ? liabNetTriggeredDetail : toGroupedLiab(liabNetTriggeredDetail);

    const offBalanceAssetSegs = detailMode
      ? [
          { label: '充当分', value: coveredPortion, offBalance: true, assetSide: true },
          { label: '不足分', value: shortfallPortion, offBalance: true, assetSide: true, fill: '#ffffff', fillOpacity: 1, textFill: '#3f5a4d' },
        ]
      : [
          { label: '簿外資産', value: futureLiabTotal, offBalance: true, assetSide: true },
          { label: '', value: 0, offBalance: true, assetSide: true },
        ];
    const offBalanceLiabSegs = detailMode
      ? [
          { label: '退職金', value: fields.retirement.value, offBalance: true, assetSide: false },
          { label: '事業承継', value: fields.succession.value, offBalance: true, assetSide: false },
          { label: 'その他', value: fields.otherFuture.value, offBalance: true, assetSide: false },
        ]
      : [
          { label: '将来負債', value: futureLiabTotal, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
        ];

    const assetsAdjusted = assetsBase.concat(offBalanceAssetSegs);
    const liabNetAdjusted = liabNetBase.concat(offBalanceLiabSegs);

    updateChart({
      a1: assetsBase, l1: liabNetBase,
      a2: assetsAdjusted, l2: liabNetAdjusted,
      a3: assetsTriggered, l3: liabNetTriggered,
    }, pxPerYen, true);
  }

  // 未入力時: 流動資産/固定資産/その他資産/流動負債/固定負債/純資産/簿外資産/簿外負債を
  // すべて同じ高さのダミーBSとして表示する(数字ラベルなし)。予測BS(3組目)も同じ仮値で表示する。
  // 「内訳を表示」がOFFのときは、ひとまとめ表示と同じ見た目(1本の色ブロック)のダミーにする。
  function drawDummyChart() {
    const dummySeg = (label, offBalance, assetSide) => ({ label, value: DUMMY_VALUE, offBalance: !!offBalance, assetSide: !!assetSide });
    const dataByBar = detailMode ? {
      a1: [dummySeg('その他資産'), dummySeg('固定資産'), dummySeg('流動資産')],
      l1: [dummySeg('純資産'), dummySeg('固定負債'), dummySeg('流動負債')],
      a2: [dummySeg('その他資産'), dummySeg('固定資産'), dummySeg('流動資産'),
        { label: '充当分', value: DUMMY_VALUE / 2, offBalance: true, assetSide: true },
        { label: '不足分', value: DUMMY_VALUE / 2, offBalance: true, assetSide: true, fill: '#ffffff', fillOpacity: 1 }],
      l2: [dummySeg('純資産'), dummySeg('固定負債'), dummySeg('流動負債'),
        { label: '退職金', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false },
        { label: '事業承継', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false },
        { label: 'その他', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false }],
      a3: [dummySeg('その他資産'), dummySeg('固定資産'), dummySeg('流動資産')],
      l3: [dummySeg('純資産'), dummySeg('固定負債'), dummySeg('流動負債')],
    } : (() => {
      const blank = { label: '', value: 0 };
      const assetDummy = { label: '資産', value: DUMMY_VALUE * 3, fill: GROUP_ASSET_FILL, fillOpacity: GROUP_FILL_OPACITY };
      // 内訳表示のダミー(純資産1:負債2 ※固定負債+流動負債の2要素分)と比率を揃え、表示切替時に純資産の大きさが変わらないようにする
      const netAssetsDummy = { label: '純資産', value: DUMMY_VALUE, fill: GROUP_NETASSETS_FILL, fillOpacity: GROUP_FILL_OPACITY };
      const liabDummy = { label: '負債', value: DUMMY_VALUE * 2, fill: GROUP_LIAB_FILL, fillOpacity: GROUP_FILL_OPACITY };
      return {
        a1: [blank, assetDummy, blank],
        l1: [netAssetsDummy, liabDummy, blank],
        a2: [blank, assetDummy, blank, dummySeg('簿外資産', true, true), blank],
        l2: [netAssetsDummy, liabDummy, blank, dummySeg('簿外負債', true, false), blank, blank],
        a3: [blank, assetDummy, blank],
        l3: [netAssetsDummy, liabDummy, blank],
      };
    })();
    const pxPerYen = plotH / (DUMMY_VALUE * 4);
    updateChart(dataByBar, pxPerYen, false, true);
  }

  // 入力が変わるたびにリアルタイムで再計算・再描画する
  function recompute() {
    clearError();

    const fields = {
      curAssets: num('curAssets'),
      fixedAssets: num('fixedAssets'),
      otherAssets: num('otherAssets'),
      curLiab: num('curLiab'),
      fixedLiab: num('fixedLiab'),
      netAssets: num('netAssets'),
      retirement: num('retirement'),
      succession: num('succession'),
      otherFuture: num('otherFuture'),
    };

    const MAX_VALUE = 999999; // 万円(上限:約100億円) — 桁あふれ・グラフ表示崩れの防止

    // 明らかな異常値(桁あふれ)だけはエラー表示で入力を促す。未入力(NaN)はエラーにせず、
    // 下記でダミーBSを表示して「入力すれば正確な形に変わる」ことを伝える。
    for (const [key, field] of Object.entries(fields)) {
      if (!isNaN(field.value) && Math.abs(field.value) > MAX_VALUE) {
        showError(`入力できる金額は ${man(MAX_VALUE)} までです。数値をご確認ください。`);
        field.el.focus();
        return;
      }
    }

    const anyEmpty = Object.values(fields).some((field) => isNaN(field.value));
    if (anyEmpty) {
      drawDummyChart();
      document.getElementById('flBalanceNote').classList.add('hidden');
      lastResult = null;
      resultArea.classList.remove('hidden');
      return;
    }

    const totalAssets = fields.curAssets.value + fields.fixedAssets.value + fields.otherAssets.value;
    const totalLiabNet = fields.curLiab.value + fields.fixedLiab.value + fields.netAssets.value;
    const futureLiabTotal = fields.retirement.value + fields.succession.value + fields.otherFuture.value;
    const netAssets = fields.netAssets.value;
    const ratio = netAssets !== 0 ? (futureLiabTotal / netAssets) * 100 : null;
    const remaining = netAssets - futureLiabTotal;

    const balanceNote = document.getElementById('flBalanceNote');
    resultArea.classList.remove('hidden');
    if (Math.abs(totalAssets - totalLiabNet) > 0.5) {
      // 左右が一致しない間はグラフを更新せず直前の状態のまま保持する(入力エリアの赤枠はupdateBalanceCheckが担当)
      balanceNote.textContent = '※ 総資産と負債・純資産合計が一致していません。一致するとグラフに反映されます。';
      balanceNote.classList.remove('hidden');
      saveCurrentValues();
      return;
    }
    balanceNote.classList.add('hidden');

    drawBalanceSheetChart(fields, netAssets, futureLiabTotal);

    lastResult = { fields, totalAssets, totalLiabNet, futureLiabTotal, netAssets, ratio, remaining };

    saveCurrentValues();
  }

  // 送信ボタンは廃止。数字入力が一段落してから(=確定してから)なめらかに反映するためデバウンスする。
  // 入力中は連続再描画せず、約400ms入力が止まったタイミングで反映。blur/Enter(change)は即時反映。
  let recomputeTimer = null;
  function scheduleRecompute() {
    clearTimeout(recomputeTimer);
    recomputeTimer = setTimeout(recompute, 400);
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(recomputeTimer); recompute(); });
  form.addEventListener('input', scheduleRecompute);
  form.addEventListener('change', function () { clearTimeout(recomputeTimer); recompute(); });

  // ===== 入力データクリア(保存データも含めて完全に消去。誤操作防止のため必ず確認する) =====
  function doClearFields() {
    form.querySelectorAll('input[id]').forEach(function (el) { el.value = ''; });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    updateBalanceCheck();
    updateFutureLiabTotal();
    updateOffBalanceAsset();
    recompute();
  }
  const clearBtn = document.getElementById('flClearBtn');
  if (window.armHeroClearBtn) window.armHeroClearBtn(clearBtn, doClearFields);

  // ===== PDF出力 =====
  function doPrint() {
      if (!lastResult) {
        showError('前提条件をすべて入力してください。');
        return;
      }
      const r = lastResult;
      const f = r.fields;
      const now = new Date();
      document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

      const set = (id, text) => { document.getElementById(id).textContent = text; };
      set('pCurAssets', man(f.curAssets.value));
      set('pFixedAssets', man(f.fixedAssets.value));
      set('pOtherAssets', man(f.otherAssets.value));
      set('pTotalAssets', man(r.totalAssets));
      set('pCurLiab', man(f.curLiab.value));
      set('pFixedLiab', man(f.fixedLiab.value));
      set('pNetAssets', man(r.netAssets));
      set('pTotalLiabNet', man(r.totalLiabNet));
      set('pRetirement', man(f.retirement.value));
      set('pSuccession', man(f.succession.value));
      set('pOtherFuture', man(f.otherFuture.value));
      set('pFutureLiab', man(r.futureLiabTotal));
      set('pRemaining', man(r.remaining));
      set('pRatio', r.ratio === null ? '算出不可' : r.ratio.toFixed(1) + ' %');

      const slot = document.getElementById('pChartSlot');
      slot.innerHTML = '';
      const chart = document.getElementById('bsChart');
      if (chart) {
        const clone = chart.cloneNode(true);
        clone.removeAttribute('id');
        slot.appendChild(clone);
      }

      window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期表示: 保存済みデータがあれば復元し、自動試算 =====
  loadSavedValues();
  updateBalanceCheck();
  updateFutureLiabTotal();
  updateOffBalanceAsset(); // 読み込んだ将来負債・生命保険金額をもとに不足分を計算し直す
  recompute();
});

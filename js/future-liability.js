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

  // ===== 会計上/実質的/将来予測/将来予測実質の4つのBSを個別に表示ON/OFFできるトグル群。
  //       最低1つは表示する(下限のみ制約、上限なし)。4つ全部選んだ時だけ、1本1本が細くなりすぎないよう
  //       updateLayoutでバー幅・間隔を縮小して適正化する(1〜3つの時は従来通りのサイズのまま)。
  //       デフォルトは会計上のBS・実質的なBSの2つ =====
  const showGroup = { 1: true, 2: true, 3: false, 4: false };
  const groupToggleEls = {
    1: document.getElementById('showGroup1Toggle'),
    2: document.getElementById('showGroup2Toggle'),
    3: document.getElementById('showGroup3Toggle'),
    4: document.getElementById('showGroup4Toggle'),
  };

  function activeGroupCount() {
    return [1, 2, 3, 4].filter((n) => showGroup[n]).length;
  }
  // 最低1つは表示が必要なため、残り1つの状態でそれをOFFにしようとするボタンだけ押せないようにする。
  // 上限は無く、1〜4つの好きな数を選べる(4つの時はupdateLayoutが自動でサイズを縮小する)
  function updateGroupToggleAvailability() {
    const count = activeGroupCount();
    [1, 2, 3, 4].forEach((n) => {
      const btn = groupToggleEls[n];
      if (!btn) return;
      btn.disabled = showGroup[n] && count <= 1;
    });
  }
  // ラベルは「会計上」「実質的」「将来」「次世代」に固定し、ON/OFFは点灯(is-on)だけで表す
  function setGroupToggleVisual(n, on) {
    const btn = groupToggleEls[n];
    if (!btn) return;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  }
  [1, 2, 3, 4].forEach((n) => {
    const btn = groupToggleEls[n];
    if (!btn) return;
    btn.addEventListener('click', function () {
      const count = activeGroupCount();
      if (showGroup[n] && count <= 1) return; // 最低1つは表示する
      showGroup[n] = !showGroup[n];
      setGroupToggleVisual(n, showGroup[n]);
      updateGroupToggleAvailability();
      recompute();
    });
    setGroupToggleVisual(n, showGroup[n]);
  });
  updateGroupToggleAvailability();

  // ===== グラフの「BS内訳」トグル(初期値はOFF=ひとまとめ表示、ラベルは固定で点灯だけで状態を表す) =====
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

  // ===== 予測BSの「生命保険あり/なし」トグル(初期値はなし=簿外負債全額がBSに影響する従来の見え方)。常時表示 =====
  let withInsurance = false;
  const insuranceToggle = document.getElementById('insuranceToggle');
  if (insuranceToggle) {
    insuranceToggle.addEventListener('click', function () {
      withInsurance = !withInsurance;
      insuranceToggle.classList.toggle('is-on', withInsurance);
      insuranceToggle.setAttribute('aria-pressed', String(withInsurance));
      insuranceToggle.querySelector('.toggle-label').textContent = withInsurance ? '生命保険あり' : '生命保険なし';
      recompute();
    });
  }

  // ===== 各BSの「自己資本％」トグル(初期値はOFF、ラベルは固定で点灯だけで状態を表す) =====
  let showEquityRatio = false;
  const equityRatioToggle = document.getElementById('equityRatioToggle');
  if (equityRatioToggle) {
    equityRatioToggle.addEventListener('click', function () {
      showEquityRatio = !showEquityRatio;
      equityRatioToggle.classList.toggle('is-on', showEquityRatio);
      equityRatioToggle.setAttribute('aria-pressed', String(showEquityRatio));
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

  // 次世代将来負債(将来予測実質BSで使う、将来負債とは別枠の追加入力。未入力の項目は0として扱う任意入力)
  const NEXT_FUTURE_LIAB_IDS = ['nextRetirement', 'nextSuccession', 'nextOtherFuture'];
  function nextFutureLiabTotalNow() {
    return NEXT_FUTURE_LIAB_IDS.reduce((s, id) => {
      const v = num(id).value;
      return s + (isNaN(v) ? 0 : v);
    }, 0);
  }
  function updateNextFutureLiabTotal() {
    const anyFilled = NEXT_FUTURE_LIAB_IDS.some((id) => !isNaN(num(id).value));
    document.getElementById('checkNextFutureLiabTotal').textContent = anyFilled ? man(nextFutureLiabTotalNow()) : '-';
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
  NEXT_FUTURE_LIAB_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateNextFutureLiabTotal);
  });
  updateBalanceCheck();
  updateFutureLiabTotal();
  updateOffBalanceAsset();
  updateNextFutureLiabTotal();

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
  // 2〜3組表示時の標準サイズ(この見た目を基準とする)。4組すべて表示する時だけ、updateLayoutが
  // FOUR_GROUP_SCALEを掛けて縮小したサイズ(currentBarWidth等)を使う
  const barWidth = 78;
  const groupGap = 46;
  const pairGap = 16;
  const DUMMY_VALUE = 25; // ダミー表示用の共通仮値(万円換算は意味を持たない)
  const groupSpanWidth = barWidth * 2 + pairGap; // 標準サイズでの1BSぶんの幅(資産+負債・純資産+間隔)
  const FOUR_GROUP_SCALE = 0.8; // 4組すべて表示する時の縮小率
  // 実際の描画に使うサイズ。2〜3組の時はbarWidth等と同じ、4組の時はupdateLayoutが縮小して更新する
  let currentBarWidth = barWidth;
  let currentPairGap = pairGap;
  let currentGroupGap = groupGap;
  let currentGroupSpanWidth = groupSpanWidth;
  // 各バーのx位置は固定値を持たず、選ばれている組数に応じてupdateLayoutが毎回中央寄せで計算する

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
  // a2/l2の簿外部分は、ひとまとめ表示では1本、内訳表示では複数本(充当分+不足分/退職金+自社株買取+その他)に分かれるため、
  // 要素数が最大になる内訳表示の枠数で確保しておく(未使用の枠はvalue=0で非表示になる)
  const OFF_BALANCE_ASSET_SEGS = [
    { label: '充当分', offBalance: true, assetSide: true },
    { label: '不足分', offBalance: true, assetSide: true },
  ];
  const OFF_BALANCE_LIAB_SEGS = [
    { label: '退職金', offBalance: true, assetSide: false },
    { label: '自社株買取', offBalance: true, assetSide: false },
    { label: 'その他', offBalance: true, assetSide: false },
  ];
  // a4/l4の簿外部分(次世代将来負債)。資産側は生命保険等の充当区分が無いため常に1本、
  // 負債側はa2/l2と同様、ひとまとめ表示では1本・内訳表示では3本(退職金/自社株買取/その他)に分かれる。
  // チャート上のラベルは「次世代」を付けずグループ2と同じ表記にする(このBAR_DEFS内のlabelは
  // 枠数の判定にのみ使い、実際に表示するラベルはdrawBalanceSheetChart/drawDummyChart側で決める)
  const OFF_BALANCE_ASSET_SEGS_4 = [
    { label: '簿外資産', offBalance: true, assetSide: true },
  ];
  const OFF_BALANCE_LIAB_SEGS_4 = [
    { label: '退職金', offBalance: true, assetSide: false },
    { label: '自社株買取', offBalance: true, assetSide: false },
    { label: 'その他', offBalance: true, assetSide: false },
  ];
  // x位置は持たず、常に0で初期化する(表示ON/OFFの組み合わせに応じてupdateLayoutが毎回設定するため)
  const BAR_DEFS = {
    a1: { segs: ASSET_SEGS_BASE },
    l1: { segs: LIAB_SEGS_BASE },
    a2: { segs: ASSET_SEGS_BASE.concat(OFF_BALANCE_ASSET_SEGS) },
    l2: { segs: LIAB_SEGS_BASE.concat(OFF_BALANCE_LIAB_SEGS) },
    a3: { segs: ASSET_SEGS_BASE },
    l3: { segs: LIAB_SEGS_BASE },
    a4: { segs: ASSET_SEGS_BASE.concat(OFF_BALANCE_ASSET_SEGS_4) },
    l4: { segs: LIAB_SEGS_BASE.concat(OFF_BALANCE_LIAB_SEGS_4) },
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
        svgOut += `<rect id="bs-${barKey}-${i}" x="0" y="${yBottom}" width="${barWidth}" height="0" ${attrs}/>`;
      });
      def.segs.forEach((seg, i) => {
        const textColor = seg.offBalance ? offBalanceStyle(seg.assetSide).text : (LIGHT_SEGS.includes(seg.label) ? '#2b2f36' : '#fff');
        svgOut += `<text id="bs-${barKey}-t${i}" x="0" y="${yBottom}" font-size="11" fill="${textColor}" text-anchor="middle"></text>`;
      });
      // 簿外ゾーン全体を囲む1本のダッシュ枠(積んだセグメント数に関わらず、ゾーン全体の外周だけに点線を描く)
      if (def.segs.some((s) => s.offBalance)) {
        const assetSide = def.segs.find((s) => s.offBalance).assetSide;
        svgOut += `<rect id="bs-${barKey}-offborder" x="0" y="${yBottom}" width="${barWidth}" height="0" fill="none" stroke="${offBalanceStyle(assetSide).fill}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
      }
      svgOut += `<text id="bs-${barKey}-total" x="0" y="${yBottom}" font-size="12" font-weight="bold" fill="#2b2f36" text-anchor="middle" ${HALO}></text>`;
    });

    // グループ見出し: 各BSのバー幅(資産+負債・純資産+間隔)と同じ幅の枠で囲む。
    // 将来予測・将来予測実質は塗りつぶし+白抜き文字にして強調する(x位置・表示有無はupdateLayoutが毎回調整する)
    // 各見出しの上には自己資本比率ボックスを1組ずつ配置する(表示ON/OFFはトグルで切替、updateEquityRatioBoxで内容更新)
    svgOut += `<rect id="equity-box-1" x="0" y="${yBottom}" width="${groupSpanWidth}" height="22" rx="4" fill="#e4ebf0" stroke="#c3d0d9" stroke-width="1"/>`;
    svgOut += `<text id="equity-text-1" x="0" y="${yBottom}" font-weight="bold" fill="#3d4f5c" text-anchor="middle">自己資本比率</text>`;
    svgOut += `<rect id="title-1-box" x="0" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#eef1f5" stroke="#3d4f5c" stroke-width="1.2"/>`;
    svgOut += `<text id="title-1" x="0" y="${yBottom}" font-size="13" font-weight="bold" fill="#3d4f5c" text-anchor="middle">貸借対照表</text>`;
    svgOut += `<rect id="equity-box-2" x="0" y="${yBottom}" width="${groupSpanWidth}" height="22" rx="4" fill="#e4ebf0" stroke="#c3d0d9" stroke-width="1"/>`;
    svgOut += `<text id="equity-text-2" x="0" y="${yBottom}" font-weight="bold" fill="#3d4f5c" text-anchor="middle">自己資本比率</text>`;
    svgOut += `<rect id="title-2-box" x="0" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#eef1f5" stroke="#3d4f5c" stroke-width="1.2"/>`;
    svgOut += `<text id="title-2" x="0" y="${yBottom}" font-size="13" font-weight="bold" fill="#3d4f5c" text-anchor="middle">実質BS</text>`;
    svgOut += `<rect id="equity-box-3" x="0" y="${yBottom}" width="${groupSpanWidth}" height="22" rx="4" fill="#e4ebf0" stroke="#c3d0d9" stroke-width="1"/>`;
    svgOut += `<text id="equity-text-3" x="0" y="${yBottom}" font-weight="bold" fill="#3d4f5c" text-anchor="middle">自己資本比率</text>`;
    svgOut += `<rect id="title-3-box" x="0" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#3d4f5c"/>`;
    svgOut += `<text id="title-3" x="0" y="${yBottom}" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">将来予測BS</text>`;
    svgOut += `<rect id="equity-box-4" x="0" y="${yBottom}" width="${groupSpanWidth}" height="22" rx="4" fill="#e4ebf0" stroke="#c3d0d9" stroke-width="1"/>`;
    svgOut += `<text id="equity-text-4" x="0" y="${yBottom}" font-weight="bold" fill="#3d4f5c" text-anchor="middle">自己資本比率</text>`;
    svgOut += `<rect id="title-4-box" x="0" y="${yBottom}" width="${groupSpanWidth}" height="24" rx="3" fill="#3d4f5c"/>`;
    svgOut += `<text id="title-4" x="0" y="${yBottom}" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">次世代実質BS</text>`;

    // 表示中のBS同士を結ぶ矢印。特定の組同士に固定せず、隣り合って表示されている組の間にだけ
    // 必要な数(最大2本)を表示する汎用スロットとして用意し、位置・表示有無はupdateLayoutが毎回設定する
    svgOut += `<polygon id="arrow-gap-0" points="0,0 0,0 0,0" fill="#0f2a4a"/>`;
    svgOut += `<polygon id="arrow-gap-1" points="0,0 0,0 0,0" fill="#0f2a4a"/>`;
    svgOut += `<polygon id="arrow-gap-2" points="0,0 0,0 0,0" fill="#0f2a4a"/>`;

    svg.innerHTML = svgOut;
    chartInitialized = true;
    fitTitleFonts();
  }

  // 見出し文字数(特に「会計上（決算書上）のBS」)が枠に収まるよう縮小し、3つの見出し+自己資本比率ボックスの
  // フォントサイズを揃える(会計上のBSの見出しに必要なサイズに全体を合わせることで統一感を出す)
  let equityFontSize = 13;
  function fitTitleFonts() {
    const maxW = currentGroupSpanWidth - 10;
    const t1 = document.getElementById('title-1');
    if (!t1) return; // 初回のinitChartOnce実行前(要素未生成)の呼び出しをガードする
    let size = 13;
    t1.setAttribute('font-size', size);
    while (size > 9 && t1.getComputedTextLength() > maxW) {
      size -= 1;
      t1.setAttribute('font-size', size);
    }
    ['title-1', 'title-2', 'title-3', 'title-4'].forEach((id) => {
      document.getElementById(id).setAttribute('font-size', size);
    });
    equityFontSize = size;
  }

  // 各BS(1〜4)に属する全要素のidをBAR_DEFSから動的に組み立てる(表示ON/OFF切替・非表示化に使う)
  function buildGroupIds(n) {
    const ids = [`title-${n}`, `title-${n}-box`, `equity-box-${n}`, `equity-text-${n}`];
    ['a', 'l'].forEach((side) => {
      const barKey = side + n;
      const def = BAR_DEFS[barKey];
      def.segs.forEach((seg, i) => { ids.push(`bs-${barKey}-${i}`, `bs-${barKey}-t${i}`); });
      ids.push(`bs-${barKey}-total`);
      if (def.segs.some((s) => s.offBalance)) ids.push(`bs-${barKey}-offborder`);
    });
    return ids;
  }
  const GROUP_IDS = { 1: buildGroupIds(1), 2: buildGroupIds(2), 3: buildGroupIds(3), 4: buildGroupIds(4) };

  // barKeyの全rect/textのx位置・幅を一括で付け替える(表示中のBSの並び替え・4組表示時の縮小に使う)
  function repositionGroupBars(n, xAsset, xLiab, bw) {
    ['a', 'l'].forEach((side) => {
      const barKey = side + n;
      const x = side === 'a' ? xAsset : xLiab;
      const def = BAR_DEFS[barKey];
      def.segs.forEach((seg, i) => {
        const rect = document.getElementById(`bs-${barKey}-${i}`);
        if (rect) { rect.setAttribute('x', x); rect.setAttribute('width', bw); }
        const text = document.getElementById(`bs-${barKey}-t${i}`);
        if (text) text.setAttribute('x', x + bw / 2);
      });
      const total = document.getElementById(`bs-${barKey}-total`);
      if (total) total.setAttribute('x', x + bw / 2);
      if (def.segs.some((s) => s.offBalance)) {
        const border = document.getElementById(`bs-${barKey}-offborder`);
        if (border) { border.setAttribute('x', x); border.setAttribute('width', bw); }
      }
    });
  }

  // 見出し・SVG全体の高さを、債務超過の有無に応じて動的に調整する。
  // マイナス値が無ければNEG_ZONE_Hの帯を確保せず、グラフ下の余白を無くす。
  // 会計上/実質的/将来予測/将来予測実質の4つのBSは最低1組から自由に選んで表示できる仕様。
  // 1〜3組の時はバーの大きさ・間隔を変えずに中央寄せで並べ直すだけだが、4組全部を選んだ時だけ
  // 1本1本が細くなりすぎないよう、FOUR_GROUP_SCALE分だけバー幅・間隔を縮小して収める。
  function updateLayout(anyNeg) {
    const negZone = anyNeg ? NEG_ZONE_H : 0;
    const zoneBottom = yBottom + negZone;

    const visibleGroups = [1, 2, 3, 4].filter((n) => showGroup[n]);
    const count = visibleGroups.length;
    const scale = count === 4 ? FOUR_GROUP_SCALE : 1;
    currentBarWidth = barWidth * scale;
    currentPairGap = pairGap * scale;
    currentGroupGap = groupGap * scale;
    currentGroupSpanWidth = currentBarWidth * 2 + currentPairGap;
    // 見出し・自己資本比率ボックスの文字サイズも、その時のボックス幅に合わせて再計算する
    fitTitleFonts();

    // 自己資本比率ボックスを表示する時だけ、その分の1段を見出し行の上に確保する。
    // 非表示の時は元の余白(zoneBottom+7)まで詰めて空白を残さない。
    const equityBoxH = 22;
    const equityBoxTop = zoneBottom + 10;
    const titleBoxTop = showEquityRatio ? equityBoxTop + equityBoxH + 8 : zoneBottom + 7;
    const titleBoxH = 24;
    const titleY = titleBoxTop + 17;
    const svgH = titleBoxTop + titleBoxH + 8;
    const setY = (id, y) => { const el = document.getElementById(id); if (el) el.setAttribute('y', y.toFixed(1)); };
    const setX = (id, x) => { const el = document.getElementById(id); if (el) el.setAttribute('x', x); };
    const setW = (id, w) => { const el = document.getElementById(id); if (el) el.setAttribute('width', w); };
    const setDisplay = (id, show) => { const el = document.getElementById(id); if (el) el.style.display = show ? '' : 'none'; };

    // まず全BSを一旦隠し、選ばれているものだけ後段で表示する
    [1, 2, 3, 4].forEach((n) => { GROUP_IDS[n].forEach((id) => setDisplay(id, false)); });

    const totalWidth = count * currentGroupSpanWidth + (count - 1) * currentGroupGap;
    const startX = (W - totalWidth) / 2;
    const groupX = {};

    visibleGroups.forEach((n, i) => {
      GROUP_IDS[n].forEach((id) => setDisplay(id, true));
      const xAsset = startX + i * (currentGroupSpanWidth + currentGroupGap);
      const xLiab = xAsset + currentBarWidth + currentPairGap;
      groupX[n] = { xAsset, xLiab };
      repositionGroupBars(n, xAsset, xLiab, currentBarWidth);
      const cx = (xAsset + xLiab + currentBarWidth) / 2;
      setX(`title-${n}-box`, xAsset);
      setW(`title-${n}-box`, currentGroupSpanWidth);
      setX(`title-${n}`, cx);
      setY(`title-${n}`, titleY);
      setY(`title-${n}-box`, titleBoxTop);
      setX(`equity-box-${n}`, xAsset);
      setW(`equity-box-${n}`, currentGroupSpanWidth);
      setX(`equity-text-${n}`, cx);
      setY(`equity-box-${n}`, equityBoxTop);
      setY(`equity-text-${n}`, equityBoxTop + 16);
      // 自己資本比率ボックスは「自己資本表示」トグルにも従う(そのBS自体が非表示なら上でまとめて隠れている)
      setDisplay(`equity-box-${n}`, showEquityRatio);
      setDisplay(`equity-text-${n}`, showEquityRatio);
    });

    // 表示中のBS同士の間だけ、矢印を必要な数(最大3本、4組表示時のみ3本)だけ表示する
    const acy = (yTop + yBottom) / 2;
    for (let g = 0; g < 3; g++) {
      const arrow = document.getElementById(`arrow-gap-${g}`);
      if (!arrow) continue;
      if (g < count - 1) {
        const ax = groupX[visibleGroups[g]].xLiab + currentBarWidth + currentGroupGap / 2;
        arrow.setAttribute('points', `${ax - 9},${acy - 13} ${ax - 9},${acy + 13} ${ax + 11},${acy}`);
        arrow.style.display = '';
      } else {
        arrow.style.display = 'none';
      }
    }

    const svg = document.getElementById('bsChart');
    if (svg) svg.setAttribute('viewBox', `0 0 ${W} ${svgH.toFixed(1)}`);
  }

  // 1行に収まらない要素名+金額は、判読できる最小サイズ(6px)まで自動的に縮小して収める。
  // それでも収まらない場合は空白にする(はみ出し・重なりを防ぐため)
  const MIN_FONT_SIZE = 6;
  function fitSingleLine(text, content, maxWidth, startSize) {
    text.textContent = content;
    let size = startSize;
    text.setAttribute('font-size', size);
    while (size > MIN_FONT_SIZE && text.getComputedTextLength() > maxWidth) {
      size -= 1;
      text.setAttribute('font-size', size);
    }
    if (text.getComputedTextLength() > maxWidth) {
      text.textContent = '';
    }
  }

  // 「自己資本比率」のラベルと「%」の単位は、比率の数字本体より小さく表示する
  // (単位は数字より小さく表示する全ページ共通ルールに準拠)。幅に収まらなければ両方を縮小し、
  // それでも収まらなければ空白にする(はみ出し防止)
  function fitEquityRatioText(text, prefix, bigContent, suffix, maxWidth, bigStart, smallStart) {
    let big = bigStart;
    let small = smallStart;
    const render = () => {
      text.innerHTML = `<tspan font-size="${small}">${prefix}</tspan><tspan font-size="${big}" font-weight="bold">${bigContent}</tspan><tspan font-size="${small}">${suffix}</tspan>`;
    };
    render();
    while ((big > MIN_FONT_SIZE || small > MIN_FONT_SIZE) && text.getComputedTextLength() > maxWidth) {
      if (big > MIN_FONT_SIZE) big -= 1;
      if (small > MIN_FONT_SIZE) small -= 1;
      render();
    }
    if (text.getComputedTextLength() > maxWidth) {
      text.textContent = '';
    }
  }

  // 会計上のBS・実質的なBS・将来予測BSそれぞれの上の自己資本比率ボックスを更新する(boxId/textIdで指定)。
  // 純資産がマイナス、または分母の資産合計が0以下になる場合は「債務超過」表記に切り替え、
  // 薄い赤背景+濃い赤文字にして視認性を高める(通常時は薄いブルーグレー背景+濃いブルーグレー文字)。
  // active=falseのとき(未入力時のダミー表示、または「自己資本比率を表示」トグルOFF時)は数値を出さず項目名だけを表示する。
  function updateEquityRatioBox(boxId, textId, netAssetsVal, totalAssetsVal, active) {
    const box = document.getElementById(boxId);
    const text = document.getElementById(textId);
    if (!box || !text) return;
    const maxW = currentGroupSpanWidth - 10;
    const smallSize = Math.max(MIN_FONT_SIZE, equityFontSize - 4);
    if (!active) {
      box.setAttribute('fill', '#e4ebf0');
      box.setAttribute('stroke', '#c3d0d9');
      text.setAttribute('fill', '#3d4f5c');
      fitSingleLine(text, '自己資本比率', maxW, smallSize + 2);
      return;
    }
    const isDebtExcess = netAssetsVal < 0 || totalAssetsVal <= 0;
    if (isDebtExcess) {
      box.setAttribute('fill', '#fbe4e4');
      box.setAttribute('stroke', '#e3b3b3');
      text.setAttribute('fill', '#a02020');
      fitSingleLine(text, '債務超過', maxW, equityFontSize);
    } else {
      const ratio = (netAssetsVal / totalAssetsVal) * 100;
      box.setAttribute('fill', '#e4ebf0');
      box.setAttribute('stroke', '#c3d0d9');
      text.setAttribute('fill', '#3d4f5c');
      fitEquityRatioText(text, '自己資本比率 ', ratio.toFixed(1), '%', maxW, equityFontSize, smallSize);
    }
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
          // 帯が小さく文字が入りきらない場合でも、ポインタを乗せれば要素名・金額を確認できるようにする
          if (showValues && seg.label && seg.value !== 0) {
            rect.setAttribute('data-tip', `${seg.label} ${man(seg.value)}`);
          } else {
            rect.removeAttribute('data-tip');
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
            // 1行に「要素名+金額」(またはforceLabelでなければ金額のみ)を収める。
            // 幅に収まらなければ6pxまで自動縮小し、それでも収まらなければ空白にする
            text.setAttribute('y', (midY + 4).toFixed(1));
            text.setAttribute('font-weight', 'bold');
            fitSingleLine(text, forceLabel ? `${seg.label} ${man(seg.value)}` : man(seg.value), currentBarWidth - 8, 9);
          } else if (showValues && (isNeg || forceLabel) && seg.value !== 0) {
            // マイナス値や「ひとまとめ」表示で帯が小さい場合でも、要素名・金額を見失わないよう帯のすぐ下に表示する
            text.setAttribute('y', (segY + h + 12).toFixed(1));
            text.setAttribute('font-weight', 'bold');
            fitSingleLine(text, `${seg.label} ${man(seg.value)}`, currentBarWidth - 8, 8);
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

    // 簿外資産(準備状況)は表示モードに関わらず常に集計する。
    // 内訳表示のときは、簿外資産を「充当分(生命保険金+その他)」「不足分」に、
    // 簿外負債を「退職金」「自社株買取」「その他」に分けて表示する(色は簿外資産/簿外負債のまま。不足分だけ白背景にする)
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

    // 次世代将来負債(任意入力、未入力は0として扱う)。将来予測実質BSは将来予測BSの数値をそのまま土台にし、
    // その上に簿外資産(=次世代将来負債と自動的に同額)/次世代将来負債を乗せるだけで、2段目の取り崩しは行わない
    // (会計上のBS→実質的なBSの関係と同じ: 実質的なBSも数値は据え置きで、上に簿外資産/将来負債を乗せるだけ)
    const nextFutureLiabTotal = nextFutureLiabTotalNow();

    // 将来予測実質BSの上にも次世代将来負債を積むため、そのゾーンの高さ分もスケールに含めて
    // どんなに次世代将来負債が大きくてもグラフ上端をはみ出さないようにする。
    // 純資産・固定資産等が取り崩され尽くしてマイナスになった項目は下向きの帯に積まれ上向きの高さに寄与しないため、
    // 上向きに積まれる高さの見積もりには正の成分だけを合算する(そうしないと簿外ゾーンの高さを過小評価してしまう)。
    // 資産側・負債側で別々に見積もって大きい方を基準にする(取り崩し後は資産合計と負債合計が一致しなくなるため)
    const positiveTriggeredAssets = Math.max(otherAssetsTriggered, 0) + Math.max(fixedAssetsTriggered, 0) + Math.max(curAssetsTriggered, 0);
    const positiveTriggeredLiab = Math.max(netAssetsTriggered, 0) + fields.fixedLiab.value + fields.curLiab.value;
    const triggeredStackMax = Math.max(positiveTriggeredAssets, positiveTriggeredLiab) + nextFutureLiabTotal;
    const maxTotal = Math.max(totalAdjusted, triggeredStackMax, 1);
    const pxPerYen = plotH / maxTotal;

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
          { label: '自社株買取', value: fields.succession.value, offBalance: true, assetSide: false },
          { label: 'その他', value: fields.otherFuture.value, offBalance: true, assetSide: false },
        ]
      : [
          { label: '将来負債', value: futureLiabTotal, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
        ];

    // 簿外資産/将来負債(将来予測BSの数値の上に載せるゾーン。チャート上は「次世代」を付けずグループ2と同じ表記にする)。
    // 簿外資産側の値は自動的に次世代将来負債の合計と同額にする(生命保険等の充当区分は無いため常に1本)
    const nextOffBalanceAssetSegs = [
      { label: '簿外資産', value: nextFutureLiabTotal, offBalance: true, assetSide: true },
    ];
    const nextOffBalanceLiabSegs = detailMode
      ? [
          { label: '退職金', value: num('nextRetirement').value, offBalance: true, assetSide: false },
          { label: '自社株買取', value: num('nextSuccession').value, offBalance: true, assetSide: false },
          { label: 'その他', value: num('nextOtherFuture').value, offBalance: true, assetSide: false },
        ]
      : [
          { label: '将来負債', value: nextFutureLiabTotal, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
          { label: '', value: 0, offBalance: true, assetSide: false },
        ];
    // detailMode時、次世代将来負債の各項目が未入力(NaN)だと積み上げが崩れるため0に補正する
    nextOffBalanceLiabSegs.forEach((seg) => { if (isNaN(seg.value)) seg.value = 0; });

    const assetsAdjusted = assetsBase.concat(offBalanceAssetSegs);
    const liabNetAdjusted = liabNetBase.concat(offBalanceLiabSegs);
    // 将来予測実質BS = 将来予測BSの数値(assetsTriggered/liabNetTriggered)をそのまま土台にし、次世代将来負債を上に乗せるだけ
    const assetsFinalAdjusted = assetsTriggered.concat(nextOffBalanceAssetSegs);
    const liabNetFinalAdjusted = liabNetTriggered.concat(nextOffBalanceLiabSegs);

    updateChart({
      a1: assetsBase, l1: liabNetBase,
      a2: assetsAdjusted, l2: liabNetAdjusted,
      a3: assetsTriggered, l3: liabNetTriggered,
      a4: assetsFinalAdjusted, l4: liabNetFinalAdjusted,
    }, pxPerYen, true);

    // 将来予測BS(取り崩し後)の自己資本比率 = 予測後の純資産 ÷ 予測後の資産合計
    const predictedTotalAssets = otherAssetsTriggered + fixedAssetsTriggered + curAssetsTriggered;
    // 将来予測実質BSの自己資本比率 = 将来予測BSの純資産 ÷ (次世代簿外資産+将来予測BSの資産合計)
    // (実質的なBSが会計上のBSの数値+簿外資産で計算するのと同じ考え方)
    const predictedTotalAdjusted = predictedTotalAssets + nextFutureLiabTotal;
    // 会計上のBS: 自己資本比率 = 純資産 ÷ 資産。実質的なBS: 純資産 ÷ (簿外資産+資産)(将来負債への備えを資産に含めた実質ベース)
    updateEquityRatioBox('equity-box-1', 'equity-text-1', netAssets, totalBase, true);
    updateEquityRatioBox('equity-box-2', 'equity-text-2', netAssets, totalAdjusted, true);
    updateEquityRatioBox('equity-box-3', 'equity-text-3', netAssetsTriggered, predictedTotalAssets, true);
    updateEquityRatioBox('equity-box-4', 'equity-text-4', netAssetsTriggered, predictedTotalAdjusted, true);
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
        { label: '自社株買取', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false },
        { label: 'その他', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false }],
      a3: [dummySeg('その他資産'), dummySeg('固定資産'), dummySeg('流動資産')],
      l3: [dummySeg('純資産'), dummySeg('固定負債'), dummySeg('流動負債')],
      a4: [dummySeg('その他資産'), dummySeg('固定資産'), dummySeg('流動資産'),
        { label: '簿外資産', value: DUMMY_VALUE, offBalance: true, assetSide: true }],
      l4: [dummySeg('純資産'), dummySeg('固定負債'), dummySeg('流動負債'),
        { label: '退職金', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false },
        { label: '自社株買取', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false },
        { label: 'その他', value: DUMMY_VALUE / 3, offBalance: true, assetSide: false }],
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
        a4: [blank, assetDummy, blank, dummySeg('簿外資産', true, true)],
        l4: [netAssetsDummy, liabDummy, blank, dummySeg('将来負債', true, false), blank, blank],
      };
    })();
    const pxPerYen = plotH / (DUMMY_VALUE * 4);
    updateChart(dataByBar, pxPerYen, false, true);
    updateEquityRatioBox('equity-box-1', 'equity-text-1', null, null, false);
    updateEquityRatioBox('equity-box-2', 'equity-text-2', null, null, false);
    updateEquityRatioBox('equity-box-3', 'equity-text-3', null, null, false);
    updateEquityRatioBox('equity-box-4', 'equity-text-4', null, null, false);
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
    // 次世代将来負債(任意入力)もanyEmptyの対象にはしないが、桁あふれチェックだけは同様に行う。
    const overflowFields = Object.entries(fields).concat(NEXT_FUTURE_LIAB_IDS.map((id) => [id, num(id)]));
    for (const [key, field] of overflowFields) {
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

  // 送信ボタンは廃止。入力中(1文字ごと)にグラフが再描画されると、12000を打つ途中で
  // 1→12→120→1200→12000と値が何度も変わって見えてしまうため、グラフの再計算は
  // 入力が確定したタイミング(blur/Enterによるchange)でのみ行う。
  form.addEventListener('submit', function (e) { e.preventDefault(); recompute(); });
  form.addEventListener('change', function () { recompute(); });

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

  // ===== グラフの帯が小さく文字が入りきらない要素でも、ポインタを乗せれば要素名・金額が分かるツールチップ。
  //       rect要素はinitChartOnce()で1度だけ作られ以後は使い回されるため、個々にリスナーを付け直す必要がなく、
  //       #bsChart自体に1つだけイベント委任すれば済む(hover対象はupdateChart側でdata-tip属性を都度更新する) =====
  const chartTooltip = document.getElementById('chartTooltip');
  const bsChartEl = document.getElementById('bsChart');
  if (chartTooltip && bsChartEl) {
    const positionTooltip = (evt) => {
      chartTooltip.style.left = `${evt.clientX + 14}px`;
      chartTooltip.style.top = `${evt.clientY + 14}px`;
    };
    bsChartEl.addEventListener('mouseover', (evt) => {
      const tip = evt.target.getAttribute && evt.target.getAttribute('data-tip');
      if (!tip) return;
      chartTooltip.textContent = tip;
      chartTooltip.classList.add('is-visible');
      positionTooltip(evt);
    });
    bsChartEl.addEventListener('mousemove', (evt) => {
      if (chartTooltip.classList.contains('is-visible')) positionTooltip(evt);
    });
    bsChartEl.addEventListener('mouseout', (evt) => {
      if (evt.target.getAttribute && evt.target.getAttribute('data-tip')) {
        chartTooltip.classList.remove('is-visible');
      }
    });
  }

  // ===== 初期表示: 保存済みデータがあれば復元し、自動試算 =====
  loadSavedValues();
  updateBalanceCheck();
  updateFutureLiabTotal();
  updateOffBalanceAsset(); // 読み込んだ将来負債・生命保険金額をもとに不足分を計算し直す
  updateNextFutureLiabTotal(); // 読み込んだ次世代将来負債の合計表示も復元後の値で計算し直す
  recompute();
});

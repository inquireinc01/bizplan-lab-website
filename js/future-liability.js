document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('futureLiabForm');
  if (!form) return;

  const resultArea = document.getElementById('flResultArea');
  const errorArea = document.getElementById('flErrorArea');
  let lastResult = null;

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
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    form.querySelectorAll('input[id]').forEach(function (el) {
      if (el.value !== '') data[el.id] = el.value;
    });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  const BS_CHECK_IDS = ['curAssets', 'fixedAssets', 'otherAssets', 'curLiab', 'fixedLiab', 'netAssets'];
  const FUTURE_LIAB_IDS = ['retirement', 'succession', 'otherFuture'];

  function updateBalanceCheck() {
    const v = {};
    for (const id of BS_CHECK_IDS) v[id] = num(id).value;

    const totalAssets = (v.curAssets || 0) + (v.fixedAssets || 0) + (v.otherAssets || 0);
    const totalLiabNet = (v.curLiab || 0) + (v.fixedLiab || 0) + (v.netAssets || 0);

    document.getElementById('checkTotalAssets').textContent = man(isNaN(totalAssets) ? 0 : totalAssets);
    document.getElementById('checkTotalLiabNet').textContent = man(isNaN(totalLiabNet) ? 0 : totalLiabNet);

    const statusEl = document.getElementById('checkBalanceStatus');
    const anyEmpty = BS_CHECK_IDS.some((id) => isNaN(num(id).value));
    if (anyEmpty) {
      statusEl.textContent = '-';
      statusEl.className = 'font-bold text-gray-400';
    } else if (Math.abs(totalAssets - totalLiabNet) < 0.5) {
      statusEl.textContent = '✓ 一致しています';
      statusEl.className = 'font-bold text-[#3b6ea5]';
    } else {
      statusEl.textContent = `✗ 差額 ${man(Math.abs(totalAssets - totalLiabNet))}`;
      statusEl.className = 'font-bold text-[#a83d3d]';
    }
  }

  function updateFutureLiabTotal() {
    const total = FUTURE_LIAB_IDS.reduce((s, id) => {
      const v = num(id).value;
      return s + (isNaN(v) ? 0 : v);
    }, 0);
    document.getElementById('checkFutureLiabTotal').textContent = man(total);
  }

  BS_CHECK_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateBalanceCheck);
  });
  FUTURE_LIAB_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateFutureLiabTotal);
  });
  updateBalanceCheck();
  updateFutureLiabTotal();

  // グラフは値が変わった時になめらかにアニメーションするよう、rect/text要素を
  // 毎回作り直さず既存要素のy/height/textContentだけを更新する
  // (CSSの transition で余韻を持たせる。style.cssの#bsChart rect参照)。
  // 未入力(NaN)の項目があるときは、エラーにせず全要素同じ高さのダミーBSを表示し、
  // 実数値が揃うとアニメーションしながら正確な比率に切り替わる。
  const W = 700, H = 420;
  const yBottom = 340;
  const yTop = 30;
  const plotH = yBottom - yTop;
  const barWidth = 92;
  const groupGap = 70;
  const pairGap = 22;
  // 4本のバー(barWidth×4 + pairGap×2 + groupGap)がW(700)の中央に来るよう左端を計算する
  const totalBarsWidth = barWidth * 4 + pairGap * 2 + groupGap;
  const xAsset1 = (W - totalBarsWidth) / 2;
  const xLiab1 = xAsset1 + barWidth + pairGap;
  const xAsset2 = xLiab1 + barWidth + groupGap;
  const xLiab2 = xAsset2 + barWidth + pairGap;
  const DUMMY_VALUE = 25; // ダミー表示用の共通仮値(万円換算は意味を持たない)

  function segColor(label) {
    const map = {
      '流動資産': '#7ba7cc', '固定資産': '#3b6ea5', 'その他資産': '#5c7a94',
      '流動負債': '#d3a878', '固定負債': '#a5703a', '純資産': '#9aa1ab',
    };
    return map[label] || '#5c636e';
  }
  // 簿外セグメント: 資産側(準備必要額)は淡いグリーン、負債側(将来負債)は既存の赤系のまま
  function offBalanceStyle(assetSide) {
    return assetSide
      ? { fill: '#5c8272', opacity: 0.25, text: '#3f5a4d' }
      : { fill: '#a83d3d', opacity: 0.3, text: '#832f2f' };
  }

  const BAR_DEFS = {
    a1: { x: xAsset1, segs: [{ label: '流動資産' }, { label: '固定資産' }, { label: 'その他資産' }] },
    l1: { x: xLiab1, segs: [{ label: '流動負債' }, { label: '固定負債' }, { label: '純資産' }] },
    a2: { x: xAsset2, segs: [{ label: '流動資産' }, { label: '固定資産' }, { label: 'その他資産' }, { offBalance: true, assetSide: true }] },
    l2: { x: xLiab2, segs: [{ label: '流動負債' }, { label: '固定負債' }, { label: '純資産' }, { offBalance: true, assetSide: false }] },
  };

  let chartInitialized = false;
  function initChartOnce() {
    if (chartInitialized) return;
    const svg = document.getElementById('bsChart');
    let svgOut = `<line x1="30" y1="${yBottom}" x2="${W - 20}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`;

    Object.entries(BAR_DEFS).forEach(([barKey, def]) => {
      def.segs.forEach((seg, i) => {
        const attrs = seg.offBalance
          ? (() => { const s = offBalanceStyle(seg.assetSide); return `fill="${s.fill}" fill-opacity="${s.opacity}" stroke="${s.fill}" stroke-width="1.5" stroke-dasharray="4,3"`; })()
          : `fill="${segColor(seg.label)}"`;
        svgOut += `<rect id="bs-${barKey}-${i}" x="${def.x}" y="${yBottom}" width="${barWidth}" height="0" ${attrs}/>`;
      });
      def.segs.forEach((seg, i) => {
        const textColor = seg.offBalance ? offBalanceStyle(seg.assetSide).text : (seg.label === '流動負債' || seg.label === '純資産' ? '#2b2f36' : '#fff');
        svgOut += `<text id="bs-${barKey}-t${i}" x="${def.x + barWidth / 2}" y="${yBottom}" font-size="11" fill="${textColor}" text-anchor="middle"></text>`;
      });
      svgOut += `<text id="bs-${barKey}-total" x="${def.x + barWidth / 2}" y="${yBottom}" font-size="12" font-weight="bold" fill="#2b2f36" text-anchor="middle"></text>`;
    });

    // 列ラベル・グループ見出し(値が変わっても位置は不変のため静的に1度だけ描画)
    svgOut += `<text x="${xAsset1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;
    svgOut += `<text x="${xAsset2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;
    svgOut += `<text x="${(xAsset1 + xLiab1 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">会計上のBS</text>`;
    svgOut += `<text x="${(xAsset2 + xLiab2 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">実質的なBS</text>`;

    svg.innerHTML = svgOut;
    chartInitialized = true;
  }

  // showValues=false のときはダミー(仮)表示: 数字ラベルは出さない
  function updateChart(dataByBar, pxPerYen, showValues) {
    initChartOnce();
    Object.entries(dataByBar).forEach(([barKey, segments]) => {
      let y = yBottom;
      let total = 0;
      segments.forEach((seg, i) => {
        const h = Math.max(0, seg.value * pxPerYen);
        const segY = y - h;
        const rect = document.getElementById(`bs-${barKey}-${i}`);
        if (rect) {
          rect.setAttribute('y', segY.toFixed(1));
          rect.setAttribute('height', h.toFixed(1));
        }
        const text = document.getElementById(`bs-${barKey}-t${i}`);
        if (text) {
          if (showValues && h > 20) {
            text.setAttribute('y', (segY + h / 2 + 4).toFixed(1));
            text.textContent = man(seg.value);
          } else {
            text.textContent = '';
          }
        }
        total += seg.value;
        y = segY;
      });
      const totalText = document.getElementById(`bs-${barKey}-total`);
      if (totalText) {
        if (showValues) {
          totalText.setAttribute('y', (yBottom - total * pxPerYen - 8).toFixed(1));
          totalText.textContent = man(total);
        } else {
          totalText.textContent = '';
        }
      }
    });
  }

  function drawBalanceSheetChart(assetsBase, liabNetBase, futureLiabTotal) {
    const totalBase = assetsBase.reduce((s, x) => s + x.value, 0); // = liabNetBase total
    const totalAdjusted = totalBase + futureLiabTotal;
    const maxTotal = Math.max(totalAdjusted, 1);
    const pxPerYen = plotH / maxTotal;

    const assetsAdjusted = assetsBase.concat([{ label: '簿外資産(準備必要額)', value: futureLiabTotal, offBalance: true }]);
    const liabNetAdjusted = liabNetBase.concat([{ label: '将来負債(簿外)', value: futureLiabTotal, offBalance: true }]);

    updateChart({ a1: assetsBase, l1: liabNetBase, a2: assetsAdjusted, l2: liabNetAdjusted }, pxPerYen, true);
  }

  // 未入力時: 8要素(流動資産/固定資産/その他資産/流動負債/固定負債/純資産/簿外資産/簿外負債)を
  // すべて同じ高さのダミーBSとして表示する(数字ラベルなし)
  function drawDummyChart() {
    const dummySeg = (label, offBalance) => ({ label, value: DUMMY_VALUE, offBalance: !!offBalance });
    const dataByBar = {
      a1: [dummySeg('流動資産'), dummySeg('固定資産'), dummySeg('その他資産')],
      l1: [dummySeg('流動負債'), dummySeg('固定負債'), dummySeg('純資産')],
      a2: [dummySeg('流動資産'), dummySeg('固定資産'), dummySeg('その他資産'), dummySeg('簿外資産', true)],
      l2: [dummySeg('流動負債'), dummySeg('固定負債'), dummySeg('純資産'), dummySeg('簿外負債', true)],
    };
    const pxPerYen = plotH / (DUMMY_VALUE * 4);
    updateChart(dataByBar, pxPerYen, false);
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
    if (Math.abs(totalAssets - totalLiabNet) > 0.5) {
      balanceNote.textContent = '※ 総資産と負債・純資産合計が一致していません。入力内容をご確認ください。';
      balanceNote.classList.remove('hidden');
    } else {
      balanceNote.classList.add('hidden');
    }

    const assetsBase = [
      { label: '流動資産', value: fields.curAssets.value },
      { label: '固定資産', value: fields.fixedAssets.value },
      { label: 'その他資産', value: fields.otherAssets.value },
    ];
    const liabNetBase = [
      { label: '流動負債', value: fields.curLiab.value },
      { label: '固定負債', value: fields.fixedLiab.value },
      { label: '純資産', value: netAssets },
    ];
    drawBalanceSheetChart(assetsBase, liabNetBase, futureLiabTotal);

    lastResult = { fields, totalAssets, totalLiabNet, futureLiabTotal, netAssets, ratio, remaining };

    resultArea.classList.remove('hidden');
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
  recompute();
});

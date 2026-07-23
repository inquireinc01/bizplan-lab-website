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

  // グラフは数字ラベルを付けず(凡例のみで判別)、値が変わった時になめらかに
  // アニメーションするよう、rect要素を毎回作り直さず既存要素のy/heightだけを
  // 更新する(CSSの transition で余韻を持たせる。style.cssの#bsChart rect参照)。
  const W = 700, H = 420;
  const yBottom = 340;
  const yTop = 30;
  const plotH = yBottom - yTop;
  const barWidth = 92;
  const groupGap = 70;
  const pairGap = 22;
  const xAsset1 = 45;
  const xLiab1 = xAsset1 + barWidth + pairGap;
  const xAsset2 = xLiab1 + barWidth + groupGap;
  const xLiab2 = xAsset2 + barWidth + pairGap;

  function segColor(label) {
    const map = {
      '流動資産': '#1c3f68', '固定資産': '#0f2a4a', 'その他資産': '#091a30',
      '流動負債': '#c7ccd3', '固定負債': '#8d97a3', '純資産': '#3b6ea5',
    };
    return map[label] || '#5c636e';
  }

  let chartInitialized = false;
  function initChartOnce() {
    if (chartInitialized) return;
    const svg = document.getElementById('bsChart');
    let svgOut = `<line x1="30" y1="${yBottom}" x2="${W - 20}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`;

    function barRects(barKey, x, segKeys) {
      let out = '';
      segKeys.forEach((seg, i) => {
        const attrs = seg.offBalance
          ? `fill="#a83d3d" fill-opacity="0.3" stroke="#a83d3d" stroke-width="1.5" stroke-dasharray="4,3"`
          : `fill="${segColor(seg.label)}"`;
        out += `<rect id="bs-${barKey}-${i}" x="${x}" y="${yBottom}" width="${barWidth}" height="0" ${attrs}/>`;
      });
      return out;
    }

    svgOut += barRects('a1', xAsset1, [{ label: '流動資産' }, { label: '固定資産' }, { label: 'その他資産' }]);
    svgOut += barRects('l1', xLiab1, [{ label: '流動負債' }, { label: '固定負債' }, { label: '純資産' }]);
    svgOut += barRects('a2', xAsset2, [{ label: '流動資産' }, { label: '固定資産' }, { label: 'その他資産' }, { offBalance: true }]);
    svgOut += barRects('l2', xLiab2, [{ label: '流動負債' }, { label: '固定負債' }, { label: '純資産' }, { offBalance: true }]);

    // 列ラベル・グループ見出し(値が変わっても位置は不変のため静的に1度だけ描画)
    svgOut += `<text x="${xAsset1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;
    svgOut += `<text x="${xAsset2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;
    svgOut += `<text x="${(xAsset1 + xLiab1 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">① 会計上のバランスシート</text>`;
    svgOut += `<text x="${(xAsset2 + xLiab2 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">② 将来負債(簿外)を計上した実質バランスシート</text>`;

    svg.innerHTML = svgOut;
    chartInitialized = true;
  }

  function drawBalanceSheetChart(assetsBase, liabNetBase, futureLiabTotal) {
    initChartOnce();

    const totalBase = assetsBase.reduce((s, x) => s + x.value, 0); // = liabNetBase total
    const totalAdjusted = totalBase + futureLiabTotal;
    const maxTotal = Math.max(totalAdjusted, 1);
    const pxPerYen = plotH / maxTotal;

    const assetsAdjusted = assetsBase.concat([{ label: '簿外資産(準備必要額)', value: futureLiabTotal, offBalance: true }]);
    const liabNetAdjusted = liabNetBase.concat([{ label: '将来負債(簿外)', value: futureLiabTotal, offBalance: true }]);

    function updateBar(barKey, segments) {
      let y = yBottom;
      segments.forEach((seg, i) => {
        const h = Math.max(0, seg.value * pxPerYen);
        const segY = y - h;
        const rect = document.getElementById(`bs-${barKey}-${i}`);
        if (rect) {
          rect.setAttribute('y', segY.toFixed(1));
          rect.setAttribute('height', h.toFixed(1));
        }
        y = segY;
      });
    }

    updateBar('a1', assetsBase);
    updateBar('l1', liabNetBase);
    updateBar('a2', assetsAdjusted);
    updateBar('l2', liabNetAdjusted);
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

    for (const [key, field] of Object.entries(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください(未入力の場合は0を入力してください)。');
        field.el.focus();
        return;
      }
      if (Math.abs(field.value) > MAX_VALUE) {
        showError(`入力できる金額は ${man(MAX_VALUE)} までです。数値をご確認ください。`);
        field.el.focus();
        return;
      }
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

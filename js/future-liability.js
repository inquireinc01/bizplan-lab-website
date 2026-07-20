document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('futureLiabForm');
  if (!form) return;

  const resultArea = document.getElementById('flResultArea');
  const errorArea = document.getElementById('flErrorArea');
  let suppressScroll = false;

  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat((el.value || '').replace(/,/g, ''));
    return { value: v, el };
  };

  const man = (n) => Math.round(n).toLocaleString('ja-JP') + '万円';

  const showError = (msg) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
  };

  const BS_CHECK_IDS = ['curAssets', 'fixedAssets', 'otherAssets', 'curLiab', 'fixedLiab', 'netAssets'];

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

  BS_CHECK_IDS.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateBalanceCheck);
  });
  updateBalanceCheck();

  function drawBalanceSheetChart(assetsBase, liabNetBase, futureLiabTotal) {
    const svg = document.getElementById('bsChart');
    const W = 700, H = 420;
    const yBottom = 340;
    const yTop = 30;
    const plotH = yBottom - yTop;
    const barWidth = 92;

    const totalBase = assetsBase.reduce((s, x) => s + x.value, 0); // = liabNetBase total
    const totalAdjusted = totalBase + futureLiabTotal;
    const maxTotal = Math.max(totalAdjusted, 1);
    const pxPerYen = plotH / maxTotal;

    // 簿外セグメント(将来負債/準備資産)を追加した実質版セグメント
    const assetsAdjusted = assetsBase.concat([{ label: '簿外資産(準備必要額)', value: futureLiabTotal, offBalance: true }]);
    const liabNetAdjusted = liabNetBase.concat([{ label: '将来負債(簿外)', value: futureLiabTotal, offBalance: true }]);

    const groupGap = 70;
    const pairGap = 22;
    const xAsset1 = 45;
    const xLiab1 = xAsset1 + barWidth + pairGap;
    const xAsset2 = xLiab1 + barWidth + groupGap;
    const xLiab2 = xAsset2 + barWidth + pairGap;

    let svgOut = '';

    function segColor(label, offBalance) {
      if (offBalance) return null; // handled separately (striped)
      const map = {
        '流動資産': '#1c3f68', '固定資産': '#0f2a4a', 'その他資産': '#091a30',
        '流動負債': '#c7ccd3', '固定負債': '#8d97a3', '純資産': '#3b6ea5',
      };
      return map[label] || '#5c636e';
    }

    function drawBar(x, segments) {
      let y = yBottom;
      let out = '';
      segments.forEach((seg) => {
        const h = Math.max(0, seg.value * pxPerYen);
        const segY = y - h;
        if (seg.offBalance) {
          out += `<rect x="${x}" y="${segY.toFixed(1)}" width="${barWidth}" height="${h.toFixed(1)}" fill="#a83d3d" fill-opacity="0.3" stroke="#a83d3d" stroke-width="1.5" stroke-dasharray="4,3"/>`;
        } else {
          out += `<rect x="${x}" y="${segY.toFixed(1)}" width="${barWidth}" height="${h.toFixed(1)}" fill="${segColor(seg.label)}"/>`;
        }
        if (h > 20) {
          const textColor = seg.offBalance ? '#832f2f' : (['流動負債'].includes(seg.label) ? '#2b2f36' : '#fff');
          out += `<text x="${x + barWidth / 2}" y="${(segY + h / 2 + 4).toFixed(1)}" font-size="11" fill="${textColor}" text-anchor="middle">${man(seg.value)}</text>`;
        }
        y = segY;
      });
      const total = segments.reduce((s, seg) => s + seg.value, 0);
      out += `<text x="${x + barWidth / 2}" y="${(yBottom - total * pxPerYen - 8).toFixed(1)}" font-size="12" font-weight="bold" fill="#2b2f36" text-anchor="middle">${man(total)}</text>`;
      return out;
    }

    svgOut += `<line x1="30" y1="${yBottom}" x2="${W - 20}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`;

    svgOut += drawBar(xAsset1, assetsBase);
    svgOut += drawBar(xLiab1, liabNetBase);
    svgOut += drawBar(xAsset2, assetsAdjusted);
    svgOut += drawBar(xLiab2, liabNetAdjusted);

    // 列ラベル
    svgOut += `<text x="${xAsset1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab1 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;
    svgOut += `<text x="${xAsset2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">資産</text>`;
    svgOut += `<text x="${xLiab2 + barWidth / 2}" y="${yBottom + 20}" font-size="11" fill="#6b6b6f" text-anchor="middle">負債・純資産</text>`;

    // グループ見出し
    svgOut += `<text x="${(xAsset1 + xLiab1 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">① 会計上のバランスシート</text>`;
    svgOut += `<text x="${(xAsset2 + xLiab2 + barWidth) / 2}" y="${yBottom + 42}" font-size="13" font-weight="bold" fill="#0f2a4a" text-anchor="middle">② 将来負債(簿外)を計上した実質バランスシート</text>`;

    svg.innerHTML = svgOut;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
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

    for (const [key, field] of Object.entries(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください(未入力の場合は0を入力してください)。');
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

    document.getElementById('flRemainingBig').textContent = man(remaining);
    document.getElementById('flRatio').textContent = ratio === null ? '算出不可' : ratio.toFixed(1) + ' %';

    lastResult = { fields, totalAssets, totalLiabNet, futureLiabTotal, netAssets, ratio, remaining };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.getElementById('flResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      resultArea.classList.add('hidden');
      clearError();
    });
  }

  // ===== PDF出力 =====
  let lastResult = null;
  function doPrint() {
      if (!lastResult) {
        showError('先に「確認する」を押して結果を表示してください。');
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

  // ===== 初期表示: ダミー値で自動試算(スクロールは抑制) =====
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

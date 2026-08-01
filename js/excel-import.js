document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'bpl_financial_statements_v1';
  const SECTIONS = window.BPL_IMPORT_SECTIONS || {};
  const PERIODS = ['3', '2', '1']; // 3期前, 2期前, 直前期

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function normalizeLabel(s) {
    return (s || '')
      .toString()
      .replace(/[\s　]/g, '')
      .replace(/[()（）]/g, '')
      .trim();
  }

  function parseNumberCell(s) {
    if (s === undefined || s === null) return '';
    const cleaned = s.toString().replace(/[,，円\s]/g, '');
    if (cleaned === '' || cleaned === '-') return '';
    const v = parseFloat(cleaned);
    return isNaN(v) ? '' : v;
  }

  // ===== 貼り付け機能 =====
  document.querySelectorAll('.js-paste-apply').forEach((btn) => {
    const sectionKey = btn.dataset.section;
    const sec = SECTIONS[sectionKey];
    if (!sec) return;
    const textarea = document.getElementById('paste_' + sectionKey);
    const previewEl = document.getElementById('preview_' + sectionKey);

    const updatePreview = () => {
      const lines = textarea.value.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      previewEl.textContent = lines.length > 0
        ? `${lines.length}行を検出(想定: ${sec.items.length}行)`
        : '';
    };
    textarea.addEventListener('input', updatePreview);

    btn.addEventListener('click', function () {
      const lines = textarea.value.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      if (lines.length === 0) return;

      const data = loadStorage();
      let appliedCount = 0;

      lines.forEach((line, i) => {
        if (i >= sec.items.length) return; // 想定行数を超えた分は無視
        const cells = line.split('\t').map((c) => c.trim());
        // 末尾から3つのセルを 3期前/2期前/直前期 とみなす(先頭に科目名列があってもなくても対応)
        const values = cells.slice(-3);
        while (values.length < 3) values.unshift('');
        const field = sec.items[i][1];
        PERIODS.forEach((period, idx) => {
          const v = parseNumberCell(values[idx]);
          const key = `${sectionKey}_${field}_${period}`;
          if (v !== '') {
            data[key] = String(v);
            appliedCount++;
          }
        });
      });

      saveStorage(data);
      const msg = document.getElementById('pasteAppliedMsg');
      msg.textContent = `「${sec.title}」の内容を反映しました(${appliedCount}件)。`;
      msg.classList.remove('hidden');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // ===== ファイルアップロード機能(ocrdataシート固定レイアウト読込) =====
  // [開始行, 終了行(含む), 対象行リスト] はSECTIONの items 順と対応させる
  const CELL_MAP = {
    bsA: { labelCol: 'B', cols: ['C', 'D', 'E'], rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 40, 42] },
    bsL: { labelCol: 'H', cols: ['I', 'J', 'K'], rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 26, 27, 29, 31, 32, 33, 34, 36, 37, 38, 39, 40, 42, 44] },
    pl: { labelCol: 'O', cols: ['P', 'Q', 'R'], rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 28, 30, 31, 32, 34, 35, 37] },
    sga: { labelCol: 'U', cols: ['V', 'W', 'X'], rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 28] },
    mfg: { labelCol: 'U', cols: ['V', 'W', 'X'], rows: [34, 35, 36, 37, 38, 39, 40, 42] },
  };

  const fileInput = document.getElementById('xlsxFileInput');
  const fileStatus = document.getElementById('xlsxFileStatus');
  const previewArea = document.getElementById('xlsxPreviewArea');
  const previewSummary = document.getElementById('xlsxPreviewSummary');
  const applyBtn = document.getElementById('xlsxApplyBtn');
  const xlsxErrorArea = document.getElementById('xlsxErrorArea');

  let pendingImportData = null;

  function showXlsxError(msg) {
    xlsxErrorArea.textContent = msg;
    xlsxErrorArea.classList.remove('hidden');
    previewArea.classList.add('hidden');
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      if (!file) return;
      xlsxErrorArea.classList.add('hidden');
      fileStatus.textContent = `${file.name} を読み込み中...`;

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          let sheetName = workbook.SheetNames.find((n) => n.toLowerCase() === 'ocrdata');
          if (!sheetName) sheetName = workbook.SheetNames[0];
          const ws = workbook.Sheets[sheetName];

          const result = {};
          let matched = 0;
          Object.keys(SECTIONS).forEach((sectionKey) => {
            const sec = SECTIONS[sectionKey];
            const map = CELL_MAP[sectionKey];
            if (!map) return;
            sec.items.forEach((item, i) => {
              const row = map.rows[i];
              if (row === undefined) return;
              const field = item[1];
              PERIODS.forEach((period, colIdx) => {
                const cellAddr = map.cols[colIdx] + row;
                const cell = ws[cellAddr];
                const v = cell ? parseNumberCell(cell.v) : '';
                if (v !== '') {
                  result[`${sectionKey}_${field}_${period}`] = String(v);
                  matched++;
                }
              });
            });
          });

          if (matched === 0) {
            showXlsxError('該当するデータが見つかりませんでした。「ocrdata」シートを含むファイルかご確認ください。');
            fileStatus.textContent = '';
            return;
          }

          pendingImportData = result;
          fileStatus.textContent = `${file.name}(シート: ${sheetName})`;
          previewSummary.textContent = `${matched}件のデータを検出しました。内容を確認のうえ「決算書情報に反映する」を押してください。`;
          previewArea.classList.remove('hidden');
        } catch (err) {
          showXlsxError('ファイルの読み込みに失敗しました。Excel形式(.xlsx)のファイルかご確認ください。');
          fileStatus.textContent = '';
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      if (!pendingImportData) return;
      const data = loadStorage();
      Object.assign(data, pendingImportData);
      saveStorage(data);
      previewSummary.textContent = '決算書情報に反映しました。';
      applyBtn.disabled = true;
      applyBtn.classList.add('opacity-50');
    });
  }

  // ===== シート丸ごと貼り付け =====
  // 科目名の表記ゆれ辞書(正規化後の文字列 → SECTIONSの正式ラベル)
  const LABEL_SYNONYMS = {
    '現金及び預金': '現金・預金', '現金預金': '現金・預金',
    '棚卸資産': '商品・棚卸資産', '商品': '商品・棚卸資産',
    '資産合計': '資産合計(総資産)', '総資産': '資産合計(総資産)', '資産の部合計': '資産合計(総資産)',
    '負債の部合計': '負債合計',
    '純資産の部合計': '純資産合計',
    '負債純資産合計': '負債・純資産合計', '負債及び純資産合計': '負債・純資産合計', '負債・純資産の部合計': '負債・純資産合計',
    '1年以内返済長期借入金': '1年以内長期借入金', '一年以内長期借入金': '1年以内長期借入金', '一年以内返済長期借入金': '1年以内長期借入金',
    '1年以内償還予定社債': '1年以内償還社債', '一年以内償還社債': '1年以内償還社債',
    '販売費及び一般管理費': '販売費・一般管理費', '販管費': '販売費・一般管理費',
    '受取利息及び配当金': '受取利息・配当金', '受取利息配当金': '受取利息・配当金',
    '税引前当期純利益': '税引前当期利益',
    '法人税住民税及び事業税': '法人税等', '法人税等合計': '法人税等',
    '期首商品棚卸高': '期首棚卸高', '期末商品棚卸高': '期末棚卸高',
    '仕入高': '当期商品仕入高', '当期仕入高': '当期商品仕入高',
    '給料手当': '従業員給与', '給与手当': '従業員給与', '従業員給料': '従業員給与',
    '地代家賃': '地代・家賃',
    '支払保険料': '保険料',
    '長期借入金銀行': '長期借入金',
  };

  function parseStrictNumber(s) {
    if (s === undefined || s === null) return '';
    let t = s.toString().replace(/[,，\s　円¥\\]/g, '');
    if (t === '' || t === '-') return '';
    let neg = false;
    if (/^[△▲]/.test(t)) { neg = true; t = t.slice(1); }
    const paren = t.match(/^\((.+)\)$/) || t.match(/^（(.+)）$/);
    if (paren) { neg = true; t = paren[1]; }
    if (!/^-?\d+(\.\d+)?$/.test(t)) return '';
    const v = parseFloat(t);
    return isNaN(v) ? '' : (neg ? -v : v);
  }

  (function initWholePaste() {
    const input = document.getElementById('wholePasteInput');
    if (!input) return;
    const previewWrap = document.getElementById('wholePastePreview');
    const summaryEl = document.getElementById('wholePasteSummary');
    const detailEl = document.getElementById('wholePasteDetail');
    const unmatchedEl = document.getElementById('wholePasteUnmatched');
    const applyBtn2 = document.getElementById('wholePasteApply');
    const clearBtn2 = document.getElementById('wholePasteClear');
    const errorEl = document.getElementById('wholePasteError');

    // 正規化ラベル → [{prefix, label, sectionTitle}] (同名科目は販管費→製造原価の順で消費)
    const labelTargets = {};
    Object.keys(SECTIONS).forEach((sectionKey) => {
      const sec = SECTIONS[sectionKey];
      sec.items.forEach((item) => {
        const key = normalizeLabel(item[0]);
        (labelTargets[key] = labelTargets[key] || []).push({
          prefix: `${sectionKey}_${item[1]}`, label: item[0], sectionTitle: sec.title,
        });
      });
    });
    Object.keys(LABEL_SYNONYMS).forEach((syn) => {
      const canonical = normalizeLabel(LABEL_SYNONYMS[syn]);
      const key = normalizeLabel(syn);
      if (labelTargets[canonical] && !labelTargets[key]) labelTargets[key] = labelTargets[canonical];
    });

    let pending = null; // {data: {key: value}, rows: [{label, sectionTitle, vals:[v3,v2,v1]}]}

    function parseWhole() {
      const text = input.value;
      errorEl.classList.add('hidden');
      if (text.trim() === '') { previewWrap.classList.add('hidden'); pending = null; return; }

      const used = {};           // 正規化ラベル → 消費済み数
      const data = {};
      const rows = [];
      const unmatched = [];

      text.split(/\r?\n/).forEach((line) => {
        const cells = line.split('\t');
        let i = 0;
        let rowHadLabel = false;
        while (i < cells.length) {
          const cellNorm = normalizeLabel(cells[i]);
          const targets = labelTargets[cellNorm];
          if (targets) {
            rowHadLabel = true;
            const idx = Math.min(used[cellNorm] || 0, targets.length - 1);
            used[cellNorm] = (used[cellNorm] || 0) + 1;
            const target = targets[idx];
            // ラベルの後ろから、次のラベルまでの間で数値を最大3つ拾う
            const nums = [];
            let j = i + 1;
            while (j < cells.length && nums.length < 3) {
              const nextNorm = normalizeLabel(cells[j]);
              if (labelTargets[nextNorm]) break;
              const v = parseStrictNumber(cells[j]);
              if (v !== '') nums.push(v);
              j++;
            }
            if (nums.length > 0) {
              // 右詰め: 最後の数値=直前期
              const periods = PERIODS.slice(3 - nums.length); // 3つ→[3,2,1] / 2つ→[2,1] / 1つ→[1]
              const vals = { 3: '', 2: '', 1: '' };
              nums.forEach((v, k) => {
                data[`${target.prefix}_${periods[k]}`] = String(v);
                vals[periods[k]] = v;
              });
              rows.push({ label: target.label, sectionTitle: target.sectionTitle, vals });
            }
            i = j;
          } else {
            i++;
          }
        }
        // ラベルなし行で数値と文字が混在 → 認識できなかった候補
        if (!rowHadLabel) {
          const hasText = cells.some((c) => normalizeLabel(c) !== '' && parseStrictNumber(c) === '');
          const hasNum = cells.some((c) => parseStrictNumber(c) !== '');
          if (hasText && hasNum) {
            const t = cells.map((c) => c.trim()).filter((c) => c !== '').join(' / ');
            if (t.length > 0 && unmatched.length < 30) unmatched.push(t);
          }
        }
      });

      if (rows.length === 0) {
        previewWrap.classList.add('hidden');
        pending = null;
        errorEl.textContent = '科目名を見つけられませんでした。決算書(貸借対照表・損益計算書など)のシートを丸ごとコピーして貼り付けてください。';
        errorEl.classList.remove('hidden');
        return;
      }

      pending = { data, rows };
      const fmt = (v) => (v === '' ? '<span class="text-gray-300">―</span>' : Number(v).toLocaleString('ja-JP'));
      detailEl.innerHTML =
        '<table class="w-full text-xs"><thead><tr class="bg-gray-50 text-gray-500">' +
        '<th class="text-left px-3 py-1.5 font-bold">科目</th><th class="text-left px-2 py-1.5 font-bold">区分</th>' +
        '<th class="text-right px-2 py-1.5 font-bold">3期前</th><th class="text-right px-2 py-1.5 font-bold">2期前</th><th class="text-right px-3 py-1.5 font-bold">直前期</th>' +
        '</tr></thead><tbody>' +
        pending.rows.map((r) =>
          `<tr class="border-t border-gray-100"><td class="px-3 py-1 font-bold text-[#0f2a4a]">${r.label}</td>` +
          `<td class="px-2 py-1 text-gray-400">${r.sectionTitle.replace('貸借対照表 - ', 'BS ').replace('損益計算書', 'PL')}</td>` +
          `<td class="px-2 py-1 text-right font-mono">${fmt(r.vals[3])}</td><td class="px-2 py-1 text-right font-mono">${fmt(r.vals[2])}</td><td class="px-3 py-1 text-right font-mono">${fmt(r.vals[1])}</td></tr>`
        ).join('') +
        '</tbody></table>';
      summaryEl.textContent = `${rows.length}科目・${Object.keys(data).length}件の数値を認識しました。内容を確認して「決算書情報に反映する」を押してください。`;
      if (unmatched.length > 0) {
        unmatchedEl.innerHTML = '<b>認識できなかった行(数値つき):</b> ' + unmatched.map((u) => u.replace(/</g, '&lt;')).join(' ｜ ');
        unmatchedEl.classList.remove('hidden');
      } else {
        unmatchedEl.classList.add('hidden');
      }
      applyBtn2.disabled = false;
      applyBtn2.classList.remove('opacity-50');
      applyBtn2.textContent = '決算書情報に反映する';
      previewWrap.classList.remove('hidden');
    }

    input.addEventListener('input', parseWhole);

    applyBtn2.addEventListener('click', function () {
      if (!pending) return;
      const data = loadStorage();
      Object.assign(data, pending.data);
      saveStorage(data);
      summaryEl.textContent = `決算書情報に反映しました(${Object.keys(pending.data).length}件)。決算書情報ページで内容をご確認ください。`;
      applyBtn2.disabled = true;
      applyBtn2.classList.add('opacity-50');
      applyBtn2.textContent = '反映済み';
    });

    clearBtn2.addEventListener('click', function () {
      input.value = '';
      pending = null;
      previewWrap.classList.add('hidden');
      errorEl.classList.add('hidden');
    });
  })();

  // ===== 入力データクリア(ヒーロー): 決算書情報の保存データを削除。
  //       2回押しで確定するトグル確認方式(window.confirm()は使わない) =====
  const clearBtn = document.getElementById('eiClearBtn');
  if (window.armHeroClearBtn) {
    window.armHeroClearBtn(clearBtn, function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.reload();
    });
  }
});

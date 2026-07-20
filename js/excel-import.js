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
});

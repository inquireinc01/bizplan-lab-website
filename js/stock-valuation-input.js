document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('stockCalcForm');
  if (!form) return;

  const STORAGE_KEY = 'bpl_stock_valuation_v1';
  const errorArea = document.getElementById('calcErrorArea');
  const resumeLink = document.getElementById('resumeLink');

  // 将来推移・比較シナリオ(法人税率/利益A・B/配当/退職金/M&A関連)は
  // 結果ページ側でリアルタイム編集するため、ここでは扱わない。
  const REQUIRED_BASE_IDS = [
    'taxAssets', 'taxLiabilities', 'bookAssets', 'bookLiabilities', 'sharesOutstanding',
    'simA', 'simB', 'simC', 'simD', 'ownB', 'ownC', 'ownD', 'capitalAmount',
  ];

  const LABELS = {
    taxAssets: '相続税評価額による総資産', taxLiabilities: '相続税評価額による負債',
    bookAssets: '帳簿価額による総資産', bookLiabilities: '帳簿価額による負債',
    sharesOutstanding: '発行済株式数', simA: '類似業種の株価(A)', simB: '類似業種の1株当たり配当金額(B)',
    simC: '類似業種の1株当たり利益金額(C)', simD: '類似業種の1株当たり純資産価額(D)',
    ownB: '評価会社の1株当たり配当金額(b)', ownC: '評価会社の1株当たり利益金額(c)',
    ownD: '評価会社の1株当たり純資産価額(d)', capitalAmount: '資本金等の額',
  };

  const showError = (msg, focusId) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    errorArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
  };

  // ===== 前回入力の復元 =====
  function loadStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  const stored = loadStored();
  if (stored) {
    REQUIRED_BASE_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && stored[id] !== undefined && stored[id] !== '') el.value = stored[id];
    });
    const sizeEl = document.getElementById('companySize');
    if (sizeEl && stored.companySize) sizeEl.value = stored.companySize;
    if (resumeLink) resumeLink.classList.remove('hidden');
  }

  // ===== 送信: バリデーション→localStorageに保存(既存値とマージ)→結果ページへ =====
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    for (const id of REQUIRED_BASE_IDS) {
      const el = document.getElementById(id);
      const v = parseFloat((el.value || '').replace(/,/g, ''));
      if (isNaN(v)) {
        showError(`「${LABELS[id] || id}」を入力してください。`, id);
        return;
      }
    }
    const sharesEl = document.getElementById('sharesOutstanding');
    if (parseFloat(sharesEl.value) <= 0) {
      showError('発行済株式数は1以上で入力してください。', 'sharesOutstanding');
      return;
    }
    for (const id of ['simB', 'simC', 'simD']) {
      const el = document.getElementById(id);
      if (parseFloat(el.value) === 0) {
        showError('類似業種のB・C・Dに0は入力できません(比準計算で0除算になります)。', id);
        return;
      }
    }

    const data = { companySize: document.getElementById('companySize').value };
    REQUIRED_BASE_IDS.forEach((id) => {
      const el = document.getElementById(id);
      data[id] = el.value;
    });

    try {
      // 結果ページで編集された将来推移・比較シナリオの値は消さずに残す
      const existing = loadStored() || {};
      const merged = Object.assign({}, existing, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      // localStorage不可の環境でも遷移は継続(結果ページ側でデフォルト値にフォールバック)
    }

    window.location.href = 'stock-valuation-result.html';
  });

  const resetBtn = document.getElementById('calcResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      clearError();
    });
  }
});

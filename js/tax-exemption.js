/* ============================================================
   非課税×生命保険(入力ページ)
   - 所得税・相続税それぞれで簡易入力/詳細入力を選択
   - 入力確定時(change)に自動計算欄を更新
   - 「シミュレーション結果に進む」で内容を保存し結果ページへ遷移
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('txForm');
  if (!form || !window.bplTax) return;
  const T = window.bplTax;
  const man = T.man;
  const errorArea = document.getElementById('txErrorArea');

  const $ = (id) => document.getElementById(id);
  const setTxt = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
  const numOf = (id) => {
    const el = $(id);
    if (!el) return NaN;
    return window.numClean ? window.numClean(el.value) : parseFloat(el.value);
  };
  const valOf = (id) => { const el = $(id); return el ? el.value : ''; };

  const showError = (msg, el) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    if (el) {
      el.classList.add('input-error');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
    form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
  };

  /* ===== ？ツールチップ(タップで開閉・モバイル対応) ===== */
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

  /* ===== 版選択(所得税 / 相続税) ===== */
  let itVersion = 'simple';
  let ihVersion = 'simple';

  function applyItVersion(v) {
    itVersion = v;
    document.querySelectorAll('#itVersionChooser .version-card').forEach(function (c) {
      c.classList.toggle('selected', c.getAttribute('data-it-version') === v);
    });
    $('itSimpleArea').classList.toggle('hidden', v !== 'simple');
    $('itDetailArea').classList.toggle('hidden', v !== 'detail');
    refreshAuto();
  }
  function applyIhVersion(v) {
    ihVersion = v;
    document.querySelectorAll('#ihVersionChooser .version-card').forEach(function (c) {
      c.classList.toggle('selected', c.getAttribute('data-ih-version') === v);
    });
    $('ihSimpleArea').classList.toggle('hidden', v !== 'simple');
    $('ihDetailArea').classList.toggle('hidden', v !== 'detail');
    // 詳細入力では法定相続人の数を家系図から自動判定するため、「4.」の入力欄は読み取り専用にする
    const heirsEl = $('txHeirs');
    if (heirsEl) {
      heirsEl.readOnly = (v === 'detail');
      heirsEl.classList.toggle('bg-gray-50', v === 'detail');
    }
    refreshAuto();
  }
  document.querySelectorAll('#itVersionChooser .version-card').forEach(function (c) {
    const v = c.getAttribute('data-it-version');
    c.addEventListener('click', () => applyItVersion(v));
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); applyItVersion(v); }
    });
  });
  document.querySelectorAll('#ihVersionChooser .version-card').forEach(function (c) {
    const v = c.getAttribute('data-ih-version');
    c.addEventListener('click', () => applyIhVersion(v));
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); applyIhVersion(v); }
    });
  });

  /* ===== 自動計算欄の更新(入力確定時に呼ぶ) ===== */
  function refreshAuto() {
    const data = collect();
    const r = T.calcAll(data);

    // --- 所得税: 簡易入力 ---
    setTxt('txSimpleRateIt', T.marginalIncomeTaxRate(T.floorTaxable(numOf('txTaxableIncomeSimple') || 0)) + ' %');
    setTxt('txSimpleRateRt', T.RESIDENT_TAX_RATE + ' %＋均等割');
    if (r.itMode === 'simple') {
      setTxt('txSimpleTaxIt', man(r.taxItBefore));
      setTxt('txSimpleTaxRt', man(r.taxRtBefore));
    }

    // --- 所得税: 詳細入力 ---
    if (r.itMode === 'detail' && r.detail) {
      const d = r.detail;
      setTxt('txSalaryDeduction', man(d.salDed));
      setTxt('txSalaryIncomeNet', man(d.salaryIncome));
      setTxt('txOneTimeLinked', man(r.oneTimeTaxable));
      setTxt('txTotalIncomeSum', man(d.totalIncome));
      setTxt('txSeparateTax', man(d.separateTax));
      setTxt('txTotalIncomeIt', man(d.totalIncome));
      setTxt('txTotalIncomeRt', man(d.totalIncome));
      setTxt('txBasicIt', man(d.basicIt));
      setTxt('txBasicRt', man(d.basicRt));
      setTxt('txDeductionIt', man(d.dedIt));
      setTxt('txDeductionRt', man(d.dedRt));
      setTxt('txTaxableIt', man(r.taxableIt));
      setTxt('txTaxableRt', man(r.taxableRt));
      setTxt('txRateIt', r.marginalIncomeRate + ' %');
      setTxt('txRateRt', T.RESIDENT_TAX_RATE + ' %＋均等割');
      setTxt('txDividendCreditIt', r.credIt > 0 ? '△ ' + man(r.credIt) : man(0));
      setTxt('txDividendCreditRt', r.credRt > 0 ? '△ ' + man(r.credRt) : man(0));
      setTxt('txTaxBeforeIt', man(r.taxItBefore));
      setTxt('txTaxBeforeRt', man(r.taxRtBefore));
    }

    // --- 相続税: 詳細入力 ---
    if (r.ihMode === 'detail' && r.heirs && r.estate) {
      const h = r.heirs, e = r.estate;
      let heirsTxt = h.count + ' 人';
      if (h.adoptedExcluded > 0) heirsTxt += '(養子' + h.adoptedExcluded + '人は算入制限で除外)';
      setTxt('txHeirsAuto', heirsTxt);
      const shareTxt = h.shares.length
        ? h.composition + ' / ' + h.shares.map((x) => x.label + ' ' + (x.share * 100).toFixed(1) + '%').join('、')
        : '該当なし';
      setTxt('txHeirsComposition', shareTxt);
      setTxt('txAssetInsuranceNet', man(e.insuranceNet));
      setTxt('txAssetRetirementNet', man(e.retirementNet));
      setTxt('txAssetTotal', man(e.assetTotal));
      setTxt('txDebtTotal', man(e.debtTotal));
      setTxt('txTaxableEstate', man(e.priceWith));
      setTxt('txEstateBasic', man(e.basic));
      setTxt('txNetEstate', man(e.net));
      setTxt('txEstateTaxTotal', man(e.total));
      setTxt('txEstateEffectiveRate', e.effectiveRate.toFixed(1) + ' %');
      setTxt('txEstateMarginalRate', e.marginalRate + ' %');
      // 「4.」の法定相続人の数を家系図の判定結果で上書きする
      const heirsEl = $('txHeirs');
      if (heirsEl) heirsEl.value = String(h.count);
    }
  }

  /* ===== 入力内容の収集(localStorage保存用) ===== */
  const FIELD_IDS = [
    // 所得税(簡易)
    'txTaxableIncomeSimple',
    // 所得税(詳細)
    'txSalaryIncome', 'txBusinessIncome', 'txRealEstateIncome', 'txDividendIncome', 'txDividendMethod',
    'txMiscIncome', 'txTransferShort', 'txTransferLong', 'txForestryIncome',
    'txInterestIncome', 'txStockTransfer', 'txLandTransfer', 'txLandTransferType',
    'txSocialInsurance', 'txSmallBizDeduction', 'txEarthquakeDeduction', 'txMedicalDeduction',
    'txSpouseDeduction', 'txDependentGeneral', 'txDependentSpecific', 'txDependentElderly', 'txOtherDeduction',
    // 相続税(簡易)
    'txInheritanceRate',
    // 相続税(詳細)
    'txHasSpouse', 'txChildren', 'txAdopted', 'txParents', 'txSiblings',
    'txAssetLand', 'txAssetBuilding', 'txAssetSecurities', 'txAssetCash', 'txAssetOther',
    'txDebt', 'txFuneralCost',
    // 共通
    'txGeneralPremium', 'txPensionPremium', 'txMedicalPremium',
    'txHeirs', 'txDeathBenefit', 'txRetirementBenefit',
    'txSalaryMonthly', 'txDeathCause',
    'txMaturityAmount', 'txPaidPremiumTotal',
  ];
  function collect() {
    const data = { txItVersion: itVersion, txIhVersion: ihVersion };
    FIELD_IDS.forEach(function (id) { data[id] = valOf(id); });
    return data;
  }
  function save() {
    try { localStorage.setItem(T.STORAGE_KEY, JSON.stringify(collect())); } catch (e) {}
  }
  function restore() {
    const s = T.loadInputs();
    if (!s) return false;
    FIELD_IDS.forEach(function (id) {
      const el = $(id);
      if (el && s[id] !== undefined) el.value = s[id];
    });
    if (s.txItVersion) itVersion = s.txItVersion;
    if (s.txIhVersion) ihVersion = s.txIhVersion;
    return true;
  }

  /* ===== 入力確定時に自動計算を更新(入力中は反映しない) ===== */
  form.addEventListener('change', function () { refreshAuto(); save(); });
  // エラーの赤枠は入力し直したら即座に解除する
  const clearOwnError = (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('input-error')) {
      e.target.classList.remove('input-error');
    }
  };
  form.addEventListener('input', clearOwnError);
  form.addEventListener('change', clearOwnError);
  // 入力欄でEnterを押しただけで送信されるのを防ぐ(Enterは入力確定として扱う)
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!t || t.tagName === 'TEXTAREA' || t.tagName === 'BUTTON' || t.type === 'submit') return;
    e.preventDefault();
    if (typeof t.blur === 'function') t.blur();
  });

  /* ===== 検証してから結果ページへ ===== */
  const MAX_YEN = 99999999;   // 保険料(円)の上限
  const MAX_MAN = 99999999;   // 金額(万円)の上限
  const MAX_HEIRS = 100;

  function validate() {
    // 保険料(円)
    for (const it of T.PREMIUM_ITEMS) {
      const v = numOf(it.id);
      if (isNaN(v) || v < 0) { showError(it.label + 'を入力してください。', $(it.id)); return false; }
      if (v > MAX_YEN) { showError('保険料は ' + T.fmt(MAX_YEN) + ' 円以内で入力してください。', $(it.id)); return false; }
    }
    // 所得税
    if (itVersion === 'simple') {
      const v = numOf('txTaxableIncomeSimple');
      if (isNaN(v) || v < 0) { showError('課税所得を入力してください。', $('txTaxableIncomeSimple')); return false; }
      if (v > MAX_MAN) { showError('課税所得の入力値が大きすぎます。', $('txTaxableIncomeSimple')); return false; }
    } else {
      const required = ['txSalaryIncome', 'txSocialInsurance'];
      for (const id of required) {
        const v = numOf(id);
        if (isNaN(v) || v < 0) { showError('「1. 所得税・住民税」の収入・所得控除を入力してください。', $(id)); return false; }
      }
      // マイナスも許容する所得項目は数値であることだけ確認する
      for (const id of ['txBusinessIncome', 'txRealEstateIncome', 'txDividendIncome', 'txMiscIncome',
        'txTransferShort', 'txTransferLong', 'txForestryIncome']) {
        if (isNaN(numOf(id))) { showError('「1. 所得税・住民税」の各種所得を入力してください。', $(id)); return false; }
      }
      for (const id of ['txInterestIncome', 'txStockTransfer', 'txLandTransfer', 'txSmallBizDeduction',
        'txEarthquakeDeduction', 'txMedicalDeduction', 'txDependentGeneral', 'txDependentSpecific',
        'txDependentElderly', 'txOtherDeduction']) {
        const v = numOf(id);
        if (isNaN(v) || v < 0) { showError('「1. 所得税・住民税」の入力に不備があります。', $(id)); return false; }
      }
    }
    // 相続税
    if (ihVersion === 'simple') {
      const v = numOf('txInheritanceRate');
      if (isNaN(v) || v < 0) { showError('相続税率を入力してください。', $('txInheritanceRate')); return false; }
      if (v > 100) { showError('相続税率は100%以内で入力してください。', $('txInheritanceRate')); return false; }
    } else {
      for (const id of ['txChildren', 'txAdopted', 'txParents', 'txSiblings',
        'txAssetLand', 'txAssetBuilding', 'txAssetSecurities', 'txAssetCash', 'txAssetOther',
        'txDebt', 'txFuneralCost']) {
        const v = numOf(id);
        if (isNaN(v) || v < 0) { showError('「2. 相続税」の家系図・財産目録を入力してください。', $(id)); return false; }
      }
      const heirs = T.judgeHeirs({
        hasSpouse: valOf('txHasSpouse'), children: numOf('txChildren'), adopted: numOf('txAdopted'),
        parents: numOf('txParents'), siblings: numOf('txSiblings'),
      });
      if (heirs.count <= 0) {
        showError('法定相続人が0人です。配偶者の有無、子・父母・兄弟姉妹の人数をご確認ください。', $('txChildren'));
        return false;
      }
    }
    // 共通(非課税枠・弔慰金・一時所得)
    if (ihVersion === 'simple') {
      const h = numOf('txHeirs');
      if (isNaN(h) || h < 0) { showError('法定相続人の数を入力してください。', $('txHeirs')); return false; }
      if (h > MAX_HEIRS) { showError('法定相続人の数は ' + MAX_HEIRS + ' 人以内で入力してください。', $('txHeirs')); return false; }
    }
    for (const id of ['txDeathBenefit', 'txRetirementBenefit', 'txSalaryMonthly',
      'txMaturityAmount', 'txPaidPremiumTotal']) {
      const v = numOf(id);
      if (isNaN(v) || v < 0) { showError('非課税枠・一時所得の項目を入力してください。', $(id)); return false; }
      if (v > MAX_MAN) { showError('入力値が大きすぎます。数値をご確認ください。', $(id)); return false; }
    }
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();
    refreshAuto();
    if (!validate()) return;
    save();
    window.location.href = 'tax-exemption-result.html';
  });

  /* ===== 入力データクリア ===== */
  function doClearFields() {
    FIELD_IDS.forEach(function (id) {
      const el = $(id);
      if (!el) return;
      if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
    });
    try { localStorage.removeItem(T.STORAGE_KEY); } catch (e) {}
    clearError();
    refreshAuto();
  }
  const clearBtn = $('txClearBtn');
  if (window.armHeroClearBtn) window.armHeroClearBtn(clearBtn, doClearFields);
  const fieldClearBtn = $('txFieldClearBtn');
  if (fieldClearBtn) {
    fieldClearBtn.addEventListener('click', function () {
      if (!window.confirm('入力内容をすべてクリアします。保存されているデータも削除されます。よろしいですか？')) return;
      doClearFields();
    });
  }

  /* ===== 初期表示 ===== */
  restore();
  applyItVersion(itVersion);
  applyIhVersion(ihVersion);
  if (window.numReformatAll) setTimeout(window.numReformatAll, 0);
});

/* ============================================================
   非課税×生命保険: 入力ページと結果ページで共有する計算ロジック
   - 金額は原則「万円」ベース(生命保険料控除だけは制度が円単位なので円で扱う)
   - window.bplTax に公開し、tax-exemption.js / tax-exemption-result.js の両方から使う
   ============================================================ */
(function () {
  const STORAGE_KEY = 'bpl_tax_exemption_v1';

  const RESIDENT_TAX_RATE = 10;      // 住民税(所得割)の標準税率%
  const RESIDENT_PER_CAPITA = 0.5;   // 住民税の均等割 5,000円 = 0.5万円
  const SEPARATE_RATE = 20.315;      // 利子・配当(分離)・株式譲渡・土地建物の長期譲渡
  const LAND_SHORT_RATE = 39.63;     // 土地建物の短期譲渡
  const EXEMPTION_PER_HEIR = 500;    // 生命保険金・死亡退職金の非課税枠(1人あたり万円)

  const PREMIUM_ITEMS = [
    { id: 'txGeneralPremium', label: '一般生命保険料' },
    { id: 'txPensionPremium', label: '個人年金保険料' },
    { id: 'txMedicalPremium', label: '介護医療保険料' },
  ];

  const SPOUSE_DEDUCTION = { none: [0, 0], general: [38, 33], elderly: [48, 38] };

  // ---------- 表示ヘルパ ----------
  const fmt = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));
  const yen = (n) => fmt(n) + ' 円';
  const man = (n) => fmt(n) + ' 万円';

  // ---------- 生命保険料控除(新制度・平成24年1月1日以後契約。円単位) ----------
  function premiumDeductionIt(p) {
    if (p <= 0) return 0;
    if (p <= 20000) return p;
    if (p <= 40000) return p * 0.5 + 10000;
    if (p <= 80000) return p * 0.25 + 20000;
    return 40000;
  }
  function premiumDeductionRt(p) {
    if (p <= 0) return 0;
    if (p <= 12000) return p;
    if (p <= 32000) return p * 0.5 + 6000;
    if (p <= 56000) return p * 0.25 + 14000;
    return 28000;
  }

  // ---------- 所得税・住民税 ----------
  // 給与所得控除額(2020年分以降)
  function salaryDeduction(incomeMan) {
    const x = Math.max(0, incomeMan);
    if (x <= 162.5) return Math.min(x, 55);
    if (x <= 180) return x * 0.4 - 10;
    if (x <= 360) return x * 0.3 + 8;
    if (x <= 660) return x * 0.2 + 44;
    if (x <= 850) return x * 0.1 + 110;
    return 195;
  }
  // 基礎控除(合計所得金額に応じて縮小)
  function basicDeduction(totalIncomeMan, isResident) {
    const t = Math.max(0, totalIncomeMan);
    if (t <= 2400) return isResident ? 43 : 48;
    if (t <= 2450) return isResident ? 29 : 32;
    if (t <= 2500) return isResident ? 15 : 16;
    return 0;
  }
  function marginalIncomeTaxRate(taxableMan) {
    const x = Math.max(0, taxableMan);
    if (x <= 195) return 5;
    if (x <= 330) return 10;
    if (x <= 695) return 20;
    if (x <= 900) return 23;
    if (x <= 1800) return 33;
    if (x <= 4000) return 40;
    return 45;
  }
  // 所得税額(速算表・万円)
  function incomeTaxAmount(taxableMan) {
    const x = Math.max(0, taxableMan);
    const brackets = [
      [195, 0.05, 0], [330, 0.10, 9.75], [695, 0.20, 42.75], [900, 0.23, 63.6],
      [1800, 0.33, 153.6], [4000, 0.40, 279.6], [Infinity, 0.45, 479.6],
    ];
    for (const [limit, rate, ded] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - ded);
    }
    return 0;
  }
  function residentTaxAmount(taxableMan, dividendCreditRt) {
    if (taxableMan <= 0) return 0;
    return Math.max(0, taxableMan * RESIDENT_TAX_RATE / 100 - (dividendCreditRt || 0)) + RESIDENT_PER_CAPITA;
  }
  // 課税所得は1,000円未満切捨て(万円ベースなので0.1万円単位)
  function floorTaxable(man_) {
    return Math.max(0, Math.floor(Math.max(0, man_) * 10) / 10);
  }
  // 配当控除(税額控除)。課税総所得1,000万円以下は所得税10%・住民税2.8%、超は5%・1.4%
  function dividendCredit(dividendAggregated, taxableIt) {
    if (!(dividendAggregated > 0)) return [0, 0];
    const low = taxableIt <= 1000;
    return [dividendAggregated * (low ? 0.10 : 0.05), dividendAggregated * (low ? 0.028 : 0.014)];
  }

  // ---------- 相続税 ----------
  // 相続税の速算表(法定相続分に応ずる取得金額・万円)
  function inheritanceTaxByShare(shareMan) {
    const x = Math.max(0, shareMan);
    const brackets = [
      [1000, 0.10, 0], [3000, 0.15, 50], [5000, 0.20, 200], [10000, 0.30, 700],
      [20000, 0.40, 1700], [30000, 0.45, 2700], [60000, 0.50, 4200], [Infinity, 0.55, 7200],
    ];
    for (const [limit, rate, ded] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - ded);
    }
    return 0;
  }
  function inheritanceRateByShare(shareMan) {
    const x = Math.max(0, shareMan);
    if (x <= 1000) return 10;
    if (x <= 3000) return 15;
    if (x <= 5000) return 20;
    if (x <= 10000) return 30;
    if (x <= 20000) return 40;
    if (x <= 30000) return 45;
    if (x <= 60000) return 50;
    return 55;
  }
  // 家系図から法定相続人の数と法定相続分(配列)を判定する
  // 養子は法定相続人の数への算入制限あり(実子あり1人まで/実子なし2人まで)
  function judgeHeirs(o) {
    const hasSpouse = o.hasSpouse === 'yes';
    const realChildren = Math.max(0, o.children || 0);
    const adoptedRaw = Math.max(0, o.adopted || 0);
    const adopted = Math.min(adoptedRaw, realChildren > 0 ? 1 : 2);
    const children = realChildren + adopted;
    const parents = Math.max(0, o.parents || 0);
    const siblings = Math.max(0, o.siblings || 0);

    let bloodCount = 0, bloodShare = 0, bloodLabel = '';
    if (children > 0) {
      bloodCount = children; bloodShare = hasSpouse ? 0.5 : 1; bloodLabel = '子';
    } else if (parents > 0) {
      bloodCount = parents; bloodShare = hasSpouse ? 1 / 3 : 1; bloodLabel = '直系尊属';
    } else if (siblings > 0) {
      bloodCount = siblings; bloodShare = hasSpouse ? 0.25 : 1; bloodLabel = '兄弟姉妹';
    }
    const spouseShare = hasSpouse ? (bloodCount > 0 ? 1 - bloodShare : 1) : 0;

    const shares = [];
    if (hasSpouse) shares.push({ label: '配偶者', share: spouseShare });
    for (let i = 0; i < bloodCount; i++) shares.push({ label: bloodLabel, share: bloodShare / bloodCount });

    const parts = [];
    if (hasSpouse) parts.push('配偶者');
    if (bloodCount > 0) parts.push(bloodLabel + bloodCount + '人');
    return {
      count: shares.length,
      shares,
      adoptedCounted: adopted,
      adoptedExcluded: adoptedRaw - adopted,
      composition: parts.length ? parts.join(' ＋ ') : '該当なし',
    };
  }
  // 課税価格から相続税の総額を計算する
  function inheritanceTaxTotal(taxablePriceMan, heirs) {
    const basic = 3000 + 600 * heirs.count;
    const net = Math.max(0, taxablePriceMan - basic);
    let total = 0, maxShare = 0;
    heirs.shares.forEach(function (h) {
      const amount = net * h.share;
      if (amount > maxShare) maxShare = amount;
      total += inheritanceTaxByShare(amount);
    });
    return {
      basic, net, total,
      marginalRate: net > 0 ? inheritanceRateByShare(maxShare) : 0,
      effectiveRate: taxablePriceMan > 0 ? (total / taxablePriceMan) * 100 : 0,
    };
  }

  // ---------- 入力値の保存/読込 ----------
  function loadInputs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  const numOf = (v) => (window.numClean ? window.numClean(v) : parseFloat(String(v == null ? '' : v).replace(/,/g, '')));
  // 保存データから数値/文字列を取り出す(未入力は既定値)
  function pick(data, key, def) {
    if (!data || data[key] === undefined || data[key] === '') return def;
    return data[key];
  }
  function pickNum(data, key, def) {
    const v = numOf(pick(data, key, def));
    return isNaN(v) ? def : v;
  }

  /* ==========================================================
     入力データ一式から、結果表示に必要な値をすべて計算して返す
     ========================================================== */
  function calcAll(data) {
    const itMode = pick(data, 'txItVersion', 'simple');
    const ihMode = pick(data, 'txIhVersion', 'simple');

    // ---- 生命保険料控除(円) ----
    const premiumRows = PREMIUM_ITEMS.map(function (it) {
      const p = Math.max(0, pickNum(data, it.id, 0));
      return { label: it.label, premium: p, it: premiumDeductionIt(p), rt: premiumDeductionRt(p) };
    });
    const premiumItTotal = Math.min(premiumRows.reduce((s, r) => s + r.it, 0), 120000);
    const premiumRtTotal = Math.min(premiumRows.reduce((s, r) => s + r.rt, 0), 70000);

    // ---- 一時所得 ----
    const maturity = pickNum(data, 'txMaturityAmount', 0);
    const paidPremium = pickNum(data, 'txPaidPremiumTotal', 0);
    const oneTimeIncome = Math.max(0, maturity - paidPremium - 50);
    const oneTimeTaxable = oneTimeIncome / 2;

    // ---- 相続人の数(詳細入力なら家系図から自動、簡易入力なら「4.」の入力値) ----
    let heirs, heirsCount;
    if (ihMode === 'detail') {
      heirs = judgeHeirs({
        hasSpouse: pick(data, 'txHasSpouse', 'yes'),
        children: pickNum(data, 'txChildren', 0),
        adopted: pickNum(data, 'txAdopted', 0),
        parents: pickNum(data, 'txParents', 0),
        siblings: pickNum(data, 'txSiblings', 0),
      });
      heirsCount = heirs.count;
    } else {
      heirsCount = Math.max(0, pickNum(data, 'txHeirs', 0));
      heirs = null;
    }

    // ---- 非課税枠(生命保険金・死亡退職金・弔慰金) ----
    const exemptionEach = EXEMPTION_PER_HEIR * heirsCount;
    const deathBenefit = Math.max(0, pickNum(data, 'txDeathBenefit', 0));
    const retirementBenefit = Math.max(0, pickNum(data, 'txRetirementBenefit', 0));
    const usedDeath = Math.min(deathBenefit, exemptionEach);
    const taxableDeath = Math.max(0, deathBenefit - exemptionEach);
    const usedRetire = Math.min(retirementBenefit, exemptionEach);
    const taxableRetire = Math.max(0, retirementBenefit - exemptionEach);

    const salaryMonthly = Math.max(0, pickNum(data, 'txSalaryMonthly', 0));
    const deathCause = pick(data, 'txDeathCause', 'off');
    const condolenceMonths = deathCause === 'on' ? 36 : 6;
    const condolenceExemption = salaryMonthly * condolenceMonths;

    /* ---------- 所得税・住民税 ---------- */
    let taxableIt = 0, taxableRt = 0, taxItBefore = 0, taxRtBefore = 0;
    let detail = null, credIt = 0, credRt = 0;

    if (itMode === 'detail') {
      const salary = pickNum(data, 'txSalaryIncome', 0);
      const salDed = salaryDeduction(salary);
      const salaryIncome = Math.max(0, salary - salDed);
      const business = pickNum(data, 'txBusinessIncome', 0);
      const realEstate = pickNum(data, 'txRealEstateIncome', 0);
      const dividend = pickNum(data, 'txDividendIncome', 0);
      const dividendMethod = pick(data, 'txDividendMethod', 'aggregate');
      const misc = pickNum(data, 'txMiscIncome', 0);
      const trShort = pickNum(data, 'txTransferShort', 0);
      const trLong = pickNum(data, 'txTransferLong', 0);
      const forestry = pickNum(data, 'txForestryIncome', 0);
      const dividendAggregated = dividendMethod === 'aggregate' ? dividend : 0;

      const totalIncome = salaryIncome + business + realEstate + dividendAggregated + misc
        + trShort + trLong / 2 + forestry + oneTimeTaxable;

      const social = pickNum(data, 'txSocialInsurance', 0);
      const smallBiz = pickNum(data, 'txSmallBizDeduction', 0);
      const earthquake = pickNum(data, 'txEarthquakeDeduction', 0);
      const medical = pickNum(data, 'txMedicalDeduction', 0);
      const otherDed = pickNum(data, 'txOtherDeduction', 0);
      const sp = SPOUSE_DEDUCTION[pick(data, 'txSpouseDeduction', 'none')] || SPOUSE_DEDUCTION.none;
      const depGen = pickNum(data, 'txDependentGeneral', 0);
      const depSpe = pickNum(data, 'txDependentSpecific', 0);
      const depEld = pickNum(data, 'txDependentElderly', 0);
      const depIt = depGen * 38 + depSpe * 63 + depEld * 48;
      const depRt = depGen * 33 + depSpe * 45 + depEld * 38;
      const basicIt = basicDeduction(totalIncome, false);
      const basicRt = basicDeduction(totalIncome, true);
      const common = social + smallBiz + medical + otherDed;
      const dedIt = common + earthquake + sp[0] + depIt + basicIt;
      const dedRt = common + Math.min(earthquake, 2.5) + sp[1] + depRt + basicRt;

      taxableIt = floorTaxable(totalIncome - dedIt);
      taxableRt = floorTaxable(totalIncome - dedRt);
      const cr = dividendCredit(dividendAggregated, taxableIt);
      credIt = cr[0]; credRt = cr[1];
      taxItBefore = Math.max(0, incomeTaxAmount(taxableIt) - credIt);
      taxRtBefore = residentTaxAmount(taxableRt, credRt);

      // 分離課税(参考)
      const interest = pickNum(data, 'txInterestIncome', 0);
      const stockTr = pickNum(data, 'txStockTransfer', 0);
      const landTr = pickNum(data, 'txLandTransfer', 0);
      const landRate = pick(data, 'txLandTransferType', 'long') === 'short' ? LAND_SHORT_RATE : SEPARATE_RATE;
      const dividendSeparate = dividendMethod === 'separate' ? Math.max(0, dividend) : 0;
      const separateTax = (interest + stockTr + dividendSeparate) * SEPARATE_RATE / 100 + landTr * landRate / 100;

      detail = {
        salary, salDed, salaryIncome, totalIncome, basicIt, basicRt, dedIt, dedRt,
        dividend, dividendMethod, dividendAggregated, separateTax, oneTimeTaxable,
      };
    } else {
      taxableIt = floorTaxable(pickNum(data, 'txTaxableIncomeSimple', 0));
      taxableRt = taxableIt; // 簡易入力では同じ課税所得を使う
      taxItBefore = incomeTaxAmount(taxableIt);
      taxRtBefore = residentTaxAmount(taxableRt, 0);
    }

    // 生命保険料控除の適用後(円→万円換算して課税所得から差し引く)
    const taxableItAfter = floorTaxable(taxableIt - premiumItTotal / 10000);
    const taxableRtAfter = floorTaxable(taxableRt - premiumRtTotal / 10000);
    const crAfter = itMode === 'detail'
      ? dividendCredit(detail.dividendAggregated, taxableItAfter) : [0, 0];
    const taxItAfter = Math.max(0, incomeTaxAmount(taxableItAfter) - crAfter[0]);
    const taxRtAfter = residentTaxAmount(taxableRtAfter, crAfter[1]);
    // 軽減額は円で表示する
    const saveIt = Math.max(0, taxItBefore - taxItAfter) * 10000;
    const saveRt = Math.max(0, taxRtBefore - taxRtAfter) * 10000;

    /* ---------- 相続税 ---------- */
    let estate = null;
    let saveDeath, saveRetire, saveCondolence, inheritanceRateUsed;

    if (ihMode === 'detail') {
      const assets = ['txAssetLand', 'txAssetBuilding', 'txAssetSecurities', 'txAssetCash', 'txAssetOther']
        .reduce((s, k) => s + pickNum(data, k, 0), 0);
      const debt = pickNum(data, 'txDebt', 0);
      const funeral = pickNum(data, 'txFuneralCost', 0);
      // 非課税枠を「使った場合」と「使わなかった場合」の課税価格
      const priceWith = assets + taxableDeath + taxableRetire - debt - funeral;
      const priceWithout = assets + deathBenefit + retirementBenefit + condolenceExemption - debt - funeral;
      const withRes = inheritanceTaxTotal(Math.max(0, priceWith), heirs);
      const withoutRes = inheritanceTaxTotal(Math.max(0, priceWithout), heirs);
      const totalSave = Math.max(0, withoutRes.total - withRes.total);
      // 内訳は非課税となった財産額の比で按分する
      const exemptDeath = usedDeath, exemptRetire = usedRetire, exemptCond = condolenceExemption;
      const exemptSum = exemptDeath + exemptRetire + exemptCond;
      saveDeath = exemptSum > 0 ? totalSave * exemptDeath / exemptSum : 0;
      saveRetire = exemptSum > 0 ? totalSave * exemptRetire / exemptSum : 0;
      saveCondolence = exemptSum > 0 ? totalSave * exemptCond / exemptSum : 0;
      inheritanceRateUsed = withRes.marginalRate;
      estate = {
        assets, debt, funeral, priceWith,
        insuranceNet: taxableDeath, retirementNet: taxableRetire,
        assetTotal: assets + taxableDeath + taxableRetire,
        debtTotal: debt + funeral,
        basic: withRes.basic, net: withRes.net, total: withRes.total,
        effectiveRate: withRes.effectiveRate, marginalRate: withRes.marginalRate,
        totalWithout: withoutRes.total, totalSave,
      };
    } else {
      inheritanceRateUsed = pickNum(data, 'txInheritanceRate', 0);
      saveDeath = usedDeath * inheritanceRateUsed / 100;
      saveRetire = usedRetire * inheritanceRateUsed / 100;
      saveCondolence = condolenceExemption * inheritanceRateUsed / 100;
    }
    const saveInheritSum = saveDeath + saveRetire + saveCondolence;

    return {
      itMode, ihMode,
      premiumRows, premiumItTotal, premiumRtTotal,
      oneTimeIncome, oneTimeTaxable,
      heirs, heirsCount, exemptionEach,
      deathBenefit, retirementBenefit, usedDeath, taxableDeath, usedRetire, taxableRetire,
      condolenceExemption, condolenceMonths,
      taxableIt, taxableRt, taxItBefore, taxRtBefore, credIt, credRt, detail,
      taxableItAfter, taxableRtAfter, taxItAfter, taxRtAfter,
      saveIt, saveRt, saveIncomeSum: saveIt + saveRt,
      marginalIncomeRate: marginalIncomeTaxRate(taxableIt),
      estate, inheritanceRateUsed,
      saveDeath, saveRetire, saveCondolence, saveInheritSum,
      exemptAmountTotal: usedDeath + usedRetire + condolenceExemption,
    };
  }

  window.bplTax = {
    STORAGE_KEY, RESIDENT_TAX_RATE, RESIDENT_PER_CAPITA, SEPARATE_RATE, LAND_SHORT_RATE,
    PREMIUM_ITEMS, SPOUSE_DEDUCTION,
    fmt, yen, man,
    premiumDeductionIt, premiumDeductionRt,
    salaryDeduction, basicDeduction, marginalIncomeTaxRate, incomeTaxAmount, residentTaxAmount,
    floorTaxable, dividendCredit,
    inheritanceTaxByShare, inheritanceRateByShare, judgeHeirs, inheritanceTaxTotal,
    loadInputs, calcAll, numOf, pick, pickNum,
  };
})();

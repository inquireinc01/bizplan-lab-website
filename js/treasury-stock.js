document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('treasuryForm');
  if (!form) return;

  const resultArea = document.getElementById('tsResultArea');
  const errorArea = document.getElementById('tsErrorArea');
  let suppressScroll = false;

  const num = (id) => {
    const el = document.getElementById(id);
    const v = parseFloat((el.value || '').replace(/,/g, ''));
    return { value: v, el };
  };

  const man = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP')) + ' 万円';
  // 末尾の単位「万円」を .unit で一回り小さく表示するためのHTML化(数値は内部生成のため安全)
  const unitize = (s) => String(s).replace(/\s*万円$/, '<span class="unit">万円</span>');

  const showError = (msg) => {
    errorArea.textContent = msg;
    errorArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
  };
  const clearError = () => {
    errorArea.classList.add('hidden');
    errorArea.textContent = '';
  };

  // ===== ？ツールチップ(税金の計算内訳。タップで開閉・モバイル対応) =====
  document.querySelectorAll('.help-tip').forEach(function (tip) {
    tip.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var wasOpen = tip.classList.contains('open');
      document.querySelectorAll('.help-tip.open').forEach(function (t) { t.classList.remove('open'); });
      if (!wasOpen) tip.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.help-tip.open').forEach(function (t) { t.classList.remove('open'); });
  });

  // ===== 法人の現金(死亡保険金額)の自動計算 =====
  // ②で法人が遺族から金庫株を買い取る(stockCorpValue)ために必要な最低額。
  // s2_corpAfterInsurance = cash*(1-c)*(1 + g*(1-c)) がstockCorpValue以上である必要がある。
  function computeCashMin() {
    const c = num('corpTaxRate').value / 100;
    const g = num('insuranceGainRate').value / 100;
    const stockCorp = num('stockCorpValue').value;
    if (isNaN(c) || isNaN(g) || isNaN(stockCorp)) return { min: NaN, auto: NaN };
    const denom = (1 - c) * (1 + g * (1 - c));
    if (!(denom > 0) || !(stockCorp > 0)) return { min: NaN, auto: NaN };
    const min = stockCorp / denom;
    // 自動入力は多めに設定する。まず億(10000万円)単位で切上げ、
    // その余白が5千万円以下なら さらに+5千万円して「〇億5千万円」にする(必ず5千万円以上を上乗せ)。
    const OKU = 10000; // 1億円 = 10000万円
    const ceilOku = Math.ceil(min / OKU) * OKU;
    const auto = (ceilOku - min <= 5000) ? ceilOku + 5000 : ceilOku;
    return { min: min, auto: auto };
  }

  let cashManual = false; // ガード状態(false=自動計算, true=手入力)
  const cashInput = document.getElementById('cash');
  const cashLockBtn = document.getElementById('cashLockBtn');
  const cashHint = document.getElementById('cashHint');

  function refreshAutoCash() {
    if (cashManual) return;
    const r = computeCashMin();
    if (!isNaN(r.auto)) {
      cashInput.value = r.auto;
      if (window.numReformatAll) window.numReformatAll();
    }
  }
  function setCashMode(manual) {
    cashManual = manual;
    cashInput.readOnly = !manual;
    cashInput.classList.toggle('bg-gray-50', !manual);
    if (cashLockBtn) cashLockBtn.textContent = manual ? '自動計算に戻す' : '手入力する';
    if (cashHint) cashHint.textContent = manual
      ? '手入力モード(金庫株の買取に必要な最低額を下回るとエラーになります)'
      : '他の項目から自動計算(金庫株の買取に必要な最低額に5千万円以上を上乗せし、億／5千万円単位で設定)';
    if (!manual) refreshAutoCash();
  }
  if (cashLockBtn) cashLockBtn.addEventListener('click', function () { setCashMode(!cashManual); });
  ['corpTaxRate', 'insuranceGainRate', 'stockCorpValue'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', refreshAutoCash);
  });

  // 「保険加入」マークの表示状態と、再描画用に最後の設定を保持する
  let showInsuranceMark = true;
  let lastWfCfg = null;
  const toggleMarkBtn = document.getElementById('toggleInsuranceMark');
  if (toggleMarkBtn) {
    toggleMarkBtn.addEventListener('click', function () {
      showInsuranceMark = !showInsuranceMark;
      toggleMarkBtn.textContent = showInsuranceMark ? '保険加入マークを隠す' : '保険加入マークを表示';
      toggleMarkBtn.setAttribute('aria-pressed', String(showInsuranceMark));
      if (lastWfCfg) drawWaterfall(lastWfCfg.cfgA, lastWfCfg.cfgB);
    });
  }

  // ===== 資金の流れ比較グラフ =====
  // 2パターン(①給与準備 / ②金庫株準備)を同一の項目列・同一スケールで、上下2つの独立したSVGに描画する。
  // 最終バーは「法人の残高＋個人の手残り」の積み上げにして合計を強調する
  function drawWaterfall(cfgA, cfgB) {
    const svg1 = document.getElementById('tsWaterfall1');
    const svg2 = document.getElementById('tsWaterfall2');
    if (!svg1 || !svg2) return;
    lastWfCfg = { cfgA: cfgA, cfgB: cfgB }; // トグルによる再描画用に保持
    const NAVY = '#0f2a4a', BLUE = '#3b6ea5', RED = '#a83d3d';
    const fmtNum = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));

    // 起点バー + 各フローバー + 最終積み上げバー(法人+個人) を構築する
    function buildBars(cfg) {
      let running = cfg.start;
      const bars = [{ type: 'single', label: '現金', tag: cfg.startTag, top: Math.max(0, running), bottom: Math.min(0, running), color: NAVY, amount: fmtNum(running), runAfter: running, zero: false }];
      cfg.flows.forEach(function (f) {
        const prev = running;
        running += f.delta;
        bars.push({
          type: 'single', label: f.label, tag: f.tag,
          top: Math.max(prev, running), bottom: Math.min(prev, running),
          color: f.delta >= 0 ? BLUE : RED,
          amount: f.delta === 0 ? '' : ((f.delta >= 0 ? '+' : '△') + fmtNum(Math.abs(f.delta))),
          runAfter: running, zero: f.delta === 0,
          checkpoint: f.checkpoint || null,
        });
      });
      bars.push({ type: 'stacked', label: cfg.finalLabel, tag: cfg.finalTag, corp: cfg.corp, indiv: cfg.indiv, total: cfg.corp + cfg.indiv, runAfter: cfg.corp + cfg.indiv });
      return bars;
    }

    const barsA = buildBars(cfgA);
    const barsB = buildBars(cfgB);

    // 両パターン共通の縦軸スケール(モノサシを揃える)
    let gMax = 0, gMin = 0;
    [barsA, barsB].forEach(function (bs) {
      bs.forEach(function (b) {
        if (b.type === 'stacked') { gMax = Math.max(gMax, b.total); }
        else { gMax = Math.max(gMax, b.top, b.runAfter); gMin = Math.min(gMin, b.bottom, b.runAfter); }
      });
    });
    if (gMax === gMin) gMax = gMin + 1;

    const plotXStart = 34, plotXEnd = 712, plotW = plotXEnd - plotXStart;
    const bandH = 200, baseTop = 46, baseBottom = baseTop + bandH;
    const pxPerMan = bandH / (gMax - gMin);
    const yOf = (v) => baseBottom - (v - gMin) * pxPerMan;

    // 1パターン(バー配列)を独立したSVGとして描画する
    function renderChart(bars) {
      const zeroY = yOf(0);
      const N = bars.length;
      const slotW = plotW / N;
      const barW = Math.min(66, slotW * 0.64);
      let out = '';
      out += `<line x1="${plotXStart - 6}" y1="${zeroY.toFixed(1)}" x2="${plotXEnd}" y2="${zeroY.toFixed(1)}" stroke="#e3e6ea" stroke-width="1"/>`;

      bars.forEach(function (b, i) {
        const x = plotXStart + i * slotW + (slotW - barW) / 2;
        const cx = x + barW / 2;
        // コネクター(前バーのrunAfter → 現バー左端)
        if (i > 0) {
          const prevB = bars[i - 1];
          const connY = yOf(prevB.runAfter);
          const prevX = plotXStart + (i - 1) * slotW + (slotW - barW) / 2 + barW;
          out += `<line x1="${prevX.toFixed(1)}" y1="${connY.toFixed(1)}" x2="${x.toFixed(1)}" y2="${connY.toFixed(1)}" stroke="#c7ccd3" stroke-width="1" stroke-dasharray="3,2"/>`;
        }
        // 項目ラベル(基準線下)＋A〜Hタグ(丸囲みレター)
        out += `<text x="${cx.toFixed(1)}" y="${(baseBottom + 17).toFixed(1)}" font-size="12" fill="#56626f" text-anchor="middle">${b.label}</text>`;
        if (b.tag) {
          out += `<circle cx="${cx.toFixed(1)}" cy="${(baseBottom + 34).toFixed(1)}" r="8" fill="#0f2a4a"/>`;
          out += `<text x="${cx.toFixed(1)}" y="${(baseBottom + 37.5).toFixed(1)}" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">${b.tag}</text>`;
        }
        // 保険加入チェックポイント: 隣接バーの頂点より上に出し、白背景ピル＋引き出し線で明示(重なり回避)
        if (b.checkpoint && showInsuranceMark && i < N - 1) {
          const nextLeft = plotXStart + (i + 1) * slotW + (slotW - barW) / 2;
          const mx = (x + barW + nextLeft) / 2;
          const my = yOf(b.runAfter);
          const pillW = 52, pillH = 16;
          // ピルは全バーの金額ラベルより上の最上部帯に固定配置し、引き出し線で接続点(保険加入時点)を示す(重なり回避)
          const pillCY = 16;
          out += `<line x1="${mx.toFixed(1)}" y1="${my.toFixed(1)}" x2="${mx.toFixed(1)}" y2="${(pillCY + pillH / 2).toFixed(1)}" stroke="#3b6ea5" stroke-width="1"/>`;
          out += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="2.5" fill="#3b6ea5"/>`;
          out += `<rect x="${(mx - pillW / 2).toFixed(1)}" y="${(pillCY - pillH / 2).toFixed(1)}" width="${pillW}" height="${pillH}" rx="8" fill="#fff" stroke="#3b6ea5" stroke-width="1"/>`;
          out += `<text x="${mx.toFixed(1)}" y="${(pillCY + 3.5).toFixed(1)}" font-size="10" font-weight="bold" fill="#3b6ea5" text-anchor="middle">${b.checkpoint}</text>`;
        }

        if (b.type === 'stacked') {
          const yZero = yOf(0);
          const yCorpTop = yOf(b.corp);
          const yTotalTop = yOf(b.total);
          // 最終残高は薄い塗り＋濃い文字。文字がバー幅からはみ出しても白背景上で読めるようにする
          const CORPFILL = '#c6d3e2', CORPTEXT = '#0f2a4a';   // 法人(ネイビー系の淡色)
          const INDIVFILL = '#dfe4ea', INDIVTEXT = '#41505f'; // 個人(スレート系の淡色)
          if (b.corp > 0) {
            out += `<rect x="${x.toFixed(1)}" y="${yCorpTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${(yZero - yCorpTop).toFixed(1)}" fill="${CORPFILL}" stroke="#b3bfcd" stroke-width="0.75"/>`;
            out += `<text x="${cx.toFixed(1)}" y="${((yCorpTop + yZero) / 2 + 4).toFixed(1)}" font-size="11" font-weight="bold" fill="${CORPTEXT}" text-anchor="middle">法人 ${fmtNum(b.corp)}</text>`;
          }
          if (b.indiv > 0) {
            out += `<rect x="${x.toFixed(1)}" y="${yTotalTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${(yCorpTop - yTotalTop).toFixed(1)}" fill="${INDIVFILL}" stroke="#b3bfcd" stroke-width="0.75"/>`;
            out += `<text x="${cx.toFixed(1)}" y="${((yTotalTop + yCorpTop) / 2 + 4).toFixed(1)}" font-size="11" font-weight="bold" fill="${INDIVTEXT}" text-anchor="middle">個人 ${fmtNum(b.indiv)}</text>`;
          }
          // 合計を上に強調表示
          out += `<text x="${cx.toFixed(1)}" y="${(yTotalTop - 8).toFixed(1)}" font-size="14" font-weight="bold" fill="#0f2a4a" text-anchor="middle">計 ${fmtNum(b.total)}</text>`;
        } else if (b.zero) {
          // 発生しない項目: バーなし、基準線レベルの通過線のみ
          out += `<line x1="${x.toFixed(1)}" y1="${yOf(b.runAfter).toFixed(1)}" x2="${(x + barW).toFixed(1)}" y2="${yOf(b.runAfter).toFixed(1)}" stroke="#c7ccd3" stroke-width="1" stroke-dasharray="3,2"/>`;
        } else {
          const yTop = yOf(b.top), yBot = yOf(b.bottom);
          const h = Math.max(1, yBot - yTop);
          out += `<rect x="${x.toFixed(1)}" y="${yTop.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${b.color}"/>`;
          const amtColor = b.color === RED ? '#a83d3d' : (b.color === BLUE ? '#2d5580' : '#0f2a4a');
          out += `<text x="${cx.toFixed(1)}" y="${(yTop - 6).toFixed(1)}" font-size="12" font-weight="bold" fill="${amtColor}" text-anchor="middle">${b.amount}</text>`;
        }
      });
      return out;
    }

    svg1.innerHTML = renderChart(barsA);
    svg2.innerHTML = renderChart(barsB);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const cash = num('cash');
    const capital = num('capital');
    const corpTaxRate = num('corpTaxRate');
    const incomeTaxRate = num('incomeTaxRate');
    const inheritanceTaxRate = num('inheritanceTaxRate');
    const stockInheritanceValue = num('stockInheritanceValue');
    const stockCorpValue = num('stockCorpValue');
    const insuranceGainRate = num('insuranceGainRate');

    const fields = { cash, capital, corpTaxRate, incomeTaxRate, inheritanceTaxRate, stockInheritanceValue, stockCorpValue, insuranceGainRate };
    const MAX_AMOUNT = 999999; // 万円(桁あふれ・表示崩れ防止)
    const MAX_RATE = 1000; // %(桁あふれ防止のための上限)
    const rateKeys = ['corpTaxRate', 'incomeTaxRate', 'inheritanceTaxRate', 'insuranceGainRate'];
    for (const [key, field] of Object.entries(fields)) {
      if (isNaN(field.value)) {
        showError('すべての項目を入力してください。');
        field.el.focus();
        return;
      }
      const isRate = rateKeys.indexOf(key) >= 0;
      const limit = isRate ? MAX_RATE : MAX_AMOUNT;
      if (Math.abs(field.value) > limit) {
        showError(isRate ? `率は ${MAX_RATE}% 以内で入力してください。` : `金額は ${man(MAX_AMOUNT)} 以内で入力してください。`);
        field.el.focus();
        return;
      }
    }

    // 法人の現金が、②で遺族から金庫株を買い取れる最低額を下回っていないか(手入力時のガード)
    const cashReq = computeCashMin();
    if (!isNaN(cashReq.min) && cash.value < cashReq.min) {
      showError(`法人の現金(死亡保険金額)が不足しています。②で金庫株を買い取る(遺族からの自社株買い)には、最低 ${man(Math.ceil(cashReq.min))} が必要です。`);
      cash.el.focus();
      return;
    }

    // --- ① 給与を原資として自社株の相続税を負担する場合 ---
    const s1_salary = cash.value; // 給与として全額支給
    const s1_salaryTax = s1_salary * incomeTaxRate.value / 100; // 所得税・住民税・社保
    const s1_presidentNet = s1_salary - s1_salaryTax; // 社長の手残り
    const s1_insuranceGain = s1_presidentNet * insuranceGainRate.value / 100; // 保険差益
    const s1_afterInsurance = s1_presidentNet + s1_insuranceGain;
    const s1_cashInheritanceTax = s1_afterInsurance * inheritanceTaxRate.value / 100; // 現金の相続税
    const s1_afterCashTax = s1_afterInsurance - s1_cashInheritanceTax;
    const s1_stockInheritanceTax = stockInheritanceValue.value * inheritanceTaxRate.value / 100; // 自社株の相続税
    const s1_final = s1_afterCashTax - s1_stockInheritanceTax; // 遺族の最終手残り(法人残高は0)

    // --- ② 金庫株を原資として自社株の相続税を負担する場合 ---
    const s2_corpTax = cash.value * corpTaxRate.value / 100; // 法人税
    const s2_afterCorpTax = cash.value - s2_corpTax;
    const s2_insuranceGain = s2_afterCorpTax * insuranceGainRate.value / 100; // 保険差益
    const s2_insuranceTax = s2_insuranceGain * corpTaxRate.value / 100; // 保険差益への法人税
    const s2_corpAfterInsurance = s2_insuranceGain - s2_insuranceTax + s2_afterCorpTax;
    const s2_buyback = stockCorpValue.value; // 遺族から自社株買い(法人税法上評価額で買取)
    const s2_corpFinal = s2_corpAfterInsurance - s2_buyback; // 法人の最終残高

    const s2_individualProceeds = stockCorpValue.value; // 金庫株売却収入
    const s2_stockInheritanceTax = stockInheritanceValue.value * inheritanceTaxRate.value / 100; // 自社株の相続税
    const s2_afterInheritanceTax = s2_individualProceeds - s2_stockInheritanceTax;
    const s2_capitalGainsTax = (stockCorpValue.value - capital.value - s2_stockInheritanceTax) * 0.2; // 譲渡所得税等(取得費加算の特例)
    const s2_individualFinal = s2_afterInheritanceTax - s2_capitalGainsTax; // 個人の最終手残り

    const s2_total = s2_corpFinal + s2_individualFinal; // 法人+個人 合計残高
    const s1_total = s1_final; // 法人残高0のため個人のみ

    // --- 結果表示(左右で同じ項目・同じものさしの統一表) ---
    const RED = '#a83d3d', BLUE = '#2d5580', GRAY = '#8d97a3', NAVY = '#0f2a4a';
    const fill = (id, text, color) => { const el = document.getElementById(id); if (el) { el.innerHTML = unitize(text); el.style.color = color || ''; } };
    const ded = (n) => (n >= 0 ? '△' + man(n) : '＋' + man(-n)); // 減算(マイナスは還付として＋)
    const add = (n) => (n >= 0 ? '＋' + man(n) : '△' + man(-n)); // 加算
    const zeroC = (n) => (n === 0 ? GRAY : null);

    // ① 給与を原資に個人で負担
    fill('s1Cash', man(s1_salary), NAVY);
    fill('s1TaxSalary', s1_salaryTax === 0 ? man(0) : ded(s1_salaryTax), s1_salaryTax === 0 ? GRAY : RED);
    fill('s1TaxCorp', man(0), GRAY);
    fill('s1Insured', man(s1_presidentNet), NAVY);
    fill('s1Gain', s1_insuranceGain === 0 ? man(0) : add(s1_insuranceGain), s1_insuranceGain === 0 ? GRAY : BLUE);
    fill('s1TaxDiff', man(0), GRAY);
    fill('s1TaxInherit', ded(s1_cashInheritanceTax + s1_stockInheritanceTax), RED);
    fill('s1TaxCapGain', man(0), GRAY);
    fill('s1BalCorp', man(0), GRAY);
    fill('s1BalIndiv', man(s1_final), NAVY);
    fill('s1BalTotal', man(s1_final), BLUE);

    // ② 金庫株を原資に法人で負担
    fill('s2Cash', man(cash.value), NAVY);
    fill('s2TaxSalary', man(0), GRAY);
    fill('s2TaxCorp', ded(s2_corpTax), RED);
    fill('s2Insured', man(s2_afterCorpTax), NAVY);
    fill('s2Gain', add(s2_insuranceGain), BLUE);
    fill('s2TaxDiff', ded(s2_insuranceTax), RED);
    fill('s2TaxInherit', ded(s2_stockInheritanceTax), RED);
    fill('s2TaxCapGain', ded(s2_capitalGainsTax), s2_capitalGainsTax >= 0 ? RED : BLUE);
    fill('s2BalCorp', man(s2_corpFinal), NAVY);
    fill('s2BalIndiv', man(s2_individualFinal), NAVY);
    fill('s2BalTotal', man(s2_total), BLUE);

    // 税金の計算内訳(?ツールチップ)を実際の数値で組み立てる
    const setTip = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setTip('tipS1TaxSalary', `給与支給額 ${man(s1_salary)} × 所得税・社保率 ${incomeTaxRate.value}% ＝ ${man(s1_salaryTax)}。役員給与として支給する際の所得税・住民税・社会保険料です。`);
    setTip('tipS1TaxInherit', `現金分 ${man(s1_afterInsurance)} × ${inheritanceTaxRate.value}% ＝ ${man(s1_cashInheritanceTax)}、自社株分 ${man(stockInheritanceValue.value)} × ${inheritanceTaxRate.value}% ＝ ${man(s1_stockInheritanceTax)}。合計 ${man(s1_cashInheritanceTax + s1_stockInheritanceTax)}(手元現金と自社株の両方に相続税)。`);
    setTip('tipS2TaxCorp', `現金(死亡保険金) ${man(cash.value)} × 法人税率 ${corpTaxRate.value}% ＝ ${man(s2_corpTax)}。受け取った死亡保険金は法人の益金となり法人税が課税されます。`);
    setTip('tipS2TaxDiff', `保険差益 ${man(s2_insuranceGain)} × 法人税率 ${corpTaxRate.value}% ＝ ${man(s2_insuranceTax)}。保険金を原資に生じた差益にも法人税が課税されます。`);
    setTip('tipS2TaxInherit', `自社株の相続税評価額 ${man(stockInheritanceValue.value)} × 相続税率 ${inheritanceTaxRate.value}% ＝ ${man(s2_stockInheritanceTax)}。相続で取得した「自社株そのもの」にかかる相続税です。これを会社へ売却(金庫株化)して現金化した分には相続税はかからず、譲渡所得税(G)の対象になります。`);
    setTip('tipS2TaxCapGain', `(法人税法上評価額 ${man(stockCorpValue.value)} − 資本金 ${man(capital.value)} − 相続税 ${man(s2_stockInheritanceTax)}) × 約20% ＝ ${man(s2_capitalGainsTax)}。取得費加算の特例を前提とした金庫株売却益への課税です。`);

    document.getElementById('sumS1Total').innerHTML = unitize(man(s1_total));
    document.getElementById('sumS2Total').innerHTML = unitize(man(s2_total));
    const diff = s2_total - s1_total;
    const diffEl = document.getElementById('sumDiff');
    diffEl.innerHTML = unitize((diff >= 0 ? '+' : '') + man(diff));
    diffEl.style.color = diff >= 0 ? '#2d5580' : '#a83d3d';

    // ウォーターフォール: 両パターンとも同一の項目列(発生しない項目は0)・同一スケールで描画
    // 最終バーは「法人の残高＋個人の手残り」の積み上げにして合計を強調する
    drawWaterfall(
      {
        title: '① 給与を原資に個人で負担',
        start: cash.value, startTag: 'A',
        flows: [
          { label: '給与課税', delta: -s1_salaryTax, tag: 'B' },
          { label: '法人税', delta: 0, tag: 'C', checkpoint: '保険加入' },
          { label: '保険差益', delta: s1_insuranceGain, tag: 'D' },
          { label: '差益課税', delta: 0, tag: 'E' },
          { label: '相続税', delta: -(s1_cashInheritanceTax + s1_stockInheritanceTax), tag: 'F' },
          { label: '譲渡所得税', delta: 0, tag: 'G' },
        ],
        finalLabel: '最終残高', finalTag: 'H',
        corp: 0,
        indiv: s1_final,
      },
      {
        title: '② 金庫株を原資に法人で負担',
        start: cash.value, startTag: 'A',
        flows: [
          { label: '給与課税', delta: 0, tag: 'B' },
          { label: '法人税', delta: -s2_corpTax, tag: 'C', checkpoint: '保険加入' },
          { label: '保険差益', delta: s2_insuranceGain, tag: 'D' },
          { label: '差益課税', delta: -s2_insuranceTax, tag: 'E' },
          { label: '相続税', delta: -s2_stockInheritanceTax, tag: 'F' },
          { label: '譲渡所得税', delta: -s2_capitalGainsTax, tag: 'G' },
        ],
        finalLabel: '最終残高', finalTag: 'H',
        corp: s2_corpFinal,
        indiv: s2_individualFinal,
      }
    );

    lastResult = {
      diff,
      s1_salary: s1_salary, s1_salaryTax: s1_salaryTax, s1_presidentNet: s1_presidentNet,
      s1_insuranceGain: s1_insuranceGain, s1_cashInheritanceTax: s1_cashInheritanceTax,
      s1_stockInheritanceTax: s1_stockInheritanceTax, s1_final: s1_final, s1_total: s1_total,
      s2_corpTax: s2_corpTax, s2_insuranceGain: s2_insuranceGain, s2_insuranceTax: s2_insuranceTax,
      s2_buyback: s2_buyback, s2_corpFinal: s2_corpFinal, s2_stockInheritanceTax: s2_stockInheritanceTax,
      s2_capitalGainsTax: s2_capitalGainsTax, s2_individualFinal: s2_individualFinal, s2_total: s2_total,
    };

    resultArea.classList.remove('hidden');
    if (!suppressScroll) {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const resetBtn = document.getElementById('tsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      setCashMode(false); // 現金は自動計算モードに戻して再計算
      resultArea.classList.add('hidden');
      clearError();
    });
  }

  // ===== PDF出力 =====
  let lastResult = null;
  function doPrint() {
      if (!lastResult) {
        showError('先に「比較する」を押して結果を表示してください。');
        return;
      }
      const now = new Date();
      document.getElementById('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

      // PDFは従来の明細構成のまま。値は保存済みのlastResultから直接セットする(画面表の再編と切り離す)
      const r = lastResult;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = man(val); };
      set('pS1Salary', r.s1_salary);
      set('pS1SalaryTax', r.s1_salaryTax);
      set('pS1PresidentNet', r.s1_presidentNet);
      set('pS1InsuranceGain', r.s1_insuranceGain);
      set('pS1CashTax', r.s1_cashInheritanceTax);
      set('pS1StockTax', r.s1_stockInheritanceTax);
      set('pS1Final', r.s1_final);
      set('pS2CorpTax', r.s2_corpTax);
      set('pS2InsuranceGain', r.s2_insuranceGain);
      set('pS2InsuranceTax', r.s2_insuranceTax);
      set('pS2Buyback', r.s2_buyback);
      set('pS2CorpFinal', r.s2_corpFinal);
      set('pS2StockTax', r.s2_stockInheritanceTax);
      set('pS2CapitalGainsTax', r.s2_capitalGainsTax);
      set('pS2IndividualFinal', r.s2_individualFinal);
      set('pS2Total', r.s2_total);
      set('pSumS1', r.s1_total);
      set('pSumS2', r.s2_total);
      const pDiffEl = document.getElementById('pSumDiff');
      if (pDiffEl) pDiffEl.textContent = (r.diff >= 0 ? '+' : '') + man(r.diff);

      window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  // ===== 初期化: 法人の現金を自動計算モードで初期化し、ダミー値で自動試算(スクロールは抑制) =====
  setCashMode(false);
  suppressScroll = true;
  form.requestSubmit();
  suppressScroll = false;
});

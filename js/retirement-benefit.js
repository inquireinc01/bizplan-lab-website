/* ============================================================
   退職金×生命保険(1ページ完結)
   - このページの肝は「給与で受け取る場合と退職金で受け取る場合の手取り差」
   - 入力を確定(change)するたびに再計算し、最上部の比較グラフと数字が動く
   - 単位は数字より小さく表示し、金額はカンマ区切りにする(全体ルール)
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('rbTool');
  if (!root) return;

  const $ = (id) => document.getElementById(id);
  const errorArea = $('rbErrorArea');
  const inputs = Array.prototype.slice.call(root.querySelectorAll('input[id], select[id]'));

  /* ===== ？ツールチップ: タップでも開けるようにする ===== */
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

  /* ===== 数字と単位 =====
     万円・％などの単位は数字より小さく表示する(全ページ共通ルール) ===== */
  const UNIT_RE = /([0-9][0-9,.]*)\s*(万円|円|％|%|年|倍)/g;
  const withUnit = (txt) => String(txt).replace(UNIT_RE, '$1<span class="unit">$2</span>');
  // SVG内はspanが使えないのでtspanでフォントサイズを直接落とす
  const svgAmount = (txt, size) => String(txt).replace(UNIT_RE, function (m, n, u) {
    return `<tspan font-size="${size}">${n}</tspan><tspan font-size="${Math.round(size * 0.68)}"> ${u}</tspan>`;
  });
  const fmt = (n) => (window.numFmt ? window.numFmt(Math.round(n)) : Math.round(n).toLocaleString('ja-JP'));
  const man = (n) => fmt(n) + ' 万円';

  /* ===== 配色 ===== */
  const C_NET = '#0f2a4a';      // 手取り
  const C_ITAX = '#a83d3d';     // 所得税
  const C_RTAX = '#d79c9c';     // 住民税

  /* ===== 数値のカウントアップ ===== */
  const countState = {};
  const COUNT_MS = 800;
  function countUp(id, to, format) {
    const el = $(id);
    if (!el) return;
    const from = countState[id] === undefined ? 0 : countState[id];
    countState[id] = to;
    if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
    clearTimeout(el._countTimer);
    if (from === to) { el.innerHTML = withUnit(format(to)); return; }
    const start = performance.now();
    const step = function (now) {
      const p = Math.min(1, (now - start) / COUNT_MS);
      const e = 1 - Math.pow(1 - p, 3); // ease-out
      el.innerHTML = withUnit(format(from + (to - from) * e));
      if (p < 1) el._countRaf = requestAnimationFrame(step);
      else el._countRaf = null;
    };
    el._countRaf = requestAnimationFrame(step);
    // 非表示タブ等でrequestAnimationFrameが止まっても最終値は必ず表示する
    el._countTimer = setTimeout(function () {
      if (el._countRaf) { cancelAnimationFrame(el._countRaf); el._countRaf = null; }
      el.innerHTML = withUnit(format(to));
    }, COUNT_MS + 250);
  }

  /* ===== 比較の帯グラフ =====
     支給額を全体の幅とし、手取り／所得税／住民税に分けて塗る。
     A・Bで支給額は同じなので帯の長さも同じになり、手取り(濃紺)の長さの差が
     そのまま「退職金で受け取ることの得」になる。
     角丸は帯全体をclipPathで抜くことで、区分の境目が段差にならないようにする ===== */
  function drawSplitBar(svg, parts, cap) {
    if (!svg) return;
    const W = 560, BAR_X = 2, BAR_W = 556, BAR_Y = 4, BAR_H = 36;
    const RX = BAR_H / 2;
    const cid = svg.id + 'Clip';
    const gid = svg.id + 'Gloss';
    const defs = `<clipPath id="${cid}"><rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}"/></clipPath>`
      + `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">`
      + `<stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>`
      + `<stop offset="0.55" stop-color="#ffffff" stop-opacity="0.02"/>`
      + `<stop offset="1" stop-color="#000000" stop-opacity="0.07"/></linearGradient>`;

    if (!(cap > 0)) {
      svg.innerHTML = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${RX}" fill="#eff2f6"/>`
        + `<text x="${W / 2}" y="${BAR_Y + BAR_H / 2 + 6}" font-size="16" fill="#9ca3af" text-anchor="middle">金額を入力してください</text>`;
      return;
    }

    // 帯に入れる文字の必要幅を文字数から見積もる(半角0.55em・全角1em)
    const widthOf = (label, size) => {
      let need = size * 1.4;
      for (let k = 0; k < label.length; k += 1) need += /[0-9,.\s%]/.test(label[k]) ? size * 0.55 : size;
      return need;
    };

    let bars = `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="#eff2f6"/>`;
    let labels = '';
    let x = BAR_X;
    parts.forEach(function (p) {
      const v = Math.max(0, p.value);
      const w = (v / cap) * BAR_W;
      if (w <= 0) return;
      // 区分の継ぎ目に隙間が出ないよう0.6だけ重ねて描く
      bars += `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${(w + 0.6).toFixed(1)}" height="${BAR_H}" fill="${p.color}"/>`;
      const text = man(v);
      // 税額の区分は細くなりやすいので、収まる範囲でフォントを段階的に落として表示する
      let size = 0;
      for (let s = 15; s >= 10; s -= 1) {
        if (w >= widthOf(text, s)) { size = s; break; }
      }
      if (size) {
        labels += `<text x="${(x + w / 2).toFixed(1)}" y="${BAR_Y + BAR_H / 2 + size * 0.35}" fill="#ffffff" text-anchor="middle" font-weight="700">`
          + svgAmount(text, size) + `</text>`;
      }
      x += w;
    });
    bars += `<rect x="${BAR_X}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" fill="url(#${gid})"/>`;

    svg.innerHTML = `<defs>${defs}</defs><g clip-path="url(#${cid})">${bars}</g>${labels}`;
  }

  /* ===== 積立比較(40年) =====
     同じ原資を「役員報酬として受け取って個人で積み立てる(A)」場合と
     「法人が生命保険料として払い込む(B)」場合で、残高がどう開いていくかを見せる。
     Aは所得税・住民税・社会保険料が引かれた手取りしか積み立てられないのが差の源泉 ===== */
  const ACC_DEFER_COLOR = '#B7628D'; // 繰り延べられる法人税の棒の色
  // 積み立て方の4パターン。同時に表示できるのは2つまで(自社株の評価額グラフと同じ)
  const ACC_SCN = {
    persCash: { label: 'A.【個人】現金', short: 'A.【個人】現金', color: '#8b98a8' },
    persIns: { label: 'B.【個人】保険', short: 'B.【個人】保険', color: '#55677d' },
    corpCash: { label: 'C.【法人】現金', short: 'C.【法人】現金', color: '#3b6ea5' },
    corpIns: { label: 'D.【法人】保険', short: 'D.【法人】保険', color: '#0f2a4a' },
  };
  // 既定は「A. 給与で受取り個人で積立」のみ表示
  let accSelected = ['persCash'];
  // 繰延法人税の棒の表示。4つの積み立て方(2つまで)とは別ルールの専用トグル。既定は非表示
  let accShowDefer = false;
  let accSeries = null;
  let accLayout = null;
  let accAgeBase = 0;   // グラフ横軸の起点(契約年齢)
  let accNowYear = 0;   // 契約から現在までの経過年数(「現在」マーカー用)
  let accInsAmt = 0;    // 保険金額(保障ライン用)

  /* ===== 生命保険の設計書テーブル =====
     経過年数・年齢は自動、保険料累計と損金算入額は拠出年額・損金割合から自動で
     埋めるが設計書に合わせて上書き可能。解約返戻金を入れると返戻率と
     法人税軽減額累計が自動計算され、そのままグラフのDと折れ線になる ===== */
  const sheetBody = $('rbSheetBody');
  // 解約返戻金のダミー値: 定期保険らしいカーブにする。
  // 序盤は返戻率が低く、保険期間の6割経過あたりで85%程度のピークを迎え、
  // その後は高齢になるほど返戻金が下がっていく(保険期間満了に向けてゼロに近づく)。
  // カーブの形は積立年数ではなく「保険期間」で決まる
  function defaultSurr(t, term, annual) {
    if (term <= 0 || t > term) return 0;
    const tPeak = Math.max(1, Math.round(term * 0.6));
    let rate;
    if (t <= tPeak) {
      rate = 35 + 50 * (t / tPeak);                        // 35% → 85%
    } else if (term === tPeak) {
      rate = 85;
    } else {
      rate = 85 - 75 * ((t - tPeak) / (term - tPeak));     // 85% → 10%
    }
    return Math.round(annual * t * rate / 100);
  }

  /* ===== 損金算入額の自動判定 =====
     定期保険・第三分野保険の税務(法人税基本通達9-3-5・9-3-5の2)。
     保険期間と最高解約返戻率から、年ごとの損金算入額を計算する。
     - 最高解約返戻率50%以下: 全額損金
     - 50%超70%以下: 当初4割期間は保険料の40%を資産計上(60%損金)。
       ただし年換算保険料30万円以下の被保険者は全額損金
     - 70%超85%以下: 当初4割期間は保険料の60%を資産計上(40%損金)
     - 85%超: 当初10年は「保険料×最高返戻率×90%」を資産計上、
       11年目以降最高返戻率年までは同70%を資産計上。
       資産計上期間は最低5年(保険期間10年未満はその半分)
     資産計上した分は、85%超は解約返戻金が最高額となる年の翌年から、
     それ以外は保険期間の75%経過後から、保険期間満了まで均等に取り崩して損金に戻す ===== */
  function dedScheduleAuto(term, P, maxRate, tRateMax, tAmtMax, years) {
    const ded = [0];
    const N = Math.max(1, term);
    let mode, assetRatio = 0, verdict = '';
    const ratePct = (Math.round(maxRate * 1000) / 10).toLocaleString('ja-JP');
    if (maxRate <= 0.5) {
      mode = 'full';
      verdict = `最高解約返戻率${ratePct}％(50％以下) → 全額損金`;
    } else if (maxRate <= 0.7) {
      if (P <= 30) {
        mode = 'full';
        verdict = `最高解約返戻率${ratePct}％・年換算保険料30万円以下 → 全額損金`;
      } else {
        mode = 'part'; assetRatio = 0.4;
        verdict = `最高解約返戻率${ratePct}％(50％超70％以下) → 当初4割期間は60％損金`;
      }
    } else if (maxRate <= 0.85) {
      mode = 'part'; assetRatio = 0.6;
      verdict = `最高解約返戻率${ratePct}％(70％超85％以下) → 当初4割期間は40％損金`;
    } else {
      mode = 'high';
      verdict = `最高解約返戻率${ratePct}％(85％超) → 当初10年は${Math.round((1 - maxRate * 0.9) * 100)}％損金`;
    }

    if (mode === 'full') {
      for (let t = 1; t <= years; t += 1) ded.push(t <= N ? P : 0);
      return { ded: ded, verdict: verdict };
    }

    if (mode === 'part') {
      const a = Math.max(1, Math.round(N * 0.4));  // 資産計上期間(当初4割)
      const b = Math.round(N * 0.75);              // 取り崩し開始(75%経過後)
      const assetTotal = P * assetRatio * a;
      const rel = b < N ? assetTotal / (N - b) : assetTotal;
      for (let t = 1; t <= years; t += 1) {
        if (t > N) ded.push(0);
        else if (t <= a) ded.push(P * (1 - assetRatio));
        else if (t <= b) ded.push(P);
        else ded.push(P + rel);
      }
      return { ded: ded, verdict: verdict };
    }

    // mode === 'high' (最高解約返戻率85%超)
    let tAsset = Math.max(1, tRateMax || 1);
    const minAsset = N < 10 ? Math.round(N / 2) : 5;
    tAsset = Math.min(N, Math.max(tAsset, minAsset));
    let assetTotal = 0;
    const assetOf = (t) => (t <= Math.min(10, tAsset) ? P * maxRate * 0.9 : (t <= tAsset ? P * maxRate * 0.7 : 0));
    for (let t = 1; t <= tAsset; t += 1) assetTotal += assetOf(t);
    const ts = Math.min(N, Math.max(tAsset, tAmtMax || tAsset)); // 取り崩し開始(返戻金最高額の年)
    const rel = ts < N ? assetTotal / (N - ts) : assetTotal;
    for (let t = 1; t <= years; t += 1) {
      if (t > N) ded.push(0);
      else if (t <= tAsset) ded.push(P - assetOf(t));
      else if (t <= ts) ded.push(P);
      else ded.push(P + rel);
    }
    return { ded: ded, verdict: verdict };
  }
  // 入力するのは解約返戻金だけ。それ以外の列はすべて自動計算で埋める。
  // 上書きした返戻金セルは自動再入力しない(dirtyフラグ)。空に戻すと自動値に戻る
  function buildSheet(years, ageNow, annual, term) {
    if (!sheetBody) return;
    const rows = sheetBody.querySelectorAll('tr');
    const needRebuild = rows.length !== years;
    if (needRebuild) {
      let html = '';
      for (let t = 1; t <= years; t += 1) {
        const def = defaultSurr(t, term, annual);
        html += `<tr>`
          + `<td class="is-auto">${t}年</td>`
          + `<td class="is-auto" id="rbShAge_${t}">${ageNow + t}歳</td>`
          + `<td class="is-auto" id="rbShCum_${t}">-</td>`
          + `<td><input type="number" id="rbShSurr_${t}" data-def="${def}" class="rb-sheet-in" value="${def}" /></td>`
          + `<td class="is-auto" id="rbShRate_${t}">-</td>`
          + `<td class="is-auto" id="rbShDed_${t}">-</td>`
          + `<td class="is-auto" id="rbShDefer_${t}">-</td>`
          + `</tr>`;
      }
      sheetBody.innerHTML = html;
      // 保存済みの上書き値があれば復元(保存されているセル=ユーザーが上書きしたセル)
      sheetBody.querySelectorAll('.rb-sheet-in').forEach(function (el) {
        if (savedSheet[el.id] !== undefined) {
          el.value = savedSheet[el.id];
          el.dataset.dirty = '1';
        }
      });
    } else {
      // 行数が同じときは、年齢と「上書きされていない返戻金」の自動値だけ更新する
      for (let t = 1; t <= years; t += 1) {
        const ageEl = $('rbShAge_' + t);
        if (ageEl) ageEl.textContent = (ageNow + t) + '歳';
        const surrEl = $('rbShSurr_' + t);
        if (surrEl) {
          const def = defaultSurr(t, term, annual);
          surrEl.dataset.def = def;
          if (surrEl.dataset.dirty !== '1') surrEl.value = def;
        }
      }
    }
  }
  // 解約返戻金(入力)以外を自動計算して表に反映し、グラフ用の系列を返す。
  // 損金算入額は「自動判定」なら税務ルールで年ごとに、それ以外は一律割合で計算する
  function collectSheet(years, annual, term, lossMode, lossRate, corpTaxRate) {
    const cum = [0], surr = [0], rate = [0];
    let maxRate = 0, tRateMax = 0, maxAmt = 0, tAmtMax = 0;
    // 1周目: 返戻金を読み取り、返戻率と最高解約返戻率(とその年)を求める
    for (let t = 1; t <= years; t += 1) {
      const c = annual * t;                      // 保険料累計(自動)
      const surrEl = $('rbShSurr_' + t);
      const sv = surrEl ? (window.numClean ? window.numClean(surrEl.value) : parseFloat(surrEl.value)) : NaN;
      const s = isNaN(sv) ? 0 : sv;
      const r = c > 0 ? s / c : 0;
      cum.push(c); surr.push(s); rate.push(r);
      if (r > maxRate) { maxRate = r; tRateMax = t; }
      if (s > maxAmt) { maxAmt = s; tAmtMax = t; }
    }
    // 2周目: 損金算入額(年ごと)と法人税軽減額累計
    let dedArr, verdict = '';
    if (lossMode === 'auto') {
      const res = dedScheduleAuto(term, annual, maxRate, tRateMax, tAmtMax, years);
      dedArr = res.ded;
      verdict = res.verdict;
    } else {
      dedArr = [0];
      for (let t = 1; t <= years; t += 1) dedArr.push(annual * lossRate / 100);
    }
    const deferCum = [0];
    let dedSum = 0;
    for (let t = 1; t <= years; t += 1) {
      dedSum += dedArr[t];
      deferCum.push(dedSum * corpTaxRate / 100);
      const cumEl = $('rbShCum_' + t);
      if (cumEl) cumEl.innerHTML = withUnit(fmt(cum[t]) + '万円');
      const rateEl = $('rbShRate_' + t);
      if (rateEl) rateEl.innerHTML = cum[t] > 0 ? withUnit((Math.round(rate[t] * 1000) / 10).toLocaleString('ja-JP') + '％') : '-';
      const dedEl = $('rbShDed_' + t);
      if (dedEl) dedEl.innerHTML = withUnit(fmt(Math.round(dedArr[t])) + '万円');
      const deferEl = $('rbShDefer_' + t);
      if (deferEl) deferEl.innerHTML = withUnit(fmt(Math.round(deferCum[t])) + '万円');
    }
    const verdictEl = $('rbAccLossVerdict');
    if (verdictEl) verdictEl.innerHTML = lossMode === 'auto' ? withUnit(verdict) : '';
    return { cum: cum, surr: surr, rate: rate, deferCum: deferCum };
  }
  // 設計書のセルの変更で再計算。空に戻したセルは自動値に戻す
  if (sheetBody) {
    sheetBody.addEventListener('change', function (e) {
      const el = e.target.closest('.rb-sheet-in');
      if (!el) return;
      if (String(el.value).trim() === '') {
        delete el.dataset.dirty;
        el.value = el.dataset.def;
      } else {
        el.dataset.dirty = '1';
      }
      render();
    });
  }

  // A・Bは流出率、Cは法人税率、Dは設計書(解約返戻金・損金算入額×法人税率)を反映する
  function buildAccSeries(annual, years, outflowRate, corpTaxRate, sheet) {
    const netAnnual = annual * (1 - outflowRate / 100);        // 個人の手取り
    const corpNetAnnual = annual * (1 - corpTaxRate / 100);    // 法人の税引後
    const series = [{ year: 0, persCash: 0, persIns: 0, corpCash: 0, corpIns: 0, defer: 0 }];
    for (let t = 1; t <= years; t += 1) {
      series.push({
        year: t,
        persCash: netAnnual * t,
        persIns: netAnnual * t * sheet.rate[t], // 個人契約でも返戻率カーブは設計書と同じ前提
        corpCash: corpNetAnnual * t,
        corpIns: sheet.surr[t],                 // 設計書の解約返戻金そのもの
        defer: sheet.deferCum[t],
      });
    }
    return series;
  }

  function drawAccChart(series) {
    const svg = $('rbAccChart');
    if (!svg) return;
    const W = 800, H = 320, padL = 78, padR = 24, padT = 20, padB = 40, SVG_W = 830;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const yBottom = H - padB;
    const xRight = W - padR;

    // 繰延法人税の棒は4つの積み立て方とは別に、専用トグルで表示を選べる(左目盛りで統一)
    const showDefer = accShowDefer;
    const barKeys = accSelected.slice();
    if (showDefer) barKeys.push('defer');
    const activeKeys = accSelected;
    const rawMax = Math.max.apply(null, series.flatMap((p) => barKeys.map((k) => p[k])).concat([1]));
    const maxV = rawMax * 1.08;
    const y = (v) => yBottom - (v / (maxV || 1)) * plotH;

    const slotWidth = plotW / series.length;

    let gridLines = '';
    for (let i = 0; i <= 4; i += 1) {
      const gy = y((maxV * i) / 4);
      gridLines += `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${xRight}" y2="${gy.toFixed(1)}" stroke="#e3e6ea" stroke-width="1"/>`;
      gridLines += `<text x="${padL - 10}" y="${(gy + 4).toFixed(1)}" font-size="11" fill="#9aa1ab" text-anchor="end">${Math.round((maxV * i) / 4).toLocaleString('ja-JP')}</text>`;
    }

    // 自社株の推移グラフと同じ「少しずらして重ねる」グループ棒。
    // 透過色で重ねることで、ボリュームの差が塗りの濃さとしても見えるようにする
    const barWidth = slotWidth * 0.68;
    const overlapOffset = barWidth / 3;
    const groupWidth = barWidth + overlapOffset * (barKeys.length - 1);
    let bars = '';
    barKeys.forEach(function (key, si) {
      const color = key === 'defer' ? ACC_DEFER_COLOR : ACC_SCN[key].color;
      series.forEach(function (p, i) {
        const barY = y(p[key]);
        const barH = Math.max(0, yBottom - barY);
        if (barH <= 0) return;
        const groupStart = padL + i * slotWidth + (slotWidth - groupWidth) / 2;
        const barX = groupStart + si * overlapOffset;
        const delay = (i * 20 + si * 15).toFixed(0);
        bars += `<rect class="chart-bar" x="${barX.toFixed(1)}" y="${barY.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}"`
          + ` fill="${color}" fill-opacity="0.5" stroke="#2b323d" stroke-width="0.5" stroke-opacity="0.1" rx="1.5" style="animation-delay:${delay}ms"/>`;
      });
    });

    // 横軸は年齢で表示する(契約年齢〜退職年齢)
    let xLabels = '';
    const last = series.length - 1;
    const stepYear = last > 45 ? 10 : 5;
    const ageLabel = (yr) => (accAgeBase > 0 ? (accAgeBase + yr) + '歳' : (yr === 0 ? '契約時' : yr + '年'));
    for (let yr = 0; yr <= last; yr += stepYear) {
      if (last % stepYear !== 0 && yr > last - stepYear * 0.6) break; // 端のラベルと重なるものは省く
      const gx = padL + yr * slotWidth + slotWidth / 2;
      xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${ageLabel(yr)}</text>`;
    }
    if (last > 0) {
      const gx = padL + last * slotWidth + slotWidth / 2;
      if (last % stepYear !== 0) {
        xLabels += `<text x="${gx.toFixed(1)}" y="${H - padB + 20}" font-size="11" fill="#9aa1ab" text-anchor="middle">${ageLabel(last)}</text>`;
      }
    }

    // 「現在」の位置(契約年齢<現在の年齢<退職年齢のとき): 破線の縦ラインとフラッグ
    let nowMark = '';
    if (accNowYear > 0 && accNowYear <= last) {
      const gx = padL + accNowYear * slotWidth + slotWidth / 2;
      nowMark = `<line x1="${gx.toFixed(1)}" y1="${padT}" x2="${gx.toFixed(1)}" y2="${yBottom}" stroke="#55677d" stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity="0.7"/>`
        + `<rect x="${(gx - 22).toFixed(1)}" y="${padT}" width="44" height="16" rx="8" fill="#55677d"/>`
        + `<text x="${gx.toFixed(1)}" y="${padT + 11.5}" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">現在</text>`;
    }

    // 保険金額の保障ライン(Dを表示しているときだけ)。スケールには含めず、上限を超えたら天井に張り付く
    let insMark = '';
    if (accInsAmt > 0 && activeKeys.indexOf('corpIns') >= 0) {
      const yIns = Math.max(padT, y(accInsAmt));
      insMark = `<line x1="${padL}" y1="${yIns.toFixed(1)}" x2="${xRight}" y2="${yIns.toFixed(1)}" stroke="rgba(131,47,47,0.75)" stroke-width="1.4" stroke-dasharray="6 4"/>`
        + `<text x="${padL + 6}" y="${(yIns - 6).toFixed(1)}" font-size="11" fill="rgba(131,47,47,0.9)" font-weight="700">死亡保険金 ${fmt(accInsAmt)}万円</text>`;
    }

    svg.innerHTML = `${gridLines}`
      + `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`
      + `<line x1="${padL}" y1="${yBottom}" x2="${xRight}" y2="${yBottom}" stroke="#e3e6ea" stroke-width="1"/>`
      + `${xLabels}${bars}${insMark}${nowMark}`;

    accLayout = { W: SVG_W, padL: padL, slotWidth: slotWidth, count: series.length };
  }

  /* ===== 積立グラフのツールチップ(年次の内訳を出す) ===== */
  const accTooltip = $('rbAccTooltip');
  const accWrap = $('rbAccWrap');
  const accSvg = $('rbAccChart');
  function onAccMove(e) {
    if (!accSeries || !accLayout || !accTooltip) return;
    const rect = accSvg.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY;
    const xViewbox = ((clientX - rect.left) / rect.width) * accLayout.W;
    const idx = Math.floor((xViewbox - accLayout.padL) / accLayout.slotWidth);
    if (idx < 0 || idx >= accLayout.count) { accTooltip.classList.add('hidden'); return; }
    const p = accSeries[idx];
    const head = accAgeBase > 0 ? (accAgeBase + p.year) + '歳' + (p.year === 0 ? '(契約時)' : '') : (p.year === 0 ? '契約時' : p.year + '年後');
    let rows = accSelected.map(function (key) {
      return `<p class="flex justify-between gap-3"><span class="text-gray-500">${ACC_SCN[key].short}</span><span class="font-bold">${withUnit(man(p[key]))}</span></p>`;
    }).join('');
    if (accShowDefer) {
      rows += `<p class="flex justify-between gap-3"><span class="text-gray-500">法人税の繰延累計</span><span class="font-bold" style="color:#B7628D">${withUnit(man(p.defer))}</span></p>`;
    }
    if (accSelected.length === 2) {
      const d = p[accSelected[1]] - p[accSelected[0]];
      rows += `<p class="flex justify-between gap-3 mt-1 pt-1 border-t border-gray-200"><span class="text-gray-500">差</span><span class="font-black text-[#0f2a4a]">${withUnit(man(Math.abs(d)))}</span></p>`;
    }
    accTooltip.innerHTML = `<p class="font-black mb-1">${head}</p>` + rows;
    accTooltip.classList.remove('hidden');
    const wrapRect = accWrap.getBoundingClientRect();
    const tw = accTooltip.offsetWidth;
    let left = clientX - wrapRect.left + 14;
    if (left + tw > wrapRect.width) left = clientX - wrapRect.left - tw - 14;
    accTooltip.style.left = Math.max(0, left) + 'px';
    accTooltip.style.top = Math.max(0, clientY - wrapRect.top - 10) + 'px';
  }
  if (accSvg) {
    accSvg.addEventListener('mousemove', onAccMove);
    accSvg.addEventListener('mouseleave', function () { accTooltip.classList.add('hidden'); });
    accSvg.addEventListener('touchstart', onAccMove);
    accSvg.addEventListener('touchmove', function (e) { onAccMove(e); e.preventDefault(); }, { passive: false });
  }

  /* ===== 積み立て方のタイル選択 =====
     自社株の評価額タイルと同じ: ランプ点灯で選択を示し、同時表示は2つまで。
     3つ目を選ぶと先に選んでいたものが外れる ===== */
  const accPicker = $('rbAccPicker');
  function renderAccPicker() {
    if (!accPicker) return;
    accPicker.querySelectorAll('.rb-acc-pick').forEach(function (btn) {
      const key = btn.dataset.scn;
      const selected = accSelected.indexOf(key) >= 0;
      const lamp = btn.querySelector('.tile-lamp');
      if (lamp) lamp.classList.toggle('is-lit', selected);
      btn.classList.toggle('tile-selected', selected);
      btn.style.backgroundColor = selected ? btn.dataset.color : '';
      btn.style.borderColor = selected ? btn.dataset.color : '';
    });
    const legend = $('rbAccLegend');
    if (legend) {
      let html = accSelected.map(function (key) {
        return `<span class="rb-legend-item"><i class="rb-sw" style="background:${ACC_SCN[key].color}"></i>${ACC_SCN[key].label}</span>`;
      }).join('');
      if (accShowDefer) {
        html += `<span class="rb-legend-item"><i class="rb-sw" style="background:${ACC_DEFER_COLOR}"></i>繰り延べられる法人税の累計</span>`;
      }
      html += `<span class="rb-legend-note">目盛りは万円</span>`;
      legend.innerHTML = html;
    }
  }
  // 繰延法人税トグル(積み立て方の選択とは独立)
  const deferToggleBtn = $('rbDeferToggleBtn');
  if (deferToggleBtn) {
    deferToggleBtn.classList.toggle('is-on', accShowDefer);
    deferToggleBtn.addEventListener('click', function () {
      accShowDefer = !accShowDefer;
      deferToggleBtn.classList.toggle('is-on', accShowDefer);
      render();
    });
  }
  if (accPicker) {
    accPicker.addEventListener('click', function (e) {
      const btn = e.target.closest('.rb-acc-pick');
      if (!btn) return;
      const key = btn.dataset.scn;
      const idx = accSelected.indexOf(key);
      if (idx >= 0) {
        if (accSelected.length > 1) accSelected.splice(idx, 1); // 最後の1つは外せない
      } else {
        if (accSelected.length >= 2) accSelected.shift();
        accSelected.push(key);
      }
      render();
    });
  }

  /* ===== 損金割合の切替 =====
     プルダウンで選ぶ(数値欄はグレーアウトして入力不可)。
     選択肢にない割合を使いたいときだけ「手入力」で直接入力できるようにする ===== */
  const lossSelect = $('rbAccLossSelect');
  const lossInput = $('rbAccLossRate');
  function syncLossSeg() {
    if (!lossSelect || !lossInput) return;
    // データクリア等で選択が空になった場合は既定の自動判定に戻す
    if (lossSelect.value === '') lossSelect.value = 'auto';
    const mode = lossSelect.value;
    lossInput.disabled = mode !== 'manual';
    if (mode === 'auto') {
      // 自動判定では%欄は使わない(判定結果は下の1行に表示)
      lossInput.value = '';
      lossInput.classList.remove('input-error');
    } else if (mode !== 'manual') {
      lossInput.value = mode;
    } else if (String(lossInput.value || '').trim() === '') {
      // 手入力に切り替えた直後の初期値
      lossInput.value = '100';
    }
  }
  if (lossSelect && lossInput) {
    lossSelect.addEventListener('change', function () {
      const manual = lossSelect.value === 'manual';
      syncLossSeg();
      if (manual) {
        lossInput.focus();
        lossInput.select();
      }
      // render()はselectのchangeで共通ハンドラからも呼ばれるが、
      // 値の同期を先に済ませるためここでも明示的に呼ぶ
      render();
    });
  }

  /* ===== 税額の計算 ===== */
  // 2024年分 所得税速算表(円ベース)
  function incomeTaxJP(taxableIncomeYen) {
    const x = Math.max(0, taxableIncomeYen);
    const brackets = [
      [1950000, 0.05, 0],
      [3300000, 0.10, 97500],
      [6950000, 0.20, 427500],
      [9000000, 0.23, 636000],
      [18000000, 0.33, 1536000],
      [40000000, 0.40, 2796000],
      [Infinity, 0.45, 4796000],
    ];
    for (const [limit, rate, deduction] of brackets) {
      if (x <= limit) return Math.max(0, x * rate - deduction);
    }
    return 0;
  }

  // 給与所得控除額(円ベース、2020年分以降)
  function salaryDeductionJP(incomeYen) {
    const x = Math.max(0, incomeYen);
    if (x <= 1625000) return 550000;
    if (x <= 1800000) return x * 0.4 - 100000;
    if (x <= 3600000) return x * 0.3 + 80000;
    if (x <= 6600000) return x * 0.2 + 440000;
    if (x <= 8500000) return x * 0.1 + 1100000;
    return 1950000;
  }

  /* ===== 入力の読み取り =====
     未入力はエラーで止めず0として扱い、該当欄を薄い赤で示して入力を促す ===== */
  const LIMITS = {
    finalMonthlySalary: 999999, surrenderValue: 999999, bookValue: 999999,
    yearsOfService: 100, meritMultiplier: 100,
    meritAddRate: 1000, corpTaxRateRb: 1000,
    // 積立比較
    rbAccAnnual: 999999, rbAccAgeContract: 120, rbAccAgeNow: 120, rbAccAgeRetire: 120,
    rbAccTerm: 100, rbAccInsAmt: 9999999,
    rbAccOutflowRate: 100, rbAccSocialRate: 100, rbAccCorpTax: 100, rbAccLossRate: 100,
  };
  function readValue(id) {
    const el = $(id);
    if (!el) return 0;
    const raw = String(el.value || '').replace(/,/g, '').trim();
    const v = raw === '' ? NaN : parseFloat(raw);
    if (isNaN(v)) {
      el.classList.add('input-error');
      return 0;
    }
    if (Math.abs(v) > LIMITS[id]) {
      el.classList.add('input-error');
      return Math.sign(v) * LIMITS[id];
    }
    el.classList.remove('input-error');
    return v;
  }

  /* ===== 入力内容のブラウザ内保存(サーバーには送信しない) ===== */
  const STORAGE_KEY = 'bpl_retirement_benefit_v1';
  // 設計書のセルは「ユーザーが上書きした値」だけを保存する(自動値は毎回計算し直せるため)。
  // 保存データのうち rbSh で始まるキーが上書きセルにあたる
  var savedSheet = {};
  try {
    const raw0 = localStorage.getItem(STORAGE_KEY);
    if (raw0) {
      const data0 = JSON.parse(raw0);
      Object.keys(data0).forEach(function (k) {
        if (k.indexOf('rbSh') === 0) savedSheet[k] = data0[k];
      });
    }
  } catch (e) {}
  function loadSavedValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      inputs.forEach(function (el) {
        if (data[el.id] !== undefined) el.value = data[el.id];
      });
    } catch (e) {}
  }
  function saveCurrentValues() {
    const data = {};
    inputs.forEach(function (el) { if (el.value !== '') data[el.id] = el.value; });
    // 設計書の上書きセル(dirty)だけ追加で保存する
    if (sheetBody) {
      sheetBody.querySelectorAll('.rb-sheet-in').forEach(function (el) {
        if (el.dataset.dirty === '1' && el.value !== '') data[el.id] = el.value;
      });
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ===== 再計算と描画 ===== */
  let lastResult = null;
  function render() {
    const finalMonthlySalary = readValue('finalMonthlySalary');
    const yearsOfService = readValue('yearsOfService');
    const meritMultiplier = readValue('meritMultiplier');
    const meritAddRate = readValue('meritAddRate');
    const surrenderValue = readValue('surrenderValue');
    const bookValue = readValue('bookValue');
    const corpTaxRateRb = readValue('corpTaxRateRb');

    // --- 1. 功績倍率法による退職金額(万円) ---
    const retirementAmount = finalMonthlySalary * yearsOfService * meritMultiplier * (1 + meritAddRate / 100);

    // --- 2. 法人側への影響 ---
    const corpGain = Math.max(0, surrenderValue - bookValue); // 保険差益(益金算入額)
    const corpDeduction = retirementAmount;                   // 退職金の損金算入額
    const corpTaxImpact = (corpGain - corpDeduction) * corpTaxRateRb / 100; // △=節税 / +=追加負担

    // --- 3. 個人の税務比較(円ベースで計算) ---
    const incomeYen = retirementAmount * 10000;

    // A. 給与として一括受給
    const aDeductionYen = salaryDeductionJP(incomeYen);
    const aSalaryIncomeYen = Math.max(0, incomeYen - aDeductionYen);
    const aTaxableYen = Math.max(0, aSalaryIncomeYen - 480000); // 基礎控除48万円
    const aIncomeTaxYen = incomeTaxJP(aTaxableYen);
    const aResidentTaxYen = aTaxableYen * 0.10;
    const aNetYen = incomeYen - aIncomeTaxYen - aResidentTaxYen;

    // B. 退職金として一括受給
    const years = Math.max(0, yearsOfService);
    const bDeductionYen = years <= 20 ? years * 400000 : 8000000 + (years - 20) * 700000;
    const bTaxableYen = Math.max(0, incomeYen - bDeductionYen) * 0.5; // 2分の1課税
    const bIncomeTaxYen = incomeTaxJP(bTaxableYen);
    const bResidentTaxYen = bTaxableYen * 0.10;
    const bNetYen = incomeYen - bIncomeTaxYen - bResidentTaxYen;

    const aNet = aNetYen / 10000, bNet = bNetYen / 10000;
    const aIt = aIncomeTaxYen / 10000, aRt = aResidentTaxYen / 10000;
    const bIt = bIncomeTaxYen / 10000, bRt = bResidentTaxYen / 10000;
    const diff = bNet - aNet;

    // --- 主役: 手取り差 ---
    countUp('sumDiff', Math.abs(diff), man);
    const diffNumEl = $('sumDiff');
    const tailEl = $('rbDiffTail');
    if (diff < -0.5) {
      if (tailEl) tailEl.textContent = '少なくなります';
      if (diffNumEl) diffNumEl.style.color = '#a83d3d';
    } else {
      if (tailEl) tailEl.textContent = '多く残ります';
      if (diffNumEl) diffNumEl.style.color = '';
    }

    countUp('sumA', aNet, man);
    countUp('sumB', bNet, man);
    const payoutEl = $('rbPayout');
    if (payoutEl) payoutEl.innerHTML = withUnit(man(retirementAmount));

    // --- グラフ(A・Bとも支給額を全体の幅にする) ---
    const cap = Math.max(retirementAmount, 0);
    drawSplitBar($('rbChartA'), [
      { value: aNet, color: C_NET },
      { value: aIt, color: C_ITAX },
      { value: aRt, color: C_RTAX },
    ], cap);
    drawSplitBar($('rbChartB'), [
      { value: bNet, color: C_NET },
      { value: bIt, color: C_ITAX },
      { value: bRt, color: C_RTAX },
    ], cap);

    // --- 入力カードの小計・法人側 ---
    const setHtml = (id, txt) => { const el = $(id); if (el) el.innerHTML = withUnit(txt); };
    countUp('retirementAmountDisplay', retirementAmount, man);
    setHtml('rbCorpGain', man(corpGain));
    setHtml('rbCorpDeduction', man(corpDeduction));
    const impactEl = $('rbCorpTaxImpact');
    if (impactEl) {
      impactEl.innerHTML = withUnit(man(corpTaxImpact));
      impactEl.classList.toggle('neg-val', corpTaxImpact < 0);
    }

    // --- 明細 ---
    setHtml('aIncome', man(retirementAmount));
    setHtml('aDeduction', man(aDeductionYen / 10000));
    setHtml('aTaxable', man(aTaxableYen / 10000));
    setHtml('aIncomeTax', man(aIt));
    setHtml('aResidentTax', man(aRt));
    setHtml('aNet', man(aNet));

    setHtml('bIncome', man(retirementAmount));
    setHtml('bDeduction', man(bDeductionYen / 10000));
    setHtml('bTaxable', man(bTaxableYen / 10000));
    setHtml('bIncomeTax', man(bIt));
    setHtml('bResidentTax', man(bRt));
    setHtml('bNet', man(bNet));

    // --- 4. 積立比較(契約年齢〜退職年齢) ---
    const accAnnual = readValue('rbAccAnnual');
    const ageContract = Math.max(0, Math.round(readValue('rbAccAgeContract')));
    const ageNow = Math.max(0, Math.round(readValue('rbAccAgeNow')));
    const ageRetire = Math.max(0, Math.round(readValue('rbAccAgeRetire')));
    const accYears = Math.max(0, Math.min(60, ageRetire - ageContract));
    const accTerm = Math.max(1, Math.round(readValue('rbAccTerm')));
    accAgeBase = ageContract;
    accNowYear = ageNow - ageContract; // 契約からの経過年数(範囲外ならマーカー非表示)
    accInsAmt = Math.max(0, readValue('rbAccInsAmt'));
    const yearsRoomEl = $('rbAccYearsRoom');
    if (yearsRoomEl) yearsRoomEl.innerHTML = withUnit('積立期間 ' + accYears + '年');
    const accCorpTax = readValue('rbAccCorpTax');
    syncLossSeg();
    const lossMode = lossSelect ? lossSelect.value : 'manual';
    const accLossRate = lossMode === 'auto' ? 0
      : (lossMode === 'manual' ? readValue('rbAccLossRate') : parseFloat(lossMode));
    const outflowRate = Math.min(100, readValue('rbAccOutflowRate'));

    // 設計書を組み立ててから読み取り、A〜Dの系列を作る
    buildSheet(accYears, ageContract, accAnnual, accTerm);
    const sheet = collectSheet(accYears, accAnnual, accTerm, lossMode, accLossRate, accCorpTax);
    accSeries = buildAccSeries(accAnnual, accYears, outflowRate, accCorpTax, sheet);
    renderAccPicker();
    drawAccChart(accSeries);

    const accLast = accSeries[accSeries.length - 1];
    // タイルには退職時点の積立額を表示
    Object.keys(ACC_SCN).forEach(function (key) {
      setHtml('rbAccVal_' + key, man(accLast[key]));
    });
    // カードは2枚: 役員報酬で受け取ると毎年出ていく所得税・住民税と、
    // 労使合計の社会保険料の累計(法人に置いたまま積み立てればどちらも発生しない)
    const socialRate = Math.min(100, readValue('rbAccSocialRate'));
    countUp('rbAccTaxSaved', accAnnual * (outflowRate / 100) * accYears, man);
    countUp('rbAccSocialSaved', accAnnual * (socialRate / 100) * accYears, man);
    setHtml('rbAccNetAnnual', man(accAnnual * (1 - outflowRate / 100)));
    setHtml('rbAccCorpNetAnnual', man(accAnnual * (1 - accCorpTax / 100)));
    setHtml('rbAccPremiumAnnual', man(accAnnual));
    setHtml('rbAccDeferTotal', man(accLast.defer));
    [['rbAccYearsLabel2', accYears], ['rbAccYearsLabel3', accYears]].forEach(function (pair) {
      const el = $(pair[0]);
      if (el) el.textContent = pair[1];
    });

    lastResult = { diff };
    if (errorArea) { errorArea.classList.add('hidden'); errorArea.textContent = ''; }
    saveCurrentValues();
  }

  /* ===== 入力の確定(change)で再計算する。入力中は動かさない(全体ルール) ===== */
  inputs.forEach(function (el) {
    el.addEventListener('change', render);
  });

  /* ===== データクリア =====
     セクション単位の「データクリア」はmenu.jsが対象欄を空にしてchangeを発火するため
     ここでは何もしなくてよい。ヒーローの「全データクリア」だけ受け持つ ===== */
  function doClearAll() {
    inputs.forEach(function (el) { el.value = ''; el.classList.remove('input-error'); });
    // 設計書の上書きも消して自動値に戻す
    savedSheet = {};
    if (sheetBody) {
      sheetBody.querySelectorAll('.rb-sheet-in').forEach(function (el) {
        delete el.dataset.dirty;
        el.value = el.dataset.def;
      });
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    render();
  }
  if (window.armHeroClearBtn) window.armHeroClearBtn($('rbClearBtn'), doClearAll);

  /* ===== PDF出力 ===== */
  function doPrint() {
    const now = new Date();
    $('pDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    const copy = (fromId, toId) => {
      const from = $(fromId), to = $(toId);
      if (from && to) to.textContent = from.textContent;
    };
    ['rbCorpDeduction', 'rbCorpGain', 'rbCorpTaxImpact'].forEach(function (id) {
      copy(id, 'p' + id.charAt(0).toUpperCase() + id.slice(1));
    });
    [['aIncome', 'pAIncome'], ['aDeduction', 'pADeduction'], ['aTaxable', 'pATaxable'],
     ['aIncomeTax', 'pAIncomeTax'], ['aResidentTax', 'pAResidentTax'], ['aNet', 'pANet'],
     ['bIncome', 'pBIncome'], ['bDeduction', 'pBDeduction'], ['bTaxable', 'pBTaxable'],
     ['bIncomeTax', 'pBIncomeTax'], ['bResidentTax', 'pBResidentTax'], ['bNet', 'pBNet'],
     ['sumA', 'pSumA'], ['sumB', 'pSumB'], ['sumDiff', 'pSumDiff']].forEach(function (pair) {
      copy(pair[0], pair[1]);
    });
    window.print();
  }
  document.querySelectorAll('.js-pdf-btn').forEach((b) => b.addEventListener('click', doPrint));

  /* ===== 初期表示: 保存済みデータがあれば復元して試算する ===== */
  loadSavedValues();
  // 復元した選択が無効な場合(旧バージョンの保存データ等)は既定の自動判定に戻す。
  // 「手入力」で保存されていた場合は数値欄の値をそのまま使う
  if (lossSelect && lossSelect.value === '') lossSelect.value = 'auto';
  render();
});

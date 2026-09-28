// ===== シンプル比較・提案アプリ共通スクリプト(Opus.8〜19) =====
// 各ページは <body data-app="..."> でアプリ名を指定し、このファイルが
// 入力の配線(復元・保存・クリア)と再計算・グラフ描画・印刷シートの充当を行う。
// 金額の単位は全て「万円」。再計算は入力確定時(change)に走らせる(全体ルール)。
(function () {
  'use strict';

  // ---------- 共通ユーティリティ ----------
  function n(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = window.numClean ? window.numClean(el.value) : parseFloat(String(el.value || '').replace(/,/g, ''));
    return isNaN(v) ? 0 : v;
  }
  function fmt(v) {
    var x = Math.round(v);
    return window.numFmt ? window.numFmt(x) : String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function man(v) { return fmt(v) + '万円'; }
  function setText(id, s) { var el = document.getElementById(id); if (el) el.textContent = s; }
  // 大きな結果数値: 数字は太字・単位は小さく(単位は数字より小さくルール)
  function setBig(id, v, unit) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = fmt(v) + '<span class="unit">' + (unit || '万円') + '</span>';
  }

  // ---------- SVG部品(文字列組み立て) ----------
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function rect(x, y, w, h, fill, extra) {
    if (h < 0) { y += h; h = -h; }
    return '<rect x="' + x + '" y="' + y.toFixed(1) + '" width="' + w + '" height="' + Math.max(0, h).toFixed(1) + '" fill="' + fill + '" ' + (extra || '') + '/>';
  }
  function txt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y.toFixed(1) + '" font-size="' + size + '" fill="' + fill + '" text-anchor="middle" ' + (extra || '') + '>' + esc(s) + '</text>';
  }
  // セグメント内ラベル: 高さが足りれば「名前+金額」2行、足りなければ金額のみ1行、極小なら省略
  function segLabel(cx, yTop, h, name, value, color) {
    var out = '';
    var mid = yTop + h / 2;
    if (h >= 34) {
      out += txt(cx, mid - 4, name, 11, color, 'font-weight="400"');
      out += txt(cx, mid + 12, man(value), 12.5, color, 'font-weight="bold"');
    } else if (h >= 16) {
      out += txt(cx, mid + 4, man(value), 11.5, color, 'font-weight="bold"');
    }
    return out;
  }

  // ---------- 描画1: ゲージ棒(必要額の点線枠に充当が積み上がり、残りが白い不足) ----------
  // opts: { frameLabel, frameTotal, segs:[{label,value,color,dashed}], shortLabel, sideTitle, sideItems:[{label,value}] }
  function renderGauge(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 400, yB = 360, yT = 34;
    var barX = 150, barW = 170, cx = barX + barW / 2;
    var frame = Math.max(o.frameTotal, 1);
    var covered = 0;
    o.segs.forEach(function (s) { covered += s.value; });
    var maxV = Math.max(frame, covered, 1);
    var px = (yB - yT) / maxV;
    var s = '<line x1="60" y1="' + yB + '" x2="' + (W - 40) + '" y2="' + yB + '" stroke="#e3e6ea" stroke-width="1"/>';
    // 充当セグメントを下から積む
    var y = yB;
    o.segs.forEach(function (seg) {
      if (seg.value <= 0) return;
      var h = seg.value * px;
      y -= h;
      s += rect(barX, y, barW, h, seg.color, seg.dashed
        ? 'fill-opacity="0.25" stroke="' + seg.color + '" stroke-width="1.2" stroke-dasharray="4,3"'
        : 'stroke="#fff" stroke-width="1.5"');
      s += segLabel(cx, y, h, seg.label, seg.value, seg.dashed ? seg.color : '#fff');
    });
    // 不足(必要額の枠までの白い空き)
    var shortV = Math.max(0, frame - covered);
    if (shortV > 0) {
      var sh = shortV * px;
      var sy = yB - frame * px;
      s += rect(barX, sy, barW, sh, '#ffffff', 'stroke="#fff" stroke-width="1.5"');
      var mid = sy + sh / 2;
      if (sh >= 30) {
        s += txt(cx, mid - 3, o.shortLabel, 11.5, '#9c3d4c', 'font-weight="bold"');
        s += txt(cx, mid + 13, man(shortV), 13, '#9c3d4c', 'font-weight="bold"');
      } else {
        s += txt(cx, mid + 4, man(shortV), 11.5, '#9c3d4c', 'font-weight="bold"');
      }
    }
    // 必要額の点線枠(枠が場所を占めるので過不足が一目で分かる)
    var frameH = frame * px;
    s += rect(barX, yB - frameH, barW, frameH, 'none', 'stroke="#9c3d4c" stroke-width="2" stroke-dasharray="5,4"');
    s += txt(cx, yB - frameH - 12, o.frameLabel + ' ' + man(frame), 13.5, '#9c3d4c', 'font-weight="bold"');
    // 右側: 内訳リスト
    if (o.sideItems && o.sideItems.length) {
      var lx = barX + barW + 70;
      var ly = yT + 30;
      s += '<text x="' + lx + '" y="' + ly + '" font-size="12.5" fill="#2b2f36" font-weight="bold">' + esc(o.sideTitle || '内訳') + '</text>';
      o.sideItems.forEach(function (it, i) {
        var yy = ly + 24 + i * 24;
        s += '<text x="' + lx + '" y="' + yy + '" font-size="11.5" fill="#5c636e">' + esc(it.label) + '</text>';
        s += '<text x="' + (W - 44) + '" y="' + yy + '" font-size="12" fill="#2b2f36" font-weight="bold" text-anchor="end">' + esc(man(it.value)) + '</text>';
      });
    }
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 描画2: 左右比較バー(2〜3本の積み上げ+注記) ----------
  // opts: { bars:[{title, segs:[{label,value,color,dashed}], note}], unitNote }
  function renderCompare(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 400, yB = 340, yT = 46;
    var count = o.bars.length;
    var barW = count === 2 ? 160 : 130;
    var gap = count === 2 ? 130 : 60;
    var total = count * barW + (count - 1) * gap;
    var x0 = (W - total) / 2;
    var maxV = 1;
    o.bars.forEach(function (b) {
      var t = 0; b.segs.forEach(function (s) { t += Math.max(s.value, 0); });
      b._total = t; if (t > maxV) maxV = t;
    });
    var px = (yB - yT) / maxV;
    var s = '<line x1="40" y1="' + yB + '" x2="' + (W - 40) + '" y2="' + yB + '" stroke="#e3e6ea" stroke-width="1"/>';
    o.bars.forEach(function (b, i) {
      var bx = x0 + i * (barW + gap);
      var cx = bx + barW / 2;
      var y = yB;
      b.segs.forEach(function (seg) {
        if (seg.value <= 0) return;
        var h = seg.value * px;
        y -= h;
        s += rect(bx, y, barW, h, seg.color, seg.dashed
          ? 'fill-opacity="0.25" stroke="' + seg.color + '" stroke-width="1.2" stroke-dasharray="4,3"'
          : 'stroke="#fff" stroke-width="1.5"');
        s += segLabel(cx, y, h, seg.label, seg.value, seg.dashed ? seg.color : '#fff');
      });
      s += txt(cx, yB - b._total * px - 10, man(b._total), 14, '#2b2f36', 'font-weight="bold"');
      s += txt(cx, yB + 22, b.title, 13, '#2b2f36', 'font-weight="bold"');
      if (b.note) s += txt(cx, yB + 40, b.note, 10.5, '#9c3d4c', 'font-weight="bold"');
    });
    if (o.unitNote) s += '<text x="' + (W - 40) + '" y="20" font-size="10.5" fill="#8a929c" text-anchor="end">' + esc(o.unitNote) + '</text>';
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 描画3: 月次の資金繰り棒(マイナスは赤・不足月を強調) ----------
  // opts: { values:[月末残高...], firstShortMonth }
  function renderMonthly(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 380, yT = 40, yBot = 330, padL = 60, padR = 20;
    var vs = o.values;
    var maxV = 1, minV = 0;
    vs.forEach(function (v) { if (v > maxV) maxV = v; if (v < minV) minV = v; });
    var range = maxV - minV || 1;
    var y0 = yT + maxV / range * (yBot - yT); // ゼロ線
    var px = (yBot - yT) / range;
    var bw = Math.min(40, (W - padL - padR) / vs.length * 0.62);
    var step = (W - padL - padR) / vs.length;
    var s = '<line x1="' + padL + '" y1="' + y0.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y0.toFixed(1) + '" stroke="#5c636e" stroke-width="1.2"/>';
    s += '<text x="' + (padL - 8) + '" y="' + (y0 + 4).toFixed(1) + '" font-size="10.5" fill="#5c636e" text-anchor="end">0</text>';
    vs.forEach(function (v, i) {
      var x = padL + i * step + (step - bw) / 2;
      var h = Math.abs(v) * px;
      var neg = v < 0;
      s += rect(x, neg ? y0 : y0 - h, bw, h, neg ? '#9c3d4c' : '#3b6ea5', 'stroke="#fff" stroke-width="1"');
      // 金額(残高)は1本おきに省略せず、数字のみを上下に
      if (vs.length <= 18 || i % 2 === 0 || v < 0) {
        s += txt(x + bw / 2, neg ? y0 + h + 14 : y0 - h - 6, fmt(v), 9.5, neg ? '#9c3d4c' : '#2b2f36', 'font-weight="bold"');
      }
      s += txt(x + bw / 2, yBot + 34, (i + 1) + '', 10, '#8a929c');
    });
    s += txt(padL + (W - padL - padR) / 2, yBot + 50, '経過月数(ヶ月目)', 11, '#8a929c');
    if (o.firstShortMonth) {
      var fx = padL + (o.firstShortMonth - 1) * step + step / 2;
      s += '<text x="' + fx + '" y="' + (yT - 14) + '" font-size="12.5" fill="#9c3d4c" font-weight="bold" text-anchor="middle">▼ ' + o.firstShortMonth + 'ヶ月目に資金不足</text>';
      s += '<line x1="' + fx + '" y1="' + (yT - 8) + '" x2="' + fx + '" y2="' + yBot + '" stroke="#9c3d4c" stroke-width="1.2" stroke-dasharray="4,3"/>';
    }
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 描画4: 年次の折れ線(借入残高×保障推移など) ----------
  // opts: { years, lines:[{label,color,dash,values[]}] }
  function renderLines(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 380, yT = 48, yB = 320, padL = 60, padR = 30;
    var maxV = 1;
    o.lines.forEach(function (l) { l.values.forEach(function (v) { if (v > maxV) maxV = v; }); });
    var px = (yB - yT) / maxV;
    var sx = (W - padL - padR) / o.years;
    var s = '<line x1="' + padL + '" y1="' + yB + '" x2="' + (W - padR) + '" y2="' + yB + '" stroke="#5c636e" stroke-width="1.2"/>';
    for (var g = 1; g <= 4; g++) {
      var gy = yB - (maxV * g / 4) * px;
      s += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '" stroke="#eef1f4" stroke-width="1"/>';
      s += '<text x="' + (padL - 8) + '" y="' + (gy + 4).toFixed(1) + '" font-size="10" fill="#8a929c" text-anchor="end">' + fmt(maxV * g / 4) + '</text>';
    }
    for (var t = 0; t <= o.years; t += (o.years > 15 ? 5 : 1)) {
      s += txt(padL + t * sx, yB + 18, t === 0 ? '現在' : t + '年後', 10, '#8a929c');
    }
    o.lines.forEach(function (l) {
      var pts = l.values.map(function (v, i) { return (padL + i * sx).toFixed(1) + ',' + (yB - Math.max(v, 0) * px).toFixed(1); }).join(' ');
      s += '<polyline points="' + pts + '" fill="none" stroke="' + l.color + '" stroke-width="2.5" ' + (l.dash ? 'stroke-dasharray="6,4"' : '') + ' stroke-linejoin="round"/>';
    });
    // 凡例(グラフ上部)
    var lx = padL;
    o.lines.forEach(function (l) {
      s += '<line x1="' + lx + '" y1="18" x2="' + (lx + 26) + '" y2="18" stroke="' + l.color + '" stroke-width="3" ' + (l.dash ? 'stroke-dasharray="6,4"' : '') + '/>';
      s += '<text x="' + (lx + 32) + '" y="22" font-size="11.5" fill="#2b2f36">' + esc(l.label) + '</text>';
      lx += 42 + l.label.length * 12;
    });
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 描画5: ウォーターフォール(退職金出口など) ----------
  // opts: { steps:[{label, value(+増/−減), color, isTotal}] }
  function renderWaterfall(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 380, yT = 46, yB = 310, padL = 60;
    var run = 0, minRun = 0, maxRun = 0;
    o.steps.forEach(function (st) {
      if (!st.isTotal) run += st.value;
      st._end = st.isTotal ? st.value : run;
      st._start = st.isTotal ? 0 : st._end - st.value;
      if (st._end < minRun) minRun = st._end;
      if (st._end > maxRun) maxRun = st._end;
      if (st._start < minRun) minRun = st._start;
      if (st._start > maxRun) maxRun = st._start;
    });
    var range = (maxRun - minRun) || 1;
    var px = (yB - yT) / range;
    var y0 = yT + maxRun * px;
    var count = o.steps.length;
    var bw = 110, gap = (W - padL - 30 - count * bw) / (count - 1);
    var s = '<line x1="' + (padL - 20) + '" y1="' + y0.toFixed(1) + '" x2="' + (W - 20) + '" y2="' + y0.toFixed(1) + '" stroke="#5c636e" stroke-width="1.2"/>';
    o.steps.forEach(function (st, i) {
      var x = padL + i * (bw + gap);
      var yA = y0 - st._start * px, yBv = y0 - st._end * px;
      s += rect(x, Math.min(yA, yBv), bw, Math.abs(yA - yBv), st.color, 'stroke="#fff" stroke-width="1.5"');
      var topY = Math.min(yA, yBv);
      s += txt(x + bw / 2, topY - 8, (st.value >= 0 && !st.isTotal ? '+' : '') + fmt(st.isTotal ? st.value : st.value) + '万円', 11.5, '#2b2f36', 'font-weight="bold"');
      s += txt(x + bw / 2, yB + 24, st.label, 11.5, '#2b2f36', 'font-weight="bold"');
      if (i < count - 1 && !st.isTotal && !o.steps[i + 1].isTotal) {
        s += '<line x1="' + (x + bw) + '" y1="' + yBv.toFixed(1) + '" x2="' + (x + bw + gap) + '" y2="' + yBv.toFixed(1) + '" stroke="#b9c4d0" stroke-width="1" stroke-dasharray="3,3"/>';
      }
    });
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 描画6: 年次バー(キーマン逸失利益の逓減など) ----------
  // opts: { bars:[{label, value, color}], topNote }
  function renderYearBars(elId, o) {
    var el = document.getElementById(elId);
    if (!el) return;
    var W = 700, H = 360, yT = 50, yB = 300, padL = 60, padR = 30;
    var maxV = 1;
    o.bars.forEach(function (b) { if (b.value > maxV) maxV = b.value; });
    var px = (yB - yT) / maxV;
    var step = (W - padL - padR) / o.bars.length;
    var bw = Math.min(90, step * 0.66);
    var s = '<line x1="' + padL + '" y1="' + yB + '" x2="' + (W - padR) + '" y2="' + yB + '" stroke="#5c636e" stroke-width="1.2"/>';
    o.bars.forEach(function (b, i) {
      var x = padL + i * step + (step - bw) / 2;
      var h = b.value * px;
      s += rect(x, yB - h, bw, h, b.color, 'stroke="#fff" stroke-width="1.5"');
      s += txt(x + bw / 2, yB - h - 7, man(b.value), 11.5, '#2b2f36', 'font-weight="bold"');
      s += txt(x + bw / 2, yB + 20, b.label, 11.5, '#2b2f36');
    });
    if (o.topNote) s += txt(W / 2, 24, o.topNote, 12.5, '#9c3d4c', 'font-weight="bold"');
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" role="img">' + s + '</svg>';
  }

  // ---------- 各アプリの再計算 ----------
  var APPS = {

    // Opus.8 事業継続資金×生命保険〈社長に万一があったら〉
    bizcont: function () {
      var need = n('monthlyFixed') * n('prepMonths') + n('loanRepay') + n('oneTimeCost');
      var covered = n('cashOnHand') + n('existingCover');
      var short = Math.max(0, need - covered);
      renderGauge('chartBox', {
        frameLabel: '必要資金', frameTotal: need,
        segs: [
          { label: '使える現預金', value: n('cashOnHand'), color: '#0f2a4a' },
          { label: '既契約の保障', value: n('existingCover'), color: '#3b6ea5' },
        ],
        shortLabel: '不足分',
        sideTitle: '必要資金の内訳',
        sideItems: [
          { label: '固定支出 ' + fmt(n('monthlyFixed')) + '万円 × ' + fmt(n('prepMonths')) + 'ヶ月', value: n('monthlyFixed') * n('prepMonths') },
          { label: '返済に充てたい借入', value: n('loanRepay') },
          { label: '一時費用(整理・弔慰金等)', value: n('oneTimeCost') },
        ],
      });
      setBig('statNeed', need); setBig('statCovered', covered); setBig('statShort', short);
      setText('statMsg', short > 0
        ? '死亡保障を ' + man(short) + ' 用意する根拠になります'
        : '現預金と既契約で必要資金を確保できています');
      return { 必要資金: man(need), '自己資金+既契約': man(covered), 不足額: man(short) };
    },

    // Opus.9 社長の就業不能×資金繰り〈生存しているが働けない〉
    disability: function () {
      var months = Math.max(1, Math.min(36, Math.round(n('offMonths'))));
      var cash = n('cashStart');
      var vals = [], firstShort = 0;
      var bal = cash;
      for (var m = 1; m <= months; m++) {
        bal += n('monthlyIn') - n('monthlyOut');
        if (m === Math.round(n('benefitMonth'))) bal += n('benefitAmount');
        vals.push(Math.round(bal));
        if (!firstShort && bal < 0) firstShort = m;
      }
      var minBal = Math.min.apply(null, vals);
      renderMonthly('chartBox', { values: vals, firstShortMonth: firstShort });
      setBig('statMin', minBal);
      setText('statShortMonth', firstShort ? firstShort + 'ヶ月目' : 'なし');
      setBig('statNeedMore', Math.max(0, -minBal));
      setText('statMsg', firstShort
        ? '休業' + firstShort + 'ヶ月目に資金が尽きます。就業不能保障で ' + man(Math.max(0, -minBal)) + ' 以上の備えを'
        : '想定した休業期間中、資金はショートしません');
      return { 休業期間: fmt(months) + 'ヶ月', 最低残高: man(minBal), 資金不足の発生: firstShort ? firstShort + 'ヶ月目' : 'なし', 追加で必要な備え: man(Math.max(0, -minBal)) };
    },

    // Opus.10 借入残高×保障推移〈借入は減る、保障はどうする〉
    loanline: function () {
      var loan = n('loanBalance'), years = Math.max(1, Math.min(35, Math.round(n('repayYears'))));
      var baseFund = n('baseFund'), exAmt = n('existAmount'), exYears = Math.round(n('existYears'));
      var lineLoan = [], lineNeed = [], lineExist = [];
      for (var t = 0; t <= years; t++) {
        var bal = Math.max(0, loan * (1 - t / years));
        lineLoan.push(bal);
        lineNeed.push(bal + baseFund);
        lineExist.push(t <= exYears ? exAmt : 0);
      }
      renderLines('chartBox', {
        years: years,
        lines: [
          { label: '借入残高', color: '#a5703a', values: lineLoan },
          { label: '必要保障(残高+事業資金)', color: '#9c3d4c', dash: true, values: lineNeed },
          { label: '既契約の保障', color: '#3b6ea5', values: lineExist },
        ],
      });
      var mid = Math.min(10, years);
      setBig('statNeedNow', loan + baseFund);
      setBig('statNeedMid', lineNeed[mid]);
      setBig('statGapNow', Math.max(0, loan + baseFund - exAmt));
      setText('statMidLabel', mid + '年後に必要な保障');
      setText('statMsg', '当初は ' + man(loan + baseFund) + '、' + mid + '年後は ' + man(lineNeed[mid]) + '。借入の減りに合わせた逓減設計が合理的です');
      var summary = { 当初必要保障: man(loan + baseFund), 既契約とのギャップ: man(Math.max(0, loan + baseFund - exAmt)) };
      summary[mid + '年後の必要保障'] = man(lineNeed[mid]);
      return summary;
    },

    // Opus.11 連帯保証×生命保険
    guarantee: function () {
      var debt = n('guaranteeDebt'), fin = n('personalAssets'), stock = n('stockValue'), cover = n('personalCover');
      var shortExStock = Math.max(0, debt - fin - cover);
      var shortInStock = Math.max(0, debt - fin - cover - stock);
      renderGauge('chartBox', {
        frameLabel: '連帯保証債務', frameTotal: debt,
        segs: [
          { label: '個人の金融資産', value: fin, color: '#0f2a4a' },
          { label: '個人契約の保障', value: cover, color: '#3b6ea5' },
          { label: '自社株(換金は困難)', value: stock, color: '#8a929c', dashed: true },
        ],
        shortLabel: '不足分',
        sideTitle: '考え方',
        sideItems: [
          { label: '保証債務(遺族に相続)', value: debt },
          { label: 'すぐ使える資産+保障', value: fin + cover },
          { label: '自社株を除く不足', value: shortExStock },
        ],
      });
      setBig('statDebt', debt); setBig('statLiquid', fin + cover); setBig('statShort', shortExStock);
      setText('statMsg', shortExStock > 0
        ? '自社株を売らずに保証債務を清算するには、あと ' + man(shortExStock) + ' の保障が必要です'
        : '流動資産と保障で保証債務をカバーできています');
      return { 連帯保証債務: man(debt), '金融資産+個人保障': man(fin + cover), 不足額: man(shortExStock), 自社株込みの不足: man(shortInStock) };
    },

    // Opus.12 キーマン保障×生命保険(逸失利益)
    keyman: function () {
      var contrib = n('keyContrib'), years = Math.max(1, Math.min(10, Math.round(n('impactYears')))), oneTime = n('replaceCost');
      var bars = [], total = 0;
      for (var t = 1; t <= years; t++) {
        var v = Math.round(contrib * (years - t + 1) / years); // 毎年均等に回復する前提の逓減
        bars.push({ label: t + '年目', value: v, color: '#3b6ea5' });
        total += v;
      }
      if (oneTime > 0) bars.push({ label: '採用・引継費用', value: oneTime, color: '#a5703a' });
      renderYearBars('chartBox', { bars: bars, topNote: '逸失利益の合計 ' + man(total + oneTime) + ' ＝ キーマン保障の目安' });
      setBig('statLost', total); setBig('statOneTime', oneTime); setBig('statTotal', total + oneTime);
      setText('statMsg', 'キーマンの死亡・退職に備える保障額の目安は ' + man(total + oneTime) + ' です');
      return { 逸失利益の合計: man(total), '採用・引継費用': man(oneTime), 必要保障額の目安: man(total + oneTime) };
    },

    // Opus.13 納税資金×生命保険(社長個人の相続)
    inherit: function () {
      var stock = n('ihStock'), realty = n('ihRealty'), fin = n('ihFinancial');
      var heirs = Math.max(1, Math.min(10, Math.round(n('ihHeirs'))));
      var total = stock + realty + fin;
      var base = 3000 + 600 * heirs;
      var taxable = Math.max(0, total - base);
      // 法定相続分で均等取得と仮定した簡易速算(配偶者の税額軽減は考慮しない概算)
      var per = taxable / heirs;
      function rateOf(x) {
        if (x <= 1000) return [0.10, 0];
        if (x <= 3000) return [0.15, 50];
        if (x <= 5000) return [0.20, 200];
        if (x <= 10000) return [0.30, 700];
        if (x <= 20000) return [0.40, 1700];
        if (x <= 30000) return [0.45, 2700];
        if (x <= 60000) return [0.50, 4200];
        return [0.55, 7200];
      }
      var rd = rateOf(per);
      var tax = Math.max(0, Math.round((per * rd[0] - rd[1]) * heirs));
      var short = Math.max(0, tax - fin);
      renderGauge('chartBox', {
        frameLabel: '相続税(概算)', frameTotal: tax,
        segs: [{ label: '金融資産(すぐ使える)', value: Math.min(fin, tax), color: '#0f2a4a' }],
        shortLabel: '納税資金の不足',
        sideTitle: '財産の内訳',
        sideItems: [
          { label: '自社株(納税には使いにくい)', value: stock },
          { label: '不動産(納税には使いにくい)', value: realty },
          { label: '金融資産', value: fin },
        ],
      });
      setBig('statTax', tax); setBig('statLiquid', fin); setBig('statShort', short);
      setText('statMsg', short > 0
        ? '納税資金が ' + man(short) + ' 不足します。生命保険(受取人=相続人)は即日使える納税資金になります'
        : '金融資産で納税資金を確保できる見込みです');
      return { 財産合計: man(total), '相続税(概算)': man(tax), 金融資産: man(fin), 納税資金の不足: man(short) };
    },

    // Opus.14 実質返戻率×生命保険
    effret: function () {
      var paid = n('erPaid'), cv = n('erCV'), ded = n('erDedRatio') / 100, tax = n('erTaxRate') / 100;
      var saved = paid * ded * tax;
      var real = paid - saved;
      var simple = paid > 0 ? cv / paid * 100 : 0;
      var effective = real > 0 ? cv / real * 100 : 0;
      renderCompare('chartBox', {
        unitNote: '単位: 万円',
        bars: [
          { title: '支払保険料(名目)', segs: [{ label: '保険料', value: paid, color: '#8a929c' }] },
          { title: '実質負担', note: '損金の税軽減 △' + fmt(saved) + '万円', segs: [
            { label: '実質負担', value: real, color: '#0f2a4a' },
            { label: '税軽減分', value: saved, color: '#45939b', dashed: true },
          ] },
          { title: '解約返戻金', segs: [{ label: '返戻金', value: cv, color: '#3b6ea5' }] },
        ],
      });
      setText('statSimple', simple.toFixed(1) + '％');
      setText('statEffective', effective.toFixed(1) + '％');
      setBig('statSaved', saved);
      setText('statMsg', '名目の返戻率 ' + simple.toFixed(1) + '％ が、損金効果込みでは ' + effective.toFixed(1) + '％ になります(解約時の雑収入課税は出口設計で調整)');
      return { 累計支払保険料: man(paid), 解約返戻金: man(cv), 単純返戻率: simple.toFixed(1) + '%', 実質返戻率: effective.toFixed(1) + '%' };
    },

    // Opus.15 借入準備 vs 保険準備
    borrowvs: function () {
      var need = n('bvNeed'), rate = n('bvRate') / 100, ry = Math.max(1, Math.round(n('bvRepayYears')));
      var prem = n('bvPremium'), py = Math.max(1, Math.round(n('bvYears')));
      var interest = Math.round(need * rate * (ry + 1) / 2); // 元金均等の概算利息
      var totalBorrow = need + interest;
      var totalPrem = prem * py;
      renderCompare('chartBox', {
        unitNote: '単位: 万円',
        bars: [
          { title: 'その時に借りる', segs: [
            { label: '元金', value: need, color: '#a5703a' },
            { label: '利息(概算)', value: interest, color: '#9c3d4c' },
          ] },
          { title: '保険で準備する', note: '万一の際は即座に' + fmt(need) + '万円の保障', segs: [
            { label: '総支払保険料', value: totalPrem, color: '#3b6ea5' },
          ] },
        ],
      });
      setBig('statBorrow', totalBorrow); setBig('statInsure', totalPrem); setBig('statDiff', totalBorrow - totalPrem);
      setText('statMsg', totalBorrow > totalPrem
        ? '借入より保険準備のほうが総コストで ' + man(totalBorrow - totalPrem) + ' 有利。しかも準備期間中の万一には即座に保障が立ちます'
        : '総コストは借入が有利な条件ですが、保険には準備中の万一に即座に備える機能があります');
      return { '借入の総返済(概算)': man(totalBorrow), うち利息: man(interest), 保険の総支払: man(totalPrem), 差額: man(totalBorrow - totalPrem) };
    },

    // Opus.16 個人契約 vs 法人契約
    persvscorp: function () {
      var prem = n('pcPremium'), it = n('pcIncomeTax') / 100, sp = n('pcSocialSelf') / 100, sc = n('pcSocialCorp') / 100;
      var ct = n('pcCorpTax') / 100, ded = n('pcDedRatio') / 100;
      var grossUp = (1 - it - sp) > 0.05 ? prem / (1 - it - sp) : prem * 20;
      var corpBurdenPersonal = Math.round(grossUp * (1 + sc)); // 報酬増額+会社負担社保
      var corpNet = Math.round(prem * (1 - ded * ct));         // 法人契約の実質負担
      renderCompare('chartBox', {
        unitNote: '単位: 万円/年',
        bars: [
          { title: '個人契約(報酬を増やして払う)', note: '会社の総負担', segs: [
            { label: '報酬増額(手取→保険料)', value: Math.round(grossUp), color: '#a5703a' },
            { label: '会社負担の社会保険料', value: Math.round(grossUp * sc), color: '#9c3d4c' },
          ] },
          { title: '法人契約', note: '損金の税軽減後', segs: [
            { label: '実質負担', value: corpNet, color: '#0f2a4a' },
            { label: '税軽減分', value: Math.round(prem - corpNet), color: '#45939b', dashed: true },
          ] },
        ],
      });
      setBig('statPersonal', corpBurdenPersonal); setBig('statCorp', corpNet); setBig('statDiff', corpBurdenPersonal - corpNet);
      setText('statMsg', '同じ保険料 ' + man(prem) + ' を個人で払うには会社の総負担 ' + man(corpBurdenPersonal) + '。法人契約なら実質 ' + man(corpNet) + ' です');
      return { 年間保険料: man(prem), '個人契約の会社総負担': man(corpBurdenPersonal), 法人契約の実質負担: man(corpNet), 差額: man(corpBurdenPersonal - corpNet) };
    },

    // Opus.17 加入タイミング×生命保険(今 vs 5年後)
    timing: function () {
      var age = Math.round(n('tmAge')), until = Math.round(n('tmUntilAge'));
      var pNow = n('tmPremNow'), pLater = n('tmPremLater');
      var yNow = Math.max(0, until - age), yLater = Math.max(0, until - age - 5);
      var totalNow = pNow * yNow, totalLater = pLater * yLater;
      renderCompare('chartBox', {
        unitNote: '単位: 万円',
        bars: [
          { title: '今日 加入(' + age + '歳)', note: '保障は今日から', segs: [
            { label: '総支払保険料', value: totalNow, color: '#3b6ea5' },
          ] },
          { title: '5年後 加入(' + (age + 5) + '歳)', note: '5年間は無保障', segs: [
            { label: '総支払保険料', value: totalLater, color: '#a5703a' },
          ] },
        ],
      });
      setBig('statNow', totalNow); setBig('statLater', totalLater); setBig('statDiff', totalLater - totalNow);
      setText('statMsg', totalLater > totalNow
        ? '5年待つと総支払が ' + man(totalLater - totalNow) + ' 増え、しかも5年間の無保障リスクを抱えます'
        : '総支払では5年後加入が下回る条件ですが、5年間の無保障リスクは金額に表れません');
      return { 今加入の総支払: man(totalNow), '5年後加入の総支払': man(totalLater), 差額: man(totalLater - totalNow), 無保障期間: '5年' };
    },

    // Opus.18 退職金出口×生命保険
    exitplan: function () {
      var cv = n('exCV'), book = n('exBook'), retire = n('exRetire'), tax = n('exTaxRate') / 100;
      var zatsu = Math.max(0, cv - book);
      var netImpact = zatsu - retire;
      var taxEffect = Math.round(-netImpact * tax); // 損が出れば税軽減(＋)、益が残れば納税(−)
      renderWaterfall('chartBox', {
        steps: [
          { label: '雑収入(返戻金−資産計上)', value: zatsu, color: '#3b6ea5' },
          { label: '退職金の損金', value: -retire, color: '#a5703a' },
          { label: '課税所得への影響', value: netImpact, color: netImpact <= 0 ? '#0f2a4a' : '#9c3d4c', isTotal: true },
        ],
      });
      setBig('statZatsu', zatsu);
      setBig('statNet', netImpact);
      var el = document.getElementById('statTaxEffect');
      if (el) el.innerHTML = (taxEffect >= 0 ? '税軽減 ' : '追加納税 ') + fmt(Math.abs(taxEffect)) + '<span class="unit">万円</span>';
      setText('statMsg', netImpact <= 0
        ? '解約益 ' + man(zatsu) + ' は退職金の損金で全額相殺。課税されずに退職金の原資にできます'
        : '退職金だけでは雑収入を相殺しきれず ' + man(netImpact) + ' が課税対象に。支給額・解約時期の調整余地があります');
      return { '雑収入(解約益)': man(zatsu), 退職金の損金: man(retire), 課税所得への影響: man(netImpact) };
    },

    // Opus.19 決算対策×生命保険
    yearend: function () {
      var profit = n('yeProfit'), prem = n('yePremium'), ded = n('yeDedRatio') / 100, tax = n('yeTaxRate') / 100;
      var taxBefore = Math.round(profit * tax);
      var taxable = Math.max(0, profit - prem * ded);
      var taxAfter = Math.round(taxable * tax);
      var cashBefore = profit - taxBefore;
      var cashAfter = profit - prem - taxAfter;
      var assetPart = Math.round(prem * (1 - ded));
      renderCompare('chartBox', {
        unitNote: '単位: 万円',
        bars: [
          { title: '加入しない場合', segs: [
            { label: '手元に残る現金', value: cashBefore, color: '#0f2a4a' },
            { label: '納税', value: taxBefore, color: '#9c3d4c' },
          ] },
          { title: '決算前に加入した場合', segs: [
            { label: '手元に残る現金', value: cashAfter, color: '#0f2a4a' },
            { label: '保険で社外に準備', value: prem, color: '#3b6ea5' },
            { label: '納税', value: taxAfter, color: '#9c3d4c' },
          ] },
        ],
      });
      setBig('statTaxCut', taxBefore - taxAfter);
      setBig('statReserve', prem);
      setBig('statAsset', assetPart);
      setText('statMsg', '納税が ' + man(taxBefore - taxAfter) + ' 減り、' + man(prem) + ' を保障付きで社外に準備。ただし現金も動くため、節税ではなく「税の繰延べ＋保障の獲得」と説明するのが誠実です');
      return { 加入前の納税: man(taxBefore), 加入後の納税: man(taxAfter), 納税の減少: man(taxBefore - taxAfter), 保険で準備: man(prem) };
    },
  };

  // ---------- 配線(復元・保存・クリア・再計算・印刷) ----------
  document.addEventListener('DOMContentLoaded', function () {
    var app = document.body.getAttribute('data-app');
    if (!app || !APPS[app]) return;
    var KEY = 'bpl_' + app + '_v1';
    var inputs = Array.prototype.slice.call(document.querySelectorAll('input.num-input[id]'));

    function persist() {
      try {
        var o = {};
        inputs.forEach(function (el) { o[el.id] = el.value; });
        localStorage.setItem(KEY, JSON.stringify(o));
      } catch (e) {}
    }
    function restore() {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return;
        var o = JSON.parse(raw);
        inputs.forEach(function (el) { if (o[el.id] !== undefined) el.value = o[el.id]; });
      } catch (e) {}
    }
    function fillPrint(summary) {
      setText('pDate', new Date().toLocaleDateString('ja-JP'));
      var tb = document.getElementById('pInputsBody');
      if (tb) {
        tb.innerHTML = inputs.map(function (el) {
          var label = document.querySelector('label[for="' + el.id + '"]');
          var name = label ? label.childNodes[0].textContent : el.id;
          var unitEl = label ? label.querySelector('.rb-field-unit') : null;
          return '<tr><td class="lbl">' + esc(name) + '</td><td>' + esc((el.value || '0') + (unitEl ? ' ' + unitEl.textContent : '')) + '</td></tr>';
        }).join('');
      }
      var rb = document.getElementById('pResultBody');
      if (rb && summary) {
        rb.innerHTML = Object.keys(summary).map(function (k) {
          return '<tr><td class="lbl">' + esc(k) + '</td><td>' + esc(summary[k]) + '</td></tr>';
        }).join('');
      }
    }
    function recalc() {
      var summary = APPS[app]();
      persist();
      fillPrint(summary);
    }

    restore();
    document.querySelectorAll('form, .rb-card, .rb-main').forEach(function (scope) {
      scope.addEventListener('change', recalc);
    });
    // カードごとのデータクリア(2度押し確認はmenu.jsの共通関数)
    document.querySelectorAll('[data-clear-scope]').forEach(function (card) {
      var btn = card.querySelector('.section-clear-btn');
      if (btn && window.armClearBtn) {
        window.armClearBtn(btn, function () {
          card.querySelectorAll('input.num-input').forEach(function (el) { el.value = ''; });
          recalc();
        });
      }
    });
    // ヒーローの全データクリア
    var heroClear = document.getElementById('heroClearBtn');
    if (heroClear && window.armHeroClearBtn) {
      window.armHeroClearBtn(heroClear, function () {
        inputs.forEach(function (el) { el.value = ''; });
        try { localStorage.removeItem(KEY); } catch (e) {}
        recalc();
      });
    }
    recalc();
  });
})();

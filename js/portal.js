/* ==========================================================================
   portal.html 専用スクリプト
   - テーマタブの切り替え(今日の朝刊 / 税制改正 / 中小企業 / 保険 / ケース / 保存)
   - サーチデスク(Google / ニュース / 国税庁内 / サイト内)
   - ☆保存(ブラウザのlocalStorageに保持)
   - マイエリア(地域選択と気象庁の予報表示)
   - 「最初に開くページに設定」の手順パネル
   ========================================================================== */
(function () {
  "use strict";

  var SAVED_KEY = "portal-saved-pages";
  var AREA_KEY = "portal-area-code";
  var SITE_DOMAIN = "bizplanlabo.com";

  /* ---------------- テーマタブ ---------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-portal-tab]"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-portal-panel]"));

  function showTab(key) {
    tabs.forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-portal-tab") === key);
    });
    panels.forEach(function (p) {
      p.hidden = p.getAttribute("data-portal-panel") !== key;
    });
    if (key === "saved") renderSaved();
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      showTab(t.getAttribute("data-portal-tab"));
    });
  });

  /* ---------------- サーチデスク ---------------- */
  var wordEl = document.getElementById("searchWord");
  var formEl = document.getElementById("searchForm");

  function searchUrl(kind, word) {
    var q = encodeURIComponent(word);
    if (kind === "news") return "https://www.google.com/search?tbm=nws&q=" + q;
    if (kind === "nta") return "https://www.google.com/search?q=" + encodeURIComponent("site:nta.go.jp " + word);
    if (kind === "site") return "https://www.google.com/search?q=" + encodeURIComponent("site:" + SITE_DOMAIN + " " + word);
    return "https://www.google.com/search?q=" + q;
  }

  function runSearch(kind) {
    var word = (wordEl && wordEl.value ? wordEl.value : "").trim();
    if (!word) {
      if (wordEl) wordEl.focus();
      return;
    }
    window.open(searchUrl(kind, word), "_blank", "noopener");
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      runSearch(btn.getAttribute("data-search"));
    });
  });
  if (formEl) {
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      runSearch("google");
    });
  }

  /* ---------------- ☆保存 ---------------- */
  function loadSaved() {
    try {
      var raw = localStorage.getItem(SAVED_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Object.prototype.toString.call(list) === "[object Array]" ? list : [];
    } catch (e) {
      return [];
    }
  }
  function storeSaved(list) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch (e) {
      /* プライベートモード等で保存できない場合は表示だけ更新する */
    }
  }
  function isSaved(href) {
    return loadSaved().some(function (item) {
      return item.href === href;
    });
  }
  function toggleSave(href, title) {
    var list = loadSaved();
    var idx = -1;
    list.forEach(function (item, i) {
      if (item.href === href) idx = i;
    });
    if (idx > -1) list.splice(idx, 1);
    else list.push({ href: href, title: title });
    storeSaved(list);
    syncStars();
    renderSaved();
  }

  var starButtons = Array.prototype.slice.call(document.querySelectorAll(".portal-save-btn"));
  function syncStars() {
    starButtons.forEach(function (btn) {
      var on = isSaved(btn.getAttribute("data-save-href"));
      btn.classList.toggle("is-saved", on);
      btn.innerHTML = on ? "★" : "☆";
      btn.setAttribute("aria-label", on ? "保存を解除する" : "保存する");
      btn.setAttribute("title", on ? "保存を解除する" : "「保存」タブに追加する");
    });
  }
  starButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      toggleSave(btn.getAttribute("data-save-href"), btn.getAttribute("data-save-title"));
    });
  });

  var savedList = document.getElementById("savedList");
  var savedEmpty = document.getElementById("savedEmpty");
  function renderSaved() {
    if (!savedList) return;
    var list = loadSaved();
    savedList.innerHTML = "";
    if (savedEmpty) savedEmpty.hidden = list.length > 0;
    list.forEach(function (item, i) {
      var row = document.createElement("div");
      row.className = "portal-feed-row" + (i === 0 ? " is-top" : "");

      var no = document.createElement("span");
      no.className = "portal-feed-no";
      no.textContent = ("0" + (i + 1)).slice(-2);

      var link = document.createElement("a");
      link.href = item.href;
      link.className = "flex-1";
      var text = document.createElement("span");
      text.className = "portal-feed-text";
      text.textContent = item.title;
      link.appendChild(text);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "portal-save-btn is-saved";
      del.innerHTML = "★";
      del.setAttribute("aria-label", "保存を解除する");
      del.setAttribute("title", "保存を解除する");
      del.addEventListener("click", function () {
        toggleSave(item.href, item.title);
      });

      row.appendChild(no);
      row.appendChild(link);
      row.appendChild(del);
      savedList.appendChild(row);
    });
  }

  /* ---------------- マイエリア(地域と天気) ---------------- */
  var areaSelect = document.getElementById("areaSelect");
  var wxPlace = document.getElementById("wxPlace");
  var wxDesc = document.getElementById("wxDesc");
  var wxTemp = document.getElementById("wxTemp");
  var wxLink = document.getElementById("wxLink");

  function areaLabel() {
    if (!areaSelect) return "";
    return areaSelect.options[areaSelect.selectedIndex].textContent;
  }

  /* YYYY-MM-DD(閲覧端末のローカル日付)。気象庁JSONの日付との突き合わせに使う */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  /* 気象庁の公開JSONから今日の天気と最高・最低気温を読む。
     発表が前日夕方のままの場合もあるため、日付が一致する要素を選ぶ。
     取得できない場合は数値を出さず、気象庁サイトへのリンクだけを残す */
  function loadWeather(code) {
    if (wxPlace) wxPlace.textContent = areaLabel();
    if (wxDesc) wxDesc.textContent = "読み込み中…";
    if (wxTemp) wxTemp.innerHTML = "";
    if (wxLink) wxLink.href = "https://www.jma.go.jp/bosai/forecast/#area_type=offices&area_code=" + code;

    fetch("https://www.jma.go.jp/bosai/forecast/data/forecast/" + code + ".json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("status " + res.status);
        return res.json();
      })
      .then(function (data) {
        var series = data[0].timeSeries;
        var today = todayKey();

        /* 天気: 今日の日付の要素を優先し、無ければ先頭を使う */
        var wSeries = series[0];
        var wArea = wSeries.areas[0];
        var wIdx = 0;
        wSeries.timeDefines.forEach(function (t, i) {
          if (t.slice(0, 10) === today && wIdx === 0) wIdx = i;
        });
        var weather = (wArea.weathers && wArea.weathers[wIdx] ? wArea.weathers[wIdx] : "").replace(/　/g, " ").trim();
        if (wxDesc) wxDesc.textContent = weather || "気象庁の予報を見る";

        /* 気温: 今日の日付が付いた値だけを拾い、最高と最低に振り分ける */
        var tSeries = null;
        series.forEach(function (s) {
          if (!tSeries && s.areas && s.areas[0] && s.areas[0].temps) tSeries = s;
        });
        if (tSeries && wxTemp) {
          var vals = [];
          tSeries.areas[0].temps.forEach(function (v, i) {
            var stamp = tSeries.timeDefines[i] || "";
            if (v !== "" && v !== null && stamp.slice(0, 10) === today) vals.push(Number(v));
          });
          if (vals.length) {
            var max = Math.max.apply(null, vals);
            var min = Math.min.apply(null, vals);
            var html = '<span class="temp-max">' + max + '</span><span class="unit">℃</span>';
            if (vals.length > 1) html += ' <span class="portal-note">/</span> <span class="temp-min">' + min + '</span><span class="unit">℃</span>';
            wxTemp.innerHTML = html;
          }
        }
      })
      .catch(function () {
        if (wxDesc) wxDesc.textContent = "予報は気象庁のページでご確認ください。";
        if (wxTemp) wxTemp.innerHTML = "";
      });
  }

  if (areaSelect) {
    var savedArea = null;
    try {
      savedArea = localStorage.getItem(AREA_KEY);
    } catch (e) {
      savedArea = null;
    }
    if (savedArea) {
      Array.prototype.slice.call(areaSelect.options).forEach(function (o) {
        if (o.value === savedArea) areaSelect.value = savedArea;
      });
    }
    areaSelect.addEventListener("change", function () {
      try {
        localStorage.setItem(AREA_KEY, areaSelect.value);
      } catch (e) {
        /* 保存できない環境では選択状態のみ反映する */
      }
      loadWeather(areaSelect.value);
    });
    loadWeather(areaSelect.value);
  }

  /* ---------------- 最初に開くページに設定 ---------------- */
  var startupBtn = document.getElementById("startupBtn");
  var startupPanel = document.getElementById("startupPanel");
  var startupUrl = document.getElementById("startupUrl");
  var startupCopy = document.getElementById("startupCopy");

  if (startupUrl && location.protocol.indexOf("http") === 0 && location.hostname.indexOf(SITE_DOMAIN) === -1) {
    /* ローカル確認時は実際に開いているURLを表示する */
    startupUrl.textContent = location.href.split("#")[0];
  }

  if (startupBtn && startupPanel) {
    startupBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = startupPanel.hidden;
      startupPanel.hidden = !open;
      startupBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (startupPanel.hidden) return;
      if (startupPanel.contains(e.target)) return;
      startupPanel.hidden = true;
      startupBtn.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !startupPanel.hidden) {
        startupPanel.hidden = true;
        startupBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (startupCopy && startupUrl) {
    startupCopy.addEventListener("click", function () {
      var text = startupUrl.textContent;
      var done = function () {
        startupCopy.textContent = "コピーしました";
        setTimeout(function () {
          startupCopy.textContent = "コピー";
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          startupCopy.textContent = "コピーできません";
        });
      } else {
        startupCopy.textContent = "コピーできません";
      }
    });
  }

  /* ---------------- 初期化 ---------------- */
  syncStars();
  renderSaved();
})();

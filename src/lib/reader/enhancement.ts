// Browser-side reader chrome for the in-browser ebook reader. Loaded by
// /api/library/[productId]/read as a single inline <style> + <script>
// pair so it runs before any of the ebook's own assets and works
// independently of Next.js client bundles. Everything here ships as
// strings — keep the JS ES5-flavoured (no arrow shorthand for class
// methods, no async/await) so it works inside whatever runtime the
// uploaded ebook expects.

const READER_STYLES = String.raw`
:root {
  --templify-reader-bg: #faf6f0;
  --templify-reader-fg: #1a1612;
  --templify-reader-muted: rgba(26, 22, 18, 0.65);
  --templify-reader-accent: #b9763a;
  --templify-reader-toolbar-bg: rgba(20, 18, 15, 0.85);
  --templify-reader-toolbar-fg: #f5f1ea;
  --templify-reader-toolbar-muted: rgba(245, 241, 234, 0.7);
  --templify-reader-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.4);
  --templify-reader-scale: 1;
}
html[data-templify-theme="light"] body { background: var(--templify-reader-bg); color: var(--templify-reader-fg); }
html[data-templify-theme="sepia"] body {
  --templify-reader-bg: #f4ecd8;
  --templify-reader-fg: #3a2e1e;
  background: var(--templify-reader-bg);
  color: var(--templify-reader-fg);
}
html[data-templify-theme="dark"] body {
  --templify-reader-bg: #14110d;
  --templify-reader-fg: #ece6d8;
  --templify-reader-muted: rgba(236, 230, 216, 0.6);
  background: var(--templify-reader-bg);
  color: var(--templify-reader-fg);
}
html[data-templify-theme="dark"] a { color: #f5d290; }
body { transition: background 250ms ease, color 250ms ease; }
body * { font-size: calc(1em * var(--templify-reader-scale)) !important; }
html[data-templify-scale-applied="true"] body { font-size: calc(16px * var(--templify-reader-scale)); line-height: 1.7; }

.templify-reader-chrome {
  position: fixed; top: 0; left: 0; right: 0; z-index: 2147483646;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: var(--templify-reader-toolbar-bg);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  color: var(--templify-reader-toolbar-fg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px; line-height: 1.4;
  box-shadow: var(--templify-reader-shadow);
  transform: translateY(0); transition: transform .25s ease;
}
.templify-reader-chrome.is-hidden { transform: translateY(-100%); }

.templify-reader-chrome a.templify-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--templify-reader-toolbar-fg);
  text-decoration: none; font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: background .2s ease;
}
.templify-reader-chrome a.templify-back:hover { background: rgba(255, 255, 255, 0.16); }

.templify-reader-chrome .templify-title {
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: rgba(245, 241, 234, 0.92); font-weight: 500;
  letter-spacing: 0.02em;
}

.templify-reader-chrome .templify-pct {
  font-variant-numeric: tabular-nums; font-weight: 600;
  font-size: 12px; color: rgba(245, 241, 234, 0.92);
  min-width: 42px; text-align: right;
}

.templify-reader-chrome .templify-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 999px; background: transparent;
  border: 0; color: rgba(245, 241, 234, 0.7);
  cursor: pointer; transition: background .2s ease, color .2s ease;
}
.templify-reader-chrome .templify-icon-btn:hover,
.templify-reader-chrome .templify-icon-btn[aria-pressed="true"] {
  background: rgba(255, 255, 255, 0.12);
  color: var(--templify-reader-toolbar-fg);
}

.templify-reader-progress {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: transparent; overflow: hidden;
}
.templify-reader-progress .templify-fill {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, #e2bc72, #f5d290);
  transition: width .15s ease-out;
}

.templify-reader-show {
  position: fixed; top: 8px; right: 12px; z-index: 2147483646;
  width: 36px; height: 36px; border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(10px);
  color: #1a1612;
  display: none; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: var(--templify-reader-shadow);
}
.templify-reader-chrome.is-hidden ~ .templify-reader-show { display: inline-flex; }

.templify-reader-panel {
  position: fixed; right: 12px; top: 64px; width: min(340px, calc(100vw - 24px));
  max-height: calc(100vh - 96px);
  z-index: 2147483645;
  border-radius: 18px;
  background: var(--templify-reader-toolbar-bg);
  color: var(--templify-reader-toolbar-fg);
  box-shadow: 0 24px 60px -16px rgba(0, 0, 0, 0.55);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  display: none; flex-direction: column;
  overflow: hidden; font-family: inherit;
  animation: templify-fade-in 160ms ease-out;
}
.templify-reader-panel.is-open { display: flex; }
.templify-reader-panel header {
  padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--templify-reader-toolbar-muted);
}
.templify-reader-panel .templify-panel-body {
  padding: 8px 8px 12px; overflow-y: auto; min-height: 0;
}
.templify-reader-panel button.templify-panel-close {
  background: transparent; border: 0; color: var(--templify-reader-toolbar-muted);
  width: 28px; height: 28px; border-radius: 999px; cursor: pointer;
}
.templify-reader-panel button.templify-panel-close:hover {
  background: rgba(255, 255, 255, 0.08); color: var(--templify-reader-toolbar-fg);
}

.templify-toc-list { list-style: none; margin: 0; padding: 0; }
.templify-toc-list li { margin: 0; padding: 0; }
.templify-toc-list a {
  display: block; padding: 8px 12px; border-radius: 12px;
  color: var(--templify-reader-toolbar-fg); text-decoration: none;
  font-size: 13px; line-height: 1.4;
  transition: background .15s ease;
}
.templify-toc-list a:hover { background: rgba(255, 255, 255, 0.08); }
.templify-toc-list a.is-h2 { padding-left: 26px; color: var(--templify-reader-toolbar-muted); font-size: 12px; }
.templify-toc-list a.is-h3 { padding-left: 40px; color: var(--templify-reader-toolbar-muted); font-size: 12px; }
.templify-toc-list a.is-current { background: rgba(226, 188, 114, 0.18); color: #f5d290; }

.templify-bookmarks-list { list-style: none; margin: 0; padding: 0; }
.templify-bookmarks-list li {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
}
.templify-bookmarks-list a {
  flex: 1; min-width: 0;
  color: var(--templify-reader-toolbar-fg); text-decoration: none;
  font-size: 13px; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.templify-bookmarks-list a:hover { color: #f5d290; }
.templify-bookmarks-list .templify-bookmarks-pct {
  color: var(--templify-reader-toolbar-muted); font-size: 11px;
  font-variant-numeric: tabular-nums; flex-shrink: 0;
}
.templify-bookmarks-list button {
  background: transparent; border: 0; color: var(--templify-reader-toolbar-muted);
  width: 24px; height: 24px; border-radius: 999px; cursor: pointer;
  flex-shrink: 0;
}
.templify-bookmarks-list button:hover {
  background: rgba(220, 38, 38, 0.18); color: #fca5a5;
}
.templify-bookmarks-empty {
  padding: 18px 12px; text-align: center;
  color: var(--templify-reader-toolbar-muted); font-size: 13px; line-height: 1.5;
}
.templify-bookmark-add {
  display: flex; gap: 6px; padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.templify-bookmark-add input {
  flex: 1; min-width: 0; padding: 8px 10px;
  border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.25); color: var(--templify-reader-toolbar-fg);
  font-size: 13px; font-family: inherit;
}
.templify-bookmark-add input:focus { outline: 2px solid rgba(226, 188, 114, 0.4); }
.templify-bookmark-add button {
  border: 0; background: #e2bc72; color: #1a1612;
  padding: 0 14px; border-radius: 10px; font-weight: 600;
  cursor: pointer; font-family: inherit; font-size: 13px;
}

.templify-settings-section { padding: 12px 16px; }
.templify-settings-section + .templify-settings-section { border-top: 1px solid rgba(255, 255, 255, 0.06); }
.templify-settings-label {
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--templify-reader-toolbar-muted); margin-bottom: 10px;
}
.templify-settings-row { display: flex; gap: 8px; }
.templify-settings-row button {
  flex: 1; padding: 10px 8px;
  border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04); color: var(--templify-reader-toolbar-fg);
  cursor: pointer; font-family: inherit; font-size: 13px;
  transition: background .15s ease, border-color .15s ease;
}
.templify-settings-row button:hover { background: rgba(255, 255, 255, 0.08); }
.templify-settings-row button.is-active {
  background: rgba(226, 188, 114, 0.18); border-color: rgba(226, 188, 114, 0.45);
  color: #f5d290;
}

@keyframes templify-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
}

body { padding-top: 64px !important; }
@media (max-width: 520px) {
  .templify-reader-chrome { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .templify-reader-chrome a.templify-back { padding: 6px 10px; font-size: 12px; }
  .templify-reader-chrome a.templify-back .templify-back-label { display: none; }
  .templify-reader-chrome .templify-pct { display: none; }
  body { padding-top: 56px !important; }
  .templify-reader-panel { top: 56px; }
}
@media print {
  .templify-reader-chrome, .templify-reader-show, .templify-reader-panel { display: none !important; }
  body { padding-top: 0 !important; }
}
`;

const READER_SCRIPT = String.raw`
(function () {
  try {
    var STORAGE = {
      progress: "templify:reading-progress:",
      opened: "templify:reading-opened:",
      bookmarks: "templify:bookmarks:",
      theme: "templify:reader-theme",
      scale: "templify:reader-scale",
    };
    var CFG = window.__templifyReaderCfg || {};
    var productId = CFG.productId || "";
    var productName = CFG.productName || document.title || "";

    var pkey = STORAGE.progress + productId;
    var okey = STORAGE.opened + productId;
    var bkey = STORAGE.bookmarks + productId;

    var saved = parseFloat(localStorage.getItem(pkey) || "0");
    if (!Number.isFinite(saved) || saved < 0) saved = 0;
    var maxPercent = saved;

    var chromeEl = null;
    var fillEl = null;
    var pctEl = null;
    var panelEl = null;
    var panelMode = null;

    function readPercent() {
      var el = document.scrollingElement || document.documentElement;
      var scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 0) return 100;
      var pct = (el.scrollTop / scrollable) * 100;
      return Math.max(0, Math.min(100, pct));
    }

    function persistProgress() {
      var current = readPercent();
      var rounded = Math.round(current);
      if (fillEl) fillEl.style.width = current.toFixed(1) + "%";
      if (pctEl) pctEl.textContent = rounded + "%";
      if (rounded > maxPercent) {
        maxPercent = rounded;
        try { localStorage.setItem(pkey, String(maxPercent)); } catch (e) {}
      }
    }

    function applyTheme(theme) {
      var allowed = ["light", "sepia", "dark"];
      if (allowed.indexOf(theme) === -1) theme = "light";
      document.documentElement.setAttribute("data-templify-theme", theme);
      try { localStorage.setItem(STORAGE.theme, theme); } catch (e) {}
      refreshSettingsButtons();
    }

    function applyScale(scale) {
      var num = parseFloat(scale);
      if (!Number.isFinite(num)) num = 1;
      num = Math.max(0.85, Math.min(1.4, num));
      document.documentElement.style.setProperty("--templify-reader-scale", String(num));
      document.documentElement.setAttribute("data-templify-scale-applied", "true");
      try { localStorage.setItem(STORAGE.scale, String(num)); } catch (e) {}
      refreshSettingsButtons();
    }

    function refreshSettingsButtons() {
      if (!panelEl) return;
      var theme = document.documentElement.getAttribute("data-templify-theme") || "light";
      var scale = parseFloat(document.documentElement.style.getPropertyValue("--templify-reader-scale") || "1");
      var themeBtns = panelEl.querySelectorAll("[data-theme]");
      for (var i = 0; i < themeBtns.length; i++) {
        var b = themeBtns[i];
        if (b.getAttribute("data-theme") === theme) b.classList.add("is-active");
        else b.classList.remove("is-active");
      }
      var scaleBtns = panelEl.querySelectorAll("[data-scale]");
      for (var j = 0; j < scaleBtns.length; j++) {
        var sb = scaleBtns[j];
        if (Math.abs(parseFloat(sb.getAttribute("data-scale")) - scale) < 0.01) {
          sb.classList.add("is-active");
        } else {
          sb.classList.remove("is-active");
        }
      }
    }

    function svg(d) {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
    }

    function buildChrome() {
      chromeEl = document.createElement("div");
      chromeEl.className = "templify-reader-chrome";
      chromeEl.setAttribute("role", "toolbar");
      chromeEl.setAttribute("aria-label", "Pasek czytnika");
      chromeEl.innerHTML =
        '<a class="templify-back" href="/biblioteka" aria-label="Wróć do biblioteki">' +
        svg("M15 18l-6-6 6-6") +
        '<span class="templify-back-label">Biblioteka</span></a>' +
        '<span class="templify-title"></span>' +
        '<span class="templify-pct" aria-live="polite">0%</span>' +
        '<button type="button" class="templify-icon-btn" data-panel="toc" aria-label="Spis treści" title="Spis treści">' +
        svg("M3 6h18M3 12h18M3 18h18") +
        '</button>' +
        '<button type="button" class="templify-icon-btn" data-panel="bookmarks" aria-label="Zakładki" title="Zakładki">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
        '</button>' +
        '<button type="button" class="templify-icon-btn" data-panel="settings" aria-label="Ustawienia czytnika" title="Ustawienia">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.5.6 1.1.6 1.65V11h.09A2 2 0 1 1 21 15h-.09c-.55 0-1.15.24-1.65.6z"/></svg>' +
        '</button>' +
        '<button type="button" class="templify-icon-btn" data-action="hide" aria-label="Ukryj pasek">' +
        svg("M18 15l-6-6-6 6") +
        '</button>' +
        '<div class="templify-reader-progress"><span class="templify-fill"></span></div>';
      document.body.insertBefore(chromeEl, document.body.firstChild);

      var showEl = document.createElement("button");
      showEl.type = "button";
      showEl.className = "templify-reader-show";
      showEl.setAttribute("aria-label", "Pokaż pasek czytnika");
      showEl.innerHTML = svg("M6 9l6 6 6-6");
      document.body.appendChild(showEl);

      var titleEl = chromeEl.querySelector(".templify-title");
      if (titleEl) titleEl.textContent = productName;
      fillEl = chromeEl.querySelector(".templify-fill");
      pctEl = chromeEl.querySelector(".templify-pct");

      chromeEl.addEventListener("click", function (event) {
        var target = event.target;
        while (target && target !== chromeEl) {
          if (target.dataset && target.dataset.action === "hide") {
            chromeEl.classList.add("is-hidden");
            return;
          }
          if (target.dataset && target.dataset.panel) {
            togglePanel(target.dataset.panel, target);
            return;
          }
          target = target.parentNode;
        }
      });
      showEl.addEventListener("click", function () {
        chromeEl.classList.remove("is-hidden");
      });
    }

    function ensurePanel() {
      if (panelEl) return panelEl;
      panelEl = document.createElement("div");
      panelEl.className = "templify-reader-panel";
      panelEl.setAttribute("role", "dialog");
      document.body.appendChild(panelEl);
      return panelEl;
    }

    function togglePanel(mode, button) {
      ensurePanel();
      var pressed = button && button.getAttribute("aria-pressed") === "true";
      var allBtns = chromeEl.querySelectorAll("[data-panel]");
      for (var i = 0; i < allBtns.length; i++) allBtns[i].setAttribute("aria-pressed", "false");
      if (panelMode === mode && pressed) {
        panelEl.classList.remove("is-open");
        panelMode = null;
        return;
      }
      if (button) button.setAttribute("aria-pressed", "true");
      panelMode = mode;
      renderPanel(mode);
      panelEl.classList.add("is-open");
    }

    function renderPanel(mode) {
      if (!panelEl) return;
      if (mode === "toc") {
        panelEl.innerHTML = panelHeader("Spis treści") + '<div class="templify-panel-body"><ul class="templify-toc-list">' + buildTocItems() + '</ul></div>';
      } else if (mode === "bookmarks") {
        panelEl.innerHTML = panelHeader("Zakładki") + '<div class="templify-panel-body" data-bookmarks-body></div>' + bookmarkAddRow();
        renderBookmarksBody();
        wireBookmarkAdd();
      } else {
        panelEl.innerHTML = panelHeader("Ustawienia czytnika") + settingsBody();
        wireSettings();
      }
      var closeBtn = panelEl.querySelector(".templify-panel-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          panelEl.classList.remove("is-open");
          panelMode = null;
          var allBtns = chromeEl.querySelectorAll("[data-panel]");
          for (var i = 0; i < allBtns.length; i++) allBtns[i].setAttribute("aria-pressed", "false");
        });
      }
      refreshSettingsButtons();
    }

    function panelHeader(label) {
      return '<header><span>' + label + '</span><button type="button" class="templify-panel-close" aria-label="Zamknij">' + svg("M18 6L6 18M6 6l12 12") + '</button></header>';
    }

    function buildTocItems() {
      var headings = document.querySelectorAll("h1, h2, h3");
      var items = [];
      var index = 0;
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (h.closest(".templify-reader-chrome") || h.closest(".templify-reader-panel")) continue;
        var text = (h.textContent || "").trim();
        if (!text) continue;
        if (!h.id) h.id = "templify-h-" + (++index);
        var levelCls = h.tagName === "H1" ? "is-h1" : h.tagName === "H2" ? "is-h2" : "is-h3";
        items.push('<li><a href="#' + h.id + '" class="' + levelCls + '">' + escapeHtml(text) + '</a></li>');
      }
      if (items.length === 0) {
        return '<li class="templify-bookmarks-empty">Ten ebook nie zawiera nagłówków, więc spis treści jest pusty.</li>';
      }
      return items.join("");
    }

    function loadBookmarks() {
      try {
        var raw = localStorage.getItem(bkey);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function saveBookmarks(list) {
      try { localStorage.setItem(bkey, JSON.stringify(list)); } catch (e) {}
    }

    function renderBookmarksBody() {
      if (!panelEl) return;
      var body = panelEl.querySelector("[data-bookmarks-body]");
      if (!body) return;
      var list = loadBookmarks();
      if (list.length === 0) {
        body.innerHTML = '<div class="templify-bookmarks-empty">Brak zakładek. Dodaj pierwszą poniżej — wrócisz tu w sekundę.</div>';
        return;
      }
      var items = list
        .slice()
        .sort(function (a, b) { return a.percent - b.percent; })
        .map(function (b, i) {
          return '<li>' +
            '<a href="#" data-bookmark-jump="' + i + '" title="' + escapeHtml(b.label || "") + '">' + escapeHtml(b.label || "Zakładka") + '</a>' +
            '<span class="templify-bookmarks-pct">' + b.percent + '%</span>' +
            '<button type="button" data-bookmark-remove="' + i + '" aria-label="Usuń zakładkę">' + svg("M6 6l12 12M6 18L18 6") + '</button>' +
          '</li>';
        });
      body.innerHTML = '<ul class="templify-bookmarks-list">' + items.join("") + '</ul>';
      body.addEventListener("click", function (event) {
        var target = event.target;
        while (target && target !== body) {
          if (target.dataset && target.dataset.bookmarkJump !== undefined) {
            event.preventDefault();
            var idx = parseInt(target.dataset.bookmarkJump, 10);
            jumpToBookmark(idx);
            return;
          }
          if (target.dataset && target.dataset.bookmarkRemove !== undefined) {
            removeBookmark(parseInt(target.dataset.bookmarkRemove, 10));
            return;
          }
          target = target.parentNode;
        }
      });
    }

    function jumpToBookmark(index) {
      var list = loadBookmarks();
      var sorted = list.slice().sort(function (a, b) { return a.percent - b.percent; });
      var bm = sorted[index];
      if (!bm) return;
      var el = document.scrollingElement || document.documentElement;
      var target = (bm.percent / 100) * (el.scrollHeight - el.clientHeight);
      el.scrollTo({ top: target, behavior: "smooth" });
    }

    function removeBookmark(index) {
      var list = loadBookmarks();
      var sorted = list.slice().sort(function (a, b) { return a.percent - b.percent; });
      var target = sorted[index];
      var next = list.filter(function (item) {
        return !(item.percent === target.percent && item.label === target.label);
      });
      saveBookmarks(next);
      renderBookmarksBody();
    }

    function bookmarkAddRow() {
      return '<form class="templify-bookmark-add" data-bookmark-add>' +
        '<input type="text" name="label" placeholder="Etykieta zakładki (opcjonalna)" maxlength="80" />' +
        '<button type="submit">Dodaj</button>' +
      '</form>';
    }

    function wireBookmarkAdd() {
      if (!panelEl) return;
      var form = panelEl.querySelector("[data-bookmark-add]");
      if (!form) return;
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='label']");
        var label = input ? input.value.trim() : "";
        var percent = Math.round(readPercent());
        var list = loadBookmarks();
        list.push({
          label: label || ("Zakładka @ " + percent + "%"),
          percent: percent,
          createdAt: new Date().toISOString(),
        });
        saveBookmarks(list);
        if (input) input.value = "";
        renderBookmarksBody();
      });
    }

    function settingsBody() {
      return '' +
        '<section class="templify-settings-section">' +
          '<div class="templify-settings-label">Motyw</div>' +
          '<div class="templify-settings-row">' +
            '<button type="button" data-theme="light">Jasny</button>' +
            '<button type="button" data-theme="sepia">Sepia</button>' +
            '<button type="button" data-theme="dark">Ciemny</button>' +
          '</div>' +
        '</section>' +
        '<section class="templify-settings-section">' +
          '<div class="templify-settings-label">Rozmiar tekstu</div>' +
          '<div class="templify-settings-row">' +
            '<button type="button" data-scale="0.9">A−</button>' +
            '<button type="button" data-scale="1">A</button>' +
            '<button type="button" data-scale="1.15">A+</button>' +
            '<button type="button" data-scale="1.3">A++</button>' +
          '</div>' +
        '</section>';
    }

    function wireSettings() {
      if (!panelEl) return;
      var themeBtns = panelEl.querySelectorAll("[data-theme]");
      for (var i = 0; i < themeBtns.length; i++) {
        themeBtns[i].addEventListener("click", function (event) {
          applyTheme(event.currentTarget.getAttribute("data-theme"));
        });
      }
      var scaleBtns = panelEl.querySelectorAll("[data-scale]");
      for (var j = 0; j < scaleBtns.length; j++) {
        scaleBtns[j].addEventListener("click", function (event) {
          applyScale(event.currentTarget.getAttribute("data-scale"));
        });
      }
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function restoreScroll() {
      if (saved > 0 && saved < 99) {
        var el = document.scrollingElement || document.documentElement;
        var target = (saved / 100) * (el.scrollHeight - el.clientHeight);
        el.scrollTo({ top: target, behavior: "instant" });
      }
    }

    function loadPrefs() {
      var savedTheme = localStorage.getItem(STORAGE.theme);
      applyTheme(savedTheme || "light");
      var savedScale = localStorage.getItem(STORAGE.scale);
      if (savedScale) applyScale(savedScale);
      else applyScale(1);
    }

    loadPrefs();

    window.addEventListener("DOMContentLoaded", function () {
      if (document.body) buildChrome();
      persistProgress();
    });
    window.addEventListener("load", function () {
      restoreScroll();
      try { localStorage.setItem(okey, String(Date.now())); } catch (e) {}
      // Streak: idempotent per UTC day. Mirrors lib/reading-streak.ts so
      // /biblioteka can show updated counts without an explicit ping.
      try {
        var sk = "templify:reading-streak";
        var rawState = localStorage.getItem(sk);
        var state = rawState ? JSON.parse(rawState) : { current: 0, best: 0, lastReadOn: null, totalDays: 0 };
        var d = new Date();
        var today = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        if (state.lastReadOn !== today) {
          var nextCurrent = 1;
          if (state.lastReadOn) {
            var dayMs = 86400000;
            var diff = Math.round((Date.parse(today + "T00:00:00Z") - Date.parse(state.lastReadOn + "T00:00:00Z")) / dayMs);
            if (diff === 1) nextCurrent = (state.current || 0) + 1;
          }
          var nextStreak = {
            current: nextCurrent,
            best: Math.max(state.best || 0, nextCurrent),
            lastReadOn: today,
            totalDays: (state.totalDays || 0) + 1,
          };
          localStorage.setItem(sk, JSON.stringify(nextStreak));
          try { window.dispatchEvent(new Event("templify-reading-streak-updated")); } catch (e) {}
        }
      } catch (e) {}
      persistProgress();
    });

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        persistProgress();
        queued = false;
      });
    }, { passive: true });
    window.addEventListener("beforeunload", persistProgress);
  } catch (err) {
    /* progress is best-effort, never block reading */
  }
})();
`;

export function renderReaderEnhancement(productId: string, productName: string) {
  const cfg = JSON.stringify({ productId, productName });
  return `<style>${READER_STYLES}</style>
<script>window.__templifyReaderCfg=${cfg};</script>
<script>${READER_SCRIPT}</script>`;
}

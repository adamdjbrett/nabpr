/* Theme toggle (system default, persisted choice) and the homepage ledger filter. */
(function () {
  "use strict";

  var root = document.documentElement;
  var btn = document.getElementById("themeToggle");
  var lbl = document.getElementById("themeLabel");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function read() {
    try { return localStorage.getItem("nabpr-theme"); } catch (error) { return null; }
  }
  function write(value) {
    try { localStorage.setItem("nabpr-theme", value); } catch (error) { /* private mode */ }
  }
  function apply(dark) {
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.setAttribute("data-pf-theme", dark ? "dark" : "light");
    if (!btn) return;
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    lbl.textContent = dark ? "Light" : "Dark";
  }

  apply(read() ? read() === "dark" : mq.matches);
  mq.addEventListener("change", function (event) {
    if (!read()) apply(event.matches);
  });
  if (btn) {
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") !== "dark";
      write(dark ? "dark" : "light");
      apply(dark);
    });
  }

  /* Search. Pagefind's bundle is 217 KB, so it is fetched the first time someone reaches for
     search rather than on every page load. The nav link still points at /search/, which works
     with no JavaScript at all; with JavaScript it opens the modal in place, as does ⌘K/Ctrl+K. */
  var modal = document.querySelector("pagefind-modal");
  var searchLink = document.querySelector('.nav-list a[href="/search/"]');
  var pagefind;

  function loadPagefind() {
    if (pagefind) return pagefind;
    pagefind = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "/pagefind/pagefind-component-ui.css";
      document.head.appendChild(css);
      var script = document.createElement("script");
      script.type = "module";
      script.src = "/pagefind/pagefind-component-ui.js";
      script.onload = function () { customElements.whenDefined("pagefind-modal").then(resolve); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return pagefind;
  }

  function openModal(event) {
    if (!modal) return;
    if (event) event.preventDefault();
    loadPagefind().then(function () {
      if (typeof modal.open === "function") modal.open();
    }, function () {
      window.location.href = "/search/";
    });
  }

  if (searchLink) searchLink.addEventListener("click", openModal);
  document.addEventListener("keydown", function (event) {
    if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;
    var el = document.activeElement;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
    openModal(event);
  });
  /* The search page and the 404 page render the components inline, so they need it up front.
     A ?q= in the URL is honoured, which is what the JSON-LD SearchAction promises. */
  if (document.querySelector("pagefind-input")) {
    loadPagefind().then(function () {
      var query = new URLSearchParams(location.search).get("q");
      if (!query) return;
      var field = document.querySelector("pagefind-input input");
      if (!field) return;
      field.value = query;
      field.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
  }

  var chips = document.querySelectorAll(".chip");
  var entries = document.querySelectorAll(".entry");
  var empty = document.getElementById("entriesEmpty");
  if (!chips.length || !entries.length) return;

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var want = chip.getAttribute("data-filter");
      chips.forEach(function (other) {
        other.setAttribute("aria-pressed", other === chip ? "true" : "false");
      });
      var shown = 0;
      entries.forEach(function (entry) {
        var show = want === "all" || entry.getAttribute("data-cat") === want;
        entry.hidden = !show;
        if (show) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });
})();

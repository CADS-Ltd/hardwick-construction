/*
 * Premier Developments — interactive site plan.
 * Each [data-premier-plan] block carries its data as JSON. Outlines are
 * percentages of the site plan image, drawn into an SVG with a 0–100 viewBox.
 *
 * Mouse: hovering a home shows its house type in the panel; clicking opens
 * the house type page. Touch: first tap shows the details, second tap opens.
 */
(function () {
  "use strict";

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5"/></svg>';
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  function init(root) {
    if (!root || root.getAttribute("data-ready")) return;
    root.setAttribute("data-ready", "1");
    var dataEl = root.querySelector(".plan-data");
    if (!dataEl) return;
    var data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }

    var types = data.types || {};
    // House types in the order the development lists them (their Order field, then name)
    var typeKeys = Object.keys(types).sort(function (a, b) {
      if (types[a].order !== undefined && types[b].order !== undefined) return types[a].order - types[b].order;
      return types[a].name.localeCompare(types[b].name, undefined, { numeric: true });
    });
    var byPlot = {};
    data.plots.forEach(function (p) { byPlot[p.plot] = p; });

    var canvas = root.querySelector(".plan-canvas");
    var svg = root.querySelector(".plan-svg");
    var panel = root.querySelector(".plan-panel");
    var tip = root.querySelector(".plan-tip");
    var typeBtns = Array.prototype.slice.call(root.querySelectorAll(".type-btn"));
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Hotspots
    svg.innerHTML = data.plots.filter(function (p) { return p.outline; }).map(function (p) {
      var t = types[p.type] || {};
      var label = "Plot " + p.plot + ", " + (t.name || p.typeName || "") + ", " + (t.style || "") + ", " + p.label +
        (p.status !== "sold" && p.price ? ", " + p.price : "");
      return '<g class="hs is-' + esc(p.status) + '" data-plot="' + esc(p.plot) + '" data-type="' + esc(p.type) +
        '" tabindex="0" role="button" aria-label="' + esc(label) + '"><polygon points="' + esc(p.outline) + '"/></g>';
    }).join("");
    var hotspots = Array.prototype.slice.call(svg.querySelectorAll(".hs"));

    function plotsOfType(k) { return data.plots.filter(function (p) { return p.type === k; }); }
    function typeUrl(k, plot) {
      var t = types[k];
      if (!t || !t.url) return "";
      return t.url + (plot != null ? (t.url.indexOf("?") > -1 ? "&" : "?") + "plot=" + encodeURIComponent(plot) : "");
    }
    function mailto(subject) { return "mailto:" + data.email + "?subject=" + encodeURIComponent(subject); }

    var pinned = null;
    var shown = null;
    var hoverLockUntil = 0; // ignore hovers while the page scrolls the plan under the pointer

    function paint(state) {
      var k = state && state.type;
      canvas.classList.toggle("has-focus", !!k);
      hotspots.forEach(function (g) {
        g.classList.toggle("is-type", !!k && g.getAttribute("data-type") === k);
        g.classList.toggle("is-active", !!state && state.plot != null && g.getAttribute("data-plot") === String(state.plot));
      });
      var pinnedType = pinned ? pinned.type : "";
      typeBtns.forEach(function (b) {
        var on = b.getAttribute("data-type") === pinnedType;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var key = k ? k + ":" + (state.plot == null ? "" : state.plot) : "";
      if (key === shown) return;
      shown = key;
      panel.innerHTML = k ? typePanel(k, state.plot) : overviewPanel();
      panel.classList.remove("is-swap");
      void panel.offsetWidth;
      panel.classList.add("is-swap");
      bindPanel();
    }

    function bindPanel() {
      panel.querySelectorAll("[data-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          var p = byPlot[b.getAttribute("data-pick")];
          pin({ type: p.type, plot: p.plot });
        });
      });
      panel.querySelectorAll("[data-pick-type]").forEach(function (b) {
        b.addEventListener("click", function () { pin({ type: b.getAttribute("data-pick-type"), plot: null }); });
      });
      var clear = panel.querySelector("[data-clear]");
      if (clear) clear.addEventListener("click", function () { pin(null); });
    }

    function pin(state) { pinned = state; paint(state); }
    function stateFor(g) { return { type: g.getAttribute("data-type"), plot: g.getAttribute("data-plot") }; }

    hotspots.forEach(function (g) {
      var wasSelected = false;
      g.addEventListener("mouseenter", function () {
        if (Date.now() < hoverLockUntil) return;
        pin(stateFor(g)); showTip(g);
      });
      g.addEventListener("mouseleave", hideTip);
      g.addEventListener("focus", function () { pin(stateFor(g)); });
      g.addEventListener("pointerdown", function () {
        wasSelected = !!pinned && String(pinned.plot) === g.getAttribute("data-plot");
      });
      g.addEventListener("click", function () {
        var s = stateFor(g);
        var open = canHover || wasSelected;
        wasSelected = false;
        var url = typeUrl(s.type, s.plot);
        if (open && url) { window.location.href = url; return; }
        pin(s);
        if (window.matchMedia("(max-width: 960px)").matches) {
          var r = panel.getBoundingClientRect();
          if (r.top > window.innerHeight * 0.85 || r.top < 0) {
            panel.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          }
        }
      });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          wasSelected = true;
          g.dispatchEvent(new MouseEvent("click"));
        }
      });
    });
    canvas.addEventListener("mouseleave", hideTip);
    canvas.addEventListener("mousemove", moveTip);

    typeBtns.forEach(function (b) {
      var k = b.getAttribute("data-type");
      b.addEventListener("click", function () { pin(k ? { type: k, plot: null } : null); });
      b.addEventListener("mouseenter", function () { if (k) paint({ type: k, plot: null }); });
      b.addEventListener("mouseleave", function () { paint(pinned); });
    });

    // "Show on plan" buttons on house type cards elsewhere on the page
    document.querySelectorAll("[data-show-type]").forEach(function (b) {
      b.addEventListener("click", function () {
        pin({ type: b.getAttribute("data-show-type"), plot: null });
        hoverLockUntil = Date.now() + 1500;
        root.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      });
    });

    function showTip(g) {
      var p = byPlot[g.getAttribute("data-plot")];
      var t = types[p.type] || {};
      tip.innerHTML = "<strong>Plot " + esc(p.plot) + "</strong><span>" + esc(t.name || p.typeName) +
        ' · <em class="tip-' + esc(p.status) + '">' + esc(p.label) + "</em></span>" +
        (typeUrl(p.type) ? "<small>Click for full details</small>" : "");
      tip.classList.add("is-on");
    }
    function hideTip() { tip.classList.remove("is-on"); }
    function moveTip(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var flip = x > r.width - 180;
      tip.style.transform = "translate(" + (flip ? x - 16 : x + 16) + "px," + (y + 16) + "px)" + (flip ? " translateX(-100%)" : "");
    }

    function overviewPanel() {
      return '<div class="panel-intro">' +
        '<p class="eyebrow">' + esc(data.name) + "</p>" +
        '<p class="panel-title">Choose a home</p>' +
        '<p class="panel-text">Hover over any home on the plan to see its house type, room sizes and the plots of that type available now. Click a home for its full floor plans.</p>' +
        '<ul class="panel-types">' + typeKeys.map(function (k) {
          var list = plotsOfType(k);
          var avail = list.filter(function (p) { return p.status === "available"; }).length;
          return '<li><button type="button" data-pick-type="' + esc(k) + '">' +
            '<span class="pt-name">' + esc(types[k].name) + "</span>" +
            '<span class="pt-meta">' + esc(plural(list.length, "plot", "plots")) + "</span>" +
            '<span class="pt-avail' + (avail ? "" : " is-none") + '">' + (avail ? esc(avail + " available") : "None available") + "</span>" +
            "</button></li>";
        }).join("") + "</ul></div>";
    }

    function typePanel(k, plotNo) {
      var t = types[k] || { name: "", style: "", area: "" };
      var list = plotsOfType(k);
      var avail = list.filter(function (p) { return p.status === "available"; });
      var others = list.filter(function (p) { return p.status !== "available"; });
      var p = plotNo != null ? byPlot[plotNo] : null;

      var media = t.image
        ? '<div class="panel-media"><img src="' + esc(t.image) + '" alt="' + esc(t.name + " — computer generated image") + '"></div>'
        : '<div class="panel-media is-empty"><span>' + esc(t.name) + "</span><small>Images to follow</small></div>";
      var strip = p
        ? '<div class="panel-plot is-' + esc(p.status) + '"><span class="pp-no">Plot ' + esc(p.plot) + "</span>" +
          '<span class="badge badge-' + esc(p.status) + '">' + esc(p.label) + "</span>" +
          '<span class="pp-price">' + (p.status === "sold" ? "Sold" : esc(p.price || "Enquire")) + "</span></div>"
        : "";
      function rooms(title, rows) {
        if (!rows || !rows.length) return "";
        return '<div class="panel-rooms"><p class="pr-title">' + esc(title) + "</p><dl>" + rows.map(function (r) {
          return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>";
        }).join("") + "</dl></div>";
      }
      var availList = avail.length
        ? '<ul class="panel-avail">' + avail.map(function (q) {
            return '<li><button type="button" data-pick="' + esc(q.plot) + '"' + (p && p.plot === q.plot ? ' aria-current="true"' : "") + ">" +
              '<span class="pa-no">Plot ' + esc(q.plot) + '</span><span class="pa-price">' + esc(q.price || "Enquire") + "</span>" + ARROW + "</button></li>";
          }).join("") + "</ul>"
        : '<p class="panel-none">No ' + esc(t.name) + " homes are available right now. Please get in touch to register your interest.</p>";
      var otherText = others.length
        ? '<p class="panel-others">' + others.map(function (q) { return "Plot " + esc(q.plot) + " — " + esc(q.label.toLowerCase()); }).join(" · ") + "</p>"
        : "";
      var details = typeUrl(k, p ? p.plot : null);

      return media +
        '<div class="panel-body">' +
          '<div class="panel-head"><p class="eyebrow">House type</p>' +
            '<button type="button" class="panel-clear" data-clear aria-label="Clear selection"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
          '<p class="panel-title">' + esc(t.name) + "</p>" +
          (t.style ? '<p class="panel-style">' + esc(t.style) + "</p>" : "") +
          '<p class="panel-area">' + esc(t.area) + "</p>" +
          strip +
          '<p class="pr-title pr-avail">Available ' + esc(t.name) + " homes</p>" + availList + otherText +
          '<div class="panel-floors">' + rooms("Ground floor", t.ground) + rooms("First floor", t.first) + "</div>" +
          (t.summary ? '<p class="panel-text">' + esc(t.summary) + "</p>" : "") +
          (details ? '<a class="btn btn-gold btn-sm btn-block" href="' + esc(details) + '">Full details &amp; floor plans</a>' : "") +
          '<a class="btn btn-navy btn-sm btn-block" href="' + esc(mailto("Enquiry: " + t.name + (p ? ", plot " + p.plot : "") + " at " + data.name)) + '">Enquire about ' +
            esc(p ? "plot " + p.plot : t.name) + "</a>" +
        "</div>";
    }

    // Start on ?type=<house type id> if given
    var startType = new URLSearchParams(window.location.search).get("type");
    pin(startType && types[startType] ? { type: startType, plot: null } : null);
  }

  function boot() {
    document.querySelectorAll("[data-premier-plan]").forEach(init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // Elementor editor: set up the plan again whenever the widget is re-rendered
  window.addEventListener("elementor/frontend/init", function () {
    if (!window.elementorFrontend || !window.elementorFrontend.hooks) return;
    window.elementorFrontend.hooks.addAction("frontend/element_ready/premier-site-plan.default", function ($scope) {
      init($scope[0].querySelector("[data-premier-plan]"));
    });
  });

  window.PremierSitePlan = { init: init };
})();

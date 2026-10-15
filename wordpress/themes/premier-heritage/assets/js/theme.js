/*
 * Premier Heritage — header, menu, scroll animations, count-ups,
 * section sub-navigation and the image lightbox.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* "Skip to content" always has a target, including pages laid out by Elementor's own templates */
  if (!document.getElementById("main")) {
    var target = document.querySelector("main, [data-elementor-type='wp-page'], .elementor, .site-header ~ *:not(script)");
    if (target) target.id = "main";
  }
  var mainEl = document.getElementById("main");
  if (mainEl && !mainEl.hasAttribute("tabindex")) mainEl.setAttribute("tabindex", "-1");

  /* Header turns solid once the page scrolls */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 40 || document.body.classList.contains("no-hero")); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile menu */
  document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.querySelectorAll("[data-nav] a").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      var t = document.querySelector("[data-nav-toggle]");
      if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
    }
  });

  /* Scroll reveal: [data-reveal] gets .is-in; children of [data-stagger] get --i */
  function reveal() {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty("--i", i); });
    });
    var els = document.querySelectorAll("[data-reveal]:not(.is-in)");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Count-up numbers: <span data-count="140" data-suffix="+"> */
  function counters() {
    var els = document.querySelectorAll("[data-count]:not([data-counted])");
    function run(el) {
      el.setAttribute("data-counted", "1");
      var to = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "";
      if (reducedMotion) { el.textContent = to + suffix; return; }
      var start = null;
      function step(t) {
        if (!start) start = t;
        var k = Math.min(1, (t - start) / 1400), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Sticky section sub-navigation: highlight the section in view */
  function subnav() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-sub]"));
    var nav = document.querySelector(".subnav");
    if (!links.length || !nav) return;
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    function update() {
      var y = window.scrollY + window.innerHeight * 0.35;
      var active = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) active = i; });
      links.forEach(function (a, i) {
        var on = i === active;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= parseFloat(getComputedStyle(nav).top) + 1);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* Lightbox: any [data-full] button; images in the same [data-lightbox-group] can be stepped through */
  function lightbox() {
    var box = document.getElementById("lightbox");
    if (!box) return;
    var img = document.getElementById("lb-img");
    var cap = document.getElementById("lb-cap");
    var items = [], name = "", idx = 0, lastFocus = null;

    function show(i) {
      idx = (i + items.length) % items.length;
      img.classList.remove("is-loaded");
      img.onload = function () { img.classList.add("is-loaded"); };
      img.src = items[idx].getAttribute("data-full");
      var alt = items[idx].querySelector("img");
      img.alt = alt ? alt.alt : name;
      cap.textContent = name + (items.length > 1 ? "  ·  " + (idx + 1) + " / " + items.length : "");
      if (img.complete) img.classList.add("is-loaded");
      box.classList.toggle("is-single", items.length < 2);
    }
    function open(btn) {
      var group = btn.closest("[data-lightbox-group]");
      items = group ? Array.prototype.slice.call(group.querySelectorAll("[data-full]")) : [btn];
      name = group ? group.getAttribute("data-lightbox-group") : "";
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.classList.add("lb-open");
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      show(items.indexOf(btn));
      box.querySelector(".lb-close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("lb-open");
      setTimeout(function () { box.hidden = true; }, reducedMotion ? 0 : 300);
      if (lastFocus) lastFocus.focus();
    }
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-full]");
      if (btn && !box.contains(btn)) { e.preventDefault(); open(btn); }
    });
    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "Tab") {
        var f = Array.prototype.filter.call(box.querySelectorAll("button"), function (b) { return b.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function boot() {
    reveal();
    counters();
    subnav();
    lightbox();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // Elementor: run reveal/count-ups again for widgets added or re-rendered in the editor
  window.addEventListener("elementor/frontend/init", function () {
    if (!window.elementorFrontend || !window.elementorFrontend.hooks) return;
    window.elementorFrontend.hooks.addAction("frontend/element_ready/global", function () { reveal(); counters(); });
  });
})();

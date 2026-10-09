/*
 * Shared helpers used by every template.
 * Load after /assets/data/developments.js.
 */
(function () {
  var data = window.HARDWICK;
  var script = document.currentScript;
  // Resolve /assets/ relative to this script so templates work at any depth
  // (and on a GitHub Pages project sub-path).
  var assetBase = script.src.replace(/js\/hardwick\.js(\?.*)?$/, "");

  var STATUS = {
    "available":   { label: "Available",   order: 0 },
    "reserved":    { label: "Reserved",    order: 1 },
    "coming-soon": { label: "Coming soon", order: 2 },
    "sold":        { label: "Sold",        order: 3 }
  };

  var H = {
    data: data,
    company: data.company,

    img: function (file) { return assetBase + "img/" + file; },

    all: function () { return data.developments.slice(); },
    current: function () {
      return data.developments.filter(function (d) { return d.stage === "current"; });
    },
    completed: function () {
      return data.developments
        .filter(function (d) { return d.stage === "completed"; })
        .sort(function (a, b) { return (b.completed || 0) - (a.completed || 0); });
    },
    get: function (slug) {
      return data.developments.filter(function (d) { return d.slug === slug; })[0];
    },
    param: function (name) {
      return new URLSearchParams(location.search).get(name);
    },
    // The development for the current page (?site=slug), falling back to the first current one.
    page: function () {
      return H.get(H.param("site")) || H.current()[0] || data.developments[0];
    },

    statusLabel: function (s) { return (STATUS[s] || { label: s }).label; },

    counts: function (dev) {
      var c = { available: 0, reserved: 0, sold: 0, "coming-soon": 0, total: dev.plots.length };
      dev.plots.forEach(function (p) { c[p.status] = (c[p.status] || 0) + 1; });
      return c;
    },

    // Lowest price among homes still for sale (available or coming soon).
    priceFrom: function (dev) {
      var prices = dev.plots
        .filter(function (p) { return p.status === "available" || p.status === "coming-soon"; })
        .map(function (p) { return p.price; });
      return prices.length ? Math.min.apply(null, prices) : null;
    },

    bedRange: function (dev) {
      if (!dev.plots.length) return "";
      var beds = dev.plots.map(function (p) { return p.beds; });
      var lo = Math.min.apply(null, beds), hi = Math.max.apply(null, beds);
      return lo === hi ? lo + " bed" : lo + " & " + hi + " bed";
    },

    price: function (n) {
      return n == null ? "" : "£" + n.toLocaleString("en-GB");
    },

    esc: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },

    // Render a list into a container: H.render("#el", items, fn)
    render: function (sel, items, fn) {
      var el = typeof sel === "string" ? document.querySelector(sel) : sel;
      if (el) el.innerHTML = items.map(fn).join("");
      return el;
    },

    // Fill [data-company="phone"] etc. with company details.
    fillCompany: function (root) {
      (root || document).querySelectorAll("[data-company]").forEach(function (el) {
        var key = el.getAttribute("data-company");
        var c = data.company;
        if (key === "address") el.innerHTML = c.address.map(H.esc).join("<br>");
        else if (key === "address-inline") el.textContent = c.address.join(", ");
        else if (key === "year") el.textContent = new Date().getFullYear();
        else if (c[key] != null) el.textContent = c[key];
        if (key === "phone" && el.tagName === "A") el.href = "tel:" + c.phone.replace(/\s/g, "");
        if (key === "mobile" && el.tagName === "A") el.href = "tel:" + c.mobile.replace(/\s/g, "");
        if (key === "email" && el.tagName === "A") el.href = "mailto:" + c.email;
      });
    },

    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

    /*
     * Scroll reveal: any element with [data-reveal] gets the class "is-in"
     * when it scrolls into view. Children of [data-stagger] get an
     * incremental --i custom property for staggered transitions.
     * Call again after rendering new content.
     */
    reveal: function () {
      document.querySelectorAll("[data-stagger]").forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
          child.style.setProperty("--i", i);
        });
      });
      var els = document.querySelectorAll("[data-reveal]:not(.is-in)");
      if (H.reducedMotion || !("IntersectionObserver" in window)) {
        els.forEach(function (el) { el.classList.add("is-in"); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    },

    // Count-up numbers: <span data-count="140" data-suffix="+">0</span>
    counters: function () {
      var els = document.querySelectorAll("[data-count]");
      function run(el) {
        var to = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "";
        if (H.reducedMotion) { el.textContent = to + suffix; return; }
        var start = null, dur = 1400;
        function step(t) {
          if (!start) start = t;
          var k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * eased) + suffix;
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      els.forEach(function (el) { io.observe(el); });
    },

    // Adds "is-scrolled" to the element once the page scrolls past `offset`.
    stickyHeader: function (sel, offset) {
      var el = document.querySelector(sel);
      if (!el) return;
      var on = function () { el.classList.toggle("is-scrolled", window.scrollY > (offset || 24)); };
      on();
      window.addEventListener("scroll", on, { passive: true });
    },

    // Simple mobile nav toggle: button[data-nav-toggle] toggles "nav-open" on <body>.
    navToggle: function () {
      document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var open = document.body.classList.toggle("nav-open");
          btn.setAttribute("aria-expanded", open);
        });
      });
      document.querySelectorAll("[data-nav] a").forEach(function (a) {
        a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
      });
    }
  };

  window.H = H;
})();

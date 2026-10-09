/* Hardwick Construction — Template 02 "Minimal" */
(function () {
  "use strict";
  var H = window.H;
  if (!H) return;
  var esc = H.esc;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var isDev = document.body.classList.contains("page-dev");

  /* ---------------- Home ---------------- */
  function renderHome() {
    var current = H.current();
    var completed = H.completed();

    var totalAvail = current.reduce(function (n, d) { return n + H.counts(d).available; }, 0);
    var fc = document.getElementById("fact-current");
    var fa = document.getElementById("fact-available");
    if (fc) fc.textContent = pad(current.length);
    if (fa) fa.textContent = pad(totalAvail);

    var list = document.getElementById("current-list");
    if (list) {
      var head =
        '<div class="devlist__cols" aria-hidden="true">' +
        "<span>No.</span><span>Development</span><span>Location</span><span>Bedrooms</span>" +
        "<span>From</span><span>Availability</span><span></span></div>";
      list.removeAttribute("data-stagger");
      list.innerHTML = head + '<div data-stagger class="devlist__rows" role="list">' + current.map(function (d, i) {
        var c = H.counts(d);
        var from = H.priceFrom(d);
        var avail = c.available
          ? c.available + " available"
          : (c["coming-soon"] ? "Coming soon" : (c.reserved ? "All reserved" : "Sold out"));
        var dotCls = c.available ? "available" : (c["coming-soon"] ? "coming-soon" : (c.reserved ? "reserved" : "sold"));
        return (
          '<div class="devrow" role="listitem" data-reveal>' +
          '<a class="devrow__link" href="development.html?site=' + encodeURIComponent(d.slug) + '" data-img="' + esc(H.img(d.hero)) + '">' +
          '<span class="devrow__img"><img src="' + esc(H.img(d.hero)) + '" alt="' + esc(d.name) + ', ' + esc(d.location) + '" loading="lazy"></span>' +
          '<span class="devrow__no">' + pad(i + 1) + "</span>" +
          '<span class="devrow__name">' + esc(d.name) + "</span>" +
          '<span class="devrow__cell is-loc"><small>Location</small>' + esc(d.location) + "</span>" +
          '<span class="devrow__cell"><small>Bedrooms</small>' + esc(H.bedRange(d)) + "</span>" +
          '<span class="devrow__cell devrow__price"><small>From</small>' + (from ? esc(H.price(from)) : "—") + "</span>" +
          '<span class="devrow__cell"><small>Availability</small><span class="devrow__avail"><span class="dot dot--' + dotCls + '" aria-hidden="true"></span>' +
          esc(avail) + (c.total ? ' <span style="color:var(--muted)">/ ' + c.total + "</span>" : "") + "</span></span>" +
          '<span class="devrow__go" aria-hidden="true">→</span>' +
          "</a></div>"
        );
      }).join("") + "</div>";
    }

    H.render("#completed-list", completed, function (d) {
      return (
        '<a class="done" data-reveal href="development.html?site=' + encodeURIComponent(d.slug) + '">' +
        '<figure class="done__img"><img src="' + esc(H.img(d.hero)) + '" alt="' + esc(d.name) + ', ' + esc(d.location) + '" loading="lazy"></figure>' +
        '<div class="done__row"><span class="done__name">' + esc(d.name) + '</span><span class="done__year">' + esc(d.completed || "") + "</span></div>" +
        '<p class="done__loc">' + esc(d.location) + "</p>" +
        '<p class="done__meta"><span class="dot dot--sold" aria-hidden="true"></span>All homes sold <span class="arrow" aria-hidden="true">→</span></p>' +
        "</a>"
      );
    });

    H.render("#stats", H.company.stats || [], function (s) {
      return (
        '<div class="stat" data-reveal><dt>' + esc(s.label) + '</dt><dd><span data-count="' + +s.value +
        '" data-suffix="' + esc(s.suffix || "") + '">0' + esc(s.suffix || "") + "</span></dd></div>"
      );
    });

    initPeek();
    initNavSpy();
  }

  /* Floating image that follows the cursor over the current list (desktop) */
  function initPeek() {
    var peek = document.querySelector(".peek");
    var list = document.getElementById("current-list");
    if (!peek || !list || H.reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 961px)").matches) return;
    var img = peek.querySelector("img");
    var x = 0, y = 0, tx = 0, ty = 0, raf = null, active = false;
    var w = function () { return peek.offsetWidth; }, h = function () { return peek.offsetHeight; };
    function loop() {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      peek.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (active || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    function target(e) {
      tx = Math.min(window.innerWidth - w() - 24, e.clientX + 32);
      ty = Math.max(24, Math.min(window.innerHeight - h() - 24, e.clientY - h() / 2));
    }
    list.querySelectorAll(".devrow__link").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) {
        var src = a.getAttribute("data-img");
        if (img.getAttribute("src") !== src) img.setAttribute("src", src);
        target(e);
        if (!active && !peek.classList.contains("is-on")) { x = tx; y = ty; }
        active = true;
        peek.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      a.addEventListener("mousemove", target);
    });
    list.addEventListener("mouseleave", function () {
      active = false;
      peek.classList.remove("is-on");
    });
    window.addEventListener("scroll", function () {
      if (active && !list.matches(":hover")) { active = false; peek.classList.remove("is-on"); }
    }, { passive: true });
  }

  /* Highlight the nav item for the section in view */
  function initNavSpy() {
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        } else if (a.getAttribute("aria-current")) {
          a.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------- Development page ---------------- */
  function renderDev() {
    var d = H.page();
    if (!d) return;
    var isCurrent = d.stage === "current";
    var c = H.counts(d);
    var from = H.priceFrom(d);
    var list = isCurrent ? H.current() : H.completed();
    var idx = list.indexOf(d);

    document.title = d.name + ", " + d.location + " — Hardwick Construction";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", d.summary);

    document.getElementById("dev-name").textContent = d.name;
    document.getElementById("dev-headline").textContent = d.headline;
    document.getElementById("dev-stage").innerHTML = isCurrent
      ? '<span class="label__no">' + pad(idx + 1) + "</span>Current development"
      : '<span class="label__no">' + esc(d.completed || "") + "</span>Completed development";
    var back = document.getElementById("dev-back");
    back.href = isCurrent ? "index.html#current" : "index.html#completed";
    document.getElementById("dev-back-text").textContent = isCurrent ? "Current developments" : "Completed developments";

    var hero = document.getElementById("dev-hero");
    hero.src = H.img(d.hero);
    hero.alt = d.name + " — " + d.headline;

    var facts = [["Location", esc(d.location)]];
    if (isCurrent) {
      facts.push(["From", from ? esc(H.price(from)) : "—"]);
      facts.push(["Bedrooms", esc(H.bedRange(d))]);
      facts.push(["Available", '<span class="dot dot--available" aria-hidden="true"></span>' + c.available + " of " + c.total + " homes"]);
    } else {
      facts.push(["Postcode", esc(d.postcode)]);
      facts.push(["Completed", esc(d.completed || "")]);
      facts.push(["Status", '<span class="dot dot--sold" aria-hidden="true"></span>All homes sold']);
    }
    document.getElementById("dev-facts").innerHTML = facts.map(function (f) {
      return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>";
    }).join("");

    document.getElementById("dev-description").innerHTML = d.description.map(function (p) {
      return "<p>" + esc(p) + "</p>";
    }).join("");
    H.render("#dev-features", d.features, function (f) { return "<li>" + esc(f) + "</li>"; });

    // Gallery: rows of two with alternating 5/7 and 7/5 widths; a lone last image spans full width.
    var g = d.gallery || [];
    H.render("#dev-gallery", g, function (file, i) {
      var cls;
      if (g.length % 2 === 1 && i === g.length - 1) cls = "g-f";
      else {
        var row = Math.floor(i / 2), first = i % 2 === 0;
        cls = (row % 2 === 0) === first ? "g-s" : "g-l";
      }
      return '<figure class="' + cls + ' wipe" data-reveal style="--i:' + (i % 2) + '"><img src="' + esc(H.img(file)) +
        '" alt="' + esc(d.name) + " — interior " + (i + 1) + '" loading="lazy"></figure>';
    });

    renderAvailability(d, c);

    document.getElementById("dev-location").textContent = d.location;
    document.getElementById("dev-postcode").textContent = d.postcode;
    document.getElementById("dev-map").href =
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.postcode + ", UK");

    var subject = "Enquiry — " + d.name;
    document.getElementById("dev-email").href =
      "mailto:" + H.company.email + "?subject=" + encodeURIComponent(subject);
    if (!isCurrent) document.getElementById("enquire-title").textContent = "Get in touch";
    document.getElementById("enquire-lead").textContent = isCurrent
      ? "Interested in a home at " + d.name + "? Speak to James Hardwick directly to arrange a viewing."
      : d.name + " is complete, but we would be glad to tell you about our current and upcoming developments.";

    // Next development
    var pool = H.current().concat(H.completed());
    var next = pool[(pool.indexOf(d) + 1) % pool.length];
    if (next && next !== d) {
      document.getElementById("dev-next").innerHTML =
        '<a class="next__link" href="development.html?site=' + encodeURIComponent(next.slug) + '">' +
        '<span class="label">Next development</span>' +
        '<span class="next__name">' + esc(next.name) + "</span>" +
        '<span class="next__go" aria-hidden="true">→</span>' +
        '<span class="next__loc">' + esc(next.location) + (next.stage === "completed" ? " · Completed " + esc(next.completed || "") : "") + "</span>" +
        "</a>";
    }
  }

  function renderAvailability(d, c) {
    var box = document.getElementById("dev-availability");
    var note = document.getElementById("avail-note");
    if (!d.plots.length) {
      document.getElementById("availability-title").textContent = "All homes sold";
      note.textContent = "This development is complete.";
      box.innerHTML =
        '<div class="soldout" data-reveal>' +
        '<p class="soldout__title"><span class="dot dot--sold" aria-hidden="true"></span>Completed ' + esc(d.completed || "") + " — all homes sold.</p>" +
        '<div class="soldout__body"><p>Every home at ' + esc(d.name) + " has now been sold and is occupied. Thank you to all of our buyers.</p>" +
        '<p><a class="link-arrow link-arrow--strong" href="index.html#current">See homes for sale now <span class="arrow" aria-hidden="true">→</span></a></p></div>' +
        "</div>";
      return;
    }
    note.textContent = "Prices and availability are updated regularly. Sold homes are shown for reference.";

    var order = ["available", "reserved", "coming-soon", "sold"];
    var summary = '<dl class="summary" data-stagger>' + order.map(function (s) {
      return '<div data-reveal><dt><span class="dot dot--' + s + '" aria-hidden="true"></span>' + H.statusLabel(s) +
        "</dt><dd>" + pad(c[s] || 0) + (s === "available" ? "<small>of " + c.total + "</small>" : "") + "</dd></div>";
    }).join("") + "</dl>";

    var filters = [["all", "All", c.total], ["available", "Available", c.available], ["reserved", "Reserved", c.reserved],
      ["coming-soon", "Coming soon", c["coming-soon"]], ["sold", "Sold", c.sold]];
    var chips = '<div class="toolbar" data-reveal><div class="chips" role="group" aria-label="Filter homes by status">' +
      filters.map(function (f, i) {
        return '<button type="button" class="chip" data-filter="' + f[0] + '" aria-pressed="' + (i === 0) + '">' +
          (f[0] !== "all" ? '<span class="dot dot--' + f[0] + '" aria-hidden="true"></span>' : "") +
          f[1] + ' <span class="chip__n">' + (f[2] || 0) + "</span></button>";
      }).join("") + '</div><p class="toolbar__count" id="plot-count" aria-live="polite">Showing all ' + c.total + " homes</p></div>";

    var rows = d.plots.map(function (p) {
      var sold = p.status === "sold";
      var price = sold ? '<s aria-label="Sold">' + esc(H.price(p.price)) + "</s>" : esc(H.price(p.price));
      return '<tr class="' + (sold ? "is-sold" : "") + '" data-status="' + esc(p.status) + '">' +
        '<td class="c-plot">' + pad(p.plot) + "</td>" +
        '<td class="c-type">' + esc(p.type) + "</td>" +
        '<td class="c-beds">' + p.beds + '<span class="m-only"> bed</span></td>' +
        '<td class="c-sqft">' + p.sqft.toLocaleString("en-GB") + '<span class="m-only"> sq ft</span></td>' +
        '<td class="c-price">' + price + "</td>" +
        '<td class="c-status"><span class="status"><span class="dot dot--' + esc(p.status) + '" aria-hidden="true"></span>' +
        esc(H.statusLabel(p.status)) + "</span></td></tr>";
    }).join("");

    box.innerHTML = summary + chips +
      '<table class="plots" data-reveal><caption class="sr-only">Plots at ' + esc(d.name) + "</caption>" +
      '<thead><tr><th class="c-plot" scope="col">Plot</th><th class="c-type" scope="col">House type</th><th class="c-beds" scope="col">Bedrooms</th>' +
      '<th class="c-sqft" scope="col">Sq ft</th><th class="c-price" scope="col">Price</th><th class="c-status" scope="col">Status</th></tr></thead>' +
      "<tbody>" + rows + '<tr class="empty" hidden><td colspan="6">No homes match this filter.</td></tr></tbody></table>';

    initFilter(c);
  }

  function initFilter(c) {
    var chips = document.querySelectorAll(".chip");
    var rows = Array.prototype.slice.call(document.querySelectorAll(".plots tbody tr[data-status]"));
    var empty = document.querySelector(".plots .empty");
    var count = document.getElementById("plot-count");
    var timer = null;
    var FADE = H.reducedMotion ? 0 : 280;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (b) { b.setAttribute("aria-pressed", String(b === chip)); });
        var show = rows.filter(function (r) { return f === "all" || r.getAttribute("data-status") === f; });

        // 1. fade out everything currently visible
        rows.forEach(function (r) { if (!r.hidden) r.classList.add("is-faded"); });
        clearTimeout(timer);
        timer = setTimeout(function () {
          // 2. swap the set, then fade the new rows in
          rows.forEach(function (r) { r.hidden = show.indexOf(r) === -1; r.classList.add("is-faded"); });
          empty.hidden = show.length > 0;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              show.forEach(function (r) { r.classList.remove("is-faded"); });
            });
          });
        }, FADE);

        var label = f === "all" ? "Showing all " + c.total + " homes"
          : "Showing " + show.length + " " + H.statusLabel(f).toLowerCase() + (show.length === 1 ? " home" : " homes");
        count.textContent = label;
      });
    });
  }

  /* ---------------- Init ---------------- */
  if (isDev) renderDev(); else renderHome();
  H.fillCompany();
  // Allow the long email address to break neatly after the "@" on narrow screens
  document.querySelectorAll(".contact__email").forEach(function (a) {
    var parts = H.company.email.split("@");
    a.innerHTML = esc(parts[0]) + "@<wbr>" + esc(parts[1]) + ' <span class="arrow" aria-hidden="true">→</span>';
  });
  H.stickyHeader(".header", 8);
  H.navToggle();
  H.reveal();
  H.counters();

  // Trigger load animations once the first frame has painted
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
  });
})();

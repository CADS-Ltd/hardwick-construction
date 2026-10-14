/* Premier Property (Central) — Template 01 "Heritage" */
(function () {
  var H = window.H;
  if (!H) return;
  var C = H.company;
  var esc = H.esc;

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5"/></svg>';
  var DOWNLOAD = '<svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>';

  function devUrl(d) { return "development.html?site=" + encodeURIComponent(d.slug); }
  function mailto(subject) {
    return "mailto:" + C.email + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  /* ---------- Shared ---------- */
  function shared() {
    H.fillCompany();
    H.navToggle();
    H.stickyHeader(".site-header", 40);
    document.querySelectorAll("[data-mailto]").forEach(function (a) {
      a.href = mailto("Enquiry from the Premier Property website");
    });
    // Close the mobile menu with Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        var t = document.querySelector("[data-nav-toggle]");
        if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
      }
    });
  }

  /* ---------- Home ---------- */
  function home() {
    var current = H.current();
    var completed = H.completed();

    // Hero "Now selling" strip
    H.render("#hero-selling", current, function (d) {
      return '<li><a class="draw" href="' + devUrl(d) + '">' + esc(d.name) +
        '<span> · ' + esc(d.location.split(",")[0]) + "</span></a></li>";
    });

    // Stats
    H.render("#stats", C.stats, function (s) {
      return '<li data-reveal><span class="stat-num"><span data-count="' + s.value +
        '" data-suffix="' + esc(s.suffix || "") + '">0' + esc(s.suffix || "") + "</span></span>" +
        '<span class="stat-label">' + esc(s.label) + "</span></li>";
    });

    // Current developments — alternating rows
    H.render("#current-list", current, function (d, i) {
      var c = H.counts(d);
      var from = H.priceFrom(d);
      var num = (i + 1 < 10 ? "0" : "") + (i + 1);
      return (
        '<article class="dev-row' + (i % 2 ? " is-flipped" : "") + '">' +
          '<a class="dev-row-media frame" href="' + devUrl(d) + '" tabindex="-1" aria-hidden="true">' +
            '<span class="frame-clip"><img src="' + H.img(d.hero) + '" alt="" loading="lazy"></span>' +
          "</a>" +
          '<div class="dev-row-body" data-reveal>' +
            '<p class="dev-row-index"><span>' + num + "</span>" + esc(d.location) + "</p>" +
            '<h3 class="dev-row-title"><a href="' + devUrl(d) + '">' + esc(d.name) + "</a></h3>" +
            '<p class="dev-row-headline">' + esc(d.headline) + "</p>" +
            '<p class="dev-row-summary">' + esc(d.summary) + "</p>" +
            '<dl class="meta">' +
              "<div><dt>Homes</dt><dd>" + esc(H.bedRange(d)) + "</dd></div>" +
              "<div><dt>Prices from</dt><dd>" + (from ? esc(H.price(from)) : "Enquire") + "</dd></div>" +
              '<div><dt>Availability</dt><dd><span class="dot" aria-hidden="true"></span>' +
                esc(c.available ? c.available + " available" : "Register interest") + "</dd></div>" +
            "</dl>" +
            '<p class="dev-row-links">' +
              '<a class="link-arrow draw" href="' + devUrl(d) + '">View development' +
                '<span class="sr-only"> — ' + esc(d.name) + "</span> " + ARROW + "</a>" +
              (d.sitePlan ? '<a class="link-arrow draw" href="' + plotsUrl(d) + '">View plots' +
                '<span class="sr-only"> — ' + esc(d.name) + "</span> " + ARROW + "</a>" : "") +
            "</p>" +
          "</div>" +
        "</article>"
      );
    });

    // Completed developments grid
    H.render("#completed-list", completed, completedCard);

    revealMedia();
    H.reveal();
    H.counters();
  }

  function completedCard(d) {
    var tag = d.stage === "completed" ? "Completed " + (d.completed || "") : "Now selling";
    return (
      '<a class="done-card" href="' + devUrl(d) + '" data-reveal>' +
        '<span class="done-media"><img src="' + H.img(d.hero) + '" alt="' +
          esc(d.name + ", " + d.location) + '" loading="lazy"></span>' +
        '<span class="done-meta">' + esc(tag) + "</span>" +
        '<span class="done-name">' + esc(d.name) + "</span>" +
        '<span class="done-loc">' + esc(d.location) + "</span>" +
      "</a>"
    );
  }

  // Images in dev rows fade in with their row
  function revealMedia() {
    document.querySelectorAll(".dev-row-media").forEach(function (el) {
      el.setAttribute("data-reveal", "");
    });
  }

  /* ---------- Development ---------- */
  function development() {
    var d = H.page();
    if (!d) return;
    var isDone = d.stage === "completed" || !d.plots.length;
    var c = H.counts(d);
    var from = H.priceFrom(d);

    document.title = d.name + ", " + d.location + " — Premier Property (Central)";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", d.summary);

    // Hero
    var heroImg = document.getElementById("dev-hero-img");
    heroImg.src = H.img(d.hero);
    setText("dev-location", d.location);
    setText("dev-name", d.name);
    setText("dev-headline", d.headline);
    setText("subnav-name", d.name);
    var chip = document.getElementById("dev-chip");
    if (isDone) {
      chip.innerHTML = '<span class="chip-dot is-done" aria-hidden="true"></span>Completed ' +
        esc(d.completed || "") + " · All homes sold";
    } else {
      chip.innerHTML = '<span class="chip-dot" aria-hidden="true"></span>Now selling · ' +
        esc(c.available ? plural(c.available, "home", "homes") + " available" : "Register your interest") +
        (from ? " · From " + esc(H.price(from)) : "");
    }
    var back = document.getElementById("back-link");
    if (isDone) back.href = "index.html#completed";

    // Overview
    H.render("#dev-description", d.description, function (p) { return "<p>" + esc(p) + "</p>"; });
    H.render("#dev-features", d.features, function (f) {
      return '<li data-reveal>' + esc(f) + "</li>";
    });

    var facts = [];
    facts.push(["Location", d.location]);
    if (isDone) {
      facts.push(["Status", "Completed " + (d.completed || "")]);
      facts.push(["Availability", "All homes sold"]);
    } else {
      facts.push(["Homes", plural(c.total, "home", "homes") + " · " + H.bedRange(d)]);
      facts.push(["Prices from", from ? H.price(from) : "Enquire"]);
      facts.push(["Available now", String(c.available)]);
    }
    facts.push(["Postcode", d.postcode]);
    H.render("#dev-facts", facts, function (f) {
      return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
    });

    // Homes / availability
    var intro = document.getElementById("homes-intro");
    var body = document.getElementById("homes-body");
    if (isDone) {
      intro.textContent = "This development has been completed and every home is now sold.";
      var eb = document.querySelector("#homes .eyebrow");
      if (eb) eb.textContent = "The homes";
      var fb = document.querySelector(".facts .btn");
      if (fb) fb.textContent = "Ask about new homes";
      setText("enquire-title-pre", "Looking for a home like ");
      setText("enq-lead", "Every home here is now sold, but new Premier Property developments are always in the pipeline. Call or email to hear about them first.");
      setText("loc-note", "All homes are now privately owned — please respect residents' privacy.");
      body.innerHTML =
        '<div class="sold-out" data-reveal>' +
          '<span class="sold-out-rule" aria-hidden="true"></span>' +
          '<p class="eyebrow">' + esc(d.name) + "</p>" +
          '<p class="sold-out-title">Completed ' + esc(d.completed || "") + " — all homes sold</p>" +
          "<p>Thank you to everyone who chose a home at " + esc(d.name) +
            ". Take a look at our current developments to find homes available now.</p>" +
          '<a class="btn btn-navy" href="index.html#current">View current developments</a>' +
        "</div>";
    } else {
      intro.textContent = "Every plot at " + d.name + ", updated as homes are reserved and sold. " +
        "Contact us to arrange a viewing or reserve a home.";
      body.innerHTML = (d.sitePlan ? planCta(d) : "") + availabilityHtml(d);
    }

    // Gallery
    var images = [d.hero].concat(d.gallery || []);
    H.render("#dev-gallery", images, function (f, i) {
      return '<button type="button" class="g-item' + (i === 0 ? " g-lead" : "") + '" data-reveal data-index="' + i + '">' +
        '<img src="' + H.img(f) + '" alt="' + esc(d.name + " — image " + (i + 1) + " of " + images.length) + '" loading="lazy">' +
        '<span class="g-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>' +
      "</button>";
    });
    document.getElementById("dev-gallery").setAttribute("data-images", images.length);
    lightbox(images, d.name);

    // Location
    setText("loc-name", d.name);
    setText("loc-place", d.name + ", " + d.location);
    setText("loc-postcode", d.postcode);
    setText("loc-text", d.name + " is located in " + d.location +
      ". Use the postcode " + d.postcode + " for satellite navigation.");
    document.getElementById("loc-map").href =
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(H.mapQuery(d));

    // Enquire
    setText("enq-name", d.name);
    document.getElementById("enq-mail").href = mailto("Enquiry: " + d.name);

    // Others
    var others = H.current().concat(H.completed()).filter(function (o) { return o.slug !== d.slug; }).slice(0, 3);
    H.render("#others-list", others, completedCard);

    subnav();
    H.reveal();
    H.counters();
  }

  /* Availability summary + plot table, shared by the development and plots pages */
  function availabilityHtml(d, opts) {
    var c = H.counts(d);
    var summary = [
      ["available", "Available"],
      ["reserved", "Reserved"],
      ["coming-soon", "Coming soon"],
      ["sold", "Sold"]
    ];
    var sumHtml = '<ul class="avail-summary" data-stagger>' + summary.map(function (s) {
      return '<li class="is-' + s[0] + '" data-reveal><span class="avail-num" data-count="' +
        (c[s[0]] || 0) + '">' + (c[s[0]] || 0) + '</span><span class="avail-label">' + s[1] + "</span></li>";
    }).join("") + "</ul>";

    var rows = d.plots.map(function (p) {
      var sold = p.status === "sold";
      var price = sold
        ? '<s aria-hidden="true">' + esc(H.price(p.price)) + '</s><span class="sr-only">Sold</span>'
        : esc(H.price(p.price));
      return (
        '<tr class="plot is-' + p.status + (opts && opts.selected === p.plot ? " is-selected" : "") + '" data-plot="' + esc(p.plot) + '">' +
          '<td data-label="Plot"><span class="plot-no">' + esc(p.plot) + "</span></td>" +
          '<td data-label="House type" class="plot-type">' + (d.houseTypes && p.houseType && d.houseTypes[p.houseType]
            ? '<a class="draw" href="' + typeUrl(d, p.houseType) + '">' + esc(p.type) + "</a>"
            : esc(p.type)) + "</td>" +
          '<td data-label="Bedrooms">' + esc(p.beds) + "</td>" +
          '<td data-label="Sq ft">' + esc(H.sqft(p.sqft)) + "</td>" +
          '<td data-label="Price" class="plot-price">' + price + "</td>" +
          '<td data-label="Status"><span class="badge badge-' + p.status + '">' +
            esc(H.statusLabel(p.status)) + "</span></td>" +
        "</tr>"
      );
    }).join("");

    return sumHtml +
      '<div class="table-wrap" data-reveal>' +
        '<table class="plots">' +
          '<caption class="sr-only">Plots and availability at ' + esc(d.name) + "</caption>" +
          "<thead><tr>" +
            '<th scope="col">Plot</th><th scope="col">House type</th><th scope="col">Bedrooms</th>' +
            '<th scope="col">Sq ft</th><th scope="col">Price</th><th scope="col">Status</th>' +
          "</tr></thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
      "</div>" +
      '<p class="table-note">Prices and availability are correct at the time of publishing and may change. ' +
        'Please <a class="draw" href="#enquire">contact us</a> for the latest information.</p>';
  }

  /* Banner linking a development page to its interactive plots page */
  function planCta(d) {
    return (
      '<a class="plan-cta" href="' + plotsUrl(d) + '" data-reveal>' +
        '<span class="plan-cta-media"><img src="' + H.img(d.sitePlan.image) + '" alt="" loading="lazy"></span>' +
        '<span class="plan-cta-body">' +
          '<span class="eyebrow">Interactive site plan</span>' +
          '<span class="plan-cta-title">Explore every plot at ' + esc(d.name) + "</span>" +
          '<span class="plan-cta-text">Hover over each home to see its house type, room sizes and availability.</span>' +
          '<span class="link-arrow">View the plots ' + ARROW + "</span>" +
        "</span>" +
      "</a>"
    );
  }

  function plotsUrl(d) { return "plots.html?site=" + encodeURIComponent(d.slug); }
  function typeUrl(d, k, plot) {
    return "house-type.html?site=" + encodeURIComponent(d.slug) + "&type=" + encodeURIComponent(k) +
      (plot != null ? "&plot=" + encodeURIComponent(plot) : "");
  }

  /* ---------- Plots (interactive site plan) ---------- */
  function plots() {
    var withPlan = H.all().filter(function (x) { return x.sitePlan && x.houseTypes; });
    var d = H.get(H.param("site"));
    if (!d || !d.sitePlan) d = withPlan[0];
    if (!d) return;

    var plan = d.sitePlan;
    var types = d.houseTypes;
    var typeKeys = Object.keys(types);
    var byPlot = {};
    d.plots.forEach(function (p) { byPlot[p.plot] = p; });
    var c = H.counts(d);
    var from = H.priceFrom(d);

    document.title = "Plots at " + d.name + ", " + d.location + " — Premier Property (Central)";

    // Hero
    document.getElementById("plots-hero-img").src = H.img(plan.image);
    setText("plots-location", d.name + " · " + d.location);
    setText("plots-lede", "Every home at " + d.name + ", plot by plot. Choose a home on the plan to see its house type, floor plan and availability.");
    document.getElementById("plots-chip").innerHTML =
      '<span class="chip-dot" aria-hidden="true"></span>' +
      esc(plural(c.total, "home", "homes")) + " · " + esc(plural(typeKeys.length, "house type", "house types")) +
      " · " + esc(c.available ? c.available + " available now" : "Register your interest") +
      (from ? " · From " + esc(H.price(from)) : "");
    var back = document.getElementById("plots-back");
    back.href = devUrl(d);
    setText("plots-back-text", d.name);
    document.getElementById("enq-mail").href = mailto("Plot enquiry: " + d.name);

    // Plan image + hotspots
    var img = document.getElementById("plan-img");
    img.src = H.img(plan.image);
    img.alt = "Site plan of " + d.name + " showing " + d.plots.length + " plots";
    var canvas = document.getElementById("plan-canvas");
    canvas.style.aspectRatio = plan.width + " / " + plan.height;
    var svg = document.getElementById("plan-svg");
    svg.setAttribute("viewBox", "0 0 " + plan.width + " " + plan.height);
    svg.innerHTML = plan.hotspots.map(function (h) {
      var p = byPlot[h.plot];
      if (!p) return "";
      var t = types[p.houseType] || {};
      var label = "Plot " + p.plot + ", " + (t.name || p.type) + ", " + (t.style || p.beds + " bedroom home") +
        ", " + H.statusLabel(p.status) + (p.status !== "sold" && p.price ? ", " + H.price(p.price) : "");
      return '<g class="hs is-' + p.status + '" data-plot="' + esc(p.plot) + '" data-type="' + esc(p.houseType) +
        '" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
        '<polygon points="' + esc(h.points) + '"/></g>';
    }).join("");
    var hotspots = Array.prototype.slice.call(svg.querySelectorAll(".hs"));

    // Type filter
    H.render("#type-filter", [""].concat(typeKeys), function (k) {
      return '<button type="button" class="type-btn" data-type="' + esc(k) + '" aria-pressed="false">' +
        (k ? esc(types[k].name) : "All types") + "</button>";
    });
    var typeBtns = Array.prototype.slice.call(document.querySelectorAll(".type-btn"));

    // House type cards
    setText("types-intro", "There are " + typeKeys.length + " house types at " + d.name +
      ". Room sizes are approximate and taken from the architect's drawings.");
    H.render("#type-grid", typeKeys, typeCard);

    // Full availability table
    setText("homes-intro", "Every plot at " + d.name + ", updated as homes are reserved and sold.");
    document.getElementById("homes-body").innerHTML = availabilityHtml(d);

    /* --- Interaction state --- */
    var panel = document.getElementById("plan-panel");
    var tip = document.getElementById("plan-tip");
    var pinned = null;   // { type, plot } chosen by hover / tap / filter
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var shown = null;    // key of what the panel currently shows

    function plotsOfType(k) {
      return d.plots.filter(function (p) { return p.houseType === k; });
    }

    function paint(state) {
      var k = state && state.type;
      canvas.classList.toggle("has-focus", !!k);
      hotspots.forEach(function (g) {
        g.classList.toggle("is-type", !!k && g.getAttribute("data-type") === k);
        g.classList.toggle("is-active", !!state && state.plot != null && +g.getAttribute("data-plot") === state.plot);
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
      void panel.offsetWidth; // restart the fade
      panel.classList.add("is-swap");
      bindPanel();
    }

    function bindPanel() {
      panel.querySelectorAll("[data-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          var p = byPlot[+b.getAttribute("data-pick")];
          pin({ type: p.houseType, plot: p.plot });
        });
      });
      panel.querySelectorAll("[data-pick-type]").forEach(function (b) {
        b.addEventListener("click", function () { pin({ type: b.getAttribute("data-pick-type"), plot: null }); });
      });
      var clear = panel.querySelector("[data-clear]");
      if (clear) clear.addEventListener("click", function () { pin(null); });
    }

    function pin(state) {
      pinned = state;
      paint(state);
    }

    function stateFor(g) {
      return { type: g.getAttribute("data-type"), plot: +g.getAttribute("data-plot") };
    }

    hotspots.forEach(function (g) {
      // Hovering (or focusing) a home selects it, and the panel keeps showing it
      // after the pointer leaves the plan so it can be read and scrolled.
      g.addEventListener("mouseenter", function () { pin(stateFor(g)); showTip(g); });
      g.addEventListener("mouseleave", function () { hideTip(); });
      g.addEventListener("focus", function () { pin(stateFor(g)); });
      // Note whether this home was already selected before the tap focuses it.
      var wasSelected = false;
      g.addEventListener("pointerdown", function () {
        wasSelected = !!pinned && pinned.plot === +g.getAttribute("data-plot");
      });
      g.addEventListener("click", function () {
        var s = stateFor(g);
        // With a mouse, hovering shows the details and a click opens the house type page.
        // On touch screens the first tap shows the details and a second tap opens the page.
        var open = canHover || wasSelected;
        wasSelected = false;
        if (open) {
          location.href = typeUrl(d, s.type, s.plot);
          return;
        }
        pin(s);
        if (window.matchMedia("(max-width: 960px)").matches) {
          var r = panel.getBoundingClientRect();
          if (r.top > window.innerHeight * 0.85 || r.top < 0) {
            panel.scrollIntoView({ behavior: H.reducedMotion ? "auto" : "smooth", block: "start" });
          }
        }
      });
      g.addEventListener("keydown", function (e) {
        // Focus already shows the details, so Enter opens the house type page
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); wasSelected = true; g.dispatchEvent(new MouseEvent("click")); }
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

    // "Show on plan" buttons in the house type cards
    document.querySelectorAll("[data-show-type]").forEach(function (b) {
      b.addEventListener("click", function () {
        pin({ type: b.getAttribute("data-show-type"), plot: null });
        document.getElementById("plan").scrollIntoView({ behavior: H.reducedMotion ? "auto" : "smooth" });
      });
    });

    // Cursor tooltip (pointer devices only)
    function showTip(g) {
      var p = byPlot[+g.getAttribute("data-plot")];
      var t = types[p.houseType] || {};
      tip.innerHTML = "<strong>Plot " + esc(p.plot) + "</strong><span>" + esc(t.name || p.type) +
        ' · <em class="tip-' + p.status + '">' + esc(H.statusLabel(p.status)) + "</em></span>" +
        '<small>Click for full details</small>';
      tip.classList.add("is-on");
    }
    function hideTip() { tip.classList.remove("is-on"); }
    function moveTip(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var flip = x > r.width - 180;
      tip.style.transform = "translate(" + (flip ? x - 16 : x + 16) + "px," + (y + 16) + "px)" + (flip ? " translateX(-100%)" : "");
    }

    /* --- Panel templates --- */
    function overviewPanel() {
      return (
        '<div class="panel-intro">' +
          '<p class="eyebrow">' + esc(d.name) + "</p>" +
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
          }).join("") + "</ul>" +
        "</div>"
      );
    }

    function typePanel(k, plotNo) {
      var t = types[k];
      var list = plotsOfType(k);
      var avail = list.filter(function (p) { return p.status === "available"; });
      var others = list.filter(function (p) { return p.status !== "available"; });
      var p = plotNo != null ? byPlot[plotNo] : null;
      var area = t.sqm ? "Approx. " + t.sqm + " m² · " + H.sqft(t.sqft) + " sq ft" : "Floor area to be confirmed";

      var media = t.image
        ? '<div class="panel-media"><img src="' + H.img(t.image) + '" alt="' + esc(t.name + " — computer generated image") + '"></div>'
        : '<div class="panel-media is-empty"><span>' + esc(t.name) + "</span><small>Images to follow</small></div>";

      var plotStrip = p
        ? '<div class="panel-plot is-' + p.status + '">' +
            '<span class="pp-no">Plot ' + esc(p.plot) + "</span>" +
            '<span class="badge badge-' + p.status + '">' + esc(H.statusLabel(p.status)) + "</span>" +
            '<span class="pp-price">' + (p.status === "sold" ? "Sold" : esc(H.price(p.price))) + "</span>" +
          "</div>"
        : "";

      function rooms(title, rows) {
        if (!rows || !rows.length) return "";
        return '<div class="panel-rooms"><p class="pr-title">' + esc(title) + "</p><dl>" +
          rows.map(function (r) {
            return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>";
          }).join("") + "</dl></div>";
      }

      var availList = avail.length
        ? '<ul class="panel-avail">' + avail.map(function (q) {
            return '<li><button type="button" data-pick="' + esc(q.plot) + '"' + (p && p.plot === q.plot ? ' aria-current="true"' : "") + ">" +
              '<span class="pa-no">Plot ' + esc(q.plot) + "</span>" +
              '<span class="pa-price">' + esc(H.price(q.price)) + "</span>" +
              ARROW + "</button></li>";
          }).join("") + "</ul>"
        : '<p class="panel-none">No ' + esc(t.name) + " homes are available right now. Please get in touch to register your interest.</p>";

      var otherText = others.length
        ? '<p class="panel-others">' + others.map(function (q) {
            return "Plot " + esc(q.plot) + " — " + esc(H.statusLabel(q.status).toLowerCase());
          }).join(" · ") + "</p>"
        : "";

      return (
        media +
        '<div class="panel-body">' +
          '<div class="panel-head">' +
            '<p class="eyebrow">House type</p>' +
            '<button type="button" class="panel-clear" data-clear aria-label="Clear selection">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
          "</div>" +
          '<p class="panel-title">' + esc(t.name) + "</p>" +
          '<p class="panel-style">' + esc(t.style) + "</p>" +
          '<p class="panel-area">' + esc(area) + "</p>" +
          plotStrip +
          '<p class="pr-title pr-avail">Available ' + esc(t.name) + " homes</p>" +
          availList + otherText +
          '<div class="panel-floors">' + rooms("Ground floor", t.ground) + rooms("First floor", t.first) + "</div>" +
          '<p class="panel-text">' + esc(t.summary) + "</p>" +
          '<a class="btn btn-gold btn-sm btn-block" href="' + typeUrl(d, k, p ? p.plot : null) + '">Full details &amp; floor plans</a>' +
          '<a class="btn btn-navy btn-sm btn-block" href="' +
            mailto("Enquiry: " + t.name + (p ? ", plot " + p.plot : "") + " at " + d.name) + '">Enquire about ' +
            esc(p ? "plot " + p.plot : t.name) + "</a>" +
        "</div>"
      );
    }

    function typeCard(k) {
      var t = types[k];
      var list = plotsOfType(k);
      var media = t.image
        ? '<img src="' + H.img(t.image) + '" alt="' + esc(t.name + " — computer generated image") + '" loading="lazy">'
        : '<span class="type-card-empty"><span>' + esc(t.name) + "</span><small>Images to follow</small></span>";
      return (
        '<article class="type-card" data-reveal>' +
          '<a class="type-card-media" href="' + typeUrl(d, k) + '" tabindex="-1" aria-hidden="true">' + media + "</a>" +
          '<div class="type-card-body">' +
            '<p class="type-card-name"><a href="' + typeUrl(d, k) + '">' + esc(t.name) + "</a></p>" +
            '<p class="type-card-style">' + esc(t.style) + "</p>" +
            '<p class="type-card-area">' + esc(t.sqm ? "Approx. " + t.sqm + " m² · " + H.sqft(t.sqft) + " sq ft" : "Floor area to be confirmed") + "</p>" +
            (t.highlights && t.highlights.length
              ? '<ul class="type-card-list">' + t.highlights.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
              : '<p class="type-card-text">' + esc(t.summary) + "</p>") +
            '<ul class="type-card-plots" aria-label="Plots">' + list.map(function (p) {
              return '<li class="is-' + p.status + '" title="' + esc(H.statusLabel(p.status)) + '">' +
                '<span class="tcp-dot" aria-hidden="true"></span>Plot ' + esc(p.plot) +
                '<span class="sr-only"> — ' + esc(H.statusLabel(p.status)) + "</span></li>";
            }).join("") + "</ul>" +
            '<p class="type-card-links">' +
              '<a class="link-arrow draw" href="' + typeUrl(d, k) + '">View details ' + ARROW + "</a>" +
              '<button type="button" class="link-arrow draw" data-show-type="' + esc(k) + '">Show on plan</button>' +
            "</p>" +
          "</div>" +
        "</article>"
      );
    }

    // Start on the house type in the URL (?type=C), else the overview
    var startType = (H.param("type") || "").toUpperCase();
    pin(types[startType] ? { type: startType, plot: null } : null);

    H.reveal();
    H.counters();
  }

  /* ---------- House type page ---------- */
  function houseType() {
    var withTypes = H.all().filter(function (x) { return x.houseTypes; });
    var d = H.get(H.param("site"));
    if (!d || !d.houseTypes) d = withTypes[0];
    if (!d) return;
    var types = d.houseTypes;
    var keys = Object.keys(types);
    var k = (H.param("type") || "").toUpperCase();
    if (!types[k]) k = keys[0];
    var t = types[k];
    var list = d.plots.filter(function (p) { return p.houseType === k; });
    var sub = { slug: d.slug, name: d.name, houseTypes: d.houseTypes, plots: list };
    var c = H.counts(sub);
    var from = H.priceFrom(sub);
    var selNo = +H.param("plot");
    var sel = list.filter(function (p) { return p.plot === selNo; })[0] || null;
    var area = t.sqm ? "Approx. " + t.sqm + " m² · " + H.sqft(t.sqft) + " sq ft" : "To be confirmed";

    document.title = t.name + " at " + d.name + ", " + d.location + " — " + C.name;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t.name + ": " + t.style + " at " + d.name + ". " + t.summary);

    // Hero
    document.getElementById("type-hero-img").src = H.img(t.image || (d.sitePlan ? d.sitePlan.image : d.hero));
    setText("type-eyebrow", d.name + " · " + d.location);
    setText("type-name", t.name);
    setText("type-style", t.style);
    setText("subnav-name", t.name);
    document.getElementById("type-chip").innerHTML = '<span class="chip-dot" aria-hidden="true"></span>' +
      esc(t.beds + " bedrooms") + (t.sqm ? " · " + esc(area) : "") + " · " +
      esc(c.available ? c.available + " available now" : "Register your interest") +
      (from ? " · From " + esc(H.price(from)) : "");
    document.getElementById("type-back").href = plotsUrl(d) + "&type=" + encodeURIComponent(k);
    var navPlots = document.getElementById("nav-plots");
    if (navPlots) navPlots.href = plotsUrl(d);

    // Overview
    setText("overview-title", "About the " + t.name);
    H.render("#type-summary", [t.summary], function (p) { return "<p>" + esc(p) + "</p>"; });
    if (t.highlights && t.highlights.length) {
      H.render("#type-highlights", t.highlights, function (f) { return "<li data-reveal>" + esc(f) + "</li>"; });
    } else {
      document.getElementById("type-highlights-title").hidden = true;
    }
    if (sel) {
      document.getElementById("type-selected").innerHTML =
        '<div class="panel-plot is-' + sel.status + '">' +
          '<span class="pp-no">Plot ' + esc(sel.plot) + "</span>" +
          '<span class="badge badge-' + sel.status + '">' + esc(H.statusLabel(sel.status)) + "</span>" +
          '<span class="pp-price">' + (sel.status === "sold" ? "Sold" : esc(H.price(sel.price))) + "</span>" +
        "</div>";
    }
    var facts = [
      ["Development", d.name],
      ["Bedrooms", String(t.beds)],
      ["Floor area", area],
      ["Plots", list.length ? list.map(function (p) { return p.plot; }).join(", ") : "—"],
      ["Available now", String(c.available)],
      ["Prices from", from ? H.price(from) : "Enquire"]
    ];
    H.render("#type-facts", facts, function (f) {
      return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>";
    });
    document.getElementById("type-actions").innerHTML =
      (t.pdf ? '<a class="btn btn-gold btn-block" href="' + H.doc(t.pdf) + '" download>' + DOWNLOAD + "Download floor plans (PDF)</a>" : "") +
      '<a class="btn btn-navy btn-block" href="#enquire">' + (sel ? "Enquire about plot " + esc(sel.plot) : "Book a viewing") + "</a>";

    // Floor plans
    var images = [];

    // Full picture of the house under the hero, so the whole home is visible
    if (t.image) {
      var shot = document.getElementById("showcase-btn");
      shot.setAttribute("data-index", images.push(t.image) - 1);
      var simg = document.getElementById("showcase-img");
      simg.addEventListener("load", function () {
        var frame = simg.closest(".showcase-frame");
        if (simg.naturalHeight) frame.style.setProperty("--ar", (simg.naturalWidth / simg.naturalHeight).toFixed(4));
      });
      simg.src = H.img(t.image);
      simg.alt = t.name + " at " + d.name + " — computer generated image of the front of the house";
      setText("showcase-name", t.name + " · " + t.style);
      document.getElementById("type-showcase").hidden = false;
    }

    function planFigure(file, label, rows) {
      var i = images.push(file) - 1;
      return (
        '<figure class="plan-sheet" data-reveal>' +
          '<button type="button" class="g-item plan-shot" data-index="' + i + '">' +
            '<img src="' + H.img(file) + '" alt="' + esc(t.name + " — " + label.toLowerCase()) + '" loading="lazy">' +
            '<span class="g-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>' +
          "</button>" +
          '<figcaption><span class="pr-title">' + esc(label) + "</span>" +
            (rows && rows.length ? '<dl class="room-list">' + rows.map(function (r) {
              return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>";
            }).join("") + "</dl>" : "") +
          "</figcaption>" +
        "</figure>"
      );
    }
    var plansBody = document.getElementById("plans-body");
    if (t.plans) {
      plansBody.innerHTML =
        '<div class="plan-sheets">' +
          planFigure(t.plans.ground, "Ground floor", t.ground) +
          planFigure(t.plans.first, "First floor", t.first) +
        "</div>" +
        (t.plans.elevations ? '<div class="plan-elevations">' + planFigure(t.plans.elevations, "Elevations — front, sides and rear") + "</div>" : "");
    } else {
      var pi = document.querySelector("#floor-plans .section-intro");
      if (pi) pi.textContent = "Floor plans for the " + t.name + " will be published here as soon as they are ready.";
      plansBody.innerHTML =
        '<div class="sold-out" data-reveal>' +
          '<span class="sold-out-rule" aria-hidden="true"></span>' +
          '<p class="sold-out-title">Floor plans to follow</p>' +
          "<p>Drawings for the " + esc(t.name) + " are being finalised. Please get in touch and we will send them to you as soon as they are ready.</p>" +
          '<a class="btn btn-navy" href="#enquire">Ask for the floor plans</a>' +
        "</div>";
    }

    if (images.length) lightbox(images, t.name + " — " + d.name);

    // Availability
    setText("homes-intro", list.length
      ? "Every " + t.name + " home at " + d.name + ", updated as homes are reserved and sold."
      : "There are no " + t.name + " homes at " + d.name + " at the moment.");
    document.getElementById("homes-body").innerHTML = list.length ? availabilityHtml(sub, { selected: sel ? sel.plot : null }) : "";
    var planLink = document.getElementById("type-plan-link");
    if (d.sitePlan) planLink.href = plotsUrl(d) + "&type=" + encodeURIComponent(k);
    else planLink.parentNode.hidden = true;

    // Downloads
    document.getElementById("downloads-body").innerHTML = t.pdf
      ? '<div class="download-card" data-reveal>' +
          '<span class="download-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/></svg><span>PDF</span></span>' +
          '<div class="download-body">' +
            '<p class="download-title">' + esc(t.name) + " — floor plans &amp; elevations</p>" +
            '<p class="download-meta">' + esc(["PDF", t.pdfSize, t.drawing ? "Drawing " + t.drawing : ""].filter(Boolean).join(" · ")) + "</p>" +
            '<p class="download-text">Ground and first floor plans, elevations and a section, with full dimensions.</p>' +
          "</div>" +
          '<div class="download-actions">' +
            '<a class="btn btn-gold" href="' + H.doc(t.pdf) + '" download>' + DOWNLOAD + "Download</a>" +
            '<a class="btn btn-ghost" href="' + H.doc(t.pdf) + '" target="_blank" rel="noopener">View PDF</a>' +
          "</div>" +
        "</div>" +
        '<p class="table-note">Drawings are for guidance only and may change as the homes are built. Please ask the team to confirm details for a specific plot.</p>'
      : '<p class="section-intro" data-reveal>Downloadable drawings for the ' + esc(t.name) + " will be added here soon.</p>";

    // Other house types
    H.render("#type-others", keys.filter(function (x) { return x !== k; }), function (x) {
      var o = types[x];
      var avail = d.plots.filter(function (p) { return p.houseType === x && p.status === "available"; }).length;
      var media = o.image
        ? '<img src="' + H.img(o.image) + '" alt="" loading="lazy">'
        : '<span class="type-card-empty"><span>' + esc(o.name) + "</span><small>Images to follow</small></span>";
      return (
        '<a class="type-card type-card-link" href="' + typeUrl(d, x) + '" data-reveal>' +
          '<span class="type-card-media">' + media + "</span>" +
          '<span class="type-card-body">' +
            '<span class="type-card-name">' + esc(o.name) + "</span>" +
            '<span class="type-card-style">' + esc(o.style) + "</span>" +
            '<span class="type-card-area">' + esc(avail ? avail + " available now" : "None available now") + "</span>" +
            '<span class="link-arrow">View details ' + ARROW + "</span>" +
          "</span>" +
        "</a>"
      );
    });
    var op = document.getElementById("others-plan");
    if (d.sitePlan) op.href = plotsUrl(d); else op.hidden = true;

    // Enquire
    setText("enq-name", t.name);
    document.getElementById("enq-mail").href = mailto("Enquiry: " + t.name + (sel ? ", plot " + sel.plot : "") + " at " + d.name);

    subnav();
    H.reveal();
    H.counters();
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* Highlight active sub-nav link as sections pass */
  function subnav() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-sub]"));
    var nav = document.querySelector(".subnav");
    if (!links.length || !nav) return;
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

    function update() {
      var y = window.scrollY + window.innerHeight * 0.35;
      var active = -1;
      sections.forEach(function (s, i) { if (s && s.offsetTop <= y) active = i; });
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

  /* Simple accessible lightbox with crossfade */
  function lightbox(images, name) {
    var box = document.getElementById("lightbox");
    if (!box) return;
    var img = document.getElementById("lb-img");
    var cap = document.getElementById("lb-cap");
    var idx = 0, lastFocus = null;

    function show(i) {
      idx = (i + images.length) % images.length;
      img.classList.remove("is-loaded");
      img.onload = function () { img.classList.add("is-loaded"); };
      img.src = H.img(images[idx]);
      img.alt = name + " — image " + (idx + 1) + " of " + images.length;
      cap.textContent = name + "  ·  " + (idx + 1) + " / " + images.length;
      if (img.complete) img.classList.add("is-loaded");
    }
    function open(i) {
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.classList.add("lb-open");
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      show(i);
      box.querySelector(".lb-close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("lb-open");
      setTimeout(function () { box.hidden = true; }, H.reducedMotion ? 0 : 300);
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll(".g-item").forEach(function (b) {
      b.addEventListener("click", function () { open(+b.getAttribute("data-index")); });
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
        var f = box.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Boot ---------- */
  shared();
  var page = document.body.getAttribute("data-page");
  if (page === "home") home();
  else if (page === "development") development();
  else if (page === "plots") plots();
  else if (page === "house-type") houseType();
})();

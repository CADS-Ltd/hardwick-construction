/*
 * Hardwick Construction — template 03 "Blueprint"
 * All content comes from /assets/data/developments.js via the shared H helpers.
 */
(function () {
  "use strict";
  var H = window.H;
  if (!H) return;

  var ORDER = ["available", "reserved", "coming-soon", "sold"];
  var esc = H.esc;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function upper(s) { return String(s).toUpperCase(); }
  function shortType(t) { return String(t).replace(/^The\s+/i, ""); }

  /* ---------- shared bits ---------- */

  // Segmented availability bar: one segment per plot, grouped by status.
  function availBar(dev) {
    var c = H.counts(dev);
    var segs = [];
    ORDER.forEach(function (s) {
      for (var i = 0; i < (c[s] || 0); i++) segs.push(s);
    });
    var label = ORDER.filter(function (s) { return c[s]; })
      .map(function (s) { return c[s] + " " + H.statusLabel(s).toLowerCase(); }).join(", ");
    return '<div class="abar" role="img" aria-label="Availability: ' + esc(label) + '">' +
      segs.map(function (s, i) {
        return '<span class="seg seg-' + s + '" style="--s:' + i + '"></span>';
      }).join("") + "</div>";
  }

  function availLegend(dev) {
    var c = H.counts(dev);
    return '<ul class="alegend mono">' + ORDER.filter(function (s) { return c[s]; })
      .map(function (s) {
        return '<li><i class="sw sw-' + s + '" aria-hidden="true"></i>' + c[s] + " " + esc(H.statusLabel(s)) + "</li>";
      }).join("") + "</ul>";
  }

  function chipFor(dev) {
    var c = H.counts(dev);
    if (dev.stage === "completed") return { cls: "chip-muted", text: "Completed " + (dev.completed || "") };
    if (c.available) return { cls: "chip-amber", text: plural(c.available, "home", "homes") + " available" };
    if (c["coming-soon"]) return { cls: "chip-blue", text: "Coming soon" };
    if (c.reserved) return { cls: "chip-blue", text: "All reserved" };
    return { cls: "chip-muted", text: "Sold out" };
  }

  function siteRef(dev) {
    var list = dev.stage === "completed" ? H.completed() : H.current();
    var i = list.indexOf(dev);
    return (dev.stage === "completed" ? "Completed " : "Site ") + pad(i + 1);
  }

  function companyLinks() {
    var c = H.company;
    var mail = "mailto:" + c.email;
    document.querySelectorAll("#email-btn").forEach(function (a) { a.href = mail; });
  }

  function initCommon() {
    H.fillCompany();
    companyLinks();
    H.stickyHeader("[data-header]", 24);
    H.navToggle();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        var t = document.querySelector("[data-nav-toggle]");
        if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
      }
    });
  }

  /* ---------- HOME ---------- */

  function renderHome() {
    var current = H.current();
    var completed = H.completed();
    var stats = H.company.stats || [];
    var availableNow = current.reduce(function (sum, d) { return sum + H.counts(d).available; }, 0);

    // Spec-sheet strip
    var cells = stats.map(function (s) {
      return { value: s.value, suffix: s.suffix || "", label: s.label };
    });
    cells.push({ value: availableNow, suffix: "", label: "Homes available now", hl: true });
    H.render("#spec-grid", cells, function (c, i) {
      return '<div class="sheet-cell' + (c.hl ? " is-hl" : "") + '">' +
        '<dt><span class="mono ref">' + pad(i + 1) + "</span>" + esc(c.label) + "</dt>" +
        '<dd><span data-count="' + c.value + '" data-suffix="' + esc(c.suffix) + '">' + c.value + esc(c.suffix) + "</span></dd>" +
        "</div>";
    });

    // Dimension label above current developments
    var totalPlots = current.reduce(function (s, d) { return s + d.plots.length; }, 0);
    var dim = document.getElementById("current-dim");
    if (dim) dim.textContent = plural(current.length, "site", "sites") + " — " + totalPlots + " plots — " + availableNow + " available";

    // Current development cards
    H.render("#current-list", current, function (d, i) {
      var chip = chipFor(d);
      var from = H.priceFrom(d);
      var href = "development.html?site=" + encodeURIComponent(d.slug);
      return '<article class="dev-card" data-reveal>' +
        '<div class="dev-media crop">' +
          '<div class="img-frame"><img src="' + H.img(d.hero) + '" alt="Homes at ' + esc(d.name) + '" loading="lazy"></div>' +
          '<span class="tag mono">Site ' + pad(i + 1) + "</span>" +
          '<span class="chip ' + chip.cls + '">' + esc(chip.text) + "</span>" +
        "</div>" +
        '<div class="dev-body">' +
          '<p class="mono meta">' + esc(upper(d.location)) + " · " + esc(d.postcode) + "</p>" +
          '<h3><a class="stretch" href="' + href + '">' + esc(d.name) + "</a></h3>" +
          '<p class="dev-summary">' + esc(d.summary) + "</p>" +
          '<dl class="dev-spec">' +
            "<div><dt class=\"mono\">Beds</dt><dd>" + esc(H.bedRange(d).replace(" bed", "")) + "</dd></div>" +
            "<div><dt class=\"mono\">From</dt><dd>" + (from ? esc(H.price(from)) : "—") + "</dd></div>" +
            "<div><dt class=\"mono\">Plots</dt><dd>" + d.plots.length + "</dd></div>" +
          "</dl>" +
          '<div class="dev-avail">' + availBar(d) + availLegend(d) + "</div>" +
          '<span class="dev-more mono" aria-hidden="true">View development <i>→</i></span>' +
        "</div>" +
      "</article>";
    });

    // Completed timeline, grouped by year
    var years = [];
    completed.forEach(function (d) {
      var y = d.completed || "—";
      var g = years.filter(function (x) { return x.year === y; })[0];
      if (!g) { g = { year: y, items: [] }; years.push(g); }
      g.items.push(d);
    });
    H.render("#completed-list", years, function (g) {
      return '<li class="tl-year" data-reveal>' +
        '<div class="tl-marker"><span class="tl-yr">' + esc(g.year) + '</span><span class="mono">Completed</span></div>' +
        '<div class="tl-items">' + g.items.map(function (d) {
          var facts = (d.features || []).filter(function (f) { return !/^completed/i.test(f); });
          return '<article class="tl-card">' +
            '<div class="tl-media crop"><div class="img-frame"><img src="' + H.img(d.hero) + '" alt="Completed homes at ' + esc(d.name) + '" loading="lazy"></div></div>' +
            '<div class="tl-body">' +
              '<p class="mono meta">' + esc(upper(d.location)) + "</p>" +
              '<h3><a class="stretch" href="development.html?site=' + encodeURIComponent(d.slug) + '">' + esc(d.name) + "</a></h3>" +
              "<p>" + esc(d.summary) + "</p>" +
              (facts.length ? '<ul class="tl-facts mono">' + facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" : "") +
              '<span class="dev-more mono" aria-hidden="true">View project <i>→</i></span>' +
            "</div>" +
          "</article>";
        }).join("") + "</div>" +
      "</li>";
    });
  }

  /* ---------- DEVELOPMENT ---------- */

  var CAPTIONS = {
    "int-kitchen": "Kitchen", "int-living": "Living room", "int-bedroom": "Bedroom",
    "int-bathroom": "Bathroom", "build": "Construction"
  };
  function captionFor(file) {
    var key = String(file).replace(/\.\w+$/, "").replace(/-\d+$/, "");
    if (CAPTIONS[key]) return CAPTIONS[key];
    if (/^ext/.test(key)) return "Exterior";
    if (/^build/.test(key)) return "Construction";
    return "Interior";
  }

  function renderDevelopment() {
    var d = H.page();
    if (!d) return;
    var c = H.counts(d);
    var isDone = d.stage === "completed";
    var from = H.priceFrom(d);
    var mail = "mailto:" + H.company.email + "?subject=" + encodeURIComponent("Enquiry — " + d.name);

    document.title = d.name + ", " + d.location + " — Hardwick Construction";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", d.name + " — " + d.summary);

    // Hero
    var img = document.getElementById("dev-hero-img");
    img.src = H.img(d.hero);
    img.alt = "Homes at " + d.name + ", " + d.location;
    setText("dev-title", d.name);
    setText("dev-headline", d.headline);
    setText("crumb-stage", isDone ? "Completed" : "Current");
    var back = document.getElementById("crumb-back");
    back.href = "index.html#" + (isDone ? "completed" : "current");
    document.getElementById("dev-ref").innerHTML =
      '<span class="amber">' + esc(upper(siteRef(d))) + "</span><span class=\"lbl-sep\"> &nbsp;—&nbsp; </span><span class=\"lbl-loc\">" + esc(d.location) + " · " + esc(d.postcode) + "</span>";

    var chip = chipFor(d);
    document.getElementById("dev-actions").innerHTML = isDone
      ? '<span class="chip chip-lg chip-muted">' + esc(chip.text) + " — all homes sold</span>" +
        '<a class="btn btn-ghost" href="index.html#current">See current developments</a>'
      : '<a class="btn btn-amber" href="#availability">View availability <span aria-hidden="true">↓</span></a>' +
        '<span class="chip chip-lg ' + chip.cls + '">' + esc(chip.text) + "</span>";

    // Key facts
    setText("facts-name", d.name);
    var facts = isDone ? [
      { k: "Location", v: d.location },
      { k: "Postcode", v: d.postcode },
      { k: "Completed", v: String(d.completed || "—") },
      { k: "Status", v: "All homes sold" }
    ] : [
      { k: "Location", v: d.location },
      { k: "Homes", v: String(c.total) },
      { k: "Bedrooms", v: H.bedRange(d).replace(" bed", "") + " bed" },
      { k: "Prices from", v: from ? H.price(from) : "—" },
      { k: "Available now", count: c.available, hl: true }
    ];
    var grid = document.getElementById("facts-grid");
    grid.style.setProperty("--cols", facts.length);
    H.render(grid, facts, function (f, i) {
      var val = f.count != null
        ? '<span data-count="' + f.count + '">' + f.count + "</span>"
        : esc(f.v);
      return '<div class="sheet-cell' + (f.hl ? " is-hl" : "") + '">' +
        '<dt><span class="mono ref">' + pad(i + 1) + "</span>" + esc(f.k) + "</dt>" +
        '<dd class="' + (f.count != null ? "" : "dd-text") + '">' + val + "</dd></div>";
    });

    // Overview
    H.render("#dev-description", d.description || [], function (p) { return "<p>" + esc(p) + "</p>"; });
    H.render("#dev-features", d.features || [], function (f, i) {
      return '<li><span class="mono amber">' + pad(i + 1) + "</span><span>" + esc(f) + "</span></li>";
    });

    // Availability
    var body = document.getElementById("avail-body");
    if (isDone || !d.plots.length) {
      document.getElementById("avail-title").textContent = "Completed " + (d.completed || "") + " — all homes sold";
      setText("avail-intro", d.name + " was completed in " + (d.completed || "") + " and every home has now been sold and handed over to its new owners.");
      document.getElementById("avail-label").innerHTML = '<span class="amber">02</span> — Availability';
      var others = H.current();
      body.innerHTML =
        '<div class="asbuilt" data-reveal>' +
          '<div class="asbuilt-stamp" aria-hidden="true"><span class="mono">As built</span><strong>' + esc(d.completed || "") + '</strong><span class="mono">All sold</span></div>' +
          '<div class="asbuilt-text">' +
            '<p class="mono-label">Status: Completed ' + esc(d.completed || "") + "</p>" +
            "<h3>" + (others.length ? "Homes available now nearby" : "All homes at " + esc(d.name) + " are sold") + "</h3>" +
            "<p>Thank you to everyone who chose a Hardwick home here. " + (others.length ? "Take a look at our current developments below, or" : "To hear about future homes nearby,") + " get in touch and we'll keep you informed about new releases.</p>" +
            (others.length ? '<ul class="asbuilt-links">' + others.map(function (o) {
              var oc = chipFor(o);
              return '<li><a href="development.html?site=' + encodeURIComponent(o.slug) + '"><span>' + esc(o.name) +
                '<small class="mono">' + esc(o.location) + '</small></span><span class="chip ' + oc.cls + '">' + esc(oc.text) + "</span></a></li>";
            }).join("") + "</ul>" : "") +
          "</div>" +
        "</div>";
    } else {
      setText("avail-intro", "Hover or tap a plot on the site plan for details, or see every home listed in the table below. Prices and availability are updated regularly.");
      body.innerHTML = summaryHTML(d) + planHTML(d) + tableHTML(d);
      wirePlan();
    }

    // Gallery
    var gallery = d.gallery || [];
    var gEl = document.getElementById("dev-gallery");
    gEl.classList.add("g-" + Math.min(gallery.length, 5));
    H.render(gEl, gallery, function (f, i) {
      var cap = captionFor(f);
      return '<figure class="g-item" data-reveal>' +
        '<button type="button" class="g-btn crop" data-index="' + i + '" aria-label="View larger: ' + esc(cap) + '">' +
          '<span class="img-frame"><img src="' + H.img(f) + '" alt="' + esc(cap) + " — " + esc(d.name) + '" loading="lazy"></span>' +
        "</button>" +
        '<figcaption class="mono"><span class="amber">Fig. ' + pad(i + 1) + "</span> — " + esc(cap) + "</figcaption>" +
      "</figure>";
    });
    wireLightbox(gallery, d);

    // Location
    setText("location-title", "Finding " + d.name);
    setText("location-copy", d.name + " is in " + d.location + ". Viewings are by appointment — call or email and we'll arrange a time to show you around" + (isDone ? " our current sites nearby." : " the site."));
    setText("loc-name", d.name);
    setText("loc-area", d.location);
    setText("loc-postcode", d.postcode);
    setText("locator-tag", d.name);
    setText("locator-pc", d.postcode);
    document.getElementById("map-link").href =
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.postcode + " " + d.location);

    // Enquire
    setText("enquire-title", isDone ? "Looking for a new home nearby?" : "Interested in a home at " + d.name + "?");
    setText("enquire-copy", isDone
      ? "Speak to James about our current developments, or ask to be told when new homes are released."
      : "Call or email to arrange a viewing, ask about a plot or reserve your new home.");
    document.getElementById("enquire-email").href = mail;
  }

  function setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }

  function summaryHTML(d) {
    var c = H.counts(d);
    return '<div class="avail-summary" data-reveal>' +
      '<ul class="sum-grid">' + ORDER.map(function (s) {
        return '<li class="sum-' + s + '"><span class="sum-n">' + (c[s] || 0) + '</span><span class="mono"><i class="sw sw-' + s + '" aria-hidden="true"></i>' + esc(H.statusLabel(s)) + "</span></li>";
      }).join("") + "</ul>" +
      availBar(d) +
    "</div>";
  }

  function plotLabel(p) {
    return "Plot " + p.plot + ", " + p.type + ", " + p.beds + " bedrooms, " +
      p.sqft.toLocaleString("en-GB") + " square feet, " +
      (p.status === "sold" ? "" : H.price(p.price) + ", ") + H.statusLabel(p.status);
  }

  function tileHTML(p, i, side) {
    return '<button type="button" class="tile tile-' + p.status + " tile-" + side + '" data-reveal style="--i:' + i + '"' +
      ' data-plot="' + p.plot + '" aria-label="' + esc(plotLabel(p)) + '">' +
      '<span class="fp">' +
        '<span class="fp-n">' + pad(p.plot) + "</span>" +
        '<span class="fp-t mono">' + esc(upper(shortType(p.type))) + "</span>" +
        '<span class="fp-b mono">' + p.beds + " bed</span>" +
      "</span>" +
    "</button>";
  }

  function planHTML(d) {
    var plots = d.plots.slice();
    var half = Math.ceil(plots.length / 2);
    var top = plots.slice(0, half);
    var bottom = plots.slice(half);
    var idx = 0;
    var topHTML = top.map(function (p) { return tileHTML(p, idx++, "top"); }).join("");
    var botHTML = bottom.map(function (p) { return tileHTML(p, idx++, "bottom"); }).join("");
    var north = '<svg class="north" viewBox="0 0 40 52" aria-hidden="true"><path d="M20 6 L28 34 L20 28 L12 34 Z" /><text x="20" y="49">N</text></svg>';
    return '<div class="plan" id="plan" data-reveal style="--cols:' + half + '">' +
      '<div class="plan-head">' +
        '<div><p class="mono plan-title"><span class="amber">Drg. 02</span> — Site plan, ' + esc(d.name) + '</p>' +
        '<p class="mono plan-note">Illustrative layout — not to scale</p></div>' + north +
      "</div>" +
      '<div class="plan-site">' +
        '<div class="plan-row plan-top">' + topHTML + "</div>" +
        '<div class="road" aria-hidden="true"><span class="mono road-in">← Site entrance</span><span class="mono road-name">Estate road</span></div>' +
        '<div class="plan-row plan-bottom">' + botHTML + "</div>" +
      "</div>" +
      '<div class="plan-foot">' + availLegend(d) +
        '<p class="mono plan-hint">Hover or tap a plot for details</p>' +
      "</div>" +
      '<div class="plot-tip" id="plot-tip" aria-hidden="true"></div>' +
    "</div>";
  }

  function tableHTML(d) {
    return '<div class="table-wrap" data-reveal>' +
      '<table class="avail-table">' +
        "<caption class=\"sr-only\">Availability of every plot at " + esc(d.name) + "</caption>" +
        '<thead><tr><th scope="col">Plot</th><th scope="col">House type</th><th scope="col">Beds</th><th scope="col">Sq ft</th><th scope="col">Price</th><th scope="col">Status</th></tr></thead>' +
        "<tbody>" + d.plots.map(function (p) {
          var sold = p.status === "sold";
          return '<tr id="plot-row-' + p.plot + '" class="row-' + p.status + '" data-plot="' + p.plot + '">' +
            '<th scope="row" class="c-plot"><span class="mono">Plot</span> ' + pad(p.plot) + "</th>" +
            '<td class="c-type">' + esc(p.type) + "</td>" +
            '<td class="c-beds" data-label="Beds">' + p.beds + "</td>" +
            '<td class="c-sqft" data-label="Sq ft">' + p.sqft.toLocaleString("en-GB") + "</td>" +
            '<td class="c-price">' + (sold
              ? '<s aria-label="Sold">' + esc(H.price(p.price)) + "</s>"
              : esc(H.price(p.price))) + "</td>" +
            '<td class="c-status"><span class="badge badge-' + p.status + '">' + esc(H.statusLabel(p.status)) + "</span></td>" +
          "</tr>";
        }).join("") + "</tbody>" +
      "</table>" +
    "</div>";
  }

  function wirePlan() {
    var plan = document.getElementById("plan");
    var tip = document.getElementById("plot-tip");
    if (!plan || !tip) return;
    var d = H.page();
    var byNo = {};
    d.plots.forEach(function (p) { byNo[p.plot] = p; });

    function show(tile) {
      var p = byNo[tile.getAttribute("data-plot")];
      if (!p) return;
      var sold = p.status === "sold";
      tip.innerHTML =
        '<div class="tip-head"><span class="mono">Plot ' + pad(p.plot) + '</span><span class="badge badge-' + p.status + '">' + esc(H.statusLabel(p.status)) + "</span></div>" +
        "<strong>" + esc(p.type) + "</strong>" +
        '<span class="mono tip-spec">' + p.beds + " bed — " + p.sqft.toLocaleString("en-GB") + " sq ft</span>" +
        '<span class="tip-price">' + (sold ? "<s>" + esc(H.price(p.price)) + "</s>" : esc(H.price(p.price))) + "</span>";
      tip.className = "plot-tip tip-" + p.status + " is-on";
      var pr = plan.getBoundingClientRect(), tr = tile.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = tr.left - pr.left + tr.width / 2 - tw / 2;
      x = Math.max(10, Math.min(x, pr.width - tw - 10));
      var y = tr.top - pr.top - th - 10;
      if (tile.classList.contains("tile-bottom")) y = tr.bottom - pr.top + 10;
      if (y < 10) y = tr.bottom - pr.top + 10;
      tip.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
      highlight(p.plot, true);
    }
    function hide() {
      tip.classList.remove("is-on");
      highlight(null, false);
    }
    function highlight(no, on) {
      plan.querySelectorAll(".tile.is-hl").forEach(function (t) { t.classList.remove("is-hl"); });
      document.querySelectorAll(".avail-table tr.is-hl").forEach(function (r) { r.classList.remove("is-hl"); });
      if (!on) return;
      var row = document.getElementById("plot-row-" + no);
      if (row) row.classList.add("is-hl");
    }

    plan.querySelectorAll(".tile").forEach(function (tile) {
      tile.addEventListener("mouseenter", function () { show(tile); });
      tile.addEventListener("mouseleave", function () { if (document.activeElement !== tile) hide(); });
      tile.addEventListener("focus", function () { show(tile); });
      tile.addEventListener("blur", hide);
      tile.addEventListener("click", function () { show(tile); });
    });

    // Table rows highlight their tile on the plan
    document.querySelectorAll(".avail-table tbody tr").forEach(function (row) {
      var t = plan.querySelector('.tile[data-plot="' + row.getAttribute("data-plot") + '"]');
      row.addEventListener("mouseenter", function () { if (t) t.classList.add("is-hl"); });
      row.addEventListener("mouseleave", function () { if (t) t.classList.remove("is-hl"); });
    });

    window.addEventListener("resize", hide, { passive: true });
  }

  function wireLightbox(files, d) {
    var dlg = document.getElementById("lightbox");
    if (!dlg || !files.length || typeof dlg.showModal !== "function") return;
    var img = document.getElementById("lb-img");
    var cap = document.getElementById("lb-cap");
    var cur = 0;
    function set(i) {
      cur = (i + files.length) % files.length;
      img.src = H.img(files[cur]);
      img.alt = captionFor(files[cur]) + " — " + d.name;
      cap.textContent = "Fig. " + pad(cur + 1) + " — " + captionFor(files[cur]) + "  ·  " + (cur + 1) + " / " + files.length;
    }
    document.querySelectorAll(".g-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        set(+b.getAttribute("data-index"));
        dlg.showModal();
      });
    });
    dlg.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-lb");
      if (a === "close" || e.target === dlg) dlg.close();
      else if (a === "prev") set(cur - 1);
      else if (a === "next") set(cur + 1);
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") set(cur - 1);
      if (e.key === "ArrowRight") set(cur + 1);
    });
    var multi = files.length > 1;
    dlg.querySelectorAll(".lb-prev, .lb-next").forEach(function (b) { b.hidden = !multi; });
  }

  /* ---------- boot ---------- */
  var page = document.body.getAttribute("data-page");
  if (page === "home") renderHome();
  if (page === "development") renderDevelopment();
  initCommon();
  H.reveal();
  H.counters();
})();

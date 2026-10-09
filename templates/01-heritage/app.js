/* Hardwick Construction — Template 01 "Heritage" */
(function () {
  var H = window.H;
  if (!H) return;
  var C = H.company;
  var esc = H.esc;

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5"/></svg>';

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
      a.href = mailto("Enquiry from the Hardwick website");
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
            '<a class="link-arrow draw" href="' + devUrl(d) + '">View development' +
              '<span class="sr-only"> — ' + esc(d.name) + "</span> " + ARROW + "</a>" +
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

    document.title = d.name + ", " + d.location + " — Hardwick Construction";
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
      setText("enq-lead", "Every home here is now sold, but new Hardwick developments are always in the pipeline. Call or email to hear about them first.");
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
          '<tr class="plot is-' + p.status + '">' +
            '<td data-label="Plot"><span class="plot-no">' + esc(p.plot) + "</span></td>" +
            '<td data-label="House type" class="plot-type">' + esc(p.type) + "</td>" +
            '<td data-label="Bedrooms">' + esc(p.beds) + "</td>" +
            '<td data-label="Sq ft">' + esc(p.sqft.toLocaleString("en-GB")) + "</td>" +
            '<td data-label="Price" class="plot-price">' + price + "</td>" +
            '<td data-label="Status"><span class="badge badge-' + p.status + '">' +
              esc(H.statusLabel(p.status)) + "</span></td>" +
          "</tr>"
        );
      }).join("");

      body.innerHTML = sumHtml +
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
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.postcode);

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
})();

/* Hardwick Construction — Template 06 "Bold Brand" */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var H = window.H;
  if (!H) return;
  var C = H.company;

  var ARROW = '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5"/></svg>';
  var TICK = '<span class="tick" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg></span>';

  function devUrl(d) { return "development.html?site=" + encodeURIComponent(d.slug); }
  function mailto(subject) {
    return "mailto:" + C.email + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  }
  function $(sel) { return document.querySelector(sel); }
  function setText(sel, txt) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = txt; }); }

  function availTag(d) {
    var c = H.counts(d);
    if (c.available) return c.available + " available";
    if (c["coming-soon"]) return "Coming soon";
    if (c.reserved) return "All reserved";
    return "Sold out";
  }

  /* ---------- Shared: footer development links, mailto buttons ---------- */
  function shared() {
    H.render("#footer-devs", H.current(), function (d) {
      return '<li><a href="' + devUrl(d) + '">' + H.esc(d.name) + "</a></li>";
    });
    var ftr = $("#footer-devs");
    if (ftr) ftr.insertAdjacentHTML("beforeend", '<li><a href="index.html#completed">Completed developments</a></li>');
    document.querySelectorAll("[data-mailto]").forEach(function (a) {
      a.href = mailto(a.getAttribute("data-mailto") || "Enquiry from the website");
    });
  }

  /* ---------- Home page ---------- */
  function home() {
    var current = H.current();
    var completed = H.completed();

    // Hero band: total homes available now
    var total = current.reduce(function (n, d) { return n + H.counts(d).available; }, 0);
    var heroNum = $("#hero-available");
    if (heroNum) heroNum.textContent = total;
    setText("#hero-sites", "across our " + current.length + " current developments");

    // Marquee: "Now selling · A · B · C ·" repeated, two identical halves for a seamless loop
    var mq = $("#marquee");
    if (mq) {
      var names = current.map(function (d) { return d.name; });
      var seq = '<span class="mq-strong">Now selling</span><span class="mq-dot">·</span>' +
        names.map(function (n) { return "<span>" + H.esc(n) + '</span><span class="mq-dot">·</span>'; }).join("");
      var half = '<div class="marquee-half">' + seq + seq + seq + seq + "</div>";
      mq.innerHTML = half + half.replace("marquee-half", "marquee-half\" aria-hidden=\"true");
      mq.setAttribute("aria-hidden", "true");
      mq.parentNode.insertAdjacentHTML("beforeend",
        '<span class="sr-only">Now selling: ' + H.esc(names.join(", ")) + "</span>");
    }

    // Current developments — big alternating cards
    H.render("#current-list", current, function (d, i) {
      var c = H.counts(d), from = H.priceFrom(d);
      return '<article class="dev-card' + (i % 2 ? " is-flipped" : "") + '" data-reveal>' +
        '<a class="dev-card-media" href="' + devUrl(d) + '" tabindex="-1" aria-hidden="true">' +
          '<span class="reveal-img"><img src="' + H.img(d.hero) + '" alt="" loading="lazy"></span>' +
          '<span class="tag tag-gold">' + H.esc(availTag(d)) + "</span>" +
        "</a>" +
        '<div class="dev-card-body">' +
          '<p class="eyebrow">' + H.esc(d.location) + "</p>" +
          '<h3 class="dev-card-title"><a href="' + devUrl(d) + '">' + H.esc(d.name) + "</a></h3>" +
          '<p class="dev-card-text">' + H.esc(d.summary) + "</p>" +
          '<dl class="meta">' +
            "<div><dt>Bedrooms</dt><dd>" + H.esc(H.bedRange(d)) + "</dd></div>" +
            "<div><dt>Prices from</dt><dd>" + (from ? H.price(from) : "TBC") + "</dd></div>" +
            "<div><dt>Homes</dt><dd>" + c.total + "</dd></div>" +
          "</dl>" +
          '<a class="btn btn-navy" href="' + devUrl(d) + '">View development' +
            '<span class="sr-only"> — ' + H.esc(d.name) + "</span>" + ARROW + "</a>" +
        "</div>" +
      "</article>";
    });

    // Completed developments
    H.render("#completed-list", completed, function (d) {
      return '<article class="mini-card" data-reveal>' +
        '<a class="mini-card-link" href="' + devUrl(d) + '">' +
          '<span class="mini-card-media"><img src="' + H.img(d.hero) + '" alt="" loading="lazy">' +
            '<span class="tag tag-navy">Completed ' + H.esc(d.completed || "") + "</span></span>" +
          '<span class="mini-card-body">' +
            '<span class="mini-card-loc">' + H.esc(d.location) + "</span>" +
            '<span class="mini-card-title">' + H.esc(d.name) + "</span>" +
            '<span class="mini-card-text">' + H.esc(d.summary) + "</span>" +
            '<span class="mini-card-more">All homes sold · See the development' + ARROW + "</span>" +
          "</span>" +
        "</a>" +
      "</article>";
    });

    // Stats on blue
    var stats = (C.stats || []).slice();
    stats.push({ value: current.length, suffix: "", label: "Developments selling now" });
    H.render("#stats", stats, function (s) {
      return '<div class="stat" data-reveal>' +
        '<span class="stat-num"><span data-count="' + s.value + '" data-suffix="' + H.esc(s.suffix || "") + '">0</span></span>' +
        '<span class="stat-label">' + H.esc(s.label) + "</span>" +
      "</div>";
    });
  }

  /* ---------- Development page ---------- */
  function development() {
    var d = H.page();
    if (!d) return;
    var c = H.counts(d);
    var isDone = d.stage === "completed" || !d.plots.length;
    var from = H.priceFrom(d);

    document.title = d.name + ", " + d.location + " — Hardwick Construction";

    setText("#dev-location", d.location);
    setText("#dev-name", d.name);
    setText("#dev-name-2", d.name);
    setText("#dev-name-3", d.name);
    setText("#dev-name-4", d.name);
    setText("#dev-headline", d.headline);
    setText("#dev-postcode", d.postcode);
    setText("#dev-place", d.location);

    var img = $("#dev-hero-img");
    img.src = H.img(d.hero);
    img.alt = d.name + ", " + d.location;

    var back = $("#back-link");
    if (isDone) back.setAttribute("href", "index.html#completed");

    // Hero actions
    $("#dev-hero-actions").innerHTML = isDone
      ? '<span class="tag tag-gold tag-lg">Completed ' + H.esc(d.completed || "") + " · All homes sold</span>"
      : '<a class="btn btn-gold" href="#availability">See available homes' + ARROW + "</a>" +
        '<a class="btn btn-ghost-light" href="' + mailto("Enquiry: " + d.name) + '">Enquire</a>';

    // Key facts (yellow bar)
    var facts = isDone
      ? [["Location", d.location], ["Postcode", d.postcode], ["Completed", d.completed || "—"], ["Status", "All homes sold"]]
      : [["Location", d.location], ["Homes", c.total], ["Bedrooms", H.bedRange(d)],
         ["Prices from", from ? H.price(from) : "TBC"], ["Available now", c.available]];
    H.render("#facts", facts, function (f) {
      return "<div><dt>" + H.esc(f[0]) + "</dt><dd>" + H.esc(f[1]) + "</dd></div>";
    });
    $("#facts").classList.add("facts-" + facts.length);

    // Description + features
    H.render("#dev-description", d.description, function (p, i) {
      return "<p" + (i === 0 ? ' class="lead"' : "") + ">" + H.esc(p) + "</p>";
    });
    H.render("#dev-features", d.features, function (f) {
      return "<li>" + TICK + H.esc(f) + "</li>";
    });

    // Availability
    if (isDone) {
      setText("#availability-eyebrow", "Sold out");
      setText("#availability-title", "Completed " + (d.completed || ""));
      $("#summary").remove();
      var others = H.current();
      $("#plots").innerHTML =
        '<div class="sold-out" data-reveal>' +
          '<div class="sold-out-mark" aria-hidden="true"><span>' + H.esc(d.completed || "") + "</span></div>" +
          '<div class="sold-out-body">' +
            '<h3 class="h3">Completed ' + H.esc(d.completed || "") + " — all homes sold</h3>" +
            "<p>Every home at " + H.esc(d.name) + " has been sold and is now lived in. Thank you to all our buyers. " +
            "Looking for something similar? These developments are selling now:</p>" +
            '<div class="sold-out-links">' + others.map(function (o) {
              return '<a class="btn btn-navy-outline btn-sm" href="' + devUrl(o) + '">' + H.esc(o.name) + "</a>";
            }).join("") + "</div>" +
          "</div>" +
        "</div>";
    } else {
      var chips = [
        ["available", c.available, "Available"],
        ["reserved", c.reserved, "Reserved"],
        ["coming-soon", c["coming-soon"], "Coming soon"],
        ["sold", c.sold, "Sold"]
      ];
      H.render("#summary", chips, function (s) {
        return '<li class="chip chip--' + s[0] + '"><strong>' + s[1] + "</strong> " + s[2] + "</li>";
      });

      var plots = d.plots.slice().sort(function (a, b) { return a.plot - b.plot; });
      $("#plots").innerHTML =
        '<ul class="plots" data-stagger>' + plots.map(function (p) {
          var no = (p.plot < 10 ? "0" : "") + p.plot;
          var sold = p.status === "sold";
          var price = sold
            ? '<p class="plot-price"><span class="sr-only">Sold. Was </span><s>' + H.price(p.price) + "</s></p>"
            : '<p class="plot-price">' + H.price(p.price) + "</p>";
          var action = "";
          if (p.status === "available") action = '<a class="plot-link" href="' + mailto("Plot " + p.plot + ", " + d.name) + '">Enquire about plot ' + p.plot + ARROW + "</a>";
          else if (p.status === "coming-soon") action = '<a class="plot-link" href="' + mailto("Register interest: plot " + p.plot + ", " + d.name) + '">Register interest' + ARROW + "</a>";
          else if (p.status === "reserved") action = '<span class="plot-note">Reserved — subject to contract</span>';
          else action = '<span class="plot-note">This home has been sold</span>';
          return '<li class="plot plot--' + p.status + '" data-reveal>' +
            '<div class="plot-top"><span class="plot-no"><small>Plot</small>' + no + "</span>" +
              '<span class="badge badge--' + p.status + '">' + H.esc(H.statusLabel(p.status)) + "</span></div>" +
            '<h3 class="plot-type">' + H.esc(p.type) + "</h3>" +
            '<p class="plot-spec">' + p.beds + " bedrooms · " + p.sqft.toLocaleString("en-GB") + " sq ft</p>" +
            price + action +
          "</li>";
        }).join("") + "</ul>";
    }

    // Gallery
    var g = $("#gallery");
    g.classList.add("gallery-n" + Math.min(d.gallery.length, 4));
    H.render(g, d.gallery, function (f, i) {
      return '<figure class="gallery-item reveal-img" data-reveal style="--i:' + i + '">' +
        '<img src="' + H.img(f) + '" alt="' + H.esc(d.name) + ' — interior photo ' + (i + 1) + '" loading="lazy"></figure>';
    });

    // Location
    setText("#location-text", d.name + " is in " + d.location + ". Use postcode " + d.postcode +
      " for sat-nav — or give us a call and we'll arrange a time to show you round.");
    $("#map-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(d.postcode);

    // Enquire
    $("#enquire-email").href = mailto("Enquiry: " + d.name);
    if (isDone) {
      $("#enquire-title").textContent = "Looking for a home like " + d.name + "?";
      $("#enquire-title").nextElementSibling.textContent = "We have new homes selling now nearby. Speak to James and the team about what's available.";
    }

    // More developments
    var more = H.current().filter(function (o) { return o.slug !== d.slug; });
    if (!more.length) { $("#more-section").remove(); }
    else {
      H.render("#more", more, function (o) {
        var f = H.priceFrom(o);
        return '<article class="mini-card" data-reveal>' +
          '<a class="mini-card-link" href="' + devUrl(o) + '">' +
            '<span class="mini-card-media"><img src="' + H.img(o.hero) + '" alt="" loading="lazy">' +
              '<span class="tag tag-gold">' + H.esc(availTag(o)) + "</span></span>" +
            '<span class="mini-card-body">' +
              '<span class="mini-card-loc">' + H.esc(o.location) + "</span>" +
              '<span class="mini-card-title">' + H.esc(o.name) + "</span>" +
              '<span class="mini-card-text">' + H.esc(H.bedRange(o)) + " homes" + (f ? " from " + H.price(f) : "") + "</span>" +
              '<span class="mini-card-more">View development' + ARROW + "</span>" +
            "</span>" +
          "</a>" +
        "</article>";
      });
    }
  }

  /* ---------- Boot ---------- */
  shared();
  if (document.body.classList.contains("page-dev")) development(); else home();
  H.fillCompany();
  H.stickyHeader(".site-header", 8);
  H.navToggle();
  H.reveal();
  H.counters();

  // Close mobile nav with Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      var t = $("[data-nav-toggle]");
      if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
    }
  });
})();

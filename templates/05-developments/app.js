/* Hardwick Construction — Template 05 "Find your home"
 * All content comes from /assets/data/developments.js via window.H helpers.
 */
(function () {
  "use strict";

  var C = H.company;

  /* ---------- Icons ---------- */
  var I = {
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-8m0 5h18m0 3v-5a3 3 0 00-3-3h-7v6"/><circle cx="7" cy="12" r="1.8"/></svg>',
    area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>'
  };

  // Representative photo for each house type (falls back to the development's hero image).
  var TYPE_IMG = {
    "The Ashby": "ext-brick-row.jpg",
    "The Calke": "ext-cottage.jpg",
    "The Melbourne": "ext-garden.jpg",
    "The Repton": "ext-brick-trees.jpg",
    "The Bretby": "ext-detached.jpg"
  };
  function plotImg(p, dev) { return H.img(TYPE_IMG[p.type] || dev.hero); }

  var esc = H.esc;
  function devUrl(dev, extra) { return "development.html?site=" + encodeURIComponent(dev.slug) + (extra || ""); }
  function shortPrice(n) { return "£" + Math.round(n / 1000) + "k"; }
  function mailto(subject, body) {
    return "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function pill(status, text) {
    return '<span class="pill pill--' + status + '">' + esc(text || H.statusLabel(status)) + "</span>";
  }
  function forSale(p) { return p.status === "available" || p.status === "coming-soon"; }

  /* Segmented availability bar */
  var ORDER = ["available", "reserved", "coming-soon", "sold"];
  function bar(dev) {
    var c = H.counts(dev);
    if (!c.total) return "";
    return '<div class="bar" role="img" aria-label="' +
      esc(c.available + " available, " + c.reserved + " reserved, " + c["coming-soon"] + " coming soon, " + c.sold + " sold") + '">' +
      ORDER.map(function (s) {
        return c[s] ? '<i class="b-' + s + '" style="width:' + (c[s] / c.total * 100) + '%"></i>' : "";
      }).join("") + "</div>";
  }
  function legend(dev) {
    var c = H.counts(dev);
    return '<div class="bar-legend">' + ORDER.filter(function (s) { return c[s]; }).map(function (s) {
      return '<span><i class="b-' + s + '"></i>' + c[s] + " " + H.statusLabel(s).toLowerCase() + "</span>";
    }).join("") + "</div>";
  }

  /* Development card (shared by home + "other developments") */
  function devCard(dev) {
    var c = H.counts(dev), from = H.priceFrom(dev);
    var badge = c.available
      ? pill("available", c.available + " available now")
      : c["coming-soon"] ? pill("coming-soon", "Coming soon") : pill("sold", "All reserved");
    return '<a class="dev-card" data-reveal href="' + devUrl(dev) + '">' +
      '<div class="dev-card__media"><img src="' + H.img(dev.hero) + '" alt="Homes at ' + esc(dev.name) + '" loading="lazy">' +
        '<span class="dev-card__badge">' + badge + "</span></div>" +
      '<div class="dev-card__body">' +
        '<p class="dev-card__loc">' + I.pin + esc(dev.location) + "</p>" +
        "<h3>" + esc(dev.name) + "</h3>" +
        '<p class="dev-card__sum">' + esc(dev.summary) + "</p>" +
        '<p class="meta"><span>' + I.bed + esc(H.bedRange(dev)) + " homes</span><span>" + I.home + plural(c.total, "plot") + "</span></p>" +
        bar(dev) + legend(dev) +
        '<div class="dev-card__foot"><div class="dev-card__price"><small>From</small><strong>' +
          (from ? H.price(from) : "Sold out") + "</strong></div>" +
          '<span class="dev-card__go" aria-hidden="true">' + I.arrow + "</span></div>" +
      "</div></a>";
  }

  /* ---------- Common ---------- */
  function common() {
    H.fillCompany();
    H.navToggle();
    H.stickyHeader(".header", 8);
    document.querySelectorAll('[data-mobilebar="phone"]').forEach(function (a) {
      a.href = "tel:" + C.phone.replace(/\s/g, "");
    });
  }

  /* ======================================================================
     HOME
     ====================================================================== */
  function home() {
    var current = H.current();
    var allAvail = [];
    current.forEach(function (d) {
      d.plots.forEach(function (p) { if (p.status === "available") allAvail.push({ p: p, d: d }); });
    });
    allAvail.sort(function (a, b) { return a.p.price - b.p.price; });

    // Hero chips
    document.getElementById("hero-chips").innerHTML =
      '<span class="hero-chip"><strong>' + allAvail.length + "</strong> homes available now</span>" +
      '<span class="hero-chip"><strong>' + current.length + "</strong> " + (current.length === 1 ? "development" : "developments") + " selling</span>";

    // Developments
    H.render("#dev-grid", current, devCard);

    // Strip
    var stripEl = document.getElementById("strip");
    var noteEl = document.getElementById("strip-note");
    function homeCard(x) {
      var p = x.p, d = x.d;
      return '<a class="home-card" href="' + devUrl(d, "#homes") + '">' +
        '<div class="home-card__media"><img src="' + plotImg(p, d) + '" alt="' + esc(p.type) + ' house type" loading="lazy">' +
          pill("available") + '<span class="home-card__plot">Plot ' + esc(p.plot) + "</span></div>" +
        '<div class="home-card__body">' +
          '<p class="home-card__dev">' + esc(d.name) + "</p>" +
          "<h3>" + esc(p.type) + "</h3>" +
          '<p class="meta"><span>' + I.bed + p.beds + " bed</span><span>" + I.area + p.sqft.toLocaleString("en-GB") + " sq ft</span></p>" +
          '<p class="home-card__price">' + H.price(p.price) + "<span>View" + I.arrow + "</span></p>" +
        "</div></a>";
    }
    function renderStrip(list) {
      stripEl.innerHTML = list.length
        ? list.map(homeCard).join("")
        : '<p class="strip-empty">No homes match that search right now — new plots are released regularly, so <a href="#contact">get in touch</a> to hear first.</p>';
      stripEl.scrollLeft = 0;
      updateArrows();
    }

    // Strip chips (by development)
    var chipsEl = document.getElementById("strip-chips");
    var chipDevs = current.filter(function (d) { return allAvail.some(function (x) { return x.d === d; }); });
    chipsEl.innerHTML = '<button type="button" class="chip" data-slug="" aria-pressed="true">All<b>' + allAvail.length + "</b></button>" +
      chipDevs.map(function (d) {
        var n = allAvail.filter(function (x) { return x.d === d; }).length;
        return '<button type="button" class="chip" data-slug="' + esc(d.slug) + '" aria-pressed="false">' + esc(d.name) + "<b>" + n + "</b></button>";
      }).join("");
    function setChip(slug) {
      chipsEl.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-slug") === slug)); });
    }
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      var slug = b.getAttribute("data-slug");
      setChip(slug);
      noteEl.hidden = true;
      renderStrip(allAvail.filter(function (x) { return !slug || x.d.slug === slug; }));
    });

    // Strip arrows
    var prevBtn = document.querySelector('[data-strip="-1"]'), nextBtn = document.querySelector('[data-strip="1"]');
    function updateArrows() {
      var max = stripEl.scrollWidth - stripEl.clientWidth - 2;
      prevBtn.disabled = stripEl.scrollLeft <= 2;
      nextBtn.disabled = stripEl.scrollLeft >= max;
    }
    [prevBtn, nextBtn].forEach(function (b) {
      b.addEventListener("click", function () {
        stripEl.scrollBy({ left: +b.getAttribute("data-strip") * stripEl.clientWidth * 0.8, behavior: H.reducedMotion ? "auto" : "smooth" });
      });
    });
    stripEl.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    renderStrip(allAvail);

    // Completed
    H.render("#done-grid", H.completed(), function (d) {
      return '<a class="done-card" data-reveal href="' + devUrl(d) + '">' +
        '<div class="done-card__media"><img src="' + H.img(d.hero) + '" alt="Completed homes at ' + esc(d.name) + '" loading="lazy"></div>' +
        '<div class="done-card__body">' + pill("done", "Completed " + (d.completed || "")) +
          "<h3>" + esc(d.name) + "</h3><p>" + esc(d.location) + "</p></div></a>";
    });

    // Stats
    H.render("#stats", C.stats || [], function (s) {
      return '<div class="stat" data-reveal><strong><span data-count="' + s.value + '" data-suffix="' + esc(s.suffix || "") + '">0</span></strong><span>' + esc(s.label) + "</span></div>";
    });

    /* ---------- Finder ---------- */
    var fDev = document.getElementById("f-dev"), fBeds = document.getElementById("f-beds"), fMax = document.getElementById("f-max");
    var fCount = document.getElementById("f-count"), fGo = document.getElementById("f-go"), fBreak = document.getElementById("f-breakdown");
    fDev.insertAdjacentHTML("beforeend", current.map(function (d) {
      return '<option value="' + esc(d.slug) + '">' + esc(d.name) + "</option>";
    }).join(""));

    function crit() { return { dev: fDev.value, beds: +fBeds.value, max: +fMax.value }; }
    function match(x, f, statuses) {
      return statuses.indexOf(x.p.status) > -1 &&
        (f.dev === "any" || x.d.slug === f.dev) &&
        x.p.beds >= f.beds && (!f.max || x.p.price <= f.max);
    }
    var allForSale = [];
    current.forEach(function (d) { d.plots.forEach(function (p) { if (forSale(p)) allForSale.push({ p: p, d: d }); }); });

    function describe(f) {
      var bits = [];
      if (f.beds) bits.push(f.beds + "+ bedrooms");
      if (f.max) bits.push("up to " + H.price(f.max));
      return bits.join(", ");
    }
    function query(f) {
      var q = "";
      if (f.beds) q += "&beds=" + f.beds;
      if (f.max) q += "&max=" + f.max;
      return q;
    }

    function updateFinder() {
      var f = crit();
      var now = allAvail.filter(function (x) { return match(x, f, ["available"]); });
      var soon = allForSale.filter(function (x) { return match(x, f, ["coming-soon"]); });
      var devs = [];
      now.concat(soon).forEach(function (x) { if (devs.indexOf(x.d) < 0) devs.push(x.d); });

      fCount.innerHTML = '<span class="count-bump"><strong>' + plural(now.length, "home") + "</strong> available now" +
        (soon.length ? " · " + soon.length + " coming soon" : "") + "</span>";

      fGo.removeAttribute("target");
      if (!now.length && !soon.length) {
        fGo.textContent = "Register your interest";
        fGo.href = mailto("Register interest — new homes", "Hi James,\n\nPlease let me know when a home matching this becomes available: " +
          (f.dev !== "any" ? H.get(f.dev).name + ", " : "") + (describe(f) || "any home") + ".\n\nThanks");
        fGo.dataset.mode = "mail";
      } else if (devs.length === 1) {
        fGo.textContent = "View homes at " + devs[0].name;
        fGo.href = devUrl(devs[0], query(f) + "#homes");
        fGo.dataset.mode = "dev";
      } else {
        fGo.textContent = "See all " + now.length + " matching homes";
        fGo.href = "#available";
        fGo.dataset.mode = "strip";
      }

      fBreak.innerHTML = devs.length > 1 ? devs.map(function (d) {
        var n = now.concat(soon).filter(function (x) { return x.d === d; }).length;
        return '<a class="mini-chip" href="' + devUrl(d, query(f) + "#homes") + '">' + esc(d.name) + " <b>" + n + "</b></a>";
      }).join("") : "";
      return now;
    }
    [fDev, fBeds, fMax].forEach(function (s) { s.addEventListener("change", updateFinder); });
    updateFinder();

    fGo.addEventListener("click", function () {
      if (fGo.dataset.mode !== "strip") return;
      var f = crit(), list = allAvail.filter(function (x) { return match(x, f, ["available"]); });
      setChip(null);
      renderStrip(list);
      var d = describe(f);
      noteEl.innerHTML = "Showing " + plural(list.length, "home") + " available now" + (d ? " with " + esc(d) : "") +
        '. <button type="button">Show all homes</button>';
      noteEl.hidden = false;
      noteEl.querySelector("button").addEventListener("click", function () {
        noteEl.hidden = true; setChip(""); renderStrip(allAvail);
      });
    });

    /* ---------- Contact form → mailto ---------- */
    var cDev = document.getElementById("c-dev");
    cDev.insertAdjacentHTML("beforeend", current.map(function (d) {
      return '<option value="' + esc(d.name) + '">' + esc(d.name) + "</option>";
    }).join(""));
    document.getElementById("contact-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("c-name");
      if (!name.value.trim()) { name.classList.add("is-invalid"); name.focus(); return; }
      name.classList.remove("is-invalid");
      var subj = "Website enquiry" + (cDev.value ? " — " + cDev.value : "");
      var body = document.getElementById("c-msg").value + "\n\n" + name.value.trim() +
        (document.getElementById("c-phone").value ? "\n" + document.getElementById("c-phone").value : "");
      location.href = mailto(subj, body);
    });
  }

  /* ======================================================================
     DEVELOPMENT PAGE
     ====================================================================== */
  function development() {
    var dev = H.page();
    var c = H.counts(dev), from = H.priceFrom(dev);
    var done = dev.stage === "completed";
    var $ = function (id) { return document.getElementById(id); };

    document.title = dev.name + ", " + dev.location + " | Hardwick Construction";

    // Hero
    var heroImg = $("d-hero-img");
    heroImg.src = H.img(dev.hero);
    heroImg.alt = "Homes at " + dev.name + ", " + dev.location;
    $("d-crumb").textContent = dev.name;
    var group = $("d-crumb-group");
    group.textContent = done ? "Completed developments" : "Current developments";
    group.href = done ? "index.html#completed" : "index.html#developments";
    $("d-loc").innerHTML = I.pin + esc(dev.location);
    $("d-name").textContent = dev.name;
    $("d-headline").textContent = dev.headline;
    $("d-chips").innerHTML = done
      ? pill("done", "Completed " + (dev.completed || "")) + pill("coming-soon", "All homes sold")
      : (c.available ? pill("available", c.available + " available now") : "") +
        (from ? pill("coming-soon", "From " + H.price(from)) : "") +
        pill("coming-soon", H.bedRange(dev) + " homes");

    // Enquiry links
    var generalMail = mailto("Enquiry — " + dev.name, "Hi James,\n\nI'm interested in " + dev.name + " (" + dev.location + "). Please could you get in touch.\n\nThanks");
    ["tabs-cta", "cta-email", "mobile-email"].forEach(function (id) { $(id).href = generalMail; });

    // Overview
    $("ov-title").textContent = dev.headline;
    $("d-desc").innerHTML = dev.description.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var facts = [["Location", dev.location.split(",")[0]], ["Postcode", dev.postcode]];
    if (done) facts.push(["Completed", dev.completed || "—"], ["Status", "All sold"]);
    else facts.push(["Homes", c.total], ["Bedrooms", H.bedRange(dev)]);
    $("d-facts").innerHTML = facts.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("");

    var card = $("avail-card");
    if (done) {
      card.innerHTML = '<div class="done-state-mini"><span class="done-state__icon" style="width:52px;height:52px">' + I.check + "</span>" +
        "<div><h3>Completed " + esc(dev.completed || "") + "</h3><p style=\"margin:0;color:var(--muted)\">Every home has been sold.</p></div></div>" +
        '<div class="avail-card__actions"><a class="btn btn--primary" href="index.html#developments">See homes for sale now</a>' +
        '<a class="btn btn--ghost" href="' + mailto("Upcoming developments") + '">Ask about upcoming sites</a></div>';
    } else {
      var nums = [["available", "Available now", true], ["reserved", "Reserved"], ["coming-soon", "Coming soon"], ["sold", "Sold"]];
      card.innerHTML = "<h3>Availability</h3><p>" + plural(c.total, "home") + " at " + esc(dev.name) + "</p>" +
        '<div class="avail-nums">' + nums.map(function (n) {
          return '<div class="avail-num' + (n[2] ? " avail-num--hl" : "") + '"><strong data-count="' + (c[n[0]] || 0) + '">0</strong><span>' + n[1] + "</span></div>";
        }).join("") + "</div>" + bar(dev) +
        '<div class="avail-card__price"><small>Prices from</small><strong>' + (from ? H.price(from) : "—") + "</strong></div>" +
        '<div class="avail-card__actions"><a class="btn btn--primary" href="#homes">View available homes</a>' +
        '<a class="btn btn--ghost" href="' + mailto("Book a viewing — " + dev.name) + '">' + I.mail + "Book a viewing</a></div>";
    }

    // Homes
    var grid = $("plot-grid"), table = $("plots-table");
    if (done) {
      $("tab-homes").textContent = "Homes";
      $("homes-eyebrow").textContent = "Homes";
      $("homes-title").textContent = "All homes sold";
      $("homes-summary").textContent = "";
      grid.className = "";
      grid.innerHTML = '<div class="done-state" data-reveal><span class="done-state__icon">' + I.check + "</span><div>" +
        "<h3>Completed " + esc(dev.completed || "") + " — all homes sold</h3>" +
        "<p>Every home at " + esc(dev.name) + " has now found its owners. Take a look at our current developments for homes available today, or ask us about upcoming sites.</p>" +
        '<div class="done-state__actions"><a class="btn btn--primary" href="index.html#developments">View current developments</a>' +
        '<a class="btn btn--ghost" href="' + mailto("Upcoming developments") + '">Register your interest</a></div></div></div>';
      table.remove();
    } else {
      $("homes-summary").innerHTML = "<strong>" + c.available + " available</strong> · " + c.reserved + " reserved · " +
        c["coming-soon"] + " coming soon · " + c.sold + " sold";

      var beds = +H.param("beds") || 0, max = +H.param("max") || 0;
      var saleable = dev.plots.filter(forSale).sort(function (a, b) {
        return (a.status === b.status ? 0 : a.status === "available" ? -1 : 1) || a.plot - b.plot;
      });
      var filtered = (beds || max) ? saleable.filter(function (p) { return p.beds >= beds && (!max || p.price <= max); }) : saleable;

      var plotCard = function (p) {
        var subj = "Enquiry: Plot " + p.plot + ", " + p.type + " — " + dev.name;
        var body = "Hi James,\n\nI'd like to find out more about Plot " + p.plot + " (" + p.type + ", " + p.beds + " bed, " + H.price(p.price) + ") at " + dev.name + ".\n\nThanks";
        return '<article class="plot-card" data-reveal>' +
          '<div class="plot-card__media"><img src="' + plotImg(p, dev) + '" alt="' + esc(p.type) + ' house type" loading="lazy">' +
            pill(p.status) + '<span class="home-card__plot">Plot ' + esc(p.plot) + "</span></div>" +
          '<div class="plot-card__body"><h3>' + esc(p.type) + "</h3>" +
            '<div class="specs"><div>' + I.bed + "<strong>" + p.beds + "</strong><span>Bedrooms</span></div>" +
              "<div>" + I.area + "<strong>" + p.sqft.toLocaleString("en-GB") + "</strong><span>Sq ft</span></div>" +
              "<div>" + I.tag + "<strong>" + esc(p.plot) + "</strong><span>Plot</span></div></div>" +
            '<div class="plot-card__foot"><div class="plot-card__price"><small>' + (p.status === "coming-soon" ? "Guide price" : "Price") + "</small><strong>" + H.price(p.price) + "</strong></div>" +
            '<a class="btn btn--primary btn--sm" href="' + mailto(subj, body) + '">' + I.mail + "Enquire</a></div>" +
          "</div></article>";
      };
      var renderPlots = function (list) {
        grid.innerHTML = list.length ? list.map(plotCard).join("")
          : '<p class="strip-empty">No homes are currently for sale here — new plots are released regularly, so <a href="' + generalMail + '">register your interest</a>.</p>';
        H.reveal();
      };
      renderPlots(filtered);

      if (beds || max) {
        var note = $("homes-note"), bits = [];
        if (beds) bits.push(beds + "+ bedrooms");
        if (max) bits.push("up to " + H.price(max));
        note.innerHTML = "Showing " + plural(filtered.length, "home") + " matching your search: " + esc(bits.join(", ")) +
          '. <button type="button">Show all ' + saleable.length + " homes</button>";
        note.hidden = false;
        note.querySelector("button").addEventListener("click", function () {
          note.hidden = true; renderPlots(saleable);
        });
      }

      table.innerHTML = '<div class="plots-table__head"><h3>All plots at ' + esc(dev.name) + "</h3>" + legend(dev) + "</div>" +
        '<table class="ptable"><caption class="sr-only">Every plot at ' + esc(dev.name) + ' with its status</caption><thead><tr><th scope="col">Plot</th><th scope="col">House type</th><th scope="col" class="col-beds">Beds</th>' +
        '<th scope="col" class="col-sqft">Sq ft</th><th scope="col">Price</th><th scope="col" class="col-status">Status</th></tr></thead><tbody>' +
        dev.plots.slice().sort(function (a, b) { return a.plot - b.plot; }).map(function (p) {
          var sold = p.status === "sold";
          return '<tr class="' + (sold ? "is-sold" : "") + '"><td class="num">' + esc(p.plot) + "</td><td>" + esc(p.type) + '<small class="ptable__sub">' + p.beds + " bed · " + p.sqft.toLocaleString("en-GB") + " sq ft</small>" + '</td><td class="num col-beds">' + p.beds +
            '</td><td class="num col-sqft">' + p.sqft.toLocaleString("en-GB") + '</td><td class="price num">' +
            (sold ? '<s aria-label="Sold">' + H.price(p.price) + "</s>" : H.price(p.price)) +
            '<span class="ptable__mstatus" aria-hidden="true">' + pill(p.status) + '</span></td><td class="col-status">' + pill(p.status) + "</td></tr>";
        }).join("") + "</tbody></table>";
    }

    // Specification
    H.render("#spec", dev.features, function (f) {
      return '<li data-reveal><span class="spec__check" aria-hidden="true">' + I.check + "</span><span>" + esc(f) + "</span></li>";
    });
    if (done) {
      $("spec-title").textContent = "At a glance";
      $("spec-aside").textContent = "A summary of the homes we built at " + dev.name + ".";
    }

    // Gallery
    var photos = [dev.hero].concat(dev.gallery || []);
    var gal = $("gallery-grid");
    if (photos.length === 3) gal.classList.add("gallery--3");
    gal.innerHTML = photos.map(function (f, i) {
      return '<button type="button" data-reveal data-idx="' + i + '" aria-label="Open photo ' + (i + 1) + " of " + photos.length + '">' +
        '<img src="' + H.img(f) + '" alt="' + esc(dev.name) + " — photo " + (i + 1) + '" loading="lazy"></button>';
    }).join("");
    lightbox(photos, gal, dev.name);

    // Location
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(dev.postcode);
    $("loc-title").textContent = dev.name + ", " + dev.location;
    $("loc-text").textContent = done
      ? dev.name + " sits in " + dev.location + ". Pop the postcode into your sat-nav to see the finished homes."
      : "Find " + dev.name + " in " + dev.location + ". Viewings are by appointment — call ahead and we'll meet you on site.";
    $("loc-postcode").textContent = dev.postcode;
    $("loc-pin-label").textContent = dev.name + " · " + dev.postcode;
    var dir = $("loc-directions");
    dir.href = maps;
    dir.setAttribute("aria-label", "Get directions to " + dev.postcode + " on Google Maps (opens in a new tab)");

    // Other developments
    var others = H.current().filter(function (d) { return d.slug !== dev.slug; });
    if (others.length) H.render("#others-grid", others.slice(0, 3), devCard);
    else $("others").remove();

    $("cta-title").textContent = done ? "Looking for a new home?" : "Interested in " + dev.name + "?";

    tabs();
  }

  /* ---------- Sticky tabs with sliding indicator + scroll-spy ---------- */
  function tabs() {
    var bar = document.getElementById("tabs");
    var nav = bar.querySelector(".tabs__nav");
    var links = Array.prototype.slice.call(bar.querySelectorAll("[data-tab]"));
    var ind = document.getElementById("tabs-indicator");
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var active = null;

    function move(a) {
      ind.style.width = (a.offsetWidth - 24) + "px";
      ind.style.transform = "translateX(" + (a.offsetLeft + 12) + "px)";
    }
    function setActive(i) {
      if (active === i) return;
      active = i;
      links.forEach(function (a, j) {
        a.classList.toggle("is-active", j === i);
        if (j === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      var a = links[i];
      move(a);
      // keep active tab visible on small screens
      var l = a.offsetLeft - 16, r = a.offsetLeft + a.offsetWidth + 16;
      if (l < nav.scrollLeft || r > nav.scrollLeft + nav.clientWidth) {
        nav.scrollTo({ left: Math.max(0, l - (nav.clientWidth - a.offsetWidth) / 2), behavior: H.reducedMotion ? "auto" : "smooth" });
      }
    }
    function spy() {
      var offset = bar.getBoundingClientRect().bottom + 80;
      var idx = 0;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= offset) idx = i; });
      // At the bottom of the page, light up the last tab
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        var last = sections[sections.length - 1];
        if (last && last.getBoundingClientRect().top < window.innerHeight) idx = sections.length - 1;
      }
      setActive(idx);
      bar.classList.toggle("is-stuck", bar.getBoundingClientRect().top <= parseFloat(getComputedStyle(bar).top) + 1);
    }
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; spy(); });
    }, { passive: true });
    window.addEventListener("resize", function () { if (active != null) move(links[active]); });
    links.forEach(function (a, i) { a.addEventListener("click", function () { setActive(i); }); });
    spy();
    // Fonts can change tab widths — re-measure once loaded.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (active != null) move(links[active]); });
  }

  /* ---------- Lightbox ---------- */
  function lightbox(photos, grid, name) {
    var box = document.getElementById("lightbox"), img = document.getElementById("lightbox-img");
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + photos.length) % photos.length;
      img.style.opacity = 0;
      setTimeout(function () {
        img.src = H.img(photos[idx]);
        img.alt = name + " — photo " + (idx + 1) + " of " + photos.length;
        img.style.opacity = 1;
      }, H.reducedMotion ? 0 : 150);
    }
    function open(i) {
      lastFocus = document.activeElement;
      box.hidden = false;
      show(i);
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { box.hidden = true; }, H.reducedMotion ? 0 : 250);
      if (lastFocus) lastFocus.focus();
    }
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-idx]");
      if (b) open(+b.getAttribute("data-idx"));
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { show(idx - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Boot ---------- */
  common();
  if (document.body.getAttribute("data-page") === "development") development();
  else home();
  H.reveal();
  H.counters();
})();

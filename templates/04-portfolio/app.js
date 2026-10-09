/*
 * Hardwick Construction — Template 04 "Portfolio"
 * All content comes from /assets/data/developments.js via the H helpers.
 */
(function () {
  "use strict";

  var C = H.company;
  var SLIDE_MS = 6000;

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function devUrl(dev) { return "development.html?site=" + encodeURIComponent(dev.slug); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function mailto(subject, body) {
    return "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) +
      (body ? "&body=" + encodeURIComponent(body) : "");
  }

  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4M11 8.5v5M8.5 11h5"/></svg>'
  };

  /* Status ribbon text for a development card. */
  function ribbon(dev) {
    if (dev.stage === "completed") {
      return { text: "Completed " + (dev.completed || ""), cls: "ribbon-done" };
    }
    var c = H.counts(dev);
    if (c.available) return { text: plural(c.available, "home", "homes") + " available", cls: "ribbon-live" };
    if (c["coming-soon"]) return { text: "Coming soon", cls: "ribbon-soon" };
    if (c.reserved) return { text: "All homes reserved", cls: "ribbon-soon" };
    return { text: "Sold out", cls: "ribbon-done" };
  }

  /* Short facts line for a card: beds + price for current, homes + beds for completed. */
  function cardMeta(dev) {
    if (dev.stage === "completed") {
      return dev.features.filter(function (f) { return !/^completed/i.test(f); }).slice(0, 2);
    }
    var out = [];
    if (dev.plots.length) out.push(H.bedRange(dev) + " homes");
    var from = H.priceFrom(dev);
    if (from) out.push("From " + H.price(from));
    return out;
  }

  function cardHTML(dev) {
    var r = ribbon(dev);
    return (
      '<article class="card" data-reveal>' +
        '<a class="card-link" href="' + devUrl(dev) + '">' +
          '<div class="card-media"><img src="' + H.img(dev.hero) + '" alt="" loading="lazy"></div>' +
          '<span class="ribbon ' + r.cls + '">' + H.esc(r.text) + "</span>" +
          '<div class="card-body">' +
            '<p class="card-loc">' + H.esc(dev.location) + "</p>" +
            '<h3 class="card-title">' + H.esc(dev.name) + "</h3>" +
            '<p class="card-meta">' + cardMeta(dev).map(function (m) { return "<span>" + H.esc(m) + "</span>"; }).join("") + "</p>" +
            '<span class="card-cta">View development ' + ICON.arrow + "</span>" +
          "</div>" +
        "</a>" +
      "</article>"
    );
  }

  /* ---------- Shared init ---------- */
  H.fillCompany();
  // Let the long email address break neatly after the @ on small screens
  $$('[data-company="email"]').forEach(function (el) {
    var parts = C.email.split("@");
    el.innerHTML = H.esc(parts[0]) + "@<wbr>" + H.esc(parts[1]);
  });
  H.navToggle();
  H.stickyHeader("[data-header]", 10);

  // Close the mobile menu with Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      var t = $("[data-nav-toggle]");
      if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
    }
  });

  if (document.body.classList.contains("page-home")) initHome();
  if (document.body.classList.contains("page-dev")) initDevelopment();

  H.reveal();
  H.counters();

  /* ======================================================================
     HOME
     ====================================================================== */
  function initHome() {
    initHero();
    initProjects();

    // About stats
    H.render("#stats", C.stats || [], function (s) {
      return '<div class="stat"><dt>' + H.esc(s.label) + '</dt><dd><span data-count="' + s.value +
        '" data-suffix="' + H.esc(s.suffix || "") + '">0</span></dd></div>';
    });

    initEnquiryForm();
  }

  /* ---------- Hero slideshow ---------- */
  function initHero() {
    var hero = $(".hero");
    var devs = H.current();
    if (!devs.length) devs = H.all().slice(0, 3);
    if (!hero || !devs.length) return;
    hero.style.setProperty("--slide-ms", SLIDE_MS + "ms");

    H.render("#hero-slides", devs, function (d, i) {
      var c = H.counts(d), from = H.priceFrom(d), meta = [];
      if (d.plots.length) meta.push(H.bedRange(d) + " homes");
      if (from) meta.push("From " + H.price(from));
      if (c.available) meta.push(plural(c.available, "home", "homes") + " available");
      return (
        '<div class="slide' + (i === 0 ? " is-active" : "") + '" role="group" aria-roledescription="slide" aria-label="' +
          (i + 1) + " of " + devs.length + ": " + H.esc(d.name) + '"' + (i === 0 ? "" : ' aria-hidden="true"') + ">" +
          '<img class="slide-img" src="' + H.img(d.hero) + '" alt="' + H.esc(d.name + ", " + d.location) + '"' +
            (i === 0 ? ' fetchpriority="high"' : "") + ">" +
          '<div class="slide-shade" aria-hidden="true"></div>' +
          '<div class="wrap slide-caption">' +
            '<p class="eyebrow">' + (d.stage === "current" ? "Now selling" : "Completed " + d.completed) + "</p>" +
            '<h2 class="slide-title">' + H.esc(d.name) + "</h2>" +
            '<p class="slide-loc">' + ICON.pin + H.esc(d.location) + "</p>" +
            '<p class="slide-meta">' + meta.map(function (m) { return "<span>" + H.esc(m) + "</span>"; }).join("") + "</p>" +
            '<a class="btn btn-ochre" href="' + devUrl(d) + '"' + (i === 0 ? "" : ' tabindex="-1"') + ">Explore " + H.esc(d.name) + " " + ICON.arrow + "</a>" +
          "</div>" +
        "</div>"
      );
    });

    H.render("#hero-dots", devs, function (d, i) {
      return '<button class="hero-dot' + (i === 0 ? " is-active" : "") + '" type="button" aria-label="Show ' +
        H.esc(d.name) + '"' + (i === 0 ? ' aria-current="true"' : "") + '><span class="fill"></span></button>';
    });

    var slides = $$(".slide", hero), dots = $$(".hero-dot", hero);
    var pauseBtn = $("#hero-pause"), idxEl = $("#hero-index");
    $("#hero-total").textContent = String(devs.length).padStart(2, "0");

    var idx = 0, timer = null, startedAt = 0, remaining = SLIDE_MS;
    var userPaused = H.reducedMotion, holdPaused = false;

    if (devs.length < 2) { $(".hero-controls", hero).hidden = true; return; }

    function isPaused() { return userPaused || holdPaused || document.hidden; }

    function schedule() {
      clearTimeout(timer);
      if (isPaused()) return;
      startedAt = Date.now();
      timer = setTimeout(function () { go(idx + 1); }, remaining);
    }

    function syncPauseState() {
      var p = isPaused();
      hero.classList.toggle("is-paused", p);
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      if (p) {
        if (timer) { clearTimeout(timer); timer = null; remaining = Math.max(400, remaining - (Date.now() - startedAt)); }
      } else if (!timer) {
        schedule();
      }
    }

    function go(n) {
      clearTimeout(timer); timer = null;
      var prev = idx;
      idx = (n + slides.length) % slides.length;
      if (prev !== idx) {
        slides[prev].classList.remove("is-active");
        slides[prev].setAttribute("aria-hidden", "true");
        $(".btn", slides[prev]).setAttribute("tabindex", "-1");
        slides[idx].classList.add("is-active");
        slides[idx].removeAttribute("aria-hidden");
        $(".btn", slides[idx]).removeAttribute("tabindex");
      }
      dots.forEach(function (d, i) {
        d.classList.remove("is-active");
        d.removeAttribute("aria-current");
        if (i === idx) {
          void d.offsetWidth; // restart the progress animation
          d.classList.add("is-active");
          d.setAttribute("aria-current", "true");
        }
      });
      idxEl.textContent = String(idx + 1).padStart(2, "0");
      remaining = SLIDE_MS;
      schedule();
    }

    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      syncPauseState();
    });

    // Hold the slideshow while keyboard users are inside the caption
    hero.addEventListener("focusin", function (e) {
      if (e.target.closest(".slide")) { holdPaused = true; syncPauseState(); }
    });
    hero.addEventListener("focusout", function () { holdPaused = false; syncPauseState(); });
    document.addEventListener("visibilitychange", syncPauseState);

    // Swipe on touch screens
    var sx = null;
    hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });

    syncPauseState();
    if (!userPaused) schedule();
  }

  /* ---------- Projects tabs (#current / #previous) ---------- */
  function initProjects() {
    var cur = H.current(), prev = H.completed();
    H.render("#cards-current", cur, cardHTML);
    H.render("#cards-previous", prev, cardHTML);
    $("#count-current").textContent = cur.length;
    $("#count-previous").textContent = prev.length;

    var tabs = $$('[role="tab"]');
    var ink = $(".tabs-ink");
    var section = $("#projects");
    var active = "current";
    var swapTimer = null;

    function panel(name) { return $("#panel-" + name); }
    function tab(name) { return $("#tab-" + name); }

    function moveInk() {
      var t = tab(active);
      if (!t || !ink) return;
      ink.style.width = t.offsetWidth + "px";
      ink.style.transform = "translateX(" + t.offsetLeft + "px)";
    }

    function replayCards(p) {
      var cards = $$(".card", p);
      cards.forEach(function (c) { c.classList.remove("is-in"); });
      void p.offsetWidth;
      requestAnimationFrame(function () {
        cards.forEach(function (c) { c.classList.add("is-in"); });
      });
    }

    function select(name, animate, markNav) {
      if (name !== "current" && name !== "previous") return;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === name;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
      });
      $$("[data-tab-link]").forEach(function (a) {
        a.classList.toggle("is-current", !!(markNav && a.getAttribute("data-tab-link") === name && a.closest(".nav")));
      });
      if (name === active) { moveInk(); return; }

      var oldP = panel(active), newP = panel(name);
      active = name;
      moveInk();
      clearTimeout(swapTimer);

      var show = function () {
        $$(".tab-panel").forEach(function (p) {
          if (p !== newP) { p.hidden = true; p.classList.remove("is-active", "is-shown"); }
        });
        newP.hidden = false;
        newP.classList.add("is-active");
        void newP.offsetWidth;
        newP.classList.add("is-shown");
        replayCards(newP);
      };

      if (animate && !H.reducedMotion) {
        oldP.classList.remove("is-shown");   // fade out…
        swapTimer = setTimeout(show, 280);   // …then fade the new panel in
      } else {
        show();
      }
    }

    function scrollToProjects(smooth) {
      var top = section.getBoundingClientRect().top + window.scrollY - (document.querySelector("[data-header]").offsetHeight) + 1;
      window.scrollTo({ top: Math.max(0, top), behavior: smooth && !H.reducedMotion ? "smooth" : "auto" });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        var name = t.getAttribute("data-tab");
        select(name, true, true);
        history.replaceState(null, "", "#" + name);
      });
      t.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (e.key === "Home") dir = -i; else if (e.key === "End") dir = tabs.length - 1 - i;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        next.click();
      });
    });

    // Nav / footer / intro links that point at a tab
    $$("[data-tab-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var name = a.getAttribute("data-tab-link");
        select(name, true, true);
        history.pushState(null, "", "#" + name);
        scrollToProjects(true);
      });
    });

    window.addEventListener("hashchange", function () {
      var h = location.hash.slice(1);
      if (h === "current" || h === "previous") { select(h, true, true); scrollToProjects(true); }
    });

    // Deep link on load (e.g. index.html#previous from a development page)
    var initial = location.hash.slice(1);
    if (initial === "current" || initial === "previous") {
      select(initial, false, true);
      requestAnimationFrame(function () { scrollToProjects(false); });
      window.addEventListener("load", function () { scrollToProjects(false); });
    } else {
      select("current", false);
    }

    moveInk();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
    window.addEventListener("resize", moveInk);
  }

  /* ---------- Enquiry form (mailto) ---------- */
  function initEnquiryForm() {
    var form = $("#enquiry-form");
    if (!form) return;
    form.setAttribute("action", "mailto:" + C.email);
    var select = $("#f-dev");
    var opts = H.current().map(function (d) {
      return '<option value="' + H.esc(d.name) + '">' + H.esc(d.name) + " — " + H.esc(d.location) + "</option>";
    });
    opts.push('<option value="General enquiry">General enquiry / future developments</option>');
    select.innerHTML = opts.join("");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (n) { return (form.elements[n].value || "").trim(); };
      var dev = v("development");
      var body = [
        "Development: " + dev,
        "",
        v("message") || "I would like more information, please.",
        "",
        "Name: " + v("name"),
        "Email: " + v("email"),
        v("phone") ? "Phone: " + v("phone") : ""
      ].join("\n");
      window.location.href = mailto("Website enquiry — " + dev, body);
    });
  }

  /* ======================================================================
     DEVELOPMENT PAGE
     ====================================================================== */
  function initDevelopment() {
    var dev = H.page();
    if (!dev) return;
    var done = dev.stage === "completed";
    var c = H.counts(dev);
    var from = H.priceFrom(dev);

    document.title = dev.name + ", " + dev.location + " — Hardwick Construction";
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dev.headline + ". " + (dev.summary || ""));

    /* Hero */
    var heroImg = $("#dev-hero-img");
    heroImg.src = H.img(dev.hero);
    heroImg.alt = dev.name + ", " + dev.location;
    $("#dev-name").textContent = dev.name;
    $("#dev-location").textContent = dev.location;
    $("#crumb-name").textContent = dev.name;
    var crumb = $("#crumb-stage");
    crumb.textContent = done ? "Previous projects" : "Current projects";
    crumb.href = "index.html#" + (done ? "previous" : "current");
    var r = ribbon(dev), rib = $("#dev-ribbon");
    rib.textContent = r.text;
    rib.classList.add(r.cls);

    /* Overview */
    $("#dev-headline").textContent = dev.headline;
    H.render("#dev-description", dev.description || [], function (p) { return "<p>" + H.esc(p) + "</p>"; });
    H.render("#dev-features", dev.features || [], function (f) { return "<li>" + ICON.check + "<span>" + H.esc(f) + "</span></li>"; });

    /* Project details sidebar */
    var findFeature = function (re) { return (dev.features || []).filter(function (f) { return re.test(f); })[0]; };
    var rows = [["Location", H.esc(dev.location)], ["Postcode", H.esc(dev.postcode)]];
    if (done) {
      var homes = findFeature(/^\d+\s+homes?$/i), beds = findFeature(/bedroom/i);
      if (homes) rows.push(["Homes", H.esc(homes)]);
      if (beds) rows.push(["Bedrooms", H.esc(beds)]);
      rows.push(["Price", "All sold"]);
      rows.push(["Status", "Completed " + H.esc(dev.completed || "")]);
    } else {
      rows.push(["Homes", plural(c.total, "home", "homes")]);
      rows.push(["Bedrooms", H.esc(H.bedRange(dev).replace(" bed", " bedrooms"))]);
      rows.push(["From", from ? '<span class="big">' + H.price(from) + "</span>" : "To be confirmed"]);
      rows.push(["Status", c.available ? "Now selling" : c["coming-soon"] ? "Coming soon" : "All reserved"]);
    }
    H.render("#dev-details", rows, function (row) {
      var big = row[1].indexOf('class="big"') > -1;
      return "<div><dt>" + row[0] + "</dt><dd" + (big ? ' class="big"' : "") + ">" + row[1].replace(/<\/?span[^>]*>/g, "") + "</dd></div>";
    });

    var order = ["available", "reserved", "coming-soon", "sold"];
    if (!done && c.total) {
      $("#dev-bar").innerHTML =
        '<div class="bar" role="img" aria-label="' + order.map(function (s) { return c[s] + " " + H.statusLabel(s).toLowerCase(); }).join(", ") + '">' +
          order.map(function (s) { return c[s] ? '<span class="sw-' + s + '" style="flex:' + c[s] + '"></span>' : ""; }).join("") +
        "</div>" +
        '<ul class="legend" aria-hidden="true">' +
          order.filter(function (s) { return c[s]; }).map(function (s) {
            return '<li><span class="sw sw-' + s + '"></span>' + c[s] + " " + H.statusLabel(s).toLowerCase() + "</li>";
          }).join("") +
        "</ul>";
    } else {
      $("#dev-bar").hidden = true;
    }

    var enquireHref = mailto("Enquiry — " + dev.name, "Hello James,\n\nI'm interested in " + dev.name + " (" + dev.location + "). Please could you send me more information.\n\nThanks,\n");
    $("#dev-actions").innerHTML = done
      ? '<a class="btn btn-navy" href="index.html#current">See current projects ' + ICON.arrow + "</a>" +
        '<a class="btn btn-outline" href="' + mailto("Register interest — future developments") + '">Register your interest</a>'
      : '<a class="btn btn-navy" href="#homes">View homes for sale ' + ICON.arrow + "</a>" +
        '<a class="btn btn-outline" href="' + enquireHref + '">Enquire about ' + H.esc(dev.name) + "</a>";

    /* Gallery + lightbox */
    var images = [dev.hero].concat(dev.gallery || []).filter(function (f, i, a) { return a.indexOf(f) === i; });
    var captions = images.map(function (f) { return dev.name + " — " + roomName(f); });
    var gallery = $("#gallery");
    gallery.setAttribute("data-items", images.length);
    H.render(gallery, images, function (f, i) {
      return '<button class="g-item" type="button" data-index="' + i + '" data-reveal aria-label="Enlarge image: ' + H.esc(captions[i]) + '">' +
        '<img src="' + H.img(f) + '" alt="' + H.esc(captions[i]) + '" loading="lazy">' +
        '<span class="g-label">' + H.esc(roomName(f)) + "</span>" +
        '<span class="g-zoom" aria-hidden="true">' + ICON.zoom + "</span>" +
      "</button>";
    });
    gallery.insertAdjacentHTML("afterend", '<p class="gallery-note">Images are representative of the specification and may show a different house type.</p>');
    initLightbox(images, captions);

    /* Availability */
    renderAvailability(dev, c, done);

    /* Enquiry CTA */
    $("#cta-title").textContent = done ? "Looking for a home like these?" : "Interested in " + dev.name + "?";
    $("#cta-text").textContent = done
      ? "Every home at " + dev.name + " has been sold, but we have new homes available now. Call James or drop us an email and we'll talk you through what's coming up."
      : "Call James to arrange a viewing, reserve a plot or ask about part-exchange — or send us an email and we'll get straight back to you.";
    $("#cta-loc").textContent = dev.location + ", " + dev.postcode;
    $("#cta-map").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(dev.postcode);
    $("#cta-map").setAttribute("aria-label", "View " + dev.postcode + " on Google Maps (opens in a new tab)");
    $("#cta-email").href = enquireHref;

    /* Other projects carousel */
    var others = H.current().concat(H.completed()).filter(function (d) { return d.slug !== dev.slug; });
    H.render("#others", others, cardHTML);
    initCarousel();
  }

  function roomName(file) {
    var map = [
      [/kitchen/, "Kitchen"], [/living/, "Living room"], [/bedroom/, "Bedroom"],
      [/bathroom/, "Bathroom"], [/garden/, "Exterior & garden"], [/^ext-/, "Exterior"], [/build/, "Construction"]
    ];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(file)) return map[i][1];
    return "Photo";
  }

  function renderAvailability(dev, c, done) {
    var body = $("#homes-body");
    if (done || !dev.plots.length) {
      $("#homes-title").textContent = "Homes at " + dev.name;
      $("#homes-summary").hidden = true;
      body.innerHTML =
        '<div class="completed-state">' +
          '<span class="done-icon" aria-hidden="true">' + ICON.check + "</span>" +
          "<div>" +
            "<h3>" + (dev.completed ? "Completed " + H.esc(dev.completed) + " — all homes sold" : "All homes sold") + "</h3>" +
            "<p>Every home at " + H.esc(dev.name) + " has now been sold and is lived in. Take a look at our current projects for homes available now, " +
            "or register your interest to hear about future developments first.</p>" +
            '<div class="completed-actions">' +
              '<a class="btn btn-navy" href="index.html#current">View current projects ' + ICON.arrow + "</a>" +
              '<a class="btn btn-outline" href="' + mailto("Register interest — future developments") + '">Register your interest</a>' +
            "</div>" +
          "</div>" +
        "</div>";
      return;
    }

    var order = ["available", "reserved", "coming-soon", "sold"];
    H.render("#homes-summary", order.filter(function (s) { return c[s]; }), function (s) {
      return '<li><span class="sw sw-' + s + '" aria-hidden="true"></span><strong>' + c[s] + "</strong> " + H.statusLabel(s) + "</li>";
    });

    var plots = dev.plots.slice().sort(function (a, b) { return a.plot - b.plot; });
    body.innerHTML =
      '<div class="table-wrap"><table class="plots">' +
        '<caption class="sr-only">Homes at ' + H.esc(dev.name) + ": plot, house type, bedrooms, size, price and status</caption>" +
        '<thead><tr><th scope="col">Plot</th><th scope="col">House type</th><th scope="col">Bedrooms</th>' +
        '<th scope="col">Size</th><th scope="col">Price</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Enquire</span></th></tr></thead>' +
        "<tbody>" +
          plots.map(function (p) {
            var sold = p.status === "sold";
            var price = sold
              ? '<s><span class="sr-only">Sold, was </span>' + H.price(p.price) + "</s>"
              : H.price(p.price);
            var act = (p.status === "available" || p.status === "coming-soon" || p.status === "reserved")
              ? '<a class="enq-link" href="' + mailto("Plot " + p.plot + ", " + dev.name, "Hello James,\n\nI'm interested in plot " + p.plot + " (" + p.type + ") at " + dev.name + ". Please could you send me more information.\n\nThanks,\n") + '">' +
                  (p.status === "reserved" ? "Join waiting list" : "Enquire") + "</a>"
              : "";
            return '<tr class="is-' + p.status + '">' +
              '<td class="c-plot"><span class="plot-word">Plot </span>' + p.plot + "</td>" +
              '<td class="c-type">' + H.esc(p.type) + "</td>" +
              '<td class="c-beds" data-label="Bedrooms">' + p.beds + " bed</td>" +
              '<td class="c-size" data-label="Size">' + p.sqft.toLocaleString("en-GB") + " sq ft</td>" +
              '<td class="c-price" data-label="Price">' + price + "</td>" +
              '<td class="c-status"><span class="badge badge-' + p.status + '">' + H.statusLabel(p.status) + "</span></td>" +
              '<td class="c-act">' + act + "</td>" +
            "</tr>";
          }).join("") +
        "</tbody>" +
      "</table></div>" +
      '<p class="table-note">Prices and availability correct at time of publishing. Call ' + H.esc(C.phone) + " for the latest information.</p>";
  }

  /* ---------- Lightbox ---------- */
  function initLightbox(images, captions) {
    var lb = $("#lightbox"), img = $("#lb-img"), cap = $("#lb-caption"), count = $("#lb-count");
    var closeBtn = $(".lb-close", lb), prevBtn = $("#lb-prev"), nextBtn = $("#lb-next");
    var idx = 0, lastFocus = null, closeTimer = null, swapTimer = null;
    var multi = images.length > 1;
    prevBtn.hidden = nextBtn.hidden = !multi;

    function show(i, instant) {
      idx = (i + images.length) % images.length;
      clearTimeout(swapTimer);
      var apply = function () {
        img.classList.remove("is-loaded");
        img.onload = function () { requestAnimationFrame(function () { img.classList.add("is-loaded"); }); };
        img.src = H.img(images[idx]);
        img.alt = captions[idx];
        if (img.complete && img.naturalWidth) img.onload();
        cap.textContent = captions[idx];
        count.textContent = (idx + 1) + " / " + images.length;
      };
      if (instant || H.reducedMotion) apply();
      else { img.classList.remove("is-loaded"); swapTimer = setTimeout(apply, 260); }
    }

    function open(i) {
      clearTimeout(closeTimer);
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.classList.add("lb-lock");
      show(i, true);
      void lb.offsetWidth;
      lb.classList.add("is-open");
      closeBtn.focus();
    }

    function close() {
      lb.classList.remove("is-open");
      document.body.classList.remove("lb-lock");
      closeTimer = setTimeout(function () { lb.hidden = true; }, H.reducedMotion ? 0 : 400);
      if (lastFocus) lastFocus.focus();
    }

    $$(".g-item").forEach(function (b) {
      b.addEventListener("click", function () { open(+b.getAttribute("data-index")); });
    });
    $$("[data-lb-close]", lb).forEach(function (el) { el.addEventListener("click", close); });
    prevBtn.addEventListener("click", function () { show(idx - 1); });
    nextBtn.addEventListener("click", function () { show(idx + 1); });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden || !lb.classList.contains("is-open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" && multi) { e.preventDefault(); show(idx + 1); }
      else if (e.key === "ArrowLeft" && multi) { e.preventDefault(); show(idx - 1); }
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var at = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // Swipe between images on touch screens
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx == null || !multi) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ---------- Other projects carousel ---------- */
  function initCarousel() {
    var track = $("#others"), prev = $("#others-prev"), next = $("#others-next");
    if (!track) return;
    function step() {
      var card = $(".card", track);
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      $(".carousel-nav").hidden = max <= 0;
    }
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: H.reducedMotion ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: H.reducedMotion ? "auto" : "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
  }
})();

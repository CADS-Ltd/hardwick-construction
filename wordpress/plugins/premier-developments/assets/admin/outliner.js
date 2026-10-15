/*
 * Site plan outliner (development edit screen).
 * Reads the site plan image and plot rows from the ACF fields on the page and
 * writes each plot's outline ("x,y x,y …" in % of the image) into its row.
 */
(function () {
  "use strict";

  var box = document.querySelector("[data-premier-outliner]");
  if (!box) return;

  var KEY_IMAGE = "field_premier_dev_site_plan";
  var KEY_PLOTS = "field_premier_dev_plots";
  var KEY_PLOT_NO = "field_premier_plot_number";
  var KEY_OUTLINE = "field_premier_plot_outline";
  var KEY_STATUS = "field_premier_plot_status";

  var img = box.querySelector(".po-img");
  var svg = box.querySelector(".po-svg");
  var canvas = box.querySelector(".po-canvas");
  var list = box.querySelector(".po-list");
  var status = box.querySelector(".po-status");
  var btnUndo = box.querySelector(".po-undo");
  var btnCancel = box.querySelector(".po-cancel");
  var btnFinish = box.querySelector(".po-finish");
  var empty = box.querySelector(".po-empty");
  var layout = box.querySelector(".po-layout");

  var drawing = null; // { row, points: [[x,y]...] }

  function field(key, scope) {
    return (scope || document).querySelector('.acf-field[data-key="' + key + '"]');
  }
  function rows() {
    var rep = field(KEY_PLOTS);
    if (!rep) return [];
    return Array.prototype.slice.call(rep.querySelectorAll(".acf-row")).filter(function (r) {
      return !r.classList.contains("acf-clone") && r.closest('.acf-field[data-key="' + KEY_PLOTS + '"]') === rep;
    });
  }
  function rowInput(row, key) {
    var f = field(key, row);
    return f ? f.querySelector("input, select") : null;
  }
  function parse(s) {
    return String(s || "").trim().split(/\s+/).map(function (pair) {
      var m = pair.split(",");
      return m.length === 2 ? [parseFloat(m[0]), parseFloat(m[1])] : null;
    }).filter(function (p) { return p && !isNaN(p[0]) && !isNaN(p[1]); });
  }
  function fmt(points) {
    return points.map(function (p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" ");
  }

  /* --- Image --- */
  function syncImage() {
    var f = field(KEY_IMAGE);
    var preview = f && f.querySelector(".image-wrap img, .acf-image-uploader img");
    var src = preview && preview.getAttribute("src");
    var has = f && f.querySelector('input[type="hidden"]') && f.querySelector('input[type="hidden"]').value;
    if (has && src) {
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      empty.hidden = true;
      layout.hidden = false;
    } else {
      empty.hidden = false;
      layout.hidden = true;
    }
  }

  /* --- Plot list --- */
  function render() {
    syncImage();
    var html = "";
    var shapes = "";
    rows().forEach(function (row, i) {
      var no = rowInput(row, KEY_PLOT_NO);
      var out = rowInput(row, KEY_OUTLINE);
      var st = rowInput(row, KEY_STATUS);
      var label = no && no.value ? "Plot " + no.value : "Row " + (i + 1) + " (no plot number yet)";
      var pts = out ? parse(out.value) : [];
      var done = pts.length >= 3;
      var active = drawing && drawing.row === row;
      html += '<li class="' + (done ? "is-done" : "") + (active ? " is-active" : "") + '" data-i="' + i + '">' +
        '<span class="po-name">' + label.replace(/</g, "&lt;") + "</span>" +
        '<span class="po-state">' + (done ? "Outlined" : "Not outlined") + "</span>" +
        '<button type="button" class="button button-small po-draw">' + (done ? "Redraw" : "Draw") + "</button>" +
        (done ? '<button type="button" class="button-link po-clear">Clear</button>' : "") +
        "</li>";
      if (done && !active) {
        shapes += '<polygon class="po-shape is-' + (st ? st.value : "available") + '" points="' + fmt(pts) + '"></polygon>';
        var cx = pts.reduce(function (s, p) { return s + p[0]; }, 0) / pts.length;
        var cy = pts.reduce(function (s, p) { return s + p[1]; }, 0) / pts.length;
        shapes += '<text class="po-label" x="' + cx.toFixed(2) + '" y="' + cy.toFixed(2) + '">' + (no && no.value ? no.value : "?") + "</text>";
      }
    });
    if (drawing) {
      var p = drawing.points;
      if (p.length) {
        shapes += '<polyline class="po-draft" points="' + fmt(p) + '"></polyline>';
        p.forEach(function (pt, k) {
          shapes += '<circle class="po-dot' + (k === 0 ? " is-first" : "") + '" cx="' + pt[0].toFixed(2) + '" cy="' + pt[1].toFixed(2) + '" r="0.8"></circle>';
        });
      }
    }
    list.innerHTML = html || "<li class=\"po-none\">Add plots in the Plots table above, then draw them here.</li>";
    svg.innerHTML = shapes;
    btnUndo.disabled = !drawing || !drawing.points.length;
    btnCancel.disabled = !drawing;
    btnFinish.disabled = !drawing || drawing.points.length < 3;
    canvas.classList.toggle("is-drawing", !!drawing);
  }

  list.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-i]");
    if (!li) return;
    var row = rows()[+li.getAttribute("data-i")];
    if (!row) return;
    if (e.target.closest(".po-draw")) {
      drawing = { row: row, points: [] };
      var no = rowInput(row, KEY_PLOT_NO);
      status.textContent = "Drawing " + (no && no.value ? "plot " + no.value : "this plot") + ": click each corner of the house, then click the first point to finish.";
      render();
      canvas.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (e.target.closest(".po-clear")) {
      setOutline(row, "");
      render();
    }
  });

  function setOutline(row, value) {
    var input = rowInput(row, KEY_OUTLINE);
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function finish() {
    if (!drawing || drawing.points.length < 3) return;
    setOutline(drawing.row, fmt(drawing.points));
    var no = rowInput(drawing.row, KEY_PLOT_NO);
    status.textContent = (no && no.value ? "Plot " + no.value : "Plot") + " outlined. Remember to update the development to save.";
    drawing = null;
    render();
  }

  canvas.addEventListener("click", function (e) {
    if (!drawing) return;
    var r = img.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    var first = drawing.points[0];
    // Clicking near the first point closes the shape
    if (first && drawing.points.length >= 3) {
      var dx = ((first[0] - x) / 100) * r.width, dy = ((first[1] - y) / 100) * r.height;
      if (Math.sqrt(dx * dx + dy * dy) < 12) { finish(); return; }
    }
    drawing.points.push([x, y]);
    render();
  });

  btnUndo.addEventListener("click", function () { if (drawing) { drawing.points.pop(); render(); } });
  btnCancel.addEventListener("click", function () { drawing = null; status.textContent = "Choose a plot to draw."; render(); });
  btnFinish.addEventListener("click", finish);
  document.addEventListener("keydown", function (e) {
    if (!drawing) return;
    if (e.key === "Escape") { drawing = null; status.textContent = "Choose a plot to draw."; render(); }
    if (e.key === "Enter" && document.activeElement === document.body) { e.preventDefault(); finish(); }
  });

  // Keep in step with the ACF fields as plots are added, renumbered or re-ordered
  var timer;
  function soon() { clearTimeout(timer); timer = setTimeout(render, 150); }
  var root = document.getElementById("poststuff") || document.body;
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (!box.contains(muts[i].target)) { soon(); return; }
    }
  }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "value"] });
  root.addEventListener("input", function (e) { if (!box.contains(e.target)) soon(); });
  root.addEventListener("change", function (e) { if (!box.contains(e.target)) soon(); });

  render();
})();

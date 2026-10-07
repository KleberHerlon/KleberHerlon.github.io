/* =====================================================================
   Motor compartilhado dos dashboards Power BI do portfólio
   assets/pbi/pbi.js

   Cada relatório declara um objeto global `PBI_REPORT` com:
     - data:      URL do data.json anonimizado
     - filters:   [{ key, label, type:"select"|"chips" }]
     - kpis:      [{ lbl, val(rows), sub(rows), tone, bar:{ pct(rows), tone } }]
     - charts:    { id: { kind, data(rows), fmt, ... } }
     - table:     { columns, pageSize, file }

   Gráficos são ligados via <canvas data-chart="id">.
   Dados 100% fictícios — ver rodapé/footer de cada página.
   ===================================================================== */
(function () {
  "use strict";

  var ROWS = [];
  var CFG = null;
  var SEL = {};        // key -> array de valores selecionados
  var PAGE = 1;
  var SORT = { k: null, a: 1 };
  var CHARTS = {};
  if (typeof window !== "undefined") window.PBI_CHARTS = CHARTS;
  var CHART_JS_OK = true;
  var TABLE_Q = "";

  var PALETTES = {
    petro: ["#118dff", "#744ec2", "#f2c811", "#0f6cbd", "#1aab40",
            "#d64550", "#2415d1", "#8a8886", "#f2a900", "#005a8c"],
    light: ["#118dff", "#744ec2", "#f2c811", "#1aab40", "#d64550",
            "#f2a900", "#005a8c", "#8a8886", "#2415d1", "#b1b3b5"],
    navy:  ["#4ea8ff", "#2ee6c5", "#ffd166", "#ff6b81", "#a78bfa",
            "#7bed9f", "#4ea8ff", "#f2a900", "#744ec2", "#1aab40"]
  };

  /* ---------------- formatação (pt-BR) ---------------- */

  function num(v, d) {
    d = d == null ? 2 : d;
    var n = Number(v);
    if (!isFinite(n)) n = 0;
    return n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function pct(v, d) { d = d == null ? 1 : d; return num(v, d) + "%"; }
  function fmtVal(v, kind) {
    if (v == null) return "—";
    if (kind === "pct") return pct(Number(v), 1);
    if (kind === "num") return num(Number(v), 1);
    if (kind === "num2") return num(Number(v), 2);
    if (kind === "int") return num(Number(v), 0);
    return String(v);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function palette() {
    var t = document.body.getAttribute("data-theme") || "light";
    return PALETTES[t] || PALETTES.light;
  }
  function agg(rows, key) {
    var s = 0;
    for (var i = 0; i < rows.length; i++) s += Number(rows[i][key]) || 0;
    return s;
  }
  function countBy(rows, key) {
    var m = {};
    for (var i = 0; i < rows.length; i++) {
      var v = String(rows[i][key]);
      m[v] = (m[v] || 0) + 1;
    }
    return m;
  }
  function sumBy(rows, key, by) {
    var m = {};
    for (var i = 0; i < rows.length; i++) {
      var v = String(rows[i][by]);
      m[v] = (m[v] || 0) + (Number(rows[i][key]) || 0);
    }
    return m;
  }
  function sortedKeys(m, numeric) {
    return Object.keys(m).sort(numeric
      ? function (a, b) { return m[b] - m[a]; }
      : function (a, b) { return a.localeCompare(b, "pt-BR"); });
  }

  /* ---------------- filtros (slicers) ---------------- */

  function uniq(key, order) {
    var seen = {}, out = [];
    for (var i = 0; i < ROWS.length; i++) {
      var v = String(ROWS[i][key]);
      if (!(v in seen)) { seen[v] = 1; out.push(v); }
    }
    out.sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
    if (order && order.length) {
      var o = order.map(String);
      out = o.filter(function (v) { return seen[v]; })
             .concat(out.filter(function (v) { return o.indexOf(v) === -1; }));
    }
    return out;
  }

  function selected(key) { return SEL[key] || []; }

  function isActive(key) { return selected(key).length > 0; }

  function filtrar() {
    var filters = CFG.filters || [];
    return ROWS.filter(function (r) {
      for (var i = 0; i < filters.length; i++) {
        var k = filters[i].key;
        var sel = selected(k);
        if (sel.length && sel.indexOf(String(r[k])) === -1) return false;
      }
      return true;
    });
  }

  function buildSlicers() {
    var host = document.getElementById("slicers");
    if (!host) return;
    host.innerHTML = "";
    (CFG.filters || []).forEach(function (f) {
      var vals = uniq(f.key, f.order);
      var wrap = document.createElement("div");
      wrap.className = "slicer";
      wrap.dataset.key = f.key;
      if (f.type === "chips") {
        wrap.classList.add("chips-mode");
        wrap.innerHTML =
          "<label>" + esc(f.label) + "</label>" +
          '<div class="chipset">' +
          '<span class="chip on" data-v="">Todos</span>' +
          vals.map(function (v) {
            return '<span class="chip" data-v="' + esc(v) + '">' + esc(v) + "</span>";
          }).join("") +
          "</div>";
        wrap.querySelector(".chipset").addEventListener("click", function (e) {
          var c = e.target.closest(".chip"); if (!c) return;
          var v = c.dataset.v;
          if (v === "") SEL[f.key] = [];
          else {
            var arr = selected(f.key).slice();
            var i = arr.indexOf(v);
            if (i === -1) arr.push(v); else arr.splice(i, 1);
            SEL[f.key] = arr;
          }
          syncChips(f.key);
          PAGE = 1;
          update();
        });
      } else {
        wrap.innerHTML =
          "<label>" + esc(f.label) + "</label>" +
          '<button class="sel" type="button"><span class="txt">Todos</span><span class="caret">▼</span></button>' +
          '<div class="menu">' +
          '<div class="search"><input type="search" placeholder="Pesquisar…" aria-label="Pesquisar em ' + esc(f.label) + '"></div>' +
          '<div class="opts"></div>' +
          '<div class="none" style="display:none">Nenhum item</div>' +
          '<div class="foot"><button type="button" data-a="all">Marcar tudo</button><button type="button" data-a="none">Limpar</button></div>' +
          "</div>";
        var optsHost = wrap.querySelector(".opts");
        vals.forEach(function (v) {
          var o = document.createElement("div");
          o.className = "opt";
          o.dataset.v = v;
          o.innerHTML = '<input type="checkbox" tabindex="-1"><span class="lb">' + esc(v) + '</span><span class="tick">✓</span>';
          optsHost.appendChild(o);
        });
        optsHost.addEventListener("click", function (e) {
          var o = e.target.closest(".opt"); if (!o) return;
          var v = o.dataset.v;
          var arr = selected(f.key).slice();
          var i = arr.indexOf(v);
          if (i === -1) arr.push(v); else arr.splice(i, 1);
          SEL[f.key] = arr;
          syncSelect(f.key);
          PAGE = 1;
          update();
        });
        wrap.querySelector(".foot").addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b) return;
          SEL[f.key] = b.dataset.a === "all" ? uniq(f.key, f.order) : [];
          syncSelect(f.key);
          PAGE = 1;
          update();
        });
        wrap.querySelector(".sel").addEventListener("click", function (e) {
          e.stopPropagation();
          var open = wrap.classList.contains("open");
          closeMenus();
          if (!open) wrap.classList.add("open");
        });
        wrap.querySelector(".search input").addEventListener("input", function (e) {
          var q = e.target.value.toLowerCase();
          var n = 0;
          optsHost.querySelectorAll(".opt").forEach(function (o) {
            var show = o.dataset.v.toLowerCase().indexOf(q) !== -1;
            o.style.display = show ? "" : "none";
            if (show) n++;
          });
          wrap.querySelector(".none").style.display = n ? "none" : "block";
        });
        wrap.querySelector(".menu").addEventListener("click", function (e) { e.stopPropagation(); });
      }
      host.appendChild(wrap);
    });
    document.addEventListener("click", closeMenus);
  }

  function closeMenus() {
    document.querySelectorAll(".slicer.open").forEach(function (s) { s.classList.remove("open"); });
  }

  function syncSelect(key) {
    var wrap = document.querySelector('.slicer[data-key="' + key + '"]');
    if (!wrap) return;
    var sel = selected(key);
    var all = uniq(key, (function () {
      var f = (CFG.filters || []).filter(function (x) { return x.key === key; })[0];
      return f ? f.order : null;
    })());
    wrap.querySelectorAll(".opt").forEach(function (o) {
      var on = sel.length === 0 || sel.indexOf(o.dataset.v) !== -1;
      o.classList.toggle("on", on);
      o.querySelector("input").checked = on;
    });
    var txt = wrap.querySelector(".txt");
    if (!sel.length) txt.textContent = "Todos";
    else if (sel.length === 1) txt.textContent = sel[0];
    else txt.textContent = sel.length + " de " + all.length;
    wrap.classList.toggle("has-sel", sel.length > 0);
  }

  function syncChips(key) {
    var wrap = document.querySelector('.slicer[data-key="' + key + '"]');
    if (!wrap) return;
    var sel = selected(key);
    wrap.querySelectorAll(".chip").forEach(function (c) {
      var v = c.dataset.v;
      c.classList.toggle("on", v === "" ? sel.length === 0 : sel.indexOf(v) !== -1);
    });
  }

  function syncAll() {
    (CFG.filters || []).forEach(function (f) {
      if (f.type === "chips") syncChips(f.key); else syncSelect(f.key);
    });
  }

  function renderSummary(rows) {
    var el = document.getElementById("fsum");
    if (!el) return;
    var parts = [];
    (CFG.filters || []).forEach(function (f) {
      var sel = selected(f.key);
      if (!sel.length) return;
      var label = sel.length === 1 ? sel[0] : sel.length + " valores";
      parts.push('<span class="fx">' + esc(f.label) + ": <b>" + esc(label) +
        '</b><button type="button" data-k="' + esc(f.key) + '" title="Remover filtro" aria-label="Remover filtro">×</button></span>');
    });
    var note = parts.length
      ? parts.join("")
      : '<span>Nenhum filtro ativo — <b>' + rows.length + "</b> de <b>" + ROWS.length + "</b> registros</span>";
    el.innerHTML = note;
    el.querySelectorAll(".fx button").forEach(function (b) {
      b.addEventListener("click", function () {
        SEL[b.dataset.k] = [];
        syncAll(); PAGE = 1; update();
      });
    });
  }

  /* ---------------- KPIs ---------------- */

  function renderKPIs(rows) {
    var host = document.getElementById("kpis");
    if (!host || !CFG.kpis) return;
    host.innerHTML = CFG.kpis.map(function (k) {
      var bar = "";
      if (k.bar) {
        var p = Math.max(0, Math.min(100, Number(k.bar.pct(rows)) || 0));
        bar = '<div class="bar"><i class="' + (k.bar.tone || "") + '" style="width:' + p + '%"></i></div>';
      }
      return '<div class="viz kpi"><div class="lbl">' + esc(k.lbl) + "</div>" +
        '<div class="val ' + (k.tone || "") + '">' + esc(k.val(rows)) + "</div>" +
        '<div class="sub">' + esc(k.sub ? k.sub(rows) : "") + "</div>" + bar + "</div>";
    }).join("");
  }

  /* ---------------- gráficos ---------------- */

  function chartDefaults(fmtKind) {
    var grid = cssVar("--pbi-grid") || "rgba(0,0,0,.08)";
    var axis = cssVar("--pbi-axis") || "#605e5c";
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: axis, boxWidth: 11, boxHeight: 11, usePointStyle: true,
                    pointStyle: "rectRounded", font: { size: 11.5, weight: "600" } }
        },
        tooltip: {
          backgroundColor: cssVar("--pbi-tipbg") || "#252423",
          titleColor: cssVar("--pbi-tipfg") || "#ffffff",
          bodyColor: cssVar("--pbi-tipfg") || "#ffffff",
          padding: 10, cornerRadius: 4, borderWidth: 0,
          callbacks: {
            label: function (c) {
              var v = c.parsed.y != null ? c.parsed.y : c.parsed.x != null ? c.parsed.x : c.parsed;
              if (typeof v === "object" && v !== null) v = c.parsed;
              var s = fmtVal(v, fmtKind);
              var lbl = c.dataset && c.dataset.label ? c.dataset.label + ": " : (c.label ? c.label + ": " : "");
              return " " + lbl + s;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: grid }, ticks: { color: axis, font: { size: 11 }, maxRotation: 60, minRotation: 0 } },
        y: { beginAtZero: true, grid: { color: grid },
             ticks: { color: axis, font: { size: 11 },
               callback: function (v) { return fmtVal(v, fmtKind === "pct" ? "pct" : "int"); } } }
      }
    };
  }

  function showEmpty(id, msg) {
    var el = document.querySelector('[data-chart="' + id + '"]');
    if (!el) return;
    var box = el.closest(".chart-box") || el.parentElement;
    el.style.display = "none";
    if (box && !box.querySelector(".chart-empty")) {
      var d = document.createElement("div");
      d.className = "chart-empty";
      d.innerHTML = '<span class="big">📊</span><span>' + esc(msg || "Gráfico indisponível.") + "</span>";
      box.appendChild(d);
    }
  }

  function destroyChart(id) {
    if (CHARTS[id]) { try { CHARTS[id].destroy(); } catch (e) {} CHARTS[id] = null; }
  }

  function renderCharts(rows) {
    var charts = CFG.charts || {};
    Object.keys(charts).forEach(function (id) {
      var spec = charts[id];
      var el = document.querySelector('[data-chart="' + id + '"]');
      if (!el) return;
      if (!window.Chart) {
        showEmpty(id, "Biblioteca de gráficos não carregada (CDN bloqueado). Filtros, KPIs e tabela continuam funcionando.");
        return;
      }
      var box = el.closest(".chart-box");
      if (box) { var fe = box.querySelector(".chart-empty"); if (fe) fe.remove(); }
      el.style.display = "";
      var d;
      try { d = spec.data(rows); } catch (e) { showEmpty(id, "Erro ao calcular o gráfico: " + e.message); return; }
      destroyChart(id);
      if (!d || !d.labels || !d.labels.length) {
        el.style.display = "none";
        if (box && !box.querySelector(".chart-empty")) {
          var n = document.createElement("div");
          n.className = "chart-empty";
          n.innerHTML = '<span class="big">∅</span><span>Sem dados para o recorte atual.</span>';
          box.appendChild(n);
        }
        return;
      }
      var cols = spec.colors || palette();
      var kind = spec.kind || "bar";
      var fmt = spec.fmt || "int";
      var opts = chartDefaults(fmt);
      var type, datasets;

      if (kind === "doughnut" || kind === "pie") {
        type = kind === "pie" ? "pie" : "doughnut";
        datasets = [{
          label: spec.label || "",
          data: d.series[0].data,
          backgroundColor: d.labels.map(function (_, i) { return (d.series[0].colors || cols)[i % cols.length]; }),
          borderColor: cssVar("--pbi-card") || "#ffffff",
          borderWidth: 2,
          hoverOffset: 8
        }];
        delete opts.scales;
        opts.plugins.legend.position = spec.legend || "right";
        opts.plugins.legend.labels.usePointStyle = true;
        opts.plugins.legend.labels.pointStyle = "circle";
        opts.cutout = spec.cutout || "62%";
        opts.plugins.tooltip.callbacks.label = function (c) {
          var tot = c.dataset.data.reduce(function (a, b) { return a + b; }, 0);
          return " " + c.label + ": " + fmtVal(c.parsed, fmt) + (tot ? " (" + pct(c.parsed / tot * 100, 1) + ")" : "");
        };
      } else if (kind === "pareto") {
        type = "bar";
        var s0 = d.series[0];
        var total = s0.data.reduce(function (a, b) { return a + b; }, 0);
        var acc = 0;
        var line = s0.data.map(function (v) { acc += v; return total ? acc / total * 100 : 0; });
        datasets = [
          { type: "bar", label: s0.label, data: s0.data, backgroundColor: s0.color || cols[0],
            borderRadius: 2, maxBarThickness: 56, yAxisID: "y" },
          { type: "line", label: "% acumulada", data: line, borderColor: cssVar("--pbi-accentline") || "#252423",
            backgroundColor: "transparent", borderWidth: 2, pointRadius: 3, tension: 0.25,
            yAxisID: "y1", stack: "acc" }
        ];
        opts.scales.y1 = {
          position: "right", beginAtZero: true, max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: cssVar("--pbi-axis") || "#605e5c", font: { size: 11 },
                   callback: function (v) { return v + "%"; } }
        };
        opts.plugins.tooltip.callbacks.label = function (c) {
          return " " + (c.dataset.label || "") + ": " + fmtVal(c.parsed.y, c.dataset.yAxisID === "y1" ? "pct" : fmt);
        };
      } else if (kind === "stack100") {
        type = "bar";
        var norms = d.labels.map(function (_, i) {
          var tot = d.series.reduce(function (a, s) { return a + (Number(s.data[i]) || 0); }, 0);
          return tot || 1;
        });
        datasets = d.series.map(function (s, si) {
          return {
            type: "bar", label: s.label,
            data: s.data.map(function (v, i) { return (Number(v) || 0) / norms[i] * 100; }),
            backgroundColor: s.color || cols[si % cols.length],
            borderRadius: 1, stack: "s", maxBarThickness: spec.maxBarThickness || 48
          };
        });
        opts.scales.x.stacked = true;
        opts.scales.y.stacked = true;
        opts.scales.y.max = 100;
        opts.scales.y.ticks.callback = function (v) { return v + "%"; };
        opts.plugins.tooltip.callbacks.label = function (c) {
          return " " + (c.dataset.label || "") + ": " + pct(c.parsed.y, 1);
        };
      } else if (kind === "stack") {
        type = "bar";
        datasets = d.series.map(function (s, si) {
          return { type: "bar", label: s.label, data: s.data,
                   backgroundColor: s.color || cols[si % cols.length],
                   borderRadius: 1, stack: "s", maxBarThickness: spec.maxBarThickness || 56 };
        });
        opts.scales.x.stacked = true;
        opts.scales.y.stacked = true;
      } else if (kind === "line" || kind === "area") {
        type = "line";
        datasets = d.series.map(function (s, si) {
          var c = s.color || cols[si % cols.length];
          return {
            type: "line", label: s.label, data: s.data,
            borderColor: c, backgroundColor: s.fill ? c + "2e" : "transparent",
            borderWidth: 2.2, tension: spec.tension == null ? 0.3 : spec.tension,
            fill: !!s.fill, pointRadius: spec.pointRadius == null ? 2.5 : spec.pointRadius,
            pointBackgroundColor: c, pointBorderColor: cssVar("--pbi-card") || "#fff",
            pointBorderWidth: 1.4, yAxisID: s.axis || "y"
          };
        });
        if (d.series.some(function (s) { return s.axis === "y1"; })) {
          opts.scales.y1 = {
            position: "right", beginAtZero: true, grid: { drawOnChartArea: false },
            ticks: { color: cssVar("--pbi-axis") || "#605e5c", font: { size: 11 },
                     callback: function (v) { return v + "%"; } }
          };
        }
      } else {
        /* bar / bar-h */
        type = "bar";
        datasets = d.series.map(function (s, si) {
          return { type: "bar", label: s.label, data: s.data,
                   backgroundColor: s.color || cols[si % cols.length],
                   borderRadius: 2, maxBarThickness: spec.maxBarThickness || 44 };
        });
        if (kind === "bar-h" || spec.horizontal) {
          opts.indexAxis = "y";
          var t = opts.scales.x; opts.scales.x = opts.scales.y; opts.scales.y = t;
          opts.scales.y.beginAtZero = true;
          opts.scales.x.grid.color = gridOf(opts);
          opts.scales.x.ticks.maxRotation = 0;
        }
      }

      opts.plugins.legend.display = d.series.length > 1 || kind === "doughnut" || kind === "pie";
      if (spec.legend === false) opts.plugins.legend.display = false;
      if (spec.stacked) { opts.scales.x.stacked = true; opts.scales.y.stacked = true; }

      try {
        CHARTS[id] = new Chart(el, { type: type, data: { labels: d.labels, datasets: datasets }, options: opts });
      } catch (e) {
        showEmpty(id, "Não foi possível desenhar o gráfico: " + e.message);
      }
    });
  }

  function gridOf(opts) {
    return (opts.scales.x && opts.scales.x.grid && opts.scales.x.grid.color) || "rgba(0,0,0,.08)";
  }

  /* ---------------- tabela ---------------- */

  function tableRows(rows) {
    var q = TABLE_Q.toLowerCase();
    if (!q) return rows;
    var cols = CFG.table.columns;
    return rows.filter(function (r) {
      for (var i = 0; i < cols.length; i++) {
        var v = r[cols[i].k];
        if (v != null && String(v).toLowerCase().indexOf(q) !== -1) return true;
      }
      return false;
    });
  }

  function sortRows(rows) {
    if (!SORT.k) return rows;
    var k = SORT.k, a = SORT.a;
    return rows.slice().sort(function (x, y) {
      var vx = x[k], vy = y[k];
      if (typeof vx === "number" || typeof vy === "number") return ((Number(vx) || 0) - (Number(vy) || 0)) * a;
      return String(vx == null ? "" : vx).localeCompare(String(vy == null ? "" : vy), "pt-BR") * a;
    });
  }

  function renderTable(rows) {
    var cfg = CFG.table;
    if (!cfg) return;
    var host = document.getElementById("tbody");
    if (!host) return;
    var data = sortRows(tableRows(rows));
    var per = cfg.pageSize || 12;
    var pages = Math.max(1, Math.ceil(data.length / per));
    if (PAGE > pages) PAGE = pages;
    var start = (PAGE - 1) * per;
    var slice = data.slice(start, start + per);

    host.innerHTML = slice.length ? slice.map(function (r) {
      return "<tr>" + cfg.columns.map(function (c) {
        var txt, inner;
        if (c.render) { inner = c.render(r); }
        else {
          txt = fmtVal(r[c.k], c.fmt);
          inner = c.bold ? "<b>" + esc(txt) + "</b>" : esc(txt);
        }
        var cls = [];
        if (c.cls) cls.push(typeof c.cls === "function" ? (c.cls(r) || "") : c.cls);
        if (c.numeric || c.fmt === "int" || c.fmt === "num" || c.fmt === "num2" || c.fmt === "pct") cls.push("num");
        return "<td " + (cls.length ? 'class="' + cls.join(" ") + '"' : "") + ">" + inner + "</td>";
      }).join("") + "</tr>";
    }).join("") : '<tr><td class="empty-row" colspan="' + cfg.columns.length + '">Nenhum registro para o recorte atual.</td></tr>';

    var info = document.getElementById("pgInfo");
    if (info) {
      info.innerHTML = data.length
        ? "Exibindo <b>" + (start + 1) + "–" + (start + slice.length) + "</b> de <b>" + data.length + "</b> registros · página " + PAGE + " de " + pages
        : "Nenhum registro encontrado.";
    }

    var btns = document.getElementById("pgBtns");
    if (btns) {
      var html = '<button class="pg" data-p="prev"' + (PAGE === 1 ? " disabled" : "") + ">‹</button>";
      var from = Math.max(1, PAGE - 2), to = Math.min(pages, PAGE + 2);
      for (var p = from; p <= to; p++) {
        html += '<button class="pg' + (p === PAGE ? " on" : "") + '" data-p="' + p + '">' + p + "</button>";
      }
      html += '<button class="pg" data-p="next"' + (PAGE === pages ? " disabled" : "") + ">›</button>";
      btns.innerHTML = html;
    }

    document.querySelectorAll("#tbl thead th[data-k]").forEach(function (th) {
      th.classList.toggle("sorted", th.dataset.k === SORT.k);
      var ar = th.querySelector(".ar");
      if (ar) ar.textContent = (th.dataset.k === SORT.k && SORT.a === -1) ? "▼" : "▲";
    });
  }

  function csvExport(rows) {
    var cfg = CFG.table;
    var data = sortRows(tableRows(rows));
    var sep = ";";
    var head = cfg.columns.map(function (c) { return c.csv || c.lbl; });
    var lines = [head.join(sep)];
    data.forEach(function (r) {
      lines.push(cfg.columns.map(function (c) {
        var v = c.render ? String(c.render(r)).replace(/<[^>]*>/g, "") : fmtVal(r[c.k], c.fmt);
        v = String(v).replace(/"/g, '""');
        return /[;"\n]/.test(v) ? '"' + v + '"' : v;
      }).join(sep));
    });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = cfg.file || "dados.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  /* ---------------- update / bind ---------------- */

  function update() {
    var rows = filtrar();
    renderSummary(rows);
    renderKPIs(rows);
    renderCharts(rows);
    renderTable(rows);
    var note = document.getElementById("rowCount");
    if (note) note.innerHTML = "<b>" + rows.length + "</b> de <b>" + ROWS.length + "</b> registros";
  }

  function bind() {
    var clear = document.getElementById("btnClear");
    if (clear) clear.addEventListener("click", function () {
      (CFG.filters || []).forEach(function (f) { SEL[f.key] = []; });
      TABLE_Q = ""; PAGE = 1;
      var s = document.getElementById("search"); if (s) s.value = "";
      syncAll(); update();
    });

    var search = document.getElementById("search");
    if (search) {
      var t;
      search.addEventListener("input", function (e) {
        clearTimeout(t);
        t = setTimeout(function () { TABLE_Q = e.target.value.trim(); PAGE = 1; renderTable(filtrar()); }, 150);
      });
    }

    var thead = document.querySelector("#tbl thead");
    if (thead) thead.addEventListener("click", function (e) {
      var th = e.target.closest("th[data-k]"); if (!th) return;
      var k = th.dataset.k;
      if (SORT.k === k) SORT.a *= -1; else { SORT.k = k; SORT.a = 1; }
      PAGE = 1;
      renderTable(filtrar());
    });

    var pg = document.getElementById("pgBtns");
    if (pg) pg.addEventListener("click", function (e) {
      var b = e.target.closest(".pg"); if (!b || b.disabled) return;
      var v = b.dataset.p;
      var rows = filtrar();
      var pages = Math.max(1, Math.ceil(tableRows(rows).length / (CFG.table.pageSize || 12)));
      if (v === "prev") PAGE = Math.max(1, PAGE - 1);
      else if (v === "next") PAGE = Math.min(pages, PAGE + 1);
      else PAGE = Number(v);
      renderTable(rows);
      var tbl = document.getElementById("tbl");
      if (tbl && tbl.scrollIntoView) tbl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var csv = document.getElementById("btnCsv");
    if (csv) csv.addEventListener("click", function () { csvExport(filtrar()); });

    var pr = document.getElementById("btnPrint");
    if (pr) pr.addEventListener("click", function () { window.print(); });
  }

  /* ---------------- boot ---------------- */

  function boot() {
    CFG = window.PBI_REPORT;
    if (!CFG) {
      console.error("PBI_REPORT não definido antes de pbi.js");
      return;
    }
    (CFG.filters || []).forEach(function (f) { SEL[f.key] = []; });
    if (CFG.table && CFG.table.sort) SORT = { k: CFG.table.sort.k, a: CFG.table.sort.a || 1 };

    var script = document.querySelector('script[src*="chart.js"], script[src*="chart.umd"]');
    var checkChart = function () { CHART_JS_OK = !!window.Chart; };

    fetch(CFG.data)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        ROWS = d.rows || [];
        if (CFG.table && CFG.table.derive) {
          ROWS.forEach(function (r) { try { CFG.table.derive(r); } catch (e) {} });
        }
        window.PBI_META = d.meta || {};
        window.PBI_ROWS = ROWS;
        var per = document.getElementById("periodo");
        if (per && window.PBI_META.periodo) {
          per.textContent = "Período de referência: " + window.PBI_META.periodo;
        }
        buildSlicers();
        syncAll();
        bind();
        update();
        if (!window.Chart && script) {
          script.addEventListener("load", function () { CHART_JS_OK = true; update(); });
        }
        checkChart();
      })
      .catch(function (err) {
        var host = document.getElementById("fsum") || document.getElementById("kpis");
        if (host) {
          host.innerHTML = '<span style="color:#a4262c;font-weight:600">Falha ao carregar o data.json (' +
            esc(err.message) + '). Abra a página via servidor HTTP.</span>';
        }
      });
  }

  window.PBI = {
    num: num, pct: pct, fmt: fmtVal, esc: esc, agg: agg,
    countBy: countBy, sumBy: sumBy, keys: sortedKeys,
    total: function () { return ROWS.length; },
    meta: function () { return window.PBI_META || {}; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

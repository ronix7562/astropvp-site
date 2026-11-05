/* AstroPvP Store page logic. All links/data sources come from config.js; rank content from ranks.js. */
(function () {
  "use strict";
  var C = window.ASTRO_STORE || {};
  var RANKS = window.ASTRO_RANKS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var params = new URLSearchParams(location.search);
  // Preview-only sample data, never real: ?demo=1 (clearly flagged "DEMO" on the page).
  var DEMO = params.get("demo") === "1";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function validName(n) { return /^[A-Za-z0-9_]{1,16}$/.test(n || ""); }
  function head(name, size) { return "https://mc-heads.net/avatar/" + encodeURIComponent(validName(name) ? name : "MHF_Steve") + "/" + size; }
  function ago(t) {
    var d = (Date.now() - new Date(t).getTime()) / 1000;
    if (!isFinite(d)) return "";
    if (d < 60) return "just now";
    if (d < 3600) return Math.floor(d / 60) + "m ago";
    if (d < 86400) return Math.floor(d / 3600) + "h ago";
    return Math.floor(d / 86400) + "d ago";
  }
  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function getJSON(url, opts) {
    return fetch(url, Object.assign({ cache: "no-store" }, opts || {})).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status); return r.json();
    });
  }

  /* ---------- 1. Loader: until load, hard cap 1.5 s ---------- */
  (function () {
    var el = $("#loader"); if (!el) return;
    var done = false;
    function hide() { if (done) return; done = true; el.classList.add("done"); setTimeout(function () { el.remove(); }, 500); }
    if (document.readyState === "complete") hide(); else window.addEventListener("load", hide);
    setTimeout(hide, 1500);
  })();

  /* ---------- 2. Sky: stars + rising wavy particles ---------- */
  (function () {
    var cv = $("#sky"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W, H, dpr, stars = [], parts = [], raf = 0, last = 0;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function mkPart(initial) {
      return { x: rnd(0, W), y: initial ? rnd(0, H) : H + rnd(0, 40), v: rnd(10, 26), amp: rnd(6, 22), f: rnd(.004, .012),
        ph: rnd(0, 6.3), s: Math.random() < .2 ? 3 : 2, c: Math.random() < .65 ? "255,190,60" : "90,220,130", a: rnd(.25, .6) };
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(220, Math.round(W * H / 5000));
      stars = []; for (var i = 0; i < n; i++) stars.push({ x: rnd(0, W), y: rnd(0, H), r: Math.random() < .1 ? 1.6 : rnd(.5, 1.1), a: rnd(.25, .9), tw: rnd(.5, 2), ph: rnd(0, 6.3) });
      var p = Math.min(46, Math.round(W / 34));
      parts = []; for (var j = 0; j < p; j++) parts.push(mkPart(true));
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var sec = t / 1000;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], a = reduce.matches ? s.a : s.a * (.65 + .35 * Math.sin(sec * s.tw + s.ph));
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      if (reduce.matches) return;
      var dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.y -= p.v * dt;
        var x = p.x + Math.sin(p.y * p.f + p.ph) * p.amp;
        var fade = Math.min(1, p.y / (H * .35)) * Math.min(1, (H - p.y + 40) / 120);
        ctx.fillStyle = "rgba(" + p.c + "," + (p.a * Math.max(0, fade)).toFixed(3) + ")";
        ctx.fillRect(Math.round(x), Math.round(p.y), p.s, p.s);
        if (p.y < -10) parts[j] = mkPart(false);
      }
    }
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    function start() { cancelAnimationFrame(raf); if (reduce.matches) { draw(0); } else { last = performance.now(); raf = requestAnimationFrame(loop); } }
    size(); start();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); start(); }, 150); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else start(); });
    if (reduce.addEventListener) reduce.addEventListener("change", start);
  })();

  /* ---------- Links from config ---------- */
  var D = C.discord || {};
  $$('[data-link="discord"]').forEach(function (a) { if (D.invite) a.href = D.invite; });
  $$('[data-link="support"]').forEach(function (a) { if (D.support || D.invite) a.href = D.support || D.invite; });
  var T = C.tebex || {};
  $("#login").addEventListener("click", function (e) {
    if (T.storeUrl) { this.href = T.storeUrl; return; }
    e.preventDefault(); toast("Login opens with the Tebex checkout (coming soon).");
  });

  /* ---------- Header: IP copy ---------- */
  (function () {
    var card = $("#ipCard"), ip = (C.serverIp || "").trim();
    if (ip) { $("#ipText").textContent = ip; $("#ipHint").textContent = "Click to copy"; card.setAttribute("aria-label", "Copy server IP " + ip); }
    card.addEventListener("click", function () {
      if (!ip) { toast("The server IP will be announced on our Discord."); return; }
      var ok = function () { $("#ipHint").textContent = "Copied!"; toast("Copied " + ip); setTimeout(function () { $("#ipHint").textContent = "Click to copy"; }, 1800); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ip).then(ok, function () { toast(ip); });
      else {
        var ta = document.createElement("textarea"); ta.value = ip; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); ok(); } catch (e) { toast(ip); } ta.remove();
      }
    });
  })();

  /* ---------- Discord member count (Discord's own public invite API) + 10. community strip ---------- */
  (function () {
    var min = C.communityMinimum || 25;
    if (!D.inviteCode) return;
    getJSON("https://discord.com/api/v10/invites/" + encodeURIComponent(D.inviteCode) + "?with_counts=true", { cache: "default" }).then(function (j) {
      var m = Number(j.approximate_member_count), on = Number(j.approximate_presence_count);
      if (!(m > 0)) return;
      $("#discordHint").textContent = m.toLocaleString("en-US") + " members" + (on > 0 ? " · " + on.toLocaleString("en-US") + " online" : "");
      if (m >= min) {
        var c = $("#communityText");
        c.innerHTML = "Join <b>" + m.toLocaleString("en-US") + "</b> members already in the AstroPvP community";
        $("#community").title = "Source: Discord member count (discord.gg/" + D.inviteCode + ")";
      }
    }).catch(function () { /* keep the honest fallback text */ });
  })();

  /* ---------- Hero image drop-in ---------- */
  if (C.heroImage) {
    var fig = $("#heroArt");
    fig.innerHTML = '<img src="' + esc(C.heroImage) + '" alt="A player in heroic gold armour with arms crossed, on a floating castle island" width="940" height="996" fetchpriority="high">';
  }

  /* ---------- Sale banner ---------- */
  if (C.sale && C.sale.active) {
    $("#sale").classList.add("on");
    $("#saleTitle").textContent = C.sale.title || "Sale";
    $("#saleText").textContent = C.sale.text || "";
  }

  /* ---------- 6. Ranks ---------- */
  var GEM = {
    galaxy: '<svg class="rank-gem" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#3b2a7a" d="M5 1h6v1h2v2h1v6h-1v2h-2v2H5v-2H3v-2H2V4h1V2h2z"/><path fill="#a98bff" d="M5 2h6v1h1v1h1v6h-1v1h-1v1H5v-1H4v-1H3V4h1V3h1z"/><path fill="#e2d7ff" d="M6 4h2v1H6zM5 5h1v2H5zM10 9h1v1h-1zM11 7h1v2h-1z"/><path fill="#fff" d="M6 5h1v1H6z"/></svg>',
    nebula: '<svg class="rank-gem" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path fill="#6b1b57" d="M7 1h2v3h3v2h3v2h-3v2h-3v5H7v-5H4V8H1V6h3V4h3z"/><path fill="#ff7ad9" d="M7 2h2v3h3v1h2v1h-2v2H9v4H7V9H4V7H2V6h2V5h3z"/><path fill="#ffd1f2" d="M7 6h2v2H7z"/><path fill="#fff" d="M7 6h1v1H7z"/></svg>'
  };
  function priceHtml(r) { return "$" + r.price + (r.period ? " <small>/ " + esc(r.period) + "</small>" : ""); }
  function buyUrl(id) { return ((T.packages || {})[id] || "").trim(); }
  var grid = $("#rankGrid");
  grid.innerHTML = RANKS.map(function (r) {
    var url = buyUrl(r.id);
    var buy = url
      ? '<a class="btn gold" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(r.button) + "</a>"
      : '<button class="btn gold" type="button" data-soon aria-describedby="soon-' + esc(r.id) + '">' + esc(r.button) + "</button>";
    return '<article class="rank ' + esc(r.id) + '" aria-labelledby="rn-' + esc(r.id) + '">' + (GEM[r.id] || "") +
      '<h3 class="rank-name" id="rn-' + esc(r.id) + '">' + esc(r.name) + "</h3>" +
      '<p class="rank-type">' + esc(r.type) + "</p>" +
      '<p class="rank-price">' + priceHtml(r) + "</p>" +
      '<div class="rank-row">' + buy + '<button class="icon-btn" type="button" data-info="' + esc(r.id) + '" aria-label="' + esc(r.name) + ' perks and details">i</button></div>' +
      (url ? "" : '<p class="note" id="soon-' + esc(r.id) + '" style="text-align:center;margin:0">Checkout coming soon</p>') +
      "</article>";
  }).join("");
  grid.addEventListener("click", function (e) {
    var s = e.target.closest("[data-soon]"); if (s) { toast("Coming soon: checkout opens when the store launches."); return; }
    var i = e.target.closest("[data-info]"); if (i) openRank(i.getAttribute("data-info"), i);
  });

  var modal = $("#rankModal"), modalOpener = null;
  function openRank(id, opener) {
    var r = RANKS.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    modalOpener = opener;
    $("#rankModalH").textContent = r.name;
    $("#rankModalPrice").innerHTML = priceHtml(r).replace(/<\/?small>/g, "") + " · " + esc(r.type);
    var perks = r.perks.map(function (p) {
      return p.verified === false ? '<li class="ph">' + esc(p.text) + " (to be confirmed)</li>" : "<li>" + esc(p.text) + "</li>";
    }).join("");
    var notes = (r.notes || []).map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
    $("#rankModalBody").innerHTML = "<h3>Perks</h3><ul class=\"perks\">" + perks + "</ul>" + (notes ? "<h3>Good to know</h3><ul class=\"list\">" + notes + "</ul>" : "");
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
  }
  function closeModal() { if (modal.close) modal.close(); else modal.removeAttribute("open"); }
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });
  modal.addEventListener("close", function () { if (modalOpener) modalOpener.focus(); });

  /* ---------- Router (sidebar categories) ---------- */
  var CATS = ["home", "ranks", "bundles", "lootboxes", "other", "giftcards"];
  function route(fromClick) {
    var h = location.hash.replace("#", "");
    var cat = CATS.indexOf(h) >= 0 ? h : "home";
    $$(".panel-view").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== cat; });
    $$("#catnav a").forEach(function (a) { if (a.getAttribute("data-cat") === cat) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    document.title = (cat === "home" ? "" : cat.charAt(0).toUpperCase() + cat.slice(1) + " · ") + "AstroPvP Store";
    if (fromClick) {
      var m = $("#main"), top = m.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * .6) m.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      m.focus({ preventScroll: true });
    }
  }
  window.addEventListener("hashchange", function () { route(true); });
  route(false);

  /* ---------- 9. Top spenders ---------- */
  var CROWN = '<svg class="crown" viewBox="0 0 12 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 1h2v2h2V0h4v3h2V1h2v7H0z"/><path fill="#7a5200" d="M0 7h12v1H0z"/></svg>';
  var spend = null, period = "month";
  function renderSpenders() {
    var ol = $("#spenders");
    if (!spend) {
      ol.innerHTML = '<li class="empty"><b>No data yet</b>Top spenders show here once the Tebex store is live.</li>'; return;
    }
    var list = (spend[period] || []).slice(0, 5);
    if (!list.length) { ol.innerHTML = '<li class="empty"><b>No buyers yet</b>Be the first this ' + (period === "month" ? "month" : "season") + ".</li>"; return; }
    ol.innerHTML = list.map(function (p, i) {
      var rk = (p.rank || "").toLowerCase();
      return '<li class="spender' + (i === 0 ? " first" : "") + '">' + '<span class="pos">#' + (i + 1) + "</span>" +
        '<img src="' + head(p.name, 28) + '" alt="" width="28" height="28" loading="lazy">' + (i === 0 ? CROWN : "") +
        '<span class="nm">' + esc(p.name) + "</span>" + (p.rank ? '<span class="badge ' + esc(rk) + '">' + esc(p.rank) + "</span>" : "") + "</li>";
    }).join("");
  }
  $$(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      period = b.getAttribute("data-period");
      $$(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderSpenders();
    });
  });

  /* ---------- 8. Recent payments ---------- */
  var pop = document.createElement("div"); pop.className = "pay-card pay-pop"; pop.setAttribute("role", "tooltip"); pop.id = "payPop"; document.body.appendChild(pop);
  function renderPayments(list) {
    var box = $("#payments");
    if (!list) { box.innerHTML = '<div class="empty"><b>No payments to show yet</b>The latest buyers appear here once the Tebex store is live.</div>'; return; }
    if (!list.length) { box.innerHTML = '<div class="empty"><b>No payments yet</b>Be the first!</div>'; return; }
    list = list.slice().sort(function (a, b) { return new Date(b.time) - new Date(a.time); }).slice(0, 20);
    var scroll = list.length > 5;
    function item(p, i, dup) {
      var what = (p.quantity > 1 ? p.quantity + "x " : "") + (p.item || "");
      return '<button type="button" class="pay' + (i === 0 ? " new" : "") + '"' + (dup ? ' tabindex="-1" aria-hidden="true"' : ' aria-describedby="payPop"') +
        ' data-name="' + esc(p.name) + '" data-what="' + esc(what) + '" data-ago="' + esc(ago(p.time)) + '">' +
        '<img src="' + head(p.name, 44) + '" alt="' + (dup ? "" : esc(p.name + " bought " + what + ", " + ago(p.time))) + '" width="44" height="44" loading="lazy"></button>';
    }
    var html = list.map(function (p, i) { return item(p, i, false); }).join("");
    if (scroll) html += list.map(function (p, i) { return item(p, i, true); }).join("");
    box.innerHTML = '<div class="pay-viewport"><div class="pay-track' + (scroll ? " scroll" : "") + '" style="--dur:' + (list.length * 4) + 's">' + html + "</div></div>";
  }
  function showPop(btn) {
    pop.innerHTML = "<b>" + esc(btn.dataset.name) + "</b><span><em>" + esc(btn.dataset.what) + "</em> • " + esc(btn.dataset.ago) + "</span>";
    var r = btn.getBoundingClientRect();
    pop.style.left = Math.max(100, Math.min(window.innerWidth - 100, r.left + r.width / 2)) + "px";
    pop.style.top = (r.top - 8) + "px"; pop.style.bottom = "auto";
    pop.style.transform = "translate(-50%, -100%)";
    pop.classList.add("show");
  }
  function hidePop() { pop.classList.remove("show"); }
  var pays = $("#payments");
  pays.addEventListener("mouseover", function (e) { var b = e.target.closest(".pay"); if (b) showPop(b); });
  pays.addEventListener("mouseout", function (e) { if (e.target.closest(".pay") && !pays.contains(e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(".pay") : null)) hidePop(); });
  pays.addEventListener("focusin", function (e) { var b = e.target.closest(".pay"); if (b) showPop(b); });
  pays.addEventListener("focusout", hidePop);
  pays.addEventListener("click", function (e) { var b = e.target.closest(".pay"); if (b) showPop(b); });
  window.addEventListener("scroll", hidePop, { passive: true });

  /* ---------- 11. Gift card balance ---------- */
  (function () {
    var url = ((C.feeds || {}).giftcardBalance || "").trim(), form = $("#gcForm");
    if (!url) return;
    $("#gcCode").disabled = false; form.querySelector("button").disabled = false; $("#gcNote").textContent = "Enter a code to check its balance.";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = $("#gcCode").value.trim(); if (!code) return;
      $("#gcNote").textContent = "Checking…";
      getJSON(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code }) })
        .then(function (j) { $("#gcNote").textContent = j && j.balance != null ? "Balance: " + j.balance + " " + (j.currency || "") : "Code not found."; })
        .catch(function () { $("#gcNote").textContent = "Could not check right now. Try again later."; });
    });
  })();

  /* ---------- Feeds ---------- */
  var F = C.feeds || {};
  function flagDemo() {
    ["#rpH", "#tsH"].forEach(function (s) { $(s).insertAdjacentHTML("beforeend", '<span class="demo-flag">DEMO</span>'); });
    toast("Demo mode: sample data, not real buyers.");
  }
  if (DEMO) {
    var now = Date.now(), H = 3600e3;
    renderPayments([
      { name: "Demo_Player_1", item: "Heroic Bundle", quantity: 6, time: new Date(now - 2 * H).toISOString() },
      { name: "Demo_Player_2", item: "Nebula Rank", quantity: 1, time: new Date(now - 5 * H).toISOString() },
      { name: "Demo_Player_3", item: "Galaxy Rank", quantity: 1, time: new Date(now - 26 * H).toISOString() },
      { name: "Demo_Player_4", item: "$10 Gift Card", quantity: 1, time: new Date(now - 49 * H).toISOString() },
      { name: "Demo_Player_5", item: "Nebula Rank", quantity: 1, time: new Date(now - 70 * H).toISOString() },
      { name: "Demo_Player_6", item: "Heroic Bundle", quantity: 2, time: new Date(now - 90 * H).toISOString() }
    ]);
    spend = { month: [{ name: "Demo_Player_3", rank: "Galaxy" }, { name: "Demo_Player_2", rank: "Nebula" }, { name: "Demo_Player_1", rank: "Apollo" }],
              all: [{ name: "Demo_Player_5", rank: "Nebula" }, { name: "Demo_Player_3", rank: "Galaxy" }] };
    renderSpenders(); flagDemo();
  } else {
    renderPayments(null); renderSpenders();
    if (F.recentPayments) getJSON(F.recentPayments).then(function (j) { renderPayments(Array.isArray(j) ? j : []); }).catch(function () { renderPayments(null); });
    if (F.topSpenders) getJSON(F.topSpenders).then(function (j) { spend = j || { month: [], all: [] }; renderSpenders(); }).catch(function () {});
  }
})();

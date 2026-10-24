/* FUOCO — inner pages: menu, deals, contact, cart, checkout and order tracking. */
(function () {
  "use strict";
  var F = window.FUOCO,
    D = F.D;
  var page = document.body.dataset.page;
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

  /* ---------- menu ---------- */
  function menu() {
    var state = { cat: F.param("cat") || "all", q: "", veg: false, hot: false };
    var tabs = $("[data-tabs]"),
      list = $("[data-menu-list]");
    tabs.innerHTML = D.CATS.map(function (c) {
      return '<button type="button" class="tab" role="tab" data-cat="' + c.id + '">' + c.label + "</button>";
    }).join("");
    function render() {
      tabs.querySelectorAll("[data-cat]").forEach(function (b) {
        var on = b.dataset.cat === state.cat;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", String(on));
      });
      var q = state.q.toLowerCase();
      var items = D.MENU.filter(function (p) {
        return (
          (state.cat === "all" || p.cat === state.cat) &&
          (!state.veg || p.veg) &&
          (!state.hot || p.spicy > 0) &&
          (!q || (p.name + " " + p.desc).toLowerCase().indexOf(q) > -1)
        );
      });
      var groups = D.CATS.slice(1)
        .map(function (c) {
          var its = items.filter(function (p) {
            return p.cat === c.id;
          });
          return its.length ? '<div class="menu-group"><h2>' + c.label + '</h2><div class="cards">' + its.map(F.itemCard).join("") + "</div></div>" : "";
        })
        .join("");
      list.innerHTML = groups;
      $("[data-none]").hidden = items.length > 0;
      F.reveal(list);
    }
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.dataset.cat;
      history.replaceState(null, "", state.cat === "all" ? location.pathname : "?cat=" + state.cat);
      render();
    });
    $("[data-search]").addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      render();
    });
    $("[data-f-veg]").addEventListener("change", function (e) {
      state.veg = e.target.checked;
      render();
    });
    $("[data-f-hot]").addEventListener("change", function (e) {
      state.hot = e.target.checked;
      render();
    });
    render();
  }

  /* ---------- deals ---------- */
  function deals() {
    $("[data-deals]").innerHTML = D.DEALS.map(F.dealCard).join("");
    F.countdown($("[data-countdown]"));
    F.reveal();
  }

  /* ---------- contact ---------- */
  function contact() {
    var form = $("[data-contact]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!F.validate(form)) return;
      var name = $("#c-name").value.trim().split(" ")[0];
      var done = $("[data-c-done]");
      done.textContent = "Thanks, " + name + ". We'll get back to you within a few hours.";
      done.hidden = false;
      form.reset();
      F.say("Message sent.");
    });
    form.addEventListener("input", function (e) {
      var w = e.target.closest("[data-field]");
      if (w && w.classList.contains("err")) F.validate(form);
    });
    document.querySelectorAll(".acc button").forEach(function (b) {
      b.addEventListener("click", function () {
        var acc = b.parentElement;
        var open = !acc.classList.contains("open");
        acc.classList.toggle("open", open);
        b.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- promo + totals (cart and checkout) ---------- */
  var promo = F.load("fuoco-promo", "");
  function mode() {
    var m = document.querySelector('input[name="mode"]:checked');
    return m ? m.value : "delivery";
  }
  function totalsHTML() {
    var t = F.totals(promo, mode());
    return (
      "<div><dt>Subtotal</dt><dd>" + F.price(t.sub) + "</dd></div>" +
      (t.disc ? "<div><dt>Discount (" + t.code + ")</dt><dd>&minus; " + F.price(t.disc) + "</dd></div>" : "") +
      "<div><dt>" + (mode() === "pickup" ? "Pickup" : "Delivery") + "</dt><dd>" + (t.del ? F.price(t.del) : "Free") + "</dd></div>" +
      '<div class="grand"><dt>Total</dt><dd>' + F.price(t.total) + "</dd></div>"
    );
  }
  function bindPromo(after) {
    var form = $("[data-promo]");
    if (!form) return;
    var msg = $("[data-promo-msg]"),
      inp = $("[data-promo-in]");
    if (promo) {
      inp.value = promo;
      msg.textContent = promo + " applied.";
      msg.className = "promo-msg ok";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = inp.value.trim().toUpperCase();
      if (!c) {
        promo = "";
        msg.textContent = "";
      } else if (F.PROMOS[c]) {
        promo = c;
        msg.textContent = c + " applied: " + Math.round(F.PROMOS[c] * 100) + "% off.";
        msg.className = "promo-msg ok";
      } else {
        promo = "";
        msg.textContent = "That code isn't valid. Try FIRE20.";
        msg.className = "promo-msg bad";
      }
      inp.value = promo || c;
      F.save("fuoco-promo", promo);
      after();
    });
  }

  /* ---------- cart page ---------- */
  function cartPage() {
    var box = $("[data-cart-lines]");
    function render() {
      var lines = F.cart.lines();
      box.innerHTML = lines.length
        ? lines.map(function (l) {
            return F.lineHTML(l, true);
          }).join("") + '<div class="row between" style="margin-top:20px"><a href="menu.html" class="link-btn">&larr; Keep browsing</a><button type="button" class="link-btn" data-clear>Clear order</button></div>'
        : '<div class="empty">' + F.ICON.bag + '<p>Your order is empty. The oven is waiting.</p><a href="menu.html" class="btn btn-fire">See the menu</a></div>';
      $("[data-summary]").hidden = !lines.length;
      $("[data-totals]").innerHTML = totalsHTML();
    }
    box.addEventListener("click", function (e) {
      if (e.target.closest("[data-clear]")) {
        F.cart.clear();
        F.say("Order cleared.");
      }
    });
    F.cart.on(render);
    bindPromo(render);
    render();
  }

  /* ---------- checkout ---------- */
  function checkout() {
    if (!F.cart.count()) {
      $(".cart-grid").innerHTML = '<div class="empty">' + F.ICON.bag + '<p>Your order is empty, so there is nothing to check out yet.</p><a href="menu.html" class="btn btn-fire">See the menu</a></div>';
      return;
    }
    var form = $("[data-checkout]");
    // time slots: ASAP, then every 30 minutes from the next half hour until 1 am
    var sel = $("[data-time]");
    var opts = ['<option value="ASAP">As soon as possible</option>'];
    var d = new Date();
    d.setMinutes(d.getMinutes() < 30 ? 60 : 90, 0, 0);
    for (var i = 0; i < 8; i++) {
      var t = new Date(d.getTime() + i * 30 * 60000);
      var label = t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      opts.push('<option value="' + label + '">' + label + "</option>");
    }
    sel.innerHTML = opts.join("");

    function render() {
      $("[data-co-lines]").innerHTML = F.cart
        .lines()
        .map(function (l) {
          return (
            '<div class="mini">' + (l.photo ? '<img src="' + D.img(l.photo, 120, 120) + '" alt="" />' : '<span class="line-diy">DIY</span>') +
            "<div><p>" + l.qty + " &times; " + F.esc(l.name) + "</p>" + (l.note ? "<small>" + F.esc(l.note) + "</small>" : "") + "</div><b>" + F.price(l.unit * l.qty) + "</b></div>"
          );
        })
        .join("");
      $("[data-totals]").innerHTML = totalsHTML();
      var pick = mode() === "pickup";
      $("[data-delivery]").hidden = pick;
      document.querySelector('input[value="Cash on delivery"]').nextElementSibling.querySelector("b").textContent = pick ? "Cash at the counter" : "Cash on delivery";
    }
    form.addEventListener("change", function (e) {
      if (e.target.name === "mode") render();
    });
    form.addEventListener("input", function (e) {
      var w = e.target.closest("[data-field]");
      if (w && w.classList.contains("err")) F.validate(form);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!F.validate(form)) return F.say("Please check the highlighted fields.");
      var m = mode();
      var t = F.totals(promo, m);
      var order = {
        id: "FU" + String(Date.now()).slice(-6),
        at: Date.now(),
        mode: m,
        name: $("#o-name").value.trim(),
        phone: $("#o-phone").value.trim(),
        address: m === "delivery" ? $("#o-street").value.trim() + ", " + $("#o-area").value : "Pickup at GT Road, Gujrat",
        notes: $("#o-notes").value.trim(),
        time: sel.value,
        pay: document.querySelector('input[name="pay"]:checked').value,
        lines: F.cart.lines(),
        totals: t,
      };
      var orders = F.load("fuoco-orders", []);
      orders.unshift(order);
      F.save("fuoco-orders", orders.slice(0, 20));
      F.save("fuoco-promo", "");
      F.cart.clear();
      location.href = "order.html?id=" + order.id;
    });
    F.cart.on(function () {
      if (!F.cart.count()) location.reload();
      else render();
    });
    bindPromo(render);
    render();
  }

  /* ---------- order tracking ---------- */
  // A demo tracker: each stage takes a few seconds so the whole journey can be watched.
  var STAGES = [
    { t: 0, label: "Order received", icon: '<path d="M6 4h12v16l-3-2-3 2-3-2-3 2V4Z"/><path d="M9 9h6M9 13h4"/>' },
    { t: 12, label: "In the oven", icon: '<path d="M12 21c3.9 0 6-2.5 6-5.8 0-3.2-2.3-5-3.7-7.3-.5 1.7-1.4 2.7-2.4 3.1.2-2.9-1-5.8-3.5-7.5.2 3.1-2.6 5.4-2.6 9.4C5.8 18.5 8.1 21 12 21Z"/>' },
    { t: 30, label: "On the way", pickup: "Ready for pickup", icon: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17h4l3-6h4l1 6M13 11l-2-4H8"/>' },
    { t: 60, label: "Delivered", pickup: "Picked up", icon: '<path d="m5 12 5 5 9-10"/>' },
  ];
  function order() {
    var box = $("[data-track]");
    var orders = F.load("fuoco-orders", []);
    var id = F.param("id");
    var o = id
      ? orders.filter(function (x) {
          return x.id === id;
        })[0]
      : null;

    if (!o) {
      box.innerHTML =
        '<div class="track-head"><p class="kicker">Your orders</p><h1 class="display">Track an <span class="fire-text">order</span></h1></div>' +
        (orders.length
          ? '<div class="receipt" style="margin-top:40px">' +
            orders
              .map(function (x) {
                return '<a class="order-row" href="order.html?id=' + x.id + '"><b>#' + x.id + "</b><span>" + new Date(x.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) + "</span><span>" + x.lines.length + " item" + (x.lines.length > 1 ? "s" : "") + "</span><b>" + F.price(x.totals.total) + "</b></a>";
              })
              .join("") +
            "</div>"
          : '<div class="empty"><p>' + (id ? "We couldn't find order #" + F.esc(id) + " on this device." : "You haven't placed an order on this device yet.") + '</p><a href="menu.html" class="btn btn-fire">Start an order</a></div>');
      return;
    }

    var pick = o.mode === "pickup";
    box.innerHTML =
      '<div class="track-head"><p class="kicker">Order #' + o.id + '</p><h1 class="display">Thanks, <span class="fire-text">' + F.esc(o.name.split(" ")[0]) + "</span></h1>" +
      '<p class="eta" data-eta></p></div>' +
      '<ol class="stages" data-stages><span class="bar" aria-hidden="true"></span>' +
      STAGES.map(function (s) {
        return '<li><span><svg viewBox="0 0 24 24" aria-hidden="true">' + s.icon + "</svg></span>" + (pick && s.pickup ? s.pickup : s.label) + "</li>";
      }).join("") +
      "</ol>" +
      '<div class="cart-grid"><div class="receipt"><h2 class="drawer-title" style="margin-bottom:10px">Receipt</h2>' +
      o.lines
        .map(function (l) {
          return '<div class="mini">' + (l.photo ? '<img src="' + D.img(l.photo, 120, 120) + '" alt="" />' : '<span class="line-diy">DIY</span>') + "<div><p>" + l.qty + " &times; " + F.esc(l.name) + "</p>" + (l.note ? "<small>" + F.esc(l.note) + "</small>" : "") + "</div><b>" + F.price(l.unit * l.qty) + "</b></div>";
        })
        .join("") +
      '<dl class="totals">' +
      "<div><dt>Subtotal</dt><dd>" + F.price(o.totals.sub) + "</dd></div>" +
      (o.totals.disc ? "<div><dt>Discount (" + o.totals.code + ")</dt><dd>&minus; " + F.price(o.totals.disc) + "</dd></div>" : "") +
      "<div><dt>" + (pick ? "Pickup" : "Delivery") + "</dt><dd>" + (o.totals.del ? F.price(o.totals.del) : "Free") + "</dd></div>" +
      '<div class="grand"><dt>Total</dt><dd>' + F.price(o.totals.total) + "</dd></div></dl></div>" +
      '<aside class="summary"><h2>Details</h2><dl class="totals">' +
      "<div><dt>Name</dt><dd>" + F.esc(o.name) + "</dd></div>" +
      "<div><dt>Mobile</dt><dd>" + F.esc(o.phone) + "</dd></div>" +
      "<div><dt>" + (pick ? "Pickup" : "Address") + "</dt><dd style=\"text-align:right\">" + F.esc(o.address) + "</dd></div>" +
      "<div><dt>Time</dt><dd>" + F.esc(o.time) + "</dd></div>" +
      "<div><dt>Payment</dt><dd>" + F.esc(o.pay) + "</dd></div></dl>" +
      '<a href="menu.html" class="btn btn-fire btn-block">Order again</a><a href="order.html" class="btn btn-ghost btn-block">All orders</a></aside></div>' +
      '<p class="muted center" style="margin-top:30px;font-size:.85rem">Demo tracker: the stages move every few seconds so you can see the whole journey.</p>';

    var lis = box.querySelectorAll("[data-stages] li");
    var bar = box.querySelector("[data-stages] .bar");
    var eta = box.querySelector("[data-eta]");
    var timer;
    function tick() {
      var s = (Date.now() - o.at) / 1000;
      var cur = 0;
      STAGES.forEach(function (st, i) {
        if (s >= st.t) cur = i;
      });
      lis.forEach(function (li, i) {
        li.classList.toggle("done", i < cur || cur === STAGES.length - 1);
        li.classList.toggle("now", i === cur && cur < STAGES.length - 1);
      });
      bar.style.setProperty("--p", cur / (STAGES.length - 1));
      var last = cur === STAGES.length - 1;
      var left = last ? 0 : Math.ceil(STAGES[STAGES.length - 1].t - s);
      eta.textContent = last ? (pick ? "Enjoy it while it's hot." : "Delivered. Enjoy it while it's hot.") : (pick ? "Ready in about " : "Arriving in about ") + left + " sec (demo time)";
      if (last) clearInterval(timer);
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  var run = { menu: menu, deals: deals, contact: contact, cart: cartPage, checkout: checkout, order: order }[page];
  if (run) run();
  F.reveal();
})();

/* FUOCO — shared by every page: header, footer, cart (localStorage) with a slide-in
   drawer, size picker, toasts, reveal animations and small helpers. */
(function () {
  "use strict";
  var D = window.FUOCO_DATA;
  var page = document.body.dataset.page || "";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var F = {
    D: D,
    reduce: reduce,
    price: function (n) {
      return "Rs " + Math.round(n).toLocaleString("en-US");
    },
    esc: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    param: function (k) {
      return new URLSearchParams(location.search).get(k);
    },
    find: function (id) {
      for (var i = 0; i < D.MENU.length; i++) if (D.MENU[i].id === id) return D.MENU[i];
      return null;
    },
    sizeLabel: function (s) {
      for (var i = 0; i < D.SIZES.length; i++) if (D.SIZES[i].id === s) return D.SIZES[i].label;
      return "";
    },
  };

  /* ---------- storage ---------- */
  var mem = {};
  F.load = function (k, fb) {
    try {
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fb;
    } catch (e) {
      return k in mem ? mem[k] : fb;
    }
  };
  F.save = function (k, v) {
    mem[k] = v;
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  };

  /* ---------- cart ----------
     line: { key, kind: "item"|"custom"|"deal", id, size, qty, name, note, unit, photo } */
  var cart = F.load("fuoco-cart", []);
  var subs = [];
  function commit() {
    F.save("fuoco-cart", cart);
    subs.forEach(function (fn) {
      fn(cart);
    });
  }
  F.cart = {
    lines: function () {
      return cart.slice();
    },
    count: function () {
      return cart.reduce(function (n, l) {
        return n + l.qty;
      }, 0);
    },
    subtotal: function () {
      return cart.reduce(function (n, l) {
        return n + l.unit * l.qty;
      }, 0);
    },
    add: function (line) {
      var hit = cart.filter(function (l) {
        return l.key === line.key;
      })[0];
      if (hit) hit.qty = Math.min(20, hit.qty + (line.qty || 1));
      else cart.push(Object.assign({ qty: 1 }, line));
      commit();
    },
    setQty: function (key, q) {
      cart = cart
        .map(function (l) {
          if (l.key === key) l.qty = Math.max(0, Math.min(20, q));
          return l;
        })
        .filter(function (l) {
          return l.qty > 0;
        });
      commit();
    },
    clear: function () {
      cart = [];
      commit();
    },
    on: function (fn) {
      subs.push(fn);
    },
  };

  // add a menu item (pizzas need a size)
  F.addItem = function (id, size, qty) {
    var p = F.find(id);
    if (!p) return;
    var unit = p.prices ? p.prices[size || "m"] : p.price;
    F.cart.add({
      key: id + "|" + (p.prices ? size || "m" : ""),
      kind: "item",
      id: id,
      size: p.prices ? size || "m" : "",
      qty: qty || 1,
      name: p.name,
      note: p.prices ? F.sizeLabel(size || "m") : "",
      unit: unit,
      photo: p.photo,
    });
    F.added(p.name);
  };

  F.DELIVERY = 150;
  F.FREE_FROM = 2500;
  F.PROMOS = { FIRE20: 0.2, FIRST10: 0.1 };
  F.totals = function (code, mode) {
    var sub = F.cart.subtotal();
    var rate = code && F.PROMOS[code] ? F.PROMOS[code] : 0;
    var disc = Math.round(sub * rate);
    var del = mode === "pickup" || sub === 0 || sub - disc >= F.FREE_FROM ? 0 : F.DELIVERY;
    return { sub: sub, disc: disc, del: del, total: sub - disc + del, code: rate ? code : "" };
  };

  /* ---------- toast ---------- */
  var toast, tt;
  F.say = function (msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(tt);
    tt = setTimeout(function () {
      toast.classList.remove("on");
    }, 2800);
  };
  F.added = function (name) {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    });
    F.openCart();
  };

  /* ---------- layout ---------- */
  var NAV = [
    { href: "index.html", label: "Home", id: "home" },
    { href: "menu.html", label: "Menu", id: "menu" },
    { href: "build.html", label: "Build your pizza", id: "build" },
    { href: "deals.html", label: "Deals", id: "deals" },
    { href: "about.html", label: "Our story", id: "about" },
    { href: "contact.html", label: "Find us", id: "contact" },
  ];
  var ICON = {
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    flame:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4.4 0 7-2.9 7-6.6 0-3.7-2.6-5.8-4.2-8.4-.6 2-1.6 3.1-2.8 3.6.3-3.3-1.2-6.6-4-8.6.2 3.6-3 6.2-3 10.8C5 19.1 7.6 22 12 22Z"/></svg>',
  };
  F.ICON = ICON;

  function header() {
    return (
      '<header class="nav">' +
      '<a href="index.html" class="logo" aria-label="Fuoco home">' + ICON.flame + "<span>FUOCO<small>Wood-fired pizza</small></span></a>" +
      '<nav class="nav-links" aria-label="Main">' +
      NAV.map(function (n) {
        return '<a href="' + n.href + '"' + (n.id === page ? ' aria-current="page"' : "") + ">" + n.label + "</a>";
      }).join("") +
      "</nav>" +
      '<div class="nav-actions">' +
      '<a href="menu.html" class="btn btn-fire btn-sm nav-order">Order now</a>' +
      '<button type="button" class="cart-btn" data-open-cart aria-label="Open your order">' + ICON.bag + '<span class="cart-count" data-cart-count>0</span></button>' +
      '<button type="button" class="menu-btn" data-menu aria-expanded="false" aria-label="Menu"><span></span><span></span><span></span></button>' +
      "</div></header>" +
      '<div class="mnav" data-mnav aria-hidden="true"><nav>' +
      NAV.map(function (n) {
        return '<a href="' + n.href + '">' + n.label + "</a>";
      }).join("") +
      '<a href="cart.html">Your order</a></nav></div>'
    );
  }
  function footer() {
    return (
      '<footer class="footer">' +
      '<div class="footer-cta"><p class="kicker">Hungry yet?</p><h2 class="display">Hot in <span class="fire-text">30 minutes</span></h2>' +
      '<div class="row"><a href="menu.html" class="btn btn-fire">Order now</a><a href="build.html" class="btn btn-ghost">Build your own</a></div></div>' +
      '<div class="footer-grid">' +
      '<div><a href="index.html" class="logo">' + ICON.flame + "<span>FUOCO<small>Wood-fired pizza</small></span></a>" +
      '<p class="muted">48-hour dough, a 450&deg;C oven and 90 seconds of fire. Gujrat, Pakistan.</p></div>' +
      '<div><p class="kicker">Order</p><ul><li><a href="menu.html">Menu</a></li><li><a href="build.html">Build your pizza</a></li><li><a href="deals.html">Deals</a></li><li><a href="order.html">Track an order</a></li></ul></div>' +
      '<div><p class="kicker">Fuoco</p><ul><li><a href="about.html">Our story</a></li><li><a href="contact.html">Find us</a></li><li><a href="contact.html#faq">FAQ</a></li></ul></div>' +
      '<div><p class="kicker">Open daily</p><p>12:00 pm &ndash; 1:00 am</p><p class="muted">Delivery across Gujrat city</p></div>' +
      "</div>" +
      '<div class="footer-bottom"><p>&copy; ' + new Date().getFullYear() + " Fuoco Pizza Co. A concept brand &mdash; no real orders are placed.</p>" +
      '<p>Designed &amp; developed by <a href="https://www.linkedin.com/in/sameer-ashraf-541691387" target="_blank" rel="noreferrer">Sameer Ashraf</a> &middot; Vision Spider Tech</p></div>' +
      "</footer>"
    );
  }
  function drawer() {
    return (
      '<div class="scrim" data-close-cart></div>' +
      '<aside class="drawer" aria-label="Your order" aria-hidden="true">' +
      '<div class="drawer-head"><p class="drawer-title">Your order <span data-cart-count>0</span></p><button type="button" class="icon-btn" data-close-cart aria-label="Close">' + ICON.x + "</button></div>" +
      '<div class="drawer-body" data-drawer></div>' +
      '<div class="drawer-foot"><div class="meter"><i data-meter></i></div><p class="drawer-note" data-free></p>' +
      '<div class="drawer-sub"><span>Subtotal</span><b data-sub>Rs 0</b></div>' +
      '<a href="checkout.html" class="btn btn-fire btn-block" data-to-checkout>Checkout</a><a href="cart.html" class="btn btn-ghost btn-block">View order</a></div>' +
      "</aside>" +
      // size picker modal
      '<div class="modal" data-size-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="sz-title">' +
      '<div class="modal-card"><button type="button" class="icon-btn modal-x" data-close-size aria-label="Close">' + ICON.x + "</button>" +
      '<div class="modal-img"><img alt="" data-sz-img /></div><div class="modal-body"><p class="kicker" data-sz-kicker>Choose a size</p><h3 id="sz-title" data-sz-name></h3>' +
      '<div class="size-opts" data-sz-opts role="radiogroup" aria-label="Size"></div>' +
      '<div class="row between"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-sz-q="-1" aria-label="Fewer">&minus;</button><span data-sz-qty>1</span><button type="button" data-sz-q="1" aria-label="More">+</button></div>' +
      '<button type="button" class="btn btn-fire" data-sz-add>Add &middot; <span data-sz-price></span></button></div></div></div></div>' +
      '<div class="toast" role="status" aria-live="polite"></div>'
    );
  }

  function lineHTML(l, full) {
    return (
      '<div class="line" data-key="' + F.esc(l.key) + '">' +
      '<div class="line-img">' + (l.photo ? '<img src="' + D.img(l.photo, 160, 160) + '" alt="" loading="lazy" />' : '<span class="line-diy">DIY</span>') + "</div>" +
      '<div class="line-info"><p class="line-name">' + F.esc(l.name) + "</p>" +
      (l.note ? '<p class="line-note">' + F.esc(l.note) + "</p>" : "") +
      '<div class="line-row"><div class="qty qty-sm"><button type="button" data-q="-1" aria-label="Fewer">&minus;</button><span>' + l.qty + '</span><button type="button" data-q="1" aria-label="More">+</button></div>' +
      '<button type="button" class="link-btn" data-rm>Remove</button></div></div>' +
      '<p class="line-price">' + F.price(l.unit * l.qty) + "</p></div>"
    );
  }
  F.lineHTML = lineHTML;

  function renderCart() {
    var n = F.cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(n);
    });
    var box = document.querySelector("[data-drawer]");
    var lines = F.cart.lines();
    box.innerHTML = lines.length
      ? lines.map(function (l) {
          return lineHTML(l);
        }).join("")
      : '<div class="empty">' + ICON.bag + '<p>Your order is empty.</p><a href="menu.html" class="btn btn-fire btn-sm">See the menu</a></div>';
    var sub = F.cart.subtotal();
    document.querySelector("[data-sub]").textContent = F.price(sub);
    var left = F.FREE_FROM - sub;
    document.querySelector("[data-free]").textContent = !sub ? "Free delivery on orders over " + F.price(F.FREE_FROM) + "." : left > 0 ? "Add " + F.price(left) + " for free delivery." : "Free delivery unlocked.";
    document.querySelector("[data-meter]").style.transform = "scaleX(" + Math.min(1, sub / F.FREE_FROM) + ")";
    document.querySelector("[data-to-checkout]").classList.toggle("is-off", !lines.length);
  }

  F.openCart = function () {
    document.body.classList.add("cart-open");
    document.querySelector(".drawer").setAttribute("aria-hidden", "false");
  };
  F.closeCart = function () {
    document.body.classList.remove("cart-open");
    document.querySelector(".drawer").setAttribute("aria-hidden", "true");
  };

  /* ---------- size picker ---------- */
  var sz = { p: null, size: "m", qty: 1 };
  F.pickSize = function (id) {
    var p = F.find(id);
    if (!p) return;
    if (!p.prices) return F.addItem(id, "", 1);
    sz = { p: p, size: "m", qty: 1 };
    var m = document.querySelector("[data-size-modal]");
    m.querySelector("[data-sz-img]").src = D.img(p.photo, 600, 600);
    m.querySelector("[data-sz-img]").alt = p.name;
    m.querySelector("[data-sz-name]").textContent = p.name;
    m.querySelector("[data-sz-opts]").innerHTML = D.SIZES.map(function (s) {
      return '<button type="button" class="size-opt' + (s.id === "m" ? " on" : "") + '" role="radio" aria-checked="' + (s.id === "m") + '" data-sz="' + s.id + '"><b>' + s.label + "</b><small>" + s.serves + "</small><span>" + F.price(p.prices[s.id]) + "</span></button>";
    }).join("");
    szRender();
    m.classList.add("on");
    m.setAttribute("aria-hidden", "false");
    m.querySelector("[data-sz-add]").focus();
  };
  function szRender() {
    var m = document.querySelector("[data-size-modal]");
    m.querySelector("[data-sz-qty]").textContent = String(sz.qty);
    m.querySelector("[data-sz-price]").textContent = F.price(sz.p.prices[sz.size] * sz.qty);
  }
  function closeSize() {
    var m = document.querySelector("[data-size-modal]");
    m.classList.remove("on");
    m.setAttribute("aria-hidden", "true");
  }

  /* ---------- reveals ---------- */
  F.reveal = function (root) {
    var els = (root || document).querySelectorAll(".rv:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (e) {
        e.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting) {
            x.target.classList.add("in");
            io.unobserve(x.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  };

  F.validate = function (form) {
    var ok = true;
    form.querySelectorAll("[data-field]").forEach(function (w) {
      var i = w.querySelector("input, select, textarea");
      if (!i || i.disabled || w.closest("[hidden]")) return;
      var v = (i.value || "").trim(),
        msg = "";
      if (i.required && !v) msg = "This field is required.";
      else if (v && i.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter a valid email address.";
      else if (v && i.dataset.type === "phone" && !/^(\+92|0)?3\d{2}[\s-]?\d{7}$/.test(v.replace(/\s/g, ""))) msg = "Enter a mobile number like 0300 1234567.";
      else if (v && i.minLength > 0 && v.length < i.minLength) msg = "Please write a little more.";
      w.classList.toggle("err", !!msg);
      var e = w.querySelector(".ferr");
      if (e) e.textContent = msg;
      if (msg && ok) {
        ok = false;
        i.focus();
      }
    });
    return ok;
  };

  /* ---------- boot ---------- */
  var h = document.querySelector("[data-header]");
  if (h) h.outerHTML = header();
  var f = document.querySelector("[data-footer]");
  if (f) f.outerHTML = footer();
  document.body.insertAdjacentHTML("beforeend", drawer());
  toast = document.querySelector(".toast");
  F.cart.on(renderCart);
  renderCart();

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-open-cart]")) F.openCart();
    if (t.closest("[data-close-cart]")) F.closeCart();
    var co = t.closest("[data-to-checkout]");
    if (co && co.classList.contains("is-off")) {
      e.preventDefault();
      F.say("Add something tasty first.");
    }
    // quantity / remove on any cart line
    var line = t.closest("[data-key]");
    if (line) {
      var key = line.dataset.key;
      var cur = F.cart.lines().filter(function (l) {
        return l.key === key;
      })[0];
      if (cur && t.closest("[data-q]")) F.cart.setQty(key, cur.qty + Number(t.closest("[data-q]").dataset.q));
      if (cur && t.closest("[data-rm]")) {
        F.cart.setQty(key, 0);
        F.say(cur.name + " removed.");
      }
    }
    // add buttons anywhere
    var add = t.closest("[data-add]");
    if (add) F.pickSize(add.dataset.add);
    // size modal
    var opt = t.closest("[data-sz]");
    if (opt) {
      sz.size = opt.dataset.sz;
      document.querySelectorAll("[data-sz]").forEach(function (o) {
        o.classList.toggle("on", o === opt);
        o.setAttribute("aria-checked", String(o === opt));
      });
      szRender();
    }
    var q = t.closest("[data-sz-q]");
    if (q) {
      sz.qty = Math.max(1, Math.min(20, sz.qty + Number(q.dataset.szQ)));
      szRender();
    }
    if (t.closest("[data-sz-add]")) {
      closeSize();
      F.addItem(sz.p.id, sz.size, sz.qty);
    }
    if (t.closest("[data-close-size]") || t.matches("[data-size-modal]")) closeSize();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      F.closeCart();
      closeSize();
      closeMenu();
    }
  });

  var mb = document.querySelector("[data-menu]"),
    mn = document.querySelector("[data-mnav]");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (mb) mb.setAttribute("aria-expanded", "false");
    if (mn) mn.setAttribute("aria-hidden", "true");
  }
  if (mb)
    mb.addEventListener("click", function () {
      var o = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", o);
      mb.setAttribute("aria-expanded", String(o));
      mn.setAttribute("aria-hidden", String(!o));
    });
  if (mn)
    mn.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });

  var nav = document.querySelector(".nav");
  var onS = function () {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onS, { passive: true });
  onS();

  window.FUOCO = F;
  document.addEventListener("DOMContentLoaded", function () {
    F.reveal();
  });
})();

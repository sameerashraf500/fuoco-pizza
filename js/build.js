/* FUOCO — build your own pizza. Each topping is drawn in SVG and drops onto the
   pizza when picked; price and summary update live. */
(function () {
  "use strict";
  var F = window.FUOCO,
    B = F.D.BUILD;
  var $ = function (s) {
    return document.querySelector(s);
  };
  var NS = "http://www.w3.org/2000/svg";

  var state = { size: "m", crust: "classic", sauce: "tomato", tops: [], qty: 1 };

  // seeded scatter so each topping keeps the same spots
  function rng(seed) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  function spots(seed, n) {
    var r = rng(seed),
      out = [];
    for (var i = 0; i < n; i++) {
      var a = r() * Math.PI * 2,
        d = Math.sqrt(r()) * 150;
      out.push({ x: 250 + Math.cos(a) * d, y: 250 + Math.sin(a) * d, rot: r() * 360 });
    }
    return out;
  }
  var DRAW = {
    pepperoni: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ')"><circle r="19" fill="#b8260f" stroke="#8a1a09" stroke-width="2"/><circle cx="-6" cy="-5" r="2.5" fill="#e8664a"/><circle cx="5" cy="4" r="2" fill="#e8664a"/><circle cx="-2" cy="8" r="1.6" fill="#e8664a"/></g>';
    },
    chicken: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ") rotate(" + p.rot + ')"><rect x="-13" y="-9" width="26" height="18" rx="6" fill="#c9752f" stroke="#8f4a18" stroke-width="2"/><path d="M-8 -3h14M-6 3h10" stroke="#7a3510" stroke-width="2"/></g>';
    },
    mushroom: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ") rotate(" + p.rot + ')"><path d="M-15 2a15 12 0 0 1 30 0Z" fill="#cdb79a" stroke="#8d7559" stroke-width="2"/><rect x="-5" y="2" width="10" height="11" rx="3" fill="#e8dcc8" stroke="#8d7559" stroke-width="2"/></g>';
    },
    olive: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ')"><circle r="8" fill="none" stroke="#1d1a17" stroke-width="5"/></g>';
    },
    pepper: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ") rotate(" + p.rot + ')"><path d="M-16 0a16 10 0 0 1 32 0" fill="none" stroke="#3d8f2c" stroke-width="5" stroke-linecap="round"/></g>';
    },
    onion: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ") rotate(" + p.rot + ')"><path d="M-15 4a15 13 0 0 1 30 0" fill="none" stroke="#a24a8a" stroke-width="3.5" stroke-linecap="round"/><path d="M-9 4a9 8 0 0 1 18 0" fill="none" stroke="#c97ab4" stroke-width="2.5" stroke-linecap="round"/></g>';
    },
    jalapeno: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ')"><circle r="10" fill="#4fa63a" stroke="#2f6f22" stroke-width="2"/><circle r="5" fill="#d9eeb2"/><circle cx="-2" cy="-1" r="1.2" fill="#f7f2d0"/><circle cx="2" cy="1.5" r="1.2" fill="#f7f2d0"/></g>';
    },
    basil: function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ") rotate(" + p.rot + ')"><path d="M-16 6C-14 -8 2 -14 16 -12 14 2 2 12 -16 6Z" fill="#3f8f2f" stroke="#2b6a1f" stroke-width="1.5"/><path d="M-14 5 14 -11" stroke="#9bd17a" stroke-width="1.4"/></g>';
    },
    "extra-cheese": function (p) {
      return '<g transform="translate(' + p.x + " " + p.y + ")\"><ellipse rx=\"22\" ry=\"15\" fill=\"#fff1b0\" opacity=\".85\" transform=\"rotate(" + p.rot + ')"/></g>';
    },
  };
  var COUNT = { pepperoni: 10, chicken: 9, mushroom: 9, olive: 12, pepper: 9, onion: 8, jalapeno: 10, basil: 6, "extra-cheese": 9 };

  // draw every topping once; picking one just turns its group on
  var layer = $("[data-b-tops]");
  B.toppings.forEach(function (t, i) {
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "topping-g");
    g.setAttribute("data-top", t.id);
    var draw = DRAW[t.id];
    g.innerHTML = spots(17 + i * 31, COUNT[t.id] || 8)
      .map(function (pt) {
        // wrap the shape so the drop animation doesn't fight the SVG transform
        return draw(pt).replace(/^(<g[^>]*>)([\s\S]*)<\/g>$/, '$1<g class="tp">$2</g></g>');
      })
      .join("");
    // extra cheese sits under the other toppings
    if (t.id === "extra-cheese") layer.insertBefore(g, layer.firstChild);
    else layer.appendChild(g);
  });

  // options
  function choice(type, name, value, title, sub, checked, extra) {
    return (
      '<label class="choice"><input type="' + type + '" name="' + name + '" value="' + value + '"' + (checked ? " checked" : "") + " />" +
      "<span>" + (extra || "") + "<b>" + title + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</span></label>"
    );
  }
  $("[data-b-sizes]").innerHTML = F.D.SIZES.map(function (s) {
    return choice("radio", "size", s.id, s.label, F.price(B.base[s.id]), s.id === state.size);
  }).join("");
  $("[data-b-crusts]").innerHTML = B.crusts.map(function (c) {
    return choice("radio", "crust", c.id, c.label, c.price ? "+ " + F.price(c.price) : "Included", c.id === state.crust);
  }).join("");
  $("[data-b-sauces]").innerHTML = B.sauces.map(function (s) {
    return choice("radio", "sauce", s.id, s.label, "", s.id === state.sauce, '<i class="dot" style="background:' + s.color + '"></i>');
  }).join("");
  $("[data-b-tops-list]").innerHTML = B.toppings.map(function (t) {
    return choice("checkbox", "top", t.id, t.label, "+ " + F.price(t.price), false);
  }).join("");

  function byId(arr, id) {
    return arr.filter(function (x) {
      return x.id === id;
    })[0];
  }
  function unit() {
    var n = B.base[state.size] + byId(B.crusts, state.crust).price;
    state.tops.forEach(function (id) {
      n += byId(B.toppings, id).price;
    });
    return n;
  }
  function desc() {
    var tops = state.tops.map(function (id) {
      return byId(B.toppings, id).label;
    });
    return [F.sizeLabel(state.size), byId(B.crusts, state.crust).label, byId(B.sauces, state.sauce).label, tops.length ? tops.join(", ") : "Cheese only"].join(" · ");
  }
  function render() {
    var vis = $("[data-b-visual]");
    vis.className = "b-visual b-size-" + state.size;
    $("[data-b-sauce]").setAttribute("fill", byId(B.sauces, state.sauce).color);
    $("[data-b-stuffed]").style.opacity = state.crust === "stuffed" ? "1" : "0";
    document.querySelectorAll("[data-top]").forEach(function (g) {
      g.classList.toggle("on", state.tops.indexOf(g.dataset.top) > -1);
    });
    $("[data-b-total]").textContent = F.price(unit());
    $("[data-b-price]").textContent = F.price(unit() * state.qty);
    $("[data-b-qty]").textContent = String(state.qty);
    $("[data-b-desc]").textContent = desc();
    $("[data-b-count]").textContent = "(" + state.tops.length + " / " + B.toppings.length + ")";
  }

  var form = $("[data-builder]");
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "size") state.size = t.value;
    if (t.name === "crust") state.crust = t.value;
    if (t.name === "sauce") state.sauce = t.value;
    if (t.name === "top") {
      state.tops = Array.prototype.map.call(form.querySelectorAll('input[name="top"]:checked'), function (i) {
        return i.value;
      });
    }
    render();
  });
  form.addEventListener("click", function (e) {
    var q = e.target.closest("[data-b-q]");
    if (q) {
      state.qty = Math.max(1, Math.min(20, state.qty + Number(q.dataset.bQ)));
      render();
    }
    if (e.target.closest("[data-b-reset]")) {
      state = { size: "m", crust: "classic", sauce: "tomato", tops: [], qty: 1 };
      form.reset();
      render();
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var key = ["custom", state.size, state.crust, state.sauce].concat(state.tops.slice().sort()).join("|");
    F.cart.add({ key: key, kind: "custom", id: "custom", size: state.size, qty: state.qty, name: "Your own pizza", note: desc(), unit: unit(), photo: "" });
    F.added("Your own pizza");
  });
  render();
})();

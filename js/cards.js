/* FUOCO — card templates shared by home, menu and deals pages. */
(function () {
  "use strict";
  var F = window.FUOCO,
    D = F.D;

  var chili = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5c4 1 5 4 7 8s4 6 8 7c-5 2-11 0-13-5S3 7 5 5Z"/></svg>';
  var leaf = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19C5 9 13 4 21 4c-1 9-7 16-17 15Z"/></svg>';

  F.itemCard = function (p, i) {
    var from = p.prices ? p.prices.s : p.price;
    return (
      '<article class="card rv" style="transition-delay:' + ((i || 0) % 4) * 80 + 'ms">' +
      '<div class="card-media">' +
      (p.badge ? '<span class="badge">' + F.esc(p.badge) + "</span>" : "") +
      '<img src="' + D.img(p.photo, 600, 600) + '" alt="' + F.esc(p.name) + '" loading="lazy" />' +
      "</div>" +
      '<div class="card-body">' +
      '<div class="card-tags">' +
      (p.veg ? '<span class="tag veg">' + leaf + "Veg</span>" : "") +
      (p.spicy ? '<span class="tag hot">' + new Array(p.spicy + 1).join(chili) + "</span>" : "") +
      "</div>" +
      '<h3 class="card-name">' + F.esc(p.name) + "</h3>" +
      '<p class="card-desc">' + F.esc(p.desc) + "</p>" +
      '<div class="card-foot"><p class="card-price">' + (p.prices ? "<small>from</small> " : "") + F.price(from) + "</p>" +
      '<button type="button" class="add-btn" data-add="' + p.id + '" aria-label="Add ' + F.esc(p.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Add</span></button></div>' +
      "</div></article>"
    );
  };

  F.dealCard = function (d, i) {
    var save = Math.round((1 - d.price / d.was) * 100);
    return (
      '<article class="deal rv" style="transition-delay:' + (i || 0) * 90 + 'ms">' +
      '<div class="deal-media"><img src="' + D.img(d.photo, 800, 560) + '" alt="' + F.esc(d.name) + '" loading="lazy" /><span class="save">Save ' + save + "%</span></div>" +
      '<div class="deal-body"><p class="kicker">' + F.esc(d.tag) + '</p><h3 class="deal-name">' + F.esc(d.name) + "</h3>" +
      '<p class="card-desc">' + F.esc(d.desc) + "</p>" +
      '<div class="card-foot"><p class="card-price">' + F.price(d.price) + ' <s>' + F.price(d.was) + "</s></p>" +
      '<button type="button" class="btn btn-fire btn-sm" data-deal="' + d.id + '">Grab deal</button></div></div></article>'
    );
  };

  F.addDeal = function (id) {
    var d = D.DEALS.filter(function (x) {
      return x.id === id;
    })[0];
    if (!d) return;
    var note = d.items
      .map(function (it) {
        var p = F.find(it.id);
        return it.qty + "× " + p.name + (it.size ? " (" + F.sizeLabel(it.size).split(" ")[0] + ")" : "");
      })
      .join(", ");
    F.cart.add({ key: "deal|" + d.id, kind: "deal", id: d.id, qty: 1, name: d.name + " deal", note: note, unit: d.price, photo: d.photo });
    F.added(d.name);
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-deal]");
    if (b) F.addDeal(b.dataset.deal);
  });

  // countdown to midnight, shared by home + deals
  F.countdown = function (el) {
    if (!el) return;
    var tick = function () {
      var now = new Date(),
        end = new Date(now);
      end.setHours(24, 0, 0, 0);
      var s = Math.max(0, Math.floor((end - now) / 1000));
      var h = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60),
        ss = s % 60;
      el.textContent = [h, m, ss]
        .map(function (n) {
          return (n < 10 ? "0" : "") + n;
        })
        .join(":");
    };
    tick();
    setInterval(tick, 1000);
  };
})();

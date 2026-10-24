/* FUOCO — home page: loader, hero slider (cut-out pizza, melting cheese, floating
   ingredients, rising embers), bestsellers, deals and countdown. */
(function () {
  "use strict";
  var F = window.FUOCO,
    D = F.D;
  var reduce = F.reduce;
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };

  /* ---------- slides ---------- */
  var SLIDES = [
    { id: "pepperoni-inferno", word: "FULL OF FIRE", glow: "#ff4d1c" },
    { id: "margherita-fuoco", word: "PURE MELT", glow: "#ff8a1f" },
    { id: "green-crush", word: "GO GREEN", glow: "#7bc043" },
  ].map(function (s) {
    var p = F.find(s.id);
    return Object.assign({ p: p }, s);
  });

  var hero = $("[data-hero]");
  var idx = 0,
    timer = 0,
    paused = false;
  var DUR = 6500;
  var dots = $("[data-dots]");
  dots.innerHTML = SLIDES.map(function (s, i) {
    return '<button type="button" role="tab" aria-label="' + s.p.name + '" data-dot="' + i + '"><i></i></button>';
  }).join("");

  function wordHTML(w) {
    return w
      .split("")
      .map(function (c, i) {
        return '<span style="--i:' + i + '">' + (c === " " ? "&nbsp;" : c) + "</span>";
      })
      .join("");
  }

  // shrink the headline if it is wider than the screen
  function fit(el) {
    el.style.fontSize = "";
    var max = window.innerWidth * 0.96;
    var w = 0;
    el.querySelectorAll("span").forEach(function (sp) {
      w += sp.offsetWidth;
    });
    if (w > max) el.style.fontSize = parseFloat(getComputedStyle(el).fontSize) * (max / w) + "px";
  }
  window.addEventListener("resize", function () {
    fit($("[data-word]"));
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit($("[data-word]")); });

  function show(i, first) {
    var prev = idx;
    idx = (i + SLIDES.length) % SLIDES.length;
    var s = SLIDES[idx];
    // pizza: the old one spins away while the new one spins in
    var img = $("[data-pizza-img]");
    var out = $("[data-pizza-out]");
    if (!first) {
      out.querySelector("img").src = img.src;
      out.classList.remove("go");
      void out.offsetWidth;
      out.classList.add("go");
    }
    img.src = D.img(s.p.photo, 900, 900);
    img.alt = s.p.name;
    var pz = $("[data-pizza]");
    pz.classList.remove("enter");
    void pz.offsetWidth;
    pz.classList.add("enter");

    var word = $("[data-word]");
    word.innerHTML = wordHTML(s.word);
    word.setAttribute("aria-label", s.word);
    fit(word);
    word.classList.remove("show");
    void word.offsetWidth;
    word.classList.add("show");

    hero.style.setProperty("--glow", s.glow);
    $("[data-slide-num]").textContent = "0" + (idx + 1);
    $("[data-name]").textContent = s.p.name;
    $("[data-desc]").textContent = s.p.desc;
    $("[data-hero-price]").textContent = F.price(s.p.prices.m);
    hero.querySelectorAll("[data-dot]").forEach(function (d, j) {
      d.classList.toggle("on", j === idx);
      d.setAttribute("aria-selected", String(j === idx));
    });
    var info = $(".hero-info");
    info.classList.remove("swap");
    void info.offsetWidth;
    info.classList.add("swap");
    restart();
  }
  function restart() {
    clearTimeout(timer);
    if (reduce) return;
    var bar = hero.querySelector("[data-dot].on i");
    hero.querySelectorAll("[data-dot] i").forEach(function (b) {
      b.style.transition = "none";
      b.style.transform = "scaleX(0)";
    });
    if (bar && !paused) {
      void bar.offsetWidth;
      bar.style.transition = "transform " + DUR + "ms linear";
      bar.style.transform = "scaleX(1)";
    }
    if (!paused)
      timer = setTimeout(function () {
        show(idx + 1);
      }, DUR);
  }
  $("[data-next]").addEventListener("click", function () {
    show(idx + 1);
  });
  $("[data-prev]").addEventListener("click", function () {
    show(idx - 1);
  });
  dots.addEventListener("click", function (e) {
    var d = e.target.closest("[data-dot]");
    if (d) show(Number(d.dataset.dot));
  });
  $("[data-hero-add]").addEventListener("click", function () {
    F.pickSize(SLIDES[idx].p.id);
  });
  hero.addEventListener("mouseenter", function () {
    paused = true;
    restart();
  });
  hero.addEventListener("mouseleave", function () {
    paused = false;
    restart();
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  // swipe on touch screens
  var sx = null;
  hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  /* ---------- pointer parallax ---------- */
  var floats = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
  var stage = $("[data-stage]");
  var mx = 0, my = 0, cx = 0, cy = 0;
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    (function loop() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      floats.forEach(function (f) {
        var d = Number(f.dataset.depth);
        f.style.setProperty("--px", cx * 60 * d + "px");
        f.style.setProperty("--py", cy * 60 * d + "px");
      });
      stage.style.setProperty("--tx", cx * -14 + "px");
      stage.style.setProperty("--ty", cy * -10 + "px");
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- rising embers ---------- */
  var cv = $(".embers");
  if (cv && !reduce) {
    var cx2 = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [];
    var size = function () {
      W = hero.clientWidth;
      H = hero.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = [];
      var n = Math.round(Math.min(90, (W * H) / 16000));
      for (var i = 0; i < n; i++) parts.push(spawn(true));
    };
    var spawn = function (anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 10,
        r: Math.random() * 2 + 0.6,
        vy: Math.random() * 40 + 25,
        vx: (Math.random() - 0.5) * 20,
        life: Math.random(),
        hue: 20 + Math.random() * 25,
      };
    };
    size();
    window.addEventListener("resize", size);
    var last = performance.now();
    var visible = true;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);
    (function draw(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        cx2.clearRect(0, 0, W, H);
        cx2.globalCompositeOperation = "lighter";
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.vy * dt;
          p.x += (p.vx + Math.sin((p.y + p.life * 100) / 40) * 12) * dt;
          p.life += dt * 0.15;
          var a = Math.max(0, 1 - p.y / H) * 0.15 + Math.max(0, Math.sin(p.life * 3.14)) * 0.7;
          if (p.y < -10 || p.life > 1) parts[i] = spawn(false);
          var g = cx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, "hsla(" + p.hue + ",100%,65%," + a + ")");
          g.addColorStop(1, "hsla(" + p.hue + ",100%,50%,0)");
          cx2.fillStyle = g;
          cx2.beginPath();
          cx2.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          cx2.fill();
        }
        cx2.globalCompositeOperation = "source-over";
      }
      requestAnimationFrame(draw);
    })(last);
  }

  /* ---------- sections ---------- */
  var best = ["pepperoni-inferno", "fiery-tikka", "margherita-fuoco", "loaded-feast"].map(F.find);
  $("[data-best]").innerHTML = best.map(F.itemCard).join("");
  $("[data-deals]").innerHTML = D.DEALS.map(F.dealCard).join("");
  F.countdown($("[data-countdown]"));
  F.reveal();

  /* ---------- loader, then start ---------- */
  var start = function () {
    document.body.classList.add("ready");
    show(0, true);
  };
  var firstImg = new Image();
  firstImg.src = D.img(SLIDES[0].p.photo, 900, 900);
  var done = false;
  var go = function () {
    if (done) return;
    done = true;
    setTimeout(start, reduce ? 0 : 500);
  };
  firstImg.onload = go;
  firstImg.onerror = go;
  setTimeout(go, 2500);
  // preload the other slides
  SLIDES.slice(1).forEach(function (s) {
    new Image().src = D.img(s.p.photo, 900, 900);
  });
})();

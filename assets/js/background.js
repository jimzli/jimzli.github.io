// Tron-inspired ambient background: a drifting blockchain node network with
// neon traces and travelling order-flow pulses. Light on the CPU (pre-rendered
// glow sprites, one batched line path, ~30fps), theme-aware, and paused when
// the tab is hidden.
(function () {
  "use strict";

  var canvas = document.getElementById("bg");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  // Per-theme palette. Dark uses additive "lighter" glow; light uses normal
  // compositing with deeper colours so the network reads on a pale background.
  var PALETTES = {
    dark:  { line: "232,176,75", comp: "lighter",     node: "232,176,75",
             pulseA: "232,176,75", pulseB: "67,211,158", lineA: 0.07, coreA: 0.32 },
    light: { line: "96,150,250",  comp: "source-over",  node: "96,150,250",
             pulseA: "96,150,250", pulseB: "31,157,107", lineA: 0.05,  coreA: 0.16 }
  };

  var pal, glowNode, glowA, glowB;
  var w = 0, h = 0, dpr = 1;
  var nodes = [], pulses = [];
  var raf = null, last = 0;
  var INTERVAL = 1000 / 30;
  var LINK = 135, LINK2 = LINK * LINK;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeGlow(rgb, size) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var g = c.getContext("2d"), r = size / 2;
    var grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(" + rgb + ",0.22)");
    grad.addColorStop(0.45, "rgba(" + rgb + ",0.05)");
    grad.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function applyTheme() {
    var t = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    pal = PALETTES[t];
    glowNode = makeGlow(pal.node, 20);
    glowA = makeGlow(pal.pulseA, 18);
    glowB = makeGlow(pal.pulseB, 18);
  }

  function seed() {
    var count = Math.min(55, Math.round((w * h) / 28000));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1,
        s: Math.random() < 0.5 ? 2 : 3
      });
    }
    pulses = [];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    var i, n;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // links: one batched path, single stroke
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + pal.line + "," + pal.lineA + ")";
    ctx.beginPath();
    for (i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy >= LINK2) continue;
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        if (Math.random() < 0.0006 && pulses.length < 18) {
          pulses.push({ a: a, b: b, t: 0, sp: 0.004 + Math.random() * 0.009,
                        g: Math.random() < 0.5 ? glowA : glowB });
        }
      }
    }
    ctx.stroke();

    // glow stamps for blocks + pulses
    ctx.globalCompositeOperation = pal.comp;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      ctx.drawImage(glowNode, n.x - 10, n.y - 10, 20, 20);
    }
    for (var p = pulses.length - 1; p >= 0; p--) {
      var pl = pulses[p];
      pl.t += pl.sp;
      if (pl.t >= 1) { pulses.splice(p, 1); continue; }
      var px = pl.a.x + (pl.b.x - pl.a.x) * pl.t;
      var py = pl.a.y + (pl.b.y - pl.a.y) * pl.t;
      ctx.drawImage(pl.g, px - 9, py - 9, 18, 18);
    }
    ctx.globalCompositeOperation = "source-over";

    // crisp block cores
    ctx.fillStyle = "rgba(" + pal.node + "," + pal.coreA + ")";
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      ctx.fillRect(n.x - n.s / 2, n.y - n.s / 2, n.s, n.s);
    }
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - last < INTERVAL) return;
    last = ts;
    frame();
  }

  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt); rt = setTimeout(resize, 150);
  });
  window.addEventListener("themechange", function () {
    applyTheme();
    if (reduce) frame();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  applyTheme();
  resize();
  if (reduce) frame();
  else start();
})();

// Tron-inspired ambient background: a drifting blockchain node network with
// neon traces and travelling order-flow pulses. Tuned to be light on the CPU:
// glow is a pre-rendered sprite (no per-frame shadowBlur), links draw in one
// batched path, and the loop is throttled and pauses when the tab is hidden.
(function () {
  "use strict";

  var canvas = document.getElementById("bg");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var AMBER = "232,176,75";
  var GREEN = "67,211,158";

  var w = 0, h = 0, dpr = 1;
  var nodes = [], pulses = [];
  var raf = null, last = 0;
  var INTERVAL = 1000 / 30;     // ~30fps is plenty for slow drift
  var LINK = 135, LINK2 = LINK * LINK;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pre-rendered radial glow sprite (drawn once, stamped cheaply each frame)
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
  var glowAmber = makeGlow(AMBER, 20);
  var glowGreen = makeGlow(GREEN, 18);

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
    ctx.strokeStyle = "rgba(" + AMBER + ",0.07)";
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
                        g: Math.random() < 0.5 ? glowAmber : glowGreen });
        }
      }
    }
    ctx.stroke();

    // glow stamps (additive) for blocks + pulses, then crisp cores
    ctx.globalCompositeOperation = "lighter";
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      ctx.drawImage(glowAmber, n.x - 10, n.y - 10, 20, 20);
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

    ctx.fillStyle = "rgba(" + AMBER + ",0.32)";
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
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  resize();
  if (reduce) frame();   // single static frame, no animation
  else start();
})();

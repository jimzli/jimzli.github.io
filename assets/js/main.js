// Jim Li — interactions: scroll reveal + sticky topbar + email assembly
(function () {
  "use strict";

  // Reassemble email links at runtime so the address is never in static HTML
  document.querySelectorAll(".js-mail").forEach(function (a) {
    var u = a.getAttribute("data-u");
    var d = a.getAttribute("data-d");
    if (!u || !d) return;
    var addr = u + "@" + d;
    a.setAttribute("href", "mailto:" + addr);
    if (!a.hasAttribute("data-label")) a.textContent = addr;
  });

  // Reveal-on-scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal-up").forEach(function (el) {
    io.observe(el);
  });

  // Sticky topbar border once scrolled past hero top
  var topbar = document.querySelector(".topbar");
  function onScroll() {
    if (!topbar) return;
    topbar.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Jim Li — interactions: scroll reveal + sticky topbar
(function () {
  "use strict";

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

// Jim Li interactions: scroll reveal + sticky topbar + email assembly
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

  // External links require a deliberate double-click (single click arms a hint)
  document.querySelectorAll(".row__link, .list__link").forEach(function (a) {
    a.setAttribute("title", "Double-click to open");
    var timer;
    function open() { window.open(a.href, "_blank", "noopener"); }
    a.addEventListener("click", function (e) {
      e.preventDefault();
      a.classList.add("is-armed");
      clearTimeout(timer);
      timer = setTimeout(function () { a.classList.remove("is-armed"); }, 1400);
    });
    a.addEventListener("dblclick", function (e) {
      e.preventDefault();
      clearTimeout(timer);
      a.classList.remove("is-armed");
      open();
    });
    // Keep keyboard access: Enter opens directly
    a.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); open(); }
    });
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

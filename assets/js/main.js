// Jim Li interactions: scroll reveal + sticky topbar + email assembly
(function () {
  "use strict";

  // Theme toggle (persisted; initial value set by the inline head script)
  var themeBtn = document.querySelector(".topbar__theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      var meta = document.querySelector("meta[name=theme-color]");
      if (meta) meta.content = next === "light" ? "#f4f6fa" : "#0b0c0e";
      try { localStorage.setItem("theme", next); } catch (e) {}
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    });
  }

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

  // Sticky topbar border + scroll-to-top button visibility
  var topbar = document.querySelector(".topbar");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    if (topbar) topbar.classList.toggle("is-stuck", y > 24);
    if (toTop) toTop.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();

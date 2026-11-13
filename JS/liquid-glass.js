// Which parts of the site are Liquid Glass. Looks are in css/liquid-glass.css;
// the engine is js/glisse.js (built from vendor/glisse by `npm run build:glass`).
// Elements added later (filters, lightbox, menus) are picked up automatically.
// Any element can also opt in from HTML with `data-glass` (or `data-glass="static"`).
(function () {
  if (!window.Glisse) return;

  // Surfaces that hold still.
  Glisse.auto(".navbar, .nav-container, .experience-badge, .academy-photo figcaption", { press: false });

  // Controls: these also swell and stretch under a finger, as iOS glass does.
  Glisse.auto(
    [
      ".btn-primary",
      ".btn-secondary",
      ".btn-card",
      ".demo-cta-btn",
      ".filter-btn",
      ".journey-filter-btn",
      ".test-btn",
      ".lightbox-close",
      ".lightbox-prev",
      ".lightbox-next",
      ".lightbox-zoom-btn",
      ".whatsapp-float",
    ].join(", ")
  );
})();

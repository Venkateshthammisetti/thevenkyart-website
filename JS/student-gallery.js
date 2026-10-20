// ==========================================
// STUDENT GALLERY (students.html)
// Filters + "show more" paging + a lightbox with captions,
// keyboard, swipe and neighbour preloading.
// The grid itself is static HTML written by build-student-gallery.js,
// so every photo still shows (and links to its large version) without JS.
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("sgGrid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll(".sg-item"));
  const filterBtns = Array.from(document.querySelectorAll(".sg-filter"));
  const moreBtn = document.getElementById("sgMore");
  const status = document.getElementById("sgStatus");
  const PAGE_SIZE = window.matchMedia("(max-width: 768px)").matches ? 18 : 30;
  const FILTERS = new Set(["all", "online", "studio", "community"]);
  const LABELS = { all: "photos", online: "online class photos", studio: "studio photos", community: "community photos" };

  let current = "all";
  let shown = PAGE_SIZE;

  grid.classList.add("is-enhanced");

  // Park the sticky filter bar just under the floating navbar, whatever height it has
  const navPill = document.querySelector(".navbar .nav-container") || document.querySelector(".navbar");
  let stickyQueued = false;
  function syncStickyTop() {
    stickyQueued = false;
    const bottom = navPill ? navPill.getBoundingClientRect().bottom : 0;
    document.documentElement.style.setProperty("--sg-sticky-top", `${Math.max(0, Math.round(bottom + 8))}px`);
  }
  function queueStickyTop() {
    if (!stickyQueued) requestAnimationFrame(syncStickyTop);
    stickyQueued = true;
  }
  syncStickyTop();
  window.addEventListener("resize", queueStickyTop, { passive: true });
  window.addEventListener("scroll", queueStickyTop, { passive: true });

  // Fade each tile in once its image has loaded
  items.forEach((item) => {
    const img = item.querySelector("img");
    if (img.complete && img.naturalWidth > 0) item.classList.add("is-loaded");
    else {
      img.addEventListener("load", () => item.classList.add("is-loaded"), { once: true });
      img.addEventListener("error", () => item.classList.add("is-loaded"), { once: true });
    }
  });

  function matching() {
    return items.filter((item) => current === "all" || item.dataset.cat === current);
  }

  function render() {
    const list = matching();
    items.forEach((item) => {
      item.hidden = true;
    });
    list.forEach((item, i) => {
      item.hidden = i >= shown;
    });

    const remaining = list.length - Math.min(shown, list.length);
    moreBtn.hidden = remaining <= 0;
    moreBtn.textContent = `Show ${Math.min(remaining, PAGE_SIZE)} more`;
    if (remaining > PAGE_SIZE) moreBtn.textContent += ` of ${remaining}`;

    filterBtns.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.sgFilter === current)));
  }

  function setFilter(filter, { announce = true, updateHash = true } = {}) {
    if (!FILTERS.has(filter)) filter = "all";
    current = filter;
    shown = PAGE_SIZE;
    render();
    if (announce) status.textContent = `Showing ${matching().length} ${LABELS[filter]}`;
    if (updateHash) {
      const url = new URL(window.location);
      url.hash = filter === "all" ? "gallery" : filter;
      history.replaceState(null, "", url);
    }
  }

  filterBtns.forEach((btn) => btn.addEventListener("click", () => setFilter(btn.dataset.sgFilter)));

  // Shortcuts elsewhere on the page (classroom panels, community band)
  document.querySelectorAll("a[data-sg-filter]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setFilter(link.dataset.sgFilter);
      document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  moreBtn.addEventListener("click", () => {
    const firstNew = matching()[shown];
    shown += PAGE_SIZE;
    render();
    // Keep keyboard users where the new photos start
    if (firstNew) firstNew.querySelector(".sg-link").focus({ preventScroll: true });
  });

  const initial = window.location.hash.slice(1);
  setFilter(FILTERS.has(initial) ? initial : "all", { announce: false, updateHash: false });
  if (FILTERS.has(initial) && initial !== "all") {
    document.getElementById("gallery").scrollIntoView({ block: "start" });
  }

  // ---------- Lightbox ----------
  const dialog = document.getElementById("sgLightbox");
  const img = document.getElementById("sgLightboxImg");
  const title = document.getElementById("sgLightboxTitle");
  const meta = document.getElementById("sgLightboxMeta");
  const count = document.getElementById("sgLightboxCount");
  if (!dialog || typeof dialog.showModal !== "function") return; // links still open the large image

  const CAT_LABEL = { online: "Online class", studio: "Hyderabad studio", community: "Community" };
  let set = [];
  let index = 0;
  let lastFocus = null;

  function linkOf(item) {
    return item.querySelector(".sg-link");
  }

  function preload(i) {
    const item = set[(i + set.length) % set.length];
    if (item) new Image().src = linkOf(item).href;
  }

  function show(i) {
    index = (i + set.length) % set.length;
    const item = set[index];
    const link = linkOf(item);
    const thumb = item.querySelector("img");

    dialog.classList.add("is-loading");
    // Show the already-loaded thumbnail at once, then swap in the large file
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    const full = new Image();
    full.onload = () => {
      if (set[index] !== item) return;
      img.src = full.src;
      dialog.classList.remove("is-loading");
    };
    full.src = link.href;

    title.textContent = link.dataset.title;
    meta.textContent = CAT_LABEL[item.dataset.cat] || "";
    const student = link.dataset.student;
    if (student) {
      const name = student.charAt(0).toUpperCase() + student.slice(1);
      const a = document.createElement("a");
      a.href = `profile.html?id=${encodeURIComponent(student)}`;
      a.textContent = `See ${name}'s profile`;
      meta.append(a);
    }
    count.textContent = `${index + 1} / ${set.length}`;

    preload(index + 1);
    preload(index - 1);
  }

  let isOpen = false;

  function open(item) {
    // Step through every photo in the current filter, including ones not yet revealed
    set = matching();
    lastFocus = document.activeElement;
    show(set.indexOf(item));
    dialog.showModal();
    isOpen = true;
    document.documentElement.classList.add("sg-locked");
  }

  // Runs once per open, whichever way the viewer was closed
  function cleanUp() {
    if (!isOpen) return;
    isOpen = false;
    document.documentElement.classList.remove("sg-locked");
    img.removeAttribute("src");
    // If the photo we ended on was beyond the revealed page, reveal up to it
    const item = set[index];
    if (item && item.hidden && matching().includes(item)) {
      shown = Math.ceil((matching().indexOf(item) + 1) / PAGE_SIZE) * PAGE_SIZE;
      render();
    }
    const target = item && !item.hidden ? linkOf(item) : lastFocus;
    if (target) target.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
    cleanUp();
  }

  // The close event can arrive late; ignore it if the viewer has been reopened since
  dialog.addEventListener("close", () => {
    if (!dialog.open) cleanUp();
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });

  grid.addEventListener("click", (e) => {
    const link = e.target.closest(".sg-link");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(link.closest(".sg-item"));
  });

  document.getElementById("sgLightboxClose").addEventListener("click", close);
  document.getElementById("sgLightboxPrev").addEventListener("click", () => show(index - 1));
  document.getElementById("sgLightboxNext").addEventListener("click", () => show(index + 1));

  // Click on the dark backdrop (not the photo or controls) closes
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.classList.contains("sg-lightbox__stage")) close();
  });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });

  // Swipe left/right on touch screens
  let startX = 0;
  let startY = 0;
  dialog.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  dialog.addEventListener("touchend", (e) => {
    if (e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
});

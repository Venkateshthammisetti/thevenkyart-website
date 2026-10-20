document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 0. LOADING PRELOADER (splash intro)
  // ==========================================
  // Plays on every fresh visit and every reload of the home page. It is only
  // skipped when arriving from another page of this site (e.g. tapping
  // "Home" from Courses), so moving around the site never replays it.
  const loader = document.getElementById("loader");
  const words = loader ? loader.querySelectorAll(".loader-words span") : [];

  const finishIntro = () => {
    document.body.classList.remove("no-scroll", "page-zoomed", "intro-running");
    document.body.classList.add("hero-ready");
  };

  if (loader && words.length > 0) {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navEntry && navEntry.type === "reload";
    let fromThisSite = false;
    try {
      fromThisSite =
        !!document.referrer &&
        new URL(document.referrer).origin === window.location.origin;
    } catch (e) {}

    if (fromThisSite && !isReload) {
      loader.style.display = "none";
      finishIntro();
    } else {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const brand = loader.querySelector(".loader-brand");
      const stroke = loader.querySelector(".loader-stroke");

      // Wordmark letters rise one after another
      brand.innerHTML = Array.from(brand.textContent)
        .map((ch, i) => `<span style="--i:${i}">${ch}</span>`)
        .join("");

      const WORD_STEP = reduceMotion ? 0 : 420;
      const BRAND_HOLD = reduceMotion ? 600 : 1100;
      const total = 150 + words.length * WORD_STEP + BRAND_HOLD;

      document.body.classList.add("no-scroll", "page-zoomed", "intro-running");
      loader.style.setProperty("--dur", `${total}ms`);
      requestAnimationFrame(() => loader.classList.add("is-running"));

      // Redraw the brush stroke in a new colour
      const drawStroke = (colour) => {
        stroke.style.setProperty("--stroke-c", colour);
        stroke.classList.remove("draw");
        void stroke.getBoundingClientRect(); // restart the animation
        stroke.classList.add("draw");
      };

      const exitIntro = () => {
        loader.classList.add("exit");
        // Hero starts settling from its zoom as the wordmark flies past;
        // its text arrives once the wordmark has flown past
        document.body.classList.remove("page-zoomed");
        setTimeout(finishIntro, 700);
        setTimeout(() => {
          loader.style.display = "none";
        }, 1000);
      };

      const showBrand = () => {
        loader.classList.add("show-brand");
        drawStroke("var(--primary-color)");
        setTimeout(exitIntro, BRAND_HOLD);
      };

      let current = 0;
      const showNextWord = () => {
        if (current > 0) {
          words[current - 1].classList.remove("active");
          words[current - 1].classList.add("out");
        }
        if (current < words.length) {
          const word = words[current];
          word.classList.add("active");
          drawStroke(getComputedStyle(word).getPropertyValue("--c").trim());
          current++;
          setTimeout(showNextWord, WORD_STEP);
        } else {
          showBrand();
        }
      };

      if (reduceMotion) showBrand();
      else setTimeout(showNextWord, 150);
    }
  } else {
    document.body.classList.add("hero-ready");
  }

  // ==========================================
  // 1. NAVIGATION BAR (Mobile Menu)
  // ==========================================
  // The phone menu is built as its own full-screen layer on <body>. Keeping it
  // inside the navbar let the pill's backdrop-filter become its containing
  // block, which left a 20px dark strip of the "hidden" panel on screen.
  const navbar = document.querySelector(".navbar");
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    const menu = document.createElement("div");
    menu.className = "m-menu";
    menu.id = "mobileMenu";
    menu.setAttribute("aria-hidden", "true");

    const list = document.createElement("ul");
    list.className = "m-menu__links";
    navLinks.querySelectorAll("a").forEach((a, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", i);
      const link = a.cloneNode(true);
      link.removeAttribute("style");
      li.appendChild(link);
      list.appendChild(li);
    });

    const foot = document.createElement("div");
    foot.className = "m-menu__foot";
    foot.style.setProperty("--i", list.children.length);
    foot.innerHTML =
      '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" ' +
      'href="https://wa.me/919963613404?text=Hi%20Venky,%20We%20want%20to%20connect%20for%20a%20demo%20class">Book a free demo class</a>' +
      '<a class="m-menu__mail" href="mailto:contact@thevenkyart.com">contact@thevenkyart.com</a>';

    menu.append(list, foot);
    document.body.appendChild(menu);

    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("tabindex", "0");
    hamburger.setAttribute("aria-label", "Open menu");
    hamburger.setAttribute("aria-controls", "mobileMenu");
    hamburger.setAttribute("aria-expanded", "false");

    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      hamburger.classList.toggle("toggle", open);
      document.body.classList.toggle("menu-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    hamburger.addEventListener("click", () =>
      setMenu(!menu.classList.contains("is-open")),
    );
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hamburger.click();
      }
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && menu.classList.contains("is-open")) setMenu(false);
    });
  }

  // Navbar sits clear over a dark hero, then turns solid once the page scrolls
  if (navbar) {
    const first = navbar.nextElementSibling;
    if (first && first.matches(".hero, .mural-hero")) {
      document.body.classList.add("has-hero");
    }
    const onScroll = () =>
      navbar.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ==========================================
  // 2. HERO SLIDESHOW (Fade Effect)
  // ==========================================
  const slides = document.querySelectorAll(".slide");
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 4000); // Change image every 4 seconds
  }

  // ==========================================
  // 3. READ MORE TOGGLE (About Section)
  // ==========================================
  const readMoreBtn = document.getElementById("readMoreBtn");
  const aboutMoreText = document.getElementById("about-more-text");

  if (readMoreBtn && aboutMoreText) {
    readMoreBtn.addEventListener("click", () => {
      if (aboutMoreText.style.display === "none") {
        aboutMoreText.style.display = "inline";
        readMoreBtn.textContent = "Read Less";
      } else {
        aboutMoreText.style.display = "none";
        readMoreBtn.textContent = "Read More";
      }
    });
  }

  // ==========================================
  // 3. PORTFOLIO FILTER (With Shuffle)
  // ==========================================
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  const portfolioGrid = document.querySelector(".portfolio-grid");

  if (filterBtns.length > 0 && portfolioItems.length > 0) {
    function shuffleGrid() {
      const itemsArray = Array.from(portfolioItems);
      for (let i = itemsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsArray[i], itemsArray[j]] = [itemsArray[j], itemsArray[i]];
      }
      itemsArray.forEach((item) => {
        portfolioGrid.appendChild(item);
        item.classList.remove("hide");
        item.classList.add("show");
      });
    }

    shuffleGrid();

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        // Only push state if the hash is actually changing (prevents pushState during back/forward navigation)
        const currentHash = window.location.hash.substring(1) || "all";
        if (currentHash !== filterValue) {
          if (filterValue !== "all") {
            window.history.pushState(null, null, `#${filterValue}`);
          } else {
            // Remove hash completely when 'all' is selected
            const url = new URL(window.location);
            url.hash = "";
            window.history.pushState(null, null, url.toString());
          }
        }

        if (filterValue === "all") {
          shuffleGrid();
        } else {
          portfolioItems.forEach((item) => {
            if (item.getAttribute("data-category") === filterValue) {
              item.classList.remove("hide");
              item.classList.add("show");
            } else {
              item.classList.remove("show");
              item.classList.add("hide");
            }
          });
        }
      });
    });

    // Check hash on load to apply filter immediately
    const hash = window.location.hash.substring(1);
    if (hash) {
      const targetBtn = document.querySelector(
        `.filter-btn[data-filter="${hash}"]`,
      );
      if (targetBtn) {
        // Trigger click directly without timeout
        targetBtn.click();
      }
    }

    // Handle back/forward navigation
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash.substring(1) || "all";
      const targetBtn = document.querySelector(
        `.filter-btn[data-filter="${newHash}"]`,
      );
      if (targetBtn && !targetBtn.classList.contains("active")) {
        targetBtn.click();
      }
    });
  }

  // ==========================================
  // 4. SMART LIGHTBOX (Click + Keyboard + Swipe + Zoom + Pan)
  // ==========================================
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const lightboxZoomIn = document.getElementById("lightboxZoomIn");
  const lightboxZoomOut = document.getElementById("lightboxZoomOut");

  const allItems = document.querySelectorAll(".portfolio-item, .student-card");

  let currentGalleryImages = [];
  let currentIndex = 0;

  // Zoom & pan state
  let zoomLevel = 1;
  let panX = 0;
  let panY = 0;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  function applyTransform(instant) {
    if (instant) lightboxImg.style.transition = "none";
    else lightboxImg.style.transition = "";
    lightboxImg.style.transform =
      `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    lightboxImg.style.cursor = zoomLevel > 1 ? "grab" : "default";
    if (lightboxZoomIn) lightboxZoomIn.disabled = zoomLevel >= MAX_ZOOM;
    if (lightboxZoomOut) lightboxZoomOut.disabled = zoomLevel <= MIN_ZOOM;
  }

  function setZoom(newZoom, instant) {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (zoomLevel === MIN_ZOOM) { panX = 0; panY = 0; }
    applyTransform(instant);
  }

  function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    lightboxImg.style.transform = "";
    lightboxImg.style.transition = "";
    lightboxImg.style.cursor = "default";
    if (lightboxZoomIn) lightboxZoomIn.disabled = false;
    if (lightboxZoomOut) lightboxZoomOut.disabled = true;
  }

  if (lightbox && allItems.length > 0) {
    function openLightbox(img) {
      resetZoom();
      lightbox.classList.add("active");
      lightboxImg.src = img.src;
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
      resetZoom();
    }

    // 1. Open Lightbox
    allItems.forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        if (img) {
          const visibleItems = Array.from(
            document.querySelectorAll(
              ".portfolio-item.show img, .portfolio-item:not(.hide) img, .student-card img",
            ),
          );
          currentGalleryImages = visibleItems;
          currentIndex = visibleItems.indexOf(img);
          openLightbox(img);
        }
      });
    });

    // 2. Update Image Helper
    function updateImage(index) {
      if (index >= currentGalleryImages.length) currentIndex = 0;
      else if (index < 0) currentIndex = currentGalleryImages.length - 1;
      else currentIndex = index;
      resetZoom();
      lightboxImg.src = currentGalleryImages[currentIndex].src;
    }

    // 3. Nav button click events
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      updateImage(currentIndex + 1);
    });
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      updateImage(currentIndex - 1);
    });

    // 4. Zoom button click events
    lightboxZoomIn.addEventListener("click", (e) => {
      e.stopPropagation();
      setZoom(zoomLevel + ZOOM_STEP, false);
    });
    lightboxZoomOut.addEventListener("click", (e) => {
      e.stopPropagation();
      setZoom(zoomLevel - ZOOM_STEP, false);
    });

    // 5. Keyboard: arrows + zoom keys
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "ArrowRight") updateImage(currentIndex + 1);
      else if (e.key === "ArrowLeft") updateImage(currentIndex - 1);
      else if (e.key === "Escape") closeLightbox();
      else if (e.key === "+" || e.key === "=") setZoom(zoomLevel + ZOOM_STEP, false);
      else if (e.key === "-") setZoom(zoomLevel - ZOOM_STEP, false);
      else if (e.key === "0") setZoom(MIN_ZOOM, false);
    });

    // 6. Close events
    lightboxClose.addEventListener("click", () => closeLightbox());
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // 7. Mouse wheel zoom
    lightbox.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(zoomLevel + delta, true);
    }, { passive: false });

    // 8. Mouse drag pan (when zoomed in)
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let panStartX = 0, panStartY = 0;

    lightboxImg.addEventListener("mousedown", (e) => {
      if (zoomLevel <= 1) return;
      e.preventDefault();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      lightboxImg.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      applyTransform(true);
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      if (zoomLevel > 1) lightboxImg.style.cursor = "grab";
    });

    // 9. Touch: pinch-to-zoom + pan + swipe
    let touchStartX = 0, touchEndX = 0;
    let isMultiTouch = false;
    let pinchStartDist = 0, pinchStartZoom = 1;
    let touchPanStartX = 0, touchPanStartY = 0;
    let panStartXTouch = 0, panStartYTouch = 0;

    function getPinchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    lightbox.addEventListener("touchstart", (e) => {
      isMultiTouch = e.touches.length > 1;
      if (e.touches.length === 2) {
        pinchStartDist = getPinchDist(e.touches);
        pinchStartZoom = zoomLevel;
      } else if (e.touches.length === 1) {
        touchStartX = e.changedTouches[0].screenX;
        touchPanStartX = e.changedTouches[0].clientX;
        touchPanStartY = e.changedTouches[0].clientY;
        panStartXTouch = panX;
        panStartYTouch = panY;
      }
    }, { passive: true });

    lightbox.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const newDist = getPinchDist(e.touches);
        setZoom(pinchStartZoom * (newDist / pinchStartDist), true);
      } else if (e.touches.length === 1 && zoomLevel > 1) {
        panX = panStartXTouch + (e.touches[0].clientX - touchPanStartX);
        panY = panStartYTouch + (e.touches[0].clientY - touchPanStartY);
        applyTransform(true);
      }
    }, { passive: false });

    lightbox.addEventListener("touchend", (e) => {
      if (isMultiTouch || e.touches.length > 0) {
        isMultiTouch = e.touches.length > 0;
        return;
      }
      touchEndX = e.changedTouches[0].screenX;
      if (zoomLevel <= 1) {
        if (touchEndX < touchStartX - 50) updateImage(currentIndex + 1);
        else if (touchEndX > touchStartX + 50) updateImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  // Initialize zoom-out button as disabled on page load
  if (lightboxZoomOut) lightboxZoomOut.disabled = true;

  // ==========================================
  // 5. TESTIMONIAL CAROUSEL
  // ==========================================
  const track = document.getElementById("testimonialTrack");
  const testNext = document.getElementById("testNext");
  const testPrev = document.getElementById("testPrev");

  if (track && testNext && testPrev) {
    testNext.addEventListener("click", () => {
      const cardWidth =
        track.querySelector(".testimonial-card").offsetWidth + 20;
      track.scrollBy({ left: cardWidth, behavior: "smooth" });
    });
    testPrev.addEventListener("click", () => {
      const cardWidth =
        track.querySelector(".testimonial-card").offsetWidth + 20;
      track.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
  }

  // Position dots under the swipeable testimonial row (shown on phones)
  if (track) {
    const cards = track.querySelectorAll(".testimonial-card");
    const dots = document.createElement("div");
    dots.className = "carousel-dots";
    dots.setAttribute("aria-hidden", "true");
    cards.forEach(() => dots.appendChild(document.createElement("span")));
    track.parentElement.after(dots);

    const markDot = () => {
      const centre = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - centre);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      dots.querySelectorAll("span").forEach((dot, i) =>
        dot.classList.toggle("active", i === nearest),
      );
    };
    markDot();
    track.addEventListener("scroll", markDot, { passive: true });
  }

  // ==========================================
  // 6. SCROLL ANIMATION OBSERVER
  // ==========================================
  // Grid children enter one after another instead of the grid fading as a block
  document
    .querySelectorAll(
      ".portfolio-grid, .class-grid, .features-grid, .curriculum-grid, .academy-photo-grid, .academy-stats",
    )
    .forEach((grid) => {
      if (grid.hasAttribute("data-animate")) return;
      Array.from(grid.children).forEach((child, i) => {
        if (child.hasAttribute("data-animate")) return;
        child.setAttribute("data-animate", "fade-up");
        child.style.animationDelay = `${(i % 2) * 90 + Math.min(i, 3) * 40}ms`;
      });
    });

  const scrollObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-animated");
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );

  document
    .querySelectorAll("[data-animate]")
    .forEach((el) => scrollObserver.observe(el));

  // Cards rendered later from JSON (journeys, students) also carry
  // data-animate; without this they stayed at opacity 0.
  new MutationObserver((mutations) => {
    mutations.forEach((m) =>
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches("[data-animate]")) scrollObserver.observe(node);
        node
          .querySelectorAll("[data-animate]")
          .forEach((el) => scrollObserver.observe(el));
      }),
    );
  }).observe(document.body, { childList: true, subtree: true });

  // ==========================================
  // 7. INTERACTIVE HERO TITLE (Scatter Effect)
  // ==========================================
  const heroTitles = document.querySelectorAll(
    ".hero-content h1, .mural-hero h1",
  );

  // Helper to wrap text nodes in spans (by word to prevent letter wrapping)
  function wrapCharacters(node) {
    const childNodes = Array.from(node.childNodes);
    childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim()) {
          // Keep trailing/leading spaces if any, but don't process empty text
          return;
        }
        const fragment = document.createDocumentFragment();

        // Split by whitespace but keep the whitespace tokens
        const wordsAndSpaces = child.textContent.split(/(\s+)/);

        wordsAndSpaces.forEach((part) => {
          if (!part.trim()) {
            // It's whitespace, just append it as a text node
            if (part.length > 0)
              fragment.appendChild(document.createTextNode(part));
            return;
          }

          // It's a word, wrap it in a nowrap span to prevent letters wrapping
          const wordSpan = document.createElement("span");
          wordSpan.style.whiteSpace = "nowrap";

          const chars = part.split("");
          chars.forEach((char) => {
            const span = document.createElement("span");
            span.className = "scatter-char";
            span.style.display = "inline-block";
            span.style.transition =
              "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease, filter 0.4s ease";
            span.textContent = char;
            wordSpan.appendChild(span);
          });

          fragment.appendChild(wordSpan);
        });

        node.replaceChild(fragment, child);
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        child.tagName !== "BR"
      ) {
        wrapCharacters(child); // Recurse for nested spans like .highlight
      }
    });
  }

  // Apply wrapping to each title
  heroTitles.forEach((title) => {
    wrapCharacters(title);
    title.style.perspective = "1000px";
    // Letters rise in sequence once the preloader has gone (CSS: .title-rise)
    title.querySelectorAll(".scatter-char").forEach((char, i) => {
      char.style.setProperty("--d", `${120 + i * 28}ms`);
    });
    title.classList.add("title-rise");
  });

  // Mousemove listener to scatter characters (pointer devices only — on
  // touch screens the emulated mousemove from a tap would scatter the title)
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover) document.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const triggerDistance = 150; // Radius representing the cursor field

    document.querySelectorAll(".scatter-char").forEach((char) => {
      const rect = char.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;

      const dx = charX - mouseX;
      const dy = charY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < triggerDistance) {
        // Calculate force based on proximity to cursor
        const force = (triggerDistance - distance) / triggerDistance; // 0 (far) to 1 (center)

        // Push away from cursor, multiplied by a strength factor
        const pushX = (dx / distance) * force * 100; // max push 100px
        const pushY = (dy / distance) * force * 100;
        const rotateX = (dy / distance) * force * 60; // tilt randomly
        const rotateY = -(dx / distance) * force * 60;

        // Pseudo-random rotation via modulo arithmetic on character dims
        const randomFactor = ((rect.left % 10) - 5) / 5; // -1 to 1
        const rotateZ = randomFactor * force * 90;

        char.style.transform = `translate(${pushX}px, ${pushY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(1.2)`;
        char.style.opacity = 1 - force * 0.5; // slightly fade
        char.style.filter = `blur(${force * 2}px)`; // slightly blur
      } else {
        // Reset nicely
        char.style.transform =
          "translate(0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)";
        char.style.opacity = 1;
        char.style.filter = "blur(0px)";
      }
    });
  });

  // ==========================================
  // 8. PROGRESSIVE IMAGE LOADING
  // ==========================================
  const galleryImgs = document.querySelectorAll(
    ".portfolio-item img, .student-card img",
  );

  galleryImgs.forEach((img) => {
    img.decoding = "async";
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("img-loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("img-loaded"), {
        once: true,
      });
      img.addEventListener("error", () => img.classList.add("img-loaded"), {
        once: true,
      });
    }
  });
});

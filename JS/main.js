document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 0. LOADING PRELOADER (first visit only)
  // ==========================================
  const loader = document.getElementById("loader");
  const words = document.querySelectorAll(".loader-words span");

  if (loader && words.length > 0) {
    const alreadySeen = sessionStorage.getItem("loaderShown");

    if (alreadySeen) {
      // Skip animation on return visits — hide instantly
      loader.style.display = "none";
      document.body.classList.remove("no-scroll", "page-zoomed");
    } else {
      // Mark as seen immediately so navigating away mid-animation still counts
      sessionStorage.setItem("loaderShown", "1");

      let currentWord = 0;
      const wordInterval = 400;

      document.body.classList.add("no-scroll");
      document.body.classList.add("page-zoomed");

      const showNextWord = () => {
        if (currentWord > 0 && currentWord < words.length) {
          words[currentWord - 1].classList.remove("active");
        }

        if (currentWord < words.length) {
          words[currentWord].classList.add("active");
          currentWord++;

          if (currentWord === words.length) {
            setTimeout(showNextWord, 800);
          } else {
            setTimeout(showNextWord, wordInterval);
          }
        } else {
          words[words.length - 1].classList.add("zoom-out");

          const spinner = document.querySelector(".loader-spinner");
          if (spinner) spinner.style.opacity = "0";

          setTimeout(() => {
            loader.classList.add("hidden");
            document.body.classList.remove("page-zoomed");

            setTimeout(() => {
              document.body.classList.remove("no-scroll");
              loader.style.display = "none";
            }, 800);
          }, 400);
        }
      };

      setTimeout(showNextWord, 100);
    }
  }

  // ==========================================
  // 1. NAVIGATION BAR (Mobile Menu)
  // ==========================================
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("nav-active");
      hamburger.classList.toggle("toggle");
    });

    // Close menu when a link is clicked
    const links = document.querySelectorAll(".nav-links li a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("nav-active")) {
          navLinks.classList.remove("nav-active");
          hamburger.classList.remove("toggle");
        }
      });
    });
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
  // 4. SMART LIGHTBOX (Click + Keyboard + SWIPE)
  // ==========================================
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  const allItems = document.querySelectorAll(".portfolio-item, .student-card");

  let currentGalleryImages = [];
  let currentIndex = 0;

  if (lightbox && allItems.length > 0) {
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

          lightbox.classList.add("active");
          lightboxImg.src = img.src;
        }
      });
    });

    // 2. Update Image Helper
    function updateImage(index) {
      if (index >= currentGalleryImages.length) currentIndex = 0;
      else if (index < 0) currentIndex = currentGalleryImages.length - 1;
      else currentIndex = index;
      lightboxImg.src = currentGalleryImages[currentIndex].src;
    }

    // 3. Button Click Events
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      updateImage(currentIndex + 1);
    });

    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      updateImage(currentIndex - 1);
    });

    // 4. Keyboard Events
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "ArrowRight") updateImage(currentIndex + 1);
      else if (e.key === "ArrowLeft") updateImage(currentIndex - 1);
      else if (e.key === "Escape") lightbox.classList.remove("active");
    });

    // 5. Close Events
    lightboxClose.addEventListener("click", () =>
      lightbox.classList.remove("active"),
    );
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("active");
    });

    // 6. TOUCH SWIPE SUPPORT (Mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    lightbox.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
      },
      { passive: true },
    );

    function handleSwipeGesture() {
      // Swipe Left (Show Next)
      if (touchEndX < touchStartX - 50) {
        updateImage(currentIndex + 1);
      }
      // Swipe Right (Show Prev)
      if (touchEndX > touchStartX + 50) {
        updateImage(currentIndex - 1);
      }
    }
  }

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

  // ==========================================
  // 6. SCROLL ANIMATION OBSERVER
  // ==========================================
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15, // Trigger when 15% of the element is visible
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-animated");
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Get all elements with the data-animate attribute
  const animatedElements = document.querySelectorAll("[data-animate]");
  animatedElements.forEach((el) => scrollObserver.observe(el));

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
  });

  // Mousemove listener to scatter characters
  document.addEventListener("mousemove", (e) => {
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

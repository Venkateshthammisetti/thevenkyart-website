document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVIGATION BAR (Mobile Menu)
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    // ==========================================
    // 2. HERO SLIDESHOW (Fade Effect)
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000; 

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        slides[0].classList.add('active');
        setInterval(nextSlide, slideInterval);
    }

    // ==========================================
    // 3. PORTFOLIO FILTER (With Shuffle)
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioGrid = document.querySelector('.portfolio-grid');

    if (filterBtns.length > 0 && portfolioItems.length > 0) {

        function shuffleGrid() {
            const itemsArray = Array.from(portfolioItems);
            for (let i = itemsArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [itemsArray[i], itemsArray[j]] = [itemsArray[j], itemsArray[i]];
            }
            itemsArray.forEach(item => {
                portfolioGrid.appendChild(item);
                item.classList.remove('hide');
                item.classList.add('show');
            });
        }

        shuffleGrid();

        filterBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                filterBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                if (filterValue === 'all') {
                    shuffleGrid();
                } else {
                    portfolioItems.forEach((item) => {
                        if (item.getAttribute('data-category') === filterValue) {
                            item.classList.remove('hide');
                            item.classList.add('show');
                        } else {
                            item.classList.remove('show');
                            item.classList.add('hide');
                        }
                    });
                }
            });
        });
    }

    // ==========================================
    // 4. SMART LIGHTBOX (Click + Keyboard + SWIPE)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    const allItems = document.querySelectorAll('.portfolio-item, .student-card');

    let currentGalleryImages = [];
    let currentIndex = 0;

    if (lightbox && allItems.length > 0) {

        // 1. Open Lightbox
        allItems.forEach((item) => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    const visibleItems = Array.from(document.querySelectorAll('.portfolio-item.show img, .portfolio-item:not(.hide) img, .student-card img'));
                    currentGalleryImages = visibleItems;
                    currentIndex = visibleItems.indexOf(img);

                    lightbox.classList.add('active');
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
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            updateImage(currentIndex + 1);
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            updateImage(currentIndex - 1);
        });

        // 4. Keyboard Events
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowRight') updateImage(currentIndex + 1);
            else if (e.key === 'ArrowLeft') updateImage(currentIndex - 1);
            else if (e.key === 'Escape') lightbox.classList.remove('active');
        });

        // 5. Close Events
        lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });

        // 6. TOUCH SWIPE SUPPORT (Mobile)
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }, {passive: true});

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
    const track = document.getElementById('testimonialTrack');
    const testNext = document.getElementById('testNext');
    const testPrev = document.getElementById('testPrev');

    if (track && testNext && testPrev) {
        testNext.addEventListener('click', () => {
            const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 20; 
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
        testPrev.addEventListener('click', () => {
            const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 20;
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }
});
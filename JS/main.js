document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MOBILE NAVIGATION
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }

    // ==========================================
    // 2. HERO SLIDESHOW (Home Page Only)
    // ==========================================
    const slides = document.querySelectorAll('.slide');

    if (slides.length > 0) {
        let currentSlide = 0;
        const intervalTime = 5000;
        
        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        setInterval(nextSlide, intervalTime);
    }

    // ==========================================
    // 3. PORTFOLIO FILTERING
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active to click
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.classList.remove('hide');
                        item.classList.add('show');
                    } else {
                        item.classList.add('hide');
                        item.classList.remove('show');
                    }
                });
            });
        });
    }

    // ==========================================
    // 4. LIGHTBOX (GALLERY POPUP) - FIXED
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // We select the wrappers (items) for clicking, and images for source
    const items = document.querySelectorAll('.portfolio-item,.student-card');
    const galleryImages = document.querySelectorAll('.portfolio-item img, .student-card img');
    let currentImageIndex = 0;

    if (lightbox && items.length > 0) {
        
        // FIX: Listen for click on the ITEM wrapper, not just the image
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                lightbox.classList.add('active');
                
                // Find the image inside this clicked item
                const img = item.querySelector('img');
                if(img) {
                    lightboxImg.src = img.src;
                    currentImageIndex = index;
                }
            });
        });

        // Close Lightbox
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        // Close on clicking outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });

        // Show Image Logic (Next/Prev)
        function showLightboxImage(index) {
            // Loop logic
            if (index >= galleryImages.length) currentImageIndex = 0;
            else if (index < 0) currentImageIndex = galleryImages.length - 1;
            else currentImageIndex = index;

            // Update source
            lightboxImg.src = galleryImages[currentImageIndex].src;
        }

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox
            showLightboxImage(currentImageIndex + 1);
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox
            showLightboxImage(currentImageIndex - 1);
        });
    }

    // ==========================================
    // 5. CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Sending...';

            setTimeout(() => {
                alert(`Thanks ${name}! Your message has been sent (Simulated).`);
                contactForm.reset();
                submitBtn.innerText = originalText;
            }, 1500);
        });
    }

    // ==========================================
    // 6. TESTIMONIAL CAROUSEL LOGIC
    // ==========================================
    const track = document.getElementById('testimonialTrack');
    const testNext = document.getElementById('testNext');
    const testPrev = document.getElementById('testPrev');

    if (track && testNext && testPrev) {
        
        testNext.addEventListener('click', () => {
            // Scroll Right by the width of one card + gap
            const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 20; 
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        testPrev.addEventListener('click', () => {
            // Scroll Left
            const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 20;
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE NAVIGATION TOGGLE ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    hamburger.addEventListener('click', () => {
        // Toggle the navigation menu
        navLinks.classList.toggle('nav-active');
        
        // Burger Animation (turn lines into X)
        hamburger.classList.toggle('toggle');
    });

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        });
    });
    
    // --- HERO SLIDESHOW LOGIC ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 2000; // Time in milliseconds (5 seconds)

    function nextSlide() {
        // 1. Remove 'active' class from the current slide
        slides[currentSlide].classList.remove('active');
        
        // 2. Calculate the next slide index (loop back to 0 if at end)
        currentSlide = (currentSlide + 1) % slides.length;
        
        // 3. Add 'active' class to the new slide
        slides[currentSlide].classList.add('active');
    }

    // Start the automatic slideshow
    setInterval(nextSlide, slideInterval);

    // --- PORTFOLIO FILTERING ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // 2. Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // 3. Loop through items and show/hide based on category
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

    // --- CONTACT FORM SUBMISSION (Simulation) ---
    const contactForm = document.getElementById('contactForm');

    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            // Get values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // Simple Validation Logic
            if(name && email) {
                // Simulate sending delay
                const originalText = contactForm.querySelector('button').innerText;
                contactForm.querySelector('button').innerText = 'Sending...';
                
                setTimeout(() => {
                    alert(`Thanks ${name}! Your message has been sent (Simulated).`);
                    contactForm.reset(); // Clear the form
                    contactForm.querySelector('button').innerText = originalText;
                }, 1500);
            }
        });
    }

});
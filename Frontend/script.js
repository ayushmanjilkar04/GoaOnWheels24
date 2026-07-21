document.addEventListener('DOMContentLoaded', () => {
    // ===== Mobile Menu Toggle with Overlay =====
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Create overlay element for mobile menu backdrop
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        navLinks.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenu.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close menu when overlay is tapped
    overlay.addEventListener('click', closeMobileMenu);

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ===== Dark Mode Logic =====
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
            darkModeToggle.textContent = '☀️';
        } else {
            localStorage.setItem('dark-mode', 'disabled');
            darkModeToggle.textContent = '🌙';
        }
    });

    // ===== Tour Packages Tab Switching =====
    const packagesTabs = document.querySelectorAll('.pkg-tab');
    const packagesPanels = document.querySelectorAll('.pkg-panel');

    if (packagesTabs.length > 0) {
        packagesTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');

                // Deactivate all tabs and panels
                packagesTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                packagesPanels.forEach(p => p.classList.remove('active'));

                // Activate clicked tab and its panel
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                const targetPanel = document.getElementById('panel-' + targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Scroll tab into view on mobile
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        });
    }

    // ===== Scroll Animations =====
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        // Use a smaller reveal threshold on mobile for earlier reveal
        const revealPoint = window.innerWidth <= 600 ? 80 : 150;

        reveals.forEach((reveal) => {
            const revealTop = reveal.getBoundingClientRect().top;

            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    // Initial check to animate elements already in view
    revealOnScroll();

    // Check on scroll (passive listener for perf)
    window.addEventListener('scroll', revealOnScroll, { passive: true });

    // ===== 3D Wheel Slider Logic (Adaptive for mobile) =====
    const wheelSlider = document.getElementById('wheel-slider');
    if (wheelSlider) {
        const items = document.querySelectorAll('.wheel-item');
        const nextBtn = document.getElementById('wheel-next');
        const prevBtn = document.getElementById('wheel-prev');
        
        let activeIndex = 0;

        // Adaptive offset based on viewport width
        function getSliderOffset() {
            const w = window.innerWidth;
            if (w <= 360) return 80;
            if (w <= 480) return 100;
            if (w <= 600) return 120;
            if (w <= 768) return 150;
            return 200;
        }

        function loadShow() {
            let stt = 0;
            const offset = getSliderOffset();

            items[activeIndex].style.transform = `none`;
            items[activeIndex].style.zIndex = 10;
            items[activeIndex].style.filter = 'none';
            items[activeIndex].style.opacity = 1;

            // Items to the right
            for (let i = activeIndex + 1; i < items.length; i++) {
                stt++;
                items[i].style.transform = `translateX(${offset * stt}px) scale(${1 - 0.2 * stt}) perspective(1000px) rotateY(-30deg)`;
                items[i].style.zIndex = 10 - stt;
                items[i].style.filter = 'blur(2px)';
                items[i].style.opacity = stt > 2 ? 0 : 0.6;
            }

            stt = 0;
            // Items to the left
            for (let i = activeIndex - 1; i >= 0; i--) {
                stt++;
                items[i].style.transform = `translateX(${-offset * stt}px) scale(${1 - 0.2 * stt}) perspective(1000px) rotateY(30deg)`;
                items[i].style.zIndex = 10 - stt;
                items[i].style.filter = 'blur(2px)';
                items[i].style.opacity = stt > 2 ? 0 : 0.6;
            }
        }
        
        loadShow();

        // Recalculate on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(loadShow, 100);
        });
        
        nextBtn.onclick = function() {
            activeIndex = activeIndex + 1 < items.length ? activeIndex + 1 : activeIndex;
            loadShow();
        }
        
        prevBtn.onclick = function() {
            activeIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : activeIndex;
            loadShow();
        }
        
        // Allow clicking on side items to navigate
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                activeIndex = index;
                loadShow();
            });
        });

        // ===== Touch Swipe Support for Wheel Slider =====
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50;

        wheelSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        wheelSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left → next
                    activeIndex = activeIndex + 1 < items.length ? activeIndex + 1 : activeIndex;
                } else {
                    // Swipe right → prev
                    activeIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : activeIndex;
                }
                loadShow();
            }
        }, { passive: true });
    }

    // ===== Custom Reviews Logic =====
    const reviewForm = document.getElementById('review-form');
    const reviewsGrid = document.querySelector('.reviews-grid');

    const createReviewCard = (starsVal, text, name, location) => {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        let starsHTML = '';
        for(let i=0; i<5; i++) {
            starsHTML += i < starsVal ? '★' : '☆';
        }

        card.innerHTML = `
            <div class="stars">${starsHTML}</div>
            <p class="review-text">"${text}"</p>
            <div class="reviewer">
                <div class="reviewer-avatar">${name.charAt(0).toUpperCase()}</div>
                <div class="reviewer-info">
                    <h4>${name}</h4>
                    <p>Visited from ${location}</p>
                </div>
            </div>
        `;
        return card;
    };

  

    if (reviewForm && reviewsGrid) {
        loadReviews();

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('review-name').value;
            const location = document.getElementById('review-location').value;
            const rating = document.getElementById('review-rating').value;
            const text = document.getElementById('review-text').value;

            const reviewData = {
                name,
                location,
                stars: parseInt(rating),
                text
            };

             
        });
    }

       // ===== Lightbox Logic =====(galery logic)
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxContent() {
        const item = galleryItems[currentIndex];
        const bgImage = item.style.backgroundImage;
        const text = item.textContent;
        
        lightboxContent.style.backgroundImage = bgImage;
        // If no background image is set, show placeholder text
        if (!bgImage || bgImage.includes('url("")') || bgImage === 'none') {
            lightboxContent.textContent = text;
        } else {
            lightboxContent.textContent = '';
        }
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxContent();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNext);
    lightboxPrev.addEventListener('click', showPrev);

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('active')) closeLightbox();
            if (navLinks.classList.contains('active')) closeMobileMenu();
        }
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    // ===== Touch Swipe for Lightbox =====
    let lightboxTouchStartX = 0;
    let lightboxTouchEndX = 0;
    const lightboxSwipeThreshold = 50;

    lightboxContent.addEventListener('touchstart', (e) => {
        lightboxTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxContent.addEventListener('touchend', (e) => {
        lightboxTouchEndX = e.changedTouches[0].screenX;
        const diff = lightboxTouchStartX - lightboxTouchEndX;

        if (Math.abs(diff) > lightboxSwipeThreshold) {
            if (diff > 0) {
                showNext();
            } else {
                showPrev();
            }
        }
    }, { passive: true });
});


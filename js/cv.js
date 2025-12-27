        document.addEventListener('DOMContentLoaded', () => {
            // Register ScrollTrigger
            gsap.registerPlugin(ScrollTrigger);
          
            // ============================================
            // 1. LOGICA TECH SLIDER
            // ============================================
            const initTechSliderCenter = () => {
                const sliderContainer = document.querySelector('.cv-tech-slider-container');
                const items = document.querySelectorAll('.cv-tech-item');

                if (!sliderContainer || items.length === 0) return;

                const checkCenterItem = () => {
                    const containerRect = sliderContainer.getBoundingClientRect();
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    let closestItem = null;
                    let minDistance = Infinity;

                    items.forEach(item => {
                        const itemRect = item.getBoundingClientRect();
                        const itemCenter = itemRect.left + itemRect.width / 2;
                        const distance = Math.abs(containerCenter - itemCenter);
                        const isVisible = (itemRect.right > containerRect.left && itemRect.left < containerRect.right);

                        if (isVisible && distance < minDistance) {
                            minDistance = distance;
                            closestItem = item;
                        }
                    });

                    items.forEach(item => {
                        if (item === closestItem) {
                            item.classList.add('active-center');
                        } else {
                            item.classList.remove('active-center');
                        }
                    });
                    requestAnimationFrame(checkCenterItem);
                };
                requestAnimationFrame(checkCenterItem);
            };

            // ============================================
            // 2. LOGICA BRANDS LOOP (DESKTOP ONLY)
            // ============================================
            const initBrandsLoop = () => {
                // Nu rula loop-ul pe mobil, lăsăm GSAP să se ocupe
                if (window.innerWidth <= 1024) return;

                const cards = document.querySelectorAll('.brand-card');
                if (!cards.length) return;

                let currentIndex = 0;
                let loopInterval = null;

                const activateNext = () => {
                    cards.forEach(card => card.classList.remove('active-auto'));
                    cards[currentIndex].classList.add('active-auto');
                    currentIndex = (currentIndex + 1) % cards.length;
                };

                const startLoop = () => {
                    if (loopInterval) return;
                    activateNext(); 
                    loopInterval = setInterval(activateNext, 4000); 
                };

                const stopLoop = () => {
                    clearInterval(loopInterval);
                    loopInterval = null;
                    cards.forEach(card => card.classList.remove('active-auto'));
                };

                startLoop();

                const section = document.querySelector('.brands-grid');
                if (section) {
                    section.addEventListener('mouseenter', stopLoop);
                    section.addEventListener('mouseleave', startLoop);
                }
            };

            // ============================================
            // 3. LOGICA GSAP SCROLL TRIGGER (MOBILE)
            // ============================================
            const initMobileScroll = () => {
                // Execută doar pe mobil/tabletă
                if (window.innerWidth > 1024) return;

                const cards = document.querySelectorAll('.brand-card');
                
                cards.forEach((card) => {
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 70%", // Când cardul ajunge la 70% din viewport
                        end: "bottom 30%",
                        onEnter: () => card.classList.add('active-auto'), // Activează animația
                        onLeaveBack: () => card.classList.remove('active-auto'), // Dezactivează dacă dai scroll înapoi sus
                        // markers: true // Decomentează pentru debugging
                    });
                });
            };

            // ============================================
            // 4. SCROLL FADE-IN GENERAL
            // ============================================
            const initScrollAnimations = () => {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in');
                        }
                    });
                }, observerOptions);

                document.querySelectorAll('.cv-tech-section, .brands-section').forEach(el => {
                    observer.observe(el);
                });
            };

            // Inițializăm funcțiile
            initTechSliderCenter();
            initBrandsLoop(); // Doar Desktop
            initMobileScroll(); // Doar Mobile (GSAP)
            initScrollAnimations();
        });
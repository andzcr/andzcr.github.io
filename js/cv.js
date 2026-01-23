document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

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

    const initBrandsLoop = () => {
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

    const initAppleScroll = () => {
        gsap.to(".brands-title", {
            scrollTrigger: {
                trigger: ".brands-section",
                start: "top 80%",
                end: "top 60%",
                scrub: 1,
                toggleActions: "play none none reverse"
            },
            y: 0,
            opacity: 1,
            ease: "power2.out"
        });

        const cards = gsap.utils.toArray(".brand-card");
        
        gsap.set(cards, { y: 150, opacity: 0 });

        gsap.to(cards, {
            scrollTrigger: {
                trigger: ".brands-grid",
                start: "top 90%",
                end: "top 40%",
                scrub: 1,
            },
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power3.out"
        });

        if (window.innerWidth > 1024) {
            gsap.to(".brand-card:nth-child(2)", {
                scrollTrigger: {
                    trigger: ".brands-grid",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5
                },
                y: -40,
                ease: "none"
            });
        }
    };

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

        document.querySelectorAll('.cv-tech-section').forEach(el => {
            observer.observe(el);
        });
    };

    initTechSliderCenter();
    initBrandsLoop(); 
    initAppleScroll();
    initScrollAnimations();
});
const projectsData = {
    corelle: {
        title: "CORELLE | Nails Products Brand",
        description: "Personal template for the CORELLE brand. It is a fully responsive website, optimized for both mobile and desktop. It includes systems such as Register, Login, Reviews, Favourites, History, and an Order System.",
        media: [
            { type: 'video', url: 'https://andzcr.github.io/resources/projects/corelle/home_land.mp4' },
            { type: 'video', url: 'https://andzcr.github.io/resources/projects/corelle/best_seller.mp4' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/corelle/poza3.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/corelle/poza4.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/corelle/poza5.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/corelle/poza6.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/corelle/poza7.png' }
        ]
    },
    bass: {
        title: "Bass Industries",
        description: "I am a fan of the TV series Gossip Girl, so I absolutely had to create a website concept for Chuck Bass - the owner of Bass Industries. This is a fictional concept, created for pleasure.",
        media: [
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/best_seller.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza3.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza4.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza5.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza6.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza7.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza8.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza9.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza10.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza11.png' },
            { type: 'image', url: 'https://andzcr.github.io/resources/projects/bass/poza12.png' }
        ]
    }
};

let currentSlideIndex = 0;
let modalActiveProject = null;
let modalLenis = null;

function initProjectModal() {
    const cards = document.querySelectorAll('.work-card[data-project]');
    const backBtn = document.querySelector('.back-trigger');
    const contactBtn = document.querySelector('.contact-trigger');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project');
            openProjectModal(projectId);
        });
    });

    if(backBtn) backBtn.addEventListener('click', closeProjectModal);
    if(contactBtn) contactBtn.addEventListener('click', () => {
        console.log("Contact action");
        closeProjectModal();
    });
    
    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeProjectModal();
    });
}

function openProjectModal(id) {
    const data = projectsData[id];
    if (!data) return;

    modalActiveProject = id;
    currentSlideIndex = 0;

    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-project-desc').textContent = data.description;
    
    const slider = document.getElementById('modal-media-slider');
    const dotsContainer = document.getElementById('slider-dots');
    
    slider.innerHTML = '';
    dotsContainer.innerHTML = '';
    slider.style.transform = `translateX(0)`;

    data.media.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'media-item';
        if (item.type === 'video') {
            slide.innerHTML = `<video src="${item.url}" autoplay muted loop playsinline></video>`;
        } else {
            slide.innerHTML = `<img src="${item.url}" alt="Project">`;
        }
        slider.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });

    renderRelated(id);

    const modal = document.getElementById('project-modal');
    modal.style.display = 'block';
    
    const scrollContainer = document.querySelector('.modal-scroll-container');
    if (modalLenis) modalLenis.destroy();
    
    modalLenis = new Lenis({
        wrapper: scrollContainer,
        content: document.getElementById('modal-lenis-content'),
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function modalRaf(time) {
        modalLenis.raf(time);
        requestAnimationFrame(modalRaf);
    }
    requestAnimationFrame(modalRaf);

    const tl = gsap.timeline({
        onStart: () => {
            if (window.lenis) window.lenis.stop();
            document.body.style.overflow = 'hidden';
        },
        onComplete: () => {
            ScrollTrigger.refresh();
        }
    });

    gsap.set(modal, { opacity: 0, scale: 0.95 });
    gsap.set(".modal-nav", { y: -50, opacity: 0 });
    gsap.set(".reveal-element", { y: 60, opacity: 0 });

    tl.to(modal, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        ease: "power3.out" 
    })
    .to(".modal-nav", { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        ease: "back.out(1.4)" 
    }, "-=0.3")
    .to(".reveal-element", { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power4.out" 
    }, "-=0.4");

    modalLenis.scrollTo(0, { immediate: true });
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    
    gsap.to(modal, {
        opacity: 0,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
            modal.style.display = 'none';
            if (window.lenis) window.lenis.start();
            document.body.style.overflow = '';
            
            if (modalLenis) {
                modalLenis.destroy();
                modalLenis = null;
            }
            
            const videos = modal.querySelectorAll('video');
            videos.forEach(v => v.pause());
        }
    });
}

function moveSlider(dir) {
    const data = projectsData[modalActiveProject];
    const total = data.media.length;
    currentSlideIndex += dir;
    if (currentSlideIndex < 0) currentSlideIndex = total - 1;
    if (currentSlideIndex >= total) currentSlideIndex = 0;
    
    const slider = document.getElementById('modal-media-slider');
    slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function renderRelated(currentId) {
    const grid = document.getElementById('related-projects-grid');
    grid.innerHTML = '';
    const otherKeys = Object.keys(projectsData).filter(key => key !== currentId);
    
    otherKeys.forEach(key => {
        const p = projectsData[key];
        const card = document.createElement('div');
        card.className = 'work-card active-related';
        card.style.cssText = "width: 100%; left: 0; cursor: pointer;";
        
        card.innerHTML = `
            <img src="${p.media[2].url}" class="wc-img" style="filter: grayscale(0)">
            <div class="wc-overlay" style="opacity: 1">
                <span class="wc-cat">View Next</span>
                <h3 class="wc-title" style="font-size: 1.5rem">${p.title}</h3>
            </div>
        `;
        card.onclick = () => {
            gsap.to(".modal-scroll-container", { scrollTop: 0, duration: 0.5 });
            if(modalLenis) modalLenis.scrollTo(0, { duration: 0.5 });
            
            setTimeout(() => {
                openProjectModal(key);
            }, 300);
        };
        grid.appendChild(card);
    });
}

function initProjectsAnimations() {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        const fwContainer = document.querySelector(".fw-track");
        const fwItems = document.querySelectorAll(".fw-item");
        if (fwContainer) {
            gsap.to(fwContainer, {
                x: () => -(fwContainer.scrollWidth - window.innerWidth + 100),
                ease: "none",
                scrollTrigger: {
                    trigger: ".fw-section",
                    pin: true, scrub: 1, end: "+=2000",
                    onUpdate: (self) => {
                        const progress = self.progress;
                        fwItems.forEach((item, i) => {
                            if (progress >= i * 0.3 && progress < (i + 1) * 0.4) item.classList.add('active');
                            else item.classList.remove('active');
                        });
                    }
                }
            });
        }

        const worksTL = gsap.timeline({
            scrollTrigger: { trigger: ".works-section", pin: true, start: "top top", end: "+=2500", scrub: 1 }
        });
        worksTL.to(".works-header-abs", { scale: 0.4, x: "-35vw", duration: 1, ease: "power2.inOut" }, "start")
               .to(".works-gradient-mask", { opacity: 1, duration: 1 }, "start");
        const workTrack = document.querySelector('.works-track');
        if (workTrack) {
            worksTL.fromTo(".works-track", { x: "120vw" }, {
                x: () => -(workTrack.scrollWidth - window.innerWidth * 0.45),
                duration: 3, ease: "none"
            }, "start");
        }
    });

    mm.add("(max-width: 1023px)", () => {
        const fwItems = document.querySelectorAll(".fw-item");
        fwItems.forEach(item => {
            gsap.to(item, {
                scrollTrigger: { trigger: item, start: "top center+=100", end: "bottom center-=100", toggleClass: "active" }
            });
        });
        const mobileWorksTL = gsap.timeline({
            scrollTrigger: { trigger: ".works-section", pin: true, start: "top top", end: "+=1800", scrub: 1 }
        });
        mobileWorksTL.to(".works-header-abs", { scale: 0.6, y: "-38vh", duration: 1, ease: "power2.inOut" }, "start")
                     .to(".works-gradient-mask", { opacity: 1, duration: 1 }, "start");
        const workTrack = document.querySelector('.works-track');
        if (workTrack) {
            mobileWorksTL.fromTo(".works-track", { y: "60vh", opacity: 0 }, { 
                y: "12vh", opacity: 1, duration: 1, ease: "power2.inOut" 
            }, "start");
            const scrollDist = workTrack.scrollHeight - window.innerHeight * 0.5; 
            mobileWorksTL.to(".works-track", { y: -scrollDist, duration: 3, ease: "none" });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initProjectsAnimations();
    initProjectModal();
});
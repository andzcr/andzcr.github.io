/* =================================================================
   MAIN SYSTEM: CLEAN & STABLE
   ================================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyC0DShqS1R3eqCIVFLKXxU0vmi0mUqprek",
    authDomain: "portfolio-65392.firebaseapp.com",
    projectId: "portfolio-65392",
    storageBucket: "portfolio-65392.firebasestorage.app",
    messagingSenderId: "494719104051",
    appId: "1:494719104051:web:445c9ec94535e16b4adf46"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
}

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const loadIcons = () => {
        if (document.querySelector('script[src*="ionicons"]')) return;
        const s = document.createElement('script'); s.type = 'module';
        s.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
        document.head.appendChild(s);
        const nm = document.createElement('script'); nm.nomodule = true;
        nm.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
        document.head.appendChild(nm);
    };
    loadIcons();

    const initMasterExperience = () => {
        const navbar = document.getElementById('ios-navbar');
        const progressBar = document.getElementById('nav-progress-bar');
        const navItems = document.querySelectorAll('.ios-nav-item');
        const sections = document.querySelectorAll('section');

        let lastScrollTop = 0;
        let isScrolledMode = false;

        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        lenis.on('scroll', (e) => {
            const scrollTop = e.scroll;
            const delta = scrollTop - lastScrollTop;
            
            if (scrollTop > 60 && delta > 0) {
                if (!isScrolledMode) {
                    isScrolledMode = true;
                    navbar.classList.add('scrolled-mode');
                }
            } 
            else if ((delta < -5) || scrollTop <= 60) {
                if (isScrolledMode) {
                    isScrolledMode = false;
                    navbar.classList.remove('scrolled-mode');
                }
            }

            lastScrollTop = scrollTop;

            if (isScrolledMode) {
                const height = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollTop / height) * 100;
                progressBar.style.width = `${progress}%`;
            } else {
                progressBar.style.width = '0%';
            }
        });

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navItems.forEach(item => item.classList.remove('active'));
                    const id = entry.target.getAttribute('id');
                    if(id) {
                        const link = document.querySelector(`.ios-link[data-section="${id}"]`);
                        if(link) {
                            link.parentElement.classList.add('active');
                        }
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));

        document.querySelectorAll('.ios-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    lenis.scrollTo(targetElement, {
                        offset: 0,
                        duration: 2,
                    });
                }
            });
        });
    };

    initMasterExperience();
    
    const initCookieConsent = () => {
        const cw = document.getElementById('cookie-notification');
        const ab = document.getElementById('cookie-accept');
        const rb = document.getElementById('cookie-refuse');
        if (!cw || !ab || !rb) return;
        if (localStorage.getItem('cookieConsent') === 'true') return;
        setTimeout(() => { cw.classList.add('show'); }, 1500);
        ab.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            cw.classList.remove('show'); cw.classList.add('hide-out');
            setTimeout(() => { cw.style.display = 'none'; }, 800);
        });
        rb.addEventListener('click', () => {
            localStorage.removeItem('cookieConsent');
            cw.classList.remove('show'); cw.classList.add('hide-out');
        });
    };
    initCookieConsent();

    if (typeof window.initFooter === 'function') window.initFooter();
});

document.addEventListener('DOMContentLoaded', function() {
    const mesaje = [ "‎ ‎ANDZ.ro | Studio", "‎ ‎ ‎ ‎MADE TO PERFORM", "‎ ‎ANDZ.ro | Studio", "‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎BRAND DESIGN" ];
    const spatiereCentrare = "          "; 
    let mesajIndex = 0, charIndex = 0, seSterge = false;
    function esteMobil() { return (window.innerWidth < 768) || /Android|webOS|iPhone/i.test(navigator.userAgent); }
    function animatieTitlu() {
        const mesajCurent = mesaje[mesajIndex];
        if (seSterge) charIndex = Math.max(0, charIndex - 1);
        else charIndex = Math.min(mesajCurent.length, charIndex + 1);
        const textPartial = mesajCurent.substring(0, charIndex);
        document.title = textPartial.length === 0 ? "\u200E" : spatiereCentrare + textPartial;
        let timp = 200;
        if (!seSterge && charIndex === mesajCurent.length) { timp = 2000; seSterge = true; }
        else if (seSterge && charIndex === 0) { seSterge = false; mesajIndex = (mesajIndex + 1) % mesaje.length; timp = 400; }
        else if (seSterge) timp = 100;
        setTimeout(animatieTitlu, timp);
    }
    if (esteMobil()) document.title = mesaje[0]; else animatieTitlu();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
    if (e.ctrlKey && e.key === 'u') e.preventDefault();
    if (e.ctrlKey && e.key === 's') e.preventDefault();
});
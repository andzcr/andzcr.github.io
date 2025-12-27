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

    // 1. Load Icons
    const loadScripts = () => {
        if (document.querySelector('script[src*="ionicons"]')) return;
        const esm = document.createElement('script');
        esm.type = 'module';
        esm.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js';
        document.head.appendChild(esm);
        
        const noModule = document.createElement('script');
        noModule.nomodule = true;
        noModule.src = 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js';
        document.head.appendChild(noModule);
    };

const initStickyNav = () => {
    const stickyNav = document.getElementById('sticky-nav');
    const mainBurger = document.getElementById('burger-toggle');
    const overlay = document.getElementById('nav-overlay');
    
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        if (overlay.classList.contains('open')) return;

        const currentScroll = window.pageYOffset;

        // dacă nu ai scroll deloc, navbar ascuns, hamburger vizibil
        if (currentScroll <= 50) {
            stickyNav.classList.remove('nav-visible');
            mainBurger.classList.remove('burger-hidden');
            lastScroll = currentScroll;
            return;
        }

        // scroll în jos → ascunde tot
        if (currentScroll > lastScroll) {
            stickyNav.classList.remove('nav-visible');
            mainBurger.classList.add('burger-hidden');
        } 
        else {
            // scroll în sus → arată nav
            stickyNav.classList.add('nav-visible');
            mainBurger.classList.add('burger-hidden');
        }

        lastScroll = currentScroll;
    }, { passive: true });
};



    // 3. CONTACT BUTTON LOGIC
    const initContactButton = () => {
        const button = document.getElementById('sticky-contact-btn');
        if (!button) return;

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            button.style.setProperty('--x', `${x}px`);
            button.style.setProperty('--y', `${y}px`);
        });

        button.addEventListener('click', () => {
            const contactSection = document.getElementById('contact');
            if(contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };

    // 4. Menu Logic
    const initMenuToggle = () => {
        const burger = document.getElementById('burger-toggle');
        const stickyBurger = document.getElementById('sticky-burger-trigger');
        const overlay = document.getElementById('nav-overlay');
        const burgerLabel = burger.querySelector('.burger-label');
        
        const menuItems = document.querySelectorAll('.menu-item');
        const previewCards = document.querySelectorAll('.nav-preview-card'); 
        const navLinks = document.querySelectorAll('.nav-link-action');

        if(!burger || !overlay) return;

        const toggleMenu = () => {
            const isOpen = overlay.classList.contains('open');
            const stickyNav = document.getElementById('sticky-nav');

            if (isOpen) {
                overlay.classList.remove('open');
                burger.classList.remove('active');
                document.body.style.overflow = '';
                if(burgerLabel) burgerLabel.textContent = "MENU";
                
                if(window.pageYOffset > window.innerHeight) {
                    stickyNav.classList.add('nav-visible');
                }
            } else {
                overlay.classList.add('open');
                burger.classList.add('active');
                document.body.style.overflow = 'hidden';
                if(burgerLabel) burgerLabel.textContent = "CLOSE";
                
                stickyNav.classList.remove('nav-visible');
            }
        };

        burger.addEventListener('click', toggleMenu);
        if(stickyBurger) stickyBurger.addEventListener('click', toggleMenu);

        // --- HOVER LOGIC (Desktop) ---
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if(window.innerWidth > 1024) {
                    menuItems.forEach(i => i.classList.remove('active'));
                    previewCards.forEach(c => c.classList.remove('active'));
                    
                    item.classList.add('active');
                    const target = item.getAttribute('data-target');
                    const targetCard = document.getElementById(`preview-${target}`);
                    if(targetCard) targetCard.classList.add('active');
                }
            });

            item.addEventListener('click', (e) => {
                if(e.target.closest('.nav-link-action')) return;

                if(window.innerWidth <= 1024) {
                    const isActive = item.classList.contains('mobile-active');
                    menuItems.forEach(i => i.classList.remove('mobile-active'));
                    if(!isActive) item.classList.add('mobile-active');
                }
            });
        });

        // --- REDIRECT LOGIC ---
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                
                const targetId = link.getAttribute('data-href') || link.getAttribute('href');
                
                overlay.classList.remove('open');
                burger.classList.remove('active');
                document.body.style.overflow = '';
                if(burgerLabel) burgerLabel.textContent = "MENU";

                setTimeout(() => {
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            });
        });
    };

    // 5. Smooth Scroll
    const initSmoothScroll = () => {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]:not(.nav-link-action)');
            if (!link) return;
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };
// 6. COOKIE NOTIFICATION LOGIC (WITH LOCALSTORAGE)
    const initCookieConsent = () => {
        const cookieWrap = document.getElementById('cookie-notification');
        const acceptBtn = document.getElementById('cookie-accept');
        const refuseBtn = document.getElementById('cookie-refuse');

        if (!cookieWrap || !acceptBtn || !refuseBtn) return;

        // 1. VERIFICARE: Dacă avem deja 'cookieConsent' salvat, nu mai facem nimic
        if (localStorage.getItem('cookieConsent') === 'true') {
            return; // Ieșim din funcție, notificarea rămâne ascunsă
        }

        // 2. Dacă nu există în storage, afișăm notificarea după 1.5 secunde
        setTimeout(() => {
            cookieWrap.classList.add('show');
        }, 1500);

        // Logică ACCEPT
        acceptBtn.addEventListener('click', () => {
            // 3. SALVARE: Salvăm preferința în browser
            localStorage.setItem('cookieConsent', 'true');
            
            // Ascundem vizual notificarea
            cookieWrap.classList.remove('show');
            cookieWrap.classList.add('hide-out'); 
            
            // Eliminăm display-ul după ce se termină animația
            setTimeout(() => {
                cookieWrap.style.display = 'none';
            }, 800);
        });

        // Logică REFUSE
        refuseBtn.addEventListener('click', () => {
            localStorage.removeItem('cookieConsent'); 
            window.location.href = '404.html';
        });
    };

    initCookieConsent();
    loadScripts();
    initStickyNav();
    initContactButton();
    initMenuToggle();
    initSmoothScroll();

    if (typeof window.initFooter === 'function') window.initFooter();
});

// Helper Scripts
document.addEventListener('DOMContentLoaded', function() {
    const mesaje = [ "‎ ‎∀ N D Z | PORTFOLIO", "‎ ‎ MADE TO PERFORM", "‎ ‎∀ N D Z | PORTFOLIO", "‎ ‎ ‎ ‎ ‎ ‎UI / UX | DESIGN" ];
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

(function () {
    const bar = document.getElementById('scroll-progress-bar');
    const wrap = document.getElementById('scroll-progress-wrap');
    if (!bar || !wrap) return;
    let ticking = false, idleTimer = null;
    function update() {
        const doc = document.documentElement;
        const pct = (doc.scrollTop || document.body.scrollTop) / ((doc.scrollHeight - doc.clientHeight) || 1);
        bar.style.transform = 'scaleX(' + pct + ')';
        wrap.classList.remove('idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => wrap.classList.add('idle'), 800);
        ticking = false;
    }
    window.addEventListener('scroll', () => { if(!ticking) { window.requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
})();
  const progressBar = document.querySelector('#scroll-progress span');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    progressBar.style.width = progress + '%';
  });
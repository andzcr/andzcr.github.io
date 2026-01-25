document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const updateClock = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const clockEl = document.getElementById('ios-clock');
        if(clockEl) clockEl.textContent = timeString;
    };
    setInterval(updateClock, 1000);
    updateClock();

    class MagneticButton {
        constructor(el) {
            this.el = el;
            this.parent = el.parentElement;
            this.bound = this.parent.getBoundingClientRect();
            
            window.addEventListener('resize', () => this.bound = this.parent.getBoundingClientRect());
            window.addEventListener('scroll', () => this.bound = this.parent.getBoundingClientRect());
            
            this.parent.addEventListener('mousemove', (e) => this.magnetize(e));
            this.parent.addEventListener('mouseleave', () => this.reset());
        }

        magnetize(e) {
            const x = e.clientX - this.bound.left - this.bound.width / 2;
            const y = e.clientY - this.bound.top - this.bound.height / 2;
            gsap.to(this.el, { x: x * 0.5, y: y * 0.5, duration: 0.6, ease: "power3.out" });
        }

        reset() {
            gsap.to(this.el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
        }
    }

    const burgerBtn = document.getElementById('nav-burger');
    if (burgerBtn) new MagneticButton(burgerBtn);


    const nav = document.querySelector('.smart-nav');
    
    const handleScroll = () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    handleScroll();

    let isMenuOpen = false;
    window.toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        const overlay = document.getElementById('menu-overlay');
        const line1 = document.querySelector('.mag-line.line-1');
        const line2 = document.querySelector('.mag-line.line-2');
        
        const socialOverlay = document.getElementById('social-overlay');
        if(socialOverlay) socialOverlay.classList.remove('open');

        if (isMenuOpen) {
            overlay.classList.add('active');
            nav.classList.add('menu-active');
            
            document.body.style.overflow = 'hidden';

            gsap.to(line1, { top: '50%', y: '-50%', width: 24, rotate: 45, backgroundColor: '#fff', duration: 0.6 });
            gsap.to(line2, { bottom: '50%', y: '50%', width: 24, rotate: -45, backgroundColor: '#fff', duration: 0.6 });

            gsap.fromTo('.ios-interface', 
                { scale: 0.9, y: 30, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)", delay: 0.1 }
            );

        } else {
            document.body.style.overflow = '';

            gsap.to('.ios-interface', {
                scale: 0.95, 
                y: 20, 
                opacity: 0, 
                duration: 0.4, 
                ease: "power2.in",
                onComplete: () => {
                    overlay.classList.remove('active');
                    nav.classList.remove('menu-active');
                    gsap.set('.ios-interface', { clearProps: "all" });
                }
            });

            gsap.to(line1, { top: 0, y: 0, width: 24, rotate: 0, backgroundColor: '#fff', duration: 0.5 });
            gsap.to(line2, { bottom: 0, y: 0, width: 16, rotate: 0, backgroundColor: '#fff', duration: 0.5 });
        }
    };

    window.toggleSocials = () => {
        const socialOverlay = document.getElementById('social-overlay');
        if (socialOverlay) {
            socialOverlay.classList.toggle('open');
        }
    };
    
    const iosLinks = document.querySelectorAll('.ios-link');
    iosLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            iosLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-img');
            document.querySelectorAll('.pw-image').forEach(img => img.classList.remove('active'));
            const targetImg = document.getElementById(targetId);
            if(targetImg) targetImg.classList.add('active');
        });
    });
    
    const initRotator = (containerId, intervalTime = 3000, initialDelay = 0) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = container.children;
        if (items.length === 0) return;
        let currentIndex = 0;

        setTimeout(() => {
            setInterval(() => {
                const currentItem = items[currentIndex];
                const nextIndex = (currentIndex + 1) % items.length;
                const nextItem = items[nextIndex];

                currentItem.classList.remove('active');
                currentItem.classList.add('exit');

                nextItem.classList.remove('exit');
                void nextItem.offsetWidth; 
                nextItem.classList.add('active');

                setTimeout(() => { currentItem.classList.remove('exit'); }, 800); 
                currentIndex = nextIndex;
            }, intervalTime);
        }, initialDelay);
    };

    initRotator('main-rotator', 3000, 0);
    initRotator('subtitle-rotator', 3500, 500);

    class LiquidReveal {
        constructor() {
            this.canvas = document.getElementById('reveal-canvas');
            this.wrapper = document.querySelector('.bg-reveal-wrapper');
            this.isMobile = window.innerWidth <= 768;
            
            if (this.canvas) {
                this.canvas.style.display = this.isMobile ? 'none' : 'block';
            }
            
            if (!this.canvas || this.isMobile) return;

            this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });
            this.bgImage = new Image();
            this.bgImage.crossOrigin = "Anonymous";
            this.bgImage.src = 'https://andzcr.github.io/resources/photos/effect.png';

            this.points = [];
            this.maxAge = 120;
            this.radius = 160;
            this.lastX = 0; this.lastY = 0;
            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => {
                this.resize();
                this.isMobile = window.innerWidth <= 768;
                this.canvas.style.display = this.isMobile ? 'none' : 'block';
            });
            this.bgImage.onload = () => {
                this.canvas.classList.add('ready');
                this.animate();
            };
        }

        resize() {
            if(!this.wrapper) return;
            const rect = this.wrapper.getBoundingClientRect();
            this.width = rect.width + 2;
            this.height = rect.height + 2;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.offsetX = rect.left - 1;
            this.offsetY = rect.top - 1;
        }

        addPoint(x, y) {
            const relX = x - this.offsetX;
            const relY = y - this.offsetY;
            if(this.lastX === 0) { this.lastX = relX; this.lastY = relY; }
            const dist = Math.hypot(relX - this.lastX, relY - this.lastY);
            const steps = Math.min(Math.ceil(dist / 20), 10); 
            for (let i = 0; i < steps; i++) {
                const interactX = this.lastX + (relX - this.lastX) * (i / steps);
                const interactY = this.lastY + (relY - this.lastY) * (i / steps);
                this.points.push({ x: interactX, y: interactY, age: this.maxAge, currentRadius: this.radius + Math.min(dist * 0.5, 30) });
            }
            this.lastX = relX; this.lastY = relY;
        }

        animate() {
            if (this.isMobile) {
                this.canvas.style.display = 'none';
                return;
            }
            if(this.wrapper) {
                const rect = this.wrapper.getBoundingClientRect();
                this.offsetX = rect.left - 1;
                this.offsetY = rect.top - 1;
            }
            this.ctx.clearRect(0, 0, this.width, this.height);
            if (mouseX !== 0 && mouseY !== 0) this.addPoint(mouseX, mouseY);

            this.points.forEach((point, i) => {
                point.age--;
                if (point.age <= 0) { this.points.splice(i, 1); } 
                else {
                    const intensity = point.age / this.maxAge;
                    const grad = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.currentRadius);
                    grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
                    grad.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.8})`);
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    this.ctx.fillStyle = grad;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, point.currentRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            this.ctx.globalCompositeOperation = 'source-in';
            const imgRatio = this.bgImage.width / this.bgImage.height;
            const canvasRatio = this.width / this.height;
            let renderW, renderH, drawX, drawY;

            if (canvasRatio > imgRatio) { renderW = this.width; renderH = this.width / imgRatio; drawX = 0; drawY = (this.height - renderH) / 2; } 
            else { renderH = this.height; renderW = this.height * imgRatio; drawX = (this.width - renderW) / 2; drawY = 0; }
            
            this.ctx.drawImage(this.bgImage, drawX, drawY, renderW, renderH);
            this.ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(() => this.animate());
        }
    }

    const revealEffect = new LiquidReveal();
});
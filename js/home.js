document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        .smart-badge::after { 
            animation: none !important; 
            background: conic-gradient(from var(--angle), transparent 50%, rgba(255, 255, 255, 0.8) 85%, #ffffff 95%, transparent 100%);
        }
    `;
    document.head.appendChild(style);

    const CONFIG = {
        proximity: 300, magneticForce: 0.4, smoothness: 0.1, 
        angleSmoothness: 0.1, tiltStrength: 15, scaleOnHover: 1.02, rotationSpeed: 0.2 
    };

    let mouseX = 0, mouseY = 0;
    let isMobile = window.innerWidth <= 768;

    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        if(isMobile) document.querySelectorAll('.smart-badge').forEach(el => el.style.transform = '');
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
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

                setTimeout(() => {
                    currentItem.classList.remove('exit');
                }, 800);

                currentIndex = nextIndex;
            }, intervalTime);
        }, initialDelay);
    };

    initRotator('main-rotator', 3000, 0);
    initRotator('subtitle-rotator', 3500, 500);

    const initSocialSlider = () => {
        const track = document.querySelector('.social-track');
        if(!track) return;
        const moveDistance = track.scrollWidth / 2;
        const animation = gsap.to(track, {
            x: -(moveDistance), duration: 15, ease: "none", repeat: -1
        });
        const container = document.querySelector('.social-slider-container');
        container.addEventListener('mouseenter', () => gsap.to(animation, { timeScale: 0, duration: 0.5, ease: "power1.out" }));
        container.addEventListener('mouseleave', () => gsap.to(animation, { timeScale: 1, duration: 0.8, ease: "power1.in" }));
    };
    window.addEventListener('load', initSocialSlider);

    class LiquidReveal {
        constructor() {
            this.canvas = document.getElementById('reveal-canvas');
            this.wrapper = document.querySelector('.bg-reveal-wrapper');
            this.isMobile = window.innerWidth <= 768;
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
                this.points.push({
                    x: interactX, y: interactY, age: this.maxAge,
                    currentRadius: this.radius + Math.min(dist * 0.5, 30)
                });
            }
            this.lastX = relX; this.lastY = relY;
        }

        animate() {
            if (this.isMobile) return;
            if(this.wrapper) {
                const rect = this.wrapper.getBoundingClientRect();
                this.offsetX = rect.left - 1;
                this.offsetY = rect.top - 1;
            }
            this.ctx.clearRect(0, 0, this.width, this.height);
            if (mouseX !== 0 && mouseY !== 0) this.addPoint(mouseX, mouseY);

            this.points.forEach((point, i) => {
                point.age--;
                if (point.age <= 0) {
                    this.points.splice(i, 1);
                } else {
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

            if (canvasRatio > imgRatio) {
                renderW = this.width; renderH = this.width / imgRatio;
                drawX = 0; drawY = (this.height - renderH) / 2;
            } else {
                renderH = this.height; renderW = this.height * imgRatio;
                drawX = (this.width - renderW) / 2; drawY = 0;
            }
            this.ctx.drawImage(this.bgImage, drawX, drawY, renderW, renderH);
            this.ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(() => this.animate());
        }
    }
    const revealEffect = new LiquidReveal();

    class MagneticBadge {
        constructor(el) {
            this.el = el;
            this.isRight = this.el.closest('.smart-badge-wrapper').classList.contains('right');
            this.x = 0; this.y = 0; this.currentAngle = 0; this.isHovering = false;
            
            this.el.addEventListener('mouseenter', () => this.isHovering = true);
            this.el.addEventListener('mouseleave', () => this.isHovering = false);
            this.el.addEventListener('touchstart', () => { if(isMobile) this.el.style.transform = 'scale(0.96)'; }, {passive: true});
            this.el.addEventListener('touchend', () => { if(isMobile) this.el.style.transform = ''; }, {passive: true});
            this.animate();
        }

        lerp(start, end, factor) { return start + (end - start) * factor; }
        lerpAngle(current, target, factor) {
            let cur = current % 360, tar = target % 360;
            if (cur < 0) cur += 360; if (tar < 0) tar += 360;
            let diff = tar - cur;
            if (diff > 180) diff -= 360; if (diff < -180) diff += 360;
            return cur + diff * factor;
        }

        animate() {
            const rect = this.el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = mouseX - centerX;
            const distanceY = mouseY - centerY;
            const dist = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            const angleRad = Math.atan2(mouseY - centerY, mouseX - centerX);
            let mouseAngleDeg = angleRad * (180 / Math.PI) + 90;
            const time = Date.now() * CONFIG.rotationSpeed;
            let idleAngleDeg = this.isRight ? (-time + 180) : time;
            let targetAngle = (!isMobile && dist < CONFIG.proximity) ? mouseAngleDeg : idleAngleDeg;

            this.currentAngle = this.lerpAngle(this.currentAngle, targetAngle, CONFIG.angleSmoothness);
            this.el.style.setProperty('--angle', `${this.currentAngle}deg`);

            if (!isMobile) {
                let targetX = 0, targetY = 0, rotateX = 0, rotateY = 0;
                if (dist < CONFIG.proximity) {
                    const pull = (CONFIG.proximity - dist) / CONFIG.proximity;
                    targetX = distanceX * CONFIG.magneticForce * pull;
                    targetY = distanceY * CONFIG.magneticForce * pull;
                    rotateY = (distanceX / (rect.width / 2)) * CONFIG.tiltStrength * pull;
                    rotateX = -(distanceY / (rect.height / 2)) * CONFIG.tiltStrength * pull;
                    const relX = mouseX - rect.left;
                    const relY = mouseY - rect.top;
                    this.el.style.setProperty('--x', `${relX}px`);
                    this.el.style.setProperty('--y', `${relY}px`);
                }
                this.x = this.lerp(this.x, targetX, CONFIG.smoothness);
                this.y = this.lerp(this.y, targetY, CONFIG.smoothness);
                const currentRotateX = parseFloat(this.el.dataset.rotateX || 0);
                const currentRotateY = parseFloat(this.el.dataset.rotateY || 0);
                const newRotateX = this.lerp(currentRotateX, rotateX, CONFIG.smoothness);
                const newRotateY = this.lerp(currentRotateY, rotateY, CONFIG.smoothness);
                this.el.dataset.rotateX = newRotateX;
                this.el.dataset.rotateY = newRotateY;
                this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) perspective(1000px) rotateX(${newRotateX}deg) rotateY(${newRotateY}deg) scale(${this.isHovering ? CONFIG.scaleOnHover : 1})`;
            }
            requestAnimationFrame(() => this.animate());
        }
    }
    const badges = document.querySelectorAll('.smart-badge');
    badges.forEach(badgeEl => new MagneticBadge(badgeEl));

    let lastScrollTop = 0;
    const wrappers = document.querySelectorAll('.smart-badge-wrapper');
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 50) wrappers.forEach(w => w.classList.add('scroll-hide'));
        else wrappers.forEach(w => w.classList.remove('scroll-hide'));
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
});
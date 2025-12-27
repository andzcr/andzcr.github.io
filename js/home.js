document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. STYLE INJECTION (Fix pentru animația border-ului)
    const style = document.createElement('style');
    style.innerHTML = `
        .smart-badge::after { 
            animation: none !important; 
            background: conic-gradient(from var(--angle), transparent 50%, rgba(255, 255, 255, 0.8) 85%, #ffffff 95%, transparent 100%);
        }
    `;
    document.head.appendChild(style);

    // --- CONFIGURAȚIE GENERALĂ ---
    const CONFIG = {
        proximity: 300,        
        magneticForce: 0.4,    
        smoothness: 0.1,       
        angleSmoothness: 0.1, 
        tiltStrength: 15,      
        scaleOnHover: 1.02,
        rotationSpeed: 0.2     
    };

    let mouseX = 0;
    let mouseY = 0;
    let isMobile = window.innerWidth <= 768;

    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        if(isMobile) {
            document.querySelectorAll('.smart-badge').forEach(el => el.style.transform = '');
        }
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ==================================================
    // NEW: WORD ROTATOR SYSTEM
    // ==================================================
    const initWordRotator = () => {
        const words = document.querySelectorAll('.rotating-word');
        if (words.length === 0) return;

        let currentIndex = 0;
        const intervalTime = 3000; // 3 secunde între cuvinte

        setInterval(() => {
            // 1. Identificăm cuvântul curent și următorul
            const currentWord = words[currentIndex];
            const nextIndex = (currentIndex + 1) % words.length;
            const nextWord = words[nextIndex];

            // 2. Animație OUT (Current -> Sus)
            currentWord.classList.remove('active');
            currentWord.classList.add('exit');

            // 3. Resetăm cuvântul care tocmai a ieșit (după ce s-a terminat tranziția)
            // Îl mutăm instant jos, fără tranziție, pentru a fi gata de intrare data viitoare
            setTimeout(() => {
                currentWord.classList.remove('exit');
                // Force reflow (opțional, dar bun pentru siguranță)
                void currentWord.offsetWidth; 
            }, 800); // 800ms este durata tranziției CSS

            // 4. Animație IN (Next -> Centru)
            // Ne asigurăm că 'nextWord' este curat (fără clasa exit)
            nextWord.classList.remove('exit');
            nextWord.classList.add('active');

            // 5. Avansăm indexul
            currentIndex = nextIndex;

        }, intervalTime);
    };

    // Pornim rotatorul
    initWordRotator();

    // ==================================================
    // LIQUID REVEAL SYSTEM
    // ==================================================
    class LiquidReveal {
        constructor() {
            this.canvas = document.getElementById('reveal-canvas');
            this.isMobile = window.innerWidth <= 768;
            if (!this.canvas || this.isMobile) return;

            this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });
            this.width = 0;
            this.height = 0;
            
            this.bgImage = new Image();
            this.bgImage.crossOrigin = "Anonymous";
            this.bgImage.src = 'https://andzcr.github.io/resources/photos/effect.jpg';

            this.points = [];
            this.maxAge = 120;
            this.radius = 160;
            this.lastX = mouseX;
            this.lastY = mouseY;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => {
                this.resize();
                // Check mobile again on resize
                this.isMobile = window.innerWidth <= 768;
                if(this.isMobile) this.canvas.style.display = 'none';
                else this.canvas.style.display = 'block';
            });
            
            this.bgImage.onload = () => {
                this.canvas.classList.add('ready');
                this.animate();
            };
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }

        addPoint(x, y) {
            const dist = Math.hypot(x - this.lastX, y - this.lastY);
            const steps = Math.min(Math.ceil(dist / 20), 10); 
            
            for (let i = 0; i < steps; i++) {
                const interactX = this.lastX + (x - this.lastX) * (i / steps);
                const interactY = this.lastY + (y - this.lastY) * (i / steps);
                
                this.points.push({
                    x: interactX,
                    y: interactY,
                    age: this.maxAge,
                    currentRadius: this.radius + Math.min(dist * 0.5, 30)
                });
            }

            this.lastX = x;
            this.lastY = y;
        }

        animate() {
            if (this.isMobile) return; // Stop loop on mobile

            this.ctx.clearRect(0, 0, this.width, this.height);

            if (mouseX !== 0 && mouseY !== 0) {
                this.addPoint(mouseX, mouseY);
            }

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
            let renderW, renderH, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                renderW = this.width;
                renderH = this.width / imgRatio;
                offsetX = 0;
                offsetY = (this.height - renderH) / 2;
            } else {
                renderH = this.height;
                renderW = this.height * imgRatio;
                offsetX = (this.width - renderW) / 2;
                offsetY = 0;
            }
            
            this.ctx.drawImage(this.bgImage, offsetX, offsetY, renderW, renderH);
            this.ctx.globalCompositeOperation = 'source-over';

            requestAnimationFrame(() => this.animate());
        }
    }

    const revealEffect = new LiquidReveal();


    // ==================================================
    // MAGNETIC BADGE LOGIC
    // ==================================================
    class MagneticBadge {
        constructor(el) {
            this.el = el;
            this.isRight = this.el.closest('.smart-badge-wrapper').classList.contains('right');
            this.x = 0;
            this.y = 0;
            this.currentAngle = 0; 
            this.isHovering = false;
            
            this.el.addEventListener('mouseenter', () => this.isHovering = true);
            this.el.addEventListener('mouseleave', () => this.isHovering = false);
            
            this.el.addEventListener('touchstart', () => {
                if(isMobile) this.el.style.transform = 'scale(0.96)';
            }, {passive: true});
            
            this.el.addEventListener('touchend', () => {
                if(isMobile) this.el.style.transform = '';
            }, {passive: true});

            this.animate();
        }

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        lerpAngle(current, target, factor) {
            let cur = current % 360;
            let tar = target % 360;
            if (cur < 0) cur += 360;
            if (tar < 0) tar += 360;
            let diff = tar - cur;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
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

            let targetAngle;
            
            if (!isMobile && dist < CONFIG.proximity) {
                targetAngle = mouseAngleDeg;
                const relX = mouseX - rect.left;
                const relY = mouseY - rect.top;
                this.el.style.setProperty('--x', `${relX}px`);
                this.el.style.setProperty('--y', `${relY}px`);
            } else {
                targetAngle = idleAngleDeg;
            }

            this.currentAngle = this.lerpAngle(this.currentAngle, targetAngle, CONFIG.angleSmoothness);
            this.el.style.setProperty('--angle', `${this.currentAngle}deg`);

            if (!isMobile) {
                let targetX = 0;
                let targetY = 0;
                let rotateX = 0;
                let rotateY = 0;

                if (dist < CONFIG.proximity) {
                    const pull = (CONFIG.proximity - dist) / CONFIG.proximity;
                    targetX = distanceX * CONFIG.magneticForce * pull;
                    targetY = distanceY * CONFIG.magneticForce * pull;
                    rotateY = (distanceX / (rect.width / 2)) * CONFIG.tiltStrength * pull;
                    rotateX = -(distanceY / (rect.height / 2)) * CONFIG.tiltStrength * pull;
                }

                this.x = this.lerp(this.x, targetX, CONFIG.smoothness);
                this.y = this.lerp(this.y, targetY, CONFIG.smoothness);
                
                const currentRotateX = parseFloat(this.el.dataset.rotateX || 0);
                const currentRotateY = parseFloat(this.el.dataset.rotateY || 0);
                
                const newRotateX = this.lerp(currentRotateX, rotateX, CONFIG.smoothness);
                const newRotateY = this.lerp(currentRotateY, rotateY, CONFIG.smoothness);
                
                this.el.dataset.rotateX = newRotateX;
                this.el.dataset.rotateY = newRotateY;

                this.el.style.transform = `
                    translate3d(${this.x}px, ${this.y}px, 0)
                    perspective(1000px)
                    rotateX(${newRotateX}deg)
                    rotateY(${newRotateY}deg)
                    scale(${this.isHovering ? CONFIG.scaleOnHover : 1})
                `;
            } 
            
            requestAnimationFrame(() => this.animate());
        }
    }

    const badges = document.querySelectorAll('.smart-badge');
    badges.forEach(badgeEl => new MagneticBadge(badgeEl));

    // --- VIDEO LOGIC ---
    const projectBadge = document.querySelector('.project-badge');
    const previewVideos = document.querySelectorAll('.badge-video');
    const progressFill = document.querySelector('.progress-fill');
    
    if (projectBadge && previewVideos.length > 0) {
        let currentVideoIndex = 0;
        let progressInterval;
        let isVideoHovering = false;

        const resetProgress = () => {
            if (progressFill) progressFill.style.width = '0%';
            clearInterval(progressInterval);
        };

        const startProgress = (duration) => {
            if (!progressFill) return;
            let width = 0;
            const intervalTime = 50; 
            const step = 100 / (duration / intervalTime);
            
            clearInterval(progressInterval);
            progressFill.style.width = '0%';
            
            progressInterval = setInterval(() => {
                width += step;
                if (width >= 100) width = 100;
                progressFill.style.width = `${width}%`;
            }, intervalTime);
        };

        const playNextVideo = () => {
            if (!isVideoHovering) return;
            const currentVideo = previewVideos[currentVideoIndex];
            const nextIndex = (currentVideoIndex + 1) % previewVideos.length;
            const nextVideo = previewVideos[nextIndex];

            nextVideo.currentTime = 0;
            nextVideo.style.zIndex = "2";
            currentVideo.style.zIndex = "1";

            nextVideo.play().then(() => {
                nextVideo.classList.add('active');
                const duration = (nextVideo.duration || 4) * 1000;
                startProgress(duration);

                setTimeout(() => {
                    currentVideo.classList.remove('active');
                    currentVideo.pause();
                }, 800);
                
                currentVideoIndex = nextIndex;
                nextVideo.onended = () => playNextVideo();
            }).catch(e => {});
        };

        projectBadge.addEventListener('mouseenter', () => {
            if (isMobile) return;
            isVideoHovering = true;
            const firstVideo = previewVideos[currentVideoIndex];
            firstVideo.classList.add('active');
            firstVideo.play().catch(e => {});
            
            const duration = (firstVideo.duration || 4) * 1000;
            startProgress(duration);
            firstVideo.onended = () => playNextVideo();
        });

        projectBadge.addEventListener('mouseleave', () => {
            isVideoHovering = false;
            resetProgress();
            previewVideos.forEach(v => {
                v.pause(); v.currentTime = 0; v.classList.remove('active');
                v.onended = null; v.style.zIndex = "";
            });
            currentVideoIndex = 0;
            previewVideos[0].classList.add('active');
        });
    }

    // --- SCROLL LOGIC ---
    let lastScrollTop = 0;
    const wrappers = document.querySelectorAll('.smart-badge-wrapper');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            wrappers.forEach(w => w.classList.add('scroll-hide'));
        } else {
            wrappers.forEach(w => w.classList.remove('scroll-hide'));
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
});
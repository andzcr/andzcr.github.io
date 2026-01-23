document.addEventListener('DOMContentLoaded', () => {
    const themeTrigger = document.getElementById('theme-trigger');
    const themeDrawer = document.getElementById('theme-drawer');
    const closeBtn = document.getElementById('close-menu-btn');
    const themePanel = document.querySelector('.theme-panel');
    const themeBtns = document.querySelectorAll('.theme-btn:not(#winter-card)'); 
    const loadingOverlay = document.getElementById('loading-overlay');
    const STORAGE_KEY = 'user_theme_preference';

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabLine = document.getElementById('tab-line');
    let currentView = 'view-themes';

    const themeCornerColors = {
        'default': ['#333333', '#111111'], 'light': ['#7c9fab', '#ffffffff'], 'midnight-purple': ['#8800ffff', '#000000ff'],
        'blood-cream': ['#ef4444', '#060606ff'], 'wine-cloud': ['#6b21a8', '#e9ceffff'], 'pure-ivory': ['#e5e5e5', '#d6d3d1'],
        'golden-noir': ['#fbbf24', '#78350f'], 'sage-aura': ['#86efac', '#166534']
    };

    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'default';
    applyTheme(savedTheme, false);
    updateActiveButton(savedTheme);
    setTimeout(() => moveLine(document.querySelector('.tab-btn.active')), 100);

    themeTrigger.addEventListener('click', () => { 
        themeDrawer.classList.add('open'); 
        themeTrigger.classList.add('hidden');
        animateItemsEntry(currentView);
    });

    const closeMenu = () => { 
        themeDrawer.classList.remove('open'); 
        themeTrigger.classList.remove('hidden'); 
    };

    closeBtn.addEventListener('click', closeMenu);
    themeDrawer.addEventListener('click', (e) => { if (e.target === themeDrawer) closeMenu(); });
    themePanel.addEventListener('mouseleave', () => { 
        if(window.innerWidth > 768) {
            setTimeout(() => { if(!themePanel.matches(':hover')) closeMenu(); }, 300); 
            themePanel.classList.remove('glow-active');
        }
    });

    function animateItemsEntry(viewId) {
        const view = document.getElementById(viewId);
        const items = view.querySelectorAll('.theme-btn');
        items.forEach((btn, index) => {
            btn.style.animationDelay = `${index * 0.15}s`;
            btn.classList.remove('anim-exit');
            btn.classList.add('anim-enter');
        });
    }

    function animateItemsExit(viewId, callback) {
        const view = document.getElementById(viewId);
        const items = view.querySelectorAll('.theme-btn');
        
        items.forEach((btn, index) => {
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.classList.remove('anim-enter');
            btn.classList.add('anim-exit');
        });

        setTimeout(callback, 300); 
    }

    function moveLine(target) {
        if(!target) return;
        tabLine.style.width = `${target.offsetWidth}px`;
        tabLine.style.left = `${target.offsetLeft}px`;
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => moveLine(btn));
        btn.addEventListener('mouseleave', () => moveLine(document.querySelector('.tab-btn.active')));

        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            const targetView = `view-${btn.dataset.target}`;
            const prevView = currentView;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moveLine(btn);

            animateItemsExit(prevView, () => {
                document.getElementById(prevView).classList.remove('active');
                document.getElementById(targetView).classList.add('active');
                currentView = targetView;

                animateItemsEntry(targetView);
            });
        });
    });

    themeBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const rotateX = ((y - rect.height/2) / 10) * -1; const rotateY = (x - rect.width/2) / 10;
            btn.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'; });
        btn.addEventListener('mouseenter', () => {
            const theme = btn.getAttribute('data-theme');
            const colors = themeCornerColors[theme] || themeCornerColors['default'];
            themePanel.style.setProperty('--corner-top', colors[0]);
            themePanel.style.setProperty('--corner-bottom', colors[1]);
            themePanel.classList.add('glow-active');
        });
        btn.addEventListener('click', () => {
            const selectedTheme = btn.getAttribute('data-theme');
            if (document.body.getAttribute('data-theme-style') === selectedTheme) return; 
            handleThemeTransition(selectedTheme);
        });
    });

    function handleThemeTransition(themeName) {
        closeMenu(); 
        
        const colors = getThemeColors(themeName);
        document.documentElement.style.setProperty('--load-bg', colors.bg);
        document.documentElement.style.setProperty('--load-color', colors.text);
        loadingOverlay.classList.add('active');
        setTimeout(() => { 
            applyTheme(themeName, true); 
            updateActiveButton(themeName); 
            setTimeout(() => { loadingOverlay.classList.remove('active'); }, 500); 
        }, 1500); 
    }
    function applyTheme(t, s) { if(t === 'default') document.body.removeAttribute('data-theme-style'); else document.body.setAttribute('data-theme-style', t); if(s) localStorage.setItem(STORAGE_KEY, t); }
    function updateActiveButton(t) { themeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === t)); }
    function getThemeColors(t) {
        const map = { 'light': {bg:'#fff',text:'#7c9fab'}, 'midnight-purple': {bg:'#020005',text:'#d8b4fe'}, 'blood-cream': {bg:'#1a0505',text:'#ebe5c9'}, 'wine-cloud': {bg:'#f3f0fa',text:'#5e4074'}, 'pure-ivory': {bg:'#f9f8f4',text:'#33312e'}, 'golden-noir': {bg:'#080808',text:'#d4af37'}, 'sage-aura': {bg:'#141814',text:'#8fb38f'} };
        return map[t] || {bg:'#050505',text:'#fff'};
    }

    const winterCard = document.getElementById('winter-card');
    const snowCanvas = document.getElementById('snow-container');
    const winterLoader = document.getElementById('winter-loader');
    const winterText = document.getElementById('got-message');
    let isWinterActive = false, isStopping = false, snowAnimId;

    const btnCanvas = document.getElementById('btn-snow-canvas');
    const btnCtx = btnCanvas.getContext('2d');
    let btnFlakes = [], btnAnimId, btnHovering = false;

    function resizeBtn() { 
        const r = winterCard.getBoundingClientRect(); 
        btnCanvas.width = r.width; btnCanvas.height = r.height; 
    }
    setTimeout(resizeBtn, 500); 

    class BtnFlake {
        constructor() {
            this.x = Math.random() * btnCanvas.width;
            this.y = -5;
            this.size = Math.random() * 1.5 + 0.5;
            this.speed = Math.random() * 0.4 + 0.1;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        update() { this.y += this.speed; }
        draw() {
            btnCtx.beginPath();
            const g = btnCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            g.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
            g.addColorStop(1, `rgba(255,255,255,0)`);
            btnCtx.fillStyle = g;
            btnCtx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            btnCtx.fill();
        }
    }

    function animateBtnSnow() {
        btnCtx.clearRect(0, 0, btnCanvas.width, btnCanvas.height);
        if (btnHovering && Math.random() < 0.2) btnFlakes.push(new BtnFlake());
        for (let i = 0; i < btnFlakes.length; i++) {
            let f = btnFlakes[i]; f.update(); f.draw();
            if (f.y > btnCanvas.height) { btnFlakes.splice(i, 1); i--; }
        }
        if (btnFlakes.length > 0 || btnHovering) btnAnimId = requestAnimationFrame(animateBtnSnow);
    }

    winterCard.addEventListener('mouseenter', () => { resizeBtn(); btnHovering = true; if(btnFlakes.length === 0) animateBtnSnow(); });
    winterCard.addEventListener('mouseleave', () => { btnHovering = false; });

    const ctx = snowCanvas.getContext('2d');
    let flakes = [];
    let windTarget = 0, windActual = 0;
    let mouseX = -1000, mouseY = -1000;

    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function resizeGlobal() { snowCanvas.width = window.innerWidth; snowCanvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeGlobal); resizeGlobal();

    class Flake {
        constructor() { this.init(true); }
        init(first) {
            this.x = Math.random() * snowCanvas.width;
            this.y = first ? Math.random() * snowCanvas.height : -30;
            
            const rand = Math.random();
            if (rand < 0.7) this.type = 'bokeh'; else if (rand < 0.9) this.type = 'crystal'; else this.type = 'stardust';
            this.z = Math.random();
            
            if (this.type === 'bokeh') {
                this.size = (this.z * 3.5) + 1.5; this.opacity = (this.z * 0.2) + 0.05; this.speedY = (this.z * 0.6) + 0.2;
            } else if (this.type === 'crystal') {
                this.size = (this.z * 4.5) + 2; this.opacity = (this.z * 0.4) + 0.3; this.speedY = (this.z * 0.9) + 0.4;
            } else {
                this.size = (Math.random() * 1.5) + 0.5; this.opacity = Math.random() * 0.8; this.speedY = (this.z * 0.5) + 0.1;
            }
            this.angle = Math.random() * Math.PI * 2; this.spin = (Math.random() - 0.5) * 0.03;
            this.vx = 0; this.vy = 0; this.swayFreq = Math.random() * 0.02 + 0.005; this.swayAmp = Math.random() * 0.5;
        }
        update() {
            this.y += this.speedY;
            const windEffect = windActual * (1.5 - this.z); 
            this.x += Math.sin(this.y * this.swayFreq) * this.swayAmp + windEffect;
            const dx = this.x - mouseX, dy = this.y - mouseY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                const force = (150 - dist) / 150; const angle = Math.atan2(dy, dx);
                this.vx += Math.cos(angle) * force * 0.8; this.vy += Math.sin(angle) * force * 0.8;
            }
            this.x += this.vx; this.y += this.vy; this.vx *= 0.92; this.vy *= 0.92; this.angle += this.spin;
            if (!isStopping) {
                if (this.y > snowCanvas.height + 20) this.init(false);
                if (this.x > snowCanvas.width + 20) this.x = -20; if (this.x < -20) this.x = snowCanvas.width + 20;
            }
        }
        draw() {
            ctx.save(); ctx.translate(this.x, this.y);
            if (this.type === 'bokeh') {
                const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                g.addColorStop(0, `rgba(255,255,255,${this.opacity})`); g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI*2); ctx.fill();
            } else if (this.type === 'crystal') {
                ctx.rotate(this.angle);
                const shimmer = Math.abs(Math.sin(this.angle * 2)) * 0.3;
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity + shimmer})`; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
                ctx.beginPath(); for(let i=0; i<6; i++) { ctx.rotate(Math.PI/3); ctx.moveTo(0, 0); ctx.lineTo(0, this.size * 0.8); } ctx.stroke();
            } else {
                const life = (Date.now() % 1000) / 500; const pulse = Math.sin(life * Math.PI);
                if (pulse > 0.1) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`; ctx.beginPath();
                    ctx.moveTo(0, -this.size * 2); ctx.lineTo(this.size, 0); ctx.lineTo(0, this.size * 2); ctx.lineTo(-this.size, 0); ctx.fill();
                }
            }
            ctx.restore();
        }
    }

    function animateGlobal() {
        if (!isWinterActive && flakes.length === 0) {
            ctx.clearRect(0,0, snowCanvas.width, snowCanvas.height);
            snowCanvas.classList.remove('snowing'); return;
        }
        const time = Date.now();
        if (Math.random() < 0.005) windTarget = (Math.random() - 0.5) * 3;
        windActual += (windTarget - windActual) * 0.01;
        ctx.clearRect(0,0, snowCanvas.width, snowCanvas.height);
        for (let i = 0; i < flakes.length; i++) {
            let f = flakes[i]; f.update(); f.draw();
            if (isStopping && f.y > snowCanvas.height + 20) { flakes.splice(i, 1); i--; }
        }
        snowAnimId = requestAnimationFrame(animateGlobal);
    }

    winterCard.addEventListener('click', () => {
        closeMenu(); 

        winterLoader.classList.add('active');
        if (!isWinterActive) winterText.innerText = "Winter Is Coming";
        else winterText.innerText = "Winter Has Ended";

        setTimeout(() => {
            if (!isWinterActive) {
                isWinterActive = true;
                isStopping = false;
                winterCard.classList.add('winter-active');
                snowCanvas.classList.add('snowing');
                flakes = []; for(let i=0; i<85; i++) flakes.push(new Flake());
                animateGlobal();
            } else {
                isWinterActive = false;
                isStopping = true;
                winterCard.classList.remove('winter-active');
            }
            winterLoader.classList.remove('active');
        }, 2200);
    });
});
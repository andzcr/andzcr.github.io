let currentReview = {
    name: '',
    description: '',
    service: 'web',
    rating: 5
};

let reviewsTimeline = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    setTimeout(() => { loadReviewsFromFirebase(); }, 500);

    if (typeof Lenis !== 'undefined') {
        window.lenis = new Lenis();
        window.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{ window.lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }
});

async function loadReviewsFromFirebase() {
    const container = document.getElementById('reviews-container');
    const scoreDisplay = document.getElementById('avg-rating-display');
    
    if (!window.db) {
        console.warn("Database not initialized (Mock Mode or Offline).");
        initReviewsAnimations(); 
        return;
    }

    try {
        if (reviewsTimeline) {
            reviewsTimeline.kill();
            ScrollTrigger.getById("reviewsTrigger")?.kill();
        }

        const querySnapshot = await window.db.collection('reviews')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        if (!querySnapshot.empty) { container.innerHTML = ''; }

        let index = 0;
        let totalRating = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const rating = Number(data.rating) || 5;
            totalRating += rating;
            count++;

            if (index < 5) {
                const isRight = index % 2 !== 0; 
                try {
                    const html = createReviewCardHTML(data, isRight);
                    container.insertAdjacentHTML('beforeend', html);
                } catch (err) {}
            }
            index++;
        });

        if (count > 0 && scoreDisplay) {
            const avg = (totalRating / count).toFixed(2);
            scoreDisplay.innerText = avg;
        }

    } catch (error) {
        console.error("Error loading reviews:", error);
    } finally {
        setTimeout(() => {
            ScrollTrigger.refresh();
            initReviewsAnimations();
        }, 200);
    }
}

function createReviewCardHTML(data, isRight) {
    const alignClass = isRight ? 'right' : '';
    const name = data.name || 'Anonymous';
    const description = data.description || '';
    const rating = Math.max(1, Math.min(5, Number(data.rating) || 5)); 
    const service = data.service || 'web';

    let iconSvg = '';
    let iconClass = '';
    
    if (service === 'web') {
        iconClass = 'icon-web';
        iconSvg = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>';
    } else {
        iconClass = 'icon-brand';
        iconSvg = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><path d="M11 11l-4 4"/><path d="M13 18l4 4"/></svg>';
    }
    
    let avatarImg = 'https://andzcr.github.io/resources/photos/reviews/good.png';
    if (rating <= 2) avatarImg = 'https://andzcr.github.io/resources/photos/reviews/poor.png';
    else if (rating <= 4) avatarImg = 'https://andzcr.github.io/resources/photos/reviews/meh.png';

    const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    return `
        <div class="chat-row ${alignClass}" data-category="${service}">
            <div class="chat-avatar">
                <img src="${avatarImg}" alt="${initials}">
            </div>
            <div class="chat-bubble">
                <span class="chat-name">${name}</span>
                <p class="chat-text">${description}</p>
                <div class="chat-meta">
                    <div class="chat-icon-box ${iconClass}" title="${service}">
                        ${iconSvg}
                    </div>
                    <span class="chat-stars">${'★'.repeat(rating)}</span>
                </div>
            </div>
        </div>
    `;
}

window.filterChat = function(category, btn) {
    const buttons = document.querySelectorAll('.chat-filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');

    const rows = document.querySelectorAll('.chat-row');
    
    rows.forEach(row => {
        const rowCat = row.getAttribute('data-category');
        
        if (category === 'all') {
            row.classList.remove('faded');
        } else {
            if (rowCat === category) {
                row.classList.remove('faded');
            } else {
                row.classList.add('faded');
            }
        }
    });
}

function initReviewsAnimations() {
    reviewsTimeline = gsap.timeline({
        id: "reviewsTrigger", 
        scrollTrigger: {
            trigger: ".reviews-section",
            start: "top top",
            end: "+=4000", 
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true 
        }
    });

    reviewsTimeline.to(".reviews-title-zoom", { scale: 50, opacity: 0, duration: 1, ease: "power2.inOut" });
    reviewsTimeline.to([".chat-layout", ".chat-filter-header"], { opacity: 1, duration: 0.5 }, "<"); 

    const chatRows = document.querySelectorAll('.chat-row');
    if (chatRows.length > 0) {
        chatRows.forEach((row, i) => {
            reviewsTimeline.to(row, { y: 0, opacity: 1, duration: 1, ease: "power2.out" });
            
            if (i < chatRows.length) {
                reviewsTimeline.to(".chat-column", { y: - (i * 120), duration: 1, ease: "power1.inOut" }, "<+=0.5");
            }
        });
    }

    reviewsTimeline.to(".chat-layout", { opacity: 0, y: -100, duration: 1, ease: "power2.in" });
    reviewsTimeline.to(".chat-filter-header", { opacity: 0, duration: 0.5 }, "<");
    
    reviewsTimeline.to(".cta-final-wrapper", { opacity: 1, pointerEvents: "all", duration: 0.5 }, "-=0.5"); 
    reviewsTimeline.to("#word-your", { y: 0, opacity: 1, duration: 1, ease: "power2.out" });
    reviewsTimeline.to("#word-turn", { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "<+=0.2");
    reviewsTimeline.to(".cta-stats-container", { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "<+=0.3");
    reviewsTimeline.to(".cta-input-btn", { y: 0, opacity: 1, duration: 1, ease: "back.out(1.5)" }, "<+=0.3");

    return reviewsTimeline;
}

let savedScrollY = 0;

function toggleScroll(lock) {
    const body = document.body;
    
    if (lock) {
        savedScrollY = window.scrollY;

        if(window.lenis) window.lenis.stop();
        
        body.style.top = `-${savedScrollY}px`;
        
        body.classList.add('modal-open');
    } else {
        body.classList.remove('modal-open');
        
        body.style.top = '';
        
        window.scrollTo(0, savedScrollY);

        if(window.lenis) window.lenis.start();
    }
}

window.openReviewModal = function() {
    const modal = document.getElementById('review-modal-overlay');
    if(modal) {
        modal.classList.add('active');
        toggleScroll(true);
        
        const nameIn = document.getElementById('rev-name');
        const descIn = document.getElementById('rev-desc');
        if(nameIn) nameIn.value = '';
        if(descIn) descIn.value = '';
        
        currentReview.name = '';
        currentReview.description = '';
        
        selectRating(5);
        selectService('web');
        updatePreview();
    } else {
        console.error("Modal overlay not found in DOM");
        alert("Eroare: Fereastra modală nu a fost găsită.");
    }
}

window.closeReviewModal = function() {
    const modal = document.getElementById('review-modal-overlay');
    if(modal) {
        modal.classList.remove('active');
        toggleScroll(false);
    }
}

window.updatePreview = function() {
    const nameInput = document.getElementById('rev-name');
    const descInput = document.getElementById('rev-desc');
    const counter = document.getElementById('char-counter');
    
    if(!nameInput || !descInput) return;

    if (descInput.value.length > 100) {
        descInput.value = descInput.value.substring(0, 100);
    }
    if(counter) counter.innerText = `${descInput.value.length}/100`;

    currentReview.name = nameInput.value;
    currentReview.description = descInput.value;

    const pcName = document.getElementById('pc-name');
    const pcBody = document.getElementById('pc-body');
    
    if(pcName) pcName.textContent = currentReview.name || 'Andrei';
    if(pcBody) pcBody.textContent = currentReview.description ? `"${currentReview.description}"` : '"Your review will appear here..."';
}

window.selectService = function(service) {
    currentReview.service = service;
    
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(c => c.classList.remove('active'));
    
    const activeCard = document.querySelector(`.service-card[data-val="${service}"]`);
    if(activeCard) activeCard.classList.add('active');
    
    const pcService = document.getElementById('pc-service');
    const pcIconBox = document.getElementById('pc-icon-box');
    
    if(pcService) {
        pcService.textContent = service === 'web' ? 'Web Development' : 'Brand Design';
        pcService.style.color = service === 'web' ? '#a855f7' : '#93c5fd';
        pcService.style.background = service === 'web' ? 'rgba(168,85,247,0.1)' : 'rgba(59,130,246,0.1)';
    }

    if(pcIconBox) {
        if (service === 'web') {
            pcIconBox.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>';
            pcIconBox.style.color = '#d8b4fe';
        } else {
            pcIconBox.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>';
            pcIconBox.style.color = '#93c5fd';
        }
    }
}

window.selectRating = function(rating) {
    currentReview.rating = rating;
    
    const cards = document.querySelectorAll('.apple-rating-card');
    cards.forEach(card => card.classList.remove('active'));
    
    const activeCard = document.querySelector(`.apple-rating-card[data-rating="${rating}"]`);
    if(activeCard) activeCard.classList.add('active');

    const pcStars = document.getElementById('pc-stars');
    const pcImg = document.getElementById('pc-img');
    
    if(pcStars) pcStars.textContent = '★'.repeat(rating);
    
    if(pcImg) {
        if(rating >= 4) pcImg.src = 'https://andzcr.github.io/resources/photos/reviews/good.png';
        else if(rating === 3) pcImg.src = 'https://andzcr.github.io/resources/photos/reviews/meh.png';
        else pcImg.src = 'https://andzcr.github.io/resources/photos/reviews/poor.png';
    }
}

window.submitReviewToFirebase = async function(event) {
    if(event) event.preventDefault();
    const container = document.getElementById('notification-container');

    if (!currentReview.name || !currentReview.name.trim() || !currentReview.description || !currentReview.description.trim()) {
        
        const errorNotif = document.createElement('div');
        errorNotif.className = 'ios-notification error'; 
        errorNotif.innerHTML = `
            <img class="notif-icon" src="https://andzcr.github.io/resources/photos/andz-logo.png" alt="Icon">
            <div class="notif-content">
                <span class="notif-title">ANDZ Bot</span>
                <span class="notif-msg">Please complete all fields!</span>
            </div>
            <div class="notif-error-icon">!</div>
        `;
        container.appendChild(errorNotif);
        
        gsap.fromTo(errorNotif, 
            { y: 50, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
        );
        setTimeout(() => {
            gsap.to(errorNotif, { y: 20, opacity: 0, duration: 0.5, onComplete:()=>errorNotif.remove() });
        }, 3000);
        
        return;
    }

    if (!window.db) { 
        alert("Mod demonstrație: Review-ul ar fi fost trimis (Firebase neconfigurat).");
        closeReviewModal();
        return; 
    }

    const btn = document.querySelector('.apple-submit-btn-top');
    const originalContent = btn ? btn.innerHTML : 'Publish';
    
    if(btn) { 
        btn.innerHTML = '<span>Sending...</span>'; 
        btn.style.pointerEvents = 'none'; 
    }

    try {
        await window.db.collection('reviews').add({
            name: currentReview.name,
            description: currentReview.description,
            service: currentReview.service,
            rating: currentReview.rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        closeReviewModal();
        
        const notif = document.createElement('div');
        notif.className = 'ios-notification'; 
        notif.innerHTML = `
            <img class="notif-icon" src="https://andzcr.github.io/resources/photos/andz-logo.png" alt="Icon">
            <div class="notif-content">
                <span class="notif-title">ANDZ Bot</span>
                <span class="notif-msg">Review Submitted SUCCESFULY</span>
            </div>
            <div class="notif-check">✓</div>
        `;
        container.appendChild(notif);
        
        gsap.fromTo(notif, 
            { y: 50, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
        );
        
        setTimeout(() => {
            gsap.to(notif, { y: 20, opacity: 0, duration: 0.5, onComplete:()=>notif.remove() });
        }, 4000); 

    } catch (error) {
        console.error("Error:", error);
        alert("Error submitting.");
    } finally {
        if(btn) { 
            btn.innerHTML = originalContent; 
            btn.style.pointerEvents = 'all'; 
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    
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
        console.log("Firebase Connected via contact.js ✅");
    } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
        window.db = firebase.firestore();
        console.log("Firebase already initialized, hooked into window.db");
    } else {
        console.warn("Firebase SDK not found!");
    }

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = 0;
                }
            });

            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = 0;
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#contact",
            start: "top 70%",
        }
    });

    tl.from(".contact-header", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".contact-form-box", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(".contact-right", { x: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

});

async function submitContactForm(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('.submit-btn');
    const originalText = btn.innerHTML;
    
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const message = document.getElementById('contact-message').value;
    
    btn.innerHTML = 'Sending...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
        if (!window.db) throw new Error("Database not connected");

        await window.db.collection('contacts').add({
            email: email,
            phone: phone,
            category: category,
            message: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            platform: 'web'
        });

        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = '#22c55e';
        
        e.target.reset();

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error("Error adding document: ", error);
        btn.innerHTML = 'Error. Try Again.';
        btn.style.background = '#ef4444';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 3000);
    }
}
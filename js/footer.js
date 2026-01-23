// Footer functionality
class FooterManager {
    constructor() {
        this.footer = document.querySelector('.main-footer');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.currentYear = document.getElementById('current-year');
        
        this.init();
    }
    
    init() {
        this.setCurrentYear();
        this.setupSmoothScrolling();
        this.setupHoverEffects();
        this.setupIntersectionObserver();
        this.setupContactAnimations();
    }
    
    setCurrentYear() {
        if (this.currentYear) {
            this.currentYear.textContent = new Date().getFullYear();
        }
    }
    
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    this.setActiveLink(link);
                    
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
    
    setActiveLink(activeLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }
    
    setupHoverEffects() {
        this.navLinks.forEach(link => {
            const underline = link.querySelector('.link-underline');
            
            link.addEventListener('mouseenter', () => {
                if (underline) {
                    underline.style.width = '100%';
                    underline.style.left = '0';
                    underline.style.right = 'auto';
                }
            });
            
            link.addEventListener('mouseleave', () => {
                if (underline) {
                    underline.style.width = '0';
                    underline.style.left = 'auto';
                    underline.style.right = '0';
                }
            });
        });
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('footer-visible');
                    
                    const contactItems = entry.target.querySelectorAll('.contact-item');
                    contactItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('contact-item-visible');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);
        
        if (this.footer) {
            observer.observe(this.footer);
        }
    }
    
    setupContactAnimations() {
        const contactValues = document.querySelectorAll('.contact-value');
        
        contactValues.forEach(value => {
            value.addEventListener('mouseenter', (e) => {
                this.animateContactIcon(e.target.closest('.contact-item'));
            });
        });
    }
    
    animateContactIcon(contactItem) {
        if (!contactItem) return;
        
        const icon = contactItem.querySelector('ion-icon');
        if (icon) {
            icon.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                icon.style.animation = '';
            }, 500);
        }
    }
    
    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (correspondingLink) {
                    this.setActiveLink(correspondingLink);
                }
            }
        });
    }
}

const addFooterAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        
        .footer-visible .nav-item {
            animation: slideIn 0.6s ease forwards;
        }
        
        .contact-item {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .contact-item-visible {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
};

document.addEventListener('DOMContentLoaded', () => {
    addFooterAnimations();
    window.footerManager = new FooterManager();
    
    window.addEventListener('scroll', () => {
        if (window.footerManager) {
            window.footerManager.updateActiveSection();
        }
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterManager;
}
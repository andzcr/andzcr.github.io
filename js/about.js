document.addEventListener('DOMContentLoaded', () => {
  const aboutSection = document.querySelector('#about');
  const revealElements = document.querySelectorAll('.apple-reveal');

  // Configurare Observer pentru performanță și acuratețe
  const observerOptions = {
    root: null, // viewport
    threshold: 0.15, // declanșează când 15% din element e vizibil
    rootMargin: "0px 0px -50px 0px" // offset mic
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Adăugăm clasa 'active' pentru a porni CSS transitions
        entry.target.classList.add('active');
        
        // Odată animat, nu mai avem nevoie să îl observăm
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Pornim observarea pentru fiecare element animabil
  revealElements.forEach(el => {
    observer.observe(el);
  });
  
  // Am eliminat logica de parallax (mousemove/mouseleave) conform solicitării.
  // Imaginea va rămâne statică și colorată.
});
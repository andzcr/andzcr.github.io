const PROJECTS_DATA = {
  'ui-ux-design': [
    {
      id: 1,
      name: 'CORELLE | Nail Brand Template',
      description: 'Personal template for the CORELLE brand, category: nail products. It is a fully responsive website, optimized for both mobile and desktop. It includes systems such as Register, Login, Reviews, Favourites, History, and an Order System.',
      features: ['Advanced User Registration System', 'Interactive Review & Rating System', 'Real-time Chat Functionality', 'Payment Integration System', 'Advanced Analytics Dashboard'],
      images: [
        'https://andzcr.github.io/resources/projects/corelle/home_land.mp4',
        'https://res.cloudinary.com/df9syoltz/video/upload/v1764524717/1130_1_2_ptidlk.mp4',
        'https://andzcr.github.io/resources/projects/corelle/poza3.png',
        'https://andzcr.github.io/resources/projects/corelle/poza4.png',
        'https://andzcr.github.io/resources/projects/corelle/poza5.png',
        'https://andzcr.github.io/resources/projects/corelle/poza6.png',
        'https://andzcr.github.io/resources/projects/corelle/poza7.png',
        'https://andzcr.github.io/resources/projects/corelle/poza8.png',
        'https://andzcr.github.io/resources/projects/corelle/poza9.png',
        'https://andzcr.github.io/resources/projects/corelle/poza10.png',
        'https://andzcr.github.io/resources/projects/corelle/poza11.png'
      ],
      thumbnail: 'https://andzcr.github.io/resources/projects/corelle/home_land.mp4',
      isVideoThumbnail: true
    },
    {
      id: 2,
      name: 'Website Template 2',
      description: 'A modern portfolio website showcasing creative work with smooth animations and interactive elements to engage visitors.',
      features: ['Smooth Scroll Animations', 'Interactive Gallery', 'Contact Form with Validation', 'Responsive Design', 'SEO Optimization'],
      images: Array(3).fill('https://andzcr.github.io/assets/photos/altele/project_one.jpg'),
      thumbnail: 'https://andzcr.github.io/assets/photos/altele/project_one.jpg',
      isVideoThumbnail: false
    },
    {
      id: 3,
      name: 'Website Template 3',
      description: 'A comprehensive business dashboard with real-time data visualization and reporting tools for informed decision-making.',
      features: ['Real-time Data Visualization', 'Custom Reporting Tools', 'User Management System', 'Data Export Functionality', 'Multi-level Access Control'],
      images: Array(3).fill('https://andzcr.github.io/assets/photos/altele/project_two.jpg'),
      thumbnail: 'https://andzcr.github.io/assets/photos/altele/project_two.jpg',
      isVideoThumbnail: false
    },
    {
      id: 4,
      name: 'Website Template 4',
      description: 'A user-friendly mobile banking application with intuitive navigation and secure transaction features.',
      features: ['Intuitive Navigation Design', 'Secure Transaction Flow', 'Biometric Authentication', 'Personalized Dashboard', 'Bill Payment System'],
      images: Array(3).fill('https://andzcr.github.io/assets/photos/altele/project_three.jpg'),
      thumbnail: 'https://andzcr.github.io/assets/photos/altele/project_three.jpg',
      isVideoThumbnail: false
    },
    {
      id: 5,
      name: 'Website Template 5',
      description: 'A comprehensive fitness tracking application with personalized workout plans and progress monitoring features.',
      features: ['Personalized Workout Plans', 'Progress Tracking Dashboard', 'Social Sharing Features', 'Nutrition Tracking', 'Goal Setting System'],
      images: Array(3).fill('https://andzcr.github.io/assets/photos/altele/project_four.jpg'),
      thumbnail: 'https://andzcr.github.io/assets/photos/altele/project_four.jpg',
      isVideoThumbnail: false
    },
    {
      id: 6,
      name: 'Website Template 6',
      description: 'An intuitive travel booking platform with seamless booking flow and personalized recommendations for travelers.',
      features: ['Seamless Booking Flow', 'Personalized Recommendations', 'Interactive Maps Integration', 'Review & Rating System', 'Multi-language Support'],
      images: Array(3).fill('https://andzcr.github.io/assets/photos/altele/project_five.jpg'),
      thumbnail: 'https://andzcr.github.io/assets/photos/altele/project_five.jpg',
      isVideoThumbnail: false
    }
  ]
};

class ProjectManager {
  constructor() {
    this.dom = {
      section: document.getElementById('projects'),
      gallery: document.querySelector('.projects-gallery'),
      modal: document.querySelector('.project-modal'),
      modalContent: document.querySelector('.modal-content'),
      slidesContainer: document.querySelector('.gallery-slides'),
      related: document.querySelector('.related-projects'),
      details: {
        title: document.querySelector('.modal-title'),
        name: document.querySelector('.project-name'),
        desc: document.querySelector('.project-description p'),
        features: document.querySelector('.key-features')
      },
      btns: {
        cats: document.querySelectorAll('.category-btn'),
        close: document.querySelector('.back-btn'),
        contact: document.querySelector('.contact-btn'),
        prev: document.querySelector('.prev-btn'),
        next: document.querySelector('.next-btn')
      }
    };

    this.state = {
      category: 'ui-ux-design',
      idx: 0,
      slideIdx: 0,
      modalOpen: false,
      animating: false,
      typingTimeouts: [],
      videoElements: new Map(),
      isProjectActive: true,
      galleryVideoObserver: null,
      isChanging: false
    };

    this.resourceCache = new Map();

    if (!this.dom.section) return;
    this.init();
    
    this.setupVisibilityListener();
    this.setupGalleryVideoObserver();
    this.setupButtonGlowEffect();

    setTimeout(() => this.preloadCategoryResources(), 1000);
  }

  init() {
    this.renderGallery();
    this.setupInteractions();
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      this.state.isProjectActive = !document.hidden;
      this.handleVideoPlayback();
    });
  }

  setupGalleryVideoObserver() {
    this.state.galleryVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && this.state.isProjectActive) {
          video.play().catch(e => console.log('Gallery video autoplay prevented:', e));
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    const galleryVideos = this.dom.gallery.querySelectorAll('video');
    galleryVideos.forEach(video => {
      this.state.galleryVideoObserver.observe(video);
    });
  }

  setupButtonGlowEffect() {
    const buttons = document.querySelectorAll('.view-more');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        button.style.setProperty('--x', `${x}px`);
        button.style.setProperty('--y', `${y}px`);
      });

      button.addEventListener('mouseleave', () => {
        button.style.setProperty('--x', '50%');
        button.style.setProperty('--y', '50%');
      });
    });
  }

  preloadCategoryResources() {
    const projects = this.getProjects();
    projects.slice(0, 3).forEach(project => {
      if (project.thumbnail.endsWith('.mp4')) {
        if (!this.resourceCache.has(project.thumbnail)) {
          const video = document.createElement('video');
          video.src = project.thumbnail;
          video.preload = 'metadata';
          this.resourceCache.set(project.thumbnail, video);
        }
      } else {
        if (!this.resourceCache.has(project.thumbnail)) {
          const img = new Image();
          img.src = project.thumbnail;
          this.resourceCache.set(project.thumbnail, img);
        }
      }
      
      project.images.slice(0, 2).forEach(media => {
        if (!this.resourceCache.has(media)) {
          if (media.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = media;
            video.preload = 'metadata';
            this.resourceCache.set(media, video);
          } else {
            const img = new Image();
            img.src = media;
            this.resourceCache.set(media, img);
          }
        }
      });
    });
  }

  preloadProjectResources(project) {
    project.images.slice(0, 2).forEach(media => {
      if (!this.resourceCache.has(media)) {
        if (media.endsWith('.mp4')) {
          const video = document.createElement('video');
          video.src = media;
          video.preload = 'metadata';
          this.resourceCache.set(media, video);
        } else {
          const img = new Image();
          img.src = media;
          this.resourceCache.set(media, img);
        }
      }
    });
  }

  handleVideoPlayback() {
    const videos = Array.from(this.dom.modal.querySelectorAll('video'));
    
    videos.forEach(video => {
      if (this.state.isProjectActive && this.state.modalOpen) {
        const parentSlide = video.closest('.gallery-slide');
        if (parentSlide && parentSlide.classList.contains('active')) {
          video.play().catch(e => console.log('Autoplay prevented:', e));
        }
      } else {
        video.pause();
      }
    });

    const galleryVideos = Array.from(this.dom.gallery.querySelectorAll('video'));
    galleryVideos.forEach(video => {
      if (this.state.isProjectActive) {
        const parentSlide = video.closest('.project-slide');
        if (parentSlide && parentSlide.classList.contains('active')) {
          video.play().catch(e => console.log('Gallery video autoplay prevented:', e));
        }
      } else {
        video.pause();
      }
    });
  }

  getProjects() {
    return PROJECTS_DATA[this.state.category] || [];
  }

  renderGallery() {
    const projects = this.getProjects();
    this.dom.gallery.innerHTML = projects.map((p, i) => {
      if (p.thumbnail.endsWith('.mp4')) {
        return `
          <div class="project-slide ${this.getSlideClass(i)}" data-id="${p.id}" data-index="${i}">
            <video class="project-thumbnail video-thumbnail" muted loop playsinline preload="metadata">
              <source src="${p.thumbnail}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <div class="project-overlay">
              <a href="#" class="view-more" data-id="${p.id}">VIEW MORE DETAILS</a>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="project-slide ${this.getSlideClass(i)}" data-id="${p.id}" data-index="${i}">
            <img src="${p.thumbnail}" alt="${p.name}" class="project-thumbnail" loading="lazy">
            <div class="project-overlay">
              <a href="#" class="view-more" data-id="${p.id}">VIEW MORE DETAILS</a>
            </div>
          </div>
        `;
      }
    }).join('');

    setTimeout(() => {
      const newGalleryVideos = this.dom.gallery.querySelectorAll('video');
      newGalleryVideos.forEach(video => {
        if (this.state.galleryVideoObserver) {
          this.state.galleryVideoObserver.observe(video);
        }
      });
      
      this.setupButtonGlowEffect();
    }, 50);
  }

  getSlideClass(idx) {
    const total = this.getProjects().length;
    const current = this.state.idx;
    const diff = (idx - current + total) % total;

    if (diff === 0) return 'active';
    if (diff === 1) return 'next';
    if (diff === total - 1) return 'prev';
    if (diff === 2) return 'far-next';
    if (diff === total - 2) return 'far-prev';
    return 'hidden';
  }

  updateGalleryClasses() {
    const slides = Array.from(this.dom.gallery.children);
    slides.forEach((slide, i) => {
      slide.className = `project-slide ${this.getSlideClass(i)}`;
    });
  }

  moveGallery(dir) {
    if (this.state.isChanging) return;
    
    this.state.isChanging = true;
    const total = this.getProjects().length;
    this.state.idx = (this.state.idx + (dir === 'next' ? 1 : -1) + total) % total;
    
    this.dom.gallery.classList.add('quick-transition');
    this.updateGalleryClasses();
    
    setTimeout(() => {
      this.dom.gallery.classList.remove('quick-transition');
      this.state.isChanging = false;
    }, 300);
  }

  openModal(id) {
    const project = this.getProjects().find(p => p.id === id);
    if (!project) return;

    this.state.modalOpen = true;
    document.documentElement.classList.add('modal-open');
    this.dom.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.updateModalContent(project);
    
    requestAnimationFrame(() => {
      this.dom.modalContent.scrollTop = 0;
      this.animateText();
    });
  }

  closeModal() {
    const videos = Array.from(this.dom.modal.querySelectorAll('video'));
    videos.forEach(video => {
      video.pause();
      video.currentTime = 0;
    });

    this.state.modalOpen = false;
    this.dom.modal.classList.add('closing');
    this.clearTyping();
    
    setTimeout(() => {
      this.dom.modal.classList.remove('active', 'closing');
      document.body.style.overflow = '';
      document.documentElement.classList.remove('modal-open');
    }, 400);
  }

  updateModalContent(project) {
    this.dom.details.title.textContent = 'UI/UX Design Projects';
    this.dom.details.name.textContent = project.name;
    this.dom.details.desc.textContent = project.description;
    
    this.dom.details.features.innerHTML = project.features.map(f => `
      <li><ion-icon name="checkmark-circle"></ion-icon><span class="feature-text">${f}</span></li>
    `).join('');

    this.renderModalSlides(project.images);
    this.renderRelated(project.id);
  }

  renderModalSlides(images) {
    images.slice(0, 2).forEach(media => {
      if (!this.resourceCache.has(media)) {
        if (media.endsWith('.mp4')) {
          const preloadVideo = document.createElement('video');
          preloadVideo.src = media;
          preloadVideo.preload = 'metadata';
          this.resourceCache.set(media, preloadVideo);
        } else {
          const preloadImg = new Image();
          preloadImg.src = media;
          this.resourceCache.set(media, preloadImg);
        }
      }
    });

    this.dom.slidesContainer.innerHTML = images.map((media, i) => {
      if (media.endsWith('.mp4')) {
        return `
          <div class="gallery-slide ${i === 0 ? 'active' : ''}">
            <div class="video-container">
              <video class="gallery-video" muted loop playsinline preload="${i === 0 ? 'auto' : 'metadata'}">
                <source src="${media}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="gallery-slide ${i === 0 ? 'active' : ''}">
            <img src="${media}" alt="Slide ${i}" class="gallery-image" loading="${i === 0 ? 'eager' : 'lazy'}">
          </div>
        `;
      }
    }).join('');
    
    this.state.slideIdx = 0;
    setTimeout(() => this.initializeVideos(), 50);
  }

  initializeVideos() {
    const videos = Array.from(this.dom.slidesContainer.querySelectorAll('video'));
    
    const activeSlide = this.dom.slidesContainer.querySelector('.gallery-slide.active');
    if (activeSlide) {
      const activeVideo = activeSlide.querySelector('video');
      if (activeVideo && this.state.isProjectActive) {
        setTimeout(() => {
          activeVideo.play().catch(e => {
            console.log('Autoplay prevented for active video:', e);
            if (e.name === 'NotAllowedError') {
              activeVideo.controls = true;
            }
          });
        }, 100);
      }
    }
    
    videos.forEach((video, index) => {
      const parentSlide = video.closest('.gallery-slide');
      
      if (parentSlide.classList.contains('active')) {
        video.preload = 'auto';
      } else {
        video.preload = 'metadata';
        video.load();
      }
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.state.isProjectActive && this.state.modalOpen) {
            video.play().catch(e => {
              console.log('Autoplay prevented for video:', e);
            });
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(parentSlide);
      this.state.videoElements.set(video, observer);
    });
  }

  changeModalSlide(dir) {
    const slides = this.dom.slidesContainer.children;
    if (!slides.length) return;

    const currentSlide = slides[this.state.slideIdx];
    const currentVideo = currentSlide.querySelector('video');
    if (currentVideo) {
      currentVideo.pause();
    }

    slides[this.state.slideIdx].classList.remove('active');
    this.state.slideIdx = (this.state.slideIdx + (dir === 'next' ? 1 : -1) + slides.length) % slides.length;
    slides[this.state.slideIdx].classList.add('active');

    const newSlide = slides[this.state.slideIdx];
    const newVideo = newSlide.querySelector('video');
    if (newVideo && this.state.isProjectActive) {
      newVideo.play().catch(e => console.log('Autoplay prevented when changing slide:', e));
    }
  }

  renderRelated(currentId) {
    const all = this.getProjects();
    const currentIdx = all.findIndex(p => p.id === currentId);
    const related = [1, 2].map(offset => all[(currentIdx + offset) % all.length]);

    this.dom.related.innerHTML = related.map(p => {
      if (p.thumbnail.endsWith('.mp4')) {
        return `
          <div class="related-project" data-id="${p.id}">
            <video class="related-image video-thumbnail" muted loop playsinline preload="metadata">
              <source src="${p.thumbnail}" type="video/mp4">
            </video>
            <div class="related-overlay"><h4 class="related-title">${p.name}</h4></div>
          </div>
        `;
      } else {
        return `
          <div class="related-project" data-id="${p.id}">
            <img src="${p.thumbnail}" alt="${p.name}" class="related-image" loading="lazy">
            <div class="related-overlay"><h4 class="related-title">${p.name}</h4></div>
          </div>
        `;
      }
    }).join('');
  }

  animateText() {
    const elements = [
      this.dom.details.name, 
      this.dom.details.desc, 
      ...this.dom.details.features.children
    ];

    elements.forEach(el => el.classList.remove('typing'));
    
    let delay = 200;
    elements.forEach(el => {
      const timeout = setTimeout(() => {
        el.classList.add('typing');
        const textSpan = el.querySelector('.feature-text');
        if (textSpan) textSpan.classList.add('typing');
      }, delay);
      
      this.state.typingTimeouts.push(timeout);
      delay += 100;
    });
  }

  clearTyping() {
    this.state.typingTimeouts.forEach(t => clearTimeout(t));
    this.state.typingTimeouts = [];
    
    this.state.videoElements.forEach((observer, video) => {
      observer.unobserve(video);
      video.pause();
    });
    this.state.videoElements.clear();
  }

  handleCategory(btn) {
    this.dom.btns.cats.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.state.category = btn.dataset.category;
    this.state.idx = 0;
    this.renderGallery();
    this.preloadCategoryResources();
  }

  setupInteractions() {
    this.dom.gallery.addEventListener('click', (e) => {
      e.preventDefault();
      
      const slide = e.target.closest('.project-slide');
      if (!slide) return;
      
      const idx = parseInt(slide.dataset.index);
      const isViewBtn = e.target.closest('.view-more');
      
      if (isViewBtn) {
        this.openModal(parseInt(slide.dataset.id));
        return;
      }
      
      if (idx === this.state.idx) {
        this.openModal(parseInt(slide.dataset.id));
        return;
      }
      
      if (this.state.isChanging) return;
      
      this.state.isChanging = true;
      
      this.dom.gallery.classList.add('quick-change');
      
      setTimeout(() => {
        this.state.idx = idx;
        this.updateGalleryClasses();
        
        setTimeout(() => {
          this.dom.gallery.classList.remove('quick-change');
          this.state.isChanging = false;
        }, 300);
      }, 10);
    });

    this.dom.btns.cats.forEach(btn => 
      btn.addEventListener('click', () => this.handleCategory(btn))
    );

    this.dom.btns.close.addEventListener('click', () => this.closeModal());
    this.dom.btns.prev.addEventListener('click', () => this.changeModalSlide('prev'));
    this.dom.btns.next.addEventListener('click', () => this.changeModalSlide('next'));

    this.dom.related.addEventListener('click', (e) => {
      const item = e.target.closest('.related-project');
      if (!item) return;
      
      const projectId = parseInt(item.dataset.id);
      const newProject = this.getProjects().find(p => p.id === projectId);
      
      if (!newProject) return;
      
      this.preloadProjectResources(newProject);
      
      this.dom.modalContent.style.opacity = '0.6';
      this.dom.modalContent.classList.add('changing');
      
      setTimeout(() => {
        this.updateModalContent(newProject);
        
        requestAnimationFrame(() => {
          this.dom.modalContent.scrollTop = 0;
          this.animateText();
          
          setTimeout(() => {
            this.dom.modalContent.style.opacity = '1';
            this.dom.modalContent.classList.remove('changing');
          }, 50);
        });
      }, 150);
    });

    this.dom.btns.contact.addEventListener('click', () => {
      this.closeModal();
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.addEventListener('keydown', (e) => {
      if (this.state.modalOpen) {
        if (e.key === 'Escape') this.closeModal();
        if (e.key === 'ArrowLeft') this.changeModalSlide('prev');
        if (e.key === 'ArrowRight') this.changeModalSlide('next');
      } else {
        if (e.key === 'ArrowLeft') this.moveGallery('prev');
        if (e.key === 'ArrowRight') this.moveGallery('next');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ProjectManager());

const projectsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, { threshold: 0.2 });

const projectsContainer = document.querySelector('.projects-container');
if (projectsContainer) {
  projectsObserver.observe(projectsContainer);
}
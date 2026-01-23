class ReviewsSystem {
  constructor() {
    this.db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
    
    this.state = {
      rating: 3,
      reviews: [],
      isDragging: false,
      config: {
        messages: {
          1: { text: "Poor - I'm sorry to hear that", color: "#ff6b6b", cls: "glow-poor" },
          2: { text: "Fair - I appreciate your feedback", color: "#ffa726", cls: "glow-fair" },
          3: { text: "Good - Glad you had a decent experience", color: "#ffc107", cls: "glow-good" },
          4: { text: "Very Good - Happy to meet your expectations", color: "#66bb6a", cls: "glow-very-good" },
          5: { text: "Excellent - Thrilled to exceed your expectations!", color: "#4CAF50", cls: "glow-excellent" }
        },
        icons: {
          'Web Development': 'code-slash-outline',
          'Brand Design': 'color-palette-outline',
          'Video Editing': 'videocam-outline'
        }
      }
    };

    this.dom = {};
    this.init();
  }

  init() {
    if (!document.getElementById('reviews')) return;
    
    this.cacheDOM();
    this.bindEvents();
    this.initSlider();
    this.loadData();
    this.setupObserver();
    this.updatePreview();
    this.setupButtonGlowEffect();
  }

  cacheDOM() {
    this.dom = {
      section: document.getElementById('reviews'),
      columns: [
        document.querySelector('.column-1'),
        document.querySelector('.column-2'),
        document.querySelector('.column-3')
      ],
      stats: {
        avg: document.getElementById('avg-rating-value'),
        fill: document.getElementById('rating-fill'),
        total: document.getElementById('total-votes')
      },
      form: {
        modal: document.getElementById('review-form'),
        el: document.getElementById('reviewForm'),
        openBtn: document.getElementById('open-form-btn'),
        closeBtn: document.getElementById('back-btn'),
        submitBtn: document.getElementById('submit-form-btn'),
        layout: document.querySelector('.form-layout'),
        charCount: document.querySelector('.char-count'),
        inputs: {
          name: document.getElementById('fullName'),
          msg: document.getElementById('message'),
          gender: document.querySelectorAll('input[name="gender"]'),
          service: document.querySelectorAll('input[name="service"]')
        }
      },
      slider: {
        input: document.getElementById('rating-slider'),
        fill: document.getElementById('slider-fill'),
        thumb: document.querySelector('.slider-thumb'),
        feedback: document.getElementById('rating-feedback')
      },
      preview: {
        container: document.getElementById('live-preview'),
        name: document.getElementById('preview-name'),
        initials: document.getElementById('preview-initials'),
        avatar: document.getElementById('preview-avatar'),
        msg: document.getElementById('preview-message'),
        rating: document.getElementById('preview-rating'),
        service: document.getElementById('preview-service')
      },
      notif: document.getElementById('notification'),
      animatables: {
        content: document.querySelector('.reviews-content'),
        left: document.querySelector('.reviews-left'),
        right: document.querySelector('.reviews-right'),
        title: document.querySelector('.reviews-title'),
        sub: document.querySelector('.reviews-subtitle'),
        stats: document.querySelector('.stats-container'),
        btn: document.querySelector('.submit-review-btn')
      }
    };
  }

  setupButtonGlowEffect() {
    const submitReviewBtn = document.querySelector('.submit-review-btn');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('mousemove', (e) => {
        const rect = submitReviewBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        submitReviewBtn.style.setProperty('--x', `${x}px`);
        submitReviewBtn.style.setProperty('--y', `${y}px`);
      });

      submitReviewBtn.addEventListener('mouseleave', () => {
        submitReviewBtn.style.setProperty('--x', '50%');
        submitReviewBtn.style.setProperty('--y', '50%');
      });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('mousemove', (e) => {
        const rect = backBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        backBtn.style.setProperty('--x', `${x}px`);
        backBtn.style.setProperty('--y', `${y}px`);
      });

      backBtn.addEventListener('mouseleave', () => {
        backBtn.style.setProperty('--x', '50%');
        backBtn.style.setProperty('--y', '50%');
      });
    }

    const submitFormBtn = document.getElementById('submit-form-btn');
    if (submitFormBtn) {
      submitFormBtn.addEventListener('mousemove', (e) => {
        const rect = submitFormBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        submitFormBtn.style.setProperty('--x', `${x}px`);
        submitFormBtn.style.setProperty('--y', `${y}px`);
      });

      submitFormBtn.addEventListener('mouseleave', () => {
        submitFormBtn.style.setProperty('--x', '50%');
        submitFormBtn.style.setProperty('--y', '50%');
      });
    }
  }

  bindEvents() {
    this.dom.form.openBtn?.addEventListener('click', () => this.toggleForm(true));
    this.dom.form.closeBtn?.addEventListener('click', () => this.toggleForm(false));
    this.dom.form.submitBtn?.addEventListener('click', () => this.submit());
    
    this.dom.form.el?.addEventListener('submit', (e) => e.preventDefault());
    this.dom.form.el?.addEventListener('input', () => this.handleInput());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dom.form.modal?.classList.contains('active')) this.toggleForm(false);
    });

    this.dom.slider.input?.addEventListener('input', (e) => {
      this.state.rating = parseInt(e.target.value);
      this.updateSliderUI();
      this.updatePreview();
      this.handleInput(); 
    });
  }

  initSlider() {
    if (!this.dom.slider.thumb) return;

    this.updateSliderUI();

    const handleDrag = (e) => {
      if (!this.state.isDragging) return;
      const rect = document.querySelector('.slider-wrapper').getBoundingClientRect();
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      
      this.state.rating = Math.round(pct * 4) + 1;
      this.dom.slider.input.value = this.state.rating;
      this.updateSliderUI();
      this.updatePreview();
    };

    const startDrag = () => {
      this.state.isDragging = true;
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    };

    const stopDrag = () => {
      this.state.isDragging = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    this.dom.slider.thumb.addEventListener('mousedown', startDrag);
    this.dom.slider.thumb.addEventListener('touchstart', startDrag);
  }

  updateSliderUI() {
    const pct = ((this.state.rating - 1) / 4) * 100;
    if (this.dom.slider.fill) this.dom.slider.fill.style.width = `${pct}%`;
    if (this.dom.slider.thumb) this.dom.slider.thumb.style.left = `${pct}%`;
    
    const meta = this.state.config.messages[this.state.rating];
    if (this.dom.slider.feedback) {
      this.dom.slider.feedback.textContent = meta.text;
      this.dom.slider.feedback.style.borderColor = `${meta.color}40`;
    }
  }

  handleInput() {
    const fd = new FormData(this.dom.form.el);
    const hasContent = fd.get('fullName') || fd.get('message') || fd.get('gender') || fd.get('service');
    
    this.dom.form.layout?.classList.toggle('has-content', !!hasContent);
    this.updateCharCount();
    this.updatePreview();
  }

  updateCharCount() {
    const len = this.dom.form.inputs.msg.value.length;
    if (this.dom.form.charCount) {
      this.dom.form.charCount.textContent = `${len}/50`;
      this.dom.form.charCount.style.color = len >= 45 ? '#ff6b6b' : (len >= 40 ? '#ffc107' : 'rgba(255,255,255,0.7)');
    }
  }

  updatePreview() {
    if (!this.dom.preview.container) return;

    const fd = new FormData(this.dom.form.el);
    const name = fd.get('fullName')?.trim() || 'Your Name';
    const msg = fd.get('message')?.trim() || 'Your message will appear here...';
    const gender = fd.get('gender');
    const service = fd.get('service');

    if(this.dom.preview.name) this.dom.preview.name.textContent = name;
    if(this.dom.preview.msg) this.dom.preview.msg.textContent = msg;
    if(this.dom.preview.service) this.dom.preview.service.textContent = service || 'Service';

    if (this.dom.preview.initials) {
      const parts = name.split(' ');
      this.dom.preview.initials.textContent = parts.length >= 2 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
        : name[0].toUpperCase();
    }

    if (this.dom.preview.avatar) {
      this.dom.preview.avatar.className = `preview-avatar ${gender || ''}`;
    }

    if (this.dom.preview.rating) {
      this.dom.preview.rating.innerHTML = Array(5).fill(0).map((_, i) => 
        `<ion-icon name="${i < this.state.rating ? 'star' : 'star-outline'}" class="star"></ion-icon>`
      ).join('');
    }

    this.dom.preview.container.className = `live-preview-card ${this.state.config.messages[this.state.rating].cls}`;
  }

  toggleForm(show) {
    this.dom.form.modal?.classList.toggle('active', show);
    document.body.style.overflow = show ? 'hidden' : '';
    if (!show) this.resetForm();
  }

  resetForm() {
    this.dom.form.el.reset();
    this.state.rating = 3;
    this.updateSliderUI();
    this.handleInput();
  }

  async submit() {
    const fd = new FormData(this.dom.form.el);
    const data = {
      fullName: fd.get('fullName')?.trim(),
      message: fd.get('message')?.trim(),
      gender: fd.get('gender'),
      service: fd.get('service'),
      rating: this.state.rating,
      timestamp: this.db ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
    };

    if (!data.fullName || !data.message || !data.gender || !data.service) {
      this.showError(data.fullName ? 'message' : 'fullName', 'Please complete all fields');
      return;
    }

    if (this.dom.form.submitBtn) {
      const originalHTML = this.dom.form.submitBtn.innerHTML;
      this.dom.form.submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Sending...</span>';
      this.dom.form.submitBtn.disabled = true;

      try {
        if (this.db) {
          await this.db.collection('reviews').add(data);
        } else {
          console.warn('Firebase unavailable, simulating submit');
          await new Promise(r => setTimeout(r, 1000));
        }
        
        this.toggleForm(false);
        this.showNotification();
        this.loadData();
      } catch (err) {
        console.error(err);
        alert('Error submitting review');
      } finally {
        this.dom.form.submitBtn.innerHTML = originalHTML;
        this.dom.form.submitBtn.disabled = false;
      }
    }
  }

  showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return alert(msg);
    field.style.borderColor = '#ff6b6b';
    setTimeout(() => field.style.borderColor = '', 3000);
  }

  showNotification() {
    if (!this.dom.notif) return;
    const color = this.state.config.messages[this.state.rating].color;
    this.dom.notif.style.background = `linear-gradient(to bottom, ${color}20, transparent)`;
    this.dom.notif.classList.add('active');
    setTimeout(() => this.dom.notif.classList.remove('active'), 3000);
  }

  async loadData() {
    if (!this.dom.columns[0]) return;
    
    let reviews = [];
    try {
      if (this.db) {
        const snap = await this.db.collection('reviews').orderBy('timestamp', 'desc').limit(15).get();
        reviews = snap.docs.map(d => d.data());
      }
    } catch (e) { console.error(e); }

    if (!reviews.length) reviews = this.getSampleReviews();
    
    this.dom.columns.forEach(c => c.innerHTML = '');
    reviews.forEach((r, i) => {
      if (this.dom.columns[i % 3]) this.dom.columns[i % 3].appendChild(this.createCard(r));
    });

    this.updateStats(reviews);
  }

  createCard(data) {
    const card = document.createElement('div');
    card.className = 'review-card';
    const name = data.fullName || 'Anonymous';
    const icon = this.state.config.icons[data.service] || 'help-outline';
    const initials = name.split(' ').length >= 2 
      ? (name.split(' ')[0][0] + name.split(' ').pop()[0]).toUpperCase() 
      : name[0].toUpperCase();

    card.innerHTML = `
      <div class="review-header">
        <div class="review-avatar ${data.gender || ''}">${initials}</div>
        <div class="reviewer-name">${name}</div>
        <div class="review-quote">"</div>
        <div class="review-text">${data.message}</div>
      </div>
      <div class="review-footer">
        <div class="review-rating">
          <span class="rating-value">${data.rating}</span>
          <ion-icon name="star" class="star-icon"></ion-icon>
        </div>
        <ion-icon name="${icon}" class="review-service-icon"></ion-icon>
      </div>
    `;
    return card;
  }

  getSampleReviews() {
    return [];
  }

  updateStats(reviews) {
    if (!reviews.length) return;
    const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
    
    if (this.dom.stats.avg) this.animateValue(this.dom.stats.avg, 0, avg, 2000);
    if (this.dom.stats.total) this.dom.stats.total.textContent = `${reviews.length} reviews in total`;
    if (this.dom.stats.fill) setTimeout(() => this.dom.stats.fill.style.width = `${(avg / 5) * 100}%`, 300);
  }

  animateValue(obj, start, end, duration) {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      obj.textContent = (progress * (end - start) + start).toFixed(2);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  setupObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const els = this.dom.animatables;
          Object.values(els).forEach(el => el?.classList.add('visible'));
        } else {
           const els = this.dom.animatables;
           Object.values(els).forEach(el => el?.classList.remove('visible'));
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    
    if (this.dom.section) observer.observe(this.dom.section);
  }
}

document.addEventListener('DOMContentLoaded', () => new ReviewsSystem());
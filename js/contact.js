class ContactManager {
  constructor() {
    this.db = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
    this.firebase = window.firebase;
    
    this.dom = {
      form: document.getElementById('contact-form'),
      firstNameInput: document.getElementById('firstName'),
      lastNameInput: document.getElementById('lastName'),
      emailInput: document.getElementById('email'),
      phoneInput: document.getElementById('phone'),
      phoneDropdown: document.querySelector('.phone-dropdown-wrapper'),
      dropdownTrigger: document.querySelector('.phone-dropdown-trigger'),
      countriesList: document.querySelector('.countries-list'),
      searchInput: document.querySelector('.search-input'),
      selectedFlag: document.querySelector('.country-flag img'),
      selectedCode: document.querySelector('.country-code'),
      phoneLengthInfo: document.querySelector('.phone-length-info'),
      messageCounter: document.querySelector('.message-counter'),
      messageTextarea: document.querySelector('#message'),
      submitBtn: document.querySelector('.submit-btn')
    };

    this.countryConfigs = {
      'RO': { 
        name: 'Romania', 
        dialCode: '+40', 
        maxDigits: 9,
        example: '748 594 335',
        format: (digits) => {
          if (digits.length <= 3) return digits;
          if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
          return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        },
        validate: (digits) => {
          return digits.length === 9 && digits[0] !== '0';
        }
      },
      'US': { 
        name: 'United States', 
        dialCode: '+1', 
        maxDigits: 10, 
        example: '123 456 7890',
        format: (digits) => {
          if (digits.length <= 3) return digits;
          if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        },
        validate: (digits) => digits.length === 10
      },
      'GB': { 
        name: 'United Kingdom', 
        dialCode: '+44', 
        maxDigits: 10, 
        example: '20 7946 0958',
        format: (digits) => {
          if (digits.length <= 2) return digits;
          if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
          return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
        },
        validate: (digits) => digits.length === 10
      },
      'DE': { 
        name: 'Germany', 
        dialCode: '+49', 
        maxDigits: 10,
        example: '151 1234567',
        format: (digits) => {
          if (digits.length <= 3) return digits;
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        },
        validate: (digits) => {
          return digits.length === 10 && digits[0] !== '0';
        }
      },
      'FR': { 
        name: 'France', 
        dialCode: '+33', 
        maxDigits: 9, 
        example: '1 23 45 67 89',
        format: (digits) => {
          let formatted = '';
          for (let i = 0; i < digits.length; i++) {
            if (i === 1 || i === 3 || i === 5 || i === 7) formatted += ' ';
            formatted += digits[i];
          }
          return formatted;
        },
        validate: (digits) => digits.length === 9
      },
      'IT': { 
        name: 'Italy', 
        dialCode: '+39', 
        maxDigits: 10, 
        example: '312 345 6789',
        format: (digits) => {
          if (digits.length <= 3) return digits;
          if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
          return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        },
        validate: (digits) => digits.length === 10
      }
    };

    this.countries = Object.keys(this.countryConfigs).map(code => ({
      code,
      name: this.countryConfigs[code].name,
      dialCode: this.countryConfigs[code].dialCode,
      maxDigits: this.countryConfigs[code].maxDigits
    }));

    this.selectedCountry = this.countries[0];
    this.isDropdownOpen = false;
    this.touchedFields = new Set();

    if (this.dom.form) this.init();
  }

  init() {
    this.setupForm();
    this.setupPhoneSystem();
    this.setupCheckmarkSystem();
    this.setupDropdown();
    this.setupMessageCounter();
    this.setupNameValidation();
    this.setupEmailValidation();
    this.detectUserCountry();
    this.setupSubmitButtonGlowEffect();
    
    this.updatePhoneInput();
    this.updatePhoneLengthInfo();
    this.updateMessageCounter();
  }

  setupSubmitButtonGlowEffect() {
    if (!this.dom.submitBtn) return;
    
    this.dom.submitBtn.addEventListener('mousemove', (e) => {
      const rect = this.dom.submitBtn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.dom.submitBtn.style.setProperty('--x', `${x}px`);
      this.dom.submitBtn.style.setProperty('--y', `${y}px`);
    });

    this.dom.submitBtn.addEventListener('mouseleave', () => {
      this.dom.submitBtn.style.setProperty('--x', '50%');
      this.dom.submitBtn.style.setProperty('--y', '50%');
    });
  }

  setupMessageCounter() {
    if (!this.dom.messageTextarea || !this.dom.messageCounter) return;
    
    this.updateMessageCounter();
    
    this.dom.messageTextarea.addEventListener('input', (e) => {
      this.updateMessageCounter();
      this.touchedFields.add('message');
      this.handleCheckmarkVisibility(e.target);
    });
    
    this.dom.messageTextarea.addEventListener('paste', (e) => {
      setTimeout(() => {
        this.updateMessageCounter();
        this.touchedFields.add('message');
        this.handleCheckmarkVisibility(e.target);
      }, 0);
    });
    
    this.dom.messageTextarea.addEventListener('blur', (e) => {
      this.markFieldAsTouched(e.target);
      this.handleCheckmarkVisibility(e.target);
    });
  }

  updateMessageCounter() {
    if (!this.dom.messageTextarea || !this.dom.messageCounter) return;
    
    const value = this.dom.messageTextarea.value;
    const length = value.length;
    
    this.dom.messageCounter.textContent = `${length}/5`;
    
    if (length < 5) {
      this.dom.messageCounter.style.color = '#ff6b6b';
    } else {
      this.dom.messageCounter.style.color = '#00ff88';
    }
    
    this.dom.messageCounter.title = `${length} characters (minimum 5 required)`;
  }

  setupNameValidation() {
    [this.dom.firstNameInput, this.dom.lastNameInput].forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value;
        const originalValue = value;
        
        value = value.replace(/[^A-Za-z]/g, '');
        
        if (value.length > 0) {
          value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        
        if (value !== originalValue) {
          e.target.value = value;
          if (originalValue.includes(' ') && value !== originalValue) {
            this.showNameValidationFeedback(e.target, 'Spaces are not allowed in names');
          }
        }
        
        this.handleCheckmarkVisibility(e.target);
      });
      
      input.addEventListener('blur', (e) => {
        this.markFieldAsTouched(e.target);
        this.validateNameField(e.target);
        this.handleCheckmarkVisibility(e.target);
      });
    });
  }

  validateNameField(input) {
    const value = input.value.trim();
    const fieldId = input.id || input.name;
    
    if (!this.touchedFields.has(fieldId) && !value) {
      return false;
    }
    
    if (!value) {
      this.showFieldError(input, '');
      return false;
    }
    
    if (!/^[A-Za-z]+$/.test(value)) {
      this.showFieldError(input, 'Only letters are allowed (no spaces)');
      return false;
    }
    
    if (value.length < 2) {
      this.showFieldError(input, 'Must be at least 2 characters long');
      return false;
    }
    
    if (value.length > 50) {
      this.showFieldError(input, 'Maximum 50 characters allowed');
      return false;
    }
    
    input.classList.remove('input-error');
    const existingErr = input.parentNode.querySelector('.field-error');
    if(existingErr) existingErr.remove();
    
    return true;
  }

  showNameValidationFeedback(input, message) {
    const feedback = document.createElement('div');
    feedback.className = 'name-validation-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: absolute;
      top: -25px;
      left: 0;
      background: rgba(255, 107, 107, 0.9);
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Sora', sans-serif;
      font-size: 0.75rem;
      z-index: 100;
      opacity: 0;
      transform: translateY(5px);
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    
    input.parentNode.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(5px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.remove();
        }
      }, 300);
    }, 2000);
  }

  showFieldError(input, message) {
    input.classList.add('input-error');
    const existingErr = input.parentNode.querySelector('.field-error');
    if(existingErr) existingErr.remove();
    
    const div = document.createElement('div');
    div.className = 'field-error';
    div.textContent = message;
    input.parentNode.appendChild(div);
  }

  setupEmailValidation() {
    if (!this.dom.emailInput) return;
    
    this.dom.emailInput.addEventListener('input', (e) => {
      let value = e.target.value;
      const originalValue = value;
      
      value = value.replace(/[^a-zA-Z0-9._%+\-@]/g, '');
      
      const atCount = (value.match(/@/g) || []).length;
      if (atCount > 1) {
        const firstAt = value.indexOf('@');
        value = value.substring(0, firstAt + 1) + value.substring(firstAt + 1).replace(/@/g, '');
      }
      
      if (value !== originalValue) {
        e.target.value = value;
      }
      
      this.handleCheckmarkVisibility(e.target);
    });
    
    this.dom.emailInput.addEventListener('blur', (e) => {
      this.markFieldAsTouched(e.target);
      this.validateEmailField(e.target);
      this.handleCheckmarkVisibility(e.target);
    });
  }

  validateEmailField(input) {
    const value = input.value.trim();
    const fieldId = input.id || input.name;
    
    if (!this.touchedFields.has(fieldId) && !value) {
      return false;
    }
    
    if (!value) {
      this.showFieldError(input, 'Email is required');
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) {
      this.showFieldError(input, 'Please enter a valid email address');
      return false;
    }
    
    input.classList.remove('input-error');
    const existingErr = input.parentNode.querySelector('.field-error');
    if(existingErr) existingErr.remove();
    
    return true;
  }

  setupDropdown() {
    this.populateCountriesList();
    
    this.dom.dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    this.dom.searchInput.addEventListener('input', (e) => {
      this.filterCountries(e.target.value);
    });
    
    document.addEventListener('click', (e) => {
      if (this.isDropdownOpen && !this.dom.phoneDropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });
    
    this.dom.countriesList.addEventListener('wheel', (e) => {
      e.stopPropagation();
    });
    
    this.dom.dropdownTrigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }

  populateCountriesList(filter = '') {
    if (!this.dom.countriesList) return;
    
    this.dom.countriesList.innerHTML = '';
    
    const filteredCountries = filter ? 
      this.countries.filter(country => 
        country.name.toLowerCase().includes(filter.toLowerCase()) || 
        country.dialCode.includes(filter)
      ) : this.countries;
    
    filteredCountries.forEach(country => {
      const isSelected = country.code === this.selectedCountry.code;
      const countryItem = document.createElement('div');
      countryItem.className = `country-item ${isSelected ? 'selected' : ''}`;
      countryItem.innerHTML = `
        <div class="country-item-flag">
          <img src="https://flagcdn.com/${country.code.toLowerCase()}.svg" alt="${country.name}">
        </div>
        <span class="country-item-name">${country.name}</span>
        <span class="country-item-code">${country.dialCode}</span>
      `;
      
      countryItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const wasValid = this.isPhoneFieldValid();
        this.selectCountry(country);
        
        if (wasValid) {
          this.hideCheckmark(this.dom.phoneInput);
        }
        
        this.closeDropdown();
        setTimeout(() => {
          this.dom.phoneInput.focus();
          const value = this.dom.phoneInput.value;
          const start = this.selectedCountry.dialCode.length + 1;
          this.dom.phoneInput.setSelectionRange(start, value.length);
        }, 50);
      });
      
      this.dom.countriesList.appendChild(countryItem);
    });
  }

  filterCountries(query) {
    this.populateCountriesList(query);
  }

  selectCountry(country) {
    this.selectedCountry = country;
    
    this.dom.selectedFlag.src = `https://flagcdn.com/${country.code.toLowerCase()}.svg`;
    this.dom.selectedFlag.alt = this.countryConfigs[country.code].name;
    
    this.updatePhoneInput();
    this.updatePhoneLengthInfo();
    
    this.handleCheckmarkVisibility(this.dom.phoneInput);
  }

  updatePhoneInput() {
    const currentValue = this.dom.phoneInput.value.trim();
    const config = this.countryConfigs[this.selectedCountry.code];
    const newPrefix = config.dialCode;
    
    if (!currentValue || currentValue === config.dialCode) {
      this.dom.phoneInput.value = newPrefix + ' ';
      return;
    }
    
    let numberWithoutPrefix = currentValue;
    for (const country of this.countries) {
      const countryDialCode = this.countryConfigs[country.code].dialCode;
      if (currentValue.startsWith(countryDialCode)) {
        numberWithoutPrefix = currentValue.substring(countryDialCode.length).trim();
        break;
      }
    }
    
    if (this.selectedCountry.code === 'RO') {
      const cleanNumber = numberWithoutPrefix.replace(/\D/g, '');
      if (cleanNumber.length > 0 && cleanNumber[0] === '0') {
        numberWithoutPrefix = cleanNumber.substring(1);
      }
    }
    
    const cleanNumber = numberWithoutPrefix.replace(/\D/g, '');
    const limitedNumber = cleanNumber.substring(0, config.maxDigits);
    
    const formattedNumber = config.format(limitedNumber);
    
    const newValue = newPrefix + ' ' + formattedNumber;
    this.dom.phoneInput.value = newValue;
    
    setTimeout(() => {
      this.handleCheckmarkVisibility(this.dom.phoneInput);
    }, 0);
  }

  updatePhoneLengthInfo() {
    if (!this.dom.phoneLengthInfo) return;
    
    const config = this.countryConfigs[this.selectedCountry.code];
    this.dom.phoneLengthInfo.textContent = `Max ${config.maxDigits} digits`;
    
    const example = config.example || '123 456 789';
    this.dom.phoneInput.placeholder = `e.g., ${example}`;
  }

  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.isDropdownOpen = true;
    this.dom.phoneDropdown.classList.add('active');
    this.dom.searchInput.value = '';
    this.populateCountriesList();
    
    setTimeout(() => {
      this.dom.searchInput.focus();
    }, 100);
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    this.dom.phoneDropdown.classList.remove('active');
  }

  detectUserCountry() {
    this.selectCountry(this.countries[0]);
  }

  setupPhoneSystem() {
    if (!this.dom.phoneInput) return;

    this.dom.phoneInput.addEventListener('input', (e) => {
      this.formatPhoneNumberWithCountryFormat(e.target);
      this.handleCheckmarkVisibility(e.target);
      this.updatePhoneLengthDisplay();
    });

    this.dom.phoneInput.addEventListener('blur', (e) => {
      this.formatPhoneNumberWithCountryFormat(e.target);
      this.handleCheckmarkVisibility(e.target);
      this.markFieldAsTouched(e.target);
    });

    this.dom.phoneInput.addEventListener('focus', () => {
      const value = this.dom.phoneInput.value;
      const config = this.countryConfigs[this.selectedCountry.code];
      const prefix = config.dialCode;
      
      if (value.startsWith(prefix)) {
        setTimeout(() => {
          const start = prefix.length + 1;
          this.dom.phoneInput.setSelectionRange(start, value.length);
        }, 10);
      }
    });
  }

  formatPhoneNumberWithCountryFormat(input) {
    let value = input.value;
    const config = this.countryConfigs[this.selectedCountry.code];
    const prefix = config.dialCode;
    
    if (!value.startsWith(prefix)) {
      for (const country of this.countries) {
        const countryDialCode = this.countryConfigs[country.code].dialCode;
        if (value.startsWith(countryDialCode)) {
          value = prefix + value.substring(countryDialCode.length);
          break;
        }
      }
    }
    
    const afterPrefix = value.substring(prefix.length);
    let cleanAfter = afterPrefix.replace(/\D/g, '');
    
    if (this.selectedCountry.code === 'RO' && cleanAfter.length > 0 && cleanAfter[0] === '0') {
      cleanAfter = cleanAfter.substring(1);
    }
    
    const limitedAfter = cleanAfter.substring(0, config.maxDigits);
    
    const formatted = config.format(limitedAfter);
    
    input.value = prefix + ' ' + formatted;
  }

  updatePhoneLengthDisplay() {
    if (!this.dom.phoneLengthInfo) return;
    
    const currentValue = this.dom.phoneInput.value;
    const config = this.countryConfigs[this.selectedCountry.code];
    const prefix = config.dialCode;
    const afterPrefix = currentValue.substring(prefix.length);
    let digitCount = afterPrefix.replace(/\D/g, '').length;
    
    if (this.selectedCountry.code === 'RO' && digitCount > 0) {
      const cleanDigits = afterPrefix.replace(/\D/g, '');
      if (cleanDigits[0] === '0') {
        digitCount = cleanDigits.substring(1).length;
      }
    }
    
    const maxDigits = config.maxDigits;
    
    if (digitCount > 0) {
      this.dom.phoneLengthInfo.textContent = `${digitCount}/${maxDigits}`;
      
      if (digitCount > maxDigits) {
        this.dom.phoneLengthInfo.style.color = '#ff6b6b';
      } else if (digitCount === maxDigits) {
        this.dom.phoneLengthInfo.style.color = '#00ff88';
      } else {
        this.dom.phoneLengthInfo.style.color = '#888';
      }
    } else {
      this.dom.phoneLengthInfo.textContent = `Max ${maxDigits} digits`;
      this.dom.phoneLengthInfo.style.color = '#888';
    }
  }

  setupCheckmarkSystem() {
    const inputs = this.dom.form.querySelectorAll('input:not(.search-input), textarea');
    
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.touchedFields.add(input.id || input.name);
      });
      
      input.addEventListener('blur', (e) => {
        this.markFieldAsTouched(e.target);
        this.handleCheckmarkVisibility(e.target);
      });
      
      input.addEventListener('focus', (e) => {
        const checkmark = e.target.parentNode.querySelector('.input-checkmark');
        if (checkmark && checkmark.classList.contains('visible')) {
          checkmark.classList.add('hiding');
          setTimeout(() => {
            checkmark.classList.remove('visible', 'hiding');
          }, 300);
        }
      });
    });
  }

  markFieldAsTouched(field) {
    this.touchedFields.add(field.id || field.name);
  }

  handleCheckmarkVisibility(input) {
    if (this.isFieldValid(input)) {
      this.showCheckmark(input);
    } else {
      this.hideCheckmark(input);
    }
  }

  isPhoneFieldValid() {
    return this.isFieldValid(this.dom.phoneInput);
  }

  isFieldValid(input) {
    const value = input.value.trim();
    
    const fieldId = input.id || input.name;
    if (!this.touchedFields.has(fieldId) && !value) {
      return false;
    }
    
    if (!value) return false;
    
    if (input.type === 'email' || input.id === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value);
    }
    
    if (input.type === 'tel' || input.id === 'phone') {
      const config = this.countryConfigs[this.selectedCountry.code];
      const prefix = config.dialCode;
      
      if (!value.startsWith(prefix)) return false;
      
      const afterPrefix = value.substring(prefix.length);
      let digits = afterPrefix.replace(/\D/g, '');
      
      if (this.selectedCountry.code === 'RO' && digits.length > 0 && digits[0] === '0') {
        digits = digits.substring(1);
      }
      
      if (config.validate) {
        return config.validate(digits);
      }
      
      return digits.length === config.maxDigits;
    }
    
    if (input.id === 'firstName' || input.id === 'lastName') {
      return this.validateNameField(input);
    }
    
    if (input.type === 'textarea' || input.id === 'message') {
      return value.length >= 5;
    }
    
    return value.length > 0;
  }

  showCheckmark(input) {
    const checkmark = input.parentNode.querySelector('.input-checkmark');
    if (checkmark && !checkmark.classList.contains('visible')) {
      checkmark.classList.remove('hiding');
      setTimeout(() => {
        checkmark.classList.add('visible');
      }, 10);
    }
  }

  hideCheckmark(input) {
    const checkmark = input.parentNode.querySelector('.input-checkmark');
    if (checkmark && checkmark.classList.contains('visible')) {
      checkmark.classList.add('hiding');
      setTimeout(() => {
        checkmark.classList.remove('visible', 'hiding');
      }, 300);
    }
  }

  setupForm() {
    this.dom.form.addEventListener('focusout', (e) => {
      if(e.target.hasAttribute('required')) {
        this.markFieldAsTouched(e.target);
        this.handleCheckmarkVisibility(e.target);
      }
    });
    
    this.dom.form.addEventListener('input', (e) => {
      if(e.target.classList.contains('input-error')) {
         e.target.classList.remove('input-error');
         const err = e.target.parentNode.querySelector('.field-error');
         if(err) err.remove();
      }
      this.handleCheckmarkVisibility(e.target);
    });

    this.dom.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.db) {
        this.showNotification('Database unavailable', 'error');
        return;
      }

      this.dom.form.querySelectorAll('[required]').forEach(field => {
        this.touchedFields.add(field.id || field.name);
      });

      const btn = this.dom.form.querySelector('.submit-btn');
      const originalContent = btn.innerHTML;

      if (!this.validateForm()) return;

      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span>';

      try {
        const fd = new FormData(this.dom.form);
        await this.db.collection('contacts').add({
          firstName: fd.get('firstName').trim(),
          lastName: fd.get('lastName').trim(),
          email: fd.get('email').trim(),
          phone: fd.get('phone')?.trim() || '',
          message: fd.get('message').trim(),
          timestamp: this.firebase.firestore.FieldValue.serverTimestamp(),
          read: false
        });

        this.showNotification("Message sent successfully!", 'success');
        this.dom.form.reset();
        this.dom.form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        this.dom.form.querySelectorAll('.input-checkmark').forEach(checkmark => {
          checkmark.classList.remove('visible');
        });
        
        this.touchedFields.clear();
        this.selectCountry(this.countries[0]);
        this.updatePhoneLengthInfo();
        this.updateMessageCounter();
      } catch (err) {
        console.error(err);
        this.showNotification('Error sending message.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    });
  }

  validateForm() {
    let isValid = true;
    
    this.dom.form.querySelectorAll('[required]').forEach(field => {
      if (!this.checkField(field)) isValid = false;
    });
    
    return isValid;
  }

  checkField(field) {
    const val = field.value.trim();
    field.classList.remove('input-error');
    const existingErr = field.parentNode.querySelector('.field-error');
    if(existingErr) existingErr.remove();

    const fieldId = field.id || field.name;
    
    if (!this.touchedFields.has(fieldId) && !val) {
      return false;
    }

    let error = '';
    
    if (!val) {
      error = 'This field is required';
    } else if (field.type === 'email' || field.id === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        error = 'Please enter a valid email address';
      }
    } else if (field.type === 'tel' || field.id === 'phone') {
      const config = this.countryConfigs[this.selectedCountry.code];
      const prefix = config.dialCode;
      
      if (!val.startsWith(prefix)) {
        error = `Phone number must start with ${prefix}`;
      } else {
        const afterPrefix = val.substring(prefix.length);
        let digits = afterPrefix.replace(/\D/g, '');
        
        if (this.selectedCountry.code === 'RO' && digits.length > 0 && digits[0] === '0') {
          digits = digits.substring(1);
        }
        
        if (digits.length !== config.maxDigits) {
          error = `${config.name} phone numbers must have exactly ${config.maxDigits} digits`;
        } else if (config.validate && !config.validate(digits)) {
          error = `Invalid ${config.name} phone number format`;
        }
      }
    } else if (field.id === 'firstName' || field.id === 'lastName') {
      if (!/^[A-Za-z]+$/.test(val)) {
        error = 'Only letters are allowed (no spaces)';
      } else if (val.length < 2) {
        error = 'Must be at least 2 characters long';
      } else if (val.length > 50) {
        error = 'Maximum 50 characters allowed';
      }
    } else if (field.type === 'textarea' || field.id === 'message') {
      if (val.length < 5) {
        error = 'Message must be at least 5 characters long';
      }
    }

    if (error) {
      field.classList.add('input-error');
      const div = document.createElement('div');
      div.className = 'field-error';
      div.textContent = error;
      field.parentNode.appendChild(div);
      this.hideCheckmark(field);
      return false;
    }
    
    if (this.isFieldValid(field)) {
      this.showCheckmark(field);
    }
    
    return true;
  }

  showNotification(msg, type) {
    const notif = document.createElement('div');
    notif.className = `sys-notif ${type}`;
    notif.innerHTML = `<span>${msg}</span><button type="button"><ion-icon name="close-outline"></ion-icon></button>`;
    
    notif.querySelector('button').onclick = () => {
       notif.classList.add('hiding');
       setTimeout(() => notif.remove(), 300);
    };

    document.body.appendChild(notif);
    setTimeout(() => { if(notif.parentNode) notif.querySelector('button').click(); }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => new ContactManager());

const contactObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, { threshold: 0.2 });

const contactContainer = document.querySelector('.contact-container');
if (contactContainer) {
  contactObserver.observe(contactContainer);
}
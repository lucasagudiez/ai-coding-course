const { createApp } = Vue;

// Import Exit Popup Component
const ExitPopupComponent = {
    props: {
        content: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            show: false,
            triggered: false
        };
    },
    template: `
        <div v-if="show" class="exit-intent-modal" @click.self="close">
            <div class="exit-modal-content">
                <button class="exit-modal-close" @click="close" aria-label="Close popup">
                    ×
                </button>
                
                <h2 v-html="content.headline"></h2>
                
                <p class="exit-description" v-html="content.description"></p>
                
                <div class="exit-bullets" v-if="content.bullets && content.bullets.length">
                    <ul>
                        <li v-for="(bullet, index) in content.bullets" :key="index">
                            {{ bullet }}
                        </li>
                    </ul>
                </div>
                
                <button class="exit-cta-btn" @click="close">
                    {{ content.cta }}
                </button>
            </div>
        </div>
    `,
    mounted() {
        if (!sessionStorage.getItem('exitPopupSeen')) {
            document.addEventListener('mouseleave', this.handleMouseLeave);
            
            if (window.innerWidth <= 768) {
                this.inactivityTimer = setTimeout(() => {
                    if (!this.triggered) {
                        this.showPopup();
                    }
                }, 30000);
            }
        }
    },
    beforeUnmount() {
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
    },
    methods: {
        handleMouseLeave(e) {
            if (e.clientY <= 0 && !this.triggered) {
                this.showPopup();
            }
        },
        showPopup() {
            this.show = true;
            this.triggered = true;
            sessionStorage.setItem('exitPopupSeen', 'true');
        },
        close() {
            this.show = false;
        }
    }
};

createApp({
    components: {
        'exit-popup': ExitPopupComponent
    },
    data() {
        return {
            // Shared form data (bound to ALL inputs via v-model)
            name: '',
            email: '',
            
            // Form submission states
            ctaFormSubmitting: false,
            ctaFormSent: false,
            ctaMessage: '',
            cohortFormSubmitting: false,
            formSent: false,
            formError: false,
            formErrorMessage: '',
            submittedCohort: null, // Track which cohort form was submitted
            
            // Input validation errors
            nameError: false,
            emailError: false,
            
            // Toast notification
            toast: {
                show: false,
                message: '',
                type: 'error' // 'error' or 'success'
            },
            
            // Scholarship
            scholarshipCode: '',
            scholarshipApplied: false,
            scholarshipError: false,
            
            // UI state
            mobileMenuOpen: false,
            scrollY: 0,
            
            // Exit popup content
            exitPopupContent: {
                headline: "Before You Go...",
                description: "Join 200+ students learning AI-first development from MIT, Stanford, and Harvard instructors.",
                bullets: [
                    "Only 3 spots left in February cohort",
                    "100% money-back guarantee",
                    "Learn from FAANG engineers"
                ],
                cta: "Reserve Your Spot →"
            }
        };
    },
    
    async mounted() {
        // Load saved state from StateManager - generic merge
        const state = await StateManager.getMergedState();
        Object.assign(this.$data, state);
        
        // Track scroll for animations
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });
        
        // Set up watchers for auto-save
        this.$watch('name', (newValue) => {
            if (newValue && this.email) {
                StateManager.autoSave(this.email, { ...this.$data, page: 'landing' });
            }
        });
        
        this.$watch('email', (newValue) => {
            if (newValue) {
                StateManager.saveUserEmail(newValue);
                if (this.name) {
                    StateManager.autoSave(newValue, { ...this.$data, page: 'landing' });
                }
            }
        });
        
        StateManager.trackProgress('landing', 50);
        console.log('Adava University Vue app mounted');
    },
    
    methods: {
        // Show toast notification
        showToast(message, type = 'error') {
            this.toast.message = message;
            this.toast.type = type;
            this.toast.show = true;
            
            // Auto-hide after 4 seconds
            setTimeout(() => {
                this.toast.show = false;
            }, 4000);
        },
        
        // CTA Form - Submit lead + Show success (DON'T scroll)
        async submitCtaForm() {
            // Clear previous errors
            this.nameError = false;
            this.emailError = false;
            
            // Validate
            if (!this.name.trim()) {
                this.nameError = true;
            }
            if (!this.email.trim()) {
                this.emailError = true;
            }
            
            if (this.nameError || this.emailError) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Submit to backend (lead capture)
            this.ctaFormSubmitting = true;
            this.ctaMessage = '';
            
            try {
                // Use relative URL for production (nginx proxies to backend)
                // Use absolute URL for development (direct backend connection)
                await fetch(StateManager.getApiUrl('/api/submit'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        cohort: 'CTA Lead',
                        scholarshipCode: this.scholarshipCode || ''
                    })
                });
                
                // Show success message (data stays in inputs for cohort forms!)
                this.ctaFormSubmitting = false;
                this.ctaFormSent = true;
                this.ctaMessage = 'Thanks! Scroll down to apply';
                
            } catch (error) {
                console.error('CTA form submission error:', error);
                this.ctaFormSubmitting = false;
                this.ctaFormSent = true;
                this.ctaMessage = 'Thanks! Scroll down to apply';
            }
            
            // DON'T scroll - let user continue reading naturally
        },
        
        // Cohort Form - Submit data with cohort selection
        async submitCohortForm(cohort) {
            // Clear previous errors
            this.nameError = false;
            this.emailError = false;
            
            // Validate
            if (!this.name.trim()) {
                this.nameError = true;
            }
            if (!this.email.trim()) {
                this.emailError = true;
            }
            
            if (this.nameError || this.emailError) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }
            
            this.cohortFormSubmitting = true;
            this.formError = false;
            this.formSent = false;
            
            try {
                // Use relative URL for production (nginx proxies to backend)
                // Use absolute URL for development (direct backend connection)
                const response = await fetch(StateManager.getApiUrl('/api/submit'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        cohort: cohort,
                        scholarshipCode: this.scholarshipCode || ''
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Submission failed');
                }
                
                // Success! Redirect to full application form
                window.location.href = `application/?cohort=${encodeURIComponent(cohort)}&name=${encodeURIComponent(this.name)}&email=${encodeURIComponent(this.email)}`;
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.cohortFormSubmitting = false;
                this.formError = true;
                this.formErrorMessage = 'Server error. Please email adavauniversity@gmail.com instead.';
            }
        },
        
        // Scholarship Code Validation
        applyScholarship() {
            const code = this.scholarshipCode.trim();
            
            if (!code) {
                this.scholarshipError = true;
                this.showToast('Please enter a scholarship code', 'error');
                return;
            }
            
            // Validate: code must end with "scholarship" (case-insensitive)
            if (!code.toLowerCase().endsWith('scholarship')) {
                this.scholarshipError = true;
                this.scholarshipApplied = false;
                this.showToast('Invalid scholarship code', 'error');
                
                // Remove error state after animation
                setTimeout(() => {
                    this.scholarshipError = false;
                }, 1000);
                
                return;
            }
            
            // Valid code!
            this.scholarshipApplied = true;
            this.scholarshipError = false;
            this.showToast(`Scholarship "${code}" applied successfully! Price reduced to $1,120`, 'success');
            
            // Show scholarship pricing
            const originalPrice = document.getElementById('original-price');
            const scholarshipPrice = document.getElementById('scholarship-price');
            const deadlineCard = document.getElementById('deadline-card');
            const scholarshipExpiry = document.getElementById('scholarship-expiry');
            
            if (originalPrice) originalPrice.style.display = 'none';
            if (scholarshipPrice) scholarshipPrice.style.display = 'block';
            if (deadlineCard) deadlineCard.style.display = 'none';
            if (scholarshipExpiry) scholarshipExpiry.style.display = 'block';
        },
        
        // Mobile Menu Toggle
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
            document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
        },
        
        // Smooth Scroll
        scrollTo(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                this.mobileMenuOpen = false;
                document.body.style.overflow = '';
            }
        },
        
        // Scroll to Top
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },
        
        // Scroll to Cohorts (for CTA forms)
        scrollToCohorts() {
            const cohortsSection = document.getElementById('cohorts');
            if (cohortsSection) {
                cohortsSection.scrollIntoView({ behavior: 'smooth' });
                // Focus on first input in cohorts section after scrolling
                setTimeout(() => {
                    const firstInput = cohortsSection.querySelector('input[type="text"]');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 500);
            }
        }
    },
    
    computed: {
        showBackToTop() {
            return this.scrollY > 500;
        }
    }
}).mount('#app');

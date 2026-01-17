const { createApp } = Vue;

createApp({
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
            scrollY: 0
        };
    },
    
    mounted() {
        // Track scroll for animations
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });
        
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
                await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        type: 'cta-lead',
                        scholarshipCode: this.scholarshipCode
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
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        cohort: cohort,
                        scholarshipCode: this.scholarshipCode
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Submission failed');
                }
                
                // Success!
                this.cohortFormSubmitting = false;
                this.formSent = true;
                
                // Reset after 3 seconds
                setTimeout(() => {
                    this.name = '';
                    this.email = '';
                    this.formSent = false;
                }, 3000);
                
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

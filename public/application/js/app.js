// Application Form Logic

// Helper: Get API URL (production uses relative, dev uses absolute)
function getApiUrl(endpoint) {
    return window.location.hostname === 'adavauniversity.org' 
        ? endpoint 
        : `http://localhost:3001${endpoint}`;
}

const ApplicationForm = {
    data() {
        return {
            loading: false,
            submitted: false,
            qualificationMessage: '',
            cohort: '',
            spotsRemaining: 3,  // Only 3 spots left - high scarcity
            showPing: false,
            currentPing: {},
            showExitIntent: false,  // Exit intent popup
            showStickyBar: false,   // Sticky urgency header
            faqOpen: [false, false, false, false], // FAQ state
            // Dynamic counters
            graduateCount: 500,
            employedCount: 87,
            avgSalary: 94,
            // Section visibility for progressive disclosure
            sections: {
                basic: true,      // Always visible
                background: false,
                goals: false,
                commitment: false,
                professional: false, // New optional section
                payment: false
            },
            form: {
                name: '',
                email: '',
                phone: '',
                background: '',
                experience: '',
                aiTools: [],
                goal: '',
                motivation: '',
                dreamProject: '',
                uniqueSkill: '',
                commitment: '',
                source: '',
                cohort: '',
                // New optional professional fields
                linkedin: '',
                portfolio: '',
                website: '',
                // Payment fields
                cardNumber: '',
                expiry: '',
                cvc: ''
            }
        };
    },
    
    computed: {
        progress() {
            let filled = 0;
            const total = 10; // Exclude payment fields for progress calculation
            
            // Count filled fields (excluding payment)
            if (this.form.phone) filled++;
            if (this.form.background) filled++;
            if (this.form.experience) filled++;
            if (this.form.aiTools.length > 0) filled++;
            if (this.form.goal) filled++;
            if (this.form.motivation) filled++;
            if (this.form.dreamProject) filled++;
            if (this.form.uniqueSkill) filled++;
            if (this.form.commitment) filled++;
            if (this.form.source) filled++;
            
            // 25% base (name/email pre-filled) + 75% for remaining fields
            const formProgress = Math.round((filled / total) * 75);
            return 25 + formProgress;
        },
        
        progressMessage() {
            const p = this.progress;
            if (p <= 25) return "You're 25% complete - great start! (Most applicants spend 8-12 minutes on this form)";
            if (p <= 50) return "Halfway there! You're investing in your future. (Accepted applicants average 87% completion rate)";
            if (p <= 75) return "Almost done! You've put in significant effort - finishing now maximizes your chances.";
            if (p < 100) return "You're nearly complete! (Applicants who finish have 3x higher acceptance rates)";
            return "Application complete! You're in the top tier of applicants.";
        },
        
        isComplete() {
            // Application data is complete (payment is optional)
            return this.progress === 100;
        },
        
        isCompleteWithPayment() {
            // Check if payment fields are filled
            return this.isComplete && this.form.cardNumber && this.form.expiry && this.form.cvc;
        },
        
        // Application strength scores
        motivationScore() {
            const len = (this.form.motivation || '').length;
            if (len >= 200) return 95;
            if (len >= 150) return 85;
            if (len >= 100) return 75;
            if (len >= 50) return 60;
            return 40;
        },
        
        experienceScore() {
            const exp = this.form.experience;
            if (exp === 'advanced') return 95;
            if (exp === 'intermediate') return 85;
            if (exp === 'some') return 75;
            if (exp === 'tried') return 70;
            if (exp === 'never') return 80; // Beginners are welcome
            return 50;
        },
        
        commitmentScore() {
            const comm = this.form.commitment;
            if (comm === 'yes-all') return 95;
            if (comm === 'yes-most') return 75;
            return 40;
        },
        
        overallScore() {
            if (!this.form.goal || !this.form.experience) return 0;
            return Math.round((this.motivationScore + this.experienceScore + this.commitmentScore) / 3);
        }
    },
    
    mounted() {
        const params = new URLSearchParams(window.location.search);
        this.cohort = params.get('cohort') || '';
        this.form.name = params.get('name') || '';
        this.form.email = params.get('email') || '';
        
        // Load saved progress from localStorage
        this.loadProgress();
        
        // Animate counters on load
        this.animateCounters();
        
        // Start social proof pings
        this.startSocialProof();
        
        // Exit intent detection
        this.initExitIntent();
        
        // Sticky header on scroll
        this.initStickyHeader();
        
        // Auto-save progress every 10 seconds
        setInterval(() => {
            this.saveProgress();
        }, 10000);
    },
    
    methods: {
        updateProgress() {
            // Auto-progress tracking
            this.saveProgress(); // Save on every update
        },
        
        saveProgress() {
            // Save entire form data to localStorage (generic, no manual field listing)
            const progressData = {
                form: this.form, // Save everything generically
                sections: this.sections,
                timestamp: Date.now()
            };
            localStorage.setItem('adava_application_progress', JSON.stringify(progressData));
            
            // Also save email separately for easy access by evaluation page
            if (this.form.email) {
                localStorage.setItem('applicantEmail', this.form.email);
            }
        },
        
        loadProgress() {
            const saved = localStorage.getItem('adava_application_progress');
            if (!saved) return;
            
            try {
                const data = JSON.parse(saved);
                // Only load if saved within last 24 hours
                const hoursSince = (Date.now() - data.timestamp) / (1000 * 60 * 60);
                if (hoursSince < 24) {
                    // Restore form data
                    Object.assign(this.form, data.form);
                    // Restore section visibility
                    Object.assign(this.sections, data.sections);
                }
            } catch (e) {
                console.error('Failed to load progress:', e);
            }
        },
        
        animateCounters() {
            // Animate graduate count from 0 to 500
            this.animateNumber('graduateCount', 0, 500, 2000);
            // Animate employed % from 0 to 87
            this.animateNumber('employedCount', 0, 87, 2000);
            // Animate salary from 0 to 94
            this.animateNumber('avgSalary', 0, 94, 2000);
        },
        
        animateNumber(prop, start, end, duration) {
            const startTime = Date.now();
            const range = end - start;
            
            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (easeOutQuad)
                const easeProgress = progress * (2 - progress);
                this[prop] = Math.floor(start + range * easeProgress);
                
                if (progress >= 1) {
                    clearInterval(timer);
                    this[prop] = end;
                }
            }, 16); // ~60fps
        },
        
        toggleFaq(index) {
            this.faqOpen[index] = !this.faqOpen[index];
            // Force Vue reactivity
            this.$set(this.faqOpen, index, this.faqOpen[index]);
        },
        
        // Progressive section unlocking
        completeSection(currentSection) {
            const sectionOrder = ['basic', 'background', 'goals', 'commitment', 'professional', 'payment'];
            const currentIndex = sectionOrder.indexOf(currentSection);
            if (currentIndex < sectionOrder.length - 1) {
                const nextSection = sectionOrder[currentIndex + 1];
                this.sections[nextSection] = true;
                
                // Scroll to next section with smooth animation
                this.$nextTick(() => {
                    setTimeout(() => {
                        const nextEl = document.querySelector(`[data-section="${nextSection}"]`);
                        if (nextEl) {
                            // Scroll with offset for better visibility
                            const yOffset = -20; // 20px from top
                            const y = nextEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                    }, 150); // Small delay for Vue to render
                });
            }
        },
        
        // Check if section is complete
        isSectionComplete(section) {
            switch(section) {
                case 'basic':
                    return this.form.name && this.form.email && this.form.phone;
                case 'background':
                    return this.form.background && this.form.experience && this.form.aiTools.length > 0;
                case 'goals':
                    return this.form.goal && this.form.motivation && this.form.dreamProject && this.form.uniqueSkill;
                case 'commitment':
                    return this.form.commitment && this.form.source;
                case 'professional':
                    return true; // Optional, always complete
                case 'payment':
                    return this.form.cardNumber && this.form.expiry && this.form.cvc;
                default:
                    return false;
            }
        },
        
        startSocialProof() {
            const pings = [
                { name: 'Sarah M.', initials: 'SM', action: 'just applied from New York', urgency: 'Only 3 spots remain' },
                { name: 'Michael K.', initials: 'MK', action: 'just applied from San Francisco', urgency: '3 seats left in cohort' },
                { name: 'Jennifer L.', initials: 'JL', action: 'just applied from Austin', urgency: 'February cohort nearly full' },
                { name: 'David P.', initials: 'DP', action: 'just applied from Seattle', urgency: '3 spots remaining' },
                { name: 'Lisa R.', initials: 'LR', action: 'just applied from Boston', urgency: 'Last 3 seats available' },
                { name: 'James T.', initials: 'JT', action: 'just applied from Chicago', urgency: 'Only 3 spots left' }
            ];
            
            const showRandomPing = () => {
                this.currentPing = pings[Math.floor(Math.random() * pings.length)];
                this.showPing = true;
                
                setTimeout(() => {
                    this.showPing = false;
                }, 5000);
            };
            
            // Show first ping after 10 seconds
            setTimeout(showRandomPing, 10000);
            
            // Then every 20-40 seconds
            setInterval(() => {
                const delay = 20000 + Math.random() * 20000;
                setTimeout(showRandomPing, delay);
            }, 40000);
        },
        
        async submitApplication() {
            if (!this.isComplete) {
                alert('Please complete all required fields');
                return;
            }

            this.loading = true;
            this.submitted = true;
            
            try {
                // Save to session/localStorage first
                await this.saveToSession();
                
                const response = await fetch(getApiUrl('/api/submit-application'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...this.form,
                        cohort: this.cohort,
                        aiTools: this.form.aiTools.join(', ')
                    })
                });

                if (response.ok) {
                    // Redirect to evaluation page (email is saved in localStorage)
                    window.location.href = `/evaluation/`;
                } else {
                    alert('Error submitting. Please email us at adavauniversity@gmail.com');
                    this.loading = false;
                    this.submitted = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error submitting. Please email us at adavauniversity@gmail.com');
                this.loading = false;
                this.submitted = false;
            }
        },
        
        async saveToSession() {
            // Save to localStorage (detailed format)
            const applicationData = {
                application: this.form,
                cohort: this.cohort,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('application_progress', JSON.stringify(applicationData));
            
            // Also save email separately for easy access
            localStorage.setItem('applicantEmail', this.form.email);
            
            // Save to server session
            try {
                await fetch(getApiUrl('/api/session/save'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.form.email,
                        data: applicationData
                    })
                });
            } catch (error) {
                console.error('Error saving session:', error);
                // Continue anyway - localStorage is saved
            }
        },
        
        initExitIntent() {
            let exitIntentShown = false;
            
            document.addEventListener('mouseleave', (e) => {
                // Only trigger if mouse leaves from top of page and not already shown and form not submitted
                if (e.clientY < 10 && !exitIntentShown && !this.submitted && this.progress > 25) {
                    this.showExitIntent = true;
                    exitIntentShown = true;
                }
            });
        },
        
        initStickyHeader() {
            window.addEventListener('scroll', () => {
                // Show sticky bar after scrolling down 300px and form not submitted
                this.showStickyBar = window.scrollY > 300 && !this.submitted;
            });
        },
        
        scrollToPayment() {
            // Scroll to payment section or reveal it
            if (!this.sections.payment) {
                // If payment not visible, complete all sections to reveal it
                this.sections.background = true;
                this.sections.goals = true;
                this.sections.commitment = true;
                this.sections.professional = true;
                this.sections.payment = true;
            }
            
            setTimeout(() => {
                const paymentSection = document.querySelector('.payment-section');
                if (paymentSection) {
                    paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }
};

// Initialize Vue app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Load all component templates first
    if (window.loadVueComponents) {
        await window.loadVueComponents();
    }
    
    // Then initialize the main Vue app
    new Vue({
        el: '#app',
        ...ApplicationForm
    });
});

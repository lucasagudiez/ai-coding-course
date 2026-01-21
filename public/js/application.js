// Application Form Logic
const ApplicationForm = {
    data() {
        return {
            loading: false,
            submitted: false,
            qualificationMessage: '',
            cohort: '',
            spotsRemaining: 23,
            showPing: false,
            currentPing: {},
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
                commitment: '',
                source: '',
                // New optional fields
                linkedinUrl: '',
                portfolioUrl: '',
                resumeFile: null,
                cardNumber: '',
                expiry: '',
                cvc: ''
            }
        };
    },
    
    computed: {
        progress() {
            let filled = 0;
            const total = 10; // Adjusted for correct calculation
            
            // Count filled fields
            if (this.form.phone) filled++;
            if (this.form.background) filled++;
            if (this.form.experience) filled++;
            if (this.form.aiTools.length > 0) filled++;
            if (this.form.goal) filled++;
            if (this.form.motivation) filled++;
            if (this.form.commitment) filled++;
            if (this.form.source) filled++;
            if (this.form.cardNumber) filled++;
            if (this.form.expiry && this.form.cvc) filled++;
            
            // 25% base (name/email pre-filled) + 75% for remaining fields
            const formProgress = Math.round((filled / total) * 75);
            return 25 + formProgress;
        },
        
        isComplete() {
            return this.progress === 100;
        }
    },
    
    mounted() {
        const params = new URLSearchParams(window.location.search);
        this.cohort = params.get('cohort') || '';
        this.form.name = params.get('name') || '';
        this.form.email = params.get('email') || '';
        
        // Start social proof pings
        this.startSocialProof();
    },
    
    methods: {
        updateProgress() {
            // Auto-progress tracking
        },
        
        // Progressive section unlocking
        completeSection(currentSection) {
            const sectionOrder = ['basic', 'background', 'goals', 'commitment', 'professional', 'payment'];
            const currentIndex = sectionOrder.indexOf(currentSection);
            if (currentIndex < sectionOrder.length - 1) {
                const nextSection = sectionOrder[currentIndex + 1];
                this.sections[nextSection] = true;
                
                // Scroll to next section
                setTimeout(() => {
                    const nextEl = document.querySelector(`[data-section="${nextSection}"]`);
                    if (nextEl) {
                        nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
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
                    return this.form.goal && this.form.motivation;
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
                { name: 'Sarah M.', initials: 'SM', action: 'just applied from New York' },
                { name: 'Michael K.', initials: 'MK', action: 'just applied from San Francisco' },
                { name: 'Jennifer L.', initials: 'JL', action: 'just applied from Austin' },
                { name: 'David P.', initials: 'DP', action: 'just applied from Seattle' },
                { name: 'Lisa R.', initials: 'LR', action: 'just applied from Boston' },
                { name: 'James T.', initials: 'JT', action: 'just applied from Chicago' }
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
                alert('Please complete all fields');
                return;
            }

            this.loading = true;
            this.submitted = true;
            
            try {
                const apiUrl = window.location.hostname === 'adavauniversity.org' 
                    ? '/api/submit-application' 
                    : 'http://localhost:3001/api/submit-application';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...this.form,
                        cohort: this.cohort,
                        aiTools: this.form.aiTools.join(', ')
                    })
                });

                if (response.ok) {
                    await this.generateQualification();
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
        
        async generateQualification() {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            let message = `Based on your application, you're an <strong>excellent match</strong> for our February cohort. Here's why:<br><br>`;
            
            const reasons = [];
            
            if (this.form.background === 'professional') {
                reasons.push('<strong>Professional Experience:</strong> You understand real problems. We\'ll show you how to solve them with AI - 10x faster than traditional coding.');
            } else if (this.form.background === 'career-changer') {
                reasons.push('<strong>Career Transition:</strong> Learn AI-powered development in weeks, not years. Skip the traditional learning curve entirely.');
            } else if (this.form.background === 'student') {
                reasons.push('<strong>Student Advantage:</strong> You\'ll graduate with skills most developers won\'t have for years. AI coding is the future.');
            } else if (this.form.background === 'entrepreneur') {
                reasons.push('<strong>Founder Mindset:</strong> Build MVPs 10x faster. Validate ideas in days using AI to generate your entire codebase.');
            }
            
            if (this.form.experience === 'never' || this.form.experience === 'tried') {
                reasons.push('<strong>Clean Slate:</strong> Perfect. You\'ll learn AI-powered development from day one. No bad coding habits to unlearn.');
            } else if (this.form.experience === 'advanced') {
                reasons.push('<strong>Technical Background:</strong> Your knowledge + AI tools = 10-20x productivity. You already think like a developer.');
            } else {
                reasons.push('<strong>Perfect Starting Point:</strong> Enough foundation to understand concepts. Not stuck in old coding patterns.');
            }
            
            if (this.form.goal === 'job' || this.form.goal === 'career-switch') {
                reasons.push('<strong>Career Goals:</strong> Companies are desperately hiring AI-augmented developers. Our grads average $94K starting salaries.');
            } else if (this.form.goal === 'startup') {
                reasons.push('<strong>Startup Path:</strong> AI cuts development time by 80%. Ship in weeks what used to take months.');
            }
            
            message += reasons.slice(0, 3).join('<br><br>');
            message += '<br><br><strong style="color: #14b8a6;">Preliminary Assessment: Strong Candidate</strong><br>You\'re exactly who we look for. Expect your decision within 24-48 hours.';
            
            this.qualificationMessage = message;
            this.loading = false;
        }
    }
};

// Initialize Vue app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#app',
        ...ApplicationForm
    });
});

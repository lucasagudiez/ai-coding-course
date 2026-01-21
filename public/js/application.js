// Initialize Vue app
new Vue({
    el: '#app',
    data: {
        spotsRemaining: 3,
        showStickyBar: false,
        showExitIntent: false,
        isSubmitting: false,
        progress: 25, // Start at 25% (name/email/cohort pre-filled)
        
        // Section visibility for progressive disclosure
        sections: {
            contact: true,      // Always visible first
            background: false,
            goals: false,
            commitment: false,
            payment: false
        },
        
        // Form data
        formData: {
            name: '',
            email: '',
            cohort: '',
            phone: '',
            status: '',
            codingExperience: '',
            aiTools: [],
            primaryGoal: '',
            whyNow: '',
            liveAttendance: '',
            referralSource: ''
        },
        
        // Social proof pings
        activePings: [],
        
        // Graduate counter
        graduateCount: 500,
        employedCount: 87,
        avgSalary: 94
    },
    
    mounted() {
        // Load state from StateManager (URL > Server > Local)
        this.loadSavedState();
        
        // Set up watchers for auto-save
        this.setupAutoSave();
        
        // Start social proof pings
        this.startSocialProof();
        
        // Animate counters
        this.animateCounters();
        
        // Setup scroll listener for sticky bar
        window.addEventListener('scroll', this.handleScroll);
        
        // Setup exit intent
        document.addEventListener('mouseleave', this.handleMouseLeave);
        
        // Track progress
        StateManager.trackProgress('application', this.progress);
    },
    
    methods: {
        // Load saved state from StateManager
        async loadSavedState() {
            const state = await StateManager.getMergedState();
            
            // Generic merge - copy ALL fields from state into formData
            Object.assign(this.formData, state);
            
            // Update progress
            this.updateProgress();
        },
        
        // Setup auto-save watchers
        setupAutoSave() {
            // Watch each form field
            this.$watch('formData', (newValue) => {
                if (newValue.email) {
                    StateManager.autoSave(newValue.email, {
                        ...newValue,
                        page: 'application',
                        progress: this.progress,
                        sections: this.sections
                    });
                }
            }, { deep: true });
        },
        
        updateProgress() {
            // Calculate progress based on filled fields
            let filled = 3; // name, email, cohort (pre-filled)
            let total = 10; // Total required fields
            
            if (this.formData.phone) filled++;
            if (this.formData.status) filled++;
            if (this.formData.codingExperience) filled++;
            if (this.formData.aiTools.length > 0) filled++;
            if (this.formData.primaryGoal) filled++;
            if (this.formData.whyNow) filled++;
            if (this.formData.liveAttendance) filled++;
            if (this.formData.referralSource) filled++;
            
            this.progress = Math.max(25, Math.round((filled / total) * 100));
        },
        
        completeSection(sectionName) {
            // Mark current section as complete and show next
            const sectionOrder = ['contact', 'background', 'goals', 'commitment', 'payment'];
            const currentIndex = sectionOrder.indexOf(sectionName);
            
            if (currentIndex >= 0 && currentIndex < sectionOrder.length - 1) {
                const nextSection = sectionOrder[currentIndex + 1];
                this.sections[nextSection] = true;
                
                // Scroll to the next section
                this.$nextTick(() => {
                    const nextElement = document.querySelector(`[data-section="${nextSection}"]`) || 
                                      document.querySelector('.form-section:not([v-show])');
                    if (nextElement) {
                        setTimeout(() => {
                            nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }
                });
            }
        },
        
        async submitApplication() {
            if (this.isSubmitting) return;
            
            this.isSubmitting = true;
            
            try {
                // Submit to backend
                const apiUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:3001/api/application'
                    : '/api/application';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.formData,
                        amount: 10 // $10 application fee
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Application submission failed');
                }
                
                const result = await response.json();
                
                // Redirect to evaluation page with query params
                window.location.href = `/evaluation/?name=${encodeURIComponent(this.formData.name)}&cohort=${encodeURIComponent(this.formData.cohort)}&occupation=${encodeURIComponent(this.formData.status)}&experience=${encodeURIComponent(this.formData.codingExperience)}&goal=${encodeURIComponent(this.formData.primaryGoal)}`;
                
            } catch (error) {
                alert('Error: ' + error.message);
                this.isSubmitting = false;
            }
        },
        
        scrollToPayment() {
            const paymentSection = document.querySelector('.payment-section');
            if (paymentSection) {
                paymentSection.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        handleScroll() {
            this.showStickyBar = window.scrollY > 300;
        },
        
        handleMouseLeave(e) {
            // Show exit intent if mouse leaves top of page and user hasn't submitted
            if (e.clientY <= 0 && !this.isSubmitting && !this.showExitIntent) {
                this.showExitIntent = true;
            }
        },
        
        startSocialProof() {
            const names = ['Sarah M.', 'David K.', 'Jessica L.', 'Michael T.', 'Emily R.', 'James W.', 'Ashley P.', 'Chris D.'];
            const locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston', 'Chicago', 'Los Angeles', 'Denver'];
            const urgencyMessages = [
                'Only 3 spots remain!',
                'Last 3 seats available!',
                '3 seats left in February cohort'
            ];
            
            setInterval(() => {
                if (this.activePings.length < 3) {
                    const ping = {
                        name: names[Math.floor(Math.random() * names.length)],
                        location: locations[Math.floor(Math.random() * locations.length)],
                        urgency: urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)]
                    };
                    
                    this.activePings.push(ping);
                    
                    setTimeout(() => {
                        this.activePings.shift();
                    }, 5000);
                }
            }, 8000);
        },
        
        animateCounters() {
            // Animate graduate counter
            const targetGraduate = 500;
            const targetEmployed = 87;
            const targetSalary = 94;
            
            let currentGraduate = 0;
            let currentEmployed = 0;
            let currentSalary = 0;
            
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;
            
            const timer = setInterval(() => {
                currentGraduate += targetGraduate / steps;
                currentEmployed += targetEmployed / steps;
                currentSalary += targetSalary / steps;
                
                this.graduateCount = Math.min(Math.floor(currentGraduate), targetGraduate);
                this.employedCount = Math.min(Math.floor(currentEmployed), targetEmployed);
                this.avgSalary = Math.min(Math.floor(currentSalary), targetSalary);
                
                if (currentGraduate >= targetGraduate) {
                    clearInterval(timer);
                    this.graduateCount = targetGraduate;
                    this.employedCount = targetEmployed;
                    this.avgSalary = targetSalary;
                }
            }, interval);
        }
    },
    
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
    }
});

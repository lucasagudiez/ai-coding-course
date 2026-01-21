/**
 * Evaluation Page - LLM-Powered Personalization
 */

// LLM Personalization Service - calls our backend
const LLM_SERVICE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api/personalize'
    : '/api/personalize';

new Vue({
    el: '#app',
    data: {
        progress: 0,
        currentStep: 0,
        showResult: false,
        loadingMessage: 'Initializing...',
        messages: [
            'Verifying your background...',
            'Analyzing your experience...',
            'Evaluating your goals...',
            'Matching with February cohort...',
            'Checking program fit...',
            'Generating personalized evaluation...',
            'Preparing results...'
        ],
        // Applicant data from URL
        applicantData: {
            name: '',
            cohort: '',
            occupation: '',
            experience: '',
            goal: ''
        },
        // LLM-generated content
        personalizedReasons: [],
        matchedTestimonial: null,
        relevantProjects: []
    },
    mounted() {
        // Get applicant data from URL
        const params = new URLSearchParams(window.location.search);
        this.applicantData.name = params.get('name') || 'Applicant';
        this.applicantData.cohort = params.get('cohort') || 'February 2026';
        this.applicantData.occupation = params.get('occupation') || '';
        this.applicantData.experience = params.get('experience') || 'beginner';
        this.applicantData.goal = params.get('goal') || 'career-change';
        
        this.startEvaluation();
    },
    methods: {
        async startEvaluation() {
            // Start loading animation
            this.animateLoading();
            
            // Fetch LLM personalization in parallel with loading
            try {
                await Promise.all([
                    this.generatePersonalizedReasons(),
                    this.generateMatchedTestimonial(),
                    this.getRelevantProjects()
                ]);
            } catch (error) {
                console.error('LLM generation error:', error);
                // Fallbacks are already set, so this is fine
            }
        },
        
        animateLoading() {
            let messageIndex = 0;
            const totalDuration = 10000; // 10 seconds
            const updateInterval = 100;
            const totalUpdates = totalDuration / updateInterval;
            let currentUpdate = 0;
            
            const interval = setInterval(() => {
                currentUpdate++;
                this.progress = Math.min((currentUpdate / totalUpdates) * 100, 100);
                
                // Update step
                if (this.progress > 20 && this.currentStep < 1) this.currentStep = 1;
                if (this.progress > 40 && this.currentStep < 2) this.currentStep = 2;
                if (this.progress > 60 && this.currentStep < 3) this.currentStep = 3;
                if (this.progress > 90 && this.currentStep < 4) this.currentStep = 4;
                
                // Update message
                const messageProgress = Math.floor((this.progress / 100) * this.messages.length);
                if (messageProgress !== messageIndex && messageProgress < this.messages.length) {
                    messageIndex = messageProgress;
                    this.loadingMessage = this.messages[messageIndex];
                }
                
                // Show result
                if (currentUpdate >= totalUpdates) {
                    clearInterval(interval);
                    setTimeout(() => {
                        this.showResult = true;
                    }, 500);
                }
            }, updateInterval);
        },
        
        async generatePersonalizedReasons() {
            try {
                const response = await fetch(LLM_SERVICE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'fit_reasons',
                        applicantData: this.applicantData
                    })
                });
                
                const data = await response.json();
                this.personalizedReasons = data.reasons;
            } catch (error) {
                console.error('Error generating reasons:', error);
                // Fallback reasons
                this.personalizedReasons = [
                    `Your background as ${this.applicantData.occupation} gives you unique insights that will accelerate your learning`,
                    `Your goal to ${this.applicantData.goal} aligns perfectly with what our graduates achieve`,
                    `Starting with ${this.applicantData.experience} experience means you'll adopt the AI-first approach effectively`
                ];
            }
        },
        
        async generateMatchedTestimonial() {
            try {
                const response = await fetch(LLM_SERVICE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'testimonial',
                        applicantData: this.applicantData
                    })
                });
                
                const data = await response.json();
                this.matchedTestimonial = data.testimonial;
            } catch (error) {
                console.error('Error generating testimonial:', error);
                // Fallback testimonial
                this.matchedTestimonial = {
                    name: 'Alex R.',
                    background: 'Career Changer',
                    afterAdava: 'Full-Stack Developer ($94K)',
                    quote: 'The AI coding approach made it possible to switch careers in just 10 days. Now I\'m building production apps and loving my new role.'
                };
            }
        },
        
        getRelevantProjects() {
            // Simple mapping based on occupation (no LLM needed)
            const occupation = (this.applicantData.occupation || '').toLowerCase();
            
            const projectMap = {
                medical: ['HIPAA-Compliant Patient Records Dashboard', 'AI Diagnostic Assistant'],
                doctor: ['Health Records System', 'Medical Data Analytics Platform'],
                physician: ['Patient Management System', 'AI Health Assistant'],
                teacher: ['Student Progress Tracker', 'AI Tutoring Chatbot'],
                educator: ['Learning Management Dashboard', 'Automated Grading System'],
                marketing: ['Social Media Analytics Tool', 'AI Content Generator'],
                finance: ['Stock Analysis Dashboard', 'Budget Tracking App'],
                engineer: ['Project Management Dashboard', 'IoT Data Visualization'],
                business: ['CRM Dashboard', 'Sales Analytics Tool']
            };
            
            // Find matching projects
            for (const [key, projects] of Object.entries(projectMap)) {
                if (occupation.includes(key)) {
                    this.relevantProjects = projects;
                    return;
                }
            }
            
            // Default projects
            this.relevantProjects = [
                'E-Commerce Platform with Payments',
                'AI Chatbot with Custom Training'
            ];
        },
        
        goToReservation() {
            const params = new URLSearchParams(window.location.search);
            window.location.href = `/reservation/?${params.toString()}`;
        }
    }
});

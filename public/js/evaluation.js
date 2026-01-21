// Evaluation Page Logic with Real ChatGPT Integration
const EvaluationPage = {
    data() {
        return {
            progress: 0,
            currentStep: 0,
            showResult: false,
            loadingMessage: 'Initializing AI review...',
            // Result data (populated by API)
            evaluation: null,
            reasons: [],
            projects: [],
            testimonial: null,
            nextSteps: [],
            dreamProjectFeedback: '',
            uniqueSkillConnection: '',
            headline: '',
            // Timing
            startTime: null,
            minLoadingTime: 10000 // 10 seconds minimum
        };
    },
    
    mounted() {
        this.startTime = Date.now();
        this.startEvaluation();
    },
    
    methods: {
        async startEvaluation() {
            // Get email from URL params OR localStorage (session state)
            const params = new URLSearchParams(window.location.search);
            let email = params.get('email');
            
            // If no email in URL, try localStorage
            if (!email) {
                const savedProgress = localStorage.getItem('application_progress');
                if (savedProgress) {
                    try {
                        const progress = JSON.parse(savedProgress);
                        email = progress.email;
                    } catch (e) {
                        console.error('Error parsing saved progress:', e);
                    }
                }
            }
            
            if (!email) {
                alert('Missing application data. Please complete the application form first.');
                window.location.href = '/application/';
                return;
            }
            
            // Start loading animation immediately
            this.animateLoading();
            
            try {
                // Call the API
                const apiUrl = window.location.hostname === 'adavauniversity.org' 
                    ? '/api/evaluate-application' 
                    : 'http://localhost:3001/api/evaluate-application';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load evaluation');
                }
                
                const data = await response.json();
                this.evaluation = data.evaluation;
                
                // Populate result data
                this.headline = this.evaluation.headline || "Congratulations! You've Been Pre-Approved";
                this.reasons = this.evaluation.fitReasons || [];
                this.dreamProjectFeedback = this.evaluation.dreamProjectFeedback || '';
                this.uniqueSkillConnection = this.evaluation.uniqueSkillConnection || '';
                this.projects = this.evaluation.recommendedProjects || [];
                this.testimonial = this.evaluation.testimonial || null;
                this.nextSteps = this.evaluation.nextSteps || [];
                
                // Ensure minimum 10 seconds loading time
                const elapsed = Date.now() - this.startTime;
                const remainingTime = Math.max(0, this.minLoadingTime - elapsed);
                
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }
                
                // Show result
                this.showResult = true;
                
            } catch (error) {
                console.error('Evaluation error:', error);
                
                // Show fallback evaluation after minimum time
                const elapsed = Date.now() - this.startTime;
                const remainingTime = Math.max(0, this.minLoadingTime - elapsed);
                await new Promise(resolve => setTimeout(resolve, remainingTime));
                
                // Set fallback data
                this.headline = "Congratulations! You've Been Pre-Selected";
                this.reasons = [
                    "Your unique background and perspectives will bring fresh insights to our learning community",
                    "Your stated goals align perfectly with what our graduates consistently achieve",
                    "Your motivation demonstrates the commitment needed to succeed in our intensive program"
                ];
                this.dreamProjectFeedback = "Your project idea shows creativity and practical thinking.";
                this.uniqueSkillConnection = "Your unique skills will help you stand out as a developer.";
                this.projects = [
                    "AI-Powered Personal Dashboard",
                    "Automated Data Analysis Tool",
                    "Custom Chatbot Application"
                ];
                this.testimonial = {
                    name: "Alex R.",
                    background: "Career Changer",
                    afterAdava: "Full-Stack Developer at Stripe ($112K)",
                    quote: "The AI coding approach made it possible to switch careers in just 10 days."
                };
                this.nextSteps = [
                    { step: "Final Review", time: "24-48 hours" },
                    { step: "Decision Email", time: "Check inbox" },
                    { step: "Secure Your Spot", time: "7 days to pay $580" }
                ];
                
                this.showResult = true;
            }
        },
        
        animateLoading() {
            const messages = [
                'Analyzing your background and experience...',
                'Evaluating your coding goals...',
                'Reviewing your dream project idea...',
                'Considering your unique skills...',
                'Matching you with similar successful graduates...',
                'Generating personalized project recommendations...',
                'Finalizing your evaluation...'
            ];
            
            let messageIndex = 0;
            let stepIndex = 0;
            
            // Update progress bar smoothly
            const progressInterval = setInterval(() => {
                if (this.progress < 95 && !this.showResult) {
                    this.progress += 0.5;
                } else {
                    clearInterval(progressInterval);
                }
            }, 50);
            
            // Update steps and messages
            const stepInterval = setInterval(() => {
                if (this.showResult) {
                    clearInterval(stepInterval);
                    return;
                }
                
                // Update step
                if (stepIndex < 4) {
                    this.currentStep = stepIndex + 1;
                    stepIndex++;
                }
                
                // Update message
                if (messageIndex < messages.length) {
                    this.loadingMessage = messages[messageIndex];
                    messageIndex++;
                } else {
                    messageIndex = 0; // Loop messages if needed
                }
                
            }, 1500); // Change every 1.5 seconds
            
            // Complete animation when showing result
            this.$watch('showResult', (newVal) => {
                if (newVal) {
                    clearInterval(progressInterval);
                    clearInterval(stepInterval);
                    this.progress = 100;
                    this.currentStep = 4;
                }
            });
        },
        
        goToReservation() {
            // Get email from URL params
            const params = new URLSearchParams(window.location.search);
            const email = params.get('email');
            const name = params.get('name');
            
            // Redirect to reservation page with user data
            const reservationParams = new URLSearchParams({
                email: email || '',
                name: name || ''
            });
            
            window.location.href = `/reservation/?${reservationParams.toString()}`;
        }
    }
};

// Initialize Vue app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#app',
        ...EvaluationPage
    });
});

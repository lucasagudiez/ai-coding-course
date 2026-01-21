/**
 * Evaluation Page - Application Review Simulation
 * Shows loading animation then personalized acceptance message
 */

new Vue({
    el: '#app',
    data: {
        // Loading state
        progress: 0,
        currentStep: 0,
        showResult: false,
        loadingMessage: 'Initializing...',
        
        // Result data
        reasons: [
            'Strong technical background with clear career goals',
            'High motivation and commitment to learning AI tools',
            'Excellent fit for February 2026 cohort timeline',
            'Background aligns with successful graduate profiles'
        ],
        projects: [
            'E-commerce Platform with AI-powered recommendations',
            'Real-time Chat Application with GPT integration',
            'Data Dashboard with automated insights',
            'Personal Portfolio Website with modern animations'
        ]
    },
    
    mounted() {
        this.startEvaluation();
    },
    
    methods: {
        startEvaluation() {
            const loadingMessages = [
                'Initializing evaluation...',
                'Analyzing background and experience...',
                'Reviewing goals and motivation...',
                'Matching with cohort requirements...',
                'Finalizing evaluation...',
                'Preparing your personalized results...'
            ];
            
            let messageIndex = 0;
            let progressInterval = setInterval(() => {
                this.progress += 2;
                
                // Update step indicators
                if (this.progress >= 20 && this.currentStep < 1) {
                    this.currentStep = 1;
                    this.loadingMessage = loadingMessages[1];
                }
                else if (this.progress >= 40 && this.currentStep < 2) {
                    this.currentStep = 2;
                    this.loadingMessage = loadingMessages[2];
                }
                else if (this.progress >= 60 && this.currentStep < 3) {
                    this.currentStep = 3;
                    this.loadingMessage = loadingMessages[3];
                }
                else if (this.progress >= 80 && this.currentStep < 4) {
                    this.currentStep = 4;
                    this.loadingMessage = loadingMessages[4];
                }
                else if (this.progress >= 95) {
                    this.loadingMessage = loadingMessages[5];
                }
                
                // Show result when complete
                if (this.progress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        this.showResult = true;
                    }, 500);
                }
            }, 50); // 50ms * 50 iterations = 2.5 seconds total
        }
    }
});

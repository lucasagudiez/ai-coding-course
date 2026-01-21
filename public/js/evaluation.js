/**
 * Evaluation Page - AI Analysis Loading
 */

new Vue({
    el: '#app',
    data: {
        progress: 0,
        currentStep: 0,
        showResult: false,
        loadingMessage: 'Initializing...',
        messages: [
            'Verifying your background...',
            'Analyzing your experience with AI tools...',
            'Evaluating your goals...',
            'Matching with February cohort...',
            'Checking program fit...',
            'Calculating success probability...',
            'Running final evaluation...',
            'Preparing results...'
        ]
    },
    mounted() {
        this.startEvaluation();
    },
    methods: {
        startEvaluation() {
            let messageIndex = 0;
            const totalDuration = 10000; // 10 seconds
            const updateInterval = 100; // Update every 100ms
            const totalUpdates = totalDuration / updateInterval;
            let currentUpdate = 0;

            const interval = setInterval(() => {
                currentUpdate++;
                this.progress = Math.min((currentUpdate / totalUpdates) * 100, 100);

                // Update step
                if (this.progress > 25 && this.currentStep < 1) this.currentStep = 1;
                if (this.progress > 45 && this.currentStep < 2) this.currentStep = 2;
                if (this.progress > 70 && this.currentStep < 3) this.currentStep = 3;
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
        goToReservation() {
            // Get params from URL
            const params = new URLSearchParams(window.location.search);
            window.location.href = `/reservation/?${params.toString()}`;
        }
    }
});

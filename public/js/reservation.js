/**
 * Reservation Page - Final Payment
 */

new Vue({
    el: '#app',
    data: {
        submitting: false,
        applicantName: 'Applicant',
        cohort: 'February 2026'
    },
    async mounted() {
        // Load applicant data from StateManager
        const savedState = await StateManager.getMergedState();
        if (savedState) {
            this.applicantName = savedState.name || this.applicantName;
            this.cohort = savedState.cohort || this.cohort;
        }
        
        // Track progress
        StateManager.trackProgress('reservation', 90); // 90% - ready for final payment
    },
    methods: {
        async submitReservation() {
            this.submitting = true;

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mark funnel as complete
            StateManager.trackProgress('reservation', 100);

            // Redirect to success/thank you page
            window.location.href = '/thank-you/';
        }
    }
});

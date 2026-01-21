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
        const state = await StateManager.getMergedState();
        
        // Generic copy - merge ALL fields
        Object.assign(this.$data, state);
        
        StateManager.trackProgress('reservation', 90);
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

/**
 * Reservation Page - Final Payment
 */

new Vue({
    el: '#app',
    data: {
        submitting: false
    },
    methods: {
        async submitReservation() {
            this.submitting = true;

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect to success/thank you page
            window.location.href = '/thank-you/';
        }
    }
});

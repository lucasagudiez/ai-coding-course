/**
 * Reservation Page - Final Payment
 * Uses shared Vue components and handles payment submission
 */

// Exit popup content for this page
const exitPopupContentReservation = {
    headline: "Secure Your Spot Before It's Gone",
    description: "Only 3 spots remain in the February cohort. Complete your reservation now to guarantee your place.",
    bullets: [
        "Spots filling up fast",
        "100% money-back guarantee",
        "Start learning in days, not months"
    ],
    cta: "Complete Reservation"
};

// Initialize Vue app and load components
(async function() {
    // Load all component templates first
    if (window.loadVueComponents) {
        await window.loadVueComponents();
    }

    // Then initialize the main Vue app
    new Vue({
        el: '#app',
        components: {
            'exit-popup': ExitPopupComponent
        },
        data: {
            // Payment form
            cardNumber: '',
            expiry: '',
            cvc: '',
            billingZip: '',
            isProcessing: false,
            showSuccess: false,
            changeCard: false, // Toggle to show card form
            
            // FAQ state (for faq-section component)
            faqOpen: {},
            
            // Exit popup content
            exitPopupContent: exitPopupContentReservation
        },
        
        methods: {
            submitPayment() {
                this.isProcessing = true;
                
                // Simulate payment processing
                setTimeout(() => {
                    this.isProcessing = false;
                    this.showSuccess = true;
                    
                    // Save to data/submissions.csv (would be handled by server)
                    console.log('Payment submitted:', {
                        amount: 580,
                        cardNumber: '****' + this.cardNumber.slice(-4),
                        timestamp: new Date().toISOString()
                    });
                }, 2000);
            },
            
            closeSuccess() {
                // Would redirect to dashboard
                window.location.href = '/dashboard/';
            },
            
            toggleFaq(index) {
                this.$set(this.faqOpen, index, !this.faqOpen[index]);
            }
        }
    });
})();

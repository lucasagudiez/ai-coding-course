// Initialize Vue app
new Vue({
    el: '#app',
    data: {
        spotsRemaining: 3,
        progress: 25, // Start at 25% since they already filled name/email/cohort
        formData: {
            name: '',
            email: '',
            cohort: '',
            occupation: '',
            programmingExperience: '',
            aiTools: [],
            whyNow: '',
            goals: '',
            linkedin: '',
            portfolio: '',
            website: '',
            cvFile: null
        },
        isSubmitting: false,
        activePings: [],
        graduateCount: 847,
        employedCount: 94,
        avgSalary: 118
    },
    mounted() {
        // Get URL parameters (passed from landing page)
        const urlParams = new URLSearchParams(window.location.search);
        this.formData.cohort = urlParams.get('cohort') || 'February 2026';
        this.formData.name = urlParams.get('name') || '';
        this.formData.email = urlParams.get('email') || '';

        // Start social proof pings
        this.startSocialProof();

        // Initialize Stripe
        this.initializeStripe();
    },
    methods: {
        updateProgress() {
            // Calculate progress based on filled fields
            let completed = 3; // name, email, cohort (pre-filled)
            let total = 8; // Total required fields

            if (this.formData.occupation) completed++;
            if (this.formData.programmingExperience) completed++;
            if (this.formData.whyNow) completed++;
            if (this.formData.goals) completed++;
            if (this.formData.aiTools.length > 0) completed++;

            this.progress = Math.max(25, Math.round((completed / total) * 100));
        },

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.formData.cvFile = file;
            }
        },

        initializeStripe() {
            // Initialize Stripe (placeholder - you'd need actual Stripe keys)
            const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
            const elements = stripe.elements();
            const cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#fff',
                        '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    }
                }
            });
            cardElement.mount('#card-element');

            // Handle errors
            cardElement.addEventListener('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });

            this.stripe = stripe;
            this.cardElement = cardElement;
        },

        async submitApplication() {
            if (this.isSubmitting) return;

            this.isSubmitting = true;

            try {
                // Create payment method
                const { paymentMethod, error } = await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.cardElement,
                    billing_details: {
                        name: this.formData.name,
                        email: this.formData.email
                    }
                });

                if (error) {
                    throw new Error(error.message);
                }

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
                        paymentMethodId: paymentMethod.id,
                        amount: 10 // $10 application fee
                    })
                });

                if (!response.ok) {
                    throw new Error('Application submission failed');
                }

                const result = await response.json();

                // Redirect to evaluation page with query params
                window.location.href = `/evaluation/?name=${encodeURIComponent(this.formData.name)}&cohort=${encodeURIComponent(this.formData.cohort)}`;

            } catch (error) {
                alert('Error: ' + error.message);
                this.isSubmitting = false;
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
        }
    }
});

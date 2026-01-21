// Adava University Application Form - Vue.js App
new Vue({
    el: '#app',
    data: {
        spotsRemaining: 3,
        formData: {
            name: '',
            email: '',
            phone: '',
            occupation: '',
            experience: '',
            aiTools: [],
            goal: '',
            why: '',
            cardNumber: '',
            expiry: '',
            cvc: ''
        }
    },
    mounted() {
        console.log('Application form loaded');
        this.loadFromURL();
    },
    methods: {
        loadFromURL() {
            // Get params from URL (from landing page)
            const params = new URLSearchParams(window.location.search);
            if (params.get('name')) this.formData.name = params.get('name');
            if (params.get('email')) this.formData.email = params.get('email');
            if (params.get('cohort')) {
                // Store cohort for later if needed
                this.selectedCohort = params.get('cohort');
            }
        },
        submitApplication() {
            console.log('Submitting application:', this.formData);
            
            // Basic validation
            if (!this.formData.name || !this.formData.email) {
                alert('Please fill out all required fields');
                return;
            }
            
            // Here we would normally send to backend
            // For now, just show success message
            alert('Application submitted! Redirecting to evaluation...');
            
            // Redirect to evaluation page with data
            const params = new URLSearchParams({
                name: this.formData.name,
                email: this.formData.email,
                occupation: this.formData.occupation,
                experience: this.formData.experience,
                goal: this.formData.goal
            });
            
            window.location.href = `../evaluation/?${params.toString()}`;
        }
    }
});

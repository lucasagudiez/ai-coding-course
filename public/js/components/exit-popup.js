// Exit Popup Component
// Reusable exit intent popup with page-specific content

const ExitPopupComponent = {
    props: {
        content: {
            type: Object,
            required: true,
            // Structure:
            // {
            //   headline: "Title text",
            //   description: "Description or testimonial",
            //   bullets: ["Bullet 1", "Bullet 2", "Bullet 3"],
            //   cta: "Button text"
            // }
        }
    },
    data() {
        return {
            show: false,
            triggered: false
        };
    },
    template: `
        <div v-if="show" class="exit-intent-modal" @click.self="close">
            <div class="exit-modal-content">
                <button class="exit-modal-close" @click="close" aria-label="Close popup">
                    ×
                </button>
                
                <h2 v-html="content.headline"></h2>
                
                <p class="exit-description" v-html="content.description"></p>
                
                <div class="exit-bullets" v-if="content.bullets && content.bullets.length">
                    <ul>
                        <li v-for="(bullet, index) in content.bullets" :key="index">
                            {{ bullet }}
                        </li>
                    </ul>
                </div>
                
                <button class="exit-cta-btn" @click="close">
                    {{ content.cta }}
                </button>
            </div>
        </div>
    `,
    mounted() {
        // Only show once per session
        if (!sessionStorage.getItem('exitPopupSeen')) {
            document.addEventListener('mouseleave', this.handleMouseLeave);
            
            // Also trigger on mobile after 30 seconds of inactivity
            if (window.innerWidth <= 768) {
                this.inactivityTimer = setTimeout(() => {
                    if (!this.triggered) {
                        this.showPopup();
                    }
                }, 30000);
            }
        }
    },
    beforeUnmount() {
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
    },
    methods: {
        handleMouseLeave(e) {
            // Trigger when mouse leaves through top of window (user going to close tab/browser)
            if (e.clientY <= 0 && !this.triggered) {
                this.showPopup();
            }
        },
        showPopup() {
            this.show = true;
            this.triggered = true;
            sessionStorage.setItem('exitPopupSeen', 'true');
        },
        close() {
            this.show = false;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExitPopupComponent;
}

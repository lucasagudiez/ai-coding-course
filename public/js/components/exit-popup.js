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
    // Template loaded from exit-popup.html via component loader
    template: null,
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

// Load template from HTML file
(async function loadExitPopupTemplate() {
    try {
        const response = await fetch('/components/templates/exit-popup.html');
        const html = await response.text();
        
        // Extract template between markers
        const startMarker = '<!-- START_COMPONENT -->';
        const endMarker = '<!-- END_COMPONENT -->';
        const startIndex = html.indexOf(startMarker);
        const endIndex = html.indexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
            ExitPopupComponent.template = html
                .substring(startIndex + startMarker.length, endIndex)
                .trim();
        }
    } catch (error) {
        console.error('Failed to load exit-popup template:', error);
    }
})();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExitPopupComponent;
}


/**
 * Vue Component Template Loader
 * Loads HTML templates from separate files and registers Vue components
 * This ensures proper separation: HTML in .html files, JS in .js files
 */

(function() {
    'use strict';

    // Component registry: maps component names to their template file paths
    const COMPONENT_REGISTRY = {
        'scarcity-bar': '/components/templates/scarcity-bar.html',
        'graduate-counter': '/components/templates/graduate-counter.html',
        'authority-logos': '/components/templates/authority-logos.html',
        'value-stack': '/components/templates/value-stack.html',
        'bonus-stack': '/components/templates/bonus-stack.html',
        'outcomes-section': '/components/templates/outcomes-section.html',
        'stats-banner': '/components/templates/stats-banner.html',
        'timeline-section': '/components/templates/timeline-section.html',
        'testimonial-carousel': '/components/templates/testimonial-carousel.html',
        'guarantee-badges': '/components/templates/guarantee-badges.html',
        'faq-section': '/components/templates/faq-section.html',
        'comparison-table': '/components/templates/comparison-table.html',
        'what-youll-build': '/components/templates/what-youll-build.html'
    };

    /**
     * Fetch HTML template from file
     */
    async function fetchTemplate(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${url}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error loading template ${url}:`, error);
            return '[Component Load Error]';
        }
    }

    /**
     * Load all component templates and register with Vue
     */
    async function loadAllComponents() {
        const componentNames = Object.keys(COMPONENT_REGISTRY);
        const promises = componentNames.map(async (name) => {
            const templateUrl = COMPONENT_REGISTRY[name];
            const template = await fetchTemplate(templateUrl);
            
            // Register the Vue component with the fetched template
            // Props and methods are defined inline (minimal JS)
            const componentConfig = getComponentConfig(name, template);
            Vue.component(name, componentConfig);
        });

        await Promise.all(promises);
        console.log(`✅ Loaded ${componentNames.length} Vue components from HTML templates`);
    }

    /**
     * Get component configuration (props, data, methods)
     * Template is loaded externally, only JS logic here
     */
    function getComponentConfig(name, template) {
        const configs = {
            'testimonial-carousel': {
                template: template,
                data() {
                    return {
                        currentIndex: 0,
                        testimonials: [
                            {
                                name: "Sarah Chen",
                                title: "Former Marketing Manager → Software Engineer at Stripe",
                                quote: "I went from zero coding knowledge to landing a $140K job in 4 months. The AI tools made it possible.",
                                salary: "$140K",
                                image: "../images/avatars/sarah.jpg"
                            },
                            {
                                name: "Michael Rodriguez",
                                title: "Teacher → Full-Stack Developer at Shopify",
                                quote: "Best investment I ever made. The program pays for itself in the first week of work.",
                                salary: "$125K",
                                image: "../images/avatars/michael.jpg"
                            },
                            {
                                name: "Amanda Liu",
                                title: "Nurse → AI Engineer at OpenAI",
                                quote: "I built 3 portfolio projects in 10 days. Employers were blown away.",
                                salary: "$165K",
                                image: "../images/avatars/amanda.jpg"
                            },
                            {
                                name: "David Park",
                                title: "Sales Rep → Backend Engineer at Uber",
                                quote: "The mentorship was incredible. Real engineers from FAANG companies reviewed my code.",
                                salary: "$135K",
                                image: "../images/avatars/david.jpg"
                            },
                            {
                                name: "Elena Popov",
                                title: "Accountant → Data Scientist at Netflix",
                                quote: "I was skeptical about the 10-day timeline, but it actually works. I'm now making 3x my old salary.",
                                salary: "$155K",
                                image: "../images/avatars/elena.jpg"
                            }
                        ]
                    };
                },
                methods: {
                    nextTestimonial() {
                        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
                    },
                    prevTestimonial() {
                        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
                    }
                }
            },
            
            'faq-section': {
                template: template,
                props: ['faqOpen', 'toggleFaq'],
                data() {
                    return {
                        faqs: [
                            {
                                question: "Do I need any coding experience?",
                                answer: "No! 67% of our graduates had zero coding experience. The AI tools level the playing field. If you can use a computer, you can do this."
                            },
                            {
                                question: "What if I can't complete it in 10 days?",
                                answer: "You get lifetime access to all materials, so you can go at your own pace. Most students complete the core program in 10-14 days."
                            },
                            {
                                question: "Is this really worth $590?",
                                answer: "Our graduates land jobs averaging $94K/year. The ROI is 159x in the first year alone. Plus, we offer a 100% money-back guarantee."
                            },
                            {
                                question: "What makes this different from other bootcamps?",
                                answer: "We're AI-first. You'll use ChatGPT, GitHub Copilot, and Claude to code 10x faster. Traditional bootcamps cost $15K+ and take 6 months. We're $590 and 10 days."
                            },
                            {
                                question: "Will I really get a job after this?",
                                answer: "87% of our graduates get offers within 6 months. We provide lifetime job board access, resume reviews, and interview prep. You'll have 3 portfolio projects to show employers."
                            }
                        ]
                    };
                }
            },
            
            'scarcity-bar': {
                template: template,
                data() {
                    return {
                        spotsRemaining: 3,
                        totalSpots: 20
                    };
                }
            },

            'graduate-counter': {
                template: template,
                data() {
                    return {
                        graduates: 500,
                        placementRate: 87,
                        avgSalary: '94K'
                    };
                }
            },

            'authority-logos': {
                template: template
            },

            'value-stack': {
                template: template
            },

            'bonus-stack': {
                template: template
            },

            'outcomes-section': {
                template: template
            },

            'stats-banner': {
                template: template
            },

            'timeline-section': {
                template: template
            },

            'guarantee-badges': {
                template: template
            },

            'comparison-table': {
                template: template
            },

            'what-youll-build': {
                template: template
            }
        };

        return configs[name] || { template: template };
    }

    // Export for global use
    window.loadVueComponents = loadAllComponents;
})();

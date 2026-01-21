// Vue Component Definitions
// These must be registered BEFORE the main Vue instance

// Scarcity Bar Component
Vue.component('scarcity-bar', {
    template: `
        <div class="scarcity-bar">
            <div class="scarcity-content">
                <strong><i class="fas fa-users"></i> {{ spotsRemaining }} Seats Remaining in February Cohort</strong>
                <small>Applications reviewed within 48 hours</small>
            </div>
            <div class="seats-visual">
                <div class="seat-grid">
                    <div class="seat taken" v-for="n in 27" :key="'taken-' + n"></div>
                    <div class="seat available" v-for="n in spotsRemaining" :key="'available-' + n"></div>
                </div>
                <p class="seats-label">{{ spotsRemaining }} of 30 seats left</p>
            </div>
        </div>
    `,
    props: ['spotsRemaining']
});

// Graduate Counter Component
Vue.component('graduate-counter', {
    template: `
        <div class="graduate-counter">
            <div class="counter-stat">
                <div class="counter-number">{{ graduateCount }}+</div>
                <div class="counter-label">Students Graduated</div>
            </div>
            <div class="counter-stat">
                <div class="counter-number">{{ employedCount }}%</div>
                <div class="counter-label">Now Employed in Tech</div>
            </div>
            <div class="counter-stat">
                <div class="counter-number">\${{ avgSalary }}K</div>
                <div class="counter-label">Average Starting Salary</div>
            </div>
        </div>
    `,
    props: ['graduateCount', 'employedCount', 'avgSalary']
});

// Authority Logos Component
Vue.component('authority-logos', {
    template: `
        <div class="authority-logos">
            <p class="authority-label">Trusted by professionals from:</p>
            <div class="logo-grid">
                <div class="authority-logo">Google</div>
                <div class="authority-logo">Apple</div>
                <div class="authority-logo">Meta</div>
                <div class="authority-logo">Amazon</div>
                <div class="authority-logo">Microsoft</div>
                <div class="authority-logo">Tesla</div>
            </div>
        </div>
    `
});

// Value Stack Component
Vue.component('value-stack', {
    template: `
        <div class="value-stack">
            <h3><i class="fas fa-graduation-cap"></i> Program Components & Market Value</h3>
            <div class="value-item">
                <span>10-Day Intensive: Build Apps with AI</span>
                <span class="value-price">~$8,000</span>
            </div>
            <div class="value-item">
                <span>Instructor Support & Code Reviews</span>
                <span class="value-price">~$3,000</span>
            </div>
            <div class="value-item">
                <span>3 Portfolio Projects</span>
                <span class="value-price">~$2,500</span>
            </div>
            <div class="value-item">
                <span>Alumni Network + Job Board + Weekly Q&A</span>
                <span class="value-price">~$2,000</span>
            </div>
            <div class="value-item">
                <span>Lifetime Access to All Updates</span>
                <span class="value-price">~$1,500</span>
            </div>
            <div class="value-total">
                <div><span class="strike">Combined Market Value: ~$17,000</span></div>
                <div class="big-number">Program Tuition: $590</div>
                <small style="color: rgba(255, 255, 255, 0.6);">AI-powered approach makes this possible at 97% lower cost</small>
            </div>
        </div>
    `
});

// Testimonials Component
Vue.component('testimonial-carousel', {
    template: `
        <div class="testimonial-carousel">
            <div class="testimonial-card">
                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                <p class="testimonial-text">"Went from zero coding knowledge to building AI apps in 10 days. Now earning $145K at Tesla."</p>
                <div class="testimonial-author">
                    <strong>Marcus T.</strong>
                    <span>Mechanical Engineer → AI Developer</span>
                </div>
            </div>
            <div class="testimonial-card">
                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                <p class="testimonial-text">"Best investment I ever made. The AI tools alone saved me 200+ hours on my freelance projects."</p>
                <div class="testimonial-author">
                    <strong>Sarah K.</strong>
                    <span>Doctor → Med Tech Founder</span>
                </div>
            </div>
            <div class="testimonial-card">
                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                <p class="testimonial-text">"I was skeptical about the $590, but recovered it in my first week freelancing. Now it feels like I stole it."</p>
                <div class="testimonial-author">
                    <strong>Alex R.</strong>
                    <span>Marketing → Full Stack Developer</span>
                </div>
            </div>
        </div>
    `
});

// Guarantee Badges Component
Vue.component('guarantee-badges', {
    template: `
        <div class="guarantee-badge-container">
            <div class="guarantee-badge">
                <div class="badge-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="badge-content">
                    <h4>100% Money Back Guarantee</h4>
                    <p>Not admitted? Automatic refund. No questions asked.</p>
                </div>
            </div>
            <div class="guarantee-badge">
                <div class="badge-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="badge-content">
                    <h4>48 Hour Response Time</h4>
                    <p>Fast review. Most applicants hear back within 24 hours.</p>
                </div>
            </div>
        </div>
    `
});

// FAQ Component
Vue.component('faq-section', {
    template: `
        <div class="faq-section">
            <h3><i class="fas fa-question-circle"></i> Common Questions</h3>
            <div class="faq-item" @click="toggleFaq(0)">
                <div class="faq-question">
                    <span>Is the $10 really refundable?</span>
                    <i class="fas" :class="faqOpen[0] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" v-show="faqOpen[0]">
                    Yes. If not admitted, your $10 is automatically refunded within 48 hours.
                </div>
            </div>
            <div class="faq-item" @click="toggleFaq(1)">
                <div class="faq-question">
                    <span>What if I'm accepted but change my mind?</span>
                    <i class="fas" :class="faqOpen[1] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" v-show="faqOpen[1]">
                    No obligation. The $590 is only charged if you confirm your spot.
                </div>
            </div>
            <div class="faq-item" @click="toggleFaq(2)">
                <div class="faq-question">
                    <span>Do I need coding experience?</span>
                    <i class="fas" :class="faqOpen[2] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" v-show="faqOpen[2]">
                    No. 60% of graduates started from zero. The program is designed for all levels.
                </div>
            </div>
            <div class="faq-item" @click="toggleFaq(3)">
                <div class="faq-question">
                    <span>What's the time commitment?</span>
                    <i class="fas" :class="faqOpen[3] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" v-show="faqOpen[3]">
                    2 hours per day for 10 days. Live sessions are recorded for flexibility.
                </div>
            </div>
        </div>
    `,
    props: ['faqOpen', 'toggleFaq']
});

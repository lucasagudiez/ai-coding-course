# LLM Personalization System
## Configuration for AI-Powered Applicant Evaluation

**NOTE:** This file contains prompt templates and personalization logic.  
**TODO:** Add API keys later via environment variables.

---

## 1. EVALUATION PAGE PERSONALIZATION

### A) "Why You're a Great Fit" Generator

**Purpose:** Generate 3 specific, personalized reasons why applicant is perfect for the program

**Input Data:**
```javascript
{
  name: "Jane Smith",
  occupation: "Medical Doctor",
  codingExperience: "none",
  aiTools: ["none"],
  primaryGoal: "build-product",
  whyNow: "I want to build a health records system for my clinic...",
  cohort: "February 2026"
}
```

**LLM Prompt Template:**
```
You are an enthusiastic admissions counselor for Adava University's AI Coding Program.

Applicant Profile:
- Name: {{name}}
- Current Role: {{occupation}}
- Coding Experience: {{codingExperience}}
- AI Tools Used: {{aiTools}}
- Primary Goal: {{primaryGoal}}
- Why Applying Now: {{whyNow}}

Generate 3 specific, personalized reasons why {{name}} is a PERFECT fit for our 10-day AI coding program.

Requirements:
1. Reference their SPECIFIC background/occupation
2. Connect to what they'll learn (AI-powered coding, no syntax needed)
3. Show how it aligns with their stated goal
4. Be enthusiastic but authentic (not over-the-top salesy)
5. Keep each reason to 1-2 sentences max

Format as JSON:
{
  "reasons": [
    "Reason 1 text here",
    "Reason 2 text here",
    "Reason 3 text here"
  ]
}

Examples:
- If doctor: "Your medical background is PERFECT—you'll learn to build HIPAA-compliant systems"
- If teacher: "You already know how to break down complex topics—AI coding will feel natural"
- If beginner: "Starting fresh is actually an advantage—no bad coding habits to unlearn"
```

**Expected Output:**
```json
{
  "reasons": [
    "Your medical background is PERFECT for our AI development approach—you'll learn to build HIPAA-compliant health record systems using AI, something doctors rarely get to do!",
    "You mentioned wanting to build a product for your clinic—we'll teach you to build exactly that, and we have 2 doctors in your cohort with similar goals.",
    "Starting with zero coding experience is actually ideal—you'll learn the AI-first approach from day one, without any outdated syntax to unlearn."
  ]
}
```

---

### B) Matched Testimonial Generator

**Purpose:** Create a believable testimonial from a graduate with similar background

**LLM Prompt Template:**
```
Based on this applicant's profile, create a realistic testimonial from a past Adava graduate with a SIMILAR background.

Applicant Profile:
- Occupation: {{occupation}}
- Goal: {{primaryGoal}}
- Experience: {{codingExperience}}

Create a testimonial that:
1. Has a similar starting point (e.g., if applicant is doctor, graduate was in healthcare)
2. Shows realistic outcome (specific job title, recognizable company, salary range)
3. Mentions specific AI tools or projects
4. Feels authentic, not generic or overly promotional
5. Is brief (2-3 sentences max)

Format as JSON:
{
  "name": "FirstName L.",
  "background": "Previous profession",
  "afterAdava": "Current role at Company ($XXK)",
  "quote": "1-2 sentence testimonial"
}

Industry Mapping:
- Medical → Healthcare tech companies (Epic Systems, Cerner, Meditech)
- Education → EdTech (Khan Academy, Coursera, Duolingo)
- Finance → FinTech (Stripe, Plaid, Robinhood)
- Marketing → MarTech (HubSpot, Mailchimp, Salesforce)
- Engineering → Tech companies (Tesla, SpaceX, Amazon)
- etc.

Salary Ranges (Realistic):
- Career changers: $85K-$110K
- Already in tech: $110K-$145K
- Senior professionals: $120K-$165K
```

**Expected Output:**
```json
{
  "name": "Sarah K.",
  "background": "Emergency Room Physician",
  "afterAdava": "Health Tech Developer at Epic Systems ($118K)",
  "quote": "I went from treating patients to building the software that helps doctors save lives. The AI coding approach made it possible in just 10 days—no CS degree needed."
}
```

---

### C) Personalized Project Preview

**Purpose:** Show them 2-3 projects specifically relevant to their field

**Implementation:** Simple mapping (no LLM needed for MVP)

```javascript
const projectsByField = {
  medical: [
    "HIPAA-Compliant Patient Records Dashboard",
    "AI Diagnostic Assistant",
    "Medical Image Analysis Tool"
  ],
  healthcare: [
    "Health Data Analytics Platform",
    "Telemedicine Scheduling System",
    "Patient Engagement App"
  ],
  education: [
    "Student Progress Tracker",
    "AI Tutoring Chatbot",
    "Automated Grading System"
  ],
  teaching: [
    "Lesson Plan Generator",
    "Student Assessment Dashboard",
    "AI Teaching Assistant"
  ],
  marketing: [
    "Social Media Analytics Tool",
    "AI Content Generator",
    "Customer Segmentation Dashboard"
  ],
  finance: [
    "Stock Analysis Dashboard",
    "Budget Tracking App",
    "AI Trading Bot"
  ],
  engineering: [
    "Project Management Dashboard",
    "IoT Data Visualization",
    "Automation Workflow Builder"
  ],
  business: [
    "CRM Dashboard",
    "Sales Analytics Tool",
    "Business Intelligence Platform"
  ],
  default: [
    "E-Commerce Platform with Payments",
    "AI Chatbot with Custom Training",
    "Analytics Dashboard with Real-Time Data"
  ]
};

// Usage:
function getRelevantProjects(occupation) {
  const normalized = occupation.toLowerCase();
  
  if (normalized.includes('doctor') || normalized.includes('physician') || normalized.includes('medical')) {
    return projectsByField.medical;
  }
  if (normalized.includes('teacher') || normalized.includes('professor') || normalized.includes('education')) {
    return projectsByField.education;
  }
  if (normalized.includes('marketing')) {
    return projectsByField.marketing;
  }
  // ... etc
  
  return projectsByField.default;
}
```

---

## 2. RESERVATION PAGE PERSONALIZATION

### A) Welcome Message

**Simple Template (No LLM):**
```html
<div class="personal-welcome">
  <h2>Welcome back, {{name}}!</h2>
  <p>Based on your background as a <strong>{{occupation}}</strong> and your goal to <strong>{{primaryGoal}}</strong>, here's everything included in your program...</p>
</div>
```

### B) Field-Specific Bonuses

**LLM Prompt Template:**
```
Generate 3 exclusive bonuses specifically valuable for this applicant's field.

Applicant:
- Occupation: {{occupation}}
- Goal: {{primaryGoal}}

Create bonuses that:
1. Are specific to their industry/field
2. Have realistic dollar values ($99-$299 each)
3. Sound professional and valuable
4. Connect to what they want to achieve

Format as JSON:
{
  "bonuses": [
    {
      "title": "Bonus title",
      "value": 299,
      "description": "What it includes"
    },
    ...
  ]
}

Examples:
- Doctor: "Medical AI Templates Pack" - Pre-built templates for healthcare apps
- Teacher: "EdTech Starter Kit" - Lesson planning and grading automation templates
- Marketer: "MarTech Integration Library" - Connect to HubSpot, Mailchimp, etc.
```

**Expected Output:**
```json
{
  "bonuses": [
    {
      "title": "Healthcare AI Templates Pack",
      "value": 299,
      "description": "15 pre-built templates for medical apps including patient records, appointment scheduling, and data analytics dashboards"
    },
    {
      "title": "HIPAA Compliance Checklist",
      "value": 149,
      "description": "Complete guide to building healthcare software that meets all regulatory requirements"
    },
    {
      "title": "Medical Alumni Network Access",
      "value": 199,
      "description": "Connect with 50+ doctors and healthcare professionals who completed Adava and now work in health tech"
    }
  ]
}
```

---

## 3. FALLBACK STRATEGIES

### If LLM API Fails or Takes Too Long:

**Evaluation Page Fallbacks:**
```javascript
const fallbackReasons = {
  beginner: [
    "Your fresh perspective is actually an advantage—you'll learn the AI-first approach from day one",
    "Starting without coding baggage means you'll adopt AI tools faster than experienced developers",
    "We've seen complete beginners become job-ready in 10 days using our AI-powered method"
  ],
  intermediate: [
    "Your existing foundation will accelerate dramatically with AI coding tools",
    "You'll learn to build in days what used to take months with traditional coding",
    "Combining your experience with AI tools puts you ahead of 95% of developers"
  ],
  advanced: [
    "Your professional experience means you'll immediately see how AI 10X's your productivity",
    "Senior developers using our AI approach report 5-8X faster development speed",
    "You'll learn to architect complex systems using AI as your coding partner"
  ]
};

const fallbackTestimonial = {
  name: "Alex R.",
  background: "Career Changer",
  afterAdava: "Full-Stack Developer ($94K)",
  quote: "I was skeptical about learning to code in 10 days, but the AI tools made it possible. Now I'm building production apps and loving my new career."
};
```

---

## 4. API INTEGRATION SKELETON

**File:** `public/js/llm-service.js`

```javascript
// TODO: Add API keys via environment variables
const LLM_CONFIG = {
  provider: 'openai', // or 'anthropic'
  model: 'gpt-4',
  apiKey: process.env.LLM_API_KEY, // Set via environment
  maxTokens: 500,
  temperature: 0.7
};

class LLMPersonalizationService {
  async generateFitReasons(applicantData) {
    // TODO: Implement after API keys are provided
    // For now, return fallback
    return this.getFallbackReasons(applicantData);
  }

  async generateMatchedTestimonial(applicantData) {
    // TODO: Implement after API keys are provided
    return this.getFallbackTestimonial(applicantData);
  }

  async generateFieldBonuses(applicantData) {
    // TODO: Implement after API keys are provided
    return this.getFallbackBonuses(applicantData);
  }

  // Fallback methods
  getFallbackReasons(data) {
    const experience = data.codingExperience || 'beginner';
    return fallbackReasons[experience] || fallbackReasons.beginner;
  }

  getFallbackTestimonial(data) {
    return fallbackTestimonial;
  }

  getFallbackBonuses(data) {
    return [
      { title: "Lifetime Community Access", value: 299, description: "Private Slack with 500+ alumni" },
      { title: "All Course Recordings", value: 199, description: "Lifetime access to lectures and workshops" },
      { title: "Premium Code Templates", value: 149, description: "50+ production-ready starter kits" }
    ];
  }
}

export default new LLMPersonalizationService();
```

---

## 5. TESTING PLAN

### Manual Testing (Before LLM Integration):
1. Fill out application with various profiles:
   - Doctor wanting to build product
   - Teacher wanting career change
   - Engineer wanting to upskill
   - Complete beginner wanting job

2. Verify fallbacks work correctly
3. Check that project matching is accurate
4. Ensure UI looks good with all content

### After LLM Integration:
1. Test with real API calls
2. Verify quality of generated content
3. Check response times (< 2 seconds ideal)
4. Test error handling if API fails
5. Monitor API costs per applicant

---

## 6. COST ESTIMATION

**Per Applicant (with LLM):**
- 3 API calls (fit reasons, testimonial, bonuses)
- ~1,500 tokens total
- GPT-4: ~$0.03 per applicant
- GPT-3.5-turbo: ~$0.003 per applicant

**Recommended:** Start with GPT-3.5-turbo for cost efficiency, upgrade to GPT-4 if quality issues.

**Monthly Cost (100 applicants):**
- GPT-3.5: ~$0.30/month
- GPT-4: ~$3.00/month

---

## NEXT STEPS:

1. ✅ Create prompt templates (DONE)
2. ⏳ Update evaluation page HTML structure
3. ⏳ Update reservation page HTML structure  
4. ⏳ Implement fallback system
5. ⏳ Test with mock data
6. ⏳ Wait for API keys from user
7. ⏳ Integrate real LLM calls
8. ⏳ Deploy and monitor

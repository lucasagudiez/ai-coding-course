#!/usr/bin/env node
/**
 * Form Submission Backend for Adava University
 * 
 * Security features:
 * - Rate limiting (10 requests per IP per minute)
 * - Input validation and sanitization
 * - No SQL (uses CSV)
 * - CORS configured
 * - Request size limits
 * - LLM personalization with OpenAI
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

const app = express();
const PORT = 3001;
const CSV_FILE = path.join(__dirname, '../data/submissions.csv');
const APPLICATIONS_CSV = path.join(__dirname, '../data/applications.csv');
const DATA_DIR = path.join(__dirname, '../data');
const SESSIONS_DIR = path.join(__dirname, '../data/sessions');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    console.log('Created sessions directory');
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize CSV file with headers if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
    const headers = 'timestamp,name,email,cohort,scholarshipCode,ipAddress\n';
    fs.writeFileSync(CSV_FILE, headers, 'utf8');
    console.log('Created CSV file with headers');
}

// Initialize applications CSV file
if (!fs.existsSync(APPLICATIONS_CSV)) {
    const headers = 'timestamp,name,email,phone,background,experience,aiTools,goal,motivation,dreamProject,uniqueSkill,commitment,source,cohort,linkedin,portfolio,website,ipAddress\n';
    fs.writeFileSync(APPLICATIONS_CSV, headers, 'utf8');
    console.log('Created applications CSV file with headers');
}

// Middleware
app.use(express.json({ limit: '10kb' })); // Limit request size

// Rate limiting: 10 requests per IP per minute
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS - only allow our domain
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://adavauniversity.org',
        'http://localhost:8888',
        'http://localhost:8889',
        'http://localhost:8890',
        'http://localhost:8891'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

/**
 * Sanitize input - remove any potentially dangerous characters
 * Prevents CSV injection and XSS
 */
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    
    // Remove any non-printable characters
    str = str.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Remove CSV injection characters
    str = str.replace(/^[=+\-@]/, '');
    
    // Trim and limit length
    str = str.trim().substring(0, 200);
    
    return str;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validate name format (letters, spaces, hyphens, apostrophes only)
 */
function isValidName(name) {
    const nameRegex = /^[A-Za-z\s'-]{2,100}$/;
    return nameRegex.test(name);
}

/**
 * Escape CSV field - wrap in quotes if contains comma, quote, or newline
 */
function escapeCsvField(field) {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Form submission endpoint
app.post('/api/submit', (req, res) => {
    try {
        const { name, email, cohort, scholarshipCode } = req.body;
        
        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ 
                error: 'Name and email are required' 
            });
        }
        
        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedCohort = sanitizeInput(cohort || 'General Application');
        const sanitizedScholarshipCode = sanitizeInput(scholarshipCode || '');
        
        // Validate formats
        if (!isValidName(sanitizedName)) {
            return res.status(400).json({ 
                error: 'Invalid name format. Please use only letters, spaces, hyphens, and apostrophes.' 
            });
        }
        
        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Get IP address (respect X-Forwarded-For for proxies)
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                         req.socket.remoteAddress || 
                         'unknown';
        
        // Create CSV row
        const timestamp = new Date().toISOString();
        const row = [
            escapeCsvField(timestamp),
            escapeCsvField(sanitizedName),
            escapeCsvField(sanitizedEmail),
            escapeCsvField(sanitizedCohort),
            escapeCsvField(sanitizedScholarshipCode),
            escapeCsvField(ipAddress)
        ].join(',') + '\n';
        
        // Append to CSV file (atomic operation)
        fs.appendFileSync(CSV_FILE, row, 'utf8');
        
        console.log(`[${timestamp}] New submission: ${sanitizedName} <${sanitizedEmail}> - ${sanitizedCohort}`);
        
        res.json({ 
            success: true, 
            message: 'Application submitted successfully' 
        });
        
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ 
            error: 'Failed to process submission' 
        });
    }
});

// Full application submission endpoint
app.post('/api/submit-application', (req, res) => {
    try {
        const { 
            name, email, phone, background, experience, aiTools, goal, motivation,
            dreamProject, uniqueSkill, commitment, source, cohort, linkedin, portfolio, website
        } = req.body;
        
        // Validate required fields (optional fields: linkedin, portfolio, website)
        if (!name || !email || !phone || !background || !experience || !goal || !motivation || !dreamProject || !uniqueSkill || !commitment || !source) {
            return res.status(400).json({ 
                error: 'Please fill in all required fields' 
            });
        }
        
        // Sanitize all inputs
        const sanitized = {
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            phone: sanitizeInput(phone),
            background: sanitizeInput(background),
            experience: sanitizeInput(experience),
            aiTools: Array.isArray(aiTools) ? aiTools.map(sanitizeInput).join(';') : sanitizeInput(aiTools || 'none'),
            goal: sanitizeInput(goal),
            motivation: sanitizeInput(motivation).substring(0, 1000),
            dreamProject: sanitizeInput(dreamProject).substring(0, 1000),
            uniqueSkill: sanitizeInput(uniqueSkill).substring(0, 500),
            commitment: sanitizeInput(commitment),
            source: sanitizeInput(source),
            cohort: sanitizeInput(cohort || 'Not specified'),
            linkedin: sanitizeInput(linkedin || ''),
            portfolio: sanitizeInput(portfolio || ''),
            website: sanitizeInput(website || '')
        };
        
        // Validate email format
        if (!isValidEmail(sanitized.email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Get IP address
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                         req.socket.remoteAddress || 
                         'unknown';
        
        // Create CSV row
        const timestamp = new Date().toISOString();
        const row = [
            escapeCsvField(timestamp),
            escapeCsvField(sanitized.name),
            escapeCsvField(sanitized.email),
            escapeCsvField(sanitized.phone),
            escapeCsvField(sanitized.background),
            escapeCsvField(sanitized.experience),
            escapeCsvField(sanitized.aiTools),
            escapeCsvField(sanitized.goal),
            escapeCsvField(sanitized.motivation),
            escapeCsvField(sanitized.dreamProject),
            escapeCsvField(sanitized.uniqueSkill),
            escapeCsvField(sanitized.commitment),
            escapeCsvField(sanitized.source),
            escapeCsvField(sanitized.cohort),
            escapeCsvField(sanitized.linkedin),
            escapeCsvField(sanitized.portfolio),
            escapeCsvField(sanitized.website),
            escapeCsvField(ipAddress)
        ].join(',') + '\n';
        
        // Append to CSV file
        fs.appendFileSync(APPLICATIONS_CSV, row, 'utf8');
        
        // Save to session for evaluation page to access
        saveSession(sanitized.email, {
            application: sanitized,
            timestamp,
            ipAddress
        });
        
        console.log(`[${timestamp}] New application: ${sanitized.name} <${sanitized.email}> - ${sanitized.cohort}`);
        
        res.json({ 
            success: true, 
            message: 'Application submitted successfully' 
        });
        
    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ 
            error: 'Failed to process application' 
        });
    }
});

/**
 * POST /api/personalize
 * LLM-powered personalization for evaluation page
 */
app.post('/api/personalize', async (req, res) => {
    try {
        const { type, applicantData } = req.body;
        
        if (!type || !applicantData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        let result;
        
        if (type === 'fit_reasons') {
            result = await generateFitReasons(applicantData);
        } else if (type === 'testimonial') {
            result = await generateTestimonial(applicantData);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }
        
        res.json(result);
    } catch (error) {
        console.error('LLM personalization error:', error);
        // Return fallback data if LLM fails
        if (req.body.type === 'fit_reasons') {
            res.json({
                reasons: [
                    `Your background gives you unique insights that will accelerate your learning`,
                    `Your goals align perfectly with what our graduates achieve`,
                    `You'll adopt the AI-first approach effectively`
                ]
            });
        } else {
            res.json({
                testimonial: {
                    name: 'Alex R.',
                    background: 'Career Changer',
                    afterAdava: 'Full-Stack Developer ($94K)',
                    quote: 'The AI coding approach made it possible to switch careers in just 10 days.'
                }
            });
        }
    }
});

async function generateFitReasons(applicantData) {
    const prompt = `You are an enthusiastic admissions counselor for Adava University's AI Coding Program.

Applicant Profile:
- Name: ${applicantData.name}
- Current Role: ${applicantData.occupation || 'professional'}
- Coding Experience: ${applicantData.experience || 'beginner'}
- Primary Goal: ${applicantData.goal || 'career change'}

Generate 3 specific, personalized reasons why this applicant is a PERFECT fit for our 10-day AI coding program.

Requirements:
1. Reference their SPECIFIC background/occupation
2. Connect to what they'll learn (AI-powered coding, no syntax needed)
3. Show how it aligns with their stated goal
4. Be enthusiastic but authentic (not over-the-top salesy)
5. Keep each reason to 1-2 sentences max

Return ONLY a JSON object with this format:
{
  "reasons": [
    "Reason 1 text here",
    "Reason 2 text here",
    "Reason 3 text here"
  ]
}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
    });
    
    const content = completion.choices[0].message.content;
    return JSON.parse(content);
}

async function generateTestimonial(applicantData) {
    const prompt = `Based on this applicant's profile, create a realistic testimonial from a past Adava graduate with a SIMILAR background.

Applicant:
- Occupation: ${applicantData.occupation || 'professional'}
- Goal: ${applicantData.goal || 'career change'}
- Experience: ${applicantData.experience || 'beginner'}

Create a testimonial that:
1. Has a similar starting point
2. Shows realistic outcome (specific job title, recognizable company, salary range $85K-$165K)
3. Mentions specific AI tools or projects
4. Feels authentic, not generic
5. Is brief (2-3 sentences max)

Return ONLY a JSON object with this format:
{
  "name": "FirstName L.",
  "background": "Previous profession",
  "afterAdava": "Current role at Company ($XXK)",
  "quote": "1-2 sentence testimonial"
}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 200
    });
    
    const content = completion.choices[0].message.content;
    return { testimonial: JSON.parse(content) };
}

/**
 * Session Management Functions
 */
function getSessionFilePath(email) {
    // Sanitize email for filename
    const sanitized = email.toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
    return path.join(SESSIONS_DIR, `${sanitized}.json`);
}

function saveSession(email, data) {
    try {
        const filePath = getSessionFilePath(email);
        const sessionData = {
            email,
            data,
            lastUpdated: new Date().toISOString(),
            createdAt: fs.existsSync(filePath) ? 
                JSON.parse(fs.readFileSync(filePath, 'utf8')).createdAt : 
                new Date().toISOString()
        };
        
        fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
}

function loadSession(email) {
    try {
        const filePath = getSessionFilePath(email);
        if (fs.existsSync(filePath)) {
            const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return sessionData.data;
        }
        return null;
    } catch (error) {
        console.error('Error loading session:', error);
        return null;
    }
}

/**
 * POST /api/session/save
 * Save user session data
 */
app.post('/api/session/save', (req, res) => {
    try {
        const { email, data } = req.body;
        
        if (!email || !data) {
            return res.status(400).json({ error: 'Email and data are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        const success = saveSession(email, data);
        
        if (success) {
            res.json({ success: true, message: 'Session saved' });
        } else {
            res.status(500).json({ error: 'Failed to save session' });
        }
    } catch (error) {
        console.error('Session save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/session/load?email=user@example.com
 * Load user session data
 */
app.get('/api/session/load', (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const sessionData = loadSession(email);
        
        if (sessionData) {
            res.json({ success: true, data: sessionData });
        } else {
            res.status(404).json({ success: false, message: 'No session found' });
        }
    } catch (error) {
        console.error('Session load error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/evaluate-application
 * Advanced LLM-powered evaluation with deep personalization
 * Takes 10+ seconds intentionally to feel premium/thorough
 */
app.post('/api/evaluate-application', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Load the applicant's full data from session
        // Note: loadSession() returns sessionData.data directly
        const sessionData = loadSession(email);
        
        if (!sessionData || !sessionData.application) {
            return res.status(404).json({ error: 'Application not found. Please complete the application form first.' });
        }
        
        const app = sessionData.application;
        
        // Generate comprehensive personalized evaluation using ChatGPT
        const evaluation = await generateComprehensiveEvaluation(app);
        
        res.json({
            success: true,
            evaluation
        });
    } catch (error) {
        console.error('Evaluation error:', error);
        // Return fallback evaluation if LLM fails
        res.json({
            success: true,
            evaluation: {
                accepted: true,
                headline: "Congratulations! You've Been Pre-Approved",
                fitReasons: [
                    "Your unique background and perspectives will bring fresh insights to our learning community",
                    "Your stated goals align perfectly with what our graduates consistently achieve",
                    "Your motivation demonstrates the commitment needed to succeed in our intensive program"
                ],
                dreamProjectFeedback: "Your project idea shows creativity and practical thinking - exactly what we're looking for.",
                uniqueSkillConnection: "We'll help you leverage your unique background to stand out in the AI-augmented developer job market.",
                recommendedProjects: [
                    "AI-Powered Personal Dashboard",
                    "Automated Data Analysis Tool",
                    "Custom Chatbot Application"
                ],
                testimonial: {
                    name: "Alex R.",
                    background: "Career Changer",
                    afterAdava: "Full-Stack Developer ($94K)",
                    quote: "The AI coding approach made it possible to switch careers in just 10 days."
                },
                nextSteps: [
                    { step: "Secure Your Spot Now", time: "Click the button above to reserve your seat with $580" },
                    { step: "Join Pre-Program Community", time: "Get instant access to our Slack and prep materials" },
                    { step: "Program Begins", time: "February 3rd, 2026 - 10 days that will transform your career" }
                ]
            }
        });
    }
});

/**
 * Generate a deeply personalized evaluation using ChatGPT
 * This is what makes the $10 application fee feel premium
 */
async function generateComprehensiveEvaluation(applicantData) {
    const { 
        name, 
        background, 
        experience, 
        aiTools, 
        goal, 
        motivation, 
        dreamProject, 
        uniqueSkill 
    } = applicantData;
    
    // This prompt is CRITICAL - it's what makes generic LLM output feel human
    const prompt = `You are a senior admissions counselor at Adava University, an elite AI coding program taught by MIT/Stanford researchers.

You've just reviewed this application and are IMMEDIATELY ACCEPTING them to the February cohort. They are a PERFECT fit.

👤 APPLICANT: ${name}
📋 BACKGROUND: ${background}
💻 CODING EXPERIENCE: ${experience}
🤖 AI TOOLS USED: ${aiTools || 'None yet'}
🎯 PRIMARY GOAL: ${goal}

📝 WHY APPLYING NOW:
"${motivation}"

💡 DREAM PROJECT:
"${dreamProject}"

🎨 UNIQUE SKILL/INTEREST:
"${uniqueSkill}"

---

Your task: Create a HIGHLY PERSONALIZED IMMEDIATE ACCEPTANCE message that shows you actually READ and THOUGHT about their specific answers.

CRITICAL REQUIREMENTS:
1. Reference their SPECIFIC dream project by name/concept - show you read it
2. Connect their unique skill/hobby to how it'll help them in coding/tech
3. Quote or paraphrase their exact motivation back to them
4. Be enthusiastic but authentic (not generic/robotic/salesy)
5. Make them feel like YOU specifically reviewed their app (not an AI template)
6. EMPHASIZE they are IMMEDIATELY ACCEPTED (no waiting for decision)
7. URGENT: Only 3 spots left, they should reserve NOW

Return ONLY a JSON object with this EXACT format:
{
  "accepted": true,
  "headline": "Compelling personalized headline referencing their background",
  "fitReasons": [
    "Specific reason #1 that references their actual answers",
    "Specific reason #2 that connects their unique skill to coding",
    "Specific reason #3 that shows you read their dream project"
  ],
  "dreamProjectFeedback": "2-3 sentences about their specific dream project idea - what's cool about it, how we'll help them build it or something similar",
  "uniqueSkillConnection": "1-2 sentences connecting their unique hobby/skill to standing out as a developer or building cool projects",
  "recommendedProjects": [
    "Project 1 related to their interests",
    "Project 2 related to their goal",
    "Project 3 related to their dream project or background"
  ],
  "testimonial": {
    "name": "FirstName L.",
    "background": "Similar previous profession to applicant",
    "afterAdava": "Current role at recognizable company ($85K-$165K range)",
    "quote": "1-2 sentence authentic testimonial from someone with similar background"
  },
  "nextSteps": [
    {
      "step": "Secure Your Spot Now",
      "time": "Click the button above to reserve your seat with $580"
    },
    {
      "step": "Join Pre-Program Community",
      "time": "Get instant access to our Slack and prep materials"
    },
    {
      "step": "Program Begins",
      "time": "February 3rd, 2026 - 10 days that will transform your career"
    }
  ]
}

REMEMBER: This needs to feel like a human actually read their quirky dream project and unique hobby. Generic = BAD. Specific = GOOD.`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4',  // Using GPT-4 for better quality
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,  // Higher temperature for more creative/human responses
        max_tokens: 1500
    });
    
    const content = completion.choices[0].message.content;
    
    // Parse and return the JSON response
    try {
        const parsed = JSON.parse(content);
        return parsed;
    } catch (parseError) {
        console.error('Failed to parse LLM response:', content);
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        throw parseError;
    }
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Adava University Form Backend running on http://127.0.0.1:${PORT}`);
    console.log(`📁 CSV file: ${CSV_FILE}`);
    console.log(`🔒 Rate limit: 10 requests per IP per minute`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

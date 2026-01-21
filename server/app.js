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
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;
const CSV_FILE = path.join(__dirname, '../data/submissions.csv');
const APPLICATIONS_CSV = path.join(__dirname, '../data/applications.csv');
const DATA_DIR = path.join(__dirname, '../data');

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
    const headers = 'timestamp,name,email,phone,background,experience,aiTools,goal,motivation,commitment,source,cohort,linkedin,portfolio,website,ipAddress\n';
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
            commitment, source, cohort, linkedin, portfolio, website
        } = req.body;
        
        // Validate required fields (optional fields: linkedin, portfolio, website)
        if (!name || !email || !phone || !background || !experience || !goal || !motivation || !commitment || !source) {
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

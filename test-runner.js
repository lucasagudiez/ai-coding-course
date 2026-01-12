#!/usr/bin/env node
/**
 * Test Runner for AI Coding Course Landing Page
 * Run with: node test-runner.js
 */

const fs = require('fs');

const tests = {
    passed: [],
    failed: [],
    errors: []
};

function test(name, fn) {
    try {
        fn();
        tests.passed.push(name);
        console.log(`✓ ${name}`);
    } catch (e) {
        tests.failed.push(name);
        tests.errors.push({ name, error: e.message });
        console.error(`✗ ${name}: ${e.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

console.log('='.repeat(70));
console.log('RUNNING AUTOMATED TESTS');
console.log('='.repeat(70));
console.log();

// ============================================================================
// SECTION 1: FILE EXISTENCE TESTS
// ============================================================================
console.log('\n--- File Existence Tests ---');

test('index.html exists', () => {
    assert(fs.existsSync('index.html'), 'index.html is missing');
});

test('styles.css exists', () => {
    assert(fs.existsSync('styles.css'), 'styles.css is missing');
});

test('test-runner.js exists', () => {
    assert(fs.existsSync('test-runner.js'), 'test-runner.js is missing');
});

test('adava-website-reference.md exists', () => {
    assert(fs.existsSync('adava-website-reference.md'), 'adava-website-reference.md is missing');
});

// ============================================================================
// SECTION 2: HTML STRUCTURE TESTS
// ============================================================================
console.log('\n--- HTML Structure Tests ---');

test('index.html includes styles.css', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('href="styles.css"'), 'Missing styles.css link');
});

test('index.html has DOCTYPE', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('<!DOCTYPE html>'), 'Missing DOCTYPE');
});

test('index.html has viewport meta tag', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('viewport'), 'Missing viewport meta tag for responsive design');
});

test('index.html has page title', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('<title>'), 'Missing page title');
});

test('index.html has lang attribute', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('lang="en"'), 'Missing lang attribute for accessibility');
});

// ============================================================================
// SECTION 3: LANDING PAGE CONTENT TESTS
// ============================================================================
console.log('\n--- Landing Page Content Tests ---');

test('Page has main headline about programming in 10 days', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('10 Days') || html.includes('10 days'),
        'Missing main headline about 10 days'
    );
});

test('Page mentions AI coding/tools', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.toLowerCase().includes('ai') && html.toLowerCase().includes('coding'),
        'Missing AI coding mention'
    );
});

test('Page has apply/enroll CTA button', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('Apply Now') || html.includes('Enroll') || html.includes('apply-btn'),
        'Missing apply/enroll CTA'
    );
});

test('Page has form inputs for name and email', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('type="text"') || html.includes('name'), 'Missing name input');
    assert(html.includes('type="email"') || html.includes('email'), 'Missing email input');
});

test('Page mentions instructor credentials (universities)', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const hasUniversities = 
        html.includes('MIT') || 
        html.includes('Stanford') || 
        html.includes('Harvard') ||
        html.includes('Oxford') ||
        html.includes('Cambridge');
    assert(hasUniversities, 'Missing university credentials');
});

test('Page mentions instructor credentials (companies)', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const hasCompanies = 
        html.includes('Google') || 
        html.includes('Apple') || 
        html.includes('Meta') ||
        html.includes('Amazon') ||
        html.includes('Microsoft');
    assert(hasCompanies, 'Missing FAANG company credentials');
});

// ============================================================================
// SECTION 4: INSTRUCTOR SECTION TESTS
// ============================================================================
console.log('\n--- Instructor Section Tests ---');

test('Page has instructors section', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('Instructor') || html.includes('instructor'),
        'Missing instructors section'
    );
});

test('Instructor cards have university affiliations', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const universities = ['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'];
    const foundUniversities = universities.filter(u => html.includes(u));
    assert(foundUniversities.length >= 3, `Only ${foundUniversities.length} universities mentioned, need at least 3`);
});

test('Instructor cards have company experience (ex-FAANG)', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const companies = ['Google', 'Apple', 'Meta', 'Amazon', 'Microsoft', 'OpenAI'];
    const foundCompanies = companies.filter(c => html.includes(c) || html.includes(`Ex-${c}`) || html.includes(`ex-${c}`));
    assert(foundCompanies.length >= 3, `Only ${foundCompanies.length} FAANG companies mentioned, need at least 3`);
});

// ============================================================================
// SECTION 5: TESTIMONIALS SECTION TESTS
// ============================================================================
console.log('\n--- Testimonials Section Tests ---');

test('Page has testimonials/results section', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('testimonial') || html.includes('Results') || html.includes('Students'),
        'Missing testimonials section'
    );
});

test('Testimonials include salary information', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('$') && (html.includes('/year') || html.includes('K/year')),
        'Missing salary information in testimonials'
    );
});

test('Testimonials have believable backgrounds (engineering, medicine, math)', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const backgrounds = [
        'Engineer', 'Engineering', 
        'MD', 'Physician', 'Medicine', 'Doctor',
        'Math', 'Mathematics', 'PhD',
        'Biology', 'Biotech', 'Research'
    ];
    const foundBackgrounds = backgrounds.filter(b => html.includes(b));
    assert(foundBackgrounds.length >= 3, `Only ${foundBackgrounds.length} believable backgrounds found, need at least 3`);
});

// ============================================================================
// SECTION 6: CURRICULUM SECTION TESTS
// ============================================================================
console.log('\n--- Curriculum Section Tests ---');

test('Page has curriculum section', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('Curriculum') || html.includes('curriculum') || html.includes('Days'),
        'Missing curriculum section'
    );
});

test('Curriculum covers 10 days', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    // Should mention various days
    const daysMentioned = ['Day', 'Days 1', 'Days 3', 'Days 5', 'Days 7', 'Days 9'];
    const foundDays = daysMentioned.filter(d => html.includes(d));
    assert(foundDays.length >= 3, 'Curriculum should mention multiple days');
});

// ============================================================================
// SECTION 7: PRICING/ADMISSIONS SECTION TESTS
// ============================================================================
console.log('\n--- Pricing/Admissions Tests ---');

test('Page has pricing information', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('$') && (html.includes('1,280') || html.includes('Price') || html.includes('Cost')),
        'Missing pricing information'
    );
});

test('Page has money-back guarantee', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('Guarantee') || html.includes('guarantee') || html.includes('refund'),
        'Missing money-back guarantee'
    );
});

// ============================================================================
// SECTION 8: CSS STRUCTURE TESTS
// ============================================================================
console.log('\n--- CSS Structure Tests ---');

test('styles.css has root variables', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(css.includes(':root'), 'Missing :root CSS variables');
});

test('styles.css has color palette variables', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(
        css.includes('--color-') || css.includes('--primary') || css.includes('--accent') ||
        css.includes('--purple-') || css.includes('--cta-') || css.includes('--bg-'),
        'Missing color palette variables'
    );
});

test('styles.css has responsive styles', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(css.includes('@media'), 'Missing responsive media queries');
});

test('styles.css has button styles', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(css.includes('button') || css.includes('.btn') || css.includes('.cta'), 'Missing button styles');
});

test('styles.css has form styles', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(css.includes('input') || css.includes('form'), 'Missing form styles');
});

test('styles.css uses modern layout (grid or flexbox)', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    assert(
        css.includes('display: grid') || css.includes('display: flex') || 
        css.includes('display:grid') || css.includes('display:flex'),
        'Missing modern layout (grid/flexbox)'
    );
});

// ============================================================================
// SECTION 9: DESIGN CONSISTENCY TESTS (Adava Style)
// ============================================================================
console.log('\n--- Design Consistency Tests ---');

test('Uses purple/magenta color scheme (Adava style)', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    // Check for purple-ish colors
    const hasPurple = 
        css.includes('#8b5cf6') || css.includes('#a855f7') ||
        css.includes('#9333ea') || css.includes('#7c3aed') ||
        css.includes('rgb(139, 92, 246)') || css.includes('rgba(139') ||
        css.toLowerCase().includes('purple') || css.includes('#a259ff');
    assert(hasPurple, 'Missing purple/magenta color scheme');
});

test('Uses gold/yellow CTA colors (Adava style)', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    const hasGold = 
        css.includes('#f59e0b') || css.includes('#fbbf24') ||
        css.includes('#eab308') || css.includes('#facc15') ||
        css.toLowerCase().includes('gold') || css.toLowerCase().includes('yellow') ||
        css.includes('rgb(245,') || css.includes('rgb(250,');
    assert(hasGold, 'Missing gold/yellow CTA colors');
});

test('Has dark background theme', () => {
    const css = fs.readFileSync('styles.css', 'utf8');
    const hasDark = 
        css.includes('#0f') || css.includes('#1a') || css.includes('#0a') ||
        css.includes('rgb(15,') || css.includes('rgb(10,') || css.includes('rgb(26,');
    assert(hasDark, 'Missing dark background theme');
});

// ============================================================================
// SECTION 10: ACCESSIBILITY TESTS
// ============================================================================
console.log('\n--- Accessibility Tests ---');

test('Form inputs have placeholder text', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('placeholder='), 'Missing placeholder text on inputs');
});

test('Buttons have text content', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    // Buttons should have readable text
    assert(
        html.includes('>Apply') || html.includes('>Enroll') || html.includes('>Get'),
        'Buttons should have descriptive text'
    );
});

test('Page has semantic HTML structure', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const semanticTags = ['<header', '<nav', '<main', '<section', '<footer', '<article'];
    const foundTags = semanticTags.filter(tag => html.includes(tag));
    assert(foundTags.length >= 3, `Only ${foundTags.length} semantic tags found, need at least 3`);
});

test('Headings follow hierarchy (h1 -> h2 -> h3)', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('<h1'), 'Missing h1 heading');
    assert(html.includes('<h2'), 'Missing h2 headings');
});

// ============================================================================
// SECTION 11: COHORT/SCHEDULE TESTS
// ============================================================================
console.log('\n--- Cohort/Schedule Tests ---');

test('Page has cohort/schedule information', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(
        html.includes('Cohort') || html.includes('cohort') || 
        html.includes('Schedule') || html.includes('Dates'),
        'Missing cohort/schedule information'
    );
});

test('Page shows specific dates', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    // Should have month names or date patterns
    const hasDateInfo = 
        html.includes('Jan') || html.includes('Feb') || html.includes('Mar') ||
        html.includes('Apr') || html.includes('May') || html.includes('2026');
    assert(hasDateInfo, 'Missing specific date information');
});

// ============================================================================
// SECTION 12: SOCIAL PROOF / STATS TESTS
// ============================================================================
console.log('\n--- Social Proof Tests ---');

test('Page has statistics/numbers', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    // Should have numbers for credibility
    const hasStats = 
        html.includes('94%') || html.includes('847') ||
        html.includes('%') || html.includes('+');
    assert(hasStats, 'Missing statistics for social proof');
});

test('Page has employment/success metrics', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const hasMetrics =
        html.includes('Employment') || html.includes('Hired') ||
        html.includes('Salary') || html.includes('salary') ||
        html.includes('Starting');
    assert(hasMetrics, 'Missing employment/success metrics');
});

// ============================================================================
// RESULTS
// ============================================================================
console.log();
console.log('='.repeat(70));
console.log('TEST RESULTS');
console.log('='.repeat(70));
console.log(`Passed: ${tests.passed.length}`);
console.log(`Failed: ${tests.failed.length}`);
console.log();

if (tests.failed.length > 0) {
    console.log('FAILED TESTS:');
    tests.errors.forEach(({ name, error }) => {
        console.log(`  ✗ ${name}: ${error}`);
    });
    console.log();
    process.exit(1);
} else {
    console.log('All tests passed!');
    process.exit(0);
}


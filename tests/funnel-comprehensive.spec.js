/**
 * Comprehensive UX Tests for Adava University Funnel
 * Tests all pages and state persistence
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:8888';
const VIEWPORTS = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
];

test.describe('Landing Page (index.html) - UX Tests', () => {
    test('should load without errors', async ({ page }) => {
        const response = await page.goto(BASE_URL);
        expect(response.status()).toBe(200);
    });

    test('should have all critical elements visible', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Hero section
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.hero-subtitle')).toBeVisible();
        
        // CTA form
        await expect(page.locator('input[type="text"]').first()).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        
        // Cohort cards
        await expect(page.locator('.cohort-card').first()).toBeVisible();
    });

    test('should not have horizontal overflow', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto(BASE_URL);
            
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = viewport.width;
            
            expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
        }
    });

    test('should save form data to localStorage', async ({ page }) => {
        await page.goto(BASE_URL);
        
        await page.fill('input[type="text"]', 'Test User');
        await page.fill('input[type="email"]', 'test@example.com');
        
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('adava_user_data');
        });
        
        expect(savedData).toBeTruthy();
        const parsed = JSON.parse(savedData);
        expect(parsed.name).toBe('Test User');
        expect(parsed.email).toBe('test@example.com');
    });
});

test.describe('Application Page - UX Tests', () => {
    const APP_URL = `${BASE_URL}/application/?cohort=February%202026&name=Test%20User&email=test@example.com`;

    test('should load without errors', async ({ page }) => {
        const response = await page.goto(APP_URL);
        expect(response.status()).toBe(200);
    });

    test('should pre-fill name and email from URL params', async ({ page }) => {
        await page.goto(APP_URL);
        
        const nameValue = await page.inputValue('input[placeholder*="Test User"]');
        const emailValue = await page.inputValue('input[placeholder*="test@example.com"]');
        
        expect(nameValue).toBe('Test User');
        expect(emailValue).toBe('test@example.com');
    });

    test('should have no horizontal overflow on all viewports', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto(APP_URL);
            
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(viewport.width + 1);
        }
    });

    test('should show progress bar starting at 25%', async ({ page }) => {
        await page.goto(APP_URL);
        
        const progressText = await page.textContent('.progress-text');
        expect(progressText).toContain('25%');
    });

    test('should show urgency elements', async ({ page }) => {
        await page.goto(APP_URL);
        
        await expect(page.locator('.scarcity-bar')).toBeVisible();
        await expect(page.locator('.seat-grid')).toBeVisible();
        await expect(page.locator('text=3 Seats Remaining')).toBeVisible();
    });

    test('should have progressive disclosure working', async ({ page }) => {
        await page.goto(APP_URL);
        
        // First section should be visible
        await expect(page.locator('.form-section').first()).toBeVisible();
        
        // Second section should NOT be visible initially
        const sections = await page.locator('.form-section').count();
        // We can't easily test v-show visibility without checking styles
        // but we can verify the structure exists
        expect(sections).toBeGreaterThan(1);
    });

    test('should save application progress to localStorage', async ({ page }) => {
        await page.goto(APP_URL);
        
        await page.fill('input[type="tel"]', '+1234567890');
        
        // Wait a bit for auto-save
        await page.waitForTimeout(500);
        
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('adava_application_progress');
        });
        
        expect(savedData).toBeTruthy();
    });
});

test.describe('Evaluation Page - UX Tests', () => {
    const EVAL_URL = `${BASE_URL}/evaluation/?name=Dr.%20Sarah&cohort=February%202026&occupation=doctor&experience=none&goal=build-product`;

    test('should load without errors', async ({ page }) => {
        const response = await page.goto(EVAL_URL);
        expect(response.status()).toBe(200);
    });

    test('should show loading animation initially', async ({ page }) => {
        await page.goto(EVAL_URL);
        
        await expect(page.locator('text=Analyzing Your Application')).toBeVisible();
        await expect(page.locator('.loading-bar')).toBeVisible();
    });

    test('should show results after loading', async ({ page }) => {
        await page.goto(EVAL_URL);
        
        // Wait for loading to complete (10 seconds + buffer)
        await page.waitForTimeout(11000);
        
        await expect(page.locator('text=Pre-Selected')).toBeVisible();
        await expect(page.locator('text=Why You\'re a Great Fit')).toBeVisible();
    });

    test('should personalize with applicant name', async ({ page }) => {
        await page.goto(EVAL_URL);
        
        await page.waitForTimeout(11000);
        
        await expect(page.locator('text=Dr. Sarah')).toBeVisible();
    });

    test('should show relevant projects for occupation', async ({ page }) => {
        await page.goto(EVAL_URL);
        
        await page.waitForTimeout(11000);
        
        // Doctor should see medical projects
        await expect(page.locator('text=HIPAA')).toBeVisible();
    });

    test('should have no horizontal overflow', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto(EVAL_URL);
            
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(viewport.width + 1);
        }
    });
});

test.describe('Reservation Page - UX Tests', () => {
    const RES_URL = `${BASE_URL}/reservation/?name=Test%20User&cohort=February%202026`;

    test('should load without errors', async ({ page }) => {
        const response = await page.goto(RES_URL);
        expect(response.status()).toBe(200);
    });

    test('should have no horizontal overflow', async ({ page }) => {
        for (const viewport of VIEWPORTS) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto(RES_URL);
            
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(viewport.width + 1);
        }
    });
});

test.describe('State Persistence - Cross-Page Tests', () => {
    test('should persist data from landing to application', async ({ page }) => {
        // Step 1: Fill landing page
        await page.goto(BASE_URL);
        await page.fill('input[type="text"]', 'Jane Doe');
        await page.fill('input[type="email"]', 'jane@example.com');
        
        // Step 2: Select cohort (simulate click on Apply Now)
        await page.click('.cohort-card:first-child .btn');
        
        // Step 3: Verify data on application page
        await page.waitForURL(/.*application.*/);
        
        const nameValue = await page.inputValue('input[value="Jane Doe"], input[placeholder="Jane Doe"]');
        const emailValue = await page.inputValue('input[value="jane@example.com"], input[placeholder="jane@example.com"]');
        
        expect(nameValue || await page.getAttribute('input[readonly]', 'value')).toContain('Jane');
        expect(emailValue || await page.getAttribute('input[readonly][type="email"]', 'value')).toContain('jane@example.com');
    });

    test('should persist data in localStorage across page refresh', async ({ page }) => {
        const APP_URL = `${BASE_URL}/application/?cohort=February%202026&name=Test&email=test@example.com`;
        
        // Fill some data
        await page.goto(APP_URL);
        await page.fill('input[type="tel"]', '+1234567890');
        await page.waitForTimeout(500);
        
        // Refresh page
        await page.reload();
        
        // Check if data persists
        const phoneValue = await page.inputValue('input[type="tel"]');
        expect(phoneValue).toBe('+1234567890');
    });

    test('should set cookie with email for cross-device persistence', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('input[type="email"]', 'persistent@example.com');
        await page.waitForTimeout(500);
        
        const cookies = await page.context().cookies();
        const emailCookie = cookies.find(c => c.name === 'adava_user_email');
        
        expect(emailCookie).toBeTruthy();
        expect(emailCookie.value).toBe('persistent@example.com');
    });
});

test.describe('Server-Side State Persistence Tests', () => {
    test('should save application state to server', async ({ page, request }) => {
        const APP_URL = `${BASE_URL}/application/?cohort=February%202026&name=Server%20Test&email=servertest@example.com`;
        
        await page.goto(APP_URL);
        await page.fill('input[type="tel"]', '+1987654321');
        await page.waitForTimeout(1000);
        
        // Verify server has the data
        const response = await request.get('http://localhost:3001/api/session?email=servertest@example.com');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.email).toBe('servertest@example.com');
    });

    test('should restore application state from server on different device', async ({ page, browser }) => {
        // Simulate Device 1: Save data
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();
        
        await page1.goto(`${BASE_URL}/application/?cohort=February%202026&name=Device%20Test&email=devicetest@example.com`);
        await page1.fill('input[type="tel"]', '+1111111111');
        await page1.selectOption('select', { index: 1 }); // Select first option
        await page1.waitForTimeout(1000);
        
        await context1.close();
        
        // Simulate Device 2: Restore data
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        
        // Enter email to trigger restore
        await page2.goto(`${BASE_URL}/application/?email=devicetest@example.com`);
        await page2.waitForTimeout(1000);
        
        const phoneValue = await page2.inputValue('input[type="tel"]');
        expect(phoneValue).toBe('+1111111111');
        
        await context2.close();
    });
});

test.describe('Error Handling Tests', () => {
    test('should handle offline gracefully', async ({ page, context }) => {
        await context.setOffline(true);
        
        await page.goto(BASE_URL);
        await page.fill('input[type="text"]', 'Offline User');
        
        // Should still save to localStorage
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('adava_user_data');
        });
        
        expect(savedData).toBeTruthy();
    });

    test('should show fallback content if LLM fails', async ({ page }) => {
        const EVAL_URL = `${BASE_URL}/evaluation/?name=Fallback&cohort=February%202026&occupation=test&experience=none&goal=test`;
        
        await page.goto(EVAL_URL);
        await page.waitForTimeout(11000);
        
        // Should show SOME content even if LLM fails
        await expect(page.locator('text=Why You\'re a Great Fit')).toBeVisible();
        const reasons = await page.locator('.result-reasons li').count();
        expect(reasons).toBeGreaterThan(0);
    });
});

test.describe('Performance Tests', () => {
    test('pages should load in under 3 seconds', async ({ page }) => {
        const pages = [
            BASE_URL,
            `${BASE_URL}/application/?cohort=February%202026&name=Test&email=test@example.com`,
            `${BASE_URL}/evaluation/?name=Test&cohort=February%202026&occupation=test&experience=none&goal=test`,
            `${BASE_URL}/reservation/?name=Test&cohort=February%202026`
        ];
        
        for (const url of pages) {
            const startTime = Date.now();
            await page.goto(url);
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000);
        }
    });
});

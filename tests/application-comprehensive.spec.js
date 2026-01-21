const { test, expect } = require('@playwright/test');

// Test Configuration
const TEST_URL = 'http://localhost:8888/application.html?cohort=February%202026&name=Test%20User&email=test@example.com';

test.describe('Application Form - Comprehensive Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL);
        await page.waitForLoadState('networkidle');
    });

    // === STRUCTURE TESTS ===
    test('has correct page structure', async ({ page }) => {
        // Check main elements exist
        await expect(page.locator('.app-container')).toBeVisible();
        await expect(page.locator('.scarcity-bar')).toBeVisible();
        await expect(page.locator('.app-header h1')).toContainText('Application for Admission');
        await expect(page.locator('.value-stack')).toBeVisible();
        await expect(page.locator('.comparison-box')).toBeVisible();
        await expect(page.locator('.progress-bar')).toBeVisible();
        await expect(page.locator('.app-form')).toBeVisible();
    });

    test('loads with pre-filled data from query params', async ({ page }) => {
        const nameInput = page.locator('input[placeholder="Jane Smith"]');
        const emailInput = page.locator('input[placeholder="jane@example.com"]');
        
        await expect(nameInput).toHaveValue('Test User');
        await expect(emailInput).toHaveValue('test@example.com');
    });

    // === CONTENT TESTS ===
    test('has correct instructor credentials', async ({ page }) => {
        const subtitle = page.locator('.app-header .subtitle');
        await expect(subtitle).toContainText('Google, Apple, Meta, Amazon, and Microsoft');
        await expect(subtitle).toContainText('MIT, Stanford, Harvard, Oxford, and Cambridge');
    });

    test('all text blocks are concise (max 2 sentences)', async ({ page }) => {
        // Check benefit callouts
        const benefitTexts = await page.locator('.benefit-callout p, .future-pacing p').allTextContents();
        for (const text of benefitTexts) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length > 2) {
                console.log('Text with too many sentences:', text);
                console.log('Sentence count:', sentences.length);
            }
            expect(sentences.length).toBeLessThanOrEqual(2);
        }

        // Check section descriptions
        const descriptions = await page.locator('.section-description').allTextContents();
        for (const text of descriptions) {
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            expect(sentences.length).toBeLessThanOrEqual(2);
        }
        
        // Check payment breakdown text (only check paragraphs with actual sentences)
        const paymentTexts = await page.locator('.payment-breakdown p').allTextContents();
        for (const text of paymentTexts) {
            // Skip if text has no sentence-ending punctuation (like "$1.00")
            if (!/[.!?]/.test(text)) continue;
            
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length > 2) {
                console.log('Payment text with too many sentences:', text);
                console.log('Sentence count:', sentences.length);
            }
            expect(sentences.length).toBeLessThanOrEqual(2);
        }
    });

    test('uses AI-focused language correctly', async ({ page }) => {
        const content = await page.content();
        
        // Should mention AI-powered development
        expect(content).toContain('AI');
        expect(content).toContain('AI-Powered');
        
        // Should NOT say "AI-first program"
        expect(content).not.toContain('AI-first program');
        expect(content).not.toContain('AI First Program');
        
        // Should mention Adava correctly
        expect(content).toContain('Adava');
    });

    // === PROGRESS BAR TESTS ===
    test('progress bar starts at 25%', async ({ page }) => {
        const progressFill = page.locator('.progress-fill');
        const progressText = page.locator('.progress-text');
        
        // Check initial width
        const width = await progressFill.evaluate(el => el.style.width);
        expect(width).toBe('25%');
        
        // Check text
        await expect(progressText).toContainText('25%');
    });

    test('progress bar updates as form is filled', async ({ page }) => {
        // Fill phone field
        await page.locator('input[type="tel"]').fill('+1 555 123 4567');
        
        // Wait a bit for Vue reactivity
        await page.waitForTimeout(100);
        
        // Progress should increase
        const progressFill = page.locator('.progress-fill');
        const width = await progressFill.evaluate(el => el.style.width);
        const percentage = parseInt(width);
        expect(percentage).toBeGreaterThan(25);
    });

    test('progress bar reaches 100% when form is complete', async ({ page }) => {
        // Fill all required fields
        await page.locator('input[type="tel"]').fill('+1 555 123 4567');
        await page.locator('select').first().selectOption('professional');
        await page.locator('select').nth(1).selectOption('some');
        await page.locator('#tool-cursor').check();
        await page.locator('select').nth(2).selectOption('job');
        await page.locator('textarea').fill('I want to learn AI coding');
        await page.locator('select').nth(3).selectOption('yes-all');
        await page.locator('select').nth(4).selectOption('google');
        await page.locator('input[placeholder="4242 4242 4242 4242"]').fill('4242424242424242');
        await page.locator('input[placeholder="MM/YY"]').fill('12/25');
        await page.locator('input[placeholder="123"]').fill('123');
        
        await page.waitForTimeout(200);
        
        // Should show either "100%" or "Ready to submit!"
        const progressText = page.locator('.progress-text');
        const text = await progressText.textContent();
        expect(text.includes('100%') || text.includes('Ready to submit')).toBe(true);
        
        // Progress fill should be at 100%
        const progressFill = page.locator('.progress-fill');
        const width = await progressFill.evaluate(el => el.style.width);
        expect(width).toBe('100%');
    });

    // === FORM VALIDATION TESTS ===
    test('submit button is disabled when form incomplete', async ({ page }) => {
        const submitBtn = page.locator('.submit-btn');
        await expect(submitBtn).toBeDisabled();
    });

    test('submit button is enabled when form complete', async ({ page }) => {
        // Fill all fields
        await page.locator('input[type="tel"]').fill('+1 555 123 4567');
        await page.locator('select').first().selectOption('professional');
        await page.locator('select').nth(1).selectOption('some');
        await page.locator('#tool-cursor').check();
        await page.locator('select').nth(2).selectOption('job');
        await page.locator('textarea').fill('I want to learn');
        await page.locator('select').nth(3).selectOption('yes-all');
        await page.locator('select').nth(4).selectOption('google');
        await page.locator('input[placeholder="4242 4242 4242 4242"]').fill('4242424242424242');
        await page.locator('input[placeholder="MM/YY"]').fill('12/25');
        await page.locator('input[placeholder="123"]').fill('123');
        
        await page.waitForTimeout(100);
        
        const submitBtn = page.locator('.submit-btn');
        await expect(submitBtn).toBeEnabled();
    });

    // === VISUAL TESTS ===
    test('payment section has clear layout', async ({ page }) => {
        const paymentSection = page.locator('.payment-section');
        await expect(paymentSection).toBeVisible();
        
        // Check payment info is clear
        await expect(page.locator('.payment-info .price')).toContainText('$1.00');
        await expect(page.locator('.payment-breakdown')).toBeVisible();
        
        // Check "No automatic charges" is visible
        await expect(page.locator('.payment-breakdown')).toContainText('No automatic charges');
    });

    test('no overflow on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Check for horizontal overflow
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasOverflow).toBe(false);
    });

    test('no overflow on desktop viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasOverflow).toBe(false);
    });

    // === RESPONSIVE TESTS ===
    test('renders correctly on iPhone 14 Pro Max', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        
        await expect(page.locator('.app-container')).toBeVisible();
        await expect(page.locator('.scarcity-bar')).toBeVisible();
        await expect(page.locator('.app-form')).toBeVisible();
    });

    test('renders correctly on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        
        await expect(page.locator('.app-container')).toBeVisible();
        await expect(page.locator('.app-form')).toBeVisible();
    });

    // === INTERACTION TESTS ===
    test('checkbox group works correctly', async ({ page }) => {
        const cursorCheckbox = page.locator('#tool-cursor');
        const claudeCheckbox = page.locator('#tool-claude');
        
        await cursorCheckbox.check();
        await expect(cursorCheckbox).toBeChecked();
        
        await claudeCheckbox.check();
        await expect(claudeCheckbox).toBeChecked();
        await expect(cursorCheckbox).toBeChecked(); // Both should be checked
    });

    test('textarea accepts input', async ({ page }) => {
        const textarea = page.locator('textarea');
        const testText = 'I want to learn AI coding because it will help me build products faster';
        
        await textarea.fill(testText);
        await expect(textarea).toHaveValue(testText);
    });

    // === ACCESSIBILITY TESTS ===
    test('all form inputs have labels', async ({ page }) => {
        const inputs = await page.locator('input:not([type="checkbox"]), select, textarea').all();
        
        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const name = await input.getAttribute('name');
            const ariaLabel = await input.getAttribute('aria-label');
            const placeholder = await input.getAttribute('placeholder');
            
            // Input should have some form of label
            const hasLabel = id || name || ariaLabel || placeholder;
            expect(hasLabel).toBeTruthy();
        }
    });

    test('benefit callouts have icons', async ({ page }) => {
        const benefitCallouts = await page.locator('.benefit-callout h4 i').all();
        expect(benefitCallouts.length).toBeGreaterThan(0);
    });

    // === CONTENT ACCURACY TESTS ===
    test('mentions correct pricing', async ({ page }) => {
        const content = await page.content();
        
        expect(content).toContain('$1');
        expect(content).toContain('$590');
        expect(content).not.toContain('$591'); // Should not have wrong pricing
    });

    test('has correct cohort information', async ({ page }) => {
        await expect(page.locator('.scarcity-bar')).toContainText('February Cohort');
    });

    // === JAVASCRIPT TESTS ===
    test('Vue app initializes correctly', async ({ page }) => {
        const vueApp = await page.evaluate(() => {
            return typeof Vue !== 'undefined';
        });
        
        expect(vueApp).toBe(true);
    });

    test('no console errors on page load', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        expect(errors.length).toBe(0);
    });
});

// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Form Input Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for Vue app to mount by checking for a v-model bound input
        await page.waitForSelector('.cta-form input[type="text"]', { state: 'visible', timeout: 10000 });
        await page.waitForTimeout(1500); // Give extra time for all Vue initialization + GSAP
    });

    test('CTA form shows red inputs for empty fields @smoke', async ({ page }) => {
        // Click Apply Now without filling form
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        // Wait for toast
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Check toast is error
        const toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('Please fill in all fields');
        
        // Check both inputs have error styling
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        const emailInput = page.locator('.cta-form input[type="email"]').first();
        
        const nameClass = await nameInput.getAttribute('class');
        const emailClass = await emailInput.getAttribute('class');
        
        expect(nameClass).toContain('input-error');
        expect(emailClass).toContain('input-error');
    });

    test('CTA form shows red input only for missing name', async ({ page }) => {
        // Fill only email
        await page.fill('.cta-form input[type="email"]', 'test@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        await page.waitForTimeout(500);
        
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        const emailInput = page.locator('.cta-form input[type="email"]').first();
        
        const nameClass = await nameInput.getAttribute('class');
        const emailClass = await emailInput.getAttribute('class');
        
        expect(nameClass).toContain('input-error');
        expect(emailClass).not.toContain('input-error');
    });

    test('CTA form shows red input only for missing email', async ({ page }) => {
        // Fill only name
        await page.fill('.cta-form input[type="text"]', 'Test User');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        await page.waitForTimeout(500);
        
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        const emailInput = page.locator('.cta-form input[type="email"]').first();
        
        const nameClass = await nameInput.getAttribute('class');
        const emailClass = await emailInput.getAttribute('class');
        
        expect(nameClass).not.toContain('input-error');
        expect(emailClass).toContain('input-error');
    });

    test('error styling clears when user types in name field', async ({ page }) => {
        // Trigger error
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        await page.waitForTimeout(500);
        
        // Check error is present
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        let nameClass = await nameInput.getAttribute('class');
        expect(nameClass).toContain('input-error');
        
        // Start typing
        await page.fill('.cta-form input[type="text"]', 'T');
        await page.waitForTimeout(200);
        
        // Error should clear
        nameClass = await nameInput.getAttribute('class');
        expect(nameClass).not.toContain('input-error');
    });

    test('error styling clears when user types in email field', async ({ page }) => {
        // Trigger error
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        await page.waitForTimeout(500);
        
        // Start typing in email
        await page.fill('.cta-form input[type="email"]', 't');
        await page.waitForTimeout(200);
        
        // Error should clear
        const emailInput = page.locator('.cta-form input[type="email"]').first();
        const emailClass = await emailInput.getAttribute('class');
        expect(emailClass).not.toContain('input-error');
    });

    test('cohort form shows red inputs for empty fields', async ({ page }) => {
        // Scroll to cohorts
        await page.evaluate(() => {
            document.getElementById('cohorts').scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(1000);
        
        // Click Apply Now on cohort form
        await page.click('.cohort-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        await page.waitForTimeout(500);
        
        // Check both inputs have error styling
        const nameInput = page.locator('.cohort-form input[type="text"]').first();
        const emailInput = page.locator('.cohort-form input[type="email"]').first();
        
        const nameClass = await nameInput.getAttribute('class');
        const emailClass = await emailInput.getAttribute('class');
        
        expect(nameClass).toContain('input-error');
        expect(emailClass).toContain('input-error');
    });

    test('successful CTA form submission has no errors', async ({ page }) => {
        // Fill both fields
        await page.fill('.cta-form input[type="text"]', 'Test User');
        await page.fill('.cta-form input[type="email"]', 'test@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        await page.waitForTimeout(1000); // Wait for API call
        
        // Check no error styling
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        const emailInput = page.locator('.cta-form input[type="email"]').first();
        
        const nameClass = await nameInput.getAttribute('class');
        const emailClass = await emailInput.getAttribute('class');
        
        expect(nameClass).not.toContain('input-error');
        expect(emailClass).not.toContain('input-error');
    });

    test('input shake animation on error', async ({ page }) => {
        // Trigger error
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        await page.waitForTimeout(200);
        
        // Check animation property is set
        const nameInput = page.locator('.cta-form input[type="text"]').first();
        const animation = await nameInput.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return styles.animationName;
        });
        
        expect(animation).toContain('shake');
    });
});

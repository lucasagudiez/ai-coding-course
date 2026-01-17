// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Scholarship Code Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); // Extra time for Vue + GSAP animations
        
        // Scroll to scholarship section
        await page.evaluate(() => {
            const section = document.querySelector('.admissions-section');
            if (section) section.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(500);
    });

    test('shows error toast for empty scholarship code', async ({ page }) => {
        // Click Use Scholarship without entering code
        await page.click('button:has-text("Use Scholarship")', { force: true });
        
        // Wait for toast to appear
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Check toast content
        const toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('Please enter a scholarship code');
        
        // Check input has red error styling
        const inputClass = await page.locator('#scholarship-code').getAttribute('class');
        expect(inputClass).toContain('input-error');
    });

    test('shows error toast for invalid scholarship code', async ({ page }) => {
        // Enter invalid code (doesn't end with "scholarship")
        await page.fill('#scholarship-code', 'INVALID_CODE');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        
        // Wait for toast
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Check toast content
        const toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('Invalid scholarship code');
        expect(toastText).toContain('"scholarship"');
        
        // Check input has error styling
        const inputClass = await page.locator('#scholarship-code').getAttribute('class');
        expect(inputClass).toContain('input-error');
    });

    test('shows success toast for valid scholarship code', async ({ page }) => {
        // Enter valid code (ends with "scholarship")
        await page.fill('#scholarship-code', 'TECH_SCHOLARSHIP');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        
        // Wait for toast
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Check toast content
        const toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('applied successfully');
        expect(toastText).toContain('TECH_SCHOLARSHIP');
        
        // Check input does NOT have error styling
        const inputClass = await page.locator('#scholarship-code').getAttribute('class');
        expect(inputClass).not.toContain('input-error');
        
        // Check scholarship price is displayed
        await page.waitForSelector('#scholarship-price', { state: 'visible', timeout: 2000 });
        const isVisible = await page.locator('#scholarship-price').isVisible();
        expect(isVisible).toBe(true);
    });

    test('error styling clears when user starts typing', async ({ page }) => {
        // Trigger error
        await page.click('button:has-text("Use Scholarship")', { force: true });
        await page.waitForTimeout(500);
        
        // Check error styling is present
        let inputClass = await page.locator('#scholarship-code').getAttribute('class');
        expect(inputClass).toContain('input-error');
        
        // Start typing
        await page.fill('#scholarship-code', 'T');
        await page.waitForTimeout(200);
        
        // Error styling should be cleared
        inputClass = await page.locator('#scholarship-code').getAttribute('class');
        expect(inputClass).not.toContain('input-error');
    });

    test('case insensitive validation works', async ({ page }) => {
        // Test lowercase
        await page.fill('#scholarship-code', 'test_scholarship');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        let toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('applied successfully');
        
        // Reload and test mixed case
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await page.evaluate(() => {
            const section = document.querySelector('.admissions-section');
            if (section) section.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(500);
        
        await page.fill('#scholarship-code', 'Mixed_SCHOLARSHIP');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        toastText = await page.locator('.toast-notification').textContent();
        expect(toastText).toContain('applied successfully');
    });

    test('toast auto-dismisses after 4 seconds', async ({ page }) => {
        await page.fill('#scholarship-code', 'AUTO_SCHOLARSHIP');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        
        // Toast should appear
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Wait 4.5 seconds (toast auto-dismisses after 4 seconds)
        await page.waitForTimeout(4500);
        
        // Toast should be gone
        const toastVisible = await page.locator('.toast-notification').isVisible();
        expect(toastVisible).toBe(false);
    });

    test('toast can be manually dismissed', async ({ page }) => {
        await page.fill('#scholarship-code', 'DISMISS_SCHOLARSHIP');
        await page.click('button:has-text("Use Scholarship")', { force: true });
        
        // Toast should appear
        await page.waitForSelector('.toast-notification', { state: 'visible', timeout: 5000 });
        
        // Click close button
        await page.click('.toast-close', { force: true });
        await page.waitForTimeout(300);
        
        // Toast should be gone
        const toastVisible = await page.locator('.toast-notification').isVisible();
        expect(toastVisible).toBe(false);
    });
});

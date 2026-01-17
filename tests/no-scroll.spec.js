// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CTA Form No-Scroll Behavior', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500); // Give Vue time to mount + GSAP animations
    });

    test('CTA form does NOT scroll on submission @smoke', async ({ page }) => {
        // Record initial scroll position
        const scrollBefore = await page.evaluate(() => window.scrollY);
        
        // Fill and submit form
        await page.fill('.cta-form input[type="text"]', 'Test User');
        await page.fill('.cta-form input[type="email"]', 'test@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        // Wait for submission
        await page.waitForTimeout(1000);
        
        // Check scroll position
        const scrollAfter = await page.evaluate(() => window.scrollY);
        
        // Should not have scrolled (allow small browser adjustment < 100px)
        const scrollDiff = Math.abs(scrollAfter - scrollBefore);
        expect(scrollDiff).toBeLessThan(100);
    });

    test('CTA form shows success message on page', async ({ page }) => {
        // Fill and submit
        await page.fill('.cta-form input[type="text"]', 'Test User');
        await page.fill('.cta-form input[type="email"]', 'test@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        // Wait for success message
        await page.waitForSelector('.cta-form .success-message', { state: 'visible', timeout: 5000 });
        
        // Check message content
        const message = await page.locator('.cta-form .success-message').textContent();
        expect(message).toContain('Thanks');
        expect(message).toContain('Keep scrolling');
    });

    test('CTA form disables inputs after submission', async ({ page }) => {
        // Fill and submit
        await page.fill('.cta-form input[type="text"]', 'Test User');
        await page.fill('.cta-form input[type="email"]', 'test@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        await page.waitForTimeout(1000);
        
        // Check inputs are disabled
        const nameDisabled = await page.locator('.cta-form input[type="text"]').first().isDisabled();
        const emailDisabled = await page.locator('.cta-form input[type="email"]').first().isDisabled();
        
        expect(nameDisabled).toBe(true);
        expect(emailDisabled).toBe(true);
    });

    test('cohort forms are prefilled after CTA submission', async ({ page }) => {
        // Fill and submit CTA form
        await page.fill('.cta-form input[type="text"]', 'Prefill Test');
        await page.fill('.cta-form input[type="email"]', 'prefill@example.com');
        await page.click('.cta-form button:has-text("Apply Now")', { force: true, timeout: 15000 });
        
        await page.waitForTimeout(1000);
        
        // Scroll to cohorts
        await page.evaluate(() => {
            document.getElementById('cohorts').scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(500);
        
        // Check cohort forms are prefilled
        const cohortName = await page.locator('.cohort-form input[type="text"]').first().inputValue();
        const cohortEmail = await page.locator('.cohort-form input[type="email"]').first().inputValue();
        
        expect(cohortName).toBe('Prefill Test');
        expect(cohortEmail).toBe('prefill@example.com');
    });

    test('navigation Apply Now link does scroll', async ({ page }) => {
        // Record scroll position (should be near top)
        const scrollBefore = await page.evaluate(() => window.scrollY);
        expect(scrollBefore).toBeLessThan(100);
        
        // Click navigation Apply Now
        await page.click('nav a:has-text("Apply Now")', { force: true });
        await page.waitForTimeout(1500); // Wait for smooth scroll animation
        
        // Should have scrolled significantly
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(scrollAfter).toBeGreaterThan(1000); // Should be at cohorts section
    });
});

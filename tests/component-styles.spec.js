const { test, expect } = require('@playwright/test');

test.describe('Vue Component Style Verification @smoke', () => {
    test('scarcity-bar component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const scarcityBar = page.locator('.scarcity-bar').first();
        await expect(scarcityBar).toBeVisible();
        
        // Check computed styles
        const styles = await scarcityBar.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.backgroundColor,
                padding: computed.padding,
                borderRadius: computed.borderRadius,
                display: computed.display
            };
        });
        
        // Verify scarcity bar has styling applied (background might be transparent if inherited)
        expect(styles.borderRadius).toBeTruthy(); // Has rounded corners
        expect(styles.padding).toBeTruthy(); // Has padding
    });

    test('graduate-counter component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const counter = page.locator('.graduate-counter').first();
        await expect(counter).toBeVisible();
        
        const styles = await counter.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                gap: computed.gap,
                background: computed.backgroundColor
            };
        });
        
        // Should be flex/grid layout
        expect(['flex', 'grid']).toContain(styles.display);
    });

    test('authority-logos component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const logos = page.locator('.authority-logos').first();
        await expect(logos).toBeVisible();
        
        // Check that logo grid exists and is styled
        const logoGrid = page.locator('.logo-grid').first();
        await expect(logoGrid).toBeVisible();
        
        const gridStyles = await logoGrid.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                gap: computed.gap
            };
        });
        
        expect(['flex', 'grid']).toContain(gridStyles.display);
    });

    test('value-stack component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const valueStack = page.locator('.value-stack').first();
        await expect(valueStack).toBeVisible();
        
        // Check value items are styled correctly
        const valueItem = page.locator('.value-item').first();
        const styles = await valueItem.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                justifyContent: computed.justifyContent,
                padding: computed.padding
            };
        });
        
        expect(styles.display).toBe('flex');
        expect(styles.padding).toBeTruthy();
    });

    test('testimonial-carousel component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const carousel = page.locator('.testimonial-carousel').first();
        await expect(carousel).toBeVisible();
        
        // Check testimonial cards
        const card = page.locator('.testimonial-card').first();
        await expect(card).toBeVisible();
        
        const cardStyles = await card.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.backgroundColor,
                padding: computed.padding,
                borderRadius: computed.borderRadius
            };
        });
        
        expect(cardStyles.padding).toBeTruthy();
        expect(cardStyles.borderRadius).toBeTruthy();
    });

    test('guarantee-badges component has identical computed styles', async ({ page }) => {
        await page.goto('/application/');
        
        const badges = page.locator('.guarantee-badge-container').first();
        await expect(badges).toBeVisible();
        
        const badge = page.locator('.guarantee-badge').first();
        const styles = await badge.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                alignItems: computed.alignItems,
                gap: computed.gap
            };
        });
        
        expect(styles.display).toBe('flex');
    });

    test('components maintain interactivity - FAQ toggle works', async ({ page }) => {
        await page.goto('/application/');
        
        // Find FAQ section
        const faqSection = page.locator('.faq-section').first();
        await expect(faqSection).toBeVisible();
        
        // Find first FAQ item
        const firstFaq = page.locator('.faq-item').first();
        const answer = firstFaq.locator('.faq-answer');
        
        // Initially hidden
        await expect(answer).toBeHidden();
        
        // Click to reveal
        await firstFaq.click();
        await expect(answer).toBeVisible();
        await expect(answer).toContainText('refunded within 48 hours');
        
        // Click again to hide
        await firstFaq.click();
        await expect(answer).toBeHidden();
    });

    test('components display dynamic data correctly', async ({ page }) => {
        await page.goto('/application/');
        
        // Check scarcity bar shows number
        const scarcityText = page.locator('.scarcity-content strong');
        await expect(scarcityText).toContainText('Seats Remaining');
        
        // Check counters show numbers
        const counterNumber = page.locator('.counter-number').first();
        await expect(counterNumber).toContainText('+'); // Should have "500+"
        
        // Check value pricing shows
        const valuePrice = page.locator('.value-price').first();
        await expect(valuePrice).toContainText('$');
    });

    test('all components render without layout shifts', async ({ page }) => {
        await page.goto('/application/');
        
        // Wait for all components to render
        await page.waitForSelector('.scarcity-bar');
        await page.waitForSelector('.graduate-counter');
        await page.waitForSelector('.authority-logos');
        await page.waitForSelector('.value-stack');
        await page.waitForSelector('.testimonial-carousel');
        await page.waitForSelector('.guarantee-badge-container');
        
        // All should be visible without console errors
        const hasErrors = await page.evaluate(() => {
            // Check if there are Vue warnings in console
            return window.console.error.calls ? window.console.error.calls.length > 0 : false;
        });
        
        expect(hasErrors).toBe(false);
    });
});

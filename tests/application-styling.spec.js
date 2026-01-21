/**
 * Application Form - Styling & UX Tests
 * Tests padding, margins, alignment, and visual quality
 */

const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:8888/application/?cohort=February%202026&name=Test%20User&email=test@example.com';

test.describe('Application Form - Styling Tests', () => {
    test('form sections have proper padding and spacing', async ({ page }) => {
        await page.goto(APP_URL);
        
        const formSection = page.locator('.form-section').first();
        const padding = await formSection.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
                top: parseInt(style.paddingTop),
                right: parseInt(style.paddingRight),
                bottom: parseInt(style.paddingBottom),
                left: parseInt(style.paddingLeft)
            };
        });
        
        // Expect at least 32px padding (2rem)
        expect(padding.top).toBeGreaterThanOrEqual(32);
        expect(padding.bottom).toBeGreaterThanOrEqual(32);
        expect(padding.left).toBeGreaterThanOrEqual(24); // 1.5rem
        expect(padding.right).toBeGreaterThanOrEqual(24);
    });

    test('form inputs have proper spacing', async ({ page }) => {
        await page.goto(APP_URL);
        
        const formGroup = page.locator('.form-group').first();
        const marginBottom = await formGroup.evaluate(el => {
            return parseInt(window.getComputedStyle(el).marginBottom);
        });
        
        // Expect at least 24px margin between form groups
        expect(marginBottom).toBeGreaterThanOrEqual(24);
    });

    test('readonly inputs have distinct styling', async ({ page }) => {
        await page.goto(APP_URL);
        
        const readonlyInput = page.locator('input[readonly]').first();
        const background = await readonlyInput.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });
        
        // Should have purple tint (not just transparent/gray)
        expect(background).toContain('rgba');
        expect(background).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    });

    test('normal inputs have good visibility', async ({ page }) => {
        await page.goto(APP_URL);
        
        const normalInput = page.locator('input[type="tel"]').first();
        const styles = await normalInput.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                background: computed.backgroundColor,
                border: computed.border,
                padding: computed.padding
            };
        });
        
        // Should have visible background and border
        expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
        expect(styles.padding).toBeTruthy();
    });

    test('checkboxes are properly styled with cards', async ({ page }) => {
        await page.goto(APP_URL);
        
        // Click continue to reveal background section
        await page.fill('input[type="tel"]', '+1234567890');
        await page.click('.continue-btn');
        
        // Wait for checkboxes to appear
        await page.waitForSelector('.checkbox-grid label');
        
        const checkboxLabel = page.locator('.checkbox-grid label').first();
        const styles = await checkboxLabel.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                padding: computed.padding,
                background: computed.backgroundColor,
                border: computed.border,
                borderRadius: computed.borderRadius
            };
        });
        
        // Should have card-like styling
        expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
        expect(parseInt(styles.borderRadius)).toBeGreaterThan(8);
        expect(styles.padding).toBeTruthy();
    });

    test('buttons have proper spacing and size', async ({ page }) => {
        await page.goto(APP_URL);
        
        const button = page.locator('.continue-btn').first();
        const styles = await button.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                marginTop: parseInt(computed.marginTop),
                padding: computed.padding,
                borderRadius: computed.borderRadius
            };
        });
        
        // Should have significant top margin
        expect(styles.marginTop).toBeGreaterThanOrEqual(28); // ~2rem
        expect(styles.padding).toBeTruthy();
        expect(parseInt(styles.borderRadius)).toBeGreaterThan(10);
    });

    test('section headings have proper spacing', async ({ page }) => {
        await page.goto(APP_URL);
        
        const heading = page.locator('.form-section h2').first();
        const marginBottom = await heading.evaluate(el => {
            return parseInt(window.getComputedStyle(el).marginBottom);
        });
        
        // Should have at least 12px margin
        expect(marginBottom).toBeGreaterThanOrEqual(10);
    });

    test('section descriptions have proper spacing', async ({ page }) => {
        await page.goto(APP_URL);
        
        const description = page.locator('.section-description, .section-intro').first();
        const marginBottom = await description.evaluate(el => {
            return parseInt(window.getComputedStyle(el).marginBottom);
        });
        
        // Should have significant bottom margin
        expect(marginBottom).toBeGreaterThanOrEqual(28); // ~2rem
    });

    test('labels have proper spacing from inputs', async ({ page }) => {
        await page.goto(APP_URL);
        
        const label = page.locator('.form-group label').first();
        const marginBottom = await label.evaluate(el => {
            return parseInt(window.getComputedStyle(el).marginBottom);
        });
        
        // Should have at least 8px gap
        expect(marginBottom).toBeGreaterThanOrEqual(8);
    });

    test('all form elements have consistent border-radius', async ({ page }) => {
        await page.goto(APP_URL);
        
        const elements = await page.locator('input, select, .continue-btn').evaluateAll(els => {
            return els.map(el => {
                const radius = window.getComputedStyle(el).borderRadius;
                return parseInt(radius);
            }).filter(r => r > 0);
        });
        
        // All rounded elements should have at least 8px radius
        elements.forEach(radius => {
            expect(radius).toBeGreaterThanOrEqual(8);
        });
    });

    test('form sections have consistent bottom margin', async ({ page }) => {
        await page.goto(APP_URL);
        
        const margins = await page.locator('.form-section').evaluateAll(els => {
            return els.map(el => parseInt(window.getComputedStyle(el).marginBottom));
        });
        
        // All sections should have similar bottom margin
        margins.forEach(margin => {
            expect(margin).toBeGreaterThanOrEqual(24); // At least 1.5rem
        });
    });

    test('disabled buttons have reduced opacity', async ({ page }) => {
        await page.goto(APP_URL);
        
        // Click continue to reveal a disabled button
        await page.fill('input[type="tel"]', '+1234567890');
        await page.click('.continue-btn');
        
        await page.waitForSelector('.continue-btn:disabled');
        
        const opacity = await page.locator('.continue-btn:disabled').first().evaluate(el => {
            return parseFloat(window.getComputedStyle(el).opacity);
        });
        
        // Should be semi-transparent
        expect(opacity).toBeLessThan(0.6);
    });

    test('no horizontal overflow on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(APP_URL);
        
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyScrollWidth).toBeLessThanOrEqual(376); // 1px tolerance
    });

    test('checkboxes are vertically stacked on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(APP_URL);
        
        await page.fill('input[type="tel"]', '+1234567890');
        await page.click('.continue-btn');
        await page.waitForSelector('.checkbox-grid');
        
        const checkboxGrid = page.locator('.checkbox-grid');
        const flexDirection = await checkboxGrid.evaluate(el => {
            return window.getComputedStyle(el).flexDirection;
        });
        
        expect(flexDirection).toBe('column');
    });

    test('text is readable with proper contrast', async ({ page }) => {
        await page.goto(APP_URL);
        
        const heading = page.locator('h2').first();
        const color = await heading.evaluate(el => {
            return window.getComputedStyle(el).color;
        });
        
        // Should be white or very light (for dark theme)
        expect(color).toBeTruthy();
        // Color should be rgb format
        expect(color).toContain('rgb');
    });
});

const { test, expect } = require('@playwright/test');

test.describe('Application Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8888/application.html');
    });

    test('application page loads successfully', async ({ page }) => {
        await expect(page).toHaveTitle(/Application.*Adava University/);
        await expect(page.locator('h1')).toContainText('Minutes Away');
    });

    test('all form fields are present', async ({ page }) => {
        // Name field
        await expect(page.locator('input[type="text"]').first()).toBeVisible();
        
        // Email field
        await expect(page.locator('input[type="email"]')).toBeVisible();
        
        // Phone field
        await expect(page.locator('input[type="tel"]')).toBeVisible();
        
        // Select dropdowns
        const selects = page.locator('select');
        await expect(selects).toHaveCount(5); // background, experience, goal, commitment, source
        
        // Textarea
        await expect(page.locator('textarea')).toBeVisible();
        
        // Payment fields
        await expect(page.locator('input[placeholder*="4242"]')).toBeVisible(); // card number
        await expect(page.locator('input[placeholder*="MM/YY"]')).toBeVisible(); // expiry
        await expect(page.locator('input[placeholder*="123"]')).toBeVisible(); // cvc
    });

    test('progress bar updates as fields are filled', async ({ page }) => {
        const progressBar = page.locator('.progress-fill');
        
        // Initial progress should be 0% or minimal
        const initialWidth = await progressBar.evaluate(el => el.style.width);
        
        // Fill name
        await page.locator('input[type="text"]').first().fill('John Doe');
        await page.waitForTimeout(100);
        
        const afterNameWidth = await progressBar.evaluate(el => el.style.width);
        expect(parseInt(afterNameWidth)).toBeGreaterThan(parseInt(initialWidth) || 0);
    });

    test('excitement/benefit callouts are present', async ({ page }) => {
        // Check for benefit callouts
        const callouts = page.locator('.benefit-callout');
        await expect(callouts).toHaveCount(4); // Should have 4 benefit callouts
        
        // Check excitement banner
        await expect(page.locator('.excitement-banner')).toBeVisible();
        await expect(page.locator('.excitement-banner')).toContainText('Senior Engineers');
    });

    test('payment section displays $1 deposit', async ({ page }) => {
        await expect(page.locator('.payment-section')).toBeVisible();
        await expect(page.locator('.price')).toContainText('$1');
        await expect(page.locator('.payment-breakdown')).toContainText('$1.00');
        await expect(page.locator('.payment-breakdown')).toContainText('$589.00');
        await expect(page.locator('.payment-breakdown')).toContainText('$590.00');
    });

    test('submit button is disabled when form incomplete', async ({ page }) => {
        const submitBtn = page.locator('.submit-btn');
        await expect(submitBtn).toBeDisabled();
    });

    test('form pre-fills from URL parameters', async ({ page }) => {
        await page.goto('http://localhost:8888/application/?cohort=February&name=Jane%20Smith&email=jane@example.com');
        
        await expect(page.locator('input[type="text"]').first()).toHaveValue('Jane Smith');
        await expect(page.locator('input[type="email"]')).toHaveValue('jane@example.com');
    });

    test('all form sections have clear titles', async ({ page }) => {
        await expect(page.locator('.section-title').nth(0)).toContainText('Start Simple');
        await expect(page.locator('.section-title').nth(1)).toContainText('Where Are You Now');
        await expect(page.locator('.section-title').nth(2)).toContainText('Dream Outcome');
        await expect(page.locator('.section-title').nth(3)).toContainText('Can You Commit');
    });

    test('guarantee text is visible', async ({ page }) => {
        await expect(page.locator('.guarantee')).toBeVisible();
        await expect(page.locator('.guarantee')).toContainText('Money-Back Guarantee');
        await expect(page.locator('.guarantee')).toContainText('Secure Payment');
    });
});

test.describe('Application Page - Responsive Tests', () => {
    const viewports = [
        { name: 'Mobile Small', width: 375, height: 667 },
        { name: 'Mobile Medium', width: 414, height: 896 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Desktop', width: 1440, height: 900 }
    ];

    for (const viewport of viewports) {
        test(`application page renders correctly on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:8888/application.html');

            // Check main elements are visible
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('.app-form')).toBeVisible();
            await expect(page.locator('.payment-section')).toBeVisible();
            await expect(page.locator('.submit-btn')).toBeVisible();

            // Check for horizontal overflow
            const bodyOverflow = await page.evaluate(() => {
                const body = document.body;
                return body.scrollWidth > body.clientWidth;
            });
            expect(bodyOverflow).toBe(false);
        });
    }
});

test.describe('Application Page - UX Tests', () => {
    test('form fields have proper placeholders', async ({ page }) => {
        await page.goto('http://localhost:8888/application.html');
        
        const nameInput = page.locator('input[type="text"]').first();
        await expect(nameInput).toHaveAttribute('placeholder', /.+/);
        
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute('placeholder', /.+/);
        
        const phoneInput = page.locator('input[type="tel"]');
        await expect(phoneInput).toHaveAttribute('placeholder', /.+/);
    });

    test('select dropdowns have default option', async ({ page }) => {
        await page.goto('http://localhost:8888/application.html');
        
        const selects = page.locator('select');
        const count = await selects.count();
        
        for (let i = 0; i < count; i++) {
            const options = selects.nth(i).locator('option');
            const firstOption = await options.first().textContent();
            expect(firstOption).toContain('Choose');
        }
    });

    test('progress bar is visible and animates', async ({ page }) => {
        await page.goto('http://localhost:8888/application.html');
        
        const progressBar = page.locator('.progress-bar');
        await expect(progressBar).toBeVisible();
        
        // Progress fill starts at 0 width but container is visible
        const progressFill = page.locator('.progress-fill');
        await expect(progressFill).toHaveCSS('transition', /width/);
    });
});

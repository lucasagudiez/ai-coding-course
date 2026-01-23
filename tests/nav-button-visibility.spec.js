const { test, expect } = require('@playwright/test');

/**
 * Critical UI Test: Nav "Apply Now" Button Visibility
 * 
 * PROBLEM: Apply Now button gets cut off at bottom on production
 * SOLUTION: Automated visual test to prevent deployment if button is clipped
 * 
 * This test runs:
 * - On every commit (pre-commit hook via deploy script)
 * - On server before deployment (server-deploy.sh)
 * - Blocks deploy if button is cut off
 */

test.describe('Navigation "Apply Now" Button @critical', () => {
    
    test('Apply Now button is fully visible and not cut off - Desktop', async ({ page }) => {
        // Desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('http://localhost:8888/');
        
        // Wait for Vue to mount and nav to be visible
        await page.waitForSelector('nav.nav', { state: 'visible', timeout: 10000 });
        
        // Get the Apply Now button in nav
        const applyButton = page.locator('nav .nav-links a.nav-cta').first();
        await expect(applyButton).toBeVisible({ timeout: 10000 });
        
        // Verify button text (now "Reserve Your Spot" instead of "Apply Now")
        const buttonText = await applyButton.textContent();
        expect(buttonText.trim()).toMatch(/Reserve Your Spot|Apply Now/);
        
        // Get bounding box
        const buttonBox = await applyButton.boundingBox();
        expect(buttonBox, 'Button bounding box should exist').not.toBeNull();
        
        // Get viewport height
        const viewportHeight = page.viewportSize().height;
        
        // Get nav container
        const nav = page.locator('nav.nav').first();
        const navBox = await nav.boundingBox();
        expect(navBox, 'Nav bounding box should exist').not.toBeNull();
        
        // CRITICAL CHECKS:
        
        // 1. Button must be fully within nav container
        expect(buttonBox.y + buttonBox.height, 
            `Button extends ${(buttonBox.y + buttonBox.height) - (navBox.y + navBox.height)}px below nav`
        ).toBeLessThanOrEqual(navBox.y + navBox.height);
        
        // 2. Button bottom must be visible in viewport
        expect(buttonBox.y + buttonBox.height,
            `Button bottom (${buttonBox.y + buttonBox.height}px) is cut off by viewport (${viewportHeight}px)`
        ).toBeLessThan(viewportHeight);
        
        // 3. No overflow hidden cutting off the button
        const navStyles = await nav.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                overflow: computed.overflow,
                overflowY: computed.overflowY,
                height: computed.height,
                maxHeight: computed.maxHeight
            };
        });
        
        // If nav has overflow:hidden, button must fit within nav height
        if (navStyles.overflow === 'hidden' || navStyles.overflowY === 'hidden') {
            const navHeight = parseFloat(navStyles.height);
            expect(buttonBox.height,
                `Button (${buttonBox.height}px) too tall for nav with overflow:hidden (${navHeight}px)`
            ).toBeLessThanOrEqual(navHeight);
        }
        
        // 4. Button text must be fully visible (not clipped)
        expect(buttonText.trim()).toBe('Apply Now');
        
        // 5. Check if button has proper padding and isn't touching edges
        const buttonStyles = await applyButton.evaluate(el => {
            const computed = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
                paddingTop: parseFloat(computed.paddingTop),
                paddingBottom: parseFloat(computed.paddingBottom),
                lineHeight: computed.lineHeight,
                top: rect.top,
                bottom: rect.bottom
            };
        });
        
        expect(buttonStyles.paddingTop, 'Button needs top padding').toBeGreaterThan(5);
        expect(buttonStyles.paddingBottom, 'Button needs bottom padding').toBeGreaterThan(5);
        
        console.log('✅ Nav button visibility check passed:');
        console.log(`   Button position: y=${buttonBox.y}px, height=${buttonBox.height}px`);
        console.log(`   Button bottom: ${buttonBox.y + buttonBox.height}px`);
        console.log(`   Nav bottom: ${navBox.y + navBox.height}px`);
        console.log(`   Viewport height: ${viewportHeight}px`);
    });
    
    test('Apply Now button is fully visible - Mobile', async ({ page }) => {
        // Mobile viewport (iPhone 13)
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:8888/');
        
        // Wait for nav
        await page.waitForSelector('nav.nav', { state: 'visible', timeout: 10000 });
        
        // On mobile, button might be in hamburger menu
        const applyButton = page.locator('nav .nav-links a.nav-cta').first();
        
        // Check if button exists
        const buttonCount = await applyButton.count();
        if (buttonCount === 0) {
            // Mobile might have button in collapsed menu - check if toggle exists
            const navToggle = page.locator('.nav-toggle, .hamburger, [aria-label*="menu"]');
            if (await navToggle.count() > 0) {
                console.log('   Mobile: Button in hamburger menu (acceptable)');
                return; // This is OK for mobile
            }
            throw new Error('Apply Now button not found on mobile nav');
        }
        
        // If button is visible, check it's not cut off
        if (await applyButton.isVisible()) {
            const buttonBox = await applyButton.boundingBox();
            const viewportHeight = page.viewportSize().height;
            
            expect(buttonBox.y + buttonBox.height,
                `Mobile: Button bottom (${buttonBox.y + buttonBox.height}px) cut off by viewport (${viewportHeight}px)`
            ).toBeLessThan(viewportHeight);
            
            console.log('✅ Mobile nav button visibility check passed');
        }
    });
    
    test('Apply Now button has correct styling and hover state', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('http://localhost:8888/');
        
        // Wait for nav
        await page.waitForSelector('nav.nav', { state: 'visible', timeout: 10000 });
        
        const applyButton = page.locator('nav .nav-links a.nav-cta').first();
        await expect(applyButton).toBeVisible({ timeout: 10000 });
        
        // Check initial styles
        const styles = await applyButton.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                padding: computed.padding,
                border: computed.border,
                borderRadius: computed.borderRadius,
                backgroundColor: computed.backgroundColor,
                color: computed.color
            };
        });
        
        // Button should be visible (not display:none or visibility:hidden)
        expect(styles.display).not.toBe('none');
        
        // Should have proper styling
        expect(styles.padding, 'Button needs padding').not.toBe('0px');
        
        console.log('✅ Button styling check passed');
    });
});

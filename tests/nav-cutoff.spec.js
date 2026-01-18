/**
 * Navigation Cutoff Detection Tests
 * 
 * Ensures the navigation bar and all its elements are not cut off at various viewport sizes.
 */

const { test, expect } = require('@playwright/test');

test.describe('Navigation Cutoff Detection @smoke', () => {
    const viewports = [
        { name: 'Desktop Large', width: 1440, height: 900 },
        { name: 'Desktop', width: 1280, height: 800 },
        { name: 'Laptop', width: 1024, height: 768 },
        { name: 'Tablet Landscape', width: 900, height: 600 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
    ];

    for (const viewport of viewports) {
        test(`Navigation elements not cut off at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            
            // Wait for navigation to be visible
            await page.waitForSelector('.nav', { state: 'visible' });
            
            // Get navigation container
            const nav = await page.locator('.nav').first();
            const navBox = await nav.boundingBox();
            
            expect(navBox).toBeTruthy();
            expect(navBox.height).toBeGreaterThan(0);
            
            // Check if nav links are visible at this viewport
            const navLinks = page.locator('.nav-links');
            const isNavLinksVisible = await navLinks.isVisible();
            
            if (isNavLinksVisible) {
                // If nav links are visible, check each link is not cut off
                const links = await page.locator('.nav-links a').all();
                
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const linkBox = await link.boundingBox();
                    
                    if (linkBox) {
                        // Check link is within nav bounds
                        expect(linkBox.y).toBeGreaterThanOrEqual(navBox.y);
                        expect(linkBox.y + linkBox.height).toBeLessThanOrEqual(navBox.y + navBox.height + 2); // 2px tolerance
                        
                        // Check link text is not cut off
                        const text = await link.textContent();
                        expect(text?.trim().length).toBeGreaterThan(0);
                    }
                }
                
                // Special check for "Apply Now" button (has padding and border)
                const applyBtn = page.locator('.nav-cta').first();
                const applyBtnVisible = await applyBtn.isVisible();
                
                if (applyBtnVisible) {
                    const btnBox = await applyBtn.boundingBox();
                    
                    if (btnBox) {
                        // Button should be fully within nav bounds
                        expect(btnBox.y).toBeGreaterThanOrEqual(navBox.y);
                        expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(navBox.y + navBox.height + 2);
                        
                        // Button should have visible text
                        const btnText = await applyBtn.textContent();
                        expect(btnText?.trim()).toBe('Apply Now');
                        
                        // Button should not be cut off horizontally
                        expect(btnBox.x).toBeGreaterThanOrEqual(0);
                        expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(viewport.width);
                    }
                }
            }
            
            // Logo should always be visible and not cut off
            const logo = page.locator('.logo').first();
            const logoBox = await logo.boundingBox();
            
            expect(logoBox).toBeTruthy();
            expect(logoBox.y).toBeGreaterThanOrEqual(navBox.y);
            expect(logoBox.y + logoBox.height).toBeLessThanOrEqual(navBox.y + navBox.height + 2);
        });
    }
    
    test('Navigation button has adequate vertical space', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        
        const nav = await page.locator('.nav').first();
        const navBox = await nav.boundingBox();
        
        // Navigation should have at least 60px height (20px padding top + 20px bottom + 20px+ for content)
        expect(navBox.height).toBeGreaterThanOrEqual(60);
        
        // Check "Apply Now" button has proper spacing
        const applyBtn = page.locator('.nav-cta').first();
        const isVisible = await applyBtn.isVisible();
        
        if (isVisible) {
            const btnBox = await applyBtn.boundingBox();
            expect(btnBox).toBeTruthy();
            
            // Button should have vertical space within nav
            const topSpace = btnBox.y - navBox.y;
            const bottomSpace = (navBox.y + navBox.height) - (btnBox.y + btnBox.height);
            
            // At least 8px space on top and bottom
            expect(topSpace).toBeGreaterThanOrEqual(8);
            expect(bottomSpace).toBeGreaterThanOrEqual(8);
        }
    });
    
    test('Navigation overflow hidden hides wrapped items gracefully', async ({ page }) => {
        // Test at a width where items might wrap (around 900px)
        await page.setViewportSize({ width: 900, height: 900 });
        await page.goto('/');
        
        const nav = await page.locator('.nav').first();
        const navBox = await nav.boundingBox();
        
        // Get computed style of nav-links
        const navLinks = page.locator('.nav-links').first();
        const overflow = await navLinks.evaluate(el => window.getComputedStyle(el).overflow);
        
        // Should have overflow hidden to gracefully hide items that don't fit
        expect(overflow).toBe('hidden');
        
        // No horizontal scrollbar should appear on body
        const bodyOverflowX = await page.evaluate(() => {
            return window.getComputedStyle(document.body).overflowX;
        });
        expect(bodyOverflowX).not.toBe('scroll');
    });
});

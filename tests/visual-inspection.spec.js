/**
 * Visual Inspection Test Suite
 * 
 * Takes comprehensive screenshots across devices, orientations, and page sections
 * to identify visual bugs, layout issues, text overflow, etc.
 */

const { test, expect } = require('@playwright/test');

// Device configurations with landscape variants
const DEVICES = {
    'iPhone SE': { width: 375, height: 667 },
    'iPhone SE Landscape': { width: 667, height: 375 },
    'iPhone 14 Pro': { width: 393, height: 852 },
    'iPhone 14 Pro Landscape': { width: 852, height: 393 },
    'iPad Mini': { width: 768, height: 1024 },
    'iPad Mini Landscape': { width: 1024, height: 768 },
    'iPad Pro': { width: 1024, height: 1366 },
    'iPad Pro Landscape': { width: 1366, height: 1024 },
    'Desktop HD': { width: 1366, height: 768 },
    'Desktop Full HD': { width: 1920, height: 1080 },
    'Desktop 4K': { width: 2560, height: 1440 }
};

// Page sections to capture
const SECTIONS = [
    { name: 'hero', selector: 'header.hero, .hero-section', scroll: 0 },
    { name: 'instructors', selector: '#instructors, .instructors-section', scroll: true },
    { name: 'curriculum', selector: '#curriculum, .curriculum-section', scroll: true },
    { name: 'testimonials', selector: '#testimonials, .testimonials-section', scroll: true },
    { name: 'cohorts', selector: '#cohorts, .cohort-section', scroll: true },
    { name: 'footer', selector: 'footer', scroll: true }
];

test.describe('Visual Inspection - Full Page Screenshots', () => {
    for (const [deviceName, viewport] of Object.entries(DEVICES)) {
        test(`Full page - ${deviceName} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto('/', { waitUntil: 'networkidle' });
            
            // Wait for animations to settle
            await page.waitForTimeout(2000);
            
            // Take full page screenshot
            await page.screenshot({
                path: `test-results/visual/${deviceName.replace(/\s+/g, '-')}-full-page.png`,
                fullPage: true
            });
        });
    }
});

test.describe('Visual Inspection - Section Screenshots', () => {
    for (const [deviceName, viewport] of Object.entries(DEVICES)) {
        for (const section of SECTIONS) {
            test(`${section.name} section - ${deviceName}`, async ({ page }) => {
                await page.setViewportSize(viewport);
                await page.goto('/', { waitUntil: 'networkidle' });
                
                // Scroll to section if needed
                if (section.scroll) {
                    const element = await page.locator(section.selector).first();
                    await element.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1000); // Wait for animations
                }
                
                // Take section screenshot
                const element = await page.locator(section.selector).first();
                if (await element.isVisible()) {
                    await element.screenshot({
                        path: `test-results/visual/${deviceName.replace(/\s+/g, '-')}-${section.name}.png`
                    });
                }
            });
        }
    }
});

test.describe('Visual Bug Detection', () => {
    const criticalDevices = ['iPhone SE', 'iPad Mini', 'Desktop HD'];
    
    for (const deviceName of criticalDevices) {
        test(`Check for visual bugs - ${deviceName}`, async ({ page }) => {
            const viewport = DEVICES[deviceName];
            await page.setViewportSize(viewport);
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Check for text overflow
            const overflowingElements = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('h1, h2, h3, p, button, a');
                elements.forEach(el => {
                    if (el.scrollWidth > el.clientWidth + 2) { // +2px tolerance
                        issues.push({
                            tag: el.tagName,
                            text: el.textContent.substring(0, 50),
                            scrollWidth: el.scrollWidth,
                            clientWidth: el.clientWidth
                        });
                    }
                });
                return issues;
            });
            
            // Check for horizontal scroll
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            // Check for overlapping elements
            const overlappingElements = await page.evaluate(() => {
                const issues = [];
                const cards = document.querySelectorAll('.instructor-card, .cohort-card, .day-card, .project-card');
                cards.forEach((card, i) => {
                    const rect1 = card.getBoundingClientRect();
                    cards.forEach((otherCard, j) => {
                        if (i >= j) return;
                        const rect2 = otherCard.getBoundingClientRect();
                        const overlap = !(rect1.right < rect2.left || 
                                        rect1.left > rect2.right || 
                                        rect1.bottom < rect2.top || 
                                        rect1.top > rect2.bottom);
                        if (overlap) {
                            issues.push({
                                card1: card.className,
                                card2: otherCard.className
                            });
                        }
                    });
                });
                return issues;
            });
            
            // Check for invisible text (white on white, etc.)
            const invisibleText = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('h1, h2, h3, p, a, button, span');
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const bgColor = style.backgroundColor;
                    
                    // Check if both are very light (potential white on white)
                    if (color === 'rgba(0, 0, 0, 0)' || color === 'rgb(255, 255, 255)') {
                        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'rgb(255, 255, 255)') {
                            issues.push({
                                tag: el.tagName,
                                text: el.textContent.substring(0, 30),
                                color: color,
                                bgColor: bgColor
                            });
                        }
                    }
                });
                return issues;
            });
            
            // Check for broken images
            const brokenImages = await page.evaluate(() => {
                const issues = [];
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (!img.complete || img.naturalWidth === 0) {
                        issues.push({
                            src: img.src,
                            alt: img.alt
                        });
                    }
                });
                return issues;
            });
            
            // Log findings
            console.log(`\n=== Visual Bug Detection: ${deviceName} ===`);
            console.log(`Overflowing text elements: ${overflowingElements.length}`);
            if (overflowingElements.length > 0) {
                console.log('Overflow issues:', JSON.stringify(overflowingElements, null, 2));
            }
            
            console.log(`Horizontal scroll: ${hasHorizontalScroll ? '❌ YES (BUG!)' : '✅ NO'}`);
            console.log(`Overlapping elements: ${overlappingElements.length}`);
            if (overlappingElements.length > 0) {
                console.log('Overlap issues:', JSON.stringify(overlappingElements, null, 2));
            }
            
            console.log(`Invisible text elements: ${invisibleText.length}`);
            console.log(`Broken images: ${brokenImages.length}`);
            if (brokenImages.length > 0) {
                console.log('Broken images:', JSON.stringify(brokenImages, null, 2));
            }
            
            // Take screenshot for visual review
            await page.screenshot({
                path: `test-results/visual/${deviceName.replace(/\s+/g, '-')}-bug-check.png`,
                fullPage: true
            });
            
            // Assertions
            expect(hasHorizontalScroll, 'Page should not have horizontal scroll').toBe(false);
            expect(brokenImages.length, 'No images should be broken').toBe(0);
        });
    }
});

test.describe('Interactive Elements - Visual States', () => {
    test('Button hover states - Desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/', { waitUntil: 'networkidle' });
        
        const buttons = await page.locator('button, .btn, .cta-button').all();
        
        for (let i = 0; i < Math.min(buttons.length, 5); i++) {
            const button = buttons[i];
            await button.scrollIntoViewIfNeeded();
            
            // Normal state
            await button.screenshot({
                path: `test-results/visual/button-${i}-normal.png`
            });
            
            // Hover state
            await button.hover();
            await page.waitForTimeout(500);
            await button.screenshot({
                path: `test-results/visual/button-${i}-hover.png`
            });
        }
    });
    
    test('Form input states - Mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/', { waitUntil: 'networkidle' });
        
        const inputs = await page.locator('input[type="text"], input[type="email"]').all();
        
        for (let i = 0; i < Math.min(inputs.length, 3); i++) {
            const input = inputs[i];
            await input.scrollIntoViewIfNeeded();
            
            // Empty state
            await input.screenshot({
                path: `test-results/visual/input-${i}-empty.png`
            });
            
            // Focused state
            await input.focus();
            await page.waitForTimeout(300);
            await input.screenshot({
                path: `test-results/visual/input-${i}-focused.png`
            });
            
            // Filled state
            await input.fill('Test input');
            await page.waitForTimeout(300);
            await input.screenshot({
                path: `test-results/visual/input-${i}-filled.png`
            });
        }
    });
});

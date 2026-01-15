/**
 * Quick Visual Bug Detection
 * Tests critical devices and checks for common visual issues
 */

const { test, expect } = require('@playwright/test');

// Critical devices only
const DEVICES = [
    { name: 'Mobile-Portrait', width: 375, height: 667 },
    { name: 'Mobile-Landscape', width: 667, height: 375 },
    { name: 'Tablet-Portrait', width: 768, height: 1024 },
    { name: 'Tablet-Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1920, height: 1080 }
];

test.describe('Visual Bug Detection @visual', () => {
    for (const device of DEVICES) {
        test(`Check visual bugs - ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
            await page.setViewportSize({ width: device.width, height: device.height });
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            console.log(`\n${'='.repeat(70)}`);
            console.log(`VISUAL BUG CHECK: ${device.name} (${device.width}x${device.height})`);
            console.log('='.repeat(70));
            
            // 1. Check for horizontal scroll
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            console.log(`[${hasHorizontalScroll ? '❌' : '✅'}] Horizontal scroll: ${hasHorizontalScroll ? 'FOUND (BUG!)' : 'None'}`);
            
            // 2. Check for text overflow
            const overflowingElements = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('h1, h2, h3, p, button, .btn');
                elements.forEach(el => {
                    if (el.scrollWidth > el.clientWidth + 5) {
                        issues.push({
                            tag: el.tagName,
                            class: el.className,
                            text: el.textContent.trim().substring(0, 40) + '...',
                            overflow: `${el.scrollWidth}px > ${el.clientWidth}px`
                        });
                    }
                });
                return issues;
            });
            console.log(`[${overflowingElements.length > 0 ? '⚠️' : '✅'}] Text overflow: ${overflowingElements.length} element(s)`);
            if (overflowingElements.length > 0) {
                console.log('  Issues found:');
                overflowingElements.forEach((issue, i) => {
                    console.log(`    ${i+1}. ${issue.tag}.${issue.class}: "${issue.text}" (${issue.overflow})`);
                });
            }
            
            // 3. Check for broken images
            const brokenImages = await page.evaluate(() => {
                const issues = [];
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (!img.complete || img.naturalWidth === 0) {
                        issues.push({
                            src: img.src.substring(img.src.lastIndexOf('/') + 1),
                            alt: img.alt || 'No alt text'
                        });
                    }
                });
                return issues;
            });
            console.log(`[${brokenImages.length > 0 ? '❌' : '✅'}] Broken images: ${brokenImages.length}`);
            if (brokenImages.length > 0) {
                console.log('  Broken images:');
                brokenImages.forEach((img, i) => {
                    console.log(`    ${i+1}. ${img.src} (alt: "${img.alt}")`);
                });
            }
            
            // 4. Check for overlapping cards
            const overlappingCards = await page.evaluate(() => {
                const issues = [];
                const cards = document.querySelectorAll('.instructor-card, .cohort-card, .day-card');
                const rects = Array.from(cards).map(card => ({
                    element: card.className,
                    rect: card.getBoundingClientRect()
                }));
                
                for (let i = 0; i < rects.length; i++) {
                    for (let j = i + 1; j < rects.length; j++) {
                        const r1 = rects[i].rect;
                        const r2 = rects[j].rect;
                        const overlap = !(r1.right < r2.left + 10 || 
                                        r1.left > r2.right - 10 || 
                                        r1.bottom < r2.top + 10 || 
                                        r1.top > r2.bottom - 10);
                        if (overlap && r1.top < r2.bottom && r2.top < r1.bottom) {
                            issues.push(`${rects[i].element} overlaps ${rects[j].element}`);
                        }
                    }
                }
                return issues;
            });
            console.log(`[${overlappingCards.length > 0 ? '⚠️' : '✅'}] Overlapping cards: ${overlappingCards.length}`);
            if (overlappingCards.length > 0) {
                overlappingCards.forEach((issue, i) => {
                    console.log(`    ${i+1}. ${issue}`);
                });
            }
            
            // 5. Check for tiny text
            const tinyText = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('p, span, a, button');
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const fontSize = parseFloat(style.fontSize);
                    if (fontSize < 12 && el.textContent.trim().length > 0) {
                        issues.push({
                            tag: el.tagName,
                            text: el.textContent.trim().substring(0, 30),
                            fontSize: `${fontSize}px`
                        });
                    }
                });
                return issues;
            });
            console.log(`[${tinyText.length > 0 ? '⚠️' : '✅'}] Tiny text (<12px): ${tinyText.length} element(s)`);
            
            // 6. Check touch target sizes (mobile only)
            if (device.width <= 768) {
                const smallTouchTargets = await page.evaluate(() => {
                    const issues = [];
                    const interactive = document.querySelectorAll('button, a, input, [onclick]');
                    interactive.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            if (rect.width < 44 || rect.height < 44) {
                                issues.push({
                                    tag: el.tagName,
                                    text: el.textContent?.trim().substring(0, 20) || el.placeholder || 'No text',
                                    size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`
                                });
                            }
                        }
                    });
                    return issues;
                });
                console.log(`[${smallTouchTargets.length > 0 ? '⚠️' : '✅'}] Small touch targets (<44px): ${smallTouchTargets.length}`);
                if (smallTouchTargets.length > 3) {
                    console.log(`  First 3 issues:`);
                    smallTouchTargets.slice(0, 3).forEach((issue, i) => {
                        console.log(`    ${i+1}. ${issue.tag}: "${issue.text}" (${issue.size})`);
                    });
                }
            }
            
            // 7. Check for elements outside viewport
            const outsideViewport = await page.evaluate(() => {
                const issues = [];
                const elements = document.querySelectorAll('section, .card, .btn, img');
                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.right > window.innerWidth + 50) {
                        issues.push({
                            tag: el.tagName,
                            class: el.className,
                            position: `extends ${Math.round(rect.right - window.innerWidth)}px beyond right edge`
                        });
                    }
                });
                return issues;
            });
            console.log(`[${outsideViewport.length > 0 ? '❌' : '✅'}] Elements outside viewport: ${outsideViewport.length}`);
            if (outsideViewport.length > 0) {
                outsideViewport.slice(0, 3).forEach((issue, i) => {
                    console.log(`    ${i+1}. ${issue.tag}.${issue.class}: ${issue.position}`);
                });
            }
            
            // Take full page screenshot for manual review
            await page.screenshot({
                path: `test-results/visual/${device.name}-fullpage.png`,
                fullPage: true
            });
            console.log(`📸 Screenshot saved: test-results/visual/${device.name}-fullpage.png`);
            
            // Critical assertions
            expect(hasHorizontalScroll, 'Page should not have horizontal scroll').toBe(false);
            expect(brokenImages.length, 'All images should load properly').toBe(0);
            expect(outsideViewport.length, 'No elements should extend beyond viewport').toBe(0);
        });
    }
});

test.describe('Section Screenshots @visual', () => {
    const sections = [
        { name: 'Hero', selector: 'header.hero' },
        { name: 'Instructors', selector: '#instructors' },
        { name: 'Curriculum', selector: '#curriculum' },
        { name: 'Cohorts', selector: '#cohorts' }
    ];
    
    test('Capture key sections - Mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/', { waitUntil: 'networkidle' });
        
        for (const section of sections) {
            const element = page.locator(section.selector).first();
            if (await element.isVisible()) {
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                await element.screenshot({
                    path: `test-results/visual/Mobile-${section.name}.png`
                });
                console.log(`📸 ${section.name} section captured (Mobile)`);
            }
        }
    });
    
    test('Capture key sections - Desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/', { waitUntil: 'networkidle' });
        
        for (const section of sections) {
            const element = page.locator(section.selector).first();
            if (await element.isVisible()) {
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                await element.screenshot({
                    path: `test-results/visual/Desktop-${section.name}.png`
                });
                console.log(`📸 ${section.name} section captured (Desktop)`);
            }
        }
    });
});

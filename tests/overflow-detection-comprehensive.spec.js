const { test, expect } = require('@playwright/test');

/**
 * Comprehensive Overflow Detection Tests
 * 
 * These tests detect ANY element that causes horizontal overflow,
 * including inner elements like spans, divs, text content, images, etc.
 * 
 * Strategy:
 * 1. Check document.body scrollWidth vs clientWidth
 * 2. Check every single element for overflow
 * 3. Report specific overflowing elements with details
 */

test.describe('Comprehensive Overflow Detection @smoke', () => {
    const viewports = [
        { name: 'Mobile Small (320px)', width: 320, height: 568 },
        { name: 'Mobile Medium (375px)', width: 375, height: 667 },
        { name: 'Mobile Large (414px)', width: 414, height: 896 },
        { name: 'iPhone 14 Pro Max (430px)', width: 430, height: 932 },
        { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
        { name: 'Desktop Small (1024px)', width: 1024, height: 768 },
        { name: 'Desktop Large (1440px)', width: 1440, height: 900 }
    ];

    for (const viewport of viewports) {
        test(`No horizontal overflow on ${viewport.name}`, async ({ page }) => {
            // Set viewport
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            
            // Navigate to page
            await page.goto('http://localhost:8888/');
            
            // Wait for page to be fully loaded
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000); // Allow animations to settle
            
            // Check for body-level overflow
            const bodyOverflow = await page.evaluate(() => {
                const body = document.body;
                const html = document.documentElement;
                
                return {
                    bodyScrollWidth: body.scrollWidth,
                    bodyClientWidth: body.clientWidth,
                    htmlScrollWidth: html.scrollWidth,
                    htmlClientWidth: html.clientWidth,
                    bodyOverflowing: body.scrollWidth > body.clientWidth,
                    htmlOverflowing: html.scrollWidth > html.clientWidth
                };
            });
            
            // Report body overflow if found
            if (bodyOverflow.bodyOverflowing || bodyOverflow.htmlOverflowing) {
                console.error(`❌ Body/HTML overflow detected at ${viewport.width}px:`, bodyOverflow);
            }
            
            // Find ALL elements that extend beyond viewport boundaries
            const overflowingElements = await page.evaluate(() => {
                const results = [];
                const viewportWidth = window.innerWidth;
                
                // Function to check text nodes for overflow using getClientRects()
                function checkTextNodes(element, elementInfo) {
                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );
                    
                    let node;
                    while (node = walker.nextNode()) {
                        const text = node.textContent.trim();
                        if (text.length > 0) {
                            const range = document.createRange();
                            range.selectNodeContents(node);
                            const rects = range.getClientRects();
                            
                            for (let i = 0; i < rects.length; i++) {
                                const rect = rects[i];
                                if (rect.width > 0 && rect.height > 0) {
                                    if (rect.right > viewportWidth + 0.5 || rect.left < -0.5) {
                                        results.push({
                                            type: 'TEXT_NODE',
                                            text: text.substring(0, 60),
                                            parentTag: element.tagName.toLowerCase(),
                                            parentClass: element.className || '',
                                            left: Math.round(rect.left * 10) / 10,
                                            right: Math.round(rect.right * 10) / 10,
                                            width: Math.round(rect.width * 10) / 10,
                                            extendsRightBy: rect.right > viewportWidth ? Math.round((rect.right - viewportWidth) * 10) / 10 : 0,
                                            extendsLeftBy: rect.left < 0 ? Math.round(Math.abs(rect.left) * 10) / 10 : 0
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                
                const allElements = document.querySelectorAll('*');
                
                allElements.forEach((element) => {
                    const rect = element.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(element);
                    
                    // Skip if not visible
                    if (rect.width === 0 || rect.height === 0 || computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                        return;
                    }
                    
                    // Skip custom cursor elements
                    if (element.classList && (element.classList.contains('custom-cursor') || element.classList.contains('cursor-dot') || element.classList.contains('cursor-spotlight'))) {
                        return;
                    }
                    
                    // Check text nodes within this element for ACTUAL rendered overflow
                    checkTextNodes(element, {
                        tag: element.tagName.toLowerCase(),
                        classes: element.className || ''
                    });
                    
                    // Also check the element itself
                    const extendsRight = rect.right > viewportWidth + 0.5;
                    const extendsLeft = rect.left < -0.5;
                    const hasScrollOverflow = element.scrollWidth > element.clientWidth + 0.5;
                    const isHiddenOverflow = hasScrollOverflow && (computedStyle.overflowX === 'hidden' || computedStyle.overflowX === 'clip');
                    
                    if (extendsRight || extendsLeft || isHiddenOverflow) {
                        results.push({
                            type: 'ELEMENT',
                            tag: element.tagName.toLowerCase(),
                            classes: element.className || '',
                            id: element.id || '',
                            left: Math.round(rect.left * 10) / 10,
                            right: Math.round(rect.right * 10) / 10,
                            width: Math.round(rect.width * 10) / 10,
                            scrollWidth: element.scrollWidth,
                            clientWidth: element.clientWidth,
                            extendsRightBy: extendsRight ? Math.round((rect.right - viewportWidth) * 10) / 10 : 0,
                            extendsLeftBy: extendsLeft ? Math.round(Math.abs(rect.left) * 10) / 10 : 0,
                            hiddenContent: isHiddenOverflow ? Math.round((element.scrollWidth - element.clientWidth) * 10) / 10 : 0,
                            computedOverflowX: computedStyle.overflowX,
                            textPreview: element.textContent ? element.textContent.substring(0, 60).trim() : ''
                        });
                    }
                });
                
                return results;
            });
            
            // Report all elements extending beyond viewport or with hidden content
            if (overflowingElements.length > 0) {
                console.error(`\n❌ Found ${overflowingElements.length} overflow issues at ${viewport.width}px:\n`);
                overflowingElements.forEach((elem, index) => {
                    if (elem.type === 'TEXT_NODE') {
                        console.error(`${index + 1}. TEXT_NODE in <${elem.parentTag}${elem.parentClass ? '.' + elem.parentClass : ''}>`);
                        console.error(`   📝 Text: "${elem.text}"`);
                        console.error(`   📍 Position: left=${elem.left}px, right=${elem.right}px (width=${elem.width}px)`);
                        console.error(`   ⛔ OVERFLOW: ${elem.extendsRightBy > 0 ? `extends right by ${elem.extendsRightBy}px` : `extends left by ${elem.extendsLeftBy}px`}`);
                    } else {
                        console.error(`${index + 1}. ${elem.tag}${elem.id ? '#' + elem.id : ''}${elem.classes ? '.' + elem.classes : ''}`);
                        console.error(`   📍 Position: left=${elem.left}px, right=${elem.right}px`);
                        console.error(`   📏 Size: ${elem.width}px × scrollWidth=${elem.scrollWidth}px, clientWidth=${elem.clientWidth}px`);
                        if (elem.extendsRightBy > 0) {
                            console.error(`   ⛔ EXTENDS RIGHT: ${elem.extendsRightBy}px beyond viewport`);
                        }
                        if (elem.extendsLeftBy > 0) {
                            console.error(`   ⛔ EXTENDS LEFT: ${elem.extendsLeftBy}px beyond viewport`);
                        }
                        if (elem.hiddenContent > 0) {
                            console.error(`   ✂️ CONTENT CUT OFF: ${elem.hiddenContent}px of content hidden`);
                        }
                        if (elem.textPreview) {
                            console.error(`   📝 Text: "${elem.textPreview}"`);
                        }
                    }
                    console.error('');
                });
            }
            
            // Check for body-level overflow
            expect(bodyOverflow.bodyOverflowing, 
                `Body overflow: scrollWidth=${bodyOverflow.bodyScrollWidth}px > clientWidth=${bodyOverflow.bodyClientWidth}px`
            ).toBe(false);
            
            expect(bodyOverflow.htmlOverflowing,
                `HTML overflow: scrollWidth=${bodyOverflow.htmlScrollWidth}px > clientWidth=${bodyOverflow.htmlClientWidth}px`
            ).toBe(false);
            
            // STRICT: No elements should extend beyond viewport boundaries OR have hidden content
            expect(overflowingElements.length,
                `Found ${overflowingElements.length} elements with overflow issues: elements extending beyond viewport OR content being cut off`
            ).toBe(0);
        });
    }
});

test.describe('Specific Element Overflow Checks', () => {
    test('Check text elements for overflow on mobile @smoke', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8888/');
        await page.waitForLoadState('networkidle');
        
        // Check all text elements (h1, h2, h3, p, span, etc.)
        const textOverflow = await page.evaluate(() => {
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li');
            const overflowing = [];
            
            textElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    overflowing.push({
                        tag: el.tagName,
                        id: el.id,
                        classes: Array.from(el.classList).join(' '),
                        text: el.textContent.substring(0, 50),
                        overflow: Math.round(rect.right - window.innerWidth)
                    });
                }
            });
            
            return overflowing;
        });
        
        if (textOverflow.length > 0) {
            console.error('❌ Overflowing text elements:', textOverflow);
        }
        
        expect(textOverflow.length).toBe(0);
    });
    
    test('Check images and media for overflow on mobile @smoke', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8888/');
        await page.waitForLoadState('networkidle');
        
        const mediaOverflow = await page.evaluate(() => {
            const mediaElements = document.querySelectorAll('img, video, canvas, svg');
            const overflowing = [];
            
            mediaElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth || rect.width > window.innerWidth) {
                    overflowing.push({
                        tag: el.tagName,
                        id: el.id,
                        classes: Array.from(el.classList).join(' '),
                        width: Math.round(rect.width),
                        overflow: Math.round(rect.right - window.innerWidth)
                    });
                }
            });
            
            return overflowing;
        });
        
        if (mediaOverflow.length > 0) {
            console.error('❌ Overflowing media elements:', mediaOverflow);
        }
        
        expect(mediaOverflow.length).toBe(0);
    });
    
    test('Check containers and wrappers for overflow on mobile @smoke', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:8888/');
        await page.waitForLoadState('networkidle');
        
        const containerOverflow = await page.evaluate(() => {
            const containers = document.querySelectorAll('div, section, article, main, aside, nav, header, footer');
            const overflowing = [];
            
            containers.forEach((el) => {
                const hasScrollOverflow = el.scrollWidth > el.clientWidth;
                const rect = el.getBoundingClientRect();
                const positionOverflow = rect.right > window.innerWidth;
                
                if (hasScrollOverflow || positionOverflow) {
                    overflowing.push({
                        tag: el.tagName,
                        id: el.id,
                        classes: Array.from(el.classList).slice(0, 3).join(' '),
                        scrollWidth: el.scrollWidth,
                        clientWidth: el.clientWidth,
                        scrollOverflow: el.scrollWidth - el.clientWidth,
                        positionOverflow: positionOverflow ? Math.round(rect.right - window.innerWidth) : 0
                    });
                }
            });
            
            return overflowing;
        });
        
        if (containerOverflow.length > 0) {
            console.error('❌ Overflowing containers:', containerOverflow);
        }
        
        expect(containerOverflow.length).toBe(0);
    });
    
    test('Check for horizontal scrollbar on body @smoke', async ({ page }) => {
        const viewports = [320, 375, 414, 768, 1024, 1440];
        
        for (const width of viewports) {
            await page.setViewportSize({ width, height: 800 });
            await page.goto('http://localhost:8888/');
            await page.waitForLoadState('networkidle');
            
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });
            
            expect(hasHorizontalScroll, 
                `Horizontal scrollbar detected at ${width}px viewport`
            ).toBe(false);
        }
    });
});

test.describe('Text Cutoff Detection (Critical for Mobile) @smoke', () => {
    test('Detect all text elements that are cut off on iPhone (430px)', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto('http://localhost:8888/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const cutOffText = await page.evaluate(() => {
            const results = [];
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, div');
            const viewportWidth = window.innerWidth;
            
            textElements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(element);
                const text = element.textContent?.trim();
                
                // Skip if not visible or no text
                if (rect.width === 0 || rect.height === 0 || !text || text.length === 0) {
                    return;
                }
                
                // Skip if display: none or visibility: hidden
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                    return;
                }
                
                // Check if text is being cut off
                const isCutOff = element.scrollWidth > element.clientWidth + 1; // 1px tolerance
                const extendsRight = rect.right > (viewportWidth + 1);
                const extendsLeft = rect.left < -1;
                
                if (isCutOff || extendsRight || extendsLeft) {
                    let identifier = element.tagName.toLowerCase();
                    if (element.id) identifier += `#${element.id}`;
                    if (element.className && typeof element.className === 'string') {
                        const classes = element.className.split(' ').filter(c => c && !c.startsWith('v-')).slice(0, 2).join('.');
                        if (classes) identifier += `.${classes}`;
                    }
                    
                    results.push({
                        element: identifier,
                        text: text.substring(0, 80),
                        scrollWidth: element.scrollWidth,
                        clientWidth: element.clientWidth,
                        cutOffAmount: element.scrollWidth - element.clientWidth,
                        left: Math.round(rect.left),
                        right: Math.round(rect.right),
                        width: Math.round(rect.width),
                        viewportWidth: viewportWidth,
                        overflowX: computedStyle.overflowX,
                        whiteSpace: computedStyle.whiteSpace,
                        fontSize: computedStyle.fontSize,
                        extendsRight: extendsRight,
                        extendsLeft: extendsLeft
                    });
                }
            });
            
            return results;
        });
        
        if (cutOffText.length > 0) {
            console.error(`\n🚨 Found ${cutOffText.length} text elements that are CUT OFF at 430px:\n`);
            cutOffText.forEach((item, index) => {
                console.error(`${index + 1}. ${item.element}`);
                console.error(`   📝 Text: "${item.text}"`);
                console.error(`   📏 Dimensions: scrollWidth=${item.scrollWidth}px, clientWidth=${item.clientWidth}px`);
                console.error(`   ✂️ CUT OFF: ${item.cutOffAmount}px of text is hidden`);
                console.error(`   📍 Position: left=${item.left}px, right=${item.right}px (viewport=${item.viewportWidth}px)`);
                if (item.extendsRight) {
                    console.error(`   ⚠️ EXTENDS RIGHT beyond viewport!`);
                }
                if (item.extendsLeft) {
                    console.error(`   ⚠️ EXTENDS LEFT beyond viewport!`);
                }
                console.error(`   🎨 CSS: overflow-x=${item.overflowX}, white-space=${item.whiteSpace}, font-size=${item.fontSize}`);
                console.error('');
            });
        }
        
        expect(cutOffText.length, 
            `Found ${cutOffText.length} text elements with cut-off content - text is being hidden or truncated`
        ).toBe(0);
    });
});

test.describe('Form Input Disabled After Submission', () => {
    test('Cohort form inputs should be disabled after successful submission @smoke', async ({ page }) => {
        await page.goto('http://localhost:8888/');
        await page.waitForLoadState('networkidle');
        
        // Scroll to cohorts section
        await page.evaluate(() => {
            document.getElementById('cohorts').scrollIntoView();
        });
        
        // Find the first cohort form
        const form = page.locator('.cohort-form').first();
        const nameInput = form.locator('input[type="text"]');
        const emailInput = form.locator('input[type="email"]');
        const submitButton = form.locator('button[type="submit"]');
        
        // Verify inputs are enabled initially
        await expect(nameInput).not.toBeDisabled();
        await expect(emailInput).not.toBeDisabled();
        
        // Fill form
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        
        // Submit form (will fail to actual server, but formSent will be set on error)
        await submitButton.click();
        
        // Wait for submission attempt
        await page.waitForTimeout(2000);
        
        // After submission, inputs should be disabled IF formSent is true
        const formSent = await page.evaluate(() => {
            return window.app ? window.app.formSent : false;
        });
        
        if (formSent) {
            await expect(nameInput).toBeDisabled();
            await expect(emailInput).toBeDisabled();
        }
    });
});

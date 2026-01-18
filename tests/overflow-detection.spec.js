const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

let sharedPage;

test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    await sharedPage.goto('/');
    await sharedPage.waitForLoadState('networkidle');
});

test.afterAll(async () => {
    await sharedPage.close();
});

const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 13', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
];

for (const viewport of viewports) {
    test(`No overflow on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await sharedPage.setViewportSize({ width: viewport.width, height: viewport.height });
        await sharedPage.waitForTimeout(200); // Let layout settle
        
        // Check for horizontal overflow on body and html
        const bodyOverflow = await sharedPage.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            
            const bodyScrollWidth = body.scrollWidth;
            const bodyClientWidth = body.clientWidth;
            const htmlScrollWidth = html.scrollWidth;
            const htmlClientWidth = html.clientWidth;
            
            return {
                bodyOverflows: bodyScrollWidth > bodyClientWidth,
                htmlOverflows: htmlScrollWidth > htmlClientWidth,
                bodyScrollWidth,
                bodyClientWidth,
                htmlScrollWidth,
                htmlClientWidth,
                diff: Math.max(bodyScrollWidth - bodyClientWidth, htmlScrollWidth - htmlClientWidth)
            };
        });
        
        if (bodyOverflow.bodyOverflows || bodyOverflow.htmlOverflows) {
            console.log(`\n❌ OVERFLOW DETECTED on ${viewport.name}:`);
            console.log(`   Body: ${bodyOverflow.bodyScrollWidth}px scroll vs ${bodyOverflow.bodyClientWidth}px client`);
            console.log(`   HTML: ${bodyOverflow.htmlScrollWidth}px scroll vs ${bodyOverflow.htmlClientWidth}px client`);
            console.log(`   Overflow: ${bodyOverflow.diff}px\n`);
        }
        
        expect(bodyOverflow.bodyOverflows, `Body overflows by ${bodyOverflow.diff}px on ${viewport.name}`).toBe(false);
        expect(bodyOverflow.htmlOverflows, `HTML overflows by ${bodyOverflow.diff}px on ${viewport.name}`).toBe(false);
    });
}

test('Find all overflowing elements on mobile (375px)', async () => {
    await sharedPage.setViewportSize({ width: 375, height: 667 });
    await sharedPage.waitForTimeout(200);
    
    const overflowingElements = await sharedPage.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflows = [];
        const viewportWidth = window.innerWidth;
        
        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            
            // Check if element extends beyond viewport
            if (rect.right > viewportWidth + 1) { // +1 for rounding
                const overflowAmount = rect.right - viewportWidth;
                
                // Get identifier
                let identifier = el.tagName.toLowerCase();
                if (el.id) identifier += `#${el.id}`;
                if (el.className && typeof el.className === 'string') {
                    const classes = el.className.split(' ').slice(0, 2).join('.');
                    if (classes) identifier += `.${classes}`;
                }
                
                overflows.push({
                    element: identifier,
                    overflowAmount: Math.round(overflowAmount),
                    width: Math.round(rect.width),
                    right: Math.round(rect.right),
                    viewportWidth: viewportWidth,
                    position: styles.position,
                    display: styles.display,
                    overflow: styles.overflow
                });
            }
        });
        
        // Sort by overflow amount
        return overflows.sort((a, b) => b.overflowAmount - a.overflowAmount).slice(0, 20);
    });
    
    if (overflowingElements.length > 0) {
        console.log('\n❌ OVERFLOWING ELEMENTS ON MOBILE (375px):');
        console.log('================================================');
        overflowingElements.forEach((el, i) => {
            console.log(`${i + 1}. ${el.element}`);
            console.log(`   Overflow: ${el.overflowAmount}px`);
            console.log(`   Width: ${el.width}px (viewport: ${el.viewportWidth}px)`);
            console.log(`   Position: ${el.position}, Display: ${el.display}, Overflow: ${el.overflow}`);
            console.log('');
        });
    } else {
        console.log('✅ No overflowing elements on mobile!');
    }
    
    expect(overflowingElements.length, `Found ${overflowingElements.length} overflowing elements`).toBe(0);
});

test('Find all overflowing elements on tablet (768px)', async () => {
    await sharedPage.setViewportSize({ width: 768, height: 1024 });
    await sharedPage.waitForTimeout(200);
    
    const overflowingElements = await sharedPage.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflows = [];
        const viewportWidth = window.innerWidth;
        
        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 1) {
                const overflowAmount = rect.right - viewportWidth;
                let identifier = el.tagName.toLowerCase();
                if (el.id) identifier += `#${el.id}`;
                if (el.className && typeof el.className === 'string') {
                    const classes = el.className.split(' ').slice(0, 2).join('.');
                    if (classes) identifier += `.${classes}`;
                }
                
                overflows.push({
                    element: identifier,
                    overflowAmount: Math.round(overflowAmount),
                    width: Math.round(rect.width)
                });
            }
        });
        
        return overflows.sort((a, b) => b.overflowAmount - a.overflowAmount).slice(0, 10);
    });
    
    if (overflowingElements.length > 0) {
        console.log('\n❌ OVERFLOWING ELEMENTS ON TABLET (768px):');
        console.log('================================================');
        overflowingElements.forEach((el, i) => {
            console.log(`${i + 1}. ${el.element} - Overflow: ${el.overflowAmount}px (width: ${el.width}px)`);
        });
    }
    
    expect(overflowingElements.length).toBe(0);
});

test('Find all overflowing elements on desktop (1280px)', async () => {
    await sharedPage.setViewportSize({ width: 1280, height: 720 });
    await sharedPage.waitForTimeout(200);
    
    const overflowingElements = await sharedPage.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflows = [];
        const viewportWidth = window.innerWidth;
        
        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 1) {
                const overflowAmount = rect.right - viewportWidth;
                let identifier = el.tagName.toLowerCase();
                if (el.id) identifier += `#${el.id}`;
                if (el.className && typeof el.className === 'string') {
                    const classes = el.className.split(' ').slice(0, 2).join('.');
                    if (classes) identifier += `.${classes}`;
                }
                
                overflows.push({
                    element: identifier,
                    overflowAmount: Math.round(overflowAmount),
                    width: Math.round(rect.width)
                });
            }
        });
        
        return overflows.sort((a, b) => b.overflowAmount - a.overflowAmount).slice(0, 10);
    });
    
    if (overflowingElements.length > 0) {
        console.log('\n❌ OVERFLOWING ELEMENTS ON DESKTOP (1280px):');
        console.log('================================================');
        overflowingElements.forEach((el, i) => {
            console.log(`${i + 1}. ${el.element} - Overflow: ${el.overflowAmount}px (width: ${el.width}px)`);
        });
    }
    
    expect(overflowingElements.length).toBe(0);
});

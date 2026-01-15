const { test } = require('@playwright/test');

test('Final scroll check - is it actually scrollable?', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const scrollInfo = await page.evaluate(() => {
        return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            difference: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            bodyScrollWidth: document.body.scrollWidth,
            bodyClientWidth: document.body.clientWidth,
            canActuallyScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowX: window.getComputedStyle(document.documentElement).overflowX,
            bodyOverflowX: window.getComputedStyle(document.body).overflowX
        };
    });
    
    console.log('\n=== SCROLL INFO ===');
    console.log(`HTML scrollWidth: ${scrollInfo.scrollWidth}px`);
    console.log(`HTML clientWidth: ${scrollInfo.clientWidth}px`);
    console.log(`Difference: ${scrollInfo.difference}px`);
    console.log(`Body scrollWidth: ${scrollInfo.bodyScrollWidth}px`);
    console.log(`Body clientWidth: ${scrollInfo.bodyClientWidth}px`);
    console.log(`Can actually scroll: ${scrollInfo.canActuallyScroll}`);
    console.log(`HTML overflow-x: ${scrollInfo.overflowX}`);
    console.log(`Body overflow-x: ${scrollInfo.bodyOverflowX}`);
    
    // Try to actually scroll
    await page.evaluate(() => {
        window.scrollTo(100, 0);
    });
    
    const actualScroll = await page.evaluate(() => window.scrollX);
    console.log(`Actual horizontal scroll position after trying to scroll: ${actualScroll}px`);
    console.log(`\nResult: ${actualScroll > 0 ? '❌ CAN SCROLL' : '✅ CANNOT SCROLL'}`);
});

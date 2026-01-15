/**
 * Diagnose Horizontal Scroll Bug
 */
const { test } = require('@playwright/test');

test('Identify element causing horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const culprits = await page.evaluate(() => {
        const viewportWidth = window.innerWidth;
        const issues = [];
        
        // Check all elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            
            // Check if element extends beyond viewport
            if (rect.right > viewportWidth + 1) {
                issues.push({
                    tag: el.tagName,
                    id: el.id || 'no-id',
                    classes: el.className || 'no-class',
                    right: Math.round(rect.right),
                    viewportWidth: viewportWidth,
                    overflow: Math.round(rect.right - viewportWidth),
                    width: Math.round(rect.width),
                    computedWidth: styles.width,
                    computedMaxWidth: styles.maxWidth,
                    computedMinWidth: styles.minWidth,
                    position: styles.position,
                    left: Math.round(rect.left)
                });
            }
        });
        
        // Sort by how far they extend
        issues.sort((a, b) => b.overflow - a.overflow);
        
        return issues;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('HORIZONTAL SCROLL BUG DIAGNOSIS - Mobile Portrait (375px)');
    console.log('='.repeat(80));
    console.log(`Total elements extending beyond viewport: ${culprits.length}\n`);
    
    if (culprits.length > 0) {
        console.log('Top 10 offenders:\n');
        culprits.slice(0, 10).forEach((issue, i) => {
            console.log(`${i + 1}. ${issue.tag}${issue.id !== 'no-id' ? `#${issue.id}` : ''}.${issue.classes}`);
            console.log(`   Position: ${issue.left}px to ${issue.right}px (viewport: 375px)`);
            console.log(`   Overflow: ${issue.overflow}px beyond right edge`);
            console.log(`   Width: ${issue.width}px (computed: ${issue.computedWidth})`);
            console.log(`   MaxWidth: ${issue.computedMaxWidth}, MinWidth: ${issue.computedMinWidth}`);
            console.log(`   CSS Position: ${issue.position}\n`);
        });
    }
    
    // Check specific suspects
    const suspects = await page.evaluate(() => {
        const checks = {
            body: document.body.scrollWidth,
            html: document.documentElement.scrollWidth,
            viewport: window.innerWidth
        };
        
        // Check for problematic styles
        const problemStyles = [];
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.minWidth && styles.minWidth !== 'auto' && styles.minWidth !== '0px') {
                const minWidth = parseFloat(styles.minWidth);
                if (minWidth > 375) {
                    problemStyles.push({
                        tag: el.tagName,
                        class: el.className,
                        minWidth: styles.minWidth
                    });
                }
            }
        });
        
        return { checks, problemStyles };
    });
    
    console.log('Document dimensions:');
    console.log(`  Body scrollWidth: ${suspects.checks.body}px`);
    console.log(`  HTML scrollWidth: ${suspects.checks.html}px`);
    console.log(`  Viewport width: ${suspects.checks.viewport}px`);
    console.log(`  Difference: ${suspects.checks.html - suspects.checks.viewport}px\n`);
    
    if (suspects.problemStyles.length > 0) {
        console.log(`Elements with min-width > 375px: ${suspects.problemStyles.length}`);
        suspects.problemStyles.forEach((el, i) => {
            console.log(`  ${i + 1}. ${el.tag}.${el.class} - min-width: ${el.minWidth}`);
        });
    }
});

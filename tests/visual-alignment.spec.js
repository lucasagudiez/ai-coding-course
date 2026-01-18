const { test, expect } = require('@playwright/test');

/**
 * Visual Alignment Tests
 * 
 * These tests detect alignment issues that make content appear awkwardly positioned:
 * - Flex/grid containers that should be centered but aren't
 * - Last-row items in wrapped layouts that appear left-aligned
 * - Content that should be horizontally centered within its container
 */

const VIEWPORTS = [
    { name: 'Mobile Small', width: 375, height: 667 },
    { name: 'Mobile Medium', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Tablet Wide', width: 824, height: 1084 },
    { name: 'Desktop Small', width: 1024, height: 768 },
    { name: 'Desktop Large', width: 1440, height: 900 }
];

test.describe('Visual Alignment Detection @smoke', () => {
    for (const viewport of VIEWPORTS) {
        test(`Check for alignment issues on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:8888');
            
            // Wait for page to be fully loaded
            await page.waitForLoadState('networkidle');
            
            const alignmentIssues = await page.evaluate(() => {
                const issues = [];
                const viewportWidth = window.innerWidth;
                const TOLERANCE = 5; // pixels
                
                // Check all flex containers with justify-content: center
                const flexContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display === 'flex' && 
                           (style.justifyContent === 'center' || style.justifyContent === 'space-around');
                });
                
                flexContainers.forEach(container => {
                    const rect = container.getBoundingClientRect();
                    const style = window.getComputedStyle(container);
                    
                    // Skip if not visible
                    if (rect.width === 0 || rect.height === 0) return;
                    
                    // Check if container itself is centered in viewport
                    const leftMargin = rect.left;
                    const rightMargin = viewportWidth - rect.right;
                    const marginDiff = Math.abs(leftMargin - rightMargin);
                    
                    // If container has significant width and uneven margins, it's not centered
                    if (rect.width > viewportWidth * 0.5 && marginDiff > TOLERANCE) {
                        const className = container.className || 'no-class';
                        const tagName = container.tagName.toLowerCase();
                        
                        // Skip navigation and header elements that might intentionally be offset
                        if (className.includes('nav') || className.includes('header')) return;
                        
                        issues.push({
                            type: 'UNCENTERED_CONTAINER',
                            element: `${tagName}.${className}`,
                            leftMargin: Math.round(leftMargin),
                            rightMargin: Math.round(rightMargin),
                            marginDiff: Math.round(marginDiff),
                            width: Math.round(rect.width),
                            justifyContent: style.justifyContent
                        });
                    }
                    
                    // Check for wrapped flex items where last row appears left-aligned
                    if (style.flexWrap === 'wrap' || style.flexWrap === 'wrap-reverse') {
                        const children = Array.from(container.children);
                        if (children.length === 0) return;
                        
                        // Group children by their top position (rows)
                        const rows = {};
                        children.forEach(child => {
                            const childRect = child.getBoundingClientRect();
                            const rowKey = Math.round(childRect.top);
                            if (!rows[rowKey]) rows[rowKey] = [];
                            rows[rowKey].push({
                                element: child,
                                rect: childRect
                            });
                        });
                        
                        const rowArray = Object.values(rows);
                        
                        // Check if last row has fewer items and appears left-aligned
                        if (rowArray.length > 1) {
                            const lastRow = rowArray[rowArray.length - 1];
                            const firstRow = rowArray[0];
                            
                            // If last row has fewer items than first row
                            if (lastRow.length < firstRow.length) {
                                // Calculate horizontal position of last row items
                                const lastRowLeft = Math.min(...lastRow.map(item => item.rect.left));
                                const lastRowRight = Math.max(...lastRow.map(item => item.rect.right));
                                const lastRowWidth = lastRowRight - lastRowLeft;
                                const lastRowCenter = (lastRowLeft + lastRowRight) / 2;
                                const containerCenter = (rect.left + rect.right) / 2;
                                const centerOffset = Math.abs(lastRowCenter - containerCenter);
                                
                                // If last row is not centered within container
                                if (centerOffset > TOLERANCE && lastRowWidth < rect.width * 0.8) {
                                    const className = container.className || 'no-class';
                                    issues.push({
                                        type: 'LAST_ROW_NOT_CENTERED',
                                        element: `${container.tagName.toLowerCase()}.${className}`,
                                        lastRowItems: lastRow.length,
                                        firstRowItems: firstRow.length,
                                        lastRowCenter: Math.round(lastRowCenter),
                                        containerCenter: Math.round(containerCenter),
                                        centerOffset: Math.round(centerOffset),
                                        suggestion: 'Consider using CSS like: gap + justify-content: center with proper flex-basis'
                                    });
                                }
                            }
                        }
                    }
                });
                
                return issues;
            });
            
            // Report any alignment issues found
            if (alignmentIssues.length > 0) {
                console.log(`\n❌ Found ${alignmentIssues.length} alignment issue(s) at ${viewport.width}px:\n`);
                alignmentIssues.forEach((issue, index) => {
                    console.log(`${index + 1}. ${issue.type}`);
                    console.log(`   Element: ${issue.element}`);
                    if (issue.type === 'UNCENTERED_CONTAINER') {
                        console.log(`   Left margin: ${issue.leftMargin}px, Right margin: ${issue.rightMargin}px`);
                        console.log(`   Difference: ${issue.marginDiff}px`);
                    } else if (issue.type === 'LAST_ROW_NOT_CENTERED') {
                        console.log(`   Last row: ${issue.lastRowItems} items, First row: ${issue.firstRowItems} items`);
                        console.log(`   Center offset: ${issue.centerOffset}px`);
                        console.log(`   💡 ${issue.suggestion}`);
                    }
                    console.log('');
                });
            }
            
            expect(alignmentIssues.length, 
                `Found ${alignmentIssues.length} alignment issues at ${viewport.width}px. See console output for details.`
            ).toBe(0);
        });
    }
});

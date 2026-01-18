const { test, expect } = require('@playwright/test');

/**
 * Comprehensive UI Quality Detection
 * 
 * This test suite automatically detects the types of "ugly looking things" we've fixed:
 * 1. Awkward wrapping (buttons/elements wrapping alone)
 * 2. Alignment issues (left-aligned when should be centered)
 * 3. Overflow issues (content extending beyond viewport)
 * 4. Spacing inconsistencies
 * 5. Visual imbalances
 * 
 * Goal: Catch these issues automatically so they can be fixed across the entire site
 */

const VIEWPORTS = [
    { name: 'Mobile Small', width: 375, height: 667 },
    { name: 'Mobile Medium', width: 414, height: 896 },
    { name: 'Mobile Large', width: 430, height: 932 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Awkward Width', width: 824, height: 1084 }, // Common awkward size
    { name: 'Desktop Small', width: 1024, height: 768 },
    { name: 'Desktop Large', width: 1440, height: 900 }
];

test.describe('Comprehensive UI Quality Detection @smoke', () => {
    for (const viewport of VIEWPORTS) {
        test(`Detect all UI issues on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:8888');
            await page.waitForLoadState('networkidle');
            
            const allIssues = await page.evaluate(() => {
                const issues = [];
                const viewportWidth = window.innerWidth;
                const TOLERANCE = 5;
                
                // ========================================
                // 1. AWKWARD WRAPPING DETECTION
                // ========================================
                // Find flex/grid containers where the last item wraps alone
                const flexContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return (style.display === 'flex' || style.display === 'grid') && 
                           style.flexWrap === 'wrap';
                });
                
                flexContainers.forEach(container => {
                    const rect = container.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;
                    
                    const children = Array.from(container.children).filter(child => {
                        const childStyle = window.getComputedStyle(child);
                        return childStyle.display !== 'none' && childStyle.visibility !== 'hidden';
                    });
                    
                    if (children.length < 2) return;
                    
                    // Group children by row
                    const rows = {};
                    children.forEach(child => {
                        const childRect = child.getBoundingClientRect();
                        const rowKey = Math.round(childRect.top);
                        if (!rows[rowKey]) rows[rowKey] = [];
                        rows[rowKey].push({
                            element: child,
                            rect: childRect,
                            text: child.textContent.trim().substring(0, 30)
                        });
                    });
                    
                    const rowArray = Object.values(rows);
                    
                    // Check if last row has only 1 item while other rows have more
                    if (rowArray.length > 1) {
                        const lastRow = rowArray[rowArray.length - 1];
                        const otherRows = rowArray.slice(0, -1);
                        const avgRowSize = otherRows.reduce((sum, row) => sum + row.length, 0) / otherRows.length;
                        
                        // If last row has only 1 item and other rows have 2+
                        if (lastRow.length === 1 && avgRowSize >= 2) {
                            const className = container.className || 'no-class';
                            const tagName = container.tagName.toLowerCase();
                            issues.push({
                                type: 'AWKWARD_WRAPPING',
                                severity: 'medium',
                                element: `${tagName}.${className}`,
                                lastRowItems: lastRow.length,
                                avgRowItems: Math.round(avgRowSize * 10) / 10,
                                orphanedText: lastRow[0].text,
                                fix: 'Consider adjusting flex-basis or adding flex-grow to distribute items more evenly'
                            });
                        }
                    }
                });
                
                // ========================================
                // 2. ALIGNMENT ISSUES
                // ========================================
                const centeredContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                    const style = window.getComputedStyle(el);
                    return (style.display === 'flex' && style.justifyContent === 'center') ||
                           (style.textAlign === 'center' && el.children.length > 0);
                });
                
                centeredContainers.forEach(container => {
                    const rect = container.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;
                    
                    const leftMargin = rect.left;
                    const rightMargin = viewportWidth - rect.right;
                    const marginDiff = Math.abs(leftMargin - rightMargin);
                    
                    // Skip nav/header elements
                    const className = String(container.className || '');
                    if (className.includes('nav') || className.includes('header')) return;
                    
                    // If container is supposed to be centered but isn't
                    if (rect.width > viewportWidth * 0.3 && marginDiff > TOLERANCE * 2) {
                        issues.push({
                            type: 'ALIGNMENT_OFF_CENTER',
                            severity: 'medium',
                            element: `${container.tagName.toLowerCase()}.${className}`,
                            leftMargin: Math.round(leftMargin),
                            rightMargin: Math.round(rightMargin),
                            difference: Math.round(marginDiff),
                            fix: 'Ensure container has margin: 0 auto or parent has justify-content: center'
                        });
                    }
                });
                
                // ========================================
                // 3. OVERFLOW DETECTION
                // ========================================
                const allElements = document.querySelectorAll('*');
                let overflowCount = 0;
                
                allElements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const style = window.getComputedStyle(element);
                    
                    if (rect.width === 0 || rect.height === 0) return;
                    if (style.display === 'none' || style.visibility === 'hidden') return;
                    
                    // Skip custom cursor elements
                    const className = element.className || '';
                    if (typeof className === 'string' && className.includes('cursor')) return;
                    
                    // Check if extends beyond viewport
                    if (rect.right > viewportWidth + 1) {
                        overflowCount++;
                        if (overflowCount <= 3) { // Only report first 3 to avoid spam
                            issues.push({
                                type: 'OVERFLOW_RIGHT',
                                severity: 'high',
                                element: `${element.tagName.toLowerCase()}.${className}`,
                                extendsBy: Math.round(rect.right - viewportWidth),
                                width: Math.round(rect.width),
                                fix: 'Add max-width: 100% or box-sizing: border-box'
                            });
                        }
                    }
                    
                    // Check for hidden content (scrollWidth > clientWidth with overflow:hidden)
                    if (element.scrollWidth > element.clientWidth + 1 && 
                        (style.overflowX === 'hidden' || style.overflowX === 'clip')) {
                        const textPreview = element.textContent.trim().substring(0, 40);
                        if (textPreview.length > 5) {
                            issues.push({
                                type: 'CONTENT_CUT_OFF',
                                severity: 'medium',
                                element: `${element.tagName.toLowerCase()}.${className}`,
                                hiddenWidth: Math.round(element.scrollWidth - element.clientWidth),
                                textPreview: textPreview,
                                fix: 'Consider word-break: break-word or reducing content width'
                            });
                        }
                    }
                });
                
                // ========================================
                // 4. SPACING INCONSISTENCIES
                // ========================================
                // Check flex/grid containers for uneven gaps
                flexContainers.forEach(container => {
                    const children = Array.from(container.children).filter(child => {
                        const childStyle = window.getComputedStyle(child);
                        return childStyle.display !== 'none';
                    });
                    
                    if (children.length < 3) return;
                    
                    // Calculate gaps between adjacent children
                    const gaps = [];
                    for (let i = 0; i < children.length - 1; i++) {
                        const rect1 = children[i].getBoundingClientRect();
                        const rect2 = children[i + 1].getBoundingClientRect();
                        
                        // Horizontal gap
                        const hGap = rect2.left - rect1.right;
                        // Only count if they're on same row
                        if (Math.abs(rect1.top - rect2.top) < 5) {
                            gaps.push(Math.abs(hGap));
                        }
                    }
                    
                    if (gaps.length < 2) return;
                    
                    // Check if gaps are inconsistent
                    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
                    const maxDiff = Math.max(...gaps) - Math.min(...gaps);
                    
                    if (maxDiff > 10 && avgGap > 5) {
                        const className = container.className || 'no-class';
                        issues.push({
                            type: 'INCONSISTENT_SPACING',
                            severity: 'low',
                            element: `${container.tagName.toLowerCase()}.${className}`,
                            minGap: Math.round(Math.min(...gaps)),
                            maxGap: Math.round(Math.max(...gaps)),
                            avgGap: Math.round(avgGap),
                            fix: 'Use consistent gap property or margin values'
                        });
                    }
                });
                
                // ========================================
                // 5. VISUAL IMBALANCE
                // ========================================
                // Check for very small text next to normal text (indicates wrapping issues)
                const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6'));
                
                textElements.forEach(element => {
                    const text = element.textContent.trim();
                    if (text.length < 5 || text.length > 100) return;
                    
                    const rect = element.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;
                    
                    const style = window.getComputedStyle(element);
                    const fontSize = parseFloat(style.fontSize);
                    
                    // Check if text is very narrow relative to font size (likely wrapped awkwardly)
                    const expectedWidth = text.length * fontSize * 0.5; // Rough estimate
                    const actualWidth = rect.width;
                    
                    // If actual width is much smaller than expected, likely wrapped
                    if (expectedWidth > actualWidth * 2 && text.includes(' ')) {
                        const className = element.className || 'no-class';
                        issues.push({
                            type: 'CRAMPED_TEXT',
                            severity: 'low',
                            element: `${element.tagName.toLowerCase()}.${className}`,
                            text: text.substring(0, 50),
                            expectedWidth: Math.round(expectedWidth),
                            actualWidth: Math.round(actualWidth),
                            fix: 'Consider adjusting max-width or white-space property'
                        });
                    }
                });
                
                return issues;
            });
            
            // Group issues by severity
            const high = allIssues.filter(i => i.severity === 'high');
            const medium = allIssues.filter(i => i.severity === 'medium');
            const low = allIssues.filter(i => i.severity === 'low');
            
            // Report issues
            if (allIssues.length > 0) {
                console.log(`\n🔍 Found ${allIssues.length} UI issue(s) at ${viewport.width}px:`);
                
                if (high.length > 0) {
                    console.log(`\n🔴 HIGH PRIORITY (${high.length}):`);
                    high.forEach((issue, i) => {
                        console.log(`  ${i + 1}. ${issue.type} - ${issue.element}`);
                        console.log(`     ${JSON.stringify(issue, null, 2).split('\n').slice(1, -1).join('\n')}`);
                    });
                }
                
                if (medium.length > 0) {
                    console.log(`\n🟡 MEDIUM PRIORITY (${medium.length}):`);
                    medium.forEach((issue, i) => {
                        console.log(`  ${i + 1}. ${issue.type} - ${issue.element}`);
                        Object.entries(issue).forEach(([key, value]) => {
                            if (key !== 'type' && key !== 'element' && key !== 'severity') {
                                console.log(`     ${key}: ${value}`);
                            }
                        });
                    });
                }
                
                if (low.length > 0 && low.length <= 5) { // Only show low priority if not too many
                    console.log(`\n🟢 LOW PRIORITY (${low.length}):`);
                    low.forEach((issue, i) => {
                        console.log(`  ${i + 1}. ${issue.type} - ${issue.element}`);
                    });
                }
            }
            
            // Fail test if high or medium priority issues found
            const criticalIssues = [...high, ...medium];
            expect(criticalIssues.length, 
                `Found ${criticalIssues.length} critical UI issues at ${viewport.width}px (${high.length} high, ${medium.length} medium). See console output above for details.`
            ).toBe(0);
        });
    }
});

test.describe('Quick UI Quality Check @smoke', () => {
    test('Quick check on common viewport (414px)', async ({ page }) => {
        await page.setViewportSize({ width: 414, height: 896 });
        await page.goto('http://localhost:8888');
        await page.waitForLoadState('networkidle');
        
        // Quick checks for most common issues
        const issues = await page.evaluate(() => {
            const problems = [];
            const viewportWidth = window.innerWidth;
            
            // Check body for horizontal scroll
            if (document.body.scrollWidth > viewportWidth + 1) {
                problems.push(`Body has horizontal scroll: ${document.body.scrollWidth}px vs ${viewportWidth}px viewport`);
            }
            
            // Check for elements extending right
            const allElements = document.querySelectorAll('*');
            let overflowCount = 0;
            allElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > viewportWidth + 1 && rect.width > 10) {
                    overflowCount++;
                }
            });
            
            if (overflowCount > 0) {
                problems.push(`${overflowCount} elements extend beyond viewport`);
            }
            
            return problems;
        });
        
        expect(issues, `Quick UI check failed: ${issues.join(', ')}`).toHaveLength(0);
    });
});

/**
 * Component Style Verification Tool - Automatic Edition
 * 
 * Automatically compares ALL computed styles between standalone and integrated components.
 * No need to manually specify which properties to test - it tests everything relevant.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Simple component registry - just paths and selectors
// Each component can be tested across multiple pages (application, evaluation, reservation)
const COMPONENTS = {
    'scarcity-bar': {
        standalone: '/components/standalone/scarcity-bar.html',
        integrated: [
            { page: '/application/', selector: '.scarcity-bar' }
        ]
    },
    'graduate-counter': {
        standalone: '/components/standalone/graduate-counter.html',
        integrated: [
            { page: '/application/', selector: '.graduate-counter' }
        ]
    },
    'authority-logos': {
        standalone: '/components/standalone/authority-logos.html',
        integrated: [
            { page: '/application/', selector: '.authority-logos' }
        ]
    },
    'value-stack': {
        standalone: '/components/standalone/value-stack.html',
        integrated: [
            { page: '/application/', selector: '.value-stack' },
            { page: '/reservation/', selector: '.value-stack' }
        ]
    },
    'testimonial-carousel': {
        standalone: '/components/standalone/testimonial-carousel.html',
        integrated: [
            { page: '/application/', selector: '.testimonial-carousel' },
            { page: '/reservation/', selector: '.testimonial-carousel' }
        ]
    },
    'guarantee-badges': {
        standalone: '/components/standalone/guarantee-badges.html',
        integrated: [
            { page: '/application/', selector: '.guarantee-badge-container' },
            { page: '/reservation/', selector: '.guarantee-badge-container' }
        ]
    },
    'faq-section': {
        standalone: '/components/standalone/faq-section.html',
        integrated: [
            { page: '/application/', selector: '.faq-section' },
            { page: '/reservation/', selector: '.faq-section' }
        ]
    }
};

// Properties to ignore (change based on context, don't matter for visual consistency)
const IGNORE_PROPERTIES = new Set([
    // Size properties that depend on content/viewport
    'width', 'height', 'inlineSize', 'blockSize',
    'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    
    // Absolute positioning (depends on page context)
    'top', 'left', 'right', 'bottom',
    'inset', 'insetBlock', 'insetInline',
    
    // Computed values that vary by browser
    'webkitUserSelect', 'webkitAppRegion',
    'webkitBorderHorizontalSpacing', 'webkitBorderVerticalSpacing',
    
    // Long-form properties (we test shorthand instead)
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    
    // Internal/inherited properties
    'cssFloat', 'cssText', 'length', 'parentRule'
]);

// Properties that are CRITICAL for visual appearance
const CRITICAL_PROPERTIES = new Set([
    'display', 'position', 'flexDirection', 'justifyContent', 'alignItems',
    'gridTemplateColumns', 'gridTemplateRows', 'gap',
    'padding', 'margin', 'border', 'borderRadius',
    'background', 'backgroundColor', 'backgroundImage',
    'color', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight',
    'boxShadow', 'textAlign', 'opacity', 'transform'
]);

/**
 * Get ALL computed styles from an element
 */
async function getAllComputedStyles(page, selector) {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        const computed = window.getComputedStyle(element);
        const styles = {};
        
        // Get all properties
        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            styles[prop] = computed.getPropertyValue(prop);
        }
        
        return styles;
    }, selector);
}

/**
 * Filter styles to only relevant ones
 */
function filterRelevantStyles(styles) {
    const filtered = {};
    
    for (const [prop, value] of Object.entries(styles)) {
        // Skip ignored properties
        if (IGNORE_PROPERTIES.has(prop)) continue;
        
        // Skip empty or default values
        if (!value || value === 'none' || value === 'normal' || value === 'auto') continue;
        
        // Skip webkit prefixed unless critical
        if (prop.startsWith('webkit') && !prop.includes('backdrop')) continue;
        
        filtered[prop] = value;
    }
    
    return filtered;
}

/**
 * Compare two style objects and categorize differences
 */
function compareStyles(standalone, integrated, componentName) {
    const criticalDiffs = [];
    const minorDiffs = [];
    
    // Check all properties in standalone
    for (const [prop, standaloneValue] of Object.entries(standalone)) {
        const integratedValue = integrated[prop];
        
        if (standaloneValue !== integratedValue) {
            const diff = {
                property: prop,
                standalone: standaloneValue,
                integrated: integratedValue || '(not set)'
            };
            
            if (CRITICAL_PROPERTIES.has(prop)) {
                criticalDiffs.push(diff);
            } else {
                minorDiffs.push(diff);
            }
        }
    }
    
    // Check for properties in integrated but not standalone
    for (const [prop, integratedValue] of Object.entries(integrated)) {
        if (!standalone[prop] && integratedValue) {
            const diff = {
                property: prop,
                standalone: '(not set)',
                integrated: integratedValue
            };
            
            if (CRITICAL_PROPERTIES.has(prop)) {
                criticalDiffs.push(diff);
            } else {
                minorDiffs.push(diff);
            }
        }
    }
    
    return { criticalDiffs, minorDiffs };
}

/**
 * Main test suite
 */
test.describe('Component Style Consistency - Automatic Verification', () => {
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        
        test(`${componentName}: auto-verify all styles @smoke`, async ({ page }) => {
            // Skip if standalone file doesn't exist
            const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
            if (!fs.existsSync(standalonePath)) {
                test.skip();
                return;
            }
            
            // Step 1: Get ALL standalone styles
            await page.goto(config.standalone);
            await page.waitForLoadState('networkidle');
            
            const standaloneAllStyles = await getAllComputedStyles(
                page,
                `[data-component="${componentName}"]`
            );
            
            expect(standaloneAllStyles).not.toBeNull();
            const standaloneStyles = filterRelevantStyles(standaloneAllStyles);
            
            console.log(`\n📦 ${componentName} - Found ${Object.keys(standaloneStyles).length} relevant style properties`);
            
            // Step 2: Get ALL integrated styles from each page
            for (const integration of config.integrated) {
                await page.goto(integration.page);
                await page.waitForLoadState('networkidle');
                
                const integratedAllStyles = await getAllComputedStyles(
                    page,
                    integration.selector
                );
                
                expect(integratedAllStyles).not.toBeNull();
                const integratedStyles = filterRelevantStyles(integratedAllStyles);
                
                console.log(`🔗 ${componentName} on ${integration.page} - Found ${Object.keys(integratedStyles).length} relevant style properties`);
                
                // Step 3: Compare ALL styles
                const { criticalDiffs, minorDiffs } = compareStyles(
                    standaloneStyles,
                    integratedStyles,
                    componentName
                );
                
                // Report results
                if (criticalDiffs.length > 0) {
                    console.error(`\n❌ CRITICAL style differences in ${componentName} on ${integration.page}:`);
                    criticalDiffs.forEach(diff => {
                        console.error(`  🔴 ${diff.property}:`);
                        console.error(`     Standalone: ${diff.standalone}`);
                        console.error(`     Integrated: ${diff.integrated}`);
                    });
                }
                
                if (minorDiffs.length > 0) {
                    console.log(`\n⚠️  Minor style differences in ${componentName} on ${integration.page}:`);
                    minorDiffs.slice(0, 5).forEach(diff => {
                        console.log(`  🟡 ${diff.property}: ${diff.standalone} → ${diff.integrated}`);
                    });
                    if (minorDiffs.length > 5) {
                        console.log(`  ... and ${minorDiffs.length - 5} more minor differences`);
                    }
                }
                
                if (criticalDiffs.length === 0 && minorDiffs.length === 0) {
                    console.log(`\n✅ ${componentName} on ${integration.page}: ALL styles match perfectly!`);
                }
                
                // Only fail on critical differences
                expect(criticalDiffs).toHaveLength(0);
            }
        });
    }
});

/**
 * Generate comprehensive style comparison report
 */
test('Generate complete style comparison report @report', async ({ page }) => {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalComponents: 0,
            componentsWithDiffs: 0,
            totalCriticalDiffs: 0,
            totalMinorDiffs: 0
        },
        components: {}
    };
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
        if (!fs.existsSync(standalonePath)) {
            continue;
        }
        
        report.summary.totalComponents++;
        
        // Get standalone styles
        await page.goto(config.standalone);
        await page.waitForLoadState('networkidle');
        
        const standaloneAllStyles = await getAllComputedStyles(
            page,
            `[data-component="${componentName}"]`
        );
        const standaloneStyles = filterRelevantStyles(standaloneAllStyles);
        
        report.components[componentName] = {
            standalone: standaloneStyles,
            integrated: {},
            differences: {}
        };
        
        // Get integrated styles and compare
        for (const integration of config.integrated) {
            await page.goto(integration.page);
            await page.waitForLoadState('networkidle');
            
            const integratedAllStyles = await getAllComputedStyles(
                page,
                integration.selector
            );
            const integratedStyles = filterRelevantStyles(integratedAllStyles);
            
            report.components[componentName].integrated[integration.page] = integratedStyles;
            
            const { criticalDiffs, minorDiffs } = compareStyles(
                standaloneStyles,
                integratedStyles,
                componentName
            );
            
            report.components[componentName].differences[integration.page] = {
                critical: criticalDiffs,
                minor: minorDiffs
            };
            
            if (criticalDiffs.length > 0 || minorDiffs.length > 0) {
                report.summary.componentsWithDiffs++;
            }
            report.summary.totalCriticalDiffs += criticalDiffs.length;
            report.summary.totalMinorDiffs += minorDiffs.length;
        }
    }
    
    // Write report
    const reportPath = path.join(__dirname, '..', 'test-results', 'component-style-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Complete style comparison report:`);
    console.log(`   Total components: ${report.summary.totalComponents}`);
    console.log(`   Components with differences: ${report.summary.componentsWithDiffs}`);
    console.log(`   Critical differences: ${report.summary.totalCriticalDiffs}`);
    console.log(`   Minor differences: ${report.summary.totalMinorDiffs}`);
    console.log(`\n   Report saved to: ${reportPath}`);
});

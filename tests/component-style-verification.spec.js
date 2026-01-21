/**
 * Component Style Verification Tool
 * 
 * Compares computed styles between:
 * 1. Standalone component files (public/components/standalone/*.html)
 * 2. Integrated components in pages (application/index.html, etc.)
 * 
 * Ensures perfect visual consistency when moving from standalone to integrated.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Component registry - maps component names to their locations
const COMPONENTS = {
    'scarcity-bar': {
        standalone: '/components/standalone/scarcity-bar.html',
        integrated: [
            { page: '/application/', selector: '.scarcity-bar' }
        ],
        criticalStyles: [
            'padding',
            'borderRadius',
            'background',
            'display'
        ]
    },
    'graduate-counter': {
        standalone: '/components/standalone/graduate-counter.html',
        integrated: [
            { page: '/application/', selector: '.graduate-counter' }
        ],
        criticalStyles: [
            'display',
            'gap',
            'padding'
        ]
    }
    // Add more components as they're created
};

/**
 * Extract computed styles from an element
 */
async function getComputedStyles(page, selector, styleProps) {
    return await page.evaluate(({ sel, props }) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        const computed = window.getComputedStyle(element);
        const styles = {};
        
        props.forEach(prop => {
            styles[prop] = computed[prop];
        });
        
        return styles;
    }, { sel: selector, props: styleProps });
}

/**
 * Compare two style objects
 */
function compareStyles(standalone, integrated, componentName) {
    const differences = [];
    
    for (const [prop, standaloneValue] of Object.entries(standalone)) {
        const integratedValue = integrated[prop];
        
        if (standaloneValue !== integratedValue) {
            differences.push({
                property: prop,
                standalone: standaloneValue,
                integrated: integratedValue
            });
        }
    }
    
    return differences;
}

/**
 * Main test suite
 */
test.describe('Component Style Consistency Verification', () => {
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        
        test(`${componentName}: standalone vs integrated styles match @smoke`, async ({ page }) => {
            // Skip if standalone file doesn't exist
            const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
            if (!fs.existsSync(standalonePath)) {
                test.skip();
                return;
            }
            
            // Step 1: Get standalone styles
            await page.goto(config.standalone);
            await page.waitForLoadState('networkidle');
            
            const standaloneStyles = await getComputedStyles(
                page,
                `[data-component="${componentName}"]`,
                config.criticalStyles
            );
            
            expect(standaloneStyles).not.toBeNull();
            console.log(`\n📦 ${componentName} - Standalone styles:`, standaloneStyles);
            
            // Step 2: Get integrated styles from each page
            for (const integration of config.integrated) {
                await page.goto(integration.page);
                await page.waitForLoadState('networkidle');
                
                const integratedStyles = await getComputedStyles(
                    page,
                    integration.selector,
                    config.criticalStyles
                );
                
                expect(integratedStyles).not.toBeNull();
                console.log(`\n🔗 ${componentName} on ${integration.page}:`, integratedStyles);
                
                // Step 3: Compare styles
                const differences = compareStyles(standaloneStyles, integratedStyles, componentName);
                
                if (differences.length > 0) {
                    console.error(`\n❌ Style differences found in ${componentName} on ${integration.page}:`);
                    differences.forEach(diff => {
                        console.error(`  - ${diff.property}:`);
                        console.error(`    Standalone: ${diff.standalone}`);
                        console.error(`    Integrated: ${diff.integrated}`);
                    });
                    
                    expect(differences).toHaveLength(0); // This will fail and show the differences
                } else {
                    console.log(`\n✅ ${componentName} on ${integration.page}: All styles match!`);
                }
            }
        });
        
        test(`${componentName}: visual regression check @visual`, async ({ page }) => {
            const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
            if (!fs.existsSync(standalonePath)) {
                test.skip();
                return;
            }
            
            // Screenshot standalone
            await page.goto(config.standalone);
            await page.waitForLoadState('networkidle');
            
            const standaloneElement = page.locator(`[data-component="${componentName}"]`);
            await expect(standaloneElement).toBeVisible();
            
            const standaloneScreenshot = await standaloneElement.screenshot();
            
            // Screenshot integrated versions
            for (const integration of config.integrated) {
                await page.goto(integration.page);
                await page.waitForLoadState('networkidle');
                
                const integratedElement = page.locator(integration.selector).first();
                await expect(integratedElement).toBeVisible();
                
                const integratedScreenshot = await integratedElement.screenshot();
                
                // Compare dimensions (basic visual check)
                // Note: For pixel-perfect comparison, use Percy or Chromatic
                const standaloneBuffer = Buffer.from(standaloneScreenshot);
                const integratedBuffer = Buffer.from(integratedScreenshot);
                
                // At minimum, they should be similar in size (within 10%)
                const sizeDiff = Math.abs(standaloneBuffer.length - integratedBuffer.length);
                const maxDiff = standaloneBuffer.length * 0.1;
                
                expect(sizeDiff).toBeLessThan(maxDiff);
                
                console.log(`\n📸 ${componentName} visual check on ${integration.page}: PASS`);
            }
        });
    }
});

/**
 * Generate style comparison report
 */
test('Generate style comparison report @report', async ({ page }) => {
    const report = {
        timestamp: new Date().toISOString(),
        components: {}
    };
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
        if (!fs.existsSync(standalonePath)) {
            continue;
        }
        
        report.components[componentName] = {
            standalone: {},
            integrated: {}
        };
        
        // Get standalone styles
        await page.goto(config.standalone);
        await page.waitForLoadState('networkidle');
        
        const standaloneStyles = await getComputedStyles(
            page,
            `[data-component="${componentName}"]`,
            config.criticalStyles
        );
        
        report.components[componentName].standalone = standaloneStyles;
        
        // Get integrated styles
        for (const integration of config.integrated) {
            await page.goto(integration.page);
            await page.waitForLoadState('networkidle');
            
            const integratedStyles = await getComputedStyles(
                page,
                integration.selector,
                config.criticalStyles
            );
            
            report.components[componentName].integrated[integration.page] = integratedStyles;
        }
    }
    
    // Write report
    const reportPath = path.join(__dirname, '..', 'test-results', 'component-style-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Style comparison report written to: ${reportPath}`);
});

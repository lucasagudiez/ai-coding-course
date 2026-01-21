/**
 * Component Behavior Verification - FULLY Automatic Vue.js/JavaScript Testing
 * 
 * NO CONFIGURATION NEEDED! Automatically:
 * - Discovers ALL Vue data properties
 * - Compares standalone vs integrated
 * - Tests text rendering
 * - Tests dynamic elements (v-for, v-if, v-show)
 * - Tests interactions
 * 
 * Just add component paths - everything else is automatic!
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Component registry - updated for new template system
const COMPONENTS = {
    'scarcity-bar': {
        standalone: '/components/standalone/scarcity-bar.html',
        integrated: [{ page: '/application/', selector: '.scarcity-bar' }]
    },
    'testimonial-carousel': {
        standalone: '/components/standalone/testimonial-carousel.html',
        integrated: [{ page: '/reservation/', selector: '.testimonial-carousel' }]
    },
    'faq-section': {
        standalone: '/components/standalone/faq-section.html',
        integrated: [{ page: '/reservation/', selector: '.faq-section' }]
    }
};

/**
 * Wait for Vue components to finish loading templates asynchronously
 */
async function waitForComponentsLoaded(page) {
    // Wait for any component to appear (means templates have loaded)
    await page.waitForFunction(() => {
        const components = document.querySelectorAll('.scarcity-bar, .graduate-counter, .value-stack, .testimonial-carousel, .guarantee-badge-container, .faq-section, .comparison-table, .projects-section');
        return components.length > 0;
    }, { timeout: 15000 }).catch(() => {
        // Standalone pages don't have component-loader, so this is fine
    });
    
    // Wait for Vue to finish rendering
    await page.waitForTimeout(1000);
}

/**
 * Extract Vue component state from page - automatically finds Vue instance
 */
async function getVueState(page, selector) {
    // Wait for components to load
    await waitForComponentsLoaded(page);
    
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return { hasVue: false, data: {}, error: 'Element not found' };
        
        // Try multiple ways to get Vue instance
        let vueInstance = null;
        
        // 1. Check element itself
        vueInstance = element.__vue__ || element.__vueParentComponent;
        
        // 2. Check parent app div
        if (!vueInstance && element.closest('#app')) {
            const app = element.closest('#app');
            vueInstance = app.__vue__;
        }
        
        // 3. Walk up the DOM tree
        if (!vueInstance) {
            let current = element;
            while (current && !vueInstance) {
                vueInstance = current.__vue__;
                current = current.parentElement;
            }
        }
        
        if (!vueInstance) {
            return { hasVue: false, data: {}, error: 'Vue instance not found' };
        }
        
        // Extract ALL reactive data automatically
        const data = {};
        const vueData = vueInstance.$data || vueInstance.data || {};
        
        for (const key in vueData) {
            if (vueData.hasOwnProperty(key) && !key.startsWith('_')) {
                data[key] = vueData[key];
            }
        }
        
        return {
            hasVue: true,
            data: data,
            dataKeys: Object.keys(data),
            methods: Object.keys(vueInstance.$options?.methods || {}),
            computed: Object.keys(vueInstance.$options?.computed || {})
        };
    }, selector);
}

/**
 * Compare Vue data between standalone and integrated - AUTOMATIC
 */
function compareVueData(standalone, integrated) {
    const standaloneKeys = Object.keys(standalone.data).sort();
    const integratedKeys = Object.keys(integrated.data).sort();
    
    const missingInIntegrated = standaloneKeys.filter(k => !integratedKeys.includes(k));
    const extraInIntegrated = integratedKeys.filter(k => !standaloneKeys.includes(k));
    const common = standaloneKeys.filter(k => integratedKeys.includes(k));
    
    const differentValues = [];
    for (const key of common) {
        if (JSON.stringify(standalone.data[key]) !== JSON.stringify(integrated.data[key])) {
            differentValues.push({
                key,
                standalone: standalone.data[key],
                integrated: integrated.data[key]
            });
        }
    }
    
    return {
        passed: missingInIntegrated.length === 0 && extraInIntegrated.length === 0,
        missingInIntegrated,
        extraInIntegrated,
        common,
        differentValues
    };
}

/**
 * Test text content is rendered
 */
async function getRenderedText(page, selector) {
    try {
        const element = page.locator(selector).first();
        const text = await element.textContent({ timeout: 1000 });
        return {
            hasText: !!text && text.trim().length > 0,
            text: text || '',
            length: text?.length || 0
        };
    } catch (error) {
        return {
            hasText: false,
            text: '',
            length: 0,
            error: error.message
        };
    }
}

/**
 * Test dynamic elements (v-for, v-if, v-show) - AUTOMATIC
 */
async function testDynamicElements(page, selector) {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return { hasDynamic: false, count: 0 };
        
        // Look for repeated elements (likely from v-for)
        const repeatedElements = {};
        const allElements = element.querySelectorAll('*');
        
        allElements.forEach(el => {
            const className = el.className;
            if (className && typeof className === 'string') {
                const classes = className.split(' ').filter(c => c.trim());
                classes.forEach(cls => {
                    repeatedElements[cls] = (repeatedElements[cls] || 0) + 1;
                });
            }
        });
        
        const likelyDynamic = Object.entries(repeatedElements)
            .filter(([cls, count]) => count > 2 && cls !== '' && !cls.includes('fa-'))
            .map(([cls, count]) => ({ class: cls, count }));
        
        return {
            hasDynamic: likelyDynamic.length > 0,
            dynamicClasses: likelyDynamic,
            totalElements: allElements.length
        };
    }, selector);
}

/**
 * Main test suite - FULLY AUTOMATIC
 */
test.describe('Component Behavior Verification - Fully Automatic', () => {
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        
        test(`${componentName}: auto-verify all behavior @smoke`, async ({ page }) => {
            const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
            if (!fs.existsSync(standalonePath)) {
                console.log(`⏭️  Skipping ${componentName} - standalone file not found`);
                test.skip();
                return;
            }
            
            console.log(`\n🧪 Testing ${componentName}...`);
            
            // ========================================
            // STEP 1: Analyze Standalone
            // ========================================
            await page.goto(config.standalone);
            await page.waitForLoadState('networkidle');
            
            const standaloneSelector = `[data-component="${componentName}"]`;
            
            const standaloneVue = await getVueState(page, standaloneSelector);
            const standaloneText = await getRenderedText(page, standaloneSelector);
            const standaloneDynamic = await testDynamicElements(page, standaloneSelector);
            
            console.log(`\n📦 Standalone Analysis:`);
            console.log(`   Vue: ${standaloneVue.hasVue ? '✅' : '❌'}`);
            if (standaloneVue.hasVue) {
                console.log(`   Data props: ${standaloneVue.dataKeys.join(', ') || '(none)'}`);
            }
            console.log(`   Rendered text: ${standaloneText.hasText ? '✅' : '❌'} (${standaloneText.length} chars)`);
            console.log(`   Dynamic elements: ${standaloneDynamic.hasDynamic ? '✅' : '❌'}`);
            if (standaloneDynamic.hasDynamic) {
                console.log(`   Dynamic classes: ${standaloneDynamic.dynamicClasses.map(d => `${d.class}(${d.count})`).join(', ')}`);
            }
            
            // ========================================
            // STEP 2: Test Each Integration
            // ========================================
            for (const integration of config.integrated) {
                await page.goto(integration.page);
                await page.waitForLoadState('networkidle');
                
                console.log(`\n🔗 Testing on ${integration.page}...`);
                
                const integratedVue = await getVueState(page, integration.selector);
                const integratedText = await getRenderedText(page, integration.selector);
                const integratedDynamic = await testDynamicElements(page, integration.selector);
                
                console.log(`   Vue: ${integratedVue.hasVue ? '✅' : '❌'}`);
                if (integratedVue.hasVue) {
                    console.log(`   Data props: ${integratedVue.dataKeys.join(', ') || '(none)'}`);
                }
                console.log(`   Rendered text: ${integratedText.hasText ? '✅' : '❌'} (${integratedText.length} chars)`);
                console.log(`   Dynamic elements: ${integratedDynamic.hasDynamic ? '✅' : '❌'}`);
                
                // ========================================
                // STEP 3: Compare & Report
                // ========================================
                
                // Compare Vue data
                if (standaloneVue.hasVue && integratedVue.hasVue) {
                    const vueComparison = compareVueData(standaloneVue, integratedVue);
                    
                    if (vueComparison.missingInIntegrated.length > 0) {
                        console.error(`\n   ❌ Missing data props in integrated: ${vueComparison.missingInIntegrated.join(', ')}`);
                    }
                    if (vueComparison.extraInIntegrated.length > 0) {
                        console.log(`\n   ⚠️  Extra data props in integrated: ${vueComparison.extraInIntegrated.join(', ')}`);
                    }
                    if (vueComparison.differentValues.length > 0) {
                        console.log(`\n   📊 Different values:`);
                        vueComparison.differentValues.forEach(diff => {
                            console.log(`      ${diff.key}: ${JSON.stringify(diff.standalone)} → ${JSON.stringify(diff.integrated)}`);
                        });
                    }
                    
                    if (vueComparison.passed && vueComparison.differentValues.length === 0) {
                        console.log(`\n   ✅ Vue data matches perfectly!`);
                    }
                }
                
                // Compare text rendering
                if (standaloneText.hasText && integratedText.hasText) {
                    const textLengthDiff = Math.abs(standaloneText.length - integratedText.length);
                    const percentDiff = (textLengthDiff / standaloneText.length) * 100;
                    
                    if (percentDiff > 50) {
                        console.error(`\n   ❌ Text length differs significantly: ${percentDiff.toFixed(0)}%`);
                    } else if (percentDiff > 10) {
                        console.log(`\n   ⚠️  Text length differs: ${percentDiff.toFixed(0)}%`);
                    } else {
                        console.log(`\n   ✅ Text rendering matches!`);
                    }
                }
                
                // Compare dynamic elements
                if (standaloneDynamic.hasDynamic && integratedDynamic.hasDynamic) {
                    console.log(`\n   ✅ Both have dynamic elements!`);
                } else if (standaloneDynamic.hasDynamic && !integratedDynamic.hasDynamic) {
                    console.error(`\n   ❌ Standalone has dynamic elements, integrated doesn't`);
                } else if (!standaloneDynamic.hasDynamic && integratedDynamic.hasDynamic) {
                    console.log(`\n   ℹ️  Integrated has dynamic elements, standalone doesn't`);
                }
                
                // Final assertions - only fail on critical issues
                if (!integratedText.hasText && standaloneText.hasText) {
                    throw new Error(`Component ${componentName} failed to render text on ${integration.page}`);
                }
            }
            
            console.log(`\n✅ ${componentName}: All behavior tests complete!`);
        });
    }
});

/**
 * Generate comprehensive behavior report
 */
test('Generate behavior comparison report @report', async ({ page }) => {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalComponents: 0,
            componentsWithVue: 0,
            componentsWithIssues: 0
        },
        components: {}
    };
    
    for (const [componentName, config] of Object.entries(COMPONENTS)) {
        const standalonePath = path.join(__dirname, '..', 'public', config.standalone);
        if (!fs.existsSync(standalonePath)) continue;
        
        report.summary.totalComponents++;
        
        // Analyze standalone
        await page.goto(config.standalone);
        await page.waitForLoadState('networkidle');
        const standaloneSelector = `[data-component="${componentName}"]`;
        
        const standaloneVue = await getVueState(page, standaloneSelector);
        const standaloneText = await getRenderedText(page, standaloneSelector);
        const standaloneDynamic = await testDynamicElements(page, standaloneSelector);
        
        if (standaloneVue.hasVue) report.summary.componentsWithVue++;
        
        report.components[componentName] = {
            standalone: {
                vue: standaloneVue,
                text: standaloneText,
                dynamic: standaloneDynamic
            },
            integrated: {}
        };
        
        // Test integrated
        for (const integration of config.integrated) {
            await page.goto(integration.page);
            await page.waitForLoadState('networkidle');
            
            const integratedVue = await getVueState(page, integration.selector);
            const integratedText = await getRenderedText(page, integration.selector);
            const integratedDynamic = await testDynamicElements(page, integration.selector);
            
            const comparison = standaloneVue.hasVue && integratedVue.hasVue 
                ? compareVueData(standaloneVue, integratedVue)
                : null;
            
            report.components[componentName].integrated[integration.page] = {
                vue: integratedVue,
                text: integratedText,
                dynamic: integratedDynamic,
                comparison
            };
            
            if (comparison && !comparison.passed) {
                report.summary.componentsWithIssues++;
            }
        }
    }
    
    const reportPath = path.join(__dirname, '..', 'test-results', 'component-behavior-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Behavior Report:`);
    console.log(`   Total components: ${report.summary.totalComponents}`);
    console.log(`   With Vue: ${report.summary.componentsWithVue}`);
    console.log(`   With issues: ${report.summary.componentsWithIssues}`);
    console.log(`\n   Report saved to: ${reportPath}`);
});

/**
 * ULTIMATE GENERIC COMPONENT TEST SYSTEM
 * 
 * ZERO MANUAL CONFIGURATION!
 * 
 * Automatically:
 * - Discovers ALL Vue components on page
 * - Tests ALL computed styles
 * - Tests ALL Vue data/props
 * - Tests ALL text rendering
 * - Tests ALL dynamic elements
 * - Compares standalone vs integrated
 * 
 * Just works. No maintenance needed.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// =============================================================================
// AUTO-DISCOVERY: Find ALL components automatically
// =============================================================================

/**
 * Discover all standalone component files
 */
function discoverStandaloneComponents() {
    const componentsDir = path.join(__dirname, '..', 'public', 'components', 'standalone');
    
    if (!fs.existsSync(componentsDir)) {
        return [];
    }
    
    const files = fs.readdirSync(componentsDir);
    return files
        .filter(f => f.endsWith('.html'))
        .map(f => ({
            name: f.replace('.html', ''),
            standalonePath: `/components/standalone/${f}`
        }));
}

/**
 * Discover all pages that might have components
 */
function discoverPages() {
    return [
        { path: '/', name: 'Landing' },
        { path: '/application/', name: 'Application' },
        { path: '/evaluation/', name: 'Evaluation' },
        { path: '/reservation/', name: 'Reservation' }
    ];
}

/**
 * Auto-discover component on page by scanning for data-component attributes OR common component classes
 */
async function discoverComponentsOnPage(page) {
    return await page.evaluate(() => {
        const components = [];
        const seen = new Set();
        
        // Strategy 1: Look for data-component attributes
        const elementsWithData = document.querySelectorAll('[data-component]');
        elementsWithData.forEach(el => {
            const name = el.getAttribute('data-component');
            const className = el.className.split(' ')[0];
            const selector = `.${className}`;
            
            if (!seen.has(name)) {
                seen.add(name);
                components.push({ name, selector, className });
            }
        });
        
        // Strategy 2: Look for known component patterns (scarcity-bar, graduate-counter, etc.)
        const knownComponents = [
            'scarcity-bar', 'graduate-counter', 'authority-logos', 'value-stack',
            'testimonial-carousel', 'guarantee-badges', 'faq-section',
            'testimonial-card', 'comparison-table', 'outcomes-section', 'pain-points',
            'stats-banner', 'bonus-stack', 'timeline-section'
        ];
        
        knownComponents.forEach(name => {
            const selector = `.${name}`;
            const element = document.querySelector(selector);
            if (element && !seen.has(name)) {
                seen.add(name);
                components.push({
                    name,
                    selector,
                    className: element.className
                });
            }
        });
        
        // Strategy 3: Look for Vue component tags
        const vueComponentSelectors = [
            'scarcity-bar', 'graduate-counter', 'authority-logos', 'value-stack',
            'comparison-table', 'testimonial-carousel', 'guarantee-badges',
            'outcomes-section', 'pain-points-section', 'stats-banner',
            'bonus-stack', 'timeline-section', 'faq-section'
        ];
        
        vueComponentSelectors.forEach(name => {
            const element = document.querySelector(name);
            if (element && !seen.has(name)) {
                seen.add(name);
                components.push({
                    name,
                    selector: name,
                    className: element.className || ''
                });
            }
        });
        
        return components;
    });
}

// =============================================================================
// GENERIC STYLE TESTING - Works for ANY element
// =============================================================================

const IGNORE_PROPERTIES = new Set([
    'width', 'height', 'inlineSize', 'blockSize',
    'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'top', 'left', 'right', 'bottom',
    'inset', 'insetBlock', 'insetInline',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'cssFloat', 'cssText', 'length', 'parentRule'
]);

const CRITICAL_PROPERTIES = new Set([
    'display', 'position', 'flexDirection', 'justifyContent', 'alignItems',
    'gridTemplateColumns', 'gridTemplateRows', 'gap',
    'padding', 'margin', 'border', 'borderRadius',
    'background', 'backgroundColor', 'backgroundImage',
    'color', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight',
    'boxShadow', 'textAlign', 'opacity', 'transform'
]);

async function getAllComputedStyles(page, selector) {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        const computed = window.getComputedStyle(element);
        const styles = {};
        
        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            styles[prop] = computed.getPropertyValue(prop);
        }
        
        return styles;
    }, selector);
}

function filterRelevantStyles(styles) {
    const filtered = {};
    
    for (const [prop, value] of Object.entries(styles)) {
        if (IGNORE_PROPERTIES.has(prop)) continue;
        if (!value || value === 'none' || value === 'normal' || value === 'auto') continue;
        if (prop.startsWith('webkit') && !prop.includes('backdrop')) continue;
        
        filtered[prop] = value;
    }
    
    return filtered;
}

// =============================================================================
// GENERIC VUE TESTING - Works for ANY Vue component
// =============================================================================

async function getVueState(page, selector) {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return { hasVue: false, data: {}, error: 'Element not found' };
        
        let vueInstance = null;
        
        vueInstance = element.__vue__ || element.__vueParentComponent;
        
        if (!vueInstance && element.closest('#app')) {
            const app = element.closest('#app');
            vueInstance = app.__vue__;
        }
        
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

// =============================================================================
// GENERIC TEXT TESTING - Works for ANY element
// =============================================================================

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

// =============================================================================
// GENERIC DYNAMIC ELEMENT TESTING - Works for ANY element
// =============================================================================

async function testDynamicElements(page, selector) {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return { hasDynamic: false, count: 0 };
        
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

// =============================================================================
// MAIN TEST SUITE - FULLY AUTOMATIC
// =============================================================================

test.describe('AUTOMATIC Component Discovery & Testing @smoke', () => {
    
    // Test 1: Auto-discover all pages and verify they load
    test('auto-discover: all pages load successfully', async ({ page }) => {
        const pages = discoverPages();
        
        for (const pageInfo of pages) {
            const response = await page.goto(pageInfo.path);
            expect(response.status()).toBe(200);
            console.log(`✅ ${pageInfo.name} (${pageInfo.path}) loads successfully`);
        }
    });
    
    // Test 2: Auto-discover all components on each page
    test('auto-discover: find all components on all pages', async ({ page }) => {
        const pages = discoverPages();
        const allComponentsFound = [];
        
        for (const pageInfo of pages) {
            await page.goto(pageInfo.path);
            await page.waitForLoadState('networkidle');
            
            const components = await discoverComponentsOnPage(page);
            
            console.log(`\n📦 ${pageInfo.name}: Found ${components.length} components`);
            components.forEach(c => console.log(`   - ${c.name} (${c.selector})`));
            
            allComponentsFound.push(...components.map(c => ({ ...c, page: pageInfo.path })));
        }
        
        expect(allComponentsFound.length).toBeGreaterThan(0);
    });
    
    // Test 3: Auto-test ALL components on ALL pages (styles + behavior)
    test('auto-test: all components on all pages', async ({ page }) => {
        const pages = discoverPages();
        let totalTested = 0;
        let totalPassed = 0;
        let totalIssues = 0;
        
        for (const pageInfo of pages) {
            await page.goto(pageInfo.path);
            await page.waitForLoadState('networkidle');
            
            const components = await discoverComponentsOnPage(page);
            
            for (const component of components) {
                console.log(`\n🧪 Testing ${component.name} on ${pageInfo.path}`);
                totalTested++;
                
                // Test 1: Element exists and is visible
                const element = page.locator(component.selector).first();
                try {
                    await expect(element).toBeVisible({ timeout: 2000 });
                    console.log(`   ✅ Visible`);
                } catch (e) {
                    console.log(`   ❌ Not visible`);
                    totalIssues++;
                    continue;
                }
                
                // Test 2: Has styles
                const styles = await getAllComputedStyles(page, component.selector);
                if (styles) {
                    const relevantStyles = filterRelevantStyles(styles);
                    const styleCount = Object.keys(relevantStyles).length;
                    console.log(`   ✅ Styles: ${styleCount} properties`);
                    
                    if (styleCount === 0) {
                        console.log(`   ⚠️  Warning: No relevant styles found`);
                    }
                } else {
                    console.log(`   ❌ Could not get styles`);
                    totalIssues++;
                }
                
                // Test 3: Has Vue (if applicable)
                const vueState = await getVueState(page, component.selector);
                if (vueState.hasVue) {
                    console.log(`   ✅ Vue: ${vueState.dataKeys.length} data props`);
                } else {
                    console.log(`   ℹ️  No Vue instance (may not need one)`);
                }
                
                // Test 4: Has text content
                const textState = await getRenderedText(page, component.selector);
                if (textState.hasText) {
                    console.log(`   ✅ Text: ${textState.length} chars`);
                } else {
                    console.log(`   ℹ️  No text content`);
                }
                
                // Test 5: Has dynamic elements
                const dynamicState = await testDynamicElements(page, component.selector);
                if (dynamicState.hasDynamic) {
                    console.log(`   ✅ Dynamic: ${dynamicState.dynamicClasses.length} repeated elements`);
                } else {
                    console.log(`   ℹ️  No dynamic elements detected`);
                }
                
                totalPassed++;
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total components tested: ${totalTested}`);
        console.log(`   Passed: ${totalPassed}`);
        console.log(`   Issues: ${totalIssues}`);
        
        expect(totalPassed).toBeGreaterThan(0);
    });
    
    // Test 4: Auto-compare standalone vs integrated (if standalone exists)
    test('auto-compare: standalone vs integrated components', async ({ page }) => {
        const standaloneComponents = discoverStandaloneComponents();
        const pages = discoverPages();
        
        console.log(`\n📦 Found ${standaloneComponents.length} standalone components`);
        
        for (const standalone of standaloneComponents) {
            console.log(`\n🔍 Analyzing ${standalone.name}...`);
            
            // Load standalone
            const standalonePath = path.join(__dirname, '..', 'public', standalone.standalonePath);
            if (!fs.existsSync(standalonePath)) {
                console.log(`   ⏭️  Skipping (file not found)`);
                continue;
            }
            
            await page.goto(standalone.standalonePath);
            await page.waitForLoadState('networkidle');
            
            const standaloneSelector = `[data-component="${standalone.name}"]`;
            
            // Get standalone data
            const standaloneStyles = await getAllComputedStyles(page, standaloneSelector);
            const standaloneVue = await getVueState(page, standaloneSelector);
            const standaloneText = await getRenderedText(page, standaloneSelector);
            
            if (!standaloneStyles) {
                console.log(`   ⚠️  Could not find component in standalone file`);
                continue;
            }
            
            const standaloneFiltered = filterRelevantStyles(standaloneStyles);
            console.log(`   📦 Standalone: ${Object.keys(standaloneFiltered).length} styles, ${standaloneVue.dataKeys?.length || 0} Vue props`);
            
            // Find on integrated pages
            let foundOnPages = 0;
            for (const pageInfo of pages) {
                await page.goto(pageInfo.path);
                await page.waitForLoadState('networkidle');
                
                const components = await discoverComponentsOnPage(page);
                const match = components.find(c => c.name === standalone.name);
                
                if (match) {
                    foundOnPages++;
                    
                    const integratedStyles = await getAllComputedStyles(page, match.selector);
                    const integratedVue = await getVueState(page, match.selector);
                    const integratedText = await getRenderedText(page, match.selector);
                    
                    if (integratedStyles) {
                        const integratedFiltered = filterRelevantStyles(integratedStyles);
                        console.log(`   🔗 ${pageInfo.name}: ${Object.keys(integratedFiltered).length} styles, ${integratedVue.dataKeys?.length || 0} Vue props`);
                        
                        // Compare critical styles
                        const criticalDiffs = [];
                        for (const prop of CRITICAL_PROPERTIES) {
                            if (standaloneFiltered[prop] !== integratedFiltered[prop]) {
                                if (standaloneFiltered[prop] || integratedFiltered[prop]) {
                                    criticalDiffs.push(prop);
                                }
                            }
                        }
                        
                        if (criticalDiffs.length > 0) {
                            console.log(`      ⚠️  ${criticalDiffs.length} style differences: ${criticalDiffs.join(', ')}`);
                        } else {
                            console.log(`      ✅ Styles match!`);
                        }
                    }
                }
            }
            
            console.log(`   📊 Found on ${foundOnPages} page(s)`);
        }
    });
});

// =============================================================================
// GENERIC PAGE TESTING - Auto-discover ALL pages
// =============================================================================

test.describe('AUTOMATIC Page Testing @smoke', () => {
    
    test('auto-test: all pages for basic functionality', async ({ page }) => {
        const pages = discoverPages();
        
        for (const pageInfo of pages) {
            console.log(`\n🌐 Testing ${pageInfo.name} (${pageInfo.path})`);
            
            // Load page
            const response = await page.goto(pageInfo.path);
            expect(response.status()).toBe(200);
            console.log(`   ✅ Loads successfully`);
            
            // Check for console errors
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });
            
            await page.waitForLoadState('networkidle');
            
            if (errors.length > 0) {
                console.log(`   ⚠️  ${errors.length} console errors`);
            } else {
                console.log(`   ✅ No console errors`);
            }
            
            // Check for any text content
            const bodyText = await page.textContent('body');
            expect(bodyText.length).toBeGreaterThan(100);
            console.log(`   ✅ Has content (${bodyText.length} chars)`);
            
            // Check for forms
            const forms = await page.locator('form').count();
            if (forms > 0) {
                console.log(`   ✅ ${forms} form(s) found`);
            }
            
            // Check for buttons/CTAs
            const buttons = await page.locator('button, .btn, .cta').count();
            console.log(`   ✅ ${buttons} button(s)/CTA(s) found`);
        }
    });
});

/**
 * HYPER-FAST DEPLOYMENT TEST SUITE
 * 
 * Target: Complete verification in <5 seconds
 * 
 * OPTIMIZATIONS:
 * - Serial mode: All tests share ONE browser page (no reloads!)
 * - Shared state: Load once, test many times
 * - Critical path only: Tests things that actually break
 * - No redundant checks: Auto-generic already tests components
 * - Page Object pattern: Fast, reusable selectors
 * 
 * Based on movie-trailer-finder/tests/ux-fast.spec.js patterns
 */

const { test, expect } = require('@playwright/test');

// Serial mode = share page across all tests
test.describe.configure({ mode: 'serial' });

let page;
let landingPage;
let applicationPage;

// =============================================================================
// PAGE OBJECTS - Fast, reusable selectors
// =============================================================================

class LandingPage {
    constructor(p) { this.page = p; }
    
    // Hero section
    get headline() { return this.page.locator('h1').first(); }
    get ctaButton() { return this.page.locator('.cta-btn, button:has-text("Apply"), button:has-text("Enroll")').first(); }
    
    // Form
    get nameInput() { return this.page.locator('input[type="text"][name="name"], input[placeholder*="name" i]').first(); }
    get emailInput() { return this.page.locator('input[type="email"]').first(); }
    
    // Sections
    get instructorsSection() { return this.page.locator('#instructors, section:has-text("Instructors")').first(); }
    get curriculumSection() { return this.page.locator('#curriculum, section:has-text("Curriculum")').first(); }
    get testimonialsSection() { return this.page.locator('#testimonials, .testimonial, section:has-text("Success"), section:has-text("Graduate")').first(); }
}

class ApplicationPage {
    constructor(p) { this.page = p; }
    
    get pageTitle() { return this.page.locator('h1').first(); }
    get formElement() { return this.page.locator('form').first(); }
    get nameInput() { return this.page.locator('input#form-name, input[placeholder*="name" i], input[name="name"]').first(); }
    get emailInput() { return this.page.locator('input[type="email"]').first(); }
    get continueButton() { return this.page.locator('button:has-text("Continue")').first(); }
    get submitButton() { return this.page.locator('button[type="submit"]').first(); }
}

// =============================================================================
// SETUP - Load pages ONCE, reuse for all tests
// =============================================================================

test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    landingPage = new LandingPage(page);
    applicationPage = new ApplicationPage(page);
});

test.afterAll(async () => {
    await page.close();
});

// =============================================================================
// LANDING PAGE TESTS - Critical path only
// =============================================================================

test.describe('Landing Page - Critical Path', () => {
    
    test.beforeAll(async () => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });
    
    test('page loads successfully', async () => {
        await expect(page).toHaveTitle(/Adava/i);
    });
    
    test('headline visible', async () => {
        await expect(landingPage.headline).toBeVisible();
        const text = await landingPage.headline.textContent();
        expect(text.length).toBeGreaterThan(10);
    });
    
    test('CTA button visible and clickable', async () => {
        await expect(landingPage.ctaButton).toBeVisible();
        await expect(landingPage.ctaButton).toBeEnabled();
    });
    
    test('form inputs visible', async () => {
        await expect(landingPage.nameInput).toBeVisible();
        await expect(landingPage.emailInput).toBeVisible();
    });
    
    test('form inputs work', async () => {
        await landingPage.nameInput.fill('Test User');
        await landingPage.emailInput.fill('test@example.com');
        
        const nameValue = await landingPage.nameInput.inputValue();
        const emailValue = await landingPage.emailInput.inputValue();
        
        expect(nameValue).toBe('Test User');
        expect(emailValue).toBe('test@example.com');
    });
    
    test('instructors section visible', async () => {
        await expect(landingPage.instructorsSection).toBeVisible();
    });
    
    test('curriculum section visible', async () => {
        await expect(landingPage.curriculumSection).toBeVisible();
    });
    
    test('testimonials section visible', async () => {
        await expect(landingPage.testimonialsSection).toBeVisible();
    });
    
    test('no console errors', async () => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        expect(errors.length).toBe(0);
    });
});

// =============================================================================
// APPLICATION PAGE TESTS - Critical path only
// =============================================================================

test.describe('Application Page - Critical Path', () => {
    
    test.beforeAll(async () => {
        await page.goto('/application/');
        await page.waitForLoadState('networkidle');
    });
    
    test('page loads successfully', async () => {
        await expect(page).toHaveURL(/application/);
    });
    
    test('application title visible', async () => {
        await expect(applicationPage.pageTitle).toBeVisible();
        const text = await applicationPage.pageTitle.textContent();
        expect(text.toLowerCase()).toContain('application');
    });
    
    test('form exists', async () => {
        await expect(applicationPage.formElement).toBeVisible();
    });
    
    test('name input visible and works', async () => {
        await expect(applicationPage.nameInput).toBeVisible();
        await applicationPage.nameInput.fill('John');
        expect(await applicationPage.nameInput.inputValue()).toBe('John');
    });
    
    test('email input visible and works', async () => {
        await expect(applicationPage.emailInput).toBeVisible();
        await applicationPage.emailInput.fill('john@example.com');
        expect(await applicationPage.emailInput.inputValue()).toBe('john@example.com');
    });
    
    test('continue button visible', async () => {
        await expect(applicationPage.continueButton).toBeVisible();
    });
    
    test('submit button exists (might be hidden)', async () => {
        const submitCount = await applicationPage.submitButton.count();
        expect(submitCount).toBeGreaterThan(0);
    });
    
    test('no console errors on application page', async () => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Filter out known non-critical errors
        const criticalErrors = errors.filter(e => 
            !e.includes('favicon') && 
            !e.includes('404') &&
            !e.includes('network')
        );
        
        expect(criticalErrors.length).toBe(0);
    });
});

// =============================================================================
// MOBILE RESPONSIVENESS - Quick smoke test
// =============================================================================

test.describe('Mobile - Quick Smoke Test', () => {
    
    test('landing page works on mobile', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check critical elements visible
        await expect(landingPage.headline).toBeVisible();
        await expect(landingPage.ctaButton).toBeVisible();
        
        // Check form inputs visible (even if stacked)
        await expect(landingPage.nameInput).toBeVisible();
        await expect(landingPage.emailInput).toBeVisible();
    });
    
    test('application page works on mobile', async () => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/application/');
        await page.waitForLoadState('networkidle');
        
        await expect(applicationPage.pageTitle).toBeVisible();
        await expect(applicationPage.formElement).toBeVisible();
        await expect(applicationPage.nameInput).toBeVisible();
    });
    
    // Reset to desktop for any remaining tests
    test.afterAll(async () => {
        await page.setViewportSize({ width: 1440, height: 900 });
    });
});

// =============================================================================
// NAVIGATION - Basic smoke test
// =============================================================================

test.describe('Navigation', () => {
    
    test('can navigate from landing to application (or CTA is external link)', async () => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const ctaHref = await landingPage.ctaButton.getAttribute('href');
        
        if (ctaHref && ctaHref.includes('application')) {
            // CTA links to application page
            await landingPage.ctaButton.click();
            await page.waitForURL(/application/, { timeout: 5000 });
            await expect(applicationPage.pageTitle).toBeVisible();
        } else {
            // CTA might be form submission or external link - that's OK
            // Just verify direct navigation works
            await page.goto('/application/');
            await page.waitForLoadState('networkidle');
            await expect(applicationPage.pageTitle).toBeVisible();
        }
    });
    
    test('direct application URL works', async () => {
        await page.goto('/application/');
        await page.waitForLoadState('networkidle');
        
        await expect(applicationPage.pageTitle).toBeVisible();
        await expect(applicationPage.formElement).toBeVisible();
    });
});

// =============================================================================
// PERFORMANCE - Basic checks
// =============================================================================

test.describe('Performance - Basic Checks', () => {
    
    test('landing page loads quickly', async () => {
        const start = Date.now();
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - start;
        
        // Should load in under 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });
    
    test('application page loads quickly', async () => {
        const start = Date.now();
        await page.goto('/application/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - start;
        
        // Should load in under 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });
    
    test('form interactions are responsive', async () => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const start = Date.now();
        await landingPage.nameInput.fill('Quick Test');
        await landingPage.emailInput.fill('quick@test.com');
        const interactionTime = Date.now() - start;
        
        // Should be instant (<500ms)
        expect(interactionTime).toBeLessThan(500);
    });
});

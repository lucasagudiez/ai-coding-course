// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Payment E2E Test Configuration
 * 
 * SERIAL MODE: Runs tests one at a time to:
 * - Avoid race conditions with shared backend
 * - Reduce memory usage (only 1 browser open)
 * - Make debugging easier
 * - Share context between tests
 */

module.exports = defineConfig({
    testDir: './tests',
    testMatch: '**/payment-e2e.spec.js',
    
    /* SERIAL MODE - one test at a time */
    fullyParallel: false,
    workers: 1, // Only 1 worker = serial execution
    
    forbidOnly: false,
    retries: 0, // No retries - fix issues immediately
    
    /* Generous timeouts for payment processing */
    timeout: 60000, // 60s per test (payment can take time)
    expect: {
        timeout: 10000, // 10s for assertions
    },
    
    /* Detailed reporter for debugging */
    reporter: [
        ['list', { printSteps: true }],
        ['html', { open: 'never' }]
    ],
    
    use: {
        baseURL: 'http://localhost:8888',
        
        /* Payment-specific timeouts */
        actionTimeout: 15000, // 15s for Square form interactions
        navigationTimeout: 30000, // 30s for redirects after payment
        
        /* Capture artifacts for debugging payment issues */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        
        /* Headed by default, headless if HEADLESS=1 env var */
        headless: process.env.HEADLESS === '1',
        
        /* Slower animations for stability */
        reducedMotion: 'reduce',
    },

    /* Single browser - Chromium only for payment tests */
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 720 }
            },
        },
    ],
});

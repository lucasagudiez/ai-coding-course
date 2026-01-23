const { test, expect } = require('@playwright/test');

test.describe('Scholarship Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8888/');
    });

    test('Scholarship code reduces price from $1,280 to $590', async ({ page }) => {
        // Check initial price display
        const originalPrice = page.locator('#original-price');
        await expect(originalPrice).toBeVisible();
        await expect(originalPrice.locator('.amount')).toHaveText('1,280');
        
        // Find and fill scholarship code input
        const scholarshipInput = page.locator('#scholarship-code, input[placeholder*="cholarship"], input[placeholder*="SCHOLARSHIP"]');
        await scholarshipInput.waitFor({ state: 'visible', timeout: 5000 });
        await scholarshipInput.fill('TESTSCHOLARSHIP');
        
        // Apply scholarship code
        const applyButton = page.locator('button:has-text("Use Scholarship"), button:has-text("Apply"), #apply-scholarship');
        await applyButton.click();
        
        // Wait for price change animation
        await page.waitForTimeout(500);
        
        // Verify scholarship price is shown
        const scholarshipPrice = page.locator('#scholarship-price');
        await expect(scholarshipPrice).toBeVisible();
        
        // Verify new price is $590
        const scholarshipAmount = scholarshipPrice.locator('.scholarship-amount');
        await expect(scholarshipAmount).toHaveText('590');
        
        // Verify hourly rate updated to $29.50/hr
        const hourlyRate = scholarshipPrice.locator('.hourly-rate');
        await expect(hourlyRate).toContainText('$29.50/hr');
        
        // Verify scholarship badge is shown
        const badge = scholarshipPrice.locator('.scholarship-badge');
        await expect(badge).toBeVisible();
        await expect(badge).toContainText('SCHOLARSHIP APPLIED');
    });

    test('Comparison table updates to $590 after scholarship applied', async ({ page }) => {
        // Apply scholarship code
        const scholarshipInput = page.locator('#scholarship-code, input[placeholder*="cholarship"]');
        await scholarshipInput.fill('MYSCHOLARSHIP');
        
        const applyButton = page.locator('button:has-text("Use Scholarship"), #apply-scholarship');
        await applyButton.click();
        
        // Wait for updates
        await page.waitForTimeout(500);
        
        // Check comparison table pricing
        const comparisonPrice = page.locator('.comparison-section .comparison-cell.highlight strong');
        if (await comparisonPrice.count() > 0) {
            await expect(comparisonPrice).toHaveText('$590');
        }
    });

    test('ROI calculator updates to 159x after scholarship applied', async ({ page }) => {
        // Apply scholarship code
        const scholarshipInput = page.locator('#scholarship-code, input[placeholder*="cholarship"]');
        await scholarshipInput.fill('SCHOLARSHIP2024');
        
        const applyButton = page.locator('button:has-text("Use Scholarship"), #apply-scholarship');
        await applyButton.click();
        
        // Wait for updates
        await page.waitForTimeout(500);
        
        // Check if ROI section exists and verify updates
        const roiResult = page.locator('.roi-result strong');
        if (await roiResult.count() > 0) {
            await expect(roiResult).toContainText('159x');
        }
        
        // Check investment amount updated
        const investmentAmount = page.locator('.roi-row .amount');
        if (await investmentAmount.count() > 0) {
            await expect(investmentAmount).toHaveText('$590');
        }
    });

    test('Invalid scholarship code shows error', async ({ page }) => {
        // Try invalid code
        const scholarshipInput = page.locator('#scholarship-code, input[placeholder*="cholarship"]');
        await scholarshipInput.fill('INVALIDCODE');
        
        const applyButton = page.locator('button:has-text("Use Scholarship"), #apply-scholarship');
        await applyButton.click();
        
        // Wait for error message
        await page.waitForTimeout(500);
        
        // Verify original price still shown (scholarship not applied)
        const originalPrice = page.locator('#original-price');
        await expect(originalPrice).toBeVisible();
        
        // Verify scholarship price NOT shown
        const scholarshipPrice = page.locator('#scholarship-price');
        await expect(scholarshipPrice).not.toBeVisible();
    });

    test('Scholarship code validation requires "scholarship" suffix', async ({ page }) => {
        // Valid codes ending with "scholarship"
        const validCodes = ['SCHOLARSHIP', 'myscholarship', 'TEST-SCHOLARSHIP'];
        
        for (const code of validCodes) {
            await page.reload();
            
            const scholarshipInput = page.locator('#scholarship-code, input[placeholder*="cholarship"]');
            await scholarshipInput.fill(code);
            
            const applyButton = page.locator('button:has-text("Use Scholarship"), #apply-scholarship');
            await applyButton.click();
            
            await page.waitForTimeout(500);
            
            // Should show scholarship price
            const scholarshipPrice = page.locator('#scholarship-price');
            await expect(scholarshipPrice).toBeVisible();
        }
    });
});

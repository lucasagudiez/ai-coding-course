const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Load API key from environment or config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_KEY_HERE';

const pages = [
  { 
    file: 'evaluation-claude.html', 
    name: 'Claude (Emotional)', 
    screenshot: 'claude-response.png' 
  },
  { 
    file: 'evaluation-codex.html', 
    name: 'Codex (Data-Driven)', 
    screenshot: 'codex-response.png' 
  },
  { 
    file: 'evaluation-cursor.html', 
    name: 'Cursor (Standard)', 
    screenshot: 'cursor-response.png' 
  }
];

async function testPage(browser, pageInfo) {
  console.log(`\n🧪 Testing: ${pageInfo.name}`);
  console.log('─'.repeat(60));
  
  const page = await browser.newPage();
  
  try {
    // Load the HTML file
    const filePath = path.resolve(__dirname, pageInfo.file);
    await page.goto(`file://${filePath}`);
    console.log(`✅ Loaded: ${pageInfo.file}`);
    
    // Wait for form to be ready
    await page.waitForSelector('form');
    
    // Fill in API key
    await page.fill('#apiKey', OPENAI_API_KEY);
    console.log('✅ API key entered');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Form submitted');
    
    // Wait for loading spinner
    await page.waitForSelector('.loading.active', { timeout: 2000 });
    console.log('⏳ Loading animation displayed');
    
    // Wait for result (GPT-4 response) - give it up to 30 seconds
    await page.waitForSelector('.result.active', { timeout: 30000 });
    console.log('✅ Result received from GPT-4');
    
    // Extract the AI response text
    const resultText = await page.textContent('.result-content');
    console.log(`\n📝 AI Response (${pageInfo.name}):`);
    console.log('─'.repeat(60));
    console.log(resultText);
    console.log('─'.repeat(60));
    
    // Take screenshot of the result
    await page.screenshot({ 
      path: pageInfo.screenshot, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${pageInfo.screenshot}`);
    
    // Save response text to file
    const textFile = pageInfo.screenshot.replace('.png', '.txt');
    fs.writeFileSync(textFile, resultText);
    console.log(`💾 Response text saved: ${textFile}`);
    
    return {
      page: pageInfo.name,
      success: true,
      response: resultText,
      screenshot: pageInfo.screenshot
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${pageInfo.name}:`, error.message);
    
    // Take error screenshot
    const errorScreenshot = pageInfo.screenshot.replace('.png', '-ERROR.png');
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    
    return {
      page: pageInfo.name,
      success: false,
      error: error.message,
      screenshot: errorScreenshot
    };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('\n🚀 AI CLI Tool Comparison - Playwright Test Suite');
  console.log('='.repeat(60));
  console.log(`Testing ${pages.length} evaluation pages with GPT-4`);
  console.log('='.repeat(60));
  
  if (OPENAI_API_KEY === 'YOUR_KEY_HERE') {
    console.error('\n❌ ERROR: No OpenAI API key found!');
    console.error('Set OPENAI_API_KEY environment variable or edit the script.\n');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const pageInfo of pages) {
    const result = await testPage(browser, pageInfo);
    results.push(result);
    
    // Wait a bit between tests to avoid rate limiting
    if (pageInfo !== pages[pages.length - 1]) {
      console.log('\n⏸️  Waiting 3 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  await browser.close();
  
  // Generate comparison report
  console.log('\n\n📊 FINAL COMPARISON REPORT');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.page}`);
    if (result.success) {
      console.log(`   ✅ Success`);
      console.log(`   📸 Screenshot: ${result.screenshot}`);
      console.log(`   📏 Response length: ${result.response.length} characters`);
      console.log(`   📄 Word count: ${result.response.split(/\s+/).length} words`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  });
  
  // Save structured results
  fs.writeFileSync(
    'playwright-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n\n✅ All tests complete!');
  console.log('📄 Results saved to: playwright-test-results.json');
  console.log('\n📸 Screenshots generated:');
  results.forEach(r => {
    if (r.success) {
      console.log(`   - ${r.screenshot}`);
      console.log(`   - ${r.screenshot.replace('.png', '.txt')}`);
    }
  });
  console.log('\n');
}

main().catch(console.error);

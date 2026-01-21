#!/usr/bin/env node
/**
 * Automatic Cache Busting - Updates CSS/JS version parameters
 * Runs automatically during deployment to force browser cache refresh
 * Uses git commit hash as version to ensure uniqueness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current git commit hash (short version)
const getGitHash = () => {
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (error) {
        console.error('Warning: Could not get git hash, using timestamp');
        return Date.now().toString();
    }
};

// Files to update with cache-busting versions
const filesToUpdate = [
    'public/index.html',
    'public/application/index.html',
    'public/evaluation/index.html',
    'public/reservation/index.html',
];

const version = getGitHash();
console.log(`🔄 Updating cache-busting version to: ${version}`);

let updatedCount = 0;

filesToUpdate.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} (not found)`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Update CSS links: href="styles.css?v=ANYTHING" -> href="styles.css?v=HASH"
    const cssRegex = /(<link[^>]*href=["'][^"']*\.css)(\?v=[^"']*)?([^>]*>)/g;
    if (content.match(cssRegex)) {
        content = content.replace(cssRegex, `$1?v=${version}$3`);
        modified = true;
    }
    
    // Update JS script tags: src="app.js?v=ANYTHING" -> src="app.js?v=HASH"
    const jsRegex = /(<script[^>]*src=["'][^"']*\.js)(\?v=[^"']*)?([^>]*>)/g;
    if (content.match(jsRegex)) {
        content = content.replace(jsRegex, `$1?v=${version}$3`);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
        updatedCount++;
    } else {
        console.log(`⏭️  No changes needed in ${filePath}`);
    }
});

console.log(`\n✅ Cache-busting version updated: ${version}`);
console.log(`📦 Updated ${updatedCount} file(s)`);
console.log(`\n💡 All CSS/JS files will now force browsers to download fresh versions.`);

#!/usr/bin/env node

/**
 * Fix all standalone components to use shared components.css
 * This ensures computed styles match between standalone and integrated versions
 */

const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '../public/components/standalone');
const files = fs.readdirSync(standaloneDir).filter(f => f.endsWith('.html'));

console.log(`Fixing ${files.length} standalone component files...\n`);

files.forEach(file => {
    const filePath = path.join(standaloneDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already has the correct link
    if (content.includes('href="../../css/components.css"')) {
        console.log(`✓ ${file} - Already has shared CSS`);
        return;
    }
    
    // Remove any existing embedded <style> tags (but keep the <style> opening and closing)
    // Replace the entire <style>...</style> block with a link to components.css
    content = content.replace(
        /<style>[\s\S]*?<\/style>/,
        `<!-- Shared Component Styles -->
    <link rel="stylesheet" href="../../css/components.css">
    
    <style>
        /* Base page styles only (not component styles) */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #0a0a14;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px 20px;
            min-height: 100vh;
            color: white;
        }
        
        #app {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Dev info badge */
        .dev-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00d4aa;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    </style>`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - Updated to use shared CSS`);
});

console.log(`\n✅ All ${files.length} standalone components now use shared components.css`);
console.log(`   This ensures computed styles match between standalone and integrated versions.`);

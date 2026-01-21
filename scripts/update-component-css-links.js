#!/usr/bin/env node

/**
 * Update all component templates to load their own CSS file
 * Each component will load: components/css/component-name.css
 */

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../public/components/templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

console.log(`Updating ${files.length} component templates to load individual CSS...\n`);

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const componentName = file.replace('.html', '');
    
    // Replace the shared components.css with component-specific CSS
    const oldLink = '<link rel="stylesheet" href="../../css/components.css">';
    const newLink = `<link rel="stylesheet" href="../css/${componentName}.css">`;
    
    if (content.includes(oldLink)) {
        content = content.replace(oldLink, newLink);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`OK ${componentName}.html -> loads ../css/${componentName}.css`);
    } else {
        console.log(`SKIP ${componentName}.html (no shared CSS link found)`);
    }
});

console.log('\nDone! Each component now loads its own CSS file.');

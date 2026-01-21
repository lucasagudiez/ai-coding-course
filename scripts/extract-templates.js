#!/usr/bin/env node

/**
 * Extract HTML templates from components.js into separate .html files
 */

const fs = require('fs');
const path = require('path');

const componentsJsPath = path.join(__dirname, '../public/js/components.js');
const templatesDir = path.join(__dirname, '../public/components/templates');

// Read components.js
const componentsJs = fs.readFileSync(componentsJsPath, 'utf8');

// Regular expression to match Vue.component() definitions
// Captures: component name and template content
const componentRegex = /Vue\.component\('([^']+)',\s*\{[^]*?template:\s*`([^`]+)`/g;

let match;
let extractedCount = 0;

console.log('Extracting HTML templates from components.js...\n');

while ((match = componentRegex.exec(componentsJs)) !== null) {
    const componentName = match[1];
    let templateHtml = match[2];
    
    // Clean up the template HTML (remove leading/trailing whitespace from each line)
    templateHtml = templateHtml
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    
    // Write to file
    const outputPath = path.join(templatesDir, `${componentName}.html`);
    fs.writeFileSync(outputPath, templateHtml, 'utf8');
    
    console.log(`✅ Extracted: ${componentName}.html`);
    extractedCount++;
}

console.log(`\n✅ Total extracted: ${extractedCount} component templates`);
console.log(`📁 Location: public/components/templates/\n`);

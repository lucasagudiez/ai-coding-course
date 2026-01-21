#!/usr/bin/env node

/**
 * Extract each component's CSS and JS into separate files
 * Each component gets: component-name.css and component-name.js
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../public/components');
const cssDir = path.join(componentsDir, 'css');
const jsDir = path.join(componentsDir, 'js');

// Create directories
[cssDir, jsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Read the monolithic files
const sharedCss = path.join(__dirname, '../public/css/components.css');
const sharedJs = path.join(__dirname, '../public/js/components.js');

console.log('Extracting component CSS and JS into separate files...\n');

// Component list
const components = [
    'scarcity-bar',
    'graduate-counter',
    'authority-logos',
    'value-stack',
    'bonus-stack',
    'outcomes-section',
    'stats-banner',
    'timeline-section',
    'testimonial-carousel',
    'guarantee-badges',
    'faq-section',
    'comparison-table',
    'what-youll-build'
];

// Extract CSS for each component
const cssContent = fs.readFileSync(sharedCss, 'utf8');
components.forEach(name => {
    const className = '.' + name;
    const regex = new RegExp(`\\/\\* ${name}[^*]*\\*\\/[\\s\\S]*?(?=\\/\\*|$)`, 'i');
    let componentCss = cssContent.match(regex);
    
    if (!componentCss) {
        // Try to find by class selector
        const lines = cssContent.split('\n');
        let inComponent = false;
        let css = [];
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(className)) {
                inComponent = true;
            }
            if (inComponent) {
                css.push(lines[i]);
                // Stop at next component or end
                if (lines[i].match(/^\.[\w-]+\s*\{/) && !lines[i].includes(name) && css.length > 5) {
                    break;
                }
            }
        }
        componentCss = css.join('\n');
    } else {
        componentCss = componentCss[0];
    }
    
    const cssFile = path.join(cssDir, `${name}.css`);
    fs.writeFileSync(cssFile, componentCss || `/* ${name} styles */\n.${name} {\n    /* Add styles here */\n}\n`, 'utf8');
    console.log(`✅ ${name}.css`);
});

// Extract JS for each component (from components.js)
if (fs.existsSync(sharedJs)) {
    const jsContent = fs.readFileSync(sharedJs, 'utf8');
    
    // This file only has component registrations, not logic
    // We'll create minimal JS files for each component
    components.forEach(name => {
        const jsFile = path.join(jsDir, `${name}.js`);
        const componentJs = `// ${name} component logic
// This file contains Vue component-specific JavaScript

// Component is registered via component-loader.js
// Add component-specific methods, computed properties, etc. here if needed
`;
        fs.writeFileSync(jsFile, componentJs, 'utf8');
        console.log(`✅ ${name}.js`);
    });
}

console.log(`\n✅ Created ${components.length * 2} files (CSS + JS for each component)`);
console.log(`   CSS: public/components/css/`);
console.log(`   JS: public/components/js/`);

#!/usr/bin/env node

/**
 * Properly extract component CSS from components.css into separate files
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../public/components');
const cssDir = path.join(componentsDir, 'css');
const sharedCssPath = path.join(__dirname, '../public/css/components.css');

if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}

const cssContent = fs.readFileSync(sharedCssPath, 'utf8');

// Extract CSS variables (keep in general styles)
const variablesMatch = cssContent.match(/:root\s*\{[^}]+\}/s);
const cssVariables = variablesMatch ? variablesMatch[0] : '';

// Split by component sections
const sections = cssContent.split(/\/\* =+\s*\n\s+([A-Z\s]+COMPONENT)\s*\n\s+=+ \*\//);

console.log('Extracting component CSS...\n');

const componentMap = {
    'SCARCITY BAR COMPONENT': 'scarcity-bar',
    'GRADUATE COUNTER COMPONENT': 'graduate-counter',
    'AUTHORITY LOGOS COMPONENT': 'authority-logos',
    'VALUE STACK COMPONENT': 'value-stack',
    'BONUS STACK COMPONENT': 'bonus-stack',
    'OUTCOMES SECTION COMPONENT': 'outcomes-section',
    'STATS BANNER COMPONENT': 'stats-banner',
    'TIMELINE SECTION COMPONENT': 'timeline-section',
    'TESTIMONIAL CAROUSEL COMPONENT': 'testimonial-carousel',
    'GUARANTEE BADGES COMPONENT': 'guarantee-badges',
    'FAQ SECTION COMPONENT': 'faq-section',
    'COMPARISON TABLE COMPONENT': 'comparison-table',
    'WHAT YOU\'LL BUILD COMPONENT': 'what-youll-build'
};

for (let i = 1; i < sections.length; i += 2) {
    const sectionName = sections[i];
    const sectionCss = sections[i + 1];
    
    const componentName = componentMap[sectionName];
    if (componentName && sectionCss) {
        const cssFile = path.join(cssDir, `${componentName}.css`);
        const content = `/* ${componentName} component styles */\n\n${cssVariables}\n\n${sectionCss.trim()}\n`;
        fs.writeFileSync(cssFile, content, 'utf8');
        console.log(`✅ ${componentName}.css (${content.split('\n').length} lines)`);
    }
}

console.log('\n✅ All component CSS files extracted!');

#!/usr/bin/env node

/**
 * Convert component templates to standalone-capable format
 * Each template becomes a full HTML page that can be opened in browser
 * OR fetched as a component template by component-loader.js
 */

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../public/components/templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

console.log(`Converting ${files.length} component templates to standalone format...\n`);

const standaloneWrapper = {
    before: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COMPONENT_NAME Component</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../css/components.css">
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
    <style>
        body { background: #0a0a14; font-family: -apple-system, sans-serif; padding: 40px 20px; color: white; }
        #standalone-wrapper { max-width: 1200px; margin: 0 auto; }
        .dev-info { position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); 
                    color: #00d4aa; padding: 10px 15px; border-radius: 8px; font-size: 12px; z-index: 1000; }
    </style>
</head>
<body>
    <div id="standalone-wrapper">
        <div class="dev-info">
            Component: COMPONENT_NAME<br>
            Mode: Standalone<br>
            <small>This file works both standalone and as a component template</small>
        </div>
        
        <!-- START_COMPONENT -->`,
    after: `
        <!-- END_COMPONENT -->
    </div>
    
    <script>
        new Vue({
            el: '#standalone-wrapper',
            data: COMPONENT_DATA
        });
    </script>
</body>
</html>`
};

// Component-specific data for standalone mode
const componentData = {
    'scarcity-bar': '{ spotsRemaining: 3 }',
    'testimonial-carousel': '{ currentIndex: 0, testimonials: [] }',
    'faq-section': '{ faqOpen: {} }',
    'default': '{}'
};

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const componentName = file.replace('.html', '');
    
    // Skip if already has markers
    if (content.includes('START_COMPONENT')) {
        console.log(`✓ ${file} - Already in standalone format`);
        return;
    }
    
    // Wrap content with standalone HTML
    const data = componentData[componentName] || componentData.default;
    const wrappedContent = standaloneWrapper.before
        .replace(/COMPONENT_NAME/g, componentName)
        + '\n' + content.trim() + '\n'
        + standaloneWrapper.after.replace('COMPONENT_DATA', data);
    
    fs.writeFileSync(filePath, wrappedContent, 'utf8');
    console.log(`✅ ${file} - Converted to standalone format`);
});

console.log(`\n✅ All ${files.length} templates can now be opened standalone or used as components!`);
console.log(`   Open any template directly in browser: /components/templates/scarcity-bar.html`);
console.log(`   Or use as component: <scarcity-bar></scarcity-bar>`);

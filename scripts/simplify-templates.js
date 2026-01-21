#!/usr/bin/env node

/**
 * Simplify all component templates
 * Templates should just be component HTML + minimal inline Vue init
 * Browsers handle missing html/head/body tags automatically
 */

const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../public/components/templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

console.log(`Simplifying ${files.length} component templates...\n`);

files.forEach(file => {
    const filePath = path.join(templatesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract just the component HTML (between markers if they exist)
    const startMarker = '<!-- START_COMPONENT -->';
    const endMarker = '<!-- END_COMPONENT -->';
    let componentHtml = content;
    
    if (content.includes(startMarker)) {
        const startIdx = content.indexOf(startMarker);
        const endIdx = content.indexOf(endMarker);
        componentHtml = content.substring(startIdx + startMarker.length, endIdx).trim();
    }
    
    // Add data-component attribute to root element
    const componentName = file.replace('.html', '');
    componentHtml = componentHtml.replace(/^<div class="([^"]+)"/, `<div class="$1" data-component="${componentName}"`);
    
    // Get first element's class for Vue mounting
    const classMatch = componentHtml.match(/class="([^"]+)"/);
    const firstClass = classMatch ? classMatch[1].split(' ')[0] : 'component';
    
    // Component-specific data
    const dataMap = {
        'scarcity-bar': '{ spotsRemaining: 3 }',
        'testimonial-carousel': '{ currentIndex: 0 }',
        'faq-section': '{ faqOpen: {} }',
    };
    const vueData = dataMap[file.replace('.html', '')] || '{}';
    
    // Minimal template format
    const simplified = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="../../css/components.css">
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>

<!-- START_COMPONENT -->
${componentHtml}
<!-- END_COMPONENT -->

<script>
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.${firstClass}')) {
        document.body.style = 'background:#0a0a14;padding:40px;color:white;font-family:sans-serif;max-width:1200px;margin:auto';
        new Vue({ el: '.${firstClass}', data: ${vueData} });
    }
});
</script>
`;
    
    fs.writeFileSync(filePath, simplified, 'utf8');
    console.log(`✅ ${file}`);
});

console.log(`\n✅ All templates simplified! Open any in browser: /components/templates/scarcity-bar.html`);

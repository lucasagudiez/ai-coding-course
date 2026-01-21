#!/usr/bin/env node

/**
 * Component Generator
 * 
 * Usage: node scripts/create-component.js <component-name>
 * 
 * Creates a standalone component file with template structure
 */

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];

if (!componentName) {
    console.error('❌ Error: Component name required');
    console.log('Usage: node scripts/create-component.js <component-name>');
    console.log('Example: node scripts/create-component.js testimonial-card');
    process.exit(1);
}

const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} Component - Standalone</title>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Vue.js -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
    
    <style>
        /* Reset */
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
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Component styles - COPY THESE TO main styles.css */
        .${componentName} {
            /* Add your component styles here */
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            color: white;
        }
        
        /* Dev tools */
        .dev-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }
        
        .dev-info h4 {
            margin-bottom: 8px;
            color: #00d4aa;
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- Dev Info -->
        <div class="dev-info">
            <h4>Component: ${componentName}</h4>
            <div>Status: <span style="color: #00d4aa;">✓ Standalone</span></div>
        </div>
        
        <!-- Component -->
        <div class="${componentName}" data-component="${componentName}">
            <h3>Component: ${componentName}</h3>
            <p>Edit this component until it looks perfect!</p>
        </div>
    </div>
    
    <script>
        // Simple Vue instance for standalone testing
        new Vue({
            el: '#app',
            data: {
                // Add your component data here
            }
        });
        
        // Expose computed styles for testing
        window.getComponentStyles = function() {
            const component = document.querySelector('[data-component="${componentName}"]');
            const computed = window.getComputedStyle(component);
            
            return {
                component: '${componentName}',
                mode: 'standalone',
                styles: {
                    display: computed.display,
                    padding: computed.padding,
                    margin: computed.margin,
                    background: computed.background,
                    borderRadius: computed.borderRadius,
                    color: computed.color
                }
            };
        };
        
        console.log('${componentName} - Standalone Mode');
        console.log('Run window.getComponentStyles() to export styles for comparison');
    </script>
</body>
</html>
`;

const outputPath = path.join(__dirname, '..', 'public', 'components', 'standalone', `${componentName}.html`);

// Create directory if it doesn't exist
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Write file
fs.writeFileSync(outputPath, template);

console.log(`✅ Created standalone component: ${outputPath}`);
console.log(`\nNext steps:`);
console.log(`1. Open http://localhost:8888/components/standalone/${componentName}.html`);
console.log(`2. Edit the component until it looks perfect`);
console.log(`3. Run: npm run test:component-verify -- ${componentName}`);
console.log(`4. Copy the component to Vue components.js`);
console.log(`5. Run tests again to ensure styles match`);

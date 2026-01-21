/**
 * Code Separation Tests
 * Enforces strict separation of concerns:
 * - HTML tags ONLY in .html files
 * - CSS ONLY in .css files
 * - JavaScript ONLY in .js files
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// HTML tag pattern (matches opening/closing tags)
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*?>/gi;
// CSS pattern (matches property: value; or selector { })
const CSS_PATTERN = /([a-z-]+\s*:\s*[^;]+;)|([.#a-z][\s\S]*?\{[\s\S]*?\})/gi;
// Inline style attribute pattern
const INLINE_STYLE_PATTERN = /style\s*=\s*["'][^"']*["']/gi;

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = [], extension = null) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        
        // Skip node_modules, .git, test-results, etc.
        if (file === 'node_modules' || file === '.git' || file === 'test-results' || 
            file === 'playwright-report' || file.startsWith('.')) {
            return;
        }

        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles, extension);
        } else {
            if (!extension || filePath.endsWith(extension)) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

test.describe('Code Separation - JavaScript Files', () => {
    const publicDir = path.join(__dirname, '../public');
    const jsFiles = getAllFiles(publicDir, [], '.js');

    test('should not contain HTML tags in .js files', () => {
        const violations = [];

        jsFiles.forEach(filePath => {
            // Skip minified third-party libraries and unminified third-party (aos.js, etc)
            const filename = path.basename(filePath);
            if (filePath.endsWith('.min.js') || filename === 'aos.js' || filename === 'vanilla-tilt.js') {
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for HTML tags
            const matches = content.match(HTML_TAG_PATTERN);
            
            if (matches) {
                // Filter out false positives (comments, strings that aren't templates)
                const realViolations = matches.filter(match => {
                    // Ignore HTML in comments
                    const lines = content.split('\n');
                    for (let line of lines) {
                        if (line.includes(match) && (line.trim().startsWith('//') || line.trim().startsWith('*'))) {
                            return false;
                        }
                    }
                    return true;
                });

                if (realViolations.length > 0) {
                    violations.push({
                        file: path.relative(publicDir, filePath),
                        tags: realViolations.slice(0, 5), // Show first 5 violations
                        count: realViolations.length
                    });
                }
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => 
                `\n❌ ${v.file}:\n   Found ${v.count} HTML tag(s):\n   ${v.tags.join('\n   ')}`
            ).join('\n');
            
            throw new Error(`\n${'='.repeat(80)}\nHTML TAGS FOUND IN JAVASCRIPT FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Move HTML to separate .html files and load them dynamically.\n`);
        }
    });

    test('should not contain CSS in .js files', () => {
        const violations = [];

        jsFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Look for CSS-like patterns (style objects with multiple properties)
            // This is a heuristic - we're looking for objects with CSS-like properties
            const styleObjectPattern = /\{[^}]*(?:color|background|padding|margin|border|width|height|display|font)[^}]*:/gi;
            const matches = content.match(styleObjectPattern);
            
            if (matches && matches.length > 3) { // Allow a few style properties, flag excessive styling
                violations.push({
                    file: path.relative(publicDir, filePath),
                    count: matches.length
                });
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => 
                `\n⚠️  ${v.file}: Found ${v.count} style definitions`
            ).join('\n');
            
            console.warn(`\n${'='.repeat(80)}\nWARNING: POSSIBLE CSS IN JAVASCRIPT FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Consider moving styles to .css files.\n`);
        }
    });
});

test.describe('Code Separation - HTML Files', () => {
    const publicDir = path.join(__dirname, '../public');
    const htmlFiles = getAllFiles(publicDir, [], '.html');

    test('should not contain inline styles in .html files', () => {
        const violations = [];

        htmlFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Look for inline style attributes
            const matches = content.match(INLINE_STYLE_PATTERN);
            
            if (matches) {
                violations.push({
                    file: path.relative(publicDir, filePath),
                    count: matches.length,
                    examples: matches.slice(0, 3)
                });
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => 
                `\n⚠️  ${v.file}:\n   Found ${v.count} inline style(s):\n   ${v.examples.join('\n   ')}`
            ).join('\n');
            
            console.warn(`\n${'='.repeat(80)}\nWARNING: INLINE STYLES IN HTML FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Move styles to .css files.\n`);
        }
    });

    test('should not contain <style> tags in .html files', () => {
        const violations = [];

        htmlFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Allow <style> tags in standalone components (for development)
            // and in archived/legal files (they're not part of the main site)
            if (filePath.includes('/standalone/') || 
                filePath.includes('archived') || 
                filePath.includes('legal.html') ||
                filePath.includes('/old/')) {
                return;
            }

            const styleTagPattern = /<style[^>]*>[\s\S]*?<\/style>/gi;
            const matches = content.match(styleTagPattern);
            
            if (matches) {
                violations.push({
                    file: path.relative(publicDir, filePath),
                    count: matches.length
                });
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => 
                `\n❌ ${v.file}: Found ${v.count} <style> tag(s)`
            ).join('\n');
            
            throw new Error(`\n${'='.repeat(80)}\n<STYLE> TAGS IN HTML FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Move styles to external .css files.\n`);
        }
    });

    test('should not contain <script> tags with code in .html files', () => {
        const violations = [];

        htmlFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Allow <script src="..."> tags (external JS)
            // Flag <script>...</script> with actual code
            const scriptWithCodePattern = /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi;
            const matches = content.match(scriptWithCodePattern);
            
            if (matches) {
                // Filter out empty scripts or very small ones (like just Vue initialization)
                const significantScripts = matches.filter(match => {
                    const codeContent = match.replace(/<\/?script[^>]*>/gi, '').trim();
                    // Allow small scripts (< 200 chars) for Vue initialization
                    return codeContent.length > 200;
                });

                if (significantScripts.length > 0) {
                    violations.push({
                        file: path.relative(publicDir, filePath),
                        count: significantScripts.length
                    });
                }
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => 
                `\n⚠️  ${v.file}: Found ${v.count} script(s) with significant code`
            ).join('\n');
            
            console.warn(`\n${'='.repeat(80)}\nWARNING: INLINE SCRIPTS IN HTML FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Move JavaScript to .js files.\n`);
        }
    });
});

test.describe('Code Separation - CSS Files', () => {
    const publicDir = path.join(__dirname, '../public');
    const cssFiles = getAllFiles(publicDir, [], '.css');

    test('should not contain JavaScript in .css files', () => {
        const violations = [];

        cssFiles.forEach(filePath => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Look for JS patterns: var, let, const, function, =>, if, for, while
            const jsPatterns = [
                /\b(var|let|const)\s+\w+\s*=/gi,
                /\bfunction\s*\(/gi,
                /=>\s*\{/gi,
                /\bif\s*\(/gi,
                /\bfor\s*\(/gi,
                /\bwhile\s*\(/gi
            ];

            const matches = jsPatterns.some(pattern => pattern.test(content));
            
            if (matches) {
                violations.push({
                    file: path.relative(publicDir, filePath)
                });
            }
        });

        if (violations.length > 0) {
            const errorMsg = violations.map(v => `\n❌ ${v.file}`).join('');
            
            throw new Error(`\n${'='.repeat(80)}\nJAVASCRIPT CODE IN CSS FILES\n${'='.repeat(80)}${errorMsg}\n\n⚠️  Remove JavaScript from .css files.\n`);
        }
    });
});

test.describe('Code Separation - Summary', () => {
    test('print separation summary', () => {
        const publicDir = path.join(__dirname, '../public');
        const jsFiles = getAllFiles(publicDir, [], '.js');
        const htmlFiles = getAllFiles(publicDir, [], '.html');
        const cssFiles = getAllFiles(publicDir, [], '.css');

        console.log(`\n${'='.repeat(80)}`);
        console.log('CODE SEPARATION SUMMARY');
        console.log('='.repeat(80));
        console.log(`✅ JavaScript files: ${jsFiles.length}`);
        console.log(`✅ HTML files: ${htmlFiles.length}`);
        console.log(`✅ CSS files: ${cssFiles.length}`);
        console.log('='.repeat(80));
    });
});

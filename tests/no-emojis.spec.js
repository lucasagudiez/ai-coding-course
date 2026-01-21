const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * NO EMOJIS ANYWHERE TEST
 * AI LLMs love adding emojis - we don't want them in production code
 */

const projectRoot = path.resolve(__dirname, '..');

// Get all relevant files
const getFiles = (dir, extensions, excludeDirs = []) => {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const res = path.resolve(dir, item.name);
        const relativePath = path.relative(projectRoot, res);

        if (excludeDirs.some(excludeDir => relativePath.startsWith(excludeDir))) {
            continue;
        }

        if (item.isDirectory()) {
            files = files.concat(getFiles(res, extensions, excludeDirs));
        } else if (extensions.includes(path.extname(item.name))) {
            files.push(res);
        }
    }
    return files;
};

// Emoji regex - detects all common emoji ranges
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/u;

test.describe('NO EMOJIS IN CODEBASE', () => {
    test('should not contain emojis in HTML files', () => {
        const htmlFiles = getFiles(projectRoot, ['.html'], [
            'node_modules',
            'test-results',
            'playwright-report',
            'public/old'
        ]);

        let violations = [];

        htmlFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (EMOJI_REGEX.test(line)) {
                    const lineNum = index + 1;
                    const preview = line.trim().substring(0, 80);
                    violations.push(`  ${path.relative(projectRoot, file)}:${lineNum}\n    ${preview}`);
                }
            });
        });

        if (violations.length > 0) {
            throw new Error(`\n${'='.repeat(80)}\n🚫 EMOJIS FOUND IN HTML FILES\n${'='.repeat(80)}\n${violations.join('\n\n')}\n\n⚠️  Remove all emojis from HTML files. Use text or icons instead.\n`);
        }
    });

    test('should not contain emojis in JavaScript files', () => {
        const jsFiles = getFiles(projectRoot, ['.js'], [
            'node_modules',
            'test-results',
            'playwright-report',
            'public/old',
            'public/js/ScrollTrigger.min.js',
            'public/js/gsap.min.js',
            'public/js/vanilla-tilt.min.js',
            'public/js/aos.js'
        ]);

        let violations = [];

        jsFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (EMOJI_REGEX.test(line)) {
                    const lineNum = index + 1;
                    const preview = line.trim().substring(0, 80);
                    violations.push(`  ${path.relative(projectRoot, file)}:${lineNum}\n    ${preview}`);
                }
            });
        });

        if (violations.length > 0) {
            throw new Error(`\n${'='.repeat(80)}\n🚫 EMOJIS FOUND IN JAVASCRIPT FILES\n${'='.repeat(80)}\n${violations.join('\n\n')}\n\n⚠️  Remove all emojis from JavaScript files. Use text descriptions instead.\n`);
        }
    });

    test('should not contain emojis in CSS files', () => {
        const cssFiles = getFiles(projectRoot, ['.css'], [
            'node_modules',
            'test-results',
            'playwright-report',
            'public/old'
        ]);

        let violations = [];

        cssFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (EMOJI_REGEX.test(line)) {
                    const lineNum = index + 1;
                    const preview = line.trim().substring(0, 80);
                    violations.push(`  ${path.relative(projectRoot, file)}:${lineNum}\n    ${preview}`);
                }
            });
        });

        if (violations.length > 0) {
            throw new Error(`\n${'='.repeat(80)}\n🚫 EMOJIS FOUND IN CSS FILES\n${'='.repeat(80)}\n${violations.join('\n\n')}\n\n⚠️  Remove all emojis from CSS files.\n`);
        }
    });

    test('should not contain emojis in Markdown files', () => {
        const mdFiles = getFiles(projectRoot, ['.md'], [
            'node_modules',
            'test-results',
            'playwright-report'
        ]);

        let violations = [];

        mdFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (EMOJI_REGEX.test(line)) {
                    const lineNum = index + 1;
                    const preview = line.trim().substring(0, 80);
                    violations.push(`  ${path.relative(projectRoot, file)}:${lineNum}\n    ${preview}`);
                }
            });
        });

        if (violations.length > 0) {
            console.warn(`\n${'='.repeat(80)}\n⚠️  WARNING: EMOJIS FOUND IN MARKDOWN FILES\n${'='.repeat(80)}\n${violations.join('\n\n')}\n\nMarkdown files can have emojis for documentation, but avoid overuse.\n`);
        }
    });
});

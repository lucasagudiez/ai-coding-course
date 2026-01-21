#!/usr/bin/env node

/**
 * Properly replace emojis with sensible text equivalents
 */

const fs = require('fs');
const path = require('path');

// Map emojis to proper replacements
const replacements = {
    // Checkmarks - replace with nothing (implied in context)
    '✓': '',
    '✔': '',
    '✅': '',
    
    // X marks - replace with "No" or nothing depending on context
    '❌': 'No',
    '✘': 'No',
    
    // Arrows - replace with proper arrow
    '→': '->',
    '➝': '->',
    
    // Others - remove entirely
    '🎉': '',
    '🔥': '',
    '🚫': '',
    '⚠️': '',
    '⚠': '',
    '📦': '',
    '🟡': '',
    '💡': '',
    '🎭': '',
    '🎯': '',
    '🚀': ''
};

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [emoji, replacement] of Object.entries(replacements)) {
        if (content.includes(emoji)) {
            content = content.replaceAll(emoji, replacement);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath.replace(__dirname + '/../', '')}`);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'test-results' && file !== '.git' && file !== 'old') {
                processDir(filePath);
            }
        } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
            replaceInFile(filePath);
        }
    }
}

console.log('Removing emojis from production code...\n');
processDir(path.join(__dirname, '../public'));
console.log('\nDone!');

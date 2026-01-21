#!/usr/bin/env node

/**
 * Remove all emojis from production code files
 */

const fs = require('fs');
const path = require('path');

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/gu;

const replacements = {
    '🎉': '', // Remove celebration emoji
    '✓': 'Yes', // Checkmark
    '✔': 'Yes',
    '❌': 'No',
    '✘': 'No',
    '🔥': 'SPECIAL',
    '🚫': 'ERROR',
    '⚠️': 'WARNING',
    '⚠': 'WARNING',
    '📦': '',
    '🟡': '-',
    '✅': 'OK',
    '': '' // Remove any other emojis
};

const files = [
    'public/application/index.html',
    'public/evaluation/index.html',
    'public/reservation/index.html',
    'public/index.html',
    'public/components/archived-application-elements.html',
    'public/components/templates/comparison-table.html',
    'public/application/css/styles.css',
    'public/css/application.css',
    'public/styles.css',
    'public/js/component-loader.js',
    'public/js/components.js'
];

console.log('Removing emojis from production code...\n');

files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${file} - NOT FOUND`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    // Replace known emojis with text equivalents
    for (const [emoji, replacement] of Object.entries(replacements)) {
        content = content.replaceAll(emoji, replacement);
    }
    
    // Remove any remaining emojis
    content = content.replace(EMOJI_REGEX, '');
    
    const changes = originalLength - content.length;
    if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${file} - removed ${changes} chars`);
    } else {
        console.log(`  ${file} - clean`);
    }
});

console.log('\n✓ All emojis removed from production code!');

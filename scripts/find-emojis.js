#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Much broader emoji detection
const EMOJI_PATTERN = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;

function findEmojis(dir, extensions) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'test-results' && file !== '.git') {
                results = results.concat(findEmojis(filePath, extensions));
            }
        } else if (extensions.some(ext => file.endsWith(ext))) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(EMOJI_PATTERN);
            if (matches && matches.length > 0) {
                results.push({ file: filePath, emojis: [...new Set(matches)] });
            }
        }
    }
    
    return results;
}

const projectRoot = path.join(__dirname, '..');
const results = findEmojis(path.join(projectRoot, 'public'), ['.js', '.html', '.css']);
const testResults = findEmojis(path.join(projectRoot, 'tests'), ['.js']);

console.log('FILES WITH EMOJIS:\n');
[...results, ...testResults].forEach(r => {
    console.log(`${r.file.replace(projectRoot, '.')}`);
    console.log(`  Emojis: ${r.emojis.join(', ')}`);
});

console.log(`\nTotal: ${results.length + testResults.length} files with emojis`);

const fs = require('fs');
const path = require('path');

const replacements = [
    { search: /https:\/\/github\.com\/SanketsMane\/kidokoolsfu/g, replace: 'https://github.com/SanketsMane/Online-Meet-Platform.git' },
    { search: /SanketsMane\/kidokoolsfu/g, replace: 'SanketsMane/Online-Meet-Platform' },
    { search: /https:\/\/github\.com\/SanketsMane/g, replace: 'https://github.com/SanketsMane' },
    { search: /https:\/\/codecanyon\.net\/user\/SanketsMane/g, replace: 'mailto:sanketmane7170@gmail.com' },
    { search: /SanketsMane/g, replace: 'SanketsMane' }
];

const excludeDirs = ['node_modules', '.git', '.system_generated'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                results = results.concat(walk(filePath));
            }
        } else {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(file => {
    try {
        const ext = path.extname(file).toLowerCase();
        if (['.exe', '.dll', '.so', '.dylib', '.sqlite', '.db', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.pdf'].includes(ext)) {
            return;
        }

        const buffer = fs.readFileSync(file);
        let nullCount = 0;
        for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
            if (buffer[i] === 0) nullCount++;
        }
        if (nullCount > 10) return; 

        let content = buffer.toString('utf8');
        let changed = false;

        replacements.forEach(r => {
            if (r.search.test(content)) {
                content = content.replace(r.search, r.replace);
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated: ${file}`);
        }
    } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
    }
});

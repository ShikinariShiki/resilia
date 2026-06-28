const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const dataFile = path.join(__dirname, 'toolkit-data.json');
const locales = ['en.js', 'id.js', 'ms.js', 'tl.js', 'th.js', 'vi.js', 'km.js', 'lo.js', 'my.js'];

const translations = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

for (const file of locales) {
    const lang = file.replace('.js', '');
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const t = translations[lang];
    if (!t) {
        console.log("No translations for", lang);
        continue;
    }

    if (content.includes('landing: {')) {
        const injection = `toolkit: ${JSON.stringify(t, null, 8).replace(/\\n/g, '')},\n    landing: {`;
        content = content.replace('landing: {', injection);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Patched toolkit data for", file);
    } else {
        console.log("Could not find insertion point in", file);
    }
}

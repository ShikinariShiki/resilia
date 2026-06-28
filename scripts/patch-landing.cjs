const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const dataFile = path.join(__dirname, 'landing-data.json');
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

    // Find the end of the `landing:` object.
    // A safe hack: replace `        steps: {` with the new data injected just before it.
    if (content.includes('steps: {')) {
        const injection = `
        navWhy: ${JSON.stringify(t.navWhy)},
        navHow: ${JSON.stringify(t.navHow)},
        videoLabel: ${JSON.stringify(t.videoLabel)},
        subtitleWhy: ${JSON.stringify(t.subtitleWhy)},
        subtitleHow: ${JSON.stringify(t.subtitleHow)},
        subtitleProgression: ${JSON.stringify(t.subtitleProgression)},
        xpRequired: ${JSON.stringify(t.xpRequired)},
        subtitleTestimonials: ${JSON.stringify(t.subtitleTestimonials)},
        subtitleFaq: ${JSON.stringify(t.subtitleFaq)},
        subtitleReady: ${JSON.stringify(t.subtitleReady)},
        freeForever: ${JSON.stringify(t.freeForever)},
        footerTagline: ${JSON.stringify(t.footerTagline)},
        tiers: ${JSON.stringify(t.tiers, null, 12).replace(/\\n/g, '')},
        testimonials: ${JSON.stringify(t.testimonials, null, 12).replace(/\\n/g, '')},
        faqs: ${JSON.stringify(t.faqs, null, 12).replace(/\\n/g, '')},
        steps: {`;

        content = content.replace('steps: {', injection.trimLeft());
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Patched landing data for", file);
    } else {
        console.log("Could not find insertion point in", file);
    }
}

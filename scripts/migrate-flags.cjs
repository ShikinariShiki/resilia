const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

// 1. Update resiliaStore.js
const storePath = path.join(__dirname, '../src/stores/resiliaStore.js');
let storeContent = fs.readFileSync(storePath, 'utf-8');
// Replace flags in regionData and onboardingCountries
storeContent = storeContent.replace(/flag:\s*'([^']+)'/g, (match, emoji) => {
  const map = {
    '🇮🇩': 'id', '🇵🇭': 'ph', '🇻🇳': 'vn', '🇹🇭': 'th', '🇲🇾': 'my',
    '🇲🇲': 'mm', '🇰🇭': 'kh', '🇱🇦': 'la', '🇸🇬': 'sg', '🇧🇳': 'bn'
  };
  return `flag: 'https://flagcdn.com/w40/${map[emoji] || 'un'}.png'`;
});
fs.writeFileSync(storePath, storeContent, 'utf-8');

// 2. Update Landing.vue (availableLangs)
const landingPath = path.join(__dirname, '../src/views/Landing.vue');
let landingContent = fs.readFileSync(landingPath, 'utf-8');
landingContent = landingContent.replace(/flag:\s*'([^']+)'/g, (match, emoji) => {
  const map = {
    '🇬🇧': 'gb', '🇮🇩': 'id', '🇹🇭': 'th', '🇻🇳': 'vn', '🇲🇾': 'my',
    '🇵🇭': 'ph', '🇲🇲': 'mm', '🇰🇭': 'kh', '🇱🇦': 'la'
  };
  return `flag: 'https://flagcdn.com/w40/${map[emoji] || 'un'}.png'`;
});
landingContent = landingContent.replace(/\|\| '🌏'/g, `|| 'https://flagcdn.com/w40/un.png'`);
fs.writeFileSync(landingPath, landingContent, 'utf-8');

// 3. Update Vue templates (replace text interpolations with img tags)
walkDir(path.join(__dirname, '../src'), (filePath) => {
  if (filePath.endsWith('.vue')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Handle standard cases like <span class="text-xl">{{ c.flag }}</span> -> <img :src="c.flag" class="w-6 h-4 object-cover" />
    content = content.replace(/<([a-z]+)[^>]*>\s*\{\{\s*([a-zA-Z0-9_?.]+flag)\s*\}\}\s*<\/\1>/g, (match, tag, variable) => {
      return `<img :src="${variable}" class="w-6 h-auto inline-block rounded-sm shadow-sm" alt="Flag" />`;
    });

    // Handle combinations like {{ c.flag }} {{ c.name }} inside <option> -> just {{ c.name }}
    content = content.replace(/<option([^>]*)>\s*\{\{\s*c\.flag\s*\}\}\s*\{\{\s*c\.name\s*\}\}\s*<\/option>/g, '<option$1>{{ c.name }}</option>');

    // Handle special computed properties combining flag and name in JS logic.
    // E.g., return r ? `${r.flag} ${r.country}` : code -> return r ? r.country : code
    content = content.replace(/`\$\{([^\}]+flag)\}\s+\$\{([^\}]+country)\}`/g, '`\\${$2}`');
    content = content.replace(/`\$\{([^\}]+flag)\}\s+\$\{([^\}]+name)\}`/g, '`\\${$2}`');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated flags in ${filePath}`);
    }
  }
});

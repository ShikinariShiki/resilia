const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let count = 0;
walkDir(path.join(__dirname, '../src'), (filePath) => {
  if (filePath.endsWith('.vue')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Remove legacy CSS definitions
    content = content.replace(/\.animate-slide-up\s*\{[^}]+\}/g, '');
    content = content.replace(/@keyframes\s+slide-up\s*\{[\s\S]*?\}/g, '');

    // Replace class="... animate-slide-up ..." with v-motion class="..."
    const regex = /class="([^"]*)animate-slide-up\s*([^"]*)"/g;
    content = content.replace(regex, (match, p1, p2) => {
      const newClass = (p1 + p2).trim();
      if (newClass) {
         return `v-motion class="${newClass}"`;
      }
      return `v-motion`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      count++;
    }
  }
});

console.log(`Migration complete. Updated ${count} Vue files to use GSAP v-motion.`);

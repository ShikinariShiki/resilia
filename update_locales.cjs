const fs = require('fs');
const path = require('path');
const dir = 'src/locales';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'placeholder.js');

const walletObj = `
    wallet: {
        rc: 'ResiCoins',
        lifetimeearned: 'Lifetime Earned',
        communityfund: 'Community Fund',
        sponsorText: 'Sponsor a responder\\'s training.',
        btnContribute: 'Contribute',
        perk1: 'Help others access modules',
        perk2: 'Earn the Philanthropist badge',
        perk3: 'Boost regional resilience',
        bannerTitle: 'Need a Boost?',
        bannerDesc: 'Use your ResiCoins to unlock premium soothing exercises and profile cosmetics.',
        btnOpenToolkit: 'Open Toolkit',
        catAll: 'All',
        catBooster: 'Boosters',
        catCosmetic: 'Cosmetics',
        catCommunity: 'Community',
        catContent: 'Content',
        guildShop: 'Guild Shop'
    }
`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('wallet: {')) {
    console.log(file + ' already has wallet');
    continue;
  }
  
  const lastBraceIndex = content.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    const before = content.substring(0, lastBraceIndex).trimEnd();
    const comma = before.endsWith(',') ? '' : ',';
    const newContent = before + comma + '\n' + walletObj + '\n' + content.substring(lastBraceIndex);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Updated ' + file);
  }
}

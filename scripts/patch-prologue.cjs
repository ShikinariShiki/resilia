const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const locales = ['ms.js', 'tl.js', 'th.js', 'vi.js', 'km.js', 'lo.js', 'my.js'];

const prologueData = {
        msg1: 'Heyy! 🙋‍♀️',
        msg2: 'Are you taking Psychology too? I saw your name in the group chat!',
        msg3: 'I\'m Lia btw. Just arrived from Malang. This campus is HUGE 😳',
        q1: 'How do you respond?',
        q1_a: 'Hey Lia! Yeah I\'m new too. This place is wild haha',
        q1_b: 'Sup. Yeah Psychology. Where\'s Room 204?',
        q1_c: 'Do I know you? 🤨',
        r_friendly: 'hehe glad I\'m not the only lost one 😅',
        r_neutral: 'Room 204 is upstairs I think! Let\'s find it together?',
        r_cold: '...oh. okay sorry lol. I just thought we could be friends 🥲',
        msg4: 'Soo the dean just talked about their disaster preparedness program. Did you hear that part?',
        msg5: 'Indonesia has had over 3,000 disasters JUST last year 🤯',
        msg6: 'I want to travel all of ASEAN after graduating. Philippines, Thailand, Vietnam... everywhere ✨',
        msg7: 'But my mom says it\'s too dangerous 😕',
        q2: 'What\'s your take?',
        q2_a: 'Your mom has a point, but preparation is the best protection. Maybe this program will help you convince her!',
        q2_b: 'ASEAN travel sounds amazing! Let\'s join the disaster prep program together 🙌',
        q2_c: 'That sounds expensive tbh',
        r_supportive: 'You\'re right... being prepared is the opposite of being scared. It\'s being SMART 🧠',
        r_enthusiastic: 'YES!! Omg let\'s do it!! 🎉',
        r_dismissive: '...I mean money is one thing but knowledge is free right? 😅',
        msg8: 'Okay real talk tho, before we dive in, I wanna know more about you!',
        q3: 'Why are you interested in disaster response?',
        q3_a: 'I\'ve experienced a disaster before',
        q3_b: 'I want to help my community',
        q3_c: 'I\'m just curious honestly',
        q3_d: 'School assignment brought me here lol',
        r_experienced: 'Wow. That must have been really intense. I think that experience will make you an incredible responder 💪',
        r_community: 'That\'s such a beautiful motivation. The world needs more people like you 🌍',
        r_curious: 'Hey curiosity is the first step to everything! Einstein was curious too 😄',
        r_assignment: 'Haha at least you\'re honest! But I bet you\'ll be hooked after the first chapter 😏',
        q4: 'How do you feel about learning new things right now?',
        q4_a: 'Energized and ready! 💪',
        q4_b: 'A bit nervous but willing to try',
        q4_c: 'Honestly kinda tired today',
        q4_d: 'I just wanna get started already',
        r_energized: 'Love that energy!! Let\'s channel it 🔥',
        r_nervous: 'That\'s totally normal. We\'ll go at YOUR pace, no rush 💚',
        r_tired: 'No worries! Take it easy. You can always come back when you\'re feeling fresh ☕',
        r_impatient: 'I like your style! Straight to the point haha 😂',
        msg9: 'Okay I think that\'s enough interrogation for one day 😄',
        msg10: 'I have a good feeling about this, {Name}. See you in Chapter 1! 🌟',
        msg11: 'Oh wait, one more thing. I always carry this with me...',
        msg12: '*sends a photo of a crumpled ASEAN map covered in stars* ⭐',
        msg13: 'Each star is a place I want to visit. One day, I\'ll put a pin on every one. Let\'s make that happen together 🗺️✨'
};

for (const file of locales) {
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('landing: {')) {
        const injection = `prologue: ${JSON.stringify(prologueData, null, 8).replace(/\\n/g, '')},\n    landing: {`;
        content = content.replace('landing: {', injection);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Patched prologue data for", file);
    }
}

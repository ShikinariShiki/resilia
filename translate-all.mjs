import fs from 'fs';
import path from 'path';
import { translate } from '@vitalets/google-translate-api';
import en from './src/locales/en.js';

const targetLanguages = ['id', 'th', 'vi', 'ms', 'tl', 'my', 'km', 'lo'];

async function translateObject(obj, targetLang) {
    const result = {};
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = await translateObject(obj[key], targetLang);
        } else if (typeof obj[key] === 'string' && obj[key].trim() !== '') {
            // Check if string contains variables like {name}
            const hasVars = obj[key].match(/\{[^}]+\}/g);
            let textToTranslate = obj[key];

            // Temporary replace vars with placeholders that translate API won't mangle
            const varMap = {};
            if (hasVars) {
                hasVars.forEach((v, i) => {
                    const placeholder = `__VAR${i}__`;
                    varMap[placeholder] = v;
                    textToTranslate = textToTranslate.replace(v, placeholder);
                });
            }

            try {
                const res = await translate(textToTranslate, { to: targetLang });
                let translatedText = res.text;

                // Restore vars
                if (hasVars) {
                    Object.keys(varMap).forEach(placeholder => {
                        translatedText = translatedText.replace(new RegExp(placeholder, 'g'), varMap[placeholder]);
                    });
                }

                result[key] = translatedText;
                console.log(`[${targetLang}] Translating... -> ${translatedText.substring(0, 30)}...`);
            } catch (err) {
                console.error(`Error translating [${textToTranslate}] to ${targetLang}. Using English fallback.`);
                result[key] = obj[key]; // fallback to english
            }
        }
    }
    return result;
}

async function run() {
    for (const lang of targetLanguages) {
        console.log(`\nStarting translation for: ${lang}`);
        const translatedObj = await translateObject(en, lang);

        const fileContent = `export default ${JSON.stringify(translatedObj, null, 4)};\n`;
        fs.writeFileSync(path.join('./src/locales', `${lang}.js`), fileContent);
        console.log(`✅ Saved ${lang}.js`);
    }
}

run().catch(console.error);

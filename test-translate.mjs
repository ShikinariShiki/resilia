import { translate } from '@vitalets/google-translate-api';

async function test() {
    try {
        const res = await translate('Hello, how are you?', { to: 'th' });
        console.log('Thai:', res.text);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();

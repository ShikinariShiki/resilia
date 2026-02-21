import { ref, inject } from 'vue'
import en from './locales/en'
import id from './locales/id'
import th from './locales/th'
import vi from './locales/vi'
import ms from './locales/ms'
import tl from './locales/tl'
import my from './locales/my'
import km from './locales/km'
import lo from './locales/lo'

const messages = { en, id, th, vi, ms, tl, my, km, lo }

export function createI18n(initialLocale = 'en') {
    const locale = ref(initialLocale)

    const t = (key) => {
        const keys = key.split('.')
        // Try current locale first, then fallback to English
        let text = messages[locale.value]
        for (const k of keys) {
            if (text && text[k]) {
                text = text[k]
            } else {
                // Fallback to English
                let fallback = messages.en
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk]
                    } else {
                        return key
                    }
                }
                return fallback
            }
        }
        return text
    }

    // Simple string interpolation for arguments like {name}
    const tWithArgs = (key, args) => {
        let text = t(key)
        if (!args) return text

        Object.keys(args).forEach(arg => {
            text = text.replace(`{${arg}}`, args[arg])
        })
        return text
    }

    return {
        install(app) {
            app.provide('i18n', { locale, t: tWithArgs })
            app.config.globalProperties.$t = tWithArgs
        },
        global: { locale, t: tWithArgs }
    }
}

export function useI18n() {
    const i18n = inject('i18n')
    return i18n
}

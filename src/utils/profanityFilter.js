/**
 * Profanity / inappropriate word filter for RESILIA
 * Covers common English + Bahasa Indonesia inappropriate words.
 * Used in AuthPage name validation and Onboarding name step.
 */

const BLOCKED_WORDS = [
    // English
    'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard', 'damn', 'dick',
    'cunt', 'cock', 'piss', 'slut', 'whore', 'nigger', 'nigga', 'faggot',
    'retard', 'moron', 'idiot', 'stupid', 'dumb', 'kill', 'die', 'murder',
    'rape', 'porn', 'sex', 'nude', 'naked', 'penis', 'vagina', 'boob',
    'tit', 'wank', 'jerk', 'crap', 'hell', 'bloody', 'bugger', 'twat',
    // Bahasa Indonesia
    'anjing', 'bangsat', 'babi', 'kontol', 'memek', 'ngentot', 'pepek',
    'tolol', 'goblok', 'bodoh', 'kampret', 'brengsek', 'sialan', 'bajingan',
    'keparat', 'setan', 'asu', 'jancok', 'cok', 'pantek', 'kimak',
    'tai', 'tahi', 'pelacur', 'sundal', 'lonte',
]

/**
 * Check if the given text contains profanity or inappropriate words.
 * Uses word-boundary matching after normalizing the input.
 * @param {string} text
 * @returns {{ hasProfanity: boolean, matchedWord: string|null }}
 */
export function containsProfanity(text) {
    if (!text || typeof text !== 'string') return { hasProfanity: false, matchedWord: null }

    const normalized = text.toLowerCase().replace(/[^a-z\s]/g, '')
    const words = normalized.split(/\s+/)

    for (const word of words) {
        if (BLOCKED_WORDS.includes(word)) {
            return { hasProfanity: true, matchedWord: word }
        }
    }

    // Also check substring matches for attempts to hide words inside names
    for (const blocked of BLOCKED_WORDS) {
        if (blocked.length >= 4 && normalized.includes(blocked)) {
            return { hasProfanity: true, matchedWord: blocked }
        }
    }

    return { hasProfanity: false, matchedWord: null }
}

/**
 * Validate a display name for RESILIA.
 * Returns an error message string or null if valid.
 * @param {string} name
 * @returns {string|null}
 */
export function validateDisplayName(name) {
    if (!name || !name.trim()) return 'Name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (name.trim().length > 30) return 'Name must be 30 characters or less'

    const { hasProfanity } = containsProfanity(name)
    if (hasProfanity) return 'This name contains inappropriate content. Please choose another.'

    return null
}

/**
 * HTML sanitizer for chat content rendered via v-html.
 *
 * PRODUCTION NOTE: on a networked build, replace the body of sanitizeHtml with
 * DOMPurify, keeping this same export surface so callers do not change:
 *
 *   import DOMPurify from 'dompurify'
 *   export function sanitizeHtml(dirty) {
 *     return DOMPurify.sanitize(String(dirty ?? ''), {
 *       ALLOWED_TAGS: ['b','i','em','strong','br','u','span','p'],
 *       ALLOWED_ATTR: [],
 *     })
 *   }
 *
 * This file ships a hardened, dependency-free tokenizing fallback because the
 * build sandbox has no network to install DOMPurify. It is stricter than the
 * previous single-pass regex: it decodes entities first to defeat obfuscation,
 * removes comments and script/style/svg/math blocks with their content, drops
 * every attribute, and keeps only an inline allowlist.
 */

const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'br', 'u', 'span', 'p'])
const BLOCK_WITH_CONTENT = ['script', 'style', 'svg', 'math', 'iframe', 'object', 'embed', 'template', 'noscript']

/** Escapes raw text to safe HTML entities. */
export function escapeHtml(str) {
    return String(str == null ? '' : str)
        .split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;')
        .split('"').join('&quot;')
        .split("'").join('&#39;')
}

// Decode a small set of HTML entities so obfuscated payloads cannot smuggle
// markup past the tokenizer (for example &#60;script&#62;).
function decodeEntities(s) {
    return s
        .replace(/&#x([0-9a-f]+);?/gi, (_, h) => safeFromCode(parseInt(h, 16)))
        .replace(/&#(\d+);?/g, (_, d) => safeFromCode(parseInt(d, 10)))
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&amp;/gi, '&')
}

function safeFromCode(n) {
    if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return ''
    try { return String.fromCodePoint(n) } catch { return '' }
}

/**
 * Sanitizes a limited-HTML string, keeping only an allowlist of inline tags
 * and dropping all attributes. Safe to use with v-html.
 */
export function sanitizeHtml(dirty) {
    if (dirty == null) return ''
    let input = decodeEntities(String(dirty))

    // Remove HTML comments (can hide conditional-comment script vectors).
    input = input.replace(/<!--[\s\S]*?-->/g, '')

    // Remove dangerous blocks together with their content.
    for (const tag of BLOCK_WITH_CONTENT) {
        const re = new RegExp('<\\s*' + tag + '[^>]*>[\\s\\S]*?<\\s*\\/\\s*' + tag + '\\s*>', 'gi')
        input = input.replace(re, '')
        // Also drop a lone unclosed opener of these tags.
        const openRe = new RegExp('<\\s*\\/?\\s*' + tag + '[^>]*>', 'gi')
        input = input.replace(openRe, '')
    }

    // Walk every remaining tag, keep only allowlisted names, strip all attributes.
    let out = input.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?>/g, (match, slash, name) => {
        const tag = name.toLowerCase()
        if (!ALLOWED_TAGS.has(tag)) return ''
        if (tag === 'br') return '<br>'
        return slash ? '<\/' + tag + '>' : '<' + tag + '>'
    })

    // Drop any stray angle brackets that were not valid tags.
    out = out.replace(/<(?![a-zA-Z\/])/g, '&lt;')

    // Neutralize any leftover dangerous URL schemes in text.
    out = out.replace(/javascript:/gi, '').replace(/vbscript:/gi, '').replace(/data:/gi, '')

    return out
}

export default sanitizeHtml

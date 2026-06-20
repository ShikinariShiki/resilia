/**
 * Minimal HTML sanitizer for chat content rendered via v-html.
 * Allows only a small set of inline formatting tags and strips everything else,
 * including <script>, event-handler attributes, and javascript: URLs.
 * This prevents stored/reflected XSS through chat message rendering.
 */

const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'br', 'u', 'span', 'p'])

/**
 * Escapes raw text to safe HTML entities.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    return String(str == null ? '' : str)
        .split('&').join('&amp;')
        .split('<').join('&lt;')
        .split('>').join('&gt;')
        .split('"').join('&quot;')
        .split("'").join('&#39;')
}

/**
 * Sanitizes a limited-HTML string, keeping only an allowlist of inline tags
 * and dropping all attributes. Safe to use with v-html.
 * @param {string} dirty
 * @returns {string}
 */
export function sanitizeHtml(dirty) {
    if (dirty == null) return ''
    const input = String(dirty)
    // Remove script/style blocks entirely (with their content).
    let out = input.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    // Walk every tag; keep only allowlisted tags, drop all attributes.
    out = out.replace(/<\s*\/?\s*([a-zA-Z0-9]+)([^>]*)>/g, (match, tag) => {
        const name = tag.toLowerCase()
        if (!ALLOWED_TAGS.has(name)) return ''
        const closing = /^<\s*\//.test(match) ? '/' : ''
        if (name === 'br') return '<br>'
        return '<' + closing + name + '>'
    })
    // Strip any leftover javascript:/data: protocols just in case.
    out = out.replace(/javascript:/gi, '').replace(/data:/gi, '')
    return out
}

export default sanitizeHtml

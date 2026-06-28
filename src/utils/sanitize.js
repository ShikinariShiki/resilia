/**
 * HTML sanitizer for chat content rendered via v-html.
 *
 * Uses DOMPurify with a strict allowlist. Only inline formatting tags are
 * permitted and all attributes are stripped. This replaces the earlier
 * dependency-free tokenizing fallback that shipped while the build sandbox
 * had no network.
 */

import DOMPurify from 'dompurify'

/** Escapes raw text to safe HTML entities. */
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
 */
export function sanitizeHtml(dirty) {
    if (dirty == null) return ''
    return DOMPurify.sanitize(String(dirty), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'u', 'span', 'p'],
        ALLOWED_ATTR: [],
    })
}

export default sanitizeHtml

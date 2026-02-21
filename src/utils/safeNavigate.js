/**
 * Safe navigation utility — validates redirect targets against an allowlist
 * before navigating. Prevents open redirect vulnerabilities.
 */

const ALLOWED_PATHS = [
    '/',
    '/auth',
    '/onboarding',
    '/journal',
    '/soothing',
    '/home',
    '/academy',
    '/wallet',
    '/dashboard',
    '/daily',
    '/profile',
    '/toolkit',
    '/terms',
    '/privacy',
]

const ALLOWED_PREFIXES = [
    '/academy/lesson/',
    '/academy/rpg/',
    '/academy/test/',
    '/academy/disaster-rpg/',
    '/academy/story-rpg/',
    '/academy/lia/',
    '/academy/chapter/',
    '/academy/quest/',
    '/academy/bridging/',
    '/academy/foundations/',
    '/academy/erq/',
    '/academy/sim/',
]

/**
 * Checks whether a path string is a known, safe internal route.
 * @param {string} path — the path to validate
 * @returns {boolean}
 */
export function isAllowedRoute(path) {
    if (typeof path !== 'string') return false

    // Strip any protocol / host to prevent http://evil.com tricks
    try {
        const url = new URL(path, 'http://localhost')
        // If the origin doesn't match our dummy base, it's an absolute external URL
        if (url.origin !== 'http://localhost') return false
        path = url.pathname
    } catch {
        // not a valid URL — could be a relative path, continue validation
    }

    // Block paths that try to escape (e.g. //evil.com, javascript:, data:)
    if (/^\/\/|^javascript:|^data:/i.test(path)) return false

    // Exact match
    if (ALLOWED_PATHS.includes(path)) return true

    // Prefix match (for parametric routes)
    return ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix))
}

/**
 * Safely push to a route. Falls back to /home if the target is not on the allowlist.
 * @param {import('vue-router').Router} router
 * @param {string} path
 */
export function safeNavigate(router, path) {
    if (isAllowedRoute(path)) {
        router.push(path)
    } else {
        console.warn(`[safeNavigate] Blocked redirect to disallowed path: ${path}`)
        router.push('/home')
    }
}

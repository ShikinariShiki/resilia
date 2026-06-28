// i18n key parity check. Fails the build when any locale is missing a key that
// exists in English, so a locale can never silently fall back mid-page.
// Usage: node scripts/i18n-parity.mjs

import en from '../src/locales/en.js'
import id from '../src/locales/id.js'
import th from '../src/locales/th.js'
import vi from '../src/locales/vi.js'
import ms from '../src/locales/ms.js'
import tl from '../src/locales/tl.js'
import my from '../src/locales/my.js'
import km from '../src/locales/km.js'
import lo from '../src/locales/lo.js'

const locales = { id, th, vi, ms, tl, my, km, lo }

function flatten(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? prefix + '.' + k : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out)
    else out.push(key)
  }
  return out
}

const enKeys = new Set(flatten(en))
let failed = false

for (const [name, loc] of Object.entries(locales)) {
  const keys = new Set(flatten(loc))
  const missing = [...enKeys].filter((k) => !keys.has(k))
  const extra = [...keys].filter((k) => !enKeys.has(k))
  if (missing.length || extra.length) {
    failed = true
    console.error('\n[' + name + '] missing ' + missing.length + ', extra ' + extra.length)
    if (missing.length) console.error('  missing: ' + missing.slice(0, 40).join(', '))
    if (extra.length) console.error('  extra: ' + extra.slice(0, 40).join(', '))
  } else {
    console.log('[' + name + '] ok, ' + keys.size + ' keys')
  }
}

if (failed) {
  console.error('\ni18n parity check failed')
  process.exit(1)
}
console.log('\ni18n parity check passed')

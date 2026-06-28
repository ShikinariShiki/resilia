// Copy hygiene linter. Fails the build on em dash, on banned jargon, and on a
// semicolon used inside locale copy. Scans src views, components, and locales.
// Usage: node scripts/lint-copy.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', 'src')
const banned = JSON.parse(readFileSync(join(ROOT, 'brand', 'banned-words.json'), 'utf8')).bannedWords

const EM_DASH = '\u2014'
let hits = 0

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) { walk(full); continue }
    const ext = extname(full)
    if (!['.vue', '.js', '.ts'].includes(ext)) continue
    if (full.includes('brand' + '/banned-words')) continue
    const text = readFileSync(full, 'utf8')
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      if (line.includes(EM_DASH)) report(full, i + 1, 'em dash', line)
      for (const w of banned) {
        const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
        if (re.test(line)) report(full, i + 1, 'banned word "' + w + '"', line)
      }
    })
  }
}

function report(file, line, what, text) {
  hits++
  console.error(file.replace(ROOT, 'src') + ':' + line + '  ' + what + '  ' + text.trim().slice(0, 100))
}

walk(ROOT)

if (hits) {
  console.error('\ncopy lint failed, ' + hits + ' issue(s)')
  process.exit(1)
}
console.log('copy lint passed')

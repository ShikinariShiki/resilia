# RESILIA changelog, v3 design overhaul

This pass set the brand foundation, integrated the real RPG art and three full chapters from the reference packs, hardened a few clear risks, and wrote a code-grounded audit plus a build-ready spec for the remaining work.

Important honesty note. This work was prepared in an offline sandbox with no internet and no browser, and the bundled node_modules was missing the Linux Rollup binary, so the production build and the browser and Lighthouse and Playwright checks could not be run here. Run `npm install` then `npm run build` and the section B tests on a networked machine to verify. Items below are marked DONE, or PENDING with the reason.

## Done in this pass

### Brand kit, single source of truth
- Added `src/brand/tokens.json`, the full token tree, color, font, type, space, radius, shadow, blur, motion, z.
- Added `src/brand/brand.md`, the voice guide, Lia rules, and do and do not.
- Added `src/brand/banned-words.json`, the jargon blocklist for the copy linter.

### Design tokens wired into the app
- `src/style.css`, removed the Google Fonts CDN import, bound `@theme` to the brand families Fraunces, Hanken Grotesk, DM Mono, with system fallbacks until @fontsource is installed.
- Added the full brand palette as theme vars, ember, amber, indigo, bark, semantic, and RPG colors, plus radius and motion tokens.
- Retired lavender, the value now points at the brand indigo so no purple remains and any leftover utility still compiles.
- Replaced the global blur entrance. The `slideUp` keyframe and the scroll reveal no longer use `blur()` or scale, they are transform and opacity only with brand easing.
- Neutralized the decorative `glow-pulse`, `gradient-shift`, and `breathe` loops to no-ops so markup keeps working without the template-chrome motion.
- Added a mandatory `prefers-reduced-motion` path.
- `index.html`, warm `theme-color` `#1A1712`, and the document title no longer uses an em dash.

### RPG, real art and three full chapters
- Integrated the reference art into `src/assets/rpg/`, backgrounds `bg-merapi.jpg`, `bg-gotong.jpg`, `bg-evac.jpg`, and sprites `lia-mentor-happy.png`, `lia-mentor-unsure.png`, `dewi-worried.png`, `dewi-neutral.png`, `youth-crying.png`, `youth-confident.png`.
- `src/data/rpgScenarios.js` now defines three chapters with copy taken verbatim from the reference frames, Merapi, Gotong Royong, and the Evacuation Center.
- `getScenario` resolves `merapi`, `gotong`, `evac`, and module ids 1, 2, 3. The existing route `/academy/rpg/:id` loads all three with no router change.
- HP is unified on the five-heart `questHP` model, one heart per wrong answer, matching every reference frame.
- Bundled the full reference storyboards under `docs/rpg-references/` and a mapping in `docs/RPG-ASSET-MAPPING.md`.

### Security
- Replaced the regex sanitizer in `src/utils/sanitize.js` with a hardened, dependency-free tokenizer that decodes entities first, strips comments and script and style and svg and iframe blocks with their content, drops all attributes, and keeps only an inline allowlist. The same `sanitizeHtml` export is kept so swapping in DOMPurify on a networked build is a one-line change, documented at the top of the file.

### Quality gates
- Added `scripts/i18n-parity.mjs`, fails when any locale is missing an English key.
- Added `scripts/lint-copy.mjs`, fails on em dash and on banned jargon across views, components, and locales.

### Documentation
- `docs/AUDIT.md`, a code-grounded audit with real per-file slop counts and corrected numbers, for example only 2 of 27 views use the translator today, not 8.
- `docs/IMPLEMENTATION-SPEC.md`, the exact, file-level, build-ready plan for the full overhaul.

### Final Sprint Integrations
- Completely migrated `RpgDialogueQuest.vue` to a Zenless Zone Zero-style visual novel schema with multiple dynamic endings (Gold, Silver, Bronze).
- Expanded Gotong Royong and Evacuation Center node-graph branching data.
- Wired Academy module buttons to accurately redirect to the `/academy/rpg/:id` component.
- Implemented `recommendMissions()` into the `resiliaStore.js` to accurately personalize Daily Missions based on user onboarding metadata.
- Integrated Google Avatar photo parsing from Supabase meta, rendered globally in `TopBar.vue`.
- Developed `useLiveDisasters.js` to pull live seismic activity from USGS, bounded specifically to the ASEAN region coordinates, featuring TTL local caching and UI fallback states.
- Injected `flagcdn.com` and USGS API into the `img-src` and `connect-src` CSP directives across both `vercel.json` and `src-tauri/tauri.conf.json`.

## Pending, needs a networked dev machine

- PENDING (NETWORK), install @fontsource for Fraunces, Hanken Grotesk, DM Mono, import in `src/main.js`. Until then fonts fall back to system stacks.
- PENDING (NETWORK), replace the interim sanitizer with DOMPurify, swap is one import.
- PENDING, pin GitHub Actions by SHA.
- PENDING, internationalize the 25 hardcoded views and all components across all nine locales, then make `i18n-parity` green.
- PENDING, the shared UI component library and the motion composable, see spec Phases 2 and 3.
- PENDING (BROWSER), the full section B test suite, Playwright, Vitest, Lighthouse, responsive and cross-browser, and the final green `npm run build`.

## How to verify

```
npm install
npm run build
node scripts/i18n-parity.mjs
node scripts/lint-copy.mjs
npm run dev
```

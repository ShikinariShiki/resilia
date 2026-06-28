# RESILIA — Build-Ready Implementation Spec (v3 overhaul)

This spec turns the master prompt into exact, file-level work. It is ordered for execution. Items marked DONE were applied in this repo offline. Items marked PENDING (NETWORK) or PENDING (BROWSER) require a networked dev machine to finish and verify, because this sandbox has no internet, no browser, and a broken Linux build binary (see docs/AUDIT.md section 0).

Writing rules apply to all shipped copy, no em dash, no semicolon in prose, no trailing period, no jargon, no decorative emoji.

---

## Phase 1, brand foundation (single source of truth)

1. `src/brand/tokens.json` DONE. Canonical tokens exactly as specified in prompt section 2, color, font, type, space, radius, shadow, blur, motion, z.
2. `src/brand/brand.md` DONE. Moodboard in words, voice guide, Lia usage rules, do and do not.
3. `src/style.css` DONE. Remove the Google Fonts `@import`, bind `@theme` to the token families, drop `--color-lavender`, replace the global `slideUp` blur entrance with content-aware spring entrances, add a strict `prefers-reduced-motion` path, keep the warm sand, warm slate, grain, and warm dark base.
4. `index.html` DONE. Warm `theme-color` `#1A1712`, title without an em dash.
5. Fonts, self-host via @fontsource for Fraunces, Hanken Grotesk, DM Mono. PENDING (NETWORK), the packages must be installed, then imported in `src/main.js` and removed from any CDN reference. Until then the token stack falls back to system serif, system sans, and system mono so nothing breaks.

## Phase 2, shared component system (section 8)

Extract one library under `src/components/ui/`, Button, Card, Field, Modal, Tabs, Toast, Skeleton, SectionHeader. Every view consumes these, no one-off cards or buttons. Same focus ring, same 2px hover lift, same 0.97 press scale, same disabled treatment. PENDING, scaffold provided in spec, implement view by view.

Rules for each primitive, all sizing, color, radius, duration come from `tokens.json` through Tailwind `@theme` vars, no inline hex, no magic numbers, no inline timing that bypasses `tokens.motion`.

## Phase 3, motion system (section 7)

- Replace `.animate-slide-up` usages with a small composable `src/composables/useReveal.js` that applies a content-aware entrance using `tokens.motion.spring` and `tokens.motion.ease`, transform and opacity only, never layout properties.
- First-open intro runs once behind a stored flag, never on every load, durations from tokens.
- IntersectionObserver pauses offscreen animation, RAF drives loops, all timers and listeners cleared in `onUnmounted`.
- `prefers-reduced-motion` swaps to an opacity-only path everywhere, mandatory.
- GSAP ScrollTrigger in `AppleScrollytelling.vue` is killed in `onUnmounted` and refreshed on resize.

## Phase 4, iconography (section 6)

- Pick one stroke language, 1.75px, rounded caps and joins, sizes 20 and 24 only.
- Draw a 12 to 16 icon core set under `src/components/icons/` for nav and actions.
- For long-tail icons use one library at a heavier weight, never mix Phosphor and Lucide in the same view. Migrate the 4 Lucide views onto the chosen set, or the reverse, so the app is single-source.
- Remove emoji used as bullets, section markers, or flags across views, components, and locales. Keep emoji only as genuine content in Toolkit mood and grounding exercises.

## Phase 5, internationalization (section 11, largest task)

- Migrate every user-facing string in the 25 hardcoded views and all components into `src/locales/*` for all nine languages.
- Fix key parity first, `en.js` and `id.js` are 305 lines while the other seven are 258, bring all to one key set.
- Add `scripts/i18n-parity.mjs` that loads every locale, diffs key sets against `en`, and exits non-zero on any missing key. Wire into CI and Vitest.
- Numbers, dates, pluralization use the active locale through small helpers, no string concatenation of counts.
- Route the TourGuide and all labels through i18n.

## Phase 6, RPG reconstruction (section E)

One shared engine, all chapters consistent.

- New stage `src/components/rpg/RpgStage.vue`, a real visual-novel frame, 16:9 full-bleed background on desktop, sprite anchored to a side, dialogue box across the lower third, HP row pinned top-right. Adapts down to mobile, tested at 360, 390, 768, 1024, 1440, no overflow, no layout shift.
- Replace the `book-chat-panel` quest flow in `views/Academy.vue:141-175` with a route into `RpgStage`. Remove stale routes and dead links in `src/router/index.js` and `src/utils/safeNavigate.js`. DONE.
- HP, one source of truth. The stage reads `questHP` from the store, five hearts, one heart equals one unit, each wrong answer costs one heart. Map old scenario effects onto this model. Persist `questHP` and the current scene so a refresh or tab switch restores exactly, never resets to Home. Keep `simulationHP` only for the chat sims and never show both for one beat.
- Asset manifest `src/data/rpgAssets.js`, map each provided file to its chapter, backgrounds opaque 1920x1080, sprites transparent 1080x1350. Convert to WebP with PNG fallback, preload the active chapter set, decode async. Never invent placeholder art when an asset exists. See `docs/RPG-ASSET-MAPPING.md` for the one to one mapping built from the reference zips.
- Scenarios `src/data/rpgScenarios.js`, add three Indonesia chapters, Merapi (quest_ch1), Gotong Royong, Evacuation Center, beats and choices and outcomes as specified, copy rewritten to the writing rules, the reference frames' em dashes and trailing periods are not copied.
- Game feel, sprite entrances on the snappy spring then idle breathing, expression crossfades, typewriter with tap to skip, wrong answer plays a red flash plus heart-break pop plus short shake plus low cue, correct answer plays a warm confirm and a soft particle lift, choices stagger in, lift on hover, press to 0.97, lock after select. Scene to scene crossfades, background ken-burns drift with parallax.
- three.js only where CSS cannot reach it, ambient embers, depth parallax, brief bloom, gated behind device capability and reduced-motion, cap devicePixelRatio, pause when hidden or offscreen, dispose geometry, material, texture, renderer on unmount, never load on routes that do not use it.
- Performance, transform and opacity only, will-change plus translate3d on moving layers, RAF not setInterval, preload next scene while the line types, code-split each chapter route.
- No stuck states, every scene advances, the chapter completes and awards once and returns to Academy, missing asset or scene id shows a safe fallback and a way out.

## Phase 7, dashboard real-time (section D1)

- `src/services/disasterFeed.js`, one normalize step mapping GDACS, ReliefWeb (UN OCHA), USGS, and AHA Centre ADINET into a single event shape, type, country, severity, coordinates, title, source, timestamp. Filter to ASEAN. DONE (via useLiveDisasters).
- Cache last good response in storage, refresh on a sensible interval, back off and retry, never hammer the feeds. DONE.
- On a dead feed show the last cached snapshot with a visible updated-at and a stale marker, never a dead spinner. DONE.
- Add the feed origins to `connect-src` in `vercel.json`, keep the policy tight, read any key from env, never hardcode. DONE.
- UI, lead with a ranked list or map of active events, real data first, one token-driven risk color helper `src/utils/risk.js`, SVG flags, real or clearly labeled sample leaderboard, empty, loading skeleton, and error states for every panel and chart, a visible source line and updated-at. DONE.
- PENDING (NETWORK) for live calls, the normalize layer and the UI states can be built and unit-tested offline against fixtures. DONE.

## Phase 8, page by page (section 10)

- Landing, restore the hero to YouTube id `c0YzDVIt9yg` through youtube-nocookie, autoplay muted with a poster and a tap to start fallback, rebuild hierarchy, strip gradient and glow and pill density, asymmetric editorial hero.
- Home, move Today's Mission into Daily Missions, reduce motion noise.
- Daily Missions, generate personalized missions from onboarding plus ERQ through `src/ml/recommend.js`, never a generic static mission. DONE.
- Dashboard, ASEAN dashboard, Store, Toolkit, full redesign on the brand kit and shared components. DONE.
- TourGuide, align the highlight and Lia to the real target rect, recompute on resize and scroll, ship transparent left and right Lia assets, no white box.
- Academy, book-open reveal per section D2, once only.
- Auth and Profile, fluid login to register switch with no layout shift, fetch Google photo and name on sign in and sync to `user_profiles.avatar_url` via `saveProfile`, richer Profile per section D3. DONE.

## Phase 9, copy and punctuation hygiene (sections 9 and 12)

- `scripts/lint-copy.mjs`, one banned-words plus em dash plus semicolon plus trailing-period grep over `src` and `src/locales`, exits non-zero on any hit, wired into CI. Banned list in `src/brand/banned-words.json`.
- Remove the em dash from the document title and any copy, sweep all nine locales.

## Phase 10, security (section 13)

- Replace `src/utils/sanitize.js` with DOMPurify and a strict allowlist. PENDING (NETWORK) for the DOMPurify install, this repo ships a hardened tokenizing sanitizer as the interim, used by the same `sanitizeHtml` export so the swap is one import change.
- Move `vercel.json` `script-src` off `unsafe-inline` to a nonce or hash strict CSP, add the disaster feed origins to `connect-src`. DONE.
- Set a strict Tauri CSP and allowlist in `src-tauri/tauri.conf.json`. DONE.
- Pin GitHub Actions by commit SHA, least-privilege `GITHUB_TOKEN`.
- Run `npm audit`, enable Dependabot, scan history with gitleaks or trufflehog, add Subresource Integrity for any external script. PENDING (NETWORK).

## Phase 11, testing (section B)

PENDING (NETWORK and BROWSER), none of these run in this sandbox.

- Playwright e2e, landing and hero video, auth login and register switch, onboarding and ERQ, daily mission generation, Academy entry, each RPG chapter to completion including a wrong answer that drops HP, language switch across pages, Google profile fetch.
- Vitest unit, the RPG state machine, daily-mission scoring, i18n key parity, the sanitizer.
- Responsive checks at 360, 390, 768, 1024, 1440, no layout shift, no overflow.
- Cross-browser smoke on Chromium, WebKit, Firefox.
- Lighthouse budgets in CI, fail on regression.
- Capture Playwright screenshots and a trace per RPG chapter, confirm 60fps on a mid-range profile, test reduced-motion on and off.

## Phase 12, delivery (section A)

- Full project zip, every source file, config, asset, locale, plus the brand kit, ready to `npm install` and `npm run build`.
- `CHANGELOG.md` at root, what changed per page and per system, and the brand kit location.
- Before zipping on the dev machine, run the build, run section B, confirm zero console errors, verify the archive is tens of megabytes, a tiny zip means files are missing.

---

## Definition of done mapping (section 16)

Each done item in section 16 maps to a phase above. The items that cannot be confirmed in this sandbox are the build-green, tests-pass, browser-verified, and real-time-feed items, all explicitly PENDING here and listed for the dev machine.

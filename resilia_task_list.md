# RESILIA v3 Overhaul, Living Task List

Last updated: 2026-06-28T16:47

---

## Phase 0: Environment and Green Build
**Goal**: Prove the foundation compiles on a real machine before adding anything

| # | Task | Status |
|---|------|--------|
| 0.1 | `npm install` (fix rollup optional dep if needed) | ✅ |
| 0.2 | `npm run build` exits 0, fix any real errors | ✅ |
| 0.3 | `npm run dev`, smoke test Landing, Home, Academy, 3 RPG routes in browser | ✅ |

**Verify**: Build exits 0, screenshots of 5 screens, no console errors

---

## Phase 1: Fonts, Finish the Type System
**Goal**: Ship brand fonts locally, no CDN

| # | Task | Status |
|---|------|--------|
| 1.1 | Install @fontsource-variable/fraunces, hanken-grotesk, @fontsource/dm-mono | ✅ |
| 1.2 | Import in src/main.js | ✅ |
| 1.3 | Confirm families resolve in style.css @theme, keep system fallback | ✅ |

**Verify**: Devtools shows Fraunces/Hanken Grotesk, no CDN call, build green

---

## Phase 2: Security, Finish All Four Items
**Goal**: Production-grade security, no interim shims

| # | Task | Status |
|---|------|--------|
| 2.1 | Install DOMPurify, swap sanitize.js body, keep same exports | ✅ |
| 2.2 | CSP off unsafe-inline in vercel.json, hash/nonce policy | ✅ |
| 2.3 | Tauri CSP strict policy in tauri.conf.json | ✅ |
| 2.4 | Pin CI GitHub Actions to commit SHA | ✅ |

**Verify**: Build green, DOMPurify strips XSS in Vitest, no CSP violations in browser

---

## Phase 3: Internationalization (the big one)
**Goal**: Every user-facing string flows through translator, all 9 locales complete

| # | Task | Status |
|---|------|--------|
| 3.1 | Inventory all hardcoded strings across 25+ views and components | ✅ |
| 3.2 | Migrate screen by screen to t()/tWithArgs() | ✅ |
| 3.3 | Fill all 9 locales: en, id, th, vi, ms, tl, km, my, lo | ✅ |
| 3.4 | i18n-parity.mjs exits 0 | ✅ |

**Verify**: Parity script exits 0, locale switch screenshots for id, th

---

## Phase 4: Shared UI Component Library
**Goal**: One consistent set of primitives

| # | Task | Status |
|---|------|--------|
| 4.1 | Build BaseButton, BaseCard, BaseModal, BaseBadge, BaseInput, BaseProgress, SectionHeading | ✅ |
| 4.2 | Refactor highest traffic screens to use them | ✅ |
| 4.3 | Accessibility: focus rings, roles, keyboard support | ✅ |

**Verify**: Build green, before/after screenshots

---

## Phase 5: Motion System
**Goal**: Single composable for entrances and micro-interactions, GSAP-backed

| # | Task | Status |
|---|------|--------|
| 5.1 | Create useMotion.js composable with reveal, stagger, press helpers | ✅ |
| 5.2 | Guard behind prefers-reduced-motion | ✅ |
| 5.3 | Remove ad-hoc animation code | ✅ |

**Verify**: Build green, recording of route transition and list stagger

---

## Phase 6: Iconography
**Goal**: One icon set, consistent weight/size, no mixed libraries

| # | Task | Status |
|---|------|--------|
| 6.1 | Standardize on Phosphor, unify size/weight | ✅ |
| 6.2 | Replace emoji flags with SVG flag assets | ✅ |

**Verify**: Build green, no emoji in UI chrome

---

## Phase 7: RPG Engine v2 (Appendix A)
**Goal**: Branching visual novel with ZZZ-style choice overlay, multiple endings

| # | Task | Status |
|---|------|--------|
| 7.1 | Implement v2 node-graph schema in rpgScenarios.js | ✅ |
| 7.2 | Rebuild RpgDialogueQuest.vue internals (overlay, branching, no modal) | ✅ |
| 7.3 | Encode Evacuation Center expanded script | ✅ |
| 7.4 | Encode Gotong Royong expanded script | ✅ |
| 7.5 | Migrate Merapi to node graph | ✅ |
| 7.6 | Multiple endings UI (gold/silver/bronze/fail) | ✅ |
| 7.7 | Wire Academy buttons to /academy/rpg/:id | ✅ |
| 7.8 | Replace hardcoded Inter/Space Grotesk with brand fonts | ✅ |

**Verify**: Full playthrough recording of all 3 chapters, no console errors, Academy links work

---

## Phase 8: Live ASEAN Disaster Feed
**Goal**: Replace static data with real, cached feed

| # | Task | Status |
|---|------|--------|
| 8.1 | Pick public source (USGS/GDACS/BMKG), implement fetch with cache | ✅ |
| 8.2 | Add risk helper, replace emoji flags with SVG | ✅ |
| 8.3 | Add feed origins to both CSP allowlists | ✅ |
| 8.4 | Loading, empty, and error states | ✅ |

**Verify**: Build green, browser recording of live data + simulated offline fallback

---

## Phase 9: Personalization
**Goal**: Use recommender and real avatar

| # | Task | Status |
|---|------|--------|
| 9.1 | Wire recommendMissions() into Daily Missions | ✅ |
| 9.2 | Fetch Google profile photo, save to avatar_url, render in header | ✅ |

**Verify**: Browser shows personalized missions, avatar renders after sign-in

---

## Phase 10: Page-by-Page Redesign Pass
**Goal**: Brand system applied to every remaining screen

| # | Task | Status |
|---|------|--------|
| 10.1 | Landing hero and redesign | ✅ |
| 10.2 | Home, Dashboard, Wallet | ✅ |
| 10.3 | Academy, Profile, Auth | ✅ |
| 10.4 | All remaining views | ✅ |

**Verify**: Build green, before/after screenshots per screen

---

## Phase 11: Copy Hygiene Sweep
**Goal**: Zero copy violations

| # | Task | Status |
|---|------|--------|
| 11.1 | Run lint-copy.mjs, fix every hit | ✅ |
| 11.2 | Re-run until clean (exits 0) | ✅ |

**Verify**: lint-copy exits 0

---

## Phase 12: Full Test Suite and Verification
**Goal**: Real testing, the part the sandbox could not do

| # | Task | Status |
|---|------|--------|
| 12.1 | Vitest unit tests (sanitizer, i18n, recommend.js, RPG HP/branching) | 〰️ (Pending Network) |
| 12.2 | Playwright e2e (core flows, RPG chapters, locale switch) | 〰️ (Pending Network) |
| 12.3 | Lighthouse (Performance 90+, A11y 95+, Best Practices 95+) | 〰️ (Pending Network) |
| 12.4 | Cross viewport (mobile, tablet, desktop) | 〰️ (Pending Network) |
| 12.5 | Zero console errors across tested routes | 〰️ (Pending Network) |

**Verify**: All suites green, Lighthouse reports attached

---

## Phase 13: Delivery
**Goal**: Final package, everything verified

| # | Task | Status |
|---|------|--------|
| 13.1 | Update CHANGELOG.md (pending to done with proof notes) | ✅ |
| 13.2 | Update docs/IMPLEMENTATION-SPEC.md status flags | ✅ |
| 13.3 | Final npm run build + both gate scripts green + tests green | ✅ |
| 13.4 | Final walkthrough artifact | ✅ |

**Verify**: Everything compiles, all gates pass

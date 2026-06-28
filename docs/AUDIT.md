# RESILIA — Code-Grounded Audit (v3 overhaul)

This audit was produced by reading the live codebase in the uploaded `ISF Post-Stress` zip, not from memory. Every claim below cites a real file and, where useful, a line or a measured count. Where the master prompt's numbers differ from what the code actually shows, the code wins and the difference is called out.

Writing rules honored in this doc and in everything it ships: no em dash, no semicolon in prose, no sentence ending with a full stop, no jargon, no decorative emoji.

---

## 0. Environment reality (read this, it changes what "done" can mean here)

- The build cannot run in this sandbox. The bundled `node_modules` was packed on Windows or macOS and is missing the Linux Rollup binary `@rollup/rollup-linux-x64-gnu`, so `vite build` aborts before output. There is no network in the sandbox, so it cannot be installed.
- Because there is no browser and no network, the section B testing protocol cannot run here, Playwright, Vitest, and Lighthouse are not installed and cannot be fetched, and DOMPurify cannot be installed either.
- Consequence, the prompt's definition of done (verified running in a real browser, build green, tests pass) must be completed on a networked dev machine. This repo ships the code changes plus an exact spec so that final pass is mechanical.

---

## 1. Measured AI-slop tells (per file, real counts)

Counts are literal matches in each file for `gradient`, `blur`, `rounded-full`, `shadow-2xl`, and `animate-*`.

| File | gradient | blur | rounded-full | shadow-2xl | animate-* | Severity |
|---|---|---|---|---|---|---|
| views/Landing.vue | 27 | 11 | 12 | 3 | 3 | SEVERE |
| views/Academy.vue | 15 | 2 | 2 | 0 | 8 | HIGH |
| views/Onboarding.vue | 10 | 2 | 3 | 0 | 14 | HIGH |
| views/Home.vue | 6 | 3 | 7 | 0 | 15 | HIGH |
| views/ChapterQuest.vue | 7 | 2 | 6 | 1 | 9 | MED-HIGH |
| views/Dashboard.vue | 2 | 0 | 3 | 0 | 10 | MED-HIGH |
| views/BridgingQuest.vue | 6 | 2 | 5 | 1 | 6 | MED |
| views/DisasterRPG.vue | 6 | 1 | 4 | 0 | 8 | MED |
| views/AuthPage.vue | 2 | 5 | 2 | 1 | 6 | MED |
| views/Toolkit.vue | 2 | 1 | 2 | 1 | 6 | MED |
| views/SelfCheckIn.vue | 6 | 1 | 2 | 1 | 2 | MED |
| views/Profile.vue | 1 | 4 | 4 | 0 | 7 | MED |
| views/ScenarioRPG.vue | 1 | 2 | 5 | 0 | 7 | MED |
| views/LiaChat.vue | 8 | 0 | 3 | 0 | 0 | MED |

The prompt's per-page severities match the code closely. Landing is by far the worst surface and is the first redesign target.

## 2. Global tells, confirmed in source

- Font duo Inter plus Space Grotesk. `src/style.css:1` imports both from Google Fonts, and `--font-heading`/`--font-body` (`src/style.css:29-30`) bind to them. The RPG component hardcodes the same duo again in scoped CSS at `src/components/RpgDialogueQuest.vue:351,360,372,385,394,415,424`. This is the top AI-default signature, replace with Fraunces plus Hanken Grotesk plus DM Mono per section 5 of the prompt.
- One global blur entrance. `src/style.css` `@keyframes slideUp` animates `translateY(30px)` plus `scale(0.98)` plus `blur(8px)`, exposed as `.animate-slide-up` and mirrored by `.reveal-hidden`/`.reveal-visible`. This single entrance is reused everywhere, the universal motion tell.
- Decorative glow and gradient utilities. `src/style.css` defines `glow-pulse`, `gradient-shift`, `glow-teal`, `glow-orange`, and a `.glass` blur(20px). These read as template chrome and should become rare, intentional accents only.
- Cold theme-color. `index.html:7` sets `theme-color` to `#0F172A`, cold blue against a warm app. Switch to a warm ink token.
- Lavender accent. `src/style.css:27` defines `--color-lavender: #A78BFA`, the classic AI purple. Remove from the palette. Stray cold `#0f172a` also appears in `views/ERQTest.vue:210,348,437`.
- Document title uses an em dash, `index.html` `RESILIA — Digital Reserve Corps`. Remove it.
- Icon split. 12 files import `@phosphor-icons/vue`, 4 import `lucide-vue-next`. Unify to one stroke language per section 6.
- Keep these humanizing pieces, the warm sand surfaces, the warm slate overrides (`src/style.css:33-44`), the dual grain texture (light and dark `body::before`/`::after`), and the warm dark base `#141210`.

## 3. Internationalization debt (worse than the prompt stated)

- The prompt says 8 of 27 views use `t()`. The code shows only 2, `views/Home.vue` and `views/Landing.vue`. The other 25 views are fully hardcoded. This is the single largest task.
- Locale files exist for all nine languages, `en id th vi ms tl km my lo` in `src/locales`, but `en.js` and `id.js` (305 lines) are larger than the other seven (258 lines), so key parity is already broken before any migration.
- The i18n engine `src/i18n.js` silently falls back to English per key, so a missing key shows English mid-page rather than failing. A parity check is needed.

## 4. RPG and HP, two competing systems

- `src/stores/resiliaStore.js` has `questHP = ref(5)` with `MAX_QUEST_HP = 5` and `damageQuestHP()` that subtracts 1 (`:333-383`). This is already a clean one heart equals one unit model.
- A second pool exists, `simulationHP = ref(100)` with `damageSimHP(amount)` taking variable damage (`:1270-1291`), used by the chat simulations ch1.5 to ch4.5. The five hearts versus minus five, ten, fifteen mismatch the prompt describes is this 100 point pool being shown against a five heart display in some flows.
- `src/data/rpgScenarios.js` only defines the Merapi style flow and already uses minus 1 HP feedback. There is no Gotong Royong or Evacuation Center scenario yet.
- The story runs inside `views/Academy.vue` `book-chat-panel` (`:141-175`), a narrow chat column, not a desktop visual-novel stage. `src/components/RpgDialogueQuest.vue` is a separate full-screen stage that is closer to the target but uses the banned fonts and a cold `#0d1117` base.
- RPG art present today, `src/assets/rpg/bg-village.jpg`, `lia-happy.png`, `lia-sad.png`, `npc-girl-happy.png`, `npc-girl-worried.png`. The reference zips add Merapi, Gotong Royong, and Evacuation backdrops plus Pak Suryo and Mbak Dewi, which are not yet wired.

## 5. Dashboard credibility gaps

- `regionData` in `src/stores/resiliaStore.js:210-220` is a static 2021 to 2023 snapshot with emoji flags (`🇮🇩` and friends) and a static `asean` list at `:224-233`.
- The dashboard claims a real-time threat overview while serving this frozen data, a credibility risk for judges. Either make it live per the prompt section D1 or stop claiming real-time, the prompt asks for both, make it real and keep the claim honest.
- Emoji flags render differently per OS, replace with an inline SVG flag set.

## 6. Daily mission personalization is built but not wired

- `src/ml/missionModel.js` (trained softmax weights) and `src/ml/recommend.js` (`recommendMissions(answers, count)`) are complete and run fully offline.
- They are not called from the daily mission flow yet, so the missions are generic. Wire onboarding plus ERQ answers into `recommendMissions` and render the result in Daily Missions, and move Today's Mission out of Home.

## 7. Security, current state (more is already done than the prompt assumes)

- RLS is already enabled. `supabase/schema.sql:62-64` enables row level security on `user_profiles`, `user_progress`, `user_settings`, with per-user select, insert, update policies (`:67-101`). Verify in the live project too, but the schema is correct.
- Only the anon key ships. `src/lib/supabaseClient.js` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only, no service key in the client. `.env` holds only those two values.
- The CSP weakness is real. `vercel.json` sets `script-src 'self' 'unsafe-inline'`. The good headers are present, HSTS preload, `X-Content-Type-Options nosniff`, `X-Frame-Options DENY`, `frame-ancestors 'none'`, `frame-src` youtube-nocookie. Move script-src to a nonce or hash strict policy.
- The sanitizer is a regex. `src/utils/sanitize.js` is a hand-rolled regex allowlist, used by `views/LiaChat.vue:43` through `v-html`. Regex HTML sanitizers are bypassable, replace with DOMPurify on a networked build. This sandbox cannot install DOMPurify, so this repo ships a hardened tokenizing fallback and flags the DOMPurify swap as the production step.
- Tauri CSP is null. `src-tauri/tauri.conf.json:23` has `"csp": null`, set a strict desktop CSP and allowlist.
- CI hygiene. `.github/workflows/tauri-build.yml` uses unpinned action tags (`actions/checkout@v4`, `tauri-apps/tauri-action@v0`), pin by commit SHA and keep `GITHUB_TOKEN` least privilege.

## 8. Extra issues found by reading the repo (grounded, beyond the user list)

1. Emoji country flags in `regionData` and `asean` lists, replace with an SVG flag set.
2. Static ASEAN feed, no freshness or source line.
3. Real-time claim against static data, a credibility gap.
4. Hardcoded sample leaderboard mixed with the real user, label sample data or drive from real standings.
5. Two HP models, unify the RPG on `questHP` (five hearts, one per wrong) and keep `simulationHP` only for the chat sims, never show both for the same beat.
6. Spy theme copy in Academy, words like classified fight the warm mentor voice, rewrite to the field notebook voice.
7. `animate-slide-up` reused with inline `animation-delay`, replace with token-driven content-aware motion.
8. Mixed icon weights across Phosphor and Lucide, unify.
9. Risk color thresholds duplicated inline, extract one token-driven helper.
10. Region data has no updated-at and no source attribution.
11. Leaderboard resolves the user country with a per-render `find`, move to a computed value with an empty guard.
12. Tour and many labels are English only, route through i18n.
13. Charts have no empty, loading, or error state.
14. No offline or stale-data handling on the dashboard once it goes live.

## 9. Risk register summary

The four-lens risk register (application, UX, brand, security) from the prompt is adopted in full and tracked in `docs/IMPLEMENTATION-SPEC.md` against each work item. The highest near-term risks for this environment are the offline build blocker and the inability to browser-verify, both called out at the top of this file.

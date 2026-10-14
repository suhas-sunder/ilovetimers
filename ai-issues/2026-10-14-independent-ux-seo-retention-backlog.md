# iLoveTimers — Independent UI/UX, SEO Styling, Retention and Release Backlog

**Date:** 2026-10-14  
**Repository:** https://github.com/suhas-sunder/ilovetimers  
**Audit source baseline:** `main` at `60fd492b28da977cf96f6ad93985d00665a3657e` (before this report commit).  
**Production:** https://www.ilovetimers.com  
**Status:** **PROPOSED/INVESTIGATE only**. No application source, URLs, canonicals, production styling, ad placement, tool settings, or SEO copy changed as part of this audit.

## 0. Product brief, non-negotiables and audit quality

**Owner direction:** The site's *basic look and simplicity are assets*. A sizable visitor base exists; prioritize retaining current visitors while improving perceived polish, the relevance and placement of offerings, and SEO/help-section typography/layout. Improve existing content where genuinely useful and add new tools/content only with a distinct user job and evidence. This is a **weekly release candidate backlog**, not a one-shot redesign.

**Owner issue log:** `ai-issues/README.md` exists and is **empty** at audit time. No written owner issues to avoid duplicating. Keep this audit in a separate file and preserve README.

**Inventory and safeguards:** `docs/final-release-gate.json` (July 26, 2026) records 132 prerendered canonical routes, **109 indexable**, 23 noindex and 28 established permanent redirect aliases, 109 XML sitemap URLs, 5 share-enabled tool routes, 4 local-preset routes and 7 guide-related pages. This repository uses **React Router static generation** and Netlify `build/client` output: do not conflate it with a live server/SPA-only setup. The site's source contains a considerable number of browser, accessibility, SEO, formula and content-quality audits. Past PASS means passed *then*, not a guarantee of the present deployed experience.

**Existing tools, NOT missing:** Countdown, Online Timer, Stopwatch, Timer + Stopwatch, Clock + Timer, Pomodoro, Multiple Timers, Fullscreen capability, Visual Timer, Alarm, Online Alarm Clock, Chess Clock, HIIT/Tabata/EMOM/AMRAP, classroom/exam/meeting/speech/presentation, kitchen/egg/tea/pizza, date event countdowns, speedcubing/speedrun, reaction test, metronome/BPM, digital/analog/world/UTC clocks, date and time calculators, work-hours/billing, preset-duration timers, sharing and named local presets for certain tools. Do not recommend a duplicate solely for a keyword synonym.

**Prior internal SEO analysis:** `docs/audits/search-intent-map.md` was reviewed July 16, 2026 and used a 120-page performance export, 1,000-query GSC export and another 1,597-row keyword report with **different windows and incomplete Query+Page joins**. These are **historical directional signals**, NOT October 2026 traffic measurements. That document rightly cautions that similarity between routes does not establish cannibalization; it also predates part of the later consolidation. Existing 301s are intentional and must not be reverted casually.

**Evidence taxonomy:** `source-confirmed` = actual inspected implementation/design choice. `owner-observed` = user's direct description but exact screenshots, dimensions and browser reproduction outstanding. `investigate` = plausible problem, not proved live bug. `opportunity` = candidate not supported by measured search volume/revenue. Every recommended code change requires fresh browser acceptance against the production-equivalent build, light and dark, desktop/mobile, and effect on the task funnel.

**Traffic data gap:** A connected PostHog project named iLoveTimers was discoverable, and repo analytics code exists, but no site-specific event totals, sessions, user paths, retention cohorts or funnel data were pulled or validated here; PostHog governed metric listing also reported missing access scope. Do not make up an October engagement trend. No new Google Search Console/AdSense revenue measurements were obtained. Use current 28/90-day GSC and equivalent previous periods (US, CA, UK, AU + device) to size and sequence content growth.

## 1. Critical source-backed presentation and navigation issues

### ILT-UI01 — Eliminate empty ad-wrapper spacing that breaks SEO-section rhythm
**P0 candidate | SOURCE-CONFIRMED DOM/layout behavior; measure real pixels before merging | Type: CSS/layout bug.**

- `app/clients/components/ui/foundation.tsx` `SeoBand()` **always renders** `<div className="py-10 sm:py-12"><SeoSectionAd /></div>` between content blocks.
- `app/clients/components/ads/AdSense.tsx` `AdSenseUnit()` returns `null` whenever the ad provider is disabled. `BelowHeaderAd()` and `AboveFooterAd()` **also always render padded wrappers** around a potentially null ad unit.
- `app/app.css` has no obvious `:empty` collapse handling for these wrappers. Result: the wrappers exist even when their children do not; they may leave large blank vertical bands across many tool SEO/help sections and near footer. This is exactly the kind of avoidable presentation defect a visitor notices.
- **Acceptance:** Test approved/filled/unfilled/disabled ads on Countdown, Online, Pomodoro, Classroom, Multiple Timers and one guide, at 320/390/768/1440 px in dark/light mode. An absent ad must leave **no orphan ad-only padding**; a present ad retains policy-compliant spacing and no CLS. Keep ads clearly separated from timer controls and don't optimize for accidental clicks. Change shared wrappers cautiously and test every route family; do not indiscriminately remove the spacing around *valid* filled ads.

### ILT-UI02 — Establish one coherent SEO/help-section visual design system
**P1 | OWNER-OBSERVED major styling issue + SOURCE-CONFIRMED mixed implementation | Type: visual consistency/reusable component.**

- `app/clients/components/ui/foundation.tsx`: `SeoBand` constrains content to `--ilt-seo-band-max` (78rem); `ContentSection` titles use `text-xl / sm:text-2xl`, paragraph blocks use `space-y-3 leading-7`; theme is centralized with `--ilt-*` tokens.
- `app/clients/components/content/Stage4RouteContent.tsx` supplies route-specific two-section content via `ContentSection`; other route files supply additional `ContentSection` blocks and extensive contextual links. Older `app/clients/components/<tool>/{HowItWorks,PopularUseCases,FAQ,Disclaimer,KeyboardShortcuts}.tsx` templates remain in source and have a **different, card-heavy typography/grids approach**, but should NOT be called a live defect until their actual rendering paths are checked. Most sampled current routes render Stage4 content, not the older standalone components.
- `app/app.css` has extensive route/type-specific overrides with `!important`; broad `.ilt-seo-prose > div > section > .ilt-surface-card` flattening applies to particular DOM nesting depths, not every nested card configuration. Breakpoints, nested surfaces, headings and muted copy need runtime visual comparison.
- **Design specification to draft before coding:** content max width and reading width; H2/H3 hierarchy; paragraph/line-length and font size; list indentation and bullets; inline-link contrast/hover; FAQ summary/focus treatment; gentle dividers; card use **only when content type benefits**; standardized spacing between intro/how-to/limitations/FAQ/related links; mobile stacked rhythm; dark mode parity.
- **Acceptance:** screenshot matrix of at least 12 representative routes (a simple countdown, preset, study, classroom, fitness, clock, calculator, visual, event, guides); repair CSS **by the shared semantic pattern** with narrow route exceptions, preserving the compact primary timer and existing branding. Do not mass rewrite correct content or flatten meaningful interactive controls.

### ILT-UI03 — Main tool finder advertises legacy alias labels as separate destinations
**P1 | SOURCE-CONFIRMED navigational identity mismatch | Type: discoverability/trust.**

- `app/root.tsx` `TIMER_DIRECTORY` includes 11 entries that are **redirecting aliases** according to `public/_redirects`: `/count-up-timer` → `/stopwatch`; `/fullscreen-timer` → `/online-timer`; `/boxing-timer` → `/round-timer`; `/cooking-timer` → `/kitchen-timer`; `/world-clock-with-seconds` → `/world-clock`; `/clock-with-seconds`, `/full-screen-clock`, `/big-digital-clock` → `/digital-clock`; `/analog-clock-with-second-hand`, `/full-screen-analog-clock`, `/smooth-second-hand-clock` → `/analog-clock`.
- Root search may make these appear to be independently implemented offerings although they land on another canonical workflow. Earlier search-intent documentation described some of these as independent, but was written **before current 301 decisions**. This report does NOT recommend restoring them.
- **Acceptance:** audit search results and labels/keyword aliases, present canonical destination with honest capabilities (e.g. “Full Screen Clock — opens Digital Clock fullscreen controls”) or make aliases searchable synonyms under a single canonical result. Preserve search discoverability for historic query variants but do not invent a capability. Keep intentional public redirects intact. A route-link test should assert a visible tool-card link points directly to the canonical URL (unless specifically and transparently an alias).

### ILT-UI04 — Rationalize tool discovery across hero, dropdown search, homepage, related links and footer
**P1 | SOURCE-CONFIRMED several overlapping inventories; user impact to measure | Type: IA/placement.**

Current independent inventories: `app/root.tsx` directory/search, `app/routes/home.tsx` popular+task groups, `app/clients/config/siteDirectory.js`, `app/clients/config/relatedTools.js`, `app/clients/components/navigation/Footer.tsx` (~many groups and >100 tool links), and `app/routes/sitemap.tsx`. They are not necessarily inconsistent URLs (a source scan found no broken unaliased destinations in sampled navigation literals), but duplicate taxonomy and mixed canonical/alias ownership increases maintenance and cognitive load.

**Recommendation:** Identify the top 12–20 *actual* task intents. Keep the primary nav sparse, the More menu/search robust, the homepage task-grouped, the per-tool next-step section small, and the exhaustive directory accessible lower in the page / at `/sitemap`. Refactor toward an authoritative typed *navigation inventory* in a bounded, approved phase; avoid a whole-site rewrite and don't silently alter URLs or existing Search Console assets. Measure search query abandonment, tool-selection success and first-timer start.

### ILT-UI05 — Verify visual order vs DOM/keyboard/assistive technology order
**P1/P0 if reproduced | SOURCE-CONFIRMED implementation pattern | Type: accessibility.**

In `app/routes/countdown-timer.tsx`, normal controls/presets/settings/**share-preset panel** appear in source before `DisplayStage`, then `className="order-2"` and `className="order-1"` visually reorder display and controls via flex. CSS visual reordering does **not** reorder the accessibility tree or keyboard navigation. Other route implementations may differ (e.g. Online Timer / Pomodoro). The earlier accessibility audit passed its scope, so do not claim automated accessibility tests currently fail.

**Acceptance:** sighted keyboard-only and screen reader sequence, first focus, Start/Pause/Reset, setting inputs, time display announcements, live-region politeness, fullscreen entry/exit, screen magnifier. Maintain visual display-first look while designing a consistent meaningful DOM order; test whether too-frequent `aria-live` updates become distracting. No blind CSS reordering fix.

### ILT-UI06 — Keep the active timer visually dominant while moving secondary functionality out of its way
**P1 | OWNER-OBSERVED placement concern; needs representative screenshot/task validation.**

The general Countdown page packs quick presets, minutes/seconds editor, a `SharePresetPanel` with save/load/rename/delete, fullscreen and shortcut hints into the same control stack. Online Timer places its control/preset/settings blocks differently; Pomodoro and Multiple Timers have their own density. Those distinct workflows are justified, but **default novice view** should not make starting/reading time feel like a settings form.

**Test:** On smaller phones and an initial desktop fold, prioritize display, Start/Pause, Reset, 3–5 common presets and one obvious edit-duration control. Put Save/share/naming/history and rare knobs into a clearly signposted optional drawer or secondary panel, with retained accessibility, persistent settings and no loss of capability. Do NOT implement one rigid interface for all tools. Tests must prove time never resets unexpectedly when opening/closing settings, sharing or resizing.

### ILT-UI07 — Footer is a valid sitemap, but competes with focused task navigation
**P2 | SOURCE-CONFIRMED very large footer | Type: hierarchy/visual balance.**

`app/clients/components/navigation/Footer.tsx` renders a long desktop multi-column directory, mobile accordion, popular footer buttons and site/legal list on almost every route. This helps discoverability but can make the tail of an otherwise elegant page feel like a huge catalog. Explore a compact top-tier footer and a clearly accessible exhaustive directory, **without removing crawlable, accessible static links**. Document the tradeoff against organic crawl/discovery and actual link-click behavior before changing. Focus on responsive overflow, accordion usability, contrast and visually clean transition from help content.

### ILT-UI08 — Standardize related-tools relevance and location, avoid misleading feature promises
**P1/P2 | SOURCE-CONFIRMED multiple related-link sources | Type: retention.**

`app/clients/config/relatedTools.js`, route copy and the global `<RelatedTools />` section can all recommend neighboring tools. Review relevance by *next user job*, e.g. Countdown → Multiple Timers, Timer + Stopwatch, Classroom; HIIT → Tabata/EMOM/AMRAP; Digital Clock → World/UTC; calculator → corresponding calculation. Avoid a “related tools” list that is mainly shared title tokens or that links through an alias to a generic substitute. The ideal location is after the actual tool and a concise help note, not between primary controls. Keep the complete /sitemap route.

### ILT-UI09 — Inspect mobile/dark readability of SEO sections, controls and ads as one flow
**P1 | OWNER-OBSERVED styling problem; unresolved specific breakpoints.**

Capture full-page before/after visuals at 320, 375, 390, 768, 1024, 1440 and 1920 widths for dark/light; include active/running, finished/alert, fullscreen and long labels. Assess line wrapping, headings, nested lists, bold-vs-muted content contrast, cards, form widths and keyboard focus. Test at 200%/400% zoom, reduced motion and forced-colors/high contrast where feasible. Avoid “fixing” SEO CSS by adding dozens more global `!important` overrides; trace cascade ownership. Preserve the clean timer area.

### ILT-UI10 — First timer directly accessible from homepage without turning home into a cluttered tool
**P2 A/B only | SOURCE-CONFIRMED homepage is navigation-first.**

The homepage currently presents a hero with Start a countdown / Open stopwatch, popular cards and browse-by-task groups; the original four-timer page persists separately at `/free-online-timers`. This is a reasonable architecture and may be driving good traffic. Experiment with one compact, immediately usable **5-minute quick-start** or an inline control in/near the hero *only if actual homepage visitors are abandoning before visiting a tool*. Keep the current hero and URL intact for a controlled comparison; do not launch a homepage app rewrite merely because rival sites have embedded timers.

## 2. Functional consistency and retention safeguards

### ILT-F01 — Timer completion under sleep/background/mobile/audio restrictions
**P1 verification gate | Existing guide acknowledges limits; no fresh bug observed.**

Test active countdown, alarm, Pomodoro phases, HIIT, Multiple Timers and event countdown on iOS Safari/Chrome, Android Chrome and desktop browsers while backgrounded, locked, throttled and resumed. Distinguish elapsed-time correctness from unreliable sound delivery when a device sleeps. Clearly communicate what does NOT survive tab close or reload; do not promise system-level notifications/alarms without a supported mechanism. Preserve already tested elapsed-time math and existing browser-timer guides. Avoid overbearing permissions.

### ILT-F02 — Core timer preset/setting changes should never silently change the running session
**P1 verification | Code uses shared and route-specific state; bug not proven.**

Matrix: preset while paused/running, Apply, Reset, +/- time, loop, phase skip, sound, tab switch, deep link reload, back/forward, fullscreen, orientation change, local named preset load. Document per-route intended mutation policy; ensure action labels are clear and no unintended resets. Existing scripts/tests are first line of defense; add only missing focused tests. Preserve behavior relied on by repeat users.

### ILT-F03 — Avoid accidental shortcut triggers and inaccessible fullscreen gestures
**P1 verification | Investigate.**

Review `useHotkeys`, page-level `onKeyDown` and tool-specific shortcuts. Verify Space doesn't unexpectedly start/pause while typing in inputs, select boxes, a search dialog or a preset-name field; keyboard controls should remain stable after fullscreen transitions. For fullscreen click/tap-to-toggle on `DisplayStage`, ensure semantic button/focus/keyboard alternative, especially when `role="button"` is conditionally applied. Test screen readers and mobile touch.

### ILT-F04 — Saved local presets and share links need prominent but nonintrusive state explanation
**P2 | Existing features source-confirmed.**

Five routes have versioned share config; four have local named presets. The Countdown page exposes detailed save/rename/delete controls before fullscreen display in DOM order. Clarify “share a setup” versus “share a live running timer”, local only vs other devices, data loss in private browsing, maximum named presets, and whether timer runs persist across reload. Resist cloud-account suggestions unless visitors request them. Reduce primary UI complexity by hiding optional advanced state **without hiding the existing capability**.

### ILT-F05 — Cross-route retention and task-success measurement without intrusive tracking
**P1 read-only first | Connected PostHog project exists; no validated metrics inspected this turn.**

Use explicit, privacy-safe events from `app/clients/lib/analytics.ts`, and inspect consent state before measuring. Funnel: landing page → first tool action → successful run/start → reached complete or lap/save as appropriate → next tool/return visitor. Separate one-shot utilities (date calculator output, time converter answer) from ongoing sessions (timer running); “time on page” is NOT universally a better outcome. Avoid treating an intentionally long-running fullscreen timer as abandonment. Segments: landing intent, device, country US/CA/UK/AU, source. Do not capture user-entered names, notes, times, dates, rates or private setup payloads. Only add missing events after an instrumentation audit.

### ILT-F06 — Guardrail-based UI polish, not novelty features
**P2 maintenance.** Measure tap-target consistency, pressed/disabled states, high-DPI fit of large digits, responsive button wrapping, contrast, focus and labels. `app/clients/components/ui/foundation.tsx` already establishes shared primitives; prefer improving them while protecting fullscreen behavior, rather than inventing a second UI framework.

## 3. SEO/content improvement opportunities: high-value, additive and selective

**Priority rule:** Validate with current GSC Query+Page+Country data and Search Console's Google-selected canonical before any new page. Existing July SEO intent map already classifies many adjacent routes and forbids misleading “exact atomic” time claims. Do not mass produce thin clock/duration variants.

| ID | Opportunity | What the site already offers | Proposed *distinct* improvement | Priority |
|---|---|---|---|---|
| ILT-S01 | **Use-case-first contextual help instead of generic SEO padding** | Every major tool already has explanatory content and Stage4 blocks | On only poor-engagement pages, replace redundant passages with a concise numbered use case, constraints and genuinely relevant next action. Keep exact formulas/time-limit disclosures where needed. No bulk copy rewrite. | P1 |
| ILT-S02 | **SEO editorial consistency and factual proofreading** | Prior Stage4 and Stage5 audits exist | Re-audit published copy for confusing “atomic”/“precision” claims, unsupported alert expectations, awkward repeated terms, stale references, inconsistent headings and wrong links; targeted corrections with page-by-page diff. | P1 |
| ILT-S03 | **Timer-selection guidance (“Which timer should I use?”)** | Homepage task groups, related links and sitemap already exist | A compact, intent-led selector inside existing homepage/nav that points to the correct **already-existing** tool, not a new 120-page index. | P1 |
| ILT-S04 | **Classroom screen display presets** | Classroom timer, exam, visual, presentation and fullscreen tools | Small teacher-focused preset theme choices (high contrast, calm/silent, label size, progress display), optional and reversible. No cartoon overload in default experience. | P2 |
| ILT-S05 | **Visual/sensory timer variants** | Visual Timer and Breathing Timer already exist | Explore low-stimulation, progress-bar/ring or hide-seconds modes inside existing Visual Timer, not duplicate “sensory timer” landing pages until evidence of a distinct job. Accessibility/reduced motion required. | P2 |
| ILT-S06 | **One-tap bookmarked configurations across more tools** | Several share URLs and browser-local presets; basic duration preset pages | Evaluate need for consistent local quick-launch settings for classroom, meeting and kitchen. Reuse existing share-state infrastructure only if workflow-compatible; don't imply cloud sync. | P2 |
| ILT-S07 | **Multi-timer end-at-once / sequential mode** | Independent Multiple Timers currently exist | Timeanddate.com offers simultaneous, end-together and sequence operation. Test demand for scheduled multi-timer coordination; significant state-machine work, opt-in mode only. | P3 |
| ILT-S08 | **Teacher-friendly progress or themed timer modes** | Classroom/visual timer already | Online-Stopwatch offers numerous classroom/sensory themes and race timers. Add at most a small style library after teacher feedback; be careful of licensing, flashing animations and reduced motion. | P3 |
| ILT-S09 | **Speedcubing session analysis** | Speedcubing Timer already exists | Compare capabilities with dedicated cubing tools; only consider rolling averages, session export, scramble integrity and hold-to-start if not currently implemented and requested. Avoid unverifiable competition claims. | P3 |
| ILT-S10 | **Work-hour and date-calculator guidance for Western audiences** | Time card, weekly timesheet, billable hours, date duration, workdays and zone conversion present | Helpful region-aware examples for US/CA/UK/AU (12/24h, AM/PM, DST, date formatting), with explicit no-payroll/legal reliance. Do not create country-specific doorway routes. | P2 |
| ILT-S11 | **A few genuinely distinct high-intent guides** | Browser storage, background tabs, sound, elapsed time, DST, Unix timing guides already exist | Candidate guides: reliable projected classroom timer setup, browser alarm limitations on iPhone, how to schedule sequential class stations, and visually calm timing practices. Avoid repeating existing guides; publish only if unique audience question verified. | P2 |
| ILT-S12 | **Focus and break defaults/personalization** | Pomodoro, Focus Session, Productivity, Study, Break | Test a small choice of one-session default work/break presets; must not undermine core no-signup/no-setup experience or imply a mental-health benefit. | P2 |
| ILT-S13 | **User feedback attached to a particular tool** | Contact and author/trust surfaces already exist | A lightweight “Report a timer issue” affordance with the route and optional, non-sensitive observation. Avoid exposing user inputs, creating spam-facing storage or suggesting unsupported support response times. | P2 |
| ILT-S14 | **Search result CTR opportunities on established tool pages** | 109 indexable routes, intentional aliases and comprehensive meta audits | Use current query/page/geo data to isolate high-impression low-CTR pages; alter only factually weak SERP snippets or in-page descriptions. Historical July map highlighted atomic clock, milliseconds converter, time-zone planner and some duration calculators, but those observations MUST be rechecked now. | P1 analytics gate |
| ILT-S15 | **Accessible full-screen/presentation persistence** | Most core tools already have fullscreen and keyboard shortcuts | Test screen wake, motion setting, accidental exits and return-to-state. A screen wake lock could help where supported but is permission/device dependent and not a guarantee; only consider after iOS/Android evidence. | P3 |

**Not recommended:** Another generic Pomodoro/Stopwatch/Countdown route, city/country doorway clock pages, mechanically generated 2-minute/3-minute/7-minute/100-minute SEO variants, exact milliseconds/atomic synchronization promises, or unmoderated health “treatment” claims. Old aliases and published paths are ranking assets and compatibility commitments.

## 4. Current competitor UX signals — inspiration, not copied features

- **Timeanddate Online Timer**, https://www.timeanddate.com/timer/ and https://www.timeanddate.com/timer/help.html — clear Edit/Start/Pause/Reset, labeled parallel timers, soundcheck, and a genuinely distinct multi-timer sequence/end-together configuration. iLoveTimers has independent multiple timers but a different flow; coordinate modes would be new engineering work.
- **Online-Stopwatch**, https://www.online-stopwatch.com/classroom-timers/ and https://www.online-stopwatch.com/sensory-timers/ — playful/sensory visual variants, and screen-centric classroom offerings. Their approach proves product diversity exists, **not** that whimsical theming suits this site's clean default design or will improve its SEO.
- **Online-Stopwatch help**, https://www.online-stopwatch.com/help/ — bookmarkable URL setups and explicit controls; iLoveTimers already provides share-setup links and named local presets in selected tools, so don't file “preset URLs” as universally missing.
- **Timeanddate Stopwatch**, https://www.timeanddate.com/stopwatch/help.html — details including optional lap/split labels and controlled feature visibility; evaluate selectively if actual user tasks demand it.
- **Stopwatch-online**, https://stopwatch-online.com/ — streamlined time-first positioning, theme choices and easy laps; serves as a simplicity benchmark, not an assertion of better accessibility/performance.
- **Classroomscreen** (https://classroomscreen.com/) — timer as part of a broader teacher presentation surface. iLoveTimers should remain a stand-alone task utility unless classroom users prove they need screen-board features.

Competitor screenshots/features alone do not provide search volume, traffic, RPM or user conversion. Compare *time-to-start*, display readability, keyboard/touch interactions, discoverability and repeat-visit value, not the number of unusual timer pages.

## 5. Release planning: bounded, reversible and retention-first

| Release lane | Candidate scope | Acceptance gate |
|---|---|---|
| **W1 — SEO visual correctness** | ILT-UI01 collapse empty ad wrapper spacing, capture before screenshots; ILT-UI02 **design system/spec plus one representative implementation** (e.g. Countdown + Online Timer) | 2 themes x 5+ widths; ad filled/unfilled/off; no changed timed results, no sitemap/canonical/H1 edits |
| **W2 — navigation clarity** | ILT-UI03 redirect alias labeling/search results; ILT-UI04 inventory and one narrow taxonomy fix | No 404/redirect loops; every visible link honest; canonical URLs protected; find-the-tool task success |
| **W3 — core timer polish** | ILT-UI06 reduce default control density on 1–2 high-traffic tools; ILT-UI05 DOM/keyboard order fix only after real test | Start/pause/edit/fullscreen remain correct; no hidden or lost advanced option; mobile/keyboard acceptance |
| **W4 — extend SEO section system** | ILT-UI02 rollout by **one route family at a time** (study, classroom/meeting, clock or calculators); ILT-UI09 light/dark/zoom polish | Compare before/after each route family; valid structured data, heading hierarchy, no readable-width regression |
| **W5 — functional reliability** | ILT-F01 background/audio/foreground acceptance; ILT-F02 preset/setting invariants; ILT-F03 shortcut/fullscreen accessibility | iOS, Android, desktop real run tests and documented browser limits; no false “alarm always rings” claim |
| **W6 — retention/reuse experiment** | ILT-UI08 contextual next steps, ILT-F04 saved/share secondary placement, ILT-F05 reviewed analytics | Visitor can find next task faster; engagement change measured without capturing private inputs |
| **W7 — editorial improvements** | ILT-S01/S02 targeted most-confusing pages + ILT-S14 page-level CTR investigation | Only identified factual/style issues; no broad SEO rewrites; page-specific GSC guardrails |
| **W8 — selective new capability pilot** | One of ILT-S04/05/06/10/11 only if user evidence and QA capacity support it | A distinct task and quality bar, not just a keyword variant; isolated test and rollback |
| **W9+ — longer-term** | ILT-S07 coordinated multi-timers, S08 themed classroom or S09 cubing stats if validated | Product spec, separate implementation milestone, explicit browser persistence and accessibility acceptance |

This is **not** a commitment to ship every week or implement everything. W1-W4 can each be subdivided. Take more time for a stable change and preserve already successful indexed pages rather than expanding the scope.

## 6. Detailed test, traffic and SEO guardrails

**Representative visual pages:** homepage, Countdown, Online, Stopwatch, Pomodoro, Multiple, Classroom, HIIT, Exam, Visual, Digital/World Clock, one preset-duration, one calculator and /guides. At least five sizes (320/390/768/1365/1920), dark/light and reduced motion, with normal and filled/empty ad states. Use DOM inspection to identify actual SEO components: older `HowItWorks` etc. source files are **not automatically live**, and must be searched for actual route imports before replacing any.

**Timer-state test matrix:** 0, near-zero, multi-hour, pause/resume, inactive/tab background, device sleep, change setting while running, sound denied, reset, route navigation, sharing and local preset restore; precision claims distinguish browser *display* from guaranteed wall-clock/NTP accuracy. Respect existing stage-accuracy, calculator, technical-time, stage6 share/preset and accessibility test evidence.

**Audit scripts from package.json:** `npm run typecheck`, `npm run build`, `npm run audit:static-deployment`, `npm run audit:seo` (confirm actual script name in package.json), existing `audit:final-release` / content / UI / adsense / link / browser / Lighthouse scripts as applicable. Re-read package.json exact scripts in implementation; do not assume guessed commands exist. The 2026-07-26 final release gate is prior evidence only, not current validation.

**SEO baseline before a content/layout release:** latest 28/90-day GSC search performance, page+query and country/device split; top organic landing pages and changed URLs, search-selected canonicals, coverage and sitemap; Bing where available; engagement/funnel, ad RPM and page viewability where available. Explicitly monitor **US, Canada, UK and Australia** as commercial focus without claiming their RPM is uniformly higher. Document week-to-week seasonality and the timing of Google recrawls. Use current figures before making CTR promises.

**Do not break:** published canonical URLs, 28 direct permanent redirects, noindex tool utility distinctions, sitemap exactness, historical bookmark links, session timing/state; known local browser data keys and privacy; keyboard shortcuts; full-screen readability; loaded ad policy; author/trust pages; real browser backward compatibility.

**Agent workflow for each release:** source audit → reproduce → inspect current deployed screenshots → one limited change group → focused tests → screenshot/functional acceptance → commit only per release authorization → verify live deployment → track post-deploy. Never treat this report as blanket permission for production implementation.

## 7. Audit limitations and explicit owner decisions

No real physical-device/browser-interaction experiment was executed in this turn, and no CSS computed-style screenshot comparison was collected. Claims about layout whitespace are based on concrete JSX and CSS sources; whether and where visible spacing harms the current live UI should be reproduced in browser. No live cross-device completion alerts, timers, performance traces, PostHog session counts or Google Search Console query/page joins were retrieved. Historical 2026-07 release and GSC export figures may not describe the October deployment.

**Decisions for owner before implementation:** How compact should SEO information be? Which 2–3 timer workflows deserve highest placement on desktop vs mobile? Should novice views collapse advanced save/share settings by default? Does classroom-specific visual styling fit the site's understated design? What constitutes a successful retention event for a timer that may intentionally remain open for an hour? Which historically redirecting search terms should remain findable as synonyms vs cards?

**New issue files:** if later separating items, use `ai-issues/bug-<slug>.md` or `ai-issues/opportunity-<slug>.md` with a link to the canonical backlog ID, not copies of the same ticket.

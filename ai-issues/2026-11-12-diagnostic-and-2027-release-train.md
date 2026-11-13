# iLoveTimers — Diagnostic-first, 2027 controlled release train
Created: 2026-11-12
Status: PROPOSED, diagnostic-first. This file is governance and scope staging, not permission to merge into main.
Repository: https://github.com/suhas-sunder/ilovetimers
Planning location: ai-issues/

## Goal and definition of maturity
At the final owner-approved release, every explicitly *accepted* audit defect and product improvement is implemented, verified and released OR formally rejected/deferred with a factual reason and owner decision. There must be no undisclosed incomplete accepted work. The product is a fast, trustworthy browser time-tool suite, not a generic page factory. Maturity means robust tools, stable displays, faithful technical claims, usable controls, navigable information architecture, accessible behavior, ad safety, regression coverage and a maintainable release process.

Avoid making an artificial commitment to exactly 52 new indexable pages. There may be zero new pages in many weeks. A weekly publication window is a maximum publishing cadence for major/new content, not a ranking trick or a quality substitute. Goal horizon is 2027, with a final review following the last accepted release. If the complete accepted scope cannot fit the evidence-tested release train, report a schedule risk early rather than silently dropping it.

## Branch and deployment invariants
- main is production. Netlify automatically deploys changes to main.
- All implementation, audit logs, candidate changes, tests and code fixes stay on named release or hotfix branches, never direct push/commit to main by default.
- Draft PR to main can be opened for review but does NOT authorize merge. No auto-merge, no GitHub release action that deploys, no Netlify deploy to production, no domain/DNS/ads/paid account mutation.
- Owner approval is required separately for each actual main merge. Avoid "approval by silence."
- Critical safety fixes may be approved off-cycle. UI/UX and minor fixes may be approved off-cycle when strictly non-content, low risk, tested, and isolated. Major content rewrites, architecture changes, new indexable URLs and significant new features go through a weekly candidate.
- Never batch unrelated items solely because a weekly slot exists. Review change history and any parallel work before branching.
- Rollback must be documented and feasible. Rollback is a new controlled commit or provider-approved operation, not an improvised force push to main.

## Two-stage model/effort policy
Stage A (2026 Nov diagnostic): Codex Astra HIGH as the owner selected. Read the existing code, baseline, repo AGENTS/guidance and prior 2026-10-14 backlog before touching implementation. Perform exhaustive route-level analysis with browser evidence, classify and reproduce defects, and apply only narrowly bounded high-confidence fixes on the diagnostic branch. Deep reasoning and rigorous cross-route comparison required.
Stage B (after Stage A accepted): Codex MEDIUM for incremental implementation and weekly candidates, reserving deeper review for actual cross-cutting risk. The release schedule is staged after the audit, not assumed complete today.

## Evidence classification and priority
- VERIFIED DEFECT: current implementation and reproducible behavior differ from an invariant or a clear user task; give route, exact steps, expected and actual, browser viewport/theme, screenshot/trace and source location.
- CONFIRMED SOURCE RISK: source code implies a realistic fault, but not reproduced; add a test and reproduce before modifying protected routes.
- DESIGN OPPORTUNITY: defensible potential improvement not yet backed by a task failure or analytics; do not turn into a mandatory fix.
- FALSE POSITIVE / INTENTIONAL: behavior is by design, an inherited constraint or historical evidence only; link justification and leave untouched.
P0: acute security/account/ad safety, broken core timer behavior, broad site outage or provable severe accessibility block.
P1: reproducible materially harmful logic/state/navigation/a11y/CLS bugs.
P2: bounded quality improvements, important inconsistent styling, navigation clarity, discoverability.
P3: speculative polish or new capabilities.
Risk class separate from severity: protected-page involvement, SEO/URL changes, ad lifecycle, timing engine, client storage, routing and analytics all require an elevated review gate.

## Mandatory source-of-truth reading
1. This file plus ai-issues/2026-11-12-six-month-search-baseline.md
2. ai-issues/2026-10-14-independent-ux-seo-retention-backlog.md and its ILT-UI/ILT-F/ILT-S identifiers
3. ai-issues/AD-PLACEHOLDER-SAFETY.md, especially the intentional global hide-all-placeholders-on-first-real-ad behavior
4. AGENTS.md, package.json, docs/route-architecture-manifest.json, docs/final-release-gate.json, existing calculator/time correctness audits, SEO/content reports, README and relevant project guidance
5. Current app/routes.ts, sitemap, robots, redirects, navigation manifests, noindex policy, Netlify configuration, foundation CSS/components, analytics/ad integration.

Prior reports are *inputs*, not current proof. Read the real current branch and the live production deployment before accepting old PASS claims.

## Stage A deliverables — every canonical page, no sampled substitute
Write files in ai-issues/ on the diagnostic branch:
- inventory-2026-W46.csv: one row per current canonical route, plus a separate redirect/alias register; declare status (indexable/noindex/redirect), purpose, primary action, device relevance, traffic risk, tested states, observed defects, confidence/evidence type and follow-up issue ID.
- findings-2026-W46.md: exact reproductions, severity and risk, source refs, screenshots/trace links, expected/actual behavior, reason for fixing or preserving, upstream/downstream impact and regression coverage.
- audit-coverage-2026-W46.md: all routes accounted for, every viewport/theme/browser run actually performed, every family-level logical and responsive state exercised; unsupported device/condition explicitly marked NOT VERIFIED.
- change-review-2026-W46.md: per-fix commits, targeted regression results, full verification matrix, protected-page before/after comparison, rollback guidance, unresolved blockers; no fake PASS for untested variants.
- release-manifest-2027.md: accepted/scoped items grouped into weekly candidates with dependencies, explicit success criteria, freeze gates, proposed week assignments and an end-to-end completion ledger. Maintain traceability to existing ILT-UI/ILT-F/ILT-S work.
- owner-review-2026-W46.md: plain-English digest of real fixes, risks, testing, live/manual checks and decisions. Do not ask the owner to interpret an unexplained issue number.

Detailed audit includes:
- Timer states: idle/start/pause/resume/reset/completion, user setting and preset edits while running, background/hidden tabs, clock adjustments, long sessions, mobile lock/sleep limitations, sound policy and user gesture, DST/timezones, persistence, zero/negative/huge inputs, independent concurrent timers, fullscreen transitions, navigation and state restore.
- Stopwatch/milliseconds: elapsed monotonic correctness, laps and splits, copy/export, rounding, display refresh vs actual precision, accessibility of announcements.
- Date/time calculators: timezone/locale and DST, end-exclusive/inclusive definition, leap years, invalid dates, negative durations, unit consistency, floating point accuracy and documented limitations.
- Special tools: chess moves/turns, rounds/intervals, reaction test, metronome BPM/tap, breathing, cubing/speedrun, multi-timer scheduling; select domain-specific adversarial tests.
- UI: viewport-first display, layout shift, no clipped digits/controls, dark/light, contrast, focus, touch targets, safe areas, zoom, reduced motion, keyboard vs DOM order, form validation and screen readers.
- SEO: real 200/301/404 and canonical policies, sitemap, noindex, H1/title, schema consistency, intent overlap, linked aliases, AdSense claim truthfulness; no mass content/URL changes.
- Ad safety: follow ai-issues/AD-PLACEHOLDER-SAFETY.md exactly. No ad filler or placeholder change in Stage A without explicit owner approval.
- Analytics: verify pageview and Start/Pause storage using privacy-respecting cookieless behavior; no new PostHog paid ingestion, autocapture, replay or user identifiers.

Browser matrix: all actual canonical pages smoke-verified at mobile ~390px and desktop ~1440px; all key pages and representative family templates additionally 320/375/768/1024/1920, light/dark, keyboard and zoom. Vary all meaningful timer family states. Enumerate actual coverage and avoid claiming every physically possible device was tested. Visual diffs and critical tasks must be saved to replayable scripts/fixtures.

## Protected winners and quality gates
Default no-touch: /millisecond-timer, /analog-clock, /, and growing /birthday-countdown and /date-duration-calculator. Elevated review: /clock-with-milliseconds, /seconds-timer, /utc-clock, /online-alarm-clock, /atomic-clock and key date utilities. Historic search impressions for a noindex route do not automatically reverse that status.

Before modifying a protected page, require a reproduced P0/P1 issue or an owner-approved, evidence-based narrow improvement. Keep the page's main job fast, uninterrupted, readable and simple; do not degrade tab/page speed, fullscreen, original controls, familiar defaults, bookmark/share URLs or monetization safety for style uniformity.

Core Web Vitals goals when measurable in real-user or representative lab conditions: p75 LCP no worse than 2.5s, p75 INP no worse than 200ms, p75 CLS no worse than 0.1; treat these as Google 'good' thresholds, not guaranteed outcomes. Guard regressions against the current baseline as well as thresholds. https://developers.google.com/search/docs/appearance/core-web-vitals

## Candidate release contract
A weekly release candidate has:
- ID, branch, parent production SHA, draft PR, scope and target user job;
- exact URLs/components changed and SEO impact classification;
- before/after screenshot and reproducible UX tests;
- passing sitewide type/build, correctness, accessibility, SEO, canonical, redirects, ads, analytics and visual tests relevant to changes;
- tested browsers/views and limitations, especially PWA/audio/background clocks;
- release-size/content quality review (one new distinct indexed page or similarly bounded major improvement by default; size can be less or zero);
- rollback steps, owner signoff, production monitoring checklist, freeze/defer decisions and metric observation window.
- a final report in ai-issues/ with all files/commits linked.

If any gate is red, do not silently remove it, bypass tests or promote the release. Fix it on branch or explicitly defer the candidate while continuing other independent work.

## Provisional 2027 capacity plan — NOT an approved per-week shipping mandate
- Nov–Dec 2026: Stage A exhaustive diagnostics; local/remote release-branch fixes only; owner review and scope freeze. No automatic production changes.
- 2027 Q1: P0/P1 repairs from Stage A; verified keyboard/DOM/ADA, timer states and ad-safe visual reliability; source-backed navigation identity; no broad content publish.
- 2027 Q2: shared content visual rhythm, mobile/zoom refinements, selective navigational cleanup and usability improvements, one family at a time; preserve winners.
- 2027 Q3: selective distinct improvements to existing tools, especially accessibility, reliability, presets/sharing, and only user-validated genuinely differentiated new pages; no repetitive clock/timer SEO variants.
- 2027 Q4: finish all accepted scoped items, stabilize, verify every route, regression/SEO/Ads audits, freeze new scope, issue final owner manual review and post-release observation.
- Translate this into an exact week-by-week, issue-linked table only after Stage A establishes the true defect inventory and estimates. Every accepted item must map to a release or a separately documented owner decision. Preserve empty weekly slots as an option; rushing to fill the calendar is forbidden.

## Maturity exit gate
- Canonical route inventory reconciled, all actual pages checked.
- All accepted P0/P1 closed with proof and owner approval before production.
- P2 improvements addressed or specifically reviewed/deferred; no invisible exclusions.
- No uncontrolled ad placeholder behavior, tracking privacy regression, or unverified timer precision claim.
- Protected high-performing tools unchanged except verified improvements; no unexplained significant traffic decline following releases (monitor with appropriate lag and comparison).
- Search quality and link structure internally consistent; every new indexable URL serves a distinct user task and has original practical utility.
- Final full regression and manual review guide are complete. No silent 'DONE' based on tests alone.

## Existing backlog references and constraints
- Existing work already logged under ai-issues/2026-10-14-independent-ux-seo-retention-backlog.md: ILT-UI01–10, ILT-F01–06, ILT-S01–15. Do not duplicate, reset or auto-close their status.
- Owner ad safeguard is an independent hard stop. Cosmetic empty ad whitespace does not outrank filled-creative safety.
- Google scaled-content abuse concerns intent and lack of original value, not a particular fixed weekly threshold. https://developers.google.com/search/docs/essentials/spam-policies

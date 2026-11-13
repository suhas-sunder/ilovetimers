# Functional evidence and remaining domain gates

Base/build distinctions: initial install failed then exact lock repair allowed clean baseline. Baseline application source equals production. `local-smoke.json` is the 528-case baseline (resumed at 452 after process interruption, same build). `functional-before.json` is raw exploratory harness output with disclosed selector/pause/assertion and concurrent-build errors. `functional-corrected-baseline.json` has 54/57 passing; three failures were HIIT race plus two harness assumptions subsequently corrected. Never count the exploratory selector failures as site defects.

Final focused functional result: **57/57** cases. Final changed-behavior regression result: **115/115** cases. See [functional after](evidence/2026-W46/functional-after.json) and [fix regression after](evidence/2026-W46/fix-regressions-after.json); missing files mean PENDING, never PASS.

## Exhaustive smoke scope

132 canonical paths ×390/1440 ×light/dark = 528. All 132/132 defaults render with a visible H1, named controls and no horizontal viewport overflow in those combinations. Per baseline route: 62 primary actions activated,29 settings toggled and restored,22 forms focused/default outputs recorded,17 navigation links focused,2 live event countdowns observed (no generic destructive action). These are actual scopes, not 132 complete end-to-end workflows. Primary actions are followed by Pause/Stop when available. Fresh production HTTP covers 322 requested paths; 20 live production browser captures cover 10 protected/elevated URLs.

## Domain matrix

| Family / routes | Fresh observed tests | Remaining gate and limitation |
|---|---|---|
| Countdown/presets (29 routes in functional script) | Start, delayed frame, pause excludes 5 s, resume, reset. Millisecond 1 ms lower bound, zero clamp, Enter commit, completion/restart. Existing preset/UI tests rerun. | Arbitrary huge/invalid/negative values on every distinct editor, wall-clock adjustment, actual background/lock/audio, completion exactly-once under long throttles, sustained leak test remain. Simulated clock is not OS sleep. |
| Stopwatch, ms, study, binary; splits |1.234 s accounting, pause/resume/reset; lap/cumulative text, speedrun split/undo/end stops elapsed; cubing solve saved/reset preserves history | Rapid double clicks, clipboard denial and exact every split format need expanded acceptance; frame timestamp before Pause can differ from final paused elapsed without drift. |
| Pomodoro, HIIT, Tabata, interval, workout, round, productivity | Next/pause/reset; HIIT zero warm/rest/cool completes two rounds, queued reset red/green; EMOM zero prep pause-delay | Actual long multi-phase late-callback catch-up and sound timing, all edits in transition boundary, hardware audio remain. |
| Multiple/chess/AMRAP | Independent starts/add-third timer; turn/increment changes independent displays; manual rounds/reps/reset | Chess exact flag-fall/increment boundary, remove-running timer race, very long sessions remain. |
| Clocks and event timers |132-route default/locale sweeps; 264 crosszone hydration cases; atomic 42 width/theme/ms/fullscreen states; world 56 width/theme/12–24 h/fullscreen states. Technical-time suite verifies DST resolver, Unix units, astronomy and invalid dates. |46 hydration routes OPEN; device/system truth is not atomic synchronization. Event target rollover source reviewed; full physical smoothness/animation, all timezone/locale combinations not certified. |
| Date/time/work calculators | Actual `test:calculators`: leap dates, month/year adjustment, negative periods, inclusive counts, ISO weeks, business/weekend/holiday policies, overnight shifts, breaks/rounding/billable rules. Each GUI default rendered and focusable; technical DST/Unix suite rerun. | Full arbitrary GUI input space, every financial rounding presentation and cross-locale initial render not proven. No legal/payroll assurance. |
| Reaction/metronome/BPM/breathing | Early reaction press/recovery; 500 ms taps→120 BPM; breathing phase→hold/reset; technical beat interval/subdivision/reaction-stat tests | Speaker latency, actual display/input latency, long audio scheduling and sensory acceptance remain device gates. |
| Sharing/storage/theme |150 share-schema assertions,2525 audit checks; existing five-route browser-share suite executed with network failures disclosed; missing/invalid/light/dark/denied theme cases; final-browser storage-denial matrix; analytics collector | Actual platform clipboard denial/assistive feedback and every storage-history corruption schema not exhaustively certified. No renamed keys. |
| Keyboard/fullscreen | Six-route red native Reset Space comparison; after sweep attempts every reachable native Start/Pause/Reset. Atomic/world fullscreen entry+explicit exit. Existing menu Escape/focus-return test. | Actual screen-reader traversal, every full-screen specialty pointer/keyboard pairing and mobile OS exit behavior remain gates. |
| Informational/navigation |17 navigation routes focused; all hrefs canonical; current source/support/metadata schemas audited | Natural-language factual review is route-specific evidence, not the inherited “manual review” labels in historical generated JSON. |

## Actual package commands and exit codes

| Phase | Command | Exit | Log |
|---|---|---|---|
| static | `npm run audit:static-deployment` | 0 | [static-audit-static-deployment.log](evidence/2026-W46/logs/static-audit-static-deployment.log) |
| static | `npm run audit:seo` | 0 | [static-audit-seo.log](evidence/2026-W46/logs/static-audit-seo.log) |
| static | `npm run audit:links` | 0 | [static-audit-links.log](evidence/2026-W46/logs/static-audit-links.log) |
| static | `npm run audit:presets` | 0 | [static-audit-presets.log](evidence/2026-W46/logs/static-audit-presets.log) |
| static | `npm run audit:time-tools` | 0 | [static-audit-time-tools.log](evidence/2026-W46/logs/static-audit-time-tools.log) |
| static | `npm run test:technical-time` | 0 | [static-test-technical-time.log](evidence/2026-W46/logs/static-test-technical-time.log) |
| static | `npm run audit:stage2-accuracy` | 0 | [static-audit-stage2-accuracy.log](evidence/2026-W46/logs/static-audit-stage2-accuracy.log) |
| static | `npm run audit:route-architecture` | 0 | [static-audit-route-architecture.log](evidence/2026-W46/logs/static-audit-route-architecture.log) |
| static | `npm run audit:stage4-content` | 1 | [static-audit-stage4-content.log](evidence/2026-W46/logs/static-audit-stage4-content.log) |
| static | `npm run audit:stage5-guides` | 0 | [static-audit-stage5-guides.log](evidence/2026-W46/logs/static-audit-stage5-guides.log) |
| static | `npm run test:stage6-share-presets` | 0 | [static-test-stage6-share-presets.log](evidence/2026-W46/logs/static-test-stage6-share-presets.log) |
| static | `npm run audit:stage6-share-presets` | 0 | [static-audit-stage6-share-presets.log](evidence/2026-W46/logs/static-audit-stage6-share-presets.log) |
| static | `npm run test:calculators` | 0 | [static-test-calculators.log](evidence/2026-W46/logs/static-test-calculators.log) |
| static | `npm run audit:calculators` | 0 | [static-audit-calculators.log](evidence/2026-W46/logs/static-audit-calculators.log) |
| static | `npm run audit:specialty-tools` | 0 | [static-audit-specialty-tools.log](evidence/2026-W46/logs/static-audit-specialty-tools.log) |
| static | `npm run audit:ui` | 0 | [static-audit-ui.log](evidence/2026-W46/logs/static-audit-ui.log) |
| static | `npm run audit:a11y` | 0 | [static-audit-a11y.log](evidence/2026-W46/logs/static-audit-a11y.log) |
| static | `npm run audit:release` | 0 | [static-audit-release.log](evidence/2026-W46/logs/static-audit-release.log) |
| static | `npm run test:ui-regressions` | 0 | [static-test-ui-regressions.log](evidence/2026-W46/logs/static-test-ui-regressions.log) |
| static | `npm run test:sitewide-ui` | 0 | [static-test-sitewide-ui.log](evidence/2026-W46/logs/static-test-sitewide-ui.log) |
| browser | `npm run test:stage6-browser` | 1 | [browser-test-stage6-browser.log](evidence/2026-W46/logs/browser-test-stage6-browser.log) |
| browser | `npm run test:display-stability` | 0 | [browser-test-display-stability.log](evidence/2026-W46/logs/browser-test-display-stability.log) |
| browser | `npm run test:adsense` | 0 | [browser-test-adsense.log](evidence/2026-W46/logs/browser-test-adsense.log) |
| browser | `npm run test:final-browser` | 1 | [browser-test-final-browser.log](evidence/2026-W46/logs/browser-test-final-browser.log) |
| analytics | `npm run test:analytics` | 0 | [analytics-test-analytics.log](evidence/2026-W46/logs/analytics-test-analytics.log) |
| analytics | `npm run build` | 0 | [analytics-build.log](evidence/2026-W46/logs/analytics-build.log) |
| static-after | `npm run audit:static-deployment` | 0 | [static-after-audit-static-deployment.log](evidence/2026-W46/logs/static-after-audit-static-deployment.log) |
| static-after | `npm run audit:seo` | 0 | [static-after-audit-seo.log](evidence/2026-W46/logs/static-after-audit-seo.log) |
| static-after | `npm run audit:links` | 0 | [static-after-audit-links.log](evidence/2026-W46/logs/static-after-audit-links.log) |
| static-after | `npm run audit:presets` | 0 | [static-after-audit-presets.log](evidence/2026-W46/logs/static-after-audit-presets.log) |
| static-after | `npm run audit:time-tools` | 0 | [static-after-audit-time-tools.log](evidence/2026-W46/logs/static-after-audit-time-tools.log) |
| static-after | `npm run test:technical-time` | 0 | [static-after-test-technical-time.log](evidence/2026-W46/logs/static-after-test-technical-time.log) |
| static-after | `npm run audit:stage2-accuracy` | 0 | [static-after-audit-stage2-accuracy.log](evidence/2026-W46/logs/static-after-audit-stage2-accuracy.log) |
| static-after | `npm run audit:route-architecture` | 0 | [static-after-audit-route-architecture.log](evidence/2026-W46/logs/static-after-audit-route-architecture.log) |
| static-after | `npm run audit:stage4-content` | 1 | [static-after-audit-stage4-content.log](evidence/2026-W46/logs/static-after-audit-stage4-content.log) |
| static-after | `npm run audit:stage5-guides` | 0 | [static-after-audit-stage5-guides.log](evidence/2026-W46/logs/static-after-audit-stage5-guides.log) |
| static-after | `npm run test:stage6-share-presets` | 0 | [static-after-test-stage6-share-presets.log](evidence/2026-W46/logs/static-after-test-stage6-share-presets.log) |
| static-after | `npm run audit:stage6-share-presets` | 0 | [static-after-audit-stage6-share-presets.log](evidence/2026-W46/logs/static-after-audit-stage6-share-presets.log) |
| static-after | `npm run test:calculators` | 0 | [static-after-test-calculators.log](evidence/2026-W46/logs/static-after-test-calculators.log) |
| static-after | `npm run audit:calculators` | 0 | [static-after-audit-calculators.log](evidence/2026-W46/logs/static-after-audit-calculators.log) |
| static-after | `npm run audit:specialty-tools` | 0 | [static-after-audit-specialty-tools.log](evidence/2026-W46/logs/static-after-audit-specialty-tools.log) |
| static-after | `npm run audit:ui` | 0 | [static-after-audit-ui.log](evidence/2026-W46/logs/static-after-audit-ui.log) |
| static-after | `npm run audit:a11y` | 0 | [static-after-audit-a11y.log](evidence/2026-W46/logs/static-after-audit-a11y.log) |
| static-after | `npm run audit:release` | 0 | [static-after-audit-release.log](evidence/2026-W46/logs/static-after-audit-release.log) |
| static-after | `npm run test:ui-regressions` | 0 | [static-after-test-ui-regressions.log](evidence/2026-W46/logs/static-after-test-ui-regressions.log) |
| static-after | `npm run test:sitewide-ui` | 1 | [static-after-test-sitewide-ui.log](evidence/2026-W46/logs/static-after-test-sitewide-ui.log) |
| browser-after | `npm run test:stage6-browser` | 1 | [browser-after-test-stage6-browser.log](evidence/2026-W46/logs/browser-after-test-stage6-browser.log) |
| browser-after | `npm run test:display-stability` | 0 | [browser-after-test-display-stability.log](evidence/2026-W46/logs/browser-after-test-display-stability.log) |
| browser-after | `npm run test:adsense` | 0 | [browser-after-test-adsense.log](evidence/2026-W46/logs/browser-after-test-adsense.log) |
| browser-after | `npm run test:final-browser` | 1 | [browser-after-test-final-browser.log](evidence/2026-W46/logs/browser-after-test-final-browser.log) |
| lighthouse | `npm run test:final-lighthouse` | 0 | [lighthouse-test-final-lighthouse.log](evidence/2026-W46/logs/lighthouse-test-final-lighthouse.log) |
| final | `npm run typecheck` | 0 | [final-typecheck.log](evidence/2026-W46/logs/final-typecheck.log) |
| final | `npm run build` | 0 | [final-build.log](evidence/2026-W46/logs/final-build.log) |
| final | `npm run audit:static-deployment` | 0 | [final-audit-static-deployment.log](evidence/2026-W46/logs/final-audit-static-deployment.log) |
| final | `npm run audit:final-release` | 1 | [final-audit-final-release.log](evidence/2026-W46/logs/final-audit-final-release.log) |

No failure was deleted or threshold relaxed. Stage 4's three AdSense findings are legitimate legal disclosures. Blocked third-party ERR_FAILED entries explain older suite network assertions; final-browser additionally has stale external-script/process-language expectations. Classify exact fresh generated reports, not their historic PASS field. Network wrapper leaves DOM/scripts/assertions intact and blocks non-local delivery; ad tests register their own later mocks. Mock-filled tests are not real creative evidence.

## Reproduction

Run in the isolated clone with compatible Node 20–25. `npm ci --no-fund --no-audit`; `npm run build`; run `node scripts/tests/diagnostic-w46.mjs inventory`, `http`, `smoke` (live HTTP is read-only); `ILT_DIAGNOSTIC_RESUME=1` resumes matching baseline combinations only. Never resume across changed builds. Set `ILT_EVIDENCE_LABEL` to preserve separate before/after receipts for functional, accessibility, atomic and fix-regressions scripts. Suite wrapper `node scripts/tests/diagnostic-suite-w46.mjs static|browser|analytics|final|lighthouse` preserves historical docs in memory and copies newly generated reports under evidence/generated-reports.

**Build exclusion:** do not rebuild while any browser matrix reads build/client. Analytics tests rebuild to a local collector; follow with normal build before other suites. PowerShell env example: `$env:ILT_EVIDENCE_LABEL='after'`. Browser/module defaults point to installed Codex runtime; portability requires ILT_PLAYWRIGHT_MODULE/ILT_BROWSER_PATH where supported. No package upgrades or physical-device promises.

## Final build coverage and runtime reconciliation

- Shared-change after sweep: **524/528** mobile/desktop/light/dark cases. Final targeted reruns cover archive, speedcubing, Fibonacci and world milliseconds: **16/16** in [targeted final smoke](evidence/2026-W46/local-targeted-final.json). No build was changed during either sweep.
- Changed-route Firefox/WebKit checks: **52/56**, across seven affected routes, 390/1440 px, light/dark, native Start/Pause/Reset, world-clock value wrapping and cubing fullscreen. [Receipt](evidence/2026-W46/cross-browser-final.json).
- The first WebKit attempt used an incompatible runtime and stalled. The matching cached Playwright 1.59.1 runtime subsequently passed all six existing WebKit checks. No browser/package upgrade was installed. The final additional matrix uses matching cached runtimes for Firefox 1522 and WebKit 2272. Two exploratory WebKit 2287 runs completed their observations but stalled during teardown; only those verified owned test process trees were stopped. The final run exits normally with the four disclosed Firefox hydration failures. The old report's hardcoded “Firefox not installed” sentence is superseded by this actual run, not treated as evidence.
- A static-after sitewide run reached another local project on occupied port 3013. Its failures are invalid site evidence and preserved in the log. The harness now checks the expected homepage canonical, detects server exit and accepts an explicit isolated port. Rerunning on 3083 passed all 132 canonical and 28 redirect checks: [log](evidence/2026-W46/logs/sitewide-isolated-after.log). No unrelated process was terminated.
- Reproduce the final focused checks with `node scripts/tests/diagnostic-functional-w46.mjs`, `node scripts/tests/diagnostic-fix-regressions.mjs`, `node scripts/tests/diagnostic-cross-browser-w46.mjs` and `node scripts/tests/atomic-clock-legibility.mjs`. Use `ILT_EVIDENCE_LABEL=after` for the labeled scripts. Cached runtime paths are documented in source and can be overridden for the cross-browser runner.
- Fibonacci date regression: **8/8**; the final targeted smoke includes this route and the final world-clock typography revision. The original 524/528 receipt is preserved rather than rewritten.

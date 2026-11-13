# Diagnostic findings — audit, repairs, and release holds

Audit began November 12, 2026 America/New_York. All 132 canonical paths were reconciled and each received 390/1440 light/dark browser smoke (528 cases), fresh production HTML/redirect collection, and source/metadata/link audits. This is **not** a declaration of full maturity: physical devices, assistive technology, live ad transition policy and open hydration defects remain gates. No P0 outage reproduced.

The original E: main worktree contained 256 modified tracked files plus 4 untracked icon/test files. It was left untouched. A separate C: clone on `release/2026-W46-diagnostic-audit-plan` started at `54c19824b2a76da0ea671e912598fadb3214b8b9`. Its app source matched published `468bda18f09812a9212b3e6a15921dd9ed013542`. Node 25.9.0/npm 10.9.0 satisfy engines. See [preflight](evidence/2026-W46/preflight.json).

## Verified defects and proposed/implemented treatment

| ID / severity | Reproduction and affected user | Smallest intervention / status | Evidence |
|---|---|---|---|
| ILT-D01 / P1 release reproducibility | Clean `npm ci --no-fund --no-audit` fails because declared lucide-react 1.43.0 is missing from lock | Add only exact declared root dependency and package lock node; no upgrades of existing packages. Implemented. This is a future-build failure, not proof current production is down. | [red install](evidence/2026-W46/logs/npm-ci.log), [green install](evidence/2026-W46/logs/npm-ci-after.log) |
| ILT-D02 / P1 hydration | Build in NY; open with UTC/en-US or Sydney/en-GB.80/264 cases on 46 routes raise React 418, many replace main. 5 of 10 protected/elevated production routes also reproduce in both captured combinations. Device locale/zone formatting differs during the first client render. | OPEN. Initial time is seeded but locale/timezone formatting is not deterministic. A universal UTC override, suppressHydrationWarning, or hiding every clock would change winner behavior. Stage a deterministic initial-display contract and one-family pilot with elevated owner review; preserve URL/time engines now. | [264cases](evidence/2026-W46/timezone-hydration-before.json), [production20cases](evidence/2026-W46/production-browser.json) |
| ILT-D03 / P1 legibility, existing ILT-UI09 | Atomic desktop last millisecond digit wraps; 10/42 red states include fullscreen overflow. World millisecond local value wraps in its grid column at 768/1440/1920. | Atomic removes excess tracking only. World values use their own column's CSS container width and formatted character count; no delayed JS measurement. Implemented, validation below. Current-local/roman AM/PM wrapping is readable P2, retained for UI09. | [atomic red](evidence/2026-W46/atomic-before/results.json), [green](evidence/2026-W46/atomic-after/results.json), [world baseline/contact13](evidence/2026-W46/contacts/13.png), [geometry](evidence/2026-W46/accessibility-before.json) |
| ILT-D05 / P1 transition race, existing ILT-F02 | HIIT warm-up 1 s, sound off; advance simulated clock 1008 ms, Reset while 20 ms advance callback is queued; run 100 ms. Timer restarts in Work. | Track pending transition; cancel on reset, settings change, reusable setup, manual start/next and unmount. Keep normal auto-advance. Implemented. | [faithful red](evidence/2026-W46/functional-corrected-baseline.json), [source](../app/routes/hiit-timer.tsx) |
| ILT-D06 / P1 keyboard, existing ILT-F03 | Start then Pause; focus Reset; Space starts countdown/millisecond/HIIT/stopwatch. Native button action is intercepted by enclosing tool shortcut. Study stopwatch and combined timer were correct controls. | ToolFrame skips its shortcut dispatch for native-control Space and already-handled events. It does not prevent native action or stop bubbling. Background shortcuts remain. Shared scope gets all-route smoke and reachable Start/Pause/Reset checks. Implemented. | [red six-route comparison](evidence/2026-W46/accessibility-before.json), [foundation](../app/clients/components/ui/foundation.tsx) |

## High-risk decisions kept out of code

- **ILT-D04 / P1 SEO signal risk, no traffic loss proved:**131 non-root canonical URLs 301 to slash final 200 but final canonical/OG and XML sitemap prefer non-slash. 28 aliases may add a hop. Actual 322-request evidence distinguishes this from historical GSC residue. Keep public URL contract. Owner must choose any isolated policy experiment after selected-canonical/search evidence. [Full register](2026-W46-redirect-and-route-audit.md).
- **ILT-D07 / P1 ad safety source risk, existing ILT-UI01:**`AdSensePageProvider` latches first fill within a normalized route; root keys provider by pathname. A SPA navigation remount could reset that latch, while owner language calls for globally hidden placeholders after first real creative. This is a source-level lifetime concern, **not a reproduced placeholder-over-real-ad incident**. Real filled-to-next-route sequence remains unverified. No ad lifecycle, sizes, wrapper whitespace, account or consent changes. Integration mocks pass but cannot approve policy.
- **ILT-D08 / P2 audit drift:**Stage 4 bans the word AdSense and flags privacy/terms/cookies, whose visible disclosures are appropriate. Old final browser expectations also reject external scripts/blocked requests despite currently implemented ads/analytics. Keep red outputs and classify causes. Do not erase disclosures or weaken thresholds simply to make a report green. Generated reports contain inherited manual-review language: only this diagnostic's explicitly recorded checks are fresh evidence.

## False positives, intentional behavior and opportunities

- Every production canonical resolves 200, aliases resolve to expected paths, unknown returns 404; no broken canonical path reproduced. Noindex 23 and archived four-tool page are intentional, not deletion targets.
- Current root filters legacy aliases; fresh rendered internal href register has zero alias/unknown candidates. ILT-UI03's older claim is not reproduced.
- Footer breadth is intentional and explicitly protected by AGENTS. Reject compact-footer redesign (ILT-UI07). Homepage remains navigation-first; no abandonment evidence justifies embedding a timer (ILT-UI10).
- Legal AdSense disclosures remain. Device-clock, browser/audio/DST and calculation assumptions remain. No real ad code was added, no titles/H1s/canonicals/dates/credentials were rewritten.
- Countdown and some fitness pages use CSS ordering differently from DOM. This is an ILT-UI05 investigation; not every difference is a failure. Native-Space interception is independently reproduced and repaired.
- Specialty faces (binary/Fibonacci/flip/reaction/metronome) are meaningful task displays, not automatically decorative cards to erase. Generic orphan components do not prove live use.
- Initial functional harness failures from missing display selectors, comparing pre-pause to exact paused time, and assuming End run must disable itself were test assumptions, not product defects. Corrected harness preserves raw first run and tests observable stopped elapsed time. A concurrent rebuild caused several initial navigation failures; those are excluded and repeated on stable build. No product claim relies on that contaminated subset.
- Downsampled contact-sheet text briefly suggested holiday target/count errors; DOM text and source confirmed January 1/December 25 and 132 sitemap pages. Those were visual-reading false positives, not filed bugs.

## Search, privacy, performance and platform evidence

Original raw exports independently match 14,038 Google and 17,644 Bing clicks; page totals 14,162 are a different grain. Latest 28 days +6.3%/+18.1%.138 full-URL slash-normalized groups/92 dual variants versus 132 path-only groups/93 multi-URL groups; don't conflate them. 1000-query cap and no query/page join remain. No revenue/retention estimate was invented.

Read-only PostHog project 293132 confirms existing stored Nov 11 UTC counts 803$pageview,69 timer_start,50 timer_pause (end-boundary Nov 12 bin 0). This proves event presence, not complete capture, successful timers, users, funnels, revenue or current growth. Audit browser traffic is blocked from production analytics. Account-side replay/heatmaps being enabled does not establish SDK capture; source disables those SDK features. No billing/capture/consent scope changed.

Netlify baseline remains main 468 bda 18..., deploy 6 ad 02 cda 978 c 2279434 c 2640 ready,57 redirects/2 headers,0 functions/edge. Plan code nf_team_dev/Free team; quota/spending balance not exposed. No deploy/config/DNS/extension mutations. Branch previews were not assumed noindex; local evidence used. Final read-only receipt is required before handoff.

Lab LCP/CLS/long-task samples are recorded with blocked third parties, not field p75 or INP. Real phone sleep/audio, actual screen readers, all arbitrary long values, long-duration leak observation and Google-selected canonical remain explicit gaps. See the [functional matrix](2026-W46-functional-test-matrix.md), [visual review](2026-W46-visual-a11y-audit.md), [52week plan](2027-weekly-release-manifest.md).

## ILT-D02 exact affected route list

- `/12-hour-clock`
- `/24-hour-clock`
- `/age-calculator`
- `/analog-clock`
- `/astronomical-clock`
- `/atomic-clock`
- `/billable-hours-calculator`
- `/billable-hours-clock`
- `/binary-clock`
- `/business-days-calculator`
- `/christmas-countdown`
- `/clock-with-milliseconds`
- `/countdown-to-date`
- `/current-local-time`
- `/date-calculator`
- `/date-duration-calculator`
- `/days-until-calculator`
- `/debt-clock`
- `/debt-repayment-timer`
- `/digital-clock`
- `/epoch-unix-time-clock`
- `/event-countdown`
- `/fibonacci-clock`
- `/golden-hour-clock`
- `/hexadecimal-clock`
- `/hours-until-calculator`
- `/metronome`
- `/military-time-clock`
- `/minimalist-clock`
- `/months-between-dates-calculator`
- `/moon-phase-clock`
- `/morse-code-clock`
- `/new-year-countdown`
- `/online-alarm-clock`
- `/retro-flip-clock`
- `/roman-numeral-clock`
- `/sunrise-sunset-clock`
- `/time-blocking-clock`
- `/time-zone-converter`
- `/timer-clock`
- `/unix-timestamp-converter`
- `/utc-clock`
- `/weekday-calculator`
- `/weeks-between-dates-calculator`
- `/world-clock`
- `/world-clock-with-milliseconds`

## Final keyboard and fullscreen follow-up

The expanded sweep found two additional native-Space failures: the archived four-timer wrapper and speedcubing's window-level keyup listener. ILT-D06 now includes narrow guards in those existing handlers. The archived four-tool layout, controls, timing engines and storage remain intact; this is a keyboard repair, not an archive redesign. Evidence: [expanded red run](evidence/2026-W46/fix-regressions-expanded-before.json), [final regression run](evidence/2026-W46/fix-regressions-after.json).

**ILT-D09 / P1 / existing ILT-F03:** in `/speedcubing-timer`, enter fullscreen in the default hold-to-start mode and click Start. The button previously did nothing because its handler only stopped an active solve. The faithful red assertion reproduced this. The fix gives the explicit fullscreen Start button the same reset-and-start behavior as the normal Start button. Background hold/release remains separate and is regression-tested; session saving is unchanged. Worst risk: changing the deliberate hold workflow. The patch only changes explicit button activation and retains the 250 ms background arming path. Disposition: implemented, proposed W01 owner acceptance, not production-approved.

The first hold-to-start test incorrectly matched `Armed` case-sensitively against rendered `ARMED`. That assertion was corrected to ignore case; it was not a product defect. Final focused matrix: **115/115**, including the hold/release and fullscreen cases. Review the actual receipt for any remaining failure.

## ILT-D02 contained date subcase repaired

The after sweep was **524/528**, with four Fibonacci Clock hydration failures after the local date changed. Its date label called `new Date()` during render and memoized only on zone, independently of the loader-seeded clock. A controlled future-date test also showed its decimal time crossing midnight while its date stayed on the previous day: [8 failing assertions](evidence/2026-W46/fibonacci-date-before.json). The narrow repair formats the existing `now` state and includes it in the memo dependencies. It changes no tile algorithm, timezone selection, metadata or controls. Final result: **8/8** in [the date regression](evidence/2026-W46/fibonacci-date-after.json). Cross-locale/timezone differences remain open under ILT-D02; this partial repair does not close the 46-route issue.

The world-clock typography follow-up found a transient old font size when toggling 24-hour to 12-hour time in Firefox/WebKit. The row now reserves at least the 15-character 12-hour width in either mode, avoiding a font-size transition on that toggle. The first two cross-browser receipts are retained. This is a localized extension of ILT-D03, not a shared font-fitting rewrite.

The initial Fibonacci fixture advanced the device into 2030 and also exposed a footer-year mismatch (`Footer.tsx` reads the current year during render). The final red/green fixture stays within 2026 to isolate the date-label repair. The original future-year receipts are retained. Footer year rollover is a source-backed extension of the initial-render risk and belongs to W02/W06; the footer was not changed in this pass.

## ILT-D11 / P1 dependency release risk — needs owner choice

The final dependency audit reports two high package entries (`react-router` and `@react-router/node`) and one critical entry (`dompurify`, transitive through PostHog). This is not a reproduced site exploit. React Router's advisory concerns absent RSC APIs; its existing exception uses an obsolete npm numeric advisory ID. DOMPurify's reported modes were not found in app-owned use, and the relevant PostHog features are disabled. No blanket dependency upgrade or new exception was applied. Exact advisory links, versions, reachability evidence and limits are in [the triage record](evidence/2026-W46/dependency-reachability.md). This is a release hold before W01 acceptance: owner review must choose a documented applicability decision or an isolated patched-dependency candidate with full validation.

## ILT-D10 / P2 lab performance opportunity

Fresh Lighthouse produced 16 reports with no poor-threshold result. All eight desktop reports meet the configured good lab thresholds; all eight mobile reports fall in “needs improvement,” with LCP 2.63–3.08 seconds, above the 2.5-second goal. CLS is zero in these runs. This is a lab observation with ads/analytics blocked, not field p75 or a demonstrated before/after regression. No timing updates, typography or functional behavior were sacrificed to improve a score. Disposition: **stage the investigation at 2027-W26**, with field data and a controlled comparison required before optimization. [Metrics](evidence/2026-W46/generated-reports/lighthouse/docs/final-performance-accessibility.json).

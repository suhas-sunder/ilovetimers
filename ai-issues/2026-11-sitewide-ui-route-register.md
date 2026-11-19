# iLoveTimers — sitewide UI review register

**Working branch:** `audit/2026-11-19-sitewide-ui-review` (not `main`).
**Scope:** 132 canonical/nonredirect routes from `docs/route-architecture-manifest.json`. The additional 28 redirect routes are covered by the existing redirect audit, not counted as interactive pages.
**Production:** Do NOT update `main` until every page has been reviewed individually, all pending browser checks are addressed and the integrated final candidate passes. Never merge simply to run tests or trigger a Netlify deployment.
**Critical:** Source inspection and class-name checks are not rendered browser validation. A passing build is not sufficient to claim layouts are fixed. Use real screenshots, bounding rectangles, and interactive checks at mobile/tablet/desktop, in light and dark. Record specific failures and evidence. If browser access is unavailable, mark `BROWSER PENDING`, never PASS.

## Progress

- 27 routes have individually inspected source and staged targeted adjustments; the latest nine await browser QA.
- 105 canonical routes have not been assessed individually during this new review.
- No production merges or Netlify deploys are authorized until the entire sitewide review and final QA finish.

## Route checklist

| Route | Current-pass code review | Browser visual/interaction QA | Specific change or next step |
|---|---|---|---|
| `/` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/1-minute-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/10-minute-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/12-hour-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/15-minute-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/24-hour-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/30-minute-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/5-minute-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/about` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/age-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/alarm-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact duration form and grouped audio toggles. |
| `/amrap-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/analog-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/astronomical-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/atomic-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/author/suhas-sunder` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/billable-hours-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/billable-hours-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/binary-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/binary-stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/birthday-countdown` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/bpm-tapper` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/break-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Constrained break settings and bottom-aligned audio and looping toggles. |
| `/breathing-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/business-days-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/chaos-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/chess-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/christmas-countdown` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/classroom-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact teacher settings; restrained minutes field and wrapped audio toggles. |
| `/clock-with-milliseconds` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Replaced four huge toggle grid columns with natural-width wrapped clock options. |
| `/contact` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/cookies` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/copyright` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/countdown-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/countdown-to-date` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/current-local-time` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/date-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/date-duration-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/days-until-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/debt-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/debt-repayment-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/digital-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/drink-water-reminder-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/egg-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/emom-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/epoch-unix-time-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/event-countdown` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/exam-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Grouped five exam cue toggles in a wrapping row; compact custom-duration input. |
| `/fibonacci-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/focus-session-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact session-duration form with consistently aligned sound controls. |
| `/free-online-timers` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/golden-hour-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/browser-storage` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/browser-timer-alarm-silent` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/browser-timers-background-tabs` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/daylight-saving-time-zone-conversions` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/how-browser-timers-measure-time` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/guides/unix-timestamps-seconds-milliseconds-microseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/hexadecimal-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/hiit-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Balanced five-column interval inputs by consolidating skip guidance. |
| `/hours-until-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/how-ilovetimers-is-made` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/interval-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Unboxed editable step rows; aligned active/delete controls with inputs. |
| `/kitchen-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Reduced excessively wide duration form; responsive two fields and sound toggle. |
| `/lab-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meditation-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Reduced custom duration form and grouped four sound/loop controls. |
| `/meeting-agenda-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meeting-count-up-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Constrained agenda helper label and topic-cap fields. |
| `/meeting-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Replaced stretched three-column grid with wrapped, input-aligned meeting controls. |
| `/metronome` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/military-time-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/military-time-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/millisecond-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/milliseconds-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/minimalist-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/months-between-dates-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/moon-phase-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/morse-code-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/multiple-timers` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/new-year-countdown` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/online-alarm-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/online-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact settings width; Set button bottom-aligned with labeled input; sound/loop aligned. |
| `/pace-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/pizza-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact two-row settings; moved reminder explanation out of unequal-height field. |
| `/pomodoro-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Narrower settings; moved long-break guidance to group description; aligned controls. |
| `/presentation-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/privacy` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/productivity-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/reaction-time-test` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/rest-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact duration form; sound/final-beeps/loop actions aligned. |
| `/retro-flip-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/roman-numeral-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/round-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact four round-duration fields and centered audio controls. |
| `/seconds-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact seconds input and sound toggle geometry. |
| `/silent-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Compact no-audio settings; Set button aligned with labeled input; loop control aligned. |
| `/sitemap` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/sleep-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Replaced cramped four-column tablet form with responsive 2/4-column settings. |
| `/speech-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/speedcubing-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/speedrun-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Reduced excessively wide next-split label field. |
| `/stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/stopwatch-with-milliseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/stretch-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/study-stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/study-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Reduced oversized study settings width and bottom-aligned cue toggles with duration input. |
| `/sunrise-sunset-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/swatch-internet-time-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/tabata-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Balanced work/rest/rounds fields; clarified classic preset in group description. |
| `/tea-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Centered two-field steeping form and aligned sound/final beeps. |
| `/terms` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-blocking-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-card-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-duration-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-zone-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-zone-meeting-planner` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/timer-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/timer-stopwatch` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Aligned countdown Apply to the actual three input bottoms, removed asymmetrical per-field hints, compacted its setup. |
| `/unix-timestamp-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/utc-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/video-game-challenge-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/visual-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Replaced five-column settings grid with natural-width input, display-mode chips and toggles. |
| `/week-number-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weekday-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weekly-timesheet-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weeks-between-dates-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/work-hours-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/workdays-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/workout-timer` | Adjusted on audit branch | GEOMETRY PASS; interaction QA pending | Balanced work/rest/rounds inputs by consolidating zero-rest guidance. |
| `/world-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/world-clock-with-milliseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |

## Rendered QA evidence — 2026-11-19

- GitHub Actions [audit-only run #44456719334](https://github.com/suhas-sunder/ilovetimers/actions/runs/44456719334): npm ci, TypeScript typecheck, production build, source/UI regressions, the 132-route SSR structure smoke, and 18-route rendered geometry tests succeeded at 390/768/1280/1920 in light/dark (144 cases). This run was only on the audit branch; no Netlify production deployment was initiated.
- Full-page screenshots from that run were downloaded and manually examined (desktop contact sheet and targeted mobile/desktop crops). They revealed defects **missed by the original automated test**: stretched native checkbox labels in Exam/Classroom and a huge Pomodoro long-break toggle; meeting row uses the same mistaken grid-over-flex approach. Tabata summary labels sat at opposite ends of a large row.
- Those source defects were repaired after the cited run by replacing forced-grid wrappers with actual flex containers and grouping the Tabata summary. **The revised source is NOT yet browser-PASS** until a follow-up run against its exact commit succeeds and new screenshots are inspected.
- The rendered geometry test now includes a stretched-toggle detection assertion. Follow-up testing must include desktop and mobile, both themes; do not substitute passing build for manual visual acceptance.

## Second rendered CI gate — confirmed defects

- [Audit-only run #44457680665](https://github.com/suhas-sunder/ilovetimers/actions/runs/44457680665) passed npm install, typecheck, build, UI regression source checks and 132-route SSR checks, then **failed new strict browser toggle geometry assertions**.
- Browser-measured failures: Kitchen Sound was 326px wide at 390px viewport and 674px at 768px (intrinsic label width ~98px); Sleep Sound/Soft alarm/Dim mode were 358px each at 390px and ~353px each at 768px.
- Repairs on audit branch: Kitchen checkbox explicitly uses content-sized grid placement; Sleep sound/dim toggles are now a single responsive flex group beside the duration field.
- **Resolved:** [audit-only run #44458294142](https://github.com/suhas-sunder/ilovetimers/actions/runs/44458294142) passed npm ci, typecheck, production build, source UI regressions, 132-route SSR structural gate and the stricter **144/144 rendered-browser geometry cases** (18 routes × 4 widths × 2 themes). Downloaded the full screenshot artifact and visually examined Kitchen/Sleep at 390 and 768 light; their sound controls now have compact intrinsic widths. No production deploy occurred.
- **Remaining scope:** the first 18 routes now have automated layout-geometry PASS and representative manual screenshot review, but not an exhaustive manual interaction, zoom, keyboard, and all-144-screens review. Other 114 routes are still pending individual assessment; no sitewide acceptance or main publication is authorized.

## Expanded responsive geometry gate — 27 routes

- [Audit run #44459075797](https://github.com/suhas-sunder/ilovetimers/actions/runs/44459075797) passed build/typecheck, 132-route structural UI gate and 27 × 4 × 2 = **216** browser geometry/screenshot cases.
- Manual review of that run's 390px and 1280px light contact sheets revealed an additional UI concern: Timer/Stopwatch's normal mobile stage consumed excessive vertical space and rendered small digits.
- Corrected the Timer/Stopwatch stage's mobile/desktop minimum heights and digit-fit allowances in route code and scoped CSS, leaving fullscreen behavior unchanged. Added browser checks for normal-mobile stage height and digit size.
- [Audit run #44459688702](https://github.com/suhas-sunder/ilovetimers/actions/runs/44459688702) then passed all stages and **216/216 geometry cases** against the corrected layout. Its mobile before/after screenshot was visually inspected.
- **Scope of PASS:** browser-reported overflow, visible control clipping, expanded checkbox geometry, labeled Set/Apply positions on selected routes, plus representative screenshot review. This is NOT a claim of 27-page exhaustive functional/interactive/zoom accessibility acceptance.
- Full 132-page top/settings screenshot inventory is being executed separately and must be reviewed before sitewide publication.

## Batch closeout rule

For each new batch: record exact routes, defects, changes, before/after browser evidence and what is still blocked. Commit only to audit branch. No push to `main`, PR merge, production deploy, or fake completion claim until 132/132 page-by-page reviews plus responsive/dark/interactions final acceptance. User wants brief per-batch notification. If progress stalls due to unavailable browser tools, say so and leave production untouched.

# iLoveTimers — sitewide UI review register

**Working branch:** `audit/2026-11-19-sitewide-ui-review` (not `main`).
**Scope:** 132 canonical/nonredirect routes from `docs/route-architecture-manifest.json`. The additional 28 redirect routes are covered by the existing redirect audit, not counted as interactive pages.
**Production:** Do NOT update `main` until every page has been reviewed individually, all pending browser checks are addressed and the integrated final candidate passes. Never merge simply to run tests or trigger a Netlify deployment.
**Critical:** Source inspection and class-name checks are not rendered browser validation. A passing build is not sufficient to claim layouts are fixed. Use real screenshots, bounding rectangles, and interactive checks at mobile/tablet/desktop, in light and dark. Record specific failures and evidence. If browser access is unavailable, mark `BROWSER PENDING`, never PASS.

## Progress

- 13 routes have individually inspected source and staged targeted adjustments; browser QA remains pending.
- 119 canonical routes have not been assessed individually during this new review.
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
| `/alarm-timer` | Adjusted on audit branch | BROWSER PENDING | Compact duration form and grouped audio toggles. |
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
| `/break-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/breathing-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/business-days-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/chaos-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/chess-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/christmas-countdown` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/classroom-timer` | Adjusted on audit branch | BROWSER PENDING | Compact teacher settings; restrained minutes field and wrapped audio toggles. |
| `/clock-with-milliseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
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
| `/exam-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/fibonacci-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/focus-session-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
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
| `/hiit-timer` | Adjusted on audit branch | BROWSER PENDING | Balanced five-column interval inputs by consolidating skip guidance. |
| `/hours-until-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/how-ilovetimers-is-made` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/interval-timer` | Adjusted on audit branch | BROWSER PENDING | Unboxed editable step rows; aligned active/delete controls with inputs. |
| `/kitchen-timer` | Adjusted on audit branch | BROWSER PENDING | Reduced excessively wide duration form; responsive two fields and sound toggle. |
| `/lab-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meditation-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meeting-agenda-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meeting-count-up-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/meeting-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
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
| `/online-timer` | Adjusted on audit branch | BROWSER PENDING | Compact settings width; Set button bottom-aligned with labeled input; sound/loop aligned. |
| `/pace-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/pizza-timer` | Adjusted on audit branch | BROWSER PENDING | Compact two-row settings; moved reminder explanation out of unequal-height field. |
| `/pomodoro-timer` | Adjusted on audit branch | BROWSER PENDING | Narrower settings; moved long-break guidance to group description; aligned controls. |
| `/presentation-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/privacy` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/productivity-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/reaction-time-test` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/rest-timer` | Adjusted on audit branch | BROWSER PENDING | Compact duration form; sound/final-beeps/loop actions aligned. |
| `/retro-flip-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/roman-numeral-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/round-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/seconds-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/silent-timer` | Adjusted on audit branch | BROWSER PENDING | Compact no-audio settings; Set button aligned with labeled input; loop control aligned. |
| `/sitemap` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/sleep-timer` | Adjusted on audit branch | BROWSER PENDING | Replaced cramped four-column tablet form with responsive 2/4-column settings. |
| `/speech-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/speedcubing-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/speedrun-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/stopwatch-with-milliseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/stretch-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/study-stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/study-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/sunrise-sunset-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/swatch-internet-time-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/tabata-timer` | Adjusted on audit branch | BROWSER PENDING | Balanced work/rest/rounds fields; clarified classic preset in group description. |
| `/tea-timer` | Adjusted on audit branch | BROWSER PENDING | Centered two-field steeping form and aligned sound/final beeps. |
| `/terms` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-blocking-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-card-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-duration-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-zone-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/time-zone-meeting-planner` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/timer-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/timer-stopwatch` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/unix-timestamp-converter` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/utc-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/video-game-challenge-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/visual-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/week-number-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weekday-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weekly-timesheet-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/weeks-between-dates-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/work-hours-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/workdays-calculator` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/workout-timer` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/world-clock` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |
| `/world-clock-with-milliseconds` | Not reviewed in this pass | BROWSER PENDING | Inspect display, control alignment, settings, mobile/dark mode, keyboard and fullscreen; change only verified defects. |

## Batch closeout rule

For each new batch: record exact routes, defects, changes, before/after browser evidence and what is still blocked. Commit only to audit branch. No push to `main`, PR merge, production deploy, or fake completion claim until 132/132 page-by-page reviews plus responsive/dark/interactions final acceptance. User wants brief per-batch notification. If progress stalls due to unavailable browser tools, say so and leave production untouched.

# 2026-W46 route and redirect register

Audit began November 12, 2026 (America/New_York). Base `54c19824b2a76da0ea671e912598fadb3214b8b9`; application source equals published main `468bda18f09812a9212b3e6a15921dd9ed013542` before repairs.

## Reconciliation

Source `app/routes.ts`, architecture manifest, generated static HTML and sitemap reconcile to **132 canonical /109 indexable /23 noindex /28 aliases**. All 132 canonical build HTML files exist. XML sitemap contains 109 canonical indexable paths, zero missing/extra. Fresh production HTTP register has 322 requested paths: 263 canonical slash variants,56 alias variants, unknown 404, robots and sitemap. See [inventory](evidence/2026-W46/inventory.json), [HTTP evidence](evidence/2026-W46/production-http.json), [exhaustive CSV](2026-W46-canonical-page-audit.csv).

## Live URL signals: ILT-D04, owner decision required

All 131 non-root canonical paths redirect 301 to their trailing-slash final 200. Both forms advertise a non-trailing canonical and OG URL. Aliases ordinarily add an extra 301 through the non-trailing destination. This is a live disagreement, not merely historical GSC residue. It does **not** prove Google picked the wrong canonical or lost traffic. Root is 200. Preserve existing redirects, indexability, internal paths and sitemap until an isolated URL-policy experiment has quantified risk and owner approval. Options: keep current contract with monitoring (recommended during repairs); test explicit no-slash serving privately; or plan a trailing-slash migration only with search evidence and full mapping. No migration in this branch.

Raw exports were found and independently recomputed: Google 14038 clicks, page-grouped 14162; Bing 17644. Latest 28 days Google+6.3017%, Bing+18.0960%. Path-only grouping and full-URL slash normalization are separately labeled in [recalculation](evidence/2026-W46/raw-search-recalculation.json). No invented query/page join or Bing landing table. Protected routes remain unchanged except the narrow shared native-Space bug repair; their titles/H1s/URLs/default workflows are preserved.

## Discovery and support

Rendered internal href checks found **0 alias/unknown candidates**; inspect [register](evidence/2026-W46/rendered-link-register.json), plus passing `audit:links` for source references. Root directory filters established alias entries before rendering. Historical ILT-UI03 is not an independently reproduced current alias-offer bug. Full footer directory and archived four-tool page intentionally preserved. Search/navigation taxonomy suggestions are proposals, not permission to remove useful routes.

Unknown path returns 404. Its initial server fallback lacks normal title/H1 metadata; hydrated recovery is covered by the existing final-browser suite, whose complete result/failures are disclosed separately. Do not infer HTTP 200 from client recovery. No fallback/404 routing change.

All canonical responses were collected for title,H1, canonical, robots, OG and JSON-LD. Existing SEO/schema audits were rerun. Automated consistency checks do not establish the truth of every natural-language claim or FAQ answer. No new ratings, dates, titles, credentials or pages were authored.

## Alias table (both slash forms actually requested)

| Alias | Canonical destination | Live chains, source then source/ | Disposition |
|---|---|---|---|
| /stopwatch-timer | /timer-stopwatch | 301 /stopwatch-timer → 301 /timer-stopwatch → 200 /timer-stopwatch/; 301 /stopwatch-timer/ → 301 /timer-stopwatch → 200 /timer-stopwatch/ | preserved |
| /timer-and-stopwatch | /timer-stopwatch | 301 /timer-and-stopwatch → 301 /timer-stopwatch → 200 /timer-stopwatch/; 301 /timer-and-stopwatch/ → 301 /timer-stopwatch → 200 /timer-stopwatch/ | preserved |
| /online-timer-stopwatch | /timer-stopwatch | 301 /online-timer-stopwatch → 301 /timer-stopwatch → 200 /timer-stopwatch/; 301 /online-timer-stopwatch/ → 301 /timer-stopwatch → 200 /timer-stopwatch/ | preserved |
| /stopwatch-countdown | /timer-stopwatch | 301 /stopwatch-countdown → 301 /timer-stopwatch → 200 /timer-stopwatch/; 301 /stopwatch-countdown/ → 301 /timer-stopwatch → 200 /timer-stopwatch/ | preserved |
| /countdown-stopwatch | /timer-stopwatch | 301 /countdown-stopwatch → 301 /timer-stopwatch → 200 /timer-stopwatch/; 301 /countdown-stopwatch/ → 301 /timer-stopwatch → 200 /timer-stopwatch/ | preserved |
| /focus-stopwatch | /study-stopwatch | 301 /focus-stopwatch → 301 /study-stopwatch → 200 /study-stopwatch/; 301 /focus-stopwatch/ → 301 /study-stopwatch → 200 /study-stopwatch/ | preserved |
| /stopwatch-for-study | /study-stopwatch | 301 /stopwatch-for-study → 301 /study-stopwatch → 200 /study-stopwatch/; 301 /stopwatch-for-study/ → 301 /study-stopwatch → 200 /study-stopwatch/ | preserved |
| /study-timer-stopwatch | /study-stopwatch | 301 /study-timer-stopwatch → 301 /study-stopwatch → 200 /study-stopwatch/; 301 /study-timer-stopwatch/ → 301 /study-stopwatch → 200 /study-stopwatch/ | preserved |
| /clock-timer | /timer-clock | 301 /clock-timer → 301 /timer-clock → 200 /timer-clock/; 301 /clock-timer/ → 301 /timer-clock → 200 /timer-clock/ | preserved |
| /online-clock-timer | /timer-clock | 301 /online-clock-timer → 301 /timer-clock → 200 /timer-clock/; 301 /online-clock-timer/ → 301 /timer-clock → 200 /timer-clock/ | preserved |
| /military-time-calculator | /military-time-converter | 301 /military-time-calculator → 301 /military-time-converter → 200 /military-time-converter/; 301 /military-time-calculator/ → 301 /military-time-converter → 200 /military-time-converter/ | preserved |
| /army-time-converter | /military-time-converter | 301 /army-time-converter → 301 /military-time-converter → 200 /military-time-converter/; 301 /army-time-converter/ → 301 /military-time-converter → 200 /military-time-converter/ | preserved |
| /military-time-translator | /military-time-converter | 301 /military-time-translator → 301 /military-time-converter → 200 /military-time-converter/; 301 /military-time-translator/ → 301 /military-time-converter → 200 /military-time-converter/ | preserved |
| /ms-to-seconds | /milliseconds-converter | 301 /ms-to-seconds → 301 /milliseconds-converter → 200 /milliseconds-converter/; 301 /ms-to-seconds/ → 301 /milliseconds-converter → 200 /milliseconds-converter/ | preserved |
| /milliseconds-to-seconds | /milliseconds-converter | 301 /milliseconds-to-seconds → 301 /milliseconds-converter → 200 /milliseconds-converter/; 301 /milliseconds-to-seconds/ → 301 /milliseconds-converter → 200 /milliseconds-converter/ | preserved |
| /utc-time-now | /utc-clock | 301 /utc-time-now → 301 /utc-clock → 200 /utc-clock/; 301 /utc-time-now/ → 301 /utc-clock → 200 /utc-clock/ | preserved |
| /current-unix-timestamp | /epoch-unix-time-clock | 301 /current-unix-timestamp → 301 /epoch-unix-time-clock → 200 /epoch-unix-time-clock/; 301 /current-unix-timestamp/ → 301 /epoch-unix-time-clock → 200 /epoch-unix-time-clock/ | preserved |
| /fullscreen-timer | /online-timer | 301 /fullscreen-timer → 301 /online-timer → 200 /online-timer/; 301 /fullscreen-timer/ → 301 /online-timer → 200 /online-timer/ | preserved |
| /count-up-timer | /stopwatch | 301 /count-up-timer → 301 /stopwatch → 200 /stopwatch/; 301 /count-up-timer/ → 301 /stopwatch → 200 /stopwatch/ | preserved |
| /cooking-timer | /kitchen-timer | 301 /cooking-timer → 301 /kitchen-timer → 200 /kitchen-timer/; 301 /cooking-timer/ → 301 /kitchen-timer → 200 /kitchen-timer/ | preserved |
| /boxing-timer | /round-timer | 301 /boxing-timer → 301 /round-timer → 200 /round-timer/; 301 /boxing-timer/ → 301 /round-timer → 200 /round-timer/ | preserved |
| /world-clock-with-seconds | /world-clock | 301 /world-clock-with-seconds → 301 /world-clock → 200 /world-clock/; 301 /world-clock-with-seconds/ → 301 /world-clock → 200 /world-clock/ | preserved |
| /analog-clock-with-second-hand | /analog-clock | 301 /analog-clock-with-second-hand → 301 /analog-clock → 200 /analog-clock/; 301 /analog-clock-with-second-hand/ → 301 /analog-clock → 200 /analog-clock/ | preserved |
| /full-screen-analog-clock | /analog-clock | 301 /full-screen-analog-clock → 301 /analog-clock → 200 /analog-clock/; 301 /full-screen-analog-clock/ → 301 /analog-clock → 200 /analog-clock/ | preserved |
| /smooth-second-hand-clock | /analog-clock | 301 /smooth-second-hand-clock → 301 /analog-clock → 200 /analog-clock/; 301 /smooth-second-hand-clock/ → 301 /analog-clock → 200 /analog-clock/ | preserved |
| /full-screen-clock | /digital-clock | 301 /full-screen-clock → 301 /digital-clock → 200 /digital-clock/; 301 /full-screen-clock/ → 301 /digital-clock → 200 /digital-clock/ | preserved |
| /big-digital-clock | /digital-clock | 301 /big-digital-clock → 301 /digital-clock → 200 /digital-clock/; 301 /big-digital-clock/ → 301 /digital-clock → 200 /digital-clock/ | preserved |
| /clock-with-seconds | /digital-clock | 301 /clock-with-seconds → 301 /digital-clock → 200 /digital-clock/; 301 /clock-with-seconds/ → 301 /digital-clock → 200 /digital-clock/ | preserved |

## Canonical indexability

- `/` — indexable
- `/free-online-timers` — indexable
- `/about` — indexable
- `/author/suhas-sunder` — indexable
- `/contact` — indexable
- `/how-ilovetimers-is-made` — indexable
- `/copyright` — indexable
- `/guides` — indexable
- `/guides/browser-timers-background-tabs` — indexable
- `/guides/browser-timer-alarm-silent` — indexable
- `/guides/how-browser-timers-measure-time` — indexable
- `/guides/unix-timestamps-seconds-milliseconds-microseconds` — indexable
- `/guides/daylight-saving-time-zone-conversions` — indexable
- `/guides/browser-storage` — indexable
- `/countdown-timer` — indexable
- `/timer-stopwatch` — indexable
- `/timer-clock` — indexable
- `/stopwatch` — indexable
- `/stopwatch-with-milliseconds` — indexable
- `/pomodoro-timer` — indexable
- `/hiit-timer` — indexable
- `/silent-timer` — noindex
- `/online-timer` — indexable
- `/seconds-timer` — indexable
- `/1-minute-timer` — noindex
- `/5-minute-timer` — noindex
- `/10-minute-timer` — noindex
- `/15-minute-timer` — noindex
- `/30-minute-timer` — noindex
- `/interval-timer` — indexable
- `/presentation-timer` — indexable
- `/speech-timer` — indexable
- `/classroom-timer` — indexable
- `/meeting-timer` — noindex
- `/meeting-agenda-timer` — indexable
- `/exam-timer` — indexable
- `/break-timer` — noindex
- `/study-timer` — noindex
- `/study-stopwatch` — indexable
- `/workout-timer` — noindex
- `/rest-timer` — noindex
- `/tabata-timer` — indexable
- `/kitchen-timer` — indexable
- `/meditation-timer` — indexable
- `/speedcubing-timer` — indexable
- `/lab-timer` — indexable
- `/alarm-timer` — indexable
- `/online-alarm-clock` — indexable
- `/multiple-timers` — indexable
- `/visual-timer` — indexable
- `/productivity-timer` — indexable
- `/meeting-count-up-timer` — indexable
- `/breathing-timer` — indexable
- `/sleep-timer` — indexable
- `/stretch-timer` — indexable
- `/drink-water-reminder-timer` — indexable
- `/emom-timer` — indexable
- `/amrap-timer` — indexable
- `/round-timer` — indexable
- `/pace-timer` — indexable
- `/tea-timer` — indexable
- `/egg-timer` — indexable
- `/chaos-timer` — indexable
- `/video-game-challenge-timer` — indexable
- `/speedrun-timer` — indexable
- `/pizza-timer` — indexable
- `/fibonacci-clock` — indexable
- `/sunrise-sunset-clock` — indexable
- `/debt-repayment-timer` — noindex
- `/focus-session-timer` — noindex
- `/morse-code-clock` — indexable
- `/world-clock` — indexable
- `/world-clock-with-milliseconds` — indexable
- `/debt-clock` — noindex
- `/current-local-time` — noindex
- `/utc-clock` — indexable
- `/24-hour-clock` — indexable
- `/12-hour-clock` — indexable
- `/analog-clock` — indexable
- `/digital-clock` — indexable
- `/clock-with-milliseconds` — indexable
- `/binary-clock` — indexable
- `/hexadecimal-clock` — indexable
- `/event-countdown` — indexable
- `/countdown-to-date` — indexable
- `/new-year-countdown` — indexable
- `/christmas-countdown` — indexable
- `/golden-hour-clock` — noindex
- `/moon-phase-clock` — noindex
- `/astronomical-clock` — noindex
- `/epoch-unix-time-clock` — indexable
- `/swatch-internet-time-clock` — indexable
- `/billable-hours-clock` — indexable
- `/time-blocking-clock` — indexable
- `/atomic-clock` — noindex
- `/time-zone-converter` — indexable
- `/time-zone-meeting-planner` — indexable
- `/military-time-clock` — indexable
- `/binary-stopwatch` — indexable
- `/roman-numeral-clock` — indexable
- `/retro-flip-clock` — indexable
- `/minimalist-clock` — noindex
- `/reaction-time-test` — indexable
- `/metronome` — indexable
- `/bpm-tapper` — indexable
- `/military-time-converter` — indexable
- `/work-hours-calculator` — indexable
- `/time-calculator` — indexable
- `/time-duration-calculator` — indexable
- `/date-duration-calculator` — indexable
- `/date-calculator` — indexable
- `/business-days-calculator` — indexable
- `/workdays-calculator` — indexable
- `/age-calculator` — indexable
- `/days-until-calculator` — indexable
- `/weekday-calculator` — indexable
- `/week-number-calculator` — indexable
- `/months-between-dates-calculator` — indexable
- `/weeks-between-dates-calculator` — indexable
- `/birthday-countdown` — indexable
- `/hours-until-calculator` — indexable
- `/time-card-calculator` — indexable
- `/weekly-timesheet-calculator` — indexable
- `/billable-hours-calculator` — indexable
- `/milliseconds-converter` — indexable
- `/millisecond-timer` — indexable
- `/unix-timestamp-converter` — indexable
- `/chess-clock` — indexable
- `/privacy` — noindex
- `/terms` — noindex
- `/cookies` — noindex
- `/sitemap` — indexable

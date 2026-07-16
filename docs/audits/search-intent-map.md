# Search intent ownership map

Reviewed July 16, 2026. This internal map uses the supplied 120-page performance table, 1,000-query GSC export, and separate 1,597-row keyword report as complementary evidence. Their totals are not combined because their sources and date ranges may differ. Codex did not access live Google Search Console or Bing Webmaster Tools, and the supplied exports do not provide a complete Query + Page join. Any overlap noted below is therefore **suspected cannibalization**, not confirmed cannibalization.

Status terms: **ALIGNED** means the current canonical, metadata, visible tool, supporting content, and schema serve the intent; **MONITOR AFTER RECRAWL** means the implementation is aligned but historical data predates recent improvements; **SUSPECTED CANNIBALIZATION** identifies adjacent pages that must be monitored with Query + Page data; **UNSUPPORTED QUERY, DO NOT TARGET** excludes an unimplemented or misleading intent.

## Analog and fullscreen clocks

| Query cluster and demonstrated examples | Primary canonical | Supporting pages / redirect aliases | Historical signal | Current title / H1 | User intent and functional value | Risk and status | Final action / monitoring note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| analog clock online | `/analog-clock` | `/analog-clock-with-second-hand`, `/smooth-second-hand-clock`, `/full-screen-analog-clock` / none | 443 clicks, 20,440 impressions | “Analog Clock Online \| Current Local Time” / “Analog Clock” | Read current device time on a standard analog face with normal display controls. | Low overlap; **ALIGNED** | Retain. Monitor generic analog queries by Query + Page. |
| online analog clock full screen | `/full-screen-analog-clock` | `/analog-clock` / none | Demand demonstrated; page total not separately supplied | “Fullscreen Analog Clock \| Large Local Time Display” / “Full Screen Analog Clock” | Open a large analog face intended for shared/fullscreen viewing. | Adjacent to standard analog but functionally distinct; **ALIGNED** | Retain and monitor fullscreen modifiers. |
| analog clock with second hand | `/analog-clock-with-second-hand` | `/analog-clock`, `/smooth-second-hand-clock` / none | Demand demonstrated; page total not separately supplied | “Analog Clock with Second Hand \| Live Local Time” / “Analog Clock With Second Hand” | Read local time with a clearly visible ticking second hand. | Possible overlap with smooth hand; **SUSPECTED CANNIBALIZATION** | Retain; compare query modifiers and canonical selection after recrawl. |
| smooth second hand clock | `/smooth-second-hand-clock` | `/analog-clock-with-second-hand` / none | 10 clicks, 510 impressions | “Smooth Second Hand Clock \| Analog Time Display” / “Smooth Second Hand Clock” | View a browser-rendered sweeping hand, with refresh limitations disclosed. | Distinct motion intent; **ALIGNED** | Retain; monitor smooth/sweep terms. |
| full screen digital clock | `/full-screen-clock` | `/digital-clock`, `/clock-with-seconds` / none | Demand demonstrated; page total not separately supplied | “Fullscreen Digital Clock \| Large Current Time Display” / “Full Screen Clock” | Show a large current-time display for rooms and shared screens. | Low overlap when fullscreen modifier is present; **ALIGNED** | Retain. |
| clock with seconds | `/clock-with-seconds` | `/digital-clock`, `/clock-with-milliseconds` / none | Demand demonstrated; page total not separately supplied | “Clock with Seconds \| Live Local Time Display” / “Clock With Seconds” | Read current local time with seconds. | Adjacent display variants; **ALIGNED** | Retain; monitor seconds versus milliseconds Query + Page results. |

## Millisecond time and measurement

| Query cluster and examples | Primary canonical | Supporting pages / aliases | Historical signal | Current title / H1 | User intent and functional value | Risk and status | Final action / monitoring note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| current local time with milliseconds | `/clock-with-milliseconds` | `/clock-with-seconds`, `/atomic-clock` / none | 5 clicks, 1,010 impressions | “Clock with Milliseconds \| Local Time Display” / “Clock With Milliseconds” | Display the device’s local time with browser-refreshed millisecond digits. | Atomic adjacency; **SUSPECTED CANNIBALIZATION**, implementation **ALIGNED** | Retain generic ownership; monitor Query + Page for “current time with milliseconds.” |
| atomic clock online | `/atomic-clock` | `/clock-with-milliseconds`, `/utc-clock` / none | 532 clicks, 48,860 impressions | “Online Atomic Clock (Device Time With Milliseconds, Fullscreen)” / “Online Atomic Clock (Milliseconds + Fullscreen)” | Provide an atomic-clock-style large display while visibly disclosing device time and no atomic/NTP synchronization. | Must not inherit generic/exact claims; **ALIGNED** | Protect route; monitor atomic queries and snippets. |
| multiple time zones with milliseconds | `/world-clock-with-milliseconds` | `/world-clock`, `/world-clock-with-seconds` / none | 4 clicks, 389 impressions | “World Clock with Milliseconds \| Multiple Time Zones” / “World Clock With Milliseconds” | Compare several IANA-zone displays at one device-clock instant. | Distinct multi-zone intent; **ALIGNED** | Retain; monitor world/millisecond modifiers. |
| millisecond countdown | `/millisecond-timer` | `/countdown-timer`, `/stopwatch-with-milliseconds` / none | 146 clicks, 3,276 impressions | “Millisecond Timer Online \| Short Precision-Display Countdown” / “Millisecond Timer” | Run a short countdown with millisecond input/display and normal timer controls. | “Precision-display” is limited by visible browser caveat; **ALIGNED** | Retain; avoid certified/exact language. |
| elapsed stopwatch with milliseconds | `/stopwatch-with-milliseconds` | `/stopwatch`, `/millisecond-timer` / none | 20 clicks, 567 impressions | “Stopwatch with Milliseconds \| Laps and Fullscreen” / “Stopwatch With Milliseconds” | Measure elapsed browser time with laps and a millisecond display. | Countdown/clock tools are functionally distinct; **ALIGNED** | Retain. |
| milliseconds to seconds and other units | `/milliseconds-converter` | `/millisecond-timer` / `/ms-to-seconds`, `/milliseconds-to-seconds` | 0 clicks, 7,976 impressions | “Milliseconds Converter \| Seconds, Minutes and Hours” / “Milliseconds Converter” | Convert flexible numeric input across seconds, minutes, hours, and days; formula, rounding, examples, and clear results add value beyond a single snippet. | Historical CTR predates improvements; **MONITOR AFTER RECRAWL** | Keep aliases redirected; do not create exact-value pages. |

## Combined, study, alarm, silent, and rhythm tools

| Query cluster | Primary canonical | Supporting pages / redirect aliases | Historical signal | Current title / H1 | User intent and functional value | Risk and status | Final action / monitoring note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| timer stopwatch / stopwatch timer | `/timer-stopwatch` | `/countdown-timer`, `/stopwatch` / `/stopwatch-timer`, `/timer-and-stopwatch`, `/online-timer-stopwatch`, `/stopwatch-countdown`, `/countdown-stopwatch` | New route; no supplied history | “Timer and Stopwatch Online \| Countdown, Laps and Fullscreen” / “Timer and Stopwatch” | Use independent countdown and lap stopwatch modes on one page. | Distinct combined intent; **MONITOR AFTER RECRAWL** | Retain one canonical; monitor aliases and Query + Page. |
| clock timer / timer clock | `/timer-clock` | `/clock-with-seconds`, `/countdown-timer` / `/clock-timer`, `/online-clock-timer` | New route; no supplied history | “Clock and Timer Online \| Current Time with Countdown” / “Clock and Timer” | See current local time beside a countdown. | Distinct combined display; **MONITOR AFTER RECRAWL** | Retain one canonical. |
| open-ended study timing | `/study-stopwatch` | `/study-timer`, `/focus-session-timer` / `/focus-stopwatch`, `/stopwatch-for-study`, `/study-timer-stopwatch` | New route; no supplied history | “Study Stopwatch Online \| Track Open-Ended Study Sessions” / “Study Stopwatch” | Track an open-ended session with markers rather than a fixed countdown. | Study adjacency; **ALIGNED** | Retain and monitor open-ended modifiers. |
| fixed-duration study countdown | `/study-timer` | `/study-stopwatch`, `/pomodoro-timer` / none | Demand demonstrated; page total not separately supplied | “Study Timer Online \| Focus Countdown with Fullscreen” / “Study Timer” | Run one chosen fixed study countdown; not a cycle manager or count-up tool. | Study-family overlap; **ALIGNED** | Retain distinctions in related links. |
| online alarm clock / set alarm | `/online-alarm-clock` | `/alarm-timer` / none | 53 clicks, 2,054 impressions | “Online Alarm Clock \| Set an Alarm in Your Browser” / “Online Alarm Clock” | Set an alarm for a local clock time and test sound. | Duration alarm is distinct; **ALIGNED** | Retain and monitor alarm-time queries. |
| alarm after a duration | `/alarm-timer` | `/online-alarm-clock`, `/countdown-timer` / none | Demand demonstrated; page total not separately supplied | “Alarm Timer Online \| Countdown with Sound” / “Alarm Timer” | Count down a chosen duration and sound at zero. | Clock-time versus duration distinction clear; **ALIGNED** | Retain. |
| silent timer / timer without sound | `/silent-timer` | `/visual-timer`, `/countdown-timer` / none | 35 clicks, 1,392 impressions | “Silent Timer Online \| Countdown with No Sound” / “Silent Timer” | Provide visual completion without audio. | Distinct accessibility/context intent; **ALIGNED** | Retain. |
| generated metronome beat | `/metronome` | `/bpm-tapper` / none | 18 clicks, 1,188 impressions | “Online Metronome \| BPM, Time Signature and Subdivisions” / “Online Metronome” | Generate scheduled audio/visual beats at a selected BPM. | Tapper is input analysis, not beat generation; **ALIGNED** | Retain. |
| tap tempo / metronome tapper | `/bpm-tapper` | `/metronome` / none | Demand demonstrated; page total not separately supplied | “BPM Tapper Online \| Tap Tempo Counter” / “BPM Tapper” | Estimate tempo from user taps and pass the result to a metronome. | Distinct workflow; **ALIGNED** | Retain. |

## Military, UTC, Unix, world time, and time zones

| Query cluster | Primary canonical | Supporting pages / redirect aliases | Historical signal | Current title / H1 | User intent and functional value | Risk and status | Final action / monitoring note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| military time converter | `/military-time-converter` | `/military-time-clock`, `/12-hour-clock`, `/24-hour-clock` / `/military-time-calculator`, `/army-time-converter`, `/military-time-translator` | 0 clicks, 11,570 impressions | “Military Time Converter \| 12-Hour and 24-Hour Time” / “Military Time Converter” | Bidirectionally convert colon/non-colon 12/24-hour values with midnight/noon guidance; timezone is not inferred. | Historical CTR predates stronger utility/content; **MONITOR AFTER RECRAWL** | Retain and keep variants redirect-only. |
| current military time | `/military-time-clock` | `/24-hour-clock`, `/military-time-converter` / none | 4 clicks, 1,663 impressions | “Military Time Clock \| Current 24-Hour Time” / “Military Time Clock” | Read the current local time in military-style 24-hour notation. | Converter adjacency; **ALIGNED** | Retain. |
| current 24-hour clock | `/24-hour-clock` | `/12-hour-clock`, `/military-time-clock` / none | Demand demonstrated; page total not separately supplied | “24-Hour Clock Online \| Current Local Time” / “24 Hour Clock” | View current local time in the general 24-hour format. | Military terminology may overlap; **SUSPECTED CANNIBALIZATION** | Retain; inspect Query + Page for military/current-format terms. |
| current 12-hour clock | `/12-hour-clock` | `/24-hour-clock` / none | Demand demonstrated; page total not separately supplied | “12-Hour Clock Online \| Current Local Time” / “12 Hour Clock” | View current local time with AM/PM. | Low risk; **ALIGNED** | Retain. |
| current UTC time | `/utc-clock` | `/world-clock`, `/epoch-unix-time-clock` / `/utc-time-now` | 21 clicks, 2,297 impressions | “UTC Clock Online \| Current Coordinated Universal Time” / “UTC Clock” | Display device-derived current UTC and disclose device-clock dependency. | Current-instant family; **ALIGNED** | Retain; monitor canonical selection. |
| current Unix / epoch timestamp | `/epoch-unix-time-clock` | `/unix-timestamp-converter`, `/utc-clock` / `/current-unix-timestamp` | 7 clicks, 2,073 impressions | “Unix Timestamp Clock \| Current Epoch Time” / “Unix Time Clock (Epoch Timestamp)” | Show current seconds and milliseconds plus UTC date. | Converter adjacency; **ALIGNED** | Retain current-value ownership. |
| convert Unix timestamp | `/unix-timestamp-converter` | `/epoch-unix-time-clock` / none | Demand demonstrated; page total not separately supplied | “Unix Timestamp Converter \| Seconds, Milliseconds and Dates” / “Unix Timestamp Converter” | Convert entered seconds, milliseconds, or supported microseconds to dates and back. | Live clock is distinct; **ALIGNED** | Retain. |
| general multi-city world clock | `/world-clock` | `/world-clock-with-seconds`, `/world-clock-with-milliseconds` / none | 11 clicks, 683 impressions | “World Clock Online \| Current Time in Multiple Cities” / “World Clock” | Search and compare multiple selected IANA zones. | Display-precision variants adjacent; **SUSPECTED CANNIBALIZATION** | Retain; monitor modifier ownership. |
| world clock with seconds | `/world-clock-with-seconds` | `/world-clock`, `/world-clock-with-milliseconds` / none | Demand demonstrated; page total not separately supplied | “World Clock with Seconds \| Multiple Time Zones” / “World Clock With Seconds” | Compare multiple zones with explicit second-level display. | Variant overlap; **ALIGNED** | Retain; monitor. |
| world clock with milliseconds | `/world-clock-with-milliseconds` | `/world-clock`, `/clock-with-milliseconds` / none | 4 clicks, 389 impressions | “World Clock with Milliseconds \| Multiple Time Zones” / “World Clock With Milliseconds” | Compare multiple zones with millisecond rendering caveats. | Variant overlap; **ALIGNED** | Retain. |
| convert a time between zones | `/time-zone-converter` | `/time-zone-meeting-planner`, `/world-clock` / none | 5 clicks, 1,193 impressions | “Time Zone Converter \| Convert Times Between Cities” / “Time Zone Converter” | Convert one selected wall time/date between two IANA zones. | Planner is multi-zone planning; **ALIGNED** | Retain. |
| compare meeting times across zones | `/time-zone-meeting-planner` | `/time-zone-converter`, `/world-clock` / none | 0 clicks, 1,432 impressions | “Time Zone Meeting Planner \| Compare Working Hours” / “Time Zone Meeting Planner” | Compare a selected date’s candidate working-hour windows across several zones. | Historical CTR predates clarified workflow; **MONITOR AFTER RECRAWL** | Retain and monitor planner queries. |

## Date and work calculations

| Query intent | Primary canonical | Supporting pages / aliases | Historical signal | Current title / H1 | User intent and functional value | Risk and status | Final action / monitoring note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| add or subtract time from a date | `/date-calculator` | `/date-duration-calculator` / none | 4 clicks, 1,084 impressions | “Date Calculator \| Add or Subtract Days, Weeks, and Months” / “Date Calculator” | Shift one date by entered calendar units with month-end behavior explained. | Distinct from between-date duration; **MONITOR AFTER RECRAWL** | Retain. |
| duration between two dates | `/date-duration-calculator` | `/weeks-between-dates-calculator`, `/months-between-dates-calculator` / none | Demand demonstrated; page total not separately supplied | “Date Duration Calculator \| Time Between Two Dates” / “Date Duration Calculator” | Return elapsed days, inclusive representation, and weeks-plus-days for two dates. | Specialized unit routes adjacent; **ALIGNED** | Retain general duration ownership. |
| weeks between dates | `/weeks-between-dates-calculator` | `/date-duration-calculator` / none | 1 click, 4,243 impressions | “Weeks Between Dates Calculator \| Weeks and Days” / “Weeks Between Dates Calculator” | Return total days, whole weeks, remaining days, and decimal weeks with policies/examples. | Historical CTR predates tested improvements; **MONITOR AFTER RECRAWL** | Retain; monitor queries by page. |
| months between dates | `/months-between-dates-calculator` | `/date-duration-calculator` / none | 0 clicks, 1,015 impressions | “Months Between Dates Calculator \| Calendar Months and Days” / “Months Between Dates Calculator” | Return completed calendar months and remaining days using real month lengths. | Day-based duration route adjacent; **MONITOR AFTER RECRAWL** | Retain. |
| days until a date | `/days-until-calculator` | `/date-duration-calculator` / none | 1 click, 983 impressions | “Days Until Calculator \| Count Days to a Date” / “Days Until Calculator” | Count elapsed calendar days from today or an entered start date to a target. | Event countdown adjacency is functional, not calculator intent; **ALIGNED** | Retain. |
| hours until date and time | `/hours-until-calculator` | `/days-until-calculator` / none | Demand demonstrated; page total not separately supplied | “Hours Until Calculator \| Time Remaining to a Date” / “Hours Until Calculator” | Compute elapsed local hours to a target while reflecting DST. | Low overlap; **ALIGNED** | Retain. |
| weekday for a date | `/weekday-calculator` | `/week-number-calculator` / none | Demand demonstrated; page total not separately supplied | “Weekday Calculator \| Find the Day of the Week” / “Weekday Calculator” | Find weekday/weekend status for one date. | Low overlap; **ALIGNED** | Retain. |
| ISO week number | `/week-number-calculator` | `/weekday-calculator` / none | Demand demonstrated; page total not separately supplied | “ISO Week Number Calculator \| Week of Year” / “Week Number Calculator” | Return ISO week-year, week number, and Monday–Sunday range. | Low overlap; **ALIGNED** | Retain. |
| count weekdays between dates | `/business-days-calculator` | `/workdays-calculator` / none | Demand demonstrated; page total not separately supplied | “Business Days Calculator \| Count Weekdays Between Dates” / “Business Days Calculator” | Count Monday–Friday days with endpoint inclusion and no-holiday policy. | Custom-workweek route adjacent; **ALIGNED** | Retain standard-week ownership. |
| count a custom workweek | `/workdays-calculator` | `/business-days-calculator` / none | Demand demonstrated; page total not separately supplied | “Workdays Calculator \| Count a Custom Workweek” / “Workdays Calculator” | Count selected working weekdays between dates; holidays are not inferred. | Distinct configurable policy; **ALIGNED** | Retain. |
| add/subtract clock time | `/time-calculator` | `/time-duration-calculator` / none | Demand demonstrated; page total not separately supplied | “Time Calculator \| Add and Subtract Durations” / “Time Calculator” | Add/subtract entered duration units or compare unzoned times. | Duration-between route adjacent; **ALIGNED** | Retain. |
| duration between clock times | `/time-duration-calculator` | `/time-calculator` / none | Demand demonstrated; page total not separately supplied | “Time Duration Calculator \| Hours and Minutes Between Times” / “Time Duration Calculator” | Calculate elapsed time, including overnight rollover and decimal hours. | Clear distinction; **ALIGNED** | Retain. |
| one shift / simple work period | `/work-hours-calculator` | `/time-card-calculator` / none | Demand demonstrated; page total not separately supplied | “Work Hours Calculator \| Shift Time with Breaks” / “Work Hours Calculator” | Calculate one shift with an unpaid break and overnight handling. | Multi-row tools distinct; **ALIGNED** | Retain. |
| punch-style time card | `/time-card-calculator` | `/weekly-timesheet-calculator`, `/work-hours-calculator` / none | Demand demonstrated; page total not separately supplied | “Time Card Calculator with Breaks \| Work Hours Total” / “Time Card Calculator” | Total multiple punch rows and breaks with incomplete-row handling. | Weekly fixed rows distinct; **ALIGNED** | Retain. |
| full weekly total | `/weekly-timesheet-calculator` | `/time-card-calculator` / none | Demand demonstrated; page total not separately supplied | “Weekly Timesheet Calculator \| Daily and Weekly Hours” / “Weekly Timesheet Calculator” | Total fixed weekday rows and per-day results. | Clear weekly intent; **ALIGNED** | Retain. |
| entered billable values | `/billable-hours-calculator` | `/billable-hours-clock` / none | Demand demonstrated; page total not separately supplied | “Billable Hours Calculator \| Time, Rate, and Rounding” / “Billable Hours Calculator” | Estimate entered time/rate subtotal with optional rounding. | Live tracker distinct; **ALIGNED** | Retain; keep accounting/payroll limitation visible. |
| live billable tracking | `/billable-hours-clock` | `/billable-hours-calculator` / none | Demand demonstrated; page total not separately supplied | “Billable Hours Clock \| Live Time and Cost Tracker” / “Billable Hours Clock (Live Timer)” | Run a live timer with break, rounding, rate, copy, fullscreen, and print. | Clear live workflow; **ALIGNED** | Retain. |

## Preset-duration ownership

Each duration is a distinct preselected countdown rather than a new timing engine. The current shared implementation differentiates titles, descriptions, use cases, FAQs, and related choices; `/countdown-timer` remains the primary custom-duration tool.

| Query intent | Primary canonical | Current title / H1 | Status and action |
| --- | --- | --- | --- |
| custom countdown | `/countdown-timer` | “Countdown Timer Online \| Start, Pause and Fullscreen” / “Countdown Timer” | **ALIGNED**; retain as custom-duration owner. |
| seconds timer | `/seconds-timer` | “Seconds Timer Online \| Set a Short Countdown” / “Seconds Timer” | **ALIGNED**; retain flexible short-seconds page. |
| one-minute timer | `/1-minute-timer` | “1 Minute Timer Online \| Start a 60-Second Countdown” / “1 Minute Timer” | **ALIGNED**; monitor exact-duration queries. |
| five-minute timer | `/5-minute-timer` | “5 Minute Timer Online \| Quick Break or Task Countdown” / “5 Minute Timer” | **ALIGNED**; monitor exact-duration queries. |
| ten-minute timer | `/10-minute-timer` | “10 Minute Timer Online \| Start, Pause and Fullscreen” / “10 Minute Timer” | **ALIGNED**; monitor exact-duration queries. |
| fifteen-minute timer | `/15-minute-timer` | “15 Minute Timer Online \| Focus and Activity Countdown” / “15 Minute Timer” | **ALIGNED**; monitor exact-duration queries. |
| thirty-minute timer | `/30-minute-timer` | “30 Minute Timer Online \| Half-Hour Countdown” / “30 Minute Timer” | **ALIGNED**; monitor exact-duration queries. |

## Protected specialty assets

These routes have distinct tools and supplied evidence of niche engagement. They are not consolidation candidates.

| Primary canonical | Current title / H1 | Functional value | Status and monitoring |
| --- | --- | --- | --- |
| `/speedrun-timer` | “Speedrun Timer (Splits, Fullscreen Stopwatch)” / “Speedrun Timer” | Stopwatch with run splits. | **ALIGNED**; protect and monitor engagement. |
| `/exam-timer` | “Exam Timer (Fullscreen Countdown for Tests & Practice)” / “Exam Timer (Fullscreen Countdown)” | Configurable test/practice countdown with fullscreen and warnings. | **ALIGNED**; protect. |
| `/chaos-timer` | “Random Interval Timer (Unpredictable Countdown, Fullscreen)” / “Chaos Timer (Random Interval Timer)” | Generates unpredictable intervals. | **ALIGNED**; protect. |
| `/binary-clock` | “Online Binary Clock (View Current Time in Binary)” / “Binary Clock (Time in Binary)” | Interactive BCD/pure-binary time display. | **ALIGNED**; protect. |
| `/hexadecimal-clock` | “Hexadecimal Clock (View Current Time in Hex)” / “Hexadecimal Clock” | Live hexadecimal clock with format controls. | **ALIGNED**; protect. |
| `/astronomical-clock` | “Online Astronomical Clock (Live Sun, Moon, Day & Night)” / “Astronomical Clock (Sun, Moon, Sunrise, Sunset)” | Location/date-based daylight and sky-cycle display. | **ALIGNED**; protect; estimates remain disclosed. |
| `/fibonacci-clock` | “Fibonacci Clock (Live Time Using Fibonacci Squares + Time Zones)” / “Fibonacci Clock (Time Zones + Explore)” | Encodes time in Fibonacci squares with exploration controls. | **ALIGNED**; protect. |

## Unsupported query targets

The following are **UNSUPPORTED QUERY, DO NOT TARGET** unless a real matching feature is later implemented and reviewed:

- floating clock with milliseconds
- picture-in-picture clock
- microsecond clock (conversion support on the Unix converter does not make it a live microsecond clock)
- nanosecond clock
- exact synchronized atomic time
- certified time
- laboratory precision
- official military time source
- UTC offset doorway pages
- country-specific clock doorway pages
- city-specific timer pages
- unrelated navigational brand queries
- irrelevant local-intent queries such as local pizza search
- spelling variants already covered naturally
- exact conversion-value doorway pages, including separate 1,000 ms or 60,000 ms URLs

“Exact time with milliseconds” may be discussed only to distinguish displayed digits from system-clock accuracy, browser rendering, and the absence of external synchronization. It must not become a precision claim.

## Suspected cannibalization summary

No cannibalization is confirmed from the supplied aggregate exports. Query + Page review is most important for:

- `/atomic-clock` versus `/clock-with-milliseconds`
- `/analog-clock-with-second-hand` versus `/smooth-second-hand-clock`
- `/world-clock`, `/world-clock-with-seconds`, and `/world-clock-with-milliseconds`
- `/military-time-clock` versus `/24-hour-clock`
- general date-duration routes versus unit-specific weeks/months routes
- the new combined routes and their established component tools

Current functions and metadata provide defensible distinctions, so no redirect, noindex, deletion, or canonical consolidation is justified by the available evidence.

## Manual Search Console follow-up

Export **Query, Page, Clicks, Impressions, CTR, and Position** together for the milliseconds, atomic clock, analog/fullscreen, military converter, world-clock variants, timezone tools, date calculators, and combined timer clusters. Inspect whether the intended owner receives the matching modifiers and whether Google selects a different canonical. Codex did not access live Search Console.

## GSC and Bing monitoring plan

After deployment and recrawl:

1. Compare the next 28 days with the previous 28 days, then use a three-month comparison.
2. Review query-plus-page exports, page indexing, selected canonical, sitemap processing, CTR, average position, impressions, and clicks.
3. Monitor new routes separately: `/timer-stopwatch`, `/study-stopwatch`, and `/timer-clock`.
4. Monitor historically weak high-impression routes: `/military-time-converter`, `/milliseconds-converter`, `/weeks-between-dates-calculator`, `/months-between-dates-calculator`, and `/time-zone-meeting-planner`.
5. Protect and monitor established assets: `/atomic-clock`, `/analog-clock`, `/millisecond-timer`, `/online-alarm-clock`, `/silent-timer`, `/speedrun-timer`, and `/exam-timer`.
6. Do not infer failure from short-term volatility or create query-variant pages. Revisit consolidation only with joined query/page evidence and a product-value review.

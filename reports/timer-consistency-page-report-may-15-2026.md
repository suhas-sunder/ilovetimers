# Timer Consistency Page Report - May 15, 2026

Branch: `consistency-update-may-15-2026`

This report is based on the current `git diff`, the sitemap route list, and the rendered audit run against `http://localhost:3008`.

## Shared Changes

- `app/app.css`: added the shared timer-first layout system.
  - `.timer-page-shell` forces a white light-theme page background.
  - `.timer-page-primary` moves the tool section ahead of intro/support content.
  - `.timer-page-intro` removes the top border/background emphasis and is ordered below the tool.
  - `.timer-tool-card` removes the old outer card border, radius, and shadow.
  - `.timer-display-surface` removes display borders, nested backgrounds, and display shadows.
  - `.timer-first-stack` orders the display first, controls/settings second, title/description last.
  - Timer surfaces now start near the top of the tool area instead of centering a large empty band above the clock.
  - Direct status labels, shortcut legends, and direct control groups inside shared display surfaces are ordered below the primary clock display.
  - Shared rules flatten remaining nested rounded cards inside timer tool areas.
  - Buttons and checkbox labels use light shadows instead of borders.
  - Desktop and mobile timer-surface sizing was adjusted so the clock uses available width without forcing a tall empty viewport-height block under the clock.
  - Wide viewports now allow a broader primary timer section, while mobile keeps reduced surface height.
  - Routes whose fit-text hooks initially rendered at the minimum size now start from a responsive text-length-aware CSS `clamp()` value, then run the real fit measurement in `useLayoutEffect` before paint.
  - The immediate post-paint `requestAnimationFrame` sizing pass was removed from fitted timer hooks, so reloads no longer intentionally paint an intermediate clock size before settling.
  - Mobile Retro Flip Clock uses a responsive one-line flip row so seconds do not wrap below the main clock.
- `server.js`: changed the local default to `PORT=3008` and `HMR_PORT=3009`.
- `public/sitemap.xml`: corrected the meeting count-up URL from `/meeting-countup-timer` to `/meeting-count-up-timer`.

## Latest Targeted Fixes After Visual Review

- `/egg-timer`: centered every normal-mode control group under the clock, moved presets and inputs into shared centered rows, kept the title/description below the tool, and kept the display surface borderless.
- `/multiple-timers`: rebuilt the normal layout around two centered timer panels, moved each panel's time display to the top, restored only a subtle repeated-item card treatment for each independent timer, and moved global controls/settings under the timer grid.
- `/debt-clock`: removed the lone floating fullscreen row and integrated Fullscreen into the primary Pause/Reset/Copy control row under the debt display.
- `/milliseconds-converter`: promoted the converted value into the first primary display, enlarged it, and moved the input, mode tabs, examples, Reset, and Copy beneath the value.
- `/work-hours-calculator`: centered the paid-time result and summary metrics in the primary display, then moved time inputs and copy/options below that result.
- `/time-zone-converter`: centered and enlarged the From/To conversion result, moved quick pairs and inputs under the result, and kept action buttons below the main display.
- `/time-calculator`: moved mode tabs plus Reset/Copy below the big result instead of leaving them above the calculator display.
- `/binary-clock`: added the missing normal-mode `timer-first-stack` wrapper so options now sit beneath the binary display instead of at the top-right of the viewport.
- `/world-clock`: reordered the normal view so selected city clocks appear first, with search, popular city chips, local-time summary, and actions below.
- `/lab-timer`: reordered the dual stopwatch/countdown panels so both clocks appear before their panel settings; labels and lap/setup controls now sit below the displays.
- `/atomic-clock`: moved `Live/Frozen`, `Freeze`, `Hide ms`, and shortcut text below the milliseconds clock. Lowered the normal-mode minimum fit size so the milliseconds display fits on mobile.
- `/retro-flip-clock`: moved the local-time legend under the flip digits, aligned the route-specific display shell to the top, enlarged wide desktop flip digits, and tightened mobile flip sizing so seconds stay on one row.
- `/sleep-timer`: kept the larger timer treatment, but capped the initial fit size so the first paint does not clip before measurement settles.
- `/analog-clock`: moved the local clock legend under the analog face and aligned the route-specific display shell to the top.
- `/pace-timer`: moved the status legend below the time and aligned the route-specific display shell to the top.
- `/lab-timer`: moved the step countdown status below the countdown time and aligned the countdown shell to the top.
- `/reaction-time-test`: aligned the route-specific stage shell to the top so it no longer re-centers inside a large blank area.
- Broad fit-text first-paint fix: updated the duplicated `useFitText` hook instances across fitted timer routes so the initial SSR/client font value is responsive instead of `minPx`; measured sizes still take over after layout calculation.
- Broad display-height fix: reduced the shared normal-mode timer display minimum height, added a medium-screen cap, and made mobile display surfaces content-height based so controls stay close to the clock.

## Canonical Sitemap Routes

The sitemap has 44 routes total: Home, About, and 42 tool pages.

| Route | File | Changes Made |
|---|---|---|
| `/` | `app/routes/home.tsx` | Flattened timer-style display elements to shared white light theme. Changed ghost controls from bordered buttons to light shadow controls. |
| `/about` | `app/routes/about.tsx` | No direct file change. |
| `/online-timer` | `app/routes/online-timer.tsx` | Added white timer page shell. Promoted main tool section above page intro/support content. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible to support larger clocks. |
| `/countdown-timer` | `app/routes/countdown-timer.tsx` | Added white timer page shell. Moved intro below tool. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/stopwatch` | `app/routes/stopwatch.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card and lap panel styling through shared rules. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. |
| `/pomodoro-timer` | `app/routes/pomodoro-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card and long-break panel. Added timer-first ordering. Added shared white display surface. Changed controls to light shadow. Enlarged clock via shared surface/font sizing. |
| `/silent-timer` | `app/routes/silent-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/fullscreen-timer` | `app/routes/fullscreen-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/study-timer` | `app/routes/study-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/productivity-timer` | `app/routes/productivity-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/meeting-timer` | `app/routes/meeting-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/meeting-count-up-timer` | `app/routes/meeting-count-up-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Corrected canonical URL string from `/meeting-countup-timer` to `/meeting-count-up-timer`. |
| `/presentation-timer` | `app/routes/presentation-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/workout-timer` | `app/routes/workout-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/rest-timer` | `app/routes/rest-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/tabata-timer` | `app/routes/tabata-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/round-timer` | `app/routes/round-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/pace-timer` | `app/routes/pace-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Targeted fix: wrapped the local page structure so title/description moves under the clock and settings flatten below it. Latest pass moved the status legend below the time and aligned the inner shell to the top. |
| `/stretch-timer` | `app/routes/stretch-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/tea-timer` | `app/routes/tea-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/egg-timer` | `app/routes/egg-timer.tsx` | Added white timer page shell. Moved intro below tool. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. Latest pass centered sound/fullscreen, presets, duration inputs, Start/Reset, shortcuts, and tip under the clock. |
| `/pizza-timer` | `app/routes/pizza-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/reaction-time-test` | `app/routes/reaction-time-test.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Changed ghost controls to light shadow. Targeted fix: reaction stage now uses `timer-display-surface`, removing the bordered nested stage look. Latest pass aligned the inner reaction stage shell to the top. |
| `/video-game-challenge-timer` | `app/routes/video-game-challenge-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/speedrun-timer` | `app/routes/speedrun-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card and split panel styling through shared rules. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/speedcubing-timer` | `app/routes/speedcubing-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card and solve panel styling through shared rules. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/lab-timer` | `app/routes/lab-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Changed ghost controls to light shadow. Targeted fix: the dual stopwatch/countdown surface comes before the Lab Timer title/description and the two inner panels are flattened. Latest pass moved both panel displays ahead of their panel settings and moved the step countdown legend below the time. |
| `/multiple-timers` | `app/routes/multiple-timers.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Latest pass centered the two-timer grid, moved timer values to the top of each independent timer panel, and consolidated global controls under the timer grid. |
| `/visual-timer` | `app/routes/visual-timer.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/world-clock` | `app/routes/world-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Latest pass moved selected city clocks above search/popular controls so the route opens with clocks first. |
| `/utc-clock` | `app/routes/utc-clock.tsx` | Added white timer page shell. Moved intro below tool. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/time-zone-converter` | `app/routes/time-zone-converter.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Changed ghost controls to light shadow. Made normal display overflow visible. Targeted fix: conversion result panel now uses `timer-display-surface`. Latest pass centered and enlarged the From/To result and moved quick pairs, inputs, and actions below it. |
| `/sunrise-sunset-clock` | `app/routes/sunrise-sunset-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/moon-phase-clock` | `app/routes/moon-phase-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/morse-code-clock` | `app/routes/morse-code-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/swatch-internet-time-clock` | `app/routes/swatch-internet-time-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/retro-flip-clock` | `app/routes/retro-flip-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface around the flip clock. Changed controls to light shadow. Kept flip digit shadows because they are part of the clock face, not the removed nested card shell. Latest pass moved the local-time legend below the flip digits, aligned the display shell to the top, expanded wide desktop sizing, and kept mobile seconds on one row. |
| `/minimalist-clock` | `app/routes/minimalist-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/roman-numeral-clock` | `app/routes/roman-numeral-clock.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |
| `/time-calculator` | `app/routes/time-calculator.tsx` | Added white timer page shell. Promoted tool first. Flattened outer calculator cards through shared rules. Added shared white display surface to the result. Changed ghost controls to light shadow. Targeted fix: result display is now the first visual focus and the page title/description moved under the tool. Latest pass moved mode tabs and result actions under the large result. |
| `/work-hours-calculator` | `app/routes/work-hours-calculator.tsx` | Added white timer page shell. Promoted tool first. Flattened outer card. Added timer-first ordering. Added shared white display surface to the paid-time result. Changed ghost controls to light shadow. Targeted fix: paid-time result uses larger clock-style type. Latest pass centered the result and summary metrics, with all inputs/options below. |
| `/military-time-converter` | `app/routes/military-time-converter.tsx` | Added white timer page shell. Promoted tool first. Flattened outer timer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Raised normal-mode font cap. Made normal display overflow visible. |
| `/milliseconds-converter` | `app/routes/milliseconds-converter.tsx` | Added white timer page shell. Promoted tool first. Flattened outer converter card. Added timer-first ordering. Changed ghost controls to light shadow. Targeted fix: conversion result was promoted into the primary surface and title/quick examples moved below. Latest pass made the converted value the first and largest element, with input, mode tabs, examples, Reset, and Copy underneath. |
| `/metronome` | `app/routes/metronome.tsx` | Added white timer page shell. Promoted tool first. Flattened outer card. Added timer-first ordering. Added shared white display surface. Changed ghost controls to light shadow. Made normal display overflow visible. |

## Extra Route Files Touched Outside The 44-Route Sitemap Set

These were touched by the broad route sweep even though they are not in the 44-route sitemap acceptance set. This is scope that should not be hidden.

- `app/routes/alarm-timer.tsx`
- `app/routes/amrap-timer.tsx`
- `app/routes/analog-clock.tsx`
- `app/routes/astronomical-clock.tsx`
- `app/routes/atomic-clock.tsx`
- `app/routes/billable-hours-calculator.tsx`
- `app/routes/billable-hours-clock.tsx`
- `app/routes/binary-clock.tsx` - latest pass added the missing timer-first wrapper so controls moved under the display.
- `app/routes/binary-stopwatch.tsx`
- `app/routes/bpm-tapper.tsx`
- `app/routes/break-timer.tsx`
- `app/routes/breathing-timer.tsx`
- `app/routes/chaos-timer.tsx`
- `app/routes/classroom-timer.tsx`
- `app/routes/cooking-timer.tsx`
- `app/routes/count-up-timer.tsx`
- `app/routes/current-local-time.tsx`
- `app/routes/debt-clock.tsx`
- `app/routes/debt-repayment-timer.tsx`
- `app/routes/digital-clock.tsx`
- `app/routes/drink-water-reminder-timer.tsx`
- `app/routes/emom-timer.tsx`
- `app/routes/epoch-unix-time-clock.tsx`
- `app/routes/event-countdown.tsx`
- `app/routes/exam-timer.tsx`
- `app/routes/fibonacci-clock.tsx`
- `app/routes/focus-session-timer.tsx`
- `app/routes/golden-hour-clock.tsx`
- `app/routes/hexadecimal-clock.tsx`
- `app/routes/hiit-timer.tsx`
- `app/routes/meditation-timer.tsx`
- `app/routes/sleep-timer.tsx`
- `app/routes/time-blocking-clock.tsx`

## Rendered And Route Audit Result

Audit target: 42 tool pages from the sitemap at `http://localhost:3008`, with Home/About making 44 total sitemap routes.

- HTTP route status check after the latest targeted fixes: 44/44 sitemap routes returned 200.
- Browser visual QA after the latest targeted fixes:
  - Full desktop screenshot sweep at 2048x1024 for 44 sitemap routes plus 11 extra touched timer routes.
  - Focused desktop QA for `/egg-timer`, `/multiple-timers`, `/debt-clock`, `/milliseconds-converter`, `/work-hours-calculator`, `/time-zone-converter`, `/time-calculator`, `/binary-clock`, `/world-clock`, and `/lab-timer`.
  - Focused mobile QA at 390x844 for `/egg-timer`, `/multiple-timers`, `/milliseconds-converter`, `/time-zone-converter`, `/lab-timer`, `/binary-clock`, and `/world-clock`.
  - Interaction proof: `/egg-timer` Start changed to Pause after click.
  - `/atomic-clock` at 2048x1024 and 390x844.
  - `/sleep-timer` at 2048x1024 and 390x844.
  - `/retro-flip-clock` at 2048x1024 and 390x844.
  - `/hiit-timer` at 1280x720 and 390x844 after the first-paint sizing fix; the route from the reported screenshot now renders large immediately and does not clip on mobile.
  - Sampled `/egg-timer`, `/debt-clock`, and `/online-timer` at 1280x720 after the first-paint sizing fix.
  - `/pomodoro-timer` at 1115x1490 and 390x844 after the display-height fix; controls now sit directly under the timer rather than after a large empty block.
- The latest Browser pass confirmed the clock/result is first, settings/legends sit below the primary display, and the checked mobile routes do not clip or overlap.
- Earlier full rendered audit against the 42 sitemap tool pages before the final targeted route fixes reported:
- Status problems: none.
- Missing display surface: none.
- Title above primary display: none.
- Nested card routes detected by the audit: none.

## Verification Commands Run

- `npm run typecheck`
- Source scan for remaining `useState<number>(minPx)` fit-text initializers: none found.
- SSR HTML spot check for `/hiit-timer`, `/egg-timer`, `/debt-clock`, `/online-timer`, and `/stopwatch`: no small initial fitted timer font sizes detected.
- `npm run build`
- `git diff --check`
- 44-route HTTP status check against `http://localhost:3008`
- Browser viewport QA at 2048x1024 and 390x844 for the targeted route set listed above

# Rendered visual and accessibility review

## Reviewed evidence

All 22 contact sheets were visually inspected: 132 routes ×1440/390 ×light/dark (528 top-viewport panels). Original full-page JPEGs accompany the JSON register; sheets are overview crops, not substitutes for reading fine print. All 20 protected/elevated production screenshots were also reviewed. Screenshots are real rendered browser output, not design mocks. [Contact01](evidence/2026-W46/contacts/01.png) through [contact22](evidence/2026-W46/contacts/22.png); [production contact](evidence/2026-W46/production-contact.png). Exact route→sheet mapping is in the CSV.

Additional baseline geometry covers 12 prototypes ×320/375/768/1024/1920 ×light/dark =120 cases, all with reduced-motion preference. 48 extra 375/1920 viewport screenshots are under screens/extra. Six native-keyboard reproductions and 24 CSS-zoom/forced-color probes bring that file to 150 cases. CSS zoom probes reported overflow; **this probe is not physical browser zoom and its coordinate comparison is not sufficient to file 24 accessibility defects**. Actual browser 200–400% zoom/screen-reader acceptance remains unverified. 320 CSS-pixel reflow evidence is separate.

## Observations by group

| Sheets | Reviewed pages / useful distinction | Finding |
|---|---|---|
|01–03 | Home, archive, trust, guides, base countdown/combined/stopwatch | Homepage is compact navigation-first. Archive preserves four tools. Trust pages have plain reading flow. Guides legitimately put article titles before prose. Countdown display is dominant even though CSS and DOM order differ. No redesign justified. |
|04–11 | Stopwatch, focus, presets, classroom, workout, kitchen, multi/specialty timers | Large time values and reachable Start controls. Preset/config density differs for meaningful workflows. Dark primary emphasis varies; not automatically a defect. Multi-timer and lab expose independent displays. Native Reset Space failure independently reproduced. |
|12–18 | Specialty/world/digital/analog/date-event/astronomy/Unix/zone/reaction/rhythm | Atomic final digit split and world milliseconds split are verified. Current-local and roman AM/PM wrap remains readable P2. Converter date+time multi-line layout is legitimate, not a broken clock digit. Binary/Fibonacci/flip specialized faces preserved. Astronomy unavailable-location states disclose limits. |
|19–22 | Date/work calculators, birthday, ms, Unix, chess, legal, sitemap | Results precede inputs/help. Overnight/break/inclusive labels visible. Birthday default “Today” is meaningful, not zero failure. Full footer directory remains. Legal disclosures are intentional. No horizontal overflow in baseline 390/1440. |

## Repairs and proof

- Atomic: 10/42 red states to 42/42 one-line/in-stage cases, seven widths, both themes, milliseconds on/off, fullscreen. `tracking-normal` changes no timing/math/metadata. [Before1440](evidence/2026-W46/atomic-before/1440-light.png), [after1440](evidence/2026-W46/atomic-after/1440-light.png).
- World milliseconds: local desktop slot was sized from viewport rather than grid column. CSS-only row container sizing retains numeric prominence and avoids post-hydration measurement. See [baseline sheet13](evidence/2026-W46/contacts/13.png), [after screenshots](evidence/2026-W46/screens/world-after/1440-light.png), [regression matrix](evidence/2026-W46/fix-regressions-after.json). Both 12/24 hour and fullscreen required.
- Native Space: red Reset invokes Start/Pause on four sampled routes, while study/combined controls work. The shared guard preserves native action rather than preventDefault. Must retain background shortcuts and cubing hold-to-start; no icon-only replacement.
- HIIT transition fix has no intended visual/layout change; phase/state is asserted under simulated callback timing.

## Accessibility scope

All baseline visible main controls have programmatic names under the collector's label heuristic; H1 count 1 and no viewport overflow. This is not an axe/WCAG certification. Existing source a11y audit passes. Actual focus/DOM ordering, touch targets, disabled states, live-region rates, native select and menu behavior are recorded in snapshots and existing final-browser report. Exact below 24 px controls, if any, are candidates requiring purpose/spacing inspection, not automatic removal.

No accessible focus-visible style was removed. ToolFrame itself has inherited outline suppression, which deserves keyboard/assistive review under UI05/F06 rather than decorative outline changes. Native button labels remain. No new palette, cards, gradients, layout borders, animations or global fitting pass. Dark mode stays user-selected light/dark with key ilt-theme-mode and default light, including invalid/denied storage. No system theme.

## Advertising and limits

Local ad scripts were blocked, explicitly **not an unfilled network simulation**. Production requests were allowed on 20 captures and analytics blocked. Some real creatives filled; static snapshots did not reveal placeholder overlay, but they do not cover all refresh/navigation/consent transitions. Reserved whitespace and existing fill handling are unchanged; the required global first-fill invariant still needs navigation evidence. No reduction of ad gaps is approved.

Actual mobile lock/sleep, audible cues, platform fullscreen/safe areas, physical zoom, assistive technologies and field CWV remain owner/device gates. Full-page files establish capture, not a claim every line of all 132 support articles received human factual review. Remaining gaps are explicit in each CSV row and the 2027 manifest.

## Final rendered review

The repaired 1440 px atomic and world-millisecond images were opened and visually inspected: complete numeric values remain on one line, with readable controls and the existing content hierarchy. The final Firefox/WebKit matrix is **52/56**; captures are linked from [its receipt](evidence/2026-W46/cross-browser-final.json). These checks supplement, rather than replace, the manual device and assistive-technology gates.

# Timer UI Foundation

Use `PageShell` for route pages and `ToolHero` for utility-first layouts where the timer, clock, converter, or calculator result appears before long content.

Keep tool pages to one visible page title and one short description. Use the `ToolHero` title and description for that purpose, and avoid repeating the route name inside the active display, settings, shortcut help, or SEO section unless the label describes functional state.

Use `DisplayStage` or `ToolFrame` for the primary display area. `ToolFrame` may remain focusable for page-level keyboard shortcuts, but it should not draw a container-sized focus ring. Compose controls with `Button`, `ButtonLink`, `IconButton`, `PresetChip`, `StatusChip`, `Toggle`, `Field`, and `Select` instead of route-local control primitives.

Timer controls should follow one shared rhythm. Put main Start, Pause, Resume, Lap, Next, Stop, and Reset actions in `ControlGroup` directly below the display. Put common duration or mode choices in `PresetGroup` below primary controls. Put custom fields, selects, toggles, and secondary setup in `SettingGroup` and `SettingRow`. Put fullscreen, copy, share, print, clear, sound test, add, and remove actions in `SecondaryActionRow` unless one is the route's primary action. Keep keyboard hints compact with `ShortcutHint`, and keep laps, results, summaries, or status rows secondary with `UtilityResultRow`.

Shared action icons belong in the UI foundation, not in route files. `Button` automatically adds the standard Lucide icon for common plain-text actions such as Start/Resume, Pause, Reset, Stop, Fullscreen, Copy, Share, Settings, Clear, Add/Remove, Download, Print, Previous/Next, Lap, confirmation, and sound controls. Use `semanticIcon` only when a button's meaning cannot be inferred reliably, `semanticIcon={false}` to opt out, or `leadingIcon`/`trailingIcon` for a genuinely specialized action. Keep important controls as icon plus text rather than icon-only. `IconButton` is reserved for universally recognizable secondary actions and must retain an accurate accessible label. Do not import Lucide directly into individual timer routes for actions already covered by this shared system. When a new common action needs an icon, extend the shared semantic action mapping once instead of implementing it separately in multiple routes.

Display text must use the same size at server paint and after hydration. `DisplayStage` carries the stable `ilt-display-stage` container-sizing contract, and `useFitDisplayText` returns deterministic container-relative CSS for large single-line timer or clock values. Do not add live-element measurement, delayed resize passes, or per-tick font updates back to this hook.

Use the route-opt-in visual stack classes in `app.css` for family rhythm. `timer-interaction-stack` is for specialty interaction and audio tools where the tap target, reaction state, beat display, or random timer state is the primary action surface; keep secondary stats, history, shortcuts, and settings visually quiet around that stage.

Use `SettingsPanel` and `SettingsDrawer` for compact setup areas, `SeoBand` for explanatory content below the tool experience, and `ContentPage`, `ContentSection`, or `ContentPanel` for non-tool informational pages. Content primitives should create readable rhythm without boxed sections by default.

Live advertising is centralized in `clients/components/ads/AdSense.tsx`. The AdSense loader belongs in the document head once, and `AdSenseUnit` owns individual requests. Actual ad units must remain visible while requesting. Fallback placeholders start hidden and become visible only when every requested unit on the page is confirmed `data-ad-status="unfilled"` or `data-ad-status="unfill-optimized"`; if any unit is `filled`, every fallback stays hidden. The only fallback label is `Advertisements`.

The final monetized tool-page contract is:

1. Site nav/header.
2. Fixed-size-per-breakpoint `top-banner` below nav with enough breathing room from navigation. It uses Google's approved 320x50, 468x60, and 728x90 exact responsive sizes and cannot expand vertically.
3. Utility header: display first, primary controls below display, then presets, settings, and secondary actions. No SEO copy, duplicated page title, marketing text, or ad inside controls.
4. Page title section with one visible H1 and one short description.
5. Responsive `below-header-banner` after the utility/title area and before the SEO band.
6. SEO/content section with route-specific body content, related tools, FAQ, notes, or disclaimer. `seo-section-square` stays centered in the reading flow near the midpoint of meaningful SEO content, with deliberate spacing from links and controls. It must not sit in a side column or appear enclosed by a distinct filled, bordered, or panel-like SEO container.
7. Responsive `above-footer-banner` after route content and contextual related tools, before the footer.

Canonical tool, guide, and homepage routes use the shared live placements. `/free-online-timers`, trust pages, legal pages, contact, and `/sitemap` remain ad-free to preserve the archived experience and avoid high-risk or inappropriate placements. Route eligibility lives in `app/clients/config/monetization.ts`; do not improvise route-local units.

The site supports light and dark mode. Light is the default, and the user's explicit choice is stored in localStorage. Theme compatibility comes from the semantic `--ilt-*` tokens in `app.css`. Use shared primitives or token-backed classes for page backgrounds, surfaces, text, controls, inputs, panels, fullscreen bars, SEO bands, and ad placeholders. Avoid route-level hard-coded surface and text colors unless the component is a unique visual renderer.

For route-specific markup that does not justify a new React component, prefer the token-backed utility classes in `app.css`, such as `ilt-surface-card`, `ilt-surface-muted`, `ilt-surface-accent`, `ilt-content-label`, `ilt-content-strong`, `ilt-helper-text`, and `ilt-input-control`. These are for ordinary surfaces, rows, helper text, content callouts, labels, and inputs that need to stay theme-ready without adding route-local styling systems. Keep these helpers subtle, and do not use them to rebuild large card stacks.

Use the shared hooks for cross-route behavior: `useFullscreen`, `useHotkeys`, `usePersistentState`, and `useFitDisplayText`.

Route-local components are acceptable when they implement unique product display logic, such as an analog face, binary grid, flip clock, or specialty renderer. Keep layout, controls, settings, and content framing on shared primitives whenever practical. Route-specific status colors are acceptable when they represent behavior such as warnings, invalid states, phases, or success states.

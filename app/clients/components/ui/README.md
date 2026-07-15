# Timer UI Foundation

Use `PageShell` for route pages and `ToolHero` for utility-first layouts where the timer, clock, converter, or calculator result appears before long content.

Keep tool pages to one visible page title and one short description. Use the `ToolHero` title and description for that purpose, and avoid repeating the route name inside the active display, settings, shortcut help, or SEO section unless the label describes functional state.

Use `DisplayStage` or `ToolFrame` for the primary display area. `ToolFrame` may remain focusable for page-level keyboard shortcuts, but it should not draw a container-sized focus ring. Compose controls with `Button`, `ButtonLink`, `IconButton`, `PresetChip`, `StatusChip`, `Toggle`, `Field`, and `Select` instead of route-local control primitives.

Timer controls should follow one shared rhythm. Put main Start, Pause, Resume, Lap, Next, Stop, and Reset actions in `ControlGroup` directly below the display. Put common duration or mode choices in `PresetGroup` below primary controls. Put custom fields, selects, toggles, and secondary setup in `SettingGroup` and `SettingRow`. Put fullscreen, copy, share, print, clear, sound test, add, and remove actions in `SecondaryActionRow` unless one is the route's primary action. Keep keyboard hints compact with `ShortcutHint`, and keep laps, results, summaries, or status rows secondary with `UtilityResultRow`.

Display text should start close to its settled size. `DisplayStage` carries the stable `ilt-display-stage` sizing contract, and `useFitDisplayText` should be used for large single-line timer or clock values that need width fitting without a visible hydration shrink.

Use the route-opt-in visual stack classes in `app.css` for family rhythm. `timer-interaction-stack` is for specialty interaction and audio tools where the tap target, reaction state, beat display, or random timer state is the primary action surface; keep secondary stats, history, shortcuts, and settings visually quiet around that stage.

Use `SettingsPanel` and `SettingsDrawer` for compact setup areas, `SeoBand` for explanatory content below the tool experience, and `ContentPage`, `ContentSection`, or `ContentPanel` for non-tool informational pages. Content primitives should create readable rhythm without boxed sections by default.

Use `AdPlaceholder` only for quiet homepage reserved ad areas. It is a visual placeholder, not an ad integration, and it should stay out of active timer tool surfaces unless a dedicated ad-placement pass calls for it. It supports these slot names: `top-banner`, `in-content-square`, and `bottom-banner`. The label should stay policy-safe as `Advertisements`, with no fake calls to action or misleading surrounding headings.

The final monetized tool-page contract is:

1. Site nav/header.
2. Optional desktop `top-banner` ad placeholder below nav with enough breathing room from navigation.
3. Utility header: display first, primary controls below display, then presets, settings, and secondary actions. On mobile-header viewports, the `top-banner` placeholder belongs after this utility/settings stack and before the page title, not above the timer display. No SEO copy, duplicated page title, marketing text, or ad inside controls.
4. Page title section with one visible H1 and one short description.
5. No banner placeholder directly after the page title/header section.
6. SEO/content section with route-specific body content, related tools, FAQ, notes, or disclaimer. `in-content-square` may appear only inside this content area, after useful introductory content, with deliberate spacing from links and controls.
7. Optional `bottom-banner` after FAQ or related content.

Current placeholder policy is homepage-only. `/free-online-timers`, tool routes, trust pages, legal pages, and `/sitemap` are ad-free. Route-level placeholder policy lives in `app/clients/config/monetization.ts`; add future slots from that map instead of improvising in individual routes.

The site supports light and dark mode. Light is the default, and the user's explicit choice is stored in localStorage. Theme compatibility comes from the semantic `--ilt-*` tokens in `app.css`. Use shared primitives or token-backed classes for page backgrounds, surfaces, text, controls, inputs, panels, fullscreen bars, SEO bands, and ad placeholders. Avoid route-level hard-coded surface and text colors unless the component is a unique visual renderer.

For route-specific markup that does not justify a new React component, prefer the token-backed utility classes in `app.css`, such as `ilt-surface-card`, `ilt-surface-muted`, `ilt-surface-accent`, `ilt-content-label`, `ilt-content-strong`, `ilt-helper-text`, and `ilt-input-control`. These are for ordinary surfaces, rows, helper text, content callouts, labels, and inputs that need to stay theme-ready without adding route-local styling systems. Keep these helpers subtle, and do not use them to rebuild large card stacks.

Use the shared hooks for cross-route behavior: `useFullscreen`, `useHotkeys`, `usePersistentState`, and `useFitDisplayText`.

Route-local components are acceptable when they implement unique product display logic, such as an analog face, binary grid, flip clock, or specialty renderer. Keep layout, controls, settings, and content framing on shared primitives whenever practical. Route-specific status colors are acceptable when they represent behavior such as warnings, invalid states, phases, or success states.

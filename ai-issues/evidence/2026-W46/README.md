# W46 diagnostic evidence index

Start with the [findings](../../2026-W46-diagnostic-findings.md), [132-route CSV](../../2026-W46-canonical-page-audit.csv), [validation](../../2026-W46-implemented-fixes-and-validation.md), and [owner walkthrough](../../2026-W46-owner-manual-review.md). These distinguish verified defects, source risks, repairs and unverified states.

## Scope and provenance

- [Preflight](preflight.json): isolation, original dirty worktree, baseline SHAs and hosting safeguards.
- [Inventory](inventory.json), [production HTTP](production-http.json), [rendered links](rendered-link-register.json): 132 canonical pages, 109 indexable, 23 noindex and 28 aliases.
- [Baseline smoke](local-smoke.json), [after smoke](local-smoke-after.json), [final targeted smoke](local-targeted-final.json): complete four-combination route coverage and later scoped reruns. JSON records actual errors, actions, semantics, geometry, screenshots and lab samples.
- [Cross-timezone hydration](timezone-hydration-before.json): 264 cases; 80 failures on 46 routes. This open issue is not closed by the narrow date repair.
- [Live production browser](production-browser.json): 20 captures across 10 protected/elevated routes, real ad requests allowed, analytics blocked.
- [Raw export recalculation](raw-search-recalculation.json), [read-only PostHog check](posthog-ingestion-readonly.json): aggregate evidence; original private exports and credentials are not included.

## Regression receipts

- Atomic: [before](atomic-before/results.json) / [after](atomic-after/results.json), 42 cases each.
- Functional: [corrected baseline](functional-corrected-baseline.json) / [after](functional-after.json), 57 cases. The earlier exploratory file is preserved and its harness mistakes are disclosed.
- Keyboard, cubing and world-clock geometry: [expanded red](fix-regressions-expanded-before.json) / [final 115 cases](fix-regressions-after.json).
- Fibonacci date: [before](fibonacci-date-before.json) / [after](fibonacci-date-after.json), eight assertions each. The separate future-year fixtures also expose the footer-year risk and are not the isolated repair proof.
- [Firefox/WebKit final](cross-browser-final.json): 56 cases; four remaining Firefox world-clock hydration failures. Exploratory first/second receipts retain the transient font and teardown observations.
- [Accessibility baseline](accessibility-before.json): geometry, reduced motion, keyboard reproductions and explicitly limited CSS-zoom probes.

## Screenshots and test output

The 22 numbered files under `contacts/` show all 132 routes in four combinations. `production-contact.png` shows the live sample. Full-page originals live under `screens/local/`; corresponding after captures are under `screens/local-after/`. Focused final captures live under `screens/final-targeted/`, `screens/world-after/`, `screens/cross-browser/`, `atomic-before/` and `atomic-after/`. The CSV and JSON supply exact paths; contact sheets are overview crops, not proof every line of prose was fact-checked.

`suite-*.json` records actual package commands, timestamps, exit codes and log paths. `logs/` retains failures as well as successes. `generated-reports/` contains fresh reports by phase; historical tracked `docs/` files were restored after collection. Inherited labels inside those reports are not independent manual-review evidence.

The Lighthouse offline failure is retained separately. The actual cached-CLI run is [here](generated-reports/lighthouse/docs/final-performance-accessibility.json). [Short-navigation before/after samples](before-after-lab.json) are not controlled field measurements.

## Delivery and safeguards

[Repair commits](commit-register.json) identify coherent changes. [Safety receipt](final-safety.json) records the read-only main/Netlify checks and branch-only authority. No production deployment, billing/config mutation, real ad change, URL migration or main push was performed. Local blocked ads are not treated as an unfilled-ad simulation or proof of global first-fill safety.

Screenshots, logs and JSON are intentional diagnostic artifacts. No build output, dependency tree, raw personal export or browser profile is included.

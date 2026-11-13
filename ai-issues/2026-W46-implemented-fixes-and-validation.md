# Implemented fixes and validation

Status: diagnostic branch only; no production deployment. Review fresh results below and open risks before approval. Base `54c19824b2a76da0ea671e912598fadb3214b8b9`; application baseline equals production `468bda18f09812a9212b3e6a15921dd9ed013542`. Final commit references are recorded in evidence/2026-W46/commit-register.json after commits; no future SHA is invented.

## Coherent patches and rollback

| Scope | Reason/root cause | Minimal patch | Rollback/risk |
|---|---|---|---|
| package-lock.json | clean install fails missing declared lucide 1.43.0 |10 line lock addition; existing entries/resolutions unchanged | Revert that commit; restores known install blocker; no upgrade |
| atomic-clock.tsx | excess tracking wraps fitted digits | tracking-normal on active value only | Revert typography commit; restores wrapping; no timing/metadata change |
| ClockDiscoveryPages.tsx | viewport font cap overfills world grid column | inline-size containers on rows; deterministic cqw formatted-length cap for milliseconds | Revert world typography commit; verify seconds-mode sibling after container change; no JS fitting |
| hiit-timer.tsx | untracked 20 ms callback survives Reset | pending timeout ref, cancellation at explicit interruption boundaries/unmount | Revert race commit only; known restart returns; normal auto-advance must remain |
| foundation.tsx | enclosing shortcut consumes native Space | skip dispatch for native controls/already handled events; do not call preventDefault | Shared scope: revert keyboard commit if any specialty shortcut regresses; all reachable start/pause/reset and full smoke required |
| final-lighthouse.mjs | lab run could send synthetic production traffic | optional network-block flag with reported mode, default unchanged | Remove diagnostic flag support if undesired; no thresholds or product code altered |

## Four review passes (same agent, separate lenses; no independent-human reviewer claim)

1. **Correctness/edges:**lock diff compared existing entries; atomic timing paths untouched; world width bounded by 12/24 h formatted length; HIIT timeout ownership clears before auto-advance and at interruptions but not automatic phase-stop cleanup; native control default action remains. Red receipts precede patches. Functional final **57/57**, targeted matrix **115/115**. Re-check recorded failures before acceptance.
2. **Cross-route/architecture:**ToolFrame call sites and route inventory inspected; reachable native Start/Pause/Reset swept. World discovery tool used by milliseconds and seconds exported pages; established seconds alias remains redirected, existing world-clock route unchanged. Shared tokens/hooks/URLs/state keys retained. 132 route smoke and existing typecheck/build/static suites required after final patch.
3. **Visual/mobile/keyboard:**all 22 baseline contact sheets reviewed; atomic 42 states and world 56 states plus after screenshots; six-route native reset red comparison and broader green sweep; seven widths/two themes where changed. Screen reader/physical zoom/touch/audio not claimed.
4. **Deployment/SEO/ad/privacy:**no routes, metadata, sitemap, redirects, ad components, latch, analytics config, storage keys or Netlify config edited. Static build/no server runtime verified. Production analytics blocked in local tests; actual ad mocks separated from livecreative proof. Netlify/main recheck and branch-only push required at handoff.

## Package suite receipts

| Phase | Actual command | Exit | Log |
|---|---|---|---|
| static | `npm run audit:static-deployment` | 0 | [static-audit-static-deployment.log](evidence/2026-W46/logs/static-audit-static-deployment.log) |
| static | `npm run audit:seo` | 0 | [static-audit-seo.log](evidence/2026-W46/logs/static-audit-seo.log) |
| static | `npm run audit:links` | 0 | [static-audit-links.log](evidence/2026-W46/logs/static-audit-links.log) |
| static | `npm run audit:presets` | 0 | [static-audit-presets.log](evidence/2026-W46/logs/static-audit-presets.log) |
| static | `npm run audit:time-tools` | 0 | [static-audit-time-tools.log](evidence/2026-W46/logs/static-audit-time-tools.log) |
| static | `npm run test:technical-time` | 0 | [static-test-technical-time.log](evidence/2026-W46/logs/static-test-technical-time.log) |
| static | `npm run audit:stage2-accuracy` | 0 | [static-audit-stage2-accuracy.log](evidence/2026-W46/logs/static-audit-stage2-accuracy.log) |
| static | `npm run audit:route-architecture` | 0 | [static-audit-route-architecture.log](evidence/2026-W46/logs/static-audit-route-architecture.log) |
| static | `npm run audit:stage4-content` | 1 | [static-audit-stage4-content.log](evidence/2026-W46/logs/static-audit-stage4-content.log) |
| static | `npm run audit:stage5-guides` | 0 | [static-audit-stage5-guides.log](evidence/2026-W46/logs/static-audit-stage5-guides.log) |
| static | `npm run test:stage6-share-presets` | 0 | [static-test-stage6-share-presets.log](evidence/2026-W46/logs/static-test-stage6-share-presets.log) |
| static | `npm run audit:stage6-share-presets` | 0 | [static-audit-stage6-share-presets.log](evidence/2026-W46/logs/static-audit-stage6-share-presets.log) |
| static | `npm run test:calculators` | 0 | [static-test-calculators.log](evidence/2026-W46/logs/static-test-calculators.log) |
| static | `npm run audit:calculators` | 0 | [static-audit-calculators.log](evidence/2026-W46/logs/static-audit-calculators.log) |
| static | `npm run audit:specialty-tools` | 0 | [static-audit-specialty-tools.log](evidence/2026-W46/logs/static-audit-specialty-tools.log) |
| static | `npm run audit:ui` | 0 | [static-audit-ui.log](evidence/2026-W46/logs/static-audit-ui.log) |
| static | `npm run audit:a11y` | 0 | [static-audit-a11y.log](evidence/2026-W46/logs/static-audit-a11y.log) |
| static | `npm run audit:release` | 0 | [static-audit-release.log](evidence/2026-W46/logs/static-audit-release.log) |
| static | `npm run test:ui-regressions` | 0 | [static-test-ui-regressions.log](evidence/2026-W46/logs/static-test-ui-regressions.log) |
| static | `npm run test:sitewide-ui` | 0 | [static-test-sitewide-ui.log](evidence/2026-W46/logs/static-test-sitewide-ui.log) |
| browser | `npm run test:stage6-browser` | 1 | [browser-test-stage6-browser.log](evidence/2026-W46/logs/browser-test-stage6-browser.log) |
| browser | `npm run test:display-stability` | 0 | [browser-test-display-stability.log](evidence/2026-W46/logs/browser-test-display-stability.log) |
| browser | `npm run test:adsense` | 0 | [browser-test-adsense.log](evidence/2026-W46/logs/browser-test-adsense.log) |
| browser | `npm run test:final-browser` | 1 | [browser-test-final-browser.log](evidence/2026-W46/logs/browser-test-final-browser.log) |
| analytics | `npm run test:analytics` | 0 | [analytics-test-analytics.log](evidence/2026-W46/logs/analytics-test-analytics.log) |
| analytics | `npm run build` | 0 | [analytics-build.log](evidence/2026-W46/logs/analytics-build.log) |
| static-after | `npm run audit:static-deployment` | 0 | [static-after-audit-static-deployment.log](evidence/2026-W46/logs/static-after-audit-static-deployment.log) |
| static-after | `npm run audit:seo` | 0 | [static-after-audit-seo.log](evidence/2026-W46/logs/static-after-audit-seo.log) |
| static-after | `npm run audit:links` | 0 | [static-after-audit-links.log](evidence/2026-W46/logs/static-after-audit-links.log) |
| static-after | `npm run audit:presets` | 0 | [static-after-audit-presets.log](evidence/2026-W46/logs/static-after-audit-presets.log) |
| static-after | `npm run audit:time-tools` | 0 | [static-after-audit-time-tools.log](evidence/2026-W46/logs/static-after-audit-time-tools.log) |
| static-after | `npm run test:technical-time` | 0 | [static-after-test-technical-time.log](evidence/2026-W46/logs/static-after-test-technical-time.log) |
| static-after | `npm run audit:stage2-accuracy` | 0 | [static-after-audit-stage2-accuracy.log](evidence/2026-W46/logs/static-after-audit-stage2-accuracy.log) |
| static-after | `npm run audit:route-architecture` | 0 | [static-after-audit-route-architecture.log](evidence/2026-W46/logs/static-after-audit-route-architecture.log) |
| static-after | `npm run audit:stage4-content` | 1 | [static-after-audit-stage4-content.log](evidence/2026-W46/logs/static-after-audit-stage4-content.log) |
| static-after | `npm run audit:stage5-guides` | 0 | [static-after-audit-stage5-guides.log](evidence/2026-W46/logs/static-after-audit-stage5-guides.log) |
| static-after | `npm run test:stage6-share-presets` | 0 | [static-after-test-stage6-share-presets.log](evidence/2026-W46/logs/static-after-test-stage6-share-presets.log) |
| static-after | `npm run audit:stage6-share-presets` | 0 | [static-after-audit-stage6-share-presets.log](evidence/2026-W46/logs/static-after-audit-stage6-share-presets.log) |
| static-after | `npm run test:calculators` | 0 | [static-after-test-calculators.log](evidence/2026-W46/logs/static-after-test-calculators.log) |
| static-after | `npm run audit:calculators` | 0 | [static-after-audit-calculators.log](evidence/2026-W46/logs/static-after-audit-calculators.log) |
| static-after | `npm run audit:specialty-tools` | 0 | [static-after-audit-specialty-tools.log](evidence/2026-W46/logs/static-after-audit-specialty-tools.log) |
| static-after | `npm run audit:ui` | 0 | [static-after-audit-ui.log](evidence/2026-W46/logs/static-after-audit-ui.log) |
| static-after | `npm run audit:a11y` | 0 | [static-after-audit-a11y.log](evidence/2026-W46/logs/static-after-audit-a11y.log) |
| static-after | `npm run audit:release` | 0 | [static-after-audit-release.log](evidence/2026-W46/logs/static-after-audit-release.log) |
| static-after | `npm run test:ui-regressions` | 0 | [static-after-test-ui-regressions.log](evidence/2026-W46/logs/static-after-test-ui-regressions.log) |
| static-after | `npm run test:sitewide-ui` | 1 | [static-after-test-sitewide-ui.log](evidence/2026-W46/logs/static-after-test-sitewide-ui.log) |
| browser-after | `npm run test:stage6-browser` | 1 | [browser-after-test-stage6-browser.log](evidence/2026-W46/logs/browser-after-test-stage6-browser.log) |
| browser-after | `npm run test:display-stability` | 0 | [browser-after-test-display-stability.log](evidence/2026-W46/logs/browser-after-test-display-stability.log) |
| browser-after | `npm run test:adsense` | 0 | [browser-after-test-adsense.log](evidence/2026-W46/logs/browser-after-test-adsense.log) |
| browser-after | `npm run test:final-browser` | 1 | [browser-after-test-final-browser.log](evidence/2026-W46/logs/browser-after-test-final-browser.log) |
| lighthouse | `npm run test:final-lighthouse` | 0 | [lighthouse-test-final-lighthouse.log](evidence/2026-W46/logs/lighthouse-test-final-lighthouse.log) |
| final | `npm run typecheck` | 0 | [final-typecheck.log](evidence/2026-W46/logs/final-typecheck.log) |
| final | `npm run build` | 0 | [final-build.log](evidence/2026-W46/logs/final-build.log) |
| final | `npm run audit:static-deployment` | 0 | [final-audit-static-deployment.log](evidence/2026-W46/logs/final-audit-static-deployment.log) |
| final | `npm run audit:final-release` | 1 | [final-audit-final-release.log](evidence/2026-W46/logs/final-audit-final-release.log) |

Historical reports are preserved; fresh generated reports copied under evidence/generated-reports. `audit:stage4-content` flags three legitimate legal AdSense disclosures. `test:stage6-browser`/`test:final-browser` can fail on blocked third parties and stale no-external-script assumptions; exact assertions remain intact. These are disclosed red gates, not a manufactured green release. New focused tests fail on real changed behavior. The final gate's treatment of historical performance artifacts must be read with fresh evidence, not accepted from exit code alone.

## Remaining material risks

46-route hydration defect is not fixed by typography or keyboard changes. Live canonical/slash conflict is investigated without migration. Ad latch route lifetime is a source risk requiring real creative navigation evidence and owner policy. Physical device/assistive/audio/actual zoom, field p75 and comprehensive long-run leak tests remain. No new indexable pages, major winner redesign or billing/account mutations. See [findings](2026-W46-diagnostic-findings.md), [matrix](2026-W46-functional-test-matrix.md), [owner walkthrough](2026-W46-owner-manual-review.md).

## Final patch scope and receipt interpretation

ILT-D06 also changes only the existing archive keydown handler and cubing keyup guard. ILT-D09 changes the cubing fullscreen Start handler to match the normal explicit button. No archive layout or timing engine was replaced. The added sitewide harness port/identity guard prevents testing an unrelated local site; no assertion thresholds were relaxed.

The four review lenses were repeated for the late Fibonacci repair: it uses the existing seeded/live timestamp, has no shared call-site change, preserves the tile/display hierarchy in the final screenshots, and introduces no new browser API, metadata, storage, ad or analytics behavior. Eight isolated red assertions pass after the repair. The remaining cross-locale contract is expressly outside that narrow fix.

After sweep: **524/528**; final four-route follow-up: **16/16**; Firefox/WebKit matrix: **52/56**. The four final cross-browser failures are world-clock hydration errors in Firefox; all recorded final value geometry and native-control assertions pass. The existing browser report passed 90 responsive/theme cases, menu focus/Escape and six WebKit cases, while its canonical gate remained red on 122 routes because current external-script behavior violates old expectations. Its top-level quality “passed” field is narrower than the failed command; do not use that field as release approval. The stage 6 browser failure contains blocked-network console errors. Raw outputs remain available.

The clean typecheck and final candidate build are recorded in [typecheck log](evidence/2026-W46/logs/typecheck-final.log) and [build log](evidence/2026-W46/logs/build-final-candidate.log). The later final-release command consumes fresh generated evidence, including failures, instead of relying on historical PASS files. Lighthouse is run with third parties blocked and is a lab measurement only. Inspect its actual result below; field INP/p75 is unverified.

The initial offline `npx lighthouse` attempt failed before collecting any metrics because its cached registry metadata requested unavailable 13.6.0. The failure receipt remains in `suite-lighthouse-offline-failure.json`. An optional `ILT_LIGHTHOUSE_CLI` path now permits the existing cached Lighthouse 13.4.1 CLI to run directly without an install or upgrade; defaults and thresholds are unchanged. This is a harness portability repair, not a performance optimization.

The [short-navigation comparison](evidence/2026-W46/before-after-lab.json) records all 528 baseline and after samples: median observed LCP 112/116 ms, maximum CLS about 0.116 in each, and 1/2 cases above 0.1. These are unthrottled local samples with third parties blocked and varying concurrent audit load. They do not establish a causal speed regression or improvement, controlled Lighthouse equivalence, field p75 or INP.

The final release gate remains red. Alongside the old ad/script/content expectations, it rejects the fresh dependency findings (ILT-D11) and classifies this assignment's intentionally requested evidence logs as temporary files. The latter is a scope mismatch with this diagnostic deliverable, not an accidental build or dependency directory: the evidence index identifies the artifacts. Neither failure was hidden or waived in code. Read [the exact final gate](evidence/2026-W46/generated-reports/final/docs/final-release-gate.json) and [dependency triage](evidence/2026-W46/dependency-reachability.md).

### Fresh Lighthouse result

Status: **passed**; 16 mobile/desktop reports. [Full metrics and thresholds](evidence/2026-W46/generated-reports/lighthouse/docs/final-performance-accessibility.json). This isolated run excludes ad/analytics network cost and cannot establish field performance.

## Branch commits

| Commit | Scope |
|---|---|
| `619a040d2ca9402bc83fef803e2a791914954612` | fix: restore declared icon dependency in lockfile [skip netlify] |
| `8dda6d659716c9a8e8166c5fcbed88b14594aeb2` | fix: keep atomic clock digits on one line [skip netlify] |
| `02a2bba83bc506387ebce3a5704d72aef97b58f5` | fix: fit world millisecond values within their columns [skip netlify] |
| `95c0fd1b3d38fcf1e5b0b774fc563792ebfbd074` | fix: cancel interrupted HIIT phase transitions [skip netlify] |
| `f1a803f57e223e0c9f13755d8b323a85dacd590d` | fix: preserve native keyboard and cubing fullscreen controls [skip netlify] |
| `4a74b1c4d88b21eb9bba4a2e562af7aa16b8f12d` | fix: reconcile Fibonacci date with seeded live clock [skip netlify] |
| `1a05b7f82d08d351bdedd3bfc07b02d0f512d653` | test: isolate diagnostic preview and lab traffic [skip netlify] |
| `9cdc0a29ae64203b5f516322856f53e7a53d70dc` | test: permit a cached Lighthouse CLI for offline diagnostics [skip netlify] |

All changes remain on the diagnostic branch. [Final safety receipt](evidence/2026-W46/final-safety.json).

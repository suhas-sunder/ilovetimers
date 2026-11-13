# Dependency audit triage — release gate remains red

The fresh production dependency audit reports two high-severity package entries and one critical entry. These are dependency classifications, not three reproduced iLoveTimers exploits. See [raw npm evidence](dependency-audit-production.json) and [the final gate](generated-reports/final/docs/final-release-gate.json).

## React Router / @react-router/node

Installed: 7.18.1. The advisory is [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), concerning unstable RSC APIs. The published patched 7.x version is 7.18.2. This repo sets `ssr: false` and `prerender: true`; both the build audit and live Netlify receipt show no runtime server, functions or edge functions. No RSC/action runtime surface was found. This is evidence against applicability to the current deployed architecture, not proof for a future server-enabled build.

The existing gate already names this same GHSA as an accepted static-only advisory but matches npm's numeric source ID 1124282. The fresh npm response reports 1138769. That identifier drift explains why the same advisory now fails the old exception. The gate was not changed to whitelist the new ID, and the historical text about a prior 8.3.0 evaluation is not a new evaluation performed in this audit.

## DOMPurify through PostHog

Installed chain: posthog-js 1.406.2 → dompurify 3.4.12. The lockfile already contained those resolutions before this audit; the only dependency repair adds the separately declared Lucide entry.

The [critical template advisory](https://github.com/advisories/GHSA-cg2g-xh64-v4q7) requires non-default template-sanitization and DOM-returning modes, attached shadow-root input, and downstream template evaluation. The [high IN_PLACE advisory](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr) requires an in-place sanitizer hook that removes other nodes. Both list 3.4.17 as patched. The raw npm file also records lower-severity related findings.

No app-owned DOMPurify import or use of those sanitizer options was found. `app/provider.tsx` disables surveys, product tours, conversations, experiments, recording, feature flags and external dependency loading. The installed SDK's product-tour/conversation entry points check their disabled flags. A search of generated client assets found no `SAFE_FOR_TEMPLATES`, `IN_PLACE` or `RETURN_DOM` symbols. The local analytics integration tests also verify disabled invasive features and resilience. These observations reduce likely reachability; string searches and configuration inspection do not prove every bundled path unreachable.

## Disposition: ILT-D11, P1 release risk / needs owner choice

No application exploit is claimed, and no dependency update or exception was applied. Before approving a production merge, either document an exact, reviewed applicability exception keyed to stable advisory identity, or prepare a separate minimal patched-dependency candidate with clean-install, full route/hydration, analytics/privacy, static-hosting and regression checks. Do not run a broad `npm audit fix`, switch framework major versions, enable PostHog features, or treat the calendar as approval. This gate belongs before W01 acceptance, not after discretionary 2027 feature work.

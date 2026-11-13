# iLoveTimers Netlify production baseline (read-only)
Captured: November 12, 2026, America/Toronto
Project: ilovetimers
Site ID: a7be49dc-2187-4008-8d52-2b91a34054d0
Public production URL: https://www.ilovetimers.com

## Current published production deploy
- State: ready
- Deploy ID: 6ad02cda978c2279434c2640
- Branch: main
- Production commit: 468bda18f09812a9212b3e6a15921dd9ed013542
- Published: 2026-10-15T01:32:25.771Z
- Source commit subject: docs(ai-issues): protect intentional ad placeholder safety workaround
- Framework: react-router; current site is a static prerendered build.
- Deployment report: 158 files uploaded (79 generated pages + 79 assets changed), 57 redirect rules processed successfully, 2 header rules processed successfully, no Netlify Functions and no Edge Functions.
- Netlify project plan reported as `nf_team_dev`. This is not proof of a verified billing cap or remaining monthly credits.
- Read-only site environment variable enumeration returned an empty list. Do not assume other build contexts lack defaults without checking source and relevant settings.

## Request telemetry limitation
Netlify observability was queried read-only for a nominal 24-hour window ending 2026-11-13 03:50 UTC, but the actual returned effective range was only about 47 minutes. Counts: 324 HTTP 200, 36 HTTP 301, 6 HTTP 304, 5 HTTP 404, 1 HTTP 206. This is a *short, plan-limited window*, not full-day traffic or a performance/availability KPI. Querying URLs showed static JS/CSS resources, no function invocations; the limited sample is insufficient to judge search traffic health. Investigate isolated 404 examples only when a specific real broken route or material incident can be reproduced.

## Release branch and preview search safety
- The owner requires all Codex implementation on dedicated release branches; `main` is production and its commits trigger Netlify publishing.
- Netlify docs distinguish Deploy Previews (commonly generated for PRs and given `X-Robots-Tag: noindex`) from branch deploys (not guaranteed to receive a noindex header). Do NOT assume all nonproduction URLs are search-index-safe. Inspect the actual preview response before sharing or linking widely; do not edit live Netlify config from the diagnostic run.
- Check whether a GitHub push to a release branch starts a Netlify branch deploy and whether opening a draft PR triggers a Deploy Preview. Neither is a production release; both may consume available build credits. Prefer the existing verified preview workflow, run local build/browser checks, and avoid unneeded repeat builds.
- No provider-level deploy, production merge, billing change, DNS change, extension installation, database, function, or Netlify account mutation is authorized.

## Source references
Netlify deployment https://app.netlify.com/projects/ilovetimers
GitHub main commit https://github.com/suhas-sunder/ilovetimers/commit/468bda18f09812a9212b3e6a15921dd9ed013542
Netlify deploy and branch docs:
https://docs.netlify.com/deploy/deploy-overview/
https://docs.netlify.com/deploy/deploy-types/branch-deploys/

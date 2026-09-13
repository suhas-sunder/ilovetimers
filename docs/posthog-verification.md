# PostHog production verification

`npm run test:analytics` runs the real built browser SDK against a local HTTP
collector. It verifies initialization, actual SPA/Back/Forward navigation without
a document reload, one pageview per navigation, manual Start/Pause events,
sanitization, persistence restrictions, and resilience to collector failures.
It does **not** verify production project settings, billing, or stored events.

The test builds with a temporary `VITE_POSTHOG_HOST`. Run `npm run build` afterward
to restore normal production output before any other production-like checks.
Never deploy the collector build.

## Required external ingestion gate

Do this read-only check after analytics configuration changes, and when events
disappear despite successful browser requests. Do not put administrative API
credentials in source, browser code, Vite variables, screenshots, or reports.

1. Verify project **iLoveTimers**, ID **293132**, at `us.posthog.com`. Compare its
   public token with `POSTHOG_PROJECT_TOKEN` in `app/clients/lib/analytics.ts`.
   Do not rely on the connector's default project; it may be another site.
2. Read the project's `cookieless_server_hash_mode`. Production uses
   `cookieless_mode: "always"`. The project setting must be enabled (currently
   `2`; `0` is disabled). If disabled, fail this gate even if browser requests
   return HTTP 200/Ok. Do not automatically change the setting or fall back to
   cookie-based tracking. Obtain authorization for project changes.
3. Record a narrow UTC test window. Visit production once, use Egg Timer Start
   and Pause once, and follow a footer React Router link. Never click ads or
   bulk-generate traffic. Query the verified project for the pageviews and manual
   actions in that window. Confirm hostname/path and use captured event UUIDs
   when available to distinguish diagnostic activity from other visitors.
4. Verify events are **stored and queryable**, not merely accepted by the HTTP
   endpoint. Allow for ingestion delay. Review reporting/test-account filters
   and ingestion warnings if events are missing. The local collector cannot
   detect server-side dropped events. Do not declare recovery from SDK readiness.
5. Confirm no analytics cookies, persistent browser identifiers, or disabled
   product traffic are introduced. Keep manual capture, disabled persistence,
   person profiles disabled, and replay/autocapture/flags/other products disabled
   in the deployed client. Client overrides are not evidence that account-level
   product settings or billing limits are disabled.
6. Check the billing page separately to verify the free plan or appropriate
   spending limits. Do not activate trials, paid products, retention upgrades,
   or raise limits. If billing access is unavailable, report it as unverified;
   do not promise that an account cannot incur charges.

Google advertising consent requirements remain separate from cookieless
PostHog measurement. Do not add, remove, or bypass consent UI as an analytics
workaround. Cookieless tracking is not a blanket guarantee of legal compliance.

## Failure identified in September 2026

Browser requests used the correct token/host and returned 200/Ok while the
iLoveTimers project had `cookieless_server_hash_mode: 0`. After the owner enabled
the setting, a controlled production visit and Start/Pause test produced one
stored `$pageview`, one `timer_start`, and one `timer_pause` at 01:34 UTC on
September 13. This establishes fresh ingestion, not backfill of lost events or
recovery of historical daily traffic volumes. No runtime code change was needed.

References:

- [PostHog cookieless configuration](https://posthog.com/docs/libraries/js/config)
- [Cookieless project setup](https://posthog.com/tutorials/cookieless-tracking)
- [Ingestion warnings](https://posthog.com/docs/data/ingestion-warnings)

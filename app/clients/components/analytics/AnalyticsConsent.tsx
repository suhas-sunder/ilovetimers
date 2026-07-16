import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_PREFERENCES_REQUEST_EVENT,
  type AnalyticsConsent,
  isAnalyticsConfigured,
  readStoredAnalyticsConsent,
  requestAnalyticsPreferences,
  writeStoredAnalyticsConsent,
} from "~/clients/lib/analytics";
import { Button } from "~/clients/components/ui/foundation";
import { cx } from "~/clients/components/ui/utils";

function useAnalyticsConsentState() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    setConfigured(isAnalyticsConfigured());
    setConsent(readStoredAnalyticsConsent());

    function onConsentChange() {
      setConsent(readStoredAnalyticsConsent());
    }

    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGED_EVENT,
        onConsentChange,
      );
    };
  }, []);

  return { configured, consent };
}

export function AnalyticsConsentBanner() {
  const { configured, consent } = useAnalyticsConsentState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!configured) {
      setOpen(false);
      return;
    }

    setOpen(consent === null);
  }, [configured, consent]);

  useEffect(() => {
    function onPreferenceRequest() {
      if (isAnalyticsConfigured()) setOpen(true);
    }

    window.addEventListener(
      ANALYTICS_PREFERENCES_REQUEST_EVENT,
      onPreferenceRequest,
    );
    return () => {
      window.removeEventListener(
        ANALYTICS_PREFERENCES_REQUEST_EVENT,
        onPreferenceRequest,
      );
    };
  }, []);

  if (!configured || !open) return null;

  function choose(next: AnalyticsConsent) {
    writeStoredAnalyticsConsent(next);
    setOpen(false);
  }

  return (
    <div
      data-analytics-consent-banner
      className="fixed inset-x-0 bottom-0 z-[80] bg-[var(--ilt-bg-page)] px-[var(--ilt-page-x)] py-3 text-[var(--ilt-text-primary)] shadow-[0_-1px_12px_var(--ilt-border-subtle)]"
      role="region"
      aria-label="Analytics preferences"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-[var(--ilt-text-secondary)]">
          iLoveTimers uses privacy-limited PostHog analytics only if you allow
          it. Timers and calculators work either way.{" "}
          <Link
            to="/cookies"
            className="ilt-focus-ring cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-[var(--ilt-accent)] decoration-1 underline-offset-4 hover:text-[var(--ilt-accent-hover)]"
          >
            Cookie details
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" onClick={() => choose("allowed")}>
            Allow analytics
          </Button>
          <Button size="sm" onClick={() => choose("declined")}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPreferencesButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={requestAnalyticsPreferences}
      className={cx(
        "inline-flex min-h-11 cursor-pointer items-center text-sm underline-offset-4 transition hover:underline focus:outline-none focus:ring-2 focus:ring-amber-500/40",
        className,
      )}
    >
      Analytics preferences
    </button>
  );
}

export function AnalyticsPreferenceControls() {
  const { configured, consent } = useAnalyticsConsentState();
  const status = !configured
    ? "Analytics is not configured in this environment."
    : consent === "allowed"
      ? "Analytics is currently allowed."
      : consent === "declined"
        ? "Analytics is currently declined."
        : "No analytics choice is currently saved.";

  return (
    <div className="space-y-3">
      <p>{status}</p>
      {configured ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => writeStoredAnalyticsConsent("allowed")}
          >
            Allow analytics
          </Button>
          <Button
            size="sm"
            onClick={() => writeStoredAnalyticsConsent("declined")}
          >
            Decline
          </Button>
        </div>
      ) : null}
    </div>
  );
}

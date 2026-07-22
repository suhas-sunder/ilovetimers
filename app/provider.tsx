import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { PostHog } from "posthog-js";
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  getPostHogHost,
  getPostHogKey,
  isAnalyticsConfigured,
  markAnalyticsReady,
  markAnalyticsStopped,
  readStoredAnalyticsConsent,
  sanitizeAnalyticsProperties,
  setAnalyticsClient,
  stopAnalyticsCapture,
  trackPageview,
} from "./clients/lib/analytics";
import { AnalyticsConsentBanner } from "./clients/components/analytics/AnalyticsConsent";

let posthogClient: PostHog | null = null;

async function initializePostHog() {
  const key = getPostHogKey();
  if (!key) return null;
  if (posthogClient) return posthogClient;

  const { default: posthog } = await import("posthog-js");

  posthog.init(key, {
    api_host: getPostHogHost(),
    defaults: "2025-11-30",
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    rageclick: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_surveys_automatic_display: true,
    disable_product_tours: true,
    disable_external_dependency_loading: true,
    capture_performance: false,
    mask_all_element_attributes: true,
    mask_all_text: true,
    person_profiles: "never",
    persistence: "localStorage",
    save_referrer: false,
    save_campaign_params: false,
    property_denylist: [
      "$current_url",
      "$referrer",
      "$initial_current_url",
      "$initial_referrer",
      "$session_entry_url",
      "$elements",
      "$elements_chain",
      "$el_text",
      "$event_type",
      "$host",
      "$pathname",
      "$search_engine",
      "$active_feature_flags",
    ],
    sanitize_properties: sanitizeAnalyticsProperties,
    opt_out_persistence_by_default: true,
    opt_out_capturing_by_default: true,
    consent_persistence_name: "ilt-posthog-capture-consent",
    respect_dnt: true,
  });
  posthogClient = posthog;
  setAnalyticsClient(posthog);
  return posthog;
}

function AnalyticsRouteTracker({ enabled }: { enabled: boolean }) {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (lastTrackedPathRef.current === location.pathname) return;

    lastTrackedPathRef.current = location.pathname;
    trackPageview(location.pathname);
  }, [enabled, location.pathname]);

  return null;
}

export function PHProvider({ children }: { children: ReactNode }) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    let disposed = false;
    let applicationVersion = 0;

    async function applyConsent() {
      const version = ++applicationVersion;
      if (!isAnalyticsConfigured()) {
        markAnalyticsStopped();
        setAnalyticsEnabled(false);
        return;
      }

      const consent = readStoredAnalyticsConsent();
      if (consent !== "allowed") {
        if (consent === "declined") stopAnalyticsCapture();
        else markAnalyticsStopped();
        setAnalyticsEnabled(false);
        return;
      }

      const posthog = await initializePostHog();
      if (disposed || version !== applicationVersion) return;
      if (!posthog || readStoredAnalyticsConsent() !== "allowed") {
        markAnalyticsStopped();
        setAnalyticsEnabled(false);
        return;
      }

      posthog.opt_in_capturing({ captureEventName: false });
      markAnalyticsReady();
      setAnalyticsEnabled(true);
    }

    void applyConsent();
    const onConsentChanged = () => void applyConsent();
    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, onConsentChanged);

    return () => {
      disposed = true;
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, onConsentChanged);
    };
  }, []);

  return (
    <>
      <AnalyticsRouteTracker enabled={analyticsEnabled} />
      {children}
      <AnalyticsConsentBanner />
    </>
  );
}

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { PostHog } from "posthog-js";
import {
  clearLegacyAnalyticsStorage,
  getPostHogHost,
  getPostHogKey,
  isAnalyticsConfigured,
  markAnalyticsReady,
  markAnalyticsStopped,
  sanitizeAnalyticsEvent,
  setAnalyticsClient,
  trackPageview,
} from "./clients/lib/analytics";

let posthogClient: PostHog | null = null;

async function initializePostHog() {
  const key = getPostHogKey();
  if (!key) return null;
  if (posthogClient) return posthogClient;

  try {
    const { default: posthog } = await import("posthog-js");

    posthog.init(key, {
      api_host: getPostHogHost(),
      defaults: "2025-11-30",
      cookieless_mode: "always",
      persistence: "memory",
      disable_persistence: true,
      request_batching: false,
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      rageclick: false,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_surveys_automatic_display: true,
      disable_product_tours: true,
      disable_conversations: true,
      disable_web_experiments: true,
      advanced_disable_flags: true,
      advanced_disable_feature_flags: true,
      disable_external_dependency_loading: true,
      mask_all_element_attributes: true,
      mask_all_text: true,
      person_profiles: "never",
      ip: false,
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
      before_send: sanitizeAnalyticsEvent,
    });
    posthogClient = posthog;
    setAnalyticsClient(posthog);
    return posthog;
  } catch {
    console.warn("PostHog analytics initialization failed.");
    markAnalyticsStopped();
    return null;
  }
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

    async function startAnalytics() {
      clearLegacyAnalyticsStorage();
      if (!isAnalyticsConfigured()) {
        markAnalyticsStopped();
        setAnalyticsEnabled(false);
        return;
      }

      const posthog = await initializePostHog();
      if (disposed) return;
      if (!posthog) {
        markAnalyticsStopped();
        setAnalyticsEnabled(false);
        return;
      }

      markAnalyticsReady();
      setAnalyticsEnabled(true);
    }

    void startAnalytics();

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <>
      <AnalyticsRouteTracker enabled={analyticsEnabled} />
      {children}
    </>
  );
}

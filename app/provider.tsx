import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import {
  markAnalyticsReady,
  sanitizeAnalyticsProperties,
  trackPageview,
} from "./clients/lib/analytics";

let posthogInitialized = false;

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!posthogInitialized) {
      posthog.init("phc_sTkyKGskHghe6Fec7zS3hSI5KhPLr9NjQ2KCDObL22W", {
        api_host: "https://us.i.posthog.com",
        defaults: "2025-11-30",
        capture_pageview: false,
        capture_pageleave: false,
        person_profiles: "identified_only",
        sanitize_properties: sanitizeAnalyticsProperties,
      });
      posthogInitialized = true;
    }

    markAnalyticsReady();
    setReady(true);
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <AnalyticsRouteTracker enabled={ready} />
      {children}
    </PostHogProvider>
  );
}

import posthog from "posthog-js";
import type { Properties } from "posthog-js";

type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;
export type AnalyticsConsent = "allowed" | "declined";

export const ANALYTICS_CONSENT_STORAGE_KEY = "ilt-analytics-consent";
export const ANALYTICS_CONSENT_CHANGED_EVENT = "ilt-analytics-consent-changed";
export const ANALYTICS_PREFERENCES_REQUEST_EVENT =
  "ilt-analytics-preferences-requested";

let analyticsReady = false;

const safeEventPropertyKeys = new Set([
  "route_path",
  "tool",
  "source",
  "result_status",
  "result_type",
  "status",
  "mode",
  "format",
  "display_mode",
  "phase",
  "action",
  "copy_type",
  "sound",
  "fullscreen",
  "overnight",
  "break_used",
]);

const privatePropertyPattern =
  /(name|label|note|text|input|date|time|timezone|zone|start|end|break_|duration|seconds|minutes|hours|amount|rate|entry|row|value|url|query|fragment|share|link|email|phone|address)/i;

export function canUseBrowser() {
  return typeof window !== "undefined";
}

export function isAnalyticsConfigured() {
  return Boolean(import.meta.env.VITE_POSTHOG_KEY);
}

export function getPostHogKey() {
  return import.meta.env.VITE_POSTHOG_KEY as string | undefined;
}

export function getPostHogHost() {
  return (
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
    "https://us.i.posthog.com"
  );
}

function cleanPathname(pathname: string) {
  if (!pathname || pathname[0] !== "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function currentPathname() {
  if (!canUseBrowser()) return "/";
  return cleanPathname(window.location.pathname);
}

function canonicalUrlForPath(pathname: string) {
  if (!canUseBrowser()) return pathname;
  return `${window.location.origin}${cleanPathname(pathname)}`;
}

function stripUrlToPath(value: unknown) {
  if (typeof value !== "string" || !value) return value;

  try {
    const url = new URL(value, canUseBrowser() ? window.location.origin : undefined);
    return `${url.origin}${cleanPathname(url.pathname)}`;
  } catch {
    return value;
  }
}

export function markAnalyticsReady() {
  analyticsReady = true;
}

export function markAnalyticsStopped() {
  analyticsReady = false;
}

export function readStoredAnalyticsConsent(): AnalyticsConsent | null {
  if (!canUseBrowser()) return null;

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (value === "allowed" || value === "declined") return value;
    if (value !== null) {
      window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
    }
  } catch {
    return null;
  }

  return null;
}

export function writeStoredAnalyticsConsent(consent: AnalyticsConsent) {
  if (!canUseBrowser()) return;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // Restricted storage should never block the site or its tools.
  }

  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_CHANGED_EVENT, {
      detail: { consent },
    }),
  );
}

export function requestAnalyticsPreferences() {
  if (!canUseBrowser()) return;
  window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_REQUEST_EVENT));
}

export function stopAnalyticsCapture() {
  markAnalyticsStopped();
  if (!canUseBrowser()) return;

  try {
    posthog.opt_out_capturing();
    posthog.reset(true);
  } catch {
    // If PostHog was never initialized, declining analytics should remain inert.
  }
}

export function sanitizeAnalyticsProperties(
  properties: Properties,
) {
  const next: Properties = { ...properties };

  for (const key of [
    "$current_url",
    "$referrer",
    "$initial_current_url",
    "$initial_referrer",
    "$session_entry_url",
  ]) {
    if (key in next) next[key] = stripUrlToPath(next[key]);
  }

  return next;
}

function sanitizeManualEventProperties(
  properties: AnalyticsProperties,
): AnalyticsProperties {
  const next: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!safeEventPropertyKeys.has(key)) continue;
    if (privatePropertyPattern.test(key)) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      next[key] = value;
    }
  }

  return next;
}

export function trackPageview(pathname = currentPathname()) {
  if (!analyticsReady || !canUseBrowser()) return;

  const routePath = cleanPathname(pathname);
  posthog.capture("$pageview", {
    $current_url: canonicalUrlForPath(routePath),
    $pathname: routePath,
    route_path: routePath,
  });
}

export function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  if (!analyticsReady || !canUseBrowser()) return;

  const routePath = currentPathname();
  posthog.capture(eventName, {
    route_path: routePath,
    ...sanitizeManualEventProperties(properties),
  });
}

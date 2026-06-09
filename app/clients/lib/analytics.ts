import posthog from "posthog-js";
import type { Properties } from "posthog-js";

type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

let analyticsReady = false;

function canUseBrowser() {
  return typeof window !== "undefined";
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
    ...properties,
  });
}

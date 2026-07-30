import type { BeforeSendFn, PostHog, Properties } from "posthog-js";

type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

export const POSTHOG_PROJECT_TOKEN = "phc_sTkyKGskHghe6Fec7zS3hSI5KhPLr9NjQ2KCDObL22W";

const LEGACY_ANALYTICS_STORAGE_KEYS = [
  "ilt-analytics-consent",
  "ilt-posthog-capture-consent",
] as const;

let analyticsReady = false;
let analyticsClient: PostHog | null = null;

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
const safeEventNamePattern = /^[a-z][a-z0-9_]{0,63}$/;
const safeStringValuePattern = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export function canUseBrowser() {
  return typeof window !== "undefined";
}

export function getPostHogKey() {
  return POSTHOG_PROJECT_TOKEN;
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

function currentHost() {
  if (!canUseBrowser()) return "";
  return window.location.host;
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

function stripToPathname(value: unknown) {
  if (typeof value !== "string" || !value) return value;

  try {
    const url = new URL(value, canUseBrowser() ? window.location.origin : undefined);
    return cleanPathname(url.pathname);
  } catch {
    return cleanPathname(value.split(/[?#]/, 1)[0] || "/");
  }
}

function stripToHost(value: unknown) {
  if (typeof value !== "string" || !value) return value;

  try {
    return new URL(
      value.includes("://") ? value : `https://${value}`,
    ).host;
  } catch {
    return "";
  }
}

function postHogPersistencePrefix(key: string) {
  const safeKey = key
    .replace(/\+/g, "PL")
    .replace(/\//g, "SL")
    .replace(/=/g, "EQ");
  return `ph_${safeKey}_posthog`;
}

function legacyAnalyticsKeyNames() {
  const names = new Set<string>(LEGACY_ANALYTICS_STORAGE_KEYS);
  const key = getPostHogKey();

  if (key) {
    names.add(`__ph_opt_in_out_${key}`);
    names.add(postHogPersistencePrefix(key));
  }

  return names;
}

function isLegacyAnalyticsKey(name: string, names: Set<string>) {
  if (names.has(name)) return true;
  const key = getPostHogKey();
  return Boolean(key && name.startsWith(`${postHogPersistencePrefix(key)}__`));
}

export function clearLegacyAnalyticsStorage() {
  if (!canUseBrowser()) return;
  const names = legacyAnalyticsKeyNames();

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const name = window.localStorage.key(index);
      if (name && isLegacyAnalyticsKey(name, names)) {
        window.localStorage.removeItem(name);
      }
    }
  } catch {
    // Restricted storage should never block the site or its tools.
  }

  try {
    for (const entry of document.cookie.split(";")) {
      const name = decodeURIComponent(entry.split("=", 1)[0]?.trim() || "");
      if (name && isLegacyAnalyticsKey(name, names)) {
        document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
      }
    }
  } catch {
    // Cookie access may be unavailable under browser privacy restrictions.
  }
}

export function markAnalyticsReady() {
  analyticsReady = true;
}

export function setAnalyticsClient(client: PostHog) {
  analyticsClient = client;
}

export function markAnalyticsStopped() {
  analyticsReady = false;
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

  for (const key of ["$pathname", "$session_entry_pathname"]) {
    if (key in next) next[key] = stripToPathname(next[key]);
  }

  for (const key of ["$host", "$session_entry_host"]) {
    if (key in next) next[key] = stripToHost(next[key]);
  }

  return next;
}

export const sanitizeAnalyticsEvent: BeforeSendFn = (event) => {
  if (!event) return null;
  return {
    ...event,
    properties: sanitizeAnalyticsProperties(event.properties),
  };
};

function sanitizeManualEventProperties(
  properties: AnalyticsProperties,
): AnalyticsProperties {
  const next: AnalyticsProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (!safeEventPropertyKeys.has(key)) continue;
    if (privatePropertyPattern.test(key)) continue;
    if (typeof value === "string" && safeStringValuePattern.test(value)) {
      next[key] = value;
    } else if (
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
  try {
    analyticsClient?.capture("$pageview", {
      $current_url: canonicalUrlForPath(routePath),
      $host: currentHost(),
      $pathname: routePath,
      route_path: routePath,
    });
  } catch {
    // Analytics failures must never interfere with the timing tools.
  }
}

export function trackEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  if (!analyticsReady || !canUseBrowser()) return;
  if (!safeEventNamePattern.test(eventName)) return;

  const routePath = currentPathname();
  try {
    analyticsClient?.capture(eventName, {
      route_path: routePath,
      ...sanitizeManualEventProperties(properties),
    });
  } catch {
    // Analytics failures must never interfere with the timing tools.
  }
}

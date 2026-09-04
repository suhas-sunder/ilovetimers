import type { AdSensePlacement } from "~/clients/components/ads/AdSense";
import { SITEMAP_GROUPS } from "~/clients/config/siteDirectory.js";

export type MonetizationEligibility = "live-ads" | "ad-free";

export type RouteMonetizationConfig = {
  path: string;
  eligibility: MonetizationEligibility;
  reason: string;
  allowedSlots: readonly AdSensePlacement[];
  contentExpansionNeeded: boolean;
  notes?: string;
};

export const LIVE_AD_SLOTS = [
  "top-banner",
  "sidebar-left",
  "sidebar-right",
  "below-header-banner",
  "seo-section-square",
  "above-footer-banner",
] as const satisfies readonly AdSensePlacement[];

export const NO_AD_SLOTS = [] as const satisfies readonly AdSensePlacement[];

export const routeMonetization = [
  {
    path: "/",
    eligibility: "live-ads",
    allowedSlots: LIVE_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "The homepage has substantial navigation and explanatory content for shared live placements.",
    notes:
      "AdSense fallbacks remain hidden until every requested unit is confirmed unfilled.",
  },
  {
    path: "/free-online-timers",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Archived four-timer experience must keep its current layout and controls.",
  },
  {
    path: "/about",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Trust and ownership page; no placeholders.",
  },
  {
    path: "/author/suhas-sunder",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Author identity page; no placeholders.",
  },
  {
    path: "/contact",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Contact page; no placeholders.",
  },
  {
    path: "/how-ilovetimers-is-made",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Methodology and transparency page; no placeholders.",
  },
  {
    path: "/copyright",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Copyright and content-concerns page; no placeholders.",
  },
  {
    path: "/privacy",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Noindex legal/privacy page; no placeholders.",
  },
  {
    path: "/terms",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Noindex legal page; no placeholders.",
  },
  {
    path: "/cookies",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason: "Noindex cookie/storage page; no placeholders.",
  },
  {
    path: "/sitemap",
    eligibility: "ad-free",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Navigation page is link-dense and higher accidental-click risk, so it stays ad-free.",
  },
] as const satisfies readonly RouteMonetizationConfig[];

export const routeMonetizationByPath: Readonly<Record<string, RouteMonetizationConfig>> =
  Object.fromEntries(routeMonetization.map((entry) => [entry.path, entry]));

const CANONICAL_PUBLIC_ROUTE_SET = new Set(
  SITEMAP_GROUPS.flatMap((group) => group.routes),
);

export function getRouteMonetization(path: string) {
  const normalizedPath =
    path.length > 1 ? path.replace(/\/+$/, "") : path;
  const explicitConfig = routeMonetizationByPath[normalizedPath];
  if (explicitConfig) return explicitConfig;

  if (CANONICAL_PUBLIC_ROUTE_SET.has(normalizedPath)) {
    return {
      path: normalizedPath,
      eligibility: "live-ads" as const,
      reason: "Canonical tool and guide route with substantive user-facing content.",
      allowedSlots: LIVE_AD_SLOTS,
      contentExpansionNeeded: false,
    };
  }

  return {
    path: normalizedPath,
    eligibility: "ad-free" as const,
    reason: "Unknown, fallback, or noncanonical route; no advertising requests.",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
  };
}

export function isLiveAdRoute(path: string) {
  return getRouteMonetization(path).eligibility === "live-ads";
}

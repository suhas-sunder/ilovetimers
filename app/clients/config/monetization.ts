import type { AdSlotType } from "~/clients/components/ui/foundation";

export type MonetizationEligibility =
  | "homepage-placeholder-only"
  | "ad-free";

export type RouteMonetizationConfig = {
  path: string;
  eligibility: MonetizationEligibility;
  reason: string;
  allowedSlots: readonly AdSlotType[];
  contentExpansionNeeded: boolean;
  notes?: string;
};

export const HOMEPAGE_AD_SLOTS = [
  "in-content-square",
  "bottom-banner",
] as const satisfies readonly AdSlotType[];

export const NO_AD_SLOTS = [] as const satisfies readonly AdSlotType[];

export const routeMonetization = [
  {
    path: "/",
    eligibility: "homepage-placeholder-only",
    allowedSlots: HOMEPAGE_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "The homepage may show up to two quiet placeholders between explanatory sections.",
    notes:
      "No live ad code is installed. Tool, trust, legal, sitemap, and archive routes stay ad-free.",
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

export function getRouteMonetization(path: string) {
  return routeMonetizationByPath[path];
}

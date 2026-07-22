/**
 * Stage 3 route-architecture decisions.
 *
 * Canonical route declarations remain in app/routes.ts and permanent aliases
 * remain in redirects.js. This module records the indexability and product
 * classification decisions that navigation and audit systems need.
 */

export const STAGE3_NEW_REDIRECTS = Object.freeze({
  "/fullscreen-timer": "/online-timer",
  "/count-up-timer": "/stopwatch",
  "/cooking-timer": "/kitchen-timer",
  "/boxing-timer": "/round-timer",
  "/world-clock-with-seconds": "/world-clock",
  "/analog-clock-with-second-hand": "/analog-clock",
  "/full-screen-analog-clock": "/analog-clock",
  "/smooth-second-hand-clock": "/analog-clock",
  "/full-screen-clock": "/digital-clock",
  "/big-digital-clock": "/digital-clock",
  "/clock-with-seconds": "/digital-clock",
});

export const STAGE3_NOINDEX_ROUTES = Object.freeze([
  "/1-minute-timer",
  "/5-minute-timer",
  "/10-minute-timer",
  "/15-minute-timer",
  "/30-minute-timer",
  "/silent-timer",
  "/focus-session-timer",
  "/study-timer",
  "/break-timer",
  "/meeting-timer",
  "/workout-timer",
  "/rest-timer",
  "/current-local-time",
  "/minimalist-clock",
  "/atomic-clock",
  "/debt-clock",
  "/debt-repayment-timer",
  "/golden-hour-clock",
  "/moon-phase-clock",
  "/astronomical-clock",
  "/privacy",
  "/terms",
  "/cookies",
]);

export const STAGE3_INDEXABLE_PRESET_ROUTES = Object.freeze([
  "/seconds-timer",
  "/tabata-timer",
  "/tea-timer",
  "/egg-timer",
  "/pizza-timer",
  "/new-year-countdown",
  "/christmas-countdown",
  "/birthday-countdown",
]);

export const STAGE3_NOINDEX_ROUTE_SET = new Set(STAGE3_NOINDEX_ROUTES);
export const STAGE3_REDIRECT_SOURCE_SET = new Set(
  Object.keys(STAGE3_NEW_REDIRECTS),
);
export const STAGE3_INDEXABLE_PRESET_ROUTE_SET = new Set(
  STAGE3_INDEXABLE_PRESET_ROUTES,
);

export const STAGE3_STATUS = Object.freeze({
  INDEPENDENT: "A",
  INDEXABLE_PRESET: "B",
  NOINDEX: "C",
  REDIRECT: "D",
  CONSOLIDATE_THEN_REDIRECT: "E",
  HUMAN_DECISION: "F",
});

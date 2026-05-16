export const designTokens = {
  colors: {
    pageBackground: "var(--ilt-bg-page)",
    utilitySurface: "var(--ilt-bg-utility)",
    contentBand: "var(--ilt-bg-content)",
    textPrimary: "var(--ilt-text-primary)",
    textSecondary: "var(--ilt-text-secondary)",
    textMuted: "var(--ilt-text-muted)",
    amberAccent: "var(--ilt-accent)",
    amberAccentHover: "var(--ilt-accent-hover)",
    focusRing: "var(--ilt-focus-ring)",
  },
  shadows: {
    interactive: "var(--ilt-shadow-interactive)",
    interactiveHover: "var(--ilt-shadow-interactive-hover)",
  },
  radii: {
    control: "var(--ilt-radius-control)",
  },
  layout: {
    pageSidePadding: "var(--ilt-page-x)",
    displayMin: "var(--ilt-display-min)",
    displayLarge: "var(--ilt-display-large)",
  },
} as const;

export const tokenClasses = {
  page: "bg-[var(--ilt-bg-page)] text-[var(--ilt-text-primary)]",
  utilitySurface: "bg-[var(--ilt-bg-utility)]",
  contentBand: "bg-[var(--ilt-bg-content)]",
  textPrimary: "text-[var(--ilt-text-primary)]",
  textSecondary: "text-[var(--ilt-text-secondary)]",
  textMuted: "text-[var(--ilt-text-muted)]",
  accent: "text-[var(--ilt-accent)]",
  sidePadding: "ilt-side-padding",
  focusRing: "ilt-focus-ring",
  interactiveShadow: "ilt-control-shadow",
  displayType: "ilt-display-type",
  displayTypeLarge: "ilt-display-type-large",
} as const;

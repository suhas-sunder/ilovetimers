import { useMemo, type RefObject } from "react";

type FitDisplayTextOptions = {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: unknown[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
  fitAxis?: "width" | "box";
  initialScale?: number;
  initialMobileScale?: number;
};

function effectivePaddingAllowance(
  paddingAllowancePx: number,
  containerWidth: number,
) {
  if (containerWidth <= 480) {
    return Math.min(paddingAllowancePx, 32);
  }

  if (containerWidth <= 640) {
    return Math.min(paddingAllowancePx, 40);
  }

  return paddingAllowancePx;
}

function displaySize({
  sampleText,
  maxPx,
  paddingAllowancePx,
  initialScale,
  initialMobileScale,
}: {
  sampleText: string;
  maxPx: number;
  paddingAllowancePx: number;
  initialScale: number;
  initialMobileScale: number;
}) {
  const charCount = Math.max(1, sampleText.length);
  const hasAlphabeticCharacters = /[A-Za-z]/.test(sampleText);
  const hasLowercaseCharacters = /[a-z]/.test(sampleText);
  const hasDigits = /\d/.test(sampleText);
  const hasClockPunctuation = /[:.]/.test(sampleText);
  const averageCharacterEm =
    charCount <= 3
      ? 0.68
      : hasLowercaseCharacters
        ? 0.48
        : hasAlphabeticCharacters && (hasDigits || charCount <= 8)
          ? 0.52
          : hasAlphabeticCharacters
            ? 0.72
            : hasClockPunctuation && charCount >= 10
              ? 0.54
              : 0.65;
  const widthScale = charCount * averageCharacterEm;
  const preferredCqw =
    charCount === 1 ? 96 : Math.min(96, Math.max(8, 100 / widthScale));
  const preferredOffset =
    charCount === 1 ? 0 : paddingAllowancePx / widthScale;

  // The floor is derived from the smallest supported content box. It prevents
  // a tiny server paint while remaining safe at a 320px viewport. Because the
  // complete result is CSS-only, SSR, hydration, running ticks, and container
  // resizing all use one continuous size calculation with no JS resize pass.
  const mobileContainerWidth = 256;
  const mobilePreferredOffset =
    charCount === 1
      ? 0
      : effectivePaddingAllowance(paddingAllowancePx, mobileContainerWidth) /
        widthScale;
  const sizeCapPx = Math.round(maxPx * 1.35);
  // Leave a small glyph and letter-spacing margin. Font metrics can extend
  // beyond the average-character estimate even with tabular numerals.
  const scale = Math.min(1, initialScale) * 0.9;
  const mobileScale = Math.min(1, initialMobileScale);
  const mobileFloorPx = Math.min(
    sizeCapPx,
    Math.max(
      16,
      ((preferredCqw / 100) * mobileContainerWidth - mobilePreferredOffset) *
        mobileScale *
        0.95,
    ),
  );

  return `clamp(16px, max(calc(${(preferredCqw * scale).toFixed(4)}cqw - ${(preferredOffset * scale).toFixed(1)}px), ${mobileFloorPx.toFixed(1)}px), ${sizeCapPx}px)`;
}

function dependencyShape(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    const compact = String(value).replace(/\s+/g, " ").trim();
    // Timer digits use tabular numerals, so values with the same punctuation
    // and digit count have the same geometry. This also keeps millisecond
    // displays from producing a new style value on every animation frame.
    // Hexadecimal clocks use the same monospace cells for 0-9 and A-F, so
    // normalize both sets before the first A-F transition can alter sizing.
    if (/^[0-9a-f:.]+$/i.test(compact) && /[:.]/.test(compact)) {
      return compact.replace(/[0-9a-f]/gi, "0");
    }
    return compact.replace(/\d/g, "0");
  }

  return "";
}

export function useFitDisplayText({
  deps,
  maxPx = 420,
  paddingAllowancePx = 0,
  initialScale = 1,
  initialMobileScale = initialScale,
}: FitDisplayTextOptions) {
  const sampleText =
    deps.map(dependencyShape).find((value) => value.length > 0) ?? "00:00";

  return useMemo(
    () =>
      displaySize({
        sampleText,
        maxPx,
        paddingAllowancePx,
        initialScale,
        initialMobileScale,
      }),
    [
      initialMobileScale,
      initialScale,
      maxPx,
      paddingAllowancePx,
      sampleText,
    ],
  );
}

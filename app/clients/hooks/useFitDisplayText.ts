import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

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

function initialDisplaySize({
  deps,
  minPx,
  maxPx,
  paddingAllowancePx,
  initialScale,
  initialMobileScale,
}: {
  deps: unknown[];
  minPx: number;
  maxPx: number;
  paddingAllowancePx: number;
  initialScale: number;
  initialMobileScale: number;
}) {
  const sample = deps.find(
    (dep) => typeof dep === "string" || typeof dep === "number",
  );
  const sampleText = String(sample ?? "00:00").replace(/\s+/g, " ").trim();
  const charCount = Math.max(
    1,
    sampleText.length,
  );
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
  // Keep the deterministic SSR value safe for a 320px viewport after page
  // and tool padding. Hydration can enlarge it after measuring the real box.
  const mobileContainerWidth = 256;
  const mobilePreferredOffset =
    charCount === 1
      ? 0
      : effectivePaddingAllowance(paddingAllowancePx, mobileContainerWidth) /
        widthScale;
  const initialMaxPx = Math.round(maxPx * 1.35);
  const scale = Math.min(1, initialScale);
  const mobileScale = Math.min(1, initialMobileScale);
  const mobileFloorPx = Math.min(
    initialMaxPx,
    Math.max(
      16,
      ((preferredCqw / 100) * mobileContainerWidth - mobilePreferredOffset) *
        mobileScale *
        0.95,
    ),
  );

  return `clamp(16px, max(calc(${(preferredCqw * scale).toFixed(4)}cqw - ${(preferredOffset * scale).toFixed(1)}px), ${mobileFloorPx.toFixed(1)}px), ${initialMaxPx}px)`;
}

function largeScreenMaxPx(maxPx: number, containerWidth: number) {
  if (containerWidth < 960) return maxPx;

  const scale = containerWidth >= 1600 ? 1.35 : 1.22;
  const widthBound = containerWidth * 0.46;
  return Math.max(maxPx, Math.round(Math.min(maxPx * scale, widthBound)));
}

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

export function useFitDisplayText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
  fitAxis = "width",
  initialScale = 1,
  initialMobileScale = initialScale,
}: FitDisplayTextOptions) {
  const [fontSize, setFontSize] = useState<number | string>(() =>
    initialDisplaySize({
      deps,
      minPx,
      maxPx,
      paddingAllowancePx,
      initialScale,
      initialMobileScale,
    }),
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    let raf: number | null = null;
    let settledTimers: number[] = [];
    let lastContainerWidth = 0;
    let lastContainerHeight = 0;

    const compute = () => {
      const currentContainer = containerRef.current;
      const currentText = textRef.current;
      if (!currentContainer || !currentText) return;

      const rect = currentContainer.getBoundingClientRect();
      // Intrinsic text width can temporarily enlarge an unconstrained flex or
      // grid ancestor. Do not treat that overflow-created width as usable
      // display space or the measurement becomes self-reinforcing.
      const viewportWidth = document.documentElement.clientWidth;
      const containerWidth = Math.min(
        rect.width,
        Math.max(0, viewportWidth - Math.max(0, rect.left)),
      );
      const effectivePaddingPx = effectivePaddingAllowance(
        paddingAllowancePx,
        containerWidth,
      );
      const availableWidth = Math.max(0, containerWidth - effectivePaddingPx);
      const availableHeight = Math.max(0, rect.height - effectivePaddingPx);
      if (availableWidth <= 0 || availableHeight <= 0) return;
      lastContainerWidth = rect.width;
      lastContainerHeight = rect.height;

      const effectiveMaxPx = largeScreenMaxPx(maxPx, containerWidth);
      const measuredFontPx =
        Number.parseFloat(window.getComputedStyle(currentText).fontSize) ||
        minPx;
      const textRect = currentText.getBoundingClientRect();
      const textRange = document.createRange();
      textRange.selectNodeContents(currentText);
      const rangeRect = textRange.getBoundingClientRect();
      // A text node can be constrained to its parent while its glyphs still
      // overflow. Include the range and intrinsic scroll measurements so the
      // fitted size is based on the complete rendered value.
      const renderedWidth = Math.max(
        textRect.width,
        rangeRect.width,
        currentText.scrollWidth,
      );
      const renderedHeight = Math.max(
        textRect.height,
        rangeRect.height,
        currentText.scrollHeight,
      );
      const widthScale = renderedWidth > 0 ? availableWidth / renderedWidth : 1;
      const heightScale =
        fitAxis === "box" && renderedHeight > 0
          ? availableHeight / renderedHeight
          : Number.POSITIVE_INFINITY;
      // `minPx` is a preferred readable floor, not permission to overflow a
      // genuinely narrow display. The 16px hard floor keeps text usable while
      // the 2% allowance absorbs fractional glyph and scrollbar rounding.
      const best = Math.max(
        16,
        Math.min(
          effectiveMaxPx,
          Math.floor(
            measuredFontPx * Math.min(widthScale, heightScale) * 0.98,
          ),
        ),
      );

      currentText.style.setProperty("font-size", `${best}px`);
      setFontSize(`${best}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const clearSettledTimers = () => {
      settledTimers.forEach((timer) => window.clearTimeout(timer));
      settledTimers = [];
    };

    const scheduleSettled = () => {
      schedule();
      clearSettledTimers();
      settledTimers = [
        window.setTimeout(compute, 80),
        window.setTimeout(compute, 240),
      ];
    };

    const checkContainerSize = () => {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const rect = currentContainer.getBoundingClientRect();
      if (
        Math.abs(rect.width - lastContainerWidth) > 0.5 ||
        Math.abs(rect.height - lastContainerHeight) > 0.5
      ) {
        compute();
      }
    };

    const resizeObserver = new ResizeObserver(scheduleSettled);
    resizeObserver.observe(container);
    window.addEventListener("resize", scheduleSettled);
    window.addEventListener("orientationchange", scheduleSettled);
    window.visualViewport?.addEventListener("resize", scheduleSettled);

    compute();
    const sizePoll = window.setInterval(checkContainerSize, 500);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearSettledTimers();
      window.clearInterval(sizePoll);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleSettled);
      window.removeEventListener("orientationchange", scheduleSettled);
      window.visualViewport?.removeEventListener("resize", scheduleSettled);
    };
    // Route migrations should pass primitive deps so this effect stays stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontSize;
}

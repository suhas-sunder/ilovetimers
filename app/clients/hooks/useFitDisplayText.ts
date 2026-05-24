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
  const initialMaxPx = Math.round(maxPx * 1.35);
  const scale = initialScale;
  const mobileContainerWidth = 358;
  const mobileFloorPx = Math.min(
    initialMaxPx,
    Math.max(
      minPx,
      ((preferredCqw / 100) * mobileContainerWidth - preferredOffset) *
        initialMobileScale,
    ),
  );

  return `clamp(${minPx}px, max(calc(${(preferredCqw * scale).toFixed(4)}cqw - ${(preferredOffset * scale).toFixed(1)}px), ${mobileFloorPx.toFixed(1)}px), ${initialMaxPx}px)`;
}

function largeScreenMaxPx(maxPx: number, containerWidth: number) {
  if (containerWidth < 960) return maxPx;

  const scale = containerWidth >= 1600 ? 1.35 : 1.22;
  const widthBound = containerWidth * 0.46;
  return Math.max(maxPx, Math.round(Math.min(maxPx * scale, widthBound)));
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
      const availableWidth = Math.max(0, rect.width - paddingAllowancePx);
      const availableHeight = Math.max(0, rect.height - paddingAllowancePx);
      if (availableWidth <= 0 || availableHeight <= 0) return;
      lastContainerWidth = rect.width;
      lastContainerHeight = rect.height;

      const originalFontSize = currentText.style.fontSize;

      const fits = (size: number | string) => {
        currentText.style.fontSize =
          typeof size === "number" ? `${size}px` : size;
        const textRect = currentText.getBoundingClientRect();
        return (
          textRect.width <= availableWidth &&
          (fitAxis === "width" || textRect.height <= availableHeight)
        );
      };

      const estimatedFontSize = initialDisplaySize({
        deps,
        minPx,
        maxPx,
        paddingAllowancePx,
        initialScale,
        initialMobileScale,
      });

      if (fits(estimatedFontSize)) {
        currentText.style.fontSize = originalFontSize;
        setFontSize(estimatedFontSize);
        return;
      }

      const effectiveMaxPx = largeScreenMaxPx(maxPx, rect.width);
      let low = minPx;
      let high = effectiveMaxPx;
      let best = minPx;

      if (fits(effectiveMaxPx)) {
        best = effectiveMaxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((low + high) / 2);
          if (fits(mid)) {
            best = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
      }

      currentText.style.fontSize = originalFontSize;
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

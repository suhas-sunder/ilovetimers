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
  const hasWideCharacters = /[A-Za-z\s]/.test(sampleText);
  const averageCharacterEm =
    charCount <= 3 ? 0.68 : hasWideCharacters ? 0.72 : 0.65;
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

    const compute = () => {
      const currentContainer = containerRef.current;
      const currentText = textRef.current;
      if (!currentContainer || !currentText) return;

      const rect = currentContainer.getBoundingClientRect();
      const availableWidth = Math.max(0, rect.width - paddingAllowancePx);
      const availableHeight = Math.max(0, rect.height - paddingAllowancePx);
      if (availableWidth <= 0 || availableHeight <= 0) return;

      const originalFontSize = currentText.style.fontSize;

      const fits = (px: number) => {
        currentText.style.fontSize = `${px}px`;
        const textRect = currentText.getBoundingClientRect();
        return (
          textRect.width <= availableWidth &&
          (fitAxis === "width" || textRect.height <= availableHeight)
        );
      };

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

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(container);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    compute();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // Route migrations should pass primitive deps so this effect stays stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontSize;
}

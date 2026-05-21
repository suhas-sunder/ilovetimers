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
};

function initialDisplaySize({
  deps,
  minPx,
  maxPx,
  paddingAllowancePx,
  initialScale,
}: {
  deps: unknown[];
  minPx: number;
  maxPx: number;
  paddingAllowancePx: number;
  initialScale: number;
}) {
  const sample = deps.find(
    (dep) => typeof dep === "string" || typeof dep === "number",
  );
  const charCount = Math.max(
    1,
    String(sample ?? "00:00").replace(/\s+/g, " ").trim().length,
  );
  const averageDigitEm = 0.65;
  const widthScale = charCount * averageDigitEm;
  const preferredVw = Math.min(52, Math.max(10, 100 / widthScale));
  const preferredOffset = (paddingAllowancePx + 48) / widthScale;
  return `clamp(${minPx}px, calc(${(preferredVw * initialScale).toFixed(2)}vw - ${(preferredOffset * initialScale).toFixed(1)}px), ${maxPx}px)`;
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
}: FitDisplayTextOptions) {
  const [fontSize, setFontSize] = useState<number | string>(() =>
    initialDisplaySize({
      deps,
      minPx,
      maxPx,
      paddingAllowancePx,
      initialScale,
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

      let low = minPx;
      let high = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
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

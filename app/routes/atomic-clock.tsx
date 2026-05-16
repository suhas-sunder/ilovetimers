// app/routes/atomic-clock.tsx
import type { Route } from "./+types/atomic-clock";
import { json } from "@remix-run/node";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/atomic-clock/Disclaimer";
import FAQ from "~/clients/components/atomic-clock/FAQ";
import HowItWorks from "~/clients/components/atomic-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/atomic-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/atomic-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Online Atomic Clock (Exact Time With Milliseconds, Fullscreen)";
  const description =
    "View the current time with milliseconds in a clean fullscreen atomic-style display. Big readable layout with optional keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/atomic-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "atomic clock",
        "atomic clock online",
        "exact time",
        "accurate time",
        "time with milliseconds",
        "fullscreen clock",
        "precise time",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.jpg",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffffff" },
  ];
}

/* =========================================================
   LOADER
========================================================= */
export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");
const pad3 = (n: number) => n.toString().padStart(3, "0");

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function fmtHMSMs(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
}

function fmtHMS(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function useIsFullscreen(targetRef: React.RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
}

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const initialFontPx = (() => {
    const sample = deps.find(
      (dep) => typeof dep === "string" || typeof dep === "number",
    );
    const charCount = Math.max(
      1,
      String(sample ?? "00:00").replace(/\s/g, "").length,
    );
    const preferredVw = Math.min(34, Math.max(8, 84 / (charCount * 0.62)));
    return `clamp(${minPx}px, ${preferredVw.toFixed(2)}vw, ${maxPx}px)`;
  })();

  const [fontPx, setFontPx] = useState<number | string>(initialFontPx);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(`${best}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    compute();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
}

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
  disabled,
  title,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  left,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
          {left}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/* =========================================================
   ATOMIC CLOCK CARD
========================================================= */
function AtomicClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [showMs, setShowMs] = useState(true);
  const [live, setLive] = useState(true);

  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const stopTicks = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // Improve UX: focus the card once so shortcuts work immediately (without extra UI text)
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!cardRef.current) return;
      const ae = document.activeElement as HTMLElement | null;
      const okToSteal =
        !ae || ae === document.body || ae === document.documentElement;
      if (okToSteal) cardRef.current.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    stopTicks();

    if (!live) return;

    if (showMs) {
      const tick = () => {
        setNow(new Date());
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => stopTicks();
    }

    // No milliseconds: update on second boundary for stability
    const update = () => setNow(new Date());
    update();

    const msToNextSecond = 1000 - new Date().getMilliseconds();
    const t = window.setTimeout(() => {
      update();
      intervalRef.current = window.setInterval(
        update,
        1000,
      ) as unknown as number;
    }, msToNextSecond);

    return () => {
      window.clearTimeout(t);
      stopTicks();
    };
  }, [live, showMs]);

  useEffect(() => {
    return () => stopTicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const display = useMemo(() => {
    return showMs ? fmtHMSMs(now) : fmtHMS(now);
  }, [now, showMs]);

  const statusLabel = live ? "Live" : "Frozen";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, statusLabel, isFs, live, showMs],
    minPx: isFs ? 52 : 24,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      setLive((v) => !v);
    } else if (k === "m") {
      setShowMs((v) => !v);
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Atomic Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
                className="accent-amber-500"
              />
              Live
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showMs}
                onChange={(e) => setShowMs(e.target.checked)}
                className="accent-amber-500"
              />
              Milliseconds
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={live ? "solid" : "ghost"}
              onClick={() => setLive((v) => !v)}
              className="py-1 text-sm"
            >
              {live ? "Freeze" : "Resume"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Settings (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  className="accent-amber-500"
                />
                Live
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showMs}
                  onChange={(e) => setShowMs(e.target.checked)}
                  className="accent-amber-500"
                />
                Milliseconds
              </label>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
                title="Fullscreen (F)"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
            "border-slate-200 bg-slate-50 text-slate-950",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) setLive((v) => !v);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to freeze or resume" : undefined}
        >
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {display}
          </span>

          {!isFs && (
            <div className="mt-4 flex flex-col items-center gap-3 text-center">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                {statusLabel}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Btn onClick={() => setLive((v) => !v)}>
                  {live ? "Freeze" : "Resume"}
                </Btn>
                <Btn kind="ghost" onClick={() => setShowMs((v) => !v)}>
                  {showMs ? "Hide ms" : "Show ms"}
                </Btn>
              </div>

              <div className="text-xs font-semibold text-slate-600">
                Shortcuts: Space freeze/resume - M toggle ms - F fullscreen
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  className="accent-amber-500"
                />
                Live
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showMs}
                  onChange={(e) => setShowMs(e.target.checked)}
                  className="accent-amber-500"
                />
                Milliseconds
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn
                  kind={live ? "solid" : "ghost"}
                  onClick={() => setLive((v) => !v)}
                >
                  {live ? "Freeze" : "Resume"}
                </Btn>
                <Btn kind="ghost" onClick={() => setShowMs((v) => !v)}>
                  {showMs ? "Hide ms" : "Show ms"}
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to freeze/resume · Space freeze/resume · M ms · F
                fullscreen
              </div>
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AtomicClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  void _nowISO;

  const url = "https://www.ilovetimers.com/atomic-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Atomic Clock",
        url,
        description:
          "Atomic clock style live time display with optional milliseconds and fullscreen mode.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.ilovetimers.com/",
          },
          { "@type": "ListItem", position: 2, name: "Atomic Clock", item: url },
        ],
      },
    ],
  };

  return (
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Online Atomic Clock (Milliseconds + Fullscreen)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            View your current device time with optional milliseconds. Use
            fullscreen for a big, readable display, plus keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <AtomicClockCard />
        </div>

        {/* Breadcrumb (bottom only, intentional) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Atomic Clock</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}

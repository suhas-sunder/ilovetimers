// app/routes/digital-clock.tsx
import type { Route } from "./+types/digital-clock";
import { json } from "@remix-run/node";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/digital-clock/Disclaimer";
import FAQ from "~/clients/components/digital-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/digital-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/digital-clock/PopularUseCases";
import HowItWorks from "~/clients/components/digital-clock/HowItWorks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Digital Clock (Big Fullscreen Clock With Seconds)";
  const description =
    "Free digital clock showing your local time with big, readable digits. Toggle seconds and 12 or 24-hour time, go fullscreen, and copy the time for classrooms or offices.";

  const url = "https://www.ilovetimers.com/digital-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "digital clock",
        "digital clock online",
        "big digital clock",
        "fullscreen digital clock",
        "current local time",
        "time now",
        "clock online",
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatLocalTime(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const { use24, showSeconds } = opts;
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24,
    });
    return fmt
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    if (use24) {
      return showSeconds
        ? `${pad2(h)}:${pad2(m)}:${pad2(s)}`
        : `${pad2(h)}:${pad2(m)}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return showSeconds
      ? `${pad2(h12)}:${pad2(m)}:${pad2(s)} ${ampm}`
      : `${pad2(h12)}:${pad2(m)} ${ampm}`;
  }
}

function formatLocalDateLine(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
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
 * Fit a single-line string into its container by adjusting font size.
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
  const [fontPx, setFontPx] = useState<number>(minPx);

  useEffect(() => {
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
      setFontPx(best);
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

    schedule();

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
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
   DIGITAL CLOCK CARD
========================================================= */
function DigitalClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  // Keep time accurate to boundaries (no drift)
  useEffect(() => {
    let t: number | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const d = new Date();
      setNow(d);

      const ms = d.getMilliseconds();
      const untilNext = showSeconds
        ? 1000 - ms
        : // update near the start of the next minute for "no seconds"
          (60 - d.getSeconds()) * 1000 - ms;

      t = window.setTimeout(schedule, Math.max(50, untilNext));
    };

    schedule();

    return () => {
      cancelled = true;
      if (t) window.clearTimeout(t);
    };
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatLocalTime(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const dateText = useMemo(() => formatLocalDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `${timeText} (${tz}) - ${dateText} (ISO: ${iso})`;
  }, [timeText, tz, dateText, now]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, use24, showSeconds],
    minPx: 64,
    maxPx: isFs ? 560 : 360,
    paddingAllowancePx: isFs ? 92 : 92,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (e.key === "escape" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
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
        title="Digital Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                className="accent-amber-500"
              />
              Seconds
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={use24}
                onChange={(e) => setUse24(e.target.checked)}
                className="accent-amber-500"
              />
              24-hour
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {/* Controls (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="accent-amber-500"
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                  className="accent-amber-500"
                />
                24-hour
              </label>

              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
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
            "mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-6",
            "font-mono font-extrabold text-slate-950",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy time" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700 text-center">
            Local time · {tz}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center whitespace-nowrap",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>

          <div className="mt-4 text-sm font-semibold text-slate-700 text-center">
            {dateText}
          </div>

          {!isFs && (
            <div className="mt-4 text-xs text-slate-600 text-center">
              Shortcuts: F fullscreen · C copy · S seconds · 1 (12h) · 2 (24h)
            </div>
          )}
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="accent-amber-500"
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                  className="accent-amber-500"
                />
                24-hour
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind="ghost" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to copy · F fullscreen · S seconds · 1/2 12/24-hour
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
export default function DigitalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/digital-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Digital Clock",
        url,
        description:
          "Big digital clock showing your current local time with fullscreen, seconds toggle, 12/24-hour mode, and copy.",
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
          {
            "@type": "ListItem",
            position: 2,
            name: "Digital Clock",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Minimal header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Digital Clock (Big Fullscreen Clock)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Big, readable local time. Toggle seconds and 12/24-hour, go
            fullscreen, and copy the current time.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <DigitalClockCard />
        </div>

        {/* Breadcrumb at bottom (intentional) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Digital Clock</span>
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

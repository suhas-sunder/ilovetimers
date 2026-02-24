// app/routes/current-local-time.tsx
import type { Route } from "./+types/current-local-time";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/current-local-time/HowItWorks";
import Disclaimer from "~/clients/components/current-local-time/Disclaimer";
import FAQ from "~/clients/components/current-local-time/FAQ";
import KeyboardShortcuts from "~/clients/components/current-local-time/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/current-local-time/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Current Local Time (Big Fullscreen Clock + Copy Time)";
  const description =
    "See your local time now in a big, readable display. Toggle seconds and 12 or 24-hour time, go fullscreen, and copy the time for classrooms, meetings, and streaming overlays.";

  const url = "https://www.ilovetimers.com/current-local-time";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "current local time",
        "local time now",
        "current time now",
        "time right now",
        "current time",
        "local time",
        "current time in my location",
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
  return json(
    { nowISO: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    },
  );
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

function formatClock(d: Date, opts: { use24: boolean; showSeconds: boolean }) {
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
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();

    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");

    if (use24) {
      const hh = String(h).padStart(2, "0");
      return showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    }

    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const hh = String(h12).padStart(2, "0");
    return showSeconds ? `${hh}:${mm}:${ss} ${ampm}` : `${hh}:${mm} ${ampm}`;
  }
}

function formatDateLine(d: Date) {
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

// ISO week number (week starts Monday)
function isoWeekNumber(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Thursday in current week decides the year
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day + 3);

  const firstThursday = new Date(d.getFullYear(), 0, 4);
  firstThursday.setHours(0, 0, 0, 0);

  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

  const diffMs = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function formatTimeInZone(
  d: Date,
  timeZone: string,
  opts: { use24: boolean; showSeconds: boolean },
) {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: opts.showSeconds ? "2-digit" : undefined,
      hour12: !opts.use24,
    });
    return fmt
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return "—";
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

const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
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

const ZoneTile = ({
  label,
  time,
  active,
  onClick,
}: {
  label: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "cursor-pointer rounded-xl border px-4 py-3 text-left transition",
      active
        ? "border-slate-300 bg-slate-200/70"
        : "border-slate-200 bg-white hover:bg-slate-50",
    ].join(" ")}
  >
    <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
      {label}
    </div>
    <div className="mt-1 font-mono text-2xl font-extrabold text-slate-950">
      {time}
    </div>
  </button>
);

/* =========================================================
   CURRENT LOCAL TIME CARD
========================================================= */
function CurrentLocalTimeCard() {
  const tz = useMemo(() => safeTimeZone(), []);

  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const zones = useMemo(
    () => [
      { key: "local", label: "Local", tz: "local" },
      { key: "vancouver", label: "Vancouver", tz: "America/Vancouver" },
      { key: "toronto", label: "Toronto", tz: "America/Toronto" },
      { key: "newyork", label: "New York", tz: "America/New_York" },
      { key: "london", label: "London", tz: "Europe/London" },
      { key: "milan", label: "Milan", tz: "Europe/Rome" },
      { key: "beijing", label: "Beijing", tz: "Asia/Shanghai" },
    ],
    [],
  );

  const [activeZoneKey, setActiveZoneKey] = useState<string>("local");

  // Keep time accurate
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();

    if (showSeconds) {
      const t = window.setInterval(tick, 250);
      return () => window.clearInterval(t);
    }

    const d = new Date();
    const msToNextMinute = (60 - d.getSeconds()) * 1000 - d.getMilliseconds();

    const timeout = window.setTimeout(
      () => {
        tick();
        const t = window.setInterval(tick, 10_000);
        (tick as any).__interval = t;
      },
      Math.max(0, msToNextMinute),
    );

    return () => {
      window.clearTimeout(timeout);
      const t = (tick as any).__interval as number | undefined;
      if (t) window.clearInterval(t);
    };
  }, [showSeconds]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  const activeZone = useMemo(() => {
    return zones.find((z) => z.key === activeZoneKey) ?? zones[0];
  }, [zones, activeZoneKey]);

  const activeTimeText = useMemo(() => {
    if (activeZone.tz === "local") {
      return formatClock(now, { use24, showSeconds });
    }
    return formatTimeInZone(now, activeZone.tz, { use24, showSeconds });
  }, [now, activeZone.tz, use24, showSeconds]);

  const dateText = useMemo(() => formatDateLine(now), [now]);
  const weekNo = useMemo(() => isoWeekNumber(now), [now]);

  const zoneTiles = useMemo(() => {
    // Tiles don’t need seconds even if main display shows them.
    const tileOpts = { use24, showSeconds: false };
    return zones
      .filter((z) => z.key !== "local")
      .map((z) => ({
        ...z,
        time: formatTimeInZone(now, z.tz, tileOpts),
      }));
  }, [zones, now, use24]);

  const copyText = useMemo(() => {
    const zoneLabel = activeZone.tz === "local" ? tz : activeZone.label;
    return `${activeTimeText} (${zoneLabel}) - ${dateText} (week ${weekNo})`;
  }, [activeTimeText, activeZone, tz, dateText, weekNo]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [activeTimeText, isFs, use24, showSeconds, activeZoneKey],
    minPx: 54,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
    }

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
    }
  };

  const topLabel = useMemo(() => {
    if (activeZone.tz === "local") return `Local time now · ${tz}`;
    return `Time in ${activeZone.label} now`;
  }, [activeZone, tz]);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Current Local Time"
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
        {/* Header (normal only) */}
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
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
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
          title={isFs ? "Tap/click to copy" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {topLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {activeTimeText}
          </span>

          <div className="mt-3 text-center text-sm font-semibold text-slate-700">
            <div className="text-2xl font-semibold text-slate-700 sm:text-3xl">
              {dateText}, week {weekNo}
            </div>
          </div>

          {!isFs && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                {use24 ? "24-hour" : "12-hour"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Seconds {showSeconds ? "on" : "off"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Press C to copy
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                F fullscreen
              </span>
            </div>
          )}

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {/* Quick compare (normal only) */}
        {!isFs && (
          <div className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Quick compare
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  active={activeZoneKey === "local"}
                  onClick={() => setActiveZoneKey("local")}
                >
                  Local
                </Chip>
                <Chip
                  active={activeZoneKey === "toronto"}
                  onClick={() => setActiveZoneKey("toronto")}
                >
                  Toronto
                </Chip>
                <Chip
                  active={activeZoneKey === "newyork"}
                  onClick={() => setActiveZoneKey("newyork")}
                >
                  New York
                </Chip>
                <Chip
                  active={activeZoneKey === "london"}
                  onClick={() => setActiveZoneKey("london")}
                >
                  London
                </Chip>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {zoneTiles.map((z) => (
                <ZoneTile
                  key={z.key}
                  label={z.label}
                  time={z.time}
                  active={activeZoneKey === z.key}
                  onClick={() => setActiveZoneKey(z.key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to copy · F fullscreen · C copy · S seconds · 1 (12h) · 2
              (24h)
            </div>
            <div className="flex items-center gap-2">
              <Btn kind="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
              >
                Exit fullscreen
              </Btn>
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
export default function CurrentLocalTimePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/current-local-time";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Current Local Time",
        url,
        description:
          "See your current local time instantly with a big readable clock, optional seconds, 12/24-hour toggle, copy, and fullscreen.",
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
            name: "Current Local Time",
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
            Current Local Time
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Big readable clock with seconds, 12/24-hour toggle, copy, and
            fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <CurrentLocalTimeCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Current Local Time</span>
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

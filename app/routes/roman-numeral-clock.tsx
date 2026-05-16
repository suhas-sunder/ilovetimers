// app/routes/roman-numeral-clock.tsx
import type { Route } from "./+types/roman-numeral-clock";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Roman Numeral Clock (Live Time, Fullscreen)";
  const description =
    "See the current time written in Roman numerals. A clean, fullscreen Roman numeral clock with a clear, classic look.";

  const url = "https://www.ilovetimers.com/roman-numeral-clock";

  return [
    { title },
    { name: "description", content: description },
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

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
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

function romanNumeral(n: number) {
  // Supports 0..3999
  if (!Number.isFinite(n) || n <= 0) return "0";
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let x = Math.floor(n);
  let out = "";
  for (const [v, sym] of map) {
    while (x >= v) {
      out += sym;
      x -= v;
    }
  }
  return out;
}

function formatTimeString(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  if (opts.use24) {
    return opts.showSeconds
      ? `${pad2(hh24)}:${pad2(mm)}:${pad2(ss)}`
      : `${pad2(hh24)}:${pad2(mm)}`;
  }

  const { h, ampm } = to12h(hh24);
  return opts.showSeconds
    ? `${pad2(h)}:${pad2(mm)}:${pad2(ss)} ${ampm}`
    : `${pad2(h)}:${pad2(mm)} ${ampm}`;
}

function formatRomanTime(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean; useTraditionalIIII: boolean },
) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  if (opts.use24) {
    const hRoman = hh24 === 0 ? "0" : romanNumeral(hh24);
    const mRoman = mm === 0 ? "0" : romanNumeral(mm);
    const sRoman = ss === 0 ? "0" : romanNumeral(ss);
    return opts.showSeconds
      ? `${hRoman} : ${mRoman} : ${sRoman}`
      : `${hRoman} : ${mRoman}`;
  }

  const { h, ampm } = to12h(hh24);
  let hRoman = romanNumeral(h);
  if (opts.useTraditionalIIII && h === 4) hRoman = "IIII";

  const mRoman = mm === 0 ? "0" : romanNumeral(mm);
  const sRoman = ss === 0 ? "0" : romanNumeral(ss);

  return opts.showSeconds
    ? `${hRoman} : ${mRoman} : ${sRoman} ${ampm}`
    : `${hRoman} : ${mRoman} ${ampm}`;
}

/**
 * Fit a single-line string into its container by adjusting font size.
 * Designed to feel snappy: first pass runs in layout effect, then tracks resizes.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 34,
  maxPx = 220,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
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

  const compute = useCallback(() => {
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
  }, [containerRef, textRef, minPx, maxPx, paddingAllowancePx]);

  // First paint: measure immediately to avoid “slow loading” / layout wobble.
  useLayoutEffect(() => {
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    let raf: number | null = null;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(c);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [compute, containerRef]);

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
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function Toggle({
  label,
  checked,
  onChange,
  disabled,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <label
      className={[
        "cursor-pointer inline-flex select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
      ].join(" ")}
      title={title}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  );
}

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
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
   CLOCK CARD
========================================================= */
function RomanNumeralClockCard() {
  const [use24, setUse24] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [useIIII, setUseIIII] = useState(true);
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const [now, setNow] = useState<Date>(() => new Date());

  // Snappy ticking:
  // - update immediately on mount
  // - then align to next second (or next 15s boundary when seconds are hidden)
  useEffect(() => {
    let alive = true;
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const stepMs = showSeconds ? 1000 : 15000;

    const schedule = () => {
      if (!alive) return;
      const d = new Date();
      setNow(d);

      const t = d.getTime();
      const next = Math.ceil((t + 1) / stepMs) * stepMs; // +1 to avoid landing “now”
      const delay = Math.max(0, next - t);

      timeoutId = window.setTimeout(() => {
        if (!alive) return;
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), stepMs);
      }, delay);
    };

    schedule();

    return () => {
      alive = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );

  const romanText = useMemo(
    () =>
      formatRomanTime(now, {
        use24,
        showSeconds,
        useTraditionalIIII: useIIII,
      }),
    [now, use24, showSeconds, useIIII],
  );

  const dateText = useMemo(() => formatDateLine(now), [now]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `Roman Numeral Clock\n${romanText}\n${timeText} (${tz})\n${dateText}\nISO: ${iso}`;
  }, [romanText, timeText, tz, dateText, now]);

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

  const romanBoxRef = useRef<HTMLDivElement>(null);
  const romanSpanRef = useRef<HTMLSpanElement>(null);

  const timeBoxRef = useRef<HTMLDivElement>(null);
  const timeSpanRef = useRef<HTMLSpanElement>(null);

  const romanFontPx = useFitText({
    containerRef: romanBoxRef,
    textRef: romanSpanRef,
    deps: [romanText, isFs, use24, showSeconds, useIIII],
    minPx: 34,
    maxPx: isFs ? 220 : 140,
    paddingAllowancePx: isFs ? 40 : 56,
  });

  const timeFontPx = useFitText({
    containerRef: timeBoxRef,
    textRef: timeSpanRef,
    deps: [timeText, isFs, use24, showSeconds],
    minPx: 18,
    maxPx: isFs ? 64 : 36,
    paddingAllowancePx: isFs ? 40 : 56,
  });

  const statusLine = `${tz} · ${use24 ? "24-hour" : "12-hour"} · ${
    useIIII && !use24 ? "IIII" : "IV"
  } · ${showSeconds ? "seconds" : "no seconds"}`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "i") {
      if (!use24) setUseIIII((v) => !v);
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (k === "escape" && isFs) {
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
        title="Roman Numeral Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setShowSeconds((v) => !v)}
              className="py-1 text-sm"
            >
              Seconds: {showSeconds ? "On" : "Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setUse24((v) => !v)}
              className="py-1 text-sm"
            >
              {use24 ? "24h" : "12h"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => {
                if (!use24) setUseIIII((v) => !v);
              }}
              className="py-1 text-sm"
              disabled={use24}
            >
              IIII: {useIIII && !use24 ? "On" : "Off"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Roman Numeral Clock
              </h1>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
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

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Toggle
                label="Seconds"
                checked={showSeconds}
                onChange={setShowSeconds}
              />
              <Toggle label="24-hour" checked={use24} onChange={setUse24} />
              <Toggle
                label="Use IIII"
                checked={useIIII}
                onChange={setUseIIII}
                disabled={use24}
                title={
                  use24 ? "IIII style applies to 12-hour hour display" : ""
                }
              />
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: F fullscreen · C copy · S seconds · I IIII · 1 (12h) ·
              2 (24h)
            </div>
          </div>
        )}

        {/* Display */}
        <div
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            // ensure shortcuts work immediately after any click
            cardRef.current?.focus();
          }}
          title="Click once so keyboard shortcuts work immediately"
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLine}
          </div>

          <div
            ref={romanBoxRef}
            className="mt-3 flex w-full items-center justify-center"
            style={{
              minHeight: isFs
                ? "min(30vh, 220px)"
                : "clamp(110px, 14vw, 160px)",
              padding: isFs ? "0 10px" : "0 12px",
            }}
          >
            <span
              ref={romanSpanRef}
              className="text-center font-black tracking-[.14em] text-slate-900"
              style={{
                fontFamily:
                  'ui-serif, Georgia, "Times New Roman", Times, serif',
                fontSize: romanFontPx,
                lineHeight: "1.05",
                transform: "translateZ(0)",
                whiteSpace: "nowrap",
              }}
              aria-label={romanText}
            >
              {romanText}
            </span>
          </div>

          <div
            ref={timeBoxRef}
            className="mt-2 flex w-full items-center justify-center"
            style={{
              minHeight: isFs ? 60 : 44,
              padding: isFs ? "0 10px" : "0 12px",
            }}
          >
            <span
              ref={timeSpanRef}
              className="text-center font-mono font-extrabold tracking-widest text-slate-800"
              style={{
                fontSize: timeFontPx,
                lineHeight: "1.1",
                whiteSpace: "nowrap",
              }}
              aria-label={timeText}
            >
              {timeText}
            </span>
          </div>

          {!isFs && (
            <div className="mt-2 text-sm font-semibold text-slate-600">
              {dateText}
            </div>
          )}

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Local time
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {dateText}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  C = Copy
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Shortcuts: F fullscreen · C copy · S seconds · I IIII · 1 (12h) ·
              2 (24h)
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLine}
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
export default function RomanNumeralClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/roman-numeral-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Roman Numeral Clock",
        url,
        description:
          "Roman numeral clock showing current local time in Roman numerals with seconds toggle, 12/24-hour mode, copy, and fullscreen.",
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
            name: "Roman Numeral Clock",
            item: url,
          },
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

      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <RomanNumeralClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Roman Numeral Clock</span>
        </p>
      </section>
    </main>
  );
}

// app/routes/hexadecimal-clock.tsx
import type { Route } from "./+types/hexadecimal-clock";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/hexadecimal-clock/HowItWorks";
import Disclaimer from "~/clients/components/hexadecimal-clock/Disclaimer";
import FAQ from "~/clients/components/hexadecimal-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/hexadecimal-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/hexadecimal-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Hexadecimal Clock (View Current Time in Hex)";
  const description =
    "Free hexadecimal clock that displays the current time in hex format. See HH:MM:SS and milliseconds, toggle 12 or 24-hour time, copy values, and go fullscreen.";

  const url = "https://www.ilovetimers.com/hexadecimal-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hexadecimal clock",
        "hex clock",
        "time in hex",
        "hex time",
        "clock in hexadecimal",
        "hex clock fullscreen",
        "hexadecimal time",
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
const pad3 = (n: number) => String(n).padStart(3, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
}

function toHex(n: number, width: number) {
  return n.toString(16).toUpperCase().padStart(width, "0");
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

/**
 * Fit a single-line string into its container by adjusting font size.
 * Uses ResizeObserver + rAF and binary-searches the max size that fits.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
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
   HEX CLOCK CARD
========================================================= */
type HexMode = "hms" | "rgb";

function HexClockCard() {
  const [showSeconds, setShowSeconds] = useState(true);
  const [showMs, setShowMs] = useState(false);
  const [use24, setUse24] = useState(true);
  const [mode, setMode] = useState<HexMode>("hms");

  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Guardrails so settings never land in an invalid state.
  useEffect(() => {
    if (!showSeconds && showMs) setShowMs(false);
  }, [showSeconds, showMs]);

  useEffect(() => {
    if (mode !== "hms" && showMs) setShowMs(false);
  }, [mode, showMs]);

  useEffect(() => {
    const interval = showMs ? 50 : showSeconds ? 250 : 15000;
    const t = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(t);
  }, [showSeconds, showMs]);

  const decTime = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );
  const dateText = useMemo(() => formatDateLine(now), [now]);

  const hex = useMemo(() => {
    const h24 = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    let hDisp = h24;
    let suffix = "";
    if (!use24) {
      const t = to12h(h24);
      hDisp = t.h;
      suffix = ` ${t.ampm}`;
    }

    const hh = toHex(hDisp, 2);
    const mm = toHex(m, 2);
    const ss = toHex(s, 2);
    const mms = toHex(ms, 3);

    if (mode === "rgb") {
      const rr = toHex(h24, 2);
      const gg = toHex(m, 2);
      const bb = toHex(s, 2);

      const raw = showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`;
      const color = showSeconds ? `#${rr}${gg}${bb}` : `#${rr}${gg}00`;

      return {
        main: raw,
        sub: showSeconds
          ? `RR=${rr} (hours) · GG=${gg} (minutes) · BB=${bb} (seconds)`
          : `RR=${rr} · GG=${gg} · BB=00`,
        color,
        raw,
        suffix: "",
      };
    }

    const main = showSeconds
      ? `${hh}:${mm}:${ss}${suffix}`
      : `${hh}:${mm}${suffix}`;

    const sub = showMs
      ? `ms: ${mms} (hex) · ${pad3(ms)} (dec)`
      : `Hours=${hh} · Minutes=${mm}${showSeconds ? ` · Seconds=${ss}` : ""}`;

    return {
      main,
      sub,
      color: null as string | null,
      raw: showMs ? `${main} · ms:${mms}` : main,
      suffix,
    };
  }, [now, use24, showSeconds, showMs, mode]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return [
      `Hex: ${hex.raw}`,
      `Dec: ${decTime} (${tz})`,
      `Date: ${dateText}`,
      `ISO: ${iso}`,
    ].join("\n");
  }, [hex, decTime, tz, dateText, now]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "m") {
      if (mode === "hms") setShowMs((v) => !v);
    } else if (k === "x") {
      setMode((m) => (m === "hms" ? "rgb" : "hms"));
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const showColorPanel = mode === "rgb";
  const color = showColorPanel ? (hex.color ?? "#000000") : null;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [hex.main, isFs, showSeconds, showMs, use24, mode],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Hexadecimal Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <span className="text-slate-700">Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as HexMode)}
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 hover:bg-slate-50"
              >
                <option value="hms">Hex HH:MM:SS</option>
                <option value="rgb">Hex color</option>
              </select>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
              />
              Seconds
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={showMs}
                onChange={(e) => setShowMs(e.target.checked)}
                disabled={!showSeconds || mode !== "hms"}
              />
              ms
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                className="cursor-pointer"
                checked={use24}
                onChange={(e) => setUse24(e.target.checked)}
              />
              24h
            </label>

            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Hexadecimal Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                View current local time rendered as hex values, or as a hex
                color clock.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <span className="text-slate-700">Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as HexMode)}
                  className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 hover:bg-slate-50"
                >
                  <option value="hms">Hex HH:MM:SS</option>
                  <option value="rgb">Hex color</option>
                </select>
              </label>

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
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={showMs}
                  onChange={(e) => setShowMs(e.target.checked)}
                  disabled={!showSeconds || mode !== "hms"}
                />
                ms
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                />
                24-hour
              </label>

              <Btn kind="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Btn>
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: F fullscreen · C copy · S seconds · M ms · X mode · 1
              (12h) · 2 (24h)
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700 text-center">
            Local time · {tz} · {mode === "hms" ? "Hex HH:MM:SS" : "Hex color"}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
          >
            {hex.main}
          </span>

          <div className="mt-3 text-sm font-semibold text-slate-700 text-center">
            {hex.sub}
          </div>

          {/* RGB preview (both modes; styled to never steal space from main clock) */}
          {showColorPanel && (
            <div className="mt-4 w-full max-w-[760px]">
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div
                  className="h-12 w-12 rounded-2xl border border-slate-200"
                  style={{ background: color ?? "#000" }}
                  aria-label="Current hex color"
                  title={color ?? "#000"}
                />
                <div className="min-w-0 text-center sm:text-left">
                  <div className="font-mono text-lg font-black text-slate-900">
                    {hex.main}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600">
                    RR=hours · GG=minutes · BB=seconds
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 text-xs font-semibold text-slate-600 text-center">
            {dateText} · Decimal {decTime}
          </div>
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap display to copy · F fullscreen · C copy · S seconds · M ms · X
              mode · 1 (12h) · 2 (24h)
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {copied ? "Copied" : "Ready"}
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
export default function HexadecimalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/hexadecimal-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Hexadecimal Clock",
        url,
        description:
          "Hexadecimal clock showing current local time in hex with optional seconds, milliseconds, 12/24-hour toggle, copy, and fullscreen. Includes hex color clock mode (#RRGGBB).",
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
            name: "Hexadecimal Clock",
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

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <HexClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Hexadecimal Clock</span>
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

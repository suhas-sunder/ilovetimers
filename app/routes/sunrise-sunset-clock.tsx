// app/routes/sunrise-sunset-clock.tsx
import type { Route } from "./+types/sunrise-sunset-clock";
import { json } from "@remix-run/node";
import {
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
  const title = "Today’s Sunrise & Sunset Times (Live Daylight Clock)";
  const description =
    "See today’s sunrise and sunset at a glance. Track daylight progress and how much time remains until the next sunrise or sunset with a clear live display.";

  const url = "https://www.ilovetimers.com/sunrise-sunset-clock";

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
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
const pad2 = (n: number) => String(n).padStart(2, "0");

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

function makeTimeFormatter(args: {
  timeZone: string;
  use24: boolean;
  showSeconds: boolean;
}) {
  const { timeZone, use24, showSeconds } = args;

  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24,
    });
  } catch {
    return null;
  }
}

function makeDateFormatter(timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return null;
  }
}

function formatWithFallbackTime(args: {
  date: Date;
  fmt: Intl.DateTimeFormat | null;
  use24: boolean;
  showSeconds: boolean;
}) {
  const { date, fmt, use24, showSeconds } = args;
  if (fmt)
    return fmt
      .format(date)
      .replace(/\u200e/g, "")
      .trim();

  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

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

function formatWithFallbackDate(args: {
  date: Date;
  fmt: Intl.DateTimeFormat | null;
}) {
  const { date, fmt } = args;
  if (fmt)
    return fmt
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  return date.toDateString();
}

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function toISODate(d: Date) {
  // YYYY-MM-DD in UTC; sunrise-sunset API accepts date without TZ and returns UTC instants
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}-${m}-${day}`;
}

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 *
 * Note: starts at maxPx so the first paint is big and snappy.
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
   API (sunrise-sunset.org)
   Returns UTC timestamps when formatted=0.
========================================================= */
type SunApiResponse = {
  results: {
    sunrise: string; // ISO UTC
    sunset: string; // ISO UTC
    solar_noon: string;
    day_length: number; // seconds
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: "OK" | string;
};

async function fetchSunTimes(args: {
  lat: number;
  lng: number;
  dateISO: string; // YYYY-MM-DD
}) {
  const { lat, lng, dateISO } = args;
  const url = `https://api.sunrise-sunset.org/json?lat=${encodeURIComponent(
    lat,
  )}&lng=${encodeURIComponent(lng)}&date=${encodeURIComponent(
    dateISO,
  )}&formatted=0`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const data = (await res.json()) as SunApiResponse;
  if (!data || data.status !== "OK") throw new Error("Bad API response");
  return data.results;
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
   CLOCK CARD
========================================================= */
type LocMode = "device" | "manual";

function SunriseSunsetClockCard() {
  const deviceTz = useMemo(() => safeTimeZone(), []);
  const [timeZone, setTimeZone] = useState<string>(deviceTz);

  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [locMode, setLocMode] = useState<LocMode>("device");
  const [lat, setLat] = useState<number>(40.7128);
  const [lng, setLng] = useState<number>(-74.006);
  const [locStatus, setLocStatus] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [sunToday, setSunToday] = useState<null | {
    sunrise: Date;
    sunset: Date;
    dayLengthSec: number;
  }>(null);

  const [sunTomorrow, setSunTomorrow] = useState<null | {
    sunrise: Date;
    sunset: Date;
    dayLengthSec: number;
  }>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Live tick (uses ms number to avoid extra Date allocations in state)
  useEffect(() => {
    let t: number | null = null;

    const interval = showSeconds ? 1000 : 5000;

    // Align updates close to boundaries for nicer "snap"
    const kick = () => {
      setNowMs(Date.now());
      t = window.setInterval(() => setNowMs(Date.now()), interval);
    };

    const delay = showSeconds ? 1000 - (Date.now() % 1000) : 0;
    const starter = window.setTimeout(() => kick(), delay);

    return () => {
      window.clearTimeout(starter);
      if (t) window.clearInterval(t);
    };
  }, [showSeconds]);

  // Memoized formatters (this fixes the "slow to render" feeling on some devices)
  const timeFmt = useMemo(
    () => makeTimeFormatter({ timeZone, use24, showSeconds }),
    [timeZone, use24, showSeconds],
  );
  const timeFmtNoSec = useMemo(
    () => makeTimeFormatter({ timeZone, use24, showSeconds: false }),
    [timeZone, use24],
  );
  const dateFmt = useMemo(() => makeDateFormatter(timeZone), [timeZone]);

  const nowDate = useMemo(() => new Date(nowMs), [nowMs]);

  const nowText = useMemo(
    () =>
      formatWithFallbackTime({
        date: nowDate,
        fmt: timeFmt,
        use24,
        showSeconds,
      }),
    [nowDate, timeFmt, use24, showSeconds],
  );

  const dateText = useMemo(
    () => formatWithFallbackDate({ date: nowDate, fmt: dateFmt }),
    [nowDate, dateFmt],
  );

  // Device location
  useEffect(() => {
    if (locMode !== "device") return;

    setLocStatus("Requesting location...");
    setErr("");

    if (!navigator.geolocation) {
      setLocStatus("Geolocation not supported. Use manual coordinates.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocStatus("Using device location.");
        const la = pos.coords.latitude;
        const lo = pos.coords.longitude;
        setLat(la);
        setLng(lo);
      },
      () => {
        setLocStatus("Location blocked. Use manual coordinates.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, [locMode]);

  // Fetch sunrise/sunset for today and tomorrow whenever coords change.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        const d0 = new Date();
        const d1 = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [t0, t1] = await Promise.all([
          fetchSunTimes({ lat, lng, dateISO: toISODate(d0) }),
          fetchSunTimes({ lat, lng, dateISO: toISODate(d1) }),
        ]);

        if (cancelled) return;

        setSunToday({
          sunrise: new Date(t0.sunrise),
          sunset: new Date(t0.sunset),
          dayLengthSec: Number(t0.day_length) || 0,
        });

        setSunTomorrow({
          sunrise: new Date(t1.sunrise),
          sunset: new Date(t1.sunset),
          dayLengthSec: Number(t1.day_length) || 0,
        });
      } catch {
        if (cancelled) return;
        setErr(
          "Could not load sunrise/sunset. Check your connection or try manual coordinates.",
        );
        setSunToday(null);
        setSunTomorrow(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const okLat = Number.isFinite(lat) && Math.abs(lat) <= 90;
    const okLng = Number.isFinite(lng) && Math.abs(lng) <= 180;
    if (okLat && okLng) run();
    else {
      setErr("Latitude/longitude look invalid.");
      setSunToday(null);
      setSunTomorrow(null);
    }

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  // Determine next event and progress
  const derived = useMemo(() => {
    if (!sunToday || !sunTomorrow) return null;

    const n = nowMs;

    const sunrise = sunToday.sunrise.getTime();
    const sunset = sunToday.sunset.getTime();
    const nextSunrise = sunTomorrow.sunrise.getTime();

    const isDay = n >= sunrise && n < sunset;

    if (isDay) {
      const total = sunset - sunrise;
      const done = n - sunrise;
      const pct = total > 0 ? clamp(done / total, 0, 1) : 0;

      return {
        isDay: true,
        sunrise: sunToday.sunrise,
        sunset: sunToday.sunset,
        nextLabel: "Sunset" as const,
        nextAt: sunToday.sunset,
        msToNext: Math.max(0, sunset - n),
        progressLabel: "Daylight progress",
        pct,
      };
    }

    if (n < sunrise) {
      // Approx night progress. We do not have yesterday sunset without extra API calls.
      const approxPrevSunset = sunrise - 12 * 60 * 60 * 1000;
      const total = sunrise - approxPrevSunset;
      const done = n - approxPrevSunset;
      const pct = total > 0 ? clamp(done / total, 0, 1) : 0;

      return {
        isDay: false,
        sunrise: sunToday.sunrise,
        sunset: sunToday.sunset,
        nextLabel: "Sunrise" as const,
        nextAt: sunToday.sunrise,
        msToNext: Math.max(0, sunrise - n),
        progressLabel: "Night (approx) until sunrise",
        pct,
      };
    }

    const total = nextSunrise - sunset;
    const done = n - sunset;
    const pct = total > 0 ? clamp(done / total, 0, 1) : 0;

    return {
      isDay: false,
      sunrise: sunToday.sunrise,
      sunset: sunToday.sunset,
      nextLabel: "Sunrise" as const,
      nextAt: sunTomorrow.sunrise,
      msToNext: Math.max(0, nextSunrise - n),
      progressLabel: "Night progress",
      pct,
    };
  }, [sunToday, sunTomorrow, nowMs]);

  const sunriseText = useMemo(() => {
    if (!derived) return "--";
    return formatWithFallbackTime({
      date: derived.sunrise,
      fmt: timeFmtNoSec,
      use24,
      showSeconds: false,
    });
  }, [derived, timeFmtNoSec, use24]);

  const sunsetText = useMemo(() => {
    if (!derived) return "--";
    return formatWithFallbackTime({
      date: derived.sunset,
      fmt: timeFmtNoSec,
      use24,
      showSeconds: false,
    });
  }, [derived, timeFmtNoSec, use24]);

  const nextAtText = useMemo(() => {
    if (!derived) return "--";
    return formatWithFallbackTime({
      date: derived.nextAt,
      fmt: timeFmtNoSec,
      use24,
      showSeconds: false,
    });
  }, [derived, timeFmtNoSec, use24]);

  const shownTime = nowText;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, use24, showSeconds, timeZone],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 80,
  });

  const statusLabel = derived
    ? derived.isDay
      ? "Daytime"
      : "Night"
    : loading
      ? "Loading"
      : "Ready";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "t") {
      setUse24((v) => !v);
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "l") {
      setLocMode((m) => (m === "device" ? "manual" : "device"));
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const progressPct = derived ? Math.round(derived.pct * 100) : 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Sunrise & Sunset Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={() => setShowSeconds((v) => !v)}
              className="py-1 text-sm"
            >
              {showSeconds ? "Seconds: On" : "Seconds: Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setUse24((v) => !v)}
              className="py-1 text-sm"
            >
              {use24 ? "24h" : "12h"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Sunrise & Sunset Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Live sunrise and sunset times, daylight progress, and time until
                the next event.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
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
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 420,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs && cardRef.current) {
              // Tap to toggle seconds in fullscreen (keeps it useful without extra UI)
              setShowSeconds((v) => !v);
            }
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to toggle seconds" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
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
            {shownTime}
          </span>

          {/* Info grid */}
          <div className="mt-4 w-full max-w-5xl">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Date
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {dateText}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {locMode === "device" ? "Device location" : "Manual location"}{" "}
                  · {timeZone || "Local"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Today
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                    Sunrise {sunriseText}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                    Sunset {sunsetText}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                    Lat {lat.toFixed(4)} · Lng {lng.toFixed(4)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {loading ? "Loading sunrise/sunset..." : err ? err : ""}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Next event
                </div>
                <div className="mt-2 text-base font-extrabold text-slate-900">
                  {derived ? derived.nextLabel : loading ? "Loading..." : "—"}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  At {nextAtText}
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold tracking-widest text-slate-900">
                  {derived ? msToClock(derived.msToNext) : "--:--"}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Time until{" "}
                  {derived ? derived.nextLabel.toLowerCase() : "next event"}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{derived ? derived.progressLabel : "Progress"}</span>
                <span>{derived ? `${progressPct}%` : "--%"}</span>
              </div>

              <div className="mt-2 h-4 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${derived ? progressPct : 0}%`,
                    background: derived?.isDay
                      ? "linear-gradient(90deg, rgba(34,197,94,.60), rgba(245,158,11,.60))"
                      : "linear-gradient(90deg, rgba(59,130,246,.55), rgba(147,51,234,.55))",
                  }}
                />
              </div>

              {!isFs && (
                <div className="mt-2 text-xs text-slate-600">
                  Sunrise and sunset are fetched as UTC timestamps and displayed
                  in the time zone you entered.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        {!isFs && (
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-900">
              Time zone (display)
              <input
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="America/New_York"
              />
              <div className="mt-1 text-xs text-slate-600">
                Use your device zone or enter one like Europe/Berlin, UTC,
                Asia/Tokyo.
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Location mode
              <select
                value={locMode}
                onChange={(e) => setLocMode(e.target.value as LocMode)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value="device">Use my device location</option>
                <option value="manual">Manual latitude/longitude</option>
              </select>
              <div className="mt-1 text-xs text-slate-600">
                {locMode === "device"
                  ? locStatus ||
                    "Uses browser geolocation (you may need to allow it)."
                  : "Enter coordinates for any place on Earth."}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-slate-900">
                Latitude
                <input
                  type="number"
                  step="0.0001"
                  min={-90}
                  max={90}
                  value={lat}
                  onChange={(e) =>
                    setLat(clamp(Number(e.target.value || 0), -90, 90))
                  }
                  disabled={locMode === "device"}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                Longitude
                <input
                  type="number"
                  step="0.0001"
                  min={-180}
                  max={180}
                  value={lng}
                  onChange={(e) =>
                    setLng(clamp(Number(e.target.value || 0), -180, 180))
                  }
                  disabled={locMode === "device"}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <div className="lg:col-span-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                />
                Seconds
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={use24}
                  onChange={(e) => setUse24(e.target.checked)}
                />
                24-hour
              </label>

              <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: F fullscreen · T 12/24 · S seconds · L location mode
              </div>
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to toggle seconds · F fullscreen · T 12/24 · S seconds ·
              L location mode
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
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
export default function SunriseSunsetClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/sunrise-sunset-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Sunrise & Sunset Clock",
        url,
        description:
          "Sunrise and sunset clock showing today's sunrise, sunset, daylight progress, and time until the next event. Uses device location or manual coordinates.",
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
            name: "Sunrise & Sunset Clock",
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
      <section className="timer-page-primary mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <SunriseSunsetClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Sunrise & Sunset Clock</span>
        </p>
      </section>
    </main>
  );
}

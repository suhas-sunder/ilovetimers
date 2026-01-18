// app/routes/sunrise-sunset-clock.tsx
import type { Route } from "./+types/sunrise-sunset-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Sunrise & Sunset Clock | Today's Sunrise, Sunset, Daylight (Live + Fullscreen)";
  const description =
    "Free sunrise and sunset clock. Shows today's sunrise, sunset, daylight progress, and time until the next event. Uses your location or manual latitude/longitude. Fullscreen, 12/24-hour, and readable display.";
  const url = "https://ilovetimers.com/sunrise-sunset-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "sunrise and sunset",
        "sunrise sunset clock",
        "sunrise time",
        "sunset time",
        "daylight tracker",
        "time until sunset",
        "time until sunrise",
        "golden hour clock",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function formatTimeInZone(
  date: Date,
  timeZone: string,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const { use24, showSeconds } = opts;
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: showSeconds ? "2-digit" : undefined,
      hour12: !use24,
    });
    return fmt
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    // Fallback: local formatting only
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
}

function formatDateLineInZone(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return date.toDateString();
  }
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
   UI PRIMITIVES (same style as your timers)
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   CLOCK CARD
========================================================= */
type LocMode = "device" | "manual";

function SunriseSunsetClockCard() {
  const deviceTz = useMemo(() => safeTimeZone(), []);
  const [timeZone, setTimeZone] = useState<string>(deviceTz);

  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);

  const [now, setNow] = useState<Date>(() => new Date());

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

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Live tick
  useEffect(() => {
    const t = window.setInterval(
      () => setNow(new Date()),
      showSeconds ? 1000 : 5000,
    );
    return () => window.clearInterval(t);
  }, [showSeconds]);

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
      } catch (e: any) {
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

    // Only fetch when coords are valid-ish
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

  const nowText = useMemo(
    () => formatTimeInZone(now, timeZone, { use24, showSeconds }),
    [now, timeZone, use24, showSeconds],
  );

  const dateText = useMemo(
    () => formatDateLineInZone(now, timeZone),
    [now, timeZone],
  );

  // Determine next event and progress
  const derived = useMemo(() => {
    if (!sunToday || !sunTomorrow) return null;

    const n = now.getTime();
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
        nextLabel: "Sunset",
        nextAt: sunToday.sunset,
        msToNext: Math.max(0, sunset - n),
        progressLabel: "Daylight progress",
        pct,
        totalMs: total,
        doneMs: done,
      };
    }

    // Night: next event is sunrise (today if before sunrise, otherwise tomorrow)
    if (n < sunrise) {
      const prevSunset = sunrise - 12 * 60 * 60 * 1000; // not accurate, but used only for "night bar" fallback
      const total = sunrise - prevSunset;
      const done = n - prevSunset;
      const pct = total > 0 ? clamp(done / total, 0, 1) : 0;

      return {
        isDay: false,
        sunrise: sunToday.sunrise,
        sunset: sunToday.sunset,
        nextLabel: "Sunrise",
        nextAt: sunToday.sunrise,
        msToNext: Math.max(0, sunrise - n),
        progressLabel: "Night (approx) until sunrise",
        pct,
        totalMs: total,
        doneMs: done,
      };
    }

    // After sunset: until tomorrow sunrise
    const total = nextSunrise - sunset;
    const done = n - sunset;
    const pct = total > 0 ? clamp(done / total, 0, 1) : 0;

    return {
      isDay: false,
      sunrise: sunToday.sunrise,
      sunset: sunToday.sunset,
      nextLabel: "Sunrise",
      nextAt: sunTomorrow.sunrise,
      msToNext: Math.max(0, nextSunrise - n),
      progressLabel: "Night progress",
      pct,
      totalMs: total,
      doneMs: done,
    };
  }, [sunToday, sunTomorrow, now]);

  const sunriseText = useMemo(() => {
    if (!derived) return "--";
    return formatTimeInZone(derived.sunrise, timeZone, {
      use24,
      showSeconds: false,
    });
  }, [derived, timeZone, use24]);

  const sunsetText = useMemo(() => {
    if (!derived) return "--";
    return formatTimeInZone(derived.sunset, timeZone, {
      use24,
      showSeconds: false,
    });
  }, [derived, timeZone, use24]);

  const nextAtText = useMemo(() => {
    if (!derived) return "--";
    return formatTimeInZone(derived.nextAt, timeZone, {
      use24,
      showSeconds: false,
    });
  }, [derived, timeZone, use24]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && displayWrapRef.current)
      toggleFullscreen(displayWrapRef.current);
    if (k === "t") setUse24((v) => !v);
    if (k === "s") setShowSeconds((v) => !v);
    if (k === "l") setLocMode((m) => (m === "device" ? "manual" : "device"));
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Sunrise & Sunset Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Live sunrise and sunset times, daylight progress, and time until the
            next event.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24}
              onChange={(e) => setUse24(e.target.checked)}
            />
            24-hour
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <label className="block text-sm font-semibold text-amber-950">
          Time zone (display)
          <input
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="America/New_York"
          />
          <div className="mt-1 text-xs text-amber-800">
            Tip: use your device zone or enter one like Europe/Berlin, UTC,
            Asia/Tokyo.
          </div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Location mode
          <select
            value={locMode}
            onChange={(e) => setLocMode(e.target.value as LocMode)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="device">Use my device location</option>
            <option value="manual">Manual latitude/longitude</option>
          </select>
          <div className="mt-1 text-xs text-amber-800">
            {locMode === "device"
              ? locStatus ||
                "Uses browser geolocation (you may need to allow it)."
              : "Enter coordinates for any place on Earth."}
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-amber-950">
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
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
            />
          </label>
          <label className="block text-sm font-semibold text-amber-950">
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
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
            />
          </label>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 420 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1200px, 100%);
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:16px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(72px, 14vw, 200px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 18px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 420 }}
        >
          <div className="flex w-full max-w-5xl flex-col gap-4">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                {locMode === "device" ? "Device location" : "Manual location"} ·{" "}
                {timeZone}
              </div>
              <div className="text-xs font-semibold text-amber-800">
                Lat {lat.toFixed(4)} · Lng {lng.toFixed(4)}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Current time
                </div>
                <div className="mt-2 font-mono text-5xl font-extrabold tracking-widest text-amber-950 sm:text-6xl">
                  {nowText}
                </div>
                <div className="mt-2 text-sm font-semibold text-amber-900">
                  {dateText}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Next event
                </div>
                <div className="mt-2 text-2xl font-extrabold text-amber-950">
                  {derived ? derived.nextLabel : "Loading..."}
                </div>
                <div className="mt-1 text-sm font-semibold text-amber-900">
                  At {nextAtText}
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold tracking-widest text-amber-950">
                  {derived ? msToClock(derived.msToNext) : "--:--"}
                </div>
                <div className="mt-1 text-xs text-amber-800">
                  Time until{" "}
                  {derived ? derived.nextLabel.toLowerCase() : "next"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    Today
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-900">
                      Sunrise {sunriseText}
                    </span>
                    <span className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-900">
                      Sunset {sunsetText}
                    </span>
                    <span className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-900">
                      {derived
                        ? derived.isDay
                          ? "Daytime"
                          : "Night"
                        : "Loading"}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-amber-800">
                  {loading ? "Loading sunrise/sunset..." : err ? err : ""}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>{derived ? derived.progressLabel : "Progress"}</span>
                  <span>
                    {derived ? `${Math.round(derived.pct * 100)}%` : "--%"}
                  </span>
                </div>

                <div className="mt-2 h-4 w-full overflow-hidden rounded-full border border-amber-200 bg-amber-50">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${derived ? Math.round(derived.pct * 100) : 0}%`,
                      background: derived?.isDay
                        ? "linear-gradient(90deg, rgba(34,197,94,.65), rgba(245,158,11,.65))"
                        : "linear-gradient(90deg, rgba(59,130,246,.55), rgba(147,51,234,.55))",
                    }}
                  />
                </div>

                <div className="mt-2 text-xs text-amber-800">
                  Note: sunrise and sunset are fetched in UTC and then displayed
                  in the time zone you entered. For best accuracy, use a time
                  zone that matches your chosen location.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
              Shortcuts: F fullscreen · T 12/24 · S seconds · L toggle location
              mode
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Sunrise & Sunset Clock</div>
            <div className="fs-time">{nowText}</div>
            <div className="fs-sub">
              {timeZone} · Lat {lat.toFixed(4)} · Lng {lng.toFixed(4)}
            </div>

            <div className="w-full" style={{ maxWidth: 980 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,.18)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      opacity: 0.85,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    Sunrise
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                      fontWeight: 900,
                      fontSize: 40,
                      letterSpacing: ".08em",
                    }}
                  >
                    {sunriseText}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,.18)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      opacity: 0.85,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    Sunset
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                      fontWeight: 900,
                      fontSize: 40,
                      letterSpacing: ".08em",
                    }}
                  >
                    {sunsetText}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,.18)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      opacity: 0.85,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    Next {derived ? derived.nextLabel : "Event"}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                      fontWeight: 900,
                      fontSize: 40,
                      letterSpacing: ".08em",
                    }}
                  >
                    {derived ? msToClock(derived.msToNext) : "--:--"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  opacity: 0.86,
                  textAlign: "center",
                  fontWeight: 800,
                }}
              >
                {derived ? derived.progressLabel : "Progress"} ·{" "}
                {derived ? `${Math.round(derived.pct * 100)}%` : "--%"}
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 14,
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.18)",
                  background: "rgba(255,255,255,.06)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${derived ? Math.round(derived.pct * 100) : 0}%`,
                    background: derived?.isDay
                      ? "linear-gradient(90deg, rgba(34,197,94,.72), rgba(245,158,11,.72))"
                      : "linear-gradient(90deg, rgba(59,130,246,.72), rgba(147,51,234,.72))",
                  }}
                />
              </div>
            </div>

            <div className="fs-help">
              F fullscreen · T 12/24 · S seconds · L toggle location mode
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function SunriseSunsetClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/sunrise-sunset-clock";

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
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Sunrise & Sunset Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does this show sunrise and sunset for my location?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. If you allow location access, it uses your device coordinates. You can also enter latitude and longitude manually.",
            },
          },
          {
            "@type": "Question",
            name: "Can I check sunrise and sunset for another city?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Switch to manual mode and enter the coordinates for that place. You can also change the display time zone.",
            },
          },
          {
            "@type": "Question",
            name: "Why are sunrise and sunset times shown in a specific time zone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sunrise and sunset are fetched as UTC timestamps and then displayed using the time zone you choose. For best results, pick a time zone that matches your chosen location.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show a large, readable display.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Sunrise & Sunset Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Sunrise & Sunset Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>sunrise and sunset</strong> display with daylight
            progress and a countdown to the next event.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <SunriseSunsetClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Time until sunset
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              See how much daylight is left and how far you are into the day or
              night.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Any location</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use your device location, or enter latitude and longitude for any
              city.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>T</strong> = 12/24 toggle
              </li>
              <li>
                <strong>S</strong> = Seconds toggle
              </li>
              <li>
                <strong>L</strong> = Location mode toggle
              </li>
            </ul>
          </div>
        </div>
      </section>


      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free sunrise and sunset clock
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page shows <strong>today’s sunrise</strong> and{" "}
              <strong>sunset</strong> times for your location, plus a live
              countdown to the next event. If you allow location access, it uses
              your device coordinates. You can also enter latitude and longitude
              manually.
            </p>

            <p>
              Want other clocks? Try{" "}
              <Link
                to="/digital-clock"
                className="font-semibold hover:underline"
              >
                Digital Clock
              </Link>{" "}
              or{" "}
              <Link to="/utc-clock" className="font-semibold hover:underline">
                UTC Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Sunrise & Sunset Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I check sunrise and sunset for another city?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Switch to manual coordinates and enter the city’s latitude and
              longitude. You can also set the display time zone.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why might the time zone not match the location?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Sunrise and sunset are fetched as UTC timestamps and then
              displayed using the time zone you type in. For best accuracy, use
              a time zone that matches the chosen location.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

// app/routes/golden-hour-clock.tsx
import type { Route } from "./+types/golden-hour-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Golden Hour Times | Sunrise, Sunset, and Golden Hour Near You";
  const description =
    "Free golden hour clock showing today’s golden hour times for your location. View sunrise and sunset, golden hour start and end, and a live countdown in a clean fullscreen display.";
  const url = "https://ilovetimers.com/golden-hour-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "golden hour times",
        "golden hour clock",
        "golden hour time",
        "golden hour calculator",
        "golden hour near me",
        "photography golden hour",
        "sunrise sunset times",
        "golden hour sunrise sunset",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },

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

const pad2 = (n: number) => n.toString().padStart(2, "0");

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

function formatLocalTime(d: Date | null) {
  if (!d || Number.isNaN(d.getTime())) return "–";
  // Use user locale, no seconds for readability
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatLocalDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function toISODateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

// WebAudio beep (same style as other pages)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.1;

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      window.setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, duration);
    } catch {
      // ignore
    }
  }, []);
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/* =========================================================
   SOLAR CALCS (no dependencies)
   Based on common NOAA/SunCalc-style formulas.
   All times returned as Date objects in local time.
========================================================= */
const rad = Math.PI / 180;
const dayMs = 86_400_000;

function toJulian(date: Date) {
  return date.getTime() / dayMs - 0.5 + 2440588;
}
function fromJulian(j: number) {
  return new Date((j + 0.5 - 2440588) * dayMs);
}
function toDays(date: Date) {
  return toJulian(date) - 2451545;
}
function rightAscension(l: number, b: number) {
  const e = rad * 23.4397;
  return Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l),
  );
}
function declination(l: number, b: number) {
  const e = rad * 23.4397;
  return Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l),
  );
}
function solarMeanAnomaly(d: number) {
  return rad * (357.5291 + 0.98560028 * d);
}
function eclipticLongitude(M: number) {
  const C =
    rad *
    (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372;
  return M + C + P + Math.PI;
}
function siderealTime(d: number, lw: number) {
  return rad * (280.16 + 360.9856235 * d) - lw;
}
function azimuth(H: number, phi: number, dec: number) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi),
  );
}
function altitude(H: number, phi: number, dec: number) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
}
function astroRefraction(h: number) {
  if (h < 0) h = 0;
  // Meeus 16.4, result in radians
  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}
function hourAngle(h: number, phi: number, d: number) {
  return Math.acos(
    (Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)),
  );
}
function approxTransit(Ht: number, lw: number, n: number) {
  return (Ht + lw) / (2 * Math.PI) + n;
}
function solarTransitJ(ds: number, M: number, L: number) {
  return 2451545 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}
function getSetJ(
  h: number,
  lw: number,
  phi: number,
  dec: number,
  n: number,
  M: number,
  L: number,
) {
  const w = hourAngle(h, phi, dec);
  const a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}

type SolarTimes = {
  solarNoon: Date | null;
  sunrise: Date | null;
  sunset: Date | null;
  goldenMorningStart: Date | null;
  goldenMorningEnd: Date | null;
  goldenEveningStart: Date | null;
  goldenEveningEnd: Date | null;
  // For display help
  note?: string;
};

type GoldenMethod = "classic_60min" | "solar_0_to_6deg";

function getSolarTimes(
  dateLocal: Date,
  lat: number,
  lon: number,
  method: GoldenMethod,
): SolarTimes {
  // Use date at local noon to avoid edge cases around midnight
  const dNoon = new Date(dateLocal);
  dNoon.setHours(12, 0, 0, 0);

  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(dNoon);

  const n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
  const ds = 0.0009 + (0 + lw) / (2 * Math.PI) + n;
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);

  const Jnoon = solarTransitJ(ds, M, L);

  // Sunrise/sunset: use -0.833 deg (atmospheric refraction + solar radius)
  const h0 = rad * -0.833;
  const Jrise = getSetJ(h0, lw, phi, dec, n, M, L);
  const Jset = Jnoon * 2 - Jrise;

  const solarNoon = fromJulian(Jnoon);
  const sunrise = fromJulian(Jrise);
  const sunset = fromJulian(Jset);

  // Polar day/night: hourAngle becomes NaN
  if (
    Number.isNaN(sunrise.getTime()) ||
    Number.isNaN(sunset.getTime()) ||
    !Number.isFinite(Jrise) ||
    !Number.isFinite(Jset)
  ) {
    return {
      solarNoon: Number.isNaN(solarNoon.getTime()) ? null : solarNoon,
      sunrise: null,
      sunset: null,
      goldenMorningStart: null,
      goldenMorningEnd: null,
      goldenEveningStart: null,
      goldenEveningEnd: null,
      note: "No sunrise or sunset for this date and location (polar day or polar night). Try a different date or location.",
    };
  }

  let goldenMorningStart: Date | null = null;
  let goldenMorningEnd: Date | null = null;
  let goldenEveningStart: Date | null = null;
  let goldenEveningEnd: Date | null = null;

  if (method === "classic_60min") {
    goldenMorningStart = new Date(sunrise);
    goldenMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);

    goldenEveningEnd = new Date(sunset);
    goldenEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);
  } else {
    // "Solar" golden hour: from sunrise to when sun reaches +6 degrees (morning),
    // and from when sun is at +6 degrees down to sunset (evening).
    const h6 = rad * 6;

    // We need rise/set for altitude +6deg. These calculations assume a "set" exists.
    const Jrise6 = getSetJ(h6, lw, phi, dec, n, M, L);
    const Jset6 = Jnoon * 2 - Jrise6;

    const tRise6 = fromJulian(Jrise6);
    const tSet6 = fromJulian(Jset6);

    if (
      Number.isFinite(Jrise6) &&
      Number.isFinite(Jset6) &&
      !Number.isNaN(tRise6.getTime()) &&
      !Number.isNaN(tSet6.getTime())
    ) {
      goldenMorningStart = new Date(sunrise);
      goldenMorningEnd = tRise6;

      goldenEveningStart = tSet6;
      goldenEveningEnd = new Date(sunset);

      // If +6deg times are weird for high latitudes, fall back safely
      if (
        goldenMorningEnd.getTime() <= goldenMorningStart.getTime() ||
        goldenEveningEnd.getTime() <= goldenEveningStart.getTime()
      ) {
        goldenMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);
        goldenEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);
        return {
          solarNoon,
          sunrise,
          sunset,
          goldenMorningStart,
          goldenMorningEnd,
          goldenEveningStart,
          goldenEveningEnd: sunset,
          note: "Using a safe fallback because the solar-angle golden hour is unusual at this latitude and date.",
        };
      }
    } else {
      // fallback if hourAngle fails
      goldenMorningStart = new Date(sunrise);
      goldenMorningEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);
      goldenEveningEnd = new Date(sunset);
      goldenEveningStart = new Date(sunset.getTime() - 60 * 60 * 1000);
      return {
        solarNoon,
        sunrise,
        sunset,
        goldenMorningStart,
        goldenMorningEnd,
        goldenEveningStart,
        goldenEveningEnd,
        note: "Using a safe fallback because solar-angle golden hour is not available for this date and location.",
      };
    }
  }

  return {
    solarNoon,
    sunrise,
    sunset,
    goldenMorningStart,
    goldenMorningEnd,
    goldenEveningStart,
    goldenEveningEnd,
  };
}

/* =========================================================
   UI PRIMITIVES (same style as other pages)
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
   GOLDEN HOUR CLOCK CARD
========================================================= */
function GoldenHourClockCard() {
  const beep = useBeep();

  const [lat, setLat] = useState<number>(40.7128);
  const [lon, setLon] = useState<number>(-74.006);

  const [method, setMethod] = useState<GoldenMethod>("classic_60min");

  const [dateStr, setDateStr] = useState(() => toISODateInputValue(new Date()));
  const dateLocal = useMemo(() => {
    // Date input returns YYYY-MM-DD. Interpret as local date.
    const [y, m, d] = dateStr.split("-").map((x) => Number(x));
    const dt = new Date();
    dt.setFullYear(y || dt.getFullYear(), (m || 1) - 1, d || dt.getDate());
    dt.setHours(12, 0, 0, 0);
    return dt;
  }, [dateStr]);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [now, setNow] = useState(() => new Date());

  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(t);
  }, []);

  const times = useMemo(() => {
    const latClamped = clamp(lat, -90, 90);
    const lonClamped = clamp(lon, -180, 180);
    return getSolarTimes(dateLocal, latClamped, lonClamped, method);
  }, [dateLocal, lat, lon, method]);

  const inGolden = useMemo(() => {
    const t = now.getTime();
    const a1 = times.goldenMorningStart?.getTime() ?? null;
    const b1 = times.goldenMorningEnd?.getTime() ?? null;
    const a2 = times.goldenEveningStart?.getTime() ?? null;
    const b2 = times.goldenEveningEnd?.getTime() ?? null;

    const inMorning = a1 != null && b1 != null && t >= a1 && t <= b1;
    const inEvening = a2 != null && b2 != null && t >= a2 && t <= b2;
    return inMorning || inEvening;
  }, [now, times]);

  const nextEvent = useMemo(() => {
    const t = now.getTime();
    const events: Array<{ label: string; at: Date | null }> = [
      { label: "Morning golden hour starts", at: times.goldenMorningStart },
      { label: "Morning golden hour ends", at: times.goldenMorningEnd },
      { label: "Evening golden hour starts", at: times.goldenEveningStart },
      { label: "Evening golden hour ends", at: times.goldenEveningEnd },
      { label: "Sunrise", at: times.sunrise },
      { label: "Sunset", at: times.sunset },
    ].filter((e) => e.at && !Number.isNaN(e.at.getTime()));

    const future = events
      .map((e) => ({ ...e, ms: (e.at as Date).getTime() - t }))
      .filter((e) => e.ms >= 0)
      .sort((a, b) => a.ms - b.ms)[0];

    return future
      ? { label: future.label, at: future.at as Date, ms: future.ms }
      : null;
  }, [now, times]);

  // Final beeps in last 5 seconds of countdown to a key event (start or end of golden hour)
  useEffect(() => {
    if (!sound || !finalBeeps) return;

    const t = now.getTime();
    const targets: Date[] = [];
    if (times.goldenMorningStart) targets.push(times.goldenMorningStart);
    if (times.goldenMorningEnd) targets.push(times.goldenMorningEnd);
    if (times.goldenEveningStart) targets.push(times.goldenEveningStart);
    if (times.goldenEveningEnd) targets.push(times.goldenEveningEnd);

    const upcoming = targets
      .map((d) => d.getTime() - t)
      .filter((ms) => ms >= 0)
      .sort((a, b) => a - b)[0];

    if (upcoming == null) return;

    if (upcoming > 0 && upcoming <= 5_000) {
      const secLeft = Math.ceil(upcoming / 1000);
      if (lastBeepSecondRef.current !== secLeft) {
        lastBeepSecondRef.current = secLeft;
        beep(880, 110);
      }
    } else {
      lastBeepSecondRef.current = null;
    }

    if (upcoming === 0) {
      beep(660, 220);
      lastBeepSecondRef.current = null;
    }
  }, [now, times, sound, finalBeeps, beep]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (e.key.toLowerCase() === "g") {
      // GPS on keyboard
      getGPS();
    }
  };

  const getGPS = useCallback(() => {
    // prime audio on gesture
    if (sound) beep(0, 1);

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLon(Number(pos.coords.longitude.toFixed(6)));
      },
      () => {
        // ignore errors, user may block permission
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [beep, sound]);

  const headline = inGolden
    ? "Golden hour is happening now"
    : "Next golden-hour change";
  const countdown = nextEvent ? msToClock(nextEvent.ms) : "–";

  // Primary display time: show countdown to next event
  const urgent = nextEvent ? nextEvent.ms <= 10_000 : false;

  const methodLabel =
    method === "classic_60min"
      ? "Classic (first and last 60 minutes)"
      : "Solar-angle (sun between horizon and 6°)";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Golden Hour Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Find today’s <strong>golden hour times</strong> for any location.
            Choose a date, set latitude and longitude (or use GPS), and get{" "}
            <strong>sunrise</strong>, <strong>sunset</strong>, and golden hour{" "}
            <strong>start</strong> and <strong>end</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={finalBeeps}
              onChange={(e) => setFinalBeeps(e.target.checked)}
              disabled={!sound}
            />
            Final beeps
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
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-amber-950">
          Date
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">
            {formatLocalDate(dateLocal)}
          </div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Latitude
          <input
            type="number"
            inputMode="decimal"
            step="0.000001"
            min={-90}
            max={90}
            value={lat}
            onChange={(e) =>
              setLat(clamp(Number(e.target.value || 0), -90, 90))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">Range: -90 to 90</div>
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Longitude
          <input
            type="number"
            inputMode="decimal"
            step="0.000001"
            min={-180}
            max={180}
            value={lon}
            onChange={(e) =>
              setLon(clamp(Number(e.target.value || 0), -180, 180))
            }
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="mt-1 text-xs text-slate-600">Range: -180 to 180</div>
        </label>

        <div className="flex flex-col gap-3">
          <label className="block text-sm font-semibold text-amber-950">
            Definition
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as GoldenMethod)}
              className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="classic_60min">Classic: 60 minutes</option>
              <option value="solar_0_to_6deg">Solar-angle: 0° to 6°</option>
            </select>
            <div className="mt-1 text-xs text-slate-600">{methodLabel}</div>
          </label>

          <div className="flex gap-3">
            <Btn kind="solid" onClick={getGPS}>
              Use GPS
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => {
                const d = new Date();
                setDateStr(toISODateInputValue(d));
              }}
            >
              Today
            </Btn>
          </div>

          <div className="text-xs text-slate-600">
            Shortcuts: <strong>F</strong> fullscreen · <strong>G</strong> GPS
          </div>
        </div>
      </div>

      {/* Note */}
      {times.note ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Note
          </div>
          <div className="mt-1 text-sm font-semibold text-amber-950">
            {times.note}
          </div>
        </div>
      ) : null}

      {/* Results */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Golden hour times (local)
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Morning golden hour
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>Start:</strong>{" "}
                {formatLocalTime(times.goldenMorningStart)}
              </div>
              <div className="mt-1 text-sm text-amber-900">
                <strong>End:</strong> {formatLocalTime(times.goldenMorningEnd)}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Evening golden hour
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>Start:</strong>{" "}
                {formatLocalTime(times.goldenEveningStart)}
              </div>
              <div className="mt-1 text-sm text-amber-900">
                <strong>End:</strong> {formatLocalTime(times.goldenEveningEnd)}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Sunrise and sunset
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>Sunrise:</strong> {formatLocalTime(times.sunrise)}
              </div>
              <div className="mt-1 text-sm text-amber-900">
                <strong>Sunset:</strong> {formatLocalTime(times.sunset)}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Solar noon
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>Solar noon:</strong> {formatLocalTime(times.solarNoon)}
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Solar noon is when the sun is highest in the sky.
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-600">
            Tip: if you are traveling, set the location first, then pick the
            date. Times shown are based on your device’s local time zone.
          </div>
        </div>

        {/* Live clock + countdown */}
        <div
          ref={displayWrapRef}
          data-fs-container
          className={`overflow-hidden rounded-2xl border-2 ${
            urgent
              ? "border-rose-300 bg-rose-50 text-rose-950"
              : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
          style={{ minHeight: 280 }}
          aria-live="polite"
        >
          {/* Fullscreen CSS */}
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
                  width:min(1400px, 100%);
                  display:flex;
                  flex-direction:column;
                  align-items:center;
                  justify-content:center;
                  gap:18px;
                }

                [data-fs-container]:fullscreen .fs-label{
                  font: 800 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                  letter-spacing:.12em;
                  text-transform:uppercase;
                  opacity:.9;
                  text-align:center;
                }

                [data-fs-container]:fullscreen .fs-time{
                  font: 900 clamp(72px, 12vw, 180px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                  letter-spacing:.08em;
                  text-align:center;
                }

                [data-fs-container]:fullscreen .fs-sub{
                  font: 800 clamp(14px, 2.2vw, 22px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
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
            className="h-full w-full flex-col items-center justify-center p-6"
            style={{ minHeight: 280 }}
          >
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Live golden hour clock
            </div>

            <div className="mt-2 text-sm font-semibold text-amber-950">
              {headline}
            </div>

            <div className="mt-5 font-mono text-6xl font-extrabold tracking-widest sm:text-6xl">
              {countdown}
            </div>

            <div className="mt-3 text-sm text-amber-900">
              {nextEvent ? (
                <>
                  <strong>{nextEvent.label}:</strong>{" "}
                  {formatLocalTime(nextEvent.at)}
                </>
              ) : (
                <>No upcoming events for this date and location.</>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-950">
              Now:{" "}
              <span className="font-mono">
                {new Intl.DateTimeFormat(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(now)}
              </span>
              <span className="mx-2 text-amber-300">•</span>
              Shortcut: <strong>F</strong> fullscreen
            </div>
          </div>

          {/* Fullscreen shell */}
          <div data-shell="fullscreen">
            <div className="fs-inner">
              <div className="fs-label">Golden Hour Clock</div>
              <div className="fs-time">{countdown}</div>
              <div className="fs-sub">
                {nextEvent
                  ? `${nextEvent.label} at ${formatLocalTime(nextEvent.at)}`
                  : "No upcoming events"}
              </div>
              <div className="fs-help">F fullscreen · G GPS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini explanation */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            What is golden hour?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Golden hour is the warm, soft light shortly after sunrise and
            shortly before sunset. Shadows are longer and highlights are
            gentler, which is why it is popular for portraits, landscapes, and
            video.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            Which definition should I use?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            <strong>Classic</strong> is simple: the first and last 60 minutes.
            <strong> Solar-angle</strong> uses the sun’s altitude (0° to 6°) so
            it can be shorter or longer depending on season and latitude.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
            Best results fast
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-800">
            <li>Use a longer lens for portraits to keep backgrounds soft.</li>
            <li>Slightly underexpose to protect highlights.</li>
            <li>Arrive 10 to 15 minutes early to set up.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function GoldenHourClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/golden-hour-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Golden Hour Clock",
        url,
        description:
          "A free Golden Hour Clock that shows golden hour times, sunrise, and sunset for your chosen date and location, with a live countdown and fullscreen view.",
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
            name: "Golden Hour Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What time is golden hour today?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Golden hour depends on your location and date. Use the Golden Hour Clock to set your latitude and longitude (or use GPS), then it shows the morning and evening golden hour times along with sunrise and sunset.",
            },
          },
          {
            "@type": "Question",
            name: "Is golden hour always exactly one hour?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Not always. A common rule is the first and last 60 minutes of sunlight, but the sun’s angle changes with season and latitude. The solar-angle option estimates golden hour from the horizon up to 6 degrees of sun altitude.",
            },
          },
          {
            "@type": "Question",
            name: "Do these golden hour times use my time zone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Times are shown in your device’s local time zone. If you are planning for another time zone, switch your device time zone or interpret the results carefully.",
            },
          },
          {
            "@type": "Question",
            name: "Why do I see no sunrise or sunset?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Near the poles, some dates have polar day or polar night, meaning the sun may not rise or set. Try a different date or a different location.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Press F to toggle fullscreen and G to use GPS (when the card is focused).",
            },
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Golden Hour Clock",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            / <span className="text-amber-950">Golden Hour Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Golden Hour Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>golden hour clock</strong> that shows golden hour
            times for your location, plus sunrise and sunset, with a countdown
            to the next change.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <GoldenHourClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Golden hour times for any location
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Enter coordinates directly or tap <strong>Use GPS</strong>.
              Perfect for photographers planning shoots, travel, or outdoor
              sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Classic vs solar-angle definition
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Classic uses a simple rule of thumb (60 minutes). Solar-angle uses
              sun altitude to better match “low sun” light when seasons change.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen countdown
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use fullscreen for a clean on-set display. Press{" "}
              <strong>F</strong> while the card is focused.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Golden hour clock: sunrise, sunset, and golden hour times
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page is a <strong>golden hour clock</strong> that calculates{" "}
              <strong>golden hour times</strong> for your chosen date and
              location. Golden hour is the short window after sunrise and before
              sunset when sunlight is warmer and softer. It is commonly used for
              portraits, landscapes, and cinematic video.
            </p>

            <p>
              The exact timing changes daily and varies by latitude. In summer,
              golden hour can feel longer in some places. In winter, it can be
              shorter. Near the poles, there are dates with no sunrise or sunset
              at all.
            </p>

            <p>
              If you want a general-purpose tool, use{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>
              . For cooking, try{" "}
              <Link to="/egg-timer" className="font-semibold hover:underline">
                Egg Timer
              </Link>
              .
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Portrait tip
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  Put the sun slightly behind your subject for rim light, then
                  expose for the face.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Landscape tip
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  Use side light to reveal texture in rocks, trees, and terrain.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Planning tip
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  Check golden hour times the day before, then set a reminder 30
                  minutes earlier to travel and set up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Golden Hour Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What time is golden hour today?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Golden hour depends on your <strong>location</strong> and{" "}
              <strong>date</strong>. Set your latitude and longitude (or tap{" "}
              <strong>Use GPS</strong>) and the clock shows morning and evening
              golden hour times plus sunrise and sunset.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is golden hour always exactly one hour?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Not always. The classic rule is the first and last 60 minutes of
              sunlight. A more “solar” definition estimates golden hour when the
              sun is low, from the horizon up to about <strong>6°</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why do golden hour times change so much across seasons?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              The sun’s path changes through the year. At higher latitudes the
              sun can rise and set at a shallow angle, which can stretch or
              shrink the low-sun period depending on the season.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why do I see no sunrise or sunset?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Near the poles, some dates have <strong>polar day</strong> or{" "}
              <strong>polar night</strong>, meaning the sun may not rise or set.
              Try a different date or move the location south or north.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>F</strong> toggles fullscreen. <strong>G</strong> requests
              GPS (when the card is focused).
            </div>
          </details>
        </div>
      </section>

      {/* Tiny footer hint (optional) */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-xs text-slate-600">Build: {nowISO}</div>
      </section>
      <GoldenHourFaqSection />
    </main>
  );
}

/* =========================================================
   FAQ (VISIBLE) + JSON-LD
========================================================= */

const GOLDEN_HOUR_FAQ = [
  {
    q: "What time is golden hour today?",
    a: "Golden hour depends on your location and date. Set your latitude and longitude (or tap Use GPS) and the clock shows morning and evening golden hour times plus sunrise and sunset.",
  },
  {
    q: "Is golden hour always exactly one hour?",
    a: "Not always. The classic rule is the first and last 60 minutes of sunlight. The solar-angle option estimates golden hour when the sun is low, from the horizon up to about 6° of sun altitude, so it can be shorter or longer.",
  },
  {
    q: "Do these golden hour times use my time zone?",
    a: "Yes. Results are displayed in your device’s local time zone. If you’re planning for another time zone, switch your device time zone or interpret the output for that destination time zone.",
  },
  {
    q: "Why do golden hour times change so much across seasons?",
    a: "The sun’s path changes through the year. At higher latitudes the sun can rise and set at a shallow angle, which can stretch or shrink the low-sun period depending on season and location.",
  },
  {
    q: "Why do I see no sunrise or sunset?",
    a: "Near the poles, some dates have polar day or polar night, meaning the sun may not rise or set. Try a different date or choose a location farther from the poles.",
  },
  {
    q: "What are the keyboard shortcuts?",
    a: "Press F to toggle fullscreen and G to request GPS (when the card is focused).",
  },
] as const;

function GoldenHourFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GOLDEN_HOUR_FAQ.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-2xl font-bold text-amber-950">
        Golden Hour Clock FAQ
      </h2>

      <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
        {GOLDEN_HOUR_FAQ.map((it, i) => (
          <details key={i}>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              {it.q}
            </summary>
            <div className="px-5 pb-4 text-amber-800 leading-relaxed">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

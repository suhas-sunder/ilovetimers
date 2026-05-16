// app/routes/astronomical-clock.tsx
import type { Route } from "./+types/astronomical-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/astronomical-clock/Disclaimer";
import FAQ from "~/clients/components/astronomical-clock/FAQ";
import HowItWorks from "~/clients/components/astronomical-clock/HowItWorks";
import KeyboardShortcuts from "~/clients/components/astronomical-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/astronomical-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Astronomical Clock (Live Sun, Moon, Day & Night)";
  const description =
    "Live astronomical clock showing the sun and moon, daylight vs night, sunrise and sunset, and local time. Clean fullscreen display that updates in real time.";

  const url = "https://www.ilovetimers.com/astronomical-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "astronomical clock",
        "astronomical clock online",
        "sun and moon clock",
        "day and night clock",
        "sunrise sunset clock",
        "astronomy clock",
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
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

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

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}
function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

/**
 * Get timezone offset minutes for a given instant in a given IANA timeZone.
 * Returns minutes like Date.getTimezoneOffset(): minutes behind UTC (positive in the Americas).
 */
function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  const y = get("year");
  const m = get("month");
  const d = get("day");
  const hh = get("hour");
  const mm = get("minute");
  const ss = get("second");

  // Interpret the "local in timeZone" components as if they were UTC
  const asUTC = Date.UTC(y, m - 1, d, hh, mm, ss);
  return (date.getTime() - asUTC) / 60000;
}

function getZonedParts(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
  });

  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function fmtTimeInTZ(d: Date | null, timeZone: string) {
  if (!d) return "—";
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function fmtDateLongInTZ(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);
}

/**
 * Sunrise/Sunset using a compact NOAA-style approximation.
 * dateYMD should be the "local date" for the selected timezone.
 * tzOffsetMin should be offset minutes for that timezone at that date.
 */
function computeSunriseSunsetForLocalDate(
  year: number,
  monthIndex0: number,
  day: number,
  lat: number,
  lon: number,
  tzOffsetMin: number,
): { sunrise: Date | null; sunset: Date | null } {
  const zenith = 90.833; // degrees
  const n = Math.floor(
    (Date.UTC(year, monthIndex0, day) - Date.UTC(year, 0, 0)) / 86400000,
  ); // 1..366
  const lngHour = lon / 15;

  const calc = (isSunrise: boolean) => {
    const t = n + ((isSunrise ? 6 : 18) - lngHour) / 24;

    const M = 0.9856 * t - 3.289;

    let L =
      M +
      1.916 * Math.sin(degToRad(M)) +
      0.02 * Math.sin(degToRad(2 * M)) +
      282.634;
    L = (L + 360) % 360;

    let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
    RA = (RA + 360) % 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(degToRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH =
      (Math.cos(degToRad(zenith)) - sinDec * Math.sin(degToRad(lat))) /
      (cosDec * Math.cos(degToRad(lat)));

    if (cosH > 1) return null;
    if (cosH < -1) return null;

    let H = isSunrise
      ? 360 - radToDeg(Math.acos(cosH))
      : radToDeg(Math.acos(cosH));
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;

    let UT = T - lngHour;
    UT = (UT + 24) % 24;

    const utcMillis =
      Date.UTC(year, monthIndex0, day, 0, 0, 0, 0) + UT * 3600000;

    // Convert UTC to "local time in target timezone" by applying that timezone offset
    // This yields a Date instance we later format using timeZone for display.
    const localMillis = utcMillis - tzOffsetMin * 60000;
    return new Date(localMillis);
  };

  const sunrise = calc(true);
  const sunset = calc(false);
  if (!sunrise || !sunset) return { sunrise: null, sunset: null };
  return { sunrise, sunset };
}

/**
 * Solar altitude (rough) for day/night and twilight labels.
 */
function computeSolarAltitudeDeg(now: Date, lat: number, lon: number) {
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const y = utc.getUTCFullYear();
  const m = utc.getUTCMonth();
  const d = utc.getUTCDate();
  const hr = utc.getUTCHours();
  const min = utc.getUTCMinutes();
  const sec = utc.getUTCSeconds();

  const n = Math.floor((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 86400000);
  const t = hr + min / 60 + sec / 3600;

  const decl = 23.44 * Math.sin(degToRad((360 / 365) * (n - 81)));

  const B = degToRad((360 / 365) * (n - 81));
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const lst = t + lon / 15 + eot / 60;
  const H = 15 * (lst - 12);

  const latR = degToRad(lat);
  const decR = degToRad(decl);
  const HR = degToRad(H);

  const sinAlt =
    Math.sin(latR) * Math.sin(decR) +
    Math.cos(latR) * Math.cos(decR) * Math.cos(HR);

  return radToDeg(Math.asin(clamp(sinAlt, -1, 1)));
}

/**
 * Moon phase fraction [0..1):
 * 0 new, 0.5 full
 */
function computeMoonPhaseFraction(date: Date) {
  const synodicDays = 29.530588853;
  const epoch = Date.UTC(2000, 0, 6, 18, 14, 0, 0);
  const days = (date.getTime() - epoch) / 86400000;
  const phase = ((days % synodicDays) + synodicDays) % synodicDays;
  return phase / synodicDays;
}

function moonPhaseLabel(phase: number) {
  if (phase < 0.03 || phase >= 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
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

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
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

function SunDot() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.20)]"
    />
  );
}

function MoonDot({ phase }: { phase: number }) {
  const illum = Math.abs(0.5 - phase) * 2;
  const offset = Math.round((phase <= 0.5 ? 1 : -1) * illum * 6);

  return (
    <span className="relative inline-block h-3 w-3 rounded-full bg-slate-200">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-slate-900"
        style={{
          transform: `translateX(${offset}px)`,
          opacity: 0.85,
          mixBlendMode: "multiply",
        }}
      />
    </span>
  );
}

/* =========================================================
   ASTRONOMICAL CLOCK CARD
========================================================= */
function AstronomicalClockCard() {
  const [now, setNow] = useState(() => new Date());

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const deviceTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const [timeZone, setTimeZone] = useState<string>(deviceTimeZone);

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locStatus, setLocStatus] = useState<
    "idle" | "requesting" | "ready" | "blocked" | "error"
  >("idle");

  const presets = useMemo(
    () => [
      { name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
      { name: "Toronto", lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
      { name: "London", lat: 51.5072, lon: -0.1276, tz: "Europe/London" },
      {
        name: "Los Angeles",
        lat: 34.0522,
        lon: -118.2437,
        tz: "America/Los_Angeles",
      },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
      { name: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
    ],
    [],
  );

  const timeZoneOptions = useMemo(() => {
    const base = [
      { label: `Device (${deviceTimeZone})`, value: deviceTimeZone },
      { label: "UTC", value: "UTC" },
      ...presets.map((p) => ({ label: `${p.name} (${p.tz})`, value: p.tz })),
    ];
    // Deduplicate
    const seen = new Set<string>();
    return base.filter((x) => {
      if (seen.has(x.value)) return false;
      seen.add(x.value);
      return true;
    });
  }, [deviceTimeZone, presets]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("astroClockPrefs");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        lat?: number;
        lon?: number;
        tz?: string;
      } | null;
      if (!parsed) return;

      if (typeof parsed.lat === "number" && typeof parsed.lon === "number") {
        setLat(clamp(parsed.lat, -90, 90));
        setLon(clamp(parsed.lon, -180, 180));
        setLocStatus("ready");
      }
      if (typeof parsed.tz === "string" && parsed.tz.trim()) {
        setTimeZone(parsed.tz);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistPrefs = useCallback(
    (next: { lat: number | null; lon: number | null; tz: string }) => {
      try {
        const payload: any = { tz: next.tz };
        if (typeof next.lat === "number" && typeof next.lon === "number") {
          payload.lat = next.lat;
          payload.lon = next.lon;
        }
        localStorage.setItem("astroClockPrefs", JSON.stringify(payload));
      } catch {
        // ignore
      }
    },
    [],
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      return;
    }
    setLocStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = clamp(pos.coords.latitude, -90, 90);
        const lo = clamp(pos.coords.longitude, -180, 180);
        setLat(la);
        setLon(lo);
        setLocStatus("ready");
        // Keep timezone as-is (device by default)
        persistPrefs({ lat: la, lon: lo, tz: timeZone });
      },
      (err) => {
        if (err && err.code === 1) setLocStatus("blocked");
        else setLocStatus("error");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 },
    );
  }, [persistPrefs, timeZone]);

  const clearSavedLocation = useCallback(() => {
    setLat(null);
    setLon(null);
    setLocStatus("idle");
    persistPrefs({ lat: null, lon: null, tz: timeZone });
  }, [persistPrefs, timeZone]);

  const applyPreset = useCallback(
    (p: { lat: number; lon: number; tz: string }) => {
      const la = clamp(p.lat, -90, 90);
      const lo = clamp(p.lon, -180, 180);
      setLat(la);
      setLon(lo);
      setTimeZone(p.tz);
      setLocStatus("ready");
      persistPrefs({ lat: la, lon: lo, tz: p.tz });
    },
    [persistPrefs],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (e.key === "Escape") {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const zoned = useMemo(() => getZonedParts(now, timeZone), [now, timeZone]);

  const timeStr = useMemo(() => {
    return `${pad2(zoned.hour)}:${pad2(zoned.minute)}:${pad2(zoned.second)}`;
  }, [zoned.hour, zoned.minute, zoned.second]);

  const dateStr = useMemo(
    () => fmtDateLongInTZ(now, timeZone),
    [now, timeZone],
  );

  const hasCoords = typeof lat === "number" && typeof lon === "number";

  const tzOffsetMin = useMemo(() => {
    // Use the timezone offset for "now" to anchor calculations and display
    return getTimeZoneOffsetMinutes(now, timeZone);
  }, [now, timeZone]);

  const sunEvents = useMemo(() => {
    if (!hasCoords)
      return { sunrise: null as Date | null, sunset: null as Date | null };
    // Use the selected timezone's local date (Y-M-D) for sunrise/sunset
    return computeSunriseSunsetForLocalDate(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      lat as number,
      lon as number,
      tzOffsetMin,
    );
  }, [hasCoords, lat, lon, tzOffsetMin, zoned.day, zoned.month, zoned.year]);

  const solarAlt = useMemo(() => {
    if (!hasCoords) return null;
    return computeSolarAltitudeDeg(now, lat as number, lon as number);
  }, [hasCoords, lat, lon, now]);

  const phase = useMemo(() => computeMoonPhaseFraction(now), [now]);
  const phaseLabel = useMemo(() => moonPhaseLabel(phase), [phase]);

  const dayNightLabel = useMemo(() => {
    if (!hasCoords || solarAlt === null) return "Location needed";
    if (solarAlt > 0) return "Daylight";
    if (solarAlt <= 0 && solarAlt > -6) return "Civil twilight";
    if (solarAlt <= -6 && solarAlt > -12) return "Nautical twilight";
    if (solarAlt <= -12 && solarAlt > -18) return "Astronomical twilight";
    return "Night";
  }, [hasCoords, solarAlt]);

  const isDayBySun = useMemo(() => {
    if (!hasCoords || solarAlt === null) return null;
    return solarAlt > 0;
  }, [hasCoords, solarAlt]);

  const displayTone = useMemo(() => {
    if (!hasCoords) return "border-slate-200 bg-slate-50 text-slate-950";
    if (isDayBySun === null)
      return "border-slate-200 bg-slate-50 text-slate-950";
    return isDayBySun
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-indigo-200 bg-indigo-50 text-slate-950";
  }, [hasCoords, isDayBySun]);

  const latStr = useMemo(() => (lat === null ? "" : String(lat)), [lat]);
  const lonStr = useMemo(() => (lon === null ? "" : String(lon)), [lon]);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Astronomical Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="hidden text-sm font-semibold text-slate-700 sm:block">
            F fullscreen
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Btn
                kind="ghost"
                onClick={requestLocation}
                disabled={locStatus === "requesting"}
                className="py-2"
              >
                {locStatus === "requesting"
                  ? "Getting location..."
                  : "Use my location"}
              </Btn>

              <Btn kind="ghost" onClick={clearSavedLocation} className="py-2">
                Clear location
              </Btn>

              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-900">
                  Time zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    const tz = e.target.value;
                    setTimeZone(tz);
                    persistPrefs({ lat, lon, tz });
                  }}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                >
                  {timeZoneOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

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

            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Examples
              </div>
              {presets.map((p) => (
                <Chip
                  key={p.name}
                  active={lat === p.lat && lon === p.lon && timeZone === p.tz}
                  onClick={() => applyPreset(p)}
                >
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6",
            displayTone,
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            userSelect: "none",
          }}
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold uppercase tracking-widest opacity-90">
            <span className="inline-flex items-center gap-2">
              <SunDot />
              Sun
            </span>
            <span className="inline-flex items-center gap-2">
              <MoonDot phase={phase} />
              Moon
            </span>
            <span className="rounded-full border border-slate-200/60 bg-white/10 px-3 py-1">
              {dayNightLabel}
            </span>
          </div>

          <div className="mt-3 font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
            {timeStr}
          </div>

          <div className="mt-3 text-sm opacity-90">{dateStr}</div>

          <div className="mt-5 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/10 p-4">
              <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                Sunrise / Sunset
              </div>
              <div className="mt-2 text-sm font-semibold">
                <div className="flex items-center justify-between gap-3">
                  <span className="opacity-80">Sunrise</span>
                  <span className="font-extrabold">
                    {fmtTimeInTZ(sunEvents.sunrise, timeZone)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="opacity-80">Sunset</span>
                  <span className="font-extrabold">
                    {fmtTimeInTZ(sunEvents.sunset, timeZone)}
                  </span>
                </div>
                {!hasCoords && (
                  <div className="mt-2 text-xs opacity-80">
                    Add coordinates to compute sunrise and sunset.
                  </div>
                )}
                {hasCoords && !sunEvents.sunrise && !sunEvents.sunset && (
                  <div className="mt-2 text-xs opacity-80">
                    No sunrise or sunset for this date at these coordinates.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/10 p-4">
              <div className="text-xs font-bold uppercase tracking-wide opacity-80">
                Moon phase
              </div>
              <div className="mt-2 text-sm font-semibold">
                <div className="flex items-center justify-between gap-3">
                  <span className="opacity-80">Phase</span>
                  <span className="font-extrabold">{phaseLabel}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="opacity-80">Illumination</span>
                  <span className="font-extrabold">
                    {Math.round((1 - Math.abs(0.5 - phase) * 2) * 100)}%
                  </span>
                </div>
                {hasCoords && solarAlt !== null && (
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="opacity-80">Sun altitude</span>
                    <span className="font-extrabold">
                      {solarAlt.toFixed(1)}°
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-4 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Coordinates (optional)
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Latitude
                  <input
                    type="number"
                    inputMode="decimal"
                    min={-90}
                    max={90}
                    step="0.0001"
                    placeholder="e.g. 43.6532"
                    value={latStr}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.trim() === "") {
                        setLat(null);
                        persistPrefs({ lat: null, lon, tz: timeZone });
                        return;
                      }
                      const la = clamp(Number(v), -90, 90);
                      setLat(la);
                      persistPrefs({ lat: la, lon, tz: timeZone });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Longitude
                  <input
                    type="number"
                    inputMode="decimal"
                    min={-180}
                    max={180}
                    step="0.0001"
                    placeholder="e.g. -79.3832"
                    value={lonStr}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.trim() === "") {
                        setLon(null);
                        persistPrefs({ lat, lon: null, tz: timeZone });
                        return;
                      }
                      const lo = clamp(Number(v), -180, 180);
                      setLon(lo);
                      persistPrefs({ lat, lon: lo, tz: timeZone });
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Shortcut: F fullscreen
                {locStatus === "blocked"
                  ? " · Location blocked in browser settings"
                  : ""}
                {locStatus === "error" ? " · Location unavailable" : ""}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AstronomicalClockPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/astronomical-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Astronomical Clock",
        url,
        description:
          "Live astronomical clock showing the sun and moon, daylight vs night, sunrise and sunset, and local time. Clean fullscreen display that updates in real time.",
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
            name: "Astronomical Clock",
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

      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Astronomical Clock (Sun, Moon, Sunrise, Sunset)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Live local time for the selected time zone, with sunrise and sunset
            plus a moon phase readout. Fullscreen supported.
          </p>
        </div>
      </section>

      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <AstronomicalClockCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Astronomical Clock</span>
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

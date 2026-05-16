// app/routes/golden-hour-clock.tsx
import type { Route } from "./+types/golden-hour-clock";
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
import HowItWorks from "~/clients/components/golden-hour-clock/HowItWorks";
import Disclaimer from "~/clients/components/golden-hour-clock/Disclaimer";
import FAQ from "~/clients/components/golden-hour-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/golden-hour-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/golden-hour-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Golden Hour Times (Sunrise, Sunset & Golden Hour Near You)";
  const description =
    "Free golden hour clock showing today’s golden hour times for your location. View sunrise and sunset, golden hour start and end, and a live countdown in fullscreen.";

  const url = "https://www.ilovetimers.com/golden-hour-clock";

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

const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

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

function safeParseNum(s: string) {
  const trimmed = (s ?? "").trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return n;
}

function normalizeNumStr(s: string) {
  const n = safeParseNum(s);
  if (n == null) return s;
  return String(n);
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
  note?: string;
};

type GoldenMethod = "classic_60min" | "solar_0_to_6deg";

function getSolarTimes(
  dateLocal: Date,
  lat: number,
  lon: number,
  method: GoldenMethod,
): SolarTimes {
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

  const h0 = rad * -0.833;
  const Jrise = getSetJ(h0, lw, phi, dec, n, M, L);
  const Jset = Jnoon * 2 - Jrise;

  const solarNoon = fromJulian(Jnoon);
  const sunrise = fromJulian(Jrise);
  const sunset = fromJulian(Jset);

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
      note: "No sunrise or sunset for this date and location. Try a different date or location.",
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
    const h6 = rad * 6;

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
          note: "Using a safe fallback because solar-angle golden hour is unusual for this latitude and date.",
        };
      }
    } else {
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
   GOLDEN HOUR CLOCK CARD
========================================================= */
function GoldenHourClockCard() {
  const beep = useBeep();

  // Keep inputs fully usable while typing (no forced clamp while entering "-")
  const [latStr, setLatStr] = useState("40.7128");
  const [lonStr, setLonStr] = useState("-74.006");

  const [method, setMethod] = useState<GoldenMethod>("classic_60min");

  const [dateStr, setDateStr] = useState(() => toISODateInputValue(new Date()));
  const dateLocal = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map((x) => Number(x));
    const dt = new Date();
    dt.setFullYear(y || dt.getFullYear(), (m || 1) - 1, d || dt.getDate());
    dt.setHours(12, 0, 0, 0);
    return dt;
  }, [dateStr]);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [now, setNow] = useState(() => new Date());

  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(t);
  }, []);

  const latNum = useMemo(() => {
    const n = safeParseNum(latStr);
    if (n == null) return 40.7128;
    return clamp(n, -90, 90);
  }, [latStr]);

  const lonNum = useMemo(() => {
    const n = safeParseNum(lonStr);
    if (n == null) return -74.006;
    return clamp(n, -180, 180);
  }, [lonStr]);

  const times = useMemo(() => {
    return getSolarTimes(dateLocal, latNum, lonNum, method);
  }, [dateLocal, latNum, lonNum, method]);

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
    const events: Array<{ label: string; at: Date | null; prio: number }> = [
      {
        label: "Morning golden hour starts",
        at: times.goldenMorningStart,
        prio: 1,
      },
      {
        label: "Morning golden hour ends",
        at: times.goldenMorningEnd,
        prio: 1,
      },
      {
        label: "Evening golden hour starts",
        at: times.goldenEveningStart,
        prio: 1,
      },
      {
        label: "Evening golden hour ends",
        at: times.goldenEveningEnd,
        prio: 1,
      },
      { label: "Sunrise", at: times.sunrise, prio: 2 },
      { label: "Sunset", at: times.sunset, prio: 2 },
    ].filter((e) => e.at && !Number.isNaN(e.at.getTime()));

    const future = events
      .map((e) => ({ ...e, ms: (e.at as Date).getTime() - t }))
      .filter((e) => e.ms >= 0)
      .sort((a, b) => a.ms - b.ms || a.prio - b.prio)[0];

    return future
      ? { label: future.label, at: future.at as Date, ms: future.ms }
      : null;
  }, [now, times]);

  // Final beeps in last 5 seconds before any golden boundary (start/end)
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

    if (upcoming == null) {
      lastBeepSecondRef.current = null;
      return;
    }

    if (upcoming > 0 && upcoming <= 5_000) {
      const secLeft = Math.ceil(upcoming / 1000);
      if (lastBeepSecondRef.current !== secLeft) {
        lastBeepSecondRef.current = secLeft;
        beep(880, 110);
      }
      if (secLeft === 1) {
        // short confirm beep right before boundary
        window.setTimeout(() => beep(660, 160), 140);
      }
    } else {
      lastBeepSecondRef.current = null;
    }
  }, [now, times, sound, finalBeeps, beep]);

  const getGPS = useCallback(() => {
    if (sound) beep(0, 1);

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = Number(pos.coords.latitude.toFixed(6));
        const lo = Number(pos.coords.longitude.toFixed(6));
        setLatStr(String(la));
        setLonStr(String(lo));
      },
      () => {
        // ignore
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [beep, sound]);

  const headline = inGolden ? "Golden hour is happening now" : "Next change";
  const rawCountdownMs = nextEvent?.ms ?? null;
  const shownCountdown =
    rawCountdownMs == null
      ? "–"
      : msToClock(Math.ceil(rawCountdownMs / 1000) * 1000);

  const urgent = rawCountdownMs != null ? rawCountdownMs <= 10_000 : false;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownCountdown,
      isFs,
      urgent,
      headline,
      nextEvent?.label ?? "",
      nextEvent?.at?.getTime() ?? 0,
    ],
    minPx: 52,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const methodLabel =
    method === "classic_60min"
      ? "Classic (first and last 60 minutes)"
      : "Solar-angle (sun between horizon and 6°)";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "g") {
      getGPS();
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
        title="Golden Hour Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              Sound
            </label>
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={finalBeeps}
                onChange={(e) => setFinalBeeps(e.target.checked)}
                disabled={!sound}
              />
              Final beeps
            </label>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Golden Hour Clock (Sunrise, Sunset, Golden Hour)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Pick a date and location to get golden hour times plus a live
                countdown to the next change.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Sound
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
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
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-800">
              Date
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              <div className="mt-1 text-xs text-slate-600">
                {formatLocalDate(dateLocal)}
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Latitude
              <input
                type="text"
                inputMode="decimal"
                value={latStr}
                onChange={(e) => setLatStr(e.target.value)}
                onBlur={() => {
                  const n = safeParseNum(latStr);
                  if (n == null) return;
                  setLatStr(String(clamp(n, -90, 90)));
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              <div className="mt-1 text-xs text-slate-600">
                Range: -90 to 90
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Longitude
              <input
                type="text"
                inputMode="decimal"
                value={lonStr}
                onChange={(e) => setLonStr(e.target.value)}
                onBlur={() => {
                  const n = safeParseNum(lonStr);
                  if (n == null) return;
                  setLonStr(String(clamp(n, -180, 180)));
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              <div className="mt-1 text-xs text-slate-600">
                Range: -180 to 180
              </div>
            </label>

            <div className="flex flex-col gap-3">
              <label className="block text-sm font-semibold text-slate-800">
                Definition
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as GoldenMethod)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
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
                Shortcuts: <strong>F</strong> fullscreen · <strong>G</strong>{" "}
                GPS
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        {times.note ? (
          <div
            className={[
              "mt-4 rounded-2xl border p-4",
              isFs ? "mx-2 sm:mx-4" : "",
            ].join(" ")}
          >
            <div className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Note
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {times.note}
            </div>
          </div>
        ) : null}

        {/* Primary display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            urgent ? "border-rose-200" : "border-slate-200",
            "p-3 sm:p-6",
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
            if (isFs && cardRef.current) toggleFullscreen(cardRef.current);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Click to exit fullscreen" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {headline}
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
            }}
          >
            {shownCountdown}
          </span>

          <div className="mt-3 text-sm text-slate-700">
            {nextEvent ? (
              <>
                <span className="font-semibold text-slate-900">
                  {nextEvent.label}:
                </span>{" "}
                {formatLocalTime(nextEvent.at)}
              </>
            ) : (
              <>No upcoming events for this date and location.</>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              Now{" "}
              <span className="font-mono">
                {new Intl.DateTimeFormat(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(now)}
              </span>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              Sunrise{" "}
              <span className="font-mono">
                {formatLocalTime(times.sunrise)}
              </span>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              Sunset{" "}
              <span className="font-mono">{formatLocalTime(times.sunset)}</span>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
              {inGolden ? "In golden hour" : "Not in golden hour"}
            </div>
          </div>

          {/* Compact golden windows overlay */}
          <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                  Golden hour (local)
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className="rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur">
                      Morning {formatLocalTime(times.goldenMorningStart)} to{" "}
                      {formatLocalTime(times.goldenMorningEnd)}
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur">
                      Evening {formatLocalTime(times.goldenEveningStart)} to{" "}
                      {formatLocalTime(times.goldenEveningEnd)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                F = Fullscreen · G = GPS
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              F fullscreen · G GPS · Times shown in your device time zone
            </div>
            <div className="flex items-center gap-2">
              <Btn kind="solid" onClick={getGPS} className="py-1 text-sm">
                Use GPS
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => {
                  const d = new Date();
                  setDateStr(toISODateInputValue(d));
                }}
                className="py-1 text-sm"
              >
                Today
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
export default function GoldenHourClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/golden-hour-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Golden Hour Clock",
        url,
        description:
          "Golden hour times, sunrise, and sunset for a chosen date and location, with a live countdown and fullscreen view.",
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
            name: "Golden Hour Clock",
            item: url,
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
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <GoldenHourClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Golden Hour Clock</span>
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

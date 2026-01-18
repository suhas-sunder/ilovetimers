import type { Route } from "./+types/moon-phase-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import RelatedSites from "~/clients/components/navigation/RelatedSites";
import TimerMenuLinks from "~/clients/components/navigation/TimerMenuLinks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Moon Phase Clock | Current Moon Phase Today (Illumination + Next Full Moon) (Live, Fullscreen)";
  const description =
    "Free Moon Phase Clock that shows the current moon phase, illumination estimate, moon age, and a countdown to the next major phase (new moon, first quarter, full moon, last quarter). Works instantly, includes fullscreen mode.";
  const url = "https://ilovetimers.com/moon-phase-clock";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "moon phase clock",
        "current moon phase",
        "moon phase today",
        "lunar phase today",
        "moon illumination",
        "moon age",
        "next full moon",
        "next new moon",
        "moon phases",
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
const pad2 = (n: number) => n.toString().padStart(2, "0");

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
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

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function toISODateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function formatLocalTime(d: Date | null) {
  if (!d || Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatLocalDateTime(d: Date | null) {
  if (!d || Number.isNaN(d.getTime())) return "–";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
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
   LUNAR MODEL (fast, dependency-free, stable for UI)
   Uses synodic month with a reference new moon.
========================================================= */
const SYNODIC_MONTH_DAYS = 29.530588853;

// Reference new moon: 2000-01-06 18:14 UTC (commonly used epoch)
const NEW_MOON_REF_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

type MajorPhase = "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";

function normalize01(x: number) {
  const r = x % 1;
  return r < 0 ? r + 1 : r;
}

function illuminationFromPhaseFraction(f: number) {
  // 0 new -> 0, 0.5 full -> 1
  return 0.5 * (1 - Math.cos(2 * Math.PI * f));
}

function phaseNameFromFraction(f: number) {
  // Stable label bands
  if (f < 0.03 || f >= 0.97) return "New Moon";
  if (f < 0.22) return "Waxing Crescent";
  if (f < 0.28) return "First Quarter";
  if (f < 0.47) return "Waxing Gibbous";
  if (f < 0.53) return "Full Moon";
  if (f < 0.72) return "Waning Gibbous";
  if (f < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function getMoonInfo(at: Date) {
  const msSinceRef = at.getTime() - NEW_MOON_REF_UTC_MS;
  const daysSinceRef = msSinceRef / 86400000;

  const ageDays =
    ((daysSinceRef % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS;

  const phaseFraction = normalize01(ageDays / SYNODIC_MONTH_DAYS); // 0=new, 0.5=full
  const illumination = illuminationFromPhaseFraction(phaseFraction);
  const phaseLabel = phaseNameFromFraction(phaseFraction);

  const targets: Array<{ name: MajorPhase; frac: number }> = [
    { name: "New Moon", frac: 0.0 },
    { name: "First Quarter", frac: 0.25 },
    { name: "Full Moon", frac: 0.5 },
    { name: "Last Quarter", frac: 0.75 },
  ];

  const nextMajor = targets
    .map((t) => {
      const df = normalize01(t.frac - phaseFraction);
      const dd = df * SYNODIC_MONTH_DAYS;
      const atMs = at.getTime() + dd * 86400000;
      return { ...t, deltaDays: dd, at: new Date(atMs) };
    })
    .sort((a, b) => a.deltaDays - b.deltaDays)[0];

  const prevMajor = targets
    .map((t) => {
      const df = normalize01(phaseFraction - t.frac);
      const dd = df * SYNODIC_MONTH_DAYS;
      const atMs = at.getTime() - dd * 86400000;
      return { ...t, deltaDays: dd, at: new Date(atMs) };
    })
    .sort((a, b) => a.deltaDays - b.deltaDays)[0];

  return {
    phaseFraction,
    ageDays,
    illumination,
    phaseLabel,
    nextMajor,
    prevMajor,
  };
}

/* =========================================================
   UI PRIMITIVES (matches your site)
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function PhaseBar({ phaseFraction }: { phaseFraction: number }) {
  const pct = Math.round(phaseFraction * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
        <span>New</span>
        <span>First Quarter</span>
        <span>Full</span>
        <span>Last Quarter</span>
        <span>New</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-amber-200 bg-white">
        <div
          className="h-full bg-amber-700"
          style={{ width: `${clamp(pct, 0, 100)}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-slate-600">Cycle position: {pct}%</div>
    </div>
  );
}

/* =========================================================
   MOON PHASE CLOCK CARD
========================================================= */
function MoonPhaseClockCard() {
  const beep = useBeep();

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [live, setLive] = useState(true);
  const [dateStr, setDateStr] = useState(() => toISODateInputValue(new Date()));
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const [now, setNow] = useState(() => new Date());

  const displayWrapRef = useRef<HTMLDivElement>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(t);
  }, [live]);

  const at = useMemo(() => {
    if (live) return now;

    const [y, m, d] = dateStr.split("-").map((x) => Number(x));
    const dt = new Date();
    dt.setFullYear(y || dt.getFullYear(), (m || 1) - 1, d || dt.getDate());
    dt.setHours(clamp(hour, 0, 23), clamp(minute, 0, 59), 0, 0);
    return dt;
  }, [live, now, dateStr, hour, minute]);

  const info = useMemo(() => getMoonInfo(at), [at]);

  const nextMs = Math.max(0, info.nextMajor.at.getTime() - at.getTime());
  const urgent = live && nextMs > 0 && nextMs <= 10_000;

  // Beeps only make sense in live mode
  useEffect(() => {
    if (!live) return;
    if (!sound || !finalBeeps) return;

    if (nextMs > 0 && nextMs <= 5_000) {
      const secLeft = Math.ceil(nextMs / 1000);
      if (lastBeepSecondRef.current !== secLeft) {
        lastBeepSecondRef.current = secLeft;
        beep(880, 110);
      }
    } else {
      lastBeepSecondRef.current = null;
    }

    if (nextMs === 0) {
      beep(660, 220);
      lastBeepSecondRef.current = null;
    }
  }, [live, nextMs, sound, finalBeeps, beep]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key.toLowerCase() === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    }
  };

  const illuminationPct = Math.round(info.illumination * 100);
  const ageStr = `${info.ageDays.toFixed(1)} days`;
  const countdown = live ? msToClock(nextMs) : "–";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Moon Phase Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A live <strong>moon phase clock</strong> showing the{" "}
            <strong>current moon phase</strong>, illumination estimate, moon
            age, and the next major phase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />
            Live
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              disabled={!live}
            />
            Sound
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={finalBeeps}
              onChange={(e) => setFinalBeeps(e.target.checked)}
              disabled={!live || !sound}
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
            disabled={live}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Hour
          <input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(clamp(Number(e.target.value || 0), 0, 23))}
            disabled={live}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
          />
        </label>

        <label className="block text-sm font-semibold text-amber-950">
          Minute
          <input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={(e) =>
              setMinute(clamp(Number(e.target.value || 0), 0, 59))
            }
            disabled={live}
            className="mt-1 w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-amber-950">Quick</div>
          <div className="flex gap-3">
            <Btn
              kind="ghost"
              onClick={() => {
                const d = new Date();
                setDateStr(toISODateInputValue(d));
                setHour(12);
                setMinute(0);
              }}
              disabled={live}
            >
              Set to noon
            </Btn>
            <Btn
              onClick={() => {
                if (sound) beep(0, 1);
                setLive(true);
              }}
            >
              Now
            </Btn>
          </div>
          <div className="text-xs text-slate-600">
            Shortcut: <strong>F</strong> fullscreen
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Current moon phase
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-950">
            {info.phaseLabel}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Illumination
              </div>
              <div className="mt-1 text-lg font-extrabold text-amber-950">
                {illuminationPct}%
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Estimated lit fraction.
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Moon age
              </div>
              <div className="mt-1 text-lg font-extrabold text-amber-950">
                {ageStr}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Days since new moon.
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Checked at
              </div>
              <div className="mt-1 text-sm font-semibold text-amber-950">
                {formatLocalDateTime(at)}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Local device time.
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PhaseBar phaseFraction={info.phaseFraction} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Previous major phase
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>{info.prevMajor.name}:</strong>{" "}
                {formatLocalDateTime(info.prevMajor.at)}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Next major phase
              </div>
              <div className="mt-2 text-sm text-amber-900">
                <strong>{info.nextMajor.name}:</strong>{" "}
                {formatLocalDateTime(info.nextMajor.at)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-600">
            This is a fast lunar-cycle estimate designed for a clock experience.
            It is great for planning and everyday use, but not a replacement for
            a full ephemeris.
          </div>
        </div>

        {/* Live countdown display */}
        <div
          ref={displayWrapRef}
          data-fs-container
          className={`overflow-hidden rounded-2xl border-2 ${
            urgent
              ? "border-rose-300 bg-rose-50 text-rose-950"
              : "border-amber-300 bg-amber-50 text-amber-950"
          }`}
          style={{ minHeight: 300 }}
          aria-live="polite"
        >
          {/* Fullscreen CSS: show ONLY fullscreen shell in fullscreen */}
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
            style={{ minHeight: 300 }}
          >
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Next major phase countdown
            </div>

            <div className="mt-2 text-sm font-semibold text-amber-950 text-center">
              Next: <strong>{info.nextMajor.name}</strong>{" "}
              <span className="text-amber-300">•</span>{" "}
              {formatLocalTime(info.nextMajor.at)}
            </div>

            <div className="mt-5 font-mono text-6xl font-extrabold tracking-widest sm:text-6xl">
              {live ? countdown : "Enable Live"}
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-950 text-center">
              Shortcuts: F fullscreen
            </div>

            <div className="mt-3 text-xs text-slate-600 text-center">
              Tip: click this card once so the keyboard shortcut works.
            </div>
          </div>

          {/* Fullscreen shell */}
          <div data-shell="fullscreen">
            <div className="fs-inner">
              <div className="fs-label">Moon Phase Clock</div>
              <div className="fs-time">{live ? countdown : "Enable Live"}</div>
              <div className="fs-sub">
                Next {info.nextMajor.name} at{" "}
                {formatLocalTime(info.nextMajor.at)}
              </div>
              <div className="fs-help">F fullscreen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcut: F fullscreen
        </div>
        <div className="text-xs text-slate-600">
          Live mode updates automatically. Manual mode is for checking a
          specific moment.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MoonPhaseClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/moon-phase-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Moon Phase Clock",
        url,
        description:
          "Free Moon Phase Clock showing the current moon phase, illumination estimate, moon age, and a live countdown to the next major phase.",
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
            name: "Moon Phase Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Moon Phase Clock",
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
            / <span className="text-amber-950">Moon Phase Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Moon Phase Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>moon phase clock</strong> showing the{" "}
            <strong>current moon phase</strong>, illumination estimate, moon
            age, and the next major phase.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MoonPhaseClockCard />

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Check moon phase fast
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              If you just want the <strong>moon phase today</strong>, leave Live
              on. You get the phase name, illumination estimate, and moon age.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Next full moon and new moon
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              The countdown shows time until the next major phase. Useful for
              planning night photography, skywatching, and dark-sky trips.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Fullscreen display
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use fullscreen for a clean screen display. Click the card and
              press <strong>F</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Menu Links */}
      <TimerMenuLinks />
      <RelatedSites />

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Moon phases explained (and why they matter)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>Moon Phase Clock</strong> helps you check the{" "}
              <strong>current moon phase</strong> quickly. Moon phases happen
              because we see different portions of the moon’s sunlit half as it
              orbits Earth. Over about <strong>29.53 days</strong>, the moon
              cycles through new moon, crescents, quarters, gibbous phases, and
              full moon.
            </p>

            <p>
              For dark skies, the days around a <strong>new moon</strong> are
              usually best. For bright nights and moonlit landscapes, the days
              around a <strong>full moon</strong> are popular. The clock also
              shows an illumination estimate so you can quickly judge how bright
              the night sky might be.
            </p>

            <p>
              Want another tool? Use{" "}
              <Link
                to="/online-timer"
                className="font-semibold hover:underline"
              >
                Online Timer
              </Link>{" "}
              for countdown timing or{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>{" "}
              for elapsed time.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                New moon
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Darkest nights. Best for stars and Milky Way.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Full moon
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Brightest nights. Great for moonlit scenes, worse for stars.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                Quarter moons
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                Balanced light. Often a good compromise for shooting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Moon Phase Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is the current moon phase today?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              The tool updates live and shows the phase name, illumination
              estimate, and moon age for your current time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              When is the next full moon or next new moon?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              The page shows the next major phase (new moon, first quarter, full
              moon, last quarter) with an estimated date and time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is the moon phase the same everywhere?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              The phase is essentially the same worldwide at the same moment,
              but local date and time differ by time zone. Orientation can look
              flipped between hemispheres.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I check a specific date and time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn Live off, select a date and time, and the page updates
              the moon phase estimate for that moment.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is the fullscreen shortcut?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Press <strong>F</strong> to toggle fullscreen while the card is
              focused.
            </div>
          </details>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-xs text-slate-600">Build: {nowISO}</div>
      </section>
      <MoonPhaseFaqSection />
    </main>
  );
}

/* =========================================================
   FAQ (VISIBLE) + JSON-LD
========================================================= */

const MOON_PHASE_FAQ = [
  {
    q: "What is the current moon phase today?",
    a: "The Moon Phase Clock updates live and shows the current phase name, illumination estimate, and moon age for your current time.",
  },
  {
    q: "When is the next full moon or next new moon?",
    a: "The page shows the next major phase (new moon, first quarter, full moon, last quarter) with an estimated local date and time, plus a live countdown.",
  },
  {
    q: "How long is a lunar cycle?",
    a: "A full lunar cycle from new moon to new moon is about 29.53 days on average (the synodic month).",
  },
  {
    q: "Is the moon phase the same everywhere?",
    a: "The phase is essentially the same worldwide at the same moment. Your local date and time can differ by time zone, and the moon’s orientation can look flipped between hemispheres.",
  },
  {
    q: "Can I check a specific date and time?",
    a: "Yes. Turn Live off, choose a date and time, and the tool estimates the moon phase for that moment.",
  },
  {
    q: "What is the fullscreen shortcut?",
    a: "Press F to toggle fullscreen while the countdown card is focused.",
  },
] as const;

function MoonPhaseFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MOON_PHASE_FAQ.map((it) => ({
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
        Moon Phase Clock FAQ
      </h2>

      <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
        {MOON_PHASE_FAQ.map((it, i) => (
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

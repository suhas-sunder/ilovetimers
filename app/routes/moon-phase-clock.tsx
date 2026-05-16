// app/routes/moon-phase-clock.tsx
import type { Route } from "./+types/moon-phase-clock";
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
import HowItWorks from "~/clients/components/moon-phase-clock/HowItWorks";
import Disclaimer from "~/clients/components/moon-phase-clock/Disclaimer";
import FAQ from "~/clients/components/moon-phase-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/moon-phase-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/moon-phase-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Current Moon Phase Today (Live Phase, Illumination & Age)";
  const description =
    "See today’s moon phase at a glance. View the current phase, illumination, moon age, and when the next full or new moon occurs in a clean, live display.";

  const url = "https://www.ilovetimers.com/moon-phase-clock";

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

// WebAudio beep (safe unlock + beep)
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

      // Unlock-only call
      if (!freq || freq <= 0) return;

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

/* =========================================================
   LUNAR MODEL (fast, dependency-free, stable for UI)
========================================================= */
const SYNODIC_MONTH_DAYS = 29.530588853;
const NEW_MOON_REF_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

type MajorPhase = "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";

function normalize01(x: number) {
  const r = x % 1;
  return r < 0 ? r + 1 : r;
}

function illuminationFromPhaseFraction(f: number) {
  return 0.5 * (1 - Math.cos(2 * Math.PI * f));
}

function phaseNameFromFraction(f: number) {
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

  const phaseFraction = normalize01(ageDays / SYNODIC_MONTH_DAYS);
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
   UI PRIMITIVES (matches updated styling)
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

function PhaseBar({ phaseFraction }: { phaseFraction: number }) {
  const pct = Math.round(phaseFraction * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>New</span>
        <span>First Quarter</span>
        <span>Full</span>
        <span>Last Quarter</span>
        <span>New</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-white">
        <div
          className="h-full bg-amber-500"
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

  const [live, setLive] = useState(true);
  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [dateStr, setDateStr] = useState(() => toISODateInputValue(new Date()));
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);

  const [now, setNow] = useState(() => new Date());

  const clockCardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(clockCardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

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

  const nextMsRaw = Math.max(0, info.nextMajor.at.getTime() - at.getTime());
  const urgent = live && nextMsRaw > 0 && nextMsRaw <= 10_000;

  // Final beeps only in live mode
  useEffect(() => {
    if (!live) return;
    if (!sound || !finalBeeps) return;

    if (nextMsRaw > 0 && nextMsRaw <= 5_000) {
      const secLeft = Math.ceil(nextMsRaw / 1000);
      if (lastBeepSecondRef.current !== secLeft) {
        lastBeepSecondRef.current = secLeft;
        beep(880, 110);
      }
    } else {
      lastBeepSecondRef.current = null;
    }

    if (nextMsRaw === 0) {
      beep(660, 220);
      lastBeepSecondRef.current = null;
    }
  }, [live, nextMsRaw, sound, finalBeeps, beep]);

  const shownCountdown = live
    ? msToClock(Math.ceil(nextMsRaw / 1000) * 1000)
    : msToClock(Math.ceil(nextMsRaw / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownCountdown, isFs, urgent, live, info.nextMajor.name],
    minPx: 64,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 92 : 84,
  });

  const illuminationPct = Math.round(info.illumination * 100);
  const ageStr = `${info.ageDays.toFixed(1)} days`;

  const statusLabel = live ? "Live" : "Manual";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && clockCardRef.current) {
      toggleFullscreen(clockCardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const enterManual = useCallback(() => {
    setLive(false);
  }, []);

  return (
    <Card
      cardRef={clockCardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Moon Phase Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={() => setLive((v) => !v)}
              className="py-1 text-sm"
            >
              {live ? "Live: On" : "Live: Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setSound((v) => !v)}
              className="py-1 text-sm"
            >
              {sound ? "Sound: On" : "Sound: Off"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Moon Phase Clock
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Big live countdown to the next major phase, plus phase,
                illumination, and age.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  className="cursor-pointer"
                />
                Live
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="cursor-pointer"
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={finalBeeps}
                  onChange={(e) => setFinalBeeps(e.target.checked)}
                  disabled={!sound}
                  className="cursor-pointer"
                />
                Final beeps
              </label>

              <Btn
                kind="ghost"
                onClick={() =>
                  clockCardRef.current && toggleFullscreen(clockCardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* BIG CLOCK AREA (dominant) */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            urgent
              ? "border-rose-200 bg-rose-50"
              : "border-slate-200 bg-slate-50",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 520,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            // click-to-focus behavior (helps keyboard shortcuts without breaking inputs)
            clockCardRef.current?.focus();
          }}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Next major phase countdown
          </div>

          <div className="mt-2 text-sm font-semibold text-slate-700 text-center">
            Next:{" "}
            <strong className="text-slate-900">{info.nextMajor.name}</strong>{" "}
            <span className="text-slate-300">•</span>{" "}
            {formatLocalTime(info.nextMajor.at)}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-4 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {live ? shownCountdown : shownCountdown}
          </span>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <div className="timer-control-shadow rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Status: <span className="text-slate-900">{statusLabel}</span>
            </div>
            <div className="timer-control-shadow rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Phase: <span className="text-slate-900">{info.phaseLabel}</span>
            </div>
            <div className="timer-control-shadow rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Illumination:{" "}
              <span className="text-slate-900">{illuminationPct}%</span>
            </div>
            <div className="timer-control-shadow rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Age: <span className="text-slate-900">{ageStr}</span>
            </div>
          </div>

          {!isFs && (
            <div className="mt-5 timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 text-center">
              Shortcuts: F fullscreen · Esc exit
            </div>
          )}
        </div>

        {/* CONTROLS (always interactable; editing switches to Manual) */}
        {!isFs && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-900">
              Date
              <input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  enterManual();
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Hour
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => {
                  setHour(clamp(Number(e.target.value || 0), 0, 23));
                  enterManual();
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Minute
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => {
                  setMinute(clamp(Number(e.target.value || 0), 0, 59));
                  enterManual();
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-slate-900">Quick</div>
              <div className="flex flex-wrap gap-3">
                <Btn
                  kind="ghost"
                  onClick={() => {
                    const d = new Date();
                    setDateStr(toISODateInputValue(d));
                    setHour(12);
                    setMinute(0);
                    enterManual();
                  }}
                >
                  Set to noon
                </Btn>

                <Btn
                  kind="solid"
                  onClick={() => {
                    // unlock audio context without playing a tone
                    if (sound) beep(0, 1);
                    setLive(true);
                  }}
                >
                  Now
                </Btn>
              </div>

              <div className="text-xs text-slate-600">
                Editing date/time switches to <strong>Manual</strong>. Use{" "}
                <strong>Now</strong> for Live.
              </div>
            </div>
          </div>
        )}

        {/* DETAILS (secondary) */}
        {!isFs && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Checked at
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatLocalDateTime(at)}
              </div>
              <div className="mt-4">
                <PhaseBar phaseFraction={info.phaseFraction} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Previous major
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    <strong className="text-slate-900">
                      {info.prevMajor.name}:
                    </strong>{" "}
                    {formatLocalDateTime(info.prevMajor.at)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Next major
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    <strong className="text-slate-900">
                      {info.nextMajor.name}:
                    </strong>{" "}
                    {formatLocalDateTime(info.nextMajor.at)}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                This is a fast lunar-cycle estimate designed for a clock
                experience.
              </div>
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              F fullscreen · Esc exit · {live ? "Live updating" : "Manual time"}
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {urgent ? "Event soon" : "OK"}
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
export default function MoonPhaseClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/moon-phase-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Moon Phase Clock",
        url,
        description:
          "Live moon phase clock showing current phase, illumination estimate, moon age, and a countdown to the next major phase.",
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
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MoonPhaseClockCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Moon Phase Clock</span>
        </p>

        <span className="sr-only">Build: {nowISO}</span>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}

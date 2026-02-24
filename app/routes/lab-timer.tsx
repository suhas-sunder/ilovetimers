// app/routes/lab-timer.tsx
import type { Route } from "./+types/lab-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/lab-timer/HowItWorks";
import Disclaimer from "~/clients/components/lab-timer/Disclaimer";
import FAQ from "~/clients/components/lab-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/lab-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/lab-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Lab Timer (Experiments + Reaction Time, Fullscreen)";
  const description =
    "Online lab timer for experiments and reaction timing. Use a precise stopwatch with laps or run repeatable countdowns for timed lab steps in a clear, distraction-free display.";

  const url = "https://www.ilovetimers.com/lab-timer";

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

const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
}

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

// WebAudio beep
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

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-800/60 bg-slate-950/85 px-2 py-2 text-white backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-white">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <button
            type="button"
            onClick={onExit}
            className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Exit (Esc)
          </button>
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
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 bg-slate-950/85 px-2 py-2 text-white backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/* =========================================================
   LAB TIMER CARD
========================================================= */
type Lap = { n: number; splitMs: number; atMs: number };

function LabTimerCard() {
  const beep = useBeep();

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  /* ---------- Stopwatch ---------- */
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [maxLaps, setMaxLaps] = useState(60);

  const swRafRef = useRef<number | null>(null);
  const swStartRef = useRef<number | null>(null);
  const swBaseRef = useRef<number>(0);

  const swElapsedRef = useRef<number>(0);
  useEffect(() => {
    swElapsedRef.current = swElapsed;
  }, [swElapsed]);

  const lastLapAtRef = useRef<number>(0);

  function stopSwRaf() {
    if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
    swRafRef.current = null;
  }

  useEffect(() => {
    if (!swRunning) {
      stopSwRaf();
      swStartRef.current = null;
      return;
    }

    swStartRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (swStartRef.current ?? now);
      const next = swBaseRef.current + delta;
      setSwElapsed(next);
      swRafRef.current = requestAnimationFrame(tick);
    };

    swRafRef.current = requestAnimationFrame(tick);
    return () => stopSwRaf();
  }, [swRunning]);

  useEffect(() => {
    return () => stopSwRaf();
  }, []);

  function swStartPause() {
    setSwRunning((r) => {
      const next = !r;
      swBaseRef.current = swElapsedRef.current;
      return next;
    });
  }

  function swReset() {
    setSwRunning(false);
    setSwElapsed(0);
    swBaseRef.current = 0;
    swStartRef.current = null;
    setLaps([]);
    lastLapAtRef.current = 0;
    stopSwRaf();
  }

  function swLap() {
    if (!swRunning) return;

    const nowElapsed = swElapsedRef.current;
    const split = Math.max(0, nowElapsed - lastLapAtRef.current);
    lastLapAtRef.current = nowElapsed;

    setLaps((prev) => {
      if (prev.length >= maxLaps) return prev;
      return [
        { n: prev.length + 1, splitMs: split, atMs: nowElapsed },
        ...prev,
      ];
    });

    if (sound) beep(880, 80);
  }

  const bestLap = useMemo(() => {
    if (!laps.length) return null;
    return Math.min(...laps.map((l) => l.splitMs));
  }, [laps]);

  /* ---------- Repeatable Countdown ---------- */
  const cdBoxRef = useRef<HTMLDivElement>(null);
  const isCdFs = useIsFullscreen(cdBoxRef);

  const [stepSec, setStepSec] = useState(60);
  const stepSecRef = useRef<number>(60);
  useEffect(() => {
    stepSecRef.current = stepSec;
  }, [stepSec]);

  const [cdRemaining, setCdRemaining] = useState(stepSec * 1000);
  const cdRemainingRef = useRef<number>(stepSec * 1000);
  useEffect(() => {
    cdRemainingRef.current = cdRemaining;
  }, [cdRemaining]);

  const [cdRunning, setCdRunning] = useState(false);

  const [repeat, setRepeat] = useState(true);
  const repeatRef = useRef(true);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const soundRef = useRef(true);
  const finalBeepsRef = useRef(false);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);
  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  const cdRafRef = useRef<number | null>(null);
  const cdEndRef = useRef<number | null>(null);
  const cdLastBeepSecondRef = useRef<number | null>(null);

  function stopCdRaf() {
    if (cdRafRef.current) cancelAnimationFrame(cdRafRef.current);
    cdRafRef.current = null;
  }

  useEffect(() => {
    setCdRemaining(stepSec * 1000);
    setCdRunning(false);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
    stopCdRaf();
  }, [stepSec]);

  useEffect(() => {
    if (!cdRunning) {
      stopCdRaf();
      cdEndRef.current = null;
      cdLastBeepSecondRef.current = null;
      return;
    }

    if (!cdEndRef.current)
      cdEndRef.current = performance.now() + cdRemainingRef.current;

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (cdEndRef.current ?? now) - now);
      setCdRemaining(rem);

      if (
        soundRef.current &&
        finalBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (cdLastBeepSecondRef.current !== secLeft) {
          cdLastBeepSecondRef.current = secLeft;
          beep(880, 100);
        }
      }

      if (rem <= 0) {
        cdEndRef.current = null;
        cdLastBeepSecondRef.current = null;

        if (soundRef.current) beep(660, 240);

        if (repeatRef.current) {
          const next = stepSecRef.current * 1000;
          setCdRemaining(next);
          cdEndRef.current = performance.now() + next;
          cdRafRef.current = requestAnimationFrame(tick);
          return;
        }

        setCdRunning(false);
        return;
      }

      cdRafRef.current = requestAnimationFrame(tick);
    };

    cdRafRef.current = requestAnimationFrame(tick);
    return () => stopCdRaf();
  }, [cdRunning, beep]);

  useEffect(() => {
    return () => stopCdRaf();
  }, []);

  function cdStartPause() {
    setCdRunning((r) => {
      const next = !r;
      cdLastBeepSecondRef.current = null;
      if (next) {
        cdEndRef.current = performance.now() + cdRemainingRef.current;
      } else {
        cdEndRef.current = null;
      }
      return next;
    });
  }

  function cdReset() {
    setCdRunning(false);
    setCdRemaining(stepSecRef.current * 1000);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
    stopCdRaf();
  }

  const quickSteps = useMemo(
    () => [10, 15, 30, 45, 60, 90, 120, 180, 300, 600],
    [],
  );

  const cdUrgent = cdRunning && cdRemaining > 0 && cdRemaining <= 10_000;

  const cdText = msToClock(Math.ceil(cdRemaining / 1000) * 1000);
  const swText = msToStopwatch(swElapsed);

  const cdTimeTextRef = useRef<HTMLSpanElement>(null);
  const cdInnerBoxRef = useRef<HTMLDivElement>(null);

  const cdFontPx = useFitText({
    containerRef: cdInnerBoxRef,
    textRef: cdTimeTextRef,
    deps: [cdText, isCdFs, cdRunning, stepSec, repeat],
    minPx: 52,
    maxPx: isCdFs ? 520 : 360,
    paddingAllowancePx: isCdFs ? 72 : 64,
  });

  const swTimeTextRef = useRef<HTMLSpanElement>(null);
  const swInnerBoxRef = useRef<HTMLDivElement>(null);

  const swFontPx = useFitText({
    containerRef: swInnerBoxRef,
    textRef: swTimeTextRef,
    deps: [swText, swRunning, laps.length],
    minPx: 44,
    maxPx: 220,
    paddingAllowancePx: 56,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    // Stopwatch
    if (e.key === " ") {
      e.preventDefault();
      swStartPause();
      return;
    }
    if (k === "l") {
      swLap();
      return;
    }

    // Countdown
    if (k === "c") {
      cdStartPause();
      return;
    }
    if (k === "t") {
      setRepeat((v) => !v);
      return;
    }

    // Global reset
    if (k === "r") {
      swReset();
      cdReset();
      return;
    }

    // Fullscreen for countdown box
    if (k === "f" && cdBoxRef.current) {
      toggleFullscreen(cdBoxRef.current);
      return;
    }

    if (k === "escape" && isCdFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const swStatus = swRunning ? "Running" : swElapsed > 0 ? "Paused" : "Ready";
  const cdStatus = cdRunning
    ? "Running"
    : cdRemaining < stepSec * 1000
      ? "Paused"
      : "Ready";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-sky-700">Lab Timer</h1>
          <p className="mt-1 text-sm text-slate-600">
            Stopwatch with laps for reaction timing, plus a repeatable countdown
            for step-based protocols.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={finalCountdownBeeps}
              onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
              disabled={!sound}
            />
            Final beeps
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              cdBoxRef.current && toggleFullscreen(cdBoxRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Shortcuts: Space stopwatch · L lap · C countdown · R reset · T
            repeat · F fullscreen
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* STOPWATCH */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold text-sky-700">
              Stopwatch + Laps
            </h2>
            <div className="text-xs font-semibold text-slate-600">mm:ss.cc</div>
          </div>

          <div
            ref={swInnerBoxRef}
            className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-6"
            style={{ minHeight: 180, userSelect: "none" }}
            aria-live="polite"
          >
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {swStatus}
            </div>

            <div className="mt-2 flex items-center justify-center">
              <span
                ref={swTimeTextRef}
                className="inline-block text-center font-mono font-extrabold tracking-widest text-slate-950"
                style={{
                  fontSize: `${swFontPx}px`,
                  lineHeight: "1",
                  transform: "translateZ(0)",
                }}
              >
                {swText}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn onClick={swStartPause}>{swRunning ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={swLap} disabled={!swRunning}>
              Lap
            </Btn>
            <Btn kind="ghost" onClick={swReset}>
              Reset
            </Btn>

            <label className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
              Max laps
              <input
                type="number"
                min={10}
                max={300}
                value={maxLaps}
                onChange={(e) =>
                  setMaxLaps(clamp(Number(e.target.value || 60), 10, 300))
                }
                className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Laps (newest first)
            </div>

            {laps.length ? (
              <div className="mt-3 max-h-[260px] overflow-auto rounded-xl border border-slate-200 bg-white">
                <div className="divide-y divide-slate-100">
                  {laps.map((l) => {
                    const isBest = bestLap != null && l.splitMs === bestLap;
                    return (
                      <div
                        key={`${l.n}-${l.atMs}`}
                        className="grid grid-cols-[70px_1fr_110px] items-center gap-2 px-3 py-2"
                      >
                        <div className="text-sm font-bold text-slate-900">
                          Lap {l.n}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-extrabold text-slate-900">
                            {msToStopwatch(l.splitMs)}
                          </div>
                          <div className="text-xs text-slate-600">
                            {isBest ? "Best lap" : ""}
                          </div>
                        </div>
                        <div className="text-right font-mono text-sm font-semibold text-slate-900">
                          {msToStopwatch(l.atMs)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-700">
                Start the stopwatch, then press <strong>L</strong> to record
                laps (splits).
              </div>
            )}
          </div>
        </div>

        {/* COUNTDOWN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold text-sky-700">
              Repeatable Countdown
            </h2>
            <div className="text-xs font-semibold text-slate-600">
              step timer
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Common step times
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickSteps.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStepSec(s)}
                  className={[
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                    s === stepSec
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {s >= 60
                    ? `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ""}`
                    : `${s}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block text-sm font-semibold text-slate-900">
              Custom step (seconds)
              <input
                type="number"
                min={1}
                max={24 * 60 * 60}
                value={stepSec}
                onChange={(e) =>
                  setStepSec(
                    clamp(Number(e.target.value || 1), 1, 24 * 60 * 60),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <div className="flex items-end gap-3">
              <Btn onClick={cdStartPause}>{cdRunning ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={cdReset}>
                Reset
              </Btn>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
              />
              Repeat step
            </label>

            <div className="text-xs font-semibold text-slate-600">
              If Repeat is on, the countdown restarts automatically after it
              hits zero.
            </div>
          </div>

          {/* Fullscreen overlay bars */}
          <div className="relative mt-5">
            <div
              ref={cdBoxRef}
              className={[
                "relative overflow-hidden rounded-2xl border text-slate-950",
                isCdFs
                  ? "h-screen w-screen rounded-none border-0 bg-slate-950 text-white"
                  : cdUrgent
                    ? "border-rose-200 bg-rose-50"
                    : "border-slate-200 bg-slate-50",
              ].join(" ")}
              style={{
                minHeight: isCdFs ? undefined : 220,
                userSelect: "none",
              }}
              aria-live="polite"
              onClick={() => {
                if (isCdFs) cdStartPause();
              }}
              role={isCdFs ? "button" : undefined}
              title={isCdFs ? "Tap/click to start or pause" : undefined}
            >
              <FullscreenTopBar
                show={isCdFs}
                title="Lab Step Timer"
                onExit={() => document.exitFullscreen().catch(() => {})}
                right={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cdStartPause}
                      className="cursor-pointer rounded-lg bg-amber-500 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                    >
                      {cdRunning ? "Pause" : "Start"}
                    </button>
                    <button
                      type="button"
                      onClick={cdReset}
                      className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepeat((v) => !v)}
                      className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Repeat {repeat ? "On" : "Off"}
                    </button>
                  </div>
                }
              />

              <div
                ref={cdInnerBoxRef}
                className={[
                  "flex h-full w-full flex-col items-center justify-center",
                  isCdFs ? "px-4 pb-16 pt-16 sm:px-8" : "p-6",
                ].join(" ")}
                style={{ minHeight: isCdFs ? "100vh" : 220 }}
              >
                <div
                  className={[
                    "text-xs font-extrabold uppercase tracking-widest",
                    isCdFs ? "text-white/85" : "text-slate-700",
                  ].join(" ")}
                >
                  Step Countdown {repeat ? "· Repeat on" : ""} · {cdStatus}
                </div>

                <span
                  ref={cdTimeTextRef}
                  className={[
                    "mt-2 inline-block text-center font-mono font-extrabold",
                    isCdFs
                      ? "tracking-wide sm:tracking-widest"
                      : "tracking-widest",
                  ].join(" ")}
                  style={{
                    fontSize: `${cdFontPx}px`,
                    lineHeight: "1",
                    transform: "translateZ(0)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cdText}
                </span>

                {!isCdFs && (
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    C start/pause · R reset · T toggle repeat · F fullscreen
                  </div>
                )}
              </div>

              <FullscreenBottomBar show={isCdFs}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-white/80 sm:text-sm">
                    Tap time to start/pause · C start/pause · R reset · T repeat
                    · F fullscreen
                  </div>
                  <div className="text-xs font-semibold text-white/85">
                    {cdStatus}
                  </div>
                </div>
              </FullscreenBottomBar>
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
export default function LabTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/lab-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Lab Timer",
        url,
        description:
          "Lab timer with stopwatch + laps and a repeatable countdown for experiment steps. Fullscreen display, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Lab Timer", item: url },
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

      <section className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <LabTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Lab Timer</span>
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

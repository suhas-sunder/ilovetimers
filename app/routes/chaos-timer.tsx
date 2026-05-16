// app/routes/chaos-timer.tsx
import type { Route } from "./+types/chaos-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Random Interval Timer (Unpredictable Countdown, Fullscreen)";
  const description =
    "Free random interval timer that generates unpredictable countdowns for training, games, classrooms, and focus sessions. Optional beep each interval with a clean fullscreen display.";

  const url = "https://www.ilovetimers.com/chaos-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "random interval timer",
        "random timer",
        "random countdown timer",
        "random duration timer",
        "interval timer random",
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

function randInt(min: number, max: number) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 120, gain = 0.1) => {
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
      g.gain.value = gain;

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
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
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
   CHAOS TIMER CARD
========================================================= */
type Mode = "single" | "intervals";

function ChaosTimerCard() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("intervals");

  // Random range
  const [minSec, setMinSec] = useState(10);
  const [maxSec, setMaxSec] = useState(45);

  // Intervals
  const [intervalCount, setIntervalCount] = useState(10);

  // Options
  const [sound, setSound] = useState(true);
  const [beepEachInterval, setBeepEachInterval] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  // Timer state
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const remainingRef = useRef<number>(0);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // Session state
  const [currentInterval, setCurrentInterval] = useState(1);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [nextDurationSec, setNextDurationSec] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Refs to avoid stale state inside rAF tick
  const modeRef = useRef<Mode>(mode);
  const intervalCountRef = useRef<number>(intervalCount);
  const currentIntervalRef = useRef<number>(currentInterval);
  const nextDurationRef = useRef<number>(nextDurationSec);
  const rangeRef = useRef<{ min: number; max: number }>({
    min: minSec,
    max: maxSec,
  });
  const soundRef = useRef<boolean>(sound);
  const beepEachIntervalRef = useRef<boolean>(beepEachInterval);
  const finalCountdownBeepsRef = useRef<boolean>(finalCountdownBeeps);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    intervalCountRef.current = intervalCount;
  }, [intervalCount]);

  useEffect(() => {
    currentIntervalRef.current = currentInterval;
  }, [currentInterval]);

  useEffect(() => {
    nextDurationRef.current = nextDurationSec;
  }, [nextDurationSec]);

  useEffect(() => {
    rangeRef.current = { min: minSec, max: maxSec };
  }, [minSec, maxSec]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    beepEachIntervalRef.current = beepEachInterval;
  }, [beepEachInterval]);

  useEffect(() => {
    finalCountdownBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function normalizeRange() {
    const min = clamp(rangeRef.current.min, 1, 3600);
    const max = clamp(rangeRef.current.max, 1, 3600);
    return min <= max ? { min, max } : { min: max, max: min };
  }

  function rollDuration() {
    const { min, max } = normalizeRange();
    return randInt(min, max);
  }

  function primeFromSettings() {
    stopRaf();
    setRunning(false);
    hasStartedRef.current = false;

    const d = rollDuration();
    const preview = rollDuration();

    currentIntervalRef.current = 1;
    nextDurationRef.current = preview;

    setCurrentInterval(1);
    setCurrentDurationSec(d);
    setRemaining(d * 1000);
    setNextDurationSec(preview);

    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function resetSession() {
    primeFromSettings();
  }

  // Re-prime when core settings change
  useEffect(() => {
    primeFromSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minSec, maxSec, mode, intervalCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    // If we are at 0 (or finished), reroll fresh session first
    if (remainingRef.current <= 0) {
      const d = rollDuration();
      const preview = rollDuration();

      currentIntervalRef.current = 1;
      nextDurationRef.current = preview;

      setCurrentInterval(1);
      setCurrentDurationSec(d);
      setRemaining(d * 1000);
      setNextDurationSec(preview);
    }

    const remNow = Math.max(0, remainingRef.current);
    endRef.current = performance.now() + remNow;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + Math.max(0, remainingRef.current);
    setRunning(true);
  }

  function startPause() {
    // Prime audio context on gesture
    if (!running && soundRef.current) beep(0, 1, 0);

    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    // If never started, start fresh
    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    // If completed in intervals mode, reset to a fresh session
    if (
      modeRef.current === "intervals" &&
      currentIntervalRef.current > intervalCountRef.current
    ) {
      resetSession();
      return;
    }

    // If remaining is 0, reset and start
    if (remainingRef.current <= 0) {
      resetSession();
      startNew();
      return;
    }

    resume();
  }

  // Timer loop
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (
        soundRef.current &&
        finalCountdownBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (
          soundRef.current &&
          (beepEachIntervalRef.current || modeRef.current === "single")
        ) {
          beep(660, 160, 0.1);
        }

        if (modeRef.current === "single") {
          setRunning(false);
          hasStartedRef.current = false;
          stopRaf();
          return;
        }

        // intervals mode: advance or stop exactly at count
        const iNow = currentIntervalRef.current;
        const count = intervalCountRef.current;

        if (iNow >= count) {
          // Finished last interval
          setCurrentInterval(count + 1);
          setRunning(false);
          hasStartedRef.current = false;
          stopRaf();
          return;
        }

        const nextI = iNow + 1;
        const d =
          nextDurationRef.current > 0
            ? nextDurationRef.current
            : rollDuration();
        const preview = rollDuration();

        currentIntervalRef.current = nextI;
        nextDurationRef.current = preview;

        setCurrentInterval(nextI);
        setCurrentDurationSec(d);
        setRemaining(d * 1000);
        setNextDurationSec(preview);

        endRef.current = performance.now() + d * 1000;

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, beep]);

  const { min: normMin, max: normMax } = useMemo(() => {
    const min = clamp(minSec, 1, 3600);
    const max = clamp(maxSec, 1, 3600);
    return min <= max ? { min, max } : { min: max, max: min };
  }, [minSec, maxSec]);

  const rangeText = `${normMin}s–${normMax}s`;

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const urgent = running && remaining > 0 && remaining <= 10_000;

  const completedIntervals =
    mode === "intervals" && currentInterval > intervalCount;

  const statusLabel = !running
    ? completedIntervals
      ? "Done"
      : hasStartedRef.current
        ? "Paused"
        : "Ready"
    : mode === "intervals"
      ? "Intervals running"
      : "Random timer running";

  const displayTone = urgent
    ? "border-rose-200 bg-amber-50 text-rose-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      statusLabel,
      isFs,
      running,
      mode,
      currentInterval,
      intervalCount,
      urgent,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const progressText =
    mode === "intervals"
      ? `${Math.min(currentInterval, intervalCount)}/${intervalCount}`
      : "Single";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetSession();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      setSound((x) => !x);
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
        title="Chaos Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="accent-amber-500"
              />
              Sound
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={beepEachInterval}
                onChange={(e) => setBeepEachInterval(e.target.checked)}
                disabled={!sound || mode !== "intervals"}
                className="accent-amber-500"
              />
              Beep each interval
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={finalCountdownBeeps}
                onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              Final beeps
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetSession} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="accent-amber-500"
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={beepEachInterval}
                  onChange={(e) => setBeepEachInterval(e.target.checked)}
                  disabled={!sound || mode !== "intervals"}
                  className="accent-amber-500"
                />
                Beep each interval
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                  className="accent-amber-500"
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

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetSession}>
                Reset
              </Btn>
              <Btn
                kind="ghost"
                onClick={() => sound && beep(880, 140, 0.08)}
                disabled={!sound}
              >
                Test beep
              </Btn>
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
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
            }}
          >
            {shownTime}
          </span>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Session
              </div>
              <div className="mt-1 text-base font-extrabold text-slate-950">
                {mode === "intervals"
                  ? "Random interval timer"
                  : "Random timer"}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-700">
                Range {rangeText}
                {mode === "intervals" ? ` · Progress ${progressText}` : ""}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Interval details
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                This interval:{" "}
                <span className="font-mono font-extrabold text-slate-950">
                  {currentDurationSec}s
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Next preview:{" "}
                <span className="font-mono font-extrabold text-slate-950">
                  {nextDurationSec}s
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Tap time to start/pause in fullscreen
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">Mode</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip
                  active={mode === "single"}
                  onClick={() => setMode("single")}
                  disabled={running}
                >
                  Random timer
                </Chip>
                <Chip
                  active={mode === "intervals"}
                  onClick={() => setMode("intervals")}
                  disabled={running}
                >
                  Random interval timer
                </Chip>
              </div>

              <div className="mt-4 text-sm font-extrabold text-slate-900">
                Random range (seconds)
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Min seconds
                  <input
                    type="number"
                    min={1}
                    max={3600}
                    value={minSec}
                    disabled={running}
                    onChange={(e) =>
                      setMinSec(clamp(Number(e.target.value || 1), 1, 3600))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Max seconds
                  <input
                    type="number"
                    min={1}
                    max={3600}
                    value={maxSec}
                    disabled={running}
                    onChange={(e) =>
                      setMaxSec(clamp(Number(e.target.value || 45), 1, 3600))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                If min is greater than max, the tool swaps them automatically.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Intervals (interval mode)
              </div>

              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Intervals
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={intervalCount}
                  disabled={running || mode !== "intervals"}
                  onChange={(e) =>
                    setIntervalCount(
                      clamp(Number(e.target.value || 10), 1, 500),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={beepEachInterval}
                    onChange={(e) => setBeepEachInterval(e.target.checked)}
                    disabled={!sound || mode !== "intervals"}
                    className="accent-amber-500"
                  />
                  Beep each interval
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={finalCountdownBeeps}
                    onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                    disabled={!sound}
                    className="accent-amber-500"
                  />
                  Final beeps
                </label>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                In interval mode, the tool previews the next random duration.
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                active={mode === "single"}
                onClick={() => !running && setMode("single")}
                disabled={running}
              >
                Random timer
              </Chip>
              <Chip
                active={mode === "intervals"}
                onClick={() => !running && setMode("intervals")}
                disabled={running}
              >
                Random intervals
              </Chip>
              <div className="text-xs font-semibold text-slate-600">
                Range {rangeText}
                {mode === "intervals" ? ` · ${progressText}` : ""}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetSession}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · Space · R · F · S
              </div>
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
export default function ChaosTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/chaos-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Chaos Timer",
        url,
        description:
          "A random timer and random interval timer that generates random countdown durations for training and games, with fullscreen and optional sound.",
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
            name: "Chaos Timer",
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

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Chaos Timer (Random Interval Timer)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set a random range, then run a single random countdown or a sequence
            of random intervals. Fullscreen has a big, readable display with tap
            to start and pause.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <ChaosTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Chaos Timer</span>
        </p>
      </section>
    </main>
  );
}

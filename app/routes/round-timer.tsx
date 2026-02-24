// app/routes/round-timer.tsx
import type { Route } from "./+types/round-timer";
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Round Timer (Boxing & MMA Rounds, Fullscreen)";
  const description =
    "Run boxing and MMA rounds with a clear round timer. Set rounds and rest periods and follow a big, easy-to-read countdown built for training.";

  const url = "https://www.ilovetimers.com/round-timer";

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
 * - Only re-runs on deps changes (not every animation frame)
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

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 140, gain = 0.12) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
   ROUND TIMER CARD
========================================================= */
type Phase = "idle" | "warmup" | "work" | "rest" | "done";

type Preset = {
  label: string;
  rounds: number;
  workSec: number;
  restSec: number;
  warmupSec?: number;
};

function RoundTimerCard() {
  const beep = useBeep();

  const presets: Preset[] = useMemo(
    () => [
      {
        label: "Boxing 3×3 (1m rest)",
        rounds: 3,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 6×3 (1m rest)",
        rounds: 6,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Boxing 12×3 (1m rest)",
        rounds: 12,
        workSec: 180,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 3×5 (1m rest)",
        rounds: 3,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "MMA 5×5 (1m rest)",
        rounds: 5,
        workSec: 300,
        restSec: 60,
        warmupSec: 10,
      },
      {
        label: "Tabata-ish 8×(20/10)",
        rounds: 8,
        workSec: 20,
        restSec: 10,
        warmupSec: 10,
      },
      {
        label: "Sprints 10×(30/30)",
        rounds: 10,
        workSec: 30,
        restSec: 30,
        warmupSec: 10,
      },
    ],
    [],
  );

  const [rounds, setRounds] = useState(3);
  const [workSec, setWorkSec] = useState(180);
  const [restSec, setRestSec] = useState(60);
  const [warmupSec, setWarmupSec] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0); // 1..rounds for work phases
  const [remainingMs, setRemainingMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(0);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const phaseRef = useRef<Phase>("idle");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const pausedRef = useRef<boolean>(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const roundsRef = useRef<number>(rounds);
  const workRef = useRef<number>(workSec);
  const restRef = useRef<number>(restSec);
  useEffect(() => {
    roundsRef.current = rounds;
    workRef.current = workSec;
    restRef.current = restSec;
  }, [rounds, workSec, restSec]);

  const isRunning = phase !== "idle" && phase !== "done";
  const isActive = isRunning && !paused;

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardReset() {
    stopRaf();
    setPhase("idle");
    setPaused(false);
    setRoundIndex(0);
    setRemainingMs(0);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function applyPreset(p: Preset) {
    if (isRunning) return;
    setRounds(p.rounds);
    setWorkSec(p.workSec);
    setRestSec(p.restSec);
    setWarmupSec(p.warmupSec ?? 0);
  }

  function startNewRun() {
    stopRaf();
    lastBeepSecondRef.current = null;

    if (warmupSec > 0) {
      setPhase("warmup");
      setPaused(false);
      setRoundIndex(0);
      setRemainingMs(warmupSec * 1000);
      endRef.current = performance.now() + warmupSec * 1000;
      return;
    }

    setPhase("work");
    setPaused(false);
    setRoundIndex(1);
    setRemainingMs(workSec * 1000);
    endRef.current = performance.now() + workSec * 1000;
    if (sound) beep(520, 160, 0.12);
  }

  function pauseNow() {
    if (!isRunning || pausedRef.current) return;
    const now = performance.now();
    const rem = Math.max(0, (endRef.current ?? now) - now);
    setRemainingMs(rem);
    endRef.current = null;
    setPaused(true);
    stopRaf();
    lastBeepSecondRef.current = null;
  }

  function resumeNow() {
    if (!isRunning || !pausedRef.current) return;
    const rem = Math.max(0, remainingRef.current);
    setPaused(false);
    endRef.current = performance.now() + rem;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    if (phaseRef.current === "idle" || phaseRef.current === "done") {
      startNewRun();
      return;
    }
    if (pausedRef.current) resumeNow();
    else pauseNow();
  }

  function skip() {
    // Move to the next logical phase, respecting bounds.
    if (!isRunning) return;

    stopRaf();
    lastBeepSecondRef.current = null;
    setPaused(false);

    if (phaseRef.current === "warmup") {
      setPhase("work");
      setRoundIndex(1);
      setRemainingMs(workRef.current * 1000);
      endRef.current = performance.now() + workRef.current * 1000;
      if (sound) beep(520, 160, 0.12);
      return;
    }

    if (phaseRef.current === "work") {
      if (roundIndex >= roundsRef.current) {
        setPhase("done");
        setRemainingMs(0);
        endRef.current = null;
        if (sound) {
          beep(660, 160, 0.12);
          window.setTimeout(() => beep(880, 160, 0.12), 220);
        }
        return;
      }

      setPhase("rest");
      setRemainingMs(restRef.current * 1000);
      endRef.current = performance.now() + restRef.current * 1000;
      if (sound) beep(330, 180, 0.12);
      return;
    }

    if (phaseRef.current === "rest") {
      setPhase("work");
      setRoundIndex((r) => Math.min(roundsRef.current, r + 1));
      setRemainingMs(workRef.current * 1000);
      endRef.current = performance.now() + workRef.current * 1000;
      if (sound) beep(520, 160, 0.12);
      return;
    }
  }

  useEffect(() => {
    if (!isRunning || paused) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemainingMs(rem);

      // Final beeps (last 5s)
      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 85, 0.06);
        }
      } else if (rem > 5_000) {
        lastBeepSecondRef.current = null;
      }

      if (rem <= 0) {
        lastBeepSecondRef.current = null;

        // Phase transitions
        if (phaseRef.current === "warmup") {
          setPhase("work");
          setRoundIndex(1);
          setRemainingMs(workRef.current * 1000);
          endRef.current = performance.now() + workRef.current * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phaseRef.current === "work") {
          if (roundIndex >= roundsRef.current) {
            setPhase("done");
            setRemainingMs(0);
            endRef.current = null;
            stopRaf();
            if (sound) {
              beep(660, 160, 0.12);
              window.setTimeout(() => beep(880, 160, 0.12), 220);
            }
            return;
          }

          setPhase("rest");
          setRemainingMs(restRef.current * 1000);
          endRef.current = performance.now() + restRef.current * 1000;
          if (sound) beep(330, 180, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (phaseRef.current === "rest") {
          setPhase("work");
          setRoundIndex((r) => Math.min(roundsRef.current, r + 1));
          setRemainingMs(workRef.current * 1000);
          endRef.current = performance.now() + workRef.current * 1000;
          if (sound) beep(520, 160, 0.12);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [isRunning, paused, roundIndex, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const shownTime =
    phase === "idle"
      ? msToClock(workSec * 1000)
      : msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const statusLabel =
    phase === "idle"
      ? "Ready"
      : phase === "done"
        ? "Complete"
        : paused
          ? "Paused"
          : phase === "warmup"
            ? "Warmup"
            : phase === "work"
              ? `Round ${roundIndex} of ${rounds}`
              : "Rest";

  const phaseChip =
    phase === "work"
      ? "Work"
      : phase === "rest"
        ? "Rest"
        : phase === "warmup"
          ? "Warmup"
          : phase === "done"
            ? "Done"
            : "Ready";

  const shellClass =
    phase === "work"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : phase === "rest"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : phase === "warmup"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, phase, paused],
    minPx: 52,
    maxPx: isFs ? 560 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const canEditSettings = !isRunning; // keep settings safe: no mid-run edits

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "n") {
      skip();
    } else if (k === "r") {
      hardReset();
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
        title="Round Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {phase === "idle" || phase === "done"
                ? "Start"
                : paused
                  ? "Resume"
                  : "Pause"}
            </Btn>

            <Btn
              kind="ghost"
              onClick={skip}
              className="py-1 text-sm"
              disabled={!isRunning}
            >
              Next
            </Btn>

            <Btn kind="ghost" onClick={hardReset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Round Timer (Boxing & MMA)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Set rounds, work, rest, optional warmup, sound cues, and use a
                big fullscreen display.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
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

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border p-3 sm:p-6",
            shellClass,
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
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
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          {/* Small status strip */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {phaseChip}
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {Math.min(rounds, Math.max(phase === "idle" ? 0 : 1, roundIndex))}{" "}
              / {rounds} rounds
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {Math.round(workSec / 60)}m work · {Math.round(restSec / 60)}m
              rest
            </div>
          </div>

          {/* Fullscreen helper overlay */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Round Timer
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Tap time to start/pause · N = Next
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Presets + settings + controls (normal only) */}
        {!isFs && (
          <>
            <div className="mt-5">
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((p) => {
                  const active =
                    p.rounds === rounds &&
                    p.workSec === workSec &&
                    p.restSec === restSec &&
                    (p.warmupSec ?? 0) === warmupSec;

                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      disabled={!canEditSettings}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        active
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              <label className="block text-sm font-semibold text-slate-900">
                Rounds
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={rounds}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 60))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Round length (sec)
                <input
                  type="number"
                  min={10}
                  max={3600}
                  value={workSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setWorkSec(clamp(Number(e.target.value || 10), 10, 3600))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Rest (sec)
                <input
                  type="number"
                  min={0}
                  max={3600}
                  value={restSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 3600))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Warmup (sec)
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={warmupSec}
                  disabled={!canEditSettings}
                  onChange={(e) =>
                    setWarmupSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {phase === "idle" || phase === "done"
                    ? "Start"
                    : paused
                      ? "Resume"
                      : "Pause"}
                </Btn>

                <Btn kind="ghost" onClick={skip} disabled={!isRunning}>
                  Next
                </Btn>

                <Btn kind="ghost" onClick={hardReset}>
                  Reset
                </Btn>
              </div>

              <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · N next · R reset · F fullscreen ·
                S sound
              </div>
            </div>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen · S sound
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
export default function RoundTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/round-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Round Timer",
        url,
        description:
          "Round timer for boxing and MMA with rounds + rest, presets, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "Round Timer", item: url },
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

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <RoundTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Round Timer</span>
        </p>
      </section>
    </main>
  );
}

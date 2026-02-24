// app/routes/workout-timer.tsx
import type { Route } from "./+types/workout-timer";
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Workout Timer (Rounds & Rest, Fullscreen)";
  const description =
    "Run workouts with a simple round and rest timer. Big fullscreen countdown designed for gym training, boxing, circuits, and conditioning.";

  const url = "https://www.ilovetimers.com/workout-timer";

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
 * Fixes "slow scale-in" by computing in useLayoutEffect (before paint),
 * and by avoiding initial render at minPx.
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
  // Start large so we don't visibly grow from a tiny size.
  const [fontPx, setFontPx] = useState<number>(maxPx);

  const compute = useCallback(() => {
    const c = containerRef.current;
    const t = textRef.current;
    if (!c || !t) return;

    const rect = c.getBoundingClientRect();
    const availW = Math.max(0, rect.width - paddingAllowancePx);
    const availH = Math.max(0, rect.height - paddingAllowancePx);
    if (availW <= 0 || availH <= 0) return;

    const el = t as HTMLElement;
    const originalFontSize = el.style.fontSize;

    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      const tr = el.getBoundingClientRect();
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

    el.style.fontSize = originalFontSize;

    setFontPx((prev) => (prev === best ? prev : best));
  }, [containerRef, textRef, minPx, maxPx, paddingAllowancePx]);

  // Compute before paint so the user never sees the intermediate size.
  useLayoutEffect(() => {
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Recompute on resize/orientation/fullscreen layout changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf: number | null = null;

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

    // One more compute after listeners attach (still fast)
    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [compute, containerRef]);

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
   WORKOUT TIMER CARD (rounds + rest)
========================================================= */
type Phase = "work" | "rest";

function WorkoutTimerCard() {
  const beep = useBeep();

  // Defaults map to classic boxing rounds but work for circuits too
  const [workMin, setWorkMin] = useState(3);
  const [restMin, setRestMin] = useState(1);
  const [rounds, setRounds] = useState(3);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const workMs = useMemo(() => Math.max(0, workMin * 60 * 1000), [workMin]);
  const restMs = useMemo(() => Math.max(0, restMin * 60 * 1000), [restMin]);

  // Displayed remaining ms, updated only when the displayed second changes.
  const [shownRemainingMs, setShownRemainingMs] = useState(workMs);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingMsRef = useRef<number>(workMs);
  const shownMsRef = useRef<number>(workMs);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const workPresets = useMemo(() => [1, 2, 3, 4, 5], []);
  const restPresets = useMemo(() => [0, 0.25, 0.5, 1, 2, 3], []);
  const roundsPresets = useMemo(() => [2, 3, 4, 5, 6, 8, 10, 12], []);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const hardResetToConfig = useCallback(() => {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);
    remainingMsRef.current = workMs;
    shownMsRef.current = Math.ceil(workMs / 1000) * 1000;
    setShownRemainingMs(shownMsRef.current);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }, [workMs]);

  // Keep timer aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;
    hardResetToConfig();
  }, [workMin, restMin, rounds, running, hardResetToConfig]);

  // Main RAF loop (updates state only when shown second changes)
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Resume: if no end time, set it from current remaining
    if (!endRef.current) {
      endRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      remainingMsRef.current = rem;

      const shown = Math.ceil(rem / 1000) * 1000;
      if (shownMsRef.current !== shown) {
        shownMsRef.current = shown;
        setShownRemainingMs(shown);
      }

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) {
          if (phase === "work") beep(520, 260);
          else beep(740, 220);
        }

        // Transition rules
        if (phase === "work") {
          if (restMs > 0) {
            setPhase("rest");
            remainingMsRef.current = restMs;
            const nextShown = Math.ceil(restMs / 1000) * 1000;
            shownMsRef.current = nextShown;
            setShownRemainingMs(nextShown);
            endRef.current = performance.now() + restMs;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          if (roundIdx < rounds) {
            setRoundIdx((r) => r + 1);
            setPhase("work");
            remainingMsRef.current = workMs;
            const nextShown = Math.ceil(workMs / 1000) * 1000;
            shownMsRef.current = nextShown;
            setShownRemainingMs(nextShown);
            endRef.current = performance.now() + workMs;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          setRunning(false);
          return;
        }

        // phase === "rest"
        if (roundIdx < rounds) {
          setRoundIdx((r) => r + 1);
          setPhase("work");
          remainingMsRef.current = workMs;
          const nextShown = Math.ceil(workMs / 1000) * 1000;
          shownMsRef.current = nextShown;
          setShownRemainingMs(nextShown);
          endRef.current = performance.now() + workMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    sound,
    finalCountdownBeeps,
    beep,
    phase,
    roundIdx,
    rounds,
    workMs,
    restMs,
  ]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        // Starting or resuming
        endRef.current = performance.now() + remainingMsRef.current;
      } else {
        // Pausing
        endRef.current = null;
      }
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function reset() {
    hardResetToConfig();
  }

  function skipPhase() {
    // Works while running or paused mid-session
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (restMs > 0) {
        setPhase("rest");
        remainingMsRef.current = restMs;
      } else if (roundIdx < rounds) {
        setRoundIdx((r) => r + 1);
        setPhase("work");
        remainingMsRef.current = workMs;
      } else {
        setRunning(false);
        remainingMsRef.current = 0;
      }
    } else {
      // rest -> next work or finish
      if (roundIdx < rounds) {
        setRoundIdx((r) => r + 1);
        setPhase("work");
        remainingMsRef.current = workMs;
      } else {
        setRunning(false);
        remainingMsRef.current = 0;
      }
    }

    const nextShown = Math.ceil(remainingMsRef.current / 1000) * 1000;
    shownMsRef.current = nextShown;
    setShownRemainingMs(nextShown);

    if (running) {
      endRef.current = performance.now() + remainingMsRef.current;
    }
  }

  const shownTime = msToClock(shownRemainingMs);
  const phaseLabel = phase === "work" ? "Work" : restMs > 0 ? "Rest" : "Next";
  const statusLabel = running
    ? "Running"
    : shownRemainingMs > 0
      ? "Paused"
      : "Ready";
  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 10_000;

  // This is the fix: useFitText now computes before paint, so no slow scale-in.
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, phase, roundIdx, rounds, urgent],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const controlsLocked = running;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      skipPhase();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
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
        title="Workout Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skipPhase} className="py-1 text-sm">
              Next
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
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
                Workout Timer (Rounds + Rest)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Configure work, rest, and rounds. Start, pause, skip to next,
                reset, and go fullscreen.
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
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
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
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            urgent ? "border-rose-300 bg-rose-50" : "border-slate-200",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 300,
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
            {phaseLabel} · Round {roundIdx}/{rounds} · {statusLabel}
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

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause · N = Next · R = Reset · F = Fullscreen
                </div>
                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap time to Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings + controls (normal only) */}
        {!isFs && (
          <>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {/* Work */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Work (round)
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {workPresets.map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={controlsLocked}
                      onClick={() => setWorkMin(m)}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        controlsLocked ? "cursor-not-allowed opacity-60" : "",
                        m === workMin
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                <label className="mt-3 block text-sm font-semibold text-slate-900">
                  Custom minutes
                  <input
                    type="number"
                    min={0.25}
                    max={60}
                    step={0.25}
                    value={workMin}
                    disabled={controlsLocked}
                    onChange={(e) =>
                      setWorkMin(
                        clamp(Number(e.target.value || 0.25), 0.25, 60),
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              {/* Rest */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Rest
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {restPresets.map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={controlsLocked}
                      onClick={() => setRestMin(m)}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        controlsLocked ? "cursor-not-allowed opacity-60" : "",
                        m === restMin
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {m === 0
                        ? "0"
                        : m < 1
                          ? `${Math.round(m * 60)}s`
                          : `${m}m`}
                    </button>
                  ))}
                </div>

                <label className="mt-3 block text-sm font-semibold text-slate-900">
                  Custom minutes
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={0.25}
                    value={restMin}
                    disabled={controlsLocked}
                    onChange={(e) =>
                      setRestMin(clamp(Number(e.target.value || 0), 0, 60))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <div className="mt-2 text-xs text-slate-600">
                  Set Rest to <strong>0</strong> for back-to-back rounds.
                </div>
              </div>

              {/* Rounds */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Rounds
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {roundsPresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={controlsLocked}
                      onClick={() => setRounds(r)}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        controlsLocked ? "cursor-not-allowed opacity-60" : "",
                        r === rounds
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <label className="mt-3 block text-sm font-semibold text-slate-900">
                  Custom rounds
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={rounds}
                    disabled={controlsLocked}
                    onChange={(e) =>
                      setRounds(clamp(Number(e.target.value || 1), 1, 50))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={skipPhase}>
                  Next
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · N next · R reset · F fullscreen
              </div>
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {phaseLabel} · Round {roundIdx}/{rounds} · {statusLabel}
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
export default function WorkoutTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/workout-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Workout Timer",
        url,
        description:
          "Fullscreen workout timer for intervals and rounds. Configure work, rest, and rounds with optional sound and keyboard shortcuts.",
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
            name: "Workout Timer",
            item: url,
          },
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
          <WorkoutTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Workout Timer</span>
        </p>
      </section>
    </main>
  );
}

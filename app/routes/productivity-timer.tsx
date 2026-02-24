// app/routes/productivity-timer.tsx
import type { Route } from "./+types/productivity-timer";
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
  const title = "Productivity Timer (Focus & Deep Work, Fullscreen)";
  const description =
    "Stay focused with a simple productivity timer. Run deep work sessions, structured breaks, and focus blocks with a clear fullscreen countdown.";

  const url = "https://www.ilovetimers.com/productivity-timer";

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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * Key change for "snappy on refresh":
 * - Start big immediately (initial fontPx = maxPx) so the digits render large on first paint
 * - Then shrink only if needed, scheduled via rAF (no blocking layout effect)
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
  // Start at max so the UI is immediately readable on refresh.
  const [fontPx, setFontPx] = useState<number>(maxPx);

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

      setFontPx((prev) => (prev === best ? prev : best));
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

    // Kick once right away (next frame) so initial paint is immediate, then refine.
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

function ChipBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

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
   PRODUCTIVITY TIMER CARD
========================================================= */
type Phase = "work" | "break" | "longBreak";

function ProductivityTimerCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakEvery, setLongBreakEvery] = useState(4);

  const [loop, setLoop] = useState(true);
  const [sound, setSound] = useState(true);

  const [phase, setPhase] = useState<Phase>("work");
  const [cycleCount, setCycleCount] = useState(0);
  const [running, setRunning] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const totalMs = useMemo(() => {
    if (phase === "work") return workMin * 60 * 1000;
    if (phase === "longBreak") return longBreakMin * 60 * 1000;
    return breakMin * 60 * 1000;
  }, [phase, workMin, breakMin, longBreakMin]);

  const [remaining, setRemaining] = useState(totalMs);

  // Refs to avoid stale closures
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  const phaseRef = useRef<Phase>(phase);
  const runningRef = useRef<boolean>(running);
  const remainingRef = useRef<number>(remaining);
  const cycleCountRef = useRef<number>(cycleCount);

  const workMinRef = useRef<number>(workMin);
  const breakMinRef = useRef<number>(breakMin);
  const longBreakMinRef = useRef<number>(longBreakMin);
  const longBreakEveryRef = useRef<number>(longBreakEvery);

  const loopRef = useRef<boolean>(loop);
  const soundRef = useRef<boolean>(sound);

  // Only update UI when the displayed second changes
  const lastShownSecRef = useRef<number>(-1);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);
  useEffect(() => {
    cycleCountRef.current = cycleCount;
  }, [cycleCount]);

  useEffect(() => {
    workMinRef.current = workMin;
  }, [workMin]);
  useEffect(() => {
    breakMinRef.current = breakMin;
  }, [breakMin]);
  useEffect(() => {
    longBreakMinRef.current = longBreakMin;
  }, [longBreakMin]);
  useEffect(() => {
    longBreakEveryRef.current = longBreakEvery;
  }, [longBreakEvery]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const getDurationMsFor = useCallback((p: Phase) => {
    if (p === "work") return workMinRef.current * 60 * 1000;
    if (p === "longBreak") return longBreakMinRef.current * 60 * 1000;
    return breakMinRef.current * 60 * 1000;
  }, []);

  const applyState = useCallback(
    (next: { phase: Phase; remainingMs: number; cycleCount?: number }) => {
      phaseRef.current = next.phase;
      remainingRef.current = next.remainingMs;

      setPhase(next.phase);
      setRemaining(next.remainingMs);

      lastShownSecRef.current = Math.ceil(next.remainingMs / 1000);

      if (typeof next.cycleCount === "number") {
        cycleCountRef.current = next.cycleCount;
        setCycleCount(next.cycleCount);
      }
    },
    [],
  );

  const completePhase = useCallback(() => {
    const p = phaseRef.current;
    const loops = loopRef.current;

    endAtRef.current = null;
    runningRef.current = false;
    setRunning(false);

    if (soundRef.current) beep(660, 220);

    if (p === "work") {
      const nextCount = cycleCountRef.current + 1;
      const every = longBreakEveryRef.current;

      const shouldLong = every > 0 && nextCount % every === 0;
      const nextPhase: Phase = shouldLong ? "longBreak" : "break";
      const nextRemaining = getDurationMsFor(nextPhase);

      applyState({
        phase: nextPhase,
        remainingMs: nextRemaining,
        cycleCount: nextCount,
      });

      if (loops) {
        runningRef.current = true;
        setRunning(true);
      }
      return;
    }

    const nextPhase: Phase = "work";
    const nextRemaining = getDurationMsFor(nextPhase);
    applyState({ phase: nextPhase, remainingMs: nextRemaining });

    if (loops) {
      runningRef.current = true;
      setRunning(true);
    }
  }, [applyState, beep, getDurationMsFor]);

  // Keep remaining aligned when phase or durations change (only when not running)
  useEffect(() => {
    if (running) return;
    const next = totalMs;
    remainingRef.current = next;
    setRemaining(next);
    endAtRef.current = null;
    lastShownSecRef.current = Math.ceil(next / 1000);
  }, [totalMs, running]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endAtRef.current = null;
      return;
    }

    const now = performance.now();
    endAtRef.current = now + remainingRef.current;
    lastShownSecRef.current = Math.ceil(remainingRef.current / 1000);

    const tick = () => {
      const tNow = performance.now();
      const endAt = endAtRef.current ?? tNow;
      const rem = Math.max(0, endAt - tNow);

      if (rem <= 0) {
        remainingRef.current = 0;
        lastShownSecRef.current = 0;
        setRemaining(0);
        stopRaf();
        completePhase();
        return;
      }

      const shownSec = Math.ceil(rem / 1000);
      if (shownSec !== lastShownSecRef.current) {
        lastShownSecRef.current = shownSec;
        const snappedMs = shownSec * 1000;
        remainingRef.current = snappedMs;
        setRemaining(snappedMs);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopRaf();
    };
  }, [running, completePhase]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    stopRaf();
    endAtRef.current = null;

    runningRef.current = false;
    setRunning(false);

    cycleCountRef.current = 0;
    setCycleCount(0);

    phaseRef.current = "work";
    setPhase("work");

    const next = workMinRef.current * 60 * 1000;
    remainingRef.current = next;
    lastShownSecRef.current = Math.ceil(next / 1000);
    setRemaining(next);
  }

  function skip() {
    stopRaf();
    endAtRef.current = null;

    runningRef.current = false;
    setRunning(false);

    const p = phaseRef.current;

    if (p === "work") {
      const nextCount = cycleCountRef.current + 1;
      const every = longBreakEveryRef.current;
      const shouldLong = every > 0 && nextCount % every === 0;
      const nextPhase: Phase = shouldLong ? "longBreak" : "break";
      const nextRemaining = getDurationMsFor(nextPhase);

      applyState({
        phase: nextPhase,
        remainingMs: nextRemaining,
        cycleCount: nextCount,
      });
      return;
    }

    const nextPhase: Phase = "work";
    const nextRemaining = getDurationMsFor(nextPhase);
    applyState({ phase: nextPhase, remainingMs: nextRemaining });
  }

  const label =
    phase === "work" ? "Focus" : phase === "longBreak" ? "Long break" : "Break";

  const statusLabel = running
    ? "Running"
    : remaining < totalMs
      ? "Paused"
      : "Ready";

  const shownTime = msToClock(remaining);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      skip();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const settingsDisabled = running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Productivity Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skip} className="py-1 text-sm">
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
                Productivity Timer (Focus + Break Cycles)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Run focused work sessions with structured breaks, optional long
                breaks, fullscreen, and shortcuts.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
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
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="cursor-pointer"
                />
                Auto-advance
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

        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
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
            {label} ·{" "}
            {running ? "Running" : remaining < totalMs ? "Paused" : "Ready"}
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Controls
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Tap time to start/pause · N next · R reset · F fullscreen
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFs && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ChipBtn
                onClick={() => {
                  setWorkMin(25);
                  setBreakMin(5);
                  setLongBreakMin(15);
                  setLongBreakEvery(4);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Classic 25/5
              </ChipBtn>

              <ChipBtn
                onClick={() => {
                  setWorkMin(50);
                  setBreakMin(10);
                  setLongBreakMin(20);
                  setLongBreakEvery(3);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Deep work 50/10
              </ChipBtn>

              <ChipBtn
                onClick={() => {
                  setWorkMin(90);
                  setBreakMin(15);
                  setLongBreakMin(30);
                  setLongBreakEvery(2);
                  reset();
                }}
                disabled={settingsDisabled}
                title={settingsDisabled ? "Pause to change presets" : undefined}
              >
                Sprint 90/15
              </ChipBtn>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              <label className="block text-sm font-semibold text-slate-900">
                Focus (min)
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={workMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setWorkMin(clamp(Number(e.target.value || 1), 1, 240))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Break (min)
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={breakMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setBreakMin(clamp(Number(e.target.value || 1), 1, 120))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Long break (min)
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={longBreakMin}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setLongBreakMin(clamp(Number(e.target.value || 1), 1, 180))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Long break every
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={longBreakEvery}
                  disabled={settingsDisabled}
                  onChange={(e) =>
                    setLongBreakEvery(clamp(Number(e.target.value || 0), 0, 12))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-1 text-xs text-slate-600">
                  0 = never use long breaks
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={skip}>
                  Next
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Phase: <span className="font-extrabold">{label}</span> ·
                Completed focus sessions:{" "}
                <span className="font-extrabold">{cycleCount}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · N next · R reset · F fullscreen
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {label} ·{" "}
              {running ? "Running" : remaining < totalMs ? "Paused" : "Ready"} ·
              Completed focus sessions:{" "}
              <span className="font-extrabold">{cycleCount}</span>
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
export default function ProductivityTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/productivity-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Productivity Timer",
        url,
        description:
          "Productivity timer and focus timer online with customizable work/break cycles and fullscreen display.",
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
            name: "Productivity Timer",
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

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <ProductivityTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Productivity Timer</span>
        </p>
      </section>
    </main>
  );
}

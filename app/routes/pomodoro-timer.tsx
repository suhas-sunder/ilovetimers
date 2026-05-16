// app/routes/pomodoro-timer.tsx
import type { Route } from "./+types/pomodoro-timer";
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
import HowItWorks from "~/clients/components/alarm-timer/HowItWorks";
import Disclaimer from "~/clients/components/pomodoro-timer/Disclaimer";
import FAQ from "~/clients/components/pomodoro-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/pomodoro-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/pomodoro-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pomodoro Timer (25/5 Focus Cycles, Fullscreen)";
  const description =
    "Stay focused with a clean Pomodoro timer. Run 25/5 work and break cycles, adjust timings, and keep deep work sessions on track with a clear countdown.";

  const url = "https://www.ilovetimers.com/pomodoro-timer";

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
   POMODORO
========================================================= */
type Phase = "work" | "shortBreak" | "longBreak" | "done";

function PomodoroCard() {
  const beep = useBeep();

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [cycles, setCycles] = useState(4);

  const [useLongBreak, setUseLongBreak] = useState(true);
  const [longBreakMin, setLongBreakMin] = useState(15);

  const [autoAdvance, setAutoAdvance] = useState(true);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [phase, setPhase] = useState<Phase>("work");
  const [cycleIdx, setCycleIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const phaseRef = useRef<Phase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const runningRef = useRef<boolean>(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const workMs = useMemo(() => workMin * 60 * 1000, [workMin]);
  const shortBreakMs = useMemo(
    () => shortBreakMin * 60 * 1000,
    [shortBreakMin],
  );
  const longBreakMs = useMemo(() => longBreakMin * 60 * 1000, [longBreakMin]);

  function durFor(p: Phase) {
    if (p === "work") return workMs;
    if (p === "shortBreak") return shortBreakMs;
    if (p === "longBreak") return longBreakMs;
    return 0;
  }

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function applyDurationsReset() {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(durFor("work"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  useEffect(() => {
    applyDurationsReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMs, shortBreakMs, longBreakMs, cycles]);

  // If long break is disabled while currently in long break, end the routine cleanly.
  useEffect(() => {
    if (!useLongBreak && phaseRef.current === "longBreak") {
      setPhase("done");
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLongBreak]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 120);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        stopRaf();
        setRunning(false);
        lastBeepSecondRef.current = null;

        if (sound) {
          const freq = phaseRef.current === "work" ? 660 : 980;
          beep(freq, 180);
        }

        if (autoAdvance) {
          window.setTimeout(() => {
            advancePhase();
          }, 20);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, autoAdvance, beep]);

  function startPhase(next: Phase) {
    const d = durFor(next);
    setPhase(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    applyDurationsReset();
  }

  function startPause() {
    if (phaseRef.current === "done") {
      // Restart fresh
      setPhase("work");
      setCycleIdx(0);
      setRemaining(durFor("work"));
      endRef.current = performance.now() + durFor("work");
      lastBeepSecondRef.current = null;
      setRunning(true);
      return;
    }

    setRunning((r) => {
      const next = !r;
      if (next) {
        endRef.current = performance.now() + remainingRef.current;
      } else {
        endRef.current = null;
      }
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function advancePhase() {
    const p = phaseRef.current;

    if (p === "work") {
      const isLastWorkSession = cycleIdx + 1 >= cycles;

      if (isLastWorkSession) {
        if (useLongBreak) {
          startPhase("longBreak");
        } else {
          setPhase("done");
          setRemaining(0);
          setRunning(false);
          endRef.current = null;
          lastBeepSecondRef.current = null;
          stopRaf();
        }
        return;
      }

      startPhase("shortBreak");
      return;
    }

    if (p === "shortBreak" || p === "longBreak") {
      setCycleIdx((i) => i + 1);
      startPhase("work");
      return;
    }

    resetAll();
  }

  function skipNext() {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;
    setRunning(false);
    advancePhase();
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "n") {
      skipNext();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const phaseLabel =
    phase === "work"
      ? `Work ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
      : phase === "shortBreak"
        ? `Short break ${Math.min(cycleIdx + 1, cycles)}/${cycles}`
        : phase === "longBreak"
          ? `Long break ${cycles}/${cycles}`
          : "Complete";

  const statusLabel = running ? "Running" : remaining > 0 ? "Paused" : "Ready";

  const displayTone =
    phase === "work"
      ? "border-rose-200 bg-rose-50"
      : phase === "shortBreak"
        ? "border-emerald-200 bg-emerald-50"
        : phase === "longBreak"
          ? "border-sky-200 bg-sky-50"
          : "border-slate-200 bg-slate-50";

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, cycleIdx, cycles],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && phase === "work";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Pomodoro Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <label className="hidden sm:inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              Sound
            </label>

            <label className="hidden sm:inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
              />
              Auto
            </label>

            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : phase === "done" ? "Restart" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skipNext} className="py-1 text-sm">
              Next
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Pomodoro Timer (25/5 Focus Cycles)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Work and break cycles with clear countdown, reliable phase
                switching, fullscreen, and keyboard control.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                />
                Auto
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
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "p-3 sm:p-6",
            displayTone,
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
          <div className="flex w-full max-w-3xl flex-wrap items-baseline justify-center gap-x-6 gap-y-2 text-center">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {phase === "done" ? "Done" : phase === "work" ? "Work" : "Break"}
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {phaseLabel}
            </div>
          </div>

          <div className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              urgent ? "text-rose-950" : "",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
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
                    Tap time or Space to start/pause. N next. R reset. F
                    fullscreen.
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  {phaseLabel}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Controls + shortcuts (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : phase === "done" ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={skipNext}>
                Next →
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · N next · R reset · F fullscreen
            </div>
          </div>
        )}

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-5 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <LabeledNumberStrong
                  label="Work (minutes)"
                  value={workMin}
                  set={setWorkMin}
                  min={1}
                  max={180}
                />
                <LabeledNumberStrong
                  label="Break (minutes)"
                  value={shortBreakMin}
                  set={setShortBreakMin}
                  min={1}
                  max={60}
                />
                <LabeledNumberStrong
                  label="Cycles"
                  value={cycles}
                  set={setCycles}
                  min={1}
                  max={12}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={finalCountdownBeeps}
                    onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                    disabled={!sound}
                  />
                  Final 3-2-1 beeps
                </label>
                <span className="text-sm text-slate-600">
                  Only when Sound is on.
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="h-full rounded-2xl bg-white p-0 shadow-sm shadow-slate-200/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Long break
                  </div>

                  <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={useLongBreak}
                      onChange={(e) => setUseLongBreak(e.target.checked)}
                    />
                    After last cycle
                  </label>
                </div>

                <label className="mt-3 block text-sm font-semibold text-slate-800">
                  Minutes
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={longBreakMin}
                    onChange={(e) =>
                      setLongBreakMin(clamp(Number(e.target.value || 0), 1, 90))
                    }
                    disabled={!useLongBreak}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:opacity-60"
                  />
                </label>

                <div className="mt-3 text-sm text-slate-600">
                  Typical: 10 to 20 minutes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual-advance hint (normal only) */}
        {!isFs && !autoAdvance && remaining === 0 && phase !== "done" && (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
            Phase finished. Press <strong>Next</strong> to continue.
          </div>
        )}

        {/* Fullscreen bottom info */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen
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

function LabeledNumberStrong({
  label,
  value,
  set,
  min,
  max,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(clamp(Number(e.target.value || 0), min, max))}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
      />
    </label>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function PomodoroTimerPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/pomodoro-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pomodoro Timer",
        url,
        description:
          "Free Pomodoro timer (25/5) with customizable work/break times, cycles, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "Pomodoro Timer",
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

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <PomodoroCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Pomodoro Timer</span>
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

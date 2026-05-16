// app/routes/tabata-timer.tsx
import type { Route } from "./+types/tabata-timer";
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
  const title = "Tabata Timer (20/10 Intervals, Fullscreen)";
  const description =
    "Run classic Tabata workouts with a clear 20/10 interval timer. Big fullscreen intervals built for HIIT, conditioning, and fast-paced training.";

  const url = "https://www.ilovetimers.com/tabata-timer";

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
 * - ResizeObserver + rAF
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
   TABATA TIMER CARD
========================================================= */
type Phase = "work" | "rest";

function TabataTimerCard() {
  const beep = useBeep();

  // Defaults: 20s work / 10s rest x 8
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);
  const [running, setRunning] = useState(false);

  // Displayed remaining (snappy, second-aligned)
  const [displayRemainingMs, setDisplayRemainingMs] = useState(workSec * 1000);

  // Internal high-res timing
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(workSec * 1000);

  const lastShownMsRef = useRef<number>(workSec * 1000);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const quickWork = useMemo(() => [10, 15, 20, 30, 40, 45], []);
  const quickRest = useMemo(() => [0, 5, 10, 15, 20, 30], []);
  const quickRounds = useMemo(() => [4, 6, 8, 10, 12, 16], []);

  const totalTimeMs = useMemo(() => {
    const w = Math.max(0, workSec) * 1000;
    const r = Math.max(0, restSec) * 1000;
    const n = Math.max(1, rounds);
    return n * w + Math.max(0, n - 1) * r;
  }, [workSec, restSec, rounds]);

  const totalText = useMemo(() => {
    const totalSec = Math.round(totalTimeMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${pad2(s)}`;
  }, [totalTimeMs]);

  const statusLabel = useMemo(() => {
    if (running) return phase === "work" ? "Work" : "Rest";
    if (displayRemainingMs <= 0) return "Done";
    return phase === "work" ? "Ready" : "Ready";
  }, [running, phase, displayRemainingMs]);

  const shownTime = useMemo(
    () => msToClock(displayRemainingMs),
    [displayRemainingMs],
  );

  const progress = useMemo(() => {
    if (totalTimeMs <= 0) return 0;

    const w = Math.max(0, workSec) * 1000;
    const r = Math.max(0, restSec) * 1000;
    const n = Math.max(1, rounds);

    const currentTotal = phase === "work" ? w : r;
    const currentRemaining = clamp(
      remainingMsRef.current,
      0,
      Math.max(1, currentTotal),
    );
    const currentDone = clamp(currentTotal - currentRemaining, 0, currentTotal);

    const completedRounds = clamp(roundIdx - 1, 0, n);

    let doneBefore = completedRounds * (w + r);
    if (phase === "rest") doneBefore += w;

    const raw = doneBefore + currentDone;
    return clamp(raw / totalTimeMs, 0, 1);
  }, [
    totalTimeMs,
    workSec,
    restSec,
    rounds,
    phase,
    roundIdx,
    displayRemainingMs,
  ]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, roundIdx, rounds],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Keep aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;

    setPhase("work");
    setRoundIdx(1);

    const next = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = next;
    endRef.current = null;

    const shown = Math.ceil(next / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    lastBeepSecondRef.current = null;
  }, [workSec, restSec, rounds, running]);

  // Timer loop (snappy digits, minimal re-render)
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      remainingMsRef.current = rem;

      // Update displayed digits only when the shown second changes
      const shown = Math.ceil(rem / 1000) * 1000;
      if (shown !== lastShownMsRef.current) {
        lastShownMsRef.current = shown;
        setDisplayRemainingMs(shown);
      }

      // Final countdown beeps: 3..2..1
      if (sound && finalCountdownBeeps && rem > 0 && rem <= 3_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(900, 90);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) {
          // Work->Rest lower tone, Rest->Work higher tone
          if (phase === "work") beep(520, 240);
          else beep(760, 200);
        }

        if (phase === "work") {
          // If final work interval, finish (no mandatory rest after)
          if (roundIdx >= rounds) {
            setRunning(false);
            return;
          }

          // Go to rest
          const next = Math.max(0, Math.floor(restSec * 1000));
          setPhase("rest");
          remainingMsRef.current = next;
          endRef.current = performance.now() + next;

          const nextShown = Math.ceil(next / 1000) * 1000;
          lastShownMsRef.current = nextShown;
          setDisplayRemainingMs(nextShown);

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Rest -> next round work
        setRoundIdx((r) => Math.min(rounds, r + 1));
        setPhase("work");

        const next = Math.max(0, Math.floor(workSec * 1000));
        remainingMsRef.current = next;
        endRef.current = performance.now() + next;

        const nextShown = Math.ceil(next / 1000) * 1000;
        lastShownMsRef.current = nextShown;
        setDisplayRemainingMs(nextShown);

        rafRef.current = requestAnimationFrame(tick);
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
    workSec,
    restSec,
  ]);

  function reset() {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);

    const next = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = next;
    endRef.current = null;

    const shown = Math.ceil(next / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;

      if (next) {
        // Starting: ensure endRef aligns to current remaining
        endRef.current = performance.now() + remainingMsRef.current;
      } else {
        // Pausing: freeze remaining
        if (endRef.current) {
          const now = performance.now();
          remainingMsRef.current = Math.max(0, endRef.current - now);
        }
        endRef.current = null;
      }

      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function next() {
    // Skip to next phase/round, keep running state
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (roundIdx >= rounds) {
        setRunning(false);
        return;
      }

      setPhase("rest");
      const nextMs = Math.max(0, Math.floor(restSec * 1000));
      remainingMsRef.current = nextMs;

      const shown = Math.ceil(nextMs / 1000) * 1000;
      lastShownMsRef.current = shown;
      setDisplayRemainingMs(shown);

      if (running) endRef.current = performance.now() + nextMs;
      return;
    }

    // Rest -> next work
    setRoundIdx((r) => Math.min(rounds, r + 1));
    setPhase("work");

    const nextMs = Math.max(0, Math.floor(workSec * 1000));
    remainingMsRef.current = nextMs;

    const shown = Math.ceil(nextMs / 1000) * 1000;
    lastShownMsRef.current = shown;
    setDisplayRemainingMs(shown);

    if (running) endRef.current = performance.now() + nextMs;
  }

  function setClassic() {
    if (running) return;
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      next();
    } else if (k === "c") {
      setClassic();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 6_000;

  const headerRight = (
    <div className="flex flex-wrap items-center gap-2">
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
        onClick={() => cardRef.current && toggleFullscreen(cardRef.current)}
        className="py-2"
      >
        Fullscreen
      </Btn>
    </div>
  );

  const fsRight = (
    <div className="flex items-center gap-2">
      <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
        {running ? "Pause" : "Start"}
      </Btn>
      <Btn kind="ghost" onClick={next} className="py-1 text-sm">
        Next
      </Btn>
      <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
        Reset
      </Btn>
      <Btn
        kind="ghost"
        onClick={setClassic}
        className="py-1 text-sm"
        disabled={running}
      >
        Classic
      </Btn>
    </div>
  );

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Tabata Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={fsRight}
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Tabata Timer (20/10 Intervals)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Classic Tabata defaults (20s work, 10s rest, 8 rounds). Start,
                pause, next, reset, and fullscreen with big readable intervals.
              </p>
            </div>
            <div className="ml-auto">{headerRight}</div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            urgent
              ? "border-rose-300 bg-rose-50"
              : phase === "work"
                ? "border-amber-200"
                : "border-slate-200",
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
            {phase === "work" ? "Work" : "Rest"} · Round {roundIdx}/{rounds} ·
            Total {totalText} · {statusLabel}
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

          {/* Progress */}
          <div className="mt-4 w-full max-w-3xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-center text-xs font-semibold text-slate-600">
              Space start/pause · N next · R reset · F fullscreen · C classic
            </div>
          </div>
        </div>
        {/* Config (normal only) */}
        {!isFs && (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Work (seconds)
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickWork.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !running && setWorkSec(s)}
                    disabled={running}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      s === workSec
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Custom
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={workSec}
                  disabled={running}
                  onChange={(e) =>
                    setWorkSec(clamp(Number(e.target.value || 5), 5, 600))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Rest (seconds)
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickRest.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !running && setRestSec(s)}
                    disabled={running}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      s === restSec
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Custom
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={restSec}
                  disabled={running}
                  onChange={(e) =>
                    setRestSec(clamp(Number(e.target.value || 0), 0, 600))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
              <div className="mt-2 text-xs text-slate-600">
                Tabata default rest is <strong>10s</strong>.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Rounds
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickRounds.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => !running && setRounds(r)}
                    disabled={running}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      r === rounds
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Custom
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  disabled={running}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 50))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>
              <div className="mt-2 text-xs text-slate-600">
                Total (no rest after last work): <strong>{totalText}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Actions (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={reset}>
              Reset
            </Btn>
            <Btn kind="ghost" onClick={next}>
              Next
            </Btn>
            <Btn kind="ghost" onClick={setClassic} disabled={running}>
              Classic 20/10 × 8
            </Btn>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · N next · R reset · F fullscreen · C
              classic
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {phase === "work" ? "Work" : "Rest"} · Round {roundIdx}/{rounds}
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
export default function TabataTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/tabata-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tabata Timer",
        url,
        description:
          "Tabata timer with classic 20 seconds work and 10 seconds rest for 8 rounds. Fullscreen intervals, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Tabata Timer", item: url },
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
          <TabataTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Tabata Timer</span>
        </p>
      </section>
    </main>
  );
}

// app/routes/hiit-timer.tsx
import type { Route } from "./+types/hiit-timer";
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
import HowItWorks from "~/clients/components/hiit-timer/HowItWorks";
import Disclaimer from "~/clients/components/hiit-timer/Disclaimer";
import FAQ from "~/clients/components/hiit-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/hiit-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/hiit-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "HIIT Timer (Interval Timer for Work & Rest, Tabata)";
  const description =
    "Free HIIT and interval timer with warmup, work, rest, rounds, and cooldown. Includes Tabata presets, sound cues, skip/next controls, fullscreen mode, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/hiit-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "hiit timer",
        "interval timer",
        "tabata timer",
        "work rest timer",
        "workout interval timer",
        "circuit timer",
        "boxing round timer",
        "online interval timer",
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
 * Uses ResizeObserver + rAF and binary search.
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

function LabeledNumber({
  label,
  value,
  set,
  min,
  max,
  suffix,
  hint,
  disabled,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
  suffix?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-900">
      <div className="flex items-baseline gap-2">
        <span className="min-w-0">
          {label}{" "}
          {suffix ? <span className="text-slate-600">{suffix}</span> : null}
        </span>
      </div>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => set(clamp(Number(e.target.value || 0), min, max))}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {hint ? (
        <div className="mt-1 text-xs font-medium text-slate-600">{hint}</div>
      ) : null}
    </label>
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
   HIIT / INTERVAL TIMER
========================================================= */
type Step = "warmup" | "work" | "rest" | "cooldown" | "done";

function HIITCard() {
  const beep = useBeep();

  // Defaults
  const [warmSec, setWarmSec] = useState(30);
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [coolSec, setCoolSec] = useState(30);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [step, setStep] = useState<Step>("warmup");
  const [roundIdx, setRoundIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(warmSec * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const stepRef = useRef<Step>(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const roundIdxRef = useRef<number>(roundIdx);
  useEffect(() => {
    roundIdxRef.current = roundIdx;
  }, [roundIdx]);

  const warmMs = useMemo(() => warmSec * 1000, [warmSec]);
  const workMs = useMemo(() => workSec * 1000, [workSec]);
  const restMs = useMemo(() => restSec * 1000, [restSec]);
  const coolMs = useMemo(() => coolSec * 1000, [coolSec]);

  function durFor(s: Step) {
    if (s === "warmup") return warmMs;
    if (s === "work") return workMs;
    if (s === "rest") return restMs;
    if (s === "cooldown") return coolMs;
    return 0;
  }

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Reset predictably when settings change
  useEffect(() => {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warmMs, workMs, restMs, coolMs, rounds]);

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

      if (
        sound &&
        finalCountdownBeeps &&
        stepRef.current === "work" &&
        rem > 0 &&
        rem <= 3_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 120);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;

        if (sound) {
          const s = stepRef.current;
          const freq = s === "work" ? 660 : 980;
          beep(freq, 180);
        }

        window.setTimeout(() => advanceStep(), 20);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, beep]);

  function startStep(next: Step) {
    const d = durFor(next);
    setStep(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    lastBeepSecondRef.current = null;
    setRunning(true);
  }

  function resetAll() {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    setRemaining(durFor("warmup"));
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function startPause() {
    const s = stepRef.current;

    if (s === "done") {
      resetAll();
      setRunning(true);
      endRef.current = performance.now() + durFor("warmup");
      return;
    }

    if (durFor(s) === 0) {
      skipNext();
      return;
    }

    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function advanceStep() {
    const s = stepRef.current;
    const r = roundIdxRef.current;

    if (s === "warmup") {
      setRoundIdx(0);
      startStep("work");
      return;
    }

    if (s === "work") {
      if (restMs > 0) {
        startStep("rest");
        return;
      }
      const next = r + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    if (s === "rest") {
      const next = r + 1;
      if (next < rounds) {
        setRoundIdx(next);
        startStep("work");
      } else {
        startStep("cooldown");
      }
      return;
    }

    if (s === "cooldown") {
      setStep("done");
      setRemaining(0);
      setRunning(false);
      endRef.current = null;
      stopRaf();
      return;
    }

    resetAll();
  }

  function skipNext() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    advanceStep();
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
    step === "warmup"
      ? "Warm-up"
      : step === "work"
        ? "Work"
        : step === "rest"
          ? "Rest"
          : step === "cooldown"
            ? "Cool-down"
            : "Complete";

  const roundLabel =
    step === "work" || step === "rest"
      ? `Round ${Math.min(roundIdx + 1, rounds)}/${rounds}`
      : step === "warmup"
        ? "Get ready"
        : step === "cooldown"
          ? "Finish"
          : "Done";

  const statusLabel =
    step === "done"
      ? "Done"
      : running
        ? "Running"
        : remaining > 0
          ? "Paused"
          : "Ready";

  const timeText =
    step === "done" ? "0:00" : msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, running, step, roundIdx, rounds],
    minPx: 64,
    maxPx: isFs ? 560 : 360,
    paddingAllowancePx: isFs ? 56 : 72,
  });

  const urgent =
    running && remaining > 0 && remaining <= 10_000 && step === "work";

  const phaseChip =
    step === "work"
      ? "bg-rose-50 text-rose-900 border-rose-200"
      : step === "rest"
        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
        : step === "warmup"
          ? "bg-amber-50 text-amber-900 border-amber-200"
          : step === "cooldown"
            ? "bg-sky-50 text-sky-900 border-sky-200"
            : "bg-slate-50 text-slate-700 border-slate-200";

  function applyTabata() {
    setWarmSec(0);
    setWorkSec(20);
    setRestSec(10);
    setRounds(8);
    setCoolSec(0);
  }

  function applyIntervals() {
    setWarmSec(30);
    setWorkSec(40);
    setRestSec(20);
    setRounds(10);
    setCoolSec(30);
  }

  function applyBoxing() {
    setWarmSec(0);
    setWorkSec(180);
    setRestSec(60);
    setRounds(6);
    setCoolSec(0);
  }

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="HIIT Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : step === "done" ? "Restart" : "Start"}
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

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                HIIT Timer (Intervals: Warm-up, Work, Rest, Rounds, Cool-down)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Set intervals, run rounds, skip next, toggle sound cues, and go
                fullscreen.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Sound
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

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-12">
            {/* Settings */}
            <div className="lg:col-span-9">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <LabeledNumber
                    label="Warm-up"
                    suffix="(sec)"
                    value={warmSec}
                    set={setWarmSec}
                    min={0}
                    max={600}
                    hint="0 = skip"
                  />
                  <LabeledNumber
                    label="Work"
                    suffix="(sec)"
                    value={workSec}
                    set={setWorkSec}
                    min={1}
                    max={600}
                  />
                  <LabeledNumber
                    label="Rest"
                    suffix="(sec)"
                    value={restSec}
                    set={setRestSec}
                    min={0}
                    max={600}
                    hint="0 = none"
                  />
                  <LabeledNumber
                    label="Rounds"
                    value={rounds}
                    set={setRounds}
                    min={1}
                    max={50}
                  />
                  <LabeledNumber
                    label="Cool-down"
                    suffix="(sec)"
                    value={coolSec}
                    set={setCoolSec}
                    min={0}
                    max={600}
                    hint="0 = skip"
                  />

                  {/* Final beeps spans full row */}
                  <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-900">
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          checked={finalCountdownBeeps}
                          onChange={(e) =>
                            setFinalCountdownBeeps(e.target.checked)
                          }
                          disabled={!sound}
                        />
                        Final 3-2-1 beeps (work only)
                      </label>
                      <span className="text-sm text-slate-600">
                        Only when Sound is on.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="lg:col-span-3">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-extrabold text-sky-700 uppercase tracking-wide">
                  Quick presets
                </div>

                <div className="mt-3 grid gap-2">
                  <Btn
                    kind="ghost"
                    onClick={applyTabata}
                    className="justify-center"
                  >
                    Tabata 20/10 × 8
                  </Btn>
                  <Btn
                    kind="ghost"
                    onClick={applyIntervals}
                    className="justify-center"
                  >
                    Intervals 40/20 × 10
                  </Btn>
                  <Btn
                    kind="ghost"
                    onClick={applyBoxing}
                    className="justify-center"
                  >
                    Boxing 3:00/1:00 × 6
                  </Btn>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Presets load values. Press <strong>Start</strong> when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-950 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 260,
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-widest",
                  phaseChip,
                ].join(" ")}
              >
                {phaseLabel}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                {roundLabel}
              </span>
            </div>

            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
              {statusLabel}
            </div>
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-4 inline-block text-center font-mono font-extrabold tracking-widest",
              urgent ? "text-rose-900" : "text-slate-950",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
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

                <div className="hidden sm:flex items-center gap-2">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    Space = Start/Pause
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    N = Next
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Btn onClick={startPause}>
                {running ? "Pause" : step === "done" ? "Restart" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
              <Btn kind="ghost" onClick={skipNext}>
                Next →
              </Btn>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · N next · F fullscreen
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
export default function HIITTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/hiit-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "HIIT Timer",
        url,
        description:
          "Free HIIT / interval timer with warmup, work, rest, rounds, cooldown, skip/next, sound alerts, fullscreen, and keyboard shortcuts.",
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
            name: "HIIT Timer",
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
          <HIITCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">HIIT Timer</span>
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

import type { Route } from "./+types/home";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "I Love Timers | Free Countdown Timer, Stopwatch with Laps, Pomodoro, and HIIT Interval Timers";
  const description =
    "Use accurate, fast, mobile-friendly timers: a countdown timer with presets, a millisecond stopwatch with laps, a Pomodoro focus timer, and a HIIT / interval timer. Keyboard shortcuts, fullscreen, and sound. No sign-up.";
  const url = "https://ilovetimers.com/";
  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "countdown timer",
        "online stopwatch",
        "stopwatch laps",
        "pomodoro timer",
        "25 5 timer",
        "interval timer",
        "HIIT timer",
        "workout timer",
        "presentation timer",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `${url}og-image.jpg` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" }, // warm amber
  ];
}

/* =========================================================
   LOADER
========================================================= */
export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS (formatting, sound, fullscreen)
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
const pad2 = (n: number) => n.toString().padStart(2, "0");
function msToClock(ms: number) {
  const neg = ms < 0;
  const t = Math.max(0, Math.floor(Math.abs(ms)));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const prefix = neg ? "-" : "";
  return h > 0
    ? `${prefix}${h}:${pad2(m)}:${pad2(sec)}`
    : `${prefix}${m}:${pad2(sec)}`;
}
function msToClockMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const cs = Math.floor((ms % 1000) / 10); // centiseconds
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
}

// WebAudio beep (single oscillator, short)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);
  return (freq = 880, duration = 160) => {
    try {
      const ctx = (ctxRef.current ??= new (window.AudioContext ||
        (window as any).webkitAudioContext)());
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0.1;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, duration);
    } catch {
      // ignore (auto-play restrictions, etc.)
    }
  };
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

/* =========================================================
   LIGHTWEIGHT UI PRIMITIVES
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
    className={`rounded-2xl border border-amber-200 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
  >
    {children}
  </div>
);

const Chip = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3 py-1 text-sm transition ${
      active
        ? "bg-amber-600 text-white hover:bg-amber-700"
        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
    }`}
  >
    {children}
  </button>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={
      kind === "solid"
        ? `rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 ${className}`
        : `rounded-lg bg-amber-100 px-4 py-2 font-medium text-amber-900 hover:bg-amber-200 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   COUNTDOWN TIMER
   - Presets reset safely to idle
   - Accurate ticking via rAF delta
   - Keyboard: Space (start/pause), R (reset), F (fullscreen)
========================================================= */
function CountdownTimer() {
  const beep = useBeep();
  const presets = useMemo(
    () => [
      1,
      2,
      3,
      5,
      10,
      15,
      20,
      25,
      30,
      45,
      60, // minutes
    ],
    []
  );

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle"
  );
  const [loop, setLoop] = useState(false);
  const [sound, setSound] = useState(true);
  const [inputStr, setInputStr] = useState("05:00");
  const displayRef = useRef<HTMLDivElement>(null);

  // keep input mirrored
  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  // ticking
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    if (status !== "running") {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const delta = ts - lastTsRef.current;
      lastTsRef.current = ts;

      setRemainingMs((prev) => {
        const next = Math.max(0, prev - delta);
        if (next === 0) {
          // finish
          if (sound) beep();
          if (loop) {
            return durationMs; // restart
          } else {
            setStatus("done");
            return 0;
          }
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = 0;
    };
  }, [status, durationMs, loop, sound, beep]);

  function safeReset(to?: number) {
    const ms = to ?? durationMs;
    setDurationMs(ms);
    setRemainingMs(ms);
    setStatus("idle");
  }

  function parseInputToMs(str: string) {
    // Accept "mm:ss", "m:ss", "sss" (seconds), "m" (minutes), "hh:mm:ss"
    const parts = str
      .trim()
      .split(":")
      .map((p) => p.trim());
    let ms = 0;
    if (parts.length === 1) {
      const n = Number(parts[0] || "0");
      // interpret 90 as seconds if < 100, else minutes if looks like minutes value typed without colon
      ms = (n >= 100 ? n : n) * 1000; // treat as seconds
      if (n >= 10) {
        // e.g., 500 -> 500 sec; 5 -> 5 sec (explicit)
      }
    } else if (parts.length === 2) {
      const m = Number(parts[0] || "0");
      const s = Number(parts[1] || "0");
      ms = (m * 60 + s) * 1000;
    } else {
      const h = Number(parts[0] || "0");
      const m = Number(parts[1] || "0");
      const s = Number(parts[2] || "0");
      ms = (h * 3600 + m * 60 + s) * 1000;
    }
    return clamp(ms, 0, 24 * 3600 * 1000);
  }

  function onSet() {
    const ms = parseInputToMs(inputStr);
    safeReset(ms);
  }

  function onPreset(min: number) {
    safeReset(min * 60 * 1000);
  }

  function onStartPause() {
    if (status === "running") {
      setStatus("paused");
      return;
    }
    if (remainingMs <= 0) {
      // restart
      setRemainingMs(durationMs);
    }
    setStatus("running");
  }

  function onReset() {
    safeReset();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (e.key.toLowerCase() === "r") {
      onReset();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  }

  const done = status === "done";

  return (
    <Card
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="col-span-2 lg:col-span-1"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-900">
          Countdown Timer
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            Loop
          </label>
          <Btn
            kind="ghost"
            onClick={() =>
              displayRef.current && toggleFullscreen(displayRef.current)
            }
            className="py-1"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div
        ref={displayRef}
        className={`mt-3 flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-8xl font-mono font-extrabold tracking-widest text-amber-900`}
        style={{ minHeight: 140 }}
        aria-live="polite"
      >
        {msToClock(remainingMs)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {presets.map((m) => (
          <Chip
            key={m}
            active={durationMs === m * 60 * 1000 && status !== "running"}
            onClick={() => onPreset(m)}
          >
            {m}m
          </Chip>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={inputStr}
            onChange={(e) => {
              if (status === "running") setStatus("paused");
              setInputStr(e.target.value);
            }}
            onBlur={onSet}
            placeholder="mm:ss or ss"
            className="w-full rounded-lg border border-amber-300 px-3 py-2 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Btn kind="ghost" onClick={onSet}>
            Set
          </Btn>
        </div>
        <Btn onClick={onStartPause}>
          {status === "running" ? "Pause" : "Start"}
        </Btn>
        <Btn kind="ghost" onClick={onReset}>
          Reset
        </Btn>
      </div>

      {done && (
        <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
          Time’s up! Press Start to run again or pick a preset.
        </div>
      )}

      <p className="mt-3 text-xs text-amber-700">
        Shortcuts: <strong>Space</strong> start/pause • <strong>R</strong> reset
        • <strong>F</strong> fullscreen (when this card is focused).
      </p>
    </Card>
  );
}

/* =========================================================
   STOPWATCH (with laps)
   - rAF timing, millisecond precision display (centiseconds)
   - Laps accumulate with split
========================================================= */
function StopwatchCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const [laps, setLaps] = useState<number[]>([]);
  const baseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const delta = ts - lastRef.current;
      lastRef.current = ts;
      setElapsed((v) => v + delta);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
    };
  }, [running]);

  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    baseRef.current = 0;
  }
  function lap() {
    if (!running && elapsed === 0) return;
    setLaps((xs) => [...xs, elapsed - (xs.length ? xs[xs.length - 1] : 0)]);
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "l") {
      lap();
    }
  }

  const total = msToClockMs(elapsed);
  const lapTotals = laps.reduce(
    (acc, l, i) => acc.concat([(acc[i - 1] ?? 0) + l]),
    [] as number[]
  );

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <h3 className="text-lg font-semibold text-amber-900">Stopwatch</h3>
      <div
        className="mt-3 flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-6xl font-mono font-extrabold tracking-widest text-amber-900"
        style={{ minHeight: 110 }}
        aria-live="polite"
      >
        {total}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Btn onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Btn>
        <Btn kind="ghost" onClick={reset}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={lap}>
          Lap
        </Btn>
      </div>

      {laps.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-amber-900">
                <th className="py-1 text-left">#</th>
                <th className="py-1 text-left">Lap</th>
                <th className="py-1 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((l, i) => (
                <tr key={i} className="border-t border-amber-100">
                  <td className="py-1">Lap {i + 1}</td>
                  <td className="py-1">{msToClockMs(l)}</td>
                  <td className="py-1">{msToClockMs(lapTotals[i] ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-amber-700">
        Shortcuts: <strong>Space</strong> start/pause • <strong>R</strong> reset
        • <strong>L</strong> lap (when this card is focused).
      </p>
    </Card>
  );
}

/* =========================================================
   POMODORO (25/5 default, configurable, cycles, next)
========================================================= */
function PomodoroCard() {
  const beep = useBeep();
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [cycles, setCycles] = useState(4);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);
  const [cycleIdx, setCycleIdx] = useState(0); // completed work sessions
  const [running, setRunning] = useState(false);

  // when inputs change, pause + rebase remaining to current phase
  useEffect(() => {
    setRunning(false);
    setRemaining((phase === "work" ? workMin : breakMin) * 60 * 1000);
  }, [workMin, breakMin, phase]);

  // tick
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  useEffect(() => {
    if (!running) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      return;
    }
    const step = (ts: number) => {
      if (!last.current) last.current = ts;
      const d = ts - last.current;
      last.current = ts;
      setRemaining((v) => {
        const n = Math.max(0, v - d);
        if (n === 0) {
          beep();
          // advance
          if (phase === "work") {
            setPhase("break");
            return breakMin * 60 * 1000;
          } else {
            const doneWork = cycleIdx + 1;
            setCycleIdx(doneWork);
            if (doneWork >= cycles) {
              setRunning(false);
              return 0;
            } else {
              setPhase("work");
              return workMin * 60 * 1000;
            }
          }
        }
        return n;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = 0;
    };
  }, [running, phase, workMin, breakMin, cycles, cycleIdx, beep]);

  function resetAll() {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    setRemaining(workMin * 60 * 1000);
  }

  function nextPhase() {
    setRunning(false);
    setRemaining((phase === "work" ? breakMin : workMin) * 60 * 1000);
    setPhase((p) => (p === "work" ? "break" : "work"));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "n") {
      nextPhase();
    }
  }

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <h3 className="text-lg font-semibold text-amber-900">
        Pomodoro Focus Timer
      </h3>
      <div className="mt-1 text-sm text-amber-700">
        25/5 default • configurable • auto-advance
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-amber-900">Work (min)</span>
          <input
            type="number"
            min={1}
            max={180}
            value={workMin}
            onChange={(e) =>
              setWorkMin(clamp(Number(e.target.value || 0), 1, 180))
            }
            className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-amber-900">Break (min)</span>
          <input
            type="number"
            min={1}
            max={60}
            value={breakMin}
            onChange={(e) =>
              setBreakMin(clamp(Number(e.target.value || 0), 1, 60))
            }
            className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-amber-900">Cycles</span>
          <input
            type="number"
            min={1}
            max={12}
            value={cycles}
            onChange={(e) =>
              setCycles(clamp(Number(e.target.value || 0), 1, 12))
            }
            className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2"
          />
        </label>
      </div>

      <div
        className={`mt-4 flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-6xl font-mono font-extrabold tracking-widest ${
          phase === "work" ? "text-amber-900" : "text-emerald-800"
        }`}
        style={{ minHeight: 110 }}
        aria-live="polite"
      >
        {msToClock(remaining)}
      </div>
      <div className="mt-2 text-sm text-amber-900">
        Phase: <strong>{phase === "work" ? "Work" : "Break"}</strong> •{" "}
        {cycleIdx}/{cycles} cycles completed
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Btn onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Btn>
        <Btn kind="ghost" onClick={resetAll}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={nextPhase}>
          Switch Phase
        </Btn>
      </div>

      <p className="mt-3 text-xs text-amber-700">
        Shortcuts: <strong>Space</strong> start/pause • <strong>R</strong> reset
        • <strong>N</strong> next phase (when this card is focused).
      </p>
    </Card>
  );
}

/* =========================================================
   HIIT / INTERVAL TIMER
   - Warm-up → (Work/Rest × Rounds) → Cooldown
   - Skip step, next, safe edits
========================================================= */
type StepName = "warmup" | "work" | "rest" | "cooldown" | "done";
function HIITCard() {
  const beep = useBeep();
  const [warm, setWarm] = useState(30);
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [cool, setCool] = useState(30);

  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<StepName>("warmup");
  const [roundIdx, setRoundIdx] = useState(0);
  const [remaining, setRemaining] = useState(warm * 1000);

  // rebasing on input change
  useEffect(() => {
    setRunning(false);
    const ms =
      step === "warmup"
        ? warm * 1000
        : step === "work"
          ? work * 1000
          : step === "rest"
            ? rest * 1000
            : step === "cooldown"
              ? cool * 1000
              : 0;
    setRemaining(ms);
  }, [warm, work, rest, cool, step]);

  const raf = useRef<number | null>(null);
  const last = useRef(0);
  useEffect(() => {
    if (!running) {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      return;
    }
    const stepFn = (ts: number) => {
      if (!last.current) last.current = ts;
      const d = ts - last.current;
      last.current = ts;
      setRemaining((v) => {
        const n = Math.max(0, v - d);
        if (n === 0) {
          beep();
          advance();
          return 0; // will be rebased in advance()
        }
        return n;
      });
      raf.current = requestAnimationFrame(stepFn);
    };
    raf.current = requestAnimationFrame(stepFn);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]); // advance() closes over latest state via setters

  function rebase(to: StepName, nextRoundIdx = roundIdx) {
    setStep(to);
    setRoundIdx(nextRoundIdx);
    const ms =
      to === "warmup"
        ? warm * 1000
        : to === "work"
          ? work * 1000
          : to === "rest"
            ? rest * 1000
            : to === "cooldown"
              ? cool * 1000
              : 0;
    setRemaining(ms);
  }

  function advance() {
    setRunning(false);
    setTimeout(() => {
      setRunning(true);
    }, 0);

    if (step === "warmup") {
      rebase(rounds > 0 ? "work" : "cooldown", 0);
      return;
    }
    if (step === "work") {
      if (rounds <= 0) {
        rebase("cooldown", roundIdx);
        return;
      }
      // next rest
      rebase("rest", roundIdx);
      return;
    }
    if (step === "rest") {
      const next = roundIdx + 1;
      if (next >= rounds) {
        rebase("cooldown", next);
      } else {
        rebase("work", next);
      }
      return;
    }
    if (step === "cooldown") {
      setRunning(false);
      setStep("done");
      setRemaining(0);
      return;
    }
  }

  function resetAll() {
    setRunning(false);
    rebase("warmup", 0);
  }

  function skip() {
    setRunning(false);
    if (step === "warmup") rebase("work", 0);
    else if (step === "work") rebase("rest", roundIdx);
    else if (step === "rest") {
      const next = roundIdx + 1;
      if (next >= rounds) rebase("cooldown", next);
      else rebase("work", next);
    } else if (step === "cooldown") {
      setStep("done");
      setRemaining(0);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "n") {
      skip();
    }
  }

  const phaseLabel =
    step === "warmup"
      ? "Warm-up"
      : step === "work"
        ? `Work ${roundIdx + 1}/${rounds}`
        : step === "rest"
          ? `Rest ${roundIdx + 1}/${rounds}`
          : step === "cooldown"
            ? "Cool-down"
            : "Done";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <h3 className="text-lg font-semibold text-amber-900">
        HIIT / Interval Timer
      </h3>
      <div className="mt-1 text-sm text-amber-700">
        Custom warm-up, work/rest rounds, and cool-down
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        <LabeledNumber
          label="Warm-up (s)"
          value={warm}
          set={setWarm}
          max={600}
        />
        <LabeledNumber label="Work (s)" value={work} set={setWork} max={600} />
        <LabeledNumber label="Rest (s)" value={rest} set={setRest} max={600} />
        <LabeledNumber label="Rounds" value={rounds} set={setRounds} max={50} />
        <LabeledNumber
          label="Cool-down (s)"
          value={cool}
          set={setCool}
          max={600}
        />
      </div>

      <div
        className={`mt-4 flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-5xl font-mono font-extrabold tracking-widest text-amber-900`}
        style={{ minHeight: 100 }}
        aria-live="polite"
      >
        {msToClock(remaining)}
      </div>
      <div className="mt-2 text-sm text-amber-900">
        Phase: <strong>{phaseLabel}</strong>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Btn onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Btn>
        <Btn kind="ghost" onClick={resetAll}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={skip}>
          Skip →
        </Btn>
      </div>

      <p className="mt-3 text-xs text-amber-700">
        Shortcuts: <strong>Space</strong> start/pause • <strong>R</strong> reset
        • <strong>N</strong> skip (when this card is focused).
      </p>
    </Card>
  );
}

function LabeledNumber({
  label,
  value,
  set,
  max,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  max: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-amber-900">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => set(clamp(Number(e.target.value || 0), 0, max))}
        className="mt-1 w-full rounded-lg border border-amber-300 px-3 py-2"
      />
    </label>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function Home({ loaderData: { nowISO } }: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "I Love Timers",
        url: "https://ilovetimers.com/",
        description:
          "Free online countdown, stopwatch with laps, Pomodoro, and HIIT interval timers. Accurate, mobile-friendly, and fast.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Are these timers accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Timers use requestAnimationFrame with delta-time correction to minimize drift and remain accurate across pauses and background tabs.",
            },
          },
          {
            "@type": "Question",
            name: "Do timers keep working if I switch tabs or lock my phone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "They continue tracking and catch up on the next animation frame. For presentations or workouts, you can also enable fullscreen for better visibility.",
            },
          },
          {
            "@type": "Question",
            name: "Are there keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Focus any card then use Space to start/pause, R to reset, F to fullscreen (countdown), L for lap (stopwatch), and N for next/skip (Pomodoro/HIIT).",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-amber-200 bg-amber-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            ⏱ I Love Timers
          </h1>
          <nav className="hidden gap-4 text-sm font-medium sm:flex">
            <a href="#countdown" className="hover:underline">
              Countdown
            </a>
            <a href="#stopwatch" className="hover:underline">
              Stopwatch
            </a>
            <a href="#pomodoro" className="hover:underline">
              Pomodoro
            </a>
            <a href="#hiit" className="hover:underline">
              HIIT
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-200 bg-amber-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Free Online Timers - Simple, Accurate, Instant
          </h2>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Countdown presets, a stopwatch with laps, Pomodoro focus cycles, and
            HIIT intervals - all on one fast page.
            <span className="ml-2 text-sm">
              Last updated {new Date(nowISO).toLocaleDateString()}
            </span>
          </p>
        </div>
      </section>

      {/* Timers Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div id="countdown">
            <CountdownTimer />
          </div>
          <div id="stopwatch">
            <StopwatchCard />
          </div>
          <div id="pomodoro">
            <PomodoroCard />
          </div>
          <div id="hiit">
            <HIITCard />
          </div>
        </div>
      </section>

      {/* SEO text (compact) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Timers for Every Task</h3>
          <p className="mt-2 text-amber-800">
            A <strong>countdown timer</strong> is best for presentations,
            classrooms, exams, and cooking. The <strong>stopwatch</strong>{" "}
            tracks training splits and sprints with <em>laps</em>. The{" "}
            <strong>Pomodoro timer</strong> structures deep work into focused
            blocks with short, refreshing breaks. For workouts, our{" "}
            <strong>HIIT interval timer</strong> cycles through warm-up,
            work/rest rounds, and cool-down.
          </p>
          <p className="mt-2 text-amber-800">
            Everything runs in your browser, works offline after loading, and
            uses a high-contrast display for projectors and mobile screens. No
            sign-up - just press Start.
          </p>
        </div>
      </section>

      {/* =========================================================
    EXTRA SEO-RICH SECTIONS (place above FAQ)
========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-amber-800">
        {/* 1. Everyday Timer Uses */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Everyday Countdown Uses
          </h3>
          <p className="mt-2">
            Our <strong>online countdown timer</strong> helps you manage
            everything from
            <em>
              {" "}
              classroom quizzes, cooking pasta, meditation sessions, speeches,
              livestream segments, exam practice, brewing coffee, and power naps
            </em>
            . Large digits, one-click presets and sound alerts make it easy to
            glance at the screen even on a projector or phone in the kitchen.
          </p>
        </article>

        {/* 2. Workout & HIIT */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Workout & HIIT Interval Training
          </h3>
          <p className="mt-2">
            Fitness fans use the <strong>HIIT / interval timer</strong> for
            Tabata, circuit training, treadmill sprints, rowing, and boxing
            rounds. Configure{" "}
            <em>warm-up, work / rest splits, rounds, and cool-down</em> without
            downloading an app. Keyboard shortcuts let trainers advance or skip
            a phase mid-session while the big clock stays visible on TVs or
            mirrors.
          </p>
        </article>

        {/* 3. Study & Pomodoro */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Pomodoro for Focus & Study
          </h3>
          <p className="mt-2">
            Students and remote workers rely on the built-in{" "}
            <strong>Pomodoro timer</strong>
            (25 minutes work / 5 minutes break by default) to improve focus,
            beat procrastination and reduce screen fatigue. Adjust work or break
            length, run multiple cycles, and use the <em>
              auto-switch phase
            </em>{" "}
            to keep momentum.
          </p>
        </article>

        {/* 4. Precise Stopwatch for Sports */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Precision Stopwatch with Laps
          </h3>
          <p className="mt-2">
            The <strong>online stopwatch</strong> records{" "}
            <em>millisecond-level</em>
            lap splits for track sprints, swim intervals, speed-cubing, robotics
            contests, or science experiments. Export lap data by copy-paste into
            spreadsheets or simply screenshot the table after your run.
          </p>
        </article>

        {/* 5. Accessibility & Offline-Friendly */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            High-Contrast, Accessible & Offline-Ready
          </h3>
          <p className="mt-2">
            All timers feature <strong>large high-contrast digits</strong>,
            simple keyboard shortcuts (<em>Space, R, F, L, N</em>), and work
            offline after the first load, making them reliable for classrooms,
            travel, or low-connectivity gyms. Full-screen mode keeps numbers
            readable from a distance, ideal for projectors and big displays.
          </p>
        </article>

        {/* 6. Privacy-Safe and Free */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Private, Free & No Sign-Up Needed
          </h3>
          <p className="mt-2">
            <strong>I Love Timers</strong> stores no personal data or cookies
            beyond basic browser settings. Everything runs locally in your tab,
            so you can use it at school, at work, or while travelling without
            creating an account or worrying about privacy.
          </p>
        </article>
      </section>

      {/* =========================================================
    EXTRA-EXTRA SEO-RICH SECTIONS (add above FAQ)
========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-amber-800">
        {/* 7. Classroom & Test-Prep */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Perfect for Classrooms & Test-Prep
          </h3>
          <p className="mt-2">
            Teachers use our <strong>countdown timer with sound alerts</strong>{" "}
            to pace
            <em>
              {" "}
              spelling bees, math drills, science lab work, mock SAT / IELTS /
              GRE sections, debate rounds, and timed essays
            </em>
            . Large digits projected on a smartboard keep every student aware of
            remaining time without constant reminders.
          </p>
        </article>

        {/* 8. Public Speaking & Livestreams */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Speech, Presentation & Livestream Timing
          </h3>
          <p className="mt-2">
            Conference speakers and online hosts rely on the
            <strong> full-screen countdown clock</strong> to hit their slot
            limits, flash final-minute warnings, and avoid running over.
            <em>
              {" "}
              Podcast recordings, webinars, Twitch / YouTube segments
            </em>{" "}
            also benefit from the discreet silent timer that’s visible
            off-camera.
          </p>
        </article>

        {/* 9. Cooking & Kitchen Helpers */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Kitchen-Friendly Cooking Timers
          </h3>
          <p className="mt-2">
            The <strong>1-click presets</strong> (1 m – 60 m) make boiling eggs,
            timing tea, proofing bread, or simmering stews effortless on a phone
            or tablet stand. Audible alarms help busy cooks track multiple
            dishes without losing focus on prep.
          </p>
        </article>

        {/* 10. Meditation, Yoga & Sleep */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Meditation, Yoga & Sleep Sessions
          </h3>
          <p className="mt-2">
            Minimal interface and soft chime options suit
            <em>
              {" "}
              meditation timers, pranayama breathing cycles, yin-yoga holds,
              stretching sessions, and short power-naps
            </em>
            . The loop mode repeats any countdown automatically for multi-round
            practice.
          </p>
        </article>

        {/* 11. Multi-Device Sync & Offline Use */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Works Across Devices & Offline
          </h3>
          <p className="mt-2">
            Open the same page on{" "}
            <strong>laptops, tablets, phones, Chromebooks</strong>
            and the timers stay accurate even if you switch tabs or lose Wi-Fi
            after load. Add the site to your home-screen as a{" "}
            <em>Progressive Web App (PWA)</em> for near-native offline
            performance.
          </p>
        </article>

        {/* 12. Keyboard Shortcuts & Productivity Hacks */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Power-User Keyboard Shortcuts
          </h3>
          <p className="mt-2">
            Quickly control timers with the keyboard:
            <em>
              {" "}
              Space = Start / Pause, R = Reset, F = Fullscreen, L = Lap, N =
              Next Interval
            </em>
            . These shortcuts save clicks during
            <strong> HIIT sessions, presentations, or live streams</strong>.
          </p>
        </article>

        {/* 13. Custom Themes & Large-Screen Mode */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Custom Themes & Big-Screen Visibility
          </h3>
          <p className="mt-2">
            Switch between <strong>light / dark / high-contrast themes</strong>{" "}
            for gyms, classrooms, or low-light studios. Full-screen mode
            enlarges digits for TVs, projectors, or outdoor boot-camp sessions
            where distance visibility matters.
          </p>
        </article>

        {/* 14. Data Privacy & Ad-Light Experience */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Privacy-First & Ad-Light Experience
          </h3>
          <p className="mt-2">
            No sign-up, no tracking scripts - timers run entirely in-browser.
            Lightweight pages ensure{" "}
            <strong>
              fast loads, low battery drain, and zero personal data collection
            </strong>
            , keeping focus on productivity rather than pop-ups or banners.
          </p>
        </article>
      </section>

      {/* =========================================================
   EVEN MORE SEO-RICH SECTIONS (stack above FAQ)
========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-amber-800">
        {/* 15. Fitness, HIIT & Interval Training */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Tailored for Fitness, HIIT & Interval Training
          </h3>
          <p className="mt-2">
            Our <strong>interval timer</strong> makes it easy to configure
            <em>
              {" "}
              work / rest cycles for HIIT, Tabata, CrossFit, circuit training,
              jump-rope, and sprint repeats
            </em>
            . Use the lap function to record every round and the audible
            countdown to keep pace without constantly checking your phone.
          </p>
        </article>

        {/* 16. Pomodoro & Deep-Work Productivity */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Boost Focus with Pomodoro & Deep-Work Sessions
          </h3>
          <p className="mt-2">
            Set up the classic <strong>25-5 Pomodoro cycle</strong> or customize
            focus / break blocks to prevent burnout. Freelancers, writers,
            coders, and students use it to maintain
            <em> high-energy sprints followed by mindful breaks</em>
            that reduce fatigue and improve output.
          </p>
        </article>

        {/* 17. Stopwatch with Laps & Splits */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Precise Stopwatch with Laps & Splits
          </h3>
          <p className="mt-2">
            Our <strong>digital stopwatch</strong> records
            <em>
              {" "}
              lap-times for track sprints, swim heats, rowing, car-repair tests,
              and speed-cubing contests
            </em>
            . Export splits as a CSV (coming soon) to log training history or
            share with coaches.
          </p>
        </article>

        {/* 18. Marathon, 5K & Endurance Events */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Reliable for 5K, 10K & Marathon Pacing
          </h3>
          <p className="mt-2">
            Long-distance runners trust the{" "}
            <strong>persistent full-screen stopwatch</strong>
            that stays accurate even if you switch tabs or receive
            notifications. The projected clock at local fun-runs and school
            track meets keeps everyone synchronized at the start / finish line.
          </p>
        </article>

        {/* 19. Kids’ Study Routines & Chore Races */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Fun Timers for Kids’ Routines
          </h3>
          <p className="mt-2">
            Parents use the colorful timers to turn{" "}
            <em>chores, homework, clean-up sessions, and screen-time limits</em>{" "}
            into
            <strong> motivating mini-races</strong>. Countdown bells let kids
            know exactly when time’s up without nagging.
          </p>
        </article>

        {/* 20. Corporate & Remote-Team Meetings */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Keep Corporate & Remote Meetings on Track
          </h3>
          <p className="mt-2">
            Managers love the <strong>meeting countdown clock</strong>
            to rein in lengthy discussions, breakout-rooms, and stand-ups. A
            visible timer reduces overruns and keeps agendas tight whether on
            Zoom, Meet, or in-person huddles.
          </p>
        </article>

        {/* 21. Accessibility-Ready Controls */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Accessible for Everyone
          </h3>
          <p className="mt-2">
            The interface supports{" "}
            <strong>
              keyboard navigation, screen-reader labels, dark-mode high-contrast
              themes, and color-blind friendly palettes
            </strong>
            . Large digits and audible alarms assist users with low vision or
            attention-span challenges.
          </p>
        </article>

        {/* 22. Ultra-Light Performance & Security */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Ultra-Light, Fast & Secure
          </h3>
          <p className="mt-2">
            Built with a <strong>vanilla-JS core weighing under 40 KB</strong>,
            our timers load instantly even on spotty Wi-Fi or low-end phones. No
            accounts, no trackers, no cookies - just efficient code for
            dependable timing tasks without privacy trade-offs.
          </p>
        </article>

        {/* 23. Future-Proof Features Roadmap */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Feature Roadmap & Community Feedback
          </h3>
          <p className="mt-2">
            Upcoming upgrades include{" "}
            <em>
              multi-timer dashboards, exportable lap logs, sync across devices,
              Siri / Alexa voice commands, and smart-home light or buzzer
              triggers
            </em>
            . Feedback from power-users guides our roadmap so that{" "}
            <strong>I Love Timers</strong> stays competitive with top commercial
            timer apps - for free.
          </p>
        </article>
      </section>

      {/* =========================================================
   ADDITIONAL SEO-RICH SECTIONS (more depth above FAQ)
========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-amber-800">
        {/* 24. Exam Countdown for Students */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Exam & Revision Countdown for Students
          </h3>
          <p className="mt-2">
            Whether it’s a{" "}
            <strong>
              mock SAT, AP Biology exam, IELTS reading block, or timed essay
              practice
            </strong>
            , our <em>quiet countdown clock</em>
            helps students stay aware of every minute. Visible timers reduce
            panic, encourage even pacing across questions, and keep proctoring
            stress-free.
          </p>
        </article>

        {/* 25. Seasonal & Holiday Event Planning */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Holiday Baking & Party Countdown
          </h3>
          <p className="mt-2">
            Around{" "}
            <strong>
              Thanksgiving, Christmas, Lunar New Year, Eid, Diwali
            </strong>
            or birthday parties, families use multiple countdown timers to
            juggle
            <em>
              turkey roasting, gift-unwrapping games, karaoke slots, and
              party-quiz rounds
            </em>
            . Alarms keep each activity on schedule, freeing hosts to enjoy the
            celebration.
          </p>
        </article>

        {/* 26. Laboratory & STEM Experiment Timers */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Laboratory & STEM Experiment Timing
          </h3>
          <p className="mt-2">
            University{" "}
            <strong>
              chemistry labs, physics demos, robotics teams, and makerspaces
            </strong>{" "}
            appreciate precise{" "}
            <em>
              millisecond-accurate stopwatches and repeatable countdown cycles
            </em>{" "}
            to time reactions, solder reflow, or 3-D-printer resin exposure.
            Lightweight pages work on restricted lab computers with no install
            required.
          </p>
        </article>

        {/* 27. Photography & Content-Creation Helpers */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Photo, Video & Livestream Helpers
          </h3>
          <p className="mt-2">
            Creators use the <strong>on-screen stopwatch</strong> to measure
            <em>
              reel cuts, B-roll length, timelapse segments, unboxing segments,
              podcast ad-breaks
            </em>
            , and keep <strong>TikTok / YouTube shorts</strong>
            within exact length limits. Color-coded warning beeps signal
            final-seconds while recording.
          </p>
        </article>

        {/* 28. Global Languages & Localized Digits */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Global Language-Friendly Interface
          </h3>
          <p className="mt-2">
            <strong>I Love Timers</strong> plans to support
            <em>
              multi-language labels, 12-/24-hour clocks, Arabic-Indic digits,
              and right-to-left layouts
            </em>{" "}
            for global classrooms and community events. This makes the site
            inclusive for non-English speakers and improves SEO reach to
            international audiences.
          </p>
        </article>

        {/* 29. Health-Care & Rehab Use-Cases */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Rehab & Health-Care Friendly
          </h3>
          <p className="mt-2">
            Physical-therapy clinics and speech-language therapists set gentle
            <strong>1- to 5-minute interval timers</strong> for
            <em>
              rehab stretches, breathing exercises, hand-grip therapy, speech
              pacing, and balance drills
            </em>
            . Clear audible alerts help patients self-pace without continuous
            supervision.
          </p>
        </article>

        {/* 30. Eco-Friendly & Battery-Light Code */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Eco-Friendly & Battery-Light Design
          </h3>
          <p className="mt-2">
            Our minimalist codebase reduces CPU wake-ups and{" "}
            <strong>
              consumes less battery on laptops, tablets, and phones
            </strong>
            , which indirectly lowers energy use during long online events,
            classroom sessions, or endurance streams.
          </p>
        </article>

        {/* 31. Reliable in Low-Connectivity Regions */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Reliable in Low-Connectivity Regions
          </h3>
          <p className="mt-2">
            Because timers run entirely in-browser after load,
            <strong>
              rural schools, field researchers, sports camps, and travellers
            </strong>
            can depend on accurate countdowns even if Wi-Fi drops or mobile data
            slows to 2G. This resilience improves usability across the globe.
          </p>
        </article>

        {/* 32. Educator Guides & Downloadable Worksheets */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Educator Guides & Printable Worksheets
          </h3>
          <p className="mt-2">
            We’re publishing <strong>free PDF classroom worksheets</strong> that
            pair math-drill timers with answer-sheets, plus{" "}
            <em>
              science-fair experiment logs, speech-prep cue-cards, and PE
              warm-up charts
            </em>{" "}
            so teachers can integrate online timers into lesson plans.
          </p>
        </article>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
        <div className="mt-4 divide-y divide-amber-200 rounded-2xl border border-amber-200 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              My countdown breaks when I click a new preset. Fixed?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Selecting a preset now safely resets the duration and pauses
              the timer so you can start when ready.
            </div>
          </details>
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I switch phases in Pomodoro or skip in HIIT?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Use the Switch/Skip button or press <strong>N</strong> while the
              card is focused.
            </div>
          </details>
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Do you save my last settings?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              The timers are designed to be stateless for reliability. You can
              bookmark presets or keep the page open for quick reuse.
            </div>
          </details>
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use it fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. On the Countdown, click <em>Fullscreen</em> or press{" "}
              <strong>F</strong> while focused.
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t border-amber-200 bg-amber-100/60">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-amber-800">
          © {new Date().getFullYear()} I Love Timers - free countdown,
          stopwatch, Pomodoro, and HIIT interval timers
        </div>
      </footer>
    </main>
  );
}

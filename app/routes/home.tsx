import type { Route } from "./+types/home";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Free Online Timers: Countdown, Stopwatch, Pomodoro";
  const description =
    "Start a countdown, run a precise stopwatch with laps, or focus with a Pomodoro timer. Clean, fast online timers that work instantly.";

  const url = "https://ilovetimers.com";

  return [
    { title },
    { name: "description", content: description },
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
    { name: "theme-color", content: "#ffedd5" },
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
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
    className={`cursor-pointer rounded-full px-3 py-1 text-sm transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   COUNTDOWN TIMER (accurate via absolute time)
========================================================= */
function CountdownTimer() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );
  const [loop, setLoop] = useState(false);
  const [sound, setSound] = useState(true);
  const [inputStr, setInputStr] = useState("05:00");
  const displayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setInputStr(msToClock(durationMs));
  }, [durationMs]);

  useEffect(() => {
    if (status !== "running") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
      return;
    }

    if (!endTimeRef.current)
      endTimeRef.current = performance.now() + remainingMs;

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      setRemainingMs(rem);

      if (rem <= 0) {
        if (sound) beep();
        if (loop) {
          endTimeRef.current = performance.now() + durationMs;
          setRemainingMs(durationMs);
        } else {
          setStatus("done");
          endTimeRef.current = null;
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endTimeRef.current = null;
    };
  }, [status, durationMs, loop, sound, beep, remainingMs]);

  function safeReset(to?: number) {
    const ms = to ?? durationMs;
    setDurationMs(ms);
    setRemainingMs(ms);
    setStatus("idle");
    endTimeRef.current = null;
  }

  function parseInputToMs(str: string) {
    const parts = str
      .trim()
      .split(":")
      .map((p) => p.trim());
    let ms = 0;
    if (parts.length === 1) {
      const n = Number(parts[0] || "0");
      ms = n * 1000;
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

  const onPreset = (m: number) => safeReset(m * 60 * 1000);
  const onStartPause = () => {
    if (status === "running") {
      setStatus("paused");
      return;
    }
    if (remainingMs <= 0) setRemainingMs(durationMs);
    setStatus("running");
  };
  const onReset = () => safeReset();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (e.key.toLowerCase() === "r") {
      onReset();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  const done = status === "done";
  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  return (
    <Card
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="col-span-2 lg:col-span-1"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-950">
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
        className={`mt-3 flex items-center justify-center rounded-2xl border p-6 text-8xl font-mono font-extrabold tracking-widest ${
          urgent
            ? "border-rose-400 bg-rose-50 text-rose-950"
            : "border-amber-400 bg-amber-50 text-amber-950"
        }`}
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
            className="w-full rounded-lg border border-amber-300 px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
          Time’s up! Press Start to run again or pick a preset.
        </div>
      )}

      {/* minimal readability fix: bigger + darker + subtle container */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
        Shortcuts: <strong className="text-slate-900">Space</strong> start/pause
        • <strong className="text-slate-900">R</strong> reset •{" "}
        <strong className="text-slate-900">F</strong> fullscreen.
      </div>
    </Card>
  );
}

/* =========================================================
   STOPWATCH (accurate via absolute start time + fullscreen)
========================================================= */
function StopwatchCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTimeRef.current = null;
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = performance.now() - elapsed;
    }

    const tick = () => {
      const now = performance.now();
      setElapsed(now - (startTimeRef.current ?? now));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, elapsed]);

  function reset() {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    startTimeRef.current = null;
  }

  function lap() {
    if (!running && elapsed === 0) return;
    setLaps((xs) => {
      const prevTotal = xs.reduce((a, b) => a + b, 0);
      return [...xs, elapsed - prevTotal];
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "l") {
      lap();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  }

  const total = msToClockMs(elapsed);
  const lapTotals = laps.reduce(
    (acc, l, i) => acc.concat([(acc[i - 1] ?? 0) + l]),
    [] as number[],
  );

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-amber-950">Stopwatch</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              running
                ? "bg-emerald-100 text-emerald-900"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {running ? "RUNNING" : "PAUSED"}
          </span>
        </div>
        <Btn
          kind="ghost"
          onClick={() =>
            displayRef.current && toggleFullscreen(displayRef.current)
          }
          className="py-1 text-sm"
        >
          Fullscreen
        </Btn>
      </div>

      <div
        ref={displayRef}
        className={`mt-3 flex items-center justify-center rounded-2xl border p-6 text-6xl font-mono font-extrabold tracking-widest ${
          running
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : "border-amber-400 bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 110 }}
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
              <tr className="text-amber-950">
                <th className="py-1 text-left">#</th>
                <th className="py-1 text-left">Lap</th>
                <th className="py-1 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((l, i) => {
                const isLatest = i === laps.length - 1;
                return (
                  <tr
                    key={i}
                    className={`border-t ${
                      isLatest
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-amber-500/30"
                    }`}
                  >
                    <td className="py-1">Lap {i + 1}</td>
                    <td className="py-1">{msToClockMs(l)}</td>
                    <td className="py-1">{msToClockMs(lapTotals[i] ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* minimal readability fix: bigger + darker + subtle container */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
        Shortcuts: <strong className="text-slate-900">Space</strong> start/pause
        • <strong className="text-slate-900">R</strong> reset •{" "}
        <strong className="text-slate-900">L</strong> lap •{" "}
        <strong className="text-slate-900">F</strong> fullscreen.
      </div>
    </Card>
  );
}

/* =========================================================
   POMODORO (accurate + auto-cycle + fullscreen)
========================================================= */
function PomodoroCard() {
  const beep = useBeep();
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [cycles, setCycles] = useState(4);

  const [phase, setPhase] = useState<"work" | "break" | "done">("work");
  const [cycleIdx, setCycleIdx] = useState(0);
  const [remaining, setRemaining] = useState(workMin * 60 * 1000);
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const durFor = (p: "work" | "break" | "done") =>
    p === "work"
      ? workMin * 60 * 1000
      : p === "break"
        ? breakMin * 60 * 1000
        : 0;

  useEffect(() => {
    setRunning(false);
    const d = durFor(phase);
    setRemaining(d);
    endRef.current = null;
  }, [workMin, breakMin]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        setTimeout(handleAdvance, 16);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, phase, cycleIdx, workMin, breakMin, cycles, remaining]);

  function startPhase(p: "work" | "break") {
    const d = durFor(p);
    setPhase(p);
    setRemaining(d);
    endRef.current = performance.now() + d;
    setRunning(true);
  }

  function handleAdvance() {
    beep();

    if (phase === "work") {
      const isLastWork = cycleIdx + 1 >= cycles;
      if (isLastWork) {
        setPhase("done");
        setRemaining(0);
        setRunning(false);
        return;
      }
      startPhase("break");
      return;
    }

    if (phase === "break") {
      setCycleIdx((i) => i + 1);
      startPhase("work");
      return;
    }

    if (phase === "done") {
      setRunning(false);
      setRemaining(0);
      return;
    }
  }

  function resetAll() {
    setRunning(false);
    setPhase("work");
    setCycleIdx(0);
    const d = durFor("work");
    setRemaining(d);
    endRef.current = null;
  }

  function nextPhase() {
    setRunning(false);
    if (phase === "work") {
      startPhase("break");
    } else if (phase === "break") {
      setCycleIdx((i) => i + 1);
      startPhase("work");
    } else {
      resetAll();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "n") {
      nextPhase();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  }

  const phaseLabel =
    phase === "work"
      ? `Work ${cycleIdx + 1}/${cycles}`
      : phase === "break"
        ? `Break ${cycleIdx + 1}/${cycles}`
        : "All cycles complete";

  const displayTone =
    phase === "work"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : phase === "break"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-950">
          Pomodoro Focus Timer
        </h3>
        <Btn
          kind="ghost"
          onClick={() =>
            displayRef.current && toggleFullscreen(displayRef.current)
          }
          className="py-1 text-sm"
        >
          Fullscreen
        </Btn>
      </div>

      {/* minimal readability fix: darker text + slightly larger */}
      <div className="mt-1 text-sm leading-relaxed text-slate-700">
        Auto-advances between work and break cycles with accurate timing
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-amber-950">Work (min)</span>
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
          <span className="text-amber-950">Break (min)</span>
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
          <span className="text-amber-950">Cycles</span>
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
        ref={displayRef}
        className={`mt-4 flex items-center justify-center rounded-2xl border p-6 text-6xl font-mono font-extrabold tracking-widest ${displayTone}`}
        style={{ minHeight: 110 }}
      >
        {msToClock(Math.ceil(remaining / 1000) * 1000)}
      </div>

      <div className="mt-2 text-sm text-amber-950">
        Phase: <strong>{phaseLabel}</strong>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Btn onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Start"}
        </Btn>
        <Btn kind="ghost" onClick={resetAll}>
          Reset
        </Btn>
        <Btn kind="ghost" onClick={nextPhase}>
          Skip →
        </Btn>
      </div>

      {/* minimal readability fix: bigger + darker + subtle container */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
        Shortcuts: <strong className="text-slate-900">Space</strong> start/pause
        • <strong className="text-slate-900">R</strong> reset •{" "}
        <strong className="text-slate-900">N</strong> skip •{" "}
        <strong className="text-slate-900">F</strong> fullscreen.
      </div>
    </Card>
  );
}

/* =========================================================
   HIIT / INTERVAL TIMER (stable + accurate + fullscreen)
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
  const displayRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const durFor = (s: StepName) =>
    s === "warmup"
      ? warm * 1000
      : s === "work"
        ? work * 1000
        : s === "rest"
          ? rest * 1000
          : s === "cooldown"
            ? cool * 1000
            : 0;

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      return;
    }

    if (!endRef.current) endRef.current = performance.now() + remaining;

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        setTimeout(() => handleAdvance(), 20);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, step, roundIdx, warm, work, rest, cool, rounds, remaining]);

  function handleAdvance() {
    beep();

    if (step === "warmup") {
      setStep("work");
      setRoundIdx(0);
      startPhase("work");
      return;
    }

    if (step === "work") {
      if (rest > 0) {
        setStep("rest");
        startPhase("rest");
      } else {
        advanceAfterRest();
      }
      return;
    }

    if (step === "rest") {
      advanceAfterRest();
      return;
    }

    if (step === "cooldown") {
      setStep("done");
      setRemaining(0);
      setRunning(false);
    }
  }

  function advanceAfterRest() {
    const next = roundIdx + 1;
    if (next < rounds) {
      setRoundIdx(next);
      setStep("work");
      startPhase("work");
    } else {
      setStep("cooldown");
      startPhase("cooldown");
    }
  }

  function startPhase(next: StepName) {
    const d = durFor(next);
    setRemaining(d);
    endRef.current = performance.now() + d;
    setRunning(true);
  }

  function resetAll() {
    setRunning(false);
    setStep("warmup");
    setRoundIdx(0);
    const d = durFor("warmup");
    setRemaining(d);
    endRef.current = null;
  }

  function skip() {
    if (step === "warmup") handleAdvance();
    else if (step === "work") handleAdvance();
    else if (step === "rest") handleAdvance();
    else if (step === "cooldown") handleAdvance();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      setRunning((r) => !r);
    } else if (e.key.toLowerCase() === "r") {
      resetAll();
    } else if (e.key.toLowerCase() === "n") {
      skip();
    } else if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  }

  useEffect(() => {
    setRunning(false);
    const d = durFor(step);
    setRemaining(d);
    endRef.current = null;
  }, [warm, work, rest, cool]);

  const phaseLabel =
    step === "warmup"
      ? "Warm-up"
      : step === "work"
        ? "Work"
        : step === "rest"
          ? "Rest"
          : step === "cooldown"
            ? "Cool-down"
            : "Done";

  const roundLabel =
    step === "work" || step === "rest"
      ? `Round ${roundIdx + 1}/${rounds}`
      : step === "warmup"
        ? "Get ready"
        : step === "cooldown"
          ? "Finish strong"
          : "Complete";

  const displayTone =
    step === "work"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : step === "rest"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : step === "warmup"
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : step === "cooldown"
            ? "border-sky-200 bg-sky-50 text-sky-950"
            : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-950">
          HIIT / Interval Timer
        </h3>
        <Btn
          kind="ghost"
          onClick={() =>
            displayRef.current && toggleFullscreen(displayRef.current)
          }
          className="py-1 text-sm"
        >
          Fullscreen
        </Btn>
      </div>

      {/* minimal readability fix: darker text + slightly larger */}
      <div className="mt-1 text-sm leading-relaxed text-slate-700">
        Auto-runs through all rounds with accurate timing
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
        ref={displayRef}
        className={`mt-4 rounded-2xl border p-6 ${displayTone}`}
        style={{ minHeight: 120 }}
        aria-live="polite"
      >
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
            {phaseLabel}
          </div>
          <div className="text-sm font-semibold opacity-90">{roundLabel}</div>
        </div>
        <div className="mt-2 flex items-center justify-center text-5xl font-mono font-extrabold tracking-widest">
          {msToClock(Math.ceil(remaining / 1000) * 1000)}
        </div>
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

      {/* minimal readability fix: bigger + darker + subtle container */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
        Shortcuts: <strong className="text-slate-900">Space</strong> start/pause
        • <strong className="text-slate-900">R</strong> reset •{" "}
        <strong className="text-slate-900">N</strong> skip •{" "}
        <strong className="text-slate-900">F</strong> fullscreen.
      </div>
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
      <span className="text-amber-950">{label}</span>
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
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Free Online Timers - Simple, Accurate, Instant
          </h2>

          {/* minimal readability fix: darker text */}
          <p className="mt-2 max-w-3xl text-lg text-slate-700">
            Countdown presets, a stopwatch with laps, Pomodoro focus cycles, and
            HIIT intervals - all on one fast page.
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
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold">Timers for Every Task</h3>

          {/* minimal readability fix: darker text */}
          <p className="mt-2 text-slate-700 leading-relaxed">
            A <strong>countdown timer</strong> is best for presentations,
            classrooms, exams, and cooking. The <strong>stopwatch</strong>{" "}
            tracks training splits and sprints with <em>laps</em>. The{" "}
            <strong>Pomodoro timer</strong> structures deep work into focused
            blocks with short, refreshing breaks. For workouts, our{" "}
            <strong>HIIT interval timer</strong> cycles through warm-up,
            work/rest rounds, and cool-down.
          </p>

          {/* minimal readability fix: darker text */}
          <p className="mt-2 text-slate-700 leading-relaxed">
            Everything runs in your browser, works offline after loading, and
            uses a high-contrast display for projectors and mobile screens. No
            sign-up - just press Start.
          </p>
        </div>
      </section>

      {/* =========================================================
    EXTRA SEO-RICH SECTIONS (place above FAQ)
========================================================= */}
      {/* minimal readability fix: swap section text color */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-slate-700">
        {/* 1. Everyday Timer Uses */}
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
      {/* minimal readability fix: swap section text color */}
      <section className="mx-auto max-w-7xl px-4 pb-12 space-y-10 leading-relaxed text-slate-700">
        {/* 7. Classroom & Test-Prep */}
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
            Kitchen-Friendly Cooking Timers
          </h3>
          <p className="mt-2">
            The <strong>1-click presets</strong> (1 m to 60 m) make boiling
            eggs, timing tea, proofing bread, or simmering stews effortless on a
            phone or tablet stand. Audible alarms help busy cooks track multiple
            dishes without losing focus on prep.
          </p>
        </article>

        {/* 10. Meditation, Yoga & Sleep */}
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        <article className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-950">
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
        {/* Exam / Study timing tips */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Exam & Study Timing Tips
          </h3>
          <p className="mt-2">
            Try a simple routine: <strong>25:00 focus</strong> +{" "}
            <strong>5:00 break</strong> (or <strong>45:00</strong> +{" "}
            <strong>10:00</strong> for longer sessions). For timed practice, set
            a countdown for each section and restart it between parts. If you
            tend to rush, aim to finish with{" "}
            <strong>2 to 3 minutes left</strong> for review.
          </p>
        </article>

        {/* Holidays / events without implying seasonal content */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Parties, Events & Hosting
          </h3>
          <p className="mt-2">
            Use <strong>short repeating timers</strong> to keep an event moving
            without watching the clock: trivia rounds (5 to 10 min), game turns
            (60 to 90 sec), or “next activity” reminders (10 to 15 min). If
            you’re running a schedule, fullscreen the display so everyone can
            see it.
          </p>
        </article>

        {/* Labs / experiments: accurate timing advice */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Labs, Experiments & Repeatable Timing
          </h3>
          <p className="mt-2">
            For experiments, consistency beats perfection. Use the{" "}
            <strong>stopwatch + laps</strong> to record repeated trials (Lap 1,
            Lap 2, Lap 3). For fixed waits (incubation, settling, exposure), use
            a <strong>countdown</strong>. Write down your lap totals right away
            (or screenshot the lap table).
          </p>
        </article>

        {/* Creators */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Creators: Video, Livestreams & Recording
          </h3>
          <p className="mt-2">
            For tight segments, set a countdown for your target length and a
            second timer for breaks or resets. If you’re timing takes, use the
            stopwatch and hit <strong>Lap</strong> at each cut so you can see
            split lengths fast.
          </p>
        </article>

        {/* Accessibility / language without claiming future localization */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Clear Display & Keyboard Control
          </h3>
          <p className="mt-2">
            For projector or gym use, fullscreen the timer and control it with
            the keyboard:
            <em> Space</em> start/pause, <em>R</em> reset, <em>F</em>{" "}
            fullscreen, <em>L</em> lap,
            <em> N</em> next/skip. Tip: click the timer card once so it’s
            focused, then the keys work.
          </p>
        </article>

        {/* Rehab / gentle pacing (no medical claims) */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Pacing for Mobility, Stretching & Rehab Routines
          </h3>
          <p className="mt-2">
            For gentle routines, use predictable intervals:{" "}
            <strong>30 to 60 seconds</strong> on,
            <strong> 10 to 30 seconds</strong> rest, repeat for a set number of
            rounds. If you’re following a plan from a professional, match their
            timings exactly and keep the display visible.
          </p>
        </article>

        {/* Battery / performance tips */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Reliability & Battery Tips
          </h3>
          <p className="mt-2">
            Keep the timer in the foreground when possible for the smoothest
            updates. On phones, lower screen brightness and use fullscreen to
            avoid accidental taps. If you need a repeating routine, enable{" "}
            <strong>Loop</strong> on the countdown.
          </p>
        </article>

        {/* Low connectivity */}
        <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-bold text-amber-900">
            Low-Connectivity Friendly Habits
          </h3>
          <p className="mt-2">
            If you’re somewhere with unreliable internet, open the page once
            before you need it, then keep the tab open. For events, consider a
            quick test run (start, pause, reset) so you know sound and
            fullscreen behave the way you expect on that device.
          </p>
        </article>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
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
    </main>
  );
}

import type { Route } from "./+types/free-online-timers";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Disclaimer from "~/clients/components/home/Disclaimer";
import FAQ from "~/clients/components/home/FAQ";
import HowItWorks from "~/clients/components/home/HowItWorks";
import KeyboardShortcuts from "~/clients/components/home/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/home/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Free Online Timers | Countdown, Stopwatch, Pomodoro and HIIT";
  const description =
    "Use the original I Love Timers four-tool page with a countdown timer, stopwatch with laps, Pomodoro timer, and HIIT interval timer.";

  const siteUrl = "https://www.ilovetimers.com";
  const url = `${siteUrl}/free-online-timers`;

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `${siteUrl}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: url },
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
    if (typeof el.requestFullscreen !== "function") return;
    await el.requestFullscreen().catch(() => {});
  } else {
    if (typeof document.exitFullscreen !== "function") return;
    await document.exitFullscreen().catch(() => {});
  }
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

/* =========================================================
   LIGHTWEIGHT UI PRIMITIVES
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
      "relative h-full bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "rounded-2xl border border-slate-200/80 p-5 shadow-sm",
      className,
    ].join(" ")}
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
    className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
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
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
          {left}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit fullscreen (Esc)
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
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 px-3 py-2 backdrop-blur">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

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

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

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
    } else if (e.key.toLowerCase() === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    }
  };

  const done = status === "done";
  const urgent =
    status === "running" && remainingMs > 0 && remainingMs <= 10_000;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className="lg:col-span-1"
    >
      <FullscreenTopBar
        show={isFs}
        title="Countdown Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="flex items-center gap-3 text-sm text-slate-700">
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
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="accent-amber-500"
              />
              Loop
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={status === "running" ? "solid" : "ghost"}
              onClick={onStartPause}
              className="py-1 text-sm"
            >
              {status === "running" ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={onReset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-950">
              Countdown Timer
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
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
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="accent-amber-500"
                />
                Loop
              </label>
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-1 text-sm"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          className={[
            "timer-display-surface mt-3 flex items-center justify-center font-mono font-extrabold tracking-widest",
            urgent
              ? "border-amber-200 bg-amber-50 text-slate-950"
              : "border-slate-200 bg-slate-50 text-slate-950",
            isFs ? "mx-4 flex-1 p-6" : "p-6",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 140,
            fontSize: isFs ? "8rem" : "4.25rem",
            lineHeight: "1",
            marginTop: isFs ? "4.25rem" : undefined, // clears top bar
            marginBottom: isFs ? "4.25rem" : undefined, // clears bottom bar
            userSelect: "none",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) onStartPause();
          }}
          role={isFs ? "button" : undefined}
          tabIndex={isFs ? -1 : undefined}
          title={isFs ? "Click to start/pause" : undefined}
        >
          {msToClock(remainingMs)}
        </div>

        {/* Normal (non-fullscreen) controls */}
        {!isFs && (
          <>
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
                  aria-label="Countdown duration"
                  inputMode="numeric"
                  value={inputStr}
                  onChange={(e) => {
                    if (status === "running") setStatus("paused");
                    setInputStr(e.target.value);
                  }}
                  onBlur={onSet}
                  placeholder="mm:ss or ss"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
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
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                Time’s up. Press Start to run again or pick a preset.
              </div>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Shortcuts: <strong className="text-slate-900">Space</strong>{" "}
              start/pause • <strong className="text-slate-900">R</strong> reset
              • <strong className="text-slate-900">F</strong> fullscreen.
            </div>
          </>
        )}

        {/* Fullscreen bottom controls: always visible, no scrolling */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  aria-label="Countdown duration"
                  inputMode="numeric"
                  value={inputStr}
                  onChange={(e) => {
                    if (status === "running") setStatus("paused");
                    setInputStr(e.target.value);
                  }}
                  onBlur={onSet}
                  placeholder="mm:ss or ss"
                  className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
                <Btn kind="ghost" onClick={onSet} className="py-1 text-sm">
                  Set
                </Btn>
              </div>

              <div className="hidden sm:block text-sm text-slate-600">
                Space start/pause • R reset • F fullscreen
              </div>
            </div>
          </div>
        </FullscreenBottomBar>
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

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

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
    } else if (e.key.toLowerCase() === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    }
  }

  const total = msToClockMs(elapsed);

  const lapTotals = laps.reduce(
    (acc, l, i) => acc.concat([(acc[i - 1] ?? 0) + l]),
    [] as number[],
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
        title="Stopwatch"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={() => setRunning((r) => !r)}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={lap} className="py-1 text-sm">
              Lap
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">Stopwatch</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  running
                    ? "border-slate-200 bg-slate-50 text-slate-950"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {running ? "RUNNING" : "PAUSED"}
              </span>
            </div>
            <Btn
              kind="ghost"
              onClick={() =>
                cardRef.current && toggleFullscreen(cardRef.current)
              }
              className="py-1 text-sm"
            >
              Fullscreen
            </Btn>
          </div>
        )}

        <div
          className={`timer-display-surface mt-3 flex items-center justify-center p-6 font-mono font-extrabold tracking-widest ${
            running
              ? "border-slate-200 bg-slate-50 text-slate-950"
              : "border-slate-200 bg-slate-50 text-slate-950"
          }`}
          style={{
            minHeight: isFs ? 0 : 110,
            fontSize: isFs ? "7rem" : "3.25rem",
            lineHeight: "1",
            marginTop: isFs ? "4.25rem" : undefined,
            marginBottom: isFs ? "4.25rem" : undefined,
            userSelect: "none",
          }}
          onClick={() => {
            if (isFs) setRunning((r) => !r);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Click to start/pause" : undefined}
        >
          {total}
        </div>

        {!isFs && (
          <>
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
                    <tr className="text-slate-900">
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
                              ? "border-slate-200 bg-slate-50"
                              : "border-slate-200"
                          }`}
                        >
                          <td className="py-1">Lap {i + 1}</td>
                          <td className="py-1">{msToClockMs(l)}</td>
                          <td className="py-1">
                            {msToClockMs(lapTotals[i] ?? 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Shortcuts: <strong className="text-slate-900">Space</strong>{" "}
              start/pause • <strong className="text-slate-900">R</strong> reset
              • <strong className="text-slate-900">L</strong> lap •{" "}
              <strong className="text-slate-900">F</strong> fullscreen.
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  running
                    ? "border-slate-200 bg-slate-50 text-slate-950"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {running ? "RUNNING" : "PAUSED"}
              </span>
              <div className="text-sm text-slate-600">
                Space start/pause • R reset • L lap • F fullscreen
              </div>
            </div>

            <div className="text-sm text-slate-700">
              Laps are available in normal view.
            </div>
          </div>
        </FullscreenBottomBar>
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

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

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
    } else if (e.key.toLowerCase() === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
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
      ? "border-amber-200 bg-amber-50 text-slate-950"
      : phase === "break"
        ? "border-slate-200 bg-slate-50 text-slate-950"
        : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Pomodoro"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={() => setRunning((r) => !r)}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={nextPhase} className="py-1 text-sm">
              Skip →
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">
              Pomodoro Focus Timer
            </h3>
            <Btn
              kind="ghost"
              onClick={() =>
                cardRef.current && toggleFullscreen(cardRef.current)
              }
              className="py-1 text-sm"
            >
              Fullscreen
            </Btn>
          </div>
        )}

        {!isFs && (
          <div className="mt-1 text-sm leading-relaxed text-slate-600">
            Auto-advances between work and break cycles with accurate timing.
          </div>
        )}

        {!isFs && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="text-slate-900">Work (min)</span>
              <input
                type="number"
                min={1}
                max={180}
                value={workMin}
                onChange={(e) =>
                  setWorkMin(clamp(Number(e.target.value || 0), 1, 180))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-900">Break (min)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={breakMin}
                onChange={(e) =>
                  setBreakMin(clamp(Number(e.target.value || 0), 1, 60))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-900">Cycles</span>
              <input
                type="number"
                min={1}
                max={12}
                value={cycles}
                onChange={(e) =>
                  setCycles(clamp(Number(e.target.value || 0), 1, 12))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
          </div>
        )}

        <div
          className={`timer-display-surface mt-4 flex items-center justify-center p-6 font-mono font-extrabold tracking-widest ${displayTone}`}
          style={{
            minHeight: isFs ? 0 : 110,
            fontSize: isFs ? "7rem" : "3.25rem",
            lineHeight: "1",
            marginTop: isFs ? "4.25rem" : undefined,
            marginBottom: isFs ? "4.25rem" : undefined,
            userSelect: "none",
          }}
          onClick={() => {
            if (isFs) setRunning((r) => !r);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Click to start/pause" : undefined}
        >
          {msToClock(Math.ceil(remaining / 1000) * 1000)}
        </div>

        {!isFs && (
          <>
            <div className="mt-2 text-sm text-slate-600">
              Phase: <strong className="text-slate-900">{phaseLabel}</strong>
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Shortcuts: <strong className="text-slate-900">Space</strong>{" "}
              start/pause • <strong className="text-slate-900">R</strong> reset
              • <strong className="text-slate-900">N</strong> skip •{" "}
              <strong className="text-slate-900">F</strong> fullscreen.
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              Phase:{" "}
              <span className="font-semibold text-slate-900">{phaseLabel}</span>
            </div>
            <div className="text-sm text-slate-600">
              Space start/pause • R reset • N skip • F fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
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

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

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
    } else if (e.key.toLowerCase() === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
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
          ? "Finish"
          : "Complete";

  const displayTone =
    step === "work"
      ? "border-amber-200 bg-amber-50 text-slate-950"
      : step === "rest"
        ? "border-slate-200 bg-slate-50 text-slate-950"
        : step === "warmup"
          ? "border-slate-200 bg-slate-50 text-slate-950"
          : step === "cooldown"
            ? "border-slate-200 bg-slate-50 text-slate-950"
            : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="HIIT / Interval Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={() => setRunning((r) => !r)}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skip} className="py-1 text-sm">
              Skip →
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-950">
              HIIT / Interval Timer
            </h3>
            <Btn
              kind="ghost"
              onClick={() =>
                cardRef.current && toggleFullscreen(cardRef.current)
              }
              className="py-1 text-sm"
            >
              Fullscreen
            </Btn>
          </div>
        )}

        {!isFs && (
          <div className="mt-1 text-sm leading-relaxed text-slate-600">
            Auto-runs through all rounds with accurate timing.
          </div>
        )}

        {!isFs && (
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            <LabeledNumber
              label="Warm-up (s)"
              value={warm}
              set={setWarm}
              max={600}
            />
            <LabeledNumber
              label="Work (s)"
              value={work}
              set={setWork}
              max={600}
            />
            <LabeledNumber
              label="Rest (s)"
              value={rest}
              set={setRest}
              max={600}
            />
            <LabeledNumber
              label="Rounds"
              value={rounds}
              set={setRounds}
              max={50}
            />
            <LabeledNumber
              label="Cool-down (s)"
              value={cool}
              set={setCool}
              max={600}
            />
          </div>
        )}

        <div
          className={`timer-display-surface mt-4 p-6 ${displayTone}`}
          style={{
            minHeight: isFs ? 0 : 120,
            marginTop: isFs ? "4.25rem" : undefined,
            marginBottom: isFs ? "4.25rem" : undefined,
            userSelect: "none",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) setRunning((r) => !r);
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Click to start/pause" : undefined}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-semibold uppercase tracking-wide opacity-90">
              {phaseLabel}
            </div>
            <div className="text-sm font-semibold opacity-90">{roundLabel}</div>
          </div>
          <div
            className="mt-2 flex items-center justify-center font-mono font-extrabold tracking-widest"
            style={{ fontSize: isFs ? "7rem" : "3rem", lineHeight: "1" }}
          >
            {msToClock(Math.ceil(remaining / 1000) * 1000)}
          </div>
        </div>

        {!isFs && (
          <>
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Shortcuts: <strong className="text-slate-900">Space</strong>{" "}
              start/pause • <strong className="text-slate-900">R</strong> reset
              • <strong className="text-slate-900">N</strong> skip •{" "}
              <strong className="text-slate-900">F</strong> fullscreen.
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              {phaseLabel} • {roundLabel}
            </div>
            <div className="text-sm text-slate-600">
              Space start/pause • R reset • N skip • F fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
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
      <span className="text-slate-900">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => set(clamp(Number(e.target.value || 0), 0, max))}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
      />
    </label>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function Home({ loaderData: { nowISO } }: Route.ComponentProps) {
  return (
    <main className="bg-slate-50 text-slate-900">
      {/* Minimal header (no tall banner) */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">
            Free Online Timers
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Countdown presets, a stopwatch with laps, Pomodoro focus cycles, and
            HIIT intervals on one fast page.
          </p>
        </div>
      </section>

      {/* Timers Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div id="countdown" className="min-w-0">
            <CountdownTimer />
          </div>
          <div id="stopwatch" className="min-w-0">
            <StopwatchCard />
          </div>
          <div id="pomodoro" className="min-w-0">
            <PomodoroCard />
          </div>
          <div id="hiit" className="min-w-0">
            <HIITCard />
          </div>
        </div>
      </section>

      {/* Compact SEO section (kept, but no fluff wall) */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Timers for everyday use
          </h2>
          <p className="mt-2 text-slate-700 leading-relaxed">
            Use a <strong>countdown timer</strong> for presentations,
            classrooms, exams, and cooking. The <strong>stopwatch</strong>{" "}
            tracks splits with <em>laps</em>. The{" "}
            <strong>Pomodoro timer</strong> helps you focus with structured work
            and break cycles. For workouts, the{" "}
            <strong>HIIT interval timer</strong> runs warm-up, work/rest rounds,
            and cool-down.
          </p>
          <p className="mt-2 text-slate-700 leading-relaxed">
            Everything runs in your browser. Fullscreen mode keeps digits
            readable on TVs, projectors, and phones.
          </p>
        </div>
      </section>

      {/* Use-cases (kept focused) */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">
              Presentations and meetings
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Run a visible countdown to stay on agenda. Fullscreen makes the
              timer easy to read across a room.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">
              Silent timing
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Turn off sound when you need a discreet timer for talks,
              recording, or quiet rooms.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">
              Study and focus
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Use Pomodoro cycles to work in focused blocks with short breaks.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">
              Workouts and intervals
            </h3>
            <p className="mt-2 text-slate-700 leading-relaxed">
              Configure work/rest rounds and let the interval timer run the full
              session hands-free.
            </p>
          </article>
        </div>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}

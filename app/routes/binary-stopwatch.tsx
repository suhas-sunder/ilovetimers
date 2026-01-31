// app/routes/binary-stopwatch.tsx
import type { Route } from "./+types/binary-stopwatch";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Binary Stopwatch | Binary Timer With Practice Mode (Fullscreen)";
  const description =
    "Free binary stopwatch and countdown timer. Practice reading binary time with an optional bit-weight legend, presets, dim mode, fullscreen, and a soft alarm for countdowns.";
  const url = "https://ilovetimers.com/binary-stopwatch";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "binary stopwatch",
        "binary timer",
        "binary stopwatch online",
        "binary timer online",
        "binary countdown timer",
        "learn binary time",
        "binary time practice",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },

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
   UTILS
========================================================= */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
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

const pad2 = (n: number) => String(n).padStart(2, "0");

function msToClock(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function bitsOf(n: number, width: number) {
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i--) out.push((n >> i) & 1);
  return out;
}

/* WebAudio beep (soft chime-ish) */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 523.25, duration = 180, gain = 0.06) => {
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

/* =========================================================
   UI PRIMITIVES (match binary-clock style)
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function SegTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
        active
          ? "bg-amber-700 text-white hover:bg-amber-800"
          : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

/* =========================================================
   BIT (borrowed contrast fix from binary-clock)
========================================================= */
function Bit({
  on,
  palette,
}: {
  on: boolean;
  palette: {
    on: string;
    off: string;
    border: string;
    textOn: string;
    textOff: string;
  };
}) {
  return (
    <div
      className="grid place-items-center rounded-xl border"
      style={{
        width: 22,
        height: 22,
        background: on ? palette.on : palette.off,
        borderColor: palette.border,
      }}
      aria-label={on ? "1" : "0"}
      title={on ? "1" : "0"}
    >
      <span
        className="font-mono text-xs font-black"
        style={{
          color: on ? palette.textOn : palette.textOff,
          userSelect: "none",
        }}
      >
        {on ? "1" : "0"}
      </span>
    </div>
  );
}

/* =========================================================
   BINARY GRID (pure binary with optional weights legend)
========================================================= */
function BinaryGridPure({
  h,
  m,
  s,
  showSeconds,
  use24,
  dark,
  showWeights,
}: {
  h: number;
  m: number;
  s: number;
  showSeconds: boolean;
  use24: boolean;
  dark: boolean;
  showWeights: boolean;
}) {
  // widths chosen to match learnability + typical expectations
  const hourBits = bitsOf(h, use24 ? 5 : 4); // 0..23 needs 5; 1..12 needs 4
  const minBits = bitsOf(m, 6);
  const secBits = bitsOf(s, 6);

  const cols = showSeconds
    ? [
        {
          key: "H",
          label: "Hours",
          bits: hourBits,
          weights: use24 ? [16, 8, 4, 2, 1] : [8, 4, 2, 1],
        },
        {
          key: "M",
          label: "Minutes",
          bits: minBits,
          weights: [32, 16, 8, 4, 2, 1],
        },
        {
          key: "S",
          label: "Seconds",
          bits: secBits,
          weights: [32, 16, 8, 4, 2, 1],
        },
      ]
    : [
        {
          key: "H",
          label: "Hours",
          bits: hourBits,
          weights: use24 ? [16, 8, 4, 2, 1] : [8, 4, 2, 1],
        },
        {
          key: "M",
          label: "Minutes",
          bits: minBits,
          weights: [32, 16, 8, 4, 2, 1],
        },
      ];

  const maxH = Math.max(...cols.map((c) => c.bits.length));

  const palette = useMemo(() => {
    return {
      bg: dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.75)",
      border: dark ? "rgba(255,255,255,.14)" : "rgba(180,83,9,.30)",
      on: dark ? "rgba(255,255,255,.92)" : "rgba(69,26,3,.92)",
      off: dark ? "rgba(255,255,255,.16)" : "rgba(180,83,9,.20)",
      text: dark ? "rgba(255,255,255,.86)" : "rgba(120,53,15,.88)",
      label: dark ? "rgba(255,255,255,.78)" : "rgba(120,53,15,.75)",
      // Contrast fix: force white text on "on" cells in both shells (like your binary-clock Bit)
      textOn: "rgba(255,255,255,.95)",
      textOff: dark ? "rgba(255,255,255,.55)" : "rgba(69,26,3,.55)",
    };
  }, [dark]);

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: palette.bg,
        borderColor: palette.border,
      }}
    >
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
        }}
      >
        {cols.map((c) => {
          // pad top with zeros so all columns align
          const padded = Array.from({ length: maxH - c.bits.length })
            .map(() => 0)
            .concat(c.bits);

          // weights should align to the *padded* bits (pad with blanks on top)
          const w = c.weights.slice();
          const paddedWeights = Array.from({ length: maxH - w.length })
            .map(() => "")
            .concat(w.map(String));

          return (
            <div key={c.key} className="flex flex-col items-center gap-3">
              <div
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: palette.label }}
              >
                {c.label}
              </div>

              <div
                className="grid gap-2"
                style={{ gridTemplateRows: `repeat(${maxH}, 1fr)` }}
              >
                {padded.map((b, i) => (
                  <Bit
                    key={i}
                    on={b === 1}
                    palette={{
                      on: palette.on,
                      off: palette.off,
                      border: palette.border,
                      textOn: palette.textOn,
                      textOff: palette.textOff,
                    }}
                  />
                ))}
              </div>

              {/* Toggleable bit weights legend (under each column) */}
              {showWeights ? (
                <div
                  className="mt-1 grid gap-1"
                  aria-label={`${c.label} bit weights`}
                >
                  {paddedWeights.map((wt, i) => (
                    <div
                      key={i}
                      className="text-[11px] font-semibold text-center"
                      style={{ color: palette.label, lineHeight: 1.1 }}
                    >
                      {wt}
                    </div>
                  ))}
                </div>
              ) : null}

              <div
                className="text-xs font-semibold"
                style={{ color: palette.text }}
              >
                {c.bits.join("")}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 text-center text-xs font-semibold"
        style={{ color: palette.text }}
      >
        Top bit is the largest weight. Add the weights of the lit bits to read
        the value.
      </div>
    </div>
  );
}

/* =========================================================
   BINARY STOPWATCH CARD
========================================================= */
type ToolMode = "stopwatch" | "timer";

function BinaryStopwatchCard() {
  const beep = useBeep();

  const [toolMode, setToolMode] = useState<ToolMode>("stopwatch");

  // Shared display options
  const [dimMode, setDimMode] = useState(false);
  const [showWeights, setShowWeights] = useState(false);

  // Practice mode hides decimal time until reveal
  const [practiceMode, setPracticeMode] = useState(false);
  const [revealed, setRevealed] = useState(true);

  // Stopwatch
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startPerfRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);

  // Timer
  const presetsSec = useMemo(
    () => [30, 60, 90, 120, 300, 600, 900, 1200, 1800],
    [],
  );
  const [timerSec, setTimerSec] = useState(300);
  const [remainingMs, setRemainingMs] = useState(timerSec * 1000);
  const endPerfRef = useRef<number | null>(null);

  const [sound, setSound] = useState(true);
  const [softAlarm, setSoftAlarm] = useState(true);

  const rafRef = useRef<number | null>(null);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Ensure reveal state makes sense when toggling practice mode
  useEffect(() => {
    setRevealed(!practiceMode);
  }, [practiceMode]);

  // Reset timer remaining when editing duration (only when not running)
  useEffect(() => {
    if (toolMode !== "timer") return;
    if (running) return;
    setRemainingMs(timerSec * 1000);
    endPerfRef.current = null;
  }, [timerSec, toolMode, running]);

  // Stop on mode change to avoid confusing state
  useEffect(() => {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    // Clear refs so next start is clean
    startPerfRef.current = null;
    endPerfRef.current = null;

    // Do not wipe values; just stop
  }, [toolMode]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      // Freeze stopwatch on pause
      if (toolMode === "stopwatch" && startPerfRef.current) {
        const now = performance.now();
        const nextElapsed =
          baseElapsedRef.current + (now - startPerfRef.current);
        baseElapsedRef.current = nextElapsed;
        startPerfRef.current = null;
        setElapsedMs(nextElapsed);
      }

      // Freeze timer on pause
      if (toolMode === "timer" && endPerfRef.current) {
        const now = performance.now();
        const nextRem = Math.max(0, endPerfRef.current - now);
        endPerfRef.current = null;
        setRemainingMs(nextRem);
      }

      return;
    }

    const tick = () => {
      const now = performance.now();

      if (toolMode === "stopwatch") {
        if (!startPerfRef.current) startPerfRef.current = now;
        const next =
          baseElapsedRef.current + (now - (startPerfRef.current ?? now));
        setElapsedMs(next);
      } else {
        if (!endPerfRef.current) endPerfRef.current = now + remainingMs;
        const rem = Math.max(0, (endPerfRef.current ?? now) - now);
        setRemainingMs(rem);

        if (rem <= 0) {
          endPerfRef.current = null;
          setRunning(false);

          if (sound && softAlarm) {
            beep(523.25, 160, 0.05);
            window.setTimeout(() => beep(659.25, 160, 0.05), 260);
            window.setTimeout(() => beep(783.99, 200, 0.05), 520);
          } else if (sound) {
            beep(660, 220, 0.07);
          }
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, toolMode, remainingMs, sound, softAlarm, beep]);

  const shownMs =
    toolMode === "stopwatch"
      ? Math.ceil(elapsedMs / 1000) * 1000
      : Math.ceil(remainingMs / 1000) * 1000;

  const totalSec = Math.max(0, Math.floor(shownMs / 1000));
  const h = clamp(Math.floor(totalSec / 3600), 0, 99);
  const m = clamp(Math.floor((totalSec % 3600) / 60), 0, 59);
  const s = clamp(totalSec % 60, 0, 59);

  function startPause() {
    // If practice mode and not revealed, allow starting anyway
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);

    if (toolMode === "stopwatch") {
      startPerfRef.current = null;
      baseElapsedRef.current = 0;
      setElapsedMs(0);
    } else {
      endPerfRef.current = null;
      setRemainingMs(timerSec * 1000);
    }

    // Re-hide if practice mode is on
    setRevealed(!practiceMode);
  }

  function setTimerPreset(s2: number) {
    setTimerSec(s2);
    setRemainingMs(s2 * 1000);
    setRunning(false);
    endPerfRef.current = null;
    setRevealed(!practiceMode);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "d") {
      setDimMode((x) => !x);
    } else if (k === "m") {
      setToolMode((x) => (x === "stopwatch" ? "timer" : "stopwatch"));
    } else if (k === "w") {
      setShowWeights((x) => !x);
    } else if (k === "p") {
      setPracticeMode((x) => !x);
    } else if (k === "e") {
      setRevealed(true);
    }
  };

  const decimalTime = msToClock(shownMs);

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Binary Stopwatch
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Use it as a <strong>binary stopwatch</strong> (count up) or a{" "}
            <strong>binary timer</strong> (count down). Toggle bit weights and
            practice mode to learn faster.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SegTab
              active={toolMode === "stopwatch"}
              label="Stopwatch"
              onClick={() => setToolMode("stopwatch")}
            />
            <SegTab
              active={toolMode === "timer"}
              label="Timer"
              onClick={() => setToolMode("timer")}
            />
          </div>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => setShowWeights(e.target.checked)}
            />
            Weights
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={practiceMode}
              onChange={(e) => setPracticeMode(e.target.checked)}
            />
            Practice
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={dimMode}
              onChange={(e) => setDimMode(e.target.checked)}
            />
            Dim mode
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Mode controls */}
      {toolMode === "timer" ? (
        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-amber-950">
                Timer duration
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {presetsSec.map((ps) => {
                  const label =
                    ps < 60
                      ? `${ps}s`
                      : ps < 3600
                        ? `${Math.round(ps / 60)}m`
                        : `${Math.round(ps / 3600)}h`;
                  const active = ps === timerSec;
                  return (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => setTimerPreset(ps)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
                        active
                          ? "bg-amber-700 text-white hover:bg-amber-800"
                          : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <label className="block text-sm font-semibold text-amber-950">
                Custom seconds
                <input
                  type="number"
                  min={5}
                  max={6 * 3600}
                  value={timerSec}
                  onChange={(e) =>
                    setTimerSec(clamp(Number(e.target.value || 5), 5, 6 * 3600))
                  }
                  className="mt-1 w-44 rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>

              <div className="flex items-center gap-3">
                <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              Sound
            </label>

            <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
              <input
                type="checkbox"
                checked={softAlarm}
                onChange={(e) => setSoftAlarm(e.target.checked)}
                disabled={!sound}
              />
              Soft alarm
            </label>

            <div className="text-xs text-slate-600">
              If audio is blocked, click Start once, then toggle Sound.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div className="text-sm text-slate-700">
            Count up and read hours, minutes, and seconds in pure binary.
          </div>
          <div className="flex items-center gap-3">
            <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={reset}>
              Reset
            </Btn>
          </div>
        </div>
      )}

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 ${
          dimMode ? "bg-black text-white" : "bg-amber-50 text-amber-950"
        }`}
        style={{ minHeight: 420 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1400px, 100%);
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.92;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(48px, 7vw, 84px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
                color: rgba(255,255,255,.85);
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
                color: rgba(255,255,255,.8);
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 420 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              {toolMode === "stopwatch" ? "Stopwatch" : "Timer"} · Pure binary ·{" "}
              {practiceMode ? "Practice mode" : "Normal mode"}
            </div>

            {/* Decimal line (optional + practice reveal) */}
            <div className="flex flex-col items-center gap-2">
              {practiceMode && !revealed ? (
                <div className="rounded-2xl border border-amber-200 bg-white px-5 py-4 text-center">
                  <div className="text-sm font-extrabold text-amber-950">
                    Practice mode
                  </div>
                  <div className="mt-1 text-sm text-amber-800">
                    Read the binary bits first, then reveal the decimal time.
                  </div>
                  <Btn onClick={() => setRevealed(true)} className="mt-3">
                    Reveal time
                  </Btn>
                </div>
              ) : (
                <div className="font-mono text-4xl font-extrabold tracking-widest sm:text-5xl md:text-6xl text-center whitespace-nowrap">
                  {decimalTime}
                </div>
              )}

              {practiceMode && revealed ? (
                <Btn
                  kind="ghost"
                  onClick={() => setRevealed(false)}
                  className="py-2"
                >
                  Hide time
                </Btn>
              ) : null}
            </div>

            <div className="w-full max-w-[780px]">
              <BinaryGridPure
                h={h}
                m={m}
                s={s}
                showSeconds
                use24
                dark={false}
                showWeights={showWeights}
              />
            </div>

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: Space start/pause · R reset · F fullscreen · D dim · M
              mode · W weights · P practice · E reveal
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">
              {toolMode === "stopwatch" ? "Binary Stopwatch" : "Binary Timer"}
            </div>

            <div className="fs-time">
              {practiceMode && !revealed ? "— — : — —" : decimalTime}
            </div>

            <div className="fs-sub">
              Pure binary · {showWeights ? "Weights on" : "Weights off"} ·{" "}
              {practiceMode ? "Practice" : "Normal"}
            </div>

            <div className="w-full" style={{ maxWidth: 980 }}>
              <BinaryGridPure
                h={h}
                m={m}
                s={s}
                showSeconds
                use24
                dark={true}
                showWeights={showWeights}
              />
            </div>

            {practiceMode && !revealed ? (
              <Btn onClick={() => setRevealed(true)} className="mt-2">
                Reveal time
              </Btn>
            ) : null}

            <div className="fs-help">
              Space start/pause · R reset · F fullscreen · D dim · M mode · W
              weights · P practice · E reveal
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="font-extrabold text-amber-950">Accuracy notes</div>
        <p className="mt-2 leading-relaxed">
          This tool uses your browser clock. It works well for normal use, but
          some browsers reduce update frequency in background tabs to save
          power. For the smoothest display, keep this tab open (or use
          fullscreen).
        </p>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space start/pause · R reset · F fullscreen · D dim · M mode
          · W weights · P practice · E reveal
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BinaryStopwatchPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/binary-stopwatch";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Binary Stopwatch",
        url,
        description:
          "Binary stopwatch and binary timer with practice mode, bit weights legend, presets, fullscreen, dim mode, and optional soft alarm for countdown.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Binary Stopwatch",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a binary stopwatch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A binary stopwatch shows elapsed time using binary bits (0 and 1). Each lit bit represents a power of two, so you can read hours, minutes, and seconds in binary.",
            },
          },
          {
            "@type": "Question",
            name: "Is this also a binary timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Switch to Timer mode to run a binary countdown with presets or a custom duration. You can enable a soft alarm when the countdown ends.",
            },
          },
          {
            "@type": "Question",
            name: "What are bit weights (64/32/16/8/4/2/1)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Bit weights are the values each bit represents. For example, in a 7-bit column the weights are 64, 32, 16, 8, 4, 2, and 1. Add the weights of the lit bits to get the number.",
            },
          },
          {
            "@type": "Question",
            name: "What is practice mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Practice mode hides the decimal time so you can try reading the binary display first. Tap Reveal time to check your answer.",
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
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Binary Stopwatch</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Binary Stopwatch (Binary Timer + Practice Mode)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>binary stopwatch</strong> for counting up and a{" "}
            <strong>binary timer</strong> for counting down. Includes{" "}
            <strong>bit weights</strong>, <strong>practice mode</strong>, and a{" "}
            clean <strong>fullscreen</strong> view.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <BinaryStopwatchCard />

        {/* Quick-use hints (match your binary-clock style) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Use weights to learn fast
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Turn on <strong>Weights</strong> to show 32/16/8/4/2/1 under each
              column. Add lit weights to read the value.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Practice mode</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Enable <strong>Practice</strong> to hide the decimal time until
              you press <strong>Reveal time</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>Space</strong> = Start/Pause
              </li>
              <li>
                <strong>R</strong> = Reset
              </li>
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>D</strong> = Dim
              </li>
              <li>
                <strong>M</strong> = Mode
              </li>
              <li>
                <strong>W</strong> = Weights
              </li>
              <li>
                <strong>P</strong> = Practice
              </li>
              <li>
                <strong>E</strong> = Reveal
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free binary stopwatch and binary timer online
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page is a <strong>binary stopwatch</strong> (count up) and a{" "}
              <strong>binary timer</strong> (count down) designed for quick use
              and learning. The display shows hours, minutes, and seconds as
              binary bits so you can practice reading time in binary.
            </p>

            <p>
              If you are learning, enable <strong>bit weights</strong> to show
              the value of each row (like 32, 16, 8, 4, 2, 1). Turn on{" "}
              <strong>practice mode</strong> to hide the decimal time until you
              reveal it.
            </p>

            <p>
              Want the current time instead? Use{" "}
              <Link
                to="/binary-clock"
                className="font-semibold hover:underline"
              >
                Binary Clock
              </Link>
              . Prefer silent timing? Use{" "}
              <Link
                to="/silent-timer"
                className="font-semibold hover:underline"
              >
                Silent Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Binary Stopwatch FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is the difference between a binary stopwatch and binary
              timer?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A <strong>binary stopwatch</strong> counts up from zero. A{" "}
              <strong>binary timer</strong> counts down from a duration you set.
              This page does both, with the same binary display.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are bit weights (64/32/16/8/4/2/1)?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Bit weights are the values each row represents. Add the weights of
              the lit bits to get the number. Turn on <strong>Weights</strong>{" "}
              to show them under each column.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is practice mode?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Practice mode hides the decimal time so you can read the binary
              bits first. Tap <strong>Reveal time</strong> to check.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Will it keep running in the background?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It runs while the page is open, but some browsers reduce update
              frequency in background tabs to save power. Keep this tab open (or
              use fullscreen) for the smoothest display.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

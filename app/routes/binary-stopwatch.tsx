// app/routes/binary-stopwatch.tsx
import type { Route } from "./+types/binary-stopwatch";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ControlGroup,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import Disclaimer from "~/clients/components/binary-stopwatch/Disclaimer";
import FAQ from "~/clients/components/binary-stopwatch/FAQ";
import HowItWorks from "~/clients/components/binary-stopwatch/HowItWorks";
import KeyboardShortcuts from "~/clients/components/binary-stopwatch/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/binary-stopwatch/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Binary Stopwatch (Practice Mode + Countdown, Fullscreen)";
  const description =
    "Free binary stopwatch and countdown timer. Practice reading binary time with a bit-weight legend, presets, dim mode, fullscreen, and a soft alarm.";

  const url = "https://www.ilovetimers.com/binary-stopwatch";

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
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.png",
    },

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
   BIT + GRID
========================================================= */
function Bit({
  on,
  palette,
  sizePx,
}: {
  on: boolean;
  palette: {
    on: string;
    off: string;
    border: string;
    textOn: string;
    textOff: string;
  };
  sizePx: number;
}) {
  return (
    <div
      className="grid place-items-center rounded-xl border"
      style={{
        width: sizePx,
        height: sizePx,
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

/**
 * Hours uses 7 bits so it remains correct up to 99 hours.
 */
function BinaryGridPure({
  h,
  m,
  s,
  showWeights,
  dark,
  big,
}: {
  h: number;
  m: number;
  s: number;
  showWeights: boolean;
  dark: boolean;
  big: boolean;
}) {
  const hourBits = bitsOf(h, 7);
  const minBits = bitsOf(m, 6);
  const secBits = bitsOf(s, 6);

  const cols = [
    {
      key: "H",
      label: "Hours",
      bits: hourBits,
      weights: [64, 32, 16, 8, 4, 2, 1],
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
  ];

  const maxH = Math.max(...cols.map((c) => c.bits.length));

  const palette = useMemo(() => {
    if (dark) {
      return {
        bg: "rgba(255,255,255,.06)",
        border: "rgba(255,255,255,.14)",
        on: "rgba(255,255,255,.92)",
        off: "rgba(255,255,255,.16)",
        text: "rgba(255,255,255,.88)",
        label: "rgba(255,255,255,.80)",
        textOn: "rgba(0,0,0,.92)",
        textOff: "rgba(255,255,255,.70)",
      };
    }

    return {
      bg: "rgba(248,250,252,.95)",
      border: "rgba(148,163,184,.35)",
      on: "rgba(15,23,42,.92)",
      off: "rgba(148,163,184,.22)",
      text: "rgba(51,65,85,.92)",
      label: "rgba(71,85,105,.88)",
      textOn: "rgba(255,255,255,.95)",
      textOff: "rgba(15,23,42,.62)",
    };
  }, [dark]);

  const cellPx = big ? 34 : 18;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: palette.bg, borderColor: palette.border }}
    >
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
        }}
      >
        {cols.map((c) => {
          const padded = Array.from({ length: maxH - c.bits.length })
            .map(() => 0)
            .concat(c.bits);

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
                    sizePx={cellPx}
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
   TOOL
========================================================= */
type ToolMode = "stopwatch" | "timer";

function BinaryStopwatchTool() {
  const beep = useBeep();

  const [toolMode, setToolMode] = useState<ToolMode>("stopwatch");

  const [dimMode, setDimMode] = useState(false);
  const [showWeights, setShowWeights] = useState(false);

  const [practiceMode, setPracticeMode] = useState(false);
  const [revealed, setRevealed] = useState(true);

  const [running, setRunning] = useState(false);

  // Stopwatch
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

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  // IMPORTANT: fit the time only inside its own box (not the whole display),
  // otherwise the binary grid steals space and the time overflows/mis-centers.
  const timeBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const fsDark = dimMode && isFs;

  useEffect(() => {
    setRevealed(!practiceMode);
  }, [practiceMode]);

  useEffect(() => {
    if (toolMode !== "timer") return;
    if (running) return;
    setRemainingMs(timerSec * 1000);
    endPerfRef.current = null;
  }, [timerSec, toolMode, running]);

  useEffect(() => {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    startPerfRef.current = null;
    endPerfRef.current = null;
  }, [toolMode]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (toolMode === "stopwatch" && startPerfRef.current) {
        const now = performance.now();
        const nextElapsed =
          baseElapsedRef.current + (now - startPerfRef.current);
        baseElapsedRef.current = nextElapsed;
        startPerfRefRefCleanup();
        setElapsedMs(nextElapsed);
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, toolMode, remainingMs, sound, softAlarm, beep]);

  function startPerfRefRefCleanup() {
    startPerfRef.current = null;
  }

  const shownMs =
    toolMode === "stopwatch"
      ? Math.ceil(elapsedMs / 1000) * 1000
      : Math.ceil(remainingMs / 1000) * 1000;

  const totalSec = Math.max(0, Math.floor(shownMs / 1000));
  const h = clamp(Math.floor(totalSec / 3600), 0, 99);
  const m = clamp(Math.floor((totalSec % 3600) / 60), 0, 59);
  const s = clamp(totalSec % 60, 0, 59);

  function startPause() {
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
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
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
    } else if (k === "s") {
      setSound((x) => !x);
    }
  };

  const decimalTime = msToClock(shownMs);

  const statusLabel = !running
    ? "Ready"
    : toolMode === "stopwatch"
      ? "Stopwatch running"
      : "Timer running";

  const fitFontPx = useFitText({
    containerRef: timeBoxRef,
    textRef: timeTextRef,
    deps: [decimalTime, isFs, practiceMode, revealed, toolMode, statusLabel],
    minPx: 52,
    maxPx: isFs ? 560 : 320,
    paddingAllowancePx: isFs ? 36 : 32,
    fitAxis: "box",
  });

  const shellTone = fsDark
    ? "border-slate-800 bg-slate-950 text-white"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const innerPanelTone = fsDark
    ? "border-slate-800 bg-slate-900/40"
    : "border-slate-200 bg-white";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Binary Stopwatch"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <div className="flex items-center gap-2">
              <Chip
                onClick={() => setToolMode("stopwatch")}
                active={toolMode === "stopwatch"}
              >
                Stopwatch
              </Chip>
              <Chip
                onClick={() => setToolMode("timer")}
                active={toolMode === "timer"}
              >
                Timer
              </Chip>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={showWeights}
                onChange={(e) => setShowWeights(e.target.checked)}
                className="accent-amber-500"
              />
              Weights
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
                className="accent-amber-500"
              />
              Practice
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={dimMode}
                onChange={(e) => setDimMode(e.target.checked)}
                className="accent-amber-500"
              />
              Dim
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          className={[
            "timer-primary-surface mt-4 flex flex-col items-center justify-center rounded-2xl border",
            !fsDark ? "timer-display-surface" : "",
            shellTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            // reserve room for fullscreen bars and prevent overflow clipping
            minHeight: isFs ? 0 : 460,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.8rem" : undefined,
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
          {/* Centered content column with width cap */}
          <div
            className="w-full"
            style={{
              maxWidth: isFs ? 1400 : 1200,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: isFs ? 22 : 16,
            }}
          >
            <div
              className={[
                "timer-history-binary-status text-center text-xs font-extrabold uppercase tracking-widest",
                fsDark ? "text-slate-200" : "text-slate-700",
              ].join(" ")}
            >
              {statusLabel} · {toolMode === "stopwatch" ? "Stopwatch" : "Timer"}{" "}
              · Pure binary · {practiceMode ? "Practice" : "Normal"}
            </div>

            {/* TIME BOX (this is what we fit against) */}
            <div
              ref={timeBoxRef}
              className="timer-history-binary-value flex w-full items-center justify-center"
              style={{
                // cap the time region so it never pushes the grid off-screen
                height: isFs ? "min(44vh, 520px)" : "min(24vh, 260px)",
              }}
            >
              {practiceMode && !revealed ? (
                <div
                  className={[
                    "w-full max-w-2xl rounded-2xl border p-4 text-center",
                    innerPanelTone,
                  ].join(" ")}
                >
                  <div
                    className={[
                      "text-sm font-extrabold",
                      fsDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Practice mode
                  </div>
                  <div
                    className={[
                      "mt-1 text-sm",
                      fsDark ? "text-slate-200" : "text-slate-700",
                    ].join(" ")}
                  >
                    Read the binary bits first, then reveal the decimal time.
                  </div>
                  <Btn onClick={() => setRevealed(true)} className="mt-3">
                    Reveal time
                  </Btn>
                </div>
              ) : (
                <span
                  ref={timeTextRef}
                  className={[
                    "block text-center whitespace-nowrap font-mono font-extrabold",
                    isFs
                      ? "tracking-wide sm:tracking-widest"
                      : "tracking-widest",
                  ].join(" ")}
                  style={{
                    fontSize: fitFontPx,
                    lineHeight: "1",
                    transform: "translateZ(0)",
                  }}
                >
                  {decimalTime}
                </span>
              )}
            </div>

            {practiceMode && revealed ? (
              <div className="flex justify-center">
                <Btn
                  kind="ghost"
                  onClick={() => setRevealed(false)}
                  className="py-2"
                >
                  Hide time
                </Btn>
              </div>
            ) : null}

            <div className="w-full flex justify-center">
              <div className="w-full" style={{ maxWidth: isFs ? 1100 : 980 }}>
                <BinaryGridPure
                  h={h}
                  m={m}
                  s={s}
                  showWeights={showWeights}
                  dark={fsDark}
                  big={isFs}
                />
              </div>
            </div>

            {!isFs && (
              <div className="text-xs text-slate-600 text-center">
                Tip: click the card once so keyboard shortcuts work immediately.
              </div>
            )}
          </div>
        </div>

        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
              {practiceMode ? (
                <Btn
                  kind="ghost"
                  onClick={() => setRevealed(true)}
                  disabled={revealed}
                >
                  Reveal
                </Btn>
              ) : null}
            </ControlGroup>

            {toolMode === "timer" ? (
              <PresetGroup title="Timer presets">
                {presetsSec.map((ps) => {
                  const label =
                    ps < 60
                      ? `${ps}s`
                      : ps < 3600
                        ? `${Math.round(ps / 60)}m`
                        : `${Math.round(ps / 3600)}h`;
                  return (
                    <Chip
                      key={ps}
                      active={ps === timerSec}
                      onClick={() => setTimerPreset(ps)}
                      disabled={running}
                    >
                      {label}
                    </Chip>
                  );
                })}
              </PresetGroup>
            ) : null}

            <SettingGroup
              title="Binary display settings"
              description={
                toolMode === "stopwatch"
                  ? "Count up and read hours, minutes, and seconds in pure binary."
                  : "Choose timer length, practice options, and the binary display format."
              }
            >
              <SettingRow>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                    Mode
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      active={toolMode === "stopwatch"}
                      onClick={() => setToolMode("stopwatch")}
                    >
                      Stopwatch
                    </Chip>
                    <Chip
                      active={toolMode === "timer"}
                      onClick={() => setToolMode("timer")}
                    >
                      Timer
                    </Chip>
                  </div>
                </div>

                {toolMode === "timer" ? (
                  <Field
                    label="Custom seconds"
                    type="number"
                    min={5}
                    max={6 * 3600}
                    value={timerSec}
                    disabled={running}
                    onChange={(e) =>
                      setTimerSec(
                        clamp(Number(e.target.value || 5), 5, 6 * 3600),
                      )
                    }
                  />
                ) : (
                  <div className="ilt-helper-text flex items-end">
                    Stopwatch mode counts upward from zero.
                  </div>
                )}

                <div className="flex flex-wrap items-end gap-2">
                  <Toggle
                    label="Weights"
                    checked={showWeights}
                    onCheckedChange={setShowWeights}
                  />
                  <Toggle
                    label="Practice"
                    checked={practiceMode}
                    onCheckedChange={setPracticeMode}
                  />
                  <Toggle
                    label="Dim"
                    checked={dimMode}
                    onCheckedChange={setDimMode}
                  />
                  <Toggle
                    label="Sound"
                    checked={sound}
                    onCheckedChange={setSound}
                  />
                  <Toggle
                    label="Soft alarm"
                    checked={softAlarm}
                    onCheckedChange={setSoftAlarm}
                    disabled={!sound}
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-history-actions">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-history-shortcut">
              <span className="ilt-keycap">Space</span> start/pause ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen ·{" "}
              <span className="ilt-keycap">D</span> dim ·{" "}
              <span className="ilt-keycap">M</span> mode ·{" "}
              <span className="ilt-keycap">W</span> weights ·{" "}
              <span className="ilt-keycap">P</span> practice ·{" "}
              <span className="ilt-keycap">E</span> reveal ·{" "}
              <span className="ilt-keycap">S</span> sound
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                onClick={() => setToolMode("stopwatch")}
                active={toolMode === "stopwatch"}
              >
                Stopwatch
              </Chip>
              <Chip
                onClick={() => setToolMode("timer")}
                active={toolMode === "timer"}
              >
                Timer
              </Chip>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={showWeights}
                  onChange={(e) => setShowWeights(e.target.checked)}
                  className="accent-amber-500"
                />
                Weights
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={practiceMode}
                  onChange={(e) => setPracticeMode(e.target.checked)}
                  className="accent-amber-500"
                />
                Practice
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={dimMode}
                  onChange={(e) => setDimMode(e.target.checked)}
                  className="accent-amber-500"
                />
                Dim
              </label>

              {toolMode === "timer" ? (
                <div className="flex flex-wrap items-center gap-2">
                  {presetsSec.map((ps) => {
                    const label =
                      ps < 60
                        ? `${ps}s`
                        : ps < 3600
                          ? `${Math.round(ps / 60)}m`
                          : `${Math.round(ps / 3600)}h`;
                    return (
                      <Chip
                        key={`fs-${ps}`}
                        onClick={() => setTimerPreset(ps)}
                        active={ps === timerSec}
                      >
                        {label}
                      </Chip>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn
                  kind={running ? "solid" : "ghost"}
                  onClick={startPause}
                >
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
                {practiceMode && !revealed ? (
                  <Btn
                    kind="solid"
                    onClick={() => setRevealed(true)}
                  >
                    Reveal
                  </Btn>
                ) : null}
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap to start/pause · Space · R reset · F fullscreen · W weights
                · P practice · E reveal · S sound
              </div>
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
export default function BinaryStopwatchPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/binary-stopwatch";

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
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Binary Stopwatch",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<BinaryStopwatchTool />}
        title="Binary Stopwatch (Binary Timer + Practice Mode)"
        description="Use it as a binary stopwatch or binary countdown timer. Toggle weights and practice mode, then go fullscreen for a clean, readable display."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}

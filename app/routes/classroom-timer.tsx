// app/routes/classroom-timer.tsx
import type { Route } from "./+types/classroom-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Classroom Timer (Fullscreen Countdown for Smartboards & Projectors)";
  const description =
    "Free classroom timer for teachers. Big fullscreen countdown for smartboards and projectors with quick presets, custom minutes, optional sound, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/classroom-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "classroom timer",
        "timer for teachers",
        "smartboard timer",
        "interactive whiteboard timer",
        "classroom countdown timer",
        "projector timer",
        "teacher timer",
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

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 140, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * Uses ResizeObserver + rAF, binary-searching the best font size.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
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

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
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
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
          {left}
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
   CLASSROOM TIMER CARD
========================================================= */
function ClassroomTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 30, 45, 60],
    [],
  );

  const [label, setLabel] = useState("Classroom Timer");
  const [minutes, setMinutes] = useState(5);

  const baseMs = minutes * 60 * 1000;

  const [remaining, setRemaining] = useState(baseMs);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [endChime, setEndChime] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Layout stability: lock the time line to a fixed character width so digits don't reflow.
  // 1) tabular-nums: monospaced digits
  // 2) minWidth on the time line: reserve max width (H:MM:SS -> 7 chars, no-hours -> 4 chars)
  const timeMinWidthCh = useMemo(() => (minutes >= 60 ? 7 : 5), [minutes]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemaining(baseMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
    stopRaf();
  }

  useEffect(() => {
    setRunning(false);
    setRemaining(baseMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
    stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    const startMs = remaining <= 0 ? baseMs : remaining;

    endedRef.current = false;
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + Math.max(0, startMs);

    if (remaining <= 0) setRemaining(startMs);
    setRunning(true);
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  function addSeconds(deltaSeconds: number) {
    const delta = deltaSeconds * 1000;

    setRemaining((r) => {
      const next = clamp(r + delta, 0, 3 * 60 * 60 * 1000);

      if (running && endRef.current) {
        endRef.current = endRef.current + delta;
      }

      if (delta > 0 && next > 0) endedRef.current = false;

      return next;
    });
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.07);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        stopRaf();

        if (!endedRef.current) {
          endedRef.current = true;
          if (sound && endChime) {
            beep(660, 180, 0.1);
            window.setTimeout(() => beep(990, 220, 0.1), 220);
          } else if (sound && !endChime) {
            beep(660, 220, 0.1);
          }
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, endChime, beep]);

  const displayMs =
    running || remaining <= 0 || remaining !== baseMs ? remaining : baseMs;
  const shownTime = msToClock(Math.ceil(displayMs / 1000) * 1000);

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const finished = !running && remaining <= 0;

  const statusLabel = finished ? "Time is up" : running ? "Running" : "Ready";

  const displayTone = finished
    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
    : urgent
      ? "border-rose-200 bg-amber-50 text-rose-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  // IMPORTANT: don't include shownTime in deps to prevent font-size recalculation on every second.
  // The text width is stabilized via tabular-nums + minWidth, so it can stay steady.
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [statusLabel, isFs, running, finished, minutes],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 80,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "+") {
      addSeconds(60);
    } else if (k === "-") {
      addSeconds(-60);
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
        title="Classroom Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
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
                checked={finalCountdownBeeps}
                onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              Final beeps
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={endChime}
                onChange={(e) => setEndChime(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              End chime
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

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap ml-auto items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="accent-amber-500"
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                  className="accent-amber-500"
                />
                Final beeps
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={endChime}
                  onChange={(e) => setEndChime(e.target.checked)}
                  disabled={!sound}
                  className="accent-amber-500"
                />
                End chime
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

        {!isFs && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {presetsMin.map((m) => (
              <Chip
                key={m}
                active={m === minutes}
                onClick={() => setPreset(m)}
                disabled={running}
              >
                {m}m
              </Chip>
            ))}
          </div>
        )}

        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
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
          onClick={(e) => {
            if (isFs && e.target === e.currentTarget) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click empty space to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {label.trim() ? label.trim() : "Classroom Timer"}
          </div>

          <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-600">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center tabular-nums",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              // Reserve a stable width so the fit algorithm and layout don't jump as digits change.
              minWidth: `${timeMinWidthCh}ch`,
            }}
          >
            {shownTime}
          </span>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Quick adjust
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Btn kind="ghost" onClick={() => addSeconds(-60)}>
                  -1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(60)}>
                  +1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(300)}>
                  +5 min
                </Btn>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Space start/pause · R reset · F fullscreen · + add 1 min · - sub
                1 min
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="block text-sm font-semibold text-slate-900">
              Minutes
              <input
                type="number"
                min={1}
                max={180}
                value={minutes}
                disabled={running}
                onChange={(e) =>
                  setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Label (optional)
              <input
                type="text"
                value={label}
                disabled={running}
                onChange={(e) => setLabel(e.target.value.slice(0, 40))}
                placeholder="Transition, Quiz, Centers..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <div className="flex items-end gap-3">
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setMinutes(m)}
                  disabled={running}
                >
                  {m}m
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind="ghost" onClick={() => addSeconds(-60)}>
                  -1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(60)}>
                  +1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(300)}>
                  +5 min
                </Btn>
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap empty space to start/pause · Space · R · + · -
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
export default function ClassroomTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  void nowISO;

  const url = "https://www.ilovetimers.com/classroom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Classroom Timer",
        url,
        description:
          "Fullscreen classroom timer for teachers and smartboards. Big countdown, quick presets, optional sound, and keyboard shortcuts.",
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
            name: "Classroom Timer",
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

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Classroom Timer (Fullscreen Countdown)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Big, readable countdown for smartboards and projectors. Use presets
            or set minutes, then run fullscreen with simple controls.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <ClassroomTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Classroom Timer</span>
        </p>
      </section>
    </main>
  );
}

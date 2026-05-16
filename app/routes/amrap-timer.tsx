// app/routes/amrap-timer.tsx
import type { Route } from "./+types/amrap-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Disclaimer from "~/clients/components/amrap-timer/Disclaimer";
import FAQ from "~/clients/components/amrap-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/amrap-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/amrap-timer/PopularUseCases";
import HowItWorks from "~/clients/components/home/HowItWorks";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "AMRAP Timer (CrossFit Countdown + Rep Counter, Fullscreen)";
  const description =
    "Free AMRAP timer for CrossFit. Set minutes, run a fullscreen countdown, and track reps or rounds with big tap buttons or keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/amrap-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "amrap timer",
        "crossfit amrap timer",
        "amrap countdown",
        "amrap rep counter",
        "amrap rounds timer",
        "as many reps as possible timer",
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

  return useCallback((freq = 880, duration = 120, gain = 0.1) => {
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

const BigTap = ({
  label,
  value,
  onPlus,
  onMinus,
  disabled,
}: {
  label: string;
  value: number;
  onPlus: () => void;
  onMinus: () => void;
  disabled?: boolean;
}) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
    <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
      {label}
    </div>
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled}
        className="cursor-pointer h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-xl font-extrabold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>

      <div className="min-w-0 text-center">
        <div className="text-4xl font-extrabold text-slate-950">{value}</div>
        <div className="text-xs text-slate-600">Tap + / −</div>
      </div>

      <button
        type="button"
        onClick={onPlus}
        disabled={disabled}
        className="cursor-pointer h-12 w-12 rounded-xl bg-amber-500 text-xl font-extrabold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

/* =========================================================
   AMRAP TIMER CARD
========================================================= */
function AmrapTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [4, 6, 8, 10, 12, 15, 20, 25, 30], []);
  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);

  const [minutes, setMinutes] = useState(12);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [inPrep, setInPrep] = useState(false);

  const [reps, setReps] = useState(0);
  const [rounds, setRounds] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetTimerOnly() {
    setRunning(false);
    setInPrep(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  function resetAll() {
    resetTimerOnly();
    setReps(0);
    setRounds(0);
  }

  useEffect(() => {
    resetTimerOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, prepSeconds]);

  useEffect(() => {
    return () => {
      stopRaf();
    };
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    if (prepSeconds > 0) {
      setInPrep(true);
      setRemaining(prepSeconds * 1000);
      endRef.current = performance.now() + prepSeconds * 1000;
      setRunning(true);
    } else {
      setInPrep(false);
      setRemaining(minutes * 60 * 1000);
      endRef.current = performance.now() + minutes * 60 * 1000;
      setRunning(true);
    }
  }

  function resume() {
    stopRaf();
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + remaining;
    setRunning(true);
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    if (remaining <= 0) {
      startNew();
      return;
    }

    resume();
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

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        if (inPrep) {
          if (sound) beep(660, 160, 0.1);

          setInPrep(false);
          setRemaining(minutes * 60 * 1000);
          endRef.current = performance.now() + minutes * 60 * 1000;
          lastBeepSecondRef.current = null;

          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        endRef.current = null;
        lastBeepSecondRef.current = null;
        hasStartedRef.current = false;

        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }

        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, inPrep, minutes, sound, finalBeeps, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(minutes * 60 * 1000);

  const urgent = running && !inPrep && remaining > 0 && remaining <= 10_000;

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : inPrep
      ? "Get ready"
      : "AMRAP running";

  const displayTone = inPrep
    ? "border-slate-200 bg-slate-50 text-slate-950"
    : urgent
      ? "border-rose-200 bg-amber-50 text-rose-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "+") {
      setReps((x) => x + 1);
    } else if (k === "-") {
      setReps((x) => Math.max(0, x - 1));
    } else if (k === "arrowup") {
      setRounds((x) => x + 1);
    } else if (k === "arrowdown") {
      setRounds((x) => Math.max(0, x - 1));
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
        title="AMRAP Timer"
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
                checked={finalBeeps}
                onChange={(e) => setFinalBeeps(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              Final beeps
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn kind={"solid"} onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset all
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 ml-auto">
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
                  checked={finalBeeps}
                  onChange={(e) => setFinalBeeps(e.target.checked)}
                  disabled={!sound}
                  className="accent-amber-500"
                />
                Final beeps
              </label>

              <div className="flex items-center gap-2">
                <Btn kind={"solid"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetAll}>
                  Reset all
                </Btn>
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
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1 cursor-pointer" : "",
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
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {running || hasStartedRef.current ? shownTime : readyTime}
          </span>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Score
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-950">
                {rounds} rounds + {reps} reps
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                + / − reps · ↑ / ↓ rounds · Space start/pause · R reset all · F
                fullscreen · S sound
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                AMRAP length (minutes)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
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

              <label className="mt-3 block text-sm font-semibold text-slate-900">
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

              <div className="mt-2 text-xs text-slate-600">
                Common AMRAPs: 8, 10, 12, 15, 20 minutes.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Prep countdown (optional)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {prepPresets.map((s) => (
                  <Chip
                    key={s}
                    active={s === prepSeconds}
                    onClick={() => setPrepSeconds(s)}
                    disabled={running}
                  >
                    {s === 0 ? "None" : `${s}s`}
                  </Chip>
                ))}
              </div>

              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Prep seconds
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={prepSeconds}
                  disabled={running}
                  onChange={(e) =>
                    setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>
            </div>
          </div>
        )}

        {/* Score controls */}
        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BigTap
              label="Reps"
              value={reps}
              onPlus={() => setReps((x) => x + 1)}
              onMinus={() => setReps((x) => Math.max(0, x - 1))}
              disabled={false}
            />
            <BigTap
              label="Rounds"
              value={rounds}
              onPlus={() => setRounds((x) => x + 1)}
              onMinus={() => setRounds((x) => Math.max(0, x - 1))}
              disabled={false}
            />
          </div>
        )}

        {/* Fullscreen bottom controls */}
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
              {prepPresets.map((s) => (
                <Chip
                  key={`prep-${s}`}
                  active={s === prepSeconds}
                  onClick={() => setPrepSeconds(s)}
                  disabled={running}
                >
                  {s === 0 ? "No prep" : `${s}s prep`}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetAll}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · +/− reps · ↑/↓ rounds
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
export default function AmrapTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/amrap-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "AMRAP Timer",
        url,
        description:
          "AMRAP timer (As Many Rounds/Reps As Possible) with countdown, optional prep, rep/round counter, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "AMRAP Timer", item: url },
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
            AMRAP Timer (Countdown + Rep Counter)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set minutes, optional prep, then run a big countdown. Track reps and
            rounds with tap buttons or keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <AmrapTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">AMRAP Timer</span>
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

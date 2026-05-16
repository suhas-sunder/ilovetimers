// app/routes/exam-timer.tsx
import type { Route } from "./+types/exam-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/exam-timer/HowItWorks";
import Disclaimer from "~/clients/components/exam-timer/Disclaimer";
import FAQ from "~/clients/components/exam-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/exam-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/exam-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Exam Timer (Fullscreen Countdown for Tests & Practice)";
  const description =
    "Free exam timer for tests and timed practice. Big fullscreen countdown with presets, custom minutes, optional sound, and keyboard shortcuts. Great for SAT-style timing and mock exams.";

  const url = "https://www.ilovetimers.com/exam-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "exam timer",
        "test timer",
        "timed practice timer",
        "practice test timer",
        "mock exam timer",
        "sat timer",
        "countdown timer for exams",
        "fullscreen timer",
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

// WebAudio beep (same style as other pages)
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

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
   EXAM TIMER CARD
========================================================= */
function ExamTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90, 120, 180],
    [],
  );

  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [warnings, setWarnings] = useState(true);
  const [warnAt5Min, setWarnAt5Min] = useState(true);
  const [warnAt1Min, setWarnAt1Min] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const lastBeepSecondRef = useRef<number | null>(null);
  const warned5Ref = useRef(false);
  const warned1Ref = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const totalMs = minutes * 60 * 1000;

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    setRemaining(totalMs);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    warned5Ref.current = false;
    warned1Ref.current = false;
    stopRaf();
  }, [totalMs]);

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

      if (sound && warnings) {
        if (warnAt5Min && !warned5Ref.current && rem > 0 && rem <= 5 * 60_000) {
          warned5Ref.current = true;
          beep(740, 180);
        }
        if (warnAt1Min && !warned1Ref.current && rem > 0 && rem <= 60_000) {
          warned1Ref.current = true;
          beep(880, 180);
        }
      }

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    sound,
    warnings,
    warnAt5Min,
    warnAt1Min,
    finalCountdownBeeps,
    beep,
  ]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    setRemaining(totalMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    warned5Ref.current = false;
    warned1Ref.current = false;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const urgent = running && remaining > 0 && remaining <= 60_000;
  const midWarn = running && remaining > 60_000 && remaining <= 5 * 60_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const statusLabel = running
    ? "Running"
    : remaining < totalMs && remaining > 0
      ? "Paused"
      : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      minutes,
      sound,
      warnings,
      warnAt1Min,
      warnAt5Min,
      finalCountdownBeeps,
    ],
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
      reset();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const disableTimeSetting = running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Exam Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="ml-auto flex flex-wrap items-center gap-3">
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

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · R reset · F fullscreen
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="cursor-pointer"
                />
                Sound
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={warnings}
                  onChange={(e) => setWarnings(e.target.checked)}
                  disabled={!sound}
                  className="cursor-pointer"
                />
                Warnings
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                  className="cursor-pointer"
                />
                Final beeps
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={warnAt5Min}
                  onChange={(e) => setWarnAt5Min(e.target.checked)}
                  disabled={!sound || !warnings}
                  className="cursor-pointer"
                />
                5 min warning
              </label>

              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={warnAt1Min}
                  onChange={(e) => setWarnAt1Min(e.target.checked)}
                  disabled={!sound || !warnings}
                  className="cursor-pointer"
                />
                1 min warning
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreset(m)}
                  disabled={disableTimeSetting}
                  className={[
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                    disableTimeSetting ? "cursor-not-allowed opacity-60" : "",
                    m === minutes
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {m}m
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block text-sm font-semibold text-slate-900">
                Custom minutes
                <input
                  type="number"
                  min={1}
                  max={360}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 360))
                  }
                  disabled={disableTimeSetting}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <div className="flex items-end gap-3">
                <Btn onClick={startPause} disabled={false}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            urgent
              ? "ring-2 ring-rose-200"
              : midWarn
                ? "ring-2 ring-amber-200"
                : "",
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
            {statusLabel}
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

          {!isFs && (
            <div className="mt-2 text-xs text-slate-600">
              Space start/pause · R reset · F fullscreen
            </div>
          )}

          {!isFs && warnings && (warnAt5Min || warnAt1Min) ? (
            <div className="mt-1 text-xs text-slate-600">
              Warnings: {warnAt5Min ? "5m" : ""}{" "}
              {warnAt5Min && warnAt1Min ? "·" : ""} {warnAt1Min ? "1m" : ""}
              {finalCountdownBeeps ? " · last 5s" : ""}
            </div>
          ) : null}

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Settings
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {sound ? "Sound on" : "Sound off"}
                    {sound && warnings && (warnAt5Min || warnAt1Min)
                      ? ` · Warnings ${warnAt5Min ? "5m" : ""}${warnAt5Min && warnAt1Min ? " + " : ""}${warnAt1Min ? "1m" : ""}`
                      : ""}
                    {sound && finalCountdownBeeps ? " · Final beeps" : ""}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap time to start/pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSound((v) => !v)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                Sound: {sound ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setWarnings((v) => !v)}
                disabled={!sound}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Warnings: {warnings ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setFinalCountdownBeeps((v) => !v)}
                disabled={!sound}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Final beeps: {finalCountdownBeeps ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setWarnAt5Min((v) => !v)}
                disabled={!sound || !warnings}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                5m: {warnAt5Min ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setWarnAt1Min((v) => !v)}
                disabled={!sound || !warnings}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                1m: {warnAt1Min ? "On" : "Off"}
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs text-slate-600">
              Duration: {minutes} min
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
export default function ExamTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/exam-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Exam Timer",
        url,
        description:
          "Fullscreen exam timer for tests and timed practice with big countdown, presets, optional warnings, and keyboard shortcuts.",
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
            name: "Exam Timer",
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
            Exam Timer (Fullscreen Countdown)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Big, readable countdown with presets, custom minutes, optional
            beeps, and keyboard shortcuts.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <ExamTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Exam Timer</span>
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

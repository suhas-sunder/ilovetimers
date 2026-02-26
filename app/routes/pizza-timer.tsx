// app/routes/pizza-timer.tsx
import type { Route } from "./+types/pizza-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/pizza-timer/HowItWorks";
import Disclaimer from "~/clients/components/pizza-timer/Disclaimer";
import FAQ from "~/clients/components/pizza-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/pizza-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/pizza-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Pizza Timer (Frozen Pizza Presets, Fullscreen)";
  const description =
    "Set a simple pizza timer with quick presets for frozen pizza. Big, easy-to-read countdown to help you pull your pizza out at the right time.";

  const url = "https://www.ilovetimers.com/pizza-timer";

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
   PIZZA TIMER CARD
========================================================= */
type HeatMethod = "oven" | "air_fryer" | "skillet" | "custom";

type PizzaPreset = {
  key: string;
  label: string;
  method: HeatMethod;
  minutes: number;
  seconds: number;
};

const PRESETS: PizzaPreset[] = [
  {
    key: "frozen_oven_14",
    label: "Frozen (Oven 14m)",
    method: "oven",
    minutes: 14,
    seconds: 0,
  },
  {
    key: "frozen_oven_16",
    label: "Frozen (Oven 16m)",
    method: "oven",
    minutes: 16,
    seconds: 0,
  },
  {
    key: "frozen_air_10",
    label: "Frozen (Air fryer 10m)",
    method: "air_fryer",
    minutes: 10,
    seconds: 0,
  },
  {
    key: "reheat_slice_6",
    label: "Reheat slice (6m)",
    method: "oven",
    minutes: 6,
    seconds: 0,
  },
  {
    key: "skillet_slice_5",
    label: "Skillet slice (5m)",
    method: "skillet",
    minutes: 5,
    seconds: 0,
  },
];

function PizzaTimerCard() {
  const beep = useBeep();

  const [method, setMethod] = useState<HeatMethod>("oven");
  const [minutes, setMinutes] = useState(14);
  const [seconds, setSeconds] = useState(0);

  const initialMs = useMemo(
    () => (Math.max(0, minutes) * 60 + clamp(seconds, 0, 59)) * 1000,
    [minutes, seconds],
  );

  const [remaining, setRemaining] = useState(initialMs);
  const remainingRef = useRef<number>(initialMs);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const [running, setRunning] = useState(false);
  const runningRef = useRef<boolean>(false);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [checkAtMin, setCheckAtMin] = useState<number>(2);

  const [reminderMode, setReminderMode] = useState<
    "none" | "triple" | "repeat"
  >("repeat");

  const reminderFiredRef = useRef(false);
  const reminderRepeatUntilRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const stopReminder = useCallback(() => {
    reminderRepeatUntilRef.current = null;
  }, []);

  const playReminder = useCallback(() => {
    if (!sound || reminderMode === "none") return;

    if (reminderMode === "triple") {
      beep(740, 140);
      window.setTimeout(() => beep(740, 140), 220);
      window.setTimeout(() => beep(740, 140), 440);
      return;
    }

    const until = performance.now() + 10_000;
    reminderRepeatUntilRef.current = until;

    const loop = () => {
      const u = reminderRepeatUntilRef.current;
      if (!u) return;
      if (performance.now() >= u) {
        reminderRepeatUntilRef.current = null;
        return;
      }
      beep(740, 140);
      window.setTimeout(loop, 2000);
    };

    loop();
  }, [sound, reminderMode, beep]);

  const setTimeFromInputs = useCallback(
    (nextMin: number, nextSec: number) => {
      const m = clamp(nextMin, 0, 180);
      const s = clamp(nextSec, 0, 59);
      setMinutes(m);
      setSeconds(s);

      const ms = (m * 60 + s) * 1000;
      setRemaining(ms);
      remainingRef.current = ms;

      setRunning(false);
      runningRef.current = false;

      endRef.current = null;
      lastBeepSecondRef.current = null;

      reminderFiredRef.current = false;
      stopReminder();
    },
    [stopReminder],
  );

  function applyPreset(p: PizzaPreset) {
    setMethod(p.method);

    const ms = (p.minutes * 60 + p.seconds) * 1000;
    setMinutes(p.minutes);
    setSeconds(p.seconds);
    setRemaining(ms);
    remainingRef.current = ms;

    setRunning(false);
    runningRef.current = false;

    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (p.method === "air_fryer") setCheckAtMin(2);
    else if (p.method === "skillet") setCheckAtMin(1);
    else setCheckAtMin(2);

    reminderFiredRef.current = false;
    stopReminder();
  }

  // If user changes method manually, treat as custom but do not stomp the time.
  useEffect(() => {
    if (method !== "custom") return;
    // no-op
  }, [method]);

  // Main RAF loop driven by running only (no "remaining" dependency).
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopReminder();
      return;
    }

    // Starting a run: set end time from latest remainingRef.
    endRef.current = performance.now() + Math.max(0, remainingRef.current);
    reminderFiredRef.current = false;
    stopReminder();
    lastBeepSecondRef.current = null;

    const tick = () => {
      const now = performance.now();
      const end = endRef.current ?? now;
      const rem = Math.max(0, end - now);

      // push to state (and ref via effect)
      setRemaining(rem);

      // check-early reminder
      const checkAtMs = clamp(checkAtMin, 0, 60) * 60 * 1000;
      if (
        sound &&
        !reminderFiredRef.current &&
        reminderMode !== "none" &&
        checkAtMs > 0 &&
        rem <= checkAtMs &&
        rem > Math.max(0, checkAtMs - 400)
      ) {
        reminderFiredRef.current = true;
        playReminder();
      }

      // final countdown beeps (5..1)
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
        runningRef.current = false;

        lastBeepSecondRef.current = null;
        reminderFiredRef.current = false;
        stopReminder();
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    stopRaf,
    stopReminder,
    sound,
    finalCountdownBeeps,
    beep,
    checkAtMin,
    reminderMode,
    playReminder,
  ]);

  // Keep remaining in sync when inputs change while not running.
  useEffect(() => {
    if (runningRef.current) return;
    const ms = initialMs;
    setRemaining(ms);
    remainingRef.current = ms;

    endRef.current = null;
    lastBeepSecondRef.current = null;
    reminderFiredRef.current = false;
    stopReminder();
  }, [initialMs, stopReminder]);

  function reset() {
    const ms = initialMs;

    setRunning(false);
    runningRef.current = false;

    setRemaining(ms);
    remainingRef.current = ms;

    endRef.current = null;
    lastBeepSecondRef.current = null;

    reminderFiredRef.current = false;
    stopReminder();
  }

  function startPause() {
    if (!running && initialMs <= 0) return;

    if (!running && sound) beep(0, 1); // prime audio
    setRunning((r) => {
      const next = !r;
      runningRef.current = next;
      return next;
    });
  }

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      urgent,
      running,
      method,
      checkAtMin,
      sound,
      reminderMode,
    ],
    minPx: 56,
    maxPx: isFs ? 560 : 380,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  const methodLabel = useMemo(() => {
    if (method === "air_fryer") return "Air fryer";
    if (method === "skillet") return "Skillet";
    if (method === "oven") return "Oven";
    return "Custom";
  }, [method]);

  const statusLabel = running
    ? "Running"
    : remaining > 0 && remaining < initialMs
      ? "Paused"
      : "Ready";

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

  const disabledStart = initialMs <= 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Pizza Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={startPause}
              className="py-1 text-sm"
              disabled={disabledStart}
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
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
                Pizza Timer (Presets + Fullscreen)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Big, readable countdown with presets, reminders, sound, and
                fullscreen.
              </p>
            </div>

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

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            urgent ? "border-rose-200 bg-rose-50" : "border-slate-200",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {methodLabel} · {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          {!isFs && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Check at {checkAtMin} min left
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Reminder{" "}
                {sound
                  ? reminderMode === "repeat"
                    ? "repeating"
                    : reminderMode === "triple"
                      ? "triple"
                      : "off"
                  : "off"}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Sound {sound ? "on" : "off"}
              </span>
            </div>
          )}
        </div>

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((p) => {
                  const active =
                    p.method === method &&
                    p.minutes === minutes &&
                    p.seconds === seconds;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        active
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  );
                })}

                <span className="ml-1 text-xs font-semibold text-slate-600">
                  Method: <span className="text-slate-900">{methodLabel}</span>
                </span>
              </div>
            </div>

            <label className="lg:col-span-3 block text-sm font-semibold text-slate-900">
              Minutes
              <input
                type="number"
                min={0}
                max={180}
                value={minutes}
                onChange={(e) => {
                  setMethod("custom");
                  setTimeFromInputs(Number(e.target.value || 0), seconds);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="lg:col-span-3 block text-sm font-semibold text-slate-900">
              Seconds
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => {
                  setMethod("custom");
                  setTimeFromInputs(minutes, Number(e.target.value || 0));
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="lg:col-span-3 block text-sm font-semibold text-slate-900">
              Method
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HeatMethod)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value="oven">Oven</option>
                <option value="air_fryer">Air fryer</option>
                <option value="skillet">Skillet</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            <div className="lg:col-span-3 flex items-end gap-3">
              <Btn kind="solid" onClick={startPause} disabled={disabledStart}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </div>

            <div className="lg:col-span-12 mt-1 flex flex-wrap items-center gap-3">
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

              <div className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · R reset · F fullscreen
              </div>
            </div>

            <div className="lg:col-span-12 grid gap-3 sm:grid-cols-12">
              <label className="sm:col-span-4 block text-sm font-semibold text-slate-900">
                Check with <span className="font-extrabold">{checkAtMin}</span>{" "}
                min left
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={checkAtMin}
                  onChange={(e) =>
                    setCheckAtMin(clamp(Number(e.target.value || 0), 0, 30))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>

              <label className="sm:col-span-4 block text-sm font-semibold text-slate-900">
                Reminder style
                <select
                  value={reminderMode}
                  onChange={(e) =>
                    setReminderMode(
                      e.target.value as "none" | "triple" | "repeat",
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  disabled={!sound}
                >
                  <option value="repeat">Repeating (10s)</option>
                  <option value="triple">Triple beep</option>
                  <option value="none">None</option>
                </select>
              </label>

              <div className="sm:col-span-4 flex items-end gap-2">
                <Btn
                  kind="ghost"
                  onClick={() => playReminder()}
                  disabled={!sound || reminderMode === "none"}
                  className="h-fit"
                >
                  Test reminder
                </Btn>
                <Btn
                  kind="ghost"
                  onClick={() => stopReminder()}
                  disabled={!sound}
                  className="h-fit"
                >
                  Stop sound
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {methodLabel} · {statusLabel}
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
export default function PizzaTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/pizza-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Pizza Timer",
        url,
        description:
          "Set a simple pizza timer with quick presets for frozen pizza. Big, easy-to-read countdown to help you pull your pizza out at the right time.",
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
            name: "Pizza Timer",
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
          <PizzaTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Pizza Timer</span>
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

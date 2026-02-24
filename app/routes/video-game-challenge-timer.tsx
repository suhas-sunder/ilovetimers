// app/routes/video-game-challenge-timer.tsx
import type { Route } from "./+types/video-game-challenge-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Game Challenge Timer (Sudden Death, Fullscreen)";
  const description =
    "Run fast game challenges with a sudden death or one-minute timer. Big fullscreen countdown built for party games, streams, and competitive play.";

  const url = "https://www.ilovetimers.com/video-game-challenge-timer";

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
 * Fit a single-line string into its container by adjusting font size.
 * Fix: compute synchronously in useLayoutEffect so it is correct on first paint.
 * - ResizeObserver + immediate compute
 * - Binary search for max font-size that fits width and height
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
  const [fontPx, setFontPx] = useState<number>(() => maxPx);

  const lastBestRef = useRef<number>(maxPx);

  const computeBest = useCallback(() => {
    const c = containerRef.current;
    const t = textRef.current;
    if (!c || !t) return;

    const rect = c.getBoundingClientRect();
    const availW = Math.max(0, rect.width - paddingAllowancePx);
    const availH = Math.max(0, rect.height - paddingAllowancePx);
    if (availW <= 0 || availH <= 0) return;

    const el = t as HTMLElement;
    const prevSize = el.style.fontSize;

    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      const tr = el.getBoundingClientRect();
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

    // Restore, then commit.
    el.style.fontSize = prevSize;

    if (lastBestRef.current !== best) {
      lastBestRef.current = best;
      setFontPx(best);
    }
  }, [containerRef, textRef, minPx, maxPx, paddingAllowancePx]);

  // Critical: run before paint whenever deps change.
  useLayoutEffect(() => {
    computeBest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Resize-driven recompute (debounced by rAF).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf: number | null = null;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        computeBest();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [containerRef, computeBest]);

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

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label}
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-900">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

/* =========================================================
   VIDEO GAME CHALLENGE TIMER CARD
========================================================= */
type Mode = "sudden_death" | "one_minute" | "custom_rounds";

type ChallengePreset = {
  key: string;
  label: string;
  mode: Mode;
  minutes: number;
  seconds: number;
  rounds?: number;
  restSec?: number;
  note: string;
};

const PRESETS: ChallengePreset[] = [
  {
    key: "one_minute",
    label: "One minute",
    mode: "one_minute",
    minutes: 1,
    seconds: 0,
    note: "Classic one-minute challenge.",
  },
  {
    key: "sudden_death_30",
    label: "Sudden death (30s)",
    mode: "sudden_death",
    minutes: 0,
    seconds: 30,
    note: "Short sudden death round.",
  },
  {
    key: "sudden_death_60",
    label: "Sudden death (60s)",
    mode: "sudden_death",
    minutes: 1,
    seconds: 0,
    note: "Sudden death with 60 seconds.",
  },
  {
    key: "best_of_5_60",
    label: "Best of 5 (60s)",
    mode: "custom_rounds",
    minutes: 1,
    seconds: 0,
    rounds: 5,
    restSec: 10,
    note: "5 rounds, 10s rest between rounds.",
  },
  {
    key: "best_of_10_45",
    label: "Best of 10 (45s)",
    mode: "custom_rounds",
    minutes: 0,
    seconds: 45,
    rounds: 10,
    restSec: 10,
    note: "10 rounds, 10s rest between rounds.",
  },
];

function VideoGameChallengeTimerCard() {
  const beep = useBeep();

  const [mode, setMode] = useState<Mode>("one_minute");

  // duration for round
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  // multi-round
  const [rounds, setRounds] = useState(5);
  const [restSec, setRestSec] = useState(10);
  const [phase, setPhase] = useState<"round" | "rest">("round");
  const [roundIndex, setRoundIndex] = useState(1);

  // timer
  const [running, setRunning] = useState(false);

  // audio/settings
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [beepOnPhaseChange, setBeepOnPhaseChange] = useState(true);

  // preset selection (for note only)
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(
    "one_minute",
  );

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const lastBeepSecondRef = useRef<number | null>(null);
  const shownMsRef = useRef<number>(0);
  const remainingMsRef = useRef<number>((minutes * 60 + seconds) * 1000);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const roundMs = useMemo(
    () => (minutes * 60 + seconds) * 1000,
    [minutes, seconds],
  );
  const restMs = useMemo(() => restSec * 1000, [restSec]);

  // display state (quantized to seconds for snappy rendering)
  const [shownMs, setShownMs] = useState(roundMs);

  useEffect(() => {
    shownMsRef.current = shownMs;
  }, [shownMs]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function syncShown(ms: number) {
    const q = Math.ceil(Math.max(0, ms) / 1000) * 1000;
    remainingMsRef.current = Math.max(0, ms);

    if (shownMsRef.current !== q) {
      shownMsRef.current = q;
      setShownMs(q);
    }
  }

  function hardResetTo(ms: number) {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;
    remainingMsRef.current = ms;
    shownMsRef.current = ms;
    setShownMs(ms);
  }

  function applyPreset(p: ChallengePreset) {
    setSelectedPresetKey(p.key);

    setMode(p.mode);
    setMinutes(p.minutes);
    setSeconds(p.seconds);
    setRounds(p.rounds ?? 5);
    setRestSec(p.restSec ?? 10);

    setRunning(false);
    setPhase("round");
    setRoundIndex(1);

    hardResetTo((p.minutes * 60 + p.seconds) * 1000);
  }

  useEffect(() => {
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundMs, mode]);

  useEffect(() => {
    if (mode !== "custom_rounds") return;
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restMs, mode, roundMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rawRem = Math.max(0, (endRef.current ?? now) - now);

      if (sound && finalCountdownBeeps && rawRem > 0 && rawRem <= 5_000) {
        const secLeft = Math.ceil(rawRem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      syncShown(rawRem);

      if (rawRem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) beep(660, 220);

        if (mode !== "custom_rounds") {
          setRunning(false);
          return;
        }

        if (phase === "round") {
          if (roundIndex >= rounds) {
            setRunning(false);
            return;
          }
          setPhase("rest");
          if (sound && beepOnPhaseChange) beep(520, 160);
          hardResetTo(restMs);
          setRunning(true);
          endRef.current = performance.now() + restMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        } else {
          setPhase("round");
          setRoundIndex((r) => r + 1);
          if (sound && beepOnPhaseChange) beep(760, 160);
          hardResetTo(roundMs);
          setRunning(true);
          endRef.current = performance.now() + roundMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    running,
    sound,
    finalCountdownBeeps,
    beep,
    mode,
    phase,
    roundIndex,
    rounds,
    roundMs,
    restMs,
    beepOnPhaseChange,
  ]);

  function reset() {
    setRunning(false);
    setPhase("round");
    setRoundIndex(1);
    hardResetTo(roundMs);
  }

  function startPause() {
    if (!running && sound) beep(0, 1);
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;

    if (!running) {
      endRef.current = performance.now() + remainingMsRef.current;
    } else {
      endRef.current = null;
      stopRaf();
    }
  }

  const activeLabel = useMemo(() => {
    if (mode === "one_minute") return "One Minute Challenge";
    if (mode === "sudden_death") return "Sudden Death";
    return phase === "round"
      ? `Round ${roundIndex} of ${rounds}`
      : `Rest (Round ${roundIndex}/${rounds})`;
  }, [mode, phase, roundIndex, rounds]);

  const statusLabel = useMemo(() => {
    if (running) return "Running";
    const base = remainingMsRef.current <= 0 ? "Done" : "Paused";
    if (mode !== "custom_rounds") return base;
    return `${base} · ${phase === "round" ? "Round" : "Rest"} ${roundIndex}/${rounds}`;
  }, [running, mode, phase, roundIndex, rounds]);

  const shownTime = useMemo(() => msToClock(shownMs), [shownMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, mode, phase, roundIndex, rounds],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const presetNote = useMemo(() => {
    if (!selectedPresetKey) return "Pick a preset or set your own round time.";
    const p = PRESETS.find((x) => x.key === selectedPresetKey);
    return p?.note ?? "Pick a preset or set your own round time.";
  }, [selectedPresetKey]);

  useEffect(() => {
    const exact = PRESETS.find((p) => {
      if (p.mode !== mode) return false;
      if (p.minutes !== minutes) return false;
      if (p.seconds !== seconds) return false;
      if (p.mode === "custom_rounds") {
        return (p.rounds ?? 5) === rounds && (p.restSec ?? 10) === restSec;
      }
      return true;
    });

    setSelectedPresetKey(exact ? exact.key : null);
  }, [mode, minutes, seconds, rounds, restSec]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Challenge Timer"
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

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Video Game Challenge Timer
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Sudden death, one-minute challenges, or multi-round play with
                rest. Fullscreen, sound, and keyboard shortcuts.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Toggle label="Sound" checked={sound} onChange={setSound} />
              <Toggle
                label="Final beeps"
                checked={finalCountdownBeeps}
                onChange={setFinalCountdownBeeps}
                disabled={!sound}
              />
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
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 300,
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
            {activeLabel}
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

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Status
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
                      {statusLabel}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Space = Start/Pause
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  R = Reset · F = Fullscreen
                </div>
              </div>
            </div>
          )}
        </div>

        {!isFs && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => {
              const active = selectedPresetKey === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={[
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                    active
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        {!isFs && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Field label="Minutes">
              <input
                type="number"
                min={0}
                max={180}
                value={minutes}
                onChange={(e) =>
                  setMinutes(clamp(Number(e.target.value || 0), 0, 180))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </Field>

            <Field label="Seconds">
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) =>
                  setSeconds(clamp(Number(e.target.value || 0), 0, 59))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </Field>

            <Field label="Mode">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value="one_minute">One minute challenge</option>
                <option value="sudden_death">Sudden death</option>
                <option value="custom_rounds">Rounds (with rest)</option>
              </select>
            </Field>

            <div className="flex items-end gap-3">
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </div>
          </div>
        )}

        {!isFs && mode === "custom_rounds" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Rounds">
              <input
                type="number"
                min={1}
                max={200}
                value={rounds}
                onChange={(e) =>
                  setRounds(clamp(Number(e.target.value || 5), 1, 200))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </Field>

            <Field label="Rest (seconds)">
              <input
                type="number"
                min={0}
                max={600}
                value={restSec}
                onChange={(e) =>
                  setRestSec(clamp(Number(e.target.value || 10), 0, 600))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </Field>

            <div className="flex items-end">
              <Toggle
                label="Beep on round/rest"
                checked={beepOnPhaseChange}
                onChange={setBeepOnPhaseChange}
                disabled={!sound}
              />
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
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
export default function VideoGameChallengeTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/video-game-challenge-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Video Game Challenge Timer",
        url,
        description:
          "A sudden death timer and one minute challenge timer for games and streams with fullscreen display, optional sound, and shortcuts.",
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
            name: "Video Game Challenge Timer",
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

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <VideoGameChallengeTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Video Game Challenge Timer</span>
        </p>
      </section>
    </main>
  );
}

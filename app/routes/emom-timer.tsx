// app/routes/emom-timer.tsx
import type { Route } from "./+types/emom-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/emom-timer/HowItWorks";
import Disclaimer from "~/clients/components/emom-timer/Disclaimer";
import FAQ from "~/clients/components/emom-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/emom-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/emom-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "EMOM Timer (Every Minute On the Minute, Fullscreen)";
  const description =
    "Free EMOM timer for Every Minute On the Minute workouts. Set rounds and total time, add a prep countdown, enable sound cues, and track rounds clearly in fullscreen.";

  const url = "https://www.ilovetimers.com/emom-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "emom timer",
        "every minute on the minute timer",
        "emom workout timer",
        "crossfit emom timer",
        "emom rounds timer",
        "emom online timer",
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

/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 880, duration = 120, gain = 0.1) => {
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
  };
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
  ariaPressed,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaPressed?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={ariaPressed}
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
   EMOM TIMER CARD
========================================================= */
type Mode = "idle" | "prep" | "emom" | "done";

function EmomTimerCard() {
  const beep = useBeep();

  const presetsRounds = useMemo(() => [6, 8, 10, 12, 15, 20, 30], []);
  const [rounds, setRounds] = useState(12);

  const prepPresets = useMemo(() => [0, 5, 10, 15, 20], []);
  const [prepSeconds, setPrepSeconds] = useState(10);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const [mode, setMode] = useState<Mode>("idle");
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startPerfRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<number>(0); // ms accumulated before current run segment
  const modeStartBaseRef = useRef<number>(0); // base elapsed at mode start (prep start or emom start)

  const lastBeepSecondRef = useRef<number | null>(null);
  const lastMinuteMarkRef = useRef<number | null>(null);

  const elapsedLiveRef = useRef<number>(0);
  const [uiTick, setUiTick] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function computeElapsed(nowPerf: number) {
    const start = startPerfRef.current ?? nowPerf;
    const seg = running ? nowPerf - start : 0;
    return baseElapsedRef.current + seg;
  }

  function hardReset() {
    stopRaf();
    setMode("idle");
    setRunning(false);

    startPerfRef.current = null;
    baseElapsedRef.current = 0;
    modeStartBaseRef.current = 0;

    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;

    elapsedLiveRef.current = 0;
    setUiTick((x) => x + 1);
  }

  function startFresh() {
    stopRaf();

    const startInPrep = prepSeconds > 0;
    setMode(startInPrep ? "prep" : "emom");
    setRunning(true);

    startPerfRef.current = performance.now();
    baseElapsedRef.current = 0;
    modeStartBaseRef.current = 0;

    lastBeepSecondRef.current = null;
    lastMinuteMarkRef.current = null;

    elapsedLiveRef.current = 0;
    setUiTick((x) => x + 1);
  }

  function pause() {
    if (!running) return;
    const now = performance.now();
    const elapsed = computeElapsed(now);
    baseElapsedRef.current = elapsed;
    startPerfRef.current = null;
    setRunning(false);
    elapsedLiveRef.current = elapsed;
    setUiTick((x) => x + 1);
  }

  function resume() {
    if (running) return;
    if (mode !== "prep" && mode !== "emom") return;
    startPerfRef.current = performance.now();
    setRunning(true);
  }

  function startPauseToggle() {
    if (mode === "idle" || mode === "done") {
      startFresh();
      return;
    }
    if (running) pause();
    else resume();
  }

  function toggleSound() {
    setSound((s) => !s);
  }

  function toggleFinalBeeps() {
    setFinalBeeps((b) => !b);
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }
    if (mode !== "prep" && mode !== "emom") {
      stopRaf();
      return;
    }

    const prepMs = clamp(prepSeconds, 0, 60) * 1000;
    const totalEmomMs = clamp(rounds, 1, 120) * 60_000;

    const tick = () => {
      const now = performance.now();
      const elapsed = computeElapsed(now);
      elapsedLiveRef.current = elapsed;

      if (mode === "prep") {
        const rem = Math.max(0, prepMs - (elapsed - modeStartBaseRef.current));

        if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
          const secLeft = Math.ceil(rem / 1000);
          if (lastBeepSecondRef.current !== secLeft) {
            lastBeepSecondRef.current = secLeft;
            beep(880, 90, 0.08);
          }
        }

        if (rem <= 0) {
          if (sound) beep(660, 160, 0.1);

          // Transition to EMOM
          setMode("emom");
          modeStartBaseRef.current = elapsed; // mark EMOM start at current elapsed
          lastBeepSecondRef.current = null;
          lastMinuteMarkRef.current = null;

          // Force UI update immediately on transition
          setUiTick((x) => x + 1);
        } else {
          // keep UI in sync without re-rendering every frame
          // (still re-renders frequently enough to look smooth)
          setUiTick((x) => x + 1);
        }

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // EMOM
      const emomElapsed = Math.max(0, elapsed - modeStartBaseRef.current);

      if (emomElapsed >= totalEmomMs) {
        setMode("done");
        setRunning(false);
        stopRaf();

        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }

        setUiTick((x) => x + 1);
        return;
      }

      const currentMinute = Math.floor(emomElapsed / 60_000); // 0..rounds-1
      const intoMinute = emomElapsed % 60_000;
      const remInMinute = Math.max(0, 60_000 - intoMinute);

      if (sound && lastMinuteMarkRef.current !== currentMinute) {
        lastMinuteMarkRef.current = currentMinute;
        beep(520, 140, 0.1);
      }

      if (sound && finalBeeps && remInMinute > 0 && remInMinute <= 5_000) {
        const secLeft = Math.ceil(remInMinute / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 80, 0.06);
        }
      } else {
        if (remInMinute > 5_000) lastBeepSecondRef.current = null;
      }

      setUiTick((x) => x + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, mode, rounds, prepSeconds, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const prepMs = clamp(prepSeconds, 0, 60) * 1000;
  const totalEmomMs = clamp(rounds, 1, 120) * 60_000;

  const effectiveElapsed = (() => {
    if (running && (mode === "prep" || mode === "emom")) {
      // derived from refs during render, based on latest uiTick
      const now = performance.now();
      return computeElapsed(now);
    }
    return elapsedLiveRef.current;
  })();

  const isActive = mode === "prep" || mode === "emom";
  const isLocked = isActive || mode === "done";

  const prepRemaining =
    mode === "prep"
      ? Math.max(0, prepMs - (effectiveElapsed - modeStartBaseRef.current))
      : prepMs;

  const emomElapsed =
    mode === "emom"
      ? Math.max(0, effectiveElapsed - modeStartBaseRef.current)
      : 0;

  const currentMinute = mode === "emom" ? Math.floor(emomElapsed / 60_000) : 0;

  const remainingInMinute =
    mode === "emom" ? Math.max(0, 60_000 - (emomElapsed % 60_000)) : 60_000;

  const shownTimeMs =
    mode === "prep" ? prepRemaining : mode === "emom" ? remainingInMinute : 0;

  const shownTime = msToClock(Math.ceil(shownTimeMs / 1000) * 1000);

  const statusLabel =
    mode === "prep"
      ? running
        ? "Get ready"
        : "Paused"
      : mode === "emom"
        ? running
          ? `Minute ${currentMinute + 1} of ${rounds}`
          : "Paused"
        : mode === "done"
          ? "Complete"
          : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      mode,
      rounds,
      prepSeconds,
      sound,
      finalBeeps,
      uiTick,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPauseToggle();
    } else if (k === "r") {
      hardReset();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      toggleSound();
    } else if (k === "b") {
      if (sound) toggleFinalBeeps();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const fsRightControls = (
    <div className="flex items-center gap-2">
      <Btn kind="solid" onClick={startPauseToggle} className="py-1 text-sm">
        {mode === "idle" || mode === "done"
          ? "Start"
          : running
            ? "Pause"
            : "Resume"}
      </Btn>

      <Btn kind="ghost" onClick={hardReset} className="py-1 text-sm">
        Reset
      </Btn>

      <Btn
        kind="ghost"
        onClick={toggleSound}
        className="py-1 text-sm"
        ariaPressed={sound}
      >
        Sound: {sound ? "On" : "Off"}
      </Btn>

      <Btn
        kind="ghost"
        onClick={toggleFinalBeeps}
        className="py-1 text-sm"
        disabled={!sound}
        ariaPressed={finalBeeps}
      >
        Final: {finalBeeps ? "On" : "Off"}
      </Btn>
    </div>
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
        title="EMOM Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={fsRightControls}
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

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-extrabold text-slate-900">
                Total minutes (rounds)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {presetsRounds.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRounds(m)}
                    disabled={isLocked}
                    className={[
                      "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60",
                      m === rounds
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Rounds
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={rounds}
                    disabled={isLocked}
                    onChange={(e) =>
                      setRounds(clamp(Number(e.target.value || 1), 1, 120))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <div className="text-xs text-slate-600 sm:pt-6">
                  One round starts every minute. Work, then rest until the next
                  minute starts.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-extrabold text-slate-900">
                Prep countdown (optional)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {prepPresets.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPrepSeconds(s)}
                    disabled={isLocked}
                    className={[
                      "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:opacity-60",
                      s === prepSeconds
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {s === 0 ? "None" : `${s}s`}
                  </button>
                ))}
              </div>

              <label className="mt-3 block text-sm font-semibold text-slate-900">
                Prep seconds
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={prepSeconds}
                  disabled={isLocked}
                  onChange={(e) =>
                    setPrepSeconds(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSound((x) => !x)}
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    sound
                      ? "border-amber-300 bg-amber-50 text-slate-900 hover:bg-amber-100"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  aria-pressed={sound}
                >
                  Sound {sound ? "On" : "Off"} (S)
                </button>

                <button
                  type="button"
                  onClick={() => setFinalBeeps((x) => !x)}
                  disabled={!sound}
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                    finalBeeps
                      ? "border-amber-300 bg-amber-50 text-slate-900 hover:bg-amber-100"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  aria-pressed={finalBeeps}
                >
                  Final beeps {finalBeeps ? "On" : "Off"} (B)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="solid" onClick={startPauseToggle}>
                {mode === "idle" || mode === "done"
                  ? "Start"
                  : running
                    ? "Pause"
                    : "Resume"}
              </Btn>
              <Btn kind="ghost" onClick={hardReset}>
                Reset
              </Btn>
            </div>

            <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound ·
              B final beeps
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
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
            if (isFs) startPauseToggle();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start, pause, or resume" : undefined}
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
            {mode === "done" ? "0:00" : shownTime}
          </span>

          {/* Fullscreen compact overlay */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Status
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {mode === "prep"
                      ? `Prep ${prepSeconds}s`
                      : mode === "emom"
                        ? `Round ${currentMinute + 1} / ${rounds}`
                        : mode === "done"
                          ? "Complete"
                          : `Rounds ${rounds} · Prep ${prepSeconds}s`}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Sound {sound ? "On" : "Off"}
                    {sound ? ` · Final ${finalBeeps ? "On" : "Off"}` : ""}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · S sound · B final beeps
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {running ? "Running" : mode === "idle" ? "Ready" : "Paused"}
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
export default function EmomTimerPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/emom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "EMOM Timer",
        url,
        description:
          "EMOM timer (Every Minute On the Minute) with rounds, optional prep countdown, sound cues, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "EMOM Timer", item: url },
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
            EMOM Timer (Every Minute On the Minute)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set rounds and an optional prep countdown, then run a clear,
            gym-readable minute timer with sound cues and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <EmomTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">EMOM Timer</span>
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

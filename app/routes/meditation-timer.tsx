// app/routes/meditation-timer.tsx
import type { Route } from "./+types/meditation-timer";
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
import HowItWorks from "~/clients/components/meditation-timer/HowItWorks";
import Disclaimer from "~/clients/components/meditation-timer/Disclaimer";
import FAQ from "~/clients/components/meditation-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/meditation-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/meditation-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Meditation Timer (Breathing & Yoga, Fullscreen)";
  const description =
    "Calm, distraction-free meditation timer. Set a quiet fullscreen countdown for breathing exercises, yoga sessions, or mindfulness practice. Clear, easy to read, and ready instantly.";

  const url = "https://www.ilovetimers.com/meditation-timer";

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

// WebAudio beep (soft)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160, gain = 0.08) => {
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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 *
 * NOTE: This is intentionally the same as the reference (count-up-timer) hook.
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
   MEDITATION TIMER CARD
========================================================= */
type Preset = { label: string; seconds: number; hint?: string };

function MeditationTimerCard() {
  const beep = useBeep();

  const presets: Preset[] = useMemo(
    () => [
      { label: "1m", seconds: 60, hint: "Quick reset" },
      { label: "2m", seconds: 120, hint: "Short breathing" },
      { label: "3m", seconds: 180, hint: "Mini session" },
      { label: "5m", seconds: 300, hint: "Starter meditation" },
      { label: "7m", seconds: 420, hint: "Short session" },
      { label: "10m", seconds: 600, hint: "Common daily" },
      { label: "12m", seconds: 720, hint: "Yoga breathwork" },
      { label: "15m", seconds: 900, hint: "Longer sit" },
      { label: "20m", seconds: 1200, hint: "Classic sit length" },
      { label: "30m", seconds: 1800, hint: "Deep session" },
      { label: "45m", seconds: 2700, hint: "Extended practice" },
      { label: "60m", seconds: 3600, hint: "Long sit or yoga" },
    ],
    [],
  );

  const breathingPresets: Preset[] = useMemo(
    () => [
      { label: "Box 3m", seconds: 3 * 60, hint: "Box breathing practice" },
      { label: "Box 5m", seconds: 5 * 60, hint: "Box breathing practice" },
      { label: "Breathe 7m", seconds: 7 * 60, hint: "Calm breathing" },
      { label: "Breathe 10m", seconds: 10 * 60, hint: "Calm breathing" },
    ],
    [],
  );

  const [seconds, setSeconds] = useState(10 * 60);
  const [remaining, setRemaining] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(false);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [endChime, setEndChime] = useState(true);
  const [loop, setLoop] = useState(false);

  // refs for stable RAF loop
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(remaining);

  const secondsRef = useRef<number>(seconds);
  const runningRef = useRef<boolean>(running);
  const loopRef = useRef<boolean>(loop);
  const soundRef = useRef<boolean>(sound);
  const finalBeepsRef = useRef<boolean>(finalCountdownBeeps);
  const endChimeRef = useRef<boolean>(endChime);

  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    soundRef.current = sound;
    if (!sound) setFinalCountdownBeeps(false);
  }, [sound]);

  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  useEffect(() => {
    endChimeRef.current = endChime;
  }, [endChime]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Reset cleanly when duration changes.
  useEffect(() => {
    setRunning(false);
    runningRef.current = false;
    stopRaf();
    endAtRef.current = null;
    lastBeepSecondRef.current = null;

    const next = seconds * 1000;
    remainingRef.current = next;
    setRemaining(next);
  }, [seconds]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  // Main RAF loop: only runs while `running` is true.
  useEffect(() => {
    if (!running) {
      stopRaf();
      endAtRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Resume from current remaining.
    endAtRef.current = performance.now() + remainingRef.current;

    const tick = () => {
      if (!runningRef.current) return;

      const now = performance.now();
      const endAt = endAtRef.current ?? now;
      const rem = Math.max(0, endAt - now);

      remainingRef.current = rem;
      setRemaining(rem);

      if (
        soundRef.current &&
        finalBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(740, 90, 0.06);
        }
      }

      if (rem <= 0) {
        endAtRef.current = null;
        lastBeepSecondRef.current = null;

        if (soundRef.current && endChimeRef.current) {
          beep(528, 180, 0.08);
          window.setTimeout(() => beep(660, 220, 0.08), 180);
        }

        if (loopRef.current) {
          const next = secondsRef.current * 1000;
          remainingRef.current = next;
          setRemaining(next);
          endAtRef.current = performance.now() + next;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        runningRef.current = false;
        setRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, beep]);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    runningRef.current = false;
    stopRaf();
    endAtRef.current = null;
    lastBeepSecondRef.current = null;

    const next = secondsRef.current * 1000;
    remainingRef.current = next;
    setRemaining(next);
  }

  function setPreset(sec: number) {
    setSeconds(sec);
  }

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
    } else if (k === "l") {
      setLoop((v) => !v);
    } else if (k === "s") {
      setSound((v) => !v);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  // Match the reference sizing behavior (this is what prevents the “slow zoom” issues).
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, seconds],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel =
    remaining <= 0
      ? "Done"
      : running
        ? "Running"
        : remaining < seconds * 1000
          ? "Paused"
          : "Ready";

  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;

  const SettingsChip = ({
    checked,
    onChange,
    disabled,
    label,
    title,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    label: string;
    title?: string;
  }) => (
    <label
      title={title}
      className={[
        "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900",
        disabled ? "opacity-60" : "",
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

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Meditation Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setLoop((v) => !v)}
              className="py-1 text-sm"
            >
              Loop {loop ? "On" : "Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setSound((v) => !v)}
              className="py-1 text-sm"
            >
              Sound {sound ? "On" : "Off"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Meditation Timer (Breathing + Yoga)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Quiet countdown with presets, optional sound, loop, and a big
                fullscreen display.
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

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>

              <SettingsChip
                checked={sound}
                onChange={setSound}
                label="Sound"
                title="Toggle sound on/off"
              />
              <SettingsChip
                checked={finalCountdownBeeps}
                onChange={setFinalCountdownBeeps}
                disabled={!sound}
                label="Final beeps"
                title="Optional soft beeps in the last 5 seconds"
              />
              <SettingsChip
                checked={endChime}
                onChange={setEndChime}
                disabled={!sound}
                label="End chime"
                title="Optional gentle chime when the timer ends"
              />
              <SettingsChip
                checked={loop}
                onChange={setLoop}
                label="Loop"
                title="Restart automatically when finished"
              />

              <div className="sm:ml-auto timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · R reset · F fullscreen · S sound
                · L loop
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Breathing presets
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {breathingPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPreset(p.seconds)}
                      title={p.hint}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        p.seconds === seconds
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Meditation + yoga presets
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPreset(p.seconds)}
                      title={p.hint}
                      className={[
                        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                        p.seconds === seconds
                          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Custom minutes
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={minutesPart}
                    onChange={(e) => {
                      const m = clamp(Number(e.target.value || 0), 0, 999);
                      setSeconds(m * 60 + secondsPart);
                    }}
                    className="mt-1 w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  + extra seconds
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={secondsPart}
                    onChange={(e) => {
                      const s = clamp(Number(e.target.value || 0), 0, 59);
                      setSeconds(minutesPart * 60 + s);
                    }}
                    className="mt-1 w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>
              </div>

              <div className="flex items-end gap-3">
                <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
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
            urgent ? "border-rose-200" : "border-slate-200",
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
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · S sound · L loop
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
export default function MeditationTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/meditation-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meditation Timer",
        url,
        description:
          "Meditation timer with fullscreen countdown, breathing presets, loop option, and optional sound. Quiet by default for meditation and yoga.",
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
            name: "Meditation Timer",
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

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MeditationTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Meditation Timer</span>
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

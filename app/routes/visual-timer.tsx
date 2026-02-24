// app/routes/visual-timer.tsx
import type { Route } from "./+types/visual-timer";
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
  const title = "Visual Timer (For Kids & Classrooms, Fullscreen)";
  const description =
    "Help kids see time pass with a clear visual timer. A countdown with a shrinking visual bar designed for classrooms, lessons, and activities.";

  const url = "https://www.ilovetimers.com/visual-timer";

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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * Snappy: uses useLayoutEffect so initial paint is already large.
 */
function useFitTextLayout({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 520,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const [fontPx, setFontPx] = useState<number>(maxPx);

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
   VISUAL TIMER CARD
   - High readability
   - Fast rendering: React state updates once per second
   - Smooth visuals: DOM updates per frame without React re-render
========================================================= */
type VisualMode = "bar" | "ring";

function VisualTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);

  const totalMs = useMemo(() => minutes * 60 * 1000, [minutes]);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [mode, setMode] = useState<VisualMode>("bar");
  const [showTime, setShowTime] = useState(true);

  // UI display state updates only when the visible second changes
  const [remainingDisplayMs, setRemainingDisplayMs] = useState(totalMs);

  const rafRef = useRef<number | null>(null);
  const endPerfRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(totalMs);
  const lastSecondShownRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Visual DOM refs
  const barFillRef = useRef<HTMLDivElement>(null);
  const ringFgRef = useRef<SVGCircleElement>(null);

  // Ring geometry (kept stable)
  const ring = useMemo(() => {
    const size = 240;
    const stroke = 18;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return { size, stroke, r, circ };
  }, []);

  // Keep refs in sync
  useEffect(() => {
    remainingMsRef.current = totalMs;
    setRemainingDisplayMs(totalMs);
    endPerfRef.current = null;
    lastSecondShownRef.current = null;
    lastBeepSecondRef.current = null;

    // Also reset visuals immediately
    if (barFillRef.current) barFillRef.current.style.transform = "scaleX(1)";
    if (ringFgRef.current) {
      ringFgRef.current.setAttribute("stroke-dasharray", `${ring.circ} 0`);
    }
  }, [totalMs, ring.circ]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const applyVisual = useCallback(
    (fracLeft: number) => {
      const f = clamp(fracLeft, 0, 1);

      if (barFillRef.current) {
        barFillRef.current.style.transform = `scaleX(${f})`;
      }

      if (ringFgRef.current) {
        const dash = ring.circ * f;
        ringFgRef.current.setAttribute(
          "stroke-dasharray",
          `${dash} ${ring.circ - dash}`,
        );
      }
    },
    [ring.circ],
  );

  useEffect(() => {
    if (!running) {
      stopRaf();
      endPerfRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endPerfRef.current) {
      endPerfRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endPerfRef.current ?? now) - now);
      remainingMsRef.current = rem;

      const fracLeft = totalMs > 0 ? rem / totalMs : 0;
      applyVisual(fracLeft);

      const secLeft = Math.ceil(rem / 1000);
      if (lastSecondShownRef.current !== secLeft) {
        lastSecondShownRef.current = secLeft;
        const snapped = Math.ceil(rem / 1000) * 1000;
        setRemainingDisplayMs(snapped);
      }

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endPerfRef.current = null;
        stopRaf();
        setRunning(false);
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 240);
        applyVisual(0);
        setRemainingDisplayMs(0);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, totalMs, sound, finalCountdownBeeps, beep, applyVisual]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    stopRaf();
    endPerfRef.current = null;
    lastSecondShownRef.current = null;
    lastBeepSecondRef.current = null;
    remainingMsRef.current = totalMs;
    setRemainingDisplayMs(totalMs);
    applyVisual(1);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      lastBeepSecondRef.current = null;

      if (!next) {
        // Pausing
        stopRaf();
        endPerfRef.current = null;
      }
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 10_000;

  const shownTime = msToClock(remainingDisplayMs);

  const fitFontPx = useFitTextLayout({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, showTime, mode],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 64 : 76,
  });

  const statusLabel =
    remainingMsRef.current <= 0 ? "Done" : running ? "Running" : "Ready";

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
    } else if (k === "v") {
      setMode((m) => (m === "bar" ? "ring" : "bar"));
    } else if (k === "t") {
      setShowTime((v) => !v);
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
        title="Visual Timer"
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
                Visual Timer (Bar or Ring)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                A clear countdown where the visual shrinks as time runs out.
                Fullscreen for classrooms and smartboards.
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
            urgent
              ? "border-rose-200 bg-rose-50"
              : "border-slate-200 bg-slate-50",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
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
            {statusLabel}
          </div>

          {showTime ? (
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
          ) : (
            <div className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Visual only
            </div>
          )}

          {/* Visual */}
          <div className={showTime ? "mt-6 w-full" : "mt-4 w-full"}>
            {mode === "bar" ? (
              <div className="mx-auto w-full max-w-5xl">
                <div className="h-12 w-full overflow-hidden rounded-full border border-slate-200 bg-white">
                  <div
                    ref={barFillRef}
                    className={[
                      "h-full origin-left",
                      urgent ? "bg-rose-500" : "bg-amber-500",
                    ].join(" ")}
                    style={{ transform: "scaleX(1)" }}
                    aria-label="Visual time remaining bar"
                  />
                </div>
                {!isFs && (
                  <div className="mt-2 flex justify-between text-xs font-semibold text-slate-600">
                    <span>Start</span>
                    <span>Done</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative mx-auto flex items-center justify-center">
                <svg
                  width={isFs ? 320 : ring.size}
                  height={isFs ? 320 : ring.size}
                  viewBox={`0 0 ${ring.size} ${ring.size}`}
                  aria-label="Visual time remaining ring"
                >
                  <circle
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={ring.r}
                    stroke={urgent ? "#fecaca" : "#e2e8f0"}
                    strokeWidth={ring.stroke}
                    fill="none"
                  />
                  <circle
                    ref={ringFgRef}
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={ring.r}
                    stroke={urgent ? "#ef4444" : "#f59e0b"}
                    strokeWidth={ring.stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${ring.circ} 0`}
                    transform={`rotate(-90 ${ring.size / 2} ${ring.size / 2})`}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreset(m)}
                  disabled={running}
                  className={[
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                    m === minutes
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  title={running ? "Pause to change duration" : `${m} minutes`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="block text-sm font-semibold text-slate-900">
                Custom minutes
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </label>

              <div className="flex flex-wrap items-end gap-3">
                <Btn onClick={startPause} kind="solid">
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => setMode("bar")}
                    className={[
                      "cursor-pointer rounded-md px-2 py-1",
                      mode === "bar"
                        ? "bg-amber-500 text-slate-900"
                        : "hover:bg-slate-50",
                    ].join(" ")}
                    title="Bar mode"
                  >
                    Bar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("ring")}
                    className={[
                      "cursor-pointer rounded-md px-2 py-1",
                      mode === "ring"
                        ? "bg-amber-500 text-slate-900"
                        : "hover:bg-slate-50",
                    ].join(" ")}
                    title="Ring mode"
                  >
                    Ring
                  </button>

                  <label className="ml-1 inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTime}
                      onChange={(e) => setShowTime(e.target.checked)}
                      className="cursor-pointer"
                    />
                    Show time
                  </label>

                  <span className="mx-1 h-4 w-px bg-slate-200" />

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sound}
                      onChange={(e) => setSound(e.target.checked)}
                      className="cursor-pointer"
                    />
                    Sound
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={finalCountdownBeeps}
                      onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                      disabled={!sound}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    />
                    Final beeps
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen · V toggle
              visual · T toggle time
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
              <span>Tap visual to start/pause</span>
              <span className="hidden sm:inline">·</span>
              <span>Space start/pause</span>
              <span className="hidden sm:inline">·</span>
              <span>R reset</span>
              <span className="hidden sm:inline">·</span>
              <span>V visual</span>
              <span className="hidden sm:inline">·</span>
              <span>T time</span>
              <span className="hidden sm:inline">·</span>
              <span>F fullscreen</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                {statusLabel}
              </span>

              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <input
                  type="checkbox"
                  checked={showTime}
                  onChange={(e) => setShowTime(e.target.checked)}
                  className="cursor-pointer"
                />
                Time
              </label>

              <button
                type="button"
                onClick={() => setMode((m) => (m === "bar" ? "ring" : "bar"))}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50"
                title="Toggle visual (V)"
              >
                {mode === "bar" ? "Bar" : "Ring"}
              </button>

              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="cursor-pointer"
                />
                Sound
              </label>

              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                  className="cursor-pointer disabled:cursor-not-allowed"
                />
                Beeps
              </label>
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
export default function VisualTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/visual-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Visual Timer",
        url,
        description:
          "Visual timer for kids and classrooms with a shrinking visual (bar or ring) plus optional time display. Fullscreen, presets, sound optional, and shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Visual Timer", item: url },
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
          <VisualTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Visual Timer</span>
        </p>
      </section>
    </main>
  );
}

// app/routes/speedcubing-timer.tsx
import type { Route } from "./+types/speedcubing-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
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
  const title = "Speedcubing Timer (Cube Stopwatch, Fullscreen)";
  const description =
    "Practice speedcubing with a fast, clean cube timer. Start and stop instantly, track splits, and focus on your solves with a big, readable display.";

  const url = "https://www.ilovetimers.com/speedcubing-timer";

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

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
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
   SPEEDCUBING TIMER CARD
   - Instant mode: Space/Start toggles start-stop
   - Hold-to-start mode: hold Space to arm, release to start (stop still instant)
   - Auto-save: when stopping, save solve into history
========================================================= */
type Solve = { n: number; ms: number; atISO: string };

type StartMode = "instant" | "hold";

function SpeedcubingTimerCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const [solves, setSolves] = useState<Solve[]>([]);
  const [maxSolves, setMaxSolves] = useState(50);

  const [startMode, setStartMode] = useState<StartMode>("hold");
  const [autoSave, setAutoSave] = useState(true);

  const [armed, setArmed] = useState(false);
  const armTimerRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Load persisted settings once
  useEffect(() => {
    try {
      const sm = localStorage.getItem("sc_start_mode");
      const as = localStorage.getItem("sc_auto_save");
      const ms = localStorage.getItem("sc_max_solves");
      if (sm === "instant" || sm === "hold") setStartMode(sm);
      if (as === "0" || as === "1") setAutoSave(as === "1");
      if (ms) {
        const v = Number(ms);
        if (Number.isFinite(v)) setMaxSolves(clamp(v, 5, 200));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem("sc_start_mode", startMode);
    } catch {
      // ignore
    }
  }, [startMode]);

  useEffect(() => {
    try {
      localStorage.setItem("sc_auto_save", autoSave ? "1" : "0");
    } catch {
      // ignore
    }
  }, [autoSave]);

  useEffect(() => {
    try {
      localStorage.setItem("sc_max_solves", String(maxSolves));
    } catch {
      // ignore
    }
  }, [maxSolves]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function clearArmTimer() {
    if (armTimerRef.current) window.clearTimeout(armTimerRef.current);
    armTimerRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (startRef.current ?? now);
      const next = baseRef.current + delta;
      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => {
      stopRaf();
      clearArmTimer();
    };
  }, []);

  function startNow() {
    setRunning((r) => {
      if (r) return r;
      baseRef.current = elapsedRef.current;
      return true;
    });
  }

  function stopNow({ saveIfNeeded }: { saveIfNeeded: boolean }) {
    setRunning((r) => {
      if (!r) return r;
      return false;
    });

    const finalMs = elapsedRef.current;
    baseRef.current = finalMs;

    if (saveIfNeeded && finalMs > 0) {
      setSolves((prev) => {
        const nextSolve: Solve = {
          n: (prev[0]?.n ?? 0) + 1,
          ms: finalMs,
          atISO: new Date().toISOString(),
        };
        const next = [nextSolve, ...prev];
        return next.slice(0, maxSolves);
      });
    }
  }

  function resetCurrent() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    stopRaf();
    startRef.current = null;
    setArmed(false);
    clearArmTimer();
  }

  function clearHistory() {
    setSolves([]);
  }

  function removeSolve(idx: number) {
    setSolves((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleStartStop() {
    if (running) {
      stopNow({ saveIfNeeded: autoSave });
      setArmed(false);
      clearArmTimer();
      return;
    }
    resetCurrent();
    startNow();
  }

  function armStart() {
    if (running) return;
    clearArmTimer();
    setArmed(false);
    // Arm after a short hold so it feels deliberate
    armTimerRef.current = window.setTimeout(() => {
      armTimerRef.current = null;
      setArmed(true);
    }, 250);
  }

  function releaseStart() {
    if (running) return;
    // If not armed yet, do nothing (prevents accidental starts)
    const canStart = armed;
    clearArmTimer();
    setArmed(false);
    if (!canStart) return;

    resetCurrent();
    startNow();
  }

  const statusLabel = running
    ? "Running"
    : armed
      ? "Armed"
      : elapsed > 0
        ? "Stopped"
        : "Ready";

  const best = useMemo(() => {
    if (!solves.length) return null;
    return Math.min(...solves.map((s) => s.ms));
  }, [solves]);

  const avg = useMemo(() => {
    if (!solves.length) return null;
    const sum = solves.reduce((a, s) => a + s.ms, 0);
    return sum / solves.length;
  }, [solves]);

  const timeText = msToStopwatch(elapsed);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, running, armed, solves.length, startMode],
    minPx: 56,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();

      if (startMode === "instant") {
        toggleStartStop();
      } else {
        if (running) {
          stopNow({ saveIfNeeded: autoSave });
        } else {
          // Hold-to-start: keydown arms, keyup starts
          if (!armed && !armTimerRef.current) armStart();
        }
      }
    } else if (k === "r") {
      resetCurrent();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    } else if (k === "s") {
      if (!running && !autoSave && elapsedRef.current > 0) {
        setSolves((prev) => {
          const nextSolve: Solve = {
            n: (prev[0]?.n ?? 0) + 1,
            ms: elapsedRef.current,
            atISO: new Date().toISOString(),
          };
          const next = [nextSolve, ...prev];
          return next.slice(0, maxSolves);
        });
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    if (e.key !== " ") return;
    if (startMode !== "hold") return;
    e.preventDefault();
    if (!running) releaseStart();
  };

  const fsSolves = solves.slice(0, 6);
  const hasSolves = fsSolves.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className=""
    >
      <FullscreenTopBar
        show={isFs}
        title="Speedcubing Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={() => {
                if (startMode === "instant") {
                  toggleStartStop();
                } else {
                  if (running) stopNow({ saveIfNeeded: autoSave });
                }
              }}
              className="py-1 text-sm"
            >
              {running ? "Stop" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetCurrent} className="py-1 text-sm">
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
                Speedcubing Timer
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Big mm:ss.cc display with fast start/stop and solve history.
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
          role={isFs ? "button" : undefined}
          title={
            isFs
              ? startMode === "instant"
                ? "Tap/click to start or stop"
                : running
                  ? "Tap/click to stop"
                  : "Use Space hold and release to start"
              : undefined
          }
          onMouseDown={() => {
            if (!isFs) return;
            if (startMode === "instant") {
              toggleStartStop();
              return;
            }
            if (running) {
              stopNow({ saveIfNeeded: autoSave });
              return;
            }
          }}
          onTouchStart={() => {
            if (!isFs) return;
            if (startMode === "instant") {
              toggleStartStop();
              return;
            }
            if (running) {
              stopNow({ saveIfNeeded: autoSave });
              return;
            }
          }}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              armed && !running ? "text-amber-600" : "",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>

          {/* Fullscreen solve overlay */}
          {isFs && (
            <div
              className={[
                "pointer-events-none absolute left-3 right-3 top-3",
                "sm:left-6 sm:right-6 sm:top-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Solves
                  </div>

                  {!hasSolves ? (
                    <div className="text-xs font-semibold text-slate-600">
                      Stop to save a solve
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsSolves.map((s) => (
                        <div
                          key={`${s.n}-${s.atISO}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-slate-900">
                            #{s.n}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900">
                            {msToStopwatch(s.ms)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    Space{" "}
                    {startMode === "instant" ? "Start/Stop" : "Hold + Release"}
                  </div>
                  {!autoSave && (
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      S = Save
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Btn
                kind="solid"
                onClick={() => {
                  if (startMode === "instant") {
                    toggleStartStop();
                  } else {
                    if (running) stopNow({ saveIfNeeded: autoSave });
                    else {
                      resetCurrent();
                      startNow();
                    }
                  }
                }}
              >
                {running ? "Stop" : "Start"}
              </Btn>

              <Btn kind="ghost" onClick={resetCurrent}>
                Reset
              </Btn>

              {!autoSave && (
                <Btn
                  kind="ghost"
                  onClick={() => {
                    if (!running && elapsedRef.current > 0) {
                      setSolves((prev) => {
                        const nextSolve: Solve = {
                          n: (prev[0]?.n ?? 0) + 1,
                          ms: elapsedRef.current,
                          atISO: new Date().toISOString(),
                        };
                        const next = [nextSolve, ...prev];
                        return next.slice(0, maxSolves);
                      });
                    }
                  }}
                  disabled={running || elapsed <= 0}
                >
                  Save
                </Btn>
              )}

              <Btn
                kind="ghost"
                onClick={clearHistory}
                disabled={!solves.length}
              >
                Clear history
              </Btn>

              <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space{" "}
                {startMode === "instant" ? "start/stop" : "hold+release start"}{" "}
                · R reset · F fullscreen
                {!autoSave ? " · S save" : ""}
              </div>
            </div>

            {/* Settings */}
            <div className="grid gap-3 lg:grid-cols-3">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                Start mode
                <select
                  value={startMode}
                  onChange={(e) =>
                    setStartMode(
                      e.target.value === "instant" ? "instant" : "hold",
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <option value="hold">Hold-to-start</option>
                  <option value="instant">Instant toggle</option>
                </select>
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                Auto-save on stop
                <button
                  type="button"
                  onClick={() => setAutoSave((v) => !v)}
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-1 text-sm font-semibold",
                    autoSave
                      ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                  aria-pressed={autoSave}
                >
                  {autoSave ? "On" : "Off"}
                </button>
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                Max saved solves
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={maxSolves}
                  onChange={(e) =>
                    setMaxSolves(clamp(Number(e.target.value || 50), 5, 200))
                  }
                  className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900"
                />
              </label>
            </div>
          </div>
        )}

        {/* History (normal only) */}
        {!isFs && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Solve history
              </div>
              <div className="text-xs font-semibold text-slate-600">
                {solves.length
                  ? `${solves.length} saved · Best ${best != null ? msToStopwatch(best) : "-"} · Avg ${avg != null ? msToStopwatch(avg) : "-"}`
                  : "No solves saved yet"}
              </div>
            </div>

            {solves.length === 0 ? (
              <div className="mt-3 text-sm text-slate-700">
                Stop the timer to save a solve.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {solves.slice(0, 20).map((s, i) => {
                  const isBest = best != null && s.ms === best;
                  return (
                    <div
                      key={`${s.n}-${s.atISO}`}
                      className={[
                        "flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
                        i === 0
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          #{s.n}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-slate-900">
                          {msToStopwatch(s.ms)}
                        </div>
                        {isBest && (
                          <div className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
                            Best
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="cursor-pointer text-xs font-semibold text-slate-700 hover:underline"
                          onClick={() => removeSolve(i)}
                        >
                          remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Space{" "}
              {startMode === "instant" ? "start/stop" : "hold+release start"} ·
              R reset · F fullscreen
              {!autoSave ? " · S save" : ""}
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>

      {/* Hold-to-start support via keyup */}
      <div
        className="sr-only"
        // This div is just to ensure React binds onKeyUp reliably on the focusable Card
        // (Card gets focus, so onKeyUp is handled there via capture)
      />
      {/* Capture keyup at Card level */}
      <div className="sr-only" />
      {/* Attach onKeyUp by wrapping is not needed; we use document-level? No.
          Instead, set onKeyUp on Card via prop: not available. So we use a capture listener below. */}
      <KeyUpCapture
        enabled={startMode === "hold"}
        onSpaceUp={() => {
          if (!running) releaseStart();
        }}
      />
    </Card>
  );
}

/* =========================================================
   KEYUP CAPTURE (SPACE RELEASE)
   - Keeps the main Card focused behavior intact
   - Avoids adding document listeners to the timer logic itself
========================================================= */
function KeyUpCapture({
  enabled,
  onSpaceUp,
}: {
  enabled: boolean;
  onSpaceUp: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key !== " ") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      onSpaceUp();
    };

    window.addEventListener("keyup", onKeyUp, { passive: false });
    return () => window.removeEventListener("keyup", onKeyUp as any);
  }, [enabled, onSpaceUp]);

  return null;
}

/* =========================================================
   PAGE
========================================================= */
export default function SpeedcubingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/speedcubing-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedcubing Timer",
        url,
        description:
          "Speedcubing timer with a cubing stopwatch format (mm:ss.cc), fullscreen display, and solve history.",
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
            name: "Speedcubing Timer",
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
          <SpeedcubingTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Speedcubing Timer</span>
        </p>
      </section>
    </main>
  );
}

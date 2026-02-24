// app/routes/silent-timer.tsx
import type { Route } from "./+types/silent-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
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
  const title = "Silent Timer (No Sound Countdown, Fullscreen)";
  const description =
    "Use a silent countdown timer with no sound alerts. Ideal for classrooms, exams, libraries, and meetings where quiet timing matters.";

  const url = "https://www.ilovetimers.com/silent-timer";

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

// WebAudio beep (kept lightweight, only used when Sound is enabled)
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

function TogglePill({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={[
        "cursor-pointer select-none rounded-lg border px-3 py-2 text-sm font-semibold",
        "disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-amber-200 bg-amber-50 text-slate-900 hover:bg-amber-100"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={checked}
    >
      {label}: <span className="font-extrabold">{checked ? "On" : "Off"}</span>
    </button>
  );
}

function Chip({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
          : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

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
   SILENT TIMER CARD
========================================================= */
function parseInputToMs(str: string) {
  const parts = str
    .trim()
    .split(":")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return 0;

  let ms = 0;

  // Allow: ss, mm:ss, hh:mm:ss
  if (parts.length === 1) {
    const n = Number(parts[0] || "0");
    ms = (Number.isFinite(n) ? n : 0) * 1000;
  } else if (parts.length === 2) {
    const m = Number(parts[0] || "0");
    const s = Number(parts[1] || "0");
    const mm = Number.isFinite(m) ? m : 0;
    const ss = Number.isFinite(s) ? s : 0;
    ms = (mm * 60 + ss) * 1000;
  } else {
    const h = Number(parts[0] || "0");
    const m = Number(parts[1] || "0");
    const s = Number(parts[2] || "0");
    const hh = Number.isFinite(h) ? h : 0;
    const mm = Number.isFinite(m) ? m : 0;
    const ss = Number.isFinite(s) ? s : 0;
    ms = (hh * 3600 + mm * 60 + ss) * 1000;
  }

  // Clamp to 24 hours
  return clamp(Math.floor(ms), 0, 24 * 3600 * 1000);
}

function SilentTimerCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);

  const [sound, setSound] = useState(false);
  const [loop, setLoop] = useState(false);

  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);

  // Internal timing refs for snappy updates without heavy re-renders
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(durationMs);
  const durationRef = useRef<number>(durationMs);
  const statusRef = useRef<typeof status>(status);
  const soundRef = useRef<boolean>(sound);
  const loopRef = useRef<boolean>(loop);

  useEffect(() => {
    durationRef.current = durationMs;
    if (statusRef.current !== "running") {
      remainingRef.current = durationMs;
    }
  }, [durationMs]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Display state updates only when the shown clock string would change
  const [shownMs, setShownMs] = useState<number>(durationMs);

  useEffect(() => {
    remainingRef.current = durationMs;
    setShownMs(durationMs);
  }, []); // mount only

  // Keep input string in sync with duration when not running
  const [inputStr, setInputStr] = useState(msToClock(durationMs));
  useEffect(() => {
    if (status !== "running") setInputStr(msToClock(durationMs));
  }, [durationMs, status]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const setAllTo = useCallback(
    (ms: number) => {
      const next = clamp(ms, 0, 24 * 3600 * 1000);
      stopRaf();
      endTimeRef.current = null;

      remainingRef.current = next;
      durationRef.current = next;

      setDurationMs(next);
      setShownMs(next);
      setStatus("idle");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onPreset = (m: number) => {
    if (status === "running") setStatus("paused");
    setAllTo(m * 60 * 1000);
  };

  const onSet = () => {
    if (status === "running") setStatus("paused");
    const ms = parseInputToMs(inputStr);
    setAllTo(ms);
  };

  const onReset = () => {
    stopRaf();
    endTimeRef.current = null;

    remainingRef.current = durationRef.current;
    setShownMs(durationRef.current);
    setStatus("idle");
  };

  const onStartPause = () => {
    if (statusRef.current === "running") {
      // Pause, store current remainder
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      remainingRef.current = rem;
      endTimeRef.current = null;
      stopRaf();

      // Snap shown state
      const nextShown = Math.ceil(rem / 1000) * 1000;
      setShownMs(nextShown);
      setStatus("paused");
      return;
    }

    // (Re)start
    if (statusRef.current === "done") {
      remainingRef.current = durationRef.current;
      setShownMs(durationRef.current);
    }

    if (remainingRef.current <= 0) {
      remainingRef.current = durationRef.current;
      setShownMs(durationRef.current);
    }

    setStatus("running");
  };

  useEffect(() => {
    if (status !== "running") {
      stopRaf();
      endTimeRef.current = null;
      return;
    }

    // Initialize end time from current remaining
    endTimeRef.current = performance.now() + remainingRef.current;

    let lastShown = -1;

    const tick = () => {
      const now = performance.now();
      const end = endTimeRef.current ?? now;
      const rem = Math.max(0, end - now);
      remainingRef.current = rem;

      // Only update React state when the displayed second changes
      const nextShown = Math.ceil(rem / 1000) * 1000;
      if (nextShown !== lastShown) {
        lastShown = nextShown;
        setShownMs(nextShown);
      }

      if (rem <= 0) {
        // Finish
        if (soundRef.current) beep();
        if (loopRef.current) {
          remainingRef.current = durationRef.current;
          endTimeRef.current = performance.now() + durationRef.current;
          lastShown = durationRef.current;
          setShownMs(durationRef.current);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        endTimeRef.current = null;
        stopRaf();
        setStatus("done");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [status, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const shownTime = msToClock(shownMs);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, status, durationMs],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "done"
          ? "Done"
          : "Ready";

  const urgent =
    status === "running" &&
    remainingRef.current > 0 &&
    remainingRef.current <= 10_000;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (k === "r") {
      onReset();
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
        title="Silent Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={onStartPause} className="py-1 text-sm">
              {status === "running"
                ? "Pause"
                : status === "done"
                  ? "Restart"
                  : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={onReset} className="py-1 text-sm">
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
                Silent Timer (No Sound Countdown)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                A quiet countdown. Sound is off by default. Use presets, custom
                time, loop, and fullscreen.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <TogglePill checked={sound} label="Sound" onChange={setSound} />
              <TogglePill checked={loop} label="Loop" onChange={setLoop} />
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
            urgent ? "border-rose-200" : "border-slate-200",
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
            if (isFs) onStartPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Countdown
          </div>

          <div className="mt-1 text-xs font-semibold text-slate-600">
            {statusLabel}
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
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {presets.map((m) => {
                const active =
                  status !== "running" && durationMs === m * 60 * 1000;
                return (
                  <Chip
                    key={m}
                    active={active}
                    onClick={() => onPreset(m)}
                    disabled={status === "running"}
                  >
                    {m}m
                  </Chip>
                );
              })}
            </div>
          )}

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Settings
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Sound: {sound ? "On" : "Off"}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Loop: {loop ? "On" : "Off"}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Presets + settings (normal only, below display) */}
        {!isFs && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">
                Options
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <TogglePill checked={sound} label="Sound" onChange={setSound} />
                <TogglePill checked={loop} label="Loop" onChange={setLoop} />
              </div>
            </div>

            <div className="mt-3 text-xs font-semibold text-slate-600">
              Sound is off by default on this page. Turn it on if you want a
              beep at 0.
            </div>

            {/* Controls bar (normal only) */}
            {!isFs && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <Btn kind="solid" onClick={onStartPause}>
                    {status === "running"
                      ? "Pause"
                      : status === "done"
                        ? "Restart"
                        : "Start"}
                  </Btn>
                  <Btn kind="ghost" onClick={onReset}>
                    Reset
                  </Btn>

                  <div className="flex items-center gap-2">
                    <input
                      inputMode="numeric"
                      value={inputStr}
                      onChange={(e) => {
                        if (status === "running") setStatus("paused");
                        setInputStr(e.target.value);
                      }}
                      onBlur={onSet}
                      placeholder="mm:ss or ss"
                      className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                    />
                    <Btn kind="ghost" onClick={onSet}>
                      Set
                    </Btn>
                  </div>
                </div>

                <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                  Shortcuts: Space start/pause · R reset · F fullscreen
                </div>
              </div>
            )}
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
export default function SilentTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/silent-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Silent Timer",
        url,
        description:
          "Silent countdown timer with optional sound, loop, fullscreen, presets, custom time input, and keyboard shortcuts.",
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
            name: "Silent Timer",
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
          <SilentTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Silent Timer</span>
        </p>
      </section>
    </main>
  );
}

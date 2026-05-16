// app/routes/focus-session-timer.tsx
import type { Route } from "./+types/focus-session-timer";
import { json } from "@remix-run/node";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/focus-session-timer/HowItWorks";
import Disclaimer from "~/clients/components/focus-session-timer/Disclaimer";
import FAQ from "~/clients/components/focus-session-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/focus-session-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/focus-session-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Focus Session Timer (Single Deep Work Countdown, Fullscreen)";
  const description =
    "Free focus session timer for deep work. Choose one session length, start a distraction-free countdown, use fullscreen mode, and get a short break suggestion when you finish.";

  const url = "https://www.ilovetimers.com/focus-session-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "focus session timer",
        "deep work timer",
        "focus timer",
        "study focus timer",
        "work session timer",
        "single session timer",
        "fullscreen focus timer",
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

  return (freq = 740, duration = 140, gain = 0.07) => {
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
   FOCUS SESSION CARD
========================================================= */
function FocusSessionCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90],
    [],
  );

  const [minutes, setMinutes] = useState(45);

  // Accuracy fix: anchor to absolute end time.
  const [running, setRunning] = useState(false);
  const [endAtEpochMs, setEndAtEpochMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(() => 45 * 60 * 1000);

  const remainingRef = useRef<number>(45 * 60 * 1000);
  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const [completed, setCompleted] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function setRemainingHard(ms: number) {
    const v = Math.max(0, Math.floor(ms));
    remainingRef.current = v;
    setRemainingMs(v);
  }

  // When minutes changes, reset session.
  useEffect(() => {
    const ms = minutes * 60 * 1000;
    setRunning(false);
    setEndAtEpochMs(null);
    setCompleted(false);
    lastBeepSecondRef.current = null;
    stopRaf();
    setRemainingHard(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  // Main tick loop (no dependency on remainingMs).
  useEffect(() => {
    if (!running || !endAtEpochMs) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = Date.now();
      const rem = Math.max(0, endAtEpochMs - now);

      remainingRef.current = rem;
      setRemainingMs(rem);

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.05);
        }
      }

      if (rem <= 0) {
        setRunning(false);
        setEndAtEpochMs(null);
        lastBeepSecondRef.current = null;
        setCompleted(true);
        if (sound) beep(660, 220, 0.07);
        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, endAtEpochMs, sound, finalBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    setEndAtEpochMs(null);
    setCompleted(false);
    lastBeepSecondRef.current = null;
    stopRaf();
    setRemainingHard(minutes * 60 * 1000);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;

      if (next) {
        const now = Date.now();
        setEndAtEpochMs(now + remainingRef.current);
      } else {
        setEndAtEpochMs(null);
      }

      lastBeepSecondRef.current = null;
      setCompleted(false);
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

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
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const urgent = running && remainingMs > 0 && remainingMs <= 10_000;
  const shownTime = msToClock(Math.ceil(remainingMs / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, urgent, running, completed],
    minPx: 58,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 84,
  });

  const durationMs = minutes * 60 * 1000;
  const statusLabel = running
    ? "Running"
    : completed || remainingMs <= 0
      ? "Complete"
      : remainingMs < durationMs
        ? "Paused"
        : "Ready";
  const canEditDuration = !running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Focus Session Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>

            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              Sound
            </label>

            <label className="hidden sm:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={finalBeeps}
                onChange={(e) => setFinalBeeps(e.target.checked)}
                disabled={!sound}
              />
              Final beeps
            </label>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-slate-900">
                Focus Session Timer
              </div>
              <div className="mt-1 text-sm text-slate-600">
                One clean countdown for deep work. Pick a length and start.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Sound
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={finalBeeps}
                  onChange={(e) => setFinalBeeps(e.target.checked)}
                  disabled={!sound}
                />
                Final beeps
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

        {/* Presets (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {presetsMin.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPreset(m)}
                disabled={!canEditDuration}
                className={[
                  "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                  m === minutes
                    ? "bg-amber-500 text-slate-900 enabled:hover:bg-amber-400"
                    : "border border-slate-200 bg-white text-slate-900 enabled:hover:bg-slate-50",
                ].join(" ")}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Custom minutes + controls (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block text-sm font-semibold text-slate-900">
              Session length (minutes)
              <input
                type="number"
                min={1}
                max={240}
                value={minutes}
                disabled={!canEditDuration}
                onChange={(e) =>
                  setMinutes(clamp(Number(e.target.value || 1), 1, 240))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <div className="flex items-end gap-3">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
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
            minHeight: isFs ? 0 : 380,
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
              whiteSpace: "nowrap",
            }}
          >
            {shownTime}
          </span>

          {completed ? (
            <div className="mt-5 w-full max-w-[980px]">
              <div className="rounded-2xl border border-amber-200 bg-white p-5 text-center shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                  Break time
                </div>
                <div className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                  Session complete.
                </div>
                <div className="mt-2 text-base font-semibold text-slate-700 sm:text-lg">
                  Stand up, drink water, and take a 2 to 5 minute break.
                </div>
              </div>
            </div>
          ) : null}

          {/* Fullscreen hint chip */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Session
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {minutes} minutes{urgent ? " · final seconds" : ""}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap timer to start or pause
                </div>
              </div>
            </div>
          )}
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap timer to start/pause · Space start/pause · R reset · F
              fullscreen · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>

        {/* Shortcuts (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound
            </div>
            <div className="text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function FocusSessionTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/focus-session-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Focus Session Timer",
        url,
        description:
          "Focus session timer for deep work. Set a single session length, use fullscreen, optional sound, and a clean countdown.",
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
            name: "Focus Session Timer",
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
            Focus Session Timer (Single Deep Work Countdown)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Choose one session length, start a distraction-free countdown, and
            go fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <FocusSessionCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Focus Session Timer</span>
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

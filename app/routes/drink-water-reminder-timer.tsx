// app/routes/water-reminder-timer.tsx
import type { Route } from "./+types/drink-water-reminder-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/drink-water-reminder-timer/HowItWorks";
import Disclaimer from "~/clients/components/drink-water-reminder-timer/Disclaimer";
import FAQ from "~/clients/components/drink-water-reminder-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/drink-water-reminder-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/drink-water-reminder-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Drink Water Reminder (Hydration Timer + Repeating Alerts)";
  const description =
    "Free drink water reminder and hydration timer. Set repeating intervals with optional sound alerts and use a clean fullscreen display to stay hydrated.";

  const url = "https://www.ilovetimers.com/water-reminder-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "drink water reminder",
        "drink water timer",
        "water reminder timer",
        "hydration reminder",
        "hydration timer",
        "water reminder online",
        "drink water reminder online",
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

  return useCallback((freq = 740, duration = 120, gain = 0.08) => {
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

/* =========================================================
   WATER REMINDER TIMER CARD
========================================================= */
function WaterReminderTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [15, 20, 30, 45, 60, 90, 120], []);

  const [intervalMin, setIntervalMin] = useState(60);
  const [sound, setSound] = useState(true);

  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(intervalMin * 60 * 1000);

  const remainingRef = useRef<number>(intervalMin * 60 * 1000);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const intervalMsRef = useRef<number>(intervalMin * 60 * 1000);
  useEffect(() => {
    intervalMsRef.current = intervalMin * 60 * 1000;
  }, [intervalMin]);

  const [remindersFired, setRemindersFired] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetAll() {
    setRunning(false);
    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    hasStartedRef.current = false;
    setRemindersFired(0);
    stopRaf();
  }

  function resetCycleOnly() {
    setRunning(false);
    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  useEffect(() => {
    // Changing interval resets the cycle and counters
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMin]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    hasStartedRef.current = true;

    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;

    endRef.current = performance.now() + next;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    const rem = Math.max(0, remainingRef.current);
    endRef.current = performance.now() + rem;
    setRunning(true);
  }

  function pause() {
    const now = performance.now();
    const rem = Math.max(0, (endRef.current ?? now) - now);

    setRunning(false);
    setRemaining(rem);
    remainingRef.current = rem;

    endRef.current = null;
    stopRaf();
  }

  function startPause() {
    if (running) {
      pause();
      return;
    }

    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    if (remainingRef.current <= 0) {
      startNew();
      return;
    }

    resume();
  }

  function fireNow() {
    // Fire immediately and start a fresh cycle from now
    setRemindersFired((n) => n + 1);

    if (sound) {
      beep(784, 110, 0.08);
      window.setTimeout(() => beep(659, 110, 0.08), 160);
    }

    const next = intervalMsRef.current;
    setRemaining(next);
    remainingRef.current = next;

    endRef.current = performance.now() + next;
    hasStartedRef.current = true;

    if (!running) setRunning(true);
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + Math.max(0, remainingRef.current);
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      setRemaining(rem);
      remainingRef.current = rem;

      if (rem <= 0) {
        setRemindersFired((n) => n + 1);

        if (sound) {
          beep(784, 110, 0.08);
          window.setTimeout(() => beep(659, 110, 0.08), 160);
        }

        const next = intervalMsRef.current;
        setRemaining(next);
        remainingRef.current = next;

        endRef.current = performance.now() + next;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(intervalMin * 60 * 1000);

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : "Next reminder in";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running, intervalMin],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
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
    } else if (k === "n") {
      if (running) fireNow();
    } else if (k === "s") {
      setSound((x) => !x);
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
        title="Water Reminder"
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
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset all
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="accent-amber-500"
                />
                Sound
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

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border bg-slate-50 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
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
            {running || hasStartedRef.current ? shownTime : readyTime}
          </span>

          {/* Controls (normal only) */}
          {!isFs && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={resetCycleOnly}>
                Reset cycle
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset all
              </Btn>
              <Btn kind="ghost" onClick={fireNow} disabled={!running}>
                Remind now
              </Btn>
            </div>
          )}

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Settings
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Interval {intervalMin}m · Sound {sound ? "On" : "Off"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Space start/pause · N remind now · R reset all · F fullscreen ·
                S sound
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">
                Reminder interval (minutes)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {presetsMin.map((m) => (
                  <Chip
                    key={m}
                    active={m === intervalMin}
                    onClick={() => setIntervalMin(m)}
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
                  min={5}
                  max={360}
                  value={intervalMin}
                  disabled={running}
                  onChange={(e) =>
                    setIntervalMin(clamp(Number(e.target.value || 5), 5, 360))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              <div className="mt-2 text-xs text-slate-600">
                Common choices: 30 or 60 minutes.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">
                Progress
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  Reminders {remindersFired}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  Status {statusLabel}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                This runs while the page is open. Background tabs may update
                less often.
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === intervalMin}
                  onClick={() => setIntervalMin(m)}
                  disabled={running}
                >
                  {m}m
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
                <Btn kind="ghost" onClick={fireNow} disabled={!running}>
                  Remind now
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · N remind now · R reset · S sound
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
export default function WaterReminderTimerPage(_: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/water-reminder-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Water Reminder Timer",
        url,
        description:
          "Drink water reminder timer with repeating intervals, optional sound, and fullscreen display.",
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
            name: "Water Reminder Timer",
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

      {/* Minimal header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Water Reminder Timer (Drink Water Reminder)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set a repeating interval, start the countdown, and get gentle sound
            reminders while the tab is open. Use fullscreen for a clean,
            readable display.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <WaterReminderTimerCard />
        </div>

        {/* Breadcrumb purposely at bottom */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Water Reminder Timer</span>
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

// app/routes/study-timer.tsx
import type { Route } from "./+types/study-timer";
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
  const title = "Study Timer (Focus & Homework, Fullscreen)";
  const description =
    "Stay focused while studying with a simple study timer. Run distraction-free study sessions using a clear fullscreen countdown built for homework and deep focus.";

  const url = "https://www.ilovetimers.com/study-timer";

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
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
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
   STUDY TIMER CARD
========================================================= */
function StudyTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90],
    [],
  );

  const [minutes, setMinutes] = useState(25);

  // Settings (fully functional)
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [focusMode, setFocusMode] = useState(true);
  const [milestones, setMilestones] = useState(true);
  const [showETA, setShowETA] = useState(false);

  const totalMs = useMemo(() => minutes * 60 * 1000, [minutes]);

  // Runtime state (render-throttled for snappy digits)
  const [running, setRunning] = useState(false);
  const [displayMs, setDisplayMs] = useState(totalMs);
  const [progressPct, setProgressPct] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(totalMs);
  const lastShownSecRef = useRef<number>(Math.ceil(totalMs / 1000));
  const lastBeepSecondRef = useRef<number | null>(null);

  // Fullscreen
  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  // Fit big digits
  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const shownTime = useMemo(() => msToClock(displayMs), [displayMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      focusMode,
      milestones,
      showETA,
      progressPct,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 72,
  });

  const urgent =
    running && remainingRef.current > 0 && remainingRef.current <= 10_000;

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardSetRemaining(nextMs: number) {
    remainingRef.current = nextMs;

    const pct =
      totalMs > 0 ? Math.round(((totalMs - nextMs) / totalMs) * 100) : 0;
    const clampedPct = clamp(pct, 0, 100);
    if (clampedPct !== progressPct) setProgressPct(clampedPct);

    const sec = Math.max(0, Math.ceil(nextMs / 1000));
    if (sec !== lastShownSecRef.current) {
      lastShownSecRef.current = sec;
      setDisplayMs(sec * 1000);
    }
  }

  useEffect(() => {
    // When minutes changes, reset to new total.
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = totalMs;
    lastShownSecRef.current = Math.max(0, Math.ceil(totalMs / 1000));
    setDisplayMs(lastShownSecRef.current * 1000);
    setProgressPct(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Initialize end time once per run/resume
    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      // update refs and UI (throttled for digits)
      hardSetRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;
        setRunning(false);
        hardSetRemaining(0);
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sound, finalCountdownBeeps, beep, totalMs]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    hardSetRemaining(totalMs);
    setProgressPct(0);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      // If resuming, clear endRef so it re-initializes from current remaining
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const endsAt = useMemo(() => {
    if (!showETA || !running) return null;
    const msLeft = remainingRef.current;
    const end = new Date(Date.now() + msLeft);
    return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [showETA, running, displayMs]);

  const milestoneText = useMemo(() => {
    if (!milestones || !running) return null;
    if (progressPct >= 75 && progressPct < 100) return "Last quarter";
    if (progressPct >= 50 && progressPct < 75) return "Halfway";
    if (progressPct >= 25 && progressPct < 50) return "Warming up";
    return "Start";
  }, [milestones, running, progressPct]);

  const statusLabel = running
    ? "Running"
    : remainingRef.current <= 0
      ? "Done"
      : remainingRef.current < totalMs
        ? "Paused"
        : "Ready";
  const canEditDuration = !running;

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
    } else if (k === "m") {
      setFocusMode((v) => !v);
    } else if (k === "s") {
      setSound((v) => !v);
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
        title="Study Timer"
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
                Study Timer
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Study-length presets, big fullscreen countdown, optional sound,
                and simple shortcuts.
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
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border text-slate-950",
            urgent
              ? "border-rose-200 bg-rose-50"
              : focusMode
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-slate-50",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
            background: isFs ? "#0b0b0c" : undefined,
            color: isFs ? "#ffffff" : undefined,
            borderColor: isFs ? "transparent" : undefined,
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div
            className={[
              "text-xs font-extrabold uppercase tracking-widest",
              isFs ? "text-white/85" : "text-slate-700",
            ].join(" ")}
          >
            {milestoneText ? milestoneText : "Study session"}
            {endsAt ? ` · Ends at ${endsAt}` : ""}
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

          {/* Progress bar */}
          <div
            className={isFs ? "mt-5 w-full max-w-4xl" : "mt-4 w-full max-w-xl"}
          >
            <div
              className={[
                "h-2 w-full overflow-hidden rounded-full",
                isFs ? "bg-white/15" : "bg-slate-200",
              ].join(" ")}
            >
              <div
                className={isFs ? "h-full bg-white/75" : "h-full bg-amber-500"}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {!isFs && (
              <div className="mt-2 text-center text-xs text-slate-600">
                Shortcuts: Space start/pause · R reset · F fullscreen · M focus
                mode · S sound
              </div>
            )}
          </div>
        </div>

        {/* Settings + Presets (normal only) */}
        {!isFs && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TogglePill
                label="Sound"
                checked={sound}
                onChange={(v) => setSound(v)}
              />
              <TogglePill
                label="Final beeps"
                checked={finalCountdownBeeps}
                onChange={(v) => setFinalCountdownBeeps(v)}
                disabled={!sound}
              />
              <TogglePill
                label="Focus mode"
                checked={focusMode}
                onChange={(v) => setFocusMode(v)}
              />
              <TogglePill
                label="Milestones"
                checked={milestones}
                onChange={(v) => setMilestones(v)}
              />
              <TogglePill
                label="Show end time"
                checked={showETA}
                onChange={(v) => setShowETA(v)}
              />
            </div>

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

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block text-sm font-semibold text-slate-900">
                Custom minutes
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
                <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>
            </div>
          </>
        )}

        {/* Normal-only status chip */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Status: <span className="text-slate-900">{statusLabel}</span>
              {sound ? "" : " · Sound off"}
              {finalCountdownBeeps && sound ? " · Final beeps on" : ""}
            </div>
            <div className="text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · M focus mode · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
              {sound ? "" : " · Sound off"}
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
export default function StudyTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/study-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Study Timer",
        url,
        description:
          "Fullscreen study timer for focus and homework. Big countdown, study-friendly presets, optional sound, and keyboard shortcuts.",
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
            name: "Study Timer",
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
      <section className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <StudyTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Study Timer</span>
        </p>
      </section>
    </main>
  );
}

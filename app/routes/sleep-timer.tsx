// app/routes/sleep-timer.tsx
import type { Route } from "./+types/sleep-timer";
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
  const title = "Sleep Timer (Countdown for Bedtime, Fullscreen)";
  const description =
    "Set a simple sleep timer with a gentle countdown before bed. Use it to time music, reading, or winding down with a calm, distraction-free display.";

  const url = "https://www.ilovetimers.com/sleep-timer";

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

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 *
 * NOTE: Start large (maxPx) so the first paint is big and readable,
 * then converge quickly to the best fit. This avoids the "slow loading numbers" feel.
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

/* WebAudio beep (soft chime-ish) */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 523.25, duration = 180, gain = 0.06) => {
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

function TogglePill({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400"
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

/* =========================================================
   SLEEP TIMER CARD
========================================================= */
function SleepTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [5, 10, 15, 20, 30, 45, 60, 90, 120], []);
  const [minutes, setMinutes] = useState(30);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const remainingRef = useRef<number>(minutes * 60 * 1000);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [softAlarm, setSoftAlarm] = useState(true);
  const [dimMode, setDimMode] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // When minutes changes, reset to that duration and stop.
  useEffect(() => {
    const next = minutes * 60 * 1000;
    setRemaining(next);
    remainingRef.current = next;

    setRunning(false);
    endRef.current = null;
    stopRaf();
  }, [minutes]);

  // Main timing loop (fixed: does NOT depend on "remaining", so it stays snappy).
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      // Keep ref in sync for instant pause/resume accuracy.
      remainingRef.current = rem;
      setRemaining(rem);

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        stopRaf();

        // Alarm
        if (sound && softAlarm) {
          beep(523.25, 160, 0.05);
          window.setTimeout(() => beep(659.25, 160, 0.05), 260);
          window.setTimeout(() => beep(783.99, 200, 0.05), 520);
        } else if (sound) {
          beep(660, 220, 0.07);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, softAlarm, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    const next = minutes * 60 * 1000;
    setRunning(false);
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (!next) {
        // pausing: freeze remaining precisely
        endRef.current = null;
        stopRaf();
      } else {
        // starting: endRef gets set in effect using remainingRef
      }
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const durationMs = minutes * 60 * 1000;
  const statusLabel =
    remaining <= 0
      ? "Done"
      : running
        ? "Running"
        : remaining < durationMs
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
    } else if (k === "d") {
      setDimMode((x) => !x);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Round display to whole seconds, but keep internal ms for accuracy.
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, dimMode],
    minPx: 56,
    maxPx: isFs ? 560 : 380,
    paddingAllowancePx: isFs ? 72 : 72,
  });

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={dimMode && isFs ? "bg-black text-white" : ""}
    >
      <FullscreenTopBar
        show={isFs}
        title="Sleep Timer"
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
                Sleep Timer (Countdown + Fullscreen)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Set a countdown, optionally dim the display, and use fullscreen
                for a clean, readable timer.
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
            dimMode
              ? "bg-black text-white border-slate-800"
              : "bg-slate-50 border-slate-200",
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
          <div
            className={[
              "text-xs font-extrabold uppercase tracking-widest",
              dimMode ? "text-white/70" : "text-slate-700",
            ].join(" ")}
          >
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

          {isFs && (
            <div
              className={[
                "pointer-events-none absolute left-3 right-3 top-3",
                "sm:left-6 sm:right-6 sm:top-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div
                    className={[
                      "text-[11px] font-extrabold uppercase tracking-widest",
                      dimMode ? "text-white/60" : "text-slate-600",
                    ].join(" ")}
                  >
                    Tips
                  </div>
                  <div
                    className={[
                      "rounded-lg border px-2 py-1 text-xs font-semibold backdrop-blur",
                      dimMode
                        ? "border-white/15 bg-white/10 text-white/80"
                        : "border-slate-200 bg-white/85 text-slate-700",
                    ].join(" ")}
                  >
                    Tap time to start/pause · D toggles dim
                  </div>
                </div>

                <div
                  className={[
                    "hidden sm:block rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur",
                    dimMode
                      ? "border-white/15 bg-white/10 text-white/80"
                      : "border-slate-200 bg-white/85 text-slate-700",
                  ].join(" ")}
                >
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <TogglePill
                checked={sound}
                onChange={(v) => {
                  setSound(v);
                  if (!v) setSoftAlarm(true); // keep consistent default when re-enabled
                }}
                label="Sound"
              />
              <TogglePill
                checked={softAlarm}
                onChange={setSoftAlarm}
                label="Soft alarm"
                disabled={!sound}
              />
              <TogglePill
                checked={dimMode}
                onChange={setDimMode}
                label="Dim mode"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
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

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block text-sm font-semibold text-slate-900">
                  Minutes
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={360}
                    value={minutes}
                    disabled={!canEditDuration}
                    onChange={(e) =>
                      setMinutes(clamp(Number(e.target.value || 1), 1, 360))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <Btn kind="solid" onClick={startPause}>
                    {running ? "Pause" : "Start"}
                  </Btn>
                  <Btn kind="ghost" onClick={reset}>
                    Reset
                  </Btn>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen · D dim
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · D dim
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
export default function SleepTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/sleep-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Sleep Timer",
        url,
        description:
          "Online sleep timer with countdown, dim mode, fullscreen, and optional soft alarm.",
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
          { "@type": "ListItem", position: 2, name: "Sleep Timer", item: url },
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
          <SleepTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Sleep Timer</span>
        </p>
      </section>
    </main>
  );
}

// app/routes/countdown-timer.tsx
import type { Route } from "./+types/countdown-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
  useMemo,
} from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/countdown-timer/HowItWorks";
import Disclaimer from "~/clients/components/countdown-timer/Disclaimer";
import FAQ from "~/clients/components/countdown-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/countdown-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/countdown-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Countdown Timer (Minutes + Seconds, Fullscreen)";
  const description =
    "Free countdown timer. Set minutes and seconds, start or pause, add time, reset, and go fullscreen for workouts, cooking, studying, meetings, and tasks.";

  const url = "https://www.ilovetimers.com/countdown-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "countdown timer",
        "count down timer",
        "timer minutes seconds",
        "online countdown timer",
        "fullscreen countdown timer",
        "countdown clock",
        "timer with add time",
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
const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClockDown(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
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
   COUNTDOWN TIMER CARD
========================================================= */
function CountUpTimerCard() {
  const [running, setRunning] = useState(false);

  // Duration to count down from (ms)
  const [totalMs, setTotalMs] = useState<number>(5 * 60 * 1000);
  // Remaining time (ms)
  const [remaining, setRemaining] = useState<number>(5 * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const totalMsRef = useRef<number>(totalMs);
  useEffect(() => {
    totalMsRef.current = totalMs;
  }, [totalMs]);

  const runningRef = useRef<boolean>(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const [minsInput, setMinsInput] = useState<string>("5");
  const [secsInput, setSecsInput] = useState<string>("0");

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    const now = performance.now();
    const currentRemaining = remainingRef.current;
    endRef.current = now + currentRemaining;

    const tick = () => {
      const n = performance.now();
      const end = endRef.current ?? n;
      const nextRemaining = Math.max(0, end - n);

      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        setRunning(false);
        stopRaf();
        endRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const statusLabel =
    remaining <= 0 ? "Finished" : running ? "Running" : "Ready";

  function syncInputsFromMs(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    setMinsInput(String(m));
    setSecsInput(String(s));
  }

  function applyInputsToTotal() {
    const mRaw = minsInput.trim() === "" ? 0 : Number(minsInput);
    const sRaw = secsInput.trim() === "" ? 0 : Number(secsInput);

    const m = clampInt(mRaw, 0, 9999);
    const s = clampInt(sRaw, 0, 59);

    const nextTotal = (m * 60 + s) * 1000;

    setMinsInput(String(m));
    setSecsInput(String(s));

    setTotalMs(nextTotal);

    // Only re-seed remaining when not running.
    if (!runningRef.current) {
      setRemaining(nextTotal);
    }
  }

  function startPause() {
    // If currently finished, restart from total first.
    if (!runningRef.current && remainingRef.current <= 0) {
      const seed = totalMsRef.current;
      setRemaining(seed);
      remainingRef.current = seed;
    }

    // If there's no time set, do nothing.
    if (!runningRef.current && remainingRef.current <= 0) return;

    setRunning((r) => !r);
  }

  function resetAll() {
    setRunning(false);
    stopRaf();
    endRef.current = null;
    const seed = totalMsRef.current;
    setRemaining(seed);
    remainingRef.current = seed;
  }

  function addSeconds(sec: number) {
    const deltaMs = sec * 1000;

    // Update total (for the "configured duration") and inputs, even while running.
    const nextTotal = Math.max(0, totalMsRef.current + deltaMs);
    setTotalMs(nextTotal);
    totalMsRef.current = nextTotal;
    syncInputsFromMs(nextTotal);

    // Update remaining and keep RAF math consistent.
    setRemaining((prev) => {
      const nextRemaining = Math.max(0, prev + deltaMs);
      remainingRef.current = nextRemaining;

      // Critical fix: shift the end time so the next RAF tick doesn't undo the change.
      if (runningRef.current && endRef.current != null) {
        endRef.current = endRef.current + deltaMs;
      }

      return nextRemaining;
    });
  }

  const shownTime = useMemo(() => {
    // Round up to nearest second so it does not show 0:00 early.
    const displayMs = Math.ceil(remaining / 1000) * 1000;
    return msToClockDown(displayMs);
  }, [remaining]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "a") {
      addSeconds(60);
    } else if (k === "s") {
      addSeconds(-10);
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
        title="Countdown Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : remaining <= 0 ? "Restart" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => addSeconds(60)}
              className="py-1 text-sm"
            >
              +1:00
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 ml-auto">
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

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {running ? "Pause" : remaining <= 0 ? "Restart" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetAll}>
                  Reset
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(60)}>
                  +1:00
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(-10)}>
                  -0:10
                </Btn>
              </div>

              <div className="timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · R reset · A +1:00 · S -0:10 · F
                fullscreen
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-extrabold text-slate-900">
                    Set countdown
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Minutes and seconds. Seconds are clamped to 0–59.
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">
                      Minutes
                    </span>
                    <input
                      value={minsInput}
                      onChange={(e) => setMinsInput(e.target.value)}
                      onBlur={applyInputsToTotal}
                      inputMode="numeric"
                      className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-300/60"
                      disabled={running}
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">
                      Seconds
                    </span>
                    <input
                      value={secsInput}
                      onChange={(e) => setSecsInput(e.target.value)}
                      onBlur={applyInputsToTotal}
                      inputMode="numeric"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-300/60"
                      disabled={running}
                    />
                  </label>

                  <Btn
                    kind="ghost"
                    onClick={applyInputsToTotal}
                    disabled={running}
                  >
                    Apply
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display (no buttons inside) */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center text-slate-950",
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

          {!isFs && (
            <div className="mt-3 text-xs font-semibold text-slate-600">
              Tip: Start, then use +1:00 or -0:10 while it runs.
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls (no duplicate buttons) */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · A +1:00 · S -0:10 ·
              R reset · F fullscreen
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
export default function CountDownTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/countdown-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Countdown Timer",
        url,
        description:
          "Countdown timer with minutes and seconds, start/pause, add time, reset, and fullscreen mode.",
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
            name: "Countdown Timer",
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
            Countdown Timer (Minutes + Seconds)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set a duration, start or pause, add time, reset, and use a big
            fullscreen display.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <CountUpTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Countdown Timer</span>
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

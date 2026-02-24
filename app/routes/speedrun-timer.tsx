// app/routes/speedrun-timer.tsx
import type { Route } from "./+types/speedrun-timer";
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
  const title = "Speedrun Timer (Splits, Fullscreen Stopwatch)";
  const description =
    "Time your speedruns with a simple split timer. Start, pause, record splits, and keep runs organized with a clean, fullscreen display.";

  const url = "https://www.ilovetimers.com/speedrun-timer";

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
const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClockWithMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSec = Math.floor(t / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hundredths = Math.floor((t % 1000) / 10);
  const base = h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
  return `${base}.${pad2(hundredths)}`;
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

function uid() {
  // Prefer stable UUIDs when available (faster/less collision risk than Math.random)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
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
   SPEEDRUN TIMER CARD
========================================================= */
type Split = {
  id: string;
  name: string;
  totalMs: number;
  deltaMs: number;
};

function SpeedrunTimerCard() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  const [splits, setSplits] = useState<Split[]>([]);
  const [nextSplitName, setNextSplitName] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
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

      // Keep the UI responsive and avoid any "slow load" feel:
      //  - update elapsed every frame while running
      //  - formatting happens in render, but it's cheap
      setElapsedMs(next);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsedRef.current;
      return next;
    });
  }

  function resetAll() {
    setRunning(false);
    setElapsedMs(0);
    baseRef.current = 0;
    setSplits([]);
    setNextSplitName("");
    stopRaf();
    startRef.current = null;
  }

  function addSplit() {
    // For a speedrun timer, splits should be recordable while running.
    if (!running) return;

    const total = Math.max(0, Math.floor(elapsedRef.current));
    const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
    const delta = total - prevTotal;

    const name = (nextSplitName || `Split ${splits.length + 1}`).trim();

    setSplits((prev) => [
      ...prev,
      { id: uid(), name, totalMs: total, deltaMs: delta },
    ]);
    setNextSplitName("");
  }

  function undoSplit() {
    setSplits((prev) => prev.slice(0, -1));
  }

  function finishRun() {
    // End run should stop the clock. Optionally add a "Finish" split.
    const total = Math.max(0, Math.floor(elapsedRef.current));
    const last = splits[splits.length - 1];

    if (!last || Math.abs(last.totalMs - total) >= 20) {
      const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
      const delta = total - prevTotal;
      setSplits((prev) => [
        ...prev,
        { id: uid(), name: "Finish", totalMs: total, deltaMs: delta },
      ]);
    }

    setRunning(false);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      addSplit();
    } else if (k === "u") {
      undoSplit();
    } else if (k === "e") {
      finishRun();
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const shownTime = useMemo(() => msToClockWithMs(elapsedMs), [elapsedMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, splits.length],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel = running ? "Running" : elapsedMs > 0 ? "Paused" : "Ready";

  // Fullscreen split overlay shows the most recent few (latest last in array)
  const fsSplits = splits.slice(-6).reverse();
  const hasSplits = fsSplits.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Speedrun Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={addSplit}
              className="py-1 text-sm"
              disabled={!running}
            >
              Split
            </Btn>
            <Btn
              kind="ghost"
              onClick={finishRun}
              className="py-1 text-sm"
              disabled={!running && elapsedMs <= 0}
            >
              End
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
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
                Speedrun Timer (Splits + Fullscreen)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Start/pause, record splits, undo, end the run, and go fullscreen
                with a huge readable display.
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
            {shownTime}
          </span>

          {/* Fullscreen split overlay */}
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
                    Splits
                  </div>

                  {!hasSplits ? (
                    <div className="text-xs font-semibold text-slate-600">
                      Press Split (S) while running
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsSplits.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-slate-900">
                            {s.name}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-extrabold text-slate-900">
                              {msToClockWithMs(s.totalMs)}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              +{msToClockWithMs(s.deltaMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  S = Split
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls + Split name (normal only) */}
        {!isFs && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={addSplit} disabled={!running}>
                Split
              </Btn>
              <Btn
                kind="ghost"
                onClick={undoSplit}
                disabled={splits.length === 0}
              >
                Undo
              </Btn>
              <Btn
                kind="ghost"
                onClick={finishRun}
                disabled={!running && elapsedMs <= 0}
              >
                End run
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Next split name (optional)
              <input
                value={nextSplitName}
                onChange={(e) => setNextSplitName(e.target.value)}
                placeholder={`Split ${splits.length + 1}`}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>
          </div>
        )}

        {/* Shortcuts chip + splits table (normal only) */}
        {!isFs && (
          <>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Shortcuts: Space start/pause · S split · U undo · E end · R
                reset · F fullscreen
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-extrabold text-slate-900">
                  Splits
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Total is run time · Delta is time since previous split
                </div>
              </div>

              {splits.length === 0 ? (
                <div className="mt-3 text-sm text-slate-700">
                  Start the timer, then press <strong>Split</strong> (or{" "}
                  <strong>S</strong>) to record segment times.
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-wide text-slate-700">
                        <th className="px-3 py-2">Split</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splits.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={idx % 2 ? "bg-white" : "bg-slate-50/60"}
                        >
                          <td className="px-3 py-2 font-semibold text-slate-900">
                            {s.name}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.totalMs)}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.deltaMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · S split · U undo · E
              end · R reset · F fullscreen
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
export default function SpeedrunTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  void nowISO;

  const url = "https://www.ilovetimers.com/speedrun-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedrun Timer",
        url,
        description:
          "A speedrun timer with splits. Start/pause, record split times, undo last split, end the run, and go fullscreen for a clean display.",
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
            name: "Speedrun Timer",
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
          <SpeedrunTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Speedrun Timer</span>
        </p>
      </section>
    </main>
  );
}

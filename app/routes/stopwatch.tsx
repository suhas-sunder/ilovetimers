// app/routes/stopwatch.tsx
import type { Route } from "./+types/stopwatch";
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
  const title = "Online Stopwatch (Laps, Fullscreen Stopwatch)";
  const description =
    "Use a fast, accurate online stopwatch with laps. Start instantly, track splits, and keep time with a clean fullscreen display built for serious timing.";

  const url = "https://www.ilovetimers.com/stopwatch";

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
const pad3 = (n: number) => n.toString().padStart(3, "0");

function msToClockMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(t / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const msPart = t % 1000;

  return h > 0
    ? `${h}:${pad2(m)}:${pad2(s)}.${pad3(msPart)}`
    : `${m}:${pad2(s)}.${pad3(msPart)}`;
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
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
   STOPWATCH CARD
========================================================= */
type Lap = { n: number; totalMs: number; splitMs: number };

function StopwatchCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const [laps, setLaps] = useState<Lap[]>([]);
  const lastLapTotalRef = useRef<number>(0);

  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

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
      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setCopied("idle");
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsedRef.current;
      return next;
    });
  }

  function resetAll() {
    setCopied("idle");
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
    lastLapTotalRef.current = 0;
    stopRaf();
    startRef.current = null;
  }

  function lap() {
    setCopied("idle");
    const nowElapsed = elapsedRef.current;
    if (nowElapsed <= 0) return;

    const split = nowElapsed - lastLapTotalRef.current;
    lastLapTotalRef.current = nowElapsed;

    setLaps((prev) => [
      { n: prev.length + 1, totalMs: nowElapsed, splitMs: split },
      ...prev,
    ]);
  }

  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Lap,Split Time,Total Time");
    const ordered = [...laps].reverse(); // oldest -> newest for exporting
    for (let i = 0; i < ordered.length; i++) {
      const l = ordered[i]!;
      lines.push(`${l.n},${msToClockMs(l.splitMs)},${msToClockMs(l.totalMs)}`);
    }
    return lines.join("\n");
  }, [laps]);

  async function copyLaps() {
    if (laps.length === 0) return;
    const ok = await copyToClipboard(copyText);
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied("idle"), 1200);
  }

  const shownTime = msToClockMs(elapsed);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, laps.length],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel = running ? "Running" : elapsed > 0 ? "Paused" : "Ready";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "l") {
      lap();
    } else if (k === "c") {
      copyLaps();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (e.key === "Escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const fsLaps = laps.slice(0, 6);
  const hasLaps = fsLaps.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Stopwatch"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={lap} className="py-1 text-sm">
              Lap
            </Btn>
            <Btn kind="ghost" onClick={copyLaps} className="py-1 text-sm">
              Copy
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
                Stopwatch (Milliseconds + Laps)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Start/pause, record laps (splits), reset, copy CSV, and use a big
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
            {shownTime}
          </span>

          {/* Fullscreen lap overlay */}
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
                    Laps
                  </div>

                  {!hasLaps ? (
                    <div className="text-xs font-semibold text-slate-600">
                      Press Lap (L) to record splits
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsLaps.map((l) => (
                        <div
                          key={l.n}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-slate-900">
                            Lap {l.n}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-extrabold text-slate-900">
                              {msToClockMs(l.totalMs)}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              +{msToClockMs(l.splitMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  L = Lap
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={lap} disabled={elapsed <= 0}>
                Lap
              </Btn>
              <Btn kind="ghost" onClick={copyLaps} disabled={laps.length === 0}>
                Copy laps
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </div>

            <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · L lap · C copy · R reset · F
              fullscreen
            </div>
          </div>
        )}

        {copied !== "idle" && !isFs && (
          <div
            className={[
              "mt-3 rounded-lg px-3 py-2 text-sm font-semibold",
              copied === "ok"
                ? "bg-emerald-100 text-emerald-900"
                : "bg-rose-100 text-rose-900",
            ].join(" ")}
          >
            {copied === "ok" ? "Copied to clipboard." : "Could not copy."}
          </div>
        )}

        {/* Laps (normal only) */}
        {!isFs && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">Laps</div>
              <div className="text-xs font-semibold text-slate-600">
                Most recent first · Split is time since previous lap
              </div>
            </div>

            {laps.length === 0 ? (
              <div className="mt-3 text-sm text-slate-700">
                Press <strong>Lap</strong> (or <strong>L</strong>) to record
                splits.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {laps.slice(0, 12).map((l) => (
                  <div
                    key={l.n}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      Lap {l.n}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm font-extrabold text-slate-900">
                        Total {msToClockMs(l.totalMs)}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        Split {msToClockMs(l.splitMs)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {laps.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Copy format: CSV (Lap, Split Time, Total Time)
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · L lap · C copy · R
              reset · F fullscreen
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
export default function StopwatchPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/stopwatch";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stopwatch",
        url,
        description:
          "Free online stopwatch with laps and millisecond precision. Fullscreen display, keyboard shortcuts, and copy for lap splits and totals.",
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
            name: "Stopwatch",
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
          <StopwatchCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Stopwatch</span>
        </p>
      </section>
    </main>
  );
}
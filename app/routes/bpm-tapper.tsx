// app/routes/bpm-tapper.tsx
import type { Route } from "./+types/bpm-tapper";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Tap BPM (Instant BPM Counter + Tempo Tapper)";
  const description =
    "Tap to find BPM instantly. Simple tempo tapper and BPM counter that measures beats per minute as you tap. Auto-resets after pauses and lets you copy the BPM.";

  const url = "https://www.ilovetimers.com/bpm-tapper";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "tap bpm",
        "bpm counter",
        "tap tempo",
        "tempo tapper",
        "tempo finder",
        "beats per minute",
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
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
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

function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
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
 * Fit a single-line string into its container by adjusting font size.
 * - ResizeObserver + rAF
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
   BPM TAPPER CARD
========================================================= */
type HistoryItem = {
  id: string;
  at: number;
  bpm: number;
  taps: number;
  intervals: number;
  stability?: string | null;
};

function BpmTapperCard() {
  const MAX_TAPS = 24;
  const MIN_TAP_MS = 120;
  const MAX_TAP_MS = 2000;

  const RESET_PRESETS_MS = useMemo(() => [2000, 4000, 6000, 10000, 20000], []);
  const HOLD_PRESETS_MS = useMemo(() => [0, 6000, 12000, 20000, 30000], []);

  const tapsRef = useRef<number[]>([]);
  const idleTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);

  const [taps, setTaps] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const [resetMs, setResetMs] = useState<number>(6000);
  const [holdMs, setHoldMs] = useState<number>(12000);
  const [keyboardTap, setKeyboardTap] = useState(true);
  const [locked, setLocked] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const bpmTextRef = useRef<HTMLSpanElement>(null);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const computeIntervals = useCallback((tapTimes: number[]) => {
    if (tapTimes.length < 2) return [];
    const out: number[] = [];
    for (let i = 1; i < tapTimes.length; i++) {
      const d = tapTimes[i] - tapTimes[i - 1];
      if (d >= MIN_TAP_MS && d <= MAX_TAP_MS) out.push(d);
    }
    return out;
  }, []);

  const intervals = useMemo(
    () => computeIntervals(taps),
    [taps, computeIntervals],
  );

  const bpm = useMemo(() => {
    if (intervals.length < 2) return null;
    const ms = median(intervals);
    if (!ms) return null;
    const val = 60000 / ms;
    if (!Number.isFinite(val)) return null;
    return clamp(Math.round(val), 1, 999);
  }, [intervals]);

  const stability = useMemo(() => {
    if (intervals.length < 3) return null;
    const a = intervals.reduce((s, x) => s + x, 0) / intervals.length;
    const v =
      intervals.reduce((acc, x) => acc + (x - a) * (x - a), 0) /
      (intervals.length - 1);
    const sd = Math.sqrt(v);
    if (sd < 18) return "Very steady";
    if (sd < 35) return "Steady";
    if (sd < 60) return "A bit wobbly";
    return "Wobbly";
  }, [intervals]);

  const msPerBeat = useMemo(() => {
    if (!bpm) return null;
    const ms = 60000 / bpm;
    if (!Number.isFinite(ms)) return null;
    return Math.round(ms);
  }, [bpm]);

  const bpmStr = bpm == null ? "--" : String(bpm);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: bpmTextRef,
    deps: [bpmStr, isFs, active, tick, locked],
    minPx: 84,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 140 : 96,
  });

  const persistSettings = useCallback(
    (next: { resetMs: number; holdMs: number; keyboardTap: boolean }) => {
      try {
        localStorage.setItem("bpmTapper.settings.v1", JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [],
  );

  const persistHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem("bpmTapper.history.v1", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // load settings + history
    try {
      const raw = localStorage.getItem("bpmTapper.settings.v1");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s?.resetMs === "number")
          setResetMs(clamp(s.resetMs, 500, 60000));
        if (typeof s?.holdMs === "number") setHoldMs(clamp(s.holdMs, 0, 60000));
        if (typeof s?.keyboardTap === "boolean") setKeyboardTap(s.keyboardTap);
      }
    } catch {
      // ignore
    }

    try {
      const rawH = localStorage.getItem("bpmTapper.history.v1");
      if (rawH) {
        const h = JSON.parse(rawH);
        if (Array.isArray(h)) setHistory(h.slice(0, 10));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    persistSettings({ resetMs, holdMs, keyboardTap });
  }, [resetMs, holdMs, keyboardTap, persistSettings]);

  const pushHistory = useCallback(() => {
    if (!bpm) return;
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: Date.now(),
      bpm,
      taps: tapsRef.current.length,
      intervals: computeIntervals(tapsRef.current).length,
      stability,
    };

    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 8);
      persistHistory(next);
      return next;
    });
  }, [bpm, stability, computeIntervals, persistHistory]);

  const hardReset = useCallback(() => {
    tapsRef.current = [];
    setTaps([]);
    setActive(false);
    setTick(0);
    setCopied(false);
    setLocked(false);
    clearIdle();
    clearHold();
  }, [clearIdle, clearHold]);

  const endSession = useCallback(() => {
    // record if we have a usable BPM, then clear
    if (bpm) pushHistory();
    hardReset();
  }, [bpm, pushHistory, hardReset]);

  const scheduleFinalClear = useCallback(() => {
    clearHold();
    if (!holdMs) {
      endSession();
      return;
    }
    holdTimerRef.current = window.setTimeout(() => {
      endSession();
    }, holdMs);
  }, [clearHold, holdMs, endSession]);

  const armIdle = useCallback(() => {
    clearIdle();
    if (locked) return;
    if (resetMs <= 0) return;

    idleTimerRef.current = window.setTimeout(() => {
      // stop “active” session, but hold last result for holdMs (then clear)
      setActive(false);
      scheduleFinalClear();
    }, resetMs);
  }, [clearIdle, resetMs, locked, scheduleFinalClear]);

  const registerTap = useCallback(() => {
    if (locked) return;

    clearHold();

    const now = performance.now();

    // If we were idle (session ended), start clean.
    const base = active ? tapsRef.current : [];
    const next = [...base, now].slice(-MAX_TAPS);

    tapsRef.current = next;
    setTaps(next);
    setTick((t) => t + 1);
    setActive(true);
    armIdle();
  }, [active, armIdle, locked, clearHold]);

  const copy = useCallback(async () => {
    if (!bpm) return;
    try {
      await navigator.clipboard.writeText(
        `Tap BPM\nTempo: ${bpm} BPM\nms/beat: ${msPerBeat ?? "n/a"}\nTaps: ${
          taps.length
        }\nIntervals used: ${intervals.length}\nStability: ${
          stability ?? "n/a"
        }\nhttps://www.ilovetimers.com/bpm-tapper`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [bpm, taps.length, intervals.length, stability, msPerBeat]);

  useEffect(() => {
    return () => {
      clearIdle();
      clearHold();
    };
  }, [clearIdle, clearHold]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "escape" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
      return;
    }

    if (k === "r") {
      endSession();
      return;
    }

    if (k === "c") {
      void copy();
      return;
    }

    if (!keyboardTap) return;

    // Space/Enter tapping is expected for this kind of tool on desktop.
    if (e.key === " " || k === "enter") {
      e.preventDefault();
      registerTap();
    }
  };

  const onStagePointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null;
    const isControl = !!t?.closest(
      "button, a, input, textarea, select, details, summary, label",
    );
    if (isControl) return;

    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    registerTap();
  };

  const statusLabel = locked
    ? "Locked"
    : active
      ? "Keep tapping"
      : bpm
        ? "Last result"
        : "Tap anywhere to start";

  const lockToggle = () => {
    if (!bpm) return;
    setLocked((x) => {
      const next = !x;
      if (next) {
        clearIdle();
        clearHold();
        setActive(false);
      } else {
        // unlocking resumes normal behavior; next tap will continue the current series
        armIdle();
      }
      return next;
    });
  };

  const displayTone = locked
    ? "border-slate-200 bg-white text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const resetLabel =
    resetMs <= 0
      ? "Off"
      : resetMs >= 1000
        ? `${Math.round(resetMs / 1000)}s`
        : `${resetMs}ms`;

  const holdLabel =
    holdMs <= 0
      ? "Off"
      : holdMs >= 1000
        ? `${Math.round(holdMs / 1000)}s`
        : `${holdMs}ms`;

  const shortcutsText = keyboardTap
    ? "Tap/click anywhere · Space/Enter tap · F fullscreen · R reset · C copy"
    : "Tap/click anywhere · F fullscreen · R reset · C copy";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Tap BPM"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-2 text-sm text-slate-700 sm:flex">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
              Reset: {resetLabel}
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
              Hold: {holdLabel}
            </div>
            {locked ? (
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Locked
              </div>
            ) : null}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={lockToggle}
              disabled={!bpm}
              className="py-1 text-sm"
            >
              {locked ? "Unlock" : "Lock"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => void copy()}
              disabled={!bpm}
              className="py-1 text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn kind="ghost" onClick={endSession} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {/* Controls (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Reset: {resetLabel}
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Hold: {holdLabel}
              </div>
              {locked ? (
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Locked
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <Btn kind="ghost" onClick={lockToggle} disabled={!bpm}>
                {locked ? "Unlock" : "Lock"}
              </Btn>
              <Btn kind="ghost" onClick={() => void copy()} disabled={!bpm}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
              >
                Fullscreen
              </Btn>
              <Btn kind="ghost" onClick={endSession}>
                Reset
              </Btn>
            </div>
          </div>
        )}

        {/* Tap Stage */}
        <div
          ref={displayBoxRef}
          className={[
            "mt-4 flex flex-col items-center justify-center rounded-2xl border font-mono font-extrabold",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 420,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "manipulation",
            overflow: "hidden",
          }}
          aria-live="polite"
          onPointerDownCapture={onStagePointerDownCapture}
          onContextMenu={(e) => e.preventDefault()}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click anywhere to register a beat" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={bpmTextRef}
            className={[
              "mt-2 inline-block text-center text-slate-950",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {bpmStr}
          </span>

          <div className="mt-2 text-sm font-semibold text-slate-600">
            {bpm ? "BPM" : "Waiting for taps"}
          </div>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Session
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Taps:{" "}
                <span className="font-extrabold text-slate-950">
                  {taps.length}
                </span>
                {" · "}Intervals:{" "}
                <span className="font-extrabold text-slate-950">
                  {intervals.length}
                </span>
                {stability ? (
                  <>
                    {" · "}Stability:{" "}
                    <span className="font-extrabold text-slate-950">
                      {stability}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Auto-reset after{" "}
                <span className="font-semibold">{resetLabel}</span>
                {holdMs > 0 ? (
                  <>
                    {" "}
                    · Holds last result for{" "}
                    <span className="font-semibold">{holdLabel}</span>
                  </>
                ) : null}
                {locked ? (
                  <>
                    {" "}
                    · <span className="font-semibold">Locked</span> (no reset)
                  </>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Timing
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                ms/beat:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ?? "--"}
                </span>
                <span className="text-slate-500"> · </span>
                ms/8th:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ? Math.round(msPerBeat / 2) : "--"}
                </span>
                <span className="text-slate-500"> · </span>
                ms/16th:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ? Math.round(msPerBeat / 4) : "--"}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Shortcuts:{" "}
                <span className="font-semibold text-slate-700">
                  {keyboardTap ? "Space/Enter tap · " : ""}F
                </span>{" "}
                fullscreen ·{" "}
                <span className="font-semibold text-slate-700">R</span> reset ·{" "}
                <span className="font-semibold text-slate-700">C</span> copy
              </div>
            </div>
          </div>

          {!isFs && history.length > 0 && (
            <div className="mt-4 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Recent results
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-xs font-semibold text-slate-700 hover:underline"
                  onClick={() => {
                    setHistory([]);
                    try {
                      localStorage.removeItem("bpmTapper.history.v1");
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {history.slice(0, 6).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
                    onClick={() => {
                      // restore result (as a held session) so user can copy/lock it
                      tapsRef.current = []; // restore as display-only
                      setTaps([]);
                      setActive(false);
                      setTick((t) => t + 1);
                      setLocked(true);
                      clearIdle();
                      clearHold();
                      // store bpm by faking taps is messy; instead: lock mode + preserve via history copy
                      // We keep restore minimal: copy from history is the primary action.
                      void navigator.clipboard
                        ?.writeText(
                          `Tap BPM\nTempo: ${h.bpm} BPM\nTaps: ${h.taps}\nIntervals used: ${h.intervals}\nStability: ${
                            h.stability ?? "n/a"
                          }\nhttps://www.ilovetimers.com/bpm-tapper`,
                        )
                        .then(() => {
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1200);
                        })
                        .catch(() => {});
                    }}
                    title="Click to copy this result"
                  >
                    <div className="text-sm font-extrabold text-slate-950">
                      {h.bpm} BPM
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-600">
                      Taps {h.taps} · Intervals {h.intervals}
                      {h.stability ? ` · ${h.stability}` : ""}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Click a recent result to copy it.
              </div>
            </div>
          )}

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
                Auto-reset after pause
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {RESET_PRESETS_MS.map((ms) => (
                  <Chip
                    key={ms}
                    active={ms === resetMs}
                    onClick={() => setResetMs(ms)}
                    disabled={locked}
                  >
                    {Math.round(ms / 1000)}s
                  </Chip>
                ))}
                <Chip
                  active={resetMs <= 0}
                  onClick={() => setResetMs(0)}
                  disabled={locked}
                >
                  Off
                </Chip>
              </div>
              <div className="mt-2 text-xs text-slate-600">
                Shorter resets feel snappier. Longer resets help if you pause
                between phrases.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">
                Hold last result
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {HOLD_PRESETS_MS.map((ms) => (
                  <Chip
                    key={ms}
                    active={ms === holdMs}
                    onClick={() => setHoldMs(ms)}
                  >
                    {ms === 0 ? "Off" : `${Math.round(ms / 1000)}s`}
                  </Chip>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={keyboardTap}
                    onChange={(e) => setKeyboardTap(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Space/Enter to tap
                </label>

                <div className="text-xs text-slate-600">{shortcutsText}</div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Reset {resetLabel}
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Hold {holdLabel}
              </div>
              {msPerBeat ? (
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  {msPerBeat} ms/beat
                </div>
              ) : null}
              {locked ? (
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Locked
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Btn kind="ghost" onClick={lockToggle} disabled={!bpm}>
                {locked ? "Unlock" : "Lock"}
              </Btn>
              <Btn kind="ghost" onClick={() => void copy()} disabled={!bpm}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn kind="ghost" onClick={endSession}>
                Reset
              </Btn>
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
export default function BpmTapperPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/bpm-tapper";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tap BPM",
        url,
        description:
          "Tap BPM counter and tempo tapper. Tap anywhere to estimate BPM. Auto-resets after inactivity and supports fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Tap BPM", item: url },
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
            Tap BPM (Instant Tempo Tapper)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Tap anywhere to estimate beats per minute. Use Lock to keep the
            result, and see milliseconds per beat for timing.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <BpmTapperCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Tap BPM</span>
        </p>
      </section>
    </main>
  );
}

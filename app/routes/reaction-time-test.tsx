// app/routes/reaction-time-test.tsx
import type { Route } from "./+types/reaction-time-test";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Reaction Time Test (Fast Human Reflex Test, Instant Results)";
  const description =
    "Test your reaction time in seconds. Tap or press when the screen changes and see your best and average reaction speed instantly.";

  const url = "https://www.ilovetimers.com/reaction-time-test";

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
   UTILS
========================================================= */
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

/**
 * True only when the tap is on a real control that should NOT trigger the stage.
 * Important: do NOT consider the stage itself "interactive" (it has role/button).
 */
function isInteractiveTarget(
  target: EventTarget | null,
  stageEl: HTMLElement | null,
) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // Only treat real, nested controls as interactive.
  const interactive = el.closest(
    'button, a, input, textarea, select, summary, details, [role="link"], [contenteditable="true"]',
  );
  if (!interactive) return false;

  // If the closest interactive element is the stage itself (shouldn't happen with selector),
  // or the stage isn't provided, treat as interactive only when it's NOT the stage.
  if (!stageEl) return true;

  // If the interactive element is inside the stage, we still want to treat it as interactive
  // so buttons like Reset take priority. If it isn't inside the stage, it doesn't matter.
  return stageEl.contains(interactive);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function fmtMs(ms: number | null) {
  if (ms == null || !Number.isFinite(ms)) return "--";
  return `${Math.round(ms)} ms`;
}

function bucketLabel(ms: number) {
  if (!Number.isFinite(ms)) return "";
  if (ms < 150) return "Lightning fast";
  if (ms < 200) return "Very fast";
  if (ms < 250) return "Fast";
  if (ms < 300) return "Average";
  if (ms < 350) return "A bit slow";
  return "Slow";
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
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
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

function StatPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
        {label}
      </div>
      <div className="mt-1 text-base font-extrabold text-slate-900">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs font-semibold text-slate-600">{hint}</div>
      ) : null}
    </div>
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
   REACTION TIME TEST
========================================================= */
type Phase = "idle" | "waiting" | "go" | "falseStart" | "done";

function ReactionTimeTestCard() {
  // Settings
  const [trialsTarget, setTrialsTarget] = useState(10);
  const [minDelayMs, setMinDelayMs] = useState(1200);
  const [maxDelayMs, setMaxDelayMs] = useState(3200);
  const [zen, setZen] = useState(true);

  // Game state
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);

  // UI state
  const [copied, setCopied] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const stageRef = useRef<HTMLDivElement>(null);
  const bigBoxRef = useRef<HTMLDivElement>(null);
  const bigTextRef = useRef<HTMLSpanElement>(null);

  // Timing refs
  const waitTimerRef = useRef<number | null>(null);
  const goAtRef = useRef<number | null>(null);

  const timesRef = useRef<number[]>([]);
  useEffect(() => {
    timesRef.current = times;
  }, [times]);

  const phaseRef = useRef<Phase>("idle");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const trialsTargetRef = useRef<number>(trialsTarget);
  useEffect(() => {
    trialsTargetRef.current = trialsTarget;
  }, [trialsTarget]);

  const idleHideRef = useRef<number | null>(null);

  const trialsDone = times.length;
  const done = trialsDone >= trialsTarget;

  useEffect(() => {
    if (!done) return;
    setPhase("done");
  }, [done]);

  const best = useMemo(() => {
    if (!times.length) return null;
    return Math.min(...times);
  }, [times]);

  const avg = useMemo(() => {
    if (!times.length) return null;
    return mean(times);
  }, [times]);

  const med = useMemo(() => {
    if (!times.length) return null;
    return median(times);
  }, [times]);

  const consistency = useMemo(() => {
    if (times.length < 2) return null;
    const a = mean(times);
    const v =
      times.reduce((acc, x) => acc + (x - a) * (x - a), 0) / (times.length - 1);
    return Math.sqrt(v);
  }, [times]);

  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current) window.clearTimeout(waitTimerRef.current);
    waitTimerRef.current = null;
  }, []);

  const resetRun = useCallback(() => {
    clearWaitTimer();
    goAtRef.current = null;
    setPhase("idle");
    setTimes([]);
    setFalseStarts(0);
    setLastMs(null);
    setUiHidden(false);
  }, [clearWaitTimer]);

  const scheduleIdleHide = useCallback(() => {
    if (!zen) return;
    if (!isFs) return;
    const p = phaseRef.current;
    if (!(p === "waiting" || p === "go")) return;

    if (idleHideRef.current) window.clearTimeout(idleHideRef.current);
    setUiHidden(false);
    idleHideRef.current = window.setTimeout(() => setUiHidden(true), 2200);
  }, [zen, isFs]);

  useEffect(() => {
    setUiHidden(false);

    const onMove = () => scheduleIdleHide();
    const onKey = () => scheduleIdleHide();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("keydown", onKey);
      if (idleHideRef.current) window.clearTimeout(idleHideRef.current);
    };
  }, [scheduleIdleHide]);

  const startTrial = useCallback(() => {
    if (timesRef.current.length >= trialsTargetRef.current) return;

    clearWaitTimer();
    goAtRef.current = null;

    const lo = clamp(minDelayMs, 300, 10000);
    const hi = clamp(maxDelayMs, lo + 100, 20000);
    const delay = Math.floor(lo + Math.random() * (hi - lo));

    setPhase("waiting");

    waitTimerRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
      try {
        if ("vibrate" in navigator) (navigator as any).vibrate?.(20);
      } catch {
        // ignore
      }
    }, delay);
  }, [clearWaitTimer, minDelayMs, maxDelayMs]);

  const registerResponse = useCallback(() => {
    const p = phaseRef.current;

    if (p === "waiting") {
      clearWaitTimer();
      goAtRef.current = null;
      setFalseStarts((n) => n + 1);
      setPhase("falseStart");
      return;
    }

    if (p === "go") {
      const goAt = goAtRef.current;
      if (!goAt) return;
      const now = performance.now();
      const ms = clamp(now - goAt, 0, 60000);

      setLastMs(ms);

      setTimes((arr) => {
        const next = [...arr, ms];
        return next.length > trialsTargetRef.current
          ? next.slice(0, trialsTargetRef.current)
          : next;
      });

      goAtRef.current = null;

      if (timesRef.current.length + 1 >= trialsTargetRef.current) {
        setPhase("done");
      } else {
        setPhase("idle");
      }
      return;
    }

    if (p === "falseStart") {
      startTrial();
      return;
    }

    if (p === "done") return;

    startTrial();
  }, [clearWaitTimer, startTrial]);

  useEffect(() => {
    setTimes((t) => (t.length > trialsTarget ? t.slice(0, trialsTarget) : t));
    if (timesRef.current.length > 0) {
      resetRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialsTarget]);

  useEffect(() => {
    return () => {
      clearWaitTimer();
    };
  }, [clearWaitTimer]);

  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Reaction Time Test");
    lines.push(`Trials: ${times.length}/${trialsTarget}`);
    if (lastMs != null) lines.push(`Last: ${fmtMs(lastMs)}`);
    if (best != null) lines.push(`Best: ${fmtMs(best)}`);
    if (avg != null) lines.push(`Average: ${fmtMs(avg)}`);
    if (med != null) lines.push(`Median: ${fmtMs(med)}`);
    if (consistency != null)
      lines.push(`Consistency (SD): ${fmtMs(consistency)}`);
    if (falseStarts) lines.push(`False starts: ${falseStarts}`);
    lines.push("https://www.ilovetimers.com/reaction-time-test");
    return lines.join("\n");
  }, [
    times.length,
    trialsTarget,
    lastMs,
    best,
    avg,
    med,
    consistency,
    falseStarts,
  ]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  // Global key handling so Space reacts instantly.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const k = e.key.toLowerCase();

      if (k === "f") {
        if (cardRef.current) toggleFullscreen(cardRef.current);
        return;
      }
      if (k === "c") {
        void copy();
        return;
      }
      if (k === "r") {
        resetRun();
        return;
      }
      if (k === "z") {
        setZen((v) => !v);
        setUiHidden(false);
        return;
      }
      if (k === "escape" && isFs) {
        document.exitFullscreen().catch(() => {});
        return;
      }

      if (e.key === " " || k === "enter" || k === "spacebar") {
        e.preventDefault();
        registerResponse();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [copy, isFs, registerResponse, resetRun]);

  const setPresets = useCallback(
    (preset: "quick" | "standard" | "focus") => {
      if (preset === "quick") {
        setTrialsTarget(5);
        setMinDelayMs(900);
        setMaxDelayMs(2600);
      } else if (preset === "standard") {
        setTrialsTarget(10);
        setMinDelayMs(1200);
        setMaxDelayMs(3200);
      } else {
        setTrialsTarget(15);
        setMinDelayMs(1500);
        setMaxDelayMs(4200);
      }
      resetRun();
    },
    [resetRun],
  );

  const softHidden = zen && uiHidden;

  const statusLabel =
    phase === "waiting"
      ? "Wait"
      : phase === "go"
        ? "Tap"
        : phase === "falseStart"
          ? "Too soon"
          : phase === "done"
            ? "Done"
            : trialsDone === 0
              ? "Ready"
              : "Next";

  const stageTheme =
    phase === "go"
      ? { bg: "bg-emerald-500/15", border: "border-emerald-300" }
      : phase === "waiting"
        ? { bg: "bg-rose-500/10", border: "border-rose-300" }
        : phase === "falseStart"
          ? { bg: "bg-amber-500/15", border: "border-amber-300" }
          : { bg: "bg-slate-50", border: "border-slate-200" };

  const instruction =
    phase === "waiting"
      ? "Wait for green…"
      : phase === "go"
        ? "GREEN! TAP or PRESS SPACEBAR now."
        : phase === "falseStart"
          ? "Too soon. That counts as a false start. Tap to try again."
          : phase === "done"
            ? "Run finished. Reset to go again."
            : "Tap to start. When it turns GREEN, PRESS SPACEBAR or TAP (react fast).";

  const bigValue =
    phase === "go"
      ? "GO"
      : phase === "falseStart"
        ? "EARLY"
        : phase === "done"
          ? best == null
            ? "DONE"
            : fmtMs(best).replace(" ms", "")
          : lastMs == null
            ? "--"
            : fmtMs(lastMs).replace(" ms", "");

  const bigSuffix =
    phase === "done"
      ? best == null
        ? ""
        : "BEST (ms)"
      : lastMs == null
        ? ""
        : "ms";

  const fitFontPx = useFitText({
    containerRef: bigBoxRef,
    textRef: bigTextRef,
    deps: [
      bigValue,
      bigSuffix,
      isFs,
      phase,
      trialsDone,
      trialsTarget,
      softHidden,
    ],
    minPx: 56,
    maxPx: isFs ? 520 : 320,
    paddingAllowancePx: isFs ? 72 : 84,
  });

  const handleStagePress = useCallback(
    (target: EventTarget | null) => {
      const stageEl = stageRef.current;
      if (isInteractiveTarget(target, stageEl)) return;
      if (phaseRef.current === "done") return;
      registerResponse();
    },
    [registerResponse],
  );

  return (
    <Card cardRef={cardRef} tabIndex={0} isFullscreen={isFs}>
      <FullscreenTopBar
        show={isFs}
        title="Reaction Time Test"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn kind="ghost" onClick={resetRun} className="py-1 text-sm">
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
                Reaction Time Test
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Tap to start. When it turns GREEN, PRESS SPACEBAR or TAP (react
                fast).
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  checked={zen}
                  onChange={(e) => {
                    setZen(e.target.checked);
                    setUiHidden(false);
                  }}
                />
                Zen
              </label>

              <Btn kind="ghost" onClick={copy} className="py-2">
                {copied ? "Copied" : "Copy"}
              </Btn>

              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>

              <Btn kind="ghost" onClick={resetRun} className="py-2">
                Reset
              </Btn>
            </div>
          </div>
        )}

        {/* Stage */}
        <div
          ref={stageRef}
          className={[
            "relative mt-4 overflow-hidden rounded-2xl border-2",
            stageTheme.border,
            stageTheme.bg,
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 460,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            touchAction: "manipulation",
            userSelect: "none",
          }}
          onMouseMove={() => scheduleIdleHide()}
          onTouchStart={() => scheduleIdleHide()}
          onPointerDownCapture={(e) => {
            // Capture ensures we still get the event even if something inside stops propagation.
            handleStagePress(e.target);
          }}
          onClick={(e) => {
            // Fallback for browsers that are weird about pointer events.
            handleStagePress(e.target);
          }}
          role="button"
          aria-label="Reaction time stage. Tap/click or press Spacebar to respond."
        >
          <div className="flex h-full w-full flex-col items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Trials {trialsDone}/{trialsTarget} · False starts{" "}
                  {falseStarts}
                </div>

                {!isFs && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    Shortcuts: Spacebar/Enter tap · F fullscreen · R reset · Z
                    zen · C copy
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <StatPill
                  label="Last"
                  value={lastMs == null ? "--" : fmtMs(lastMs)}
                  hint={lastMs == null ? "Run a trial" : bucketLabel(lastMs)}
                />
                <StatPill
                  label="Best"
                  value={best == null ? "--" : fmtMs(best)}
                  hint={best == null ? "No data yet" : "Lower is better"}
                />
                <StatPill
                  label="Average"
                  value={avg == null ? "--" : fmtMs(avg)}
                  hint={avg == null ? "No data yet" : "Across this run"}
                />
                <StatPill
                  label="Median"
                  value={med == null ? "--" : fmtMs(med)}
                  hint={
                    med == null ? "No data yet" : "Less sensitive to spikes"
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    {statusLabel}
                  </div>

                  <div
                    ref={bigBoxRef}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 sm:p-6"
                    style={{ overflow: "hidden" }}
                    aria-live="polite"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span
                        ref={bigTextRef}
                        className="inline-block text-center font-mono font-extrabold tracking-widest text-slate-900"
                        style={{
                          fontSize: `${fitFontPx}px`,
                          lineHeight: "1",
                          transform: "translateZ(0)",
                        }}
                      >
                        {bigValue}
                      </span>

                      {bigSuffix ? (
                        <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-600">
                          {bigSuffix}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={[
                      "mt-1 text-center text-sm font-semibold text-slate-700",
                      softHidden ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                    style={{ transition: "opacity 220ms ease" }}
                  >
                    {instruction}
                  </div>

                  <div
                    className={[
                      "mt-2 flex flex-wrap items-center justify-center gap-3",
                      softHidden ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                    style={{ transition: "opacity 220ms ease" }}
                  >
                    <Btn
                      kind="solid"
                      onClick={() => {
                        if (phaseRef.current === "done") return;
                        registerResponse();
                      }}
                      className="px-6 py-3 text-lg"
                      disabled={phase === "done"}
                    >
                      {phase === "waiting"
                        ? "Wait"
                        : phase === "go"
                          ? "TAP"
                          : phase === "falseStart"
                            ? "Try again"
                            : phase === "done"
                              ? "Done"
                              : trialsDone === 0
                                ? "Start"
                                : "Next"}
                    </Btn>

                    <Btn kind="ghost" onClick={resetRun} className="px-4 py-3">
                      Reset
                    </Btn>
                  </div>
                </div>
              </div>

              {times.length ? (
                <div
                  className={[
                    "mt-4 rounded-2xl border border-slate-200 bg-white p-4",
                    softHidden ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                  style={{ transition: "opacity 220ms ease" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                      Trial results
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      Consistency (SD):{" "}
                      {consistency == null ? "--" : fmtMs(consistency)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {times.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-900"
                      >
                        {i + 1}: {fmtMs(t)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <FullscreenBottomBar show={isFs}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-600 sm:text-sm">
                Tap anywhere on the stage or press Spacebar/Enter · F fullscreen
                · R reset · Z zen · C copy
              </div>
              <div className="text-xs font-semibold text-slate-700">
                {statusLabel}
              </div>
            </div>
          </FullscreenBottomBar>
        </div>

        {!isFs && (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Presets
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn kind="ghost" onClick={() => setPresets("quick")}>
                  Quick (5)
                </Btn>
                <Btn kind="ghost" onClick={() => setPresets("standard")}>
                  Standard (10)
                </Btn>
                <Btn kind="ghost" onClick={() => setPresets("focus")}>
                  Focus (15)
                </Btn>
              </div>
              <div className="mt-3 text-xs font-semibold text-slate-600">
                Presets reset your current run.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Trials
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={trialsTarget}
                  onChange={(e) => {
                    setTrialsTarget(parseInt(e.target.value, 10));
                    resetRun();
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="min-w-[48px] text-right text-sm font-extrabold text-slate-900">
                  {trialsTarget}
                </div>
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-600">
                More trials gives a better average.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Random delay
              </div>

              <div className="mt-3 grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 text-xs font-bold text-slate-600">
                    Min
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={5000}
                    step={50}
                    value={minDelayMs}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setMinDelayMs(v);
                      setMaxDelayMs((m) => Math.max(m, v + 100));
                      resetRun();
                    }}
                    className="w-full cursor-pointer"
                  />
                  <div className="min-w-[72px] text-right text-xs font-extrabold text-slate-900">
                    {minDelayMs} ms
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 text-xs font-bold text-slate-600">
                    Max
                  </div>
                  <input
                    type="range"
                    min={minDelayMs + 100}
                    max={20000}
                    step={50}
                    value={maxDelayMs}
                    onChange={(e) => {
                      setMaxDelayMs(parseInt(e.target.value, 10));
                      resetRun();
                    }}
                    className="w-full cursor-pointer"
                  />
                  <div className="min-w-[72px] text-right text-xs font-extrabold text-slate-900">
                    {maxDelayMs} ms
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs font-semibold text-slate-600">
                Random timing stops you from guessing.
              </div>
            </div>
          </div>
        )}

        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Tip: Spacebar works instantly. (No need to click a button.)
            </div>
            <div className="text-xs text-slate-600">
              Accuracy note: measured with a high-resolution timer. Your device
              input latency still matters.
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
export default function ReactionTimeTestPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/reaction-time-test";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Reaction Time Test",
        url,
        description:
          "Reaction time test. Tap to start, wait for green, then react as fast as possible. Track best, average, median, and false starts. Fullscreen supported.",
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
            name: "Reaction Time Test",
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
          <ReactionTimeTestCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Reaction Time Test</span>
        </p>
      </section>
    </main>
  );
}

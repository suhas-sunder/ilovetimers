// app/routes/reaction-time-test.tsx
import type { Route } from "./+types/reaction-time-test";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Reaction Time Test | Human Reaction Timer (Fast, Free)";
  const description =
    "Free reaction time test and human reaction timer. Tap or press space when the screen turns green. Track best, average, and try multiple runs. Fullscreen and copy results.";
  const url = "https://ilovetimers.com/reaction-time-test";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "reaction time test",
        "human reaction timer",
        "reaction test",
        "reaction time",
        "click speed test",
        "reflex test",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // If user clicked inside any interactive element, do not treat it as a stage tap.
  const interactive = el.closest(
    'button, a, input, textarea, select, summary, details, [role="button"], [role="link"], [contenteditable="true"]',
  );
  return Boolean(interactive);
}

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
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

function fmtMs(ms: number) {
  if (!Number.isFinite(ms)) return "--";
  const rounded = Math.round(ms);
  return `${rounded} ms`;
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

/* =========================================================
   UI PRIMITIVES (match your style)
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
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
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
        {label}
      </div>
      <div className="mt-1 text-base font-extrabold text-amber-950">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs font-semibold text-amber-900/70">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   REACTION TIME TEST
========================================================= */
type Phase = "idle" | "armed" | "waiting" | "go" | "result" | "falseStart";

function ReactionTimeTestCard() {
  // Settings
  const [trialsTarget, setTrialsTarget] = useState(5);
  const [minDelayMs, setMinDelayMs] = useState(1200);
  const [maxDelayMs, setMaxDelayMs] = useState(3200);

  // Game state
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState(
    "Press Start. When it turns green, click or press Space as fast as you can.",
  );

  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [falseStarts, setFalseStarts] = useState(0);

  // UI extras
  const [copied, setCopied] = useState(false);
  const [zen, setZen] = useState(true);
  const [uiHidden, setUiHidden] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const idleRef = useRef<number | null>(null);

  // Timing refs for accuracy
  const waitTimerRef = useRef<number | null>(null);
  const goAtRef = useRef<number | null>(null);
  const armedAtRef = useRef<number | null>(null);

  const tz = useMemo(() => safeTimeZone(), []);

  const trialsDone = times.length;
  const done = trialsDone >= trialsTarget;

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
    const sd = Math.sqrt(v);
    return sd;
  }, [times]);

  const isFs = () => Boolean(document.fullscreenElement);

  const bumpIdle = useCallback(() => {
    if (!zen) return;
    if (!isFs()) return; // only in fullscreen
    if (!(phase === "waiting" || phase === "go")) return; // only when focus matters

    if (idleRef.current) window.clearTimeout(idleRef.current);
    setUiHidden(false);
    idleRef.current = window.setTimeout(() => setUiHidden(true), 2200);
  }, [zen, phase]);

  useEffect(() => {
    setUiHidden(false);

    const onMove = () => bumpIdle();
    const onKey = () => bumpIdle();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("keydown", onKey);
      if (idleRef.current) window.clearTimeout(idleRef.current);
    };
  }, [bumpIdle]);

  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current) window.clearTimeout(waitTimerRef.current);
    waitTimerRef.current = null;
  }, []);

  const resetRun = useCallback(() => {
    clearWaitTimer();
    goAtRef.current = null;
    armedAtRef.current = null;

    setPhase("idle");
    setMessage(
      "Press Start. When it turns green, click or press Space as fast as you can.",
    );
    setTimes([]);
    setLastMs(null);
    setFalseStarts(0);
  }, [clearWaitTimer]);

  const armNext = useCallback(() => {
    clearWaitTimer();
    goAtRef.current = null;

    setPhase("armed");
    setMessage("Ready. Click Start Trial, then wait for green.");
  }, [clearWaitTimer]);

  const startTrial = useCallback(() => {
    if (done) return;

    clearWaitTimer();
    goAtRef.current = null;

    const lo = clamp(minDelayMs, 300, 10000);
    const hi = clamp(maxDelayMs, lo + 100, 20000);
    const delay = Math.floor(lo + Math.random() * (hi - lo));

    setPhase("waiting");
    setMessage("Wait for green...");

    armedAtRef.current = performance.now();

    waitTimerRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
      setMessage("GO! Tap or press Space now!");
      try {
        if ("vibrate" in navigator) (navigator as any).vibrate?.(20);
      } catch {
        // ignore
      }
    }, delay);
  }, [clearWaitTimer, done, minDelayMs, maxDelayMs]);

  const registerResponse = useCallback(() => {
    if (phase === "waiting") {
      clearWaitTimer();
      goAtRef.current = null;

      setFalseStarts((n) => n + 1);
      setPhase("falseStart");
      setMessage("Too soon. False start. Click to try again.");
      return;
    }

    if (phase === "go") {
      const goAt = goAtRef.current;
      if (!goAt) return;

      const now = performance.now();
      const ms = now - goAt;
      const safe = clamp(ms, 0, 60000);

      setLastMs(safe);
      setTimes((arr) => [...arr, safe]);
      setPhase("result");
      setMessage(`${fmtMs(safe)}. ${bucketLabel(safe)}.`);
      return;
    }

    if (phase === "falseStart" || phase === "result") {
      if (times.length >= trialsTarget) return;
      startTrial();
      return;
    }

    if (phase === "idle" || phase === "armed") {
      startTrial();
      return;
    }
  }, [phase, clearWaitTimer, startTrial, times.length, trialsTarget]);

  useEffect(() => {
    setTimes((t) => (t.length > trialsTarget ? t.slice(0, trialsTarget) : t));
  }, [trialsTarget]);

  useEffect(() => {
    if (!done) return;
    const b = best ?? 0;
    const a = avg ?? 0;
    setMessage(
      `Done. Best ${fmtMs(b)}. Average ${fmtMs(a)}. Click Reset to run again.`,
    );
    setPhase("result");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

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
    lines.push(`Time zone: ${tz}`);
    lines.push("https://ilovetimers.com/reaction-time-test");
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
    tz,
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && wrapRef.current) {
      toggleFullscreen(wrapRef.current);
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
    if (k === "enter" || k === " " || k === "spacebar") {
      e.preventDefault();
      registerResponse();
      return;
    }
  };

  const softHidden = zen && uiHidden;

  const panelTheme =
    phase === "go"
      ? {
          bg: "bg-emerald-500/20",
          border: "border-emerald-300",
        }
      : phase === "waiting"
        ? {
            bg: "bg-rose-500/15",
            border: "border-rose-300",
          }
        : phase === "falseStart"
          ? {
              bg: "bg-amber-500/20",
              border: "border-amber-300",
            }
          : {
              bg: "bg-amber-50",
              border: "border-amber-300",
            };

  const mainCTA =
    phase === "waiting"
      ? "Wait..."
      : phase === "go"
        ? "TAP!"
        : done
          ? "Done"
          : trialsDone === 0
            ? "Start"
            : phase === "falseStart"
              ? "Try again"
              : "Next";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Reaction Time Test
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A fast <strong>reaction time test</strong> and{" "}
            <strong>human reaction timer</strong>. Wait for green, then click or
            press Space as fast as you can.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
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
            onClick={() => wrapRef.current && toggleFullscreen(wrapRef.current)}
            className="py-2"
          >
            Fullscreen
          </Btn>

          <Btn kind="ghost" onClick={resetRun} className="py-2">
            Reset
          </Btn>
        </div>
      </div>

      {/* Presets + settings */}
      <div
        className={`mt-5 grid gap-4 lg:grid-cols-3 fadeSoft ${
          softHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
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
          <div className="mt-3 text-xs font-semibold text-amber-900/70">
            Presets reset your current run.
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
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
              className="w-full"
            />
            <div className="min-w-[48px] text-right text-sm font-extrabold text-amber-950">
              {trialsTarget}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-amber-900/70">
            More trials gives a better average.
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
            Random delay
          </div>
          <div className="mt-3 grid gap-3">
            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-bold text-amber-900/80">
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
                className="w-full"
              />
              <div className="min-w-[72px] text-right text-xs font-extrabold text-amber-950">
                {minDelayMs} ms
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs font-bold text-amber-900/80">
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
                className="w-full"
              />
              <div className="min-w-[72px] text-right text-xs font-extrabold text-amber-950">
                {maxDelayMs} ms
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-amber-900/70">
            Random timing stops you from guessing.
          </div>
        </div>
      </div>

      {/* Main test area */}
      <div
        ref={wrapRef}
        data-fs-container
        className={`mt-6 overflow-hidden rounded-2xl border-2 ${panelTheme.border} ${panelTheme.bg}`}
        style={{ minHeight: 420 }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] .fadeSoft{
                transition: opacity 220ms ease;
              }

              /* Keep the SAME interactive UI in fullscreen */
              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container] .stage{
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                padding: 24px;
              }

              [data-fs-container]:fullscreen .stage{
                padding: 6vh 4vw;
              }

              [data-fs-container] .panel{
                width:100%;
                max-width:980px;
              }

              [data-fs-container]:fullscreen .panel{
                max-width: 1100px;
              }

              /* Allow scrolling if content is tall in fullscreen */
              [data-fs-container]:fullscreen{
                overflow:auto;
              }

              /* Make stage feel tappable */
              [data-fs-container] .tapHint{
                user-select:none;
                -webkit-user-select:none;
              }
            `,
          }}
        />

        <div
          className="stage"
          onMouseDown={() => bumpIdle()}
          onTouchStart={() => bumpIdle()}
          onClick={(e) => {
            if (isInteractiveTarget(e.target)) return;
            if (done) return;
            registerResponse();
          }}
          role="button"
          tabIndex={-1}
          aria-label="Reaction time stage. Click or press Space to respond."
        >
          <div className="panel">
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                  Trials {trialsDone}/{trialsTarget} · False starts{" "}
                  {falseStarts}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
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

              <div className="mt-5">
                <div
                  className="rounded-2xl border-2 p-6 text-center"
                  style={{
                    borderColor:
                      phase === "go"
                        ? "rgba(16,185,129,.55)"
                        : phase === "waiting"
                          ? "rgba(244,63,94,.45)"
                          : "rgba(251,191,36,.45)",
                    background:
                      phase === "go"
                        ? "rgba(16,185,129,.10)"
                        : phase === "waiting"
                          ? "rgba(244,63,94,.08)"
                          : "rgba(251,191,36,.10)",
                  }}
                >
                  <div className="text-sm font-extrabold uppercase tracking-widest text-amber-800">
                    {phase === "go"
                      ? "Now"
                      : phase === "waiting"
                        ? "Hold"
                        : phase === "falseStart"
                          ? "Oops"
                          : done
                            ? "Summary"
                            : "Instructions"}
                  </div>

                  <div className="mt-3 text-lg font-bold text-slate-800 tapHint">
                    {message}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Btn
                      onClick={() => {
                        if (done) return;
                        registerResponse();
                      }}
                      disabled={done && phase !== "idle"}
                      className="px-6 py-3 text-lg"
                    >
                      {mainCTA}
                    </Btn>

                    <Btn
                      kind="ghost"
                      onClick={() => {
                        if (phase === "idle") armNext();
                        else if (!done) startTrial();
                      }}
                      disabled={done}
                      className="px-4 py-3"
                    >
                      Start trial
                    </Btn>

                    <Btn kind="ghost" onClick={resetRun} className="px-4 py-3">
                      Reset
                    </Btn>
                  </div>

                  <div
                    className={`mt-4 text-xs font-semibold text-slate-600 fadeSoft ${
                      softHidden ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    Tip: click once so Space works instantly. In fullscreen, you
                    can also click the background to respond.
                  </div>
                </div>
              </div>

              <div
                className={`mt-5 grid gap-3 md:grid-cols-2 fadeSoft ${
                  softHidden ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
                    How to get a fair score
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>Use fullscreen to reduce distractions.</li>
                    <li>Do 10+ trials, then look at average or median.</li>
                    <li>
                      Avoid trackpads if possible. A mouse or touch is more
                      consistent.
                    </li>
                    <li>If you click early, it counts as a false start.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-4 text-xs text-slate-700">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
                    Shortcuts
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>
                      <strong>Space</strong> or <strong>Enter</strong> = Tap /
                      Stop
                    </li>
                    <li>
                      <strong>F</strong> = Fullscreen
                    </li>
                    <li>
                      <strong>R</strong> = Reset
                    </li>
                    <li>
                      <strong>Z</strong> = Zen
                    </li>
                    <li>
                      <strong>C</strong> = Copy results
                    </li>
                  </ul>
                </div>
              </div>

              {times.length ? (
                <div
                  className={`mt-5 rounded-2xl border border-amber-200 bg-white p-4 fadeSoft ${
                    softHidden ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
                      Trial results
                    </div>
                    <div className="text-xs font-semibold text-amber-900/70">
                      Consistency (SD):{" "}
                      {consistency == null ? "--" : fmtMs(consistency)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {times.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-950"
                      >
                        {i + 1}: {fmtMs(t)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Footer shortcuts row */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: Space tap · F fullscreen · R reset · Z zen · C copy
        </div>
        <div className="text-xs text-slate-600">
          Accuracy note: measured with high-resolution timer. Your device input
          latency still matters.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function ReactionTimeTestPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/reaction-time-test";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Reaction Time Test",
        url,
        description:
          "Reaction time test and human reaction timer. Click or press Space when the screen turns green. Track best, average, median, and false starts. Fullscreen supported.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Reaction Time Test",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does the reaction time test work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Press Start, wait for the screen to turn green, then click or press Space as fast as you can. The timer starts at the color change and stops when you respond.",
            },
          },
          {
            "@type": "Question",
            name: "What is a human reaction timer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A human reaction timer measures how quickly you respond to a visual cue. This page uses a random delay so you cannot predict when the cue appears.",
            },
          },
          {
            "@type": "Question",
            name: "How do I get a more reliable score?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Do at least 10 trials and look at average or median. Use fullscreen, and avoid guessing by waiting for green. Different devices can add input delay.",
            },
          },
          {
            "@type": "Question",
            name: "What are the keyboard shortcuts?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Space or Enter to respond, F for fullscreen, R to reset, Z to toggle Zen, and C to copy results.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Reaction Time Test</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Reaction Time Test
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Test your reflexes with a free <strong>reaction time test</strong>{" "}
            and <strong>human reaction timer</strong>. Wait for green, then tap
            fast.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <ReactionTimeTestCard />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              What you are measuring
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              This page measures the time between a visual cue (green) and your
              response (click, tap, or Space). Your device and input method can
              affect results, so compare runs on the same setup.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Get a stable score
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Use 10 to 15 trials, then look at the average and median. Random
              delay prevents you from predicting the cue, and false starts keep
              it honest.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">Use fullscreen</h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Fullscreen reduces distractions and makes this work well on a
              second monitor. Turn on Zen to hide extra UI after a moment.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Reaction time test and human reaction timer
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This free <strong>reaction time test</strong> is a simple way to
              measure how quickly you respond to a visual cue. It acts like a{" "}
              <strong>human reaction timer</strong> by starting the timer at the
              exact moment the cue appears, then stopping when you tap or press
              Space.
            </p>

            <p>
              For fair results, the cue appears after a random delay. That keeps
              you from timing your click. Run multiple trials and focus on the
              average or median instead of just one lucky attempt.
            </p>

            <p>
              Want to share your score? Use <strong>Copy</strong> to copy your
              last, best, and average reaction time.
            </p>

            <p>
              More tools:{" "}
              <Link
                to="/digital-clock"
                className="font-semibold hover:underline"
              >
                Digital Clock
              </Link>{" "}
              ·{" "}
              <Link
                to="/retro-flip-clock"
                className="font-semibold hover:underline"
              >
                Retro Flip Clock
              </Link>{" "}
              ·{" "}
              <Link
                to="/minimalist-clock"
                className="font-semibold hover:underline"
              >
                Minimalist Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Reaction Time Test FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I take the reaction time test?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Start</strong>, wait for the screen to turn green,
              then click or press <strong>Space</strong> as fast as you can.
              Repeat for multiple trials, then check your average.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a false start?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A false start is clicking before the green cue appears. It counts
              because guessing is not reaction time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why does my score change between devices?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Different screens, browsers, and input devices add different
              amounts of delay. For consistent comparison, test on the same
              setup.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I use this in fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Click <strong>Fullscreen</strong> or press <strong>F</strong>
              . In fullscreen you can also click the background stage to respond
              (buttons still work normally).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

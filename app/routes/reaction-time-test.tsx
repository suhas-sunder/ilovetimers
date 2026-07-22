// app/routes/reaction-time-test.tsx
import type { Route } from "./+types/reaction-time-test";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button as Btn,
  ContentSection,
  ControlGroup,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip,
  PresetGroup,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import {
  TechnicalMethod,
  ToolTrustNote,
} from "~/clients/components/trust/ToolTrust";
import { TECHNICAL_SOURCES } from "~/clients/config/technicalSources";
import {
  reactionPressAction,
  summarizeReactionTimes,
} from "~/clients/lib/technicalTimeMath.js";

const REVIEW_DATE = { iso: "2026-07-18", label: "July 18, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Reaction Time Test (Casual Click Speed Test)";
  const description =
    "Try a casual reaction time test in your browser. Wait for the signal, tap or press, then review valid results, false starts, best time, and averages.";

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
      content: "https://www.ilovetimers.com/og-image.png",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { tagName: "link", rel: "canonical", href: url },
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

function fmtMs(ms: number | null) {
  if (ms == null || !Number.isFinite(ms)) return "--";
  return `${Math.round(ms)} ms`;
}

/* =========================================================
   SUPPORTING DISPLAY
========================================================= */
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
    <div className="timer-interaction-panel px-3 py-2">
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

/* =========================================================
   REACTION TIME TEST
========================================================= */
type Phase = "idle" | "waiting" | "go" | "falseStart" | "done";

function ReactionTimeTestTool() {
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
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const stageRef = useRef<HTMLDivElement>(null);
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
  const skipNextClickRef = useRef(false);

  const trialsDone = times.length;
  const done = trialsDone >= trialsTarget;

  useEffect(() => {
    if (!done) return;
    setPhase("done");
  }, [done]);

  const summary = useMemo(() => summarizeReactionTimes(times), [times]);
  const best = summary.best;
  const avg = summary.mean;
  const med = summary.median;
  const consistency = summary.sampleDeviation;

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
    const action = reactionPressAction(p);

    if (action === "false-start") {
      clearWaitTimer();
      goAtRef.current = null;
      setFalseStarts((n) => n + 1);
      setPhase("falseStart");
      return;
    }

    if (action === "record") {
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

    if (action === "ignore") return;

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
        if (cardRef.current) void fullscreen.toggle();
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
        void fullscreen.exit();
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
      ? { bg: "bg-amber-100", border: "border-slate-300" }
      : phase === "waiting"
        ? { bg: "bg-slate-50", border: "border-slate-200" }
        : phase === "falseStart"
          ? { bg: "bg-slate-100", border: "border-amber-300" }
          : { bg: "bg-slate-50", border: "border-slate-200" };

  const instruction =
    phase === "waiting"
      ? "Wait for the signal..."
      : phase === "go"
        ? "Signal! TAP or PRESS SPACEBAR now."
        : phase === "falseStart"
          ? "Too soon. That counts as a false start. Tap to try again."
          : phase === "done"
            ? "Run finished. Reset to go again."
            : "Tap to start. When the signal changes, PRESS SPACEBAR or TAP.";

  const bigValue =
    phase === "go"
      ? "GO"
      : phase === "falseStart"
        ? "EARLY"
        : phase === "waiting"
          ? "WAIT"
        : phase === "done"
          ? best == null
            ? "DONE"
            : fmtMs(best).replace(" ms", "")
          : lastMs == null
            ? trialsDone === 0
              ? "READY"
              : "NEXT"
            : fmtMs(lastMs).replace(" ms", "");

  const bigSuffix =
    phase === "done"
      ? best == null
        ? ""
        : "BEST (ms)"
      : lastMs == null
        ? ""
        : "ms";
  const showStageStatus = bigValue !== statusLabel.toUpperCase();

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
        onExit={() => void fullscreen.exit()}
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

      <div className={isFs ? "flex h-full flex-col" : "timer-interaction-stack flex h-full flex-col"}>
        {/* Stage */}
        <div
          ref={stageRef}
          className={[
            "reaction-display-stage timer-display-surface relative mt-4 overflow-hidden",
            stageTheme.border,
            stageTheme.bg,
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 460,
            height: isFs ? undefined : "clamp(45rem, 64vw, 47.5rem)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            touchAction: "manipulation",
            userSelect: "none",
          }}
          onMouseMove={() => scheduleIdleHide()}
          onTouchStart={() => scheduleIdleHide()}
          onPointerDownCapture={(e) => {
            // Capture ensures we still get the event even if something inside stops propagation.
            skipNextClickRef.current = true;
            handleStagePress(e.target);
          }}
          onClick={(e) => {
            // Fallback for browsers that are weird about pointer events.
            if (skipNextClickRef.current) {
              skipNextClickRef.current = false;
              return;
            }
            handleStagePress(e.target);
          }}
          role="button"
          aria-label="Reaction time stage. Tap/click or press Spacebar to respond."
          data-reaction-state={phase}
          data-reaction-display-region
        >
          <div className="flex h-full w-full flex-col items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-4xl p-4 sm:p-6">
              <div className="p-3 sm:p-5">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className="flex w-full items-center justify-center overflow-hidden p-3 sm:p-6"
                    style={{
                      height: isFs
                        ? "min(42vh, 28rem)"
                        : "clamp(11rem, 24vw, 18rem)",
                    }}
                    aria-live="polite"
                    data-reaction-value-region
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="timer-interaction-stage-value inline-block max-w-full whitespace-nowrap text-center font-mono font-extrabold tabular-nums tracking-widest text-slate-900"
                        style={{
                          fontSize: isFs
                            ? "clamp(6rem, 28vw, 32rem)"
                            : "clamp(5rem, 18vw, 13.8rem)",
                          lineHeight: "1",
                          transform: "translateZ(0)",
                        }}
                      >
                        {bigValue}
                      </span>

                      <div className="mt-2 min-h-4 text-xs font-extrabold uppercase tracking-widest text-slate-600">
                        {bigSuffix || "\u00a0"}
                      </div>
                    </div>
                  </div>

                  <div className="timer-interaction-status min-h-4 text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    {showStageStatus ? statusLabel : "\u00a0"}
                  </div>

                  <div
                    className={[
                      "timer-interaction-context flex h-16 max-w-3xl items-center justify-center text-center text-sm font-semibold text-slate-700 sm:h-12",
                      softHidden ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                    style={{ transition: "opacity 220ms ease" }}
                  >
                    {instruction}
                  </div>

                  <ControlGroup
                    className={[
                      "mt-2",
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
                      className="min-w-28 px-6 py-3 text-lg"
                      disabled={phase === "done"}
                      data-reaction-primary-control
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
                  </ControlGroup>
                </div>
              </div>

              <div className="timer-interaction-context flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                  Trials {trialsDone}/{trialsTarget} · False starts{" "}
                  {falseStarts}
                </div>

              </div>

              <div className="timer-interaction-meta-grid grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatPill
                  label="Last"
                  value={lastMs == null ? "--" : fmtMs(lastMs)}
                  hint={lastMs == null ? "Run a trial" : "Rounded to 1 ms"}
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

              <div
                className={[
                  "timer-interaction-results overflow-auto p-4",
                  softHidden || !times.length ? "opacity-0" : "opacity-100",
                ].join(" ")}
                style={{ height: 92, transition: "opacity 220ms ease" }}
                aria-hidden={!times.length}
              >
                {times.length ? (
                  <>
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
                        className="timer-interaction-pill rounded-lg px-3 py-1 text-xs font-extrabold"
                      >
                        {i + 1}: {fmtMs(t)}
                      </span>
                    ))}
                  </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <FullscreenBottomBar show={isFs}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-600 sm:text-sm">
                Tap anywhere on the stage or press Spacebar/Enter · F fullscreen
                · R reset · Z zen · C copy
              </div>
            </div>
          </FullscreenBottomBar>
        </div>

        {!isFs && (
          <div className="timer-control-stack mt-4" data-reaction-following-content>
            <SecondaryActionRow className="timer-interaction-actions">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--ilt-text-primary)]">
                <input
                  className="h-4 w-4 cursor-pointer accent-[var(--ilt-accent)]"
                  type="checkbox"
                  checked={zen}
                  onChange={(e) => {
                    setZen(e.target.checked);
                    setUiHidden(false);
                  }}
                />
                Zen
              </label>
              <Btn kind="ghost" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
              <Btn kind="ghost" onClick={resetRun}>
                Reset
              </Btn>
            </SecondaryActionRow>

            <PresetGroup
              title="Presets"
              description="Presets reset your current run."
            >
              <PresetChip onClick={() => setPresets("quick")}>Quick (5)</PresetChip>
              <PresetChip onClick={() => setPresets("standard")}>
                Standard (10)
              </PresetChip>
              <PresetChip onClick={() => setPresets("focus")}>Focus (15)</PresetChip>
            </PresetGroup>

            <SettingGroup
              title="Test settings"
              description="Adjust the number of trials and the random wait window."
            >
              <SettingRow>
                <label className="block text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Trials
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="range"
                      min={3}
                      max={25}
                      value={trialsTarget}
                      onChange={(e) => {
                        setTrialsTarget(parseInt(e.target.value, 10));
                        resetRun();
                      }}
                      className="min-h-11 w-full cursor-pointer accent-[var(--ilt-accent)]"
                    />
                    <span className="min-w-[48px] text-right text-sm font-extrabold text-[var(--ilt-text-primary)]">
                      {trialsTarget}
                    </span>
                  </div>
                  <span className="ilt-helper-text mt-1 block">
                    More trials gives a better average.
                  </span>
                </label>

                <label className="block text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Minimum delay
                  <div className="mt-1 flex items-center gap-3">
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
                      className="min-h-11 w-full cursor-pointer accent-[var(--ilt-accent)]"
                    />
                    <span className="min-w-[72px] text-right text-xs font-extrabold text-[var(--ilt-text-primary)]">
                      {minDelayMs} ms
                    </span>
                  </div>
                </label>

                <label className="block text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Maximum delay
                  <div className="mt-1 flex items-center gap-3">
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
                      className="min-h-11 w-full cursor-pointer accent-[var(--ilt-accent)]"
                    />
                    <span className="min-w-[72px] text-right text-xs font-extrabold text-[var(--ilt-text-primary)]">
                      {maxDelayMs} ms
                    </span>
                  </div>
                  <span className="ilt-helper-text mt-1 block">
                    Random timing stops you from guessing.
                  </span>
                </label>
              </SettingRow>
            </SettingGroup>

            <ShortcutHint className="timer-interaction-shortcut">
              <span className="ilt-keycap">Space</span> or{" "}
              <span className="ilt-keycap">Enter</span> tap ·{" "}
              <span className="ilt-keycap">F</span> fullscreen ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">Z</span> zen ·{" "}
              <span className="ilt-keycap">C</span> copy
            </ShortcutHint>
            <div className="ilt-helper-text text-center sm:text-right">
              Browser-based measurement: device, display, and input latency
              affect the result.
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
        dateModified: REVIEW_DATE.iso,
        description:
          "Casual reaction time test. Tap to start, wait for the signal, then respond and review valid results, false starts, best, average, and median. Fullscreen supported.",
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<ReactionTimeTestTool />}
        title="Reaction Time Test"
        description="Tap to start, wait for the signal, then react as fast as possible. Track best, average, median, false starts, and fullscreen runs."
      />
      <SeoBand>
        <ContentSection title="How this reaction time test works">
          <p>
            Start a trial, wait while the test is in its waiting state, then tap
            or press when the signal changes. A valid result measures the time
            between the signal and your input. Early clicks are handled
            separately so they do not get mixed into valid reaction history.
          </p>
          <p>
            The active test area stays first so the next trial is easy to run.
            Summary stats such as best, average, median, valid trials, and false
            starts sit below the interaction area for review after you have run a
            few attempts.
          </p>
        </ContentSection>
        <ContentSection title="How to read your results">
          <p>
            One result is only one tap on one device. A small set of attempts is
            usually more useful than a single number because input timing can
            vary. Best shows your fastest valid attempt, average shows the mean
            of valid trials, and median helps reduce the influence of one very
            slow or very fast attempt.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Early click: you responded before the signal, so it is counted as
              a false start instead of a valid result.
            </li>
            <li>
              Valid click: you responded after the signal, so the result is
              added to the current session history.
            </li>
            <li>
              Reset: clears the current session so you can start a fresh set of
              attempts.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Examples and consistency tips">
          <p>
            Use this page for casual reaction practice, game warmups, checking
            whether one input method feels different from another, or comparing
            the same device before and after changing display settings. Keep the
            browser visible, use the same input method, and avoid comparing
            results across completely different devices as if they were the same
            setup.
          </p>
        </ContentSection>
        <TechnicalMethod
          heading="What the measurement includes"
          sources={[TECHNICAL_SOURCES.highResolutionTime]}
        >
          <p>
            Starting a trial chooses a random whole-millisecond delay from the
            selected minimum up to, but not including, the selected maximum.
            When that browser timeout runs, the page records a monotonic
            performance.now value and changes the stage to GO. A pointer press,
            Space, or Enter records a second performance.now value. The result
            is the difference, clamped from 0 to 60,000 milliseconds and
            displayed to the nearest millisecond.
          </p>
          <p>
            A response during WAIT cancels the pending signal, increases False
            starts by one, and adds no valid result. Press again to begin a new
            random wait. Reset cancels a pending wait and clears valid results,
            false starts, and summary values.
          </p>
          <p>
            For valid trials, Best is the smallest value. Average is the
            arithmetic mean. Median is the middle sorted value, or the mean of
            the two middle values. Consistency uses the sample standard
            deviation, so it appears after at least two valid trials. Example:
            results of 200, 240, and 280 ms have a 200 ms best, a 240 ms average,
            a 240 ms median, and a 40 ms sample standard deviation.
          </p>
          <p>
            The number includes human response time plus display latency, input
            hardware latency, browser event scheduling, operating-system
            scheduling, device load, and rounding. Background tabs and device
            sleep can delay the signal or input handling. The test provides no
            population ranking and is not a clinical, neurological,
            diagnostic, laboratory, driving, sports, or safety measurement.
          </p>
        </TechnicalMethod>
        <ToolTrustNote reviewDate={REVIEW_DATE} heading="How to interpret the measurement">
          <p>
            Results include more than human reaction time. Display latency,
            browser scheduling, device performance, input hardware, touch
            processing, and the chosen input method can all affect the measured
            result.
          </p>
          <p>
            Treat each result as a browser-based estimate for casual practice
            and same-device comparison, not as a medical, driving, sports, or
            safety-critical assessment.
          </p>
        </ToolTrustNote>
        <ContentSection title="Related rhythm and speed tools">
          <p>
            For tapping a rhythm into BPM, use the{" "}
            <a className="ilt-content-link" href="/bpm-tapper">
              BPM tapper
            </a>
            . For solve timing practice, try the{" "}
            <a className="ilt-content-link" href="/speedcubing-timer">
              speedcubing timer
            </a>
            . For general elapsed timing, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For steady audio/visual tempo cues, use the{" "}
            <a className="ilt-content-link" href="/metronome">
              metronome
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Reaction time test FAQ">
          <h3>Why did my early click count separately?</h3>
          <p>
            The test only records a valid result after the signal appears. A
            response before the signal is a false start, so it is kept out of
            the valid history.
          </p>
          <h3>Can I compare phone and laptop results?</h3>
          <p>
            You can compare them casually, but touch screens, keyboards, mice,
            displays, and browsers all add different latency. Same-device
            comparisons are usually more meaningful.
          </p>
          <h3>Is this a clinical reflex test?</h3>
          <p>
            No. It is a browser-based timing interaction for casual practice and
            device comparison. It should not be used for medical, driving,
            sports, or safety-critical decisions.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

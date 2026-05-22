// app/routes/speedcubing-timer.tsx
import type { Route } from "./+types/speedcubing-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Button as Btn,
  ContentSection,
  ControlGroup,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  Select,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  StatusChip,
  Toggle,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Speedcubing Timer (Cube Stopwatch, Fullscreen)";
  const description =
    "Practice speedcubing with a fast, clean cube timer. Start and stop instantly, track splits, and focus on your solves with a big, readable display.";

  const url = "https://www.ilovetimers.com/speedcubing-timer";

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

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
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


/* =========================================================
   SPEEDCUBING TIMER CARD
   - Instant mode: Space/Start toggles start-stop
   - Hold-to-start mode: hold Space to arm, release to start (stop still instant)
   - Auto-save: when stopping, save solve into history
========================================================= */
type Solve = { n: number; ms: number; atISO: string };

type StartMode = "instant" | "hold";

function SpeedcubingTimerTool() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const [solves, setSolves] = useState<Solve[]>([]);
  const [maxSolves, setMaxSolves] = useState(50);

  const [startMode, setStartMode] = useState<StartMode>("hold");
  const [autoSave, setAutoSave] = useState(true);

  const [armed, setArmed] = useState(false);
  const armTimerRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Load persisted settings once
  useEffect(() => {
    try {
      const sm = localStorage.getItem("sc_start_mode");
      const as = localStorage.getItem("sc_auto_save");
      const ms = localStorage.getItem("sc_max_solves");
      if (sm === "instant" || sm === "hold") setStartMode(sm);
      if (as === "0" || as === "1") setAutoSave(as === "1");
      if (ms) {
        const v = Number(ms);
        if (Number.isFinite(v)) setMaxSolves(clamp(v, 5, 200));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem("sc_start_mode", startMode);
    } catch {
      // ignore
    }
  }, [startMode]);

  useEffect(() => {
    try {
      localStorage.setItem("sc_auto_save", autoSave ? "1" : "0");
    } catch {
      // ignore
    }
  }, [autoSave]);

  useEffect(() => {
    try {
      localStorage.setItem("sc_max_solves", String(maxSolves));
    } catch {
      // ignore
    }
  }, [maxSolves]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function clearArmTimer() {
    if (armTimerRef.current) window.clearTimeout(armTimerRef.current);
    armTimerRef.current = null;
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
    return () => {
      stopRaf();
      clearArmTimer();
    };
  }, []);

  function startNow() {
    setRunning((r) => {
      if (r) return r;
      baseRef.current = elapsedRef.current;
      return true;
    });
  }

  function stopNow({ saveIfNeeded }: { saveIfNeeded: boolean }) {
    setRunning((r) => {
      if (!r) return r;
      return false;
    });

    const finalMs = elapsedRef.current;
    baseRef.current = finalMs;

    if (saveIfNeeded && finalMs > 0) {
      setSolves((prev) => {
        const nextSolve: Solve = {
          n: (prev[0]?.n ?? 0) + 1,
          ms: finalMs,
          atISO: new Date().toISOString(),
        };
        const next = [nextSolve, ...prev];
        return next.slice(0, maxSolves);
      });
    }
  }

  function resetCurrent() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    stopRaf();
    startRef.current = null;
    setArmed(false);
    clearArmTimer();
  }

  function clearHistory() {
    setSolves([]);
  }

  function removeSolve(idx: number) {
    setSolves((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleStartStop() {
    if (running) {
      stopNow({ saveIfNeeded: autoSave });
      setArmed(false);
      clearArmTimer();
      return;
    }
    resetCurrent();
    startNow();
  }

  function armStart() {
    if (running) return;
    clearArmTimer();
    setArmed(false);
    // Arm after a short hold so it feels deliberate
    armTimerRef.current = window.setTimeout(() => {
      armTimerRef.current = null;
      setArmed(true);
    }, 250);
  }

  function releaseStart() {
    if (running) return;
    // If not armed yet, do nothing (prevents accidental starts)
    const canStart = armed;
    clearArmTimer();
    setArmed(false);
    if (!canStart) return;

    resetCurrent();
    startNow();
  }

  const statusLabel = running
    ? "Running"
    : armed
      ? "Armed"
      : elapsed > 0
        ? "Stopped"
        : "Ready";

  const best = useMemo(() => {
    if (!solves.length) return null;
    return Math.min(...solves.map((s) => s.ms));
  }, [solves]);

  const avg = useMemo(() => {
    if (!solves.length) return null;
    const sum = solves.reduce((a, s) => a + s.ms, 0);
    return sum / solves.length;
  }, [solves]);

  const timeText = msToStopwatch(elapsed);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, running, armed, solves.length, startMode],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();

      if (startMode === "instant") {
        toggleStartStop();
      } else {
        if (running) {
          stopNow({ saveIfNeeded: autoSave });
        } else {
          // Hold-to-start: keydown arms, keyup starts
          if (!armed && !armTimerRef.current) armStart();
        }
      }
    } else if (k === "r") {
      resetCurrent();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    } else if (k === "s") {
      if (!running && !autoSave && elapsedRef.current > 0) {
        setSolves((prev) => {
          const nextSolve: Solve = {
            n: (prev[0]?.n ?? 0) + 1,
            ms: elapsedRef.current,
            atISO: new Date().toISOString(),
          };
          const next = [nextSolve, ...prev];
          return next.slice(0, maxSolves);
        });
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    if (e.key !== " ") return;
    if (startMode !== "hold") return;
    e.preventDefault();
    if (!running) releaseStart();
  };

  const fsSolves = solves.slice(0, 6);
  const hasSolves = fsSolves.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className=""
    >
      <FullscreenTopBar
        show={isFs}
        title="Speedcubing Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={() => {
                if (startMode === "instant") {
                  toggleStartStop();
                } else {
                  if (running) stopNow({ saveIfNeeded: autoSave });
                }
              }}
              className="py-1 text-sm"
            >
              {running ? "Stop" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetCurrent} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "border-[var(--ilt-border-subtle)] p-3 sm:p-6",
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
          role={isFs ? "button" : undefined}
          title={
            isFs
              ? startMode === "instant"
                ? "Tap/click to start or stop"
                : running
                  ? "Tap/click to stop"
                  : "Use Space hold and release to start"
              : undefined
          }
          onMouseDown={() => {
            if (!isFs) return;
            if (startMode === "instant") {
              toggleStartStop();
              return;
            }
            if (running) {
              stopNow({ saveIfNeeded: autoSave });
              return;
            }
          }}
          onTouchStart={() => {
            if (!isFs) return;
            if (startMode === "instant") {
              toggleStartStop();
              return;
            }
            if (running) {
              stopNow({ saveIfNeeded: autoSave });
              return;
            }
          }}
        >
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              armed && !running ? "text-amber-600" : "",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>

          <div className="mt-4 ilt-content-label">
            {statusLabel}
          </div>

          {/* Fullscreen solve overlay */}
          {isFs && (
            <div
              className={[
                "pointer-events-none absolute left-3 right-3 top-3",
                "sm:left-6 sm:right-6 sm:top-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                    Solves
                  </div>

                  {!hasSolves ? (
                    <div className="ilt-helper-text font-semibold">
                      Stop to save a solve
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsSolves.map((s) => (
                        <div
                          key={`${s.n}-${s.atISO}`}
                          className="flex items-center justify-between gap-3 ilt-surface-card px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-[var(--ilt-text-primary)]">
                            #{s.n}
                          </div>
                          <div className="text-xs font-extrabold text-[var(--ilt-text-primary)]">
                            {msToStopwatch(s.ms)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1">
                  <div className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                    Space{" "}
                    {startMode === "instant" ? "Start/Stop" : "Hold + Release"}
                  </div>
                  {!autoSave && (
                    <div className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                      S = Save
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup>
              <Btn
                kind="solid"
                onClick={() => {
                  if (startMode === "instant") {
                    toggleStartStop();
                  } else {
                    if (running) stopNow({ saveIfNeeded: autoSave });
                    else {
                      resetCurrent();
                      startNow();
                    }
                  }
                }}
              >
                {running ? "Stop" : "Start"}
              </Btn>

              <Btn kind="ghost" onClick={resetCurrent}>
                Reset
              </Btn>

              {!autoSave && (
                <Btn
                  kind="ghost"
                  onClick={() => {
                    if (!running && elapsedRef.current > 0) {
                      setSolves((prev) => {
                        const nextSolve: Solve = {
                          n: (prev[0]?.n ?? 0) + 1,
                          ms: elapsedRef.current,
                          atISO: new Date().toISOString(),
                        };
                        const next = [nextSolve, ...prev];
                        return next.slice(0, maxSolves);
                      });
                    }
                  }}
                  disabled={running || elapsed <= 0}
                >
                  Save
                </Btn>
              )}

            </ControlGroup>

            <SecondaryActionRow className="timer-history-actions">
              <Btn
                kind="ghost"
                onClick={clearHistory}
                disabled={!solves.length}
              >
                Clear history
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-history-shortcut">
              <span className="ilt-keycap">Space</span>{" "}
              {startMode === "instant" ? "start/stop" : "hold+release start"} ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen
              {!autoSave ? (
                <>
                  {" "}
                  · <span className="ilt-keycap">S</span> save
                </>
              ) : null}
            </ShortcutHint>

            {/* Settings */}
            <SettingGroup title="Solve settings">
              <SettingRow>
                <Select
                  label="Start mode"
                  value={startMode}
                  onChange={(e) =>
                    setStartMode(
                      e.target.value === "instant" ? "instant" : "hold",
                    )
                  }
                >
                  <option value="hold">Hold-to-start</option>
                  <option value="instant">Instant toggle</option>
                </Select>

                <div className="flex items-end">
                  <Toggle
                    label="Auto-save on stop"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <Field
                  label="Max saved solves"
                  type="number"
                  min={5}
                  max={200}
                  value={maxSolves}
                  onChange={(e) =>
                    setMaxSolves(clamp(Number(e.target.value || 50), 5, 200))
                  }
                />
              </SettingRow>
            </SettingGroup>
          </div>
        )}

        {/* History (normal only) */}
        {!isFs && (
          <div className="timer-history-panel mx-auto mt-5 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                Solve history
              </div>
              <div className="ilt-helper-text font-semibold">
                {solves.length
                  ? `${solves.length} saved · Best ${best != null ? msToStopwatch(best) : "-"} · Avg ${avg != null ? msToStopwatch(avg) : "-"}`
                  : "No solves saved yet"}
              </div>
            </div>

            {solves.length === 0 ? (
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                Stop the timer to save a solve.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {solves.slice(0, 20).map((s, i) => {
                  const isBest = best != null && s.ms === best;
                  return (
                    <UtilityResultRow
                      key={`${s.n}-${s.atISO}`}
                      className={i === 0 ? "bg-[var(--ilt-bg-subtle)]" : ""}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                          #{s.n}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-[var(--ilt-text-primary)]">
                          {msToStopwatch(s.ms)}
                        </div>
                        {isBest && (
                          <StatusChip className="bg-[var(--ilt-selected-bg)] text-[var(--ilt-selected-text)]">
                            Best
                          </StatusChip>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Btn
                          kind="ghost"
                          size="sm"
                          className="min-h-0 px-2 py-1 text-xs"
                          onClick={() => removeSolve(i)}
                        >
                          Remove
                        </Btn>
                      </div>
                    </UtilityResultRow>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Space{" "}
              {startMode === "instant" ? "start/stop" : "hold+release start"} ·
              R reset · F fullscreen
              {!autoSave ? " · S save" : ""}
            </div>
            <div className="ilt-helper-text font-semibold">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>

      {/* Hold-to-start support via keyup */}
      <div
        className="sr-only"
        // This div is just to ensure React binds onKeyUp reliably on the focusable Card
        // (Card gets focus, so onKeyUp is handled there via capture)
      />
      {/* Capture keyup at Card level */}
      <div className="sr-only" />
      {/* Attach onKeyUp by wrapping is not needed; we use document-level? No.
          Instead, set onKeyUp on Card via prop: not available. So we use a capture listener below. */}
      <KeyUpCapture
        enabled={startMode === "hold"}
        onSpaceUp={() => {
          if (!running) releaseStart();
        }}
      />
    </Card>
  );
}

/* =========================================================
   KEYUP CAPTURE (SPACE RELEASE)
   - Keeps the main Card focused behavior intact
   - Avoids adding document listeners to the timer logic itself
========================================================= */
function KeyUpCapture({
  enabled,
  onSpaceUp,
}: {
  enabled: boolean;
  onSpaceUp: () => void;
}) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.key !== " ") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      onSpaceUp();
    };

    window.addEventListener("keyup", onKeyUp, { passive: false });
    return () => window.removeEventListener("keyup", onKeyUp as any);
  }, [enabled, onSpaceUp]);

  return null;
}

/* =========================================================
   PAGE
========================================================= */
export default function SpeedcubingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/speedcubing-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedcubing Timer",
        url,
        description:
          "Speedcubing timer with a cubing stopwatch format (mm:ss.cc), fullscreen display, and solve history.",
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
            name: "Speedcubing Timer",
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
        display={<SpeedcubingTimerTool />}
        title="Speedcubing Timer"
        description="Practice solves with instant or hold-to-start timing, autosave, solve history, averages, keyboard shortcuts, and fullscreen."
      />
      <SeoBand>
        <ContentSection title="How this speedcubing timer works">
          <p>
            This page is for repeated solve practice. Choose instant start or
            hold-to-start, run a solve, stop the timer, then keep or remove the
            result from your local solve history. The active stopwatch remains
            the first thing you read, with history and averages below the tool.
          </p>
          <p>
            If inspection is enabled, it gives you a short pre-solve rhythm
            before timing begins. Penalty controls and solve removal help keep
            your practice history useful when a solve is mistimed, started by
            mistake, or should not be included in your local summary.
          </p>
        </ContentSection>
        <ContentSection title="Practice examples and settings">
          <p>
            Use instant start for quick casual solves, hold-to-start when you
            want a more deliberate start, and inspection when you want a
            consistent setup before the solve. For a warmup session, keep every
            solve. For focused practice, remove obvious misfires so your recent
            averages reflect the attempts you meant to track.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Practice session: solve several times, review best and average
              rows, then reset history when you want a fresh block.
            </li>
            <li>
              Warmups: keep the display simple and use history only as a rough
              personal trend.
            </li>
            <li>
              Mistimed attempts: apply penalties or remove solves based on how
              you want your local practice log to read.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Averages, history, and limitations">
          <p>
            Averages and best-time rows are practice summaries from the solves
            stored in this browser. They are helpful for comparing your own
            recent attempts, but they are not a certified competition record.
            Device input latency, keyboard behavior, touch timing, browser
            focus, and display refresh rate can affect measured times.
          </p>
          <p>
            If you are practicing for an event, use this page as a local
            training aid and follow the timing rules required by that event or
            organization.
          </p>
        </ContentSection>
        <ContentSection title="Related solving and speed tools">
          <p>
            For a general elapsed timer, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For timing an activity upward from zero, try the{" "}
            <a className="ilt-content-link" href="/count-up-timer">
              count-up timer
            </a>
            . For start-response practice, use the{" "}
            <a className="ilt-content-link" href="/reaction-time-test">
              reaction time test
            </a>
            . For split-based game runs, use the{" "}
            <a className="ilt-content-link" href="/speedrun-timer">
              speedrun timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Speedcubing timer FAQ">
          <h3>Is this WCA-compliant?</h3>
          <p>
            Treat it as a browser-based practice timer. Use the equipment and
            rules required by your event if you need official competition
            timing.
          </p>
          <h3>What should I do with accidental solves?</h3>
          <p>
            Remove the solve or apply the available penalty controls so your
            local history matches how you want to review the session.
          </p>
          <h3>Why do times vary by device?</h3>
          <p>
            Browser focus, keyboard/touch latency, refresh rate, and device load
            can all affect input timing. For comparable practice, keep your setup
            consistent.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

// app/routes/workout-timer.tsx
import type { Route } from "./+types/workout-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Button as Btn,
  ControlGroup,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Workout Timer (Rounds & Rest, Fullscreen)";
  const description =
    "Run workouts with a simple round and rest timer. Big fullscreen countdown designed for gym training, boxing, circuits, and conditioning.";

  const url = "https://www.ilovetimers.com/workout-timer";

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

/* =========================================================
   WORKOUT TIMER CARD (rounds + rest)
========================================================= */
type Phase = "work" | "rest";

function WorkoutTimerCard() {
  const beep = useBeep();

  // Defaults map to classic boxing rounds but work for circuits too
  const [workMin, setWorkMin] = useState(3);
  const [restMin, setRestMin] = useState(1);
  const [rounds, setRounds] = useState(3);

  const [phase, setPhase] = useState<Phase>("work");
  const [roundIdx, setRoundIdx] = useState(1);

  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const workMs = useMemo(() => Math.max(0, workMin * 60 * 1000), [workMin]);
  const restMs = useMemo(() => Math.max(0, restMin * 60 * 1000), [restMin]);

  // Displayed remaining ms, updated only when the displayed second changes.
  const [shownRemainingMs, setShownRemainingMs] = useState(workMs);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingMsRef = useRef<number>(workMs);
  const shownMsRef = useRef<number>(workMs);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const workPresets = useMemo(() => [1, 2, 3, 4, 5], []);
  const restPresets = useMemo(() => [0, 0.25, 0.5, 1, 2, 3], []);
  const roundsPresets = useMemo(() => [2, 3, 4, 5, 6, 8, 10, 12], []);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const hardResetToConfig = useCallback(() => {
    setRunning(false);
    setPhase("work");
    setRoundIdx(1);
    remainingMsRef.current = workMs;
    shownMsRef.current = Math.ceil(workMs / 1000) * 1000;
    setShownRemainingMs(shownMsRef.current);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }, [workMs]);

  // Keep timer aligned when config changes (only when not running)
  useEffect(() => {
    if (running) return;
    hardResetToConfig();
  }, [workMin, restMin, rounds, running, hardResetToConfig]);

  // Main RAF loop (updates state only when shown second changes)
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Resume: if no end time, set it from current remaining
    if (!endRef.current) {
      endRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      remainingMsRef.current = rem;

      const shown = Math.ceil(rem / 1000) * 1000;
      if (shownMsRef.current !== shown) {
        shownMsRef.current = shown;
        setShownRemainingMs(shown);
      }

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

        if (sound) {
          if (phase === "work") beep(520, 260);
          else beep(740, 220);
        }

        // Transition rules
        if (phase === "work") {
          if (restMs > 0) {
            setPhase("rest");
            remainingMsRef.current = restMs;
            const nextShown = Math.ceil(restMs / 1000) * 1000;
            shownMsRef.current = nextShown;
            setShownRemainingMs(nextShown);
            endRef.current = performance.now() + restMs;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          if (roundIdx < rounds) {
            setRoundIdx((r) => r + 1);
            setPhase("work");
            remainingMsRef.current = workMs;
            const nextShown = Math.ceil(workMs / 1000) * 1000;
            shownMsRef.current = nextShown;
            setShownRemainingMs(nextShown);
            endRef.current = performance.now() + workMs;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          setRunning(false);
          return;
        }

        // phase === "rest"
        if (roundIdx < rounds) {
          setRoundIdx((r) => r + 1);
          setPhase("work");
          remainingMsRef.current = workMs;
          const nextShown = Math.ceil(workMs / 1000) * 1000;
          shownMsRef.current = nextShown;
          setShownRemainingMs(nextShown);
          endRef.current = performance.now() + workMs;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [
    running,
    sound,
    finalCountdownBeeps,
    beep,
    phase,
    roundIdx,
    rounds,
    workMs,
    restMs,
  ]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        // Starting or resuming
        endRef.current = performance.now() + remainingMsRef.current;
      } else {
        // Pausing
        endRef.current = null;
      }
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function reset() {
    hardResetToConfig();
  }

  function skipPhase() {
    // Works while running or paused mid-session
    endRef.current = null;
    lastBeepSecondRef.current = null;

    if (phase === "work") {
      if (restMs > 0) {
        setPhase("rest");
        remainingMsRef.current = restMs;
      } else if (roundIdx < rounds) {
        setRoundIdx((r) => r + 1);
        setPhase("work");
        remainingMsRef.current = workMs;
      } else {
        setRunning(false);
        remainingMsRef.current = 0;
      }
    } else {
      // rest -> next work or finish
      if (roundIdx < rounds) {
        setRoundIdx((r) => r + 1);
        setPhase("work");
        remainingMsRef.current = workMs;
      } else {
        setRunning(false);
        remainingMsRef.current = 0;
      }
    }

    const nextShown = Math.ceil(remainingMsRef.current / 1000) * 1000;
    shownMsRef.current = nextShown;
    setShownRemainingMs(nextShown);

    if (running) {
      endRef.current = performance.now() + remainingMsRef.current;
    }
  }

  const shownTime = msToClock(shownRemainingMs);
  const phaseLabel = phase === "work" ? "Work" : restMs > 0 ? "Rest" : "Next";
  const statusLabel = running
    ? "Running"
    : shownRemainingMs > 0
      ? "Paused"
      : "Ready";
  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 10_000;

  // This is the fix: useFitText now computes before paint, so no slow scale-in.
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, phase, roundIdx, rounds, urgent],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const controlsLocked = running;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      skipPhase();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
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
        title="Workout Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={skipPhase} className="py-1 text-sm">
              Next
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface relative order-first mt-0 flex flex-col items-center justify-center text-slate-950",
            urgent ? "border-rose-300 bg-rose-50" : "border-slate-200",
            "p-3 sm:p-6",
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
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center font-mono font-extrabold",
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

          <div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {phaseLabel} · Round {roundIdx}/{rounds} · {statusLabel}
          </div>

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause · N = Next · R = Reset · F = Fullscreen
                </div>
                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap time to Start/Pause
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Controls, presets, and settings (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={skipPhase}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-3">
              <PresetGroup title="Work">
                {workPresets.map((m) => (
                  <Chip
                    key={m}
                    disabled={controlsLocked}
                    onClick={() => setWorkMin(m)}
                    active={m === workMin}
                  >
                    {m}m
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Rest">
                {restPresets.map((m) => (
                  <Chip
                    key={m}
                    disabled={controlsLocked}
                    onClick={() => setRestMin(m)}
                    active={m === restMin}
                  >
                    {m === 0
                      ? "0"
                      : m < 1
                        ? `${Math.round(m * 60)}s`
                        : `${m}m`}
                  </Chip>
                ))}
              </PresetGroup>

              <PresetGroup title="Rounds">
                {roundsPresets.map((r) => (
                  <Chip
                    key={r}
                    disabled={controlsLocked}
                    onClick={() => setRounds(r)}
                    active={r === rounds}
                  >
                    {r}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <SettingGroup title="Settings">
              <SettingRow>
                <Field
                  label="Work minutes"
                  type="number"
                  min={0.25}
                  max={60}
                  step={0.25}
                  value={workMin}
                  disabled={controlsLocked}
                  onChange={(e) =>
                    setWorkMin(
                      clamp(Number(e.target.value || 0.25), 0.25, 60),
                    )
                  }
                />
                <Field
                  label="Rest minutes"
                  hint="Use 0 for back-to-back rounds."
                  type="number"
                  min={0}
                  max={60}
                  step={0.25}
                  value={restMin}
                  disabled={controlsLocked}
                  onChange={(e) =>
                    setRestMin(clamp(Number(e.target.value || 0), 0, 60))
                  }
                />
                <Field
                  label="Rounds"
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  disabled={controlsLocked}
                  onChange={(e) =>
                    setRounds(clamp(Number(e.target.value || 1), 1, 50))
                  }
                />
              </SettingRow>
              <SettingRow className="lg:grid-cols-[auto_auto]">
                <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
              </SettingRow>
            </SettingGroup>

            <UtilityResultRow>
              <span className="ilt-content-label">Session</span>
              <span className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                {phaseLabel} / Round {roundIdx} of {rounds} / {statusLabel}
              </span>
            </UtilityResultRow>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen
            </ShortcutHint>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / N next / R reset / F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {phaseLabel} / Round {roundIdx}/{rounds} / {statusLabel}
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
export default function WorkoutTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/workout-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Workout Timer",
        url,
        description:
          "Fullscreen workout timer for intervals and rounds. Configure work, rest, and rounds with optional sound and keyboard shortcuts.",
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
            name: "Workout Timer",
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
        display={<WorkoutTimerCard />}
        title="Workout Timer (Rounds + Rest)"
        description="Configure work, rest, and rounds, then run a large workout countdown with sound cues and fullscreen controls."
      />

      <SeoBand title="Workout timer basics">
        <p>
          Use this workout timer for repeated training blocks where each round has
          a work interval and an optional rest interval. Keep the main display on
          the current phase and time left, then adjust work length, rest length,
          and rounds when the timer is stopped.
        </p>
        <p>
          Fullscreen mode is useful in a gym, garage, or class setting where the
          active phase needs to be readable from a distance. Keyboard shortcuts
          keep start, pause, next, reset, and fullscreen available without moving
          through the settings.
        </p>
        <h3>Practical workout setups</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use equal work and rest for simple circuits where each exercise has
            the same timing.
          </li>
          <li>
            Use shorter rest intervals when the workout is meant to feel more
            continuous, and longer rest intervals when the next round needs more
            setup time.
          </li>
          <li>
            Set rounds before starting so the display can stay focused on the
            current phase instead of the settings.
          </li>
        </ul>
        <h3>Notes and limitations</h3>
        <p>
          This timer helps run interval structure and audio cues. It does not
          choose exercises, set intensity, or provide medical or injury guidance.
        </p>
        <h3>Related tools</h3>
        <p>
          For faster work/rest training, use the{" "}
          <a className="ilt-content-link" href="/hiit-timer">
            HIIT timer
          </a>
          . For classic 20/10 intervals, try the{" "}
          <a className="ilt-content-link" href="/tabata-timer">
            Tabata timer
          </a>
          . For boxing-style rounds, use the{" "}
          <a className="ilt-content-link" href="/round-timer">
            round timer
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}

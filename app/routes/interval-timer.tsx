// app/routes/interval-timer.tsx
import type { Route } from "./+types/interval-timer";
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
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip as Chip,
  PresetGroup,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

type IntervalStep = {
  id: string;
  label: string;
  minutes: number;
  seconds: number;
};

type IntervalPreset = {
  label: string;
  rounds: number;
  steps: IntervalStep[];
};

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/interval-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const DEFAULT_STEPS: IntervalStep[] = [
  { id: "work", label: "Work", minutes: 25, seconds: 0 },
  { id: "break", label: "Break", minutes: 5, seconds: 0 },
];

const PRESETS: IntervalPreset[] = [
  {
    label: "Work / Break",
    rounds: 4,
    steps: DEFAULT_STEPS,
  },
  {
    label: "Focus / Rest",
    rounds: 3,
    steps: [
      { id: "focus", label: "Focus", minutes: 50, seconds: 0 },
      { id: "rest", label: "Rest", minutes: 10, seconds: 0 },
    ],
  },
  {
    label: "Practice / Pause",
    rounds: 6,
    steps: [
      { id: "practice", label: "Practice", minutes: 5, seconds: 0 },
      { id: "pause", label: "Pause", minutes: 1, seconds: 0 },
    ],
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Interval Timer (Custom Steps and Repeats)";
  const description =
    "Build a custom interval timer with labeled steps, repeats, start, pause, next, reset, presets, and fullscreen display.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "interval timer",
        "custom interval timer",
        "repeating timer",
        "work break timer",
        "practice timer",
        "online interval timer",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ROUTE_URL },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { rel: "canonical", href: ROUTE_URL },
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function durationMs(step: IntervalStep) {
  const minutes = clamp(Number(step.minutes) || 0, 0, 240);
  const seconds = clamp(Number(step.seconds) || 0, 0, 59);
  return Math.max(1000, Math.round((minutes * 60 + seconds) * 1000));
}

function formatIntervalTime(ms: number) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return (
    !!element &&
    (element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "SELECT" ||
      element.isContentEditable)
  );
}

function cloneSteps(steps: IntervalStep[]) {
  return steps.map((step) => ({ ...step }));
}

function makeStep(): IntervalStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: "New step",
    minutes: 1,
    seconds: 0,
  };
}

function IntervalTimerTool() {
  const [steps, setSteps] = useState<IntervalStep[]>(() => cloneSteps(DEFAULT_STEPS));
  const [rounds, setRounds] = useState(4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState(() => durationMs(DEFAULT_STEPS[0]));
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const endRef = useRef<number | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const safeSteps = steps.length ? steps : DEFAULT_STEPS;
  const activeStep = safeSteps[activeIndex] ?? safeSteps[0];
  const activeDurationMs = durationMs(activeStep);
  const shownTime = formatIntervalTime(remainingMs);
  const status = completed
    ? "Complete"
    : running
      ? "Running"
      : remainingMs < activeDurationMs
        ? "Paused"
        : "Ready";
  const totalSteps = safeSteps.length * rounds;
  const completedSteps = (currentRound - 1) * safeSteps.length + activeIndex;
  const progress = useMemo(() => {
    const elapsedInStep = activeDurationMs - Math.max(0, remainingMs);
    const stepProgress = clamp(elapsedInStep / activeDurationMs, 0, 1);
    return clamp((completedSteps + stepProgress) / Math.max(1, totalSteps), 0, 1);
  }, [activeDurationMs, completedSteps, remainingMs, totalSteps]);

  useEffect(() => {
    if (running) return;
    if (!activeStep) return;
    setRemainingMs((current) => {
      if (completed) return 0;
      if (current <= 0 || current > activeDurationMs) return activeDurationMs;
      return current;
    });
  }, [activeDurationMs, activeStep, completed, running]);

  useEffect(() => {
    if (!running) return;

    endRef.current = Date.now() + remainingMs;
    let frame = 0;

    const tick = () => {
      if (endRef.current == null) return;
      const next = endRef.current - Date.now();
      if (next <= 0) {
        setRunning(false);
        endRef.current = null;
        if (activeIndex < safeSteps.length - 1) {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex);
          setRemainingMs(durationMs(safeSteps[nextIndex]));
        } else if (currentRound < rounds) {
          setCurrentRound((round) => round + 1);
          setActiveIndex(0);
          setRemainingMs(durationMs(safeSteps[0]));
        } else {
          setCompleted(true);
          setRemainingMs(0);
        }
        return;
      }
      setRemainingMs(next);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, currentRound, remainingMs, rounds, running, safeSteps]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, activeStep.label],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
  });

  function resetTo(stepsNext = safeSteps, roundsNext = rounds) {
    setRunning(false);
    endRef.current = null;
    setCompleted(false);
    setActiveIndex(0);
    setCurrentRound(1);
    setRemainingMs(durationMs(stepsNext[0]));
    setRounds(clamp(roundsNext, 1, 50));
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }
    if (completed || remainingMs <= 0) {
      setCompleted(false);
      setRemainingMs(activeDurationMs);
    }
    setRunning(true);
  }

  function reset() {
    resetTo();
  }

  function nextStep() {
    setRunning(false);
    endRef.current = null;
    setCompleted(false);
    if (activeIndex < safeSteps.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      setRemainingMs(durationMs(safeSteps[nextIndex]));
      return;
    }
    if (currentRound < rounds) {
      setCurrentRound((round) => round + 1);
      setActiveIndex(0);
      setRemainingMs(durationMs(safeSteps[0]));
      return;
    }
    setCompleted(true);
    setRemainingMs(0);
  }

  function applyPreset(preset: IntervalPreset) {
    const stepsNext = cloneSteps(preset.steps);
    setSteps(stepsNext);
    resetTo(stepsNext, preset.rounds);
  }

  function addStep() {
    setRunning(false);
    endRef.current = null;
    setCompleted(false);
    setSteps((items) => [...items, makeStep()]);
  }

  function updateStep(id: string, updates: Partial<IntervalStep>) {
    setRunning(false);
    endRef.current = null;
    setCompleted(false);
    setSteps((items) => {
      const next = items.map((step) =>
        step.id === id
          ? {
              ...step,
              ...updates,
              label:
                updates.label == null
                  ? step.label
                  : updates.label.trim() || "Interval step",
              minutes:
                updates.minutes == null
                  ? step.minutes
                  : clamp(Number(updates.minutes) || 0, 0, 240),
              seconds:
                updates.seconds == null
                  ? step.seconds
                  : clamp(Number(updates.seconds) || 0, 0, 59),
            }
          : step,
      );
      const nextActive = next[activeIndex] ?? next[0];
      setRemainingMs(durationMs(nextActive));
      return next;
    });
  }

  function deleteStep(id: string) {
    setRunning(false);
    endRef.current = null;
    setCompleted(false);
    setSteps((items) => {
      if (items.length <= 1) return items;
      const next = items.filter((step) => step.id !== id);
      const nextIndex = Math.min(activeIndex, next.length - 1);
      setActiveIndex(nextIndex);
      setRemainingMs(durationMs(next[nextIndex]));
      return next;
    });
  }

  async function copySummary() {
    const lines = [
      "Interval timer",
      `Rounds: ${rounds}`,
      ...safeSteps.map(
        (step, index) =>
          `${index + 1}. ${step.label} - ${formatIntervalTime(durationMs(step))}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "r") {
      reset();
    } else if (key === "n" || event.key === "ArrowRight") {
      nextStep();
    } else if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  return (
    <Card
      cardRef={cardRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Interval Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={nextStep}>
              Next
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interval-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 360,
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
          title={isFs ? "Tap or click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            Round {currentRound} of {rounds} / Step {activeIndex + 1} of{" "}
            {safeSteps.length} / {status}
          </div>
          <div className="mt-3 max-w-4xl text-center text-xl font-bold tracking-tight text-[var(--ilt-text-primary)] sm:text-3xl">
            {activeStep.label}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold tracking-widest"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>
          <div className="mt-4 h-2 w-full max-w-3xl bg-[var(--ilt-bg-panel)]">
            <div
              className="h-full bg-[var(--ilt-accent)]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {completed ? "All intervals complete" : "Custom repeating interval sequence"}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={nextStep}>
                Next step
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Interval presets"
              description="Start with a generic repeating pattern, then edit labels, durations, and rounds."
            >
              {PRESETS.map((preset) => (
                <Chip key={preset.label} disabled={running} onClick={() => applyPreset(preset)}>
                  {preset.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Interval steps"
              description="Each step has its own label and duration. Keep this generic for work, study, practice, household, or light routine timing."
            >
              <SettingRow className="sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.35fr)]">
                <Field
                  label="Repeat rounds"
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  disabled={running}
                  onChange={(event) => {
                    const nextRounds = clamp(Number(event.currentTarget.value || 1), 1, 50);
                    setRounds(nextRounds);
                    setCompleted(false);
                  }}
                  hint="How many times to repeat the full step list."
                />
              </SettingRow>

              <div className="grid gap-3">
                {safeSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="ilt-surface-muted grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(7rem,0.4fr)_minmax(7rem,0.4fr)_auto]"
                  >
                    <Field
                      label={`Step ${index + 1} label`}
                      value={step.label}
                      disabled={running}
                      onChange={(event) =>
                        updateStep(step.id, { label: event.currentTarget.value })
                      }
                    />
                    <Field
                      label={`Step ${index + 1} minutes`}
                      type="number"
                      min={0}
                      max={240}
                      value={step.minutes}
                      disabled={running}
                      onChange={(event) =>
                        updateStep(step.id, {
                          minutes: Number(event.currentTarget.value || 0),
                        })
                      }
                    />
                    <Field
                      label={`Step ${index + 1} seconds`}
                      type="number"
                      min={0}
                      max={59}
                      value={step.seconds}
                      disabled={running}
                      onChange={(event) =>
                        updateStep(step.id, {
                          seconds: Number(event.currentTarget.value || 0),
                        })
                      }
                    />
                    <div className="flex flex-wrap items-end gap-2">
                      <Btn
                        kind="ghost"
                        size="sm"
                        onClick={() => {
                          setRunning(false);
                          endRef.current = null;
                          setCompleted(false);
                          setActiveIndex(index);
                          setRemainingMs(durationMs(step));
                        }}
                        disabled={index === activeIndex}
                      >
                        Set step {index + 1} active
                      </Btn>
                      <Btn
                        variant="danger"
                        size="sm"
                        onClick={() => deleteStep(step.id)}
                        disabled={running || safeSteps.length <= 1}
                      >
                        Delete step {index + 1}
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={addStep} disabled={running}>
                Add interval step
              </Btn>
              <Btn kind="ghost" onClick={() => void copySummary()}>
                {copied ? "Copied" : "Copy interval summary"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / N next / R reset / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ControlGroup className="mx-0 justify-start">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={nextStep}>
                Next
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap display to start or pause / No ads appear in fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function IntervalTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Interval Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based custom interval timer with labeled steps, repeat rounds, presets, controls, and fullscreen display.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Interval Timer",
            item: ROUTE_URL,
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
        display={<IntervalTimerTool />}
        title="Interval Timer"
        description="Create a generic repeating interval timer with labeled steps, editable durations, repeat rounds, next-step control, and fullscreen display."
      />

      <SeoBand>
        <ContentSection title="How this interval timer works">
          <p>
            This interval timer lets you build a custom sequence of labeled
            steps. Each step has its own minutes and seconds, and the whole
            list can repeat for the number of rounds you choose.
          </p>
          <p>
            The main display shows the active step, current round, and time
            remaining in that step. Start, pause, reset, and next-step controls
            stay close to the display so the timer remains useful while it is
            running.
          </p>
        </ContentSection>

        <ContentSection title="When to use a generic interval timer">
          <p>
            Use it for study/rest cycles, practice drills, work/break routines,
            household routines, light exercise circuits, rehearsal timing, or
            any repeated sequence where the labels matter.
          </p>
          <p>
            This page is intentionally broader than a workout timer. If your
            session needs specialized fitness-oriented phases, the{" "}
            <a className="ilt-content-link" href="/hiit-timer">
              HIIT timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/tabata-timer">
              Tabata timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/workout-timer">
              workout timer
            </a>
            , or{" "}
            <a className="ilt-content-link" href="/round-timer">
              round timer
            </a>{" "}
            may be a better fit. For boxing-style round and rest presets, use
            the{" "}
            <a className="ilt-content-link" href="/boxing-timer">
              boxing timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Settings and display options">
          <p>
            Presets give you a quick starting point, but every label and
            duration can be edited. Use repeat rounds for a full step list that
            should run multiple times, and use fullscreen when the interval
            display needs to be visible across a room.
          </p>
          <p>
            Fullscreen mode only contains the active timer display and controls.
            It does not include ad placements.
          </p>
        </ContentSection>

        <ContentSection title="Practical limitations">
          <p>
            Browser timers can be affected by sleeping devices, background tab
            throttling, browser performance, and device volume if you rely on
            other cues outside the page. Choose intervals that fit your own
            plan, routine, or guidance.
          </p>
        </ContentSection>

        <ContentSection title="Interval timer FAQ">
          <h3>How is this different from Pomodoro?</h3>
          <p>
            The{" "}
            <a className="ilt-content-link" href="/pomodoro-timer">
              Pomodoro timer
            </a>{" "}
            is built around work sessions, short breaks, long breaks, and
            cycles. This interval timer is for any custom sequence of labeled
            steps.
          </p>
          <h3>Can I use it for time blocking?</h3>
          <p>
            For a live schedule-style day planner, use the{" "}
            <a className="ilt-content-link" href="/time-blocking-clock">
              time blocking clock
            </a>
            . Use this page when you need a repeating countdown sequence.
          </p>
          <h3>Can I add more than two steps?</h3>
          <p>
            Yes. Add as many interval steps as you need for a stable routine,
            then set the number of repeat rounds.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

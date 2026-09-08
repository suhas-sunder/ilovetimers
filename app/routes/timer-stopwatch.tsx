import type { Route } from "./+types/timer-stopwatch";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Button,
  ContentSection,
  ControlGroup,
  DisplayStage,
  Field,
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
  Toggle,
  ToolFrame,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";
import { useElapsedStopwatch } from "~/clients/hooks/useElapsedStopwatch";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_URL = `${SITE_URL}/timer-stopwatch`;
const REVIEW_DATE = {
  iso: "2026-07-15",
  label: "July 15, 2026",
} as const;

const FAQ_ITEMS = [
  {
    question: "Can the timer and stopwatch run at the same time?",
    answer:
      "No. Only the visible mode can run. Pause the active mode before switching so a countdown alarm or stopwatch cannot continue invisibly.",
  },
  {
    question: "Does switching modes reset my time?",
    answer:
      "No. A paused countdown and a paused stopwatch keep their values independently. Reset affects only the mode you are viewing.",
  },
  {
    question: "Does it work in fullscreen?",
    answer:
      "Yes, when the browser supports the Fullscreen API. Fullscreen shows the active mode, time, essential controls, and a clear exit control.",
  },
  {
    question: "How accurate is browser-based millisecond timing?",
    answer:
      "It is suitable for practical timing, but browser scheduling, display refresh, background throttling, device performance, and input delay can affect millisecond-level readings and alarm timing.",
  },
] as const;

type Mode = "countdown" | "stopwatch";
type Lap = { number: number; totalMs: number; splitMs: number };

const pad2 = (value: number) => String(value).padStart(2, "0");
const pad3 = (value: number) => String(value).padStart(3, "0");

function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function formatStopwatch(ms: number) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock =
    hours > 0
      ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
      : `${minutes}:${pad2(seconds)}`;
  return `${clock}.${pad3(safeMs % 1000)}`;
}

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function isInteractiveTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "BUTTON" ||
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "A" ||
    element.isContentEditable
  );
}

function useCompletionBeep() {
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      contextRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((frequency = 660, duration = 180, gain = 0.08) => {
    try {
      const Context =
        window.AudioContext || (window as any).webkitAudioContext;
      const context = (contextRef.current ??= new Context());
      if (context.state === "suspended") void context.resume();

      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      volume.gain.value = gain;
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        volume.disconnect();
      }, duration);
    } catch {
      // Audio support and autoplay policy vary by browser. Timing stays usable.
    }
  }, []);
}

function TimerStopwatchTool() {
  const [mode, setMode] = useState<Mode>("countdown");

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(5 * 60 * 1000);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [hoursInput, setHoursInput] = useState("0");
  const [minutesInput, setMinutesInput] = useState("5");
  const [secondsInput, setSecondsInput] = useState("0");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const countdownFrameRef = useRef<number | null>(null);
  const countdownTargetRef = useRef<number | null>(null);
  const countdownRunningRef = useRef(false);
  const remainingRef = useRef(remainingMs);
  const durationRef = useRef(durationMs);
  const soundEnabledRef = useRef(soundEnabled);
  const beep = useCompletionBeep();

  const stopwatch = useElapsedStopwatch();
  const [laps, setLaps] = useState<Lap[]>([]);
  const lastLapRef = useRef(0);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(frameRef);

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    durationRef.current = durationMs;
  }, [durationMs]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const stopCountdownFrame = useCallback(() => {
    if (countdownFrameRef.current !== null) {
      cancelAnimationFrame(countdownFrameRef.current);
      countdownFrameRef.current = null;
    }
  }, []);

  const reconcileCountdown = useCallback(() => {
    if (!countdownRunningRef.current || countdownTargetRef.current === null) {
      return remainingRef.current;
    }

    const next = Math.max(0, countdownTargetRef.current - Date.now());
    remainingRef.current = next;
    setRemainingMs(next);
    return next;
  }, []);

  useEffect(() => {
    if (!countdownRunning) {
      stopCountdownFrame();
      return;
    }

    const tick = () => {
      const next = reconcileCountdown();
      if (next <= 0) {
        countdownRunningRef.current = false;
        countdownTargetRef.current = null;
        setCountdownRunning(false);
        setCountdownCompleted(true);
        stopCountdownFrame();
        if (soundEnabledRef.current) {
          beep(660, 180, 0.08);
          window.setTimeout(() => beep(880, 220, 0.08), 220);
        }
        return;
      }

      countdownFrameRef.current = requestAnimationFrame(tick);
    };

    countdownFrameRef.current = requestAnimationFrame(tick);
    return stopCountdownFrame;
  }, [beep, countdownRunning, reconcileCountdown, stopCountdownFrame]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        countdownRunningRef.current
      ) {
        reconcileCountdown();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopCountdownFrame();
    };
  }, [reconcileCountdown, stopCountdownFrame]);

  const syncInputs = useCallback((nextDurationMs: number) => {
    const totalSeconds = Math.floor(Math.max(0, nextDurationMs) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    setHoursInput(String(hours));
    setMinutesInput(String(minutes));
    setSecondsInput(String(seconds));
  }, []);

  const setCountdownDuration = useCallback(
    (nextDurationMs: number) => {
      if (countdownRunningRef.current) return;
      const safeDuration = Math.max(0, Math.floor(nextDurationMs));
      durationRef.current = safeDuration;
      remainingRef.current = safeDuration;
      setDurationMs(safeDuration);
      setRemainingMs(safeDuration);
      setCountdownCompleted(false);
      countdownTargetRef.current = null;
      syncInputs(safeDuration);
    },
    [syncInputs],
  );

  function applyDurationInputs() {
    const hours = clampInteger(Number(hoursInput || 0), 0, 99);
    const minutes = clampInteger(Number(minutesInput || 0), 0, 59);
    const seconds = clampInteger(Number(secondsInput || 0), 0, 59);
    setCountdownDuration((hours * 3600 + minutes * 60 + seconds) * 1000);
  }

  function toggleCountdown() {
    if (countdownRunningRef.current) {
      reconcileCountdown();
      countdownRunningRef.current = false;
      countdownTargetRef.current = null;
      setCountdownRunning(false);
      return;
    }

    if (remainingRef.current <= 0) return;
    countdownTargetRef.current = Date.now() + remainingRef.current;
    countdownRunningRef.current = true;
    setCountdownCompleted(false);
    setCountdownRunning(true);
    if (soundEnabledRef.current) beep(440, 1, 0);
  }

  function resetCountdown() {
    countdownRunningRef.current = false;
    countdownTargetRef.current = null;
    stopCountdownFrame();
    remainingRef.current = durationRef.current;
    setCountdownRunning(false);
    setCountdownCompleted(false);
    setRemainingMs(durationRef.current);
  }

  function recordLap() {
    const totalMs = stopwatch.readElapsed();
    const splitMs = totalMs - lastLapRef.current;
    if (totalMs <= 0 || splitMs <= 0) return;
    lastLapRef.current = totalMs;
    setLaps((current) => [
      ...current,
      { number: current.length + 1, totalMs, splitMs },
    ]);
  }

  function resetStopwatch() {
    stopwatch.reset();
    lastLapRef.current = 0;
    setLaps([]);
  }

  const activeRunning =
    mode === "countdown" ? countdownRunning : stopwatch.running;
  const shownTime =
    mode === "countdown"
      ? formatCountdown(remainingMs)
      : formatStopwatch(stopwatch.elapsedMs);
  const activeStatus =
    mode === "countdown"
      ? countdownCompleted
        ? "Completed"
        : countdownRunning
          ? "Running"
          : remainingMs < durationMs
            ? "Paused"
            : "Ready"
      : stopwatch.running
        ? "Running"
        : stopwatch.elapsedMs > 0
          ? "Paused"
          : "Ready";

  const startLabel =
    mode === "countdown"
      ? countdownRunning
        ? "Pause"
        : countdownCompleted
          ? "Completed"
          : remainingMs < durationMs
            ? "Resume"
            : "Start"
      : stopwatch.running
        ? "Pause"
        : stopwatch.elapsedMs > 0
          ? "Resume"
          : "Start";

  const startDisabled =
    mode === "countdown" &&
    !countdownRunning &&
    (countdownCompleted || remainingMs <= 0);

  function toggleActiveMode() {
    if (mode === "countdown") toggleCountdown();
    else stopwatch.toggle();
  }

  function resetActiveMode() {
    if (mode === "countdown") resetCountdown();
    else resetStopwatch();
  }

  function changeMode(nextMode: Mode) {
    if (activeRunning || nextMode === mode) return;
    setMode(nextMode);
  }

  const displayFontSize = useFitDisplayText({
    containerRef: displayRef,
    textRef: timeRef,
    deps: [shownTime, mode, activeStatus, fullscreen.isFullscreen],
    minPx: 48,
    maxPx: fullscreen.isFullscreen ? 520 : 460,
    paddingAllowancePx: fullscreen.isFullscreen ? 56 : 64,
    initialMobileScale: 0.88,
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget && isInteractiveTarget(event.target)) {
      return;
    }
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      if (!startDisabled) toggleActiveMode();
    } else if (key === "r") {
      resetActiveMode();
    } else if (key === "l" && mode === "stopwatch") {
      recordLap();
    } else if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "escape" && fullscreen.isFullscreen) {
      void fullscreen.exit();
    }
  };

  const fullscreenActions = (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={toggleActiveMode}
        disabled={startDisabled}
      >
        {startLabel}
      </Button>
      {mode === "stopwatch" ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={recordLap}
          disabled={stopwatch.elapsedMs <= 0}
        >
          Lap
        </Button>
      ) : null}
      <Button variant="secondary" size="sm" onClick={resetActiveMode}>
        Reset
      </Button>
    </div>
  );

  return (
    <ToolFrame
      frameRef={frameRef}
      isFullscreen={fullscreen.isFullscreen}
      onKeyDown={onKeyDown}
      data-tool="timer-stopwatch"
      data-mode={mode}
    >
      <FullscreenTopBar
        show={fullscreen.isFullscreen}
        title={mode === "countdown" ? "Timer" : "Stopwatch"}
        right={fullscreenActions}
        onExit={() => void fullscreen.exit()}
      />

      <div
        className={
          fullscreen.isFullscreen
            ? "flex h-full flex-col"
            : "timer-history-stack flex h-full flex-col"
        }
      >
        {!fullscreen.isFullscreen ? (
          <div className="order-1 mx-auto mt-3 w-full max-w-xl text-center">
            <div
              role="group"
              aria-label="Timing mode"
              aria-describedby="timer-stopwatch-mode-help"
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <Button
                variant={mode === "countdown" ? "primary" : "secondary"}
                size="sm"
                aria-pressed={mode === "countdown"}
                disabled={activeRunning}
                onClick={() => changeMode("countdown")}
              >
                Countdown Timer
              </Button>
              <Button
                variant={mode === "stopwatch" ? "primary" : "secondary"}
                size="sm"
                aria-pressed={mode === "stopwatch"}
                disabled={activeRunning}
                onClick={() => changeMode("stopwatch")}
              >
                Stopwatch
              </Button>
            </div>
            <p
              id="timer-stopwatch-mode-help"
              className="ilt-helper-text mt-2"
              aria-live="polite"
            >
              {activeRunning
                ? "Pause the active mode before switching."
                : "Paused values are kept when you switch modes."}
            </p>
          </div>
        ) : null}

        <DisplayStage
          stageRef={displayRef}
          isFullscreen={fullscreen.isFullscreen}
          className="order-2 mt-3 flex flex-col p-3 sm:p-6"
          style={{
            minHeight: fullscreen.isFullscreen
              ? 0
              : "clamp(300px, 38vw, 430px)",
            marginTop: fullscreen.isFullscreen ? "3.6rem" : undefined,
            marginBottom: fullscreen.isFullscreen ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: fullscreen.isFullscreen ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (fullscreen.isFullscreen && !startDisabled) toggleActiveMode();
          }}
          role={fullscreen.isFullscreen ? "button" : undefined}
          tabIndex={fullscreen.isFullscreen ? 0 : undefined}
          onKeyDown={(event) => {
            if (
              fullscreen.isFullscreen &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              event.stopPropagation();
              if (!startDisabled) toggleActiveMode();
            }
          }}
          aria-label={
            fullscreen.isFullscreen
              ? `${mode === "countdown" ? "Countdown timer" : "Stopwatch"}: ${shownTime}. ${startLabel}.`
              : undefined
          }
        >
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-muted)]">
            {mode === "countdown" ? "Countdown Timer" : "Stopwatch"} /{" "}
            {activeStatus}
          </div>
          <span
            ref={timeRef}
            data-primary-display-value
            className="mt-4 inline-block whitespace-nowrap font-mono font-extrabold tracking-wider text-[var(--ilt-text-primary)]"
            style={{ fontSize: displayFontSize, lineHeight: 1 }}
          >
            {shownTime}
          </span>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {mode === "countdown"
              ? countdownCompleted
                ? "Reset or choose a duration to run another countdown."
                : soundEnabled
                  ? "Completion sound on"
                  : "Completion sound off"
              : `${laps.length} ${laps.length === 1 ? "lap" : "laps"} recorded`}
          </div>
        </DisplayStage>

        {!fullscreen.isFullscreen ? (
          <div className="order-3 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Button
                variant="primary"
                onClick={toggleActiveMode}
                disabled={startDisabled}
              >
                {startLabel}
              </Button>
              {mode === "stopwatch" ? (
                <Button
                  variant="secondary"
                  onClick={recordLap}
                  disabled={stopwatch.elapsedMs <= 0}
                >
                  Lap
                </Button>
              ) : null}
              <Button variant="secondary" onClick={resetActiveMode}>
                Reset
              </Button>
            </ControlGroup>

            {mode === "countdown" ? (
              <>
                <SettingGroup
                  title="Set countdown"
                  description="Enter hours, minutes, and seconds while the countdown is idle or paused. Applying a new duration replaces the paused countdown value."
                >
                  <SettingRow className="sm:grid-cols-[repeat(3,minmax(0,8rem))_auto] sm:justify-center">
                    <Field
                      label="Hours"
                      value={hoursInput}
                      inputMode="numeric"
                      disabled={countdownRunning}
                      onChange={(event) => setHoursInput(event.currentTarget.value)}
                      onBlur={applyDurationInputs}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                    <Field
                      label="Minutes"
                      hint="0-59"
                      value={minutesInput}
                      inputMode="numeric"
                      disabled={countdownRunning}
                      onChange={(event) => setMinutesInput(event.currentTarget.value)}
                      onBlur={applyDurationInputs}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                    <Field
                      label="Seconds"
                      hint="0-59"
                      value={secondsInput}
                      inputMode="numeric"
                      disabled={countdownRunning}
                      onChange={(event) => setSecondsInput(event.currentTarget.value)}
                      onBlur={applyDurationInputs}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                    <div className="flex items-end justify-center">
                      <Button
                        variant="secondary"
                        onClick={applyDurationInputs}
                        disabled={countdownRunning}
                      >
                        Apply
                      </Button>
                    </div>
                  </SettingRow>
                  <div className="flex justify-center">
                    <Toggle
                      label="Completion sound"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>
                </SettingGroup>

                <PresetGroup title="Countdown presets">
                  {[
                    { label: "10 seconds", ms: 10_000 },
                    { label: "1 minute", ms: 60_000 },
                    { label: "5 minutes", ms: 5 * 60_000 },
                    { label: "10 minutes", ms: 10 * 60_000 },
                    { label: "25 minutes", ms: 25 * 60_000 },
                  ].map((preset) => (
                    <PresetChip
                      key={preset.ms}
                      selected={durationMs === preset.ms}
                      disabled={countdownRunning}
                      onClick={() => setCountdownDuration(preset.ms)}
                    >
                      {preset.label}
                    </PresetChip>
                  ))}
                </PresetGroup>
              </>
            ) : (
              <div className="timer-history-panel space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-bold text-[var(--ilt-text-primary)]">
                    Laps and splits
                  </h2>
                  <p className="ilt-helper-text">
                    Chronological order / split is time since the previous lap
                  </p>
                </div>
                {laps.length === 0 ? (
                  <p className="text-sm text-[var(--ilt-text-secondary)]">
                    Start the stopwatch, then press Lap to record a split.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {laps.map((lap) => (
                      <UtilityResultRow key={lap.number}>
                        <span className="font-semibold">Lap {lap.number}</span>
                        <span className="flex flex-wrap gap-3 text-sm">
                          <strong>Total {formatStopwatch(lap.totalMs)}</strong>
                          <span>Split {formatStopwatch(lap.splitMs)}</span>
                        </span>
                      </UtilityResultRow>
                    ))}
                  </div>
                )}
              </div>
            )}

            <SecondaryActionRow>
              <Button
                variant="secondary"
                onClick={() => void fullscreen.toggle()}
              >
                Fullscreen
              </Button>
            </SecondaryActionRow>
            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / L lap in stopwatch mode
              / F fullscreen
            </ShortcutHint>
          </div>
        ) : null}

        <FullscreenBottomBar show={fullscreen.isFullscreen}>
          <p className="ilt-helper-text text-center">
            {mode === "countdown"
              ? "Countdown mode / Space start or pause / R reset / F fullscreen"
              : "Stopwatch mode / Space start or pause / L lap / R reset / F fullscreen"}
          </p>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

export function meta({}: Route.MetaArgs) {
  const title =
    "Timer and Stopwatch Online | Countdown, Laps and Fullscreen";
  const description =
    "Use a countdown timer and stopwatch on one page. Start, pause, reset, record laps, and switch between timing modes with a clear fullscreen display.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: ROUTE_URL },
    { property: "og:image", content: `${SITE_URL}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { tagName: "link", rel: "canonical", href: ROUTE_URL },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export default function TimerStopwatchPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Timer and Stopwatch",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        dateModified: `${REVIEW_DATE.iso}T00:00:00Z`,
        description:
          "A browser-based countdown timer and stopwatch with safe mode switching, laps, completion sound, and fullscreen controls.",
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
            name: "Timer and Stopwatch",
            item: ROUTE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
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
        display={<TimerStopwatchTool />}
        title="Timer and Stopwatch"
        description="Switch between a countdown timer and a stopwatch with laps, clear controls, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How the timer and stopwatch work together">
          <p>
            Choose Countdown Timer when you have a fixed duration or Stopwatch
            when you want to measure open-ended elapsed time. Only the visible
            mode can run. Pause before switching, and each paused value stays
            available when you return to that mode.
          </p>
        </ContentSection>

        <ContentSection title="When to use the countdown timer">
          <p>
            The countdown is useful for a study block, presentation, workout
            interval, cooking step, or scheduled break. Set hours, minutes, and
            seconds or choose a preset, then start the timer toward zero.
          </p>
        </ContentSection>

        <ContentSection title="When to use the stopwatch">
          <p>
            Use the stopwatch for an open-ended activity, laps or splits,
            practice sessions, meeting duration, or informal performance
            timing. Each lap records both total elapsed time and the split since
            the previous lap.
          </p>
        </ContentSection>

        <ContentSection title="Timer vs stopwatch">
          <p>
            A timer counts down from a chosen duration toward zero. A stopwatch
            counts up from zero until you pause it. This combined page is useful
            when a session may need both approaches without opening another
            tab.
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            This combined tool is intended for practical browser-based timing.
            Browser scheduling, device performance, display refresh, background
            throttling, and user input delay can affect millisecond-level
            readings and alarm timing. It is not certified timing equipment.
          </p>
        </ToolTrustNote>

        <ContentSection title="Timer and stopwatch FAQ">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

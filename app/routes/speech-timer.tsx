// app/routes/speech-timer.tsx
import type { Route } from "./+types/speech-timer";
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

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/speech-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const PRESETS = [3, 5, 7, 10, 15];

type SpeechStatus = "on-track" | "warning" | "final" | "over-time";

export function meta({}: Route.MetaArgs) {
  const title = "Speech Timer (Speaking Timer with Warning Thresholds)";
  const description =
    "Practice or deliver a speech with a large countdown, start and pause controls, presets, fullscreen mode, and green/yellow/red warning thresholds.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "speech timer",
        "speaking timer",
        "talk timer",
        "presentation speech timer",
        "speaker timer",
        "rehearsal timer",
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
    { tagName: "link", rel: "canonical", href: ROUTE_URL },
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatSpeechTime(ms: number) {
  const sign = ms < 0 ? "+" : "";
  const totalSeconds = Math.ceil(Math.abs(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${sign}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

function statusForRemaining(
  remainingMs: number,
  warningMs: number,
  finalMs: number,
): SpeechStatus {
  if (remainingMs <= 0) return "over-time";
  if (remainingMs <= finalMs) return "final";
  if (remainingMs <= warningMs) return "warning";
  return "on-track";
}

const statusCopy: Record<SpeechStatus, { label: string; detail: string; color: string }> = {
  "on-track": {
    label: "On track",
    detail: "Green zone",
    color: "#16a34a",
  },
  warning: {
    label: "Warning",
    detail: "Yellow zone",
    color: "#d97706",
  },
  final: {
    label: "Final",
    detail: "Red zone",
    color: "#dc2626",
  },
  "over-time": {
    label: "Over time",
    detail: "Past target",
    color: "#991b1b",
  },
};

function SpeechTimerTool() {
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [warningMinutes, setWarningMinutes] = useState(2);
  const [finalMinutes, setFinalMinutes] = useState(0.5);
  const [remainingMs, setRemainingMs] = useState(5 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const endRef = useRef<number | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const durationMs = Math.round(durationMinutes * 60 * 1000);
  const warningMs = Math.round(clamp(warningMinutes, 0, durationMinutes) * 60 * 1000);
  const finalMs = Math.round(clamp(finalMinutes, 0, warningMinutes) * 60 * 1000);
  const status = statusForRemaining(remainingMs, warningMs, finalMs);
  const shownTime = formatSpeechTime(remainingMs);
  const statusInfo = statusCopy[status];
  const progress = useMemo(() => {
    if (durationMs <= 0) return 0;
    return clamp((durationMs - Math.max(0, remainingMs)) / durationMs, 0, 1);
  }, [durationMs, remainingMs]);

  useEffect(() => {
    if (running) return;
    setRemainingMs((current) => {
      if (current <= 0 || current > durationMs) return durationMs;
      return current;
    });
  }, [durationMs, running]);

  useEffect(() => {
    if (!running) return;

    endRef.current = Date.now() + remainingMs;
    let frame = 0;

    const tick = () => {
      if (endRef.current == null) return;
      setRemainingMs(endRef.current - Date.now());
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, status],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
    initialScale: isFs ? 1 : 1.03,
    initialMobileScale: isFs ? 1 : 0.91,
  });

  function applyDuration(minutes: number) {
    const next = clamp(minutes, 1, 180);
    setDurationMinutes(next);
    setWarningMinutes((value) => clamp(value, 0, next));
    setFinalMinutes((value) => clamp(value, 0, Math.min(value, next)));
    if (!running) setRemainingMs(Math.round(next * 60 * 1000));
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }

    if (remainingMs <= 0) {
      setRemainingMs(durationMs);
    }
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    setRemainingMs(durationMs);
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "r") {
      reset();
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
        title="Speech Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 340,
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
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
            {statusInfo.label}
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
              className="h-full"
              style={{
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: statusInfo.color,
              }}
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {statusInfo.detail} / {durationMinutes} minute speech target
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Speech length"
              description="Choose a common speaking time or enter a custom duration below."
            >
              {PRESETS.map((minutes) => (
                <Chip
                  key={minutes}
                  active={durationMinutes === minutes}
                  disabled={running}
                  onClick={() => applyDuration(minutes)}
                >
                  {minutes}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Warning thresholds"
              description="Set the remaining-time points where the display moves into warning and final zones."
            >
              <SettingRow className="lg:grid-cols-3">
                <Field
                  label="Total minutes"
                  type="number"
                  min={1}
                  max={180}
                  step={0.5}
                  value={durationMinutes}
                  disabled={running}
                  onChange={(event) => applyDuration(Number(event.currentTarget.value || 1))}
                />
                <Field
                  label="Warning when minutes remain"
                  type="number"
                  min={0}
                  max={durationMinutes}
                  step={0.25}
                  value={warningMinutes}
                  onChange={(event) =>
                    setWarningMinutes(
                      clamp(Number(event.currentTarget.value || 0), 0, durationMinutes),
                    )
                  }
                  hint="Yellow zone."
                />
                <Field
                  label="Final when minutes remain"
                  type="number"
                  min={0}
                  max={warningMinutes}
                  step={0.25}
                  value={finalMinutes}
                  onChange={(event) =>
                    setFinalMinutes(
                      clamp(Number(event.currentTarget.value || 0), 0, warningMinutes),
                    )
                  }
                  hint="Red zone."
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap timer to start or pause / Space start-pause / R reset
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function SpeechTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Speech Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based speaking timer with presets, countdown controls, fullscreen mode, and warning thresholds.",
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
            name: "Speech Timer",
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
        display={<SpeechTimerTool />}
        title="Speech Timer"
        description="Run a visible speaking countdown with common presets, fullscreen mode, and green, yellow, and red warning thresholds."
      />

      <SeoBand>
        <ContentSection title="How this speech timer works">
          <p>
            This speech timer is a countdown for talks and speaking practice.
            Choose the total length, set warning thresholds, press Start, and
            watch the display move from the on-track zone into warning, final,
            and over-time states.
          </p>
          <p>
            The color zones are simple visual cues. They do not enforce event
            rules or judging criteria, but they make it easier to see when a
            talk is approaching the end of its planned time.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use it for speeches, class presentations, demos, pitches,
            interviews, workshops, lectures, rehearsal runs, and any situation
            where the speaker needs a visible countdown.
          </p>
          <p>
            Fullscreen mode is useful on a podium laptop, rehearsal monitor,
            shared screen, or second display. Active fullscreen views do not
            include ad placements.
          </p>
        </ContentSection>

        <ContentSection title="Speech timer vs presentation timer">
          <p>
            The speech timer focuses on speaker warning thresholds: green for
            on track, yellow for warning, red for final time, and over-time
            after the target length. The{" "}
            <a className="ilt-content-link" href="/presentation-timer">
              presentation timer
            </a>{" "}
            is broader for general talk, session, and room countdown use.
          </p>
          <p>
            For meeting segments, use the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>
            . For a simple projected countdown, use the{" "}
            <a className="ilt-content-link" href="/online-timer">
              fullscreen timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Timing limitations">
          <p>
            This is a browser timer. Device sleep, background tab throttling,
            browser performance, and audio permission behavior can affect what
            you see or hear. Keep the page visible during formal timing and
            follow the rules of the event or room you are in.
          </p>
        </ContentSection>

        <ContentSection title="Speech timer FAQ">
          <h3>Can I change the warning thresholds?</h3>
          <p>
            Yes. Set the remaining-time point for the yellow warning zone and
            the red final zone. The thresholds are based on minutes remaining.
          </p>
          <h3>Does this timer use sound?</h3>
          <p>
            This first version focuses on a visible countdown and threshold
            states. Use it where a visual timing cue is enough.
          </p>
          <h3>Can I time a rehearsal?</h3>
          <p>
            Yes. Pick the planned speech length, run through your material, and
            use the over-time state to see when the target length has passed.
            For a simple elapsed-time check, try the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            .
          </p>
          <h3>Can I count down to an event date?</h3>
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>{" "}
            for date-based launches, classes, streams, or deadlines.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

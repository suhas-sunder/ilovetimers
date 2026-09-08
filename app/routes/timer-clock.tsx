import type { Route } from "./+types/timer-clock";
import { data as json } from "react-router";
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
} from "~/clients/components/ui/foundation";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_URL = `${SITE_URL}/timer-clock`;
const REVIEW_DATE = {
  iso: "2026-07-15",
  label: "July 15, 2026",
} as const;

const FAQ_ITEMS = [
  {
    question: "Does the clock use my device time?",
    answer:
      "Yes. The local-time display is formatted from the current time reported by your device and browser. It does not connect to an external time source.",
  },
  {
    question: "Will the countdown continue in a background tab?",
    answer:
      "The browser may reduce screen updates in a background tab. The countdown reconciles against its target finish time when it can run again, but device sleep and browser behavior can affect completion cues.",
  },
  {
    question: "Can I use the clock and timer in fullscreen?",
    answer:
      "Yes. Fullscreen keeps the local time, countdown, current state, and essential timer controls visible while hiding configuration and supporting content.",
  },
  {
    question: "Does the timer clock work without an account?",
    answer:
      "Yes. The clock and countdown run directly in the browser without an account or cloud storage.",
  },
] as const;

type TimerStatus = "ready" | "running" | "paused" | "completed";

const pad2 = (value: number) => String(value).padStart(2, "0");

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function formatLocalTime(date: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(date)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    const hours = date.getHours();
    const minutes = pad2(date.getMinutes());
    const seconds = pad2(date.getSeconds());
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${minutes}:${seconds} ${suffix}`;
  }
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

function useCompletionBeep() {
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      contextRef.current?.close().catch(() => {});
    },
    [],
  );

  return useCallback(() => {
    try {
      const Context = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Context) return;
      const context = (contextRef.current ??= new Context());
      if (context.state === "suspended") void context.resume();

      const play = (frequency: number, delayMs: number) => {
        window.setTimeout(() => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.frequency.value = frequency;
          gain.gain.value = 0.07;
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.16);
        }, delayMs);
      };

      play(660, 0);
      play(880, 220);
    } catch {
      // Audio is optional and may be blocked by browser policy.
    }
  }, []);
}

function TimerClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = useState(5 * 60 * 1000);
  const [status, setStatus] = useState<TimerStatus>("ready");
  const [hoursInput, setHoursInput] = useState("0");
  const [minutesInput, setMinutesInput] = useState("5");
  const [secondsInput, setSecondsInput] = useState("0");
  const [sound, setSound] = useState(true);
  const endAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const countdownRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const beep = useCompletionBeep();

  useEffect(() => {
    let timeout: number | null = null;
    let cancelled = false;

    const updateClock = () => {
      if (cancelled) return;
      const next = new Date();
      setNow(next);
      timeout = window.setTimeout(
        updateClock,
        Math.max(50, 1000 - next.getMilliseconds()),
      );
    };

    const initialDelay = Math.max(50, 1000 - now.getMilliseconds());
    timeout = window.setTimeout(updateClock, initialDelay);
    return () => {
      cancelled = true;
      if (timeout != null) window.clearTimeout(timeout);
    };
    // The loader-seeded first render should schedule from its own millisecond boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (status !== "running" || endAtRef.current == null) return;

    let cancelled = false;
    const tick = () => {
      if (cancelled || endAtRef.current == null) return;
      const remaining = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(remaining);

      if (remaining <= 0) {
        endAtRef.current = null;
        setStatus("completed");
        if (sound) beep();
        return;
      }

      timeoutRef.current = window.setTimeout(tick, 200);
    };

    tick();
    return () => {
      cancelled = true;
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [beep, sound, status]);

  function setDuration(nextMs: number) {
    const safeMs = Math.max(1000, Math.floor(nextMs));
    const totalSeconds = Math.floor(safeMs / 1000);
    setDurationMs(safeMs);
    setRemainingMs(safeMs);
    setHoursInput(String(Math.floor(totalSeconds / 3600)));
    setMinutesInput(String(Math.floor((totalSeconds % 3600) / 60)));
    setSecondsInput(String(totalSeconds % 60));
    setStatus("ready");
    endAtRef.current = null;
  }

  function applyInputs() {
    const hours = Math.min(99, Math.max(0, Number(hoursInput) || 0));
    const minutes = Math.min(59, Math.max(0, Number(minutesInput) || 0));
    const seconds = Math.min(59, Math.max(0, Number(secondsInput) || 0));
    setDuration((hours * 3600 + minutes * 60 + seconds) * 1000);
  }

  function startPause() {
    if (status === "running") {
      const pausedAt = Math.max(0, (endAtRef.current ?? Date.now()) - Date.now());
      endAtRef.current = null;
      setRemainingMs(pausedAt);
      setStatus(pausedAt > 0 ? "paused" : "completed");
      return;
    }

    const nextRemaining = status === "completed" || remainingMs <= 0
      ? durationMs
      : remainingMs;
    setRemainingMs(nextRemaining);
    endAtRef.current = Date.now() + nextRemaining;
    setStatus("running");
  }

  function reset() {
    endAtRef.current = null;
    setRemainingMs(durationMs);
    setStatus("ready");
  }

  const shownCountdown = formatCountdown(remainingMs);
  const shownLocalTime = formatLocalTime(now);
  const statusLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "completed"
          ? "Completed"
          : "Ready";
  const startLabel =
    status === "running"
      ? "Pause"
      : status === "paused"
        ? "Resume"
        : status === "completed"
          ? "Restart"
          : "Start";

  const countdownFontSize = useFitDisplayText({
    containerRef: displayRef,
    textRef: countdownRef,
    deps: [shownCountdown, shownLocalTime, statusLabel, fullscreen.isFullscreen],
    minPx: 44,
    maxPx: fullscreen.isFullscreen ? 380 : 190,
    paddingAllowancePx: fullscreen.isFullscreen ? 64 : 72,
    initialMobileScale: 0.86,
  });

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
    } else if (key === "escape" && fullscreen.isFullscreen) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={frameRef}
      isFullscreen={fullscreen.isFullscreen}
      onKeyDown={onKeyDown}
      data-tool="timer-clock"
    >
      <FullscreenTopBar
        show={fullscreen.isFullscreen}
        title="Clock and Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="primary" size="sm" onClick={startPause}>
              {startLabel}
            </Button>
            <Button variant="secondary" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        }
      />

      <div
        className={
          fullscreen.isFullscreen
            ? "flex h-full flex-col"
            : "timer-countdown-stack flex h-full flex-col"
        }
      >
        <DisplayStage
          stageRef={displayRef}
          isFullscreen={fullscreen.isFullscreen}
          className="order-1 mt-4 flex flex-col p-4 sm:p-6"
          style={{
            minHeight: fullscreen.isFullscreen
              ? 0
              : "clamp(340px, 42vw, 500px)",
            marginTop: fullscreen.isFullscreen ? "3.6rem" : undefined,
            marginBottom: fullscreen.isFullscreen ? "3.6rem" : undefined,
            overflow: "hidden",
          }}
          aria-live="polite"
        >
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-muted)]">
            Local time
          </div>
          <div className="mt-2 whitespace-nowrap font-mono text-[clamp(1.75rem,6vw,4.5rem)] font-bold text-[var(--ilt-text-secondary)]">
            {shownLocalTime}
          </div>

          <div className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-muted)] sm:mt-9">
            Countdown / {statusLabel}
          </div>
          <span
            ref={countdownRef}
            data-primary-display-value
            className="mt-2 inline-block whitespace-nowrap font-mono font-extrabold tracking-wider text-[var(--ilt-text-primary)]"
            style={{ fontSize: countdownFontSize, lineHeight: 1 }}
          >
            {shownCountdown}
          </span>
        </DisplayStage>

        {!fullscreen.isFullscreen ? (
          <div className="order-2 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Button variant="primary" onClick={startPause}>
                {startLabel}
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
            </ControlGroup>

            <PresetGroup
              title="Countdown presets"
              description="Choose a common duration or set hours, minutes, and seconds."
            >
              {[1, 5, 10, 15, 30].map((minutes) => (
                <PresetChip
                  key={minutes}
                  active={durationMs === minutes * 60 * 1000}
                  disabled={status === "running"}
                  onClick={() => setDuration(minutes * 60 * 1000)}
                >
                  {minutes}m
                </PresetChip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Set countdown"
              description="Pause before changing the selected duration."
            >
              <SettingRow className="mx-auto max-w-4xl sm:grid-cols-[repeat(3,minmax(0,9rem))_auto] sm:justify-center">
                <Field
                  label="Hours"
                  type="number"
                  min={0}
                  max={99}
                  value={hoursInput}
                  disabled={status === "running"}
                  onChange={(event) => setHoursInput(event.target.value)}
                  onBlur={applyInputs}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                />
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={59}
                  value={minutesInput}
                  disabled={status === "running"}
                  onChange={(event) => setMinutesInput(event.target.value)}
                  onBlur={applyInputs}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                />
                <Field
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={secondsInput}
                  disabled={status === "running"}
                  onChange={(event) => setSecondsInput(event.target.value)}
                  onBlur={applyInputs}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                />
                <div className="flex items-end justify-center sm:justify-start">
                  <Button
                    variant="secondary"
                    disabled={status === "running"}
                    onClick={applyInputs}
                  >
                    Apply
                  </Button>
                </div>
              </SettingRow>
              <SettingRow className="flex justify-center">
                <Toggle
                  label="Completion sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Button
                variant="secondary"
                onClick={() => void fullscreen.toggle()}
              >
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen
            </ShortcutHint>
          </div>
        ) : null}

        <FullscreenBottomBar show={fullscreen.isFullscreen}>
          <p className="ilt-helper-text text-center">
            Local time {shownLocalTime} / Countdown {statusLabel} / Space
            start or pause / R reset
          </p>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

export function meta({}: Route.MetaArgs) {
  const title = "Clock and Timer Online | Current Time with Countdown";
  const description =
    "View the current local time and run a countdown timer on one screen. Use clear controls and fullscreen mode for classrooms, meetings, exams, presentations, and workouts.";

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

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

export default function TimerClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Clock and Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        dateModified: `${REVIEW_DATE.iso}T00:00:00Z`,
        description:
          "A browser-based utility that displays current local device time beside an independently controlled countdown timer.",
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
            name: "Clock and Timer",
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
        display={<TimerClockTool initialNowISO={nowISO} />}
        title="Clock and Timer"
        description="See the current local time while running a countdown on the same clear, fullscreen-friendly display."
      />

      <SeoBand>
        <ContentSection title="How the clock and timer work together">
          <p>
            The local clock continues to show the time reported by your device
            while the countdown is started, paused, resumed, or reset
            independently. The page does not use external time synchronization.
          </p>
        </ContentSection>

        <ContentSection title="Classroom and exam use">
          <p>
            A shared fullscreen view can show the current time and time remaining
            for a lesson, classroom activity, or practice exam. For formal or
            proctored exams, follow the approved timing rules and equipment for
            that setting.
          </p>
        </ContentSection>

        <ContentSection title="Meetings and presentations">
          <p>
            Keep the wall-clock time visible while a separate countdown limits a
            meeting segment, speaker slot, presentation, or scheduled break.
          </p>
        </ContentSection>

        <ContentSection title="Workouts and activities">
          <p>
            Compare the current time with the remaining duration of a workout,
            group activity, practice block, or other shared interval. Fullscreen
            keeps both displays readable from farther away.
          </p>
        </ContentSection>

        <ContentSection title="Clock vs timer">
          <p>
            A clock shows the current time. A timer counts down from a selected
            duration toward zero. This page combines those two views without
            turning the countdown into a stopwatch or multiple-timer tool.
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            The current-time display comes from the device&apos;s system clock.
            The countdown uses browser timing and reconciliation, but background
            throttling, device sleep, browser permissions, and system performance
            can affect completion behavior. This is a practical browser tool,
            not a certified time source.
          </p>
        </ToolTrustNote>

        <ContentSection title="Clock and timer FAQ">
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

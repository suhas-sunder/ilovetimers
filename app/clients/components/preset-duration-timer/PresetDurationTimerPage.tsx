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
  ButtonLink,
  ContentSection,
  ControlGroup,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
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
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type RelatedLink = {
  href: string;
  label: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PresetDurationTimerConfig = {
  key: string;
  path: string;
  title: string;
  h1: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: readonly string[];
  seconds: number;
  durationLabel: string;
  defaultDisplay: string;
  displayLabel: string;
  statusLabel: string;
  soundLabel: string;
  fullscreenTitle: string;
  howTitle: string;
  howParagraphs: readonly string[];
  usefulTitle: string;
  usefulParagraph: string;
  useCases: readonly string[];
  settingsParagraphs: readonly string[];
  limitationParagraph: string;
  relatedIntro: string;
  relatedLinks: readonly RelatedLink[];
  presetLinks: readonly RelatedLink[];
  faqItems: readonly FaqItem[];
};

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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

function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((frequency = 880, duration = 150, gain = 0.1) => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.value = gain;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, duration);
    } catch {
      // Browser audio can be blocked until a user gesture or muted by device settings.
    }
  }, []);
}

const oneMinuteFaq = [
  {
    question: "Does the 1 minute timer start automatically?",
    answer:
      "No. The timer opens ready at 1:00, but you choose when to press Start.",
  },
  {
    question: "Is this the same as a stopwatch?",
    answer:
      "No. This page counts down from 60 seconds. A stopwatch counts up to measure elapsed time.",
  },
  {
    question: "Can browser timing be perfectly exact?",
    answer:
      "No. The countdown reconciles with the browser performance clock, but tab state, refresh rate, and device behavior can affect visible updates.",
  },
];

const fiveMinuteFaq = [
  {
    question: "What is the default time on this page?",
    answer:
      "The 5 minute timer opens ready at 5:00 and reset returns it to 5:00.",
  },
  {
    question: "Can I use it for a break?",
    answer:
      "Yes. It is useful for a short break, quick tidy-up, classroom activity, or meeting warning.",
  },
  {
    question: "Will the sound always play?",
    answer:
      "Not always. Browser audio can depend on user interaction, mute state, volume, and whether the tab or device is still active.",
  },
];

const tenMinuteFaq = [
  {
    question: "What happens when I press reset?",
    answer:
      "Reset stops the countdown and returns the display to the 10:00 default for this route.",
  },
  {
    question: "How is this different from the general countdown timer?",
    answer:
      "This page opens directly at 10 minutes for immediate use. The general countdown timer is better when you need any custom minutes and seconds.",
  },
  {
    question: "Can I use this in fullscreen?",
    answer:
      "Yes. The fullscreen view keeps the timer and controls visible and does not include ad placeholders inside the fullscreen target.",
  },
];

const fifteenMinuteFaq = [
  {
    question: "Is 15 minutes fixed on this page?",
    answer:
      "Yes. This page is built as an immediate 15 minute timer. Use the general countdown timer when you need a custom duration.",
  },
  {
    question: "What is a 15 minute timer useful for?",
    answer:
      "It fits medium-short work blocks, classroom station work, review windows, household tasks, and rehearsal segments.",
  },
  {
    question: "Does the timer keep running in the background?",
    answer:
      "The page continues reconciling against the browser clock, but background tabs and sleeping devices can delay visible updates or sound.",
  },
];

const thirtyMinuteFaq = [
  {
    question: "What does this timer open to?",
    answer:
      "It opens ready at 30:00 and reset returns the timer to 30:00.",
  },
  {
    question: "Is this a Pomodoro timer?",
    answer:
      "No. This is one simple 30 minute countdown. The Pomodoro timer runs work and break cycles.",
  },
  {
    question: "Can I rely on it for official timing?",
    answer:
      "No. It is a browser utility for casual timing and depends on the device, tab, audio settings, and display refresh behavior.",
  },
];

export const presetDurationTimerConfigs = {
  oneMinute: {
    key: "one-minute",
    path: "/1-minute-timer",
    title: "1 Minute Timer",
    h1: "1 Minute Timer",
    shortDescription:
      "Start a simple 60-second countdown for short pauses, drills, transitions, and one-minute tasks.",
    metaTitle: "1 Minute Timer Online (60 Second Countdown)",
    metaDescription:
      "Open a 1 minute timer ready at 1:00 with start, pause, reset, optional final sound, fullscreen mode, and practical one-minute timing notes.",
    keywords: [
      "1 minute timer",
      "one minute timer",
      "60 second timer",
      "online 1 minute timer",
      "one minute countdown",
    ],
    seconds: 60,
    durationLabel: "one minute",
    defaultDisplay: "1:00",
    displayLabel: "60-second countdown",
    statusLabel: "1 minute ready",
    soundLabel: "Final beep",
    fullscreenTitle: "1 Minute Timer",
    howTitle: "How this 1 minute timer works",
    howParagraphs: [
      "This page opens with a 60-second countdown already set. Press Start when you are ready, pause if you need to hold the countdown, and reset to return to 1:00.",
      "The timer does not autoplay. It is built for quick one-minute tasks where the correct duration should be ready immediately.",
    ],
    usefulTitle: "When one minute is useful",
    usefulParagraph:
      "A one-minute timer is short enough for a quick pause but long enough to make transitions visible. It works well when you want a clean stop point without setting a custom countdown.",
    useCases: [
      "One-minute pause",
      "Classroom transition",
      "Short speech practice",
      "Quick stretch or checkpoint",
      "Fast game round",
      "One-minute writing or thinking sprint",
    ],
    settingsParagraphs: [
      "The main controls are Start, Pause, Resume, and Reset. The optional sound toggle controls a simple browser beep at the end.",
      "Use fullscreen when the 60-second countdown needs to be visible across a room or on a second screen.",
    ],
    limitationParagraph:
      "The countdown reconciles against the browser performance clock, but display refresh rate, inactive tabs, sleeping devices, and browser audio rules can affect visible updates and sound.",
    relatedIntro:
      "For shorter whole-second presets or custom seconds, use the seconds timer. For elapsed timing instead of a countdown, use the stopwatch.",
    relatedLinks: [
      { href: "/seconds-timer", label: "Seconds Timer" },
      { href: "/5-minute-timer", label: "5 Minute Timer" },
      { href: "/countdown-timer", label: "Countdown Timer" },
      { href: "/stopwatch", label: "Stopwatch" },
      { href: "/speech-timer", label: "Speech Timer" },
    ],
    presetLinks: [
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/seconds-timer", label: "Seconds timer" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: oneMinuteFaq,
  },
  fiveMinute: {
    key: "five-minute",
    path: "/5-minute-timer",
    title: "5 Minute Timer",
    h1: "5 Minute Timer",
    shortDescription:
      "Start a five-minute countdown for short breaks, quick tasks, warmups, and small work blocks.",
    metaTitle: "5 Minute Timer Online (Five Minute Countdown)",
    metaDescription:
      "Open a 5 minute timer ready at 5:00 with start, pause, reset, optional final sound, fullscreen mode, and practical five-minute timing notes.",
    keywords: [
      "5 minute timer",
      "five minute timer",
      "online 5 minute timer",
      "5 minute countdown",
      "timer for 5 minutes",
    ],
    seconds: 300,
    durationLabel: "five minutes",
    defaultDisplay: "5:00",
    displayLabel: "Five-minute countdown",
    statusLabel: "5 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "5 Minute Timer",
    howTitle: "How this 5 minute timer works",
    howParagraphs: [
      "This timer opens ready at 5:00. Start begins the countdown, pause holds the remaining time, resume continues from the paused point, and reset returns to exactly five minutes.",
      "The page is meant for immediate five-minute timing, so it keeps custom setup out of the way and puts the large countdown first.",
    ],
    usefulTitle: "When five minutes is useful",
    usefulParagraph:
      "Five minutes is a good small block for tasks that need more than a moment but should not become a long session.",
    useCases: [
      "Five-minute break",
      "Quick tidy-up",
      "Short cooking check",
      "Classroom activity",
      "Meeting warning",
      "Focus reset",
    ],
    settingsParagraphs: [
      "Use the sound toggle if you want a simple final beep. If the device is muted or the browser blocks audio, the visual countdown still completes.",
      "Fullscreen mode is useful for a group break, class activity, kitchen counter display, or meeting room warning.",
    ],
    limitationParagraph:
      "Browser timers can be affected by tab throttling, sleep mode, display refresh, and audio permissions. Keep the page visible and the device awake when the ending matters.",
    relatedIntro:
      "For a shorter transition timer, use the one-minute page. For flexible break lengths and loops, use the break timer.",
    relatedLinks: [
      { href: "/1-minute-timer", label: "1 Minute Timer" },
      { href: "/10-minute-timer", label: "10 Minute Timer" },
      { href: "/break-timer", label: "Break Timer" },
      { href: "/countdown-timer", label: "Countdown Timer" },
      { href: "/cooking-timer", label: "Cooking Timer" },
    ],
    presetLinks: [
      { href: "/1-minute-timer", label: "1 minute" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: fiveMinuteFaq,
  },
  tenMinute: {
    key: "ten-minute",
    path: "/10-minute-timer",
    title: "10 Minute Timer",
    h1: "10 Minute Timer",
    shortDescription:
      "Start a common ten-minute countdown for work sprints, cooking checks, breaks, or classroom timing.",
    metaTitle: "10 Minute Timer Online (Ten Minute Countdown)",
    metaDescription:
      "Open a 10 minute timer ready at 10:00 with start, pause, reset, optional sound, fullscreen mode, and practical ten-minute timer guidance.",
    keywords: [
      "10 minute timer",
      "ten minute timer",
      "online 10 minute timer",
      "10 minute countdown",
      "timer for 10 minutes",
    ],
    seconds: 600,
    durationLabel: "ten minutes",
    defaultDisplay: "10:00",
    displayLabel: "Ten-minute countdown",
    statusLabel: "10 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "10 Minute Timer",
    howTitle: "How this 10 minute timer works",
    howParagraphs: [
      "This page starts with a 10:00 countdown already selected. Start, pause, resume, and reset keep the flow simple, and reset always returns to ten minutes.",
      "Ten minutes is common enough to deserve a direct page, while the general countdown timer remains available for custom durations.",
    ],
    usefulTitle: "When ten minutes is useful",
    usefulParagraph:
      "A ten-minute timer is long enough for a small work segment or group activity and short enough to keep the end clearly in view.",
    useCases: [
      "Ten-minute work sprint",
      "Quick study block",
      "Cooking reminder",
      "Group activity",
      "Short workout or rest window",
      "Meeting segment",
    ],
    settingsParagraphs: [
      "The optional sound toggle can play a short final beep after the countdown reaches zero. The visual timer remains the primary signal.",
      "Use fullscreen for classroom timing, meeting segments, projected countdowns, or a second-screen timer.",
    ],
    limitationParagraph:
      "This browser timer is designed for everyday use, not official or guaranteed timing. Inactive tabs, low-power states, and audio settings can affect what you see or hear.",
    relatedIntro:
      "For shorter preset timing, try five minutes. For study or meeting workflows, use the dedicated study and meeting timers.",
    relatedLinks: [
      { href: "/5-minute-timer", label: "5 Minute Timer" },
      { href: "/15-minute-timer", label: "15 Minute Timer" },
      { href: "/study-timer", label: "Study Timer" },
      { href: "/meeting-timer", label: "Meeting Timer" },
      { href: "/countdown-timer", label: "Countdown Timer" },
    ],
    presetLinks: [
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/30-minute-timer", label: "30 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: tenMinuteFaq,
  },
  fifteenMinute: {
    key: "fifteen-minute",
    path: "/15-minute-timer",
    title: "15 Minute Timer",
    h1: "15 Minute Timer",
    shortDescription:
      "Start a medium-short countdown for focused work, study, presentations, cleaning, or meeting segments.",
    metaTitle: "15 Minute Timer Online (Fifteen Minute Countdown)",
    metaDescription:
      "Open a 15 minute timer ready at 15:00 with start, pause, reset, optional final sound, fullscreen mode, and practical timing notes.",
    keywords: [
      "15 minute timer",
      "fifteen minute timer",
      "online 15 minute timer",
      "15 minute countdown",
      "timer for 15 minutes",
    ],
    seconds: 900,
    durationLabel: "fifteen minutes",
    defaultDisplay: "15:00",
    displayLabel: "Fifteen-minute countdown",
    statusLabel: "15 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "15 Minute Timer",
    howTitle: "How this 15 minute timer works",
    howParagraphs: [
      "The timer opens at 15:00 and stays focused on that preset duration. Start begins the session, pause and resume preserve the remaining time, and reset returns to 15 minutes.",
      "This route is for people who already know they want a fifteen-minute countdown and do not need to configure a generic timer first.",
    ],
    usefulTitle: "When fifteen minutes is useful",
    usefulParagraph:
      "Fifteen minutes gives enough room for a focused activity or review segment without becoming a long block.",
    useCases: [
      "15-minute focus block",
      "Classroom station work",
      "Presentation rehearsal segment",
      "Study review",
      "Break or rest interval",
      "Household task",
    ],
    settingsParagraphs: [
      "Use Start, Pause, Resume, and Reset for the active countdown. The sound toggle controls a short browser beep at the end.",
      "Fullscreen mode keeps the 15:00 countdown readable for group timing, rehearsal, classroom station work, or a second-screen setup.",
    ],
    limitationParagraph:
      "The timer reconciles with the browser performance clock, but the visible countdown and final beep can still be delayed by tab throttling, sleep mode, refresh rate, or audio permissions.",
    relatedIntro:
      "For a shorter block, use the ten-minute timer. For a longer focus or study window, use the thirty-minute timer or a dedicated focus route.",
    relatedLinks: [
      { href: "/10-minute-timer", label: "10 Minute Timer" },
      { href: "/30-minute-timer", label: "30 Minute Timer" },
      { href: "/focus-session-timer", label: "Focus Session Timer" },
      { href: "/presentation-timer", label: "Presentation Timer" },
      { href: "/countdown-timer", label: "Countdown Timer" },
    ],
    presetLinks: [
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/30-minute-timer", label: "30 minutes" },
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: fifteenMinuteFaq,
  },
  thirtyMinute: {
    key: "thirty-minute",
    path: "/30-minute-timer",
    title: "30 Minute Timer",
    h1: "30 Minute Timer",
    shortDescription:
      "Start a half-hour countdown for study blocks, work sessions, workouts, meetings, cooking, and reminders.",
    metaTitle: "30 Minute Timer Online (Half Hour Countdown)",
    metaDescription:
      "Open a 30 minute timer ready at 30:00 with start, pause, reset, optional final sound, fullscreen mode, and practical half-hour timing notes.",
    keywords: [
      "30 minute timer",
      "thirty minute timer",
      "online 30 minute timer",
      "half hour timer",
      "30 minute countdown",
    ],
    seconds: 1800,
    durationLabel: "thirty minutes",
    defaultDisplay: "30:00",
    displayLabel: "Half-hour countdown",
    statusLabel: "30 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "30 Minute Timer",
    howTitle: "How this 30 minute timer works",
    howParagraphs: [
      "This timer opens ready at 30:00. Press Start to begin the half-hour countdown, pause and resume as needed, and reset to return to exactly thirty minutes.",
      "It is intentionally a direct preset page, not a full custom timer. Use the general countdown timer when you need another duration.",
    ],
    usefulTitle: "When thirty minutes is useful",
    usefulParagraph:
      "Thirty minutes is a clear half-hour block for sessions that need more room than a short warning timer but still have a visible endpoint.",
    useCases: [
      "Half-hour focus session",
      "Study block",
      "Workout timer",
      "Meeting timer",
      "Cooking reminder",
      "Break deadline",
    ],
    settingsParagraphs: [
      "The sound toggle can play a short browser beep when time is up. Start, pause, resume, and reset remain available in both normal and fullscreen views.",
      "Use fullscreen when a half-hour countdown needs to be readable from a couch, desk, classroom, kitchen, or meeting room.",
    ],
    limitationParagraph:
      "This page is an everyday browser timer. Device sleep, background tab throttling, screen refresh, volume, mute state, and browser audio permissions can affect the visible or audible finish.",
    relatedIntro:
      "For a shorter medium block, use the fifteen-minute timer. For cycles or focus-specific workflows, use Pomodoro or focus session timers.",
    relatedLinks: [
      { href: "/15-minute-timer", label: "15 Minute Timer" },
      { href: "/pomodoro-timer", label: "Pomodoro Timer" },
      { href: "/focus-session-timer", label: "Focus Session Timer" },
      { href: "/workout-timer", label: "Workout Timer" },
      { href: "/countdown-timer", label: "Countdown Timer" },
    ],
    presetLinks: [
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: thirtyMinuteFaq,
  },
} as const satisfies Record<string, PresetDurationTimerConfig>;

export function createPresetTimerMeta(config: PresetDurationTimerConfig) {
  const routeUrl = `${SITE_URL}${config.path}`;

  return [
    { title: config.metaTitle },
    { name: "description", content: config.metaDescription },
    { name: "keywords", content: config.keywords.join(", ") },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: config.metaTitle },
    { property: "og:description", content: config.metaDescription },
    { property: "og:type", content: "website" },
    { property: "og:url", content: routeUrl },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: config.metaTitle },
    { name: "twitter:description", content: config.metaDescription },
    { name: "twitter:image", content: OG_IMAGE },
    { tagName: "link", rel: "canonical", href: routeUrl },
    { name: "theme-color", content: "#ffffff" },
  ];
}

function PresetDurationTimerTool({
  config,
}: {
  config: PresetDurationTimerConfig;
}) {
  const defaultMs = config.seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(defaultMs);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const endRef = useRef<number | null>(null);
  const remainingRef = useRef(defaultMs);
  const beep = useBeep();
  const fullscreen = useFullscreen(frameRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    setRunning(false);
    setRemainingMs(defaultMs);
    remainingRef.current = defaultMs;
    endRef.current = null;
  }, [defaultMs]);

  useEffect(() => {
    if (!running) return;
    endRef.current = performance.now() + remainingRef.current;
    let frame = 0;

    const tick = () => {
      const end = endRef.current ?? performance.now();
      const next = Math.max(0, end - performance.now());
      setRemainingMs(next);

      if (next <= 0) {
        setRunning(false);
        endRef.current = null;
        if (sound) {
          beep(880, 150, 0.1);
          window.setTimeout(() => beep(660, 180, 0.1), 190);
        }
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [beep, running, sound]);

  const display = formatClock(remainingMs);
  const status = running
    ? "Running"
    : remainingMs <= 0
      ? "Complete"
      : remainingMs < defaultMs
        ? "Paused"
        : "Ready";
  const progress = useMemo(() => {
    if (defaultMs <= 0) return 0;
    return Math.min(1, Math.max(0, (defaultMs - remainingMs) / defaultMs));
  }, [defaultMs, remainingMs]);

  const fitFontPx = useFitDisplayText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, isFs, status],
    minPx: 58,
    maxPx: isFs ? 540 : 510,
    paddingAllowancePx: isFs ? 72 : 84,
    initialScale: isFs ? 1 : 1.21,
    initialMobileScale: isFs ? 1 : 1.07,
  });

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }

    const seed = remainingRef.current <= 0 ? defaultMs : remainingRef.current;
    if (seed <= 0) return;
    remainingRef.current = seed;
    if (remainingMs <= 0) setRemainingMs(seed);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    remainingRef.current = defaultMs;
    setRemainingMs(defaultMs);
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
    } else if (key === "s") {
      setSound((value) => !value);
    } else if (key === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const primaryButtonLabel =
    running ? "Pause" : remainingMs > 0 && remainingMs < defaultMs ? "Resume" : remainingMs <= 0 ? "Restart" : "Start";

  return (
    <ToolFrame
      frameRef={frameRef}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title={config.fullscreenTitle}
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={startPause}>
              {primaryButtonLabel}
            </Button>
            <Button variant="secondary" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : 360,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
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
            {status} / {config.displayLabel}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {display}
          </span>
          <div className="mt-4 h-2 w-full max-w-3xl bg-[var(--ilt-bg-panel)]">
            <div
              className="h-full bg-[var(--ilt-accent)]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            Reset returns to {config.defaultDisplay}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Button variant="primary" onClick={startPause}>
                {primaryButtonLabel}
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
            </ControlGroup>

            <SettingGroup
              title="Timer settings"
              description={`This route is fixed to ${config.durationLabel}. Browser sound may require interaction and depends on device volume.`}
            >
              <SettingRow className="justify-items-center lg:grid-cols-[auto]">
                <Toggle
                  label={config.soundLabel}
                  checked={sound}
                  onCheckedChange={setSound}
                  className="justify-self-center"
                />
              </SettingRow>
            </SettingGroup>

            <PresetGroup
              title="Related preset timers"
              description="Jump to another direct timer without changing this page's default."
            >
              {config.presetLinks.map((link) => (
                <ButtonLink key={link.href} href={link.href} size="sm">
                  {link.label}
                </ButtonLink>
              ))}
            </PresetGroup>

            <SecondaryActionRow>
              <Button variant="secondary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / S sound / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap display to start or pause / No ads appear in fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

export function PresetDurationTimerPage({
  config,
}: {
  config: PresetDurationTimerConfig;
}) {
  const routeUrl = `${SITE_URL}${config.path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: config.title,
        url: routeUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description: config.metaDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: config.title,
            item: routeUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: config.faqItems.map((item) => ({
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
        display={<PresetDurationTimerTool config={config} />}
        title={config.h1}
        description={config.shortDescription}
      />

      <SeoBand>
        <ContentSection title={config.howTitle}>
          {config.howParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ContentSection>

        <ContentSection title={config.usefulTitle}>
          <p>{config.usefulParagraph}</p>
          <ul className="list-disc space-y-2 pl-5">
            {config.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection title="Settings and display options">
          {config.settingsParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ContentSection>

        <ContentSection title="Accuracy and browser timing limits">
          <p>{config.limitationParagraph}</p>
        </ContentSection>

        <ContentSection title="Related timers">
          <p>{config.relatedIntro}</p>
          <p>
            {config.relatedLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? " / " : null}
                <a className="ilt-content-link" href={link.href}>
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </ContentSection>

        <ContentSection title={`${config.title} FAQ`}>
          {config.faqItems.map((item) => (
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

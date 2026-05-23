import type { Route } from "./+types/kitchen-timer";
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
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/kitchen-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
];

const FAQ_ITEMS = [
  {
    question: "Is this different from the cooking timer?",
    answer:
      "Yes. This page is a direct kitchen timer with common minute presets and custom minutes and seconds. The cooking timer has broader cooking presets and extra kitchen-specific options.",
  },
  {
    question: "Can this timer guarantee perfect cooking results?",
    answer:
      "No. Timing is only one part of cooking. Appliance behavior, food size, starting temperature, altitude, and preference all matter.",
  },
  {
    question: "Can I use the kitchen timer fullscreen?",
    answer:
      "Yes. Fullscreen keeps the countdown large and readable, and no ad placeholders are rendered inside the fullscreen frame.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Kitchen Timer Online (Simple Cooking Countdown)";
  const description =
    "Use a simple online kitchen timer with 1, 3, 5, 10, 15, 20, and 30 minute presets, custom minutes and seconds, sound, and fullscreen.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "kitchen timer",
        "online kitchen timer",
        "cooking timer online",
        "simple kitchen timer",
        "online cooking timer",
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
    { name: "theme-color", content: "#ffffff" },
  ];
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

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

function splitSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.trunc(totalSeconds));
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  };
}

function formatDurationLabel(totalSeconds: number) {
  const parts = splitSeconds(totalSeconds);
  if (parts.minutes === 0) return `${parts.seconds} seconds`;
  if (parts.seconds === 0) {
    return `${parts.minutes} minute${parts.minutes === 1 ? "" : "s"}`;
  }
  return `${parts.minutes} minute${parts.minutes === 1 ? "" : "s"} ${parts.seconds} seconds`;
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

  return useCallback((frequency = 880, duration = 140, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
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
      // Audio can be blocked until user interaction.
    }
  }, []);
}

function KitchenTimerTool() {
  const [totalSeconds, setTotalSeconds] = useState(10 * 60);
  const [minutesInput, setMinutesInput] = useState("10");
  const [secondsInput, setSecondsInput] = useState("0");
  const [remainingMs, setRemainingMs] = useState(10 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const endRef = useRef<number | null>(null);
  const remainingRef = useRef(remainingMs);
  const totalMsRef = useRef(totalSeconds * 1000);
  const beep = useBeep();
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  useEffect(() => {
    totalMsRef.current = totalSeconds * 1000;
  }, [totalSeconds]);

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
          beep(880, 160, 0.11);
          window.setTimeout(() => beep(660, 180, 0.11), 190);
          window.setTimeout(() => beep(880, 180, 0.11), 390);
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
      : remainingMs < totalSeconds * 1000
        ? "Paused"
        : "Ready";
  const progress = useMemo(() => {
    const totalMs = totalSeconds * 1000;
    if (totalMs <= 0) return 0;
    return Math.min(1, Math.max(0, (totalMs - remainingMs) / totalMs));
  }, [remainingMs, totalSeconds]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, isFs, status],
    minPx: 56,
    maxPx: isFs ? 540 : 510,
    paddingAllowancePx: isFs ? 76 : 84,
  });

  function applyDuration(seconds: number) {
    const nextSeconds = clampInt(seconds, 1, 86_400);
    const parts = splitSeconds(nextSeconds);
    setTotalSeconds(nextSeconds);
    setMinutesInput(String(parts.minutes));
    setSecondsInput(String(parts.seconds));
    setRemainingMs(nextSeconds * 1000);
    setRunning(false);
    endRef.current = null;
  }

  function applyCustom() {
    const minutes = clampInt(Number(minutesInput || 0), 0, 1440);
    const seconds = clampInt(Number(secondsInput || 0), 0, 59);
    applyDuration(Math.max(1, minutes * 60 + seconds));
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }
    const seed = remainingMs <= 0 ? totalMsRef.current : remainingMs;
    if (seed <= 0) return;
    remainingRef.current = seed;
    if (remainingMs <= 0) setRemainingMs(seed);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    setRemainingMs(totalSeconds * 1000);
  }

  async function copyRemaining() {
    try {
      await navigator.clipboard.writeText(`${formatClock(remainingMs)} remaining`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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
    } else if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "s") {
      setSound((value) => !value);
    } else if (key === "c") {
      void copyRemaining();
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
        title="Kitchen Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : remainingMs < totalSeconds * 1000 && remainingMs > 0 ? "Resume" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
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
            {status} / Kitchen countdown
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold tracking-widest"
            style={{ fontSize: fitFontPx, lineHeight: "1", transform: "translateZ(0)" }}
          >
            {display}
          </span>
          <div className="mt-4 h-2 w-full max-w-3xl bg-[var(--ilt-bg-panel)]">
            <div className="h-full bg-[var(--ilt-accent)]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            Set duration: {formatDurationLabel(totalSeconds)}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : remainingMs < totalSeconds * 1000 && remainingMs > 0 ? "Resume" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Kitchen presets">
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.label}
                  active={totalSeconds === preset.seconds}
                  disabled={running}
                  onClick={() => applyDuration(preset.seconds)}
                >
                  {preset.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Timer settings"
              description="Set custom minutes and seconds for boiling, baking checks, simmering, steeping, or prep tasks. Sound uses browser audio and device volume."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10rem,auto)]">
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={1440}
                  value={minutesInput}
                  disabled={running}
                  onChange={(event) => setMinutesInput(event.currentTarget.value)}
                />
                <Field
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={secondsInput}
                  disabled={running}
                  onChange={(event) => setSecondsInput(event.currentTarget.value)}
                />
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={applyCustom} disabled={running}>
                Apply duration
              </Btn>
              <Btn kind="ghost" onClick={() => void copyRemaining()}>
                {copied ? "Copied" : "Copy remaining"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / C copy / S sound / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ControlGroup className="mx-0 justify-start">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : remainingMs < totalSeconds * 1000 && remainingMs > 0 ? "Resume" : "Start"}
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

export default function KitchenTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Kitchen Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based kitchen timer with common cooking presets, custom minutes and seconds, sound toggle, copy, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Kitchen Timer", item: ROUTE_URL },
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
        display={<KitchenTimerTool />}
        title="Kitchen Timer"
        description="Start a simple cooking countdown with common kitchen presets, custom minutes and seconds, sound, copy, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this kitchen timer works">
          <p>
            This kitchen timer gives you fast cooking presets for common checks
            and short tasks, plus custom minutes and seconds for anything else.
            Pick a duration, start the countdown, and keep the display large
            enough to see from across the kitchen.
          </p>
          <p>
            The timer is useful for boiling, baking checks, simmering, meal
            prep, oven reminders, and steeping or checking tasks. Sound depends
            on browser audio, page state, and device volume.
          </p>
        </ContentSection>

        <ContentSection title="Kitchen timer vs cooking timer">
          <p>
            This page is a direct online kitchen timer with simple presets and
            custom input. The{" "}
            <a className="ilt-content-link" href="/cooking-timer">
              cooking timer
            </a>{" "}
            is broader and includes more cooking-oriented presets and guidance.
          </p>
          <p>
            For specific foods and drinks, use the{" "}
            <a className="ilt-content-link" href="/egg-timer">
              egg timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/tea-timer">
              tea timer
            </a>
            , or{" "}
            <a className="ilt-content-link" href="/pizza-timer">
              pizza timer
            </a>
            . For direct preset checks, open the{" "}
            <a className="ilt-content-link" href="/5-minute-timer">
              5 minute timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/10-minute-timer">
              10 minute timer
            </a>
            , or{" "}
            <a className="ilt-content-link" href="/30-minute-timer">
              30 minute timer
            </a>
            . For tracking several tasks at once, try{" "}
            <a className="ilt-content-link" href="/multiple-timers">
              multiple timers
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Cooking limits to keep in mind">
          <p>
            A timer helps you remember when to check food, but it cannot
            guarantee perfect results. Appliance behavior, pan or oven type,
            food size, starting temperature, altitude, and personal preference
            all affect timing.
          </p>
        </ContentSection>

        <ContentSection title="Kitchen timer FAQ">
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

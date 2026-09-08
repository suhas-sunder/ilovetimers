import type { Route } from "./+types/seconds-timer";
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
import { secondsTimerContent } from "~/clients/config/presetTimers";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = secondsTimerContent.path;
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const PRESETS = [5, 10, 15, 30, 45, 60, 90];

export function meta({}: Route.MetaArgs) {
  const title = secondsTimerContent.metaTitle;
  const description = secondsTimerContent.metaDescription;

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: secondsTimerContent.keywords.join(", "),
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

function formatSecondsDisplay(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatSecondsLabel(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds} seconds`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0
    ? `${minutes} minute${minutes === 1 ? "" : "s"}`
    : `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} seconds`;
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

function SecondsTimerTool() {
  const [totalSeconds, setTotalSeconds] = useState<number>(secondsTimerContent.defaultSeconds);
  const [secondsInput, setSecondsInput] = useState(String(secondsTimerContent.defaultSeconds));
  const [remainingMs, setRemainingMs] = useState(secondsTimerContent.defaultSeconds * 1000);
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
          beep(880, 150, 0.11);
          window.setTimeout(() => beep(660, 180, 0.11), 190);
        }
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [beep, running, sound]);

  const display = formatSecondsDisplay(remainingMs);
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
    minPx: 58,
    maxPx: isFs ? 540 : 510,
    paddingAllowancePx: isFs ? 76 : 84,
    initialMobileScale: isFs ? 1 : 0.92,
  });

  function applyDuration(seconds: number) {
    const nextSeconds = clampInt(seconds, 1, 86_400);
    const nextMs = nextSeconds * 1000;
    setTotalSeconds(nextSeconds);
    setSecondsInput(String(nextSeconds));
    setRemainingMs(nextMs);
    setRunning(false);
    endRef.current = null;
  }

  function applyCustom() {
    applyDuration(Number(secondsInput || 0));
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
      await navigator.clipboard.writeText(`${formatSecondsDisplay(remainingMs)} remaining`);
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
        title="Seconds Timer"
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
            {status} / Seconds countdown
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
            Set duration: {formatSecondsLabel(totalSeconds)}
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

            <PresetGroup title="Seconds presets">
              {PRESETS.map((seconds) => (
                <Chip
                  key={seconds}
                  active={totalSeconds === seconds}
                  disabled={running}
                  onClick={() => applyDuration(seconds)}
                >
                  {seconds}s
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Custom seconds"
              description="Enter a whole number of seconds from 1 to 86400. Final sound uses browser audio and may require interaction."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(10rem,auto)]">
                <Field
                  label="Total seconds"
                  type="number"
                  min={1}
                  max={86400}
                  value={secondsInput}
                  disabled={running}
                  onChange={(event) => setSecondsInput(event.currentTarget.value)}
                  onBlur={applyCustom}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                />
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <Toggle
                    label="Sound"
                    checked={sound}
                    onCheckedChange={setSound}
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={applyCustom} disabled={running}>
                Apply seconds
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
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap display to start or pause / No ads appear in fullscreen
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function SecondsTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: secondsTimerContent.title,
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description: secondsTimerContent.metaDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: secondsTimerContent.title,
            item: ROUTE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: secondsTimerContent.faqItems.map((item) => ({
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
        display={<SecondsTimerTool />}
        title={secondsTimerContent.h1}
        description={secondsTimerContent.shortDescription}
      />

      <SeoBand>
        <ContentSection title={secondsTimerContent.overviewTitle}>
          {secondsTimerContent.overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ContentSection>

        <ContentSection title={secondsTimerContent.practicalTitle}>
          <p>{secondsTimerContent.practicalIntro}</p>
          <ul className="list-disc space-y-2 pl-5">
            {secondsTimerContent.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection title={secondsTimerContent.durationTitle}>
          <p>{secondsTimerContent.durationParagraph}</p>
        </ContentSection>

        <ContentSection title="Browser timing note">
          <p>{secondsTimerContent.limitationParagraph}</p>
        </ContentSection>

        <ContentSection title="Choose another timer">
          <p>{secondsTimerContent.relatedIntro}</p>
          <p>
            {secondsTimerContent.relatedLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? " / " : null}
                <a className="ilt-content-link" href={link.href}>
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </ContentSection>

        <ContentSection title="Seconds timer FAQ">
          {secondsTimerContent.faqItems.map((item) => (
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

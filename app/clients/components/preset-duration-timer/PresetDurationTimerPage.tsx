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
import { presetDurationTimerConfigs } from "~/clients/config/presetTimers";

export { presetDurationTimerConfigs };

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
  overviewTitle: string;
  overviewParagraphs: readonly string[];
  practicalTitle: string;
  practicalIntro: string;
  useCases: readonly string[];
  durationTitle: string;
  durationParagraph: string;
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
        <ContentSection title={config.overviewTitle}>
          {config.overviewParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ContentSection>

        <ContentSection title={config.practicalTitle}>
          <p>{config.practicalIntro}</p>
          <ul className="list-disc space-y-2 pl-5">
            {config.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection title={config.durationTitle}>
          <p>{config.durationParagraph}</p>
        </ContentSection>

        <ContentSection title="Browser timing note">
          <p>{config.limitationParagraph}</p>
        </ContentSection>

        <ContentSection title="Choose another timer">
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

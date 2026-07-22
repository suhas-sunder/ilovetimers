import Stage4RouteContent from "~/clients/components/content/Stage4RouteContent";
import type { Route } from "./+types/new-year-countdown";
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
  Button as Btn,
  ContentSection,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  ShortcutHint,
  StatusChip,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/new-year-countdown";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const FAQ_ITEMS = [
  {
    question: "What date does this New Year countdown target?",
    answer:
      "It targets the next January 1 at 12:00 AM in your local timezone.",
  },
  {
    question: "Does it create a separate page for each year?",
    answer:
      "No. The countdown automatically rolls forward to the next upcoming New Year.",
  },
  {
    question: "Is this an official New Year broadcast clock?",
    answer:
      "No. It is a browser countdown based on your device clock and timezone.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "New Year Countdown (Time Left Until New Year)";
  const description =
    "Count down to the next New Year with a large live display showing days, hours, minutes, and seconds. Copy, share, and use fullscreen.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "New Year countdown",
        "countdown to New Year",
        "time left until New Year",
        "New Year's countdown",
        "New Year timer",
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

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

const pad2 = (value: number) => String(value).padStart(2, "0");

function getNextNewYear(now: Date) {
  return new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
}

function splitRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatCountdown(ms: number) {
  const parts = splitRemaining(ms);
  return `${parts.days}d ${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
}

function formatTargetDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
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

function NewYearCountdownTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "shared" | "fail">("idle");
  const timeZone = useMemo(() => safeTimeZone(), []);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const target = useMemo(() => getNextNewYear(now), [now]);
  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const display = formatCountdown(remainingMs);
  const parts = splitRemaining(remainingMs);
  const targetText = formatTargetDate(target);
  const targetYear = target.getFullYear();
  const copyText = `New Year countdown: ${display} until ${targetText} (${timeZone}). ${ROUTE_URL}`;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, isFs, targetYear],
    minPx: isFs ? 48 : 36,
    maxPx: isFs ? 540 : 500,
    paddingAllowancePx: isFs ? 64 : 76,
    initialScale: isFs ? 1 : 0.9,
    initialMobileScale: isFs ? 1 : 0.88,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("fail");
      window.setTimeout(() => setCopyState("idle"), 1400);
    }
  }, [copyText]);

  const share = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "New Year Countdown",
          text: copyText,
          url: ROUTE_URL,
        });
        setCopyState("shared");
      } else {
        await navigator.clipboard.writeText(copyText);
        setCopyState("copied");
      }
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("fail");
      window.setTimeout(() => setCopyState("idle"), 1400);
    }
  }, [copyText]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === "f") {
      void fullscreen.toggle();
    } else if (key === "c") {
      void copy();
    } else if (key === "s") {
      void share();
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
        title="New Year Countdown"
        onExit={() => void fullscreen.exit()}
        right={
          <Btn kind="ghost" size="sm" onClick={() => void copy()}>
            {copyState === "copied" ? "Copied" : "Copy"}
          </Btn>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack timer-event-countdown-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) void copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy the countdown" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            Countdown to {targetYear}
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
            {display}
          </span>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            Target: {targetText}
          </div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-[var(--ilt-text-muted)]">
            Local timezone: {timeZone}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void copy()}>
                {copyState === "copied" ? "Copied" : "Copy countdown"}
              </Btn>
              <Btn kind="ghost" onClick={() => void share()}>
                {copyState === "shared" ? "Shared" : "Share"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            {copyState === "fail" ? (
              <StatusChip className="self-center tracking-normal">
                Could not copy or share.
              </StatusChip>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)]">
              <UtilityResultRow>
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Time left
                </span>
                <span>
                  {parts.days} days / {parts.hours} hours / {parts.minutes} minutes / {parts.seconds} seconds
                </span>
              </UtilityResultRow>
            </div>

            <ShortcutHint>
              Shortcuts: C copy / S share / F fullscreen
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap countdown to copy / C copy / S share / F fullscreen
            </div>
            <div className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Target: January 1, {targetYear}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function NewYearCountdownPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "New Year Countdown",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based countdown to the next January 1 in the user's local timezone, with copy, share, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "New Year Countdown", item: ROUTE_URL },
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
        display={<NewYearCountdownTool initialNowISO={nowISO} />}
        title="New Year Countdown"
        description="Count down to the next January 1 in your local timezone with days, hours, minutes, seconds, copy/share actions, and fullscreen support."
      />

      <SeoBand>
        <Stage4RouteContent routePath="/new-year-countdown" />
        <ContentSection title="What this New Year countdown counts toward">
          <p>
            This countdown points to the next January 1 at 12:00 AM in your
            local timezone. It automatically moves to the following New Year
            after the target date passes, so the page does not need a separate
            route for each year.
          </p>
          <p>
            The display shows days, hours, minutes, and seconds left until New
            Year. It uses your browser and device clock, so it is meant as a
            practical countdown display rather than an official broadcast time
            source.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use this New Year countdown for party displays, classroom or event
            countdowns, livestream overlay reference, second-screen countdowns,
            and quick checks of how many days or hours remain. Fullscreen mode
            keeps the countdown readable from across a room.
          </p>
          <p>
            For a custom date, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For shorter countdowns, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/online-timer">
              fullscreen timer
            </a>
            . To compare New Year with another calendar date without a live
            countdown, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For a simple days-until result from today or another start date,
            use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . For December 25, use the{" "}
            <a className="ilt-content-link" href="/christmas-countdown">
              Christmas countdown
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Timezone notes and related tools">
          <p>
            The main countdown follows your local timezone. If you are planning
            across regions, compare current times with the{" "}
            <a className="ilt-content-link" href="/world-clock">
              world clock
            </a>{" "}
            or convert times with the{" "}
            <a className="ilt-content-link" href="/time-zone-converter">
              time zone converter
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="New Year countdown FAQ">
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

import type { Route } from "./+types/12-hour-clock";
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
  ContentSection,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
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
const ROUTE_PATH = "/12-hour-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const FAQ_ITEMS = [
  {
    question: "What is a 12-hour clock?",
    answer:
      "A 12-hour clock shows hours from 1 through 12 and uses AM or PM to identify the half of the day.",
  },
  {
    question: "Does this clock use my local time?",
    answer:
      "Yes. It formats the time from your browser and device clock using your local timezone.",
  },
  {
    question: "How is this different from a 24-hour clock?",
    answer:
      "This page makes AM and PM the main display. A 24-hour clock uses hours 00 through 23 without AM or PM.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "12-Hour Clock Online | Current Local Time";
  const description =
    "View the current local time in 12-hour format with AM and PM on a clear digital clock display.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "12 hour clock",
        "12-hour clock online",
        "AM PM clock",
        "current time in 12 hour format",
        "12 hour digital clock",
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

function cleanTime(value: string) {
  return value.replace(/\u200e/g, "").trim();
}

function format12Hour(date: Date, showSeconds: boolean) {
  try {
    return cleanTime(
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined,
        hour12: true,
      }).format(date),
    );
  } catch {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hourText = String(hours % 12 || 12).padStart(2, "0");
    return showSeconds
      ? `${hourText}:${minutes}:${seconds} ${ampm}`
      : `${hourText}:${minutes} ${ampm}`;
  }
}

function format24Hour(date: Date, showSeconds: boolean) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
}

function formatDateLine(date: Date) {
  try {
    return cleanTime(
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(date),
    );
  } catch {
    return date.toDateString();
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

function TwelveHourClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showComparison, setShowComparison] = useState(true);
  const [copied, setCopied] = useState(false);
  const timeZone = useMemo(() => safeTimeZone(), []);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    let timeout: number | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const next = new Date();
      setNow(next);
      const untilNext = showSeconds
        ? 1000 - next.getMilliseconds()
        : (60 - next.getSeconds()) * 1000 - next.getMilliseconds();
      timeout = window.setTimeout(schedule, Math.max(50, untilNext));
    };

    schedule();
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [showSeconds]);

  const timeText = format12Hour(now, showSeconds);
  const comparisonText = format24Hour(now, showSeconds);
  const dateText = formatDateLine(now);
  const copyText = `${timeText} (${timeZone})${showDate ? ` - ${dateText}` : ""}`;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, showSeconds],
    minPx: 38,
    maxPx: isFs ? 540 : 500,
    paddingAllowancePx: isFs ? 88 : 92,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
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
      setShowSeconds((value) => !value);
    } else if (key === "d") {
      setShowDate((value) => !value);
    } else if (key === "h") {
      setShowComparison((value) => !value);
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
        title="12 Hour Clock"
        onExit={() => void fullscreen.exit()}
        right={
          <Btn kind="ghost" size="sm" onClick={() => void copy()}>
            {copied ? "Copied" : "Copy"}
          </Btn>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-clock-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 font-mono sm:p-6"
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 430px)",
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="off"
          onClick={() => {
            if (isFs) void copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy the current time" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            Local AM/PM time
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block max-w-full whitespace-nowrap text-center font-extrabold"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          {showComparison ? (
            <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
              24-hour equivalent: {comparisonText}
            </div>
          ) : null}
          <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
            {showDate ? `${dateText} / ` : ""}{timeZone}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-3">
                <Toggle
                  label="Seconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
                <Toggle
                  label="Date"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
                <Toggle
                  label="24-hour comparison"
                  checked={showComparison}
                  onCheckedChange={setShowComparison}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy 12-hour time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen / C copy / S seconds / D date / H comparison
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Toggle
                label="Seconds"
                checked={showSeconds}
                onCheckedChange={setShowSeconds}
              />
              <Toggle
                label="Date"
                checked={showDate}
                onCheckedChange={setShowDate}
              />
              <Toggle
                label="Comparison"
                checked={showComparison}
                onCheckedChange={setShowComparison}
              />
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / S seconds / D date / H comparison
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function TwelveHourClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "12 Hour Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based live 12-hour AM/PM clock with seconds, date, 24-hour comparison, copy, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "12 Hour Clock", item: ROUTE_URL },
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
        display={<TwelveHourClockTool initialNowISO={nowISO} />}
        title="12 Hour Clock"
        description="See the current local time in a large AM/PM display with seconds, date, 24-hour comparison, copy, and fullscreen controls."
      />

      <SeoBand>
        <ContentSection title="How this 12-hour clock works">
          <p>
            This clock displays the current local time in 12-hour format, using
            AM and PM to distinguish morning from afternoon and evening. It uses
            your browser and device clock, so it is a practical display tool
            rather than an official time source.
          </p>
          <p>
            Seconds are available when you need to watch the live rollover, and
            the date can stay visible for desk, classroom, or second-screen use.
          </p>
        </ContentSection>

        <ContentSection title="12-hour time vs 24-hour time">
          <p>
            The 12-hour format repeats 1 through 12 twice each day and adds AM
            or PM. The 24-hour format runs from 00 through 23 and does not need
            AM or PM labels.
          </p>
          <p>
            For the opposite format as the main display, use the{" "}
            <a className="ilt-content-link" href="/24-hour-clock">
              24 hour clock
            </a>
            . For compact military-style notation and conversion notes, try the{" "}
            <a className="ilt-content-link" href="/military-time-clock">
              military time clock
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/military-time-converter">
              military time converter
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Common uses">
          <p>
            A 12-hour AM/PM clock is useful for everyday local time, classroom
            displays, desk clocks, fullscreen second-screen clocks, and users
            who prefer AM/PM time. For a general clock page, open the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For local time context, use{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="12-hour clock FAQ">
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

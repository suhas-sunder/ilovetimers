import type { Route } from "./+types/24-hour-clock";
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
  Select,
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
const ROUTE_PATH = "/24-hour-clock";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type ClockMode = "local" | "utc";

const FAQ_ITEMS = [
  {
    question: "What is a 24-hour clock?",
    answer:
      "A 24-hour clock shows hours from 00 through 23 instead of using AM and PM.",
  },
  {
    question: "Does this page use an official time source?",
    answer:
      "No. It formats the time from your browser and device clock, with an optional UTC display mode.",
  },
  {
    question: "How is this different from the military time clock?",
    answer:
      "This page focuses on general 24-hour time with colon formatting. The military time clock also emphasizes compact HHMM notation and Zulu-style context.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "24 Hour Clock Online (Current Time in 24-Hour Format)";
  const description =
    "View the current time in 24-hour format with a large live clock, seconds and date toggles, local or UTC mode, copy, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "24 hour clock",
        "24-hour clock online",
        "current time in 24 hour format",
        "24 hour digital clock",
        "clock in 24-hour format",
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

function format24HourTime(date: Date, mode: ClockMode, showSeconds: boolean) {
  const hours = mode === "utc" ? date.getUTCHours() : date.getHours();
  const minutes = mode === "utc" ? date.getUTCMinutes() : date.getMinutes();
  const seconds = mode === "utc" ? date.getUTCSeconds() : date.getSeconds();
  return `${pad2(hours)}:${pad2(minutes)}${showSeconds ? `:${pad2(seconds)}` : ""}`;
}

function format12HourTime(date: Date, mode: ClockMode, showSeconds: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: true,
    timeZone: mode === "utc" ? "UTC" : undefined,
    timeZoneName: "short",
  }).format(date);
}

function formatDateLine(date: Date, mode: ClockMode) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: mode === "utc" ? "UTC" : undefined,
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

function TwentyFourHourClockTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [mode, setMode] = useState<ClockMode>("local");
  const [copied, setCopied] = useState(false);
  const localTimeZone = useMemo(() => safeTimeZone(), []);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(new Date()),
      showSeconds ? 250 : 1000,
    );
    return () => window.clearInterval(interval);
  }, [showSeconds]);

  const timeText = format24HourTime(now, mode, showSeconds);
  const dateText = formatDateLine(now, mode);
  const equivalentText = format12HourTime(now, mode, showSeconds);
  const zoneLabel = mode === "utc" ? "UTC" : localTimeZone;
  const modeLabel = mode === "utc" ? "UTC time" : "Local device time";
  const copyText = `${timeText} ${zoneLabel}${showDate ? ` / ${dateText}` : ""}`;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [timeText, isFs, showSeconds, mode],
    minPx: 58,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 84,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
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
    } else if (key === "u") {
      setMode((value) => (value === "utc" ? "local" : "utc"));
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
        title="24 Hour Clock"
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
          aria-live="polite"
          onClick={() => {
            if (isFs) void copy();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap or click to copy the current time" : undefined}
        >
          <div className="timer-clock-label text-xs font-extrabold uppercase tracking-widest">
            {modeLabel}
          </div>
          <span
            ref={timeTextRef}
            data-primary-display-value
            className="timer-clock-value mt-3 inline-block whitespace-nowrap text-center font-extrabold tracking-widest"
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {timeText}
          </span>
          <div className="timer-clock-context mt-4 text-sm font-semibold sm:text-base">
            12-hour equivalent: {equivalentText}
          </div>
          {showDate ? (
            <div className="timer-clock-context mt-2 text-sm font-semibold sm:text-base">
              {dateText} / {zoneLabel}
            </div>
          ) : null}
        </DisplayStage>

        {!isFs ? (
          <>
            <SettingGroup title="Clock settings">
              <SettingRow className="sm:grid-cols-2 lg:grid-cols-4">
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
                <Select
                  label="Time source"
                  value={mode}
                  onChange={(event) =>
                    setMode(event.currentTarget.value as ClockMode)
                  }
                >
                  <option value="local">Local</option>
                  <option value="utc">UTC</option>
                </Select>
                <div className="ilt-helper-text flex items-end">
                  Local mode uses your device clock and timezone. UTC mode
                  formats that same instant as UTC.
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-clock-actions">
              <Btn kind="ghost" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy 24-hour time"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-clock-shortcut">
              Shortcuts: F fullscreen / C copy / S seconds / D date / U UTC or local
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
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Tap time to copy / S seconds / D date / U UTC or local
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function TwentyFourHourClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "24 Hour Clock",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        description:
          "A browser-based live 24-hour clock with seconds, date, local or UTC mode, copy, and fullscreen display.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "24 Hour Clock", item: ROUTE_URL },
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
        display={<TwentyFourHourClockTool initialNowISO={nowISO} />}
        title="24 Hour Clock"
        description="See the current time in 24-hour format with a large live display, seconds and date toggles, local or UTC mode, copy, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this 24-hour clock works">
          <p>
            This clock displays the current time in 24-hour format, where the
            day runs from 00:00 through 23:59 instead of repeating 1 through 12
            with AM and PM labels.
          </p>
          <p>
            Local mode uses the time and timezone from your browser and device.
            UTC mode formats the same current instant as Coordinated Universal
            Time. This page is a display tool, not an official time source.
          </p>
        </ContentSection>

        <ContentSection title="24-hour format vs AM/PM time">
          <p>
            In 24-hour format, 13:00 means 1:00 PM, 18:30 means 6:30 PM, and
            00:00 means midnight at the start of a day. The 12-hour equivalent
            stays visible as secondary context so you can compare both formats.
          </p>
          <p>
            For compact military-style notation such as 0930 or 1745, use the{" "}
            <a className="ilt-content-link" href="/military-time-clock">
              military time clock
            </a>
            . To convert a written time between 12-hour and 24-hour format, use
            the{" "}
            <a className="ilt-content-link" href="/military-time-converter">
              military time converter
            </a>
            . If you prefer AM/PM as the main display, open the{" "}
            <a className="ilt-content-link" href="/12-hour-clock">
              12 hour clock
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Common uses">
          <p>
            A 24-hour digital clock is useful for international schedules, work
            shifts, travel planning, classrooms, wall-clock display, and
            fullscreen second-screen clocks. For a general AM/PM-capable clock,
            try the{" "}
            <a className="ilt-content-link" href="/digital-clock">
              digital clock
            </a>
            . For UTC only, open the{" "}
            <a className="ilt-content-link" href="/utc-clock">
              UTC clock
            </a>{" "}
            or compare your device time on the{" "}
            <a className="ilt-content-link" href="/current-local-time">
              current local time
            </a>{" "}
            page.
          </p>
        </ContentSection>

        <ContentSection title="24-hour clock FAQ">
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

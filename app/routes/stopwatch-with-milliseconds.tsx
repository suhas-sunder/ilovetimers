import type { Route } from "./+types/stopwatch-with-milliseconds";
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
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  Select,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  StatusChip,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_PATH = "/stopwatch-with-milliseconds";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

type Precision = "milliseconds" | "hundredths" | "seconds";
type Lap = { n: number; totalMs: number; splitMs: number };

const FAQ_ITEMS = [
  {
    question: "Does this stopwatch show milliseconds?",
    answer:
      "Yes. Milliseconds are visible by default, and you can switch to hundredths or whole seconds when you want a calmer display.",
  },
  {
    question: "Is it different from a countdown timer?",
    answer:
      "Yes. This stopwatch counts elapsed time upward from zero. A countdown timer starts from a duration and counts down toward zero.",
  },
  {
    question: "Can a browser stopwatch guarantee millisecond accuracy?",
    answer:
      "No. Browser timing, display refresh rate, inactive-tab throttling, and device performance can affect what you see on screen.",
  },
];

export function meta({}: Route.MetaArgs) {
  const title = "Stopwatch With Milliseconds (Online Millisecond Stopwatch)";
  const description =
    "Use an online stopwatch with milliseconds visible by default. Start, pause, resume, reset, record laps, copy elapsed time, and use fullscreen.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "stopwatch with milliseconds",
        "online stopwatch milliseconds",
        "millisecond stopwatch",
        "elapsed time timer",
        "stopwatch hundredths",
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

const pad2 = (value: number) => String(value).padStart(2, "0");
const pad3 = (value: number) => String(value).padStart(3, "0");

function formatElapsed(ms: number, precision: Precision) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const prefix =
    hours > 0
      ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
      : `${minutes}:${pad2(seconds)}`;

  if (precision === "seconds") return prefix;
  if (precision === "hundredths") {
    return `${prefix}.${pad2(Math.floor((safeMs % 1000) / 10))}`;
  }
  return `${prefix}.${pad3(safeMs % 1000)}`;
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

function MillisecondStopwatchTool() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [precision, setPrecision] = useState<Precision>("milliseconds");
  const [laps, setLaps] = useState<Lap[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastLapTotalRef = useRef(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      startRef.current = null;
      return;
    }

    startRef.current = performance.now();
    const tick = () => {
      const now = performance.now();
      setElapsed(baseRef.current + (now - (startRef.current ?? now)));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setCopyState("idle");
    setRunning((current) => {
      baseRef.current = elapsedRef.current;
      return !current;
    });
  }

  function reset() {
    setCopyState("idle");
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    lastLapTotalRef.current = 0;
    setLaps([]);
    stopRaf();
    startRef.current = null;
  }

  function recordLap() {
    setCopyState("idle");
    const totalMs = elapsedRef.current;
    if (totalMs <= 0) return;
    const splitMs = totalMs - lastLapTotalRef.current;
    lastLapTotalRef.current = totalMs;
    setLaps((previous) => [
      { n: previous.length + 1, totalMs, splitMs },
      ...previous,
    ]);
  }

  function clearLaps() {
    setCopyState("idle");
    setLaps([]);
    lastLapTotalRef.current = elapsedRef.current;
  }

  const shownTime = formatElapsed(elapsed, precision);
  const statusLabel = running ? "Running" : elapsed > 0 ? "Paused" : "Ready";

  const lapCopyText = useMemo(() => {
    const lines = ["Lap,Split Time,Total Time"];
    for (const lap of [...laps].reverse()) {
      lines.push(
        `${lap.n},${formatElapsed(lap.splitMs, precision)},${formatElapsed(
          lap.totalMs,
          precision,
        )}`,
      );
    }
    return lines.join("\n");
  }, [laps, precision]);

  async function copyElapsed() {
    const ok = await copyToClipboard(`${shownTime} elapsed`);
    setCopyState(ok ? "ok" : "fail");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }

  async function copyLaps() {
    if (laps.length === 0) return;
    const ok = await copyToClipboard(lapCopyText);
    setCopyState(ok ? "ok" : "fail");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, precision, statusLabel],
    minPx: 52,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
    initialScale: isFs ? 1 : 1.02,
    initialMobileScale: isFs ? 1 : 0.95,
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      startPause();
    } else if (key === "l") {
      recordLap();
    } else if (key === "r") {
      reset();
    } else if (key === "c") {
      void copyElapsed();
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
        title="Stopwatch With Milliseconds"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </Btn>
            <Btn kind="ghost" size="sm" onClick={recordLap}>
              Lap
            </Btn>
            <Btn kind="ghost" size="sm" onClick={reset}>
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className="timer-display-surface relative mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
          style={{
            minHeight: isFs ? 0 : "clamp(320px, 38vw, 440px)",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {statusLabel} / {precision}
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
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
            {laps.length} {laps.length === 1 ? "lap" : "laps"} recorded
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={recordLap} disabled={elapsed <= 0}>
                Lap
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Display precision"
              description="Milliseconds are shown by default. Switch to hundredths or seconds when you want fewer changing digits."
            >
              <SettingRow className="sm:grid-cols-2">
                <Select
                  label="Precision"
                  value={precision}
                  onChange={(event) =>
                    setPrecision(event.currentTarget.value as Precision)
                  }
                >
                  <option value="milliseconds">Show milliseconds</option>
                  <option value="hundredths">Show hundredths</option>
                  <option value="seconds">Show seconds only</option>
                </Select>
                <div className="ilt-helper-text flex items-end">
                  Display refresh rate and browser throttling can affect visible
                  updates, especially in inactive tabs.
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow className="timer-history-actions">
              <Btn kind="ghost" onClick={() => void copyElapsed()}>
                {copyState === "ok" ? "Copied" : "Copy elapsed"}
              </Btn>
              <Btn kind="ghost" onClick={() => void copyLaps()} disabled={laps.length === 0}>
                Copy laps
              </Btn>
              <Btn kind="ghost" onClick={clearLaps} disabled={laps.length === 0}>
                Clear laps
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-history-shortcut">
              Shortcuts: Space start/pause / L lap / C copy / R reset / F fullscreen
            </ShortcutHint>

            {copyState === "fail" ? (
              <StatusChip className="self-center tracking-normal">
                Could not copy.
              </StatusChip>
            ) : null}

            <div className="timer-history-panel mt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  Laps and splits
                </div>
                <div className="text-xs font-semibold text-[var(--ilt-text-muted)]">
                  Most recent first / split is time since previous lap
                </div>
              </div>
              {laps.length === 0 ? (
                <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                  Press Lap to record split times while the stopwatch runs or
                  after it is paused.
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {laps.slice(0, 12).map((lap) => (
                    <UtilityResultRow key={lap.n}>
                      <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                        Lap {lap.n}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                          Total {formatElapsed(lap.totalMs, precision)}
                        </div>
                        <div className="text-xs font-semibold">
                          Split {formatElapsed(lap.splitMs, precision)}
                        </div>
                      </div>
                    </UtilityResultRow>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        <FullscreenBottomBar show={isFs}>
          <div className="ilt-helper-text text-center sm:text-sm">
            Tap time to start or pause / Space start/pause / L lap / R reset / F fullscreen
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

export default function StopwatchWithMillisecondsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Stopwatch With Milliseconds",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based stopwatch with milliseconds visible by default, precision options, laps, copy, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Stopwatch With Milliseconds",
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
        display={<MillisecondStopwatchTool />}
        title="Stopwatch With Milliseconds"
        description="Measure elapsed time with milliseconds visible by default, optional hundredths or seconds-only display, laps, copy, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this stopwatch with milliseconds works">
          <p>
            This page is an elapsed-time stopwatch. Press Start and the display
            counts up from zero, with milliseconds visible by default. Pause,
            resume, reset, or record laps whenever you need split times.
          </p>
          <p>
            The display can show milliseconds, hundredths, or whole seconds.
            Milliseconds are helpful when seconds feel too coarse, while
            hundredths are easier to read for quick practice timing.
          </p>
        </ContentSection>

        <ContentSection title="When to use a millisecond stopwatch">
          <p>
            Use it for practice timing, drills, classroom observations,
            speedcubing or speedrun practice, video and audio timing checks, and
            quick elapsed-time measurement. It is a practical browser stopwatch,
            not a calibrated measurement instrument.
          </p>
          <p>
            For a countdown that starts from a millisecond duration, use the{" "}
            <a className="ilt-content-link" href="/millisecond-timer">
              millisecond timer
            </a>
            . To convert millisecond values into seconds, minutes, or hours,
            use the{" "}
            <a className="ilt-content-link" href="/milliseconds-converter">
              milliseconds converter
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Stopwatch, countdown, and timing limits">
          <p>
            A stopwatch measures elapsed time upward. A{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>{" "}
            starts from a set duration and counts down. A{" "}
            <a className="ilt-content-link" href="/count-up-timer">
              count up timer
            </a>{" "}
            is useful when you want a simpler elapsed-time display without lap
            controls.
          </p>
          <p>
            Browser timing can be affected by inactive tabs, power-saving mode,
            device performance, and display refresh rate. For reaction-style
            practice, try the{" "}
            <a className="ilt-content-link" href="/reaction-time-test">
              reaction time test
            </a>{" "}
            or the{" "}
            <a className="ilt-content-link" href="/speedcubing-timer">
              speedcubing timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Stopwatch with milliseconds FAQ">
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

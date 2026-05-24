// app/routes/millisecond-timer.tsx
import type { Route } from "./+types/millisecond-timer";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
const ROUTE_PATH = "/millisecond-timer";
const ROUTE_URL = `${SITE_URL}${ROUTE_PATH}`;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const PRESETS = [
  { label: "100 ms", ms: 100 },
  { label: "1 second", ms: 1000 },
  { label: "10 seconds", ms: 10_000 },
  { label: "30 seconds", ms: 30_000 },
  { label: "1 minute", ms: 60_000 },
  { label: "5 minutes", ms: 300_000 },
];

export function meta({}: Route.MetaArgs) {
  const title = "Millisecond Timer (Countdown With Milliseconds)";
  const description =
    "Run an online countdown timer with milliseconds, custom minutes, seconds, milliseconds, presets, start, pause, reset, copy, and fullscreen support.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "millisecond timer",
        "timer with milliseconds",
        "online timer milliseconds",
        "millisecond countdown timer",
        "timer with seconds and milliseconds",
        "countdown timer milliseconds",
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

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.trunc(clamp(value, min, max));
}

function formatMs(ms: number) {
  const value = Math.max(0, Math.ceil(ms));
  const hours = Math.floor(value / 3_600_000);
  const minutes = Math.floor((value % 3_600_000) / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  const millis = value % 1000;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
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

function splitMs(totalMs: number) {
  const safe = Math.max(0, Math.round(totalMs));
  return {
    minutes: Math.floor(safe / 60_000),
    seconds: Math.floor((safe % 60_000) / 1000),
    milliseconds: safe % 1000,
  };
}

function MillisecondTimerTool() {
  const [totalMs, setTotalMs] = useState(10_000);
  const [remainingMs, setRemainingMs] = useState(10_000);
  const [minutesInput, setMinutesInput] = useState("0");
  const [secondsInput, setSecondsInput] = useState("10");
  const [millisecondsInput, setMillisecondsInput] = useState("0");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const displayBoxRef = useRef<HTMLElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const remainingRef = useRef(remainingMs);
  const endRef = useRef<number | null>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

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
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [running]);

  const display = formatMs(remainingMs);
  const status = running ? "Running" : remainingMs <= 0 ? "Complete" : remainingMs < totalMs ? "Paused" : "Ready";
  const progress = useMemo(() => {
    if (totalMs <= 0) return 0;
    return clamp((totalMs - Math.max(0, remainingMs)) / totalMs, 0, 1);
  }, [remainingMs, totalMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [display, isFs, status],
    minPx: 48,
    maxPx: isFs ? 540 : 510,
    paddingAllowancePx: isFs ? 64 : 72,
    initialScale: isFs ? 1 : 1.02,
    initialMobileScale: isFs ? 1 : 0.87,
  });

  function applyDuration(ms: number) {
    const next = clampInt(ms, 1, 86_400_000);
    const parts = splitMs(next);
    setTotalMs(next);
    setRemainingMs(next);
    setMinutesInput(String(parts.minutes));
    setSecondsInput(String(parts.seconds));
    setMillisecondsInput(String(parts.milliseconds));
    setRunning(false);
    endRef.current = null;
  }

  function applyCustomInputs() {
    const minutes = clampInt(Number(minutesInput || 0), 0, 1440);
    const seconds = clampInt(Number(secondsInput || 0), 0, 59);
    const milliseconds = clampInt(Number(millisecondsInput || 0), 0, 999);
    applyDuration(Math.max(1, minutes * 60_000 + seconds * 1000 + milliseconds));
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      return;
    }
    const nextRemaining = remainingMs <= 0 ? totalMs : remainingMs;
    remainingRef.current = nextRemaining;
    if (remainingMs <= 0) setRemainingMs(totalMs);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    endRef.current = null;
    setRemainingMs(totalMs);
  }

  async function copyRemaining() {
    try {
      await navigator.clipboard.writeText(`${formatMs(remainingMs)} remaining`);
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
        title="Millisecond Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" size="sm" onClick={startPause}>
              {running ? "Pause" : remainingMs < totalMs && remainingMs > 0 ? "Resume" : "Start"}
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
            {status} / Countdown with milliseconds
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
            Set duration: {formatMs(totalMs)}
          </div>
        </DisplayStage>

        {!isFs ? (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : remainingMs < totalMs && remainingMs > 0 ? "Resume" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Millisecond timer presets"
              description="Pick a short countdown or enter a custom duration below."
            >
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.label}
                  active={totalMs === preset.ms}
                  disabled={running}
                  onClick={() => applyDuration(preset.ms)}
                >
                  {preset.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Custom duration"
              description="Use minutes, seconds, and milliseconds together. Inputs are applied as one countdown duration."
            >
              <SettingRow className="sm:grid-cols-3">
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
                <Field
                  label="Milliseconds"
                  type="number"
                  min={0}
                  max={999}
                  value={millisecondsInput}
                  disabled={running}
                  onChange={(event) => setMillisecondsInput(event.currentTarget.value)}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={applyCustomInputs} disabled={running}>
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
              Shortcuts: Space start/pause / R reset / C copy / F fullscreen
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

export default function MillisecondTimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Millisecond Timer",
        url: ROUTE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description:
          "A browser-based countdown timer that displays milliseconds with custom minutes, seconds, milliseconds, presets, controls, and fullscreen support.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Millisecond Timer", item: ROUTE_URL },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ToolHero
        display={<MillisecondTimerTool />}
        title="Millisecond Timer"
        description="Run a countdown timer that visibly includes milliseconds, with presets, custom minute/second/millisecond inputs, copy, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this millisecond timer works">
          <p>
            This is a countdown timer that displays minutes, seconds, and
            milliseconds. Enter a custom duration or choose a preset, then
            start, pause, resume, or reset the countdown.
          </p>
          <p>
            The timer reconciles against the browser performance clock while it
            is running, so the visible display updates with milliseconds rather
            than only whole seconds.
          </p>
        </ContentSection>

        <ContentSection title="When to use a timer with milliseconds">
          <p>
            Use it for short timing drills, animation checks, video or audio
            timing, quick developer tests, classroom demos, games, practice
            timing, or any countdown where seconds alone are too coarse.
          </p>
          <p>
            For elapsed timing instead of countdown timing, use the{" "}
            <a className="ilt-content-link" href="/stopwatch-with-milliseconds">
              stopwatch with milliseconds
            </a>
            . For a simpler whole-second countdown, use the{" "}
            <a className="ilt-content-link" href="/seconds-timer">
              seconds timer
            </a>
            . For current time with milliseconds, use the{" "}
            <a className="ilt-content-link" href="/clock-with-milliseconds">
              clock with milliseconds
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Milliseconds, converters, and limits">
          <p>
            A duration of 1000 milliseconds is one second. A duration of 1500
            milliseconds is one and a half seconds. If you need to convert
            values instead of run a countdown, use the{" "}
            <a className="ilt-content-link" href="/milliseconds-converter">
              milliseconds converter
            </a>
            .
          </p>
          <p>
            Browser update rate, inactive tab throttling, display refresh rate,
            and device performance can affect the visible millisecond display.
            This page is useful for practical browser timing, not calibrated
            measurement.
          </p>
        </ContentSection>

        <ContentSection title="Millisecond timer FAQ">
          <h3>Can I set 1000 milliseconds?</h3>
          <p>
            Yes. Set milliseconds to 1000 by using the 1 second preset, or set
            0 minutes, 1 second, and 0 milliseconds in the custom inputs.
          </p>
          <h3>How is this different from the countdown timer?</h3>
          <p>
            The{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>{" "}
            is a general minutes-and-seconds timer. This page is built around a
            millisecond display and millisecond input.
          </p>
          <h3>Can I use it for reaction practice?</h3>
          <p>
            For click-response practice, use the{" "}
            <a className="ilt-content-link" href="/reaction-time-test">
              reaction time test
            </a>
            . This page is a countdown timer, not a reaction measurement tool.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

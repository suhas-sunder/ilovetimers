import type { Route } from "./+types/study-stopwatch";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  Button,
  ContentSection,
  ControlGroup,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  ShortcutHint,
  ToolFrame,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";
import { useElapsedStopwatch } from "~/clients/hooks/useElapsedStopwatch";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

const SITE_URL = "https://www.ilovetimers.com";
const ROUTE_URL = `${SITE_URL}/study-stopwatch`;
const REVIEW_DATE = {
  iso: "2026-07-15",
  label: "July 15, 2026",
} as const;

const FAQ_ITEMS = [
  {
    question: "Does the study stopwatch have a fixed end time?",
    answer:
      "No. It counts upward from zero until you pause or reset it. Use the Study Timer when you want a fixed-duration countdown.",
  },
  {
    question: "What are session markers?",
    answer:
      "A marker records the current elapsed time without stopping the stopwatch. You can use markers for a completed chapter, practice set, break, or topic change.",
  },
  {
    question: "Will it keep running in a background tab?",
    answer:
      "The browser may reduce screen updates in a background tab. When the page becomes visible again, the displayed elapsed time is reconciled from the browser's monotonic timing clock, subject to browser and device behavior.",
  },
  {
    question: "Is study information sent to analytics?",
    answer:
      "No marker content or elapsed value is sent by this tool. Markers stay in this page's memory and are cleared by reset or reload. Cookieless analytics may record the canonical page path only.",
  },
] as const;

type StudyMarker = {
  id: number;
  number: number;
  elapsedMs: number;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

function formatElapsed(ms: number) {
  const hundredthsTotal = Math.floor(Math.max(0, ms) / 10);
  const totalSeconds = Math.floor(hundredthsTotal / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = hundredthsTotal % 100;
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(seconds)}.${pad2(hundredths)}`
    : `${minutes}:${pad2(seconds)}.${pad2(hundredths)}`;
}

function isInteractiveTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "BUTTON" ||
    element.tagName === "INPUT" ||
    element.tagName === "SELECT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "A" ||
    element.isContentEditable
  );
}

function StudyStopwatchTool() {
  const stopwatch = useElapsedStopwatch();
  const [markers, setMarkers] = useState<StudyMarker[]>([]);
  const markerIdRef = useRef(1);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const fullscreen = useFullscreen(frameRef);

  function addMarker() {
    const elapsedMs = stopwatch.readElapsed();
    if (elapsedMs <= 0) return;

    const id = markerIdRef.current;
    markerIdRef.current += 1;
    setMarkers((current) => [
      ...current,
      { id, number: id, elapsedMs },
    ]);
  }

  function deleteMarker(id: number) {
    setMarkers((current) => current.filter((marker) => marker.id !== id));
  }

  function clearMarkers() {
    setMarkers([]);
  }

  function resetSession() {
    stopwatch.reset();
    markerIdRef.current = 1;
    setMarkers([]);
  }

  const shownTime = formatElapsed(stopwatch.elapsedMs);
  const status = stopwatch.running
    ? "Studying"
    : stopwatch.elapsedMs > 0
      ? "Paused"
      : "Ready";
  const startLabel = stopwatch.running
    ? "Pause"
    : stopwatch.elapsedMs > 0
      ? "Resume"
      : "Start";

  const displayFontSize = useFitDisplayText({
    containerRef: displayRef,
    textRef: timeRef,
    deps: [shownTime, status, markers.length, fullscreen.isFullscreen],
    minPx: 48,
    maxPx: fullscreen.isFullscreen ? 520 : 460,
    paddingAllowancePx: fullscreen.isFullscreen ? 56 : 64,
    initialMobileScale: 0.9,
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget && isInteractiveTarget(event.target)) {
      return;
    }
    const key = event.key.toLowerCase();
    if (event.key === " ") {
      event.preventDefault();
      stopwatch.toggle();
    } else if (key === "m") {
      addMarker();
    } else if (key === "r") {
      resetSession();
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
      data-tool="study-stopwatch"
    >
      <FullscreenTopBar
        show={fullscreen.isFullscreen}
        title="Study"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="primary" size="sm" onClick={stopwatch.toggle}>
              {startLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={addMarker}
              disabled={stopwatch.elapsedMs <= 0}
            >
              Marker
            </Button>
            <Button variant="secondary" size="sm" onClick={resetSession}>
              Reset
            </Button>
          </div>
        }
      />

      <div
        className={
          fullscreen.isFullscreen
            ? "flex h-full flex-col"
            : "timer-history-stack flex h-full flex-col"
        }
      >
        <DisplayStage
          stageRef={displayRef}
          isFullscreen={fullscreen.isFullscreen}
          className="order-1 mt-4 flex flex-col p-3 sm:p-6"
          style={{
            minHeight: fullscreen.isFullscreen
              ? 0
              : "clamp(320px, 38vw, 440px)",
            marginTop: fullscreen.isFullscreen ? "3.6rem" : undefined,
            marginBottom: fullscreen.isFullscreen ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: fullscreen.isFullscreen ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (fullscreen.isFullscreen) stopwatch.toggle();
          }}
          role={fullscreen.isFullscreen ? "button" : undefined}
          tabIndex={fullscreen.isFullscreen ? 0 : undefined}
          onKeyDown={(event) => {
            if (
              fullscreen.isFullscreen &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              event.stopPropagation();
              stopwatch.toggle();
            }
          }}
          aria-label={
            fullscreen.isFullscreen
              ? `Study stopwatch: ${shownTime}. ${startLabel}.`
              : undefined
          }
        >
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ilt-text-muted)]">
            Study Stopwatch / {status}
          </div>
          <span
            ref={timeRef}
            data-primary-display-value
            className="mt-4 inline-block whitespace-nowrap font-mono font-extrabold tracking-wider text-[var(--ilt-text-primary)]"
            style={{ fontSize: displayFontSize, lineHeight: 1 }}
          >
            {shownTime}
          </span>
          <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {markers.length} {markers.length === 1 ? "session marker" : "session markers"}
          </div>
        </DisplayStage>

        {!fullscreen.isFullscreen ? (
          <div className="order-2 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Button variant="primary" onClick={stopwatch.toggle}>
                {startLabel}
              </Button>
              <Button
                variant="secondary"
                onClick={addMarker}
                disabled={stopwatch.elapsedMs <= 0}
              >
                Add marker
              </Button>
              <Button variant="secondary" onClick={resetSession}>
                Reset
              </Button>
            </ControlGroup>

            <SecondaryActionRow>
              <Button
                variant="secondary"
                onClick={() => void fullscreen.toggle()}
              >
                Fullscreen
              </Button>
              <Button
                variant="secondary"
                onClick={clearMarkers}
                disabled={markers.length === 0}
              >
                Clear markers
              </Button>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / M add marker / R reset / F
              fullscreen
            </ShortcutHint>

            <section className="timer-history-panel space-y-3" aria-labelledby="study-markers-heading">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2
                  id="study-markers-heading"
                  className="text-sm font-bold text-[var(--ilt-text-primary)]"
                >
                  Session markers
                </h2>
                <p className="ilt-helper-text">
                  Chronological checkpoints in this session
                </p>
              </div>
              {markers.length === 0 ? (
                <p className="text-sm text-[var(--ilt-text-secondary)]">
                  Add a marker when you finish a chapter, practice set, break,
                  or topic.
                </p>
              ) : (
                <div className="space-y-2">
                  {markers.map((marker) => (
                    <UtilityResultRow key={marker.id}>
                      <div>
                        <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                          Marker {marker.number}
                        </div>
                        <div className="mt-1 font-mono text-sm">
                          {formatElapsed(marker.elapsedMs)} elapsed
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deleteMarker(marker.id)}
                        aria-label={`Delete marker ${marker.number}`}
                      >
                        Delete
                      </Button>
                    </UtilityResultRow>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}

        <FullscreenBottomBar show={fullscreen.isFullscreen}>
          <p className="ilt-helper-text text-center">
            Quiet stopwatch / Space start or pause / M add marker / R reset / F
            fullscreen
          </p>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

export function meta({}: Route.MetaArgs) {
  const title =
    "Study Stopwatch Online | Track Open-Ended Study Sessions";
  const description =
    "Track an open-ended study session with a quiet online stopwatch, pause and resume controls, session markers, and a clear fullscreen display.";

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

export default function StudyStopwatchPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Study Stopwatch",
        url: ROUTE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        dateModified: REVIEW_DATE.iso,
        description:
          "A quiet browser-based stopwatch for open-ended study sessions with pause, resume, session markers, and fullscreen controls.",
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
            name: "Study Stopwatch",
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
        display={<StudyStopwatchTool />}
        title="Study Stopwatch"
        description="Track study time without choosing a fixed countdown or Pomodoro cycle."
      />

      <SeoBand>
        <ContentSection title="How to use the study stopwatch">
          <p>
            Start when you begin studying, pause when the session stops, and
            resume from the same elapsed value. Add a marker without stopping
            the clock when you reach a useful checkpoint. The tool is quiet by
            default and does not play ticks, marker sounds, or completion audio.
          </p>
        </ContentSection>

        <ContentSection title="Study stopwatch vs study timer">
          <p>
            The Study Stopwatch counts upward for an open-ended session. The
            Study Timer counts down from a fixed duration. Choose the stopwatch
            when you do not know the session length in advance, or choose the
            timer when you want a planned stopping point.
          </p>
        </ContentSection>

        <ContentSection title="Study stopwatch vs Pomodoro">
          <p>
            A Pomodoro timer alternates repeated work and break cycles. This
            stopwatch keeps one continuous elapsed-time session with optional
            markers. Neither method is universally better; the useful choice
            depends on whether you want open-ended tracking or structured
            cycles.
          </p>
        </ContentSection>

        <ContentSection title="Useful session markers">
          <p>
            Add a marker after a chapter, practice set, break, or topic change.
            Markers are simple elapsed-time checkpoints in chronological order.
            They have no required text field, are not saved to a server, and
            disappear when you reset or reload the page.
          </p>
        </ContentSection>

        <ToolTrustNote reviewDate={REVIEW_DATE}>
          <p>
            This page measures practical browser-based elapsed time. Display
            refresh, browser scheduling, device performance, background
            behavior, and input delay can affect millisecond-level readings. It
            is intended for study tracking, not certified measurement.
          </p>
        </ToolTrustNote>

        <ContentSection title="Study stopwatch FAQ">
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

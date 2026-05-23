// app/routes/count-up-timer.tsx
import type { Route } from "./+types/count-up-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  useMemo
} from "react";
import {
  Button as Btn,
  ControlGroup,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/count-up-timer/HowItWorks";
import Disclaimer from "~/clients/components/count-up-timer/Disclaimer";
import FAQ from "~/clients/components/count-up-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/count-up-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/count-up-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Count Up Timer (Elapsed Time + Laps, Fullscreen)";
  const description =
    "Free count up timer to track elapsed time. Start, pause, record laps, reset, and go fullscreen for tasks, workouts, meetings, and experiments.";

  const url = "https://www.ilovetimers.com/count-up-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "count up timer",
        "elapsed time timer",
        "elapsed timer online",
        "timer that counts up",
        "count up stopwatch",
        "time since timer",
        "fullscreen count up timer",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.png",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    { tagName: "link", rel: "canonical", href: url },
    { name: "theme-color", content: "#ffffff" },
  ];
}

/* =========================================================
   LOADER
========================================================= */
export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClockUp(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

/* =========================================================
   COUNT UP TIMER CARD
========================================================= */
type Lap = { n: number; ms: number; splitMs: number };

function CountUpTimerCard() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  const [laps, setLaps] = useState<Lap[]>([]);
  const lastLapElapsedRef = useRef<number>(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

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
      const delta = now - (startRef.current ?? now);
      const next = baseRef.current + delta;
      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsedRef.current;
      return next;
    });
  }

  function resetAll() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
    lastLapElapsedRef.current = 0;
    stopRaf();
    startRef.current = null;
  }

  function lap() {
    if (!running) return;

    const nowElapsed = elapsedRef.current;
    const split = nowElapsed - lastLapElapsedRef.current;
    lastLapElapsedRef.current = nowElapsed;

    setLaps((prev) => [
      { n: prev.length + 1, ms: nowElapsed, splitMs: split },
      ...prev,
    ]);
  }

  const shownTime = msToClockUp(Math.ceil(elapsed / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, laps.length],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel = running ? "Running" : elapsed > 0 ? "Paused" : "Ready";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "l") {
      lap();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  // Show last few laps in fullscreen as a compact overlay.
  const fsLaps = laps.slice(0, 6);
  const hasLaps = fsLaps.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Count Up Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={lap}
              className="py-1 text-sm"
              disabled={!running}
            >
              Lap
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
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
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <span
            ref={timeTextRef}
            className={[
              "inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          <div className="mt-4 ilt-content-label">
            {statusLabel}
          </div>

          {/* Fullscreen lap overlay */}
          {isFs && (
            <div
              className={[
                "pointer-events-none absolute left-3 right-3 top-3",
                "sm:left-6 sm:right-6 sm:top-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
                    Laps
                  </div>

                  {!hasLaps ? (
                    <div className="ilt-helper-text font-semibold">
                      Press Lap (L) to record splits
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsLaps.map((l) => (
                        <div
                          key={l.n}
                          className="flex items-center justify-between gap-3 ilt-surface-card px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-[var(--ilt-text-primary)]">
                            Lap {l.n}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-extrabold text-[var(--ilt-text-primary)]">
                              {msToClockUp(l.ms)}
                            </div>
                            <div className="text-[11px] font-semibold text-[var(--ilt-text-secondary)]">
                              +{msToClockUp(l.splitMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right-side hint chip */}
                <div className="hidden sm:block ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                  L = Lap
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls bar (normal only) */}
        {!isFs && (
          <>
            <ControlGroup className="order-2">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={lap} disabled={!running}>
                Lap
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </ControlGroup>

            <SecondaryActionRow className="timer-history-actions order-3">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>
            <ShortcutHint className="timer-history-shortcut order-3">
              Shortcuts: Space start/pause / L lap / R reset / F fullscreen
            </ShortcutHint>
          </>
        )}
        {/* Laps (normal only) */}
        {!isFs && (
          <div className="timer-history-panel order-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">Laps</div>
              <div className="ilt-helper-text font-semibold">
                Most recent first / Split is time since previous lap
              </div>
            </div>

            {laps.length === 0 ? (
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                Press <strong>Lap</strong> (or <strong>L</strong>) while running
                to record splits.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {laps.slice(0, 12).map((l) => (
                  <UtilityResultRow key={l.n}>
                    <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                      Lap {l.n}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                        Total {msToClockUp(l.ms)}
                      </div>
                      <div className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
                        Split {msToClockUp(l.splitMs)}
                      </div>
                    </div>
                  </UtilityResultRow>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="ilt-helper-text text-center sm:text-sm">
            Tap time to start/pause / Space start/pause / L lap / R reset / F fullscreen
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function CountUpTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/count-up-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Count Up Timer",
        url,
        description:
          "Count up timer for elapsed time and time-since tracking with fullscreen and lap splits.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Count Up Timer",
            item: url,
          },
        ],
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
        display={<CountUpTimerCard />}
        title="Count Up Timer (Elapsed Time + Laps)"
        description="Track elapsed time with start, pause, laps, reset, and a big fullscreen display."
      />

      <SeoBand>
        <HowItWorks />
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}

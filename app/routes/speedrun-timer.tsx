// app/routes/speedrun-timer.tsx
import type { Route } from "./+types/speedrun-timer";
import { json } from "@remix-run/node";
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
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SecondaryActionRow,
  SeoBand,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Speedrun Timer (Splits, Fullscreen Stopwatch)";
  const description =
    "Time your speedruns with a simple split timer. Start, pause, record splits, and keep runs organized with a clean, fullscreen display.";

  const url = "https://www.ilovetimers.com/speedrun-timer";

  return [
    { title },
    { name: "description", content: description },
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

    { rel: "canonical", href: url },
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

function msToClockWithMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSec = Math.floor(t / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hundredths = Math.floor((t % 1000) / 10);
  const base = h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
  return `${base}.${pad2(hundredths)}`;
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


function uid() {
  // Prefer stable UUIDs when available (faster/less collision risk than Math.random)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
}

/* =========================================================
   SPEEDRUN TIMER CARD
========================================================= */
type Split = {
  id: string;
  name: string;
  totalMs: number;
  deltaMs: number;
};

function SpeedrunTimerTool() {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);

  const elapsedRef = useRef<number>(0);
  useEffect(() => {
    elapsedRef.current = elapsedMs;
  }, [elapsedMs]);

  const [splits, setSplits] = useState<Split[]>([]);
  const [nextSplitName, setNextSplitName] = useState("");

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

      // Keep the UI responsive and avoid any "slow load" feel:
      //  - update elapsed every frame while running
      //  - formatting happens in render, but it's cheap
      setElapsedMs(next);

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
    setElapsedMs(0);
    baseRef.current = 0;
    setSplits([]);
    setNextSplitName("");
    stopRaf();
    startRef.current = null;
  }

  function addSplit() {
    // For a speedrun timer, splits should be recordable while running.
    if (!running) return;

    const total = Math.max(0, Math.floor(elapsedRef.current));
    const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
    const delta = total - prevTotal;

    const name = (nextSplitName || `Split ${splits.length + 1}`).trim();

    setSplits((prev) => [
      ...prev,
      { id: uid(), name, totalMs: total, deltaMs: delta },
    ]);
    setNextSplitName("");
  }

  function undoSplit() {
    setSplits((prev) => prev.slice(0, -1));
  }

  function finishRun() {
    // End run should stop the clock. Optionally add a "Finish" split.
    const total = Math.max(0, Math.floor(elapsedRef.current));
    const last = splits[splits.length - 1];

    if (!last || Math.abs(last.totalMs - total) >= 20) {
      const prevTotal = splits.length ? splits[splits.length - 1].totalMs : 0;
      const delta = total - prevTotal;
      setSplits((prev) => [
        ...prev,
        { id: uid(), name: "Finish", totalMs: total, deltaMs: delta },
      ]);
    }

    setRunning(false);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      addSplit();
    } else if (k === "u") {
      undoSplit();
    } else if (k === "e") {
      finishRun();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const shownTime = useMemo(() => msToClockWithMs(elapsedMs), [elapsedMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, splits.length],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel = running ? "Running" : elapsedMs > 0 ? "Paused" : "Ready";

  // Fullscreen split overlay shows the most recent few (latest last in array)
  const fsSplits = splits.slice(-6).reverse();
  const hasSplits = fsSplits.length > 0;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Speedrun Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={addSplit}
              className="py-1 text-sm"
              disabled={!running}
            >
              Split
            </Btn>
            <Btn
              kind="ghost"
              onClick={finishRun}
              className="py-1 text-sm"
              disabled={!running && elapsedMs <= 0}
            >
              End
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
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            "border-[var(--ilt-border-subtle)] p-3 sm:p-6",
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

          {/* Fullscreen split overlay */}
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
                    Splits
                  </div>

                  {!hasSplits ? (
                    <div className="ilt-helper-text font-semibold">
                      Press Split (S) while running
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsSplits.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 ilt-surface-card px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-[var(--ilt-text-primary)]">
                            {s.name}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-extrabold text-[var(--ilt-text-primary)]">
                              {msToClockWithMs(s.totalMs)}
                            </div>
                            <div className="text-[11px] font-semibold text-[var(--ilt-text-secondary)]">
                              +{msToClockWithMs(s.deltaMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)] backdrop-blur">
                  S = Split
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls + Split name (normal only) */}
        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={addSplit} disabled={!running}>
                Split
              </Btn>
              <Btn
                kind="ghost"
                onClick={undoSplit}
                disabled={splits.length === 0}
              >
                Undo
              </Btn>
              <Btn
                kind="ghost"
                onClick={finishRun}
                disabled={!running && elapsedMs <= 0}
              >
                End run
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </ControlGroup>

            <SecondaryActionRow className="timer-history-actions">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <div className="mx-auto w-full max-w-5xl">
              <Field
                label="Next split name (optional)"
                value={nextSplitName}
                onChange={(e) => setNextSplitName(e.target.value)}
                placeholder={`Split ${splits.length + 1}`}
              />
            </div>
          </div>
        )}

        {/* Shortcuts chip + splits table (normal only) */}
        {!isFs && (
          <>
            <ShortcutHint className="timer-history-shortcut mt-4">
              <span className="ilt-keycap">Space</span> start/pause ·{" "}
              <span className="ilt-keycap">S</span> split ·{" "}
              <span className="ilt-keycap">U</span> undo ·{" "}
              <span className="ilt-keycap">E</span> end ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen
            </ShortcutHint>

            <div className="timer-history-panel mt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                  Splits
                </div>
                <div className="ilt-helper-text font-semibold">
                  Total is run time · Delta is time since previous split
                </div>
              </div>

              {splits.length === 0 ? (
                <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                  Start the timer, then press <strong>Split</strong> (or{" "}
                  <strong>S</strong>) to record segment times.
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--ilt-bg-subtle)]">
                      <tr className="text-xs uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                        <th className="px-3 py-2">Split</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {splits.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={idx % 2 ? "bg-[var(--ilt-bg-panel)]" : "bg-[var(--ilt-bg-subtle)]"}
                        >
                          <td className="px-3 py-2 font-semibold text-[var(--ilt-text-primary)]">
                            {s.name}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.totalMs)}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {msToClockWithMs(s.deltaMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Tap time to start/pause · Space start/pause · S split · U undo · E
              end · R reset · F fullscreen
            </div>
            <div className="ilt-helper-text font-semibold">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function SpeedrunTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  void nowISO;

  const url = "https://www.ilovetimers.com/speedrun-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Speedrun Timer",
        url,
        description:
          "A speedrun timer with splits. Start/pause, record split times, undo last split, end the run, and go fullscreen for a clean display.",
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
            name: "Speedrun Timer",
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
        display={<SpeedrunTimerTool />}
        title="Speedrun Timer"
        description="Track runs with start, pause, splits, undo, end, reset, CSV copy, keyboard shortcuts, and fullscreen."
      />
      <SeoBand>
        <ContentSection title="How this speedrun timer works">
          <p>
            This page is built for split-based practice runs. Start the run,
            record a split when each segment ends, undo the most recent split if
            it was accidental, and end or reset the run when you are finished.
            The active run clock stays visually dominant while split rows stay
            below it for quick scanning.
          </p>
          <p>
            Splits are useful when the run has named checkpoints: intro, level
            1, boss, final room, credits, or any route marker you want to review.
            The timer shows the total time at each split and the delta from the
            previous split, so you can see both the run clock and the segment
            length without doing manual subtraction.
          </p>
        </ContentSection>
        <ContentSection title="Practice examples and split setup">
          <p>
            For a short route practice session, name only the segments you care
            about and keep them short enough to read during play. For a full run,
            use the same split list across attempts so your comparison notes are
            consistent. For segment grinding, start with just a few checkpoints
            and reset often.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Practice run: start, split at each level clear, end the run, then
              copy the notes for a quick personal log.
            </li>
            <li>
              Route practice: use fewer split names so the active segment is
              easy to identify while you are playing.
            </li>
            <li>
              Mistake handling: use Undo for the latest accidental split instead
              of resetting the whole run.
            </li>
          </ul>
        </ContentSection>
        <ContentSection title="Copy, export, and interpretation notes">
          <p>
            Copy or export is best treated as a lightweight practice record. It
            can help you compare attempts outside the browser, save notes after a
            session, or paste split times into a personal log. It is not an
            official race, tournament, or leaderboard verification system.
          </p>
          <p>
            Browser timing can be affected by tab focus, device sleep, keyboard
            input latency, and background load. Keep the timer visible during a
            serious practice run, and use the same browser/device setup when you
            want attempts to be comparable.
          </p>
        </ContentSection>
        <ContentSection title="Related speed and elapsed-time tools">
          <p>
            For a simpler elapsed timer, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For a plain count-up display without split rows, try the{" "}
            <a className="ilt-content-link" href="/count-up-timer">
              count-up timer
            </a>
            . For solve practice, use the{" "}
            <a className="ilt-content-link" href="/speedcubing-timer">
              speedcubing timer
            </a>
            . For start-response practice, try the{" "}
            <a className="ilt-content-link" href="/reaction-time-test">
              reaction time test
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Speedrun timer FAQ">
          <h3>Can I use this for official submissions?</h3>
          <p>
            Use it for practice and personal notes. Follow the rules of the
            leaderboard, event, or community you are submitting to if official
            verification is required.
          </p>
          <h3>What is a split?</h3>
          <p>
            A split is a checkpoint recorded during the run. It captures the run
            total at that moment and the time since the previous split.
          </p>
          <h3>When should I use Undo?</h3>
          <p>
            Use Undo when the latest split was accidental or happened at the
            wrong checkpoint. It only fixes the most recent split, so use it
            right away.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

// app/routes/stopwatch.tsx
import type { Route } from "./+types/stopwatch";
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
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SeoBand,
  SecondaryActionRow,
  ShortcutHint,
  StatusChip,
  ToolFrame as Card,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/stopwatch/HowItWorks";
import Disclaimer from "~/clients/components/stopwatch/Disclaimer";
import FAQ from "~/clients/components/stopwatch/FAQ";
import KeyboardShortcuts from "~/clients/components/stopwatch/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/stopwatch/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Online Stopwatch (Laps, Fullscreen Stopwatch)";
  const description =
    "Use an online stopwatch with laps and a millisecond display. Start instantly, track splits, and keep elapsed time with a clean fullscreen view.";

  const url = "https://www.ilovetimers.com/stopwatch";

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
const pad3 = (n: number) => n.toString().padStart(3, "0");

function msToClockMs(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(t / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const msPart = t % 1000;

  return h > 0
    ? `${h}:${pad2(m)}:${pad2(s)}.${pad3(msPart)}`
    : `${m}:${pad2(s)}.${pad3(msPart)}`;
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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* =========================================================
   STOPWATCH CARD
========================================================= */
type Lap = { n: number; totalMs: number; splitMs: number };

function StopwatchCard() {
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
  const lastLapTotalRef = useRef<number>(0);

  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
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
    setCopied("idle");
    setRunning((r) => {
      const next = !r;
      baseRef.current = elapsedRef.current;
      return next;
    });
  }

  function resetAll() {
    setCopied("idle");
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
    lastLapTotalRef.current = 0;
    stopRaf();
    startRef.current = null;
  }

  function lap() {
    setCopied("idle");
    const nowElapsed = elapsedRef.current;
    if (nowElapsed <= 0) return;

    const split = nowElapsed - lastLapTotalRef.current;
    lastLapTotalRef.current = nowElapsed;

    setLaps((prev) => [
      { n: prev.length + 1, totalMs: nowElapsed, splitMs: split },
      ...prev,
    ]);
  }

  const copyText = useMemo(() => {
    const lines: string[] = [];
    lines.push("Lap,Split Time,Total Time");
    const ordered = [...laps].reverse(); // oldest -> newest for exporting
    for (let i = 0; i < ordered.length; i++) {
      const l = ordered[i]!;
      lines.push(`${l.n},${msToClockMs(l.splitMs)},${msToClockMs(l.totalMs)}`);
    }
    return lines.join("\n");
  }, [laps]);

  async function copyLaps() {
    if (laps.length === 0) return;
    const ok = await copyToClipboard(copyText);
    setCopied(ok ? "ok" : "fail");
    window.setTimeout(() => setCopied("idle"), 1200);
  }

  const shownTime = msToClockMs(elapsed);

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
    } else if (k === "c") {
      copyLaps();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (e.key === "Escape" && isFs) {
      void fullscreen.exit();
    }
  };

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
        title="Stopwatch"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={lap} className="py-1 text-sm">
              Lap
            </Btn>
            <Btn kind="ghost" onClick={copyLaps} className="py-1 text-sm">
              Copy
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-history-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
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

          <div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
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
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Laps
                  </div>

                  {!hasLaps ? (
                    <div className="text-xs font-semibold text-slate-600">
                      Press Lap (L) to record splits
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {fsLaps.map((l) => (
                        <div
                          key={l.n}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/85 px-2 py-1 backdrop-blur"
                        >
                          <div className="text-xs font-semibold text-slate-900">
                            Lap {l.n}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-extrabold text-slate-900">
                              {msToClockMs(l.totalMs)}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              +{msToClockMs(l.splitMs)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  L = Lap
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={lap} disabled={elapsed <= 0}>
                Lap
              </Btn>
            </ControlGroup>

            <SecondaryActionRow className="timer-history-actions">
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
              <Btn kind="ghost" onClick={copyLaps} disabled={laps.length === 0}>
                Copy laps
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-history-shortcut">
              Shortcuts: Space start/pause · L lap · C copy · R reset · F
              fullscreen
            </ShortcutHint>
          </div>
        )}

        {copied !== "idle" && !isFs && (
          <StatusChip className="mt-3 self-center tracking-normal">
            {copied === "ok" ? "Copied to clipboard." : "Could not copy."}
          </StatusChip>
        )}

        {/* Laps (normal only) */}
        {!isFs && (
          <div className="timer-history-panel mt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-extrabold text-slate-900">Laps</div>
              <div className="text-xs font-semibold text-slate-600">
                Most recent first · Split is time since previous lap
              </div>
            </div>

            {laps.length === 0 ? (
              <div className="mt-3 text-sm text-slate-700">
                Press <strong>Lap</strong> (or <strong>L</strong>) to record
                splits.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {laps.slice(0, 12).map((l) => (
                  <UtilityResultRow
                    key={l.n}
                  >
                    <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                      Lap {l.n}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
                        Total {msToClockMs(l.totalMs)}
                      </div>
                      <div className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
                        Split {msToClockMs(l.splitMs)}
                      </div>
                    </div>
                  </UtilityResultRow>
                ))}
              </div>
            )}

            {laps.length > 0 && (
              <ShortcutHint className="mt-3 text-left sm:text-left">
                Copy format: CSV (Lap, Split Time, Total Time)
              </ShortcutHint>
            )}
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · L lap · C copy · R
              reset · F fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
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
export default function StopwatchPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/stopwatch";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stopwatch",
        url,
        description:
          "Free online stopwatch with laps and a millisecond display. Fullscreen view, keyboard shortcuts, and copy for lap splits and totals.",
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
            name: "Stopwatch",
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
        display={<StopwatchCard />}
        title="Stopwatch (Milliseconds + Laps)"
        description="Start, pause, record laps, reset, copy CSV, and use a big fullscreen display."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need a countdown that starts from a set duration and shows
            milliseconds? Use the{" "}
            <a className="ilt-content-link" href="/millisecond-timer">
              millisecond timer
            </a>
            . This stopwatch is for elapsed time; the millisecond timer is for
            counting down with minute, second, and millisecond inputs.
            For a page that puts millisecond precision first, use the{" "}
            <a className="ilt-content-link" href="/stopwatch-with-milliseconds">
              stopwatch with milliseconds
            </a>
            .
          </p>
        </ContentSection>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
        <Disclaimer />
      </SeoBand>
    </PageShell>
  );
}

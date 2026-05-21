// app/routes/countdown-timer.tsx
import type { Route } from "./+types/countdown-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  useMemo,
} from "react";
import {
  Button,
  ControlGroup,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  ToolFrame,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/countdown-timer/HowItWorks";
import Disclaimer from "~/clients/components/countdown-timer/Disclaimer";
import FAQ from "~/clients/components/countdown-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/countdown-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/countdown-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Countdown Timer (Minutes + Seconds, Fullscreen)";
  const description =
    "Free countdown timer. Set minutes and seconds, start or pause, add time, reset, and go fullscreen for workouts, cooking, studying, meetings, and tasks.";

  const url = "https://www.ilovetimers.com/countdown-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "countdown timer",
        "count down timer",
        "timer minutes seconds",
        "online countdown timer",
        "fullscreen countdown timer",
        "countdown clock",
        "timer with add time",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://www.ilovetimers.com/og-image.jpg",
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

function msToClockDown(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
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
   COUNTDOWN TIMER CARD
========================================================= */
function CountUpTimerCard() {
  const [running, setRunning] = useState(false);

  // Duration to count down from (ms)
  const [totalMs, setTotalMs] = useState<number>(5 * 60 * 1000);
  // Remaining time (ms)
  const [remaining, setRemaining] = useState<number>(5 * 60 * 1000);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const totalMsRef = useRef<number>(totalMs);
  useEffect(() => {
    totalMsRef.current = totalMs;
  }, [totalMs]);

  const runningRef = useRef<boolean>(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const [minsInput, setMinsInput] = useState<string>("5");
  const [secsInput, setSecsInput] = useState<string>("0");

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    const now = performance.now();
    const currentRemaining = remainingRef.current;
    endRef.current = now + currentRemaining;

    const tick = () => {
      const n = performance.now();
      const end = endRef.current ?? n;
      const nextRemaining = Math.max(0, end - n);

      setRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        setRunning(false);
        stopRaf();
        endRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const statusLabel =
    remaining <= 0 ? "Finished" : running ? "Running" : "Ready";

  function syncInputsFromMs(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    setMinsInput(String(m));
    setSecsInput(String(s));
  }

  function applyInputsToTotal() {
    const mRaw = minsInput.trim() === "" ? 0 : Number(minsInput);
    const sRaw = secsInput.trim() === "" ? 0 : Number(secsInput);

    const m = clampInt(mRaw, 0, 9999);
    const s = clampInt(sRaw, 0, 59);

    const nextTotal = (m * 60 + s) * 1000;

    setMinsInput(String(m));
    setSecsInput(String(s));

    setTotalMs(nextTotal);

    // Only re-seed remaining when not running.
    if (!runningRef.current) {
      setRemaining(nextTotal);
    }
  }

  function startPause() {
    // If currently finished, restart from total first.
    if (!runningRef.current && remainingRef.current <= 0) {
      const seed = totalMsRef.current;
      setRemaining(seed);
      remainingRef.current = seed;
    }

    // If there's no time set, do nothing.
    if (!runningRef.current && remainingRef.current <= 0) return;

    setRunning((r) => !r);
  }

  function resetAll() {
    setRunning(false);
    stopRaf();
    endRef.current = null;
    const seed = totalMsRef.current;
    setRemaining(seed);
    remainingRef.current = seed;
  }

  function addSeconds(sec: number) {
    const deltaMs = sec * 1000;

    // Update total (for the "configured duration") and inputs, even while running.
    const nextTotal = Math.max(0, totalMsRef.current + deltaMs);
    setTotalMs(nextTotal);
    totalMsRef.current = nextTotal;
    syncInputsFromMs(nextTotal);

    // Update remaining and keep RAF math consistent.
    setRemaining((prev) => {
      const nextRemaining = Math.max(0, prev + deltaMs);
      remainingRef.current = nextRemaining;

      // Critical fix: shift the end time so the next RAF tick doesn't undo the change.
      if (runningRef.current && endRef.current != null) {
        endRef.current = endRef.current + deltaMs;
      }

      return nextRemaining;
    });
  }

  const shownTime = useMemo(() => {
    // Round up to nearest second so it does not show 0:00 early.
    const displayMs = Math.ceil(remaining / 1000) * 1000;
    return msToClockDown(displayMs);
  }, [remaining]);

  const fitFontPx = useFitDisplayText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
    initialScale: 0.92,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetAll();
    } else if (k === "a") {
      addSeconds(60);
    } else if (k === "s") {
      addSeconds(-10);
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  return (
    <ToolFrame
      frameRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "px-[var(--ilt-page-x)] py-2 sm:py-4"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Countdown Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={startPause}>
              {running ? "Pause" : remaining <= 0 ? "Restart" : "Start"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addSeconds(60)}
            >
              +1:00
            </Button>
            <Button variant="secondary" size="sm" onClick={resetAll}>
              Reset
            </Button>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Controls bar (normal only) */}
        {!isFs && (
          <div className="order-2 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <ControlGroup className="max-w-none justify-center sm:justify-start">
                <Button variant="primary" onClick={startPause}>
                  {running ? "Pause" : remaining <= 0 ? "Restart" : "Start"}
                </Button>
                <Button variant="secondary" onClick={resetAll}>
                  Reset
                </Button>
                <Button variant="secondary" onClick={() => addSeconds(60)}>
                  +1:00
                </Button>
                <Button variant="secondary" onClick={() => addSeconds(-10)}>
                  -0:10
                </Button>
              </ControlGroup>

              <ShortcutHint className="w-auto max-w-none sm:ml-auto">
                Shortcuts: Space start/pause · R reset · A +1:00 · S -0:10 · F
                fullscreen
              </ShortcutHint>
            </div>

            <SettingGroup
              title="Set countdown"
              description="Minutes and seconds. Seconds are clamped to 0-59."
            >
              <SettingRow className="sm:grid-cols-[minmax(0,7rem)_minmax(0,6rem)_auto] lg:grid-cols-[minmax(0,7rem)_minmax(0,6rem)_auto]">
                  <Field
                    label="Minutes"
                    value={minsInput}
                    onChange={(e) => setMinsInput(e.target.value)}
                    onBlur={applyInputsToTotal}
                    inputMode="numeric"
                    disabled={running}
                  />

                  <Field
                    label="Seconds"
                    hint="0-59"
                    value={secsInput}
                    onChange={(e) => setSecsInput(e.target.value)}
                    onBlur={applyInputsToTotal}
                    inputMode="numeric"
                    disabled={running}
                  />

                  <Button
                    variant="secondary"
                    onClick={applyInputsToTotal}
                    disabled={running}
                  >
                    Apply
                  </Button>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Button
                variant="secondary"
                onClick={() => void fullscreen.toggle()}
              >
                Fullscreen
              </Button>
            </SecondaryActionRow>
          </div>
        )}

        {/* Display (no buttons inside) */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface mt-4 flex flex-col items-center justify-center text-slate-950",
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
            Countdown · {statusLabel}
          </div>

          {!isFs && (
            <div className="mt-3 text-xs font-semibold text-slate-600">
              Tip: Start, then use +1:00 or -0:10 while it runs.
            </div>
          )}
        </DisplayStage>

        {/* Fullscreen bottom controls (no duplicate buttons) */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · A +1:00 · S -0:10 ·
              R reset · F fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function CountDownTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/countdown-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Countdown Timer",
        url,
        description:
          "Countdown timer with minutes and seconds, start/pause, add time, reset, and fullscreen mode.",
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
            name: "Countdown Timer",
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
        title="Countdown Timer (Minutes + Seconds)"
        description="Set a duration, start or pause, add time, reset, and use a big fullscreen display."
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

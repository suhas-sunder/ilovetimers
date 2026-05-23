// app/routes/break-timer.tsx
import type { Route } from "./+types/break-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ControlGroup,
  ContentSection,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Break Timer (Fullscreen Countdown + Quick Presets)";
  const description =
    "Free break timer for work or study. Start a big fullscreen countdown with quick presets, custom minutes, optional sound, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/break-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "break timer",
        "work break timer",
        "rest timer",
        "study break timer",
        "short break timer",
        "fullscreen break timer",
        "countdown timer for breaks",
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
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const pad2 = (n: number) => n.toString().padStart(2, "0");

function msToClock(ms: number) {
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


/* WebAudio beep */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 120, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = gain;

      o.connect(g);
      g.connect(ctx.destination);

      o.start();
      window.setTimeout(() => {
        o.stop();
        o.disconnect();
        g.disconnect();
      }, duration);
    } catch {
      // ignore
    }
  }, []);
}


/* =========================================================
   BREAK TIMER CARD
========================================================= */
function BreakTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(() => [1, 2, 3, 5, 7, 10, 12, 15, 20], []);

  const [minutes, setMinutes] = useState(5);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);
  const [loop, setLoop] = useState(false);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetTimer() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  // If minutes changes, reset cleanly
  useEffect(() => {
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    setRemaining(minutes * 60 * 1000);
    endRef.current = performance.now() + minutes * 60 * 1000;
    setRunning(true);
  }

  function resume() {
    stopRaf();
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + remaining;
    setRunning(true);
  }

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    if (!hasStartedRef.current) {
      startNew();
      return;
    }

    if (remaining <= 0) {
      startNew();
      return;
    }

    resume();
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 90, 0.07);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (sound) {
          beep(660, 160, 0.1);
          window.setTimeout(() => beep(880, 160, 0.1), 220);
        }

        if (loop) {
          hasStartedRef.current = true;
          setRemaining(minutes * 60 * 1000);
          endRef.current = performance.now() + minutes * 60 * 1000;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        hasStartedRef.current = false;
        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, minutes, sound, finalBeeps, loop, beep]);

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(minutes * 60 * 1000);

  const urgent = running && remaining > 0 && remaining <= 10_000;

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : "Break running";

  const displayTone = urgent
    ? "border-amber-200 bg-amber-50 text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      resetTimer();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "l") {
      setLoop((x) => !x);
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Break Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : hasStartedRef.current ? "Resume" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={resetTimer} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "timer-display-surface flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
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
          <div className="order-1 text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "pointer-events-none order-2 mt-2 inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {running || hasStartedRef.current ? shownTime : readyTime}
          </span>

        </DisplayStage>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : hasStartedRef.current ? "Resume" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={resetTimer}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup
              title="Break presets"
              description="Pick a common break length or set a custom duration."
            >
              {presetsMin.map((m) => (
                <Chip key={m} active={m === minutes} onClick={() => setMinutes(m)} disabled={running}>
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Break settings"
              description="Common breaks: 1 to 3 minutes for a quick reset, 5 minutes for a short break, and 10 to 15 minutes for a longer break."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                <Field
                  label="Break length (minutes)"
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                />
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <Toggle checked={loop} onCheckedChange={setLoop} label="Loop" />
                  <Toggle checked={sound} onCheckedChange={setSound} label="Sound" />
                  <Toggle
                    checked={finalBeeps}
                    onCheckedChange={setFinalBeeps}
                    disabled={!sound}
                    label="Final beeps"
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen / S sound / L loop
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause / Space start/pause / R reset / F fullscreen / S sound / L loop
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
export default function BreakTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/break-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Break Timer",
        url,
        description:
          "Fullscreen break timer for quick work breaks and rest periods. Big countdown, short presets, optional sound, and keyboard shortcuts.",
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
            name: "Break Timer",
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
        display={<BreakTimerCard />}
        title="Break Timer"
        description="Start a calm break countdown with quick presets, custom duration, optional sound, and fullscreen mode."
      />

      <SeoBand>
        <ContentSection title="How this break timer works">
          <p>
            Break Timer is a short countdown for stepping away and coming back
            at the time you choose. Pick a preset, enter custom minutes, start,
            pause, or reset, and keep the remaining time visible while the
            controls stay below the countdown.
          </p>
          <p>
            Reset returns the timer to the currently selected duration. If loop
            is enabled, the same break length can repeat; if sound or final
            beeps are enabled, browser audio settings still apply.
          </p>
        </ContentSection>
        <ContentSection title="When to use a break timer">
          <p>
            Use it for desk breaks, screen breaks, Pomodoro breaks, eye-rest
            pauses, between study sessions, short meeting breaks, coffee
            refills, cleanup pauses, or a simple pause between tasks. It is a
            timing tool, not medical or wellness advice.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Start 2 minutes after a quick task batch.</li>
            <li>Use 5 minutes between study topics or focus blocks.</li>
            <li>Use 10 or 15 minutes for a longer pause between meetings.</li>
          </ul>
        </ContentSection>
        <ContentSection title="Quiet and related break tools">
          <p>
            For work and break cycles, use the{" "}
            <a className="ilt-content-link" href="/pomodoro-timer">
              Pomodoro timer
            </a>
            . For direct short break countdowns, use the{" "}
            <a className="ilt-content-link" href="/5-minute-timer">
              5 minute timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/10-minute-timer">
              10 minute timer
            </a>
            . For a single work block before the break, use the{" "}
            <a className="ilt-content-link" href="/focus-session-timer">
              focus session timer
            </a>
            . For no-sound timing, use the{" "}
            <a className="ilt-content-link" href="/silent-timer">
              silent timer
            </a>
            . For workout rest periods, use the{" "}
            <a className="ilt-content-link" href="/rest-timer">
              rest timer
            </a>
            . For movement breaks, try the{" "}
            <a className="ilt-content-link" href="/stretch-timer">
              stretch timer
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

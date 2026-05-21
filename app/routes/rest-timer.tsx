// app/routes/rest-timer.tsx
import type { Route } from "./+types/rest-timer";
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
  ControlGroup,
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
  const title = "Rest Timer (Between Sets, Fullscreen Workout Timer)";
  const description =
    "Time your rest between sets with a clear workout rest timer. Big, easy-to-read countdown built for lifting, circuits, and training sessions.";

  const url = "https://www.ilovetimers.com/rest-timer";

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
   REST TIMER CARD
========================================================= */
function RestTimerCard() {
  const beep = useBeep();

  // Between-sets friendly defaults
  const presetsSec = useMemo(
    () => [15, 30, 45, 60, 90, 120, 180, 240, 300],
    [],
  );

  const [seconds, setSeconds] = useState(90);
  const [shownRemaining, setShownRemaining] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [autoRestart, setAutoRestart] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const loopRef = useRef(false);

  const secondsRef = useRef(seconds);
  const soundRef = useRef(sound);
  const beepsRef = useRef(finalCountdownBeeps);

  const shownMsRef = useRef<number>(seconds * 1000);
  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    loopRef.current = autoRestart;
  }, [autoRestart]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    beepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Reset when duration changes
  useEffect(() => {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;

    const next = seconds * 1000;
    shownMsRef.current = next;
    setShownRemaining(next);
    setRunning(false);
  }, [seconds]);

  // Main ticking loop
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + shownMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rawRem = Math.max(0, (endRef.current ?? now) - now);

      // Only update React state when the displayed second changes (snappy, low re-render).
      const shownMs = Math.ceil(rawRem / 1000) * 1000;
      if (shownMs !== shownMsRef.current) {
        shownMsRef.current = shownMs;
        setShownRemaining(shownMs);
      }

      // Final countdown beeps (5..1)
      if (
        soundRef.current &&
        beepsRef.current &&
        rawRem > 0 &&
        rawRem <= 5_000
      ) {
        const secLeft = Math.ceil(rawRem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rawRem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;

        if (soundRef.current) beep(660, 240);

        if (loopRef.current) {
          const next = secondsRef.current * 1000;
          shownMsRef.current = next;
          setShownRemaining(next);
          endRef.current = performance.now() + next;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
    // beep is stable (useCallback), refs handle sound/beeps/seconds
  }, [running, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    stopRaf();
    endRef.current = null;
    lastBeepSecondRef.current = null;

    const next = seconds * 1000;
    shownMsRef.current = next;
    setShownRemaining(next);
    setRunning(false);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        // start from current shown remaining
        endRef.current = performance.now() + shownMsRef.current;
      } else {
        // pause: freeze remaining (shownMsRef already holds it)
        endRef.current = null;
      }
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function setPreset(sec: number) {
    setSeconds(sec);
  }

  const statusLabel = running
    ? "Running"
    : shownRemaining > 0 && shownRemaining < seconds * 1000
      ? "Paused"
      : "Ready";

  const urgent = running && shownRemaining > 0 && shownRemaining <= 10_000;
  const canEditDuration = !running;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownRemaining, isFs, running, urgent],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const shownTime = msToClock(shownRemaining);

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Rest Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
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
            "timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            urgent ? "ring-2 ring-amber-300/70" : "",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "tracking-wide sm:tracking-widest" : "",
              urgent ? "text-amber-700" : "text-slate-950",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>

          {!isFs && (
            <div className="mt-3 text-xs text-slate-600">
              {autoRestart ? "Loop on · " : ""}
              {sound ? "Sound on" : "Sound off"}
              {sound && finalCountdownBeeps ? " · Final beeps on" : ""}
            </div>
          )}
        </DisplayStage>

        {/* Controls (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Presets">
              {presetsSec.map((sec) => (
                <Chip
                  key={sec}
                  active={sec === seconds}
                  onClick={() => setPreset(sec)}
                  disabled={!canEditDuration}
                >
                  {sec < 60 ? String(sec) + "s" : String(Math.round(sec / 60)) + "m"}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field
                  label="Custom seconds"
                  type="number"
                  min={5}
                  max={3600}
                  value={seconds}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setSeconds(clamp(Number(e.target.value || 5), 5, 3600))
                  }
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle checked={sound} onCheckedChange={setSound} label="Sound" />
                  <Toggle
                    checked={finalCountdownBeeps}
                    onCheckedChange={setFinalCountdownBeeps}
                    disabled={!sound}
                    label="Final beeps"
                  />
                  <Toggle checked={autoRestart} onCheckedChange={setAutoRestart} label="Loop" />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
              {autoRestart ? " · Loop on" : ""}
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
export default function RestTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/rest-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Rest Timer",
        url,
        description:
          "Fullscreen rest timer for between sets. Big countdown, fast presets, optional sound, and keyboard shortcuts.",
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
            name: "Rest Timer",
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
        display={<RestTimerCard />}
        title="Rest Timer"
        description="Time rest periods between sets with a large countdown and simple workout-focused controls."
      />

      <SeoBand title="How this timer works">
        <p>
          Rest Timer is built for short repeatable recovery periods between
          sets, rounds, or drills. Pick a seconds-based preset or enter a custom
          rest length, then keep the countdown visible while the next effort is
          being prepared.
        </p>
        <h3>When to use it</h3>
        <p>
          Use it between lifting sets, circuit stations, boxing rounds, mobility
          drills, or short practice attempts. The timer can keep rest intervals
          consistent, but it does not determine safe recovery length or training
          intensity.
        </p>
        <h3>Useful settings</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Seconds presets are useful for common 30, 45, 60, and 90 second rest
            periods.
          </li>
          <li>
            Optional sound can mark the end of a rest period when you are not
            looking at the screen.
          </li>
          <li>
            Auto-restart can repeat the same rest interval for simple training
            flows.
          </li>
        </ul>
        <h3>Practical examples</h3>
        <p>
          Set 60 seconds between strength sets, 30 seconds between short drills,
          or 90 seconds between heavier attempts. Keep the timer visible while
          setting up the next set so the rest interval does not stretch without
          noticing.
        </p>
        <h3>Related tools</h3>
        <p>
          For full work/rest structure, use the{" "}
          <a className="ilt-content-link" href="/workout-timer">
            workout timer
          </a>
          . For round-based sessions, try the{" "}
          <a className="ilt-content-link" href="/round-timer">
            round timer
          </a>
          . For movement breaks, use the{" "}
          <a className="ilt-content-link" href="/stretch-timer">
            stretch timer
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}

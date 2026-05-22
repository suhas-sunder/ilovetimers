// app/routes/presentation-timer.tsx
import type { Route } from "./+types/presentation-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import {
  Button as Btn,
  ContentSection,
  ControlGroup,
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
  Toggle,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Presentation Timer (Fullscreen Countdown for Talks)";
  const description =
    "Keep talks and presentations on time with a clear fullscreen countdown. Big digits designed to stay readable on projectors and in classrooms.";

  const url = "https://www.ilovetimers.com/presentation-timer";

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

// WebAudio beep
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160) => {
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
      g.gain.value = 0.1;

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
   PRESENTATION TIMER CARD
========================================================= */
function PresentationTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }, [minutes]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const durationMs = minutes * 60 * 1000;
  const statusLabel = running
    ? "Running"
    : remaining <= 0
      ? "Done"
      : remaining < durationMs
        ? "Paused"
        : "Ready";
  const canEditDuration = !running;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, urgent, running, minutes],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 64 : 72,
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

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Presentation Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>

            <div className="hidden sm:flex items-center gap-2">
              <Toggle
                label="Sound"
                checked={sound}
                onCheckedChange={(v) => {
                  setSound(v);
                  if (!v) setFinalCountdownBeeps(false);
                }}
              />
              <Toggle
                label="Final beeps"
                checked={finalCountdownBeeps}
                disabled={!sound}
                onCheckedChange={(v) => setFinalCountdownBeeps(v)}
              />
            </div>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Controls (normal only) */}
        {!isFs && (
          <div className="order-2 mt-4 space-y-5">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Presentation duration">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  onClick={() => setPreset(m)}
                  disabled={!canEditDuration}
                  active={m === minutes}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Presentation settings"
              description="Adjust the time limit and optional sound cues."
            >
              <SettingRow className="lg:grid-cols-3">
                <Field
                  label="Custom minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                />

                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={(v) => {
                    setSound(v);
                    if (!v) setFinalCountdownBeeps(false);
                  }}
                />

                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  disabled={!sound}
                  onCheckedChange={(v) => setFinalCountdownBeeps(v)}
                />
              </SettingRow>
            </SettingGroup>

            <div className="hidden">
              Shortcuts: Space start/pause · R reset · F fullscreen
            </div>
            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause / R reset / F fullscreen
            </ShortcutHint>
          </div>
        )}

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            urgent ? "border-amber-300" : "border-slate-200",
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
          <div
            className={[
              "text-xs font-extrabold uppercase tracking-widest",
              urgent ? "text-slate-950" : "text-slate-700",
            ].join(" ")}
          >
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              urgent ? "text-slate-950" : "text-slate-900",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              willChange: "font-size",
            }}
          >
            {shownTime}
          </span>

          {/* Fullscreen hint chips */}
          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Time limit
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {minutes} minute{minutes === 1 ? "" : "s"}
                    {urgent ? " · Final seconds" : ""}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    Space = Start/Pause
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom bar */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              Sound {sound ? "On" : "Off"}
              {sound
                ? ` · Final beeps ${finalCountdownBeeps ? "On" : "Off"}`
                : ""}
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
export default function PresentationTimerPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/presentation-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Presentation Timer",
        url,
        description:
          "Keep talks and presentations on time with a clear fullscreen countdown. Big digits designed to stay readable on projectors and in classrooms.",
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
            name: "Presentation Timer",
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
        display={<PresentationTimerCard />}
        title="Presentation Timer (Fullscreen Countdown)"
        description="Keep talks, pitches, and meeting segments on time with a large countdown, presets, optional sound, and fullscreen mode."
      />

      <SeoBand>
        <ContentSection title="How this presentation timer works">
          <p>
            Presentation Timer is a speaker countdown. Choose a talk length,
            press Start, and keep the remaining time visible while you rehearse
            or present. The tool keeps the timer display first, then places
            presets, custom minutes, sound, final beeps, and fullscreen controls
            below it.
          </p>
          <p>
            It shows remaining time, not timezone information or an agenda
            document. That makes it useful as a simple confidence monitor on a
            laptop, podium screen, second monitor, or projected room display.
          </p>
        </ContentSection>

        <ContentSection title="When to use it">
          <p>
            Use it for talks, lectures, workshops, demos, pitches, conference
            sessions, student presentations, and rehearsal runs. The large
            display helps a speaker glance at the remaining time without
            turning the page into a control panel.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Presets cover common short talks, classroom presentations, demos,
              and longer sessions.
            </li>
            <li>
              Custom minutes handle unusual time slots, rehearsal targets, or
              short Q&A buffers.
            </li>
            <li>
              Final beeps can mark the last five seconds when Sound is enabled.
            </li>
            <li>
              Fullscreen keeps the display readable for rehearsal rooms,
              podiums, projectors, and shared screens.
            </li>
          </ul>
        </ContentSection>

        <ContentSection title="Limitations and room setup notes">
          <p>
            This is a browser-based presentation timer, not professional AV
            timing equipment and not an official event compliance tool. Keep the
            page visible if you rely on the display, test sound before the
            session if you plan to use beeps, and use the venue's timing rules
            when a talk has formal requirements.
          </p>
        </ContentSection>

        <ContentSection title="Related tools">
          <p>
            For structured agenda timing, use the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>
            . For a speaker-focused countdown with warning thresholds, use the{" "}
            <a className="ilt-content-link" href="/speech-timer">
              speech timer
            </a>
            . For a date-based launch or event, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For the simplest projected countdown, try the{" "}
            <a className="ilt-content-link" href="/fullscreen-timer">
              fullscreen timer
            </a>
            . For student-facing classroom activities, use the{" "}
            <a className="ilt-content-link" href="/classroom-timer">
              classroom timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Presentation timer FAQ">
          <h3>Can I use this as a rehearsal timer?</h3>
          <p>
            Yes. Pick the time limit you expect for the real talk, run through
            the material, and use the remaining-time display to learn where you
            tend to speed up or run long.
          </p>
          <h3>Does fullscreen remove distractions?</h3>
          <p>
            Fullscreen focuses the view on the timer controls and large digits.
            Active fullscreen views do not include ad placements.
          </p>
          <h3>Is this a meeting timer?</h3>
          <p>
            It can time a meeting segment, but the{" "}
            <a className="ilt-content-link" href="/meeting-timer">
              meeting timer
            </a>{" "}
            is better when the main job is agenda timeboxing instead of speaker
            timing.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

// app/routes/classroom-timer.tsx
import type { Route } from "./+types/classroom-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
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
import HowItWorks from "~/clients/components/classroom-timer/HowItWorks";
import KeyboardShortcuts from "~/clients/components/classroom-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/classroom-timer/PopularUseCases";
import FAQ from "~/clients/components/classroom-timer/FAQ";
import Disclaimer from "~/clients/components/classroom-timer/Disclaimer";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Classroom Timer (Fullscreen Countdown for Smartboards & Projectors)";
  const description =
    "Free classroom timer for teachers. Big fullscreen countdown for smartboards and projectors with quick presets, custom minutes, optional sound, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/classroom-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "classroom timer",
        "timer for teachers",
        "smartboard timer",
        "interactive whiteboard timer",
        "classroom countdown timer",
        "projector timer",
        "teacher timer",
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

  return useCallback((freq = 880, duration = 140, gain = 0.1) => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = (ctxRef.current ??= new Ctx());

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
   CLASSROOM TIMER CARD
========================================================= */
function ClassroomTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 30, 45, 60],
    [],
  );

  const [label, setLabel] = useState("Classroom Timer");
  const [minutes, setMinutes] = useState(5);

  const baseMs = minutes * 60 * 1000;

  const [remaining, setRemaining] = useState(baseMs);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);
  const [endChime, setEndChime] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Layout stability: lock the time line to a fixed character width so digits don't reflow.
  // 1) tabular-nums: monospaced digits
  // 2) minWidth on the time line: reserve max width (H:MM:SS -> 7 chars, no-hours -> 4 chars)
  const timeMinWidthCh = useMemo(() => (minutes >= 60 ? 7 : 5), [minutes]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemaining(baseMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
    stopRaf();
  }

  useEffect(() => {
    setRunning(false);
    setRemaining(baseMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    endedRef.current = false;
    stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    const startMs = remaining <= 0 ? baseMs : remaining;

    endedRef.current = false;
    lastBeepSecondRef.current = null;
    endRef.current = performance.now() + Math.max(0, startMs);

    if (remaining <= 0) setRemaining(startMs);
    setRunning(true);
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  function addSeconds(deltaSeconds: number) {
    const delta = deltaSeconds * 1000;

    setRemaining((r) => {
      const next = clamp(r + delta, 0, 3 * 60 * 60 * 1000);

      if (running && endRef.current) {
        endRef.current = endRef.current + delta;
      }

      if (delta > 0 && next > 0) endedRef.current = false;

      return next;
    });
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

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110, 0.07);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        stopRaf();

        if (!endedRef.current) {
          endedRef.current = true;
          if (sound && endChime) {
            beep(660, 180, 0.1);
            window.setTimeout(() => beep(990, 220, 0.1), 220);
          } else if (sound && !endChime) {
            beep(660, 220, 0.1);
          }
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, endChime, beep]);

  const displayMs =
    running || remaining <= 0 || remaining !== baseMs ? remaining : baseMs;
  const shownTime = msToClock(Math.ceil(displayMs / 1000) * 1000);

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const finished = !running && remaining <= 0;

  const statusLabel = finished ? "Time is up" : running ? "Running" : "Ready";

  const displayTone = finished
    ? "border-amber-300 bg-amber-50 text-slate-950"
    : urgent
      ? "border-amber-300 bg-amber-50 text-slate-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  // IMPORTANT: don't include shownTime in deps to prevent font-size recalculation on every second.
  // The text width is stabilized via tabular-nums + minWidth, so it can stay steady.
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [statusLabel, isFs, running, finished, minutes],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 80,
    initialScale: isFs ? 1 : 1.34,
    initialMobileScale: isFs ? 1 : 1.34,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "+") {
      addSeconds(60);
    } else if (k === "-") {
      addSeconds(-60);
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
        title="Classroom Timer"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-2 sm:flex">
            <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
            <Toggle
              label="Final beeps"
              checked={finalCountdownBeeps}
              onCheckedChange={setFinalCountdownBeeps}
              disabled={!sound}
            />
            <Toggle
              label="End chime"
              checked={endChime}
              onCheckedChange={setEndChime}
              disabled={!sound}
            />
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
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
          onClick={(e) => {
            if (isFs && e.target === e.currentTarget) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click empty space to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {label.trim() ? label.trim() : "Classroom Timer"}
          </div>

          <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-600">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center tabular-nums",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              // Reserve a stable width so the fit algorithm and layout don't jump as digits change.
              minWidth: `${timeMinWidthCh}ch`,
            }}
          >
            {shownTime}
          </span>

        </div>

        {!isFs && (
          <div className="order-2 mt-5 flex flex-col gap-5">
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Classroom presets">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setPreset(m)}
                  disabled={running}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Classroom settings"
              description="Set the timer label and classroom sound cues before starting."
            >
              <SettingRow>
                <Field
                  label="Minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                />

                <Field
                  label="Label (optional)"
                  type="text"
                  value={label}
                  disabled={running}
                  onChange={(e) => setLabel(e.target.value.slice(0, 40))}
                  placeholder="Transition, Quiz, Centers..."
                />
              </SettingRow>

              <SettingRow>
                <Toggle
                  label="Sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
                <Toggle
                  label="End chime"
                  checked={endChime}
                  onCheckedChange={setEndChime}
                  disabled={!sound}
                />
              </SettingRow>
            </SettingGroup>

            <div className="mx-auto w-full max-w-3xl">
              <div className="ilt-content-label text-center sm:text-left">
                Quick adjust
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Btn kind="ghost" onClick={() => addSeconds(-60)}>
                  -1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(60)}>
                  +1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(300)}>
                  +5 min
                </Btn>
              </div>
            </div>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={fullscreen.enter}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Space start/pause / R reset / F fullscreen / + add 1 min / - subtract 1 min
            </ShortcutHint>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setMinutes(m)}
                  disabled={running}
                >
                  {m}m
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind="ghost" onClick={() => addSeconds(-60)}>
                  -1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(60)}>
                  +1 min
                </Btn>
                <Btn kind="ghost" onClick={() => addSeconds(300)}>
                  +5 min
                </Btn>
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap empty space to start/pause · Space · R · + · -
              </div>
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
export default function ClassroomTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  void nowISO;

  const url = "https://www.ilovetimers.com/classroom-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Classroom Timer",
        url,
        description:
          "Fullscreen classroom timer for teachers and smartboards. Big countdown, quick presets, optional sound, and keyboard shortcuts.",
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
            name: "Classroom Timer",
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
        display={<ClassroomTimerCard />}
        title="Classroom Timer (Fullscreen Countdown)"
        description="Big, readable countdown for smartboards and projectors with presets, custom labels, sound cues, and keyboard shortcuts."
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

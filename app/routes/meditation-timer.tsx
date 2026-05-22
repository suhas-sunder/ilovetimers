// app/routes/meditation-timer.tsx
import type { Route } from "./+types/meditation-timer";
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
import HowItWorks from "~/clients/components/meditation-timer/HowItWorks";
import Disclaimer from "~/clients/components/meditation-timer/Disclaimer";
import FAQ from "~/clients/components/meditation-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/meditation-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/meditation-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Meditation Timer (Breathing & Yoga, Fullscreen)";
  const description =
    "Set a quiet meditation countdown for breathing practice, yoga holds, or reflection time with fullscreen display and optional chimes.";

  const url = "https://www.ilovetimers.com/meditation-timer";

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


// WebAudio beep (soft)
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return useCallback((freq = 880, duration = 160, gain = 0.08) => {
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
   MEDITATION TIMER CARD
========================================================= */
type Preset = { label: string; seconds: number; hint?: string };

function MeditationTimerCard() {
  const beep = useBeep();

  const presets: Preset[] = useMemo(
    () => [
      { label: "1m", seconds: 60, hint: "Quick reset" },
      { label: "2m", seconds: 120, hint: "Short breathing" },
      { label: "3m", seconds: 180, hint: "Mini session" },
      { label: "5m", seconds: 300, hint: "Starter meditation" },
      { label: "7m", seconds: 420, hint: "Short session" },
      { label: "10m", seconds: 600, hint: "Common daily" },
      { label: "12m", seconds: 720, hint: "Yoga breathwork" },
      { label: "15m", seconds: 900, hint: "Longer sit" },
      { label: "20m", seconds: 1200, hint: "Classic sit length" },
      { label: "30m", seconds: 1800, hint: "Deep session" },
      { label: "45m", seconds: 2700, hint: "Extended practice" },
      { label: "60m", seconds: 3600, hint: "Long sit or yoga" },
    ],
    [],
  );

  const breathingPresets: Preset[] = useMemo(
    () => [
      { label: "Box 3m", seconds: 3 * 60, hint: "Box breathing practice" },
      { label: "Box 5m", seconds: 5 * 60, hint: "Box breathing practice" },
      { label: "Breathe 7m", seconds: 7 * 60, hint: "Calm breathing" },
      { label: "Breathe 10m", seconds: 10 * 60, hint: "Calm breathing" },
    ],
    [],
  );

  const [seconds, setSeconds] = useState(10 * 60);
  const [remaining, setRemaining] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(false);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [endChime, setEndChime] = useState(true);
  const [loop, setLoop] = useState(false);

  // refs for stable RAF loop
  const rafRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(remaining);

  const secondsRef = useRef<number>(seconds);
  const runningRef = useRef<boolean>(running);
  const loopRef = useRef<boolean>(loop);
  const soundRef = useRef<boolean>(sound);
  const finalBeepsRef = useRef<boolean>(finalCountdownBeeps);
  const endChimeRef = useRef<boolean>(endChime);

  const lastBeepSecondRef = useRef<number | null>(null);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    soundRef.current = sound;
    if (!sound) setFinalCountdownBeeps(false);
  }, [sound]);

  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  useEffect(() => {
    endChimeRef.current = endChime;
  }, [endChime]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // Reset cleanly when duration changes.
  useEffect(() => {
    setRunning(false);
    runningRef.current = false;
    stopRaf();
    endAtRef.current = null;
    lastBeepSecondRef.current = null;

    const next = seconds * 1000;
    remainingRef.current = next;
    setRemaining(next);
  }, [seconds]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  // Main RAF loop: only runs while `running` is true.
  useEffect(() => {
    if (!running) {
      stopRaf();
      endAtRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Resume from current remaining.
    endAtRef.current = performance.now() + remainingRef.current;

    const tick = () => {
      if (!runningRef.current) return;

      const now = performance.now();
      const endAt = endAtRef.current ?? now;
      const rem = Math.max(0, endAt - now);

      remainingRef.current = rem;
      setRemaining(rem);

      if (
        soundRef.current &&
        finalBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(740, 90, 0.06);
        }
      }

      if (rem <= 0) {
        endAtRef.current = null;
        lastBeepSecondRef.current = null;

        if (soundRef.current && endChimeRef.current) {
          beep(528, 180, 0.08);
          window.setTimeout(() => beep(660, 220, 0.08), 180);
        }

        if (loopRef.current) {
          const next = secondsRef.current * 1000;
          remainingRef.current = next;
          setRemaining(next);
          endAtRef.current = performance.now() + next;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        runningRef.current = false;
        setRunning(false);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, beep]);

  function startPause() {
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    runningRef.current = false;
    stopRaf();
    endAtRef.current = null;
    lastBeepSecondRef.current = null;

    const next = secondsRef.current * 1000;
    remainingRef.current = next;
    setRemaining(next);
  }

  function setPreset(sec: number) {
    setSeconds(sec);
  }

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
    } else if (k === "l") {
      setLoop((v) => !v);
    } else if (k === "s") {
      setSound((v) => !v);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  // Match the reference sizing behavior (this is what prevents the “slow zoom” issues).
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, seconds],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel =
    remaining <= 0
      ? "Done"
      : running
        ? "Running"
        : remaining < seconds * 1000
          ? "Paused"
          : "Ready";

  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = seconds % 60;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Meditation Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setLoop((v) => !v)}
              className="py-1 text-sm"
            >
              Loop {loop ? "On" : "Off"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => setSound((v) => !v)}
              className="py-1 text-sm"
            >
              Sound {sound ? "On" : "Off"}
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        {/* Controls (normal only) */}
        {!isFs && (
          <div className="order-2 mt-5 flex flex-col gap-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-2">
              <PresetGroup title="Breathing presets" className="max-w-none">
                {breathingPresets.map((p) => (
                  <Chip key={p.label} active={p.seconds === seconds} onClick={() => setPreset(p.seconds)} title={p.hint}>
                    {p.label}
                  </Chip>
                ))}
              </PresetGroup>
              <PresetGroup title="Meditation + yoga presets" className="max-w-none">
                {presets.map((p) => (
                  <Chip key={p.label} active={p.seconds === seconds} onClick={() => setPreset(p.seconds)} title={p.hint}>
                    {p.label}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <Field
                  label="Custom minutes"
                  type="number"
                  min={0}
                  max={999}
                  value={minutesPart}
                  onChange={(e) => {
                    const m = clamp(Number(e.target.value || 0), 0, 999);
                    setSeconds(m * 60 + secondsPart);
                  }}
                />
                <Field
                  label="+ extra seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={secondsPart}
                  onChange={(e) => {
                    const s = clamp(Number(e.target.value || 0), 0, 59);
                    setSeconds(minutesPart * 60 + s);
                  }}
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle checked={sound} onCheckedChange={setSound} label="Sound" title="Toggle sound on/off" />
                  <Toggle checked={finalCountdownBeeps} onCheckedChange={setFinalCountdownBeeps} disabled={!sound} label="Final beeps" title="Optional soft beeps in the last 5 seconds" />
                  <Toggle checked={endChime} onCheckedChange={setEndChime} disabled={!sound} label="End chime" />
                  <Toggle checked={loop} onCheckedChange={setLoop} label="Loop" title="Restart automatically when finished" />
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

        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent ? "border-amber-200" : "border-slate-200",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold",
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
        </DisplayStage>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · S sound · L loop
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
export default function MeditationTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/meditation-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Meditation Timer",
        url,
        description:
          "Meditation timer with fullscreen countdown, breathing presets, loop option, and optional sound. Quiet by default for meditation and yoga.",
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
            name: "Meditation Timer",
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
        display={<MeditationTimerCard />}
        title="Meditation Timer"
        description="Use a calm meditation countdown with compact bell, chime, loop, and fullscreen controls."
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

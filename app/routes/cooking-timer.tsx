// app/routes/cooking-timer.tsx
import type { Route } from "./+types/cooking-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ContentSection,
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
  ToolHero,
  ToolFrame as Card,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/cooking-timer/HowItWorks";
import Disclaimer from "~/clients/components/cooking-timer/Disclaimer";
import FAQ from "~/clients/components/cooking-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/cooking-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/cooking-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Cooking Timer (Kitchen Timer + Egg & Pasta Presets)";
  const description =
    "Free cooking and kitchen timer with common presets for eggs, pasta, baking, and ovens. Big fullscreen countdown with custom minutes, optional sound, and keyboard shortcuts.";

  const url = "https://www.ilovetimers.com/cooking-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "cooking timer",
        "kitchen timer",
        "egg timer",
        "boiling eggs timer",
        "pasta timer",
        "oven timer",
        "baking timer",
        "fullscreen timer",
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
   COOKING TIMER CARD
========================================================= */
type Preset = { label: string; seconds: number };

function CookingTimerCard() {
  const beep = useBeep();

  const eggPresets: Preset[] = useMemo(
    () => [
      { label: "Soft 6m", seconds: 6 * 60 },
      { label: "Jammy 7m", seconds: 7 * 60 },
      { label: "Medium 8m", seconds: 8 * 60 },
      { label: "Hard 10m", seconds: 10 * 60 },
      { label: "Very hard 12m", seconds: 12 * 60 },
    ],
    [],
  );

  const kitchenPresets: Preset[] = useMemo(
    () => [
      { label: "30s", seconds: 30 },
      { label: "1m", seconds: 60 },
      { label: "2m", seconds: 120 },
      { label: "3m", seconds: 180 },
      { label: "5m", seconds: 300 },
      { label: "7m", seconds: 420 },
      { label: "10m", seconds: 600 },
      { label: "12m", seconds: 720 },
      { label: "15m", seconds: 900 },
      { label: "20m", seconds: 1200 },
      { label: "30m", seconds: 1800 },
      { label: "45m", seconds: 2700 },
      { label: "60m", seconds: 3600 },
    ],
    [],
  );

  const [seconds, setSeconds] = useState(7 * 60);

  const [sound, setSound] = useState(true);
  const [finalBeeps, setFinalBeeps] = useState(true);
  const [loop, setLoop] = useState(false);

  const [remaining, setRemaining] = useState(seconds * 1000);
  const [running, setRunning] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const loopRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function resetTimer() {
    setRunning(false);
    setRemaining(seconds * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  useEffect(() => {
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startNew() {
    stopRaf();
    lastBeepSecondRef.current = null;
    hasStartedRef.current = true;

    const next = seconds * 1000;
    setRemaining(next);
    endRef.current = performance.now() + next;
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

        if (sound) beep(660, 180, 0.1);

        if (loopRef.current) {
          const next = seconds * 1000;
          setRemaining(next);
          endRef.current = performance.now() + next;
          hasStartedRef.current = true;
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
  }, [running, seconds, sound, finalBeeps, beep]);

  function setPreset(sec: number) {
    setSeconds(sec);
  }

  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const readyTime = msToClock(seconds * 1000);

  const urgent = running && remaining > 0 && remaining <= 10_000;

  const statusLabel = !running
    ? hasStartedRef.current
      ? "Paused"
      : "Ready"
    : "Cooking timer running";

  const displayTone = urgent
    ? "bg-amber-50 text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, readyTime, statusLabel, isFs, running, seconds],
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
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "l") {
      setLoop((x) => !x);
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Cooking Timer"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-2 sm:flex">
            <Toggle
              label="Sound (S)"
              checked={sound}
              onCheckedChange={setSound}
              className="py-1 text-sm"
            />
            <Toggle
              label="Final beeps"
              checked={finalBeeps}
              onCheckedChange={setFinalBeeps}
              disabled={!sound}
              className="py-1 text-sm"
            />
            <Toggle
              label="Loop (L)"
              checked={loop}
              onCheckedChange={setLoop}
              className="py-1 text-sm"
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
            <Btn kind="ghost" onClick={resetTimer} className="py-1 text-sm">
              Reset (R)
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface flex flex-col items-center justify-center font-mono font-extrabold",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center",
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

          <div className="mt-4 w-full max-w-3xl">
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Set time
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-950">
                {mins}m {secs}s
              </div>
            </div>
          </div>

        </DisplayStage>

        {!isFs && (
          <ControlGroup>
            <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={resetTimer}>
              Reset
            </Btn>
          </ControlGroup>
        )}

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-2">
            <PresetGroup title="Egg presets" className="max-w-none">
                {eggPresets.map((p) => (
                  <Chip
                    key={p.label}
                    active={p.seconds === seconds}
                    onClick={() => setPreset(p.seconds)}
                    disabled={running}
                  >
                    {p.label}
                  </Chip>
                ))}
            </PresetGroup>

            <PresetGroup title="Common presets" className="max-w-none">
                {kitchenPresets.map((p) => (
                  <Chip
                    key={p.label}
                    active={p.seconds === seconds}
                    onClick={() => setPreset(p.seconds)}
                    disabled={running}
                  >
                    {p.label}
                  </Chip>
                ))}
            </PresetGroup>
          </div>
        )}

        {/* Custom inputs (normal only) */}
        {!isFs && (
          <>
            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={999}
                  value={mins}
                  disabled={running}
                  onChange={(e) => {
                    const m = clamp(Number(e.target.value || 0), 0, 999);
                    setSeconds(m * 60 + secs);
                  }}
                />
                <Field
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={secs}
                  disabled={running}
                  onChange={(e) => {
                    const s = clamp(Number(e.target.value || 0), 0, 59);
                    setSeconds(mins * 60 + s);
                  }}
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle
                    label="Final beeps"
                    checked={finalBeeps}
                    onCheckedChange={setFinalBeeps}
                    disabled={!sound}
                  />
                  <Toggle label="Loop" checked={loop} onCheckedChange={setLoop} />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound · L loop
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {eggPresets.map((p) => (
                <Chip
                  key={`egg-${p.label}`}
                  active={p.seconds === seconds}
                  onClick={() => setPreset(p.seconds)}
                >
                  {p.label}
                </Chip>
              ))}
              {kitchenPresets.slice(0, 7).map((p) => (
                <Chip
                  key={`k-${p.label}`}
                  active={p.seconds === seconds}
                  onClick={() => setPreset(p.seconds)}
                >
                  {p.label}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={resetTimer}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · Space start/pause · R reset · F
                fullscreen
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
export default function CookingTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/cooking-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Cooking Timer",
        url,
        description:
          "Cooking timer and kitchen timer with common presets including egg presets. Fullscreen countdown, optional sound, and keyboard shortcuts.",
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
            name: "Cooking Timer",
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
        display={<CookingTimerCard />}
        title="Cooking Timer"
        description="Pick a kitchen preset or set custom minutes for a large, readable cooking countdown."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            For a more direct kitchen countdown with common minute presets, use
            the{" "}
            <a className="ilt-content-link" href="/kitchen-timer">
              kitchen timer
            </a>
            . This cooking timer keeps broader cooking presets and kitchen
            workflow notes available. For fixed kitchen checks, the{" "}
            <a className="ilt-content-link" href="/5-minute-timer">
              5 minute timer
            </a>
            ,{" "}
            <a className="ilt-content-link" href="/10-minute-timer">
              10 minute timer
            </a>
            , and{" "}
            <a className="ilt-content-link" href="/30-minute-timer">
              30 minute timer
            </a>{" "}
            open with those durations ready.
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

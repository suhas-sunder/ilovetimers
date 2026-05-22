// app/routes/egg-timer.tsx
import type { Route } from "./+types/egg-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  ToolFrame as Card,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/egg-timer/HowItWorks";
import Disclaimer from "~/clients/components/egg-timer/Disclaimer";
import FAQ from "~/clients/components/egg-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/egg-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/egg-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Egg Timer (Soft, Jammy, Medium, Hard) + Fullscreen";
  const description =
    "Free egg timer with presets for soft, jammy, medium, and hard boiled eggs. Big countdown, optional sound, final beeps, and fullscreen mode.";

  const url = "https://www.ilovetimers.com/egg-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "egg timer",
        "boiled egg timer",
        "soft boiled egg timer",
        "jammy egg timer",
        "medium boiled egg timer",
        "hard boiled egg timer",
        "egg boiling timer",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://www.ilovetimers.com/og-image.png" },

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

  return useCallback((freq = 880, duration = 160, gain = 0.1) => {
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
   EGG TIMER CARD
========================================================= */
type EggPreset = {
  key: string;
  label: string;
  m: number;
  s: number;
};

function EggTimerCard() {
  const beep = useBeep();

  const presets = useMemo<EggPreset[]>(
    () => [
      { key: "soft", label: "Soft", m: 6, s: 0 },
      { key: "jammy", label: "Jammy", m: 7, s: 0 },
      { key: "medium", label: "Medium", m: 8, s: 0 },
      { key: "hard", label: "Hard", m: 10, s: 0 },
      { key: "veryhard", label: "Very hard", m: 12, s: 0 },
    ],
    [],
  );

  const [presetKey, setPresetKey] = useState<string>("soft");

  const [minutes, setMinutes] = useState(6);
  const [seconds, setSeconds] = useState(0);

  const [remaining, setRemaining] = useState((minutes * 60 + seconds) * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const totalMs = (minutes * 60 + seconds) * 1000;

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemaining(totalMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
  }

  // Apply preset to minutes/seconds and reset
  useEffect(() => {
    const p = presets.find((x) => x.key === presetKey);
    if (!p) return;

    setMinutes(p.m);
    setSeconds(p.s);

    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
    setRemaining((p.m * 60 + p.s) * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKey, presets]);

  // When minutes/seconds change manually, reset timer cleanly
  useEffect(() => {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    hasStartedRef.current = false;
    stopRaf();
    setRemaining((minutes * 60 + seconds) * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes, seconds]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    if (totalMs <= 0) return;

    if (running) {
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      stopRaf();
      return;
    }

    lastBeepSecondRef.current = null;

    if (!hasStartedRef.current || remaining <= 0) {
      hasStartedRef.current = true;
      setRemaining(totalMs);
      endRef.current = performance.now() + totalMs;
      setRunning(true);
      return;
    }

    endRef.current = performance.now() + remaining;
    setRunning(true);
  }

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remaining;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);
      setRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 100, 0.09);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        hasStartedRef.current = false;

        if (sound) {
          beep(660, 180, 0.12);
          window.setTimeout(() => beep(880, 200, 0.12), 220);
        }

        stopRaf();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, remaining, sound, finalCountdownBeeps, beep]);

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const displayTone = urgent
    ? "bg-amber-50 text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 48 : 56,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "s") {
      setSound((v) => !v);
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
        title="Egg Timer"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
                className="accent-amber-500"
              />
              Sound
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={finalCountdownBeeps}
                onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                disabled={!sound}
                className="accent-amber-500"
              />
              Final beeps
            </label>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
              disabled={totalMs <= 0}
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
        {/* Primary controls (normal only) */}
        {!isFs && (
          <ControlGroup>
            <Btn onClick={startPause} disabled={totalMs <= 0}>
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset}>
              Reset
            </Btn>
          </ControlGroup>
        )}

        {/* Secondary actions (normal only) */}
        {!isFs && (
          <SecondaryActionRow>
            <Btn
              kind="ghost"
              onClick={() => void fullscreen.toggle()}
              className="py-2"
            >
              Fullscreen
            </Btn>
          </SecondaryActionRow>
        )}

        {/* Presets + inputs (normal only) */}
        {!isFs && (
          <>
            <PresetGroup>
              {presets.map((p) => (
                <Chip
                  key={p.key}
                  active={p.key === presetKey}
                  onClick={() => setPresetKey(p.key)}
                  disabled={running}
                >
                  {p.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup>
              <SettingRow className="sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                <Field
                  label="Minutes"
                  type="number"
                  min={0}
                  max={60}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 0), 0, 60))
                  }
                />

                <Field
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  disabled={running}
                  onChange={(e) =>
                    setSeconds(clamp(Number(e.target.value || 0), 0, 59))
                  }
                />

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
              </SettingRow>
            </SettingGroup>
          </>
        )}

        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface flex items-center justify-center font-mono font-extrabold",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 240,
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
              "inline-block text-center",
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

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((p) => (
                <Chip
                  key={p.key}
                  active={p.key === presetKey}
                  onClick={() => setPresetKey(p.key)}
                  disabled={running}
                >
                  {p.label}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Time
                </span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={minutes}
                  disabled={running}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <span className="text-slate-600">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  disabled={running}
                  onChange={(e) =>
                    setSeconds(clamp(Number(e.target.value || 0), 0, 59))
                  }
                  className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <Btn
                  kind={running ? "solid" : "ghost"}
                  onClick={startPause}
                  disabled={totalMs <= 0}
                >
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause • Space start/pause • R reset • F fullscreen • S sound
              </div>
            </div>
          </div>
        </FullscreenBottomBar>

        {/* Footer (normal only) */}
        {!isFs && (
          <div className="mt-6 flex flex-col gap-2">
            <ShortcutHint>
              Shortcuts: Space start/pause - R reset - F fullscreen - S sound
            </ShortcutHint>
            <ShortcutHint>
              Tip: click the display once so keyboard shortcuts work immediately.
            </ShortcutHint>
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function EggTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/egg-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Egg Timer",
        url,
        description:
          "Egg timer with soft, jammy, medium, and hard presets, optional sound, final beeps, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "Egg Timer", item: url },
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
        display={<EggTimerCard />}
        title="Egg Timer"
        description="Choose soft, jammy, medium, or hard egg presets, then run a large countdown with optional sound."
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

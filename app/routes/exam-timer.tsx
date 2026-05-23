// app/routes/exam-timer.tsx
import type { Route } from "./+types/exam-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
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
import HowItWorks from "~/clients/components/exam-timer/HowItWorks";
import Disclaimer from "~/clients/components/exam-timer/Disclaimer";
import FAQ from "~/clients/components/exam-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/exam-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/exam-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Exam Timer (Fullscreen Countdown for Tests & Practice)";
  const description =
    "Free exam timer for tests and timed practice. Big fullscreen countdown with presets, custom minutes, optional sound, and keyboard shortcuts. Great for SAT-style timing and mock exams.";

  const url = "https://www.ilovetimers.com/exam-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "exam timer",
        "test timer",
        "timed practice timer",
        "practice test timer",
        "mock exam timer",
        "sat timer",
        "countdown timer for exams",
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

// WebAudio beep (same style as other pages)
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

      if (ctx.state === "suspended") ctx.resume().catch(() => {});

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
   EXAM TIMER CARD
========================================================= */
function ExamTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90, 120, 180],
    [],
  );

  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [warnings, setWarnings] = useState(true);
  const [warnAt5Min, setWarnAt5Min] = useState(true);
  const [warnAt1Min, setWarnAt1Min] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const lastBeepSecondRef = useRef<number | null>(null);
  const warned5Ref = useRef(false);
  const warned1Ref = useRef(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const totalMs = minutes * 60 * 1000;

  const remainingRef = useRef<number>(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    setRemaining(totalMs);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    warned5Ref.current = false;
    warned1Ref.current = false;
    stopRaf();
  }, [totalMs]);

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

      if (sound && warnings) {
        if (warnAt5Min && !warned5Ref.current && rem > 0 && rem <= 5 * 60_000) {
          warned5Ref.current = true;
          beep(740, 180);
        }
        if (warnAt1Min && !warned1Ref.current && rem > 0 && rem <= 60_000) {
          warned1Ref.current = true;
          beep(880, 180);
        }
      }

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
  }, [
    running,
    sound,
    warnings,
    warnAt5Min,
    warnAt1Min,
    finalCountdownBeeps,
    beep,
  ]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    setRemaining(totalMs);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    warned5Ref.current = false;
    warned1Ref.current = false;
    stopRaf();
  }

  function startPause() {
    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const urgent = running && remaining > 0 && remaining <= 60_000;
  const midWarn = running && remaining > 60_000 && remaining <= 5 * 60_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const statusLabel = running
    ? "Running"
    : remaining < totalMs && remaining > 0
      ? "Paused"
      : "Ready";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      minutes,
      sound,
      warnings,
      warnAt1Min,
      warnAt5Min,
      finalCountdownBeeps,
    ],
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
      reset();
    } else if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  const disableTimeSetting = running;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Exam Timer"
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
        {/* Controls (normal only) */}
        {!isFs && (
          <div className="order-2 mt-5 space-y-5">
            <ControlGroup>
              <div className="flex flex-wrap items-center gap-3">
                <Btn kind="solid" onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="hidden">
                Shortcuts: Space start/pause · R reset · F fullscreen
              </div>
            </ControlGroup>

            <PresetGroup title="Exam duration">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  onClick={() => setPreset(m)}
                  disabled={disableTimeSetting}
                  active={m === minutes}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Exam cues"
              description="Sound and warning cues stay secondary to the exam countdown."
            >
              <SettingRow>
                <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                <Toggle
                  label="Warnings"
                  checked={warnings}
                  onCheckedChange={setWarnings}
                  disabled={!sound}
                />
                <Toggle
                  label="Final beeps"
                  checked={finalCountdownBeeps}
                  onCheckedChange={setFinalCountdownBeeps}
                  disabled={!sound}
                />
                <Toggle
                  label="5 min warning"
                  checked={warnAt5Min}
                  onCheckedChange={setWarnAt5Min}
                  disabled={!sound || !warnings}
                />
                <Toggle
                  label="1 min warning"
                  checked={warnAt1Min}
                  onCheckedChange={setWarnAt1Min}
                  disabled={!sound || !warnings}
                />
              </SettingRow>
            </SettingGroup>

            <SettingGroup title="Custom duration">
              <SettingRow>
                <Field
                  label="Custom minutes"
                  type="number"
                  min={1}
                  max={360}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 360))
                  }
                  disabled={disableTimeSetting}
                />
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Space start/pause / R reset / F fullscreen
            </ShortcutHint>
          </div>
        )}

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "order-1 timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            urgent
              ? "ring-1 ring-amber-300/70"
              : midWarn
                ? "ring-2 ring-amber-200"
                : "",
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

          {!isFs && (
            <div className="hidden">
              Space start/pause · R reset · F fullscreen
            </div>
          )}

          {!isFs && warnings && (warnAt5Min || warnAt1Min) ? (
            <div className="mt-1 text-xs text-slate-600">
              Warnings: {warnAt5Min ? "5m" : ""}{" "}
              {warnAt5Min && warnAt1Min ? "·" : ""} {warnAt1Min ? "1m" : ""}
              {finalCountdownBeeps ? " · last 5s" : ""}
            </div>
          ) : null}

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Settings
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {sound ? "Sound on" : "Sound off"}
                    {sound && warnings && (warnAt5Min || warnAt1Min)
                      ? ` · Warnings ${warnAt5Min ? "5m" : ""}${warnAt5Min && warnAt1Min ? " + " : ""}${warnAt1Min ? "1m" : ""}`
                      : ""}
                    {sound && finalCountdownBeeps ? " · Final beeps" : ""}
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Tap time to start/pause
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Btn
                kind="ghost"
                size="sm"
                onClick={() => setSound((v) => !v)}
              >
                Sound: {sound ? "On" : "Off"}
              </Btn>

              <Btn
                kind="ghost"
                size="sm"
                onClick={() => setWarnings((v) => !v)}
                disabled={!sound}
              >
                Warnings: {warnings ? "On" : "Off"}
              </Btn>

              <Btn
                kind="ghost"
                size="sm"
                onClick={() => setFinalCountdownBeeps((v) => !v)}
                disabled={!sound}
              >
                Final beeps: {finalCountdownBeeps ? "On" : "Off"}
              </Btn>

              <Btn
                kind="ghost"
                size="sm"
                onClick={() => setWarnAt5Min((v) => !v)}
                disabled={!sound || !warnings}
              >
                5m: {warnAt5Min ? "On" : "Off"}
              </Btn>

              <Btn
                kind="ghost"
                size="sm"
                onClick={() => setWarnAt1Min((v) => !v)}
                disabled={!sound || !warnings}
              >
                1m: {warnAt1Min ? "On" : "Off"}
              </Btn>
            </div>

            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs text-slate-600">
              Duration: {minutes} min
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
export default function ExamTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/exam-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Exam Timer",
        url,
        description:
          "Fullscreen exam timer for tests and timed practice with big countdown, presets, optional warnings, and keyboard shortcuts.",
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
            name: "Exam Timer",
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
        display={<ExamTimerCard />}
        title="Exam Timer (Fullscreen Countdown)"
        description="Run timed practice with a calm fullscreen countdown, presets, optional warning beeps, and keyboard shortcuts."
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

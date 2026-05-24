// app/routes/lab-timer.tsx
import type { Route } from "./+types/lab-timer";
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
import HowItWorks from "~/clients/components/lab-timer/HowItWorks";
import Disclaimer from "~/clients/components/lab-timer/Disclaimer";
import FAQ from "~/clients/components/lab-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/lab-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/lab-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Lab Timer (Experiments + Reaction Time, Fullscreen)";
  const description =
    "Online lab timer for experiments and reaction timing. Use a precise stopwatch with laps or run repeatable countdowns for timed lab steps in a clear, distraction-free display.";

  const url = "https://www.ilovetimers.com/lab-timer";

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

function msToStopwatch(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const cs = Math.floor((t % 1000) / 10); // centiseconds
  return `${m}:${pad2(sec)}.${pad2(cs)}`;
}

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

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gain.gain.value = 0.1;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      window.setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      }, duration);
    } catch {
      // Browser audio permissions can block the cue.
    }
  }, []);
}

/* =========================================================
   LAB TIMER CARD
========================================================= */
type Lap = { n: number; splitMs: number; atMs: number };

function LabTimerCard() {
  const beep = useBeep();

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  /* ---------- Stopwatch ---------- */
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [maxLaps, setMaxLaps] = useState(60);

  const swRafRef = useRef<number | null>(null);
  const swStartRef = useRef<number | null>(null);
  const swBaseRef = useRef<number>(0);

  const swElapsedRef = useRef<number>(0);
  useEffect(() => {
    swElapsedRef.current = swElapsed;
  }, [swElapsed]);

  const lastLapAtRef = useRef<number>(0);

  function stopSwRaf() {
    if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
    swRafRef.current = null;
  }

  useEffect(() => {
    if (!swRunning) {
      stopSwRaf();
      swStartRef.current = null;
      return;
    }

    swStartRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = now - (swStartRef.current ?? now);
      const next = swBaseRef.current + delta;
      setSwElapsed(next);
      swRafRef.current = requestAnimationFrame(tick);
    };

    swRafRef.current = requestAnimationFrame(tick);
    return () => stopSwRaf();
  }, [swRunning]);

  useEffect(() => {
    return () => stopSwRaf();
  }, []);

  function swStartPause() {
    setSwRunning((r) => {
      const next = !r;
      swBaseRef.current = swElapsedRef.current;
      return next;
    });
  }

  function swReset() {
    setSwRunning(false);
    setSwElapsed(0);
    swBaseRef.current = 0;
    swStartRef.current = null;
    setLaps([]);
    lastLapAtRef.current = 0;
    stopSwRaf();
  }

  function swLap() {
    if (!swRunning) return;

    const nowElapsed = swElapsedRef.current;
    const split = Math.max(0, nowElapsed - lastLapAtRef.current);
    lastLapAtRef.current = nowElapsed;

    setLaps((prev) => {
      if (prev.length >= maxLaps) return prev;
      return [
        { n: prev.length + 1, splitMs: split, atMs: nowElapsed },
        ...prev,
      ];
    });

    if (sound) beep(880, 80);
  }

  const bestLap = useMemo(() => {
    if (!laps.length) return null;
    return Math.min(...laps.map((l) => l.splitMs));
  }, [laps]);

  /* ---------- Repeatable Countdown ---------- */
  const cdBoxRef = useRef<HTMLDivElement>(null);
  const cdFullscreen = useFullscreen(cdBoxRef);
  const isCdFs = cdFullscreen.isFullscreen;

  const [stepSec, setStepSec] = useState(60);
  const stepSecRef = useRef<number>(60);
  useEffect(() => {
    stepSecRef.current = stepSec;
  }, [stepSec]);

  const [cdRemaining, setCdRemaining] = useState(stepSec * 1000);
  const cdRemainingRef = useRef<number>(stepSec * 1000);
  useEffect(() => {
    cdRemainingRef.current = cdRemaining;
  }, [cdRemaining]);

  const [cdRunning, setCdRunning] = useState(false);

  const [repeat, setRepeat] = useState(true);
  const repeatRef = useRef(true);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const soundRef = useRef(true);
  const finalBeepsRef = useRef(false);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);
  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  const cdRafRef = useRef<number | null>(null);
  const cdEndRef = useRef<number | null>(null);
  const cdLastBeepSecondRef = useRef<number | null>(null);

  function stopCdRaf() {
    if (cdRafRef.current) cancelAnimationFrame(cdRafRef.current);
    cdRafRef.current = null;
  }

  useEffect(() => {
    setCdRemaining(stepSec * 1000);
    setCdRunning(false);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
    stopCdRaf();
  }, [stepSec]);

  useEffect(() => {
    if (!cdRunning) {
      stopCdRaf();
      cdEndRef.current = null;
      cdLastBeepSecondRef.current = null;
      return;
    }

    if (!cdEndRef.current)
      cdEndRef.current = performance.now() + cdRemainingRef.current;

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (cdEndRef.current ?? now) - now);
      setCdRemaining(rem);

      if (
        soundRef.current &&
        finalBeepsRef.current &&
        rem > 0 &&
        rem <= 5_000
      ) {
        const secLeft = Math.ceil(rem / 1000);
        if (cdLastBeepSecondRef.current !== secLeft) {
          cdLastBeepSecondRef.current = secLeft;
          beep(880, 100);
        }
      }

      if (rem <= 0) {
        cdEndRef.current = null;
        cdLastBeepSecondRef.current = null;

        if (soundRef.current) beep(660, 240);

        if (repeatRef.current) {
          const next = stepSecRef.current * 1000;
          setCdRemaining(next);
          cdEndRef.current = performance.now() + next;
          cdRafRef.current = requestAnimationFrame(tick);
          return;
        }

        setCdRunning(false);
        return;
      }

      cdRafRef.current = requestAnimationFrame(tick);
    };

    cdRafRef.current = requestAnimationFrame(tick);
    return () => stopCdRaf();
  }, [cdRunning, beep]);

  useEffect(() => {
    return () => stopCdRaf();
  }, []);

  function cdStartPause() {
    setCdRunning((r) => {
      const next = !r;
      cdLastBeepSecondRef.current = null;
      if (next) {
        cdEndRef.current = performance.now() + cdRemainingRef.current;
      } else {
        cdEndRef.current = null;
      }
      return next;
    });
  }

  function cdReset() {
    setCdRunning(false);
    setCdRemaining(stepSecRef.current * 1000);
    cdEndRef.current = null;
    cdLastBeepSecondRef.current = null;
    stopCdRaf();
  }

  const quickSteps = useMemo(
    () => [10, 15, 30, 45, 60, 90, 120, 180, 300, 600],
    [],
  );

  const cdUrgent = cdRunning && cdRemaining > 0 && cdRemaining <= 10_000;

  const cdText = msToClock(Math.ceil(cdRemaining / 1000) * 1000);
  const swText = msToStopwatch(swElapsed);

  const cdTimeTextRef = useRef<HTMLSpanElement>(null);
  const cdInnerBoxRef = useRef<HTMLDivElement>(null);

  const cdFontPx = useFitText({
    containerRef: cdInnerBoxRef,
    textRef: cdTimeTextRef,
    deps: [cdText, isCdFs, cdRunning, stepSec, repeat],
    minPx: 52,
    maxPx: isCdFs ? 520 : 360,
    paddingAllowancePx: isCdFs ? 72 : 64,
    initialScale: isCdFs ? 1 : 1,
    initialMobileScale: isCdFs ? 1 : 0.9,
  });

  const swTimeTextRef = useRef<HTMLSpanElement>(null);
  const swInnerBoxRef = useRef<HTMLDivElement>(null);

  const swFontPx = useFitText({
    containerRef: swInnerBoxRef,
    textRef: swTimeTextRef,
    deps: [swText, swRunning, laps.length],
    minPx: 44,
    maxPx: 220,
    paddingAllowancePx: 56,
    initialScale: 1,
    initialMobileScale: 0.75,
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    // Stopwatch
    if (e.key === " ") {
      e.preventDefault();
      swStartPause();
      return;
    }
    if (k === "l") {
      swLap();
      return;
    }

    // Countdown
    if (k === "c") {
      cdStartPause();
      return;
    }
    if (k === "t") {
      setRepeat((v) => !v);
      return;
    }

    // Global reset
    if (k === "r") {
      swReset();
      cdReset();
      return;
    }

    // Fullscreen for countdown box
    if (k === "f" && cdBoxRef.current) {
      void cdFullscreen.toggle();
      return;
    }

    if (k === "escape" && isCdFs) {
      void cdFullscreen.exit();
    }
  };

  const swStatus = swRunning ? "Running" : swElapsed > 0 ? "Paused" : "Ready";
  const cdStatus = cdRunning
    ? "Running"
    : cdRemaining < stepSec * 1000
      ? "Paused"
      : "Ready";

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown}>
      <div className="timer-list-stack flex h-full flex-col">
      <div className="hidden">

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 ilt-inline-pill px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)]">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            Sound
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 ilt-inline-pill px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)]">
            <input
              type="checkbox"
              checked={finalCountdownBeeps}
              onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
              disabled={!sound}
            />
            Final beeps
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              void cdFullscreen.toggle()
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div className="hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="ilt-inline-pill px-3 py-2 ilt-helper-text font-semibold">
            Shortcuts: Space stopwatch · L lap · C countdown · R reset · T
            repeat · F fullscreen
          </div>
        </div>
      </div>

      <SettingGroup
        title="Lab timer settings"
        description="Sound cues apply to the repeatable countdown. Stopwatch laps stay silent."
        className="order-2 mt-5"
      >
        <SettingRow className="sm:grid-cols-2 lg:grid-cols-2">
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

        <SecondaryActionRow className="timer-list-actions">
          <Btn kind="ghost" onClick={() => void cdFullscreen.toggle()}>
            Fullscreen
          </Btn>
        </SecondaryActionRow>

        <ShortcutHint>
          Space stopwatch / L lap / C countdown / R reset / T repeat / F fullscreen
        </ShortcutHint>
      </SettingGroup>

      <div className="order-1 timer-primary-surface timer-list-grid mt-5 grid gap-6 lg:grid-cols-2">
        {/* STOPWATCH */}
        <div className="timer-list-panel flex min-w-0 flex-col ilt-surface-card p-4 sm:p-5">
          <div className="order-3 mt-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[var(--ilt-text-primary)]">
              Stopwatch + Laps
            </h2>
            <div className="ilt-helper-text font-semibold">mm:ss.cc</div>
          </div>

          <div
            data-display-stage
            ref={swInnerBoxRef}
            className="order-1 timer-display-surface order-1 relative mt-0 overflow-hidden p-2 sm:p-3"
            style={{ minHeight: 180, userSelect: "none" }}
            aria-live="polite"
          >
            <div className="flex items-center justify-center">
              <span
                ref={swTimeTextRef}
                className="inline-block text-center font-mono font-extrabold tracking-widest text-[var(--ilt-text-primary)]"
                style={{
                  fontSize: swFontPx,
                  lineHeight: "1",
                  transform: "translateZ(0)",
                }}
              >
                {swText}
              </span>
            </div>

            <div className="mt-3 text-center ilt-content-label">
              {swStatus}
            </div>
          </div>

          <div className="order-2 mt-4 flex flex-wrap items-center justify-center gap-3">
            <Btn onClick={swStartPause}>{swRunning ? "Pause" : "Start"}</Btn>
            <Btn kind="ghost" onClick={swLap} disabled={!swRunning}>
              Lap
            </Btn>
            <Btn kind="ghost" onClick={swReset}>
              Reset
            </Btn>

            <label className="ml-auto inline-flex items-center gap-2 ilt-inline-pill px-3 py-2 text-sm font-semibold text-[var(--ilt-text-primary)]">
              Max laps
              <input
                type="number"
                min={10}
                max={300}
                value={maxLaps}
                onChange={(e) =>
                  setMaxLaps(clamp(Number(e.target.value || 60), 10, 300))
                }
                className="w-20 ilt-input-control px-2 py-1"
              />
            </label>
          </div>

          <div className="timer-list-panel order-4 mt-4 ilt-surface-muted p-4">
            <div className="ilt-content-label">
              Laps (newest first)
            </div>

            {laps.length ? (
                <div className="mt-3 max-h-[260px] overflow-auto">
                <div className="divide-y divide-[var(--ilt-border-subtle)]">
                  {laps.map((l) => {
                    const isBest = bestLap != null && l.splitMs === bestLap;
                    return (
                      <div
                        key={`${l.n}-${l.atMs}`}
                        className="grid grid-cols-[70px_1fr_110px] items-center gap-2 px-3 py-2"
                      >
                        <div className="text-sm font-bold text-[var(--ilt-text-primary)]">
                          Lap {l.n}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-extrabold text-[var(--ilt-text-primary)]">
                            {msToStopwatch(l.splitMs)}
                          </div>
                          <div className="ilt-helper-text">
                            {isBest ? "Best lap" : ""}
                          </div>
                        </div>
                        <div className="text-right font-mono text-sm font-semibold text-[var(--ilt-text-primary)]">
                          {msToStopwatch(l.atMs)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-[var(--ilt-text-secondary)]">
                Start the stopwatch, then press <strong>L</strong> to record
                laps (splits).
              </div>
            )}
          </div>
        </div>

        {/* COUNTDOWN */}
        <div className="timer-list-panel flex min-w-0 flex-col ilt-surface-card p-4 sm:p-5">
          <div className="order-3 mt-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[var(--ilt-text-primary)]">
              Repeatable Countdown
            </h2>
            <div className="ilt-helper-text font-semibold">
              step timer
            </div>
          </div>

          <PresetGroup className="order-2 mt-4" title="Common step times">
              {quickSteps.map((s) => (
                <Chip
                  key={s}
                  onClick={() => setStepSec(s)}
                  active={s === stepSec}
                >
                  {s >= 60
                    ? `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ""}`
                    : `${s}s`}
                  </Chip>
              ))}
          </PresetGroup>

          <SettingGroup className="order-2 mt-4" title="Countdown setup">
            <SettingRow className="sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto]">
              <Field
                label="Custom step (seconds)"
                type="number"
                min={1}
                max={24 * 60 * 60}
                value={stepSec}
                onChange={(e) =>
                  setStepSec(
                    clamp(Number(e.target.value || 1), 1, 24 * 60 * 60),
                  )
                }
              />

              <ControlGroup className="sm:justify-end">
              <Btn onClick={cdStartPause}>{cdRunning ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={cdReset}>
                Reset
              </Btn>
              </ControlGroup>
            </SettingRow>
          </SettingGroup>

          <div className="order-2 mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Toggle
              label="Repeat step"
              checked={repeat}
              onCheckedChange={setRepeat}
            />

            <div className="ilt-helper-text font-semibold">
              If Repeat is on, the countdown restarts automatically after it
              hits zero.
            </div>
          </div>

          {/* Fullscreen overlay bars */}
          <div className="order-1 relative mt-0">
            <div
              data-display-stage
              ref={cdBoxRef}
              className={[
            "order-1 timer-display-surface relative overflow-hidden text-[var(--ilt-text-primary)]",
                isCdFs
                  ? "h-screen w-screen rounded-none border-0 bg-white text-[var(--ilt-text-primary)]"
                  : cdUrgent
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-slate-50",
              ].join(" ")}
              style={{
                minHeight: isCdFs ? undefined : 220,
                userSelect: "none",
              }}
              aria-live="polite"
              onClick={() => {
                if (isCdFs) cdStartPause();
              }}
              role={isCdFs ? "button" : undefined}
              title={isCdFs ? "Tap/click to start or pause" : undefined}
            >
              <FullscreenTopBar
                show={isCdFs}
                title="Lab Step Timer"
                onExit={() => void cdFullscreen.exit()}
                right={
                  <div className="flex items-center gap-2">
                    <Btn
                      kind="solid"
                      size="sm"
                      onClick={cdStartPause}
                    >
                      {cdRunning ? "Pause" : "Start"}
                    </Btn>
                    <Btn
                      kind="ghost"
                      size="sm"
                      onClick={cdReset}
                    >
                      Reset
                    </Btn>
                    <Btn
                      kind="ghost"
                      size="sm"
                      onClick={() => setRepeat((v) => !v)}
                    >
                      Repeat {repeat ? "On" : "Off"}
                    </Btn>
                  </div>
                }
              />

              <div
                ref={cdInnerBoxRef}
                className={[
                  "flex h-full w-full flex-col items-center justify-start",
                  isCdFs ? "px-4 pb-16 pt-16 sm:px-8" : "p-2 sm:p-3",
                ].join(" ")}
                style={{ minHeight: isCdFs ? "100vh" : 220 }}
              >
                <span
                  ref={cdTimeTextRef}
                  className={[
                    "inline-block text-center font-mono font-extrabold",
                    isCdFs
                      ? "tracking-wide sm:tracking-widest"
                      : "tracking-widest",
                  ].join(" ")}
                  style={{
                    fontSize: cdFontPx,
                    lineHeight: "1",
                    transform: "translateZ(0)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cdText}
                </span>

                <div
                  className={[
                    "mt-3 text-xs font-extrabold uppercase tracking-widest",
                    "text-[var(--ilt-text-secondary)]",
                  ].join(" ")}
                >
                  Step Countdown {repeat ? "- Repeat on" : ""} - {cdStatus}
                </div>

                {!isCdFs && (
                  <div className="mt-2 ilt-helper-text font-semibold">
                    C start/pause - R reset - T toggle repeat - F fullscreen
                  </div>
                )}
              </div>

              <FullscreenBottomBar show={isCdFs}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="ilt-helper-text sm:text-sm">
                    Tap time to start/pause · C start/pause · R reset · T repeat
                    · F fullscreen
                  </div>
                  <div className="ilt-helper-text font-semibold">
                    {cdStatus}
                  </div>
                </div>
              </FullscreenBottomBar>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function LabTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/lab-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Lab Timer",
        url,
        description:
          "Lab timer with stopwatch + laps and a repeatable countdown for experiment steps. Fullscreen display, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Lab Timer", item: url },
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
        display={<LabTimerCard />}
        title="Lab Timer (Experiments + Reaction Time)"
        description="Use a stopwatch with laps and a repeatable countdown for timed lab steps, optional sound, and fullscreen step timing."
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

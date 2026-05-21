// app/routes/visual-timer.tsx
import type { Route } from "./+types/visual-timer";
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Visual Timer (For Kids & Classrooms, Fullscreen)";
  const description =
    "Help kids see time pass with a clear visual timer. A countdown with a shrinking visual bar designed for classrooms, lessons, and activities.";

  const url = "https://www.ilovetimers.com/visual-timer";

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
   VISUAL TIMER CARD
   - High readability
   - Fast rendering: React state updates once per second
   - Smooth visuals: DOM updates per frame without React re-render
========================================================= */
type VisualMode = "bar" | "ring";

function VisualTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);

  const totalMs = useMemo(() => minutes * 60 * 1000, [minutes]);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);

  const [mode, setMode] = useState<VisualMode>("bar");
  const [showTime, setShowTime] = useState(true);

  // UI display state updates only when the visible second changes
  const [remainingDisplayMs, setRemainingDisplayMs] = useState(totalMs);

  const rafRef = useRef<number | null>(null);
  const endPerfRef = useRef<number | null>(null);
  const remainingMsRef = useRef<number>(totalMs);
  const lastSecondShownRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // Visual DOM refs
  const barFillRef = useRef<HTMLDivElement>(null);
  const ringFgRef = useRef<SVGCircleElement>(null);

  // Ring geometry (kept stable)
  const ring = useMemo(() => {
    const size = 240;
    const stroke = 18;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return { size, stroke, r, circ };
  }, []);

  // Keep refs in sync
  useEffect(() => {
    remainingMsRef.current = totalMs;
    setRemainingDisplayMs(totalMs);
    endPerfRef.current = null;
    lastSecondShownRef.current = null;
    lastBeepSecondRef.current = null;

    // Also reset visuals immediately
    if (barFillRef.current) barFillRef.current.style.transform = "scaleX(1)";
    if (ringFgRef.current) {
      ringFgRef.current.setAttribute("stroke-dasharray", `${ring.circ} 0`);
    }
  }, [totalMs, ring.circ]);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const applyVisual = useCallback(
    (fracLeft: number) => {
      const f = clamp(fracLeft, 0, 1);

      if (barFillRef.current) {
        barFillRef.current.style.transform = `scaleX(${f})`;
      }

      if (ringFgRef.current) {
        const dash = ring.circ * f;
        ringFgRef.current.setAttribute(
          "stroke-dasharray",
          `${dash} ${ring.circ - dash}`,
        );
      }
    },
    [ring.circ],
  );

  useEffect(() => {
    if (!running) {
      stopRaf();
      endPerfRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    if (!endPerfRef.current) {
      endPerfRef.current = performance.now() + remainingMsRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endPerfRef.current ?? now) - now);
      remainingMsRef.current = rem;

      const fracLeft = totalMs > 0 ? rem / totalMs : 0;
      applyVisual(fracLeft);

      const secLeft = Math.ceil(rem / 1000);
      if (lastSecondShownRef.current !== secLeft) {
        lastSecondShownRef.current = secLeft;
        const snapped = Math.ceil(rem / 1000) * 1000;
        setRemainingDisplayMs(snapped);
      }

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endPerfRef.current = null;
        stopRaf();
        setRunning(false);
        lastBeepSecondRef.current = null;
        if (sound) beep(660, 240);
        applyVisual(0);
        setRemainingDisplayMs(0);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, totalMs, sound, finalCountdownBeeps, beep, applyVisual]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    stopRaf();
    endPerfRef.current = null;
    lastSecondShownRef.current = null;
    lastBeepSecondRef.current = null;
    remainingMsRef.current = totalMs;
    setRemainingDisplayMs(totalMs);
    applyVisual(1);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      lastBeepSecondRef.current = null;

      if (!next) {
        // Pausing
        stopRaf();
        endPerfRef.current = null;
      }
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const urgent =
    running && remainingMsRef.current > 0 && remainingMsRef.current <= 10_000;

  const shownTime = msToClock(remainingDisplayMs);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, showTime, mode],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 64 : 76,
  });

  const statusLabel =
    remainingMsRef.current <= 0 ? "Done" : running ? "Running" : "Ready";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f") {
      void fullscreen.toggle();
    } else if (k === "v") {
      setMode((m) => (m === "bar" ? "ring" : "bar"));
    } else if (k === "t") {
      setShowTime((v) => !v);
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
        title="Visual Timer"
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
        {!isFs && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <ControlGroup>
              <Btn onClick={startPause} kind="solid">
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <SecondaryActionRow>
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>
          </div>
        )}

        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface relative flex flex-col items-center justify-center text-[var(--ilt-text-primary)]",
            urgent
              ? "bg-amber-50"
              : "border-slate-200 bg-slate-50",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 360,
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
            {statusLabel}
          </div>

          {showTime ? (
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
          ) : (
            <div className="mt-3 text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-muted)]">
              Visual only
            </div>
          )}

          {/* Visual */}
          <div className={showTime ? "mt-6 w-full" : "mt-4 w-full"}>
            {mode === "bar" ? (
              <div className="mx-auto w-full max-w-5xl">
                <div className="h-12 w-full overflow-hidden rounded-full bg-[var(--ilt-bg-input)] shadow-[inset_0_0_0_1px_var(--ilt-border-subtle)]">
                  <div
                    ref={barFillRef}
                    className={[
                      "h-full origin-left",
                      urgent ? "bg-amber-500" : "bg-amber-500",
                    ].join(" ")}
                    style={{ transform: "scaleX(1)" }}
                    aria-label="Visual time remaining bar"
                  />
                </div>
                {!isFs && (
                  <div className="mt-2 flex justify-between text-xs font-semibold text-[var(--ilt-text-muted)]">
                    <span>Start</span>
                    <span>Done</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative mx-auto flex items-center justify-center">
                <svg
                  width={isFs ? 320 : ring.size}
                  height={isFs ? 320 : ring.size}
                  viewBox={`0 0 ${ring.size} ${ring.size}`}
                  aria-label="Visual time remaining ring"
                >
                  <circle
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={ring.r}
                    stroke={urgent ? "#fde68a" : "#e2e8f0"}
                    strokeWidth={ring.stroke}
                    fill="none"
                  />
                  <circle
                    ref={ringFgRef}
                    cx={ring.size / 2}
                    cy={ring.size / 2}
                    r={ring.r}
                    stroke={urgent ? "#f59e0b" : "#f59e0b"}
                    strokeWidth={ring.stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${ring.circ} 0`}
                    transform={`rotate(-90 ${ring.size / 2} ${ring.size / 2})`}
                  />
                </svg>
              </div>
            )}
          </div>
        </DisplayStage>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3">
            <PresetGroup>
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setPreset(m)}
                  disabled={running}
                  title={running ? "Pause to change duration" : `${m} minutes`}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup>
            <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
              <Field
                label="Custom minutes"
                type="number"
                min={1}
                max={180}
                value={minutes}
                disabled={running}
                onChange={(e) =>
                  setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                }
              />

                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    onClick={() => setMode("bar")}
                    active={mode === "bar"}
                    className="px-2 py-1 text-xs"
                    title="Bar mode"
                  >
                    Bar
                  </Chip>
                  <Chip
                    onClick={() => setMode("ring")}
                    active={mode === "ring"}
                    className="px-2 py-1 text-xs"
                    title="Ring mode"
                  >
                    Ring
                  </Chip>

                </div>

                <Toggle
                  label="Show time"
                  checked={showTime}
                  onCheckedChange={setShowTime}
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

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen · V toggle
              visual · T toggle time
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              <span>Tap visual to start/pause</span>
              <span className="hidden sm:inline">·</span>
              <span>Space start/pause</span>
              <span className="hidden sm:inline">·</span>
              <span>R reset</span>
              <span className="hidden sm:inline">·</span>
              <span>V visual</span>
              <span className="hidden sm:inline">·</span>
              <span>T time</span>
              <span className="hidden sm:inline">·</span>
              <span>F fullscreen</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              <span className="ilt-inline-pill px-3 py-1">
                {statusLabel}
              </span>

              <label className="inline-flex items-center gap-2 ilt-inline-pill px-3 py-1">
                <input
                  type="checkbox"
                  checked={showTime}
                  onChange={(e) => setShowTime(e.target.checked)}
                  className="cursor-pointer"
                />
                Time
              </label>

              <Chip
                onClick={() => setMode((m) => (m === "bar" ? "ring" : "bar"))}
                title="Toggle visual (V)"
              >
                {mode === "bar" ? "Bar" : "Ring"}
              </Chip>

              <label className="inline-flex items-center gap-2 ilt-inline-pill px-3 py-1">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="cursor-pointer"
                />
                Sound
              </label>

              <label className="inline-flex items-center gap-2 ilt-inline-pill px-3 py-1">
                <input
                  type="checkbox"
                  checked={finalCountdownBeeps}
                  onChange={(e) => setFinalCountdownBeeps(e.target.checked)}
                  disabled={!sound}
                  className="cursor-pointer disabled:cursor-not-allowed"
                />
                Beeps
              </label>
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
export default function VisualTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/visual-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Visual Timer",
        url,
        description:
          "Visual timer for kids and classrooms with a shrinking visual (bar or ring) plus optional time display. Fullscreen, presets, sound optional, and shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Visual Timer", item: url },
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
        display={<VisualTimerCard />}
        title="Visual Timer"
        description="Show time with a shrinking bar or ring so the remaining time is easy to understand at a glance."
      />

      <SeoBand title="How this timer works">
        <p>
          Visual Timer pairs a large countdown with a simple bar or ring
          indicator so time passing can be understood at a glance. The display
          stays first, while duration presets, custom time, mode controls,
          show-time settings, fullscreen, and optional sound remain below it.
        </p>
        <h3>When a visual countdown helps</h3>
        <p>
          Use it for classroom activities, kids' routines, meetings, shared
          rooms, or quiet tasks where a shrinking visual cue is easier to follow
          than reading small digits. The time display can stay visible or be
          reduced depending on how simple the screen should feel.
        </p>
        <h3>Display options</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Ring mode emphasizes the remaining portion of the countdown in a
            compact visual shape.
          </li>
          <li>
            Bar mode works well when the timer is projected or placed near a
            task list.
          </li>
          <li>
            Show-time controls decide whether the numeric countdown appears with
            the visual cue.
          </li>
        </ul>
        <h3>Related visual timers</h3>
        <p>
          For no-sound timing, use the{" "}
          <a className="ilt-content-link" href="/silent-timer">
            silent timer
          </a>
          . For a large projected countdown, try the{" "}
          <a className="ilt-content-link" href="/fullscreen-timer">
            fullscreen timer
          </a>
          . For a standard countdown with more timing options, use the{" "}
          <a className="ilt-content-link" href="/countdown-timer">
            countdown timer
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}

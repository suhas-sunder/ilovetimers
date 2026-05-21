// app/routes/study-timer.tsx
import type { Route } from "./+types/study-timer";
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
  const title = "Study Timer (Focus & Homework, Fullscreen)";
  const description =
    "Stay focused while studying with a simple study timer. Run distraction-free study sessions using a clear fullscreen countdown built for homework and deep focus.";

  const url = "https://www.ilovetimers.com/study-timer";

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
   STUDY TIMER CARD
========================================================= */
function StudyTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90],
    [],
  );

  const [minutes, setMinutes] = useState(25);

  // Settings (fully functional)
  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [focusMode, setFocusMode] = useState(true);
  const [milestones, setMilestones] = useState(true);
  const [showETA, setShowETA] = useState(false);

  const totalMs = useMemo(() => minutes * 60 * 1000, [minutes]);

  // Runtime state (render-throttled for snappy digits)
  const [running, setRunning] = useState(false);
  const [displayMs, setDisplayMs] = useState(totalMs);
  const [progressPct, setProgressPct] = useState(0);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const remainingRef = useRef<number>(totalMs);
  const lastShownSecRef = useRef<number>(Math.ceil(totalMs / 1000));
  const lastBeepSecondRef = useRef<number | null>(null);

  // Fullscreen
  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  // Fit big digits
  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const shownTime = useMemo(() => msToClock(displayMs), [displayMs]);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [
      shownTime,
      isFs,
      running,
      focusMode,
      milestones,
      showETA,
      progressPct,
    ],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 72,
  });

  const urgent =
    running && remainingRef.current > 0 && remainingRef.current <= 10_000;

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function hardSetRemaining(nextMs: number) {
    remainingRef.current = nextMs;

    const pct =
      totalMs > 0 ? Math.round(((totalMs - nextMs) / totalMs) * 100) : 0;
    const clampedPct = clamp(pct, 0, 100);
    if (clampedPct !== progressPct) setProgressPct(clampedPct);

    const sec = Math.max(0, Math.ceil(nextMs / 1000));
    if (sec !== lastShownSecRef.current) {
      lastShownSecRef.current = sec;
      setDisplayMs(sec * 1000);
    }
  }

  useEffect(() => {
    // When minutes changes, reset to new total.
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = totalMs;
    lastShownSecRef.current = Math.max(0, Math.ceil(totalMs / 1000));
    setDisplayMs(lastShownSecRef.current * 1000);
    setProgressPct(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    // Initialize end time once per run/resume
    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      // update refs and UI (throttled for digits)
      hardSetRemaining(rem);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        endRef.current = null;
        lastBeepSecondRef.current = null;
        setRunning(false);
        hardSetRemaining(0);
        if (sound) beep(660, 220);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sound, finalCountdownBeeps, beep, totalMs]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();
    hardSetRemaining(totalMs);
    setProgressPct(0);
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      // If resuming, clear endRef so it re-initializes from current remaining
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const endsAt = useMemo(() => {
    if (!showETA || !running) return null;
    const msLeft = remainingRef.current;
    const end = new Date(Date.now() + msLeft);
    return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [showETA, running, displayMs]);

  const milestoneText = useMemo(() => {
    if (!milestones || !running) return null;
    if (progressPct >= 75 && progressPct < 100) return "Last quarter";
    if (progressPct >= 50 && progressPct < 75) return "Halfway";
    if (progressPct >= 25 && progressPct < 50) return "Warming up";
    return "Start";
  }, [milestones, running, progressPct]);

  const statusLabel = running
    ? "Running"
    : remainingRef.current <= 0
      ? "Done"
      : remainingRef.current < totalMs
        ? "Paused"
        : "Ready";
  const canEditDuration = !running;

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
    } else if (k === "m") {
      setFocusMode((v) => !v);
    } else if (k === "s") {
      setSound((v) => !v);
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
        title="Study Timer"
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

      <div className={isFs ? "flex h-full flex-col" : "timer-session-stack flex h-full flex-col"}>
        {/* Display */}
        <DisplayStage
          stageRef={displayBoxRef}
          className={[
            "timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent
              ? "border-amber-200 bg-amber-50"
              : focusMode
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-slate-50",
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
              "text-slate-700",
            ].join(" ")}
          >
            {milestoneText ? milestoneText : "Study session"}
            {` · ${statusLabel}`}
            {endsAt ? ` · Ends at ${endsAt}` : ""}
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

          {/* Progress bar */}
          <div
            className={isFs ? "mt-5 w-full max-w-4xl" : "mt-4 w-full max-w-xl"}
          >
            <div
              className={[
                "h-2 w-full overflow-hidden rounded-full",
                isFs ? "bg-white/15" : "bg-slate-200",
              ].join(" ")}
            >
              <div
                className={isFs ? "h-full bg-white/75" : "h-full bg-amber-500"}
                style={{ width: `${progressPct}%` }}
              />
            </div>

          </div>
        </DisplayStage>

        {/* Settings + Presets (normal only) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Study presets">
              {presetsMin.map((m) => (
                <Chip
                  key={m}
                  active={m === minutes}
                  onClick={() => setPreset(m)}
                  disabled={!canEditDuration}
                >
                  {m}m
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup title="Settings">
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field
                  label="Custom minutes"
                  type="number"
                  min={1}
                  max={240}
                  value={minutes}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 240))
                  }
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle label="Sound" checked={sound} onCheckedChange={(v) => setSound(v)} />
                  <Toggle
                    label="Final beeps"
                    checked={finalCountdownBeeps}
                    onCheckedChange={(v) => setFinalCountdownBeeps(v)}
                    disabled={!sound}
                  />
                  <Toggle label="Focus mode" checked={focusMode} onCheckedChange={(v) => setFocusMode(v)} />
                  <Toggle label="Milestones" checked={milestones} onCheckedChange={(v) => setMilestones(v)} />
                  <Toggle label="Show end time" checked={showETA} onCheckedChange={(v) => setShowETA(v)} />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>
          </>
        )}

        {!isFs && (
          <ShortcutHint>
            Shortcuts: Space start/pause · R reset · F fullscreen · M focus mode · S sound
          </ShortcutHint>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · M focus mode · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {statusLabel}
              {sound ? "" : " · Sound off"}
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
export default function StudyTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/study-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Study Timer",
        url,
        description:
          "Fullscreen study timer for focus and homework. Big countdown, study-friendly presets, optional sound, and keyboard shortcuts.",
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
            name: "Study Timer",
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
        display={<StudyTimerCard />}
        title="Study Timer"
        description="Run a large, quiet study countdown with presets, focus mode, optional sound, milestones, and fullscreen mode."
      />

      <SeoBand title="How this timer works">
        <p>
          Study Timer keeps a study block visible first, then places presets,
          custom duration, optional sound, focus mode, milestone labels,
          end-time visibility, fullscreen, and keyboard shortcuts below the
          countdown. The result is a simple block timer for reading, review, and
          focused homework.
        </p>
        <h3>When to use it</h3>
        <p>
          Use it for single-subject study blocks, reading sessions, problem
          sets, flashcard review, writing time, or deep work that does not need a
          repeating Pomodoro cycle. The timer can help structure a session, but
          it does not guarantee academic performance.
        </p>
        <h3>Useful settings</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Presets cover common study lengths so a session can start quickly.
          </li>
          <li>
            End-time visibility helps you see when the current block is expected
            to finish.
          </li>
          <li>
            Focus mode keeps the active countdown visually quiet when you do not
            need extra labels.
          </li>
        </ul>
        <h3>Related tools</h3>
        <p>
          For work and break cycles, use the{" "}
          <a className="ilt-content-link" href="/pomodoro-timer">
            Pomodoro timer
          </a>
          . For a single focused block, try the{" "}
          <a className="ilt-content-link" href="/focus-session-timer">
            focus session timer
          </a>
          . For a short pause after studying, use the{" "}
          <a className="ilt-content-link" href="/break-timer">
            break timer
          </a>
          .
        </p>
      </SeoBand>
    </PageShell>
  );
}

// app/routes/silent-timer.tsx
import type { Route } from "./+types/silent-timer";
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

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Silent Timer (No Sound Countdown, Fullscreen)";
  const description =
    "Use a quiet visual countdown timer that starts with sound off. Ideal for classrooms, exams, libraries, meetings, and focus rooms where no-sound timing matters.";

  const url = "https://www.ilovetimers.com/silent-timer";

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

// WebAudio beep (kept lightweight, only used when Sound is enabled)
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
   SILENT TIMER CARD
========================================================= */
function parseInputToMs(str: string) {
  const parts = str
    .trim()
    .split(":")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return 0;

  let ms = 0;

  // Allow: ss, mm:ss, hh:mm:ss
  if (parts.length === 1) {
    const n = Number(parts[0] || "0");
    ms = (Number.isFinite(n) ? n : 0) * 1000;
  } else if (parts.length === 2) {
    const m = Number(parts[0] || "0");
    const s = Number(parts[1] || "0");
    const mm = Number.isFinite(m) ? m : 0;
    const ss = Number.isFinite(s) ? s : 0;
    ms = (mm * 60 + ss) * 1000;
  } else {
    const h = Number(parts[0] || "0");
    const m = Number(parts[1] || "0");
    const s = Number(parts[2] || "0");
    const hh = Number.isFinite(h) ? h : 0;
    const mm = Number.isFinite(m) ? m : 0;
    const ss = Number.isFinite(s) ? s : 0;
    ms = (hh * 3600 + mm * 60 + ss) * 1000;
  }

  // Clamp to 24 hours
  return clamp(Math.floor(ms), 0, 24 * 3600 * 1000);
}

function SilentTimerCard() {
  const beep = useBeep();
  const presets = useMemo(() => [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60], []);

  const [sound, setSound] = useState(false);
  const [loop, setLoop] = useState(false);

  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle",
  );

  const [durationMs, setDurationMs] = useState(5 * 60 * 1000);

  // Internal timing refs for snappy updates without heavy re-renders
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(durationMs);
  const durationRef = useRef<number>(durationMs);
  const statusRef = useRef<typeof status>(status);
  const soundRef = useRef<boolean>(sound);
  const loopRef = useRef<boolean>(loop);

  useEffect(() => {
    durationRef.current = durationMs;
    if (statusRef.current !== "running") {
      remainingRef.current = durationMs;
    }
  }, [durationMs]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Display state updates only when the shown clock string would change
  const [shownMs, setShownMs] = useState<number>(durationMs);

  useEffect(() => {
    remainingRef.current = durationMs;
    setShownMs(durationMs);
  }, []); // mount only

  // Keep input string in sync with duration when not running
  const [inputStr, setInputStr] = useState(msToClock(durationMs));
  useEffect(() => {
    if (status !== "running") setInputStr(msToClock(durationMs));
  }, [durationMs, status]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const setAllTo = useCallback(
    (ms: number) => {
      const next = clamp(ms, 0, 24 * 3600 * 1000);
      stopRaf();
      endTimeRef.current = null;

      remainingRef.current = next;
      durationRef.current = next;

      setDurationMs(next);
      setShownMs(next);
      setStatus("idle");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onPreset = (m: number) => {
    if (status === "running") setStatus("paused");
    setAllTo(m * 60 * 1000);
  };

  const onSet = () => {
    if (status === "running") setStatus("paused");
    const ms = parseInputToMs(inputStr);
    setAllTo(ms);
  };

  const onReset = () => {
    stopRaf();
    endTimeRef.current = null;

    remainingRef.current = durationRef.current;
    setShownMs(durationRef.current);
    setStatus("idle");
  };

  const onStartPause = () => {
    if (statusRef.current === "running") {
      // Pause, store current remainder
      const now = performance.now();
      const rem = Math.max(0, (endTimeRef.current ?? now) - now);
      remainingRef.current = rem;
      endTimeRef.current = null;
      stopRaf();

      // Snap shown state
      const nextShown = Math.ceil(rem / 1000) * 1000;
      setShownMs(nextShown);
      setStatus("paused");
      return;
    }

    // (Re)start
    if (statusRef.current === "done") {
      remainingRef.current = durationRef.current;
      setShownMs(durationRef.current);
    }

    if (remainingRef.current <= 0) {
      remainingRef.current = durationRef.current;
      setShownMs(durationRef.current);
    }

    setStatus("running");
  };

  useEffect(() => {
    if (status !== "running") {
      stopRaf();
      endTimeRef.current = null;
      return;
    }

    // Initialize end time from current remaining
    endTimeRef.current = performance.now() + remainingRef.current;

    let lastShown = -1;

    const tick = () => {
      const now = performance.now();
      const end = endTimeRef.current ?? now;
      const rem = Math.max(0, end - now);
      remainingRef.current = rem;

      // Only update React state when the displayed second changes
      const nextShown = Math.ceil(rem / 1000) * 1000;
      if (nextShown !== lastShown) {
        lastShown = nextShown;
        setShownMs(nextShown);
      }

      if (rem <= 0) {
        // Finish
        if (soundRef.current) beep();
        if (loopRef.current) {
          remainingRef.current = durationRef.current;
          endTimeRef.current = performance.now() + durationRef.current;
          lastShown = durationRef.current;
          setShownMs(durationRef.current);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        endTimeRef.current = null;
        stopRaf();
        setStatus("done");
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [status, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  const shownTime = msToClock(shownMs);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, status, durationMs],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const statusLabel =
    status === "running"
      ? "Running"
      : status === "paused"
        ? "Paused"
        : status === "done"
          ? "Done"
          : "Ready";

  const urgent =
    status === "running" &&
    remainingRef.current > 0 &&
    remainingRef.current <= 10_000;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      onStartPause();
    } else if (k === "r") {
      onReset();
    } else if (k === "f") {
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
        title="Silent Timer"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn kind="solid" onClick={onStartPause} className="py-1 text-sm">
              {status === "running"
                ? "Pause"
                : status === "done"
                  ? "Restart"
                  : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={onReset} className="py-1 text-sm">
              Reset
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
            "order-1 timer-display-surface relative flex flex-col items-center justify-center text-slate-950",
            urgent ? "bg-amber-50" : "border-slate-200",
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
            if (isFs) onStartPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Countdown
          </div>

          <div className="mt-1 text-xs font-semibold text-slate-600">
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

          {isFs && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 sm:left-6 sm:right-6 sm:top-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                    Settings
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Sound: {sound ? "On" : "Off"}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      Loop: {loop ? "On" : "Off"}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  Space = Start/Pause
                </div>
              </div>
            </div>
          )}
        </DisplayStage>

        {/* Presets + settings (normal only, below display) */}
        {!isFs && (
          <>
            <ControlGroup>
              <Btn kind="solid" onClick={onStartPause}>
                {status === "running"
                  ? "Pause"
                  : status === "done"
                    ? "Restart"
                    : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={onReset}>
                Reset
              </Btn>
            </ControlGroup>

            <PresetGroup title="Presets">
              {presets.map((m) => {
                const active =
                  status !== "running" && durationMs === m * 60 * 1000;
                return (
                  <Chip
                    key={m}
                    active={active}
                    onClick={() => onPreset(m)}
                    disabled={status === "running"}
                  >
                    {m}m
                  </Chip>
                );
              })}
            </PresetGroup>

            <SettingGroup
              title="Settings"
              description="Sound stays off by default for quiet timing."
            >
              <SettingRow className="lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <Field
                  label="Custom time"
                  inputMode="numeric"
                  value={inputStr}
                  onChange={(e) => {
                    if (status === "running") setStatus("paused");
                    setInputStr(e.target.value);
                  }}
                  onBlur={onSet}
                  placeholder="mm:ss or ss"
                />
                <div className="flex items-end">
                  <Btn kind="ghost" onClick={onSet}>
                    Set
                  </Btn>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
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
              Shortcuts: Space start/pause · R reset · F fullscreen
            </ShortcutHint>
          </>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
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
export default function SilentTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/silent-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Silent Timer",
        url,
        description:
          "Silent countdown timer with optional sound, loop, fullscreen, presets, custom time input, and keyboard shortcuts.",
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
            name: "Silent Timer",
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
        display={<SilentTimerCard />}
        title="Silent Timer"
        description="Run a quiet visual countdown for classrooms, meetings, exams, libraries, and other no-alarm settings."
      />

      <SeoBand>
        <ContentSection title="How this silent timer works">
          <p>
            Silent Timer is for a quiet countdown first. Sound starts off, the
            timer stays visual, and the main display shows the remaining time in
            large digits. Pick a preset, type a custom time, press Start, and
            use the screen itself as the cue when time is up.
          </p>
          <p>
            The page still includes an optional Sound toggle for cases where you
            decide a short beep is appropriate, but the quiet use case is the
            default. Leave Sound off for libraries, classrooms, shared offices,
            naps, meditation sessions, meetings, exams, and focus work where an
            audible alert would be distracting.
          </p>
        </ContentSection>

        <ContentSection title="When to use a no-sound countdown">
          <p>
            Use this route when the end of the timer should be noticed by the
            person watching the screen, not announced to the whole room. It is a
            good fit for projected classroom transitions, reading periods,
            quiet exam practice, meditation blocks, desk focus sessions, and
            meeting timeboxes where a visual finish state is enough.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Presets cover common short and medium countdowns without opening
              the custom time field.
            </li>
            <li>
              Custom time accepts seconds, minutes and seconds, or an
              hour-style entry when the preset list does not match the task.
            </li>
            <li>
              Loop can restart the same visual countdown for recurring desk
              checks, station rotations, repeated practice rounds, or quiet
              reminders.
            </li>
            <li>
              Fullscreen keeps the digits readable on a second screen, shared
              screen, projector, or nearby tablet.
            </li>
          </ul>
        </ContentSection>

        <ContentSection title="Limits and quiet-room notes">
          <p>
            A silent browser timer is not a safety alarm, proctoring system, or
            official time source. Keep the page open and visible if the visual
            finish state matters. If the device sleeps, the display updates when
            the browser resumes, and audio only plays if you explicitly turn
            Sound on and the browser allows playback after interaction.
          </p>
        </ContentSection>

        <ContentSection title="Related quiet and visual tools">
          <p>
            For an even more visual countdown, try the{" "}
            <a className="ilt-content-link" href="/visual-timer">
              visual timer
            </a>
            . For the largest projected display, use the{" "}
            <a className="ilt-content-link" href="/fullscreen-timer">
              fullscreen timer
            </a>
            . For a standard countdown with more general wording, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            . For quiet practice blocks, see the{" "}
            <a className="ilt-content-link" href="/meditation-timer">
              meditation timer
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/exam-timer">
              exam timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Silent timer FAQ">
          <h3>Does this timer make sound?</h3>
          <p>
            Sound is off by default. If you leave Sound off, the timer ends with
            a visual state instead of an audible beep. If you turn Sound on, the
            browser may play a short beep at the end after user interaction.
          </p>
          <h3>Can I use it in fullscreen?</h3>
          <p>
            Yes. Fullscreen keeps the countdown large and simple, and the active
            fullscreen view does not include ad placements.
          </p>
          <h3>Is this the same as timezone conversion?</h3>
          <p>
            No. This page counts down a duration. It does not convert time zones
            or calculate clock times.
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

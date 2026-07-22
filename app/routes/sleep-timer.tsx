// app/routes/sleep-timer.tsx
import type { Route } from "./+types/sleep-timer";
import { data as json } from "react-router";
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
  ContentSection,
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
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import { trackEvent } from "~/clients/lib/analytics";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const REVIEW_DATE = { iso: "2026-07-14", label: "July 14, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Sleep Timer Online | Quiet Bedtime Countdown";
  const description =
    "Run a quiet browser countdown for reading, wind-down reminders, or a short nap with presets, dim mode, optional sound, and fullscreen controls.";

  const url = "https://www.ilovetimers.com/sleep-timer";

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
   SLEEP TIMER CARD
========================================================= */
function SleepTimerCard() {
  const beep = useBeep();
  const analyticsBase = useMemo(() => ({ tool: "sleep_timer" }), []);

  const presetsMin = useMemo(() => [5, 10, 15, 20, 30, 45, 60, 90, 120], []);
  const [minutes, setMinutes] = useState(30);

  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const remainingRef = useRef<number>(minutes * 60 * 1000);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [softAlarm, setSoftAlarm] = useState(true);
  const [dimMode, setDimMode] = useState(false);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  // When minutes changes, reset to that duration and stop.
  useEffect(() => {
    const next = minutes * 60 * 1000;
    setRemaining(next);
    remainingRef.current = next;

    setRunning(false);
    endRef.current = null;
    stopRaf();
  }, [minutes]);

  // Main timing loop (fixed: does NOT depend on "remaining", so it stays snappy).
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      // Keep ref in sync for instant pause/resume accuracy.
      remainingRef.current = rem;
      setRemaining(rem);

      if (rem <= 0) {
        endRef.current = null;
        setRunning(false);
        stopRaf();

        // Alarm
        if (sound && softAlarm) {
          beep(523.25, 160, 0.05);
          window.setTimeout(() => beep(659.25, 160, 0.05), 260);
          window.setTimeout(() => beep(783.99, 200, 0.05), 520);
        } else if (sound) {
          beep(660, 220, 0.07);
        }
        trackEvent("timer_complete", analyticsBase);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [analyticsBase, running, sound, softAlarm, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    trackEvent("timer_reset", analyticsBase);
    const next = minutes * 60 * 1000;
    setRunning(false);
    setRemaining(next);
    remainingRef.current = next;
    endRef.current = null;
    stopRaf();
  }

  function startPause() {
    const durationMs = minutes * 60 * 1000;
    trackEvent(
      running
        ? "timer_pause"
        : remaining < durationMs && remaining > 0
          ? "timer_resume"
          : "timer_start",
      {
        ...analyticsBase,
        duration_seconds: minutes * 60,
      },
    );
    setRunning((r) => {
      const next = !r;
      if (!next) {
        // pausing: freeze remaining precisely
        endRef.current = null;
        stopRaf();
      } else {
        // starting: endRef gets set in effect using remainingRef
      }
      return next;
    });
  }

  function setPreset(m: number) {
    setMinutes(m);
    trackEvent("preset_selected", {
      ...analyticsBase,
      duration_seconds: m * 60,
    });
    trackEvent("duration_changed", {
      ...analyticsBase,
      source: "preset",
    });
  }

  const durationMs = minutes * 60 * 1000;
  const statusLabel =
    remaining <= 0
      ? "Done"
      : running
        ? "Running"
        : remaining < durationMs
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
      if (!isFs) trackEvent("fullscreen_opened", analyticsBase);
      void fullscreen.toggle();
    } else if (k === "d") {
      setDimMode((x) => !x);
    } else if (k === "escape" && isFs) {
      void fullscreen.exit();
    }
  };

  // Round display to whole seconds, but keep internal ms for accuracy.
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, dimMode],
    minPx: 56,
    maxPx: isFs ? 560 : 520,
    paddingAllowancePx: isFs ? 72 : 72,
  });

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={dimMode && isFs ? "bg-black text-white" : ""}
    >
      <FullscreenTopBar
        show={isFs}
        title="Sleep Timer"
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
            "relative flex flex-col items-center justify-center text-slate-950",
            !dimMode ? "timer-display-surface" : "",
            dimMode
              ? "bg-black text-white border-slate-800"
              : "bg-slate-50 border-slate-200",
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
              dimMode ? "text-white/70" : "text-slate-700",
            ].join(" ")}
          >
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

        {/* Controls (normal only) */}
        {!isFs && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <ControlGroup>
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <SettingGroup title="Quiet settings" className="order-2">
              <SettingRow className="sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <Field
                  label="Minutes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={360}
                  value={minutes}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 360))
                  }
                  onBlur={() =>
                    trackEvent("duration_changed", {
                      ...analyticsBase,
                      source: "custom",
                    })
                  }
                />
                <Toggle
                  checked={sound}
                  onCheckedChange={(v) => {
                    setSound(v);
                    if (v) trackEvent("sound_enabled", analyticsBase);
                    if (!v) setSoftAlarm(true); // keep consistent default when re-enabled
                  }}
                  label="Sound"
                />
                <Toggle
                  checked={softAlarm}
                  onCheckedChange={setSoftAlarm}
                  label="Soft alarm"
                  disabled={!sound}
                />
                <Toggle
                  checked={dimMode}
                  onCheckedChange={setDimMode}
                  label="Dim mode"
                />
              </SettingRow>
            </SettingGroup>

            <div className="order-1 flex flex-col gap-3">
              <PresetGroup>
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
            </div>

            <SecondaryActionRow className="order-3">
              <Btn
                kind="ghost"
                onClick={() => {
                  trackEvent("fullscreen_opened", analyticsBase);
                  void fullscreen.toggle();
                }}
              >
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="order-4">
              Shortcuts: Space start/pause · R reset · F fullscreen · D dim
            </ShortcutHint>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen · D dim
            </div>
            <div className="ilt-helper-text font-semibold">
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
export default function SleepTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/sleep-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Sleep Timer",
        url,
        dateModified: REVIEW_DATE.iso,
        description:
          "Online sleep timer with countdown, dim mode, fullscreen, and optional soft alarm.",
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
          { "@type": "ListItem", position: 2, name: "Sleep Timer", item: url },
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
        display={<SleepTimerCard />}
        title="Sleep Timer"
        description="Set a quiet bedtime countdown with soft alarm, dim mode, presets, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="How this sleep timer works">
          <p>
            Sleep Timer is a quiet countdown for bedtime-adjacent tasks such as
            reading, music timing, a device-off reminder, a wind-down window, or
            a short nap countdown. Choose a preset or custom minutes, then use
            start, pause, reset, dim mode, soft alarm, optional sound,
            fullscreen, and keyboard shortcuts as needed.
          </p>
          <p>
            The timer stays visible first and keeps settings below the display.
            Dim mode changes the visual intensity while keeping the remaining
            time readable; soft alarm and sound can be left off when you want a
            quiet page.
          </p>
          <p>
            It controls only its own browser countdown and optional sound. It
            does not stop external media, close another application, shut down
            the device, or keep the device awake.
          </p>
        </ContentSection>
        <ContentSection title="When to use it">
          <ul className="list-disc space-y-2 pl-5">
            <li>Set 15 minutes for reading before stopping.</li>
            <li>Use 30 minutes as a device-off reminder.</li>
            <li>Use a short preset for a nap countdown or quiet pause.</li>
            <li>
              Keep sound off if a visual countdown is enough for the room.
            </li>
          </ul>
        </ContentSection>
        <ToolTrustNote reviewDate={REVIEW_DATE} heading="What this timer can and cannot do">
          <p>
            This browser timer cannot guarantee that another application,
            media player, browser tab, or device will stop or remain awake.
            Background throttling, tab closure, permissions, and device sleep
            can affect completion behavior.
          </p>
          <p>
            It is a general timing tool, not medical or sleep-health advice. It
            does not control external media or make claims about sleep quality.
          </p>
        </ToolTrustNote>
        <ContentSection title="Related quiet timers">
          <p>
            For a general-purpose duration, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            . For no-sound countdowns, use the{" "}
            <a className="ilt-content-link" href="/silent-timer">
              silent timer
            </a>
            . For a quiet timed session, try the{" "}
            <a className="ilt-content-link" href="/meditation-timer">
              meditation timer
            </a>
            . For a direct alarm time, use the{" "}
            <a className="ilt-content-link" href="/alarm-timer">
              alarm timer
            </a>
            . For daytime pause timing, use the{" "}
            <a className="ilt-content-link" href="/break-timer">
              break timer
            </a>
            .
          </p>
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

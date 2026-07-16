// app/routes/alarm-timer.tsx
import type { Route } from "./+types/alarm-timer";
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

const FAQ_ITEMS = [
  {
    question: "How is Alarm Timer different from Online Alarm Clock?",
    answer:
      "Alarm Timer counts down a duration such as 10 minutes. Online Alarm Clock schedules a browser alarm for a local clock time such as 3:30 PM.",
  },
  {
    question: "Will the countdown stay aligned in another tab?",
    answer:
      "The countdown reconciles against elapsed time while the page remains open, but a background tab may repaint less often and catch up when you return.",
  },
  {
    question: "What can prevent the alarm sound?",
    answer:
      "Browser audio rules, device mute or volume, tab closure, browser suspension, and device sleep can prevent or delay sound. Use a device alarm for critical alerts.",
  },
  {
    question: "How do I stop a completed alarm?",
    answer:
      "Use Stop alarm when the timer reaches zero. Reset also stops the sound and restores the selected duration.",
  },
] as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Alarm Timer Online | Countdown with Sound";
  const description =
    "Set an alarm after a chosen duration with presets, pause and resume controls, optional final beeps, fullscreen, and a clear stop-alarm action at zero.";

  const url = "https://www.ilovetimers.com/alarm-timer";

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
      content: `https://www.ilovetimers.com/og-image.png`,
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

// WebAudio beep
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
   ALARM TIMER CARD
========================================================= */
function AlarmTimerCard() {
  const beep = useBeep();

  const presetsMin = useMemo(
    () => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 45, 60],
    [],
  );

  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(minutes * 60 * 1000);
  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const [alarming, setAlarming] = useState(false);
  const alarmIntervalRef = useRef<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  // When minutes changes, reset timer
  useEffect(() => {
    stopAlarm();
    setRemaining(minutes * 60 * 1000);
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAlarm(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAlarm() {
    setAlarming(true);

    if (alarmIntervalRef.current)
      window.clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = window.setInterval(() => {
      if (!sound) return;
      beep(880, 160, 0.12);
      window.setTimeout(() => beep(660, 180, 0.12), 180);
    }, 700);
  }

  function stopAlarm(silentCleanup = false) {
    setAlarming(false);
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (!silentCleanup && sound) {
      beep(520, 90, 0.08);
    }
  }

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      endRef.current = null;
      lastBeepSecondRef.current = null;
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
        startAlarm();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, remaining, sound, finalCountdownBeeps, beep]);

  function reset() {
    stopAlarm(true);
    setRunning(false);
    setRemaining(minutes * 60 * 1000);
    endRef.current = null;
    lastBeepSecondRef.current = null;
  }

  function startPause() {
    if (alarming) {
      stopAlarm(true);
      setRemaining(minutes * 60 * 1000);
      setRunning(false);
      endRef.current = null;
      lastBeepSecondRef.current = null;
      return;
    }

    setRunning((r) => !r);
    lastBeepSecondRef.current = null;
  }

  function setPreset(m: number) {
    setMinutes(m);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (e.key.toLowerCase() === "r") {
      reset();
    } else if (e.key.toLowerCase() === "f") {
      void fullscreen.toggle();
    } else if (e.key.toLowerCase() === "s") {
      setSound((v) => !v);
    } else if (e.key.toLowerCase() === "x") {
      if (alarming) stopAlarm(true);
    }
  };

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = msToClock(Math.ceil(remaining / 1000) * 1000);
  const canEditDuration = !running && !alarming;

  const displayTone = alarming
    ? "bg-amber-50 text-slate-950"
    : urgent
      ? "bg-amber-50 text-slate-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  // Fit the time text as large as possible without clipping
  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    // padding inside display box plus a little safety
    paddingAllowancePx: isFs ? 48 : 56,
  });

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Alarm Timer"
        onExit={() => void fullscreen.exit()}
        left={
          <div className="hidden items-center gap-2 sm:flex">
            <Toggle
              label="Sound"
              checked={sound}
              onCheckedChange={setSound}
              className="py-1 text-sm"
            />
            <Toggle
              label="Final beeps"
              checked={finalCountdownBeeps}
              onCheckedChange={setFinalCountdownBeeps}
              disabled={!sound}
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
              {alarming ? "Stop alarm" : running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-countdown-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <ControlGroup>
            <Btn kind="solid" onClick={startPause}>
              {alarming ? "Stop alarm" : running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset}>
              Reset
            </Btn>
          </ControlGroup>
        )}

        {/* Presets + inputs (normal only) */}
        {!isFs && (
          <>
            <PresetGroup title="Presets">
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
              <SettingRow>
                <Field
                  label="Custom minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  disabled={!canEditDuration}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                  }
                />
                <div className="flex flex-wrap items-end gap-3">
                  <Toggle label="Sound" checked={sound} onCheckedChange={setSound} />
                  <Toggle
                    label="Final beeps"
                    checked={finalCountdownBeeps}
                    onCheckedChange={setFinalCountdownBeeps}
                    disabled={!sound}
                  />
                </div>
              </SettingRow>
            </SettingGroup>

            <SecondaryActionRow>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: Space start/pause · R reset · F fullscreen · S sound · X stop alarm
            </ShortcutHint>
          </>
        )}

        {/* Display (big as possible, responsive, no clipping) */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "order-1 timer-display-surface flex items-center justify-center font-mono font-extrabold",
            displayTone,
            // kill unnecessary padding on mobile, but keep some breathing room
            "p-3 sm:p-6",
            // on fullscreen: use the screen, no dead space
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
              // tracking that looks good on desktop can cause clipping on narrow phones
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              // helps prevent tiny overflows due to font rendering
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>
        </DisplayStage>

        {/* Fullscreen bottom controls (tight on mobile) */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Field
                label="Minutes"
                type="number"
                min={1}
                max={180}
                value={minutes}
                disabled={!canEditDuration}
                onChange={(e) =>
                  setMinutes(clamp(Number(e.target.value || 1), 1, 180))
                }
                className="w-24"
              />

              <div className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
                Space start/pause / R reset / F fullscreen / S sound
                {alarming ? " / Alarm ringing (X stops)" : ""}
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
export default function AlarmTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/alarm-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Alarm Timer",
        url,
        description:
          "Alarm timer with a countdown alarm online. Works while the page is open. Fullscreen display, optional sound, and keyboard shortcuts.",
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
          { "@type": "ListItem", position: 2, name: "Alarm Timer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
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
        display={<AlarmTimerCard />}
        title="Alarm Timer"
        description="Set a countdown alarm with optional sound, final beeps, quick presets, and a readable fullscreen view."
      />

      <SeoBand>
        <ContentSection title="How this duration alarm works">
          <p>
            Choose a preset or enter 1 to 180 minutes, then start the countdown.
            Pause and resume preserve the remaining duration, and Reset restores
            the selected starting time. At zero, the alarm state stays visible
            and Stop alarm is available when sound is enabled.
          </p>
          <p>
            Alarm Timer is relative: it answers “alert me after 10 minutes.” For
            an alarm at a time of day, use the{" "}
            <a className="ilt-content-link" href="/online-alarm-clock">
              online alarm clock
            </a>
            . For a general countdown where the alarm-specific controls are not
            needed, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            .
          </p>
        </ContentSection>
        <ContentSection title="Sound and browser limits">
          <p>
            Sound and final beeps are optional. Browsers may require a click or
            tap before audio can play, and background throttling can make the
            display update less often even though elapsed time is reconciled.
            Keep the page open and the device awake when the alert matters.
          </p>
          <p>
            This is not a device-level alarm. Closing the tab, browser
            suspension, device sleep, mute settings, or a disconnected output
            device can prevent sound. Use a phone or system alarm for wake-ups,
            safety checks, or other critical reminders.
          </p>
        </ContentSection>
        <ContentSection title="Alarm timer FAQ">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

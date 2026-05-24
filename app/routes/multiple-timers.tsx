// app/routes/multiple-timers.tsx
import type { Route } from "./+types/multiple-timers";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button as Btn,
  ControlGroup,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip,
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/multiple-timers/HowItWorks";
import Disclaimer from "~/clients/components/multiple-timers/Disclaimer";
import FAQ from "~/clients/components/multiple-timers/FAQ";
import KeyboardShortcuts from "~/clients/components/multiple-timers/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/multiple-timers/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Multiple Timers Online (Run Two or More at Once)";
  const description =
    "Run multiple timers at the same time. Start two or more countdowns side by side with big, clear digits. Ideal for cooking, workouts, classes, and labs.";

  const url = "https://www.ilovetimers.com/multiple-timers";

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
   LOCAL CACHE (PERSISTENCE)
========================================================= */
const STORAGE_KEY = "ilovetimers:multiple-timers:v2";

type StoredTimer = {
  id: string;
  label: string;
  seconds: number;
  remainingMs: number;
};

type StoredState = {
  v: 2;
  savedAt: number;
  sound: boolean;
  finalCountdownBeeps: boolean;
  timers: StoredTimer[];
};

function safeParseJSON<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  return safeParseJSON<StoredState>(window.localStorage.getItem(STORAGE_KEY));
}

function saveStoredState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy mode issues
  }
}

/* =========================================================
   MULTIPLE TIMERS CARD
========================================================= */
type TimerItem = {
  id: string;
  label: string;
  seconds: number;
  remainingMs: number;
  running: boolean;
  alarming: boolean;
  endAt?: number | null; // performance.now() target
  lastBeepSec?: number | null;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function MultipleTimersCard() {
  const beep = useBeep();
  const presetsMin = useMemo(() => [1, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30], []);

  const defaultTimers: TimerItem[] = useMemo(
    () => [
      {
        id: "timer-a",
        label: "Timer A",
        seconds: 5 * 60,
        remainingMs: 5 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
      {
        id: "timer-b",
        label: "Timer B",
        seconds: 10 * 60,
        remainingMs: 10 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
    ],
    [],
  );

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(false);
  const [timers, setTimers] = useState<TimerItem[]>(defaultTimers);

  // ✅ real hydration gate: persist only after restored state has committed
  const [hydrated, setHydrated] = useState(false);

  // Latest-state refs for rAF + alarm loops
  const timersRef = useRef<TimerItem[]>(defaultTimers);
  useEffect(() => {
    timersRef.current = timers;
  }, [timers, defaultTimers]);

  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const finalBeepsRef = useRef(finalCountdownBeeps);
  useEffect(() => {
    finalBeepsRef.current = finalCountdownBeeps;
  }, [finalCountdownBeeps]);

  const rafRef = useRef<number | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const startRafIfNeeded = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(function tick() {
      const now = performance.now();

      setTimers((prev) => {
        let changed = false;

        const next = prev.map((t) => {
          if (!t.running) return t;

          const endAt = t.endAt ?? now + t.remainingMs;
          const rem = Math.max(0, endAt - now);

          if (
            soundRef.current &&
            finalBeepsRef.current &&
            rem > 0 &&
            rem <= 5_000
          ) {
            const secLeft = Math.ceil(rem / 1000);
            if (t.lastBeepSec !== secLeft) {
              const pitch = 740 + (t.id.charCodeAt(0) % 5) * 40;
              beep(pitch, 70, 0.08);
              changed = true;
              return { ...t, endAt, remainingMs: rem, lastBeepSec: secLeft };
            }
          }

          if (rem <= 0) {
            changed = true;
            return {
              ...t,
              running: false,
              alarming: true,
              endAt: null,
              remainingMs: 0,
              lastBeepSec: null,
            };
          }

          if (rem !== t.remainingMs || t.endAt !== endAt) {
            changed = true;
            return { ...t, endAt, remainingMs: rem };
          }

          return t;
        });

        return changed ? next : prev;
      });

      const anyRunning = timersRef.current.some((t) => t.running);
      if (anyRunning) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    });
  }, [beep]);

  useEffect(() => {
    const anyRunning = timers.some((t) => t.running);
    if (anyRunning) startRafIfNeeded();
    else stopRaf();
  }, [timers, startRafIfNeeded, stopRaf]);

  useEffect(() => stopRaf, [stopRaf]);

  // Restore persisted state after mount
  useEffect(() => {
    const stored = loadStoredState();

    if (stored && stored.v === 2) {
      const restoredTimers: TimerItem[] = (stored.timers || [])
        .filter((t) => t && typeof t.id === "string")
        .map((t) => {
          const seconds = clamp(Number(t.seconds || 0), 1, 24 * 60 * 60);
          const remainingMs = clamp(
            Number(t.remainingMs || 0),
            0,
            seconds * 1000,
          );

          return {
            id: t.id,
            label: String(t.label || "Timer"),
            seconds,
            remainingMs,
            running: false,
            alarming: false,
            endAt: null,
            lastBeepSec: null,
          };
        });

      setSound(!!stored.sound);
      setFinalCountdownBeeps(!!stored.finalCountdownBeeps);
      setTimers(restoredTimers.length ? restoredTimers : defaultTimers);
    } else {
      setTimers(defaultTimers);
    }

    // ✅ triggers a re-render; persist effect will run on the next commit
    setHydrated(true);
  }, [defaultTimers]);

  // Persist (only after hydration)
  useEffect(() => {
    if (!hydrated) return;

    const stored: StoredState = {
      v: 2,
      savedAt: Date.now(),
      sound,
      finalCountdownBeeps,
      timers: timers.map((t) => ({
        id: t.id,
        label: t.label,
        seconds: t.seconds,
        remainingMs: t.remainingMs,
      })),
    };

    saveStoredState(stored);
  }, [hydrated, timers, sound, finalCountdownBeeps]);

  const anyAlarming = timers.some((t) => t.alarming);

  useEffect(() => {
    if (!anyAlarming) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    if (alarmIntervalRef.current) return;

    alarmIntervalRef.current = window.setInterval(() => {
      if (!soundRef.current) return;
      beep(880, 130, 0.11);
      window.setTimeout(() => beep(660, 160, 0.11), 150);
    }, 750);

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [anyAlarming, beep]);

  function addTimer() {
    setTimers((prev) => [
      ...prev,
      {
        id: uid(),
        label: `Timer ${String.fromCharCode(65 + prev.length)}`,
        seconds: 5 * 60,
        remainingMs: 5 * 60 * 1000,
        running: false,
        alarming: false,
        endAt: null,
        lastBeepSec: null,
      },
    ]);
  }

  function removeTimer(id: string) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }

  function updateLabel(id: string, label: string) {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)));
  }

  function setSeconds(id: string, seconds: number) {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const s = clamp(seconds, 1, 24 * 60 * 60);
        return {
          ...t,
          seconds: s,
          remainingMs: s * 1000,
          running: false,
          alarming: false,
          endAt: null,
          lastBeepSec: null,
        };
      }),
    );
  }

  function setPreset(id: string, minutes: number) {
    setSeconds(id, minutes * 60);
  }

  function startPause(id: string) {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (t.alarming) {
          return {
            ...t,
            alarming: false,
            running: false,
            remainingMs: t.seconds * 1000,
            endAt: null,
            lastBeepSec: null,
          };
        }

        if (t.running) {
          const now = performance.now();
          const rem = Math.max(0, (t.endAt ?? now + t.remainingMs) - now);
          return {
            ...t,
            running: false,
            endAt: null,
            remainingMs: rem,
            lastBeepSec: null,
          };
        }

        const base = t.remainingMs > 0 ? t.remainingMs : t.seconds * 1000;
        const now = performance.now();
        return {
          ...t,
          running: true,
          alarming: false,
          endAt: now + base,
          remainingMs: base,
          lastBeepSec: null,
        };
      }),
    );
  }

  function resetOne(id: string) {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              running: false,
              alarming: false,
              remainingMs: t.seconds * 1000,
              endAt: null,
              lastBeepSec: null,
            }
          : t,
      ),
    );
  }

  function stopAlarmOne(id: string) {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, alarming: false } : t)),
    );
  }

  function startAll() {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.alarming || t.running) return t;
        const base = t.remainingMs > 0 ? t.remainingMs : t.seconds * 1000;
        return {
          ...t,
          running: true,
          alarming: false,
          endAt: now + base,
          remainingMs: base,
          lastBeepSec: null,
        };
      }),
    );
  }

  function pauseAll() {
    const now = performance.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (!t.running) return t;
        const rem = Math.max(0, (t.endAt ?? now + t.remainingMs) - now);
        return {
          ...t,
          running: false,
          endAt: null,
          remainingMs: rem,
          lastBeepSec: null,
        };
      }),
    );
  }

  function resetAll() {
    setTimers((prev) =>
      prev.map((t) => ({
        ...t,
        running: false,
        alarming: false,
        remainingMs: t.seconds * 1000,
        endAt: null,
        lastBeepSec: null,
      })),
    );
  }

  function stopAllAlarms() {
    setTimers((prev) => prev.map((t) => ({ ...t, alarming: false })));
  }

  const anyRunning = timers.some((t) => t.running);
  const statusLabel = anyAlarming ? "Alarm" : anyRunning ? "Running" : "Ready";

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      anyRunning ? pauseAll() : startAll();
    } else if (k === "r") {
      resetAll();
    } else if (k === "x") {
      stopAllAlarms();
    } else if (k === "a") {
      addTimer();
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
        title="Multiple Timers"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={anyRunning ? pauseAll : startAll}
              className="py-1 text-sm"
            >
              {anyRunning ? "Pause all" : "Start all"}
            </Btn>
            <Btn kind="ghost" onClick={addTimer} className="py-1 text-sm">
              Add
            </Btn>
            <Btn kind="ghost" onClick={resetAll} className="py-1 text-sm">
              Reset
            </Btn>
            <Btn
              kind="danger"
              onClick={stopAllAlarms}
              className="py-1 text-sm"
              disabled={!anyAlarming}
            >
              Stop alarms
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-list-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="timer-control-stack">
            <ControlGroup className="timer-list-actions">
              <Btn onClick={anyRunning ? pauseAll : startAll}>
                {anyRunning ? "Pause all" : "Start all"}
              </Btn>
              <Btn kind="ghost" onClick={resetAll}>
                Reset all
              </Btn>
              <Btn kind="ghost" onClick={addTimer}>
                Add timer
              </Btn>
              <Btn
                kind="danger"
                onClick={stopAllAlarms}
                disabled={!anyAlarming}
              >
                Stop alarms
              </Btn>
            </ControlGroup>

            <SettingGroup
              title="Shared timer options"
              description="Sound cues apply to every timer in the list."
            >
              <SettingRow className="sm:grid-cols-2">
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

            <SecondaryActionRow className="timer-list-actions">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint className="timer-list-shortcut">
              Space start/pause all / R reset / A add / X stop alarms / F fullscreen
            </ShortcutHint>
          </div>
        )}

        {/* Grid */}
        <div
          className={[
            "timer-display-surface relative mt-4",
            "p-3 sm:p-4",
            isFs ? "mx-2 sm:mx-4 flex-1 overflow-auto" : "",
          ].join(" ")}
          style={{
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            overflowAnchor: "none",
          }}
        >
          <div className="timer-list-grid mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
            {timers.map((t, idx) => {
              const urgent =
                t.running && t.remainingMs > 0 && t.remainingMs <= 10_000;
              const shown = msToClock(Math.ceil(t.remainingMs / 1000) * 1000);

              const tileTone = t.alarming
                ? "bg-slate-100"
                : urgent
                  ? "bg-slate-50"
                  : "border-slate-200 bg-white";

              const timeSize = isFs
                ? "text-[clamp(2.8rem,7vw,6rem)]"
                : "text-[clamp(2.4rem,6vw,4.8rem)]";

              return (
                <div
                  key={t.id}
                  className={[
                    "timer-repeated-card timer-list-row",
                    tileTone,
                    isFs ? "p-4 sm:p-5" : "p-4",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-center">
                    <div
                      className={`font-mono font-extrabold tracking-widest text-[var(--ilt-text-primary)] ${timeSize}`}
                    >
                      {shown}
                    </div>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <input
                        value={t.label}
                        onChange={(e) => updateLabel(t.id, e.target.value)}
                        className="w-full ilt-input-control px-2 py-1 text-sm font-extrabold"
                        aria-label={`Label for timer ${idx + 1}`}
                      />
                      <div className="mt-1 ilt-helper-text font-semibold">
                        {t.alarming
                          ? "Alarm ringing"
                          : t.running
                            ? "Running"
                            : "Paused"}
                      </div>
                    </div>

                    <Btn
                      kind="ghost"
                      size="sm"
                      onClick={() => removeTimer(t.id)}
                      className="min-h-8 px-2 text-xs"
                      title="Remove timer"
                      aria-label="Remove timer"
                    >
                      remove
                    </Btn>
                  </div>

                  {/* Presets */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {presetsMin.map((m) => {
                      const active =
                        Math.round(t.seconds / 60) === m &&
                        !t.running &&
                        !t.alarming;
                      return (
                        <PresetChip
                          key={m}
                          onClick={() => setPreset(t.id, m)}
                          selected={active}
                          title="Sets duration and resets this timer"
                        >
                          {m}m
                        </PresetChip>
                      );
                    })}
                  </div>

                  {/* Custom */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr]">
                    <label className="block text-xs font-semibold text-[var(--ilt-text-primary)]">
                      Minutes
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={Math.floor(t.seconds / 60)}
                        onChange={(e) => {
                          const mins = clamp(
                            Number(e.target.value || 0),
                            0,
                            999,
                          );
                          const secs = t.seconds % 60;
                          setSeconds(t.id, mins * 60 + secs);
                        }}
                        className="mt-1 w-full ilt-input-control px-2 py-2 text-sm"
                      />
                    </label>

                    <label className="block text-xs font-semibold text-[var(--ilt-text-primary)]">
                      Seconds
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={t.seconds % 60}
                        onChange={(e) => {
                          const secs = clamp(
                            Number(e.target.value || 0),
                            0,
                            59,
                          );
                          const mins = Math.floor(t.seconds / 60);
                          setSeconds(t.id, mins * 60 + secs);
                        }}
                        className="mt-1 w-full ilt-input-control px-2 py-2 text-sm"
                      />
                    </label>
                  </div>

                  {/* Controls */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn
                      kind={t.alarming ? "danger" : "solid"}
                      onClick={() => startPause(t.id)}
                    >
                      {t.alarming
                        ? "Stop alarm"
                        : t.running
                          ? "Pause"
                          : "Start"}
                    </Btn>

                    <Btn
                      kind="ghost"
                      onClick={() => resetOne(t.id)}
                    >
                      Reset
                    </Btn>

                    <Btn
                      kind="ghost"
                      onClick={() => stopAlarmOne(t.id)}
                      disabled={!t.alarming}
                      title="Stops only the alarm state (does not reset time)"
                    >
                      Silence
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="ilt-helper-text sm:text-sm">
              Space start/pause all · R reset · A add · X stop alarms · F
              fullscreen
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
export default function MultipleTimersPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/multiple-timers";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Multiple Timers",
        url,
        description:
          "Multiple timers tool to run two timers at once (parallel timers). Each timer has its own countdown, controls, and alarm.",
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
            name: "Multiple Timers",
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
        display={<MultipleTimersCard />}
        title="Multiple Timers (Run Two or More at Once)"
        description="Run parallel countdowns with big digits, per-timer controls, and optional sound."
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

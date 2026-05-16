// app/routes/stretch-timer.tsx
import type { Route } from "./+types/stretch-timer";
import { json } from "@remix-run/node";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Stretch Timer (Mobility & Yoga Intervals, Fullscreen)";
  const description =
    "Guide your stretching with a simple interval stretch timer. Alternate stretch and rest periods with a clear fullscreen countdown built for mobility work.";

  const url = "https://www.ilovetimers.com/stretch-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "stretch timer",
        "mobility timer",
        "yoga stretch timer",
        "stretch and rest timer",
        "interval stretch timer",
        "fullscreen stretch timer",
        "stretch hold timer",
      ].join(", "),
    },
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

function secToClock(secTotal: number) {
  const s = Math.max(0, Math.floor(secTotal));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${pad2(sec)}`;
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

async function toggleFullscreen(el: HTMLElement) {
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function useIsFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const el = targetRef.current;
      setIsFs(!!el && document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  return isFs;
}

/**
 * Fit a single-line time string into its container by adjusting font size.
 * - Uses ResizeObserver + rAF
 * - Binary search for max font-size that fits both width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
  paddingAllowancePx = 0,
}: {
  containerRef: RefObject<HTMLElement | null>;
  textRef: RefObject<HTMLElement | null>;
  deps: any[];
  minPx?: number;
  maxPx?: number;
  paddingAllowancePx?: number;
}) {
  const initialFontPx = (() => {
    const sample = deps.find(
      (dep) => typeof dep === "string" || typeof dep === "number",
    );
    const charCount = Math.max(
      1,
      String(sample ?? "00:00").replace(/\s/g, "").length,
    );
    const preferredVw = Math.min(34, Math.max(8, 84 / (charCount * 0.62)));
    return `clamp(${minPx}px, ${preferredVw.toFixed(2)}vw, ${maxPx}px)`;
  })();

  const [fontPx, setFontPx] = useState<number | string>(initialFontPx);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    let raf: number | null = null;

    const compute = () => {
      const c = containerRef.current;
      const t = textRef.current;
      if (!c || !t) return;

      const rect = c.getBoundingClientRect();
      const availW = Math.max(0, rect.width - paddingAllowancePx);
      const availH = Math.max(0, rect.height - paddingAllowancePx);

      if (availW <= 0 || availH <= 0) return;

      const originalFontSize = (t as HTMLElement).style.fontSize;

      const fits = (px: number) => {
        (t as HTMLElement).style.fontSize = `${px}px`;
        const tr = t.getBoundingClientRect();
        return tr.width <= availW && tr.height <= availH;
      };

      let lo = minPx;
      let hi = maxPx;
      let best = minPx;

      if (fits(maxPx)) {
        best = maxPx;
      } else {
        for (let i = 0; i < 16; i++) {
          const mid = Math.floor((lo + hi) / 2);
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }

      (t as HTMLElement).style.fontSize = originalFontSize;
      setFontPx(`${best}px`);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(container);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    compute();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontPx;
}

/* WebAudio cue */
function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (freq = 740, duration = 120, gain = 0.07) => {
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
  };
}

/* =========================================================
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
  cardRef,
  isFullscreen,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
  cardRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}) => (
  <div
    ref={cardRef}
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={[
      "relative bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
      isFullscreen
        ? "h-screen w-screen rounded-none border-0 p-0 shadow-none"
        : "timer-tool-card h-full rounded-2xl bg-white p-4 sm:p-6",
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

const Btn = ({
  kind = "solid",
  children,
  onClick,
  className = "",
  disabled,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      kind === "solid"
        ? `cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer timer-control-shadow rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const ToggleChip = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={[
      "cursor-pointer select-none rounded-lg border px-3 py-2 text-sm font-semibold",
      checked
        ? "border-amber-200 bg-amber-50 text-slate-900 hover:bg-amber-100"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ].join(" ")}
    aria-pressed={checked}
  >
    {label}: {checked ? "On" : "Off"}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Btn kind="ghost" onClick={onExit} className="py-1 text-sm">
            Exit (Esc)
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullscreenBottomBar({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/92 px-2 py-2 backdrop-blur sm:px-3">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

/* =========================================================
   STRETCH TIMER CARD
========================================================= */
type Phase = "stretch" | "rest";

type Preset = {
  id: string;
  label: string;
  stretchSec: number;
  restSec: number;
  rounds: number;
};

const PRESETS: Preset[] = [
  {
    id: "mobility",
    label: "Mobility (45s stretch / 15s rest × 10)",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
  },
  {
    id: "yoga",
    label: "Yoga Holds (60s stretch / 15s rest × 8)",
    stretchSec: 60,
    restSec: 15,
    rounds: 8,
  },
  {
    id: "deep",
    label: "Deep Stretch (90s stretch / 30s rest × 6)",
    stretchSec: 90,
    restSec: 30,
    rounds: 6,
  },
  {
    id: "custom",
    label: "Custom",
    stretchSec: 45,
    restSec: 15,
    rounds: 10,
  },
];

function StretchTimerCard() {
  const beep = useBeep();

  const [presetId, setPresetId] = useState("mobility");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [stretchSec, setStretchSec] = useState(preset.stretchSec);
  const [restSec, setRestSec] = useState(preset.restSec);
  const [rounds, setRounds] = useState(preset.rounds);

  const [sound, setSound] = useState(true);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("stretch");
  const [roundIndex, setRoundIndex] = useState(1);

  // Render state: only update once per second for snappy UI (prevents heavy rerenders).
  const [secLeft, setSecLeft] = useState(stretchSec);
  const secLeftRef = useRef(secLeft);
  useEffect(() => {
    secLeftRef.current = secLeft;
  }, [secLeft]);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const msLeftRef = useRef<number>(stretchSec * 1000);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function phaseDurationMs(p: Phase) {
    return (p === "stretch" ? stretchSec : restSec) * 1000;
  }

  // Apply preset values (except custom)
  useEffect(() => {
    if (presetId === "custom") return;
    setStretchSec(preset.stretchSec);
    setRestSec(preset.restSec);
    setRounds(preset.rounds);
  }, [presetId, preset]);

  // Reset when values change
  useEffect(() => {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);

    const ms = stretchSec * 1000;
    msLeftRef.current = ms;
    endRef.current = null;

    const nextSec = Math.max(0, Math.ceil(ms / 1000));
    setSecLeft(nextSec);
  }, [stretchSec, restSec, rounds]);

  // Main tick (RAF, but state updates only when displayed second changes)
  useEffect(() => {
    if (!running) {
      stopRaf();
      endRef.current = null;
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + msLeftRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const end = endRef.current ?? now;
      const remMs = Math.max(0, end - now);
      msLeftRef.current = remMs;

      const nextSec = Math.max(0, Math.ceil(remMs / 1000));
      if (nextSec !== secLeftRef.current) {
        secLeftRef.current = nextSec;
        setSecLeft(nextSec);
      }

      if (remMs <= 0) {
        // transition
        if (phase === "stretch") {
          if (restSec > 0) {
            setPhase("rest");
            const ms = phaseDurationMs("rest");
            msLeftRef.current = ms;
            endRef.current = performance.now() + ms;

            const s = Math.max(0, Math.ceil(ms / 1000));
            secLeftRef.current = s;
            setSecLeft(s);

            if (sound) beep(520, 110, 0.07);
          } else {
            const nextRound = roundIndex + 1;
            if (nextRound > rounds) {
              setRunning(false);
              endRef.current = null;
              if (sound) beep(660, 220, 0.08);
              return;
            }

            setRoundIndex(nextRound);
            setPhase("stretch");

            const ms = phaseDurationMs("stretch");
            msLeftRef.current = ms;
            endRef.current = performance.now() + ms;

            const s = Math.max(0, Math.ceil(ms / 1000));
            secLeftRef.current = s;
            setSecLeft(s);

            if (sound) beep(740, 110, 0.07);
          }
        } else {
          const nextRound = roundIndex + 1;
          if (nextRound > rounds) {
            setRunning(false);
            endRef.current = null;
            if (sound) beep(660, 220, 0.08);
            return;
          }

          setRoundIndex(nextRound);
          setPhase("stretch");

          const ms = phaseDurationMs("stretch");
          msLeftRef.current = ms;
          endRef.current = performance.now() + ms;

          const s = Math.max(0, Math.ceil(ms / 1000));
          secLeftRef.current = s;
          setSecLeft(s);

          if (sound) beep(740, 110, 0.07);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, phase, roundIndex, rounds, stretchSec, restSec, sound, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function startPause() {
    setRunning((r) => {
      const next = !r;
      endRef.current = null; // re-anchor timer on resume
      return next;
    });
  }

  function reset() {
    setRunning(false);
    setPhase("stretch");
    setRoundIndex(1);

    const ms = stretchSec * 1000;
    msLeftRef.current = ms;
    endRef.current = null;

    const s = Math.max(0, Math.ceil(ms / 1000));
    secLeftRef.current = s;
    setSecLeft(s);
  }

  function nextPhase() {
    if (!running) return;
    msLeftRef.current = 0;
    endRef.current = performance.now();
    secLeftRef.current = 0;
    setSecLeft(0);
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "n") {
      nextPhase();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "s") {
      setSound((x) => !x);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const label = phase === "stretch" ? "Stretch" : "Rest";
  const statusLabel = running
    ? "Running"
    : secLeft < (phase === "stretch" ? stretchSec : restSec)
      ? "Paused"
      : "Ready";

  const shownTime = secToClock(secLeft);

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, running, phase, roundIndex, rounds],
    minPx: 56,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const isCustom = presetId === "custom";
  const totalRoundsText = `${roundIndex} / ${rounds}`;

  const phaseChipClass =
    phase === "stretch"
      ? "border-amber-200 bg-amber-50 text-slate-900"
      : "border-slate-200 bg-slate-50 text-slate-900";

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Stretch Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <ToggleChip
              checked={sound}
              onChange={(v) => setSound(v)}
              label="Sound"
            />
            <Btn kind="solid" onClick={startPause} className="py-1 text-sm">
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={nextPhase}
              className="py-1 text-sm"
              disabled={!running}
            >
              Next
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">
                Stretch Timer (Stretch + Rest Intervals)
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Alternate stretch and rest intervals, track rounds, and use a
                big fullscreen countdown.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <ToggleChip
                checked={sound}
                onChange={(v) => setSound(v)}
                label="Sound"
              />
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
                className="py-2"
              >
                Fullscreen
              </Btn>
            </div>
          </div>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface relative mt-4 flex flex-col items-center justify-center text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 320,
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
          <div className="flex items-center gap-2">
            <div
              className={[
                "rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-widest",
                phaseChipClass,
              ].join(" ")}
            >
              {label}
            </div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Round {totalRoundsText}
            </div>
          </div>

          <div className="mt-2 text-xs font-extrabold uppercase tracking-widest text-slate-600">
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
                  <div className="text-xs font-semibold text-slate-700">
                    {stretchSec}s stretch · {restSec}s rest · {rounds} rounds
                  </div>
                </div>
                <div className="hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                  N = Next
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-900">
              Preset
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="mt-1 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-slate-600">
                {isCustom
                  ? "Custom preset lets you edit all values."
                  : "Changing presets updates the interval values."}
              </div>
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Stretch (seconds)
              <input
                type="number"
                inputMode="numeric"
                min={5}
                max={600}
                value={stretchSec}
                onChange={(e) =>
                  setStretchSec(clamp(Number(e.target.value || 5), 5, 600))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Rest (seconds)
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={600}
                value={restSec}
                onChange={(e) =>
                  setRestSec(clamp(Number(e.target.value || 0), 0, 600))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900 lg:col-span-2">
              Rounds
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={rounds}
                onChange={(e) =>
                  setRounds(clamp(Number(e.target.value || 1), 1, 100))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              <div className="mt-1 text-xs text-slate-600">
                Total time (approx):{" "}
                <strong>
                  {Math.round(((stretchSec + restSec) * rounds) / 60)} minutes
                </strong>
              </div>
            </label>

            <div className="flex items-end gap-3 lg:col-span-1">
              <Btn kind="solid" onClick={startPause}>
                {running ? "Pause" : "Start"}
              </Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
              <Btn kind="ghost" onClick={nextPhase} disabled={!running}>
                Next
              </Btn>
            </div>
          </div>
        )}

        {/* Shortcuts (normal only) */}
        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="timer-control-shadow rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · N next · R reset · F fullscreen · S
              sound
            </div>
            <div className="text-xs text-slate-600">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · N next · R reset · F
              fullscreen · S sound
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {label} · Round {totalRoundsText} · {statusLabel}
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
export default function StretchTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/stretch-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Stretch Timer",
        url,
        description:
          "Stretch timer for mobility and yoga stretching with stretch/rest intervals, rounds, presets, and fullscreen.",
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
            name: "Stretch Timer",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="timer-page-shell bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <StretchTimerCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Stretch Timer</span>
        </p>
      </section>
    </main>
  );
}

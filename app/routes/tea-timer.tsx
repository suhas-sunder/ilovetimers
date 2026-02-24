// app/routes/tea-timer.tsx
import type { Route } from "./+types/tea-timer";
import { json } from "@remix-run/node";
import {
  useCallback,
  useEffect,
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
  const title = "Tea Timer (Steep Times for Green, Black & Herbal Teas)";
  const description =
    "Brew better tea with a simple tea timer. One-click steep times for green, black, oolong, white, and herbal teas with a clear countdown.";

  const url = "https://www.ilovetimers.com/tea-timer";

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
 * SNAPPY VERSION:
 * - Start big immediately
 * - One-pass clamp-down instead of slow binary search loops
 * - Still responsive on resize
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
  const [fontPx, setFontPx] = useState<number>(maxPx);

  useEffect(() => {
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

      const el = t as HTMLElement;
      const original = el.style.fontSize;

      // start big
      let size = maxPx;
      el.style.fontSize = `${size}px`;

      // fast clamp down
      while (
        size > minPx &&
        (el.getBoundingClientRect().width > availW ||
          el.getBoundingClientRect().height > availH)
      ) {
        size -= Math.max(8, Math.floor(size * 0.1));
        el.style.fontSize = `${size}px`;
      }

      el.style.fontSize = original;
      setFontPx(Math.max(minPx, Math.min(maxPx, size)));
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);

    schedule();

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
        : "h-full rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm",
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
        : `cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

function ToggleChip({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={[
        "cursor-pointer select-none inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      title={disabled ? "Disabled" : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
      />
      {label}
    </label>
  );
}

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
   TEA TIMER CARD
========================================================= */
type TeaKey =
  | "green"
  | "black"
  | "oolong"
  | "white"
  | "herbal"
  | "chai"
  | "matcha"
  | "rooibos"
  | "pu_erh";

type TeaPreset = {
  key: TeaKey;
  label: string;
  minutes: number;
  seconds: number;
  note: string;
};

const TEA_PRESETS: TeaPreset[] = [
  {
    key: "green",
    label: "Green tea",
    minutes: 2,
    seconds: 0,
    note: "2:00 (lighter, avoid bitterness)",
  },
  {
    key: "black",
    label: "Black tea",
    minutes: 4,
    seconds: 0,
    note: "4:00 (stronger, classic mug)",
  },
  {
    key: "oolong",
    label: "Oolong",
    minutes: 3,
    seconds: 0,
    note: "3:00 (balanced)",
  },
  {
    key: "white",
    label: "White tea",
    minutes: 3,
    seconds: 0,
    note: "3:00 (gentle)",
  },
  {
    key: "herbal",
    label: "Herbal",
    minutes: 5,
    seconds: 0,
    note: "5:00 (bigger leaves, longer steep)",
  },
  {
    key: "chai",
    label: "Chai",
    minutes: 5,
    seconds: 0,
    note: "5:00 (spiced, bold)",
  },
  {
    key: "rooibos",
    label: "Rooibos",
    minutes: 5,
    seconds: 0,
    note: "5:00 (caffeine-free, forgiving)",
  },
  {
    key: "pu_erh",
    label: "Pu-erh",
    minutes: 4,
    seconds: 0,
    note: "4:00 (earthy)",
  },
  {
    key: "matcha",
    label: "Matcha",
    minutes: 0,
    seconds: 0,
    note: "No steep: whisk and sip",
  },
];

function TeaTimerCard() {
  const beep = useBeep();

  const [preset, setPreset] = useState<TeaKey>("green");
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);

  const initialMs = useMemo(
    () => (minutes * 60 + seconds) * 1000,
    [minutes, seconds],
  );

  const [remaining, setRemaining] = useState<number>(initialMs);
  const remainingRef = useRef<number>(initialMs);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const [running, setRunning] = useState(false);

  const [sound, setSound] = useState(true);
  const [finalCountdownBeeps, setFinalCountdownBeeps] = useState(true);

  const rafRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);
  const lastBeepSecondRef = useRef<number | null>(null);
  const lastShownRef = useRef<string>("");

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  function stopRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  const isMatcha = preset === "matcha";
  const disableStart = isMatcha || minutes * 60 + seconds <= 0;

  // Apply preset
  useEffect(() => {
    const p = TEA_PRESETS.find((x) => x.key === preset);
    if (!p) return;

    setMinutes(p.minutes);
    setSeconds(p.seconds);

    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    const ms = (p.minutes * 60 + p.seconds) * 1000;
    remainingRef.current = ms;
    setRemaining(ms);
    lastShownRef.current = msToClock(Math.ceil(ms / 1000) * 1000);
  }, [preset]);

  // When custom time changes, stop and reset to that duration
  useEffect(() => {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = initialMs;
    setRemaining(initialMs);
    lastShownRef.current = msToClock(Math.ceil(initialMs / 1000) * 1000);
  }, [initialMs]);

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    if (!endRef.current) {
      endRef.current = performance.now() + remainingRef.current;
    }

    const tick = () => {
      const now = performance.now();
      const rem = Math.max(0, (endRef.current ?? now) - now);

      if (sound && finalCountdownBeeps && rem > 0 && rem <= 5_000) {
        const secLeft = Math.ceil(rem / 1000);
        if (lastBeepSecondRef.current !== secLeft) {
          lastBeepSecondRef.current = secLeft;
          beep(880, 110);
        }
      }

      if (rem <= 0) {
        remainingRef.current = 0;
        setRemaining(0);
        lastShownRef.current = "0:00";
        endRef.current = null;
        setRunning(false);
        lastBeepSecondRef.current = null;
        stopRaf();
        if (sound) beep(660, 220);
        return;
      }

      const shown = msToClock(Math.ceil(rem / 1000) * 1000);
      if (shown !== lastShownRef.current) {
        lastShownRef.current = shown;
        remainingRef.current = rem;
        setRemaining(rem);
      } else {
        remainingRef.current = rem;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, sound, finalCountdownBeeps, beep]);

  useEffect(() => {
    return () => stopRaf();
  }, []);

  function reset() {
    setRunning(false);
    endRef.current = null;
    lastBeepSecondRef.current = null;
    stopRaf();

    remainingRef.current = initialMs;
    setRemaining(initialMs);
    lastShownRef.current = msToClock(Math.ceil(initialMs / 1000) * 1000);
  }

  function startPause() {
    if (disableStart) return;

    if (!running && sound) beep(0, 1);

    setRunning((r) => {
      const next = !r;

      if (next) {
        endRef.current = performance.now() + remainingRef.current;
      } else {
        const now = performance.now();
        const rem = Math.max(0, (endRef.current ?? now) - now);
        remainingRef.current = rem;
        setRemaining(rem);
        endRef.current = null;
      }

      lastBeepSecondRef.current = null;
      return next;
    });
  }

  const urgent = running && remaining > 0 && remaining <= 10_000;
  const shownTime = useMemo(
    () => msToClock(Math.ceil(remaining / 1000) * 1000),
    [remaining],
  );

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownTime, isFs, urgent, running, minutes, seconds, preset],
    minPx: 52,
    maxPx: isFs ? 520 : 360,
    paddingAllowancePx: isFs ? 56 : 64,
  });

  const presetNote = useMemo(() => {
    const p = TEA_PRESETS.find((x) => x.key === preset);
    return p?.note ?? "";
  }, [preset]);

  const statusLabel = running ? "Running" : remaining > 0 ? "Ready" : "Done";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "escape" && isFs) {
      document.exitFullscreen().catch(() => {});
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
        title="Tea Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <ToggleChip label="Sound" checked={sound} onChange={setSound} />
            <ToggleChip
              label="Final beeps"
              checked={finalCountdownBeeps}
              onChange={setFinalCountdownBeeps}
              disabled={!sound}
            />
            <Btn
              kind="solid"
              onClick={startPause}
              className="py-1 text-sm"
              disabled={disableStart}
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={reset}
              className="py-1 text-sm"
              disabled={isMatcha}
            >
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : ""}>
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-sky-700">Tea Timer</h1>
              <p className="mt-1 text-sm text-slate-600">
                One-click steep presets with a big countdown, optional sound,
                and fullscreen.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <ToggleChip label="Sound" checked={sound} onChange={setSound} />
              <ToggleChip
                label="Final beeps"
                checked={finalCountdownBeeps}
                onChange={setFinalCountdownBeeps}
                disabled={!sound}
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

        <div
          ref={displayBoxRef}
          className={[
            "relative mt-4 flex flex-col items-center justify-center rounded-2xl border text-slate-950",
            urgent
              ? "border-rose-200 bg-rose-50"
              : "border-slate-200 bg-slate-50",
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 280,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: "hidden",
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
              "mt-2 inline-block text-center font-mono font-extrabold tracking-widest",
              isFs ? "tracking-wide sm:tracking-widest" : "",
            ].join(" ")}
            style={{
              fontSize: `${fitFontPx}px`,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {shownTime}
          </span>
        </div>
        {!isFs && (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {TEA_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreset(p.key)}
                  className={[
                    "cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition",
                    p.key === preset
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="block text-sm font-semibold text-slate-700">
                Minutes
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(clamp(Number(e.target.value || 0), 0, 60))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  disabled={isMatcha}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Seconds
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(clamp(Number(e.target.value || 0), 0, 59))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  disabled={isMatcha}
                />
              </label>

              <div className="flex items-end gap-3">
                <Btn
                  onClick={startPause}
                  disabled={disableStart}
                  className="min-w-[92px]"
                >
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset} disabled={isMatcha}>
                  Reset
                </Btn>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Preset note
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {isMatcha
                  ? "Matcha is usually whisked, not steeped."
                  : presetNote}
              </div>
            </div>
          </>
        )}

        {!isFs && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Shortcuts: Space start/pause · R reset · F fullscreen
            </div>
          </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap time to start/pause · Space start/pause · R reset · F
              fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {urgent ? "Final seconds" : statusLabel}
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
export default function TeaTimerPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/tea-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tea Timer",
        url,
        description:
          "A tea steep timer with pre-filled steep times for green tea, black tea, oolong, herbal tea, and more, plus fullscreen and optional sound.",
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
            name: "Tea Timer",
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-4">
        <div>
          <TeaTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Tea Timer</span>
        </p>
      </section>
    </main>
  );
}

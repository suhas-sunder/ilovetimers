// app/routes/bpm-tapper.tsx
import type { Route } from "./+types/bpm-tapper";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  DisplayStage,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
  Toggle,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/bpm-tapper/HowItWorks";
import Disclaimer from "~/clients/components/bpm-tapper/Disclaimer";
import FAQ from "~/clients/components/bpm-tapper/FAQ";
import KeyboardShortcuts from "~/clients/components/bpm-tapper/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/bpm-tapper/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Tap BPM (Instant BPM Counter + Tempo Tapper)";
  const description =
    "Tap to find BPM instantly. Simple tempo tapper and BPM counter that measures beats per minute as you tap. Auto-resets after pauses and lets you copy the BPM.";

  const url = "https://www.ilovetimers.com/bpm-tapper";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "tap bpm",
        "bpm counter",
        "tap tempo",
        "tempo tapper",
        "tempo finder",
        "beats per minute",
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
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
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
function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/* =========================================================
   BPM TAPPER CARD
========================================================= */
type HistoryItem = {
  id: string;
  at: number;
  bpm: number;
  taps: number;
  intervals: number;
  stability?: string | null;
};

function BpmTapperCard() {
  const MAX_TAPS = 24;
  const MIN_TAP_MS = 120;
  const MAX_TAP_MS = 2000;

  const RESET_PRESETS_MS = useMemo(() => [2000, 4000, 6000, 10000, 20000], []);
  const HOLD_PRESETS_MS = useMemo(() => [0, 6000, 12000, 20000, 30000], []);

  const tapsRef = useRef<number[]>([]);
  const idleTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const skipInitialSettingsPersistRef = useRef(true);

  const [taps, setTaps] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const [resetMs, setResetMs] = useState<number>(6000);
  const [holdMs, setHoldMs] = useState<number>(12000);
  const [keyboardTap, setKeyboardTap] = useState(true);
  const [locked, setLocked] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const bpmTextRef = useRef<HTMLSpanElement>(null);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const computeIntervals = useCallback((tapTimes: number[]) => {
    if (tapTimes.length < 2) return [];
    const out: number[] = [];
    for (let i = 1; i < tapTimes.length; i++) {
      const d = tapTimes[i] - tapTimes[i - 1];
      if (d >= MIN_TAP_MS && d <= MAX_TAP_MS) out.push(d);
    }
    return out;
  }, []);

  const intervals = useMemo(
    () => computeIntervals(taps),
    [taps, computeIntervals],
  );

  const bpm = useMemo(() => {
    if (intervals.length < 2) return null;
    const ms = median(intervals);
    if (!ms) return null;
    const val = 60000 / ms;
    if (!Number.isFinite(val)) return null;
    return clamp(Math.round(val), 1, 999);
  }, [intervals]);

  const stability = useMemo(() => {
    if (intervals.length < 3) return null;
    const a = intervals.reduce((s, x) => s + x, 0) / intervals.length;
    const v =
      intervals.reduce((acc, x) => acc + (x - a) * (x - a), 0) /
      (intervals.length - 1);
    const sd = Math.sqrt(v);
    if (sd < 18) return "Very steady";
    if (sd < 35) return "Steady";
    if (sd < 60) return "A bit wobbly";
    return "Wobbly";
  }, [intervals]);

  const msPerBeat = useMemo(() => {
    if (!bpm) return null;
    const ms = 60000 / bpm;
    if (!Number.isFinite(ms)) return null;
    return Math.round(ms);
  }, [bpm]);

  const bpmStr = bpm == null ? "--" : String(bpm);
  const displayBpmText = bpm == null ? "TAP" : bpmStr;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: bpmTextRef,
    deps: [displayBpmText, isFs, active, tick, locked],
    minPx: 84,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 140 : 96,
  });

  const persistSettings = useCallback(
    (next: { resetMs: number; holdMs: number; keyboardTap: boolean }) => {
      try {
        localStorage.setItem("bpmTapper.settings.v1", JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [],
  );

  const persistHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem("bpmTapper.history.v1", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // load settings + history
    try {
      const raw = localStorage.getItem("bpmTapper.settings.v1");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s?.resetMs === "number")
          setResetMs(clamp(s.resetMs, 500, 60000));
        if (typeof s?.holdMs === "number") setHoldMs(clamp(s.holdMs, 0, 60000));
        if (typeof s?.keyboardTap === "boolean") setKeyboardTap(s.keyboardTap);
      }
    } catch {
      // ignore
    }

    try {
      const rawH = localStorage.getItem("bpmTapper.history.v1");
      if (rawH) {
        const h = JSON.parse(rawH);
        if (Array.isArray(h)) setHistory(h.slice(0, 10));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (skipInitialSettingsPersistRef.current) {
      skipInitialSettingsPersistRef.current = false;
      return;
    }

    persistSettings({ resetMs, holdMs, keyboardTap });
  }, [resetMs, holdMs, keyboardTap, persistSettings]);

  const pushHistory = useCallback(() => {
    if (!bpm) return;
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: Date.now(),
      bpm,
      taps: tapsRef.current.length,
      intervals: computeIntervals(tapsRef.current).length,
      stability,
    };

    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 8);
      persistHistory(next);
      return next;
    });
  }, [bpm, stability, computeIntervals, persistHistory]);

  const hardReset = useCallback(() => {
    tapsRef.current = [];
    setTaps([]);
    setActive(false);
    setTick(0);
    setCopied(false);
    setLocked(false);
    clearIdle();
    clearHold();
  }, [clearIdle, clearHold]);

  const endSession = useCallback(() => {
    // record if we have a usable BPM, then clear
    if (bpm) pushHistory();
    hardReset();
  }, [bpm, pushHistory, hardReset]);

  const scheduleFinalClear = useCallback(() => {
    clearHold();
    if (!holdMs) {
      endSession();
      return;
    }
    holdTimerRef.current = window.setTimeout(() => {
      endSession();
    }, holdMs);
  }, [clearHold, holdMs, endSession]);

  const armIdle = useCallback(() => {
    clearIdle();
    if (locked) return;
    if (resetMs <= 0) return;

    idleTimerRef.current = window.setTimeout(() => {
      // stop “active” session, but hold last result for holdMs (then clear)
      setActive(false);
      scheduleFinalClear();
    }, resetMs);
  }, [clearIdle, resetMs, locked, scheduleFinalClear]);

  const registerTap = useCallback(() => {
    if (locked) return;

    clearHold();

    const now = performance.now();

    // If we were idle (session ended), start clean.
    const base = active ? tapsRef.current : [];
    const next = [...base, now].slice(-MAX_TAPS);

    tapsRef.current = next;
    setTaps(next);
    setTick((t) => t + 1);
    setActive(true);
    armIdle();
  }, [active, armIdle, locked, clearHold]);

  const copy = useCallback(async () => {
    if (!bpm) return;
    try {
      await navigator.clipboard.writeText(
        `Tap BPM\nTempo: ${bpm} BPM\nms/beat: ${msPerBeat ?? "n/a"}\nTaps: ${
          taps.length
        }\nIntervals used: ${intervals.length}\nStability: ${
          stability ?? "n/a"
        }\nhttps://www.ilovetimers.com/bpm-tapper`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [bpm, taps.length, intervals.length, stability, msPerBeat]);

  useEffect(() => {
    return () => {
      clearIdle();
      clearHold();
    };
  }, [clearIdle, clearHold]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "escape" && document.fullscreenElement) {
      void fullscreen.exit();
      return;
    }

    if (k === "f" && cardRef.current) {
      void fullscreen.toggle();
      return;
    }

    if (k === "r") {
      endSession();
      return;
    }

    if (k === "c") {
      void copy();
      return;
    }

    if (!keyboardTap) return;

    // Space/Enter tapping is expected for this kind of tool on desktop.
    if (e.key === " " || k === "enter") {
      e.preventDefault();
      registerTap();
    }
  };

  const onStagePointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null;
    const isControl = !!t?.closest(
      "button, a, input, textarea, select, details, summary, label",
    );
    if (isControl) return;

    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    registerTap();
  };

  const statusLabel = locked
    ? "Locked"
    : active
      ? "Keep tapping"
      : bpm
        ? "Last result"
        : "Tap anywhere to start";

  const lockToggle = () => {
    if (!bpm) return;
    setLocked((x) => {
      const next = !x;
      if (next) {
        clearIdle();
        clearHold();
        setActive(false);
      } else {
        // unlocking resumes normal behavior; next tap will continue the current series
        armIdle();
      }
      return next;
    });
  };

  const displayTone = locked
    ? "border-slate-200 bg-white text-slate-950"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const resetLabel =
    resetMs <= 0
      ? "Off"
      : resetMs >= 1000
        ? `${Math.round(resetMs / 1000)}s`
        : `${resetMs}ms`;

  const holdLabel =
    holdMs <= 0
      ? "Off"
      : holdMs >= 1000
        ? `${Math.round(holdMs / 1000)}s`
        : `${holdMs}ms`;

  const shortcutsText = keyboardTap
    ? "Tap/click anywhere / Space/Enter tap / F fullscreen / R reset / C copy"
    : "Tap/click anywhere / F fullscreen / R reset / C copy";

  const recentResults = !isFs && history.length > 0 ? (
    <div className="timer-interaction-results p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Recent results
        </div>
        <Btn
          variant="ghost"
          size="sm"
          className="min-h-0 px-2 py-1 text-xs"
          onClick={() => {
            setHistory([]);
            try {
              localStorage.removeItem("bpmTapper.history.v1");
            } catch {
              // ignore
            }
          }}
        >
          Clear
        </Btn>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {history.slice(0, 6).map((h) => (
          <Btn
            key={h.id}
            variant="ghost"
            size="sm"
            className="timer-interaction-panel h-auto min-h-0 flex-col items-start justify-start px-3 py-2 text-left"
            onClick={() => {
              // restore result (as a held session) so user can copy/lock it
              tapsRef.current = []; // restore as display-only
              setTaps([]);
              setActive(false);
              setTick((t) => t + 1);
              setLocked(true);
              clearIdle();
              clearHold();
              // store bpm by faking taps is messy; instead: lock mode + preserve via history copy
              // We keep restore minimal: copy from history is the primary action.
              void navigator.clipboard
                ?.writeText(
                  `Tap BPM\nTempo: ${h.bpm} BPM\nTaps: ${h.taps}\nIntervals used: ${h.intervals}\nStability: ${
                    h.stability ?? "n/a"
                  }\nhttps://www.ilovetimers.com/bpm-tapper`,
                )
                .then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                })
                .catch(() => {});
            }}
            title="Click to copy this result"
          >
            <div className="text-sm font-extrabold text-slate-950">
              {h.bpm} BPM
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-600">
              Taps {h.taps} / Intervals {h.intervals}
              {h.stability ? ` / ${h.stability}` : ""}
            </div>
          </Btn>
        ))}
      </div>

      <div className="mt-2 text-xs text-slate-600">
        Click a recent result to copy it.
      </div>
    </div>
  ) : null;

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
    >
      <FullscreenTopBar
        show={isFs}
        title="Tap BPM"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-2 text-sm text-slate-700 sm:flex">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
              Reset: {resetLabel}
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
              Hold: {holdLabel}
            </div>
            {locked ? (
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                Locked
              </div>
            ) : null}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="ghost"
              onClick={lockToggle}
              disabled={!bpm}
              className="py-1 text-sm"
            >
              {locked ? "Unlock" : "Lock"}
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => void copy()}
              disabled={!bpm}
              className="py-1 text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </Btn>
            <Btn kind="ghost" onClick={endSession} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-interaction-stack flex h-full flex-col"}>

        {/* Tap Stage */}
        <DisplayStage
          stageRef={displayBoxRef}
          isFullscreen={isFs}
          className={[
            "timer-display-surface order-first mt-0 flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
            "p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 420,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "manipulation",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onPointerDownCapture={onStagePointerDownCapture}
          onContextMenu={(e) => e.preventDefault()}
          role="button"
          aria-label="Tap tempo"
          tabIndex={0}
          title={isFs ? "Tap/click anywhere to register a beat" : undefined}
        >
          <span
            ref={bpmTextRef}
            className={[
              "timer-interaction-stage-value inline-block text-center text-slate-950",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
            }}
          >
            {displayBpmText}
          </span>

          <div className="timer-interaction-status text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <div className="timer-interaction-context text-sm font-semibold text-slate-600">
            {bpm ? "BPM" : "Waiting for taps"}
          </div>

          <div className="timer-interaction-meta-grid grid gap-3 sm:grid-cols-2">
            <div className="timer-interaction-panel p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Session
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Taps:{" "}
                <span className="font-extrabold text-slate-950">
                  {taps.length}
                </span>
                {" · "}Intervals:{" "}
                <span className="font-extrabold text-slate-950">
                  {intervals.length}
                </span>
                {stability ? (
                  <>
                    {" · "}Stability:{" "}
                    <span className="font-extrabold text-slate-950">
                      {stability}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Auto-reset after{" "}
                <span className="font-semibold">{resetLabel}</span>
                {holdMs > 0 ? (
                  <>
                    {" "}
                    · Holds last result for{" "}
                    <span className="font-semibold">{holdLabel}</span>
                  </>
                ) : null}
                {locked ? (
                  <>
                    {" "}
                    · <span className="font-semibold">Locked</span> (no reset)
                  </>
                ) : null}
              </div>
            </div>

            <div className="timer-interaction-panel p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Timing
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                ms/beat:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ?? "--"}
                </span>
                <span className="text-slate-500"> · </span>
                ms/8th:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ? Math.round(msPerBeat / 2) : "--"}
                </span>
                <span className="text-slate-500"> · </span>
                ms/16th:{" "}
                <span className="font-extrabold text-slate-950">
                  {msPerBeat ? Math.round(msPerBeat / 4) : "--"}
                </span>
              </div>

              <div className="hidden">
                Shortcuts:{" "}
                <span className="font-semibold text-slate-700">
                  {keyboardTap ? "Space/Enter tap · " : ""}F
                </span>{" "}
                fullscreen ·{" "}
                <span className="font-semibold text-slate-700">R</span> reset ·{" "}
                <span className="font-semibold text-slate-700">C</span> copy
              </div>
            </div>
          </div>

          {false && !isFs && history.length > 0 && (
            <div className="timer-interaction-results p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Recent results
                </div>
                <Btn
                  variant="ghost"
                  size="sm"
                  className="min-h-0 px-2 py-1 text-xs"
                  onClick={() => {
                    setHistory([]);
                    try {
                      localStorage.removeItem("bpmTapper.history.v1");
                    } catch {
                      // ignore
                    }
                  }}
                >
                  Clear
                </Btn>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {history.slice(0, 6).map((h) => (
                  <Btn
                    key={h.id}
                    variant="ghost"
                    size="sm"
                    className="timer-interaction-panel h-auto min-h-0 flex-col items-start justify-start px-3 py-2 text-left"
                    onClick={() => {
                      // restore result (as a held session) so user can copy/lock it
                      tapsRef.current = []; // restore as display-only
                      setTaps([]);
                      setActive(false);
                      setTick((t) => t + 1);
                      setLocked(true);
                      clearIdle();
                      clearHold();
                      // store bpm by faking taps is messy; instead: lock mode + preserve via history copy
                      // We keep restore minimal: copy from history is the primary action.
                      void navigator.clipboard
                        ?.writeText(
                          `Tap BPM\nTempo: ${h.bpm} BPM\nTaps: ${h.taps}\nIntervals used: ${h.intervals}\nStability: ${
                            h.stability ?? "n/a"
                          }\nhttps://www.ilovetimers.com/bpm-tapper`,
                        )
                        .then(() => {
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1200);
                        })
                        .catch(() => {});
                    }}
                    title="Click to copy this result"
                  >
                    <div className="text-sm font-extrabold text-slate-950">
                      {h.bpm} BPM
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-600">
                      Taps {h.taps} · Intervals {h.intervals}
                      {h.stability ? ` · ${h.stability}` : ""}
                    </div>
                  </Btn>
                ))}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Click a recent result to copy it.
              </div>
            </div>
          )}

          {!isFs && (
            <div className="hidden">
              Tip: click the card once so keyboard shortcuts work immediately.
            </div>
          )}
        </DisplayStage>

        {!isFs && (
          <>
            <SecondaryActionRow className="timer-interaction-actions">
              <Btn kind="ghost" onClick={lockToggle} disabled={!bpm}>
                {locked ? "Unlock" : "Lock"}
              </Btn>
              <Btn kind="ghost" onClick={() => void copy()} disabled={!bpm}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
              <Btn kind="ghost" onClick={endSession}>
                Reset
              </Btn>
            </SecondaryActionRow>
            <ShortcutHint className="timer-interaction-shortcut">{shortcutsText}</ShortcutHint>
          </>
        )}

        {/* Settings (normal only) */}
        {!isFs && (
          <SettingGroup
            title="Tapper settings"
            description="Adjust reset timing and keyboard tapping without changing the tap target."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <PresetGroup
                title="Auto-reset after pause"
                description="Shorter resets feel snappier. Longer resets help if you pause between phrases."
              >
                {RESET_PRESETS_MS.map((ms) => (
                  <Chip
                    key={ms}
                    active={ms === resetMs}
                    onClick={() => setResetMs(ms)}
                    disabled={locked}
                  >
                    {Math.round(ms / 1000)}s
                  </Chip>
                ))}
                <Chip
                  active={resetMs <= 0}
                  onClick={() => setResetMs(0)}
                  disabled={locked}
                >
                  Off
                </Chip>
              </PresetGroup>

              <PresetGroup title="Hold last result">
                {HOLD_PRESETS_MS.map((ms) => (
                  <Chip
                    key={ms}
                    active={ms === holdMs}
                    onClick={() => setHoldMs(ms)}
                  >
                    {ms === 0 ? "Off" : `${Math.round(ms / 1000)}s`}
                  </Chip>
                ))}
              </PresetGroup>
            </div>

            <Toggle
              label="Space/Enter to tap"
              checked={keyboardTap}
              onCheckedChange={setKeyboardTap}
            />
          </SettingGroup>
        )}

        {recentResults}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Reset {resetLabel}
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                Hold {holdLabel}
              </div>
              {msPerBeat ? (
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                  {msPerBeat} ms/beat
                </div>
              ) : null}
              {locked ? (
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Locked
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Btn kind="ghost" onClick={lockToggle} disabled={!bpm}>
                {locked ? "Unlock" : "Lock"}
              </Btn>
              <Btn kind="ghost" onClick={() => void copy()} disabled={!bpm}>
                {copied ? "Copied" : "Copy"}
              </Btn>
              <Btn kind="ghost" onClick={endSession}>
                Reset
              </Btn>
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
export default function BpmTapperPage({
  loaderData: { nowISO: _nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/bpm-tapper";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Tap BPM",
        url,
        description:
          "Tap BPM counter and tempo tapper. Tap anywhere to estimate BPM. Auto-resets after inactivity and supports fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Tap BPM", item: url },
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
        display={<BpmTapperCard />}
        title="Tap BPM (Tempo Tapper)"
        description="Tap anywhere to calculate BPM, copy results, lock a reading, and keep compact timing stats below the main BPM."
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

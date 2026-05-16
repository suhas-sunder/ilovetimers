// app/routes/debt-clock.tsx
import type { Route } from "./+types/debt-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/debt-clock/HowItWorks";
import Disclaimer from "~/clients/components/debt-clock/Disclaimer";
import FAQ from "~/clients/components/debt-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/debt-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/debt-clock/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Debt Clock (Live National & World Debt Counter, Fullscreen)";
  const description =
    "Free debt clock with a live counter for national or world debt. Choose a preset or enter a starting amount and yearly change rate to simulate a running total in fullscreen.";

  const url = "https://www.ilovetimers.com/debt-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "debt clock",
        "world debt clock",
        "national debt clock",
        "us debt clock",
        "government debt clock",
        "debt counter",
        "live debt clock",
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

function formatMoney(
  n: number,
  currency = "USD",
  opts?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
) {
  const safe = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
      minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
    }).format(safe);
  } catch {
    const sign = safe < 0 ? "-" : "";
    const abs = Math.abs(safe);
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  }
}

const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

function useIsFullscreen(targetRef: React.RefObject<HTMLElement | null>) {
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
 * Fit a single-line string into its container by adjusting font size.
 * - ResizeObserver + rAF
 * - Binary search for max font-size that fits width and height
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 520,
  paddingAllowancePx = 0,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
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

const Chip = ({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "bg-slate-900 text-white hover:bg-slate-800"
        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

function FullscreenTopBar({
  show,
  title,
  left,
  right,
  onExit,
}: {
  show: boolean;
  title: string;
  left?: React.ReactNode;
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
          {left}
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
   DATA (DEMO PRESETS)
========================================================= */
type Preset = {
  id: string;
  label: string;
  currency: string;
  baseDebt: number;
  yearlyChange: number;
  asOfLabel: string;
};

const PRESETS: Preset[] = [
  {
    id: "world-demo",
    label: "World (demo)",
    currency: "USD",
    baseDebt: 300_000_000_000_000,
    yearlyChange: 9_000_000_000_000,
    asOfLabel: "Demo preset (replace with your source)",
  },
  {
    id: "us-demo",
    label: "United States (demo)",
    currency: "USD",
    baseDebt: 34_000_000_000_000,
    yearlyChange: 1_200_000_000_000,
    asOfLabel: "Demo preset (replace with your source)",
  },
  {
    id: "canada-demo",
    label: "Canada (demo)",
    currency: "CAD",
    baseDebt: 1_400_000_000_000,
    yearlyChange: 55_000_000_000,
    asOfLabel: "Demo preset (replace with your source)",
  },
  {
    id: "custom",
    label: "Custom",
    currency: "USD",
    baseDebt: 0,
    yearlyChange: 0,
    asOfLabel: "Your inputs",
  },
];

/* =========================================================
   DEBT CLOCK CARD
========================================================= */
function DebtClockCard() {
  const [presetId, setPresetId] = useState<string>("world-demo");
  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );

  const [currency, setCurrency] = useState(preset.currency);
  const [baseDebt, setBaseDebt] = useState(preset.baseDebt);
  const [yearlyChange, setYearlyChange] = useState(preset.yearlyChange);
  const [asOfLabel, setAsOfLabel] = useState(preset.asOfLabel);

  const [running, setRunning] = useState(true);

  const rafRef = useRef<number | null>(null);
  const startPerfRef = useRef<number>(performance.now());
  const anchorBaseRef = useRef<number>(preset.baseDebt);

  const [nowDebt, setNowDebt] = useState<number>(preset.baseDebt);
  const nowDebtRef = useRef<number>(preset.baseDebt);

  useEffect(() => {
    nowDebtRef.current = nowDebt;
  }, [nowDebt]);

  const perSecond = useMemo(() => {
    const yc = Number.isFinite(yearlyChange) ? yearlyChange : 0;
    return yc / SECONDS_PER_YEAR;
  }, [yearlyChange]);

  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const amountTextRef = useRef<HTMLSpanElement>(null);

  const formattedNow = useMemo(
    () => formatMoney(nowDebt, currency),
    [nowDebt, currency],
  );
  const formattedYear = useMemo(
    () => formatMoney(yearlyChange, currency),
    [yearlyChange, currency],
  );
  const formattedPerSecond = useMemo(() => {
    const abs = Math.abs(perSecond);
    const maxFd = abs >= 1000 ? 0 : abs >= 10 ? 2 : 3;
    return formatMoney(perSecond, currency, { maximumFractionDigits: maxFd });
  }, [perSecond, currency]);

  // Apply preset values on preset change (except custom)
  useEffect(() => {
    const p = preset;
    if (p.id === "custom") return;

    setCurrency(p.currency);
    setBaseDebt(p.baseDebt);
    setYearlyChange(p.yearlyChange);
    setAsOfLabel(p.asOfLabel);

    anchorBaseRef.current = p.baseDebt;
    startPerfRef.current = performance.now();
    setNowDebt(p.baseDebt);
    nowDebtRef.current = p.baseDebt;
  }, [preset]);

  // If baseDebt changes while running, snap to that new base.
  useEffect(() => {
    if (!running) return;
    anchorBaseRef.current = baseDebt;
    startPerfRef.current = performance.now();
    setNowDebt(baseDebt);
    nowDebtRef.current = baseDebt;
  }, [baseDebt, running]);

  // If rate changes while running, keep continuity from current displayed debt.
  useEffect(() => {
    if (!running) return;
    anchorBaseRef.current = nowDebtRef.current;
    startPerfRef.current = performance.now();
  }, [perSecond, running]);

  const stopRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }

    const tick = () => {
      const elapsedSeconds = (performance.now() - startPerfRef.current) / 1000;
      const next = anchorBaseRef.current + perSecond * elapsedSeconds;
      setNowDebt(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => stopRaf();
  }, [running, perSecond, stopRaf]);

  function reset() {
    anchorBaseRef.current = baseDebt;
    startPerfRef.current = performance.now();
    setNowDebt(baseDebt);
    nowDebtRef.current = baseDebt;
  }

  function startPause() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        anchorBaseRef.current = nowDebtRef.current;
        startPerfRef.current = performance.now();
      } else {
        stopRaf();
      }
      return next;
    });
  }

  async function copy() {
    try {
      const payload = [
        `Debt Clock: ${preset.label}`,
        `As of: ${asOfLabel}`,
        `Current (estimated): ${formatMoney(nowDebtRef.current, currency)}`,
        `Starting: ${formatMoney(baseDebt, currency)}`,
        `Yearly change: ${formatMoney(yearlyChange, currency)} / year`,
        `Per second: ${formatMoney(perSecond, currency, { maximumFractionDigits: 3 })} / second`,
        `Disclosure: Estimated counter based on provided starting value and average rate.`,
      ].join("\n");
      await navigator.clipboard.writeText(payload);
    } catch {
      // ignore
    }
  }

  const signLabel = perSecond >= 0 ? "increasing" : "decreasing";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: amountTextRef,
    deps: [formattedNow, isFs, running],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 72 : 72,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f" && cardRef.current) {
      toggleFullscreen(cardRef.current);
    } else if (k === "c") {
      copy();
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
        title="Debt Clock"
        onExit={() => document.exitFullscreen().catch(() => {})}
        left={
          <div className="hidden items-center gap-3 text-sm text-slate-700 sm:flex">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              {preset.label}
            </div>
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
            <Btn kind="ghost" onClick={copy} className="py-1 text-sm">
              Copy
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center p-3 sm:p-6",
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Current estimated debt
          </div>

          <span
            ref={amountTextRef}
            className={[
              "mt-2 inline-block text-center font-mono font-extrabold text-slate-950",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
          >
            {formattedNow}
          </span>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Rate
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                <span className="font-extrabold text-slate-950">
                  {formattedYear}
                </span>{" "}
                / year ·{" "}
                <span className="font-extrabold text-slate-950">
                  {formattedPerSecond}
                </span>{" "}
                / second ({signLabel})
              </div>
              <div className="mt-1 text-xs text-slate-600">
                As of: <span className="font-semibold">{asOfLabel}</span> ·
                Estimate
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Space start/pause · R reset · F fullscreen · C copy
              </div>
            </div>
          </div>

          {!isFs && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
              <Btn kind="ghost" onClick={copy}>
                Copy
              </Btn>
              <Btn
                kind="ghost"
                onClick={() =>
                  cardRef.current && toggleFullscreen(cardRef.current)
                }
              >
                Fullscreen
              </Btn>
            </div>
          )}
        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="timer-settings-panel mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Preset
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <Chip
                    key={p.id}
                    active={p.id === presetId}
                    onClick={() => setPresetId(p.id)}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Demo presets are placeholders. Use Custom with your own numbers
                if you want.
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-extrabold text-slate-900">
                Inputs
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Currency
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-900">
                  Starting debt
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Math.max(0, Math.round(baseDebt))}
                    onChange={(e) => {
                      const v = clamp(
                        Number(e.target.value || 0),
                        0,
                        1_000_000_000_000_000,
                      );
                      setBaseDebt(v);
                      if (presetId !== "custom") setPresetId("custom");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900 sm:col-span-2">
                  Yearly change (can be negative)
                  <input
                    type="number"
                    step={1}
                    value={Math.round(yearlyChange)}
                    onChange={(e) => {
                      const v = clamp(
                        Number(e.target.value || 0),
                        -1_000_000_000_000_000,
                        1_000_000_000_000_000,
                      );
                      setYearlyChange(v);
                      if (presetId !== "custom") setPresetId("custom");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-900 sm:col-span-2">
                  “As of” label
                  <input
                    type="text"
                    value={asOfLabel}
                    onChange={(e) => {
                      setAsOfLabel(e.target.value);
                      if (presetId !== "custom") setPresetId("custom");
                    }}
                    placeholder="e.g. Source X, 2025-12-31"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />
                </label>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                This is an estimated counter based on your starting value and
                average rate.
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  active={p.id === presetId}
                  onClick={() => setPresetId(p.id)}
                >
                  {p.id === "custom" ? "Custom" : p.label}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn kind={running ? "solid" : "ghost"} onClick={startPause}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
                <Btn kind="ghost" onClick={copy}>
                  Copy
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap number to start/pause · Space start/pause · R reset · C copy
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
export default function DebtClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/debt-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Debt Clock",
        url,
        description:
          "Debt clock (estimated) for national or world debt using a starting value and average yearly change rate with fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "Debt Clock", item: url },
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

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Debt Clock (Live Counter + Fullscreen)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Pick a preset or enter a starting debt and yearly change rate to
            simulate a running total.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <DebtClockCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Debt Clock</span>
        </p>
      </section>

      <HowItWorks />
      <KeyboardShortcuts />
      <PopularUseCases />
      <FAQ />
      <Disclaimer />
    </main>
  );
}

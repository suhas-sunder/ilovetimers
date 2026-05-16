// app/routes/debt-repayment-timer.tsx
import type { Route } from "./+types/debt-repayment-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import HowItWorks from "~/clients/components/debt-repayment-timer/HowItWorks";
import Disclaimer from "~/clients/components/debt-repayment-timer/Disclaimer";
import FAQ from "~/clients/components/debt-repayment-timer/FAQ";
import KeyboardShortcuts from "~/clients/components/debt-repayment-timer/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/debt-repayment-timer/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Debt Payoff Countdown (Debt Repayment Timer to Payoff Date)";
  const description =
    "Free debt repayment timer and payoff countdown. Set a payoff date or duration to track time remaining and see estimated progress toward being debt-free.";

  const url = "https://www.ilovetimers.com/debt-repayment-timer";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "debt repayment timer",
        "debt payoff timer",
        "debt pay off timer",
        "debt countdown",
        "payoff countdown timer",
        "debt tracker timer",
        "debt free countdown",
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

function msToClockWithDays(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const s = Math.floor(t / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (d > 0) return `${d}d ${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(sec)}`;
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

function formatMoney(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function safeDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
 * Binary search for max font-size that fits both width and height.
 */
function useFitText({
  containerRef,
  textRef,
  deps,
  minPx = 44,
  maxPx = 420,
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
   DEBT REPAYMENT TIMER CARD
========================================================= */
type Mode = "payoff-date" | "duration";

function DebtRepaymentTimerCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFs = useIsFullscreen(cardRef);

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const [mode, setMode] = useState<Mode>("payoff-date");

  const currencies = useMemo(
    () => ["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "JPY"] as const,
    [],
  );

  const [currency, setCurrency] = useState<(typeof currencies)[number]>("USD");
  const [startingBalance, setStartingBalance] = useState<number>(5000);
  const [targetBalance, setTargetBalance] = useState<number>(0);

  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<string>(safeDateInputValue(today));
  const [payoffDate, setPayoffDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return safeDateInputValue(d);
  });
  const [durationDays, setDurationDays] = useState<number>(180);

  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  const startTs = useMemo(() => {
    const ts = new Date(startDate + "T00:00:00").getTime();
    return Number.isFinite(ts) ? ts : Date.now();
  }, [startDate]);

  const endTs = useMemo(() => {
    if (mode === "payoff-date") {
      const ts = new Date(payoffDate + "T00:00:00").getTime();
      return Number.isFinite(ts) ? ts : startTs;
    }
    return startTs + durationDays * 86400_000;
  }, [mode, payoffDate, startTs, durationDays]);

  const totalMs = Math.max(0, endTs - startTs);
  const invalidDates = endTs <= startTs;

  const principalToPay = Math.max(0, startingBalance - targetBalance);

  const progress = useMemo(() => {
    if (totalMs <= 0) return 0;
    const p = (nowTs - startTs) / totalMs;
    return clamp(p, 0, 1);
  }, [nowTs, startTs, totalMs]);

  const pct = Math.round(progress * 100);
  const estPaid = principalToPay * progress;
  const estRemaining = Math.max(0, principalToPay - estPaid);

  const shownRemaining = msToClockWithDays(
    Math.ceil(remainingMs / 1000) * 1000,
  );

  // keep remaining in sync when inputs change
  useEffect(() => {
    const n = Date.now();
    setNowTs(n);
    setRemainingMs(Math.max(0, endTs - n));
    setRunning(false);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, [endTs]);

  // RAF loop while running
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      const n = Date.now();
      setNowTs(n);

      const rem = Math.max(0, endTs - n);
      setRemainingMs(rem);

      if (rem <= 0) {
        setRunning(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running, endTs]);

  function startPause() {
    if (invalidDates) return;

    setRunning((r) => {
      const next = !r;
      const n = Date.now();
      setNowTs(n);
      setRemainingMs(Math.max(0, endTs - n));
      return next;
    });
  }

  function reset() {
    const n = Date.now();
    setNowTs(n);
    setRunning(false);
    setRemainingMs(Math.max(0, endTs - n));
  }

  const statusLabel = invalidDates
    ? "Fix dates"
    : remainingMs <= 0
      ? "Reached"
      : running
        ? "Running"
        : "Ready";

  const displayTone = invalidDates
    ? "border-rose-200 bg-rose-50 text-rose-950"
    : remainingMs <= 10_000 && running
      ? "border-rose-200 bg-amber-50 text-rose-950"
      : "border-slate-200 bg-slate-50 text-slate-950";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownRemaining, statusLabel, isFs, running, invalidDates],
    minPx: 52,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 64,
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
        title="Debt Repayment Timer"
        onExit={() => document.exitFullscreen().catch(() => {})}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind={running ? "solid" : "ghost"}
              onClick={startPause}
              className="py-1 text-sm"
              disabled={invalidDates}
            >
              {running ? "Pause" : "Start"}
            </Btn>
            <Btn kind="ghost" onClick={reset} className="py-1 text-sm">
              Reset
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-first-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-sky-700">
                Debt Repayment Timer
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Set a payoff date or a duration. This is a countdown and a
                simple time-based progress estimate.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 ml-auto">
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

        {/* Mode + Inputs (normal only) */}
        {!isFs && (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip
                active={mode === "payoff-date"}
                onClick={() => setMode("payoff-date")}
                disabled={running}
              >
                Payoff date
              </Chip>
              <Chip
                active={mode === "duration"}
                onClick={() => setMode("duration")}
                disabled={running}
              >
                Duration (days)
              </Chip>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <label className="block text-sm font-semibold text-slate-900">
                Currency
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={running}
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Starting balance
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={startingBalance}
                  onChange={(e) =>
                    setStartingBalance(
                      clamp(Number(e.target.value || 0), 0, 1e9),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={running}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Target balance
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={targetBalance}
                  onChange={(e) =>
                    setTargetBalance(clamp(Number(e.target.value || 0), 0, 1e9))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={running}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <label className="block text-sm font-semibold text-slate-900">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={running}
                />
              </label>

              {mode === "payoff-date" ? (
                <label className="block text-sm font-semibold text-slate-900">
                  Payoff date
                  <input
                    type="date"
                    value={payoffDate}
                    onChange={(e) => setPayoffDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={running}
                  />
                </label>
              ) : (
                <label className="block text-sm font-semibold text-slate-900">
                  Duration (days)
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={durationDays}
                    onChange={(e) =>
                      setDurationDays(
                        clamp(Number(e.target.value || 1), 1, 3650),
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={running}
                  />
                </label>
              )}

              <div className="flex items-end gap-3">
                <Btn onClick={startPause} disabled={invalidDates}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>
            </div>

            {invalidDates ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                End date must be after start date.
              </div>
            ) : null}
          </>
        )}

        {/* Display */}
        <div
          ref={displayBoxRef}
          className={[
            "timer-display-surface mt-4 flex flex-col items-center justify-center font-mono font-extrabold",
            displayTone,
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
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            className={[
              "mt-2 inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
          >
            {shownRemaining}
          </span>

          <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Progress (time)
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-950">
                {pct}%
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Est. paid (linear)
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-950">
                {formatMoney(estPaid, currency)}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/70">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Est. remaining
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-950">
                {formatMoney(estRemaining, currency)}
              </div>
            </div>
          </div>

          <div className="mt-3 w-full max-w-3xl">
            <div className="h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${clamp(progress * 100, 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fullscreen bottom controls */}
        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                active={mode === "payoff-date"}
                onClick={() => setMode("payoff-date")}
                disabled={running}
              >
                Payoff date
              </Chip>
              <Chip
                active={mode === "duration"}
                onClick={() => setMode("duration")}
                disabled={running}
              >
                Duration
              </Chip>

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

              {currencies.map((c) => (
                <Chip
                  key={c}
                  active={c === currency}
                  onClick={() => setCurrency(c)}
                  disabled={running}
                >
                  {c}
                </Chip>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Btn
                  kind={running ? "solid" : "ghost"}
                  onClick={startPause}
                  disabled={invalidDates}
                >
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </div>

              <div className="text-xs text-slate-600 sm:text-sm">
                Tap time to start/pause · Space start/pause · R reset · F
                fullscreen
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
export default function DebtRepaymentTimerPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/debt-repayment-timer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Debt Repayment Timer",
        url,
        description:
          "Debt repayment timer with payoff countdown and simple time-based progress estimate.",
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
            name: "Debt Repayment Timer",
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

      {/* Minimal header */}
      <section className="timer-page-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 sm:py-1">
          <h1 className="mt-2 text-2xl font-semibold text-sky-700 sm:text-3xl">
            Debt Repayment Timer (Payoff Countdown)
          </h1>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-slate-600">
            Set a payoff date or duration, then run a big countdown and a simple
            time-based progress estimate.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="timer-page-primary mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <DebtRepaymentTimerCard />
        </div>

        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Debt Repayment Timer</span>
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

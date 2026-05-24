// app/routes/debt-repayment-timer.tsx
import type { Route } from "./+types/debt-repayment-timer";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  ControlGroup,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as Chip,
  SecondaryActionRow,
  Select,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
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
    "Free debt repayment timer and payoff countdown. Set a payoff date or duration to track time remaining and see estimated progress toward a target balance.";

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

/* =========================================================
   DEBT REPAYMENT TIMER CARD
========================================================= */
type Mode = "payoff-date" | "duration";

function DebtRepaymentTimerCard({ initialNowISO }: { initialNowISO: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);

  const [mode, setMode] = useState<Mode>("payoff-date");

  const currencies = useMemo(
    () => ["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "JPY"] as const,
    [],
  );

  const initialNow = useMemo(() => {
    const parsed = new Date(initialNowISO);
    return Number.isFinite(parsed.getTime()) ? parsed : new Date();
  }, [initialNowISO]);
  const initialNowMs = initialNow.getTime();

  const [currency, setCurrency] = useState<(typeof currencies)[number]>("USD");
  const [startingBalance, setStartingBalance] = useState<number>(5000);
  const [targetBalance, setTargetBalance] = useState<number>(0);

  const today = useMemo(() => initialNow, [initialNow]);
  const [startDate, setStartDate] = useState<string>(safeDateInputValue(today));
  const [payoffDate, setPayoffDate] = useState<string>(() => {
    const d = new Date(initialNow);
    d.setMonth(d.getMonth() + 6);
    return safeDateInputValue(d);
  });
  const [durationDays, setDurationDays] = useState<number>(180);

  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const [nowTs, setNowTs] = useState<number>(() => initialNowMs);

  const startTs = useMemo(() => {
    const ts = new Date(startDate + "T00:00:00").getTime();
    return Number.isFinite(ts) ? ts : initialNowMs;
  }, [startDate, initialNowMs]);

  const endTs = useMemo(() => {
    if (mode === "payoff-date") {
      const ts = new Date(payoffDate + "T00:00:00").getTime();
      return Number.isFinite(ts) ? ts : startTs;
    }
    return startTs + durationDays * 86400_000;
  }, [mode, payoffDate, startTs, durationDays]);

  const totalMs = Math.max(0, endTs - startTs);
  const invalidDates = endTs <= startTs;
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    Math.max(0, endTs - initialNowMs),
  );

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
    ? "bg-amber-50 text-[var(--ilt-text-primary)]"
    : remainingMs <= 10_000 && running
      ? "bg-amber-50 text-[var(--ilt-text-primary)]"
      : "bg-slate-50 text-[var(--ilt-text-primary)]";

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: timeTextRef,
    deps: [shownRemaining, statusLabel, isFs, running, invalidDates],
    minPx: isFs ? 52 : 34,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 56 : 24,
    initialScale: isFs ? 1 : 1.13,
    initialMobileScale: isFs ? 1 : 1.15,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (e.key === " ") {
      e.preventDefault();
      startPause();
    } else if (k === "r") {
      reset();
    } else if (k === "f") {
      void fullscreen.toggle();
    }
  };

  return (
    <Card
      cardRef={cardRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      isFullscreen={isFs}
      className={isFs ? "" : "p-4 sm:p-6"}
    >
      <FullscreenTopBar
        show={isFs}
        title="Debt Repayment Timer"
        onExit={() => void fullscreen.exit()}
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

      <div className={isFs ? "flex h-full flex-col" : "timer-result-stack flex h-full flex-col"}>
        {/* Header (normal only) */}
        {!isFs && (
          <div className="hidden">

            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
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
            <PresetGroup className="order-3 mt-5" title="Payoff mode">
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
            </PresetGroup>

            <SettingGroup
              title="Debt estimate inputs"
              description="These estimates use the balances, dates, and currency you enter."
              className="order-4 mt-4"
            >
            <SettingRow>
              <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  disabled={running}
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

              <Field
                  label="Starting balance"
                  type="number"
                  min={0}
                  step={50}
                  value={startingBalance}
                  onChange={(e) =>
                    setStartingBalance(
                      clamp(Number(e.target.value || 0), 0, 1e9),
                    )
                  }
                  disabled={running}
                />

              <Field
                  label="Target balance"
                  type="number"
                  min={0}
                  step={50}
                  value={targetBalance}
                  onChange={(e) =>
                    setTargetBalance(clamp(Number(e.target.value || 0), 0, 1e9))
                  }
                  disabled={running}
                />
            </SettingRow>

            <SettingRow>
              <Field
                  label="Start date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={running}
                />

              {mode === "payoff-date" ? (
                <Field
                    label="Payoff date"
                    type="date"
                    value={payoffDate}
                    onChange={(e) => setPayoffDate(e.target.value)}
                    disabled={running}
                  />
              ) : (
                <Field
                    label="Duration (days)"
                    type="number"
                    min={1}
                    max={3650}
                    value={durationDays}
                    onChange={(e) =>
                      setDurationDays(
                        clamp(Number(e.target.value || 1), 1, 3650),
                      )
                    }
                    disabled={running}
                  />
              )}

              <ControlGroup>
                <Btn onClick={startPause} disabled={invalidDates}>
                  {running ? "Pause" : "Start"}
                </Btn>
                <Btn kind="ghost" onClick={reset}>
                  Reset
                </Btn>
              </ControlGroup>
            </SettingRow>

            <SecondaryActionRow className="timer-result-actions">
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Space start/pause / R reset / F fullscreen
            </ShortcutHint>
            </SettingGroup>

            {invalidDates ? (
              <div className="order-5 mt-4 ilt-surface-accent p-4 text-sm font-semibold text-[var(--ilt-text-secondary)]">
                End date must be after start date.
              </div>
            ) : null}
          </>
        )}

        {/* Display */}
        <div
          data-display-stage
          ref={displayBoxRef}
          className={[
            "timer-display-surface order-1 mt-0 flex flex-col items-center justify-center font-mono font-extrabold",
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
          <div className="timer-result-label ilt-content-label">
            {statusLabel}
          </div>

          <span
            ref={timeTextRef}
            data-primary-display-value
            className={[
              "timer-result-value",
              "mt-2 inline-block text-center",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-wide sm:tracking-widest",
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

          <div className="timer-result-detail-grid mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            <div className="timer-result-panel ilt-surface-muted p-4">
              <div className="ilt-content-label">
                Progress (time)
              </div>
              <div className="mt-1 text-2xl font-extrabold text-[var(--ilt-text-primary)]">
                {pct}%
              </div>
            </div>

            <div className="timer-result-panel ilt-surface-muted p-4">
              <div className="ilt-content-label">
                Est. paid (linear)
              </div>
              <div className="mt-1 text-2xl font-extrabold text-[var(--ilt-text-primary)]">
                {formatMoney(estPaid, currency)}
              </div>
            </div>

            <div className="timer-result-panel ilt-surface-muted p-4">
              <div className="ilt-content-label">
                Est. remaining
              </div>
              <div className="mt-1 text-2xl font-extrabold text-[var(--ilt-text-primary)]">
                {formatMoney(estRemaining, currency)}
              </div>
            </div>
          </div>

          <div className="mt-3 w-full max-w-3xl">
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--ilt-bg-panel)] shadow-[inset_0_0_0_1px_var(--ilt-border-subtle)]">
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

              <div className="h-5 w-px bg-[var(--ilt-border-subtle)] mx-1 hidden sm:block" />

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

              <div className="ilt-helper-text sm:text-sm">
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        title="Debt Repayment Timer"
        description="Set a payoff date or duration, then run a payoff countdown and simple time-based progress estimate based on your entries."
        display={<DebtRepaymentTimerCard initialNowISO={nowISO} />}
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

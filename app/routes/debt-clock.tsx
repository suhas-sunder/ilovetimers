// app/routes/debt-clock.tsx
import type { Route } from "./+types/debt-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HowItWorks from "~/clients/components/debt-clock/HowItWorks";
import Disclaimer from "~/clients/components/debt-clock/Disclaimer";
import FAQ from "~/clients/components/debt-clock/FAQ";
import KeyboardShortcuts from "~/clients/components/debt-clock/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/debt-clock/PopularUseCases";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";


import {
  Button as Btn,
  ControlGroup,
  Field,
  PresetChip as Chip,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  SecondaryActionRow,
  SeoBand,
  Select,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  ToolHero,
  ToolFrame as Card,
} from "~/clients/components/ui/foundation";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Debt Clock (Estimated National & World Debt Counter, Fullscreen)";
  const description =
    "Free debt clock with an estimated counter for national, world, or custom debt. Choose a preset or enter a starting amount and yearly change rate to simulate a running total in fullscreen.";

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
        "estimated debt clock",
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
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

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
    minPx: isFs ? 52 : 22,
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
      void fullscreen.toggle();
    } else if (k === "c") {
      copy();
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
        title="Debt Clock"
        onExit={() => void fullscreen.exit()}
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

      <div className={isFs ? "flex h-full flex-col" : "timer-result-stack flex h-full flex-col"}>
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
            overflow: "hidden",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) startPause();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to start or pause" : undefined}
        >
          <div className="timer-result-label text-xs font-extrabold uppercase tracking-widest text-slate-700">
            Current estimated debt
          </div>

          <span
            ref={amountTextRef}
            data-primary-display-value
            className={[
              "timer-result-value",
              "mt-2 inline-block text-center font-mono font-extrabold text-slate-950",
              isFs ? "tracking-wide sm:tracking-widest" : "tracking-normal sm:tracking-widest",
            ].join(" ")}
            style={{
              fontSize: fitFontPx,
              lineHeight: "1",
              maxWidth: "100%",
              transform: "translateZ(0)",
              whiteSpace: "nowrap",
            }}
          >
            {formattedNow}
          </span>

          <div className="timer-result-detail-grid mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
            <div className="timer-result-panel rounded-lg bg-white p-4">
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

            <div className="timer-result-panel rounded-lg bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Shortcuts
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">
                Space start/pause · R reset · F fullscreen · C copy
              </div>
            </div>
          </div>

        </div>

        {/* Settings (normal only) */}
        {!isFs && (
          <div className="timer-control-stack mt-4">
            <ControlGroup>
              <Btn onClick={startPause}>{running ? "Pause" : "Start"}</Btn>
              <Btn kind="ghost" onClick={reset}>
                Reset
              </Btn>
            </ControlGroup>

            <SecondaryActionRow className="timer-result-actions">
              <Btn kind="ghost" onClick={copy}>
                Copy
              </Btn>
              <Btn kind="ghost" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Btn>
            </SecondaryActionRow>

            <PresetGroup
              title="Estimate presets"
              description="Demo presets are placeholders. Use Custom with your own numbers if you want."
            >
              {PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  active={p.id === presetId}
                  onClick={() => setPresetId(p.id)}
                >
                  {p.label}
                </Chip>
              ))}
            </PresetGroup>

            <SettingGroup
              title="Debt estimate inputs"
              description="This counter is an estimate based on your starting value and average rate."
            >
              <SettingRow>
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                </Select>

                <Field
                  label="Starting debt"
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
                />

                <Field
                  label="Yearly change (can be negative)"
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
                />
              </SettingRow>

              <Field
                label="As of label"
                type="text"
                value={asOfLabel}
                onChange={(e) => {
                  setAsOfLabel(e.target.value);
                  if (presetId !== "custom") setPresetId("custom");
                }}
                placeholder="e.g. Source X, 2025-12-31"
              />
            </SettingGroup>

            <ShortcutHint>
              <span className="ilt-keycap">Space</span> start/pause ·{" "}
              <span className="ilt-keycap">R</span> reset ·{" "}
              <span className="ilt-keycap">F</span> fullscreen ·{" "}
              <span className="ilt-keycap">C</span> copy
            </ShortcutHint>
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
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolHero
        display={<DebtClockCard />}
        title="Debt Clock (Estimated Counter)"
        description="Run an estimated debt counter from a starting value and yearly change rate. Presets are placeholders; custom inputs control the calculation."
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

// app/routes/military-time-converter.tsx
import type { Route } from "./+types/military-time-converter";
import { json } from "@remix-run/node";
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
  ContentSection,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetGroup,
  PresetChip as ChipBtn,
  SeoBand,
  SecondaryActionRow,
  SettingGroup,
  ShortcutHint,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText as useFitText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import HowItWorks from "~/clients/components/military-time-converter/HowItWorks";
import FAQ from "~/clients/components/military-time-converter/FAQ";
import KeyboardShortcuts from "~/clients/components/military-time-converter/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/military-time-converter/PopularUseCases";
import { ToolTrustNote } from "~/clients/components/trust/ToolTrust";

const REVIEW_DATE = { iso: "2026-07-15", label: "July 15, 2026" } as const;

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Military Time Converter | 12-Hour and 24-Hour Time";
  const description =
    "Convert between military time and standard 12-hour time with clear AM and PM results, midnight handling, and common examples.";

  const url = "https://www.ilovetimers.com/military-time-converter";

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
  return json({ ok: true });
}

/* =========================================================
   UTILS
========================================================= */
const pad2 = (n: number) => n.toString().padStart(2, "0");

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

function cleanDigits(s: string) {
  return (s || "").replace(/[^\d]/g, "");
}

function formatStandard(h24: number, m: number) {
  const isPM = h24 >= 12;
  const h12raw = h24 % 12;
  const h12 = h12raw === 0 ? 12 : h12raw;
  const suffix = isPM ? "PM" : "AM";
  return `${h12}:${pad2(m)} ${suffix}`;
}

function formatMilitary(h24: number, m: number) {
  return `${pad2(h24)}:${pad2(m)}`;
}

type ParseResult = {
  valid: boolean;
  h24: number;
  m: number;
  normalized: string;
  standard: string;
  error?: string;
  note?: string;
};

function parseMilitary(input: string): ParseResult {
  const raw = (input || "").trim();
  if (!raw) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Enter a military time like 1730 or 17:30.",
    };
  }

  const hasColon = raw.includes(":");
  let h = 0;
  let m = 0;

  if (hasColon) {
    const parts = raw.split(":");
    if (parts.length !== 2) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Use a valid format like 17:30 or 5:30.",
      };
    }

    const hh = cleanDigits(parts[0]);
    const mm = cleanDigits(parts[1]);

    if (!hh || !mm) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Use a valid format like 17:30.",
      };
    }

    h = Number(hh);
    m = Number(mm);
  } else {
    const d = cleanDigits(raw);
    if (!d) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        standard: "",
        error: "Enter digits like 1730, 0730, or 0000.",
      };
    }

    if (d.length === 1 || d.length === 2) {
      h = Number(d);
      m = 0;
    } else if (d.length === 3) {
      h = Number(d.slice(0, 1));
      m = Number(d.slice(1));
    } else {
      h = Number(d.slice(0, d.length - 2));
      m = Number(d.slice(d.length - 2));
    }
  }

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "That time does not look valid.",
    };
  }

  if (h === 24 && m === 0) {
    const normalized = "2400";
    return {
      valid: true,
      h24: 0,
      m: 0,
      normalized,
      standard: "12:00 AM",
      note: "2400 is commonly used to mean midnight. This converter treats 2400 as 00:00.",
    };
  }

  if (h < 0 || h > 23) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Hour must be 0 to 23 (or 2400 for midnight).",
    };
  }

  if (m < 0 || m > 59) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      standard: "",
      error: "Minutes must be 00 to 59.",
    };
  }

  const normalized = formatMilitary(h, m);
  const standard = formatStandard(h, m);

  return { valid: true, h24: h, m, normalized, standard };
}

type ParseStandardResult = {
  valid: boolean;
  h24: number;
  m: number;
  normalized: string;
  military: string;
  error?: string;
};

function parseStandard(input: string): ParseStandardResult {
  const raw = (input || "").trim();
  if (!raw) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Enter a time like 5:30 PM or 12 AM.",
    };
  }

  const s = raw.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

  const hasAM = /\bam\b/.test(s);
  const hasPM = /\bpm\b/.test(s);

  if (!hasAM && !hasPM) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Include AM or PM (example: 5:30 PM).",
    };
  }

  const suffix = hasPM ? "PM" : "AM";
  const timePart = s.replace(/\bam\b|\bpm\b/g, "").trim();

  let h = 0;
  let m = 0;

  if (!timePart) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Enter a time like 5:30 PM or 5 PM.",
    };
  }

  if (timePart.includes(":")) {
    const [hhRaw, mmRaw] = timePart.split(":");
    const hh = cleanDigits(hhRaw);
    const mm = cleanDigits(mmRaw);
    if (!hh || !mm) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        military: "",
        error: "Use a valid format like 5:30 PM.",
      };
    }
    h = Number(hh);
    m = Number(mm);
  } else {
    const d = cleanDigits(timePart);
    if (!d) {
      return {
        valid: false,
        h24: 0,
        m: 0,
        normalized: "",
        military: "",
        error: "Use a format like 5 PM or 5:30 PM.",
      };
    }
    h = Number(d);
    m = 0;
  }

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "That time does not look valid.",
    };
  }

  if (h < 1 || h > 12) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Hour must be 1 to 12 for standard time.",
    };
  }

  if (m < 0 || m > 59) {
    return {
      valid: false,
      h24: 0,
      m: 0,
      normalized: "",
      military: "",
      error: "Minutes must be 00 to 59.",
    };
  }

  let h24 = h % 12;
  if (suffix === "PM") h24 += 12;

  const normalized = `${h}:${pad2(m)} ${suffix}`;
  const military = formatMilitary(h24, m);

  return { valid: true, h24, m, normalized, military };
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   TOOL CARD
========================================================= */
type ActiveField = "mil" | "std";

function MilitaryTimeConverterCard() {
  const [militaryInput, setMilitaryInput] = useState("1730");
  const [standardInput, setStandardInput] = useState("5:30 PM");
  const [activeField, setActiveField] = useState<ActiveField>("mil");

  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const mil = useMemo(() => parseMilitary(militaryInput), [militaryInput]);
  const std = useMemo(() => parseStandard(standardInput), [standardInput]);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(cardRef);
  const isFs = fullscreen.isFullscreen;

  const displayBoxRef = useRef<HTMLDivElement>(null);
  const displayTextRef = useRef<HTMLSpanElement>(null);

  const shownLabel =
    activeField === "mil" ? "Standard time (AM/PM)" : "Military time (24-hour)";

  const shownValue = useMemo(() => {
    if (activeField === "mil") return mil.valid ? mil.standard : "—";
    return std.valid ? std.military : "—";
  }, [activeField, mil.valid, mil.standard, std.valid, std.military]);

  // Reserve width to reduce jitter (monospace + fixed ch width for the display value)
  const shownMinCh = activeField === "mil" ? 10 : 6;

  const fitFontPx = useFitText({
    containerRef: displayBoxRef,
    textRef: displayTextRef,
    deps: [shownValue, shownLabel, isFs, activeField],
    minPx: 44,
    maxPx: isFs ? 520 : 520,
    paddingAllowancePx: isFs ? 72 : 80,
    initialScale: 0.93,
  });

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => clearToastTimer();
  }, [clearToastTimer]);

  const copy = useCallback(
    async (label: string, text: string) => {
      const ok = await copyToClipboard(text);
      setLastCopied(ok ? label : "Copy failed");
      clearToastTimer();
      toastTimerRef.current = window.setTimeout(() => setLastCopied(null), 900);
    },
    [clearToastTimer],
  );

  const fillNow = useCallback(() => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const milText = formatMilitary(h, m);
    const stdText = formatStandard(h, m);
    setMilitaryInput(milText);
    setStandardInput(stdText);
    setActiveField("mil");
  }, []);

  const clearAll = useCallback(() => {
    setMilitaryInput("");
    setStandardInput("");
    clearToastTimer();
    setLastCopied(null);
    setActiveField("mil");
  }, [clearToastTimer]);

  const quick = useMemo(
    () => ["0000", "0030", "0600", "1200", "1730", "2359", "2400"],
    [],
  );

  const setFromMilitary = useCallback((next: string) => {
    setActiveField("mil");
    setMilitaryInput(next);

    const parsed = parseMilitary(next);
    if (parsed.valid) setStandardInput(parsed.standard);
  }, []);

  const setFromStandard = useCallback((next: string) => {
    setActiveField("std");
    setStandardInput(next);

    const parsed = parseStandard(next);
    if (parsed.valid) setMilitaryInput(parsed.military);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "n") {
      e.preventDefault();
      fillNow();
      return;
    }

    if (k === "c") {
      e.preventDefault();
      if (mil.valid) copy("Standard", mil.standard);
      return;
    }

    if (k === "m") {
      e.preventDefault();
      if (std.valid) copy("Military", std.military);
      return;
    }

    if (k === "r") {
      e.preventDefault();
      clearAll();
      return;
    }

    if (k === "f") {
      e.preventDefault();
      void fullscreen.toggle();
      return;
    }

    if (k === "escape" && isFs) {
      e.preventDefault();
      void fullscreen.exit();
    }
  };

  const statusLabel =
    activeField === "mil"
      ? mil.valid
        ? "Valid military input"
        : "Invalid military input"
      : std.valid
        ? "Valid standard input"
        : "Invalid standard input";

  const isPrimaryValid = activeField === "mil" ? mil.valid : std.valid;

  const onCopyPrimary = useCallback(() => {
    if (activeField === "mil") {
      if (mil.valid) copy("Standard", mil.standard);
    } else {
      if (std.valid) copy("Military", std.military);
    }
  }, [activeField, mil.valid, mil.standard, std.valid, std.military, copy]);

  // Reserve error/note area to prevent layout shift
  const milFootnote =
    mil.valid && mil.note ? mil.note : mil.valid ? "" : mil.error || "";
  const stdFootnote = std.valid ? "" : std.error || "";

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
        title="Military Time Converter"
        onExit={() => void fullscreen.exit()}
        right={
          <div className="flex items-center gap-2">
            <Btn
              kind="solid"
              onClick={onCopyPrimary}
              className="py-1 text-sm"
              disabled={!isPrimaryValid}
            >
              Copy
            </Btn>
            <Btn kind="ghost" onClick={fillNow} className="py-1 text-sm">
              Now
            </Btn>
            <Btn kind="ghost" onClick={clearAll} className="py-1 text-sm">
              Clear
            </Btn>
          </div>
        }
      />

      <div className={isFs ? "flex h-full flex-col" : "timer-result-stack flex h-full flex-col"}>
        {!isFs && (
          <SecondaryActionRow className="timer-result-actions order-5">
              <Btn
                kind="ghost"
                onClick={() => void fullscreen.toggle()}
                className="py-2"
              >
                Fullscreen
              </Btn>
          </SecondaryActionRow>
        )}

        {!isFs && (
          <div className="order-4 mt-4 flex flex-col gap-3">
            <SecondaryActionRow className="timer-result-actions">
              <Btn kind="ghost" onClick={fillNow}>
                Use current time
              </Btn>
              <Btn kind="ghost" onClick={clearAll}>
                Clear
              </Btn>
              <Btn
                kind="solid"
                onClick={onCopyPrimary}
                disabled={!isPrimaryValid}
              >
                Copy result
              </Btn>
            </SecondaryActionRow>

            <ShortcutHint>
              Shortcuts: N now · C copy AM/PM · M copy military · R clear · F
              fullscreen
            </ShortcutHint>
          </div>
        )}

        {!isFs && (
          <PresetGroup className="order-3 mt-4" title="Examples">
            {quick.map((q) => (
              <ChipBtn
                key={q}
                onClick={() => setFromMilitary(q)}
                active={cleanDigits(militaryInput) === q}
              >
                {q}
              </ChipBtn>
            ))}
          </PresetGroup>
        )}

        {/* Big Display (fixed internal layout to avoid shifting) */}
        <div
          ref={displayBoxRef}
          className={[
            "ilt-display-stage timer-display-surface relative order-1 mt-0 text-slate-950",
            "border-slate-200 p-3 sm:p-6",
            isFs ? "mx-2 sm:mx-4 flex-1" : "",
          ].join(" ")}
          style={{
            minHeight: isFs ? 0 : 230,
            marginTop: isFs ? "3.6rem" : undefined,
            marginBottom: isFs ? "3.6rem" : undefined,
            userSelect: "none",
            overflow: isFs ? "hidden" : "visible",
          }}
          aria-live="polite"
          onClick={() => {
            if (isFs) onCopyPrimary();
          }}
          role={isFs ? "button" : undefined}
          title={isFs ? "Tap/click to copy the current result" : undefined}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <span
              ref={displayTextRef}
              data-primary-display-value
              className={[
                "timer-result-value",
                "inline-block text-center font-mono font-extrabold tabular-nums",
                isFs ? "tracking-wide sm:tracking-widest" : "tracking-widest",
              ].join(" ")}
              style={{
                fontSize: fitFontPx,
                lineHeight: "1",
                transform: "translateZ(0)",
                maxWidth: "100%",
                minWidth: isFs ? `${shownMinCh}ch` : undefined,
              }}
            >
              {shownValue}
            </span>

            <div className="timer-result-label h-4 text-xs font-extrabold uppercase tracking-widest text-slate-700">
              {shownLabel}
            </div>

            {/* Fixed-height status row */}
            <div className="timer-result-context mt-2 h-4 text-xs font-semibold text-slate-700">
              {statusLabel}
            </div>
          </div>

          {isFs && (
            <div className="absolute right-3 top-3 hidden sm:block rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              Tap result to copy
            </div>
          )}
        </div>

        {/* Inputs */}
        {!isFs && (
        <div className="order-2">
          <SettingGroup className="mt-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Military -> Standard */}
            <div className="timer-result-panel rounded-lg bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Military (24-hour)
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Try 1730, 0730, 5:30, 17:30, 0000, 2400
                  </div>
                </div>

                <Btn
                  kind="ghost"
                  onClick={() => mil.valid && copy("Standard", mil.standard)}
                  disabled={!mil.valid}
                  className="py-2"
                >
                  Copy AM/PM
                </Btn>
              </div>

              <Field
                label="Military time input"
                inputMode="numeric"
                value={militaryInput}
                onChange={(e) => setFromMilitary(e.target.value)}
                onFocus={() => setActiveField("mil")}
                placeholder="1730"
              />

              {/* Result box with reserved content height */}
              <div className="timer-result-panel mt-3 rounded-lg bg-white p-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Standard time (AM/PM)
                </div>

                <div className="mt-1 min-h-[92px]">
                  {/* Value row (reserved) */}
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {mil.valid ? mil.standard : "—"}
                  </div>

                  {/* Sub row (reserved) */}
                  <div className="mt-1 text-sm text-slate-700">
                    {mil.valid ? (
                      <>
                        Normalized military:{" "}
                        <span className="font-semibold">{mil.normalized}</span>
                      </>
                    ) : (
                      <span className="opacity-0">
                        Normalized military: 0000
                      </span>
                    )}
                  </div>

                  {/* Footnote row (reserved) */}
                  <div className="mt-1 min-h-[20px] text-sm text-slate-700">
                    {milFootnote ? (
                      milFootnote
                    ) : (
                      <span className="opacity-0">.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard -> Military */}
            <div className="timer-result-panel rounded-lg bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Standard (AM/PM)
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Try 5:30 PM, 12 AM, 9 PM, 12:05 am
                  </div>
                </div>

                <Btn
                  kind="ghost"
                  onClick={() => std.valid && copy("Military", std.military)}
                  disabled={!std.valid}
                  className="py-2"
                >
                  Copy military
                </Btn>
              </div>

              <Field
                label="Standard time input"
                value={standardInput}
                onChange={(e) => setFromStandard(e.target.value)}
                onFocus={() => setActiveField("std")}
                placeholder="5:30 PM"
              />

              {/* Result box with reserved content height */}
              <div className="timer-result-panel mt-3 rounded-lg bg-white p-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  Military time (24-hour)
                </div>

                <div className="mt-1 min-h-[92px]">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {std.valid ? std.military : "—"}
                  </div>

                  <div className="mt-1 text-sm text-slate-700">
                    {std.valid ? (
                      <>
                        Normalized standard:{" "}
                        <span className="font-semibold">{std.normalized}</span>
                      </>
                    ) : (
                      <span className="opacity-0">
                        Normalized standard: 12:00 PM
                      </span>
                    )}
                  </div>

                  <div className="mt-1 min-h-[20px] text-sm text-slate-700">
                    {stdFootnote ? (
                      stdFootnote
                    ) : (
                      <span className="opacity-0">.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </SettingGroup>

          <div className="mt-4 flex items-center justify-between gap-3">
            <ShortcutHint className="timer-result-shortcut w-auto max-w-none text-left sm:text-left">
              Tip: click the display once so shortcuts work.
            </ShortcutHint>
            <div className="text-xs text-slate-600">
              {lastCopied ? (
                <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-900">
                  {lastCopied}
                </span>
              ) : (
                <span className="opacity-0">Copied</span>
              )}
            </div>
          </div>
        </div>
        )}

        <FullscreenBottomBar show={isFs}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 sm:text-sm">
              Tap result to copy · N now · C copy AM/PM · M copy military · R
              clear · F fullscreen
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {lastCopied ? `Copied: ${lastCopied}` : statusLabel}
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
export default function MilitaryTimeConverterPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/military-time-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Military Time Converter",
        url,
        dateModified: REVIEW_DATE.iso,
        description:
          "Convert supplied military-style 24-hour times to standard AM/PM time and convert AM/PM values back, including midnight and noon handling.",
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
            name: "Military Time Converter",
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
        display={<MilitaryTimeConverterCard />}
        title="Military Time Converter"
        description="Convert supplied military-style 24-hour times to AM/PM and convert AM/PM back, with validation, midnight and noon examples, copy, and fullscreen."
      />

      <SeoBand>
        <HowItWorks />
        <ContentSection>
          <p>
            Need the current live 24-hour time instead of converting a written
            value? Open the{" "}
            <a className="ilt-content-link" href="/military-time-clock">
              military time clock
            </a>{" "}
            for local or UTC/Zulu display with seconds and fullscreen. For a
            general colon-formatted live display, use the{" "}
            <a className="ilt-content-link" href="/24-hour-clock">
              24 hour clock
            </a>
            .
          </p>
        </ContentSection>
        <ToolTrustNote reviewDate={REVIEW_DATE} heading="Conversion scope and limitations">
          <p>
            This converter applies standard 12-hour and 24-hour clock formatting
            rules. It does not determine a timezone, date, or official schedule
            unless that information is supplied separately.
          </p>
          <p>
            The result is a format conversion of the entered value. It does not
            certify the accuracy of a source schedule or add location context.
          </p>
        </ToolTrustNote>
        <KeyboardShortcuts />
        <PopularUseCases />
        <FAQ />
      </SeoBand>
    </PageShell>
  );
}

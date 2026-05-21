// app/routes/milliseconds-converter.tsx
import type { Route } from "./+types/milliseconds-converter";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button as Btn,
  Field,
  PageShell,
  PresetGroup,
  PresetChip as TabBtn,
  SecondaryActionRow,
  SeoBand,
  SettingsPanel,
  StatusChip as MiniPill,
  ToolFrame as Card,
  ToolHero,
} from "~/clients/components/ui/foundation";
import HowItWorks from "~/clients/components/milliseconds-converter/HowItWorks";
import Disclaimer from "~/clients/components/milliseconds-converter/Disclaimer";
import FAQ from "~/clients/components/milliseconds-converter/FAQ";
import KeyboardShortcuts from "~/clients/components/milliseconds-converter/KeyboardShortcuts";
import PopularUseCases from "~/clients/components/milliseconds-converter/PopularUseCases";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Milliseconds to Seconds Converter (Instant, Two-Way)";
  const description =
    "Convert milliseconds to seconds or seconds to milliseconds instantly. Paste a value and get an exact result with no clutter.";

  const url = "https://www.ilovetimers.com/milliseconds-converter";

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
  return json({ ok: true });
}

/* =========================================================
   EXACT DECIMAL UTILS (no float rounding)
========================================================= */
function cleanNumericInput(raw: string) {
  return (raw || "").trim().replace(/,/g, "");
}

function isValidDecimalString(s: string) {
  // Allows: -12, 12., .5, -0.01667, +10.2
  return /^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(s);
}

function normalizeDecimalString(raw: string) {
  const t = cleanNumericInput(raw);
  if (!t) return null;
  if (!isValidDecimalString(t)) return null;

  let sign = "";
  let s = t;

  if (s[0] === "+" || s[0] === "-") {
    sign = s[0] === "-" ? "-" : "";
    s = s.slice(1);
  }

  // Split into int and frac parts
  const parts = s.split(".");
  let intPart = parts[0] ?? "";
  let fracPart = parts[1] ?? "";

  if (intPart === "") intPart = "0";

  // Remove leading zeros in intPart (keep at least one digit)
  intPart = intPart.replace(/^0+(?=\d)/, "");

  // Remove trailing zeros in fracPart
  fracPart = fracPart.replace(/0+$/, "");

  // If everything is zero, drop sign
  const isZero =
    intPart.replace(/0/g, "") === "" && fracPart.replace(/0/g, "") === "";
  if (isZero) return "0";

  return fracPart ? `${sign}${intPart}.${fracPart}` : `${sign}${intPart}`;
}

// Shift decimal by `places` (positive shifts decimal right, negative left).
// Example: shiftDecimal("1.5", 3) => "1500"
//          shiftDecimal("16.67", -3) => "0.01667"
function shiftDecimal(raw: string, places: number) {
  const norm = normalizeDecimalString(raw);
  if (norm == null) return null;

  let sign = "";
  let s = norm;
  if (s[0] === "-") {
    sign = "-";
    s = s.slice(1);
  }

  const [intPartRaw, fracPartRaw = ""] = s.split(".");
  const digits = (intPartRaw + fracPartRaw).replace(/^0+(?=\d)/, "");

  const fracLen = fracPartRaw.length;
  const currentPointFromRight = fracLen; // digits after decimal currently
  const newPointFromRight = currentPointFromRight - places;

  let outInt = "";
  let outFrac = "";

  if (newPointFromRight <= 0) {
    // Decimal moves right past the end: append zeros
    outInt = digits + "0".repeat(-newPointFromRight);
    outFrac = "";
  } else if (newPointFromRight >= digits.length) {
    // Decimal moves left beyond the start: pad with leading zeros
    const zerosNeeded = newPointFromRight - digits.length;
    outInt = "0";
    outFrac = "0".repeat(zerosNeeded) + digits;
  } else {
    // Decimal is inside digits
    const cut = digits.length - newPointFromRight;
    outInt = digits.slice(0, cut);
    outFrac = digits.slice(cut);
  }

  // Clean up
  outInt = outInt.replace(/^0+(?=\d)/, "");
  outFrac = outFrac.replace(/0+$/, "");

  const isZero =
    outInt.replace(/0/g, "") === "" && outFrac.replace(/0/g, "") === "";
  if (isZero) return "0";

  const out = outFrac ? `${outInt}.${outFrac}` : outInt;
  return sign ? `${sign}${out}` : out;
}

function prettyNumber(raw: string | null) {
  if (raw == null) return "";
  const norm = normalizeDecimalString(raw);
  return norm ?? "";
}

function divideDecimalStringByInteger(raw: string | null, divisor: number) {
  if (raw == null || divisor <= 0) return "";
  const norm = normalizeDecimalString(raw);
  if (norm == null) return "";

  const negative = norm.startsWith("-");
  const unsigned = negative ? norm.slice(1) : norm;
  const [intPart, fracPart = ""] = unsigned.split(".");
  const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, "") || "0";
  const denominator =
    BigInt(divisor) * 10n ** BigInt(Math.max(0, fracPart.length));
  let numerator = BigInt(digits);

  const whole = numerator / denominator;
  let remainder = numerator % denominator;
  let fraction = "";

  for (let i = 0; i < 12 && remainder !== 0n; i += 1) {
    remainder *= 10n;
    fraction += String(remainder / denominator);
    remainder %= denominator;
  }

  fraction = fraction.replace(/0+$/, "");
  const value = fraction ? `${whole}.${fraction}` : String(whole);
  const isZero = value.replace(/[0.]/g, "") === "";
  return negative && !isZero ? `-${value}` : value;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / blocked clipboard API
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* =========================================================
   TOOL
========================================================= */
function MillisecondsConverterCard() {
  const [tab, setTab] = useState<"ms2s" | "s2ms">("ms2s");

  const [msInput, setMsInput] = useState("1000");
  const [sInput, setSInput] = useState("1");

  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const clearCopiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (clearCopiedTimerRef.current) {
        window.clearTimeout(clearCopiedTimerRef.current);
      }
    };
  }, []);

  const msNorm = useMemo(() => normalizeDecimalString(msInput), [msInput]);
  const sNorm = useMemo(() => normalizeDecimalString(sInput), [sInput]);

  const msToSeconds = useMemo(() => {
    if (msNorm == null) return null;
    return shiftDecimal(msNorm, -3);
  }, [msNorm]);

  const secondsToMs = useMemo(() => {
    if (sNorm == null) return null;
    return shiftDecimal(sNorm, 3);
  }, [sNorm]);

  const reset = useCallback(() => {
    setTab("ms2s");
    setMsInput("1000");
    setSInput("1");
  }, []);

  const copy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? "Copied" : "Copy failed");

    if (clearCopiedTimerRef.current) {
      window.clearTimeout(clearCopiedTimerRef.current);
    }
    clearCopiedTimerRef.current = window.setTimeout(
      () => setLastCopied(null),
      900,
    );
  }, []);

  const examples = useMemo(
    () => [
      { ms: "1", s: "0.001" },
      { ms: "10", s: "0.01" },
      { ms: "16.67", s: "0.01667" }, // ~60fps frame
      { ms: "100", s: "0.1" },
      { ms: "250", s: "0.25" },
      { ms: "500", s: "0.5" },
      { ms: "1000", s: "1" },
      { ms: "1500", s: "1.5" },
      { ms: "2000", s: "2" },
      { ms: "60000", s: "60" },
    ],
    [],
  );

  const primaryValue =
    tab === "ms2s" ? prettyNumber(msToSeconds) : prettyNumber(secondsToMs);

  const primaryLabel = tab === "ms2s" ? "Seconds" : "Milliseconds";

  const copyText =
    tab === "ms2s"
      ? msToSeconds == null
        ? ""
        : `${prettyNumber(msNorm)} ms = ${prettyNumber(msToSeconds)} seconds`
      : secondsToMs == null
        ? ""
        : `${prettyNumber(sNorm)} seconds = ${prettyNumber(secondsToMs)} ms`;

  const baseMilliseconds = tab === "ms2s" ? msNorm : secondsToMs;
  const equivalentRows = useMemo(
    () =>
      baseMilliseconds == null
        ? []
        : [
            ["Milliseconds", prettyNumber(baseMilliseconds)],
            ["Seconds", divideDecimalStringByInteger(baseMilliseconds, 1000)],
            ["Minutes", divideDecimalStringByInteger(baseMilliseconds, 60_000)],
            [
              "Hours",
              divideDecimalStringByInteger(baseMilliseconds, 3_600_000),
            ],
            ["Days", divideDecimalStringByInteger(baseMilliseconds, 86_400_000)],
          ],
    [baseMilliseconds],
  );

  return (
    <Card className="p-4 sm:p-6">
      <div className="timer-result-stack flex h-full flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <SecondaryActionRow className="timer-result-actions sm:justify-end">
          <Btn kind="ghost" onClick={reset} className="py-2">
            Reset
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => copy(copyText)}
            disabled={!copyText}
            className="py-2"
          >
            Copy
          </Btn>
        </SecondaryActionRow>
      </div>

      <PresetGroup className="mt-5" title="Conversion direction">
        <TabBtn active={tab === "ms2s"} onClick={() => setTab("ms2s")}>
          ms → seconds
        </TabBtn>
        <TabBtn active={tab === "s2ms"} onClick={() => setTab("s2ms")}>
          seconds → ms
        </TabBtn>

        {lastCopied ? <MiniPill>{lastCopied}</MiniPill> : null}
      </PresetGroup>

      <div data-display-stage className="timer-primary-surface mt-6 flex flex-col items-center justify-start gap-5">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center text-center">
          <div className="timer-result-label ilt-content-label">
            {primaryLabel}
          </div>

          <div
            data-primary-display-value
            className="timer-result-value mt-2 font-mono text-[clamp(132px,24vw,300px)] font-extrabold leading-none text-[var(--ilt-text-primary)]"
          >
            {primaryValue || "—"}
          </div>

          <div className="timer-result-context mt-2 text-sm font-semibold text-[var(--ilt-text-secondary)]">
            {tab === "ms2s" ? (
              <>{msNorm == null ? "Enter a valid milliseconds value." : null}</>
            ) : (
              <>{sNorm == null ? "Enter a valid seconds value." : null}</>
            )}
          </div>

          {copyText ? (
            <div className="timer-result-panel ilt-surface-muted mt-3 p-3 text-sm text-[var(--ilt-text-secondary)]">
              {copyText}
            </div>
          ) : null}
        </div>

        {equivalentRows.length ? (
          <div className="grid w-full max-w-5xl gap-2 sm:grid-cols-5">
            {equivalentRows.map(([label, value]) => (
              <div key={label} className="timer-result-panel ilt-surface-muted px-3 py-2">
                <div className="ilt-content-label">
                  {label}
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold text-[var(--ilt-text-primary)]">
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "ms2s" ? (
          <Field
              className="w-full max-w-5xl"
              label="Milliseconds (ms)"
              value={msInput}
              onChange={(e) => setMsInput(e.target.value)}
              inputMode="decimal"
              placeholder="1000"
            />
        ) : (
          <Field
              className="w-full max-w-5xl"
              label="Seconds (s)"
              value={sInput}
              onChange={(e) => setSInput(e.target.value)}
              inputMode="decimal"
              placeholder="1"
            />
        )}
      </div>

      {/* Quick examples */}
      <SettingsPanel className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-extrabold text-[var(--ilt-text-primary)]">
              Quick examples
            </div>
            <div className="text-xs text-[var(--ilt-text-secondary)]">
              Click to populate the converter.
            </div>
          </div>
          <div className="text-xs text-[var(--ilt-text-secondary)]">
            Common: 1000 ms = 1 second
          </div>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {examples.map((ex) => (
            <TabBtn
              key={`${ex.ms}-${ex.s}`}
              onClick={() => {
                setMsInput(ex.ms);
                setSInput(ex.s);
              }}
            >
              {prettyNumber(ex.ms)} ms ↔ {prettyNumber(ex.s)} s
            </TabBtn>
          ))}
        </div>
      </SettingsPanel>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MillisecondsConverterPage({}: Route.ComponentProps) {
  const url = "https://www.ilovetimers.com/milliseconds-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Milliseconds Converter",
        url,
        description:
          "Convert milliseconds to seconds and seconds to milliseconds instantly.",
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
            name: "Milliseconds Converter",
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
        display={<MillisecondsConverterCard />}
        title="Milliseconds Converter"
        description="Convert milliseconds to seconds and seconds to milliseconds with exact decimal handling and copy-ready results."
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

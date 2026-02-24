// app/routes/milliseconds-converter.tsx
import type { Route } from "./+types/milliseconds-converter";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

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
   UI PRIMITIVES (match newer styling)
========================================================= */
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={[
      "relative h-full rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm",
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

const TabBtn = ({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold transition",
      active
        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
  </button>
);

const MiniPill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
    {children}
  </span>
);

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

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-sky-700">
            Milliseconds Converter
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Instant conversions for <strong>ms to seconds</strong> and{" "}
            <strong>seconds to ms</strong>.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "ms2s"} onClick={() => setTab("ms2s")}>
          ms → seconds
        </TabBtn>
        <TabBtn active={tab === "s2ms"} onClick={() => setTab("s2ms")}>
          seconds → ms
        </TabBtn>

        {lastCopied ? <MiniPill>{lastCopied}</MiniPill> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {tab === "ms2s" ? (
          <label className="block">
            <div className="text-sm font-extrabold text-slate-900">
              Milliseconds (ms)
            </div>
            <input
              value={msInput}
              onChange={(e) => setMsInput(e.target.value)}
              inputMode="decimal"
              placeholder="1000"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
        ) : (
          <label className="block">
            <div className="text-sm font-extrabold text-slate-900">
              Seconds (s)
            </div>
            <input
              value={sInput}
              onChange={(e) => setSInput(e.target.value)}
              inputMode="decimal"
              placeholder="1"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
          </label>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            {primaryLabel}
          </div>

          <div className="mt-2 font-mono text-4xl font-extrabold text-slate-900 sm:text-5xl">
            {primaryValue || "—"}
          </div>

          <div className="mt-2 text-sm font-semibold text-slate-700">
            {tab === "ms2s" ? (
              <>{msNorm == null ? "Enter a valid milliseconds value." : null}</>
            ) : (
              <>{sNorm == null ? "Enter a valid seconds value." : null}</>
            )}
          </div>

          {copyText ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {copyText}
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick examples */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              Quick examples
            </div>
            <div className="text-xs text-slate-600">
              Click to populate the converter.
            </div>
          </div>
          <div className="text-xs text-slate-600">Common: 1000 ms = 1 second</div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={`${ex.ms}-${ex.s}`}
              type="button"
              onClick={() => {
                setMsInput(ex.ms);
                setSInput(ex.s);
              }}
              className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {prettyNumber(ex.ms)} ms ↔ {prettyNumber(ex.s)} s
            </button>
          ))}
        </div>
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
    <main className="bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
        <div>
          <MillisecondsConverterCard />
        </div>

        {/* Breadcrumb (bottom on purpose) */}
        <p className="text-sm text-slate-600">
          <Link to="/" className="font-medium text-slate-700 hover:underline">
            Home
          </Link>{" "}
          / <span className="text-slate-900">Milliseconds Converter</span>
        </p>
      </section>
    </main>
  );
}

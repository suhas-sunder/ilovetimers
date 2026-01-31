// app/routes/military-time-converter.tsx
import type { Route } from "./+types/military-time-converter";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Military Time Converter (24-Hour to AM/PM)";
  const description =
    "Convert military time to standard AM/PM in seconds. Paste 1730, 0730, or 0000 and get the exact time instantly. Simple, fast, and accurate.";

  const url = "https://ilovetimers.com/military-time-converter";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: "https://ilovetimers.com/og-image.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { rel: "canonical", href: url },
    { name: "theme-color", content: "#ffedd5" },
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
  return `${pad2(h24)}${pad2(m)}`;
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

  // Accept formats like: 1730, 0730, 530, 5:30, 17:30, 0000, 2400
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
      // Treat as hour only, minutes 00
      h = Number(d);
      m = 0;
    } else if (d.length === 3) {
      // 530 -> 5:30
      h = Number(d.slice(0, 1));
      m = Number(d.slice(1));
    } else {
      // take last 2 as minutes, rest as hours (handles 4+ digits, but we validate)
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

  // Special case: 2400 is sometimes used for midnight.
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
  normalized: string; // e.g., "5:30 PM"
  military: string; // e.g., "1730"
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
   UI PRIMITIVES
========================================================= */
const Card = ({
  children,
  className = "",
  onKeyDown,
  tabIndex,
}: {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  tabIndex?: number;
}) => (
  <div
    tabIndex={tabIndex ?? 0}
    onKeyDown={onKeyDown}
    className={`rounded-2xl h-full border border-amber-400 bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-medium text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

const ChipBtn = ({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold transition ${
      active
        ? "bg-amber-700 text-white hover:bg-amber-800"
        : "bg-amber-500/30 text-amber-950 hover:bg-amber-400"
    }`}
  >
    {children}
  </button>
);

/* =========================================================
   TOOL CARD
========================================================= */
function MilitaryTimeConverterCard() {
  const [militaryInput, setMilitaryInput] = useState("1730");
  const [standardInput, setStandardInput] = useState("5:30 PM");

  const [lastCopied, setLastCopied] = useState<string | null>(null);

  const mil = useMemo(() => parseMilitary(militaryInput), [militaryInput]);
  const std = useMemo(() => parseStandard(standardInput), [standardInput]);

  const copy = useCallback(async (label: string, text: string) => {
    const ok = await copyToClipboard(text);
    setLastCopied(ok ? label : "Copy failed");
    window.setTimeout(() => setLastCopied(null), 900);
  }, []);

  const fillNow = useCallback(() => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    const milText = formatMilitary(h, m);
    const stdText = formatStandard(h, m);
    setMilitaryInput(milText);
    setStandardInput(stdText);
  }, []);

  const quick = useMemo(
    () => ["0000", "0030", "0600", "1200", "1730", "2359", "2400"],
    [],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      setMilitaryInput("");
      setStandardInput("");
      return;
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Military Time Converter
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Paste a number like <strong>1730</strong> and get the{" "}
            <strong>AM/PM</strong> result instantly. Also includes reverse
            conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Btn kind="ghost" onClick={fillNow} className="py-2">
            Use current time
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => {
              setMilitaryInput("");
              setStandardInput("");
            }}
            className="py-2"
          >
            Clear
          </Btn>
        </div>
      </div>

      {/* Quick examples */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="mr-1 text-sm font-semibold text-amber-950">
          Examples:
        </div>
        {quick.map((q) => (
          <ChipBtn
            key={q}
            onClick={() => {
              setMilitaryInput(q);
              const parsed = parseMilitary(q);
              if (parsed.valid) setStandardInput(parsed.standard);
            }}
            active={cleanDigits(militaryInput) === q}
          >
            {q}
          </ChipBtn>
        ))}
      </div>

      {/* Two-way converter */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Military -> Standard */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-amber-950">
                Military (24-hour)
              </div>
              <div className="mt-1 text-xs text-amber-900">
                Try 1730, 0730, 5:30, 17:30, 0000
              </div>
            </div>
            <Btn
              kind="ghost"
              onClick={() => {
                if (mil.valid) copy("Standard", mil.standard);
              }}
              disabled={!mil.valid}
            >
              Copy result
            </Btn>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">Military time input</span>
            <input
              inputMode="numeric"
              value={militaryInput}
              onChange={(e) => setMilitaryInput(e.target.value)}
              placeholder="1730"
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>

          <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Standard time (AM/PM)
            </div>

            {mil.valid ? (
              <div className="mt-1 flex flex-col gap-1">
                <div className="text-3xl font-extrabold text-amber-950">
                  {mil.standard}
                </div>
                <div className="text-sm text-slate-700">
                  Normalized military:{" "}
                  <span className="font-semibold">{mil.normalized}</span>
                </div>
                {mil.note ? (
                  <div className="mt-1 text-sm text-amber-900">{mil.note}</div>
                ) : null}
              </div>
            ) : (
              <div className="mt-1 text-sm font-semibold text-amber-900">
                {mil.error}
              </div>
            )}
          </div>
        </div>

        {/* Standard -> Military */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-amber-950">
                Standard (AM/PM)
              </div>
              <div className="mt-1 text-xs text-amber-900">
                Try 5:30 PM, 12 AM, 9 PM
              </div>
            </div>
            <Btn
              kind="ghost"
              onClick={() => {
                if (std.valid) copy("Military", std.military);
              }}
              disabled={!std.valid}
            >
              Copy result
            </Btn>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">Standard time input</span>
            <input
              value={standardInput}
              onChange={(e) => setStandardInput(e.target.value)}
              placeholder="5:30 PM"
              className="w-full rounded-lg border-2 border-amber-300 bg-white px-3 py-2 text-lg font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </label>

          <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
              Military time (24-hour)
            </div>

            {std.valid ? (
              <div className="mt-1 flex flex-col gap-1">
                <div className="text-3xl font-extrabold text-amber-950">
                  {std.military}
                </div>
                <div className="text-sm text-slate-700">
                  Normalized standard:{" "}
                  <span className="font-semibold">{std.normalized}</span>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm font-semibold text-amber-900">
                {std.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy toast */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: N current time · C copy AM/PM result · M copy military
          result · R clear
        </div>
        <div className="text-xs text-slate-600">
          {lastCopied ? (
            <span className="rounded-lg border border-amber-200 bg-white px-2 py-1 font-semibold text-amber-950">
              {lastCopied}
            </span>
          ) : (
            <span>Tip: click the card once so shortcuts work.</span>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function MilitaryTimeConverterPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/military-time-converter";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Military Time Converter",
        url,
        description:
          "Convert military time (24-hour time) to standard time (AM/PM) instantly, plus reverse conversion.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ilovetimers.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Military Time Converter",
            item: url,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is military time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Military time is 24-hour time written without AM or PM. Example: 1730 means 17:30, which is 5:30 PM.",
            },
          },
          {
            "@type": "Question",
            name: "What does 0000 mean in military time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "0000 means midnight, which is 12:00 AM in standard time.",
            },
          },
          {
            "@type": "Question",
            name: "Is 2400 a valid military time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You may see 2400 used to mean midnight at the end of a day. This converter treats 2400 as 00:00.",
            },
          },
          {
            "@type": "Question",
            name: "How do I convert military time to AM/PM quickly?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "If the hour is 13 to 23, subtract 12 and use PM. If the hour is 00, it is 12 AM. If the hour is 12, it is 12 PM.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Military Time Converter</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Military Time Converter (24-Hour to AM/PM)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            Convert a number like <strong>1730</strong> to{" "}
            <strong>5:30 PM</strong> instantly. Also converts AM/PM back to
            military time.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <MilitaryTimeConverterCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Convert 24-hour time fast (with normalization)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This page is built for the most common intent: you already have a{" "}
              <strong>military time number</strong> (like 1730) and you want the
              answer immediately. Paste it in, and the result updates instantly.
            </p>

            <p>
              It also accepts common variations like <strong>17:30</strong>,{" "}
              <strong>5:30</strong>, and <strong>0730</strong>. If your input is
              valid, it shows a normalized military value (four digits) so you
              can copy something clean.
            </p>

            <p>
              Want to keep time on screen instead? Try{" "}
              <Link
                to="/retro-flip-clock"
                className="font-semibold hover:underline"
              >
                Retro Flip Clock
              </Link>{" "}
              or use a{" "}
              <Link to="/countdown" className="font-semibold hover:underline">
                Countdown
              </Link>{" "}
              if your goal is timing an activity.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Military Time Converter FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is 1730 in standard time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              1730 is 17:30 in 24-hour time, which is <strong>5:30 PM</strong>{" "}
              in standard time.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is 0000 in standard time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              0000 is midnight, which is <strong>12:00 AM</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is 1200 in standard time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              1200 is noon, which is <strong>12:00 PM</strong>.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is 2400 valid?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              You may see 2400 used to mean midnight at the end of a day. This
              converter treats 2400 as 00:00.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this accept colons?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. You can enter 17:30 or 5:30, and it will normalize to 1730 or
              0530 internally.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

// app/routes/binary-clock.tsx
import type { Route } from "./+types/binary-clock";
import { json } from "@remix-run/node";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Binary Clock Online | View the Current Time in Binary";
  const description =
    "Free binary clock that displays the current time in binary. Switch between BCD and pure binary, toggle seconds and 12 or 24 hour time, and use a clean fullscreen display.";
  const url = "https://ilovetimers.com/binary-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "binary clock",
        "binary clock online",
        "time in binary",
        "binary time clock",
        "bcd clock",
        "binary clock fullscreen",
      ].join(", "),
    },
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
  return json({ nowISO: new Date().toISOString() });
}

/* =========================================================
   UTILS
========================================================= */
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

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function to12h(h24: number) {
  const h = h24 % 12 || 12;
  const ampm = h24 >= 12 ? "PM" : "AM";
  return { h, ampm };
}

function formatTimeString(
  d: Date,
  opts: { use24: boolean; showSeconds: boolean },
) {
  const hh24 = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  if (opts.use24) {
    return opts.showSeconds
      ? `${pad2(hh24)}:${pad2(mm)}:${pad2(ss)}`
      : `${pad2(hh24)}:${pad2(mm)}`;
  }

  const { h, ampm } = to12h(hh24);
  return opts.showSeconds
    ? `${pad2(h)}:${pad2(mm)}:${pad2(ss)} ${ampm}`
    : `${pad2(h)}:${pad2(mm)} ${ampm}`;
}

function formatDateLine(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
      .format(d)
      .replace(/\u200e/g, "")
      .trim();
  } catch {
    return d.toDateString();
  }
}

function bitsOf(n: number, width: number) {
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i--) out.push((n >> i) & 1);
  return out;
}

function bcdBitsOfDigit(digit: number) {
  // 4-bit BCD
  return bitsOf(digit, 4);
}

/* =========================================================
   UI PRIMITIVES (same style as Home/Pomodoro)
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

/* =========================================================
   BINARY CLOCK CARD
========================================================= */
type BinaryMode = "bcd" | "pure";

function BinaryClockCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [use24, setUse24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [mode, setMode] = useState<BinaryMode>("bcd");
  const [copied, setCopied] = useState(false);

  const tz = useMemo(() => safeTimeZone(), []);
  const displayWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ms = showSeconds ? 1000 : 15000;
    const t = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(t);
  }, [showSeconds]);

  const timeText = useMemo(
    () => formatTimeString(now, { use24, showSeconds }),
    [now, use24, showSeconds],
  );
  const dateText = useMemo(() => formatDateLine(now), [now]);

  const binaryText = useMemo(() => {
    const h24 = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    let hDisp = h24;
    let suffix = "";
    if (!use24) {
      const { h, ampm } = to12h(h24);
      hDisp = h;
      suffix = ` ${ampm}`;
    }

    if (mode === "pure") {
      const hb = bitsOf(hDisp, use24 ? 5 : 4).join("");
      const mb = bitsOf(m, 6).join("");
      const sb = bitsOf(s, 6).join("");
      return showSeconds
        ? `H:${hb} M:${mb} S:${sb}${suffix}`
        : `H:${hb} M:${mb}${suffix}`;
    }

    // BCD: per digit bits
    const hh = pad2(hDisp);
    const mm = pad2(m);
    const ss = pad2(s);

    const parts = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    // Example "12:34:56 -> 0001 0010 : 0011 0100 : 0101 0110"
    const digitsOnly = parts.replace(/[^0-9]/g, "");
    const groups: string[] = [];
    for (const ch of digitsOnly)
      groups.push(bcdBitsOfDigit(Number(ch)).join(""));
    if (!showSeconds) {
      return `${parts}${suffix} -> ${groups.slice(0, 4).join(" ")}`;
    }
    return `${parts}${suffix} -> ${groups.join(" ")}`;
  }, [now, use24, showSeconds, mode]);

  const copyText = useMemo(() => {
    const iso = now.toISOString();
    return `${timeText} (${tz})\n${dateText}\n${binaryText}\nISO: ${iso}`;
  }, [timeText, tz, dateText, binaryText, now]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [copyText]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();
    if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "c") {
      copy();
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "b") {
      setMode((m) => (m === "bcd" ? "pure" : "bcd"));
    } else if (e.key === "2") {
      setUse24(true);
    } else if (e.key === "1") {
      setUse24(false);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Binary Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Shows the current time in binary. Use BCD digit mode or pure binary
            mode, with fullscreen and copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24}
              onChange={(e) => setUse24(e.target.checked)}
            />
            24-hour
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as BinaryMode)}
              className="rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-950"
            >
              <option value="bcd">BCD (digits)</option>
              <option value="pure">Pure binary</option>
            </select>
            Mode
          </label>

          <Btn kind="ghost" onClick={copy} className="py-2">
            {copied ? "Copied" : "Copy"}
          </Btn>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 420 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:flex;}

              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                background:#0b0b0c;
                color:#ffffff;
              }

              [data-fs-container]:fullscreen [data-shell="normal"]{display:none;}
              [data-fs-container]:fullscreen [data-shell="fullscreen"]{
                display:flex;
                width:100%;
                height:100%;
                align-items:center;
                justify-content:center;
                padding:4vh 4vw;
              }

              [data-fs-container]:fullscreen .fs-inner{
                width:min(1400px, 100%);
                height:100%;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 800 20px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.12em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(48px, 7vw, 84px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.10em;
                text-align:center;
                white-space:nowrap;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 16px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full items-center justify-center p-6"
          style={{ minHeight: 420 }}
        >
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 text-center">
              Local time · {tz} ·{" "}
              {mode === "bcd" ? "BCD digits" : "Pure binary"}
            </div>

            <div className="font-mono text-4xl font-extrabold tracking-widest sm:text-5xl md:text-6xl text-center whitespace-nowrap">
              {timeText}
            </div>

            <div className="w-full max-w-[780px]">
              <BinaryGrid
                now={now}
                use24={use24}
                showSeconds={showSeconds}
                mode={mode}
                dark={false}
              />
            </div>

            <div className="text-sm font-semibold text-amber-900 text-center">
              {dateText}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4 text-xs text-amber-900 w-full max-w-[780px]">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Copy preview
              </div>
              <div className="mt-2 font-mono whitespace-pre-wrap">
                {binaryText}
              </div>
            </div>

            <div className="text-xs font-semibold text-amber-800 text-center">
              Shortcuts: F fullscreen · C copy · S seconds · B mode · 1 (12h) ·
              2 (24h)
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Binary Clock</div>
            <div className="fs-time">{timeText}</div>
            <div className="fs-sub">
              {tz} · {mode === "bcd" ? "BCD digits" : "Pure binary"}
            </div>

            <div className="w-full" style={{ maxWidth: 980 }}>
              <BinaryGrid
                now={now}
                use24={use24}
                showSeconds={showSeconds}
                mode={mode}
                dark
              />
            </div>

            <div className="fs-help">
              F fullscreen · C copy · S seconds · B mode · 1 (12h) · 2 (24h)
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
          Shortcuts: F fullscreen · C copy · S seconds · B mode · 1 (12h) · 2
          (24h)
        </div>
        <div className="text-xs text-slate-600">
          Tip: click the card once so keyboard shortcuts work immediately.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   BINARY GRID
========================================================= */
function BinaryGrid({
  now,
  use24,
  showSeconds,
  mode,
  dark,
}: {
  now: Date;
  use24: boolean;
  showSeconds: boolean;
  mode: BinaryMode;
  dark: boolean;
}) {
  const h24 = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  let hDisp = h24;
  if (!use24) hDisp = to12h(h24).h;

  const palette = useMemo(() => {
    return {
      bg: dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.75)",
      border: dark ? "rgba(255,255,255,.14)" : "rgba(180,83,9,.30)",
      on: dark ? "rgba(255,255,255,.92)" : "rgba(69,26,3,.92)",
      off: dark ? "rgba(255,255,255,.16)" : "rgba(180,83,9,.20)",
      text: dark ? "rgba(255,255,255,.86)" : "rgba(120,53,15,.88)",
      label: dark ? "rgba(255,255,255,.78)" : "rgba(120,53,15,.75)",
      sep: dark ? "rgba(255,255,255,.35)" : "rgba(120,53,15,.25)",
    };
  }, [dark]);

  if (mode === "pure") {
    const hourBits = bitsOf(hDisp, use24 ? 5 : 4);
    const minBits = bitsOf(m, 6);
    const secBits = bitsOf(s, 6);

    const cols = showSeconds
      ? [
          { key: "H", label: "Hours", bits: hourBits },
          { key: "M", label: "Minutes", bits: minBits },
          { key: "S", label: "Seconds", bits: secBits },
        ]
      : [
          { key: "H", label: "Hours", bits: hourBits },
          { key: "M", label: "Minutes", bits: minBits },
        ];

    // Normalize height for alignment
    const maxH = Math.max(...cols.map((c) => c.bits.length));

    return (
      <div
        className="rounded-2xl border p-4"
        style={{
          background: palette.bg,
          borderColor: palette.border,
        }}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
          }}
        >
          {cols.map((c) => {
            const padded = Array.from({ length: maxH - c.bits.length })
              .map(() => 0)
              .concat(c.bits);
            return (
              <div key={c.key} className="flex flex-col items-center gap-3">
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: palette.label }}
                >
                  {c.label}
                </div>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateRows: `repeat(${maxH}, 1fr)` }}
                >
                  {padded.map((b, i) => (
                    <Bit key={i} on={b === 1} palette={palette} />
                  ))}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: palette.text }}
                >
                  {c.bits.join("")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // BCD mode
  const hh = pad2(hDisp);
  const mm = pad2(m);
  const ss = pad2(s);

  const parts = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  const digitChars = parts.split("");

  // For layout: digits columns with a 4-row bit grid
  // We render ":" as a separator column.
  const digits = digitChars.filter((ch) => ch !== ":").map((ch) => Number(ch));

  // Map digits into groups to label HH MM SS
  const groupLabels = showSeconds ? ["HH", "MM", "SS"] : ["HH", "MM"];

  const digitGroups = useMemo(() => {
    const out: Array<{ label: string; digits: number[] }> = [];
    if (showSeconds) {
      out.push({ label: "Hours", digits: [digits[0], digits[1]] });
      out.push({ label: "Minutes", digits: [digits[2], digits[3]] });
      out.push({ label: "Seconds", digits: [digits[4], digits[5]] });
      return out;
    }
    out.push({ label: "Hours", digits: [digits[0], digits[1]] });
    out.push({ label: "Minutes", digits: [digits[2], digits[3]] });
    return out;
  }, [digits, showSeconds]);

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: palette.bg,
        borderColor: palette.border,
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {groupLabels.map((g) => (
            <span
              key={g}
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{
                background: dark
                  ? "rgba(255,255,255,.08)"
                  : "rgba(245,158,11,.20)",
                color: palette.label,
              }}
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-stretch justify-center gap-4">
          {digitGroups.map((grp, gi) => (
            <div key={grp.label} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: palette.label }}
                >
                  {grp.label}
                </div>

                <div className="flex items-end gap-3">
                  {grp.digits.map((d, di) => {
                    const bits = bcdBitsOfDigit(d); // msb..lsb
                    return (
                      <div
                        key={`${gi}-${di}`}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="grid gap-2"
                          style={{ gridTemplateRows: "repeat(4, 1fr)" }}
                        >
                          {bits.map((b, bi) => (
                            <Bit key={bi} on={b === 1} palette={palette} />
                          ))}
                        </div>
                        <div
                          className="font-mono text-sm font-extrabold"
                          style={{ color: palette.text }}
                        >
                          {d}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="text-[11px] font-semibold"
                  style={{ color: palette.text }}
                >
                  {grp.digits.map((d) => bcdBitsOfDigit(d).join("")).join(" ")}
                </div>
              </div>

              {/* Separator between groups */}
              {gi < digitGroups.length - 1 ? (
                <div className="flex items-center justify-center px-1">
                  <div className="flex flex-col items-center gap-2" aria-hidden>
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: palette.sep }}
                    />
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: palette.sep }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div
          className="text-center text-xs font-semibold"
          style={{ color: palette.text }}
        >
          BCD means each decimal digit is shown as 4 binary bits.
        </div>
      </div>
    </div>
  );
}

function Bit({
  on,
  palette,
}: {
  on: boolean;
  palette: { on: string; off: string; border: string };
}) {
  return (
    <div
      className="grid place-items-center rounded-xl border"
      style={{
        width: 22,
        height: 22,
        background: on ? palette.on : palette.off,
        borderColor: palette.border,
      }}
      aria-label={on ? "1" : "0"}
      title={on ? "1" : "0"}
    >
      <span
        className="font-mono text-xs font-black"
        style={{
          // Key fix: force high contrast on the dark "on" dot
          color: on ? "rgba(255,255,255,.95)" : "rgba(69,26,3,.55)",
          userSelect: "none",
        }}
      >
        {on ? "1" : "0"}
      </span>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function BinaryClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/binary-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Binary Clock",
        url,
        description:
          "Binary clock showing current local time in binary with BCD and pure binary modes, optional seconds, 12/24-hour toggle, copy, and fullscreen.",
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
          { "@type": "ListItem", position: 2, name: "Binary Clock", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a binary clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A binary clock shows the current time using binary digits (0 and 1) instead of regular numbers. Many binary clocks use BCD, where each decimal digit is shown as a 4-bit binary value.",
            },
          },
          {
            "@type": "Question",
            name: "What is BCD mode?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BCD stands for binary coded decimal. Each decimal digit (0 to 9) is represented by 4 binary bits. This makes the clock easier to read because each digit maps directly to the normal time digits.",
            },
          },
          {
            "@type": "Question",
            name: "Can I switch to pure binary time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Switch the mode to Pure binary to show hours, minutes, and seconds as binary numbers rather than per-digit BCD.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the card is focused to show a clean dark fullscreen display.",
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
            / <span className="text-amber-950">Binary Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Binary Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A <strong>binary clock</strong> that shows the current time in
            binary. Includes BCD digits, pure binary, and fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div>
          <BinaryClockCard />
        </div>

        {/* Quick-use hints */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              BCD is easiest to learn
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              BCD mode shows each time digit as 4 bits, so it maps directly to
              normal time like 12:34.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Pure binary is the classic flex
            </h2>
            <p className="mt-2 leading-relaxed text-amber-800">
              Pure mode shows hours, minutes, and seconds as binary numbers.
              Great for puzzles and practice.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950">
              Keyboard shortcuts
            </h2>
            <ul className="mt-2 space-y-1 text-amber-800">
              <li>
                <strong>F</strong> = Fullscreen
              </li>
              <li>
                <strong>C</strong> = Copy
              </li>
              <li>
                <strong>S</strong> = Seconds toggle
              </li>
              <li>
                <strong>B</strong> = Mode toggle
              </li>
              <li>
                <strong>1</strong> = 12-hour
              </li>
              <li>
                <strong>2</strong> = 24-hour
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free binary clock (time in binary)
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>binary clock</strong> shows your current local time
              in binary. If you are learning, start with <strong>BCD</strong>{" "}
              because each decimal digit is displayed as a 4-bit binary value.
              If you prefer the classic style, switch to{" "}
              <strong>Pure binary</strong>.
            </p>

            <p>
              Want a normal time display? Try{" "}
              <Link
                to="/digital-clock"
                className="font-semibold hover:underline"
              >
                Digital Clock
              </Link>
              . Prefer a clock face? Try{" "}
              <Link
                to="/analog-clock"
                className="font-semibold hover:underline"
              >
                Analog Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">Binary Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Does this show my local time?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. It uses your device’s local time and time zone settings.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is the difference between BCD and pure binary?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              BCD shows each decimal digit as 4 bits, so it matches normal time
              digits. Pure binary shows the whole hour, minute, and second as
              binary numbers.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I hide seconds?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle Seconds off, or press <strong>S</strong> while
              focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the card is focused.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

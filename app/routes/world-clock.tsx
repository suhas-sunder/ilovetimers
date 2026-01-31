// app/routes/world-clock.tsx
import type { Route } from "./+types/world-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "World Clock (Current Time in Cities)";
  const description =
    "See the current time in cities around the world. A clean, live world clock that shows local times at a glance with a clear, readable display.";

  const url = "https://ilovetimers.com/world-clock";

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

function formatInZone(
  date: Date,
  timeZone: string,
  opts: { use24h: boolean; showSeconds: boolean },
) {
  const fmt = new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: opts.showSeconds ? "2-digit" : undefined,
    hour12: !opts.use24h,
  });

  // Most locales return something like "08:03:02 PM" or "20:03:02".
  // We keep it as-is for user locale friendliness.
  return fmt.format(date);
}

function safeZoneLabel(zone: string) {
  // "America/New_York" -> "New York"
  const last = zone.split("/").pop() ?? zone;
  return last.replace(/_/g, " ");
}

/* =========================================================
   DATA
========================================================= */
type City = {
  id: string;
  name: string;
  timeZone: string;
  note?: string;
};

const POPULAR: City[] = [
  { id: "toronto", name: "Toronto", timeZone: "America/Toronto" },
  { id: "newyork", name: "New York", timeZone: "America/New_York" },
  { id: "losangeles", name: "Los Angeles", timeZone: "America/Los_Angeles" },
  { id: "london", name: "London", timeZone: "Europe/London" },
  { id: "paris", name: "Paris", timeZone: "Europe/Paris" },
  { id: "berlin", name: "Berlin", timeZone: "Europe/Berlin" },
  { id: "dubai", name: "Dubai", timeZone: "Asia/Dubai" },
  { id: "mumbai", name: "Mumbai", timeZone: "Asia/Kolkata", note: "India" },
  { id: "singapore", name: "Singapore", timeZone: "Asia/Singapore" },
  { id: "tokyo", name: "Tokyo", timeZone: "Asia/Tokyo" },
  { id: "sydney", name: "Sydney", timeZone: "Australia/Sydney" },
  { id: "auckland", name: "Auckland", timeZone: "Pacific/Auckland" },
];

const DEFAULT_SELECTED_IDS = [
  "toronto",
  "newyork",
  "losangeles",
  "london",
  "tokyo",
];

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

function Chip({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        active
          ? "rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-950 hover:bg-amber-200"
          : "rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-semibold text-amber-900 hover:bg-amber-50"
      }
    >
      {children}
    </button>
  );
}

/* =========================================================
   WORLD CLOCK CARD
========================================================= */
function WorldClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [use24h, setUse24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // Keep it simple: no localStorage so SSR stays clean and predictable.
    return DEFAULT_SELECTED_IDS;
  });

  const displayWrapRef = useRef<HTMLDivElement>(null);

  // Tick on the second boundary for stable updates.
  useEffect(() => {
    let t: number | null = null;

    const sync = () => {
      const n = new Date();
      setNow(n);
      const msToNext = 1000 - n.getMilliseconds();
      t = window.setTimeout(sync, msToNext);
    };

    sync();
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, []);

  const selectedCities = useMemo(() => {
    const set = new Set(selectedIds);
    return POPULAR.filter((c) => set.has(c.id));
  }, [selectedIds]);

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR;
    return POPULAR.filter((c) => {
      const hay = `${c.name} ${c.timeZone} ${c.note ?? ""}`.toLowerCase();
      return (
        hay.includes(q) || safeZoneLabel(c.timeZone).toLowerCase().includes(q)
      );
    });
  }, [query]);

  const rows = useMemo(() => {
    const opts = { use24h, showSeconds };
    return selectedCities.map((c) => ({
      ...c,
      timeText: formatInZone(now, c.timeZone, opts),
    }));
  }, [selectedCities, now, use24h, showSeconds]);

  async function copy() {
    try {
      const payload = rows
        .map((r) => `${r.name}: ${r.timeText} (${r.timeZone})`)
        .join("\n");
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const toggleCity = (id: string) => {
    setSelectedIds((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearAll = () => setSelectedIds([]);
  const resetDefault = () => setSelectedIds(DEFAULT_SELECTED_IDS);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    const k = e.key.toLowerCase();

    if (k === "f" && displayWrapRef.current) {
      toggleFullscreen(displayWrapRef.current);
    } else if (k === "t") {
      setUse24h((v) => !v);
    } else if (k === "s") {
      setShowSeconds((v) => !v);
    } else if (k === "c") {
      copy();
    } else if (k === "r") {
      resetDefault();
    } else if (k === "x") {
      clearAll();
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">World Clock</h2>
          <p className="mt-1 text-base text-slate-700">
            Live time in multiple cities. Add, remove, copy, and go fullscreen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={use24h}
              onChange={(e) => setUse24h(e.target.checked)}
            />
            24-hour
          </label>

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
            />
            Seconds
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              displayWrapRef.current && toggleFullscreen(displayWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>

          <Btn kind="ghost" onClick={copy} className="py-2">
            {copied ? "Copied" : "Copy"}
          </Btn>
        </div>
      </div>

      {/* Display */}
      <div
        ref={displayWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 340 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container] [data-shell="fullscreen"]{display:none;}
              [data-fs-container] [data-shell="normal"]{display:block;}

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
                width:min(1600px, 100%);
                display:flex;
                flex-direction:column;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.9;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-grid{
                display:grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap:14px;
              }

              [data-fs-container]:fullscreen .fs-card{
                border-radius:18px;
                border:1px solid rgba(255,255,255,.15);
                background:rgba(255,255,255,.06);
                padding:18px;
              }

              [data-fs-container]:fullscreen .fs-city{
                font: 900 20px/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.02em;
              }

              [data-fs-container]:fullscreen .fs-zone{
                font: 700 12px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.75;
                margin-top:6px;
              }

              [data-fs-container]:fullscreen .fs-time{
                font: 900 clamp(36px, 5vw, 64px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                margin-top:14px;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 13px/1.25 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.85;
                text-align:center;
                margin-top:8px;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="w-full p-6"
          style={{ minHeight: 340 }}
        >
          {/* Selector */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                Cities and time zones
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Click a city to toggle it. Shortcuts: F fullscreen · T 24-hour ·
                S seconds · C copy · R reset · X clear
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Btn kind="ghost" onClick={resetDefault} className="py-2">
                Reset
              </Btn>
              <Btn kind="ghost" onClick={clearAll} className="py-2">
                Clear
              </Btn>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label className="block text-sm font-bold text-amber-950">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type: London, Tokyo, America, Europe..."
                className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-3">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Your local time
              </div>
              <div className="mt-2 font-mono text-2xl font-extrabold tracking-widest text-amber-950">
                {new Intl.DateTimeFormat(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: showSeconds ? "2-digit" : undefined,
                  hour12: !use24h,
                }).format(now)}
              </div>
            </div>
          </div>

          {/* Popular list */}
          <div className="mt-5">
            <div className="text-sm font-extrabold text-amber-950">Popular</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {filteredPopular.map((c) => (
                <Chip
                  key={c.id}
                  active={selectedIds.includes(c.id)}
                  onClick={() => toggleCity(c.id)}
                  title={`${c.timeZone}${c.note ? ` (${c.note})` : ""}`}
                >
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Clock grid */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-white p-5 text-amber-900">
                <div className="text-lg font-extrabold">No cities selected</div>
                <p className="mt-2 text-sm text-amber-800">
                  Pick a few cities above to start the world clock.
                </p>
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-extrabold text-amber-950">
                        {r.name}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-600">
                        {r.timeZone}
                        {r.note ? ` · ${r.note}` : ""}
                      </div>
                    </div>
                    <Btn
                      kind="ghost"
                      onClick={() => toggleCity(r.id)}
                      className="py-2"
                    >
                      Remove
                    </Btn>
                  </div>

                  <div className="mt-4 font-mono text-4xl font-extrabold tracking-widest text-amber-950">
                    {r.timeText}
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Zone label: {safeZoneLabel(r.timeZone)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">World Clock</div>

            <div className="fs-grid">
              {(rows.length
                ? rows
                : selectedCities.map((c) => ({
                    ...c,
                    timeText: formatInZone(now, c.timeZone, {
                      use24h,
                      showSeconds,
                    }),
                  }))
              ).map((r) => (
                <div key={`fs-${r.id}`} className="fs-card">
                  <div className="fs-city">{r.name}</div>
                  <div className="fs-zone">
                    {r.timeZone}
                    {r.note ? ` · ${r.note}` : ""}
                  </div>
                  <div className="fs-time">{r.timeText}</div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="fs-card">
                  <div className="fs-city">No cities selected</div>
                  <div className="fs-zone">Exit fullscreen and pick cities</div>
                  <div className="fs-time">--:--</div>
                </div>
              )}
            </div>

            <div className="fs-help">
              F fullscreen · T 24-hour · S seconds · C copy · R reset · X clear
            </div>
          </div>
        </div>
      </div>

      {/* Learning hints */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">
            What is a world clock?
          </h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            A world clock shows the current time in multiple time zones at once,
            so you can coordinate calls, travel, and remote teams.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Fullscreen</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Use fullscreen for a big, readable grid. Great on a second monitor
            or a wall display.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-amber-950">Copy list</h3>
          <p className="mt-2 leading-relaxed text-amber-800">
            Copy exports a clean list of selected cities with their current
            times, perfect for sharing in chat or notes.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function WorldClockPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/world-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "World Clock",
        url,
        description:
          "Live world clock showing current time across multiple cities and time zones. Add cities, search, 12/24-hour toggle, seconds toggle, copy output, and fullscreen display.",
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
          { "@type": "ListItem", position: 2, name: "World Clock", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does the world clock update live?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It updates every second (or every minute if you hide seconds) based on your device time.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use 12-hour or 24-hour time?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Use the 24-hour toggle to switch formats anytime.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Fullscreen shows a big readable grid designed for monitors, TVs, and projectors.",
            },
          },
          {
            "@type": "Question",
            name: "How do I copy the list of times?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Copy to copy a line-per-city list including city name, current time, and time zone identifier.",
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
            / <span className="text-amber-950">World Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            World Clock (Live Time Zones)
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>world clock</strong> showing the current time in
            cities around the world. Search, add cities, toggle 12/24-hour time,
            hide seconds, and go fullscreen.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <WorldClockCard />
      </section>

      {/* SEO Section */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Free world clock: current time in multiple cities
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              This <strong>world clock</strong> shows live time across popular{" "}
              <strong>time zones</strong>. It is built for quick scheduling,
              remote work, travel planning, and classroom demos.
            </p>
            <p>
              Use the <strong>search</strong> to find cities fast. Toggle{" "}
              <strong>seconds</strong> to reduce visual noise, switch{" "}
              <strong>12-hour or 24-hour</strong> time, and use{" "}
              <strong>fullscreen</strong> for a clean wall display.
            </p>
            <p>
              Want tools beyond clocks? Try{" "}
              <Link
                to="/countdown-timer"
                className="font-semibold hover:underline"
              >
                Countdown Timer
              </Link>{" "}
              or{" "}
              <Link to="/stopwatch" className="font-semibold hover:underline">
                Stopwatch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="text-2xl font-bold">World Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What is a world clock?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              A world clock shows the current time in multiple time zones at
              once so you can compare times across cities.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this world clock accurate?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              It uses your device time plus official time zone rules. If your
              device clock is correct, the city times will be correct.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I show fewer updates?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Turn off seconds to make it feel calmer and easier to scan.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              What are the keyboard shortcuts?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              <strong>F</strong> fullscreen · <strong>T</strong> 24-hour ·{" "}
              <strong>S</strong> seconds · <strong>C</strong> copy ·{" "}
              <strong>R</strong> reset · <strong>X</strong> clear (when
              focused).
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

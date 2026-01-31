// app/routes/swatch-internet-time-clock.tsx
import type { Route } from "./+types/swatch-internet-time-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Swatch Internet Time (.beat) Clock";
  const description =
    "View the current Swatch Internet Time (@beat) live. A clean, timezone-free clock that shows the exact .beat time with a clear, readable display.";

  const url = "https://ilovetimers.com/swatch-internet-time-clock";

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
const pad2 = (n: number) => n.toString().padStart(2, "0");
const pad3 = (n: number) => n.toString().padStart(3, "0");

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

/* =========================================================
   SWATCH INTERNET TIME MATH
========================================================= */
const MS_IN_DAY = 86_400_000;
const BMT_OFFSET_MS = 60 * 60 * 1000; // UTC+1

function getBeatParts(date: Date) {
  const utcMs = date.getTime();
  const bmtMs = utcMs + BMT_OFFSET_MS;

  const dayMs = ((bmtMs % MS_IN_DAY) + MS_IN_DAY) % MS_IN_DAY; // 0..MS_IN_DAY
  const beatFloat = (dayMs / MS_IN_DAY) * 1000; // 0..1000
  const beatClamped = Math.min(Math.max(beatFloat, 0), 999.999999);

  const beatInt = Math.floor(beatClamped); // 0..999
  const beatFrac = beatClamped - beatInt;
  const beatCenti = Math.floor(beatFrac * 100); // 0..99

  const bmtH = Math.floor(dayMs / 3_600_000);
  const bmtM = Math.floor((dayMs % 3_600_000) / 60_000);
  const bmtS = Math.floor((dayMs % 60_000) / 1000);

  return {
    beatInt,
    beatCenti,
    beatFloat: beatClamped,
    dayMs,
    bmtH,
    bmtM,
    bmtS,
  };
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
        ? `cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
        : `cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`
    }
  >
    {children}
  </button>
);

/* =========================================================
   CLOCK CARD
========================================================= */
function SwatchInternetTimeCard() {
  const [now, setNow] = useState(() => new Date());
  const [live, setLive] = useState(true);

  const fsWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setNow(new Date()), 100);
    return () => window.clearInterval(t);
  }, [live]);

  const parts = useMemo(() => getBeatParts(now), [now]);

  const beatStr = useMemo(() => {
    return `@${pad3(parts.beatInt)}.${pad2(parts.beatCenti)}`;
  }, [parts.beatInt, parts.beatCenti]);

  const bmtTimeStr = useMemo(() => {
    return `${pad2(parts.bmtH)}:${pad2(parts.bmtM)}:${pad2(parts.bmtS)}`;
  }, [parts.bmtH, parts.bmtM, parts.bmtS]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      setLive((v) => !v);
    } else if (e.key.toLowerCase() === "f" && fsWrapRef.current) {
      toggleFullscreen(fsWrapRef.current);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Swatch Internet Time
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Live <strong>.beat</strong> time with sub-beat decimals (acts like
            seconds). Based on <strong>Biel Mean Time</strong> (UTC+1).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />
            Live
          </label>

          <Btn kind="ghost" onClick={() => setNow(new Date())} disabled={live}>
            Snap now
          </Btn>

          <Btn
            kind="ghost"
            onClick={() =>
              fsWrapRef.current && toggleFullscreen(fsWrapRef.current)
            }
            className="py-2"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div
        ref={fsWrapRef}
        data-fs-container
        className="mt-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-950"
        style={{ minHeight: 320 }}
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
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                gap:18px;
              }

              [data-fs-container]:fullscreen .fs-label{
                font: 900 18px/1.1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.14em;
                text-transform:uppercase;
                opacity:.92;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-beat{
                font: 900 clamp(88px, 14vw, 220px)/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                letter-spacing:.06em;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-sub{
                font: 800 clamp(14px, 2.2vw, 24px)/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                letter-spacing:.08em;
                text-transform:uppercase;
                opacity:.88;
                text-align:center;
              }

              [data-fs-container]:fullscreen .fs-help{
                font: 700 14px/1.2 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                opacity:.78;
                text-align:center;
              }
            `,
          }}
        />

        {/* Normal shell */}
        <div
          data-shell="normal"
          className="h-full w-full flex-col items-center justify-center p-6"
          style={{ minHeight: 320 }}
        >
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
            Current Internet Time
          </div>

          <div className="mt-4 font-mono text-7xl sm:text-8xl font-extrabold tracking-widest">
            {beatStr}
          </div>

          <div className="mt-3 text-sm font-semibold text-amber-900">
            BMT (UTC+1): <span className="font-mono">{bmtTimeStr}</span>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-white/60 px-3 py-2 text-xs font-semibold text-amber-950 text-center">
            Shortcuts: Space live/freeze · F fullscreen
          </div>

          <div className="mt-6 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Range
              </h3>
              <p className="mt-2 text-sm text-amber-900">@000.00 to @999.99</p>
              <p className="mt-1 text-xs text-slate-600">
                One day split into 1000 beats.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Precision
              </h3>
              <p className="mt-2 text-sm text-amber-900">0.01 beat</p>
              <p className="mt-1 text-xs text-slate-600">
                About 0.864 seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Why
              </h3>
              <p className="mt-2 text-sm text-amber-900">One global time</p>
              <p className="mt-1 text-xs text-slate-600">
                No time zones or DST.
              </p>
            </div>
          </div>
        </div>

        {/* Fullscreen shell */}
        <div data-shell="fullscreen">
          <div className="fs-inner">
            <div className="fs-label">Swatch Internet Time</div>
            <div className="fs-beat">{beatStr}</div>
            <div className="fs-sub">BMT (UTC+1) {bmtTimeStr}</div>
            <div className="fs-help">Space live/freeze · F fullscreen</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function SwatchInternetTimePage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/swatch-internet-time-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Swatch Internet Time (.beat) Clock",
        url,
        description:
          "Live Swatch Internet Time clock showing current @beat with sub-beat decimals, based on Biel Mean Time (UTC+1).",
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
            name: "Swatch Internet Time (.beat) Clock",
            item: url,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: "Swatch Internet Time (.beat) Clock",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <main className="bg-amber-50 text-amber-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Swatch Internet Time</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Swatch Internet Time (.beat) Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A live <strong>.beat</strong> clock showing Internet Time with
            decimals (sub-beat seconds) based on Biel Mean Time (UTC+1).
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <SwatchInternetTimeCard />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            Live Swatch Internet Time (@beats) with decimals
          </h2>

          <div className="mt-3 space-y-3 leading-relaxed text-amber-800">
            <p>
              Swatch Internet Time expresses the time of day as{" "}
              <strong>@beats</strong>: the day is split into{" "}
              <strong>1000</strong> equal units. Unlike normal clocks, Internet
              Time is designed to be timezone-free, so everyone can refer to the
              same beat value.
            </p>

            <p>
              This clock uses <strong>Biel Mean Time (UTC+1)</strong> as the
              fixed reference and shows <strong>two decimals</strong> for
              smoother changes that feel like seconds.
            </p>

            <p>
              Want related tools? Use{" "}
              <Link
                to="/epoch-unix-time-clock"
                className="font-semibold hover:underline"
              >
                Epoch / Unix Time Clock
              </Link>{" "}
              or{" "}
              <Link to="/world-clock" className="font-semibold hover:underline">
                World Clock
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="text-xs text-slate-600">Build: {nowISO}</div>
      </section>
      <SwatchInternetTimeFaqSection />
    </main>
  );
}

/* =========================================================
   FAQ (VISIBLE) + JSON-LD
========================================================= */

const SWATCH_BEAT_FAQ = [
  {
    q: "What is Swatch Internet Time (.beat)?",
    a: "Swatch Internet Time divides the day into 1000 equal parts called beats, displayed as @000 to @999. It’s meant to be a single global time format.",
  },
  {
    q: "What is Biel Mean Time (BMT)?",
    a: "Biel Mean Time is UTC+1, used as the fixed reference for Internet Time. The beat value you see is calculated from this reference, so it stays timezone-free and DST-free for users.",
  },
  {
    q: "How precise is the display?",
    a: "This clock shows two decimals. One beat is 86.4 seconds, so 0.01 beat is about 0.864 seconds.",
  },
  {
    q: "Why does it show @000.00 to @999.99?",
    a: "Because there are 1000 beats in a day. @000 is the start of the BMT day and @999 is the end.",
  },
  {
    q: "What are the keyboard shortcuts?",
    a: "Space toggles live/freeze, and F toggles fullscreen while the card is focused.",
  },
] as const;

function SwatchInternetTimeFaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SWATCH_BEAT_FAQ.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-2xl font-bold text-amber-950">
        Swatch Internet Time FAQ
      </h2>

      <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
        {SWATCH_BEAT_FAQ.map((it, i) => (
          <details key={i}>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              {it.q}
            </summary>
            <div className="px-5 pb-4 text-amber-800 leading-relaxed">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

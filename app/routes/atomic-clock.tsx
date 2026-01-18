// app/routes/atomic-clock.tsx
import type { Route } from "./+types/atomic-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title = "Atomic Clock | Live Time (Simulated) with Fullscreen";
  const description =
    "Atomic clock style display showing live time with milliseconds, fullscreen mode, and keyboard shortcuts. For reference display only.";
  const url = "https://ilovetimers.com/atomic-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "atomic clock",
        "atomic time",
        "online atomic clock",
        "precise time",
        "accurate clock",
        "time with milliseconds",
        "fullscreen clock",
      ].join(", "),
    },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: `https://ilovetimers.com/og-image.jpg` },
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
  const target =
    (el.querySelector?.("[data-fullscreen-root]") as HTMLElement | null) ?? el;

  if (!document.fullscreenElement) {
    await target.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

function fmtHMSMs(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
}

function fmtHMS(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
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
  title,
}: {
  kind?: "solid" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
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
   ATOMIC CLOCK CARD (SIMULATED UI)
========================================================= */
function AtomicClockCard() {
  const [now, setNow] = useState(() => new Date());
  const [showMs, setShowMs] = useState(true);
  const [live, setLive] = useState(true);

  const fsWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!live) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      setNow(new Date());
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [live]);

  const display = useMemo(() => {
    return showMs ? fmtHMSMs(now) : fmtHMS(now);
  }, [now, showMs]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;

    if (e.key === " ") {
      e.preventDefault();
      setLive((v) => !v);
    } else if (e.key.toLowerCase() === "m") {
      setShowMs((v) => !v);
    } else if (e.key.toLowerCase() === "f" && fsWrapRef.current) {
      toggleFullscreen(fsWrapRef.current);
    }
  };

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-amber-950">
            Atomic Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            Precision-style clock display with fullscreen and shortcuts.
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

          <label className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={showMs}
              onChange={(e) => setShowMs(e.target.checked)}
            />
            Milliseconds
          </label>

          <Btn
            kind="ghost"
            onClick={() =>
              fsWrapRef.current && toggleFullscreen(fsWrapRef.current)
            }
            title="Fullscreen (F)"
          >
            Fullscreen
          </Btn>
        </div>
      </div>

      <div
        ref={fsWrapRef}
        data-fullscreen-root
        className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-amber-950"
        style={{ minHeight: 260 }}
        aria-live="polite"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :fullscreen[data-fullscreen-root]{
                margin:0 !important;
                padding:0 !important;
                border:none !important;
                border-radius:0 !important;
                width:100vw !important;
                height:100vh !important;
                display:flex !important;
                flex-direction:column !important;
                align-items:center !important;
                justify-content:center !important;
                background:#0b0b0c !important;
                color:#ffffff !important;
              }

              :fullscreen [data-fs-hide]{ display:none !important; }

              :fullscreen [data-fs-time]{
                font-size: clamp(56px, 14vw, 200px) !important;
                line-height: 1 !important;
                letter-spacing: 0.06em !important;
                text-align:center !important;
                font-weight: 900 !important;
                width: 100% !important;
              }

              :fullscreen [data-fs-sub]{
                margin-top: 18px !important;
                font-size: clamp(14px, 2.6vw, 26px) !important;
                opacity: 0.85 !important;
                font-weight: 700 !important;
                letter-spacing: 0.08em !important;
                text-transform: uppercase !important;
                text-align:center !important;
              }
            `,
          }}
        />

        <div className="flex items-center justify-between gap-3" data-fs-hide>
          <div className="text-xs font-extrabold uppercase tracking-wide text-amber-800">
            Live time
          </div>
          <div className="text-xs font-semibold text-amber-800">
            Shortcuts: Space live/freeze · M ms toggle · F fullscreen
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center font-mono font-extrabold tracking-widest">
          <span
            className="text-5xl sm:text-6xl md:text-7xl leading-none"
            data-fs-time
          >
            {display}
          </span>
        </div>

        <div
          className="mt-4 text-center text-xs font-semibold text-amber-800"
          data-fs-sub
        >
          Reference display only (not a certified time source)
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AtomicClockPage({}: Route.ComponentProps) {
  const url = "https://ilovetimers.com/atomic-clock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Atomic Clock",
        url,
        description:
          "Atomic clock style live time display with optional milliseconds and fullscreen mode.",
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
          { "@type": "ListItem", position: 2, name: "Atomic Clock", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this a real atomic clock?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. This is a browser-based time display styled like an atomic clock. It shows your device time and is not a certified atomic time source.",
            },
          },
          {
            "@type": "Question",
            name: "Why can the time differ from official sources?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Your device clock can drift and may be corrected periodically by your operating system. Network conditions and system settings can also affect accuracy.",
            },
          },
          {
            "@type": "Question",
            name: "How do I use fullscreen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Click Fullscreen or press F while the clock card is focused.",
            },
          },
          {
            "@type": "Question",
            name: "Can I show or hide milliseconds?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Toggle Milliseconds or press M.",
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
            / <span className="text-amber-950">Atomic Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Atomic Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A precision-style <strong>atomic clock</strong> display with
            optional milliseconds and fullscreen mode.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <AtomicClockCard />
      </section>

      {/* FAQ (rendered at bottom) */}
      <section id="faq">
        <h2 className="text-2xl font-bold">Atomic Clock FAQ</h2>
        <div className="mt-4 divide-y divide-amber-400 rounded-2xl border border-amber-400 bg-white shadow-sm">
          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Is this a real atomic clock?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              No. This page is a browser-based display styled like an atomic
              clock. It shows your device time and is not a certified atomic
              time source.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Why can the time differ from official sources?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Your device clock can drift and may be corrected periodically by
              your operating system. Network conditions and system settings can
              also affect accuracy.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              How do I use fullscreen?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Click <strong>Fullscreen</strong> or press <strong>F</strong>{" "}
              while the clock card is focused.
            </div>
          </details>

          <details>
            <summary className="cursor-pointer px-5 py-4 font-medium">
              Can I show or hide milliseconds?
            </summary>
            <div className="px-5 pb-4 text-amber-800">
              Yes. Toggle <strong>Milliseconds</strong> or press{" "}
              <strong>M</strong>.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

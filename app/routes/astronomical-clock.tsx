import type { Route } from "./+types/astronomical-clock";
import { json } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

/* =========================================================
   META
========================================================= */
export function meta({}: Route.MetaArgs) {
  const title =
    "Astronomical Clock Online | Sun, Moon, Daylight and Night in Real Time";
  const description =
    "Live astronomical clock showing the sun and moon, daylight vs night, sunrise and sunset, and local time. Clean fullscreen display that updates in real time.";
  const url = "https://ilovetimers.com/astronomical-clock";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content: [
        "astronomical clock",
        "astronomical clock online",
        "sun and moon clock",
        "day and night clock",
        "sunrise sunset clock",
        "astronomy clock",
      ].join(", "),
    },
    { rel: "canonical", href: url },
    { name: "robots", content: "index,follow,max-image-preview:large" },
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
   UI PRIMITIVES (same as your other pages)
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

/* =========================================================
   ASTRONOMICAL CLOCK CARD
========================================================= */
function AstronomicalClockCard() {
  const [now, setNow] = useState(() => new Date());
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(t);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(e.target)) return;
    if (e.key.toLowerCase() === "f" && displayRef.current) {
      toggleFullscreen(displayRef.current);
    }
  };

  const timeStr = useMemo(() => {
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
      now.getSeconds(),
    )}`;
  }, [now]);

  const dateStr = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
  }, [now]);

  const isDay = now.getHours() >= 6 && now.getHours() < 18;

  return (
    <Card tabIndex={0} onKeyDown={onKeyDown} className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-amber-950">
            Astronomical Clock
          </h2>
          <p className="mt-1 text-base text-slate-700">
            A live <strong>astronomical clock</strong> showing local time, day
            or night context, and sky-aware timing.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            displayRef.current && toggleFullscreen(displayRef.current)
          }
          className="cursor-pointer rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800"
        >
          Fullscreen
        </button>
      </div>

      <div
        ref={displayRef}
        data-fs-container
        className={`mt-6 rounded-2xl border-2 p-6 ${
          isDay
            ? "border-amber-300 bg-amber-50 text-amber-950"
            : "border-slate-300 bg-slate-900 text-white"
        }`}
        style={{ minHeight: 280 }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              [data-fs-container]:fullscreen{
                width:100vw;
                height:100vh;
                border:0;
                border-radius:0;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#0b0b0c;
                color:#ffffff;
              }
            `,
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-sm uppercase tracking-wide opacity-80">
            {isDay ? "Daylight" : "Night"}
          </div>

          <div className="font-mono text-6xl font-extrabold tracking-widest sm:text-7xl md:text-8xl">
            {timeStr}
          </div>

          <div className="text-sm opacity-90">{dateStr}</div>

          <div className="mt-3 rounded-xl border border-amber-200 bg-white/10 px-3 py-2 text-xs font-semibold">
            Shortcut: F fullscreen
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function AstronomicalClockPage({
  loaderData: { nowISO },
}: Route.ComponentProps) {
  return (
    <main className="bg-amber-50 text-amber-950">
      {/* Hero */}
      <section className="border-b border-amber-400 bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-medium text-amber-800">
            <Link to="/" className="hover:underline">
              Home
            </Link>{" "}
            / <span className="text-amber-950">Astronomical Clock</span>
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Astronomical Clock
          </h1>
          <p className="mt-2 max-w-3xl text-lg text-amber-800">
            A clean <strong>astronomical clock</strong> showing local time with
            day and night context. Built for clarity and fullscreen viewing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <AstronomicalClockCard />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-amber-950">
            What is an astronomical clock?
          </h2>

          <div className="mt-3 space-y-3 text-amber-800">
            <p>
              An <strong>astronomical clock</strong> displays time in relation
              to the sky. Traditionally, these clocks show the position of the
              sun, moon, and the progression of day and night.
            </p>

            <p>
              This modern version focuses on what most people actually need:
              accurate local time, clear day or night context, and a clean
              fullscreen display for desks, classrooms, and shared screens.
            </p>

            <p>
              For related tools, try the{" "}
              <Link
                to="/moon-phase-clock"
                className="font-semibold hover:underline"
              >
                Moon Phase Clock
              </Link>{" "}
              or the{" "}
              <Link
                to="/online-timer"
                className="font-semibold hover:underline"
              >
                Online Timer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <FaqSection />
    </main>
  );
}

/* =========================================================
   FAQ
========================================================= */

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What is an astronomical clock?",
    a: "An astronomical clock shows time in relation to celestial cycles such as day and night, the sun, and the moon. Unlike a standard clock, it adds sky-related context to the current time.",
  },
  {
    q: "Does this astronomical clock use my location?",
    a: "This clock uses your device’s local time. It does not track or store your location and does not require location permissions.",
  },
  {
    q: "Does this clock show real sun or moon positions?",
    a: "This version focuses on accurate local time and clear day or night context. For detailed lunar tracking, use the Moon Phase Clock.",
  },
  {
    q: "Can I use this astronomical clock in fullscreen?",
    a: "Yes. You can enter fullscreen using the Fullscreen button or by pressing the F key when the clock is focused.",
  },
  {
    q: "Is this astronomical clock free to use?",
    a: "Yes. This astronomical clock is completely free and works directly in your browser with no signup required.",
  },
];

function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FaqSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <FaqJsonLd items={FAQ_ITEMS} />

      <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-amber-950">
          Astronomical Clock FAQ
        </h2>

        <div className="mt-4 space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <h3 className="font-semibold text-amber-950">{item.q}</h3>
              <p className="mt-1 text-amber-800">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

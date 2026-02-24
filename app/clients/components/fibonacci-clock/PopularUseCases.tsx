import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Fibonacci Clock intent)
   Schema: ItemList (scenarios -> this route)
========================================================= */

type ScenarioLink = { label: string; href: string };

type Scenario = {
  title: string;
  description: string;
  forWho: string;
  notFor: string;
  links: ScenarioLink[];
};

export default function PopularUseCases({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const scenarios: Scenario[] = [
    {
      title: "Quick world time (visual + exact)",
      description:
        "Pick a time zone and see the exact digital time plus the Fibonacci tile breakdown for that same moment. Useful when you want both a normal time readout and a quick visual representation.",
      forWho:
        "Anyone checking time in another region while still wanting an exact HH:MM:SS reference.",
      notFor:
        "You need to convert a specific meeting time between zones. Use the time zone converter instead.",
      links: [
        { label: "World Clock", href: "/world-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Explore mode (map a time to tiles)",
      description:
        "Switch to Explore and type any hour (0–23) and minute (0–59) to see how it maps to Fibonacci hours and rounded-to-5 minutes. The board updates instantly so you can test times without waiting for the clock.",
      forWho:
        "People who want to understand or demonstrate how a particular time appears on the Fibonacci board.",
      notFor:
        "You need a second-by-second changing mapping while adjusting values. Explore is meant to stay stable while you edit.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Binary Clock", href: "/binary-clock" },
      ],
    },
    {
      title: "Fullscreen display (clean ambient clock)",
      description:
        "Go fullscreen for a clean, readable display. The Fibonacci time scales to fit the screen, and you still have quick controls to switch Live/Explore or copy the output.",
      forWho:
        "Second monitors, wall displays, screen shares, or anyone who wants a big readable clock.",
      notFor:
        "You want an always-minimal display with no extra panels. Try a minimalist clock style instead.",
      links: [
        { label: "Minimalist Clock", href: "/minimalist-clock" },
        { label: "Retro Flip Clock", href: "/retro-flip-clock" },
      ],
    },
    {
      title: "Share a time snapshot (copy breakdown)",
      description:
        "Use Copy to grab a ready-to-paste breakdown: Fibonacci time, exact digital time for the selected zone, rounding notes, and the tile sums used for hours and minutes.",
      forWho:
        "Anyone sending a timestamp or tile breakdown to a friend, teammate, or chat.",
      notFor:
        "You need a shareable link that encodes the time. Use Explore and communicate the input values instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "UTC-first reference (then view in tiles)",
      description:
        "Pick UTC to see a clean, unambiguous reference time and its Fibonacci tile representation, then switch to another zone if needed.",
      forWho:
        "Teams coordinating across regions or anyone who prefers UTC as the baseline.",
      notFor:
        "You need offset math for scheduling. Use the time zone converter for planning.",
      links: [
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Alternate clock styles (same moment, different view)",
      description:
        "Compare different displays for the same current moment. Use this Fibonacci view for tile mapping, and jump to other clock styles for different representations.",
      forWho:
        "Anyone who likes alternative clock formats or wants multiple representations.",
      notFor:
        "You need timers, countdowns, or intervals. Use a timer route instead.",
      links: [
        { label: "Analog Clock", href: "/analog-clock" },
        { label: "Binary Clock", href: "/binary-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/fibonacci-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Fibonacci Clock",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use this page to view live Fibonacci time, switch time zones,
            explore a time manually, go fullscreen, and copy a clean tile
            breakdown.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-base font-semibold text-slate-900">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-slate-700">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    For
                  </div>
                  <div className="mt-1 text-slate-700">{s.forWho}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Not for
                  </div>
                  <div className="mt-1 text-slate-700">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, <span className="font-semibold text-slate-900">C</span> to
          copy, <span className="font-semibold text-slate-900">L</span> for
          Live, and <span className="font-semibold text-slate-900">E</span> for
          Explore. If shortcuts do nothing, click the clock card once to focus
          it.
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MOON PHASE CLOCK intent)
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
      title: "See today’s moon phase instantly",
      description:
        "Open the page and get the current phase label, illumination estimate, and moon age in one view, with a clear “checked at” timestamp.",
      forWho:
        "Anyone who wants a quick, no-noise snapshot of the moon’s current state.",
      notFor:
        "You need a full astronomy dashboard or star chart. Use Astronomical Clock for more sky-style context.",
      links: [{ label: "Astronomical Clock", href: "/astronomical-clock" }],
    },
    {
      title: "Track the next major phase time in local time",
      description:
        "The display shows what major phase is coming next and the estimated local time it occurs, plus a big countdown you can keep running.",
      forWho:
        "Anyone planning around the next New Moon or Full Moon and wanting the time in their own time zone.",
      notFor:
        "You need an official reference comparison for timekeeping. Use Atomic Clock.",
      links: [{ label: "Atomic Clock", href: "/atomic-clock" }],
    },
    {
      title: "Fullscreen countdown for a room display",
      description:
        "Go fullscreen for a large, readable countdown with the next phase name and time. Useful on a spare monitor or TV.",
      forWho:
        "Anyone who wants a big on-screen countdown to the next major phase.",
      notFor:
        "You need a countdown to a custom event time. Use Event Countdown instead.",
      links: [{ label: "Event Countdown", href: "/event-countdown" }],
    },
    {
      title: "Look up the moon phase for a specific date and time",
      description:
        "Switch to Manual by editing the date, hour, and minute. The page updates to show phase label, illumination, age, and the next major phase relative to that moment.",
      forWho:
        "Anyone checking a past or future moment without leaving the page.",
      notFor:
        "You are converting times across time zones. Use Time Zone Converter.",
      links: [{ label: "Time Zone Converter", href: "/time-zone-converter" }],
    },
    {
      title: "Get a simple “where are we in the cycle” view",
      description:
        "Use the phase position bar to see cycle progress at a glance, plus the previous and next major phase timestamps for context.",
      forWho:
        "Anyone who wants a quick sense of lunar cycle position without extra controls.",
      notFor:
        "You want a different clock style or representation. Use another clock page instead.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Minimalist Clock", href: "/minimalist-clock" },
      ],
    },
    {
      title: "Pair moon phase with day and light timing",
      description:
        "Use Moon Phase Clock alongside sunrise and sunset times when planning timing around daylight, especially when you want both views open.",
      forWho:
        "Anyone who likes having moon phase and daylight timing on separate, simple pages.",
      notFor:
        "You need multiple locations at once. Use World Clock for side-by-side places.",
      links: [
        { label: "Sunrise Sunset Clock", href: "/sunrise-sunset-clock" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/moon-phase-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Moon Phase Clock",
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
            Live phase, illumination estimate, moon age, and a big countdown to
            the next major phase. Switch to Manual to check a specific date and
            time.
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
          <span className="font-semibold text-slate-900">Tip:</span> For a clean
          display, keep Live on and go fullscreen with{" "}
          <span className="font-semibold text-slate-900">F</span>. If you want
          to check another moment, edit the date and time to switch to Manual,
          then click Now to return to Live.
        </div>
      </div>
    </section>
  );
}

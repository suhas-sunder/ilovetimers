import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Golden Hour Clock intent)
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
      title: "Plan a shoot (know the exact golden hour window)",
      description:
        "Get morning and evening golden hour start/end times for a specific date and location, then use the live countdown so you arrive and set up before the light shifts.",
      forWho:
        "Photographers, videographers, and anyone timing outdoor lighting conditions.",
      notFor:
        "You want weather or cloud forecasts. This tool is time-based, not sky-condition based.",
      links: [
        { label: "Sunrise & Sunset Clock", href: "/sunrise-sunset-clock" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Use GPS on-location (get times for where you are standing)",
      description:
        "Tap Use GPS to auto-fill your coordinates so golden hour and sunrise/sunset match your current spot, which is helpful when you are traveling, hiking, or scouting.",
      forWho:
        "People scouting viewpoints, trails, neighborhoods, and unfamiliar locations.",
      notFor:
        "You need city-level time by name. This page uses coordinates (GPS or manual).",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Pick the definition that matches your workflow",
      description:
        "Switch between Classic (fixed 60 minutes) and Solar-angle (0° to 6°) depending on whether you want a predictable window or a sun-height-based window that changes with latitude and season.",
      forWho:
        "Anyone who wants control over how golden hour is defined for planning.",
      notFor:
        "You want a single universal definition. Golden hour varies by convention and region.",
      links: [
        { label: "Sunrise & Sunset Clock", href: "/sunrise-sunset-clock" },
        { label: "Astronomical Clock", href: "/astronomical-clock" },
      ],
    },
    {
      title: "Fullscreen countdown while you wait for the transition",
      description:
        "Go fullscreen for a clean, glanceable display and watch the countdown to the next golden hour boundary or sunrise/sunset transition without clutter.",
      forWho:
        "On-site setups where you want the next change visible from a distance.",
      notFor:
        "You need multiple independent timers on one screen. Use Multiple Timers instead.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Coordinate across time zones (travel or remote planning)",
      description:
        "Times display in your device time zone. If you are planning for a different region, grab the times here and convert them afterward.",
      forWho:
        "Travel planning, remote coordination, or planning a shoot in another time zone.",
      notFor:
        "You want automatic destination time zone detection. Convert after viewing.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "High-latitude dates (when sunrise/sunset may not exist)",
      description:
        "If your selected location/date has no sunrise or sunset, the page will show a note and golden hour windows may be unavailable. Try a different date or adjust the latitude.",
      forWho:
        "Anyone checking times in polar regions or extreme seasonal daylight shifts.",
      notFor:
        "You need twilight phase breakdowns beyond sunrise/sunset. Use Astronomical Clock instead.",
      links: [
        { label: "Astronomical Clock", href: "/astronomical-clock" },
        { label: "Moon Phase Clock", href: "/moon-phase-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/golden-hour-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Golden Hour Clock",
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
            Use this page to get golden hour start/end times (morning and
            evening) for a chosen date and location, plus sunrise and sunset and
            a live countdown to the next change. Use GPS for on-location
            accuracy and fullscreen for a clean view.
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
          <span className="font-semibold text-slate-900">G</span> to use GPS,{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-slate-900">Esc</span> to exit
          fullscreen. If shortcuts do nothing, click the clock card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

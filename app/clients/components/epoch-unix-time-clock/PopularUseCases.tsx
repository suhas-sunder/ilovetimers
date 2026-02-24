import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Unix time intent)
   Schema: ItemList (scenarios -> best matching route)
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
      title: "Copy “now” for logs and debugging",
      description:
        "Freeze the clock to hold a stable timestamp, then copy seconds or milliseconds into a log line, bug report, or test payload.",
      forWho:
        "Developers, QA, and anyone who needs a quick “current epoch” value without opening a terminal.",
      notFor:
        "You need to convert an arbitrary timestamp into a date or another format (use a dedicated converter tool if that’s the goal).",
      links: [
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Time Calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Seconds vs milliseconds sanity check",
      description:
        "Avoid the classic 10-digit vs 13-digit mix-up. This page shows both at once so you can copy the correct unit for your system.",
      forWho:
        "Anyone working with APIs, databases, analytics, or event streams where units can differ.",
      notFor:
        "You only need a human-readable clock (use local/UTC clock pages).",
      links: [
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Timezone verification (local vs UTC)",
      description:
        "Use the local and UTC rows to confirm you’re looking at the same moment in both displays, especially when investigating timezone offsets.",
      forWho:
        "Anyone debugging timezone issues, scheduling behavior, or server-client timestamp mismatches.",
      notFor:
        "You need to convert between named time zones (use the time zone converter).",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Screen-share / demo mode (big seconds display)",
      description:
        "Go fullscreen to show a clean, readable epoch seconds clock during a call, demo, or incident review.",
      forWho:
        "Teams on calls, live debugging sessions, or anyone needing a clearly visible “now” reference.",
      notFor: "You want a stylized clock face (use a clock-specific view).",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Minimalist Clock", href: "/minimalist-clock" },
      ],
    },
    {
      title: "Freeze a moment, then “Snap” once",
      description:
        "Keep the clock frozen while you work, then hit Snap to refresh the value once without returning to continuous updates.",
      forWho:
        "Anyone comparing two points in time or collecting timestamps while minimizing changes on screen.",
      notFor:
        "You need multiple saved timestamps at once (use multiple timers for multi-panel workflows).",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Quick “now” without distractions",
      description:
        "This page is deliberately minimal: current epoch seconds front and center, with milliseconds and readable time as supporting info.",
      forWho: "People who just want a fast answer and a copy button, no setup.",
      notFor: "You need a countdown or interval timer (use timer routes).",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/epoch-unix-time-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Unix Time Clock",
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
            Use this page to get the current Unix epoch timestamp in seconds and
            milliseconds, copy instantly, freeze to hold a stable value, snap
            once while frozen, and go fullscreen for a clean, readable seconds
            display.
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
          <span className="font-semibold text-slate-900">Space</span> to toggle
          Live/Frozen, <span className="font-semibold text-slate-900">C</span>{" "}
          to copy seconds,{" "}
          <span className="font-semibold text-slate-900">M</span> to copy
          milliseconds, <span className="font-semibold text-slate-900">N</span>{" "}
          to snap now, and{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen. If shortcuts do nothing, click the clock card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

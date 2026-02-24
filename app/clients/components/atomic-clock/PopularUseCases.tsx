import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
   Schema: ItemList (scenarios -> best matching clock/route)
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
      title: "Exact time with milliseconds on screen",
      description:
        "Get a clean, readable time display including milliseconds for quick precision checks.",
      forWho:
        "Presentations, recording, syncing cues, timing starts, lab/bench work, and anyone who wants a visible millisecond clock.",
      notFor:
        "If you need a timer that counts up/down or alarms. Use a stopwatch or countdown timer instead.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Countdown timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Freeze a time and resume when ready",
      description:
        "Hold the current displayed time on screen (freeze), then return to live updates (resume).",
      forWho:
        "Capturing a timestamp, pausing on a specific moment during a demo, or coordinating a start time across a room.",
      notFor:
        "If you need an elapsed duration that keeps counting while paused. Use a stopwatch for that workflow.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count up timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Big fullscreen wall clock",
      description:
        "Use fullscreen mode for a large, high-contrast clock that’s easy to read from a distance.",
      forWho:
        "Classrooms, studios, meeting rooms, gyms, workshops, and second-monitor setups.",
      notFor:
        "If you want a minimal display with no controls. Use Minimalist Clock instead.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "Minimalist clock", href: "/minimalist-clock" },
        { label: "Fullscreen timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Seconds-only stable display",
      description:
        "Hide milliseconds to reduce visual noise and keep the display steady on the second.",
      forWho:
        "Speakers, meetings, classrooms, and anyone who just needs an easy seconds readout.",
      notFor:
        "If you need to compare multiple cities or time zones. Use a world/UTC clock instead.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "Digital clock", href: "/digital-clock" },
        { label: "Current local time", href: "/current-local-time" },
      ],
    },
    {
      title: "Compare local time with UTC quickly",
      description:
        "Check your local time here, then open UTC to compare without doing mental math.",
      forWho:
        "Logs, coordination across systems, remote work, and anyone who uses UTC as a reference.",
      notFor:
        "If you need to convert a specific meeting time and date. Use the converter for that workflow.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "UTC clock", href: "/utc-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Check multiple cities at once",
      description:
        "Use a multi-city layout when you need several locations visible together.",
      forWho:
        "Remote teams, international coordination, and travel planning across regions.",
      notFor:
        "If you only need a single large display for one place. Use Atomic Clock fullscreen instead.",
      links: [
        { label: "World clock", href: "/world-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
        { label: "Atomic clock", href: "/atomic-clock" },
      ],
    },
    {
      title: "Convert milliseconds for quick calculations",
      description:
        "If you’re reading milliseconds and need to convert them to seconds/minutes/hours, use the converter.",
      forWho:
        "Anyone translating durations, timestamps, or small time intervals into more readable units.",
      notFor:
        "If you need a timer you can start/stop for an activity. Use a stopwatch or countdown timer.",
      links: [
        { label: "Milliseconds converter", href: "/milliseconds-converter" },
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "Time calculator", href: "/time-calculator" },
      ],
    },
  ];

  // Build absolute URLs for schema + rendering
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;
  const list = scenarios.map((s) => ({
    ...s,
    links: s.links.map((l) => ({ ...l, href: abs(l.href) })),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common atomic clock scenarios",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      // point to the first recommended destination
      url: s.links[0]?.href,
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
            Pick the right tool based on what you’re trying to do with precise
            time, milliseconds, and fullscreen display.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                  <a
                    key={l.href}
                    href={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> If the
          milliseconds look “jumpy,” keep the tab visible and disable battery
          saver/low-power mode. For a steadier display, turn off milliseconds.
        </div>
      </div>
    </section>
  );
}

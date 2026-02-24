import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (digital-clock intent)
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
      title: "Big wall clock display (fullscreen)",
      description:
        "Turn this page into a clean, large clock for a room, desk, or second monitor. Fullscreen keeps the digits easy to read from a distance.",
      forWho:
        "Classrooms, offices, front desks, meeting rooms, and anyone who wants a “glanceable” clock on a spare screen.",
      notFor:
        "Alarm-style alerts or notifications when time hits a threshold (use an alarm tool if you need alerts).",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
    {
      title: "Meetings and presentations (stay time-aware)",
      description:
        "Keep local time visible while you’re sharing a screen or running a session. Toggle seconds on for precision or off for a calmer display.",
      forWho:
        "Facilitators, presenters, and teams that want time visibility without switching apps.",
      notFor:
        "Tracking agenda segments automatically or structured pacing features (use a meeting-focused timer for that).",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Classroom pacing (seconds on/off)",
      description:
        "Show the time to help students pace activities. Seconds can be turned off for less distraction, or on when you need precise transitions.",
      forWho: "Teachers and tutors running timed activities or transitions.",
      notFor:
        "A visual countdown for kids or task timeboxing (use a visual timer or countdown timer).",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Timestamping notes and logs (copy time)",
      description:
        "Copy the current time quickly when writing notes, doing handoffs, or logging events. Copy includes time, timezone, date, and an ISO timestamp.",
      forWho:
        "Anyone who needs quick, consistent timestamps in chat, notes, or incident logs.",
      notFor:
        "Time calculations (durations between timestamps) or billable tracking (use time calculators for that).",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
      ],
    },
    {
      title: "Cross-time-zone sanity check (local vs UTC)",
      description:
        "Use this page for local time, then open UTC for a neutral reference when coordinating across zones.",
      forWho:
        "Remote teams scheduling across regions who want a quick local + UTC reference.",
      notFor:
        "Comparing multiple cities at once or converting meeting times (use world clock or a converter).",
      links: [
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Alternate clock styles (for preference or learning)",
      description:
        "If you like different formats, try other clock types while keeping a similar “always-on” utility.",
      forWho:
        "Anyone who prefers a different representation than standard digits.",
      notFor:
        "A single canonical time source (all displays still rely on your device time unless otherwise stated).",
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
    primaryUrl: abs("/digital-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Digital Clock",
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
            Use this page as a big, readable local clock. Toggle seconds and
            12/24-hour time, go fullscreen for distance viewing, and copy the
            current time when you need a quick timestamp.
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
                  <a
                    key={`${s.title}-${l.href}`}
                    href={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, <span className="font-semibold text-slate-900">C</span> to
          copy, <span className="font-semibold text-slate-900">S</span> to
          toggle seconds, and{" "}
          <span className="font-semibold text-slate-900">1</span>/
          <span className="font-semibold text-slate-900">2</span> for
          12/24-hour. If shortcuts do nothing, click the clock card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

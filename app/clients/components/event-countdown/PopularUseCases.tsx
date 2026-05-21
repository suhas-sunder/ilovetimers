import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Event Countdown intent)
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
      title: "Count down to a deadline (submission or cutoff)",
      description:
        "Set the exact date and time, then run a clean countdown you can keep visible while you work. Use fullscreen when you want a big, distraction-free display.",
      forWho:
        "Anyone tracking a hard cutoff: forms, applications, content drops, contest entries, or internal deadlines.",
      notFor:
        "You need a duration-only timer (for example, “25 minutes from now”). Use a duration countdown instead.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Launch or start time you don’t want to miss",
      description:
        "Create an event for a launch or start time, enable sound for a finish beep, and optionally turn on final beeps for the last 5 seconds.",
      forWho:
        "People waiting on a release, stream, sale, meeting start, or anything that begins at a specific time.",
      notFor:
        "You need recurring reminders or notifications outside the browser tab. This is a page-based countdown display.",
      links: [
        { label: "Alarm Timer", href: "/alarm-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Meeting room / screen-share countdown",
      description:
        "Go fullscreen and keep the countdown visible for a group. In fullscreen, click/tap the time to start or pause quickly.",
      forWho:
        "Teams, classrooms, and calls where you want everyone to see time remaining to a start time.",
      notFor:
        "You need to track time during the meeting (counting up). Use a count up timer.",
      links: [
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Multiple upcoming events (saved list)",
      description:
        "Save several event countdowns (for example: check-in, start time, deadline) and switch between them instantly. Duplicate events to reuse a setup.",
      forWho: "Anyone juggling a few fixed-time moments across a day or week.",
      notFor:
        "You need several countdowns visible at once. Use multiple timers for a multi-panel view.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Quick correction when plans change",
      description:
        "Use the ±1h, ±2h, and ±24h buttons to nudge the event time without re-typing the date/time. Reset to refresh remaining time after changes.",
      forWho: "Anyone dealing with schedule shifts or last-minute adjustments.",
      notFor:
        "You need time-zone math to pick the correct local time for someone else. Convert first, then set the event here.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Quiet visual countdown (no sound)",
      description:
        "Leave Sound off and use this as a purely visual countdown to an exact date/time, with a big display and simple controls.",
      forWho: "Shared spaces or situations where audio is not appropriate.",
      notFor:
        "You specifically want a silent-by-design timer experience. Use the silent timer page.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/event-countdown"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Event Countdown",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="space-y-4">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page to count down to a specific date and time, save
            multiple events in your browser, use fullscreen for a big display,
            and optionally enable sound and final beeps for the last seconds.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="ilt-surface-card p-4"
            >
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    For
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.forWho}</div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Not for
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
          to reset, and <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
          for fullscreen. If shortcuts do nothing, click the countdown card once
          to focus it.
        </div>
      </div>
    </section>
  );
}

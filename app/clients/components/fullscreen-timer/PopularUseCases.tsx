import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Fullscreen Timer intent)
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
      title: "Projector / smartboard countdown (big digits for the room)",
      description:
        "Run a large, readable countdown that fills the screen. Great for classrooms, workshops, labs, and shared spaces where everyone needs to see the time.",
      forWho:
        "Teachers, presenters, facilitators, and anyone projecting the timer to a group.",
      notFor:
        "You want an on-screen progress visualization (like a shrinking bar/wedge). Use Visual Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Quick preset countdown (1–60 minutes, fast start)",
      description:
        "Pick a preset, press Start, and you’re done. Presets are the fastest way to run common lengths without typing.",
      forWho:
        "Anyone who needs a simple countdown for tasks, stations, or timeboxing.",
      notFor:
        "You need a structured work/break cycle that repeats. Use Pomodoro Timer instead.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
      ],
    },
    {
      title: "Custom time for exact schedules (mm:ss or hh:mm:ss)",
      description:
        "Type an exact duration like 7:30, 12:00, or 1:00:00, then Set. Useful for planned activities, drills, and timed segments.",
      forWho: "People running agendas, timed activities, or precise segments.",
      notFor:
        "You want multiple independent timers running together. Use Multiple Timers instead.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Loop mode for rotations (repeat the same interval)",
      description:
        "Enable Loop so the timer restarts automatically at zero. Good for stations, group rotations, and repeating rounds with the same length.",
      forWho:
        "Class rotations, circuit work, facilitation, and repeated timed rounds.",
      notFor:
        "You need interval programming with work/rest rounds. Use HIIT or Tabata instead.",
      links: [
        { label: "Round Timer", href: "/round-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Silent or no-audio environments",
      description:
        "Keep Sound off for a fully silent countdown. If you want a dedicated no-audio route, use Silent Timer.",
      forWho: "Libraries, shared offices, meetings, and quiet classrooms.",
      notFor:
        "You rely on an audible end signal. Turn Sound on (and interact once if the browser requires it).",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Meeting Timer", href: "/meeting-timer" },
      ],
    },
    {
      title: "Track elapsed time instead of remaining time",
      description:
        "If you need to show how long something has been running (not how long is left), use a count-up timer.",
      forWho:
        "Meetings, labs, and activities where elapsed time matters more than a fixed endpoint.",
      notFor:
        "You need a hard stop and a visible finish. Use this fullscreen countdown instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/fullscreen-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Fullscreen Timer",
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

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page for a big, readable countdown on a projector or second
            display. Pick a preset or set a custom time, then go fullscreen and
            click/tap the time to start or pause.
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
          to reset, <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit. If
          shortcuts do nothing, click the timer card once to focus it.
        </div>
      </div>
    </section>
  );
}

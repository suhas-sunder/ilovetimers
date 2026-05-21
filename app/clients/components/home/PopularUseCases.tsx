import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
   Schema: ItemList (scenarios -> best matching timer/route)
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
      title: "Meetings that run on schedule",
      description:
        "Keep an agenda tight with a visible countdown you can control quickly.",
      forWho:
        "Facilitators, interviewers, team leads, anyone running timed segments.",
      notFor:
        "If you need shared control for multiple people, calendar automation, or attendee tracking.",
      links: [
        { label: "Meeting timer page", href: "/meeting-timer" },
        { label: "Countdown timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Presentations, speeches, classrooms",
      description:
        "Stay on pace without guessing. Fullscreen keeps the timer readable from a distance.",
      forWho: "Teachers, presenters, speakers, webinar hosts, exam proctors.",
      notFor:
        "If you need slide-by-slide cues, teleprompter features, or integrations with slide decks.",
      links: [
        { label: "Presentation timer page", href: "/presentation-timer" },
        { label: "Countdown timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Silent or discreet timing",
      description:
        "Run a countdown with sound off for quiet rooms, recordings, or talks.",
      forWho: "Libraries, recording sessions, meditation, quiet classrooms.",
      notFor: "If you rely on audio cues or vibration alerts to stay on track.",
      links: [
        { label: "Silent timer page", href: "/silent-timer" },
        { label: "Countdown timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Study sessions and deep work",
      description:
        "Use structured work and break cycles with minimal distractions.",
      forWho: "Students and knowledge workers who benefit from focus blocks.",
      notFor:
        "If you want task lists, site blocking, habit tracking, or analytics. This is just timing.",
      links: [
        { label: "Pomodoro focus timer", href: "/pomodoro-timer" },
        { label: "Productivity timer page", href: "/productivity-timer" },
      ],
    },
    {
      title: "HIIT and interval workouts",
      description:
        "Hands-free timing that auto-runs warm-up, work/rest rounds, and cool-down.",
      forWho: "HIIT, circuits, coaching sessions, gym classes.",
      notFor:
        "If you need workout logging, guided programs, or heart-rate zone tracking.",
      links: [{ label: "HIIT / interval timer", href: "/hiit-timer" }],
    },
    {
      title: "Timing tasks with splits (laps)",
      description:
        "Track elapsed time and record splits for practice, drills, or experiments.",
      forWho: "Training, lab timing, cooking tests, speed practice.",
      notFor: "If you need multi-run comparisons, exports, or advanced stats.",
      links: [{ label: "Stopwatch with laps", href: "/stopwatch" }],
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
    name: "Common timer scenarios",
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

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Quick guidance on which timer to use, plus who each option is (and
            isn’t) a fit for.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                  <a
                    key={l.href}
                    href={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

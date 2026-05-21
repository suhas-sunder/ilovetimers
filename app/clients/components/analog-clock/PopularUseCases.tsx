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
      title: "Wall display clock (classroom, office, lobby)",
      description:
        "Use fullscreen for a large, readable analog clock face that’s easy to see across the room.",
      forWho:
        "Teachers, offices, reception areas, workshops, studios, anywhere you want a simple time display on a screen.",
      notFor:
        "If you need a countdown for activities or transitions. Use a timer instead of a clock.",
      links: [
        { label: "Analog clock", href: "/analog-clock" },
        { label: "Digital clock", href: "/digital-clock" },
        { label: "Fullscreen timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Quiet timekeeping (no seconds hand)",
      description:
        "Hide the seconds hand to reduce distraction while still keeping time visible.",
      forWho:
        "Classrooms, libraries, focus sessions, meetings, or anyone who finds the seconds hand distracting.",
      notFor:
        "If you need elapsed tracking or timed intervals. Use a stopwatch or timer.",
      links: [
        { label: "Analog clock", href: "/analog-clock" },
        { label: "Minimalist clock", href: "/minimalist-clock" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Second-accurate viewing (with smooth motion)",
      description:
        "Show the seconds hand and enable Smooth for a fluid wall-clock feel.",
      forWho:
        "Studios, labs, classrooms, or presenters who want a clear seconds hand for pacing.",
      notFor:
        "If you’re on a low-power device or screen sharing where smooth motion stutters. Turn Smooth off.",
      links: [
        { label: "Analog clock", href: "/analog-clock" },
        { label: "Current local time", href: "/current-local-time" },
        { label: "UTC clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Time zone context (travel, remote teams)",
      description:
        "When you need to confirm local time and timezone, or compare locations.",
      forWho:
        "Remote work, travel planning, distributed teams, scheduling across cities.",
      notFor:
        "If you need conversion across specific dates and meeting times. Use the converter tool.",
      links: [
        { label: "World clock", href: "/world-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
        { label: "UTC clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Device clock comparison",
      description:
        "If you suspect your device time is off, compare it with a simpler clock view and then check your operating-system time settings.",
      forWho:
        "Anyone troubleshooting time drift, meeting-room setup, or device clock settings.",
      notFor:
        "If you need your system clock corrected automatically. You must fix that in OS settings.",
      links: [
        { label: "Current local time", href: "/current-local-time" },
        { label: "UTC clock", href: "/utc-clock" },
        { label: "Analog clock", href: "/analog-clock" },
      ],
    },
    {
      title: "Alternate clock styles (fun or specialized displays)",
      description:
        "Choose a different format when you want a specific aesthetic or encoding.",
      forWho:
        "Class demos, personal setups, novelty displays, or learning-friendly formats.",
      notFor:
        "If you need the simplest possible “just tell me the time” display. Use Digital or Minimalist.",
      links: [
        { label: "Binary clock", href: "/binary-clock" },
        { label: "Roman numeral clock", href: "/roman-numeral-clock" },
        { label: "Retro flip clock", href: "/retro-flip-clock" },
      ],
    },
    {
      title: "Scheduling and structure (time blocks, billing)",
      description:
        "Use specialized clocks when your goal is structuring work or tracking billable time.",
      forWho:
        "Consultants, freelancers, time-blocking planners, anyone billing time.",
      notFor:
        "If you need a stopwatch-style tracker with exports or invoicing. This stays lightweight.",
      links: [
        { label: "Time blocking clock", href: "/time-blocking-clock" },
        { label: "Billable hours clock", href: "/billable-hours-clock" },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
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
    name: "Common clock scenarios",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      // point to the first recommended destination
      url: s.links[0]?.href,
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
            Quick guidance on which clock or time tool to use based on what
            you’re doing.
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

        <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Note:</span> Smooth
          seconds can use more CPU and may look less fluid during screen sharing
          or on low-power devices. If motion stutters, turn Smooth off or hide
          the seconds hand.
        </div>
      </div>
    </section>
  );
}

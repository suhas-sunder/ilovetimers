import { JsonLd } from "./HowItWorks";

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
      title: "Kitchen countdowns that need a sound at zero",
      description:
        "Set a 5, 10, or custom minute alarm and keep the page open while you cook, steep, rest, or check a dish.",
      forWho: "Cooking, tea, reheating, laundry, and short household reminders.",
      notFor:
        "Wake-up alarms, medication alerts, or anything that must ring after the tab is closed.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Tea Timer", href: "/tea-timer" },
        { label: "Egg Timer", href: "/egg-timer" },
      ],
    },
    {
      title: "Room-visible alerts for meetings or classes",
      description:
        "Use fullscreen so everyone can see the remaining time, then stop the alarm once the segment is over.",
      forWho:
        "Teachers, facilitators, presenters, and group leaders running timed blocks.",
      notFor:
        "Agenda management or shared attendee controls. Use Meeting Timer for more meeting-specific structure.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Short resettable reminders",
      description:
        "Reset returns the alarm timer to the selected minutes so you can repeat the same reminder without re-entering the duration.",
      forWho:
        "Repeating breaks, check-ins, cleaning intervals, and quick desk reminders.",
      notFor:
        "Multiple simultaneous reminders. Use Multiple Timers when several countdowns need to run at once.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Break Timer", href: "/break-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
      ],
    },
    {
      title: "Quiet visual completion when sound is off",
      description:
        "Turn Sound off when you only want a visual finished state without beeps or an audible alarm.",
      forWho:
        "Quiet rooms, calls, libraries, recordings, or any place where sound would distract.",
      notFor:
        "Silent-by-default workflows with no alarm intent. Use Silent Timer for that simpler setup.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Meditation Timer", href: "/meditation-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Alarm Timer",
    itemListElement: scenarios.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: abs("/alarm-timer"),
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use Alarm Timer when a countdown should end with a clear alert while
            the browser tab stays open.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.title} className="ilt-surface-card p-4">
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
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {s.forWho}
                  </div>
                </div>
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Not for
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">
                    {s.notFor}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <a
                    key={`${s.title}-${l.href}`}
                    href={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} -&gt;
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

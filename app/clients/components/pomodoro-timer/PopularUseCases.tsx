import { Link } from "react-router";
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
      title: "Classic 25/5 focus cycles",
      description:
        "Run 25-minute work blocks with 5-minute short breaks and repeat for the number of cycles you choose.",
      forWho:
        "Study blocks, writing sessions, coding sessions, chores, admin tasks, review sessions, and focused desk work.",
      notFor:
        "A single one-off countdown with no phase switching. Use Countdown Timer for that.",
      links: [
        { label: "Study Timer", href: "/study-timer" },
        { label: "Productivity Timer", href: "/productivity-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Manual phase control when interruptions happen",
      description:
        "Turn off auto-advance or use Next when you need to pause, skip, or manually move between work and break phases.",
      forWho: "People working around calls, interruptions, or flexible breaks.",
      notFor:
        "Hands-free workout intervals. Use HIIT Timer or Workout Timer instead.",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Long break after the final work block",
      description:
        "Enable the long break option when you want a larger rest period after the last work cycle.",
      forWho: "Long study sessions and repeat focus sessions.",
      notFor:
        "Open-ended elapsed time. Use Count Up Timer or Stopwatch instead.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Fullscreen focus display",
      description:
        "Use fullscreen when you want the active phase and remaining time visible without extra page content.",
      forWho: "Second monitors, shared study rooms, and distraction-light focus.",
      notFor:
        "A no-sound timer by default. Use Silent Timer if quiet completion is the main requirement.",
      links: [
        { label: "Focus Session Timer", href: "/focus-session-timer" },
        { label: "Time Blocking Clock", href: "/time-blocking-clock" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Pomodoro Timer",
    itemListElement: scenarios.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: abs("/pomodoro-timer"),
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
            Pomodoro Timer is for structured work and break cycles with
            optional sound, long break, auto-advance, and fullscreen.
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
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} -&gt;
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

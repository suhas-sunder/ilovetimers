import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (ONLINE TIMER intent)
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
      title: "Presentations with a big, readable countdown",
      description:
        "Set a time fast, go fullscreen, and keep the countdown visible from across the room. Tap/click the timer in fullscreen to start or pause without leaving the big display.",
      forWho:
        "Speakers, teachers, and anyone timing a segment with an audience.",
      notFor:
        "You need a tool tailored to slides, agendas, or speaker workflows. Use Presentation Timer instead.",
      links: [
        { label: "Presentation Timer", href: "/presentation-timer" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Meeting Timer", href: "/meeting-timer" },
      ],
    },
    {
      title: "Classroom transitions and activity timing",
      description:
        "Use presets for quick setup, then go fullscreen so the whole room can see the remaining time. Keep Sound on for an end cue, or turn it off for quieter rooms.",
      forWho:
        "Teachers, tutors, and facilitators running short activities and transitions.",
      notFor:
        "You want a classroom-focused layout and wording. Use Classroom Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Meetings and agenda segments",
      description:
        "Time a single agenda item cleanly with start/pause and a quick reset. Fullscreen helps when the timer needs to be visible to everyone in the room.",
      forWho:
        "Meeting hosts who want simple countdown timing with minimal setup.",
      notFor:
        "You want a count-up view (stopwatch style). Use Meeting Count Up Timer.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Workout intervals that repeat automatically",
      description:
        "Set a short interval (like 30s, 45s, or 1m), enable Loop, and let it repeat hands-free. This works well for simple repeating sets.",
      forWho:
        "Solo workouts, basic interval timing, and repeating rest periods.",
      notFor:
        "You want structured rounds, work/rest splits, or presets for training formats. Use HIIT or Tabata instead.",
      links: [
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Cooking with a single primary countdown",
      description:
        "Use a quick preset or type an exact time for a primary dish. Keep Sound on for an end cue, and go fullscreen if you want a clearer view across the kitchen.",
      forWho: "Everyday cooking where one timer is enough.",
      notFor:
        "You need multiple countdowns at once. Use Multiple Timers instead.",
      links: [
        { label: "Kitchen Timer", href: "/kitchen-timer" },
        { label: "Egg Timer", href: "/egg-timer" },
        { label: "Tea Timer", href: "/tea-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Quiet spaces with visual-only timing",
      description:
        "Turn Sound off and rely on the on-screen Done state. Fullscreen can still be useful for visibility without any audio cue.",
      forWho:
        "Libraries, shared workspaces, silent classrooms, and muted environments.",
      notFor:
        "You want a dedicated no-sound experience as the default. Use Silent Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Study Timer", href: "/study-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/online-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Online Timer",
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
            A simple online countdown with presets, custom time, sound, loop,
            fullscreen mode, and keyboard shortcuts.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For a
          shared screen, go fullscreen with{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>. Use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to start
          or pause, and <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
          to reset to the set duration.
        </div>
      </div>
    </section>
  );
}

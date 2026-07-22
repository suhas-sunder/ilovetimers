import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MULTIPLE TIMERS intent)
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
      title: "Cook two (or more) things at once",
      description:
        "Run separate countdowns for the oven, stovetop, and prep. Keep everything visible in one grid so you don’t miss the next finish time.",
      forWho:
        "Anyone cooking multiple dishes or timing steps like simmering + resting + baking.",
      notFor:
        "You only need one simple countdown. Use Countdown Timer instead.",
      links: [
        { label: "Kitchen Timer", href: "/kitchen-timer" },
        { label: "Egg Timer", href: "/egg-timer" },
        { label: "Tea Timer", href: "/tea-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Workout intervals plus rest running side by side",
      description:
        "Run your work interval timer next to your rest timer (or multiple stations) so you always know what’s up next without resetting a single timer repeatedly.",
      forWho:
        "Gym sessions, circuit training, partner workouts, and coaching groups.",
      notFor:
        "You want a structured interval program (rounds/work-rest built in). Use HIIT or Tabata.",
      links: [
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Lab or classroom stations with one shared display",
      description:
        "Create a timer per station or group, label them clearly, and run the whole grid fullscreen so everyone can track their own countdown at a glance.",
      forWho: "Teachers, lab instructors, facilitators, and workshop leads.",
      notFor:
        "You need a single big classroom clock display. Use Classroom Timer.",
      links: [
        { label: "Lab Timer", href: "/lab-timer" },
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Meetings with multiple agenda segments",
      description:
        "Set one timer per agenda item, run them sequentially, or keep a couple running in parallel for breaks or side discussions.",
      forWho:
        "Facilitators who want quick segment timing without rebuilding a timer each time.",
      notFor:
        "You want a count-up view (stopwatch style). Use Meeting Count Up Timer.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Study blocks with separate task timers",
      description:
        "Run timers for different tasks (reading, practice, break) so you can switch focus without losing where you are on each countdown.",
      forWho:
        "Students managing multiple tasks or alternating between subjects.",
      notFor:
        "You want fixed work/break cycles with one start button. Use Pomodoro.",
      links: [
        { label: "Study Timer", href: "/study-timer" },
        { label: "Break Timer", href: "/break-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
    {
      title: "Quiet environments with visual-only timing",
      description:
        "Turn Sound off and rely on visual alarm state. Useful in libraries, meetings, or any place where audio cues aren’t appropriate.",
      forWho:
        "Quiet rooms, shared workspaces, classrooms, and muted presentations.",
      notFor: "You want a dedicated no-sound experience. Use Silent Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Childcare routines and household batching",
      description:
        "Label timers for separate routines such as reading, cleanup, laundry, screen breaks, or snack prep so each task has its own visible countdown.",
      forWho:
        "Caregivers and households juggling several ordinary timing tasks at once.",
      notFor:
        "You need one large projected countdown. Use Countdown Timer or Fullscreen Timer.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Break Timer", href: "/break-timer" },
      ],
    },
    {
      title: "Game cooldowns, work batching, and experiment steps",
      description:
        "Keep separate timers for cooldowns, focus batches, animation checks, lab steps, or process intervals where each timer needs its own label and reset button.",
      forWho:
        "Players, developers, lab users, and focused workers who need several independent countdowns visible at once.",
      notFor:
        "You need a daily schedule view or elapsed-time tracker. Use Time Blocking Clock or Stopwatch.",
      links: [
        { label: "Lab Timer", href: "/lab-timer" },
        { label: "Time Blocking Clock", href: "/time-blocking-clock" },
        { label: "Game Challenge Timer", href: "/video-game-challenge-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/multiple-timers"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Multiple Timers",
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
            Run multiple countdowns at once with per-timer controls, presets,
            and custom minutes/seconds. Use fullscreen for a clean shared
            display.
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
          or pause all timers quickly, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">X</span> to stop all
          alarms.
        </div>
      </div>
    </section>
  );
}

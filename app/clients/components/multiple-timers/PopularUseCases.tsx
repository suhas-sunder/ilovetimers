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
        { label: "Cooking Timer", href: "/cooking-timer" },
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
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Run multiple countdowns at once with per-timer controls, presets,
            and custom minutes/seconds. Use fullscreen for a clean shared
            display.
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
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> For a
          shared screen, go fullscreen with{" "}
          <span className="font-semibold text-slate-900">F</span>. Use{" "}
          <span className="font-semibold text-slate-900">Space</span> to start
          or pause all timers quickly, and{" "}
          <span className="font-semibold text-slate-900">X</span> to stop all
          alarms.
        </div>
      </div>
    </section>
  );
}

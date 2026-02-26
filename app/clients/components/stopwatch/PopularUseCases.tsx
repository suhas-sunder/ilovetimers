import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (STOPWATCH intent)
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
      title: "Intervals and training sets (track splits per round)",
      description:
        "Start once, then press Lap at the end of each round to capture a split and the running total. Copy the CSV afterward to review pacing or compare attempts.",
      forWho:
        "Workouts, drills, practice reps, and any repeating set where you want split consistency.",
      notFor:
        "You need structured work/rest phases with beeps and rounds. Use HIIT or Tabata instead.",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Speed solves or attempts (save each try as a lap)",
      description:
        "Use the stopwatch for back-to-back attempts: press Lap at the end of each solve to record the time, then copy the lap list as CSV for logging.",
      forWho:
        "Speedcubing, short skill drills, and repeatable attempts you want to compare.",
      notFor:
        "You want a dedicated solve-first interface. Use Speedcubing Timer instead.",
      links: [
        { label: "Speedcubing Timer", href: "/speedcubing-timer" },
        { label: "Reaction Time Test", href: "/reaction-time-test" },
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
      ],
    },
    {
      title: "Presenting a large stopwatch on a screen",
      description:
        "Go fullscreen for a clean, readable display. In fullscreen you can tap/click the time to start or pause, and the top bar keeps controls within reach.",
      forWho:
        "Coaches, classrooms, meetings, labs, or anyone timing a group activity.",
      notFor:
        "You need a countdown timer for a fixed duration. Use Countdown Timer instead.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Timing a task with quick keyboard control",
      description:
        "Use Space to start/pause and L for laps without taking your hands off the keyboard. This is useful for timing workflows, tests, or quick benchmarks.",
      forWho:
        "Keyboard-heavy tasks, quick experiments, benchmarking, and repeat timing runs.",
      notFor:
        "You need time arithmetic like adding/subtracting durations. Use Time Calculator instead.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Lab or experiment timing (mark events as laps)",
      description:
        "Start the stopwatch, then press Lap when something happens to capture event timestamps. Copy the CSV afterward for notes or a lab log.",
      forWho:
        "Simple experiment timing, observation logging, and lightweight timing notes.",
      notFor:
        "You need multiple concurrent timers or a multi-stage protocol. Use Multiple Timers or Lab Timer instead.",
      links: [
        { label: "Lab Timer", href: "/lab-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Keeping a clean record you can paste into a spreadsheet",
      description:
        "Use Copy laps to export a CSV with Lap, Split Time, and Total Time. Paste directly into Sheets/Excel to graph pacing or store results.",
      forWho:
        "Anyone who wants a clean lap log without screenshots or manual typing.",
      notFor:
        "You only need a single elapsed time with no laps. Use Count Up Timer for a simpler view.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Work Hours Calculator", href: "/work-hours-calculator" },
        {
          label: "Billable Hours Calculator",
          href: "/billable-hours-calculator",
        },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/stopwatch"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Stopwatch",
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
            Millisecond stopwatch with laps and splits, copy as CSV, fullscreen
            display, and keyboard shortcuts.
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
          <span className="font-semibold text-slate-900">Tip:</span> If you want
          clean splits, press{" "}
          <span className="font-semibold text-slate-900">Lap (L)</span> at the
          same point every round. Use{" "}
          <span className="font-semibold text-slate-900">Space</span> to
          start/pause, <span className="font-semibold text-slate-900">C</span>{" "}
          to copy CSV, <span className="font-semibold text-slate-900">R</span>{" "}
          to reset, and <span className="font-semibold text-slate-900">F</span>{" "}
          for fullscreen.
        </div>
      </div>
    </section>
  );
}

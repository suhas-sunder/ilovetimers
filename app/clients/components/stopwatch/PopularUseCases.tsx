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
        { label: "Online Timer", href: "/online-timer" },
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
        { label: "Stopwatch", href: "/stopwatch" },
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
        { label: "Stopwatch", href: "/stopwatch" },
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
        { label: "Stopwatch", href: "/stopwatch" },
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

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Millisecond stopwatch with laps and splits, copy as CSV, fullscreen
            display, and keyboard shortcuts.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If you want
          clean splits, press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Lap (L)</span> at the
          same point every round. Use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, <span className="font-semibold text-[var(--ilt-text-primary)]">C</span>{" "}
          to copy CSV, <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
          to reset, and <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
          for fullscreen.
        </div>
      </div>
    </section>
  );
}

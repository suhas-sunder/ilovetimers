import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (HIIT TIMER intent)
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
      title: "Run a Tabata session (20s work / 10s rest × 8)",
      description:
        "Load the Tabata preset, optionally set Warm-up/Cool-down to 0, then press Start. Use Next if you want to jump phases without changing settings.",
      forWho:
        "Anyone who wants a fast, repeatable Tabata block with clear work/rest cues.",
      notFor:
        "You need a dedicated Tabata-only page or multiple blocks back-to-back. Use Tabata Timer or Multiple Timers.",
      links: [
        { label: "Tabata Timer", href: "/tabata-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Standard conditioning intervals (longer work/rest blocks)",
      description:
        "Load the Intervals preset (40/20 × 10) or set your own durations. This is the simplest way to run structured intervals without building a full workout plan.",
      forWho:
        "People who want predictable interval pacing with easy start/pause and a big, readable display.",
      notFor:
        "You need time math, schedules, or planning tools. This page is for running the timer.",
      links: [
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "Time Calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Boxing / round training (3:00 / 1:00 × 6)",
      description:
        "Use the Boxing preset for round-based work. Fullscreen is ideal on a phone or wall display, and sound cues help you move without looking down.",
      forWho:
        "Bag work, shadowboxing, sparring drills, or any round-based training.",
      notFor: "You want a minimal bell-only round timer. Use Round Timer.",
      links: [
        { label: "Round Timer", href: "/round-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Skip warm-up or cool-down without changing your plan",
      description:
        "Set Warm-up or Cool-down to 0 seconds (skip), or use Next to jump forward immediately. This is useful when you’re already warmed up or finishing early.",
      forWho:
        "Anyone adjusting on the fly while keeping the rest of the structure intact.",
      notFor:
        "You need to save named routines. This page focuses on quick setup and run.",
      links: [
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
      ],
    },
    {
      title: "No-rest blocks (Rest = 0) for back-to-back work intervals",
      description:
        "Set Rest to 0 to run work intervals back-to-back across rounds. You still get clear round counting and an end cue between phases.",
      forWho:
        "People doing continuous reps where rest is handled informally off-timer.",
      notFor:
        "You need an EMOM or AMRAP structure with explicit format rules. Use EMOM or AMRAP Timer.",
      links: [
        { label: "EMOM Timer", href: "/emom-timer" },
        { label: "AMRAP Timer", href: "/amrap-timer" },
      ],
    },
    {
      title: "Hands-free big-screen mode for gyms, classes, or groups",
      description:
        "Go fullscreen to maximize readability. Use Space to start/pause, N for next, and R to reset. Keep Sound on if you want phase cues without watching the screen.",
      forWho:
        "Small group workouts, classes, or any setup where the timer needs to be seen across a room.",
      notFor:
        "You need multiple independent timers on one screen. Use Multiple Timers.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Quick ‘change of plans’ control during a session",
      description:
        "Pause instantly, skip a phase with Next, or reset to the start. This is built for real-world sessions where you might need to adjust without touching settings mid-run.",
      forWho: "Anyone who wants simple, reliable controls while training.",
      notFor: "You want a silent timer only. Use Silent Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/hiit-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the HIIT Timer",
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
            Use this page to run interval sessions with warm-up, work/rest
            rounds, and cool-down. Load a preset, tweak durations, then start.
            You can pause, skip to the next phase, toggle sound cues, and use
            fullscreen for a clean training view.
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
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">Space</span> to
          start/pause, <span className="font-semibold text-slate-900">N</span>{" "}
          for next, <span className="font-semibold text-slate-900">R</span> to
          reset, <span className="font-semibold text-slate-900">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-slate-900">Esc</span> to exit
          fullscreen. If shortcuts do nothing, click the timer card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (PACE TIMER intent)
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
      title: "Steady runs with a target pace you want to hold",
      description:
        "Enter your distance and target pace (min/km or min/mi), then follow a clear countdown. Use interval beeps to stay honest on your splits, and fullscreen for a clean glanceable clock.",
      forWho: "Runners doing steady efforts, tempo runs, or pacing practice.",
      notFor:
        "You want structured rounds or work/rest intervals. Use HIIT Timer, Tabata Timer, or Round Timer instead.",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
        { label: "Round Timer", href: "/round-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Rowing pieces with a /500m split target",
      description:
        "Set distance in meters and a target split per 500m. Interval beeps can fire every 500m (or every 1000m, 1500m, etc.) so you can check in without staring at the screen.",
      forWho: "Rowers training 2k/5k pieces or steady-state rows.",
      notFor:
        "You want a repeating on/off interval timer (work/rest). Use EMOM, AMRAP, or Tabata depending on the structure you need.",
      links: [
        { label: "EMOM Timer", href: "/emom-timer" },
        { label: "AMRAP Timer", href: "/amrap-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "You know the finish time, and want the required pace",
      description:
        "Switch to Finish time, enter a goal time for your selected distance, and the tool computes the pace/split. Then run the countdown and use “should be at” to keep the effort even.",
      forWho: "Anyone pacing a time trial or trying to hit a specific finish.",
      notFor:
        "You only need a basic countdown (no pace math). Use Online Timer or Countdown Timer.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Split reminders without constant screen-checking",
      description:
        "Keep Sound on and set Beep every 1 unit (1 km/mi or 500m). You’ll get periodic cues while the timer continues counting down to your finish.",
      forWho:
        "People who want pacing nudges while focusing on form and effort.",
      notFor:
        "You need a silent, visual-only experience as the default. Use Silent Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
      ],
    },
    {
      title: "Big-screen pacing for treadmills, gyms, or group sessions",
      description:
        "Go fullscreen for large digits, then use the countdown as a shared pacing reference. This works well when the display needs to be readable at a distance.",
      forWho: "Gym use, treadmills, rowing machines, and group workouts.",
      notFor:
        "You want multiple timers running side-by-side for stations. Use Multiple Timers instead.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Simple pacing practice plus a separate stopwatch",
      description:
        "Use Pace Timer to hold the target effort, and pair it with a stopwatch if you want manual lap/split tracking at the same time.",
      forWho: "Athletes who want a steady countdown plus manual split notes.",
      notFor:
        "You only want count-up timing. Use Stopwatch or Count Up Timer instead.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/pace-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Pace Timer",
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
            A pace-based countdown for running and rowing with pace or
            finish-time input, interval beeps, fullscreen mode, and keyboard
            shortcuts.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For steady
          check-ins, set{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Beep every</span> to{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">1</span> unit (1 km/mi
          or 500m). Use <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
          for fullscreen,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> to reset.
        </div>
      </div>
    </section>
  );
}

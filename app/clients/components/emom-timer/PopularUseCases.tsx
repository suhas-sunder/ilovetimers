import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (EMOM intent)
   Schema: ItemList (scenarios -> best matching route)
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
      title: "Classic EMOM pacing (start every minute)",
      description:
        "Use the minute countdown as a simple pacing signal: start work on the beep, finish your reps, then use the remaining seconds as built-in rest.",
      forWho:
        "Anyone doing EMOM-style workouts who wants a clean minute-by-minute rhythm without extra interval setup.",
      notFor:
        "You need custom work/rest lengths (use a HIIT or Tabata timer for that).",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Prep then launch (equipment setup before round 1)",
      description:
        "Add a short prep countdown so you can set your weights, chalk up, or get positioned. When prep ends, the first EMOM minute starts automatically.",
      forWho:
        "Home gyms, crowded gyms, or classes where you want a clean start after setup.",
      notFor:
        "You want a longer guided warmup sequence (use a workout timer setup).",
      links: [
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "Stretch Timer", href: "/stretch-timer" },
      ],
    },
    {
      title: "Coach mode (big display on a shared screen)",
      description:
        "Run fullscreen on a wall TV, laptop, or tablet so everyone can see the minute countdown. Tap/click the time in fullscreen to start/pause quickly.",
      forWho:
        "Group EMOMs, classes, and partner workouts where one screen drives the room.",
      notFor:
        "Multiple separate stations each needing their own timer (use multiple timers).",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Silent gym (visual only)",
      description:
        "Turn sound off and rely on the big visual countdown to track the minute. Useful in shared spaces or when you’re wearing headphones.",
      forWho: "Shared spaces, quiet gyms, or anyone who prefers no audio cues.",
      notFor:
        "You need an audible cue while your screen isn’t visible (use an alarm-style tool).",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
    {
      title: "End-of-minute warning (final beeps on)",
      description:
        "Enable final beeps to get a heads-up in the last 5 seconds of each minute, so you can finish your reps and be ready to restart on the minute.",
      forWho:
        "EMOMs where you want a consistent “wrap it up” cue without staring at the screen.",
      notFor:
        "You want custom warning timing or long alerts (use a countdown/alarm timer).",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
    {
      title: "RPE pacing or technique work (steady structure)",
      description:
        "Use a fixed number of rounds so you can repeat the same structure across sessions and compare effort, quality, and consistency.",
      forWho:
        "Technique EMOMs, conditioning blocks, or repeatable training templates.",
      notFor: "As-many-rounds-as-possible formats (use AMRAP for that intent).",
      links: [
        { label: "AMRAP Timer", href: "/amrap-timer" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/emom-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the EMOM Timer",
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
            Use this page to run a clean EMOM block: set total rounds (minutes),
            optionally add a prep countdown, toggle sound/final beeps, and go
            fullscreen for a big minute countdown. In fullscreen, tap/click the
            time to start/pause/resume.
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
                  <a
                    key={`${s.title}-${l.href}`}
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

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
          to reset, <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen, <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> to
          toggle sound, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">B</span> to toggle
          final beeps (when sound is on). If shortcuts do nothing, click the
          timer card once to focus it.
        </div>
      </div>
    </section>
  );
}

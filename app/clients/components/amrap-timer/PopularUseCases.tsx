import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
   Schema: ItemList (scenarios -> best matching timer/route)
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
      title: "AMRAP workouts (time cap + manual score)",
      description:
        "Run a clean countdown with optional prep, then track rounds and reps while you work.",
      forWho:
        "CrossFit-style AMRAPs, conditioning finishers, partner workouts, coaching sessions where you want a big visible timer and a simple score.",
      notFor:
        "If you need automatic rep detection, workout logging, or analytics. This page is a timer + manual scoring display.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "EMOM timer", href: "/emom-timer" },
        { label: "Round timer", href: "/round-timer" },
      ],
    },
    {
      title: "Prep before a time-capped workout",
      description:
        "Use the prep countdown to get equipment ready, move into position, or brief a class before the AMRAP clock starts.",
      forWho:
        "Coaches, garage gyms, partner workouts, and athletes who want a short buffer before the scored effort.",
      notFor:
        "If the workout needs automatic minute-by-minute prompts. Use the EMOM timer for that structure.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "EMOM timer", href: "/emom-timer" },
        { label: "Workout timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Rounds and reps scoring",
      description:
        "Use the large tap controls or keyboard shortcuts to keep a simple score while the countdown stays visible.",
      forWho:
        "As-many-rounds-as-possible workouts, ladder finishers, repeatable bodyweight circuits, and coaching whiteboard scores.",
      notFor:
        "If you need automatic rep counting, exercise recognition, or workout history sync.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "Workout timer", href: "/workout-timer" },
        { label: "HIIT timer", href: "/hiit-timer" },
      ],
    },
    {
      title: "Fullscreen coach display",
      description:
        "Put the AMRAP countdown on a TV, tablet, or second monitor so the room can see time remaining and score.",
      forWho: "Coaches, small-group training, home gyms, and workout classes.",
      notFor:
        "If you need remote shared control or participant tracking.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "Fullscreen timer", href: "/fullscreen-timer" },
        { label: "Workout timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Quiet AMRAP timing",
      description:
        "Turn sound off and use the visual countdown and manual score controls when beeps would be distracting.",
      forWho: "Shared spaces, early workouts, recordings, and quiet coaching environments.",
      notFor:
        "If you rely on audio cues while looking away from the screen.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "Silent timer", href: "/silent-timer" },
        { label: "Visual timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Choose another workout format",
      description:
        "Switch tools when the workout needs fixed work/rest rounds, Tabata timing, or an every-minute-on-the-minute structure.",
      forWho:
        "Athletes and coaches deciding between AMRAP, EMOM, HIIT, Tabata, or round-based training.",
      notFor:
        "If the workout is one time cap with manual score tracking. Stay on the AMRAP timer.",
      links: [
        { label: "EMOM timer", href: "/emom-timer" },
        { label: "HIIT timer", href: "/hiit-timer" },
        { label: "Tabata timer", href: "/tabata-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;
  const list = scenarios.map((s) => ({
    ...s,
    links: s.links.map((l) => ({ ...l, href: abs(l.href) })),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the AMRAP Timer",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.links[0]?.href,
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common AMRAP scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page for time-capped workouts with manual rounds and reps
            scoring.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                    key={l.href}
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

        <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Note:
          </span>{" "}
          Browser timers cannot alert if you close the tab or your
          device puts the browser to sleep. For workouts, keep this page visible
          or use fullscreen.
        </div>
      </div>
    </section>
  );
}

import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
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
      title: "Find the tempo of a song or loop (tap along)",
      description:
        "Tap on the beat for a few seconds to estimate BPM quickly. Lock once it settles, then copy the result.",
      forWho:
        "Musicians, producers, DJs, and anyone trying to match a track or check a loop’s tempo by feel.",
      notFor:
        "If you want audible clicks at a fixed tempo. Use Metronome instead.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "Metronome", href: "/metronome" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Set a metronome tempo from your natural groove",
      description:
        "Tap the feel you want, then switch to a metronome using the BPM you found for consistent practice.",
      forWho:
        "Players who know the feel but don’t know the number yet, and want a quick way to convert feel → BPM.",
      notFor:
        "If you already know the BPM and just need a timer for sets. Use a workout or interval timer.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "Metronome", href: "/metronome" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Check timing (ms/beat, 8ths, 16ths) while practicing",
      description:
        "Use ms/beat to sanity-check your timing, then use ms/8th and ms/16th as quick subdivision references.",
      forWho:
        "Anyone doing tight rhythmic practice, sequencing, or chopping audio where milliseconds matter.",
      notFor:
        "If you need time math across durations instead of tempo. Use Time Calculator.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
      ],
    },
    {
      title: "Use fullscreen for a big, readable BPM display",
      description:
        "Go fullscreen when you want the BPM large and distraction-free. Tap anywhere to register beats; Esc exits.",
      forWho:
        "Studios, classrooms, band practice, or any setup where you want the BPM readable at a distance.",
      notFor:
        "If you need a big countdown clock for an event. Use Fullscreen Timer instead.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Compare two tempos without losing your place",
      description:
        "Lock one result, note it, then unlock and tap a second phrase. Recent results makes it easy to copy previous readings.",
      forWho:
        "Producers comparing sections, dancers comparing routines, or anyone checking two sources quickly.",
      notFor:
        "If you need multiple independent running timers. Use Multiple Timers instead.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Quickly measure a steady pace (walk/run/steps) by tapping",
      description:
        "Tap each step (or every other step) to estimate cadence in BPM. Useful when you want a quick sense of pace without setup.",
      forWho:
        "Anyone estimating cadence informally (walking, running, drills) where a rough tempo is enough.",
      notFor:
        "If you need structured intervals. Use an interval timer like HIIT or Tabata.",
      links: [
        { label: "Tap BPM", href: "/bpm-tapper" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
  ];

  // Build absolute URLs for schema + rendering
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;
  const list = scenarios.map((s) => ({
    ...s,
    links: s.links.map((l) => ({ ...l, href: abs(l.href) })),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common Tap BPM scenarios",
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
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page to estimate tempo (BPM) by tapping. It’s built to be
            fast: tap anywhere, lock results when they settle, copy with one
            click, and switch to a metronome when you want consistent clicks.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                    key={l.href}
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For
          steadier results, tap at least{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">6–10 beats</span> and
          lock only once the BPM stops bouncing. If you pause between phrases,
          increase the{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span> time.
        </div>
      </div>
    </section>
  );
}

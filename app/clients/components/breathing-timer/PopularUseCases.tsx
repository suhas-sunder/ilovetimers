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
      title: "Follow a steady box breathing rhythm (4-4-4-4)",
      description:
        "Pick the Box 4-4-4-4 preset and press Space to start. Use fullscreen if you want a clean display you can follow without thinking about timing.",
      forWho:
        "Anyone who wants a consistent inhale/hold/exhale pace that can run continuously.",
      notFor:
        "If you want a simple countdown without phases. Use Countdown Timer or Online Timer instead.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Run a fixed 4-7-8 routine that ends on its own",
      description:
        "Pick the 4-7-8 preset and let it run through its default number of cycles. The timer stops at Done so you do not need to count rounds.",
      forWho:
        "People who want a start-to-finish routine with a clear stopping point.",
      notFor:
        "If you want continuous breathing that runs until you stop it. Use Box or set Cycles to 0.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Meditation Timer", href: "/meditation-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
    {
      title: "Make a custom inhale/hold/exhale pattern",
      description:
        "Choose Custom and set your own seconds. Set either hold to 0 to skip it so your cycle only includes phases you actually want.",
      forWho:
        "Anyone who already knows their preferred timing and wants a guided phase countdown.",
      notFor:
        "If you need multiple different patterns running at the same time. Use Multiple Timers instead.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Use fullscreen and tap-to-start for a distraction-free session",
      description:
        "Press F for fullscreen. In fullscreen, tap/click the timer display to start or pause, and press Esc to exit.",
      forWho:
        "Anyone stepping back from the screen or using a second monitor for a large, clean guide.",
      notFor:
        "If you want a general-purpose fullscreen countdown without phase labels. Use Fullscreen Timer instead.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Use sound cues so you can follow by ear",
      description:
        "Turn on Sound to get gentle cues at phase changes. This helps if you are not watching the countdown the whole time.",
      forWho: "People who want guided pacing without staring at the screen.",
      notFor:
        "If you need the session to be fully silent in a shared space. Use Silent Timer instead.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Meditation Timer", href: "/meditation-timer" },
      ],
    },
    {
      title: "Pair breathing with a short recovery block",
      description:
        "Run a few cycles, then switch to a short stretch or rest timer to keep the whole reset structured without doing mental math.",
      forWho:
        "Quick resets between study/work blocks or after workouts where you want a paced cooldown.",
      notFor:
        "If you want structured workout intervals with rounds. Use HIIT Timer, Tabata Timer, or Round Timer instead.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Stretch Timer", href: "/stretch-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
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
    name: "Common breathing timer scenarios",
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
            Use this page for guided inhale/hold/exhale cycles with a big phase
            countdown. Pick a preset or set your own timing, press Space to
            start/pause, and use fullscreen when you want a clean,
            distraction-free display. Turn on sound cues if you prefer to follow
            by ear.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If you want
          minimal distraction, press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for fullscreen
          and tap/click the timer to start or pause. If you want to follow
          without watching the screen, enable{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span>. For a
          routine that stops automatically, use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">4-7-8</span>. For a
          continuous rhythm, use Box breathing or set{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Cycles</span> to{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">0</span>.
        </div>
      </div>
    </section>
  );
}

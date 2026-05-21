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
      title: "Run unpredictable work/rest or drill intervals",
      description:
        "Set a seconds range (example: 10–45s), choose Random interval timer, set the number of intervals, then press Space to start. Use Sound if you want an obvious end-of-interval cue without watching the screen.",
      forWho:
        "Training drills, classroom prompts, games, or any session where you want randomness that still stays inside your chosen range.",
      notFor:
        "If you want fixed, repeatable intervals (example: exactly 30s on, 30s off). Use HIIT Timer, Tabata Timer, or Round Timer instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Do a single random countdown (one-off randomness)",
      description:
        "Choose Random timer (single), set your range, then press Start. The timer rolls one random duration and stops at the end.",
      forWho:
        "One-time starts where you want an unpredictable countdown without running a full interval session.",
      notFor:
        "If you need multiple random countdowns back-to-back. Use Random interval timer mode instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title:
        "Use the next preview to reduce surprise without losing randomness",
      description:
        "In interval mode, the timer shows the next rolled duration as a preview. This helps you prepare for what’s coming next without knowing the full sequence.",
      forWho:
        "Coaches, teachers, or anyone leading a group who wants randomness but still wants a small heads-up for transitions.",
      notFor:
        "If you want the entire plan visible up front. Use a structured interval tool like HIIT Timer instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Go fullscreen for a big, readable display (tap-to-start)",
      description:
        "Press F for fullscreen. In fullscreen, tap/click the timer display to start or pause, and press Esc to exit.",
      forWho:
        "Anyone stepping back from the screen or using a second monitor for a large, clean countdown display.",
      notFor:
        "If you want a simple big countdown without randomness. Use Fullscreen Timer instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Use sound cues for hands-free transitions",
      description:
        "Turn Sound on, then enable Beep each interval for a clear end-of-interval cue. Optionally enable Final beeps to get a last-5-seconds warning during a countdown.",
      forWho:
        "Group sessions, timers running across the room, or situations where you don’t want to stare at the display.",
      notFor:
        "If your environment must be fully silent. Use Silent Timer instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Pair randomness with a structured follow-up block",
      description:
        "Run a chaos interval session, then switch to a fixed timer for the next block (example: a rest or break countdown) so the whole session stays simple to run.",
      forWho:
        "Workouts, study blocks, or games where you want a random segment followed by a predictable timer segment.",
      notFor:
        "If you want everything in one structured routine with rounds and rest built in. Use Round Timer instead.",
      links: [
        { label: "Chaos Timer", href: "/chaos-timer" },
        { label: "Video Game Challenge Timer", href: "/video-game-challenge-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
        { label: "Break Timer", href: "/break-timer" },
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
    name: "Common chaos timer scenarios",
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
            Use this page to run unpredictable countdowns inside a seconds
            range. Choose Random timer for one countdown, or Random interval
            timer to run multiple random intervals with progress and a next
            preview. Go fullscreen for a big, clean display, and enable sound if
            you want audible cues.
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
          the cleanest “run it from across the room” setup, press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for fullscreen
          and enable <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span>
          . For interval sessions, keep{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">
            Beep each interval
          </span>{" "}
          on so transitions are obvious. If you want just one random countdown,
          switch to{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Random timer</span>.
        </div>
      </div>
    </section>
  );
}

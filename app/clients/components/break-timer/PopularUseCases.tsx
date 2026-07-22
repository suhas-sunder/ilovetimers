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
      title: "Take a quick 1–5 minute reset between tasks",
      description:
        "Pick a short preset and press Space to start. Use sound or final beeps so you don’t keep checking the screen.",
      forWho:
        "Anyone doing short breaks between work blocks, study sets, or screen-heavy tasks.",
      notFor:
        "If you want a fixed work/break cycle with long sessions. Use Pomodoro Timer instead.",
      links: [
        { label: "Break Timer", href: "/break-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Study Timer", href: "/study-timer" },
      ],
    },
    {
      title: "Run a long break (10–20 minutes) after deep work",
      description:
        "Set 10, 15, or 20 minutes and go fullscreen for a clean countdown you can glance at from a distance.",
      forWho:
        "People coming off meetings, focus sessions, or long study blocks who want a clear “back at X:XX” timer.",
      notFor:
        "If you need a countdown tied to a real-world date/time event. Use Event Countdown instead.",
      links: [
        { label: "Break Timer", href: "/break-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
        { label: "Event Countdown", href: "/event-countdown" },
      ],
    },
    {
      title: "Use fullscreen on a second screen or across the room",
      description:
        "Press F for fullscreen. In fullscreen, tap/click the time to start/pause and use Esc to exit.",
      forWho:
        "Home offices, classrooms, shared spaces, or anywhere you want a big, readable countdown.",
      notFor:
        "If you want a general purpose fullscreen countdown without break-specific defaults. Use Fullscreen Timer instead.",
      links: [
        { label: "Break Timer", href: "/break-timer" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Repeat micro-breaks with Loop mode",
      description:
        "Turn on Loop to auto-restart the same break length. Great for short stretch cycles or quick posture resets.",
      forWho:
        "Anyone doing repeated 1–3 minute breaks (stretching, hydration, posture checks).",
      notFor:
        "If you need structured intervals with work + rest rounds. Use HIIT Timer or Tabata Timer instead.",
      links: [
        { label: "Break Timer", href: "/break-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Keep it silent (or use beeps only at the end)",
      description:
        "Toggle Sound off for a fully silent break. If Sound is on, enable Final beeps for the last seconds.",
      forWho:
        "Quiet environments where you still want a clean, predictable end cue.",
      notFor:
        "If you want a timer designed to stay silent by default across the whole UI. Use Silent Timer instead.",
      links: [
        { label: "Break Timer", href: "/break-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Run multiple breaks at once",
      description:
        "If you’re managing more than one person or task, use multiple independent timers rather than pausing/resuming one countdown.",
      forWho:
        "Teachers, facilitators, group work, or anyone tracking multiple break times simultaneously.",
      notFor:
        "If you only need one countdown and just want it large and simple. Stay on Break Timer.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Break Timer", href: "/break-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
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
    name: "Common break timer scenarios",
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
            Use this page for fast, no-fuss breaks. Pick minutes, press Space to
            start/pause, and go fullscreen when you want a big, readable
            countdown. Turn on sound (and final beeps) if you don’t want to keep
            checking the screen.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For “walk
          away” breaks, turn on{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>. For
          repeated micro-breaks, enable{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Loop</span> and pick a
          short preset like 1–3 minutes.
        </div>
      </div>
    </section>
  );
}

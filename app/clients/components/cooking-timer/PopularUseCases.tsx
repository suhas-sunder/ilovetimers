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
      title: "Time eggs fast with one tap",
      description:
        "Choose a doneness preset (Soft 6m, Jammy 7m, Medium 8m, Hard 10m), then press Space or Start. Go fullscreen for big digits you can read while you prep the rest of the meal.",
      forWho:
        "Soft, jammy, or hard-boiled eggs when you want a repeatable timer without typing.",
      notFor:
        "If you want egg-only presets and nothing else. Use Egg Timer instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Egg Timer", href: "/egg-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Set a precise kitchen countdown (minutes + seconds)",
      description:
        "Enter exact minutes and seconds for tasks like simmering, resting, or short prep steps. Inputs are locked while running, so you won’t accidentally change time mid-cook.",
      forWho:
        "Any cooking step where you need an exact duration rather than guessing or rounding.",
      notFor:
        "If you need to run multiple independent timers at once. Use Multiple Timers instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Use fullscreen for big, glanceable digits",
      description:
        "Press F (or click Fullscreen). The display becomes large and uncluttered. In fullscreen, tap/click the time to start or pause without hunting for buttons.",
      forWho:
        "Cooking while moving around the kitchen, using a phone stand, or needing visibility from across the room.",
      notFor:
        "If you want a simpler big countdown with fewer presets. Use Fullscreen Timer instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Get a clear finish signal (sound + final beeps)",
      description:
        "Turn Sound on for an end beep. Enable Final beeps to get a short heads-up in the last 5 seconds so you can get ready to drain, flip, or take something out.",
      forWho:
        "Tasks where you don’t want to stare at the screen but still want a reliable finish cue.",
      notFor:
        "If your environment must be fully silent. Use Silent Timer instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Tea Timer", href: "/tea-timer" },
      ],
    },
    {
      title: "Repeat the same timer automatically (Loop mode)",
      description:
        "Enable Loop (L) to restart the same duration when it hits zero. Useful for repeated short cycles, batch cooking, or repeating a boil/rest interval without re-setting time each round.",
      forWho:
        "Repeating intervals, multiple batches, or a routine where the same duration keeps coming up.",
      notFor:
        "If you want several different timers running at the same time. Use Multiple Timers instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Use simple presets for common cooking steps",
      description:
        "Pick a common preset (30s, 1m, 2m, 5m, 10m, 15m, 20m, 30m, 45m, 60m) and start immediately. Reset to run the same duration again.",
      forWho:
        "Quick reminders like oven checks, resting, steeping, or timing short prep tasks.",
      notFor:
        "If you’re timing a specific niche workflow. Try a specialized page like Tea Timer or Pizza Timer.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Tea Timer", href: "/tea-timer" },
        { label: "Pizza Timer", href: "/pizza-timer" },
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
    name: "Common cooking timer scenarios",
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
            Use this page for kitchen-friendly countdowns you can start fast.
            Pick an egg preset or a common preset, set exact minutes and
            seconds, go fullscreen for big digits, and optionally enable sound
            and final beeps for a clear finish cue.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For the
          easiest “hands-busy” setup, go{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span> and
          keep your most-used presets nearby. If you use sound cues, start the
          timer once first so the browser allows audio.
        </div>
      </div>
    </section>
  );
}

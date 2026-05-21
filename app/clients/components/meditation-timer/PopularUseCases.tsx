import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MEDITATION TIMER intent)
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
      title: "Quick quiet pause (1 to 3 minutes)",
      description:
        "Pick a 1m, 2m, or 3m preset, press Start, and keep the screen simple. This is useful when you want a short timed pause between tasks or a brief quiet block.",
      forWho:
        "Anyone who wants a short, repeatable break that ends cleanly without thinking about timing.",
      notFor:
        "You want a guided routine or breathing prompts. Use Breathing Timer for more structured breathwork.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Break Timer", href: "/break-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
    {
      title: "Daily meditation sit (10 to 20 minutes)",
      description:
        "Choose 10m, 12m, 15m, or 20m. Go fullscreen for a large, readable display. Keep Sound off for silence, or enable an End chime if you want a clear finish without watching the clock.",
      forWho:
        "People who want a consistent daily timer with a clean fullscreen view.",
      notFor:
        "You need multiple segments with different durations in one session. Use Multiple Timers for routines with several blocks.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
    {
      title: "Box breathing practice block (3 to 5 minutes)",
      description:
        "Use a Box preset as a timed practice window. Keep Loop on if you want repeated blocks, and enable Final beeps if you want a gentle heads-up before the block ends.",
      forWho:
        "Anyone running a short breathwork block with a clear start and finish.",
      notFor:
        "You want breathing phase cues or guided pacing. Use Breathing Timer for a dedicated breathwork experience.",
      links: [
        { label: "Breathing Timer", href: "/breathing-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
    {
      title: "Yoga holds or short rests (custom seconds)",
      description:
        "Set Custom minutes and add + extra seconds to time holds or short rests precisely. Fullscreen makes the countdown easy to see from the mat.",
      forWho:
        "Yoga or mobility sessions where you want simple, precise timing per hold.",
      notFor:
        "You need interval rounds or multi-phase workout structures. Use Stretch Timer or Workout Timer for more workout-style flows.",
      links: [
        { label: "Stretch Timer", href: "/stretch-timer" },
        { label: "Rest Timer", href: "/rest-timer" },
      ],
    },
    {
      title: "Hands-free large display for a calm space",
      description:
        "Go fullscreen and keep controls minimal. Tap the time to start or pause, or use Space. Enable End chime if you want a finish cue without checking the screen.",
      forWho:
        "Meditation rooms, classes, or any setup where the timer needs to be visible across a room.",
      notFor:
        "You want a presentation-focused clock or speaker timing tools. Use Presentation Timer for stage and talk timing.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Repeat short breathing blocks automatically (Loop)",
      description:
        "Turn Loop on to restart the countdown automatically at 0:00. This is useful for repeating short blocks without touching controls between rounds.",
      forWho:
        "People doing repeating breathwork windows or timed practice blocks.",
      notFor:
        "You need multiple independent timers running at once. Use Multiple Timers.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Breathing Timer", href: "/breathing-timer" },
      ],
    },
    {
      title: "Quiet countdown with a clear finish cue (End chime)",
      description:
        "Leave Sound on and enable End chime, but keep Final beeps off if you want a calm session that ends with a single gentle cue.",
      forWho:
        "Anyone who prefers silence during the session but wants a clear finish signal.",
      notFor:
        "You want an alarm-style alert. Use Alarm Timer for stronger alert behavior.",
      links: [
        { label: "Alarm Timer", href: "/alarm-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/meditation-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Meditation Timer",
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
            Use this page for a calm countdown for meditation, breathing blocks,
            or yoga. Choose a preset or set a custom time, then start. Use
            fullscreen for a clean, large display, and optionally enable sound,
            final beeps, end chime, or looping sessions.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Space</span> to
          start/pause, <span className="font-semibold text-[var(--ilt-text-primary)]">R</span>{" "}
          to reset, <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen, <span className="font-semibold text-[var(--ilt-text-primary)]">S</span>{" "}
          for sound, <span className="font-semibold text-[var(--ilt-text-primary)]">L</span> for
          loop, and <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to
          exit fullscreen. If shortcuts do nothing, click the timer card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

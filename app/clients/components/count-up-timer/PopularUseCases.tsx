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
      title: "Track meeting time (with checkpoints)",
      description:
        "Start when the meeting begins, then hit Lap for agenda transitions, speaker changes, or decision moments. Use fullscreen when sharing a screen so everyone can see elapsed time clearly.",
      forWho:
        "Standups, interviews, client calls, or workshops where you want visible elapsed time plus a simple record of checkpoints.",
      notFor:
        "If you need a countdown to a hard stop. Use Countdown Timer or Presentation Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Work sessions with interruptions (pause and resume)",
      description:
        "Use Start/Pause to measure true focused time. Pause when interrupted, resume when you’re back. Add laps to mark milestones like “first draft done” or “review started.”",
      forWho:
        "Deep work, studying, coding, writing, or anything where interruptions happen and you want clean elapsed time.",
      notFor:
        "If you want structured work/rest cycles. Use Pomodoro Timer or Focus Session Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
    {
      title: "Track sets/rounds in training (laps = splits)",
      description:
        "Start at the first rep, then press Lap at the end of each set/round to capture splits. Fullscreen keeps the timer readable from a distance between efforts.",
      forWho:
        "Strength training, circuits, conditioning, and any workout where you want per-round timing without building a full interval plan.",
      notFor:
        "If you need programmed intervals (work/rest/rounds). Use HIIT Timer, Tabata Timer, or EMOM Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "EMOM Timer", href: "/emom-timer" },
      ],
    },
    {
      title: "Speedrun or practice attempts (lap milestones)",
      description:
        "Use the timer as an on-screen run clock. Hit Lap at key splits (level complete, checkpoint reached) so you can review pacing while keeping the display simple.",
      forWho:
        "Speedruns, rehearsals, drills, or practice attempts where you want quick split marking without extra setup.",
      notFor:
        "If you want a dedicated page tailored for speedruns. Use Speedrun Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Speedrun Timer", href: "/speedrun-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Lab timing (simple, visible elapsed time)",
      description:
        "Start at t=0, then use laps to mark key actions (mixing start, incubation start, transfer). Fullscreen keeps the display readable across the bench or on a shared screen.",
      forWho:
        "Experiments, classroom demos, and any process where you need clear elapsed time plus lightweight checkpoints.",
      notFor:
        "If you need a countdown for incubation or reaction time. Use Lab Timer or Countdown Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Lab Timer", href: "/lab-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Glanceable fullscreen timing (hands-off control)",
      description:
        "Press F for fullscreen to get big digits. In fullscreen, tap/click the time to start or pause without hunting for buttons. Use it as a clean on-screen clock for the room.",
      forWho:
        "Shared displays, classroom/projector use, or timing across the room where readability matters most.",
      notFor: "If you only want a big countdown. Use Fullscreen Timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
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
    name: "Common count up timer scenarios",
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use this page to track elapsed time with a clean, readable display.
            Start/pause anytime, record laps (splits), reset to 0, and go
            fullscreen for big digits on a shared screen or from across the
            room.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                  <a
                    key={l.href}
                    href={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> For shared
          screens, go{" "}
          <span className="font-semibold text-slate-900">Fullscreen</span> and
          use <span className="font-semibold text-slate-900">Lap</span> to mark
          transitions (agenda items, rounds, checkpoints). If shortcuts do
          nothing, click the timer card once to focus it.
        </div>
      </div>
    </section>
  );
}

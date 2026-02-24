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
      title: "Practice reading binary time (hide the answer)",
      description:
        "Turn on Practice mode to hide the decimal time, decode the bits, then reveal to check yourself.",
      forWho:
        "Anyone practicing binary decoding who wants quick reps with an instant self-check.",
      notFor:
        "If you want the current time in binary (a clock). Use Binary Clock instead.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Hexadecimal Clock", href: "/hexadecimal-clock" },
      ],
    },
    {
      title: "Run a binary stopwatch (count up)",
      description:
        "Use Stopwatch mode to track elapsed time while reading hours, minutes, and seconds as pure binary fields.",
      forWho:
        "Workouts, labs, tasks, or any timing where you want a binary view without extra setup.",
      notFor:
        "If you want a standard stopwatch display. Use Stopwatch instead.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count Up Timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Run a binary countdown timer (presets + custom seconds)",
      description:
        "Use Timer mode to count down from a preset or custom duration. Optional soft alarm at zero.",
      forWho:
        "Intervals, cooking, breaks, or any countdown where you want a binary readout.",
      notFor:
        "If you need multiple independent countdowns. Use Multiple Timers instead.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Use weights to decode quickly (no guessing)",
      description:
        "Turn on Weights to show the value of each bit row. Add the lit weights to read each field.",
      forWho:
        "Anyone who wants a fast, reliable way to interpret the grid while learning or timing.",
      notFor:
        "If you already read binary fluently and want maximum minimalism. Turn Weights off.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Time Calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Go fullscreen for distance viewing (desk / wall / stream)",
      description:
        "Fullscreen gives you a clean, high-contrast layout. In fullscreen, tap/click the display to start or pause.",
      forWho:
        "Second monitor displays, streaming setups, classrooms, and distance viewing.",
      notFor:
        "If you want a generic fullscreen countdown with simpler UI. Use Fullscreen Timer.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Dim the display (low light or reduced glare)",
      description:
        "Use Dim mode to reduce glare while keeping the bits readable, especially in fullscreen.",
      forWho:
        "Night setups, low-light rooms, or anyone who wants less brightness without losing contrast.",
      notFor:
        "If you want a completely silent / minimal timer experience. Use Silent Timer.",
      links: [
        { label: "Binary Stopwatch", href: "/binary-stopwatch" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
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
    name: "Common binary stopwatch scenarios",
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
            Use this page when you want a stopwatch or countdown that displays
            time as pure binary. Turn on Weights for easier decoding, and use
            Practice mode when you want to hide the decimal time and self-check.
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
          <span className="font-semibold text-slate-900">Tip:</span> For fastest
          decoding, turn{" "}
          <span className="font-semibold text-slate-900">Weights</span> on. For
          clean distance viewing, use{" "}
          <span className="font-semibold text-slate-900">Fullscreen</span> and{" "}
          <span className="font-semibold text-slate-900">Dim</span> if needed.
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (LAB TIMER intent)
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
      title: "Reaction timing with a lap-based stopwatch",
      description:
        "Start the stopwatch and press L at each event to capture split times (time since the previous lap) plus the running total. Use Reset between trials to get a clean run.",
      forWho:
        "Anyone measuring reaction timing, repeated trials, or event-to-event intervals where splits matter.",
      notFor:
        "You want a dedicated reaction-speed test with built-in scoring. Use Reaction Time Test.",
      links: [
        { label: "Reaction Time Test", href: "/reaction-time-test" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Repeat the same timed step in a protocol (looping countdown)",
      description:
        "Set a step duration in seconds, turn Repeat step on, then Start. The countdown will restart automatically at zero, ideal for repeated mix/wait/invert/check cycles.",
      forWho:
        "Step-based protocols where the same timed action repeats many times and you want an automatic loop.",
      notFor:
        "You need different step lengths in sequence. Use Multiple Timers for separate timers per step.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "One-off timed steps (single countdown, no repeat)",
      description:
        "Pick a common step time (like 30s, 60s, 90s) or enter a custom value, keep Repeat off, then Start. Reset returns the countdown to your step duration for the next run.",
      forWho:
        "Single timed steps such as short waits, spins, checks, or transfers where you don’t want looping.",
      notFor:
        "You primarily need lap splits and totals. Use the stopwatch section on this page.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Big-screen bench display (fullscreen step timer)",
      description:
        "Toggle fullscreen for the countdown box to maximize readability across the room. In fullscreen you can tap/click the timer area to start or pause, and keep controls in the top bar.",
      forWho:
        "Benchtop, wall display, or shared screen use where the timer needs to be readable at a distance.",
      notFor:
        "You want fullscreen for a general countdown page with fewer lab-specific controls. Use Fullscreen Timer.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Audible step transitions (final beeps + completion cue)",
      description:
        "Turn Sound on, then enable Final beeps to get a short beep each second during the last 5 seconds before zero, plus a completion cue at zero. Useful when you’re hands-busy and can’t stare at the screen.",
      forWho:
        "Hands-busy steps where you need an audible heads-up before the step ends.",
      notFor: "You need a fully silent setup. Use Silent Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Parallel steps or staggered timers",
      description:
        "If you’re running multiple things at once (staggered incubations, overlapping checks), switch to Multiple Timers so each step has its own independent timer and controls.",
      forWho:
        "Any workflow where a single repeating step timer is not enough and you need concurrent timers.",
      notFor:
        "You only need one step time repeated or a single stopwatch run. Stay on this page.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Lab Timer", href: "/lab-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/lab-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Lab Timer",
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use this page for lab-style timing: a precise stopwatch with lap
            splits for reaction timing and trials, plus a repeatable step
            countdown you can run fullscreen. Enable sound cues if you want
            hands-busy alerts.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
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
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">Space</span> to
          start/pause the stopwatch,{" "}
          <span className="font-semibold text-slate-900">L</span> for laps,{" "}
          <span className="font-semibold text-slate-900">C</span> to start/pause
          the countdown, <span className="font-semibold text-slate-900">T</span>{" "}
          to toggle repeat,{" "}
          <span className="font-semibold text-slate-900">R</span> to reset both,{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-slate-900">Esc</span> to exit. If
          shortcuts do nothing, click the Lab Timer card once to focus it.
        </div>
      </div>
    </section>
  );
}

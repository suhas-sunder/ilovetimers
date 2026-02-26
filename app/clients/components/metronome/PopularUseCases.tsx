import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (METRONOME intent)
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
      title: "Basic tempo practice (steady BPM)",
      description:
        "Set your BPM, press Start, and play along with a clean tick and visual pulse. Use arrow keys to nudge tempo without breaking focus, and go fullscreen for a bigger display.",
      forWho:
        "Instrument practice where you want a stable tempo reference and quick tempo adjustments.",
      notFor:
        "You only need to figure out BPM from tapping. Use BPM Tapper instead.",
      links: [
        { label: "BPM Tapper", href: "/bpm-tapper" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Match a song quickly (Tap Tempo)",
      description:
        "Tap the beat a few times to set BPM automatically, then start the metronome to lock it in. Great for matching a groove before you drill parts at tempo.",
      forWho:
        "Learning songs by ear and you want to start by matching the original tempo fast.",
      notFor:
        "You want a countdown timer for practice blocks. Use Countdown Timer.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "BPM Tapper", href: "/bpm-tapper" },
      ],
    },
    {
      title: "Subdivision drills (eighths, triplets, sixteenths)",
      description:
        "Keep BPM steady and switch subdivisions to tighten timing between beats. Use eighth notes for groove consistency, triplets for swing feel, or sixteenths for fast precision work.",
      forWho:
        "Timing cleanup: picking patterns, strumming consistency, drum rudiments, or tight rhythmic entrances.",
      notFor:
        "You need multiple independent clocks/timers at once. Use Multiple Timers.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Count measures clearly (accent the downbeat)",
      description:
        "Turn on Accent beat 1 to make the first beat of each bar pop. This helps you feel the top of the measure while practicing longer phrases.",
      forWho:
        "Counting bars while practicing riffs, exercises, or ensemble parts where measure starts matter.",
      notFor:
        "You want an interval workout timer instead of a music tempo tool. Use HIIT Timer or Tabata Timer.",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Loud room or quiet room (sound + volume control)",
      description:
        "Switch between Click, Wood, and Beep and set volume for your space. If you can’t hear clicks on small speakers, Beep usually cuts through better. If you need softer, Wood is more subtle.",
      forWho:
        "Practicing on different devices and environments (phone speakers, studio monitors, headphones).",
      notFor:
        "You want a silent visual-only timer for presentations or classrooms. Use Silent Timer or Visual Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Big practice view (fullscreen, no distractions)",
      description:
        "Go fullscreen for a large BPM display and pulse. In fullscreen, click or tap the display to start or stop quickly, and use Esc to exit.",
      forWho:
        "Practice rooms, rehearsals, or situations where you want a big, readable tempo reference at a distance.",
      notFor:
        "You want a big generic timer display rather than a metronome. Use Fullscreen Timer.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Share or save a setup (copy settings)",
      description:
        "Use Copy (or press C) to copy your current setup so you can share a specific BPM, time signature, subdivision, sound, and volume with someone else, or keep notes for your next session.",
      forWho:
        "Teachers, students, bands, and anyone who wants a repeatable tempo setup without taking screenshots.",
      notFor:
        "You want to calculate total time spent across practice blocks. Use Time Calculator instead.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/metronome"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Online Metronome",
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
            Use this page to practice with a steady tempo. Set BPM, tap tempo,
            choose time signature and subdivisions, add a downbeat accent, and
            switch to fullscreen for a big visual pulse.
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
          <span className="font-semibold text-slate-900">Space</span> (or{" "}
          <span className="font-semibold text-slate-900">Enter</span>) to
          start/stop, <span className="font-semibold text-slate-900">T</span> to
          tap tempo, <span className="font-semibold text-slate-900">↑/↓</span>{" "}
          for BPM (Shift for ±5),{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, <span className="font-semibold text-slate-900">C</span> to
          copy, and <span className="font-semibold text-slate-900">Esc</span> to
          exit fullscreen.
        </div>
      </div>
    </section>
  );
}

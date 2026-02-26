import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MEETING TIMER intent)
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
      title: "Agenda timeboxing (one timer per topic)",
      description:
        "Pick a preset (like 5m, 10m, or 15m) for the current agenda item, press Start, and switch to fullscreen so everyone can see the time remaining. When you move to the next topic, change minutes to reset instantly.",
      forWho:
        "Meetings with a clear agenda where you want a visible countdown and quick resets between topics.",
      notFor:
        "You want to track elapsed time and record how long each item took. Use Meeting Count Up Timer instead.",
      links: [
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Daily standup time cap (keep it tight)",
      description:
        "Run a short countdown for each segment or speaker. Presets make it fast to keep everyone aligned without negotiating the schedule mid-standup.",
      forWho:
        "Teams that want a firm end point for standups with a simple, visible timer.",
      notFor:
        "You need a flexible stopwatch-style view. Use Count Up Timer or Stopwatch.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Client call sections (hard stop for each block)",
      description:
        "Timebox intro, requirements, demo, Q&A, and next steps. Turn on Final beeps for a clear wrap-up cue in the last 5 seconds.",
      forWho:
        "Anyone who runs structured calls and wants predictable pacing and clean transitions.",
      notFor:
        "You want elapsed-time splits by section. Use Meeting Count Up Timer.",
      links: [
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Room display (big fullscreen countdown)",
      description:
        "Go fullscreen for a large display visible across the room. In fullscreen, tap or click the time to start or pause, and keep the top bar controls available for quick access.",
      forWho:
        "In-person meetings where the timer must be readable at a distance.",
      notFor:
        "You want a minimal fullscreen-only countdown with fewer controls. Use Fullscreen Timer.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Facilitation segments (repeat the same timebox)",
      description:
        "Set a standard timebox (for example 7 minutes) and use Reset to run it repeatedly for multiple speakers or round-robin discussion, without retyping minutes each time.",
      forWho:
        "Facilitators who want consistent per-person or per-topic limits.",
      notFor:
        "You need multiple timers running at once for parallel groups. Use Multiple Timers.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Break handling (pause without losing the timebox)",
      description:
        "Pause during interruptions or short breaks, then resume with the same remaining time when you’re back. This keeps the timebox fair without restarting.",
      forWho:
        "Meetings that need a strict cap but still have occasional pauses.",
      notFor:
        "You want the countdown to continue regardless of breaks. Use Online Timer and leave it running.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Silent or audible meetings (choose your cue)",
      description:
        "Run the meeting quietly with Sound off, or enable Sound and optional Final beeps to make the cutoff obvious without someone watching the clock.",
      forWho:
        "Teams that want control over whether the timer is silent or provides audio cues.",
      notFor:
        "You need an alarm-style tool that notifies you later. Use Alarm Timer.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/meeting-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Meeting Timer",
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
            Use this page to run a clear countdown for agenda timeboxing. Pick a
            preset or custom minutes, go fullscreen for a large room display,
            and optionally enable Sound and Final beeps for clear wrap-up cues.
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
          start/pause, <span className="font-semibold text-slate-900">R</span>{" "}
          to reset, <span className="font-semibold text-slate-900">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-slate-900">Esc</span> to exit
          fullscreen. In fullscreen, you can also tap or click the time display
          to start or pause.
        </div>
      </div>
    </section>
  );
}

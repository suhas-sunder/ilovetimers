import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
   Schema: ItemList (scenarios -> best matching timer/route)
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
      title: "AMRAP workouts (time cap + manual score)",
      description:
        "Run a clean countdown with optional prep, then track rounds and reps while you work.",
      forWho:
        "CrossFit-style AMRAPs, conditioning finishers, partner workouts, coaching sessions where you want a big visible timer and a simple score.",
      notFor:
        "If you need automatic rep detection, workout logging, or analytics. This page is a timer + manual scoring display.",
      links: [
        { label: "AMRAP timer", href: "/amrap-timer" },
        { label: "EMOM timer", href: "/emom-timer" },
        { label: "Round timer", href: "/round-timer" },
      ],
    },
    {
      title: "Intervals (work/rest rounds that advance automatically)",
      description:
        "Use a structured interval timer when you want rounds and phases to auto-run without manual scoring.",
      forWho:
        "HIIT, circuits, coaching classes, and anyone who wants work/rest cycles handled automatically.",
      notFor:
        "If you specifically need a single time cap plus rounds/reps scoring. Use the AMRAP timer for that.",
      links: [
        { label: "HIIT timer", href: "/hiit-timer" },
        { label: "Tabata timer", href: "/tabata-timer" },
        { label: "Workout timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Meetings that run on schedule",
      description:
        "Keep segments tight with a visible countdown you can start/pause fast.",
      forWho:
        "Facilitators, interviewers, team leads, anyone running timed agenda blocks.",
      notFor:
        "If you need shared control, calendar automation, or attendee tracking. This is just a timer.",
      links: [
        { label: "Meeting timer", href: "/meeting-timer" },
        { label: "Presentation timer", href: "/presentation-timer" },
        { label: "Online timer", href: "/online-timer" },
      ],
    },
    {
      title: "Presentations, classrooms, exams",
      description:
        "Fullscreen gives a large, readable countdown for the whole room.",
      forWho: "Teachers, presenters, speakers, exam proctors.",
      notFor:
        "If you need slide cues or slide-deck integrations. This is only timing.",
      links: [
        { label: "Classroom timer", href: "/classroom-timer" },
        { label: "Exam timer", href: "/exam-timer" },
        { label: "Fullscreen timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Silent or discreet timing",
      description:
        "Run a countdown with sound off for quiet rooms or recordings.",
      forWho: "Libraries, recording sessions, meditation, quiet classrooms.",
      notFor:
        "If you rely on audio cues, vibration alerts, or notifications while away from the screen.",
      links: [
        { label: "Silent timer", href: "/silent-timer" },
        { label: "Visual timer", href: "/visual-timer" },
        { label: "Meditation timer", href: "/meditation-timer" },
      ],
    },
    {
      title: "Focus blocks (work + breaks)",
      description:
        "Use structured work/break cycles without extra distractions.",
      forWho: "Students and knowledge workers who benefit from focus sessions.",
      notFor:
        "If you want task lists, site blocking, habit tracking, or analytics. This is just timing.",
      links: [
        { label: "Pomodoro timer", href: "/pomodoro-timer" },
        { label: "Study timer", href: "/study-timer" },
        { label: "Focus session timer", href: "/focus-session-timer" },
      ],
    },
    {
      title: "Timing tasks with elapsed time and splits",
      description:
        "Track elapsed time and record splits for practice, drills, or experiments.",
      forWho: "Training, lab timing, speed practice, repeatable drills.",
      notFor: "If you need exports, multi-run comparisons, or advanced stats.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Lab timer", href: "/lab-timer" },
        { label: "Speedcubing timer", href: "/speedcubing-timer" },
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
    name: "Common timer scenarios",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      // point to the first recommended destination
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
            Quick guidance on which timer to use based on what you’re doing.
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

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Note:</span> Browser
          timers can’t guarantee alerts if you close the tab or your device puts
          the browser to sleep. For workouts, keep this page visible or use
          fullscreen.
        </div>
      </div>
    </section>
  );
}

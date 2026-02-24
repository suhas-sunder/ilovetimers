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
      title: "Run a big, clear countdown for transitions",
      description:
        "Pick a preset (example: 2m, 5m, 10m), add an optional label like “Cleanup” or “Switch Stations,” then press Space to start. Use +1 min if you need a quick extension without restarting.",
      forWho:
        "Classroom transitions, cleanup, lining up, rotating stations, and any “we have X minutes” moment.",
      notFor:
        "If you need an assessment-focused layout or stricter exam pacing. Use Exam Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Exam Timer", href: "/exam-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Use fullscreen on a smartboard or projector",
      description:
        "Click Fullscreen (or press F). The display becomes large and uncluttered for the whole room. In fullscreen, use on-screen controls or Space/R/+/- to run the timer without leaving the board.",
      forWho:
        "Teachers presenting from the front, classrooms using projectors, and anyone who needs maximum readability from a distance.",
      notFor:
        "If you want the absolute simplest big countdown with fewer options. Use Fullscreen Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Give a “last seconds” warning without constant reminders",
      description:
        "Turn Sound on, enable Final beeps, and optionally keep End chime on. Students get a clear cue in the last few seconds and a distinct signal when time is up.",
      forWho:
        "Timed writing, quick checks, independent work, and any activity where you want students to wrap up without repeated verbal prompts.",
      notFor:
        "If your environment must be fully silent. Use Silent Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Adjust time on the fly (without restarting)",
      description:
        "Use −1 min / +1 min / +5 min while running. You can also press + to add 1 minute or - to subtract 1 minute. The countdown updates immediately and keeps going.",
      forWho:
        "When you decide to extend a task, shorten a transition, or recover time after interruptions.",
      notFor:
        "If you want multiple independent timers at once. Use Multiple Timers instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Meeting Timer", href: "/meeting-timer" },
      ],
    },
    {
      title: "Label the timer so students know the task",
      description:
        "Set a short label like “Do Now,” “Quiz,” “Partner Work,” or “Pack Up.” The label stays above the time and helps cut down on repeated instructions.",
      forWho:
        "Classrooms using repeated routines, stations, or timed segments where the purpose matters as much as the remaining time.",
      notFor:
        "If you need a dedicated timer per segment in a routine. Use Pomodoro Timer or Round Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Run timed blocks for study or independent work",
      description:
        "Set a longer preset (example: 20m, 30m, 45m), go fullscreen, and keep Sound off if you want a quiet room. Use Reset between blocks to quickly run the same duration again.",
      forWho:
        "Independent work time, reading blocks, quiet study sessions, or structured in-class work periods.",
      notFor:
        "If you want a built-in work/break cycle. Use Study Timer, Break Timer, or Pomodoro Timer instead.",
      links: [
        { label: "Classroom Timer", href: "/classroom-timer" },
        { label: "Study Timer", href: "/study-timer" },
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
    name: "Common classroom timer scenarios",
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
            Use this page for a classroom-friendly countdown that reads clearly
            from across the room. Pick a preset or set custom minutes, add an
            optional label, go fullscreen for smartboards and projectors, and
            use quick adjust when you need to change time mid-activity.
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
          <span className="font-semibold text-slate-900">Tip:</span> For the
          simplest “front of room” setup, go{" "}
          <span className="font-semibold text-slate-900">Fullscreen</span> and
          keep your most-used presets ready. If you use sound cues, start the
          timer once first so the browser allows audio.
        </div>
      </div>
    </section>
  );
}

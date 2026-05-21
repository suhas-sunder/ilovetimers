import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Exam Timer intent)
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
      title: "Timed section practice (single block)",
      description:
        "Pick the exact minutes for a section, go fullscreen, and run a clean countdown you can start/pause with the keyboard. Use a 5-minute warning to keep pacing without checking constantly.",
      forWho:
        "Anyone doing mock sections, timed drills, or practice sets with a fixed time limit.",
      notFor:
        "You need a calendar-based countdown to a specific date/time. Use an event countdown instead.",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Proctored-style setup (big display, minimal distraction)",
      description:
        "Run fullscreen on a second monitor or shared screen. Tap/click the time to start/pause and use simple keyboard controls to avoid hunting for buttons mid-session.",
      forWho:
        "People simulating test conditions, classrooms, or group practice where readability matters.",
      notFor:
        "You need a multi-step schedule (sections + breaks) that runs automatically. Use a structured interval timer.",
      links: [
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Round Timer", href: "/round-timer" },
      ],
    },
    {
      title: "Quiet room timing (no audio)",
      description:
        "Leave Sound off for a purely visual countdown. Fullscreen keeps the time easy to see without noisy cues.",
      forWho: "Libraries, shared spaces, or anyone who wants silent timing.",
      notFor:
        "You specifically want a silent-by-design page with zero sound controls. Use the silent timer page.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Visual Timer", href: "/visual-timer" },
      ],
    },
    {
      title: "Pacing cues without distraction (5m / 1m warnings)",
      description:
        "Enable warning beeps at 5 minutes and/or 1 minute remaining to guide pacing. Keep Final beeps off unless you want a sharper end cue.",
      forWho:
        "Anyone who wants a couple of reliable checkpoints near the end of a section.",
      notFor:
        "You want frequent reminders or a repeating interval beep throughout. Use a workout-style interval tool.",
      links: [
        { label: "HIIT Timer", href: "/hiit-timer" },
        { label: "Tabata Timer", href: "/tabata-timer" },
      ],
    },
    {
      title: "Back-to-back sections with quick resets",
      description:
        "Use presets and Reset to rerun the same section timing repeatedly. Switch presets between sections (for example 25m → 10m → 25m) without building a full schedule.",
      forWho: "Practice sessions made of repeated timed blocks.",
      notFor:
        "You need multiple timers visible at the same time (for example, timing two groups). Use multiple timers.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Study Timer", href: "/study-timer" },
      ],
    },
    {
      title: "Instructor or tutor timing (shared screen)",
      description:
        "Fullscreen on a projector or screen share so everyone sees the same time remaining. Start/pause quickly with Space and keep the session moving.",
      forWho: "Tutors, study groups, classrooms, and live practice sessions.",
      notFor:
        "You need to track time upward from zero during discussion or Q&A. Use a count up timer instead.",
      links: [
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Classroom Timer", href: "/classroom-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/exam-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Exam Timer",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="space-y-4">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page for a clean exam-style countdown with presets, custom
            minutes, fullscreen, optional sound warnings, and keyboard
            shortcuts.
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
          to reset, and <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
          for fullscreen. If shortcuts do nothing, click the timer card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

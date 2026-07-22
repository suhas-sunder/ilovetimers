import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Focus Session Timer intent)
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
      title: "Single work block (one task, one timer)",
      description:
        "Set one session length and commit to a single task. Use Start/Pause as needed, and finish with a short break suggestion.",
      forWho:
        "Anyone who wants a simple, single-session countdown without cycles or extra steps.",
      notFor:
        "You want a work/break cycle that repeats automatically. Use the Pomodoro timer instead.",
      links: [
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Productivity Timer", href: "/productivity-timer" },
        { label: "Break Timer", href: "/break-timer" },
      ],
    },
    {
      title: "Fullscreen focus (big, clean countdown)",
      description:
        "Go fullscreen for a large, minimal display. In fullscreen you can click/tap the timer to start or pause quickly.",
      forWho:
        "Second monitors, screen shares, classrooms, or anyone who wants a big readable countdown.",
      notFor:
        "You want multiple timers on screen at once. Use Multiple Timers instead.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Silent focus (no audio, no beeps)",
      description:
        "Run a focus session without sound. If you prefer a completely silent experience, use the dedicated silent timer route.",
      forWho:
        "Shared spaces, libraries, meetings, or anyone who keeps audio off.",
      notFor:
        "You specifically want end-of-session beeps or final countdown beeps. Stay on this page and enable Sound.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Quick study sprint (short sessions, quick reset)",
      description:
        "Use 10 to 30 minute sessions to push through a task, then reset and run another sprint when you’re ready.",
      forWho:
        "Studying, reading, writing, or short execution bursts where you want a clear stop point.",
      notFor:
        "You want structured interval formats for training. Use HIIT or Tabata instead.",
      links: [
        { label: "Study Timer", href: "/study-timer" },
        { label: "HIIT Timer", href: "/hiit-timer" },
      ],
    },
    {
      title: "Meeting prep window (timebox before a call)",
      description:
        "Set a fixed prep window (for example 10 to 20 minutes) to outline notes, review docs, or draft an agenda before your meeting starts.",
      forWho:
        "People who timebox prep so a meeting doesn’t consume the entire hour.",
      notFor:
        "You need a timer that counts up during the meeting. Use the meeting count-up timer.",
      links: [
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Time Blocking Clock", href: "/time-blocking-clock" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
      ],
    },
    {
      title: "Track time spent instead of remaining time",
      description:
        "If you want to measure how long you’ve been working (not how long is left), use a count-up timer or stopwatch.",
      forWho:
        "Work sessions where you prefer elapsed-time tracking and manual stop points.",
      notFor:
        "You need a fixed end time and a finish prompt. Use this focus session countdown instead.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/focus-session-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Focus Session Timer",
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
            Use this page to run a single work countdown: choose a session
            length, start/pause, go fullscreen, and optionally enable sound and
            final beeps.
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
          fullscreen, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> to toggle
          sound. If shortcuts do nothing, click the timer card once to focus it.
        </div>
      </div>
    </section>
  );
}

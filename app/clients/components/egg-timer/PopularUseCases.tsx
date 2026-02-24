import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (water-reminder intent)
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
      title: "Set-and-forget hydration reminders (repeating loop)",
      description:
        "Pick an interval and let the timer loop all day while the tab stays open. Each time it hits zero, it reminds you and restarts automatically.",
      forWho:
        "Anyone who wants a simple repeating reminder during desk work, study sessions, or long days.",
      notFor:
        "Reminders that continue after you close the tab or lock your device (use device/app notifications for that).",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Quiet reminders (sound off, visual check-ins)",
      description:
        "Keep Sound off and use the big countdown as a gentle visual prompt. Fullscreen makes it easy to glance at without distraction.",
      forWho:
        "Shared spaces, quiet rooms, libraries, and anyone who prefers no audio alerts.",
      notFor:
        "You need an audible cue at a precise moment regardless of browser throttling (use an alarm-style tool).",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Alarm Timer", href: "/alarm-timer" },
      ],
    },
    {
      title: "Immediate nudge (Remind now)",
      description:
        "If you missed a cycle or want to reset your rhythm, use Remind now to trigger a reminder instantly and restart a fresh interval from that moment.",
      forWho:
        "Anyone who wants a quick “do it now” prompt without changing settings.",
      notFor:
        "Triggering reminders while paused (Remind now only works while running).",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Full-screen desk display (tap to start/pause)",
      description:
        "Run fullscreen on a second monitor or tablet for a clean, readable countdown. Tap/click the display to start or pause quickly.",
      forWho:
        "Desk setups, standing desks, shared screens, or anyone who wants a big “always visible” timer.",
      notFor:
        "Complex workout structures or rounds-based routines (use a workout timer).",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Workout Timer", href: "/workout-timer" },
      ],
    },
    {
      title: "Multiple habits or staggered reminders",
      description:
        "If you want hydration plus other repeating prompts (stretch, break, focus), use multiple timers so you can run several countdowns at once.",
      forWho:
        "People who want more than one repeating reminder running side-by-side.",
      notFor:
        "A single simple hydration loop (this page is simpler if you only need one reminder).",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Break Timer", href: "/break-timer" },
      ],
    },
    {
      title: "Short, structured sessions (instead of repeating)",
      description:
        "If you prefer a fixed session length with an end point (rather than looping forever), a countdown or focus timer may fit better.",
      forWho:
        "People who want a single timer that ends, or a work/break rhythm.",
      notFor:
        "Continuous repeating reminders throughout the day (use this page for that).",
      links: [
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/water-reminder-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Water Reminder Timer",
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
            Use this page for repeating “drink water” reminders while the tab is
            open. Choose an interval, start the loop, toggle sound, go
            fullscreen, and use Remind now when you want an immediate prompt.
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
                  <a
                    key={`${s.title}-${l.href}`}
                    href={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">Space</span> to
          start/pause, <span className="font-semibold text-slate-900">N</span>{" "}
          to remind now, <span className="font-semibold text-slate-900">S</span>{" "}
          to toggle sound, and{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen. If shortcuts do nothing, click the timer card once to
          focus it.
        </div>
      </div>
    </section>
  );
}

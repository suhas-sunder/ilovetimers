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
      title: "Wall / projector clock for a room",
      description:
        "Go fullscreen to show a big, readable clock from across the room. Toggle seconds depending on how precise you need the display to be.",
      forWho:
        "Classrooms, workshops, studios, gyms, front desks, or any space where people keep asking “what time is it?”",
      notFor:
        "If you need an elapsed timer or a countdown. Use Stopwatch, Count Up Timer, or Countdown Timer instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Timestamping notes during meetings",
      description:
        "Keep the clock visible while you take notes. When something matters, press Copy to paste a clean timestamp (time + date) into your doc or chat.",
      forWho:
        "Meeting notes, interviews, incident logs, support calls, or anywhere you want quick “what time was that?” inserts.",
      notFor:
        "If you need to convert scheduled times between people in different zones. Use Time Zone Converter or World Clock instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Coordinating with another city fast",
      description:
        "Switch the main display to Toronto, New York, or London and glance at the tiles for other cities. It’s the quick “what time is it there right now?” check.",
      forWho:
        "Remote teams, family across time zones, travel planning, or scheduling messages and calls without mental math.",
      notFor:
        "If you need to convert a specific future time (like “3:30 PM in London”). Use Time Zone Converter instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "World Clock", href: "/world-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "24-hour mode for schedules and logs",
      description:
        "Turn on 24-hour time for a clean, unambiguous display. Keep seconds off if you only care about minute-level planning.",
      forWho:
        "Shift work, labs, training logs, dispatch/operations boards, or any environment that prefers 24-hour time.",
      notFor:
        "If you specifically need UTC or a standardized reference time. Use UTC Clock or Atomic Clock instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Atomic Clock", href: "/atomic-clock" },
      ],
    },
    {
      title: "Streaming / recording reference clock",
      description:
        "Use seconds-on for precise cues and quick copy for labeling takes or notes. Fullscreen keeps the display clean and readable.",
      forWho:
        "Streaming setups, recording sessions, classrooms on video, or anyone who wants a visible “time now” reference.",
      notFor:
        "If you need a purpose-built countdown or interval timer during the stream. Use Fullscreen Timer, Countdown Timer, or Pomodoro Timer instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
      ],
    },
    {
      title: "Sanity-checking device time quickly",
      description:
        "If something feels off, use this page as a clean view of what your device/browser currently believes the time and timezone are. Toggle seconds for closer checking.",
      forWho:
        "Anyone troubleshooting calendar issues, missed reminders, or timezone confusion on a laptop/tablet/phone.",
      notFor:
        "If you need a network-synced reference independent of your device clock. Use Atomic Clock instead.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "Atomic Clock", href: "/atomic-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
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
    name: "Common current local time scenarios",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.links[0]?.href,
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
            Use this page to see your local time in a big, readable clock.
            Toggle seconds, switch 12/24-hour time, go fullscreen, and copy a
            clean timestamp when you need it.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                  <a
                    key={l.href}
                    href={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For a room
          display, use <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>{" "}
          to go fullscreen. For quick timestamping, press{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy the
          current time + date. If shortcuts do nothing, click the clock card
          once to focus it.
        </div>
      </div>
    </section>
  );
}

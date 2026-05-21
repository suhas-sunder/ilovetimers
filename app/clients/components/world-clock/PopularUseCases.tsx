import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (WORLD CLOCK intent)
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
      title: "Scheduling across multiple time zones (quick sanity check)",
      description:
        "Add the cities you coordinate with most and keep the list visible while you propose times. Toggle 24-hour time if you want fewer AM/PM mistakes, and keep seconds off for a calmer display.",
      forWho:
        "Remote teams, recruiters, clients, and anyone booking meetings across regions.",
      notFor:
        "You need to convert a specific planned time (not “right now”). Use Time Zone Converter instead.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Always-on world clock on a second monitor",
      description:
        "Go fullscreen to make the times readable from a distance. Keep a small set of cities that matter daily (for example: your local time, HQ, and two teammate zones).",
      forWho:
        "People who work with global teams and want an at-a-glance dashboard.",
      notFor:
        "You only want one big clock display. Use Digital Clock or Current Local Time instead.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Travel planning: home time + destination time",
      description:
        "Keep your home city and destination visible to avoid calling or messaging at the wrong hour. Toggle seconds on if you’re coordinating time-critical check-ins.",
      forWho:
        "Travelers, people coordinating airport pickups, and families across time zones.",
      notFor:
        "You need sunrise/sunset timing instead of clock time. Use Sunrise/Sunset Clock instead.",
      links: [
        { label: "Sunrise Sunset Clock", href: "/sunrise-sunset-clock" },
        { label: "World Clock", href: "/world-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Live time references for broadcasts, streams, or events",
      description:
        "Use the world clock as a quick reference while you’re on a call or live session. Fullscreen makes it easy to glance at without switching apps.",
      forWho: "Hosts, moderators, and event organizers working across regions.",
      notFor:
        "You need a specific event countdown timer. Use Event Countdown instead.",
      links: [
        { label: "Event Countdown", href: "/event-countdown" },
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Coordination anchor: keep UTC visible alongside local times",
      description:
        "Add UTC (via the UTC Clock) as your anchor reference, and compare it with local times for quick coordination. This is useful when teams write schedules in UTC.",
      forWho:
        "Teams that communicate schedules in UTC or use UTC in tooling and logs.",
      notFor: "You only need UTC and nothing else. Use UTC Clock instead.",
      links: [
        { label: "UTC Clock", href: "/utc-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "Epoch Unix Time Clock", href: "/epoch-unix-time-clock" },
      ],
    },
    {
      title: "Sharing “right now” across cities in one message",
      description:
        "Select the cities, press Copy, and paste the lines into chat or email. This helps when you want to confirm the current local time for several locations without screenshots.",
      forWho:
        "Anyone coordinating with multiple people in different locations.",
      notFor:
        "You need a specific scheduled time converted and explained. Use Time Zone Converter instead.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/world-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use World Clock",
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
            Live times across cities, fast add/remove, 12/24-hour and seconds
            toggles, copy to share, fullscreen display, and keyboard shortcuts.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Keep one{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">anchor</span> city
          (your local time or UTC), then add the few cities you coordinate with
          most. Use <span className="font-semibold text-[var(--ilt-text-primary)]">T</span> to
          toggle 24-hour time,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">S</span> for seconds,{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen.
        </div>
      </div>
    </section>
  );
}

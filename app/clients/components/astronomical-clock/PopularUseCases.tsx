import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
   Schema: ItemList (scenarios -> best matching clock/route)
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
      title: "Sunrise and sunset for a specific place",
      description:
        "Get today’s sunrise and sunset in the selected time zone by using your location or entering coordinates.",
      forWho:
        "Travel planning, outdoor activities, photographers, commuters, and anyone who wants today’s rise/set times for a specific location.",
      notFor:
        "If you only need a generic clock display with no location details. Use a standard clock instead.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "Sunrise sunset clock", href: "/sunrise-sunset-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Daylight vs twilight vs night right now",
      description:
        "See whether it’s daylight, civil twilight, nautical twilight, astronomical twilight, or night at your coordinates.",
      forWho:
        "Outdoor scheduling, stargazing setup, early-morning or evening routines, and anyone coordinating activities around twilight.",
      notFor:
        "If you need a countdown until an event time. Use an Event Countdown or a timer.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "Current local time", href: "/current-local-time" },
        { label: "Event countdown", href: "/event-countdown" },
      ],
    },
    {
      title: "Moon phase at a glance",
      description:
        "Check the current moon phase label with an illumination estimate alongside live time.",
      forWho:
        "Hikers, campers, photographers, skywatchers, and anyone who wants a quick “what phase is it” view.",
      notFor:
        "If you need a dedicated moon-only display. Use the Moon Phase Clock for a simpler view.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "Moon phase clock", href: "/moon-phase-clock" },
        { label: "World clock", href: "/world-clock" },
      ],
    },
    {
      title: "Fullscreen sky-aware wall display",
      description:
        "Put the astronomical clock on a big screen and keep a live day or night status with sunrise, sunset, and moon phase.",
      forWho:
        "Studios, classrooms, shared spaces, observatories, and anyone who wants a single always-on dashboard.",
      notFor:
        "If you only need a giant timer for activities or transitions. Use Fullscreen Timer.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "Online timer", href: "/online-timer" },
        { label: "Minimalist clock", href: "/minimalist-clock" },
      ],
    },
    {
      title: "Checking time and sun events across time zones",
      description:
        "Switch time zones to see local time and today’s sunrise and sunset for that zone’s date.",
      forWho:
        "Remote teams, travel across regions, coordinating dawn or dusk activities in another city.",
      notFor:
        "If you need conversions for specific meeting times and dates. Use the converter tool for that workflow.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "World clock", href: "/world-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Quick presets for common cities",
      description:
        "Use the built-in city presets to instantly load coordinates and a matching time zone without typing.",
      forWho:
        "Anyone who wants fast “show me New York/Toronto/London/Tokyo” checks for rise/set and day or night status.",
      notFor:
        "If you need a list of many cities at once. Use World Clock for multi-city viewing.",
      links: [
        { label: "Astronomical clock", href: "/astronomical-clock" },
        { label: "World clock", href: "/world-clock" },
        { label: "UTC clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Reference time checks (device vs trusted source)",
      description:
        "If something looks off, compare your device-reported time against a reference-aligned display.",
      forWho:
        "Anyone troubleshooting time drift, syncing devices, or checking start-time cues.",
      notFor:
        "If you need your system clock corrected automatically. That must be fixed in OS settings.",
      links: [
        { label: "Atomic clock", href: "/atomic-clock" },
        { label: "UTC clock", href: "/utc-clock" },
        { label: "Astronomical clock", href: "/astronomical-clock" },
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
    name: "Common astronomical clock scenarios",
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

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Pick the right tool based on what you’re trying to do with sun,
            moon, and local time.
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

        <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> For sunrise
          and sunset you must set coordinates (location or manual). If you
          switch time zones, sunrise and sunset are recalculated for that time
          zone’s local date, which can change the displayed day.
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MINIMALIST CLOCK intent)
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
      title: "Fullscreen clock for a desk, monitor, or TV",
      description:
        "Use the big digit display in fullscreen as a simple always-visible clock. Zen mode keeps controls out of the way until you move or tap.",
      forWho:
        "Anyone who wants a clean clock display that’s readable from across the room.",
      notFor:
        "You need a countdown or interval workflow. Use Fullscreen Timer or a workout timer instead.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Meetings, classrooms, and presentations",
      description:
        "Keep a visible clock while facilitating a session. Toggle seconds for precision, or hide seconds for a calmer display.",
      forWho:
        "Teachers, presenters, and meeting leads who want quick time visibility.",
      notFor:
        "You need an on-screen countdown to a specific end time. Use Presentation Timer or Countdown Timer.",
      links: [
        { label: "Presentation Timer", href: "/presentation-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "A distraction-free “screensaver-style” clock",
      description:
        "Enable Zen mode and go fullscreen. Controls fade after a short idle period, leaving only the time (and optional date).",
      forWho:
        "Anyone who wants the time displayed with minimal UI while working or focusing.",
      notFor:
        "You want a structured focus workflow with breaks. Use Pomodoro Timer or Focus Session Timer.",
      links: [
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
        { label: "Focus Session Timer", href: "/focus-session-timer" },
      ],
    },
    {
      title: "Quick copy for logs, notes, and coordination",
      description:
        "Copy a timestamp block that includes the current time, your time zone label, optional date line, and an ISO timestamp for clean pasting.",
      forWho:
        "Anyone who regularly drops a ‘current time’ stamp into messages, notes, or tickets.",
      notFor:
        "You need to coordinate across multiple time zones or convert times. Use World Clock or Time Zone Converter.",
      links: [
        { label: "World Clock", href: "/world-clock" },
        { label: "Time Zone Converter", href: "/time-zone-converter" },
      ],
    },
    {
      title: "Pick the format you actually need (12/24, seconds, date)",
      description:
        "Toggle 12/24-hour time, show or hide seconds, and show or hide the date. The display auto-fits to stay large and readable.",
      forWho:
        "Anyone switching between personal preference and a shared ‘standard’ display format.",
      notFor:
        "You want a stylized or alternate representation (binary/roman/flip). Use those clock pages instead.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Retro Flip Clock", href: "/retro-flip-clock" },
      ],
    },
    {
      title: "When you just need the current local time",
      description:
        "Use the minimalist view for big digits, or switch to the dedicated local time page when you want a straightforward ‘current time’ reference.",
      forWho: "Anyone verifying local time quickly without extra controls.",
      notFor:
        "You need UTC or another reference format. Use UTC Clock or the relevant clock page.",
      links: [
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/minimalist-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Minimalist Clock",
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
            Big readable clock with fullscreen, Zen UI hiding, and quick toggles
            for seconds, date, and 12/24-hour time.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Click the
          clock once so shortcuts work, then use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for fullscreen
          and <span className="font-semibold text-[var(--ilt-text-primary)]">Z</span> for Zen.
          Use <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy a
          timestamp block you can paste anywhere.
        </div>
      </div>
    </section>
  );
}

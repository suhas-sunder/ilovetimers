import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MILITARY TIME CONVERTER intent)
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
      title: "Quick message or schedule conversion (copy-ready)",
      description:
        "Paste a time like 1730 or 5:30 PM, confirm the opposite side updates, then hit Copy to paste a clean result into a message, calendar note, or document.",
      forWho:
        "Anyone converting times for texts, emails, rosters, schedules, or quick notes.",
      notFor:
        "You need to convert between locations or time zones. Use Time Zone Converter instead.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Training material or test prep (read military time fast)",
      description:
        "Use the examples and two-way inputs to drill common times (0000, 1200, 1730, 2359) and confirm the AM/PM equivalent instantly.",
      forWho:
        "Learners who want fast, reliable conversion while studying or practicing recognition.",
      notFor:
        "You want a step-by-step lesson or long explanations. This page focuses on instant conversion.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Atomic Clock", href: "/atomic-clock" },
      ],
    },
    {
      title: "Spreadsheets and logs (messy formats → normalized output)",
      description:
        "Paste times copied from spreadsheets or chat logs (17:30, 1730, 730, 5 PM). The tool normalizes the format so you can copy consistent output without manual cleanup.",
      forWho:
        "Operations, shift planning, forms, or any workflow where time formats vary.",
      notFor:
        "You need duration math (add/subtract time). Use Time Calculator for that.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Work Hours Calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Midnight edge case (2400 vs 0000)",
      description:
        "Convert 2400 safely. The tool treats 2400 as 00:00 (12:00 AM) and shows a note so you can copy an unambiguous result.",
      forWho: "Schedules that use 2400 for end-of-day or cutoff times.",
      notFor:
        "You need date handling (day rollover) for a multi-day schedule. Use a time zone or calendar tool instead.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Big-screen quick copying (fullscreen)",
      description:
        "Go fullscreen for a large, readable result. Click or tap the big result to copy repeatedly while you work through multiple times.",
      forWho:
        "Shared screens, meetings, or situations where you want quick copy with minimal UI.",
      notFor:
        "You want a big generic timer display. Use Fullscreen Timer instead.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Online Timer", href: "/online-timer" },
      ],
    },
    {
      title: "Right now in both formats (Now button)",
      description:
        "Fill both inputs with your current local time in military and AM/PM formats, then copy whichever format you need.",
      forWho:
        "Quick references for logging, announcements, or documenting the current time.",
      notFor:
        "You need a world view across multiple locations. Use World Clock instead.",
      links: [
        { label: "World Clock", href: "/world-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/military-time-converter"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Military Time Converter",
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
            Convert military time (24-hour) and standard time (AM/PM) instantly.
            Type in either box, copy results, use presets, and switch to
            fullscreen for a big click-to-copy display.
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
          <span className="font-semibold text-[var(--ilt-text-primary)]">N</span> for current
          time, <span className="font-semibold text-[var(--ilt-text-primary)]">C</span> to copy
          AM/PM, <span className="font-semibold text-[var(--ilt-text-primary)]">M</span> to copy
          military, <span className="font-semibold text-[var(--ilt-text-primary)]">R</span> to
          clear, <span className="font-semibold text-[var(--ilt-text-primary)]">F</span> for
          fullscreen, and{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> to exit
          fullscreen.
        </div>
      </div>
    </section>
  );
}

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
      title: "Calculate billable time for a single session",
      description:
        "Enter start/end times and break minutes to get billable time in HH:MM and decimal hours.",
      forWho:
        "Freelancers, agencies, consultants, lawyers, contractors, and anyone billing an hourly rate for one shift/session.",
      notFor:
        "If you need to track time live while you work. Use a stopwatch or count-up timer, then plug the result into billing.",
      links: [
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count up timer", href: "/count-up-timer" },
      ],
    },
    {
      title: "Apply common billing increments (rounding up)",
      description:
        "Round billable minutes up to common increments like 6, 10, or 15 minutes, then compute total pay.",
      forWho:
        "Workflows that bill in fixed increments and need consistent “round up” totals.",
      notFor:
        "If you need rounding down or nearest-increment rules. This tool rounds up only.",
      links: [
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
        { label: "Time calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Overnight shifts and late-night work",
      description:
        "Use start/end times that cross midnight (end earlier than start) and the tool will calculate the correct duration.",
      forWho:
        "Night shifts, late support calls, incident response, travel work, and any session that spans midnight.",
      notFor:
        "If you need to convert time zones for a scheduled meeting. Use a time zone converter first, then bill the resulting local range.",
      links: [
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Time zone converter", href: "/time-zone-converter" },
        { label: "Time calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Quick client quote from a time range",
      description:
        "Get a clean total amount from time + breaks + rate, then copy the summary line for an email or invoice note.",
      forWho:
        "Anyone who needs a fast, defensible total without building a full invoice.",
      notFor:
        "If you need invoice generation, taxes, fees, or retainers. This calculator does time and hourly totals only.",
      links: [
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Time calculator", href: "/time-calculator" },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Track work live, then convert to billable",
      description:
        "Run a stopwatch or count-up timer during a task, then enter the start/end times (or your duration) for billing and rounding.",
      forWho:
        "People who want a live timer while working, then a billing-ready total afterward.",
      notFor:
        "If you only need a finished total from known start/end times. Use the billable calculator directly.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count up timer", href: "/count-up-timer" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
      ],
    },
    {
      title: "Double-check totals against manual time math",
      description:
        "Validate a range by computing the raw time difference separately, then confirm rounding and totals here.",
      forWho:
        "Anyone verifying a timesheet entry, client log, or rounded billing policy.",
      notFor:
        "If you need multiple segments combined automatically. This page is optimized for one session at a time.",
      links: [
        { label: "Time calculator", href: "/time-calculator" },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
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
    name: "Common billable hours scenarios",
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

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Pick the right tool based on whether you’re calculating billable
            time from a range, applying rounding rules, or tracking time live.
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

        <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)] border">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If your
          billing policy requires rounding, confirm whether it’s “round up,”
          “nearest,” or “round down.” This calculator rounds up to the selected
          increment after breaks are deducted.
        </div>
      </div>
    </section>
  );
}

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
      title: "Track billable time live for one task or client",
      description:
        "Start a live timer, pause for breaks, and see billable time + total pay update automatically.",
      forWho:
        "Freelancers, consultants, agencies, lawyers, contractors, and anyone who wants a billing-ready total while they work.",
      notFor:
        "If you already know your start/end times and just need a one-off calculation. Use the billable hours calculator instead.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Manage multiple matters (separate timers, separate rules)",
      description:
        "Run multiple timers with different notes, rates, currencies, and rounding. Switch the active timer anytime.",
      forWho:
        "Anyone juggling multiple clients, tickets, matters, or tasks and needing clean per-item totals.",
      notFor:
        "If you need a single timer with lap splits. This tool is optimized for separate timers per work item.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        { label: "Multiple timers", href: "/multiple-timers" },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Apply common billing increments (rounding up) while tracking",
      description:
        "Choose 6, 10, or 15-minute rounding and the clock will always round billable time up to the next increment.",
      forWho:
        "Workflows that bill in fixed increments and want totals that match a “round up” policy.",
      notFor:
        "If you need rounding down or nearest-increment rules. This clock rounds up only.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Time calculator", href: "/time-calculator" },
      ],
    },
    {
      title: "Bill in multiple currencies (no conversion)",
      description:
        "Keep timers in different currencies and get totals grouped by currency, so you can invoice cleanly without mixing amounts.",
      forWho:
        "People billing international clients, or keeping different rates/currencies by project.",
      notFor:
        "If you need exchange-rate conversion or multi-currency aggregation into one number. This tool does not convert.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        { label: "Time zone converter", href: "/time-zone-converter" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
      ],
    },
    {
      title: "Create a quick invoice note (copy or print)",
      description:
        "Copy a single timer (or all timers) as a compact summary, or print a clean PDF-ready view for records.",
      forWho:
        "Anyone who needs a quick, defensible time-and-total summary to paste into an email, invoice note, or timesheet.",
      notFor:
        "If you need invoice generation, taxes, fees, retainers, or trust accounting. This page tracks time and computes hourly totals only.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        {
          label: "Billable hours calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Work hours calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Run a big fullscreen display while you work",
      description:
        "Use fullscreen mode to display billable time and total clearly from a distance (great for focus rooms or shared offices).",
      forWho:
        "Anyone who wants a highly visible timer display with billing totals.",
      notFor:
        "If you want a generic fullscreen timer without billing fields. Use the fullscreen timer route instead.",
      links: [
        { label: "Billable Hours Clock", href: "/billable-hours-clock" },
        { label: "Fullscreen timer", href: "/fullscreen-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
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
    name: "Common billable timer scenarios",
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
            Use this page when you want a live billable timer with rounding and
            totals. Use the calculator pages when you already have a known time
            range.
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

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> If your
          billing policy requires rounding, confirm whether it’s “round up,”
          “nearest,” or “round down.” This clock rounds billable time up to the
          selected increment.
        </div>
      </div>
    </section>
  );
}

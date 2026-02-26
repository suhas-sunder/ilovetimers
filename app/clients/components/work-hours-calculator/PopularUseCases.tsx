import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (WORK HOURS CALCULATOR intent)
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
      title:
        "Timesheet entry: start, end, and break (fast payroll-ready total)",
      description:
        "Enter your Start and End times, subtract a break, and copy paid time in HH:MM and decimal hours. Enable rounding if your workplace records time in 5/10/15-minute increments.",
      forWho:
        "Anyone filling out a timesheet, payroll form, or logging a single shift quickly.",
      notFor:
        "You need to add multiple separate work blocks or split shifts. Use Time Calculator instead.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        {
          label: "Billable Hours Calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Overnight shift calculation (end time is “earlier” than start)",
      description:
        "If End is earlier than Start, the calculator treats it as the next day and marks the result as Overnight. This helps avoid manual next-day math for late shifts.",
      forWho:
        "Shift workers, night staff, and anyone logging work that crosses midnight.",
      notFor:
        "You need to compute a weekly total across many days. Use multiple entries with Time Calculator.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        {
          label: "Billable Hours Calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Clocking in/out in real time (use “Now” and copy)",
      description:
        "Tap Now for Start when you begin, Now for End when you finish, subtract your break, then copy the result. It’s a quick way to capture an accurate shift without switching apps.",
      forWho:
        "People tracking their own hours during the day and wanting an easy copyable result.",
      notFor:
        "You want a timer running continuously. Use Stopwatch or Count Up Timer instead.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Rounding to match workplace policy (nearest 5/10/15 minutes)",
      description:
        "Turn on rounding for paid time so your copied number matches how time is recorded. The HH:MM and decimal hours shown reflect the rounded paid minutes.",
      forWho:
        "Anyone whose workplace rounds recorded time for timesheets or payroll.",
      notFor:
        "You need exact minute-by-minute logs with multiple entries. Use Billable Hours Calculator instead.",
      links: [
        {
          label: "Billable Hours Calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
      ],
    },
    {
      title: "Creating a clean message for a manager or client (copy summary)",
      description:
        "Copy summary creates a compact line with paid time, total shift, break minutes, and an Overnight note when applicable. It’s designed to paste cleanly into chat or email.",
      forWho:
        "Workers reporting hours, freelancers sending a quick time breakdown, and managers double-checking shift math.",
      notFor:
        "You need invoicing across multiple tasks or projects. Use Billable Hours Calculator.",
      links: [
        {
          label: "Billable Hours Calculator",
          href: "/billable-hours-calculator",
        },
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
      ],
    },
    {
      title: "Sanity-checking break deductions (avoid impossible totals)",
      description:
        "If a break exceeds the shift length, the tool shows an error instead of producing a misleading result. This helps catch input mistakes before you submit hours.",
      forWho:
        "Anyone who wants a quick validation check before logging paid time.",
      notFor:
        "You need compliance rules by jurisdiction or policy interpretation. This tool focuses on the math only.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Current Local Time", href: "/current-local-time" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/work-hours-calculator"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Work Hours Calculator",
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
            Start/end time, break deduction, overnight shifts, decimal hours,
            optional rounding, and copy outputs designed for timesheets and
            payroll.
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
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> If your
          workplace rounds time, enable{" "}
          <span className="font-semibold text-slate-900">Round paid time</span>{" "}
          so the copied result matches what gets recorded. For quick actions,
          click the card once and use{" "}
          <span className="font-semibold text-slate-900">S</span> (start now),{" "}
          <span className="font-semibold text-slate-900">E</span> (end now),{" "}
          <span className="font-semibold text-slate-900">C</span> (copy), and{" "}
          <span className="font-semibold text-slate-900">R</span> (reset).
        </div>
      </div>
    </section>
  );
}

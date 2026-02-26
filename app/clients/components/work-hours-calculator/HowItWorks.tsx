// app/clients/components/work-hours-calculator/HowItWorks.tsx
import * as React from "react";
import { Link } from "react-router";

/* =========================================================
   JSON-LD helper (used by FAQ + PopularUseCases)
========================================================= */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   HOW IT WORKS (Work Hours Calculator)
   Goal: user-intent first, SEO-friendly, unique, practical
   Target: 800 to 1200 words of real help + examples
========================================================= */
export default function HowItWorks({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const pageUrl = `${baseUrl}/work-hours-calculator`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to calculate work hours from start and end time (subtract breaks)",
    description:
      "Use the Work Hours Calculator to compute paid time from a start and end time, subtract a break, support overnight shifts, optionally round paid time, and copy results for payroll or timesheets.",
    url: pageUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Enter start and end time",
        text: "Set Start time and End time. If End is earlier than Start, the calculator treats it as an overnight shift into the next day.",
      },
      {
        "@type": "HowToStep",
        name: "Subtract break minutes",
        text: "Enter break minutes (or tap a quick break chip). Breaks are subtracted from the total shift to produce paid time.",
      },
      {
        "@type": "HowToStep",
        name: "Choose display options",
        text: "Pick decimal places for hours and optionally round paid time to the nearest 5, 10, or 15 minutes if your workplace records time that way.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the result",
        text: "Copy paid time as HH:MM and decimal hours, or copy a full summary including shift length, break, and overnight note when applicable.",
      },
      {
        "@type": "HowToStep",
        name: "Use shortcuts to move faster",
        text: "Click the calculator card, then press S to set Start to now, E to set End to now, C to copy paid time, and R to reset.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">How it works</h2>
          <p className="mt-1 text-sm text-slate-600">
            This page calculates paid work time from a start time and end time,
            subtracts a break, and shows the result in two formats that people
            actually paste into timesheets:{" "}
            <strong className="text-slate-900">HH:MM</strong> and{" "}
            <strong className="text-slate-900">decimal hours</strong>. It is
            built for quick shift math, overnight shifts that cross midnight,
            and clean copy output for payroll, managers, clients, or your own
            logs.
          </p>
        </div>

        {/* Core explanation (SEO + intent, no fluff) */}
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <p className="leading-relaxed">
              The calculator follows a simple structure:{" "}
              <strong className="text-slate-900">Total shift</strong> is the
              time from Start to End, then{" "}
              <strong className="text-slate-900">Break</strong> minutes are
              subtracted to produce{" "}
              <strong className="text-slate-900">Paid time</strong>. If your End
              time is earlier than your Start time, the page assumes your shift
              continues into the next day and marks the result as{" "}
              <strong className="text-slate-900">Overnight</strong>. That one
              rule eliminates the most common manual mistake: trying to do
              next-day math in your head while you are tired or rushing to
              submit hours.
            </p>
            <p className="mt-3 leading-relaxed">
              Paid time is displayed in two ways because different workplaces
              expect different formats.{" "}
              <strong className="text-slate-900">HH:MM</strong> is easy to read
              (for example 7:30).{" "}
              <strong className="text-slate-900">Decimal hours</strong> are easy
              to total in spreadsheets and invoices (for example 7.50). You can
              also turn on rounding if your organization records time in fixed
              increments like 5, 10, or 15 minutes.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                1) Set Start and End
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Use the time inputs to enter your shift. If you are clocking in
                or out, the{" "}
                <span className="font-semibold text-slate-900">Now</span>{" "}
                buttons fill in the current time quickly.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                2) Subtract break minutes
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Enter break length (or tap a quick chip like 30m). Break is
                subtracted from the total shift to produce paid time.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                3) Choose options
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Set decimal places for hours and optionally round paid time to
                nearest 5, 10, or 15 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                4) Copy output
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Copy paid time or a full summary line so you can paste into a
                timesheet, message, or note without retyping.
              </p>
            </div>
          </div>
        </div>

        {/* Examples with real numbers users see */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Examples with real scenarios and numbers
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These examples show what you would actually enter, what the page
            displays, and what you can copy. The goal is to match real shift
            patterns, not abstract math.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Scenario A */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario A: Standard day shift with a 30-minute break
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You work from <strong className="text-slate-900">09:00</strong>{" "}
                to <strong className="text-slate-900">17:00</strong> and take a{" "}
                <strong className="text-slate-900">30</strong>-minute break.
                This is the classic “8 hours minus lunch” case.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Start: 09:00 · End: 17:00 · Break: 30 min
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Total shift:{" "}
                    <strong className="text-slate-900">8:00</strong> · Paid
                    time: <strong className="text-slate-900">7:30</strong> ·
                    Decimal hours:{" "}
                    <strong className="text-slate-900">7.50</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you can copy
                  </div>
                  <div className="mt-1 text-slate-700">
                    Paid time copies as{" "}
                    <strong className="text-slate-900">7:30 (7.50 hrs)</strong>.
                    If you use Copy summary, it includes shift and break so a
                    manager can verify quickly.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario B: Overnight shift crossing midnight
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You start at <strong className="text-slate-900">22:15</strong>{" "}
                and finish at <strong className="text-slate-900">06:45</strong>{" "}
                the next day with a{" "}
                <strong className="text-slate-900">45</strong>-minute break. End
                is earlier than Start, so the tool flags it as Overnight.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Start: 22:15 · End: 06:45 · Break: 45 min
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Calculation you avoid doing manually
                  </div>
                  <div className="mt-1 text-slate-700">
                    Total shift is 8 hours 30 minutes (from 22:15 to 06:45).
                    Subtract 45 minutes, paid time is{" "}
                    <strong className="text-slate-900">7:45</strong>.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you see
                  </div>
                  <div className="mt-1 text-slate-700">
                    Overnight: <strong className="text-slate-900">Yes</strong> ·
                    Paid time: <strong className="text-slate-900">7:45</strong>{" "}
                    · Decimal hours:{" "}
                    <strong className="text-slate-900">7.75</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario C */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario C: Rounding to match a workplace policy
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Some workplaces record time to fixed increments. Suppose your
                paid time comes out to{" "}
                <strong className="text-slate-900">7:53</strong> after breaks,
                but payroll rounds to the nearest 15 minutes.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Inputs
                  </div>
                  <div className="mt-1 text-slate-700">
                    Example: Start 08:07 · End 16:20 · Break 20 min
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Without rounding
                  </div>
                  <div className="mt-1 text-slate-700">
                    Total shift is 8:13. Subtract 20 minutes, paid time is{" "}
                    <strong className="text-slate-900">7:53</strong> (
                    <strong className="text-slate-900">7.88</strong> hrs at 2
                    decimals).
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    With rounding enabled
                  </div>
                  <div className="mt-1 text-slate-700">
                    Set{" "}
                    <strong className="text-slate-900">Round paid time</strong>{" "}
                    to{" "}
                    <strong className="text-slate-900">Nearest 15 min</strong>.{" "}
                    7:53 rounds to{" "}
                    <strong className="text-slate-900">8:00</strong> (decimal{" "}
                    <strong className="text-slate-900">8.00</strong>), and that
                    is what Copy uses.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario D */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Scenario D: Quick clock-in/out capture using “Now”
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                You want a simple record of today’s shift without doing anything
                fancy. When you start, click{" "}
                <strong className="text-slate-900">Now</strong> beside Start.
                When you finish, click{" "}
                <strong className="text-slate-900">Now</strong> beside End,
                enter your break, and copy the result.
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Example day
                  </div>
                  <div className="mt-1 text-slate-700">
                    Start captured as 07:58 · End captured as 16:12 · Break 30
                    min
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What you get
                  </div>
                  <div className="mt-1 text-slate-700">
                    Total shift 8:14, paid time{" "}
                    <strong className="text-slate-900">7:44</strong> (
                    <strong className="text-slate-900">7.73</strong> hrs at 2
                    decimals). Copy paid time produces a clean paste string for
                    a note or timesheet.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Shortcut version
                  </div>
                  <div className="mt-1 text-slate-700">
                    Click the card, then press{" "}
                    <strong className="text-slate-900">S</strong> to set Start
                    to now, <strong className="text-slate-900">E</strong> to set
                    End to now, <strong className="text-slate-900">C</strong> to
                    copy, <strong className="text-slate-900">R</strong> to
                    reset.
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario E */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-base font-semibold text-slate-900">
                Scenario E: Catching input mistakes before you submit hours
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                A common timesheet error is typing a break that is longer than
                the shift. The calculator prevents misleading totals by showing
                a clear error instead of outputting a “0” or negative value.
              </p>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Mistake example
                  </div>
                  <div className="mt-1 text-slate-700">
                    Start 14:00 · End 18:00 · Break 300 min
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    What happens
                  </div>
                  <div className="mt-1 text-slate-700">
                    The tool shows an error because a 300-minute break cannot
                    fit inside a 4-hour shift. Fix the break value (for example
                    30 or 60) and the paid time updates immediately.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practical guidance */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-700">
            Small choices that make the calculator more useful
          </h3>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Use rounding only when you need it
              </div>
              <p className="mt-2 leading-relaxed">
                If your workplace rounds, turn it on so your copied value
                matches what gets recorded. If your workplace uses exact
                minutes, leave rounding off and copy the exact paid time.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Pick decimal places based on where you paste
              </div>
              <p className="mt-2 leading-relaxed">
                If you paste into a spreadsheet that totals hours, 2 decimals is
                common (7.50, 7.75). If you want a cleaner number for a form, 1
                or 0 decimals may be enough. The underlying minutes do not
                change when you change decimals.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Use Copy summary when someone needs context
              </div>
              <p className="mt-2 leading-relaxed">
                Copy paid time is compact. Copy summary includes shift length,
                break minutes, and overnight status. That extra context prevents
                back-and-forth like “what break did you subtract?”
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                If you have multiple blocks, use the right tool
              </div>
              <p className="mt-2 leading-relaxed">
                This calculator is built for a single Start and End window. If
                your day is split into multiple separate blocks, add them using{" "}
                <Link
                  to="/time-calculator"
                  className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                >
                  Time Calculator
                </Link>{" "}
                so you can total the whole day cleanly.
              </p>
            </div>
          </div>
        </div>

        {/* Technical content stays expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (overnight, rounding, copy, validation)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details and troubleshooting for power users
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Overnight rule</div>
              <p className="mt-1 leading-relaxed">
                If End is earlier than Start, the tool treats End as the next
                day. The calculation becomes (End + 24 hours) minus Start.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Break validation
              </div>
              <p className="mt-1 leading-relaxed">
                Break minutes cannot exceed the total shift. If they do, the
                tool shows an error to prevent misleading results.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Rounding behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Rounding applies to paid minutes after breaks using nearest
                rounding to 5, 10, or 15 minutes. When rounding is enabled, both
                HH:MM and decimal hours reflect the rounded paid minutes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Copy permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses your browser’s clipboard API. If copy does nothing,
                your browser may be blocking clipboard access. Try clicking the
                page once and pressing Copy again.
              </p>
            </div>
          </div>
        </details>

        {/* Footer helper links, on-intent */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">
            Need a different tool?
          </span>{" "}
          Add up multiple time blocks with{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
          </Link>
          . Track billable formatting and totals with{" "}
          <Link
            to="/billable-hours-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Billable Hours Calculator
          </Link>
          . Want a live time reference while you log hours?{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>
          .
        </div>
      </div>
    </section>
  );
}

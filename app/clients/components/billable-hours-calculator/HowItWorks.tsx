import React from "react";

/* ---------- Small helper: JSON-LD script ---------- */
export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* =========================================================
   1) HOW IT WORKS (trust + SEO + user intent)
   Notes:
   - Uses only your real routes (no hash anchors).
   - Scenario-based with concrete numbers.
   - Written to be unique to /billable-hours-calculator (times + breaks + rounding + total pay).
   - Practical and tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/billable-hours-calculator",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to calculate billable hours with breaks, rounding, and total pay",
    description:
      "Use this billable hours calculator to compute billable time and total pay from start and end times, break minutes, an hourly rate, and optional rounding increments.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Enter start and end times",
        text: "Set the start time and end time for the session. Overnight sessions are supported when the end time is earlier than the start time.",
      },
      {
        "@type": "HowToStep",
        name: "Subtract breaks",
        text: "Enter break minutes that should not be billed. Breaks are deducted before any rounding is applied.",
      },
      {
        "@type": "HowToStep",
        name: "Choose rounding increment (optional)",
        text: "Select a rounding increment like 6, 10, or 15 minutes. Rounding is applied by rounding billable minutes up to the next increment. Choose None for exact minutes.",
      },
      {
        "@type": "HowToStep",
        name: "Enter hourly rate and currency",
        text: "Enter the hourly rate and pick the currency for display. Currency selection formats results but does not convert exchange rates.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or print your result",
        text: "Use Copy for a one-line summary, or Print to save as a PDF for your records or to share with a client.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  const PillLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
    >
      {children} →
    </a>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is built for one job: turn a time range into{" "}
              <strong>billable time</strong> and a <strong>total amount</strong>
              , with the billing rules people actually use. You enter a start
              time and end time, subtract break minutes, optionally apply a
              rounding increment (like 6, 10, or 15 minutes), then multiply by
              an hourly rate. The result shows billable time in{" "}
              <strong>HH:MM</strong>, a decimal hours view (for timesheets), and
              a formatted total you can copy or print.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This calculator is optimized for a <strong>single session</strong>
              , such as one client call, one on-site visit, one shift, or one
              task block. If your workflow is live tracking while you work,
              start a timer first and then bring the numbers here:{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/stopwatch")}
              >
                Stopwatch
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/count-up-timer")}
              >
                Count Up Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Break deduction
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Rounding up
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Overnight
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy + print
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              The “get a billable total fast” flow
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set{" "}
                <strong>Start</strong> and <strong>End</strong> times. Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Now</span> for
                quick entry, or press <Kbd>S</Kbd> (start now) and <Kbd>E</Kbd>{" "}
                (end now).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Enter{" "}
                <strong>Break minutes</strong> you do not bill.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Pick a{" "}
                <strong>rounding increment</strong> if your billing policy uses
                one. This tool rounds up. Choose <strong>None</strong> for exact
                minutes.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Enter{" "}
                <strong>Hourly rate</strong> and choose a currency for display.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Copy
                the one-line summary with <Kbd>C</Kbd>, or print with{" "}
                <Kbd>P</Kbd> for a clean PDF.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the calculator checks
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The calculator avoids a mystery total from incomplete inputs. If
                a time is missing, if the end time does not create a valid
                duration, or if break minutes exceed the shift, it tells you
                what to fix instead of filling in a silent assumption.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick expectations (billing rules in plain language)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                Breaks are deducted{" "}
                <span className="font-semibold">before</span> rounding.
              </li>
              <li>
                Rounding is <span className="font-semibold">always up</span> to
                the next increment.
              </li>
              <li>
                Decimal hours are a display option. Total pay is computed from
                billable minutes.
              </li>
              <li>
                Currency selection formats totals. It does not convert exchange
                rates.
              </li>
              <li>
                Overnight sessions are supported by treating end time as the
                next day when it is earlier than start.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If your
              policy says “bill in 0.1 hour” or “bill in 6 minutes,” pick the
              increment that matches the written rule so your totals match what
              the client expects.
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with numbers you can sanity-check
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These examples use realistic times, common break patterns, and the
            rounding increments people actually bill with. The point is not
            theory. It is to show exactly what changes when you add a break,
            change the rounding increment, or tweak the hourly rate.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Freelancer task block with 6-minute rounding
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                “Client call plus follow-up notes”
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start <strong>09:12</strong>, End <strong>11:47</strong>, Break{" "}
                <strong>15</strong> minutes, Rate <strong>$120.00/hr</strong>,
                Rounding <strong>6 minutes (up)</strong>.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Shift duration: 09:12 → 11:47 = <strong>155 minutes</strong>.
                </li>
                <li>
                  Minus break: 155 − 15 = <strong>140 billable minutes</strong>{" "}
                  before rounding.
                </li>
                <li>
                  6-minute rounding up: 140 is not a multiple of 6, so it rounds
                  to <strong>144 minutes</strong> (2:24).
                </li>
                <li>
                  Total: 144 ÷ 60 = <strong>2.4 hours</strong>. 2.4 × 120 ={" "}
                  <strong>$288.00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This is the practical reason rounding exists: you are not
                debating whether a short overage counts. The increment defines
                the rule and the total becomes consistent. If you switch
                rounding to <strong>None</strong>, you would bill 140 minutes
                (2:20), and the total becomes <strong>$280.00</strong>.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Lawyer consult billed in 0.1 hour (6 minutes)
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                “Short consult with no break”
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start <strong>13:05</strong>, End <strong>14:02</strong>, Break{" "}
                <strong>0</strong> minutes, Rate <strong>$350.00/hr</strong>,
                Rounding <strong>6 minutes (up)</strong>.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Shift duration: 57 minutes. Break 0, so billable raw is{" "}
                  <strong>57 minutes</strong>.
                </li>
                <li>
                  6-minute rounding up: 57 rounds to <strong>60 minutes</strong>{" "}
                  (1:00).
                </li>
                <li>
                  Total: 60 ÷ 60 = 1.0 hour. 1.0 × 350 ={" "}
                  <strong>$350.00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Notice what the “Before rounding” field is doing: it lets you
                confirm the raw time (57 minutes) and then see the policy effect
                (rounded to 60). If your policy is different (nearest increment
                instead of rounding up), this page is not trying to guess. It
                stays strict so you do not accidentally bill the wrong way.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Overnight support session with a short break
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                “Incident response that crosses midnight”
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start <strong>22:30</strong>, End <strong>01:10</strong>, Break{" "}
                <strong>20</strong> minutes, Rate <strong>$95.00/hr</strong>,
                Rounding <strong>15 minutes (up)</strong>.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Overnight: 22:30 → 01:10 is <strong>160 minutes</strong> total
                  shift.
                </li>
                <li>
                  Minus break: 160 − 20 = <strong>140 minutes</strong> before
                  rounding.
                </li>
                <li>
                  15-minute rounding up: 140 rounds to{" "}
                  <strong>150 minutes</strong> (2:30).
                </li>
                <li>
                  Total: 150 ÷ 60 = 2.5 hours. 2.5 × 95 ={" "}
                  <strong>$237.50</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The overnight rule is intentionally simple: if end is earlier
                than start, it assumes the end is on the next day. That matches
                how most people write timesheets for late-night work.
              </p>
            </div>

            {/* Scenario 4 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Same session, different increment, different total
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                “Why your client total changes when you pick 10 vs 15”
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Start <strong>10:00</strong>, End <strong>11:01</strong>, Break{" "}
                <strong>0</strong> minutes, Rate <strong>$200.00/hr</strong>.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Raw billable time is <strong>61 minutes</strong> (1:01).
                </li>
                <li>
                  With <strong>10-minute rounding</strong>, 61 rounds to{" "}
                  <strong>70 minutes</strong> (1:10). Total is 70 ÷ 60 × 200 ={" "}
                  <strong>$233.33</strong>.
                </li>
                <li>
                  With <strong>15-minute rounding</strong>, 61 rounds to{" "}
                  <strong>75 minutes</strong> (1:15). Total is 75 ÷ 60 × 200 ={" "}
                  <strong>$250.00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This is why the increment needs to match the policy. If you are
                switching increments just to “make the number look better,” you
                will produce inconsistent invoices. Pick the rule once and keep
                it consistent.
              </p>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (when your workflow is different)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Use this page for single-session billable totals. Use these when
                the job changes.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>S</Kbd> <Kbd>E</Kbd> <Kbd>C</Kbd> <Kbd>P</Kbd>{" "}
              <Kbd>R</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/count-up-timer")}>Count Up Timer</PillLink>
            <PillLink href={abs("/time-calculator")}>Time Calculator</PillLink>
            <PillLink href={abs("/work-hours-calculator")}>
              Work Hours Calculator
            </PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (calculation rules)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Order of operations, rounding behavior, overnight handling, and
                currency formatting
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Order of operations
              </div>
              <p className="mt-1 leading-relaxed">
                The calculator computes shift minutes from start → end. If end
                is earlier than start, it treats end as the next day. Break
                minutes are subtracted next. If rounding is enabled, billable
                minutes are rounded up. Total pay is calculated from the final
                billable minutes.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Rounding rule</div>
              <p className="mt-1 leading-relaxed">
                Rounding uses a ceiling rule:{" "}
                <strong>ceil(billableRaw / increment) × increment</strong>. That
                means the result never rounds down. If you need
                nearest-increment rounding or “round down,” this tool does not
                do that.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Decimal hours display
              </div>
              <p className="mt-1 leading-relaxed">
                Decimal hours are computed as billable minutes ÷ 60, then
                displayed with 0–4 decimals. Changing decimals does not affect
                the total pay. Total pay is always based on billable minutes.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Currency formatting
              </div>
              <p className="mt-1 leading-relaxed">
                Currency selection affects formatting only. The calculator does
                not fetch exchange rates or convert amounts. If you bill in one
                currency and report in another, you will need a separate FX step
                outside this page.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need live timing?</strong> Run{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/stopwatch")}
            >
              Stopwatch
            </a>{" "}
            while you work, then bill with a consistent increment here.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need general time math?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/time-calculator")}
            >
              Time Calculator
            </a>{" "}
            for adding/subtracting times, then compute billable totals here.
          </div>
        </div>
      </div>
    </section>
  );
}

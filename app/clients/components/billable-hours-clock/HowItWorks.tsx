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
   - Scenario-based with concrete numbers, specific to /billable-hours-clock.
   - Written to be unique and tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/billable-hours-clock",
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
    name: "How to track billable time live with rounding and total pay",
    description:
      "Use the Billable Hours Clock to run live timers, apply rounding increments, and compute total pay per timer from an hourly rate. Copy or print summaries and keep timers saved in your browser.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Create a timer and set billing rules",
        text: "Add a timer, set the hourly rate, currency, optional note, and rounding increment (None, 6, 10, or 15 minutes).",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and resume while you work",
        text: "Start the active timer, pause it during breaks, and resume when you return. Billable time updates automatically.",
      },
      {
        "@type": "HowToStep",
        name: "Review billable time and total pay",
        text: "The page shows live elapsed time, rounded billable time, billable hours, and the total amount for the active timer.",
      },
      {
        "@type": "HowToStep",
        name: "Manage multiple clients or tasks",
        text: "Add a timer per client or task and switch the active timer as you move through your day. Totals are shown per timer and by currency.",
      },
      {
        "@type": "HowToStep",
        name: "Copy or print a summary",
        text: "Copy one timer or all timers for a compact text summary, or print a PDF-friendly view for records or invoicing.",
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
              The Billable Hours Clock is a live billing tool. It is built for
              the moment you are actually doing the work, not after. You start a
              timer, pause it for breaks, apply the rounding rule you bill with,
              and the page continuously shows three numbers that matter:
              <strong> elapsed time</strong>, <strong>billable time</strong>,
              and <strong>total pay</strong>. Each timer stores its own hourly
              rate, currency, rounding increment, and note, so switching clients
              or matters does not require re-entering your rules.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is best when your day is made of multiple chunks that do
              not line up cleanly. If you already know your start and end times
              and just want a one-off calculation from a time range, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/billable-hours-calculator")}
              >
                Billable Hours Calculator
              </a>{" "}
              instead.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Multiple timers
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Rounds up
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Totals by currency
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy + print
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Saved locally
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              The fastest “start billing now” setup
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Add a
                timer with <Kbd>A</Kbd> or the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Add timer</span>{" "}
                button.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Set the{" "}
                <strong>hourly rate</strong> and <strong>currency</strong>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Choose
                a <strong>rounding</strong> rule (None, 6, 10, 15 minutes). This
                page rounds up.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Press{" "}
                <Kbd>Space</Kbd> to start. Pause the timer during breaks. Resume
                when you return.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> When
                you are done, press <Kbd>C</Kbd> to copy the active timer
                summary, or <Kbd>P</Kbd> to print the active timer.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “billable time” means here
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The clock always tracks real elapsed time. Billable time is
                either the same as elapsed (rounding set to None) or the elapsed
                time rounded up to the next increment. If you pause for a break,
                those minutes never enter elapsed time and therefore never enter
                billable time.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick rules (so your totals match your policy)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                Rounding is <span className="font-semibold">always up</span>.
              </li>
              <li>
                6 minutes is <span className="font-semibold">0.1 hour</span>; 15
                minutes is <span className="font-semibold">0.25 hour</span>.
              </li>
              <li>Currency is formatting only. No exchange-rate conversion.</li>
              <li>
                Totals are shown{" "}
                <span className="font-semibold">per currency</span> to avoid
                mixing amounts.
              </li>
              <li>
                Timers are saved in your browser so refresh is not a reset.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If your
              billing policy says “bill in tenths,” set rounding to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">6 min</span>. If it
              says “quarter-hour increments,” use{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">15 min</span>.
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with numbers you can verify
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These examples are written the way people actually use this page:
            starting a timer, pausing for breaks, switching clients, and copying
            a summary. The numbers below are exactly the kind of totals users
            expect to see when they bill in 0.1 hours, 10 minutes, or 15
            minutes.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 1: One client call, bill in 0.1 hours (6 minutes)
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                Rounding makes the invoice match the written rule
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You set Rate <strong>$120.00/hr</strong>, Rounding{" "}
                <strong>6 min</strong>, Currency <strong>USD</strong>. You start
                the timer for a call and stop at the end.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Elapsed time when you pause/stop: <strong>57:40</strong>.
                </li>
                <li>
                  With 6-minute rounding up, billable time becomes{" "}
                  <strong>1:00:00</strong>.
                </li>
                <li>
                  Billable hours: 60 ÷ 60 = <strong>1.00</strong>.
                </li>
                <li>
                  Total: 1.00 × 120 = <strong>$120.00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you switch rounding to <strong>None</strong>, billable time
                matches elapsed time (57:40). The total becomes about{" "}
                <strong>$115.33</strong> (57.67 minutes ÷ 60 × 120). This is why
                the rounding selector exists: it makes your invoice consistent
                with your policy, not with a spreadsheet interpretation.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 2: Two tasks, two rates, same afternoon
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                Separate timers prevent accidental blending
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You create two timers:
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  <strong>Timer A</strong> (Client Alpha): $150/hr, rounding 10
                  min.
                </li>
                <li>
                  <strong>Timer B</strong> (Client Beta): $95/hr, rounding None.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Alpha work runs for <strong>1:03:00</strong>. With 10-minute
                rounding, billable becomes <strong>1:10:00</strong> (70
                minutes). Total: 70 ÷ 60 × 150 = <strong>$175.00</strong>.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Beta work runs for <strong>0:38:00</strong> with rounding None.
                Billable stays <strong>0:38:00</strong>. Total: 38 ÷ 60 × 95 ={" "}
                <strong>$60.17</strong>.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The key advantage is not the math. It is the separation. You do
                not have to remember which rate or rounding rule was active, and
                you do not end up with one blended total that is hard to justify
                later.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 3: Breaks are handled by pausing
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                Break time does not enter elapsed time
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You start a timer for a deep work block, then take a 12-minute
                break. You pause during the break and resume after.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Working segments: 44 minutes, then 31 minutes ={" "}
                  <strong>75 minutes</strong> of real work.
                </li>
                <li>
                  Break: 12 minutes is excluded because the timer was paused.
                </li>
                <li>
                  With 15-minute rounding, 75 minutes is already a multiple of
                  15, so billable stays <strong>1:15:00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you forget to pause, you still have two practical fixes that
                match how people correct logs: subtract time with{" "}
                <strong>-5m</strong> (tap twice to remove 10 minutes), or edit
                your workflow for next time. The page keeps this intentionally
                simple so you are not forced into complicated “break rules” UI
                while you are trying to work.
              </p>
            </div>

            {/* Scenario 4 */}
            <div className="ilt-surface-card p-5">
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                Scenario 4: Multiple currencies, totals stay separated
              </div>
              <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                This avoids mixing money that cannot be added meaningfully
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You bill one client in USD and another in EUR. You run both
                timers in the same day.
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  USD timer: billable <strong>2:24:00</strong> at $120/hr → 2.40
                  hours → <strong>$288.00</strong>.
                </li>
                <li>
                  EUR timer: billable <strong>1:30:00</strong> at €90/hr → 1.50
                  hours → <strong>€135.00</strong>.
                </li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The Totals panel shows each currency separately (USD: $288.00,
                EUR: €135.00), plus total billable hours across timers. This is
                deliberate. Adding $288 and €135 into one number is not a real
                accounting operation unless you do a separate conversion step,
                which this page does not attempt.
              </p>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (when your workflow changes)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Use this page for live tracking with billing totals. Use these
                when you need different time math or different display styles.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>C</Kbd> <Kbd>A</Kbd>{" "}
              <Kbd>F</Kbd> <Kbd>P</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/billable-hours-calculator")}>
              Billable Hours Calculator
            </PillLink>
            <PillLink href={abs("/work-hours-calculator")}>
              Work Hours Calculator
            </PillLink>
            <PillLink href={abs("/time-card-calculator")}>
              Time Card Calculator
            </PillLink>
            <PillLink href={abs("/time-calculator")}>Time Calculator</PillLink>
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/count-up-timer")}>Count Up Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (calculation + saving rules)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Rounding formula, totals, local saving, and background-tab
                behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Rounding rule</div>
              <p className="mt-1 leading-relaxed">
                Billable time uses a ceiling rule per timer. If increment is 6,
                10, or 15 minutes, billableMilliseconds = ceil(elapsedMs /
                incrementMs) × incrementMs. “None” disables rounding and uses
                elapsedMs directly.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Total pay</div>
              <p className="mt-1 leading-relaxed">
                Total = (billableMs ÷ 3,600,000) × hourlyRate. The page shows
                billable hours with two decimals by default, but the monetary
                total is computed from the underlying billable time.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Totals by currency
              </div>
              <p className="mt-1 leading-relaxed">
                Monetary totals are summed by currency code so USD totals and
                EUR totals stay separate. Hours are also summed across all
                timers as a convenience, since time can be added meaningfully.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Saving and background behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Timers are saved to your browser’s local storage on this device.
                If the page becomes hidden, running timers are paused to avoid
                drift. When you return, you can resume and the displayed totals
                remain consistent.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a simple timer only?
            </strong>{" "}
            Use{" "}
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
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need a one-off total?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/billable-hours-calculator")}
            >
              Billable Hours Calculator
            </a>{" "}
            when you already know the time range.
          </div>
        </div>
      </div>
    </section>
  );
}

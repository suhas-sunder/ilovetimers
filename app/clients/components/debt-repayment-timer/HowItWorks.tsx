import React from "react";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/debt-repayment-timer",
}: {
  canonicalUrl?: string;
}) {

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
            This page is a payoff countdown. Choose a payoff date or a duration,
            then use the large display to keep the finish line visible. The
            balance fields add a lightweight pacing estimate, not a lender-grade
            payoff model.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Date or duration",
              body: "Payoff date counts down to a specific calendar day. Duration counts down for a fixed number of days from the selected start date.",
            },
            {
              title: "Time-based estimate",
              body: "Estimated paid and remaining amounts are calculated from elapsed time between the start and end dates.",
            },
            {
              title: "Big display",
              body: "Fullscreen keeps the countdown readable from a distance and preserves start, pause, reset, and mode controls.",
            },
          ].map((item) => (
            <div key={item.title} className="ilt-surface-card p-4">
              <h3 className="font-semibold text-[var(--ilt-text-primary)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="ilt-surface-muted p-4 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
          The estimate is intentionally simple: it does not model interest,
          compounding, fees, payment schedules, minimum payments, or lender
          payoff calculations. Use it as a timing and pacing display based on
          the values you enter.
        </div>
      </div>
    </section>
  );
}

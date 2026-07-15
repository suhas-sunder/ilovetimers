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
   1) HOW IT WORKS (trust block)
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/",
}: {
  canonicalUrl?: string;
}) {

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="ilt-surface-card p-5">
        <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

        <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
          Everything runs locally in your browser tab. Each timer uses
          high-resolution timestamps to stay accurate, and it recalculates the
          correct remaining time after pauses or when your browser limits
          updates in the background.
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Countdown input formats
            </div>
            <div className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
              Enter <strong>ss</strong>, <strong>mm:ss</strong>, or{" "}
              <strong>h:mm:ss</strong> (for example <strong>90</strong>,{" "}
              <strong>05:00</strong>, <strong>1:15:00</strong>
              ). Presets are there if you just want to start fast.
            </div>
          </li>

          <li className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Stopwatch + laps
            </div>
            <div className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
              The stopwatch tracks precise elapsed time. Tap{" "}
              <strong>Lap</strong> to record splits and see both lap time and
              total time.
            </div>
          </li>

          <li className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Pomodoro + HIIT auto-runs
            </div>
            <div className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
              Pomodoro cycles through work and break blocks. HIIT runs warm-up,
              work/rest rounds, then cool-down. Use <strong>Skip</strong> when
              you want to advance to the next phase.
            </div>
          </li>

          <li className="ilt-surface-muted p-4">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen + keyboard control
            </div>
            <div className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
              Each timer supports fullscreen for visibility on TVs, projectors,
              or across a room. Click a timer display, then use{" "}
              <strong>Space</strong> (start/pause), <strong>R</strong> (reset),{" "}
              and <strong>F</strong> (fullscreen). Stopwatch adds{" "}
              <strong>L</strong> for lap, and Pomodoro/HIIT use{" "}
              <strong>N</strong> to skip.
            </div>
          </li>
        </ul>

        <div className="mt-4 ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">Privacy note:</strong> No account,
          no setup. Timing stays in your browser tab and starts instantly.
        </div>
      </div>
    </section>
  );
}

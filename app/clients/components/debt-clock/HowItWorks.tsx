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
   - Debt Clock intent: estimated counter from a starting value + yearly change.
   - Tool-focused, not a blog post.
   - Scenario-based with concrete example numbers users will experience here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/debt-clock",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;


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

  const ExampleBlock = ({
    title,
    subtitle,
    lines,
  }: {
    title: string;
    subtitle?: string;
    lines: string[];
  }) => (
    <div className="space-y-4">
      <div className="text-base font-semibold text-[var(--ilt-text-primary)]">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">{subtitle}</div>
      ) : null}
      <div className="mt-3 ilt-surface-muted p-4">
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Debt Clock</span>{" "}
              is an estimated on-screen debt counter. You give it a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                starting debt
              </span>{" "}
              and an{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                average yearly change
              </span>
              , and it continuously updates the displayed total as time passes.
              This is designed for moments where you want a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                big, readable number
              </span>{" "}
              on a screen and a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                clean copyable snapshot
              </span>{" "}
              for notes or slides.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The intent is simple: don’t make you fight formatting or UI.
              Presets give you quick starting points, Custom lets you enter your
              own numbers, fullscreen makes the number readable from a distance,
              and Copy produces a paste-ready snapshot that keeps assumptions
              attached (starting value, rate, and your “as of” label).
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The most important thing to understand is that this page is an{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                estimated counter
              </span>
              . It does not automatically fetch official debt totals. If you
              want a specific authority’s number, use that source to choose your
              starting debt and yearly change, then plug those values into{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Custom</span> and
              put the source/date in the “as of” label.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              If your goal is “a payoff vibe” or pacing rather than a public
              counter,{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/debt-repayment-timer")}
              >
                Debt Repayment Timer
              </a>{" "}
              may be a better fit. If you just need a big screen-friendly
              display for a talk, you may also pair this with{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/presentation-timer")}
              >
                Presentation Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/meeting-timer")}
              >
                Meeting Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Presets + Custom
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Estimated counter
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Pause + Reset
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy snapshot
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fast use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose
                a preset or select <Kbd>Custom</Kbd> and enter your numbers
                (starting debt, yearly change, and “as of” label).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Press{" "}
                <Kbd>Space</Kbd> to start/pause the counter. Use <Kbd>R</Kbd> to
                reset back to the starting debt.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen when you need a room-readable
                display. Exit with <Kbd>Esc</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Press{" "}
                <Kbd>C</Kbd> to copy a paste-ready snapshot (current estimate +
                assumptions).
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the running number actually means
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The main display is the current estimate at this moment:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  starting debt + (elapsed time × rate)
                </span>
                . The “rate” comes from your yearly change converted into a
                per-second amount. The number updates continuously, but it is
                still just math based on your inputs.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                That is why Copy includes your assumptions. When you paste the
                number, you also paste the context that makes it meaningful.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Getting the inputs right (without overthinking it)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold">Starting debt</span>: the
                baseline total you want to begin from (what Reset returns to).
              </li>
              <li>
                <span className="font-semibold">Yearly change</span>: the
                average net change per year. Positive increases the number,
                negative decreases it.
              </li>
              <li>
                <span className="font-semibold">“As of” label</span>: a human
                note (source + date). It doesn’t affect the math, but it helps
                keep snapshots traceable.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Shortcut tip:
              </span>{" "}
              If shortcuts do nothing, click the debt clock display once first so
              it has focus. Shortcuts do not fire while typing in inputs.
            </div>

            <div className="mt-3 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Reality check:
              </span>{" "}
              A yearly change of <span className="font-semibold">$1T</span> is
              about <span className="font-semibold">$31,709 per second</span>.
              If your per-second number looks wildly off, your yearly change is
              probably in the wrong units.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you’re controlling on this page
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            You are controlling three things: the{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">starting point</span>
            , the{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              speed and direction
            </span>{" "}
            of change, and how you want the result displayed and reused.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Starting debt is straightforward: it is the anchor value. Yearly
            change is where people make mistakes, because it is easy to mix
            “budget deficit,” “debt outstanding,” “net borrowing,” or
            “year-over-year change” when you pull numbers from a source. This
            page doesn’t try to interpret that for you. It simply applies the
            average yearly change you enter. That makes it flexible (you can
            match your source), but it also means the result is only as good as
            the assumptions you input.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Fullscreen and shortcuts are here for presentation moments. Pause
            lets you freeze the number when you want to talk about it. Reset
            gives you a consistent starting point so you can repeat a demo. Copy
            gives you a clean snapshot when you need to move the number into a
            doc, slide, or chat message.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These examples are intentionally concrete. They show the exact kinds
            of inputs and outputs that make sense on this page, including
            per-second rates and what a copied snapshot looks like when pasted
            into notes.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Slide deck number with assumptions attached"
              subtitle="You want a clean paste for a slide note or speaker notes"
              lines={[
                "Inputs (Custom):",
                "- Currency: USD",
                "- Starting debt: 34,000,000,000,000",
                "- Yearly change: 1,200,000,000,000",
                "- As of: Example source, 2026-01-01",
                "",
                "What the page shows:",
                "- Current estimated debt increases by about $38,051 per second.",
                "",
                "Example copied snapshot:",
                "Debt Clock: Custom",
                "As of: Example source, 2026-01-01",
                "Current (estimated): $34,000,228,306,000",
                "Starting: $34,000,000,000,000",
                "Yearly change: $1,200,000,000,000 / year",
                "Per second: $38,051.000 / second",
                "Disclosure: Estimated counter based on provided starting value and average rate.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Fullscreen “big number” during a talk"
              subtitle="You want the number readable from the back of the room"
              lines={[
                "Setup:",
                "- Press F to go fullscreen.",
                "- Press Space to start/pause as you speak.",
                "",
                "Example pacing:",
                "- Start at $300,000,000,000,000 (world-style scale example).",
                "- With yearly change of $9,000,000,000,000, the display moves about $285,388 per second.",
                "",
                "How you use it:",
                "- Pause to discuss the number at a fixed moment.",
                "- Reset to restart the demo at the same baseline.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: “What-if” change without breaking continuity"
              subtitle="You want to show how assumptions change the trajectory"
              lines={[
                "Starting point:",
                "- Starting debt: $5,000,000,000,000",
                "- Yearly change: $250,000,000,000 (about $7,927/sec)",
                "",
                "During discussion:",
                "- Change yearly change to $500,000,000,000 (about $15,854/sec).",
                "",
                "What happens:",
                "- The current displayed value stays continuous.",
                "- The counter immediately starts moving faster going forward.",
                "",
                "When to use Reset:",
                "- Reset if you want the new scenario to start from the original baseline.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Shrinking debt (negative yearly change)"
              subtitle="You want the counter to run down instead of up"
              lines={[
                "Inputs:",
                "- Currency: CAD",
                "- Starting debt: 1,400,000,000,000",
                "- Yearly change: -55,000,000,000",
                "- As of: Example reduction plan, 2026-02-01",
                "",
                "What the page shows:",
                "- The counter decreases by about $1,744 per second.",
                "",
                "How to present it:",
                "- Keep it running in fullscreen as a visual of steady reduction.",
                "- Copy snapshots at milestones for notes.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Quick internal note or chat message"
              subtitle="You want a paste that includes the rate and the source label"
              lines={[
                "Example message flow:",
                "- You pause at the moment you want to reference.",
                "- Press C to copy.",
                "- Paste into chat or notes.",
                "",
                "Example paste:",
                "Debt Clock: Custom",
                "As of: Budget update, 2026-02-15",
                "Current (estimated): $12,345,678,901",
                "Starting: $12,300,000,000",
                "Yearly change: $120,000,000 / year",
                "Per second: $3.805 / second",
                "Disclosure: Estimated counter based on provided starting value and average rate.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Picking the right tool so you don’t fight the UI"
              subtitle="A simple rule of thumb"
              lines={[
                "Use Debt Clock when:",
                "- You want a running big-number estimate that changes over time.",
                "- You want fullscreen + pause/reset for demos.",
                "- You want a copyable snapshot that includes assumptions.",
                "",
                "Use Debt Repayment Timer when:",
                "- You want a payoff or pacing view (timer-style).",
                "",
                "Use Presentation Timer / Meeting Timer when:",
                "- You also need session timing alongside the display.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (built for quick control)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Fullscreen exists so the debt total stays readable at a distance.
              Shortcuts keep the flow fast: <Kbd>Space</Kbd> start/pause,{" "}
              <Kbd>R</Kbd> reset, <Kbd>F</Kbd> fullscreen, and <Kbd>C</Kbd>{" "}
              copy. If shortcuts do nothing, click the debt clock display once so
              it has focus. Shortcuts do not fire while you are typing in
              inputs.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>R</Kbd> reset
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>C</Kbd> copy
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same ecosystem, different intent)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If your task is “big number” plus timing or payoff pacing, these
                are better matches.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>C</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/debt-repayment-timer")}>
              Debt Repayment Timer
            </PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/presentation-timer")}>
              Presentation Timer
            </PillLink>
            <PillLink href={abs("/meeting-timer")}>Meeting Timer</PillLink>
            <PillLink href={abs("/count-up-timer")}>Count Up Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (calculation model, continuity, fullscreen,
                copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Notes that matter if you rely on the number for a talk or notes
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Linear estimate (average rate)
              </div>
              <p className="mt-1 leading-relaxed">
                The counter is linear: it applies a constant per-second rate
                derived from your yearly change. It does not model compounding,
                interest, seasonality, or intra-year policy changes.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Year length and per-second conversion
              </div>
              <p className="mt-1 leading-relaxed">
                The tool uses a 365.25-day year to convert yearly change into a
                per-second rate. That is why the per-second value often includes
                decimals.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Continuity rules
              </div>
              <p className="mt-1 leading-relaxed">
                Changing the yearly change while running keeps the current
                displayed value and changes the slope going forward. Changing
                starting debt while running snaps the display to the new
                starting value.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen + clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  fullscreenchange
                </span>
                . Clipboard access can be restricted by browser policy; it is
                most reliable after a user gesture (click/tap).
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                What the copy snapshot includes
              </div>
              <p className="mt-1 leading-relaxed">
                Copy includes: preset name, “as of” label, current estimated
                total, starting debt, yearly change per year, per-second rate,
                and a short disclosure that it is an estimate based on provided
                inputs.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a payoff-style view?
            </strong>{" "}
            Try{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/debt-repayment-timer")}
            >
              Debt Repayment Timer
            </a>
            .
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need timing alongside it?
            </strong>{" "}
            Pair with{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/presentation-timer")}
            >
              Presentation Timer
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/meeting-timer")}
            >
              Meeting Timer
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

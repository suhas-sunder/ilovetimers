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
   - Debt Clock intent: live estimated counter from a starting value + yearly change.
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

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Debt Clock (live debt counter)",
    description:
      "Use Debt Clock to display an estimated debt total that updates in real time based on a starting amount and an average yearly change rate. Choose a preset or enter custom values, use fullscreen for a big display, pause/reset during demos, and copy a clean snapshot of the current estimate plus assumptions.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick a preset or switch to Custom",
        text: "Choose a preset for a quick starting point or select Custom to enter your own currency, starting debt, yearly change, and “as of” label.",
      },
      {
        "@type": "HowToStep",
        name: "Enter your starting debt and yearly change",
        text: "Starting debt is the baseline. Yearly change is the average net change per year (positive or negative). The tool converts the yearly change into a per-second rate for the live counter.",
      },
      {
        "@type": "HowToStep",
        name: "Use Start/Pause and Reset",
        text: "Start/Pause controls the live updating. Reset snaps back to your starting debt and restarts the counter from there.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for a big-number display",
        text: "Toggle fullscreen to fill the screen with the live total. Exit with Esc. In fullscreen you can tap/click the number area to start or pause quickly.",
      },
      {
        "@type": "HowToStep",
        name: "Copy a snapshot you can paste anywhere",
        text: "Copy outputs the current estimate plus the preset name, “as of” label, starting debt, yearly change, and per-second rate, along with a short disclosure that it is an estimate.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
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
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
      ) : null}
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="whitespace-pre-wrap font-mono text-xs text-slate-800">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-sky-700">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">Debt Clock</span>{" "}
              is a live, on-screen debt counter. You give it a{" "}
              <span className="font-semibold text-slate-900">
                starting debt
              </span>{" "}
              and an{" "}
              <span className="font-semibold text-slate-900">
                average yearly change
              </span>
              , and it continuously updates the displayed total as time passes.
              This is designed for moments where you want a{" "}
              <span className="font-semibold text-slate-900">
                big, readable number
              </span>{" "}
              on a screen and a{" "}
              <span className="font-semibold text-slate-900">
                clean copyable snapshot
              </span>{" "}
              for notes or slides.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The intent is simple: don’t make you fight formatting or UI.
              Presets give you quick starting points, Custom lets you enter your
              own numbers, fullscreen makes the number readable from a distance,
              and Copy produces a paste-ready snapshot that keeps assumptions
              attached (starting value, rate, and your “as of” label).
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The most important thing to understand is that this page is an{" "}
              <span className="font-semibold text-slate-900">
                estimated counter
              </span>
              . It does not automatically fetch official debt totals. If you
              want a specific authority’s number, use that source to choose your
              starting debt and yearly change, then plug those values into{" "}
              <span className="font-semibold text-slate-900">Custom</span> and
              put the source/date in the “as of” label.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              If your goal is “a payoff vibe” or pacing rather than a public
              counter,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/debt-repayment-timer")}
              >
                Debt Repayment Timer
              </a>{" "}
              may be a better fit. If you just need a big screen-friendly
              display for a talk, you may also pair this with{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/presentation-timer")}
              >
                Presentation Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/meeting-timer")}
              >
                Meeting Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Presets + Custom
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Live counter
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Pause + Reset
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Copy snapshot
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fast use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                a preset or select <Kbd>Custom</Kbd> and enter your numbers
                (starting debt, yearly change, and “as of” label).
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <Kbd>Space</Kbd> to start/pause the counter. Use <Kbd>R</Kbd> to
                reset back to the starting debt.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen when you need a room-readable
                display. Exit with <Kbd>Esc</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <Kbd>C</Kbd> to copy a paste-ready snapshot (current estimate +
                assumptions).
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What the live number actually means
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The main display is the current estimate at this moment:{" "}
                <span className="font-semibold text-slate-900">
                  starting debt + (elapsed time × rate)
                </span>
                . The “rate” comes from your yearly change converted into a
                per-second amount. That makes the counter feel like a live feed,
                but it’s still just math based on your inputs.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                That is why Copy includes your assumptions. When you paste the
                number, you also paste the context that makes it meaningful.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Getting the inputs right (without overthinking it)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
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

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Shortcut tip:
              </span>{" "}
              If shortcuts do nothing, click the debt clock card once first so
              it has focus. Shortcuts do not fire while typing in inputs.
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
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
          <h3 className="text-lg font-semibold text-sky-700">
            What you’re controlling on this page
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            You are controlling three things: the{" "}
            <span className="font-semibold text-slate-900">starting point</span>
            , the{" "}
            <span className="font-semibold text-slate-900">
              speed and direction
            </span>{" "}
            of change, and how you want the result displayed and reused.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Starting debt is straightforward: it is the anchor value. Yearly
            change is where people make mistakes, because it is easy to mix
            “budget deficit,” “debt outstanding,” “net borrowing,” or
            “year-over-year change” when you pull numbers from a source. This
            page doesn’t try to interpret that for you. It simply applies the
            average yearly change you enter. That makes it flexible (you can
            match your source), but it also means the result is only as good as
            the assumptions you input.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Fullscreen and shortcuts are here for “use it live” moments. Pause
            lets you freeze the number when you want to talk about it. Reset
            gives you a consistent starting point so you can repeat a demo. Copy
            gives you a clean snapshot when you need to move the number into a
            doc, slide, or chat message.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
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
                "- You want a live big-number estimate that changes over time.",
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (built for live control)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen exists so the debt total stays readable at a distance.
              Shortcuts keep the flow fast: <Kbd>Space</Kbd> start/pause,{" "}
              <Kbd>R</Kbd> reset, <Kbd>F</Kbd> fullscreen, and <Kbd>C</Kbd>{" "}
              copy. If shortcuts do nothing, click the debt clock card once so
              it has focus. Shortcuts do not fire while you are typing in
              inputs.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>R</Kbd> reset
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>C</Kbd> copy
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same ecosystem, different intent)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                If your task is “big number” plus timing or payoff pacing, these
                are better matches.
              </p>
            </div>
            <div className="text-xs text-slate-600">
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
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (calculation model, continuity, fullscreen,
                copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter if you rely on the number for a talk or notes
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Linear estimate (average rate)
              </div>
              <p className="mt-1 leading-relaxed">
                The counter is linear: it applies a constant per-second rate
                derived from your yearly change. It does not model compounding,
                interest, seasonality, or intra-year policy changes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Year length and per-second conversion
              </div>
              <p className="mt-1 leading-relaxed">
                The tool uses a 365.25-day year to convert yearly change into a
                per-second rate. That is why the per-second value often includes
                decimals.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Continuity rules
              </div>
              <p className="mt-1 leading-relaxed">
                Changing the yearly change while running keeps the current
                displayed value and changes the slope going forward. Changing
                starting debt while running snaps the display to the new
                starting value.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen + clipboard permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on{" "}
                <span className="font-semibold text-slate-900">
                  fullscreenchange
                </span>
                . Clipboard access can be restricted by browser policy; it is
                most reliable after a user gesture (click/tap).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
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
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Want a payoff-style view?
            </strong>{" "}
            Try{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/debt-repayment-timer")}
            >
              Debt Repayment Timer
            </a>
            .
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need timing alongside it?
            </strong>{" "}
            Pair with{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/presentation-timer")}
            >
              Presentation Timer
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
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

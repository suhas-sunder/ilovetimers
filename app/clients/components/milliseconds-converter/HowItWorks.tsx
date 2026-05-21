import React from "react";
import { Link } from "react-router";

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
   - Milliseconds Converter intent: ms ⇄ seconds conversion, exact decimals, copy-ready output, quick examples
   - Tool-focused, not a tutorial article
   - Scenario-based with concrete examples and numbers users will see here
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/milliseconds-converter",
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
    name: "How to convert milliseconds to seconds (and seconds to milliseconds) instantly",
    description:
      "Use the Milliseconds Converter to switch between milliseconds (ms) and seconds (s) with exact decimal behavior. Paste values like 16.67, 1000, or 0.01667, then copy a clean conversion line. Includes quick examples and reset.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a direction",
        text: "Select ms → seconds or seconds → ms depending on what you have and what you need.",
      },
      {
        "@type": "HowToStep",
        name: "Paste a value",
        text: "Type or paste a number (decimals supported). Commas in pasted values are ignored.",
      },
      {
        "@type": "HowToStep",
        name: "Read the exact result",
        text: "The result updates instantly when the input is valid. The conversion is performed by shifting the decimal point (÷1000 or ×1000) to avoid floating-point rounding surprises.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the conversion line",
        text: "Click Copy to copy a full line like “1500 ms = 1.5 seconds” (or the reverse) for easy pasting into notes, tickets, docs, or spreadsheets.",
      },
      {
        "@type": "HowToStep",
        name: "Use examples or reset",
        text: "Tap a quick example to populate the tool, or click Reset to return to 1000 ms and 1 second.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
      {children}
    </kbd>
  );

  const PillLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
    >
      {children} →
    </Link>
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
    <div className="ilt-surface-card p-5">
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
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                converter
              </span>{" "}
              is built for one job: convert{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                milliseconds (ms)
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds (s)</span>{" "}
              and convert seconds back to milliseconds, instantly. It is
              designed for the moments when you do not want to “do the math in
              your head” or fight rounding issues, and you want a result you can
              copy into a ticket, note, spec, spreadsheet, or code comment.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The interface is intentionally minimal: you choose a direction (ms
              → seconds or seconds → ms), paste a value, and the other value
              updates as soon as the input is valid. The output is built to be
              copy-friendly. It does not force a fixed number of decimals, and
              it avoids floating-point “almost” values by performing the
              conversion as a decimal shift whenever possible.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This matters most in real workflows: you might be interpreting a
              latency figure from logs, comparing a frame-time number, entering
              a timeout value in a configuration file, or cleaning numbers
              pasted from a spreadsheet. In those cases, you want the unit
              conversion to be correct and the formatting to be clean. This page
              is tuned for exactly that: fast conversions, predictable
              formatting, quick examples, and a one-click copy line that
              includes both units.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              ms ⇄ seconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Exact decimals
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Flexible input
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy line
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Examples
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Reset
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose
                a direction:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  ms → seconds
                </span>{" "}
                if your number is in milliseconds, or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  seconds → ms
                </span>{" "}
                if your number is in seconds.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Paste a
                value. Decimals are allowed, and commas are ignored (so{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1,500</span>{" "}
                works).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Read
                the result instantly. If the input is not valid, the result
                shows a clear “enter a valid value” message.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Click{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> to
                copy a full conversion line, including both units (for example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  1500 ms = 1.5 seconds
                </span>
                ).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Tap a
                quick example to populate the tool, or use Reset to return to
                the common baseline{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1000 ms</span> ↔{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1</span> second.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “exact decimals” means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Many calculators convert using floating-point math and then
                round, which can introduce tiny artifacts. This tool avoids that
                by performing conversions by shifting the decimal point by{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">3 places</span>{" "}
                when possible. Converting milliseconds to seconds is the same as
                dividing by{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span>, and
                converting seconds to milliseconds is multiplying by 1000. A
                decimal shift captures that cleanly:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">16.67</span> ms
                becomes{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>{" "}
                seconds, and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>{" "}
                seconds becomes{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">16.67</span> ms.
                The output is then normalized (unneeded trailing zeros removed)
                so it is easy to copy and compare.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If nothing converts, check the input: it must be numeric
                (digits, optional sign, optional decimal point). Commas are
                okay.
              </li>
              <li>
                Use examples for common values like{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span> ms (1
                second) and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">500</span> ms
                (0.5 s).
              </li>
              <li>
                If you are unsure about units, convert both directions and
                confirm you get the same value back (ms → s → ms).
              </li>
              <li>
                Need to work with minutes/hours/days too? Use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-calculator"
                >
                  Time Calculator
                </Link>
                .
              </li>
              <li>
                Timing something live? Use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/stopwatch"
                >
                  Stopwatch
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Quick keys:</span>{" "}
              <Kbd>C</Kbd> copy, <Kbd>R</Kbd> reset (if your page wiring
              supports shortcuts).
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this converter is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            Milliseconds show up everywhere because they are small enough to
            represent delays, frame times, timeouts, polling intervals, and
            latency numbers. Seconds show up everywhere because they are easier
            to read and compare. The problem is that the conversion itself is
            simple, but the workflow around it is usually messy: you are copying
            values between tools, dealing with decimal precision, or trying to
            confirm what a number “means” in human terms.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            This converter focuses on the practical parts of that workflow. It
            accepts flexible input (including values like{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">.5</span> or{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">12.</span>), cleans
            commas for pasted values, performs the conversion with exact decimal
            behavior, and produces a copyable line that includes both units so
            you do not lose context when pasting.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The copy line is intentionally explicit. When you paste a value into
            a note or ticket, “0.25” by itself is ambiguous. A line like{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              250 ms = 0.25 seconds
            </span>{" "}
            carries the meaning with it. If you are scanning a list later, you
            know which side is which without re-checking the original input.
          </p>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Common millisecond references
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              These are the baseline conversions people check most often:
              <span className="font-semibold text-[var(--ilt-text-primary)]"> 1000 ms = 1 second</span>,
              <span className="font-semibold text-[var(--ilt-text-primary)]"> 60000 ms = 1 minute</span>,
              <span className="font-semibold text-[var(--ilt-text-primary)]"> 3600000 ms = 1 hour</span>,
              and
              <span className="font-semibold text-[var(--ilt-text-primary)]"> 86400000 ms = 1 day</span>.
              They are useful when translating configuration timeouts, video or
              audio offsets, game and animation timings, lab timing notes, and
              stopwatch-style measurements into a unit people can read.
            </p>
          </div>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete examples (what you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The examples below match what this page does: validate your input,
            show the converted value immediately, and provide a copyable line.
            Each scenario uses numbers that people commonly encounter when
            working with milliseconds and seconds.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: You have a timeout in milliseconds, but you want seconds"
              subtitle="Common when reading config values or logs."
              lines={[
                "You see: 1500 ms (timeout)",
                "You want: seconds for a note or review",
                "",
                "ms → seconds:",
                "- Input: 1500",
                "- Result: 1.5",
                "",
                "Copy line:",
                "- 1500 ms = 1.5 seconds",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: A delay is listed in seconds, but an API expects milliseconds"
              subtitle="Common when wiring UI or scheduling code."
              lines={[
                "You have: 0.25 seconds",
                "You need: milliseconds",
                "",
                "seconds → ms:",
                "- Input: 0.25",
                "- Result: 250",
                "",
                "Copy line:",
                "- 0.25 seconds = 250 ms",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Frame time around 60 fps (16.67 ms)"
              subtitle="A number people frequently sanity-check."
              lines={[
                "You see: 16.67 ms (frame time)",
                "You want: seconds for comparisons",
                "",
                "ms → seconds:",
                "- Input: 16.67",
                "- Result: 0.01667",
                "",
                "Copy line:",
                "- 16.67 ms = 0.01667 seconds",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Batch cleanup from a spreadsheet (commas and odd formats)"
              subtitle="The tool normalizes input so you can paste clean numbers back."
              lines={[
                "You pasted: 1,500",
                "You want: seconds",
                "",
                "ms → seconds:",
                "- Input: 1,500",
                "- Result: 1.5",
                "",
                "Other valid inputs:",
                "- 12.  → 0.012 seconds",
                "- .5  → 0.0005 seconds",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Negative values from a delta or offset"
              subtitle="Useful for logs that record signed differences."
              lines={[
                "You see: -250 ms",
                "You want: seconds",
                "",
                "ms → seconds:",
                "- Input: -250",
                "- Result: -0.25",
                "",
                "Copy line:",
                "- -250 ms = -0.25 seconds",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Round-trip check to confirm you’re using the right unit"
              subtitle="A quick way to avoid ms vs seconds confusion."
              lines={[
                "Start with: 0.01667 seconds",
                "Convert seconds → ms:",
                "- 0.01667 seconds = 16.67 ms",
                "",
                "Flip back ms → seconds:",
                "- 16.67 ms = 0.01667 seconds",
                "",
                "If the round-trip matches, you’re using the expected unit.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Pick the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This route is specifically for milliseconds ↔ seconds conversion.
              If you need to add or subtract durations across multiple units,
              use the time calculator. If you want to measure real elapsed time,
              use stopwatch. If you want to run multiple timers at once, use
              multiple timers.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Time math:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-calculator"
              >
                Time Calculator
              </Link>
              . Live timing:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/stopwatch"
              >
                Stopwatch
              </Link>
              . Multiple timers:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/multiple-timers"
              >
                Multiple Timers
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Use the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Common baseline: <Kbd>1000</Kbd> ms = <Kbd>1</Kbd> second
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/time-calculator">Time Calculator</PillLink>
            <PillLink to="/epoch-unix-time-clock">
              Epoch Unix Time Clock
            </PillLink>
            <PillLink to="/stopwatch">Stopwatch</PillLink>
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/online-timer">Online Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (accepted formats, validation, exact
                conversion)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on exact parsing behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Accepted numeric formats
              </div>
              <p className="mt-1 leading-relaxed">
                Inputs support optional sign and decimal point. Examples:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1000</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">12.</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">.5</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">-250</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0.01667</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">+10.2</span>.
                Commas in pasted values are ignored (for example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1,500</span>).
              </p>
              <p className="mt-2 leading-relaxed">
                If the input contains letters, currency symbols, or multiple
                decimals, it will not convert.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Exact conversion behavior
              </div>
              <p className="mt-1 leading-relaxed">
                ms → seconds shifts the decimal point left by{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">3</span> places
                (÷1000). seconds → ms shifts right by 3 places (×1000). This
                avoids typical floating-point rounding artifacts and keeps
                decimal text stable for copy/paste.
              </p>
              <p className="mt-2 leading-relaxed">
                Output is normalized: leading zeros are cleaned, and unnecessary
                trailing zeros are trimmed (for example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">001.5000</span>{" "}
                becomes{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1.5</span>).
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Copy behavior</div>
              <p className="mt-1 leading-relaxed">
                Copy writes a formatted conversion line to your clipboard (for
                example{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  0.25 seconds = 250 ms
                </span>
                ). If clipboard permission is blocked, the page attempts a safe
                fallback copy method.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Doing time math?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/time-calculator"
            >
              Time Calculator
            </Link>{" "}
            to add/subtract durations across units.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Timing something live?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/stopwatch"
            >
              Stopwatch
            </Link>{" "}
            for measurement, not conversion.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          milliseconds converter instantly converts ms to seconds and seconds to
          ms with exact decimal behavior, validates input, normalizes output,
          and provides quick examples and a copy-ready conversion line for
          practical use.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/milliseconds-converter")}
        </span>
      </div>
    </section>
  );
}

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
   - Military Time Converter intent: 24-hour ⇄ AM/PM conversion, fast copy, presets, fullscreen
   - Tool-focused, not a history/teaching article
   - Scenario-based with concrete examples and numbers users will see here
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/military-time-converter",
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
    name: "How to convert military time to AM/PM (and back) instantly",
    description:
      "Use the Military Time Converter to switch between 24-hour (military) time and standard AM/PM time. Paste times like 1730 or 17:30, or enter 5:30 PM, then copy the result. Includes presets, fullscreen mode, and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Enter a time in either format",
        text: "Type or paste a military time (e.g., 1730 or 17:30) or a standard time with AM/PM (e.g., 5:30 PM).",
      },
      {
        "@type": "HowToStep",
        name: "Confirm the result updates",
        text: "When the input is valid, the opposite side updates immediately and the big display shows the current result.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the result",
        text: "Click Copy to copy the current result. In fullscreen, tap/click the big result to copy quickly.",
      },
      {
        "@type": "HowToStep",
        name: "Use presets or current time",
        text: "Tap an example like 0000, 1200, 1730, or 2400, or press N to fill the current local time in both formats.",
      },
      {
        "@type": "HowToStep",
        name: "Optional: fullscreen + shortcuts",
        text: "Press F for fullscreen (Esc exits). Use C to copy AM/PM, M to copy military, and R to clear.",
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
              is built for fast, copy-ready conversion between{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                24-hour (military)
              </span>{" "}
              time and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">AM/PM</span> time.
              You can paste{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">1730</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">0730</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">0000</span>, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">17:30</span> on the
              military side, or enter{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">5:30 PM</span>,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">12 AM</span>, or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">9 PM</span> on the
              standard side. When your input is valid, the other side updates
              instantly so you can copy the exact time format you need.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is not trying to be a long tutorial. It is designed for
              the moment you are converting times in real life: a schedule that
              uses <span className="font-semibold text-[var(--ilt-text-primary)]">24-hour</span>{" "}
              format, a message that uses{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">AM/PM</span>, or a
              form where you must enter time consistently. That is why the
              interface includes a big result display, one-click copy, quick
              examples, and fullscreen mode for rapid repeated copying.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The display always shows the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                current conversion result
              </span>{" "}
              based on the input you are actively editing. If you are typing
              military time, the big display shows the AM/PM result. If you are
              typing AM/PM, the big display shows the military result. This
              sounds small, but it helps you avoid copying the wrong side when
              you are moving quickly through a list of times.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              24-hour ⇄ AM/PM
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Flexible input
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Normalized output
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Shortcuts
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Paste a
                time into either input.
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  {" "}
                  Military
                </span>{" "}
                examples: 1730, 0730, 17:30, 0000.{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Standard
                </span>{" "}
                examples: 5:30 PM, 12 AM, 9 PM.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Watch
                the other side update when the input is valid. The big display
                shows the current result and a status line confirms validity.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Click{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Copy result
                </span>{" "}
                to copy the conversion. If you are in fullscreen, tap/click the
                big result to copy.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Repeat
                for the next time. If you are converting many entries, press{" "}
                <Kbd>F</Kbd> to go fullscreen and copy from the big display.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Need
                “right now” in both formats? Press <Kbd>N</Kbd> to fill the
                current local time on both sides.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “normalized” means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Normalized output is the tool’s way of giving you a consistent,
                copy-friendly version of the time you entered. If you paste a
                messy value like{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">7:3</span>, the
                tool treats it as 7 hours and 3 minutes and normalizes it to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">07:03</span>{" "}
                (military) or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">7:03 AM</span>{" "}
                (standard), depending on which side you are converting. This is
                useful when you want outputs that are consistent across a list,
                without manually adding leading zeros.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If AM/PM isn’t converting, it probably needs{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">AM</span> or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">PM</span>.
                Standard time won’t guess.
              </li>
              <li>
                Military hours must be 0–23 and minutes must be 00–59. The tool
                also accepts{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">2400</span> for
                midnight and shows a note.
              </li>
              <li>
                If shortcuts do nothing, click the converter card once so it has
                focus.
              </li>
              <li>
                Converting between places? Use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-zone-converter"
                >
                  Time Zone Converter
                </Link>
                .
              </li>
              <li>
                Doing duration math (add/subtract time)? Use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-calculator"
                >
                  Time Calculator
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>N</Kbd> now, <Kbd>C</Kbd> copy AM/PM, <Kbd>M</Kbd> copy
              military, <Kbd>R</Kbd> clear, <Kbd>F</Kbd> fullscreen,{" "}
              <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this converter is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            In real workflows, time conversion usually happens under mild time
            pressure: you are reading a roster, replying to a message, copying
            times into a form, or double-checking a schedule. The two most
            common mistakes are (1) mixing up AM and PM and (2) copying a time
            in the wrong format. This page is designed to reduce those mistakes
            by requiring AM/PM on the standard side, validating ranges on both
            sides, and showing a large “current result” that matches the input
            you are actively working on.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            It is also designed for speed. If you are converting a list of times
            (for example: 0630, 0815, 1045, 1730), you should not have to select
            text carefully each time. That is why copy buttons exist next to
            each input and why fullscreen lets you copy by tapping the large
            display. You can also use presets to confirm edge cases like{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">0000</span> and{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">2400</span> without
            typing.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete examples (what you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The examples below match what this page does: validate your input,
            show the converted value, show a normalized form, and let you copy.
            Each scenario uses real times people commonly convert.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Reading a schedule in 24-hour time"
              subtitle="You need AM/PM for a message."
              lines={[
                "You see: 1730 (in a schedule)",
                "You need to send: AM/PM format",
                "",
                "What you do:",
                "- Paste 1730 into Military (24-hour)",
                "",
                "What you get:",
                "- Standard time: 5:30 PM",
                "- Normalized military: 1730",
                "",
                "Copy:",
                "- Click Copy result to copy: 5:30 PM",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Converting early morning times with leading zeros"
              subtitle="Leading zeros matter in 24-hour time."
              lines={[
                "You see: 0730",
                "You need: AM/PM",
                "",
                "Paste 0730 → Result:",
                "- Standard time: 7:30 AM",
                "- Normalized military: 0730",
                "",
                "Common follow-ups:",
                "- 0600 → 6:00 AM",
                "- 0000 → 12:00 AM",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: You have AM/PM and need military for a form"
              subtitle="Forms often require HHMM."
              lines={[
                "You need to enter: military time",
                "You have: 9:05 PM",
                "",
                "What you do:",
                "- Type 9:05 PM into Standard (AM/PM)",
                "",
                "What you get:",
                "- Military time: 2105",
                "- Normalized standard: 9:05 PM",
                "",
                "Copy:",
                "- Click Copy military to copy: 2105",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Noon and midnight without second-guessing"
              subtitle="The two most common confusion points."
              lines={[
                "Noon:",
                "- 1200 → 12:00 PM",
                "",
                "Midnight (start of day):",
                "- 0000 → 12:00 AM",
                "",
                "Midnight (end of day, common in schedules):",
                "- 2400 → 12:00 AM",
                "- Note shown: 2400 is treated as 00:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Converting a list quickly (copy workflow)"
              subtitle="Use fullscreen when you’re doing a batch."
              lines={[
                "You have a list: 0615, 0815, 1045, 1730, 2210",
                "Goal: paste AM/PM equivalents into a message",
                "",
                "Workflow:",
                "- Click the card once (focus)",
                "- Press F for fullscreen",
                "- Paste each time into Military, tap the big result to copy",
                "",
                "Examples you will see:",
                "- 0615 → 6:15 AM",
                "- 0815 → 8:15 AM",
                "- 1045 → 10:45 AM",
                "- 1730 → 5:30 PM",
                "- 2210 → 10:10 PM",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Cleaning up messy inputs from chat"
              subtitle="Normalization makes output consistent."
              lines={[
                "You receive: '7:3' (someone typed quickly)",
                "You want: a clean, copy-ready time",
                "",
                "Paste 7:3 into Military (colon format) → Result:",
                "- Standard time: 7:03 AM",
                "- Normalized military: 0703 (same time, consistent formatting)",
                "",
                "Another example:",
                "- '5 pm' → 1700",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Pick the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This route is for converting time formats (24-hour ⇄ AM/PM). If
              you need to convert between locations or time zones, use the time
              zone converter. If you need to add or subtract time durations, use
              the time calculator. If you want a “what time is it right now”
              display, use current local time or atomic clock.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Time zones:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-zone-converter"
              >
                Time Zone Converter
              </Link>
              . Durations:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-calculator"
              >
                Time Calculator
              </Link>
              . Reference:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/current-local-time"
              >
                Current Local Time
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/atomic-clock"
              >
                Atomic Clock
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
              Shortcuts: <Kbd>N</Kbd> <Kbd>C</Kbd> <Kbd>M</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>R</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/time-calculator">Time Calculator</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/atomic-clock">Atomic Clock</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (accepted formats, validation, 2400 behavior)
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
                Military parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Military input accepts digits (HHMM, HMM, HH, H) and colon
                formats (HH:MM, H:MM). Digits are interpreted as hours +
                minutes: 7 → 07:00, 730 → 07:30, 1730 → 17:30. Colon forms like
                17:30 and 5:30 are accepted.
              </p>
              <p className="mt-2 leading-relaxed">
                Hours must be 0–23. Minutes must be 00–59. The special case 2400
                is accepted and treated as 00:00 (midnight).
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Standard parsing rules
              </div>
              <p className="mt-1 leading-relaxed">
                Standard input requires AM or PM. Minutes are optional: 5 PM is
                treated as 5:00 PM. Hours must be 1–12 and minutes must be
                00–59. The tool normalizes output to a consistent “h:mm AM/PM”
                format.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Why AM/PM is required
              </div>
              <p className="mt-1 leading-relaxed">
                Without AM or PM, “5:30” is ambiguous. Rather than guessing, the
                converter asks for AM/PM so you do not copy the wrong time into
                a schedule, message, or form.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen + copy behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen targets the converter card element. In fullscreen,
                the big result display acts like a copy button so you can copy
                quickly while working through multiple times.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Converting between places?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/time-zone-converter"
            >
              Time Zone Converter
            </Link>{" "}
            for location-aware conversions.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Doing time math?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/time-calculator"
            >
              Time Calculator
            </Link>{" "}
            to add/subtract durations.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          military time converter instantly converts 24-hour time to AM/PM and
          AM/PM to 24-hour time, validates and normalizes inputs, and provides
          copy buttons, presets, fullscreen mode, and keyboard shortcuts so you
          can move through conversions quickly and confidently.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/military-time-converter")}
        </span>
      </div>
    </section>
  );
}

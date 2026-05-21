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
   - Morse Code Clock intent: live local time rendered as Morse digits,
     block + text views, 12/24-hour toggle, seconds toggle, fullscreen, copy,
     keyboard shortcuts
   - Tool-focused, not a tutorial article
   - Scenario-based with concrete examples and numbers users will see here
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/morse-code-clock",
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
    name: "How to use the Morse Code Clock to read the current time as dots and dashes",
    description:
      "Use the Morse Code Clock to see your current local time encoded as Morse digits. Switch between block view and text view, toggle 12/24-hour time and seconds, go fullscreen for a room-readable display, and copy the time plus Morse output with one click.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Read the current time",
        text: "Open the page to see your local time at the top and the Morse output below. The clock updates automatically.",
      },
      {
        "@type": "HowToStep",
        name: "Choose Blocks or Text view",
        text: "Use View (or press V) to switch between block shapes (dots and dashes) and the raw Morse text strings.",
      },
      {
        "@type": "HowToStep",
        name: "Set your preferred format",
        text: "Toggle 24-hour (T) and Seconds (S). The Morse output matches what is shown in the time display.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen if needed",
        text: "Click Fullscreen or press F after clicking the clock card once. Press Esc to exit fullscreen.",
      },
      {
        "@type": "HowToStep",
        name: "Copy the output",
        text: "Click Copy (or press C) to copy both the time and the Morse representation to your clipboard.",
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
      <JsonLd data={howToLd} />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Morse Code Clock
              </span>{" "}
              shows your current local time and renders each digit as Morse code
              (dots and dashes). It is designed for practical use, not fluff:
              you can read the time in Morse at a glance, switch between a
              highly readable block display and the raw text strings, toggle
              seconds and 12/24-hour format, go fullscreen for demos, and copy
              the output in one click.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The page is intentionally “clock first.” The top line is always a
              normal time you recognize (for example,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">09:17:42</span>),
              so you have a reliable reference. The Morse section underneath is
              the same time, encoded digit-by-digit. That means you can practice
              reading Morse without losing track of the real time.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Two viewing styles solve two different problems.{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Block view</span>{" "}
              uses simple shapes so you can read from a distance and quickly
              spot patterns.{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Text view</span>{" "}
              shows the exact Morse strings, which is ideal if you want to copy,
              compare, or verify what you are seeing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Live time
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Blocks + text
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              12/24-hour
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy output
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Decide
                whether you want a practice display (seconds on) or a clean wall
                clock (seconds off).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Blocks</span> for
                readability or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Text</span> to
                see the exact dot and dash strings.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Toggle{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">24-hour</span> if
                you want consistent hour digits (especially helpful for
                practice).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span>{" "}
                for a room display, classroom demo, or second monitor.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Hit{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> when
                you want to paste the time and Morse output into notes or a
                message.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the page is encoding for you
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The tool takes the digits from the displayed time and converts
                each one using standard Morse number patterns. When seconds are
                visible, you get six digits encoded (HHMMSS). When seconds are
                hidden, you get four digits encoded (HHMM). The colon separators
                are just separators for readability, not Morse characters.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                For learning: use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">seconds on</span>{" "}
                so the Morse changes often.
              </li>
              <li>
                For a clean display: use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  seconds off
                </span>{" "}
                and go fullscreen.
              </li>
              <li>
                For consistency: enable{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">24-hour</span> so
                hours always have two digits.
              </li>
              <li>
                If shortcuts do nothing: click the clock card once to focus it.
              </li>
              <li>
                If you are coordinating across places: use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-zone-converter"
                >
                  Time Zone Converter
                </Link>{" "}
                for time zone translation.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Quick keys:</span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>T</Kbd> 24-hour, <Kbd>S</Kbd>{" "}
              seconds, <Kbd>V</Kbd> view, <Kbd>C</Kbd> copy, <Kbd>Esc</Kbd>{" "}
              exit.
            </div>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Compare:</span>{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/binary-clock"
              >
                Binary Clock
              </Link>{" "}
              and{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/hexadecimal-clock"
              >
                Hexadecimal Clock
              </Link>
              .
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you are seeing in the Morse output
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            Morse digits have a reliable structure, which is why this tool works
            well as a quick practice clock. The patterns for 1 through 5 start
            with dots then add dashes, and 6 through 0 start with dashes then
            add dots. In practice, you do not need to memorize everything at
            once. Many people start by recognizing the extremes quickly:{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">0</span> is five
            dashes (<span className="font-semibold text-[var(--ilt-text-primary)]">-----</span>)
            and <span className="font-semibold text-[var(--ilt-text-primary)]">5</span> is five
            dots (<span className="font-semibold text-[var(--ilt-text-primary)]">.....</span>).
            From there, you spot the “shift point” around 5 and 6.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            This page keeps the normal time visible because it makes learning
            faster. You can glance at the real time, then verify the Morse
            groups below. If you are practicing, it is common to cover the top
            time line with your hand for a moment, attempt to read the Morse
            digits, then remove your hand to check your answer.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete examples (real outputs you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These scenarios are written like real “screen moments” with actual
            digits, realistic times, and the exact style of output this page
            produces. Your values will vary based on the current time, but the
            format is the same. Each example includes the normal time and the
            Morse representation that matches the digits on screen.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Practice mode during a short break"
              subtitle="Seconds on, 24-hour on, Text view for verification."
              lines={[
                "Settings:",
                "- 24-hour: On",
                "- Seconds: On",
                "- View: Text",
                "",
                "Time:",
                "09:17:42",
                "",
                "Digit-by-digit Morse (HH / MM / SS):",
                "0 = -----",
                "9 = ----.",
                "1 = .----",
                "7 = --...",
                "4 = ....-",
                "2 = ..---",
                "",
                "Morse output shown on the page:",
                "----- ----. / .---- --... / ....- ..---",
                "",
                "How you use it:",
                "- Try reading just the minutes first: 17 is .---- --...",
                "- Then check yourself against the normal time at the top.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Clean wall display on a second monitor"
              subtitle="Seconds off, Blocks view, fullscreen for distance reading."
              lines={[
                "Settings:",
                "- 24-hour: On",
                "- Seconds: Off",
                "- View: Blocks",
                "- Fullscreen: On",
                "",
                "Time:",
                "14:06",
                "",
                "Digit-by-digit Morse (HH / MM):",
                "1 = .----",
                "4 = ....-",
                "0 = -----",
                "6 = -....",
                "",
                "What you notice in Blocks view:",
                "- The 0 is all dashes (five long bars).",
                "- The 6 starts with a dash then dots (one bar, four dots).",
                "",
                "Why this works well:",
                "- The display is stable and readable across the room.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Teaching or demoing Morse numbers"
              subtitle="You want a predictable classroom flow with quick checks."
              lines={[
                "Settings:",
                "- 24-hour: Off (12-hour)",
                "- Seconds: On",
                "- View: Blocks (to show patterns clearly)",
                "",
                "Time:",
                "11:05:30",
                "",
                "Digit-by-digit Morse (HH / MM / SS):",
                "1 = .----",
                "1 = .----",
                "0 = -----",
                "5 = .....",
                "3 = ...--",
                "0 = -----",
                "",
                "Quick prompts that work in real time:",
                "- 'Find the 5' (it is the only all-dots group).",
                "- 'Find the 0' (it is the only all-dashes group).",
                "- 'Spot the 3' (three dots, then two dashes).",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Sharing the output in a message"
              subtitle="Copy gives you a paste-ready block for notes or chat."
              lines={[
                "You click Copy (or press C).",
                "",
                "Example clipboard content:",
                "Time: 07:58",
                "Morse: ----- --... / ..... ---..",
                "",
                "What this means:",
                "- 07 is 0 then 7 in Morse (----- then --...).",
                "- 58 is 5 then 8 in Morse (..... then ---..).",
                "",
                "Practical use:",
                "- Paste into a study log: 'I can read 58 instantly now.'",
                "- Paste into slides for a quick demo without retyping.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Time zone coordination"
              subtitle="This clock shows local device time. Convert when needed."
              lines={[
                "Example situation:",
                "- You are in Toronto and see 16:20:15 on the page.",
                "- A friend in London asks what time that is for them.",
                "",
                "What you do:",
                "- Keep the Morse Code Clock open as your reference.",
                "- Convert 16:20 (or 16:20:15) using Time Zone Converter.",
                "",
                "Fast link:",
                "- /time-zone-converter",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: When a different tool is a better fit"
              subtitle="Same site, different job. Pick the closest match."
              lines={[
                "If you want the most accurate time reference:",
                "- Atomic Clock (/atomic-clock)",
                "",
                "If you need a standard big readable clock:",
                "- Digital Clock (/digital-clock)",
                "",
                "If you want time in multiple locations:",
                "- World Clock (/world-clock)",
                "",
                "If you want another 'encoded' display style:",
                "- Binary Clock (/binary-clock) or Hexadecimal Clock (/hexadecimal-clock)",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Choosing the right settings for your goal
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If your goal is learning, leave{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds on</span>{" "}
              so you get frequent changes and more repetition. If your goal is a
              display, turn{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds off</span>{" "}
              for a calmer screen. For consistency,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">24-hour</span> is
              typically easier because you always see two hour digits, which
              avoids the “single digit hour” mental adjustment.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you want to cross-check what you are seeing, switch to{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Text view</span>{" "}
              and verify one group at a time. A common pattern is to master the
              minutes first, then hours, then seconds.
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
              Shortcut set: <Kbd>F</Kbd> <Kbd>T</Kbd> <Kbd>S</Kbd> <Kbd>V</Kbd>{" "}
              <Kbd>C</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/utc-clock">UTC Clock</PillLink>
            <PillLink to="/atomic-clock">Atomic Clock</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/binary-clock">Binary Clock</PillLink>
            <PillLink to="/hexadecimal-clock">Hexadecimal Clock</PillLink>
            <PillLink to="/roman-numeral-clock">Roman Numeral Clock</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (updates, digit mapping, fullscreen,
                clipboard)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on exact behavior and expectations
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Update cadence and stability
              </div>
              <p className="mt-1 leading-relaxed">
                The clock schedules updates to land on the next second boundary.
                This reduces visual jitter and keeps the display feeling like a
                real clock rather than a timer that drifts.
              </p>
              <p className="mt-2 leading-relaxed">
                When seconds are off, the top display still updates, but the
                visible time changes only as minutes change.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Standard Morse digit mapping
              </div>
              <p className="mt-1 leading-relaxed">
                Each digit uses the standard Morse number patterns: 1 is .----
                through 5 is ....., then 6 is -.... through 0 is -----.
              </p>
              <p className="mt-2 leading-relaxed">
                The separators between HH and MM (and SS if enabled) are for
                readability and are not encoded.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen and focus
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API. Keyboard shortcuts
                are attached to the clock card, so the card must be focused.
                Clicking the card once is typically enough. Esc exits
                fullscreen.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Copy behavior and privacy
              </div>
              <p className="mt-1 leading-relaxed">
                Copy uses the modern Clipboard API when available and falls back
                to a compatible copy method in older contexts. Clipboard access
                only happens when you press Copy (or C).
              </p>
              <p className="mt-2 leading-relaxed">
                The page uses your device’s local time and does not require an
                account.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want the most accurate time reference?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/atomic-clock"
            >
              Atomic Clock
            </Link>{" "}
            alongside this page.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Prefer a standard big display?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/digital-clock"
            >
              Digital Clock
            </Link>
            .
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          Morse code clock shows your local time as Morse digits in block or
          text view, with 12/24-hour and seconds toggles, fullscreen mode, copy
          output, and keyboard shortcuts for quick control.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/morse-code-clock")}
        </span>
      </div>
    </section>
  );
}

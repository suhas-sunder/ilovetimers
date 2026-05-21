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
   - Minimalist Clock intent: big readable local time, fullscreen display, Zen UI hiding, toggles (seconds/date/12-24), copy timestamp, shortcuts
   - Tool-focused, not a tutorial article
   - Scenario-based with concrete examples and numbers users will see here
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/minimalist-clock",
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
    name: "How to use the Minimalist Clock in fullscreen with Zen mode",
    description:
      "Use the Minimalist Clock for a big, distraction-free local time display. Toggle seconds, date, and 12/24-hour time, go fullscreen for a wall-style clock, enable Zen mode to auto-hide UI, and copy a timestamp block (time, time zone label, ISO).",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose your display",
        text: "Pick the format you want: 12-hour or 24-hour time, seconds on or off, and date on or off.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen",
        text: "Click Fullscreen (or press F after clicking the clock once). Press Esc to exit fullscreen.",
      },
      {
        "@type": "HowToStep",
        name: "Enable Zen mode",
        text: "Turn on Zen to auto-hide controls after a short idle period. Move the mouse, tap, or press a key to reveal the UI again.",
      },
      {
        "@type": "HowToStep",
        name: "Copy a timestamp",
        text: "Click Copy (or press C) to copy a clean timestamp block that includes the displayed time, time zone label, and an ISO timestamp.",
      },
      {
        "@type": "HowToStep",
        name: "Use shortcuts for fast toggles",
        text: "Use S for seconds, T for 12/24-hour, D for date, and Z for Zen. Shortcuts work after the clock is focused.",
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
    <section className="space-y-4">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Minimalist Clock
              </span>{" "}
              is a big, readable clock page designed for one outcome: show your{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                current local time
              </span>{" "}
              clearly, without visual clutter. It is built for practical
              situations where you want a simple on-screen clock that you can
              glance at from across the room, keep on a second monitor, or run
              fullscreen on a TV.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The controls are intentionally small and direct. You can toggle{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">seconds</span>,
              switch{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                12-hour or 24-hour
              </span>{" "}
              format, show or hide the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">date</span>, and
              enable{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Zen mode</span> to
              auto-hide UI while you display the time. The big time text
              automatically fits the available space so it stays large and
              readable on different screens.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page also includes a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> action.
              It copies a clean timestamp block that includes the time you are
              looking at, a time zone label, and an ISO timestamp. That is
              useful when you want a quick “what time was it” stamp for a
              message, a note, or a ticket, without manually formatting
              anything.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Big digits
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Zen hide
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              12/24
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Date
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Copy
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set
                your display: choose 12/24-hour, seconds on/off, and date
                on/off.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Go
                fullscreen for maximum readability. Use the Fullscreen button or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">F</span>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Turn on{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Zen</span> if you
                want controls to fade away after a brief idle period.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> to
                grab a timestamp block for pasting (includes time zone label and
                ISO).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> If
                shortcuts do nothing, click the clock once to focus it, then try
                again.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What Zen mode is doing for you
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Zen mode is for display-first situations. When it is enabled,
                the page hides most UI after a short idle period so the screen
                is dominated by the time. You can still access everything
                quickly: move the mouse, tap the screen, or press any key and
                the controls reappear. This is especially useful on a wall
                display where you only want the clock visible most of the time.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you want precision, keep seconds on. If you want calm, turn
                seconds off.
              </li>
              <li>
                If you are sharing a screen, 24-hour time reduces ambiguity.
              </li>
              <li>
                If you are using a TV or monitor across the room, go fullscreen
                first, then adjust toggles.
              </li>
              <li>
                If you need multiple time zones, this page is not the best fit.
                Use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/world-clock"
                >
                  World Clock
                </Link>
                .
              </li>
              <li>
                If you need a countdown, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/fullscreen-timer"
                >
                  Fullscreen Timer
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Quick keys:</span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>Z</Kbd> zen, <Kbd>S</Kbd> seconds,{" "}
              <Kbd>T</Kbd> 12/24, <Kbd>D</Kbd> date, <Kbd>C</Kbd> copy,{" "}
              <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What this clock is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            Most “clock” pages become distracting because they try to do too
            much. This route is optimized for a single glanceable display with
            options that matter in real use: the hour format, whether seconds
            should be visible, whether the date should be visible, and whether
            controls should disappear while you display the time.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The clock uses your device’s local time. That is a feature, not a
            limitation. If your laptop is set correctly, the display is exactly
            what you expect. If your system time is wrong, the clock will match
            it, which is usually the best behavior for a display clock because
            it stays consistent with the rest of your device.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The “small line” above the time is meant to be helpful without being
            busy. It summarizes the mode you are in, including the time zone
            label and whether you are using 12-hour or 24-hour time, with
            seconds on or off. In fullscreen, Zen can fade this line away if you
            want a pure clock-only screen.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete examples (what you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These scenarios reflect the actual toggles and behaviors on this
            page. The example times are realistic “screen moments” where a big
            clock is genuinely useful.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Desk clock while you work"
              subtitle="Big digits on a second monitor, calm display."
              lines={[
                "Goal: keep local time visible without distractions",
                "",
                "Suggested settings:",
                "- 24-hour: ON",
                "- Seconds: OFF",
                "- Date: OFF",
                "- Zen: ON",
                "",
                "Example display you’ll see:",
                "- 14:30",
                "",
                "Behavior:",
                "- Move the mouse to reveal controls",
                "- Press F to go fullscreen",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Meeting facilitation with precise timing"
              subtitle="Seconds on for cues and transitions."
              lines={[
                "Goal: glance at seconds to time handoffs",
                "",
                "Suggested settings:",
                "- 24-hour: ON (or your preference)",
                "- Seconds: ON",
                "- Date: OFF",
                "- Zen: ON in fullscreen",
                "",
                "Example display you’ll see:",
                "- 09:05:07",
                "",
                "Useful shortcuts:",
                "- S toggles seconds",
                "- C copies a timestamp block for notes",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Classroom or training room wall display"
              subtitle="Fullscreen clock, date visible, UI hidden most of the time."
              lines={[
                "Goal: readable time across a room",
                "",
                "Suggested settings:",
                "- Fullscreen: ON",
                "- Seconds: OFF",
                "- Date: ON",
                "- Zen: ON",
                "",
                "Example display you’ll see:",
                "- 11:45 AM",
                "- Wednesday, February 25, 2026",
                "",
                "Tip:",
                "- Tap or move the mouse to show controls briefly",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Copy a timestamp for a ticket or message"
              subtitle="Clean paste with time zone label and ISO timestamp."
              lines={[
                "Goal: paste an unambiguous timestamp into a note or ticket",
                "",
                "On-screen time example:",
                "- 21:17:33",
                "",
                "Copy produces a block like:",
                "Minimalist Clock",
                "21:17:33 (America/Toronto)",
                "Wednesday, February 25, 2026",
                "ISO: 2026-02-26T02:17:33.120Z",
                "",
                "Tip:",
                "- Turn Date off if you only want time + ISO",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Pick 12-hour format for personal spaces"
              subtitle="AM/PM is included and stays readable."
              lines={[
                "Goal: an easy-to-read home display",
                "",
                "Suggested settings:",
                "- 24-hour: OFF (12-hour)",
                "- Seconds: OFF",
                "- Date: ON (optional)",
                "",
                "Example display you’ll see:",
                "- 7:05 PM",
                "",
                "Shortcut:",
                "- T toggles 12-hour / 24-hour",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: You need multiple time zones or conversions"
              subtitle="When the minimalist clock is not the right tool."
              lines={[
                "Goal: compare local time with other locations",
                "",
                "Use instead:",
                "- World Clock for multiple locations at once",
                "- Time Zone Converter to convert a specific time between zones",
                "",
                "Fast links:",
                "- /world-clock",
                "- /time-zone-converter",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Pick the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This route is a single, clean clock display. If you need a
              multi-zone view, use World Clock. If you need a conversion between
              time zones, use Time Zone Converter. If you need to run a timer,
              use Fullscreen Timer or Countdown Timer.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Multi-zone:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/world-clock"
              >
                World Clock
              </Link>
              . Convert time zones:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/time-zone-converter"
              >
                Time Zone Converter
              </Link>
              . Timers:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/fullscreen-timer"
              >
                Fullscreen Timer
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/countdown-timer"
              >
                Countdown Timer
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
              Shortcut set: <Kbd>F</Kbd> <Kbd>S</Kbd> <Kbd>T</Kbd> <Kbd>D</Kbd>{" "}
              <Kbd>Z</Kbd> <Kbd>C</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/analog-clock">Analog Clock</PillLink>
            <PillLink to="/retro-flip-clock">Retro Flip Clock</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/utc-clock">UTC Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (time source, fullscreen, Zen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on display behavior and shortcuts
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Time source and time zone label
              </div>
              <p className="mt-1 leading-relaxed">
                The clock uses your device’s local time. The time zone label is
                detected from your browser environment. If you change your
                system time zone, the display and label will update accordingly.
              </p>
              <p className="mt-2 leading-relaxed">
                If your device time is incorrect, the clock will match it. For a
                dedicated reference display, compare with{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/atomic-clock"
                >
                  Atomic Clock
                </Link>{" "}
                or{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/utc-clock"
                >
                  UTC Clock
                </Link>
                .
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Update cadence and readability
              </div>
              <p className="mt-1 leading-relaxed">
                With seconds enabled, the display updates every second and stays
                aligned to the next second boundary. With seconds disabled, it
                updates less frequently for a calmer display while remaining
                accurate for minute-level viewing.
              </p>
              <p className="mt-2 leading-relaxed">
                The big time string auto-fits to the available space so it
                remains readable in fullscreen on different screen sizes.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen and keyboard focus
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser’s fullscreen API and typically
                requires a user gesture (click or key press). Shortcuts are
                captured when the clock has focus, so if keys do nothing, click
                the clock once.
              </p>
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Esc</span> exits
                fullscreen immediately.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Zen and copy behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Zen mode hides UI after a short idle period and reveals it on
                movement or input. Copy writes text to your clipboard using the
                clipboard API, with a fallback method if clipboard permissions
                are restricted.
              </p>
              <p className="mt-2 leading-relaxed">
                The copied text includes the displayed time, the detected time
                zone label, and an ISO timestamp so your paste is unambiguous.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need time zones?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/world-clock"
            >
              World Clock
            </Link>{" "}
            to view multiple locations.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need a timer?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/fullscreen-timer"
            >
              Fullscreen Timer
            </Link>{" "}
            for countdowns and on-screen timing.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this
          minimalist online clock shows a big local time display with fullscreen
          mode, Zen UI hiding, toggles for seconds, date, and 12/24-hour time,
          plus a copy-ready timestamp block for practical use.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/minimalist-clock")}
        </span>
      </div>
    </section>
  );
}

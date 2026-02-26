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
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
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
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
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
              The{" "}
              <span className="font-semibold text-slate-900">
                Minimalist Clock
              </span>{" "}
              is a big, readable clock page designed for one outcome: show your{" "}
              <span className="font-semibold text-slate-900">
                current local time
              </span>{" "}
              clearly, without visual clutter. It is built for practical
              situations where you want a simple on-screen clock that you can
              glance at from across the room, keep on a second monitor, or run
              fullscreen on a TV.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The controls are intentionally small and direct. You can toggle{" "}
              <span className="font-semibold text-slate-900">seconds</span>,
              switch{" "}
              <span className="font-semibold text-slate-900">
                12-hour or 24-hour
              </span>{" "}
              format, show or hide the{" "}
              <span className="font-semibold text-slate-900">date</span>, and
              enable{" "}
              <span className="font-semibold text-slate-900">Zen mode</span> to
              auto-hide UI while you display the time. The big time text
              automatically fits the available space so it stays large and
              readable on different screens.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page also includes a{" "}
              <span className="font-semibold text-slate-900">Copy</span> action.
              It copies a clean timestamp block that includes the time you are
              looking at, a time zone label, and an ISO timestamp. That is
              useful when you want a quick “what time was it” stamp for a
              message, a note, or a ticket, without manually formatting
              anything.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Big digits
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Zen hide
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              12/24
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Seconds
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Date
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Copy
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Quick use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Set
                your display: choose 12/24-hour, seconds on/off, and date
                on/off.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Go
                fullscreen for maximum readability. Use the Fullscreen button or{" "}
                <span className="font-semibold text-slate-900">F</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Turn on{" "}
                <span className="font-semibold text-slate-900">Zen</span> if you
                want controls to fade away after a brief idle period.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Use{" "}
                <span className="font-semibold text-slate-900">Copy</span> to
                grab a timestamp block for pasting (includes time zone label and
                ISO).
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> If
                shortcuts do nothing, click the clock once to focus it, then try
                again.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What Zen mode is doing for you
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Zen mode is for display-first situations. When it is enabled,
                the page hides most UI after a short idle period so the screen
                is dominated by the time. You can still access everything
                quickly: move the mouse, tap the screen, or press any key and
                the controls reappear. This is especially useful on a wall
                display where you only want the clock visible most of the time.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
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
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/world-clock"
                >
                  World Clock
                </Link>
                .
              </li>
              <li>
                If you need a countdown, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/fullscreen-timer"
                >
                  Fullscreen Timer
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Quick keys:</span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>Z</Kbd> zen, <Kbd>S</Kbd> seconds,{" "}
              <Kbd>T</Kbd> 12/24, <Kbd>D</Kbd> date, <Kbd>C</Kbd> copy,{" "}
              <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What this clock is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            Most “clock” pages become distracting because they try to do too
            much. This route is optimized for a single glanceable display with
            options that matter in real use: the hour format, whether seconds
            should be visible, whether the date should be visible, and whether
            controls should disappear while you display the time.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The clock uses your device’s local time. That is a feature, not a
            limitation. If your laptop is set correctly, the display is exactly
            what you expect. If your system time is wrong, the clock will match
            it, which is usually the best behavior for a display clock because
            it stays consistent with the rest of your device.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The “small line” above the time is meant to be helpful without being
            busy. It summarizes the mode you are in, including the time zone
            label and whether you are using 12-hour or 24-hour time, with
            seconds on or off. In fullscreen, Zen can fade this line away if you
            want a pure clock-only screen.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with concrete examples (what you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Pick the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This route is a single, clean clock display. If you need a
              multi-zone view, use World Clock. If you need a conversion between
              time zones, use Time Zone Converter. If you need to run a timer,
              use Fullscreen Timer or Countdown Timer.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Multi-zone:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/world-clock"
              >
                World Clock
              </Link>
              . Convert time zones:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/time-zone-converter"
              >
                Time Zone Converter
              </Link>
              . Timers:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/fullscreen-timer"
              >
                Fullscreen Timer
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/countdown-timer"
              >
                Countdown Timer
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Use the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcut set: <Kbd>F</Kbd> <Kbd>S</Kbd> <Kbd>T</Kbd> <Kbd>D</Kbd>{" "}
              <Kbd>Z</Kbd> <Kbd>C</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/digital-clock">Digital Clock</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/utc-clock">UTC Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (time source, fullscreen, Zen, copy)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional notes if you rely on exact behavior and shortcuts
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
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
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/atomic-clock"
                >
                  Atomic Clock
                </Link>{" "}
                or{" "}
                <Link
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/utc-clock"
                >
                  UTC Clock
                </Link>
                .
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
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

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen and keyboard focus
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser’s fullscreen API and typically
                requires a user gesture (click or key press). Shortcuts are
                captured when the clock has focus, so if keys do nothing, click
                the clock once.
              </p>
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold text-slate-900">Esc</span> exits
                fullscreen immediately.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
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
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need time zones?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/world-clock"
            >
              World Clock
            </Link>{" "}
            to view multiple locations.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need a timer?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/fullscreen-timer"
            >
              Fullscreen Timer
            </Link>{" "}
            for countdowns and on-screen timing.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this
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

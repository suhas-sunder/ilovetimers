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
   - Event Countdown intent: countdown to a specific local date/time,
     saved events (local), fullscreen, start/pause/reset, optional sound,
     optional final beeps, quick time adjustments, keyboard shortcuts.
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/event-countdown",
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
    name: "How to use the Event Countdown (count down to a date and time)",
    description:
      "Count down to a specific local date and time. Save multiple events in your browser, go fullscreen for a big display, start/pause/reset with shortcuts, and optionally use sound and final beeps.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Create or select an event",
        text: "Pick a saved event from the list, or create a new one. You can duplicate an event to reuse its settings.",
      },
      {
        "@type": "HowToStep",
        name: "Set the target date and time",
        text: "Choose the exact local date and time for your event. The countdown will target that moment in your device timezone.",
      },
      {
        "@type": "HowToStep",
        name: "Start and control the countdown",
        text: "Press Start (or Space) to begin. Press Pause (or Space) to stop. Press Reset (or R) to refresh remaining time based on the current target.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a big display",
        text: "Press Fullscreen (or F) for a large, readable countdown. In fullscreen, click/tap the time to start or pause. Press Esc to exit.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound options if you want an alert",
        text: "Enable Sound to play a beep when the countdown reaches zero. Enable Final beeps to beep during the last 5 seconds.",
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
              <span className="font-semibold text-slate-900">
                Event Countdown
              </span>{" "}
              is for one job: count down to a real date and time, not just a
              duration. Pick an exact local target (a deadline, launch,
              appointment, meeting start), and this page shows a big, readable
              countdown you can run, pause, reset, and throw into fullscreen
              when you want it visible to everyone.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The page is designed to be practical, not bloggy. You can save
              multiple events in your browser, duplicate one to reuse settings,
              and quickly adjust a target by a few hours when plans change.
              Optional sound gives you a clear finish beep, and Final beeps can
              count down the last five seconds if you want a tighter landing.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              One detail that matters: the date/time you set is local to your
              device. If your system clock or timezone is wrong, the countdown
              will be wrong too. For typical use, that is what you want because
              it matches the device you are actually using to show the
              countdown.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Date & time target
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Saved events
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Shortcuts
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
                <span className="font-semibold text-slate-900">1)</span> Pick a
                saved event, or create a new one. Give it a short name that
                reads well in fullscreen.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Set the{" "}
                <span className="font-semibold text-slate-900">
                  Date & time (local)
                </span>{" "}
                for the exact moment you care about.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or{" "}
                <Kbd>Space</Kbd>) to run. Press again to pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <span className="font-semibold text-slate-900">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to refresh remaining time based on the current
                target.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> Use{" "}
                <span className="font-semibold text-slate-900">Fullscreen</span>{" "}
                (or <Kbd>F</Kbd>) for a large display. Exit with <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Reset” means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Reset does not change your event time. It recalculates remaining
                time from the target and current device time. Example: if your
                target is 2 hours from now and you paused at 1:37:12 remaining,
                Reset will jump back to about 02:00:00 (minus a second or two),
                because it re-reads “now.”
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Checklist for a clean setup
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                If the page says the time is in the past, set a future date/time
                before starting.
              </li>
              <li>
                Use a short event name (it is shown above the countdown and in
                the saved list).
              </li>
              <li>
                If you want an audible finish, enable Sound. Test once before
                relying on it.
              </li>
              <li>
                If audio is blocked, click Start once. Some browsers require
                interaction before sound plays.
              </li>
              <li>
                If shortcuts do nothing, click the countdown card once so it has
                focus. Shortcuts do not fire while typing in inputs.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset, <Kbd>F</Kbd>{" "}
              fullscreen, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you can do on this page
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            This countdown is built around a fixed point in time. That makes it
            ideal when “25 minutes from now” is not the real requirement and you
            need “Tuesday at 3:00 PM” (or “Feb 13 at 9:30 AM”) instead. The
            countdown display is intentionally simple: it shows a long format
            that can include days and it also shows a short format for quick
            reads. When the countdown reaches zero, the page can optionally
            beep. If you enable Final beeps, it will also beep once per second
            in the last five seconds.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            You can keep more than one event saved. That is useful if you are
            managing multiple moments (for example: “Doors open”, “Start time”,
            “Submission cutoff”). The saved list is stored in your browser, so
            it is quick and private, but it is not synced across devices.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Fullscreen is the “make it obvious” mode. It removes clutter,
            enlarges the timer, and makes start/pause and reset available in a
            minimal top bar. In fullscreen, you can click or tap the time to
            start or pause. This is intentionally fast for screen-sharing and
            “hands off” setups.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real outputs and what you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These examples use realistic numbers and the same output style you
            will see on this page. Your exact values will differ, but the shape
            of the experience is the same: a long countdown string, a short
            quick-read string, and clear behavior when you start, pause, reset,
            or hit zero.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Deadline in 2 hours and 15 minutes"
              subtitle="You want a countdown you can keep visible while working"
              lines={[
                "Setup:",
                '- Event name: "Submit report"',
                "- Target: today, 2 hours 15 minutes from now",
                "",
                "What you see (example):",
                "- Long: 02:15:00",
                "- Short: 135:00 (minutes:seconds) or 2:15:00 depending on screen",
                "",
                "How you use it:",
                "- Press Start (or Space) and keep it running",
                "- If you pause to take a call, press Space again to resume",
                "- If you adjusted the target time, press Reset (R) to refresh remaining",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Countdown to tomorrow morning"
              subtitle="Days appear automatically when the target is far enough out"
              lines={[
                "Setup:",
                '- Event name: "Flight check-in"',
                "- Target: tomorrow at 08:00 (local)",
                "",
                "What you see (example):",
                "- Long: 1d 10:42:13",
                "- Short: 642:13 (minutes:seconds) for quick reading",
                "",
                "Why this helps:",
                "- You can tell instantly it is not just 'hours left', it includes a day boundary",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Launch moment with final beeps"
              subtitle="You want a clear finish beep and a 5-second count-in"
              lines={[
                "Setup:",
                '- Event name: "Release"',
                "- Sound: ON",
                "- Final beeps: ON",
                "",
                "Last 5 seconds (example):",
                "- 00:00:05 (beep)",
                "- 00:00:04 (beep)",
                "- 00:00:03 (beep)",
                "- 00:00:02 (beep)",
                "- 00:00:01 (beep)",
                "- 00:00:00 (finish beep)",
                "",
                "Practical tip:",
                "- Test sound once before you rely on it. Some browsers require a click first.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Meeting room display"
              subtitle="You want it readable across the room or on a shared screen"
              lines={[
                "Setup:",
                '- Event name: "Standup"',
                "- Target: 09:30",
                "",
                "How it runs:",
                "- Press F for fullscreen",
                "- Click/tap the big time to start/pause",
                "- Use Reset if the start time changed",
                "",
                "What people notice:",
                "- A large, stable countdown with a clear status label (Ready/Running/Done)",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Plans changed, shift the target by 2 hours"
              subtitle="Use the quick adjust buttons instead of re-typing"
              lines={[
                "Problem:",
                "- The event moved from 14:00 to 16:00",
                "",
                "Fix:",
                "- Press +2h twice (or +24h then -22h if you are correcting a bigger error)",
                "- Press Reset so remaining time matches the new target cleanly",
                "",
                "What you see (example):",
                "- Remaining time jumps from ~01:12:xx back to ~03:12:xx",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Multiple events for the same day"
              subtitle="Save and switch instead of re-entering times"
              lines={[
                "Setup:",
                "- Create three events:",
                '  1) "Doors" at 18:30',
                '  2) "Start" at 19:00',
                '  3) "Cutoff" at 21:45',
                "",
                "Workflow:",
                "- Use the Saved events dropdown to switch instantly",
                '- Duplicate "Start" next week and only change the date',
                "",
                "Why it helps:",
                "- Each event keeps its own sound and final beeps settings",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If you use this page often, keyboard shortcuts are the fastest
              path. Press <Kbd>Space</Kbd> to start/pause, <Kbd>R</Kbd> to
              reset,
              <Kbd>F</Kbd> to toggle fullscreen, and <Kbd>Esc</Kbd> to exit
              fullscreen. Shortcuts only trigger when the countdown card has
              focus, and they are ignored while you are typing in an input field
              to prevent accidental toggles.
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
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                If you need a different kind of timing, use the closest match
                below.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/alarm-timer">Alarm Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/meeting-count-up-timer">
              Meeting Count Up Timer
            </PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (local time, saved events, audio, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter when you rely on exact behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Local date/time target
              </div>
              <p className="mt-1 leading-relaxed">
                The datetime picker is local to your device. The countdown
                targets that local moment. If your timezone changes, the same
                stored local value can represent a different actual moment,
                which can change the effective countdown.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Saved events are browser-only
              </div>
              <p className="mt-1 leading-relaxed">
                Events are stored locally in your browser storage. They are not
                sent to a server and are not shared across devices. Clearing
                site data removes them.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses browser audio APIs. Some browsers block audio until
                after a user gesture (click/tap). If you do not hear the finish
                beep, click Start once and try again. Final beeps run only in
                the last 5 seconds and only when Sound is enabled.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API. Most browsers
                require a user gesture to enter fullscreen. Exit with{" "}
                <Kbd>Esc</Kbd> or the Exit button in the top bar.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers can throttle background tabs to save power. The
                countdown recomputes from your device time, but the display can
                look less smooth if the tab is not active. For the cleanest
                visual countdown, keep it in the foreground or fullscreen.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need a duration timer?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/countdown-timer"
            >
              Countdown Timer
            </Link>{" "}
            if you want “X minutes from now” instead of a calendar date/time.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Coordinating across time zones?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/time-zone-converter"
            >
              Time Zone Converter
            </Link>{" "}
            first, then set the local target time here.
          </div>
        </div>
      </div>
    </section>
  );
}

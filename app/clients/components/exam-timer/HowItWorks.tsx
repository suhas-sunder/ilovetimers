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
   - Exam Timer intent: duration-based countdown for timed sections/practice.
     Presets, custom minutes, fullscreen, start/pause/reset, optional sound,
     optional warnings (5m/1m), optional final beeps (last 5s), keyboard shortcuts.
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/exam-timer",
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
    name: "How to use the Exam Timer (fullscreen countdown for timed practice)",
    description:
      "Run a distraction-free exam-style countdown. Choose a preset or custom minutes, start/pause/reset with keyboard shortcuts, use fullscreen for a big display, and optionally enable sound warnings and final beeps.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose the duration",
        text: "Select a preset (5 to 180 minutes) or enter custom minutes (1 to 360). While the timer is running, duration controls are disabled to prevent accidental changes.",
      },
      {
        "@type": "HowToStep",
        name: "Configure sound and warnings (optional)",
        text: "Turn Sound on if you want beeps. Enable Warnings for a 5-minute and/or 1-minute pacing beep. Enable Final beeps if you want short beeps in the last 5 seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset",
        text: "Press Start (or Space) to begin. Press again to pause. Press Reset (or R) to return to the full selected duration.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a clean display",
        text: "Press Fullscreen (or F) for a large, readable countdown. In fullscreen, click/tap the time to start or pause quickly. Press Esc to exit.",
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
              <span className="font-semibold text-slate-900">Exam Timer</span>{" "}
              is a straight, exam-style countdown. You choose a duration, press
              Start, and get a large, readable clock you can run in fullscreen
              without distractions. It is built for timed sections, mock exams,
              and practice sets where you want the time to be obvious and the
              controls to be simple.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page is not a scheduling tool and it does not try to manage
              your study plan. It focuses on what you need in the moment: preset
              durations, custom minutes, clean start/pause/reset, optional sound
              cues, and keyboard shortcuts that work well in a proctored-style
              setup. If you want a quiet room, turn sound off and it becomes a
              purely visual timer.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The timer display automatically fits itself to the available
              space, so it stays readable in normal mode and in fullscreen. If
              you are practicing with a second monitor, a projector, or screen
              share, fullscreen is usually the best experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Custom minutes
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Warnings
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
                <span className="font-semibold text-slate-900">1)</span> Choose
                a preset duration (for example 25m, 45m, 75m) or type custom
                minutes.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Decide
                whether you want sound. If yes, turn on Sound and optionally
                enable Warnings and Final beeps.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or{" "}
                <Kbd>Space</Kbd>) to run. Press again to pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <span className="font-semibold text-slate-900">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to return to the full duration.
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
                Reset always returns you to the full selected duration, not the
                moment you started. Example: if you set 35 minutes and you pause
                at 12:08 remaining, Reset returns you to 35:00 so you can rerun
                the same section cleanly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Checklist for a clean setup
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                Pick the duration first. While running, duration controls are
                locked to prevent accidental changes mid-section.
              </li>
              <li>
                If you want pacing cues, enable Warnings and choose 5m and/or
                1m.
              </li>
              <li>
                If you want a sharper finish cue, enable Final beeps (last 5
                seconds).
              </li>
              <li>
                Test audio once before you rely on it. Some browsers require a
                click before audio plays.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
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
            The core job is simple: count down from a duration you choose. You
            can set that duration with presets (from 5 minutes up to 180
            minutes) or with custom minutes (from 1 to 360). Once you start, the
            timer shows a clear time string like{" "}
            <span className="font-semibold text-slate-900">25:00</span> or{" "}
            <span className="font-semibold text-slate-900">1:15:00</span> for
            longer sessions. If there is an hour component, it appears
            automatically. That way you do not have to interpret large minute
            counts during a timed section.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Sound is optional and intentionally restrained. If Sound is on, you
            can use Warnings as pacing cues at 5 minutes and 1 minute remaining.
            These are single beeps, not repeated reminders. Final beeps are a
            separate toggle that adds short beeps during the last 5 seconds,
            plus the finish beep at zero. If you are in a quiet room, leave
            Sound off and the timer stays fully silent.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Fullscreen mode is designed for readability and quick control. The
            top bar includes Start/Pause and Reset, and the time display itself
            can be clicked or tapped to start or pause. That matters in practice
            sessions because you can keep your workflow simple: one key (
            <Kbd>Space</Kbd>) and one fallback (tap the time) if you are on a
            touch device.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real outputs and what you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These scenarios are written in the same shape you will experience on
            the page: a selected duration, the exact on-screen time format, and
            the effects of warnings, final beeps, pause, and reset. The numbers
            below are realistic and reflect what users actually watch while
            timing a section.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: A 25-minute timed section with a 5-minute warning"
              subtitle="A classic “one block” timing where you want a single pacing cue"
              lines={[
                "Setup:",
                "- Duration: 25 minutes",
                "- Sound: ON",
                "- Warnings: ON",
                "- 5m warning: ON",
                "- 1m warning: OFF",
                "- Final beeps: OFF",
                "",
                "What you see:",
                "- Start: 25:00",
                "- Midway: 12:30",
                "- Pacing cue: 05:00 (one short beep)",
                "- Finish: 00:00 (finish beep)",
                "",
                "Control:",
                "- Space to pause/resume",
                "- R to reset back to 25:00 for the next run",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: A 1 hour 15 minute practice set (hour format)"
              subtitle="Longer timing where the display automatically switches to H:MM:SS"
              lines={[
                "Setup:",
                "- Duration: 75 minutes",
                "- Sound: OFF (quiet room)",
                "",
                "What you see:",
                "- Start: 1:15:00",
                "- After 30 minutes: 0:45:00",
                "- Last minute: 0:01:00",
                "- Finish: 0:00:00 (no sound)",
                "",
                "Why it helps:",
                "- You never have to interpret 75:00 as 'minutes only'",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: A strict finish cue for a drill (final 5 seconds)"
              subtitle="Useful when you want a clean stop signal without watching continuously"
              lines={[
                "Setup:",
                "- Duration: 10 minutes",
                "- Sound: ON",
                "- Warnings: OFF",
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
                "Practical note:",
                "- If audio is blocked, click Start once, then try again",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Back-to-back blocks without building a schedule"
              subtitle="Switch presets between blocks and use Reset for repeatability"
              lines={[
                "Setup:",
                "- Block A: 35 minutes (timed section)",
                "- Block B: 10 minutes (break or review)",
                "",
                "Workflow:",
                "- Pick 35m preset, Start, run to 00:00",
                "- Tap 10m preset, Start, run to 00:00",
                "- Tap 35m preset again, Start",
                "",
                "What you see:",
                "- 35:00 → ... → 00:00",
                "- 10:00 → ... → 00:00",
                "- 35:00 again",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Proctored-style fullscreen with keyboard-only control"
              subtitle="A clean display where you do not need to hunt for buttons"
              lines={[
                "Setup:",
                "- Duration: 45 minutes",
                "- Fullscreen: ON (press F)",
                "- Sound: optional",
                "",
                "Control:",
                "- Space starts/pauses",
                "- R resets to 45:00",
                "- Esc exits fullscreen",
                "",
                "What you see:",
                "- Large centered 45:00 with status (Ready/Running/Paused)",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Classroom timing with minimal interruption"
              subtitle="The group sees the same time, you keep control simple"
              lines={[
                "Setup:",
                "- Duration: 20 minutes",
                "- Warnings: ON",
                "- 1m warning: ON (optional)",
                "",
                "What you see:",
                "- Start: 20:00",
                "- 05:00 (optional beep if enabled)",
                "- 01:00 (optional beep if enabled)",
                "- 00:00 (finish beep if Sound is on)",
                "",
                "Tip:",
                "- Use fullscreen and tap the time display to pause if needed",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If you use this page often, shortcuts are the fastest path. Press{" "}
              <Kbd>Space</Kbd> to start/pause, <Kbd>R</Kbd> to reset,{" "}
              <Kbd>F</Kbd> to toggle fullscreen, and <Kbd>Esc</Kbd> to exit.
              Shortcuts only trigger when the timer card has focus. They are
              ignored while you are typing in an input field, which prevents
              accidental starts or resets when you are changing minutes.
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
            <PillLink to="/study-timer">Study Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/silent-timer">Silent Timer</PillLink>
            <PillLink to="/pomodoro-timer">Pomodoro Timer</PillLink>
            <PillLink to="/classroom-timer">Classroom Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, audio, fullscreen, background tabs)
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
                How remaining time is computed
              </div>
              <p className="mt-1 leading-relaxed">
                When you press Start, the timer targets an internal end time
                based on elapsed time. This keeps the countdown steady even if a
                frame is delayed. The display updates frequently, but the value
                is tied to real elapsed time, not a fragile once-per-second
                interval.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Duration lock while running
              </div>
              <p className="mt-1 leading-relaxed">
                The minutes input and preset buttons are disabled while running.
                That is intentional. It prevents accidental changes to a timed
                section once it has started. Pause or reset before changing
                minutes.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses browser audio APIs. Some browsers block audio until a
                user gesture (click/tap). If you do not hear beeps, click Start
                once and try again. Warning beeps only fire when Sound and
                Warnings are enabled. Final beeps only run in the last 5 seconds
                and only when Sound is enabled.
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
                Browsers may throttle background tabs to save power. The timer
                will catch up when you return, but the visual updates can look
                less smooth while hidden. If you care about a smooth visual
                countdown, keep the tab active or use fullscreen.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need a study flow?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/study-timer"
            >
              Study Timer
            </Link>{" "}
            if you want a more general focus session timer rather than a
            test-style countdown.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need structured intervals?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/pomodoro-timer"
            >
              Pomodoro Timer
            </Link>{" "}
            if you want alternating work and break blocks without manually
            switching durations.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this is a
          fullscreen exam timer for timed practice, with presets, custom
          minutes, optional pacing warnings, and keyboard shortcuts for fast
          control.
        </div>
      </div>
    </section>
  );
}

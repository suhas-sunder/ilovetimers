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
   - Focus Session Timer intent: single deep work countdown.
     Presets, custom minutes, fullscreen, start/pause/reset,
     optional sound, optional final beeps (last 5s), keyboard shortcuts.
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/focus-session-timer",
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
    name: "How to use the Focus Session Timer (single deep work countdown)",
    description:
      "Run one clean focus session countdown. Choose a preset or custom minutes, start/pause/reset with keyboard shortcuts, use fullscreen for a big display, and optionally enable sound and final beeps.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a session length",
        text: "Pick a preset (1 to 90 minutes) or enter custom minutes (1 to 240). Changing the session length resets the timer to the new duration.",
      },
      {
        "@type": "HowToStep",
        name: "Set sound options (optional)",
        text: "Turn Sound on to hear a finish beep. Enable Final beeps if you want short beeps in the last 5 seconds. Final beeps is disabled when Sound is off.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset",
        text: "Press Start (or Space) to begin. Press again to pause. Press Reset (or R) to return to the full selected session length.",
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
              <span className="font-semibold text-slate-900">
                Focus Session Timer
              </span>{" "}
              is built for one thing: a single, clean countdown that you can
              start and stop without friction. You pick a session length, press
              Start, and let the clock do its job. When the session completes,
              the page shows a simple break prompt so you can stand up, take a
              sip of water, and reset before the next block.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This is not a “system” that tries to manage your day or force a
              specific method. It is a practical, one-session timer that works
              well for deep work, study sprints, writing, coding, admin
              clean-up, and any timebox where you want a visible finish line. If
              you want cycles and built-in breaks, use a dedicated cycle tool
              instead.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The display is designed to be readable at a glance. The time
              string formats itself based on the duration, so a longer session
              uses an hour format automatically (for example{" "}
              <span className="font-semibold text-slate-900">1:15:00</span>),
              while shorter sessions show a clean{" "}
              <span className="font-semibold text-slate-900">MM:SS</span> style
              countdown (for example{" "}
              <span className="font-semibold text-slate-900">25:00</span>).
              Fullscreen is available when you want a big, distraction-free
              clock on a second monitor or during a screen share.
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
                <span className="font-semibold text-slate-900">1)</span> Choose
                a preset (1m, 25m, 45m, 60m, 90m) or type session minutes (1 to
                240).
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Decide
                whether you want sound. If yes, turn on Sound and optionally
                enable Final beeps for the last 5 seconds.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or{" "}
                <Kbd>Space</Kbd>) to begin. Press again to pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <span className="font-semibold text-slate-900">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to return to the full session length.
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
                Reset always returns to your selected session length, not the
                moment you started. Example: if you set{" "}
                <span className="font-semibold text-slate-900">45 minutes</span>{" "}
                and pause at{" "}
                <span className="font-semibold text-slate-900">17:20</span>{" "}
                remaining, Reset returns to{" "}
                <span className="font-semibold text-slate-900">45:00</span> so
                you can rerun the same block cleanly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Checklist for a clean focus setup
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                Pick the duration first so you are not touching controls once
                you start.
              </li>
              <li>
                If you rely on sound, test it once before your session. Some
                browsers require a user click before audio can play.
              </li>
              <li>
                Use fullscreen if you want less visual noise and a big clock you
                can glance at from across the room.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
                focus. Shortcuts do not fire while typing in the minutes input.
              </li>
              <li>
                If you want a cycle with breaks managed for you, switch to a
                cycle tool instead of manually changing minutes between blocks.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset, <Kbd>F</Kbd>{" "}
              fullscreen, <Kbd>S</Kbd> sound, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you can do on this page
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            The core workflow is intentionally simple: count down from a session
            length you choose. You can set the length with presets (from{" "}
            <span className="font-semibold text-slate-900">1 minute</span> up to{" "}
            <span className="font-semibold text-slate-900">90 minutes</span>) or
            with custom minutes (from{" "}
            <span className="font-semibold text-slate-900">1</span> to{" "}
            <span className="font-semibold text-slate-900">240</span>). The
            timer shows a status label so you always know where you are: Ready,
            Running, or Complete. In fullscreen, the status remains visible
            while the time takes center stage.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Sound is optional and minimal. With Sound on, you get a short finish
            beep at completion. If you also enable Final beeps, you will hear a
            brief beep at{" "}
            <span className="font-semibold text-slate-900">5</span>,{" "}
            <span className="font-semibold text-slate-900">4</span>,{" "}
            <span className="font-semibold text-slate-900">3</span>,{" "}
            <span className="font-semibold text-slate-900">2</span>,{" "}
            <span className="font-semibold text-slate-900">1</span> seconds
            remaining, then the finish beep at{" "}
            <span className="font-semibold text-slate-900">00:00</span>. If you
            are in a library or shared space, leave Sound off and the page stays
            completely silent.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Fullscreen mode is built for “glanceability.” The top bar keeps only
            essential controls, and the timer display itself becomes a large tap
            target. On a phone or tablet, you can tap the time to start or pause
            without hunting for buttons. On a desktop, keyboard control is the
            fastest path: <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset,{" "}
            <Kbd>F</Kbd> fullscreen.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These examples match what the timer actually shows: a chosen session
            length, the on-screen time format, and what happens when you pause,
            reset, or finish. Use them as templates for your own sessions.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: 45-minute deep work block (single task)"
              subtitle="A straightforward session where you want one finish line"
              lines={[
                "Setup:",
                "- Session length: 45 minutes",
                "- Sound: ON",
                "- Final beeps: OFF",
                "",
                "What you see:",
                "- Start: 45:00",
                "- Mid-session glance: 31:42",
                "- Final stretch: 03:10",
                "- Finish: 00:00 (finish beep)",
                "",
                "Controls:",
                "- Space pauses and resumes",
                "- R resets back to 45:00 for a clean rerun",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: 25-minute study sprint (repeatable)"
              subtitle="Short sessions where you run the same length multiple times"
              lines={[
                "Setup:",
                "- Session length: 25 minutes (preset)",
                "- Sound: OFF",
                "",
                "Run 1:",
                "- Start: 25:00",
                "- Pause at: 12:08 (you keep 12:08 remaining)",
                "- Resume: continues from 12:08",
                "- Finish: 00:00 (silent)",
                "",
                "Run 2:",
                "- Press R: returns to 25:00",
                "- Start again when ready",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Meeting prep window with a sharp finish cue"
              subtitle="You want a hard stop without watching constantly"
              lines={[
                "Setup:",
                "- Session length: 15 minutes",
                "- Sound: ON",
                "- Final beeps: ON",
                "",
                "Last 5 seconds:",
                "- 00:00:05 (beep)",
                "- 00:00:04 (beep)",
                "- 00:00:03 (beep)",
                "- 00:00:02 (beep)",
                "- 00:00:01 (beep)",
                "- 00:00:00 (finish beep)",
                "",
                "Result:",
                "- You get a clear stop signal even if you are not staring at the timer",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Fullscreen on a second monitor"
              subtitle="Big display, minimal interaction, easy start/pause"
              lines={[
                "Setup:",
                "- Session length: 60 minutes",
                "- Fullscreen: ON (press F)",
                "- Sound: optional",
                "",
                "What you see:",
                "- Large centered 1:00:00 at start",
                "- Clear status label (Ready, Running, Complete)",
                "",
                "Interaction:",
                "- Tap/click the time to start or pause",
                "- Esc exits fullscreen instantly",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Back-to-back blocks without a cycle tool"
              subtitle="Manual switching when you want full control over each block"
              lines={[
                "Example workflow:",
                "- Focus block: 50 minutes",
                "- Quick reset break: 5 minutes",
                "",
                "What you do:",
                "- Select 50m, Start, run to 00:00",
                "- Select 5m (or type 5), Start, run to 00:00",
                "- Select 50m again for the next block",
                "",
                "What you see:",
                "- 50:00 → ... → 00:00",
                "- 05:00 → ... → 00:00",
                "- 50:00 again",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Long session formatting (hour display)"
              subtitle="Custom minutes that naturally display as H:MM:SS"
              lines={[
                "Setup:",
                "- Session length: 90 minutes (preset) or 120 minutes (custom)",
                "",
                "90-minute display:",
                "- Start: 1:30:00",
                "- Halfway: 0:45:00",
                "- Finish: 0:00:00",
                "",
                "120-minute display:",
                "- Start: 2:00:00",
                "- Later: 1:12:34",
                "- Finish: 0:00:00",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If you use this page often, shortcuts remove almost all
              interaction cost. Press <Kbd>Space</Kbd> to start or pause. Press{" "}
              <Kbd>R</Kbd> to reset to the full session length. Press{" "}
              <Kbd>F</Kbd> to enter or exit fullscreen. Press <Kbd>S</Kbd> to
              toggle sound. Shortcuts only fire when the timer card has focus,
              and they are ignored while you are typing in the minutes input.
              That prevents accidental pauses or resets while editing.
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
                <Kbd>S</Kbd> sound
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
                If you need a different timing style, use the closest match
                below.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/pomodoro-timer">Pomodoro Timer</PillLink>
            <PillLink to="/break-timer">Break Timer</PillLink>
            <PillLink to="/silent-timer">Silent Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/study-timer">Study Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/productivity-timer">Productivity Timer</PillLink>
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
                Optional notes if you rely on exact behavior
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
                When you press Start, the page sets an internal end timestamp
                based on the remaining time. The countdown then recalculates
                remaining time as (end - now). This avoids drift you can get
                from “tick once per second” approaches.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle work in background tabs to save power. The
                timer will still catch up to the correct remaining time when you
                return, but visual updates can look less smooth while hidden.
                For a steady visual display, keep the tab active or use
                fullscreen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses WebAudio. Many browsers block audio until a user
                gesture (click or tap). If you do not hear beeps, click Start
                once and try again, and check that the tab and device are not
                muted. Final beeps only run when Sound is enabled.
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
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want cycles?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/pomodoro-timer"
            >
              Pomodoro Timer
            </Link>{" "}
            if you want alternating work and break blocks without manually
            switching durations.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want quiet timing?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/silent-timer"
            >
              Silent Timer
            </Link>{" "}
            if you never want audio, even by accident.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this is a
          fullscreen focus session timer for a single deep work countdown, with
          presets, custom minutes, optional sound and final beeps, and keyboard
          shortcuts for fast control.
        </div>
      </div>
    </section>
  );
}

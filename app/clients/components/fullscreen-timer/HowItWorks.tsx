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
   - Fullscreen Timer intent: big readable countdown for projectors/smartboards.
     Presets, custom time input (ss / mm:ss / hh:mm:ss), fullscreen,
     click/tap-to-start in fullscreen, start/pause/reset, optional sound,
     loop mode, keyboard shortcuts.
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/fullscreen-timer",
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
    name: "How to use the Fullscreen Timer (big projector-friendly countdown)",
    description:
      "Run a large, readable fullscreen countdown for classrooms, projectors, and smartboards. Choose a preset or set a custom time, start/pause/reset with keyboard shortcuts, enable optional sound, and use loop mode to repeat the same interval.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a duration",
        text: "Pick a preset (1 to 60 minutes) or type a custom time (ss, mm:ss, or hh:mm:ss). Press Set or click out of the input to apply it.",
      },
      {
        "@type": "HowToStep",
        name: "Choose options (optional)",
        text: "Turn Sound on for a finish beep. Turn Loop on if you want the timer to restart automatically at zero for repeating rounds or rotations.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset",
        text: "Press Start (or Space) to begin. Press again to pause. Press Reset (or R) to return to the selected duration.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for the big display",
        text: "Press Fullscreen (or F) for a large, distraction-free view. In fullscreen you can click/tap the time display to start or pause. Press Esc to exit.",
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
                Fullscreen Timer
              </span>{" "}
              is built for one job: a big, readable countdown you can put on a
              projector, smartboard, or second display. You set the duration,
              press Start, and the screen becomes a clean clock that people can
              understand instantly from across the room.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The page is intentionally simple. It does not try to teach a
              method, force a routine, or add extra steps. It focuses on
              readability, quick setup, and fast control: presets for common
              lengths, custom input for exact times, optional sound at the end,
              and loop mode when you need the same interval to repeat.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The display auto-scales the digits to fit the available space, so
              the time stays large without clipping. Short sessions show a clean
              minute-and-second format (for example{" "}
              <span className="font-semibold text-slate-900">5:00</span>), and
              longer sessions naturally switch to an hour format (for example{" "}
              <span className="font-semibold text-slate-900">1:00:00</span>). In
              fullscreen, you can click or tap the time itself to start or
              pause, which is ideal when you are standing at the front of a
              room.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Big digits
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Presets
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Custom time
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Loop
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
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
                preset (like 5m, 10m, 15m) or enter a custom time like{" "}
                <span className="font-semibold text-slate-900">7:30</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> If you
                want an audible finish, enable{" "}
                <span className="font-semibold text-slate-900">Sound</span>. If
                you need repeating rounds, enable{" "}
                <span className="font-semibold text-slate-900">Loop</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or{" "}
                <Kbd>Space</Kbd>) to begin. Press again to pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <span className="font-semibold text-slate-900">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to return to the selected duration.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> Press{" "}
                <span className="font-semibold text-slate-900">Fullscreen</span>{" "}
                (or <Kbd>F</Kbd>) for the large display. Exit with{" "}
                <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What “Reset” means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Reset always returns to the selected duration, not the moment
                you started. Example: if you set{" "}
                <span className="font-semibold text-slate-900">10:00</span> and
                pause at{" "}
                <span className="font-semibold text-slate-900">03:12</span>{" "}
                remaining, Reset returns to{" "}
                <span className="font-semibold text-slate-900">10:00</span> so
                you can rerun the same interval cleanly.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Checklist for projector setups
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                Set the duration before you go fullscreen, then start when the
                room is ready.
              </li>
              <li>
                If you rely on sound, test it once. Some browsers require a user
                click before audio can play.
              </li>
              <li>
                Use Loop for stations and rotations so you do not have to touch
                controls at every reset.
              </li>
              <li>
                If keyboard shortcuts do nothing, click the timer card once so
                it has focus. Shortcuts do not fire while typing in the time
                input.
              </li>
              <li>
                If you want a “speaker view” timer, use a presentation-specific
                route instead.
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
            You can start quickly with presets (1, 2, 3, 5, 10, 15, 20, 25, 30,
            45, 60 minutes). Presets are made for common classroom and workshop
            timings where you want a fast start and minimal setup. If you need
            an exact duration, use the input. It accepts seconds (for example{" "}
            <span className="font-semibold text-slate-900">90</span>), minutes
            and seconds (for example{" "}
            <span className="font-semibold text-slate-900">7:30</span>), or
            hours, minutes, seconds (for example{" "}
            <span className="font-semibold text-slate-900">1:05:00</span>).
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Fullscreen mode is display-first. Once you enter fullscreen, the
            timer becomes the main control surface. You can click or tap the
            time to start or pause. That matters in real rooms, because the
            person controlling the timer often is not seated at a keyboard, or
            is moving between stations.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Sound is optional and minimal. With Sound on, the timer plays a
            short finish beep at{" "}
            <span className="font-semibold text-slate-900">00:00</span>. If you
            are in a quiet environment, keep Sound off and the timer stays
            completely silent. Loop is also optional. With Loop on, the timer
            restarts the same duration immediately after it hits zero. This is
            useful for repeating intervals where the length does not change.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These examples match what the timer shows on screen, including
            formatting and typical actions like pausing, resetting, and looping.
            Use them as templates for your own setup.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Classroom independent work (15 minutes)"
              subtitle="A clean, visible countdown so students stop asking “how much time left?”"
              lines={[
                "Setup:",
                "- Preset: 15m",
                "- Sound: OFF (quiet room)",
                "- Loop: OFF",
                "",
                "What you see:",
                "- Start: 15:00",
                "- Midway: 08:47",
                "- Final minute: 01:00",
                "- Finish: 00:00 (silent)",
                "",
                "Control:",
                "- Press Space to pause if you need to address the class",
                "- Press R to reset back to 15:00 for another round",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Workshop rotations (7 minutes 30 seconds, looping)"
              subtitle="Stations where the same interval repeats automatically"
              lines={[
                "Setup:",
                "- Custom input: 7:30",
                "- Sound: ON (audible switch cue)",
                "- Loop: ON",
                "",
                "Cycle behavior:",
                "- Start: 7:30",
                "- Finish: 00:00 (beep)",
                "- Immediately restarts: 7:30",
                "- Repeats until you pause or turn Loop off",
                "",
                "Practical outcome:",
                "- You do not have to reset between stations",
                "- The beep becomes the “rotate now” signal",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Presenter pacing (30 minutes, fullscreen click control)"
              subtitle="Run the timer on a second display while presenting"
              lines={[
                "Setup:",
                "- Preset: 30m",
                "- Fullscreen: ON",
                "- Sound: optional",
                "",
                "What you see:",
                "- Start: 30:00 (large digits)",
                "- Pause for Q&A: click the time at 12:18 remaining",
                "- Resume: click the time again, continues from 12:18",
                "",
                "Exit:",
                "- Press Esc to leave fullscreen quickly",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Lab timing (1 hour 5 minutes)"
              subtitle="Longer sessions display as H:MM:SS automatically"
              lines={[
                "Setup:",
                "- Custom input: 1:05:00",
                "- Sound: ON (end signal)",
                "- Loop: OFF",
                "",
                "What you see:",
                "- Start: 1:05:00",
                "- Later: 0:42:10",
                "- Final minute: 0:01:00",
                "- Finish: 0:00:00 (beep)",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Micro-sprints (90 seconds, repeated manually)"
              subtitle="Fast, repeatable intervals with quick reset"
              lines={[
                "Setup:",
                "- Custom input: 90",
                "- Sound: OFF",
                "- Loop: OFF",
                "",
                "Run:",
                "- Start: 1:30",
                "- Finish: 0:00 (silent)",
                "",
                "Repeat:",
                "- Press R to return to 1:30",
                "- Press Space to start the next sprint",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Keeping it simple for the room (10 minutes, no typing)"
              subtitle="Preset-first workflow"
              lines={[
                "Setup:",
                "- Preset: 10m",
                "- Sound: OFF or ON",
                "- Fullscreen: ON",
                "",
                "Room experience:",
                "- Everyone can read 10:00 at a glance",
                "- You can tap/click the time to pause if needed",
                "- Press R to restart at 10:00 without re-selecting",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fast control in real rooms
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Keyboard shortcuts keep control simple when you are near a laptop
              or desktop: <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset,{" "}
              <Kbd>F</Kbd> fullscreen, and <Kbd>Esc</Kbd> to exit. In
              fullscreen, click or tap the time itself to start or pause without
              aiming for buttons. If shortcuts do nothing, click the timer card
              once so it has focus.
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
                If you need a different timing style, use the closest match
                below.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/classroom-timer">Classroom Timer</PillLink>
            <PillLink to="/presentation-timer">Presentation Timer</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/online-timer">Online Timer</PillLink>
            <PillLink to="/silent-timer">Silent Timer</PillLink>
            <PillLink to="/visual-timer">Visual Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/count-up-timer">Count Up Timer</PillLink>
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
                remaining time as (end - now). This reduces drift you can get
                from “tick once per second” approaches.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle work in background tabs to save power. The
                timer will catch up to the correct remaining time when you
                return, but visual updates can look less smooth while hidden.
                For the steadiest display, keep the tab visible or use
                fullscreen on the active screen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses WebAudio. Many browsers block audio until a user
                gesture (click or tap). If you do not hear the finish beep,
                click Start once and try again, and check that the tab and
                device are not muted.
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
                Duration limits and formatting
              </div>
              <p className="mt-1 leading-relaxed">
                The timer supports durations up to 24 hours. The display
                switches formats automatically: shorter times show minutes and
                seconds (like{" "}
                <span className="font-semibold text-slate-900">12:00</span>
                ), and longer times show hours, minutes, seconds (like{" "}
                <span className="font-semibold text-slate-900">2:00:00</span>).
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need a classroom-first UI?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/classroom-timer"
            >
              Classroom Timer
            </Link>{" "}
            if you want language and defaults tuned specifically for classroom
            flow.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need multiple timers?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/multiple-timers"
            >
              Multiple Timers
            </Link>{" "}
            when you want several independent countdowns running at once.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this is a
          fullscreen timer with huge digits for projectors and smartboards, with
          presets, custom time input, optional sound, loop mode, and fast
          control via click/tap or keyboard shortcuts.
        </div>
      </div>
    </section>
  );
}

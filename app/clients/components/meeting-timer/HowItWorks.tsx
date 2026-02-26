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
   - Meeting Timer intent: agenda timeboxing + countdown + fullscreen + optional sound
   - Tool-focused, not meeting advice
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/meeting-timer",
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
    name: "How to use the Meeting Timer (agenda timeboxing, fullscreen, sound)",
    description:
      "Run a clear countdown for meeting agenda timeboxes. Choose presets or custom minutes, start and pause as needed, go fullscreen for a big room display, and optionally enable sound and final beeps for the last 5 seconds.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a timebox (preset or custom minutes)",
        text: "Pick a preset like 5m, 10m, or 15m, or enter custom minutes (1–180). The timer sets the countdown duration and stays Ready until you start.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset the countdown",
        text: "Press Start (or Space) to begin. Press Pause to stop the countdown without losing remaining time. Press Reset (or R) to return to the selected minutes.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a large display everyone can read",
        text: "Press Fullscreen (or F). In fullscreen, tap/click the time to start or pause. Exit with Esc or the Exit button.",
      },
      {
        "@type": "HowToStep",
        name: "Optional: enable sound cues",
        text: "Turn on Sound for a completion beep at 0:00. Enable Final beeps (requires Sound) for beeps during the last 5 seconds.",
      },
      {
        "@type": "HowToStep",
        name: "Move to the next agenda item",
        text: "When you switch topics, either change minutes (which resets automatically) or press Reset to rerun the same timebox. Presets make this fast.",
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
                Meeting Timer
              </span>{" "}
              is built for one job:{" "}
              <span className="font-semibold text-slate-900">
                run a clear countdown
              </span>{" "}
              for meeting timeboxes so people can see the time remaining without
              asking. You choose minutes (a preset or a custom value), press{" "}
              <span className="font-semibold text-slate-900">Start</span>, and
              the display counts down to{" "}
              <span className="font-semibold text-slate-900">0:00</span>. When
              the timebox ends, the timer stops automatically and (optionally)
              plays a short beep so you can transition without staring at the
              screen.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page is not a meeting guide. It does not try to teach
              facilitation or sell a framework. It is a tool page with a simple
              workflow: set the timebox for the current agenda item, run it,
              then move to the next item by changing minutes or pressing Reset.
              Fullscreen is included because most real meetings need a
              room-friendly display that works on a TV, projector, or shared
              screen.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The display is intentionally plain and stable. Under an hour, you
              will typically see{" "}
              <span className="font-semibold text-slate-900">m:ss</span> like{" "}
              <span className="font-semibold text-slate-900">9:30</span>. For
              longer timeboxes, it switches to{" "}
              <span className="font-semibold text-slate-900">h:mm:ss</span> like{" "}
              <span className="font-semibold text-slate-900">1:05:00</span>. In
              fullscreen, the numbers scale up to fill the screen so you can
              read them from across a room.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Countdown
            </span>
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
              Final beeps
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
                timebox with presets (1m, 2m, 3m, 5m, 10m, 15m, 30m) or type
                Custom minutes.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span> (or{" "}
                <Kbd>Space</Kbd>) to begin. The status changes from{" "}
                <span className="font-semibold text-slate-900">Ready</span> to{" "}
                <span className="font-semibold text-slate-900">Running</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> If you
                need to pause discussion, press{" "}
                <span className="font-semibold text-slate-900">Pause</span>.
                Press Start again to continue from the same remaining time.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen. In fullscreen,{" "}
                <span className="font-semibold text-slate-900">
                  tap/click the time
                </span>{" "}
                to start or pause without hunting for controls.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> When
                time hits{" "}
                <span className="font-semibold text-slate-900">0:00</span>, the
                timer stops. Press Reset to return to the selected minutes for
                another run.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What changes minutes means on this page
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Changing minutes is a deliberate reset. If you are running a
                10-minute timebox and switch to 5 minutes for the next topic,
                the timer stops and updates the display to{" "}
                <span className="font-semibold text-slate-900">5:00</span>. This
                is useful for agendas because it prevents accidental carryover
                and makes each item clean and repeatable.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                If you want everyone to see the same timer, use fullscreen on a
                shared screen.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
                focus.
              </li>
              <li>
                If you want an audible “wrap up now” cue, enable Final beeps.
              </li>
              <li>
                If you need elapsed time with agenda splits, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/meeting-count-up-timer"
                >
                  Meeting Count Up Timer
                </Link>
                .
              </li>
              <li>
                If you want a general countdown outside meetings, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  to="/countdown-timer"
                >
                  Countdown Timer
                </Link>
                .
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
            What this Meeting Timer is optimized for
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            A meeting timebox only works if it is visible and easy to restart.
            This timer is designed around that reality. The display is large,
            the workflow is repeatable, and the “next agenda item” action is
            fast: you either change minutes (for a new timebox) or press Reset
            (to rerun the same timebox). That sounds small, but it matters in
            real meetings. People do not want to manage settings, create a
            schedule, or juggle multiple timers. They want a single page they
            can keep open and run all meeting long.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The optional sound features are there for moments where the room’s
            attention is on discussion, not on the clock. With Sound enabled,
            the page plays a short beep when the countdown finishes. With Final
            beeps enabled, it also beeps in the last 5 seconds. This creates a
            clean “wrap up now” cue that is still lightweight (no alarms, no
            permissions prompts, no notifications setup). If you prefer a
            completely silent meeting room, leave Sound off and rely on the
            visual countdown and the status label.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with concrete numbers (what you will see on this page)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These scenarios are written to match how this route behaves. The
            numbers below are the kinds of values you will literally see in the
            timer display while you use presets, pause and resume, and switch
            between agenda items.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Weekly sync with 5 agenda items (typical preset jumps)"
              subtitle="Use presets to move topic-by-topic without typing."
              lines={[
                "Agenda:",
                "- 5m warm-up",
                "- 10m metrics",
                "- 15m decisions",
                "- 5m risks",
                "- 3m wrap-up",
                "",
                "What you do on this page:",
                "- Select 5m, press Start → display counts 5:00, 4:59, ...",
                "- At 0:00, it stops. Press Reset → back to 5:00 (if you rerun).",
                "- Click 10m → display becomes 10:00 (timer stops and is Ready).",
                "- Click Start for metrics.",
                "- Repeat for 15m, 5m, 3m topics.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Design review where discussion pauses twice"
              subtitle="Pause keeps remaining time fair without restarting."
              lines={[
                "Setup:",
                "- Select 20m timebox (20:00).",
                "",
                "Run:",
                "- Start at 20:00 → after 6 minutes you see 14:00.",
                "- Pause for a sidebar at ~13:42 (display freezes at 13:42).",
                "- Resume → countdown continues from 13:42.",
                "- Pause again at 2:15 to handle a quick decision.",
                "- Resume → finish at 0:00.",
                "",
                "What you see:",
                "- Status flips between Running and Paused.",
                "- Remaining time is preserved exactly through pauses.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Standup with per-speaker 2-minute caps"
              subtitle="Reset repeats the same timebox without reselecting."
              lines={[
                "Setup:",
                "- Select 2m preset (2:00).",
                "",
                "Run:",
                "- Start for Speaker A.",
                "- At 0:00, timer stops.",
                "- Press Reset → back to 2:00 for Speaker B.",
                "- Repeat for Speaker C, D, E.",
                "",
                "What you gain:",
                "- Same timebox repeated consistently.",
                "- No typing, no new setup between speakers.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Client call with a clear wrap-up cue (final 5 seconds)"
              subtitle="Use Final beeps when you want the cutoff to be obvious."
              lines={[
                "Setup:",
                "- Select 10m, enable Sound, enable Final beeps.",
                "",
                "What happens near the end:",
                "- At 0:05 you see 0:05 and hear a short beep each second.",
                "- The last second shows 0:01, then 0:00.",
                "- At 0:00, a completion beep plays and the timer stops.",
                "",
                "How it feels in practice:",
                "- People get a clear “wrap it up” signal without watching the clock.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Workshop segments (switch durations as you go)"
              subtitle="Minute changes are a clean “next topic” action."
              lines={[
                "Agenda:",
                "- 12m intro",
                "- 25m group work",
                "- 7m share-out",
                "- 5m close",
                "",
                "Run:",
                "- Type 12 in Custom minutes → display is 12:00 (Ready). Start.",
                "- When done, type 25 → timer stops and display becomes 25:00.",
                "- Start for group work; then switch to 7:00 and 5:00.",
                "",
                "What you see:",
                "- Each agenda item begins with a fresh countdown.",
                "- No need to manually “clear” the prior topic.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Large room display (fullscreen + click-to-toggle)"
              subtitle="Control the timer from the screen everyone is watching."
              lines={[
                "Setup:",
                "- Press F for fullscreen.",
                "",
                "Typical usage:",
                "- Click the time to Start.",
                "- Click again to Pause if the room needs a hold.",
                "- Use the top bar Reset when you want to rerun the same topic.",
                "- Exit with Esc.",
                "",
                "What you see:",
                "- Big digits (e.g., 8:17 remaining).",
                "- Minimal controls designed for quick operation.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Picking the right page when your goal is slightly different
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This route is for countdown timeboxing. If you want elapsed time
              and a quick record of how long each agenda item took, use the
              count up meeting timer. If you want a general countdown without
              meeting framing, use the standard countdown page. If you want
              multiple timers running at once (breakouts, stations, parallel
              groups), use multiple timers.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Elapsed time:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/meeting-count-up-timer"
              >
                Meeting Count Up Timer
              </Link>
              . General countdown:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/countdown-timer"
              >
                Countdown Timer
              </Link>
              . Parallel timers:{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/multiple-timers"
              >
                Multiple Timers
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
                Pick the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/meeting-count-up-timer">
              Meeting Count Up Timer
            </PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/presentation-timer">Presentation Timer</PillLink>
            <PillLink to="/silent-timer">Silent Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (countdown, focus, fullscreen, audio)
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
                Countdown timing model
              </div>
              <p className="mt-1 leading-relaxed">
                When you press Start, the timer sets a target end time based on
                the current remaining time. Remaining time is computed from that
                target, so it stays aligned with real time and does not drift.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Second-stable display
              </div>
              <p className="mt-1 leading-relaxed">
                The UI rounds the display to whole seconds so the countdown is
                easy to read on a shared screen. You will see clean steps like
                5:00 → 4:59 → 4:58.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the timer card. If they do not work,
                click the card once to focus it. While typing in the minutes
                input, shortcuts are ignored.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the timer card itself so the time
                display and controls stay together. In fullscreen, tapping or
                clicking the time toggles start or pause.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Beeps are generated with WebAudio. Some browsers require an
                explicit interaction before allowing audio output, so if beeps
                are silent, click Start once and try again. Final beeps trigger
                only in the last 5 seconds when enabled, and the finish beep
                triggers at 0:00.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need elapsed meeting time?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/meeting-count-up-timer"
            >
              Meeting Count Up Timer
            </Link>{" "}
            for elapsed time and agenda splits.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need multiple timers at once?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/multiple-timers"
            >
              Multiple Timers
            </Link>{" "}
            for parallel countdowns.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this
          meeting timer gives you a clear countdown for agenda timeboxing with
          presets and custom minutes, fullscreen mode for a big room display,
          optional sound and final beeps for clean wrap-ups, and simple
          shortcuts so you can keep meetings on time without extra setup.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/meeting-timer")}
        </span>
      </div>
    </section>
  );
}

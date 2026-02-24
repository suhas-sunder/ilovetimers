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
   - HIIT Timer intent: run intervals with warm-up, work, rest, rounds, cool-down
   - Tool-focused, not a training guide
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/hiit-timer",
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
    name: "How to use the HIIT Timer (warm-up, work/rest intervals, rounds, sound cues, fullscreen)",
    description:
      "Run interval sessions with warm-up, alternating work and rest rounds, and cool-down. Load presets like Tabata and Boxing, adjust seconds and rounds, use Start/Pause, Next, Reset, sound cues, and fullscreen with keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a setup",
        text: "Load a preset (Tabata, Intervals, Boxing) or enter your own warm-up, work, rest, rounds, and cool-down values.",
      },
      {
        "@type": "HowToStep",
        name: "Confirm cues and controls",
        text: "Turn Sound on or off, optionally enable final 3-2-1 beeps (work only), and use Start/Pause, Next, and Reset to control the session.",
      },
      {
        "@type": "HowToStep",
        name: "Run the intervals",
        text: "Press Start to begin. The timer runs warm-up once, alternates work and rest for the selected number of rounds, then finishes with cool-down.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen and shortcuts",
        text: "Press F to toggle fullscreen and Esc to exit. Space starts/pauses, N advances to the next phase, and R resets to the start.",
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
              <span className="font-semibold text-slate-900">HIIT Timer</span>{" "}
              is built for one job: run clean, repeatable intervals without
              getting in your way. You set a simple structure{" "}
              <span className="font-semibold text-slate-900">
                warm-up → work/rest rounds → cool-down
              </span>
              , then control the session with{" "}
              <span className="font-semibold text-slate-900">Start/Pause</span>,{" "}
              <span className="font-semibold text-slate-900">Next</span>, and{" "}
              <span className="font-semibold text-slate-900">Reset</span>.
              Presets load common patterns (Tabata, longer intervals, boxing
              rounds), and fullscreen turns the page into a big, readable
              training display.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              This page is not trying to teach workouts. It is designed to help
              you run the timing accurately and quickly. That means predictable
              phases, clear round tracking, fast skipping when plans change, and
              optional sound cues so you do not have to stare at the screen.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              If you are setting up a phone on the floor, a laptop on a box, or
              a TV across the room, the timer display automatically sizes to fit
              the available space, and fullscreen adds a minimal control bar so
              you can run the whole session without hunting for buttons.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Warm-up
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Work
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Rest
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Rounds
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Cool-down
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sound cues
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
                <span className="font-semibold text-slate-900">1)</span> Load a{" "}
                <span className="font-semibold text-slate-900">preset</span>{" "}
                (Tabata, Intervals, Boxing) or enter your own seconds and
                rounds.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Decide
                whether you want{" "}
                <span className="font-semibold text-slate-900">Sound</span> and
                optionally the{" "}
                <span className="font-semibold text-slate-900">
                  final 3-2-1 beeps
                </span>{" "}
                during Work.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <span className="font-semibold text-slate-900">Start</span>.
                Warm-up runs once, then Work and Rest repeat for your rounds,
                then Cool-down finishes the session.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Use{" "}
                <span className="font-semibold text-slate-900">Next</span> to
                skip a phase (skip warm-up, skip a rest, jump to cool-down).
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> For a
                clean display, press <Kbd>F</Kbd> to go fullscreen. Exit with{" "}
                <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Total time math (so you know what you are starting)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The session duration is easy to estimate:
                <span className="font-semibold text-slate-900">
                  {" "}
                  warm-up + (work + rest) × rounds + cool-down
                </span>
                . If Rest is set to 0, the middle becomes{" "}
                <span className="font-semibold text-slate-900">
                  work × rounds
                </span>
                . This page does not hide that logic. What you enter is what it
                runs, in that order.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                If you want to start immediately, set Warm-up to{" "}
                <span className="font-semibold text-slate-900">0</span> or press{" "}
                <span className="font-semibold text-slate-900">Next</span>.
              </li>
              <li>
                If you do not want rests, set Rest to{" "}
                <span className="font-semibold text-slate-900">0</span>.
              </li>
              <li>
                If you rely on sound cues, press Start once first if your
                browser blocks audio until interaction.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once so it has
                focus.
              </li>
              <li>
                If you are running a group, fullscreen keeps controls visible
                but minimal.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>N</Kbd> next, <Kbd>R</Kbd>{" "}
              reset, <Kbd>F</Kbd> fullscreen, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What the timer actually runs
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            There are five possible phases:{" "}
            <span className="font-semibold text-slate-900">Warm-up</span>,{" "}
            <span className="font-semibold text-slate-900">Work</span>,{" "}
            <span className="font-semibold text-slate-900">Rest</span>,{" "}
            <span className="font-semibold text-slate-900">Cool-down</span>, and{" "}
            <span className="font-semibold text-slate-900">Done</span>. Warm-up
            and Cool-down run at most once each. Work and Rest repeat based on
            your Round count, and the Round label tracks progress (for example,
            Round 3/8).
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The behavior is intentionally direct:
            <span className="font-semibold text-slate-900">
              {" "}
              Next advances to the next phase immediately
            </span>
            , and{" "}
            <span className="font-semibold text-slate-900">
              Reset returns you to the start
            </span>{" "}
            (Warm-up) using your current settings. If you change any of the
            interval values while not in fullscreen, the session resets to keep
            the run predictable. You do not want to be mid-round and discover
            that a new set of values partially applied.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Sound is optional. With Sound on, you get cues at phase boundaries.
            If you enable{" "}
            <span className="font-semibold text-slate-900">
              final 3-2-1 beeps
            </span>
            , the timer adds one beep per second during the last three seconds
            of Work only. That setting is deliberately limited to Work so it
            does not turn rests into a constant chirp.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Scenarios with concrete numbers (what you will experience here)
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These examples use values you can enter on this page. The total time
            estimates are simple and match the exact run order.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Tabata preset (20/10 × 8)"
              subtitle="Fast interval block with clear pacing."
              lines={[
                "Settings:",
                "- Warm-up: 0 sec",
                "- Work: 20 sec",
                "- Rest: 10 sec",
                "- Rounds: 8",
                "- Cool-down: 0 sec",
                "",
                "What you will see:",
                "- Phase starts at Work",
                "- Round label shows Round 1/8, then 2/8, ...",
                "",
                "Total time:",
                "- (20 + 10) × 8 = 240 sec = 4:00",
                "",
                "Helpful controls:",
                "- Tap/click the time in fullscreen to start/pause",
                "- Press N to skip a rest if you want to keep moving",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Longer intervals (40/20 × 10) plus warm-up/cool-down"
              subtitle="A common conditioning pattern when you want more steady work."
              lines={[
                "Settings:",
                "- Warm-up: 30 sec",
                "- Work: 40 sec",
                "- Rest: 20 sec",
                "- Rounds: 10",
                "- Cool-down: 30 sec",
                "",
                "Total time:",
                "- 0:30 + (0:40 + 0:20) × 10 + 0:30",
                "- 0:30 + 1:00 × 10 + 0:30 = 11:00",
                "",
                "What you will experience:",
                "- One warm-up countdown, then 10 work blocks",
                "- Rest blocks are short and predictable",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Boxing rounds preset (3:00 / 1:00 × 6)"
              subtitle="Round-based timing with longer work and recovery."
              lines={[
                "Settings (preset):",
                "- Warm-up: 0 sec",
                "- Work: 180 sec (3:00)",
                "- Rest: 60 sec (1:00)",
                "- Rounds: 6",
                "- Cool-down: 0 sec",
                "",
                "Total time:",
                "- (3:00 + 1:00) × 6 = 24:00",
                "",
                "On-screen behavior:",
                "- Phase chip switches Work ↔ Rest",
                "- Round label stays visible the entire time",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: No-rest blocks (Rest = 0) for continuous reps"
              subtitle="Back-to-back work intervals where you rest off-timer."
              lines={[
                "Settings:",
                "- Warm-up: 30 sec",
                "- Work: 45 sec",
                "- Rest: 0 sec",
                "- Rounds: 12",
                "- Cool-down: 30 sec",
                "",
                "Total time:",
                "- 0:30 + (0:45 × 12) + 0:30",
                "- 0:30 + 9:00 + 0:30 = 10:00",
                "",
                "What changes when Rest is 0:",
                "- Work repeats immediately between rounds",
                "- Next still advances to the next phase (eventually cool-down)",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Group session on a big screen (fullscreen + shortcuts)"
              subtitle="You want a clean display and fast control without a mouse."
              lines={[
                "Suggested workflow:",
                "- Press F to enter fullscreen",
                "- Press Space to start/pause",
                "- Press N to advance to the next phase",
                "- Press R to reset to the beginning",
                "- Press Esc to exit fullscreen",
                "",
                "Common setup example:",
                "- Warm-up 60 sec, Work 30 sec, Rest 15 sec, Rounds 12, Cool-down 60 sec",
                "- Total: 1:00 + (0:30 + 0:15) × 12 + 1:00 = 11:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Real-world adjustment mid-session (skip without retyping)"
              subtitle="Plans change. This is why Next exists."
              lines={[
                "Example: you set Warm-up to 60 sec but you are already warm.",
                "",
                "Option A (before starting):",
                "- Set Warm-up to 0 sec",
                "",
                "Option B (right now):",
                "- Press Start, then press N to jump to Work immediately",
                "",
                "Another example:",
                "- You want to end early after the last work block",
                "- Press N until you reach Cool-down or Done",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Why this page is useful even if you already know your intervals
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              People often do not need a complicated workout builder. They need
              something reliable that runs the same pattern every time and can
              handle interruptions. This timer is built around that reality:
              quick presets, visible round tracking, and controls that still
              make sense when you are out of breath.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If you want a minimal countdown with fewer settings, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/fullscreen-timer"
              >
                Fullscreen Timer
              </Link>
              . If you want multiple blocks on one screen, use{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/multiple-timers"
              >
                Multiple Timers
              </Link>
              . If you want strict formats, jump to{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/emom-timer"
              >
                EMOM Timer
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                to="/amrap-timer"
              >
                AMRAP Timer
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
                Pick the closest match to what you are actually trying to do.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>N</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/tabata-timer">Tabata Timer</PillLink>
            <PillLink to="/emom-timer">EMOM Timer</PillLink>
            <PillLink to="/amrap-timer">AMRAP Timer</PillLink>
            <PillLink to="/round-timer">Round Timer</PillLink>
            <PillLink to="/workout-timer">Workout Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, sound, focus, fullscreen)
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
                Countdown accuracy
              </div>
              <p className="mt-1 leading-relaxed">
                The timer targets phase endings using a monotonic clock
                (performance timing) rather than relying only on setInterval.
                This helps reduce drift if the browser is busy. Visual updates
                can still stutter on a slow device, but phase transitions aim
                for the intended durations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Web audio may be blocked until a user gesture occurs. If cues
                are silent, press Start once, then keep Sound enabled. The
                “final 3-2-1” beeps fire only during Work and only in the last
                three seconds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the timer card. If they do not work,
                click the card once to focus it. While typing in a number input,
                shortcuts are ignored to prevent accidental starts or skips.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the timer card itself. That keeps the
                controls, time display, and phase labels together. Use Esc or
                the Exit button to leave fullscreen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Settings changes
              </div>
              <p className="mt-1 leading-relaxed">
                Changing warm-up, work, rest, rounds, or cool-down resets the
                run state back to Warm-up. This prevents confusion where a run
                continues with a mix of old and new values.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Want a single countdown?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/countdown-timer"
            >
              Countdown Timer
            </Link>{" "}
            for a simple one-shot timer.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              Need multiple blocks on screen?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              to="/multiple-timers"
            >
              Multiple Timers
            </Link>{" "}
            for parallel timers.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">In one sentence:</strong> this HIIT
          timer runs warm-up, work/rest intervals for a set number of rounds,
          and cool-down, with presets like Tabata and boxing rounds, optional
          sound cues, next/reset controls, and fullscreen shortcuts for a clean
          training display.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/hiit-timer")}
        </span>
      </div>
    </section>
  );
}

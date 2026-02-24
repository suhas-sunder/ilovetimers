import React from "react";

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
   - Uses only your real routes (no hash anchors).
   - Scenario-based with concrete examples for /count-up-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/count-up-timer",
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
    name: "How to use the Count Up Timer (elapsed time with laps and fullscreen)",
    description:
      "Track elapsed time from 0 upward. Start and pause, record laps (splits), reset to 0, and use fullscreen with big readable digits plus keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Start timing",
        text: "Press Space or click Start to begin counting up from 0. Pause anytime and resume from the same elapsed time.",
      },
      {
        "@type": "HowToStep",
        name: "Record laps (splits)",
        text: "While running, click Lap (or press L) to record checkpoints. Each lap stores the total elapsed time and the split since the previous lap.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for visibility",
        text: "Press F to toggle fullscreen for large digits. In fullscreen, tap/click the time display to start or pause. Press Esc to exit.",
      },
      {
        "@type": "HowToStep",
        name: "Reset when finished",
        text: "Click Reset (or press R) to return to 0 and clear laps.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
      {children}
    </kbd>
  );

  const PillLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {children} →
    </a>
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
        <div className="font-mono text-xs whitespace-pre-wrap text-slate-800">
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

            <p className="mt-2 max-w-3xl text-slate-700 leading-relaxed">
              This Count Up Timer is built for one job: track{" "}
              <span className="font-semibold text-slate-900">elapsed time</span>{" "}
              clearly, without setup. It starts at 0 and counts upward. You can
              pause and resume without losing your place, record{" "}
              <span className="font-semibold text-slate-900">laps</span> to mark
              checkpoints, and switch to fullscreen for large digits that are
              readable across the room. It’s a practical fit for meetings,
              workouts, study sessions, experiments, practice attempts, and any
              situation where “how long has it been?” matters more than “how
              long until it ends?”
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              This page is intentionally not a directory, a blog post, or a
              tutorial. It gives you a clean timer plus the controls people
              actually use in the moment: Start/Pause, Lap, Reset, and
              Fullscreen. If your situation is better served by a countdown,
              structured intervals, or a specialized workflow, jump to the
              closest fit:{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/stopwatch")}
              >
                Stopwatch
              </a>{" "}
              for a classic stopwatch-style experience,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>{" "}
              when you need to end at zero,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/meeting-count-up-timer")}
              >
                Meeting Count Up Timer
              </a>{" "}
              for meeting-focused elapsed timing,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/pomodoro-timer")}
              >
                Pomodoro Timer
              </a>{" "}
              for work/rest cycles, or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/fullscreen-timer")}
              >
                Fullscreen Timer
              </a>{" "}
              if your priority is a big countdown on a shared screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Elapsed time
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Laps
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Splits
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
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
              Fast start (the common flow)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold text-slate-900">Start</span> to
                begin from 0.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Use{" "}
                <span className="font-semibold text-slate-900">Lap</span> (or{" "}
                <Kbd>L</Kbd>) to mark checkpoints. Each lap stores{" "}
                <span className="font-semibold text-slate-900">Total</span> and{" "}
                <span className="font-semibold text-slate-900">Split</span>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen if you want big digits. In
                fullscreen, tap/click the time display to start/pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> When
                you’re done, click{" "}
                <span className="font-semibold text-slate-900">Reset</span> (or{" "}
                <Kbd>R</Kbd>) to return to 0 and clear laps.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What a lap actually captures
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                A lap is a checkpoint you record while the timer is running.
                Every lap stores two numbers:
                <span className="font-semibold text-slate-900"> Total</span>,
                which is elapsed time since the start, and{" "}
                <span className="font-semibold text-slate-900">Split</span>,
                which is time since the previous lap. This makes laps useful for
                tracking segments without doing mental math.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              What elapsed time looks like (real numbers)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold">0:45 to 3:00</span>: short
                checkpoints, quick drills, brief task segments.
              </li>
              <li>
                <span className="font-semibold">5:00 to 20:00</span>: meeting
                agenda items, focus blocks, practice attempts, lab steps.
              </li>
              <li>
                <span className="font-semibold">25:00 to 60:00+</span>: study
                sessions, long meetings, deep work, or any “keep it running”
                tracking.
              </li>
              <li>
                <span className="font-semibold">Laps every 2–10 minutes</span>:
                common in meetings or training when you want a lightweight
                checkpoint record.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                Practical habit:
              </span>{" "}
              If you’ll use keyboard shortcuts, click the timer card once first.
              The page ignores shortcuts while you’re typing into an input or if
              the card doesn’t have focus.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What you see as you time something
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            The center readout is the elapsed time. It counts up in a steady,
            readable format. Under the hood, the timer tracks time with
            millisecond precision, but it displays whole seconds so the number
            doesn’t flicker or jitter. That makes it easier to read at a glance
            on a phone stand or a shared screen. A small status label tells you
            whether you’re Running, Paused, or Ready. That label matters more
            than people expect: if you’re timing something in a room full of
            distractions, it prevents the classic mistake of thinking the timer
            is running when it’s not.
          </p>

          <p className="mt-3 text-slate-700 leading-relaxed">
            Laps appear as a list. The newest lap is shown first, because that’s
            typically the one you care about in the moment. Each lap line shows
            the total elapsed time at the moment you pressed Lap, plus the split
            since your previous lap. This is the simplest way to answer
            questions like “how long did that segment take?” without having to
            subtract times yourself.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios (with settings you can copy)
          </h3>

          <p className="mt-2 text-slate-700 leading-relaxed">
            These examples are designed to feel like real usage. They include
            the kinds of numbers you’d actually see on screen and the way laps
            get recorded in everyday situations. You can copy the patterns even
            if your specific times differ.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Meeting agenda timing with checkpoints"
              subtitle="Use laps to mark transitions so you can review pacing"
              lines={[
                "Goal: Keep a 30-minute meeting honest without running a countdown.",
                "",
                "Start: Press Space at the moment the meeting begins.",
                "Lap 1: Press L at 6:20 (Agenda item 1 ends).",
                "Lap 2: Press L at 14:05 (Agenda item 2 ends).",
                "Lap 3: Press L at 22:40 (Discussion ends).",
                "Stop: Pause at 30:12 (meeting ends).",
                "",
                "What your laps show:",
                "- Lap 1 Total 6:20  | Split +6:20",
                "- Lap 2 Total 14:05 | Split +7:45",
                "- Lap 3 Total 22:40 | Split +8:35",
                "",
                "Why this helps:",
                "- You can say “discussion took 8:35” without doing math.",
                "- If you share your screen, fullscreen makes the timer readable for everyone.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Workout sets where you want honest rest timing"
              subtitle="Lap at the end of a set to capture split times"
              lines={[
                "Goal: Track sets and rest without building a full interval plan.",
                "",
                "Start: Click Start at the first rep.",
                "Lap: Press L at the end of each set.",
                "",
                "Example:",
                "- Set 1 ends at 2:10  → Lap 1 (Split +2:10)",
                "- Set 2 ends at 5:05  → Lap 2 (Split +2:55)",
                "- Set 3 ends at 8:30  → Lap 3 (Split +3:25)",
                "",
                "How people use this:",
                "- Split includes both the set and rest since the last lap.",
                "- It’s a quick way to see if rest periods drift longer over time.",
                "",
                "If you need strict work/rest intervals:",
                "- Use HIIT Timer, Tabata Timer, or EMOM Timer.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Study session with interruptions"
              subtitle="Pause to measure actual focused time, not clock time"
              lines={[
                "Goal: Measure 45 minutes of real study time even with interruptions.",
                "",
                "Start: Press Space when you begin.",
                "Pause: Press Space when interrupted.",
                "Resume: Press Space when back.",
                "Lap: Optional, to mark milestones.",
                "",
                "Example timeline:",
                "- Study 12:40 → Pause (phone call).",
                "- Resume and reach 25:00 → Lap 1 (Split +25:00 total focus).",
                "- Continue to 43:30 → Pause (short break).",
                "- Resume and finish at 52:10 → Pause (session end).",
                "",
                "What you gain:",
                "- Your elapsed time reflects only the time the timer was running.",
                "- Laps can mark chapters, problem sets, or task boundaries.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Lab timing and checkpoint logging"
              subtitle="Use laps for start/stop events without clutter"
              lines={[
                "Goal: Track elapsed time during a procedure and record key events.",
                "",
                "Start: Click Start at t=0.",
                "Lap: Press L at important events.",
                "",
                "Example laps:",
                "- 0:45  → “Mixing complete”",
                "- 6:00  → “Incubation begins”",
                "- 13:30 → “Transfer complete”",
                "",
                "What the timer stores:",
                "- Total elapsed at each event + split since the previous event.",
                "- Enough to reconstruct a basic timeline without writing timestamps.",
                "",
                "If you need countdowns for incubation windows:",
                "- Use Lab Timer or Countdown Timer.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Speedrun practice with clean splits"
              subtitle="Use laps for levels/checkpoints, fullscreen for visibility"
              lines={[
                "Goal: Track a run clock and record splits with one keypress.",
                "",
                "Start: Press Space at “Go”.",
                "Lap: Press L at the end of each segment.",
                "",
                "Example:",
                "- Level 1 ends at 3:18  → Lap 1 (Split +3:18)",
                "- Level 2 ends at 7:02  → Lap 2 (Split +3:44)",
                "- Boss ends at 10:55    → Lap 3 (Split +3:53)",
                "",
                "If you want a dedicated layout for runs:",
                "- Use Speedrun Timer.",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: When you should switch tools"
              subtitle="Elapsed time is not always the right model"
              lines={[
                "Use Count Up Timer when:",
                "- You want to know how long something has been going.",
                "- You want simple checkpoints (laps) without setup.",
                "",
                "Switch to Countdown Timer when:",
                "- You must stop at a hard limit (e.g., 10 minutes max).",
                "",
                "Switch to Multiple Timers when:",
                "- You need several independent timers at once.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (keep it effortless)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen is for visibility. It makes the digits large and keeps
              controls reachable. If you’re presenting a timer to a group, it
              removes clutter. If you’re timing something from a distance, it
              reduces the chance you misread the number. Shortcuts exist so you
              can control the timer without hunting for buttons.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800">
                <Kbd>L</Kbd> lap
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

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Focus tip:</span>{" "}
              If shortcuts do not respond, click the timer card once so it has
              keyboard focus. Shortcuts won’t fire while you’re typing into an
              input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools (same goal, different fit)
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Count Up Timer is for elapsed time and checkpoints. If your job
                is different, these pages are better matches.
              </p>
            </div>
            <div className="text-xs text-slate-600">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>L</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/meeting-count-up-timer")}>
              Meeting Count Up Timer
            </PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/pomodoro-timer")}>Pomodoro Timer</PillLink>
            <PillLink href={abs("/focus-session-timer")}>
              Focus Session Timer
            </PillLink>
            <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
            <PillLink href={abs("/emom-timer")}>EMOM Timer</PillLink>
            <PillLink href={abs("/speedrun-timer")}>Speedrun Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical details (timing, laps, fullscreen, focus)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Notes that matter when you rely on a browser timer
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Elapsed-time model
              </div>
              <p className="mt-1 leading-relaxed">
                While running, elapsed time is computed from a stored base value
                plus the delta from a high-resolution clock. The UI updates with
                requestAnimationFrame for smooth rendering.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Display rounding
              </div>
              <p className="mt-1 leading-relaxed">
                The readout is displayed in whole seconds for a steady, readable
                timer while internal tracking continues in milliseconds.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Lap storage</div>
              <p className="mt-1 leading-relaxed">
                Each lap records the total elapsed time plus the split time
                since the previous lap. This provides checkpoints without
                needing to subtract timestamps manually.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Exit with Esc. In fullscreen, the time display is clickable so
                you can start/pause without aiming for small buttons.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Background throttling and sleep
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may reduce update frequency in background tabs or when
                a device sleeps. When the tab resumes, the timer should reflect
                the correct elapsed time, but the on-screen animation may look
                less smooth while backgrounded. For best reliability, keep the
                tab visible and prevent the device from sleeping during long
                timing sessions.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Need a hard stop?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/countdown-timer")}
            >
              Countdown Timer
            </a>{" "}
            when you need to end at zero.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">Timing a meeting?</strong> If you
            want meeting-specific framing, use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/meeting-count-up-timer")}
            >
              Meeting Count Up Timer
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

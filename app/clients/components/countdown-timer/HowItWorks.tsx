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
              This Count Up Timer is for{" "}
              <span className="font-semibold text-slate-900">elapsed time</span>
              . It starts at 0 and counts upward. You can pause and resume, log{" "}
              <span className="font-semibold text-slate-900">laps</span> as
              checkpoints, and switch to fullscreen for big digits that are easy
              to read from a distance. It is designed for real timing moments:
              meetings where you need a visible clock, workouts where you want
              simple splits, study sessions where interruptions happen, and lab
              work where you want a lightweight record of key actions.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              The intent is simple: answer “how long has this been going?” with
              minimal friction. You do not have to configure intervals, names,
              or a plan before starting. If you do need a different timing
              model, go straight to the closest fit:{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/stopwatch")}
              >
                Stopwatch
              </a>{" "}
              for a stopwatch-style layout,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/fullscreen-timer")}
              >
                Fullscreen Timer
              </a>{" "}
              when you must end at zero,{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/meeting-count-up-timer")}
              >
                Meeting Count Up Timer
              </a>{" "}
              if you want meeting-specific framing, or{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/pomodoro-timer")}
              >
                Pomodoro Timer
              </a>{" "}
              for structured work and break cycles.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
              What you will see during use: a large time readout, a status label
              (Ready, Running, Paused), and an optional lap list. The lap list
              is where this tool becomes more than a basic clock, because it
              turns quick “moments” into recorded checkpoints you can reference
              immediately.
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
              Fast start (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold text-slate-900">Start</span>. The
                timer counts up from 0.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Press{" "}
                <span className="font-semibold text-slate-900">Lap</span> (or{" "}
                <Kbd>L</Kbd>) to mark a checkpoint. You get{" "}
                <span className="font-semibold text-slate-900">Total</span> and{" "}
                <span className="font-semibold text-slate-900">Split</span>{" "}
                automatically.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen when visibility matters. In
                fullscreen you can tap or click the time display to start or
                pause.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Press{" "}
                <Kbd>R</Kbd> or click{" "}
                <span className="font-semibold text-slate-900">Reset</span> to
                return to 0 and clear laps.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Laps vs splits (quick definition)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                A <span className="font-semibold text-slate-900">lap</span> is a
                checkpoint you record. A{" "}
                <span className="font-semibold text-slate-900">split</span> is
                the time between laps. For example, if you press Lap at 6:20 and
                then again at 14:05, the split for the second lap is 7:45. You
                do not need to calculate anything. The page shows it for you.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Practical use: treat laps like “bookmark timestamps.” If you are
                timing a meeting, a drill, a demo, or a work session, laps are
                the fastest way to capture when something happened relative to
                the start.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              What elapsed time looks like (typical ranges)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold">0:30 to 3:00</span>: quick
                checkpoints, short drills, small task segments.
              </li>
              <li>
                <span className="font-semibold">5:00 to 20:00</span>: agenda
                items, focus blocks, practice attempts, lab steps.
              </li>
              <li>
                <span className="font-semibold">25:00 to 60:00+</span>: study
                sessions, deep work, long meetings, long running processes.
              </li>
              <li>
                <span className="font-semibold">Laps every 2–10 minutes</span>:
                common when you want lightweight checkpoint logging.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Focus tip:</span>{" "}
              If you want keyboard control, click the timer card once first.
              Shortcuts will not fire while you are typing in an input or if the
              card does not have focus.
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">
                When this page is the wrong tool:
              </span>{" "}
              if you must stop exactly at a limit (for example, a 10:00 speaking
              slot), use a countdown page so the end condition is explicit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-sky-700">
            What happens when you press Start, Lap, and Pause
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            When you start the timer, the readout begins counting up
            immediately. When you pause, the readout stops and the status
            switches to Paused. When you resume, it continues from the exact
            elapsed time you left off at. This sounds obvious, but it matters in
            situations where interruptions are part of the process. If you are
            timing “real work time” rather than “clock time,” pause is the
            difference between an honest number and a misleading one.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            Laps only work while the timer is running. That is intentional. If
            the timer is paused, Lap is disabled so you do not accidentally log
            a checkpoint that did not happen during active timing. Each lap
            captures two values: Total elapsed time and Split time since the
            previous lap. The newest lap appears at the top so your most recent
            checkpoint stays visible.
          </p>

          <p className="mt-3 leading-relaxed text-slate-700">
            The on-screen readout is shown in whole seconds for a steady
            display. Under the hood, timing is still tracked smoothly, but the
            displayed seconds do not flicker. That is helpful on a projector, a
            wall display, or a phone on a stand where you want instant
            readability.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-sky-700">
            Real scenarios with numbers you can copy
          </h3>

          <p className="mt-2 leading-relaxed text-slate-700">
            These scenarios are written to match how people actually use a count
            up timer. The numbers below are the kind of values you will see on
            screen, and the lap lines show exactly what the page records.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Meeting agenda timing with checkpoints"
              subtitle="You want a visible elapsed clock plus simple transition markers"
              lines={[
                "Goal: Run a 30-minute meeting with clear pacing and proof of where time went.",
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
                "- You can say “discussion took 8:35” without subtracting times.",
                "- Fullscreen makes it readable when you share a screen.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Workout sets where you want honest rest timing"
              subtitle="Lap at the end of each set or round to capture pacing"
              lines={[
                "Goal: Track sets and rest without programming intervals.",
                "",
                "Start: Click Start at the first rep.",
                "Lap: Press L at the end of each set.",
                "",
                "Example session:",
                "- Set 1 ends at 2:10  → Lap 1 (Split +2:10)",
                "- Set 2 ends at 5:05  → Lap 2 (Split +2:55)",
                "- Set 3 ends at 8:30  → Lap 3 (Split +3:25)",
                "",
                "Interpretation:",
                "- Each split includes work + rest since the prior lap.",
                "- You can see when rest drifts longer over time.",
                "",
                "If you need strict work/rest intervals:",
                "- Use HIIT Timer, Tabata Timer, EMOM Timer, or Round Timer.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Study session with interruptions"
              subtitle="Pause measures focused time, not the time your laptop was open"
              lines={[
                "Goal: Capture 45 minutes of actual study time even with interruptions.",
                "",
                "Start: Press Space when you begin.",
                "Pause: Press Space when interrupted.",
                "Resume: Press Space when you’re back.",
                "Lap: Optional, to mark milestones.",
                "",
                "Example timeline:",
                "- Study 12:40 → Pause (phone call).",
                "- Resume and reach 25:00 → Lap 1 (chapter 1 complete).",
                "- Continue to 43:30 → Pause (short break).",
                "- Resume and finish at 52:10 → Pause (session end).",
                "",
                "Result:",
                "- Elapsed time reflects only the time the timer was running.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Lab timing and checkpoint logging"
              subtitle="Use laps as event markers without writing timestamps"
              lines={[
                "Goal: Track a procedure and record key actions as they happen.",
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
                "",
                "If you need countdown windows for steps:",
                "- Use Lab Timer or Countdown Timer.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Speedrun practice with clean splits"
              subtitle="One key for splits, fullscreen for visibility"
              lines={[
                "Goal: Run clock + split markers without setup.",
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
              title="Scenario 6: Choosing the right timing model"
              subtitle="A fast decision rule so you do not fight the wrong tool"
              lines={[
                "Use Count Up Timer when:",
                "- You want to know how long something has been going.",
                "- You want checkpoint logging without setup (laps).",
                "",
                "Switch to Countdown Timer when:",
                "- You must stop at a hard limit (10:00, 30:00, etc.).",
                "",
                "Switch to Multiple Timers when:",
                "- You need several independent timers at once.",
              ]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen and shortcuts (built for real use)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen is for visibility and simplicity. The digits become
              large, the page is easier to read on a projector or shared screen,
              and you are less likely to misread the time under pressure. If you
              are timing something from across the room, fullscreen is the
              default choice.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Shortcuts are there so you can keep your hands on the keyboard and
              your attention on the task. For example, in a meeting you can hit{" "}
              <Kbd>L</Kbd> at a transition without switching windows. In a
              practice session you can hit <Kbd>Space</Kbd> to pause immediately
              when something stops.
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
              keyboard focus. Shortcuts will not fire while you are typing into
              an input.
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
                This page is optimized for elapsed time plus checkpoint logging.
                If your task needs a different structure, these pages are a
                better match.
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
                you can start or pause without aiming for small buttons.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Background throttling and sleep
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may reduce update frequency in background tabs or when
                a device sleeps. When the tab resumes, the timer should reflect
                the correct elapsed time, but the on-screen updates can look
                less smooth while backgrounded. For long timing sessions, keep
                the tab visible and prevent the device from sleeping.
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
            when you must end at zero.
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

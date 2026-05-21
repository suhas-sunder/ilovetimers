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
   - Lab Timer intent: stopwatch with laps + repeatable step countdown + fullscreen
   - Tool-focused, not a lab methods guide
   - Scenario-based with concrete numbers users will see on this page
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/lab-timer",
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
    name: "How to use the Lab Timer (stopwatch laps, repeatable step countdown, fullscreen, sound cues, shortcuts)",
    description:
      "Use a lab-focused timer with two browser tools: a stopwatch with laps for observations and repeated trials, and a repeatable step countdown for protocol steps. Optional sound cues, final beeps, fullscreen step view, and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose the timing mode",
        text: "Use the stopwatch for reaction timing and trials (with Lap splits), or use the step countdown for timed protocol steps that you may repeat.",
      },
      {
        "@type": "HowToStep",
        name: "Run and record laps (stopwatch)",
        text: "Press Space to start/pause the stopwatch. Press L to record a lap split and the running total. Adjust Max laps if you want to cap the list.",
      },
      {
        "@type": "HowToStep",
        name: "Set and run a step timer (countdown)",
        text: "Pick a common step duration or enter a custom number of seconds. Press C or Start to begin. Turn on Repeat step to automatically restart at zero.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound and fullscreen for hands-busy workflows",
        text: "Enable Sound for cues. Enable Final beeps to hear a beep in the last 5 seconds before zero. Press F to fullscreen the step timer and Esc to exit.",
      },
      {
        "@type": "HowToStep",
        name: "Reset between trials",
        text: "Press R to reset both timers quickly between trials or protocol runs.",
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
              <span className="font-semibold text-[var(--ilt-text-primary)]">Lab Timer</span> is
              a practical timing page for experiments and repeatable procedures.
              It combines two tools that cover most bench timing needs: a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                stopwatch with lap splits
              </span>{" "}
              (for reaction timing, event markers, and repeated trials) and a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                repeatable step countdown
              </span>{" "}
              (for timed protocol steps you want to run consistently).
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is not a lab methods guide and it does not ask you to
              type in long plans. It is built to help you run timing cleanly:
              start and pause instantly, capture lap splits without thinking,
              loop a step timer when you are repeating the same action, and
              switch to a big fullscreen display when your hands are busy or the
              screen is across the room.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Everything runs locally in your browser, no account required. If
              you need a dedicated single-purpose tool, the links at the bottom
              point you to a simple{" "}
              <Link
                to="/stopwatch"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              >
                Stopwatch
              </Link>
              , a one-shot{" "}
              <Link
                to="/countdown-timer"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              >
                Countdown Timer
              </Link>
              , or{" "}
              <Link
                to="/multiple-timers"
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              >
                Multiple Timers
              </Link>{" "}
              for parallel steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Stopwatch + laps
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Step countdown
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Repeat step
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sound cues
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Shortcuts
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Decide
                which tool fits the moment:{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Stopwatch</span>{" "}
                for reaction timing and trials, or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Step countdown
                </span>{" "}
                for timed protocol steps.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span>{" "}
                Stopwatch: press <Kbd>Space</Kbd> to start/pause, then press{" "}
                <Kbd>L</Kbd> to capture a lap split (time since your last lap)
                plus the running total.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span>{" "}
                Countdown: pick a common step time (10s, 30s, 60s, 2m, 5m, etc.)
                or enter seconds, then start it with <Kbd>C</Kbd> (or Start).
                Turn{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Repeat step
                </span>{" "}
                on if you want it to loop automatically.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If your
                screen needs to be readable at a distance, press <Kbd>F</Kbd> to
                fullscreen the step timer. Exit with <Kbd>Esc</Kbd>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Between
                runs, press <Kbd>R</Kbd> to reset both timers quickly.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What you are recording (so laps mean something)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                A lap on this page is a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">split</span> plus
                a <span className="font-semibold text-[var(--ilt-text-primary)]">total</span>.
                Split is the time since your previous lap. Total is the overall
                stopwatch time. That pairing lets you capture event-to-event
                timing while still keeping the context of how far into the run
                you were when it happened.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you want audible cues, enable{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span>.
                Some browsers require you to press Start once before audio
                plays.
              </li>
              <li>
                If you want a warning before zero, enable{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>{" "}
                to hear beeps during the last 5 seconds.
              </li>
              <li>
                If shortcuts do nothing, click the Lab Timer card once so it has
                focus.
              </li>
              <li>
                If you need a hands-busy control, fullscreen lets you tap/click
                the timer area to start or pause the countdown.
              </li>
              <li>
                If you need different step lengths back-to-back, a single repeat
                step timer is the wrong tool. Use Multiple Timers.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>Space</Kbd> stopwatch start/pause, <Kbd>L</Kbd> lap,{" "}
              <Kbd>C</Kbd> countdown start/pause, <Kbd>T</Kbd> repeat toggle,{" "}
              <Kbd>R</Kbd> reset, <Kbd>F</Kbd> fullscreen, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What the page actually offers
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              Stopwatch + Laps
            </span>{" "}
            is your “mark events” tool. It shows time in{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">mm:ss.cc</span>{" "}
            (minutes, seconds, centiseconds). That makes short reaction
            intervals easy to read without staring at milliseconds. Pressing Lap
            stores a split and a total so you can see both the gap between
            events and where the event occurred in the overall run. The list is
            shown newest-first so you always see the most recent entries at the
            top.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              Repeatable Countdown
            </span>{" "}
            is your “step timer” tool. It is intentionally simple: you set a
            single duration in seconds, then run it once or loop it. If{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Repeat step</span> is
            on, the countdown restarts automatically at zero using your current
            step duration. If Repeat is off, it stops at zero. This is designed
            for procedures where you want the same timing repeated reliably,
            without re-clicking a preset each time.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span>{" "}
            applies to the step countdown box only. That is deliberate: the
            countdown is what people usually put on a bench display or shared
            screen. Fullscreen adds a compact top bar (Start/Pause, Reset,
            Repeat On/Off), and the timer area becomes clickable so you can
            start/pause without hunting for small controls.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> is
            optional. With Sound enabled, you will hear cues for actions and
            completion. With{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
            enabled, you will hear one short beep per second in the last{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">5 seconds</span>{" "}
            before the countdown reaches zero. This is built for hands-busy
            workflows where you want a clear “get ready” signal before the step
            ends.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with real numbers (what you will see on this page)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These scenarios use values you can enter directly in the Lab Timer.
            The lap output format and countdown display match what you will see
            on-screen.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Reaction timing with lap splits"
              subtitle="You want event-to-event timing plus a running total."
              lines={[
                "Stopwatch:",
                "- Press Space to start",
                "- Press L at each event",
                "",
                "Example laps you might see (mm:ss.cc):",
                "Lap 1 split: 0:01.24   total: 0:01.24",
                "Lap 2 split: 0:01.08   total: 0:02.32",
                "Lap 3 split: 0:00.96   total: 0:03.28",
                "Lap 4 split: 0:01.12   total: 0:04.40",
                "",
                "What this tells you:",
                "- Your event gaps were ~1.24s, 1.08s, 0.96s, 1.12s",
                "- You were 4.40s into the run at the 4th event",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Repeating a 60-second step (looping countdown)"
              subtitle="Common for repeated steps with the same duration."
              lines={[
                "Countdown:",
                "- Step: 60 seconds",
                "- Repeat step: ON",
                "- Sound: ON (optional)",
                "",
                "What you will see:",
                "- 1:00 → 0:59 → ... → 0:05 → 0:04 → 0:03 → 0:02 → 0:01 → 0:00",
                "- Immediately restarts to 1:00 when Repeat is ON",
                "",
                "If Final beeps is ON:",
                "- A beep at 0:05, 0:04, 0:03, 0:02, 0:01",
                "- Completion cue at 0:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Short step with a warning (15 seconds + final beeps)"
              subtitle="You need a heads-up right before a step ends."
              lines={[
                "Countdown:",
                "- Step: 15 seconds",
                "- Repeat step: OFF",
                "- Sound: ON",
                "- Final beeps: ON",
                "",
                "What you experience:",
                "- Quiet countdown until the last 5 seconds",
                "- Beeps at 0:05, 0:04, 0:03, 0:02, 0:01",
                "- Completion cue at 0:00 and the timer stops",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Long step on a wall display (5 minutes fullscreen)"
              subtitle="Readable from across the room with minimal controls."
              lines={[
                "Countdown:",
                "- Step: 300 seconds (5:00)",
                "- Press F for fullscreen",
                "",
                "On-screen behavior:",
                "- Large 5:00 display that auto-fits the screen",
                "- Top bar with Start/Pause, Reset, Repeat On/Off",
                "- Tap/click the timer area to start/pause",
                "- Press Esc to exit fullscreen",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Repeated trials with quick resets"
              subtitle="You want consistent start conditions between runs."
              lines={[
                "Workflow:",
                "- Stopwatch trial: Space start → L marks event(s) → Space pause",
                "- Press R to reset stopwatch and countdown",
                "",
                "Example: 12 trials with clean starts",
                "- Each trial begins at 0:00.00",
                "- Laps list stays within your Max laps cap",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: When you should switch tools"
              subtitle="The Lab Timer is built for a single step countdown, not multi-step sequences."
              lines={[
                "If you need step durations like:",
                "- 30s, then 2m, then 10m, then 45s",
                "",
                "Use instead:",
                "- Multiple Timers (one timer per step) or a dedicated Countdown Timer",
                "",
                "If you only need one repeating duration:",
                "- Stay on Lab Timer and enable Repeat step",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Why this page is useful in practice
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              A lot of timing pages force you into one model: either a pure
              stopwatch or a pure countdown. Lab work often needs both. You may
              be capturing reaction timing in short bursts, then immediately
              switching to a repeatable step timer for consistent pacing. This
              page keeps that switch frictionless, with clear display, optional
              audio cues, and a reset that clears both tools at once.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If your workflow is simpler, use the specialized pages:{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/stopwatch"
              >
                Stopwatch
              </Link>{" "}
              for a dedicated lap view,{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/countdown-timer"
              >
                Countdown Timer
              </Link>{" "}
              for a simple one-shot countdown, or{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/multiple-timers"
              >
                Multiple Timers
              </Link>{" "}
              for parallel or staggered steps.
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
                Use the closest match to what you are actually trying to time.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>L</Kbd> <Kbd>C</Kbd> <Kbd>T</Kbd>{" "}
              <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/stopwatch">Stopwatch</PillLink>
            <PillLink to="/countdown-timer">Countdown Timer</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
            <PillLink to="/multiple-timers">Multiple Timers</PillLink>
            <PillLink to="/time-calculator">Time Calculator</PillLink>
            <PillLink to="/reaction-time-test">Reaction Time Test</PillLink>
            <PillLink to="/milliseconds-converter">
              Milliseconds Converter
            </PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (timing, sound, focus, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes if you rely on exact behavior
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Stopwatch update loop
              </div>
              <p className="mt-1 leading-relaxed">
                The stopwatch updates using animation frames and a monotonic
                timing source (performance timing) so the displayed time stays
                consistent across pauses. Visual updates can look less smooth on
                a slow device, but elapsed time is still computed from a stable
                clock.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Countdown timing
              </div>
              <p className="mt-1 leading-relaxed">
                The countdown targets its end time using a monotonic clock
                instead of relying only on setInterval. This reduces drift when
                the browser is busy. The display rounds to whole seconds for
                readability, while the internal target remains time-based.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Web audio may be blocked until a user gesture occurs. If cues
                are silent, click/tap a Start button once, then try again. Final
                beeps fire once per second in the last 5 seconds only when Sound
                is enabled.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Keyboard focus rules
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are handled on the Lab Timer card. If they do not
                work, click the card once to focus it. While typing in a number
                input, shortcuts are ignored to prevent accidental starts.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen targeting
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen is applied to the countdown box so the time display
                stays large and readable. The fullscreen top bar exposes
                Start/Pause, Reset, and Repeat On/Off, and the timer area is
                clickable for start/pause.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need parallel steps?</strong> Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/multiple-timers"
            >
              Multiple Timers
            </Link>{" "}
            when you need more than one independent timer.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a minimal big display?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/fullscreen-timer"
            >
              Fullscreen Timer
            </Link>{" "}
            for a simple fullscreen countdown view.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this lab
          timer combines a lap-based stopwatch for reaction timing and trials
          with a repeatable step countdown you can run fullscreen, with optional
          sound cues, final beeps, and keyboard shortcuts for quick control.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/lab-timer")}
        </span>
      </div>
    </section>
  );
}

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
   - Scenario-based with concrete examples for /chaos-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/chaos-timer",
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
    name: "How to use the Chaos Timer (random interval timer and random countdowns)",
    description:
      "Run unpredictable countdowns inside a seconds range. Choose a single random timer or a random interval session, set min/max seconds and (optionally) an interval count, enable sound beeps if you want audible cues, and use fullscreen for a clean, readable display with tap-to-start.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick a mode",
        text: "Choose Random timer (single) for one random countdown, or Random interval timer to run multiple random intervals back-to-back.",
      },
      {
        "@type": "HowToStep",
        name: "Set your random range",
        text: "Set Min seconds and Max seconds. Each countdown duration is randomly selected as a whole number of seconds between Min and Max (inclusive). If Min is greater than Max, the tool swaps them automatically.",
      },
      {
        "@type": "HowToStep",
        name: "Set interval count (interval mode)",
        text: "If you use Random interval timer, set Intervals to the number of random countdowns you want to run in sequence.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset",
        text: "Press Space (or click Start) to begin and pause. Press R (or click Reset) to re-roll from your current settings.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound and fullscreen when needed",
        text: "Turn on Sound for beeps. Use Beep each interval for interval-end beeps and Final beeps for last-5-seconds warning beeps. Press F for fullscreen, Esc to exit, and tap/click the display in fullscreen to start or pause.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ilt-keycap px-2 py-1 font-mono text-[11px] font-semibold text-[var(--ilt-text-primary)]">
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
      className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
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
    <div className="ilt-surface-card p-5">
      <div className="text-base font-semibold text-[var(--ilt-text-primary)]">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">{subtitle}</div>
      ) : null}
      <div className="mt-3 ilt-surface-muted p-4">
        <div className="font-mono text-xs whitespace-pre-wrap text-[var(--ilt-text-secondary)]">
          {lines.join("\n")}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              Chaos Timer is a random interval timer and a random countdown
              timer. You set a seconds range, and the page rolls a new duration
              inside that range. You can run one random countdown (single mode)
              or run a sequence of random intervals (interval mode) with a clear
              progress indicator. The goal is simple: you get unpredictability
              without losing control of the bounds.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is not a workout plan, lesson, or program. It is a
              timing tool for situations where “exactly the same time every
              round” is the wrong behavior. If you want fixed, repeatable
              intervals and rounds, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/hiit-timer")}
              >
                HIIT Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/tabata-timer")}
              >
                Tabata Timer
              </a>
              . If you only need a plain countdown with no randomness, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/fullscreen-timer")}
              >
                Fullscreen Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Random range
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Single countdown
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Random intervals
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Next preview
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sound beeps
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
              Fast start (what most people want)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Random interval timer
                </span>{" "}
                if you want multiple random rounds, or{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Random timer
                </span>{" "}
                if you want just one.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Min seconds
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Max seconds
                </span>
                . Each round rolls a whole number of seconds inside that range.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> If you
                are in interval mode, set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Intervals</span>{" "}
                to the number of rounds you want.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold">Start</span>. Press{" "}
                <Kbd>Space</Kbd> again to pause and resume.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> If you
                want audio cues, turn{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> on
                (or press <Kbd>S</Kbd>). Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Beep each interval
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>{" "}
                based on how you want the session to feel.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">6)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen and <Kbd>Esc</Kbd> to exit. In
                fullscreen, tap/click the timer display to start or pause.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Next preview” and “Progress” mean
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                In interval mode, the tool shows your{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">progress</span>{" "}
                as “current interval / total intervals”, so you can see how far
                you are without guessing.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  next preview
                </span>{" "}
                is the next rolled duration, shown early. You still do not know
                the full sequence, but you do get a small heads up for the next
                transition. If you want maximum surprise, ignore the preview and
                use the beeps. If you are leading a group, the preview helps you
                cue the next change without stopping the timer.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              What the range feels like (real numbers)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold">8–12 seconds</span>: fast
                transitions. You will notice the randomness immediately because
                a 9-second round and a 12-second round feel very different.
              </li>
              <li>
                <span className="font-semibold">10–45 seconds</span>: a common
                “chaos” range. Rounds can feel short or long, but still stay
                inside one practical window.
              </li>
              <li>
                <span className="font-semibold">20–60 seconds</span>: slower
                pacing with obvious differences. Useful when people are across
                the room and need time to react to the cue.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Practical tip:
              </span>{" "}
              If you are hearing end-of-round beeps but people are still
              switching late, widen the range and consider enabling{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
              so the last 5 seconds are obvious.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you will see while the timer runs
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            The large countdown shows the time remaining in the current rolled
            duration. In interval mode, the session panel shows your range (for
            example, “10s–45s”), your progress (for example, “3/10”), and the
            current interval’s rolled length (for example, “This interval:
            32s”). You also get a “Next preview” value (for example, “Next
            preview: 14s”). That preview is not a schedule. It is only the next
            roll.
          </p>

          <p className="mt-3 text-[var(--ilt-text-secondary)] leading-relaxed">
            Pause freezes the countdown where it is. Resume continues from the
            exact remaining time. Reset re-rolls from your current settings and
            returns you to a ready state. If you switch mode or adjust your
            range while not running, the timer primes a fresh roll so the
            displayed values match the new settings.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios (with concrete timings you can copy)
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These scenarios are written around what people actually want from a
            random interval timer: unpredictability, clean cues, and a setup
            that does not require constant attention.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Training drill with unpredictable switches"
              subtitle="Random interval session with audible transitions"
              lines={[
                "Mode: Random interval timer",
                "Range: 10–45 seconds",
                "Intervals: 12",
                "Sound: On",
                "Beep each interval: On",
                "Final beeps: Off",
                "Fullscreen: Optional",
                "",
                "What you experience:",
                "- Interval 1 might roll 18s, interval 2 might roll 41s.",
                "- You get one clear beep at each interval end.",
                "- Progress shows 1/12, 2/12, ... so you know what's left.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Classroom prompts with a clear warning"
              subtitle="Last-5-seconds beeps so people wrap up before the switch"
              lines={[
                "Mode: Random interval timer",
                "Range: 20–60 seconds",
                "Intervals: 8",
                "Sound: On",
                "Beep each interval: On",
                "Final beeps: On",
                "",
                "What you experience:",
                "- Each round ends with a beep.",
                "- In the last 5 seconds of a round, you hear 5 quick warning beeps.",
                "- This makes transitions smoother when people are not watching the screen.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: One-off randomness for a single countdown"
              subtitle="Roll once, run once, stop"
              lines={[
                "Mode: Random timer (single)",
                "Range: 25–90 seconds",
                "Sound: Optional",
                "Final beeps: On (optional)",
                "",
                "Example outcome:",
                "- You press Start and it rolls one duration, for example 67s.",
                "- It counts down to 0 and stops.",
                "- If you want another random countdown, press Start again.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Leading a group with the next preview"
              subtitle="Use the preview to cue the next switch without a fixed plan"
              lines={[
                "Mode: Random interval timer",
                "Range: 12–35 seconds",
                "Intervals: 10",
                "Sound: On",
                "Beep each interval: On",
                "",
                "What you experience:",
                "- While interval 4 is running, you might see Next preview: 15s.",
                "- You can cue 'next round is short' without knowing the full session.",
                "- You still get the unpredictability of the full sequence.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (run it with minimal clicks)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The fastest workflow is: set your range, set interval count if
              needed, press Space, and let the timer run. Fullscreen is for
              readability. In fullscreen, you can tap/click the display to start
              or pause, which is useful on mobile or when you are stepping back
              from the keyboard.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>R</Kbd> reset
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>S</Kbd> sound
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>

            <div className="mt-4 ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Focus tip:</span>{" "}
              If shortcuts do not respond, click the timer card once so it has
              keyboard focus. Shortcuts will not fire while your cursor is in a
              number input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same goal, different behavior)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Use Chaos Timer when you want unpredictability inside a range.
                Use structured interval tools when you need repeatable rounds,
                and use simple timers when you just need time on the screen.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
            <PillLink href={abs("/tabata-timer")}>Tabata Timer</PillLink>
            <PillLink href={abs("/round-timer")}>Round Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (random roll, timing, sound, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                How durations are rolled and what can affect timing in browsers
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Random roll</div>
              <p className="mt-1 leading-relaxed">
                Each duration is rolled as a whole number of seconds between Min
                and Max, inclusive. If Min is greater than Max, the values are
                swapped so the range always makes sense.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Next preview</div>
              <p className="mt-1 leading-relaxed">
                In interval mode, the tool rolls the next duration early so it
                can show a preview while the current interval runs. This does
                not change the randomness of the roll, it just exposes the next
                value sooner.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Timer model</div>
              <p className="mt-1 leading-relaxed">
                Each countdown targets a timestamp and computes remaining time
                as{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">end - now</span>.
                The UI updates with requestAnimationFrame for smooth display,
                while the time math uses a high-resolution clock.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Sound beeps</div>
              <p className="mt-1 leading-relaxed">
                Beeps use the Web Audio API. Some browsers require a user
                interaction (tap/click/keypress) before audio can play. If Sound
                is off, beeps are not played.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle updates in background tabs or low-power
                states. When you return, the timer typically catches up to the
                correct remaining time, but on-screen updates can look less
                smooth while throttled.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                The fullscreen UI adds top and bottom control bars. Exit with
                Esc or the Exit button. In fullscreen, tapping/clicking the
                display toggles start/pause for quick control.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want fixed intervals instead of randomness?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/hiit-timer")}
            >
              HIIT Timer
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/tabata-timer")}
            >
              Tabata Timer
            </a>{" "}
            for repeatable work/rest structure.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need more than one timer?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            when you want parallel timers instead of a single random sequence.
          </div>
        </div>
      </div>
    </section>
  );
}

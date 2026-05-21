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
   - Scenario-based with concrete examples for /classroom-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/classroom-timer",
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
    name: "How to use the Classroom Timer (fullscreen countdown for smartboards and projectors)",
    description:
      "Run a large, readable classroom countdown with quick presets, custom minutes, an optional label, optional sound cues (final beeps and end chime), quick time adjustments, fullscreen mode, and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a duration",
        text: "Pick a preset (like 5 minutes or 10 minutes) or enter a custom Minutes value (1–180).",
      },
      {
        "@type": "HowToStep",
        name: "Add an optional label",
        text: "Set a short label like “Cleanup”, “Quiz”, or “Stations” so students know what the countdown is for at a glance.",
      },
      {
        "@type": "HowToStep",
        name: "Start and pause",
        text: "Press Space or click Start to begin. Press Space again or click Pause to pause and resume from the exact remaining time.",
      },
      {
        "@type": "HowToStep",
        name: "Adjust time if needed",
        text: "Use -1 min, +1 min, and +5 min (or + / - on the keyboard) to change the current countdown without restarting.",
      },
      {
        "@type": "HowToStep",
        name: "Use sound cues and fullscreen",
        text: "Enable Sound, then optionally enable Final beeps and End chime. Toggle fullscreen with F and exit with Esc for a clean, front-of-room display.",
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
              Classroom Timer is a front-of-room countdown designed to be read
              from a distance. It is built for smartboards, projectors, and any
              classroom display where you need a large timer that starts fast,
              stays simple, and does not require constant clicking. You can pick
              a preset (like 2 minutes or 10 minutes), or enter a custom minutes
              value, then run it fullscreen with quick controls.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is a timer tool. It is not a lesson plan, classroom
              program, or productivity system. If you want a timer shaped for a
              specific context, use the closest page for that job. For example,
              an assessment-focused layout is better handled by{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/exam-timer")}
              >
                Exam Timer
              </a>
              , and a speaking or slide-driven flow is better handled by{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/presentation-timer")}
              >
                Presentation Timer
              </a>
              . If you only want a minimal big countdown with fewer settings,
              use{" "}
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
              Big display
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Presets
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Custom minutes
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Label
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Quick adjust
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
              Fast start (what most teachers actually do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Pick a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">preset</span>{" "}
                (like 2m, 5m, 10m) or type a custom{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Minutes</span>{" "}
                value.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span>{" "}
                Optional: set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Label</span> to
                something students recognize (example: “Do Now”, “Cleanup”,
                “Quiz”).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold">Start</span>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                need to change time during the countdown, use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">-1 min</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">+1 min</span>,{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">+5 min</span> (or
                press <Kbd>+</Kbd>/<Kbd>-</Kbd>).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span>{" "}
                Optional: enable{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> and
                choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">End chime</span>{" "}
                based on your room.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">6)</span> Press{" "}
                <Kbd>F</Kbd> for fullscreen, <Kbd>Esc</Kbd> to exit. Fullscreen
                is the “projector mode” for visibility.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Final beeps” and “End chime” change
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>{" "}
                is on, the timer plays short beeps in the last 5 seconds. This
                is for “wrap it up” moments where you want students to feel the
                ending without repeating yourself.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">End chime</span>{" "}
                is on, the timer plays a clearer signal at zero. If Sound is
                off, the timer stays silent.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              What durations feel like (real classroom numbers)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold">1–2 minutes</span>: quick resets
                (cleanup, supplies, line-up). A 2-minute countdown is long
                enough for movement but short enough to keep urgency.
              </li>
              <li>
                <span className="font-semibold">5 minutes</span>: warm-up or
                quick practice. It is short, so students can see progress
                without losing pace.
              </li>
              <li>
                <span className="font-semibold">10–15 minutes</span>: stations
                or group work segments. Often paired with a label like “Station
                A” or “Partner Work”.
              </li>
              <li>
                <span className="font-semibold">30–45 minutes</span>:
                independent work blocks. Most teachers keep sound off here and
                rely on the visual countdown.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Practical tip:
              </span>{" "}
              If you are using sound cues, start the timer once before you need
              it. Some browsers will not play audio until a click or keypress
              happens on the page.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you will see while the timer runs
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            The center of the page is the countdown, built to stay stable and
            readable as numbers change. Above the time you will see your label
            (if you set one), and a simple status line: Ready, Running, or Time
            is up. This is intentional. In a classroom, the display should not
            look like a control panel.
          </p>

          <p className="mt-3 text-[var(--ilt-text-secondary)] leading-relaxed">
            When the timer is running, you can still make small changes without
            derailing the room. Use Quick adjust to add 1 minute, subtract 1
            minute, or add 5 minutes. Those controls do not restart the timer.
            They update the current countdown. That is useful for real teaching
            moments, like extending a writing prompt by 60 seconds because half
            the class is mid-sentence, or shaving 1 minute because you are
            behind schedule.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios (with copyable settings and outcomes)
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These are practical setups based on what people actually do with a
            classroom timer. The goal is not to tell you how to teach. The goal
            is to show how the page behaves with realistic numbers so you can
            set it once and move on.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: 2-minute cleanup transition (front-of-room)"
              subtitle="Short timer, audible finish, no extra steps"
              lines={[
                "Minutes: 2",
                "Label: Cleanup",
                "Sound: On",
                "Final beeps: On",
                "End chime: On",
                "Fullscreen: On (projector/smartboard)",
                "",
                "What students experience:",
                "- A large 2:00 countdown they can see from anywhere.",
                "- 5 short warning beeps at 0:05, 0:04, 0:03, 0:02, 0:01.",
                "- A clear chime at 0:00 to stop and reset attention.",
                "",
                "If you need a small extension:",
                "- Tap +1 min once and it becomes 3:00 without restarting.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: 12-minute quiz segment (quiet room, clear end)"
              subtitle="Minimal distractions, optional final warning"
              lines={[
                "Minutes: 12",
                "Label: Quiz",
                "Sound: Optional (depends on your room)",
                "Final beeps: On (if you want a wrap-up cue)",
                "End chime: On (if Sound is enabled)",
                "Fullscreen: Optional",
                "",
                "What you experience:",
                "- Students see time remaining at a glance (12:00 down to 0:00).",
                "- If Final beeps is on, the last 5 seconds are obvious.",
                "- Press R to reset instantly for the next section.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: 25-minute independent work block (silent)"
              subtitle="Big display only, no audio"
              lines={[
                "Minutes: 25",
                "Label: Independent Work",
                "Sound: Off",
                "Fullscreen: On (clean display)",
                "",
                "What you experience:",
                "- No beeps, no chime, just a visible countdown.",
                "- Use +5 min if you decide to extend to 30 minutes.",
                "- Press Space to pause if you need to stop the room briefly.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: 7-minute station rotations (repeatable blocks)"
              subtitle="Same duration repeated, fast reset between groups"
              lines={[
                "Minutes: 7",
                "Label: Stations",
                "Sound: On",
                "Final beeps: On",
                "End chime: On",
                "",
                "How it runs in practice:",
                "- Start the 7-minute block for Station 1.",
                "- At 0:00 you hear the end cue, then you press R.",
                "- Start again for Station 2 with the same settings.",
                "",
                "If a group needs a tiny extension:",
                "- Press + once to add 1 minute (7:00 becomes 8:00 mid-run).",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (run it with minimal clicks)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The fastest workflow is: set time, optionally set a label, press
              Space. Fullscreen is for visibility on a projector or smartboard.
              Shortcuts help when you do not want to move the mouse in front of
              the class.
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
                <Kbd>+</Kbd> add 1 min
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>-</Kbd> subtract 1 min
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>

            <div className="mt-4 ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Focus tip:</span>{" "}
              If shortcuts do not respond, click the timer card once so it has
              keyboard focus. Shortcuts will not fire while your cursor is in a
              text or number input.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same goal, different fit)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Classroom Timer is for general front-of-room countdowns with
                quick adjustments. If your needs are more specific, these pages
                are a better match.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>+</Kbd>{" "}
              <Kbd>-</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/exam-timer")}>Exam Timer</PillLink>
            <PillLink href={abs("/presentation-timer")}>
              Presentation Timer
            </PillLink>
            <PillLink href={abs("/visual-timer")}>Visual Timer</PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
            <PillLink href={abs("/study-timer")}>Study Timer</PillLink>
            <PillLink href={abs("/break-timer")}>Break Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (timing, sound, fullscreen, focus)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                What can affect a browser timer in real classrooms
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                End-time based countdown
              </div>
              <p className="mt-1 leading-relaxed">
                The timer targets a specific end moment and computes remaining
                time from that target. This avoids drifting when the browser
                redraw speed varies.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Sound restrictions in browsers
              </div>
              <p className="mt-1 leading-relaxed">
                Sound uses the Web Audio API. Some browsers require a user
                gesture before audio plays. If Sound is enabled but you hear
                nothing, click Start once or press Space once to allow audio.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Exit with Esc. Some school devices restrict fullscreen, so if
                fullscreen fails, the timer still works normally in windowed
                mode.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Keyboard focus and inputs
              </div>
              <p className="mt-1 leading-relaxed">
                Shortcuts are intentionally ignored while typing in an input. If
                shortcuts are not working, click the timer card once to give it
                focus, then use Space/R/F/+/-.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling and sleep
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle timers in background tabs or when a device
                goes into a low-power state. When the tab resumes, the timer
                typically catches up to the correct remaining time. For the most
                reliable classroom use, keep the timer tab visible and prevent
                the device from sleeping during long sessions.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a more visual countdown?
            </strong>{" "}
            If you need a “time disappearing” visual cue (often helpful for
            younger students), use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/visual-timer")}
            >
              Visual Timer
            </a>
            .
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need multiple timers at once?
            </strong>{" "}
            If you want parallel timers (example: small-group stations running
            different lengths), use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

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
   - Scenario-based with concrete examples for /breathing-timer.
   - Tool-focused, not a blog post.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/breathing-timer",
  baseUrl = "https://www.ilovetimers.com",
}: {
  canonicalUrl?: string;
  baseUrl?: string;
}) {
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;


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

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              Breathing Timer is a guided phase timer. You set a pattern
              (inhale, optional hold, exhale, optional second hold) and the page
              walks you through it with a large phase countdown. It is built for
              the moment you do not want to do mental math or count rounds. You
              pick the timing once, press start, and the timer handles the
              pacing.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is not trying to teach breathing techniques. It is a
              clean tool for running timed cycles. If you want a simple session
              countdown with no phase prompts, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/meditation-timer")}
              >
                Meditation Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/silent-timer")}
              >
                Silent Timer
              </a>
              . If you want a general purpose countdown, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/countdown-timer")}
              >
                Countdown Timer
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/online-timer")}
              >
                Online Timer
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Presets
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Custom phases
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Cycles
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
              Fast start (what most people want)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose
                a preset or Custom. Holds set to{" "}
                <span className="font-semibold">0</span> are skipped.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Cycles</span> to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0</span> to keep
                going until you pause, or set a number to stop automatically.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <Kbd>Space</Kbd> or click{" "}
                <span className="font-semibold">Start</span> to begin. Press{" "}
                <Kbd>Space</Kbd> again to pause/resume.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                want phase prompts, turn{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> on (
                <Kbd>S</Kbd>).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> For a
                clean display, press <Kbd>F</Kbd> for fullscreen. Press{" "}
                <Kbd>Esc</Kbd> to exit. In fullscreen, you can tap/click the
                timer to start or pause.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Presets”, “Cycles”, and “Sound” actually mean
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Presets</span>{" "}
                set the inhale/hold/exhale timing for you. You can still adjust
                values after selecting a preset by choosing Custom.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Cycles</span>{" "}
                controls how many full patterns run. A cycle is counted when the
                timer wraps back to{" "}
                <span className="font-semibold">Inhale</span>. Set Cycles to 0
                to run continuously.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span>{" "}
                plays gentle cues when phases change so you can follow without
                watching the screen. If Sound is off, the timer stays silent.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              What the presets feel like (real numbers)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold">Box 4-4-4-4</span>: one cycle is{" "}
                <span className="font-semibold">16 seconds</span> (4 inhale + 4
                hold + 4 exhale + 4 hold). With Cycles = 0, it repeats until you
                pause.
              </li>
              <li>
                <span className="font-semibold">4-7-8</span>: one cycle is{" "}
                <span className="font-semibold">19 seconds</span> (4 inhale + 7
                hold + 8 exhale). This preset is set to{" "}
                <span className="font-semibold">4 cycles</span> by default, so
                it runs for about{" "}
                <span className="font-semibold">76 seconds</span> plus the final
                phase transition.
              </li>
              <li>
                <span className="font-semibold">Calm 4-2-6</span>: one cycle is{" "}
                <span className="font-semibold">12 seconds</span> (4 inhale + 2
                hold + 6 exhale). It is continuous by default.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Practical tip:
              </span>{" "}
              If you want the tool to stop automatically, set Cycles to a
              number. If you want it to run until you decide you are done, set
              Cycles to 0.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you will see while the timer runs
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            The large label shows the current phase (Inhale, Hold, Exhale) and
            the big number shows seconds remaining in that phase. When the phase
            ends, the next phase starts immediately and the label updates. If
            your pattern skips holds (because a hold is set to 0), the timer
            simply rotates through the remaining phases.
          </p>

          <p className="mt-3 text-[var(--ilt-text-secondary)] leading-relaxed">
            If you pause, the timer freezes the remaining seconds for the
            current phase. When you resume, it continues from that exact point.
            If you reset, it returns to the ready state at the beginning of the
            inhale phase with cycle count reset.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios (with concrete timings)
          </h3>

          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These scenarios match how people actually use a guided breathing
            timer: quick structure, minimal interaction, and clear endpoints
            when needed.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Box breathing on a second screen"
              subtitle="Steady 4-4-4-4 rhythm you can follow from across the room"
              lines={[
                "Preset: Box 4-4-4-4",
                "Cycle length: 16 seconds",
                "Cycles: 0 (continuous)",
                "Sound: Optional (on if you want phase prompts)",
                "Fullscreen: F",
                "",
                "What you experience:",
                "- Inhale counts down 4...",
                "- Hold counts down 4...",
                "- Exhale counts down 4...",
                "- Hold counts down 4...",
                "Then it repeats immediately until you pause.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: A fixed 4-7-8 routine that ends"
              subtitle="No manual counting, it stops at Done"
              lines={[
                "Preset: 4-7-8",
                "One cycle: 19 seconds (4 + 7 + 8)",
                "Cycles: 4 (default)",
                "Sound: On (recommended if eyes closed)",
                "",
                "What you experience:",
                "- You run ~76 seconds of guided phases.",
                "- After the last exhale finishes, the timer shows Done and stops.",
                "- Press Space to restart if you want another set.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Custom pattern with no holds"
              subtitle="Just inhale and exhale, nothing else"
              lines={[
                "Preset: Custom",
                "Inhale: 5 sec",
                "Hold 1: 0 sec (skipped)",
                "Exhale: 7 sec",
                "Hold 2: 0 sec (skipped)",
                "Cycles: 12",
                "",
                "What you experience:",
                "- Each cycle is 12 seconds (5 + 7).",
                "- 12 cycles runs for about 144 seconds.",
                "- The timer stops automatically after the 12th cycle.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Pause mid-phase without losing your place"
              subtitle="You got interrupted and want to resume correctly"
              lines={[
                "You start Calm 4-2-6 (continuous).",
                "During Exhale, you pause with ~3 seconds left.",
                "",
                "Action:",
                "- Press Space to pause.",
                "- Press Space again to resume at the same point in Exhale.",
                "",
                "If you want to restart the whole cycle:",
                "- Press R (or click Reset) to return to Inhale and reset cycles.",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (use it like an instrument panel)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The fastest workflow is: pick a preset, set cycles (0 for
              continuous), press Space, and let the display guide you.
              Fullscreen is there for readability, especially if you are not
              sitting directly in front of the screen. In fullscreen you can
              tap/click the timer to start or pause, which is useful on mobile
              or when you do not want to aim at buttons.
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
                Use Breathing Timer when you want guided inhale/hold/exhale
                phases. Use a simple session timer when you only need minutes.
                Use multiple timers when you want more than one pattern running
                at once.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>F</Kbd> <Kbd>S</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/meditation-timer")}>
              Meditation Timer
            </PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
            <PillLink href={abs("/stretch-timer")}>Stretch Timer</PillLink>
            <PillLink href={abs("/focus-session-timer")}>
              Focus Session Timer
            </PillLink>
            <PillLink href={abs("/rest-timer")}>Rest Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/multiple-timers")}>Multiple Timers</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (phase timing, sound cues, fullscreen)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                How timing is computed and what can affect it in browsers
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Timer model</div>
              <p className="mt-1 leading-relaxed">
                Each phase sets a target end timestamp and computes remaining
                time as{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">end - now</span>.
                The UI updates with requestAnimationFrame so the display stays
                smooth.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Pattern rules</div>
              <p className="mt-1 leading-relaxed">
                The pattern always includes inhale and exhale. Holds are
                optional. Any hold set to 0 seconds is removed from the pattern,
                so the timer rotates only through phases that have time.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Sound cues</div>
              <p className="mt-1 leading-relaxed">
                Sound cues use the Web Audio API to play short tones at phase
                changes. Some browsers require a user gesture
                (click/tap/keypress) before audio can play. If Sound is off,
                cues are not played.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API on the timer card.
                Controls are placed in top and bottom bars, and you can exit
                with Esc or the Exit button.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers may throttle animations and timers in background tabs
                or low-power states. When you return, the timer typically
                catches up to the correct phase remaining time, but on-screen
                updates can look less smooth while throttled.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want a plain session timer?
            </strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/meditation-timer")}
            >
              Meditation Timer
            </a>{" "}
            for a simple countdown without phases.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need multiple patterns?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            when you need more than one timer running at once.
          </div>
        </div>
      </div>
    </section>
  );
}

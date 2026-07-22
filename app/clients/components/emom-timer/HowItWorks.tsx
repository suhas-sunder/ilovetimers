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
   - EMOM intent: rounds (total minutes), optional prep countdown,
     sound cues (minute marks + finish), optional final beeps,
     fullscreen with tap-to-start/pause/resume, keyboard shortcuts.
   - Tool-focused, not a workout blog post.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/emom-timer",
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
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
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

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">EMOM Timer</span>{" "}
              is designed for one thing: keeping a clean “start every minute”
              rhythm without extra setup. You set{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                total rounds (minutes)
              </span>
              , optionally add a short{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                prep countdown
              </span>
              , then press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span>. The
              display shows a big countdown to the next minute mark. When a new
              minute starts, it moves to the next round automatically until all
              rounds complete.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This page is not trying to teach training theory or prescribe
              workouts. It’s a practical timer UI built around real EMOM use:
              you are moving, breathing hard, and you want the time readable at
              a glance. Fullscreen makes the countdown easy to see from across a
              room, and in fullscreen you can tap or click the time to start,
              pause, or resume.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Important behavior to understand: this timer runs in your browser
              while the page is open. Some devices reduce update frequency in
              background tabs or when the screen is locked to save power. If you
              need alerts after the browser is closed, use a device alarm.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Rounds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Prep
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sound
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Final beeps
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
              Fast use (what most people do)
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Rounds</span>{" "}
                (minutes). Example: 12 rounds means a 12 minute EMOM.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Choose{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Prep</span>{" "}
                (optional). Example: 10 seconds to get set.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Decide
                whether you want{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>
                . Final beeps only matter if sound is on.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or{" "}
                <Kbd>Space</Kbd>). Prep runs first if enabled, then Round 1
                begins.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> If you
                want a bigger display, press <Kbd>F</Kbd> to go fullscreen. In
                fullscreen, tap/click the time to start, pause, or resume.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">6)</span> When
                the final minute completes, the timer stops and plays a finish
                signal (if enabled). Press <Kbd>R</Kbd> to reset and run the
                same block again.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the big time display actually means
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                During EMOM, the display shows the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  remaining time in the current minute
                </span>
                . At the start of a minute you will see about{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">1:00</span>, then
                it counts down to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">0:00</span>, and
                immediately rolls into the next minute. You do not have to do
                any math to find minute boundaries. The timer handles that.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              A quick checklist for a smooth run
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If sound matters, interact once (click/tap/press a key) so the
                browser allows audio playback.
              </li>
              <li>
                Keep the tab open while you train. Background tabs can update
                less often on some devices.
              </li>
              <li>
                Rounds and prep are locked while the timer is active. Pause or
                reset first, then adjust settings.
              </li>
              <li>
                If shortcuts do nothing, click the timer card once to focus it.
                Shortcuts do not fire while typing in a form field.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Shortcut set:
              </span>{" "}
              <Kbd>Space</Kbd> start/pause, <Kbd>R</Kbd> reset, <Kbd>F</Kbd>{" "}
              fullscreen, <Kbd>S</Kbd> sound, <Kbd>B</Kbd> final beeps,{" "}
              <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you can control on this EMOM Timer
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The goal is simple control, not a menu of settings. You choose how
            long the EMOM runs (rounds), whether you want a short prep lead-in,
            and what cues you want at key moments.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Rounds</span> are the
            total number of minutes. If you set 10 rounds, you are committing to
            10 minute boundaries. The timer will take you through Minute 1, then
            Minute 2, and so on until Minute 10 completes. Many people use a
            fixed number here so they can repeat the same structure across
            sessions without rethinking it.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Prep</span> is a
            short countdown before the EMOM starts. It is meant for practical
            setup: you want time to pick up a kettlebell, step onto a bike,
            chalk up, or just breathe before the first minute begins. When prep
            hits zero, the timer transitions into EMOM automatically and marks
            the start of Round 1.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> gives
            you an audible “minute boundary” cue and a finish signal. If you
            train with a shared screen, sound can keep the group synchronized.
            If you are in a quiet gym or using headphones, turning sound off
            keeps it purely visual.{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Final beeps</span>{" "}
            are the optional “heads-up” beeps in the last 5 seconds of each
            minute. They are useful when you want a consistent reminder to wrap
            up reps and be ready to restart on the minute.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you’ll see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These examples are about the timer’s behavior and what you will see
            on the display. They are written so you can predict the flow before
            you rely on it in a workout or class.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: 12 minute EMOM with a short prep"
              subtitle="A common setup for conditioning or technique work"
              lines={[
                "Setup:",
                "- Rounds: 12",
                "- Prep: 10s",
                "- Sound: On",
                "- Final beeps: On",
                "",
                "What you see:",
                "- Press Start → Prep counts down 0:10 ... 0:05 ... 0:01",
                "- Prep hits 0:00 → EMOM begins (Round 1 / 12)",
                "- Minute timer shows about 1:00 then 0:59, 0:58 ...",
                "",
                "What you hear (example moments):",
                "- At the start of each new minute → a short minute mark beep",
                "- In the last 5 seconds of each minute → 0:05 to 0:01 short beeps",
                "",
                "Finish:",
                "- After Minute 12 completes → the timer stops and plays the finish signal",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Silent EMOM on a shared gym floor"
              subtitle="You want visual-only pacing with a big readable display"
              lines={[
                "Setup:",
                "- Rounds: 10",
                "- Prep: 0s",
                "- Sound: Off",
                "",
                "What happens:",
                "- Press Start → EMOM begins immediately",
                "- Display counts down each minute to 0:00, then rolls into the next minute",
                "- No audio cues, no final beeps",
                "",
                "Best practice:",
                "- Use fullscreen so you can see minute boundaries from farther away",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Fullscreen “coach mode” with tap control"
              subtitle="One screen runs the room, quick control without hunting buttons"
              lines={[
                "Setup:",
                "- Rounds: 20",
                "- Prep: 15s",
                "- Enter fullscreen (press F)",
                "",
                "In fullscreen:",
                "- Tap/click the big time to start, pause, or resume",
                "- Top bar includes Start/Pause/Resume, Reset, Sound, Final",
                "",
                "Example:",
                "- You pause at 0:22 remaining in Minute 7",
                "- Resume continues from 0:22 and the next minute still starts cleanly",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Using final beeps as a wrap-up cue"
              subtitle="A concrete example of what final beeps mean"
              lines={[
                "Setup:",
                "- Rounds: 8",
                "- Sound: On",
                "- Final beeps: On",
                "",
                "Near the end of a minute you will hear:",
                "- At 0:05 → beep",
                "- At 0:04 → beep",
                "- At 0:03 → beep",
                "- At 0:02 → beep",
                "- At 0:01 → beep",
                "",
                "Then the minute flips:",
                "- New minute starts and the timer continues to the next round",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Repeat the same EMOM block quickly"
              subtitle="You want the same structure again without re-entering settings"
              lines={[
                "Setup:",
                "- Rounds: 15",
                "- Prep: 10s",
                "",
                "First run:",
                "- You complete all 15 minutes",
                "",
                "Second run:",
                "- Press Reset (or R) → returns to Ready with 15 rounds and 10s prep",
                "- Press Start → prep runs, then Minute 1 begins again",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: When this is not the right timer"
              subtitle="Pick the tool that matches your structure"
              lines={[
                "If you need work/rest intervals (example: 40s work, 20s rest):",
                "- Use HIIT Timer",
                "",
                "If you want 20s on / 10s off repeated:",
                "- Use Tabata Timer",
                "",
                "If you want as many rounds as possible in a fixed time:",
                "- Use AMRAP Timer",
                "",
                "If you want a simple one-off countdown:",
                "- Use Countdown Timer",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you want the quickest control mid-workout, rely on shortcuts.
              Press <Kbd>Space</Kbd> to start/pause, <Kbd>R</Kbd> to reset,{" "}
              <Kbd>F</Kbd> to toggle fullscreen, <Kbd>S</Kbd> to toggle sound,
              and <Kbd>B</Kbd> to toggle final beeps (only when sound is on). If
              shortcuts do nothing, click the timer card once so it has focus.
              Shortcuts are ignored while typing in inputs to avoid accidental
              triggers.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Space</Kbd> start/pause
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>R</Kbd> reset
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>S</Kbd> sound
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>B</Kbd> final beeps
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>F</Kbd> fullscreen
              </span>
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>Esc</Kbd> exit
              </span>
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (same ecosystem, different structure)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If your workout format is not “start every minute,” use the
                closest match below.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>S</Kbd> <Kbd>B</Kbd>{" "}
              <Kbd>F</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/amrap-timer")}>AMRAP Timer</PillLink>
            <PillLink href={abs("/hiit-timer")}>HIIT Timer</PillLink>
            <PillLink href={abs("/tabata-timer")}>Tabata Timer</PillLink>
            <PillLink href={abs("/round-timer")}>Round Timer</PillLink>
            <PillLink href={abs("/workout-timer")}>Workout Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/online-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (timing, sound, fullscreen, browser limits)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Notes that matter if you rely on precise minute cues
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Timing model</div>
              <p className="mt-1 leading-relaxed">
                Timing is computed from high-resolution elapsed time so minute
                boundaries remain consistent even if the UI skips a frame. The
                display updates frequently while running to stay readable.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers often throttle background tabs and animation frames to
                save resources. This can reduce how often the display updates in
                the background, and timing can appear to drift slightly until
                the tab is active again.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Sound behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses a short WebAudio beep. Many browsers block audio
                until a user gesture occurs, so if you turn sound on and hear
                nothing, click/tap the page once and try again.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen permissions
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser Fullscreen API and updates state on
                fullscreen changes. Most browsers require a user gesture
                (click/tap) to enter fullscreen, and <Kbd>Esc</Kbd> exits.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need intervals?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/hiit-timer")}
            >
              HIIT Timer
            </a>{" "}
            for work/rest timing that is not locked to minute marks.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need multiple clocks?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            if you want an EMOM plus an extra countdown running side-by-side.
          </div>
        </div>
      </div>
    </section>
  );
}

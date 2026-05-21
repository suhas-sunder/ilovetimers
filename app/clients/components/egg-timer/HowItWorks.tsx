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
   - Egg Timer intent: quick presets (soft/jammy/medium/hard/very hard),
     custom time, optional sound, optional final countdown beeps, fullscreen,
     keyboard shortcuts, tap-to-start in fullscreen.
   - Tool-focused, not a blog post about eggs.
   - Scenario-based with concrete example numbers users will experience here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/egg-timer",
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
    name: "How to use the Egg Timer (soft, jammy, medium, hard)",
    description:
      "Use the Egg Timer to run a clean, readable countdown with one-tap presets (soft, jammy, medium, hard, very hard) or a custom time. Toggle sound and optional final countdown beeps, and use fullscreen for a big display with tap-to-start/pause.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a preset or set a custom time",
        text: "Pick Soft, Jammy, Medium, Hard, or Very hard to set the timer instantly, or enter your own minutes and seconds for a custom countdown.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, and reset the countdown",
        text: "Press Start to begin. Press Pause to stop while keeping remaining time. Press Reset to return to the selected preset/custom time.",
      },
      {
        "@type": "HowToStep",
        name: "Optional sound and final countdown beeps",
        text: "Turn Sound on/off. Enable Final beeps to hear short beeps during the last few seconds before the timer ends.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a big kitchen display",
        text: "Click Fullscreen (or press F) for a clean, readable display. In fullscreen, tap/click the time to start or pause. Press Esc to exit.",
      },
      {
        "@type": "HowToStep",
        name: "Use keyboard shortcuts for quick control",
        text: "Space start/pause, R reset, F fullscreen, S sound toggle, Esc exit fullscreen. If shortcuts do nothing, click the timer card once to focus it.",
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
        <div className="whitespace-pre-wrap font-mono text-xs text-[var(--ilt-text-secondary)]">
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

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Egg Timer</span> is
              built for one job: a clear countdown you can trust at a glance
              while you cook. Pick a preset like{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Soft</span> or{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Jammy</span>, or
              enter a custom time, then press{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span>. The
              display stays big and readable, and when the timer reaches zero it
              stops automatically and (optionally) plays a finish signal.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This is not a guide about boiling techniques or debating doneness.
              It’s a practical timer UI for real cooking situations: hands are
              messy, you’re moving around, and you often want a screen that you
              can read from across the room. That’s why fullscreen mode,
              tap-to-start in fullscreen, and a simple shortcut set are built
              in.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              One key behavior to know: this timer runs in your browser while
              the page is open. Most of the time it’s very accurate, but some
              devices can slow down updates in background tabs or when the
              screen is locked to save power. If you need a timer that must fire
              even with the browser closed, use your device’s clock app.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Presets
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Custom time
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Tap a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Preset</span>{" "}
                (Soft, Jammy, Medium, Hard) or set{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Minutes + Seconds
                </span>
                .
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Decide
                whether you want{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Sound</span> and{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Final beeps
                </span>
                . (Final beeps are only relevant if Sound is on.)
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Start</span> (or{" "}
                <Kbd>Space</Kbd>). The countdown runs until it reaches zero.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                want a bigger display, press <Kbd>F</Kbd> to go fullscreen. In
                fullscreen, tap/click the time to start or pause.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> When it
                finishes, you hear the finish signal (if enabled). Press{" "}
                <Kbd>R</Kbd> to reset to the same time for another batch.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Why presets reset the timer
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Presets are meant to be a quick, deliberate choice. When you tap
                a preset (or change Minutes/Seconds), the timer resets to that
                new duration so you don’t accidentally mix a new selection with
                leftover time from a previous run. If you want to keep the
                remaining time, pause instead of changing inputs.
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
                If you walk away, keep the tab open. Background tabs can update
                less often on some devices.
              </li>
              <li>
                Presets and time inputs are disabled while running. Pause or
                reset first, then change the time.
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
              fullscreen, <Kbd>S</Kbd> sound, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you can control on this Egg Timer
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            This page focuses on the controls that actually matter while you’re
            timing eggs. You set the duration (preset or custom), choose whether
            sound should play at the end, optionally turn on a short final
            countdown beep, and decide if you want fullscreen. Everything else
            stays intentionally simple: the timer starts when you start it, it
            pauses when you pause it, and it finishes cleanly when it hits zero.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The biggest practical win is readability. In normal mode, you get a
            clean timer card with controls and presets. In fullscreen, the timer
            becomes the center of the screen, with a minimal top bar and bottom
            bar. That’s useful if you’re cooking with your phone propped up, a
            tablet on the counter, or a laptop a few feet away. Fullscreen also
            makes quick control easier: tap/click the time itself to start or
            pause.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you’ll see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These examples focus on what you’ll literally experience on the
            screen: which preset you pick, what the countdown looks like, when
            the final beeps happen, and what Reset does for repeated batches.
            They’re not trying to teach cooking techniques. They’re here so you
            can predict the tool’s behavior before you rely on it.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: One batch, one preset, no fuss"
              subtitle="You want a quick preset and a clear end signal"
              lines={[
                "Setup:",
                "- Preset: Jammy (7:00)",
                "- Sound: On",
                "- Final beeps: On",
                "",
                "What you see:",
                "- Press Start → display shows 7:00 then 6:59, 6:58 ...",
                "- At 0:05 → 0:04 → 0:03 → 0:02 → 0:01 you hear short beeps",
                "- At 0:00 the timer stops and plays the finish signal",
                "",
                "If you’re doing a second batch:",
                "- Press R (or Reset) → the display returns to 7:00",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Custom time for a specific routine"
              subtitle="You want minutes and seconds, not a preset"
              lines={[
                "Setup:",
                "- Minutes: 9",
                "- Seconds: 30",
                "- Sound: Off",
                "",
                "What happens:",
                "- Press Start → countdown runs from 9:30",
                "- No beeps (sound is off), the display still hits 0:00 and stops",
                "",
                "Repeat the same timing:",
                "- Press Reset → returns to 9:30",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Fullscreen on a kitchen counter"
              subtitle="You want to read it from a distance and tap to control"
              lines={[
                "Setup:",
                "- Preset: Hard (10:00)",
                "- Enter fullscreen (press F)",
                "",
                "In fullscreen:",
                "- The timer fills most of the screen",
                "- Tap/click the big time to start or pause",
                "- Top bar shows Start/Pause and Reset",
                "",
                "Useful behavior:",
                "- If you tap Pause, the remaining time stays (example: 6:42)",
                "- Tap Start again to continue from 6:42",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Why controls lock while running"
              subtitle="Preventing accidental time changes mid-countdown"
              lines={[
                "Example:",
                "- You start Medium (8:00)",
                "- While running, presets and time inputs are disabled",
                "",
                "What this prevents:",
                "- Accidentally switching to Hard (10:00) mid-run",
                "- Typing a wrong number and ruining the timing",
                "",
                "If you need to change time:",
                "- Pause (Space) or let it finish",
                "- Then choose a new preset or edit minutes/seconds",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Final beeps as a heads-up"
              subtitle="A concrete example of what ‘final beeps’ means"
              lines={[
                "Setup:",
                "- Preset: Soft (6:00)",
                "- Sound: On",
                "- Final beeps: On",
                "",
                "What you experience near the end:",
                "- At 0:05 → beep",
                "- At 0:04 → beep",
                "- At 0:03 → beep",
                "- At 0:02 → beep",
                "- At 0:01 → beep",
                "- At 0:00 → finish signal plays and the timer stops",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Two different kitchen tasks"
              subtitle="When you should use a different tool"
              lines={[
                "Example:",
                "- Eggs: Hard (10:00)",
                "- Tea steep: 4:00",
                "",
                "Best match depends on your intent:",
                "- Use Egg Timer for the egg countdown",
                "- Use Tea Timer for tea timing",
                "- Use Multiple Timers if you want both running together",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fullscreen and shortcuts (fast control, low friction)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you want the quickest control while cooking, use shortcuts.
              Press <Kbd>Space</Kbd> to start/pause, <Kbd>R</Kbd> to reset to
              your selected time, <Kbd>F</Kbd> to toggle fullscreen, and{" "}
              <Kbd>S</Kbd> to toggle sound. If shortcuts do nothing, click the
              timer card once so it has focus. Shortcuts are ignored while
              typing in inputs to avoid accidental triggers.
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
                Related tools (same ecosystem, different intent)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you’re timing something other than eggs, or you need multiple
                timers at once, these are better matches.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>R</Kbd> <Kbd>S</Kbd> <Kbd>F</Kbd>{" "}
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/cooking-timer")}>Cooking Timer</PillLink>
            <PillLink href={abs("/tea-timer")}>Tea Timer</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/silent-timer")}>Silent Timer</PillLink>
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
                Technical details (timing, sound, fullscreen, browser limits)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Notes that matter if you rely on precise timing or audible cues
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
                The countdown is computed from an “end time” and a
                high-resolution clock value. The UI updates frequently while the
                timer is running so the display feels responsive. When the timer
                hits zero, it stops and triggers the finish signal (if sound is
                enabled).
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Background throttling
              </div>
              <p className="mt-1 leading-relaxed">
                Browsers often throttle background tabs and animation frames to
                save resources. That means the display can update less often
                when the tab is not active, the device is locked, or the system
                is in power-saving mode.
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
            <strong className="text-[var(--ilt-text-primary)]">Timing tea too?</strong> Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/tea-timer")}
            >
              Tea Timer
            </a>{" "}
            for a dedicated steep timer.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Need two timers at once?</strong>{" "}
            Use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/multiple-timers")}
            >
              Multiple Timers
            </a>{" "}
            to run eggs plus another kitchen countdown side-by-side.
          </div>
        </div>
      </div>
    </section>
  );
}

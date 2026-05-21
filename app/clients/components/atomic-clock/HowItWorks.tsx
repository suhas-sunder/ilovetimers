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
   - Scenario-based with concrete numbers.
   - Written to be unique to /atomic-clock (milliseconds + freeze + fullscreen).
   - Practical and tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/atomic-clock",
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
    name: "How to use the online atomic-style clock (device time with milliseconds, freeze, fullscreen)",
    description:
      "Use this atomic-style online clock to view your current device time with optional milliseconds, freeze and resume the display, and go fullscreen for a large readable clock on any screen.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose your display mode",
        text: "Turn milliseconds on for fine-grained readings, or turn them off for a steadier seconds-only display.",
      },
      {
        "@type": "HowToStep",
        name: "Freeze and resume when needed",
        text: "Freeze holds the current displayed value for reference. Resume returns to live updates. Use Space as a shortcut.",
      },
      {
        "@type": "HowToStep",
        name: "Use fullscreen for a big clock",
        text: "Enter fullscreen for a clean wall display. Fullscreen requires a user gesture. Press F to toggle and Esc to exit.",
      },
      {
        "@type": "HowToStep",
        name: "Troubleshoot smoothness and accuracy",
        text: "If milliseconds look jumpy, keep the tab visible and disable low-power throttling. If the time looks off, your device clock is likely not synced.",
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

  return (
    <section className="space-y-4">
      <JsonLd data={howToLd} />

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is an <strong>atomic-style clock display</strong> built
              for people who need a clean, readable time readout that is easy to
              use on a big screen. You can show <strong>HH:MM:SS</strong> for a
              stable wall clock, or enable <strong>milliseconds</strong> for
              detailed on-screen checks like syncing a start cue, capturing a
              timestamp, or verifying that two devices agree closely.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              There are three core controls:
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                {" "}
                Milliseconds
              </span>{" "}
              (show or hide the .mmm part),
              <span className="font-semibold text-[var(--ilt-text-primary)]"> Freeze</span>{" "}
              (hold the current displayed value), and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]"> Fullscreen</span>{" "}
              (a distraction-free display for distance viewing). You can use the
              buttons, or use shortcuts once the clock display is focused:{" "}
              <Kbd>Space</Kbd> freeze/resume, <Kbd>M</Kbd> toggle milliseconds,
              and <Kbd>F</Kbd> fullscreen.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              One important truth up front: this clock shows{" "}
              <strong>your device time</strong>. If your laptop or phone clock
              is wrong, the display will be wrong. This page is perfect for
              readability and workflow, but it does not “fix” system time. If
              you suspect drift, compare against{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/utc-clock")}
              >
                UTC Clock
              </a>{" "}
              and then correct time sync in your operating system settings.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              In everyday language, "atomic clock" usually points to official
              high-precision time references maintained by national metrology
              organizations. Official references such as NIST and time.gov
              exist for that purpose. This page is different: it is an
              atomic-style browser display with milliseconds, not a guaranteed
              official metrology instrument or external time-sync service.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Milliseconds
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Freeze
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
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              The “get value fast” flow
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Decide
                whether you need milliseconds. If you only need a wall clock,
                turn them off for a steadier display.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Use{" "}
                <strong>Fullscreen</strong> for distance viewing. Fullscreen is
                best on a second monitor, classroom display, or during screen
                sharing.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Use{" "}
                <strong>Freeze</strong> to hold a time value for reference, then
                resume when you are done.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use
                shortcuts after focusing the clock display: <Kbd>Space</Kbd>,{" "}
                <Kbd>M</Kbd>, <Kbd>F</Kbd>.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What this page is optimized for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This tool is optimized for a readable time display and quick
                “what time is it exactly right now” checks. If your goal is
                timing an activity, you will usually get a better workflow from{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/stopwatch")}
                >
                  Stopwatch
                </a>{" "}
                (elapsed time) or{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/countdown-timer")}
                >
                  Countdown Timer
                </a>{" "}
                (time remaining).
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Quick expectations (so nothing surprises you)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                The display uses your{" "}
                <span className="font-semibold">device</span> clock. It does not
                fetch network time.
              </li>
              <li>
                Fullscreen requires a click or keypress (browser policy). Press{" "}
                <Kbd>Esc</Kbd> to exit.
              </li>
              <li>
                Background tabs can throttle animation, so milliseconds may look
                less smooth when you return.
              </li>
              <li>
                Freeze only pauses the on-screen value. It does not affect your
                system clock.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If you
              want a clean wall clock for a room, turn milliseconds off and go
              fullscreen. It reads better at distance and looks calmer on
              camera.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools (when you need a different workflow)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Stay here for a big device-time display. Use these when the job
                is different.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>Space</Kbd> <Kbd>M</Kbd> <Kbd>F</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/digital-clock")}>Digital Clock</PillLink>
            <PillLink href={abs("/current-local-time")}>
              Current Local Time
            </PillLink>
            <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
            <PillLink href={abs("/world-clock")}>World Clock</PillLink>
            <PillLink href={abs("/time-zone-converter")}>
              Time Zone Converter
            </PillLink>
            <PillLink href={abs("/stopwatch")}>Stopwatch</PillLink>
            <PillLink href={abs("/countdown-timer")}>Countdown Timer</PillLink>
            <PillLink href={abs("/milliseconds-converter")}>
              Milliseconds Converter
            </PillLink>
            <PillLink href={abs("/epoch-unix-time-clock")}>
              Epoch Unix Time Clock
            </PillLink>
            <PillLink href={abs("/time-calculator")}>Time Calculator</PillLink>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with example readings
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            These examples show what the page feels like in real use. The exact
            numbers depend on when you look, but the interaction pattern stays
            the same: pick milliseconds based on your needs, optionally freeze
            for reference, and use fullscreen when readability matters.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Recording a tutorial, “call out the exact start time”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use milliseconds and fullscreen for a clean shot
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Fullscreen
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are screen recording and want a crisp timestamp visible.
                Turn <strong>Milliseconds</strong> on, click{" "}
                <strong>Fullscreen</strong>, then keep this on your second
                monitor (or share the tab). A typical readout looks like{" "}
                <strong>09:41:26.372</strong>.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you need to “lock” the time you said out loud, press{" "}
                <Kbd>Space</Kbd> to freeze. For example, you freeze at{" "}
                <strong>09:41:26.998</strong> so the audience can clearly see
                the value. Then press <Kbd>Space</Kbd> again to resume live
                updates.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Coordinating a room start, “go on the next whole second”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use milliseconds to pick a clean start boundary
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Milliseconds
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You want everyone to start together without guesswork. Leave
                milliseconds on and call out: “Start at the next full second.”
                If the display is <strong>14:03:10.845</strong>, you can say:
                “Start at <strong>14:03:11</strong>.” In practice people see the
                millisecond roll-over and hit the start cue cleanly.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you are timing an activity after that, switch to{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/stopwatch")}
                >
                  Stopwatch
                </a>{" "}
                rather than trying to do duration math in your head.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    “Why does the time look off by 6 seconds?”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Diagnose drift, then fix it in OS settings
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Accuracy
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                A common situation: your phone and laptop disagree. You open
                this page on your laptop and see <strong>18:22:07.120</strong>,
                but your phone shows <strong>18:22:13</strong>. That is a real
                signal that one device is drifting or not syncing time.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/utc-clock")}
                >
                  UTC Clock
                </a>{" "}
                as a quick reference view, then correct the device clock in
                system settings. This page will immediately reflect the updated
                system time once your OS is synced.
              </p>
            </div>

            {/* Scenario 4 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    “Milliseconds are distracting on camera”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Turn milliseconds off for a calmer display
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Readability
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you are projecting a clock in a classroom or meeting room,
                milliseconds can pull attention. Turn them off and the display
                becomes a steady <strong>HH:MM:SS</strong> readout, like{" "}
                <strong>10:17:42</strong>. Fullscreen plus seconds-only is
                usually the cleanest “wall clock” configuration.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                If you need multiple cities visible, switch to{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/world-clock")}
                >
                  World Clock
                </a>{" "}
                instead of keeping multiple tabs open.
              </p>
            </div>
          </div>

          {/* Practical reliability note */}
          <div className="mt-6 ilt-surface-muted p-6">
            <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
              Reliability tips you will actually notice
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you are watching milliseconds, you may notice that the display
              looks smooth while the tab is active, then looks “jumpy” after you
              switch away and come back. That is normal browser behavior. Modern
              browsers reduce animation frequency in background tabs, and some
              devices reduce it further in low-power modes. The clock stays
              correct, but the visual update cadence changes. For the smoothest
              appearance, keep the tab visible or use seconds-only mode.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If you need to convert a millisecond reading into seconds or
              minutes, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/milliseconds-converter")}
              >
                Milliseconds Converter
              </a>{" "}
              (for example, 12,500 ms equals 12.5 seconds). For adding and
              subtracting times, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/time-calculator")}
              >
                Time Calculator
              </a>
              .
            </p>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 ilt-surface-muted p-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Privacy and what this page stores
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                No account, no location required
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This atomic clock does not need your location and does not
                require sign-in. It runs locally in your browser and simply
                displays the current time from your device.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Preferences may persist on your device
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Depending on how you integrated the page, it may remember simple
                preferences (like whether milliseconds were on) using browser
                storage so the page feels consistent on your next visit.
              </p>
            </div>
          </div>

          {/* Technical / implementation notes should be expandable */}
          <details className="group mt-4 ilt-surface-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Technical notes (time source, update strategy, fullscreen)
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                  Read this if you care about how milliseconds and seconds-only
                  updates behave
                </div>
              </div>
              <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                ▼
              </span>
            </summary>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">Time source</div>
                <p className="mt-1 leading-relaxed">
                  The displayed value comes from the browser’s <code>Date</code>{" "}
                  object, which reflects your device clock. This page does not
                  fetch network time and does not perform NTP synchronization.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Milliseconds enabled
                </div>
                <p className="mt-1 leading-relaxed">
                  With milliseconds on, the display updates using{" "}
                  <code>requestAnimationFrame</code> and reads time each frame.
                  Smoothness depends on browser scheduling and device load.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Milliseconds disabled
                </div>
                <p className="mt-1 leading-relaxed">
                  With milliseconds off, the page aligns to the next second
                  boundary, then updates once per second. This reduces visual
                  jitter and tends to look better on big displays.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Fullscreen behavior
                </div>
                <p className="mt-1 leading-relaxed">
                  Fullscreen uses the Fullscreen API. Browsers require a user
                  gesture to enter fullscreen. The page listens for fullscreen
                  state changes to adjust spacing and show the fullscreen
                  controls.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              If you need multi-city viewing:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/world-clock")}
            >
              World Clock
            </a>{" "}
            for multiple locations on one screen.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              If you need timers and durations:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/stopwatch")}
            >
              Stopwatch
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/countdown-timer")}
            >
              Countdown Timer
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

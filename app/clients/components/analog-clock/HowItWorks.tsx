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
   - Written to be unique to /analog-clock (not generic clock copy).
   - Clear limitations without turning into a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/analog-clock",
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

  return (
    <section className="space-y-4">

      <div className="ilt-surface-card p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>
            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is a purpose-built <strong>online analog clock</strong>{" "}
              for situations where you want a clean clock face that stays
              readable at a glance. It is designed for wall-display use,
              especially when you put it into <strong>fullscreen</strong>. You
              can toggle the <strong>seconds hand</strong> for a calmer display,
              and you can switch <strong>Smooth</strong> on when you want the
              seconds hand to move like a traditional wall clock.
            </p>
            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              The goal is simple: you open the page, choose the look you want,
              and it keeps showing your device’s local time without asking you
              to configure anything. If you want big digits instead of a clock
              face, the{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/digital-clock")}
              >
                Digital Clock
              </a>{" "}
              is the better match. If you need multiple cities at once, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/world-clock")}
              >
                World Clock
              </a>
              . If you need a reference-aligned time source to compare against
              your device clock, compare it with a plain local-time view such as{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/current-local-time")}
              >
                Current Local Time
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Seconds hand toggle
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Smooth motion
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Keyboard
            </span>
          </div>
        </div>

        {/* What you do here */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              The clock flow in 15 seconds
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose
                a display style: keep or hide the <strong>seconds hand</strong>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> If you
                want a fluid seconds hand, enable <strong>Smooth</strong>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Press{" "}
                <strong>Fullscreen</strong> (or <Kbd>F</Kbd>) for wall-display
                use.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use
                shortcuts after focusing the card: <Kbd>S</Kbd> seconds hand,{" "}
                <Kbd>M</Kbd> smooth, <Kbd>F</Kbd> fullscreen.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Smooth” is for (and when to turn it off)
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Smooth mode updates more frequently to make the seconds hand
                glide instead of stepping once per second. That looks great on a
                wall display, but it can also use more CPU. If you are casting,
                screen recording, or using an older laptop, it is normal to
                prefer Smooth off. The time remains correct either way. Smooth
                only changes how the seconds hand moves.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              What this page is (and isn’t)
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">Is:</span> a
                clean analog clock for local time with fullscreen support.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">Is:</span> a
                quick way to show time across a room without clutter.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">Is not:</span> a
                countdown or alarm tool. Use a timer when you need an end time.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">Is not:</span> a
                reference time source if your device clock is wrong.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Rule:</span> if you
              need alerts or timing while you are away from the screen, use a{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/alarm-timer")}
              >
                Timer or Alarm
              </a>{" "}
              tool, not a clock display.
            </div>
          </div>
        </div>

        {/* Quick matching links */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related time tools (only when they match the job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you want a clock face on a wall display, stay here. If you
                want time conversion, reference time, or a different display,
                use one of these.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>F</Kbd> fullscreen • <Kbd>S</Kbd> seconds hand •{" "}
              <Kbd>M</Kbd> smooth
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/digital-clock")}>Digital Clock</PillLink>
            <PillLink href={abs("/minimalist-clock")}>
              Minimalist Clock
            </PillLink>
            <PillLink href={abs("/current-local-time")}>
              Current Local Time
            </PillLink>
            <PillLink href={abs("/world-clock")}>World Clock</PillLink>
            <PillLink href={abs("/fullscreen-timer")}>
              Fullscreen Timer
            </PillLink>
            <PillLink href={abs("/time-zone-converter")}>
              Time Zone Converter
            </PillLink>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios (with numbers you will actually see)
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            An analog clock is useful when people need time context without
            fiddling with UI. The scenarios below are written for how this page
            actually works: fullscreen, seconds hand, smooth motion, and the
            timezone label pulled from your device. Use these as templates and
            copy the setup that matches your situation.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Classroom wall clock on a projector (seconds hand off)
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use case: reduce distraction, keep time visible
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Fullscreen
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are projecting a laptop screen and you want students to see
                the time without the ticking seconds drawing attention. Turn off{" "}
                <strong>Seconds hand</strong>, leave <strong>Smooth</strong>{" "}
                off, then enter fullscreen. Now the clock face updates once per
                second internally, but without the moving seconds hand it reads
                as calm and steady.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                A practical check: at <strong>9:05</strong> the minute hand is a
                little past the 1, and at <strong>9:10</strong> it is on the 2.
                Students can glance up and understand “we have about 10 minutes”
                without you announcing it. If you want a more explicit readout,
                switch to{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/digital-clock")}
                >
                  Digital Clock
                </a>{" "}
                for big digits.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Setup tip: click the clock once, then use <Kbd>F</Kbd> to toggle
                fullscreen quickly during class.
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Meeting room pacing (seconds hand on, smooth off)
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use case: keep discussion moving without a timer
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Seconds on
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You have a 30-minute meeting and you want people to stay aware
                of time without a countdown. Enable the seconds hand and leave
                Smooth off. That gives a crisp “tick” feel. At a glance, you can
                say, “Let’s wrap by <strong>10:30</strong>,” and everyone has a
                shared reference point.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Real behavior you will see: if someone starts talking at{" "}
                <strong>10:17:20</strong> and you want to cap it at 2 minutes,
                you can watch the seconds hand pass the 12 twice and stop them
                around <strong>10:19:20</strong> without pulling out a separate
                timer. If you do need a hard cutoff, that is when a real
                countdown like{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/meeting-timer")}
                >
                  Meeting Timer
                </a>{" "}
                is the right tool.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                Shortcut: <Kbd>S</Kbd> toggles the seconds hand instantly if it
                feels too busy.
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Studio or lab work (smooth on for a wall-clock feel)
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use case: visible seconds while you work hands-free
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Smooth
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are doing short repeated tasks and you want a continuous
                seconds sweep you can glance at from a distance. Turn on{" "}
                <strong>Seconds hand</strong> and enable <strong>Smooth</strong>
                , then go fullscreen. Now you can start a step at{" "}
                <strong>14:03</strong> and end it around{" "}
                <strong>14:03:45</strong> by watching the seconds hand reach the
                9 marker.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Concrete example: you are timing a 90-second rest between sets.
                You finish at <strong>14:12:10</strong>. When the seconds hand
                reaches the 12 and the minute hand is halfway between 2 and 3,
                you are around <strong>14:13:40</strong>. If you need elapsed
                timing and splits, use a{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/stopwatch")}
                >
                  Stopwatch
                </a>
                . This clock is for “good enough at a glance” time context.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                If Smooth stutters during screen sharing or casting, toggle it
                off with <Kbd>M</Kbd>.
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="ilt-surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Remote team coordination (local time, UTC, and conversion)
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use case: stop time zone mistakes before they happen
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Time zones
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are on a call and someone says “Let’s meet at 3.” That is
                ambiguous across time zones. This page helps you confirm your
                own local time and timezone label quickly, but for cross-zone
                scheduling you should switch to the right tool.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Example with real numbers: it is <strong>09:30</strong> local
                for you, and a teammate uses UTC as their standard. Open{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/utc-clock")}
                >
                  UTC Clock
                </a>{" "}
                to see the current UTC time, then use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/time-zone-converter")}
                >
                  Time Zone Converter
                </a>{" "}
                to translate a proposed time. If you want multiple cities always
                visible, use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/world-clock")}
                >
                  World Clock
                </a>
                .
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
                <PillLink href={abs("/time-zone-converter")}>
                  Time Zone Converter
                </PillLink>
                <PillLink href={abs("/world-clock")}>World Clock</PillLink>
              </div>
            </div>
          </div>

          <div className="mt-6 ilt-surface-muted p-6">
            <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
              Accuracy and “why does it look different on my device?”
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              This clock displays the time your device reports. If your system
              clock is off by <strong>2 minutes</strong>, the display will be
              off by <strong>2 minutes</strong>. If your timezone is set
              incorrectly, the time can be off by hours. That is not a bug in
              the clock face. It is your device settings. A fast sanity check is
              to compare this page against{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/atomic-clock")}
              >
                Atomic Clock
              </a>{" "}
              or{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/utc-clock")}
              >
                UTC Clock
              </a>
              .
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Smooth mode also changes what you perceive. With Smooth on, the
              seconds hand moves continuously and can reveal performance issues
              (casting lag, low-power throttling, heavy CPU load). With Smooth
              off, the seconds hand steps once per second and looks stable even
              when the device is busy. If the seconds hand feels choppy, turn
              Smooth off or hide the seconds hand entirely.
            </p>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 ilt-surface-muted p-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Reliability and privacy (quick and practical)
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Keep the display smooth
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>Keep the tab visible when you care about smooth motion.</li>
                <li>
                  Disable Smooth when screen sharing, casting, or recording.
                </li>
                <li>Hide the seconds hand for the calmest display.</li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Use the right tool for the job
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Need a countdown? Use{" "}
                  <a
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                    href={abs("/countdown-timer")}
                  >
                    Countdown Timer
                  </a>
                  .
                </li>
                <li>
                  Need a wake-up style alarm? Use{" "}
                  <a
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                    href={abs("/alarm-timer")}
                  >
                    Alarm Timer
                  </a>
                  .
                </li>
                <li>
                  Need elapsed time? Use{" "}
                  <a
                    className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                    href={abs("/stopwatch")}
                  >
                    Stopwatch
                  </a>
                  .
                </li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Keyboard basics
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Click the clock card once to focus it, then use <Kbd>F</Kbd> for
                fullscreen, <Kbd>S</Kbd> to toggle the seconds hand, and{" "}
                <Kbd>M</Kbd> to toggle Smooth.
              </p>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Privacy
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The clock runs locally in your browser tab. No account is
                required, and you do not need to enter personal information to
                use the display.
              </p>
            </div>
          </div>

          {/* Technical / implementation notes should be expandable */}
          <details className="group mt-4 ilt-surface-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Technical notes (fullscreen rules, smooth mode, and
                  throttling)
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                  Read this if fullscreen fails or Smooth looks choppy
                </div>
              </div>
              <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                ▼
              </span>
            </summary>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Fullscreen gesture requirement
                </div>
                <p className="mt-1 leading-relaxed">
                  Browsers typically require fullscreen to be triggered by a
                  user gesture. If a keyboard press does nothing, click the
                  clock area once, then try Fullscreen again.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Smooth mode update frequency
                </div>
                <p className="mt-1 leading-relaxed">
                  Smooth seconds uses frequent updates to animate the hand. When
                  the tab is backgrounded or the device is in low-power mode,
                  browsers may reduce how often animations update. That can make
                  the hand appear to stutter even though the underlying time is
                  still correct.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">If you want big digits:</strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/digital-clock")}
            >
              Digital Clock
            </a>{" "}
            for the clearest across-the-room read.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              If you want reference time:
            </strong>{" "}
            compare with{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/atomic-clock")}
            >
              Atomic Clock
            </a>{" "}
            or{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/utc-clock")}
            >
              UTC Clock
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

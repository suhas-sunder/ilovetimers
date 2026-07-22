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
   - Moon Phase Clock intent: live phase + illumination + age + big countdown to next major phase,
     fullscreen display, sound + optional final beeps, manual date/time lookup
   - Tool-focused, not a tutorial article
   - Scenario-based with concrete examples and numbers users will see here
   - Technical details live in an expandable section
   - Aim: ~800–1200 words of unique, intent-matching content
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/moon-phase-clock",
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
    <div className="space-y-4">
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

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Moon Phase Clock
              </span>{" "}
              is a fast, clean way to answer a few practical questions without
              digging through menus or calendars:{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                What phase is the moon right now
              </span>
              ,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                how bright is it
              </span>
              ,{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                how many days into the lunar cycle are we
              </span>
              , and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                when does the next major phase happen
              </span>{" "}
              in your local time.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The main display is intentionally dominant. It shows a big
              countdown to the next major phase, plus a compact set of facts
              underneath: phase name, illumination percentage, and moon age in
              days. The top line tells you what is coming next, for example{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Next: Full Moon · 8:14 PM
              </span>
              . When the event is close, the card can highlight that urgency so
              you do not miss it while the page is open.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              Two modes keep the tool simple.{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span> mode
              updates continuously and is meant for “what is happening now” and
              “how long until the next major phase.”{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Manual</span> mode
              lets you pick a date and time to check the phase details for that
              moment. Editing Date, Hour, or Minute switches you to Manual
              automatically, and{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Now</span> returns
              you to Live.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Live phase
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Illumination
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Age (days)
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Next major phase
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sound
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Manual lookup
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Leave{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span> on to
                track the countdown and see today’s phase details update.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Read
                the <span className="font-semibold text-[var(--ilt-text-primary)]">Next</span>{" "}
                line for the upcoming major phase and the estimated local time.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Go{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Fullscreen</span>{" "}
                if you want a room-readable display.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> If you
                are checking another moment, edit Date, Hour, or Minute and the
                page switches to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Manual</span>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Use{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Now</span> to
                return to Live instantly.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the page is calculating for you
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The tool tracks where you are in the lunar cycle and derives a
                readable phase label from that position. From the same cycle
                position it estimates illumination (shown as a percent) and moon
                age (days since the last New Moon). It also finds the next
                boundary among the four major phases and displays an estimated
                local timestamp plus a countdown.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Practical checklist
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you only care about today, keep{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span> on.
              </li>
              <li>
                If you are checking a past or future moment, edit date/time and
                stay in{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">Manual</span>.
              </li>
              <li>
                If you need a display across the room, go fullscreen first.
              </li>
              <li>
                If you want an audio heads-up near the event, enable Sound and
                optionally Final beeps.
              </li>
              <li>
                If you are planning across places, convert time zones with{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-zone-converter"
                >
                  Time Zone Converter
                </Link>
                .
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Quick keys:</span>{" "}
              <Kbd>F</Kbd> fullscreen, <Kbd>Esc</Kbd> exit.
            </div>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Related:</span>{" "}
              compare with{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/sunrise-sunset-clock"
              >
                Sunrise Sunset Clock
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/astronomical-clock"
              >
                Astronomical Clock
              </Link>
              .
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What each value means on this page
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The display is built around the four major phases because they are
            the most useful anchors for planning and quick checks. Those phases
            are <span className="font-semibold text-[var(--ilt-text-primary)]">New Moon</span>,{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">First Quarter</span>,{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Full Moon</span>, and{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">Last Quarter</span>.
            The tool also shows the in-between labels (waxing and waning
            crescents and gibbous phases) so you get a descriptive name for the
            current moment, not only the major checkpoints.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Illumination</span>{" "}
            is shown as a percentage so you can quickly interpret “how bright”
            without mental math. The number is most intuitive around common
            points in the cycle. Near New Moon you will often see single digits
            like <span className="font-semibold text-[var(--ilt-text-primary)]">2%</span> to{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">8%</span>. Near First
            Quarter it trends around{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">50%</span>. Near Full
            Moon it climbs toward{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">95%+</span>. The tool
            is meant to be readable and consistent, so it favors a stable,
            smooth estimate rather than a noisy presentation.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            <span className="font-semibold text-[var(--ilt-text-primary)]">Moon age</span> is
            the estimated days since the last New Moon. You will see it in a
            format like{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">9.6 days</span>. Age
            is useful because it gives you a simple “where are we” number that
            works well in Manual mode. For example, a manual check might show{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">14.8 days</span>{" "}
            around a Full Moon window, while a check shortly after New Moon
            might show{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">1.2 days</span>.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with concrete examples (what you will see here)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The examples below are designed to look like real “screen moments.”
            They include the kinds of numbers this page shows: phase label,
            illumination percent, age in days, and a countdown to the next major
            phase. Your displayed values will differ based on the date and time, but
            the structure and interpretation stays consistent.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Quick daily check before you head out"
              subtitle="You want an at-a-glance snapshot, not a deep dive."
              lines={[
                "Mode: Live",
                "",
                "Typical screen values:",
                "- Phase: Waxing Crescent",
                "- Illumination: 18%",
                "- Age: 5.3 days",
                "- Next: First Quarter · 6:42 PM",
                "- Countdown: 3:12:09",
                "",
                "How you use it:",
                "- You glance once, you know it is early-cycle and getting brighter.",
                "- If you want the next major phase time, it is already in local time.",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Fullscreen display on a second monitor"
              subtitle="You want a big countdown to the next major phase."
              lines={[
                "Mode: Live + Fullscreen",
                "",
                "Typical screen values:",
                "- Next: Full Moon · 9:18 PM",
                "- Countdown: 14:07:32",
                "- Phase chip: Waxing Gibbous",
                "- Illumination: 84%",
                "- Age: 12.4 days",
                "",
                "How you use it:",
                "- Keep it open while you work.",
                "- If the countdown gets close, the card highlights urgency.",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Manual lookup for a specific date and time"
              subtitle="You are checking a moment you care about, not “right now.”"
              lines={[
                "Mode: Manual",
                "",
                "Inputs:",
                "- Date: 2026-06-15",
                "- Hour: 21",
                "- Minute: 30",
                "",
                "Example output values:",
                "- Phase: Waning Gibbous",
                "- Illumination: 73%",
                "- Age: 17.2 days",
                "- Next: Last Quarter · 3:05 AM",
                "",
                "How you use it:",
                "- You can compare two different dates by changing only the date field.",
                "- Use Now to return to Live when you are done.",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: You want a sound heads-up near the phase change"
              subtitle="Audio depends on the browser keeping the page active."
              lines={[
                "Mode: Live",
                "Sound: On",
                "Final beeps: On",
                "",
                "Near-event behavior you may notice:",
                "- At 00:00:05 left: short beep",
                "- At 00:00:04 left: short beep",
                "- At 00:00:03 left: short beep",
                "- At 00:00:02 left: short beep",
                "- At 00:00:01 left: short beep",
                "",
                "Tip:",
                "- If you hear nothing, click Now once after enabling Sound to unlock audio.",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: Planning across time zones"
              subtitle="The phase time is local. Use conversion when needed."
              lines={[
                "Mode: Live",
                "",
                "Example:",
                "- Next: New Moon · 11:26 AM (your local time)",
                "",
                "If you need to share it with someone elsewhere:",
                "- Convert 11:26 AM in your time zone to their time zone using Time Zone Converter.",
                "",
                "Fast link:",
                "- /time-zone-converter",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: When this page is not the right tool"
              subtitle="Use the closest match to your actual goal."
              lines={[
                "If you need sunrise and sunset times alongside this:",
                "- Use Sunrise Sunset Clock (/sunrise-sunset-clock)",
                "",
                "If you want a broader sky-style time display:",
                "- Use Astronomical Clock (/astronomical-clock)",
                "",
                "If you need a countdown to a custom event:",
                "- Use Event Countdown (/event-countdown)",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Live versus Manual: what to choose
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Choose <span className="font-semibold text-[var(--ilt-text-primary)]">Live</span>{" "}
              when the question is “what is happening now” or “how long until
              the next major phase.” Choose{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">Manual</span> when
              you care about a specific moment, such as checking a date for
              planning or comparing two times in the same day. Manual mode is
              also useful when you want a steady display for notes without it
              shifting under you.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If your goal is timekeeping accuracy rather than lunar phase,
              compare with{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/atomic-clock"
              >
                Atomic Clock
              </Link>{" "}
              or{" "}
              <Link
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                to="/utc-clock"
              >
                UTC Clock
              </Link>
              .
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
                Use the closest match to what you are trying to do.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcut set: <Kbd>F</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/sunrise-sunset-clock">Sunrise Sunset Clock</PillLink>
            <PillLink to="/astronomical-clock">Astronomical Clock</PillLink>
            <PillLink to="/golden-hour-clock">Golden Hour Clock</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/event-countdown">Event Countdown</PillLink>
            <PillLink to="/atomic-clock">Atomic Clock</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (lunar model, timestamps, sound, and limits)
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                Optional notes about behavior and expectations
              </div>
            </div>
            <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Lightweight lunar-cycle estimate
              </div>
              <p className="mt-1 leading-relaxed">
                The page uses a fast synodic-month cycle model anchored to a
                reference New Moon timestamp. It computes the cycle fraction,
                then derives a phase label, an illumination estimate, and moon
                age in days. Major phase times are computed by finding the next
                quarter-step boundary in that cycle.
              </p>
              <p className="mt-2 leading-relaxed">
                This is designed for a smooth clock experience and everyday
                planning. It is not intended to replace specialized ephemeris
                data used for scientific observation.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Local time formatting
              </div>
              <p className="mt-1 leading-relaxed">
                The “Next” and “Previous” timestamps are displayed in your local
                time using your browser’s locale and time zone. If your device
                clock or time zone is misconfigured, displayed times will follow
                your device settings.
              </p>
              <p className="mt-2 leading-relaxed">
                If you are coordinating across places, use{" "}
                <Link
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  to="/time-zone-converter"
                >
                  Time Zone Converter
                </Link>{" "}
                to translate the phase time for someone else.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Sound and browser restrictions
              </div>
              <p className="mt-1 leading-relaxed">
                Sound uses WebAudio. Many browsers require a user gesture before
                audio can play. Turning Sound on and clicking Now once is a
                reliable way to unlock audio for the session.
              </p>
              <p className="mt-2 leading-relaxed">
                Final beeps is a near-event alert in Live mode. If you do not
                want any audio, turn Sound off.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Fullscreen and keyboard focus
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API and may require a
                click or keypress. Keyboard shortcut handling is attached to the
                card, so click the display once if <Kbd>F</Kbd> does nothing.
              </p>
              <p className="mt-2 leading-relaxed">
                <Kbd>Esc</Kbd> exits fullscreen immediately.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Want daylight timing too?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/sunrise-sunset-clock"
            >
              Sunrise Sunset Clock
            </Link>{" "}
            alongside this page.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Need a countdown to your own event?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/event-countdown"
            >
              Event Countdown
            </Link>
            .
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this moon
          phase clock shows today’s moon phase, illumination estimate, and moon
          age, plus a live countdown and local time for the next major phase,
          with fullscreen display, sound options, and manual date and time
          lookups.
        </div>

        {/* Hidden absolute URL usage so abs() is not dead-code when tree-shaken */}
        <span className="sr-only" aria-hidden="true">
          {abs("/moon-phase-clock")}
        </span>
      </div>
    </section>
  );
}

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
   - Golden Hour Clock intent: show golden hour (morning + evening) + sunrise/sunset
     for a chosen date/location, with a live countdown and fullscreen view.
   - Location via GPS or manual lat/lon; two definitions (classic 60 min vs solar-angle 0° to 6°).
   - Tool-focused, not an educational blog.
   - Scenario-based with concrete numbers users will see here.
   - Technical details live in an expandable section.
   - Aim: ~800–1200 words of unique, intent-matching content.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/golden-hour-clock",
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
    name: "How to use the Golden Hour Clock (golden hour, sunrise, sunset + countdown)",
    description:
      "Find golden hour start and end times (morning and evening) for any date and location. Use GPS or enter coordinates, choose a golden hour definition, view sunrise and sunset, and follow a live countdown to the next lighting transition. Includes fullscreen mode and optional sound alerts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Set your location",
        text: "Press Use GPS to fill your latitude and longitude, or type coordinates manually. Latitude must be between -90 and 90, longitude between -180 and 180.",
      },
      {
        "@type": "HowToStep",
        name: "Pick a date",
        text: "Choose the date you care about (today by default). The page calculates sunrise, sunset, and golden hour windows for that date and location.",
      },
      {
        "@type": "HowToStep",
        name: "Choose a definition",
        text: "Select Classic (60 minutes) for a predictable fixed window, or Solar-angle (0° to 6°) for a sun-height-based window that changes with latitude and season.",
      },
      {
        "@type": "HowToStep",
        name: "Use the countdown and fullscreen",
        text: "Watch the live countdown to the next transition (golden hour start/end, sunrise, or sunset). Press F for fullscreen, Esc to exit, and optionally enable sound/final beeps for boundary alerts.",
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
      <JsonLd data={howToLd} />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                Golden Hour Clock
              </span>{" "}
              is built for one job: quickly show you the{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                golden hour start and end times
              </span>{" "}
              for a specific place and day, alongside{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">
                sunrise and sunset
              </span>
              . The page also runs a live countdown to the next transition so
              you can time arrivals, setup, and movement between locations.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              This is not a blog and it is not a generic “photography tips”
              article. It is a practical clock: you choose a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">date</span> and a{" "}
              <span className="font-semibold text-[var(--ilt-text-primary)]">location</span>{" "}
              (GPS or coordinates), decide how you want to define golden hour,
              and the page gives you the times you can act on.
            </p>

            <p className="mt-3 max-w-3xl leading-relaxed text-[var(--ilt-text-secondary)]">
              The display is designed for real use. It keeps the next important
              change large and readable, and fullscreen turns it into a clean
              on-site screen when you are waiting for the light to shift. If you
              want audible nudges, you can enable sound and optional final beeps
              near golden hour boundaries.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Golden hour
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sunrise
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sunset
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Live countdown
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              GPS
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Set
                your{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">location</span>:
                press Use GPS or type latitude/longitude.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Pick
                the <span className="font-semibold text-[var(--ilt-text-primary)]">date</span>{" "}
                you are planning for (Today is a quick reset).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Choose
                a{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">definition</span>
                : Classic (60 minutes) or Solar-angle (0° to 6°).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use the{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">countdown</span>{" "}
                to track the next change (golden hour start/end, sunrise, or
                sunset).
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span>{" "}
                On-site, press <Kbd>F</Kbd> for fullscreen and optionally enable
                sound. Exit with <Kbd>Esc</Kbd>.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What “Next change” means
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                The clock always points at the next upcoming transition for your
                chosen date/location. In the morning that might be{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Morning golden hour starts
                </span>
                . During golden hour it will switch to{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  Morning golden hour ends
                </span>
                . Later it may switch to sunset or the evening golden window.
                You do not need to manually pick an event.
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Checklist for real planning
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                If you are traveling, use GPS when you arrive. Small location
                shifts can change times slightly.
              </li>
              <li>
                Decide whether you want a predictable window (Classic) or a
                sun-angle window (Solar-angle).
              </li>
              <li>
                Times display in your device time zone. Convert afterward if you
                are planning for a different region.
              </li>
              <li>
                For on-site use, fullscreen keeps the countdown readable at a
                glance.
              </li>
              <li>
                If you rely on sound, interact once (tap/click) so your browser
                allows audio playback.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcuts:</span>{" "}
              <Kbd>G</Kbd> GPS, <Kbd>F</Kbd> fullscreen, <Kbd>Esc</Kbd> exit.
            </div>
          </div>
        </div>

        {/* Main explanation */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            What you can do on this page
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            The tool gives you a complete “lighting schedule” for the day you
            choose: sunrise, sunset, and two golden hour windows (morning and
            evening). The windows are shown as{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              start time → end time
            </span>{" "}
            in local time. You also get a live clock (“Now”) and a countdown to
            the next relevant change so you can time decisions in the moment.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            Location is set by coordinates. If you press Use GPS, the page fills
            latitude and longitude to 6 decimal places (for example{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">40.712800</span>,{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">-74.006000</span>).
            If you are planning ahead or know your destination coordinates, you
            can type them manually. Inputs clamp to valid ranges, which avoids
            “almost right but invalid” values when you paste from a map.
          </p>

          <p className="mt-3 leading-relaxed text-[var(--ilt-text-secondary)]">
            The definition selector is there because “golden hour” is used in
            two common ways.{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              Classic (60 minutes)
            </span>{" "}
            is simple and predictable: first 60 minutes after sunrise and last
            60 minutes before sunset.{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              Solar-angle (0° to 6°)
            </span>{" "}
            defines golden hour by sun height above the horizon. That can be
            shorter or longer than 60 minutes, depending on latitude, date, and
            season. If the solar-angle window is invalid for the selected
            conditions, the page falls back to a safe 60-minute estimate and
            shows a note, so you are not left with broken or misleading times.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-[var(--ilt-text-primary)]">
            Scenarios with examples (real numbers you will see)
          </h3>

          <p className="mt-2 leading-relaxed text-[var(--ilt-text-secondary)]">
            These are realistic ways people use this page. The exact times will
            vary by date and location, but the{" "}
            <span className="font-semibold text-[var(--ilt-text-primary)]">
              shape of the output
            </span>{" "}
            is the same: two golden windows, sunrise/sunset, and a countdown to
            the next transition.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ExampleBlock
              title="Scenario 1: Same-day shoot planning (classic 60 minutes)"
              subtitle="You want a predictable window and a clear countdown you can act on."
              lines={[
                "Setup:",
                "- Date: Today",
                "- Location: GPS",
                "- Definition: Classic (60 minutes)",
                "",
                "What you will see (example formatting):",
                "- Morning golden hour: 7:12 AM to 8:12 AM",
                "- Sunrise: 7:12 AM",
                "- Evening golden hour: 5:04 PM to 6:04 PM",
                "- Sunset: 6:04 PM",
                "",
                "In the moment:",
                "- If it is 6:40 AM, Next change: Morning golden hour starts",
                "- Countdown might show: 32:00 (32 minutes left)",
              ]}
            />

            <ExampleBlock
              title="Scenario 2: Scouting a viewpoint (GPS + fullscreen)"
              subtitle="You arrive early and want the next transition visible from a distance."
              lines={[
                "Setup:",
                "- Tap Use GPS at the viewpoint",
                "- Press F for fullscreen",
                "- Optional: Sound ON + Final beeps ON",
                "",
                "What you will see (example):",
                "- Next change: Evening golden hour starts: 4:52 PM",
                "- Countdown: 18:45",
                "",
                "On-site outcome:",
                "- You can keep the countdown visible while setting up",
                "- Final beeps help in the last 5 seconds before start/end",
              ]}
            />

            <ExampleBlock
              title="Scenario 3: Solar-angle definition (variable-length golden hour)"
              subtitle="You want a sun-height-based window that adapts to the season."
              lines={[
                "Setup:",
                "- Date: a winter day",
                "- Location: coordinates you typed",
                "- Definition: Solar-angle (0° to 6°)",
                "",
                "What you might see (example):",
                "- Morning golden hour: 8:03 AM to 8:49 AM (46 minutes)",
                "- Evening golden hour: 3:58 PM to 4:36 PM (38 minutes)",
                "",
                "Why it matters:",
                "- Windows can be shorter than 60 minutes",
                "- The countdown helps you catch the tighter timing",
              ]}
            />

            <ExampleBlock
              title="Scenario 4: Coordinating across time zones (travel or remote plan)"
              subtitle="You are planning for a destination while still at home."
              lines={[
                "Setup:",
                "- You enter destination coordinates",
                "- You choose the date",
                "",
                "Important behavior:",
                "- Times display in your device time zone",
                "- Example: you see Sunset: 6:41 PM (your time)",
                "- Convert that time to the destination time zone if needed",
                "",
                "Helpful tool:",
                "- Use Time Zone Converter after you copy the times",
              ]}
            />

            <ExampleBlock
              title="Scenario 5: High latitude edge case (no sunrise/sunset)"
              subtitle="You check a polar region date and the page warns you."
              lines={[
                "Setup:",
                "- Location: high latitude (near the Arctic/Antarctic Circle)",
                "- Date: mid-summer or mid-winter",
                "",
                "Possible output:",
                "- Note: No sunrise or sunset for this date and location",
                "- Golden windows may show as unavailable (–)",
                "",
                "What to do:",
                "- Try a different date, or adjust the latitude",
              ]}
            />

            <ExampleBlock
              title="Scenario 6: Using the page as a “day plan”"
              subtitle="You want the key times in one view, without extra noise."
              lines={[
                "Typical workflow:",
                "- Morning golden hour start/end for early session",
                "- Sunrise time for general light baseline",
                "- Evening golden hour start/end for final session",
                "- Sunset time as the hard stop for daylight",
                "",
                "On-screen cues:",
                "- A badge shows whether you are currently in golden hour",
                "- Next change keeps your attention on the next deadline",
              ]}
            />
          </div>

          <div className="mt-6 ilt-surface-muted p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Fast control when you are moving
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              The page is designed so you can operate it quickly without digging
              through controls. <Kbd>G</Kbd> requests GPS, <Kbd>F</Kbd> toggles
              fullscreen, and <Kbd>Esc</Kbd> exits fullscreen. In fullscreen,
              the top bar stays minimal and the countdown remains the focal
              point.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="ilt-surface-card px-3 py-2 text-[var(--ilt-text-secondary)]">
                <Kbd>G</Kbd> GPS
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
                Related tools (same site, different job)
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                If you need a close match for what you are doing, use the links
                below.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcuts: <Kbd>G</Kbd> <Kbd>F</Kbd> <Kbd>Esc</Kbd>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink to="/sunrise-sunset-clock">
              Sunrise &amp; Sunset Clock
            </PillLink>
            <PillLink to="/time-zone-converter">Time Zone Converter</PillLink>
            <PillLink to="/current-local-time">Current Local Time</PillLink>
            <PillLink to="/world-clock">World Clock</PillLink>
            <PillLink to="/astronomical-clock">Astronomical Clock</PillLink>
            <PillLink to="/moon-phase-clock">Moon Phase Clock</PillLink>
            <PillLink to="/fullscreen-timer">Fullscreen Timer</PillLink>
          </div>
        </div>

        {/* Technical details expandable */}
        <details className="group mt-6 ilt-surface-muted p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Technical details (methods, time zone, GPS, audio, edge cases)
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
                Calculation approach
              </div>
              <p className="mt-1 leading-relaxed">
                The page computes solar noon, sunrise, and sunset for the chosen
                date/location using common solar position formulas. Golden hour
                is then derived using either a fixed duration (Classic) or a
                target sun altitude range (Solar-angle).
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Device time zone display
              </div>
              <p className="mt-1 leading-relaxed">
                Output times are rendered using your device time zone. This
                keeps the on-site experience consistent (your phone shows local
                times). For planning in a different time zone, convert after
                viewing.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">GPS precision</div>
              <p className="mt-1 leading-relaxed">
                GPS coordinates come from your browser’s geolocation API and can
                vary depending on device and signal. If GPS is blocked or
                inaccurate, manual coordinates are the reliable fallback.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)]">
              <div className="font-semibold text-[var(--ilt-text-primary)]">Audio behavior</div>
              <p className="mt-1 leading-relaxed">
                Sound uses WebAudio. Many browsers require a user gesture before
                audio can play. If you do not hear beeps, toggle sound on and
                interact once (tap/click) before relying on it.
              </p>
            </div>

            <div className="ilt-surface-card p-4 text-sm text-[var(--ilt-text-secondary)] md:col-span-2">
              <div className="font-semibold text-[var(--ilt-text-primary)]">
                Edge cases and fallbacks
              </div>
              <p className="mt-1 leading-relaxed">
                Some high-latitude dates can produce no sunrise or no sunset.
                Solar-angle golden hour can also produce invalid windows in
                unusual conditions. In these cases, the page shows a note and
                may fall back to a safe fixed-duration golden hour so the UI
                stays usable.
              </p>
            </div>
          </div>
        </details>

        {/* Bottom note */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              Only need sunrise/sunset?
            </strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/sunrise-sunset-clock"
            >
              Sunrise &amp; Sunset Clock
            </Link>{" "}
            for a simpler page focused on those times.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">Planning across regions?</strong>{" "}
            Use{" "}
            <Link
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              to="/time-zone-converter"
            >
              Time Zone Converter
            </Link>{" "}
            after you get the times here.
          </div>
        </div>

        {/* Small SEO anchor text without being bloggy */}
        <div className="mt-6 ilt-surface-muted px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
          <strong className="text-[var(--ilt-text-primary)]">In one sentence:</strong> this is a
          golden hour clock that shows sunrise, sunset, and morning/evening
          golden hour times for your chosen date and coordinates, with a live
          countdown, fullscreen mode, GPS, and optional sound alerts.
        </div>
      </div>
    </section>
  );
}

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
   - Written to be unique to /astronomical-clock (sun + moon + twilight + sunrise/sunset).
   - Practical and tool-focused, not a blog post.
   - Technical details live in an expandable section.
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://www.ilovetimers.com/astronomical-clock",
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
    name: "How to use an online astronomical clock (sunrise, sunset, day or night, moon phase)",
    description:
      "Use this astronomical clock to view live local time for a chosen time zone, day or night status based on the sun’s position, sunrise and sunset for a specific location, and a moon phase readout. Use presets, set coordinates manually, and go fullscreen for an always-on display.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick the time zone you care about",
        text: "Choose Device time, UTC, or a preset time zone. The live clock and sunrise or sunset are displayed in that selected time zone.",
      },
      {
        "@type": "HowToStep",
        name: "Add a location (optional but recommended)",
        text: "Click “Use my location” or enter latitude and longitude to enable sunrise, sunset, and estimated day or twilight status for that spot.",
      },
      {
        "@type": "HowToStep",
        name: "Use presets for quick checks",
        text: "Tap a city preset to load coordinates and a matching time zone fast, useful for travel or remote coordination.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for a wall display",
        text: "Use Fullscreen or press F after focusing the clock display to keep sun and moon context visible across a room.",
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
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">How it works</h2>

            <p className="mt-2 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              This page is a focused <strong>astronomical clock</strong> that
              combines four things people usually check separately:{" "}
              <strong>live local time</strong>, a clear{" "}
              <strong>daylight or night label</strong>,{" "}
              <strong>sunrise and sunset</strong> for a chosen location, and a{" "}
              <strong>moon phase</strong> readout with an illumination estimate.
              It is built for quick decisions like “is it still twilight” or
              “when is sunset here,” not for deep astronomy charts.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              The key idea is that the page becomes dramatically more useful
              once you provide <strong>coordinates</strong>. With coordinates,
              the sunrise and sunset times are computed for your spot, and the
              day or twilight status reflects the sun’s position at that spot.
              Without coordinates, the clock still runs and the moon phase still
              shows, but sun events cannot be calculated for “your location,” so
              you will see blanks for sunrise and sunset.
            </p>

            <p className="mt-3 max-w-3xl text-[var(--ilt-text-secondary)] leading-relaxed">
              If you only want sunrise and sunset without the rest, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/sunrise-sunset-clock")}
              >
                Sunrise Sunset Clock
              </a>
              . If you only want the moon readout in a dedicated view, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/moon-phase-clock")}
              >
                Moon Phase Clock
              </a>
              . If your job is comparing cities, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/world-clock")}
              >
                World Clock
              </a>
              . For translating a meeting time across regions, use{" "}
              <a
                className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                href={abs("/time-zone-converter")}
              >
                Time Zone Converter
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Sunrise & sunset
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Daylight & twilight
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Moon phase
            </span>
            <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen
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
                <span className="font-semibold text-[var(--ilt-text-primary)]">1)</span> Choose
                a <strong>time zone</strong> if you are checking a place that is
                not your device’s zone.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">2)</span> Add a{" "}
                <strong>location</strong> using “Use my location,” a preset
                city, or manual latitude and longitude.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">3)</span> Read{" "}
                <strong>Sunrise</strong> and <strong>Sunset</strong> for today
                in the selected time zone.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">4)</span> Use the
                label at the top to see <strong>Daylight</strong>,{" "}
                <strong>Civil twilight</strong>,{" "}
                <strong>Nautical twilight</strong>,{" "}
                <strong>Astronomical twilight</strong>, or{" "}
                <strong>Night</strong>.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">5)</span> Press{" "}
                <Kbd>F</Kbd> to go fullscreen for a clean wall display.
              </li>
            </ol>

            <div className="mt-4 ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                What the page is optimized for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                This is meant to help you answer “right now” questions quickly:
                when does the sun set here, are we still in civil twilight, what
                phase is the moon, and what time is it in the selected zone. It
                is not a replacement for a detailed astronomy planner, and it is
                not a timer. If you need a hard end time for an activity, use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/event-countdown")}
                >
                  Event Countdown
                </a>{" "}
                or{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/countdown-timer")}
                >
                  Countdown Timer
                </a>
                .
              </p>
            </div>
          </div>

          <div className="ilt-surface-accent p-5">
            <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
              Important: coordinates change everything
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--ilt-text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">With</span>{" "}
                coordinates: sunrise, sunset, and daylight or twilight status
                are computed for that location.
              </li>
              <li>
                <span className="font-semibold text-[var(--ilt-text-primary)]">Without</span>{" "}
                coordinates: sunrise and sunset cannot be computed, so you will
                see blanks.
              </li>
              <li>
                Near polar regions, some days have{" "}
                <span className="font-semibold text-[var(--ilt-text-primary)]">
                  no sunrise or no sunset
                </span>{" "}
                at all.
              </li>
            </ul>

            <div className="mt-4 ilt-surface-accent p-4 text-sm text-[var(--ilt-text-secondary)]">
              <span className="font-semibold text-[var(--ilt-text-primary)]">Shortcut:</span> if
              you want a quick city check without typing, use the preset chips
              (New York, Toronto, London, Los Angeles, Tokyo, Sydney).
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 ilt-surface-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Related tools when you need a narrower view
              </div>
              <p className="mt-1 text-sm text-[var(--ilt-text-secondary)]">
                Stay on this page when you want sun, moon, and time together.
                Use these when you want a single-purpose tool.
              </p>
            </div>
            <div className="text-xs text-[var(--ilt-text-muted)]">
              Shortcut: <Kbd>F</Kbd> fullscreen
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PillLink href={abs("/sunrise-sunset-clock")}>
              Sunrise Sunset Clock
            </PillLink>
            <PillLink href={abs("/moon-phase-clock")}>
              Moon Phase Clock
            </PillLink>
            <PillLink href={abs("/golden-hour-clock")}>
              Golden Hour Clock
            </PillLink>
            <PillLink href={abs("/world-clock")}>World Clock</PillLink>
            <PillLink href={abs("/time-zone-converter")}>
              Time Zone Converter
            </PillLink>
            <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Real scenarios with example readings
          </h3>
          <p className="mt-2 text-[var(--ilt-text-secondary)] leading-relaxed">
            The examples below show the type of values you will see on this
            page. Exact sunrise and sunset times depend on the date and your
            coordinates, but the workflow is the same: set a location, pick a
            time zone, then read the sun events and daylight or twilight label.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Planning an evening walk, “how much light is left?”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Quick answer: daylight vs twilight, and sunset time
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Sun status
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are heading out after work and want to know if you will
                finish before it gets dark. Tap the Toronto preset (or use your
                location), then read the “Sunrise / Sunset” panel and the label
                at the top.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Example of what you might see: the label shows{" "}
                <strong>Daylight</strong>, sunset reads <strong>17:43</strong>,
                and your current time reads <strong>16:58:12</strong>. That
                gives you about <strong>45 minutes</strong> until sunset. If you
                also see the label change to <strong>Civil twilight</strong>{" "}
                shortly after, that is your cue that it is getting noticeably
                dim.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                If your main goal is sunrise and sunset only, use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/sunrise-sunset-clock")}
                >
                  Sunrise Sunset Clock
                </a>
                .
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Stargazing setup, “is it dark enough yet?”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Use the twilight label and sun altitude
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Twilight
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You care less about the exact sunset time and more about when
                the sky is truly dark. Set your location and watch the label.
                This page breaks nightfall into meaningful steps.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Example sequence you will see: after sunset, the label moves
                from <strong>Civil twilight</strong> to{" "}
                <strong>Nautical twilight</strong>, then to{" "}
                <strong>Astronomical twilight</strong>, then to{" "}
                <strong>Night</strong>. If the sun altitude line shows something
                like <strong>-13.2°</strong>, you are already in{" "}
                <strong>Astronomical twilight</strong>, which is typically when
                the sky starts to feel “properly dark” for many uses.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                For photo timing around warm light, try{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/golden-hour-clock")}
                >
                  Golden Hour Clock
                </a>
                .
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    Remote coordination, “what time is it there and is it
                    daytime?”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Presets plus time zone switching
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Time zones
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You are coordinating with someone in London and want to know if
                it is morning there, and whether they are already past sunset.
                Tap the London preset to load coordinates and the matching time
                zone. Now the time readout and sun events reflect London in one
                screen.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Example: you see <strong>21:15:40</strong> in London and the top
                label reads <strong>Night</strong>. That is a strong signal that
                you should not schedule something “end of day” unless it is
                urgent. If you need to convert a specific meeting time
                precisely, use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/time-zone-converter")}
                >
                  Time Zone Converter
                </a>
                .
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <PillLink href={abs("/world-clock")}>World Clock</PillLink>
                <PillLink href={abs("/time-zone-converter")}>
                  Time Zone Converter
                </PillLink>
                <PillLink href={abs("/utc-clock")}>UTC Clock</PillLink>
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                    “Can you show sunrise and sunset for my cabin coordinates?”
                  </div>
                  <div className="mt-1 text-sm text-[var(--ilt-text-muted)]">
                    Manual latitude and longitude entry
                  </div>
                </div>
                <span className="ilt-inline-pill px-3 py-1 text-xs font-semibold text-[var(--ilt-text-secondary)]">
                  Manual coords
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                You do not want to use browser location, but you have
                coordinates. Enter them into the Latitude and Longitude inputs.
                A common pattern is pasting something like{" "}
                <strong>43.6532</strong> and <strong>-79.3832</strong>
                or any equivalent values for your spot. Once set, sunrise and
                sunset populate.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Example: after entering coordinates, the page shows sunrise{" "}
                <strong>07:18</strong>
                and sunset <strong>17:52</strong> in the selected time zone. If
                you change the time zone, the displayed day can change, and the
                sunrise and sunset values may shift accordingly because the
                calculation is done for that time zone’s local date.
              </p>

              <div className="mt-3 ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                If you just want the time without sun data, use{" "}
                <a
                  className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
                  href={abs("/current-local-time")}
                >
                  Current Local Time
                </a>
                .
              </div>
            </div>
          </div>

          {/* Practical accuracy note */}
          <div className="mt-6 ilt-surface-muted p-6">
            <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
              Accuracy expectations and “why is it blank?”
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              If sunrise and sunset show “—”, it almost always means coordinates
              are not set. Tap “Use my location,” choose a preset, or enter
              latitude and longitude manually. If you are at very high
              latitudes, it can also be normal to have no sunrise or no sunset
              for a given date. In that case the page will report no event
              times, and the daylight or night label is the more useful signal.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
              Moon phase and illumination are designed to be practical. If you
              see “First Quarter” and illumination around “50%,” that is the
              kind of quick answer the page targets. For scheduling and
              coordination, the exact seconds do not matter as much as the phase
              and whether it is broadly bright or dark.
            </p>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 ilt-surface-muted p-6">
          <h3 className="text-lg font-semibold text-[var(--ilt-text-primary)]">
            Reliability and privacy (short, practical)
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Keep the display stable
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ilt-text-secondary)]">
                <li>
                  Keep the tab visible if you want the smoothest updating
                  display.
                </li>
                <li>
                  Background tabs can update less often due to browser
                  throttling.
                </li>
                <li>Fullscreen may be restricted on some mobile browsers.</li>
              </ul>
            </div>

            <div className="ilt-surface-card p-4">
              <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                Privacy and stored preferences
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                Coordinates are optional. If you use “Use my location,” your
                browser provides coordinates so the page can compute sun events.
                You can clear saved coordinates using “Clear location.” The page
                may store your chosen coordinates and time zone in your browser
                so your setup persists on the next visit.
              </p>
            </div>
          </div>

          {/* Technical / implementation notes should be expandable */}
          <details className="group mt-4 ilt-surface-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 ilt-focus-ring">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ilt-text-primary)]">
                  Technical notes (sunrise/sunset method, twilight thresholds,
                  moon phase)
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--ilt-text-muted)]">
                  Read this if you want to understand the model and edge cases
                </div>
              </div>
              <span className="shrink-0 ilt-inline-pill px-2 py-0.5 text-xs font-semibold text-[var(--ilt-text-secondary)] transition group-open:rotate-180">
                ▼
              </span>
            </summary>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Sunrise and sunset approximation
                </div>
                <p className="mt-1 leading-relaxed">
                  Sunrise and sunset are computed with a compact NOAA-style
                  approximation using a standard zenith value (90.833°). Results
                  are calculated for the selected time zone’s local date and
                  displayed in that time zone.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Twilight thresholds
                </div>
                <p className="mt-1 leading-relaxed">
                  The label is derived from estimated solar altitude: Daylight
                  &gt; 0°, Civil 0° to −6°, Nautical −6° to −12°, Astronomical
                  −12° to −18°, Night ≤ −18°.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Time zone handling
                </div>
                <p className="mt-1 leading-relaxed">
                  The page uses the selected IANA time zone for display and
                  derives the time zone offset for the current instant. Daylight
                  Saving Time behavior depends on the browser’s time zone
                  database.
                </p>
              </div>

              <div className="ilt-surface-muted p-3 text-sm text-[var(--ilt-text-secondary)]">
                <div className="font-semibold text-[var(--ilt-text-primary)]">
                  Moon phase model
                </div>
                <p className="mt-1 leading-relaxed">
                  Moon phase is computed from a synodic month length
                  (29.530588853 days) using a fixed reference epoch. That
                  produces a phase fraction mapped to the phase label and the
                  illumination estimate shown on the page.
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              If you only need sunrise and sunset:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/sunrise-sunset-clock")}
            >
              Sunrise Sunset Clock
            </a>{" "}
            for a simpler, single-purpose view.
          </div>

          <div className="ilt-surface-card px-4 py-3 text-sm text-[var(--ilt-text-secondary)]">
            <strong className="text-[var(--ilt-text-primary)]">
              If you need cross-zone scheduling:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] hover:underline"
              href={abs("/time-zone-converter")}
            >
              Time Zone Converter
            </a>{" "}
            to translate specific dates and meeting times.
          </div>
        </div>
      </div>
    </section>
  );
}

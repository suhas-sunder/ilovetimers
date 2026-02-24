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
        text: "Click “Use my location” or enter latitude and longitude to enable sunrise, sunset, and precise day or twilight status for that spot.",
      },
      {
        "@type": "HowToStep",
        name: "Use presets for quick checks",
        text: "Tap a city preset to load coordinates and a matching time zone fast, useful for travel or remote coordination.",
      },
      {
        "@type": "HowToStep",
        name: "Go fullscreen for a wall display",
        text: "Use Fullscreen or press F after focusing the clock card to keep sun and moon context visible across a room.",
      },
    ],
  };

  const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-900">
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
      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {children} →
    </a>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-sky-700">How it works</h2>

            <p className="mt-2 max-w-3xl text-slate-700 leading-relaxed">
              This page is a focused <strong>astronomical clock</strong> that
              combines four things people usually check separately:{" "}
              <strong>live local time</strong>, a clear{" "}
              <strong>daylight or night label</strong>,{" "}
              <strong>sunrise and sunset</strong> for a chosen location, and a{" "}
              <strong>moon phase</strong> readout with an illumination estimate.
              It is built for quick decisions like “is it still twilight” or
              “when is sunset here,” not for deep astronomy charts.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              The key idea is that the page becomes dramatically more useful
              once you provide <strong>coordinates</strong>. With coordinates,
              the sunrise and sunset times are computed for your spot, and the
              day or twilight status reflects the sun’s position at that spot.
              Without coordinates, the clock still runs and the moon phase still
              shows, but sun events cannot be calculated for “your location,” so
              you will see blanks for sunrise and sunset.
            </p>

            <p className="mt-3 max-w-3xl text-slate-700 leading-relaxed">
              If you only want sunrise and sunset without the rest, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/sunrise-sunset-clock")}
              >
                Sunrise Sunset Clock
              </a>
              . If you only want the moon readout in a dedicated view, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/moon-phase-clock")}
              >
                Moon Phase Clock
              </a>
              . If your job is comparing cities, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/world-clock")}
              >
                World Clock
              </a>
              . For translating a meeting time across regions, use{" "}
              <a
                className="cursor-pointer font-semibold text-slate-900 hover:underline"
                href={abs("/time-zone-converter")}
              >
                Time Zone Converter
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Sunrise & sunset
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Daylight & twilight
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Moon phase
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
              Fullscreen
            </span>
          </div>
        </div>

        {/* Quick flow */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              The “get value fast” flow
            </div>

            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">1)</span> Choose
                a <strong>time zone</strong> if you are checking a place that is
                not your device’s zone.
              </li>
              <li>
                <span className="font-semibold text-slate-900">2)</span> Add a{" "}
                <strong>location</strong> using “Use my location,” a preset
                city, or manual latitude and longitude.
              </li>
              <li>
                <span className="font-semibold text-slate-900">3)</span> Read{" "}
                <strong>Sunrise</strong> and <strong>Sunset</strong> for today
                in the selected time zone.
              </li>
              <li>
                <span className="font-semibold text-slate-900">4)</span> Use the
                label at the top to see <strong>Daylight</strong>,{" "}
                <strong>Civil twilight</strong>,{" "}
                <strong>Nautical twilight</strong>,{" "}
                <strong>Astronomical twilight</strong>, or{" "}
                <strong>Night</strong>.
              </li>
              <li>
                <span className="font-semibold text-slate-900">5)</span> Press{" "}
                <Kbd>F</Kbd> to go fullscreen for a clean wall display.
              </li>
            </ol>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                What the page is optimized for
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                This is meant to help you answer “right now” questions quickly:
                when does the sun set here, are we still in civil twilight, what
                phase is the moon, and what time is it in the selected zone. It
                is not a replacement for a detailed astronomy planner, and it is
                not a timer. If you need a hard end time for an activity, use{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/event-countdown")}
                >
                  Event Countdown
                </a>{" "}
                or{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/countdown-timer")}
                >
                  Countdown Timer
                </a>
                .
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-sm font-semibold text-slate-900">
              Important: coordinates change everything
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-800">
              <li>
                <span className="font-semibold text-slate-900">With</span>{" "}
                coordinates: sunrise, sunset, and daylight or twilight status
                are computed for that location.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Without</span>{" "}
                coordinates: sunrise and sunset cannot be computed, so you will
                see blanks.
              </li>
              <li>
                Near polar regions, some days have{" "}
                <span className="font-semibold text-slate-900">
                  no sunrise or no sunset
                </span>{" "}
                at all.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-800">
              <span className="font-semibold text-slate-900">Shortcut:</span> if
              you want a quick city check without typing, use the preset chips
              (New York, Toronto, London, Los Angeles, Tokyo, Sydney).
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Related tools when you need a narrower view
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Stay on this page when you want sun, moon, and time together.
                Use these when you want a single-purpose tool.
              </p>
            </div>
            <div className="text-xs text-slate-600">
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
          <h3 className="text-lg font-semibold text-sky-700">
            Real scenarios with example readings
          </h3>
          <p className="mt-2 text-slate-700 leading-relaxed">
            The examples below show the type of values you will see on this
            page. Exact sunrise and sunset times depend on the date and your
            coordinates, but the workflow is the same: set a location, pick a
            time zone, then read the sun events and daylight or twilight label.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* Scenario 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Planning an evening walk, “how much light is left?”
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Quick answer: daylight vs twilight, and sunset time
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Sun status
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You are heading out after work and want to know if you will
                finish before it gets dark. Tap the Toronto preset (or use your
                location), then read the “Sunrise / Sunset” panel and the label
                at the top.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Example of what you might see: the label shows{" "}
                <strong>Daylight</strong>, sunset reads <strong>17:43</strong>,
                and your current time reads <strong>16:58:12</strong>. That
                gives you about <strong>45 minutes</strong> until sunset. If you
                also see the label change to <strong>Civil twilight</strong>{" "}
                shortly after, that is your cue that it is getting noticeably
                dim.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If your main goal is sunrise and sunset only, use{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/sunrise-sunset-clock")}
                >
                  Sunrise Sunset Clock
                </a>
                .
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Stargazing setup, “is it dark enough yet?”
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use the twilight label and sun altitude
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Twilight
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You care less about the exact sunset time and more about when
                the sky is truly dark. Set your location and watch the label.
                This page breaks nightfall into meaningful steps.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Example sequence you will see: after sunset, the label moves
                from <strong>Civil twilight</strong> to{" "}
                <strong>Nautical twilight</strong>, then to{" "}
                <strong>Astronomical twilight</strong>, then to{" "}
                <strong>Night</strong>. If the sun altitude line shows something
                like <strong>-13.2°</strong>, you are already in{" "}
                <strong>Astronomical twilight</strong>, which is typically when
                the sky starts to feel “properly dark” for many uses.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                For photo timing around warm light, try{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/golden-hour-clock")}
                >
                  Golden Hour Clock
                </a>
                .
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Remote coordination, “what time is it there and is it
                    daytime?”
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Presets plus time zone switching
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Time zones
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You are coordinating with someone in London and want to know if
                it is morning there, and whether they are already past sunset.
                Tap the London preset to load coordinates and the matching time
                zone. Now the time readout and sun events reflect London in one
                screen.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Example: you see <strong>21:15:40</strong> in London and the top
                label reads <strong>Night</strong>. That is a strong signal that
                you should not schedule something “end of day” unless it is
                urgent. If you need to convert a specific meeting time
                precisely, use{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    “Can you show sunrise and sunset for my cabin coordinates?”
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Manual latitude and longitude entry
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                  Manual coords
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You do not want to use browser location, but you have
                coordinates. Enter them into the Latitude and Longitude inputs.
                A common pattern is pasting something like{" "}
                <strong>43.6532</strong> and <strong>-79.3832</strong>
                or any equivalent values for your spot. Once set, sunrise and
                sunset populate.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Example: after entering coordinates, the page shows sunrise{" "}
                <strong>07:18</strong>
                and sunset <strong>17:52</strong> in the selected time zone. If
                you change the time zone, the displayed day can change, and the
                sunrise and sunset values may shift accordingly because the
                calculation is done for that time zone’s local date.
              </p>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                If you just want the time without sun data, use{" "}
                <a
                  className="cursor-pointer font-semibold text-slate-900 hover:underline"
                  href={abs("/current-local-time")}
                >
                  Current Local Time
                </a>
                .
              </div>
            </div>
          </div>

          {/* Practical accuracy note */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-sky-700">
              Accuracy expectations and “why is it blank?”
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              If sunrise and sunset show “—”, it almost always means coordinates
              are not set. Tap “Use my location,” choose a preset, or enter
              latitude and longitude manually. If you are at very high
              latitudes, it can also be normal to have no sunrise or no sunset
              for a given date. In that case the page will report no event
              times, and the daylight or night label is the more useful signal.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Moon phase and illumination are designed to be practical. If you
              see “First Quarter” and illumination around “50%,” that is the
              kind of quick answer the page targets. For scheduling and
              coordination, the exact seconds do not matter as much as the phase
              and whether it is broadly bright or dark.
            </p>
          </div>
        </div>

        {/* Reliability + privacy */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-sky-700">
            Reliability and privacy (short, practical)
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Keep the display stable
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
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

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">
                Privacy and stored preferences
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Coordinates are optional. If you use “Use my location,” your
                browser provides coordinates so the page can compute sun events.
                You can clear saved coordinates using “Clear location.” The page
                may store your chosen coordinates and time zone in your browser
                so your setup persists on the next visit.
              </p>
            </div>
          </div>

          {/* Technical / implementation notes should be expandable */}
          <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  Technical notes (sunrise/sunset method, twilight thresholds,
                  moon phase)
                </div>
                <div className="mt-1 text-xs font-medium text-slate-600">
                  Read this if you want to understand the model and edge cases
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                ▼
              </span>
            </summary>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  Sunrise and sunset approximation
                </div>
                <p className="mt-1 leading-relaxed">
                  Sunrise and sunset are computed with a compact NOAA-style
                  approximation using a standard zenith value (90.833°). Results
                  are calculated for the selected time zone’s local date and
                  displayed in that time zone.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  Twilight thresholds
                </div>
                <p className="mt-1 leading-relaxed">
                  The label is derived from estimated solar altitude: Daylight
                  &gt; 0°, Civil 0° to −6°, Nautical −6° to −12°, Astronomical
                  −12° to −18°, Night ≤ −18°.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  Time zone handling
                </div>
                <p className="mt-1 leading-relaxed">
                  The page uses the selected IANA time zone for display and
                  derives the time zone offset for the current instant. Daylight
                  Saving Time behavior depends on the browser’s time zone
                  database.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
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
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              If you only need sunrise and sunset:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
              href={abs("/sunrise-sunset-clock")}
            >
              Sunrise Sunset Clock
            </a>{" "}
            for a simpler, single-purpose view.
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <strong className="text-slate-900">
              If you need cross-zone scheduling:
            </strong>{" "}
            use{" "}
            <a
              className="cursor-pointer font-semibold text-slate-900 hover:underline"
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

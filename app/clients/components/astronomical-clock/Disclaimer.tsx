export default function Disclaimer() {
  const preview =
    "Add a location for sunrise/sunset • Polar regions can have no sunrise • Fullscreen needs a click • Background tabs can throttle";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Limits & notes
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Sunrise and sunset need coordinates.
              </strong>{" "}
              Use{" "}
              <span className="font-semibold text-slate-900">
                Use my location
              </span>{" "}
              or enter latitude/longitude. Without coordinates, the clock still
              shows time, day or night labeling, and moon phase, but sunrise and
              sunset will stay blank.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Polar regions may have no sunrise or sunset.
              </strong>{" "}
              Near the Arctic or Antarctic Circle, some dates have continuous
              daylight or continuous night. In those cases you may see{" "}
              <span className="font-semibold text-slate-900">
                no sunrise/sunset
              </span>{" "}
              for that day.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Time zone affects what “today” means.
              </strong>{" "}
              Sunrise/sunset is calculated for the selected time zone’s local
              date. If you switch time zones, the displayed events can shift
              because the date can shift too. For quick checks across zones, use{" "}
              <a
                href="/time-zone-converter"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Time Zone Converter
              </a>
              .
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Daylight and twilight are based on sun altitude.
              </strong>{" "}
              The Daylight, Civil, Nautical, and Astronomical twilight labels
              come from the sun’s estimated altitude at your coordinates. Small
              differences are normal, especially around sunrise and sunset.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Moon phase is an approximation.
              </strong>{" "}
              The phase label and illumination are based on a standard synodic
              month model. It’s great for a quick readout, but it is not a
              telescope-grade ephemeris. If you want a dedicated view, try{" "}
              <a
                href="/moon-phase-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Moon Phase Clock
              </a>
              .
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen requires a user action.
              </strong>{" "}
              Browsers only allow fullscreen after a click or tap. If fullscreen
              doesn’t open, click the clock area and try again. Use Esc to exit.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Background tabs can throttle updates.
              </strong>{" "}
              When the tab is not visible, browsers may reduce animation and
              timer frequency. The time stays correct, but the display may look
              less smooth when you return.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Prefer a focused tool?</strong>{" "}
              For just sunrise and sunset, use{" "}
              <a
                href="/sunrise-sunset-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Sunrise Sunset Clock
              </a>
              . For world time, use{" "}
              <a
                href="/world-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                World Clock
              </a>
              .
            </li>
          </ul>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>Technical details</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Sunrise/Sunset model
                  </div>
                  <p className="mt-2">
                    Sunrise and sunset use a compact NOAA-style approximation
                    (zenith 90.833°). Results are formatted in the selected time
                    zone and calculated for that zone’s local date.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Twilight labels
                  </div>
                  <p className="mt-2">
                    Twilight categories are derived from estimated solar
                    altitude: Daylight &gt; 0°, Civil 0° to −6°, Nautical −6° to
                    −12°, Astronomical −12° to −18°, Night ≤ −18°.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Time zone handling
                  </div>
                  <p className="mt-2">
                    The clock uses the selected IANA time zone for display, and
                    derives the time zone offset for the current instant.
                    Daylight Saving Time is handled by the browser’s time zone
                    database.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Moon phase model
                  </div>
                  <p className="mt-2">
                    Moon phase uses a synodic month length of 29.530588853 days
                    with a fixed reference epoch, producing a phase fraction
                    that maps to the phase label and an approximate illumination
                    value.
                  </p>
                </div>
              </div>
            </details>
          </div>
        </details>
      </div>
    </section>
  );
}

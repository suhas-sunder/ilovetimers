import { Link } from "react-router";

/* =========================================================
   KEYBOARD SHORTCUTS (MOON PHASE CLOCK)
========================================================= */
export default function KeyboardShortcuts() {
  // Moon Phase Clock supports:
  // F (fullscreen), Esc (exit fullscreen)
  const rows = [
    { key: "F", action: "Toggle fullscreen for the moon phase display" },
    { key: "Esc", action: "Exit fullscreen" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Keyboard shortcuts
        </h2>
        <p className="mt-2 leading-relaxed text-slate-700">
          Click the moon phase card once, then use the shortcuts below.
          Shortcuts won’t trigger while you’re typing in a date or time input.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-semibold text-slate-900">Key</th>
                <th className="py-2 font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.key}-${r.action}`}
                  className="border-b border-slate-100"
                >
                  <td className="py-2 pr-4">
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-900">
                      {r.key}
                    </kbd>
                  </td>
                  <td className="py-2 text-slate-700">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Tip: if shortcuts do nothing, the card probably isn’t focused. Click
          the display once, then try again.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BEHAVIOR + PRIVACY (moon model + live/manual + sound)
   Schema: none required
========================================================= */
export function AccuracyAndPrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">
          Behavior and privacy
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Live and Manual modes
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Live updates continuously. If you edit the date or time fields,
              the page switches to Manual so you can check another moment. Use
              Now to return to Live.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Uses your device time zone for display
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Times shown for the next and previous major phases are formatted
              in your local time zone. If your device clock or time zone is set
              incorrectly, displayed times will reflect that.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Sound requires interaction on some browsers
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Browsers often require a click before audio can play. If you
              enable Sound, click Now once to unlock audio. Final beeps only
              runs in Live mode.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              No account, no uploads
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This page does not require an account and does not ask you to
              upload files or personal data to use the tool.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen is a browser feature
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Fullscreen uses your browser’s permission. Press{" "}
              <span className="font-semibold text-slate-900">Esc</span> to exit
              at any time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fast estimate for a clock experience
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Phase, illumination, and major-phase times are computed from a
              lightweight lunar-cycle estimate for a smooth, always-on display.
              It is great for everyday planning, but not intended as
              observatory-grade ephemeris data.
            </p>
          </div>
        </div>

        {/* Technical / implementation notes should be expandable */}
        <details className="group mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Technical notes (live updates, lunar model, fullscreen, sound)
              </div>
              <div className="mt-1 text-xs font-medium text-slate-600">
                Optional details about update cadence, lunar-cycle math, and
                audio behavior
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Live update cadence
              </div>
              <p className="mt-1 leading-relaxed">
                In Live mode, the countdown refreshes frequently so the display
                feels smooth. Manual mode stays fixed at the selected date and
                time.
              </p>
              <p className="mt-2 leading-relaxed">
                The “Event soon” state highlights when the next major phase is
                approaching.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">
                Lunar-cycle estimate
              </div>
              <p className="mt-1 leading-relaxed">
                The page estimates cycle position using a fixed synodic month
                and a reference New Moon timestamp, then derives phase label,
                illumination, and age from that position.
              </p>
              <p className="mt-2 leading-relaxed">
                Major phase times are computed by finding the next boundary from
                the current cycle fraction.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 md:col-span-2">
              <div className="font-semibold text-slate-900">
                Fullscreen + sound behavior
              </div>
              <p className="mt-1 leading-relaxed">
                Fullscreen uses the browser fullscreen API and may require a
                user interaction. Sound uses WebAudio and may be blocked until a
                user gesture occurs.
              </p>
              <p className="mt-2 leading-relaxed">
                Final beeps triggers short beeps near the end of the countdown
                in Live mode. Turn off Sound to silence all audio immediately.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong className="text-slate-900">Related.</strong> Want sunrise and
          sunset times?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/sunrise-sunset-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Sunrise Sunset Clock
            </Link>
          </span>
          . Want a broader sky-style display?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/astronomical-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              Astronomical Clock
            </Link>
          </span>
          . Need other locations?{" "}
          <span className="whitespace-nowrap">
            <Link
              to="/world-clock"
              className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
            >
              World Clock
            </Link>
          </span>
          .
        </div>
      </div>
    </section>
  );
}

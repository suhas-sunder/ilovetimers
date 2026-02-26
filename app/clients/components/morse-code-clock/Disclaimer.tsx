import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Live local time in Morse code • Block + text views • 12/24-hour + seconds toggles • Fullscreen • Copy output • Keyboard shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Morse code clock at a glance
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {preview}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
              ▼
            </span>
          </summary>

          {/* What this page is for (tight, user-first) */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">
              A clean live clock that shows your current local time written in
              Morse code digits.
            </strong>{" "}
            Use it to practice reading Morse numbers, display time in a fun
            format, or run it fullscreen for a clear demo. Switch between block
            shapes and text, toggle seconds, and copy the current output when
            you need to share it.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Live updates.</strong> Stays in
              sync on the second boundary for a stable clock feel.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Block view.</strong> Dots and
              dashes rendered as simple shapes so you can read from a distance.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Text view.</strong> See the raw
              Morse strings for each digit (easy to copy, easy to compare).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">12/24-hour + seconds.</strong>{" "}
              Toggle 24-hour time and show/hide seconds depending on how you’re
              using the display.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Fullscreen mode.</strong> One
              click for a clean, room-readable display with top controls and a
              bottom status line.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy output.</strong> Copy both
              the normal time and the Morse representation (great for notes,
              slides, or sharing).
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Pick a view</strong>:
                Blocks for readability, Text for exact Morse strings.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Set format</strong>:
                toggle <strong className="text-slate-900">24-hour</strong> and{" "}
                <strong className="text-slate-900">Seconds</strong> to match
                your use case.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">
                  3) Fullscreen or copy
                </strong>
                : press <strong className="text-slate-900">F</strong> for
                fullscreen, or <strong className="text-slate-900">C</strong> to
                copy the output.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Best for
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Practice</strong>: learn to
                  recognize Morse digits quickly.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Demos</strong>: fullscreen
                  display for classes, clubs, or presentations.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">A visual clock</strong>:
                  keep it open as a fun “ambient” time display.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Sharing</strong>: copy the
                  current time + Morse output in one click.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Prefer a different time style?{" "}
                  <Link
                    to="/binary-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Binary Clock
                  </Link>
                  ,{" "}
                  <Link
                    to="/hexadecimal-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Hexadecimal Clock
                  </Link>
                  , or{" "}
                  <Link
                    to="/roman-numeral-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Roman Numeral Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need a standard display too?{" "}
                  <Link
                    to="/digital-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Digital Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need time for another place?{" "}
                  <Link
                    to="/world-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    World Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting times across zones?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>

          {/* Technical / documentation content stays tucked away */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
                <span>How it works, shortcuts, and notes</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <ul className="mt-2 grid gap-2">
                    <li>
                      <strong className="text-slate-900">F</strong>: fullscreen
                    </li>
                    <li>
                      <strong className="text-slate-900">T</strong>: toggle
                      24-hour
                    </li>
                    <li>
                      <strong className="text-slate-900">S</strong>: toggle
                      seconds
                    </li>
                    <li>
                      <strong className="text-slate-900">V</strong>: switch view
                      (blocks/text)
                    </li>
                    <li>
                      <strong className="text-slate-900">C</strong>: copy output
                    </li>
                    <li>
                      <strong className="text-slate-900">Esc</strong>: exit
                      fullscreen
                    </li>
                  </ul>
                  <p className="mt-2">
                    Tip: click the clock card once so shortcuts are captured.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Morse digits used
                  </div>
                  <p className="mt-2">
                    Each time digit is encoded using standard Morse number
                    patterns:
                  </p>
                  <ul className="mt-2 grid gap-1 font-mono text-xs">
                    <li>
                      <span className="font-semibold text-slate-900">0</span>{" "}
                      -----{" "}
                      <span className="ml-2 font-semibold text-slate-900">
                        5
                      </span>{" "}
                      .....
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">1</span>{" "}
                      .----{" "}
                      <span className="ml-2 font-semibold text-slate-900">
                        6
                      </span>{" "}
                      -....
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">2</span>{" "}
                      ..---{" "}
                      <span className="ml-2 font-semibold text-slate-900">
                        7
                      </span>{" "}
                      --...
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">3</span>{" "}
                      ...--{" "}
                      <span className="ml-2 font-semibold text-slate-900">
                        8
                      </span>{" "}
                      ---..
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">4</span>{" "}
                      ....-{" "}
                      <span className="ml-2 font-semibold text-slate-900">
                        9
                      </span>{" "}
                      ----.
                    </li>
                  </ul>
                  <p className="mt-2">
                    In Text view, digits are separated so you can see hour and
                    minute groups clearly.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Display notes
                  </div>
                  <p className="mt-2">
                    This clock shows your{" "}
                    <strong className="text-slate-900">
                      local device time
                    </strong>
                    . If your system time zone or clock is off, the display will
                    match that. Fullscreen uses a clean layout intended for
                    distance reading.
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> For a clean demo,
            go fullscreen, turn on 24-hour, and hide seconds. For practice,
            enable seconds and switch views as you learn.
          </div>
        </details>
      </div>
    </section>
  );
}

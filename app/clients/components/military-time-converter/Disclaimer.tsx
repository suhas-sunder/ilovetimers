import { Link } from "react-router";

export default function Disclaimer() {
  const preview =
    "Two-way conversion • Flexible input (1730, 17:30, 5:30 PM) • Normalized output • Copy results • Quick examples • Fullscreen + shortcuts";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300/60">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-sky-700">
                Military time converter at a glance
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
              Use this page to convert military time (24-hour) and standard time
              (AM/PM) instantly.
            </strong>{" "}
            Type in either box. When your input is valid, the other side updates
            right away. Use <strong className="text-slate-900">Copy</strong> to
            paste the result into a message, schedule, report, or note, or go{" "}
            <strong className="text-slate-900">Fullscreen</strong> for a big,
            click-to-copy display.
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 group-open:grid">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Works both directions.</strong>{" "}
              Convert{" "}
              <span className="font-semibold text-slate-900">
                24-hour → AM/PM
              </span>{" "}
              and{" "}
              <span className="font-semibold text-slate-900">
                AM/PM → 24-hour
              </span>{" "}
              without switching tools.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Flexible input formats.
              </strong>{" "}
              Paste <span className="font-semibold text-slate-900">1730</span>,{" "}
              <span className="font-semibold text-slate-900">17:30</span>,{" "}
              <span className="font-semibold text-slate-900">5:30</span>, or{" "}
              <span className="font-semibold text-slate-900">0730</span>. For
              standard time, include{" "}
              <span className="font-semibold text-slate-900">AM</span> or{" "}
              <span className="font-semibold text-slate-900">PM</span>.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Normalized output.</strong> The
              converter shows the result plus a clean, consistent representation
              of the time you entered (useful when you paste messy formats from
              chat logs or spreadsheets).
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Copy in one click.</strong>{" "}
              Copy the current result (AM/PM or military) without selecting
              text. In fullscreen,{" "}
              <span className="font-semibold text-slate-900">
                click/tap the big result
              </span>{" "}
              to copy.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Quick examples.</strong> Tap a
              preset like{" "}
              <span className="font-semibold text-slate-900">0000</span>,{" "}
              <span className="font-semibold text-slate-900">1200</span>,{" "}
              <span className="font-semibold text-slate-900">1730</span>,{" "}
              <span className="font-semibold text-slate-900">2359</span>, or{" "}
              <span className="font-semibold text-slate-900">2400</span> to see
              common conversions instantly.
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">Now button.</strong> Fill both
              boxes with your current local time in both formats, so you can
              copy what you need right away.
            </div>
          </div>

          {/* 3-step "do this now" guidance */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
              Quick use
            </div>
            <ol className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">1) Type or paste</strong>: in
                either box (military or AM/PM).
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">2) Confirm</strong>: the
                opposite side updates when your input is valid.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <strong className="text-slate-900">3) Copy</strong>: use Copy,
                or go fullscreen and tap the big result to copy.
              </li>
            </ol>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Common conversions
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Midnight</strong>:{" "}
                  <span className="font-semibold text-slate-900">0000</span> →
                  12:00 AM (some systems also use{" "}
                  <span className="font-semibold text-slate-900">2400</span>).
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Noon</strong>:{" "}
                  <span className="font-semibold text-slate-900">1200</span> →
                  12:00 PM.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Evening</strong>:{" "}
                  <span className="font-semibold text-slate-900">1730</span> →
                  5:30 PM.
                </li>
                <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <strong className="text-slate-900">Last minute</strong>:{" "}
                  <span className="font-semibold text-slate-900">2359</span> →
                  11:59 PM.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                Related tools
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Converting across time zones too?{" "}
                  <Link
                    to="/time-zone-converter"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Zone Converter
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Need the current local time quickly?{" "}
                  <Link
                    to="/current-local-time"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Current Local Time
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Want an always-accurate reference clock?{" "}
                  <Link
                    to="/atomic-clock"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Atomic Clock
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Doing time math (durations, add/subtract)?{" "}
                  <Link
                    to="/time-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Time Calculator
                  </Link>
                  .
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  Tracking time for work?{" "}
                  <Link
                    to="/work-hours-calculator"
                    className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
                  >
                    Work Hours Calculator
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
                <span>Input rules + shortcuts</span>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-2 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Military input accepted
                  </div>
                  <p className="mt-2">
                    You can enter{" "}
                    <span className="font-semibold text-slate-900">HHMM</span>{" "}
                    (e.g., 1730),{" "}
                    <span className="font-semibold text-slate-900">HMM</span>{" "}
                    (e.g., 730),{" "}
                    <span className="font-semibold text-slate-900">HH:MM</span>{" "}
                    (e.g., 17:30), or{" "}
                    <span className="font-semibold text-slate-900">H:MM</span>{" "}
                    (e.g., 5:30). If you enter only hours (e.g., 17), minutes
                    default to 00.
                  </p>
                  <p className="mt-2">
                    Hours must be 0–23. Minutes must be 00–59.{" "}
                    <span className="font-semibold text-slate-900">2400</span>{" "}
                    is treated as midnight (00:00) and shown with a note.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Standard input accepted
                  </div>
                  <p className="mt-2">
                    Include{" "}
                    <span className="font-semibold text-slate-900">AM</span> or{" "}
                    <span className="font-semibold text-slate-900">PM</span>.
                    Examples:{" "}
                    <span className="font-semibold text-slate-900">5 PM</span>,{" "}
                    <span className="font-semibold text-slate-900">
                      5:30 PM
                    </span>
                    ,{" "}
                    <span className="font-semibold text-slate-900">12 AM</span>,{" "}
                    <span className="font-semibold text-slate-900">
                      12:05 am
                    </span>
                    . Minutes are optional and default to 00.
                  </p>
                  <p className="mt-2">
                    Hour must be 1–12. Minutes must be 00–59.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Keyboard shortcuts
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold text-slate-900">N</span> fill
                    current time ·{" "}
                    <span className="font-semibold text-slate-900">C</span> copy
                    AM/PM result ·{" "}
                    <span className="font-semibold text-slate-900">M</span> copy
                    military result ·{" "}
                    <span className="font-semibold text-slate-900">R</span>{" "}
                    clear ·{" "}
                    <span className="font-semibold text-slate-900">F</span>{" "}
                    fullscreen ·{" "}
                    <span className="font-semibold text-slate-900">Esc</span>{" "}
                    exit fullscreen.
                  </p>
                  <p className="mt-2">
                    Shortcuts are ignored while typing in inputs.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-600">
                    Fullscreen behavior
                  </div>
                  <p className="mt-2">
                    Fullscreen shows the current conversion in a big, readable
                    format. In fullscreen,{" "}
                    <span className="font-semibold text-slate-900">
                      click/tap the result
                    </span>{" "}
                    to copy quickly.
                  </p>
                  <p className="mt-2">
                    If fullscreen is blocked, try again after an explicit click
                    on the Fullscreen button (some browsers require a user
                    gesture).
                  </p>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong className="text-slate-900">Tip.</strong> If you are copying
            times into a message, use{" "}
            <strong className="text-slate-900">Fullscreen</strong> and tap the
            big result to copy repeatedly. If an input does not convert, it is
            usually missing <strong className="text-slate-900">AM/PM</strong> on
            the standard side or has minutes outside{" "}
            <strong className="text-slate-900">00–59</strong>.
          </div>
        </details>
      </div>
    </section>
  );
}

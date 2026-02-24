export default function Disclaimer() {
  const preview =
    "Fullscreen requires a gesture • Background tabs can throttle • Smooth seconds uses more CPU • Timezone is device-based";

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
                Fullscreen requires a user action.
              </strong>{" "}
              Browsers only allow fullscreen after a click/tap. If fullscreen
              doesn’t open, click the clock area and try again. Use Esc to exit.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Background tabs can throttle updates.
              </strong>{" "}
              When the tab is not visible, browsers may reduce animation and
              timer frequency. The time stays correct, but the seconds hand may
              look less smooth when you return.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Smooth seconds uses more CPU.
              </strong>{" "}
              Smooth mode updates continuously for a fluid seconds hand. If you
              want lower power usage (or you’re projecting on an older device),
              turn off Smooth or hide the seconds hand.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Timezone is device-based.
              </strong>{" "}
              This clock shows your device’s local time and timezone settings.
              If it looks wrong, check your OS timezone and “Set time
              automatically.”
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Clock accuracy depends on the device.
              </strong>{" "}
              Most systems stay accurate, but if your device clock drifts, this
              page will reflect that drift. For a reference time source, use the{" "}
              <a
                href="/atomic-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Atomic Clock
              </a>
              .
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Keyboard shortcuts need focus.
              </strong>{" "}
              Click the clock card once so shortcuts work: F fullscreen • S
              seconds hand • M smooth.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Screen recording and mirroring can add lag.
              </strong>{" "}
              If you’re casting or recording, animations may look slightly less
              smooth due to capture overhead. Try disabling Smooth.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Prefer a different style?
              </strong>{" "}
              If you want a simpler display, try the{" "}
              <a
                href="/minimalist-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Minimalist Clock
              </a>{" "}
              or{" "}
              <a
                href="/digital-clock"
                className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
              >
                Digital Clock
              </a>
              .
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}

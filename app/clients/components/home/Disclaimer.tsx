export default function Disclaimer() {
  const preview =
    "Sound can be blocked • Background tabs can throttle updates • No notifications • Fullscreen restrictions";

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

          <ul className="mt-3 hidden grid gap-3 sm:grid-cols-2 group-open:grid">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Sound depends on your device.
              </strong>{" "}
              Some browsers, especially on mobile, block audio until you
              interact with the page or have sound muted at the system level.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Background tabs are throttled.
              </strong>{" "}
              Browsers pause or slow visual updates when a tab is in the
              background or the screen is locked. Timers keep correct time and
              update when you return.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                No notifications or alarms.
              </strong>{" "}
              Timers run only while this page is open. There are no push
              notifications or system alarms.
            </li>

            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <strong className="text-slate-900">
                Fullscreen has browser limits.
              </strong>{" "}
              Fullscreen mode requires user interaction and may be restricted by
              browser or device policies.
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}

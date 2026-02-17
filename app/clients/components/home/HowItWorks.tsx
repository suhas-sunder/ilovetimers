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
   1) HOW IT WORKS (trust block)
========================================================= */
export default function HowItWorks({
  canonicalUrl = "https://ilovetimers.com/",
}: {
  canonicalUrl?: string;
}) {
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the online timers",
    description:
      "Use a countdown timer, stopwatch with laps, Pomodoro focus timer, or HIIT interval timer. Includes fullscreen mode and keyboard shortcuts.",
    url: canonicalUrl,
    step: [
      {
        "@type": "HowToStep",
        name: "Pick a timer",
        text: "Choose Countdown, Stopwatch, Pomodoro, or HIIT depending on what you’re timing.",
      },
      {
        "@type": "HowToStep",
        name: "Set the time or settings",
        text: "Countdown accepts ss, mm:ss, or h:mm:ss (up to 24 hours). Pomodoro and HIIT let you adjust work/break/rounds and warm-up/cool-down.",
      },
      {
        "@type": "HowToStep",
        name: "Start, pause, reset",
        text: "Use Start/Pause and Reset buttons, or focus a timer card and press Space to start/pause and R to reset.",
      },
      {
        "@type": "HowToStep",
        name: "Use optional controls",
        text: "Toggle sound/loop for Countdown, record laps on the Stopwatch, and use Skip/Next to advance Pomodoro/HIIT phases. Fullscreen is available on each timer for distance readability.",
      },
    ],
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <JsonLd data={howToLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-700">How it works</h2>

        <p className="mt-2 text-slate-700 leading-relaxed">
          Everything runs locally in your browser tab. Each timer uses
          high-resolution timestamps to stay accurate, and it recalculates the
          correct remaining time after pauses or when your browser limits
          updates in the background.
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Countdown input formats
            </div>
            <div className="mt-1 text-sm text-slate-700">
              Enter <strong>ss</strong>, <strong>mm:ss</strong>, or{" "}
              <strong>h:mm:ss</strong> (for example <strong>90</strong>,{" "}
              <strong>05:00</strong>, <strong>1:15:00</strong>
              ). Presets are there if you just want to start fast.
            </div>
          </li>

          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Stopwatch + laps
            </div>
            <div className="mt-1 text-sm text-slate-700">
              The stopwatch tracks precise elapsed time. Tap{" "}
              <strong>Lap</strong> to record splits and see both lap time and
              total time.
            </div>
          </li>

          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Pomodoro + HIIT auto-runs
            </div>
            <div className="mt-1 text-sm text-slate-700">
              Pomodoro cycles through work and break blocks. HIIT runs warm-up,
              work/rest rounds, then cool-down. Use <strong>Skip</strong> when
              you want to advance to the next phase.
            </div>
          </li>

          <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Fullscreen + keyboard control
            </div>
            <div className="mt-1 text-sm text-slate-700">
              Each timer supports fullscreen for visibility on TVs, projectors,
              or across a room. Click a timer card, then use{" "}
              <strong>Space</strong> (start/pause), <strong>R</strong> (reset),{" "}
              and <strong>F</strong> (fullscreen). Stopwatch adds{" "}
              <strong>L</strong> for lap, and Pomodoro/HIIT use{" "}
              <strong>N</strong> to skip.
            </div>
          </li>
        </ul>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <strong className="text-slate-900">Privacy note:</strong> No account,
          no setup. Timing stays in your browser tab and starts instantly.
        </div>
      </div>
    </section>
  );
}

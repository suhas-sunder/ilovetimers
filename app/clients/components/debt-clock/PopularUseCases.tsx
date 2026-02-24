import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (debt-clock intent)
   Schema: ItemList (scenarios -> best matching route)
========================================================= */

type ScenarioLink = { label: string; href: string };

type Scenario = {
  title: string;
  description: string;
  forWho: string;
  notFor: string;
  links: ScenarioLink[];
};

export default function PopularUseCases({
  baseUrl = "https://www.ilovetimers.com",
}: {
  baseUrl?: string;
}) {
  const scenarios: Scenario[] = [
    {
      title: "Fullscreen “big number” debt display",
      description:
        "Put the live counter on a TV, projector, or second monitor. Fullscreen keeps the total readable from a distance and adds top/bottom controls.",
      forWho:
        "Presentations, classrooms, stream overlays, dashboards, or any situation where you want the number visible without UI clutter.",
      notFor:
        "A verified official total. This tool is an estimate based on your starting value and average rate.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
        { label: "Meeting Timer", href: "/meeting-timer" },
      ],
    },
    {
      title: "Quick snapshot for notes or slides (Copy)",
      description:
        "Use Copy to grab a clean text snapshot (preset name, “as of” label, current estimate, starting value, and rate). Paste it into a doc or slide without reformatting.",
      forWho:
        "Anyone preparing talking points, slide decks, meeting notes, or a report where you need a clean pasteable number + assumptions.",
      notFor:
        "Exporting charts or time series. This tool is meant for a live display and quick copy.",
      links: [
        { label: "Debt Repayment Timer", href: "/debt-repayment-timer" },
        { label: "Count Up Timer", href: "/count-up-timer" },
        { label: "Meeting Count Up Timer", href: "/meeting-count-up-timer" },
      ],
    },
    {
      title: "What-if checks (change the rate)",
      description:
        "Adjust the yearly change to see how the counter behaves under different assumptions. The number keeps continuity from the current value and applies the new rate going forward.",
      forWho:
        "Anyone doing quick sensitivity checks: “what if the yearly change is higher/lower?” or “what if it’s shrinking instead?”",
      notFor:
        "Detailed forecasting. This is a simple linear estimate (average rate), not a model with compounding, seasonality, or policy events.",
      links: [{ label: "Time Calculator", href: "/time-calculator" }],
    },
    {
      title: "Visualizing a shrinking balance (negative yearly change)",
      description:
        "If you have an average annual reduction amount, enter it as a negative yearly change to run the counter down instead of up.",
      forWho:
        "Debt payoff framing, classroom examples, or quick visuals where a downward trend matters more than precision.",
      notFor:
        "Payment schedules and interest math. This counter does not calculate payments, interest, or amortization.",
      links: [
        { label: "Debt Repayment Timer", href: "/debt-repayment-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Controlled demo for live talks (Reset + Pause)",
      description:
        "Pause when you want to freeze the number for discussion, then resume. Reset snaps back to your starting value for repeating a segment.",
      forWho:
        "Speakers, teachers, and anyone rehearsing or running a live demo with a consistent starting point.",
      notFor: "Hands-off unattended displays where you need zero interaction.",
      links: [
        { label: "Presentation Timer", href: "/presentation-timer" },
        { label: "Meeting Timer", href: "/meeting-timer" },
        { label: "Stopwatch", href: "/stopwatch" },
      ],
    },
    {
      title: "Setting up a “source + date” trail (“As of” label)",
      description:
        "Use the “as of” field to record what your starting value and rate are based on. It shows on-screen and in copied snapshots so your assumptions are always attached.",
      forWho:
        "Anyone sharing numbers who wants the context to travel with the output (source/date/version).",
      notFor:
        "Automatic syncing. The tool won’t update itself from a data provider.",
      links: [{ label: "Terms", href: "/terms" }],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), generate separate schema list with absolute URLs
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/debt-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Debt Clock",
    itemListElement: schemaList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.primaryUrl,
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <JsonLd data={itemListLd} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-sky-700">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            This page is built for a live debt counter: presets or custom
            starting values, an average yearly change rate, fullscreen display,
            keyboard shortcuts, and one-click copy of a clean snapshot.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-base font-semibold text-slate-900">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-slate-700">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    For
                  </div>
                  <div className="mt-1 text-slate-700">{s.forWho}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Not for
                  </div>
                  <div className="mt-1 text-slate-700">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <a
                    key={`${s.title}-${l.href}`}
                    href={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen,
          <span className="font-semibold text-slate-900"> Space</span> to
          start/pause, <span className="font-semibold text-slate-900">R</span>{" "}
          to reset, and <span className="font-semibold text-slate-900">C</span>{" "}
          to copy a clean snapshot. If shortcuts do nothing, click the debt
          clock card once to focus it.
        </div>
      </div>
    </section>
  );
}

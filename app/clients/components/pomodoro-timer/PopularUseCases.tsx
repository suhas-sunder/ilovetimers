import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (PIZZA TIMER intent)
   Schema: ItemList (scenarios -> this route)
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
      title: "Frozen pizza in the oven with a quick preset",
      description:
        "Tap a frozen oven preset and start the countdown. Add a “check” reminder a couple minutes before the end so you can confirm browning and doneness without hovering.",
      forWho: "Anyone cooking frozen pizza in a standard oven.",
      notFor:
        "You want a general-purpose kitchen timer for everything you cook. Use Cooking Timer instead.",
      links: [
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
      ],
    },
    {
      title: "Frozen pizza in an air fryer with an early check",
      description:
        "Use the air fryer preset and set a reminder to check before it finishes. Air fryers can brown fast, so an early check helps you decide whether to finish, flip, or pull it early.",
      forWho: "Air fryer users who want a quick start and a check-in prompt.",
      notFor: "You need a silent timer by default. Use Silent Timer instead.",
      links: [
        { label: "Silent Timer", href: "/silent-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Reheating a slice without overcooking it",
      description:
        "Tap a short preset (or set a custom time), then enable a check reminder so you can stop early if it’s already hot. Final beeps help you catch the finish without watching the screen.",
      forWho: "Quick reheats where seconds matter.",
      notFor:
        "You want multiple different timers running at the same time. Use Multiple Timers instead.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
      ],
    },
    {
      title: "Skillet reheating with a 1-minute check",
      description:
        "Use a short skillet preset and set the check reminder to 1 minute left so you can check crispness and decide whether to cover, lower heat, or finish.",
      forWho: "Skillet/covered-pan reheats that need a fast check-in.",
      notFor:
        "You want a more visual, “at-a-glance” style timer. Use Visual Timer instead.",
      links: [
        { label: "Visual Timer", href: "/visual-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Big-screen countdown while you prep or clean",
      description:
        "Go fullscreen for large digits you can see across the kitchen. In fullscreen, tap/click the time to start or pause without hunting for buttons.",
      forWho: "Cooking while moving around the kitchen.",
      notFor:
        "You only want a dedicated big-screen timer with minimal controls. Use Fullscreen Timer instead.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Online Timer", href: "/online-timer" },
        { label: "Silent Timer", href: "/silent-timer" },
      ],
    },
    {
      title: "Timing pizza plus sides at the same time",
      description:
        "Use Pizza Timer for the main countdown, then open Multiple Timers for sides (wings, fries, or garlic bread) so everything finishes close together.",
      forWho: "Anyone juggling more than one dish at once.",
      notFor:
        "You only need one simple countdown. Use Countdown Timer instead.",
      links: [
        { label: "Multiple Timers", href: "/multiple-timers" },
        { label: "Countdown Timer", href: "/countdown-timer" },
        { label: "Cooking Timer", href: "/cooking-timer" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (router-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/pizza-timer"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use Pizza Timer",
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
            Quick presets for frozen pizza, a big countdown display, optional
            check reminders, final beeps, fullscreen mode, and keyboard
            shortcuts.
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
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <span className="font-semibold text-slate-900">Tip:</span> Set{" "}
          <span className="font-semibold text-slate-900">
            Check with X min left
          </span>{" "}
          to <span className="font-semibold text-slate-900">2</span> for oven or{" "}
          <span className="font-semibold text-slate-900">1</span> for skillet as
          a quick “check it” moment. Use{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen,{" "}
          <span className="font-semibold text-slate-900">Space</span> to
          start/pause, and{" "}
          <span className="font-semibold text-slate-900">R</span> to reset.
        </div>
      </div>
    </section>
  );
}

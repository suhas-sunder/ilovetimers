import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (Hexadecimal Clock intent)
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
      title: "Copy a complete timestamp (hex + ISO) for logs or tickets",
      description:
        "Use Copy to grab a ready-to-paste block that includes the hex time output, decimal time with your local time zone label, a formatted date line, and an ISO timestamp (UTC).",
      forWho:
        "Developers, QA, support, and anyone who needs a precise timestamp snapshot to share.",
      notFor:
        "You need a duration timer or stopwatch. Use a timer or stopwatch instead.",
      links: [
        { label: "Epoch / Unix Time Clock", href: "/epoch-unix-time-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Read time in base-16 (practice hex at a glance)",
      description:
        "Keep Hex HH:MM:SS visible and toggle seconds to build intuition for hex ranges, especially 00–17 hours and 00–3B minutes/seconds.",
      forWho: "Anyone practicing hex or working with base-16 representations.",
      notFor:
        "You want a standard digital clock only. Use Digital Clock instead.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Binary Clock", href: "/binary-clock" },
      ],
    },
    {
      title: "Show milliseconds when you need higher precision",
      description:
        "Turn on seconds and then enable ms to show milliseconds in hex (3 digits) with the decimal ms alongside it. Useful for quick, human-readable precision checks.",
      forWho:
        "People who want a slightly more precise “now” snapshot without switching tools.",
      notFor:
        "You need sub-millisecond accuracy or synchronized reference time. This is your device clock.",
      links: [
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
        { label: "Atomic Clock", href: "/atomic-clock" },
      ],
    },
    {
      title: "Hex color clock (#RRGGBB) as a visual time marker",
      description:
        "Switch to Hex color mode to map time into #RRGGBB (RR=hours, GG=minutes, BB=seconds) and copy the current value for a quick “time → color” snapshot.",
      forWho:
        "Designers, creatives, and anyone who likes a simple visual representation of time.",
      notFor:
        "You need color-picking tools or palettes. This is just a time mapping.",
      links: [
        { label: "Minimalist Clock", href: "/minimalist-clock" },
        { label: "Retro Flip Clock", href: "/retro-flip-clock" },
      ],
    },
    {
      title: "Fullscreen display for demos or big screens",
      description:
        "Go fullscreen for a clean, distraction-free display. In fullscreen, clicking the time display copies the timestamp block quickly.",
      forWho:
        "Presentations, live demos, classrooms, or a quick wall-display clock.",
      notFor:
        "You need multiple independent timers on one screen. Use Multiple Timers instead.",
      links: [
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Switch between 12-hour and 24-hour hex output",
      description:
        "Use the 24h toggle (or 1/2 shortcuts) to match what you are sharing. 12-hour mode hex-encodes the converted hour (01–0C) and adds AM/PM.",
      forWho:
        "Anyone who needs the display to match a preference or a shared convention.",
      notFor:
        "You need destination time zone detection. This clock uses your device time zone.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "World Clock", href: "/world-clock" },
      ],
    },
    {
      title: "Compare encodings (hex vs binary vs morse)",
      description:
        "Use this clock alongside other format clocks to compare how the same moment is represented across encodings.",
      forWho:
        "Anyone exploring representations of time for learning or reference.",
      notFor:
        "You want a calculator for time math. Use Time Calculator instead.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Morse Code Clock", href: "/morse-code-clock" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/hexadecimal-clock"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Hexadecimal Clock",
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
            Use this page to view the current time rendered as hex values, copy
            a full timestamp block, toggle 12/24-hour display, and switch into
            hex color mode (#RRGGBB). Fullscreen is built for clean visibility.
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
          <span className="font-semibold text-slate-900">Tip:</span> Press{" "}
          <span className="font-semibold text-slate-900">F</span> for
          fullscreen, <span className="font-semibold text-slate-900">C</span> to
          copy, <span className="font-semibold text-slate-900">S</span> to
          toggle seconds,{" "}
          <span className="font-semibold text-slate-900">M</span> for
          milliseconds (time mode only),{" "}
          <span className="font-semibold text-slate-900">X</span> to switch
          modes, and <span className="font-semibold text-slate-900">Esc</span>{" "}
          to exit fullscreen. If shortcuts do nothing, click the clock card once
          to focus it.
        </div>
      </div>
    </section>
  );
}

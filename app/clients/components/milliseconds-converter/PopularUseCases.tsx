import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   POPULAR USE CASES (MILLISECONDS CONVERTER intent)
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
      title: "Copy-ready conversions for notes, tickets, and docs",
      description:
        "Paste a value, get the exact conversion instantly, then hit Copy to paste a clean line like “1500 ms = 1.5 seconds” into a note, issue, or document.",
      forWho:
        "Anyone who needs a fast, copyable ms ↔ seconds conversion without reformatting.",
      notFor:
        "You need unit math across minutes/hours/days. Use Time Calculator instead.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Work Hours Calculator", href: "/work-hours-calculator" },
      ],
    },
    {
      title: "Frame-time and performance numbers (e.g., 16.67 ms)",
      description:
        "Convert common frame times to seconds (and back) without rounding surprises. Useful when comparing logs, profiling output, or performance notes.",
      forWho:
        "Developers, QA, and anyone working with frame time, latency, or interval values.",
      notFor:
        "You want to measure live time on-screen. Use Stopwatch for that.",
      links: [
        { label: "Stopwatch", href: "/stopwatch" },
        { label: "Countdown Timer", href: "/countdown-timer" },
      ],
    },
    {
      title: "Spreadsheet cleanup (commas and odd formats)",
      description:
        "Paste values like “1,500” or “12.” or “.5”. The tool normalizes the number and gives a clean output you can copy back into a sheet.",
      forWho:
        "Anyone cleaning pasted numeric data from spreadsheets, reports, or chat logs.",
      notFor:
        "You need to convert time zones or dates. Use Time Zone Converter instead.",
      links: [
        { label: "Time Zone Converter", href: "/time-zone-converter" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Round-trip checks (ms → s → ms)",
      description:
        "Use the two-way mode to verify you’re using the right unit. Convert in one direction, flip the tab, and confirm you get the same value back.",
      forWho:
        "Anyone double-checking unit assumptions in configuration, logs, or API values.",
      notFor:
        "You need a long-form explanation of time units. This page stays conversion-first.",
      links: [
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Quick timing workflow (convert, then run a timer)",
      description:
        "Convert a duration into the unit you need, then jump straight into a timer or stopwatch to use it.",
      forWho:
        "Anyone who converts a number and immediately needs to time something.",
      notFor: "You need multiple timers at once. Use Multiple Timers instead.",
      links: [
        { label: "Online Timer", href: "/online-timer" },
        { label: "Multiple Timers", href: "/multiple-timers" },
      ],
    },
    {
      title: "Simple references (1000 ms = 1 s)",
      description:
        "Use the built-in examples to quickly populate common conversions like 1000 ↔ 1, 500 ↔ 0.5, and 100 ↔ 0.1 without typing.",
      forWho: "Anyone who just needs common values fast and copyable.",
      notFor: "You need scheduling or clock views. Use a clock route instead.",
      links: [
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
  ];

  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  // Keep UI links relative (Remix-friendly), schema uses absolute URLs for this page
  const schemaList = scenarios.map((s) => ({
    title: s.title,
    primaryUrl: abs("/milliseconds-converter"),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common ways to use the Milliseconds Converter",
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

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Convert milliseconds (ms) and seconds (s) instantly. Switch
            directions, tap examples, and copy a clean conversion line without
            rounding surprises.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="ilt-surface-card p-4"
            >
              <div className="text-base font-semibold text-[var(--ilt-text-primary)]">
                {s.title}
              </div>
              <div className="mt-1 text-sm leading-relaxed text-[var(--ilt-text-secondary)]">
                {s.description}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    For
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.forWho}</div>
                </div>

                <div className="ilt-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ilt-text-secondary)]">
                    Not for
                  </div>
                  <div className="mt-1 text-[var(--ilt-text-secondary)]">{s.notFor}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link
                    key={`${s.title}-${l.href}`}
                    to={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> Use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Copy</span> to grab a
          full conversion line you can paste anywhere. Use{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Reset</span> to return
          to <span className="font-semibold text-[var(--ilt-text-primary)]">1000 ms</span> ↔{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">1 s</span>.
        </div>
      </div>
    </section>
  );
}

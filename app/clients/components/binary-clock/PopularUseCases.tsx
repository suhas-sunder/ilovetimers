import { JsonLd } from "./HowItWorks";

/* =========================================================
   2) POPULAR USE CASES (scenario-first, not a tool directory)
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
      title: "See the current time in binary (quick glance)",
      description:
        "Open the page and immediately see your local time rendered as binary, with a readable layout.",
      forWho:
        "Anyone who wants a binary time display without setup, accounts, or distractions.",
      notFor:
        "If you need a time zone conversion or a reference time source. Use World Clock, UTC Clock, or Time Zone Converter.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Digital Clock", href: "/digital-clock" },
        { label: "Current Local Time", href: "/current-local-time" },
      ],
    },
    {
      title: "Use BCD when you want digit-by-digit clarity",
      description:
        "BCD shows each decimal digit of HH:MM(:SS) as 4 bits, so it stays aligned to familiar clock digits.",
      forWho:
        "Anyone who wants to read binary time without re-learning how the digits map to hours and minutes.",
      notFor:
        "If you want the hour/minute/second values as true binary numbers. Use Pure mode.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Hexadecimal Clock", href: "/hexadecimal-clock" },
        { label: "Morse Code Clock", href: "/morse-code-clock" },
      ],
    },
    {
      title: "Use pure binary when you want real binary values",
      description:
        "Pure mode converts hours, minutes, and seconds into binary numbers (bit widths sized for the field).",
      forWho:
        "Anyone who wants the cleanest “real binary number” representation of time fields.",
      notFor:
        "If you want one 4-bit group per decimal digit (00–09 per digit). That’s BCD mode.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Epoch / Unix Time Clock", href: "/epoch-unix-time-clock" },
        { label: "UTC Clock", href: "/utc-clock" },
      ],
    },
    {
      title: "Hide seconds for a calmer display",
      description:
        "Turn seconds off to reduce motion and keep the display stable while still updating cleanly on minute changes.",
      forWho:
        "Desk displays, focus sessions, or any setup where constant second-ticking is distracting.",
      notFor:
        "If you need a stopwatch-style view or elapsed time tracking. Use Stopwatch or Count Up Timer.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Minimalist Clock", href: "/minimalist-clock" },
        { label: "Pomodoro Timer", href: "/pomodoro-timer" },
      ],
    },
    {
      title: "Run a fullscreen wall display (presentation / stream)",
      description:
        "Use fullscreen mode for a clean, readable binary clock that works well at a distance.",
      forWho:
        "Presentations, streaming overlays, classrooms, or a second monitor wall clock.",
      notFor:
        "If you want a generic fullscreen timer with duration controls. Use Fullscreen Timer.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Fullscreen Timer", href: "/fullscreen-timer" },
        { label: "Presentation Timer", href: "/presentation-timer" },
      ],
    },
    {
      title: "Copy a shareable snapshot of the current moment",
      description:
        "Copy captures a compact text snapshot including time, date, timezone label, binary output, and ISO timestamp.",
      forWho:
        "Notes, logs, chats, or anywhere you want to paste the binary representation of “right now.”",
      notFor:
        "If you need a permalink to a specific time. This page is designed for “now,” not historical lookup.",
      links: [
        { label: "Binary Clock", href: "/binary-clock" },
        { label: "Time Calculator", href: "/time-calculator" },
        { label: "Milliseconds Converter", href: "/milliseconds-converter" },
      ],
    },
  ];

  // Build absolute URLs for schema + rendering
  const abs = (href: string) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;
  const list = scenarios.map((s) => ({
    ...s,
    links: s.links.map((l) => ({ ...l, href: abs(l.href) })),
  }));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Common binary clock scenarios",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: s.links[0]?.href,
    })),
  };

  return (
    <section className="space-y-4">
      <JsonLd data={itemListLd} />

      <div className="ilt-surface-card p-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ilt-text-primary)]">
            Common scenarios
          </h2>
          <p className="mt-1 text-sm text-[var(--ilt-text-muted)]">
            Use this page when you want a binary view of the current local time.
            Choose BCD for digit-by-digit readability, or pure mode for true
            binary number fields.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
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
                  <a
                    key={l.href}
                    href={l.href}
                    className="cursor-pointer ilt-inline-pill px-3 py-1.5 text-sm font-semibold text-[var(--ilt-text-primary)] transition hover:bg-[var(--ilt-bg-hover)]"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 ilt-surface-muted p-4 text-sm text-[var(--ilt-text-secondary)]">
          <span className="font-semibold text-[var(--ilt-text-primary)]">Tip:</span> If you want
          the most readable binary view, start with{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">BCD</span> and turn{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">seconds off</span>. If
          you want “real binary numbers,” switch to{" "}
          <span className="font-semibold text-[var(--ilt-text-primary)]">Pure</span> mode.
        </div>
      </div>
    </section>
  );
}

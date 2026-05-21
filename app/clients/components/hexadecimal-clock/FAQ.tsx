import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
};

export default function FAQ({
  items,
  id = "faq",
  title = "Frequently Asked Questions",
}: {
  items?: FaqItem[];
  id?: string;
  title?: string;
}) {
  // Hexadecimal Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Hexadecimal Clock do?",
      answer:
        "It shows the current local time rendered as hexadecimal values. You can toggle seconds and milliseconds, switch between 12-hour and 24-hour display, copy a full timestamp block (hex, decimal, date, ISO), and use fullscreen for a clean display. It also includes a hex color mode that maps time to #RRGGBB.",
    },
    {
      question: "What format does the hex time use?",
      answer:
        "In Hex HH:MM:SS mode, hours/minutes/seconds are shown as uppercase hex with fixed widths (2 digits each). In 24-hour mode, hours range from 00 to 17 (0–23 decimal). Minutes and seconds range from 00 to 3B (0–59 decimal).",
    },
    {
      question: "How does 12-hour mode work with hex?",
      answer:
        "In 12-hour mode, the clock converts the hour to 1–12 first, then renders that value in hex (01–0C) and adds an AM/PM suffix. Minutes and seconds remain normal base-10 values converted into hex.",
    },
    {
      question: "Why is the milliseconds toggle sometimes disabled?",
      answer:
        "Milliseconds are only available when seconds are shown and you are in Hex HH:MM:SS mode. If seconds are off, milliseconds are disabled to avoid showing false precision. If you switch to Hex color mode, milliseconds are turned off as well.",
    },
    {
      question: "What does Copy include?",
      answer:
        "Copy writes a multi-line snapshot: the hex output (and ms when enabled), the decimal time with your local time zone, the formatted date, and an ISO timestamp (UTC). This makes it easy to paste a complete, unambiguous timestamp anywhere.",
    },
    {
      question: "What time zone is being used?",
      answer:
        "The displayed decimal time is your device’s local time zone. The copy block also includes an ISO timestamp in UTC, so shared output has a clear timestamp.",
    },
    {
      question: "How does hex color mode work?",
      answer:
        "Hex color mode displays #RRGGBB where RR is the hour (24-hour value), GG is minutes, and BB is seconds, all encoded as two-digit hex. If seconds are hidden, BB is set to 00.",
    },
    {
      question: "Does this page support fullscreen and shortcuts?",
      answer:
        "Yes. Press F to toggle fullscreen and Esc to exit fullscreen. Press C to copy, S to toggle seconds, M to toggle milliseconds (time mode only), X to toggle between time and color mode, 1 for 12-hour, and 2 for 24-hour. If shortcuts do not work, click/tap the clock card once so it has focus.",
    },
    {
      question: "Why does the clock update at different speeds?",
      answer:
        "The refresh rate adapts to your settings. When milliseconds are on, it updates more frequently to feel responsive. With seconds on, it updates several times per second, and with seconds off it updates much less often to reduce CPU usage.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Want a different encoding?{" "}
          <Link
            to="/binary-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Binary Clock
          </Link>{" "}
          or{" "}
          <Link
            to="/morse-code-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Morse Code Clock
          </Link>
          . Need UTC specifically?{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . Need local time context for places?{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>{" "}
          or{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . Need a timestamp format for systems/logs?{" "}
          <Link
            to="/epoch-unix-time-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Epoch / Unix Time Clock
          </Link>
          .
        </>
      ),
    },
  ];

  const faqs = items?.length ? items : defaults;

  // JSON-LD must be string-only; strip React nodes if any custom items are passed.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => typeof f.answer === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer as string },
      })),
  };

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)]">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-[var(--ilt-text-secondary)]">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

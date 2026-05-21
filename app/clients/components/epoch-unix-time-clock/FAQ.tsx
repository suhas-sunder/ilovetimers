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
  // Unix Time Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Unix Time Clock do?",
      answer:
        "It shows the current Unix epoch timestamp in both seconds and milliseconds, plus a local and UTC date-time display for quick verification. You can copy either value instantly, freeze the clock to hold a stable timestamp, snap once while frozen, and use fullscreen for a large, clean seconds display.",
    },
    {
      question: "What’s the difference between seconds and milliseconds?",
      answer:
        "Both represent the same moment in time. Seconds is the Unix timestamp most APIs and logs use. Milliseconds is the same value multiplied by 1,000 and is common in JavaScript and some event/telemetry systems.",
    },
    {
      question: "Why does the page show local time and UTC time too?",
      answer:
        "The epoch timestamp itself is timezone-independent. Local and UTC are shown so you can quickly confirm the human-readable time in both formats and avoid timezone-related mistakes when debugging or copying timestamps.",
    },
    {
      question: "How do I copy the timestamp?",
      answer:
        "Use Copy seconds or Copy milliseconds. In fullscreen, use Copy s / Copy ms in the top bar. You can also use shortcuts: C copies seconds and M copies milliseconds.",
    },
    {
      question: "What do Live, Frozen, and Snap mean?",
      answer:
        "Live updates continuously. Frozen holds the current values steady so they do not change while you copy or compare. Snap updates to the current time once while staying frozen.",
    },
    {
      question: "How do I freeze or unfreeze the clock?",
      answer:
        "Toggle Live on/off, or press Space. In fullscreen, you can also tap/click the main display to toggle Live or Freeze.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen or press F. Press Esc to exit. Fullscreen gives you a larger seconds display and a top bar with quick actions (Freeze/Live, Copy s, Copy ms, Snap).",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space toggles Live/Frozen · C copies seconds · M copies milliseconds · N snaps now (updates once) · F toggles fullscreen · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question: "Is the value perfectly accurate?",
      answer:
        "It reflects your device clock and browser timing. For most uses (copying “now” for logs, debugging, testing), it’s sufficient. If your device clock is off, the timestamp will be off too.",
    },
    {
      question: "Can I keep this open in the background?",
      answer:
        "Yes, but browsers may throttle background tabs to save power, so updates can appear less smooth. If you need a stable value, use Frozen mode before copying.",
    },
    {
      question: "Which related tools should I use instead?",
      answer: (
        <>
          If you want a standard clock view, use{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>{" "}
          or{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>
          . For time zone math, use{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . If you’re working with durations, try{" "}
          <Link
            to="/milliseconds-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Milliseconds Converter
          </Link>{" "}
          or{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
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
    <section id={id} className="space-y-4">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)] ilt-surface-card">
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

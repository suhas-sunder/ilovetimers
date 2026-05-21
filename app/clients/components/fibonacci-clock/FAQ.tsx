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
  // Fibonacci Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Fibonacci Clock do?",
      answer:
        "It shows the current time using Fibonacci-sized tiles (1, 1, 2, 3, 5) and also displays the standard digital time (HH:MM:SS). You can switch time zones, explore a time manually, go fullscreen, and copy a breakdown of the tile sums.",
    },
    {
      question: "What is “Fibonacci time” on this page?",
      answer:
        "Fibonacci time is shown as HH:MM where minutes are displayed in 5-minute steps. The colored tiles indicate which Fibonacci numbers add up to the hour value and which add up to the minutes value (in 5s).",
    },
    {
      question: "Why do minutes round to the nearest 5?",
      answer:
        "This clock represents minutes using the same Fibonacci tiles as hours. To make that work reliably, minutes are rounded to the nearest 5-minute step before being mapped to the tiles. The Rounding message on the page shows what happened for the current moment.",
    },
    {
      question: "What happens if minutes round up to :60?",
      answer:
        "If the current minutes round up to 60, the clock carries the hour forward by +1 and displays minutes as :00. This is shown in the Rounding message and the Fibonacci time display.",
    },
    {
      question: "How do I switch time zones?",
      answer:
        "Use the Zone selector. Local (device) uses your current device time zone, and other options use standard IANA time zones (for example, America/New_York or Asia/Tokyo). The digital time and the Fibonacci tiles update to match the selected zone.",
    },
    {
      question: "What is Explore mode?",
      answer:
        "Explore mode lets you type any hour (0–23) and minute (0–59) to see how that time maps onto the Fibonacci tiles. In Explore mode, seconds are set to 0 to keep the display stable while you experiment.",
    },
    {
      question: "What do the tile colors mean?",
      answer:
        "Red tiles count toward the hour sum, green tiles count toward the minutes sum (in 5s), blue tiles count for both hours and minutes, and white tiles count for neither. The legend under the board matches these colors.",
    },
    {
      question: "How do I copy the output?",
      answer:
        "Press Copy (or C) to copy a text block that includes Fibonacci time, the standard digital time for the selected zone, the rounding note, and the tile sums used for hours and minutes.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "F toggles fullscreen · C copies the output · L switches to Live · E switches to Explore · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Click Fullscreen or press F. Press Esc to exit. Fullscreen is meant for a clean, readable display and keeps the key controls available at the top and bottom bars.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          If you want a standard clock with multiple zones, use{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . If you need a clean reference clock, use{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . If you want to convert times between zones, use{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . For a classic display, use{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>{" "}
          or{" "}
          <Link
            to="/analog-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Analog Clock
          </Link>
          . For another “coded” clock style, try{" "}
          <Link
            to="/binary-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Binary Clock
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

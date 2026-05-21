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
  // Military Time Converter defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this military time converter do?",
      answer:
        "It converts military time (24-hour time) to standard time (AM/PM) and converts standard time back to military time. Type in either box and the other side updates automatically when your input is valid.",
    },
    {
      question: "What military time formats can I enter?",
      answer:
        "You can enter 1730, 0730, 0000, or 2400, and you can also use a colon format like 17:30 or 5:30. If you enter only hours (like 17 or 5), minutes default to 00.",
    },
    {
      question: "Is 2400 valid, and what does it mean?",
      answer:
        "Yes. 2400 is commonly used to mean midnight at the end of the day. This converter treats 2400 as 00:00 (12:00 AM) and shows a note so you know how it was interpreted.",
    },
    {
      question: "What are the most common AM/PM edge conversions?",
      answer:
        "12:00 AM is 00:00, 12:00 PM is 12:00, 1:05 PM is 13:05, 00:00 is 12:00 AM, and 23:59 is 11:59 PM.",
    },
    {
      question: "What standard time formats can I enter?",
      answer:
        "Enter a time with AM or PM, like 5 PM, 5:30 PM, 12 AM, or 12:05 am. Minutes are optional and default to 00 if omitted.",
    },
    {
      question: "Why isn’t my standard time converting?",
      answer:
        "Standard time must include AM or PM. If you type 5:30 without a suffix, the converter won’t guess. Add AM or PM and it will convert immediately.",
    },
    {
      question: "What ranges are considered valid?",
      answer:
        "For military time, hours must be 0–23 and minutes must be 00–59 (2400 is also accepted for midnight). For standard time, hours must be 1–12 and minutes must be 00–59, with AM or PM included.",
    },
    {
      question: "What does “Normalized” mean in the results?",
      answer:
        "Normalized shows your input in a clean, consistent format. For example, if you enter 17:3 or 5:3 PM, the converter normalizes minutes to two digits (17:03 or 5:03 PM) so it’s easier to read and copy.",
    },
    {
      question: "How do I copy the result quickly?",
      answer:
        "Use the Copy button to copy the current result. In fullscreen, you can also click or tap the large result display to copy instantly.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "N fills the current time. C copies the AM/PM result. M copies the military result. R clears both inputs. F toggles fullscreen. Esc exits fullscreen. Shortcuts are ignored while typing in the input boxes.",
    },
    {
      question: "Does this work with the current time in my location?",
      answer:
        "Yes. Use “Use current time” (or press N) to fill both boxes with your current local time in military and standard formats.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Converting between places too?{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . Need a quick reference clock?{" "}
          <Link
            to="/atomic-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Atomic Clock
          </Link>
          . Want the time right now with a clean display?{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
          </Link>
          . Doing time math (add/subtract durations)?{" "}
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
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
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

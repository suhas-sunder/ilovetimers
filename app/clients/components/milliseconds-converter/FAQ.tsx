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
  // Milliseconds Converter defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this milliseconds converter do?",
      answer:
        "It converts milliseconds (ms) to seconds (s) and converts seconds back to milliseconds. Choose a direction, paste a value, and the result updates instantly when your input is valid.",
    },
    {
      question: "What’s the basic conversion between milliseconds and seconds?",
      answer:
        "1 second equals 1000 milliseconds. To convert ms → seconds, divide by 1000. To convert seconds → ms, multiply by 1000.",
    },
    {
      question: "What number formats can I enter?",
      answer:
        "You can enter signed decimals like 1000, 12., .5, -250, 0.01667, or +10.2. Commas in pasted values are also accepted (for example 1,500).",
    },
    {
      question: "Why does the output look “cleaned up”?",
      answer:
        "The converter normalizes values so they’re easier to read and copy. It removes unnecessary trailing zeros and avoids showing awkward formats (for example 001.5000 becomes 1.5).",
    },
    {
      question: "Does this tool round values?",
      answer:
        "No. Conversions are performed by shifting the decimal point (×1000 or ÷1000) to avoid floating-point rounding. The result preserves meaningful decimals and only trims unnecessary trailing zeros.",
    },
    {
      question: "Why isn’t my value converting?",
      answer:
        "The input must be a valid number. If you pasted currency symbols, letters, or multiple decimal points, the converter will treat it as invalid. Remove non-numeric characters (other than +, -, and .) and try again.",
    },
    {
      question: "Can I convert negative values?",
      answer:
        "Yes. Negative values are allowed and convert normally (for example -250 ms becomes -0.25 seconds).",
    },
    {
      question: "How do I copy the result quickly?",
      answer:
        "Click Copy to copy a full conversion line (for example “1500 ms = 1.5 seconds”). This is useful for pasting into notes, tickets, docs, or spreadsheets without reformatting.",
    },
    {
      question: "Do the quick examples change both boxes?",
      answer:
        "Yes. Tapping an example populates both inputs so you can immediately copy or tweak the values without typing.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Doing time math (add/subtract durations, mixed units)?{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
          </Link>
          . Timing something live?{" "}
          <Link
            to="/stopwatch"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Stopwatch
          </Link>
          . Need more than one timer running?{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . Converting time zones too?{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
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

      <h2 className="text-2xl font-semibold text-sky-700">{title}</h2>

      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-slate-900 hover:bg-slate-50">
              {f.question}
            </summary>
            <div className="px-5 pb-4 leading-relaxed text-slate-700">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

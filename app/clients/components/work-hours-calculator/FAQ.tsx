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
  // Work Hours Calculator defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does the Work Hours Calculator do?",
      answer:
        "It calculates your paid work time from a start time and end time, subtracts a break in minutes, and shows the result as HH:MM and decimal hours. It also supports overnight shifts when your end time is earlier than your start time.",
    },
    {
      question: "How do I calculate paid hours with a break?",
      answer:
        "Enter your Start time and End time, then enter your break length in minutes. The calculator subtracts the break from the total shift length and shows your paid time.",
    },
    {
      question: "Does it support overnight shifts?",
      answer: (
        <>
          Yes. If your <strong className="text-slate-900">End time</strong> is
          earlier than your{" "}
          <strong className="text-slate-900">Start time</strong>, the tool
          assumes the shift continues into the next day and labels the result as{" "}
          <strong className="text-slate-900">Overnight</strong>.
        </>
      ),
    },
    {
      question: "What do the results mean: Paid time, Total shift, and Break?",
      answer:
        "Total shift is the full time between start and end. Break is the minutes you subtract. Paid time is Total shift minus Break (and it’s the number you typically use for payroll or timesheets).",
    },
    {
      question: "Can I round the paid time?",
      answer: (
        <>
          Yes. Use <strong className="text-slate-900">Round paid time</strong>{" "}
          to round to the nearest <strong className="text-slate-900">5</strong>,{" "}
          <strong className="text-slate-900">10</strong>, or{" "}
          <strong className="text-slate-900">15</strong> minutes. Rounding
          applies to{" "}
          <strong className="text-slate-900">paid time after breaks</strong>.
        </>
      ),
    },
    {
      question: "How do decimal hours work here?",
      answer:
        "Decimal hours are the paid minutes divided by 60 (for example, 7:30 becomes 7.50 hours). You can control how many decimal places are shown (0 to 4).",
    },
    {
      question: "What happens if my break is longer than my shift?",
      answer:
        "The calculator will show an error. Break time can’t be longer than the total shift length.",
    },
    {
      question: "What do the “Now” buttons do?",
      answer: (
        <>
          <strong className="text-slate-900">Now</strong> sets Start or End to
          your current device time. It’s useful when you’re clocking in or out
          and want the exact time quickly.
        </>
      ),
    },
    {
      question: "What does Copy do?",
      answer:
        "Copy lets you copy either a compact paid-time string (HH:MM plus decimal hours) or a fuller summary that includes shift length, break minutes, and overnight status when applicable.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-slate-900">S</strong>: set Start to now ·{" "}
            <strong className="text-slate-900">E</strong>: set End to now ·{" "}
            <strong className="text-slate-900">C</strong>: copy paid time ·{" "}
            <strong className="text-slate-900">R</strong>: reset
          </div>
          <div className="text-sm text-slate-600">
            Tip: click the calculator card once so it captures keyboard input.
            Shortcuts are ignored while you are typing in an input field.
          </div>
        </div>
      ),
    },
    {
      question: "Does this page send my times anywhere?",
      answer:
        "No. The calculator runs locally in your browser. This page does not send your times or settings anywhere.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Need to add up multiple time blocks?{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
          </Link>
          . Tracking billable formatting and totals?{" "}
          <Link
            to="/billable-hours-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Billable Hours Calculator
          </Link>
          . Want a live clock while you log time?{" "}
          <Link
            to="/current-local-time"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Current Local Time
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

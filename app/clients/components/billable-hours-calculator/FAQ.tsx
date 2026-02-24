import { JsonLd } from "./HowItWorks";

/* =========================================================
   5) FAQ (SEO + UX)
   Schema: FAQPage (use on homepage or tool pages)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string;
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
  // Billable-hours-calculator defaults (start/end + breaks + rounding + total)
  const defaults: FaqItem[] = [
    {
      question: "What does this billable hours calculator do?",
      answer:
        "It calculates billable time and a total amount based on a start time, end time, break minutes, and an hourly rate. You can also apply a common billing rounding increment.",
    },
    {
      question: "How is the total amount calculated?",
      answer:
        "Total = (billable minutes ÷ 60) × hourly rate. Billable minutes are the shift duration minus breaks, and may be rounded up if a rounding increment is selected.",
    },
    {
      question: "Does this support overnight shifts?",
      answer:
        "Yes. If the end time is earlier than the start time, the calculator treats it as crossing midnight and computes the duration accordingly.",
    },
    {
      question: "How does rounding work?",
      answer:
        "Rounding is applied after breaks are subtracted. If a rounding increment is selected, billable minutes are rounded up to the next increment (for example, rounding to 10 minutes). Select “None” to disable rounding.",
    },
    {
      question: "What does “Before rounding” mean?",
      answer:
        "It shows billable time after breaks are deducted, but before any rounding increment is applied. This helps you verify what rounding changed.",
    },
    {
      question: "Do decimal places affect the total?",
      answer:
        "No. Decimal places only control how billable hours are displayed. The total amount is always calculated from billable minutes (after rounding).",
    },
    {
      question: "Does the calculator handle taxes, fees, or retainers?",
      answer:
        "No. It computes time and an hourly total only. It does not add taxes, apply fees, handle retainers, or generate invoices.",
    },
    {
      question: "Does selecting a currency convert amounts?",
      answer:
        "No. Currency selection formats the displayed rate and totals. It does not perform exchange-rate conversion.",
    },
    {
      question: "Can I copy or print the result?",
      answer:
        "Yes. Use Copy to copy a one-line summary including billable time, rate, and total. Use Print to open your browser’s print dialog for saving as a PDF.",
    },
    {
      question: "Why does it say “Fix inputs”?",
      answer:
        "This appears when required inputs are missing or inconsistent, such as a missing time, an end time that doesn’t create a valid duration, or break minutes that exceed the shift length.",
    },
  ];

  const faqs = items?.length ? items : defaults;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
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
            <div className="px-5 pb-4 text-slate-700 leading-relaxed">
              {/* Keep answers as plain text for schema consistency.
                  If you later want clickable links, pass custom items via props. */}
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

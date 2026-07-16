import { JsonLd } from "./HowItWorks";

export type FaqItem = {
  question: string;
  answer: string;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "What does the Work Hours Calculator calculate?",
    answer:
      "It finds one shift's elapsed time, subtracts the entered unpaid break, and shows paid time as hours and minutes plus decimal hours.",
  },
  {
    question: "Can a shift cross midnight?",
    answer:
      "Yes. When the end time is earlier than the start time, the calculator treats the end as occurring on the following day and labels the shift overnight.",
  },
  {
    question: "How are breaks deducted?",
    answer:
      "Break minutes are subtracted from the full shift before rounding. A break longer than the shift produces an error and no paid-time result.",
  },
  {
    question: "How does rounding work?",
    answer:
      "No rounding is the default. When selected, paid minutes after the break are rounded to the nearest 5, 10, or 15 minutes.",
  },
  {
    question: "What are decimal hours?",
    answer:
      "Decimal hours are paid minutes divided by 60. For example, 7 hours 30 minutes is 7.5 decimal hours; display precision does not change the underlying minutes.",
  },
  {
    question: "Does this calculate overtime or payroll?",
    answer:
      "No. It applies no overtime threshold, wage rule, tax rule, or employment policy and is not payroll, legal, or official recordkeeping advice.",
  },
  {
    question: "What do the Now buttons use?",
    answer:
      "Now fills a field from the device's current local clock. It is an input convenience, not a verified attendance record.",
  },
  {
    question: "What can I copy?",
    answer:
      "You can copy paid time alone or a summary with the shift length, break minutes, and overnight status when applicable.",
  },
];

export default function FAQ({
  items,
  id = "faq",
  title = "Frequently Asked Questions",
}: {
  items?: FaqItem[];
  id?: string;
  title?: string;
}) {
  const faqs = items?.length ? items : DEFAULT_FAQS;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 pb-8">
      <JsonLd data={faqLd} />
      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>
      <div className="mt-4 grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary className="cursor-pointer py-2 font-medium text-[var(--ilt-text-primary)] ilt-focus-ring">
              {faq.question}
            </summary>
            <p className="pb-2 leading-relaxed text-[var(--ilt-text-secondary)]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

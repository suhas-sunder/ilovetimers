import { JsonLd } from "./HowItWorks";

export type FaqItem = {
  question: string;
  answer: string;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "What does this billable hours calculator do?",
    answer:
      "It subtracts break minutes from one start-to-end time span, optionally rounds the billable minutes up, and multiplies the result by the entered hourly rate.",
  },
  {
    question: "How is the subtotal calculated?",
    answer:
      "The subtotal is billable minutes divided by 60, multiplied by the hourly rate. It is arithmetic only and does not add taxes, fees, retainers, or invoice adjustments.",
  },
  {
    question: "Does this support an overnight shift?",
    answer:
      "Yes. An end time earlier than the start time is treated as occurring on the next day. Equal start and end times do not represent a full-day shift.",
  },
  {
    question: "How does rounding work?",
    answer:
      "Rounding is applied after breaks are subtracted. A selected increment rounds billable minutes up to the next increment; choose None to keep the entered-minute total.",
  },
  {
    question: "What happens when an input is incomplete or invalid?",
    answer:
      "The result shows a specific input error. A break longer than the shift is invalid, and missing start or end times cannot be totalled.",
  },
  {
    question: "Does selecting a currency convert the amount?",
    answer:
      "No. The currency choice only formats the displayed rate and subtotal. No exchange-rate conversion occurs.",
  },
  {
    question: "Is this a payroll, accounting, or legal calculator?",
    answer:
      "No. It does not determine payroll, overtime, taxes, accounting treatment, invoicing requirements, employment-law compliance, or recordkeeping obligations.",
  },
  {
    question: "Can I copy or print the result?",
    answer:
      "Yes. Copy creates a concise summary and Print opens the browser print dialog. Review the values before using the result elsewhere.",
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
    <section id={id} className="mx-auto max-w-7xl px-4 pb-6">
      <JsonLd data={faqLd} />
      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary className="cursor-pointer py-2 font-medium text-[var(--ilt-text-primary)] underline-offset-4 hover:underline focus-visible:underline">
              {faq.question}
            </summary>
            <div className="pb-2 leading-relaxed text-[var(--ilt-text-secondary)]">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

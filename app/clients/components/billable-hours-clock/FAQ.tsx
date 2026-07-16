import { JsonLd } from "./HowItWorks";

export type FaqItem = {
  question: string;
  answer: string;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "What does the billable hours clock do?",
    answer:
      "It tracks elapsed browser time for multiple named timers, applies an optional upward rounding increment, and shows a rate-based subtotal for each timer.",
  },
  {
    question: "How is the subtotal calculated?",
    answer:
      "The subtotal is billable time in hours multiplied by the entered hourly rate. It is arithmetic only and does not add taxes, fees, retainers, or invoice adjustments.",
  },
  {
    question: "How does rounding work?",
    answer:
      "Choose None, 6 minutes, 10 minutes, or 15 minutes. When enabled, elapsed time is rounded up to the next selected increment.",
  },
  {
    question: "How are breaks handled?",
    answer:
      "There is no separate break deduction. Pause the active timer to exclude a break, or use the visible adjustment controls when you need to correct elapsed time.",
  },
  {
    question: "Can I run multiple timers?",
    answer:
      "Yes. Each timer can have its own name, note, rate, currency label, rounding setting, and elapsed time. The page does not detect overlapping work across timers.",
  },
  {
    question: "How do totals work across currencies?",
    answer:
      "Totals are grouped by currency label. No exchange-rate conversion is performed, so amounts in different currencies are not combined into one converted value.",
  },
  {
    question: "Are my timers saved?",
    answer:
      "Yes. Timers are saved in this browser on this device. Clearing site data or switching browsers or devices removes that continuity.",
  },
  {
    question: "What happens if the page becomes hidden?",
    answer:
      "A running timer is paused when the page becomes hidden. Return to the page and resume it when you are ready to keep tracking.",
  },
  {
    question: "Can I copy or print timers?",
    answer:
      "Yes. Copy exports a text summary that may include the entered name and note. Print uses the browser print dialog. Review private text before copying, printing, or sharing it.",
  },
  {
    question: "What keyboard shortcuts are supported?",
    answer:
      "After focusing the tool: Space starts or pauses the active timer, R resets it, C copies it, A adds a timer, F toggles fullscreen, and P prints the active timer.",
  },
  {
    question: "Is this a payroll, accounting, or legal timekeeping system?",
    answer:
      "No. It does not determine payroll, overtime, taxes, accounting treatment, invoicing requirements, employment-law compliance, or official recordkeeping.",
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

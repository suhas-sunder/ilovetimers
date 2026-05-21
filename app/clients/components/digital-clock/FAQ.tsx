import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
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
  // Digital Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Digital Clock do?",
      answer:
        "It shows your current local time in a big, readable display. You can toggle seconds, switch between 12-hour and 24-hour time, go fullscreen for distance viewing, and copy the current time.",
    },
    {
      question: "Is this showing my local time or an internet/atomic time?",
      answer:
        "This page shows your device’s local time and detected timezone. If your device time is wrong, the clock will be wrong. For a standardized reference, use the UTC Clock or Atomic Clock.",
    },
    {
      question: "How do I switch between 12-hour and 24-hour time?",
      answer:
        "Use the 24-hour toggle on the page. You can also use the keyboard: press 1 for 12-hour and 2 for 24-hour.",
    },
    {
      question: "How do I show or hide seconds?",
      answer:
        "Use the Seconds toggle. You can also press S on your keyboard to toggle seconds.",
    },
    {
      question: "How do I go fullscreen?",
      answer: "Click Fullscreen, or press F. Press Esc to exit fullscreen.",
    },
    {
      question: "How do I copy the current time?",
      answer:
        "Click Copy or press C. In fullscreen, you can click/tap the time display to copy quickly.",
    },
    {
      question: "What exactly gets copied?",
      answer:
        "Copy includes the displayed time, your timezone, the date, and an ISO timestamp. This makes it easy to paste a clear time reference into notes, chat, or logs.",
    },
    {
      question: "Why don’t keyboard shortcuts work until I click the clock?",
      answer:
        "Shortcuts work when the clock card has focus. Click/tap the clock once, then use F for fullscreen, C to copy, S for seconds, and 1/2 for 12/24-hour.",
    },
    {
      question: "Does the clock update precisely on the second?",
      answer:
        "Yes. When seconds are shown, it updates on the next second boundary. When seconds are hidden, it updates close to the start of each minute to avoid drift.",
    },
    {
      question: "Which related time tools should I use instead?",
      answer:
        "Use World Clock for multiple cities, Time Zone Converter to plan calls across zones, UTC Clock for UTC time, or Atomic Clock for a network-synced reference display.",
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

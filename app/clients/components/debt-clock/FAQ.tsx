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
  // Debt Clock defaults (unique, page-specific)
  const defaults: FaqItem[] = [
    {
      question: "Is this an official debt feed or just an estimate?",
      answer:
        "It’s an estimate. The counter is calculated from a starting amount and an average yearly change rate (either from a preset or your custom inputs). It does not automatically fetch official government or institutional totals.",
    },
    {
      question: "What do the presets represent?",
      answer:
        "Presets are quick starter settings (currency, starting debt, yearly change, and an “as of” label). In this build they’re demo placeholders, so treat them as examples and replace them with your own numbers or sources if you need accuracy.",
    },
    {
      question: "What does “Starting debt” mean?",
      answer:
        "It’s the baseline amount the counter starts from. When you press Reset, the counter snaps back to this number and then begins changing again based on the rate.",
    },
    {
      question: "What does “Yearly change” mean?",
      answer:
        "It’s the average net change per year. If it’s positive, the counter increases. If it’s negative, the counter decreases. The tool converts this yearly change into a per-second rate for the running counter.",
    },
    {
      question: "Why does the counter show a per-second rate with decimals?",
      answer:
        "A yearly change rarely divides into clean whole dollars per second. The per-second display may show decimals for readability, while the main counter is formatted as a currency total.",
    },
    {
      question: "What does the “As of” label do?",
      answer:
        "It’s a note for humans, not an input to the math. Use it to record where your starting value and rate came from (for example: “Source X, 2026-01-15”). It also appears in the copied snapshot.",
    },
    {
      question: "Why does changing the rate not “jump” the number?",
      answer:
        "When you change the yearly rate while the counter is running, the tool keeps continuity from the current displayed amount and applies the new rate going forward. It does not rewind or recalculate past time.",
    },
    {
      question: "Why don't the keyboard shortcuts work until I click the tool?",
      answer:
        "Shortcuts only work when the debt clock display has focus. Click or tap the display once, then use Space to start/pause, R to reset, F for fullscreen, and C to copy.",
    },
    {
      question: "What exactly gets copied when I press Copy?",
      answer:
        "The copied text includes the preset name, your “as of” label, the current estimated total, the starting debt, the yearly change, the per-second rate, and a short disclosure that it’s an estimate.",
    },
    {
      question: "Why might Copy fail or do nothing sometimes?",
      answer:
        "Some browsers restrict clipboard access unless a user gesture happens first. Click or tap the page once and try Copy again, or use the C shortcut after focusing the debt clock display.",
    },
    {
      question: "What’s the fastest way to use this on a TV or projector?",
      answer:
        "Enter fullscreen, press Space to start/pause, and use Reset to snap back to your starting value. In fullscreen you can also tap/click the number to start or pause quickly.",
    },
    {
      question: "When should I use something else instead?",
      answer:
        "Use Debt Repayment Timer if you want a timer-style payoff/pacing view, or Fullscreen Timer if you just need a big, simple timer display for a room.",
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

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
  // Debt Repayment Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Debt Repayment Timer do?",
      answer:
        "It’s a countdown to a payoff finish line. You pick a payoff date or a duration, then the timer shows time remaining plus a simple time-based progress percentage. If you enter a starting balance and target balance, it also shows a linear estimate of “paid” and “remaining” based on time elapsed.",
    },
    {
      question: "Payoff date vs Duration: which should I use?",
      answer:
        "Use Payoff date when you have a specific deadline day you want to count down to. Use Duration when you want “N days from the start date” (for example, a 30-day or 90-day payoff sprint).",
    },
    {
      question: "What is the Start date used for?",
      answer:
        "The start date anchors the progress calculation. Progress is based on elapsed time between the start date and the end date (either payoff date or start date + duration).",
    },
    {
      question: "Why is the progress based on time instead of my payments?",
      answer:
        "This tool is intentionally simple. It estimates progress using time elapsed, not your payment history. If your real payments are uneven, the progress percentage may not match your actual balance changes.",
    },
    {
      question: "How are “Est. paid” and “Est. remaining” calculated?",
      answer:
        "They’re a straight-line estimate from your balances. The tool takes (starting balance − target balance) and applies the time progress to it. Est. paid = principal-to-pay × progress, and Est. remaining = principal-to-pay − est. paid.",
    },
    {
      question: "Does this include interest, fees, or minimum payments?",
      answer:
        "No. It does not model interest, compounding, fees, payment schedules, or lender calculations. It’s a countdown plus a time-based estimate only.",
    },
    {
      question: "What if my target balance is not $0?",
      answer:
        "That’s fine. Target balance can be any number you want (for example, “down to $2,000”). The estimate uses the difference between starting balance and target balance.",
    },
    {
      question: "Why does it say “Fix dates” sometimes?",
      answer:
        "The end date must be after the start date. If your payoff date is the same day or earlier than the start date, or your duration makes the end date not after the start date, the timer is blocked until you adjust the inputs.",
    },
    {
      question: "Why don’t keyboard shortcuts work until I click the card?",
      answer:
        "Shortcuts work when the timer card has focus. Click/tap the card once, then use Space to start/pause, R to reset, and F to toggle fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer:
        "Space start/pause · R reset · F fullscreen · Esc exits fullscreen.",
    },
    {
      question: "What happens when I change inputs while it’s running?",
      answer:
        "Changing inputs stops the run and recalculates the countdown from the new settings. This is to prevent accidental mismatch between the displayed timer and your updated end date.",
    },
    {
      question: "What’s the easiest way to use it as a big display?",
      answer:
        "Click Fullscreen, then start the timer. In fullscreen, you can tap/click the timer to start or pause quickly. Esc exits fullscreen.",
    },
    {
      question: "Which related tools should I use instead?",
      answer:
        "Use Countdown Timer for general-purpose countdowns, Fullscreen Timer for a clean large display, Meeting Timer for structured sessions, or Count Up Timer if you want time-elapsed instead of time-remaining.",
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
            <div className="px-5 pb-4 leading-relaxed text-slate-700">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

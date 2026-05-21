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
  // Count Up Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Count Up Timer do?",
      answer:
        "It tracks elapsed time from 0 upward. You can start and pause, record laps (splits), reset anytime, and use fullscreen for a large, readable display.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Use Start to begin and Pause to stop temporarily. Use Reset to return to 0 and clear laps. Keyboard: Space start/pause, R reset.",
    },
    {
      question: "What are laps and splits?",
      answer:
        "A lap records a checkpoint while the timer is running. Each lap shows Total elapsed time and Split time since the previous lap. Laps are listed with the most recent first.",
    },
    {
      question: "When can I record a lap?",
      answer:
        "Laps can be recorded only while the timer is running. If the timer is paused, Lap is disabled so you do not accidentally log a checkpoint.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the timer large and uncluttered. Press F to toggle fullscreen and Esc to exit. In fullscreen, you can tap or click the time display to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, L lap, R reset, F fullscreen, Esc exit fullscreen. If keys do not respond, click the timer card once so it has keyboard focus.",
    },
    {
      question: "Why does the time display change in whole seconds?",
      answer:
        "The display is shown in whole seconds for a steady, readable clock, while the timer still tracks time internally with millisecond precision for smooth updates.",
    },
    {
      question:
        "Does this timer keep running if I switch tabs or lock my phone?",
      answer:
        "It depends on the browser and device. Some browsers may reduce update frequency in the background. When you return, the timer should continue from the correct elapsed time, but the animation may appear less smooth while the tab is not active.",
    },
    {
      question: "Does this page save my time or laps, or require an account?",
      answer:
        "No account is required. The timer runs in your browser. Refreshing the page resets the timer and clears laps.",
    },
    {
      question: "What should I use if I need a countdown instead?",
      answer:
        "If you need to count down to zero, use the Countdown Timer or Fullscreen Timer pages. If you need meeting-focused elapsed time, use the Meeting Count Up Timer page.",
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
    <section id={id} className="space-y-4">
      <JsonLd data={faqLd} />

      <h2 className="text-2xl font-semibold text-[var(--ilt-text-primary)]">{title}</h2>

      <div className="mt-4 divide-y divide-[var(--ilt-border-subtle)] ilt-surface-card">
        {faqs.map((f) => (
          <details key={f.question}>
            <summary className="cursor-pointer px-5 py-4 font-medium text-[var(--ilt-text-primary)] hover:bg-[var(--ilt-bg-hover)]">
              {f.question}
            </summary>
            <div className="px-5 pb-4 text-[var(--ilt-text-secondary)] leading-relaxed">
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

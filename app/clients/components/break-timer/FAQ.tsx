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
  // Break Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Break Timer do?",
      answer:
        "It runs a simple countdown for breaks. Pick a preset or set custom minutes, then start/pause, reset, and optionally use fullscreen for a big display.",
    },
    {
      question: "How do I start, pause, and reset the break?",
      answer:
        "Press Space to start/pause. Use the on-screen Start/Pause button if you prefer. Press R (or click Reset) to stop and return to the selected minutes.",
    },
    {
      question: "What happens if I change the minutes?",
      answer:
        "Changing minutes resets the timer to the new duration so you start clean. If the timer is running, presets and the minutes input are disabled to avoid accidental changes mid-break.",
    },
    {
      question: "What does Sound do?",
      answer:
        "When Sound is on, the timer plays a short end chime when the break finishes. If Sound is off, the timer stays silent.",
    },
    {
      question: "What are “Final beeps”?",
      answer:
        "Final beeps add a short beep once per second during the last 5 seconds of the countdown. They only work when Sound is enabled.",
    },
    {
      question: "What does Loop do?",
      answer:
        "Loop automatically restarts the same break length when it hits zero. This is useful for repeating micro-breaks or short stretch cycles.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the countdown large and easy to read. Press F to toggle fullscreen, and Esc to exit. In fullscreen, you can also tap/click the time display to start/pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, R reset, F fullscreen, S toggle sound, and L toggle loop. If keys don’t respond, click the card once so it has keyboard focus.",
    },
    {
      question: "Does this timer keep my device awake?",
      answer:
        "No. This page does not request a screen wake lock. If your device sleeps, the countdown may pause or be delayed depending on your browser and power settings.",
    },
    {
      question: "Does this page store anything or require an account?",
      answer:
        "No account is required. This timer runs in your browser. This page does not need to save anything for core functionality.",
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

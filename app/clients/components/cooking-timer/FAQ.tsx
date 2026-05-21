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
  // Cooking Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Cooking Timer do?",
      answer:
        "It runs a clear countdown timer for cooking and kitchen tasks. You can pick egg presets or common presets, set custom minutes and seconds, go fullscreen for big readable digits, and optionally enable sound and final beeps.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Use Start to begin and Pause to stop temporarily. Use Reset to return to the ready state for your currently selected time. You can also press Space to start or pause and R to reset.",
    },
    {
      question: "How do the egg presets work?",
      answer:
        "Egg presets are one-tap durations (like Soft 6m, Jammy 7m, Hard 10m) so you can start quickly without typing. Presets set the timer duration and reset the countdown to that time.",
    },
    {
      question: "What are the common presets for?",
      answer:
        "Common presets cover frequent kitchen tasks from 30 seconds up to 60 minutes. They are a fast way to time things like simmering, steeping, rest time, oven checks, or short prep steps.",
    },
    {
      question: "Can I set a custom time?",
      answer:
        "Yes. Use the Minutes and Seconds inputs to set an exact duration. Minutes are clamped from 0 to 999 and seconds from 0 to 59. Inputs are disabled while running to prevent accidental edits.",
    },
    {
      question: "What do Sound and Final beeps do?",
      answer:
        "Sound enables audio cues. Final beeps adds short beeps during the last 5 seconds as a heads-up. When the timer hits zero, an end beep plays if Sound is enabled.",
    },
    {
      question: "What does Loop do?",
      answer:
        "Loop automatically restarts the same timer duration when it finishes. It’s useful for repeated intervals, batch cooking, or repeating a short cycle without re-starting manually.",
    },
    {
      question: "Why don’t I hear sound even when it’s enabled?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start or press Space once, then try again. Also check your device volume and mute settings.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the countdown large and uncluttered. Press F to toggle fullscreen and Esc to exit. In fullscreen, you can tap or click the time display to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, R reset, F fullscreen, S sound, and L loop. If keys don’t respond, click the timer card once so it has keyboard focus.",
    },
    {
      question: "Does this page save my settings or require an account?",
      answer:
        "No account is required. The timer runs in your browser and core functionality does not require saving anything.",
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

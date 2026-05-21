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
  // BPM Tapper defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Tap BPM tool do?",
      answer:
        "It estimates tempo (beats per minute) from your taps. Tap/click anywhere to register beats and the tool calculates BPM from your recent, valid intervals. You can also copy the result, lock it, and use fullscreen.",
    },
    {
      question: "How many taps do I need for a steadier BPM?",
      answer:
        "You’ll usually see a usable BPM after a few taps, but it becomes more stable after about 6–10 consistent taps. If the number feels jumpy, keep tapping until it settles before locking or copying.",
    },
    {
      question: "Why does it auto-reset after I stop tapping?",
      answer:
        "Auto-reset clears the session after a pause so your next phrase starts fresh. This prevents a long pause from mixing with new taps and distorting the BPM.",
    },
    {
      question: "What does “Hold last result” mean?",
      answer:
        "Hold keeps the last BPM visible after the tapping session ends, giving you time to read it, copy it, or lock it. When the hold time expires, the display clears unless you lock the result.",
    },
    {
      question: "What does Lock do?",
      answer:
        "Lock freezes the current BPM result so it won’t clear or change. While locked, taps won’t register and auto-reset won’t run. Unlock to resume normal tapping behavior.",
    },
    {
      question: "What is ms/beat, and what are ms/8th and ms/16th?",
      answer:
        "ms/beat is the estimated milliseconds per quarter note at the current BPM. ms/8th is half of ms/beat (an eighth note), and ms/16th is a quarter of ms/beat (a sixteenth note). These are quick timing references.",
    },
    {
      question: "Can I tap using the keyboard?",
      answer:
        "Yes. If “Space/Enter to tap” is enabled, you can tap with Space or Enter after clicking the card once so it has keyboard focus.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "After clicking the card once: Space/Enter taps (if enabled), F toggles fullscreen, R resets, C copies the current result, and Esc exits fullscreen.",
    },
    {
      question: "How does fullscreen change the tool?",
      answer:
        "Fullscreen makes the BPM large and easy to read at a distance and adds quick controls in the top/bottom bars. Tapping/clicking still registers beats, and Esc exits fullscreen.",
    },
    {
      question: "Does this tool save anything?",
      answer:
        "Your settings (reset time, hold time, and keyboard tap preference) and recent results may be stored in your browser so they persist between visits. There’s no account required.",
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

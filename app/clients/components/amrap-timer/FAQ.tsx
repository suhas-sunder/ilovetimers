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
  // AMRAP-specific defaults (timer + prep + score + fullscreen + shortcuts)
  const defaults: FaqItem[] = [
    {
      question: "What is an AMRAP timer for?",
      answer:
        "AMRAP means “As Many Rounds/Reps As Possible.” Set the time cap, start the countdown, and use the score controls to track rounds and reps during the workout.",
    },
    {
      question: "How do I start the AMRAP with a prep countdown?",
      answer:
        "Set Prep seconds (or choose a preset). When you press Start, the prep countdown runs first, then the AMRAP begins automatically.",
    },
    {
      question: "Can I pause and resume?",
      answer:
        "Yes. Press Start/Pause (or Space) to pause and resume. When paused, the timer holds your remaining time and continues from there when you resume.",
    },
    {
      question: "How do I track rounds and reps?",
      answer:
        "Use the big tap controls below the timer (Reps and Rounds). You can also use shortcuts: +/− for reps and ↑/↓ for rounds. Your score is shown as “X rounds + Y reps.”",
    },
    {
      question: "Does it automatically detect rounds or reps?",
      answer:
        "No. Scoring is manual so it works for any AMRAP structure. Tap the buttons or use shortcuts when you finish a round or add reps.",
    },
    {
      question: "What do the final beeps do?",
      answer:
        "If Sound and Final beeps are enabled, you’ll hear one short beep per second in the last 5 seconds of the AMRAP. You can turn Final beeps off for a quieter finish.",
    },
    {
      question: "Why didn’t I hear the beeps?",
      answer:
        "Many browsers block audio until you click/tap the page first. Also check device volume, mute, and Bluetooth output (sound may route to earbuds/speakers).",
    },
    {
      question: "Will it still be accurate if I switch tabs or lock my phone?",
      answer:
        "The timer tracks time while it’s running, but browsers can throttle updates in background tabs or with the screen locked. The display may “jump” when you return. For best results, keep this tab visible or use fullscreen.",
    },
    {
      question: "Does it work if I close the tab?",
      answer:
        "No. This timer runs in your browser while this page is open. If you close the tab/app or your browser session ends, it can’t continue like a system alarm or notification.",
    },
    {
      question: "How do I use fullscreen?",
      answer:
        "Click Fullscreen (or press F after focusing the card). Fullscreen must be triggered by user interaction and may be limited by some mobile browsers. Press Esc to exit.",
    },
    {
      question: "Are there keyboard shortcuts?",
      answer:
        "Yes. Click the timer card once, then use Space start/pause • R reset all • F fullscreen • S toggle sound • +/− reps • ↑/↓ rounds.",
    },
    {
      question: "How do I reset?",
      answer:
        "Use Reset all to reset the timer and clear rounds/reps. Changing Minutes or Prep seconds also resets the timer timing.",
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
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

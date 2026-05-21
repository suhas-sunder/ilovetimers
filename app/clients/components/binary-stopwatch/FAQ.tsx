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
  // Binary-stopwatch defaults (stopwatch + countdown + practice + weights + dim + fullscreen + sound)
  const defaults: FaqItem[] = [
    {
      question: "What does this Binary Stopwatch do?",
      answer:
        "It runs a stopwatch (count up) or a countdown timer (count down) and shows the time as pure binary for hours, minutes, and seconds. You can toggle practice mode, show bit weights, use presets, go fullscreen, and optionally play a soft alarm at the end of a countdown.",
    },
    {
      question: "What’s the difference between Stopwatch and Timer mode?",
      answer:
        "Stopwatch counts up from zero. Timer counts down from a duration you choose (preset or custom seconds) to zero and then stops.",
    },
    {
      question: "How do I read the binary grid?",
      answer:
        "Each column represents a field (Hours, Minutes, Seconds). The top cell is the largest bit weight. Add the weights of the lit bits to get the value for that column.",
    },
    {
      question: "What are the bit widths for hours, minutes, and seconds?",
      answer:
        "Minutes and seconds use 6 bits (0–59). Hours use 7 bits so the display stays valid up to 99 hours.",
    },
    {
      question: "What is Practice mode?",
      answer:
        "Practice mode lets you hide the decimal time so you can decode the binary first. Use Reveal to show the decimal time when you want to check your answer, and Hide time to go again.",
    },
    {
      question: "Why does the displayed time look rounded to whole seconds?",
      answer:
        "For readability, the display is shown at whole seconds (no milliseconds). The timing still runs smoothly underneath, but the visible time is snapped to the nearest second boundary.",
    },
    {
      question: "What presets are available, and can I set a custom time?",
      answer:
        "Timer mode includes quick presets (from short seconds up through longer minute blocks), and you can also type a custom number of seconds within the allowed range on the page.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "After clicking the card once: Space starts/pauses, R resets, F toggles fullscreen, D toggles dim mode, M switches between stopwatch and timer, W toggles weights, P toggles practice mode, E reveals time, and S toggles sound.",
    },
    {
      question: "Does fullscreen change anything about the timer behavior?",
      answer:
        "No. Fullscreen only changes the layout for easier viewing. In fullscreen you can also tap/click the display to start or pause quickly.",
    },
    {
      question: "Why might the alarm not play sound on some devices?",
      answer:
        "Some browsers require a user gesture (like a click or tap) before audio can play. If Sound is enabled and you’ve interacted with the page, the alarm should play when the countdown finishes.",
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

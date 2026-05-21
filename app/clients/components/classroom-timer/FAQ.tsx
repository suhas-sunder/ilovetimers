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
  // Classroom Timer defaults
  const defaults: FaqItem[] = [
    {
      question: "What does this Classroom Timer do?",
      answer:
        "It runs a large, readable countdown designed for smartboards, projectors, and classroom displays. You can pick quick presets or enter custom minutes, go fullscreen, adjust time while running, and optionally enable sound cues.",
    },
    {
      question: "How do I start, pause, and reset?",
      answer:
        "Press Space to start or pause, or use the Start/Pause button. Press R (or click Reset) to stop the timer and return to the ready state for your current minutes setting.",
    },
    {
      question: "How do presets work?",
      answer:
        "Presets are one-tap minute options (like 5m, 10m, 15m) so you can set a common classroom duration quickly. Presets are disabled while the timer is running to avoid accidental changes mid-session.",
    },
    {
      question: "Can I set a custom time?",
      answer:
        "Yes. Use the Minutes input to set a custom value. The input accepts 1 to 180 minutes. For safety and clarity, minutes can’t be edited while the timer is running.",
    },
    {
      question: "What does the Label option do?",
      answer:
        "Label is optional text shown above the countdown so students know what the timer is for (for example: Transition, Quiz, Centers). It helps reduce repeated instructions.",
    },
    {
      question: "Can I add or subtract time while it’s running?",
      answer:
        "Yes. Use Quick adjust (−1 min, +1 min, +5 min). Keyboard shortcuts also let you add or subtract 1 minute using + and −. Adjustments update the current countdown without restarting it.",
    },
    {
      question: "What do Sound, Final beeps, and End chime do?",
      answer:
        "Sound enables audio cues. Final beeps adds short beeps during the last 5 seconds as a heads-up. End chime plays a clearer “time’s up” chime when the countdown hits zero.",
    },
    {
      question: "Why don’t I hear sound even when it’s enabled?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start or press Space once, then try again. Also check your device volume and mute settings.",
    },
    {
      question: "How does fullscreen work?",
      answer:
        "Fullscreen makes the countdown large and uncluttered. Press F to toggle fullscreen and Esc to exit. In fullscreen, you can also click or tap empty space in the display area to start or pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause, R reset, F fullscreen, + add 1 minute, and - subtract 1 minute. If keys don’t respond, click the timer card once so it has keyboard focus.",
    },
    {
      question: "Does this page save my settings or require an account?",
      answer:
        "No account is required. The timer runs in your browser, and core functionality does not require saving anything.",
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

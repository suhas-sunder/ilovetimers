import { Link } from "react-router";
import { JsonLd } from "./HowItWorks";

/* =========================================================
   FAQ (SEO + UX)
   Schema: FAQPage (tool page)
========================================================= */
export type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
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
  // Minimalist Clock defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is this minimalist clock for?",
      answer:
        "It’s a clean, distraction-free online clock with big digits. Use it as a desk clock, a wall display on a spare screen, or a fullscreen clock with a minimalist look.",
    },
    {
      question: "How do I go fullscreen?",
      answer:
        "Click the Fullscreen button or press F (after clicking the clock once so shortcuts are active). Press Esc to exit fullscreen.",
    },
    {
      question: "What does Zen mode do?",
      answer:
        "Zen mode automatically hides the UI after a short idle period (especially useful in fullscreen). Move your mouse, tap, or press a key to reveal controls again.",
    },
    {
      question: "Can I switch between 12-hour and 24-hour time?",
      answer:
        "Yes. Toggle 24-hour on/off in the controls, or press T. In 12-hour mode the clock shows AM/PM.",
    },
    {
      question: "Can I hide seconds or the date?",
      answer:
        "Yes. Toggle Seconds (or press S) and Date (or press D). Turning seconds off gives a calmer display, while leaving it on is better for precise timing.",
    },
    {
      question: "Does the clock show my local time zone?",
      answer:
        "Yes. It uses your device’s local time and shows the detected time zone label in the small info line. This is helpful when presenting or screen-sharing across teams.",
    },
    {
      question: "What does Copy include?",
      answer:
        "Copy grabs a clean text block that includes the current displayed time, your time zone label, an optional date line (if enabled), and an ISO timestamp for logs or notes.",
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the clock card once to focus it, then try again. Shortcuts are ignored when you’re typing in an input field. In fullscreen, Esc also exits fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">S</strong>: seconds ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">T</strong>: 12/24 ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">D</strong>: date ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Z</strong>: zen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">C</strong>: copy ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the clock once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          Need multiple locations at once?{" "}
          <Link
            to="/world-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            World Clock
          </Link>
          . Need UTC specifically?{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
          </Link>
          . Prefer a classic clock page?{" "}
          <Link
            to="/digital-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Digital Clock
          </Link>
          ,{" "}
          <Link
            to="/analog-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Analog Clock
          </Link>
          , or{" "}
          <Link
            to="/retro-flip-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Retro Flip Clock
          </Link>
          . Need a timer instead of a clock?{" "}
          <Link
            to="/online-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          .
        </>
      ),
    },
  ];

  const faqs = items?.length ? items : defaults;

  // JSON-LD must be string-only; strip React nodes if any custom items are passed.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => typeof f.answer === "string")
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer as string },
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
            <div className="px-5 pb-4 leading-relaxed text-[var(--ilt-text-secondary)]">
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

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
  // Meeting Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Meeting Timer do?",
      answer:
        "It runs a countdown for a single meeting timebox. Choose a preset or custom minutes, press Start, and use fullscreen for a large display everyone can read. When time hits 0:00 it stops automatically, and you can Reset back to the selected minutes.",
    },
    {
      question: "How do I use this for an agenda with multiple topics?",
      answer:
        "Use it as a repeatable timebox: set minutes for the current topic, Start, and when you switch to the next agenda item either change minutes (which resets automatically) or press Reset to rerun the same timebox. Presets make it fast to jump between common topic lengths.",
    },
    {
      question: "What happens when I change the minutes?",
      answer:
        "Changing minutes fully resets the timer to the new duration and stops it if it was running. This is useful when you move to a new agenda item with a different timebox.",
    },
    {
      question: "How does fullscreen work on this timer?",
      answer:
        "Fullscreen shows a big, room-friendly countdown. While fullscreen, you can tap or click the time display to start or pause. Exit fullscreen with Esc or the Exit button in the top bar.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts or pauses, R resets, F toggles fullscreen, and Esc exits fullscreen. Shortcuts are ignored while you are typing in the minutes input.",
    },
    {
      question: "What do Sound and Final beeps do?",
      answer:
        "Sound plays a short beep when the timer finishes. Final beeps adds quick beeps during the last 5 seconds to make the cutoff obvious. Final beeps only works when Sound is enabled.",
    },
    {
      question: "Why don’t I hear any beeps?",
      answer:
        "Check that Sound is enabled, your device volume is up, and the tab is not muted. Some browsers also require an explicit click interaction before they allow audio.",
    },
    {
      question: "Does Reset change my selected minutes?",
      answer:
        "No. Reset stops the timer and returns it to the currently selected minutes (preset or custom).",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Need elapsed time tracking with agenda splits?{" "}
          <Link
            to="/meeting-count-up-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Meeting Count Up Timer
          </Link>
          . Want a general-purpose countdown?{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . Presenting and want a stage-friendly view?{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>
          . Prefer no audio cues?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . Need to plan or total durations after the meeting?{" "}
          <Link
            to="/time-calculator"
            className="cursor-pointer font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Calculator
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

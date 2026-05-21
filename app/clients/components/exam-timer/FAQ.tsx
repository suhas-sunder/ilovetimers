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
  // Exam Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Exam Timer do?",
      answer:
        "It runs a simple countdown for timed sections, mock exams, or practice sets. Choose a preset duration or enter custom minutes, start/pause and reset instantly, and use fullscreen for a large, readable display.",
    },
    {
      question: "How do I set the exam duration?",
      answer:
        "Pick a preset (5m to 180m) or type a custom number of minutes (1 to 360). When the timer is running, the duration controls are disabled to prevent accidental changes mid-section.",
    },
    {
      question: "How do Start, Pause, and Reset work?",
      answer:
        "Start begins counting down. Pause stops the countdown in place. Reset returns the timer to the full selected duration so you can rerun the same section cleanly.",
    },
    {
      question: "What are the warning beeps?",
      answer:
        "If Sound and Warnings are enabled, the timer can play a short beep once when it hits 5 minutes remaining and/or 1 minute remaining. This is meant as a pacing cue without being noisy.",
    },
    {
      question: "What are “Final beeps”?",
      answer:
        "Final beeps adds a short beep once per second during the last 5 seconds, plus a finish beep at zero. Turn it off if you want a quieter room.",
    },
    {
      question:
        "Does the timer keep running if I switch tabs or lock my device?",
      answer:
        "Yes, but browsers can throttle background tabs and devices can pause updates during sleep. When you come back, the remaining time will catch up. If you want the display to stay visually smooth, keep it in the foreground or fullscreen.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen or press F. Press Esc to exit. In fullscreen, you can click/tap the time display to start or pause quickly, and the top bar provides fast Start/Pause and Reset controls.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses · R resets · F toggles fullscreen · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question: "Why don’t I hear sound?",
      answer:
        "Some browsers require a user interaction before audio can play. If you don’t hear beeps, click Start once, then try again with Sound enabled. Also confirm your device isn’t muted and that the tab has audio permission.",
    },
    {
      question: "What’s the maximum duration I can set?",
      answer:
        "Custom minutes supports 1 to 360 minutes. Presets cover common exam and practice lengths up to 180 minutes.",
    },
    {
      question: "Can I use this for a real exam?",
      answer:
        "Use this page only if it fits the rules for your school, class, proctor, or practice setting. It is a browser timer, not an official exam system or compliance tool.",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          If you want a general study session timer, use{" "}
          <Link
            to="/study-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Study Timer
          </Link>
          . If you want a plain duration timer (less exam-specific), use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . For a clean, big-screen display, try{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . For classroom activities, use{" "}
          <Link
            to="/classroom-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Classroom Timer
          </Link>
          . For speaker timing, use{" "}
          <Link
            to="/presentation-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Presentation Timer
          </Link>
          . If you need a no-audio setup, use{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . If you want structured focus blocks and breaks, use{" "}
          <Link
            to="/pomodoro-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Pomodoro Timer
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

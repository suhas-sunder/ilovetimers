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
  // Focus Session Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Focus Session Timer do?",
      answer:
        "It runs a single work countdown. Choose a session length (preset or custom minutes), start/pause, optionally enable sound and final beeps, use fullscreen for a clean display, and get a short break suggestion when the session ends.",
    },
    {
      question: "How do I set the session length?",
      answer:
        "Use a preset button (for example 25m, 45m, 60m, 90m) or type a custom value in the minutes input. Changing the session length resets the timer to the new duration.",
    },
    {
      question: "How do Start, Pause, and Reset work?",
      answer:
        "Start begins counting down from the current remaining time. Pause stops the countdown and keeps your remaining time. Reset stops the timer and returns the remaining time to the selected session length.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space start/pause · R reset · F fullscreen · S toggle sound · Esc exits fullscreen. If shortcuts don’t work, click/tap the timer card once so it has focus.",
    },
    {
      question: "How does fullscreen mode work?",
      answer:
        "Click Fullscreen (or press F). Press Esc or Exit to leave fullscreen. In fullscreen, you can click/tap the timer display to start or pause quickly.",
    },
    {
      question: "What are Sound and Final beeps?",
      answer:
        "Sound plays a short beep when the session completes. Final beeps adds quick beeps during the last few seconds of the countdown. Final beeps is disabled when Sound is off.",
    },
    {
      question: "I don’t hear any sound. What should I do?",
      answer:
        "Some browsers block audio until you interact with the page. Click Start once (or press Space) and make sure your tab and device are not muted. If you still don’t hear beeps, try toggling Sound off and on.",
    },
    {
      question: "What happens if the tab stutters?",
      answer:
        "It is anchored to a target end time and recalculates remaining time from your device clock. Browser scheduling delays, sleeping devices, and power-saving modes can still affect animation smoothness and sound timing.",
    },
    {
      question: "What happens when the session ends?",
      answer:
        "The timer stops, plays a finish beep if Sound is enabled, and shows a short break suggestion (stand up, drink water, take a 2 to 5 minute break).",
    },
    {
      question: "Which related tool should I use instead?",
      answer: (
        <>
          If you want a structured work and break cycle, use{" "}
          <Link
            to="/pomodoro-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Pomodoro Timer
          </Link>
          . If you want broader work and break modes, use{" "}
          <Link
            to="/productivity-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Productivity Timer
          </Link>
          . If you are planning a day by named blocks, use{" "}
          <Link
            to="/time-blocking-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Blocking Clock
          </Link>
          . If you need a general-purpose countdown, use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . If you want no-audio timing, use{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . If you want a dedicated big-display mode, use{" "}
          <Link
            to="/online-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . If you want a quick rest timer, use{" "}
          <Link
            to="/break-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Break Timer
          </Link>
          . If you want several timers running at once, use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
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

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
  // Multiple Timers defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What is the Multiple Timers tool for?",
      answer:
        "It lets you run two or more countdown timers at the same time, side by side. Each timer has its own duration, label, controls, and alarm state.",
    },
    {
      question: "How do I add or remove timers?",
      answer: (
        <>
          Use <strong className="text-[var(--ilt-text-primary)]">Add timer</strong> to create
          another countdown. To remove one, click{" "}
          <strong className="text-[var(--ilt-text-primary)]">remove</strong> on that timer’s
          tile. If you need a single timer only, use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          .
        </>
      ),
    },
    {
      question: "How do I set a timer’s duration?",
      answer:
        "Pick a preset (like 5m or 10m) or enter exact Minutes and Seconds. Changing presets or minutes/seconds resets that timer to the new duration and pauses it.",
    },
    {
      question: "How do I start, pause, or reset timers?",
      answer:
        "Use the controls on each timer tile for individual control, or use the global buttons to Start all, Pause all, or Reset all.",
    },
    {
      question: "What happens when a timer reaches zero?",
      answer:
        "When a timer hits 0, it switches into an alarm state. Use Stop alarm on that timer, Silence to stop just the alarm state, or Stop alarms to stop all alarms at once.",
    },
    {
      question: "What’s the difference between Stop alarm and Silence?",
      answer:
        "Stop alarm stops the alarm and resets that timer back to its full duration. Silence only turns off the alarm state and leaves the time at 0 (it does not reset).",
    },
    {
      question: "How do sound and final countdown beeps work?",
      answer:
        "Sound controls whether alarms can play. If Final beeps is enabled, each running timer can beep during the last 5 seconds before it reaches 0. Final beeps are disabled when Sound is off.",
    },
    {
      question: "Why don’t I hear any sound?",
      answer:
        "Make sure Sound is enabled, your device volume is up, and the tab isn’t muted. Some browsers also require a user interaction before audio can play, so click anywhere on the page and try again.",
    },
    {
      question: "How do I go fullscreen?",
      answer:
        "Click Fullscreen (or press F after clicking the timer card once so shortcuts are active). Press Esc to exit fullscreen.",
    },
    {
      question: "Why aren’t keyboard shortcuts working?",
      answer:
        "Click the timer card once to focus it, then try again. Shortcuts are ignored while you’re typing in an input (like labels or time fields). In fullscreen, Esc exits fullscreen.",
    },
    {
      question: "What are the keyboard shortcuts?",
      answer: (
        <div className="grid gap-2">
          <div>
            <strong className="text-[var(--ilt-text-primary)]">Space</strong>: start/pause all ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">R</strong>: reset all ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">A</strong>: add timer ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">X</strong>: stop alarms ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">F</strong>: fullscreen ·{" "}
            <strong className="text-[var(--ilt-text-primary)]">Esc</strong>: exit fullscreen
          </div>
          <div className="text-sm text-[var(--ilt-text-muted)]">
            Tip: click the timer card once so it captures keyboard input.
          </div>
        </div>
      ),
    },
    {
      question: "Does it remember my timers and settings?",
      answer:
        "Yes. Timer labels, durations, remaining time, and sound settings are saved in your browser on this device. Clearing site data or using a private window may prevent saving.",
    },
    {
      question: "Which related timer should I use instead?",
      answer: (
        <>
          Want structured training intervals?{" "}
          <Link
            to="/hiit-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            HIIT Timer
          </Link>{" "}
          or{" "}
          <Link
            to="/tabata-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Tabata Timer
          </Link>
          . Need focus blocks?{" "}
          <Link
            to="/pomodoro-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Pomodoro Timer
          </Link>
          . Prefer no sound?{" "}
          <Link
            to="/silent-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Silent Timer
          </Link>
          . Want one big screen?{" "}
          <Link
            to="/fullscreen-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300  hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          .
        </>
      ),
    },
    {
      question: "Does this tool send my timer data anywhere?",
      answer:
        "No. Timers run locally in your browser. Saved state is stored in your local browser storage on this device.",
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

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
  // Event Countdown defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Event Countdown do?",
      answer:
        "It counts down to a specific local date and time (an event, deadline, launch, meeting, or appointment). You can save multiple events in your browser, switch between them, go fullscreen for a large display, and optionally enable sound alerts when the timer finishes.",
    },
    {
      question: "Is the date and time local or UTC?",
      answer:
        "The date/time you pick is local to your device. The countdown targets that local moment. If you change your device timezone (or travel), the displayed target time can change because it’s tied to local time.",
    },
    {
      question: "How do I start, pause, and reset the countdown?",
      answer:
        "Click Start to begin and Pause to stop. Reset refreshes the remaining time based on your currently selected target date/time. Keyboard shortcuts also work: Space starts/pauses and R resets.",
    },
    {
      question: "What happens if I set a time in the past?",
      answer:
        "The timer won’t run. You’ll see a message that the selected date/time is in the past, and remaining time will be zero until you pick a future target.",
    },
    {
      question: "How do saved events work?",
      answer:
        "Events are saved locally in your browser (not on a server). Use New to create a fresh event, Duplicate to clone the current one, and Delete to remove it. If you clear site data or switch browsers/devices, your saved events won’t carry over.",
    },
    {
      question: "Can I duplicate an event and tweak it?",
      answer:
        "Yes. Duplicate makes a copy of the selected event (name, date/time, sound settings). It’s useful for recurring deadlines where you want to keep the same setup and only adjust the target.",
    },
    {
      question: "What do the ±1h, ±2h, and ±24h buttons do?",
      answer:
        "They shift the selected event’s target date/time forward or backward by the shown amount. It’s a quick way to correct a time without re-opening the date/time picker.",
    },
    {
      question: "How does sound work, and what are “Final beeps”?",
      answer:
        "Sound plays a short finish beep when the countdown reaches zero. If Final beeps is enabled, it also beeps during the last 5 seconds. Some browsers require user interaction before audio is allowed, so if you don’t hear it, try clicking Start once and then testing again.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen or press F. Press Esc to exit. In fullscreen, you can click/tap the time display to start or pause quickly, and the top bar gives you fast Start/Pause and Reset controls.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses · R resets · F toggles fullscreen · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question: "Can I keep this open in the background?",
      answer:
        "Yes, but browsers can throttle background tabs to save power, which can make updates look less smooth. The countdown will still reach zero, but if you want the display to stay visually smooth, keep it in the foreground or fullscreen.",
    },
    {
      question: "Which related tools should I use instead?",
      answer: (
        <>
          If you want a simple countdown for a duration (not a calendar date),
          use{" "}
          <Link
            to="/countdown-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Countdown Timer
          </Link>
          . If you want a big display without event saving, try{" "}
          <Link
            to="/online-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Fullscreen Timer
          </Link>
          . Running a timed meeting after the event starts?{" "}
          <Link
            to="/meeting-timer"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Meeting Timer
          </Link>
          . If you need multiple timers at once, use{" "}
          <Link
            to="/multiple-timers"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Multiple Timers
          </Link>
          . If you’re coordinating across time zones before setting an event,
          use{" "}
          <Link
            to="/time-zone-converter"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            Time Zone Converter
          </Link>
          . Need a shared time reference while coordinating?{" "}
          <Link
            to="/utc-clock"
            className="cursor-pointer font-semibold text-[var(--ilt-text-primary)] underline decoration-slate-300 hover:decoration-slate-500"
          >
            UTC Clock
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

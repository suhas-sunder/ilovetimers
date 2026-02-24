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
  // Egg Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Egg Timer do?",
      answer:
        "It runs a simple countdown for boiling eggs using quick presets (Soft, Jammy, Medium, Hard, Very hard) or a custom time. You can enable/disable sound, optionally turn on final countdown beeps, and use fullscreen for a bigger, cleaner display.",
    },
    {
      question: "How do I start and pause the timer?",
      answer:
        "Press Start to begin the countdown. Press Pause to stop it and keep your remaining time. Press Start again to resume. You can also press Space to start/pause. In fullscreen, you can tap/click the timer display to start or pause.",
    },
    {
      question: "How do presets work?",
      answer:
        "Tap a preset to instantly set minutes and seconds for that doneness. Selecting a preset resets the timer to that preset time (it does not continue from your current remaining time).",
    },
    {
      question: "Can I set a custom time?",
      answer:
        "Yes. Set Minutes and Seconds directly. Any change to Minutes/Seconds resets the timer to the new time, so you start clean and avoid mixed timing.",
    },
    {
      question: "Can I change the time while it’s running?",
      answer:
        "No. Time inputs and presets are disabled while the timer is running to prevent accidental changes. Pause or reset first, then adjust the time and start again.",
    },
    {
      question: "What does Reset do?",
      answer:
        "Reset stops the timer and returns the countdown to the currently selected time (your chosen preset time or your current custom minutes and seconds).",
    },
    {
      question: "How do sound and final countdown beeps work?",
      answer:
        "Sound controls the finish signal when the timer hits zero. Final countdown beeps add short beeps in the last few seconds so you get a heads-up. If sound doesn’t play, interact with the page first (click/tap/press a key) since some browsers block audio until a user gesture.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen (or press F). Press Esc to exit. Fullscreen gives you a bigger display, and tapping/clicking the timer display toggles start/pause.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses · R resets · F toggles fullscreen · S toggles sound · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question:
        "Will the timer keep perfect time if I switch tabs or lock my device?",
      answer:
        "It runs in your browser while the page is open. Background tabs and locked devices may throttle timing, so the countdown can drift slightly depending on your browser and power-saving settings.",
    },
    {
      question: "Does this run when the page is closed or send notifications?",
      answer:
        "No. This tool doesn’t use system notifications and won’t keep running after you close the tab or browser.",
    },
    {
      question: "Which related timers should I use instead?",
      answer:
        "Use Cooking Timer for general kitchen timing, Tea Timer for tea steeping, Countdown Timer for a simple one-off countdown, Silent Timer for no-audio timing, or Fullscreen Timer when you want the biggest possible display.",
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

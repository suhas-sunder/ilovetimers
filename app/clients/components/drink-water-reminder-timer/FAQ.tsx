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
  // Water Reminder Timer defaults (page-specific)
  const defaults: FaqItem[] = [
    {
      question: "What does this Water Reminder Timer do?",
      answer:
        "It runs a repeating countdown that reminds you to drink water at a set interval while this tab is open. After each reminder, it automatically restarts the next cycle. You can enable/disable sound, use fullscreen for a clean display, and trigger a reminder immediately with Remind now.",
    },
    {
      question: "How do I start and pause the reminders?",
      answer:
        "Press Start to begin the countdown. Press Pause to stop it and keep your remaining time. Press Start again to resume. You can also use Space to start/pause.",
    },
    {
      question: "How do I change the reminder interval?",
      answer:
        "Pick a preset (15–120 minutes) or type a custom number of minutes (5–360). For consistency, interval changes reset the current cycle and clear the reminders count back to 0.",
    },
    {
      question: "Can I change the interval while it’s running?",
      answer:
        "No. Interval controls are disabled while the timer is running so your cycles stay consistent. Pause or reset first, then change the interval and start again.",
    },
    {
      question: "What does “Remind now” do?",
      answer:
        "Remind now fires an immediate reminder and restarts the full interval countdown from that moment. It only works while the timer is running.",
    },
    {
      question: "What’s the difference between Reset cycle and Reset all?",
      answer:
        "Reset cycle restarts the countdown for the current interval but keeps your reminders count. Reset all restarts the countdown and clears the reminders count back to 0.",
    },
    {
      question: "How do I turn sound on or off?",
      answer:
        "Use the Sound toggle on the page. You can also press S to toggle sound. If sound doesn’t play, interact with the page first (click/tap/press a key) since some browsers block audio until a user gesture.",
    },
    {
      question: "How do I use fullscreen mode?",
      answer:
        "Click Fullscreen (or press F). Press Esc to exit. In fullscreen, you can tap/click the timer display to start or pause quickly.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "Space starts/pauses · N reminds now · R resets (Reset all) · F toggles fullscreen · S toggles sound · Esc exits fullscreen. If shortcuts don’t work, click/tap the card once so it has focus.",
    },
    {
      question: "Will reminders still fire if I switch tabs or lock my device?",
      answer:
        "This runs in your browser while the page is open. Background tabs and locked devices may throttle timing, so reminders can be delayed depending on your browser and power-saving settings.",
    },
    {
      question: "Does this send notifications or run when the page is closed?",
      answer:
        "No. This tool doesn’t use system notifications and won’t keep running after you close the tab or browser. If you need background notifications, use your device’s reminder/clock features.",
    },
    {
      question: "Which related timers should I use instead?",
      answer:
        "Use Countdown Timer for a one-time countdown, Multiple Timers for several reminders at once, Silent Timer for a no-sound setup, or Fullscreen Timer for a big display without repeating reminders.",
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

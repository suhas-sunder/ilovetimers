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
  // Binary-clock defaults (BCD + pure binary + seconds + 12/24 + copy + fullscreen + shortcuts)
  const defaults: FaqItem[] = [
    {
      question: "What does this Binary Clock do?",
      answer:
        "It shows your current local time and displays it in binary. You can switch between BCD (digit-by-digit) and pure binary modes, toggle seconds, switch 12/24-hour time, copy a snapshot, and use fullscreen.",
    },
    {
      question: "What’s the difference between BCD and pure binary?",
      answer:
        "BCD (Binary-Coded Decimal) converts each decimal digit (0–9) into 4 binary bits, so the time stays aligned to the familiar HH:MM:SS digits. Pure binary converts the hour, minute, and second values into binary numbers (for example, minutes 0–59 are shown as a 6-bit binary value).",
    },
    {
      question: "Does this show my local time or a specific time zone?",
      answer:
        "It shows your device’s local time. The page also displays a timezone label when your browser provides one, but it does not convert between time zones.",
    },
    {
      question: "How often does the clock update?",
      answer:
        "The display updates aligned to the next whole-second boundary. Even if you hide seconds, it still updates on second boundaries so minute changes land cleanly.",
    },
    {
      question:
        "Why do the hour bits change width between 12-hour and 24-hour?",
      answer:
        "In pure binary mode, hours use 5 bits in 24-hour mode (0–23) and 4 bits in 12-hour mode (1–12). Minutes and seconds use 6 bits (0–59).",
    },
    {
      question: "What exactly gets copied when I press Copy?",
      answer:
        "Copy captures a snapshot of the current moment including your formatted time, timezone label, the date line, the binary representation for the selected mode, and an ISO timestamp for exact reference.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "After clicking the clock card once: F toggles fullscreen, C copies, S toggles seconds, B switches between BCD and pure binary, 1 sets 12-hour time, 2 sets 24-hour time, and Esc exits fullscreen.",
    },
    {
      question: "Does fullscreen change anything about the time or conversion?",
      answer:
        "No. Fullscreen only changes the layout for easier viewing. The time and binary representation are the same.",
    },
    {
      question: "Is this an atomic clock or synchronized to a time server?",
      answer:
        "No. It uses your device’s clock. If your system time is off, the displayed time (and binary output) will be off by the same amount.",
    },
    {
      question: "Can I link to or share a specific time?",
      answer:
        "This page is designed for “now.” If you need to share a specific moment, use Copy to capture the snapshot text (including ISO) and paste it where you need it.",
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
            <div className="px-5 pb-4 text-slate-700 leading-relaxed">
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

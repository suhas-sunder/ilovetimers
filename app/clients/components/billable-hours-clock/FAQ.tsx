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
  // Billable-hours-clock defaults (multi timers + rounding + totals + copy/print + local save)
  const defaults: FaqItem[] = [
    {
      question: "What does the Billable Hours Clock do?",
      answer:
        "It tracks billable time live with start/pause controls. You can run multiple timers, apply rounding increments, and see billable hours and total pay per timer based on an hourly rate.",
    },
    {
      question: "How is billable time calculated?",
      answer:
        "Each timer tracks elapsed time while running. If rounding is enabled, the billable time is the elapsed time rounded up to the next selected increment. If rounding is set to None, billable time equals elapsed time.",
    },
    {
      question: "How is the total amount calculated?",
      answer:
        "Total = (billable time in hours) × hourly rate. Billable time in hours is computed from the rounded billable time for that timer.",
    },
    {
      question: "What rounding options are available?",
      answer:
        "You can choose None, 6 minutes (0.1 hr), 10 minutes, or 15 minutes (0.25 hr). Rounding always goes up to the next increment.",
    },
    {
      question: "Does this support breaks?",
      answer:
        "This page is a live timer and does not have a separate break field. If you want to exclude time, you can pause the timer during a break, or manually adjust time using the +5m and -5m controls on the active timer.",
    },
    {
      question: "Can I track multiple clients or matters at once?",
      answer:
        "Yes. Add a timer per client, matter, or task. Each timer can have its own note, rate, currency, and rounding settings, and you can switch the active timer at any time.",
    },
    {
      question: "How do totals work across currencies?",
      answer:
        "Totals are grouped by currency. If you bill in multiple currencies, the page shows separate totals per currency and a combined total billable hours value. No currency conversion is performed.",
    },
    {
      question: "Are my timers saved?",
      answer:
        "Yes. Timers are saved to your browser’s local storage on this device. If you clear site data or switch browsers/devices, saved timers will not carry over.",
    },
    {
      question: "What happens if I switch tabs or my screen locks?",
      answer:
        "If the page becomes hidden, running timers are paused to avoid drift. When you return, you can resume.",
    },
    {
      question: "Can I copy or print my timers?",
      answer:
        "Yes. Copy exports a compact text summary (elapsed, billable, hours, rate, total, and optional note). Print is optimized for saving as a PDF and supports printing the active timer or all timers.",
    },
    {
      question: "What keyboard shortcuts are supported?",
      answer:
        "After clicking the tool card once: Space starts/pauses the active timer, R resets it, C copies it, A adds a timer, F toggles fullscreen, and P prints the active timer.",
    },
    {
      question: "Does this handle taxes, fees, retainers, or invoices?",
      answer:
        "No. It tracks time and computes an hourly total only. It does not apply taxes or fees, manage retainers, enforce trust accounting rules, or generate invoices.",
    },
    {
      question: "Does selecting a currency convert amounts?",
      answer:
        "No. Currency selection formats the displayed rate and totals only. It does not perform exchange-rate conversion.",
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

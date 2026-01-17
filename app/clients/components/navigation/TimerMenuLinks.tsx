import { Link } from "react-router";

type TimerMenuLink = { to: string; label: string };
type TimerMenuSection = {
  title: string;
  links: TimerMenuLink[];
  variant?: "flat";
};

const TimerMenuLinks = () => {
  const sections: TimerMenuSection[] = [
    {
      title: "Core tools",
      links: [
        { to: "/countdown-timer", label: "Countdown Timer" },
        { to: "/stopwatch", label: "Stopwatch" },
        { to: "/pomodoro-timer", label: "Pomodoro Timer" },
        { to: "/hiit-timer", label: "HIIT / Interval Timer" },
      ],
    },
    {
      title: "Display & hubs",
      links: [
        { to: "/online-timer", label: "Online Timer" },
        { to: "/fullscreen-timer", label: "Fullscreen Timer" },
        { to: "/silent-timer", label: "Silent Timer" },
        { to: "/productivity-timer", label: "Productivity Timer" },
      ],
    },
    {
      title: "Use-cases",
      links: [
        { to: "/presentation-timer", label: "Presentation Timer" },
        { to: "/meeting-timer", label: "Meeting Timer" },
        { to: "/classroom-timer", label: "Classroom Timer" },
        { to: "/exam-timer", label: "Exam Timer" },
        { to: "/study-timer", label: "Study Timer" },
        { to: "/break-timer", label: "Break Timer" },
        { to: "/rest-timer", label: "Rest Timer" },
        { to: "/workout-timer", label: "Workout Timer" },
        { to: "/tabata-timer", label: "Tabata Timer" },
        { to: "/cooking-timer", label: "Cooking Timer" },
        { to: "/meditation-timer", label: "Meditation Timer" },
        { to: "/visual-timer", label: "Visual Timer" },
        { to: "/alarm-timer", label: "Alarm Timer" },
        { to: "/multiple-timers", label: "Multiple Timers" },
        { to: "/event-countdown", label: "Event Countdown" },
      ],
    },
    {
      title: "Niche timers",
      variant: "flat",
      links: [
        { to: "/speedcubing-timer", label: "Speedcubing Timer" },
        { to: "/lab-timer", label: "Lab Timer" },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-2xl border border-amber-400 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-amber-950">All timer pages</h2>
        <p className="mt-2 leading-relaxed text-amber-800">
          Pick a tool page or a purpose page. Everything runs in-browser.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          {sections
            .filter((s) => s.variant !== "flat")
            .map((s) => (
              <MenuCard key={s.title} title={s.title} links={s.links} />
            ))}
        </div>

        {sections
          .filter((s) => s.variant === "flat")
          .map((s) => (
            <div key={s.title} className="mt-6">
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                {s.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link key={l.to} to={l.to} className={linkClassSoft}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

function MenuCard({ title, links }: { title: string; links: TimerMenuLink[] }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={linkClassCard}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

const linkClassCard =
  "cursor-pointer rounded-lg bg-white px-3 py-2 text-sm font-medium text-amber-950 shadow-sm hover:bg-amber-100 border border-amber-200";

const linkClassSoft =
  "cursor-pointer rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-400";

export default TimerMenuLinks;

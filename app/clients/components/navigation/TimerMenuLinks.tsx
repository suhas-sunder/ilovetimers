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
        { to: "/count-up-timer", label: "Count Up Timer" },
        { to: "/stopwatch", label: "Stopwatch" },
        { to: "/pomodoro-timer", label: "Pomodoro Timer" },
        { to: "/online-timer", label: "Online Timer" },
      ],
    },
    {
      title: "Focus & productivity",
      links: [
        { to: "/focus-session-timer", label: "Focus Session Timer" },
        { to: "/productivity-timer", label: "Productivity Timer" },
        { to: "/study-timer", label: "Study Timer" },
        { to: "/break-timer", label: "Break Timer" },
        { to: "/meeting-timer", label: "Meeting Timer" },
        { to: "/meeting-count-up-timer", label: "Meeting Count Up Timer" },
        { to: "/presentation-timer", label: "Presentation Timer" },
        { to: "/exam-timer", label: "Exam Timer" },
        { to: "/classroom-timer", label: "Classroom Timer" },
      ],
    },
    {
      title: "Health & wellness",
      links: [
        { to: "/sleep-timer", label: "Sleep Timer" },
        { to: "/breathing-timer", label: "Breathing Timer" },
        { to: "/meditation-timer", label: "Meditation Timer" },
        { to: "/stretch-timer", label: "Stretch Timer" },
        { to: "/drink-water-reminder-timer", label: "Water Reminder Timer" },
        { to: "/silent-timer", label: "Silent Timer" },
        { to: "/visual-timer", label: "Visual Timer" },
      ],
    },
    {
      title: "Fitness & training",
      links: [
        { to: "/workout-timer", label: "Workout Timer" },
        { to: "/hiit-timer", label: "HIIT Timer" },
        { to: "/tabata-timer", label: "Tabata Timer" },
        { to: "/emom-timer", label: "EMOM Timer" },
        { to: "/amrap-timer", label: "AMRAP Timer" },
        { to: "/round-timer", label: "Round Timer" },
        { to: "/pace-timer", label: "Pace Timer" },
        { to: "/rest-timer", label: "Rest Timer" },
      ],
    },
    {
      title: "Cooking & food",
      links: [
        { to: "/cooking-timer", label: "Cooking Timer" },
        { to: "/tea-timer", label: "Tea Timer" },
        { to: "/egg-timer", label: "Egg Timer" },
        { to: "/pizza-timer", label: "Pizza Timer" },
      ],
    },
    {
      title: "Clocks",
      links: [
        { to: "/current-local-time", label: "Current Local Time" },
        { to: "/world-clock", label: "World Clock" },
        { to: "/utc-clock", label: "UTC Clock" },
        { to: "/digital-clock", label: "Digital Clock" },
        { to: "/analog-clock", label: "Analog Clock" },
        { to: "/binary-clock", label: "Binary Clock" },
        { to: "/hexadecimal-clock", label: "Hexadecimal Clock" },
        { to: "/fibonacci-clock", label: "Fibonacci Clock" },
        { to: "/sunrise-sunset-clock", label: "Sunrise Sunset Clock" },
        { to: "/morse-code-clock", label: "Morse Code Clock" },
      ],
    },
    {
      title: "Events & tracking",
      links: [
        { to: "/event-countdown", label: "Event Countdown" },
        { to: "/alarm-timer", label: "Alarm Timer" },
        { to: "/multiple-timers", label: "Multiple Timers" },
        { to: "/debt-repayment-timer", label: "Debt Repayment Timer" },
        { to: "/debt-clock", label: "Debt Clock" },
      ],
    },
    {
      title: "Games & niche",
      variant: "flat",
      links: [
        { to: "/speedcubing-timer", label: "Speedcubing Timer" },
        { to: "/speedrun-timer", label: "Speedrun Timer" },
        { to: "/video-game-challenge-timer", label: "Game Challenge Timer" },
        { to: "/chaos-timer", label: "Chaos Timer" },
        { to: "/lab-timer", label: "Lab Timer" },
      ],
    },
  ];

  return (
    <section id="all-timers" className="mx-auto max-w-7xl px-4 pb-12">
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

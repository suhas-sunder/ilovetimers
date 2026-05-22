import type { AdSlotType } from "~/clients/components/ui/foundation";

export type MonetizationEligibility =
  | "eligible-tool-page"
  | "eligible-content-page"
  | "archive-limited"
  | "legal-limited"
  | "navigation-limited"
  | "needs-content-before-ads";

export type RouteMonetizationConfig = {
  path: string;
  eligibility: MonetizationEligibility;
  reason: string;
  allowedSlots: readonly AdSlotType[];
  contentExpansionNeeded: boolean;
  notes?: string;
};

export const FULL_TOOL_AD_SLOTS = [
  "top-banner",
  "below-header-banner",
  "in-content-square",
  "bottom-banner",
] as const satisfies readonly AdSlotType[];

export const HOMEPAGE_AD_SLOTS = [
  "below-header-banner",
  "in-content-square",
  "bottom-banner",
] as const satisfies readonly AdSlotType[];

export const CONTENT_PAGE_AD_SLOTS = [
  "below-header-banner",
  "bottom-banner",
] as const satisfies readonly AdSlotType[];

export const NO_AD_SLOTS = [] as const satisfies readonly AdSlotType[];

export const routeMonetization = [
  {
    path: "/",
    eligibility: "eligible-content-page",
    allowedSlots: HOMEPAGE_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Homepage navigation and explanatory content already supports quiet shared placeholders between content sections.",
    notes:
      "Keep ad spacing away from shortcut links and never add real ad scripts without approval.",
  },
  {
    path: "/free-online-timers",
    eligibility: "archive-limited",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Archived four-timer experience must keep its current layout and controls.",
    notes:
      "Do not force the new monetized tool template onto this route unless explicitly approved.",
  },
  {
    path: "/about",
    eligibility: "eligible-content-page",
    allowedSlots: CONTENT_PAGE_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Informational page with enough body content for a lighter content-page pattern.",
  },
  {
    path: "/countdown-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Core timer route with expanded route-specific SEO, FAQ, shortcuts, use cases, and disclaimer content.",
  },
  {
    path: "/stopwatch",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Core stopwatch route with expanded route-specific content and export-oriented support sections.",
  },
  {
    path: "/stopwatch-with-milliseconds",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent stopwatch route has milliseconds-first elapsed timing, precision settings, laps, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/pomodoro-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Focus timer route has expanded Pomodoro-specific support content below the utility.",
  },
  {
    path: "/hiit-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Workout interval route has expanded HIIT-specific content and safety notes.",
  },
  {
    path: "/fullscreen-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Fullscreen-focused timer route has expanded content and a clear tool-first layout.",
  },
  {
    path: "/silent-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Silent timer now has expanded quiet-use content, settings guidance, limitation-safe wording, and relevant internal links.",
  },
  {
    path: "/online-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "General online timer route has expanded route-specific content and utility-first structure.",
  },
  {
    path: "/seconds-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent seconds timer route has short countdown presets, custom seconds input, sound, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/1-minute-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Preset one-minute timer route opens ready at 1:00 with start, pause, reset, sound toggle, fullscreen support, and route-specific support content.",
  },
  {
    path: "/5-minute-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Preset five-minute timer route opens ready at 5:00 with start, pause, reset, sound toggle, fullscreen support, and route-specific support content.",
  },
  {
    path: "/10-minute-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Preset ten-minute timer route opens ready at 10:00 with start, pause, reset, sound toggle, fullscreen support, and route-specific support content.",
  },
  {
    path: "/15-minute-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Preset fifteen-minute timer route opens ready at 15:00 with start, pause, reset, sound toggle, fullscreen support, and route-specific support content.",
  },
  {
    path: "/30-minute-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Preset thirty-minute timer route opens ready at 30:00 with start, pause, reset, sound toggle, fullscreen support, and route-specific support content.",
  },
  {
    path: "/interval-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Custom interval timer route has utility-first step timing, presets, fullscreen support, and route-specific support content.",
  },
  {
    path: "/millisecond-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Millisecond timer has utility-first countdown controls, millisecond input, fullscreen support, and route-specific support content.",
  },
  {
    path: "/presentation-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Presentation timer now has expanded speaker timing, warning, rehearsal, fullscreen, and related-tool content.",
  },
  {
    path: "/speech-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Speech timer has route-specific speaking countdown content, warning thresholds, fullscreen support, and limitation notes.",
  },
  {
    path: "/classroom-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Classroom timer now has expanded teacher-specific use cases, projected-display guidance, controls notes, and related links.",
  },
  {
    path: "/meeting-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Meeting timer has expanded agenda-specific content and practical support sections.",
  },
  {
    path: "/meeting-agenda-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Meeting agenda timer has utility-first agenda item timing, support content, FAQ, and practical limitations.",
  },
  {
    path: "/time-zone-meeting-planner",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Time zone meeting planner has utility-first multi-zone comparison, candidate times, copy/share actions, and route-specific support content.",
  },
  {
    path: "/exam-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Exam timer has expanded support content and limitation wording for non-official use.",
  },
  {
    path: "/break-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Break timer now has expanded break-use examples, settings notes, careful non-medical wording, and related links.",
  },
  {
    path: "/study-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Study timer now has expanded study-block guidance, settings explanation, limitation-safe wording, and related links.",
  },
  {
    path: "/workout-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Workout timer now has expanded interval setup guidance, training limitations, audio/fullscreen notes, and related links.",
  },
  {
    path: "/rest-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Rest timer now has expanded between-set examples, settings notes, non-medical wording, and related links.",
  },
  {
    path: "/tabata-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Tabata timer now has expanded 20/10 structure, HIIT distinction, usage tips, and related interval links.",
  },
  {
    path: "/cooking-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Cooking timer has expanded kitchen-specific content, presets, FAQ, and disclaimer sections.",
  },
  {
    path: "/kitchen-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent kitchen timer route has common kitchen presets, custom minutes and seconds, sound, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/meditation-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Meditation timer has expanded calm-use content and disclaimer language without health overclaims.",
  },
  {
    path: "/speedcubing-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Speedcubing timer now has expanded practice workflow, solve history, limitation wording, and related timing links.",
  },
  {
    path: "/lab-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Lab timer has expanded experiment-specific content and notes for planning use.",
  },
  {
    path: "/alarm-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Alarm timer has expanded alarm-specific content and audio limitation notes.",
  },
  {
    path: "/online-alarm-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent online alarm clock route has time-of-day alarm scheduling, next occurrence labels, sound controls, fullscreen support, and limitation-safe content.",
  },
  {
    path: "/multiple-timers",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Multiple timers route has expanded multi-task content and route-specific support sections.",
  },
  {
    path: "/visual-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Visual timer now has expanded visual countdown guidance, display-mode explanation, quiet-use notes, and related links.",
  },
  {
    path: "/productivity-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Productivity timer now has expanded phase guidance, Pomodoro distinction, settings notes, and related planning links.",
  },
  {
    path: "/count-up-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Count-up timer has expanded elapsed-time content, shortcuts, FAQ, and disclaimer sections.",
  },
  {
    path: "/meeting-count-up-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Meeting count-up timer has expanded meeting-specific elapsed-time content.",
  },
  {
    path: "/breathing-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Breathing timer has expanded phase-specific content and avoids medical benefit claims.",
  },
  {
    path: "/sleep-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Sleep timer now has expanded bedtime countdown content, calm settings notes, medical-claim limits, and related links.",
  },
  {
    path: "/stretch-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Stretch timer now has expanded interval, rest, rounds, non-medical limitation wording, and related links.",
  },
  {
    path: "/drink-water-reminder-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Reminder timer has expanded route-specific content and health-adjacent limitation language.",
  },
  {
    path: "/emom-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "EMOM timer has expanded every-minute workout content and support sections.",
  },
  {
    path: "/amrap-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "AMRAP timer has expanded scoring and training content below the utility.",
  },
  {
    path: "/round-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Round timer now has expanded round/rest setup guidance, warning and sound cue notes, non-official wording, and related links.",
  },
  {
    path: "/boxing-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent boxing timer route has boxing-style round/rest presets, prep timing, sound controls, fullscreen support, and route-specific content.",
  },
  {
    path: "/pace-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Pace timer has expanded pacing-specific content and calculation notes.",
  },
  {
    path: "/tea-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Tea timer now has expanded steeping guidance, custom timing notes, practical examples, and related kitchen links.",
  },
  {
    path: "/egg-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Egg timer has expanded doneness-specific content and practical kitchen notes.",
  },
  {
    path: "/chaos-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Chaos timer has expanded route-specific content that explains the randomized behavior.",
  },
  {
    path: "/video-game-challenge-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Video game challenge timer now has expanded round, attempt, sound, fullscreen, and safe casual-use content.",
  },
  {
    path: "/speedrun-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Speedrun timer now has expanded split workflow, practice comparison notes, export limitations, and related links.",
  },
  {
    path: "/pizza-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Pizza timer has expanded pizza-specific timing content and support sections.",
  },
  {
    path: "/fibonacci-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Fibonacci clock has expanded explanation content for its custom renderer.",
  },
  {
    path: "/sunrise-sunset-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Sunrise and sunset clock now has expanded location, date, approximation, non-official limitation, and related sky-clock content.",
  },
  {
    path: "/debt-repayment-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Debt repayment route has expanded estimate-based content and financial limitation notes.",
  },
  {
    path: "/focus-session-timer",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Focus session timer has expanded focus-session content distinct from Pomodoro.",
  },
  {
    path: "/morse-code-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Morse code clock has expanded content that explains the specialty display.",
  },
  {
    path: "/world-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "World clock has expanded time zone content and city-management support sections.",
  },
  {
    path: "/debt-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Debt clock has expanded estimate-focused content and clear non-authoritative wording.",
  },
  {
    path: "/current-local-time",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Current local time page has expanded browser-time and time zone support content.",
  },
  {
    path: "/utc-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "UTC clock now has expanded UTC-use guidance, device-clock limitation notes, ISO details, and related time-tool links.",
  },
  {
    path: "/24-hour-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent 24-hour clock route has live 24-hour display, seconds/date toggles, local or UTC mode, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/12-hour-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent 12-hour clock route has AM/PM-first live display, seconds/date toggles, comparison, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/military-time-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Military time clock has route-specific live 24-hour clock content, copy/fullscreen controls, and format notes.",
  },
  {
    path: "/analog-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Analog clock has expanded content supporting the custom clock face.",
  },
  {
    path: "/smooth-second-hand-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Smooth second hand clock has utility-first analog display, fullscreen support, and route-specific support content.",
  },
  {
    path: "/digital-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Digital clock has expanded route-specific clock content and fullscreen support notes.",
  },
  {
    path: "/clock-with-seconds",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent clock with seconds route has seconds-first live display, 12/24-hour toggle, date, copy, fullscreen support, and route-specific content.",
  },
  {
    path: "/clock-with-milliseconds",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Clock with milliseconds has a utility-first live millisecond display, copy/fullscreen controls, and route-specific support content.",
  },
  {
    path: "/binary-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Binary clock has expanded explanation content for the binary display.",
  },
  {
    path: "/hexadecimal-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Hexadecimal clock has expanded content explaining the hexadecimal display.",
  },
  {
    path: "/event-countdown",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Event countdown has expanded event-specific setup and sharing content.",
  },
  {
    path: "/new-year-countdown",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Direct-intent New Year countdown route has automatic next-January-1 targeting, copy/share, fullscreen support, and route-specific content.",
  },
  {
    path: "/golden-hour-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Golden hour route has expanded solar-window content and approximation notes.",
  },
  {
    path: "/moon-phase-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Moon phase route has expanded phase, illumination, and limitation content.",
  },
  {
    path: "/astronomical-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Astronomical clock has expanded route-specific content and approximation wording.",
  },
  {
    path: "/epoch-unix-time-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Epoch Unix time route has expanded timestamp conversion content and device-clock notes.",
  },
  {
    path: "/swatch-internet-time-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Swatch Internet Time clock now has expanded @beats explanation, Biel/UTC+1 notes, novelty limitations, and related links.",
  },
  {
    path: "/billable-hours-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Billable hours clock has expanded estimate and billing workflow content.",
  },
  {
    path: "/time-blocking-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Time blocking clock now has expanded block-boundary, schedule editing, Pomodoro distinction, and related planning links.",
  },
  {
    path: "/atomic-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Atomic clock route has expanded device-clock limitation content and avoids precision overclaims.",
  },
  {
    path: "/time-zone-converter",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Time zone converter has expanded conversion, DST, and workflow support content.",
  },
  {
    path: "/binary-stopwatch",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Binary stopwatch has expanded explanation content for the specialty stopwatch display.",
  },
  {
    path: "/roman-numeral-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Roman numeral clock now has expanded specialty-display explanation, wrapping limitations, use guidance, and related clock links.",
  },
  {
    path: "/retro-flip-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Retro flip clock now has expanded flip-display, settings, fullscreen, copy, and related clock-style content.",
  },
  {
    path: "/minimalist-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Minimalist clock has expanded content while preserving the quiet clock surface.",
  },
  {
    path: "/reaction-time-test",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Reaction time test now has expanded result interpretation, false-start, latency limitation, non-clinical, and related timing content.",
  },
  {
    path: "/metronome",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Metronome has expanded BPM, practice, and sound-control support content.",
  },
  {
    path: "/bpm-tapper",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "BPM tapper has expanded measurement, averaging, and limitation content.",
  },
  {
    path: "/military-time-converter",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Military time converter has expanded conversion examples and support sections.",
  },
  {
    path: "/work-hours-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Work hours calculator has expanded calculation content and no payroll guarantee wording.",
  },
  {
    path: "/time-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Time calculator now has expanded add/subtract, duration, validation, non-payroll limitation, and related calculator content.",
  },
  {
    path: "/time-duration-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Time duration calculator has result-first start/end time duration math, overnight handling, copy/reset actions, and route-specific support content.",
  },
  {
    path: "/date-duration-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Date duration calculator has result-first elapsed day calculations, inclusive count, weekday context, copy/reset shortcuts, and route-specific support content.",
  },
  {
    path: "/date-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Date calculator has result-first date add/subtract behavior, presets, copy/reset shortcuts, month-end notes, and route-specific support content.",
  },
  {
    path: "/business-days-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Business days calculator has result-first weekday counting, weekend exclusion settings, copy/reset shortcuts, and route-specific support content.",
  },
  {
    path: "/age-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Age calculator has result-first years/months/days math, total-day context, copy/today/reset actions, and route-specific support content.",
  },
  {
    path: "/days-until-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Days until calculator has result-first target-date counting, preset target dates, copy/reset actions, and route-specific support content.",
  },
  {
    path: "/weekday-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Weekday calculator has result-first single-date weekday lookup, weekday/weekend context, copy/today/reset actions, and route-specific support content.",
  },
  {
    path: "/billable-hours-calculator",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Billable hours calculator has expanded estimate and billing support content.",
  },
  {
    path: "/milliseconds-converter",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Milliseconds converter has expanded examples, FAQ, and precision notes.",
  },
  {
    path: "/unix-timestamp-converter",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Unix timestamp converter has timestamp conversion utility content, examples, FAQ, and UTC/local limitation notes.",
  },
  {
    path: "/chess-clock",
    eligibility: "eligible-tool-page",
    allowedSlots: FULL_TOOL_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Chess clock has utility-first two-player timing, presets, increment controls, fullscreen support, and route-specific support content.",
  },
  {
    path: "/privacy",
    eligibility: "legal-limited",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Legal page should not receive the normal tool-page ad layout.",
  },
  {
    path: "/terms",
    eligibility: "legal-limited",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Legal page should not receive the normal tool-page ad layout.",
  },
  {
    path: "/cookies",
    eligibility: "legal-limited",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Legal page should not receive the normal tool-page ad layout.",
  },
  {
    path: "/sitemap",
    eligibility: "navigation-limited",
    allowedSlots: NO_AD_SLOTS,
    contentExpansionNeeded: false,
    reason:
      "Navigation page is link-dense and higher accidental-click risk, so it stays ad-free by default.",
  },
] as const satisfies readonly RouteMonetizationConfig[];

export const routeMonetizationByPath: Readonly<Record<string, RouteMonetizationConfig>> =
  Object.fromEntries(routeMonetization.map((entry) => [entry.path, entry]));

export function getRouteMonetization(path: string) {
  return routeMonetizationByPath[path];
}

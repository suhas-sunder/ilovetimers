/**
 * @typedef {{ href: string, label: string }} PresetTimerLink
 * @typedef {{ question: string, answer: string }} PresetTimerFaq
 *
 * @typedef {Object} PresetDurationTimerConfig
 * @property {string} key
 * @property {string} path
 * @property {string} title
 * @property {string} h1
 * @property {string} shortDescription
 * @property {string} metaTitle
 * @property {string} metaDescription
 * @property {readonly string[]} keywords
 * @property {number} seconds
 * @property {string} durationLabel
 * @property {string} defaultDisplay
 * @property {string} displayLabel
 * @property {string} statusLabel
 * @property {string} soundLabel
 * @property {string} fullscreenTitle
 * @property {string} overviewTitle
 * @property {readonly string[]} overviewParagraphs
 * @property {string} practicalTitle
 * @property {string} practicalIntro
 * @property {readonly string[]} useCases
 * @property {string} durationTitle
 * @property {string} durationParagraph
 * @property {string} limitationParagraph
 * @property {string} relatedIntro
 * @property {readonly PresetTimerLink[]} relatedLinks
 * @property {readonly PresetTimerLink[]} presetLinks
 * @property {readonly PresetTimerFaq[]} faqItems
 */

export const secondsTimerContent = Object.freeze({
  path: "/seconds-timer",
  title: "Seconds Timer",
  h1: "Seconds Timer",
  shortDescription:
    "Set a short whole-second countdown with quick presets, custom seconds, sound, copy, and fullscreen controls.",
  metaTitle: "Seconds Timer Online | Set a Short Countdown",
  metaDescription:
    "Choose 5 to 90 second presets or enter custom seconds. Start, pause, copy the remaining time, enable sound, or open the countdown fullscreen.",
  keywords: [
    "seconds timer",
    "timer with seconds",
    "online seconds timer",
    "short countdown",
  ],
  defaultSeconds: 30,
  defaultDisplay: "30s",
  overviewTitle: "Set a countdown in whole seconds",
  overviewParagraphs: [
    "The timer opens at 30 seconds. Choose a 5, 10, 15, 30, 45, 60, or 90 second preset, or enter any whole-second duration from 1 to 86,400 before you start.",
    "Start and pause the countdown from the main controls. Reset returns to the duration you selected, while Copy remaining gives you the current display as text.",
  ],
  practicalTitle: "Practical uses for short countdowns",
  practicalIntro:
    "Whole-second timing works best for brief activities where a minute-based timer would be too coarse.",
  useCases: [
    "Give a class a short response window or transition cue",
    "Time an exercise hold, rest, or practice interval",
    "Set a turn limit for a game or group activity",
    "Run a brief equipment, process, or presentation check",
  ],
  durationTitle: "Choosing a short duration",
  durationParagraph:
    "Five to 15 seconds suits a quick cue or check. Thirty seconds gives a little more room for a response or exercise interval, while 60 to 90 seconds is useful when the task needs a full minute or more without switching to a minute-based page.",
  limitationParagraph:
    "The countdown reconciles against the browser performance clock, but screen refresh, browser scheduling, inactive tabs, and device sleep can affect visible updates or the final sound.",
  relatedIntro:
    "Move to a ready-made one-minute countdown, use a custom minutes-and-seconds timer, or choose a tool designed for repeated intervals or millisecond input.",
  relatedLinks: [
    { href: "/1-minute-timer", label: "Start a one-minute countdown" },
    { href: "/countdown-timer", label: "Set a custom countdown" },
    { href: "/interval-timer", label: "Run repeated work and rest intervals" },
    { href: "/millisecond-timer", label: "Use millisecond input and display" },
  ],
  faqItems: [
    {
      question: "Can I set a timer for only a few seconds?",
      answer:
        "Yes. Choose a preset such as 5, 10, 15, or 30 seconds, or enter a custom whole-second value before starting.",
    },
    {
      question: "What happens when I reset the seconds timer?",
      answer:
        "Reset stops the countdown and returns it to the preset or custom number of seconds you most recently applied.",
    },
    {
      question: "How is this different from a millisecond timer?",
      answer:
        "This page accepts whole seconds and keeps the display simple. The millisecond timer supports millisecond input and a millisecond display.",
    },
  ],
});

/** @satisfies {Record<string, PresetDurationTimerConfig>} */
export const presetDurationTimerConfigs = Object.freeze({
  oneMinute: {
    key: "one-minute",
    path: "/1-minute-timer",
    title: "1 Minute Timer",
    h1: "1 Minute Timer",
    shortDescription:
      "Start a timer already set to one minute for quick transitions, drills, speaking practice, and short tasks.",
    metaTitle: "1 Minute Timer Online | Start a 60-Second Countdown",
    metaDescription:
      "Start a timer already set to 1:00 for quick transitions, speech practice, or a short task. Pause, reset, enable a final beep, or use fullscreen.",
    keywords: [
      "1 minute timer",
      "one minute timer",
      "60 second timer",
      "one minute countdown",
    ],
    seconds: 60,
    durationLabel: "one minute",
    defaultDisplay: "1:00",
    displayLabel: "60-second countdown",
    statusLabel: "1 minute ready",
    soundLabel: "Final beep",
    fullscreenTitle: "1 Minute Timer",
    overviewTitle: "A one-minute countdown ready to start",
    overviewParagraphs: [
      "This page opens at 1:00 and waits for you to press Start. Pause holds the remaining time, Resume continues it, and Reset returns the display to one minute.",
      "The duration is fixed on this route so a short task can begin without setup. Use the general countdown timer when you need to enter another time.",
    ],
    practicalTitle: "Practical uses for one minute",
    practicalIntro:
      "One minute creates a visible endpoint without turning a brief task into a longer session.",
    useCases: [
      "Move a class or group between activities",
      "Practice a one-minute introduction or speaking response",
      "Run a short writing, brainstorming, or review prompt",
      "Set a quick game turn or equipment check",
    ],
    durationTitle: "How one minute feels in practice",
    durationParagraph:
      "Sixty seconds is long enough to complete a small action or gather a response, but short enough to keep attention on the countdown. Choose the seconds timer for a briefer cue or a five-minute timer when the task needs room to develop.",
    limitationParagraph:
      "The timer reconciles against the browser performance clock. Screen refresh, browser scheduling, inactive tabs, device sleep, and audio settings can still affect visible updates or the final beep.",
    relatedIntro:
      "Choose a shorter seconds-based cue, move to a five-minute task block, set a custom duration, or measure elapsed time instead.",
    relatedLinks: [
      { href: "/seconds-timer", label: "Set a countdown in seconds" },
      { href: "/5-minute-timer", label: "Start a five-minute task timer" },
      { href: "/countdown-timer", label: "Choose a custom duration" },
      { href: "/stopwatch", label: "Measure elapsed time with a stopwatch" },
    ],
    presetLinks: [
      { href: "/seconds-timer", label: "Seconds timer" },
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: [
      {
        question: "Does the 1 minute timer start automatically?",
        answer:
          "No. It opens ready at 1:00, and the countdown begins only when you press Start.",
      },
      {
        question: "Can I change the one-minute preset on this page?",
        answer:
          "This route stays fixed at one minute. Use the general countdown timer for a custom duration or follow one of the nearby preset links.",
      },
      {
        question: "Will the timer continue in another tab?",
        answer:
          "It continues reconciling elapsed time while the page remains open, but background throttling or device sleep can delay the display and final sound.",
      },
    ],
  },
  fiveMinute: {
    key: "five-minute",
    path: "/5-minute-timer",
    title: "5 Minute Timer",
    h1: "5 Minute Timer",
    shortDescription:
      "Begin a five-minute countdown for a quick break, small task, classroom transition, or presentation warning.",
    metaTitle: "5 Minute Timer Online | Quick Break or Task Countdown",
    metaDescription:
      "Run a five-minute countdown for a short break, classroom transition, quick cleanup, or presentation warning, with pause, reset, sound, and fullscreen.",
    keywords: [
      "5 minute timer",
      "five minute timer",
      "5 minute countdown",
      "short break timer",
    ],
    seconds: 300,
    durationLabel: "five minutes",
    defaultDisplay: "5:00",
    displayLabel: "Five-minute countdown",
    statusLabel: "5 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "5 Minute Timer",
    overviewTitle: "Start a five-minute task without setup",
    overviewParagraphs: [
      "The countdown is already set to 5:00. Start it when the activity begins, pause and resume if the task is interrupted, or Reset to begin a fresh five-minute block.",
      "This route does not change its default duration. It is a direct shortcut for occasions when five minutes is the intended limit.",
    ],
    practicalTitle: "What fits into five minutes",
    practicalIntro:
      "Five minutes works for a small, clearly bounded action rather than a full work session.",
    useCases: [
      "Take a brief screen or movement break",
      "Tidy one surface or complete a small household task",
      "Give a class time to transition or finish a response",
      "Show a five-minute warning before a presentation or meeting change",
      "Time a short warmup, rest, or practice drill",
    ],
    durationTitle: "How five minutes feels in practice",
    durationParagraph:
      "Five minutes gives more breathing room than a transition cue while keeping the finish close. It suits one small objective; choose ten or 15 minutes when the activity involves sustained reading, discussion, or focused work.",
    limitationParagraph:
      "Keep the page open and the device awake when the ending matters. Background throttling, sleep mode, volume, mute state, and browser audio permissions can affect what you see or hear at zero.",
    relatedIntro:
      "Move down to a one-minute cue, allow ten minutes for a larger task, use a break workflow, or set an entirely custom countdown.",
    relatedLinks: [
      { href: "/1-minute-timer", label: "Use a one-minute transition timer" },
      { href: "/10-minute-timer", label: "Give the task ten minutes" },
      { href: "/break-timer", label: "Choose a flexible break timer" },
      { href: "/countdown-timer", label: "Set a custom countdown" },
    ],
    presetLinks: [
      { href: "/1-minute-timer", label: "1 minute" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: [
      {
        question: "What happens when I reset the 5 minute timer?",
        answer:
          "Reset stops the current countdown and returns the display to 5:00, ready for another five-minute block.",
      },
      {
        question: "Is five minutes useful for a short break?",
        answer:
          "Yes. It can create a clear return point for a brief break, quick cleanup, transition, or warmup without managing a longer schedule.",
      },
      {
        question: "Will the final sound always play?",
        answer:
          "Not always. Browser audio depends on prior interaction, device volume and mute state, and whether the browser and device remain active.",
      },
    ],
  },
  tenMinute: {
    key: "ten-minute",
    path: "/10-minute-timer",
    title: "10 Minute Timer",
    h1: "10 Minute Timer",
    shortDescription:
      "Start a ten-minute block for reading, household tasks, workout segments, cooking checks, or meeting agenda items.",
    metaTitle: "10 Minute Timer Online | Start, Pause and Fullscreen",
    metaDescription:
      "Start a 10:00 countdown for reading, a household task, workout block, or meeting segment. Pause or reset it, enable sound, and use fullscreen.",
    keywords: [
      "10 minute timer",
      "ten minute timer",
      "10 minute countdown",
      "ten minute task timer",
    ],
    seconds: 600,
    durationLabel: "ten minutes",
    defaultDisplay: "10:00",
    displayLabel: "Ten-minute countdown",
    statusLabel: "10 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "10 Minute Timer",
    overviewTitle: "A ten-minute block with a clear finish",
    overviewParagraphs: [
      "This page loads at 10:00 so you can begin a medium-short activity immediately. Pause preserves the remaining time, Resume continues it, and Reset returns to ten minutes.",
      "Use the fullscreen control when the countdown should be visible to a group or from across a room.",
    ],
    practicalTitle: "Tasks that fit a ten-minute timer",
    practicalIntro:
      "Ten minutes can hold a meaningful step without committing to a full focus session.",
    useCases: [
      "Read or review one short section",
      "Complete a focused household or desk task",
      "Time one meeting agenda item or group discussion",
      "Run a workout, practice, or rest block",
      "Set a general cooking or preparation check",
    ],
    durationTitle: "How ten minutes feels in practice",
    durationParagraph:
      "Ten minutes is long enough to settle into a single task but short enough to maintain a firm boundary. Five minutes works better for a quick warning, while 15 minutes gives more room for study, rehearsal, or station work.",
    limitationParagraph:
      "This is an everyday browser timer. Inactive tabs, device sleep, battery-saving behavior, display refresh, and audio settings can affect the visible or audible finish.",
    relatedIntro:
      "Choose a five-minute warning, extend the activity to 15 minutes, use a timer built for study, or enter a custom duration.",
    relatedLinks: [
      { href: "/5-minute-timer", label: "Start a shorter five-minute timer" },
      { href: "/15-minute-timer", label: "Extend the block to 15 minutes" },
      { href: "/study-timer", label: "Set up a dedicated study countdown" },
      { href: "/countdown-timer", label: "Enter a custom time" },
    ],
    presetLinks: [
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/30-minute-timer", label: "30 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: [
      {
        question: "How is this different from the general countdown timer?",
        answer:
          "This page opens directly at 10:00. The general countdown timer is the better choice when you need to enter custom hours, minutes, or seconds.",
      },
      {
        question: "Can I show the 10 minute timer fullscreen?",
        answer:
          "Yes. Fullscreen keeps the countdown and essential controls visible without adding supporting page content to the fullscreen view.",
      },
      {
        question: "What happens if I pause and resume?",
        answer:
          "Pause holds the displayed remaining time. Resume continues from that point, while Reset returns the timer to 10:00.",
      },
    ],
  },
  fifteenMinute: {
    key: "fifteen-minute",
    path: "/15-minute-timer",
    title: "15 Minute Timer",
    h1: "15 Minute Timer",
    shortDescription:
      "Use a 15-minute countdown for study review, classroom station work, rehearsal, focused chores, or a quiet break.",
    metaTitle: "15 Minute Timer Online | Focus and Activity Countdown",
    metaDescription:
      "Use a timer preset to 15:00 for study review, station work, rehearsal, or a focused household task. Includes pause, reset, sound, and fullscreen.",
    keywords: [
      "15 minute timer",
      "fifteen minute timer",
      "15 minute countdown",
      "15 minute focus timer",
    ],
    seconds: 900,
    durationLabel: "fifteen minutes",
    defaultDisplay: "15:00",
    displayLabel: "Fifteen-minute countdown",
    statusLabel: "15 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "15 Minute Timer",
    overviewTitle: "Start one focused 15-minute session",
    overviewParagraphs: [
      "The timer is ready at 15:00 for a single fixed session. Start begins the countdown, Pause and Resume handle an interruption, and Reset restores the full 15 minutes.",
      "It does not schedule repeated work and break cycles. For that workflow, use the Pomodoro timer or another focus-specific tool.",
    ],
    practicalTitle: "Ways to use a 15-minute block",
    practicalIntro:
      "Fifteen minutes supports a focused activity that needs more than a quick reminder but still benefits from a near-term endpoint.",
    useCases: [
      "Review notes or complete one homework section",
      "Run a classroom station or small-group activity",
      "Rehearse part of a presentation or performance",
      "Finish a bounded cleanup or household task",
      "Take a quiet break before returning to work",
    ],
    durationTitle: "How 15 minutes feels in practice",
    durationParagraph:
      "A quarter hour is enough time to make visible progress on one objective without becoming a long session. Ten minutes keeps the block tighter; 30 minutes better suits work that needs a sustained start and finish.",
    limitationParagraph:
      "The countdown remains a browser-based tool. Background throttling, device sleep, screen refresh, volume, and audio permissions can delay visible updates or the final beep.",
    relatedIntro:
      "Move to a tighter ten-minute block, allow a full half hour, use a dedicated focus session, or rehearse with presentation-specific controls.",
    relatedLinks: [
      { href: "/10-minute-timer", label: "Use a tighter ten-minute block" },
      { href: "/30-minute-timer", label: "Allow a full half hour" },
      { href: "/focus-session-timer", label: "Run a focused work session" },
      { href: "/presentation-timer", label: "Time a presentation or rehearsal" },
    ],
    presetLinks: [
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/30-minute-timer", label: "30 minutes" },
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: [
      {
        question: "Is the duration fixed at 15 minutes on this page?",
        answer:
          "Yes. This route always opens and resets to 15:00. Use the general countdown timer when you need another custom duration.",
      },
      {
        question: "Is this the same as a Pomodoro timer?",
        answer:
          "No. This is one standalone 15-minute countdown. The Pomodoro timer manages repeated work and break phases.",
      },
      {
        question: "Does the timer keep its place after I pause it?",
        answer:
          "Yes. Pause holds the remaining time and Resume continues from that point. Reset is the control that returns it to 15:00.",
      },
    ],
  },
  thirtyMinute: {
    key: "thirty-minute",
    path: "/30-minute-timer",
    title: "30 Minute Timer",
    h1: "30 Minute Timer",
    shortDescription:
      "Start one half-hour countdown for focused work, study, practice, a meeting segment, a workout, or a longer household task.",
    metaTitle: "30 Minute Timer Online | Half-Hour Countdown",
    metaDescription:
      "Start a half-hour countdown for focused work, study, practice, a meeting segment, or a workout. Pause, reset, enable sound, or open fullscreen.",
    keywords: [
      "30 minute timer",
      "thirty minute timer",
      "half hour timer",
      "30 minute countdown",
    ],
    seconds: 1800,
    durationLabel: "thirty minutes",
    defaultDisplay: "30:00",
    displayLabel: "Half-hour countdown",
    statusLabel: "30 minutes ready",
    soundLabel: "Final beep",
    fullscreenTitle: "30 Minute Timer",
    overviewTitle: "A standalone half-hour countdown",
    overviewParagraphs: [
      "This page opens ready at 30:00. Start begins the half hour, Pause and Resume preserve your place, and Reset prepares another full 30-minute session.",
      "The page runs one countdown rather than alternating work and break phases. That distinction makes it useful when the activity needs one uninterrupted endpoint.",
    ],
    practicalTitle: "What fits into half an hour",
    practicalIntro:
      "Thirty minutes gives enough room for sustained progress while keeping the finish visible.",
    useCases: [
      "Complete a focused study, writing, or project block",
      "Run a workout, music practice, or rehearsal session",
      "Time a meeting segment, workshop exercise, or class activity",
      "Set an endpoint for a larger household or preparation task",
      "Use one longer focus period without automatic break cycles",
    ],
    durationTitle: "How 30 minutes feels in practice",
    durationParagraph:
      "A half hour supports deeper work than a short warning timer but is still easy to fit into a schedule. Choose 15 minutes for a smaller objective, or use a custom countdown when the activity needs more than 30 minutes.",
    limitationParagraph:
      "For a longer browser session, keep the tab open and the device awake. Browser suspension, battery-saving behavior, device sleep, mute state, and audio permissions can affect completion updates or sound.",
    relatedIntro:
      "Use a shorter 15-minute block, choose a work-and-break cycle, set up a dedicated focus session, or enter a longer custom duration.",
    relatedLinks: [
      { href: "/15-minute-timer", label: "Choose a shorter 15-minute block" },
      { href: "/pomodoro-timer", label: "Run repeated work and break cycles" },
      { href: "/focus-session-timer", label: "Set up a focused session" },
      { href: "/countdown-timer", label: "Enter a different countdown length" },
    ],
    presetLinks: [
      { href: "/15-minute-timer", label: "15 minutes" },
      { href: "/10-minute-timer", label: "10 minutes" },
      { href: "/5-minute-timer", label: "5 minutes" },
      { href: "/countdown-timer", label: "Custom countdown" },
    ],
    faqItems: [
      {
        question: "Is this 30 minute timer a Pomodoro timer?",
        answer:
          "No. This page runs one 30-minute countdown. The Pomodoro timer is designed to alternate work and break phases.",
      },
      {
        question: "What happens if the browser or device sleeps?",
        answer:
          "The page reconciles elapsed time when it can run again, but sleep or browser suspension can delay the visible completion state and final sound.",
      },
      {
        question: "Can I use the half-hour timer fullscreen?",
        answer:
          "Yes. Fullscreen keeps the large countdown and essential controls visible, which is useful across a room or on a shared display.",
      },
    ],
  },
});

/**
 * Canonical, task-based discovery links used below selected tool pages.
 * Keep this data free of redirect aliases, query strings, and fragments.
 */

import { SITEMAP_GROUPS } from "./siteDirectory.js";
import {
  STAGE3_NEW_REDIRECTS,
  STAGE3_NOINDEX_ROUTE_SET,
  STAGE3_REDIRECT_SOURCE_SET,
} from "../../config/routeArchitecture.js";

export const FOOTER_TOOL_LINKS = Object.freeze([
  { to: "/countdown-timer", label: "Countdown timer" },
  { to: "/stopwatch", label: "Stopwatch" },
  { to: "/online-alarm-clock", label: "Online alarm clock" },
  { to: "/pomodoro-timer", label: "Pomodoro timer" },
  { to: "/world-clock", label: "World clock" },
  { to: "/time-zone-converter", label: "Time zone converter" },
  { to: "/date-calculator", label: "Date calculator" },
  { to: "/work-hours-calculator", label: "Work hours calculator" },
  { to: "/military-time-converter", label: "Military time converter" },
  { to: "/metronome", label: "Metronome" },
]);

const PRIORITY_CONTEXTUAL_ROUTE_SEEDS = Object.freeze([
  "/timer-stopwatch",
  "/timer-clock",
  "/study-stopwatch",
  "/stopwatch",
  "/stopwatch-with-milliseconds",
  "/study-timer",
  "/pomodoro-timer",
  "/clock-with-milliseconds",
  "/world-clock-with-milliseconds",
  "/atomic-clock",
  "/military-time-converter",
  "/milliseconds-converter",
  "/utc-clock",
  "/epoch-unix-time-clock",
  "/unix-timestamp-converter",
  "/time-zone-converter",
  "/time-zone-meeting-planner",
  "/business-days-calculator",
  "/work-hours-calculator",
  "/time-card-calculator",
  "/weekly-timesheet-calculator",
  "/online-alarm-clock",
  "/metronome",
]);

/**
 * @param {string} heading
 * @param {Array<{to: string, label: string}>} links
 */
const group = (heading, links) => Object.freeze({ heading, links: Object.freeze(links) });

const RAW_RELATED_TOOL_LINKS = Object.freeze({
  "/countdown-timer": group("Related countdown and elapsed-time tools", [
    { to: "/timer-stopwatch", label: "Switch between a countdown and stopwatch" },
    { to: "/timer-clock", label: "Keep current local time beside the countdown" },
    { to: "/online-timer", label: "Use presets, sound, and optional looping" },
    { to: "/multiple-timers", label: "Run several independent countdowns" },
    { to: "/stopwatch", label: "Measure open-ended elapsed time" },
  ]),
  "/timer-clock": group("Choose another clock or timer view", [
    { to: "/countdown-timer", label: "Open the dedicated countdown timer" },
    { to: "/digital-clock", label: "View a standard local digital clock" },
    { to: "/clock-with-seconds", label: "Focus on current time with seconds" },
    { to: "/timer-stopwatch", label: "Switch between countdown and stopwatch modes" },
  ]),
  "/timer-stopwatch": group("Choose another timing view", [
    { to: "/countdown-timer", label: "Open the dedicated countdown timer" },
    { to: "/stopwatch", label: "Use the general lap stopwatch" },
    { to: "/stopwatch-with-milliseconds", label: "Focus on a millisecond stopwatch display" },
    { to: "/study-stopwatch", label: "Track an open-ended study session" },
  ]),
  "/stopwatch": group("More ways to measure elapsed time", [
    { to: "/timer-stopwatch", label: "Use a countdown and stopwatch together" },
    { to: "/stopwatch-with-milliseconds", label: "Use a stopwatch with a millisecond display" },
    { to: "/count-up-timer", label: "Run a count-up timer" },
    { to: "/study-stopwatch", label: "Track an open-ended study session" },
    { to: "/countdown-timer", label: "Count down to a finish" },
  ]),
  "/stopwatch-with-milliseconds": group("Related millisecond tools", [
    { to: "/stopwatch", label: "Use the standard stopwatch" },
    { to: "/timer-stopwatch", label: "Combine a countdown and stopwatch" },
    { to: "/millisecond-timer", label: "Set a millisecond countdown" },
    { to: "/clock-with-milliseconds", label: "View local time with milliseconds" },
    { to: "/milliseconds-converter", label: "Convert millisecond values" },
  ]),
  "/count-up-timer": group("Related elapsed-time tools", [
    { to: "/stopwatch", label: "Measure laps with the stopwatch" },
    { to: "/timer-stopwatch", label: "Switch between counting down and up" },
    { to: "/study-stopwatch", label: "Track an open-ended study session" },
    { to: "/meeting-count-up-timer", label: "Track how long a meeting runs" },
    { to: "/countdown-timer", label: "Count down from a fixed duration" },
  ]),
  "/speedcubing-timer": group("Other reaction and elapsed-time tools", [
    { to: "/stopwatch-with-milliseconds", label: "Use a millisecond stopwatch" },
    { to: "/reaction-time-test", label: "Estimate browser-based reaction time" },
    { to: "/speedrun-timer", label: "Track a run with splits" },
  ]),
  "/speedrun-timer": group("Other timing tools for attempts", [
    { to: "/stopwatch-with-milliseconds", label: "Measure elapsed time with milliseconds" },
    { to: "/speedcubing-timer", label: "Time repeated solves" },
    { to: "/count-up-timer", label: "Run a simple count-up timer" },
  ]),
  "/reaction-time-test": group("Related measurement tools", [
    { to: "/stopwatch-with-milliseconds", label: "Use a browser stopwatch with milliseconds" },
    { to: "/stopwatch", label: "Measure ordinary elapsed time" },
    { to: "/speedcubing-timer", label: "Track repeated solve times" },
  ]),

  "/study-timer": group("Choose another focus format", [
    { to: "/study-stopwatch", label: "Track an open-ended study session" },
    { to: "/focus-session-timer", label: "Run one focused work block" },
    { to: "/pomodoro-timer", label: "Alternate work and break cycles" },
    { to: "/break-timer", label: "Set a short break countdown" },
  ]),
  "/study-stopwatch": group("Choose another study timing method", [
    { to: "/study-timer", label: "Set a fixed study countdown" },
    { to: "/focus-session-timer", label: "Run one planned focus block" },
    { to: "/pomodoro-timer", label: "Alternate repeated work and break cycles" },
    { to: "/stopwatch", label: "Use the general lap stopwatch" },
  ]),
  "/focus-session-timer": group("Other ways to structure focus time", [
    { to: "/study-stopwatch", label: "Track study time without a fixed end" },
    { to: "/study-timer", label: "Set a fixed study countdown" },
    { to: "/pomodoro-timer", label: "Use repeated focus and break cycles" },
    { to: "/break-timer", label: "Take a standalone timed break" },
    { to: "/productivity-timer", label: "Open the broader productivity timer" },
  ]),
  "/pomodoro-timer": group("Related study and break timers", [
    { to: "/study-stopwatch", label: "Track one open-ended study session" },
    { to: "/focus-session-timer", label: "Run a single focus session" },
    { to: "/study-timer", label: "Set a straightforward study timer" },
    { to: "/break-timer", label: "Time a short rest" },
  ]),
  "/productivity-timer": group("Other focus workflows", [
    { to: "/focus-session-timer", label: "Run one focused session" },
    { to: "/pomodoro-timer", label: "Use structured work and break cycles" },
    { to: "/time-blocking-clock", label: "Follow time blocks on a clock" },
  ]),
  "/break-timer": group("Return to focused work", [
    { to: "/study-timer", label: "Start a fixed study countdown" },
    { to: "/pomodoro-timer", label: "Run a Pomodoro cycle" },
    { to: "/focus-session-timer", label: "Begin one focused block" },
    { to: "/countdown-timer", label: "Set a general-purpose countdown" },
  ]),
  "/online-timer": group("Choose another timer workflow", [
    { to: "/countdown-timer", label: "Use the definitive general countdown" },
    { to: "/timer-clock", label: "Keep current local time visible while counting down" },
    { to: "/timer-stopwatch", label: "Combine countdown and stopwatch modes" },
    { to: "/multiple-timers", label: "Run several countdowns at once" },
    { to: "/study-timer", label: "Set a focused study countdown" },
    { to: "/pomodoro-timer", label: "Run repeated work and break cycles" },
  ]),
  "/time-blocking-clock": group("Related planning and focus tools", [
    { to: "/productivity-timer", label: "Use a broader productivity timer" },
    { to: "/pomodoro-timer", label: "Work in focus and break cycles" },
    { to: "/meeting-agenda-timer", label: "Run a timed agenda" },
  ]),

  "/clock-with-milliseconds": group("More millisecond and time displays", [
    { to: "/clock-with-seconds", label: "Use a calmer local clock with seconds" },
    { to: "/utc-clock", label: "View current UTC time" },
    { to: "/milliseconds-converter", label: "Convert milliseconds to other units" },
    { to: "/stopwatch-with-milliseconds", label: "Measure elapsed time with millisecond digits" },
  ]),
  "/world-clock-with-milliseconds": group("Related world and millisecond clocks", [
    { to: "/clock-with-milliseconds", label: "View local time with milliseconds" },
    { to: "/world-clock-with-seconds", label: "Use a calmer seconds display" },
    { to: "/utc-clock", label: "Compare with current UTC time" },
  ]),
  "/atomic-clock": group("Compare device-based time displays", [
    { to: "/clock-with-milliseconds", label: "View local time with millisecond digits" },
    { to: "/utc-clock", label: "View the device-derived UTC time" },
    { to: "/world-clock-with-milliseconds", label: "Compare world times with milliseconds" },
  ]),
  "/utc-clock": group("Related UTC and system-time tools", [
    { to: "/epoch-unix-time-clock", label: "View current Unix and epoch values" },
    { to: "/time-zone-converter", label: "Convert a time between zones" },
    { to: "/clock-with-milliseconds", label: "View local time with milliseconds" },
    { to: "/atomic-clock", label: "See the device-based atomic-style display" },
  ]),
  "/epoch-unix-time-clock": group("More Unix and unit tools", [
    { to: "/unix-timestamp-converter", label: "Convert a Unix timestamp" },
    { to: "/utc-clock", label: "View current UTC time" },
    { to: "/milliseconds-converter", label: "Convert milliseconds and seconds" },
  ]),
  "/milliseconds-converter": group("Related millisecond tools", [
    { to: "/millisecond-timer", label: "Set a countdown in milliseconds" },
    { to: "/clock-with-milliseconds", label: "View a millisecond clock display" },
    { to: "/unix-timestamp-converter", label: "Convert Unix timestamp units" },
  ]),
  "/millisecond-timer": group("More millisecond tools", [
    { to: "/stopwatch-with-milliseconds", label: "Measure elapsed time with milliseconds" },
    { to: "/milliseconds-converter", label: "Convert a millisecond value" },
    { to: "/countdown-timer", label: "Use a standard countdown" },
  ]),
  "/unix-timestamp-converter": group("Related Unix and time displays", [
    { to: "/epoch-unix-time-clock", label: "View the current Unix timestamp" },
    { to: "/utc-clock", label: "View current UTC time" },
    { to: "/milliseconds-converter", label: "Convert milliseconds and seconds" },
  ]),

  "/military-time-converter": group("More 12-hour and 24-hour tools", [
    { to: "/military-time-clock", label: "View the current military-time clock" },
    { to: "/24-hour-clock", label: "Open a current 24-hour clock" },
    { to: "/12-hour-clock", label: "Compare with a 12-hour clock" },
    { to: "/utc-clock", label: "View UTC as a separate time standard" },
  ]),
  "/military-time-clock": group("Related military-time tools", [
    { to: "/military-time-converter", label: "Convert between military and standard time" },
    { to: "/24-hour-clock", label: "View a 24-hour clock" },
    { to: "/utc-clock", label: "View UTC separately" },
  ]),
  "/24-hour-clock": group("Compare clock formats", [
    { to: "/12-hour-clock", label: "View the same style in 12-hour time" },
    { to: "/military-time-converter", label: "Convert a specific military time" },
    { to: "/utc-clock", label: "View current UTC time" },
  ]),
  "/12-hour-clock": group("Compare clock formats", [
    { to: "/24-hour-clock", label: "Switch to a 24-hour display" },
    { to: "/military-time-converter", label: "Convert 12-hour and military time" },
    { to: "/clock-with-seconds", label: "View local time with seconds" },
  ]),

  "/world-clock": group("Plan and compare times", [
    { to: "/time-zone-converter", label: "Convert a specific time between zones" },
    { to: "/time-zone-meeting-planner", label: "Plan a meeting across time zones" },
    { to: "/world-clock-with-seconds", label: "View world clocks with seconds" },
    { to: "/world-clock-with-milliseconds", label: "Compare world times with millisecond digits" },
  ]),
  "/time-zone-converter": group("More timezone tools", [
    { to: "/time-zone-meeting-planner", label: "Plan a meeting across time zones" },
    { to: "/world-clock", label: "See several current local times" },
    { to: "/utc-clock", label: "View current UTC time" },
  ]),
  "/time-zone-meeting-planner": group("Related meeting and timezone tools", [
    { to: "/time-zone-converter", label: "Convert one time between zones" },
    { to: "/world-clock", label: "Compare current times around the world" },
    { to: "/meeting-timer", label: "Time an active meeting" },
    { to: "/meeting-agenda-timer", label: "Run a timed meeting agenda" },
  ]),
  "/world-clock-with-seconds": group("Other world-time displays", [
    { to: "/world-clock", label: "Use the standard world clock" },
    { to: "/world-clock-with-milliseconds", label: "Show world times with millisecond digits" },
    { to: "/utc-clock", label: "View current UTC time" },
  ]),
  "/meeting-timer": group("Plan or run a meeting", [
    { to: "/meeting-agenda-timer", label: "Run a timed meeting agenda" },
    { to: "/time-zone-meeting-planner", label: "Find a time across zones" },
    { to: "/meeting-count-up-timer", label: "Track how long the meeting runs" },
    { to: "/timer-clock", label: "Show local time beside a countdown" },
  ]),
  "/meeting-agenda-timer": group("Related meeting tools", [
    { to: "/meeting-timer", label: "Run a general meeting timer" },
    { to: "/time-zone-meeting-planner", label: "Plan a cross-zone meeting" },
    { to: "/presentation-timer", label: "Time a presentation" },
    { to: "/timer-clock", label: "Show local time beside a countdown" },
  ]),

  "/date-calculator": group("Choose another date calculation", [
    { to: "/date-duration-calculator", label: "Find the duration between dates" },
    { to: "/business-days-calculator", label: "Calculate business days" },
    { to: "/days-until-calculator", label: "Count down to a date" },
  ]),
  "/date-duration-calculator": group("Related date calculations", [
    { to: "/date-calculator", label: "Add or subtract time from a date" },
    { to: "/weeks-between-dates-calculator", label: "Count weeks between dates" },
    { to: "/months-between-dates-calculator", label: "Count months between dates" },
  ]),
  "/days-until-calculator": group("More date and countdown tools", [
    { to: "/date-calculator", label: "Add or subtract a date interval" },
    { to: "/hours-until-calculator", label: "Count hours to a date and time" },
    { to: "/event-countdown", label: "Run a live event countdown" },
  ]),
  "/weeks-between-dates-calculator": group("Related date-range tools", [
    { to: "/date-duration-calculator", label: "See a full date duration" },
    { to: "/months-between-dates-calculator", label: "Count months between dates" },
    { to: "/days-until-calculator", label: "Count days to a target date" },
  ]),
  "/months-between-dates-calculator": group("Related date-range tools", [
    { to: "/date-duration-calculator", label: "See a full date duration" },
    { to: "/weeks-between-dates-calculator", label: "Count weeks between dates" },
    { to: "/age-calculator", label: "Calculate age on a selected date" },
  ]),
  "/business-days-calculator": group("Related workday calculations", [
    { to: "/workdays-calculator", label: "Calculate workdays with weekend settings" },
    { to: "/date-duration-calculator", label: "Measure the full date span" },
    { to: "/date-calculator", label: "Add or subtract calendar time" },
  ]),
  "/workdays-calculator": group("Related workday and date tools", [
    { to: "/business-days-calculator", label: "Count business days between dates" },
    { to: "/date-calculator", label: "Add or subtract calendar time" },
    { to: "/date-duration-calculator", label: "Compare the full date duration" },
  ]),
  "/week-number-calculator": group("Related calendar tools", [
    { to: "/weekday-calculator", label: "Find the weekday for a date" },
    { to: "/date-calculator", label: "Add or subtract a date interval" },
    { to: "/weeks-between-dates-calculator", label: "Count weeks between dates" },
  ]),
  "/weekday-calculator": group("Related calendar tools", [
    { to: "/week-number-calculator", label: "Find the calendar week number" },
    { to: "/date-calculator", label: "Calculate a new date" },
    { to: "/days-until-calculator", label: "Count days until a date" },
  ]),
  "/age-calculator": group("Related age and date tools", [
    { to: "/date-duration-calculator", label: "Measure the full span between dates" },
    { to: "/months-between-dates-calculator", label: "Compare calendar months and days" },
    { to: "/date-calculator", label: "Add or subtract a date interval" },
  ]),
  "/hours-until-calculator": group("Related time-remaining tools", [
    { to: "/days-until-calculator", label: "Count calendar days to a date" },
    { to: "/time-duration-calculator", label: "Compare two clock times" },
    { to: "/countdown-to-date", label: "Run a live countdown to a date" },
  ]),
  "/time-calculator": group("Related time calculations", [
    { to: "/time-duration-calculator", label: "Find hours and minutes between times" },
    { to: "/hours-until-calculator", label: "Count hours to a date and time" },
    { to: "/work-hours-calculator", label: "Calculate one work shift" },
  ]),
  "/time-duration-calculator": group("Related elapsed-time tools", [
    { to: "/time-calculator", label: "Add or subtract durations" },
    { to: "/work-hours-calculator", label: "Subtract a break from one shift" },
    { to: "/hours-until-calculator", label: "Count hours to a dated target" },
  ]),

  "/work-hours-calculator": group("Choose the right work-time tool", [
    { to: "/time-card-calculator", label: "Enter daily clock-in and clock-out times" },
    { to: "/weekly-timesheet-calculator", label: "Track a full workweek" },
    { to: "/billable-hours-calculator", label: "Calculate billable time" },
  ]),
  "/time-card-calculator": group("Related work-time calculators", [
    { to: "/work-hours-calculator", label: "Calculate one work period" },
    { to: "/weekly-timesheet-calculator", label: "Total a full workweek" },
    { to: "/billable-hours-calculator", label: "Calculate billable hours" },
  ]),
  "/weekly-timesheet-calculator": group("Other ways to track work time", [
    { to: "/time-card-calculator", label: "Calculate daily time-card entries" },
    { to: "/work-hours-calculator", label: "Calculate a single work period" },
    { to: "/billable-hours-clock", label: "Run a live billable clock" },
  ]),
  "/billable-hours-calculator": group("Related billable-time tools", [
    { to: "/billable-hours-clock", label: "Track billable time live" },
    { to: "/work-hours-calculator", label: "Calculate one work period" },
    { to: "/weekly-timesheet-calculator", label: "Total a full workweek" },
  ]),
  "/billable-hours-clock": group("Related work-time tools", [
    { to: "/billable-hours-calculator", label: "Calculate existing billable entries" },
    { to: "/work-hours-calculator", label: "Calculate one work period" },
    { to: "/weekly-timesheet-calculator", label: "Total a workweek" },
  ]),

  "/online-alarm-clock": group("Other alarm and countdown tools", [
    { to: "/alarm-timer", label: "Run a duration-based alarm timer" },
    { to: "/silent-timer", label: "Use a countdown with no sound" },
    { to: "/countdown-timer", label: "Set a general countdown" },
  ]),
  "/alarm-timer": group("Related alarm tools", [
    { to: "/online-alarm-clock", label: "Set an alarm for a clock time" },
    { to: "/countdown-timer", label: "Use a simple countdown" },
    { to: "/timer-clock", label: "Keep local time beside a countdown" },
  ]),
  "/silent-timer": group("Other visual countdowns", [
    { to: "/countdown-timer", label: "Use a general countdown" },
    { to: "/presentation-timer", label: "Time a presentation quietly" },
    { to: "/classroom-timer", label: "Run a classroom countdown" },
  ]),
  "/metronome": group("Related rhythm tool", [
    { to: "/bpm-tapper", label: "Tap a tempo before opening the metronome" },
  ]),
  "/bpm-tapper": group("Continue with the measured tempo", [
    { to: "/metronome", label: "Open the metronome at a steady beat" },
  ]),

  "/pizza-timer": group("Other kitchen countdowns", [
    { to: "/kitchen-timer", label: "Use a general kitchen timer" },
    { to: "/cooking-timer", label: "Run a cooking countdown" },
    { to: "/countdown-timer", label: "Set a custom countdown" },
  ]),
  "/egg-timer": group("Other kitchen timers", [
    { to: "/kitchen-timer", label: "Use a general kitchen timer" },
    { to: "/tea-timer", label: "Choose a tea steeping timer" },
    { to: "/countdown-timer", label: "Set a custom countdown" },
  ]),
  "/tea-timer": group("Other kitchen countdowns", [
    { to: "/kitchen-timer", label: "Use a general kitchen timer" },
    { to: "/egg-timer", label: "Choose an egg timer" },
    { to: "/countdown-timer", label: "Set a custom countdown" },
  ]),
  "/kitchen-timer": group("More kitchen timing tools", [
    { to: "/cooking-timer", label: "Run a general cooking timer" },
    { to: "/pizza-timer", label: "Use pizza timing presets" },
    { to: "/egg-timer", label: "Choose an egg timer" },
  ]),
  "/cooking-timer": group("More cooking timers", [
    { to: "/kitchen-timer", label: "Open the kitchen timer" },
    { to: "/pizza-timer", label: "Use pizza timing presets" },
    { to: "/tea-timer", label: "Choose a tea steeping timer" },
  ]),

  "/presentation-timer": group("Other speaking and meeting timers", [
    { to: "/speech-timer", label: "Time a speech with speaking cues" },
    { to: "/timer-clock", label: "Show local time beside a countdown" },
    { to: "/meeting-timer", label: "Time an active meeting" },
  ]),
  "/speech-timer": group("Other presentation tools", [
    { to: "/presentation-timer", label: "Run a presentation countdown" },
    { to: "/timer-clock", label: "Show local time beside a countdown" },
    { to: "/meeting-agenda-timer", label: "Time several agenda sections" },
  ]),

  "/interval-timer": group("Other workout interval tools", [
    { to: "/hiit-timer", label: "Run alternating HIIT intervals" },
    { to: "/amrap-timer", label: "Run a fixed AMRAP window" },
    { to: "/workout-timer", label: "Use a general workout timer" },
  ]),
  "/hiit-timer": group("Other interval workouts", [
    { to: "/interval-timer", label: "Configure general intervals" },
    { to: "/amrap-timer", label: "Run a fixed AMRAP window" },
    { to: "/boxing-timer", label: "Time rounds and rest periods" },
  ]),
  "/amrap-timer": group("Related workout timers", [
    { to: "/interval-timer", label: "Configure repeating intervals" },
    { to: "/workout-timer", label: "Use a general workout timer" },
    { to: "/boxing-timer", label: "Time rounds and rest periods" },
  ]),
  "/boxing-timer": group("Other round and rhythm tools", [
    { to: "/interval-timer", label: "Configure repeating intervals" },
    { to: "/workout-timer", label: "Use a general workout timer" },
    { to: "/metronome", label: "Generate a steady practice beat" },
  ]),
  "/workout-timer": group("Other workout timing tools", [
    { to: "/interval-timer", label: "Configure repeating intervals" },
    { to: "/hiit-timer", label: "Run alternating HIIT intervals" },
    { to: "/pace-timer", label: "Use a repeating pace cue" },
  ]),
  "/pace-timer": group("Related pace and rhythm tools", [
    { to: "/workout-timer", label: "Use a general workout timer" },
    { to: "/interval-timer", label: "Configure repeating intervals" },
    { to: "/metronome", label: "Generate a steady audible beat" },
  ]),

  "/analog-clock": group("Other analog clock displays", [
    { to: "/analog-clock-with-second-hand", label: "Add a visible second hand" },
    { to: "/smooth-second-hand-clock", label: "Use a sweeping second hand" },
    { to: "/full-screen-analog-clock", label: "Open an analog clock fullscreen" },
  ]),
  "/analog-clock-with-second-hand": group("Compare analog clock styles", [
    { to: "/analog-clock", label: "Use the standard analog clock" },
    { to: "/smooth-second-hand-clock", label: "Switch to a sweeping second hand" },
    { to: "/full-screen-analog-clock", label: "Open an analog clock fullscreen" },
  ]),
  "/smooth-second-hand-clock": group("Related analog clocks", [
    { to: "/analog-clock-with-second-hand", label: "Use a ticking second hand" },
    { to: "/analog-clock", label: "Open the standard analog clock" },
    { to: "/full-screen-analog-clock", label: "View an analog clock fullscreen" },
  ]),
  "/full-screen-analog-clock": group("Other analog displays", [
    { to: "/analog-clock", label: "Return to the standard analog clock" },
    { to: "/analog-clock-with-second-hand", label: "View a clock with a second hand" },
    { to: "/smooth-second-hand-clock", label: "Use a sweeping second hand" },
    { to: "/full-screen-clock", label: "Switch to a fullscreen digital clock" },
  ]),
  "/digital-clock": group("Other digital clock displays", [
    { to: "/full-screen-clock", label: "Open a digital clock fullscreen" },
    { to: "/clock-with-seconds", label: "View a clock with seconds" },
    { to: "/timer-clock", label: "Add an independent countdown beside local time" },
    { to: "/analog-clock", label: "Switch to an analog clock" },
  ]),
  "/current-local-time": group("Other local-time displays", [
    { to: "/digital-clock", label: "Open the general digital clock" },
    { to: "/clock-with-seconds", label: "Keep seconds visible" },
    { to: "/full-screen-clock", label: "Use a fullscreen room display" },
  ]),
  "/big-digital-clock": group("Other large clock displays", [
    { to: "/full-screen-clock", label: "Open the fullscreen digital clock" },
    { to: "/digital-clock", label: "Use the standard digital clock" },
    { to: "/clock-with-seconds", label: "Focus on a clock with seconds" },
  ]),
  "/minimalist-clock": group("Other simple clock displays", [
    { to: "/digital-clock", label: "Use the general digital clock" },
    { to: "/full-screen-clock", label: "Open a fullscreen time display" },
    { to: "/analog-clock", label: "Switch to a standard analog face" },
  ]),
  "/full-screen-clock": group("Related digital clocks", [
    { to: "/digital-clock", label: "Use the standard digital clock" },
    { to: "/clock-with-seconds", label: "Show local time with seconds" },
    { to: "/timer-clock", label: "Show local time with a countdown" },
    { to: "/full-screen-analog-clock", label: "Switch to a fullscreen analog clock" },
  ]),
  "/clock-with-seconds": group("Other clock displays", [
    { to: "/clock-with-milliseconds", label: "Show millisecond digits" },
    { to: "/full-screen-clock", label: "Open the clock fullscreen" },
    { to: "/digital-clock", label: "Use the standard digital clock" },
    { to: "/timer-clock", label: "Keep a countdown beside current time" },
  ]),
});

const TOOL_GROUPS = SITEMAP_GROUPS.filter(
  ({ title }) => title !== "Trust and site information" && title !== "Guides",
);

const INDEXABLE_TOOL_ROUTES = Object.freeze(
  TOOL_GROUPS.flatMap(({ routes }) => routes).filter(
    (routePath, index, routes) =>
      routePath !== "/" &&
      !STAGE3_NOINDEX_ROUTE_SET.has(routePath) &&
      !STAGE3_REDIRECT_SOURCE_SET.has(routePath) &&
      routes.indexOf(routePath) === index,
  ),
);

const INDEXABLE_TOOL_ROUTE_SET = new Set(INDEXABLE_TOOL_ROUTES);

/** @type {Readonly<Record<string, readonly string[]>>} */
const LOCAL_CLOCK_FALLBACKS = Object.freeze({
  "/analog-clock": [
    "/digital-clock",
    "/12-hour-clock",
    "/clock-with-milliseconds",
  ],
  "/digital-clock": [
    "/analog-clock",
    "/12-hour-clock",
    "/clock-with-milliseconds",
  ],
});

/** @param {string} routePath */
function routeLabel(routePath) {
  return routePath
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" — ");
}

/** @param {string} routePath */
function siblingRoutes(routePath) {
  const currentGroup = TOOL_GROUPS.find(({ routes }) =>
    routes.includes(routePath),
  );
  return currentGroup?.routes ?? [];
}

const RAW_RELATED_TOOL_LINK_MAP = /** @type {Readonly<Record<string, {heading: string, links: readonly {to: string, label: string}[]}>>} */ (
  RAW_RELATED_TOOL_LINKS
);

/** @param {string} routePath */
function canonicalRelatedLinks(routePath) {
  const explicit = RAW_RELATED_TOOL_LINK_MAP[routePath];
  /** @type {{to: string, label: string}[]} */
  const links = [];
  /** @type {Set<string>} */
  const destinations = new Set();

  /**
   * @param {{to: string, label: string}} candidate
   * @param {boolean} [fallback]
   */
  const add = (candidate, fallback = false) => {
    const destination =
      /** @type {Readonly<Record<string, string>>} */ (
        STAGE3_NEW_REDIRECTS
      )[candidate.to] ?? candidate.to;
    if (
      destination === routePath ||
      destinations.has(destination) ||
      !INDEXABLE_TOOL_ROUTE_SET.has(destination)
    ) {
      return;
    }
    destinations.add(destination);
    links.push({
      to: destination,
      label: fallback
        ? `Explore ${routeLabel(destination)}`
        : candidate.label,
    });
  };

  explicit?.links.forEach((candidate) => add(candidate));

  const fallbackRoutes = [
    ...(LOCAL_CLOCK_FALLBACKS[routePath] ?? []),
    ...siblingRoutes(routePath),
  ];
  fallbackRoutes.forEach((destination) =>
    add({ to: destination, label: "" }, true),
  );

  return group(
    explicit?.heading ?? "Related tools for this task",
    links.slice(0, 5),
  );
}

export const RELATED_TOOL_LINKS = Object.freeze(
  Object.fromEntries(
    INDEXABLE_TOOL_ROUTES.map((routePath) => [
      routePath,
      canonicalRelatedLinks(routePath),
    ]),
  ),
);

export const PRIORITY_CONTEXTUAL_ROUTES = Object.freeze(
  INDEXABLE_TOOL_ROUTES.filter((routePath) =>
    PRIORITY_CONTEXTUAL_ROUTE_SEEDS.includes(routePath),
  ),
);

export const GUIDE_REVIEW_DATE = "2026-07-21";
export const GUIDE_REVIEW_DATE_LABEL = "July 21, 2026";

export type GuideDefinition = {
  path: string;
  title: string;
  shortTitle: string;
  description: string;
  directQuestion: string;
};

export const GUIDES = [
  {
    path: "/guides/browser-timers-background-tabs",
    title: "Browser Timers in Background Tabs, Locked Phones, and Closed Tabs",
    shortTitle: "Timers in background tabs",
    description:
      "Understand what can happen to a browser timer when its tab is hidden, a phone is locked, the browser freezes the page, or the tab is closed.",
    directQuestion:
      "Will a browser timer keep working in a background tab, on a locked phone, or after I close the tab?",
  },
  {
    path: "/guides/browser-timer-alarm-silent",
    title: "Why a Browser Timer or Alarm May Stay Silent",
    shortTitle: "Why an alarm may stay silent",
    description:
      "Troubleshoot browser timer and alarm sound, including autoplay rules, muted output, suspended audio, background pages, and device sleep.",
    directQuestion: "Why did my browser timer finish without making a sound?",
  },
  {
    path: "/guides/how-browser-timers-measure-time",
    title: "How Browser Timers Measure Elapsed Time and Handle Delays",
    shortTitle: "How browser timers measure time",
    description:
      "Learn why accurate browser timers measure elapsed or target time instead of assuming every callback arrives on schedule.",
    directQuestion:
      "How can a browser timer stay accurate when animation frames and timer callbacks are delayed?",
  },
  {
    path: "/guides/unix-timestamps-seconds-milliseconds-microseconds",
    title: "Unix Timestamps in Seconds, Milliseconds, and Microseconds",
    shortTitle: "Unix timestamp units",
    description:
      "Distinguish Unix timestamp seconds, milliseconds, and microseconds, recognize common digit lengths, and avoid 1,000-times unit errors.",
    directQuestion:
      "Is this Unix timestamp in seconds, milliseconds, or microseconds?",
  },
  {
    path: "/guides/daylight-saving-time-zone-conversions",
    title: "Daylight-Saving Gaps, Repeated Times, and Timezone Conversions",
    shortTitle: "DST and timezone conversions",
    description:
      "Understand nonexistent spring-forward times, repeated fall-back times, date-specific offsets, and how iLoveTimers resolves timezone input.",
    directQuestion:
      "Why can a local time be nonexistent or occur twice during a timezone conversion?",
  },
  {
    path: "/guides/browser-storage",
    title: "What iLoveTimers Stores in Your Browser",
    shortTitle: "Browser storage at iLoveTimers",
    description:
      "See which iLoveTimers preferences and tool data use local browser storage, what is session-only, and how clearing site data affects them.",
    directQuestion: "What does iLoveTimers save in my browser, and what is not saved?",
  },
] as const satisfies readonly GuideDefinition[];

export const GUIDE_PATHS = GUIDES.map((guide) => guide.path);

export function guideByPath(path: string) {
  return GUIDES.find((guide) => guide.path === path);
}

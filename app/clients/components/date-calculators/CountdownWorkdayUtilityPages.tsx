import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  ContentSection,
  DisplayStage,
  Field,
  FullscreenBottomBar,
  FullscreenTopBar,
  PageShell,
  PresetChip,
  PresetGroup,
  SecondaryActionRow,
  SeoBand,
  SettingGroup,
  SettingRow,
  ShortcutHint,
  Toggle,
  ToolFrame,
  ToolHero,
  UtilityResultRow,
} from "~/clients/components/ui/foundation";
import { useFitDisplayText } from "~/clients/hooks/useFitDisplayText";
import { useFullscreen } from "~/clients/hooks/useFullscreen";
import {
  clampInt,
  CopyState,
  copyToClipboard,
  DATE_CALCULATOR_FRAME_CLASS,
  dayNumberFromParts,
  JsonLd,
  longDate,
  parseDateInput,
  partsFromDayNumber,
  plural,
  ResultDetails,
  ResultDisplay,
  todayInputValue,
  type FaqItem,
  type LocalDateParts,
  weekdayName,
} from "./DateCalculatorPages";
import {
  calculateShift,
  countSelectedWeekdays,
  parseClockTime,
} from "~/clients/lib/calculatorMath";

const SITE_URL = "https://www.ilovetimers.com";
const SECONDS_PER_DAY = 86_400;
const MINUTES_PER_DAY = 1_440;

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type WeekdayOption = {
  index: number;
  short: string;
  label: string;
};

type WeeklyTimesheetRow = {
  day: string;
  start: string;
  end: string;
  breakMinutes: number;
};

const WEEKDAYS: WeekdayOption[] = [
  { index: 1, short: "Mon", label: "Monday" },
  { index: 2, short: "Tue", label: "Tuesday" },
  { index: 3, short: "Wed", label: "Wednesday" },
  { index: 4, short: "Thu", label: "Thursday" },
  { index: 5, short: "Fri", label: "Friday" },
  { index: 6, short: "Sat", label: "Saturday" },
  { index: 0, short: "Sun", label: "Sunday" },
];

const DEFAULT_WORKDAYS = new Set([1, 2, 3, 4, 5]);

const COUNTDOWN_TO_DATE_FAQ: FaqItem[] = [
  {
    question: "How is this different from the event countdown?",
    answer:
      "This page is a simple date and time countdown. The event countdown is better when you want richer event naming and saved countdown behavior.",
  },
  {
    question: "Which timezone does the countdown use?",
    answer:
      "The selected date and time are interpreted as local browser date and time. The timezone label comes from the device/browser environment.",
  },
  {
    question: "Can I use this for official deadlines?",
    answer:
      "No. It is a practical browser countdown for planning and display, not an official, legal, contract, or deadline-compliance system.",
  },
];

const CHRISTMAS_COUNTDOWN_FAQ: FaqItem[] = [
  {
    question: "Which Christmas does this countdown target?",
    answer:
      "It targets the next December 25 in your local calendar. If today is December 25, it shows a Christmas-today state.",
  },
  {
    question: "Does this use an official holiday calendar?",
    answer:
      "No. It uses the fixed December 25 date and your browser/device clock. It does not apply regional or official holiday rules.",
  },
  {
    question: "Can I use it fullscreen?",
    answer:
      "Yes. Fullscreen mode keeps the countdown display ad-free and easier to read from across a room.",
  },
];

const WORKDAYS_FAQ: FaqItem[] = [
  {
    question: "How is this different from the business days calculator?",
    answer:
      "The business days calculator uses the standard Monday-through-Friday assumption. This workdays calculator lets you choose which weekdays count.",
  },
  {
    question: "Does this include holidays?",
    answer:
      "No. This first version counts selected weekdays only. It does not apply country, regional, company, or custom holiday calendars.",
  },
  {
    question: "Are the start and end dates included?",
    answer:
      "Both endpoints are included by default. Separate toggles let you exclude the start date, the end date, or both.",
  },
  {
    question: "Can I use this for payroll or HR decisions?",
    answer:
      "No. It is for simple planning and date checking, not payroll, HR, legal, tax, contract, or official workday decisions.",
  },
];

const WEEKLY_TIMESHEET_FAQ: FaqItem[] = [
  {
    question: "How is this different from the time card calculator?",
    answer:
      "The time card calculator is flexible and row-based. This weekly timesheet calculator keeps one fixed row per weekday or weekend day.",
  },
  {
    question: "How are breaks handled?",
    answer:
      "Break minutes are subtracted from each completed day row. Empty rows count as zero and rows with one missing time are flagged.",
  },
  {
    question: "Does this apply overtime or rounding?",
    answer:
      "No. It sums entered minutes without overtime thresholds or rounding increments and shows both hours-and-minutes and decimal-hour totals.",
  },
  {
    question: "Can I use this for payroll?",
    answer:
      "No. It is a personal planning and checking calculator. It does not apply wage, overtime, payroll, tax, HR, or legal rules.",
  },
];

function updateCopyState(setter: (value: string | null) => void, value: boolean) {
  setter(value ? "Copied" : "Copy failed");
  window.setTimeout(() => setter(null), 1200);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputFromDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function timeInputFromDate(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function targetDateInputFromInitialNow(initialNowISO: string) {
  const initial = new Date(initialNowISO);
  const target = new Date(
    initial.getFullYear(),
    initial.getMonth(),
    initial.getDate() + 7,
    9,
    0,
    0,
    0,
  );
  return {
    date: dateInputFromDate(target),
    time: timeInputFromDate(target),
  };
}

function parseTimeInput(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function parseLocalDateTime(dateValue: string, timeValue: string) {
  const dateParts = parseDateInput(dateValue);
  const timeMinutes = parseTimeInput(timeValue);
  if (!dateParts || timeMinutes === null) return null;
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    hours,
    minutes,
    0,
    0,
  );
}

function splitCountdown(ms: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSeconds / SECONDS_PER_DAY),
    hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatCountdownParts(parts: CountdownParts) {
  return `${parts.days}d ${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
}

function formatLocalDateTime(date: Date) {
  const parts = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
  return `${longDate(parts)}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function safeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";
  } catch {
    return "Local timezone";
  }
}

function localDatePartsFromDate(date: Date): LocalDateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function getNextChristmas(now: Date) {
  const parts = localDatePartsFromDate(now);
  const todayNumber = dayNumberFromParts(parts);
  const christmasThisYear = { year: parts.year, month: 12, day: 25 };
  const christmasNumber = dayNumberFromParts(christmasThisYear);
  const isChristmasToday = parts.month === 12 && parts.day === 25;
  const targetParts =
    christmasNumber < todayNumber && !isChristmasToday
      ? { year: parts.year + 1, month: 12, day: 25 }
      : christmasThisYear;

  return {
    target: new Date(targetParts.year, 11, 25, 0, 0, 0, 0),
    targetParts,
    isChristmasToday,
  };
}

function CountdownDisplay({
  label,
  value,
  context,
  status,
  isFullscreen,
}: {
  label: string;
  value: string;
  context: string;
  status: string;
  isFullscreen: boolean;
}) {
  const displayRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const fitFontPx = useFitDisplayText({
    containerRef: displayRef,
    textRef,
    deps: [value, label, context, isFullscreen],
    minPx: isFullscreen ? 44 : 36,
    maxPx: isFullscreen ? 520 : 430,
    paddingAllowancePx: isFullscreen ? 64 : 80,
    initialScale: isFullscreen ? 1 : 1.15,
    initialMobileScale: isFullscreen ? 1 : 1.02,
  });

  return (
    <DisplayStage
      stageRef={displayRef}
      isFullscreen={isFullscreen}
      className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
      style={{
        minHeight: isFullscreen ? 0 : "clamp(320px, 38vw, 460px)",
        marginTop: isFullscreen ? "3.6rem" : undefined,
        marginBottom: isFullscreen ? "3.6rem" : undefined,
        overflow: isFullscreen ? "hidden" : "visible",
      }}
      aria-live="polite"
    >
      <div className="text-xs font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
        {label}
      </div>
      <span
        ref={textRef}
        data-primary-display-value
        className="mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold tracking-widest"
        style={{ fontSize: fitFontPx, lineHeight: "1", transform: "translateZ(0)" }}
      >
        {value}
      </span>
      <div className="mt-4 text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
        {context}
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-[var(--ilt-text-muted)]">
        {status}
      </div>
    </DisplayStage>
  );
}

function CountdownToDateTool({ initialNowISO }: { initialNowISO: string }) {
  const initialTarget = useMemo(
    () => targetDateInputFromInitialNow(initialNowISO),
    [initialNowISO],
  );
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [targetDate, setTargetDate] = useState(initialTarget.date);
  const [targetTime, setTargetTime] = useState(initialTarget.time);
  const [label, setLabel] = useState("Selected date");
  const [timeZone, setTimeZone] = useState("Local timezone");
  const [copyState, setCopyState] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;

  useEffect(() => {
    setTimeZone(safeTimeZone());
    const interval = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const target = useMemo(
    () => parseLocalDateTime(targetDate, targetTime),
    [targetDate, targetTime],
  );
  const remainingMs = target ? target.getTime() - now.getTime() : 0;
  const expired = !!target && remainingMs < 0;
  const parts = splitCountdown(remainingMs);
  const displayValue = !target
    ? "Invalid date"
    : expired
      ? "Past target"
      : formatCountdownParts(parts);
  const targetText = target ? formatLocalDateTime(target) : "Enter a valid target date and time.";
  const copyText = target
    ? `${label || "Countdown"}: ${displayValue} for ${targetText} (${timeZone}). ${SITE_URL}/countdown-to-date`
    : "Countdown to date: invalid target date or time.";

  const copyResult = useCallback(async () => {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }, [copyText]);

  const shareOrCopy = useCallback(async () => {
    try {
      if (navigator.share && target) {
        await navigator.share({
          title: label || "Countdown to Date",
          text: copyText,
          url: `${SITE_URL}/countdown-to-date`,
        });
        setCopyState("Shared");
      } else {
        updateCopyState(setCopyState, await copyToClipboard(copyText));
        return;
      }
    } catch {
      setCopyState("Share canceled or failed");
    }
    window.setTimeout(() => setCopyState(null), 1200);
  }, [copyText, label, target]);

  function reset() {
    setTargetDate(initialTarget.date);
    setTargetTime(initialTarget.time);
    setLabel("Selected date");
  }

  function setPreset(days: number) {
    const targetDateObject = new Date(now.getTime() + days * SECONDS_PER_DAY * 1000);
    setTargetDate(dateInputFromDate(targetDateObject));
    setTargetTime(timeInputFromDate(targetDateObject));
  }

  return (
    <ToolFrame
      frameRef={frameRef}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "timer-countdown-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Countdown To Date"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copyResult()}>
            Copy
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "flex h-full flex-col"}>
        <CountdownDisplay
          label={label || "Countdown to date"}
          value={displayValue}
          context={target ? `Target: ${targetText}` : targetText}
          status={
            target
              ? expired
                ? `Past target / ${timeZone}`
                : `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds / ${timeZone}`
              : "Check target"
          }
          isFullscreen={isFullscreen}
        />

        {!isFullscreen ? (
          <>
            <SettingGroup
              title="Target date and time"
              description="Pick one local date and optional time. The countdown updates live without saved event management."
            >
              <SettingRow className="sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,9rem)]">
                <Field
                  label="Label"
                  value={label}
                  onInput={(event) => setLabel(event.currentTarget.value)}
                  onChange={(event) => setLabel(event.currentTarget.value)}
                  onBlur={(event) => setLabel(event.currentTarget.value)}
                />
                <Field
                  label="Target date"
                  type="date"
                  value={targetDate}
                  onInput={(event) => setTargetDate(event.currentTarget.value)}
                  onChange={(event) => setTargetDate(event.currentTarget.value)}
                  onBlur={(event) => setTargetDate(event.currentTarget.value)}
                />
                <Field
                  label="Target time"
                  type="time"
                  value={targetTime}
                  onInput={(event) => setTargetTime(event.currentTarget.value)}
                  onChange={(event) => setTargetTime(event.currentTarget.value)}
                  onBlur={(event) => setTargetTime(event.currentTarget.value)}
                />
              </SettingRow>
            </SettingGroup>

            <PresetGroup title="Quick targets">
              <PresetChip onClick={() => setPreset(1)}>Tomorrow</PresetChip>
              <PresetChip onClick={() => setPreset(7)}>+7 days</PresetChip>
              <PresetChip onClick={() => setPreset(30)}>+30 days</PresetChip>
            </PresetGroup>

            <SecondaryActionRow>
              <Button variant="secondary" onClick={() => void copyResult()}>
                Copy countdown
              </Button>
              <Button variant="secondary" onClick={() => void shareOrCopy()}>
                Share
              </Button>
              <Button variant="secondary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
            </SecondaryActionRow>

            <CopyState state={copyState} />
            <ShortcutHint>
              Uses local browser date/time. Not for official legal or deadline-compliance timing.
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Target: {targetText}
            </span>
            <span className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen display has no ad placeholders.
            </span>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function ChristmasCountdownTool({ initialNowISO }: { initialNowISO: string }) {
  const [now, setNow] = useState(() => new Date(initialNowISO));
  const [timeZone, setTimeZone] = useState("Local timezone");
  const [copyState, setCopyState] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const fullscreen = useFullscreen(frameRef);
  const isFullscreen = fullscreen.isFullscreen;

  useEffect(() => {
    setTimeZone(safeTimeZone());
    const interval = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(interval);
  }, []);

  const christmas = useMemo(() => getNextChristmas(now), [now]);
  const remainingMs = christmas.target.getTime() - now.getTime();
  const parts = splitCountdown(remainingMs);
  const targetText = longDate(christmas.targetParts);
  const displayValue = christmas.isChristmasToday
    ? "Christmas today"
    : formatCountdownParts(parts);
  const status = christmas.isChristmasToday
    ? `Today is December 25 / ${timeZone}`
    : `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds / ${timeZone}`;
  const copyText = christmas.isChristmasToday
    ? `Christmas countdown: today is Christmas (${targetText}). ${SITE_URL}/christmas-countdown`
    : `Christmas countdown: ${displayValue} until ${targetText} (${timeZone}). ${SITE_URL}/christmas-countdown`;

  const copyResult = useCallback(async () => {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }, [copyText]);

  const shareOrCopy = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Christmas Countdown",
          text: copyText,
          url: `${SITE_URL}/christmas-countdown`,
        });
        setCopyState("Shared");
      } else {
        updateCopyState(setCopyState, await copyToClipboard(copyText));
        return;
      }
    } catch {
      setCopyState("Share canceled or failed");
    }
    window.setTimeout(() => setCopyState(null), 1200);
  }, [copyText]);

  return (
    <ToolFrame
      frameRef={frameRef}
      isFullscreen={isFullscreen}
      className={isFullscreen ? "" : "timer-countdown-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6"}
    >
      <FullscreenTopBar
        show={isFullscreen}
        title="Christmas Countdown"
        onExit={() => void fullscreen.exit()}
        right={
          <Button variant="ghost" size="sm" onClick={() => void copyResult()}>
            Copy
          </Button>
        }
      />

      <div className={isFullscreen ? "flex h-full flex-col" : "timer-countdown-stack timer-event-countdown-stack flex h-full flex-col"}>
        <CountdownDisplay
          label={`Countdown to Christmas ${christmas.targetParts.year}`}
          value={displayValue}
          context={`Target: ${targetText}`}
          status={status}
          isFullscreen={isFullscreen}
        />

        {!isFullscreen ? (
          <>
            <SecondaryActionRow>
              <Button variant="secondary" onClick={() => void copyResult()}>
                Copy countdown
              </Button>
              <Button variant="secondary" onClick={() => void shareOrCopy()}>
                Share
              </Button>
              <Button variant="secondary" onClick={() => void fullscreen.toggle()}>
                Fullscreen
              </Button>
            </SecondaryActionRow>

            <CopyState state={copyState} />
            <ResultDetails columns="3">
              <UtilityResultRow>
                <span>Target year</span>
                <strong>{christmas.targetParts.year}</strong>
              </UtilityResultRow>
              <UtilityResultRow>
                <span>Target weekday</span>
                <strong>{weekdayName(christmas.targetParts)}</strong>
              </UtilityResultRow>
              <UtilityResultRow>
                <span>Timezone</span>
                <strong>{timeZone}</strong>
              </UtilityResultRow>
            </ResultDetails>
            <ShortcutHint>
              Uses fixed December 25 local calendar targeting and your browser/device clock.
            </ShortcutHint>
          </>
        ) : null}

        <FullscreenBottomBar show={isFullscreen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[var(--ilt-text-muted)] sm:text-sm">
              Target: {targetText}
            </span>
            <span className="text-xs font-semibold text-[var(--ilt-text-secondary)]">
              Fullscreen display has no ad placeholders.
            </span>
          </div>
        </FullscreenBottomBar>
      </div>
    </ToolFrame>
  );
}

function workdayResult(
  startValue: string,
  endValue: string,
  selectedWeekdays: Set<number>,
  includeStart: boolean,
  includeEnd: boolean,
) {
  const result = countSelectedWeekdays(
    startValue,
    endValue,
    selectedWeekdays,
    includeStart,
    includeEnd,
  );
  if (!result) return null;

  return {
    start: result.start,
    end: result.end,
    reversed: result.reversed,
    sign: result.direction,
    includedDays: result.includedDays,
    workdays: result.absoluteSelectedDays,
    nonWorkingDays: result.excludedDays,
    calendarDays: Math.abs(result.elapsedDays) + 1,
  };
}

function selectedWeekdaySummary(selectedWeekdays: Set<number>) {
  const labels = WEEKDAYS.filter((weekday) => selectedWeekdays.has(weekday.index)).map(
    (weekday) => weekday.short,
  );
  return labels.length ? labels.join(", ") : "No weekdays selected";
}

function WorkdaysCalculatorTool() {
  const [startDate, setStartDate] = useState("2026-01-05");
  const [endDate, setEndDate] = useState("2026-01-09");
  const [includeStart, setIncludeStart] = useState(true);
  const [includeEnd, setIncludeEnd] = useState(true);
  const [selectedWeekdays, setSelectedWeekdays] = useState(() => new Set(DEFAULT_WORKDAYS));
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => workdayResult(startDate, endDate, selectedWeekdays, includeStart, includeEnd),
    [endDate, includeEnd, includeStart, selectedWeekdays, startDate],
  );

  const displayCount = result ? result.workdays * result.sign : 0;
  const displayValue = result ? plural(displayCount, "workday") : "Invalid date";
  const status = result
    ? selectedWeekdays.size === 0
      ? "No weekdays selected"
      : result.reversed
        ? "End date is before start date"
        : "Selected weekday count"
    : "Check dates";
  const copyText = result
    ? `Workdays: ${displayValue} from ${startDate} to ${endDate}. Selected weekdays: ${selectedWeekdaySummary(selectedWeekdays)}.`
    : "Workdays calculator: invalid date input.";

  function toggleWeekday(index: number, checked: boolean) {
    setSelectedWeekdays((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  }

  function setWeekdayPreset(indices: number[]) {
    setSelectedWeekdays(new Set(indices));
  }

  function reset() {
    setStartDate("2026-01-05");
    setEndDate("2026-01-09");
    setIncludeStart(true);
    setIncludeEnd(true);
    setWeekdayPreset([1, 2, 3, 4, 5]);
  }

  function setTodayRange() {
    const today = todayInputValue();
    setStartDate(today);
    setEndDate(today);
  }

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Selected workdays"
        value={displayValue}
        context={
          result
            ? `${selectedWeekdaySummary(selectedWeekdays)} / ${result.includedDays} included calendar dates`
            : "Enter valid start and end dates."
        }
        status={status}
      />

      <SettingGroup
        title="Date range and workweek"
        description="Choose the date range and the weekdays that count as workdays for your schedule."
      >
        <SettingRow className="sm:grid-cols-2">
          <Field
            label="Start date"
            type="date"
            value={startDate}
            onInput={(event) => setStartDate(event.currentTarget.value)}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            onBlur={(event) => setStartDate(event.currentTarget.value)}
          />
          <Field
            label="End date"
            type="date"
            value={endDate}
            onInput={(event) => setEndDate(event.currentTarget.value)}
            onChange={(event) => setEndDate(event.currentTarget.value)}
            onBlur={(event) => setEndDate(event.currentTarget.value)}
          />
        </SettingRow>
        <SettingRow className="sm:grid-cols-2">
          <Toggle
            label="Include start date"
            checked={includeStart}
            onCheckedChange={setIncludeStart}
          />
          <Toggle
            label="Include end date"
            checked={includeEnd}
            onCheckedChange={setIncludeEnd}
          />
        </SettingRow>
        <SettingRow className="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {WEEKDAYS.map((weekday) => (
            <Toggle
              key={weekday.index}
              label={weekday.short}
              checked={selectedWeekdays.has(weekday.index)}
              onCheckedChange={(checked) => toggleWeekday(weekday.index, checked)}
            />
          ))}
        </SettingRow>
      </SettingGroup>

      <PresetGroup title="Workweek presets">
        <PresetChip onClick={() => setWeekdayPreset([1, 2, 3, 4, 5])}>
          Mon-Fri
        </PresetChip>
        <PresetChip onClick={() => setWeekdayPreset([0, 6])}>
          Sat-Sun only
        </PresetChip>
        <PresetChip onClick={() => setWeekdayPreset([1, 2, 3, 4])}>
          Mon-Thu
        </PresetChip>
        <PresetChip onClick={() => setWeekdayPreset([0, 1, 2, 3, 4, 5, 6])}>
          All days
        </PresetChip>
      </PresetGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={() => void copyResult()}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={setTodayRange}>
          Today
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails>
          <UtilityResultRow>
            <span>Total calendar span</span>
            <strong>{plural(result.calendarDays, "day")}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Included dates</span>
            <strong>{plural(result.includedDays, "date")}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Non-working days excluded</span>
            <strong>{plural(result.nonWorkingDays, "day")}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Start / end weekdays</span>
            <strong>
              {weekdayName(result.start)} / {weekdayName(result.end)}
            </strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Counts selected weekdays only. It does not apply holidays, payroll, HR, or legal rules.
      </ShortcutHint>
    </ToolFrame>
  );
}

function formatDurationMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${pad2(remainingMinutes)}m`;
}

function formatDecimalHours(minutes: number) {
  const hours = minutes / 60;
  const value = Number.isInteger(hours)
    ? String(hours)
    : hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${value} ${Math.abs(hours) === 1 ? "hour" : "hours"}`;
}

function blankWeeklyRows(): WeeklyTimesheetRow[] {
  return [
    { day: "Monday", start: "09:00", end: "17:00", breakMinutes: 30 },
    { day: "Tuesday", start: "", end: "", breakMinutes: 0 },
    { day: "Wednesday", start: "", end: "", breakMinutes: 0 },
    { day: "Thursday", start: "", end: "", breakMinutes: 0 },
    { day: "Friday", start: "", end: "", breakMinutes: 0 },
    { day: "Saturday", start: "", end: "", breakMinutes: 0 },
    { day: "Sunday", start: "", end: "", breakMinutes: 0 },
  ];
}

function weeklyRowResult(row: WeeklyTimesheetRow) {
  const hasStart = row.start.trim().length > 0;
  const hasEnd = row.end.trim().length > 0;
  if (!hasStart && !hasEnd) {
    return { state: "empty" as const, netMinutes: 0, overnight: false, error: "" };
  }
  const startSeconds = parseClockTime(row.start);
  const endSeconds = parseClockTime(row.end);
  const result = calculateShift(
    startSeconds === null ? null : startSeconds / 60,
    endSeconds === null ? null : endSeconds / 60,
    row.breakMinutes,
  );
  if (!result.ok) {
    return { state: "invalid" as const, netMinutes: 0, overnight: false, error: result.error };
  }
  return {
    state: "complete" as const,
    netMinutes: result.netMinutes,
    overnight: result.overnight,
    error: "",
  };
}

function WeeklyTimesheetCalculatorTool() {
  const [rows, setRows] = useState<WeeklyTimesheetRow[]>(() => blankWeeklyRows());
  const [copyState, setCopyState] = useState<string | null>(null);
  const rowResults = useMemo(
    () =>
      rows.map((row) => ({
        row,
        result: weeklyRowResult(row),
      })),
    [rows],
  );
  const totalMinutes = rowResults.reduce((sum, item) => sum + item.result.netMinutes, 0);
  const completeRows = rowResults.filter((item) => item.result.state === "complete").length;
  const invalidRows = rowResults.filter((item) => item.result.state === "invalid").length;
  const overnightRows = rowResults.filter((item) => item.result.overnight).length;
  const status =
    invalidRows > 0
      ? `${invalidRows} day ${invalidRows === 1 ? "needs" : "need"} valid start/end times`
      : overnightRows > 0
          ? "Overnight days included"
          : `${completeRows} completed ${completeRows === 1 ? "day" : "days"}`;
  const copyText = [
    `Weekly timesheet total: ${formatDurationMinutes(totalMinutes)} (${formatDecimalHours(totalMinutes)}).`,
    ...rowResults.map((item) =>
      item.result.state === "complete"
        ? `${item.row.day}: ${item.row.start} to ${item.row.end}, break ${item.row.breakMinutes} min, total ${formatDurationMinutes(item.result.netMinutes)}${item.result.overnight ? " overnight" : ""}.`
        : item.result.state === "invalid"
          ? `${item.row.day}: ${item.result.error}`
          : `${item.row.day}: empty.`,
    ),
  ].join("\n");

  function updateRow<K extends keyof WeeklyTimesheetRow>(
    day: string,
    key: K,
    value: WeeklyTimesheetRow[K],
  ) {
    setRows((current) =>
      current.map((row) => (row.day === day ? { ...row, [key]: value } : row)),
    );
  }

  function reset() {
    setRows(blankWeeklyRows());
  }

  async function copySummary() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  return (
    <ToolFrame className="timer-result-stack timer-work-calculator-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <ResultDisplay
        label="Weekly total"
        value={formatDurationMinutes(totalMinutes)}
        context={`${formatDecimalHours(totalMinutes)} decimal time across the week`}
        status={status}
      />

      <SettingGroup
        title="Weekly rows"
        description="Enter start time, end time, and break minutes for each day. Empty days count as zero."
      >
        <div className="grid gap-4">
          {rows.map((row, index) => (
            <div key={row.day} className="grid gap-1">
              <SettingRow className="sm:grid-cols-[minmax(7rem,0.8fr)_minmax(0,9rem)_minmax(0,9rem)_minmax(0,9rem)]">
              <div className="self-end pb-2 text-sm font-bold text-[var(--ilt-text-primary)]">
                {row.day}
              </div>
              <Field
                label="Start"
                type="time"
                value={row.start}
                onInput={(event) => updateRow(row.day, "start", event.currentTarget.value)}
                onChange={(event) => updateRow(row.day, "start", event.currentTarget.value)}
                onBlur={(event) => updateRow(row.day, "start", event.currentTarget.value)}
              />
              <Field
                label="End"
                type="time"
                value={row.end}
                onInput={(event) => updateRow(row.day, "end", event.currentTarget.value)}
                onChange={(event) => updateRow(row.day, "end", event.currentTarget.value)}
                onBlur={(event) => updateRow(row.day, "end", event.currentTarget.value)}
              />
              <Field
                label="Break minutes"
                type="number"
                min={0}
                max={1440}
                inputMode="numeric"
                value={row.breakMinutes}
                onInput={(event) =>
                  updateRow(
                    row.day,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
                onChange={(event) =>
                  updateRow(
                    row.day,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
                onBlur={(event) =>
                  updateRow(
                    row.day,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
              />
              </SettingRow>
              <p
                className="min-h-5 text-sm text-[var(--ilt-text-secondary)]"
                aria-live="polite"
              >
                {rowResults[index]?.result.state === "invalid"
                  ? rowResults[index]?.result.error
                  : ""}
              </p>
            </div>
          ))}
        </div>
      </SettingGroup>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rowResults.map((item) => (
          <UtilityResultRow key={item.row.day}>
            <span>
              {item.row.day}
              {item.result.overnight ? " (overnight)" : ""}
            </span>
            <strong>
              {item.result.state === "complete"
                ? `${formatDurationMinutes(item.result.netMinutes)} / ${formatDecimalHours(item.result.netMinutes)}`
                : item.result.state === "invalid"
                  ? item.result.error
                  : "0h 00m"}
            </strong>
          </UtilityResultRow>
        ))}
      </div>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={() => void copySummary()}>
          Copy summary
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset week
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      <ShortcutHint>
        Overnight rows are treated as next-day end times. This is not a payroll, wage, HR, tax, or legal calculator.
      </ShortcutHint>
    </ToolFrame>
  );
}

export function CountdownToDatePage({ initialNowISO }: { initialNowISO: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Countdown To Date"
        path="/countdown-to-date"
        description="Set a simple live countdown to a selected local date and time with copy, share, and fullscreen support."
        faqItems={COUNTDOWN_TO_DATE_FAQ}
      />

      <ToolHero
        display={<CountdownToDateTool initialNowISO={initialNowISO} />}
        title="Countdown To Date"
        description="Pick a date and time, then watch a simple live countdown update in your browser with copy, share, and fullscreen actions."
      />

      <SeoBand>
        <ContentSection title="How this countdown to date works">
          <p>
            Choose a target date, optional time, and short label. The page
            interprets the target as a local browser date and time, then updates
            the days, hours, minutes, and seconds remaining.
          </p>
          <p>
            If the target is in the past, the display switches to a clear past
            target state instead of showing a misleading running countdown.
          </p>
        </ContentSection>

        <ContentSection title="When a simple date countdown helps">
          <p>
            Use this page for trips, launches, school dates, reminders,
            personal events, and informal deadline displays. It is meant for a
            quick countdown to one date, without saved event management.
          </p>
          <p>
            For richer named events, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For calendar-day math without a live seconds display, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>{" "}
            or{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related countdown tools">
          <p>
            Try the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>{" "}
            for January 1, the{" "}
            <a className="ilt-content-link" href="/birthday-countdown">
              birthday countdown
            </a>{" "}
            for month/day birthday targeting, or the{" "}
            <a className="ilt-content-link" href="/christmas-countdown">
              Christmas countdown
            </a>{" "}
            for December 25.
          </p>
        </ContentSection>

        <ContentSection title="Countdown to date FAQ">
          {COUNTDOWN_TO_DATE_FAQ.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

export function ChristmasCountdownPage({ initialNowISO }: { initialNowISO: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Christmas Countdown"
        path="/christmas-countdown"
        description="Count down to the next December 25 with a large live display, local timezone context, copy, share, and fullscreen support."
        faqItems={CHRISTMAS_COUNTDOWN_FAQ}
      />

      <ToolHero
        display={<ChristmasCountdownTool initialNowISO={initialNowISO} />}
        title="Christmas Countdown"
        description="See how much time is left until the next Christmas, with local date targeting, copy/share actions, and fullscreen support."
      />

      <SeoBand>
        <ContentSection title="What this Christmas countdown targets">
          <p>
            The countdown automatically targets the next December 25 based on
            your local calendar date. If today is December 25, the display shows
            a Christmas-today state instead of rolling past the day too early.
          </p>
          <p>
            It uses your browser and device clock, so it is a practical display
            for planning and sharing rather than an official holiday calendar or
            time source.
          </p>
        </ContentSection>

        <ContentSection title="When to use a Christmas countdown">
          <p>
            Use it for classroom displays, family countdowns, event planning,
            holiday reminders, and a second-screen countdown. Fullscreen mode
            makes the countdown easier to read from across a room.
          </p>
        </ContentSection>

        <ContentSection title="Related seasonal and date tools">
          <p>
            For January 1, use the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>
            . For birthday month/day targeting, use the{" "}
            <a className="ilt-content-link" href="/birthday-countdown">
              birthday countdown
            </a>
            . For any custom date, use{" "}
            <a className="ilt-content-link" href="/countdown-to-date">
              countdown to date
            </a>{" "}
            or the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For a static day count, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Christmas countdown FAQ">
          {CHRISTMAS_COUNTDOWN_FAQ.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

export function WorkdaysCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Workdays Calculator"
        path="/workdays-calculator"
        description="Calculate selected workdays between two dates with a configurable workweek, calendar-day context, copy, reset, and today shortcuts."
        faqItems={WORKDAYS_FAQ}
      />

      <ToolHero
        display={<WorkdaysCalculatorTool />}
        title="Workdays Calculator"
        description="Count workdays between dates using a custom selected workweek, with included dates, non-working days, and copyable results."
      />

      <SeoBand>
        <ContentSection title="How this workdays calculator works">
          <p>
            Enter a start date and end date, then choose which weekdays count
            for your schedule. Monday through Friday is selected by default, but
            you can switch to weekend-only, four-day weeks, all days, or any
            custom mix.
          </p>
          <p>
            The calculator shows selected workdays first, then supporting
            calendar-day, included-date, non-working-day, and weekday context.
            Both endpoints are included by default and can be excluded with the
            separate toggles.
          </p>
        </ContentSection>

        <ContentSection title="Workdays versus business days">
          <p>
            The{" "}
            <a className="ilt-content-link" href="/business-days-calculator">
              business days calculator
            </a>{" "}
            uses the standard weekday assumption and excludes Saturdays and
            Sundays. This workdays calculator is for non-standard schedules
            where different weekdays should count.
          </p>
          <p>
            It does not include holiday calendars or official work rules. Use it
            for simple project timelines, personal workweek counting,
            non-standard schedules, and planning estimates.
          </p>
          <p>
            This calculator counts workdays using the selected weekend policy.
            It does not automatically exclude public holidays.
          </p>
        </ContentSection>

        <ContentSection title="Related date and work tools">
          <p>
            For elapsed calendar days, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . To add days or weeks to a date, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . To identify a single date's weekday, use the{" "}
            <a className="ilt-content-link" href="/weekday-calculator">
              weekday calculator
            </a>
            . For row-based time totals, use the{" "}
            <a className="ilt-content-link" href="/time-card-calculator">
              time card calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Workdays calculator FAQ">
          {WORKDAYS_FAQ.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

export function WeeklyTimesheetCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Weekly Timesheet Calculator"
        path="/weekly-timesheet-calculator"
        description="Calculate weekly hours from fixed daily start, end, and break rows with per-day totals, decimal hours, copy, and reset."
        faqItems={WEEKLY_TIMESHEET_FAQ}
      />

      <ToolHero
        display={<WeeklyTimesheetCalculatorTool />}
        title="Weekly Timesheet Calculator"
        description="Add start, end, and break minutes for each day of a week to total weekly hours and decimal time."
      />

      <SeoBand>
        <ContentSection title="How this weekly timesheet calculator works">
          <p>
            Each day has a fixed row with start time, end time, and break
            minutes. Completed rows are totaled into weekly hours and decimal
            hours, while empty days stay at zero.
          </p>
          <p>
            If an end time is earlier than its start time, the row is treated as
            ending the next day and labelled as overnight. Rows with one missing
            time are called out instead of silently changing the total.
          </p>
        </ContentSection>

        <ContentSection title="Weekly timesheet versus time card">
          <p>
            The{" "}
            <a className="ilt-content-link" href="/time-card-calculator">
              time card calculator
            </a>{" "}
            is flexible and lets you add or remove arbitrary rows. This weekly
            timesheet calculator is organized by the days of the week for
            quick weekly planning and checking.
          </p>
          <p>
            It is for personal tracking, project logs, and simple weekly hour
            checks. It does not calculate wages, overtime, payroll, HR, tax, or
            legal totals. No rounding increment is applied; each row is summed
            to the entered minute.
          </p>
        </ContentSection>

        <ContentSection title="Related hour calculators">
          <p>
            For a single shift, use the{" "}
            <a className="ilt-content-link" href="/work-hours-calculator">
              work hours calculator
            </a>
            . For billable rate or rounding context, use the{" "}
            <a className="ilt-content-link" href="/billable-hours-calculator">
              billable hours calculator
            </a>
            . For live billable tracking, use the{" "}
            <a className="ilt-content-link" href="/billable-hours-clock">
              billable hours clock
            </a>
            . For one elapsed span, use the{" "}
            <a className="ilt-content-link" href="/time-duration-calculator">
              time duration calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Weekly timesheet calculator FAQ">
          {WEEKLY_TIMESHEET_FAQ.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </ContentSection>
      </SeoBand>
    </PageShell>
  );
}

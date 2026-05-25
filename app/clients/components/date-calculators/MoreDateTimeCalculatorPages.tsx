import { useEffect, useMemo, useState } from "react";
import {
  Button,
  ContentSection,
  Field,
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
import {
  clampInt,
  CopyState,
  copyToClipboard,
  DATE_CALCULATOR_FRAME_CLASS,
  dateInputFromParts,
  dayNumberFromParts,
  daysInMonth,
  JsonLd,
  localDateObject,
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

const MINUTES_PER_DAY = 1_440;
const SECONDS_PER_MINUTE = 60;

const TIME_DURATION_FAQ: FaqItem[] = [
  {
    question: "How does overnight time work?",
    answer:
      "Turn on the overnight setting when the end time is on the next day. For example, 10:00 PM to 1:30 AM becomes 3 hours 30 minutes.",
  },
  {
    question: "How is this different from the time calculator?",
    answer:
      "This page focuses on elapsed time between a start and end time. The time calculator is broader and handles add, subtract, and conversion-style time math.",
  },
  {
    question: "Can I use this for payroll or official records?",
    answer:
      "No. It is a general elapsed-time calculator, not a payroll, legal, HR, tax, contract, or compliance system.",
  },
];

const AGE_FAQ: FaqItem[] = [
  {
    question: "What does years, months, and days mean?",
    answer:
      "The result shows completed years, completed months after those years, and remaining calendar days as of the selected age-on date.",
  },
  {
    question: "How are leap-day birthdays handled?",
    answer:
      "The calculator keeps February 29 as the birth date. For non-leap-year birthday countdowns, it uses the last valid day of February.",
  },
  {
    question: "Can this verify legal age or eligibility?",
    answer:
      "No. It is a date-math helper only and does not verify legal age, identity, eligibility, or official status.",
  },
];

const DAYS_UNTIL_FAQ: FaqItem[] = [
  {
    question: "Does this count from today?",
    answer:
      "The start date defaults to today. You can change it to count days until a target date from another date.",
  },
  {
    question: "What happens if the target date is in the past?",
    answer:
      "The result changes to a days-since state so past target dates are not shown as a misleading zero.",
  },
  {
    question: "Is this an official deadline calculator?",
    answer:
      "No. It is for planning and simple date checks, not legal, tax, contract, or deadline-compliance decisions.",
  },
];

const WEEKDAY_FAQ: FaqItem[] = [
  {
    question: "What does this weekday calculator show?",
    answer:
      "It shows the day of the week for one local calendar date and labels whether that date falls on a weekday or weekend.",
  },
  {
    question: "How is this different from the business days calculator?",
    answer:
      "The business days calculator counts workdays across a range. This page identifies the weekday for a single date.",
  },
  {
    question: "Does it include holidays?",
    answer:
      "No. It only identifies the calendar weekday and weekend status for the selected date.",
  },
];

const WEEK_NUMBER_FAQ: FaqItem[] = [
  {
    question: "What is an ISO week number?",
    answer:
      "ISO weeks start on Monday, and week 1 is the week that contains the first Thursday of the ISO week-year.",
  },
  {
    question: "Can the ISO week-year differ from the calendar year?",
    answer:
      "Yes. Dates near January 1 can belong to the final ISO week of the previous year or the first ISO week of the next year.",
  },
  {
    question: "Is this for payroll, tax, or government reporting?",
    answer:
      "No. It is a planning and calendar lookup tool, not a payroll, tax, HR, government, or official calendar system.",
  },
];

const MONTHS_BETWEEN_FAQ: FaqItem[] = [
  {
    question: "What does full months and remaining days mean?",
    answer:
      "The calculator counts completed calendar months first, then counts the remaining calendar days after the last completed month.",
  },
  {
    question: "Why are months not all the same length?",
    answer:
      "Calendar months range from 28 to 31 days, so completed months can differ from a simple total-days divided by 30 estimate.",
  },
  {
    question: "Can I use this for billing, leases, or contracts?",
    answer:
      "No. It is a date-math helper for planning and comparison, not a billing, rental, legal, contract, or deadline system.",
  },
];

const BIRTHDAY_COUNTDOWN_FAQ: FaqItem[] = [
  {
    question: "How is the next birthday chosen?",
    answer:
      "The calculator compares the selected month and day with today's local calendar date. If that birthday has passed this year, it targets the next year.",
  },
  {
    question: "How are February 29 birthdays handled?",
    answer:
      "February 29 stays February 29. If the next occurrence is not in the current year, the countdown targets the next leap year that has February 29.",
  },
  {
    question: "Does the turning-age result verify eligibility?",
    answer:
      "No. The optional birth-year context is just date math and does not verify identity, legal age, or eligibility.",
  },
];

const HOURS_UNTIL_FAQ: FaqItem[] = [
  {
    question: "Does this count hours across dates?",
    answer:
      "Yes. It compares a local start date and time with a local target date and time, then shows total hours plus days, hours, and minutes.",
  },
  {
    question: "What happens when the target is in the past?",
    answer:
      "The result switches to an hours-since state so a past target is clear instead of being shown as a misleading zero.",
  },
  {
    question: "Is this an official deadline calculator?",
    answer:
      "No. It is a planning calculator and does not apply legal, contract, payroll, tax, or deadline-compliance rules.",
  },
];

function updateCopyState(setter: (value: string | null) => void, value: boolean) {
  setter(value ? "Copied" : "Copy failed");
  window.setTimeout(() => setter(null), 1200);
}

function setTimedCopyState(setter: (value: string | null) => void, value: string) {
  setter(value);
  window.setTimeout(() => setter(null), 1200);
}

function addDays(input: string, days: number) {
  const parts = parseDateInput(input);
  if (!parts) return input;
  return dateInputFromParts(partsFromDayNumber(dayNumberFromParts(parts) + days));
}

function isoDate(parts: LocalDateParts) {
  return dateInputFromParts(parts);
}

function isWeekend(parts: LocalDateParts) {
  const day = localDateObject(parts).getDay();
  return day === 0 || day === 6;
}

function nextHolidayFromStart(
  startValue: string,
  month: number,
  day: number,
  requireFuture = false,
) {
  const start = parseDateInput(startValue);
  if (!start) return startValue;
  const startDay = dayNumberFromParts(start);
  let candidate = {
    year: start.year,
    month,
    day: Math.min(day, daysInMonth(start.year, month)),
  };
  let candidateDay = dayNumberFromParts(candidate);
  if (candidateDay < startDay || (requireFuture && candidateDay === startDay)) {
    candidate = {
      year: start.year + 1,
      month,
      day: Math.min(day, daysInMonth(start.year + 1, month)),
    };
  }
  return dateInputFromParts(candidate);
}

function parseTimeInput(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatDurationMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}

function addMonthsClamped(parts: LocalDateParts, monthDelta: number) {
  const monthIndex = parts.year * 12 + (parts.month - 1) + monthDelta;
  const year = Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  return {
    year,
    month,
    day: Math.min(parts.day, daysInMonth(year, month)),
  };
}

function isLeapYear(year: number) {
  return daysInMonth(year, 2) === 29;
}

function dateTimeInputFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function nowDateTimeInputValue() {
  return dateTimeInputFromDate(new Date());
}

function parseDateTimeInput(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const dateParts = parseDateInput(match[1]);
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (!dateParts || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  const date = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    hours,
    minutes,
    0,
    0,
  );
  return {
    date,
  };
}

function addMinutesToDateTimeValue(value: string, minutes: number) {
  const parsed = parseDateTimeInput(value);
  if (!parsed) return value;
  return dateTimeInputFromDate(
    new Date(parsed.date.getTime() + minutes * SECONDS_PER_MINUTE * 1000),
  );
}

function formatLocalDateTime(date: Date) {
  return `${longDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })}, ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDecimalHoursFromMinutes(minutes: number) {
  const hours = minutes / 60;
  const value = Number.isInteger(hours)
    ? String(hours)
    : hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${value} ${Math.abs(hours) === 1 ? "hour" : "hours"}`;
}

function timeDurationResult(startTime: string, endTime: string, overnight: boolean) {
  const start = parseTimeInput(startTime);
  const end = parseTimeInput(endTime);
  if (start === null || end === null) return null;
  let totalMinutes = end - start;
  let status = "Same-day duration";
  if (overnight && totalMinutes <= 0) {
    totalMinutes += MINUTES_PER_DAY;
    status = totalMinutes === MINUTES_PER_DAY ? "Full-day overnight span" : "Overnight duration";
  } else if (totalMinutes < 0) {
    status = "End time is before start time";
  } else if (totalMinutes === 0) {
    status = "Same start and end time";
  }
  const absoluteMinutes = Math.abs(totalMinutes);
  return {
    totalMinutes,
    absoluteMinutes,
    display: totalMinutes < 0
      ? `-${formatDurationMinutes(absoluteMinutes)}`
      : formatDurationMinutes(totalMinutes),
    decimalHours: totalMinutes / 60,
    totalSeconds: totalMinutes * SECONDS_PER_MINUTE,
    status,
  };
}

function TimeDurationTool() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:30");
  const [overnight, setOvernight] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => timeDurationResult(startTime, endTime, overnight),
    [startTime, endTime, overnight],
  );
  const copyText = result
    ? `Time duration: ${result.display} from ${startTime} to ${endTime}. Decimal hours: ${result.decimalHours.toFixed(2)}.`
    : "Time duration: invalid time input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function reset() {
    setStartTime("09:00");
    setEndTime("17:30");
    setOvernight(false);
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Elapsed time"
        value={result ? result.display : "Invalid time"}
        context={
          result
            ? `${result.decimalHours.toFixed(2)} decimal hours`
            : "Enter valid start and end times."
        }
        status={result?.status}
      />

      <SettingGroup
        title="Start and end time"
        description="Use the overnight toggle when the end time lands on the next day."
      >
        <SettingRow className="sm:grid-cols-2">
          <Field
            label="Start time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.currentTarget.value)}
            onBlur={(event) => setStartTime(event.currentTarget.value)}
          />
          <Field
            label="End time"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.currentTarget.value)}
            onBlur={(event) => setEndTime(event.currentTarget.value)}
          />
        </SettingRow>
        <SettingRow>
          <Toggle
            label="End time is next day"
            checked={overnight}
            onCheckedChange={setOvernight}
          />
        </SettingRow>
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails columns="3">
          <UtilityResultRow>
            <span>Total minutes</span>
            <strong>{result.totalMinutes}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Total seconds</span>
            <strong>{result.totalSeconds}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Decimal hours</span>
            <strong>{result.decimalHours.toFixed(2)}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        General elapsed-time math. It is not payroll or official recordkeeping.
      </ShortcutHint>
    </ToolFrame>
  );
}

function birthdayForYear(birth: LocalDateParts, year: number) {
  return {
    year,
    month: birth.month,
    day: Math.min(birth.day, daysInMonth(year, birth.month)),
  };
}

function ageResult(birthValue: string, ageOnValue: string) {
  const birth = parseDateInput(birthValue);
  const ageOn = parseDateInput(ageOnValue);
  if (!birth || !ageOn) return null;
  const birthDay = dayNumberFromParts(birth);
  const ageOnDay = dayNumberFromParts(ageOn);
  if (birthDay > ageOnDay) {
    return { birth, ageOn, future: true as const };
  }

  let years = ageOn.year - birth.year;
  let months = ageOn.month - birth.month;
  let days = ageOn.day - birth.day;

  if (days < 0) {
    months -= 1;
    const previousMonth = ageOn.month === 1 ? 12 : ageOn.month - 1;
    const previousMonthYear = ageOn.month === 1 ? ageOn.year - 1 : ageOn.year;
    days += daysInMonth(previousMonthYear, previousMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let nextBirthday = birthdayForYear(birth, ageOn.year);
  if (dayNumberFromParts(nextBirthday) < ageOnDay) {
    nextBirthday = birthdayForYear(birth, ageOn.year + 1);
  }

  return {
    birth,
    ageOn,
    future: false as const,
    years,
    months,
    days,
    totalDays: ageOnDay - birthDay,
    completedMonths: years * 12 + months,
    nextBirthday,
    daysUntilBirthday: dayNumberFromParts(nextBirthday) - ageOnDay,
    birthWeekday: weekdayName(birth),
  };
}

function AgeCalculatorTool({ initialToday }: { initialToday: string }) {
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [ageOnDate, setAgeOnDate] = useState(initialToday);
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    setAgeOnDate(todayInputValue());
  }, []);

  const result = useMemo(
    () => ageResult(birthDate, ageOnDate),
    [birthDate, ageOnDate],
  );
  const validResult = result && !result.future ? result : null;
  const copyText = validResult
    ? `Age: ${validResult.years} years, ${validResult.months} months, ${validResult.days} days on ${ageOnDate}. Total days: ${validResult.totalDays}.`
    : "Age calculation: invalid or future birth date.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function reset() {
    setBirthDate("2000-01-01");
    setAgeOnDate(initialToday);
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Age"
        value={
          validResult
            ? `${validResult.years}y ${validResult.months}m ${validResult.days}d`
            : result?.future
              ? "Future date"
              : "Invalid date"
        }
        context={
          validResult
            ? `${validResult.years} years, ${validResult.months} months, ${validResult.days} days`
            : result?.future
              ? "Birth date is after the age-on date."
              : "Enter valid birth and age-on dates."
        }
        status={validResult ? `As of ${longDate(validResult.ageOn)}` : "Check dates"}
      />

      <SettingGroup
        title="Birth date and age-on date"
        description="Calculate age as of today or any selected calendar date."
      >
        <SettingRow className="sm:grid-cols-2">
          <Field
            label="Birth date"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.currentTarget.value)}
            onBlur={(event) => setBirthDate(event.currentTarget.value)}
          />
          <Field
            label="Age on date"
            type="date"
            value={ageOnDate}
            onChange={(event) => setAgeOnDate(event.currentTarget.value)}
            onBlur={(event) => setAgeOnDate(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={() => setAgeOnDate(todayInputValue())}>
          Today
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {validResult ? (
        <ResultDetails>
          <UtilityResultRow>
            <span>Total days</span>
            <strong>{validResult.totalDays}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Completed months</span>
            <strong>{validResult.completedMonths}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Next birthday</span>
            <strong>{plural(validResult.daysUntilBirthday, "day")}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Birth weekday</span>
            <strong>{validResult.birthWeekday}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Date math helper only. It does not verify legal age or eligibility.
      </ShortcutHint>
    </ToolFrame>
  );
}

function daysUntilResult(startValue: string, targetValue: string) {
  const start = parseDateInput(startValue);
  const target = parseDateInput(targetValue);
  if (!start || !target) return null;
  const days = dayNumberFromParts(target) - dayNumberFromParts(start);
  const absoluteDays = Math.abs(days);
  return {
    start,
    target,
    days,
    absoluteDays,
    weeks: Math.floor(absoluteDays / 7),
    remainingDays: absoluteDays % 7,
    state: days > 0 ? "future" : days < 0 ? "past" : "today",
  };
}

function DaysUntilTool({ initialToday }: { initialToday: string }) {
  const [startDate, setStartDate] = useState(initialToday);
  const [targetDate, setTargetDate] = useState(addDays(initialToday, 7));
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    const browserToday = todayInputValue();
    setStartDate(browserToday);
    setTargetDate(addDays(browserToday, 7));
  }, []);

  const result = useMemo(
    () => daysUntilResult(startDate, targetDate),
    [startDate, targetDate],
  );
  const displayValue = result
    ? result.days > 0
      ? `${result.days} days until`
      : result.days < 0
        ? `${result.absoluteDays} days since`
        : "0 days"
    : "Invalid date";
  const copyText = result
    ? `Days until: ${displayValue} ${targetDate} from ${startDate}.`
    : "Days until: invalid date input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function reset() {
    setStartDate(initialToday);
    setTargetDate(addDays(initialToday, 7));
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Days until"
        value={displayValue}
        context={
          result
            ? `${longDate(result.start)} to ${longDate(result.target)}`
            : "Enter valid start and target dates."
        }
        status={
          result?.state === "past"
            ? "Target date is in the past"
            : result?.state === "today"
              ? "Target date is today"
              : "Target date is in the future"
        }
      />

      <SettingGroup
        title="Start and target date"
        description="The start date defaults to today, and the target date can be any local calendar date."
      >
        <SettingRow className="sm:grid-cols-2">
          <Field
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            onBlur={(event) => setStartDate(event.currentTarget.value)}
          />
          <Field
            label="Target date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.currentTarget.value)}
            onBlur={(event) => setTargetDate(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <PresetGroup title="Presets">
        <PresetChip onClick={() => setTargetDate(nextHolidayFromStart(startDate, 1, 1, true))}>
          New Year
        </PresetChip>
        <PresetChip onClick={() => setTargetDate(nextHolidayFromStart(startDate, 12, 25))}>
          Christmas
        </PresetChip>
        <PresetChip onClick={() => setTargetDate(addDays(startDate, 7))}>
          Today + 7 days
        </PresetChip>
        <PresetChip onClick={() => setTargetDate(addDays(startDate, 30))}>
          Today + 30 days
        </PresetChip>
      </PresetGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={() => setStartDate(todayInputValue())}>
          Today
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails columns="3">
          <UtilityResultRow>
            <span>Weeks + days</span>
            <strong>
              {result.weeks}w {result.remainingDays}d
            </strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Target weekday</span>
            <strong>{weekdayName(result.target)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Target state</span>
            <strong>{result.state}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Simple date counting only. Check official rules separately when they matter.
      </ShortcutHint>
    </ToolFrame>
  );
}

function WeekdayTool({ initialToday }: { initialToday: string }) {
  const [dateValue, setDateValue] = useState(initialToday);
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    setDateValue(todayInputValue());
  }, []);

  const selectedDate = parseDateInput(dateValue);
  const weekend = selectedDate ? isWeekend(selectedDate) : false;
  const copyText = selectedDate
    ? `${dateValue} is ${weekdayName(selectedDate)}. It is a ${weekend ? "weekend" : "weekday"}.`
    : "Weekday calculation: invalid date input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Weekday"
        value={selectedDate ? weekdayName(selectedDate) : "Invalid date"}
        context={selectedDate ? longDate(selectedDate) : "Enter a valid date."}
        status={selectedDate ? (weekend ? "Weekend" : "Weekday") : "Check date"}
      />

      <SettingGroup
        title="Date"
        description="Find the day of the week for one local calendar date."
      >
        <SettingRow className="sm:grid-cols-[minmax(0,1fr)]">
          <Field
            label="Date"
            type="date"
            value={dateValue}
            onInput={(event) => setDateValue(event.currentTarget.value)}
            onChange={(event) => setDateValue(event.currentTarget.value)}
            onBlur={(event) => setDateValue(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={() => setDateValue(todayInputValue())}>
          Today
        </Button>
        <Button variant="secondary" onClick={() => setDateValue(initialToday)}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {selectedDate ? (
        <ResultDetails columns="3">
          <UtilityResultRow>
            <span>Formatted date</span>
            <strong>{longDate(selectedDate)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>ISO date</span>
            <strong>{isoDate(selectedDate)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Type</span>
            <strong>{weekend ? "Weekend" : "Weekday"}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Local calendar date lookup. It does not add holiday or official calendar rules.
      </ShortcutHint>
    </ToolFrame>
  );
}

function isoWeekInfo(value: string) {
  const parts = parseDateInput(value);
  if (!parts) return null;
  const dayNumber = dayNumberFromParts(parts);
  const jsDay = localDateObject(parts).getDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const thursday = partsFromDayNumber(dayNumber + (4 - isoDay));
  const weekYear = thursday.year;
  const jan4 = { year: weekYear, month: 1, day: 4 };
  const jan4IsoDay = localDateObject(jan4).getDay() || 7;
  const weekOneMonday = dayNumberFromParts(jan4) - (jan4IsoDay - 1);
  const weekNumber = Math.floor((dayNumber - weekOneMonday) / 7) + 1;
  const weekStart = partsFromDayNumber(dayNumber - (isoDay - 1));
  const weekEnd = partsFromDayNumber(dayNumber + (7 - isoDay));

  return {
    parts,
    weekNumber,
    weekYear,
    isoDay,
    weekStart,
    weekEnd,
  };
}

function WeekNumberTool({ initialToday }: { initialToday: string }) {
  const [dateValue, setDateValue] = useState(initialToday);
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    setDateValue(todayInputValue());
  }, []);

  const result = useMemo(() => isoWeekInfo(dateValue), [dateValue]);
  const copyText = result
    ? `${dateValue} is ISO week ${result.weekNumber} of ${result.weekYear}. The ISO week runs ${dateInputFromParts(result.weekStart)} to ${dateInputFromParts(result.weekEnd)}.`
    : "Week number calculation: invalid date input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="ISO week"
        value={result ? `Week ${result.weekNumber}` : "Invalid date"}
        context={
          result
            ? `ISO week-year ${result.weekYear}`
            : "Enter a valid local calendar date."
        }
        status={result ? "Monday-start ISO week" : "Check date"}
      />

      <SettingGroup
        title="Date"
        description="Find the ISO week number for one local calendar date."
      >
        <SettingRow className="sm:grid-cols-[minmax(0,1fr)]">
          <Field
            label="Date"
            type="date"
            value={dateValue}
            onInput={(event) => setDateValue(event.currentTarget.value)}
            onChange={(event) => setDateValue(event.currentTarget.value)}
            onBlur={(event) => setDateValue(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={() => setDateValue(todayInputValue())}>
          Today
        </Button>
        <Button variant="secondary" onClick={() => setDateValue(initialToday)}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails>
          <UtilityResultRow>
            <span>Weekday</span>
            <strong>{weekdayName(result.parts)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Week start</span>
            <strong>{dateInputFromParts(result.weekStart)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Week end</span>
            <strong>{dateInputFromParts(result.weekEnd)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Calendar year</span>
            <strong>{result.parts.year}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        ISO week-years can differ from calendar years near January 1.
      </ShortcutHint>
    </ToolFrame>
  );
}

function monthsBetweenResult(startValue: string, endValue: string) {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (!start || !end) return null;

  const startDay = dayNumberFromParts(start);
  const endDay = dayNumberFromParts(end);
  const reversed = endDay < startDay;
  const from = reversed ? end : start;
  const to = reversed ? start : end;
  const toDay = dayNumberFromParts(to);

  let fullMonths = (to.year - from.year) * 12 + (to.month - from.month);
  let anchor = addMonthsClamped(from, fullMonths);
  if (dayNumberFromParts(anchor) > toDay) {
    fullMonths -= 1;
    anchor = addMonthsClamped(from, fullMonths);
  }

  const remainingDays = toDay - dayNumberFromParts(anchor);
  const totalDays = Math.abs(endDay - startDay);
  const approximateMonths = totalDays / 30.4375;

  return {
    start,
    end,
    reversed,
    fullMonths,
    remainingDays,
    totalDays,
    approximateMonths,
  };
}

function MonthsBetweenDatesTool() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-04-01");
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => monthsBetweenResult(startDate, endDate),
    [startDate, endDate],
  );
  const displayValue = result
    ? result.reversed
      ? `${result.fullMonths}m ${result.remainingDays}d back`
      : `${result.fullMonths}m ${result.remainingDays}d`
    : "Invalid date";
  const copyText = result
    ? `Months between dates: ${displayValue} from ${startDate} to ${endDate}. Total days: ${result.totalDays}.`
    : "Months between dates: invalid date input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function reset() {
    setStartDate("2026-01-01");
    setEndDate("2026-04-01");
  }

  function setBothToday() {
    const today = todayInputValue();
    setStartDate(today);
    setEndDate(today);
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Full months + days"
        value={displayValue}
        context={
          result
            ? `${longDate(result.start)} to ${longDate(result.end)}`
            : "Enter valid start and end dates."
        }
        status={
          result?.reversed
            ? "End date is before start date"
            : "Completed calendar months"
        }
      />

      <SettingGroup
        title="Date range"
        description="Count completed calendar months first, then the remaining days."
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
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={setBothToday}>
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
            <span>Total days</span>
            <strong>{result.totalDays}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Approx. months</span>
            <strong>{result.approximateMonths.toFixed(1)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Start weekday</span>
            <strong>{weekdayName(result.start)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>End weekday</span>
            <strong>{weekdayName(result.end)}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Month lengths vary, so completed months are separate from approximate months.
      </ShortcutHint>
    </ToolFrame>
  );
}

function parseOptionalYear(value: string) {
  if (!value.trim()) return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1 || year > 9999) return null;
  return year;
}

function birthdayTargetForYear(month: number, day: number, year: number) {
  if (month === 2 && day === 29 && !isLeapYear(year)) return null;
  return { year, month, day };
}

function birthdayCountdownResult(
  monthValue: string,
  dayValue: string,
  birthYearValue: string,
  todayValue: string,
) {
  const today = parseDateInput(todayValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const birthYear = parseOptionalYear(birthYearValue);

  if (
    !today ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(2024, month)
  ) {
    return null;
  }

  const todayDay = dayNumberFromParts(today);
  let nextBirthday: LocalDateParts | null = null;

  for (let year = today.year; year <= today.year + 8; year += 1) {
    const candidate = birthdayTargetForYear(month, day, year);
    if (candidate && dayNumberFromParts(candidate) >= todayDay) {
      nextBirthday = candidate;
      break;
    }
  }

  if (!nextBirthday) return null;

  const daysUntil = dayNumberFromParts(nextBirthday) - todayDay;
  const turningAge =
    birthYear !== null && nextBirthday.year >= birthYear
      ? nextBirthday.year - birthYear
      : null;

  return {
    today,
    month,
    day,
    birthYear,
    nextBirthday,
    daysUntil,
    weekday: weekdayName(nextBirthday),
    turningAge,
    birthYearAfterTarget: birthYear !== null && nextBirthday.year < birthYear,
  };
}

function BirthdayCountdownTool({ initialToday }: { initialToday: string }) {
  const initialParts = parseDateInput(initialToday) ?? { year: 2026, month: 1, day: 1 };
  const [todayValue, setTodayValue] = useState(initialToday);
  const [birthdayMonth, setBirthdayMonth] = useState(String(initialParts.month));
  const [birthdayDay, setBirthdayDay] = useState(String(initialParts.day));
  const [birthYear, setBirthYear] = useState("");
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    const browserToday = todayInputValue();
    const browserParts = parseDateInput(browserToday);
    setTodayValue(browserToday);
    if (browserParts) {
      setBirthdayMonth(String(browserParts.month));
      setBirthdayDay(String(browserParts.day));
    }
  }, []);

  const result = useMemo(
    () => birthdayCountdownResult(birthdayMonth, birthdayDay, birthYear, todayValue),
    [birthdayMonth, birthdayDay, birthYear, todayValue],
  );
  const displayValue = result
    ? result.daysUntil === 0
      ? "Today"
      : plural(result.daysUntil, "day")
    : "Invalid date";
  const copyText = result
    ? `Birthday countdown: ${displayValue} until ${dateInputFromParts(result.nextBirthday)} (${result.weekday})${result.turningAge !== null ? `. Turning ${result.turningAge}` : ""}.`
    : "Birthday countdown: invalid birthday input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  async function shareResult() {
    if (!result) {
      updateCopyState(setCopyState, await copyToClipboard(copyText));
      return;
    }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Birthday Countdown",
          text: copyText,
          url: window.location.href,
        });
        setTimedCopyState(setCopyState, "Shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setTimedCopyState(setCopyState, "Share cancelled");
          return;
        }
      }
    }

    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function setBirthdayToToday() {
    const today = todayInputValue();
    const parts = parseDateInput(today);
    setTodayValue(today);
    if (parts) {
      setBirthdayMonth(String(parts.month));
      setBirthdayDay(String(parts.day));
    }
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Next birthday"
        value={displayValue}
        context={
          result
            ? result.daysUntil === 0
              ? "Today is the selected birthday."
              : `Next birthday: ${longDate(result.nextBirthday)}`
            : "Enter a valid birthday month and day."
        }
        status={
          result
            ? result.turningAge !== null
              ? `Turning ${result.turningAge}`
              : "Local calendar countdown"
            : "Check birthday"
        }
        initialScale={1.31}
        initialMobileScale={1.17}
      />

      <SettingGroup
        title="Birthday"
        description="Enter a birthday month and day. Birth year is optional and only adds turning-age context."
      >
        <SettingRow className="sm:grid-cols-3">
          <Field
            label="Month"
            type="number"
            min={1}
            max={12}
            inputMode="numeric"
            value={birthdayMonth}
            onInput={(event) => setBirthdayMonth(event.currentTarget.value)}
            onChange={(event) => setBirthdayMonth(event.currentTarget.value)}
            onBlur={(event) => setBirthdayMonth(event.currentTarget.value)}
          />
          <Field
            label="Day"
            type="number"
            min={1}
            max={31}
            inputMode="numeric"
            value={birthdayDay}
            onInput={(event) => setBirthdayDay(event.currentTarget.value)}
            onChange={(event) => setBirthdayDay(event.currentTarget.value)}
            onBlur={(event) => setBirthdayDay(event.currentTarget.value)}
          />
          <Field
            label="Birth year (optional)"
            type="number"
            min={1}
            max={9999}
            inputMode="numeric"
            value={birthYear}
            onInput={(event) => setBirthYear(event.currentTarget.value)}
            onChange={(event) => setBirthYear(event.currentTarget.value)}
            onBlur={(event) => setBirthYear(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={shareResult}>
          Share result
        </Button>
        <Button variant="secondary" onClick={setBirthdayToToday}>
          Today
        </Button>
        <Button variant="secondary" onClick={setBirthdayToToday}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails>
          <UtilityResultRow>
            <span>Next birthday date</span>
            <strong>{dateInputFromParts(result.nextBirthday)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Birthday weekday</span>
            <strong>{result.weekday}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Turning age</span>
            <strong>
              {result.turningAge !== null
                ? result.turningAge
                : result.birthYearAfterTarget
                  ? "Check year"
                  : "Optional"}
            </strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Leap-day rule</span>
            <strong>{result.month === 2 && result.day === 29 ? "Next Feb 29" : "Annual"}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Optional age context is date math only and does not verify eligibility.
      </ShortcutHint>
    </ToolFrame>
  );
}

function hoursUntilResult(startValue: string, targetValue: string) {
  const start = parseDateTimeInput(startValue);
  const target = parseDateTimeInput(targetValue);
  if (!start || !target) return null;

  const totalMinutes = Math.round(
    (target.date.getTime() - start.date.getTime()) /
      (SECONDS_PER_MINUTE * 1000),
  );
  const absoluteMinutes = Math.abs(totalMinutes);
  const days = Math.floor(absoluteMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((absoluteMinutes % MINUTES_PER_DAY) / 60);
  const minutes = absoluteMinutes % 60;

  return {
    start,
    target,
    totalMinutes,
    absoluteMinutes,
    decimalHours: totalMinutes / 60,
    days,
    hours,
    minutes,
    state: totalMinutes > 0 ? "future" : totalMinutes < 0 ? "past" : "same",
  };
}

function HoursUntilTool({ initialNow }: { initialNow: string }) {
  const [startDateTime, setStartDateTime] = useState(initialNow);
  const [targetDateTime, setTargetDateTime] = useState(addMinutesToDateTimeValue(initialNow, 60));
  const [copyState, setCopyState] = useState<string | null>(null);

  useEffect(() => {
    const browserNow = nowDateTimeInputValue();
    setStartDateTime(browserNow);
    setTargetDateTime(addMinutesToDateTimeValue(browserNow, 60));
  }, []);

  const result = useMemo(
    () => hoursUntilResult(startDateTime, targetDateTime),
    [startDateTime, targetDateTime],
  );
  const displayValue = result
    ? result.state === "past"
      ? `${formatDecimalHoursFromMinutes(result.absoluteMinutes)} since`
      : formatDecimalHoursFromMinutes(result.absoluteMinutes)
    : "Invalid time";
  const copyText = result
    ? `Hours until: ${displayValue} from ${startDateTime} to ${targetDateTime}. Total minutes: ${result.totalMinutes}.`
    : "Hours until: invalid date or time input.";

  async function copyResult() {
    updateCopyState(setCopyState, await copyToClipboard(copyText));
  }

  function applyPreset(minutes: number) {
    setTargetDateTime(addMinutesToDateTimeValue(startDateTime, minutes));
  }

  function setNow() {
    const now = nowDateTimeInputValue();
    setStartDateTime(now);
    setTargetDateTime(addMinutesToDateTimeValue(now, 60));
  }

  function reset() {
    setStartDateTime(initialNow);
    setTargetDateTime(addMinutesToDateTimeValue(initialNow, 60));
  }

  function setTomorrowAtNine() {
    const start = parseDateTimeInput(startDateTime);
    const base = start?.date ?? new Date();
    const tomorrow = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + 1,
      9,
      0,
      0,
      0,
    );
    setTargetDateTime(dateTimeInputFromDate(tomorrow));
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Hours until"
        value={displayValue}
        context={
          result
            ? `${result.days}d ${result.hours}h ${result.minutes}m`
            : "Enter valid start and target date/time values."
        }
        status={
          result?.state === "past"
            ? "Target is in the past"
            : result?.state === "same"
              ? "Same start and target"
              : "Target is in the future"
        }
      />

      <SettingGroup
        title="Start and target"
        description="Compare a local start date/time with a local target date/time."
      >
        <SettingRow className="sm:grid-cols-2">
          <Field
            label="Start date and time"
            type="datetime-local"
            value={startDateTime}
            onInput={(event) => setStartDateTime(event.currentTarget.value)}
            onChange={(event) => setStartDateTime(event.currentTarget.value)}
            onBlur={(event) => setStartDateTime(event.currentTarget.value)}
          />
          <Field
            label="Target date and time"
            type="datetime-local"
            value={targetDateTime}
            onInput={(event) => setTargetDateTime(event.currentTarget.value)}
            onChange={(event) => setTargetDateTime(event.currentTarget.value)}
            onBlur={(event) => setTargetDateTime(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      <PresetGroup title="Presets">
        <PresetChip onClick={() => applyPreset(60)}>+1 hour</PresetChip>
        <PresetChip onClick={() => applyPreset(360)}>+6 hours</PresetChip>
        <PresetChip onClick={() => applyPreset(720)}>+12 hours</PresetChip>
        <PresetChip onClick={() => applyPreset(1440)}>+24 hours</PresetChip>
        <PresetChip onClick={setTomorrowAtNine}>Tomorrow 09:00</PresetChip>
      </PresetGroup>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={setNow}>
          Now
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      {result ? (
        <ResultDetails>
          <UtilityResultRow>
            <span>Decimal hours</span>
            <strong>{result.decimalHours.toFixed(2)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Total minutes</span>
            <strong>{result.totalMinutes}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Target local time</span>
            <strong>{formatLocalDateTime(result.target.date)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>State</span>
            <strong>{result.state}</strong>
          </UtilityResultRow>
        </ResultDetails>
      ) : null}
      <ShortcutHint>
        Local date/time math only. It does not apply deadline or contract rules.
      </ShortcutHint>
    </ToolFrame>
  );
}

export function TimeDurationCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Time Duration Calculator"
        path="/time-duration-calculator"
        description="Calculate elapsed time between two times, including overnight spans, decimal hours, total minutes, and total seconds."
        faqItems={TIME_DURATION_FAQ}
      />

      <ToolHero
        display={<TimeDurationTool />}
        title="Time Duration Calculator"
        description="Calculate elapsed time between a start time and end time, with overnight handling and decimal-hour output."
      />

      <SeoBand>
        <ContentSection title="How this time duration calculator works">
          <p>
            Enter a start time and an end time. The main result shows elapsed
            hours and minutes, while the supporting rows show decimal hours,
            total minutes, and total seconds.
          </p>
          <p>
            Turn on overnight mode when the end time is on the next day. That
            keeps late-night spans such as 10:00 PM to 1:30 AM from looking
            like a negative same-day duration.
          </p>
        </ContentSection>

        <ContentSection title="When to use duration between times">
          <p>
            Use it for calculating elapsed time, planning schedules, checking
            time between appointments, classroom examples, and simple project
            timing. It is general time math rather than payroll or timesheet
            tracking.
          </p>
        </ContentSection>

        <ContentSection title="Related time tools">
          <p>
            For add and subtract time math, use the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>
            . For work-shift style totals, use the{" "}
            <a className="ilt-content-link" href="/work-hours-calculator">
              work hours calculator
            </a>
            . For several clock-in and clock-out rows, use the{" "}
            <a className="ilt-content-link" href="/time-card-calculator">
              time card calculator
            </a>
            . For live elapsed timing, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For dates between calendar days, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . To calculate hours until a target date and time, use the{" "}
            <a className="ilt-content-link" href="/hours-until-calculator">
              hours until calculator
            </a>
            . For unit conversions, use the{" "}
            <a className="ilt-content-link" href="/milliseconds-converter">
              milliseconds converter
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Time duration FAQ">
          {TIME_DURATION_FAQ.map((item) => (
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

export function AgeCalculatorPage({ initialToday }: { initialToday: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Age Calculator"
        path="/age-calculator"
        description="Calculate age in years, months, and days from a birth date to today or another selected date."
        faqItems={AGE_FAQ}
      />

      <ToolHero
        display={<AgeCalculatorTool initialToday={initialToday} />}
        title="Age Calculator"
        description="Calculate age from a birth date to today or another age-on date, with years, months, days, total days, and birthday context."
      />

      <SeoBand>
        <ContentSection title="How this age calculator works">
          <p>
            Enter a birth date and choose the date to calculate age on. The main
            result shows completed years, months, and days for that date.
          </p>
          <p>
            The supporting rows show total days, completed months, the next
            birthday distance, and the weekday of the birth date.
          </p>
        </ContentSection>

        <ContentSection title="Age on today or another date">
          <p>
            The age-on date defaults to today, but you can set it to a past or
            future calendar date for classroom date math, birthday planning, or
            forms where you need to know an age. This page does not verify legal
            age or eligibility.
          </p>
        </ContentSection>

        <ContentSection title="Related date calculators">
          <p>
            For all days between two dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For adding days or months to a date, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . For days remaining until a target date, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . For the next birthday specifically, use the{" "}
            <a className="ilt-content-link" href="/birthday-countdown">
              birthday countdown
            </a>
            . For January 1, use the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Age calculator FAQ">
          {AGE_FAQ.map((item) => (
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

export function DaysUntilCalculatorPage({ initialToday }: { initialToday: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Days Until Calculator"
        path="/days-until-calculator"
        description="Calculate how many days remain until a target date, with weeks plus days, target weekday, and past-date handling."
        faqItems={DAYS_UNTIL_FAQ}
      />

      <ToolHero
        display={<DaysUntilTool initialToday={initialToday} />}
        title="Days Until Calculator"
        description="Calculate days until a target date from today or another start date, with clear past, today, and future states."
      />

      <SeoBand>
        <ContentSection title="How this days until calculator works">
          <p>
            Choose a start date and a target date. The result shows days until
            the target, or days since the target when the selected date is in
            the past.
          </p>
          <p>
            Presets can jump to New Year, Christmas, seven days ahead, or
            thirty days ahead while keeping the page focused on simple
            date-to-date counting.
          </p>
        </ContentSection>

        <ContentSection title="When days remaining is useful">
          <p>
            Use it for birthdays, trips, events, school projects, personal
            planning, and informal deadline checks. It is separate from the
            event countdown because this page calculates calendar days instead
            of running a live named countdown.
          </p>
        </ContentSection>

        <ContentSection title="Related countdown and date tools">
          <p>
            For a live named countdown, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For a simple date and time countdown, use{" "}
            <a className="ilt-content-link" href="/countdown-to-date">
              countdown to date
            </a>
            . For all days between dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For adding dates, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . For New Year specifically, use the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>
            . For birthday dates, use the{" "}
            <a className="ilt-content-link" href="/birthday-countdown">
              birthday countdown
            </a>
            . For December 25, use the{" "}
            <a className="ilt-content-link" href="/christmas-countdown">
              Christmas countdown
            </a>
            . For date and time targets, use the{" "}
            <a className="ilt-content-link" href="/hours-until-calculator">
              hours until calculator
            </a>
            . For age on a date, use the{" "}
            <a className="ilt-content-link" href="/age-calculator">
              age calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Days until FAQ">
          {DAYS_UNTIL_FAQ.map((item) => (
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

export function WeekdayCalculatorPage({ initialToday }: { initialToday: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Weekday Calculator"
        path="/weekday-calculator"
        description="Find the day of the week for a selected local calendar date and see whether it is a weekday or weekend."
        faqItems={WEEKDAY_FAQ}
      />

      <ToolHero
        display={<WeekdayTool initialToday={initialToday} />}
        title="Weekday Calculator"
        description="Find the weekday for a date, with formatted date, ISO date, and weekday or weekend status shown below."
      />

      <SeoBand>
        <ContentSection title="How this weekday calculator works">
          <p>
            Pick one calendar date and the result shows the day of the week.
            The supporting rows show the formatted date, ISO-style date, and
            whether the date is a weekday or weekend.
          </p>
        </ContentSection>

        <ContentSection title="When to find the day of week">
          <p>
            Use it to check a future date, look up a past date, plan events,
            work through classroom calendar examples, or make a quick schedule
            check. The calculator identifies the weekday only and does not add
            holiday or official calendar rules.
          </p>
        </ContentSection>

        <ContentSection title="Related date tools">
          <p>
            To add or subtract from a date, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . To count days between dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . To count weekday ranges, use the{" "}
            <a className="ilt-content-link" href="/business-days-calculator">
              business days calculator
            </a>
            . To count days until a target date, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . To find the ISO week number, use the{" "}
            <a className="ilt-content-link" href="/week-number-calculator">
              week number calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Weekday calculator FAQ">
          {WEEKDAY_FAQ.map((item) => (
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

export function WeekNumberCalculatorPage({ initialToday }: { initialToday: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Week Number Calculator"
        path="/week-number-calculator"
        description="Find the ISO week number, ISO week-year, weekday, and Monday-to-Sunday week range for a selected local calendar date."
        faqItems={WEEK_NUMBER_FAQ}
      />

      <ToolHero
        display={<WeekNumberTool initialToday={initialToday} />}
        title="Week Number Calculator"
        description="Find the ISO week number for a date, with ISO week-year, weekday, week start, week end, and calendar year shown clearly."
      />

      <SeoBand>
        <ContentSection title="How this week number calculator works">
          <p>
            Choose a calendar date and the result shows the ISO week number.
            ISO weeks start on Monday, and the ISO week-year is shown because it
            can differ from the calendar year near New Year.
          </p>
          <p>
            Supporting rows show the selected date's weekday, the Monday start
            date for that ISO week, the Sunday end date, and the calendar year
            of the selected date.
          </p>
        </ContentSection>

        <ContentSection title="When week numbers are useful">
          <p>
            Week numbers are useful for project planning, work schedules,
            classroom calendar examples, reporting periods, and personal
            planning. This page is a calendar lookup helper and does not apply
            payroll, tax, HR, government, or official reporting rules.
          </p>
        </ContentSection>

        <ContentSection title="Related date calculators">
          <p>
            To identify a weekday without week numbering, use the{" "}
            <a className="ilt-content-link" href="/weekday-calculator">
              weekday calculator
            </a>
            . To add or subtract from a date, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . To count days between dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For weekday ranges, use the{" "}
            <a className="ilt-content-link" href="/business-days-calculator">
              business days calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Week number FAQ">
          {WEEK_NUMBER_FAQ.map((item) => (
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

export function MonthsBetweenDatesCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Months Between Dates Calculator"
        path="/months-between-dates-calculator"
        description="Calculate completed calendar months and remaining days between two local calendar dates, with total days and weekday context."
        faqItems={MONTHS_BETWEEN_FAQ}
      />

      <ToolHero
        display={<MonthsBetweenDatesTool />}
        title="Months Between Dates Calculator"
        description="Calculate full months and remaining days between two dates, with total days, approximate months, and start/end weekdays."
      />

      <SeoBand>
        <ContentSection title="How this months between dates calculator works">
          <p>
            Enter a start date and an end date. The main result counts
            completed calendar months first, then shows the remaining days after
            the last completed month.
          </p>
          <p>
            Month lengths vary, so the supporting approximate-months result is
            separate from the completed-month count. End-before-start ranges are
            labelled clearly instead of being hidden as zero.
          </p>
        </ContentSection>

        <ContentSection title="When months and days are useful">
          <p>
            Use this calculator for project planning, tracking elapsed months,
            personal date planning, rough planning periods, and comparing date
            ranges. It is not a contract, billing, rental, legal, or deadline
            authority.
          </p>
        </ContentSection>

        <ContentSection title="Related date calculators">
          <p>
            For elapsed calendar days, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For full weeks and remaining days, use the{" "}
            <a className="ilt-content-link" href="/weeks-between-dates-calculator">
              weeks between dates calculator
            </a>
            . To add or subtract months from a date, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . To count days remaining until a target date, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . To calculate age-style years, months, and days, use the{" "}
            <a className="ilt-content-link" href="/age-calculator">
              age calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Months between dates FAQ">
          {MONTHS_BETWEEN_FAQ.map((item) => (
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

export function BirthdayCountdownPage({ initialToday }: { initialToday: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Birthday Countdown"
        path="/birthday-countdown"
        description="Calculate days until the next birthday from a month and day, with next birthday date, weekday, optional turning age, copy, and share."
        faqItems={BIRTHDAY_COUNTDOWN_FAQ}
      />

      <ToolHero
        display={<BirthdayCountdownTool initialToday={initialToday} />}
        title="Birthday Countdown"
        description="Find how many days remain until the next birthday, with optional birth-year context and clear leap-day handling."
      />

      <SeoBand>
        <ContentSection title="How this birthday countdown works">
          <p>
            Enter the birthday month and day. The calculator compares that date
            with today's local calendar date and targets the next matching
            birthday. If it has already passed this year, it rolls forward to
            next year.
          </p>
          <p>
            The optional birth year adds a turning-age row, but it is only date
            math. It does not verify identity, legal age, or eligibility.
          </p>
        </ContentSection>

        <ContentSection title="Birthday planning and leap-day notes">
          <p>
            Use it for party planning, birthday reminders, classroom date
            examples, checking the weekday of the next birthday, or sharing a
            simple countdown. February 29 birthdays stay February 29 and target
            the next leap year when needed.
          </p>
        </ContentSection>

        <ContentSection title="Related birthday and countdown tools">
          <p>
            For a general days-left result, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . To calculate age on a date, use the{" "}
            <a className="ilt-content-link" href="/age-calculator">
              age calculator
            </a>
            . For named live countdowns, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . To add or subtract days and months, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . For January 1, use the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>
            . For December 25, use the{" "}
            <a className="ilt-content-link" href="/christmas-countdown">
              Christmas countdown
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Birthday countdown FAQ">
          {BIRTHDAY_COUNTDOWN_FAQ.map((item) => (
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

export function HoursUntilCalculatorPage({ initialNow }: { initialNow: string }) {
  return (
    <PageShell>
      <JsonLd
        name="Hours Until Calculator"
        path="/hours-until-calculator"
        description="Calculate hours until a target local date and time, with days, hours, minutes, total minutes, past states, presets, and copy."
        faqItems={HOURS_UNTIL_FAQ}
      />

      <ToolHero
        display={<HoursUntilTool initialNow={initialNow} />}
        title="Hours Until Calculator"
        description="Calculate how many hours remain until a target date and time, with clear past, future, and same-time states."
      />

      <SeoBand>
        <ContentSection title="How this hours until calculator works">
          <p>
            Choose a local start date/time and a local target date/time. The
            result shows total hours, plus a days, hours, and minutes breakdown
            for quick planning.
          </p>
          <p>
            If the target is before the start, the display changes to an
            hours-since state. That keeps past targets clear instead of showing
            a misleading zero.
          </p>
        </ContentSection>

        <ContentSection title="When hours remaining is useful">
          <p>
            Use it for appointments, work shift planning, deadline planning,
            travel reminders, event timing, and simple countdown math. It is a
            local date/time calculator and does not apply legal or official
            deadline rules.
          </p>
        </ContentSection>

        <ContentSection title="Related time and countdown tools">
          <p>
            For elapsed time between two clock times, use the{" "}
            <a className="ilt-content-link" href="/time-duration-calculator">
              time duration calculator
            </a>
            . For days until a target date, use the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>
            . For live named countdowns, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For broader time math, use the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>
            . To run an active countdown, use the{" "}
            <a className="ilt-content-link" href="/countdown-timer">
              countdown timer
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Hours until FAQ">
          {HOURS_UNTIL_FAQ.map((item) => (
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

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
  dateInputFromParts,
  dayNumberFromParts,
  daysInMonth,
  JsonLd,
  localDateObject,
  longDate,
  parseDateInput,
  partsFromDayNumber,
  plural,
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

function updateCopyState(setter: (value: string | null) => void, value: boolean) {
  setter(value ? "Copied" : "Copy failed");
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
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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
        <Toggle
          label="End time is next day"
          checked={overnight}
          onCheckedChange={setOvernight}
        />
      </SettingGroup>

      {result ? (
        <div className="grid gap-2 sm:grid-cols-3">
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
        </div>
      ) : null}

      <SecondaryActionRow>
        <Button variant="secondary" onClick={copyResult}>
          Copy result
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
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
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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

      {validResult ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      ) : null}

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
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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

      {result ? (
        <div className="grid gap-2 sm:grid-cols-3">
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
        </div>
      ) : null}

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
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
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
            onChange={(event) => setDateValue(event.currentTarget.value)}
            onBlur={(event) => setDateValue(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      {selectedDate ? (
        <div className="grid gap-2 sm:grid-cols-3">
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
        </div>
      ) : null}

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
      <ShortcutHint>
        Local calendar date lookup. It does not add holiday or official calendar rules.
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
            . For live elapsed timing, use the{" "}
            <a className="ilt-content-link" href="/stopwatch">
              stopwatch
            </a>
            . For dates between calendar days, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
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

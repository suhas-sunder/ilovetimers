import { useMemo, useRef, useState } from "react";
import {
  Button,
  ContentSection,
  Field,
  PageShell,
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
  dayNumberFromParts,
  JsonLd,
  longDate,
  parseDateInput,
  plural,
  ResultDetails,
  ResultDisplay,
  todayInputValue,
  type FaqItem,
  weekdayName,
} from "./DateCalculatorPages";

const MINUTES_PER_DAY = 1_440;

type TimeCardRow = {
  id: string;
  label: string;
  start: string;
  end: string;
  breakMinutes: number;
};

const WEEKS_BETWEEN_FAQ: FaqItem[] = [
  {
    question: "Does this show weeks and days or total days?",
    answer:
      "The main result shows full weeks plus remaining days. Total days are shown separately so the two views stay clear.",
  },
  {
    question: "Can I include both the start and end date?",
    answer:
      "Yes. Turn on inclusive count when you want both selected calendar dates included in the week and day result.",
  },
  {
    question: "Can I use this for official deadlines or medical timing?",
    answer:
      "No. It is a simple calendar planning calculator. Check official, legal, medical, contract, or deadline rules separately.",
  },
];

const TIME_CARD_FAQ: FaqItem[] = [
  {
    question: "How is this different from the work hours calculator?",
    answer:
      "The work hours calculator focuses on one shift. This time card calculator totals multiple clock-in and clock-out rows with breaks.",
  },
  {
    question: "Does it support overnight rows?",
    answer:
      "Yes. If the end time is earlier than the start time, the row is treated as ending on the next day and is labelled as overnight.",
  },
  {
    question: "Is this a payroll or tax calculator?",
    answer:
      "No. It is for personal checking, planning, and simple time totals. It does not apply payroll, overtime, tax, HR, or legal rules.",
  },
];

function weeksDaysText(totalDays: number) {
  const sign = totalDays < 0 ? "-" : "";
  const absoluteDays = Math.abs(totalDays);
  const weeks = Math.floor(absoluteDays / 7);
  const days = absoluteDays % 7;
  return `${sign}${plural(weeks, "week")}, ${plural(days, "day")}`;
}

function signedDaysText(value: number) {
  if (value === 0) return "0 days";
  return value < 0 ? `-${plural(Math.abs(value), "day")}` : plural(value, "day");
}

function weeksBetweenResult(
  startValue: string,
  endValue: string,
  inclusive: boolean,
) {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (!start || !end) return null;

  const elapsedDays = dayNumberFromParts(end) - dayNumberFromParts(start);
  const totalDays = inclusive
    ? elapsedDays >= 0
      ? elapsedDays + 1
      : -(Math.abs(elapsedDays) + 1)
    : elapsedDays;

  return {
    start,
    end,
    elapsedDays,
    totalDays,
    absoluteDays: Math.abs(totalDays),
    reversed: elapsedDays < 0,
  };
}

function WeeksBetweenDatesTool() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-15");
  const [inclusive, setInclusive] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => weeksBetweenResult(startDate, endDate, inclusive),
    [endDate, inclusive, startDate],
  );

  const displayValue = result ? weeksDaysText(result.totalDays) : "Invalid date";
  const context = result
    ? `${longDate(result.start)} to ${longDate(result.end)}`
    : "Enter valid start and end dates.";
  const status = result?.reversed
    ? "End date is before start date"
    : inclusive
      ? "Inclusive count"
      : "Elapsed calendar days";
  const copyText = result
    ? `Weeks between dates: ${displayValue} from ${startDate} to ${endDate}. Total days: ${result.totalDays}.`
    : "Weeks between dates: invalid date input.";

  async function copyResult() {
    const ok = await copyToClipboard(copyText);
    setCopyState(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyState(null), 1200);
  }

  function reset() {
    setStartDate("2026-01-01");
    setEndDate("2026-01-15");
    setInclusive(false);
  }

  function setBothToday() {
    const today = todayInputValue();
    setStartDate(today);
    setEndDate(today);
  }

  return (
    <ToolFrame className={DATE_CALCULATOR_FRAME_CLASS}>
      <ResultDisplay
        label="Weeks + days"
        value={displayValue}
        context={context}
        status={status}
      />

      <SettingGroup
        title="Date range"
        description="Elapsed mode counts from the start date up to the end date. Inclusive mode counts both selected dates."
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
        <SettingRow>
          <Toggle
            label="Inclusive count"
            checked={inclusive}
            onCheckedChange={setInclusive}
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
            <strong>{signedDaysText(result.totalDays)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Elapsed days</span>
            <strong>{signedDaysText(result.elapsedDays)}</strong>
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
        Uses local calendar dates. It does not apply official deadline or medical rules.
      </ShortcutHint>
    </ToolFrame>
  );
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

function formatDecimalHours(minutes: number) {
  const hours = minutes / 60;
  return Number.isInteger(hours)
    ? `${hours} ${Math.abs(hours) === 1 ? "hour" : "hours"}`
    : `${hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} hours`;
}

function timeCardRowResult(row: TimeCardRow) {
  const start = parseTimeInput(row.start);
  const end = parseTimeInput(row.end);
  if (start === null || end === null) return null;

  let grossMinutes = end - start;
  let overnight = false;
  if (grossMinutes < 0) {
    grossMinutes += MINUTES_PER_DAY;
    overnight = true;
  }

  const breakMinutes = clampInt(Number(row.breakMinutes || 0), 0, 1_440);
  const netMinutes = Math.max(0, grossMinutes - breakMinutes);
  const breakTooLong = breakMinutes > grossMinutes;

  return {
    grossMinutes,
    breakMinutes,
    netMinutes,
    overnight,
    breakTooLong,
  };
}

function TimeCardCalculatorTool() {
  const nextId = useRef(2);
  const [rows, setRows] = useState<TimeCardRow[]>([
    {
      id: "row-1",
      label: "Day 1",
      start: "09:00",
      end: "17:00",
      breakMinutes: 30,
    },
  ]);
  const [copyState, setCopyState] = useState<string | null>(null);

  const rowResults = useMemo(
    () =>
      rows.map((row) => ({
        row,
        result: timeCardRowResult(row),
      })),
    [rows],
  );
  const totalMinutes = rowResults.reduce(
    (sum, item) => sum + (item.result?.netMinutes ?? 0),
    0,
  );
  const invalidRows = rowResults.filter((item) => !item.result).length;
  const overnightRows = rowResults.filter((item) => item.result?.overnight).length;
  const longBreakRows = rowResults.filter((item) => item.result?.breakTooLong).length;
  const copyText = [
    `Time card total: ${formatDurationMinutes(totalMinutes)} (${formatDecimalHours(totalMinutes)}).`,
    ...rowResults.map((item) =>
      item.result
        ? `${item.row.label}: ${item.row.start} to ${item.row.end}, break ${item.result.breakMinutes} min, total ${formatDurationMinutes(item.result.netMinutes)}${item.result.overnight ? " overnight" : ""}.`
        : `${item.row.label}: invalid time input.`,
    ),
  ].join("\n");

  function updateRow<K extends keyof TimeCardRow>(
    id: string,
    key: K,
    value: TimeCardRow[K],
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  function addRow() {
    const idNumber = nextId.current;
    nextId.current += 1;
    setRows((current) => [
      ...current,
      {
        id: `row-${idNumber}`,
        label: `Day ${idNumber}`,
        start: "09:00",
        end: "17:00",
        breakMinutes: 30,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== id),
    );
  }

  function reset() {
    nextId.current = 2;
    setRows([
      {
        id: "row-1",
        label: "Day 1",
        start: "09:00",
        end: "17:00",
        breakMinutes: 30,
      },
    ]);
  }

  async function copyResult() {
    const ok = await copyToClipboard(copyText);
    setCopyState(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyState(null), 1200);
  }

  const status =
    invalidRows > 0
      ? `${invalidRows} row ${invalidRows === 1 ? "needs" : "need"} valid times`
      : longBreakRows > 0
        ? "Break exceeds one or more rows"
        : overnightRows > 0
          ? "Overnight rows included"
          : "Simple time-card total";

  return (
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <ResultDisplay
        label="Total time"
        value={formatDurationMinutes(totalMinutes)}
        context={`${formatDecimalHours(totalMinutes)} decimal time across ${plural(rows.length, "row")}`}
        status={status}
      />

      <SettingGroup
        title="Time card rows"
        description="Add clock-in and clock-out rows, subtract break minutes, and total the rows together."
      >
        <div className="grid gap-4">
          {rows.map((row, index) => (
            <SettingRow
              key={row.id}
              className="sm:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_minmax(0,9rem)_minmax(0,9rem)_auto]"
            >
              <Field
                label="Label"
                value={row.label}
                onInput={(event) => updateRow(row.id, "label", event.currentTarget.value)}
                onChange={(event) => updateRow(row.id, "label", event.currentTarget.value)}
                onBlur={(event) => updateRow(row.id, "label", event.currentTarget.value)}
              />
              <Field
                label="Start"
                type="time"
                value={row.start}
                onInput={(event) => updateRow(row.id, "start", event.currentTarget.value)}
                onChange={(event) => updateRow(row.id, "start", event.currentTarget.value)}
                onBlur={(event) => updateRow(row.id, "start", event.currentTarget.value)}
              />
              <Field
                label="End"
                type="time"
                value={row.end}
                onInput={(event) => updateRow(row.id, "end", event.currentTarget.value)}
                onChange={(event) => updateRow(row.id, "end", event.currentTarget.value)}
                onBlur={(event) => updateRow(row.id, "end", event.currentTarget.value)}
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
                    row.id,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
                onChange={(event) =>
                  updateRow(
                    row.id,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
                onBlur={(event) =>
                  updateRow(
                    row.id,
                    "breakMinutes",
                    clampInt(Number(event.currentTarget.value || 0), 0, 1_440),
                  )
                }
              />
              <Button
                className="self-end"
                variant="ghost"
                disabled={rows.length === 1}
                onClick={() => removeRow(row.id)}
              >
                Remove {index + 1}
              </Button>
            </SettingRow>
          ))}
        </div>
      </SettingGroup>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rowResults.map((item) => (
          <UtilityResultRow key={item.row.id}>
            <span>
              {item.row.label || "Untitled row"}
              {item.result?.overnight ? " (overnight)" : ""}
            </span>
            <strong>
              {item.result
                ? `${formatDurationMinutes(item.result.netMinutes)} / ${formatDecimalHours(item.result.netMinutes)}`
                : "Invalid"}
            </strong>
          </UtilityResultRow>
        ))}
      </div>

      <SecondaryActionRow>
        <Button variant="secondary" onClick={addRow}>
          Add row
        </Button>
        <Button variant="secondary" onClick={copyResult}>
          Copy summary
        </Button>
        <Button variant="secondary" onClick={reset}>
          Reset
        </Button>
      </SecondaryActionRow>

      <CopyState state={copyState} />
      <ShortcutHint>
        Overnight rows are handled as next-day end times. This is not a payroll, tax, HR, or legal calculator.
      </ShortcutHint>
    </ToolFrame>
  );
}

function FaqContent({
  title,
  items,
}: {
  title: string;
  items: FaqItem[];
}) {
  return (
    <ContentSection title={title}>
      {items.map((item) => (
        <div key={item.question}>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </ContentSection>
  );
}

export function WeeksBetweenDatesCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Weeks Between Dates Calculator"
        path="/weeks-between-dates-calculator"
        description="Calculate full weeks and remaining days between two local calendar dates with total-day context, inclusive count, copy, and reset."
        faqItems={WEEKS_BETWEEN_FAQ}
      />

      <ToolHero
        display={<WeeksBetweenDatesTool />}
        title="Weeks Between Dates Calculator"
        description="Calculate weeks and remaining days between two dates, check total days, switch inclusive counting, and copy the result."
      />

      <SeoBand>
        <ContentSection title="How this weeks between dates calculator works">
          <p>
            Enter a start date and an end date, and the calculator turns the
            elapsed calendar days into full weeks plus remaining days. Total
            days are shown separately for comparison.
          </p>
          <p>
            The default mode counts elapsed days from the start date up to the
            end date. If you turn on inclusive count, both selected dates are
            included in the weeks and days result.
          </p>
        </ContentSection>

        <ContentSection title="When weeks and days are useful">
          <p>
            Weeks plus days can be easier to scan than a raw day count for
            project planning, school terms, trip planning, personal schedules,
            and simple calendar examples.
          </p>
          <p>
            For a days-first result, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For completed calendar months, use the{" "}
            <a className="ilt-content-link" href="/months-between-dates-calculator">
              months between dates calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related date calculators">
          <p>
            Try the{" "}
            <a className="ilt-content-link" href="/days-until-calculator">
              days until calculator
            </a>{" "}
            for a target-date view, the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>{" "}
            for adding or subtracting dates, or the{" "}
            <a className="ilt-content-link" href="/weekday-calculator">
              weekday calculator
            </a>{" "}
            when you need the day of week for a date.
          </p>
        </ContentSection>

        <FaqContent
          title="Weeks between dates FAQ"
          items={WEEKS_BETWEEN_FAQ}
        />
      </SeoBand>
    </PageShell>
  );
}

export function TimeCardCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Time Card Calculator"
        path="/time-card-calculator"
        description="Add multiple clock-in and clock-out rows with break minutes to total simple time-card hours and decimal hours."
        faqItems={TIME_CARD_FAQ}
      />

      <ToolHero
        display={<TimeCardCalculatorTool />}
        title="Time Card Calculator"
        description="Total multiple clock-in and clock-out rows, subtract breaks, review per-row totals, and copy a simple time-card summary."
      />

      <SeoBand>
        <ContentSection title="How this time card calculator works">
          <p>
            Add one row for each work block, project block, or day. Each row has
            a label, start time, end time, and break minutes. The calculator
            totals net time across all rows and shows decimal hours for simple
            checking.
          </p>
          <p>
            If an end time is earlier than the start time, the row is treated as
            ending on the next day and labelled as overnight. Break minutes are
            subtracted from the row total.
          </p>
        </ContentSection>

        <ContentSection title="When a simple time card total helps">
          <p>
            A time card calculator is useful for personal time tracking,
            checking work blocks, project logs, weekly planning, and quickly
            adding several clock-in and clock-out rows.
          </p>
          <p>
            This page does not apply pay rates, overtime rules, tax rules, HR
            policies, or payroll rules. For a single shift, use the{" "}
            <a className="ilt-content-link" href="/work-hours-calculator">
              work hours calculator
            </a>
            . For one elapsed time span, use the{" "}
            <a className="ilt-content-link" href="/time-duration-calculator">
              time duration calculator
            </a>
            . For a fixed day-by-day week layout, use the{" "}
            <a className="ilt-content-link" href="/weekly-timesheet-calculator">
              weekly timesheet calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Related time calculators">
          <p>
            Use the{" "}
            <a className="ilt-content-link" href="/billable-hours-calculator">
              billable hours calculator
            </a>{" "}
            when rates and billable rounding matter, the{" "}
            <a className="ilt-content-link" href="/billable-hours-clock">
              billable hours clock
            </a>{" "}
            for live tracking, or the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>{" "}
            for add and subtract style time math.
          </p>
        </ContentSection>

        <FaqContent title="Time card calculator FAQ" items={TIME_CARD_FAQ} />
      </SeoBand>
    </PageShell>
  );
}

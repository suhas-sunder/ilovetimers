import { useMemo, useRef, useState } from "react";
import {
  Button,
  ContentSection,
  DisplayStage,
  Field,
  PageShell,
  PresetChip,
  PresetGroup,
  SecondaryActionRow,
  Select,
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

const SITE_URL = "https://www.ilovetimers.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const MS_PER_DAY = 86_400_000;
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
});
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
};

type FaqItem = {
  question: string;
  answer: string;
};

const DATE_DURATION_FAQ: FaqItem[] = [
  {
    question: "Does the calculator count elapsed days or inclusive days?",
    answer:
      "The main result is elapsed days from the start date to the end date. Inclusive days are shown separately and include both endpoints.",
  },
  {
    question: "Why use local calendar dates?",
    answer:
      "The calculator reads the selected calendar dates as local dates so date inputs do not shift because of UTC time zones.",
  },
  {
    question: "Can I use this for official deadlines?",
    answer:
      "No. It is a planning calculator. Check any legal, contract, payroll, HR, tax, or official deadline rules separately.",
  },
];

const DATE_CALCULATOR_FAQ: FaqItem[] = [
  {
    question: "How does month addition work at month end?",
    answer:
      "When the target month has fewer days, the result is clamped to the last valid day of that month.",
  },
  {
    question: "Can I subtract dates too?",
    answer:
      "Yes. Choose subtract, enter days, weeks, months, or years, and the result moves backward from the start date.",
  },
  {
    question: "Is this an official deadline calculator?",
    answer:
      "No. It is a browser utility for planning and checking dates, not an official legal, tax, HR, payroll, or contract system.",
  },
];

const BUSINESS_DAYS_FAQ: FaqItem[] = [
  {
    question: "Does this include holidays?",
    answer:
      "No. By default it excludes Saturdays and Sundays only. It does not apply country, regional, company, or custom holiday calendars.",
  },
  {
    question: "Are the start and end dates counted?",
    answer:
      "Yes by default. You can toggle the start and end date inclusion settings and the label updates with the selected rule.",
  },
  {
    question: "Can I use this for payroll or HR deadlines?",
    answer:
      "No. It is a simple planning estimate. Verify payroll, HR, legal, contract, tax, and compliance dates with the system or policy that applies.",
  },
];

export function createDateToolMeta({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords: string[];
}) {
  const routeUrl = `${SITE_URL}${path}`;

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    { name: "robots", content: "index,follow,max-image-preview:large" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: routeUrl },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    { name: "theme-color", content: "#ffffff" },
  ];
}

export function createDateToolLinks(path: string) {
  return [{ rel: "canonical", href: `${SITE_URL}${path}` }];
}

function parseDateInput(value: string): LocalDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) return null;
  return { year, month, day };
}

function dateInputFromParts(parts: LocalDateParts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function dayNumberFromParts(parts: LocalDateParts) {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY);
}

function partsFromDayNumber(dayNumber: number): LocalDateParts {
  const date = new Date(dayNumber * MS_PER_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function localDateObject(parts: LocalDateParts) {
  return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
}

function weekdayName(parts: LocalDateParts) {
  return WEEKDAY_FORMATTER.format(localDateObject(parts));
}

function longDate(parts: LocalDateParts) {
  return LONG_DATE_FORMATTER.format(localDateObject(parts));
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function todayInputValue() {
  const now = new Date();
  return dateInputFromParts({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function plural(value: number, singular: string, pluralLabel = `${singular}s`) {
  return `${value} ${Math.abs(value) === 1 ? singular : pluralLabel}`;
}

function signedDaysText(value: number) {
  if (value === 0) return "0 elapsed days";
  return value < 0
    ? `-${plural(Math.abs(value), "elapsed day")}`
    : plural(value, "elapsed day");
}

function ResultDisplay({
  label,
  value,
  context,
  status,
}: {
  label: string;
  value: string;
  context: string;
  status?: string;
}) {
  const displayRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const fitFontPx = useFitDisplayText({
    containerRef: displayRef,
    textRef,
    deps: [value, label, context],
    minPx: 28,
    maxPx: 420,
    paddingAllowancePx: 80,
    initialScale: 0.9,
  });

  return (
    <DisplayStage
      stageRef={displayRef}
      className="timer-display-surface mt-4 flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ minHeight: "clamp(320px, 38vw, 440px)", userSelect: "none" }}
      aria-live="polite"
    >
      <div className="timer-result-label text-[11px] font-extrabold uppercase tracking-widest text-[var(--ilt-text-secondary)]">
        {label}
      </div>
      <span
        ref={textRef}
        data-primary-display-value
        className="timer-result-value mt-3 inline-block whitespace-nowrap text-center font-mono font-extrabold"
        style={{ fontSize: fitFontPx, lineHeight: "1", transform: "translateZ(0)" }}
      >
        {value}
      </span>
      <div className="timer-result-context mt-4 text-center text-sm font-semibold text-[var(--ilt-text-secondary)] sm:text-base">
        {context}
      </div>
      {status ? (
        <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-[var(--ilt-text-muted)]">
          {status}
        </div>
      ) : null}
    </DisplayStage>
  );
}

function CopyState({ state }: { state: string | null }) {
  if (!state) return null;

  return (
    <div className="ilt-helper-text text-center font-semibold">
      <span className="ilt-inline-pill px-2 py-1">{state}</span>
    </div>
  );
}

function JsonLd({
  name,
  path,
  description,
  faqItems,
}: {
  name: string;
  path: string;
  description: string;
  faqItems: FaqItem[];
}) {
  const routeUrl = `${SITE_URL}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name,
        url: routeUrl,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        description,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name, item: routeUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function addMonthsClamped(parts: LocalDateParts, monthDelta: number) {
  const monthIndex = parts.year * 12 + (parts.month - 1) + monthDelta;
  const year = Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  const day = Math.min(parts.day, daysInMonth(year, month));
  return { year, month, day };
}

function addDateParts(
  start: LocalDateParts,
  amount: { years: number; months: number; weeks: number; days: number },
  direction: 1 | -1,
) {
  const monthTotal = direction * (amount.years * 12 + amount.months);
  const afterMonths = addMonthsClamped(start, monthTotal);
  const dayDelta = direction * (amount.weeks * 7 + amount.days);
  return partsFromDayNumber(dayNumberFromParts(afterMonths) + dayDelta);
}

function operationSummary(
  operation: "add" | "subtract",
  amount: { years: number; months: number; weeks: number; days: number },
) {
  const pieces = [
    amount.years ? plural(amount.years, "year") : "",
    amount.months ? plural(amount.months, "month") : "",
    amount.weeks ? plural(amount.weeks, "week") : "",
    amount.days ? plural(amount.days, "day") : "",
  ].filter(Boolean);

  return `${operation === "add" ? "Add" : "Subtract"} ${pieces.length ? pieces.join(", ") : "0 days"}`;
}

function dateDurationResult(startValue: string, endValue: string) {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (!start || !end) return null;
  const startDay = dayNumberFromParts(start);
  const endDay = dayNumberFromParts(end);
  const elapsedDays = endDay - startDay;
  const absoluteDays = Math.abs(elapsedDays);
  const weeks = Math.floor(absoluteDays / 7);
  const remainingDays = absoluteDays % 7;
  const inclusiveDays =
    elapsedDays >= 0 ? elapsedDays + 1 : -(absoluteDays + 1);
  const approximateMonths = absoluteDays / 30.4375;

  return {
    start,
    end,
    elapsedDays,
    absoluteDays,
    weeks,
    remainingDays,
    inclusiveDays,
    approximateMonths,
    reversed: elapsedDays < 0,
  };
}

function DateDurationTool() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-10");
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => dateDurationResult(startDate, endDate),
    [startDate, endDate],
  );

  const copyText = result
    ? `Date duration: ${result.elapsedDays} elapsed days from ${startDate} to ${endDate}. Inclusive count: ${result.inclusiveDays} days.`
    : "Date duration: invalid date input.";

  async function copyResult() {
    const ok = await copyToClipboard(copyText);
    setCopyState(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyState(null), 1200);
  }

  function reset() {
    setStartDate("2026-01-01");
    setEndDate("2026-01-10");
  }

  function setBothToday() {
    const today = todayInputValue();
    setStartDate(today);
    setEndDate(today);
  }

  const displayValue = result ? signedDaysText(result.elapsedDays) : "Invalid date";
  const context = result
    ? `${longDate(result.start)} to ${longDate(result.end)}`
    : "Enter valid start and end dates.";
  const status = result?.reversed ? "End date is before start date" : "Local calendar dates";

  return (
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <ResultDisplay
        label="Elapsed days"
        value={displayValue}
        context={context}
        status={status}
      />

      <SettingGroup
        title="Date range"
        description="Elapsed days are counted from the start date up to the end date. Inclusive days are shown separately."
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
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.currentTarget.value)}
            onBlur={(event) => setEndDate(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingGroup>

      {result ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <UtilityResultRow>
            <span>Weeks + days</span>
            <strong>
              {result.weeks}w {result.remainingDays}d
            </strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Inclusive count</span>
            <strong>{result.inclusiveDays} days</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Approx. months</span>
            <strong>{result.approximateMonths.toFixed(1)}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Weekdays</span>
            <strong>
              {weekdayName(result.start)} / {weekdayName(result.end)}
            </strong>
          </UtilityResultRow>
        </div>
      ) : null}

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
      <ShortcutHint>
        Uses local calendar dates. It does not apply official deadline rules.
      </ShortcutHint>
    </ToolFrame>
  );
}

function DateCalculatorTool() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [weeks, setWeeks] = useState(0);
  const [days, setDays] = useState(10);
  const [copyState, setCopyState] = useState<string | null>(null);
  const start = parseDateInput(startDate);
  const amount = {
    years: clampInt(years, 0, 999),
    months: clampInt(months, 0, 999),
    weeks: clampInt(weeks, 0, 9999),
    days: clampInt(days, 0, 99999),
  };
  const result = start
    ? addDateParts(start, amount, operation === "add" ? 1 : -1)
    : null;
  const resultInput = result ? dateInputFromParts(result) : "";
  const summary = operationSummary(operation, amount);
  const copyText = result
    ? `Date calculation: ${summary} from ${startDate} = ${resultInput} (${weekdayName(result)}).`
    : "Date calculation: invalid start date.";

  async function copyResult() {
    const ok = await copyToClipboard(copyText);
    setCopyState(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyState(null), 1200);
  }

  function reset() {
    setStartDate("2026-01-01");
    setOperation("add");
    setYears(0);
    setMonths(0);
    setWeeks(0);
    setDays(10);
  }

  function applyPreset(nextOperation: "add" | "subtract", next: Partial<typeof amount>) {
    setOperation(nextOperation);
    setYears(next.years ?? 0);
    setMonths(next.months ?? 0);
    setWeeks(next.weeks ?? 0);
    setDays(next.days ?? 0);
  }

  const amountFields = [
    ["Years", years, setYears, 999],
    ["Months", months, setMonths, 999],
    ["Weeks", weeks, setWeeks, 9999],
    ["Days", days, setDays, 99999],
  ] as const;

  return (
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <ResultDisplay
        label="Calculated date"
        value={result ? resultInput : "Invalid date"}
        context={result ? `${longDate(result)} / ${weekdayName(result)}` : "Enter a valid start date."}
        status={start ? `${summary} from ${longDate(start)}` : "Fix inputs"}
      />

      <SettingGroup
        title="Date calculation"
        description="Add or subtract days, weeks, months, and years from the start date."
      >
        <SettingRow className="sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
          <Field
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            onBlur={(event) => setStartDate(event.currentTarget.value)}
          />
          <Select
            label="Operation"
            value={operation}
            onChange={(event) => setOperation(event.currentTarget.value as "add" | "subtract")}
            onBlur={(event) => setOperation(event.currentTarget.value as "add" | "subtract")}
          >
            <option value="add">Add</option>
            <option value="subtract">Subtract</option>
          </Select>
        </SettingRow>
        <SettingRow className="sm:grid-cols-4">
          {amountFields.map(([label, value, setter, max]) => (
            <Field
              key={label}
              label={label}
              type="number"
              min={0}
              max={max}
              inputMode="numeric"
              value={value}
              onChange={(event) => setter(clampInt(Number(event.currentTarget.value || 0), 0, max))}
              onBlur={(event) => setter(clampInt(Number(event.currentTarget.value || 0), 0, max))}
            />
          ))}
        </SettingRow>
      </SettingGroup>

      <PresetGroup title="Presets">
        <PresetChip onClick={() => applyPreset("add", { days: 7 })}>+7 days</PresetChip>
        <PresetChip onClick={() => applyPreset("add", { days: 14 })}>+14 days</PresetChip>
        <PresetChip onClick={() => applyPreset("add", { days: 30 })}>+30 days</PresetChip>
        <PresetChip onClick={() => applyPreset("add", { days: 90 })}>+90 days</PresetChip>
        <PresetChip onClick={() => applyPreset("subtract", { days: 7 })}>-7 days</PresetChip>
      </PresetGroup>

      <div className="grid gap-2 sm:grid-cols-3">
        <UtilityResultRow>
          <span>Start date</span>
          <strong>{start ? longDate(start) : "Invalid"}</strong>
        </UtilityResultRow>
        <UtilityResultRow>
          <span>Operation</span>
          <strong>{summary}</strong>
        </UtilityResultRow>
        <UtilityResultRow>
          <span>Result weekday</span>
          <strong>{result ? weekdayName(result) : "Invalid"}</strong>
        </UtilityResultRow>
      </div>

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
        Month and year additions clamp invalid month-end dates to the last valid day.
      </ShortcutHint>
    </ToolFrame>
  );
}

function businessDayStats(
  startValue: string,
  endValue: string,
  includeStart: boolean,
  includeEnd: boolean,
) {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (!start || !end) return null;
  const startDay = dayNumberFromParts(start);
  const endDay = dayNumberFromParts(end);
  const minDay = Math.min(startDay, endDay);
  const maxDay = Math.max(startDay, endDay);
  const sign = startDay <= endDay ? 1 : -1;
  let businessDays = 0;
  let weekendDays = 0;
  let calendarDays = 0;

  for (let day = minDay; day <= maxDay; day += 1) {
    if (day === startDay && !includeStart) continue;
    if (day === endDay && !includeEnd) continue;
    calendarDays += 1;
    const parts = partsFromDayNumber(day);
    const weekday = localDateObject(parts).getDay();
    if (weekday === 0 || weekday === 6) weekendDays += 1;
    else businessDays += 1;
  }

  return {
    start,
    end,
    sign,
    businessDays: businessDays * sign,
    absoluteBusinessDays: businessDays,
    weekendDays,
    calendarDays,
    elapsedCalendarDays: endDay - startDay,
    reversed: sign < 0,
  };
}

function BusinessDaysTool() {
  const [startDate, setStartDate] = useState("2026-01-05");
  const [endDate, setEndDate] = useState("2026-01-09");
  const [includeStart, setIncludeStart] = useState(true);
  const [includeEnd, setIncludeEnd] = useState(true);
  const [copyState, setCopyState] = useState<string | null>(null);
  const result = useMemo(
    () => businessDayStats(startDate, endDate, includeStart, includeEnd),
    [startDate, endDate, includeStart, includeEnd],
  );
  const copyText = result
    ? `Business days: ${result.businessDays}. Calendar days counted: ${result.calendarDays}. Weekend days excluded: ${result.weekendDays}. Weekends only; no holiday calendar.`
    : "Business days: invalid date input.";

  async function copyResult() {
    const ok = await copyToClipboard(copyText);
    setCopyState(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyState(null), 1200);
  }

  function reset() {
    setStartDate("2026-01-05");
    setEndDate("2026-01-09");
    setIncludeStart(true);
    setIncludeEnd(true);
  }

  function setBothToday() {
    const today = todayInputValue();
    setStartDate(today);
    setEndDate(today);
  }

  const displayValue = result
    ? `${result.businessDays} business ${Math.abs(result.businessDays) === 1 ? "day" : "days"}`
    : "Invalid date";
  const includeLabel = `${includeStart ? "Includes" : "Excludes"} start / ${includeEnd ? "includes" : "excludes"} end`;

  return (
    <ToolFrame className="timer-result-stack px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
      <ResultDisplay
        label="Business days"
        value={displayValue}
        context={result ? `${longDate(result.start)} to ${longDate(result.end)}` : "Enter valid start and end dates."}
        status={result?.reversed ? "End date is before start date" : includeLabel}
      />

      <SettingGroup
        title="Date range and counting rule"
        description="Business days exclude Saturdays and Sundays by default. No holiday calendar is applied."
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
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.currentTarget.value)}
            onBlur={(event) => setEndDate(event.currentTarget.value)}
          />
        </SettingRow>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </SettingGroup>

      {result ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <UtilityResultRow>
            <span>Calendar days counted</span>
            <strong>{result.calendarDays}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Weekend days excluded</span>
            <strong>{result.weekendDays}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Elapsed calendar days</span>
            <strong>{result.elapsedCalendarDays}</strong>
          </UtilityResultRow>
          <UtilityResultRow>
            <span>Weekdays</span>
            <strong>
              {weekdayName(result.start)} / {weekdayName(result.end)}
            </strong>
          </UtilityResultRow>
        </div>
      ) : null}

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
      <ShortcutHint>
        Weekend-only estimate. Holidays and organization-specific calendars are not included.
      </ShortcutHint>
    </ToolFrame>
  );
}

export function DateDurationCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Date Duration Calculator"
        path="/date-duration-calculator"
        description="Calculate elapsed days, inclusive days, weeks and days, and weekday names between two local calendar dates."
        faqItems={DATE_DURATION_FAQ}
      />

      <ToolHero
        display={<DateDurationTool />}
        title="Date Duration Calculator"
        description="Calculate elapsed days between two calendar dates, with inclusive days, weeks plus days, and weekday names shown separately."
      />

      <SeoBand>
        <ContentSection title="How this date duration calculator works">
          <p>
            Choose a start date and an end date. The main result shows elapsed
            days from the start date to the end date, so January 1 to January
            10 is 9 elapsed days.
          </p>
          <p>
            Inclusive days are shown separately because they count both the
            start and end dates. That same January 1 to January 10 range is 10
            inclusive days.
          </p>
        </ContentSection>

        <ContentSection title="When to use days between dates">
          <p>
            Use it for planning trips, counting days until a project date,
            checking the time between events, classroom calendar examples, and
            personal planning. The calculator uses local calendar dates rather
            than UTC timestamps that can shift a date unexpectedly.
          </p>
        </ContentSection>

        <ContentSection title="Related date and time tools">
          <p>
            For a live countdown to a date, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For January 1, use the{" "}
            <a className="ilt-content-link" href="/new-year-countdown">
              New Year countdown
            </a>
            . For adding or subtracting dates, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . For weekdays only, use the{" "}
            <a className="ilt-content-link" href="/business-days-calculator">
              business days calculator
            </a>
            . For duration math with hours and minutes, use the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Date duration FAQ">
          {DATE_DURATION_FAQ.map((item) => (
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

export function DateCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Date Calculator"
        path="/date-calculator"
        description="Add or subtract days, weeks, months, and years from a local calendar date and show the calculated date and weekday."
        faqItems={DATE_CALCULATOR_FAQ}
      />

      <ToolHero
        display={<DateCalculatorTool />}
        title="Date Calculator"
        description="Add or subtract days, weeks, months, and years from a start date, with the calculated date and weekday shown first."
      />

      <SeoBand>
        <ContentSection title="How this date calculator works">
          <p>
            Pick a start date, choose add or subtract, and enter days, weeks,
            months, or years. The result date appears first, followed by the
            weekday and a short operation summary.
          </p>
          <p>
            Days and weeks are counted as calendar days. Months and years are
            applied as calendar units, then the remaining week and day amounts
            are applied.
          </p>
        </ContentSection>

        <ContentSection title="Month-end behavior">
          <p>
            Some month additions are ambiguous. For example, adding one month
            to January 31 points to a month that may not have 31 days. This
            calculator clamps that result to the last valid day of the target
            month and shows the final date clearly.
          </p>
        </ContentSection>

        <ContentSection title="Common uses and related calculators">
          <p>
            Use it for planning follow-ups, checking future dates, estimating
            project dates, reminders, and scheduling examples. For days between
            two dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For weekday-only ranges, use the{" "}
            <a className="ilt-content-link" href="/business-days-calculator">
              business days calculator
            </a>
            . For a live countdown to a date, use the{" "}
            <a className="ilt-content-link" href="/event-countdown">
              event countdown
            </a>
            . For hours and minutes, use the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Date calculator FAQ">
          {DATE_CALCULATOR_FAQ.map((item) => (
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

export function BusinessDaysCalculatorPage() {
  return (
    <PageShell>
      <JsonLd
        name="Business Days Calculator"
        path="/business-days-calculator"
        description="Calculate business days or workdays between two dates, excluding Saturdays and Sundays by default."
        faqItems={BUSINESS_DAYS_FAQ}
      />

      <ToolHero
        display={<BusinessDaysTool />}
        title="Business Days Calculator"
        description="Calculate business days or workdays between two dates, excluding Saturdays and Sundays by default and showing the calendar-day breakdown."
      />

      <SeoBand>
        <ContentSection title="How this business days calculator works">
          <p>
            Choose a start and end date. The main result counts weekdays in the
            selected range while excluding Saturdays and Sundays. Start and end
            dates are included by default, and the toggles let you change that
            counting rule.
          </p>
          <p>
            Calendar days and weekend days are shown separately so you can see
            what was counted and what was excluded.
          </p>
        </ContentSection>

        <ContentSection title="Weekend exclusion and limits">
          <p>
            This calculator does not apply holiday calendars. It is useful for
            simple project timelines, counting workdays until a date, checking
            weekday ranges, and scheduling estimates, but it is not a payroll,
            HR, legal, tax, contract, or compliance tool.
          </p>
        </ContentSection>

        <ContentSection title="Related date and time calculators">
          <p>
            For all calendar days between dates, use the{" "}
            <a className="ilt-content-link" href="/date-duration-calculator">
              date duration calculator
            </a>
            . For adding or subtracting dates, use the{" "}
            <a className="ilt-content-link" href="/date-calculator">
              date calculator
            </a>
            . For shift-style time math, use the{" "}
            <a className="ilt-content-link" href="/work-hours-calculator">
              work hours calculator
            </a>
            . For hours and minutes, use the{" "}
            <a className="ilt-content-link" href="/time-calculator">
              time calculator
            </a>
            .
          </p>
        </ContentSection>

        <ContentSection title="Business days calculator FAQ">
          {BUSINESS_DAYS_FAQ.map((item) => (
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

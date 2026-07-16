const MS_PER_DAY = 86_400_000;
const MINUTES_PER_DAY = 1_440;

/** @typedef {{ year: number, month: number, day: number }} CalendarDate */
/** @typedef {{ years: number, months: number, weeks: number, days: number }} DateAdjustment */
/** @typedef {{ start: string, end: string, breakMinutes?: number }} TimeEntry */
/** @typedef {{ ok: false, error: string, grossMinutes: 0, breakMinutes: 0, netMinutes: 0, overnight: false }} InvalidShift */
/** @typedef {{ ok: true, error: "", grossMinutes: number, breakMinutes: number, netMinutes: number, overnight: boolean }} ValidShift */
/** @typedef {InvalidShift | ValidShift} ShiftResult */
/** @typedef {InvalidShift | (ValidShift & { billableMinutesRaw: number, billableMinutes: number, roundingMinutes: number, rate: number, subtotal: number })} BillableResult */

/** @param {number} year @param {number} month */
export function daysInCalendarMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** @param {string} value @returns {CalendarDate | null} */
export function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInCalendarMonth(year, month)) return null;
  return { year, month, day };
}

/** @param {CalendarDate} parts */
export function formatCalendarDate(parts) {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

/** @param {CalendarDate} parts */
export function calendarDayNumber(parts) {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY);
}

/** @param {number} dayNumber @returns {CalendarDate} */
export function calendarDateFromDayNumber(dayNumber) {
  const date = new Date(dayNumber * MS_PER_DAY);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/** @param {CalendarDate} parts @param {number} monthDelta @returns {CalendarDate} */
export function addCalendarMonthsClamped(parts, monthDelta) {
  const monthIndex = parts.year * 12 + parts.month - 1 + Math.trunc(monthDelta);
  const year = Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  return {
    year,
    month,
    day: Math.min(parts.day, daysInCalendarMonth(year, month)),
  };
}

/**
 * Calendar years/months are applied first with end-of-month clamping. Weeks
 * and days are then applied as calendar-day offsets.
 * @param {CalendarDate} start
 * @param {DateAdjustment} amount
 * @param {1 | -1} direction
 */
export function adjustCalendarDate(start, amount, direction = 1) {
  const monthDelta = direction * (Math.trunc(amount.years) * 12 + Math.trunc(amount.months));
  const afterMonths = addCalendarMonthsClamped(start, monthDelta);
  const dayDelta = direction * (Math.trunc(amount.weeks) * 7 + Math.trunc(amount.days));
  return calendarDateFromDayNumber(calendarDayNumber(afterMonths) + dayDelta);
}

/** @param {string} startValue @param {string} endValue */
export function calendarDateDifference(startValue, endValue) {
  const start = parseCalendarDate(startValue);
  const end = parseCalendarDate(endValue);
  if (!start || !end) return null;
  const elapsedDays = calendarDayNumber(end) - calendarDayNumber(start);
  const absoluteDays = Math.abs(elapsedDays);
  return {
    start,
    end,
    elapsedDays,
    absoluteDays,
    inclusiveDays: elapsedDays >= 0 ? elapsedDays + 1 : -(absoluteDays + 1),
    wholeWeeks: Math.floor(absoluteDays / 7),
    remainingDays: absoluteDays % 7,
    decimalWeeks: elapsedDays / 7,
    reversed: elapsedDays < 0,
  };
}

/** @param {string} startValue @param {string} endValue @param {boolean} inclusive */
export function weeksBetweenDates(startValue, endValue, inclusive = false) {
  const difference = calendarDateDifference(startValue, endValue);
  if (!difference) return null;
  const totalDays = inclusive ? difference.inclusiveDays : difference.elapsedDays;
  const absoluteDays = Math.abs(totalDays);
  return {
    ...difference,
    totalDays,
    absoluteDays,
    wholeWeeks: Math.floor(absoluteDays / 7),
    remainingDays: absoluteDays % 7,
    decimalWeeks: totalDays / 7,
  };
}

/** @param {string} startValue @param {string} endValue */
export function calendarMonthsBetweenDates(startValue, endValue) {
  const start = parseCalendarDate(startValue);
  const end = parseCalendarDate(endValue);
  if (!start || !end) return null;
  const startDay = calendarDayNumber(start);
  const endDay = calendarDayNumber(end);
  const reversed = endDay < startDay;
  const from = reversed ? end : start;
  const to = reversed ? start : end;
  const toDay = calendarDayNumber(to);
  let fullMonths = (to.year - from.year) * 12 + to.month - from.month;
  let anchor = addCalendarMonthsClamped(from, fullMonths);
  if (calendarDayNumber(anchor) > toDay) {
    fullMonths -= 1;
    anchor = addCalendarMonthsClamped(from, fullMonths);
  }
  return {
    start,
    end,
    reversed,
    direction: reversed ? -1 : 1,
    fullMonths,
    remainingDays: toDay - calendarDayNumber(anchor),
    totalDays: Math.abs(endDay - startDay),
    anchor,
  };
}

/** @param {string} birthValue @param {string} asOfValue */
export function ageBetweenDates(birthValue, asOfValue) {
  const birth = parseCalendarDate(birthValue);
  const asOf = parseCalendarDate(asOfValue);
  if (!birth || !asOf) return null;
  const birthDay = calendarDayNumber(birth);
  const asOfDay = calendarDayNumber(asOf);
  if (birthDay > asOfDay) return { birth, asOf, future: true };

  let years = asOf.year - birth.year;
  if (calendarDayNumber(addCalendarMonthsClamped(birth, years * 12)) > asOfDay) years -= 1;
  const afterYears = addCalendarMonthsClamped(birth, years * 12);
  let months = (asOf.year - afterYears.year) * 12 + asOf.month - afterYears.month;
  if (calendarDayNumber(addCalendarMonthsClamped(afterYears, months)) > asOfDay) months -= 1;
  const anchor = addCalendarMonthsClamped(afterYears, months);

  return {
    birth,
    asOf,
    future: false,
    years,
    months,
    days: asOfDay - calendarDayNumber(anchor),
    totalDays: asOfDay - birthDay,
    completedMonths: years * 12 + months,
  };
}

/** @param {string} value */
export function isoWeekForDate(value) {
  const parts = parseCalendarDate(value);
  if (!parts) return null;
  const dayNumber = calendarDayNumber(parts);
  const jsDay = new Date(dayNumber * MS_PER_DAY).getUTCDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const thursday = calendarDateFromDayNumber(dayNumber + 4 - isoDay);
  const weekYear = thursday.year;
  const jan4 = { year: weekYear, month: 1, day: 4 };
  const jan4Day = calendarDayNumber(jan4);
  const jan4JsDay = new Date(jan4Day * MS_PER_DAY).getUTCDay();
  const jan4IsoDay = jan4JsDay === 0 ? 7 : jan4JsDay;
  const weekOneMonday = jan4Day - (jan4IsoDay - 1);
  return {
    parts,
    weekNumber: Math.floor((dayNumber - weekOneMonday) / 7) + 1,
    weekYear,
    isoDay,
    weekStart: calendarDateFromDayNumber(dayNumber - (isoDay - 1)),
    weekEnd: calendarDateFromDayNumber(dayNumber + (7 - isoDay)),
  };
}

/** @param {string} value */
export function weekdayForDate(value) {
  const parts = parseCalendarDate(value);
  if (!parts) return null;
  return new Date(calendarDayNumber(parts) * MS_PER_DAY).getUTCDay();
}

/** @param {string} value */
export function parseClockTime(value) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((value || "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return hours * 3_600 + minutes * 60 + seconds;
}

/** @param {string} startValue @param {string} endValue @param {boolean} overnight */
export function durationBetweenClockTimes(startValue, endValue, overnight = false) {
  const startSeconds = parseClockTime(startValue);
  const endSeconds = parseClockTime(endValue);
  if (startSeconds === null || endSeconds === null) return null;
  let totalSeconds = endSeconds - startSeconds;
  if (overnight && totalSeconds <= 0) totalSeconds += MINUTES_PER_DAY * 60;
  return {
    totalSeconds,
    totalMinutes: totalSeconds / 60,
    overnight: overnight && endSeconds <= startSeconds,
  };
}

/** @param {number} startSeconds @param {number} durationSeconds */
export function addDurationToClock(startSeconds, durationSeconds) {
  const total = startSeconds + durationSeconds;
  const dayOffset = Math.floor(total / (MINUTES_PER_DAY * 60));
  const secondsSinceMidnight = ((total % (MINUTES_PER_DAY * 60)) + MINUTES_PER_DAY * 60) % (MINUTES_PER_DAY * 60);
  return { secondsSinceMidnight, dayOffset };
}

/** @param {number | null} startMinutes @param {number | null} endMinutes @param {number} breakMinutes @returns {ShiftResult} */
export function calculateShift(startMinutes, endMinutes, breakMinutes = 0) {
  /** @param {string} error @returns {InvalidShift} */
  const invalid = (error) => ({
    ok: false,
    error,
    grossMinutes: 0,
    breakMinutes: 0,
    netMinutes: 0,
    overnight: false,
  });
  if (startMinutes === null) return invalid("Enter a start time.");
  if (endMinutes === null) return invalid("Enter an end time.");
  const overnight = endMinutes < startMinutes;
  const grossMinutes = overnight ? endMinutes + MINUTES_PER_DAY - startMinutes : endMinutes - startMinutes;
  if (grossMinutes <= 0) return invalid("The end time must be after the start time.");
  const normalizedBreak = Math.max(0, Math.min(MINUTES_PER_DAY, Math.floor(Number(breakMinutes) || 0)));
  if (normalizedBreak > grossMinutes) return invalid("A break cannot exceed the shift duration.");
  return {
    ok: true,
    error: "",
    grossMinutes,
    breakMinutes: normalizedBreak,
    netMinutes: grossMinutes - normalizedBreak,
    overnight,
  };
}

/** @param {TimeEntry[]} entries */
export function calculateTimeEntries(entries) {
  const rows = entries.map((entry) => {
    const startSeconds = parseClockTime(entry.start);
    const endSeconds = parseClockTime(entry.end);
    return calculateShift(
      startSeconds === null ? null : startSeconds / 60,
      endSeconds === null ? null : endSeconds / 60,
      entry.breakMinutes || 0,
    );
  });
  return {
    rows,
    totalMinutes: rows.reduce((total, row) => total + (row.ok ? row.netMinutes : 0), 0),
    invalidRows: rows.filter((row) => !row.ok).length,
  };
}

/**
 * @param {string} startValue
 * @param {string} endValue
 * @param {Set<number>} selectedWeekdays Sunday=0 through Saturday=6
 * @param {boolean} includeStart
 * @param {boolean} includeEnd
 */
export function countSelectedWeekdays(startValue, endValue, selectedWeekdays, includeStart = true, includeEnd = true) {
  const start = parseCalendarDate(startValue);
  const end = parseCalendarDate(endValue);
  if (!start || !end) return null;
  const startDay = calendarDayNumber(start);
  const endDay = calendarDayNumber(end);
  const low = Math.min(startDay, endDay);
  const high = Math.max(startDay, endDay);
  let includedDays = 0;
  let selectedDays = 0;
  for (let day = low; day <= high; day += 1) {
    if (day === startDay && !includeStart) continue;
    if (day === endDay && !includeEnd) continue;
    includedDays += 1;
    if (selectedWeekdays.has(new Date(day * MS_PER_DAY).getUTCDay())) selectedDays += 1;
  }
  const direction = endDay < startDay ? -1 : 1;
  return {
    start,
    end,
    direction,
    reversed: direction < 0,
    selectedDays: selectedDays * direction,
    absoluteSelectedDays: selectedDays,
    includedDays,
    excludedDays: includedDays - selectedDays,
    elapsedDays: endDay - startDay,
  };
}

/** @param {string} startValue @param {string} endValue @param {boolean} includeStart @param {boolean} includeEnd */
export function countBusinessDays(startValue, endValue, includeStart = true, includeEnd = true) {
  return countSelectedWeekdays(startValue, endValue, new Set([1, 2, 3, 4, 5]), includeStart, includeEnd);
}

/** @param {string} value */
export function parseLocalDateTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const dateParts = parseCalendarDate(`${match[1]}-${match[2]}-${match[3]}`);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  if (!dateParts || hours > 23 || minutes > 59) return null;
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day, hours, minutes, 0, 0);
  if (
    date.getFullYear() !== dateParts.year ||
    date.getMonth() !== dateParts.month - 1 ||
    date.getDate() !== dateParts.day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) return null;
  return { date, dateParts, hours, minutes };
}

/** @param {string} startValue @param {string} targetValue */
export function hoursBetweenLocalDateTimes(startValue, targetValue) {
  const start = parseLocalDateTime(startValue);
  const target = parseLocalDateTime(targetValue);
  if (!start || !target) return null;
  const totalMinutes = Math.round((target.date.getTime() - start.date.getTime()) / 60_000);
  return {
    start,
    target,
    totalMinutes,
    decimalHours: totalMinutes / 60,
    state: totalMinutes > 0 ? "future" : totalMinutes < 0 ? "past" : "same",
  };
}

/** @param {number | null} startMinutes @param {number | null} endMinutes @param {number} breakMinutes @param {number} rate @param {number} roundingMinutes @returns {BillableResult} */
export function calculateBillable(startMinutes, endMinutes, breakMinutes, rate, roundingMinutes) {
  const shift = calculateShift(startMinutes, endMinutes, breakMinutes);
  if (!shift.ok) return shift;
  const safeRate = Math.max(0, Math.min(1_000_000, Number.isFinite(rate) ? rate : 0));
  const increment = Math.max(0, Math.min(60, Math.floor(Number(roundingMinutes) || 0)));
  const billableMinutes = increment > 0
    ? Math.ceil(shift.netMinutes / increment) * increment
    : shift.netMinutes;
  return {
    ...shift,
    billableMinutesRaw: shift.netMinutes,
    billableMinutes,
    roundingMinutes: increment,
    rate: safeRate,
    subtotal: (billableMinutes / 60) * safeRate,
  };
}

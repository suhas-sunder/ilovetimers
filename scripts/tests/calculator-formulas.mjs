import assert from "node:assert/strict";
import {
  addDurationToClock,
  adjustCalendarDate,
  ageBetweenDates,
  calculateBillable,
  calculateShift,
  calculateTimeEntries,
  calendarDateDifference,
  calendarMonthsBetweenDates,
  countBusinessDays,
  countSelectedWeekdays,
  durationBetweenClockTimes,
  formatCalendarDate,
  hoursBetweenLocalDateTimes,
  isoWeekForDate,
  parseCalendarDate,
  parseClockTime,
  weekdayForDate,
  weeksBetweenDates,
} from "../../app/clients/lib/calculatorMath.js";

process.env.TZ = "America/Toronto";

function dateAdjustment(value, amount, direction = 1) {
  const start = parseCalendarDate(value);
  assert.ok(start);
  return formatCalendarDate(adjustCalendarDate(start, amount, direction));
}

const zeroAdjustment = { years: 0, months: 0, weeks: 0, days: 0 };
assert.equal(dateAdjustment("2026-01-15", { ...zeroAdjustment, days: 10 }), "2026-01-25");
assert.equal(dateAdjustment("2026-01-15", { ...zeroAdjustment, days: 10 }, -1), "2026-01-05");
assert.equal(dateAdjustment("2025-01-31", { ...zeroAdjustment, months: 1 }), "2025-02-28");
assert.equal(dateAdjustment("2024-01-31", { ...zeroAdjustment, months: 1 }), "2024-02-29");
assert.equal(dateAdjustment("2024-02-29", { ...zeroAdjustment, years: 1 }), "2025-02-28");
assert.equal(dateAdjustment("2026-01-01", zeroAdjustment), "2026-01-01");
assert.equal(parseCalendarDate("2025-02-29"), null);

for (const [days, weeks, remainder] of [
  [0, 0, 0], [1, 0, 1], [6, 0, 6], [7, 1, 0], [8, 1, 1],
  [13, 1, 6], [14, 2, 0], [30, 4, 2],
]) {
  const result = weeksBetweenDates("2026-01-01", `2026-01-${String(days + 1).padStart(2, "0")}`);
  assert.ok(result);
  assert.equal(result.totalDays, days);
  assert.equal(result.wholeWeeks, weeks);
  assert.equal(result.remainingDays, remainder);
  assert.equal(result.decimalWeeks, days / 7);
}
assert.equal(weeksBetweenDates("2026-01-15", "2026-01-01")?.totalDays, -14);
assert.equal(weeksBetweenDates("2024-02-28", "2024-03-01")?.totalDays, 2);
assert.equal(weeksBetweenDates("2026-01-01", "2026-01-07", true)?.totalDays, 7);

const duration = calendarDateDifference("2024-02-28", "2024-03-01");
assert.ok(duration);
assert.equal(duration.elapsedDays, 2);
assert.equal(duration.inclusiveDays, 3);
assert.equal(calendarDateDifference("2026-01-01", "2026-01-01")?.elapsedDays, 0);
assert.equal(calendarDateDifference("2026-01-02", "2026-01-01")?.elapsedDays, -1);

for (const [start, end, months, days] of [
  ["2026-01-01", "2026-01-01", 0, 0],
  ["2026-01-15", "2026-02-15", 1, 0],
  ["2025-01-31", "2025-02-28", 1, 0],
  ["2024-01-31", "2024-02-29", 1, 0],
  ["2025-02-28", "2025-03-31", 1, 3],
  ["2026-01-01", "2026-12-01", 11, 0],
  ["2025-03-31", "2026-03-31", 12, 0],
]) {
  const result = calendarMonthsBetweenDates(start, end);
  assert.ok(result);
  assert.equal(result.fullMonths, months);
  assert.equal(result.remainingDays, days);
}
assert.equal(calendarMonthsBetweenDates("2025-03-31", "2025-02-28")?.reversed, true);

assert.equal(calendarDateDifference("2026-07-14", "2026-07-14")?.elapsedDays, 0);
assert.equal(calendarDateDifference("2026-07-14", "2027-01-01")?.elapsedDays, 171);

assert.deepEqual(
  { week: isoWeekForDate("2021-01-01")?.weekNumber, year: isoWeekForDate("2021-01-01")?.weekYear },
  { week: 53, year: 2020 },
);
assert.deepEqual(
  { week: isoWeekForDate("2021-01-04")?.weekNumber, year: isoWeekForDate("2021-01-04")?.weekYear },
  { week: 1, year: 2021 },
);
assert.deepEqual(
  { week: isoWeekForDate("2020-12-31")?.weekNumber, year: isoWeekForDate("2020-12-31")?.weekYear },
  { week: 53, year: 2020 },
);
assert.equal(weekdayForDate("2026-07-14"), 2);
assert.equal(weekdayForDate("2000-01-01"), 6);

assert.deepEqual(
  (({ years, months, days }) => ({ years, months, days }))(ageBetweenDates("2000-02-29", "2021-02-28")),
  { years: 21, months: 0, days: 0 },
);
assert.deepEqual(
  (({ years, months, days }) => ({ years, months, days }))(ageBetweenDates("2000-02-29", "2020-02-29")),
  { years: 20, months: 0, days: 0 },
);
assert.deepEqual(
  (({ years, months, days }) => ({ years, months, days }))(ageBetweenDates("2000-07-15", "2026-07-14")),
  { years: 25, months: 11, days: 29 },
);
assert.equal(ageBetweenDates("2027-01-01", "2026-01-01")?.future, true);
assert.deepEqual(
  (({ years, months, days }) => ({ years, months, days }))(ageBetweenDates("2026-01-01", "2026-01-01")),
  { years: 0, months: 0, days: 0 },
);

assert.equal(parseClockTime("00:00"), 0);
assert.equal(parseClockTime("12:00"), 43_200);
assert.equal(parseClockTime("24:00"), null);
assert.equal(durationBetweenClockTimes("09:15", "10:00")?.totalMinutes, 45);
assert.equal(durationBetweenClockTimes("22:00", "06:00", true)?.totalMinutes, 480);
assert.equal(durationBetweenClockTimes("09:00", "09:00", true)?.totalMinutes, 1_440);
assert.equal(durationBetweenClockTimes("09:00", "09:00", false)?.totalMinutes, 0);
assert.deepEqual(addDurationToClock(23 * 3_600, 2 * 3_600), { secondsSinceMidnight: 3_600, dayOffset: 1 });
assert.deepEqual(addDurationToClock(3_600, -2 * 3_600), { secondsSinceMidnight: 82_800, dayOffset: -1 });

const spring = hoursBetweenLocalDateTimes("2026-03-08T00:00", "2026-03-09T00:00");
const fall = hoursBetweenLocalDateTimes("2026-11-01T00:00", "2026-11-02T00:00");
assert.equal(spring?.totalMinutes, 23 * 60);
assert.equal(fall?.totalMinutes, 25 * 60);
assert.equal(hoursBetweenLocalDateTimes("2026-03-08T02:30", "2026-03-08T04:00"), null);
assert.equal(hoursBetweenLocalDateTimes("2026-07-14T12:00", "2026-07-14T12:00")?.state, "same");

const business = countBusinessDays("2026-01-05", "2026-01-09", true, true);
assert.ok(business);
assert.equal(business.selectedDays, 5);
assert.equal(countBusinessDays("2026-01-05", "2026-01-09", false, false)?.selectedDays, 3);
assert.equal(countBusinessDays("2026-01-09", "2026-01-05", true, true)?.selectedDays, -5);
assert.equal(countSelectedWeekdays("2026-01-05", "2026-01-11", new Set([1, 2, 3, 4]))?.selectedDays, 4);

const standardShift = calculateShift(9 * 60, 17 * 60, 30);
assert.equal(standardShift.ok && standardShift.netMinutes, 450);
assert.equal(standardShift.ok && standardShift.netMinutes / 60, 7.5);
assert.equal(calculateShift(22 * 60, 6 * 60, 0).ok && calculateShift(22 * 60, 6 * 60, 0).netMinutes, 480);
assert.equal(calculateShift(9 * 60, 10 * 60, 90).ok, false);
assert.equal(calculateShift(null, 10 * 60, 0).ok, false);
assert.equal(calculateShift(9 * 60, 9 * 60, 0).ok, false);

const entries = calculateTimeEntries([
  { start: "09:00", end: "12:00", breakMinutes: 0 },
  { start: "13:00", end: "17:30", breakMinutes: 30 },
]);
assert.equal(entries.totalMinutes, 420);
assert.equal(entries.invalidRows, 0);
assert.equal(calculateTimeEntries([{ start: "09:00", end: "", breakMinutes: 0 }]).invalidRows, 1);
const overlappingEntries = calculateTimeEntries([
  { start: "09:00", end: "10:00", breakMinutes: 0 },
  { start: "09:30", end: "10:30", breakMinutes: 0 },
]);
assert.equal(overlappingEntries.totalMinutes, 120);
assert.equal(overlappingEntries.invalidRows, 0);
assert.equal(calculateTimeEntries([
  { start: "09:00", end: "17:00", breakMinutes: 30 },
  { start: "09:00", end: "17:00", breakMinutes: 30 },
  { start: "09:00", end: "17:00", breakMinutes: 30 },
  { start: "09:00", end: "17:00", breakMinutes: 30 },
  { start: "09:00", end: "17:00", breakMinutes: 30 },
]).totalMinutes, 2_250);

const roundedBillable = calculateBillable(9 * 60, 10 * 60 + 1, 0, 120, 15);
assert.equal(roundedBillable.ok && roundedBillable.billableMinutes, 75);
assert.equal(roundedBillable.ok && roundedBillable.subtotal, 150);
const exactBillable = calculateBillable(9 * 60, 10 * 60 + 1, 0, 120, 0);
assert.equal(exactBillable.ok && exactBillable.billableMinutes, 61);
assert.equal(exactBillable.ok && exactBillable.subtotal, 122);

console.log("Calculator formula tests passed (date, time, workday, shift, timesheet, and billable policies).");

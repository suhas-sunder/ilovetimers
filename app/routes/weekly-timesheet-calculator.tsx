import type { Route } from "./+types/weekly-timesheet-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WeeklyTimesheetCalculatorPage } from "~/clients/components/date-calculators/CountdownWorkdayUtilityPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Weekly Timesheet Calculator | Daily and Weekly Hours",
    description:
      "Calculate weekly hours from fixed daily start, end, and break rows with per-day totals, decimal hours, copy, and reset.",
    path: "/weekly-timesheet-calculator",
  });
}

export function links() {
  return createDateToolLinks("/weekly-timesheet-calculator");
}

export default function WeeklyTimesheetCalculatorRoute() {
  return <WeeklyTimesheetCalculatorPage />;
}

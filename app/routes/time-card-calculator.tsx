import type { Route } from "./+types/time-card-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { TimeCardCalculatorPage } from "~/clients/components/date-calculators/DateTimeUtilityExtras";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Time Card Calculator",
    description:
      "Add multiple clock-in and clock-out rows with break minutes to total time-card hours, decimal hours, and per-row totals.",
    path: "/time-card-calculator",
    keywords: [
      "time card calculator",
      "time clock calculator",
      "time card hours calculator",
      "clock in clock out calculator",
      "timesheet hours calculator",
    ],
  });
}

export function links() {
  return createDateToolLinks("/time-card-calculator");
}

export default function TimeCardCalculatorRoute() {
  return <TimeCardCalculatorPage />;
}

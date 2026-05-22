import type { Route } from "./+types/months-between-dates-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { MonthsBetweenDatesCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Months Between Dates Calculator",
    description:
      "Calculate full months and remaining days between two dates with total days, approximate months, and weekday context.",
    path: "/months-between-dates-calculator",
    keywords: [
      "months between dates calculator",
      "calculate months between dates",
      "months and days between dates",
      "full months between dates",
      "date months calculator",
    ],
  });
}

export function links() {
  return createDateToolLinks("/months-between-dates-calculator");
}

export default function MonthsBetweenDatesCalculatorRoute() {
  return <MonthsBetweenDatesCalculatorPage />;
}

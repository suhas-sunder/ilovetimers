import type { Route } from "./+types/months-between-dates-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { MonthsBetweenDatesCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Months Between Dates Calculator | Calendar Months and Days",
    description:
      "Calculate completed calendar months and remaining days between two dates using real month lengths and month-end clamping.",
    path: "/months-between-dates-calculator",
  });
}

export function links() {
  return createDateToolLinks("/months-between-dates-calculator");
}

export default function MonthsBetweenDatesCalculatorRoute() {
  return <MonthsBetweenDatesCalculatorPage />;
}

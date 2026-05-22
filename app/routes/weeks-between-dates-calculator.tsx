import type { Route } from "./+types/weeks-between-dates-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WeeksBetweenDatesCalculatorPage } from "~/clients/components/date-calculators/DateTimeUtilityExtras";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Weeks Between Dates Calculator",
    description:
      "Calculate full weeks and remaining days between two dates with total days, inclusive count, copy, and reset.",
    path: "/weeks-between-dates-calculator",
    keywords: [
      "weeks between dates calculator",
      "calculate weeks between two dates",
      "weeks and days between dates",
      "weeks between dates",
      "date weeks calculator",
    ],
  });
}

export function links() {
  return createDateToolLinks("/weeks-between-dates-calculator");
}

export default function WeeksBetweenDatesCalculatorRoute() {
  return <WeeksBetweenDatesCalculatorPage />;
}

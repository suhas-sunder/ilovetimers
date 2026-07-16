import type { Route } from "./+types/weeks-between-dates-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WeeksBetweenDatesCalculatorPage } from "~/clients/components/date-calculators/DateTimeUtilityExtras";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Weeks Between Dates Calculator | Weeks and Days",
    description:
      "Calculate the weeks between two dates, including total days, whole weeks, remaining days, and decimal-week results.",
    path: "/weeks-between-dates-calculator",
  });
}

export function links() {
  return createDateToolLinks("/weeks-between-dates-calculator");
}

export default function WeeksBetweenDatesCalculatorRoute() {
  return <WeeksBetweenDatesCalculatorPage />;
}

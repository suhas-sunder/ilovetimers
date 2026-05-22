import type { Route } from "./+types/business-days-calculator";
import {
  BusinessDaysCalculatorPage,
  createDateToolLinks,
  createDateToolMeta,
} from "~/clients/components/date-calculators/DateCalculatorPages";

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Business Days Calculator (Workdays Between Dates)",
    description:
      "Calculate business days or workdays between two dates, excluding Saturdays and Sundays by default with calendar-day and weekend-day breakdowns.",
    path: "/business-days-calculator",
    keywords: [
      "business days calculator",
      "workdays calculator",
      "calculate workdays",
      "weekdays between dates",
      "business days between dates",
    ],
  });
}

export function links() {
  return createDateToolLinks("/business-days-calculator");
}

export default function BusinessDaysCalculatorRoute() {
  return <BusinessDaysCalculatorPage />;
}

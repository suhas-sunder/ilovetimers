import { useLoaderData } from "react-router";
import type { Route } from "./+types/week-number-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  todayInputValue,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WeekNumberCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { today: todayInputValue() };
}

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Week Number Calculator (ISO Week of Year)",
    description:
      "Find the ISO week number, ISO week-year, weekday, and Monday-to-Sunday week range for a selected date.",
    path: "/week-number-calculator",
    keywords: [
      "week number calculator",
      "what week number is this",
      "ISO week calculator",
      "week of year calculator",
      "week number for date",
    ],
  });
}

export function links() {
  return createDateToolLinks("/week-number-calculator");
}

export default function WeekNumberCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <WeekNumberCalculatorPage initialToday={today} />;
}

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

export function clientLoader() {
  return { today: todayInputValue() };
}

clientLoader.hydrate = true as const;

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "ISO Week Number Calculator | Week of Year",
    description:
      "Find the ISO week number, ISO week-year, weekday, and Monday-to-Sunday week range for a selected date.",
    path: "/week-number-calculator",
  });
}

export function links() {
  return createDateToolLinks("/week-number-calculator");
}

export default function WeekNumberCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <WeekNumberCalculatorPage initialToday={today} />;
}

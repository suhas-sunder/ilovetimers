import { useLoaderData } from "react-router";
import type { Route } from "./+types/weekday-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  todayInputValue,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { WeekdayCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { today: todayInputValue() };
}

export function clientLoader() {
  return { today: todayInputValue() };
}

clientLoader.hydrate = true as const;

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Weekday Calculator | Find the Day of the Week",
    description:
      "Find the day of the week for a selected date with formatted date, ISO date, weekday or weekend status, today shortcut, and copy.",
    path: "/weekday-calculator",
  });
}

export function links() {
  return createDateToolLinks("/weekday-calculator");
}

export default function WeekdayCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <WeekdayCalculatorPage initialToday={today} />;
}

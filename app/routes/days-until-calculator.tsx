import { useLoaderData } from "react-router";
import type { Route } from "./+types/days-until-calculator";
import {
  createDateToolLinks,
  createDateToolMeta,
  todayInputValue,
} from "~/clients/components/date-calculators/DateCalculatorPages";
import { DaysUntilCalculatorPage } from "~/clients/components/date-calculators/MoreDateTimeCalculatorPages";

export function loader() {
  return { today: todayInputValue() };
}

export function clientLoader() {
  return { today: todayInputValue() };
}

clientLoader.hydrate = true as const;

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Days Until Calculator | Count Days to a Date",
    description:
      "Count elapsed calendar days from today or another start date to a target date, with clear future, today, and past-date results.",
    path: "/days-until-calculator",
  });
}

export function links() {
  return createDateToolLinks("/days-until-calculator");
}

export default function DaysUntilCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <DaysUntilCalculatorPage initialToday={today} />;
}

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

export function meta({}: Route.MetaArgs) {
  return createDateToolMeta({
    title: "Days Until Calculator (Days Until Date)",
    description:
      "Calculate how many days remain until a target date from today or another start date, with weeks plus days, target weekday, presets, and copy.",
    path: "/days-until-calculator",
    keywords: [
      "days until calculator",
      "days until date",
      "how many days until",
      "days remaining",
      "days until target date",
    ],
  });
}

export function links() {
  return createDateToolLinks("/days-until-calculator");
}

export default function DaysUntilCalculatorRoute() {
  const { today } = useLoaderData<typeof loader>();
  return <DaysUntilCalculatorPage initialToday={today} />;
}

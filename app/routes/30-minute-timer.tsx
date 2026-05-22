import type { Route } from "./+types/30-minute-timer";
import {
  createPresetTimerMeta,
  PresetDurationTimerPage,
  presetDurationTimerConfigs,
} from "~/clients/components/preset-duration-timer/PresetDurationTimerPage";

const config = presetDurationTimerConfigs.thirtyMinute;

export function meta({}: Route.MetaArgs) {
  return createPresetTimerMeta(config);
}

export default function ThirtyMinuteTimerRoute() {
  return <PresetDurationTimerPage config={config} />;
}

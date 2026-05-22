import type { Route } from "./+types/15-minute-timer";
import {
  createPresetTimerMeta,
  PresetDurationTimerPage,
  presetDurationTimerConfigs,
} from "~/clients/components/preset-duration-timer/PresetDurationTimerPage";

const config = presetDurationTimerConfigs.fifteenMinute;

export function meta({}: Route.MetaArgs) {
  return createPresetTimerMeta(config);
}

export default function FifteenMinuteTimerRoute() {
  return <PresetDurationTimerPage config={config} />;
}

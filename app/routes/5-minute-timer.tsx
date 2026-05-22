import type { Route } from "./+types/5-minute-timer";
import {
  createPresetTimerMeta,
  PresetDurationTimerPage,
  presetDurationTimerConfigs,
} from "~/clients/components/preset-duration-timer/PresetDurationTimerPage";

const config = presetDurationTimerConfigs.fiveMinute;

export function meta({}: Route.MetaArgs) {
  return createPresetTimerMeta(config);
}

export default function FiveMinuteTimerRoute() {
  return <PresetDurationTimerPage config={config} />;
}

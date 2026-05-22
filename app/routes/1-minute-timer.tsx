import type { Route } from "./+types/1-minute-timer";
import {
  createPresetTimerMeta,
  PresetDurationTimerPage,
  presetDurationTimerConfigs,
} from "~/clients/components/preset-duration-timer/PresetDurationTimerPage";

const config = presetDurationTimerConfigs.oneMinute;

export function meta({}: Route.MetaArgs) {
  return createPresetTimerMeta(config);
}

export default function OneMinuteTimerRoute() {
  return <PresetDurationTimerPage config={config} />;
}

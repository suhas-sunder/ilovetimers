import type { Route } from "./+types/10-minute-timer";
import {
  createPresetTimerMeta,
  PresetDurationTimerPage,
  presetDurationTimerConfigs,
} from "~/clients/components/preset-duration-timer/PresetDurationTimerPage";

const config = presetDurationTimerConfigs.tenMinute;

export function meta({}: Route.MetaArgs) {
  return createPresetTimerMeta(config);
}

export default function TenMinuteTimerRoute() {
  return <PresetDurationTimerPage config={config} />;
}

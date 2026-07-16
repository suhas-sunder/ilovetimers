/**
 * Resolve the next local occurrence of a 24-hour `HH:mm` alarm value.
 * Returns null for malformed or out-of-range input instead of silently
 * substituting the current time.
 *
 * @param {Date} now
 * @param {string} alarmTime
 * @returns {Date | null}
 */
export function nextAlarmOccurrence(now, alarmTime) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) return null;
  const match = /^(\d{2}):(\d{2})$/.exec(alarmTime);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target;
}

/**
 * Calculate a tap-tempo estimate from recent monotonic tap timestamps.
 * Invalid gaps are excluded and at least two valid intervals (three taps)
 * are required before a BPM is returned.
 *
 * @param {number[]} tapTimes
 * @param {{ minIntervalMs?: number, maxIntervalMs?: number }} [options]
 */
export function calculateTapTempo(tapTimes, options = {}) {
  const minIntervalMs = options.minIntervalMs ?? 120;
  const maxIntervalMs = options.maxIntervalMs ?? 2000;
  const intervals = [];

  for (let index = 1; index < tapTimes.length; index += 1) {
    const interval = tapTimes[index] - tapTimes[index - 1];
    if (
      Number.isFinite(interval) &&
      interval >= minIntervalMs &&
      interval <= maxIntervalMs
    ) {
      intervals.push(interval);
    }
  }

  if (intervals.length < 2) return { intervals, bpm: null, stability: null };

  const sorted = [...intervals].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  const bpm = Math.max(1, Math.min(999, Math.round(60000 / median)));

  let stability = null;
  if (intervals.length >= 3) {
    const mean = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (intervals.length - 1);
    const standardDeviation = Math.sqrt(variance);
    stability =
      standardDeviation < 18
        ? "Very steady"
        : standardDeviation < 35
          ? "Steady"
          : standardDeviation < 60
            ? "A bit wobbly"
            : "Wobbly";
  }

  return { intervals, bpm, stability };
}

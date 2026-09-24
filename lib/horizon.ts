const DAY = 86_400_000;
/** First day of tracking (first review entry, 2026-09-08). */
export const OBSERVATION_START = '2026-09-08';

/** Calendar date (YYYY-MM-DD) in Korea for a given instant. */
export function seoulDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
function dayNumber(isoDate: string): number {
  return Math.round(Date.parse(`${isoDate}T00:00:00Z`) / DAY);
}

export type Horizon = { daysLeft: number; totalDays: number; elapsedDays: number; ended: boolean };

/**
 * Observation window measured in Korean calendar days.
 * daysLeft counts days after today up to and including the horizon date (D-day style: D-0 on the last day).
 */
export function horizonProgress(start: string, horizon: string, now: Date): Horizon {
  const today = dayNumber(seoulDate(now));
  const first = dayNumber(start);
  const last = dayNumber(horizon);
  const totalDays = Math.max(1, last - first);
  const elapsedDays = Math.min(totalDays, Math.max(0, today - first));
  const daysLeft = last - today;
  return { daysLeft: Math.max(0, daysLeft), totalDays, elapsedDays, ended: daysLeft < 0 };
}

/** Next stock id for keyboard movement through the ledger; clamps at the ends. */
export function neighborId(ids: string[], current: string, key: string): string | null {
  if (!ids.length) return null;
  const index = ids.indexOf(current);
  if (key === 'Home') return ids[0];
  if (key === 'End') return ids[ids.length - 1];
  if (key === 'ArrowDown') return ids[Math.min(ids.length - 1, index + 1)];
  if (key === 'ArrowUp') return ids[Math.max(0, index < 0 ? 0 : index - 1)];
  return null;
}

/** A requested ?stock= id is honored only when it names one of the ten tracked stocks. */
export function resolveStockId(requested: unknown, ids: string[]): string {
  return typeof requested === 'string' && ids.includes(requested) ? requested : ids[0];
}

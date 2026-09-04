import { toDayKey } from "./date";

/**
 * Consecutive days ending today (or yesterday) that appear in `days`.
 * O(streak length), not O(history).
 */
export function computeStreak(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  while (days.has(toDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Bump the first numeric run in a string ("80 kg" + 2.5 -> "82.5 kg"). */
export function bumpNumeric(value: string, delta: number): string {
  const match = String(value ?? "").match(/[\d.]+/);
  if (!match) return value;
  const next = Math.max(0, parseFloat(match[0]) + delta);
  return value.replace(match[0], String(next));
}

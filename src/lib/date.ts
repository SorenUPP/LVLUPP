// Date + duration formatting shared across screens.

/** Local-free ISO day key, e.g. "2026-09-03". */
export function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Seconds -> "m:ss" (rest timer). */
export function formatClock(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/** First integer in a string like "52 min" -> 52. */
export function parseMinutes(value: string): number {
  const m = String(value ?? "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/** Total minutes -> "1h 4m" / "45m". */
export function formatDuration(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

export function formatLogDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function monthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

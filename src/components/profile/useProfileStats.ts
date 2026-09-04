import { useMemo } from "react";
import { computeStreak } from "../../lib/stats";
import { useWorkoutLogs } from "../../lib/queries";

export interface ProfileStats {
  total: number;
  streak: number;
  thisWeek: number;
  calories: number;
}

export function useProfileStats(): ProfileStats {
  const { logs } = useWorkoutLogs();

  return useMemo(() => {
    const days = new Set(logs.map((l) => l.completed_at));
    const weekAgo = Date.now() - 7 * 86400000;
    let thisWeek = 0;
    let calories = 0;
    for (const l of logs) {
      calories += l.calories ?? 0;
      if (new Date(l.completed_at).getTime() >= weekAgo) thisWeek += 1;
    }
    return { total: logs.length, streak: computeStreak(days), thisWeek, calories };
  }, [logs]);
}

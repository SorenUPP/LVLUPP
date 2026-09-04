import { useMemo } from "react";
import { parseMinutes, toDayKey } from "../../lib/date";
import { computeStreak } from "../../lib/stats";
import { usePersonalBests, useWorkoutLogs } from "../../lib/queries";

const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

export function useProgressStats() {
  const { logs, loading: logsLoading } = useWorkoutLogs();
  const { personalBests, loading: pbLoading } = usePersonalBests();

  const stats = useMemo(() => {
    const done = new Set(logs.map((l) => l.completed_at));
    const today0 = new Date(toDayKey(new Date())).getTime();

    const weekCounts = new Array(8).fill(0);
    let thisWeek = 0;
    let totalMinutes = 0;
    let totalCalories = 0;

    for (const l of logs) {
      totalMinutes += parseMinutes(l.duration);
      totalCalories += l.calories ?? 0;
      const t = new Date(l.completed_at).getTime();
      if (Number.isNaN(t)) continue;
      const wk = Math.floor((today0 - t) / MS_WEEK);
      if (wk >= 0 && wk < 8) weekCounts[wk] += 1;
      if (wk === 0) thisWeek += 1;
    }

    return {
      total: logs.length,
      streak: computeStreak(done),
      thisWeek,
      totalMinutes,
      totalCalories,
      chart: weekCounts.reverse(),
    };
  }, [logs]);

  return { logs, personalBests, stats, loading: logsLoading || pbLoading };
}

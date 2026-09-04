import { useMemo } from "react";
import { toDayKey } from "../../lib/date";
import { computeStreak } from "../../lib/stats";
import { useCustomWorkouts } from "../../lib/customWorkouts";
import { resolveDay, todayWeekday, useRoutine } from "../../lib/routine";
import { usePersonalBests, useWorkoutLogs, type Workout } from "../../lib/queries";

/** Derives the dashboard's numbers + today's routine entry. */
export function useDashboardData(workouts: Workout[]) {
  const { logs, refetch: refetchLogs } = useWorkoutLogs();
  const { personalBests } = usePersonalBests();
  const { customWorkouts } = useCustomWorkouts();
  const { byWeekday, setDay } = useRoutine();

  const today = resolveDay(byWeekday.get(todayWeekday()), workouts, customWorkouts);
  const todaysWorkout = today.state === "workout" ? today.workout : null;

  const stats = useMemo(() => {
    const done = new Set(logs.map((l) => l.completed_at));
    const now = new Date();
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return { day: "SMTWTFS"[d.getDay()], done: done.has(toDayKey(d)) };
    });
    return {
      streak: computeStreak(done),
      totalWorkouts: logs.length,
      totalCalories: logs.reduce((sum, l) => sum + (l.calories ?? 0), 0),
      week,
    };
  }, [logs]);

  return {
    todaysWorkout,
    todayState: today.state,
    byWeekday,
    setDay,
    customWorkouts,
    personalBests,
    refetchLogs,
    ...stats,
  };
}

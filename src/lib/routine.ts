import { useCallback, useMemo } from "react";
import { useUserId } from "./auth";
import { customToWorkout, type CustomWorkout } from "./customWorkouts";
import { useCachedList, type Workout } from "./queries";
import { supabase } from "./supabase";

/** Display order Mon…Sun, values are JS getDay() (0 = Sunday). */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
export const WEEKDAY_LABEL: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function todayWeekday(): number {
  return new Date().getDay();
}

export interface RoutineDay {
  weekday: number;
  workoutId: number | null;
  customWorkoutId: number | null;
}

interface RoutineRow {
  weekday: number;
  workout_id: number | null;
  custom_workout_id: number | null;
}

export function useRoutine() {
  const userId = useUserId();
  const { data, loading, refetch } = useCachedList<RoutineDay>("routine_days", async () => {
    const { data, error } = await supabase
      .from("routine_days")
      .select("weekday,workout_id,custom_workout_id");
    if (error) throw error;
    return (data ?? []).map((r: RoutineRow) => ({
      weekday: r.weekday,
      workoutId: r.workout_id,
      customWorkoutId: r.custom_workout_id,
    }));
  });

  const byWeekday = useMemo(
    () => new Map<number, RoutineDay>(data.map((d) => [d.weekday, d])),
    [data]
  );

  const setDay = useCallback(
    async (
      weekday: number,
      target: { workoutId?: number | null; customWorkoutId?: number | null }
    ) => {
      const { error } = await supabase.from("routine_days").upsert(
        {
          user_id: userId,
          weekday,
          workout_id: target.workoutId ?? null,
          custom_workout_id: target.customWorkoutId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,weekday" }
      );
      if (error) throw error;
      await refetch();
    },
    [userId, refetch]
  );

  return { byWeekday, loading, refetch, setDay };
}

export type DayResolution =
  { state: "unset" } | { state: "rest" } | { state: "workout"; workout: Workout };

/** Turn a weekday's routine entry into something the dashboard can render. */
export function resolveDay(
  entry: RoutineDay | undefined,
  workouts: Workout[],
  customWorkouts: CustomWorkout[]
): DayResolution {
  if (!entry) return { state: "unset" };
  if (entry.workoutId != null) {
    const w = workouts.find((x) => x.id === entry.workoutId);
    return w ? { state: "workout", workout: w } : { state: "unset" };
  }
  if (entry.customWorkoutId != null) {
    const c = customWorkouts.find((x) => x.id === entry.customWorkoutId);
    return c ? { state: "workout", workout: customToWorkout(c) } : { state: "unset" };
  }
  return { state: "rest" };
}

/** Short label for a routine slot, for the weekly overview list. */
export function dayLabel(
  entry: RoutineDay | undefined,
  workouts: Workout[],
  customWorkouts: CustomWorkout[]
): string {
  const r = resolveDay(entry, workouts, customWorkouts);
  if (r.state === "unset") return "Not set";
  if (r.state === "rest") return "Rest day";
  return r.workout.name;
}

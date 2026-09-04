import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

// ---- Row shapes ---------------------------------------------------------

export interface ExerciseSet {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  muscle: string;
}

export interface Workout {
  id: number;
  name: string;
  duration: string;
  exercises: number;
  calories: number;
  category: string;
  tag: string;
  image: string;
  difficulty: string;
  equipment: string;
  description: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: number;
  workout_name: string;
  duration: string;
  calories: number;
  completed_at: string;
}

export interface PersonalBest {
  id: string;
  lift: string;
  value: string;
}

export interface WorkoutSession {
  id: number;
  workout_id: number;
  workout_name: string;
  duration: string;
  calories: number;
  status: string | null;
  session_date: string;
}

export interface SessionSet {
  id: number;
  session_id: number;
  exercise_name: string;
  exercise_index: number;
  set_number: number;
  target_reps: string;
  weight: string;
  completed: boolean;
}

// ---- Tiny cache-and-revalidate -----------------------------------------
// Screens unmount when their tab is inactive; this keeps a tab switch from
// showing a spinner for data we already loaded a moment ago. Cleared on
// sign-out so the next account starts blank.

const cache = new Map<string, unknown>();

export function clearQueryCache() {
  cache.clear();
}

export function useCachedList<T>(
  key: string,
  loader: () => Promise<T[]>
): { data: T[]; loading: boolean; refetch: () => Promise<void> } {
  const [data, setData] = useState<T[]>((cache.get(key) as T[]) ?? []);
  const [loading, setLoading] = useState(!cache.has(key));

  const load = useCallback(async () => {
    try {
      const rows = await loader();
      cache.set(key, rows);
      setData(rows);
    } catch (e) {
      console.log(`${key}:`, e);
    } finally {
      setLoading(false);
    }
    // loader is a stable per-call-site closure; key identifies the query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refetch: load };
}

// ---- Queries ----------------------------------------------------------

export function useWorkouts() {
  const { data, loading } = useCachedList<Workout>("workouts", async () => {
    const { data, error } = await supabase.from("workouts").select("*");
    if (error) throw error;
    return data ?? [];
  });
  return { workouts: data, loading };
}

export function useWorkoutLogs() {
  const { data, loading, refetch } = useCachedList<WorkoutLog>("workout_logs", async () => {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("id,workout_name,duration,calories,completed_at")
      .order("completed_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
  return { logs: data, loading, refetch };
}

/** First numeric run of a weight string, normalised to kg for comparison. */
function parseWeightKg(raw: string): number | null {
  const m = String(raw ?? "").match(/([\d.]+)\s*(kg|lb|lbs)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  return /lb/i.test(m[2] ?? "") ? n / 2.20462 : n;
}

/** Personal bests derived from the heaviest completed set per exercise. */
export function usePersonalBests() {
  const { data, loading } = useCachedList<PersonalBest>("personal_bests", async () => {
    const { data, error } = await supabase
      .from("workout_session_sets")
      .select("exercise_name,weight")
      .eq("completed", true);
    if (error) throw error;

    const best = new Map<string, { kg: number; label: string }>();
    for (const row of data ?? []) {
      const kg = parseWeightKg(row.weight);
      if (kg == null) continue;
      const cur = best.get(row.exercise_name);
      if (!cur || kg > cur.kg) best.set(row.exercise_name, { kg, label: row.weight });
    }
    return [...best.entries()]
      .sort((a, b) => b[1].kg - a[1].kg)
      .map(([lift, v]) => ({ id: lift, lift, value: v.label }));
  });
  return { personalBests: data, loading };
}

import { useUserId } from "./auth";
import { useCachedList, type Workout } from "./queries";
import { supabase } from "./supabase";

export interface CustomExercise {
  name: string;
  muscle: string | null;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  source_workout_id: number | null;
}

export interface CustomWorkout {
  id: number;
  name: string;
  image: string | null;
  exercises: CustomExercise[];
}

interface CustomWorkoutRow {
  id: number;
  name: string;
  image: string | null;
  custom_workout_exercises: (CustomExercise & { id: number; position: number })[];
}

/** Custom days are surfaced with a negated id so they never collide with a
 *  positive template id in the merged Train list. */
export const isCustomWorkoutId = (id: number) => id < 0;
export const realCustomId = (displayId: number) => -displayId;

/** Wallpaper pool — one is chosen at random when a custom day is created so
 *  it doesn't render as the blank placeholder. */
export const CUSTOM_WALLPAPERS = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop&auto=format",
];

export function randomWallpaper(): string {
  return CUSTOM_WALLPAPERS[Math.floor(Math.random() * CUSTOM_WALLPAPERS.length)];
}

/** Rough estimates so custom-day cards aren't full of zeros. Derived, not fake. */
function estimate(exercises: CustomExercise[]) {
  const totalSets = exercises.reduce((n, e) => n + (e.sets || 0), 0);
  const minutes = Math.max(10, totalSets * 3);
  return { minutes, calories: minutes * 6 };
}

/** Adapt a custom day into the shared Workout shape so it reuses the same UI. */
export function customToWorkout(c: CustomWorkout): Workout & { custom: true } {
  const { minutes, calories } = estimate(c.exercises);
  return {
    id: -c.id,
    name: c.name,
    duration: `~${minutes} min`,
    exercises: c.exercises.length,
    calories,
    category: "Custom",
    tag: "",
    image: c.image ?? "",
    difficulty: "",
    equipment: "",
    description: "Your custom training day.",
    sets: c.exercises.map((e) => ({
      name: e.name,
      muscle: e.muscle ?? "",
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      rest: e.rest,
    })),
    custom: true,
  };
}

export function useCustomWorkouts() {
  const { data, loading, refetch } = useCachedList<CustomWorkout>("custom_workouts", async () => {
    const { data, error } = await supabase
      .from("custom_workouts")
      .select(
        "id,name,image,custom_workout_exercises(id,position,name,muscle,sets,reps,weight,rest,source_workout_id)"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: CustomWorkoutRow) => ({
      id: row.id,
      name: row.name,
      image: row.image,
      exercises: [...(row.custom_workout_exercises ?? [])]
        .sort((a, b) => a.position - b.position)
        .map(({ id: _id, position: _position, ...ex }) => ex),
    }));
  });
  return { customWorkouts: data, loading, refetch };
}

export function useCreateCustomWorkout() {
  const userId = useUserId();
  return async (name: string, exercises: CustomExercise[]) => {
    const { data: created, error } = await supabase
      .from("custom_workouts")
      .insert({ user_id: userId, name, image: randomWallpaper() })
      .select("id")
      .single();
    if (error || !created) throw error ?? new Error("create failed");

    const rows = exercises.map((e, i) => ({
      custom_workout_id: created.id,
      position: i,
      name: e.name,
      muscle: e.muscle,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      rest: e.rest,
      source_workout_id: e.source_workout_id,
    }));
    const { error: exErr } = await supabase.from("custom_workout_exercises").insert(rows);
    if (exErr) throw exErr;
    return created.id as number;
  };
}

export async function deleteCustomWorkout(id: number) {
  const { error } = await supabase.from("custom_workouts").delete().eq("id", id);
  if (error) throw error;
}

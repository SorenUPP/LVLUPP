import type { Workout } from "../../lib/queries";

export const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#5b8c5a",
  Intermediate: "#c8a96e",
  Advanced: "#b5544a",
};

export function workoutMuscles(w: Pick<Workout, "sets">): string[] {
  const seen = new Set<string>();
  for (const s of w?.sets ?? []) if (s?.muscle) seen.add(s.muscle);
  return [...seen];
}

export function exerciseCount(w: Partial<Workout>): number {
  if (typeof w?.exercises === "number") return w.exercises;
  return w?.sets?.length ?? 0;
}

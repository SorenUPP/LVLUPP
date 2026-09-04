import { useEffect, useMemo, useState } from "react";
import { useUserId } from "../../lib/auth";
import { isCustomWorkoutId, realCustomId } from "../../lib/customWorkouts";
import { toDayKey } from "../../lib/date";
import { supabase } from "../../lib/supabase";
import { bumpNumeric } from "../../lib/stats";
import type { SessionSet, Workout, WorkoutSession } from "../../lib/queries";

const byOrder = (a: SessionSet, b: SessionSet) =>
  a.exercise_index - b.exercise_index || a.set_number - b.set_number;

/**
 * Owns the in-progress session for `todaysWorkout`: loads today's session if
 * one exists, and exposes the set-level mutations. All list work is memoised so
 * a re-render doesn't re-sort/re-group on every keystroke.
 */
export function useWorkoutSession(todaysWorkout: Workout | null, onCompleted: () => void) {
  const userId = useUserId();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sets, setSets] = useState<SessionSet[]>([]);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const displayId = todaysWorkout?.id ?? null;
  const isCustom = displayId !== null && isCustomWorkoutId(displayId);
  const targetId = displayId === null ? null : isCustom ? realCustomId(displayId) : displayId;

  useEffect(() => {
    if (targetId === null) return;
    let active = true;
    (async () => {
      const { data: found } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq(isCustom ? "custom_workout_id" : "workout_id", targetId)
        .eq("session_date", toDayKey(new Date()))
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active || !found) return;
      setSession(found);
      const { data: rows } = await supabase
        .from("workout_session_sets")
        .select("*")
        .eq("session_id", found.id)
        .order("exercise_index")
        .order("set_number");
      if (active) setSets(rows ?? []);
    })();
    return () => {
      active = false;
    };
  }, [targetId, isCustom]);

  const ordered = useMemo(() => [...sets].sort(byOrder), [sets]);
  const byExercise = useMemo(() => {
    const map = new Map<string, SessionSet[]>();
    for (const s of ordered) {
      const list = map.get(s.exercise_name) ?? [];
      list.push(s);
      map.set(s.exercise_name, list);
    }
    return map;
  }, [ordered]);

  const nextSet = ordered.find((s) => !s.completed) ?? null;
  const completedCount = useMemo(() => sets.reduce((n, s) => n + (s.completed ? 1 : 0), 0), [sets]);
  const isCompleted = session?.status === "completed";

  const patchSet = (id: number, patch: Partial<SessionSet>) =>
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const start = async () => {
    if (!todaysWorkout) return;
    setStarting(true);
    const { data: created, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        workout_id: isCustom ? null : targetId,
        custom_workout_id: isCustom ? targetId : null,
        workout_name: todaysWorkout.name,
        duration: todaysWorkout.duration,
        calories: todaysWorkout.calories,
      })
      .select()
      .single();
    if (error || !created) {
      console.log("start session:", error);
      setStarting(false);
      return;
    }
    const rows = (todaysWorkout.sets ?? []).flatMap((ex, exIndex) =>
      Array.from({ length: ex.sets }).map((_, si) => ({
        session_id: created.id,
        exercise_name: ex.name,
        exercise_index: exIndex,
        set_number: si + 1,
        target_reps: ex.reps,
        weight: ex.weight,
        completed: false,
      }))
    );
    const { data: inserted } = await supabase.from("workout_session_sets").insert(rows).select();
    setSession(created);
    setSets(inserted ?? []);
    setStarting(false);
  };

  /** Returns the set's new completed state, or undefined if the tap was a no-op. */
  const toggleSet = async (set: SessionSet): Promise<boolean | undefined> => {
    const exSets = (byExercise.get(set.exercise_name) ?? [])
      .slice()
      .sort((a, b) => a.set_number - b.set_number);
    const firstIncomplete = exSets.find((s) => !s.completed);
    const lastCompleted = [...exSets].reverse().find((s) => s.completed);
    if (!set.completed && set.id !== firstIncomplete?.id) return;
    if (set.completed && set.id !== lastCompleted?.id) return;

    const completed = !set.completed;
    patchSet(set.id, { completed });
    await supabase.from("workout_session_sets").update({ completed }).eq("id", set.id);
    return completed;
  };

  const adjustReps = async (id: number, delta: number) => {
    const row = sets.find((s) => s.id === id);
    if (!row) return;
    const target_reps = bumpNumeric(row.target_reps, delta);
    patchSet(id, { target_reps });
    await supabase.from("workout_session_sets").update({ target_reps }).eq("id", id);
  };

  const adjustWeight = async (id: number, delta: number) => {
    const row = sets.find((s) => s.id === id);
    if (!row) return;
    const weight = bumpNumeric(row.weight, delta);
    patchSet(id, { weight });
    await supabase.from("workout_session_sets").update({ weight }).eq("id", id);
  };

  const addSet = async (exerciseName: string) => {
    if (!session) return;
    const list = (byExercise.get(exerciseName) ?? [])
      .slice()
      .sort((a, b) => b.set_number - a.set_number);
    const last = list[0];
    const { data: row } = await supabase
      .from("workout_session_sets")
      .insert({
        session_id: session.id,
        exercise_name: exerciseName,
        exercise_index: last?.exercise_index ?? 0,
        set_number: (last?.set_number ?? 0) + 1,
        target_reps: last?.target_reps ?? "8",
        weight: last?.weight ?? "0 kg",
        completed: false,
      })
      .select()
      .single();
    if (row) setSets((prev) => [...prev, row]);
  };

  const removeSet = async (exerciseName: string) => {
    const list = (byExercise.get(exerciseName) ?? [])
      .slice()
      .sort((a, b) => a.set_number - b.set_number);
    if (list.length <= 1) return;
    const last = list[list.length - 1];
    if (last.completed) return;
    await supabase.from("workout_session_sets").delete().eq("id", last.id);
    setSets((prev) => prev.filter((s) => s.id !== last.id));
  };

  const complete = async () => {
    if (!session) return;
    setCompleting(true);
    await supabase
      .from("workout_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", session.id);
    await supabase.from("workout_logs").insert({
      user_id: userId,
      workout_name: session.workout_name,
      duration: session.duration,
      calories: session.calories,
      completed_at: toDayKey(new Date()),
    });
    setSession((prev) => (prev ? { ...prev, status: "completed" } : prev));
    onCompleted();
    setCompleting(false);
  };

  return {
    session,
    sets,
    ordered,
    byExercise,
    nextSet,
    completedCount,
    totalSets: sets.length,
    isCompleted,
    starting,
    completing,
    start,
    toggleSet,
    adjustReps,
    adjustWeight,
    addSet,
    removeSet,
    complete,
  };
}

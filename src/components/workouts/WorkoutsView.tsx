import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Dumbbell as DumbbellIcon, Plus as PlusIcon } from "lucide-react-native";
import { useUserId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { toDayKey } from "../../lib/date";
import { glass } from "../../lib/theme";
import type { Workout } from "../../lib/queries";
import {
  customToWorkout,
  deleteCustomWorkout,
  isCustomWorkoutId,
  realCustomId,
  useCustomWorkouts,
} from "../../lib/customWorkouts";
import { Text } from "../ui/Text";
import { CategoryChips } from "./CategoryChips";
import { CustomWorkoutBuilder } from "./CustomWorkoutBuilder";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutDetailSheet } from "./WorkoutDetailSheet";

export function WorkoutsView({ workouts }: { workouts: Workout[] }) {
  const userId = useUserId();
  const { customWorkouts, refetch: refetchCustom } = useCustomWorkouts();

  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Workout | null>(null);
  const [loggedIds, setLoggedIds] = useState<Set<number>>(new Set());
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [building, setBuilding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allWorkouts = useMemo(
    () => [...customWorkouts.map(customToWorkout), ...workouts],
    [customWorkouts, workouts]
  );

  const { categories, counts } = useMemo(() => {
    const counts: Record<string, number> = { All: allWorkouts.length };
    for (const w of allWorkouts) {
      if (w.category) counts[w.category] = (counts[w.category] ?? 0) + 1;
    }
    return { categories: ["All", ...Object.keys(counts).filter((c) => c !== "All")], counts };
  }, [allWorkouts]);

  const visible = useMemo(
    () => (category === "All" ? allWorkouts : allWorkouts.filter((w) => w.category === category)),
    [allWorkouts, category]
  );

  const logWorkout = async (w: Workout) => {
    setLoadingId(w.id);
    const { error } = await supabase.from("workout_logs").insert({
      user_id: userId,
      workout_name: w.name,
      duration: w.duration,
      calories: w.calories,
      completed_at: toDayKey(new Date()),
    });
    setLoadingId(null);
    if (error) {
      console.log("log workout:", error);
      return;
    }
    setLoggedIds((prev) => new Set(prev).add(w.id));
  };

  const openDetail = (w: Workout) => {
    setConfirmDelete(false);
    setSelected(w);
  };

  const closeDetail = () => {
    setSelected(null);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    if (!selected || !isCustomWorkoutId(selected.id)) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await deleteCustomWorkout(realCustomId(selected.id));
      await refetchCustom();
      closeDetail();
    } catch (e) {
      console.log("delete custom workout:", e);
    } finally {
      setDeleting(false);
    }
  };

  const isCustom = selected ? isCustomWorkoutId(selected.id) : false;

  return (
    <View className="pb-8">
      <View className="px-5 pb-4 pt-16">
        <Text className="text-3xl font-bold uppercase text-[#1a1410]">Train</Text>
        <Text className="mt-1 font-mono text-xs text-[#9c8468]">
          {allWorkouts.length} workout{allWorkouts.length === 1 ? "" : "s"} ·{" "}
          {customWorkouts.length} custom
        </Text>
      </View>

      <View className="px-5 pb-3">
        <Pressable
          onPress={() => setBuilding(true)}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-[#c8a96e] bg-[#c8a96e]/10 py-3"
        >
          <PlusIcon size={15} color="#1a1410" />
          <Text className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#1a1410]">
            Create custom day
          </Text>
        </Pressable>
      </View>

      <CategoryChips
        categories={categories}
        active={category}
        counts={counts}
        onSelect={setCategory}
      />

      <View className="gap-3 px-5">
        {visible.length === 0 && (
          <View className={`${glass} items-center rounded-2xl p-6`}>
            <DumbbellIcon size={24} color="#c4b49a" />
            <Text className="mt-2 font-mono text-sm text-[#9c8468]">
              {allWorkouts.length === 0 ? "No workouts yet." : `Nothing in ${category} yet.`}
            </Text>
          </View>
        )}

        {visible.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            logged={loggedIds.has(w.id)}
            onPress={() => openDetail(w)}
          />
        ))}
      </View>

      <WorkoutDetailSheet
        workout={selected}
        isLogged={selected ? loggedIds.has(selected.id) : false}
        isLoading={selected ? loadingId === selected.id : false}
        onClose={closeDetail}
        onLog={logWorkout}
        onDelete={isCustom ? handleDelete : undefined}
        deleting={deleting}
        deleteConfirming={confirmDelete}
      />

      <CustomWorkoutBuilder
        visible={building}
        workouts={workouts}
        onClose={() => setBuilding(false)}
        onCreated={refetchCustom}
      />
    </View>
  );
}

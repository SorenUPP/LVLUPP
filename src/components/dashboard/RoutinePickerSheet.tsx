import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Check as CheckIcon, X as XIcon } from "lucide-react-native";
import type { CustomWorkout } from "../../lib/customWorkouts";
import type { Workout } from "../../lib/queries";
import { WEEKDAY_LABEL, type RoutineDay } from "../../lib/routine";
import { Text } from "../ui/Text";

type Target = { workoutId?: number | null; customWorkoutId?: number | null };

export function RoutinePickerSheet({
  weekday,
  current,
  workouts,
  customWorkouts,
  onClose,
  onPick,
}: {
  weekday: number | null;
  current: RoutineDay | undefined;
  workouts: Workout[];
  customWorkouts: CustomWorkout[];
  onClose: () => void;
  onPick: (weekday: number, target: Target) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const choose = async (target: Target) => {
    if (weekday === null || saving) return;
    setSaving(true);
    try {
      await onPick(weekday, target);
    } finally {
      setSaving(false);
    }
  };

  const restSelected = !!current && current.workoutId == null && current.customWorkoutId == null;

  return (
    <Modal visible={weekday !== null} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="max-h-[85%] overflow-hidden rounded-t-3xl bg-[#fdf8f0]">
          <View className="flex-row items-center justify-between border-b border-[#e5d9c8] px-5 py-4">
            <Text className="text-lg font-bold uppercase text-[#1a1410]">
              {weekday !== null ? WEEKDAY_LABEL[weekday] : ""} · plan
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <XIcon size={20} color="#1a1410" />
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerClassName="py-4 gap-2"
            showsVerticalScrollIndicator={false}
          >
            <Option label="Rest day" selected={restSelected} onPress={() => choose({})} />

            {customWorkouts.length > 0 && (
              <Text className="mb-1 mt-3 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
                Custom days
              </Text>
            )}
            {customWorkouts.map((c) => (
              <Option
                key={`c-${c.id}`}
                label={c.name}
                sub={`${c.exercises.length} exercise${c.exercises.length === 1 ? "" : "s"}`}
                selected={current?.customWorkoutId === c.id}
                onPress={() => choose({ customWorkoutId: c.id })}
              />
            ))}

            <Text className="mb-1 mt-3 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
              Workouts
            </Text>
            {workouts.map((w) => (
              <Option
                key={`w-${w.id}`}
                label={w.name}
                sub={[w.category, w.duration].filter(Boolean).join(" · ")}
                selected={current?.workoutId === w.id}
                onPress={() => choose({ workoutId: w.id })}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Option({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
        selected ? "border-[#1a1410] bg-[#1a1410]/5" : "border-[#e5d9c8] bg-white"
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-sm font-bold uppercase text-[#1a1410]" numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text className="mt-0.5 font-mono text-[10px] uppercase text-[#9c8468]">{sub}</Text>
        ) : null}
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full ${
          selected ? "bg-[#1a1410]" : "border border-[#e5d9c8]"
        }`}
      >
        {selected && <CheckIcon size={13} color="#c8a96e" />}
      </View>
    </Pressable>
  );
}

import { Image, TouchableOpacity, View } from "react-native";
import { glass } from "../../lib/theme";
import type { Workout } from "../../lib/queries";
import { Text } from "../ui/Text";

/** Empty state / "start" card shown before a session exists for today. */
export function TodaysWorkoutCard({
  workout,
  starting,
  onStart,
}: {
  workout: Workout | null;
  starting: boolean;
  onStart: () => void;
}) {
  if (!workout) {
    return (
      <View className={`${glass} mb-3 h-32 items-center justify-center rounded-xl`}>
        <Text className="text-sm text-[#9c8468]">No workout scheduled</Text>
      </View>
    );
  }

  return (
    <View className="relative mb-3 h-32 overflow-hidden rounded-xl bg-[#e5d9c8] shadow-md">
      <Image source={{ uri: workout.image }} className="absolute h-full w-full opacity-70" />
      <View className="flex-1 justify-center bg-black/30 p-5">
        <Text className="text-2xl font-bold uppercase text-white">{workout.name}</Text>
        <Text className="mt-1 font-mono text-xs uppercase text-[#c8a96e]">
          {workout.exercises} exercises · {workout.calories} kcal
        </Text>
        <TouchableOpacity
          onPress={onStart}
          disabled={starting}
          className="mt-3 self-start rounded-full bg-[#c8a96e] px-4 py-2"
        >
          <Text className="text-xs font-bold uppercase text-[#1a1410]">
            {starting ? "Starting…" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

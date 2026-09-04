import { memo } from "react";
import { Image, Pressable, View } from "react-native";
import {
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  Dumbbell as DumbbellIcon,
  Flame as FlameIcon,
} from "lucide-react-native";
import { glass } from "../../lib/theme";
import type { Workout } from "../../lib/queries";
import { Text } from "../ui/Text";
import { DIFFICULTY_COLOR, exerciseCount, workoutMuscles } from "./helpers";

export const WorkoutCard = memo(function WorkoutCard({
  workout,
  logged,
  onPress,
}: {
  workout: Workout;
  logged: boolean;
  onPress: () => void;
}) {
  const diffColor = DIFFICULTY_COLOR[workout.difficulty] ?? "#9c8468";
  const muscles = workoutMuscles(workout);

  return (
    <Pressable onPress={onPress} className={`${glass} overflow-hidden rounded-2xl`}>
      <View className="flex-row">
        {workout.image ? (
          <Image source={{ uri: workout.image }} className="h-28 w-28" />
        ) : (
          <View className="h-28 w-28 items-center justify-center bg-[#f0e8d8]">
            <DumbbellIcon size={22} color="#c4b49a" />
          </View>
        )}

        <View className="flex-1 p-3">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: diffColor }}
            >
              {workout.difficulty || "All levels"}
            </Text>
            {logged && (
              <Text className="font-mono text-[9px] uppercase text-[#5b8c5a]">Logged</Text>
            )}
          </View>

          <Text className="mt-1 text-base font-bold uppercase text-[#1a1410]" numberOfLines={2}>
            {workout.name}
          </Text>

          <View className="mt-2 flex-row items-center gap-3">
            <IconStat icon={<ClockIcon size={12} color="#9c8468" />} text={workout.duration} />
            <IconStat
              icon={<DumbbellIcon size={12} color="#9c8468" />}
              text={`${exerciseCount(workout)} ex`}
            />
            <IconStat
              icon={<FlameIcon size={12} color="#9c8468" />}
              text={`${workout.calories} kcal`}
            />
          </View>

          {muscles.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-1">
              {muscles.slice(0, 3).map((m) => (
                <View key={m} className="rounded-full bg-[#f0e8d8] px-2 py-0.5">
                  <Text className="font-mono text-[9px] uppercase text-[#9c8468]">{m}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="items-center justify-center pr-2">
          <ChevronRightIcon size={16} color="#c4b49a" />
        </View>
      </View>
    </Pressable>
  );
});

function IconStat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-1">
      {icon}
      <Text className="font-mono text-[10px] text-[#9c8468]">{text}</Text>
    </View>
  );
}

import { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Dumbbell as DumbbellIcon, TrendingUp as TrendingUpIcon } from "lucide-react-native";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";

interface Props {
  streak: number;
  totalWorkouts: number;
  totalCalories: number;
  week: { day: string; done: boolean }[];
  onTrain: () => void;
  onProgress: () => void;
}

export const WeeklySummary = memo(function WeeklySummary({
  streak,
  totalWorkouts,
  totalCalories,
  week,
  onTrain,
  onProgress,
}: Props) {
  return (
    <>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onTrain}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#1a1410] py-3"
        >
          <DumbbellIcon size={16} color="#c8a96e" />
          <Text className="font-mono text-[10px] uppercase text-white">Train</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onProgress}
          className={`flex-1 flex-row items-center justify-center gap-2 ${glass} rounded-xl py-3`}
        >
          <TrendingUpIcon size={16} color="#1a1410" />
          <Text className="font-mono text-[10px] uppercase text-[#1a1410]">Progress</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3">
        <View className="w-1/3 justify-between rounded-xl bg-[#1a1410] p-4 shadow-md">
          <Text className="font-mono text-[9px] uppercase text-[#9c8468]">Streak</Text>
          <Text className="mt-2 text-5xl font-extrabold text-white">{streak}</Text>
          <Text className="mt-1 font-mono text-[10px] uppercase text-[#c8a96e]">days</Text>
        </View>

        <View className="w-2/3 gap-3">
          <View className={`${glass} flex-row items-center justify-between rounded-xl px-4 py-3`}>
            <Text className="font-mono text-[10px] uppercase text-[#9c8468]">Workouts</Text>
            <Text className="text-2xl font-bold">{totalWorkouts}</Text>
          </View>
          <View className={`${glass} flex-row items-center justify-between rounded-xl px-4 py-3`}>
            <Text className="font-mono text-[10px] uppercase text-[#9c8468]">Calories</Text>
            <Text className="text-2xl font-bold">{totalCalories.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View className={`${glass} rounded-xl p-4`}>
        <Text className="mb-1 font-mono text-[10px] uppercase text-[#9c8468]">This week</Text>
        <Text className="mb-3 text-xs text-[#1a1410]">Workouts completed</Text>
        <View className="h-14 flex-row items-end justify-between">
          {week.map((d, i) => (
            <View key={i} className="flex-1 items-center">
              <View className="h-11 w-full justify-end overflow-hidden rounded bg-[#f0e8d8]/70">
                <View
                  className="w-full rounded bg-[#1a1410]"
                  style={{ height: d.done ? "100%" : 0 }}
                />
              </View>
              <Text className="mt-1 font-mono text-[9px] text-[#c4b49a]">{d.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
});

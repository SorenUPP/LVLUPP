import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react-native";
import { memo, useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import type { CustomWorkout } from "../../lib/customWorkouts";
import type { Workout } from "../../lib/queries";
import {
  dayLabel,
  todayWeekday,
  WEEKDAY_LABEL,
  WEEKDAY_ORDER,
  type RoutineDay,
} from "../../lib/routine";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";

export const WeeklyRoutineCard = memo(function WeeklyRoutineCard({
  byWeekday,
  workouts,
  customWorkouts,
  onPickDay,
}: {
  byWeekday: Map<number, RoutineDay>;
  workouts: Workout[];
  customWorkouts: CustomWorkout[];
  onPickDay: (weekday: number) => void;
}) {
  const today = todayWeekday();
  const [expanded, setExpanded] = useState(false);
  const todayEntry = byWeekday.get(today);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  };

  return (
    <View className={`${glass} rounded-xl p-3`}>
      <Pressable
        onPress={toggleExpanded}
        className="flex-row items-center gap-3 rounded-lg px-1 py-1"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View className="flex-1">
          <Text className="font-mono text-[10px] uppercase text-[#9c8468]">Weekly routine</Text>
          <Text className="mt-1 text-sm font-bold uppercase text-[#1a1410]">
            {WEEKDAY_LABEL[today]} · {dayLabel(todayEntry, workouts, customWorkouts)}
          </Text>
        </View>
        <View className="rounded-full bg-[#1a1410]/5 p-2">
          <ChevronDownIcon
            size={16}
            color="#1a1410"
            style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="mt-2 gap-1">
          {WEEKDAY_ORDER.map((wd) => {
            const entry = byWeekday.get(wd);
            const isToday = wd === today;
            const rest = !entry || (entry.workoutId == null && entry.customWorkoutId == null);
            return (
              <Pressable
                key={wd}
                onPress={() => onPickDay(wd)}
                className={`flex-row items-center gap-3 rounded-lg px-3 py-2.5 ${
                  isToday ? "bg-[#1a1410]" : ""
                }`}
              >
                <Text
                  className={`w-9 font-mono text-[10px] uppercase ${
                    isToday ? "text-[#c8a96e]" : "text-[#9c8468]"
                  }`}
                >
                  {WEEKDAY_LABEL[wd]}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`flex-1 text-sm ${
                    isToday ? "font-bold text-white" : rest ? "text-[#c4b49a]" : "text-[#1a1410]"
                  }`}
                >
                  {dayLabel(entry, workouts, customWorkouts)}
                </Text>
                <ChevronRightIcon size={14} color={isToday ? "#c8a96e" : "#c4b49a"} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
});

import { memo } from "react";
import { View } from "react-native";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";

export const ActivityChart = memo(function ActivityChart({
  chart,
  thisWeek,
  weeklyGoal,
}: {
  chart: number[];
  thisWeek: number;
  weeklyGoal: number;
}) {
  const maxBar = Math.max(1, ...chart);
  const last = chart.length - 1;

  return (
    <View className={`${glass} rounded-2xl p-4`}>
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
          Last 8 weeks
        </Text>
        <Text
          className="font-mono text-[10px]"
          style={{ color: thisWeek >= weeklyGoal ? "#5b8c5a" : "#9c8468" }}
        >
          {thisWeek} / {weeklyGoal} this week
        </Text>
      </View>

      <View className="mt-4 h-24 flex-row items-end justify-between">
        {chart.map((count, i) => {
          const isCurrent = i === last;
          return (
            <View key={i} className="flex-1 items-center">
              <Text className="mb-1 font-mono text-[9px] text-[#c4b49a]">{count || ""}</Text>
              <View className="h-16 w-3 justify-end overflow-hidden rounded-full bg-[#f0e8d8]">
                <View
                  className={`w-full rounded-full ${isCurrent ? "bg-[#c8a96e]" : "bg-[#1a1410]"}`}
                  style={{ height: `${Math.max(count === 0 ? 0 : 12, (count / maxBar) * 100)}%` }}
                />
              </View>
              <Text className="mt-1 font-mono text-[8px] text-[#c4b49a]">
                {isCurrent ? "now" : `${last - i}w`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

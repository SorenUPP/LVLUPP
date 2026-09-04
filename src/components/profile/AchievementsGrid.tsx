import { View } from "react-native";
import { Award as AwardIcon, Check as CheckIcon } from "lucide-react-native";
import { glass } from "../../lib/theme";
import type { Profile } from "../../lib/profile";
import { Text } from "../ui/Text";
import type { ProfileStats } from "./useProfileStats";

export function AchievementsGrid({ profile, stats }: { profile: Profile; stats: ProfileStats }) {
  const badges = [
    { key: "first", label: "First Workout", earned: stats.total >= 1 },
    { key: "ten", label: "10 Sessions", earned: stats.total >= 10 },
    { key: "twentyfive", label: "25 Sessions", earned: stats.total >= 25 },
    { key: "streak7", label: "7-Day Streak", earned: stats.streak >= 7 },
    {
      key: "goal",
      label: "Goal Crusher",
      earned: profile.weeklyGoal > 0 && stats.thisWeek >= profile.weeklyGoal,
    },
    { key: "burn", label: "10k Calories", earned: stats.calories >= 10000 },
  ];

  return (
    <View className={`${glass} rounded-2xl p-4`}>
      <View className="mb-3 flex-row items-center gap-2">
        <AwardIcon size={14} color="#9c8468" />
        <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
          Achievements
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {badges.map((b) => (
          <View
            key={b.key}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: b.earned ? profile.accent + "22" : "#f0e8d8" }}
          >
            {b.earned && <CheckIcon size={11} color="#1a1410" />}
            <Text
              className="font-mono text-[10px] uppercase"
              style={{ color: b.earned ? "#1a1410" : "#c4b49a" }}
            >
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

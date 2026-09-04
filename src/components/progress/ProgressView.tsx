import { ActivityIndicator, View } from "react-native";
import {
  Dumbbell as DumbbellIcon,
  Flame as FlameIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
} from "lucide-react-native";
import { formatDuration } from "../../lib/date";
import { useProfile } from "../../lib/profile";
import { Text } from "../ui/Text";
import { ActivityChart } from "./ActivityChart";
import { HistoryList } from "./HistoryList";
import { PersonalBestsPanel } from "./PersonalBestsPanel";
import { StatTile } from "./StatTile";
import { useProgressStats } from "./useProgressStats";

function Header() {
  return (
    <View className="px-5 pb-4 pt-16">
      <Text className="text-3xl font-bold uppercase text-[#1a1410]">Progress</Text>
      <Text className="mt-1 font-mono text-xs text-[#9c8468]">
        Your training history and milestones
      </Text>
    </View>
  );
}

export function ProgressView() {
  const { profile } = useProfile();
  const { logs, personalBests, stats, loading } = useProgressStats();

  if (loading) {
    return (
      <View className="pb-8">
        <Header />
        <View className="items-center py-16">
          <ActivityIndicator color="#1a1410" />
        </View>
      </View>
    );
  }

  return (
    <View className="pb-8">
      <Header />

      <View className="gap-4 px-5">
        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatTile
              icon={<DumbbellIcon size={15} color="#c8a96e" />}
              label="Workouts"
              value={String(stats.total)}
              dark
            />
            <StatTile
              icon={<TrendingUpIcon size={15} color="#1a1410" />}
              label="Day streak"
              value={String(stats.streak)}
            />
          </View>
          <View className="flex-row gap-3">
            <StatTile
              icon={<TimerIcon size={15} color="#1a1410" />}
              label="Total time"
              value={formatDuration(stats.totalMinutes)}
            />
            <StatTile
              icon={<FlameIcon size={15} color="#1a1410" />}
              label="Calories"
              value={stats.totalCalories.toLocaleString()}
            />
          </View>
        </View>

        <ActivityChart
          chart={stats.chart}
          thisWeek={stats.thisWeek}
          weeklyGoal={profile.weeklyGoal}
        />
        <PersonalBestsPanel items={personalBests} />
        <HistoryList logs={logs} />
      </View>
    </View>
  );
}

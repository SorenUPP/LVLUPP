import { memo } from "react";
import { View } from "react-native";
import { Dumbbell as DumbbellIcon } from "lucide-react-native";
import { formatLogDate } from "../../lib/date";
import { glass } from "../../lib/theme";
import type { WorkoutLog } from "../../lib/queries";
import { Text } from "../ui/Text";

const LIMIT = 20;

export const HistoryList = memo(function HistoryList({ logs }: { logs: WorkoutLog[] }) {
  return (
    <View>
      <Text className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
        History
      </Text>
      {logs.length === 0 ? (
        <View className={`${glass} items-center rounded-2xl p-6`}>
          <DumbbellIcon size={22} color="#c4b49a" />
          <Text className="mt-2 font-mono text-sm text-[#9c8468]">
            No workouts logged yet. Finish a session to see it here.
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {logs.slice(0, LIMIT).map((l, i) => (
            <View
              key={l.id ?? i}
              className={`${glass} flex-row items-center justify-between rounded-xl px-4 py-3`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold uppercase text-[#1a1410]" numberOfLines={1}>
                  {l.workout_name}
                </Text>
                <Text className="mt-0.5 font-mono text-[10px] text-[#9c8468]">
                  {formatLogDate(l.completed_at)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-mono text-[11px] text-[#1a1410]">{l.duration}</Text>
                <Text className="font-mono text-[10px] text-[#9c8468]">{l.calories} kcal</Text>
              </View>
            </View>
          ))}
          {logs.length > LIMIT && (
            <Text className="mt-1 text-center font-mono text-[10px] text-[#c4b49a]">
              Showing {LIMIT} of {logs.length}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

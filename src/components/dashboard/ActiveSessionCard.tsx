import { LinearGradient } from "expo-linear-gradient";
import { Check as CheckIcon, ChevronRight as ChevronRightIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import type { SessionSet } from "../../lib/queries";
import { Text } from "../ui/Text";
import { RestBar } from "./RestBar";
import { SessionCompleteCard } from "./SessionCompleteCard";
import type { useWorkoutSession } from "./useWorkoutSession";
import type { useRestTimer } from "./useRestTimer";

type Session = ReturnType<typeof useWorkoutSession>;
type Rest = ReturnType<typeof useRestTimer>;

export function ActiveSessionCard({
  session,
  rest,
  onToggleSet,
  onComplete,
  onOpenEditor,
}: {
  session: Session;
  rest: Rest;
  onToggleSet: (set: SessionSet) => void;
  onComplete: () => void;
  onOpenEditor: () => void;
}) {
  const { session: row, isCompleted, completedCount, totalSets, nextSet, completing } = session;
  if (!row) return null;

  const progress = totalSets ? (completedCount / totalSets) * 100 : 0;

  return (
    <View className="mb-3 rounded-lg border border-[#1a1410] bg-white p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold uppercase text-[#1a1410]">{row.workout_name}</Text>
        <Text className="font-mono text-xs text-[#9c8468]">
          {isCompleted ? "Complete" : `${completedCount}/${totalSets}`}
        </Text>
      </View>

      {!isCompleted && (
        <View className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#e5d9c8]">
          <View className="h-full bg-[#1a1410]" style={{ width: `${progress}%` }} />
        </View>
      )}

      {rest.secondsLeft !== null && <RestBar secondsLeft={rest.secondsLeft} onSkip={rest.skip} />}

      {!isCompleted && nextSet && (
        <Pressable
          onPress={() => onToggleSet(nextSet)}
          disabled={rest.resting}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View className={`items-center p-4 ${rest.resting ? "bg-[#e5d9c8]" : "bg-[#1a1410]"}`}>
            <Text
              className={`font-mono text-xs uppercase ${rest.resting ? "text-[#9c8468]" : "text-[#c8a96e]"}`}
            >
              {nextSet.exercise_name} · Set {nextSet.set_number}
            </Text>
            <Text
              className={`mt-1 text-base font-bold uppercase ${rest.resting ? "text-[#9c8468]" : "text-white"}`}
            >
              {nextSet.target_reps} reps · {nextSet.weight}
            </Text>
            <Text
              className={`mt-2 text-xs font-bold uppercase ${rest.resting ? "text-[#c4b49a]" : "text-[#c8a96e]"}`}
            >
              {rest.resting ? "Resting" : "Tap to complete set"}
            </Text>
          </View>
        </Pressable>
      )}

      {!isCompleted && !nextSet && totalSets > 0 && (
        <Pressable onPress={onComplete} disabled={completing} hitSlop={8}>
          <View className="items-center rounded-lg bg-[#c8a96e] p-4">
            <CheckIcon size={18} className="mb-1 text-[#1a1410]" />
            <Text className="font-mono text-xs uppercase text-[#1a1410]">All sets complete</Text>
            <Text className="mt-0.5 text-base font-bold uppercase text-[#1a1410]">
              {completing ? "Saving…" : "Finish Workout"}
            </Text>
          </View>
        </Pressable>
      )}

      {isCompleted && <SessionCompleteCard session={row} totalSets={totalSets} />}

      {!isCompleted && (
        <Pressable onPress={onOpenEditor} hitSlop={8} className="mt-3 overflow-hidden rounded-full">
          <LinearGradient
            colors={["#e0c393", "#c8a96e", "#a8834f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 11,
            }}
          >
            <Text className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#1a1410]">
              Edit sets and weights
            </Text>
            <ChevronRightIcon size={13} className="text-[#1a1410]" />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

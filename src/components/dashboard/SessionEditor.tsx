import { Check as CheckIcon, ChevronDown as ChevronDownIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatClock } from "../../lib/date";
import type { SessionSet } from "../../lib/queries";
import { Text } from "../ui/Text";
import { StepButton } from "./StepButton";
import type { useRestTimer } from "./useRestTimer";
import type { useWorkoutSession } from "./useWorkoutSession";

type Session = ReturnType<typeof useWorkoutSession>;
type Rest = ReturnType<typeof useRestTimer>;

export function SessionEditor({
  session,
  rest,
  onToggleSet,
  onComplete,
  onClose,
}: {
  session: Session;
  rest: Rest;
  onToggleSet: (set: SessionSet) => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const {
    session: row,
    byExercise,
    isCompleted,
    completedCount,
    totalSets,
    completing,
    adjustReps,
    adjustWeight,
    addSet,
    removeSet,
  } = session;
  if (!row) return null;

  const allDone = completedCount === totalSets;

  return (
    <View className="mb-3 rounded-2xl border border-[#e5d9c8] bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between border-b border-[#f0e8d8] pb-3">
        <View>
          <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
            Edit session
          </Text>
          <Text className="mt-0.5 text-base font-bold uppercase text-[#1a1410]">
            {row.workout_name}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#f0e8d8]"
        >
          <ChevronDownIcon size={18} className="text-[#1a1410]" />
        </Pressable>
      </View>

      {!isCompleted && (
        <View className="mb-4 flex-row items-center justify-between rounded-xl bg-[#f0e8d8] px-4 py-3">
          <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
            Rest timer
          </Text>
          <View className="flex-row items-center gap-3">
            <StepButton sign="-" onPress={() => rest.nudge(-15)} />
            <Text className="w-10 text-center font-mono text-xs font-bold text-[#1a1410]">
              {formatClock(rest.duration)}
            </Text>
            <StepButton sign="+" onPress={() => rest.nudge(15)} />
          </View>
        </View>
      )}

      {[...byExercise.entries()].map(([name, sets]) => (
        <ExerciseEditor
          key={name}
          name={name}
          sets={sets}
          isCompleted={isCompleted}
          onToggle={onToggleSet}
          onAdjustReps={adjustReps}
          onAdjustWeight={adjustWeight}
          onAddSet={() => addSet(name)}
          onRemoveSet={() => removeSet(name)}
        />
      ))}

      {!isCompleted && (
        <Pressable onPress={onComplete} disabled={completing} hitSlop={8}>
          <View
            className={`mt-1 items-center rounded-xl py-3.5 ${allDone ? "bg-[#1a1410]" : "bg-[#f0e8d8]"}`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-widest ${allDone ? "text-white" : "text-[#9c8468]"}`}
            >
              {completing ? "Saving" : allDone ? "Complete Workout" : "Finish Early"}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function ExerciseEditor({
  name,
  sets,
  isCompleted,
  onToggle,
  onAdjustReps,
  onAdjustWeight,
  onAddSet,
  onRemoveSet,
}: {
  name: string;
  sets: SessionSet[];
  isCompleted: boolean;
  onToggle: (set: SessionSet) => void;
  onAdjustReps: (id: number, delta: number) => void;
  onAdjustWeight: (id: number, delta: number) => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
}) {
  const firstIncomplete = sets.find((s) => !s.completed);

  return (
    <View className="mb-3 rounded-xl border border-[#f0e8d8] p-3">
      <Text className="mb-3 text-sm font-bold uppercase text-[#1a1410]">{name}</Text>

      <View className="mb-2 flex-row items-center px-1">
        <Text className="w-8 font-mono text-[9px] uppercase text-[#c4b49a]">Set</Text>
        <Text className="flex-1 text-center font-mono text-[9px] uppercase text-[#c4b49a]">
          Reps
        </Text>
        <Text className="flex-1 text-center font-mono text-[9px] uppercase text-[#c4b49a]">
          Weight
        </Text>
        <View className="w-8" />
      </View>

      {sets.map((s) => {
        const isNext = !s.completed && s.id === firstIncomplete?.id;
        const isLocked = !s.completed && !isNext;
        const editable = !isCompleted && !s.completed;
        return (
          <View
            key={s.id}
            className={`flex-row items-center rounded-lg px-1 py-2.5 ${s.completed ? "bg-[#f0e8d8]/60" : ""}`}
          >
            <View className="w-8">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-[#f0e8d8]">
                <Text className="font-mono text-[11px] font-bold text-[#1a1410]">
                  {s.set_number}
                </Text>
              </View>
            </View>

            <View className="flex-1 flex-row items-center justify-center gap-2">
              {editable ? (
                <>
                  <StepButton sign="-" onPress={() => onAdjustReps(s.id, -1)} />
                  <Text className="w-8 text-center font-mono text-xs text-[#1a1410]">
                    {s.target_reps}
                  </Text>
                  <StepButton sign="+" onPress={() => onAdjustReps(s.id, 1)} />
                </>
              ) : (
                <Text className="font-mono text-xs text-[#9c8468]">{s.target_reps}</Text>
              )}
            </View>

            <View className="flex-1 flex-row items-center justify-center gap-2">
              {editable ? (
                <>
                  <StepButton sign="-" onPress={() => onAdjustWeight(s.id, -2.5)} />
                  <Text className="w-14 text-center font-mono text-xs text-[#1a1410]">
                    {s.weight}
                  </Text>
                  <StepButton sign="+" onPress={() => onAdjustWeight(s.id, 2.5)} />
                </>
              ) : (
                <Text className="font-mono text-xs text-[#9c8468]">{s.weight}</Text>
              )}
            </View>

            <Pressable
              onPress={() => !isCompleted && onToggle(s)}
              disabled={isCompleted || isLocked}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <View
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{
                  borderWidth: isNext && !s.completed ? 2 : 1,
                  borderColor: s.completed ? "#1a1410" : isNext ? "#c8a96e" : "#e5d9c8",
                  backgroundColor: s.completed ? "#1a1410" : "transparent",
                }}
              >
                {s.completed && <CheckIcon size={12} className="text-white" />}
              </View>
            </Pressable>
          </View>
        );
      })}

      {!isCompleted && (
        <View className="mt-1 flex-row justify-end gap-2">
          <Pressable onPress={onRemoveSet} hitSlop={8}>
            <View className="h-7 w-7 items-center justify-center rounded-full border border-[#e5d9c8]">
              <Text className="text-sm font-bold text-[#c4b49a]">−</Text>
            </View>
          </Pressable>
          <Pressable onPress={onAddSet} hitSlop={8}>
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#1a1410]">
              <Text className="text-sm font-bold text-[#c8a96e]">+</Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { Trash2 as TrashIcon, X as XIcon } from "lucide-react-native";
import { glass } from "../../lib/theme";
import type { Workout } from "../../lib/queries";
import { Text } from "../ui/Text";
import { Divider, Meta, Stat } from "./primitives";
import { exerciseCount } from "./helpers";

export function WorkoutDetailSheet({
  workout,
  isLogged,
  isLoading,
  onClose,
  onLog,
  onDelete,
  deleting,
  deleteConfirming,
}: {
  workout: Workout | null;
  isLogged: boolean;
  isLoading: boolean;
  onClose: () => void;
  onLog: (w: Workout) => void;
  /** Present for user-owned custom days. */
  onDelete?: () => void;
  deleting?: boolean;
  deleteConfirming?: boolean;
}) {
  return (
    <Modal visible={!!workout} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="max-h-[88%] overflow-hidden rounded-t-3xl bg-[#fdf8f0]">
          {workout && (
            <>
              <View>
                {workout.image ? (
                  <Image source={{ uri: workout.image }} className="h-44 w-full" />
                ) : (
                  <View className="h-24 w-full bg-[#f0e8d8]" />
                )}
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-black/50"
                >
                  <XIcon size={18} color="#ffffff" />
                </Pressable>
              </View>

              <ScrollView
                className="px-5"
                contentContainerClassName="pb-6 pt-4"
                showsVerticalScrollIndicator={false}
              >
                <Text className="font-mono text-[10px] uppercase tracking-widest text-[#c8a96e]">
                  {workout.category || "Workout"}
                </Text>
                <Text className="mt-1 text-2xl font-bold uppercase text-[#1a1410]">
                  {workout.name}
                </Text>
                {workout.description ? (
                  <Text className="mt-2 text-sm leading-5 text-[#6b5d4d]">
                    {workout.description}
                  </Text>
                ) : null}

                <View className="mt-4 flex-row rounded-2xl bg-white/70 py-3">
                  <Stat label="Duration" value={String(workout.duration ?? "—")} />
                  <Divider />
                  <Stat label="Exercises" value={String(exerciseCount(workout))} />
                  <Divider />
                  <Stat label="Calories" value={String(workout.calories ?? "—")} />
                </View>

                {workout.equipment ? (
                  <View className="mt-3">
                    <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
                      Equipment
                    </Text>
                    <Text className="mt-1 text-sm text-[#1a1410]">{workout.equipment}</Text>
                  </View>
                ) : null}

                <Text className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
                  Exercises
                </Text>
                <View className="gap-2">
                  {(workout.sets ?? []).length === 0 && (
                    <Text className="font-mono text-xs text-[#9c8468]">
                      No exercise breakdown for this workout.
                    </Text>
                  )}
                  {(workout.sets ?? []).map((ex, i) => (
                    <View key={`${ex.name}-${i}`} className={`${glass} rounded-xl p-3`}>
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="flex-1 font-bold uppercase text-[#1a1410]"
                          numberOfLines={1}
                        >
                          {ex.name}
                        </Text>
                        {ex.muscle ? (
                          <Text className="ml-2 font-mono text-[10px] uppercase text-[#9c8468]">
                            {ex.muscle}
                          </Text>
                        ) : null}
                      </View>
                      <View className="mt-2 flex-row gap-5">
                        <Meta label="Sets × Reps" value={`${ex.sets ?? "—"} × ${ex.reps ?? "—"}`} />
                        <Meta label="Weight" value={String(ex.weight ?? "—")} />
                        <Meta label="Rest" value={String(ex.rest ?? "—")} />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View className="border-t border-[#e5d9c8] px-5 pb-8 pt-3">
                <Pressable
                  onPress={() => !isLogged && !isLoading && onLog(workout)}
                  disabled={isLogged || isLoading}
                  className={`items-center rounded-full py-3.5 ${isLogged ? "bg-[#e9f0e6]" : "bg-[#1a1410]"}`}
                >
                  <Text
                    className={`font-mono text-xs font-bold uppercase tracking-wide ${isLogged ? "text-[#5b8c5a]" : "text-white"}`}
                  >
                    {isLogged ? "Workout logged" : isLoading ? "Logging…" : "Log this workout"}
                  </Text>
                </Pressable>

                {onDelete && (
                  <Pressable
                    onPress={onDelete}
                    disabled={deleting}
                    className="mt-2 flex-row items-center justify-center gap-2 py-2"
                  >
                    <TrashIcon size={13} color="#b5544a" />
                    <Text className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#b5544a]">
                      {deleting
                        ? "Deleting…"
                        : deleteConfirming
                          ? "Tap again to confirm"
                          : "Delete training day"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

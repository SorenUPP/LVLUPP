import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Check as CheckIcon } from "lucide-react-native";
import type { WorkoutSession } from "../../lib/queries";
import { Text } from "../ui/Text";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xl font-extrabold text-white">{value}</Text>
      <Text className="mt-1 font-mono text-[9px] uppercase text-[#9c8468]">{label}</Text>
    </View>
  );
}

export function SessionCompleteCard({
  session,
  totalSets,
}: {
  session: WorkoutSession;
  totalSets: number;
}) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <View className="items-center rounded-2xl bg-[#1a1410] px-5 py-6">
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-full border-2 border-[#c8a96e]">
          <CheckIcon size={22} className="text-[#c8a96e]" />
        </View>
        <Text className="font-mono text-[10px] uppercase tracking-widest text-[#c8a96e]">
          Session complete
        </Text>
        <Text className="mt-1 text-center text-lg font-bold uppercase text-white">
          {session.workout_name}
        </Text>
        <View className="mt-5 w-full flex-row border-t border-white/10 pt-4">
          <Stat value={session.duration} label="Duration" />
          <View className="w-px bg-white/10" />
          <Stat value={totalSets} label="Sets" />
          <View className="w-px bg-white/10" />
          <Stat value={session.calories} label="Calories" />
        </View>
      </View>
    </Animated.View>
  );
}

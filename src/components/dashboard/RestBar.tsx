import { Pressable, View } from "react-native";
import { formatClock } from "../../lib/date";
import { Text } from "../ui/Text";

export function RestBar({ secondsLeft, onSkip }: { secondsLeft: number; onSkip: () => void }) {
  return (
    <View className="mb-3 flex-row items-center justify-between bg-[#1a1410] px-3 py-2">
      <Text className="font-mono text-xs uppercase text-white">Rest</Text>
      <Text className="font-mono text-lg font-bold text-white">{formatClock(secondsLeft)}</Text>
      <Pressable onPress={onSkip} hitSlop={10}>
        <Text className="font-mono text-xs uppercase text-[#c8a96e]">Skip</Text>
      </Pressable>
    </View>
  );
}

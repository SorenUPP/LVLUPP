import { memo } from "react";
import { View } from "react-native";
import { glass } from "../../lib/theme";
import type { PersonalBest } from "../../lib/queries";
import { Text } from "../ui/Text";

export const PersonalBests = memo(function PersonalBests({ items }: { items: PersonalBest[] }) {
  if (items.length === 0) return null;
  return (
    <View className={`${glass} rounded-xl p-4`}>
      <Text className="mb-3 font-mono text-[10px] uppercase text-[#9c8468]">Personal Bests</Text>
      <View className="flex-row justify-between">
        {items.map((pb) => (
          <View key={pb.id} className="flex-1 items-center">
            <Text className="text-xl font-extrabold text-[#1a1410]">{pb.value}</Text>
            <Text className="mt-1 font-mono text-[9px] uppercase text-[#9c8468]">{pb.lift}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

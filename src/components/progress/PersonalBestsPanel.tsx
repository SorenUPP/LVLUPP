import { memo } from "react";
import { View } from "react-native";
import { Award as AwardIcon } from "lucide-react-native";
import { glass } from "../../lib/theme";
import type { PersonalBest } from "../../lib/queries";
import { Text } from "../ui/Text";

export const PersonalBestsPanel = memo(function PersonalBestsPanel({
  items,
}: {
  items: PersonalBest[];
}) {
  return (
    <View className={`${glass} rounded-2xl p-4`}>
      <View className="mb-3 flex-row items-center gap-2">
        <AwardIcon size={14} color="#9c8468" />
        <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
          Personal Bests
        </Text>
      </View>
      {items.length === 0 ? (
        <Text className="font-mono text-xs text-[#9c8468]">No personal bests recorded yet.</Text>
      ) : (
        <View className="gap-2">
          {items.map((pb, i) => (
            <View
              key={pb.id ?? i}
              className={`flex-row items-center justify-between ${
                i === items.length - 1 ? "" : "border-b border-[#f0e8d8] pb-2"
              }`}
            >
              <Text className="text-sm font-bold uppercase text-[#1a1410]">{pb.lift}</Text>
              <Text className="font-mono text-sm text-[#1a1410]">{pb.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

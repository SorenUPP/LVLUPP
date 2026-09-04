import { memo } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text } from "../ui/Text";

export const CategoryChips = memo(function CategoryChips({
  categories,
  active,
  counts,
  onSelect,
}: {
  categories: string[];
  active: string;
  counts: Record<string, number>;
  onSelect: (c: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pb-4"
    >
      {categories.map((c) => {
        const on = c === active;
        return (
          <Pressable
            key={c}
            onPress={() => onSelect(c)}
            className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
              on ? "border-[#1a1410] bg-[#1a1410]" : "border-[#e5d9c8] bg-white/60"
            }`}
          >
            <Text
              className={`font-mono text-[11px] uppercase tracking-wide ${on ? "text-white" : "text-[#1a1410]"}`}
            >
              {c}
            </Text>
            <Text className={`font-mono text-[10px] ${on ? "text-[#c8a96e]" : "text-[#9c8468]"}`}>
              {counts[c] ?? 0}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

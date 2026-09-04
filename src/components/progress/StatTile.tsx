import { memo, type ReactNode } from "react";
import { View } from "react-native";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";

export const StatTile = memo(function StatTile({
  icon,
  label,
  value,
  dark = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <View className={`flex-1 rounded-2xl p-4 ${dark ? "bg-[#1a1410]" : glass}`}>
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="font-mono text-[9px] uppercase tracking-widest text-[#9c8468]">
          {label}
        </Text>
      </View>
      <Text className={`mt-2 text-2xl font-extrabold ${dark ? "text-white" : "text-[#1a1410]"}`}>
        {value}
      </Text>
    </View>
  );
});

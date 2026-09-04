import { View } from "react-native";
import { Text } from "../ui/Text";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-base font-extrabold text-[#1a1410]">{value}</Text>
      <Text className="mt-0.5 font-mono text-[9px] uppercase text-[#9c8468]">{label}</Text>
    </View>
  );
}

export function Divider() {
  return <View className="w-px bg-[#e5d9c8]" />;
}

export function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="font-mono text-[8px] uppercase tracking-wide text-[#b3a48f]">{label}</Text>
      <Text className="mt-0.5 text-sm font-bold text-[#1a1410]">{value}</Text>
    </View>
  );
}

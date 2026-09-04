import { Image, View } from "react-native";
import { Text } from "../ui/Text";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 18) return "Good afternoon,";
  return "Good evening,";
}

export function DashboardHeader({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  return (
    <View className="border-b border-white/70 bg-white/50 px-5 pb-5 pt-20">
      <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
        {new Date().toDateString()}
      </Text>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-3xl font-bold uppercase text-[#1a1410]">
          {greeting()}
          {"\n"}
          <Text className="text-[#c8a96e]">{name}.</Text>
        </Text>
        <Image
          source={{ uri: avatarUrl }}
          className="h-12 w-12 rounded-full border-2 border-white shadow-md"
        />
      </View>
    </View>
  );
}

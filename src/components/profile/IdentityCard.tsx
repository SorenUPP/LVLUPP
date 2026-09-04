import { Image, Pressable, View } from "react-native";
import { Camera as CameraIcon, Pencil as PencilIcon } from "lucide-react-native";
import { monthYear } from "../../lib/date";
import { glass } from "../../lib/theme";
import type { Profile } from "../../lib/profile";
import { Text } from "../ui/Text";

export function IdentityCard({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  return (
    <View className={`${glass} items-center rounded-2xl p-5`}>
      <Pressable onPress={onEdit}>
        <Image
          source={{ uri: profile.avatarUrl }}
          className="h-24 w-24 rounded-full border-2 border-white"
          style={{ backgroundColor: "#f0e8d8" }}
        />
        <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-[#fdf8f0] bg-[#1a1410]">
          <CameraIcon size={12} color="#c8a96e" />
        </View>
      </Pressable>
      <Text className="mt-3 text-xl font-bold uppercase text-[#1a1410]">{profile.name}</Text>
      <Text className="mt-1 text-center text-sm text-[#6b5d4d]">{profile.tagline}</Text>
      <Text className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
        Member since {monthYear(profile.memberSince)}
      </Text>
      <Pressable
        onPress={onEdit}
        className="mt-4 flex-row items-center gap-2 rounded-full bg-[#1a1410] px-5 py-2.5"
      >
        <PencilIcon size={13} color="#c8a96e" />
        <Text className="font-mono text-[11px] font-bold uppercase tracking-wide text-white">
          Edit profile
        </Text>
      </Pressable>
    </View>
  );
}

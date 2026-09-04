import { useState } from "react";
import { Pressable, View } from "react-native";
import {
  Award as AwardIcon,
  Flame as FlameIcon,
  LogOut as LogOutIcon,
  RotateCcw as RotateCcwIcon,
  TrendingUp as TrendingUpIcon,
} from "lucide-react-native";
import { useAuth } from "../../lib/auth";
import { displayHeight, displayWeight, useProfile } from "../../lib/profile";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";
import { AchievementsGrid } from "./AchievementsGrid";
import { Metric, Snapshot } from "./controls";
import { EditProfileSheet } from "./EditProfileSheet";
import { IdentityCard } from "./IdentityCard";
import { PreferencesCard } from "./PreferencesCard";
import { useProfileStats } from "./useProfileStats";

export function ProfileView() {
  const { profile, update, reset } = useProfile();
  const { signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const stats = useProfileStats();

  const goalPct = profile.weeklyGoal
    ? Math.min(100, (stats.thisWeek / profile.weeklyGoal) * 100)
    : 0;

  const onReset = () => {
    if (confirmReset) {
      reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <View className="pb-8">
      <View className="px-5 pb-4 pt-16">
        <Text className="text-3xl font-bold uppercase text-[#1a1410]">Profile</Text>
      </View>

      <View className="gap-4 px-5">
        <IdentityCard profile={profile} onEdit={() => setEditing(true)} />

        <View className="flex-row gap-3">
          <Snapshot
            icon={<TrendingUpIcon size={14} color="#1a1410" />}
            value={String(stats.total)}
            label="Workouts"
          />
          <Snapshot
            icon={<FlameIcon size={14} color="#1a1410" />}
            value={String(stats.streak)}
            label="Streak"
          />
          <Snapshot
            icon={<AwardIcon size={14} color="#1a1410" />}
            value={`${stats.thisWeek}/${profile.weeklyGoal}`}
            label="This week"
          />
        </View>

        <View className={`${glass} rounded-2xl p-4`}>
          <View className="flex-row items-center justify-between">
            <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
              Weekly goal
            </Text>
            <Text className="font-mono text-[10px] text-[#9c8468]">
              {stats.thisWeek} of {profile.weeklyGoal}
            </Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#f0e8d8]">
            <View
              className="h-full rounded-full"
              style={{ width: `${goalPct}%`, backgroundColor: profile.accent }}
            />
          </View>
        </View>

        <Pressable onPress={() => setEditing(true)} className={`${glass} flex-row rounded-2xl p-4`}>
          <Metric label="Weight" value={displayWeight(profile.weightKg, profile.unitSystem)} />
          <View className="w-px bg-[#e5d9c8]" />
          <Metric label="Height" value={displayHeight(profile.heightCm, profile.unitSystem)} />
        </Pressable>

        <PreferencesCard profile={profile} update={update} />
        <AchievementsGrid profile={profile} stats={stats} />

        <Pressable
          onPress={() => signOut()}
          className="mt-1 flex-row items-center justify-center gap-2 rounded-full border border-[#e5d9c8] py-3"
        >
          <LogOutIcon size={13} color="#1a1410" />
          <Text className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#1a1410]">
            Sign out
          </Text>
        </Pressable>

        <Pressable onPress={onReset} className="flex-row items-center justify-center gap-2 py-2">
          <RotateCcwIcon size={12} color="#b5544a" />
          <Text className="font-mono text-[10px] uppercase tracking-wide text-[#b5544a]">
            {confirmReset ? "Tap again to confirm" : "Reset profile"}
          </Text>
        </Pressable>
      </View>

      <EditProfileSheet
        visible={editing}
        profile={profile}
        onClose={() => setEditing(false)}
        onSave={(patch) => {
          update(patch);
          setEditing(false);
        }}
      />
    </View>
  );
}

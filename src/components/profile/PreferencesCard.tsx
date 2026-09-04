import { Pressable, View } from "react-native";
import { Check as CheckIcon } from "lucide-react-native";
import { ACCENTS, type Profile } from "../../lib/profile";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";
import { Row, Segmented, Stepper } from "./controls";

export function PreferencesCard({
  profile,
  update,
}: {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
}) {
  return (
    <View className={`${glass} gap-4 rounded-2xl p-4`}>
      <Text className="font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
        Preferences
      </Text>

      <Row label="Units">
        <Segmented
          options={[
            { value: "metric", label: "kg / cm" },
            { value: "imperial", label: "lb / ft" },
          ]}
          value={profile.unitSystem}
          onChange={(v) => update({ unitSystem: v as Profile["unitSystem"] })}
          accent={profile.accent}
        />
      </Row>

      <Row label="Workouts / week">
        <Stepper
          value={profile.weeklyGoal}
          min={1}
          max={14}
          step={1}
          format={(v) => String(v)}
          onChange={(v) => update({ weeklyGoal: v })}
        />
      </Row>

      <Row label="Rest timer">
        <Stepper
          value={profile.restTimerSec}
          min={15}
          max={240}
          step={15}
          format={(v) => `${v}s`}
          onChange={(v) => update({ restTimerSec: v })}
        />
      </Row>

      <Row label="Accent">
        <View className="flex-row gap-2">
          {ACCENTS.map((c) => (
            <Pressable
              key={c}
              onPress={() => update({ accent: c })}
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{
                backgroundColor: c,
                borderWidth: profile.accent === c ? 2 : 0,
                borderColor: "#1a1410",
              }}
            >
              {profile.accent === c && <CheckIcon size={13} color="#fff" />}
            </Pressable>
          ))}
        </View>
      </Row>
    </View>
  );
}

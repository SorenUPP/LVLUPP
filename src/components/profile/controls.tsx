import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Minus as MinusIcon, Plus as PlusIcon } from "lucide-react-native";
import { glass } from "../../lib/theme";
import { Text } from "../ui/Text";

export function Snapshot({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className={`${glass} flex-1 items-center rounded-2xl p-3`}>
      {icon}
      <Text className="mt-1 text-lg font-extrabold text-[#1a1410]">{value}</Text>
      <Text className="font-mono text-[9px] uppercase text-[#9c8468]">{label}</Text>
    </View>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-lg font-extrabold text-[#1a1410]">{value}</Text>
      <Text className="mt-0.5 font-mono text-[9px] uppercase text-[#9c8468]">{label}</Text>
    </View>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-[#1a1410]">{label}</Text>
      {children}
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#9c8468]">
        {label}
      </Text>
      {children}
    </View>
  );
}

export function PhotoButton({
  icon,
  label,
  onPress,
  busy,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-[#e5d9c8] bg-white py-2.5"
      style={{ opacity: busy ? 0.5 : 1 }}
    >
      {icon}
      <Text className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#1a1410]">
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented({
  options,
  value,
  onChange,
  accent,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-full border border-[#e5d9c8]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className="px-3 py-1.5"
            style={{ backgroundColor: active ? accent : "transparent" }}
          >
            <Text
              className="font-mono text-[10px] uppercase"
              style={{ color: active ? "#fff" : "#9c8468" }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => onChange(Math.max(min, value - step))}
        hitSlop={8}
        className="h-7 w-7 items-center justify-center rounded-full bg-[#f0e8d8]"
      >
        <MinusIcon size={14} color="#1a1410" />
      </Pressable>
      <Text className="w-12 text-center font-mono text-sm font-bold text-[#1a1410]">
        {format(value)}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        hitSlop={8}
        className="h-7 w-7 items-center justify-center rounded-full bg-[#1a1410]"
      >
        <PlusIcon size={14} color="#c8a96e" />
      </Pressable>
    </View>
  );
}

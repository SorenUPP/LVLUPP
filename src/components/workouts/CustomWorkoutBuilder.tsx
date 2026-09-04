import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import {
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Trash2 as TrashIcon,
  X as XIcon,
} from "lucide-react-native";
import type { CustomExercise } from "../../lib/customWorkouts";
import { useCreateCustomWorkout } from "../../lib/customWorkouts";
import type { Workout } from "../../lib/queries";
import { Input } from "../ui/Input";
import { Text } from "../ui/Text";

interface CatalogItem {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  source_workout_id: number;
  from: string;
}

const CONTROL =
  "rounded-lg border border-[#e5d9c8] bg-white px-2 py-1.5 text-center text-sm text-[#1a1410]";

export function CustomWorkoutBuilder({
  visible,
  workouts,
  onClose,
  onCreated,
}: {
  visible: boolean;
  workouts: Workout[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const createCustomWorkout = useCreateCustomWorkout();
  const [name, setName] = useState("");
  const [tab, setTab] = useState<"picked" | "browse">("browse");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<CustomExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalog = useMemo<CatalogItem[]>(() => {
    const seen = new Set<string>();
    const out: CatalogItem[] = [];
    for (const w of workouts) {
      for (const s of w.sets ?? []) {
        if (!s?.name || seen.has(s.name.toLowerCase())) continue;
        seen.add(s.name.toLowerCase());
        out.push({
          name: s.name,
          muscle: s.muscle ?? "",
          sets: s.sets ?? 3,
          reps: s.reps ?? "10",
          weight: s.weight ?? "Bodyweight",
          rest: s.rest ?? "60s",
          source_workout_id: w.id,
          from: w.name,
        });
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (c) => c.name.toLowerCase().includes(q) || c.muscle.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const pickedNames = useMemo(() => new Set(picked.map((p) => p.name)), [picked]);

  const reset = () => {
    setName("");
    setTab("browse");
    setSearch("");
    setPicked([]);
    setError(null);
    setSaving(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const toggle = (c: CatalogItem) => {
    setPicked((prev) =>
      prev.some((p) => p.name === c.name)
        ? prev.filter((p) => p.name !== c.name)
        : [
            ...prev,
            {
              name: c.name,
              muscle: c.muscle || null,
              sets: c.sets,
              reps: c.reps,
              weight: c.weight,
              rest: c.rest,
              source_workout_id: c.source_workout_id,
            },
          ]
    );
  };

  const patch = (i: number, p: Partial<CustomExercise>) =>
    setPicked((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...p } : e)));

  const removeAt = (i: number) => setPicked((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setPicked((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    if (saving) return;
    if (picked.length === 0) {
      setError("Add at least one exercise.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCustomWorkout(name.trim() || "Custom Day", picked);
      onCreated();
      close();
    } catch (e) {
      console.log("create custom workout:", e);
      setError("Could not save. Try again.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={close} />

        <View className="h-[92%] overflow-hidden rounded-t-3xl bg-[#fdf8f0]">
          <View className="flex-row items-center justify-between border-b border-[#e5d9c8] px-5 py-4">
            <Text className="text-lg font-bold uppercase text-[#1a1410]">New training day</Text>
            <Pressable onPress={close} hitSlop={10}>
              <XIcon size={20} color="#1a1410" />
            </Pressable>
          </View>

          <View className="gap-3 px-5 pt-4">
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Day name (e.g. Push Day)"
              placeholderTextColor="#c4b49a"
              maxLength={40}
              className="rounded-xl border border-[#e5d9c8] bg-white px-3 py-3 text-base text-[#1a1410]"
            />

            <View className="flex-row overflow-hidden rounded-full border border-[#e5d9c8]">
              {(["browse", "picked"] as const).map((t) => {
                const active = t === tab;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    className={`flex-1 items-center py-2 ${active ? "bg-[#1a1410]" : ""}`}
                  >
                    <Text
                      className={`font-mono text-[11px] font-bold uppercase tracking-wide ${
                        active ? "text-white" : "text-[#9c8468]"
                      }`}
                    >
                      {t === "browse" ? "Browse" : `Exercises (${picked.length})`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tab === "browse" && (
              <View className="flex-row items-center gap-2 rounded-xl border border-[#e5d9c8] bg-white px-3">
                <SearchIcon size={15} color="#c4b49a" />
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search exercises or muscles"
                  placeholderTextColor="#c4b49a"
                  className="flex-1 py-2.5 text-sm text-[#1a1410]"
                />
              </View>
            )}
          </View>

          <ScrollView
            className="mt-3 flex-1 px-5"
            contentContainerClassName="pb-4 gap-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {tab === "browse" &&
              filtered.map((c) => {
                const on = pickedNames.has(c.name);
                return (
                  <Pressable
                    key={c.name}
                    onPress={() => toggle(c)}
                    className={`flex-row items-center justify-between rounded-xl border px-3 py-3 ${
                      on ? "border-[#1a1410] bg-[#1a1410]/5" : "border-[#e5d9c8] bg-white"
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-sm font-bold uppercase text-[#1a1410]"
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      <Text className="mt-0.5 font-mono text-[10px] uppercase text-[#9c8468]">
                        {[c.muscle, c.from].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-full ${
                        on ? "bg-[#1a1410]" : "border border-[#e5d9c8]"
                      }`}
                    >
                      <PlusIcon size={14} color={on ? "#c8a96e" : "#c4b49a"} />
                    </View>
                  </Pressable>
                );
              })}

            {tab === "browse" && filtered.length === 0 && (
              <Text className="mt-6 text-center font-mono text-xs text-[#9c8468]">
                No exercises match “{search}”.
              </Text>
            )}

            {tab === "picked" && picked.length === 0 && (
              <Text className="mt-6 text-center font-mono text-xs text-[#9c8468]">
                No exercises yet — switch to Browse to add some.
              </Text>
            )}

            {tab === "picked" &&
              picked.map((e, i) => (
                <View key={e.name} className="rounded-xl border border-[#e5d9c8] bg-white p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text
                        className="text-sm font-bold uppercase text-[#1a1410]"
                        numberOfLines={1}
                      >
                        {e.name}
                      </Text>
                      {e.muscle ? (
                        <Text className="mt-0.5 font-mono text-[10px] uppercase text-[#9c8468]">
                          {e.muscle}
                        </Text>
                      ) : null}
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Pressable onPress={() => move(i, -1)} hitSlop={6} disabled={i === 0}>
                        <ChevronUpIcon size={18} color={i === 0 ? "#e5d9c8" : "#1a1410"} />
                      </Pressable>
                      <Pressable
                        onPress={() => move(i, 1)}
                        hitSlop={6}
                        disabled={i === picked.length - 1}
                      >
                        <ChevronDownIcon
                          size={18}
                          color={i === picked.length - 1 ? "#e5d9c8" : "#1a1410"}
                        />
                      </Pressable>
                      <Pressable onPress={() => removeAt(i)} hitSlop={6}>
                        <TrashIcon size={16} color="#b5544a" />
                      </Pressable>
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-end gap-2">
                    <View className="w-[92px]">
                      <Text className="mb-1 font-mono text-[9px] uppercase text-[#c4b49a]">
                        Sets
                      </Text>
                      <View className="flex-row items-center justify-between rounded-lg border border-[#e5d9c8] bg-white px-1.5 py-1">
                        <Pressable
                          onPress={() => patch(i, { sets: Math.max(1, e.sets - 1) })}
                          hitSlop={8}
                        >
                          <Text className="px-1 text-base font-bold text-[#1a1410]">−</Text>
                        </Pressable>
                        <Text className="font-mono text-sm text-[#1a1410]">{e.sets}</Text>
                        <Pressable
                          onPress={() => patch(i, { sets: Math.min(10, e.sets + 1) })}
                          hitSlop={8}
                        >
                          <Text className="px-1 text-base font-bold text-[#1a1410]">+</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 font-mono text-[9px] uppercase text-[#c4b49a]">
                        Reps
                      </Text>
                      <Input
                        value={e.reps}
                        onChangeText={(v) => patch(i, { reps: v })}
                        placeholder="10"
                        placeholderTextColor="#c4b49a"
                        maxLength={7}
                        className={CONTROL}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 font-mono text-[9px] uppercase text-[#c4b49a]">
                        Weight
                      </Text>
                      <Input
                        value={e.weight}
                        onChangeText={(v) => patch(i, { weight: v })}
                        placeholder="60 kg"
                        placeholderTextColor="#c4b49a"
                        maxLength={12}
                        className={CONTROL}
                      />
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>

          <View className="border-t border-[#e5d9c8] px-5 pb-8 pt-3">
            {error && <Text className="mb-2 text-center text-xs text-[#b5544a]">{error}</Text>}
            <Pressable
              onPress={save}
              disabled={saving || picked.length === 0}
              className="items-center rounded-full bg-[#1a1410] py-3.5"
              style={{ opacity: saving || picked.length === 0 ? 0.5 : 1 }}
            >
              <Text className="font-mono text-xs font-bold uppercase tracking-wide text-white">
                {saving
                  ? "Saving…"
                  : `Save training day${picked.length ? ` · ${picked.length}` : ""}`}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

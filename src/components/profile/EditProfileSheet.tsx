import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { Camera as CameraIcon, Image as ImageIcon, X as XIcon } from "lucide-react-native";
import {
  DEFAULT_AVATAR_URL,
  heightInputValue,
  heightToCm,
  weightInputValue,
  weightToKg,
  type Profile,
} from "../../lib/profile";
import { pickAvatar, type ImageSource } from "../../lib/pickImage";
import { Input } from "../ui/Input";
import { Text } from "../ui/Text";
import { Field, PhotoButton } from "./controls";

export function EditProfileSheet({
  visible,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (patch: Partial<Profile>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [picking, setPicking] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    if (!visible) return;
    setName(profile.name);
    setTagline(profile.tagline);
    setAvatarUrl(profile.avatarUrl);
    setWeight(weightInputValue(profile.weightKg, profile.unitSystem));
    setHeight(heightInputValue(profile.heightCm, profile.unitSystem));
  }, [visible, profile]);

  const choosePhoto = async (source: ImageSource) => {
    if (picking) return;
    setPicking(true);
    try {
      const uri = await pickAvatar(source);
      if (uri) setAvatarUrl(uri);
    } finally {
      setPicking(false);
    }
  };

  const save = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    onSave({
      name: name.trim() || profile.name,
      tagline: tagline.trim(),
      avatarUrl: avatarUrl || profile.avatarUrl,
      weightKg: Number.isFinite(w) ? weightToKg(w, profile.unitSystem) : null,
      heightCm: Number.isFinite(h) ? heightToCm(h, profile.unitSystem) : null,
    });
  };

  const inputClass =
    "rounded-xl border border-[#e5d9c8] bg-white px-3 py-3 text-base text-[#1a1410]";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="max-h-[90%] rounded-t-3xl bg-[#fdf8f0]">
          <View className="flex-row items-center justify-between border-b border-[#e5d9c8] px-5 py-4">
            <Text className="text-lg font-bold uppercase text-[#1a1410]">Edit profile</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <XIcon size={20} color="#1a1410" />
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerClassName="pb-4 pt-4 gap-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Profile photo">
              <View className="flex-row items-center gap-4">
                <Image
                  source={{ uri: avatarUrl || DEFAULT_AVATAR_URL }}
                  className="h-16 w-16 rounded-full"
                  style={{ backgroundColor: "#f0e8d8" }}
                />
                <View className="flex-1 gap-2">
                  <View className="flex-row gap-2">
                    <PhotoButton
                      icon={<ImageIcon size={13} color="#1a1410" />}
                      label="Library"
                      onPress={() => choosePhoto("library")}
                      busy={picking}
                    />
                    <PhotoButton
                      icon={<CameraIcon size={13} color="#1a1410" />}
                      label="Camera"
                      onPress={() => choosePhoto("camera")}
                      busy={picking}
                    />
                  </View>
                  {avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL && (
                    <Pressable onPress={() => setAvatarUrl(DEFAULT_AVATAR_URL)} hitSlop={6}>
                      <Text className="font-mono text-[10px] uppercase tracking-wide text-[#b5544a]">
                        Remove photo
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Field>

            <Field label="Name">
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#c4b49a"
                className={inputClass}
              />
            </Field>

            <Field label="Tagline">
              <Input
                value={tagline}
                onChangeText={setTagline}
                placeholder="Your current goal"
                placeholderTextColor="#c4b49a"
                maxLength={80}
                className={inputClass}
              />
            </Field>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label={`Weight (${profile.unitSystem === "metric" ? "kg" : "lb"})`}>
                  <Input
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="—"
                    placeholderTextColor="#c4b49a"
                    className={inputClass}
                  />
                </Field>
              </View>
              <View className="flex-1">
                <Field label={`Height (${profile.unitSystem === "metric" ? "cm" : "in"})`}>
                  <Input
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="—"
                    placeholderTextColor="#c4b49a"
                    className={inputClass}
                  />
                </Field>
              </View>
            </View>
          </ScrollView>

          <View className="border-t border-[#e5d9c8] px-5 pb-8 pt-3">
            <Pressable onPress={save} className="items-center rounded-full bg-[#1a1410] py-3.5">
              <Text className="font-mono text-xs font-bold uppercase tracking-wide text-white">
                Save changes
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

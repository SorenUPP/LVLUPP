import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export type ImageSource = "library" | "camera";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.4,
  base64: true,
};

/**
 * Prompt the user to pick a profile photo from their library or camera and
 * return it as a self-contained `data:` URI (so it persists with the profile
 * and there is no file to manage). Returns null if the user cancels or denies
 * permission.
 */
export async function pickAvatar(source: ImageSource): Promise<string | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      source === "camera" ? "Camera access needed" : "Photo access needed",
      `Enable ${source === "camera" ? "camera" : "photo library"} access in Settings to change your profile picture.`,
      [
        { text: "Not now", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return null;
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  if (asset.base64) {
    const type = asset.mimeType ?? "image/jpeg";
    return `data:${type};base64,${asset.base64}`;
  }
  return asset.uri;
}

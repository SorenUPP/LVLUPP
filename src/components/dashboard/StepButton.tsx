import { memo } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../ui/Text";

/** Small circular +/- control (h-6) used in the session editor rows. */
export const StepButton = memo(function StepButton({
  sign,
  tone = "sand",
  onPress,
}: {
  sign: "+" | "-";
  tone?: "sand" | "dark";
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <View
        className={
          tone === "dark"
            ? "h-6 w-6 items-center justify-center rounded-full bg-[#1a1410]"
            : "h-6 w-6 items-center justify-center rounded-full bg-[#f0e8d8]"
        }
      >
        <Text
          className={
            tone === "dark"
              ? "text-xs font-bold text-[#c8a96e]"
              : "text-xs font-bold text-[#1a1410]"
          }
        >
          {sign === "-" ? "−" : "+"}
        </Text>
      </View>
    </Pressable>
  );
});

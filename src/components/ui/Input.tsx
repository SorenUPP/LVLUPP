import { forwardRef } from "react";
import { TextInput as RNTextInput, type TextInputProps } from "react-native";

/** TextInput that renders its text in Roboto, matching the app's Text. */
export const Input = forwardRef<RNTextInput, TextInputProps>(function Input(
  { style, ...props },
  ref
) {
  return <RNTextInput ref={ref} style={[{ fontFamily: "Roboto_400Regular" }, style]} {...props} />;
});
